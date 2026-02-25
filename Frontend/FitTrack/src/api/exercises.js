import axiosInstance from './axiosInstance';

export const getExercises = () =>
    axiosInstance.get('/exercises');

export const getExercise = (id) =>
    axiosInstance.get(`/exercises/${id}`);

export const createExercise = (data) =>
    axiosInstance.post('/exercises', data);

export const updateExercise = (id, data) =>
    axiosInstance.put(`/exercises/${id}`, data);

export const deleteExercise = (id) =>
    axiosInstance.delete(`/exercises/${id}`);