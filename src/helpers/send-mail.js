const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

module.exports.sendEmail = ({
  to,
  subject,
  content,
  from = inad.config.smtp.from.NO_REPLY,
}) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(
      smtpTransport(inad.config.smtp.transporter),
    );

    const mailOptions = {
      from,
      to,
      subject,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        inad.log[
          error.message.includes("all recipients were rejected")
            ? "warn"
            : "error"
        ](`Unable to send email to ${to} [${error.message}]`);
        return reject(error.message);
      }

      inad.log.info(
        `Email successfully sent to ${to} [${info.messageId}]`,
      );
      return resolve();
    });
  });
};
