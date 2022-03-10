function buildGetUrlParams(baseUrl, paramsObj) {
  var builtUrl = baseUrl + "?";
  Object.keys(paramsObj).forEach(function (key) {
    builtUrl += key + "=" + paramsObj[key] + "&";
  });
  return builtUrl.substr(0, builtUrl.length - 1);
}

document.getElementById("ia-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(document.getElementById("ia-form"));
  var object = {};
  formData.forEach(function (value, key) {
    object[key] = value;
  });

  document.getElementById("ia-form").style.display = "none";
  document.getElementById("loader").style.display = "";

  fetch(buildGetUrlParams("/api/predict", object))
    .then((response) => response.json())
    .then((json) => {
      const id = json.id;
      let interval = null;
      let state = false;

      interval = setInterval(() => {
        fetch("/api/predict/result?id=" + id)
          .then((response) => response.json())
          .then((json) => {
            console.log(json);
            clearInterval(interval);
            state = true;

            document.getElementById("ia-form").style.display = "none";
            document.getElementById("loader").style.display = "none";
            document.getElementById("error").style.display = "none";

            if (json.predictedClass == 0) {
              document.getElementById("result-no").style.display = "";
              document.getElementById(
                "result-no-data",
              ).innerText = `Probabilités à ${json.target0Probability}% `;
            } else {
              document.getElementById("result-yes").style.display =
                "";
              document.getElementById(
                "result-yes-data",
              ).innerText = `Probabilités à ${json.target1Probability}%`;
            }
          });
      }, 2000);

      setTimeout(() => {
        if (!state) {
          clearInterval(interval);
          document.getElementById("ia-form").style.display = "none";
          document.getElementById("loader").style.display = "none";
          document.getElementById("error").style.display = "";
          document.getElementById("error").innerText =
            "Oups, il semble que cela est prit trop de temps 😞";
        }
      }, 120000);
    });
});
