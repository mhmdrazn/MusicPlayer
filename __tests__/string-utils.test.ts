import { validateEmail, truncateString, slugify, capitalizeWords } from '../lib/string-utils';

describe('string-utils', () => {
  describe('validateEmail', () => {
    test('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('returns false for invalid email', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    test('handles edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true);
      expect(validateEmail('test@localhost')).toBe(false);
    });
  });

  describe('truncateString', () => {
    test('returns full string if within maxLength', () => {
      expect(truncateString('hello', 10)).toBe('hello');
      expect(truncateString('hello', 5)).toBe('hello');
    });

    test('truncates and adds ellipsis when exceeding maxLength', () => {
      expect(truncateString('hello world', 5)).toBe('hello...');
      expect(truncateString('this is a long string', 10)).toBe('this is a ...');
    });

    test('handles empty string', () => {
      expect(truncateString('', 5)).toBe('');
    });
  });

  describe('slugify', () => {
    test('converts to lowercase and replaces spaces with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('My Awesome Playlist')).toBe('my-awesome-playlist');
    });

    test('removes special characters', () => {
      expect(slugify('Test@123#ABC')).toBe('test123abc');
      expect(slugify('Song (Remix)')).toBe('song-remix');
    });

    test('handles multiple spaces and hyphens', () => {
      expect(slugify('multiple   spaces')).toBe('multiple-spaces');
      expect(slugify('already-hyphenated')).toBe('already-hyphenated');
    });

    test('trims whitespace', () => {
      expect(slugify('  trimmed  ')).toBe('trimmed');
    });
  });

  describe('capitalizeWords', () => {
    test('capitalizes first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('my awesome playlist')).toBe('My Awesome Playlist');
    });

    test('handles already capitalized text', () => {
      expect(capitalizeWords('Hello World')).toBe('Hello World');
    });

    test('handles single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
      expect(capitalizeWords('a')).toBe('A');
    });

    test('handles empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });
  });
});
