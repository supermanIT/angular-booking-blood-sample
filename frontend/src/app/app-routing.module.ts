import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {AuthComponent} from './layout/auth/auth.component';
import {MainLayoutComponent} from './layout/main-layout/main-layout.component';

import {LoginComponent} from './page/login/login.component';
import {RegisterComponent} from './page/register/register.component';

import {AuthGuard} from './guard/auth.guard';
import {RoleGuard} from './guard/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // dashboard
      {
        path: 'dashboard',
        loadChildren: () => import('./page/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [RoleGuard],
        data: {
          userRole: ['Superadmin']
        }
      },
      {
        path: 'ag-dashboard',
        loadChildren: () => import('./page/ag-dashboard/ag-dashboard.module').then(m => m.AgDashboardModule),
        canActivate: [RoleGuard],
        data: {
          userRole: ['AG-Admin']
        }
      },
      {
        path: 'paypal',
        loadChildren: () => import('./page/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'working-group',
        loadChildren: () => import('./page/working-group/working-group.module').then(m => m.WorkingGroupModule)
      },
      {
        path: 'user',
        loadChildren: () => import('./page/user/user.module').then(m => m.UserModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('./page/calendar/calendar.module').then(m => m.CalendarModule)
      },
      {
        path: 'text',
        loadChildren: () => import('./page/text/text.module').then(m => m.TextModule)
      },
      {
        path: 'package',
        loadChildren: () => import('./page/package/package.module').then(m => m.PackageModule)
      },
      {
        path: 'interface',
        loadChildren: () => import('./page/interface/interface.module').then(m => m.InterfaceModule)
      },
      {
        path: 'agency',
        loadChildren: () => import('./page/agency/agency.module').then(m => m.AgencyModule),
        canActivate: [RoleGuard],
        data: {
          userRole: ['AG-Admin']
        }
      },
      {
        path: 'appointment',
        loadChildren: () => import('./page/appointment/appointment.module').then(m => m.AppointmentModule),
        canActivate: [RoleGuard],
        data: {
          userRole: ['AG-Admin']
        }
      },
      {
        path: 'sms-history',
        loadChildren: () => import('./page/sms/sms.module').then(m => m.SmsModule),
        canActivate: [RoleGuard],
        data: {
          userRole: ['AG-Admin']
        }
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'nurse-view',
    loadChildren: () => import('./page/nurse-view/nurse-view.module').then(m => m.NurseViewModule),
    canActivate: [RoleGuard],
    data: {
      userRole: ['Nurse']
    }
  },
  {
    path: 'doctor',
    component: MainLayoutComponent,
    loadChildren: () => import('./page/doctor-view/doctor-view.module').then(m => m.DoctorViewModule),
    canActivate: [RoleGuard],
    data: {
      userRole: ['Doctor']
    }
  },
  {
    path: 'patient',
    component: MainLayoutComponent,
    loadChildren: () => import('./page/patient-view/patient-view.module').then(m => m.PatientViewModule),
    canActivate: [RoleGuard],
    data: {
      userRole: ['Patient']
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
