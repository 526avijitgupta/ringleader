/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

document.getElementById('confirm').addEventListener('click', function() {
  if (document.getElementById('yup').checked) {
    self.port.emit('confirm','ok');
  }
}, false);

document.getElementById('cancel').addEventListener('click', function() {
  self.port.emit('cancel','Nope!');
}, false);

document.getElementById('yup').addEventListener('click', function(event) {
  document.getElementById('confirm').disabled = !event.target.checked;
}, false);

document.getElementById('manage').addEventListener('click', function() {
  self.port.emit('manage','manage');
}, false);
