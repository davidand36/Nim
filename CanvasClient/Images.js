/*
  Images.js

  Loads and maintains image graphics for Nim game.
*/

//*****************************************************************************


var app = app || { };


//=============================================================================


app.images =
    (function( )
     {
    //-------------------------------------------------------------------------

         var images =
             {
                 'counter': {
                     image: null,
                     url: 'NazarBoncuk_104x100.png'
                 }
             },
             imageDir = 'images/';

    //=========================================================================

         function load( name, callback, forceReload )
         {
             var img;
             if ( images[ (name) ].image && (! forceReload) )
             {
                 if ( callback )
                     callback( );
             }
             img = $('<img />');
             img.on( 'load',
                     function handleImageLoad( )
                     {
                         images[ (name) ].image = img[0];
                         if ( callback )
                             callback( );
                     } );
             img[0].src = imageDir + images[ (name) ].url;
         }

    //-------------------------------------------------------------------------

         function loadAll( name, callback, forceReload )
         {
             _.each( images,
                     function handleImage( imgData, name )
                     {
                         load( name, callback, forceReload );
                     } );
         }

    //=========================================================================

         function getSize( name )
         {
             var img = images[ (name) ].image;
             if ( img === null )
                 return null;
             return {
                 width: img.width,
                 height: img.height
             };
         }

    //=========================================================================

         function draw( ctx, name, x, y, scale )
         {
             var img = images[ (name) ].image;
             scale = scale || 1;
             if ( scale === 1 )
             {
                 ctx.drawImage( img, x, y );
             }
             else
             {
                 ctx.drawImage( img,
                                0, 0, img.width, img.height,
                                x, y, img.width * scale, img.height * scale );
             }
         }

    //=========================================================================

         return {
             load: load,
             loadAll: loadAll,
             getSize: getSize,
             draw: draw
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************
