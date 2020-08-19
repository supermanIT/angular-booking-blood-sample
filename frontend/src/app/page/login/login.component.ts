import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';
import {AuthService} from '../../service/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  error;
  constructor(
    public formBuilder: FormBuilder,
    public router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, Validators.compose([
        Validators.required,
        Validators.email
      ])],
      password: [null, Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  login = () => {
    if (this.loginForm.valid) {
      console.log('login');
      this.authService.login(this.f.email.value.toLowerCase(), this.f.password.value).pipe(first()).subscribe(
        res => {
          this.f.password.setValue(null);
          this.router.navigate(['/dashboard']);
        },
        error => {
          this.error = error.error.message;
        }
      );
    }
  }

}
