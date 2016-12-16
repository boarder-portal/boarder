import { D, Block } from 'dwayne';
import template from './index.pug';
import { getAvailableCells } from '../../../shared/virus-war';

class VirusWar extends Block {
  static template = template();

  constructor(opts) {
    super(opts);

    const gameData = this.args.gameData;
    const emitter = this.args.emitter;

    this.field = this.transformField(gameData.field);
    this.mapPlayersToColors = D(gameData.players).object((colors, { color, login }) => {
      colors[login] = color;
    }).$;

    getAvailableCells(this.field, this.global.user).forEach((cell) => {
      console.log(cell);

      cell.isAvailable = true;
    });

    console.log(gameData);
  }

  transformField(field) {
    const { login } = this.global.user;
    const { players } = this;
    const height = field.length - 1;
    const width = field[0].length - 1;

    if (players[0].login === login) {
      field = D(field)
        .reverse()
        .map((row) => (
          D(row).map((cell) => ({
            ...cell,
            y: height - cell.y
          })).$
        )).$;
    } else {
      field = D(field).map((row) => (
        D(row)
          .reverse()
          .map((cell) => ({
            ...cell,
            x: width - cell.x
          })).$
      )).$;
    }

    return field;
  }

  emit() {
    this.socket.emit(...arguments);
  }
}

Block.register('VirusWar', VirusWar);

export default VirusWar;
