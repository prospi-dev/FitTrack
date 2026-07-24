export default function Card({ children, className = '', padding = 'p-5', hover = false, ...rest }) {
  const hoverClasses = hover
    ? 'transition duration-150 ease-out hover:border-line-strong hover:-translate-y-px hover:shadow-pop'
    : ''
  return (
    <div
      className={`bg-surface-1 border border-line rounded-[var(--radius-card)] shadow-card ${hoverClasses} ${padding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
