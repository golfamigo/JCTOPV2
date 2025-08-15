import i18n, { useTranslation } from './index';
import { renderHook } from '@testing-library/react-native';

describe('Localization Configuration', () => {
  describe('i18n initialization', () => {
    it('should be initialized', () => {
      expect(i18n).toBeDefined();
      expect(i18n.isInitialized).toBe(true);
    });

    it('should have zh-TW as default language', () => {
      expect(i18n.language).toBe('zh-TW');
    });

    it('should have zh-TW as fallback language', () => {
      const fallbackLng = i18n.options.fallbackLng;
      expect(Array.isArray(fallbackLng) ? fallbackLng[0] : fallbackLng).toBe('zh-TW');
    });

    it('should have resources loaded', () => {
      expect(i18n.hasResourceBundle('zh-TW', 'translation')).toBe(true);
    });
  });

  describe('Translation keys', () => {
    it('should translate common keys correctly', () => {
      expect(i18n.t('common.welcome')).toBe('歡迎');
      expect(i18n.t('common.login')).toBe('登入');
      expect(i18n.t('common.register')).toBe('註冊');
      expect(i18n.t('common.save')).toBe('儲存');
      expect(i18n.t('common.cancel')).toBe('取消');
    });

    it('should translate auth keys correctly', () => {
      expect(i18n.t('auth.email')).toBe('電子信箱');
      expect(i18n.t('auth.password')).toBe('密碼');
      expect(i18n.t('auth.name')).toBe('姓名');
      expect(i18n.t('auth.phone')).toBe('電話號碼');
    });

    it('should translate event keys correctly', () => {
      expect(i18n.t('events.events')).toBe('活動');
      expect(i18n.t('events.eventName')).toBe('活動名稱');
      expect(i18n.t('events.createEvent')).toBe('建立活動');
      expect(i18n.t('events.registerForEvent')).toBe('報名活動');
    });

    it('should translate organizer keys correctly', () => {
      expect(i18n.t('organizer.dashboard')).toBe('主辦方儀表板');
      expect(i18n.t('organizer.attendees')).toBe('參加者');
      expect(i18n.t('organizer.checkIn')).toBe('報到');
    });

    it('should translate validation keys correctly', () => {
      expect(i18n.t('validation.required')).toBe('此欄位為必填');
      expect(i18n.t('validation.invalidEmail')).toBe('請輸入有效的電子信箱');
      expect(i18n.t('validation.passwordTooShort')).toBe('密碼至少需要8個字元');
    });
  });

  describe('useTranslation hook', () => {
    it('should return translation function', () => {
      const { result } = renderHook(() => useTranslation());
      
      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe('function');
    });

    it('should translate keys using hook', () => {
      const { result } = renderHook(() => useTranslation());
      
      expect(result.current.t('common.welcome')).toBe('歡迎');
      expect(result.current.t('auth.email')).toBe('電子信箱');
    });

    it('should return i18n instance', () => {
      const { result } = renderHook(() => useTranslation());
      
      expect(result.current.i18n).toBeDefined();
      expect(result.current.i18n.language).toBe('zh-TW');
    });
  });

  describe('Interpolation', () => {
    it('should handle interpolation correctly', () => {
      // Test with count interpolation
      const result = i18n.t('validation.minLength', { count: 8 });
      expect(result).toBe('至少需要 8 個字元');
    });

    it('should handle missing interpolation values gracefully', () => {
      const result = i18n.t('validation.minLength');
      expect(result).toContain('至少需要');
    });
  });

  describe('Missing translations', () => {
    it('should return key for missing translations', () => {
      const result = i18n.t('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should fallback to default namespace', () => {
      expect(i18n.options.defaultNS).toBe('translation');
    });
  });

  describe('Key structure validation', () => {
    it('should have properly structured translation keys', () => {
      const resources = i18n.getResourceBundle('zh-TW', 'translation');
      
      // Check main categories exist
      expect(resources.common).toBeDefined();
      expect(resources.auth).toBeDefined();
      expect(resources.events).toBeDefined();
      expect(resources.organizer).toBeDefined();
      expect(resources.profile).toBeDefined();
      expect(resources.tickets).toBeDefined();
      expect(resources.payment).toBeDefined();
      expect(resources.validation).toBeDefined();
      expect(resources.messages).toBeDefined();
    });

    it('should have consistent key naming', () => {
      const resources = i18n.getResourceBundle('zh-TW', 'translation');
      
      // Check that all values are strings (not objects with nested keys we missed)
      const checkStringValues = (obj: any, path = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            checkStringValues(value, `${path}${key}.`);
          } else {
            expect(typeof value).toBe('string');
            expect(value.length).toBeGreaterThan(0);
          }
        });
      };

      checkStringValues(resources);
    });
  });

  describe('Traditional Chinese content validation', () => {
    it('should contain Traditional Chinese characters', () => {
      const commonTranslations = i18n.getResourceBundle('zh-TW', 'translation').common;
      
      // Check some key translations contain Chinese characters
      expect(/[\u4e00-\u9fff]/.test(commonTranslations.welcome)).toBe(true);
      expect(/[\u4e00-\u9fff]/.test(commonTranslations.login)).toBe(true);
      expect(/[\u4e00-\u9fff]/.test(commonTranslations.register)).toBe(true);
    });

    it('should use appropriate Traditional Chinese terms', () => {
      expect(i18n.t('auth.email')).toBe('電子信箱'); // Traditional term
      expect(i18n.t('common.save')).toBe('儲存'); // Traditional character
      expect(i18n.t('payment.creditCard')).toBe('信用卡');
    });
  });
});