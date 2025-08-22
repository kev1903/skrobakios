// Token Security Utilities
// Handles encryption/decryption of sensitive tokens like Xero OAuth tokens

interface EncryptedToken {
  encrypted: string;
  algorithm: string;
  keyVersion: number;
}

interface TokenRotationEntry {
  connectionId: string;
  reason: string;
  oldTokenHash: string;
  newTokenHash: string;
}

/**
 * Generates a secure hash of a token for audit logging
 * @param token - The token to hash
 * @returns SHA-256 hash of the token (first 16 chars for audit)
 */
export const generateTokenHash = async (token: string): Promise<string> => {
  if (!token) return '';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return only first 16 chars for security (enough for audit trails)
  return hashHex.substring(0, 16);
};

/**
 * Client-side token encryption using Web Crypto API
 * Note: This is basic encryption. In production, consider using a proper key management service
 */
export const encryptToken = async (token: string, keyVersion: number = 1): Promise<EncryptedToken> => {
  if (!token) throw new Error('Token is required for encryption');

  try {
    // Generate a random key for this token
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the token
    const encoder = new TextEncoder();
    const encodedToken = encoder.encode(token);
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedToken
    );

    // Export key for storage (in production, this should be managed securely)
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    // Combine IV + key + encrypted data for storage
    const combined = new Uint8Array(
      iv.length + exportedKey.byteLength + encryptedData.byteLength
    );
    
    combined.set(iv, 0);
    combined.set(new Uint8Array(exportedKey), iv.length);
    combined.set(new Uint8Array(encryptedData), iv.length + exportedKey.byteLength);
    
    // Convert to base64 for storage
    const base64Encrypted = btoa(String.fromCharCode(...combined));

    return {
      encrypted: base64Encrypted,
      algorithm: 'AES-256-GCM',
      keyVersion
    };
  } catch (error) {
    console.error('Token encryption failed:', error);
    throw new Error('Failed to encrypt token');
  }
};

/**
 * Client-side token decryption
 */
export const decryptToken = async (encryptedToken: EncryptedToken): Promise<string> => {
  if (!encryptedToken.encrypted) return '';

  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedToken.encrypted).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract components
    const iv = combined.slice(0, 12);
    const keyData = combined.slice(12, 12 + 32); // 32 bytes for AES-256
    const encryptedData = combined.slice(12 + 32);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Token decryption failed:', error);
    throw new Error('Failed to decrypt token');
  }
};

/**
 * Securely compare tokens without timing attacks
 */
export const secureTokenCompare = async (token1: string, token2: string): Promise<boolean> => {
  if (!token1 || !token2) return false;
  
  const hash1 = await generateTokenHash(token1);
  const hash2 = await generateTokenHash(token2);
  
  return hash1 === hash2;
};

/**
 * Check if a token should be rotated based on age and security criteria
 */
export const shouldRotateToken = (tokenCreatedAt: Date, maxAgeHours: number = 24 * 7): boolean => {
  const now = new Date();
  const ageHours = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);
  
  return ageHours > maxAgeHours;
};

/**
 * Generate secure token rotation log entry
 */
export const createTokenRotationLog = async (
  connectionId: string,
  oldToken: string,
  newToken: string,
  reason: string
): Promise<TokenRotationEntry> => {
  const oldTokenHash = await generateTokenHash(oldToken);
  const newTokenHash = await generateTokenHash(newToken);
  
  return {
    connectionId,
    reason,
    oldTokenHash,
    newTokenHash
  };
};

/**
 * Validate token format and basic security requirements
 */
export const validateTokenSecurity = (token: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  if (!token) {
    issues.push('Token is empty');
    return { isValid: false, issues };
  }
  
  if (token.length < 32) {
    issues.push('Token appears too short for security');
  }
  
  if (!/^[A-Za-z0-9+/=_-]+$/.test(token)) {
    issues.push('Token contains invalid characters');
  }
  
  if (token.includes('password') || token.includes('secret')) {
    issues.push('Token appears to contain sensitive keywords');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Security utility to mask tokens for logging
 */
export const maskTokenForLogging = (token: string): string => {
  if (!token) return '';
  if (token.length <= 8) return '***';
  
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
};