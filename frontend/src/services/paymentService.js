import api from './api'

export const paymentService = {
  getPlans: () =>
    api.get('/payments/plans').then((r) => r.data),

  createOrder: (planId) =>
    api.post('/payments/order', { planId }).then((r) => r.data),

  verify: ({ orderId, paymentId, signature }) =>
    api.post('/payments/verify', { orderId, paymentId, signature }).then((r) => r.data),
}
