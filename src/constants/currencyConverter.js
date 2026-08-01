export const formatCurrency = (amount, currency) => {
    // करेंसी को हमेशा बडे अक्षरों में बदलें (उदा. 'usd' -> 'USD')
    const resolvedCurrency = (currency || 'INR').toUpperCase();
    // अगर INR है तो भारतीय फॉर्मेट (en-IN), डॉलर या अन्य है तो (en-US) का उपयोग करें
    const locale = resolvedCurrency === 'INR' ? 'en-IN' : 'en-US';
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: resolvedCurrency,
            maximumFractionDigits: 2, // दशमलव के बाद सिर्फ 2 अंक दिखाने के लिए
        }).format(amount);
    }
    catch (error) {
        // अगर कोई गड़बड़ हो तो फॉलबैक (मैन्युअल सिंबल)
        return resolvedCurrency === 'INR' ? `₹${amount.toFixed(2)}` : `$${amount.toFixed(2)}`;
    }
};
