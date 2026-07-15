declare module '*.jpg' {
  const value: number;
  export default value;
}

declare module '*.jpeg' {
  const value: number;
  export default value;
}

declare module '*.png' {
  const value: number;
  export default value;
}

declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    key: string;
    amount: string | number;
    currency?: string;
    name?: string;
    description?: string;
    order_id?: string;
    prefill?: { email?: string; contact?: string; name?: string };
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
  }

  interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}
