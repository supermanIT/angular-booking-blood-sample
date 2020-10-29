import {Component, OnInit} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {curveCardinal} from 'd3-shape';
import {HttpService} from '../../../service/http/http.service';
import {URL_JSON} from '../../../utils/url_json';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {

  label = [
    'Bestätigte Termine', 'Offene Termine', 'Storniert / verschoben', 'Abgeschlossene Termine'
  ];
  labelClass = ['light-green-color', 'pink-color', 'red-color', 'green-color'];

  packageLabel = [];
  packageLabelClass = ['light-green-color', 'pink-color', 'red-color', 'green-color', 'blue-color', 'yellow-color'];

  data = [];
  packageData = [];
  colorArray = ['#50E3C2', '#F389CC', '#E87C60', '#89DF8C', '#4A90E2', '#F5A623'];

  packageTotal = 0;
  showDetailPeriod = false;

  barChartData = [
  ];

  monthArray = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember'
  ];

  lineChartData = [
    {
      name: 'Patient',
      series: []
    },
  ];

  curve: any = curveCardinal;
  customColors = {
    domain: ['#FFF', '#FFF'],
  };
  monthlyData: any;
  dataPerPatient: any;
  averageData: any;

  fromDate: any = null;
  toDate: any = null;

  constructor(
    public httpService: HttpService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'custom-calendar',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/calendar.svg')
    );
  }

  ngOnInit(): void {
    this.analysisByAgency();
    this.httpService.get(URL_JSON.APPOINTMENT + '/analysisByPackage').subscribe((res: any) => {
      for (const [index, item] of res.entries()) {
        this.packageData.push({
          color: this.colorArray[index % this.colorArray.length],
          value: item.count_by_package,
          icon: 'heart'
        });
        this.packageLabel.push(item.packageName);
      }
      for (const item of this.packageData) {
        this.packageTotal += item.value;
      }
      if (this.packageTotal === 0) {
        this.packageTotal = 1;
      }
    });

    this.httpService.get(URL_JSON.APPOINTMENT + '/analysisPerMonth').subscribe((res: any) => {
      for (const item of res) {
        this.barChartData.push({
          label: this.monthArray[item.month - 1],
          positive: parseInt(item.positive_value ? item.positive_value : 0, 10),
          negative: parseInt(item.negative_value ? item.negative_value : 0, 10)
        });
      }
      this.monthlyData = res;
      let monthPositiveAverage = 0;
      let monthNegativeAverage = 0;
      for (const item of res) {
        monthPositiveAverage += item.positive_value;
        monthNegativeAverage += item.negative_value;
      }
      this.averageData = {
        monthNegativeAverage,
        monthPositiveAverage,
        weekNegativeAverage: (monthNegativeAverage / 4),
        weekPositiveAverage: (monthPositiveAverage / 4)
      };
    });

    this.httpService.get(URL_JSON.APPOINTMENT + '/analysisTotalPatient').subscribe((res: any) => {
      for (const data of res.per_patient) {
        this.lineChartData[0].series.push({
          name: this.monthArray[data.month - 1],
          value: data.count_per_month
        });
      }
      this.dataPerPatient = res;
    });
  }

  getNumberFromString = (value) => {
    return parseInt(value, 10);
  }

  analysisByAgency = () => {
    this.httpService.get(URL_JSON.APPOINTMENT + '/analysisByAgency').subscribe((res: any) => {
      this.data.push({
        label: 'Termine gesamp',
        detailData: [
          {color: '#50E3C2', value: this.getNumberFromString(res.total.confirm_count), icon: 'done'},
          {color: '#F389CC', value: this.getNumberFromString(res.total.open_date_count), icon: 'feeling'},
          {color: '#E87C60', value: this.getNumberFromString(res.total.cancel_count), icon: 'close'},
          {color: '#89DF8C', value: this.getNumberFromString(res.total.success_count), icon: 'thumb-up'}
        ]
      });
      for (const agency of res.agency) {
        this.data.push({
          label: agency.agencyName,
          detailData: [
            {color: '#50E3C2', value: this.getNumberFromString(agency.confirm_count), icon: 'done'},
            {color: '#F389CC', value: this.getNumberFromString(agency.open_date_count), icon: 'feeling'},
            {color: '#E87C60', value: this.getNumberFromString(agency.cancel_count), icon: 'close'},
            {color: '#89DF8C', value: this.getNumberFromString(agency.success_count), icon: 'thumb-up'}
          ]
        });
      }
    });
  }

  changeDateFrom = event => {
    const date = new Date(event.value);
    this.fromDate = date.getTime();
    console.log(this.fromDate);
    this.analysisByAgency();
  }

  changeDateTo = event => {
    const date = new Date(event.value);
    this.toDate = date.getTime();
    console.log(this.toDate);
    this.analysisByAgency();
  }
}
