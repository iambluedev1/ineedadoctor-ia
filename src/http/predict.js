const { spawn } = require("child_process");
const path = require("path");

module.exports = {
  predict: (req, res) => {
    const {
      age,
      sex,
      cp,
      trestbps,
      chol,
      fbs,
      restecg,
      thal,
      thalach,
      exang,
      oldpeak,
      slope,
      ca,
    } = req.query;

    let output = "";

    const python = spawn("python3.9", [
      path.join(__dirname, "../python/ineedadoctor.py"),
      "--file",
      path.join(__dirname, "../python/heart.csv"),
      "--sex",
      sex,
      "--age",
      age,
      "--cp",
      cp,
      "--trestbps",
      trestbps,
      "--chol",
      chol,
      "--fbs",
      fbs,
      "--restecg",
      restecg,
      "--thalach",
      thalach,
      "--exang",
      exang,
      "--2thal",
      thal,
      "--oldpeak",
      oldpeak,
      "--slope",
      slope,
      "--ca",
      ca,
    ]);

    inad.log.debug("Executing prediction python script");

    python.stdout.on("data", (data) => {
      output += data.toString().replace(/(\r\n|\n|\r)/gm, "");
      inad.log.debug(`Received values : ${output}`);
    });

    python.on("close", () => {
      const parts = output.split("]");
      const predictedClass = parts[0].split("[")[1];
      const target0Probability = parts[1].split("[")[1];
      const target1Probability = parts[2].split("[")[1];
      res.json({
        predictedClass,
        target0Probability,
        target1Probability,
      });
    });
  },
};
