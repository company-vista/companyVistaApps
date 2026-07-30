import { matchesSelectedCompany } from '../../src/features/home/screens/transactions/transactionsUtils';

describe('matchesSelectedCompany', () => {
  it('matches transactions by selected company id', () => {
    const selectedCompany = {
      id: 'company-123',
      initials: 'AB',
      name: 'Acme Corp',
      companyType: 'LLC',
      countryOfIncorporation: 'US',
      ein: '12-3456789',
      status: 'Active' as const,
      date: '2024-01-01',
      avatarColor: '#111',
      initialsColor: '#fff',
    };

    const transaction = {
      id: 'tx-1',
      title: 'Invoice payment',
      date: '2024-01-02',
      amount: '$100.00',
      status: 'Active',
      method: 'Card',
      category: 'Payment',
      details: {
        _id: 'tx-1',
        amount: 100,
        currency: 'USD',
        date: '2024-01-02',
        status: 'active',
        type: 'payment',
        description: 'Invoice payment',
        notes: '',
        company: 'company-123',
        paymentMethod: 'Card',
        referenceId: '',
        transactionId: 'tx-1',
        gateway: '',
        bankName: '',
        accountLast4: '',
        createdBy: '',
        isActive: true,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        invoice: null,
      },
      companyId: 'company-123',
    };

    expect(matchesSelectedCompany(transaction as any, selectedCompany)).toBe(true);
  });

  it('matches transactions by company name when the payload uses a nested company object', () => {
    const selectedCompany = {
      id: 'company-123',
      initials: 'AB',
      name: 'Myntra',
      companyType: 'LLC',
      countryOfIncorporation: 'US',
      ein: '12-3456789',
      status: 'Active' as const,
      date: '2024-01-01',
      avatarColor: '#111',
      initialsColor: '#fff',
    };

    const transaction = {
      id: 'tx-2',
      title: 'Invoice payment',
      date: '2024-01-02',
      amount: '$100.00',
      status: 'Active',
      method: 'Card',
      category: 'Payment',
      details: {
        _id: 'tx-2',
        amount: 100,
        currency: 'USD',
        date: '2024-01-02',
        status: 'active',
        type: 'payment',
        description: 'Invoice payment',
        notes: '',
        company: {
          _id: 'company-999',
          name: 'Myntra',
        },
        paymentMethod: 'Card',
        referenceId: '',
        transactionId: 'tx-2',
        gateway: '',
        bankName: '',
        accountLast4: '',
        createdBy: '',
        isActive: true,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        invoice: null,
      },
      companyId: 'company-999',
    };

    expect(matchesSelectedCompany(transaction as any, selectedCompany)).toBe(true);
  });

  it('does not match transactions from another company', () => {
    const selectedCompany = {
      id: 'company-123',
      initials: 'AB',
      name: 'Acme Corp',
      companyType: 'LLC',
      countryOfIncorporation: 'US',
      ein: '12-3456789',
      status: 'Active' as const,
      date: '2024-01-01',
      avatarColor: '#111',
      initialsColor: '#fff',
    };

    const transaction = {
      id: 'tx-3',
      title: 'Invoice payment',
      date: '2024-01-02',
      amount: '$100.00',
      status: 'Active',
      method: 'Card',
      category: 'Payment',
      details: {
        _id: 'tx-3',
        amount: 100,
        currency: 'USD',
        date: '2024-01-02',
        status: 'active',
        type: 'payment',
        description: 'Invoice payment',
        notes: '',
        company: 'company-999',
        paymentMethod: 'Card',
        referenceId: '',
        transactionId: 'tx-3',
        gateway: '',
        bankName: '',
        accountLast4: '',
        createdBy: '',
        isActive: true,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        invoice: null,
      },
      companyId: 'company-999',
    };

    expect(matchesSelectedCompany(transaction as any, selectedCompany)).toBe(false);
  });
});
