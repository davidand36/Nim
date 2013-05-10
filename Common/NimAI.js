/*
  NimAI.js

  AI player for the Nim game.
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


app.nim.ai =
    function( model, strategy )
    {
    //-------------------------------------------------------------------------

        strategy = strategy || 'optimal';

    //=========================================================================

        function move( )
        {
            if ( strategy === 'random' )
                return randomMove( );
            else //'optimal'
                return optimalMove( );
        }

    //-------------------------------------------------------------------------

        function randomMove( )
        {
            var piles = model.getPiles(),
                nonemptyPiles = getNonemptyPiles( piles ),
                n = εδ.shRandom.integer( nonemptyPiles.length ),
                pile = nonemptyPiles[ n ],
                counters = εδ.shRandom.integer( piles[ pile ] ) + 1;
            return {
                pile: pile,
                counters: counters
            };
        }

    //-------------------------------------------------------------------------

        function optimalMove( )
        {
            var piles = model.getPiles(),
                nonemptyPiles = getNonemptyPiles( piles ),
                misère = model.getRules().misère,
                nontrivialPiles,
                pile, counters;

            if ( misère )
            {
                nontrivialPiles = getNontrivialPiles( piles );
                if ( nontrivialPiles.length === 1 )
                {
                    pile = nontrivialPiles[ 0 ];
                    counters = piles[ pile ];
                    if ( nonemptyPiles.length & 1 === 0 ) //even
                    {   //remove the nontrivial pile
                        return {
                            pile: pile,
                            counters: counters
                        };
                    }
                    else //odd
                    {   //leave one counter in the nontrivial pile
                        return {
                            pile: pile,
                            counters: counters - 1
                        };
                    }
                }
                else
                {
                    return optimalNormaMove( piles );
                }
            }
            else
            {
                return optimalNormalMove( piles );
            }
        }

    //.........................................................................

        function optimalNormalMove( piles )
        {
            var nimSum = getNimSum( piles ),
                highBit = getHighBit( nimSum ),
                sameBitPiles = getSameBitPiles( highBit, piles ),
                numSameBitPiles = sameBitPiles.length,
                pile, counters;

            if ( numSameBitPiles > 0 ) //can get a winning position
            {
                pile = sameBitPiles[ εδ.shRandom.integer( numSameBitPiles ) ];
                counters = piles[ pile ];
                counters -= (counters ^ nimSum);
                return {
                    pile: pile,
                    counters: counters
                };
            }
            else //cannot get a winning position
            {
                return randomMove( );
                /* Or play for time:
                pile = getBiggestPile( piles );
                return {
                    pile: pile,
                    counters: 1
                };
                */
            }
        }

    //-------------------------------------------------------------------------

        function getNonemptyPiles( piles )
        {
            var nonemptyPiles = [],
                i, numPiles = piles.length;
            for ( i = 0; i < numPiles; ++i )
            {
                if ( piles[ i ] > 0 )
                    nonemptyPiles.push( i );
            }
            return nonemptyPiles;
        }

    //.........................................................................

        function getNontrivialPiles( piles )
        {
            var nontrivialPiles = [],
                i, numPiles = piles.length;
            for ( i = 0; i < numPiles; ++i )
            {
                if ( piles[ i ] > 1 )
                    nontrivialPiles.push( i );
            }
            return nontrivialPiles;
        }

    //.........................................................................

        function getNimSum( piles )
        {
            var nimSum = 0,
                i, numPiles = piles.length;
            for ( i = 0; i < numPiles; ++i )
            {
                nimSum ^= piles[ i ];
            }
            return nimSum;
        }

    //.........................................................................

        function getHighBit( number )
        {
            var highBit = 1;
            if ( number === 0 )
                return 0;
            while ( (highBit << 1) <= number )
                highBit <<= 1;
            return highBit;
        }

    //.........................................................................

        function getSameBitPiles( highBit, piles )
        {
            var sameBitPiles = [],
                i, numPiles = piles.length;

            for ( i = 0; i < numPiles; ++i )
            {
                if ( (piles[ i ] & highBit) !== 0 )
                {
                    sameBitPiles.push( i );
                }
            }
            return sameBitPiles;
        }

    //.........................................................................

        function getBiggestPile( piles )
        {
            var biggestIndex, biggestSize = 0,
                i, numPiles = piles.length,
                count;

            for ( i = 0; i < numPiles; ++i )
            {
                count = piles[ i ];
                if ( count > biggestSize )
                {
                    biggestIndex = i;
                    biggestSize = count;
                }
            }
            return biggestIndex;
        }

    //=========================================================================

        function isWinningPosition( ) //Can next player force win?
        {
            var piles,
                numSum;
            if ( strategy === 'random' )
            {
                return false;
            }
            else //'optimal'
            {
                piles = model.getPiles();
                nimSum = getNimSum( piles );

                if ( model.getRules().misère )
                {
                    if ( getNontrivialPiles( piles ).length > 0 )
                        return (nimSum !== 0);
                    else
                        return (nimSum === 0);
                }
                else
                {
                    return (nimSum !== 0);
                }
            }
        }

    //=========================================================================

         return {
             move: move,
             isWinningPosition: isWinningPosition
         };
         
    //-------------------------------------------------------------------------
    };


//*****************************************************************************

