/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const walk = require("../utils/walk");

module.exports = () => {
  return new Promise((resolve) => {
    walk("./src/helpers", (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const helper = require(file);
        const fileName = file.split("/helpers/")[1];
        if (!fileName.includes("/")) {
          _.merge(global.inad.helpers, helper);
        } else {
          const parts = fileName.split("/");
          parts.pop();

          if (parts.join(".").includes("_")) {
            return;
          }

          _.set(
            inad.helpers,
            parts.join("."),
            _.merge(
              _.get(global.inad.helpers, parts.join(".")),
              helper,
            ),
          );
        }
        inad.log.debug(`Loaded helper ${fileName}`);
      });
      resolve();
    });
  });
};
