// Stripe types
export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_SECRET_KEY?: string;
      STRIPE_PUBLISHABLE_KEY?: string;
      STRIPE_PRO_PRICE_ID?: string;
      STRIPE_BUSINESS_PRICE_ID?: string;
      NEXT_PUBLIC_URL?: string;
    }
  }
}
