import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-procedures-pagination',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './procedures-pagination.component.html',
  styleUrls: ['./procedures-pagination.component.css']
})
export class ProceduresPaginationComponent {
  @Input() page!: number;
  @Input() totalPages!: number;
  @Input() visiblePageWindow = 5;
  @Input() loading = false;

  @Output() prevPageRange = new EventEmitter<void>();
  @Output() nextPageRange = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();

  castToNumber(value: number | string): number {
    return typeof value === 'number' ? value : 0;
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
}
