import io from 'socket.io-client';
import { D, find, doc, Elem } from 'dwayne';
import {
  LIVERELOAD_NSP,
  ASSETS_PATH
} from '../../config/constants.json';

const livereload = find('#livereload')
  .addClass('loaded');

const ready = doc
  .img('.image')
  .ref(`${ ASSETS_PATH }/images/checkmark.png`);
const loading = doc
  .img('.image')
  .ref(`${ ASSETS_PATH }/images/loading.gif`);

new Elem([ready, loading])
  .load()
  .then(() => {
    livereload.child(ready);
  });

const socket = io(LIVERELOAD_NSP);

window.D = D;

socket.on('connect', () => {
  console.log('%c%s', colored('green'), 'livereload enabled');
});

socket.on('toreload', () => {
  console.log('%c%s', colored('orange'), 'something changed...');

  livereload
    .addClass('reloading');

  ready.replace(loading);
});

socket.on('reload', () => {
  console.log('%c%s', colored('red'), 'reloading...');

  location.reload();
});

function colored(color) {
  return `color: ${ color }; font-weight: 900; font-size: 16px;`;
}
