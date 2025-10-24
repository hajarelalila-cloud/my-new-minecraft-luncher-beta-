import { describe, test, expect } from 'vitest';
import { normalizeEmail, hashEmail } from '../emailHash';

describe('normalizeEmail', () => {
  describe('basic normalization', () => {
    test('trims leading and trailing whitespace', () => {
      expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
      expect(normalizeEmail('\ttest@example.com\n')).toBe('test@example.com');
      expect(normalizeEmail('   test@example.com')).toBe('test@example.com');
      expect(normalizeEmail('test@example.com   ')).toBe('test@example.com');
    });

    test('converts to lowercase', () => {
      expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
      expect(normalizeEmail('Test@Example.Com')).toBe('test@example.com');
      expect(normalizeEmail('TeSt@ExAmPlE.cOm')).toBe('test@example.com');
    });

    test('combines trimming and lowercasing', () => {
      expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(normalizeEmail('\t Test@Example.Com \n')).toBe('test@example.com');
    });
  });

  describe('Gmail-specific rules', () => {
    test('removes dots from Gmail local part', () => {
      expect(normalizeEmail('jane.doe@gmail.com')).toBe('janedoe@gmail.com');
      expect(normalizeEmail('j.a.n.e@gmail.com')).toBe('jane@gmail.com');
      expect(normalizeEmail('test.user.name@gmail.com')).toBe('testusername@gmail.com');
    });

    test('removes plus tags from Gmail addresses', () => {
      expect(normalizeEmail('jane+home@gmail.com')).toBe('jane@gmail.com');
      expect(normalizeEmail('test+spam@gmail.com')).toBe('test@gmail.com');
      expect(normalizeEmail('user+tag123@gmail.com')).toBe('user@gmail.com');
    });

    test('removes both dots and plus tags from Gmail', () => {
      expect(normalizeEmail('jane.doe+home@gmail.com')).toBe('janedoe@gmail.com');
      expect(normalizeEmail('test.user+work@gmail.com')).toBe('testuser@gmail.com');
      expect(normalizeEmail('j.a.n.e+tag@gmail.com')).toBe('jane@gmail.com');
    });

    test('handles Gmail with uppercase', () => {
      expect(normalizeEmail('Jane.Doe@Gmail.Com')).toBe('janedoe@gmail.com');
      expect(normalizeEmail('TEST.USER+TAG@GMAIL.COM')).toBe('testuser@gmail.com');
    });

    test('handles Gmail with whitespace', () => {
      expect(normalizeEmail('  jane.doe+home@gmail.com  ')).toBe('janedoe@gmail.com');
    });

    test('does NOT apply Gmail rules to non-Gmail addresses', () => {
      // Dots should be preserved for non-Gmail
      expect(normalizeEmail('jane.doe@example.com')).toBe('jane.doe@example.com');
      expect(normalizeEmail('test.user@yahoo.com')).toBe('test.user@yahoo.com');

      // Plus tags should be preserved for non-Gmail
      expect(normalizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
      expect(normalizeEmail('test+spam@outlook.com')).toBe('test+spam@outlook.com');

      // Both preserved
      expect(normalizeEmail('jane.doe+home@example.com')).toBe('jane.doe+home@example.com');
    });

    test('handles gmail.com with different cases', () => {
      expect(normalizeEmail('test@GMAIL.COM')).toBe('test@gmail.com');
      expect(normalizeEmail('test@Gmail.Com')).toBe('test@gmail.com');
      expect(normalizeEmail('jane.doe@GMAIL.COM')).toBe('janedoe@gmail.com');
    });
  });

  describe('edge cases', () => {
    test('handles empty plus tag in Gmail', () => {
      expect(normalizeEmail('test+@gmail.com')).toBe('test@gmail.com');
    });

    test('handles multiple plus signs in Gmail (only first is special)', () => {
      expect(normalizeEmail('test+tag+more@gmail.com')).toBe('test@gmail.com');
    });

    test('handles email with only dots in local part', () => {
      expect(normalizeEmail('...@gmail.com')).toBe('@gmail.com');
    });

    test('handles simple email without special characters', () => {
      expect(normalizeEmail('simple@example.com')).toBe('simple@example.com');
      expect(normalizeEmail('test@gmail.com')).toBe('test@gmail.com');
    });
  });
});

describe('hashEmail', () => {
  describe('SHA-256 Base64 hashing', () => {
    test('produces consistent hashes for same input', () => {
      const hash1 = hashEmail('test@example.com');
      const hash2 = hashEmail('test@example.com');
      expect(hash1).toBe(hash2);
    });

    test('produces different hashes for different inputs', () => {
      const hash1 = hashEmail('test1@example.com');
      const hash2 = hashEmail('test2@example.com');
      expect(hash1).not.toBe(hash2);
    });

    test('output is Base64 encoded (contains valid Base64 characters)', () => {
      const hash = hashEmail('test@example.com');
      // Base64 regex: alphanumeric, +, /, and optional = padding
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('SHA-256 Base64 output is 44 characters long', () => {
      // SHA-256 = 256 bits = 32 bytes
      // Base64 encoding: ceil(32 * 4/3) = 44 characters (with padding)
      const hash = hashEmail('test@example.com');
      expect(hash.length).toBe(44);
    });
  });

  describe('normalization before hashing', () => {
    test('normalizes before hashing - whitespace', () => {
      const hash1 = hashEmail('test@example.com');
      const hash2 = hashEmail('  test@example.com  ');
      expect(hash1).toBe(hash2);
    });

    test('normalizes before hashing - case insensitive', () => {
      const hash1 = hashEmail('test@example.com');
      const hash2 = hashEmail('TEST@EXAMPLE.COM');
      expect(hash1).toBe(hash2);
    });

    test('normalizes Gmail dots before hashing', () => {
      const hash1 = hashEmail('janedoe@gmail.com');
      const hash2 = hashEmail('jane.doe@gmail.com');
      expect(hash1).toBe(hash2);
    });

    test('normalizes Gmail plus tags before hashing', () => {
      const hash1 = hashEmail('test@gmail.com');
      const hash2 = hashEmail('test+spam@gmail.com');
      expect(hash1).toBe(hash2);
    });

    test('normalizes Gmail dots and plus tags before hashing', () => {
      const hash1 = hashEmail('janedoe@gmail.com');
      const hash2 = hashEmail('jane.doe+home@gmail.com');
      expect(hash1).toBe(hash2);
    });

    test('does NOT normalize non-Gmail addresses', () => {
      const hash1 = hashEmail('janedoe@example.com');
      const hash2 = hashEmail('jane.doe@example.com');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('known test vectors', () => {
    // Test vectors verified with Node.js crypto module
    // Can also verify at: https://unifiedid.com/examples/hashing-tool/

    test('hashes "validate@example.com" correctly', () => {
      // Known test vector
      const email = 'validate@example.com';
      const expectedHash = 'ntI244ZRTXwAwpki6/M5cyBYW7h/Wq576lnN3l9+W/c=';
      expect(hashEmail(email)).toBe(expectedHash);
    });

    test('hashes "VALIDATE@example.com" correctly (case insensitive)', () => {
      // Should produce same hash as lowercase version
      const email = 'VALIDATE@example.com';
      const expectedHash = 'ntI244ZRTXwAwpki6/M5cyBYW7h/Wq576lnN3l9+W/c=';
      expect(hashEmail(email)).toBe(expectedHash);
    });

    test('hashes "  validate@example.com  " correctly (with whitespace)', () => {
      // Should produce same hash after trimming
      const email = '  validate@example.com  ';
      const expectedHash = 'ntI244ZRTXwAwpki6/M5cyBYW7h/Wq576lnN3l9+W/c=';
      expect(hashEmail(email)).toBe(expectedHash);
    });
  });

  describe('real-world examples', () => {
    test('handles common Gmail patterns', () => {
      // All should produce same hash
      const base = hashEmail('johndoe@gmail.com');
      expect(hashEmail('john.doe@gmail.com')).toBe(base);
      expect(hashEmail('JOHN.DOE@GMAIL.COM')).toBe(base);
      expect(hashEmail('john.doe+work@gmail.com')).toBe(base);
      expect(hashEmail('  john.doe+home@gmail.com  ')).toBe(base);
    });

    test('handles non-Gmail addresses correctly', () => {
      // These should all be different
      const hashes = [
        hashEmail('user@yahoo.com'),
        hashEmail('user+tag@yahoo.com'),
        hashEmail('user.name@yahoo.com'),
        hashEmail('user.name+tag@yahoo.com')
      ];

      // All unique (no Gmail normalization applied)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(4);
    });
  });
});
