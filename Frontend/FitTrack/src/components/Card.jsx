export default function Card({ children, className = '', padding = 'p-5', ...rest }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl ${padding} ${className}`} {...rest}>
      {children}
    </div>
  )
}
