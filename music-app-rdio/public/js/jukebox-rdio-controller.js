/** jukebox-rdio-controller takes care about the communication between Jukebox and Rdio. */
(function(w,d,$){
  
  apiswf = null; // a global variable that will hold a reference to the api swf once it has loaded.
  callback_object = {}; // This object is used to get callback information from rdio Web Playback Api.
  var socket=io.connect(window.location.hostname.toString()+':9001'); //port for websocket.

  /** jRdioController module is a module which takes care about the communication between Jukebox and Rdio. */
  var RdioController={
    self:{}, // sefl=this of RdioController
    
    /** flashvars, params and attributes are used for swfobject.embedSWF*/
    flashvars: {
      'playbackToken':'', //token is based on domain, you can change it in config.json. (http://www.rdio.com/developers/docs/web-service/methods/playback/ref-web-service-method-getplaybacktoken)
      'domain': window.location.hostname.toString(), //the domain of app         
      'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
    },
    params: {
      'allowScriptAccess': 'always'
    },
    attributes: {},

    
    embedSWF: function(){
      /** on page load use SWFObject to load the API swf into div#apiswf*/
      swfobject.embedSWF(
        'http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
        'apiswf', // the ID of the element that will be replaced with the SWF
        1, 1, '9.0.0', 'expressInstall.swf', RdioController.flashvars, RdioController.params, RdioController.attributes
      );
    },

    /** bindEvents is taking care of all the .bind function */
    bindEvents: function(){
      $(d).bind('PLAY_MUSIC_EVENT',self.playMusicEventHandler);
      $(d).bind('PAUSE_MUSIC_EVENT',self.pauseMusicEventHandler);
    },

    /**
      * Let the Rdio playback api play the music.
      * @param {string} musicKey - The id of the music from Rdio api.
      */
    playMusicEventHandler: function(event, musicKey){
      if(musicKey){
        /** playing a music when we have the musicKey(id) */
        apiswf.rdio_play(musicKey);
      }else{
        /** continue the music if it is paused. */
        apiswf.rdio_play();
      };
    },

    /** Pause the playing music. */
    pauseMusicEventHandler: function(){
        apiswf.rdio_pause();
    },

    /** Run after the music player loaded*/
    playerLoaded: function(){
      /** Make a broadcast to let the other modules know the music player has been loaded. */
      $(d).trigger('PLAYER_DATA_LOADED_EVENT');
    },

    /**
     *broadcast playlist data from Rdio api
     *@param {object} data - the playlist data from ajax call.
     */
    rdioData: function(data){
      /** Make a broadcast with music playlist data. */
      $(d).trigger('RDIO_DATA_EVENT',[data]);
    },

    /**
     *broadcast when position of current playing music changes.
     *@param {float} position - position of current playing music.
     */
    musicPosition: function(position){
      /** Make a broadcast with position data with current playing music. */
      $(d).trigger('MUSIC_POSITION_DATA_EVENT',[position]);
    },

    /**
     *broadcast when frequency of current playing music changes.
     *@param {string} frequency - frequency of current playing music.
     */
    musicFrequencyData:function(frequency){
      /** Make a broadcast with frequency of current playing music, which is used in our frequency data visualizer. */
      $(d).trigger('MUSIC_FREQUENCY_DATA_EVENT',[frequency]);
    },

    /**
     *broadcast when playing track changes.
     *@param {string} trackName - Name of playing track.
     *@param {string} artist - Name of artist.
     *@param {string} art - The URL for album cover.
     */
    trackInformation: function(trackName, artist, art){
      /** Make a broadcast with trackname, artist, the url of album cover data. */
      $(d).trigger('TRACK_INFORMATION_DATA_EVENT',[trackName, artist, art]);
    },

    /** Get the first playlist data from the server. */
    callForDataFromServer:function(){
      /** Make a ajax call to /getlist to get the Jukebox playlist data. */
      $.ajax({
        url : '/getlist',
        type : 'GET',
        dataType : 'json',
        success : function(res) {
          console.log('success data from server.js');
          /** when we got the data from our server, we make a broadcast with playlist data. */
          RdioController.rdioData(res);
        }
      });
    },

    /** Continually make ajax call to update the playlist data. */
    intervalcallForDataFromServer:function(){
      /** Make a ajax call to /getlist to update the Jukebox playlist data every 15 seconds. */
      setInterval(function(){
        $.ajax({
          url : '/getlist',
          type : 'GET',
          dataType : 'json',
          success : function(res) { 
            /** when we got the data from our server, we make a broadcast with playlist data. */
            RdioController.rdioData(res);
          }
        });
      }, 15000);/** setting the interval time 15000=15 seconds*/
    },

    /*Callbacks from Rdio Web Playback API */
    rdioPlayerApiCallbacks: function(){

      callback_object.ready = function ready(user) {
      // Called once the API SWF has loaded and is ready to accept method calls.
      // find the embed/object element
        apiswf = $('#apiswf').get(0);

        apiswf.rdio_startFrequencyAnalyzer({
          frequencies: '10-band',
            period: 100
        });
        /** Make a broadcast to let the all of the modules know the music player has been loaded. */
        RdioController.playerLoaded();
        /** Get the playlist data from server after the callback object is loaded, which is our music player object. */
        RdioController.callForDataFromServer();
        /** Keep updating the playlist data from server after the callback object is loaded, which is our music player object. */
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
        // Broadcast the music freqency data for websocket moudle.
        RdioController.musicFrequencyData(arrayAsString);
      };
    },

    /** 
     * Change the authentication token base on different domains. One for production and one for development.
     * You can change the production domain and token in config.json (public>js).
     */
    configDomain:function(){
      var configData; // The config data comes from config.json. 
      $.getJSON("js/config.json", function(data) {
        configData=data;
        /** If the domain is localhost, we start the app with development playbackToken. */
        if(window.location.hostname.toString()=="localhost"){
          RdioController.flashvars.playbackToken=configData.development.playbackToken;
        }else{
          /** If the domain is localhost, we start the app with production playbackToken. Thie token can be changed in config.json */
          RdioController.flashvars.playbackToken=configData.production.playbackToken;
        };
        RdioController.embedSWF();
      });      
    },

    init:function(){
      self=this;
      self.configDomain();
      self.bindEvents();
      self.rdioPlayerApiCallbacks();
    }
  };

  RdioController.init();
	
})(window,document,jQuery);
