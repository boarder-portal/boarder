import { D, Block } from 'dwayne';
import template from './index.pug';
import { getNeighbourCells } from '../../../shared/filler';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  filler: {
    events: {
      game: {
        CHOOSE_COLOR
      }
    },
    colors
  }
} = gamesConfig;

class FillerGame extends Block {
  static template = template();

  CELL_SIZE = 24;
  BORDER_WIDTH = 2;
  colors = colors;

  constructor(opts) {
    super(opts);

    const {
      emitter,
      socket
    } = this.args;

    this.socket = socket;
    this.setup();

    emitter.on(CHOOSE_COLOR, this.onChooseColor);
  }

  afterConstruct() {
    this.watchArgs('gameData', this.setup);
  }

  emit() {
    this.socket.emit(...arguments);
  }

  setup = () => {
    const { gameData } = this.args;

    if (!gameData) {
      return;
    }

    this.field = gameData.field;
    this.currentColors = D(gameData.currentColors);
    this.playersCells = D(this.args.players).object((playersCells, player) => {
      const { mainCell } = player.data;

      playersCells[player.login] = D([mainCell])
        .concat(getNeighbourCells(this.field, mainCell.color, D([mainCell])));
    }).$;
  };

  changeCell(x, y, cell) {
    const { field } = this;

    this.field = [
      ...field.slice(0, y),
      [
        ...field[y].slice(0, x),
        {
          ...field[y][x],
          ...cell
        },
        ...field[y].slice(x + 1)
      ],
      ...field.slice(y + 1)
    ];
  }

  chooseColor(color) {
    if (!this.args.isMyTurn || !colors[color] || this.currentColors.includes(color)) {
      return;
    }

    this.emit(CHOOSE_COLOR, color);
  }

  onChooseColor = ({ currentColors, color, player }) => {
    const cell = player.data.mainCell;
    const playerCells = this.playersCells[player.login];

    this.currentColors = D(currentColors);

    this.changeCell(cell.x, cell.y, { color });

    const neighbours = getNeighbourCells(this.field, color, playerCells);

    playerCells.forEach((cell) => {
      this.changeCell(cell.x, cell.y, { color });
    });
    playerCells.push(...neighbours.$);
  };
}

Block.register('FillerGame', FillerGame);
