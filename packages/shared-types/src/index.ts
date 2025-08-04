export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  googleId?: string;
  passwordHash?: string;
  authProvider: 'email' | 'google' | 'line' | 'apple';
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  organizerId: string;
  categoryId?: string;
  venueId?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SeatingZone {
  id: string;
  eventId: string;
  name: string;
  capacity: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscountCode {
  id: string;
  eventId: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  usageCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  database: {
    status: 'connected' | 'disconnected';
    message?: string;
  };
  timestamp: string;
}

// DTOs for API communication
export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  categoryId?: string;
  venueId?: string;
}

export interface CreateTicketTypeDto {
  name: string;
  price: number;
  quantity: number;
}

export interface UpdateTicketTypeDto {
  name?: string;
  price?: number;
  quantity?: number;
}

export interface CreateSeatingZoneDto {
  name: string;
  capacity: number;
  description?: string;
}

export interface CreateDiscountCodeDto {
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  expiresAt?: string;
}

export interface UpdateDiscountCodeDto {
  code?: string;
  type?: 'percentage' | 'fixed_amount';
  value?: number;
  expiresAt?: string;
}

export interface DiscountCodeResponse {
  id: string;
  eventId: string;
  code: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  usageCount: number;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateEventStatusDto {
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  reason?: string;
}

export interface EventStatusChangeDto {
  eventId: string;
  previousStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  newStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

// Pagination interfaces
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

export interface EventWithRelations extends Event {
  category?: Category;
  venue?: Venue;
  ticketTypes?: TicketType[];
}

export type PaginatedEventsResponse = PaginatedResponse<EventWithRelations>;

// Ticket Selection interfaces for registration flow
export interface TicketTypeWithAvailability {
  id: string;
  eventId: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  soldQuantity: number;
}

export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
}

export interface TicketSelectionValidationRequest {
  selections: TicketSelection[];
}

export interface TicketSelectionValidationResponse {
  valid: boolean;
  errors?: {
    ticketTypeId: string;
    message: string;
  }[];
}

// Custom Registration Field types
export interface CustomRegistrationField {
  id: string;
  eventId: string;
  fieldName: string;
  fieldType: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select field types
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationFormData {
  ticketSelections: TicketSelection[];
  customFieldValues: Record<string, any>;
  discountCode?: string;
  totalAmount: number;
  discountAmount?: number;
}

// DTOs for custom fields and discount validation
export interface CustomFieldResponse {
  fields: CustomRegistrationField[];
}

export interface DiscountValidationRequest {
  code: string;
  totalAmount: number;
}

export interface DiscountValidationResponse {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  errorMessage?: string;
}

// Payment Gateway Service types
export interface PaymentProvider {
  id: string;
  organizerId: string; // Which organizer owns this configuration
  providerId: string; // 'ecpay', 'stripe', 'paypal', etc.
  providerName: string; // Display name
  credentials: string; // Encrypted JSON of provider-specific credentials
  configuration: Record<string, any>; // Provider-specific settings
  isActive: boolean;
  isDefault: boolean; // Organizer's default payment provider
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  organizerId: string; // CRITICAL: Links payment to specific organizer
  resourceType: string; // 'event', 'subscription', 'marketplace', etc.
  resourceId: string; // event ID, subscription ID, etc.
  providerId: string; // Which payment provider was used
  providerTransactionId?: string; // Provider's transaction ID
  merchantTradeNo: string; // Our internal transaction number
  amount: number;
  discountAmount?: number;
  finalAmount: number;
  currency: string;
  paymentMethod: string; // Provider-specific payment method
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  providerResponse?: Record<string, any>; // Provider's response data
  metadata: Record<string, any>; // Additional context (customer info, etc.)
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string; // References Payment entity
  type: 'charge' | 'refund' | 'partial_refund' | 'chargeback';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  providerTransactionId?: string;
  providerResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Gateway Service DTOs
export interface PaymentRequest {
  organizerId: string;
  resourceType: string;
  resourceId: string;
  amount: number;
  currency: string;
  description: string;
  preferredProviderId?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'requires_action' | 'processing' | 'completed' | 'failed';
  redirectUrl?: string;
  clientSecret?: string;
  providerData?: Record<string, any>;
  amount: number;
  currency: string;
}

export interface PaymentStatusResponse {
  payment: Payment;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
}

export interface PaymentProviderDto {
  providerId: string;
  providerName: string;
  credentials: Record<string, any>;
  configuration?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
}

export interface UpdatePaymentProviderDto {
  credentials?: Record<string, any>;
  configuration?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
}

// ECPay-specific types
export interface ECPayCredentials {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  environment: 'development' | 'production';
  returnUrl?: string;
}

export interface ECPayPaymentRequest {
  MerchantID: string;
  MerchantTradeNo: string;
  MerchantTradeDate: string;
  PaymentType: string;
  TotalAmount: number;
  TradeDesc: string;
  ItemName: string;
  ReturnURL: string;
  ChoosePayment: string;
  CheckMacValue: string;
}

export interface ECPayCallbackResponse {
  MerchantID: string;
  MerchantTradeNo: string;
  RtnCode: number;
  RtnMsg: string;
  TradeNo: string;
  TradeAmt: number;
  PaymentDate: string;
  PaymentType: string;
  CheckMacValue: string;
}

// Payment Provider Interface (for backend implementation)
export interface IPaymentProvider {
  readonly providerId: string;
  validateCredentials(credentials: Record<string, any>): Promise<boolean>;
  createPayment(request: PaymentRequest & { paymentId: string; callbackUrl: string }, credentials: Record<string, any>): Promise<PaymentResponse>;
  validateCallback(callbackData: any, credentials: Record<string, any>): Promise<boolean>;
  processCallback(callbackData: any, payment: Payment): Promise<PaymentUpdate>;
}

export interface PaymentUpdate {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  providerTransactionId?: string;
  providerResponse?: Record<string, any>;
}

// Registration entity extension for payments
export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentId?: string; // Links to Payment Gateway Service
  qrCode?: string; // Generated after successful payment
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  customFieldValues: Record<string, any>;
  ticketSelections: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
  }>;
  checkedInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Optional relations when loaded
  user?: User;
  event?: Event;
  payment?: Payment;
}

// Post-Event Reporting Types
export interface EventReport {
  eventId: string;
  eventDetails: Event;
  registrationStats: RegistrationStats;
  revenue: RevenueStats;
  attendanceStats: AttendanceStats;
  timeline: TimelineDataPoint[];
  generatedAt: string;
}

export interface RegistrationStats {
  total: number;
  byStatus: {
    pending: number;
    paid: number;
    cancelled: number;
    checkedIn: number;
  };
  byTicketType: TicketTypeStats[];
}

export interface TicketTypeStats {
  ticketTypeId: string;
  ticketTypeName: string;
  quantitySold: number;
  revenue: number;
}

export interface RevenueStats {
  gross: number;
  discountAmount: number;
  net: number;
  byTicketType: TicketTypeStats[];
}

export interface AttendanceStats {
  registered: number;
  checkedIn: number;
  rate: number;
  lastCheckInTime?: string;
}

export interface TimelineDataPoint {
  date: string;
  registrations: number;
  revenue: number;
  cumulativeRegistrations: number;
  cumulativeRevenue: number;
}

// Invoice Settings Types
export interface InvoiceSettings {
  id: string;
  eventId: string;
  companyName?: string;
  companyAddress?: string;
  taxNumber?: string;
  invoicePrefix?: string;
  invoiceFooter?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}