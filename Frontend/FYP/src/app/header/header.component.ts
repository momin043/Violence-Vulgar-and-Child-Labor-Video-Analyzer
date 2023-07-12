import { Component } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { LoginboxService } from '../loginbox.service';
// import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
// declare var user_name:any;
export class HeaderComponent {
  @Output() sideNavToggled = new EventEmitter<boolean>();
  menustatus: boolean = false;
  btnlogin:any;

  ngOnInit(){
    // let loginbtn = document.getElementById('btnlogin') as HTMLButtonElement;
    let retrievedSessionUserString = sessionStorage.getItem('sessionUser');
    if (retrievedSessionUserString){
      let retrievedSessionUser = JSON.parse(retrievedSessionUserString);
      this.btnlogin=retrievedSessionUser?.username;
      }
    else{
      this.btnlogin = "Login"
    }
    // loginbtn.value = "Login"
  }
  SideNavToggle() {
    this.menustatus = !this.menustatus;
    this.sideNavToggled.emit(this.menustatus);
  }

  getname() {
    var user_name = document.getElementById("btnlogin");
    alert(user_name)
  }

  buttonTitle: string = "Hide";
  // visible:boolean = true;
  //   showhideUtility(){
  //     this.visible = this.visible?false:true;
  //     this.buttonTitle = this.visible?"Hide":"Show";
  //  }

  // @Output() childEvent = new EventEmitter<boolean>();

  // value: boolean = false;

  // handleButtonClick() {
  //   this.value = !this.value;
  //   this.childEvent.emit(this.value);
  // }

  logout(){
    sessionStorage.removeItem('sessionUser')
    alert("The user has been successfully logged out!")
  }
  constructor(private value: LoginboxService) { }

  message: string = "";
  sendMessage(): void {
    alert(this.value.getBooleanValue())
    this.value.setBooleanValue(!this.value.getBooleanValue());
    alert(this.value.getBooleanValue())
  }

}
