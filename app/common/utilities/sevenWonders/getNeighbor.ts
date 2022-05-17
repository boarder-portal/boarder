import { ENeighborSide, IPlayer } from 'common/types/sevenWonders';

export default function getNeighbor(players: IPlayer[], player: IPlayer, neighborSide: ENeighborSide): IPlayer {
  const playerIndex = players.findIndex(({ login }) => login === player.login);

  return players[
    neighborSide === ENeighborSide.LEFT
      ? (playerIndex - 1 + players.length) % players.length
      : (playerIndex + 1) % players.length
  ];
}
