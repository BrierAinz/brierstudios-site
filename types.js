/* ─── Type definitions via JSDoc ─── */
/* @ts-check */
/**
 * @typedef {Object} BrierContact
 * @property {string} name
 * @property {string} email
 * @property {string} [subject]
 * @property {string} message
 * @property {string} [cf-turnstile-response]
 */

/**
 * @typedef {Object} BrierContactResponse
 * @property {boolean} success
 * @property {string} [id]
 * @property {string} [error]
 */

/**
 * @typedef {Object} BrierMessage
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [subject]
 * @property {string} message
 * @property {string} timestamp
 * @property {string} ip
 */

/**
 * @typedef {Object} BrierVitals
 * @property {string} metric - LCP, INP, CLS, TTFB, Load, DOMContentLoaded
 * @property {number} value
 * @property {string} url
 */

/**
 * @typedef {Object} BrierSearchIndex
 * @property {string} title
 * @property {string} section
 * @property {string} href
 * @property {string} text
 */

/**
 * @typedef {Object} BrierSearchHit
 * @property {string} title
 * @property {string} section
 * @property {string} href
 * @property {string} text
 * @property {number} score
 */

/**
 * @typedef {Object} BrierThemePrefs
 * @property {'light'|'dark'} [theme]
 * @property {'en'|'es'|'pt'} [lang]
 * @property {'on'|'off'} [sound]
 */

/**
 * Global window extensions
 * @typedef {Object} BrierWindow
 * @property {Object} TRANSLATIONS
 * @property {Object} PT_TRANSLATIONS
 * @property {Object} BLOG_POSTS
 * @property {{search: (q: string, limit?: number) => BrierSearchHit[]}} SiteSearch
 * @property {(lang: string) => void} setLang
 * @property {() => boolean} toggleSound
 * @property {string} turnstileToken
 * @property {string[]} CONFIG
 */