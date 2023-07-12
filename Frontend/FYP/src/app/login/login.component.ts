import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private http: HttpClient, private router:Router) {
  }

  loginForm = new FormGroup({
    email: new FormControl("", [
      Validators.required,
      Validators.email
    ]),
    pwd: new FormControl("", [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20)
    ])
  });

  loginsubmitted(email: string, pass: string) {
    console.log(email, pass)
    let url = 'http://localhost:5000/login';
    let data = { 'email': email, 'password': pass };
    // let token:any = this.http.post(url,data);
    // console.log(token);
    let successfull_login: any;
    this.http.post(url, data).subscribe(
      (response: any) => {
        successfull_login = response;
        console.log(successfull_login);
        if (successfull_login['error']) {
          alert("Invalid Email or password")
        }
        else {
          let sessionUser = {
            'username': successfull_login['fullname'],
            'email': successfull_login['email'],
            'id': successfull_login['id'],
            'token': successfull_login['token']
          };
          sessionStorage.setItem('sessionUser', JSON.stringify(sessionUser));
          console.log(sessionUser)
          this.router.navigate(['/']);
        }

      },
      (error: any) => {
        console.log(error);
      }
    )
  }
  Testing() {
    let retrievedSessionUserString = sessionStorage.getItem('sessionUser');
    console.log(retrievedSessionUserString)
    if (retrievedSessionUserString !== null) {
      let retrievedSessionUser = JSON.parse(retrievedSessionUserString);
      console.log('saf', retrievedSessionUser?.username); // Output: example_username
      console.log(retrievedSessionUser?.email); // Output: example_email@example.com
      console.log(retrievedSessionUser?.id); // Output: male
      console.log(retrievedSessionUser?.token); // Output: example_token
    } else {
      console.log('sessionUser key not found in sessionStorage');
    }
  }
  get pwd(): FormControl {
    return this.loginForm.get("pwd") as FormControl;
  }
  get email(): FormControl {
    return this.loginForm.get("email") as FormControl;
  }
}
