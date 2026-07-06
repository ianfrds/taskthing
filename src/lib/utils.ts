// =========================================================
// lib/utils.ts — Pure helper functions
// =========================================================

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Get initials from a name (max 2 chars) */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Format a date string to locale string */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Check if a due date is overdue */
export function isOverdue(due: string | null): boolean {
  if (!due) return false;
  return new Date(due) < new Date();
}

/** Generate a random color hex from COLORS list */
export function randomColor(colors: { hex: string }[]): string {
  return colors[Math.floor(Math.random() * colors.length)].hex;
}

/** Generate a random project icon */
export function randomIcon(icons: string[]): string {
  return icons[Math.floor(Math.random() * icons.length)];
}

/** Generate a username from email */
export function generateUsername(email: string): string {
  const prefix = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
  if (!prefix) return 'user' + Math.random().toString(36).slice(2, 8);
  return prefix + Math.random().toString(36).slice(2, 6);
}

/** Parse hostname from URL safely */
export function parseHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/** Compress an image File to base64 data URI */
export function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Retry an async function up to `retries` times with exponential backoff */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 700 * (i + 1)));
    }
  }
  throw new Error('withRetry: unreachable');
}
