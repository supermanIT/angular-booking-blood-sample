import {Component, HostListener, OnInit} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import {AuthService} from '../../../service/auth/auth.service';
import {HttpService} from '../../../service/http/http.service';
import {URL_JSON} from '../../../utils/url_json';
import * as moment from 'moment';

@Component({
  selector: 'app-nurse-dashboard',
  templateUrl: './nurse-dashboard.component.html',
  styleUrls: ['./nurse-dashboard.component.scss']
})
export class NurseDashboardComponent implements OnInit {

  isOpen = false;
  isRightMenuOpen = false;
  isProfileMenuOpen = false;
  isPatientPreparedMenuOpen = false;
  isAppointmentDelayMenuOpen = false;
  isShiftScheduleMenuOpen = false;
  isAppointmentTakenMenuOpen = false;
  isPatientNotThereMenuOpen = false;
  isMobile = false;
  currentUser: any;
  workingStartHour = 18;
  workingEndHour = 32;
  workingHourArray = [];

  defaultEmail = 'muster@mustermann.de';
  customEmail = '';
  isEditEmail = false;

  isEditText = false;
  defaultText = '';
  customText = 'Sehr geehrte Frau Skywalker, Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. Mit freundlichen Grüßen Schwester 1';
  isSubmit = false;
  allAppointments;
  appointments = [];
  currentTime;
  now;
  Arr = Array;
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  textTemplate = [];
  selectedAppointment: any;
  Editor = ClassicEditor;

  constructor(
    public authService: AuthService,
    public httpService: HttpService,
    public breakpointObserver: BreakpointObserver,
    public router: Router
  ) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.isMobile = this.breakpointObserver.isMatched('(max-width: 599px)');

    this.now = new Date();
    this.currentTime = this.now.getTime();
    setInterval(() => {
      this.now = new Date();
      this.currentTime = this.now.getTime();
    }, 1000);
    this.httpService.get(URL_JSON.APPOINTMENT + '/getAppointmentByNurse/' + this.currentUser.id).subscribe((res: any) => {
      this.allAppointments = res;
      this.workingStartHour = res[0]?.workingTimeFrom;
      this.workingEndHour = res[0]?.workingTimeUntil;
      const today = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 0, 0);
      for (const appointment of this.allAppointments) {
        if (appointment.startTime > today.getTime() && appointment.startTime < today.getTime() + 86400 * 1000) {
          this.appointments.push(appointment);
        }
      }
      this.workingHourArray = new Array((this.workingEndHour - this.workingStartHour) / 2);
    });
    this.httpService.get(URL_JSON.TEMPLATE + '/getWithQuery?type=E-Mail&receiver=1').subscribe((res: any) => {
      this.textTemplate = res;
    });
    // const data = {
    //   apiKey: '629e1c77-b9c3-4189-a829-b4b183a53699',
    //   clientSecret: 'DEV_SECRET_BITSKIN_API',
    //   engagementID: 'fe96b443-27a9-41da-b257-d8429b82e669',
    //   patientID: '0815',
    //   workingGroupID: 'TBD',
    //   profileID: 'gbb',
    //   appointment: '2020-07-20T12:30:00.000Z',
    //   pFirstName: 'Max',
    //   pLastName: 'Mustermann',
    //   pDateOfBirth: '1990-01-01T00:00:00.000Z',
    //   pEmail: 'max.mustermann@mail.de',
    //   pAddress: 'Musterstraße 1',
    //   pPostalCode: '10585',
    //   pCity: 'Musterstadt',
    //   pCountryCode: 'DE',
    //   pGender: 'm',
    //   pAnamnesis: {
    //     smoker: 0,
    //     medication: '10; mg; Medikament; XY'
    //   }
    // };
    // this.httpService.update('https://dev.mobilebloodcheck.de/bp-api/engagement', data).subscribe(res => {
    //   console.log(res)
    // });
  }

  getCurrentTimeFormat = () => {
    return moment(this.currentTime).format('LT');
  }

  getStartTime = (time) => {
    return moment(time).format('HH:mm');
  }

  getEndTime = (time, duration) => {
    return moment(time + duration * 60 * 1000).format('HH:mm');
  }

  getTimeString = (time, format) => {
    return moment(time).format(format);
  }

  @HostListener('window:resize', [])
  private onResize = () => {
    this.isMobile = this.breakpointObserver.isMatched('(max-width: 599px)');
  }

  getDate = (time, parameter) => {
    let date;
    if (time) {
      date = new Date(time);
    } else {
      date = new Date();
    }
    if (parameter === 'date') {
      return date.getDate();
    } else if (parameter === 'month') {
      return date.getMonth();
    } else if (parameter === 'hour') {
      return date.getHours();
    } else if (parameter === 'minute') {
      return date.getMinutes();
    }
  }

  getFloor = (value) => {
    const floor = Math.floor(value);
    return floor < 10 ? '0' + floor : floor.toString();
  }

  openRightMenu = (index) => {
    this.isRightMenuOpen = true;
    this.defaultEmail = this.selectedAppointment.patientEmail;
    if (index === 0) {
      this.isPatientPreparedMenuOpen = true;
      this.customText = this.getTemplate('Patient Prepared');
    } else if (index === 1) {
      this.isAppointmentDelayMenuOpen = true;
      this.customText = this.getTemplate('Appointment Delay');
    } else if (index === 2) {
      this.isShiftScheduleMenuOpen = true;
      this.customText = this.getTemplate('Appointment Shift');
    } else if (index === 3) {
      this.isAppointmentTakenMenuOpen = true;
      this.customText = this.getTemplate('Appointment Taken');
    } else if (index === 4) {
      this.isPatientNotThereMenuOpen = true;
      this.customText = this.getTemplate('Patient Not There');
    }
  }

  getTemplate = (assign) => {
    const index = this.textTemplate.findIndex(item => item.assign === assign);
    if (index > -1) {
      return this.textTemplate[index].message;
    } else {
      return '';
    }
  }

  close = () => {
    this.isRightMenuOpen = false;
    this.isProfileMenuOpen = false;
    this.isAppointmentTakenMenuOpen = false;
    this.isAppointmentDelayMenuOpen = false;
    this.isPatientPreparedMenuOpen = false;
    this.isPatientNotThereMenuOpen = false;
    this.isShiftScheduleMenuOpen = false;
    this.isSubmit = false;
    this.isEditText = false;
    this.isEditEmail = false;
  }

  logout = () => {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  patientPrepared = () => {
    this.close();
  }

  appointmentDelay = () => {
    const data = {
      email: this.customEmail ? this.customEmail : this.defaultEmail,
      content: this.customText,
      subject: 'Appointment Delay'
    };
    this.httpService.post(URL_JSON.BASE + 'sendEmail', data).subscribe(res => {
      this.close();
    });
    // this.close();
  }

  shiftSchedule = () => {
    const data = {
      email: this.customEmail ? this.customEmail : this.defaultEmail,
      content: this.customText,
      subject: 'Appointment Moving'
    };
    this.httpService.post(URL_JSON.BASE + 'sendEmail', data).subscribe(res => {
      this.close();
    });
    // this.close();
  }

  appointmentTaken = () => {
    this.isSubmit = true;
  }

  patientNotThere = () => {
    this.isSubmit = true;
  }
}