(function(w,d,$,_){

  var Render={

    renderSelf:{},
    //Data for Playlist node
    $trackName: $('.main-track'),
    $artistName: $('.main-artist'),
    $albumCover: $('.art'),
    $timeStamp: $('.main-position'),
    $playlistTpl: $('.playlist-item-tpl'),
    $playlistContiner:$('.playlist-content'),

    //track information
    tracksKeys:[],
    tracksNames:[],
    tracksSmallIcon:[],
    tracksAlbumNames:[],
    tracksArtists:[],
    tracksDurations:[],
    soundIsPlaying:0,

    tpl:{},
    renderPlaylist:{},
    
    bindRenderEvents: function(){
      $(d).bind('PLAYLIST_RENDER_EVENT',renderSelf.playlistRenderEventHandler);
      $(d).bind('TRACK_INFORMATION_DATA_EVENT',renderSelf.trackInformationEventHandler);
      $(d).bind('MUSIC_POSITION_DATA_EVENT', renderSelf.musicPositionEventHandler);
    },

    playlistRenderEventHandler: function(event, soundIsPlaying, tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists){

      //update playlist data
      renderSelf.tracksKeys=[];
      renderSelf.tracksNames=[];
      renderSelf.tracksSmallIcon=[];
      renderSelf.tracksAlbumNames=[];
      renderSelf.tracksArtists=[];
      renderSelf.tracksDurations=[];

      renderSelf.tracksKeys=tracksKeys;
      renderSelf.tracksNames=tracksNames;
      renderSelf.tracksSmallIcon=tracksSmallIcon;
      renderSelf.tracksAlbumNames=tracksAlbumNames;
      renderSelf.tracksArtists=tracksArtists;
      renderSelf.tracksDurations=tracksDurations;
      renderSelf.soundIsPlaying=soundIsPlaying;

      renderSelf.renderPlayList();
    },

    renderPlayList:function(){
      renderSelf.$playlistContiner.empty();
      var i=0;
      var length=renderSelf.tracksKeys.length;
      for(i;i<length;i++){
        new PlaylistItem(renderSelf.tracksKeys[i], renderSelf.tracksNames[i], renderSelf.tracksDurations[i], renderSelf.tracksSmallIcon[i], renderSelf.tracksAlbumNames[i], renderSelf.tracksArtists[i],(i+1)).init();
      };
      $(d).trigger('INITIAL_ISCROLL_EVENT');
    },

    initialTamplate:function(){
      renderSelf.tpl = renderSelf.$playlistTpl.text();
      renderSelf.renderPlaylist=_.template(renderSelf.tpl);
    },

    trackInformationEventHandler:function(event, trackName, artist, art){
      renderSelf.$trackName.text(trackName);
      renderSelf.$artistName.text(artist);
      renderSelf.$albumCover.attr('src', art);
    },

    musicPositionEventHandler: function(event, position){
      var time=parseInt(position);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      renderSelf.$timeStamp.text(minutes+':'+seconds);
    },

    init:function(){
      renderSelf=this;
      renderSelf.bindRenderEvents();
      renderSelf.initialTamplate();
    }
  };

  Render.init();

  var PlaylistItem=function(tracksKeys, tracksNames, tracksDurations, tracksSmallIcon, tracksAlbumNames, tracksArtists, order){
    var self=this;

    // playlist item information
    this.tracksKeys=tracksKeys;
    this.tracksNames=tracksNames;
    this.tracksDurations=tracksDurations;
    this.tracksSmallIcon=tracksSmallIcon;
    this.tracksAlbumNames=tracksAlbumNames;
    this.tracksArtists=tracksArtists;
    this.order=order;
    this.$listItem;
    this.orderNumberClass;

    //render the single playlist item in playlist
    this.render=function(){
      var time=parseInt(this.tracksDurations);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      var soundTime=minutes+':'+seconds;


      this.$listItem= $(Render.renderPlaylist({
        songName: this.tracksNames,
        artistName: this.tracksArtists,
        albumeName: this.tracksAlbumNames,
        songTime:soundTime ,
        iconUrl:this.tracksSmallIcon,
        soundOrder:this.order
      })).appendTo('.playlist-content');

      this.orderNumberClass=this.$listItem.find('.song-number');
    };

    this.attachEvent=function(){
      this.$listItem.on('tap', self.tapEventHandler);
    };

    this.tapEventHandler=function(event){
      var soundIsPlaying=(self.order-1);
      var isMusicPlaying=true;

      event.preventDefault();
      //play the musisc by track id.
      $(d).trigger('PLAY_MUSIC_EVENT',[self.tracksKeys]);
      //update SOUNDISPLAYING in view module. 
      $(d).trigger('CHANGE_SOUNDISPLAYING_EVENT',[soundIsPlaying]);
      //update ISMUSICPLAYING status in view module.
      $(d).trigger('CHANGE_ISMUSICPLAYING_STATUS_EVENT',[isMusicPlaying]);
      //change the icon
      $(d).trigger('CHANGE_PLAYLISTICON_EVENT',[soundIsPlaying]);

    };

    this.bindEventLisnter=function(){
      $(d).bind('CHANGE_PLAYLISTICON_EVENT', function(event, soundIsPlaying) {
        self.orderNumberClass.removeClass('song-playing-icon');
        if(soundIsPlaying == (self.order-1)){
          self.orderNumberClass.toggleClass('song-playing-icon');//ADD EFFECT TO ICON
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

})(window, document, jQuery, _);