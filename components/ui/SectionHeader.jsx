export default function SectionHeader({ label, title, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="section-label mb-3">✦ {label}</p>
      <h2
        className="section-title"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <div className="divider-ornament">
        <span className="text-gold text-sm">✦</span>
      </div>
    </div>
  )
}
