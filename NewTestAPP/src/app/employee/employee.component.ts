import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from '../service/employee.service';
import { DatePipe, JsonPipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CsvexportService } from '../service/csvexport.service';
import * as XLSX from 'xlsx';

import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AlertService } from '../service/alert.service';
import { NgBlockUI, BlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit, AfterViewInit {
  @BlockUI() blockUI: NgBlockUI;
  public isCollapsed = true;
  @ViewChild('dataTable', { static: true }) table: any;
  dataTable: any;
  dtOptions: any;

  employee: any[] = [];
  filterModel: any = {
    Gender: "",
    StartSalary: null,
    EndSalary: null,
    DobStart: null,
    DobEnd: null,
  }

  tableInst: any;
  gridCheckAll: boolean = false;

  checkedEmpIds: number[] = [];
  uncheckedEmpIds: number[] = [];

  constructor(private http: HttpClient,
    private employeeSvr: EmployeeService,
    private datePipe: DatePipe,
    private router: Router,
    private csvexportService: CsvexportService,
    private alertSvr: AlertService
  ) { }

  ngOnInit() {
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.tableInst = $('#employeeListId').DataTable();
        const pageInfo = this.tableInst.page.info();
        
        const order = dataTablesParameters.order[0];
        let dobStart = null;
        let dobEnd = null;
        if (this.filterModel.DobStart) {
          dobStart = this.filterModel.DobStart.year + "-" + this.filterModel.DobStart.month + "-" + this.filterModel.DobStart.day;
        }
        if (this.filterModel.DobEnd) {
          dobEnd = this.filterModel.DobEnd.year + "-" + this.filterModel.DobEnd.month + "-" + this.filterModel.DobEnd.day;
        }
        const requestObj = {
          Gender: "",
          StartSalary: this.filterModel.StartSalary,
          EndSalary: this.filterModel.EndSalary,
          DobStart: dobStart,
          DobEnd: dobEnd,
          Sort: dataTablesParameters.columns[order.column].data,
          Order: order.dir,
          Page: (pageInfo.page + 1),
          PageSize: dataTablesParameters.length,
          SearchText: dataTablesParameters.search.value
        };
        this.employeeSvr.getEmployeePagedData(requestObj).subscribe(resp => {

          that.employee = resp.data;
          resp.data.map(item => {
            item.dateOfBirth = this.datePipe.transform(item.dateOfBirth, 'MMM d, y');
            return item;
          });
          that.employee.forEach(item => {
            item.checked = this.isPersonChecked(item.id);
          });
          callback({
            recordsTotal: resp.count,
            recordsFiltered: resp.count,
            data: that.employee
          });
        }, error => {
        });
      },
      columns: [
        {
          title: '',
          data: 'id'
        },
        {
          title: 'ID',
          data: 'id'
        },
        {
          title: 'Full Name',
          data: 'fullName'
        },
        {
          title: 'DOB',
          data: 'dateOfBirth'
        },
        { title: 'Gender', data: 'gender' },
        { title: 'Salary', data: 'salary' },
        { title: 'Designation', data: 'designation' }
      ]
    };
    setTimeout(() => {
      this.dataTable = $(this.table.nativeElement);
      this.dataTable.DataTable(this.dtOptions);
    }, 100);
  }

  reloadData() {
    this.tableInst.ajax.reload();
  }

  ngAfterViewInit(): void {
  }

  updateEmp(data) {
    this.router.navigate(['/addemp', data.id]);
  }

  gridAllRowsCheckBoxChecked(e) {
    console.log(this.gridCheckAll);
    this.employee.map(item => item.checked = this.gridCheckAll);
  }

  rowCheckBoxChecked(e, empId) {
    if (e.currentTarget.checked) {
      this.uncheckedEmpIds.splice(this.uncheckedEmpIds.indexOf(empId), 1);
      if (!this.gridCheckAll)
        this.checkedEmpIds.push(empId);
    }
    else {
      this.checkedEmpIds.splice(this.checkedEmpIds.indexOf(empId), 1);
      if (this.gridCheckAll)
        this.uncheckedEmpIds.push(empId);
    }
  }


  export(val) {
    this.blockUI.start('Loading...');
    this.employeeSvr.employeeGetPrint(this.checkedEmpIds, this.gridCheckAll).subscribe(res => {
      if (res && res.data) {
        res.data.map(item => {
          return item.dateOfBirth = this.datePipe.transform(item.dateOfBirth, 'MMM d, y');
        })
        if (val === 'pdf') {
          this.pdf(res.data)
        }
        if (val === 'excel') {
          this.excel(res.data);
        }
        if (val === 'csv') {
          this.csv(res.data);
        }
      }
      setTimeout(() => {
        this.blockUI.stop(); // Stop blocking
      }, 2000);
    }, error => {
      setTimeout(() => {
        this.blockUI.stop(); // Stop blocking
      }, 2000);
    });
  }


  private isPersonChecked(empId) {
    if (!this.gridCheckAll) {
      return this.checkedEmpIds.indexOf(empId) >= 0 ? true : false;
    }
    else {
      return this.uncheckedEmpIds.indexOf(empId) >= 0 ? false : true;
    }
  }

  pdf(dataArray) {
    var doc = new jsPDF();
    var col = ["Id", "Full Name", "DateOfBirth", "Gender", "Salary", "Designation"];
    var rows = [];
    var itemNew = dataArray;
    itemNew.forEach(element => {
      var temp = [element.id, element.fullName, element.dateOfBirth, element.gender, element.salary, element.designation];
      rows.push(temp);
    });
    doc.autoTable(col, rows);
    doc.save('employeepdfdata.pdf');
  }

  excel(arrayData) {
    const fileName = 'employeepdfexceldata.xlsx';
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(arrayData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'employeepdfexceldata');
    XLSX.writeFile(wb, fileName);
  }
  csv(arrayData) {
    this.csvexportService.downloadFile(arrayData, 'employeecsvdata');
  }
}
 