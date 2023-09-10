import { AllHTMLAttributes, DragEvent, MouseEvent, forwardRef, memo, useEffect, useRef } from 'react';

import useImmutableCallback from 'client/hooks/useImmutableCallback';
import useLeaveOnUnmount from 'client/hooks/useLeaveOnUnmount';

export interface DragAreaProps extends AllHTMLAttributes<HTMLDivElement> {
  onDragEnter?(): void;
  onDragLeave?(): void;
}

const DragArea = forwardRef<HTMLDivElement, DragAreaProps>((props, ref) => {
  const { onDragEnter, onDragLeave, ...rest } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const rootCallbackRef = useImmutableCallback((root: HTMLDivElement | null) => {
    rootRef.current = root;

    if (typeof ref === 'function') {
      ref(root);
    } else if (ref) {
      ref.current = root;
    }
  });

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

  useLeaveOnUnmount({
    onDragLeave,
  });

  useEffect(() => {
    return () => {
      handleDragLeave();
    };
  }, [handleDragLeave]);

  return <div ref={rootCallbackRef} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} {...rest} />;
});

DragArea.displayName = 'DragArea';

export default memo(DragArea);
