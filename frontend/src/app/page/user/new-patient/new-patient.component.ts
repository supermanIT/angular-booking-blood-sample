import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../service/http/http.service';
import {AuthService} from '../../../service/auth/auth.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MustMatch} from '../../../shared/confirm-password.validator';
import {URL_JSON} from '../../../utils/url_json';

@Component({
  selector: 'app-new-patient',
  templateUrl: './new-patient.component.html',
  styleUrls: ['./new-patient.component.scss']
})
export class NewPatientComponent implements OnInit {

  patientForm: FormGroup;
  phoneNumberPattern = '^((\\+91-?)|0)?[0-9]{10}$';
  genders = [
    {label: 'Female', value: 'Weiblich'},
    {label: 'Male', value: 'Männlich'},
    {label: 'Divers', value: 'Divers'},
  ];
  patientData: any;

  constructor(
    public formBuilder: FormBuilder,
    public httpService: HttpService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.httpService.get(URL_JSON.USER + '/get/patient/' + this.data.id).subscribe((res: any) => {
        this.patientData = res;
      });
    }
    this.patientForm = this.formBuilder.group({
      email: [this.data?.email, [Validators.required, Validators.email]],
      phoneNumber: [this.data?.phoneNumber, [Validators.required, Validators.pattern(this.phoneNumberPattern)]],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
      firstName: [this.data?.firstName, Validators.required],
      lastName: [this.data?.lastName, Validators.required],
      salutation: [this.data?.salutation, Validators.required],
      street: [this.data?.street, Validators.required],
      age: [this.data?.age, Validators.required],
      gender: [this.data?.gender, Validators.required],
      plz: [this.data?.plz, Validators.required],
      ort: [this.data?.ort, Validators.required],
      differentPlace: [this.data?.differentPlace, Validators.required],
      customerStore: [this.data?.customerStore, Validators.required],
      alternative: [this.data?.alternative, Validators.required],
      sendSMS: [this.data?.sendSMS, Validators.required],
      otherStreet: [this.data?.otherStreet],
      otherPostalCode: [this.data?.otherPostalCode],
      otherCity: [this.data?.otherCity]
    }, {
      validators: MustMatch('password', 'confirmPassword')
    });
    if (this.f.differentPlace.value) {
      this.f.otherStreet.setValidators([Validators.required]);
      this.f.otherPostalCode.setValidators([Validators.required]);
      this.f.otherCity.setValidators([Validators.required]);
      this.f.otherStreet.updateValueAndValidity();
      this.f.otherPostalCode.updateValueAndValidity();
      this.f.otherCity.updateValueAndValidity();
    }
  }

  get f(): any {
    return this.patientForm.controls;
  }

  generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    this.f.password.setValue(password);
    this.f.confirmPassword.setValue(password);
  }

  close = () => {
    this.dialogRef.close();
  }

  changeCheckboxValue = (item) => {
    this.f[item].setValue(!this.f[item].value);
    if (item === 'differentPlace') {
      if (this.f[item].value) {
        this.f.otherStreet.setValidators([Validators.required]);
        this.f.otherPostalCode.setValidators([Validators.required]);
        this.f.otherCity.setValidators([Validators.required]);
      } else {
        this.f.otherStreet.setValidators(null);
        this.f.otherPostalCode.setValidators(null);
        this.f.otherCity.setValidators(null);
      }
      this.f.otherStreet.updateValueAndValidity();
      this.f.otherPostalCode.updateValueAndValidity();
      this.f.otherCity.updateValueAndValidity();
    }
  }

  createPatient = () => {
    if (this.patientForm.invalid) {
      return;
    }

    const data = {
      email: this.f.email.value,
      phoneNumber: this.f.phoneNumber.value,
      password: this.f.password.value,
      firstName: this.f.firstName.value,
      lastName: this.f.lastName.value,
      salutation: this.f.salutation.value,
      street: this.f.street.value,
      age: this.f.age.value,
      gender: this.f.gender.value,
      plz: this.f.plz.value,
      ort: this.f.ort.value,
      differentPlace: this.f.differentPlace.value,
      customerStore: this.f.customerStore.value,
      alternative: this.f.alternative.value,
      sendSMS: this.f.sendSMS.value,
      otherStreet: this.f.otherStreet.value,
      otherCity: this.f.otherCity.value,
      otherPostalCode: this.f.otherPostalCode.value
    };
    if (this.data) {
      this.httpService.update(URL_JSON.USER + '/update/patient/' + this.data.user_id, data).subscribe((res: any) => {
        res.id = this.data.user_id;
        this.dialogRef.close(res);
      });
    } else {
      this.httpService.create(URL_JSON.USER + '/patient', data).subscribe(res => {
        this.dialogRef.close(res);
      });
    }
  }
}
