(function(w,d,$){

	var Login={

		$login: $( "#login" ),
		
		/** The interaction events with DOM */
		attachEvents:function(){
			$login.click(loginClickEventHandler);
		},
		
		/** Run after click. */
		loginClickEventHandler: function() {
			/** make a ajax call to login */
			$.ajax({
			      url : '/login',
			      type : 'GET',
			      dataType : 'json',
			      success : function(res) {
			        console.log('success');
			      }
			});
		},

		init:function(){
			console.log('init');
		}
	};

	Login.init();

})(window, document, jQuery);





