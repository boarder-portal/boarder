export default {
  playersCount: 4,
  events: {
    game: {
      TURN_CARD: 'turn-card'
    }
  },

  TRANSITION_DURATION: 200,
  CARD_SHOWN_DURATION: 2000,
  sets: [
    '0',
    'potc',
    'lost',
    'sw',
    'got',
    'poker',
    'hp',
    'fr',
    'iasip'
  ]
};
