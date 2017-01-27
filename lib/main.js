/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {data} = require("sdk/self");
const tabs = require("sdk/tabs");
const buttons = require('sdk/ui/button/action');

const pnhCommands = require("./commands");
const {configManager, setup} = require("./config");
const {Utils} = require("./secutils");
const serviceStub = require("./servicestub");

const ADDON_URL = "resource://jid1-cz1beofm9mmlzg-at-jetpack/data/prefs.html";
const EVENT_CONFIG_CHANGED = "PnHConfigChanged";

let isPrefsPageOpen = false;


function switchToAddonTab() {
  for(let tab of tabs) {
    if (tab.url === ADDON_URL) {
      tab.activate();
      break;
    }
  }
}

function main() {
  if (!isPrefsPageOpen) {
    tabs.open(ADDON_URL);
    isPrefsPageOpen = true;
  }

  tabs.on('close', function(tab) {
    if (tab.url === ADDON_URL) {
      isPrefsPageOpen = false;
    }
  });
  tabs.on('pageshow', function(tab) {
    console.log(tab.url + " is loaded");

    if (tab.url !== ADDON_URL) {
      // Refresh the lookups for tool and addon
      pnhCommands.refreshLookupData();
      serviceStub.refreshLookupData();
      return;
    } else {
      let worker = tabs.activeTab.attach({
        contentScriptFile: data.url('prefs.js')
      });
      setup();

      // Sending pnh commands
      pnhCommands.installCommands();

      // Executing GCLI commands and returning callback data
      worker.port.on("execute", function(data) {
        data.name.trim().startsWith("pnh") ? pnhCommands.executeCommand(data.name, data.args) : serviceStub.executeCommand(data.name, data.args);

        // Refresh the lookups for tool and addon
        pnhCommands.refreshLookupData();
        serviceStub.refreshLookupData();
      });
    }
  });
}

// Attach the content script
tabs.activeTab.on("ready" , function() {
  setup();
});

// Refresh the commands based config change
configManager.on(EVENT_CONFIG_CHANGED, function(config) {
  tabs.activeTab.reload();
  setup();
  pnhCommands.refreshLookupData();
});



/* Begin execution */

Utils.setupPrefs();

// Added a UI button to our addon
buttons.ActionButton({
  id: "pnh-link",
  label: "Plug N Hack",
  icon: {
    "16": "./pnh.png",
    "32": "./pnh.png",
    "48": "./pnh.png",
  },
  onClick: function() {
    if (isPrefsPageOpen) {
      switchToAddonTab();
    } else {
      main();
    }
  }
});
