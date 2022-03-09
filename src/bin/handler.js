process.on("uncaughtException", (err) => {
  console.log(err);
  inad.log.error(err);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  inad.log.error(err);
});
