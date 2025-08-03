import { IsOptional, IsEnum, IsString } from 'class-validator';

export class AttendeeDto {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customFieldValues: Record<string, any>;
  ticketSelections: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  qrCode?: string;

  // User information
  userName: string;
  userEmail: string;
  userPhone?: string;

  constructor(registration: any, user: any) {
    this.id = registration.id;
    this.userId = registration.userId;
    this.eventId = registration.eventId;
    this.status = registration.status;
    this.paymentStatus = registration.paymentStatus || 'pending';
    this.totalAmount = registration.totalAmount || 0;
    this.discountAmount = registration.discountAmount || 0;
    this.finalAmount = registration.finalAmount || 0;
    this.customFieldValues = registration.customFieldValues || {};
    this.ticketSelections = registration.ticketSelections || [];
    this.createdAt = registration.createdAt;
    this.updatedAt = registration.updatedAt;
    this.qrCode = registration.qrCode;
    
    // User information with null safety
    this.userName = user?.name || 'Unknown';
    this.userEmail = user?.email || 'No email';
    this.userPhone = user?.phone;
  }
}

export class AttendeeQueryDto {
  @IsOptional()
  @IsEnum(['pending', 'paid', 'cancelled', 'checkedIn'])
  status?: 'pending' | 'paid' | 'cancelled' | 'checkedIn';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'status' | 'userName' | 'finalAmount';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class AttendeeListResponseDto {
  attendees: AttendeeDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(
    attendees: AttendeeDto[],
    total: number,
    page: number,
    limit: number
  ) {
    this.attendees = attendees;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}