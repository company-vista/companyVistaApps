const RAW_CATALOG = [
    {
        category: "Tax & Accounting Services",
        services: [
            {
                name: "Bookkeeping & Accounting",
                slug: "bookkeeping-accounting",
                price: 450,
                unit: "/mo",
                description: "Monthly bookkeeping and financial statement preparation so your books stay accurate, tax-ready, and audit-proof year-round.",
            },
            {
                name: "Sales Tax Registration",
                slug: "sales-tax-registration",
                price: 199,
                description: "We register your business for a state sales tax permit so you can legally collect and remit sales tax from day one.",
            },
            {
                name: "Sales Tax Filing",
                slug: "sales-tax-filing",
                price: 199,
                unit: "/filing",
                description: "Timely, accurate filing of your periodic sales tax returns with the state — done for you every filing period.",
            },
            {
                name: "Payroll Compliance",
                slug: "payroll-compliance",
                price: 349,
                unit: "/mo",
                description: "Monthly payroll processing and compliance management, including tax withholdings and filings, so your team gets paid correctly and on time.",
            },
            {
                name: "Personal Tax Filing (1040)",
                slug: "personal-tax-filing-1040",
                price: 349,
                description: "Preparation and filing of your individual U.S. federal income tax return (Form 1040), including non-resident owner filing requirements.",
            },
            {
                name: "CPA / Tax Consultation",
                slug: "cpa-tax-consultation",
                price: 149,
                unit: "/hour",
                description: "One-on-one time with a licensed CPA to get tax planning advice specific to your business situation.",
            },
            {
                name: "IRS Notice Response Assistance",
                slug: "irs-notice-response-assistance",
                price: 399,
                description: "Received a letter from the IRS? We review it, draft the response, and handle the correspondence on your behalf.",
            },
        ],
    },
    {
        category: "Business Compliance & Regis.",
        services: [
            {
                name: "DBA / Trade Name Registration",
                slug: "dba-trade-name-registration",
                price: 249,
                note: "+State Fee",
                description: "Register a 'Doing Business As' trade name so you can legally operate and brand your business under a name other than its registered legal name.",
            },
            {
                name: "Reseller / Certificate Registration",
                slug: "reseller-certificate-registration",
                price: 149,
                description: "Obtain your state reseller/resale certificate so you can purchase inventory tax-exempt for resale.",
            },
            {
                name: "DUNS Registration Assistance",
                slug: "duns-registration-assistance",
                price: 349,
                description: "We handle your Dun & Bradstreet DUNS number application — often required for business credit, contracts, and marketplace approvals.",
            },
            {
                name: "E-Verify Enrollment",
                slug: "e-verify-enrollment",
                price: 699,
                description: "Enroll your company in E-Verify to confirm employee work eligibility, a requirement for certain contracts and states.",
            },
            {
                name: "Certificate of Good Standing",
                slug: "certificate-of-good-standing",
                price: 129,
                description: "An official state-issued certificate confirming your company is active, compliant, and in good standing — often needed for banking, financing, or foreign qualification.",
            },
        ],
    },
    {
        category: "Banking & Owner Services",
        services: [
            {
                name: "US Bank Account Assistance",
                slug: "us-bank-account-assistance",
                price: 299,
                description: "Guided support opening a U.S. business bank account, including documentation prep and coordination with the bank.",
            },
            {
                name: "Stripe Setup Assistance",
                slug: "stripe-setup-assistance",
                price: 299,
                description: "We help you set up and verify your Stripe account so you can start accepting card payments from customers.",
            },
            {
                name: "PayPal Business Setup",
                slug: "paypal-business-setup",
                price: 199,
                description: "Assistance setting up and verifying a PayPal Business account for your company.",
            },
            {
                name: "EIN Application",
                slug: "ein-application",
                price: 349,
                description: "We apply for your Employer Identification Number (EIN) with the IRS — required to open a bank account, hire, and file taxes.",
            },
            {
                name: "EIN Amendment / IRS Update",
                slug: "ein-amendment-irs-update",
                price: 249,
                description: "Update your EIN record with the IRS — business name, address, or responsible-party changes — done correctly and on file.",
            },
        ],
    },
    {
        category: "Company Updates & Documents",
        services: [
            {
                name: "Company Amendment Filing",
                slug: "company-amendment-filing",
                price: 349,
                note: "+State Fee",
                description: "File an official amendment to your Articles of Organization/Incorporation with the state to update company details.",
            },
            {
                name: "Ownership Transfer Filing",
                slug: "ownership-transfer-filing",
                price: 699,
                description: "Legally document and file a change in company ownership or membership interest.",
            },
            {
                name: "Company Dissolution / Closure",
                slug: "company-dissolution-closure",
                price: 599,
                note: "+State Fee",
                description: "Properly close and dissolve your company with the state and IRS, so you're not stuck with ongoing filings or fees for a business you no longer operate.",
            },
            {
                name: "Operating Agreement Preparation",
                slug: "operating-agreement-preparation",
                price: 299,
                description: "A custom LLC Operating Agreement (or Corporate Bylaws) drafted for your business, outlining ownership, roles, and operating rules.",
            },
            {
                name: "Corporate Document Drafting",
                slug: "corporate-document-drafting",
                price: 399,
                description: "Custom drafting of corporate resolutions, meeting minutes, or other legal business documents as needed.",
            },
            {
                name: "Apostille & Notarization Assistance",
                slug: "apostille-notarization-assistance",
                price: 349,
                description: "We coordinate notarization and apostille certification of your business documents for international use.",
            },
        ],
    },
];
export function getCategoryServices(categoryName) {
    const category = RAW_CATALOG.find((c) => c.category === categoryName);
    return category ? category.services : [];
}
export function getServiceCategories() {
    return RAW_CATALOG.map((c) => c.category);
}
export function formatPrice(service) {
    const base = `$${service.price}${service.unit ?? ''}`;
    return service.note ? `${base} ${service.note}` : base;
}
export function findServiceBySlugOrName(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase();
    for (const category of RAW_CATALOG) {
        const match = category.services.find((s) => s.slug === key || s.name.toLowerCase() === key);
        if (match) return match;
    }
    return null;
}
