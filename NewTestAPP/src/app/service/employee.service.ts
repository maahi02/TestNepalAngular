import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private api: ApiService) { }

  saveEmployee(data: any, fileToUpload: File): any {
    const formData: FormData = new FormData();
    if (data.id > 0) {
      formData.append('Id', data.id);
    }
    if (fileToUpload && fileToUpload.name) {
      formData.append('Image', fileToUpload, fileToUpload.name);
    }
    formData.append('FullName', data.fullName);
    formData.append('DateOfBirth', data.dateOfBirth);
    formData.append('Salary', data.salary);
    formData.append('Designation', data.designation);
    formData.append('Gender', data.gender);
    return this.api.post('/employee/SaveEmployee', formData);
  }

  getEmployeePagedData(data: any): any {
    return this.api.get('/employee/GetEmployeeAll', data);
  }

  getEmpById(id: number): any {
    const reqData = {
      id: id
    };
    return this.api.get('/employee/EmployeeGetById', reqData);
  }


  employeeGetPrint(data: any[], isAll: boolean): any {
    const reqData = {
      ids: data.length ? data : [],
      isAll: isAll
    };
    return this.api.get('/employee/EmployeeGetPrint', reqData);
  }

  importData(): any {
    return this.api.get('/employee/SyncExcelData');
  }

  

}
