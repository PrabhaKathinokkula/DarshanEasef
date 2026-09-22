import api from "./api";

export const getUsers = (role = "") => api.get(`/users${role ? `?role=${role}` : ""}`);
export const getUserById = (id) => api.get(`/users/${id}`);
export const createOrganizer = (data) => api.post("/users/organizers", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getAdminDashboard = () => api.get("/admin/dashboard");
export const getOrganizerDashboard = () => api.get("/organizer/dashboard");

export const submitFeedback = (data) => api.post("/feedback", data);
export const getTempleFeedback = (templeId) => api.get(`/feedback/temple/${templeId}`);
