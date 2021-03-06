import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';

import {HttpService} from '../../../service/http/http.service';
import {URL_JSON} from '../../../utils/url_json';
import {MustMatch} from '../../../shared/confirm-password.validator';
import {AuthService} from '../../../service/auth/auth.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {
  isAppointmentPopup = false;
  isPatientPopup = false;
  selectedAgency = null;
  selectedPackage = null;
  selectedTime = null;
  agencies = [];
  packages = [];
  allTimes = [];
  randomTimes = [];
  appointmentForm: FormGroup;
  patientForm: FormGroup;
  public patientSearchControl = new FormControl();
  allPatient = [];
  allPatient$ = [];
  selectedPTime = null;
  // allAppointment = [];
  paymentSelectionError = false;
  currentUser: any;
  availableModel = [];
  constructor(
    public formBuilder: FormBuilder,
    public httpService: HttpService,
    public authService: AuthService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'time-icon',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/time.svg')
    );
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.appointmentForm = this.formBuilder.group({
      name: [this.data?.name, Validators.required],
      patient: [null, Validators.required]
    });
    this.patientForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      phoneNumber: [null, [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{11,13}$')]],
      password: [null, Validators.required],
      confirmPassword: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      street: [null, Validators.required],
      plz: [null, Validators.required],
      ort: [null, Validators.required],
      salutation: [null, Validators.required],
      age: [null, Validators.required],
      ageView: [null, Validators.required],
      gender: [null, Validators.required],
      differentPlace: [false, Validators.required],
      customerStore: [false],
      alternative: [false],
      otherStreet: [null],
      otherPostalCode: [null],
      otherCity: [null]
    }, {
      validators: MustMatch('password', 'confirmPassword')
    });
    this.httpService.get(URL_JSON.AGENCY + '/get_by_admin/' + this.currentUser.id).subscribe((res: any) => {
      this.agencies = res;
    });
    this.httpService.get(URL_JSON.PACKAGE + '/getWithQuery?status=Public&status=Intern').subscribe((res: any) => {
      this.packages = res;
    });
    this.httpService.get(URL_JSON.USER + '/getPatientsByAdmin/' + this.currentUser.id).subscribe((res: any) => {
      this.allPatient = res;
      this.allPatient$ = res;
    });
    // this.httpService.get(URL_JSON.APPOINTMENT + '/get').subscribe((res: any) => {
    //   this.allAppointment = res;
    // });
    this.httpService.get(URL_JSON.DISTRICT + '/get_available_postal_code/' + this.currentUser.id).subscribe((res: any) => {
      console.log(res);
      this.availableModel = res;
    });
    this.selectedPackage = null;
    this.selectedAgency = null;
    this.patientSearchControl.valueChanges.subscribe(() => {
      let search = this.patientSearchControl.value;
      search = search.toLowerCase();
      this.allPatient = this.allPatient$.filter(item => (item.firstName + item.lastName).toLowerCase().indexOf(search) > -1);
    });
  }

  get f(): any {
    return this.appointmentForm.controls;
  }

  get pf(): any {
    return this.patientForm.controls;
  }

  getAgeType = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
    {
      age--;
    }
    return moment(birthDate).format('DD/MM/YYYY') + `  (${age > 0 ? age : 0} Jahre)`;
  }

  setDateAndAge = event => {
    this.pf.ageView.setValue(this.getAgeType(event.value));
  }

  checkPostalCode = (type) => {
    if (type === 'patient') {
      this.httpService.get(URL_JSON.ZIPCODE + '/check_postal_code_all/' + this.pf.plz.value).subscribe((res: any) => {
        if (!res) {
          this.pf.plz.setErrors(Validators.required);
        } else {
          this.pf.ort.setValue(res?.ort);
          this.pf.plz.setErrors(null);
        }
      });
    }
    if (type === 'appointment') {
      const index = this.availableModel.findIndex(item => item.zipcode === parseInt(this.f.name.value, 10));
      console.log(index, this.f.name.value);
      if (index > -1) {
        this.f.name.setErrors(null);
      } else {
        this.f.name.setErrors(Validators.required);
      }
      // this.httpService.checkPostalCode(this.f.name.value).subscribe((res: any) => {
      //   if (!res || res?.city !== 'Berlin') {
      //     this.f.name.setErrors(Validators.required);
      //   } else {
      //     this.f.name.setErrors(null);
      //   }
      // });
    }
  }

  showAppointmentPopup = () => {
    this.isAppointmentPopup = !this.isAppointmentPopup;
    this.isPatientPopup = false;
  }

  addTime = () => {
    if (this.allTimes.length === 0) {
      return;
    }
    this.randomTimes.push(this.allTimes[this.selectedPTime]);
    this.allTimes.splice(this.selectedPTime, 1);
  }

  showPatientPopup = () => {
    this.isPatientPopup = !this.isPatientPopup;
    this.isAppointmentPopup = false;
  }

  selectAgency = (agency) => {
    this.selectedAgency = agency.id;
    this.httpService.get(URL_JSON.BASE + '/booking_time/agency/' + agency.id).subscribe((res: any) => {
      this.makeAppointmentTime(res);
    });
  }

  selectTime = (time) => {
    this.selectedTime = time;
  }

  makeAppointmentTime = calendar  => {
    this.allTimes = calendar;
    this.randomTimes = [];

    for (const i of new Array(4)) {
      if (this.allTimes.length === 0) {
        break;
      }
      const randomIndex = Math.floor(Math.random() * this.allTimes.length);
      this.randomTimes.push(this.allTimes[randomIndex]);
      this.allTimes.splice(randomIndex, 1);
    }
  }

  getDate = time => {
    moment.locale('de');
    return moment(time).format('ddd DD.MM.YYYY HH:mm');
  }

  getMillisecondsFromNumber = (num: any, plusDate) => {
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + plusDate,
      Math.floor(num / 2),
      num % 2 === 0 ? 0 : 30
    );
    return date.getTime();
  }

  selectPackage = (id) => {
    this.selectedPackage = id;
  }

  changeCheckboxValue = (item) => {
    this.pf[item].setValue(!this.pf[item].value);
    if (item === 'alternative' || item === 'customerStore') {
      this.paymentSelectionError = false;
    }
    if (item === 'differentPlace') {
      if (this.pf[item].value) {
        this.pf.otherStreet.setValidators([Validators.required]);
        this.pf.otherPostalCode.setValidators([Validators.required]);
        this.pf.otherCity.setValidators([Validators.required]);
      } else {
        this.pf.otherStreet.setValidators(null);
        this.pf.otherPostalCode.setValidators(null);
        this.pf.otherCity.setValidators(null);
      }
      this.pf.otherStreet.updateValueAndValidity();
      this.pf.otherPostalCode.updateValueAndValidity();
      this.pf.otherCity.updateValueAndValidity();
    }
  }

  generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    this.pf.password.setValue(password);
    this.pf.confirmPassword.setValue(password);
  }

  close = () => {
    this.dialogRef.close();
  }

  onSubmit = () => {
    if (this.appointmentForm.invalid) {
      return;
    }
    if (!this.selectedAgency || !this.selectedPackage || !this.selectedTime) {
      return;
    }
    const data = {
      name: this.f.name.value,
      userId: this.f.patient.value,
      agencyId: this.selectedAgency,
      packageId: this.selectedPackage,
      time: this.selectedTime
    };
    if (this.data) {
    } else {
      this.httpService.create(URL_JSON.APPOINTMENT, data).subscribe(() => {
        this.dialogRef.close();
      });
    }
  }

  addPatient = () => {
    if (this.patientForm.invalid) {
      return;
    } else if (!this.pf.alternative.value && !this.pf.customerStore.value) {
      this.paymentSelectionError = true;
      return;
    }
    const data = {
      email: this.pf.email.value,
      phoneNumber: this.pf.phoneNumber.value,
      password: this.pf.password.value,
      firstName: this.pf.firstName.value,
      lastName: this.pf.lastName.value,
      salutation: this.pf.salutation.value,
      street: this.pf.street.value,
      age: this.pf.age.value,
      gender: this.pf.gender.value,
      plz: this.pf.plz.value,
      ort: this.pf.ort.value,
      differentPlace: this.pf.differentPlace.value,
      customerStore: this.pf.customerStore.value,
      alternative: this.pf.alternative.value,
      otherStreet: this.pf.otherStreet.value,
      otherCity: this.pf.otherCity.value,
      otherPostalCode: this.pf.otherPostalCode.value
    };
    this.httpService.create(URL_JSON.USER + '/patient', data).subscribe((res: any) => {
      this.allPatient$.push(res.user);
      this.allPatient.push(res.user);
      this.showPatientPopup();
    });
  }
}
