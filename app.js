/*jshint: laxcomma:true */

var fs = require('fs');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var hostname = require('os').hostname();
var express = require('express');
var path = require('path');
var cfg = require(path.join(__dirname, 'lib', "config"));
var app = module.exports.app = exports.app = express();
var env = (process.env.NODE_ENV || 'DEVELOPMENT').toLowerCase();
var winston = require('winston');
var npid = require('npid');

//if (cluster.isMaster) {
//  Logger.log("Master is forking workers");
//  for (var i=0; i<numCPUs; ++i) {
//    cluster.fork();
//  }
//  return;
//}

app.use(require('connect-livereload')());

// npid.create(path.join(__dirname, "pids", ("pid." + process.pid) ));
npid.create(path.join(__dirname, "../shared/pids/node.pid"));

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'somefile.log' })
    ]
});

logger.log("Initiating worker, pid:" + process.pid);


app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, '/views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// global controller
app.get('/*',function(req,res,next){
  res.header('Access-Control-Allow-Origin' , 'http://api.guildwars2.com' );
  next(); // http://expressjs.com/guide.html#passing-route control
});

//app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static('app'));

app.get('/', function (req, response) {
    response.status(200).send(path.join(__dirname, 'app', 'index.html'));
});


subcategory_ids = [];


app.listen(app.get('port'), function () {
    logger.log("Express".green.bold + " server listening on port " + (app.get('port') + "").green.bold);
});

logger.log("Started.");
