/*
  server.js

  The main script for the Twitter version of Nim.
*/

//*****************************************************************************


var fs = require( 'fs' ),
    twitter = require( 'ntwitter' ),
    ourScreenName = 'nim_game_test1', //'nim_game',
    oauthData = readOAuthData( ),
    twitterClient = new twitter( oauthData );
require( './NimTwitterController.js' );
var gameController = app.nim.twitterController( twitterClient, ourScreenName );

connectToTwitterStream( );

//=============================================================================

function readOAuthData( )
{
    var json = fs.readFileSync( 'OAuth.json', 'utf8' );
    return JSON.parse( json );
}

//-----------------------------------------------------------------------------

function checkOAuthData( ) // for testing
{
    client.verifyCredentials(
        function handleVerification( err, data )
        {
            if ( err )
            {
                console.error( 'Unable to verify Twitter credentials' );
                console.info( oauthData );
            }
            else
            {
                console.log( 'Twitter credentials OK' );
            }
        } );
}

//=============================================================================

function connectToTwitterStream( )
{
    twitterClient.stream( 'user',
                          { track: ourScreenName,
                            replies: 'all' },
                          handleTwitterStream );
}
    
//-----------------------------------------------------------------------------

function handleTwitterStream( stream )
{
    stream.on( 'data', handleTwitterStreamData );
    stream.on( 'end', connectToTwitterStream );     //reconnect
    stream.on( 'destroy', connectToTwitterStream ); //    "
}

//-----------------------------------------------------------------------------

function handleTwitterStreamData( data )
{
    var user = data.user;
    if ( (! data.text) || (! user) )
        return; //not a tweet
    if ( user.screen_name === ourScreenName )
        return; //our tweet
    gameController.handleTweet( data.text, data.id_str,
                                user.id_str, user.screen_name );
}


//*****************************************************************************


