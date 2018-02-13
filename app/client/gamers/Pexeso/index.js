import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassName from 'classnames';

import { gameDataType, playersType } from '../../constants';
import { timeout } from '../../helpers';
import { games as gamesConfig } from '../../../config/constants.json';

import { GamePlayers } from '../../components';

const {
  pexeso: {
    TRANSITION_DURATION,
    CARD_SHOWN_DURATION,
    events: {
      game: {
        TURN_CARD
      }
    }
  }
} = gamesConfig;

const IMAGES_ROOT = '/public/images/games/pexeso';
const BACK_IMAGE = `${IMAGES_ROOT}/backs/default/0.jpg`;

class Pexeso extends Component {
  static listeners = {
    [TURN_CARD]: 'onTurnCard'
  };
  static propTypes = {
    players: playersType.isRequired,
    gameData: gameDataType.isRequired,
    isMyTurn: PropTypes.bool.isRequired,
    emit: PropTypes.func.isRequired
  };

  state = {
    field: this.props.gameData.field
  };
  currentTurnedCards = this.getCurrentTurnedCards();

  componentWillReceiveProps(nextProps) {
    if (this.props.gameData !== nextProps.gameData) {
      this.setState({
        field: nextProps.gameData.field
      }, () => {
        this.currentTurnedCards = this.getCurrentTurnedCards();
      });
    }
  }

  constructImageURL(card) {
    const {
      options
    } = this.props.gameData;

    return `${IMAGES_ROOT}/sets/${options.set}/${card.card}.jpg`;
  }

  getCurrentTurnedCards() {
    const {
      field
    } = this.state;

    return field.reduce((allTurned, row) => [
      ...allTurned,
      ...row.filter(({ isTurned }) => isTurned)
    ], []);
  }

  turnCard(card) {
    if (
      !this.props.isMyTurn
      || !card.isInPlay
      || card.isTurned
      || this.currentTurnedCards.length >= 2
    ) {
      return;
    }

    const { x, y } = card;

    this.props.emit(TURN_CARD, { x, y });
  }

  changeCard(x, y, card) {
    this.setState(({ field }) => ({
      field: [
        ...field.slice(0, y),
        [
          ...field[y].slice(0, x),
          {
            ...field[y][x],
            ...card
          },
          ...field[y].slice(x + 1)
        ],
        ...field.slice(y + 1)
      ]
    }));
  }

  async closeCards(match) {
    const { currentTurnedCards } = this;

    await timeout(CARD_SHOWN_DURATION);

    _.forEach(currentTurnedCards, ({ x, y }) => {
      this.changeCard(
        x,
        y,
        match
          ? { isFading: true }
          : { isShrinking: true }
      );
    });

    if (match) {
      await timeout(2 * TRANSITION_DURATION);

      this.currentTurnedCards = [];

      _.forEach(currentTurnedCards, ({ x, y }) => {
        this.changeCard(x, y, {
          isInPlay: false,
          isTurned: false
        });
      });
    } else {
      await timeout(TRANSITION_DURATION);

      _.forEach(currentTurnedCards, ({ x, y }) => {
        this.changeCard(x, y, {
          isShrinking: false,
          isTurned: false
        });
      });

      await timeout(TRANSITION_DURATION);

      this.currentTurnedCards = [];
    }
  }

  onTurnCard = async ({ x, y, match }) => {
    let { currentTurnedCards } = this;

    currentTurnedCards = this.currentTurnedCards = [
      ...currentTurnedCards,
      { x, y }
    ];

    this.changeCard(x, y, {
      isShrinking: true
    });

    await timeout(TRANSITION_DURATION);

    this.changeCard(x, y, {
      isShrinking: false,
      isTurned: true
    });

    await timeout(TRANSITION_DURATION);

    if (currentTurnedCards.length < 2) {
      return;
    }

    await this.closeCards(match);
  };

  render() {
    const {
      players
    } = this.props;

    return (
      <div className="pexeso-game row">
        <div className="field col-xs-12 col-sm">
          {this.state.field.map((row, y) => (
            <div key={y} className="cards-row">
              {row.map((card, x) => (
                <div key={x} className="card-container">
                  {card.isInPlay && (
                    <img
                      className={ClassName('card', {
                        shrinking: card.isShrinking,
                        fading: card.isFading
                      })}
                      onClick={() => this.turnCard(card)}
                      src={card.isTurned ? this.constructImageURL(card) : BACK_IMAGE}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <GamePlayers
          players={players}
          containerCls="col-xs-12 col-sm"
        />
      </div>
    );
  }
}

export default Pexeso;
