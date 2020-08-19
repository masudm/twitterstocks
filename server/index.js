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
	console.log("https://www.alphavantage.co/query?function=" + time + "&symbol=" + req.params.ticker + "&apikey=demo");
	request(
		"https://www.alphavantage.co/query?function=" + time + "&symbol=" + req.params.ticker + "&apikey=demo",
		function (error, response, body) {
			if (response && response.statusCode == 200) {
				res.json(JSON.parse(body));
			}
		}
	);
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});
