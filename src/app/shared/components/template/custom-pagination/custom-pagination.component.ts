import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.css']
})
export class CustomPaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() maxVisiblePages: number = 7;
  @Output() pageChange = new EventEmitter<number>();

  range(start: number, end: number): number[] {
    return Array.from({length: (end - start + 1)}, (_, i) => start + i);
  }

  getVisiblePageRange(): number[] {
    const start = Math.max(3, this.currentPage - 1);
    const end = Math.min(this.currentPage + 1, this.totalPages - 2);
    return this.range(start, end);
  }

  getVisiblePageStart(defaultStart: number): number {
    return Math.max(3, defaultStart);
  }

  getVisiblePageEnd(defaultEnd: number): number {
    return Math.min(defaultEnd, this.totalPages - 2);
  }

  shouldShowStartEllipsis(): boolean {
    return this.currentPage - 2 > 2;
  }

  shouldShowEndEllipsis(): boolean {
    return this.currentPage + 2 < this.totalPages - 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToFirst(): void {
    this.goToPage(1);
  }

  goToLast(): void {
    this.goToPage(this.totalPages);
  }

  goToPrev(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNext(): void {
    this.goToPage(this.currentPage + 1);
  }
}