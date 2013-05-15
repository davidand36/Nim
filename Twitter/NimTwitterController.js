/*
  NimTwitterController.js

  Lobby & game controller for Nim game using Twitter
*/

//*****************************************************************************


require( './NimModel.js' );
require( './NimAI.js' );
require( './EpsDel/Random.js' );
_ = require( 'underscore' );

global.app = global.app || { };
var app = global.app;
app.nim = app.nim || { };


//=============================================================================


app.nim.twitterController =
    function( twitterClient, ourScreenName )
    {
    //-------------------------------------------------------------------------

        var players = {},
            normalGames = [],
            misèreGames = [],
            aiStrategy = 'optimal',
            nextPlayerId = 1,
            nextGameId = 1,
            playRegEx = /\bplay\b(?:\s*\b(ai|mis[eè]re)\b)?(?:\s*\b(ai|mis[eè]re)\b)?/i;
            removeRegEx = /(\d+)\D+(\d+)/;
        
    //=========================================================================

        function handleTweet( text, tweetId, userId, userName )
        {
            var player,
                command;

            console.log( 'Tweet: ' + text );

            if ( text.indexOf( '@' + ourScreenName ) !== 0 )
            {
                console.warn( 'Tweet from ' + userName + ' not @ me: ' + text );
                return;
            }
            text = text.substr( ourScreenName.length + 2 );

            command = parseTweet( text );
            if ( command === null )
            {
                console.log( 'Tweet from ' + userName + ' not understood:\n' +
                             text );
                //tweet( "Sorry. I don't understand that.", userName, tweetId );
                return;
            }

            console.log( 'Command: ' + JSON.stringify( command ) ); //!!!
            switch ( command.action )
            {
            case 'play':
                player = players[ (userId) ];
                if ( player )
                {
                    if ( player.status === 'waiting' )
                    {
                        console.log( 'Calling getAGame' ); //!!!
                        player.game = getAGame( player, command );
                        player.latestTweet = tweetId;
                    }
                    else
                    {
                        console.log( 'Player ' + player.id +
                                     ' (' + userName + ')' +
                                     ' already playing' );
                        //tweet( "You are already playing.", userName, tweetId );
                    }
                }
                else
                {
                    console.log( 'Calling addPlayer' ); //!!!
                    player = addPlayer( userId, userName, command );
                    player.latestTweet = tweetId;
                }
                break;
            case 'move':
                player = players[ (userId) ];
                if ( player )
                {
                    console.log( 'calling doMove' ); //!!!
                    if ( doMove( player, command ) )
                    {
                        player.latestTweet = tweetId;
                        sendGameUpdate( player.game,
                        {
                            type: 'move',
                            player: player,
                            pile: command.pile,
                            counters: command.counters
                        } );
                        updateGame( player.game );
                    }
                }
                else
                {
                    console.log( 'User ' + userId +
                                 ' not a player, tried to move' );
                    //tweet( "You are not playing.", userName, tweetId );
                }
                break;
            }
        }

    //=========================================================================

        function parseTweet( text )
        {
            var m,
                ai = false, misère = false,
                counters, pile,
                i;

            m = text.match( playRegEx );
            if ( m )
            {
                for ( i = 1; i <= 2; ++i )
                {
                    if ( m[ i ] )
                    {
                        if ( m[ i ] === 'ai' )
                            ai = true;
                        else if ( m[ i ].match( /mis[eè]re/i ) )
                            misère = true;
                    }
                }
                return {
                    action: 'play',
                    ai: ai,
                    misère: misère
                };
            }
            m = text.match( removeRegEx )
            if ( m )
            {
                counters = m[ 1 ];
                counters = parseInt( counters );
                pile = m[ 2 ];
                pile = parseInt( pile ) - 1; //UI is 1-based; we're 0-based
                console.log( 'counters=' + counters + ' pile=' + pile );
                return {
                    action: 'move',
                    pile: pile,
                    counters: counters
                };
            }
            return null;
        }

    //=========================================================================

        function addPlayer( userId, userName, playCommand )
        {
            var player,
                game;

            player = {
                id: nextPlayerId++,
                type: 'tweeter',
                userId: userId,
                userName: userName,
                status: 'starting'
            };
            player.game = getAGame( player, playCommand );
            players[ (userId) ] = player;
            return player;
        }

    //=========================================================================

        function getAGame( player, playCommand )
        {
            var rules = { misère: playCommand.misère },
                games = rules.misère  ?  misèreGames  :  normalGames,
                g, numGames = games.length,
                game;

            if ( playCommand.ai )
            {
                console.log( 'calling startAiGame' ); //!!!
                return startAiGame( player, games, rules );
            }

            console.log( 'looking for enrolling game' ); //!!!
            for ( g = 0; g < numGames; ++g )
            {
                game = games[ g ];
                if ( game.status === 'enrolling' )
                {
                    joinGame( game, player );
                    return game;
                }
            }
            console.log( 'calling makeNewGame' ); //!!!
            return makeNewGame( player, games, rules );
        }

    //-------------------------------------------------------------------------

        function startAiGame( player, games, rules )
        {
            var aiPlayer,
                model,
                ai,
                game;

            console.log( 'Starting AI game' );

            model = app.nim.model( rules );
            model.newGame( );
            ai = app.nim.ai( model, aiStrategy );
            
            aiPlayer = {
                id: nextPlayerId++,
                type: 'ai',
                ai: ai
            };
            game = {
                id: nextGameId++,
                status: 'playing',
                model: model
            };

            if ( aiStrategy === 'random' )
            {
                game.players = [ player, aiPlayer ];
                εδ.shuffleArray( game.players );
            }
            else
            {
                if ( ai.isWinningPosition() )
                {
                    game.players = [ player, aiPlayer ];
                }
                else
                {
                    game.players = [ aiPlayer, player ];
                }
            }
            player.status = 'playing';
            games.push( game );

            sendGameUpdate( game, { type: 'start game' } );
            updateGame( game );
            listGames( );

            return game;
        }

    //-------------------------------------------------------------------------

        function joinGame( game, player )
        {
            var numPlayers;

            console.log( 'Player ' + player.id + ' joining game ' + game.id );

            game.players.push( player );
            numPlayers = game.players.length;
            if ( numPlayers === 2 )
            {
                εδ.shuffleArray( game.players );
                game.model.newGame( );
                game.status = 'playing';
                for ( p = 0; p < numPlayers; ++p )
                {
                    game.players[ p ].status = 'playing';
                }
                sendGameUpdate( game, { type: 'start game' } );
                updateGame( game );
            }
            listGames( );
        }

    //-------------------------------------------------------------------------

        function makeNewGame( player, games, rules )
        {
            var game;

            console.log( 'Making a new game' );

            game = {
                id: nextGameId++,
                status: 'enrolling',
                players: [ player ],
                model: app.nim.model( rules )
            };
            player.status = 'waiting';
            games.push( game );

            sendGameUpdate( game, { type: 'waiting' } );

            listGames( );

            return game;
        }

    //=========================================================================

        function doMove( player, moveData )
        {
            var game,
                model,
                p,
                status,
                piles,
                pile, counters,
                moveRslt;

            if ( player.status !== 'playing' )
            {
                console.log( 'Player ' + player.id +
                             ' (' + player.userName + ')' +
                             ' not playing, tried to move' );
                //tweet( "You are not playing.", userName, tweetId );
                return false;
            }
            game = player.game;
            if ( ! game )
            {
                console.warn( 'Player ' + player.id +
                              ' (' + player.userName + ')' +
                              'playing, but no game' );
                return false;
            }

            model = game.model;
            if ( ! model )
            {
                console.warn( 'Player ' + player.id +
                              ' (' + player.userName + ')' +
                              'playing, but game ' + game.id +
                              ' has no model' );
                return false;
            }

            status = model.getStatus();
            if ( status.status !== 'playing' )
            {
                console.warn( 'Player ' + player.id +
                              ' (' + player.userName + ')' +
                              'playing, but game ' + game.id +
                              ' status=' + status.status );
                return false;
            }

            p = _.indexOf( game.players, player );
            if ( status.player !== p )
            {
                console.log( 'Player ' + player.id +
                             ' (' + player.userName + ')' +
                             ' moved out of turn' );
                //tweet( "It's not your turn.", userName, tweetId );
                return false;
            }

            piles = model.getPiles();
            pile = moveData.pile;
            counters = moveData.counters;
            if ( pile < 0 || pile >= piles.length )
            {
                console.log( 'Invalid pile (' + pile +
                             ') for nim.model.remove()' );
                //tweet( 'Invalid pile: ' + pile, userName, tweetId );
                return false;
            }
            if ( counters <= 0 || counters > piles[ pile ] )
            {
                console.log( 'Invalid counters (' + counters +
                             ') for nim.model.remove()' );
                //tweet( 'Invalid number of counters: ' + counters,
                //       userName, tweetId );
                return false;
            }

            moveRslt = model.remove( pile, counters );
            if ( moveRslt === false )
            {
                console.warn( 'In game ' + game.id +
                              ' remove( ' + pile + ', ' + counters + ' )' +
                              ' returned false. piles: ' + piles );
                return false;
            }

            console.log( 'Player ' + player.id + ' in game ' + game.id +
                         ' removed ' + counters + ' from pile ' + pile );

            return true;
        }

    //-------------------------------------------------------------------------

        function doAiMove( game, player )
        {
            var aiMove = player.ai.move( ),
                moveRslt = game.model.remove( aiMove.pile, aiMove.counters );
            if ( moveRslt === false )
            {
                console.warn( 'In game ' + game.id +
                              ' AI remove( ' + pile + ', ' + counters + ' )' +
                              ' returned false. piles: ' + piles );
            }
            else
            {
                sendGameUpdate( game,
                                {
                                    type: 'move',
                                    player: player,
                                    pile: aiMove.pile,
                                    counters: aiMove.counters
                                } );

                console.log( 'AI player ' + player.id + 'in game' + game.id +
                             ' removed ' + aiMove.counters +
                             ' from pile ' + aiMove.pile );

                updateGame( game );
            }
        }

    //=========================================================================

        function updateGame( game )
        {
            var model = game.model,
            status = model.getStatus(),
                playerIndex = status.player,
                player = game.players[ playerIndex ];

            console.log( 'updateGame status=' + status.status + ' playerIdx=' + playerIndex );

            switch ( status.status )
            {
            case 'playing':
                if ( player.type === 'ai' )
                {
                    doAiMove( game, player );
                }
                else
                {
                    sendGameUpdate( game,
                                    {
                                        type: 'turn',
                                        player: player
                                    } );
                }
                break;
            case 'winner':
                sendGameUpdate( game,
                                {
                                    type: 'winner',
                                    player: player
                                } );
                endGame( game );
                break;
            }
        }
        
    //=========================================================================

        function endGame( game )
        {
            var p, numPlayers = game.players.length,
                player,
                rules = game.model.getRules(),
                games = rules.misère  ?  misèreGames  :  normalGames,
                g;

            console.log( 'Ending game ' + game.id );

            for ( p = 0; p < numPlayers; ++p )
            {
                player = game.players[ p ];
                player.game = null;
                if ( player.type === 'tweeter' )
                {
                    delete players[ (player.userId) ];
                }
            }
            g = _.indexOf( games, game );
            games.splice( g, 1 );

            listGames( );
        }

    //=========================================================================

        function sendGameUpdate( game, data )
        {
            var message,
                player, other,
                model,
                misère,
                piles;

            switch ( data.type )
            {
            case 'waiting':
                player = game.players[ 0 ];
                tweet( 'Waiting for an opponent to join game',
                       player.userName, player.lastTweet );
                break;
            case 'start game':
                message = makePlayerTags( game.players );
                message += ' are starting a game.';
                model = game.model;
                misère = model.getRules().misère;
                message += ' Last player to take a counter';
                message += misère ? ' loses. ' : ' wins. ';
                piles = model.getPiles();
                message += makePilesString( piles );
                tweet( message );
                break;
            case 'move':
                player = data.player;
                message = makePlayerTag( player );
                message += ' removed ';
                message += data.counters.toString();
                message +=' counters from pile ';
                message += (data.pile + 1).toString();
                message += '. ';
                model = game.model;
                piles = model.getPiles();
                message += makePilesString( piles );
                other = getOtherPlayer( game, player );
                if ( other.type === 'tweeter' )
                {
                    tweet( message, other.userName, other.lastTweet );
                }
                break;
            case 'turn':
                player = data.player;
                message = 'Your turn. ';
                model = game.model;
                piles = model.getPiles();
                message += makePilesString( piles );
                tweet( message, player.userName, player.lastTweet );
                break;
            case 'winner':
                player = data.player;
                other = getOtherPlayer( game, player );
                if ( player.type === 'tweeter' )
                {
                    message = 'Congratulations. You won!';
                    tweet( message, player.userName, player.lastTweet );
                }
                if ( other.type === 'tweeter' )
                {
                    message = 'Sorry. ';
                    message += makePlayerTag( player );
                    message += ' won.';
                    tweet( message, other.userName, other.lastTweet );
                }
                break;
            }
        }
         
    //-------------------------------------------------------------------------

        function tweet( message, replyName, replyTweetId )
        {
            var params = {};
            if ( replyName )
                message = '@' + replyName + ' ' + message;
            message = message.substr( 0, 139 );
            if ( replyTweetId )
            {
                params = { in_reply_to_status_id: replyTweetId };
            }
            console.log( 'Sending tweet: ' + message );
            twitterClient.updateStatus( message, params, handleTweetResult );
        }

    //-------------------------------------------------------------------------

        function handleTweetResult( err, data )
        {
            if ( err )
            {
                console.warn( 'Tweet error:\n' + JSON.stringify( err ) );
            }
            else
            {
                //console.log( 'Tweet data:\n' + JSON.stringify( data ) );
            }
        }

    //-------------------------------------------------------------------------

        function makePilesString( piles )
        {
            var pilesStr = 'Piles: ',
                p, numPiles = piles.length,
                c, numCounters;

            for ( p = 0; p < numPiles; ++p )
            {
                if ( p > 0 )
                    pilesStr += '  ';
                pilesStr += (p + 1).toString();
                pilesStr += ': ';
                numCounters = piles[ p ];
                for ( c = 0; c < numCounters; ++c )
                {
                    pilesStr += '*';
                }
            }
            return pilesStr;
        }

    //-------------------------------------------------------------------------

        function makePlayerTag( player )
        {
            if ( player.type === 'tweeter' )
            {
                return '@' + player.userName;
            }
            else
            {
                return 'AI';
            }
        }

    //-------------------------------------------------------------------------

        function makePlayerTags( players )
        {
            return (_.map( players, makePlayerTag )).join( ', ' );
        }

    //-------------------------------------------------------------------------
            
        function getOtherPlayer( game, player )
        {
            var p, numPlayers = game.players.length;
            for ( p = 0; p < numPlayers; ++p )
            {
                if ( game.players[ p ] !== player )
                    return game.players[ p ];
            }
        }

    //=========================================================================

        function listGames( )
        {
            var t,
                games,
                g, numGames, game,
                p, numPlayers, player;

            for ( t = 0; t < 2; ++t )
            {
                if ( t === 0 )
                {
                    games = normalGames;
                    console.log( 'Normal games:' );
                }
                else
                {
                    games = misèreGames;
                    console.log( 'Misère games:' );
                }
                numGames = games.length;
                for ( g = 0; g < numGames; ++g )
                {
                    game = games[ g ];
                    console.log( 'Game ' + game.id + ' status=' + game.status );
                    numPlayers = game.players.length;
                    for ( p = 0; p < numPlayers; ++p )
                    {
                        player = game.players[ p ];
                        if ( player.type === 'ai' )
                        {
                            console.log( '  AI player (' + player.id +
                                         ')' );
                        }
                        else
                        {
                            console.log( '  Player (' + player.id +
                                         ') userName=' + player.userName +
                                         ' status=' + player.status );
                        }
                    }
                }
            }
        }

    //=========================================================================

         return {
             handleTweet: handleTweet
         };
         
    //-------------------------------------------------------------------------
    };


//*****************************************************************************
