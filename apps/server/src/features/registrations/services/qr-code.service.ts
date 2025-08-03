import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

  async generateRegistrationQrCode(registrationData: {
    registrationId: string;
    eventId: string;
    userId: string;
  }): Promise<string> {
    const encryptedData = this.encryptRegistrationData(registrationData);
    
    const qrData = {
      type: 'registration',
      data: encryptedData,
      timestamp: Date.now()
    };

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 400,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  private encryptRegistrationData(data: {
    registrationId: string;
    eventId: string;
    userId: string;
  }): string {
    const algorithm = 'aes-256-cbc';
    const encryptionKey = this.configService.get<string>('QR_ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      throw new Error('QR_ENCRYPTION_KEY must be configured for production use');
    }
    
    const key = Buffer.from(encryptionKey).slice(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  decryptRegistrationData(encryptedData: string): {
    registrationId: string;
    eventId: string;
    userId: string;
  } {
    const algorithm = 'aes-256-cbc';
    const encryptionKey = this.configService.get<string>('QR_ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      throw new Error('QR_ENCRYPTION_KEY must be configured for decryption');
    }
    
    const key = Buffer.from(encryptionKey).slice(0, 32);

    const [ivHex, encrypted] = encryptedData.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}