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
            version: 'v2.8'
        });

        $('#loginbutton,#feedbutton').removeAttr('disabled');

        FB.getLoginStatus(function fbLoginCheck(response) {
            if (response.status === 'connected') {
                new PNotify({
                    title: 'Success',
                    text: 'Successfully connected to Facebook!',
                    type: 'success'
                });

                //Set the response to sessionStorage
                sessionStorage.setItem('fbAccount', JSON.stringify(response));

                //Enable the serch bar
                enableSearchBar();
            } else {
                FB.login(function fbLogin(response) {
                    if (response.status === 'connected') {
                        new PNotify({
                            title: 'Success',
                            text: 'Successfully connected to Facebook!',
                            type: 'success'
                        });

                        //Set the response to sessionStorage
                        sessionStorage.setItem('fbAccount', JSON.stringify(response));

                        enableSearchBar();
                    } else {
                        new PNotify({
                            title: 'Error',
                            text: 'Could not connect to Facebook.',
                            type: 'error'
                        });
                    }
                }, {
                    scope: ['email', 'user_posts']
                });
            }
        });
    });

    //Bind the search bar to the FB search
    $('#fbaccount').autocomplete({
            source: function (request, response) {
                searchFBAccounts(request.term, function (data) {
                    console.log('fb seasrch data', data);
                    response(data);
                });
            },
            minLength: 3,
            select: function (event, ui) {
                $('.selected-account').empty();
                $('.selected-account').append('<img src="' + ui.item.image + '"><br>' + ui.item.name);
                $('#fbaccount').val(ui.item.name + ' - ' + ui.item.id);

                return false;
            }
        })
        .autocomplete("instance")
        ._renderItem = function (ul, item) {
            return $('<li>')
                .append('<img src="' + item.image + '">' + item.name)
                .appendTo(ul);
        };

    $('#analyze').on('click', function () {
        //Get the account info
        var fbid = $('#fbaccount').val().split(' - ')[1];
        var requestFields = [
            'id',
            'created_time',
            'description',
            'from',
            'link',
            'message',
            'name',
            'story',
            'to',
            'type',
            'comments.summary(1)',
            'likes.summary(1)'
        ];
        var params = {
            since: moment(moment().subtract(6, 'months'), 'YYYY-MM-DD hh:mm A').unix(),
            until: moment(moment(), 'YYYY-MM-DD hh:mm A').unix(),
            limit: 25,
            fields: requestFields.join(',')
        };

        //Make the first request
        FB.api('/' + fbid + '/posts', 'get', params, function (response) {
            document.processingNotification = new PNotify({
                title: 'Parsing',
                text: 'Please wait while we process your request...',
                type: 'warning',
                hide: false
            });

            if (response.error) {
                return cb(response.error.message);
            }

            if (response.data && response.data.length) {
                var allPosts = response.data.data;

                //Check for more pages..calls cb()
                getNextPage(response, allPosts);
            } else {
                console.log(response);

                return cb('There was a problem with the query parameters and no posts were found.');
            }

            function getNextPage(response, allPosts) {
                if (response && response.paging && response.paging.next) {
                    $http.get(response.paging.next)
                        .then(function (res) {
                            //Save prev page data
                            if (res.data && res.data.data) {
                                allPosts.concat(res.data.data)

                                 //Recursive call
                                getNextPage(res.data, allPosts);

                            } else {
                                //Show error
                                return cb('No data found in subsequent pages.');

                                /**
                                 * This is likely where we need to call a new function to loop
                                 * through the posts and grab all comments...
                                 */
                            }
                        });
                } else {
                    //All done
                    cb();
                }
            }
        });
    });


    /**
     * Helper functions
     */
    function enableSearchBar() {
        $('#fbaccount').attr('disabled', false);
    }

    function searchFBAccounts(searchString, cb) {
        if (searchString && searchString.length > 2) {
            FB.api('/search/', {
                type: 'user',
                limit: 30,
                fields: 'id,name,picture,link',
                q: searchString
            }, function (response) {
                if (_.has(response, 'error')) {
                    new PNotify({
                        title: 'Error',
                        text: 'Cannot search Facebook using that query',
                        type: 'error'
                    });
                    return [];
                }

                var cleanResponses = [];

                _.each(response.data, function (r) {
                    // cleanResponses.push({id: r, text: r.name + ', ' + location + ' - ' + r.link})
                    cleanResponses.push({
                        image: r.picture.data.url,
                        name: r.name,
                        id: r.id
                    })
                });

                cb(cleanResponses);
            });
        } else {
            return cb([]);
        }
    }
});
