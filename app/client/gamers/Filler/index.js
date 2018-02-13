import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ClassName from 'classnames';

import { GamePlayers } from '../../components';
import { gameDataType, playersType, userType } from '../../constants';
import { getNeighbourCells } from '../../../shared/filler';
import { games as gamesConfig } from '../../../config/constants.json';

const {
  filler: {
    events: {
      game: {
        CHOOSE_COLOR
      }
    },
    cellSize,
    strokeWidth,
    colors
  }
} = gamesConfig;

class Filler extends Component {
  static listeners = {
    [CHOOSE_COLOR]: 'onChooseColor'
  };
  static propTypes = {
    user: userType.isRequired,
    players: playersType.isRequired,
    gameData: gameDataType.isRequired,
    isMyTurn: PropTypes.bool.isRequired,
    emit: PropTypes.func.isRequired
  };

  state = {
    isTopLeft: this.props.gameData.players[0].login === this.props.user.login,
    field: this.props.gameData.field,
    currentColors: this.props.gameData.currentColors
  };
  playersCells = this.getPlayersCells();

  componentWillReceiveProps(nextProps) {
    if (this.props.gameData !== nextProps.gameData) {
      this.setState({
        field: nextProps.gameData.field,
        currentColors: nextProps.gameData.currentColors
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.players.length && this.props.players.length) {
      this.playersCells = this.getPlayersCells();
    }
  }

  getPlayersCells() {
    const {
      players
    } = this.props;
    const {
      field
    } = this.state;

    return _(players)
      .map(({ data: { mainCell }, login }) => [
        login,
        _.concat([mainCell], getNeighbourCells(field, mainCell.color, [mainCell]))
      ])
      .fromPairs()
      .value();
  }

  changeCells(cells, color) {
    this.setState(({ field }) => {
      _.forEach(cells, (cell) => {
        field[cell.y][cell.x] = {
          ...field[cell.y][cell.x],
          color
        };
      });

      return {
        field: _.map(field, (row) => _.map(row))
      };
    });
  }

  chooseColor(color) {
    if (
      !this.props.isMyTurn
      || !colors[color]
      || _.includes(this.state.currentColors, color)
    ) {
      return;
    }

    this.props.emit(CHOOSE_COLOR, color);
  }

  onChooseColor = ({ currentColors, color, player }) => {
    const playerCells = this.playersCells[player.login];
    const neighbours = getNeighbourCells(this.state.field, color, playerCells);

    this.setState({
      currentColors
    });
    this.changeCells(playerCells, color);
    playerCells.push(...neighbours);
  };

  render() {
    const {
      players
    } = this.props;
    const {
      isTopLeft,
      field,
      currentColors
    } = this.state;

    return (
      <div className="filler-game row">
        <div className="field col-xs-12 col-sm">
          <svg
            className={ClassName('field-rect', {
              'to-bottom-left': isTopLeft
            })}
            width={field[0].length * cellSize}
            height={field.length * cellSize}
            viewBox={[0, 0, field[0].length * cellSize, field.length * cellSize].join(' ')}
          >
            {field.map((row, y) => (
              <g key={y}>
                {row.map((cell, x) => (
                  <rect
                    key={x}
                    x={x * cellSize}
                    y={y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={colors[cell.color]}
                    strokeWidth={strokeWidth}
                    stroke="#ddd"
                  />
                ))}
              </g>
            ))}
          </svg>
          <div className="colors-pane">
            {_.map(colors, (color, colorName) => (
              <div
                key={colorName}
                className={ClassName('color', {
                  'current-color': _.includes(currentColors, colorName)
                })}
                style={{
                  background: color
                }}
                onClick={() => this.chooseColor(colorName)}
              />
            ))}
          </div>
        </div>
        <GamePlayers
          players={players}
          containerCls="col-xs-12 col-sm"
        />
      </div>
    );
  }
}

export default connect((state) => ({
  user: state.user
}), null, null, { withRef: true })(Filler);
