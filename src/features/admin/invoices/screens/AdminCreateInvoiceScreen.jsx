import { font } from '../../../../theme/typography';
import { useThemeColors, useResolvedThemeMode } from '../../../../theme/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../../store/hooks';
import {
  fetchInvoiceCompanies,
  fetchInvoicePlans,
  fetchAdminInvoice,
  saveAdminInvoice,
  updateAdminInvoice,
} from '../api/invoicesApi';

const INVOICE_TYPES = {
  ONE_TIME: 'one_time',
  SUBSCRIPTION: 'subscription',
  HYBRID: 'hybrid',
};

const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly', durationDays: 7, interval: 'week' },
  { value: 'monthly', label: 'Monthly', durationDays: 30, interval: 'month' },
  { value: 'quarterly', label: 'Quarterly', durationDays: 90, interval: 'month' },
  { value: 'semi_annual', label: 'Semi-Annual', durationDays: 180, interval: 'month' },
  { value: 'annual', label: 'Annual', durationDays: 365, interval: 'year' },
];

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'];
const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid'];
const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'credit_card', label: 'Credit card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const localDateString = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createInvoiceNumber = invoiceType => {
  const prefix =
    invoiceType === INVOICE_TYPES.SUBSCRIPTION
      ? 'SUB'
      : invoiceType === INVOICE_TYPES.HYBRID
        ? 'HYB'
        : 'INV';
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${yearMonth}-${random}`;
};

const createItem = (itemType = 'one_time', recurringFrequency = 'annual') => ({
  id: `${Date.now()}-${Math.random()}`,
  itemName: '',
  description: '',
  amount: '',
  quantity: '1',
  itemType,
  recurringFrequency,
  applyTax: true,
  discount: '',
  planId: null,
  stripePriceId: null,
  interval: null,
});

const calculateDiscountAmount = (subtotal, discountType, discountValue) => {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeValue = Math.max(0, Number(discountValue) || 0);
  if (discountType === 'percentage') {
    return Math.min(safeSubtotal, (safeSubtotal * safeValue) / 100);
  }
  return Math.min(safeSubtotal, safeValue);
};

const getInvoiceTotals = form => {
  const isINR = form.currency === 'INR';
  const isSpecificDiscount = !isINR && form.discountMode === 'specific';
  let subtotal = 0;
  let specificTaxBase = 0;

  form.items.forEach(item => {
    const gross =
      (Number.parseFloat(item.amount) || 0) *
      (Number.parseFloat(item.quantity) || 1);
    const itemDiscount = isSpecificDiscount
      ? Math.max(0, Math.min(gross, Number.parseFloat(item.discount) || 0))
      : 0;
    const lineAmount = gross - itemDiscount;
    subtotal += lineAmount;
    if (item.applyTax !== false) specificTaxBase += lineAmount;
  });

  const discount = isSpecificDiscount
    ? 0
    : calculateDiscountAmount(subtotal, form.discountType, form.discountValue);
  const discountRatio = subtotal > 0 ? discount / subtotal : 0;
  const taxBase = isINR
    ? form.taxMode === 'specific'
      ? specificTaxBase * (1 - discountRatio)
      : subtotal - discount
    : 0;
  const tax = taxBase * ((Number.parseFloat(form.taxRate) || 0) / 100);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(Math.max(0, subtotal - discount + tax).toFixed(2)),
  };
};

const formatAmount = (value, currency) => {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return Number(value || 0).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getCompanyName = company =>
  company?.companyName || company?.name || 'Company';

const getDateInputValue = value =>
  value ? String(value).slice(0, 10) : '';

const invoiceToForm = (invoice, fallbackDate, fallbackDueDate) => {
  const rawType = String(invoice.invoiceType || invoice.type || '').toLowerCase();
  const invoiceType = ['hybrid'].includes(rawType)
    ? INVOICE_TYPES.HYBRID
    : ['subscription', 'recurring'].includes(rawType)
      ? INVOICE_TYPES.SUBSCRIPTION
      : INVOICE_TYPES.ONE_TIME;
  const subscriptionType = invoice.subscriptionType || invoice.billingCycle || 'annual';
  const items = Array.isArray(invoice.items) && invoice.items.length
    ? invoice.items.map((item, index) => ({
        ...createItem(),
        id: String(item._id || item.id || `invoice-item-${index}`),
        itemName: item.itemName || item.item || '',
        description: item.description || '',
        amount: String(item.amount ?? item.price ?? ''),
        quantity: String(item.quantity || 1),
        itemType:
          item.itemType ||
          (item.isRecurring ? 'recurring' : 'one_time'),
        recurringFrequency: item.recurringFrequency || subscriptionType,
        applyTax: item.applyTax !== false,
        discount: String(item.discount || ''),
        planId: item.planId?._id || item.planId || null,
        stripePriceId: item.stripePriceId || null,
        interval: item.interval || null,
      }))
    : [createItem()];

  return {
    invoiceType,
    invoiceNumber: invoice.invoiceNumber || createInvoiceNumber(invoiceType),
    invoiceHead: invoice.invoiceHead || '',
    invoiceDate: getDateInputValue(invoice.invoiceDate) || fallbackDate,
    dueDate: getDateInputValue(invoice.dueDate) || fallbackDueDate,
    currency: String(invoice.currency || 'USD').toUpperCase(),
    paymentStatus: String(invoice.paymentStatus || 'unpaid').toLowerCase(),
    paymentMethod: invoice.paymentMethod || '',
    paidAmount: String(invoice.paidAmount || 0),
    companyId:
      invoice.company?._id ||
      invoice.company ||
      invoice.companyId?._id ||
      invoice.companyId ||
      '',
    globalSubscription: {
      enabled: invoiceType !== INVOICE_TYPES.ONE_TIME,
      subscriptionType,
      subscriptionStartDate:
        getDateInputValue(invoice.subscriptionStartDate) || fallbackDate,
      subscriptionEndDate: getDateInputValue(invoice.subscriptionEndDate),
      autoRenew: Boolean(invoice.autoRenew),
      billingCycle: invoice.billingCycle || subscriptionType,
    },
    items,
    notes: invoice.notes || '',
    termsAndConditions: invoice.termsAndConditions || '',
    taxRate: String(invoice.taxRate ?? 0),
    taxMode: invoice.taxMode || 'all',
    discountType: invoice.discountType || 'fixed',
    discountValue: String(invoice.discountValue ?? invoice.discount ?? 0),
    discountMode: invoice.discountMode || 'all',
  };
};

const AdminCreateInvoiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useResolvedThemeMode() === 'dark';
  const token = useAppSelector(state => state.auth.token);
  const invoiceId = route.params?.invoiceId;
  const isEditing = Boolean(invoiceId);
  const today = useMemo(() => new Date(), []);
  const dueDateDefault = useMemo(() => {
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);
    return localDateString(dueDate);
  }, [today]);

  const [form, setForm] = useState(() => ({
    invoiceType: INVOICE_TYPES.ONE_TIME,
    invoiceNumber: createInvoiceNumber(INVOICE_TYPES.ONE_TIME),
    invoiceHead: '',
    invoiceDate: localDateString(today),
    dueDate: dueDateDefault,
    currency: 'USD',
    paymentStatus: 'unpaid',
    paymentMethod: '',
    paidAmount: '0',
    companyId: '',
    globalSubscription: {
      enabled: false,
      subscriptionType: 'annual',
      subscriptionStartDate: localDateString(today),
      subscriptionEndDate: '',
      autoRenew: false,
      billingCycle: 'annual',
    },
    items: [createItem()],
    notes: '',
    termsAndConditions: '',
    taxRate: '0',
    taxMode: 'all',
    discountType: 'fixed',
    discountValue: '0',
    discountMode: 'all',
  }));
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [companyQuery, setCompanyQuery] = useState('');
  const [planQuery, setPlanQuery] = useState('');
  const [companyLoading, setCompanyLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
  const [companyError, setCompanyError] = useState('');
  const [planError, setPlanError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(isEditing);

  const selectedCompany = companies.find(
    company => String(company._id || company.id) === String(form.companyId),
  );
  const isSubscription = form.invoiceType === INVOICE_TYPES.SUBSCRIPTION;
  const isHybrid = form.invoiceType === INVOICE_TYPES.HYBRID;
  const isINR = form.currency === 'INR';
  const totals = useMemo(() => getInvoiceTotals(form), [form]);
  const symbol = { USD: '$', INR: '₹', EUR: '€', GBP: '£' }[form.currency];
  const statusColors =
    form.paymentStatus === 'paid'
      ? { backgroundColor: colors.accentSoft, color: colors.accent }
      : form.paymentStatus === 'partial'
        ? { backgroundColor: colors.sheet, color: colors.muted }
        : { backgroundColor: colors.sheet, color: colors.danger };

  useEffect(() => {
    let active = true;
    if (!invoiceId) {
      setInvoiceLoading(false);
      return () => {
        active = false;
      };
    }

    fetchAdminInvoice({ token, id: invoiceId })
      .then(invoice => {
        if (active) {
          setForm(invoiceToForm(invoice, localDateString(today), dueDateDefault));
          setCompanyQuery(getCompanyName(invoice.company));
        }
      })
      .catch(error => {
        if (active) {
          Alert.alert('Unable to load invoice', error.message, [
            { text: 'Go back', onPress: () => navigation.goBack() },
          ]);
        }
      })
      .finally(() => {
        if (active) setInvoiceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dueDateDefault, invoiceId, navigation, today, token]);

  useEffect(() => {
    let active = true;
    fetchInvoiceCompanies(token)
      .then(data => {
        if (active) {
          setCompanies(data);
          setCompanyError('');
        }
      })
      .catch(error => {
        if (active) setCompanyError(error.message);
      })
      .finally(() => {
        if (active) setCompanyLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    let active = true;
    fetchInvoicePlans(token)
      .then(data => {
        if (active) {
          setPlans(data);
          setPlanError('');
        }
      })
      .catch(error => {
        if (active) setPlanError(error.message);
      })
      .finally(() => {
        if (active) setPlanLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!form.globalSubscription.enabled) return;
    const cycle = BILLING_CYCLES.find(
      entry => entry.value === form.globalSubscription.subscriptionType,
    );
    if (!cycle || !form.globalSubscription.subscriptionStartDate) return;
    const endDate = new Date(`${form.globalSubscription.subscriptionStartDate}T00:00:00`);
    endDate.setDate(endDate.getDate() + cycle.durationDays);
    const subscriptionEndDate = localDateString(endDate);
    setForm(previous =>
      previous.globalSubscription.subscriptionEndDate === subscriptionEndDate
        ? previous
        : {
            ...previous,
            globalSubscription: {
              ...previous.globalSubscription,
              subscriptionEndDate,
            },
          },
    );
  }, [
    form.globalSubscription.enabled,
    form.globalSubscription.subscriptionStartDate,
    form.globalSubscription.subscriptionType,
  ]);

  const updateForm = useCallback((field, value) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => (previous[field] ? { ...previous, [field]: '' } : previous));
  }, []);

  const updateSubscription = (field, value) => {
    setForm(previous => {
      const subscription = {
        ...previous.globalSubscription,
        [field]: value,
      };
      if (field === 'billingCycle') subscription.subscriptionType = value;
      if (field === 'subscriptionType') subscription.billingCycle = value;
      return { ...previous, globalSubscription: subscription };
    });
  };

  const changeInvoiceType = type => {
    const itemType = type === INVOICE_TYPES.SUBSCRIPTION ? 'recurring' : 'one_time';
    setForm(previous => ({
      ...previous,
      invoiceType: type,
      invoiceNumber: isEditing ? previous.invoiceNumber : createInvoiceNumber(type),
      globalSubscription: {
        ...previous.globalSubscription,
        enabled: type !== INVOICE_TYPES.ONE_TIME,
      },
      items: previous.items.map(item => ({
        ...item,
        itemType,
        ...(type === INVOICE_TYPES.ONE_TIME
          ? { planId: null, stripePriceId: null, interval: null }
          : {}),
      })),
    }));
  };

  const updateItem = (id, field, value) => {
    setForm(previous => ({
      ...previous,
      items: previous.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setErrors(previous => {
      const next = { ...previous };
      delete next[`item_${id}_amount`];
      return next;
    });
  };

  const addItem = () => {
    setForm(previous => ({
      ...previous,
      items: [
        ...previous.items,
        createItem(
          previous.invoiceType === INVOICE_TYPES.SUBSCRIPTION
            ? 'recurring'
            : 'one_time',
          previous.globalSubscription.billingCycle,
        ),
      ],
    }));
  };

  const removeItem = id => {
    setForm(previous => ({
      ...previous,
      items:
        previous.items.length > 1
          ? previous.items.filter(item => item.id !== id)
          : previous.items,
    }));
  };

  const selectPlan = plan => {
    const cycle = form.globalSubscription.billingCycle;
    const matchingInterval =
      BILLING_CYCLES.find(entry => entry.value === cycle)?.interval || 'month';
    const price =
      plan.prices?.find(item => item.interval === matchingInterval) ||
      plan.prices?.[0];
    if (form.items.some(item => item.planId === plan._id)) {
      Alert.alert('Plan already added', 'This plan is already on the invoice.');
      return;
    }
    const planItem = {
      ...createItem('recurring', cycle),
      itemName: plan.name,
      description: plan.description || plan.name,
      amount: String(price?.price || 0),
      planId: plan._id,
      stripePriceId: price?.stripePriceId || null,
      interval: price?.interval || matchingInterval,
    };
    setForm(previous => ({
      ...previous,
      items: [...previous.items.filter(item => item.itemName !== ''), planItem],
    }));
    setPlanQuery('');
  };

  const filteredCompanies = useMemo(() => {
    const query = companyQuery.trim().toLowerCase();
    if (!query || selectedCompany) return [];
    return companies
      .filter(company => {
        const name = getCompanyName(company).toLowerCase();
        const email = String(company.email || company.companyEmail || '').toLowerCase();
        const alternate = String(company.alternateCompanyName || '').toLowerCase();
        return name.includes(query) || email.includes(query) || alternate.includes(query);
      })
      .slice(0, 8);
  }, [companies, companyQuery, selectedCompany]);

  const filteredPlans = useMemo(() => {
    const query = planQuery.trim().toLowerCase();
    if (!query) return [];
    return plans
      .filter(plan => String(plan.name || '').toLowerCase().includes(query))
      .slice(0, 8);
  }, [plans, planQuery]);

  const validate = () => {
    const nextErrors = {};
    if (!form.companyId) nextErrors.companyId = 'Select a company.';
    if (form.paymentStatus !== 'paid' && !form.dueDate.trim()) {
      nextErrors.dueDate = 'Due date is required.';
    }
    form.items.forEach(item => {
      if (!item.amount || Number.parseFloat(item.amount) <= 0) {
        nextErrors[`item_${item.id}_amount`] = 'Enter a unit price greater than zero.';
      }
    });
    if (totals.total <= 0) nextErrors.total = 'Invoice total must be greater than zero.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async mode => {
    if (!validate()) {
      Alert.alert('Check invoice details', 'Please correct the highlighted fields before saving.');
      return;
    }
    if (!token) {
      Alert.alert('Authentication required', 'Please log in again before creating an invoice.');
      return;
    }

    setSaving(true);
    const isSending = mode === 'send';
    const payload = {
      invoiceNumber: form.invoiceNumber,
      invoiceHead: form.invoiceHead,
      invoiceDate: form.invoiceDate,
      dueDate: form.dueDate,
      status: isSending ? 'sent' : 'draft',
      currency: form.currency,
      company: form.companyId,
      companyId: form.companyId,
      paymentStatus: form.paymentStatus,
      paymentMethod: form.paymentMethod,
      paidAmount:
        form.paymentStatus === 'paid' ? totals.total : Number(form.paidAmount) || 0,
      invoiceType: form.invoiceType,
      type: form.invoiceType === INVOICE_TYPES.ONE_TIME ? 'one_time' : 'subscription',
      ...(form.invoiceType !== INVOICE_TYPES.ONE_TIME &&
        form.globalSubscription.enabled && {
          subscriptionType: form.globalSubscription.subscriptionType,
          subscriptionStartDate: form.globalSubscription.subscriptionStartDate,
          subscriptionEndDate: form.globalSubscription.subscriptionEndDate,
          autoRenew: form.globalSubscription.autoRenew,
          billingCycle: form.globalSubscription.billingCycle,
        }),
      items: form.items.map(item => ({
        itemName: item.itemName,
        description: item.description,
        amount: Number.parseFloat(item.amount),
        quantity: Number.parseInt(item.quantity, 10) || 1,
        itemType: item.itemType,
        isRecurring: item.itemType === 'recurring',
        recurringFrequency: item.recurringFrequency,
        applyTax: form.taxMode === 'specific' ? item.applyTax !== false : true,
        discount:
          !isINR && form.discountMode === 'specific'
            ? Number.parseFloat(item.discount) || 0
            : 0,
        planId: item.planId || null,
        stripePriceId: item.stripePriceId || null,
        interval: item.interval || null,
      })),
      subtotal: totals.subtotal,
      taxRate: Number.parseFloat(form.taxRate) || 0,
      taxMode: form.taxMode,
      tax: totals.tax,
      total: totals.total,
      discount: totals.discount,
      discountType: form.discountType,
      discountValue: Number.parseFloat(form.discountValue) || 0,
      discountMode: form.discountMode,
      notes: form.notes,
      termsAndConditions: form.termsAndConditions,
    };

    try {
      if (isEditing) {
        await updateAdminInvoice({ id: invoiceId, payload, token });
      } else {
        await saveAdminInvoice({ payload, token });
      }
      Alert.alert(
        isEditing ? 'Invoice updated' : isSending ? 'Invoice sent' : 'Draft saved',
        isEditing
          ? 'The invoice was updated successfully.'
          : isSending
            ? 'The invoice was created and sent.'
            : 'The invoice draft was saved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('Unable to save invoice', error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, value, onChangeText, options = {}) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          options.multiline && styles.multilineInput,
          {
            borderColor: options.error ? colors.danger : colors.inputBorder,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          },
        ]}
        value={value == null ? '' : String(value)}
        onChangeText={onChangeText}
        placeholder={options.placeholder || ''}
        placeholderTextColor={colors.inputPlaceholder}
        keyboardType={options.keyboardType || 'default'}
        multiline={options.multiline}
        editable={options.editable !== false}
        autoCapitalize={options.autoCapitalize || 'sentences'}
        textAlignVertical={options.multiline ? 'top' : 'center'}
        maxLength={options.maxLength}
      />
      {options.error ? <Text style={[styles.errorText, { color: colors.danger }]}>{options.error}</Text> : null}
      {options.hint ? <Text style={[styles.hint, { color: colors.subtle }]}>{options.hint}</Text> : null}
    </View>
  );

  const renderChoices = (label, choices, selected, onSelect, columns = 3) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <View style={styles.choiceRow}>
        {choices.map(choice => {
          const value = typeof choice === 'string' ? choice : choice.value;
          const title = typeof choice === 'string' ? choice : choice.label;
          const active = selected === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.choice,
                columns === 2 && styles.choiceHalf,
                {
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                },
              ]}
              onPress={() => onSelect(value)}
              activeOpacity={0.75}>
              <Text style={[styles.choiceText, { color: active ? colors.accent : colors.muted }]}>
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSection = (title, icon, children, subtitle) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.accent }]}>
          <Ionicons name={icon} size={17} color={colors.buttonText} />
        </View>
        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.topBar, {
        paddingTop: Math.max(insets.top, 8),
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.sheet }]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topTitleWrap}>
          <Text style={[styles.topTitle, { color: colors.text }]}>{isEditing ? 'Edit Invoice' : 'Create Invoice'}</Text>
          <Text style={[styles.topSubtitle, { color: colors.muted }]} numberOfLines={1}>{form.invoiceNumber}</Text>
        </View>
        <View style={[styles.statusBadge, styles[`status_${form.paymentStatus}`], { backgroundColor: statusColors.backgroundColor }]}>
          <Text style={[styles.statusBadgeText, styles[`statusText_${form.paymentStatus}`], { color: statusColors.color }]}>
            {form.paymentStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {invoiceLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading invoice...</Text>
          </View>
        ) : <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 28 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.intro}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>{isEditing ? 'Update invoice' : 'New invoice'}</Text>
            <Text style={[styles.pageDescription, { color: colors.muted }]}>
              {isEditing
                ? 'Update the invoice details below.'
                : 'Choose the invoice type and add billing details.'}
            </Text>
          </View>

          {renderSection('Invoice type', 'document-text-outline', (
            <View style={styles.typeCards}>
              {[
                { value: INVOICE_TYPES.ONE_TIME, title: 'One-Time', subtitle: 'Single charge', icon: 'document-text-outline' },
                { value: INVOICE_TYPES.SUBSCRIPTION, title: 'Subscription', subtitle: 'Recurring billing', icon: 'repeat-outline' },
                { value: INVOICE_TYPES.HYBRID, title: 'Hybrid', subtitle: 'One-time + recurring', icon: 'layers-outline' },
              ].map(option => {
                const active = form.invoiceType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.typeCard, {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? colors.accentSoft : colors.surface,
                    }]}
                    onPress={() => changeInvoiceType(option.value)}
                    activeOpacity={0.75}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={active ? colors.accent : colors.muted}
                    />
                    <Text style={[styles.typeTitle, { color: active ? colors.accent : colors.text }]}>{option.title}</Text>
                    <Text style={[styles.typeSubtitle, { color: colors.muted }]}>{option.subtitle}</Text>
                    {active ? <Ionicons name="checkmark-circle" size={17} color={colors.accent} style={styles.typeCheck} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {renderSection('Invoice details', 'calendar-outline', (
            <>
              {renderField('Invoice head', form.invoiceHead, value => updateForm('invoiceHead', value), {
                placeholder: 'Enter invoice head',
              })}
              <View style={styles.twoColumns}>
                {renderField('Invoice date', form.invoiceDate, value => updateForm('invoiceDate', value), {
                  placeholder: 'YYYY-MM-DD',
                  hint: 'Use YYYY-MM-DD format',
                })}
                {renderField('Due date', form.dueDate, value => updateForm('dueDate', value), {
                  placeholder: 'YYYY-MM-DD',
                  editable: form.paymentStatus !== 'paid',
                  error: errors.dueDate,
                  hint: form.paymentStatus === 'paid' ? 'Not required for paid invoices' : undefined,
                })}
              </View>
              {renderChoices('Currency', CURRENCIES, form.currency, value => updateForm('currency', value))}
              {renderChoices('Payment status', PAYMENT_STATUSES, form.paymentStatus, value => updateForm('paymentStatus', value))}
            </>
          ))}

          {(isSubscription || isHybrid) &&
            renderSection('Subscription configuration', 'repeat-outline', (
              <>
                {renderChoices(
                  'Billing cycle',
                  BILLING_CYCLES.map(cycle => ({ value: cycle.value, label: cycle.label })),
                  form.globalSubscription.billingCycle,
                  value => updateSubscription('billingCycle', value),
                  2,
                )}
                {renderChoices(
                  'Duration',
                  BILLING_CYCLES.map(cycle => ({ value: cycle.value, label: `${cycle.label} (${cycle.durationDays}d)` })),
                  form.globalSubscription.subscriptionType,
                  value => updateSubscription('subscriptionType', value),
                  2,
                )}
                <View style={styles.twoColumns}>
                  {renderField(
                    'Start date',
                    form.globalSubscription.subscriptionStartDate,
                    value => updateSubscription('subscriptionStartDate', value),
                    { placeholder: 'YYYY-MM-DD' },
                  )}
                  {renderField(
                    'End date (auto)',
                    form.globalSubscription.subscriptionEndDate,
                    () => {},
                    { editable: false, placeholder: 'Calculated from duration' },
                  )}
                </View>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => updateSubscription('autoRenew', !form.globalSubscription.autoRenew)}>
                  <View style={[styles.checkbox, {
                    borderColor: form.globalSubscription.autoRenew ? colors.accent : colors.inputBorder,
                    backgroundColor: form.globalSubscription.autoRenew ? colors.accent : colors.inputBackground,
                  }]}>
                    {form.globalSubscription.autoRenew ? <Ionicons name="checkmark" size={15} color={colors.buttonText} /> : null}
                  </View>
                  <View style={styles.toggleCopy}>
                    <Text style={[styles.toggleTitle, { color: colors.text }]}>Auto-renewal</Text>
                    <Text style={[styles.hint, { color: colors.subtle }]}>Automatically renew after expiry</Text>
                  </View>
                </TouchableOpacity>
              </>
            ))}

          {renderSection('Bill to', 'business-outline', (
            <>
              {selectedCompany ? (
                <View style={[styles.selectedCompany, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}>
                  <View style={[styles.companyIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="business" size={19} color={colors.accent} />
                  </View>
                  <View style={styles.companyInfo}>
                    <Text style={[styles.companyName, { color: colors.text }]}>{getCompanyName(selectedCompany)}</Text>
                    <Text style={[styles.companyDetail, { color: colors.muted }]} numberOfLines={1}>
                      {selectedCompany.email || selectedCompany.companyEmail || selectedCompany.countryOfIncorporation || ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeButton}
                    onPress={() => {
                      updateForm('companyId', '');
                      setCompanyQuery('');
                    }}>
                    <Text style={[styles.changeButtonText, { color: colors.danger }]}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {renderField(
                    'Search company',
                    companyQuery,
                    value => {
                      setCompanyQuery(value);
                      if (form.companyId) updateForm('companyId', '');
                    },
                    {
                      placeholder: 'Company name or email',
                      error: errors.companyId,
                    },
                  )}
                  {companyLoading ? (
                    <View style={styles.inlineLoading}>
                      <ActivityIndicator size="small" color={colors.accent} />
                      <Text style={[styles.hint, { color: colors.subtle }]}>Loading companies...</Text>
                    </View>
                  ) : companyError ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{companyError}</Text>
                  ) : filteredCompanies.length > 0 ? (
                    <View style={[styles.resultList, { borderColor: colors.border }]}>
                      {filteredCompanies.map(company => (
                        <TouchableOpacity
                          key={String(company._id || company.id)}
                          style={[styles.resultRow, { borderBottomColor: colors.border }]}
                          onPress={() => {
                            updateForm('companyId', company._id || company.id);
                            setCompanyQuery(getCompanyName(company));
                          }}>
                          <View style={[styles.resultIcon, { backgroundColor: colors.accentSoft }]}>
                            <Ionicons name="business-outline" size={17} color={colors.accent} />
                          </View>
                          <View style={styles.resultInfo}>
                            <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{getCompanyName(company)}</Text>
                            <Text style={[styles.resultSubtitle, { color: colors.muted }]} numberOfLines={1}>
                              {company.email || company.companyEmail || company.alternateCompanyName || ''}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={17} color={colors.subtle} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : companyQuery.trim() ? (
                    <Text style={[styles.hint, { color: colors.subtle }]}>No companies match your search.</Text>
                  ) : null}
                  {errors.companyId ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.companyId}</Text> : null}
                  {companyError ? (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => {
                        setCompanyLoading(true);
                        setCompanyError('');
                        fetchInvoiceCompanies(token)
                          .then(setCompanies)
                          .catch(error => setCompanyError(error.message))
                          .finally(() => setCompanyLoading(false));
                      }}>
                      <Text style={[styles.retryText, { color: colors.accent }]}>Retry loading companies</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </>
          ))}

          {renderSection('Line items', 'list-outline', (
            <>
              {(isSubscription || isHybrid) && (
                <View style={styles.planSearch}>
                  <Text style={[styles.label, { color: colors.muted }]}>Add a plan</Text>
                  {renderField('Search plans', planQuery, setPlanQuery, {
                    placeholder: 'Search active plans',
                  })}
                  {planLoading ? (
                    <View style={styles.inlineLoading}>
                      <ActivityIndicator size="small" color={colors.accent} />
                      <Text style={[styles.hint, { color: colors.subtle }]}>Loading plans...</Text>
                    </View>
                  ) : planError ? (
                    <Text style={[styles.errorText, { color: colors.danger }]}>{planError}</Text>
                  ) : filteredPlans.length > 0 ? (
                    <View style={[styles.resultList, { borderColor: colors.border }]}>
                      {filteredPlans.map(plan => (
                        <TouchableOpacity
                          key={String(plan._id)}
                          style={[styles.resultRow, { borderBottomColor: colors.border }]}
                          onPress={() => selectPlan(plan)}>
                          <View style={[styles.resultIcon, { backgroundColor: colors.accentSoft }]}>
                            <Ionicons name="cube-outline" size={17} color={colors.accent} />
                          </View>
                          <View style={styles.resultInfo}>
                            <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{plan.name}</Text>
                            <Text style={[styles.resultSubtitle, { color: colors.muted }]} numberOfLines={1}>
                              {plan.description || 'Recurring plan'}
                            </Text>
                          </View>
                          <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : planQuery.trim() ? (
                    <Text style={[styles.hint, { color: colors.subtle }]}>No plans match your search.</Text>
                  ) : null}
                  {planError ? (
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={() => {
                        setPlanLoading(true);
                        setPlanError('');
                        fetchInvoicePlans(token)
                          .then(setPlans)
                          .catch(error => setPlanError(error.message))
                          .finally(() => setPlanLoading(false));
                      }}>
                      <Text style={[styles.retryText, { color: colors.accent }]}>Retry loading plans</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
              {form.items.map((item, index) => {
                const lineAmount =
                  (Number.parseFloat(item.amount) || 0) *
                    (Number.parseFloat(item.quantity) || 1) -
                  (!isINR && form.discountMode === 'specific'
                    ? Math.min(
                        Number.parseFloat(item.amount) * (Number.parseFloat(item.quantity) || 1) || 0,
                        Number.parseFloat(item.discount) || 0,
                      )
                    : 0);
                return (
                  <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.itemHeading}>
                      <View style={[styles.itemNumber, { backgroundColor: colors.border }]}>
                        <Text style={[styles.itemNumberText, { color: colors.muted }]}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.itemTitle, { color: colors.text }]}>
                        {item.planId ? 'Plan item' : `Item ${index + 1}`}
                      </Text>
                      {form.items.length > 1 ? (
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={`Remove item ${index + 1}`}
                          style={[styles.removeButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                          onPress={() => removeItem(item.id)}>
                          <Ionicons name="trash-outline" size={17} color={colors.danger} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {renderField(
                      item.planId ? 'Plan' : 'Item name',
                      item.itemName,
                      value => updateItem(item.id, 'itemName', value),
                      { placeholder: 'Enter item name', editable: !item.planId },
                    )}
                    {renderField(
                      'Description',
                      item.description,
                      value => updateItem(item.id, 'description', value),
                      { placeholder: 'Service or product description', multiline: true },
                    )}
                    {isHybrid ? (
                      <>
                        {renderChoices(
                          'Item type',
                          [
                            { value: 'one_time', label: 'One-Time' },
                            { value: 'recurring', label: 'Recurring' },
                          ],
                          item.itemType,
                          value => updateItem(item.id, 'itemType', value),
                          2,
                        )}
                        {item.itemType === 'recurring'
                          ? renderChoices(
                              'Recurring frequency',
                              BILLING_CYCLES.map(cycle => ({ value: cycle.value, label: cycle.label })),
                              item.recurringFrequency,
                              value => updateItem(item.id, 'recurringFrequency', value),
                              2,
                            )
                          : null}
                      </>
                    ) : null}
                    <View style={styles.twoColumns}>
                      {renderField(
                        'Quantity',
                        item.quantity,
                        value => updateItem(item.id, 'quantity', value),
                        { keyboardType: 'numeric' },
                      )}
                      {renderField(
                        `Unit price (${symbol})`,
                        item.amount,
                        value => updateItem(item.id, 'amount', value),
                        {
                          keyboardType: 'decimal-pad',
                          editable: !item.planId,
                          error: errors[`item_${item.id}_amount`],
                          placeholder: '0.00',
                        },
                      )}
                    </View>
                    {!isINR && form.discountMode === 'specific'
                      ? renderField(
                          `Item discount (${symbol})`,
                          item.discount,
                          value => updateItem(item.id, 'discount', value),
                          { keyboardType: 'decimal-pad', placeholder: '0.00' },
                        )
                      : null}
                    {isINR && form.taxMode === 'specific' ? (
                      <TouchableOpacity
                        style={styles.toggleRow}
                        onPress={() => updateItem(item.id, 'applyTax', item.applyTax === false)}>
                        <View style={[styles.checkbox, {
                          borderColor: item.applyTax !== false ? colors.accent : colors.inputBorder,
                          backgroundColor: item.applyTax !== false ? colors.accent : colors.inputBackground,
                        }]}>
                          {item.applyTax !== false ? <Ionicons name="checkmark" size={15} color={colors.buttonText} /> : null}
                        </View>
                        <Text style={[styles.toggleTitle, { color: colors.text }]}>Apply GST to this item</Text>
                      </TouchableOpacity>
                    ) : null}
                    <View style={[styles.lineTotal, { borderTopColor: colors.border }]}>
                      <Text style={[styles.lineTotalLabel, { color: colors.muted }]}>
                        Line total{item.itemType === 'recurring' ? ` / ${item.recurringFrequency.replace('_', ' ')}` : ''}
                      </Text>
                      <Text style={[styles.lineTotalValue, { color: colors.accent }]}>
                        {symbol}{formatAmount(Math.max(0, lineAmount), form.currency)}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {!isSubscription ? (
                <TouchableOpacity style={[styles.addButton, { borderColor: colors.inputBorder }]} onPress={addItem}>
                  <Ionicons name="add" size={19} color={colors.accent} />
                  <Text style={[styles.addButtonText, { color: colors.accent }]}>Add item</Text>
                </TouchableOpacity>
              ) : null}
              {errors.total ? <Text style={[styles.errorText, { color: colors.danger }]}>{errors.total}</Text> : null}
            </>
          ))}

          {renderSection('Payment & totals', 'card-outline', (
            <>
              {renderChoices(
                'Payment method',
                [{ value: '', label: 'Not specified' }, ...PAYMENT_METHODS],
                form.paymentMethod,
                value => updateForm('paymentMethod', value),
                2,
              )}
              {form.paymentStatus === 'partial'
                ? renderField('Amount paid', form.paidAmount, value => updateForm('paidAmount', value), {
                    keyboardType: 'decimal-pad',
                    placeholder: '0.00',
                  })
                : null}

              {(isINR || form.discountMode === 'all') ? (
                <View style={styles.twoColumns}>
                  {renderField(
                    'Discount value',
                    form.discountValue,
                    value => updateForm('discountValue', value),
                    {
                      keyboardType: 'decimal-pad',
                      placeholder: '0',
                      hint: form.discountType === 'percentage' ? 'Percent (0–100)' : symbol,
                    },
                  )}
                  {renderChoices(
                    'Discount type',
                    [
                      { value: 'fixed', label: 'Fixed' },
                      { value: 'percentage', label: 'Percent' },
                    ],
                    form.discountType,
                    value => updateForm('discountType', value),
                    2,
                  )}
                </View>
              ) : null}

              {!isINR
                ? renderChoices(
                    'Discount applied on',
                    [
                      { value: 'all', label: 'All items' },
                      { value: 'specific', label: 'Per item' },
                    ],
                    form.discountMode,
                    value => updateForm('discountMode', value),
                    2,
                  )
                : null}

              {isINR ? (
                <>
                  {renderField('GST rate (%)', form.taxRate, value => updateForm('taxRate', value), {
                    keyboardType: 'decimal-pad',
                    placeholder: '0',
                  })}
                  {renderChoices(
                    'GST applied on',
                    [
                      { value: 'all', label: 'All items' },
                      { value: 'specific', label: 'Selected items' },
                    ],
                    form.taxMode,
                    value => updateForm('taxMode', value),
                    2,
                  )}
                </>
              ) : null}

              <View style={[styles.summaryCard, { backgroundColor: colors.cardElevated }]}>
                <Text style={[styles.summaryTitle, { color: colors.muted }]}>Amount summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>Subtotal</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>{symbol}{formatAmount(totals.subtotal, form.currency)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>− {symbol}{formatAmount(totals.discount, form.currency)}</Text>
                </View>
                {isINR ? (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.muted }]}>GST ({Number(form.taxRate) || 0}%)</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{symbol}{formatAmount(totals.tax, form.currency)}</Text>
                  </View>
                ) : null}
                <View style={[styles.summaryRow, styles.grandTotalRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.grandTotalValue, { color: colors.text }]}>{symbol}{formatAmount(totals.total, form.currency)}</Text>
                </View>
                {form.paymentStatus === 'partial' ? (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.muted }]}>Balance due</Text>
                    <Text style={[styles.balanceValue, { color: colors.danger }]}>
                      {symbol}{formatAmount(Math.max(0, totals.total - (Number(form.paidAmount) || 0)), form.currency)}
                    </Text>
                  </View>
                ) : null}
                {form.paymentStatus === 'paid' ? (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.muted }]}>Balance due</Text>
                    <Text style={[styles.balancePaid, { color: colors.accent }]}>{symbol}0.00</Text>
                  </View>
                ) : null}
              </View>
            </>
          ))}

          {renderSection('Notes & terms', 'document-text-outline', (
            <>
              {renderField('Notes', form.notes, value => updateForm('notes', value), {
                placeholder: 'Internal notes or additional information',
                multiline: true,
              })}
              {renderField(
                'Terms & conditions',
                form.termsAndConditions,
                value => updateForm('termsAndConditions', value),
                { placeholder: 'Payment terms, cancellation policy', multiline: true },
              )}
            </>
          ))}

          <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.muted }]}>INVOICE PREVIEW</Text>
            <Text style={[styles.previewNumber, { color: colors.text }]}>{form.invoiceNumber}</Text>
            <Text style={[styles.previewDetails, { color: colors.muted }]}>
              {form.invoiceType === INVOICE_TYPES.HYBRID
                ? 'Hybrid'
                : isSubscription
                  ? 'Subscription'
                  : 'One-Time'}{' '}
              · {form.items.length} item{form.items.length === 1 ? '' : 's'} · Due {form.dueDate || '—'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.sendButton, (saving || totals.total <= 0) && styles.buttonDisabled, { backgroundColor: colors.buttonBackground }]}
              onPress={() => save('send')}
              disabled={saving || totals.total <= 0}
              activeOpacity={0.8}>
              {saving ? <ActivityIndicator color={colors.buttonText} /> : <Ionicons name="paper-plane-outline" size={18} color={colors.buttonText} />}
              <Text style={[styles.sendButtonText, { color: colors.buttonText }]}>
                {saving
                  ? 'Saving...'
                  : `${isEditing ? 'Update and send' : 'Send'} ${isHybrid ? 'Hybrid ' : isSubscription ? 'Subscription ' : ''}Invoice`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.draftButton, (saving || !form.companyId) && styles.buttonDisabled, { backgroundColor: colors.sheet }]}
              onPress={() => save('draft')}
              disabled={saving || !form.companyId}
              activeOpacity={0.8}>
              <Ionicons name="save-outline" size={18} color={colors.text} />
              <Text style={[styles.draftButtonText, { color: colors.text }]}>
                {isEditing ? 'Update draft' : 'Save as draft'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}>
              <Text style={[styles.cancelButtonText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>}
      </KeyboardAvoidingView>
    </View>
  );
};

export default AdminCreateInvoiceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: font.sm, marginTop: 10 },
  topBar: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topTitleWrap: {
    flex: 1,
  },
  topTitle: {
    fontSize: font.lg,
    fontWeight: '700',
  },
  topSubtitle: {
    fontSize: font.xs,
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  status_unpaid: {},
  status_partial: {},
  status_paid: {},
  statusBadgeText: {
    fontSize: font.caption,
    fontWeight: '800',
  },
  statusText_unpaid: {},
  statusText_partial: {},
  statusText_paid: {},
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  intro: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: font.display,
    fontWeight: '800',
  },
  pageDescription: {
    fontSize: font.sm,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionHeading: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: font.bodySmall,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: font.xs,
    marginTop: 2,
  },
  typeCards: {
    flexDirection: 'row',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    minHeight: 112,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  typeTitle: {
    fontWeight: '700',
    fontSize: font.small,
    marginTop: 8,
  },
  typeSubtitle: {
    fontSize: font.caption,
    marginTop: 3,
  },
  typeCheck: {
    position: 'absolute',
    right: 7,
    top: 7,
  },
  field: {
    flex: 1,
    marginBottom: 14,
    minWidth: 0,
  },
  label: {
    fontSize: font.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: font.bodySmall,
  },
  multilineInput: {
    minHeight: 84,
    paddingTop: 11,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    minHeight: 36,
    minWidth: 58,
    flexGrow: 1,
    flexBasis: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  choiceHalf: {
    flexBasis: '45%',
  },
  choiceText: {
    fontSize: font.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  hint: {
    fontSize: font.xs,
    marginTop: 5,
  },
  errorText: {
    fontSize: font.xs,
    marginTop: 5,
  },
  selectedCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  companyIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: font.sm,
    fontWeight: '700',
  },
  companyDetail: {
    fontSize: font.xs,
    marginTop: 3,
  },
  changeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  changeButtonText: {
    fontSize: font.xs,
    fontWeight: '700',
  },
  resultList: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 8,
  },
  resultRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: font.small,
    fontWeight: '700',
  },
  resultSubtitle: {
    fontSize: font.caption,
    marginTop: 3,
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  retryText: {
    fontSize: font.small,
    fontWeight: '700',
  },
  planSearch: {
    marginBottom: 8,
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
  },
  itemHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  itemNumberText: {
    fontSize: font.xs,
    fontWeight: '800',
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: font.sm,
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  lineTotalLabel: {
    fontSize: font.xs,
    fontWeight: '600',
  },
  lineTotalValue: {
    fontSize: font.sm,
    fontWeight: '800',
  },
  addButton: {
    flexDirection: 'row',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginTop: 2,
    gap: 5,
  },
  addButtonText: {
    fontSize: font.sm,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: font.small,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 13,
    padding: 15,
    marginTop: 2,
  },
  summaryTitle: {
    fontSize: font.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: font.small,
  },
  summaryValue: {
    fontSize: font.small,
    fontWeight: '600',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    marginTop: 5,
    paddingTop: 11,
  },
  grandTotalLabel: {
    fontSize: font.bodySmall,
    fontWeight: '800',
  },
  grandTotalValue: {
    fontSize: font.xl,
    fontWeight: '800',
  },
  balanceValue: {
    fontSize: font.small,
    fontWeight: '700',
  },
  balancePaid: {
    fontSize: font.small,
    fontWeight: '700',
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  previewLabel: {
    fontSize: font.caption,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewNumber: {
    fontSize: font.md,
    fontWeight: '800',
    marginTop: 7,
  },
  previewDetails: {
    fontSize: font.small,
    marginTop: 5,
  },
  actions: {
    gap: 9,
  },
  sendButton: {
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    fontSize: font.bodySmall,
    fontWeight: '800',
  },
  draftButton: {
    minHeight: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  draftButtonText: {
    fontSize: font.sm,
    fontWeight: '700',
  },
  cancelButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: font.sm,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
