/** websocket module is taking care the websocket used in Jukebox app. */
(function(w,d,$){
	/** set up websocket port to 9001. */
	var socket=io.connect(window.location.hostname.toString()+':9001'); 

	var Websocket={

		websocketSelf:{}, //websocketSelf=this.
		userName:"", // {string} - The random user name for this main player client.

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

		/**
		 * Set query parameter.
		 * @param {string} paramName- The name of query parameter.
		 * @param {string} paramValue- The value of query parameter.
		 */
		setParameter: function(paramName, paramValue)
		{
		    var url = window.location.href;// Take the origin url.
		    if (url.indexOf(paramName + "=") >= 0)
		    {
		        var prefix = url.substring(0, url.indexOf(paramName));
		        var suffix = url.substring(url.indexOf(paramName));
		        suffix = suffix.substring(suffix.indexOf("=") + 1);
		        suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
		        url = prefix + paramName + "=" + paramValue + suffix;
		    }
		    else
		    {
		    if (url.indexOf("?") < 0)
		        url += "?" + paramName + "=" + paramValue;
		    else
		        url += "&" + paramName + "=" + paramValue;
		    }
		    /** Redirect the page {url}/?{paramName}={paramValue} */
		    window.location.href = url;
		},

		/** bindEvents is taking care of all the .bind functions */
		bindEvents: function(){
			/** Get current music's frequency data from Rdio_controller moudle. */
      		$(d).bind('MUSIC_FREQUENCY_DATA_EVENT',websocketSelf.musicFrequencyDataEventHandler);
    	},

    	/** After get the frequency data from Rdio_controller moudle, emit the frequency data of playing music to websockets.  */
    	musicFrequencyDataEventHandler: function(event, frequency){
    		/** Emit the frequency data of playing music to websockets. */
        	socket.emit('bit', frequency);
    	},

		init:function(){
			websocketSelf=this;

			if(!($.url().param('id'))){
				/** If app can't find {id} query parameter in url, app creates a user name first and put this username in url.*/
				websocketSelf.userName=websocketSelf.randomChar(5);
				websocketSelf.setParameter('id', websocketSelf.userName);
			}else{
				/** If app find {id} query parameter in url, app will get this value and put this value to username.*/
				websocketSelf.userName=$.url().param('id');
			};
			websocketSelf.bindEvents();
			/** Emit the client's username to websockets. */
			socket.emit('add mainscreen user',websocketSelf.userName); 
		}
	};

	Websocket.init();

})(window, document, jQuery);





