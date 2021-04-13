const express = require('express');
const path = require("path");
const app = express();
const port = process.env.PORT || "3000";
const consolidate = require('consolidate');

// view engine setup
app.engine('html', consolidate.swig); // TODO: swig is deprecated
app.set('/views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// serve static assets
app.use('/js', express.static('js'));

// routing
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/second', function (req, res) {
  res.render('second');
});
app.get('/gcash_mini_programs/onboarding', function (req, res) {
  res.render('onboarding');
});

// on listen
app.listen(port, () => {
  console.log(`Listening to requests on https://localhost:${port}`);
});
