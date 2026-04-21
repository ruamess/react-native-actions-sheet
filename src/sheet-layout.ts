import { Dimensions, Platform } from 'react-native';

type SheetLayoutMetricsOptions = {
  dimensionsHeight: number;
  insetsTop: number;
  insetsBottom: number;
  keyboardHeight: number;
  keyboardShown: boolean;
  useBottomSafeAreaPadding: boolean;
  isAndroidModalPresentation: boolean;
};

export function getSheetLayoutMetrics({
  dimensionsHeight,
  insetsTop,
  insetsBottom,
  keyboardHeight,
  keyboardShown,
  useBottomSafeAreaPadding,
  isAndroidModalPresentation,
}: SheetLayoutMetricsOptions) {
  const shouldApplyBottomSafeAreaPadding =
    useBottomSafeAreaPadding && !(Platform.OS === 'ios' && keyboardShown);

  const androidModalExcludedBottomSpace =
    isAndroidModalPresentation && dimensionsHeight > 0
      ? Math.max(
        0,
        Math.round(Dimensions.get('screen').height - dimensionsHeight),
      )
      : 0;

  const effectiveBottomInset = isAndroidModalPresentation
    ? Math.max(
      0,
      insetsBottom - Math.min(insetsBottom, androidModalExcludedBottomSpace),
    )
    : insetsBottom;

  const sheetBottomPadding = shouldApplyBottomSafeAreaPadding
    ? effectiveBottomInset
    : 0;

  const keyboardOverlap = keyboardShown
    ? keyboardHeight +
    (Platform.OS === 'android' && !shouldApplyBottomSafeAreaPadding
      ? effectiveBottomInset
      : 0)
    : 0;

  const sheetMaxHeight = keyboardShown
    ? dimensionsHeight - insetsTop - keyboardOverlap
    : dimensionsHeight - insetsTop;

  return {
    keyboardOverlap,
    modalNavigationBarTranslucent: isAndroidModalPresentation,
    sheetBottomPadding,
    sheetMaxHeight,
  };
}

export function getOffscreenTranslateY() {
  return Dimensions.get('window').height * 2;
}
