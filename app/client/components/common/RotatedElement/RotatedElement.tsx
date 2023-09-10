import { AllHTMLAttributes, CSSProperties, FC, memo, useLayoutEffect, useRef } from 'react';

interface RotatedElementProps extends AllHTMLAttributes<HTMLDivElement> {
  rootStyle?: CSSProperties;
  rotation: number;
}

const RotatedElement: FC<RotatedElementProps> = (props) => {
  const { rotation, rootStyle, style, ...rest } = props;

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
      inner.style.transform = rotateTransform;

      return;
    }

    const setSize = (): void => {
      const realWidth = inner.offsetWidth;
      const realHeight = inner.offsetHeight;
      const rotationRemainder = ((rotation % 4) + 4) % 4;
      const offset = (realWidth - realHeight) / 2;

      inner.style.willChange = 'transform';
      inner.style.transform = `${rotateTransform} translate(${rotationRemainder === 1 ? offset : -offset}px, ${
        rotationRemainder === 1 ? offset : -offset
      }px)`;
      inner.style.width = `${realWidth}px`;
      inner.style.height = `${realHeight}px`;
      root.style.width = `${realHeight}px`;
      root.style.height = `${realWidth}px`;
    };

    setSize();

    const resizeObserver = new ResizeObserver(setSize);

    resizeObserver.observe(inner);

    return () => {
      resizeObserver.disconnect();

      inner.style.willChange = '';
      inner.style.transform = '';
      inner.style.width = '';
      inner.style.height = '';
      root.style.width = '';
      root.style.height = '';
    };
  }, [rotation]);

  if (rotation % 4 === 0) {
    return <div style={{ ...rootStyle, ...style }} {...rest} />;
  }

  return (
    <div ref={rootRef} style={rootStyle}>
      <div ref={innerRef} style={style} {...rest} />
    </div>
  );
};

export default memo(RotatedElement);
