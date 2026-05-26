// Input sanitization utilities
// Prevents XSS, injection, and abuse through the submit form

/**
 * Strip HTML tags and sanitize text input
 * Renders any injection attempt harmless
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/&/g, '&amp;')            // encode ampersands
    .replace(/</g, '&lt;')             // encode angle brackets
    .replace(/>/g, '&gt;')             // encode angle brackets
    .replace(/"/g, '&quot;')           // encode quotes
    .replace(/'/g, '&#x27;')           // encode apostrophes
    .replace(/\//g, '&#x2F;')          // encode forward slashes
    .trim()
    .slice(0, 2000);                   // max 2000 chars
}

/**
 * Sanitize a URL — only allow http/https protocols
 * Prevents javascript: URI injection
 */
export function sanitizeUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, 500);
  if (!trimmed.match(/^https?:\/\//i)) return '';  // only allow http/https
  return trimmed;
}

/**
 * Sanitize a datetime string
 * Only allow ISO-like datetime formats
 */
export function sanitizeDatetime(input: string): string {
  if (!input) return '';
  const cleaned = input.trim().slice(0, 30);
  if (!cleaned.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/)) return '';
  return cleaned;
}

/**
 * Sanitize category slugs — only allow known slugs
 */
export function sanitizeCategories(input: string[], knownSlugs: string[]): string[] {
  return input.filter(slug => knownSlugs.includes(slug));
}

/**
 * Sanitize recurrence values — only allow known patterns
 */
export function sanitizeRecurrence(input: string): string {
  if (!input) return '';
  const allowed = [
    '', 'nth-weekday:1-6', 'nth-weekday:2-6', 'nth-weekday:3-6', 'nth-weekday:4-6',
    'nth-weekday:1-5', 'nth-weekday:2-5', 'nth-weekday:3-5',
    'weekly:6', 'weekly:5', 'weekly:0',
  ];
  return allowed.includes(input) ? input : '';
}

// Rate limiting (in-memory, per-Vercel-cold-start)
const submissionTimestamps: number[] = [];
const MAX_SUBMISSIONS_PER_HOUR = 5;

export function checkRateLimit(): boolean {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  // Clean old entries
  while (submissionTimestamps.length > 0 && submissionTimestamps[0] < oneHourAgo) {
    submissionTimestamps.shift();
  }
  if (submissionTimestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return false; // rate limited
  }
  submissionTimestamps.push(now);
  return true;
}

// Admin auth — simple bearer token check
export function isAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false; // no admin token set = no admin access via API
  return authHeader === `Bearer ${token}`;
}