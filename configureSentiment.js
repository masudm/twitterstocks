const db = require("./db");

let track = {};
let users = {};
let stocks = {};

db.query(
	`SELECT company.companyId,name,ticker,type,term,price,sentimentPrice,sentiment FROM company
	JOIN search ON search.companyId = company.companyId
	JOIN tick ON tick.companyId = company.companyId;`,
	function (error, results, fields) {
		if (error) throw error;
		results.forEach((record) => {
			stocks[record.ticker] = record.price;
			if (record.type == "user") {
				users[parseInt(record.term)] = record.ticker;
			} else if (record.type == "track") {
				if (!track[record.ticker]) {
					track[record.ticker] = [];
				}
				track[record.ticker].push(record.term);
			}
		});

		require("./sentiment")(users, track, stocks);
	}
);
