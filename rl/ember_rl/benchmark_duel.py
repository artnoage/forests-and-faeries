"""Time resumed PPO rollouts, including search and optimizer work, at update boundaries.

Run with --warmup-updates 1 --timed-updates 3 -- followed by the usual duel arguments
including --resume and a fresh --output. For paired runs use the same saved checkpoint,
league archive, catalogs, seeds and device. Only the requested trainer option should vary.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
import time

import numpy as np

from ember_rl.duel import parser as duel_parser, prepare_args
from ember_rl.general_duel import GeneralTrainer


class BenchmarkTrainer(GeneralTrainer):
    def run(self):
        self.action_hash = hashlib.sha256()
        self.windows = [self.mark()]
        self.segment_counts = []
        return super().run()

    def decide_batch(self, live, obs):
        rows = super().decide_batch(live, obs)
        self.action_hash.update(np.asarray(live, dtype='<i4').tobytes())
        self.action_hash.update(np.asarray(rows, dtype='<i4').tobytes())
        return rows

    def mark(self):
        if self.device.type == 'cuda':
            self.torch.cuda.synchronize(self.device)
        return dict(wall=time.perf_counter(), decisions=sum(self.decisions.values()),
                    train_decisions=sum(self.search_counts[f'train_decisions_{t}'] for t in self.decisions),
                    updates=sum(self.updates.values()), team=self.active_team, phase=self.phase,
                    searched=self.lookahead.stats['searched'] if self.lookahead else 0,
                    action_sha256=self.action_hash.hexdigest())

    def update(self, team):
        # These are the exact stream boundaries used by GeneralTrainer.update for GAE.
        streams = Counter(key for key, _ in self.buffer[team])
        self.segment_counts.append(Counter(streams.values()))
        super().update(team)
        self.windows.append(self.mark())
        print('Benchmark update', json.dumps(self.windows[-1]), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--warmup-updates', type=int, default=1)
    parser.add_argument('--timed-updates', type=int, default=3)
    parser.add_argument('trainer_args', nargs=argparse.REMAINDER)
    opts = parser.parse_args()
    if opts.warmup_updates < 0 or opts.timed_updates < 1:
        parser.error('choose a nonnegative warmup and at least one timed update')
    flags = opts.trainer_args
    if flags[:1] == ['--']:
        flags = flags[1:]
    args = prepare_args(duel_parser().parse_args(flags))
    if args.mode != 'ppo' or not args.resume:
        parser.error('supply a PPO checkpoint with --resume and a fresh directory with --output')
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=False)
    archive = Path(args.resume).resolve().parent / 'archive'
    if args.league and archive.is_dir():
        shutil.copytree(archive, output / 'archive')
    trainer = BenchmarkTrainer(args)
    args.max_updates = sum(trainer.updates.values()) + opts.warmup_updates + opts.timed_updates
    trainer.run()
    if len(trainer.windows) != opts.warmup_updates + opts.timed_updates + 1:
        raise RuntimeError('the trainer stopped before completing the measurement')
    start, end = trainer.windows[opts.warmup_updates], trainer.windows[-1]
    seconds = end['wall'] - start['wall']
    decisions = end['decisions'] - start['decisions']
    train_decisions = end['train_decisions'] - start['train_decisions']
    searched = end['searched'] - start['searched']
    histogram = sum(trainer.segment_counts[opts.warmup_updates:], Counter())
    lengths = np.repeat(list(histogram), list(histogram.values()))
    summary = dict(seconds=seconds, learner_decisions=decisions, decisions_per_second=decisions / seconds,
                   train_decisions=train_decisions, train_decisions_per_second=train_decisions / seconds,
                   searched_roots=searched, searched_per_learner_decision=searched / decisions,
                   searched_per_train_decision=searched / train_decisions if train_decisions else None,
                   gae_segment_count=len(lengths), gae_segment_mean=float(lengths.mean()),
                   gae_segment_p50=float(np.median(lengths)), gae_segment_p90=float(np.percentile(lengths, 90)),
                   gae_segment_lengths=dict(sorted(histogram.items())), slots=args.slots, eval_slots=args.eval_slots,
                   micro_batch=args.micro_batch, minibatch=args.minibatch, rollout=args.rollout,
                   search_step_prob=args.search_step_prob, seed=args.seed, warmup_updates=opts.warmup_updates,
                   windows=trainer.windows)
    (output / 'benchmark.json').write_text(json.dumps(summary, indent=2) + '\n')
    print('Benchmark result', json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()
