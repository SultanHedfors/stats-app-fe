// src/app/auth/logging.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('➡️ HTTP Request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('✅ HTTP Response:', {
            url: req.url,
            status: event.status,
            body: event.body,
            headers: event.headers
          });
        }
      })
    );
  }
}
