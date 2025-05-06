import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-upload-schedule',
  standalone: true,
  templateUrl: './upload-schedule.component.html',
  styleUrls: ['./upload-schedule.component.css'],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule]
})
export class UploadScheduleComponent {
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploading = false;
  errorMessage = '';
  successMessage = '';
  isDragging = false; // Dodajemy zmienną do śledzenia stanu przeciągania pliku
  globalLoading = false; // Dodajemy zmienną do zarządzania stanem globalnego ładowania
  isLoading = false; // Dodajemy zmienną do zarządzania stanem lokalnego ładowania

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.validateAndSetFile(file);
  }

  onFileDropped(file: File): void {
    this.validateAndSetFile(file);
  }

  private validateAndSetFile(file: File): void {
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // Niektóre przeglądarki mogą raportować xlsx jako octet-stream
    ];

    if (!validMimeTypes.includes(file.type) && !file.name.endsWith('.xlsx')) {
      this.errorMessage = 'Dozwolony jest tylko plik .xlsx';
      this.selectedFile = null;
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.uploading = true;
    this.uploadProgress = 0;

    this.isLoading = true;
    this.globalLoading = true;

    this.http.post('http://localhost:8080/api/upload-schedule', formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'json'
    })
    .subscribe({
      next: (event: any) => {
        if (event.type === 1 && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === 4) {
          this.successMessage = 'Plik został pomyślnie przesłany!';
          this.selectedFile = null;
          this.uploadProgress = 100;
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Nieznany błąd';
        this.errorMessage = `${errorMessage}`;
        this.uploading = false;
        this.globalLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.globalLoading = false;
        this.backendProcessComplete(); // Dodatkowe zakończenie procesu
      }
    });
  }

  private backendProcessComplete(): void {
    // Zmiana stanu spinnera i komunikatów
    this.uploading = false;
    this.successMessage = 'Przetwarzanie zakończone!';
    this.errorMessage = '';
    // Możliwe, że należy tu dodać kod do wyświetlania bardziej szczegółowych informacji o zakończeniu procesu
  }

  // Przycisk "Przerwij przetwarzanie" -> wywołanie API do anulowania
  cancelProcessing(): void {
    this.http.post('http://localhost:8080/api/cancel-processing', {})
      .subscribe({
        next: () => {
          this.uploading = false; // Ustawiamy stan na nieaktywny po anulowaniu
          this.successMessage = 'Przetwarzanie zostało anulowane.';
        },
        error: (error) => {
          this.errorMessage = 'Błąd podczas anulowania przetwarzania.';
        }
      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true; // Ustawiamy isDragging na true, gdy plik jest nad strefą
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false; // Ustawiamy isDragging na false, gdy plik opuszcza strefę
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false; // Ustawiamy isDragging na false po upuszczeniu pliku
    if (event.dataTransfer?.files.length) {
      this.onFileDropped(event.dataTransfer.files[0]);
    }
  }
}
