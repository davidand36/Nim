/*
  SplashScreen.js

  Splash screen for Nim game
*/

//*****************************************************************************


var app = app || { };
app.screens = app.screens || { };


//*****************************************************************************


app.screens[ 'splash' ] =
    (function()
     {
    //-------------------------------------------------------------------------

         var getProgressFn,
             minScreenTime = 2.0, //Minimum time on this screen (sec)
             splashDone, progressDone,
             nextScreen = 'nim',
             canvas, ctx,
             gfx,
             logoPos, logoSize,
             progressRect;

    //=========================================================================

         function run( getProgress )
         {
             getProgressFn = getProgress;
             splashDone = false;
             progressDone = false;
             setupScreen( );
             setTimeout( setSplashDone, minScreenTime * 1000 );
             εδ.displayLoop.setUpdateFunction( updateProgress );
         }
         
    //-------------------------------------------------------------------------

         function setupScreen( )
         {
             app.background.drawMain( );
             canvas = εδ.makeCanvas( 'canvasDiv' );
             ctx = canvas.getContext( '2d' );
             gfx = εδ.graphics( ctx );
             setupScreenAreas( );
             drawLogo( );
         }

    //-------------------------------------------------------------------------

         function stop( )
         {
             εδ.displayLoop.setUpdateFunction( null );
         }

    //-------------------------------------------------------------------------

         function resize( )
         {
             setupScreen( );
         }

    //=========================================================================

         function setupScreenAreas( )
         {
             logoPos = {
                 x: canvas.width / 2,
                 y: canvas.height / 2
             };
             logoSize = (canvas.height / 4) + 'px';

             progressRect = {
                 x: canvas.width / 4,
                 y: canvas.height * 0.65,
                 width: canvas.width / 2,
                 height: canvas.height * 0.10,
                 radius: canvas.height * 0.02
             };
         }

    //=========================================================================

         function drawLogo( )
         {
             ctx.save( );

             ctx.font = logoSize + ' Logo';
             ctx.fillStyle = 'rgb( 255, 255, 10 )';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'alphabetic';
             ctx.fillText( 'NIM', logoPos.x, logoPos.y );

             ctx.restore( );
         }

    //=========================================================================

         function setSplashDone( )
         {
             splashDone = true;
             if ( progressDone )
             {
                 app.showScreen( nextScreen );
             }
         }

    //=========================================================================

         function updateProgress( )
         {
             var progress = getProgressFn( );
             if ( progressDone )
                 return;
             if ( progress < 1 )
             {
                 drawProgress( progress );
             }
             else
             {
                 drawProgress( 1 );
                 setTimeout( finishProgress, 100 );
             }
         }

    //-------------------------------------------------------------------------

         function drawProgress( progress )
         {
             ctx.save( );
             ctx.beginPath( );
             ctx.rect( progressRect.x, progressRect.y,
                       progressRect.width * progress,
                       progressRect.height );
             ctx.clip( );
             ctx.beginPath( );
             ctx.fillStyle = 'rgb( 255, 255, 255 )';
             gfx.fillRoundedRect( progressRect.x, progressRect.y,
                                  progressRect.width, progressRect.height,
                                  progressRect.radius );
             ctx.restore( );

             ctx.save( );
             ctx.strokeStyle = 'rgb( 10, 10, 208 )';
             ctx.lineWidth = 6;
             gfx.strokeRoundedRect( progressRect.x, progressRect.y,
                                    progressRect.width, progressRect.height,
                                    progressRect.radius );
             ctx.restore( );
         }

    //-------------------------------------------------------------------------

         function finishProgress( )
         {
             progressDone = true;
             if ( splashDone )
             {
                 app.showScreen( nextScreen );
             }
         }

    //=========================================================================

         return {
             run: run,
             stop: stop,
             resize: resize
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************
