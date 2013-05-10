/*
  NimModel.js

  Model for the Nim game.
*/

//*****************************************************************************


if ( typeof global === 'undefined' )
{
    var app = app || { };
}
else
{
    global.app = global.app || { };
    var app = global.app;
}
app.nim = app.nim || { };


//=============================================================================


app.nim.model =
    function( rules )
    {
    //-------------------------------------------------------------------------

        var limits = {},
            piles = [],
            misère = false,
            random = εδ.shRandom,
            status = 'starting',
            player = 0;

    //=========================================================================

        init( rules || { } );

    //-------------------------------------------------------------------------

        function init( rules )
        {
            limits.minPiles =
                Math.max( rules.minPiles || 3, 1 ), 
            limits.maxPiles =
                Math.max( rules.maxPiles || 5, limits.minPiles ),
            limits.minCounters =
                Math.max( rules.minCounters || 3, 1 ),
            limits.maxCounters =
                Math.max( rules.maxCounters || 9, limits.minCounters ),
            limits.maxTotalCounters =
                Math.max( rules.maxTotalCounters ||
                          limits.maxPiles * limits.maxCounters,
                          limits.maxPiles ),

            misère = rules.misère || false;
            random = rules.random || εδ.shRandom;
        }

    //-------------------------------------------------------------------------

        function newGame( )
        {
            var numPiles = random.intBetween( limits.minPiles,
                                              limits.maxPiles + 1 ),
                p,
                c,
                totalCounters = 0;

            piles = [];
            for ( p = 0; p < numPiles; ++p )
            {
                c = random.intBetween( limits.minCounters,
                                       limits.maxCounters + 1 );
                piles.push( c );
                totalCounters += c;
            }

            p = 0;
            while ( totalCounters > limits.maxTotalCounters )
            {
                if ( piles[ p ] > 1 )
                    --piles[ p ];
                --totalCounters;
                p = εδ.math.wrap( ++p, 0, numPiles );
            }
            
            status = 'playing';
            player = 0;
        }
        
    //=========================================================================

        function getPiles( )
        {
            return piles;
        }
         
    //-------------------------------------------------------------------------

        function getStatus( )
        {
             return {
                 status: status,
                 player: player
             };
        }

    //-------------------------------------------------------------------------

         function getRules( )
         {
             return { misère: misère };
         }

    //=========================================================================

         function remove( pile, counters )
         {
             if ( status !== 'playing' )
             {
                 console.log( 'Not playing. Cannot remove' );
                 return false;
             }
             if ( pile < 0 || pile >= piles.length )
             {
                 console.log( 'Invalid pile (' + pile +
                              ') for nim.model.remove()' );
                 return false;
             }
             if ( counters <= 0 || counters > piles[ pile ] )
             {
                 console.log( 'Invalid counters (' + counters +
                              ') for nim.model.remove()' );
                 return false;
             }

             piles[ pile ] -= counters;

             updateStatus( );
             return true;
         }

    //-------------------------------------------------------------------------

         function updateStatus( )
         {
             var finished = true,
             i, numPiles = piles.length;

             for ( i = 0; i < numPiles; ++i )
             {
                 if ( piles[ i ] > 0 )
                 {
                     finished = false;
                     break;
                 }
             }
             
             if ( finished )
             {
                 status = 'winner';
                 if ( misère )  //last player loses...
                 {
                     player = 1 - player; //so other player wins
                 }
             }
             else
             {
                 player = 1 - player; //other player's turn
             }
         }

    //=========================================================================

         return {
             getPiles: getPiles,
             getStatus: getStatus,
             getRules: getRules,
             newGame: newGame,
             remove: remove
         };
         
    //-------------------------------------------------------------------------
    };


//*****************************************************************************
