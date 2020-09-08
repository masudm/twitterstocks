const Twit = require("twit");
const Sentiment = require("sentiment");
const db = require("./db");
const bs = require("binary-search");

module.exports = function (usersMapping, trackMapping, stocks) {
	console.log(stocks);

	let users = Object.keys(usersMapping);
	users.sort(function (a, b) {
		return a - b;
	});
	let track = Object.values(trackMapping).join().split(",");

	var T = new Twit({
		consumer_key: process.env.CONSUMER_KEY,
		consumer_secret: process.env.CONSUMER_SECRET,
		access_token: process.env.ACCESS_TOKEN,
		access_token_secret: process.env.ACCESS_TOKEN_SECRET,
		timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
		strictSSL: false, // optional - requires SSL certificates to be valid.
	});

	var S = new Sentiment();

	var stream = T.stream("statuses/filter", { track: track, follow: users, language: "en" });

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
		} else {
			// if they're not verified, there's a chance they;re a spammer - try and cut down on it
			text = text.toLowerCase();
			if (text.indexOf("follow me") >= 0 || text.indexOf(" dm ") >= 0 || text.indexOf("cashapp") >= 0) {
				influence = 10000000;
			}
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

		// stockSentiment += score;
		// stockSentiment = Math.max(Math.min(stockSentiment, 1), -1);

		const userTweet =
			bs(users, tweet.user.id, function (element, needle) {
				return element - needle;
			}) > 0;

		if (userTweet) {
			stocks[usersMapping[tweet.user.id]] += stocks[usersMapping[tweet.user.id]] * score * 0.01;
		} else {
			Object.keys(trackMapping).forEach((tick) => {
				if (new RegExp(trackMapping[tick].join("|")).test(text)) {
					stocks[tick] += stocks[tick] * score * 0.01;
				}
			});
		}
	});

	setInterval(() => {
		console.log(stocks);
	}, 1000);
};
