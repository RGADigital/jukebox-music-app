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

		init:function(){
			websocketSelf=this;
			websocketSelf.userName=websocketSelf.randomChar(5);
			console.log('Websocket');
			socket.emit('add mainscreen user',websocketSelf.userName); //emit the frequency data of playing music to websockets.
		}
	};

	Websocket.init();

})(window, document, jQuery);





