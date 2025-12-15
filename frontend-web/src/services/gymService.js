import api from './api';

export const getAllGyms = async () => {
    const response = await api.get('/gyms');
    return response.data;
};

export const getGymById = async (id) => {
    const response = await api.get(`/gyms/${id}`);
    return response.data;
};

export const createGym = async (gymData) => {
    const response = await api.post('/gyms', gymData);
    return response.data;
};

export const updateGym = async (id, gymData) => {
    const response = await api.put(`/gyms/${id}`, gymData);
    return response.data;
};

export const deleteGym = async (id) => {
    const response = await api.delete(`/gyms/${id}`);
    return response.data;
};

export const getAvailableOwners = async () => {
    const response = await api.get('/gyms/owners/available');
    return response.data;
};
