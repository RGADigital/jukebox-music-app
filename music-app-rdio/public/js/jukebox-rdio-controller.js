(function(w,d,$){

  // a global variable that will hold a reference to the api swf once it has loaded
  apiswf = null;
  callback_object = {};
  var socket=io.connect(window.location.hostname.toString()+':9001');

  var RdioController={
    self:{},

    playbackTokenLocalhost:'GAlT2-gd_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmxvY2FsaG9zdEnTiN6mOqxUbAhvRbIuYBU=',
    playbackTokenJukebox:'GA9T2-LJ_____2R2cHlzNHd5ZXg3Z2M0OXdoaDY3aHdrbmp1a2Vib3gucmdhLmNvbXsjds3psyhtYbyNxq6uQ1o=',



    // on page load use SWFObject to load the API swf into div#apiswf
    flashvars: {
      'playbackToken':'', //token is based on domain (http://www.rdio.com/developers/docs/web-service/methods/playback/ref-web-service-method-getplaybacktoken)
      'domain': window.location.hostname.toString(),                // from token.js
      'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
    },
    params: {
      'allowScriptAccess': 'always'
    },
    attributes: {},

    embedSWF: function(){
      swfobject.embedSWF(
        'http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
        'apiswf', // the ID of the element that will be replaced with the SWF
        1, 1, '9.0.0', 'expressInstall.swf', self.flashvars, self.params, self.attributes
      );
    },

    bindEvents: function(){
      $(d).bind('PLAY_MUSIC_EVENT',self.playMusicEventHandler);
      $(d).bind('PAUSE_MUSIC_EVENT',self.pauseMusicEventHandler);
    },

    playMusicEventHandler: function(event, musicKey){
      if(musicKey){
        apiswf.rdio_play(musicKey);
      }else{
        apiswf.rdio_play();
      };
    },

    pauseMusicEventHandler: function(){
        apiswf.rdio_pause();
    },

    playerLoaded: function(){
      $(d).trigger('PLAYER_DATA_LOADED_EVENT');
    },

    rdioData: function(data){
      $(d).trigger('RDIO_DATA_EVENT',[data]);
    },

    musicPosition: function(position){
      $(d).trigger('MUSIC_POSITION_DATA_EVENT',[position]);
    },

    trackInformation: function(trackName, artist, art){
      $(d).trigger('TRACK_INFORMATION_DATA_EVENT',[trackName, artist, art]);
    },

    callForDataFromServer:function(){
      $.ajax({
        url : '/getlist',
        type : 'GET',
        dataType : 'json',
        success : function(res) {
          console.log('success data from server.js');
          console.log(res);
          RdioController.rdioData(res);
          
        }
      });
    },

    intervalcallForDataFromServer:function(){
      setInterval(function(){
        $.ajax({
          url : '/getlist',
          type : 'GET',
          dataType : 'json',
          success : function(res) {
            console.log('success-data from 2 server.js');   
            RdioController.rdioData(res);
          }
        });
      }, 15000);
    },

    // call backs of player
    rdioPlayerApiCallbacks: function(){

      callback_object.ready = function ready(user) {
      // Called once the API SWF has loaded and is ready to accept method calls.
      // find the embed/object element
        apiswf = $('#apiswf').get(0);

        apiswf.rdio_startFrequencyAnalyzer({
          frequencies: '10-band',
            period: 100
        });
        RdioController.playerLoaded();
        RdioController.callForDataFromServer();
        RdioController.intervalcallForDataFromServer();
      };

      callback_object.freeRemainingChanged = function freeRemainingChanged(remaining) {};
      callback_object.playStateChanged = function playStateChanged(playState) {
        // The playback state has changed.
        // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
      };
      callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePosition) {
        // The currently playing track has changed.
        // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
        if (playingTrack != null) {
          RdioController.trackInformation(playingTrack['name'], playingTrack['artist'], playingTrack['bigIcon']);
          // console.log(playingTrack);
        };
      };
      callback_object.playingSourceChanged = function playingSourceChanged(playingSource) {
        // The currently playing source changed.
        // The source metadata, including a track listing is inside playingSource.
      };

      callback_object.volumeChanged = function volumeChanged(volume) {
        // The volume changed to volume, a number between 0 and 1.
      };

      callback_object.muteChanged = function muteChanged(mute) {
          // Mute was changed. mute will either be true (for muting enabled) or false (for muting disabled).
      };
      callback_object.positionChanged = function positionChanged(position) {
        //The position within the track changed to position seconds.
        // This happens both in response to a seek and during playback.
        RdioController.musicPosition(position);
      };
      callback_object.queueChanged = function queueChanged(newQueue) {
        // The queue has changed to newQueue.
      };

      callback_object.shuffleChanged = function shuffleChanged(shuffle) {
        // The shuffle mode has changed.
        // shuffle is a boolean, true for shuffle, false for normal playback order.
      };

      callback_object.repeatChanged = function repeatChanged(repeatMode) {
        // The repeat mode change.
        // repeatMode will be one of: 0: no-repeat, 1: track-repeat or 2: whole-source-repeat.
      };

      callback_object.playingSomewhereElse = function playingSomewhereElse() {
        // An Rdio user can only play from one location at a time.
        // If playback begins somewhere else then playback will stop and this callback will be called.
      };
      callback_object.updateFrequencyData = function updateFrequencyData(arrayAsString) {
        // Called with frequency information after apiswf.rdio_startFrequencyAnalyzer(options) is called.
        // arrayAsString is a list of comma separated floats.
        // var arr = arrayAsString.split(',');
        // $('#freq div').each(function(i) {
        //      $(this).width(parseInt(parseFloat(arr[i])*500));
        // })
        // console.log(arrayAsString);
        socket.emit('bit', arrayAsString);
      
      };

    },

    configDomain:function(){
      
      $.getJSON("config.json", function() {
        console.log( "success" );
      });

      if(window.location.hostname.toString()=="localhost"){
        self.flashvars.playbackToken=self.playbackTokenLocalhost;
      }else if(window.location.hostname.toString()=="jukebox.rga.com"){
        self.flashvars.playbackToken=self.playbackTokenJukebox;
      }else{
        console.log('change the token');
      };

    },

    init:function(){
      $(d).trigger('GET_RDIO_DATA_EVENT');
      self=this;
      self.configDomain();
      self.embedSWF();
      self.bindEvents();
      self.rdioPlayerApiCallbacks();
      
    }


  };

  RdioController.init();
	
})(window,document,jQuery);
