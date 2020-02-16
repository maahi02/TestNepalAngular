import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';



@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
   // private toastr: ToastrService
  ) { }

  private formatErrors(error: any) {
    return throwError(error.error);
  }

  

  get(path: string, params: any = {}): Observable<any> {
    return this.http.get(`${environment.apiurl}${path}`, { params })
      .pipe(
        tap((res) => this.getReutnData(res)),
        catchError((err) => this.getformatErrors(err)),
      );
  }

  put(path: string, body: any, message: any = 'Updated Successfully.'): Observable<any> {
    return this.http.put(
      `${environment.apiurl}${path}`,
      body,
    ).pipe(
      tap((res) => this.putReutnData(res, message)),
      catchError((err) => this.postFormatErrors(err)),
    );
  }

  post(path: string, body: any, message: any = 'Created successfully.'): Observable<any> {
    return this.http.post(
      `${environment.apiurl}${path}`,
      body,
    ).pipe(
      tap((res) => this.postReutnData(res, message)),
      catchError((err) => this.postFormatErrors(err)),
    );
  }


  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.apiurl}${path}`,
    ).pipe(catchError(this.formatErrors));
  }
  private getReutnData(res: any) {
    return res || {};
  }
  public getformatErrors(error: any): any {
    return throwError(error.error);
  }
  private postReutnData(res: any, message: any) {
   // this.toastr.success(message, 'Success!')
    return res || {};
  }
  private putReutnData(res: any, message: any) {
   // this.toastr.success(message, 'Success!')
    return res || {};
  }
  public postFormatErrors(error: any): any {
  }

}
