const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
dotenv.config();

const emailjs = async (text, email) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  if (email.length > 1) {
    for (const recipient of email) {
      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: recipient,
        subject: "Bulk Mail",
        text: `${text}`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${recipient}!`);
      } catch (error) {
        console.log(`Error sending email to ${recipient}:`, error);
      }
    }
    return 'mail sent successfully';
  } else {
    var mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Have a Good day",
      text: ` ${text}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return error;
      } else {
        console.log("Email sent successfully!");
      }
    });
    return 'success';
  }
};

module.exports = emailjs;
