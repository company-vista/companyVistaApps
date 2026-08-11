import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { font } from '../../../../theme/typography';
import { useThemeColors } from '../../../../theme/colors';

const AUTO_SLIDE_MS = 4000;
const SLIDE_ANIMATION_MS = 300;
const dummyAlerts = [
    {
        id: '1',
        title: 'Agent & Address',
        text: 'Your Registered Agent renewal is pending. Action required to keep your business address active.',
        action: 'Renew Now',
        tone: 'danger',
    },
    {
        id: '2',
        title: 'ITIN',
        text: 'Document verification required for your ITIN application. Submit missing details to proceed.',
        action: 'Apply Now',
        tone: 'warning',
    },
    {
        id: '3',
        title: 'State Filing',
        text: 'Your Annual State Report is due soon. File before the deadline to avoid state penalty fees.',
        action: 'File Now',
        tone: 'info',
    },
    {
        id: '4',
        title: 'Federal Filing',
        text: 'Federal filing is overdue. Complete your filing immediately to stay in Good Standing.',
        action: 'Verify Now',
        tone: 'danger',
    },
];

const slides = [...dummyAlerts, ...dummyAlerts];
const REAL_SLIDE_COUNT = dummyAlerts.length;
const TOTAL_SLIDE_COUNT = slides.length;

function ActionRequiredSlider() {
    const colors = useThemeColors();
    const isDark = colors.mode === 'dark';
    const scrollRef = useRef(null);
    const intervalRef = useRef(null);
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const [width, setWidth] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const toneStyles = {
        danger: {
            bg: isDark ? '#3b1515' : '#FCEBEB',
            border: isDark ? '#5c2222' : '#F7C1C1',
            text: isDark ? '#fca5a5' : '#501313',
            title: isDark ? '#fca5a5' : '#791F1F',
            action: isDark ? '#fca5a5' : '#A32D2D',
            icon: isDark ? '#f87171' : '#A32D2D',
        },
        warning: {
            bg: isDark ? '#3b2f0f' : '#FEF6E7',
            border: isDark ? '#5c4a1e' : '#F7DEB2',
            text: isDark ? '#fde68a' : '#6b4a0a',
            title: isDark ? '#fde68a' : '#8a5a00',
            action: isDark ? '#fde68a' : '#B47700',
            icon: isDark ? '#fbbf24' : '#B47700',
        },
        info: {
            bg: isDark ? '#12333f' : '#E7F6FB',
            border: isDark ? '#1f4e5e' : '#BCE4F0',
            text: isDark ? '#a5e8f7' : '#175a73',
            title: isDark ? '#a5e8f7' : '#0c5a73',
            action: isDark ? '#a5e8f7' : '#0F6B8C',
            icon: isDark ? '#38bdf8' : '#0F6B8C',
        },
    };

    const smoothScrollTo = useCallback((x) => {
        Animated.timing(scrollAnim, {
            toValue: x,
            duration: SLIDE_ANIMATION_MS,
            useNativeDriver: false,
        }).start();
    }, [scrollAnim]);

    useEffect(() => {
        const listenerId = scrollAnim.addListener(({ value }) => {
            scrollRef.current?.scrollTo({ x: value, animated: false });
        });
        return () => scrollAnim.removeListener(listenerId);
    }, [scrollAnim]);

    const goToIndex = (index) => {
        const total = dummyAlerts.length;
        const next = ((index % total) + total) % total;
        setActiveIndex(next);
        smoothScrollTo(next * width);
    };

    const startAutoSlide = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = prev + 1;
                const wrapped = next >= TOTAL_SLIDE_COUNT;
                const target = wrapped ? next - REAL_SLIDE_COUNT : next;
                if (wrapped) {
                    scrollRef.current?.scrollTo({ x: target * width, animated: false });
                    scrollAnim.setValue(target * width);
                }
                else {
                    smoothScrollTo(target * width);
                }
                return target;
            });
        }, AUTO_SLIDE_MS);
    }, [scrollAnim, smoothScrollTo, width]);

    useEffect(() => {
        if (width <= 0) {
            return undefined;
        }
        startAutoSlide();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [startAutoSlide, width]);

    const handleMomentumEnd = (event) => {
        if (width <= 0) {
            return;
        }
        const rawIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        const index = rawIndex % REAL_SLIDE_COUNT;
        scrollAnim.setValue(rawIndex * width);
        if (rawIndex >= REAL_SLIDE_COUNT) {
            scrollRef.current?.scrollTo({ x: index * width, animated: false });
            scrollAnim.setValue(index * width);
        }
        setActiveIndex(index);
        startAutoSlide();
    };

    return (
        <View
            style={styles.wrapper}
            onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleMomentumEnd}
            >
                {slides.map((alert, slideIndex) => {
                    const tone = toneStyles[alert.tone] ?? toneStyles.danger;
                    return (
                        <View
                            key={`${alert.id}-${slideIndex}`}
                            style={[styles.slide, { width, backgroundColor: tone.bg, borderColor: tone.border }]}
                        >
                            <View style={styles.alert}>
                                <FontAwesome name="exclamation-circle" size={15} color={tone.icon} />
                                <View style={styles.alertCopy}>
                                    <Text style={[styles.alertTitle, { color: tone.title }]}>{alert.title}</Text>
                                    <Text style={[styles.alertText, { color: tone.text }]}>
                                        {alert.text}
                                    </Text>
                                </View>
                                <Pressable accessibilityRole="button" style={[styles.alertActionButton, { backgroundColor: tone.action }]}>
                                    <Text style={styles.alertActionText}>{alert.action}</Text>
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {dummyAlerts.length > 1 && (
                <View style={styles.dots}>
                    {dummyAlerts.map((alert, index) => (
                        <Pressable
                            key={alert.id}
                            accessibilityRole="button"
                            hitSlop={6}
                            onPress={() => {
                                goToIndex(index);
                                startAutoSlide();
                            }}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === activeIndex ? colors.accent : colors.border,
                                    width: index === activeIndex ? 16 : 6,
                                },
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 10,
    },
    slide: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    alert: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    alertCopy: {
        flex: 1,
    },
    alertTitle: {
        fontSize: font.sm,
        fontWeight: '500',
    },
    alertText: {
        fontSize: font.sm,
        lineHeight: 16,
        marginTop: 1,
    },
    alertActionButton: {
        alignSelf: 'flex-start',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginTop: 2,
    },
    alertActionText: {
        color: '#ffffff',
        fontSize: font.sm,
        fontWeight: '600',
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginTop: 8,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
});

export default ActionRequiredSlider;
