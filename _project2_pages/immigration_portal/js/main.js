$( document ).ready(function() {   //hides logout button if user is not logged in
	if (localStorage.getItem('profile') == null) {
		$( "#btn-logout" ).hide();
	}

	var logout = function() {
		localStorage.removeItem('id_token');
		localStorage.removeItem('profile');
		window.location.href = "/";
	};
    $( "#btn-logout" ).click(function() {
        logout();
    });
});