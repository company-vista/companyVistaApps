import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { font } from '../../../../theme/typography';
import { useThemeColors, themePalette, makeThemeStyles } from '../../../../theme/colors';
import { s } from '../../../../theme/responsive';

const AUTO_SLIDE_MS = 4000;
const SLIDE_ANIMATION_MS = 300;
const dummyAlerts = [
    {
        id: '1',
        title: 'Agent & Address',
        text: 'Comming Soon',
        action: 'Renew Now',
        tone: 'danger',
    },
    {
        id: '2',
        title: 'ITIN',
        text: 'Comming Soon',
        action: 'Apply Now',
        tone: 'warning',
    },
    {
        id: '3',
        title: 'State Filing',
        text: 'Comming Soon',
        action: 'File Now',
        tone: 'info',
    },
    {
        id: '4',
        title: 'Federal Filing',
        text: 'Comming Soon',
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
            bg: isDark ? themePalette.hex_3b1515 : themePalette.hex_fcebeb,
            border: isDark ? themePalette.hex_5c2222 : themePalette.hex_f7c1c1,
            text: isDark ? themePalette.hex_fca5a5 : themePalette.hex_501313,
            title: isDark ? themePalette.hex_fca5a5 : themePalette.hex_791f1f,
            action: isDark ? themePalette.hex_fca5a5 : themePalette.hex_a32d2d,
            icon: isDark ? themePalette.hex_f87171 : themePalette.hex_a32d2d,
        },
        warning: {
            bg: isDark ? themePalette.hex_3b2f0f : themePalette.hex_fef6e7,
            border: isDark ? themePalette.hex_5c4a1e : themePalette.hex_f7deb2,
            text: isDark ? themePalette.hex_fde68a : themePalette.hex_6b4a0a,
            title: isDark ? themePalette.hex_fde68a : themePalette.hex_8a5a00,
            action: isDark ? themePalette.hex_fde68a : themePalette.hex_b47700,
            icon: isDark ? themePalette.hex_fbbf24 : themePalette.hex_b47700,
        },
        info: {
            bg: isDark ? themePalette.hex_12333f : themePalette.hex_e7f6fb,
            border: isDark ? themePalette.hex_1f4e5e : themePalette.hex_bce4f0,
            text: isDark ? themePalette.hex_a5e8f7 : themePalette.hex_175a73,
            title: isDark ? themePalette.hex_a5e8f7 : themePalette.hex_0c5a73,
            action: isDark ? themePalette.hex_a5e8f7 : themePalette.hex_0f6b8c,
            icon: isDark ? themePalette.hex_38bdf8 : themePalette.hex_0f6b8c,
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
                                {/* Ye cards abhi sirf dummy data hain — koi actual
                                    filing/renewal flow inke peeche nahi hai. Button
                                    isliye dead click nahi chhodte, toast se bata dete
                                    hain ki feature aa raha hai. Jab real action
                                    implement hoga to onPress yahin se replace hoga. */}
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`${alert.title} — ${alert.action}`}
                                    onPress={() => Toast.show({
                                        type: 'info',
                                        text1: 'Coming soon',
                                        text2: `${alert.title} is not available yet`,
                                    })}
                                    style={[styles.alertActionButton, !isDark && { borderWidth: 1, borderColor: tone.action }]}
                                >
                                    <Text style={[styles.alertActionText, !isDark && { color: tone.action }]}>{alert.action}</Text>
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

const styles = makeThemeStyles(() => StyleSheet.create({
    wrapper: {
        marginTop: 10,
    },
    slide: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: s(12),
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
        paddingHorizontal: s(12),
        paddingVertical: 7,
        marginTop: 2,
    },
    alertActionText: {
        color: themePalette.hex_ffffff,
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
}));

export default ActionRequiredSlider;
