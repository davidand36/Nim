/*
  Facebooker.js

  Interface with Facebook JavaScript API
  NOTES:
  1. In init(), pass the ID obtained when the App is created on the Facebook
     App Dashboard, and the URL of an HTML file containing:
     <script src="http://connect.facebook.net/en_US/all.js"></script>
*/

//*****************************************************************************


var app = app || { };


//=============================================================================


app.facebooker =
    (function( )
    {
    //-------------------------------------------------------------------------

        var loggedIn = false,
            userId,
            userName,
            accessToken;

    //=========================================================================

        function init( appId, channelUrl, callback )
        {                                                              /*init*/
            var deferred = $.Deferred();
            window.fbAsyncInit = function fbAsyncInit( )
            {
                FB.init( {
                    appId: appId,
                    channelUrl: channelUrl,
                    status: true,
                    cookie: false,
                    xfbml: false
                } );

                FB.Event.subscribe( 'auth.authResponseChange',
                                    handleLoginStatus );
                FB.login( handleLoginResponse );
            };

        //---------------------------------------------------------------------

            function handleLoginStatus( response )
            {
                if ( response.status === 'connected' )
                {
                    handleLoggedIn( response.authResponse );
                }
                else if ( response.status === 'not_authorized' )
                {
                    console.debug( 'User logged into Facebook but not app' );
                    FB.login( handleLoginResponse );
                }
                else
                {
                    console.debug( 'User not logged into Facebook' );
                    FB.login( handleLoginResponse );
                }
            }

        //---------------------------------------------------------------------

            function handleLoginResponse( response )
            {
                if ( response.authResponse )
                {
                    handleLoggedIn( response.authResponse );
                }
                else
                {
                    handleLoginDeclined( );
                }
            }

        //---------------------------------------------------------------------

            function handleLoggedIn( authData )
            {
                console.debug( 'Connected to Facebook' );
                loggedIn = true;
                deferred.resolve( authData );
            }

        //---------------------------------------------------------------------

            function handleLoginDeclined( )
            {
                console.log( 'Facebook login declined' );
                deferred.reject( );
            }

        //---------------------------------------------------------------------

            return deferred.promise();
        }                                                              /*init*/

    //=========================================================================

        function getUserName( )
        {
            var deferred = $.Deferred();
            if ( userName )
            {
                deferred.resolve( userName );
            }
            else if ( loggedIn )
            {
                console.log( 'Fetching user Facebook info' );
                FB.api(
                    '/me',
                    function handleGraphResult( response )
                    {
                        if ( (! response) || response.error )
                        {
                            console.log( 'Failed to get Facebook info' );
                            deferred.reject( );
                        }
                        else
                        {
                            console.log( 'Got Facebook info. User name: ' +
                                         response.name );
                            userName = response.name;
                            deferred.resolve( userName );
                        }
                    } );
            }
            else
            {
                deferred.reject( );
            }
            return deferred.promise();
        }

    //=========================================================================

         return {
             init: init,
             getUserName: getUserName
         };
         
    //-------------------------------------------------------------------------
    }
)();


//*****************************************************************************
