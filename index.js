require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const request = require("request");
const moment = require("moment");
const Twit = require("twit");
const Sentiment = require("sentiment");

const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.set("view engine", "ejs");

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

//sentiment
var T = new Twit({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
	strictSSL: false, // optional - requires SSL certificates to be valid.
});

var S = new Sentiment();

//
// filter the public stream by english tweets
//
var stream = T.stream("statuses/filter", { track: "blm", language: "en" });

stream.on("tweet", function (tweet) {
	let text = tweet.text;
	if (tweet.extended_tweet) {
		text = tweet.extended_tweet.full_text;
	}

	let verified = false;
	let followers = 1;
	let friends = 1;

	if (tweet.user) {
		verified = tweet.user.verified;

		followers = tweet.user.followers_count;
		friends = tweet.user.friends_count;
	}

	let sentiment = S.analyze(text);
	let score = 0;

	if (sentiment) {
		score = sentiment.comparative; //this is a number from -1 to 1 representing how negative/positive the statement is as a whole
	}

	//to get the final score, we need to first work out how influential they are
	//a lower influence figure means they are MORE influential. e.g. people are 100 by default and famous people will be nearer 1

	let influence = 100;

	if (verified) {
		influence = 70;
	}

	//add one to these to ensure there's no div by 0 errors - minimum is one
	let ratio = (followers + 1) / (friends + 1);

	//arguably, one of the most influential people on twitter is trump - so use him as a reference
	//as of now, his ratio would be 1676470.61 - far too high
	//divide this by a constant of 30000 takes it to 56 - a more reasonable figure
	//set a maximum too just in case someone has a super high figure
	ratio = ratio / 30000;
	ratio = Math.min(60, ratio / 30000);

	influence -= ratio;

	score = score / influence;
	console.log(score, followers, friends, influence);
});

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});
