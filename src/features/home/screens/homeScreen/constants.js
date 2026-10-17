// Payment pending hone par ye bottom-tab tabs lock rehte hain - tap par
// "Pay now" toast dikhta hai. Payment success par ye automatically unlock ho jaate hain.
export const PAYMENT_LOCKED_TABS = ['reports', 'billing', 'documents'];

// userCompanies ki array identity har profile update par nayi ho jaati hai
// (updateProfileUser naya object banata hai), jabki contents same rehte hain.
// Is liye dep me array nahi, uska content-key use hota hai.
export const companyIdsKey = list => (list || []).map(c => String(c?.id ?? c?._id ?? '')).join('|');
