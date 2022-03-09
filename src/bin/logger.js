/* eslint-disable no-underscore-dangle */
const CaptainsLog = require("captains-log");
const { createLogger, format, transports } = require("winston");

const { combine, timestamp, metadata, colorize, printf } = format;
const readLastLines = require("read-last-lines");

module.exports = () => {
  const logger = createLogger({
    level: inad.config.log.level,
    transports: [
      new transports.File({
        filename: inad.config.log.file,
        handleExceptions: true,
        format: combine(
          timestamp(inad.config.log.timestamp),
          metadata(inad.config.log.metadata),
          colorize(),
          printf((info) => {
            let out = `[${info.timestamp}] ${info.message}`;
            if (info.metadata.error) {
              out = `${out} ${info.metadata.error}`;
              if (info.metadata.error.stack) {
                out = `${out} ${info.metadata.error.stack}`;
              }
            }
            return out.replace(
              // eslint-disable-next-line no-control-regex
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              "",
            );
          }),
        ),
      }),
      new transports.Console({
        format: format.combine(
          metadata(inad.config.log.metadata),
          colorize(),
          printf((info) => {
            let out = `${info.message}`;
            if (info.metadata.error) {
              out = `${out} ${info.metadata.error}`;
              if (info.metadata.error.stack) {
                out = `${out} ${info.metadata.error.stack}`;
              }
            }
            return out;
          }),
        ),
      }),
    ],
    exitOnError: false,
  });

  let timeout = null;
  const sendEmail = (message) => {
    readLastLines
      .read(inad.config.log.file, inad.config.log.email.logLinesCount)
      .then(async (lines) => {
        await inad.helpers.sendEmail({
          to: inad.config.smtp.lists.DEV,
          subject:
            (inad.config.environment === "production"
              ? "(env: prod) "
              : "(env: dev) ") + message,
          content: lines,
        });
      });
  };

  inad.log = CaptainsLog({ custom: logger });
  inad.log._error = inad.log.error;
  inad.log.error = (message, options) => {
    if (options === undefined) inad.log._error(message);
    else inad.log._error(message, options);

    if (inad.config.environment === "production") {
      if (timeout != null) clearTimeout(timeout);
      timeout = setTimeout(
        () => sendEmail(message),
        1000 * inad.config.log.email.wait,
      );
    }
  };
};
