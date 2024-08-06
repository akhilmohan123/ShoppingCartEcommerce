var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const MongoStore = require('connect-mongo');
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var hbs = require("express-handlebars");
var app = express();
var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var session = require("express-session");
 require("dotenv").config()
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partial/",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
const store = MongoStore.create({
  mongoUrl: process.env.DB_URL, // Your MongoDB connection string
  collectionName: 'sessions'
});
app.use(
  session({
    secret: "Key",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
    store:store
  })
);
db.connect((err) => {
  if (err) {
    console.log("database connection error" + err);
  } else {
    console.log("database connected");
  }
});
app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
