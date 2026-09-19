import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
// Tablet pe over-scale rokne ke liye max width cap (414 ~ iPhone Pro Max, 480 bhi chalega)
const MAX_WIDTH = 414;

function getWindowWidth() {
    return Dimensions.get('window').width;
}
function getWindowHeight() {
    return Dimensions.get('window').height;
}

export function s(size) {
    const width = getWindowWidth();
    const effectiveWidth = Math.min(width, MAX_WIDTH);
    return PixelRatio.roundToNearestPixel((size * effectiveWidth) / BASE_WIDTH);
}
export function vs(size) {
    const height = getWindowHeight();
    return PixelRatio.roundToNearestPixel((size * height) / BASE_HEIGHT);
}
export function ms(size, factor = 0.5) {
    return PixelRatio.roundToNearestPixel(size + (s(size) - size) * factor);
}
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const effectiveWidth = Math.min(width, MAX_WIDTH);
    const scaleW = effectiveWidth / BASE_WIDTH;
    const scaleH = height / BASE_HEIGHT;
    const rs = (size) => PixelRatio.roundToNearestPixel(size * scaleW);
    const rvs = (size) => PixelRatio.roundToNearestPixel(size * scaleH);
    const rms = (size, factor = 0.5) => PixelRatio.roundToNearestPixel(size + (rs(size) - size) * factor);
    const isSmallScreen = width < 360;
    const isMediumScreen = width >= 360 && width < 768;
    const isLargeScreen = width >= 768;
    const isTablet = width >= 768;
    const isLandscape = width > height;
    const isPortrait = height >= width;
    return { width, height, effectiveWidth, rs, rvs, rms, isSmallScreen, isMediumScreen, isLargeScreen, isTablet, isLandscape, isPortrait };
}
