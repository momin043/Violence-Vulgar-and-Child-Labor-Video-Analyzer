import { Component } from '@angular/core';
import { Input} from '@angular/core'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  @Input() navstatus: boolean=false;

  list = [  //The icon ahs been picked up from fontawesome
    {
      number: '1',
      name: 'Home',
      icon: 'fa-solid fa-house',
    },
    // {
    //   number: '2',
    //   name: 'Analytics',
    //   icon: 'fa-solid fa-chart-simple',
    // },
    // {
    //   number: '3',
    //   name: 'Awein',
    //   icon: 'fa-solid fa-tree',
    // },
  ]
}
