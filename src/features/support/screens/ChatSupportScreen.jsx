import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import { sendMessage } from '../api/messagesApi';
import { useAppSelector } from '../../../store/hooks';
import { useThemeColors } from '../../../theme/colors';
import { s } from '../../../theme/responsive';
import { font } from '../../../theme/typography';

const welcomeMessage = {
    id: 'welcome',
    text: 'Hi! Welcome to Company Vista support. How can we help you today?',
    sender: 'support',
    ts: Date.now(),
};

const autoReplies = [
    'Thanks for reaching out! Our team will get back to you shortly.',
    'Got it - we are looking into this for you.',
    'Sure, an agent will assist you in a moment.',
    'Thank you for the details. We will keep you posted here.',
];

function formatTime(ts) {
    const d = new Date(ts);
    let h = d.getHours();
    const m = `${d.getMinutes()}`.padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
}

function Bubble({ item, colors, isLight }) {
    const isMine = item.sender === 'me';
    const attachmentTint = isMine ? colors.buttonText : colors.text;
    return (
        <View style={[styles.row, isMine ? styles.rowMine : styles.rowSupport]}>
            <View style={[
                styles.bubble,
                isMine ? styles.bubbleMine : styles.bubbleSupport,
                isMine
                    ? { backgroundColor: colors.buttonBackground }
                    : { backgroundColor: isLight ? colors.surface : colors.cardElevated, borderColor: colors.border },
            ]}>
                {item.type === 'image' && item.uri ? (
                    <Image source={{ uri: item.uri }} style={styles.bubbleImage} resizeMode="cover"/>
                ) : null}
                {item.type === 'file' || item.type === 'audio' ? (
                    <View style={styles.attachmentRow}>
                        <FontAwesome
                            name={item.type === 'audio' ? 'music' : 'file-o'}
                            size={18}
                            color={attachmentTint}
                        />
                        <Text style={[styles.attachmentName, { color: attachmentTint }]} numberOfLines={1}>
                            {item.fileName}
                        </Text>
                    </View>
                ) : null}
                {item.text ? (
                    <Text style={[styles.bubbleText, { color: isMine ? colors.buttonText : colors.text }]}>{item.text}</Text>
                ) : null}
                <Text style={[styles.bubbleTime, { color: isMine ? colors.buttonText : colors.muted }]}>{formatTime(item.ts)}</Text>
            </View>
        </View>
    );
}

const attachOptions = [
    { key: 'photo', label: 'Photo', icon: 'image', handler: 'photo' },
    { key: 'file', label: 'File', icon: 'file-o', handler: 'file' },
    { key: 'audio', label: 'Audio', icon: 'music', handler: 'audio' },
];

function AttachMenu({ visible, colors, onClose, onPickPhoto, onPickFile, onPickAudio }) {
    const handlers = { photo: onPickPhoto, file: onPickFile, audio: onPickAudio };
    return (
        <Modal transparent visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={[styles.attachBackdrop, { backgroundColor: colors.backdrop }]} onPress={onClose}>
                <View style={[styles.attachSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {attachOptions.map(option => (
                        <Pressable
                            key={option.key}
                            onPress={handlers[option.handler]}
                            style={({ pressed }) => [
                                styles.attachOption,
                                { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
                            ]}
                        >
                            <View style={[styles.attachOptionIcon, { backgroundColor: colors.accentSoft }]}>
                                <FontAwesome name={option.icon} size={20} color={colors.accent}/>
                            </View>
                            <Text style={[styles.attachOptionLabel, { color: colors.text }]}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
}

export default function ChatSupportScreen() {
    const colors = useThemeColors();
    const isLight = colors.mode === 'light';
    const insets = useSafeAreaInsets();
    const token = useAppSelector(state => state.auth.token);
    const clientId = useAppSelector(state => state.auth.user?._id ?? state.auth.user?.id ?? state.auth.user?.clientId ?? null);
    const [messages, setMessages] = useState([welcomeMessage]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [inputBarHeight, setInputBarHeight] = useState(0);
    const [attachMenuOpen, setAttachMenuOpen] = useState(false);
    const replyIndexRef = useRef(0);
    const timerRef = useRef(null);

    // Keyboard handling: targetSdk 36 (Android 15+) pe edge-to-edge force hai,
    // isliye windowSoftInputMode="adjustResize" ignore hota hai aur keyboard
    // seedha screen ke upar overlay karta hai. Input bar ko hamesha asli screen
    // ke bottom pe render karte hain (root View me absolute-positioned), taaki
    // keyboardDidShow ke endCoordinates.height se use exactly keyboard ke upar
    // shift kiya ja sake. FullWindowOverlay (react-native-screens) Canvas/edge
    // layers ke upar bhi bar ko sahi jagah rakhta hai.
    const keyboardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSub = Keyboard.addListener(showEvent, (e) => {
            const kbHeight = e.endCoordinates.height;
            const duration = Platform.OS === 'ios' ? (e.endCoordinates.duration ?? 250) : 200;
            keyboardAnim.stopAnimation();
            Animated.timing(keyboardAnim, { toValue: kbHeight, duration, useNativeDriver: false }).start();
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            keyboardAnim.stopAnimation();
            Animated.timing(keyboardAnim, { toValue: 0, duration: Platform.OS === 'ios' ? 200 : 0, useNativeDriver: false }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardAnim]);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const pushOutgoing = useCallback((message) => {
        setMessages(prev => [{ id: `m${Date.now()}`, sender: 'me', ts: Date.now(), ...message }, ...prev]);
        const text = message.type === 'text'
            ? message.text
            : `Sent ${message.type === 'image' ? 'a photo' : message.type === 'audio' ? 'an audio' : 'a file'}: ${message.fileName}`;
        sendMessage({ clientId, text, token }).then(result => {
            if (!result.isSuccess) {
                Toast.show({ type: 'error', text1: 'Message not sent', text2: result.error });
            }
        });
        setIsTyping(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const reply = autoReplies[replyIndexRef.current % autoReplies.length];
            replyIndexRef.current += 1;
            setIsTyping(false);
            setMessages(prev => [{ id: `r${Date.now()}`, text: reply, sender: 'support', ts: Date.now() }, ...prev]);
        }, 1400);
    }, [clientId, token]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) {
            return;
        }
        setInput('');
        pushOutgoing({ text, type: 'text' });
    };

    const handlePickPhoto = async () => {
        setAttachMenuOpen(false);
        try {
            const response = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
            if (response.didCancel) {
                return;
            }
            if (response.errorMessage) {
                Toast.show({ type: 'error', text1: response.errorMessage });
                return;
            }
            const asset = response.assets?.[0];
            if (asset?.uri) {
                pushOutgoing({ type: 'image', uri: asset.uri, fileName: asset.fileName ?? 'photo' });
            }
        }
        catch (error) {
            Toast.show({ type: 'error', text1: error?.message ?? 'Unable to open gallery.' });
        }
    };

    const handlePickDocument = async (kind) => {
        setAttachMenuOpen(false);
        try {
            const response = await pick({
                type: kind === 'audio' ? [types.audio] : [types.pdf, types.docx, types.plainText],
                allowMultiSelection: false,
            });
            const item = response?.[0];
            if (item?.uri) {
                pushOutgoing({
                    type: kind,
                    uri: item.uri,
                    fileName: item.name ?? (kind === 'audio' ? 'audio' : 'file'),
                });
            }
        }
        catch (error) {
            if (error?.code === 'DOCUMENT_PICKER_CANCELED' || error?.code === 'user_cancelled') {
                return;
            }
            Toast.show({ type: 'error', text1: error?.message ?? 'Unable to open picker.' });
        }
    };

    const inputBar = (
        <View
            style={styles.inputBarWrap}
            pointerEvents="box-none"
        >
            <Animated.View
                onLayout={e => setInputBarHeight(e.nativeEvent.layout.height)}
                style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 10, marginBottom: keyboardAnim }]}
            >
                <Pressable
                    onPress={() => setAttachMenuOpen(true)}
                    style={({ pressed }) => [
                        styles.attachBtn,
                        { backgroundColor: colors.surfaceAlt, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                >
                    <FontAwesome name="plus" size={18} color={colors.text}/>
                </Pressable>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt, color: colors.text, borderColor: colors.inputBorder }]}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.inputPlaceholder}
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <Pressable
                    onPress={handleSend}
                    disabled={!input.trim()}
                    style={({ pressed }) => [
                        styles.sendBtn,
                        { backgroundColor: colors.buttonBackground, opacity: !input.trim() ? 0.5 : pressed ? 0.85 : 1 },
                    ]}
                >
                    <FontAwesome name="paper-plane" size={16} color={colors.buttonText}/>
                </Pressable>
            </Animated.View>
        </View>
    );

    return (
        <View style={styles.flex}>
            <Animated.View style={[styles.flex, { marginBottom: Animated.add(inputBarHeight, keyboardAnim) }]}>
                <FlatList
                    style={styles.flex}
                    data={messages}
                    keyExtractor={item => item.id}
                    inverted
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => <Bubble item={item} colors={colors} isLight={isLight}/>}
                    keyboardShouldPersistTaps="handled"
                />
                {isTyping ? (
                    <View style={[styles.typingWrap, styles.typingWrapPad]}>
                        <View style={[styles.typingBubble, { backgroundColor: isLight ? colors.surface : colors.cardElevated, borderColor: colors.border }]}>
                            <Text style={[styles.typingText, { color: colors.muted }]}>Support is typing&hellip;</Text>
                        </View>
                    </View>
                ) : null}
            </Animated.View>
            {Platform.OS === 'ios' ? (
                <FullWindowOverlay>
                    {inputBar}
                </FullWindowOverlay>
            ) : inputBar}
            <AttachMenu
                visible={attachMenuOpen}
                colors={colors}
                onClose={() => setAttachMenuOpen(false)}
                onPickPhoto={handlePickPhoto}
                onPickFile={() => handlePickDocument('file')}
                onPickAudio={() => handlePickDocument('audio')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: s(14),
        paddingVertical: 12,
    },
    row: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    rowMine: {
        justifyContent: 'flex-end',
    },
    rowSupport: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    bubbleMine: {},
    bubbleSupport: {
        borderWidth: 1,
    },
    bubbleText: {
        fontSize: font.base,
        lineHeight: font.base + 5,
    },
    bubbleTime: {
        fontSize: font.xs,
        marginTop: 4,
        alignSelf: 'flex-end',
        opacity: 0.7,
    },
    typingWrap: {
        paddingHorizontal: s(14),
    },
    typingWrapPad: {
        paddingBottom: 6,
    },
    typingBubble: {
        alignSelf: 'flex-start',
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: font.sm,
        fontStyle: 'italic',
    },
    inputBarWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        paddingHorizontal: s(12),
        paddingTop: 10,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 42,
        maxHeight: 110,
        borderWidth: 1,
        borderRadius: 21,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: font.base,
    },
    sendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubbleImage: {
        width: 180,
        height: 180,
        borderRadius: 10,
        marginBottom: 4,
    },
    attachmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    attachmentName: {
        flexShrink: 1,
        fontSize: font.sm,
    },
    attachBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    attachSheet: {
        margin: s(12),
        marginBottom: s(96),
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    attachOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    attachOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attachOptionLabel: {
        fontSize: font.base,
        fontWeight: '500',
    },
});
