var Rdio=require('./my_modules/rdio'),
	RdioCredentials = require('./rdio_consumer_credentials'),
	express = require('express'),
	app = express(),
	session = require('express-session'),
	http = require('http');

app.configure(function() {
	app.set('port', process.env.PORT || 8888);
	app.use(express.cookieParser());
	app.use(express.session({ secret: "zzshi1gdsg" }));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});


app.get('/getPlayList', function(req, res){
	console.log('wow getting list');
	var accessToken = req.session.accessToken;
	if (accessToken) {
      var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET],
                          [accessToken.token, accessToken.secret]);
      rdio.call('currentUser', function(err, data) {
        if (err) {
          console.log(err);    
        }
      	var currentUser = data.result;
      	console.log(currentUser);

        rdio.call('getPlaylists',function(err, data) {
          if (err) {
            console.log(err);
          }
          var playlists = data.result.owned;
          console.log(playlists);
        });
      });
    } else {
     
    }

});

app.get('/login', function(req, res){

	console.log('login');
	var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET]);
	var callbackUrl = req.protocol + "://" + req.host+":"+ app.get('port')+ "/callback";
	
	rdio.beginAuthentication(callbackUrl, function(err, authUrl) {
	  	if (err) {
	    	console.log(err);
	        req.reply(new Error("Error beginning authentication"));
	    }


	    req.session.requestToken= {
	    	token: rdio.token[0],
          	secret: rdio.token[1]
	    };

	    res.redirect(authUrl);
	});
});

app.get('/callback', function(req, res){
	console.log('callback');
	var requestToken = req.session.requestToken;
	var verifier = req.query.oauth_verifier;

	if (requestToken && verifier) {
      // exchange the request token and verifier for an access token.
      var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET],
                          [requestToken.token, requestToken.secret]);
      rdio.completeAuthentication(verifier, function(err) {
        if (err) {
          console.log(err);
          // req.reply(new Error("Error completing Authentication"));
        }

        req.session.accessToken= {
          token: rdio.token[0],
          secret: rdio.token[1]
        };

        // req.session.clear('reqToken');
        console.log('good')
        res.redirect('/getPlayList');
      });
    } else {
      res.redirect('/logout');
    }
  
});

app.get('/logout', function(request, result){
	console.log('logout');
});



http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});