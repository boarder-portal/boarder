import { ESevenWondersNeighborSide, ISevenWondersPlayer } from 'common/types/sevenWonders';

export default function getNeighbor(
  players: ISevenWondersPlayer[],
  player: ISevenWondersPlayer,
  neighborSide: ESevenWondersNeighborSide,
): ISevenWondersPlayer {
  const playerIndex = players.findIndex(({ login }) => login === player.login);

  return players[neighborSide === ESevenWondersNeighborSide.LEFT
    ? (playerIndex - 1 + players.length) % players.length
    : (playerIndex + 1) % players.length];
}
