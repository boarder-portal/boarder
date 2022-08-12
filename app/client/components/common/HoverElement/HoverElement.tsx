import { AllHTMLAttributes, DragEvent, FC, memo, MouseEvent, useEffect, useRef } from 'react';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export interface IHoverElementProps extends AllHTMLAttributes<HTMLDivElement> {
  onMouseEnter?(): void;
  onMouseLeave?(): void;
  onDragEnter?(): void;
  onDragLeave?(): void;
}

const HoverElement: FC<IHoverElementProps> = (props) => {
  const { onMouseEnter, onMouseLeave, onDragEnter, onDragLeave, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const isFromOutside = useImmutableCallback((e: DragEvent | MouseEvent) => {
    return e.relatedTarget instanceof Element && !rootRef.current?.contains(e.relatedTarget);
  });

  const handleMouseEnter = useImmutableCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isFromOutside(e)) {
      onMouseEnter?.();
    }
  });

  const handleMouseLeave = useImmutableCallback((e?: MouseEvent<HTMLDivElement>) => {
    if (!e || isFromOutside(e)) {
      onMouseLeave?.();
    }
  });

  const handleDragEnter = useImmutableCallback((e: DragEvent<HTMLDivElement>) => {
    if (isFromOutside(e)) {
      onDragEnter?.();
    }
  });

  const handleDragLeave = useImmutableCallback((e?: DragEvent<HTMLDivElement>) => {
    if (!e || isFromOutside(e)) {
      onDragLeave?.();
    }
  });

  useEffect(() => {
    return () => {
      handleMouseLeave();
      handleDragLeave();
    };
  }, [handleDragLeave, handleMouseLeave]);

  return (
    <div
      ref={rootRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      {...rest}
    />
  );
};

export default memo(HoverElement);
