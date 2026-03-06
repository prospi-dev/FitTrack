import axiosInstance from './axiosInstance'

export const getProfile = () =>
    axiosInstance.get('/profile')

export const updateName = (name) =>
    axiosInstance.put('/profile/name', { name })

export const changePassword = (currentPassword, newPassword) =>
    axiosInstance.put('/profile/password', { currentPassword, newPassword })

export const deleteAccount = () =>
    axiosInstance.delete('/profile')