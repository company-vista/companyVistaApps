import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import { s } from '../../theme/responsive';
import { useThemeColors } from '../../theme/colors';

const DocumentNotFound = ({ subtitle = "No company found." }) => {
  const colors = useThemeColors();
  const isDark = colors.mode === 'dark';

  // Theme-aware palette - muted, not bright white
  const palette = {
    docFillTop: isDark ? '#1E293B' : '#F8FAFC',
    docFillBottom: isDark ? '#0F172A' : '#F1F5F9',
    docStroke: isDark ? '#334155' : '#E2E8F0',
    foldFill: isDark ? '#1E293B' : '#E2E8F0',
    lineStrong: isDark ? '#475569' : '#CBD5E1',
    lineSoft: isDark ? '#334155' : '#E8EEF5',
    accent: '#6366F1',
    accentLight: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
    dot: isDark ? '#334155' : '#E0E7FF',
    shadow: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(148,163,184,0.18)',
    crossBg: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
    crossStroke: '#EF4444',
  };

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width="160" height="145" viewBox="0 0 210 190" fill="none">
          <Defs>
            <LinearGradient id="docGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={palette.docFillTop} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={palette.docFillBottom} stopOpacity="0.95" />
            </LinearGradient>
          </Defs>

          {/* Soft shadow under document */}
          <Ellipse cx="105" cy="168" rx="52" ry="9" fill={palette.shadow} />

          {/* Floating subtle dots - very low opacity */}
          <Circle cx="28" cy="38" r="3.5" fill={palette.dot} opacity="0.7" />
          <Circle cx="178" cy="42" r="5" fill={palette.dot} opacity="0.5" />
          <Circle cx="182" cy="142" r="3" fill={palette.dot} opacity="0.6" />
          <Circle cx="32" cy="132" r="2.5" fill="#A5B4FC" opacity="0.35" />

          {/* Document Card */}
          <G transform="translate(60, 22)">
            {/* Card body */}
            <Rect
              x="0"
              y="0"
              width="88"
              height="112"
              rx="12"
              fill="url(#docGrad2)"
              stroke={palette.docStroke}
              strokeWidth="1.6"
            />
            {/* Top indicator line - like header */}
            <Rect x="14" y="14" width="28" height="3.5" rx="1.75" fill={palette.lineStrong} opacity="0.9" />
            <Rect x="46" y="14" width="14" height="3.5" rx="1.75" fill={palette.lineSoft} />

            {/* Folded corner */}
            <Path
              d="M 64 0 L 88 24 L 64 24 Z"
              fill={palette.foldFill}
              stroke={palette.docStroke}
              strokeWidth="1.2"
            />
            <Path d="M 64 0 L 64 24 L 88 24" fill="none" stroke={palette.docStroke} strokeWidth="1" opacity="0.5" />

            {/* Content lines - skeleton */}
            <Rect x="14" y="30" width="60" height="3" rx="1.5" fill={palette.lineSoft} />
            <Rect x="14" y="38" width="48" height="3" rx="1.5" fill={palette.lineSoft} />
            <Rect x="14" y="46" width="54" height="3" rx="1.5" fill={palette.lineSoft} />
            <Rect x="14" y="58" width="60" height="2.5" rx="1.25" fill={palette.lineSoft} opacity="0.7" />
            <Rect x="14" y="65" width="42" height="2.5" rx="1.25" fill={palette.lineSoft} opacity="0.7" />

            {/* Dashed separator */}
            <Path d="M 14 74 L 74 74" stroke={palette.lineSoft} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />

            {/* Status badge placeholder with cross */}
            <G transform="translate(19, 84)">
              <Rect x="0" y="0" width="50" height="18" rx="9" fill={palette.crossBg} stroke={palette.crossStroke} strokeWidth="0.8" opacity="0.95" />
              <Circle cx="10" cy="9" r="6" fill="white" opacity="0.9" />
              <Path d="M 7.5 6.5 L 12.5 11.5 M 12.5 6.5 L 7.5 11.5" stroke={palette.crossStroke} strokeWidth="1.4" strokeLinecap="round" />
              <SvgText x="28" y="12.2" fontSize="6.5" fontWeight="700" fill={palette.crossStroke} textAnchor="middle" letterSpacing="0.3">
                EMPTY
              </SvgText>
            </G>
          </G>

          {/* Magnifying glass - overlapping bottom-right of doc, more refined */}
          <G transform="translate(112, 88)">
            {/* Outer glow */}
            <Circle cx="22" cy="22" r="30" fill={palette.accentLight} />
            <Circle cx="22" cy="22" r="22" fill="white" opacity={isDark ? 0.06 : 0.55} />
            {/* Lens ring */}
            <Circle cx="22" cy="22" r="20" fill="none" stroke={palette.accent} strokeWidth="4.2" strokeLinecap="round" />
            {/* Inner subtle highlight */}
            <Path d="M 10 10 A 20 20 0 0 1 18 6" stroke="white" strokeWidth="2" strokeLinecap="round" opacity={isDark ? 0.18 : 0.45} />
            {/* Handle */}
            <Path d="M 36.5 36.5 L 52 52" stroke={palette.accent} strokeWidth="6.5" strokeLinecap="round" />
            <Path d="M 36.5 36.5 L 52 52" stroke={isDark ? '#818CF8' : '#4F46E5'} strokeWidth="6.5" strokeLinecap="round" opacity="0.15" />

            {/* ? inside lens */}
            <SvgText x="22" y="29" fontSize="18" fontWeight="800" fill={palette.accent} textAnchor="middle">
              ?
            </SvgText>
          </G>
        </Svg>
      </View>

      <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: s(24),
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  svgContainer: {
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    opacity: 0.85,
  },
});

export default DocumentNotFound;
