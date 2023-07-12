import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private http: HttpClient, private router:Router) {
  }
  repeatpass: string = "none";

  registerform = new FormGroup({
    firstname: new FormControl("", [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern("[a-zA-Z].*")
    ]),
    lastname: new FormControl("", [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern("[a-zA-Z].*")
    ]),
    email: new FormControl("", [
      Validators.required,
      Validators.email
    ]),
    mobile: new FormControl("", [
      Validators.required,
      Validators.pattern("[0-9]*"),
      Validators.minLength(10),
      Validators.maxLength(11)
    ]),
    gender: new FormControl("", [
      Validators.required
    ]),
    pwd: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20)
    ]),
    rpwd: new FormControl("")
  });

  registersubmitted() {
    if (this.pwd.value == this.rpwd.value) {
      console.log("Submitted");
      this.repeatpass = "none";
      let url = 'http://localhost:5000/register';
      let fname = this.FirstName.value
      let lname = this.LastName.value
      let email = this.Email.value
      let contact = this.Mobile.value
      let password = this.pwd.value
      let gender = this.Gender.value
      let data = {
        'fname': fname,
        'lname': lname,
        'gender': gender,
        'email': email,
        'password': password,
        'contact': contact
    }
    console.log('DATA: ',data)
    // let successfull_login: any;
    this.http.post(url, data).subscribe(
      (response: any) => {
        if (response['error']) {
          console.log()
          alert(response['error'])
        }
        else {
          alert("Successfully created Account! Redirecting you to login page!")
          this.router.navigate(['/login']);
        }

      },
      (error: any) => {
        console.log(error);
      }
    )

    }
    else {
      this.repeatpass = 'inline'
    }

  }

  get FirstName(): FormControl {
    return this.registerform.get("firstname") as FormControl;
  }
  get LastName(): FormControl {
    return this.registerform.get("lastname") as FormControl;
  }
  get Email(): FormControl {
    return this.registerform.get("email") as FormControl;
  }
  get Mobile(): FormControl {
    return this.registerform.get("mobile") as FormControl;
  }
  get Gender(): FormControl {
    return this.registerform.get("gender") as FormControl;
  }
  get pwd(): FormControl {
    return this.registerform.get("pwd") as FormControl;
  }
  get rpwd(): FormControl {
    return this.registerform.get("rpwd") as FormControl;
  }

}
