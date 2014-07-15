(function(w,d,$,_){

  var Render={

    renderSelf:{},
    //Data for Playlist node
    //track information
    $trackName: $('.main-track'),
    $artistName: $('.main-artist'),
    $albumCover: $('.art'),
    $timeStamp: $('.main-position'),


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
      // console.log('render playlist');
      // console.log('soundIsPlaying: '+soundIsPlaying);
      // console.log('tracksKeys: '+tracksKeys);
      // console.log('tracksNames: '+tracksNames);
      // console.log('tracksDurations: '+tracksDurations);
      // console.log('tracksSmallIcon: '+tracksSmallIcon);
      // console.log('tracksAlbumNames:'+tracksAlbumNames);
      // console.log('tracksArtists: '+tracksArtists);

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
      var i=0;
      var length=renderSelf.tracksKeys.length;
      $('.playlist-item-tpl').empty();
      for(i;i<length;i++){
        new PlaylistItem(renderSelf.tracksKeys[i], renderSelf.tracksNames[i], renderSelf.tracksDurations[i], renderSelf.tracksSmallIcon[i], renderSelf.tracksAlbumNames[i], renderSelf.tracksArtists[i],(i+1)).init();
      };
      renderSelf.initialIscroll();
    },

    initialTamplate:function(){
      renderSelf.tpl = $('.playlist-item-tpl').text();
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
      self.$timeStamp.text(minutes+':'+seconds);
    },

    initialIscroll:function(){
      console.log('dd');
      myScroll = new IScroll('#wrapper', { tap: true });
      document.addEventListener('touchmove', function (e) { }, false);
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

    this.tracksKeys=tracksKeys;
    this.tracksNames=tracksNames;
    this.tracksDurations=tracksDurations;
    this.tracksSmallIcon=tracksSmallIcon;
    this.tracksAlbumNames=tracksAlbumNames;
    this.tracksArtists=tracksArtists;
    this.order=order;
    this.$listItem;

    this.render=function(){
      var time=parseInt(this.tracksDurations);
      var minutes = Math.floor(time / 60);
      var seconds = (time - minutes * 60)<10?('0'+(time - minutes * 60)):(time - minutes * 60);
      var soundTime=minutes+':'+seconds;


      this.$listItem= $(Render.renderPlaylist({
        songName: this.tracksNames,
        artistName: this.tracksArtists,
        songTime:soundTime ,
        iconUrl:this.tracksSmallIcon,
        soundOrder:this.order
      })).appendTo('.playlist-content');
    };

    this.attachEvent=function(){
      this.$listItem.on('tap', self.tapEventHandler);
    };

    this.tapEventHandler=function(event){
      event.preventDefault();
      $(d).trigger('PLAY_MUSIC_EVENT',[self.tracksKeys]);
    };

    this.init=function(){
      this.render();
      this.attachEvent();
      return this;
    };
  };

})(window, document, jQuery, _);