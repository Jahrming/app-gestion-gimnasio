import api from './api';

// Routine CRUD
export const getAllRoutines = async (params = {}) => {
    const response = await api.get('/routines', { params });
    return response.data;
};

export const getRoutineById = async (id) => {
    const response = await api.get(`/routines/${id}`);
    return response.data;
};

export const getRoutinesByUser = async (userId) => {
    const response = await api.get(`/routines/user/${userId}`);
    return response.data;
};

export const createRoutine = async (routineData) => {
    const response = await api.post('/routines', routineData);
    return response.data;
};

export const updateRoutine = async (id, routineData) => {
    const response = await api.put(`/routines/${id}`, routineData);
    return response.data;
};

export const deleteRoutine = async (id) => {
    const response = await api.delete(`/routines/${id}`);
    return response.data;
};

// Routine Exercises
export const getRoutineExercises = async (routineId, params = {}) => {
    const response = await api.get(`/routines/${routineId}/exercises`, { params });
    return response.data;
};

export const addExerciseToRoutine = async (routineId, exerciseData) => {
    const response = await api.post(`/routines/${routineId}/exercises`, exerciseData);
    return response.data;
};

export const updateRoutineExercise = async (routineId, exerciseId, exerciseData) => {
    const response = await api.put(`/routines/${routineId}/exercises/${exerciseId}`, exerciseData);
    return response.data;
};

export const removeExerciseFromRoutine = async (routineId, exerciseId) => {
    const response = await api.delete(`/routines/${routineId}/exercises/${exerciseId}`);
    return response.data;
};

export const reorderRoutineExercises = async (routineId, exercises) => {
    const response = await api.post(`/routines/${routineId}/exercises/reorder`, { exercises });
    return response.data;
};
