/*
  App.js

  Main functions for Nim app
*/

//*****************************************************************************


var app = app || { };


//*****************************************************************************


app.start = function( )
{
    var promises = [];
    εδ.errorHandler.setMessageElement( $("#errorMessageDiv") );
    εδ.storage.setPrefix( "Coloris_" );
    εδ.storage.get( "settings", processSettings );
    setupResizeHandler( );
    if ( navigator.onLine && window.io )
    {
        app.socket = io.connect( );
    }
    promises = promises.concat( app.loader.loadSecondScripts( ) );
    promises = promises.concat( app.loader.loadImages( ) );
    app.showScreen( "splash", promises );

    //-------------------------------------------------------------------------

    function setupResizeHandler( )
    {
        //.....................................................................

        function handleResize( )
        {
            var maxWidth = 800,
                maxHeight = 480,
                mobile = ($.os && ($.os.phone || $.os.tablet)),
                winWidth = window.innerWidth,
                winHeight = window.innerHeight,
                w, h,
                newDims;

            if ( mobile )
            { //fill screen with a margin for error
                w = winWidth - 4;
                h = winHeight - 4;
            }
            else
            {
                w = Math.min( winWidth - 4, maxWidth );
                h = Math.min( winHeight - 4, maxHeight );
            }
            newDims = { width: w,
                        height: h
                      };
            $('#game').css( newDims );
            app.resize( newDims );
        }

        //.....................................................................

        $(window).on( 'resize', handleResize );
        $(window).on( 'orientationchange', handleResize );

        handleResize( );
    }

    //-------------------------------------------------------------------------

    function processSettings( storedSettings )
    {
        app.settings = storedSettings || app.settings || { };
    }
};

//=============================================================================

app.screens = app.screens || { };
app.activeScreen = null;

//-----------------------------------------------------------------------------

app.showScreen = function( screenId )
{
    var oldScreen = app.activeScreen,
        newScreen = app.screens[ screenId ],
        args = Array.prototype.slice.call( arguments, 1 );
    if ( oldScreen )
    {
        oldScreen.stop( );
    }
    app.activeScreen = newScreen;
    newScreen.run.apply( newScreen, args );
};

//=============================================================================

app.resize = function( newDims )
{
    var activeScreen = app.activeScreen;

    $('#canvasDiv canvas').remove( );
    app.background.resize( ); //recreates the canvas
    if ( activeScreen )
    {
        if ( activeScreen.resize )
        {
            activeScreen.resize( newDims );
        }
    }
}


//*****************************************************************************
