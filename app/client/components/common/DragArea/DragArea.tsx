import { AllHTMLAttributes, DragEvent, FC, memo, MouseEvent, useEffect, useRef } from 'react';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

export interface IDragAreaProps extends AllHTMLAttributes<HTMLDivElement> {
  onDragEnter?(): void;
  onDragLeave?(): void;
}

const DragArea: FC<IDragAreaProps> = (props) => {
  const { onDragEnter, onDragLeave, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const isFromOutside = useImmutableCallback((e: DragEvent | MouseEvent) => {
    return e.relatedTarget instanceof Element && !rootRef.current?.contains(e.relatedTarget);
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
      handleDragLeave();
    };
  }, [handleDragLeave]);

  return <div ref={rootRef} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} {...rest} />;
};

export default memo(DragArea);
