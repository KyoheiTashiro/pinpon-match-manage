import { describe, it, expect } from 'vitest';
import type { Side } from './match';
import { gameProgress } from './scoreProgress';

describe('gameProgress', () => {
  it('empty log returns empty array', () => {
    expect(gameProgress([], 'L')).toEqual([]);
  });

  it('basic progression: R,R,L firstServer=L', () => {
    const result = gameProgress(['R', 'R', 'L'], 'L');
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ index: 1, scorer: 'R', left: 0, right: 1, server: 'L' });
    expect(result[1]).toMatchObject({ index: 2, scorer: 'R', left: 0, right: 2, server: 'L' });
    expect(result[2]).toMatchObject({ index: 3, scorer: 'L', left: 1, right: 2, server: 'R' });
  });

  it('server switches every 2 points', () => {
    const log: Side[] = ['L', 'L', 'R', 'R', 'L', 'L'];
    const result = gameProgress(log, 'L');
    expect(result[0].server).toBe('L');
    expect(result[1].server).toBe('L');
    expect(result[2].server).toBe('R');
    expect(result[3].server).toBe('R');
    expect(result[4].server).toBe('L');
    expect(result[5].server).toBe('L');
  });

  it('deuce: 1-point alternation after 10-10 (total>=20)', () => {
    const buildTo1010: Side[] = [
      ...Array(10).fill('L'),
      ...Array(10).fill('R'),
    ] as Side[];
    const log: Side[] = [...buildTo1010, 'L', 'R'];
    const result = gameProgress(log, 'L');
    const r20 = result[20];
    const r21 = result[21];
    expect(r20?.server).toBe('L');
    expect(r21?.server).toBe('R');
  });

  it('cumulative scores match final scores', () => {
    const log: Side[] = ['R', 'L', 'R', 'R', 'L'];
    const result = gameProgress(log, 'L');
    const last = result[result.length - 1];
    const leftCount = log.filter((s) => s === 'L').length;
    const rightCount = log.filter((s) => s === 'R').length;
    expect(last?.left).toBe(leftCount);
    expect(last?.right).toBe(rightCount);
  });
});
