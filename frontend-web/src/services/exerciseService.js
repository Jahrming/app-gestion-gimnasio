import api from './api';

// Exercise CRUD
export const getAllExercises = async (params = {}) => {
    const response = await api.get('/exercises', { params });
    return response.data;
};

export const getExerciseById = async (id) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
};

export const createExercise = async (exerciseData) => {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
};

export const updateExercise = async (id, exerciseData) => {
    const response = await api.put(`/exercises/${id}`, exerciseData);
    return response.data;
};

export const deleteExercise = async (id) => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
};

export const getMuscleGroups = async () => {
    const response = await api.get('/exercises/muscle-groups');
    return response.data;
};
