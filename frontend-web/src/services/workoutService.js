import api from './api';

// Workout CRUD
export const getAllWorkouts = async (params = {}) => {
    const response = await api.get('/workouts', { params });
    return response.data;
};

export const getWorkoutById = async (id) => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
};

export const getWorkoutStats = async (userId, params = {}) => {
    const response = await api.get(`/workouts/user/${userId}/stats`, { params });
    return response.data;
};

export const createWorkout = async (workoutData) => {
    const response = await api.post('/workouts', workoutData);
    return response.data;
};

export const updateWorkout = async (id, workoutData) => {
    const response = await api.put(`/workouts/${id}`, workoutData);
    return response.data;
};

export const deleteWorkout = async (id) => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
};

// Workout Sets
export const getWorkoutSets = async (workoutId, params = {}) => {
    const response = await api.get(`/workouts/${workoutId}/sets`, { params });
    return response.data;
};

export const createWorkoutSet = async (workoutId, setData) => {
    const response = await api.post(`/workouts/${workoutId}/sets`, setData);
    return response.data;
};

export const createBulkWorkoutSets = async (workoutId, sets) => {
    const response = await api.post(`/workouts/${workoutId}/sets/bulk`, { sets });
    return response.data;
};

export const updateWorkoutSet = async (workoutId, setId, setData) => {
    const response = await api.put(`/workouts/${workoutId}/sets/${setId}`, setData);
    return response.data;
};

export const deleteWorkoutSet = async (workoutId, setId) => {
    const response = await api.delete(`/workouts/${workoutId}/sets/${setId}`);
    return response.data;
};
