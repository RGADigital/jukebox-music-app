/* View module's job is taking care of interaction on the screen and logic of music player*/

(function(w,d,$,_){

  var ViewControler={

    self:{},//self=this; 

    /* DOM button element. */
    $play: $('.play'), //play button
    $previous: $('.rewind'),// previous button
    $next: $('.fastforward'),// next button
    $shuffle: $('.shuffle-container'),
		$theme: $('#theme-switcher'),

    playListData:{}, // Object to store playlist data gotten from server.
    tracksKeys:[], // Array of tracks keys(id) in playlist.
    tracksNames:[], // Array of tracks name in playlist.
    tracksDurations:[], // Array of tracks duations in playlist.
    tracksSmallIcon:[], // Array of tracks small size album covers urls in playlist.
    tracksAlbumNames:[], // Array of tracks album names in playlist.
    tracksArtists:[], // Array of tracks artists names in playlist.
    trackKeysForCompare:[], //Array used to compare current and previous playlist data after update.
    soundIsPlaying:0,//The number of playing musisc in the playlist. It is super important in our app. It is a pointer tells our app which music to play.
    isShuffle:false, // If shuffle is open, isShuffle=true.
    isMusicPlaying:false,// If music is play, isMusicPlaying=true.
    isFirstPlay:true, //isFirstPlay=true, we start to playmusic after we get the playlist data at the first time.
    myScroll:{}, // The object for iScroll.
    easingLevelForShuffle:15, //The easing leave when we are in shuffle mode. EX.shuffle range MUSIC_IS_PLAY-15 < MUSIC_IS_PLAY > MUSIC_IS_PLAY+15

    /*set up the touch event controlers.*/
    attachUIEventS: function(){ 
      /** click Play button */
      self.$play.click(self.playClickEventHandler);
      /** click Previous button */
      self.$previous.click(self.previousClickEventHandler);
      /** click Next button */
      self.$next.click(self.nextClickEventHandler);
      /** click shuffle button */
      self.$shuffle.click(self.shuffleClikcEventHandler);
			/** click theme */
			self.$theme.click(self.themeClickEventHandler);
    },

		/** After click the shuffle button */
		themeClickEventHandler: function(event) {
			var $body = $("body");

			if($body.hasClass("dark-theme")) {
				$body.removeClass("dark-theme").addClass("light-theme");
			}else {
				$body.removeClass("light-theme").addClass("dark-theme");
			}
		},

    /** After click the shuffle button */
    shuffleClikcEventHandler: function(event) {
        /** change the shuffle status */
        self.isShuffle =! self.isShuffle;
        console.log('shuffle: '+self.isShuffle);
        if(self.isShuffle){
          /** If it is shuffle mode, add .isShuffleOn to shuffle button on the screen, it will be changed to green. */
          self.$shuffle.removeClass('isShuffleOn')
          self.$shuffle.toggleClass('isShuffleOn');
        }else{
          /** If it is not the shuffle mode, change the shuffle button to original color. */
          self.$shuffle.removeClass('isShuffleOn');
        };
    },

    /** After click the Play button, play or pasue the music */
    playClickEventHandler: function(){
      if(self.isMusicPlaying){
        /** If music is playing, pause the music. */
        self.pauseMusic();
        /** Change the pause icon to play icon */
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[false]);
      }else{
        /** If music is paused, continually play the music. */
        self.playMusic();
        /** Change the play icon to pause icon */
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
      };  
    },

    /** After click the Previous button */
    previousClickEventHandler: function() {
      /** If the playing music is the first music in the playlist, we won't do anything. Becasue there is no previous music. */
      if(self.soundIsPlaying > 0){
        /** Change the pause icon to play icon */
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        /** Check shuffle status first. */
        if(self.isShuffle){
          /** the algorithm for Shuffling the music */
          self.soundIsPlaying=self.randomNmuberWithEasing(self.easingLevelForShuffle, self.soundIsPlaying);
          /** play a random music in playlist. */
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        }else{
          /** Change the soundIsPlaying number to previous music. */
          self.soundIsPlaying--;
          /** Play previous music */
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };   
      }; 
    },

    /** After click the Next button */
    nextClickEventHandler: function() {
      /** If the playing music is the last music in the playlist, we won't do anything. Becasue there is no next music. */
      if(self.soundIsPlaying < (self.playListData[0].tracks.length-1)){
        /** Change the pause icon to play icon */
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        /** Check shuffle status first. */
        if(self.isShuffle){
          /** the algorithm for Shuffling the music. */
          self.soundIsPlaying=self.randomNmuberWithEasing(self.easingLevelForShuffle, self.soundIsPlaying);
          /** play a random music in playlist. */
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        }else{
          /** Change the soundIsPlaying number to next music. */
          self.soundIsPlaying++;
          /** Play next music */
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        };
      }; 
    },

    /**
      * Play the muisc by id and change the play button icon.
      * @param {string} id - the musicKey.
      */
    playMusic: function(id){
      var orderNumber=self.soundIsPlaying == 0 ? 1 : self.soundIsPlaying;
      /** play muisc by id(musicKey) */
      $(d).trigger('PLAY_MUSIC_EVENT',[id]);
      /** change the play icon in playlist in PlayListItem Module. */
      $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[self.soundIsPlaying]);
      /** scroll the playlist */
      self.autoIscroll();
    },

    /** Pause the music */
    pauseMusic: function(){
      $(d).trigger('PAUSE_MUSIC_EVENT');
    },

    /** Send playlist data to render module, and render module start to render the playlist with these data. */
    renderPlaylist:function(soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists){
      $(d).trigger('PLAYLIST_RENDER_EVENT',[soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists]);
    },

    /** Playlist auto scroll */
    autoIscroll: function(){
      var orderNumber=self.soundIsPlaying == 0 ? 1 : self.soundIsPlaying;
      /** iscroll auto scroll */
      self.myScroll.scrollToElement(document.querySelector('.playlist-content li:nth-child('+orderNumber+')'));
    },

    /** bindEvents is taking care of all the .bind functions */
    bindDataEvents: function(){
      /** run when music player loaded. */
      $(d).bind('PLAYER_DATA_LOADED_EVENT',self.playerLoadedEventHandler);
      /** run after get data from rdio api. */
      $(d).bind('RDIO_DATA_EVENT',self.rdioDataEventHandler);
      /** get music position. */
      $(d).bind('MUSIC_POSITION_DATA_EVENT', self.musicPositionEventHandler);
      /** get soundisplaying number from PlaylistItem. */
      $(d).bind('CHANGE_SOUNDISPLAYING_EVENT', self.changeSoundisPlayingEventHandler);
      /** get isMusicPlaying status from View and PlaylistItem. */
      $(d).bind('CHANGE_ISMUSICPLAYING_STATUS_EVENT', self.changeIsMuicPlayingStatusEventHandler);
      /** Start to initialize iscroll. */
      $(d).bind('INITIAL_ISCROLL_EVENT', self.initialIscrollEventHandler);
    },

    /** run when music player loaded. */
    playerLoadedEventHandler: function() {
      console.log('playerLoaded');
    },

    /** run after get data from rdio api. */
    rdioDataEventHandler: function(event,data){
      /** Save the playlist data to playListData. */
      self.playListData=data;
      /** Use updateData to separate data to different array. */
      self.updataData();

      /** Play the music at the first time. */
      if(self.isFirstPlay){
        /** Play music by id, first time play music in the playlist. */
        self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        /** Change the play icon to pause icon. */
        $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[true]);
        self.isFirstPlay=false;
      }; 
    },

    /** Initialize Iscroll */
    initialIscrollEventHandler:function(){
      self.myScroll = new IScroll('#wrapper', { tap: true });
      document.addEventListener('touchmove', function (e) { }, false);
    },

    /** get soundisplaying number from PlaylistItem, and Change it. */
    changeSoundisPlayingEventHandler:function(event, soundIsPlaying){
      self.soundIsPlaying=soundIsPlaying;
    },

    /** Change the style of play button between play icon and pause icon. */
    changeIsMuicPlayingStatusEventHandler:function(event, isMusicPlaying){
      self.isMusicPlaying=isMusicPlaying;
      /** Change the style of play button. */
      if(self.isMusicPlaying){
        self.$play.removeClass('isPlaying');
        self.$play.toggleClass('isPlaying');
      }else{
        self.$play.removeClass('isPlaying');
      };
    },

    /** Get music's current position, and compare it with duration. When this muisc finish, the app will play next music. */
    musicPositionEventHandler: function(event, position){
      /** When a music finished what we need to do: next sound/loop the play list/ shuffle. */
      if(position >= (self.tracksDurations[self.soundIsPlaying]-0.7/*-0.5*/)){
        /** Shuffle */
        if(self.isShuffle){
          /** Shuffle the playlist and play randomly */
          /** Get a random number for soundIsPlaying. */
          self.soundIsPlaying=self.randomNmuberWithEasing(self.easingLevelForShuffle, self.soundIsPlaying);
          self.playMusic(self.tracksKeys[self.soundIsPlaying]);
        }else{
          if(self.soundIsPlaying == (self.playListData[0].tracks.length-1)){
            /** If this music is the last sound in playlist, loop the playlist after the playlist finish. */
            self.soundIsPlaying=0;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          }else{
            /** Play next music after one music finish. */
            self.soundIsPlaying++;
            self.playMusic(self.tracksKeys[self.soundIsPlaying]);
          };
        }; 
      };
    },
    
    /*Get tracksKeys,trackName, and tracksDurations information from data from rdio api and save them to different arrays.*/
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

      /** Compare the current playlist data with last playlist data. */
      self.playListCompare();
    },

    /** Compare the current playlist data with last playlist data. If two data are different, it means the playlist has been changed on rdio.com */
    playListCompare: function(){
      var order;//order is the order number of the music which is playing on the screen
      if((self.trackKeysForCompare.toString()) != (self.tracksKeys.toString())){
            /** ask renderPlaylist to render the playlist */
            self.renderPlaylist(self.soundIsPlaying, self.tracksKeys, self.tracksNames, self.tracksDurations, self.tracksSmallIcon, self.tracksAlbumNames, self.tracksArtists);
            /** Do something after the playlist order changed or deleted some music */
            if((self.trackKeysForCompare.length) > 1){/** make sure there are somemusic in the playlist */
              /** Found the order of current playing music in playlist. */
              order=_.indexOf(self.tracksKeys, self.trackKeysForCompare[self.soundIsPlaying]);
              if(order >= 0){
                /** Change the soundisPlaying when the order of current playing muisc in playlist is changed. */
                self.soundIsPlaying=order;
              }else{
                /** The playing music is deleted*/
                self.playMusic(self.tracksKeys[self.soundIsPlaying]);
              };
            };
            /** Change the play button icon. */
            $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[self.soundIsPlaying]);
            /** Scroll the playlist */
            self.autoIscroll();
            /** Save this playlist data for comparing next time. */
            self.trackKeysForCompare=self.tracksKeys;
      }else{
        return
      };
    },

    /**
    * randomNmuberWithEasing give you a random number in a range around a center number
    * @param {int} easing - easing range.
    * @param {int} centerNumber - center of the range.
    */
    randomNmuberWithEasing: function(easing, centerNumber){
      var randomOutputNumber;
      do{
        randomOutputNumber=_.random((centerNumber-easing),(centerNumber+easing));
      }
      while(randomOutputNumber<0 || randomOutputNumber>(self.playListData[0].tracks.length-1));

      return randomOutputNumber
    },

    init: function() {
      self=this;
      self.attachUIEventS();
      self.bindDataEvents();
    }
  };

  window.addEventListener('DOMContentLoaded', ViewControler.init());

  

})(window, document, jQuery, _);