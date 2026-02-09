import { z } from 'zod';

/**
 * Sanitizes user input text to prevent XSS and injection attacks
 * @param text - The text to sanitize
 * @param maxLength - Maximum allowed length (default 500)
 * @returns Sanitized text
 */
export function sanitizeText(text: string, maxLength = 500): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
}

/**
 * Sanitizes a URL to prevent javascript: and data: injection
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }
  
  // Only allow http, https, mailto, and tel protocols
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('mailto:') &&
    !trimmed.startsWith('tel:') &&
    !trimmed.startsWith('/')
  ) {
    return '';
  }
  
  return url.trim();
}

/**
 * Reusable Zod schema for user text input validation
 */
export const userInputSchema = z.object({
  text: z.string()
    .trim()
    .max(1000, 'Texto muito longo')
    .refine(val => !/<script/i.test(val), 'Conteúdo inválido'),
});

/**
 * Schema for validating user-provided names
 */
export const nameSchema = z.string()
  .trim()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo')
  .refine(val => !/<[^>]*>/g.test(val), 'Caracteres inválidos');

/**
 * Schema for validating user-provided notes/descriptions
 */
export const notesSchema = z.string()
  .trim()
  .max(500, 'Texto muito longo')
  .optional()
  .transform(val => val ? sanitizeText(val, 500) : val);
