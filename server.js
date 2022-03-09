/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
require("dotenv").config();
const fs = require("fs");
const _ = require("lodash");

global._ = _;
global.inad = {
  config: {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
  },
  log: {},
  helpers: {},
};

fs.readdirSync("./src/config/").forEach((file) => {
  const config = require(`./src/config/${file}`);
  _.merge(inad.config, config);
});

(async () => {
  require("./src/bin/logger")();
  inad.log.debug(`Running app in ${inad.config.environment} mode`);
  await require("./src/bin/helpers")();
  require("./src/bin/handler");

  const srv = require("./src/app");
  const port = inad.config.port || 3000;

  srv.listen(port, () => {
    inad.log.info(`App running on port ${port}...`);
  });
})();
