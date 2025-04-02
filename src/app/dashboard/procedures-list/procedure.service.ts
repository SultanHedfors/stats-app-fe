import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private cache = new Map<string, any[]>(); // key = YYYY-MM
  private currentMonthKey: string | null = null;

  constructor(private http: HttpClient) {}

  private fetchMonth(month: string): Observable<any[]> {
    const params = new HttpParams()
      .set('month', month)
      .set('page', '0')
      .set('size', '150');
    return this.http.get<any>('http://localhost:8080/api/procedures', { params }).pipe(
      map(res => res.content),
      tap(data => this.cache.set(month, data))
    );
  }

  prefetchSurroundingMonths(centerMonth: string): Observable<void> {
    const [prev, current, next] = this.getSurroundingMonths(new Date(centerMonth + '-01'));
    return new Observable<void>(observer => {
      forkJoin([
        this.cache.has(prev) ? of(this.cache.get(prev)) : this.fetchMonth(prev),
        this.cache.has(current) ? of(this.cache.get(current)) : this.fetchMonth(current),
        this.cache.has(next) ? of(this.cache.get(next)) : this.fetchMonth(next)
      ]).subscribe(() => {
        this.currentMonthKey = current;
        observer.next();
        observer.complete();
      });
    });
  }

  getMonthKey(date: Date): string {
    return date.toISOString().slice(0, 7);
  }

  getProceduresByMonth(month: string): any[] {
    return this.cache.get(month) || [];
  }

  clearCache(): void {
    this.cache.clear();
    this.currentMonthKey = null;
  }

  restorePreviousAssignment(activityId: number) {
    return this.http.post('http://localhost:8080/api/procedures/old', { activityId });
  }

  assignToCurrentUser(activityId: number) {
    return this.http.patch('http://localhost:8080/api/procedures', { activityId });
  }

  private getSurroundingMonths(date: Date): string[] {
    const current = new Date(date.getFullYear(), date.getMonth(), 1);
    const prev = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    return [prev.toISOString().slice(0, 7), current.toISOString().slice(0, 7), next.toISOString().slice(0, 7)];
  }
}
