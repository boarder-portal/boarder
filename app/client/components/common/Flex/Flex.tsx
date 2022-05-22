import { forwardRef, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './Flex.pcss';

interface IFlexProps {}

interface IFlexProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  direction?: 'row' | 'column';
  justifyContent?: 'center' | 'flexStart' | 'flexEnd' | 'spaceBetween';
  alignItems?: 'center' | 'flexStart' | 'flexEnd' | 'stretch';
  between?: 1 | 2 | 3 | 4 | 5;
}

const Flex = forwardRef<HTMLDivElement | null, IFlexProps>((props, ref) => {
  const { className, children, direction, justifyContent, alignItems, between, ...restProps } = props;

  return (
    <div
      className={classNames(
        styles.root,
        direction ? styles[`direction_${direction}`] : '',
        justifyContent ? styles[`justifyContent_${justifyContent}`] : '',
        alignItems ? styles[`alignItems_${alignItems}`] : '',
        between ? styles[`between_${between}`] : '',
        className,
      )}
      ref={ref}
      {...restProps}
    >
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

export default Flex;
