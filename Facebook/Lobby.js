/*
  Lobby.js

  Lobby for game players using sockets
*/

//*****************************************************************************


require( './NimModel.js' );
require( './NimAI.js' );
require( './EpsDel/Random.js' );

global.app = global.app || { };
var app = global.app;


//=============================================================================


app.lobby =
    (function( rules )
    {
    //-------------------------------------------------------------------------

        var games = [],
            nextPlayerId = 1;

    //=========================================================================

        function addPlayer( socket )
        {
            console.log( 'Adding player ' + nextPlayerId );
            socket.set( 'player',
                        {
                            id: nextPlayerId++,
                            type: 'human',
                            socket: socket,
                            status: 'starting'
                        },
                        function( )
                        {
                            setHandlers( socket );
                        } );
        }

    //=========================================================================

        function setHandlers( socket )
        {
            socket.on(
                'ready',
                function( data )
                {
                    socket.get(
                        'player',
                        function( err, player )
                        {
                            handleReady( player, data );
                        } );
                } );
            socket.on(
                'move',
                function( data )
                {
                    socket.get(
                        'player',
                        function( err, player )
                        {
                            handleMove( player, data );
                        } );
                } );
            socket.on(
                'new game',
                function( data )
                {
                    socket.get(
                        'player',
                        function( err, player )
                        {
                            handleNewGame( player );
                        } );
                } );
            socket.on(
                'disconnect',
                function( )
                {
                    socket.get(
                        'player',
                        function( err, player )
                        {
                            handleDisconnect( player );
                        } );
                } );
        }

    //-------------------------------------------------------------------------

        function handleReady( player, data )
        {
            console.log( 'Player '+ player.id + ' sent ready' );
            if ( player.status === 'starting' )
            {
                if ( data && data.name )
                {
                    console.log( 'Name: ' + data.name );
                    player.name = data.name;
                }
                player.game = joinGame( player );
                player.socket.set( 'player', player );
            }
            else
            {
                console.warn( 'player.status not starting' );
            }
        }

    //-------------------------------------------------------------------------

        function handleMove( player, data )
        {
            var socket = player.socket,
                game,
                model,
                p,
                status,
                result,
                message;

            console.log( 'Player '+ player.id + ' sent move' );
            if ( player.status === 'playing' )
            {
                game = player.game;
                p = game.players.indexOf( player );
                if ( p < 0 )
                {
                    message = 'Player not in game.players';
                    socket.emit( 'warning', message );
                    console.error( message );
                    return;
                }
                model = game.model;
                status = model.getStatus();
                if ( status.status === 'playing' )
                {
                    if ( status.player === p )
                    {
                        result = model.remove( data.pile, data.counters );
                        if ( result )
                        {
                            broadcastGameUpdate( game,
                                                 {
                                                     type: 'move',
                                                     player: p,
                                                     pile: data.pile,
                                                     counters: data.counters
                                                 } );
                        }
                    }
                    else
                    {
                        console.warn( "Not player's turn" );
                    }
                }
                else
                {
                    console.warn( 'model status not playing' );
                }
            }
            else
            {
                console.warn( 'player.status !== playing' );
            }
        }

    //-------------------------------------------------------------------------

        function handleNewGame( player )
        {
            var game,
                model,
                status;

            console.log( 'Player '+ player.id + ' sent new game' );
            if ( player.status === 'playing' )
            {
                game = player.game;
                model = game.model;
                status = model.getStatus();
                if ( status.status === 'winner' )
                {
                    model.newGame( );
                    εδ.shuffleArray( game.players );
                    broadcastGameUpdate( game,
                                         {
                                             type: 'new game',
                                             players: listPlayers( game )
                                         } );
                }
                else
                {
                    console.warn( 'Not starting new game: no winner yet.' );
                }
            }
            else
            {
                console.warn( 'player.status not playing' );
            }
        }

    //-------------------------------------------------------------------------

        function handleDisconnect( player )
        {
            var game = player.game,
                p,
                g;

            console.log( 'Player '+ player.id + ' disconnected' );
            player.socket = null;
            if ( game )
            {
                player.game = null;
                p = game.players.indexOf( player );
                game.players.splice( p, 1 );
                if ( game.players.length === 0 )
                {
                    g = games.indexOf( game );
                    games.splice( g, 1 );
                }
                else
                {
                    game.status = 'enrolling';
                    broadcastGameUpdate( game,
                                         {
                                             type: 'disconnect',
                                             player: p
                                         } );
                }
                listGames( );
            }
        }

    //=========================================================================

        function joinGame( player )
        {
            var g, numGames = games.length,
                game,
                p, numPlayers;
            for ( g = 0; g < numGames; ++g )
            {
                game = games[ g ];
                if ( game.status === 'enrolling' )
                {
                    //Joining a game
                    game.players.push( player );
                    numPlayers = game.players.length;
                    if ( numPlayers === 2 )
                    {
                        εδ.shuffleArray( game.players );
                        game.model = app.nim.model( );
                        game.model.newGame( );
                        game.status = 'playing';
                        for ( p = 0; p < numPlayers; ++p )
                        {
                            game.players[ p ].status = 'playing';
                        }
                        broadcastGameUpdate( game,
                                             {
                                                 type: 'start game',
                                                 players: listPlayers( game )
                                             } );
                    }
                    listGames( );
                    return game;
                }
            }
            //No game to join, start new one
            game =
                {
                    status: 'enrolling',
                    players: [ player ]
                };
            games.push( game );
            listGames( );
            player.socket.emit( 'waiting' );
            player.status = 'waiting';
            return game;
        }

    //=========================================================================

        function broadcastGameUpdate( game, data )
        {
            var model = game.model,
                piles, status,
                players = game.players,
                p, numPlayers = players.length,
                player;
            if ( ! model )
            {
                console.error( 'No model for game' );
                return;
            }
            piles = model.getPiles( );
            status = model.getStatus( );
            for ( p = 0; p < numPlayers; ++p )
            {
                player = players[ p ];
                player.socket.emit(
                    'game update',
                    {
                        playerIndex: p,
                        updateData: data,
                        piles: piles,
                        status: status
                    } );
            }
        }

    //=========================================================================

        function listPlayers( game )
        {
            var names = [],
                p, numPlayers = game.players.length, player,
                name;
            for ( p = 0; p < numPlayers; ++p )
            {
                player = game.players[ p ];
                switch ( player.type )
                {
                case 'human':
                    if ( player.name )
                        name = player.name;
                    else
                        name = 'Player ' + (p + 1);
                    break;
                case 'ai':
                    name = 'AI';
                    break;
                }
                names.push( name );
            }
            return names;
        }

    //=========================================================================

        function listGames( )
        {
            var g, numGames = games.length, game,
                p, numPlayers, player;

            for ( g = 0; g < numGames; ++g )
            {
                game = games[ g ];
                console.log( 'Game ' + g + ') status=' + game.status );
                numPlayers = game.players.length;
                for ( p = 0; p < numPlayers; ++p )
                {
                    player = game.players[ p ];
                    console.log( '   Player ' + p + ') id=' + player.id +
                                 ' status=' + player.status );
                }
            }
        }

    //=========================================================================

         return {
             addPlayer: addPlayer
         };
         
    //-------------------------------------------------------------------------
    }
)();


//*****************************************************************************
