import io from 'socket.io-client';
import { find, doc, Elem } from 'dwayne';
import {
  livereloadPort,
  assetsPath as assets
} from '../../config/config.json';
import '../styles/livereload.less';

const livereload = find('#livereload')
  .addClass('loaded');
const {
  hostname,
  protocol
} = location;

const ready = doc
  .img('.image')
  .ref(`${ assets }/images/checkmark.png`);
const loading = doc
  .img('.image')
  .ref(`${ assets }/images/loading.gif`);

new Elem([ready, loading])
  .load()
  .then(() => {
    livereload.child(ready);
  });

const socket = io(`${ protocol }//${ hostname }:${ livereloadPort }`);

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
