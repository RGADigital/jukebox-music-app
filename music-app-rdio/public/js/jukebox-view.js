(function(w,d,$,_){

  var ViewControler={

    self:{},//self=this; 

    // buttons
    $play: $('.play'), //play button
    $previous: $('.rewind'),// previous button
    $next: $('.fastforward'),// next button
    $shuffle: $('.shuffle-container'),

    // store playListData;
    playListData:{},
    tracksKeys:[],
    tracksNames:[],
    tracksDurations:[],
    tracksSmallIcon:[],
    tracksAlbumNames:[],
    tracksArtists:[],
    trackKeysForCompare:[],
    soundIsPlaying:0,//which sound is playing
    isShuffle:false,
    isMusicPlaying:false,
    isFirstPlay:true,

    // set up the controls
    attachUIEventS: function(){ 
      //click Play button
      self.$play.click(self.playClickEventHandler);
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

    renderPlaylist:function(soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists){
      $(d).trigger('PLAYLIST_RENDER_EVENT',[soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists]);
    },

    bindrdioDataEvents: function(){
      //run when music player loaded
      $(d).bind('PLAYER_DATA_LOADED_EVENT',self.playerLoadedEventHandler);
      //run everytime after get data from rdio api
      $(d).bind('RDIO_DATA_EVENT',self.rdioDataEventHandler);
      // get music position 
      $(d).bind('MUSIC_POSITION_DATA_EVENT', self.musicPositionEventHandler);
      // $(d).bind('TRACK_INFORMATION_DATA_EVENT',self.trackInformationEventHandler);
    },

    playerLoadedEventHandler: function() {
      console.log('playerLoaded');
    },

    rdioDataEventHandler: function(event,data){
      self.playListData=data;
      self.updataData();

      //play the music at the first time
      if(self.isFirstPlay){
        self.playMusic(self.tracksKeys[self.soundIsPlaying]);//first time play music in the playlist.
        self.isMusicPlaying=true;
        self.isFirstPlay=false;
      }; 
    },

    musicPositionEventHandler: function(event, position){
      // when a music finished what we need to do: next sound/loop the play list/ shuffle
      if(position >= (self.tracksDurations[self.soundIsPlaying]-0.5/*-0.5*/)){
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
    
    //get tracksKeys,trackName, and tracksDurations information from data from rdio api and save them.
    updataData: function(){

      self.tracksKeys=[];
      self.tracksNames=[];
      self.tracksDurations=[];

      var i=0,
      length=self.playListData[0].tracks.length;
      for(i;i < length;i++){
        self.tracksKeys[i]=self.playListData[0].tracks[i].key;
        self.tracksNames[i]=self.playListData[0].tracks[i].name;
        self.tracksDurations[i]=self.playListData[0].tracks[i].duration;
        self.tracksSmallIcon[i]=self.playListData[0].tracks[i].icon;
        self.tracksAlbumNames[i]=self.playListData[0].tracks[i].album;
        self.tracksArtists[i]=self.playListData[0].tracks[i].artist;
      };

      self.playListCompare();
    },

    playListCompare: function(){
      if((self.trackKeysForCompare.toString())!=(self.tracksKeys.toString())){
          self.renderPlaylist(self.soundIsPlaying, self.tracksKeys, self.tracksNames, self.tracksDurations, self.tracksSmallIcon, self.tracksAlbumNames, self.tracksArtists);
          self.trackKeysForCompare=self.tracksKeys;
      }else{
        return
      };
      
    },

    

    init: function() {
      self=this;
      self.attachUIEventS();
      self.bindrdioDataEvents();
    }
  };

  window.addEventListener('DOMContentLoaded', ViewControler.init());

  

})(window, document, jQuery, _);