import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../../../../theme/colors";
import { font } from "../../../../../theme/typography";
const RadioCard = ({ title, subtitle, selected, onPress, }) => {
    const colors = useThemeColors();
    return (<TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            borderWidth: 0.5,
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderColor: selected ? '#e6a82a' : colors.border,
        }} onPress={onPress} activeOpacity={0.8}>
      <View style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            borderWidth: 1.5,
            borderColor: selected ? '#e6a82a' : '#3a4258',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
        }}>
        {selected && (<View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#e6a82a' }}/>)}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: font.base, fontWeight: '500', marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ color: colors.subtle, fontSize: font.sm }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>);
};
export default RadioCard;
