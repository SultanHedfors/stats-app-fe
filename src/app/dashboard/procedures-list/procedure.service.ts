import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private cache = new Map<number, any[]>(); // page => list
  private cachedRange: { start: number, end: number } | null = null;
  private lastTotalPages = 0;
private lastTotalElements = 0;


  constructor(private http: HttpClient) {}

  restorePreviousAssignment(activityId: number): Observable<any> {
    return this.http.post('http://localhost:8080/api/procedures/old', { activityId });
  }
  

  assignToCurrentUser(activityId: number): Observable<any> {
    return this.http.patch(`http://localhost:8080/api/procedures`, { activityId });
  }

  
  getPage(page: number, size: number): Observable<any> {
    const fetchStart = Math.floor(page / 5) * 5;
    const totalSize = size * 5;
  
    if (this.cache.has(page)) {
      return of({
        content: this.cache.get(page)!,
        totalPages: this.lastTotalPages,
        totalElements: this.lastTotalElements
      });
    }
  
    return this.http.get<any>(`http://localhost:8080/api/procedures?page=${fetchStart}&size=${totalSize}`).pipe(
      tap(response => {
        const allRecords = response.content;
        const fetchPages = Array.from({ length: 5 }, (_, i) => fetchStart + i);
  
        fetchPages.forEach((p, idx) => {
          const slice = allRecords.slice(idx * size, (idx + 1) * size);
          this.cache.set(p, slice);
        });
  
        this.cachedRange = { start: fetchStart, end: fetchStart + 4 };
        this.lastTotalPages = response.totalPages;
        this.lastTotalElements = response.totalElements;
  
        [...this.cache.keys()].forEach(k => {
          if (k < fetchStart || k > fetchStart + 4) {
            this.cache.delete(k);
          }
        });
      }),
      map(response => ({
        content: this.cache.get(page) || [],
        totalPages: response.totalPages,
        totalElements: response.totalElements
      }))
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
