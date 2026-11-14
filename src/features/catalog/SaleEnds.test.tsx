import { timeLeft } from './SaleEnds';

const second = 1000;
const hour = 60 * 60 * second;

describe('timeLeft', () => {
  it('shows days and hours while more than a day is left', () => {
    expect(timeLeft(2 * 24 * hour + 4 * hour + 59 * second)).toBe('2d 4h');
  });

  it('counts down hours, minutes, and seconds in the last day', () => {
    expect(timeLeft(3 * hour + 5 * 60 * second + 9 * second)).toBe('3h 05m 09s');
  });

  it('is null once the sale has ended', () => {
    expect(timeLeft(0)).toBeNull();
    expect(timeLeft(-1)).toBeNull();
  });
});
