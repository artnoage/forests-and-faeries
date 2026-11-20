"""l3-open trainer features on FakeBatchEnv and synthetic catalogs.

Encounter strata (party size, map family, balance band) and stratified dev/eval specs; per-stratum and
movement logging; the archive of selected phase policies and the league (PFSP, greedy immutable
opponents, dev split, small checkpoints); exports; open-ended runs (STOP, SIGTERM, checkpoint.prev.pt,
exact resume of pending evaluations at an update boundary); the search warm-up, evaluation substeps
and search statistics."""
import json
import os
import random
import shutil
import signal
from collections import Counter

import numpy as np
import pytest

from ember_rl.general_env import (
    EpisodeSpec, SpecSource, balance_band, breakdown, load_catalogs, map_family, party_key, resolve_party_weights,
)

TRIO = ('guy', 'elion', 'curogana')
PARTIES = (TRIO, ('guy', 'elion'), ('guy', 'curogana'), ('elion', 'curogana'), ('guy',), ('elion',), ('curogana',))
L3_WEIGHTS = '3=.60,2=.32,1=.08,elion=0'


def map_of(family, k):
    if family == 'fixed':
        return ['vault', 'room_12x10'][k % 2]
    if family == 'generated':
        return dict(name=f'gen-open-v2-{k:06d}', rows=['...'], ember=dict(family='open', generator='open/v2'))
    return dict(name=f'mausoleum-room{k}', rows=['...'], ember=dict(family='hand', hand_made=True))


def synthetic_catalog(parties=PARTIES, families=('generated', 'fixed', 'mausoleum'), splits=(('train', 2), ('dev', 1)),
                      wide=1, roster=('zombie', 'ghoul')):
    """Rows like the l3 catalogs: party, roster, map, p and split; `wide` extra train rows per cell with p = .3."""
    rows = []
    for party in parties:
        for family in families:
            for split, count in splits:
                for k in range(count):
                    rows.append(dict(id=f'{family}-{"+".join(party)}-{split}-{k}', split=split, party=list(party),
                                     roster=list(roster[:1 + k % len(roster)]), map=map_of(family, k), p=.5,
                                     truncation=0., tier='S'))
            for k in range(wide):
                rows.append(dict(id=f'{family}-{"+".join(party)}-wide-{k}', split='train', party=list(party),
                                 roster=list(roster), map=map_of(family, k), p=.3, truncation=.01, tier='M'))
    return rows


def write_catalog(path, rows):
    path.write_text(''.join(json.dumps(r) + '\n' for r in rows))
    return path


# --------------------------------------------------------------------------- strata and sampling

def test_map_family_band_and_party_derivation():
    assert map_family(dict(map='vault')) == 'fixed'
    assert map_family(dict(map=map_of('generated', 3))) == 'generated'
    assert map_family(dict(map=dict(name='gen-x', rows=[]), map_family='caves')) == 'generated'
    assert map_family(dict(map=map_of('mausoleum', 1))) == 'mausoleum'
    assert map_family(dict(map='vault', family='crypt')) == 'crypt'             # the row's own field wins
    assert map_family(dict(map='vault'), tag='mausoleum') == 'mausoleum'         # then the file's tag
    assert map_family(dict(id='x')) == 'other'
    assert [balance_band(dict(p=p)) for p in (.4, .5, .6, .25, .39, .75, .2, .9)] == \
        ['balanced'] * 3 + ['wide'] * 3 + ['outside'] * 2
    assert balance_band(dict()) == 'unknown' and balance_band(dict(p=.5, band='wide')) == 'wide'
    assert balance_band(dict(p=.5), tag='wide') == 'wide'
    assert party_key(['guy', 'curogana']) == party_key('curogana+guy') == 'curogana+guy'


def test_party_weights_split_sizes_and_exclude_named_parties():
    parties = {party_key(p): len(p) for p in PARTIES}
    weights, notes = resolve_party_weights({'3': .6, '2': .32, '1': .08, 'elion': 0}, parties)
    assert weights[party_key(TRIO)] == pytest.approx(.6)
    for pair in PARTIES[1:4]:
        assert weights[party_key(pair)] == pytest.approx(.32 / 3)
    assert weights['guy'] == weights['curogana'] == pytest.approx(.04) and weights['elion'] == 0
    assert not notes
    mixed, notes = resolve_party_weights({'*': 1, '2': .3, 'guy': 0}, {**parties, 'guy_l1': 1})
    assert not notes and mixed['guy_l1'] == 1 and mixed['guy'] == 0
    assert mixed[party_key(TRIO)] == 1 and mixed[party_key(PARTIES[1])] == pytest.approx(.1)
    # A trio-only catalog: the pair and solo weights match nothing and are reported, not fatal.
    weights, notes = resolve_party_weights({'3': .6, '2': .32, '1': .08, 'elion': 0}, {party_key(TRIO): 3})
    assert weights == {party_key(TRIO): .6} and len(notes) == 2


def test_nested_sampling_has_the_reported_exact_probabilities():
    source = SpecSource(synthetic_catalog(), party_weights={'3': .6, '2': .32, '1': .08, 'elion': 0},
                        family_weights={'generated': .5, 'fixed': .25, 'mausoleum': .25},
                        band_weights={'balanced': .75, 'wide': .25})
    report = source.report()
    assert report['nested'] and report['size'] == {'size1': .08, 'size2': .32, 'size3': .6}
    assert 'elion' not in report['party'] and report['party']['guy'] == pytest.approx(.04)
    assert report['family'] == {'fixed': .25, 'generated': .5, 'mausoleum': .25}
    assert report['band'] == {'balanced': .75, 'wide': .25}
    assert sum(source.train_prob.values()) == pytest.approx(1.)
    rng = random.Random(3)
    draws = Counter()
    n = 40_000
    for _ in range(n):
        spec = source.sample_train(rng)
        assert spec.offset_x == -1 and spec.encounter in source.train_prob
        m = source.meta[spec.encounter]
        draws[('size', m['size'])] += 1
        draws[('family', m['family'])] += 1
        draws[('band', m['band'])] += 1
        draws[('party', m['party'])] += 1
    for (kind, value), p in [(('size', 3), .6), (('size', 2), .32), (('size', 1), .08), (('family', 'generated'), .5),
                             (('family', 'mausoleum'), .25), (('band', 'wide'), .25), (('party', 'elion'), 0.)]:
        assert abs(draws[(kind, value)] / n - p) < .012, (kind, value)


def test_missing_cells_renormalize_below_the_party_level():
    rows = [r for r in synthetic_catalog() if not (r['party'] == ['guy'] and 'mausoleum' in r['id'])]
    source = SpecSource(rows, party_weights={'3': .6, '2': .32, '1': .08, 'elion': 0},
                        family_weights={'generated': .5, 'fixed': .25, 'mausoleum': .25})
    report = source.report()
    assert report['party']['guy'] == pytest.approx(.04)                 # the party mix stays exact
    cells = report['cells']
    assert 'mausoleum/guy' not in cells
    assert cells['generated/guy'] == pytest.approx(.04 * .5 / .75, abs=1e-5)
    assert cells['fixed/guy'] == pytest.approx(.04 * .25 / .75, abs=1e-5)


def test_without_stratum_weights_sampling_is_the_original_rule():
    """No party/family/band weights: the same tiers and the same random draws as before the strata."""
    rows = synthetic_catalog()
    for tiers in (None, {'S': 1., 'M': 3.}):
        source = SpecSource(rows, tier_weights=tiers)
        train = [r for r in rows if r['split'] == 'train']
        by_tier = {}
        for r in train:
            by_tier.setdefault(r.get('tier', 'T0'), []).append(r['id'])
        old = ([(t, float(w), sorted(by_tier[t])) for t, w in tiers.items()] if tiers else
               [(t, float(len(ids)), sorted(ids)) for t, ids in sorted(by_tier.items())])
        a, b = random.Random(5), random.Random(5)
        for _ in range(200):
            tier = a.choices(old, weights=[w for _, w, _ in old])[0]
            expected = EpisodeSpec(a.choice(tier[2]), a.randrange(2**31), a.randrange(2**31), a.randrange(2**31), -1, -1)
            assert source.sample_train(b) == expected


def test_load_catalogs_merges_files_with_tags_and_rejects_duplicate_ids(tmp_path):
    a = write_catalog(tmp_path / 'a.jsonl', [dict(id='x', split='train', map=dict(name='r', rows=[]), p=.5)])
    b = write_catalog(tmp_path / 'b.jsonl', [dict(id='y', split='train', map='vault', p=.3, family='crypt')])
    rows, tags = load_catalogs([f'{a}#family=mausoleum', f'{b}#band=balanced,family=fixed'])
    assert [r['id'] for r in rows] == ['x', 'y'] and 'family' not in rows[0]       # rows reach the env unchanged
    source = SpecSource(rows, tags=tags)
    assert source.meta['x']['family'] == 'mausoleum' and source.meta['y']['family'] == 'crypt'
    assert source.meta['y']['band'] == 'balanced'
    with pytest.raises(ValueError, match='both'):
        load_catalogs([str(a), str(a)])
    with pytest.raises(ValueError, match='tag'):
        load_catalogs([f'{a}#colour=red'])


# --------------------------------------------------------------------------- stratified fixed specs

def test_single_cell_fixed_specs_are_the_original_round_robin():
    rows = [dict(id=f'e{k}', split='dev', party=list(TRIO), roster=['zombie'], map='vault', p=.5) for k in range(5)]
    rows.append(dict(id='t', split='train', party=list(TRIO), roster=['zombie'], map='vault', p=.5))
    from ember_rl.general_env import _seed
    specs, report = SpecSource(rows).stratified('dev', 12, 1000, bands=['balanced'], min_per_cell=8)
    ids = sorted(f'e{k}' for k in range(5))
    for k, spec in enumerate(specs):
        e = ids[k % 5]
        assert spec == EpisodeSpec(e, _seed('map', e, 1000 + k), _seed('layout', e, 1000 + k), _seed('dice', e, 1000 + k), 0, 0)
    assert report['cells'] == {f'fixed/{party_key(TRIO)}': dict(episodes=12, encounters=5, train_probability=1.)}


def test_stratified_dev_specs_follow_training_weights_with_floors_and_balanced_prefixes():
    source = SpecSource(synthetic_catalog(splits=(('train', 2), ('dev', 2))), party_weights={'3': .6, '2': .32, '1': .08, 'elion': 0},
                        family_weights={'generated': .5, 'fixed': .25, 'mausoleum': .25},
                        band_weights={'balanced': .75, 'wide': .25})
    specs, report = source.stratified('dev', 512, 61_000_000, bands=['balanced', 'unknown'], min_per_cell=8)
    assert len(specs) == 512 and not report['uncovered']
    assert report['untrained'] == [f'{f}/elion' for f in ('fixed', 'generated', 'mausoleum')]   # Elion solo is not trained
    cells = report['cells']
    trained = [c for c, v in cells.items() if v['train_probability'] > 0]
    assert len(trained) == 18 and all(cells[c]['episodes'] >= 8 for c in trained)
    assert sum(cells[c]['episodes'] for c in trained) == 512
    # The trio cells get the most (by training probability) and every prefix stays stratified.
    trio = sum(cells[c]['episodes'] for c in trained if c.endswith(party_key(TRIO)))
    assert trio > 512 * .45
    first = Counter(source.meta[s.encounter]['size'] for s in specs[:128])
    assert abs(first[3] / 128 - trio / 512) < .03
    assert all(source.meta[s.encounter]['band'] == 'balanced' for s in specs)
    assert len(set(specs)) == len(specs)
    # The same arguments give the same list (paired across runs and arms).
    assert source.stratified('dev', 512, 61_000_000, bands=['balanced', 'unknown'], min_per_cell=8)[0] == specs


def test_breakdown_reports_cells_and_party_sizes_with_excess():
    source = SpecSource(synthetic_catalog())
    trio = f'generated-{"+".join(TRIO)}-dev-0'
    solo = 'fixed-guy-dev-0'
    items = [dict(spec=EpisodeSpec(e, 1, 2, 3, 0, 0), learner_team='heroes') for e in (trio, trio, solo)]
    out = breakdown(items, [('win', 1.), ('loss', -1.), ('win', 1.)], source)
    assert out['per_stratum'][f'generated/{party_key(TRIO)}']['n'] == 2
    assert out['per_stratum'][f'generated/{party_key(TRIO)}']['excess'] == pytest.approx(0.)
    assert out['per_size']['size1']['excess'] == pytest.approx(.5) and out['per_size']['size3']['win'] == 1
    assert out['excess'] == pytest.approx((.5 - .5 + .5) / 3, abs=1e-4)


# --------------------------------------------------------------------------- trainer on FakeBatchEnv

torch = pytest.importorskip('torch')
from ember_rl import duel  # noqa: E402

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
TINY = ['--backend', 'ember', '--ember-env', 'fake', '--slots', '8', '--device', DEVICE, '--d-model', '32',
        '--heads', '2', '--encoder-layers', '1', '--decoder-layers', '1', '--cnn-channels', '16', '--cnn-layers', '2',
        '--objective', 'health_score', '--standing-weight', '.5', '--time-unit', 'round', '--gamma', '1',
        '--max-rounds', '3', '--log-seconds', '0', '--hours', '0.2']
PPO = ['--rollout', '64', '--minibatch', '32', '--micro-batch', '16', '--epochs', '1', '--eval-episodes', '6']
GATED = ['--schedule', 'gated', '--dev-every', '64', '--dev-episodes', '6', '--min-phase-decisions', '0',
         '--eval-slot-fraction', '.5', '--eval-every', '1000']
# Trainer runs use a small catalog: 3 parties x 2 map families = 6 cells, so 6 dev and eval games cover
# every cell (the full synthetic catalog has 18 trained cells; its coverage is tested separately).
SMALL = dict(parties=(TRIO, ('guy', 'elion'), ('guy',)), families=('generated', 'mausoleum'))


def rows(path, name='metrics.jsonl'):
    return [json.loads(line) for line in (path / name).read_text().splitlines()]


@pytest.fixture
def catalog(tmp_path):
    return write_catalog(tmp_path / 'catalog.jsonl', synthetic_catalog(**SMALL))


def strata_args(catalog):
    return ['--catalog', str(catalog), '--party-weights', L3_WEIGHTS,
            '--family-weights', 'generated=.6,mausoleum=.4', '--band-weights', 'balanced=.75,wide=.25',
            '--min-cell-episodes', '1']


def test_trainer_writes_specs_and_coverage_and_logs_strata_and_movement(tmp_path, catalog):
    out = tmp_path / 'strata'
    duel.main(['--output', str(out), '--max-updates', '6', '--move-penalty', '.001', '--dev-episodes', '36',
               '--eval-native-episodes', '36', '--eval-slot-fraction', '1', *strata_args(catalog), *PPO, *TINY])
    coverage = json.loads((out / 'specs-coverage.json').read_text())
    assert coverage['sampling']['size'] == {'size1': .08, 'size2': .32, 'size3': .6}
    assert not coverage['dev']['uncovered'] and coverage['dev']['n'] == 36
    assert len((out / 'dev-specs.jsonl').read_text().splitlines()) == 36
    log = rows(out)
    assert log[0]['type'] == 'sampling'
    progress = [r for r in log if r['type'] == 'progress']
    cells = Counter()
    transitions = Counter()
    for r in progress:
        for cell, s in r['strata'].items():
            cells[cell] += s['episodes']
            transitions[cell] += sum(s['transitions'].values())
    assert sum(transitions.values()) > 0 and len(cells) > 3
    assert not any(c.endswith('/elion') for c in cells)
    movement = [m for r in progress for teams in r['movement'].values() for m in teams.values()]
    assert movement and all(m['mean_move_penalty'] == pytest.approx(.001 * m['mean_moves'], abs=1e-5) for m in movement)
    evals = rows(out, 'eval.jsonl')
    assert evals and 'per_stratum' in evals[0]['results']['heroes-vs-native']


def test_uncovered_training_cells_stop_the_run_unless_allowed(tmp_path):
    rows_ = [r for r in synthetic_catalog(**SMALL) if not (r['split'] == 'dev' and len(r['party']) == 2)]
    catalog = write_catalog(tmp_path / 'c.jsonl', rows_)
    with pytest.raises(SystemExit, match='no development/evaluation games'):
        duel.main(['--output', str(tmp_path / 'x'), '--max-updates', '1', *strata_args(catalog), *PPO, *TINY])
    duel.main(['--output', str(tmp_path / 'y'), '--max-updates', '1', '--allow-uncovered', *strata_args(catalog),
               *PPO, *TINY])
    assert json.loads((tmp_path / 'y' / 'specs-coverage.json').read_text())['dev']['uncovered']


def winning_candidates(base=None):
    """A trainer whose learner candidates win every development game (dev games of a baseline play
    normally), so every phase selects and archives a new policy even in 3-round fake games."""
    if base is None:
        from ember_rl.general_duel import GeneralTrainer as base

    class Winning(base):
        def finish_dev(self, item, info):
            if self.gate['pending'] and self.gate['pending']['learner']:
                info = dict(info, terminated=True, truncated=False, task_end='native', winner=item['learner_team'])
            return super().finish_dev(item, info)
    return Winning


def test_gated_archive_league_exports_and_small_checkpoints(tmp_path, catalog):
    out = tmp_path / 'league'
    argv = ['--output', str(out), '--max-updates', '12', '--gate-threshold', '-1', '--league',
            '--league-size', '3', '--league-dev-fraction', '.5', '--eval-native-episodes', '6',
            *strata_args(catalog), *PPO, *TINY, *GATED[:-2], '--eval-every', '4']
    make_trainer(winning_candidates(), argv, synthetic_catalog(**SMALL)).run()
    index = json.loads((out / 'archive' / 'index.json').read_text())
    entries = {e['id']: e for e in index['entries']}
    assert entries and index['phases']
    for e in entries.values():
        assert (out / e['path']).exists() and e['path'] == f'archive/phase-{e["phase"]}-{e["team"]}.pt'
        payload = torch.load(out / e['path'], map_location='cpu', weights_only=False)
        assert payload['extra']['export'] == 'phase-selected' and payload['extra']['team'] == e['team']
    assert {p['selected'] for p in index['phases']} <= set(entries) | {'initial-heroes', 'initial-monsters'}
    log = rows(out)
    leagues = [r for r in log if r['type'] == 'league']
    assert leagues and [r['version'] for r in leagues] == list(range(1, len(leagues) + 1))
    assert all(len(r['members']) <= 2 for r in leagues)               # --league-size 3 = latest + 2
    # Training opponents are logged by id (and panel version); archived ones get PFSP statistics.
    opponents = {k for r in log if r['type'] == 'progress' for k in r.get('opponents', {})}
    assert any(k.startswith('initial-') for k in opponents)
    played = [e for e in entries.values() if e['stats']['games']]
    if any(r['members'] for r in leagues[:-1]):
        assert played and any('@v' in k for k in opponents)
    # Development games against archived policies once the archive has members.
    devs = [r for r in log if r['type'] == 'dev']
    later = [d for d in devs if d.get('per_opponent')]
    if any(r['dev'] for r in leagues[:-1]):
        assert later and all(sum(v['n'] for v in d['per_opponent'].values()) == d['n'] for d in later)
    # checkpoint.pt holds the archive's paths and statistics, not its weights; no pool snapshots.
    payload = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert set(payload['archive']['entries']) == set(entries)
    assert not any(isinstance(v, torch.Tensor) for e in payload['archive']['entries'].values() for v in e.values())
    assert payload['pool'] == {'heroes': [], 'monsters': []}
    assert payload['gated']['league']['members'] == list(leagues[-1]['members'])
    # Exports: latest, native-best (labelled), archive; never best-league-<team>.pt.
    assert torch.load(out / 'latest-heroes.pt', weights_only=False)['extra']['export'] == 'latest'
    best = [t for t in ('heroes', 'monsters') if (out / f'best-{t}.pt').exists()]
    assert best and all(torch.load(out / f'best-{t}.pt', weights_only=False)['extra']['export'] == 'native-best'
                        for t in best)
    assert not list(out.glob('best-league-*'))


def test_league_opponents_are_greedy_and_immutable_within_an_episode(tmp_path, catalog):
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_duel import GeneralTrainer
    argv = ['--output', str(tmp_path / 'probe'), '--max-updates', '8', '--gate-threshold', '-1', '--league',
            '--league-size', '4', '--league-latest', '.25', *strata_args(catalog), *PPO, *TINY, *GATED]
    args = duel.prepare_args(duel.parser().parse_args(argv))
    seen = []

    class Probe(GeneralTrainer):
        def decide_batch(self, live, obs):
            for g in live:
                key = self.slot_state[g]['controllers'][self.infos[g]['team']]
                if key[0] == 'frozen' and len(key) > 2:
                    seen.append((g, self.slot_state[g]['episode'], key[1], id(key[2])))
            return super().decide_batch(live, obs)

    env = FakeBatchEnv(args.slots, scores=False, objective=args.objective, max_rounds=args.max_rounds,
                       standing_weight=args.standing_weight, max_steps=args.max_steps, catalog=synthetic_catalog(**SMALL))
    original = torch.nn.Module.__call__
    trainer = winning_candidates(Probe)(args, env)
    greedy_flags = []
    for model in [trainer.selected[t] for t in ('heroes', 'monsters')]:
        act = model.act

        def wrapped(batch, greedy=False, act=act):
            greedy_flags.append(greedy)
            return act(batch, greedy=greedy)
        model.act = wrapped
    trainer.run()
    assert original is torch.nn.Module.__call__
    assert seen
    per_episode = {}
    for g, episode, name, model_id in seen:
        per_episode.setdefault((g, episode), set()).add((name, model_id))
    assert all(len(v) == 1 for v in per_episode.values())             # one immutable opponent per episode
    assert greedy_flags and all(greedy_flags)


def test_league_pfsp_prefers_hard_opponents_and_panel_is_bounded(tmp_path):
    from ember_rl.league import Archive, League
    archive = Archive(tmp_path, 'test')
    save = lambda path, model, extra: path.parent.mkdir(parents=True, exist_ok=True) or path.write_text('x')
    for phase in range(6):
        archive.add('monsters', 2 * phase + 1, model=None, selection={}, created={}, save=save)
    easy, hard = 'phase-1-monsters', 'phase-3-monsters'
    for _ in range(200):
        archive.observe(easy, 'win')
        archive.observe(hard, 'loss')
    assert archive.win_rate(easy) > .95 and archive.win_rate(hard) < .05
    league = League(archive, size=4, latest=.5, power=2., dev_opponents=2, load=lambda e: f'model:{e["id"]}')
    rng = random.Random(1)
    panel = league.build('monsters', 'phase-11-monsters', 'latest-model', rng)
    assert len(panel['members']) == 3 and 'phase-11-monsters' not in panel['members']
    assert panel['dev'][0] == hard if hard in panel['members'] else True
    counts = Counter()
    for _ in range(4000):
        eid, model, version = league.choose(rng)
        counts[eid] += 1
        assert version == panel['version'] and (model == 'latest-model') == (eid == 'phase-11-monsters')
    assert abs(counts['phase-11-monsters'] / 4000 - .5) < .03
    if easy in panel['members'] and hard in panel['members']:
        assert counts[hard] > 10 * max(1, counts[easy])
    # A restored panel is the same panel, with no random draws.
    state = league.state()
    other = League(archive, size=4, latest=.5, power=2., dev_opponents=2, load=lambda e: f'model:{e["id"]}')
    assert other.restore(state, 'latest-model') == state
    # Files the checkpoint does not know go to archive/dropped/ on resume.
    saved = archive.state()
    archive.add('heroes', 12, model=None, selection={}, created={}, save=save)
    moved = archive.load_state(saved)
    assert moved == [m for m in moved if m.startswith('archive/dropped/phase-12-heroes.')] and len(moved) == 1
    assert 'phase-12-heroes' not in json.loads((tmp_path / 'archive' / 'index.json').read_text())['entries'][-1]['id']


# --------------------------------------------------------------------------- open-ended runs

def stopping_trainer(after_updates, how='file'):
    from ember_rl.general_duel import GeneralTrainer

    class Stopper(GeneralTrainer):
        def update(self, team):
            super().update(team)
            if sum(self.updates.values()) == after_updates:
                self.snapshot_at_stop = dict(updates=dict(self.updates))
                if how == 'file':
                    (self.out / 'STOP').write_text('stop\n')
                    self._stop_checked = -1e9              # read it at the next loop check
                else:
                    os.kill(os.getpid(), signal.SIGTERM)
    return Stopper


def make_trainer(cls, argv, catalog_rows=None):
    from ember_rl.fake_env import FakeBatchEnv
    args = duel.prepare_args(duel.parser().parse_args(argv))
    env = FakeBatchEnv(args.slots + args.eval_slots, scores=False, objective=args.objective, max_rounds=args.max_rounds,
                       standing_weight=args.standing_weight, max_steps=args.max_steps, catalog=catalog_rows)
    return cls(args, env)


def test_stop_file_saves_and_ends_cleanly_and_keeps_the_previous_checkpoint(tmp_path, catalog):
    out = tmp_path / 'open'
    argv = ['--output', str(out), '--until-stopped', '--checkpoint-minutes', '0', *strata_args(catalog), *PPO, *TINY]
    trainer = make_trainer(stopping_trainer(3), argv, synthetic_catalog(**SMALL))
    trainer.run()                                                       # returns: exit status 0
    meta = json.loads((out / 'checkpoint.json').read_text())
    assert meta['reason'] == 'stop_file' and meta['clean'] and sum(meta['updates'].values()) >= 3
    assert (out / 'checkpoint.prev.pt').exists() and (out / 'STOP').exists()   # STOP stays for the watcher
    prev = torch.load(out / 'checkpoint.prev.pt', map_location='cpu', weights_only=False)
    assert prev['saved']['reason'] == 'periodic'
    end = [r for r in rows(out) if r['type'] == 'end']
    assert end and end[-1]['reason'] == 'stop_file'
    with pytest.raises(SystemExit):
        duel.main(['--output', str(out), '--until-stopped', '--deadline', '1', *PPO, *TINY])


def test_sigterm_saves_and_exits_143(tmp_path, catalog):
    out = tmp_path / 'term'
    argv = ['--output', str(out), '--until-stopped', *strata_args(catalog), *PPO, *TINY]
    trainer = make_trainer(stopping_trainer(2, how='signal'), argv, synthetic_catalog(**SMALL))
    with pytest.raises(SystemExit) as stopped:
        trainer.run()
    assert stopped.value.code == 143
    assert json.loads((out / 'checkpoint.json').read_text())['reason'] == 'sigterm'
    assert signal.getsignal(signal.SIGTERM) in (signal.SIG_DFL, signal.default_int_handler) or \
        callable(signal.getsignal(signal.SIGTERM))


def state_of(trainer):
    return dict(learner={t: {k: v.detach().cpu().clone() for k, v in m.state_dict().items()}
                         for t, m in trainer.policies.learner.items()},
                rng=trainer.rng.getstate(), np_rng=trainer.np_rng.bit_generator.state,
                torch_rng=torch.get_rng_state().clone(), decisions=dict(trainer.decisions), updates=dict(trainer.updates),
                selected_id=dict(trainer.selected_id), phase=trainer.phase, active=trainer.active_team,
                archive=json.dumps(trainer.archive.state(), sort_keys=True, default=str) if trainer.archive else None,
                panel=trainer.league.state() if trainer.league else None)


def assert_same_state(a, b):
    for team in a['learner']:
        assert all(torch.equal(a['learner'][team][k], b['learner'][team][k]) for k in a['learner'][team])
    assert a['rng'] == b['rng'] and a['np_rng'] == b['np_rng'] and torch.equal(a['torch_rng'], b['torch_rng'])
    for key in ('decisions', 'updates', 'selected_id', 'phase', 'active', 'archive', 'panel'):
        assert a[key] == b[key], key


def test_interrupted_and_resumed_at_an_update_boundary(tmp_path, catalog):
    """STOP right after an update in the middle of a gated league run with an evaluation round and a
    development evaluation in flight. The resumed trainer has the saved state exactly (weights, optimizer,
    RNGs, gate, archive, league panel), replays the unfinished evaluation and development games, and two
    resumes from the same checkpoint continue identically."""
    out = tmp_path / 'run'
    common = ['--gate-threshold', '-1', '--league', '--league-size', '3', '--league-dev-fraction', '.5',
              '--eval-every', '2', '--eval-native-episodes', '6', '--eval-slot-fraction', '.3',
              *strata_args(catalog), *PPO, *TINY, *GATED[:-4], '--eval-slot-fraction', '.3']
    first = make_trainer(winning_candidates(stopping_trainer(5)), ['--output', str(out), '--until-stopped', *common],
                         synthetic_catalog(**SMALL))
    first.run()
    payload = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert payload['saved']['reason'] == 'stop_file'
    dropped = payload['dropped']
    assert set(dropped) == {'training_games', 'pending_decisions', 'buffered_transitions', 'stream_transitions'}
    saved_state = state_of(first)
    pending_eval = {rid: len(r['unfinished']) for rid, r in payload['evaluations'].items()}
    pending_dev = payload['gated']['pending']
    (out / 'STOP').unlink()
    copies = []
    for name in ('a', 'b'):
        target = tmp_path / name
        shutil.copytree(out, target)
        argv = ['--output', str(target), '--resume', str(target / 'checkpoint.pt'), '--max-updates', '9', *common]
        trainer = make_trainer(winning_candidates(), argv, synthetic_catalog(**SMALL))
        assert_same_state(saved_state, state_of(trainer))
        opt = payload['optimizer']['heroes']['state']
        restored = trainer.policies.optimizer['heroes'].state_dict()['state']
        assert all(torch.equal(opt[k]['exp_avg'].cpu(), restored[k]['exp_avg'].cpu()) for k in opt)
        queued_dev = [it for it in trainer.eval_queue if it.get('dev')]
        assert len(queued_dev) == (len(pending_dev['unfinished']) if pending_dev else 0)
        for rid, n in pending_eval.items():
            assert trainer.eval_rounds[rid]['pending'] == n
        resume = [r for r in rows(target) if r['type'] == 'resume'][-1]
        assert resume['dropped'] == dropped and resume['not_restored']
        trainer.run()
        copies.append(target)
    # The interrupted evaluation round completes with every game.
    for target in copies:
        evals = rows(target, 'eval.jsonl')
        for rid in pending_eval:
            row = [r for r in evals if r['round'] == rid]
            assert row and row[0]['results']['heroes-vs-native']['n'] == 6
        devs = [r for r in rows(target) if r['type'] == 'dev']
        assert all(d['n'] == 6 for d in devs)
    # Two resumes from one checkpoint continue identically (all the state that matters is restored).
    def updates(target):
        return [(r['team'], r['update'], r['samples'], r['loss']) for r in rows(target) if r['type'] == 'update']
    if DEVICE == 'cpu':
        assert updates(copies[0]) == updates(copies[1])


def duel_trainer():
    from ember_rl.general_duel import GeneralTrainer
    return GeneralTrainer


# --------------------------------------------------------------------------- search warm-up and statistics

SEARCH = ['--search', 'k=2,seeds=2,horizon=turns:1,tau=0.1,scratch=64', '--search-prob', '1']


def test_search_waits_for_its_ppo_warmup_then_logs_its_statistics(tmp_path):
    out = tmp_path / 'warm'
    duel.main(['--output', str(out), '--max-updates', '14', '--search-start-decisions', '128', '--eval-every', '3',
               '--eval-slot-fraction', '.5', '--eval-substeps', '4', *SEARCH, *PPO, *TINY])
    log = rows(out)
    on = [r for r in log if r['type'] == 'search_on']
    assert {r['team'] for r in on} == {'heroes', 'monsters'}
    assert all(r['decisions'][r['team']] >= 128 for r in on)
    updates = [r for r in log if r['type'] == 'update']
    for team in ('heroes', 'monsters'):
        mine = [r for r in updates if r['team'] == team]
        before = [r for r in mine if not r['search_active']]
        assert before and all(r['searched_samples'] == 0 and 'search_ce' not in r for r in before)
        assert any(r['searched_samples'] > 0 for r in mine if r['search_active'])
    stats = [r['search'] for r in log if r['type'] == 'progress' and r['search'].get('searched')]
    assert stats
    s = stats[-1]
    assert 0 < s['searched_fraction'] <= 1 and 0 <= s['changed_fraction'] <= 1
    assert s['value_mae'] >= 0 and s['value_rmse'] >= s['value_mae'] - 1e-9
    assert 0 < s['model_fraction'] <= 1 and 0 < s['env_fraction'] <= 1
    assert sum(r['search'].get('eval_substeps', 0) for r in log if r['type'] == 'progress') > 0
    assert rows(out, 'eval.jsonl')


def test_search_ev_threshold_keeps_search_off(tmp_path):
    out = tmp_path / 'ev'
    duel.main(['--output', str(out), '--max-updates', '4', '--search-start-ev', '2', '--eval-slot-fraction', '.5',
               *SEARCH, *PPO, *TINY])
    log = rows(out)
    assert not [r for r in log if r['type'] == 'search_on']
    assert all(r['searched_samples'] == 0 for r in log if r['type'] == 'update')


# --------------------------------------------------------------------------- Fable: gate, learner balance, search opponent

def test_baseline_round_pauses_training_and_dev_rows_carry_paired_differences(tmp_path, catalog):
    from ember_rl.general_duel import GeneralTrainer
    out = tmp_path / 'gate'
    argv = ['--output', str(out), '--max-updates', '8', '--gate-threshold', '-1', '--schedule', 'gated',
            '--dev-every', '128', '--dev-episodes', '6', '--min-phase-decisions', '0', '--eval-slot-fraction', '.5',
            '--eval-every', '1000', *strata_args(catalog), *PPO, *TINY]
    during = []

    class Probe(GeneralTrainer):
        def update(self, team):
            during.append(self.gate['pending'] is not None and team == self.active_team)
            return super().update(team)

    make_trainer(Probe, argv, synthetic_catalog(**SMALL)).run()
    assert during and not any(during)                  # no update of the active team while any dev round runs
    devs = [r for r in rows(out) if r['type'] == 'dev']
    candidates = [d for d in devs if d['label'] != 'baseline']
    assert candidates
    for d in candidates:
        baseline = [b for b in devs if b['label'] == 'baseline' and b['phase'] == d['phase']][0]
        assert d['paired_diff']['n'] == d['n'] and d['paired_diff']['wins'] == d['win'] - baseline['win']
        assert 'paired_diff' not in baseline
    # The first candidate of each phase comes at --dev-every (collection stops during the baseline round
    # once a rollout is buffered), not after a long unpaused baseline round.
    first = {}
    for d in candidates:
        first.setdefault(d['phase'], d['phase_decisions'])
    assert all(128 <= n < 128 + 16 for n in first.values())


def test_phase_budget_per_team(tmp_path, catalog):
    out = tmp_path / 'budget'
    duel.main(['--output', str(out), '--max-updates', '6', '--gate-threshold', '1', '--phase-budget', '0',
               '--phase-budget-heroes', '64', *strata_args(catalog), *PPO, *TINY, *GATED])
    phases = [r for r in rows(out) if r['type'] == 'phase']
    assert phases and phases[0]['finished'] == 'heroes' and phases[0]['reason'] == 'training_budget'
    assert all(p['finished'] == 'heroes' for p in phases)       # the monsters' phase has no budget and never ends


def test_learner_balance_estimates_weights_fit_and_state():
    from ember_rl.balance import LearnerBalance
    rows_ = synthetic_catalog(parties=(TRIO,), families=('fixed',), splits=(('train', 6),), wide=0,
                              roster=('zombie', 'ghoul', 'wight'))
    source = SpecSource(rows_)
    balance = LearnerBalance(source, floor=.25, window=32, prior=4., refresh=8, min_fit=16)
    lopsided, even = source.train_encounters()[:2]
    for k in range(64):
        balance.observe('heroes', lopsided, 1.)
        balance.observe('heroes', even, float(k % 2))
    assert balance.p('heroes', lopsided) > .85 and abs(balance.p('heroes', even) - .5) < .05
    assert balance.weight_of(.5) == 1. and balance.weight_of(1.) == .25
    key, weights = balance.weights('heroes')
    assert weights[even] > 3 * weights[lopsided]
    assert balance.p('monsters', even) == .5                       # one table per learner team
    rng = random.Random(0)
    draws = Counter(source.sample_train(rng, (key, weights)).encounter for _ in range(4000))
    assert draws[even] > 2.5 * draws[lopsided]
    # The logistic fit: rows never played get the fit's estimate instead of 0.5.
    assert balance.coef['heroes'] is not None
    other = LearnerBalance(source, floor=.25, window=32, prior=4., refresh=8, min_fit=16)
    other.load_state(balance.state())
    assert all(other.p('heroes', e) == pytest.approx(balance.p('heroes', e)) for e in source.train_encounters())


def test_learner_balance_run_logs_health_and_survives_resume(tmp_path, catalog):
    out = tmp_path / 'balance'
    argv = ['--output', str(out), '--max-updates', '4', '--learner-balance', '--balance-refresh', '4',
            *strata_args(catalog), *PPO, *TINY, *GATED]
    duel.main(argv)
    progress = [r for r in rows(out) if r['type'] == 'progress' and r['balance']['decisions']]
    assert progress and all(r['balance']['sampling'] == 'learner' for r in progress)
    b = progress[-1]['balance']
    assert 0 <= b['horizon_share'] <= 1 and 0 <= b['outside_20_80_share'] <= 1 and .25 <= b['mean_weight'] <= 1
    payload = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert payload['balance']['seen'].get('heroes', 0) > 0
    i = argv.index('--max-updates')
    duel.main([*argv[:i], '--max-updates', '6', *argv[i + 2:], '--resume', str(out / 'checkpoint.pt')])
    again = torch.load(out / 'checkpoint.pt', map_location='cpu', weights_only=False)
    assert sum(again['balance']['seen'].values()) >= sum(payload['balance']['seen'].values())


def test_search_opponent_native_hands_the_other_team_to_the_native_ai_in_forks(tmp_path, monkeypatch):
    from ember_rl.search import Lookahead
    seen = []
    original = Lookahead.search

    def search(self, env, roots, explore=False):
        seen.extend((r.team, r.controllers, r.models) for r in roots)
        return original(self, env, roots, explore=explore)
    monkeypatch.setattr(Lookahead, 'search', search)
    out = tmp_path / 'native-forks'
    duel.main(['--output', str(out), '--max-updates', '2', '--search-opponent', 'native', '--eval-slot-fraction', '.5',
               *SEARCH, *PPO, *TINY, *GATED])
    assert seen
    for team, controllers, models in seen:
        other = 'monsters' if team == 'heroes' else 'heroes'
        assert controllers == {team: 'external', other: 'native'} and models[other] is None
    assert [r for r in rows(out) if r['type'] == 'update']


def test_model_accepts_extra_map_channels():
    from ember_rl.general_model import build_general, general_config, map_transform, MAP_TRANSFORM
    from ember_rl.general_env import DEFAULT_DIMS
    assert map_transform(17) == MAP_TRANSFORM and map_transform(16) == MAP_TRANSFORM[:16]
    assert map_transform(18)[-1] == ('scale', 4.)
    dims = dict(DEFAULT_DIMS, map_channels=18)
    model = build_general(general_config(dims, d_model=32, heads=2, encoder_layers=1, decoder_layers=1,
                                         cnn_channels=8, cnn_layers=2))
    assert model.cnn.stem.in_channels == build_general(general_config(DEFAULT_DIMS, d_model=32, heads=2,
                                                                      encoder_layers=1, decoder_layers=1,
                                                                      cnn_channels=8, cnn_layers=2)).cnn.stem.in_channels + 1


def test_v2_relations_reach_the_model_and_v1_still_runs(tmp_path):
    """ember-gen-v2: creature_rel is a model input (relation messages), padding-invariant; a run with
    --feature-version ember-gen-v1 still trains a v1-shaped model."""
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_model import build_general, collate, general_config, split_obs, to_batch
    env = FakeBatchEnv(3)
    env.reset(range(3), [EpisodeSpec(f'fake-train-{i}', i, i + 1, i + 2, -1, -1) for i in range(3)],
              [dict(heroes='external', monsters='external')] * 3)
    obs = env.observe(range(3))
    model = build_general(general_config(env.dims, d_model=32, heads=2, encoder_layers=1, decoder_layers=1,
                                        cnn_channels=8, cnn_layers=2))
    assert model.full_config()['relations'] == 5 and model.cnn.stem.in_channels > 0
    with torch.no_grad():
        _, padded = model(to_batch(obs))
        _, trimmed = model(collate([split_obs(obs, i) for i in range(3)]))
        cleared = dict(obs, creature_rel=np.zeros_like(obs['creature_rel']))
        _, without = model(to_batch(cleared))
    assert torch.allclose(padded, trimmed, atol=1e-5) and not torch.allclose(padded, without)
    out = tmp_path / 'v1'
    duel.main(['--output', str(out), '--max-updates', '2', '--feature-version', 'ember-gen-v1',
               '--eval-slot-fraction', '.5', *PPO, *TINY])
    payload = torch.load(out / 'latest-heroes.pt', map_location='cpu', weights_only=False)
    assert payload['extra']['feature_version'] == 'ember-gen-v1' and 'relations' not in payload['model_config']
    assert payload['model_config']['map_channels'] == 16


# --------------------------------------------------------------------------- destination moves (--moves dest)

def test_fake_destination_moves_rows_walks_and_forks():
    """FakeBatchEnv(moves='dest'), as ember-rs 9abcae2: the one-step rows unchanged and first, farther squares
    after them with -inf native scores, End Turn last; info['moved'] counts the squares walked (a walk
    can stop early); a fork takes the target env's move mode."""
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_env import END_TURN_KIND, MOVE_KIND, validate_info, validate_obs
    specs = [EpisodeSpec(f'fake-train-{i}', i, i + 1, i + 2, -1, -1) for i in range(4)]
    ext = [dict(heroes='external', monsters='external')] * 4
    step, dest = FakeBatchEnv(4), FakeBatchEnv(4, moves='dest')
    for env in (step, dest):
        env.reset(range(4), specs, ext)
    a, b = step.observe(range(4)), dest.observe(range(4))
    validate_obs(b, dest.dims)
    for i in range(4):
        ks, kd = int(a['cand_mask'][i].sum()), int(b['cand_mask'][i].sum())
        assert kd > ks
        one = a['cand_ids'][i, :ks, 0] == MOVE_KIND
        cells = a['cand_cell'][i, :ks][one]
        assert list(b['cand_cell'][i, :one.sum()]) == list(cells)            # one-step rows first, same squares
        kinds = b['cand_ids'][i, :kd, 0]
        assert kinds[kd - 1] == END_TURN_KIND and np.all(kinds[:np.argmin(kinds == MOVE_KIND)] == MOVE_KIND)
        far = (kinds == MOVE_KIND) & (np.round(b['cands'][i, :kd, 121] * 12) > 1)
        assert far.any() and np.all(np.isneginf(b['native_raw'][i, :kd][far]))
    rng = np.random.default_rng(0)
    walked = cut = 0
    for _ in range(300):
        live = [g for g in range(4) if not dest.info([g])['done'][0]]
        if not live:
            break
        obs = dest.observe(live)
        chosen = [int(rng.integers(0, k)) for k in obs['cand_mask'].sum(1)]
        info = dest.step(live, chosen)
        validate_info(info, len(live))
        steps = np.round(obs['cands'][np.arange(len(live)), chosen, 121] * 12)
        moving = obs['cand_ids'][np.arange(len(live)), chosen, 0] == MOVE_KIND
        assert np.all(info['moved'][~moving] == 0) and np.all(info['moved'] <= steps)
        walked += info['moved'].sum()
        cut += (moving & (info['moved'] < steps)).sum()
    assert walked > 0
    fresh = FakeBatchEnv(4, moves='dest')
    fresh.reset(range(4), specs, ext)
    target = FakeBatchEnv(4)
    target.fork([0, 1], [0, 1], source=fresh)
    assert np.array_equal(target.observe([0, 1])['cand_mask'].sum(1), a['cand_mask'][:2].sum(1))
    with pytest.raises(ValueError):
        FakeBatchEnv(1, moves='teleport')


def test_dest_moves_charge_the_penalty_per_square_and_log_walks(tmp_path, monkeypatch):
    from ember_rl import general_duel
    charged = []
    original = general_duel.GeneralTrainer.move_penalty

    def spy(self, pending):
        value = original(self, pending)
        charged.append((pending.get('moved'), value))
        return value

    monkeypatch.setattr(general_duel.GeneralTrainer, 'move_penalty', spy)
    out = tmp_path / 'dest'
    duel.main(['--output', str(out), '--max-updates', '4', '--moves', 'dest', '--move-penalty', '.01',
               '--eval-slot-fraction', '.5', *PPO, *TINY])
    assert charged and all(m is not None for m, _ in charged)
    assert all(v == pytest.approx(.01 * m) for m, v in charged)
    assert any(m > 1 for m, _ in charged)                  # some walk crossed several squares in one decision
    movement = [m for r in rows(out) if r['type'] == 'progress' for teams in r['movement'].values()
                for m in teams.values()]
    assert movement and sum(m['moves'] for m in movement) > sum(m['walks'] for m in movement) > 0
    assert all(m['mean_move_penalty'] == pytest.approx(.01 * m['mean_moves'], abs=1e-5) for m in movement)
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'n20'), '--backend', 'legacy', '--moves', 'dest'])


def test_search_in_dest_mode_forks_dest_scratch_and_charges_walked_squares(tmp_path, monkeypatch):
    from ember_rl import general_model
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.search import scratch_like
    monkeypatch.setattr(general_model, 'FORWARD_ROWS', 256)     # acting, root and rollout passes in chunks
    env = FakeBatchEnv(2, moves='dest')
    assert scratch_like(env, 4).moves == 'dest'
    out = tmp_path / 'dest-search'
    duel.main(['--output', str(out), '--max-updates', '4', '--moves', 'dest', '--move-penalty', '.01',
               '--search-start-decisions', '0', '--eval-slot-fraction', '.5', *SEARCH, *PPO, *TINY])
    log = rows(out)
    assert any(r['searched_samples'] > 0 for r in log if r['type'] == 'update')


# --------------------------------------------------------------------------- resume with new flags (the plateau rule)

def test_resume_accepts_new_catalogs_and_search_flags_with_warnings_but_not_schema_changes(tmp_path, catalog):
    """The plateau rule resumes an arm with a broader catalog (guest heroes) or with search added: logged
    as `changed_args`, not refused. With the shared --dev-specs the phase keeps its comparisons; with
    other development games the phase reruns its baseline. A model schema change is refused."""
    out = tmp_path / 'plateau'
    base = ['--output', str(out), '--party-weights', L3_WEIGHTS, '--min-cell-episodes', '1', *GATED, *PPO, *TINY]
    duel.main([*base, '--max-updates', '2', '--catalog', str(catalog)])
    shutil.copy(out / 'dev-specs.jsonl', tmp_path / 'dev.jsonl')
    shutil.copy(out / 'eval-specs.jsonl', tmp_path / 'eval.jsonl')
    shared = ['--dev-specs', str(tmp_path / 'dev.jsonl'), '--eval-specs', str(tmp_path / 'eval.jsonl')]
    guests = SMALL['parties'] + (('guy', 'elion', 'mara'), ('curogana', 'ilyra'))
    broader = write_catalog(tmp_path / 'broad.jsonl', synthetic_catalog(parties=guests, families=SMALL['families']))
    duel.main([*base, '--max-updates', '4', '--catalog', str(broader), *shared, *SEARCH,
               '--search-start-decisions', '0', '--resume', str(out / 'checkpoint.pt')])
    resume = [r for r in rows(out) if r['type'] == 'resume'][-1]
    changed = resume['changed_args']
    assert {'catalog', 'dev_specs', 'eval_specs'} <= set(changed['catalog']) and 'search' in changed['search']
    assert not resume.get('dev_games_changed')
    trained = Counter(c.split('/')[1] for r in rows(out) if r['type'] == 'progress' for c in r['strata'])
    assert any('mara' in c or 'ilyra' in c for c in trained)            # the guests train after the resume
    # Without the shared specs the development games change: the phase starts its comparisons again.
    duel.main([*base, '--max-updates', '6', '--catalog', str(broader), '--allow-uncovered',
               '--resume', str(out / 'checkpoint.pt')])
    log = rows(out)
    resume = [r for r in log if r['type'] == 'resume'][-1]
    assert resume['dev_games_changed'] and 'search' in resume['changed_args']['search']
    after = log[log.index(resume) + 1:]
    devs = [r for r in after if r['type'] == 'dev']
    assert devs and devs[0]['label'] == 'baseline'
    with pytest.raises(SystemExit, match='schema'):
        duel.main([*base, '--max-updates', '8', '--catalog', str(broader), '--allow-uncovered', '--d-model', '64',
                   '--resume', str(out / 'checkpoint.pt')])


def test_per_team_dev_cadence_and_min_phase(tmp_path, catalog):
    """--dev-every-<team> and --min-phase-decisions-<team> scale with the per-team budgets (the maintainer: the
    monsters get twice the heroes' phase budget)."""
    out = tmp_path / 'cadence'
    duel.main(['--output', str(out), '--max-updates', '8', '--catalog', str(catalog), '--party-weights', L3_WEIGHTS,
               '--min-cell-episodes', '1', *GATED, *PPO, *TINY, '--gate-threshold', '1',
               '--phase-budget-heroes', '64', '--phase-budget-monsters', '128', '--dev-every-monsters', '128',
               '--min-phase-decisions-monsters', '128', '--first-team', 'monsters'])
    devs = [r for r in rows(out) if r['type'] == 'dev' and r['label'] != 'baseline']
    monsters = [r for r in devs if r['team'] == 'monsters']
    assert monsters and all(r['phase_decisions'] >= 128 for r in monsters)
    assert any(r['team'] == 'heroes' and r['phase_decisions'] < 128 for r in devs)
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'bad'), '--dev-every-heroes', '0', *TINY])


def test_specs_only_writes_the_shared_lists_a_run_reproduces(tmp_path, catalog):
    shared = tmp_path / 'shared'
    flags = ['--catalog', str(catalog), '--party-weights', L3_WEIGHTS, '--min-cell-episodes', '1',
             '--dev-episodes', '12', '--eval-episodes', '12']
    assert duel.main(['--output', str(shared), '--specs-only', *flags, *TINY]) == 0
    assert sorted(p.name for p in shared.iterdir()) == ['dev-specs.jsonl', 'eval-specs.jsonl', 'specs-coverage.json']
    out = tmp_path / 'run'
    duel.main(['--output', str(out), '--max-updates', '1', '--eval-slot-fraction', '.5', *flags, *PPO, *TINY,
               '--eval-episodes', '12'])
    for name in ('dev-specs.jsonl', 'eval-specs.jsonl'):
        assert (shared / name).read_text() == (out / name).read_text()


def test_inference_in_row_chunks_matches_one_pass():
    """Destination moves make K large: acting, root and rollout passes split into row_chunks (B x K bounded);
    the results equal one pass."""
    from ember_rl.fake_env import FakeBatchEnv
    from ember_rl.general_model import act_in_chunks, build_general, forward_in_chunks, general_config, row_chunks, to_batch
    env = FakeBatchEnv(6, moves='dest')
    env.reset(range(6), [EpisodeSpec(f'fake-train-{i}', i, i + 1, i + 2, -1, -1) for i in range(6)],
              [dict(heroes='external', monsters='external')] * 6)
    obs = env.observe(range(6))
    k = obs['cand_mask'].sum(1)
    chunks = row_chunks(obs, max_rows=int(2 * k.max()))
    assert len(chunks) > 1 and np.array_equal(np.concatenate(chunks), np.arange(6))
    assert all(len(c) * k[c].max() <= 2 * k.max() for c in chunks)
    assert len(row_chunks(obs, max_rows=1)) == 6
    torch.manual_seed(0)
    model = build_general(general_config(env.dims, d_model=32, heads=2, encoder_layers=1, decoder_layers=1,
                                        cnn_channels=8, cnn_layers=2)).eval()
    with torch.no_grad():
        logits, values = model(to_batch(obs))
        chunked, chunked_values = forward_in_chunks(model, obs, 'cpu', max_rows=int(2 * k.max()))
        index, _, act_values = act_in_chunks(model, obs, 'cpu', greedy=True, max_rows=int(2 * k.max()))
    legal = torch.from_numpy(obs['cand_mask'])
    assert torch.allclose(chunked[legal], logits[legal], atol=1e-5) and torch.isneginf(chunked[~legal]).all()
    assert torch.allclose(chunked_values, values, atol=1e-5) and torch.allclose(act_values, values, atol=1e-5)
    assert torch.equal(index, logits.argmax(-1))


def test_dedicated_eval_slots_hold_only_evaluation_games(tmp_path, catalog):
    """--eval-slots E: the last E env slots run only evaluation and development games (a round starts at once,
    without waiting for training games to end); training slots never take them; idle eval slots never step."""
    from ember_rl.general_duel import GeneralTrainer
    seen = {'train': set(), 'eval': set(), 'stepped_idle': 0}

    class Probe(GeneralTrainer):
        def reset_slots(self, slots):
            out = super().reset_slots(slots)
            for g in slots:
                seen['eval' if self.slot_state[g]['eval'] is not None else 'train'].add(g)
            return out

        def decide_batch(self, live, obs):
            seen['stepped_idle'] += sum(1 for g in live if self.slot_state[g] is None)
            return super().decide_batch(live, obs)

    argv = ['--output', str(tmp_path / 'slots'), '--max-updates', '6', '--catalog', str(catalog), '--party-weights',
            L3_WEIGHTS, '--min-cell-episodes', '1', *GATED, *PPO, *TINY, '--eval-slots', '6', '--eval-every', '2']
    args = duel.prepare_args(duel.parser().parse_args(argv))
    trainer = make_trainer(Probe, argv)
    assert trainer.env.n_slots == args.slots + 6
    trainer.run()
    assert seen['eval'] and min(seen['eval']) >= args.slots and max(seen['train']) < args.slots
    assert not seen['stepped_idle']
    log = rows(tmp_path / 'slots')
    assert [r for r in log if r['type'] == 'dev'] and rows(tmp_path / 'slots', 'eval.jsonl')
    with pytest.raises(SystemExit):
        duel.main(['--output', str(tmp_path / 'bad'), '--backend', 'legacy', '--eval-slots', '4'])
