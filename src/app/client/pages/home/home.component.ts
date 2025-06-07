import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../../../shared/components/template/footer/footer.component';
import { HeaderComponent } from '../../../shared/components/template/header/header.component';
import { GridProdutosComponent } from '../grid-produtos/grid-produtos.component';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, GridProdutosComponent, CommonModule, SlickCarouselModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  constructor() {}

  ngOnInit(): void {}

  myImages = [
    {src: '../../../../assets/banner-forza.png'},
    {src: '../../../../assets/banner-shadows.png'},
    {src: '../../../../assets/banner-expresso.png'},
  ]

  myConfig = {
      "slidesToShow": 1,
      "slidesToScroll": 1,
      "autoplay": true,
      "arrows": true,
      "dots": true,
      "infinite": true,
      "prevArrow": '<button type="button" class="slick-prev-custom"><i class="fas fa-chevron-left"></i></button>',
      "nextArrow": '<button type="button" class="slick-next-custom"><i class="fas fa-chevron-right"></i></button>'
  }
}