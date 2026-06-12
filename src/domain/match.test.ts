import { describe, it, expect } from 'vitest';
import type { Side } from './match';
import {
  isGameFinished,
  gameWinner,
  matchSummary,
  scoresFromLog,
  addPointToGame,
  undoLastPoint,
  lastScorer,
} from './match';

describe('isGameFinished', () => {
  it('11-9 finished', () => {
    expect(isGameFinished({ leftScore: 11, rightScore: 9 })).toBe(true);
  });
  it('11-10 not finished', () => {
    expect(isGameFinished({ leftScore: 11, rightScore: 10 })).toBe(false);
  });
  it('12-10 finished', () => {
    expect(isGameFinished({ leftScore: 12, rightScore: 10 })).toBe(true);
  });
  it('15-13 finished', () => {
    expect(isGameFinished({ leftScore: 15, rightScore: 13 })).toBe(true);
  });
  it('5-3 not finished', () => {
    expect(isGameFinished({ leftScore: 5, rightScore: 3 })).toBe(false);
  });
});

describe('gameWinner', () => {
  it('left wins', () => {
    expect(gameWinner({ leftScore: 11, rightScore: 7 })).toBe('L');
  });
  it('right wins', () => {
    expect(gameWinner({ leftScore: 9, rightScore: 11 })).toBe('R');
  });
  it('not finished returns null', () => {
    expect(gameWinner({ leftScore: 10, rightScore: 10 })).toBeNull();
  });
});

describe('matchSummary', () => {
  it('3-0 finished', () => {
    const s = matchSummary([
      { leftScore: 11, rightScore: 5 },
      { leftScore: 11, rightScore: 8 },
      { leftScore: 11, rightScore: 9 },
    ]);
    expect(s.finished).toBe(true);
    expect(s.winner).toBe('L');
    expect(s.leftWins).toBe(3);
  });
  it('3-2 finished', () => {
    const s = matchSummary([
      { leftScore: 11, rightScore: 9 },
      { leftScore: 8, rightScore: 11 },
      { leftScore: 11, rightScore: 7 },
      { leftScore: 6, rightScore: 11 },
      { leftScore: 11, rightScore: 9 },
    ]);
    expect(s.winner).toBe('L');
    expect(s.leftWins).toBe(3);
    expect(s.rightWins).toBe(2);
  });
  it('2-2 ongoing', () => {
    const s = matchSummary([
      { leftScore: 11, rightScore: 9 },
      { leftScore: 8, rightScore: 11 },
      { leftScore: 11, rightScore: 7 },
      { leftScore: 6, rightScore: 11 },
    ]);
    expect(s.finished).toBe(false);
    expect(s.winner).toBeNull();
  });
});

describe('scoresFromLog', () => {
  it('empty log returns 0-0', () => {
    expect(scoresFromLog([])).toEqual({ leftScore: 0, rightScore: 0 });
  });
  it('counts L and R correctly', () => {
    expect(scoresFromLog(['L', 'R', 'L', 'L', 'R'])).toEqual({
      leftScore: 3,
      rightScore: 2,
    });
  });
});

describe('addPointToGame', () => {
  it('adds to pointLog and recalculates scores', () => {
    const g = { leftScore: 1, rightScore: 0, pointLog: ['L' as const] };
    const result = addPointToGame(g, 'R');
    expect(result.pointLog).toEqual(['L', 'R']);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(1);
  });
  it('starts from empty log when pointLog is undefined', () => {
    const g = { leftScore: 0, rightScore: 0 };
    const result = addPointToGame(g, 'L');
    expect(result.pointLog).toEqual(['L']);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(0);
  });
});

describe('undoLastPoint', () => {
  it('removes last entry and recalculates', () => {
    const g = { leftScore: 2, rightScore: 1, pointLog: ['L', 'R', 'L'] as Side[] };
    const result = undoLastPoint(g);
    expect(result.pointLog).toEqual(['L', 'R']);
    expect(result.leftScore).toBe(1);
    expect(result.rightScore).toBe(1);
  });
  it('returns unchanged when pointLog is empty', () => {
    const g = { leftScore: 0, rightScore: 0, pointLog: [] as Side[] };
    expect(undoLastPoint(g)).toBe(g);
  });
  it('returns unchanged when pointLog is undefined', () => {
    const g = { leftScore: 0, rightScore: 0 };
    expect(undoLastPoint(g)).toBe(g);
  });
});

describe('lastScorer', () => {
  it('returns last element of pointLog', () => {
    const g = { leftScore: 2, rightScore: 1, pointLog: ['L', 'R', 'L'] as Side[] };
    expect(lastScorer(g)).toBe('L');
  });
  it('returns null when pointLog is empty', () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0, pointLog: [] })).toBeNull();
  });
  it('returns null when pointLog is undefined', () => {
    expect(lastScorer({ leftScore: 0, rightScore: 0 })).toBeNull();
  });
});
