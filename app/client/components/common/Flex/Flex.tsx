import classNames from 'classnames';
import { AllHTMLAttributes, forwardRef } from 'react';

import styles from './Flex.module.scss';

export interface FlexProps extends AllHTMLAttributes<HTMLDivElement> {
  inline?: boolean;
  direction?: 'row' | 'rowReverse' | 'column' | 'columnReverse';
  justifyContent?: 'center' | 'flexStart' | 'flexEnd' | 'spaceBetween';
  alignItems?: 'center' | 'flexStart' | 'flexEnd' | 'stretch';
  between?: number;
}

const Flex = forwardRef<HTMLDivElement | null, FlexProps>((props, ref) => {
  const {
    className,
    children,
    inline,
    direction = 'row',
    justifyContent,
    alignItems,
    between,
    style,
    ...restProps
  } = props;

  return (
    <div
      className={classNames(
        styles.root,
        { [styles.inline]: inline },
        styles[`direction_${direction}`],
        justifyContent ? styles[`justifyContent_${justifyContent}`] : '',
        alignItems ? styles[`alignItems_${alignItems}`] : '',
        className,
      )}
      ref={ref}
      style={{
        ...style,
        gap: typeof between === 'number' ? `${between * 4}px` : undefined,
      }}
      {...restProps}
    >
      {children}
    </div>
  );
});

Flex.displayName = 'Flex';

export default Flex;
