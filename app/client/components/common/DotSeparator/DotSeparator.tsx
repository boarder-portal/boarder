import { FC, memo } from 'react';

import styles from './DotSeparator.module.scss';

const DotSeparator: FC = () => {
  return <span className={styles.root}>{'  •  '}</span>;
};

export default memo(DotSeparator);
