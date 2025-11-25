// Test email notification for bins
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "m.charaghyousafkhan@gmail.com",
    pass: "vskvkbyqrfqjdail"
  }
});

// Test email
const mailOptions = {
  from: 'm.charaghyousafkhan@gmail.com',
  to: 'm.charagh02@gmail.com', // Send to admin email
  subject: '🧪 TEST: Bin Alert Email System',
  text: `This is a test email from the Smart Bin Monitoring System.

If you receive this, the email notification system is working correctly!

Test Details:
- Bin ID: bin1
- Fill Level: 85%
- Status: NEEDS_EMPTYING
- Test Time: ${new Date().toLocaleString()}

The system will send emails like this when bins exceed 80% capacity.

Best regards,
Smart Bin Monitoring System`
};

console.log('📧 Sending test email...');
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  } else {
    console.log('✅ Test email sent successfully!');
    console.log('Response:', info.response);
    console.log('\nCheck your inbox at: m.charagh02@gmail.com');
    process.exit(0);
  }
});
