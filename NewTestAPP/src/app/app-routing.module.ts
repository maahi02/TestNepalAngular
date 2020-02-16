import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeComponent } from './employee/employee.component';
import { AddemployeeComponent } from './employee/addemployee/addemployee.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_guards/auth.guard';
import { ImportDataComponent } from './import-data/import-data.component';


const routes: Routes = [

  {
    path: '',
    redirectTo: 'employee',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'employee',
    canActivate: [AuthGuard],
    component: EmployeeComponent
  },
  {
    path: 'addemp',
    canActivate: [AuthGuard],
    component: AddemployeeComponent
  },
  {
    path: 'addemp/:id',
    canActivate: [AuthGuard],
    component: AddemployeeComponent
  },
  {
    path: 'import',
    canActivate: [AuthGuard],
    component: ImportDataComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
