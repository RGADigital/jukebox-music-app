var app = app || {};

app.playerMain=(function(w,d,$){

  var elements={
    // buttons
    play: $('#play'),
    stop: $('#stop'),
    pause: $('#pause'),
    previous: $('#previous'),
    next: $('#next'),
  };

  // a global variable that will hold a reference to the api swf once it has loaded
  apiswf = null;
  callback_object = {};

  // store playListId;
  var tracksKeys=[],
      tracksNames=[],
      tracksDuration=[],
      soundIsPlaying=0;

   // on page load use SWFObject to load the API swf into div#apiswf
  var flashvars = {
    'playbackToken': app.token.playback_token, // from token.js
    'domain': app.token.domain,                // from token.js
    'listener': 'callback_object'    // the global name of the object that will receive callbacks from the SWF
    };
  var params = {
    'allowScriptAccess': 'always'
  };
  var attributes = {};
  swfobject.embedSWF('http://www.rdio.com/api/swf/', // the location of the Rdio Playback API SWF
      'apiswf', // the ID of the element that will be replaced with the SWF
      1, 1, '9.0.0', 'expressInstall.swf', flashvars, params, attributes);

  // set up the controls
  var attachEvents=function(){
      //click Play button
      elements.play.click(function(){
          apiswf.rdio_play();
        });

      // click Stop button
      elements.stop.click(function() { apiswf.rdio_stop(); });

      //click Pause button
      elements.pause.click(function() { apiswf.rdio_pause(); });

      //click Previous button
      elements.previous.click(function() {
        if(soundIsPlaying>0){
          soundIsPlaying--;
          apiswf.rdio_play(tracksKeys[soundIsPlaying]);
        }; 
      });

      //click Next button
      elements.next.click(function() {
        if(soundIsPlaying<(playListData[0].tracks.length)){
          soundIsPlaying++;
          apiswf.rdio_play(tracksKeys[soundIsPlaying]);
        };
      });
  };
  var savingData=function(){

    tracksKeys=[];
    tracksNames=[];
    tracksDuration=[];

    var i=0,
        length=playListData[0].tracks.length;

    for(i;i<length;i++){
      tracksKeys[i]=playListData[0].tracks[i].key;
      tracksNames[i]=playListData[0].tracks[i].name;
      tracksDuration[i]=playListData[0].tracks[i].duration;
    };

    console.log(tracksKeys);
    console.log(tracksNames);
    console.log(tracksDuration);


    //move this later
    // $('.playlist-ctn').text(tracksNames);
    $('#playlist').empty();
    var j=0;
    for(j;j<length;j++){
      $('#playlist').append('<li>'+tracksNames[j]+'</li>');
    };
    
  };

 
  // callbacks
  callback_object.ready = function ready(user) {
    // Called once the API SWF has loaded and is ready to accept method calls.
    // find the embed/object element
    apiswf = $('#apiswf').get(0);

    apiswf.rdio_startFrequencyAnalyzer({
      frequencies: '10-band',
      period: 100
    });

    console.log('SWF Object loaded');

    $.ajax({
        url : '/getlist',
        type : 'GET',
        dataType : 'json',
        success : function(res) {
          console.log('success-data from server.js');   
          console.log(res);
          playListData=res;
          savingData();
          apiswf.rdio_play(tracksKeys[soundIsPlaying]);
          
        }
    });

    attachEvents();

    setInterval(function(){
      $.ajax({
          url : '/getlist',
          type : 'GET',
          dataType : 'json',
          success : function(res) {
            console.log('success-data from 2 server.js');   
            playListData=res;
            savingData();
          }
      });
    }, 15000);

  };

  callback_object.freeRemainingChanged = function freeRemainingChanged(remaining) {
    $('#remaining').text(remaining);
  };

  var playing=false;
  callback_object.playStateChanged = function playStateChanged(playState) {
    // The playback state has changed.
    // The state can be: 0 - paused, 1 - playing, 2 - stopped, 3 - buffering or 4 - paused.
    $('#playState').text(playState);

    // if(playState==1){
    //   playing=true;
    //   // console.log('play');
    // }
    // if(playState==2){

    //   if(!playing){
    //     soundIsPlaying++;
    //     apiswf.rdio_play(tracksKeys[soundIsPlaying]);
    //     playing=false;
    //     // console.log('next sound');
    //   };
      
    // };
  };

  callback_object.playingTrackChanged = function playingTrackChanged(playingTrack, sourcePosition) {
    // The currently playing track has changed.
    // Track metadata is provided as playingTrack and the position within the playing source as sourcePosition.
    if (playingTrack != null) {
      $('#track').text(playingTrack['name']);
      $('#album').text(playingTrack['album']);
      $('#artist').text(playingTrack['artist']);
      $('#art').attr('src', playingTrack['icon']);
    };

    // console.log(sourcePosition);
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
    $('#position').text(position);

    if(position>=tracksDuration[soundIsPlaying]){
      soundIsPlaying++;
      apiswf.rdio_play(tracksKeys[soundIsPlaying]);

    };
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

    var arr = arrayAsString.split(',');

    

    $('#freq div').each(function(i) {
      $(this).width(parseInt(parseFloat(arr[i])*500));
    })
  }

  var init=function(){
    
  };

  return {
      init : init,
    };

})(window, document, jQuery);

window.addEventListener('DOMContentLoaded', app.playerMain.init);