const db = require("./db");

let track = {};
let users = {};

db.query(
	`SELECT * FROM company
JOIN search ON search.companyId = company.companyId;`,
	function (error, results, fields) {
		if (error) throw error;
		results.forEach((record) => {
			if (record.type == "user") {
				users[parseInt(record.term)] = record.ticker;
			} else if (record.type == "track") {
				if (!track[record.ticker]) {
					track[record.ticker] = [];
				}
				track[record.ticker].push(record.term);
			}
		});

		require("./sentiment")(users, track);
	}
);
