import { useMemo } from 'react';
import { PixelRatio, useWindowDimensions } from 'react-native';
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const rs = useMemo(() => (size) => PixelRatio.roundToNearestPixel((size * width) / BASE_WIDTH), [width]);
    const rvs = useMemo(() => (size) => PixelRatio.roundToNearestPixel((size * height) / BASE_HEIGHT), [height]);
    const rms = useMemo(() => (size, factor = 0.5) => {
        const scaled = (size * width) / BASE_WIDTH;
        return PixelRatio.roundToNearestPixel(size + (scaled - size) * factor);
    }, [width]);
    const isSmallScreen = width < 380;
    const isMediumScreen = width >= 380 && width < 768;
    const isLargeScreen = width >= 768;
    return { width, height, rs, rvs, rms, isSmallScreen, isMediumScreen, isLargeScreen };
}
