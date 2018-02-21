import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ClassName from 'classnames';

import { GamePlayers, Input } from '../../components';
import { toRGBA } from '../../helpers';
import { gameDataType, playersType, userType } from '../../constants';
import { getAvailableCells } from '../../../shared/games/virus-war';
import { games as gamesConfig, colors } from '../../../shared/constants';

import VirusCell from './VirusCell';

const {
  global: {
    events: {
      game: { END_TURN }
    }
  },
  virus_war: {
    events: {
      game: { SET_CELL }
    },
    virusesTypes: { VIRUS }
  }
} = gamesConfig;

class VirusWar extends Component {
  static listeners = {
    [SET_CELL]: 'onSetCell',
    [END_TURN]: 'onEndTurn'
  };
  static propTypes = {
    user: userType.isRequired,
    players: playersType.isRequired,
    gameData: gameDataType.isRequired,
    isMyTurn: PropTypes.bool.isRequired,
    emit: PropTypes.func.isRequired
  };

  state = {
    field: this.getField(),
    lastSetCells: this.props.gameData.lastSetCells
  };
  isTopLeft = this.props.players[0].login === this.props.user.login;
  mapPlayersToColors = _(this.props.players)
    .map(({ color, login }) => [login, color])
    .fromPairs()
    .value();
  mapPlayersToShapes = _(this.props.players)
    .map(({ data: { shape }, login }) => [login, shape])
    .fromPairs()
    .value();

  componentWillReceiveProps(nextProps) {
    if (this.props.gameData !== nextProps.gameData) {
      this.setState({
        field: this.getField(nextProps),
        lastSetCells: nextProps.gameData.lastSetCells
      });
    }
  }

  getField(props = this.props) {
    const {
      user,
      gameData: {
        field,
        lastSetCells
      }
    } = props;

    _.forEach(lastSetCells, ({ x, y }) => {
      field[y][x].isAmongLastSetCells = true;
    });
    _.forEach(getAvailableCells(field, user, lastSetCells), (cell) => {
      cell.isAvailable = true;
    });

    return field;
  }

  setCell(cell) {
    if (!this.props.isMyTurn || !cell.isAvailable) {
      return;
    }

    this.props.emit(SET_CELL, {
      x: cell.x,
      y: cell.y
    });
  }

  refreshField(isLast, isLastInGame) {
    const {
      user
    } = this.props;

    this.setState(({ field, lastSetCells }) => {
      lastSetCells = isLast ? [] : lastSetCells;

      const availableCells = isLastInGame
        ? []
        : getAvailableCells(field, user, lastSetCells);

      return {
        lastSetCells,
        field: _.map(field, (row) => (
          _.map(row, (cell) => ({
            ...cell,
            type: isLastInGame && !cell.type
              ? VIRUS
              : cell.type,
            player: isLastInGame && !cell.type
              ? user.login
              : cell.player,
            isAvailable: _.includes(availableCells, cell),
            isAmongLastSetCells: _.some(lastSetCells, ({ x, y }) => cell.x === x && cell.y === y)
          }))
        ))
      };
    });
  }

  endTurn = () => {
    if (!this.props.isMyTurn) {
      return;
    }

    this.props.emit(END_TURN);
  };

  onEndTurn = () => {
    this.refreshField(true);
  };

  onSetCell = ({ cell: changedCell, isLast, isLastInGame }) => {
    const {
      field,
      lastSetCells
    } = this.state;
    const { x, y } = changedCell;

    field[y][x] = changedCell;

    if (changedCell.type === VIRUS) {
      lastSetCells.push(changedCell);
    }

    this.refreshField(isLast, isLastInGame);
  };

  render() {
    const {
      isMyTurn,
      players
    } = this.props;
    const {
      field
    } = this.state;

    return (
      <div className="virus-war-game row">

        <table className={ClassName('field', {
          'my-turn': isMyTurn,
          'to-bottom-left': this.isTopLeft
        })}>
          <tbody>
            {field.map((row, y) => (
              <tr key={y}>
                {row.map((cell, x) => (
                  <td
                    key={x}
                    className={ClassName({
                      available: cell.isAvailable
                    })}
                    style={{
                      background: (
                        cell.isAmongLastSetCells
                        && toRGBA(colors[this.mapPlayersToColors[cell.player]], 0.25)
                      )
                    }}
                    onClick={() => this.setCell(cell)}
                  >
                    <VirusCell
                      type={cell.type}
                      color={this.mapPlayersToColors[cell.player]}
                      shape={this.mapPlayersToShapes[cell.player]}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {isMyTurn && (
          <Input
            className="success"
            type="submit"
            value="games.global.room.end_turn"
            onClick={this.endTurn}
          />
        )}

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
}), null, null, { withRef: true })(VirusWar);
