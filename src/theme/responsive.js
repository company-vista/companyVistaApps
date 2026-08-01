import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
export function s(size) {
    return PixelRatio.roundToNearestPixel((size * SCREEN_WIDTH) / BASE_WIDTH);
}
export function vs(size) {
    return PixelRatio.roundToNearestPixel((size * SCREEN_HEIGHT) / BASE_HEIGHT);
}
export function ms(size, factor = 0.5) {
    return size + (s(size) - size) * factor;
}
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const scaleW = width / BASE_WIDTH;
    const scaleH = height / BASE_HEIGHT;
    const rs = (size) => PixelRatio.roundToNearestPixel(size * scaleW);
    const rvs = (size) => PixelRatio.roundToNearestPixel(size * scaleH);
    const rms = (size, factor = 0.5) => size + (rs(size) - size) * factor;
    const isSmallScreen = width < 380;
    const isMediumScreen = width >= 380 && width < 768;
    const isLargeScreen = width >= 768;
    return { width, height, rs, rvs, rms, isSmallScreen, isMediumScreen, isLargeScreen };
}
