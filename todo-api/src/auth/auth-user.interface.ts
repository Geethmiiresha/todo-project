import type { Request } from 'express';
import { UserRole } from '../users/entities/user.entity';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}