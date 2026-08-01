import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useThemeColors } from '../../../theme/colors';
import styles from '../screens/EditProfileScreen.styles';
function getDateFromInput(value) {
    const date = value ? new Date(value) : new Date(2000, 0, 1);
    return Number.isNaN(date.getTime()) ? new Date(2000, 0, 1) : date;
}
function getDateParts(value) {
    return {
        day: value.getDate(),
        month: value.getMonth(),
        year: value.getFullYear(),
    };
}
function clampDay(year, month, day) {
    const maxDay = new Date(year, month + 1, 0).getDate();
    return Math.min(day, maxDay);
}
function formatDateParts(year, month, day) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
}
function ProfileDatePickerModal({ onClose, onConfirm, value, visible, }) {
    const colors = useThemeColors();
    const [draftDate, setDraftDate] = useState(() => getDateParts(getDateFromInput(value)));
    useEffect(() => {
        if (visible) {
            setDraftDate(getDateParts(getDateFromInput(value)));
        }
    }, [value, visible]);
    const updateDraftDate = (part, amount) => {
        setDraftDate(current => {
            const next = {
                ...current,
                [part]: current[part] + amount,
            };
            const year = Math.min(new Date().getFullYear(), Math.max(1900, next.year));
            const month = Math.min(11, Math.max(0, next.month));
            const day = Math.max(1, clampDay(year, month, next.day));
            return { day, month, year };
        });
    };
    const handleConfirm = () => {
        onConfirm(formatDateParts(draftDate.year, draftDate.month, draftDate.day));
    };
    return (<Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Date of Birth</Text>
          <View style={styles.datePickerColumns}>
            <DateStepper label="Day" onDecrease={() => updateDraftDate('day', -1)} onIncrease={() => updateDraftDate('day', 1)} value={String(draftDate.day).padStart(2, '0')}/>
            <DateStepper label="Month" onDecrease={() => updateDraftDate('month', -1)} onIncrease={() => updateDraftDate('month', 1)} value={new Date(draftDate.year, draftDate.month, 1).toLocaleString('en-IN', {
            month: 'short',
        })}/>
            <DateStepper label="Year" onDecrease={() => updateDraftDate('year', -1)} onIncrease={() => updateDraftDate('year', 1)} value={String(draftDate.year)}/>
          </View>
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={[styles.modalButton, { borderColor: colors.border }]}>
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={[styles.modalButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.modalDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>);
}
function DateStepper({ label, onDecrease, onIncrease, value, }) {
    const colors = useThemeColors();
    return (<View style={styles.dateColumn}>
      <Text style={[styles.dateLabel, { color: colors.subtle }]}>{label}</Text>
      <Pressable onPress={onIncrease} style={[styles.dateStepButton, { borderColor: colors.border }]}>
        <FontAwesome name="angle-up" size={20} color={colors.text}/>
      </Pressable>
      <Text style={[styles.dateValue, { color: colors.text }]}>{value}</Text>
      <Pressable onPress={onDecrease} style={[styles.dateStepButton, { borderColor: colors.border }]}>
        <FontAwesome name="angle-down" size={20} color={colors.text}/>
      </Pressable>
    </View>);
}
export default ProfileDatePickerModal;
