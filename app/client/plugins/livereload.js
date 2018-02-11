import $ from 'jquery';
import io from 'socket.io-client';

import {
  LIVERELOAD_NSP,
  ASSETS_PATH
} from '../../config/constants.json';

const livereload = $('#livereload').addClass('loaded');
const ready = $('<img />')
  .addClass('image')
  .attr('src', `${ASSETS_PATH}/images/checkmark.png`);
const loading = $('<img />')
  .addClass('image')
  .attr('src', `${ASSETS_PATH}/images/loading.gif`);

(async () => {
  await ready
    .add(loading)
    .load();

  livereload.append(ready);
})();

const socket = io.connect(LIVERELOAD_NSP);

socket.on('connect', () => {
  console.log('%c%s', colored('green'), 'livereload enabled');
});

socket.on('tokill', () => {
  toreload();

  socket.emit('tokill-event');
});

socket.on('toreload', toreload);

socket.on('reload', () => {
  console.log('%c%s', colored('red'), 'reloading...');

  location.reload();
});

socket.on('css-updated', () => {
  $('#all-css').attr('href', `${ASSETS_PATH}/css/all.css?${Date.now()}`);

  unreload();
});

function colored(color) {
  return `color: ${color}; font-weight: 900; font-size: 16px;`;
}

function toreload() {
  console.log('%c%s', colored('orange'), 'something changed...');

  livereload.addClass('reloading');
  ready.replaceWith(loading);
}

function unreload() {
  console.log('%c%s', colored('green'), 'updated');

  livereload.removeClass('reloading');
  loading.replaceWith(ready);
}
