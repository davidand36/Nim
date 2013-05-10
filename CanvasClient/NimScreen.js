/*
  NimScreen.js

  Screen module for Nim game
*/

//*****************************************************************************


var app = app || { };
app.screens = app.screens || { };


//*****************************************************************************


app.screens[ "nim" ] =
    (function()
     {
    //-------------------------------------------------------------------------

         var view,
             controller,
             timer = εδ.timer( );

    //=========================================================================

         function run( )
         {
             var model;

             view = app.nim.view;

             if ( app.socket )
             {
                 controller = app.nim.socketController( app.socket, view );
             }
             else
             {
                 model = app.nim.model( app.settings.rules );
                 controller = app.nim.offlineController( model, view );
             }

             view.setup( );
             controller.setup( );
             εδ.displayLoop.setUpdateFunction( update );
         }
         
    //=========================================================================

         function stop( )
         {
             controller.stop( );
             εδ.displayLoop.setUpdateFunction( null );
             εδ.audio.stopAll( );
         }

    //=========================================================================

         function resize( )
         {
             view.resize( );
         }

    //=========================================================================

         function update( )
         {
             view.update( timer.getSeconds() );
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
