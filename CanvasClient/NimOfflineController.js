/*
  NimOfflineController.js

  Controller for offline play of Nim.
*/

//*****************************************************************************


var app = app || { };
app.nim = app.nim || { };


//=============================================================================


app.nim.offlineController =
    function( model, view, gameTime )
    {
    //-------------------------------------------------------------------------

        var players = [ 'player', 'ai' ],
            aiStrategy = 'optimal',
            ai;

    //=========================================================================

        function setup( )
        {
            ai = app.nim.ai( model, aiStrategy );
            newGame( );
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

        function newGame( )
        {
            model.newGame( );
            if ( aiStrategy === 'random' )
            {
                εδ.shuffleArray( players );
            }
            else
            {
                if ( ai.isWinningPosition() )
                {
                    players = [ 'player', 'ai' ]; //Always give the
                }                                 //human a chance.
                else
                {
                    players = [ 'ai', 'player' ];
                }
            }
            view.setPiles( model.getPiles() );
            update( );
        }

    //=========================================================================

        function update( )
        {
            var status = model.getStatus(),
                move;

            switch ( status.status )
            {
            case 'playing':
                switch ( players[ status.player ] )
                {
                case 'player':
                    view.setMessage( 'Your turn' );
                    $('#game').click( handleClick );
                    break;
                case 'ai':
                    move = ai.move( );
                    model.remove( move.pile, move.counters );
                    view.setPiles( model.getPiles() );
                    view.setMove( 'opponent',
                                  move.pile, move.counters,
                                  gameTime.getSeconds() );
                    setTimeout( update, 1.0 * 1000 );
                    break;
                }
                break;
            case 'winner':
                switch ( players[ status.player ] )
                {
                case 'player':
                    view.setMessage( 'Congratulations. You won!', true );
                    break;
                case 'ai':
                    view.setMessage( 'Sorry. Computer won.' );
                    break;
                }
                setTimeout( newGame, 5.0 * 1000 );
                break;
            }
        }

    //=========================================================================

        function handleClick( event )
        {
            var pos = εδ.input.getEventPos( event, $("#game") ),
                loc = view.posToLoc( pos ),
                piles = model.getPiles(),
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
                        $('#game').off( 'click' );
                        view.setMessage( '' );
                        model.remove( pile, counters );
                        view.setMove( 'player', pile, counters,
                                      gameTime.getSeconds() );
                        setTimeout( update, 2.0 * 1000 );
                    }
                }
            }
        }

    //=========================================================================

         return {
             setup: setup,
             stop: stop
         };
         
    //-------------------------------------------------------------------------
    };


//*****************************************************************************
