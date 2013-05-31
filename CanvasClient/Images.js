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

         var images = { },
             imageDir = 'images/';

    //=========================================================================

         function load( name, filename, forceReload )
         {
             var img,
                 dfd = $.Deferred();
             if ( images[ (name) ] && (! forceReload) )
             {
                 dfd.resolve( images[ (name) ] );
             }
             else
             {
                 img = document.createElement( 'img' );
                 $(img).on( 'load',
                         function handleImageLoad( )
                         {
                             images[ (name) ] = img;
                             dfd.resolve( img );
                         } )
                     .error( function( )
                             {
                                 dfd.reject( { name: name,
                                               filename: filename } );
                             } );
                 img.src = imageDir + filename;
             }
             return dfd.promise();
         }

    //-------------------------------------------------------------------------

         function loadList( list, forceReload )
         {
             var i, numImages = list.length,
                 imgData, name, filename,
                 promises = [];
             for ( i = 0; i < numImages; ++i )
             {
                 imgData = list[ i ];
                 if ( εδ.util.isArray( imgData ) )
                 {
                     name = imgData[ 0 ];
                     filename = imgData[ 1 ];
                 }
                 else
                 {
                     name = imgData.name;
                     filename = imgData.filename;
                 }
                 if ( name && filename )
                 {
                     promises.push( load( name, filename, forceReload ) );
                 }
             }
             return promises;
         }

    //=========================================================================

         function getSize( name )
         {
             var img = images[ (name) ];
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
             var img = images[ (name) ];
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
             loadList: loadList,
             getSize: getSize,
             draw: draw
         };
         
    //-------------------------------------------------------------------------
     }
)();


//*****************************************************************************
