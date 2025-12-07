import { formatBytes, getTimeAgo, clamp, randomBetween } from '../lib/number-utils';

describe('number-utils', () => {
  describe('formatBytes', () => {
    test('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('handles large numbers', () => {
      expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2 GB');
      expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
    });
  });

  describe('clamp', () => {
    test('clamps value to min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    test('handles equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10);
      expect(clamp(15, 10, 10)).toBe(10);
    });

    test('handles negative ranges', () => {
      expect(clamp(-5, -10, 0)).toBe(-5);
      expect(clamp(-15, -10, 0)).toBe(-10);
    });
  });

  describe('randomBetween', () => {
    test('returns number within range', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomBetween(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
      }
    });

    test('can return min and max values', () => {
      let hasMin = false;
      let hasMax = false;

      for (let i = 0; i < 1000; i++) {
        const num = randomBetween(1, 2);
        if (num === 1) hasMin = true;
        if (num === 2) hasMax = true;
        if (hasMin && hasMax) break;
      }

      expect(hasMin).toBe(true);
      expect(hasMax).toBe(true);
    });

    test('handles single value range', () => {
      expect(randomBetween(5, 5)).toBe(5);
    });
  });

  describe('getTimeAgo', () => {
    test('returns "just now" for recent timestamps', () => {
      const now = new Date();
      expect(getTimeAgo(now)).toBe('just now');

      const secsAgo30 = new Date(now.getTime() - 30 * 1000);
      expect(getTimeAgo(secsAgo30)).toBe('just now');
    });

    test('returns minutes ago', () => {
      const now = new Date();
      const minsAgo5 = new Date(now.getTime() - 5 * 60 * 1000);
      expect(getTimeAgo(minsAgo5)).toBe('5m ago');
    });

    test('returns hours ago', () => {
      const now = new Date();
      const hoursAgo2 = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(getTimeAgo(hoursAgo2)).toBe('2h ago');
    });

    test('returns days ago', () => {
      const now = new Date();
      const daysAgo3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(getTimeAgo(daysAgo3)).toBe('3d ago');
    });

    test('returns date for older timestamps', () => {
      const now = new Date();
      const daysAgo10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const result = getTimeAgo(daysAgo10);
      expect(result).not.toBe('10d ago');
      expect(result).toMatch(/\d+\/\d+\/\d+/);
    });
  });
});
