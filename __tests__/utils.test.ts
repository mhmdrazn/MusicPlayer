import { cn, formatDuration } from '../lib/helpers';

describe('lib/utils', () => {
  describe('cn', () => {
    test('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    test('handles false conditions', () => {
      expect(cn('foo', false && 'bar')).toBe('foo');
    });

    test('merges tailwind classes without duplication', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('formatDuration', () => {
    test('formats 0 seconds as 0:00', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    test('formats seconds with leading zero', () => {
      expect(formatDuration(5)).toBe('0:05');
    });

    test('formats minutes and seconds', () => {
      expect(formatDuration(65)).toBe('1:05');
    });

    test('formats large durations', () => {
      expect(formatDuration(600)).toBe('10:00');
      expect(formatDuration(3661)).toBe('61:01');
    });

    test('handles negative values', () => {
      expect(formatDuration(-1)).toBe('0:00');
    });

    test('handles NaN', () => {
      // @ts-expect-error testing NaN handling
      expect(formatDuration(NaN)).toBe('0:00');
    });
  });
});
