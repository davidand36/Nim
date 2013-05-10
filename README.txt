Nim
Copyright © 2013 David M. Anderson

HTML5 version of the classic subtraction game. Can play against AI opponent (even offline) or a human opponent (using socket.io and the Node.js server app).

This uses the submodule EpsilonDeltaJS. So if you clone this repository, you need to run "git submodule init" and "git submodule update" to fetch the files in the εδ/ subdirectory.

It also depends on these third-party libraries. These files (or links to them) should be in the lib/ subdirectory:
Modernizr (modernizr.js from http://modernizr.com)
jQuery (jquery.min.js from http://jquery.com/)
Zepto (zepto.min.js from http://zeptojs.com/)
Underscore (underscore-min.js from http://underscorejs.org/)
keycode (keycode.js from http://jonathan.tang.name/code/js_keycode)
Phantom Limb (phantom-limb.js from https://github.com/brian-c/phantom-limb)
