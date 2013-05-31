/*
  NimSocketController.js

  Controller for online play of Nim using socket.io.
*/

//*****************************************************************************


var app = app || { };
app.nim = app.nim || { };


//=============================================================================


app.nim.socketController =
    function( socket, view, gameTime )
    {
    //-------------------------------------------------------------------------

        var playerIndex = -1,
            players = [],
            piles = [],
            gameStatus = {};

    //=========================================================================

        function setup( )
        {
            setMessageHandlers( );
            socket.emit( 'ready', { name: null } );
        }

    //=========================================================================

        function stop( )
        {
             clearEventHandlers( );
        }

    //-------------------------------------------------------------------------

        function clearEventHandlers( )
        {
            $('#game').off( 'click' );
            //!!!clear timeouts
        }

    //=========================================================================

        function setMessageHandlers( )
        {
            socket.on(
                'waiting',
                function( data )
                {
                    handleWaiting( );
                } );
            socket.on(
                'game update',
                function( data )
                {
                    handleGameUpdate( data );
                } );
            socket.on(
                'warning',
                function( data )
                {
                    handleWarning( data );
                } );
        }

    //-------------------------------------------------------------------------

        function handleWaiting( )
        {
            console.log( 'Received waiting' );
            view.setMessage( 'Waiting for an opponent' );
            // Could offer to play against AI
        }

    //-------------------------------------------------------------------------

        function handleGameUpdate( data )
        {
            var pl;

            console.log( 'Received game update type=' + data.updateData.type );

            playerIndex = data.playerIndex;

            switch ( data.updateData.type )
            {
            case 'start game':
            case 'new game':
                players = data.updateData.players;
                setMessage( 'new game' );
                piles = data.piles;
                view.setPiles( piles );
                gameStatus = data.status;
                setTimeout( update, 1.0 * 1000 );
                break;
            case 'move':
                piles = data.piles;
                view.setPiles( piles );
                pl = (gameStatus.player === playerIndex) ?
                    'player' : 'opponent';
                view.setMove( pl,
                              data.updateData.pile,
                              data.updateData.counters,
                              gameTime.getSeconds() );
                gameStatus = data.status;
                setTimeout( update, 0.1 * 1000 );
                break;
            case 'disconnect':
                setMessage( 'disconnect' );
                setTimeout( handleWaiting, 2.0 * 1000 );
                break;
            }
        }

    //-------------------------------------------------------------------------

        function handleWarning( message )
        {
            console.log( 'Warning: ' + message );
        }

    //=========================================================================

        function update( )
        {
            switch ( gameStatus.status )
            {
            case 'playing':
                setMessage( 'turn' );
                if ( gameStatus.player === playerIndex )
                {
                    $('#game').click( handleClick );
                }
                break;
            case 'winner':
                setMessage( 'winner' );
                if ( gameStatus.player === playerIndex )
                {
                    setTimeout( requestNewGame, 5.0 * 1000 );
                }
                break;
            }
        }

    //=========================================================================

        function setMessage( type )
        {
            var message;
            switch ( type )
            {
            case 'new game':
                message = 'Starting a game between ';
                if ( playerIndex === 0 )
                {
                    message += 'you and ';
                    message += players[ 1 ];
                }
                else
                {
                    message += players[ 0 ];
                    message += ' and you';
                }
                break;
            case 'turn':
                if ( gameStatus.player === playerIndex )
                {
                    message = 'Your turn';
                }
                else
                {
                    message = 'Waiting for ';
                    message += players[ gameStatus.player ];
                }
                break;
            case 'winner':
                if ( playerIndex === gameStatus.player )
                {
                    message = 'Congratulations. You won!';
                }
                else
                {
                    message = 'Sorry. ' +
                        players[ gameStatus.player ] + ' won.';
                }
                break;   
            case 'disconnect':
                message = players[ 1 - playerIndex ];
                message += ' was disconnected';
                break;
            }
            view.setMessage( message );
        }

    //=========================================================================

        function handleClick( event )
        {
            var pos = εδ.input.getEventPos( event, $("#game") ),
                loc = view.posToLoc( pos ),
                pile, counters;

            event.preventDefault( );

            if ( loc )
            {
                pile = loc.pile;
                if ( (pile >= 0) && (pile < piles.length) )
                {
                    counters = piles[ pile ] - loc.counter;
                    if ( counters > 0 )
                    {
                        socket.emit( 'move',
                                     {
                                         pile: pile,
                                         counters: counters
                                     } );
                        $('#game').off( 'click' );
                    }
                }
            }
        }

    //=========================================================================

        function requestNewGame( )
        {
            socket.emit( 'new game' );
        }

    //=========================================================================

         return {
             setup: setup,
             stop: stop
         };
         
    //-------------------------------------------------------------------------
    };


//*****************************************************************************
