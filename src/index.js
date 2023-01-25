const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");
require("dotenv").config();

app.use(cors());

// for parsing application/json
app.use(express.json());

// for parsing application/xwww-
app.use(express.urlencoded({extended: false}));
//form-urlencoded

app.use(express.static(path.join(__dirname, "public")));

//=== 2 - SET UP DATABASE
//Configure mongoose's promise to global promise

const connUri =
    process.env.TYPE == "DEVELOPMENT"
        ? process.env.MONGO_LOCAL_CONN_URL
        : process.env.MONGO_SERVER_CONN_URL;
console.log(connUri);
mongoose.promise = global.Promise;
mongoose.connect(connUri);

const connection = mongoose.connection;
connection.once("open", () =>
    console.log("Database connection established successfully!")
);

connection.on("error", (err) => {
    console.log(
        "MongoDB connection error. Please make sure MongoDB is running. " + err
    );
    process.exit();
});

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());

require("./middlewares/jwt")(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
const routes = require("./routes/index");
app.use("/", routes);

//=== 5 - START SERVER

app.listen(PORT, () => console.log("App is listening to port ", PORT));
