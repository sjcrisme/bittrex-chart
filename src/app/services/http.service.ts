import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable ,  throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor( private http: HttpClient) { }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    params.set('Content-Type', 'application/json');
    return this.http.get(`${path}`, { params, observe: 'response' })
      .pipe(
        map(result => result['body']['result']),
        catchError(this.formatErrors)
      );
  }
  private formatErrors(error: any) {
    return throwError(error.error);
  }
}
