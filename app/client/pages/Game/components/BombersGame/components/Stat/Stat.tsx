import classNames from 'classnames';
import times from 'lodash/times';
import React, { FC, memo } from 'react';

import Flex from 'client/components/common/Flex/Flex';

import styles from './Stat.module.scss';

interface StatProps {
  label: string;
  value: number;
  maxValue: number;
  overflow: number;
}

const Stat: FC<StatProps> = (props) => {
  const { label, value, maxValue, overflow } = props;

  return (
    <Flex direction="column" between={1}>
      <div>{label}</div>

      <Flex between={1}>
        {times(maxValue, (index) => (
          <div key={index} className={classNames(styles.bar, { [styles.filled]: index < value })} />
        ))}

        {overflow > 0 && <div>+{overflow}</div>}
      </Flex>
    </Flex>
  );
};

export default memo(Stat);
