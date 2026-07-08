import { useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RadioCard from "./components/ownershipRadioCard";
import { useThemeColors } from "../../../../theme/colors";
import { BackButton } from "../../../../components/buttons";

type OwnershipScreenProps = {
  onBackPress: () => void;
  onContinue: () => void;
};

export default function OwnershipScreen({ onBackPress, onContinue }: OwnershipScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [ownershipType, setOwnershipType] = useState<
    "individual" | "company" | "branch"
  >("individual");

  interface HoldingCompany {
    legalName: string;
    country: string;
    registrationNo: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    addressCountry: string;
    ownershipPercent: string;
  }

  const createEmptyHolding = (): HoldingCompany => ({
    legalName: '',
    country: '',
    registrationNo: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    addressCountry: '',
    ownershipPercent: '',
  });

  const [holdingCompanies, setHoldingCompanies] = useState<HoldingCompany[]>([createEmptyHolding()]);

  const updateHolding = (index: number, field: keyof HoldingCompany, value: string) => {
    setHoldingCompanies((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const addHoldingCompany = () => {
    setHoldingCompanies((prev) => [...prev, createEmptyHolding()]);
  };

  const removeHoldingCompany = (index: number) => {
    setHoldingCompanies((prev) => prev.filter((_, i) => i !== index));
  };

  const isAllFieldsEmpty = (h: HoldingCompany) =>
    !h.legalName && !h.country && !h.registrationNo &&
    !h.addressLine1 && !h.addressLine2 && !h.city &&
    !h.state && !h.zip && !h.addressCountry && !h.ownershipPercent;

  const renderHoldingCompanyForm = (h: HoldingCompany, index: number) => {
    const isPrimary = index === 0;
    const isEmpty = isAllFieldsEmpty(h);
    const inputBg = colors.mode === 'dark' ? colors.inputBackground : colors.surfaceAlt;

    return (
      <View key={index} style={styles.extraFields}>
        <View style={styles.holdingHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>
            {isPrimary ? 'Holding Company (Primary)' : `Holding Company #${index + 1}`}
          </Text>
          {!isPrimary && isEmpty && (
            <TouchableOpacity onPress={() => removeHoldingCompany(index)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            placeholder="Legal entity name"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { color: colors.text }]}
            value={h.legalName}
            onChangeText={(v) => updateHolding(index, 'legalName', v)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="Country"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.country}
              onChangeText={(v) => updateHolding(index, 'country', v)}
            />
          </View>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="Registration No."
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.registrationNo}
              onChangeText={(v) => updateHolding(index, 'registrationNo', v)}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Registered Address
        </Text>

        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            placeholder="Address Line 1"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { color: colors.text }]}
            value={h.addressLine1}
            onChangeText={(v) => updateHolding(index, 'addressLine1', v)}
          />
        </View>

        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            placeholder="Address Line 2"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { color: colors.text }]}
            value={h.addressLine2}
            onChangeText={(v) => updateHolding(index, 'addressLine2', v)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="City"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.city}
              onChangeText={(v) => updateHolding(index, 'city', v)}
            />
          </View>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="State"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.state}
              onChangeText={(v) => updateHolding(index, 'state', v)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="ZIP"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.zip}
              onChangeText={(v) => updateHolding(index, 'zip', v)}
            />
          </View>
          <View style={[styles.inputWrapper, styles.halfInput, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
            <TextInput
              placeholder="Country"
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.input, { color: colors.text }]}
              value={h.addressCountry}
              onChangeText={(v) => updateHolding(index, 'addressCountry', v)}
            />
          </View>
        </View>

        <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: colors.inputBorder }]}>
          <TextInput
            placeholder="Ownership %"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, { color: colors.text }]}
            value={h.ownershipPercent}
            onChangeText={(v) => updateHolding(index, 'ownershipPercent', v)}
            keyboardType="numeric"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: safeAreaInsets.top }]}>
        <BackButton onPress={onBackPress} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Company owned</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            How is the company <Text style={styles.titleAccent}>owned?</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            This determines who'll own and hold details of any private/trading company.
          </Text>

          <RadioCard
            title="Owned by individual(s)"
            subtitle="One or more individual shareholders"
            value="individual"
            selected={ownershipType === "individual"}
            onPress={() => setOwnershipType("individual")}
          />

          <RadioCard
            title="Owned by another company"
            subtitle="A local/international entity will hold shares"
            value="company"
            selected={ownershipType === "company"}
            onPress={() => setOwnershipType("company")}
          />

          <RadioCard
            title="Branch / representative office"
            subtitle="This will be a branch of an existing company"
            value="branch"
            selected={ownershipType === "branch"}
            onPress={() => setOwnershipType("branch")}
          />

          {ownershipType !== "individual" && (
            <View style={styles.extraFields}>
              {holdingCompanies.map((h, index) => renderHoldingCompanyForm(h, index))}

              <TouchableOpacity style={styles.addButton} onPress={addHoldingCompany}>
                <Text style={styles.addButtonText}>
                  + Add a second holding company
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footerColumn, { paddingBottom: safeAreaInsets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.continueButtonFull}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 6,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 23,
    marginBottom: 4,
  },
  titleAccent: {
    color: '#e6a82a',
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  extraFields: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 16,
  },
  inputWrapper: {
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    fontSize: 12,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  holdingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  removeText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    borderWidth: 0.5,
    borderColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#e6a82a',
    fontSize: 12,
    fontWeight: '500',
  },
  footerColumn: {
    gap: 8,
  },
  continueButtonFull: {
    backgroundColor: '#e6a82a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1204',
  },
});
