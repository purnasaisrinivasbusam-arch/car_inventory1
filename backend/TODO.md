# TODO: Switch Email Service to Gmail SMTP

## Tasks
- [x] Update `backend/utils/email.js` to use Gmail SMTP instead of Brevo SMTP
  - Change transporter host to `smtp.gmail.com`
  - Update authentication to use GMAIL_USER and GMAIL_APP_PASSWORD
  - Update 'from' field to use GMAIL_SENDER_NAME and GMAIL_SENDER_EMAIL
  - Update verification logs to check for Gmail environment variables
  - Fix misplaced console.log statement
- [ ] Update .env file with Gmail credentials
- [ ] Test email functionality by running server and attempting user registration

## Status
- Plan approved by user
- Implementation completed
- Ready for testing
