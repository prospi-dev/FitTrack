// Each key covers a button pattern that was copy-pasted identically across
// multiple pages. Only exact, recurring patterns are here — one-off button
// styles (e.g. the green Approve button, filter tabs) are left inline.
const STYLES = {
  'primary-full': 'w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg',
  'primary-modal': 'flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg',
  'primary-md': 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg',
  'primary-form': 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm cursor-pointer',
  'secondary-modal': 'flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2.5 rounded-lg',
  'danger-modal': 'flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg',
  'secondary-sm': 'text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg',
  'danger-sm': 'text-xs text-red-400 hover:text-white bg-gray-800 hover:bg-red-600 px-3 py-1.5 rounded-lg',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...rest }) {
  const style = STYLES[`${variant}-${size}`] ?? STYLES['primary-md']
  return (
    <button type={type} className={`${style} transition ${className}`} {...rest}>
      {children}
    </button>
  )
}
