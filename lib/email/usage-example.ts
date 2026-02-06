// Example usage of the email service
// Import this file in your components or API routes

import {
  sendWelcomeEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendBorrowConfirmationEmail,
  sendReturnConfirmationEmail,
  sendDueReminderEmail
} from './service';

// Example: Send welcome email when user registers
export const handleUserRegistration = async (userEmail: string, fullName: string) => {
  try {
    const result = await sendWelcomeEmail(userEmail, fullName);
    if (result.success) {
      console.log('Welcome email sent successfully');
    } else {
      console.error('Failed to send welcome email:', result.error);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Example: Send account approval email
export const handleAccountApproval = async (userEmail: string, fullName: string) => {
  try {
    const result = await sendAccountApprovedEmail(userEmail, fullName);
    if (result.success) {
      console.log('Account approval email sent successfully');
    } else {
      console.error('Failed to send approval email:', result.error);
    }
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
};

// Example: Send account rejection email
export const handleAccountRejection = async (userEmail: string, fullName: string) => {
  try {
    const result = await sendAccountRejectedEmail(userEmail, fullName);
    if (result.success) {
      console.log('Account rejection email sent successfully');
    } else {
      console.error('Failed to send rejection email:', result.error);
    }
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
};

// Example: Send borrow confirmation email
export const handleBookBorrow = async (
  userEmail: string, 
  fullName: string, 
  bookTitle: string, 
  dueDate: string
) => {
  try {
    const result = await sendBorrowConfirmationEmail(userEmail, fullName, bookTitle, dueDate);
    if (result.success) {
      console.log('Borrow confirmation email sent successfully');
    } else {
      console.error('Failed to send borrow confirmation:', result.error);
    }
  } catch (error) {
    console.error('Error sending borrow confirmation:', error);
  }
};

// Example: Send return confirmation email
export const handleBookReturn = async (
  userEmail: string, 
  fullName: string, 
  bookTitle: string
) => {
  try {
    const result = await sendReturnConfirmationEmail(userEmail, fullName, bookTitle);
    if (result.success) {
      console.log('Return confirmation email sent successfully');
    } else {
      console.error('Failed to send return confirmation:', result.error);
    }
  } catch (error) {
    console.error('Error sending return confirmation:', error);
  }
};

// Example: Send due reminder email
export const handleDueReminder = async (
  userEmail: string, 
  fullName: string, 
  bookTitle: string, 
  dueDate: string
) => {
  try {
    const result = await sendDueReminderEmail(userEmail, fullName, bookTitle, dueDate);
    if (result.success) {
      console.log('Due reminder email sent successfully');
    } else {
      console.error('Failed to send due reminder:', result.error);
    }
  } catch (error) {
    console.error('Error sending due reminder:', error);
  }
};
