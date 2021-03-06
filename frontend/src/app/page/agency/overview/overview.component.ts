import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';

import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

import {NewComponent} from '../new/new.component';
import {HttpService} from '../../../service/http/http.service';
import {URL_JSON} from '../../../utils/url_json';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  displayedColumns: string[] = ['no', 'name', 'doctors', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  currentPage = 0;
  pageSize = 5;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  selectedDeleteItem: number = null;

  orderStatus = {
    active: '',
    direction: ''
  };

  allAgency: any;
  filterValue = null;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const url = this.router.url.split('/');
    if (url[2] === 'new') {
      this.openDialog();
    }
    this.httpService.get(URL_JSON.AGENCY + '/getAll').subscribe((res: any) => {
      this.dataSource.data = res;
      this.allAgency = res;
    });
  }

  onPaginateChange = ($event: PageEvent) => {
    this.currentPage = $event.pageIndex;
    this.pageSize = $event.pageSize;
  }

  delete = (id) => {
    this.selectedDeleteItem = id;
  }

  deleteItem = () => {
    this.httpService.delete(URL_JSON.AGENCY + '/delete/' + this.selectedDeleteItem).subscribe(res => {
      const dataSource = this.dataSource.data;
      const removedIndex = dataSource.findIndex(item => {
        return item.id === this.selectedDeleteItem;
      });
      dataSource.splice(removedIndex, 1);
      this.dataSource.data = dataSource;
    }, error => {
      const index = this.dataSource.data.findIndex(item => {
        return item.id === this.selectedDeleteItem;
      });
      const name = '\"' + this.dataSource.data[index].name + '\"';
      this.snackBar.open(
        name + ' kann nicht gelöscht werden, da ' + name + ' in Verbindung zu anderen Funktionen steht. Bitte löschen Sie zuerst diese Verbindungen.',
        'Warning',
        {duration: 5000});
      this.selectedDeleteItem = null;
    });
  }

  openDialog = () => {
    const dialogRef = this.dialog.open(NewComponent, {
      width: '900px'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigateByUrl('agency/overview');
    });
  }

  onSort = (event) => {
    this.orderStatus = event;
  }

  filter = () => {
    this.dataSource.data = this.allAgency.filter(item => {
      return item.name.includes(this.filterValue) ||
        JSON.stringify(item.doctors).includes(this.filterValue);
    });
  }

  edit = (data) => {
    const dialogRef = this.dialog.open(NewComponent, {
      width: '900px',
      data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.allAgency.findIndex(item => item.id === result.id);
        this.allAgency[index] = result;
        this.dataSource.data = this.allAgency;
      }
    });
  }

}
