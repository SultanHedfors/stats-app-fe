import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-procedures-list',
  templateUrl: './procedures-list.component.html',
  imports: [MatListModule,CommonModule]
})
export class ProceduresListComponent implements OnInit {
  procedures: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('https://your-backend.com/api/procedures')
      .subscribe(data => this.procedures = data);
  }
}
