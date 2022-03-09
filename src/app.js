const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const path = require("path");

const morgan = require("./middleware/morgan");

const srv = express();
srv.use(compression());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message:
    "Too many requests from this ip, please try again in an hour!",
});

srv.use(helmet());
srv.use(morgan);

srv.use(express.json({ limit: "10kb" }));
srv.use(express.urlencoded({ extended: true, limit: "10kb" }));

srv.use(bodyParser.json({ limit: "1024mb" }));
srv.use(
  bodyParser.urlencoded({
    limit: "1024mb",
    extended: true,
    parameterLimit: 1000000000,
  }),
);

srv.use(cors());
srv.options("*", cors());
srv.use(limiter);

srv.use(
  express.static(path.join(__dirname, "../public"), {
    dotfiles: "ignore",
    etag: true,
    extensions: ["css", "js", "png", "jpg"],
    index: false,
    maxAge: "7d",
    redirect: false,
  }),
);

srv.get("/", require("./http/home").index);

srv.get("*", (req, res) => {
  const html = ` \
  <!DOCTYPE html> \
  <html lang="en"> \
    <head>\
      <meta charset="utf-8">\
      <title>Error</title>\
    </head>\
    <body>\
      <pre>Cannot GET ${req.url}</pre>\
      </body>\
  </html>`;

  res.status(404).send(html);
});

module.exports = srv;
