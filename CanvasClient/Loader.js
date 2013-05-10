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

         var numResourcesToLoad = 0,
             numResourcesLoaded = 0;
         
    //=========================================================================

         function run( )
         {
             var useZepto = ('__proto__' in {}),
                 zjLoad,
                 libsLoad;

             var firstScripts =
                 [
                     "EpsDel/ErrorHandler.js",
                     "EpsDel/Util.js",
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
                     "SplashScreen.js"
                 ],
                 secondScripts =
                 [
                     "NimScreen.js",
                     "NimModel.js",
                     "NimCanvasView.js",
                     "NimOfflineController.js",
                     "NimSocketController.js",
                     "NimAI.js",
                     "NimAudio.js"
                 ],
                 secondLoad = secondScripts.concat( listResources( ) );

             if ( navigator.onLine )
             {
                 firstScripts.push( "/socket.io/socket.io.js" );
             }

             setResourcePrefix( );
             
             numResourcesToLoad = secondLoad.length;
             numResourcesLoaded = 0;

             zjLoad =
                 {
                     test: useZepto,
                     yep: 'lib/zepto.min.js',
                     nope: 'lib/jquery.min.js'
                 };
             libsLoad =
                 [
                     'lib/underscore-min.js'
                 ];
             
             Modernizr.load(
                 [
                     zjLoad,
                     libsLoad,
                     {
                         load: firstScripts,
                         complete: function()
                         {
                             app.start( );
                         }
                     },
                     {
                         load: secondLoad,
                         callback: function onEachLoad( url, result, key )
                         {
                             ++numResourcesLoaded;
                         },
                         complete: function onCompleteLoad()
                         {
                             app.images.loadAll(
                                 function onEachImgLoad( )
                                 {
                                     if ( ++numResourcesLoaded >=
                                          numResourcesToLoad )
                                     {
                                         numResourcesToLoad =
                                             numResourcesLoaded = 0;
                                     }
                                 } );
                         }
                     }
                 ]
             );
         }

    //=========================================================================

         function listResources( )
         {
             var resources =
                 [
                     'images/NazarBoncuk_104x100.png'
                 ],
                 i, lim;

             for ( i = 0, lim = resources.length; i < lim; ++i )
             {
                 resources[ i ] = "resource!" + resources[ i ];
             }
             return resources;
         }
         
    //=========================================================================

         function setResourcePrefix( )
         {
             yepnope.addPrefix(
                 "resource",
                 function( resourceObj )
                 {
                     resourceObj.noexec = true;
                     return resourceObj;
                 }
             );
         }
         
    //=========================================================================

         function getResourceLoadProgress( )
         {
             if ( numResourcesToLoad > 0 )
             {
                 return numResourcesLoaded / numResourcesToLoad;
             }
             else
             {
                 return 1;
             }
         }
         
    //=========================================================================

         return {
             run: run,
             getResourceLoadProgress: getResourceLoadProgress
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************


app.loader.run( );


//*****************************************************************************
