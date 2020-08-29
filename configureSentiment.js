const db = require("./db");

let track = [];
let users = [];
let records = {};

db.query(
	`SELECT * FROM company
JOIN search ON search.companyId = company.companyId;`,
	function (error, results, fields) {
		if (error) throw error;
		results.forEach((record) => {
			if (!records[record.ticker]) {
				records[record.ticker] = { users: [], track: [] };
			}

			if (record.type == "user") {
				users.push(parseInt(record.term));
				records[record.ticker].users.push(parseInt(record.term));
			} else if (record.type == "track") {
				track.push(record.term);
				records[record.ticker].track.push(record.term);
			}
		});
		users
			.sort(function (a, b) {
				return b - a;
			})
			.reverse();

		require("./sentiment")(users, track);
	}
);
