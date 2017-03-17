$(document).ready(function () {
  // hide logout button on initial load
  $('.btn-logout').hide();
  $('.avatar').hide();
  $("#mainPageContent").hide();

  var options = {
    rememberLastLogin: false,
    auth: {
      redirect: false
    },
    autoclose: true
  };

  var lock = new Auth0Lock('w0afrsXkjEvuLPkJAmX7iI3GhWDVKTFB', 'bchang55.auth0.com', options, {
    auth: {
      params: {
        scope: 'openid name email'
      } //Details: https://auth0.com/docs/scopes
    }
  });

  // Check if there is an existing access token

  var access_token = localStorage.getItem('access_token');
  // log user in, if there is a token
  if (null !== access_token) {
    lock.getUserInfo(access_token, function (err, profile) {
      if (err) {
        // Remove expired token (if any) from localStorage
        return localStorage.removeItem('access_token');
        // return alert('There was an error getting the profile: ' + err.message);
      }
      else {
        // log user in and show their profile info
        retrieve_profile();
        show_profile_info(profile);
        // set the localstorage user id based on their email
        setUserId(profile.email);
        $("#mainPageContent").show();
        console.log("user authenticated");
        localStorage.setItem("login", profile.identities["0"].userId);
      }
    });
  }

  $('.btn-login').click(function (e) {
    e.preventDefault();
    lock.show();
  });

  $('.btn-logout').click(function (e) {
    e.preventDefault();
    logout();
  });

  $(document.body).on("click", "#btn-select", function () {
    window.location = "/" + localStorage.login + "/select";
  })

  lock.on("authenticated", function (authResult) {
    lock.getUserInfo(authResult.accessToken, function (error, profile) {
      if (error) {
        // Handle error
        return;
      }
      sendUserDataDB(profile);
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('user_email', profile.email);
      localStorage.setItem("login", profile.identities["0"].userId);
      setUserId(profile.email);
      
      // Display user information
      show_profile_info(profile);
      // route to the selection page
      //window.location = "/" + localStorage.login + "/select";
    });
  });

  function sendUserDataDB(newUser) {
    var currentURL = window.location.origin;
    var newUserObject = {
      email: newUser.email,
      username: newUser.nickname,
      firstname: newUser.givenName,
      lastname: newUser.familyName,
    };
    $.post(currentURL + "/api/newUser", newUserObject)
    .then(function (data) {
      console.log(data);
      // SET THE LOCALSTORAGE USERID ONCE THEY ARE ADDED TO DB
      localStorage.setItem("userId", data.id);
      console.log("new user data sent");
    }, function (err) {
      console.log(err);
    });
  }

  //retrieve the profile:
  var retrieve_profile = function () {
    var access_token = localStorage.getItem('accessToken');
    if (access_token) {
      lock.getUserInfo(access_token, function (err, profile) {
        if (err) {
          return alert('There was an error getting the profile: ' + err.message);
        }
        // Display user information
        show_profile_info(profile);
        setUserId(profile.email);
        console.log(profile);
      });
    }
  };

  var show_profile_info = function (profile) {
    $('#nickname').text(profile.nickname);
    $('#nickname').show();
    $('.btn-login').hide();
    $('.avatar').attr('src', profile.picture).show();
    $('.btn-logout').show();
    $("#btn-select").show();
    // $.get("/select", function (data) {
    //   console.log(data);
    // });
  };

  var logout = function () {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    window.location.href = "/";
    $("#mainPageContent").hide();
  };
  retrieve_profile();

  function setUserId(email){
                   $.ajax({
                        url: "/api/getID/" + email,
                        type: "GET",
                        dataType: "json",
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR.responseText);
                        }
                    })
                    .done(function (data) {
                     localStorage.setItem("userId", data.id);
                            });
  }
});







