// Stripe product and price configuration
export const STRIPE_PRODUCTS = {
  PROJECT_MANAGEMENT: {
    product_id: 'prod_THvDXrQmwudyMn',
    price_id: 'price_1SLLMpKZLR42mmzsPklej40F',
    name: 'Project Management Plan',
    price_monthly: 550,
    currency: 'AUD',
    features: [
      'Unlimited Projects',
      'Advanced Task Management',
      'Team Collaboration',
      'Gantt Charts',
      'Budget Tracking',
      'Custom Reports',
      'Priority Support'
    ]
  },
  BUSINESS_MANAGEMENT: {
    product_id: 'prod_THvHjTMcOHBsha',
    price_id: 'price_1SLLQxKZLR42mmzseXBxbuuc',
    name: 'Business Management Plan',
    price_monthly: 950,
    currency: 'AUD',
    features: [
      'Everything in Project Management',
      'Sales Pipeline Management',
      'Contract Management',
      'Advanced Analytics',
      'API Access',
      'Custom Integrations',
      'Dedicated Account Manager',
      'White Label Options'
    ]
  }
} as const;

export type StripeProduct = keyof typeof STRIPE_PRODUCTS;

export const getProductByStripeId = (productId: string) => {
  return Object.values(STRIPE_PRODUCTS).find(p => p.product_id === productId);
};
