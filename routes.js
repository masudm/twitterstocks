const request = require("request");
const moment = require("moment");

module.exports = function (app) {
	app.get("/:time/:ticker", (req, res) => {
		let t = req.params.time;
		let time = "TIME_SERIES_INTRADAY&interval=5min";
		let tObjName = "Time Series (5min)";
		switch (t) {
			case "5mins":
				time = "TIME_SERIES_INTRADAY&interval=5min";
				tObjName = "Time Series (5min)";
				break;
			case "daily":
				time = "TIME_SERIES_DAILY";
				tObjName = "Time Series (Daily)";
				break;
			case "monthly":
				time = "TIME_SERIES_MONTHLY";
				tObjName = "Monthly Time Series";
				break;
			default:
				time = "TIME_SERIES_INTRADAY&interval=5min";
				tObjName = "Time Series (5min)";
				break;
		}

		let requestsDone = 0;
		let output = {};

		request(
			"https://www.alphavantage.co/query?function=" + time + "&symbol=" + req.params.ticker + "&apikey=demo",
			function (error, response, body) {
				if (response && response.statusCode == 200) {
					let ticks = JSON.parse(body)[tObjName];
					let adjusted = [];
					Object.keys(ticks).forEach((element) => {
						//console.log(element, ticks[element]["4. close"]);
						let t = {
							x: new Date((moment(element).unix() + 3600 + 48 * 3600) * 1000),
							y: ticks[element]["4. close"],
						};
						adjusted.push(t);
					});
					process("data", adjusted);
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

		request("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo", function (
			error,
			response,
			body
		) {
			if (response && response.statusCode == 200) {
				process("quote", JSON.parse(body)["Global Quote"]);
			}
		});

		function process(key, body) {
			output[key] = body;
			requestsDone += 1;
			if (requestsDone == 3) {
				// res.json(output);
				return res.render("index", output);
			}
		}
	});
};
