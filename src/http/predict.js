const { spawn } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const PROCESSES = [];

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

    const python = spawn("python", [
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

    const id = uuidv4();

    inad.log.debug("Executing prediction python script");

    python.stdout.on("data", (data) => {
      output += data.toString().replace(/(\r\n|\n|\r)/gm, "");
      inad.log.debug(`Received values : ${output}`);
    });

    python.stderr.on("data", (data) => {
      inad.log.error(`Received error : ${data}`);
    });

    python.on("close", () => {
      const parts = output.split("]");
      const predictedClass = parts[0].split("[")[1];
      const target0Probability = parts[1].split("[")[1];
      const target1Probability = parts[2].split("[")[1];
      inad.log.debug(`Process closed for id  : ${id}`);

      PROCESSES.push({
        id,
        predictedClass,
        target0Probability,
        target1Probability,
      });
    });

    res.json({
      id,
    });
  },
  result: (req, res) => {
    const { id } = req.query;
    const item = PROCESSES.find((p) => p.id === id) || null;

    if (item == null) {
      return res.status(400).send("Bad id");
    }

    return res.json(item);
  },
};
