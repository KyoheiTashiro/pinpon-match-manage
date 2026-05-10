import { describe, it, expect } from 'vitest';
import { isGameFinished, gameWinner, matchSummary } from './match';

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
