import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FYP';
  sideNavstatus: boolean = true;
  visible:boolean = false;
  childValue: boolean = false;

  handleChildEvent(value: boolean) {
    this.childValue = value;
  }
}
