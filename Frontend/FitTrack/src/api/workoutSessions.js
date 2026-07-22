import axiosInstance from "./axiosInstance";

export const getSessions = () => 
    axiosInstance.get('/workoutsessions');

export const getSession = (id) =>
    axiosInstance.get(`/workoutsessions/${id}`);

export const createSession = (data) =>
    axiosInstance.post('/workoutsessions', data);

export const updateSession = (id, data) =>
    axiosInstance.put(`/workoutsessions/${id}`, data);

export const deleteSession = (id) =>
    axiosInstance.delete(`/workoutsessions/${id}`);