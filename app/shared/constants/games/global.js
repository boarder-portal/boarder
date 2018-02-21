import _ from 'lodash';

const keyNamesToCodesMap = {
  left: 37,
  right: 39,
  top: 38,
  bottom: 40,

  0: 48,
  1: 49,
  2: 50,
  3: 51,
  4: 52,
  5: 53,
  6: 54,
  7: 55,
  8: 56,
  9: 57,

  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90
};
const keyCodesToNamesMap = _.reduce(keyNamesToCodesMap, (map, code, name) => {
  map[code] = name;

  return map;
}, {});

export default {
  roomStatuses: {
    NOT_PLAYING: 'not_playing',
    PREPARING: 'preparing',
    PLAYING: 'playing',
    FINISHING: 'finishing'
  },
  playerRoles: {
    OBSERVER: 0,
    PLAYER: 1
  },
  events: {
    lobby: {
      GET_LIST: 'list/get',
      NEW_ROOM: 'room/new',
      UPDATE_ROOM: 'room/update',
      DELETE_ROOM: 'room/delete'
    },
    room: {
      ENTER_ROOM: 'room/enter',
      UPDATE_ROOM: 'room/update',
      TOGGLE_PLAYER_STATUS: 'player/toggle-status'
    },
    game: {
      PREPARING_GAME: 'game/preparing',
      GAME_STARTED: 'game/started',
      GAME_FINISHING: 'game/finishing',
      GAME_FINISHED: 'game/finished',
      UPDATE_PLAYERS: 'game/update-players',
      UPDATE_GAME: 'game/update-game',
      END_TURN: 'game/end-turn'
    }
  },
  keyNamesToCodesMap,
  keyCodesToNamesMap
};
