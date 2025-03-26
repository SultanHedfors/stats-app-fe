import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProcedureService } from './procedure.service'; // dopasuj do swojej ścieżki

@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  providers: [ProcedureService],
  templateUrl: './procedures-list.component.html',
  styleUrls: ['./procedures-list.component.css']
})
export class ProceduresListComponent implements OnInit {
  assigningStatus: Record<number, 'idle' | 'loading' | 'success' | 'error'> = {};
  highlightedRows: Record<number, boolean> = {};


  procedures: any[] = [];
  displayedColumns: string[] = [  'activityId',
    'activityDateTime', // zamiast activityDate i activityTime
    'employeeCode',
    'employeeFullName',
    'procedureName',
    'procedureType',
    'actions'];
  loading = false;

  page = 0;
  size = 30;
  totalPages = 0;
  visiblePageWindow = 5;

  constructor(private procedureService: ProcedureService) {}

  ngOnInit() {
    const cacheExists = this.procedureService.isCachedRange(0, 4);
    this.loadPage(0, !cacheExists);
  }

  loadPage(pageNumber: number, forceLoad = true) {
    const pageGroupStart = Math.floor(pageNumber / 5) * 5;

    this.loading = true;
    this.procedureService.getPage(pageNumber, this.size).subscribe({
      next: response => {
        this.procedures = response.content;
        this.page = pageNumber;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading procedures:', err);
        this.loading = false;
      }
    });
    
  }

  pages(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= this.visiblePageWindow + 2) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    pages.push(0);
    let start = Math.max(1, this.page - 1);
    let end = Math.min(this.totalPages - 2, this.page + 1);

    if (start > 1) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < this.totalPages - 2) pages.push('...');
    pages.push(this.totalPages - 1);

    return pages;
  }

  prevPageRange() {
    if (this.page > 0) {
      this.loadPage(this.page - 1);
    }
  }

  nextPageRange() {
    if (this.page < this.totalPages - 1) {
      this.loadPage(this.page + 1);
    }
  }

  castToNumber(value: number | string): number {
    return typeof value === 'number' ? value : 0;
  }

  refreshInitialPages() {
    this.procedureService.clearCache(); // Wyczyść istniejący cache
    this.loadPage(0); // Załaduj stronę 0 (spowoduje też załadowanie 0–4)
  }

  assignProcedure(activityId: number) {
    this.assigningStatus[activityId] = 'loading';
  
    this.procedureService.assignToCurrentUser(activityId).subscribe({
      next: (updated: any) => {
        this.assigningStatus[activityId] = 'success';
  
        const item = this.procedures.find(p => p.activityId === activityId);
        if (item) {
          item.assignedToLoggedUser = true;
          item.hasHistory = true;
          item.employeeCode = updated.employeeCode;
          item.employeeFullName = updated.employeeFullName;
          this.flashHighlight(activityId);
        }
      },
      error: err => {
        this.assigningStatus[activityId] = 'error';
        console.error('Błąd przypisania:', err);
      }
    });
  }
  
  
  
  refreshCurrentPage() {
    this.procedureService.clearCache();
    this.loadPage(this.page);
  }
  restorePreviousAssignment(activityId: number) {
    this.procedureService.restorePreviousAssignment(activityId).subscribe({
      next: (updated: any) => {
        const item = this.procedures.find(p => p.activityId === activityId);
        if (item) {
          item.assignedToLoggedUser = false;
          item.hasHistory = false;
          item.employeeCode = updated.employeeCode;
          item.employeeFullName = updated.employeeFullName;
          this.assigningStatus[activityId] = 'idle';
          this.flashHighlight(activityId);
        }
      },
      error: err => {
        console.error('Błąd przywracania przypisania:', err);
      }
    });
  }
  
  flashHighlight(activityId: number) {
    this.highlightedRows[activityId] = true;
    setTimeout(() => {
      this.highlightedRows[activityId] = false;
    }, 1500);
  }
  
  
}
