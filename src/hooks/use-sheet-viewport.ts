import React from 'react';
import { Dimensions } from 'react-native';

export const MIN_VIEWPORT_HEIGHT = 10;

const INITIAL_VIEWPORT_DIMENSIONS = {
  width: -1,
  height: -1,
};

type ViewportDimensions = typeof INITIAL_VIEWPORT_DIMENSIONS;

type UseSheetViewportOptions = {
  isAndroidModalPresentation: boolean;
  closingRef: React.RefObject<boolean>;
  hidingRef: React.RefObject<boolean>;
};

export function useSheetViewport({
  isAndroidModalPresentation,
  closingRef,
  hidingRef,
}: UseSheetViewportOptions) {
  const [dimensions, setDimensions] = React.useState<ViewportDimensions>(
    INITIAL_VIEWPORT_DIMENSIONS,
  );
  const dimensionsRef = React.useRef(dimensions);
  dimensionsRef.current = dimensions;

  const hasMeasuredViewport = dimensions.height > 0 && dimensions.width > 0;

  const resetViewportDimensions = React.useCallback(() => {
    setDimensions(INITIAL_VIEWPORT_DIMENSIONS);
  }, []);

  const updateViewportDimensions = React.useCallback(
    (width: number, height: number) => {
      if (
        height < MIN_VIEWPORT_HEIGHT ||
        width < 1 ||
        closingRef.current ||
        hidingRef.current
      ) {
        return;
      }

      /**
       * Android transparent Modal can report a shorter root layout on first
       * open than the actual fullscreen presentation height. When that
       * happens, the sheet computes its initial translateY from a viewport
       * that is too short, which makes part of the outer container visible
       * below the content like phantom bottom padding. Opening and closing
       * the keyboard later forces a relayout and the gap disappears.
       *
       * For modal presentation on Android we anchor the sheet to the real
       * screen height instead of trusting the first root layout height.
       * Width still comes from layout so orientation changes continue to
       * propagate correctly.
       */
      const normalizedHeight = isAndroidModalPresentation
        ? Dimensions.get('screen').height
        : height;

      setDimensions(current => {
        const orientationChanged = current.width > 0 && current.width !== width;
        const nextHeight =
          orientationChanged || current.height <= 0
            ? normalizedHeight
            : Math.max(current.height, normalizedHeight);

        if (current.width === width && current.height === nextHeight) {
          return current;
        }

        return {
          width,
          height: nextHeight,
        };
      });
    },
    [closingRef, hidingRef, isAndroidModalPresentation],
  );

  return {
    dimensions,
    dimensionsRef,
    hasMeasuredViewport,
    resetViewportDimensions,
    updateViewportDimensions,
  };
}
