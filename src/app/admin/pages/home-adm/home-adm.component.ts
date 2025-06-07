import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { NavsideComponent } from "../../components/navside/navside.component";

@Component({
  selector: 'app-home-adm',
  imports: [HeaderComponent, NavsideComponent],
  templateUrl: './home-adm.component.html',
  styleUrl: './home-adm.component.css'
})
export class HomeAdmComponent {

}
