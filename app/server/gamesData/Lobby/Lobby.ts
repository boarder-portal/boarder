import { ELobbyEvent, ILobbyClientEventMap, ILobbyServerEventMap } from 'common/types/lobby';
import { EGame } from 'common/types/game';
import { TNamespace, TServerSocket } from 'common/types/socket';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import Game from 'server/gamesData/Game/Game';
import ioInstance from 'server/io';

class Lobby<G extends EGame> {
  games: Game<G>[] = [];
  io: TNamespace<ILobbyClientEventMap<G>, ILobbyServerEventMap<G>>;
  game: G;
  lastCreatedId = 0;

  constructor({ game }: { game: G }) {
    this.io = ioInstance.of(`/${game}/lobby`);
    this.game = game;

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      this.sendLobbyUpdate(socket);

      socket.on(ELobbyEvent.CREATE_GAME, (options) => {
        const createdGame = new Game({
          game,
          name: `Игра ${++this.lastCreatedId}`,
          options,
          onDeleteGame: this.deleteGame,
          onUpdateGame: () => this.sendLobbyUpdate(),
        });

        this.games.push(createdGame);

        socket.emit(ELobbyEvent.GAME_CREATED, createdGame.id);

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate = (socket?: TServerSocket<ILobbyClientEventMap<G>, ILobbyServerEventMap<G>>): void => {
    (socket ?? this.io).emit(ELobbyEvent.UPDATE, {
      games: this.games.map((game) => ({
        id: game.id,
        name: game.name,
        players: game.players,
        hasStarted: game.hasStarted(),
        options: game.options,
      })),
    });
  };

  deleteGame = (id: string): void => {
    const gameIndex = this.games.findIndex((game) => game.id === id);

    if (gameIndex === -1) {
      return;
    }

    this.games = [...this.games.slice(0, gameIndex), ...this.games.slice(gameIndex + 1)];

    this.sendLobbyUpdate();
  };
}

export default Lobby;
