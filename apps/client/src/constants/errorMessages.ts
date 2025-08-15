/**
 * Error messages in Traditional Chinese
 * 繁體中文錯誤訊息
 */

export const ERROR_MESSAGES = {
  // Network errors - 網路錯誤
  network: {
    offline: '您目前離線，請檢查網路連線',
    timeout: '連線逾時，請稍後再試',
    serverError: '伺服器發生錯誤，請稍後再試',
    notFound: '找不到要求的資源',
    serviceUnavailable: '服務暫時無法使用，請稍後再試',
    badGateway: '閘道錯誤，請稍後再試',
    requestFailed: '請求失敗，請重試',
    slowConnection: '網路連線緩慢，請耐心等候',
    noInternet: '無網路連線，請檢查您的網路設定',
  },

  // Authentication errors - 認證錯誤
  authentication: {
    loginFailed: '登入失敗，請檢查您的帳號密碼',
    sessionExpired: '登入已過期，請重新登入',
    unauthorized: '您沒有權限執行此操作',
    invalidCredentials: '帳號或密碼錯誤',
    accountLocked: '帳號已被鎖定，請聯繫客服',
    accountNotFound: '找不到此帳號',
    emailNotVerified: '請先驗證您的電子郵件',
    passwordResetRequired: '需要重設密碼',
    twoFactorRequired: '需要雙因素認證',
    socialLoginFailed: '第三方登入失敗，請重試',
  },

  // Validation errors - 驗證錯誤
  validation: {
    required: '此欄位為必填',
    invalidEmail: '請輸入有效的電子郵件地址',
    passwordTooShort: '密碼長度至少需要8個字符',
    passwordTooWeak: '密碼強度不足，請包含大小寫字母、數字和特殊符號',
    passwordMismatch: '密碼不相符',
    invalidPhoneNumber: '請輸入有效的電話號碼',
    invalidDate: '請輸入有效的日期',
    dateInPast: '日期不能是過去的時間',
    dateInFuture: '日期不能是未來的時間',
    invalidAmount: '請輸入有效的金額',
    amountTooLow: '金額太小',
    amountTooHigh: '金額太大',
    invalidFormat: '格式不正確',
    duplicateEntry: '此資料已存在',
    invalidCode: '驗證碼錯誤',
    codeExpired: '驗證碼已過期',
  },

  // Payment errors - 付款錯誤
  payment: {
    failed: '付款失敗，請重試或更換付款方式',
    declined: '付款被拒絕，請聯繫您的銀行',
    timeout: '付款處理超時，請確認交易狀態',
    insufficientFunds: '餘額不足',
    cardExpired: '信用卡已過期',
    invalidCard: '無效的信用卡資訊',
    processingError: '付款處理錯誤，請稍後再試',
    alreadyPaid: '此訂單已付款',
    refundFailed: '退款失敗，請聯繫客服',
    cancelledByUser: '付款已被使用者取消',
    securityCheck: '安全檢查失敗，請重試',
    limitExceeded: '超過交易限額',
  },

  // Event errors - 活動錯誤
  event: {
    notFound: '找不到此活動',
    expired: '活動已結束',
    cancelled: '活動已取消',
    full: '活動已額滿',
    registrationClosed: '報名已截止',
    notStarted: '報名尚未開始',
    alreadyRegistered: '您已報名此活動',
    ticketUnavailable: '票券已售完',
    invalidTicketType: '無效的票券類型',
    maxTicketsExceeded: '超過可購買的票券數量上限',
    minTicketsNotMet: '未達到最低購買數量',
    seatUnavailable: '座位已被預訂',
    invalidDiscountCode: '無效的折扣碼',
    discountExpired: '折扣碼已過期',
    discountUsed: '折扣碼已使用',
  },

  // User errors - 使用者錯誤
  user: {
    profileUpdateFailed: '更新個人資料失敗',
    emailAlreadyExists: '此電子郵件已被使用',
    phoneAlreadyExists: '此電話號碼已被使用',
    avatarUploadFailed: '頭像上傳失敗',
    passwordChangeFailed: '密碼更改失敗',
    deleteAccountFailed: '刪除帳號失敗',
    verificationFailed: '驗證失敗',
    registrationFailed: '註冊失敗',
    profileIncomplete: '請完成個人資料填寫',
    ageRestriction: '年齡不符合要求',
  },

  // File errors - 檔案錯誤
  file: {
    uploadFailed: '檔案上傳失敗',
    sizeTooLarge: '檔案大小超過限制',
    invalidType: '不支援的檔案格式',
    notFound: '找不到檔案',
    downloadFailed: '檔案下載失敗',
    corrupted: '檔案已損壞',
    processingFailed: '檔案處理失敗',
    quotaExceeded: '儲存空間不足',
  },

  // Permission errors - 權限錯誤
  permission: {
    cameradenied: '相機權限被拒絕',
    locationDenied: '位置權限被拒絕',
    notificationDenied: '通知權限被拒絕',
    storageDenied: '儲存權限被拒絕',
    contactsDenied: '聯絡人權限被拒絕',
    microphoneDenied: '麥克風權限被拒絕',
    calendarDenied: '行事曆權限被拒絕',
    photoLibraryDenied: '相簿權限被拒絕',
  },

  // System errors - 系統錯誤
  system: {
    maintenance: '系統維護中，請稍後再試',
    updateRequired: '請更新應用程式至最新版本',
    incompatibleDevice: '您的裝置不相容',
    storageUull: '裝置儲存空間不足',
    memoryLow: '記憶體不足',
    crashDetected: '應用程式發生錯誤，請重新啟動',
    configError: '設定錯誤，請聯繫客服',
    dataCorrupted: '資料損壞，請重新載入',
  },

  // General errors - 一般錯誤
  general: {
    somethingWrong: '發生未知錯誤，請稍後再試',
    tryAgain: '請再試一次',
    contactSupport: '如果問題持續發生，請聯繫客服',
    loadingFailed: '載入失敗',
    saveFailed: '儲存失敗',
    deleteFailed: '刪除失敗',
    operationFailed: '操作失敗',
    noData: '暫無資料',
    comingSoon: '功能即將推出',
    featureDisabled: '此功能暫時停用',
    accessRestricted: '存取受限',
  },

  // Success messages - 成功訊息
  success: {
    saved: '儲存成功',
    updated: '更新成功',
    deleted: '刪除成功',
    sent: '發送成功',
    copied: '複製成功',
    downloaded: '下載成功',
    uploaded: '上傳成功',
    registered: '註冊成功',
    loggedIn: '登入成功',
    loggedOut: '登出成功',
    paymentCompleted: '付款成功',
    refunded: '退款成功',
    cancelled: '取消成功',
    verified: '驗證成功',
    subscribed: '訂閱成功',
    unsubscribed: '取消訂閱成功',
  },

  // Warning messages - 警告訊息
  warning: {
    unsavedChanges: '您有未儲存的變更',
    confirmDelete: '確定要刪除嗎？此操作無法復原',
    confirmCancel: '確定要取消嗎？',
    confirmLogout: '確定要登出嗎？',
    lowBattery: '電量不足',
    weakConnection: '網路連線不穩定',
    limitReached: '已達到上限',
    expiringEoon: '即將過期',
    deprecated: '此功能即將停用',
    betaFeature: '這是測試版功能，可能不穩定',
  },

  // Info messages - 資訊訊息
  info: {
    loading: '載入中...',
    processing: '處理中...',
    pleaseWait: '請稍候...',
    redirecting: '正在跳轉...',
    syncing: '同步中...',
    updating: '更新中...',
    downloading: '下載中...',
    uploading: '上傳中...',
    verifying: '驗證中...',
    connecting: '連線中...',
  },
} as const;

// Error codes mapping
export const ERROR_CODES: Record<string, keyof typeof ERROR_MESSAGES> = {
  // HTTP status codes
  '400': 'validation',
  '401': 'authentication',
  '403': 'authentication',
  '404': 'network',
  '408': 'network',
  '500': 'system',
  '502': 'network',
  '503': 'system',
  
  // Custom error codes
  'NETWORK_ERROR': 'network',
  'AUTH_ERROR': 'authentication',
  'VALIDATION_ERROR': 'validation',
  'PAYMENT_ERROR': 'payment',
  'PERMISSION_ERROR': 'permission',
  'SYSTEM_ERROR': 'system',
  'FILE_ERROR': 'file',
  'EVENT_ERROR': 'event',
  'USER_ERROR': 'user',
} as const;

// Helper function to get error message
export const getErrorMessage = (
  category: keyof typeof ERROR_MESSAGES,
  key: string,
  fallback?: string
): string => {
  const categoryMessages = ERROR_MESSAGES[category];
  if (categoryMessages && key in categoryMessages) {
    return (categoryMessages as any)[key];
  }
  return fallback || ERROR_MESSAGES.general.somethingWrong;
};

// Helper function to get error message by code
export const getErrorMessageByCode = (code: string, fallback?: string): string => {
  const category = ERROR_CODES[code];
  if (category && ERROR_MESSAGES[category]) {
    return (ERROR_MESSAGES[category] as any).serverError || ERROR_MESSAGES.general.somethingWrong;
  }
  return fallback || ERROR_MESSAGES.general.somethingWrong;
};

// Export type for TypeScript
export type ErrorCategory = keyof typeof ERROR_MESSAGES;
export type ErrorMessageKey<T extends ErrorCategory> = keyof typeof ERROR_MESSAGES[T];