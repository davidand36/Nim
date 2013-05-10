/*
  BackgroundCanvas.js

  Draw the background on a canvas.
*/

//*****************************************************************************


var app = app || { };


//*****************************************************************************


app.background =
    (function()
     {
    //-------------------------------------------------------------------------

         var mainCanvas, mainCtx,
             mainBgCanvas;

    //=========================================================================

         function drawMain( rect )
         {
             findMainCtx( );
             if ( ! mainBgCanvas )
             {
                 makeMainBg( );
             }

             rect = rect ||
                 { x: 0, y: 0,
                   width: mainCanvas.width,
                   height: mainCanvas.height };
             mainCtx.drawImage( mainBgCanvas,
                                rect.x, rect.y, rect.width, rect.height,
                                rect.x, rect.y, rect.width, rect.height );
         }

    //-------------------------------------------------------------------------

         function findMainCtx( )
         {
             if ( ! mainCtx )
             {
                 mainCanvas = εδ.makeCanvas( 'canvasDiv' );
                 mainCtx = mainCanvas.getContext( '2d' );
             }
         }

    //-------------------------------------------------------------------------

         function makeMainBg( )
         {
             var bgCtx,
                 w, h;
             
             mainBgCanvas = εδ.copyCanvas( mainCanvas );
             bgCtx = mainBgCanvas.getContext( '2d' );
             w = mainBgCanvas.width;
             h = mainBgCanvas.height;

             bgCtx.fillStyle = 'rgb( 0, 0, 0 )';
             bgCtx.fillRect( 0, 0, w, h );
         }

    //=========================================================================

         function resize( newDims )
         {
             mainCtx = null;
             findMainCtx( );
             mainBgCanvas = null;
             makeMainBg( );
         }

    //=========================================================================

         return {
             drawMain: drawMain,
             resize: resize
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************
