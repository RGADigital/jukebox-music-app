var Rdio=require('./rdio_modules/rdio'),
    RdioCredentials = require('./my_modules/rdio_consumer_credentials.js'),
    express = require('express'),
    app = express(),
    session = require('express-session'),
    http = require('http'),
    io = require('socket.io').listen(9001),
    config = require('config.json')('./config.json');

var clientLinked=true,
    playlistDataFromRdio,
    maxSoundsKeepInPlaylist=config.maxSoundsKeepInPlaylist; //change this number in config.json

var numUsers=0,
    usernamesList = {};


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
  res.sendfile('public/sketch_test.html');
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

          if(data.result){
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
              console.log('Musics have been cleaned up from the playlist');
              res.redirect('/player');
            });
          };
          
      });

    } else {
      res.redirect("/");
    };
  
});

app.get('/getlist', function(req, res){
	var accessToken = req.session.accessToken;
	if (accessToken) {
    res.send(playlistDataFromRdio);
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

        var accessToken = req.session.accessToken;

        if(accessToken){

          rdio.call('getUserPlaylists',{user:config.userID,extras:'tracks'},function(err, data) {
            if (err) {
              console.log(err);
            }
            playlistDataFromRdio=data.result;
            // console.log(playlistDataFromRdio);
            res.redirect('/player');
          });

          /* Check the playListData with Rdio.com every 15 seconds.*/
          intervalGettingData = setInterval(function(){
            if(numUsers>0){
              rdio.call('getUserPlaylists',{user:config.userID,extras:'tracks'},function(err, data) {
                if (err) {
                  console.log(err);
                  return
                };

                if(data){
                  var playListData=data.result;
                  var lengthOfPlaylist=playListData[0].tracks.length;
                  /**
                    * delete some musics if the playlist is longer than maxSoundsKeepInPlaylist.
                    * If the playlist is too long we will delete some music from the playlist first
                    * and update our playlistDataFromRdio object next time.
                    */
                  if(lengthOfPlaylist>maxSoundsKeepInPlaylist){
                    console.log('delete music because the playlist is too long');

                    var lengthToDelete=lengthOfPlaylist-maxSoundsKeepInPlaylist;
                    var tracksToDelete=[];
                    var i=0;
                    for(i; i < lengthToDelete; i++){
                      tracksToDelete[i]=playListData[0].tracks[i].key;
                    };

                    tracksToDelete=tracksToDelete.toString();
                    lengthToDelete=lengthToDelete.toString();

                    rdio.call('removeFromPlaylist',{playlist:config.playlistID, index:'0', count:lengthToDelete, tracks:tracksToDelete}, function(err, data) {
                      console.log('some musics have been removed from playlist');
                    });
                  }else{
                    playlistDataFromRdio=playListData;
                    // console.log(playlistDataFromRdio);
                    console.log('update playlist data with RDIO');
                  };
                }else{
                  return
                }; 
              });
            };
          }, 15000);

        }else{
          res.redirect("/");
        };
      });
    } else {
      res.redirect('/logout');
    };
});

app.get('/logout', function(request, result){
	console.log('logout');
});


io.on('connection', function(socket){

  var IsAMainScreenUser=false;

  socket.on('add mainscreen user', function(username){
    console.log('Hi!connected with:'+ username);
    usernamesList[username]=username;
    ++numUsers;
    console.log('-----User Number:'+ numUsers);
    socket.username = username;
    IsAMainScreenUser=true;

    // test
    io.emit('userList',usernamesList);
  });

  


  socket.on('disconnect', function(){
    if(IsAMainScreenUser){
      console.log('Disconnected:'+ socket.username);
      --numUsers;
      console.log('-----User Number:'+ numUsers);
    };
  });

  socket.on('bit', function(msg){
    io.emit(socket.username, {
      userName: socket.username,
      fData: msg
    });
  });
});



