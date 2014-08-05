var Rdio=require('./rdio_modules/rdio'),
    RdioCredentials = require('./my_modules/rdio_consumer_credentials.js'),
    express = require('express'),
    app = express(),
    session = require('express-session'),
    http = require('http'),
    io = require('socket.io').listen(9001),
    config = require('config.json')('./config.json');

app.configure(function() {
	app.set('port', process.env.PORT || 8888);
	app.use(express.cookieParser());
	app.use(express.session({ secret: "zzshi1gdsg" }));
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.static(__dirname + '/public'));
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

app.get('/player', function(req, res){
  res.sendfile('public/player.html');
});

app.get('/sidescreen', function(req, res){
  res.sendfile('public/sidescreen.html');
});

app.get('/cleanup', function(req, res){
  console.log('clean up the playlist');
  var accessToken = req.session.accessToken;
  

  if (accessToken) {
      var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET],
                          [accessToken.token, accessToken.secret]);

      rdio.call('getUserPlaylists',{user:config.userID,extras:'tracks'},function(err, data) {
          if (err) {
            console.log(err);
          }

          var playListData=data.result;
          var trackListToCleanup=[];

          var lengthToClean=(playListData[0].tracks.length)-2;
          var i=0;

          for(i;i < lengthToClean;i++){
            trackListToCleanup[i]=playListData[0].tracks[i].key;
          };

          
          
          trackListToCleanup=trackListToCleanup.toString();
          lengthToClean=lengthToClean.toString();
          rdio.call('removeFromPlaylist',{playlist:config.playlistID, index:'0', count:lengthToClean, tracks:trackListToCleanup}, function(err, data) {
            console.log('Musics have been cleaned up from the Jukebox playlist');
            res.redirect('/player');
          })
          
      });

    } else {
      res.redirect("/");
    };
  
});


app.post('/deleteMusic', function(req, res){
  console.log('detele music from the playlist');
  var accessToken = req.session.accessToken;
  var deleteData=req.body
  var lengthToClean=deleteData.lengthToClean.toString();
  var trackListToCleanup=deleteData.tracks.toString();

  // console.log(lengthToClean);
  // console.log(trackListToCleanup);

  if (accessToken) {
    var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET],
                          [accessToken.token, accessToken.secret]);
    rdio.call('removeFromPlaylist',{playlist:config.playlistID, index:'0', count:lengthToClean, tracks:trackListToCleanup}, function(err, data) {});

  } else {
    res.redirect("/");
  };
});

app.get('/getlist', function(req, res){
	console.log('wow getting list');
	var accessToken = req.session.accessToken;
  console.log(accessToken);
	if (accessToken) {
      var rdio = new Rdio([RdioCredentials.RDIO_CONSUMER_KEY, RdioCredentials.RDIO_CONSUMER_SECRET],
                          [accessToken.token, accessToken.secret]);

        rdio.call('currentUser', function(err, data) {
        if (err) {
          console.log(err);
          request.reply(new Error("Error getting current user"));
        };

            var currentUser = data.result;
            console.log(currentUser);
        });

        rdio.call('getUserPlaylists',{user:config.userID,extras:'tracks'},function(err, data) {
          if (err) {
            console.log(err);
          }

          var playListData=data.result;
          console.log(playListData);
          res.send(playListData);
        });

    } else {
      res.redirect("/");
    };
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
        console.log('good');
        res.redirect('/player');
        
      });
    } else {
      res.redirect('/logout');
    }
  
});

app.get('/logout', function(request, result){
	console.log('logout');
});


io.on('connection', function(socket){
  // console.log('connnnnnection----------------');
  socket.on('bit', function(msg){
    io.emit('pot', msg);
  });
});




