/*
  NimCanvasView.js

  Displays the Nim game using the Canvas
*/

//*****************************************************************************


var app = app || { };
app.nim = app.nim || { };


//=============================================================================


app.nim.view =
    (function()
     {
    //-------------------------------------------------------------------------

         var canvas, ctx,
             gfx,
             counterScale,
             pilesLoc,
             messageLoc = {},
             piles = [],
             messageData = {},
             moveData = null,
             moveParams = {
                 playerFadeDuration: 1.0,
                 opponentBlinkDuration: 3.0,
                 opponentBlinkInterval: 0.5
             };

    //=========================================================================

         function setup( )
         {
             setupScreen( );
         }

    //-------------------------------------------------------------------------

         function resize( )
         {
             setupScreen( );
         }

    //-------------------------------------------------------------------------

         function setupScreen( )
         {
             var canW, canH, imgW, imgH,
             ctrW, ctrH, scaleH, scaleV,
             

             canvas = εδ.makeCanvas( 'canvasDiv' );
             ctx = canvas.getContext( '2d' );
             gfx = εδ.graphics( ctx );

             canW = canvas.width;
             canH = canvas.height;
             imgW = app.images.getSize( 'counter' ).width;
             imgH = app.images.getSize( 'counter' ).height;
             ctrW = canW / (10 + 9/3 + 2*3);
             ctrH = canH / (5 + 4 + 5 + 3);
             scaleH = ctrW / imgW;
             scaleV = ctrH / imgH;
             counterScale = Math.min( scaleH, scaleV );
             ctrW = counterScale * imgW;
             ctrH = counterScale * imgH;

             pilesLoc = { left: Math.round( 3 * ctrW ),
                          top: Math.round( 5 * ctrH ),
                          counterWidth: ctrW,
                          counterHeight: ctrH, 
                          spacingH: Math.round( ctrW * (4/3) ),
                          spacingV: Math.round( ctrH * 2 ) };
             messageLoc = { center: canW / 2,
                            top: ctrH,
                            fontSize: ctrH };
         }

    //=========================================================================

         function posToLoc( pos )
         {
             var pile,
             counter,
             x, y,
             i, d;

             y = pos.y - pilesLoc.top;
             if ( y < 0 )
                 return null;
             i = Math.floor( y / pilesLoc.spacingV );
             if ( i >= piles.length )
                 return null;
             d = y  -  i * pilesLoc.spacingV;
             if ( d > pilesLoc.counterHeight )
                 return null;
             pile = i;

             x = pos.x - pilesLoc.left;
             if ( x < 0 )
                 return null;
             i = Math.floor( x / pilesLoc.spacingH );
             if ( i >= piles[ pile ] )
                 return null;
             d = x  -  i * pilesLoc.spacingH;
             if ( d > pilesLoc.counterWidth )
                 return null;
             counter = i;
             
             return { pile: pile,
                      counter: counter };
         }

    //=========================================================================

         function update( time )
         {
             app.background.drawMain( );
             drawPiles( );
             drawMove( time );
             writeMessage( );
         }
         
    //=========================================================================

         function setPiles( pileCounts )
         {
             piles = pileCounts;
         }

    //-------------------------------------------------------------------------

         function drawPiles( )
         {
             var p, numPiles = piles.length,
                 c, numCtrs,
                 x, y;

             for ( p = 0; p < numPiles; ++p )
             {
                 y = pilesLoc.top  +  p * pilesLoc.spacingV;
                 for ( c = 0, numCtrs = piles[ p ]; c < numCtrs; ++c )
                 {
                     x = pilesLoc.left  +  c * pilesLoc.spacingH;
                     app.images.draw( ctx, 'counter', x, y, counterScale );
                 }
             }
         }

    //=========================================================================

         function setMove( player, pile, counters, time )
         {
             moveData = {
                 player: player,
                 pile: pile,
                 counters: counters,
                 startTime: time
             };
         }

    //-------------------------------------------------------------------------

         function drawMove( time )
         {
             var elapsed,
                 blinkCount;
             if ( ! moveData )
                 return;
             elapsed = time - moveData.startTime;
             if ( moveData.player === 'player' )
             {
                 if ( elapsed >= moveParams.playerFadeDuration )
                 {
                     moveData = null;
                     return;
                 }
                 ctx.save( );
                 ctx.globalAlpha =
                     1.0 - (elapsed / moveParams.playerFadeDuration);
                 drawRemovedCounters( );
                 ctx.restore( );
             }
             else //opponent
             {
                 if ( elapsed >= moveParams.opponentBlinkDuration )
                 {
                     moveData = null;
                     return;
                 }
                 blinkCount =
                     Math.floor( elapsed / moveParams.opponentBlinkInterval );
                 if ( (blinkCount & 1) === 0 )
                     return; //counters off
                 drawRemovedCounters( );
             }
         }

    //.........................................................................

         function drawRemovedCounters( )
         {
             var c, numCtrs = moveData.counters,
                 pileCounters = piles[ moveData.pile ],
                 ctr,
                 x, y;

             y = pilesLoc.top  +  moveData.pile * pilesLoc.spacingV;
             for ( c = 0; c < numCtrs; ++c )
             {
                 ctr = c + pileCounters;
                 x = pilesLoc.left  +  ctr * pilesLoc.spacingH;
                 app.images.draw( ctx, 'counter', x, y, counterScale );
             }
         }

    //=========================================================================

         function setMessage( text, highlight )
         {
             messageData.text = text;
             messageData.fillStyle =
                 highlight  ?  'rgb( 255, 255, 10 )'  :  'rgb( 255, 255, 255 )';
         }

    //-------------------------------------------------------------------------

         function writeMessage( )
         {
             if ( ! messageData.text )
                 return;

             ctx.save( );
             ctx.font = messageLoc.fontSize + 'px' + ' Text';
             ctx.fillStyle = messageData.fillStyle;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'top';
             ctx.fillText( messageData.text,
                           messageLoc.center, messageLoc.top );
             ctx.restore( );
         }

    //=========================================================================

         return {
             setup: setup,
             resize: resize,
             posToLoc: posToLoc,
             update: update,
             setPiles: setPiles,
             setMove: setMove,
             setMessage: setMessage
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************
