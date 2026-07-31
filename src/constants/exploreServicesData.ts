export interface Service {
  name: string;
  price: number;
  unit?: string;
  description: string;
  note?: string;
}

export interface ServiceCategory {
  category: string;
  services: Service[];
}

const RAW_CATALOG: ServiceCategory[] = [
  {
    category: "Tax & Accounting Services",
    services: [
      {
        name: "Bookkeeping & Accounting",
        price: 450,
        unit: "/mo",
        description:
          "Monthly bookkeeping and financial statement preparation so your books stay accurate, tax-ready, and audit-proof year-round.",
      },
      {
        name: "Sales Tax Registration",
        price: 199,
        description:
          "We register your business for a state sales tax permit so you can legally collect and remit sales tax from day one.",
      },
      {
        name: "Sales Tax Filing",
        price: 199,
        unit: "/filing",
        description:
          "Timely, accurate filing of your periodic sales tax returns with the state — done for you every filing period.",
      },
      {
        name: "Payroll Compliance",
        price: 349,
        unit: "/mo",
        description:
          "Monthly payroll processing and compliance management, including tax withholdings and filings, so your team gets paid correctly and on time.",
      },
      {
        name: "Personal Tax Filing (1040)",
        price: 349,
        description:
          "Preparation and filing of your individual U.S. federal income tax return (Form 1040), including non-resident owner filing requirements.",
      },
      {
        name: "CPA / Tax Consultation",
        price: 149,
        unit: "/hour",
        description:
          "One-on-one time with a licensed CPA to get tax planning advice specific to your business situation.",
      },
      {
        name: "IRS Notice Response Assistance",
        price: 399,
        description:
          "Received a letter from the IRS? We review it, draft the response, and handle the correspondence on your behalf.",
      },
    ],
  },
  {
    category: "Business Compliance & Registrations",
    services: [
      {
        name: "DBA / Trade Name Registration",
        price: 249,
        note: "+State Fee",
        description:
          "Register a 'Doing Business As' trade name so you can legally operate and brand your business under a name other than its registered legal name.",
      },
      {
        name: "Reseller / Certificate Registration",
        price: 149,
        description:
          "Obtain your state reseller/resale certificate so you can purchase inventory tax-exempt for resale.",
      },
      {
        name: "DUNS Registration Assistance",
        price: 349,
        description:
          "We handle your Dun & Bradstreet DUNS number application — often required for business credit, contracts, and marketplace approvals.",
      },
      {
        name: "E-Verify Enrollment",
        price: 699,
        description:
          "Enroll your company in E-Verify to confirm employee work eligibility, a requirement for certain contracts and states.",
      },
      {
        name: "Certificate of Good Standing",
        price: 129,
        description:
          "An official state-issued certificate confirming your company is active, compliant, and in good standing — often needed for banking, financing, or foreign qualification.",
      },
    ],
  },
  {
    category: "Banking & Owner Services",
    services: [
      {
        name: "US Bank Account Assistance",
        price: 299,
        description:
          "Guided support opening a U.S. business bank account, including documentation prep and coordination with the bank.",
      },
      {
        name: "Stripe Setup Assistance",
        price: 299,
        description:
          "We help you set up and verify your Stripe account so you can start accepting card payments from customers.",
      },
      {
        name: "PayPal Business Setup",
        price: 199,
        description:
          "Assistance setting up and verifying a PayPal Business account for your company.",
      },
      {
        name: "EIN Application",
        price: 349,
        description:
          "We apply for your Employer Identification Number (EIN) with the IRS — required to open a bank account, hire, and file taxes.",
      },
      {
        name: "EIN Amendment / IRS Update",
        price: 249,
        description:
          "Update your EIN record with the IRS — business name, address, or responsible-party changes — done correctly and on file.",
      },
    ],
  },
  {
    category: "Corporate Changes & Legal Documentation",
    services: [
      {
        name: "Company Amendment Filing",
        price: 349,
        note: "+State Fee",
        description:
          "File an official amendment to your Articles of Organization/Incorporation with the state to update company details.",
      },
      {
        name: "Ownership Transfer Filing",
        price: 699,
        description:
          "Legally document and file a change in company ownership or membership interest.",
      },
      {
        name: "Company Dissolution / Closure",
        price: 599,
        note: "+State Fee",
        description:
          "Properly close and dissolve your company with the state and IRS, so you're not stuck with ongoing filings or fees for a business you no longer operate.",
      },
      {
        name: "Operating Agreement Preparation",
        price: 299,
        description:
          "A custom LLC Operating Agreement (or Corporate Bylaws) drafted for your business, outlining ownership, roles, and operating rules.",
      },
      {
        name: "Corporate Document Drafting",
        price: 399,
        description:
          "Custom drafting of corporate resolutions, meeting minutes, or other legal business documents as needed.",
      },
      {
        name: "Apostille & Notarization Assistance",
        price: 349,
        description:
          "We coordinate notarization and apostille certification of your business documents for international use.",
      },
    ],
  },
];

export function getCategoryServices(categoryName: string): Service[] {
  const category = RAW_CATALOG.find((c) => c.category === categoryName);
  return category ? category.services : [];
}

export function getServiceCategories(): string[] {
  return RAW_CATALOG.map((c) => c.category);
}

export function formatPrice(service: Service): string {
  const base = `$${service.price}${service.unit ?? ''}`;
  return service.note ? `${base} ${service.note}` : base;
}