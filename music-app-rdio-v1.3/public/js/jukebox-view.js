(function(w,d,$){

  var View={

    self:{},//self=this; 

    // buttons
    $play: $('#play'), //play button
    $pause: $('#pause'), //pause button
    $previous: $('#previous'),// previous button
    $next: $('#next'),// next button
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
    shuffle:false,

    // set up the controls
    attachEvent: function(){ 
      //click Play button
      self.$play.click(self.playMusic);
      //click Pause button
      self.$pause.click(self.pauseMusic);
      //click Previous button
      self.$previous.click(self.previousClickEventHandler);
      //click Next button
      self.$next.click(self.nextClickEventHandler);
    },

    previousClickEventHandler: function() {
        if(self.soundIsPlaying>0){

            self.soundIsPlaying--;
            console.log(self.soundIsPlaying);
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };

        console.log('previous');  
    },

    nextClickEventHandler: function() {
      if(self.soundIsPlaying<(self.playListData[0].tracks.length)){
        self.soundIsPlaying++;
        console.log(self.soundIsPlaying);
        self.playMusic(self.tracksKeys[self.soundIsPlaying]);
      };
      // console.log(self);
    },
    //broadcastStation is used to store the jquery broadcast function 'trigger'.
    playMusic: function(id){
      console.log('play');
      $(d).trigger('PLAY_MUSIC_EVENT',[id]);
    },
    pauseMusic: function(){
      $(d).trigger('PAUSE_MUSIC_EVENT');
    },
    previousMusic: function(){
      $(d).trigger('PREVIOUS_MUSIC_EVENT');
    },
    nextMusic: function(){
      $(d).trigger('NEXT_MISIC_EVENT');
    },

    bindEvents: function(){
      //run when music player loaded
      $(d).bind('PLAYE_LOADED_EVENT',function() {
        console.log('playerLoaded');
      });
      //run everytime after get data from rdio api
      $(d).bind('GET_RDIO_DATA_EVENT',self.getRdioDataEventHandler);
      // get music position 
      $(d).bind('GET_MUSIC_POSITION_EVENT', self.getMusicPositionEventHandler);

      $(d).bind('GET_TRACK_INFORMATION_EVENT',self.getTrackInformationEventHandler);
    },
    playerLoadedEventHandler: function() {
      //code goes here
      console.log('playerLoaded');
    },
    getRdioDataEventHandler: function(event,data){
      self.playListData=data;
      self.updataData();
      self.playMusic(self.tracksKeys[self.soundIsPlaying]);//play First music in the playlist.
    },
    getMusicPositionEventHandler: function(event, position){
      self.$timeStamp.text(position);
      // when a music finished what we need to do: next sound/loop the play list/ shuffle
      if(position>=(self.tracksDuration[self.soundIsPlaying]-0.5/*-0.5*/)){
            self.soundIsPlaying++;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
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

      for(i;i<length;i++){
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
      self.attachEvent();
      self.bindEvents();
      
    }
  };

  View.init();

})(window, document, jQuery);