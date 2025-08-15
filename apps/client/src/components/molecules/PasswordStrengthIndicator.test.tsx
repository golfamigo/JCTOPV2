import { calculatePasswordStrength } from './PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  describe('calculatePasswordStrength function', () => {
    it('should return score 0 for empty password', () => {
      const result = calculatePasswordStrength('');
      expect(result.score).toBe(0);
      expect(result.progress).toBe(0);
      expect(result.label).toBe('');
    });

    it('should return very weak for short password with no variety', () => {
      const result = calculatePasswordStrength('abc');
      expect(result.score).toBe(1);
      expect(result.label).toBe('auth.passwordStrength.weak');
      expect(result.color).toBe('#DC3545');
    });

    it('should return weak for password with only lowercase', () => {
      const result = calculatePasswordStrength('abcdefgh');
      expect(result.score).toBe(2);
      expect(result.label).toBe('auth.passwordStrength.fair');
      expect(result.color).toBe('#FFC107');
    });

    it('should return good for password with lowercase, uppercase, and numbers', () => {
      const result = calculatePasswordStrength('Abcdefgh1');
      expect(result.score).toBe(4);
      expect(result.label).toBe('auth.passwordStrength.strong');
      expect(result.color).toBe('#28A745');
      expect(result.progress).toBe(1.0);
    });

    it('should return strong for complex password with all character types', () => {
      const result = calculatePasswordStrength('Abcdefgh1!@#');
      expect(result.score).toBe(4);
      expect(result.label).toBe('auth.passwordStrength.strong');
      expect(result.color).toBe('#28A745');
      expect(result.progress).toBe(1.0);
    });

    it('should cap score at 4 for very long complex passwords', () => {
      const result = calculatePasswordStrength('VeryLongPasswordWithAllTypes123!@#$%^&*()');
      expect(result.score).toBe(4);
      expect(result.progress).toBe(1.0);
    });

    it('should handle special characters correctly', () => {
      const result = calculatePasswordStrength('Test123!');
      expect(result.score).toBe(4);
      expect(result.label).toBe('auth.passwordStrength.strong');
    });
  });

  describe('Password strength levels', () => {
    const testCases = [
      { password: 'a', expectedScore: 1, expectedLabel: 'auth.passwordStrength.weak' },
      { password: 'abcdefgh', expectedScore: 2, expectedLabel: 'auth.passwordStrength.fair' },
      { password: 'Abcdefgh', expectedScore: 3, expectedLabel: 'auth.passwordStrength.good' },
      { password: 'Abcdefgh1', expectedScore: 4, expectedLabel: 'auth.passwordStrength.strong' },
      { password: 'Abcdefgh1!', expectedScore: 4, expectedLabel: 'auth.passwordStrength.strong' },
    ];

    testCases.forEach(({ password, expectedScore, expectedLabel }) => {
      it(`should return score ${expectedScore} and label "${expectedLabel}" for password "${password}"`, () => {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBe(expectedScore);
        expect(result.label).toBe(expectedLabel);
      });
    });
  });
});