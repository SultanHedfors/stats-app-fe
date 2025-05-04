// export-button.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  imports: [
    CommonModule,
    MatIconModule,  // Importowanie modułu MatIcon
    MatButtonModule, // Importowanie modułu MatButton
    FormsModule, // Importowanie FormsModule dla ngModel
  ],
  styleUrls: ['./export-button.component.css']
})
export class ExportButtonComponent {
  @Output() openDateRangeDialog = new EventEmitter<void>();
  isLoading = false;

  constructor(private http: HttpClient) {}

  openDialog(): void {
    this.openDateRangeDialog.emit();
  }

  generateFile(from: string, to: string): void {
    this.isLoading = true;
    this.http.get(`/api/stats-export/xlsx?from=${from}&to=${to}`, { responseType: 'blob' })
      .subscribe(
        (response: Blob) => {
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(response);
          a.href = url;
          a.download = 'statystyki.xlsx';
          a.click();
          this.isLoading = false;
        },
        (error) => {
          alert('Błąd pobierania pliku.');
          this.isLoading = false;
        }
      );
  }
}
