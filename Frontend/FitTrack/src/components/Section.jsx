export default function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-white">{title}</h2>
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{children}</p>
    </section>
  )
}
