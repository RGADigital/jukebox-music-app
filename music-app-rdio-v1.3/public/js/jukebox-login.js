var app = app || {};

app.login=(function(w,d,$){

	var elements={
		login: $( "#login" )
	};

	var attachEvents=function(){
		elements.login.on( "click", function() {
	  		$.ajax({
			      url : '/login',
			      type : 'GET',
			      dataType : 'json',
			      success : function(res) {
			        console.log('success');
			      }
			});
		});
	};

	var init=function(){
		console.log('login');
		attachEvents();
	};

	return {
   		init : init,
  	};

})(window, document, jQuery);

window.addEventListener('DOMContentLoaded', app.login.init);





