export default () => ({
  encryption: {
    secretKey: process.env.ENCRYPTION_SECRET_KEY, // For encrypting organizer credentials
    algorithm: 'aes-256-gcm',
  },
  ecpay: {
    environment: process.env.ECPAY_ENVIRONMENT || 'development',
    productionUrl: process.env.ECPAY_PRODUCTION_URL || 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
    stagingUrl: process.env.ECPAY_STAGING_URL || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
    baseCallbackUrl: `${process.env.BASE_URL}/api/v1/payments/callback`,
    clientSuccessUrl: `${process.env.CLIENT_BASE_URL}/payment/success`,
    clientFailureUrl: `${process.env.CLIENT_BASE_URL}/payment/failure`,
  },
  payment: {
    baseUrl: process.env.BASE_URL,
    clientBaseUrl: process.env.CLIENT_BASE_URL,
  },
});