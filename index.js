require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const port = 3002;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static("public"));

app.set("view engine", "ejs");

//routes
require("./routes")(app);

//sentiment
require("./configureSentiment");

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`);
});
