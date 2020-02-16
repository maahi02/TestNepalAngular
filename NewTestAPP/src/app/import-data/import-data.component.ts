import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../service/employee.service';

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.css']
})
export class ImportDataComponent implements OnInit {
  public isSync = false;

  public indexData = [];
  public errorMessage = [];
  constructor(private employeeSvr: EmployeeService) { }

  ngOnInit() {
  }

  ImportExcel() {
    this.isSync = true;
    this.employeeSvr.importData().subscribe(res => {
      if (res && res.data) {
        this.indexData = res.data.join(',');
      }
      if (res && res.errorMessage) {
        this.errorMessage = res.errorMessage;
      }
      this.isSync = false;
    }, error => {
      this.isSync = false;
    })
  }

}
