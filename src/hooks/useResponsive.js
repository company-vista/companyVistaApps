import { useMemo } from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const MAX_WIDTH = 414;
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const effectiveWidth = Math.min(width, MAX_WIDTH);
    const rs = useMemo(() => (size) => PixelRatio.roundToNearestPixel((size * effectiveWidth) / BASE_WIDTH), [effectiveWidth]);
    const rvs = useMemo(() => (size) => PixelRatio.roundToNearestPixel((size * height) / BASE_HEIGHT), [height]);
    const rms = useMemo(() => (size, factor = 0.5) => {
        const scaled = (size * effectiveWidth) / BASE_WIDTH;
        return PixelRatio.roundToNearestPixel(size + (scaled - size) * factor);
    }, [effectiveWidth]);
    const isSmallScreen = width < 360;
    const isMediumScreen = width >= 360 && width < 768;
    const isLargeScreen = width >= 768;
    const isTablet = width >= 768;
    const isLandscape = width > height;
    const isPortrait = height >= width;
    return { width, height, effectiveWidth, rs, rvs, rms, isSmallScreen, isMediumScreen, isLargeScreen, isTablet, isLandscape, isPortrait };
}
