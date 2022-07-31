import { FC, HTMLAttributes, memo, useLayoutEffect, useRef } from 'react';

interface IRealSizeElementProps extends HTMLAttributes<HTMLDivElement> {
  rootClassName?: string;
  rotation: number;
}

const RotatedElement: FC<IRealSizeElementProps> = (props) => {
  const { rootClassName, rotation, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const intermediateRef = useRef<HTMLDivElement | null>(null);
  const innerContainerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const intermediate = intermediateRef.current;
    const innerContainer = innerContainerRef.current;

    if (!root || !intermediate || !innerContainer) {
      return;
    }

    const rotateTransform = `rotate(${rotation / 4}turn)`;

    if (rotation % 2 === 0) {
      root.style.transform = rotateTransform;

      return;
    }

    const setSize = (): void => {
      const realWidth = innerContainer.scrollWidth;
      const realHeight = innerContainer.scrollHeight;
      const rotationRemainder = ((rotation % 4) + 4) % 4;
      const offset = (realWidth - realHeight) / 2;

      intermediate.style.transform = `${rotateTransform} translate(${rotationRemainder === 1 ? offset : -offset}px, ${
        rotationRemainder === 1 ? offset : -offset
      }px)`;
      intermediate.style.width = `${realWidth}px`;
      intermediate.style.height = `${realHeight}px`;
      root.style.width = `${realHeight}px`;
      root.style.height = `${realWidth}px`;
    };

    setSize();

    const resizeObserver = new ResizeObserver(setSize);

    resizeObserver.observe(innerContainer);

    return () => {
      resizeObserver.disconnect();

      intermediate.style.transform = '';
      intermediate.style.width = '';
      intermediate.style.height = '';
      root.style.width = '';
      root.style.height = '';
    };
  }, [rotation]);

  return (
    <div ref={rootRef} className={rootClassName}>
      <div ref={intermediateRef}>
        <div ref={innerContainerRef} {...rest} />
      </div>
    </div>
  );
};

export default memo(RotatedElement);
