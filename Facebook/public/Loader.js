/*
  Loader.js

  Manages loading of scripts and resources.
*/

//*****************************************************************************


//Our one global object:
var app = app || { };


//*****************************************************************************


app.loader =
    (function()
     {
    //-------------------------------------------------------------------------

         function loadFirstScripts( )
         {
             var useZepto = ('__proto__' in {}),
                 zjLoad,
                 libsLoad;

             var firstScripts =
                 [
                     "EpsDel/ErrorHandler.js",
                     "EpsDel/Util.js",
                     "EpsDel/Deferred.js",
                     "EpsDel/Math.js",
                     "EpsDel/Vector.js",
                     "EpsDel/Random.js",
                     "EpsDel/Timer.js",
                     "EpsDel/DisplayLoop.js",
                     "lib/keycode.js",
                     // "lib/phantom-limb.js", //testing only (emulate touch)
                     "EpsDel/Input.js",
                     "EpsDel/CanvasGraphics.js",
                     "EpsDel/Audio.js",
                     "EpsDel/Storage.js",
                     "App.js",
                     "Settings.js",
                     "BackgroundCanvas.js",
                     "Images.js",
                     "SplashScreen.js",
                     "Facebooker.js"
                 ];

             if ( navigator.onLine )
             {
                 firstScripts.push( "/socket.io/socket.io.js" );
             }

             zjLoad =
                 {
                     test: useZepto,
                     yep: [ 'lib/zepto.min.js',
                            'lib/deferred.min.js' ],
                     nope: 'lib/jquery.min.js',
                     complete: function onZjLoad()
                     {
                         if ( Zepto )
                         {
                             Deferred.installInto( Zepto );
                         }
                     }
                 };
             libsLoad =
                 [
                     'lib/underscore-min.js'
                 ];
             
             yepnope(
                 [
                     zjLoad,
                     libsLoad,
                     {
                         load: firstScripts,
                         complete: function onComplete1stLoad( )
                         {
                             app.start( );
                         }
                     }
                 ]
             );
         }

    //=========================================================================

         function loadScriptsAsPromises( scripts )
         {
             var deferreds = { },
                 i, numScripts = scripts.length,
                 promises;
             for ( i = 0; i < numScripts; ++i )
             {
                 deferreds[ scripts[ i ] ] = $.Deferred();
             }
             yepnope(
                 [
                     {
                         load: scripts,
                         callback: function onEach2ndLoad( url, result, key )
                         {
                             deferreds[ (url) ].resolve( url );
                         }
                     }
                 ]
             );
             promises = _.map(
                 deferreds,
                 function toPromise( deferred, url )
                 {
                     return deferred.promise();
                 } );
             return promises;
         }

    //-------------------------------------------------------------------------

         function loadSecondScripts( )
         {
             var scripts =
                 [
                     "NimScreen.js",
                     "NimModel.js",
                     "NimCanvasView.js",
                     "NimOfflineController.js",
                     "NimSocketController.js",
                     "NimAI.js",
                     "NimAudio.js"
                 ];
             if ( navigator.onLine )
             {
                 scripts.push( "//connect.facebook.net/en_US/all.js" );
             }
             return loadScriptsAsPromises( scripts );
         }

    //-------------------------------------------------------------------------

         function loadImages( )
         {
             var images = [ //[name, fileName]
                     [ 'counter', 'NazarBoncuk_104x100.png' ]
                 ];
             return app.images.loadList( images );
         }

    //=========================================================================

         return {
             loadFirstScripts: loadFirstScripts,
             loadSecondScripts: loadSecondScripts,
             loadImages: loadImages
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************


app.loader.loadFirstScripts( );


//*****************************************************************************
