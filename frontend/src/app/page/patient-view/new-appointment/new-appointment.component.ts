import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HttpService} from '../../../service/http/http.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-new-appointment',
  templateUrl: './new-appointment.component.html',
  styleUrls: ['./new-appointment.component.scss']
})
export class NewAppointmentComponent implements OnInit {
  appointmentForm: FormGroup;
  city = null;
  constructor(
    public dialog: MatDialog,
    public formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<NewAppointmentComponent>,
    public httpService: HttpService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.appointmentForm = this.formBuilder.group({
      plz: [null, Validators.required],
    });
  }

  get f(): any {
    return this.appointmentForm.controls;
  }

  submit = () => {
    if (this.appointmentForm.invalid || this.f.plz.errors) {
      return;
    }
    const data = {
      status: true,
      plz: this.f.plz.value,
      city: this.city
    };
    this.dialogRef.close(data);
  }

  checkPostalCode = () => {
      this.httpService.checkPostalCodeForAppointment(this.f.plz.value).subscribe((res: any) => {
        if (!res) {
          this.f.plz.setErrors(Validators.required);
        } else {
          this.f.plz.setErrors(null);
          this.city = res.city;
        }
      });
  }

  close = () => {
    this.dialogRef.close();
  }

}
