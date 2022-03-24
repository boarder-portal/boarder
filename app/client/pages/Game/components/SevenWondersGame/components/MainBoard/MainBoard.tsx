import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  ESevenWondersCardActionType,
  ESevenWondersGameEvent, ESevenWondersNeighborSide,
  ISevenWondersBuildCardEvent,
  ISevenWondersPlayer,
} from 'common/types/sevenWonders';
import { ISevenWondersCard } from 'common/types/sevenWonders/cards';

import {
  getPlayerResources,
} from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getPlayerResources';
import getOwnerResources
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getOwnerResources';
import getResourcePools
  from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/utilities/getResourcePools';

import Box from 'client/components/common/Box/Box';
import Wonder from 'client/pages/Game/components/SevenWondersGame/components/Wonder/Wonder';
import HandCard from 'client/pages/Game/components/SevenWondersGame/components/MainBoard/components/HandCard/HandCard';

interface IMainBoardProps {
  className?: string;
  io: SocketIOClient.Socket;
  player: ISevenWondersPlayer;
  leftNeighbor: ISevenWondersPlayer;
  rightNeighbor: ISevenWondersPlayer;
}

const b = block('MainBoard');

const Root = styled(Box)`

  .MainBoard {
    &__wonder {
      max-width: 500px;
    }
  }
`;

const MainBoard: React.FC<IMainBoardProps> = (props) => {
  const { className, io, player, leftNeighbor, rightNeighbor } = props;

  const handleBuildCard = useCallback((card: ISevenWondersCard) => {
    const data: ISevenWondersBuildCardEvent = {
      card,
      action: {
        type: ESevenWondersCardActionType.BUILD_STRUCTURE,
      },
      payments: {
        [ESevenWondersNeighborSide.LEFT]: 0,
        [ESevenWondersNeighborSide.RIGHT]: 0,
      },
    };

    io.emit(ESevenWondersGameEvent.BUILD_CARD, data);
  }, [io]);

  const resourcePools = useMemo(() => {
    const playerResources = getOwnerResources(getPlayerResources(player), player);
    const leftNeighborResources = getOwnerResources(getPlayerResources(leftNeighbor, true), leftNeighbor);
    const rightNeighborResources = getOwnerResources(getPlayerResources(rightNeighbor, true), rightNeighbor);

    return getResourcePools([
      ...playerResources,
      ...leftNeighborResources,
      ...rightNeighborResources,
    ]);
  }, [leftNeighbor, player, rightNeighbor]);

  return (
    <Root className={b.mix(className)} flex alignItems="center" column between={20}>
      <Wonder className={b('wonder')} player={player} />

      <Box flex between={-35}>
        {player.hand.map((card, index) => (
          <HandCard
            key={index}
            card={card}
            resourcePools={resourcePools}
            leftNeighbor={leftNeighbor}
            rightNeighbor={rightNeighbor}
            onBuild={handleBuildCard}
          />
        ))}
      </Box>
    </Root>
  );
};

export default React.memo(MainBoard);
