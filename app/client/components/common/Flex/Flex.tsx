import { forwardRef, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './Flex.pcss';

export interface IFlexProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  direction?: 'row' | 'rowReverse' | 'column' | 'columnReverse';
  justifyContent?: 'center' | 'flexStart' | 'flexEnd' | 'spaceBetween';
  alignItems?: 'center' | 'flexStart' | 'flexEnd' | 'stretch';
  between?: 1 | 2 | 3 | 4 | 5;
}

const Flex = forwardRef<HTMLDivElement | null, IFlexProps>((props, ref) => {
  const { className, children, direction = 'row', justifyContent, alignItems, between, ...restProps } = props;

  return (
    <div
      className={classNames(
        styles.root,
        styles[`direction_${direction}`],
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
