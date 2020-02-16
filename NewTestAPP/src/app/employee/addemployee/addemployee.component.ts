import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/service/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/service/alert.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-addemployee',
  templateUrl: './addemployee.component.html',
  styleUrls: ['./addemployee.component.css']
})
export class AddemployeeComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  public message = "";
  genderList: any[] = [];
  employeeForm: FormGroup;
  submitted = false;
  imageUrl: string = "/assets/default-image.png";
  fileToUpload: File = null;

  @ViewChild('Image', { static: false }) fileUploader: ElementRef;
  empId: number = 0;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router, private formBuilder: FormBuilder,
    private employeeSvr: EmployeeService,
    private alertService: AlertService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (params && params.id) {
        this.empId = parseInt(params.id);
        if (this.empId > 0) {
          this.getEmpDetails();
        }
      }
    })

    this.genderList = [
      {
        id: 'Male',
        value: 'Male'
      },
      {
        id: 'Female',
        value: 'Female'
      },
      {
        id: 'Intersex',
        value: 'Intersex'
      },
      {
        id: 'Trans',
        value: 'Trans'
      },
      {
        id: 'Others',
        value: 'Others'
      },
    ];
  }

  getEmpDetails() {
    this.employeeSvr.getEmpById(this.empId).subscribe(res => {
      console.log(JSON.stringify(res));
      if (res && res.data) {
        this.employeeForm.patchValue(res.data);
        if (res && res.data && res.data.photo) {
          this.imageUrl = res.data.photo;
        }
        console.log(res.data.dateOfBirth);
        if (res.data.dateOfBirth) {
          let array = res.data.dateOfBirth.split('T');
          console.log(array);
          const dateArray = array[0].split('-');
          console.log(dateArray);
          const dobDate = { "year": parseInt(dateArray[0]), "month": parseInt(dateArray[1]), "day": parseInt(dateArray[2]) };
          this.employeeForm.controls['dateOfBirth'].patchValue(dobDate);
        }
      }
    }, error => {
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.employeeForm.controls; }
  onSubmit() {


      this.blockUI.start('Please wait...');

    this.submitted = true;
    // stop here if form is invalid
    console.log(this.employeeForm.invalid);

    if (this.employeeForm.invalid) {
      return;
    }
    let dob = this.employeeForm.value && this.employeeForm.value.dateOfBirth ? this.employeeForm.value.dateOfBirth : null;
    if (dob) {
      this.employeeForm.value.dateOfBirth = dob.year + "-" + dob.month + "-" + dob.day;
    }
    this.employeeSvr.saveEmployee(this.employeeForm.value, this.fileToUpload)
      .subscribe((res) => {
        this.submitted = false;
        // this.form.nativeElement.reset();
        this.employeeForm.reset();
        this.resetFileUploader();
        this.imageUrl = "/assets/default-image.png";
        this.message = "Employee saved successfully!";
        this.alertService.success(this.message);
        setTimeout(() => {
          this.blockUI.stop();
          this.router.navigate(['/employee']);
           // Stop blocking
        }, 2000);

      }, error => {
        this.submitted = false;
        console.log(error);
        setTimeout(() => {
          this.blockUI.stop();
           // Stop blocking
        }, 2000);
      })
  }
  resetFileUploader() {
    this.fileUploader.nativeElement.value = null;
  }
  handleFileInput(event, file: FileList) {
    this.fileToUpload = file.item(0);
    let fileSize = parseInt((file.item(0).size / 1024 / 1024).toString()).toFixed(2); // in MB
    if (parseInt(fileSize) > 4) {
      event.srcElement.value = null;
      alert('File size exceeds 4 MB');
    } else {
      //Show image preview
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      }
      reader.readAsDataURL(this.fileToUpload);
    }
  }
  createForm() {
    this.employeeForm = this.formBuilder.group({
      id: [0],
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      salary: [0],
      designation: ['']
    });
  }

}
