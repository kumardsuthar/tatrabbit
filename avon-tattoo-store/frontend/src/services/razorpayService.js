import tatRabbitLogo from '../assets/logo.jpeg';

export const razorpayService = {
  loadScript: () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  openCheckoutModal: async ({
    keyId,
    amountPaise,
    currency = 'INR',
    orderId,
    razorpayOrderId,
    storeName = 'TatRabbit',
    customerName,
    customerEmail,
    customerPhone,
    onSuccess,
    onDismiss
  }) => {
    const isLoaded = await razorpayService.loadScript();

    if (!isLoaded || !window.Razorpay) {
      alert('Failed to load Razorpay payment gateway SDK. Check internet connection.');
      return;
    }

    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://tatrabbit.com';
    let logoUrl = tatRabbitLogo;
    if (logoUrl && !logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
      logoUrl = `${origin}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
    }
    if (!logoUrl) {
      logoUrl = `${origin}/logo.jpeg`;
    }

    const options = {
      key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
      amount: amountPaise,
      currency: currency,
      name: storeName,
      description: `Payment for Order #${orderId}`,
      image: logoUrl,
      order_id: razorpayOrderId,
      handler: function (response) {
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
            razorpay_signature: response.razorpay_signature || 'simulated_signature'
          });
        }
      },
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || ''
      },
      theme: {
        color: '#EAB308'
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
};
