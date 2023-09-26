import { ComponentType } from 'react';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameInfo, GameOptions, GameResult, GameState, GameType } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import Overlay from 'client/components/common/Overlay/Overlay';
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

  return (
    <div className={styles.root}>
      <Content io={io} gameOptions={gameOptions} gameInfo={gameInfo} gameResult={gameResult} gameState={gameState} />

      <Overlay contentClassName={styles.pauseContent} open={gameState.type === 'paused'}>
        Пауза
      </Overlay>
    </div>
  );
};

export default typedReactMemo(GameContent);
