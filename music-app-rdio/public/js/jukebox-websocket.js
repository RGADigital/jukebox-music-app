(function(w,d,$){
	var socket=io.connect(window.location.hostname.toString()+':9001'); //port for websocket.

	var Websocket={

		websocketSelf:{},
		userName:"",

		/**
		 * give me a random string as user name.
		 * @parem {int} length - the length of the random string.
		 */
		randomChar:function(length){
			var length = length || 32;
			var source = "abcdefghzklmnopqrstuvwxyz"; 
			var random = "";  
    		for(var i = 0;i < length; i++)  {  
        		random += source.charAt(Math.ceil(Math.random()*100000000)%source.length);  
    		}  
    		return random; 
		},

		bindEvents: function(){
      		$(d).bind('MUSIC_FREQUENCY_DATA_EVENT',websocketSelf.musicFrequencyDataEventHandler);
    	},

    	musicFrequencyDataEventHandler: function(event, frequency){
          socket.emit('bit', frequency); //emit the frequency data of playing music to websockets.
    	},

		init:function(){
			websocketSelf=this;
			websocketSelf.bindEvents();
			socket.emit('add mainscreen user',websocketSelf.userName); //emit the frequency data of playing music to websockets.
			/*--------------test here--------------------*/
			// socket.on(websocketSelf.userName, function(data) {
   //              console.log('we paired');
   //              console.log(data);
   //          });
			socket.on('userList', function(data) {
                console.log(data);
            });
		}
	};

	Websocket.init();

})(window, document, jQuery);





