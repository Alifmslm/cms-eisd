import type { UserRole } from '../types/auth';

export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'admin';
}

export function canEdit(role: UserRole | undefined): boolean {
  return isAdmin(role);
}

export function canDelete(role: UserRole | undefined): boolean {
  return isAdmin(role);
}
