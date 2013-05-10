/*
  server.js

  The main script for the Web sockets server of Nim
*/

//*****************************************************************************


var httpPort = 8101;
var http = require( 'http' ),
    connect = require( 'connect' ),
    socketio = require( 'socket.io' );
require( './Lobby.js' );

global.app = global.app || { };
var app = global.app;

//=============================================================================

var httpHandler = connect( )
    .use( connect.favicon( ) )
    .use( connect.logger( 'dev' ) )
    .use( connect.static( __dirname + '/public', { redirect: true } ) );

var httpServer = http.createServer( httpHandler ).listen( httpPort );

//=============================================================================

var io = socketio.listen( httpServer );

io.sockets.on( 'connection',
               function( socket )
               {
                   app.lobby.addPlayer( socket );
               } );


//*****************************************************************************
