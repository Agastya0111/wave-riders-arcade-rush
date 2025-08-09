
/**
 * Security utilities for input validation and sanitization
 */

/**
 * Validates and sanitizes user input strings
 */
export const sanitizeString = (input: string, maxLength: number = 100): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
    .trim()
    .substring(0, maxLength);
};

/**
 * Validates numeric inputs
 */
export const validateNumber = (value: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null => {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (num < min || num > max) {
    return null;
  }
  
  return num;
};

/**
 * Validates game session data
 */
export const validateGameSession = (data: {
  score: number;
  level: number;
  duration: number;
  livesUsed: number;
  dolphinsUsed: number;
}): boolean => {
  const { score, level, duration, livesUsed, dolphinsUsed } = data;
  
  // Validate all numeric fields
  if (validateNumber(score, 0, 1000000) === null) return false;
  if (validateNumber(level, 1, 50) === null) return false;
  if (validateNumber(duration, 1, 86400) === null) return false; // Max 24 hours
  if (validateNumber(livesUsed, 0, 10) === null) return false;
  if (validateNumber(dolphinsUsed, 0, 100) === null) return false;
  
  return true;
};

/**
 * Rate limiting utility for preventing spam
 */
class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validates team name input
 */
export const validateTeamName = (name: string): { valid: boolean; message?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Team name is required' };
  }
  
  const sanitized = sanitizeString(name, 50);
  
  if (sanitized.length < 3) {
    return { valid: false, message: 'Team name must be at least 3 characters' };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, message: 'Team name must be less than 50 characters' };
  }
  
  // Check for inappropriate content (basic check)
  const inappropriate = ['admin', 'moderator', 'system', 'null', 'undefined'];
  if (inappropriate.some(word => sanitized.toLowerCase().includes(word))) {
    return { valid: false, message: 'Team name contains restricted words' };
  }
  
  return { valid: true };
};
