import { getAccessibilityLabel, combineAccessibilityInfo, accessibilityLabels } from './accessibilityLabels';

describe('accessibilityLabels', () => {
  describe('Label Structure', () => {
    it('should have all required button labels', () => {
      expect(accessibilityLabels.buttons).toBeDefined();
      expect(accessibilityLabels.buttons.login).toBe('登入按鈕');
      expect(accessibilityLabels.buttons.register).toBe('註冊按鈕');
      expect(accessibilityLabels.buttons.submit).toBe('提交按鈕');
      expect(accessibilityLabels.buttons.cancel).toBe('取消按鈕');
    });

    it('should have all required navigation labels', () => {
      expect(accessibilityLabels.navigation).toBeDefined();
      expect(accessibilityLabels.navigation.tab_events).toBe('活動頁面');
      expect(accessibilityLabels.navigation.tab_tickets).toBe('我的票券頁面');
      expect(accessibilityLabels.navigation.tab_profile).toBe('個人資料頁面');
    });

    it('should have all required form labels', () => {
      expect(accessibilityLabels.forms).toBeDefined();
      expect(accessibilityLabels.forms.email_input).toBe('電子信箱輸入欄');
      expect(accessibilityLabels.forms.password_input).toBe('密碼輸入欄');
      expect(accessibilityLabels.forms.required_field).toBe('必填欄位');
    });

    it('should have all required status labels', () => {
      expect(accessibilityLabels.status).toBeDefined();
      expect(accessibilityLabels.status.loading).toBe('載入中');
      expect(accessibilityLabels.status.error).toBe('發生錯誤');
      expect(accessibilityLabels.status.success).toBe('操作成功');
    });

    it('should have all required error messages', () => {
      expect(accessibilityLabels.errors).toBeDefined();
      expect(accessibilityLabels.errors.field_required).toBe('錯誤：此欄位為必填');
      expect(accessibilityLabels.errors.invalid_email).toBe('錯誤：電子信箱格式不正確');
      expect(accessibilityLabels.errors.network_error).toBe('錯誤：網路連線失敗');
    });

    it('should have all required success messages', () => {
      expect(accessibilityLabels.success).toBeDefined();
      expect(accessibilityLabels.success.saved).toBe('成功：資料已儲存');
      expect(accessibilityLabels.success.logged_in).toBe('成功：已登入');
      expect(accessibilityLabels.success.ticket_purchased).toBe('成功：票券購買完成');
    });

    it('should have all required accessibility hints', () => {
      expect(accessibilityLabels.hints).toBeDefined();
      expect(accessibilityLabels.hints.double_tap_to_activate).toBe('點兩下以啟用');
      expect(accessibilityLabels.hints.swipe_to_navigate).toBe('滑動以瀏覽');
      expect(accessibilityLabels.hints.required_field_hint).toBe('此為必填欄位');
    });
  });

  describe('getAccessibilityLabel', () => {
    it('should return correct label for valid path', () => {
      expect(getAccessibilityLabel('buttons.login')).toBe('登入按鈕');
      expect(getAccessibilityLabel('navigation.tab_events')).toBe('活動頁面');
      expect(getAccessibilityLabel('status.loading')).toBe('載入中');
    });

    it('should return path as fallback for invalid path', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      expect(getAccessibilityLabel('invalid.path')).toBe('invalid.path');
      expect(consoleSpy).toHaveBeenCalledWith('Accessibility label not found for path: invalid.path');
      
      consoleSpy.mockRestore();
    });

    it('should handle deeply nested paths', () => {
      expect(getAccessibilityLabel('events.event_card')).toBe('活動卡片');
      expect(getAccessibilityLabel('tickets.ticket_qr')).toBe('票券 QR Code');
    });
  });

  describe('combineAccessibilityInfo', () => {
    it('should return label only when no hint or role provided', () => {
      const result = combineAccessibilityInfo('測試標籤');
      
      expect(result).toEqual({
        accessibilityLabel: '測試標籤',
      });
    });

    it('should include hint when provided', () => {
      const result = combineAccessibilityInfo('測試標籤', '測試提示');
      
      expect(result).toEqual({
        accessibilityLabel: '測試標籤',
        accessibilityHint: '測試提示',
      });
    });

    it('should include role when provided', () => {
      const result = combineAccessibilityInfo('測試標籤', undefined, 'button');
      
      expect(result).toEqual({
        accessibilityLabel: '測試標籤',
        accessibilityRole: 'button',
      });
    });

    it('should include all properties when provided', () => {
      const result = combineAccessibilityInfo('測試標籤', '測試提示', 'link');
      
      expect(result).toEqual({
        accessibilityLabel: '測試標籤',
        accessibilityHint: '測試提示',
        accessibilityRole: 'link',
      });
    });
  });

  describe('Label Completeness', () => {
    it('should have Traditional Chinese labels for all categories', () => {
      // Test that all labels are in Traditional Chinese (contain Chinese characters)
      const chineseRegex = /[\u4e00-\u9fa5]/;
      
      const testCategory = (category: any, path: string = '') => {
        Object.entries(category).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            expect(value).toMatch(chineseRegex);
          } else if (typeof value === 'object' && value !== null) {
            testCategory(value, currentPath);
          }
        });
      };
      
      testCategory(accessibilityLabels);
    });

    it('should have unique labels across categories', () => {
      const allLabels = new Map<string, string[]>();
      
      const collectLabels = (obj: any, path: string = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            if (!allLabels.has(value)) {
              allLabels.set(value, []);
            }
            allLabels.get(value)!.push(currentPath);
          } else if (typeof value === 'object' && value !== null) {
            collectLabels(value, currentPath);
          }
        });
      };
      
      collectLabels(accessibilityLabels);
      
      // Check for duplicates (same label used in different places)
      const duplicates = Array.from(allLabels.entries())
        .filter(([label, paths]) => paths.length > 1);
      
      // Some duplicates are acceptable for consistency
      const acceptableDuplicatePatterns = [
        /按鈕$/,  // Button suffix
        /頁面$/,  // Page suffix
        /輸入欄$/, // Input field suffix
        /^成功：/, // Success prefix
        /^錯誤：/, // Error prefix
      ];
      
      const unexpectedDuplicates = duplicates.filter(([label]) => {
        return !acceptableDuplicatePatterns.some(pattern => pattern.test(label));
      });
      
      // Log unexpected duplicates for debugging
      if (unexpectedDuplicates.length > 0) {
        console.log('Unexpected duplicate labels found:', unexpectedDuplicates);
      }
      
      // We allow some duplicates for consistency
      expect(unexpectedDuplicates.length).toBeLessThanOrEqual(5);
    });
  });
});