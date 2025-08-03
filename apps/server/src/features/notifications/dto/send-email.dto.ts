export interface SendEmailDto {
  to: string;
  subject: string;
  template: string;
  templateData: {
    userName?: string;
    eventTitle?: string;
    eventDate?: Date;
    eventLocation?: string;
    registrationId?: string;
    qrCode?: string;
    ticketSelections?: Array<{
      ticketTypeId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount?: number;
    currency?: string;
    [key: string]: any;
  };
}