import { GameType } from 'common/types/game';
import { LobbyClientEventMap, LobbyEventType, LobbyServerEventMap } from 'common/types/lobby';
import { Namespace, ServerSocket } from 'common/types/socket';

import ioSessionMiddleware from 'server/utilities/ioSessionMiddleware';

import Game from 'server/gamesData/Game/Game';
import ioInstance from 'server/io';

class Lobby<G extends GameType> {
  games: Game<G>[] = [];
  io: Namespace<LobbyClientEventMap<G>, LobbyServerEventMap<G>>;
  game: G;
  lastCreatedId = 0;

  constructor({ game }: { game: G }) {
    this.io = ioInstance.of(`/${game}/lobby`);
    this.game = game;

    this.io.use(ioSessionMiddleware);
    this.io.on('connection', (socket) => {
      this.sendLobbyUpdate(socket);

      socket.on(LobbyEventType.CREATE_GAME, (options) => {
        const createdGame = new Game({
          game,
          name: `Игра ${++this.lastCreatedId}`,
          options,
          onDeleteGame: this.deleteGame,
          onUpdateGame: () => this.sendLobbyUpdate(),
        });

        this.games.push(createdGame);

        socket.emit(LobbyEventType.GAME_CREATED, createdGame.id);

        this.sendLobbyUpdate();
      });
    });
  }

  sendLobbyUpdate = (socket?: ServerSocket<LobbyClientEventMap<G>, LobbyServerEventMap<G>>): void => {
    (socket ?? this.io).emit(LobbyEventType.UPDATE, {
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
