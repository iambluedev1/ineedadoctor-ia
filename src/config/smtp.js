module.exports.smtp = {
  transporter: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  from: {
    NO_REPLY: `I Need A Doctor <${process.env.SMTP_SENDER}>`,
  },
  lists: {
    DEV: `dev <${process.env.LIST_DEV_EMAIL}>`,
  },
};
