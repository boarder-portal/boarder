import classNames from 'classnames';
import { FC, memo } from 'react';

import Button, { ButtonProps } from 'client/components/common/Button/Button';

import styles from './IconButton.module.scss';

interface IconButtonProps extends ButtonProps {}

const IconButton: FC<IconButtonProps> = (props) => {
  const { className, ...buttonProps } = props;

  return <Button className={classNames(styles.root, className)} {...buttonProps} />;
};

export default memo(IconButton);
