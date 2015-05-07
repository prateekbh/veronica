var Browser = require("zombie");
var express = require('express');

var app = express();
var browser = new Browser();


app.get('/', function (req, res) {
  browser.visit("http://localhost:8080/", function () {
  	res.send(browser.html());
  });
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});