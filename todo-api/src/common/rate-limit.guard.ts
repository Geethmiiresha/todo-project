import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitWindow {
  count: number;
  expiresAt: number;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_CLIENTS = 10_000;

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, RateLimitWindow>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const endpoint = request.route?.path;
    const isLoginOrRegister =
      endpoint === '/login' || endpoint === '/register';
    const isForgotPassword = endpoint === '/forgot-password';
    const limit = isForgotPassword ? 5 : isLoginOrRegister ? 10 : 120;
    const bucket = isForgotPassword
      ? 'forgot-password'
      : isLoginOrRegister
        ? `auth-${endpoint}`
        : 'api';
    const key = `${ip}:${bucket}`;
    const now = Date.now();
    let window = this.windows.get(key);

    if (!window || window.expiresAt <= now) {
      window = { count: 0, expiresAt: now + WINDOW_MS };
      this.windows.set(key, window);
    }

    if (window.count >= limit) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    window.count += 1;

    if (this.windows.size > MAX_TRACKED_CLIENTS) {
      for (const [client, clientWindow] of this.windows) {
        if (clientWindow.expiresAt <= now) this.windows.delete(client);
      }
      while (this.windows.size > MAX_TRACKED_CLIENTS) {
        const oldest = this.windows.keys().next().value;
        if (oldest === undefined) break;
        this.windows.delete(oldest);
      }
    }

    return true;
  }
}
