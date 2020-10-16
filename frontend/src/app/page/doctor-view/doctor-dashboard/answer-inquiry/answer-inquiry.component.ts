import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SharedService} from '../../../../service/shared/shared.service';

@Component({
  selector: 'app-answer-inquiry',
  templateUrl: './answer-inquiry.component.html',
  styleUrls: ['./answer-inquiry.component.scss']
})
export class AnswerInquiryComponent implements OnInit {
   isContactHistory = false;
   isMedicalHistory = false;
   isPatientCall = false;
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AnswerInquiryComponent>,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.sharedService.closeHistory.subscribe(res => {
      this.isMedicalHistory = false;
      this.isContactHistory = false;
      this.isPatientCall = false;
    });
  }

  openSuccess = () => {
    this.dialogRef.close(true);
  }

  afterClosed = (dialogRef) => {
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openMedicalHistory = () => {
    this.isMedicalHistory = true;
    this.isContactHistory = false;
    this.sharedService.answer.emit('medical');
  }

  openContactHistory = () => {
    this.isContactHistory = true;
    this.isMedicalHistory = false;
    this.sharedService.answer.emit('contact');
  }

  openPatientCall = () => {
    this.isMedicalHistory = false;
    this.isContactHistory = false;
    this.sharedService.answer.emit('call');
  }

}
