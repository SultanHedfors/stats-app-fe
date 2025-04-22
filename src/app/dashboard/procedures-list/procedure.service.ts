import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Procedure, ProcedureResponse } from './procedure.model';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private cache = new Map<string, Procedure[]>(); // key = "YYYY-MM"
  private currentMonthKey: string | null = null;
  private readonly baseUrl = 'http://localhost:8080/api/procedures';

  constructor(private http: HttpClient) {}

  private formatProcedure(proc: any): Procedure {
    return {
      ...proc,
      activityTime: proc.activityTime ? proc.activityTime.substr(11, 5) : ''
    };
  }

  private fetchMonth(month: string): Observable<Procedure[]> {
    const params = new HttpParams()
      .set('month', month)
      .set('page', '0')
      .set('size', '500');

    return this.http.get<ProcedureResponse>(this.baseUrl, { params }).pipe(
      map(res => res.content.map(this.formatProcedure)),
      tap(data => this.cache.set(month, data))
    );
  }

  prefetchMonth(month: string): Observable<void> {
    if (this.cache.has(month)) {
      return of(undefined);
    }
    return new Observable<void>(observer => {
      this.fetchMonth(month).subscribe(() => {
        this.currentMonthKey = month;
        observer.next();
        observer.complete();
      });
    });
  }

  getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  getProceduresByMonth(month: string): Procedure[] {
    return this.cache.get(month) || [];
  }

  clearCache(): void {
    this.cache.clear();
    this.currentMonthKey = null;
  }

  restorePreviousAssignment(activityId: number): Observable<Procedure> {
    return this.http.post<Procedure>(`${this.baseUrl}/old`, { activityId }).pipe(
      map(this.formatProcedure)
    );
  }

  assignToCurrentUser(activityId: number): Observable<Procedure> {
    return this.http.patch<Procedure>(this.baseUrl, { activityId }).pipe(
      map(this.formatProcedure)
    );
  }

  fetchProceduresWithoutFilter(page: number, size: number): Observable<ProcedureResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ProcedureResponse>(this.baseUrl, { params }).pipe(
      map(res => ({
        ...res,
        content: res.content.map(this.formatProcedure)
      }))
    );
  }

  fetchProceduresByDate(date: Date, page: number, size: number): Observable<ProcedureResponse> {
    const startDate = this.formatLocalDate(date);
    const endDate = this.formatLocalDate(date);

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<ProcedureResponse>(this.baseUrl, { params }).pipe(
      map(res => ({
        ...res,
        content: res.content.map(this.formatProcedure)
      }))
    );
  }

  private formatLocalDate(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(date);
  }
}
