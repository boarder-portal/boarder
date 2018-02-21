export default {
  dev: true,
  playersCount: 2,
  events: {
    game: {
      SET_CELL: 'set-cell'
    }
  },

  cellSize: 24,
  borderWidth: 2,
  virusesTypes: {
    VIRUS: 'virus',
    FORTRESS: 'fortress'
  },
  virusesShapes: {
    CIRCLE: 'circle',
    RECT: 'rect'
  }
};
