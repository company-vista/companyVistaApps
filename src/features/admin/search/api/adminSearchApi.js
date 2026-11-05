import axios from 'axios';
import { API_BASE_URL } from '../../../../config/api';
import { fetchAdminClients } from '../../clients/api/adminClientsApi';
import { fetchCompanies } from '../../company/api/companyApi';
import { fetchAdminExpenses } from '../../expenses/api/expensesApi';
import { fetchAdminInvoices } from '../../invoices/api/invoicesApi';
import { fetchAdminConversations } from '../../messages/api/messagesApi';
import { fetchAdminTransactions } from '../../transactions/api/transactionsApi';
import { fetchCompanyVistaLeads } from '../../companyVistaLeads/api/companyVistaLeadsApi';

const LIMIT = 12;

const SEARCH_SOURCES = [
  { key: 'clients', label: 'Clients' },
  { key: 'companies', label: 'Companies' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'leads', label: 'Vista Leads' },
  { key: 'documents', label: 'Documents' },
  { key: 'messages', label: 'Messages' },
];

const searchableText = (values, query) => {
  const normalizedQuery = query.toLowerCase();
  return values.some(value =>
    String(value ?? '')
      .toLowerCase()
      .includes(normalizedQuery),
  );
};

const matchesExpense = (item, query) =>
  searchableText(
    [
      item.title,
      item.name,
      item.description,
      item.notes,
      item.vendor,
      item.payee,
      item.expenseHead?.name,
      item.expenseHead?.title,
      item.amount,
    ],
    query,
  );

const getConversationPreview = item => {
  const messages = Array.isArray(item.messages) ? item.messages : [];
  const lastMessage = messages[messages.length - 1];
  return lastMessage?.text || lastMessage?.message || item.lastMessage || '';
};

const matchesDocument = (item, query) =>
  searchableText(
    [
      item.originalFileName,
      item.fileName,
      item.title,
      item.company?.companyName,
      item.companyName,
      item.documentType,
      item.type,
      item.category,
    ],
    query,
  );

const matchesConversation = (item, query) =>
  searchableText(
    [
      item.client?.name,
      item.client?.email,
      item.user?.name,
      item.user?.email,
      item.name,
      item.email,
      item.subject,
      getConversationPreview(item),
    ],
    query,
  );

const makeSearchTask = (key, search) => {
  switch (key) {
    case 'clients':
      return async token => {
        const result = await fetchAdminClients({
          token,
          page: 1,
          limit: LIMIT,
          search,
        });
        return result.clients;
      };
    case 'companies':
      return async token => {
        const responses = await Promise.allSettled(
          ['formed', 'prospect', 'external'].map(category =>
            fetchCompanies({ token, category, search }),
          ),
        );
        const companies = responses.flatMap(result =>
          result.status === 'fulfilled' ? result.value : [],
        );
        if (!companies.length && responses.every(result => result.status === 'rejected')) {
          throw new Error(
            responses.find(result => result.status === 'rejected')?.reason?.message ||
              'Unable to search companies.',
          );
        }
        return companies;
      };
    case 'invoices':
      return async token => {
        const result = await fetchAdminInvoices({
          token,
          filters: {
            search,
            page: 1,
            limit: LIMIT,
            sortBy: 'date',
            sortOrder: 'desc',
            status: 'all',
            paymentStatus: 'all',
            currency: 'all',
            invoiceKind: 'all',
            dateRange: 'all',
          },
        });
        return result.invoices;
      };
    case 'payments':
      return async token => {
        const result = await fetchAdminTransactions({
          token,
          filters: {
            search,
            page: 1,
            limit: LIMIT,
            sortBy: 'date',
            sortOrder: 'desc',
            status: 'all',
            type: 'all',
            paymentMethod: 'all',
            startDate: '',
            endDate: '',
          },
        });
        return result.transactions;
      };
    case 'expenses':
      return async token => {
        const expenses = await fetchAdminExpenses({ token });
        return expenses.filter(expense => matchesExpense(expense, search));
      };
    case 'leads':
      return async token => {
        const result = await fetchCompanyVistaLeads(token, {
          page: 1,
          limit: LIMIT,
          search,
        });
        return result.leads;
      };
    case 'documents':
      return async token => {
        if (!token) throw new Error('Please log in to search documents.');
        const response = await axios.get(`${API_BASE_URL}/api/documents`, {
          timeout: 20000,
          headers: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
          },
        });
        const documents =
          response.data?.data ??
          response.data?.documents ??
          response.data;
        if (!Array.isArray(documents)) {
          throw new Error('Invalid documents response from the server.');
        }
        return documents.filter(document => matchesDocument(document, search));
      };
    case 'messages':
      return async token => {
        const conversations = await fetchAdminConversations(token);
        return conversations.filter(conversation =>
          matchesConversation(conversation, search),
        );
      };
    default:
      return async () => [];
  }
};

export async function searchAdminWorkspace({ token, query, category = 'all' }) {
  const search = String(query || '').trim();
  if (search.length < 2) {
    return { results: [], errors: [] };
  }
  if (!token) {
    throw new Error('Please log in to search the admin workspace.');
  }

  const sources =
    category === 'all'
      ? SEARCH_SOURCES
      : SEARCH_SOURCES.filter(source => source.key === category);
  const settledResults = await Promise.all(
    sources.map(async source => {
      try {
        const items = await makeSearchTask(source.key, search)(token);
        return { source, items, error: '' };
      } catch (error) {
        return {
          source,
          items: [],
          error: error instanceof Error ? error.message : 'Search failed.',
        };
      }
    }),
  );

  return {
    results: settledResults.map(({ source, items }) => ({
      ...source,
      items: items.slice(0, LIMIT),
    })),
    errors: settledResults
      .filter(result => result.error)
      .map(({ source, error }) => ({ ...source, message: error })),
  };
}
