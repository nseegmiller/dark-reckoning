// Changelog-related type definitions

/** Section type constants */
export const SECTION_TYPES = {
  FEATURES: 'features',
  BUG_FIXES: 'bugFixes',
  CODE_QUALITY: 'codeQuality'
} as const

/** Type for section identifiers */
export type SectionType = typeof SECTION_TYPES[keyof typeof SECTION_TYPES]

/** Markdown headers for changelog sections */
export const SECTION_HEADERS = {
  FEATURES: '**Features**',
  FEATURES_WITH_COLON: '**Features:**',
  BUG_FIXES: '**Bug Fixes**',
  BUG_FIXES_WITH_COLON: '**Bug Fixes:**',
  CODE_QUALITY: '**Code Quality**',
  CODE_QUALITY_WITH_COLON: '**Code Quality:**',
} as const

/** Map from header text to section type */
export const HEADER_TO_SECTION: Record<string, SectionType> = {
  [SECTION_HEADERS.FEATURES]: SECTION_TYPES.FEATURES,
  [SECTION_HEADERS.FEATURES_WITH_COLON]: SECTION_TYPES.FEATURES,
  [SECTION_HEADERS.BUG_FIXES]: SECTION_TYPES.BUG_FIXES,
  [SECTION_HEADERS.BUG_FIXES_WITH_COLON]: SECTION_TYPES.BUG_FIXES,
  [SECTION_HEADERS.CODE_QUALITY]: SECTION_TYPES.CODE_QUALITY,
  [SECTION_HEADERS.CODE_QUALITY_WITH_COLON]: SECTION_TYPES.CODE_QUALITY,
}

/** Parsed version entry from changelog */
export interface VersionEntry {
  version: string
  features: string[]
  bugFixes: string[]
  codeQuality: string[]
}
