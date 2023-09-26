import { ComponentType, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameInfo, GameOptions, GameResult, GameState, GameType } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import IconButton from 'client/components/common/IconButton/IconButton';
import Overlay from 'client/components/common/Overlay/Overlay';
import CrossIcon from 'client/components/common/icons/CrossIcon/CrossIcon';
import { GameContentProps as ContentProps } from 'client/components/game/Game/Game';

import styles from './GameContent.module.scss';

interface GameContentProps<Game extends GameType> {
  io: GameClientSocket<Game>;
  gameOptions: GameOptions<Game>;
  gameInfo: GameInfo<Game>;
  gameResult: GameResult<Game> | null;
  gameState: GameState;
  renderContent: ComponentType<ContentProps<Game>>;
}

const GameContent = <Game extends GameType>(props: GameContentProps<Game>) => {
  const { io, gameOptions, gameInfo, gameResult, gameState, renderContent: Content } = props;

  const { game } = useParams<{ game: Game; gameId: string }>();

  const history = useHistory();

  const navigateToLobby = useCallback(() => {
    history.push(`/${game}/lobby`);
  }, [game, history]);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Content io={io} gameOptions={gameOptions} gameInfo={gameInfo} gameResult={gameResult} gameState={gameState} />
      </div>

      <div className={styles.toolbar}>
        <IconButton size="s" onClick={navigateToLobby}>
          <CrossIcon />
        </IconButton>
      </div>

      <Overlay contentClassName={styles.pauseContent} open={gameState.type === 'paused'}>
        Пауза
      </Overlay>
    </div>
  );
};

export default typedReactMemo(GameContent);
