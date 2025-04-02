import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mini-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './mini-calendar.component.html',
  styleUrls: ['./mini-calendar.component.css']
})
export class MiniCalendarComponent implements OnChanges {
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() closeCalendar = new EventEmitter<void>();
  @Input() selectedDate: Date | null = null;

  today = new Date();
  currentMonth: number = this.today.getMonth();
  currentYear: number = this.today.getFullYear();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.currentMonth = this.selectedDate.getMonth();
      this.currentYear = this.selectedDate.getFullYear();
    }
  }

  daysInMonth(): number[] {
    const date = new Date(this.currentYear, this.currentMonth + 1, 0);
    return Array.from({ length: date.getDate() }, (_, i) => i + 1);
  }

  isToday(day: number): boolean {
    return (
      day === this.today.getDate() &&
      this.currentMonth === this.today.getMonth() &&
      this.currentYear === this.today.getFullYear()
    );
  }

  isSelected(day: number): boolean {
    return !!this.selectedDate &&
      day === this.selectedDate.getDate() &&
      this.currentMonth === this.selectedDate.getMonth() &&
      this.currentYear === this.selectedDate.getFullYear();
  }

  selectDay(day: number) {
    const selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.dateSelected.emit(selectedDate);
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  getMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }
}
