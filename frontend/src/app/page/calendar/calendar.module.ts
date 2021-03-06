import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import {MaterialModule} from '../../material/material.module';
import {CalendarRoutingModule} from './calendar-routing.module';
import {NewCalendarComponent} from './new-calendar/new-calendar.component';
import {NewDistrictComponent} from './new-district/new-district.component';


@NgModule({
  declarations: [
    NewCalendarComponent,
    NewDistrictComponent,
  ],
  imports: [
    CommonModule,
    CalendarRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMatSelectSearchModule
  ]
})
export class CalendarModule { }
