import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { parseChangelog } from '../utils/changelog'
import { ChangelogSection } from './ChangelogSection'
import changelogRaw from '../../CHANGELOG.md?raw'

export function ChangeHistory({ onClose }) {
  const [error, setError] = useState(null)

  const versions = useMemo(() => {
    try {
      return parseChangelog(changelogRaw)
    } catch (err) {
      setError(err.message)
      return []
    }
  }, [])

  return (
    <div
      className="dr-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
    >
      <div className="dr-panel w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b dr-border">
          <h2 id="changelog-title" className="text-lg uppercase tracking-widest dr-text">
            Change History
          </h2>
          <button
            onClick={onClose}
            className="dialog-close dr-text-dim hover:dr-text"
            aria-label="Close change history"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {error ? (
            <div className="text-center dr-text-dim py-8">
              <p className="text-negative mb-2">Failed to load change history</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center dr-text-dim py-8">No version history available</p>
          ) : (
            versions.map((version) => (
              <div key={version.version} className="mb-6 last:mb-0">
                {/* Version header */}
                <h3
                  className="text-xl font-bold dr-text mb-4"
                  style={{ textShadow: '0 0 10px var(--dr-green-glow)' }}
                >
                  {version.version}
                </h3>

                {/* Sections */}
                <ChangelogSection title="Features" items={version.features} />
                <ChangelogSection title="Bug Fixes" items={version.bugFixes} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

ChangeHistory.propTypes = {
  onClose: PropTypes.func.isRequired,
}
