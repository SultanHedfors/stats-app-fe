import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DateRangeDialogComponent } from './date-range-dialog.component';
import { environment } from '../../../envinronments/environment';


@Component({
  selector: 'app-export-button',
  standalone: true,
  templateUrl: './export-button.component.html',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    DateRangeDialogComponent,
],
  styleUrls: ['./export-button.component.css']
})
export class ExportButtonComponent {
  @Output() openDateRangeDialog = new EventEmitter<void>();
  isLoading = false;
  isDialogVisible = false;

  constructor(private http: HttpClient) {}

  openDialog(): void {
    this.isDialogVisible = true;
  }

  generateFile(from: string, to: string): void {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/api/stats-export/xlsx?from=${from}&to=${to}`, { responseType: 'blob' })
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
