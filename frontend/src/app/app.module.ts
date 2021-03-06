import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

import {NgCircleProgressModule} from 'ng-circle-progress';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {JwtInterceptor} from './helper';

import { LoginComponent } from './page/login/login.component';
import { AuthComponent } from './layout/auth/auth.component';

import {MaterialModule} from './material/material.module';
import {MainLayoutModule} from './layout/main-layout/main-layout.module';
import {SharedModule} from './shared/shared.module';
import { ChartComponent } from './components/chart/chart.component';
import { SessionExpireAlertComponent } from './components/session-expire-alert/session-expire-alert.component';
import {PatientLayoutModule} from './layout/patient-layout/patient-layout.module';
import {DoctorLayoutModule} from './layout/doctor-layout/doctor-layout.module';
import {ProfileComponent} from './page/profile/profile.component';
import { BookingLayoutComponent } from './layout/booking-layout/booking-layout.component';
import {BookingModule} from './page/booking/booking.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AuthComponent,
    ChartComponent,
    SessionExpireAlertComponent,
    ProfileComponent,
    BookingLayoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    MainLayoutModule,
    PatientLayoutModule,
    DoctorLayoutModule,
    SharedModule,
    NgCircleProgressModule,
    BookingModule,
  ],
  entryComponents: [SessionExpireAlertComponent],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
