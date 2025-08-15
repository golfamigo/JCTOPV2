/**
 * Accessibility labels in Traditional Chinese for all interactive elements
 * Following WCAG 2.1 AA guidelines
 */

export const accessibilityLabels = {
  // Button labels
  buttons: {
    login: '登入按鈕',
    register: '註冊按鈕',
    submit: '提交按鈕',
    cancel: '取消按鈕',
    back: '返回按鈕',
    close: '關閉按鈕',
    save: '儲存按鈕',
    delete: '刪除按鈕',
    edit: '編輯按鈕',
    add: '新增按鈕',
    search: '搜尋按鈕',
    filter: '篩選按鈕',
    refresh: '重新整理按鈕',
    more: '更多選項按鈕',
    share: '分享按鈕',
    export: '匯出按鈕',
    import: '匯入按鈕',
    confirm: '確認按鈕',
    reject: '拒絕按鈕',
    next: '下一步按鈕',
    previous: '上一步按鈕',
    finish: '完成按鈕',
    googleSignIn: '使用 Google 登入按鈕',
    appleSignIn: '使用 Apple 登入按鈕',
    forgotPassword: '忘記密碼按鈕',
    resetPassword: '重設密碼按鈕',
    logout: '登出按鈕',
    scanQR: '掃描 QR Code 按鈕',
    viewQR: '檢視 QR Code 按鈕',
    checkIn: '報到按鈕',
    buyTicket: '購買票券按鈕',
    viewDetails: '檢視詳情按鈕',
  },

  // Navigation labels
  navigation: {
    tab_events: '活動頁面',
    tab_tickets: '我的票券頁面',
    tab_profile: '個人資料頁面',
    tab_organizer: '主辦方管理頁面',
    tab_admin: '系統管理頁面',
    drawer_menu: '側邊選單',
    bottom_tabs: '底部導覽列',
    back_navigation: '返回上一頁',
    home: '首頁',
    settings: '設定頁面',
    notifications: '通知頁面',
    help: '說明頁面',
  },

  // Form field labels
  forms: {
    email_input: '電子信箱輸入欄',
    password_input: '密碼輸入欄',
    confirm_password_input: '確認密碼輸入欄',
    name_input: '姓名輸入欄',
    phone_input: '電話號碼輸入欄',
    address_input: '地址輸入欄',
    date_picker: '日期選擇器',
    time_picker: '時間選擇器',
    dropdown_select: '下拉選單',
    checkbox: '核取方塊',
    radio_button: '單選按鈕',
    text_area: '文字輸入區域',
    file_upload: '檔案上傳欄位',
    search_field: '搜尋輸入欄',
    required_field: '必填欄位',
    optional_field: '選填欄位',
    quantity_selector: '數量選擇器',
    price_input: '價格輸入欄',
    discount_code: '折扣碼輸入欄',
    credit_card: '信用卡號碼輸入欄',
    cvv: 'CVV 安全碼輸入欄',
    expiry_date: '到期日輸入欄',
  },

  // Status and state labels
  status: {
    loading: '載入中',
    error: '發生錯誤',
    success: '操作成功',
    warning: '警告',
    info: '資訊',
    no_data: '無資料',
    empty: '空白',
    offline: '離線狀態',
    online: '線上狀態',
    syncing: '同步中',
    completed: '已完成',
    pending: '待處理',
    cancelled: '已取消',
    expired: '已過期',
    active: '進行中',
    inactive: '未啟用',
    sold_out: '已售完',
    available: '可購買',
    unavailable: '無法購買',
    selected: '已選擇',
    unselected: '未選擇',
  },

  // Event-specific labels
  events: {
    event_card: '活動卡片',
    event_title: '活動名稱',
    event_date: '活動日期',
    event_location: '活動地點',
    event_price: '活動票價',
    event_organizer: '活動主辦方',
    event_category: '活動類別',
    event_capacity: '活動人數上限',
    event_remaining: '剩餘名額',
    event_description: '活動描述',
    event_image: '活動圖片',
    registration_form: '報名表單',
    ticket_type: '票券類型',
    ticket_quantity: '票券數量',
    total_price: '總金額',
  },

  // Ticket-specific labels
  tickets: {
    ticket_card: '票券卡片',
    ticket_qr: '票券 QR Code',
    ticket_id: '票券編號',
    ticket_status: '票券狀態',
    ticket_holder: '持票人姓名',
    check_in_status: '報到狀態',
    check_in_time: '報到時間',
    seat_number: '座位號碼',
    admission_time: '入場時間',
  },

  // Modal and dialog labels
  modals: {
    modal_container: '彈出視窗',
    modal_title: '視窗標題',
    modal_content: '視窗內容',
    modal_close: '關閉視窗按鈕',
    confirmation_dialog: '確認對話框',
    alert_dialog: '警告對話框',
    info_dialog: '資訊對話框',
    error_dialog: '錯誤對話框',
  },

  // Image and media labels
  media: {
    image: '圖片',
    video: '影片',
    audio: '音訊',
    document: '文件',
    placeholder_image: '預設圖片',
    user_avatar: '使用者頭像',
    event_banner: '活動橫幅圖片',
    logo: '標誌',
    icon: '圖示',
    gallery: '圖片集',
  },

  // Table and list labels
  lists: {
    list_container: '列表容器',
    list_item: '列表項目',
    list_header: '列表標題',
    table: '表格',
    table_row: '表格列',
    table_column: '表格欄',
    table_header: '表格標題',
    sort_ascending: '升序排序',
    sort_descending: '降序排序',
    pagination: '分頁導覽',
    page_number: '頁碼',
    items_per_page: '每頁顯示項目數',
  },

  // Accessibility hints
  hints: {
    double_tap_to_activate: '點兩下以啟用',
    swipe_to_navigate: '滑動以瀏覽',
    long_press_for_options: '長按顯示更多選項',
    drag_to_reorder: '拖曳以重新排序',
    pinch_to_zoom: '縮放以放大或縮小',
    pull_to_refresh: '下拉以重新整理',
    tap_to_select: '點擊以選擇',
    tap_to_expand: '點擊以展開',
    tap_to_collapse: '點擊以收合',
    scroll_for_more: '捲動以查看更多內容',
    required_field_hint: '此為必填欄位',
    password_requirements: '密碼必須包含至少8個字元',
    email_format: '請輸入有效的電子信箱地址',
    phone_format: '請輸入有效的電話號碼',
  },

  // Error messages for screen readers
  errors: {
    field_required: '錯誤：此欄位為必填',
    invalid_email: '錯誤：電子信箱格式不正確',
    invalid_password: '錯誤：密碼不符合要求',
    network_error: '錯誤：網路連線失敗',
    server_error: '錯誤：伺服器發生錯誤',
    validation_error: '錯誤：輸入資料驗證失敗',
    authentication_error: '錯誤：驗證失敗',
    authorization_error: '錯誤：權限不足',
    not_found: '錯誤：找不到資源',
    timeout: '錯誤：操作逾時',
  },

  // Success messages for screen readers
  success: {
    saved: '成功：資料已儲存',
    deleted: '成功：資料已刪除',
    updated: '成功：資料已更新',
    created: '成功：資料已建立',
    sent: '成功：已發送',
    copied: '成功：已複製到剪貼簿',
    downloaded: '成功：已下載',
    uploaded: '成功：已上傳',
    logged_in: '成功：已登入',
    logged_out: '成功：已登出',
    registered: '成功：註冊成功',
    payment_complete: '成功：付款完成',
    ticket_purchased: '成功：票券購買完成',
    check_in_complete: '成功：報到完成',
  },

  // Roles for semantic elements
  roles: {
    button: '按鈕',
    link: '連結',
    image: '圖片',
    heading: '標題',
    navigation: '導覽',
    main: '主要內容',
    complementary: '補充內容',
    form: '表單',
    search: '搜尋',
    alert: '警告',
    status: '狀態',
    progressbar: '進度條',
    timer: '計時器',
    tab: '分頁',
    tablist: '分頁列表',
    menu: '選單',
    menuitem: '選單項目',
  },
};

// Helper function to get nested label
export const getAccessibilityLabel = (path: string): string => {
  const keys = path.split('.');
  let current: any = accessibilityLabels;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Accessibility label not found for path: ${path}`);
      return path; // Return the path as fallback
    }
    current = current[key];
  }
  
  return current;
};

// Helper function to combine label and hint
export const combineAccessibilityInfo = (
  label: string,
  hint?: string,
  role?: string
): {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
} => {
  return {
    accessibilityLabel: label,
    ...(hint && { accessibilityHint: hint }),
    ...(role && { accessibilityRole: role as any }),
  };
};

export default accessibilityLabels;