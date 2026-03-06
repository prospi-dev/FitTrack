import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateName, changePassword, deleteAccount } from '../api/profile'

export default function ProfilePage() {
  const { user, login, logout } = useAuth()

  // Name form
  const [name, setName] = useState(user?.name || '')
  const [nameMsg, setNameMsg] = useState(null)
  const [nameLoading, setNameLoading] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setNameMsg(null)
    setNameLoading(true)
    try {
      const res = await updateName(name)
      // Update the stored user + token with the new name
      login({ ...user, name: res.data.name, token: res.data.token })
      setNameMsg({ type: 'success', text: 'Name updated successfully.' })
    } catch (err) {
      setNameMsg({ type: 'error', text: err.response?.data || 'Failed to update name.' })
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data || 'Failed to change password.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await deleteAccount()
      logout()
    } catch {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Profile</h1>
      <p className="text-gray-400 mb-8">Manage your account settings.</p>

      {/* Account Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Info</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <p><span className="text-gray-500">Email:</span> <span className="text-white">{user?.email}</span></p>
          <p><span className="text-gray-500">Role:</span> <span className="text-white capitalize">{user?.role}</span></p>
        </div>
      </div>

      {/* Update Name */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Display Name</h2>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Your name"
            required
          />
          {nameMsg && (
            <p className={`text-sm ${nameMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {nameMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={nameLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            {nameLoading ? 'Saving...' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Current password"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="New password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Confirm new password"
            required
          />
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {passwordMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 border border-red-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-gray-400 text-sm mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-900 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-red-400 text-sm font-medium">Are you sure? This action is irreversible.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}