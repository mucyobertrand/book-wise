import { Resend } from 'resend';
import { 
  tplWelcome, 
  tplAccountApproved, 
  tplAccountRejected, 
  tplBorrowConfirmation,
  tplReturnConfirmation,
  tplDueReminder
} from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BookWise <noreply@bookwise.com>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

// Specific email functions
export const sendWelcomeEmail = async (to: string, fullName: string) => {
  return sendEmail({
    to,
    subject: 'Welcome to BookWise, Your Reading Companion!',
    html: tplWelcome({ fullName }),
  });
};

export const sendAccountApprovedEmail = async (to: string, fullName: string) => {
  return sendEmail({
    to,
    subject: 'Your BookWise Account Has Been Approved!',
    html: tplAccountApproved({ fullName }),
  });
};

export const sendAccountRejectedEmail = async (to: string, fullName: string) => {
  return sendEmail({
    to,
    subject: 'Account Registration Status',
    html: tplAccountRejected({ fullName }),
  });
};

export const sendBorrowConfirmationEmail = async (
  to: string, 
  fullName: string, 
  bookTitle: string, 
  dueDate: string
) => {
  return sendEmail({
    to,
    subject: "You've Borrowed a Book!",
    html: tplBorrowConfirmation({ fullName, bookTitle, dueDate }),
  });
};

export const sendReturnConfirmationEmail = async (
  to: string, 
  fullName: string, 
  bookTitle: string
) => {
  return sendEmail({
    to,
    subject: 'Book Returned',
    html: tplReturnConfirmation({ fullName, bookTitle }),
  });
};

export const sendDueReminderEmail = async (
  to: string, 
  fullName: string, 
  bookTitle: string, 
  dueDate: string
) => {
  return sendEmail({
    to,
    subject: 'Book Due Reminder',
    html: tplDueReminder({ fullName, bookTitle, dueDate }),
  });
};
