import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpService} from '../../../../service/http/http.service';
import {URL_JSON} from '../../../../utils/url_json';
import * as moment from 'moment';

@Component({
  selector: 'app-popup-callback-doctor',
  templateUrl: './popup-callback-doctor.component.html',
  styleUrls: ['./popup-callback-doctor.component.scss']
})
export class PopupCallbackDoctorComponent implements OnInit {
  @Output() closeSide = new EventEmitter();
  @Input() isMobile;
  @Input() isTablet;
  @Input() appointmentId;
  selectedDay: any;
  times = [
    {time: 'morning', label: 'Vormittags (09:00 - 12:00)'},
    {time: 'afternoon', label: 'Nachmittags (12:00 - 16:00)'},
    {time: 'evening', label: 'Abends (16:00 - 19:00)'}
  ];
  selectedTime = null;
  isValid = false;
  isEditPhone = false;
  callbackForm: FormGroup;
  displayData: any;
  defaultPhone: '';
  dateControl: any;
  isSuccess = false;
  constructor(
    public httpService: HttpService,
    public formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.selectedDay = 'today';
    this.httpService.get(URL_JSON.APPOINTMENT + '/getAppointmentDetail/' + this.appointmentId).subscribe((res: any) => {
      this.displayData = res;
      this.defaultPhone = this.displayData.patientNumber;
      this.setPhone(res.patientNumber);
    });
    this.callbackForm = this.formBuilder.group({
      phone: [null, [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{11,13}$')]],
      title: [null, [Validators.required]],
      message: [null],
    });
    this.dateControl = new FormControl(new Date());
  }

  get f(): any {
    return this.callbackForm.controls;
  }

  setPhone = (phone) => {
    this.f.phone.setValue(phone);
  }

  getTimeDuration = (startTime, duration) => {
    if (!startTime || !duration) {
      return '';
    }
    return moment(startTime).format('DD.MM.YYYY HH:mm') + ' - ' + moment(startTime + duration * 60 * 1000).format('HH:mm');
  }

  formatDate = (selectedDate) => {
    let date = new Date();
    if (selectedDate === 'tomorrow') {
      date = new Date(date.getTime() + 86400 * 1000);
    }
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  }

  submit = () => {
    if (this.callbackForm.invalid) {
      return;
    }
    const selectedDate = this.formatDate(this.selectedDay);
    const data = {
      appointmentId: this.appointmentId,
      date: selectedDate,
      time: this.selectedTime,
      phoneNumber: this.f.phone.value,
      title: this.f.title.value,
      message: this.f.message.value
    };
    this.httpService.post(URL_JSON.PATIENT + '/createCallbackForDoctor', data).subscribe((res: any) => {
      if (res) {
        this.isSuccess = true;
      }
    });
  }

  selectDay = (event) => {
    this.selectedDay = event;
  }

  selectTime = (event) => {
    if (this.selectedDay === 'today' && this.getConditionFromTime(event.time)) {
      return;
    }
    this.selectedTime = event.time;
  }

  getConditionFromTime = time => {
    const now = new Date();
    const currentHour = now.getHours();
    if (time === 'morning') {
      return currentHour >= 12;
    } else if (time === 'evening') {
      return currentHour >= 16;
    } else {
      return currentHour >= 19;
    }
  }

  close = () => {
    this.closeSide.emit(false);
  }
}
