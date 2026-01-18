import { useMemo, useState } from 'react'
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
    >
      <div className="pip-panel w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b pip-border">
          <h2 id="changelog-title" className="text-lg uppercase tracking-widest pip-text">
            Change History
          </h2>
          <button
            onClick={onClose}
            className="pip-text-dim hover:pip-text text-2xl"
            aria-label="Close change history"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error ? (
            <div className="text-center pip-text-dim py-8">
              <p className="text-red-400 mb-2">Failed to load change history</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center pip-text-dim py-8">No version history available</p>
          ) : (
            versions.map((version) => (
              <div key={version.version} className="mb-6 last:mb-0">
                {/* Version header */}
                <h3
                  className="text-xl font-bold pip-text mb-4"
                  style={{ textShadow: '0 0 10px var(--pip-green-glow)' }}
                >
                  {version.version}
                </h3>

                {/* Sections */}
                <ChangelogSection title="Features" items={version.features} />
                <ChangelogSection title="Bug Fixes" items={version.bugFixes} />
                <ChangelogSection title="Code Quality" items={version.codeQuality} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
