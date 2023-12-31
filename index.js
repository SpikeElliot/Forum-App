// Import required modules
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const cookieParser = require("cookie-parser");
const bodyParser= require('body-parser');
const mysql = require('mysql');

// Create the express application object
const app = express();
const port = 8000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: "user",
    saveUninitialized: false,
    resave: true
}));

// Set up css
app.use(express.static(__dirname + '/public'));

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'forumuser',
    password: 'app2027',
    database: 'myforum'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// Define our data
var forumData = {forumName: "Spike's Forum"};

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, forumData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));