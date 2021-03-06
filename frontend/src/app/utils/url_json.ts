import {environment} from '../../environments/environment';

const BASE_URL = environment.BASE_URL;
const API_URL = environment.API_URL;

export const URL_JSON = {
  AUTH: API_URL + 'auth',
  DASHBOARD: API_URL + 'dashboard',
  GROUP: API_URL + 'group',
  USER: API_URL + 'user',
  CALENDAR: API_URL + 'calendar',
  TEMPLATE: API_URL + 'template',
  PACKAGE: API_URL + 'package',
  DISTRICT: API_URL + 'district',
  ADDITIONAL_PACKAGE: API_URL + 'additional-package',
  AGENCY: API_URL + 'agency',
  APPOINTMENT: API_URL + 'appointment',
  BASE: API_URL,
  ZIPCODE: API_URL + 'zipcode',
  PATIENT: API_URL + 'patient',
  DOCTOR: API_URL + 'doctor',
};
