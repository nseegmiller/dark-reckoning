import { HEADER_TO_SECTION } from '../types'
import type { VersionEntry, SectionType } from '../types'

/**
 * Parse CHANGELOG.md content into structured version data
 * @param changelogText - Raw markdown text from CHANGELOG.md
 * @returns Array of version objects with features, bugFixes, and codeQuality
 * @throws Error if parsing fails
 */
export function parseChangelog(changelogText: string): VersionEntry[] {
  try {
    if (!changelogText || typeof changelogText !== 'string') {
      throw new Error('Invalid changelog content')
    }

    const versions: VersionEntry[] = []
    const lines = changelogText.split('\n')

    let currentVersion: VersionEntry | null = null
    let currentSection: SectionType | null = null

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
          features: [],
          bugFixes: [],
          codeQuality: []
        }
        currentSection = null
      }
      // Section headers
      else if (HEADER_TO_SECTION[trimmedLine]) {
        currentSection = HEADER_TO_SECTION[trimmedLine]
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
    throw new Error(`Changelog parsing failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
