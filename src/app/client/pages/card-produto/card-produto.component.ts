import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardTitle, MatCardFooter } from '@angular/material/card';
import { Card } from '../../../core/models/card.model';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-card-produto',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardActions, MatCardContent, MatCardTitle, MatCardFooter, MatButton, MatIcon],
  templateUrl: './card-produto.component.html',
  styleUrl: './card-produto.component.css'
})
export class CardProdutoComponent {
  @Input() produto!: Card; // mesmo tipo usado no grid
  @Output() adicionar = new EventEmitter<Card>();

  onAdicionar() {
    this.adicionar.emit(this.produto);
  }
}
