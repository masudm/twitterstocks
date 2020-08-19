const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");

const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/:time/:ticker", (req, res) => {
	let t = req.params.time;
	let time = "TIME_SERIES_INTRADAY&interval=5min";
	switch (t) {
		case "5mins":
			time = "TIME_SERIES_INTRADAY&interval=5min";
			break;
		case "daily":
			time = "TIME_SERIES_DAILY";
			break;
		case "monthly":
			time = "TIME_SERIES_MONTHLY";
			break;
		default:
			time = "TIME_SERIES_INTRADAY&interval=5min";
			break;
	}

	let requestsDone = 0;
	let output = {};

	request(
		"https://www.alphavantage.co/query?function=" + time + "&symbol=" + req.params.ticker + "&apikey=demo",
		function (error, response, body) {
			if (response && response.statusCode == 200) {
				process("data", JSON.parse(body));
			}
		}
	);

	request("https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=demo", function (
		error,
		response,
		body
	) {
		if (response && response.statusCode == 200) {
			process("info", JSON.parse(body));
		}
	});

	function process(key, body) {
		output[key] = body;
		requestsDone += 1;
		if (requestsDone == 2) {
			res.json(output);
		}
	}
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});
