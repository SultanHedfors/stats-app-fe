import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private cache = new Map<number, any[]>(); // page => list
  private cachedRange: { start: number, end: number } | null = null;

  constructor(private http: HttpClient) {}

  assignToCurrentUser(activityId: number): Observable<any> {
    return this.http.patch(`http://localhost:8080/api/procedures/`, {});
  }

  

  getPage(page: number, size: number): Observable<any[]> {
    if (this.cache.has(page)) {
      return of(this.cache.get(page)!);
    }

    const fetchStart = Math.floor(page / 5) * 5;
    const fetchPages = Array.from({ length: 5 }, (_, i) => fetchStart + i);
    const totalSize = size * 5;

    return this.http.get<any>(`http://localhost:8080/api/procedures?page=${fetchStart}&size=${totalSize}`)
      .pipe(
        tap(response => {
          const allRecords = response.content;

          fetchPages.forEach((p, idx) => {
            const slice = allRecords.slice(idx * size, (idx + 1) * size);
            this.cache.set(p, slice);
          });

          this.cachedRange = { start: fetchStart, end: fetchStart + 4 };

          // Remove old pages outside the range
          [...this.cache.keys()].forEach(k => {
            if (k < fetchStart || k > fetchStart + 4) {
              this.cache.delete(k);
            }
          });
        }),
        map(() => this.cache.get(page) || [])
      );
  }

  isCachedRange(start: number, end: number): boolean {
    return this.cachedRange?.start === start && this.cachedRange?.end === end;
  }

  clearCache(): void {
    this.cache.clear();
    this.cachedRange = null;
  }
}
