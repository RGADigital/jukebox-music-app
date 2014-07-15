var kittens = (function(w, d, $, _) {

	
	var init, 
	tpl,
	renderGif;

	tpl = $('.gif-tpl').text();
	renderGif = _.template(tpl);

	
	var musicName=['sdas','qqqqqq','dasdsds','sdasde','dadedeasd','ssss'];
	var musicId=['11111','22222','33333','444444','555555','666666'];
	var artistName=['aaaaaa','bbbbbbb','cccccc','ddddddd','eeeee','fffff'];

	var addList=function(){
		var i=0;
		var length=musicName.length;
		for(i;i<length;i++){
			new playlistNode(musicId[i],musicName[i], artistName[i]).init();
		};	
	};

	var playlistNode=function(musicId, musicName, artistName){//playlistitem
		var self=this;
 
		this.buttonId=musicId;
		this.musicName=musicName;
		this.artistName=artistName;

		this.render=function(){
			this.$listItem= $(renderGif({id :this.buttonId, musicName:this.musicName, artistName:this.artistName})).appendTo('.gifs');
			this.orderNumber=this.$listItem.find('.number-or-icon')
		};

		this.attachEvent=function(){
			this.$listItem.click(function(event) {
				console.log('playMuic by id: '+self.buttonId);//PLAY MUSIC
				$(d).trigger('CHANGE_ICON_BACK_EVENT');//RESET ICONS
				self.orderNumber.toggleClass('playing');//ADD EFFECT TO ICON
				//Change the number of SoundisPlaying _.indexOf([1, 2, 3], 2);
			});
		};

		this.bindEventLisnter=function(){
			$(d).bind('CHANGE_ICON_BACK_EVENT', function(event) {
				console.log('change it back');
				self.orderNumber.removeClass('playing');
			});
		};

		this.init=function(){
			this.render();
			this.attachEvent();
			this.bindEventLisnter();
			return this;
		};
	};



	init = function() {
		addList(); 
	};
	
	return {
		init : init
	}

})(window, document, jQuery, _);

window.onload = kittens.init;