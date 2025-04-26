import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('auth_token');

  if (token) {
    // Clonar la request y añadir el header de autorización
    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(request);
}; 