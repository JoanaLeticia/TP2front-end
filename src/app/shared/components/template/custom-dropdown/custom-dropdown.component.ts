import { Component, EventEmitter, Input, Output, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-custom-dropdown',
  imports: [],
  templateUrl: './custom-dropdown.component.html',
  styleUrl: './custom-dropdown.component.css'
})
export class CustomDropdownComponent {
  @Input() options: { value: string, label: string }[] = [];
  @Input() selectedValue: string = '';
  @Output() selectedValueChange = new EventEmitter<string>();

  isOpen = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  constructor(private elementRef: ElementRef) { }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(value: string) {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
    this.isOpen = false;
  }

  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.selectedValue);
    return selected ? selected.label : 'Ordenar por';
  }
}
