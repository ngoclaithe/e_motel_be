import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const verificationUrl = `${this.configService.get('APP_URL')}/verify-email?token=your-token`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset</h1>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
      `,
    });
  }

  async sendBillNotification(email: string, billDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'New Bill Available',
      html: `
        <h1>Monthly Bill</h1>
        <p>Your monthly bill for ${billDetails.month} is ready.</p>
        <p>Total Amount: ${billDetails.totalAmount}</p>
        <p>Due Date: ${billDetails.dueDate}</p>
        <p>Please log in to your account to view the complete bill details.</p>
      `,
    });
  }

  async sendContractExpirationNotice(email: string, contractDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Contract Expiration Notice',
      html: `
        <h1>Contract Expiration Notice</h1>
        <p>Your rental contract will expire on ${contractDetails.endDate}.</p>
        <p>Please contact your landlord to discuss renewal options.</p>
      `,
    });
  }

  async sendMaintenanceRequestUpdate(email: string, requestDetails: any): Promise<void> {
    await this.transporter.sendMail({
      to: email,
      subject: 'Maintenance Request Update',
      html: `
        <h1>Maintenance Request Update</h1>
        <p>Your maintenance request has been ${requestDetails.status}.</p>
        <p>Request Details:</p>
        <ul>
          <li>Title: ${requestDetails.title}</li>
          <li>Status: ${requestDetails.status}</li>
          <li>Updated At: ${requestDetails.updatedAt}</li>
        </ul>
      `,
    });
  }
}