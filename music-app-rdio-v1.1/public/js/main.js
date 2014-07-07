var app = app || {};

app.main=(function(w,d,$){

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
		attachEvents();
	};

	return {
   		init : init,
  	};

})(window, document, jQuery);

window.addEventListener('DOMContentLoaded', app.main.init);





