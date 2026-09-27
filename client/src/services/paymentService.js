import api from "./api";

export const createPaymentOrder = (data) => api.post("/payments/create-order", data);
export const verifyPayment = (data) => api.post("/payments/verify", data);
