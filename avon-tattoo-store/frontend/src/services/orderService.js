import api from './api';

export const orderService = {
  createOrder: async (items, shippingDetails) => {
    const response = await api.post('/orders/create.php', {
      items,
      shipping_name: shippingDetails.shipping_name,
      shipping_phone: shippingDetails.shipping_phone,
      shipping_address: shippingDetails.shipping_address
    });
    return response.data;
  },

  verifyOrder: async (razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId) => {
    const response = await api.post('/orders/verify.php', {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      order_id: orderId
    });
    return response.data;
  },

  getOrderForEdit: async (orderId) => {
    const response = await api.get(`/orders/get.php?order_id=${encodeURIComponent(orderId)}`);
    return response.data;
  },

  initiateOrderEdit: async (orderId, items, shippingDetails) => {
    const response = await api.post('/orders/edit-initiate.php', {
      order_id: orderId,
      items,
      shipping_name: shippingDetails.shipping_name,
      shipping_phone: shippingDetails.shipping_phone,
      shipping_address: shippingDetails.shipping_address
    });
    return response.data;
  },

  verifyOrderEdit: async (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, items, shippingDetails) => {
    const response = await api.post('/orders/edit-verify.php', {
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      items,
      shipping_name: shippingDetails.shipping_name,
      shipping_phone: shippingDetails.shipping_phone,
      shipping_address: shippingDetails.shipping_address
    });
    return response.data;
  },

  getUserOrders: async () => {
    const response = await api.get('/orders/user-orders.php');
    return response.data;
  },

  trackOrder: async (orderId, phoneOrEmail) => {
    const response = await api.get(`/orders/track.php?order_id=${orderId}&phone=${encodeURIComponent(phoneOrEmail || '')}`);
    return response.data;
  },

  getAdminOrders: async (statusFilter = 'All', search = '') => {
    const response = await api.get(`/admin/orders-list.php?status=${encodeURIComponent(statusFilter)}&search=${encodeURIComponent(search)}`);
    return response.data;
  },

  updateOrderRefund: async (orderId, refundStatus) => {
    const response = await api.post('/admin/update-refund.php', {
      order_id: orderId,
      refund_status: refundStatus
    });
    return response.data;
  },

  getAdminRefunds: async (status = 'all', search = '') => {
    const response = await api.get(`/admin/refunds-list.php?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`);
    return response.data;
  },

  getAdminNotifications: async () => {
    const response = await api.get('/admin/notifications.php');
    return response.data;
  },

  updateTrackingInfo: async (orderId, trackingStatus, courierName, trackingNumber, trackingUrl, notifyCustomer = true) => {
    const response = await api.post('/admin/update-tracking.php', {
      order_id: orderId,
      tracking_status: trackingStatus,
      courier_name: courierName,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      notify_customer: notifyCustomer
    });
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/admin/stats.php');
    return response.data;
  },

  getCustomersList: async () => {
    const response = await api.get('/admin/customers-list.php');
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await api.post('/orders/cancel.php', {
      order_id: orderId,
      reason
    });
    return response.data;
  },

  createSupportTicket: async (ticketData) => {
    const response = await api.post('/support/create.php', ticketData);
    return response.data;
  },

  getAdminTickets: async (status = 'all') => {
    const response = await api.get(`/admin/tickets-list.php?status=${status}`);
    return response.data;
  },

  updateAdminTicket: async (ticketId, status, adminReply) => {
    const response = await api.post('/admin/update-ticket.php', {
      ticket_id: ticketId,
      status,
      admin_reply: adminReply
    });
    return response.data;
  }
};
