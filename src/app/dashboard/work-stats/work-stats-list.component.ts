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
  rawDate: string;    
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
  statistics: StatisticsDto[] = [];
  isLoading = true;
  error: string | null = null;
  currentTab: string = 'daily'; 
  currentPage: number = 0; 
  dailyDates: string[] = [];
  weeklyDates: string[] = [];
  monthlyDates: string[] = [];
  yearlyDates: string[] = [];
  daysPerPage: number = 7;  
  weeksPerPage: number = 7;
  monthsPerPage: number = 6;
  yearsPerPage: number = 5;
  totalDailyPages: number = 0; 
  totalWeeklyPages: number = 0;
  totalMonthlyPages: number = 0;
  totalYearlyPages: number = 0;
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
            dailyStats: employee.dailyStats.map((stat: DailyStat) => ({
              ...stat,
              rawDate: stat.date,
              date: this.formatDate(stat.date),
              score: (stat.score * 100).toFixed(1),
            })),
            weeklyStats: employee.weeklyStats.map((stat: WeeklyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
            monthlyStats: employee.monthlyStats.map((stat: MonthlyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
            yearlyStats: employee.yearlyStats.map((stat: YearlyStat) => ({
              ...stat,
              score: (stat.score * 100).toFixed(1),
            })),
          }));
          this.setPage(0);
          this.isLoading = false;
        } else {
          console.error("Odpowiedź z backendu nie zawiera tablicy 'employees'");
        }
      },
      error: () => {
        this.error = 'Wystąpił błąd podczas pobierania danych.';
        this.isLoading = false;
      }
    });
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  generateDateRange(dates: string[], page: number, perPage: number): string[] {
    const unique = [...new Set(dates)];
    const startIndex = page * perPage;
    return unique.slice(startIndex, startIndex + perPage);
  }

  setPage(page: number): void {
    this.currentPage = page;

    if (this.currentTab === 'daily') {
      const allRawDailyDates = this.statistics.flatMap(stat => stat.dailyStats.map(ds => ds.rawDate));
      const uniqueSortedDates = [...new Set(allRawDailyDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      this.dailyDates = this.generateDateRange(uniqueSortedDates, this.currentPage, this.daysPerPage).map(d => this.formatDate(d));
      this.totalDailyPages = Math.ceil(uniqueSortedDates.length / this.daysPerPage);

    } else if (this.currentTab === 'weekly') {
      const allWeeklyDates = this.statistics.flatMap(stat => stat.weeklyStats.map(ws => ws.weekStart));
      const uniqueSortedWeeks = [...new Set(allWeeklyDates)].sort().reverse();
      this.weeklyDates = this.generateDateRange(uniqueSortedWeeks, this.currentPage, this.weeksPerPage);
      this.totalWeeklyPages = Math.ceil(uniqueSortedWeeks.length / this.weeksPerPage);

    } else if (this.currentTab === 'monthly') {
      const allMonthlyDates = this.statistics.flatMap(stat => stat.monthlyStats.map(ms => ms.month));
      const uniqueSortedMonths = [...new Set(allMonthlyDates)].sort().reverse();
      this.monthlyDates = this.generateDateRange(uniqueSortedMonths, this.currentPage, this.monthsPerPage);
      this.totalMonthlyPages = Math.ceil(uniqueSortedMonths.length / this.monthsPerPage);

    } else if (this.currentTab === 'yearly') {
      const allYearlyDates = this.statistics.flatMap(stat => stat.yearlyStats.map(ys => ys.year.toString()));
      const uniqueSortedYears = [...new Set(allYearlyDates)].sort((a, b) => parseInt(b) - parseInt(a));
      this.yearlyDates = this.generateDateRange(uniqueSortedYears, this.currentPage, this.yearsPerPage);
      this.totalYearlyPages = Math.ceil(uniqueSortedYears.length / this.yearsPerPage);
    }
  }

  prevPageRange(): void {
    if (this.currentPage > 0) {
      this.setPage(this.currentPage - 1);
    }
  }

  nextPageRange(): void {
    const lastPage =
      this.currentTab === 'daily' ? this.totalDailyPages :
      this.currentTab === 'weekly' ? this.totalWeeklyPages :
      this.currentTab === 'monthly' ? this.totalMonthlyPages :
      this.currentTab === 'yearly' ? this.totalYearlyPages : 0;

    if (this.currentPage < lastPage - 1) {
      this.setPage(this.currentPage + 1);
    }
  }

  setTab(tab: string): void {
    this.currentTab = tab;
    this.setPage(0);
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
  getYearlyStatsForDate(employee: StatisticsDto, year: string): string {
    const numericYear = parseInt(year, 10);
    const stat = employee.yearlyStats.find(y => y.year === numericYear);
    return stat ? `${stat.score} %` : '-';
  }

  openDateRangeDialog(): void {
    this.isDateRangeDialogOpen = true;
  }

  closeDateRangeDialog(): void {
    this.isDateRangeDialogOpen = false;
  }

  generateFile(arg0: any,arg1: any) {
    throw new Error('Method not implemented.');
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
        statValues = stat.dailyStats
          .filter(ds => this.dailyDates.includes(ds.date))
          .map(ds => parseFloat(ds.score as any))
          .filter(score => !isNaN(score));

      } else if (tab === 'weekly') {
        statValues = stat.weeklyStats
          .filter(ws => this.weeklyDates.includes(ws.weekStart))
          .map(ws => parseFloat(ws.score as any))
          .filter(score => !isNaN(score));

      } else if (tab === 'monthly') {
        statValues = stat.monthlyStats
          .filter(ms => this.monthlyDates.includes(ms.month))
          .map(ms => parseFloat(ms.score as any))
          .filter(score => !isNaN(score));

      } else if (tab === 'yearly') {
        statValues = stat.yearlyStats
          .filter(ys => this.yearlyDates.includes(ys.year.toString()))
          .map(ys => parseFloat(ys.score as any))
          .filter(score => !isNaN(score));
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
    const numericYear = parseInt(year, 10);

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