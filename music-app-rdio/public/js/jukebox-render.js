(function(w,d,$,_){

 /* Render module's job is render the information on jukebox screen. */
  var Render={

    renderSelf:{},
    
    /*DOM element*/
    $trackName: $('.main-track'), // The DOM element for track name on main screen.
    $artistName: $('.main-artist'),// The DOM element for artisit name on main screen.
    $albumCover: $('.art'), // The DOM element for album cover on the main screen.
    $timeStamp: $('.main-position'), // The DOM elemet for current position of music playing on the main screen.
    $playlistTpl: $('.playlist-item-tpl'), // The template for playlist items. It is in player.html now.
    $playlistContiner:$('.playlist-content'), // The DOM element which is the continer for playlist items.

    /*track information from playlist*/
    tracksKeys:[], // Array of tracks keys(id) in playlist.
    tracksNames:[],// Array of tracks name in playlist.
    tracksSmallIcon:[],// Array of tracks small size album covers urls in playlist.
    tracksAlbumNames:[], // Array of tracks album names in playlist.
    tracksArtists:[], // Array of tracks artists names in playlist.
    tracksDurations:[],// Array of tracks duations in playlist.

    soundIsPlaying:0, //the order number of playing musisc.
    tpl:{},  // tamplate contents.
    renderPlaylistObj:{},//underscore tamplate object.
    
    /** bindEvents takes care of all the .bind function */
    bindRenderEvents: function(){
      /** Start to render the playlist after get the playlist data from server. */
      $(d).bind('PLAYLIST_RENDER_EVENT',renderSelf.playlistRenderEventHandler);
      /** Getting the playing track information from rdioController module, and render them. */
      $(d).bind('TRACK_INFORMATION_DATA_EVENT',renderSelf.trackInformationEventHandler);
      /** Getting the playing track position information from rdioController module, and render it. */
      $(d).bind('MUSIC_POSITION_DATA_EVENT', renderSelf.musicPositionEventHandler);
    },

    /**
     * playlistRenderEventHandler save the data first and then start to render the playlist.
     * @parem {int} soundIsPlaying - the number of playing music in the playlist.
     * @parem {string} tracksKeys - the ID of tracks.
     * @parem {string} tracksNames - name of tracks.
     * @parem {float} tracksDurations - lenth of musics.
     * @parem {string} tracksSmallIcon - url of small pictures of albums' cover.
     * @parem {string} tracksAlbumNames - url of big pictures of albums' cover.
     * @parem {string} tracksArtists - artist name of tracks.
     */
    playlistRenderEventHandler: function(event, soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists){

      /**clean up the array before put data into these array.*/
      renderSelf.tracksKeys=[];
      renderSelf.tracksNames=[];
      renderSelf.tracksSmallIcon=[];
      renderSelf.tracksAlbumNames=[];
      renderSelf.tracksArtists=[];
      renderSelf.tracksDurations=[];

      /** update the playlist information */
      renderSelf.tracksKeys=tracksKeys;
      renderSelf.tracksNames=tracksNames;
      renderSelf.tracksSmallIcon=tracksSmallIcon;
      renderSelf.tracksAlbumNames=tracksAlbumNames;
      renderSelf.tracksArtists=tracksArtists;
      renderSelf.tracksDurations=tracksDurations;
      renderSelf.soundIsPlaying=soundIsPlaying;

      /** start to render the playlist on the main screen*/
      renderSelf.renderPlayList();
    },

    /** Render the playlist */
    renderPlayList:function(){

      /** Clean up the DOM element for playlist before we update it. */
      renderSelf.$playlistContiner.empty();
      var i=0;
      var length=renderSelf.tracksKeys.length;
      for(i;i<length;i++){
        /** initalize the playlist items. */
        new PlaylistItem(renderSelf.tracksKeys[i], renderSelf.tracksNames[i], renderSelf.tracksDurations[i], renderSelf.tracksSmallIcon[i], renderSelf.tracksAlbumNames[i], renderSelf.tracksArtists[i],(i+1)).init();
      };
      /** initalize the iscroll object in View module. */
      $(d).trigger('INITIAL_ISCROLL_EVENT'); 
    },

    /** initialize Underscore.js tamplate. More information about underscore tamplate: http://underscorejs.org/ */
    initialTamplate:function(){
      /** Get the content of template */
      renderSelf.tpl = renderSelf.$playlistTpl.text();
      /** initialize the content as underscore template and put it into renderPlaylistObj object*/
      renderSelf.renderPlaylistObj=_.template(renderSelf.tpl);
    },

    /** get track trackName, artist, art information from rdio-controller module. And render them on mainscreen. */
    trackInformationEventHandler:function(event, trackName, artist, art){
      renderSelf.$trackName.text(trackName);
      renderSelf.$artistName.text(artist);
      renderSelf.$albumCover.attr('src', art);
    },

    /*get position from rdio-controller module. And render them on mainscreen. */
    musicPositionEventHandler: function(event, position){
      /** Formatting the timestamp from second to 0:00 */
      var time=parseInt(position);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      /** render time in DOM */
      renderSelf.$timeStamp.text(minutes+':'+seconds);
    },

    init:function(){
      renderSelf=this;
      renderSelf.bindRenderEvents();
      renderSelf.initialTamplate();
    }
  };


  /** PlaylstItem class is the playlsit item in the playlist. */
  var PlaylistItem=function(tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists, order){
    var self=this;

    /** playlist item information. */
    this.tracksKeys=tracksKeys; // Id of the track from rdio api.
    this.tracksNames=tracksNames; // Name of track.
    this.tracksDurations=tracksDurations; // Duration of track.
    this.tracksSmallIcon=tracksSmallIcon; // Url of small size album cover.
    this.tracksAlbumNames=tracksAlbumNames; // Url of big size album cover.
    this.tracksArtists=tracksArtists; // Name of track's artist.
    this.order=order; // The order of the music in the playlist.
    this.$listItem; // The playlist Item.
    this.orderNumberClass; // The class in DOM for ordler number of playlist item. If this music is playing, we will replace the number with a speaker icon by toggleClass('song-playing-icon').

    /*render the single playlist item in playlist*/
    this.render=function(){
      /** Formatting the during of track from second to 0:00 */
      var time=parseInt(this.tracksDurations);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      var soundTime=minutes+':'+seconds;

      /** Put the content into the playlist item template object and render it into the playlist continer.  */
      this.$listItem= $(Render.renderPlaylistObj({
        songName: this.tracksNames,
        artistName: this.tracksArtists,
        albumeName: this.tracksAlbumNames,
        songTime:soundTime ,
        iconUrl:this.tracksSmallIcon,
        soundOrder:this.order
      })).appendTo('.playlist-content');

      /** Find the class .song-number in playlist item. */
      this.orderNumberClass=this.$listItem.find('.song-number');
    };

    /*Attach event of single playlist item.*/
    this.attachEvent=function(){
      this.$listItem.on('tap', self.tapEventHandler);
    };

    this.tapEventHandler=function(event){
      var soundIsPlaying=(self.order-1); //soundIsPlaying starts from 0, and self.order starts from 1. 
      var isMusicPlaying=true; // This will be used to change the order number in playlist item to speaker icon.
      event.preventDefault();

      /** play the musisc by track id. */
      $(d).trigger('PLAY_MUSIC_EVENT',[self.tracksKeys]);
      /** update SOUNDISPLAYING in view module. */ 
      $(d).trigger('CHANGE_SOUNDISPLAYING_EVENT',[soundIsPlaying]);
      /** update ISMUSICPLAYING status in view module. */
      $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[isMusicPlaying]);
      /** change the icon */
      $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[soundIsPlaying]);

    };

    this.bindEventLisnter=function(){
      /** change the order number in playlist item to speaker icon when this music is playing. */
      $(d).bind('CHANGE_PLAYLISTICON_EVENT', function(event, soundIsPlaying) {
        /** remove .song-playing-icon from all the playlist item */
        self.orderNumberClass.removeClass('song-playing-icon');
        if(soundIsPlaying == (self.order-1)){
          /** If music in this playlist item is playing, add .song-playing-icon to .song-number DOM element, the number will be changed to speaker icon. */
          self.orderNumberClass.toggleClass('song-playing-icon');
        };
      });
    };

    this.init=function(){
      this.render();
      this.bindEventLisnter();
      this.attachEvent();
      return this;
    };
  };

  Render.init();
})(window, document, jQuery, _);