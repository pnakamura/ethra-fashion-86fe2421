import i18n from '@/i18n';

/**
 * Get a personalized greeting based on time of day
 */
export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  
  let timeGreeting: string;
  if (hour < 12) {
    timeGreeting = i18n.t('greeting.morning', { ns: 'common' });
  } else if (hour < 18) {
    timeGreeting = i18n.t('greeting.afternoon', { ns: 'common' });
  } else {
    timeGreeting = i18n.t('greeting.evening', { ns: 'common' });
  }
  
  if (name) {
    return `${timeGreeting}, ${name}!`;
  }
  
  return `${timeGreeting}!`;
}

/**
 * Get first name from full name
 */
export function getFirstName(fullName?: string | null): string | null {
  if (!fullName) return null;
  return fullName.split(' ')[0];
}
