import PropTypes from 'prop-types'

/**
 * Reusable component for displaying a changelog section
 */
export function ChangelogSection({ title, items }) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="mb-3">
      <h4 className="text-sm uppercase tracking-wider dr-text font-bold mb-2">
        {title}:
      </h4>
      <ul className="space-y-1 pl-4">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm dr-text-dim flex items-start gap-2">
            <span className="dr-text mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

ChangelogSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string),
}
