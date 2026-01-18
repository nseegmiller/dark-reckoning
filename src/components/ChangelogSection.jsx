/**
 * Reusable component for displaying a changelog section
 */
export function ChangelogSection({ title, items }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="mb-3">
      <h4 className="text-sm uppercase tracking-wider pip-text font-bold mb-2">
        {title}:
      </h4>
      <ul className="space-y-1 pl-4">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm pip-text-dim flex items-start gap-2">
            <span className="pip-text mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
