import { Component, OnInit } from '@angular/core';
import { ProcedureService } from './procedure.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MiniCalendarComponent } from '../calendar/mini-calendar.component';

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
    MiniCalendarComponent
  ],
  providers: [ProcedureService],
  templateUrl: './procedures-list.component.html',
  styleUrls: ['./procedures-list.component.css']
})
export class ProceduresListComponent implements OnInit {
  procedures: any[] = [];
  allProcedures: any[] = [];
  highlightedRows: Record<number, boolean> = {};
  assigningStatus: Record<number, 'idle' | 'loading' | 'success' | 'error'> = {};

  selectedDate: Date | null = null;
  calendarOpenFor: number | 'global' | null = null;
  currentMonthKey = '';

  loading = false;
  page = 0;
  size = 30;
  totalPages = 0;
  visiblePageWindow = 5;

  displayedColumns: string[] = [
    'activityId', 'activityDateTime', 'employeeCode',
    'employeeFullName', 'procedureName', 'procedureType', 'actions'
  ];

  constructor(private procedureService: ProcedureService) {}

  ngOnInit() {
    const today = new Date();
    const monthKey = this.procedureService.getMonthKey(today);
    this.currentMonthKey = monthKey;
    this.loading = true;

    this.procedureService.prefetchSurroundingMonths(monthKey).subscribe(() => {
      this.loadMonthData(monthKey);
    });
  }

  getMonthKey(date: Date): string {
    return this.procedureService.getMonthKey(date);
  }

  loadMonthData(monthKey: string) {
    this.allProcedures = this.procedureService.getProceduresByMonth(monthKey);
    this.totalPages = this.getTotalPages();
    this.page = 0;
    this.updateDisplayedProcedures();
    this.currentMonthKey = monthKey;
    this.loading = false;
  }

  onDateSelected(date: Date) {
    this.selectedDate = date;
    const newMonthKey = this.getMonthKey(date);
    this.calendarOpenFor = null;

    if (newMonthKey !== this.currentMonthKey) {
      this.loading = true;
      this.procedureService.prefetchSurroundingMonths(newMonthKey).subscribe(() => {
        this.loadMonthData(newMonthKey);
        this.filterByDate(date);
      });
    } else {
      this.filterByDate(date);
    }
  }

  filterByDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = this.allProcedures.filter(p =>
      new Date(p.activityDate).toISOString().startsWith(dateStr)
    );
    this.procedures = filtered;
    this.totalPages = 1;
    this.page = 0;
  }

  clearDateFilter() {
    this.selectedDate = null;
    this.calendarOpenFor = null;
    this.totalPages = this.getTotalPages();
    this.page = 0;
    this.updateDisplayedProcedures();
  }

  toggleCalendar() {
    this.calendarOpenFor = this.calendarOpenFor ? null : 'global';
  }

  assignProcedure(activityId: number) {
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
        console.error(err);
      }
    });
  }

  restorePreviousAssignment(activityId: number) {
    this.procedureService.restorePreviousAssignment(activityId).subscribe({
      next: updated => {
        const item = this.procedures.find(p => p.activityId === activityId);
        if (item) {
          Object.assign(item, updated, { assignedToLoggedUser: false, hasHistory: false });
          this.assigningStatus[activityId] = 'idle';
          this.flashHighlight(activityId);
        }
      },
      error: err => console.error(err)
    });
  }

  flashHighlight(activityId: number) {
    this.highlightedRows[activityId] = true;
    setTimeout(() => this.highlightedRows[activityId] = false, 1500);
  }

  // Paginacja lokalna (tylko dla cache'owanej listy)
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
    const start = this.page * this.size;
    const end = start + this.size;
    this.procedures = this.allProcedures.slice(start, end);
  }
  goToPage(pageNumber: number): void {
    this.page = pageNumber;
    this.updateDisplayedProcedures();
  }
  
}
