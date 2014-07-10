(function(w,d,$){

	var Login={

		$login: $( "#login" ),

		attachEvents:function(){
			$login.click(loginClickEventHandler);
		},

		loginClickEventHandler: function() {
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





