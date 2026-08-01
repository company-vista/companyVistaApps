export const formatDate = (isoString, currency) => {
    if (!isoString)
        return 'Not set';
    const date = new Date(isoString);
    if (isNaN(date.getTime()))
        return 'Not set';
    if (currency === 'INR') {
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
