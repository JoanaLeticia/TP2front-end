import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navside',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './navside.component.html',
  styleUrl: './navside.component.css'
})
export class NavsideComponent {
  isSubmenuOpen: boolean[] = [false, false, false, false, false];

  constructor(private router: Router) { }
  logHome() {
    this.router.navigate(['/adm/home']);
  }

  toggleSubmenu(index: number) {
    this.isSubmenuOpen[index] = !this.isSubmenuOpen[index];
    this.closeOtherSubmenus(index);
  }

  closeOtherSubmenus(index: number) {
    for (let i = 0; i < this.isSubmenuOpen.length; i++) {
      if (i !== index) {
        this.isSubmenuOpen[i] = false;
      }
    }
  }
}