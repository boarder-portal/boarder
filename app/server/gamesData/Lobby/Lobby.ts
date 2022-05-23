import { Namespace, Socket } from 'socket.io';

import { ELobbyEvent, ILobbyUpdateEvent } from 'common/types/lobby';
import { EGame, TGameOptions } from 'common/types/game';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import Game from 'server/gamesData/Game/Game';
import ioInstance from 'server/io';

class Lobby<G extends EGame> {
  games: Game<G>[] = [];
  io: Namespace;
  game: G;

  constructor({ game }: { game: G }) {
    this.io = ioInstance.of(`/${game}/lobby`);
    this.game = game;

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      this.sendLobbyUpdate(socket);

      socket.on(ELobbyEvent.CREATE_GAME, (options: TGameOptions<G>) => {
        this.games.push(
          new Game({
            game,
            options,
            onDeleteGame: this.deleteGame,
            onUpdateGame: () => this.sendLobbyUpdate(),
          }),
        );

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate = (socket?: Socket): void => {
    const updatedData: ILobbyUpdateEvent<G> = {
      games: this.games.map((game) => ({
        id: game.id,
        players: game.players,
        hasStarted: game.hasStarted(),
        options: game.options,
      })),
    };

    (socket ?? this.io).emit(ELobbyEvent.UPDATE, updatedData);
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
