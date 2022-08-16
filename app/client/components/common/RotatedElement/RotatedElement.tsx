import { AllHTMLAttributes, FC, memo, useLayoutEffect, useRef } from 'react';

interface IRealSizeElementProps extends AllHTMLAttributes<HTMLDivElement> {
  rotation: number;
}

const RotatedElement: FC<IRealSizeElementProps> = (props) => {
  const { rotation, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;

    if (!root || !inner) {
      return;
    }

    const rotateTransform = `rotate(${rotation / 4}turn)`;

    if (rotation % 2 === 0) {
      root.style.transform = rotateTransform;

      return;
    }

    const setSize = (initial: boolean): void => {
      const rect = inner.getBoundingClientRect();
      const realWidth = initial ? rect.width : rect.height;
      const realHeight = initial ? rect.height : rect.width;
      const rotationRemainder = ((rotation % 4) + 4) % 4;
      const offset = (realWidth - realHeight) / 2;

      inner.style.transform = `${rotateTransform} translate(${rotationRemainder === 1 ? offset : -offset}px, ${
        rotationRemainder === 1 ? offset : -offset
      }px)`;
      inner.style.width = `${realWidth}px`;
      inner.style.height = `${realHeight}px`;
      root.style.width = `${realHeight}px`;
      root.style.height = `${realWidth}px`;
    };

    setSize(true);

    const resizeObserver = new ResizeObserver(() => setSize(false));

    resizeObserver.observe(inner);

    return () => {
      resizeObserver.disconnect();

      inner.style.transform = '';
      inner.style.width = '';
      inner.style.height = '';
      root.style.width = '';
      root.style.height = '';
    };
  }, [rotation]);

  return (
    <div ref={rootRef}>
      <div ref={innerRef} {...rest} />
    </div>
  );
};

export default memo(RotatedElement);
