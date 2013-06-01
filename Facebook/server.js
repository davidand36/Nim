/*
  server.js

  The main script for the Web sockets server of Nim
*/

//*****************************************************************************


var httpPort = 8102,
    httpsPort = 8402;
var http = require( 'http' ),
    https = require( 'https' ),
    fs = require( 'fs' ),
    express = require( 'express' ),
    socketio = require( 'socket.io' );
require( './Lobby.js' );

global.app = global.app || { };
var app = global.app;

//=============================================================================

var httpHandler = express( )
    .use( express.favicon( ) )
    .use( express.logger( 'dev' ) )
    .use( express.static( __dirname + '/public', { redirect: true } ) );

httpHandler.post( '/',
                 function( req, res )
                 {
                     res.sendfile( __dirname + '/public/index.html' );
                 } );

var sslData =
    {
        key: fs.readFileSync( 'private.key' ),
        cert: fs.readFileSync( 'cert.crt' )
    };

var httpServer = http.createServer( httpHandler ).listen( httpPort );
console.log( 'Listening on HTTP port ' + httpPort );
var httpsServer =
    https.createServer( sslData, httpHandler ).listen( httpsPort );
console.log( 'Listening on HTTPS port ' + httpsPort );

//=============================================================================

var io = socketio.listen( httpServer );
//io.set( 'log level', 2 );
io.sockets.on( 'connection',
               function( socket )
               {
                   app.lobby.addPlayer( socket );
               } );

var ioSec = socketio.listen( httpsServer );
//ioSec.set( 'log level', 2 );
ioSec.sockets.on( 'connection',
               function( socket )
               {
                   app.lobby.addPlayer( socket );
               } );

//*****************************************************************************
