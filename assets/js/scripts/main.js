$(document).ready(function () {
    //Setup caching
    $.ajaxSetup({
        cache: true
    });

    /**
     * Grab the Facebook SDK and attempt to login/auth. We need them logged in
     * so that we can search FB as their account and access profiles that might
     * otherwise be private but not to the current user.
     */
    $.getScript('https://connect.facebook.net/en_US/sdk.js', function () {
        FB.init({
            //App ID for this project
            appId: '204639986629939',
            version: 'v2.7'
        });

        $('#loginbutton,#feedbutton').removeAttr('disabled');

        FB.getLoginStatus(function fbLoginCheck(response){
            if(response.status === 'connected'){
                new PNotify({
                    title: 'Success',
                    text: 'Successfully connected to Facebook!',
                    type: 'success'
                });

                //Set the response to sessionStorage
                sessionStorage.setItem('fbAccount', JSON.stringify(response));

                //Enable the serch bar
                enableSearchBar();
            }else{
                FB.login(function fbLogin(response){
                    if(response.status === 'connected'){
                        new PNotify({
                            title: 'Success',
                            text: 'Successfully connected to Facebook!',
                            type: 'success'
                        });

                        //Set the response to sessionStorage
                        sessionStorage.setItem('fbAccount', JSON.stringify(response));

                        enableSearchBar();
                    }else{
                        new PNotify({
                            title: 'Error',
                            text: 'Could not connect to Facebook.',
                            type: 'error'
                        });
                    }
                }, {scope: 'email'});
            }
        });
    });


    /**
     * Helper functions
     */
    function enableSearchBar(){
        $('#fbaccount').attr('disabled', false);
    }

    function searchFBAccounts(searchString){
        if(searchString && searchString.length > 2){
            FB.api('/search/', {
                type: 'page',
                limit: 10,
                fields: 'id,name,location,category,link',
                q: searchString
            }, function (response) {
                var cleanResponses = [];

                _.each(response.data, function (r) {
                    var location = [];
                    location.push(_.get(r, 'location.city', null));
                    location.push(_.get(r, 'location.state', null));

                    location = _.compact(location).join(', ');

                    cleanResponses.push({id: r, text: r.name + ', ' + location + ' - ' + r.link})
                });

                return cleanResponses;
            });
        }else{
            return [];
        }
    }
});
