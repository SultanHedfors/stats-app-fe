import { Component, OnInit } from '@angular/core';
import { StatisticsService } from './work-stats-list.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; 
import { MatButtonModule } from '@angular/material/button';
import { ExportButtonComponent } from "../export-button/export-button.component";
import { DateRangeDialogComponent } from "../export-button/date-range-dialog.component";  

interface DailyStat {
  date: string;
  score: number;
  updatedAt: string | null;
}

interface WeeklyStat {
  weekStart: string;
  score: number;
  updatedAt: string | null;
}

interface MonthlyStat {
  month: string;
  score: number;
  updatedAt: string | null;
}

interface YearlyStat {
  year: number;
  score: number;
  updatedAt: string | null;
}

interface StatisticsDto {
  employeeCode: string;
  dailyStats: DailyStat[];
  weeklyStats: WeeklyStat[];
  monthlyStats: MonthlyStat[];
  yearlyStats: YearlyStat[];
  currentUser: boolean;
}


@Component({
  selector: 'app-work-stats',
  templateUrl: './work-stats-list.component.html',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ExportButtonComponent,
    DateRangeDialogComponent
],
  styleUrls: ['./work-stats-list.component.css']
})
export class WorkStatsListComponent implements OnInit {
generateFile(arg0: any,arg1: any) {
throw new Error('Method not implemented.');
}
  statistics: StatisticsDto[] = [];
  isLoading = true;
  error: string | null = null;
  currentTab: string = 'daily'; 
  currentPage: number = 0; 
  dailyDates: string[] = [];
  weeklyDates: string[] = [];
  monthlyDates: string[] = [];
  yearlyDates: number[] = [];
  daysPerPage: number = 7;  
  totalDailyPages: number = 0; 
  globalLoading: boolean = false; 
  loading: boolean = false; 
  isDateRangeDialogOpen: boolean=false;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.statisticsService.getStatistics().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.employees)) {
          this.statistics = data.employees.map((employee: StatisticsDto) => ({
            ...employee,
            // Przetwarzanie dailyStats
            dailyStats: employee.dailyStats.map((stat: DailyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),  // Zamiana na procenty
              date: this.formatDate(stat.date),  // Formatowanie daty
            })),
            // Przetwarzanie weeklyStats
            weeklyStats: employee.weeklyStats.map((stat: WeeklyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
            // Przetwarzanie monthlyStats
            monthlyStats: employee.monthlyStats.map((stat: MonthlyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
            // Przetwarzanie yearlyStats
            yearlyStats: employee.yearlyStats.map((stat: YearlyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
          }));
  
          // Generowanie daty dla paginacji (dziennych statystyk)
          const allDailyStats = this.statistics.flatMap(stat => stat.dailyStats.map(ds => ds.date));
          this.dailyDates = [...new Set(allDailyStats)];  // Usuwanie duplikatów
          console.log('Generated dailyDates:', this.dailyDates); // Logowanie danych
  
          // Generowanie zakresu dat dla paginacji
          this.dailyDates = this.generateDateRange(allDailyStats, this.currentPage);
  
          // Collect all unique weekly stats dates
          const allWeeklyStats = this.statistics.flatMap(stat => stat.weeklyStats.map(ws => ws.weekStart));
          this.weeklyDates = [...new Set(allWeeklyStats)];  // Usuwanie duplikatów
  
          // Collect all unique monthly stats dates
          const allMonthlyStats = this.statistics.flatMap(stat => stat.monthlyStats.map(ms => ms.month));
          this.monthlyDates = [...new Set(allMonthlyStats)];
  
          // Collect all unique yearly stats dates
          const allYearlyStats = this.statistics.flatMap(stat => stat.yearlyStats.map(ys => ys.year));
          this.yearlyDates = [...new Set(allYearlyStats)];
  
          this.isLoading = false;
        } else {
          console.error("Odpowiedź z backendu nie zawiera tablicy 'employees'");
        }
      },
      error: (err) => {
        this.error = 'Wystąpił błąd podczas pobierania danych.';
        this.isLoading = false;
      }
    });
  }
  
  
  
  
  
  

  // Format the date
  formatDate(date: string): string {
    const day = new Date(date);
    const dayOfWeek = day.toLocaleDateString('pl-PL', { weekday: 'short' });
    const dayOfMonth = day.getDate().toString().padStart(2, '0');
    const month = (day.getMonth() + 1).toString().padStart(2, '0');
    return `${dayOfMonth}.${month} (${dayOfWeek})`; 
  }

  // Generate date range for pagination
// Generate date range for pagination without repeating dates
// Generate date range for pagination without repeating dates
generateDateRange(dates: string[], page: number): string[] {
  // Remove duplicates by creating a Set, then convert it back to an array
  const uniqueDates = [...new Set(dates)];

  // Make sure we are slicing the array correctly based on the page number
  const startIndex = page * this.daysPerPage;
  const endIndex = startIndex + this.daysPerPage;

  // Return the sliced range of dates for the current page
  return uniqueDates.slice(startIndex, endIndex);
}



  // Change page for daily stats
  setPage(page: number): void {
    this.currentPage = page;
    const allDailyStats = this.statistics.flatMap(stat => stat.dailyStats.map(ds => ds.date));
    this.dailyDates = this.generateDateRange(allDailyStats, this.currentPage);
  }

  setTab(tab: string): void {
    this.currentTab = tab;
  }

  getDailyStatsForDate(employee: StatisticsDto, date: string): string {
    const stat = employee.dailyStats.find(d => d.date === date);
    return stat ? `${stat.score} %` : '-';
  }

  getWeeklyStatsForDate(employee: StatisticsDto, weekStart: string): string {
    const stat = employee.weeklyStats.find(w => w.weekStart === weekStart);
    return stat ? `${stat.score} %` : '-';
  }
  
  getMonthlyStatsForDate(employee: StatisticsDto, month: string): string {
    const stat = employee.monthlyStats.find(m => m.month === month);
    return stat ? `${stat.score} %` : '-';
  }
  
  getYearlyStatsForDate(employee: StatisticsDto, year: number): string {
    const stat = employee.yearlyStats.find(y => y.year === year);
    return stat ? `${stat.score} %` : '-';
  }
  

  prevPageRange(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.setPage(this.currentPage);
    }
  }

  nextPageRange(): void {
    if (this.currentPage < this.totalDailyPages - 1) {
      this.currentPage++;
      this.setPage(this.currentPage);
    }
  }

  // Otwórz okno dialogowe
openDateRangeDialog(): void {
  this.isDateRangeDialogOpen = true;  // Ustawiamy na true, aby dialog był widoczny
}

// Zamknij okno dialogowe
closeDateRangeDialog(): void {
  this.isDateRangeDialogOpen = false;  // Ustawiamy na false, aby dialog był zamknięty
}

calculateDailyAverage(date: string): string {
  const validScores = this.statistics
    .map(stat => {
      const statForDate = stat.dailyStats.find(d => d.date === date);
      return statForDate ? parseFloat(statForDate.score as any) : NaN;
    })
    .filter(score => !isNaN(score));

  if (validScores.length === 0) return '-';

  const sum = validScores.reduce((acc, score) => acc + score, 0);
  const average = sum / validScores.length;

  return average.toFixed(1);
}

calculateOverallAverage(tab: string): string {
  let allValidScores: number[] = [];

  this.statistics.forEach(stat => {
    let statValues: number[] = [];

    if (tab === 'daily') {
      statValues = stat.dailyStats.map(ds => parseFloat(ds.score as any)).filter(score => !isNaN(score));
    } else if (tab === 'weekly') {
      statValues = stat.weeklyStats.map(ws => parseFloat(ws.score as any)).filter(score => !isNaN(score));
    } else if (tab === 'monthly') {
      statValues = stat.monthlyStats.map(ms => parseFloat(ms.score as any)).filter(score => !isNaN(score));
    } else if (tab === 'yearly') {
      statValues = stat.yearlyStats.map(ys => parseFloat(ys.score as any)).filter(score => !isNaN(score));
    }

    allValidScores = allValidScores.concat(statValues);
  });

  if (allValidScores.length === 0) return '-';

  const sum = allValidScores.reduce((acc, score) => acc + score, 0);
  const average = sum / allValidScores.length;

  return average.toFixed(1);
}

calculateWeeklyAverage(week: string): string {
  const validScores = this.statistics
    .map(stat => {
      const statForWeek = stat.weeklyStats.find(w => w.weekStart === week);
      return statForWeek ? parseFloat(statForWeek.score as any) : NaN;
    })
    .filter(score => !isNaN(score));

  if (validScores.length === 0) return '-';

  const average = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  return average.toFixed(1);
}

calculateMonthlyAverage(month: string): string {
  const validScores = this.statistics
    .map(stat => {
      const statForMonth = stat.monthlyStats.find(m => m.month === month);
      return statForMonth ? parseFloat(statForMonth.score as any) : NaN;
    })
    .filter(score => !isNaN(score));

  if (validScores.length === 0) return '-';

  const average = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  return average.toFixed(1);
}

calculateYearlyAverage(year: string): string {
  const numericYear = parseInt(year, 10);  // przekształcenie na liczbę

  const validScores = this.statistics
    .map(stat => {
      const statForYear = stat.yearlyStats.find(y => y.year === numericYear);
      return statForYear ? parseFloat(statForYear.score as any) : NaN;
    })
    .filter(score => !isNaN(score));

  if (validScores.length === 0) return '-';

  const average = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;
  return average.toFixed(1);
}


}
