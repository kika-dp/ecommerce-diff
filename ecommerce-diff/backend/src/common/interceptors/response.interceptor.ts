import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        if (payload && typeof payload === 'object' && 'data' in payload && 'message' in payload) {
          return {
            success: true,
            message: payload.message ?? 'OK',
            data: payload.data ?? null,
            meta: payload.meta,
          };
        }
        return {
          success: true,
          message: 'OK',
          data: payload as T,
        };
      }),
    );
  }
}
