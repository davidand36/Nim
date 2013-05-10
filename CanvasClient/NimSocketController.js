/*
  NimSocketController.js

  Controller for online play of Nim using socket.io.
*/

//*****************************************************************************


var app = app || { };
app.nim = app.nim || { };


//=============================================================================


app.nim.socketController =
    function( socket, view )
    {
    //-------------------------------------------------------------------------

        var playerIndex = -1,
            piles = [],
            gameStatus = {};

    //=========================================================================

        function setup( )
        {
            setMessageHandlers( );
            socket.emit( 'ready' );
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
            console.log( 'Received game update type=' + data.updateData.type );

            playerIndex = data.playerIndex;

            switch ( data.updateData.type )
            {
            case 'start game':
            case 'new game':
                view.setMessage( data.updateData.message );
                piles = data.piles;
                view.setPiles( piles );
                gameStatus = data.status;
                setTimeout( update, 1.0 * 1000 );
                break;
            case 'move':
                if ( data.updateData.player !== playerIndex )
                {
                    view.setMessage( data.updateData.message );
                }
                else
                {
                    view.setMessage( 'Waiting for Player ' +
                                     (data.status.player + 1) );
                }
                piles = data.piles;
                view.setPiles( piles );
                gameStatus = data.status;
                setTimeout( update, 3.0 * 1000 );
                break;
            case 'disconnect':
                view.setMessage( data.updateData.message );
                setTimeout( handleWaiting, 2.0 * 1000 );
                break;
            }
        }

    //=========================================================================

        function update( )
        {
            switch ( gameStatus.status )
            {
            case 'playing':
                if ( playerIndex === gameStatus.player )
                {
                    view.setMessage( 'Your turn' );
                    $('#game').click( handleClick );
                }
                else
                {
                    view.setMessage( 'Waiting for Player ' +
                                     (gameStatus.player + 1) );
                }
                break;

            case 'winner':
                if ( playerIndex === gameStatus.player )
                {
                    view.setMessage( 'Congratulations. You won!', true );
                    setTimeout( requestNewGame, 5.0 * 1000 );
                }
                else
                {
                    view.setMessage( 'Sorry. Player' +
                                     (gameStatus.player + 1) + ' won.' );
                }
                break;
            }
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
