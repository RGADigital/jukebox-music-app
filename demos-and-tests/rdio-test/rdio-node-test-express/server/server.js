var Rdio=require('./my_modules/rdio'),
	RdioCredentials = require('./rdio_consumer_credentials'),
	express = require('express'),
	app = express(),
	http = require('http');

app.configure(function() {
	app.set('port', process.env.PORT || 8888);
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(request, result){
	
});

app.get('/login', function(request){
	
  var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET]);
  console.log(request.server);
  // var callbackUrl = request.server.info.protocol + "://" + request.info.host + "/callback";
});

app.get('/callback', function(request, result){
	console.log('callback');
});

app.get('/logout', function(request, result){
	console.log('logout');
});



http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});