// Section type constants
export const SECTION_TYPES = {
  FEATURES: 'features',
  BUG_FIXES: 'bugFixes',
  CODE_QUALITY: 'codeQuality'
}

// Section header mappings
const SECTION_HEADERS = {
  '**Features:**': SECTION_TYPES.FEATURES,
  '**Bug Fixes:**': SECTION_TYPES.BUG_FIXES,
  '**Code Quality:**': SECTION_TYPES.CODE_QUALITY
}

/**
 * Parse CHANGELOG.md content into structured version data
 * @param {string} changelogText - Raw markdown text from CHANGELOG.md
 * @returns {Array<Object>} Array of version objects with features, bugFixes, and codeQuality
 * @throws {Error} If parsing fails
 */
export function parseChangelog(changelogText) {
  try {
    if (!changelogText || typeof changelogText !== 'string') {
      throw new Error('Invalid changelog content')
    }

    const versions = []
    const lines = changelogText.split('\n')

    let currentVersion = null
    let currentSection = null

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Skip empty lines and main header
      if (!trimmedLine || trimmedLine === '# Change History') {
        continue
      }

      // Version header (## v0.7)
      if (trimmedLine.startsWith('## v')) {
        if (currentVersion) {
          versions.push(currentVersion)
        }
        currentVersion = {
          version: trimmedLine.replace('## ', '').trim(),
          [SECTION_TYPES.FEATURES]: [],
          [SECTION_TYPES.BUG_FIXES]: [],
          [SECTION_TYPES.CODE_QUALITY]: []
        }
        currentSection = null
      }
      // Section headers
      else if (SECTION_HEADERS[trimmedLine]) {
        currentSection = SECTION_HEADERS[trimmedLine]
      }
      // List items
      else if (trimmedLine.startsWith('- ') && currentVersion && currentSection) {
        const item = trimmedLine.replace('- ', '').trim()
        if (item) {
          currentVersion[currentSection].push(item)
        }
      }
    }

    // Push last version
    if (currentVersion) {
      versions.push(currentVersion)
    }

    return versions
  } catch (error) {
    console.error('Failed to parse changelog:', error)
    throw new Error(`Changelog parsing failed: ${error.message}`)
  }
}
