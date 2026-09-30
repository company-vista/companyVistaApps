import React from 'react';
import OrderDetailsScreen from '../components/companyInformationSection/yourOrder/OrderDetailsScreen';

// OrderDetailsScreen ko Home ke andar state se chalane ke bajaye ek real route
// bana diya gaya hai. ReviewAndConfirm (AuthStack) ke baad setAuthSession
// RootStack ko Auth -> Main par switch kar deta hai, to us stack se navigate
// karna possible nahi hota. Is liye Review flag (pendingOpenOrderDetails)
// dispatch karta hai aur Home us flag ko padh kar yahan navigate karta hai.
export default function YourOrderScreen({ navigation, route }) {
    return (
        <OrderDetailsScreen
            selectedCompany={route?.params?.selectedCompany ?? null}
            onBackPress={() => navigation.goBack()}
            // onNextPress dene se component apne aap onMessagePress pe fallback
            // kar leta hai — quote abhi bhi Home ke andar hi khulti hai, to yahan
            // Support pe bhejna hi sahi CTA hai
            onMessagePress={() => navigation.navigate('Support')}
        />
    );
}
