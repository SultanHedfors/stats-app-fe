import { Component, OnInit } from '@angular/core';
import { ProcedureService } from './procedure.service';
import { Procedure, ProcedureResponse } from './procedure.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MiniCalendarComponent } from '../calendar/mini-calendar.component';
import { ClickOutsideDirective } from '../calendar/click-outside.directive';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable, forkJoin } from 'rxjs';
import { ProceduresPaginationComponent } from './procedures-pagination.component';

@Component({
  selector: 'app-procedures-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MiniCalendarComponent,
    ClickOutsideDirective,
    ProceduresPaginationComponent
  ],
  templateUrl: './procedures-list.component.html',
  styleUrls: ['./procedures-list.component.css'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class ProceduresListComponent implements OnInit {
  procedures: Procedure[] = [];
  allProcedures: Procedure[] = [];
  highlightedRows: Record<number, boolean> = {};
  assigningStatus: Record<number, 'idle' | 'loading' | 'success' | 'error'> = {};

  selectedDate: Date | null = new Date();
  calendarOpenFor: 'global' | null = null;
  currentMonthKey = '';
  globalLoading = false;

  loading = false;
  page = 0;
  size = 30;
  totalPages = 0;
  visiblePageWindow = 5;

  isDateFilterActive = false;

  displayedColumns: string[] = [
    'activityId',
    'activityDateTime',
    'employeeCode',
    'employeeFullName',
    'procedureName',
    'procedureType',
    'actions'
  ];

  expandedRowId: number | null = null;

  constructor(private procedureService: ProcedureService) {}

  ngOnInit(): void {
    const today = new Date();
    this.selectedDate = today;
    const monthKey = this.procedureService.getMonthKey(today);
    this.currentMonthKey = monthKey;
    this.loading = true;

    this.procedureService.prefetchMonth(monthKey).subscribe(() => {
      this.filterByDate(today);
      this.loadMonthData(monthKey);

    });
  }

  getMonthKey(date: Date): string {
    return this.procedureService.getMonthKey(date);
  }

  loadMonthData(monthKey: string): void {
    this.globalLoading = true;
    this.loading = true;

    this.allProcedures = this.procedureService.getProceduresByMonth(monthKey);
    this.totalPages = this.getTotalPages();
    this.page = 0;
    this.updateDisplayedProcedures();
    this.currentMonthKey = monthKey;

    this.loading = false;
    this.globalLoading = false;
  }

  onDateSelected(date: Date): void {
    this.selectedDate = date;
    const newMonthKey = this.getMonthKey(date);
    this.calendarOpenFor = null;
    this.isDateFilterActive = true;
    this.page = 0;

    this.globalLoading = true;
    this.procedureService.fetchProceduresByDate(date, this.page, this.size).subscribe({
      next: response => {
        this.allProcedures = response.content;
        this.procedures = [...this.allProcedures];
        this.totalPages = response.totalPages;
        this.globalLoading = false;
      },
      error: err => {
        console.error('Error fetching procedures by date:', err);
        this.globalLoading = false;
      }
    });
  }

  filterByDate(date: Date): void {
    this.isDateFilterActive = true;
    this.page = 0;
    this.globalLoading = true;

    this.procedureService.fetchProceduresByDate(date, this.page, this.size).subscribe({
      next: response => {
        this.allProcedures = response.content;
        this.procedures = [...this.allProcedures];
        this.totalPages = response.totalPages;
        this.globalLoading = false;
      },
      error: err => {
        console.error('Error fetching procedures by date:', err);
        this.globalLoading = false;
      }
    });
  }


  clearDateFilter(): void {
    this.isDateFilterActive = false;
    this.selectedDate = null;
    this.calendarOpenFor = null;
    this.globalLoading = true;
    this.procedureService.clearCache();

    const pagesToPrefetch = 5;
    const requests: Observable<ProcedureResponse>[] = [];

    for (let page = 0; page < pagesToPrefetch; page++) {
      requests.push(this.procedureService.fetchProceduresWithoutFilter(page, this.size));
    }

    forkJoin(requests).subscribe({
      next: responses => {
        const allProcedures = responses.flatMap(response => response.content);
        this.size = responses[0].size;
        this.allProcedures = allProcedures;
        this.totalPages = responses[0].totalPages;
        this.page = 0;
        this.updateDisplayedProcedures();
      },
      error: err => console.error('Error fetching procedures without filter:', err),
      complete: () => {
        this.loading = false;
        this.globalLoading = false;
      }
    });
  }

  toggleCalendar(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.calendarOpenFor = this.calendarOpenFor ? null : 'global';
  }

  assignProcedure(activityId: number): void {
    this.assigningStatus[activityId] = 'loading';
    this.procedureService.assignToCurrentUser(activityId).subscribe({
      next: updated => {
        const item = this.procedures.find(p => p.activityId === activityId);
        if (item) {
          Object.assign(item, updated, { assignedToLoggedUser: true, hasHistory: true });
          this.flashHighlight(activityId);
        }
        this.assigningStatus[activityId] = 'success';
      },
      error: err => {
        this.assigningStatus[activityId] = 'error';
        console.error('Assignment error:', err);
      }
    });
  }

  restorePreviousAssignment(activityId: number): void {
    this.procedureService.restorePreviousAssignment(activityId).subscribe({
      next: updated => {
        const item = this.procedures.find(p => p.activityId === activityId);
        if (item) {
          Object.assign(item, updated, { assignedToLoggedUser: false, hasHistory: false });
          this.assigningStatus[activityId] = 'idle';
          this.flashHighlight(activityId);
        }
      },
      error: err => console.error('Restore error:', err)
    });
  }

  flashHighlight(activityId: number): void {
    this.highlightedRows[activityId] = true;
    setTimeout(() => (this.highlightedRows[activityId] = false), 1500);
  }

  getVisibleEmployees(element: Procedure): string[] {
    if (!element.employeesAssigned) return [];
    return this.isRowExpanded(element.activityId)
      ? element.employeesAssigned
      : element.employeesAssigned.slice(0, 2);
  }

  toggleEmployeeList(activityId: number): void {
    this.expandedRowId = this.expandedRowId === activityId ? null : activityId;
  }

  isRowExpanded(activityId: number): boolean {
    return this.expandedRowId === activityId;
  }

  isLastVisibleEmployee(element: Procedure, idx: number): boolean {
    const employees = this.getVisibleEmployees(element);
    return idx === employees.length - 1;
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

  castToNumber(value: number | string): number {
    return typeof value === 'number' ? value : 0;
  }

  prevPageRange(): void {
    if (this.page > 0) {
      this.page--;
      this.updateDisplayedProcedures();
    }
  }

  nextPageRange(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.updateDisplayedProcedures();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.allProcedures.length / this.size);
  }

  updateDisplayedProcedures(): void {
    if (this.isDateFilterActive && this.selectedDate) {
      this.globalLoading = true;

      this.procedureService.fetchProceduresByDate(this.selectedDate, this.page, this.size).subscribe({
        next: response => {
          this.allProcedures = response.content;
          this.procedures = [...this.allProcedures];
          this.totalPages = response.totalPages;
          this.globalLoading = false;
        },
        error: err => {
          console.error('Error fetching paginated procedures by date:', err);
          this.globalLoading = false;
        }
      });

      return;
    }

    const start = this.page * this.size;
    const end = start + this.size;

    if (this.allProcedures.length >= end) {
      this.procedures = this.allProcedures.slice(start, end);
      return;
    }

    this.fetchMissingProcedures(start, end);
  }

  private fetchMissingProcedures(start: number, end: number): void {
    this.globalLoading = true;

    const startPage = Math.floor(this.allProcedures.length / this.size);
    const neededPages = Math.ceil((end - this.allProcedures.length) / this.size);
    const requests: Observable<ProcedureResponse>[] = [];

    for (let page = startPage; page < startPage + neededPages; page++) {
      requests.push(this.procedureService.fetchProceduresWithoutFilter(page, this.size));
    }

    forkJoin(requests).subscribe({
      next: responses => {
        const newProcedures = responses.flatMap(r => r.content);
        this.allProcedures = [...this.allProcedures, ...newProcedures];
        this.procedures = this.allProcedures.slice(start, end);
      },
      error: err => console.error('Error fetching missing procedures:', err),
      complete: () => this.globalLoading = false
    });
  }

  goToPage(pageNumber: number): void {
    this.page = pageNumber;
    this.updateDisplayedProcedures();
  }
}
