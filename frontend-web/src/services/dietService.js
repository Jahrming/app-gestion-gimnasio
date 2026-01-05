import api from './api';

// Diet Operations
export const getDiets = async (params) => {
    const response = await api.get('/diets', { params });
    return response.data;
};

export const getDietById = async (id) => {
    const response = await api.get(`/diets/${id}`);
    return response.data;
};

export const createDiet = async (data) => {
    const response = await api.post('/diets', data);
    return response.data;
};

export const updateDiet = async (id, data) => {
    const response = await api.put(`/diets/${id}`, data);
    return response.data;
};

export const deleteDiet = async (id) => {
    const response = await api.delete(`/diets/${id}`);
    return response.data;
};

export const getDietsByUser = async (userId) => {
    const response = await api.get(`/diets/user/${userId}`);
    return response.data;
};

// Meal Operations
export const getDietMeals = async (dietId) => {
    const response = await api.get(`/diets/${dietId}/meals`);
    return response.data;
};

export const addMeal = async (dietId, data) => {
    const response = await api.post(`/diets/${dietId}/meals`, data);
    return response.data;
};

export const updateMeal = async (dietId, mealId, data) => {
    const response = await api.put(`/diets/${dietId}/meals/${mealId}`, data);
    return response.data;
};

export const deleteMeal = async (dietId, mealId) => {
    const response = await api.delete(`/diets/${dietId}/meals/${mealId}`);
    return response.data;
};
