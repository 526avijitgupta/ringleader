/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

document.addEventListener('ready', function() {
    console.log('JS LOADED');
});

// Sends callback data back to GCLI return statement
window.addEventListener('message', function(event) {
    self.port.emit('execute', event.data);
}, false);

// Injects callback data to the document
self.port.on("callback", function(callbackData) {
  document.querySelector('.sidebar-output').innerHTML += '<br> \> ' + callbackData.callbackData;
  //var cloned = cloneInto(greeting, document.defaultView);
   // var evt = document.createEvent('CustomEvent');
   // evt.initCustomEvent("refresh-lookup", true, true, callbackData.lookupData);
   // document.documentElement.dispatchEvent(evt);
});

// Injects the commands to GCLI webpage
self.port.on('display', function(commands) {
    var actualCode = '(' + function(commands) {

        require([ 'gcli/index', 'demo/index' ], function(gcli) {
            for(idx in commands.commands.commands) {
              console.log('on display: ', commands.commands.commands[idx]);
              if (commands.commands.commands[idx].hasOwnProperty('exec')) {
                eval("commands.commands.commands[idx].exec = " + commands.commands.commands[idx].exec);
              }
              gcli.addCommand(commands.commands.commands[idx]);
            }

          gcli.createDisplay();
        });
    } + ')('+ JSON.stringify(commands) +');';

    var script = document.createElement('script');
    script.textContent = actualCode;
    (document.head || document.documentElement).appendChild(script);
});
