import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('ENCRYPTION_SECRET_KEY');
    if (!this.secretKey) {
      throw new Error('ENCRYPTION_SECRET_KEY environment variable is required');
    }
    if (this.secretKey.length !== 32) {
      throw new Error('ENCRYPTION_SECRET_KEY must be exactly 32 characters long');
    }
  }

  /**
   * Encrypt credentials with Additional Authenticated Data (AAD) for context
   */
  encrypt(plaintext: string, context: string = 'payment-credentials'): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
      cipher.setAAD(Buffer.from(context, 'utf8'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt credentials with Additional Authenticated Data (AAD) validation
   */
  decrypt(encryptedText: string, context: string = 'payment-credentials'): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid encrypted text format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.secretKey), iv);
      decipher.setAAD(Buffer.from(context, 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Safely encrypt JSON objects
   */
  encryptJson(obj: Record<string, any>, context?: string): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, context);
  }

  /**
   * Safely decrypt JSON objects
   */
  decryptJson<T = Record<string, any>>(encryptedText: string, context?: string): T {
    const jsonString = this.decrypt(encryptedText, context);
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse decrypted JSON: ${error.message}`);
    }
  }
}