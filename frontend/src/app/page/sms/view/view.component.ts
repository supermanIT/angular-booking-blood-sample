import {Component, Inject, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as moment from 'moment';

import {HttpService} from '../../../service/http/http.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {

  constructor(
    public httpService: HttpService,
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
  }

  getDate = time => {
    return moment(time).format('DD.MM.YYYY HH:mm');
  }

  sendManual = () => {
    this.close();
    // this.httpService.post(URL_JSON.BASE + '/sendSMS', this.data).subscribe(() => {
    //   this.dialogRef.close();
    // });
  }

  close = () => {
    this.dialogRef.close();
  }
}
