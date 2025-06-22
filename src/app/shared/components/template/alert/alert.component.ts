import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit{
  @Input() message!: string;
  @Input() duration: number = 2000; // Default duration

  private _destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this._destroy$.next();
    }, this.duration);
  }

  ngOnDestroy() {
    this._destroy$.complete();
  }
}