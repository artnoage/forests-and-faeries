"""ember_rl.ladder: the Bradley-Terry fit, and rounds on FakeBatchEnv with tiny archived policies."""
import json
import math
import time

import numpy as np
import pytest

torch = pytest.importorskip('torch')

from ember_rl import ladder
from ember_rl.fake_env import FakeBatchEnv, fake_catalog
from ember_rl.general_env import FEATURE_VERSION


def test_fit_recovers_ratings_and_encounter_offsets():
    rng = np.random.default_rng(0)
    theta = {'native-heroes': 0., 'h1': .8, 'h2': -.4}
    phi = {'native-monsters': 0., 'm1': .5, 'm2': 1.2}
    beta = {f'e{i}': b for i, b in enumerate((-.6, 0., .7, .2))}
    cells = []
    for h, t in theta.items():
        for m, f in phi.items():
            for e, b in beta.items():
                n = 400
                cells.append((h, m, e, n, int(rng.binomial(n, 1 / (1 + math.exp(-(t - f + b)))))))
    result = ladder.fit(cells)
    for h in ('h1', 'h2'):
        assert abs(result['theta'][h] - theta[h]) < 3 * result['se'][h] + .02
    for m in ('m1', 'm2'):
        assert abs(result['phi'][m] - phi[m]) < 3 * result['se'][m] + .02
    assert result['theta']['native-heroes'] == 0 and result['phi']['native-monsters'] == 0
    res = ladder.residuals(cells, result)
    assert res['cells'] == 9 and res['z_rms'] < 2.5          # a transitive truth: residuals are noise


def tiny_policy(path, team, seed):
    from ember_rl.general_model import build_general, general_config
    from ember_rl.model import save_checkpoint
    torch.manual_seed(seed)
    env = FakeBatchEnv(1)
    config = general_config(env.dims, d_model=32, heads=2, encoder_layers=1, decoder_layers=1, cnn_channels=16,
                            cnn_layers=2)
    save_checkpoint(path, build_general(config), extra={'feature_version': FEATURE_VERSION, 'team': team})


def make_run(root, name, arm, phases, age_h=0.):
    run = root / name
    (run / 'archive').mkdir(parents=True, exist_ok=True)
    (run / 'RUN.json').write_text(json.dumps(dict(mode='test', arm=arm, name=name)))
    index = json.loads((run / 'archive' / 'index.json').read_text()) if (run / 'archive' / 'index.json').exists() \
        else dict(version=1, entries=[], phases=[])
    for phase, team in phases:
        eid = f'phase-{phase}-{team}'
        tiny_policy(run / 'archive' / f'{eid}.pt', team, seed=hash((name, phase)) % 1000)
        index['entries'].append(dict(id=eid, team=team, phase=phase, path=f'archive/{eid}.pt',
                                     created=dict(time=time.time() - 3600 * (10 - phase), elapsed=3600. * (age_h + phase)),
                                     selection={}))
    (run / 'archive' / 'index.json').write_text(json.dumps(index))
    return run


ROUND = ['--ember-env', 'fake', '--device', 'cpu', '--threads', '1', '--slots', '16', '--include-smoke',
         '--opponents', '3', '--min-games', '1', '--search', 'k=2,seeds=2,horizon=rounds:1,scratch=64,skip_p=0.999',
         '--search-specs', '2', '--search-slots', '8', '--anchor-hours', '2']


@pytest.fixture()
def root(tmp_path):
    catalog = tmp_path / 'fake.jsonl'
    catalog.write_text(''.join(json.dumps(r) + '\n' for r in fake_catalog((6, 4, 3))))
    ladder.main(['specs', '--root', str(tmp_path), '--name', 'dev', '--catalog', str(catalog), '--splits', 'dev',
                 '--n', '6'])
    ladder.main(['specs', '--root', str(tmp_path), '--name', 'diag', '--catalog', str(catalog), '--splits', 'test',
                 '--n', '3'])
    return tmp_path


def test_spec_sets_are_frozen_and_stratified(root):
    with pytest.raises(SystemExit):
        ladder.main(['specs', '--root', str(root), '--name', 'dev', '--catalog', str(root / 'fake.jsonl'),
                     '--splits', 'dev'])
    manifest, specs, _ = ladder.load_specset(root, 'dev')
    assert manifest['n'] == len(specs) == 6
    assert sum(v['specs'] for v in manifest['strata'].values()) == 6
    assert all(s['stratum'].endswith('h/other') for s in specs)


def test_round_rates_entrants_writes_best_league_and_reuses_games(root):
    r1 = make_run(root, 'r1', 'base', [(1, 'heroes'), (2, 'monsters'), (3, 'heroes')])
    make_run(root, 'r2', 'league', [(1, 'monsters'), (2, 'heroes')])
    ladder.main(['round', '--root', str(root), *ROUND])
    report = json.loads((root / 'ladder' / 'latest.json').read_text())
    # entrants: the newest entry per run and team, plus the anchors at 2 h of training
    assert {'r1/phase-3-heroes', 'r1/phase-2-monsters', 'r2/phase-2-heroes', 'r2/phase-1-monsters'} <= set(report['entrants'])
    assert report['games_played'] > 0 and report['fit']['games'] > 0
    assert 'r1/phase-3-heroes' in report['ratings']['heroes']
    head = report['headline']['r1']['heroes']
    assert head['entity'] == 'r1/phase-3-heroes' and head['greedy']['se'] > 0 and head['search'] is not None
    assert (r1 / 'best-league-heroes.pt').exists()
    meta = json.loads((r1 / 'best-league-heroes.json').read_text())
    assert meta['source_entity'].startswith('r1/') and meta['rule'] == 'highest lower 95% bound'
    assert report['residuals']['cells'] >= 4 and report['payoff']['cells']
    assert set(report['daily']) >= {'diag', 'search'} and report['daily']['search']
    assert report['movement'] and report['strata_vs_native']
    panel = json.loads((root / 'ladder' / 'panel.json').read_text())
    assert len(panel['versions']) == 2 and (root / 'ladder' / 'policies').glob('*.pt')
    # every game is stored once; a second round with nothing new plays nothing
    ladder.main(['round', '--root', str(root), *ROUND, '--daily', 'no'])
    again = json.loads((root / 'ladder' / 'latest.json').read_text())
    assert again['games_played'] == 0 and again['entrants'] == []
    # a new archive entry enters the next round and plays native plus its opponents on every spec
    make_run(root, 'r1', 'base', [(4, 'monsters')])
    ladder.main(['round', '--root', str(root), *ROUND, '--daily', 'no'])
    third = json.loads((root / 'ladder' / 'latest.json').read_text())
    assert third['entrants'] == ['r1/phase-4-monsters']
    state = json.loads((root / 'ladder' / 'state.json').read_text())
    opponents = state['entered']['r1/phase-4-monsters']['opponents']
    assert opponents[0] == 'native-heroes' and len(opponents) == 4
    assert third['games_played'] == len(opponents) * 6


def test_record_writes_tapes_with_the_no_step_back_rule(root, tmp_path):
    policy = tmp_path / 'h.pt'
    tiny_policy(policy, 'heroes', 3)
    out = tmp_path / 'rec'
    ladder.main(['record', '--root', str(root), '--ember-env', 'fake', '--device', 'cpu', '--threads', '1',
                 '--heroes', str(policy), '--n', '4', '--out', str(out), '--no-step-back'])
    games = [json.loads(line) for line in (out / 'games.jsonl').read_text().splitlines()]
    assert len(games) == 4 and all((out / 'tapes' / f'{g["name"]}.jsonl').exists() for g in games)
    assert all(g['no_step_back'] for g in games)


def test_round_with_destination_moves_and_row_chunks(root):
    """--moves dest (as the l3-open policies train) with forward passes split into small row chunks."""
    make_run(root, 'r1', 'base', [(1, 'heroes'), (2, 'monsters')])
    ladder.main(['round', '--root', str(root), *ROUND, '--daily', 'no', '--moves', 'dest', '--forward-rows', '64'])
    report = json.loads((root / 'ladder' / 'latest.json').read_text())
    assert report['games_played'] > 0 and 'r1/phase-1-heroes' in report['ratings']['heroes']
    walked = [m for m in report['movement'].values() if m['moves_per_turn'] > 0]
    assert walked and all(m['squares_per_turn'] >= m['moves_per_turn'] for m in walked)


def test_stratified_order_spreads_every_prefix():
    specs = [dict(stratum=s) for s in ['a'] * 5 + ['b'] * 3 + ['c'] * 2]
    order = ladder.stratified_order(specs)
    assert sorted(order) == list(range(10))
    assert [specs[k]['stratum'] for k in order[:3]] == ['a', 'b', 'c']
    assert [specs[k]['stratum'] for k in order[:6]].count('a') == 2
