import { AllHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

import styles from './Flex.pcss';

export interface IFlexProps extends AllHTMLAttributes<HTMLDivElement> {
  className?: string;
  inline?: boolean;
  direction?: 'row' | 'rowReverse' | 'column' | 'columnReverse';
  justifyContent?: 'center' | 'flexStart' | 'flexEnd' | 'spaceBetween';
  alignItems?: 'center' | 'flexStart' | 'flexEnd' | 'stretch';
  between?: 1 | 2 | 3 | 4 | 5 | 6;
}

const Flex = forwardRef<HTMLDivElement | null, IFlexProps>((props, ref) => {
  const { className, children, inline, direction = 'row', justifyContent, alignItems, between, ...restProps } = props;

  return (
    <div
      className={classNames(
        styles.root,
        { [styles.inline]: inline },
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
