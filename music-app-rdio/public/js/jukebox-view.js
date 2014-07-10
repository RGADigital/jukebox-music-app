(function(w,d,$,_){

  var View={

    self:{},//self=this; 

    // buttons
    $play: $('#Play'), //play button
    $pause: $('#pause'), //pause button
    $previous: $('#Rewind'),// previous button
    $next: $('#fastforward'),// next button
    $shuffle: $('#shuffle'),
    //track information
    $trackName: $('#track'),
    $artistName: $('#artist'),
    $albumCover: $('#art'),
    $timeStamp: $('#position'),

    // store playListData;
    playListData:{},
    tracksKeys:[],
    tracksNames:[],
    tracksDuration:[],
    soundIsPlaying:0,//which sound is playing
    isShuffle:false,
    isMusicPlaying:false,

    // set up the controls
    attachUIEventS: function(){ 
      //click Play button
      self.$play.click(self.playClickEventHandler);
      //click Pause button
      self.$pause.click(self.pauseMusic);
      //click Previous button
      self.$previous.click(self.previousClickEventHandler);
      //click Next button
      self.$next.click(self.nextClickEventHandler);
      //click shuffle button
      self.$shuffle.click(self.shuffleClikcEventHandler);
    },

    shuffleClikcEventHandler: function(event) {
        self.isShuffle =! self.isShuffle;
        console.log('shuffle: '+self.isShuffle);
    },

    playClickEventHandler: function(){

      console.log('click play');
      if(self.isMusicPlaying){
        //pauseMuisc
        self.pauseMusic();
        self.$play.text('play');
      }else{
        //playMusic
        self.playMusic();
        self.$play.text('pause');
      };
      self.isMusicPlaying =! self.isMusicPlaying;      
    },

    previousClickEventHandler: function() {
        if(self.soundIsPlaying > 0){
            self.soundIsPlaying--;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };
        console.log('previous');  
    },

    nextClickEventHandler: function() {
      if(self.soundIsPlaying < (self.playListData[0].tracks.length)){
        self.soundIsPlaying++;
        self.playMusic(self.tracksKeys[self.soundIsPlaying]);
      };
      // console.log(self);
    },

    //broadcastStation is used to store the jquery broadcast function 'trigger'.
    playMusic: function(id){
      $(d).trigger('PLAY_MUSIC_EVENT',[id]);
    },

    pauseMusic: function(){
      $(d).trigger('PAUSE_MUSIC_EVENT');
    },

    bindrdioDataEvents: function(){
      //run when music player loaded
      $(d).bind('PLAYER_DATA_LOADED_EVENT',self.playerLoadedEventHandler);
      //run everytime after get data from rdio api
      $(d).bind('RDIO_DATA_EVENT',self.getRdioDataEventHandler);
      // get music position 
      $(d).bind('MUSIC_POSITION_DATA_EVENT', self.getMusicPositionEventHandler);
      $(d).bind('TRACK_INFORMATION_DATA_EVENT',self.getTrackInformationEventHandler);
    },

    playerLoadedEventHandler: function() {
      console.log('playerLoaded');
    },

    getRdioDataEventHandler: function(event,data){
      self.playListData=data;
      self.updataData();
      self.playMusic(self.tracksKeys[self.soundIsPlaying]);//first time play music in the playlist.
      self.isMusicPlaying=true;
    },

    getMusicPositionEventHandler: function(event, position){
      var time=parseInt(position);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      self.$timeStamp.text(minutes+':'+seconds);
      // when a music finished what we need to do: next sound/loop the play list/ shuffle
      if(position >= (self.tracksDuration[self.soundIsPlaying]-0.5/*-0.5*/)){
        if(self.isShuffle){
          //shuffle the playlist and play randomly
          self.soundIsPlaying=_.random(0, (self.playListData[0].tracks.length-1));
          self.playMusic(self.tracksKeys[self.soundIsPlaying]); 
        }else{
          if(self.soundIsPlaying == (self.playListData[0].tracks.length-1)){
            //loop after the playlist finish
            self.soundIsPlaying=0;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          }else{
            //play next music after one music finish
            self.soundIsPlaying++;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          };
        }; 
      };
    },

    getTrackInformationEventHandler:function(event, trackName, artist, art){
      self.$trackName.text(trackName);
      self.$artistName.text(artist);
      self.$albumCover.attr('src', art);
    },

    //get tracksKeys,trackName, and tracksDuration information from data from rdio api and save them.
    updataData: function(){

      self.tracksKeys=[];
      self.tracksNames=[];
      self.tracksDuration=[];

      var i=0,
      length=self.playListData[0].tracks.length;
      // console.log(length);

      for(i;i < length;i++){
        self.tracksKeys[i]=self.playListData[0].tracks[i].key;
        self.tracksNames[i]=self.playListData[0].tracks[i].name;
        self.tracksDuration[i]=self.playListData[0].tracks[i].duration;
      };
      // console.log(self.tracksDuration);

      //move later
      // $('#playlist').empty();
      // var j=0;
      // for(j;j<length;j++){
      //   $('#playlist').append('<li>'+tracksNames[j]+'</li>');
      // }; 
    },

    init: function() {

      self=this;
      self.attachUIEventS();
      self.bindrdioDataEvents();
      
    }
  };

  View.init();

})(window, document, jQuery, _);