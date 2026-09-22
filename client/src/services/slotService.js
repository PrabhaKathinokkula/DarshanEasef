import api from "./api";

export const getSlots = (templeId = "", includeExpired = false) => {
	const params = new URLSearchParams();
	if (templeId) params.set("temple", templeId);
	if (includeExpired) params.set("includeExpired", "true");
	const query = params.toString();
	return api.get(`/slots${query ? `?${query}` : ""}`);
};
export const getMySlots = () => api.get("/slots/organizer/mine");
export const getSlotById = (id) => api.get(`/slots/${id}`);
export const createSlot = (data) => api.post("/slots", data);
export const updateSlot = (id, data) => api.put(`/slots/${id}`, data);
export const deleteSlot = (id) => api.delete(`/slots/${id}`);
