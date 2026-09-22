import api from "./api";

export const getTemples = (search = "") =>
  api.get(`/temples${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const getTempleById = (id) => api.get(`/temples/${id}`);
export const getMyTemple = () => api.get("/temples/organizer/mine");
export const assignTemple = (data) => api.post("/temples/assign", data);
export const createTemple = (formData) =>
  api.post("/temples", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateTemple = (id, formData) =>
  api.put(`/temples/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteTemple = (id) => api.delete(`/temples/${id}`);
