import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { ClientInvoice } from '../features/home/api/clientInvoicesApi';
import type { NotificationItem } from '../features/notifications/data/notifications';
import type { QuickAccessItemId } from '../features/home/data/quickAccessItems';
import type { AuthStackParamList } from '../features/auth/navigation/types';

export type RenewActionData = {
  id: 'address' | 'annual_filing' | 'resident' | 'federal_filing';
  title: string;
  subtitle: string;
  status: string;
  date: string;
  details: { label: string; value: string; icon?: string }[];
  companyId?: string | null;
  price?: number;
  years?: number;
  services?: Array<{
    id?: number | string | null;
    name?: string | null;
    lastDate?: string | null;
    dueDate?: string | null;
    price?: number | null;
    years?: number | null;
    isExpired?: boolean | null;
  }> | null;
};

export type MainStackParamList = {
  Home: {
    initialTab?: 'home' | 'company' | 'reports' | 'billing' | 'more';
    pendingCompanySection?: 'companyInfo' | 'shareholders' | 'menu';
    pendingHomeAction?: 'subscription' | 'addCompany' | 'manageOptions' | 'transactions';
  } | undefined;
  Profile: undefined;
  ProfileAddress: undefined;
  EditProfile: undefined;
  Notifications: { companyId?: string | null } | undefined;
  NotificationDetail: { notification: NotificationItem };
  Search: undefined;
  HelpFeedback: undefined;
  Support: undefined;
  FollowUs: undefined;
  QuickAccess: undefined;
  CompanyProfile: undefined;
  InvoiceCenter: undefined;
  BusinessReports: undefined;
  HelpDesk: undefined;
  FederalFiling: { selectedAction?: RenewActionData | null } | undefined;
  AnnualFiling: undefined;
  ComplianceHistory: { selectedAction: RenewActionData };
  RenewCompliance: { selectedAction?: RenewActionData | null } | undefined;
  AddressRenewal: { selectedAction?: RenewActionData | null } | undefined;
  InvoiceDetail: { invoice: ClientInvoice };
  Transactions: { companyId?: string | null } | undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
