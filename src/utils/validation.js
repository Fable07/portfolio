/**
 * validation.js — small client-side form checks, used before sending to the API.
 * (The Laravel API validates everything again; these just give instant feedback.)
 *
 * Each helper returns { field: 'message' } for invalid fields only, so results can be
 * merged:  validate: (form) => ({ ...requiredFields(form, …), ...urlFields(form, …) })
 */

/** Optional URL fields must start with http:// or https:// when filled in. */
export function urlFields(form, fields) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([key]) => form[key] && !/^https?:\/\/\S+$/i.test(String(form[key]).trim()))
      .map(([key, name]) => [key, `${name} must start with http:// or https://`]),
  )
}

/** A link on the public site: web address or mailto: email link. */
export const isSafeLink = (value) => /^(https?:\/\/|mailto:)\S+$/i.test(String(value ?? '').trim())
