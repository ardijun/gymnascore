/**
 * Secure Cryptographic Utilities for GymnaScore
 * Uses standard browser-native Web Cryptography API for high-entropy operations.
 */

import { SecurityLog } from '../types';

// Generate a random high-entropy salt
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    // Fallback pseudo-random for edge environments
    for (let i = 0; i < 16; i++) {
       arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate simulated IP address
export function getRandomIP(): string {
  return `${Math.floor(Math.random() * 80) + 114}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

// Create and insert a secure audit trail event
export function logSecurityEvent(
  eventType: SecurityLog['eventType'],
  username: string,
  details: string,
  action: string,
  customIP?: string
): SecurityLog {
  const ip = customIP || `${Math.floor(Math.random() * 41) + 182}.16.20.${Math.floor(Math.random() * 250) + 1}`;
  const log: SecurityLog = {
    id: `sec-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
    eventType,
    username,
    details,
    action,
    ipAddress: ip
  };

  try {
    const existingStr = localStorage.getItem('gymnascore_security_logs') || '[]';
    const existing: SecurityLog[] = JSON.parse(existingStr);
    // Keep last 150 logs to prevent storage explosion
    const updated = [log, ...existing].slice(0, 150);
    localStorage.setItem('gymnascore_security_logs', JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to write security log:", e);
  }

  return log;
}


// Salted SHA-256 async hashing
export async function hashPassword(password: string, salt: string): Promise<string> {
  const saltedMsg = password + salt;
  const msgBuffer = new TextEncoder().encode(saltedMsg);
  
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn("Subtle Crypto not available, reverting to fallback hash", e);
  }

  // Pure-JS robust checksum fallback to guarantee startup safety under all legacy/iframe bounds
  let hash = 5381;
  const combined = saltedMsg;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 33) ^ combined.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
