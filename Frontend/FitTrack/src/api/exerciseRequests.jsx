import axiosInstance from './axiosInstance'

export const getMyRequests = () =>
    axiosInstance.get('/exerciserequests')

export const getAllRequests = () =>
    axiosInstance.get('/exerciserequests')

export const createRequest = (data) =>
    axiosInstance.post('/exerciserequests', data)

export const deleteRequest = (id) =>
    axiosInstance.delete(`/exerciserequests/${id}`)

export const reviewRequest = (id, status) =>
    axiosInstance.put(`/exerciserequests/${id}/review`, { status })