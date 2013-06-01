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

         var minScreenTime = 2.0, //Minimum time on this screen (sec)
             screenPromise,
             numPromises, promisesResolved,
             nextScreen = 'nim',
             canvas, ctx,
             gfx,
             logoPos, logoSize,
             progressRect;

    //=========================================================================

         function run( promises )
         {
             setupPromises( promises );
             setupScreen( );
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

         function setupPromises( promises )
         {
             var i;
             setupScreenPromise( );
             numPromises = promises.length;
             promisesResolved = 0;
             for ( i = 0; i < numPromises; ++i )
             {
                 promises[ i ].done(
                     function( data )
                     {
                         ++promisesResolved;
                     } );
             }
             setAllDone( promises );
         }

    //-------------------------------------------------------------------------

         function setupScreenPromise( )
         {
             var screenDeferred = $.Deferred();
             εδ.deferred.resolveOnTimeout( screenDeferred, minScreenTime );
             screenPromise = screenDeferred.promise();
         }

    //-------------------------------------------------------------------------

         function setAllDone( promises )
         {
             var allPromises = [];
             allPromises = allPromises.concat( promises );
             allPromises = allPromises.concat( screenPromise );
             εδ.deferred.whenAll( allPromises ).done(
                 function( )
                 {
                     app.showScreen( nextScreen );
                 } );
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

         function updateProgress( )
         {
             var progress =
                 (numPromises === 0)  ?  0  :  promisesResolved / numPromises;
             drawProgress( progress );
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
