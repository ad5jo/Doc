var AUTH0_CLIENT_ID = 'aYQBFES351HrymxuMCJ0vAnog1mDxA0h';
var AUTH0_DOMAIN = 'shaverda.auth0.com';
var AUTH0_CALLBACK_URL = location.href;

window.addEventListener('load', function() {

    var lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
        theme: {
            logo: "../earth.png"
        }
    });

    document.getElementById('btn-login').addEventListener('click', function() {
        lock.show();
    });

    document.getElementById('btn-logout').addEventListener('click', function() {
        logout();
    });

    lock.on("authenticated", function(authResult) {
        lock.getProfile(authResult.idToken, function(err, profile) {
            if (err) {
                // Remove expired token (if any)
                localStorage.removeItem('id_token');
                // Remove expired profile (if any)
                localStorage.removeItem('profile');
                return alert('There was an error getting the profile: ' + err.message);
            } else {
                localStorage.setItem('id_token', authResult.idToken);
                localStorage.setItem('profile', JSON.stringify(profile));
                showUserProfile(profile);
            }
        });
    });

    var parseHash = function() {
        var id_token = localStorage.getItem('id_token');
        if (null != id_token) {
            var user_profile = JSON.parse(localStorage.getItem('profile'));
            showUserProfile(user_profile);
        } // else: not authorized
    };

    var showUserProfile = function(profile) {
        var user_info = ({
                email: JSON.parse(localStorage.getItem('profile')).email
            })

        $.post("/user", user_info).then((data) => {
            console.log(data);
            if (data.userType == "immigrant") {
                if (data.completedSurvey == false) {
                    window.location.href = "/survey";
                } else if (data.completedSurvey == true) {
                    //if they are an immigrant and have completed survey, direct them to documents portal
                    window.location.href = "/document";
                }
            } else { //if user is a lawyer, directs them to list of surveys
                window.location.href = "/surveyList";
            }
        });
    };

    parseHash();
});


// // { for if i decide to go with additional sign up fields rather than doing all thru google in combo with our own users db!
//   additionalSignUpFields: [{
//     name: "user_type",
//     placeholder: "Enter lawyer or user",
//     validator: (value) =>  {
//       return (value.toLowerCase() === "lawyer" || value.toLowerCase() === "user");
//     }
//   }]
// }

// $('#login').style.display = "none";
// $('#logged').style.display = "inline-block";
// $('#avatar').src = profile.picture;
// $('#name').textContent = profile.name;
// $('#email').textContent = profile.email;
// $('#nickname').textContent = profile.nickname;
// $('#created_at').textContent = profile.created_at;
// $('#updated_at').textContent = profile.updated_at;
// $('#country').textContent = profile.country;
