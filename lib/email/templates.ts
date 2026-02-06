const base = (title: string, body: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;color:#E5E7EB;font-family:Arial,Helvetica,sans-serif;padding:24px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;padding:24px">
        <tr><td>
          <h1 style="margin:0 0 16px;font-size:20px;color:#FFFFFF">${title}</h1>
          <div style="font-size:14px;line-height:22px">${body}</div>
        </td></tr>
        <tr><td style="padding-top:16px;color:#9CA3AF;font-size:12px">BookWise • University Library</td></tr>
      </table>
    </td></tr>
  </table>
`;

export const tplWelcome = ({ fullName }: { fullName: string }) =>
  base(
    "Welcome to BookWise, Your Reading Companion!",
    `Hi ${fullName},<br/>
    <p>Welcome to BookWise! We're excited to have you join our community of book enthusiasts. Explore a wide range of books, borrow with ease, and manage your reading journey seamlessly.</p><br>
    <p>Get started by browsing our collection and borrowing your first book!</p>
    `
  );

export const tplAccountApproved = ({ fullName }: { fullName: string }) =>
  base(
    "Your BookWise Account Has Been Approved!",
    `Hi ${fullName},<br/>
    Congratulations! Your BookWise account has been approved. You can now browse our library, borrow books, and enjoy all the features of your new account.
    `
  );

export const tplAccountRejected = ({ fullName }: { fullName: string }) =>
  base(
    "Account Rejected",
    `Hi ${fullName},<br/>We couldn't approve your account at this time. Please re-check your ID card and details and try again.`
  );

export const tplBorrowConfirmation = ({
  fullName,
  bookTitle,
  dueDate,
}: {
  fullName: string;
  bookTitle: string;
  dueDate: string;
}) =>
  base(
    "You’ve Borrowed a Book!",
    `Hi ${fullName},<br/>You borrowed <strong>${bookTitle}</strong>.<br/>Due date: <strong>${dueDate}</strong>.`
  );

export const tplReturnConfirmation = ({
  fullName,
  bookTitle,
}: {
  fullName: string;
  bookTitle: string;
}) =>
  base(
    "Book Returned",
    `Hi ${fullName},<br/>We have marked <strong>${bookTitle}</strong> as returned. Thank you!`
  );

export const tplDueReminder = ({
  fullName,
  bookTitle,
  dueDate,
}: {
  fullName: string;
  bookTitle: string;
  dueDate: string;
}) =>
  base(
    "Book Due Reminder",
    `Hi ${fullName},<br/>A friendly reminder that <strong>${bookTitle}</strong> is due by <strong>${dueDate}</strong>.`
  );

