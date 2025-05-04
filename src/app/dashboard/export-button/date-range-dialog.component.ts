// date-range-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-date-range-dialog',
  templateUrl: './date-range-dialog.component.html',
  imports: [
    CommonModule,
    MatIconModule, // Importowanie modułu MatIcon
    MatButtonModule, // Importowanie modułu MatButton
    FormsModule,
],
  styleUrls: ['./date-range-dialog.component.css']
})
export class DateRangeDialogComponent {
openCalendar(arg0: string) {
throw new Error('Method not implemented.');
}
selectDate($event: Event) {
throw new Error('Method not implemented.');
}
closeCalendar() {
throw new Error('Method not implemented.');
}
  @Output() closeDialog = new EventEmitter<void>();
  @Output() generateFile = new EventEmitter<{ from: string, to: string }>();

  isDialogOpen = false;
  fromDate: string = '';
  toDate: string = '';
isCalendarOpen: any;

  ngOnInit() {
    this.isDialogOpen = true;  // Pokazuje okno dialogowe po załadowaniu komponentu
  }

  validateDates(): boolean {
    if (!this.fromDate || !this.toDate) {
      alert('Oba pola muszą być uzupełnione!');
      return false;
    }
    if (new Date(this.fromDate) > new Date(this.toDate)) {
      alert('Data "DO" musi być późniejsza niż data "OD"!');
      return false;
    }
    return true;
  }

  onGenerate(): void {
    if (this.validateDates()) {
      this.generateFile.emit({ from: this.fromDate, to: this.toDate });
    }
  }

  close(): void {
    this.isDialogOpen = false;  // Zamknięcie okna dialogowego
    this.closeDialog.emit();
  }
}
