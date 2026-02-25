import axiosInstance from "./axiosInstance";

export const getRoutines = () =>
    axiosInstance.get('/routines');

export const getRoutine = (id) =>
    axiosInstance.get(`/routines/${id}`);

export const createRoutine = (data) =>
    axiosInstance.post('/routines', data);

export const updateRoutine = (id, data) =>
    axiosInstance.put(`/routines/${id}`, data);

export const deleteRoutine = (id) =>
    axiosInstance.delete(`/routines/${id}`);

export const addExerciseToRoutine = (routineId, data) =>
    axiosInstance.post(`/routines/${routineId}/exercises`, data);

export const updateExerciseInRoutine = (routineId, entryId, data) =>
    axiosInstance.put(`/routines/${routineId}/exercises/${entryId}`, data);

export const removeExerciseFromRoutine = (routineId, entryId) =>
    axiosInstance.delete(`/routines/${routineId}/exercises/${entryId}`);