import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ConsoleLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = req;
    const now = Date.now();

    console.log('\n🟢 [REQUEST]');
    console.log(`${method} ${url}`);
    
    // Safe check và log cho params
    try {
      if (params && typeof params === 'object' && Object.keys(params).length > 0) {
        console.log('Params:', JSON.stringify(params, null, 2));
      }
    } catch (e) {
      console.log('Params: [Unable to serialize]');
    }

    // Safe check và log cho query
    try {
      if (query && typeof query === 'object' && Object.keys(query).length > 0) {
        console.log('Query:', JSON.stringify(query, null, 2));
      }
    } catch (e) {
      console.log('Query: [Unable to serialize]');
    }

    // Safe check và log cho body
    try {
      if (body && typeof body === 'object' && Object.keys(body).length > 0) {
        console.log('Body:', JSON.stringify(body, null, 2));
      }
    } catch (e) {
      console.log('Body: [Unable to serialize]');
    }

    return next.handle().pipe(
      tap((responseData) => {
        console.log(`🔵 [RESPONSE] ${method} ${url} (${Date.now() - now}ms)`);
        try {
          console.log('Response:', JSON.stringify(responseData, null, 2));
        } catch (e) {
          console.log('Response:', responseData);
        }
      }),
    );
  }
}