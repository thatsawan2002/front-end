import { Component, OnInit, TemplateRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { UserList} from '../user-list';
import { DebugService } from '../debug.service';
import { UserListService } from '../user-list.service';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale, thBeLocale } from 'ngx-bootstrap/chronos';
import { NzTableModule } from 'ng-zorro-antd/table';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  title: string;
  modalRef: BsModalRef;
  userList: UserList[] = [];

  maxEndDate: Date;

  name: string;
  lastname: string;
  age: number;
  birthdate: string;
  gender: string;
  id: number = null;
  num: number;
  createdate: string;

  pageIndex: number = 1;
  pageSize: number = 10;

  constructor(private debugService: DebugService, private modalService: BsModalService,
              private localeService: BsLocaleService, private httpClient : HttpClient) {
                this.maxEndDate = new Date(); // set enddate to today
                defineLocale('th-be', thBeLocale); // กำหนด locale ของปีพ.ศ.
                this.localeService.use('th-be'); // ใช้งาน locale ที่กำหนด
              }

  ngOnInit() {
    this.debugService.info("User List component initialized");
    this.title = "ผู้ใช้งาน"
    // โหลดข้อมูลผู้ใช้งานจาก back-end
    this.fetchDataFromDatabase();
  }

  newRow: UserList = {
    id: null,
    age: null,
    createdate: '',
    gender: '',
    birthdate: '',
    createby: '',
    updatedate: '',
    updateby: '',
    fullname: '',
    name: '',
    lastname: '',
    actions: ''
  };

  openModal(action: string, user: UserList) {
    user.actions = action;
    if (action === 'Add') {
      this.modalRef = this.modalService.show(this.template);
    } else if (action === 'Edit') {
      console.log("ข้อมูล user : ",user);
      this.newRow = { ...user };
      console.log("ข้อมูล newRow : ",this.newRow);
      // แสดงข้อมูลเดิมที่เคยมีอยู่ก่อนแก้ไข
      console.log("user.birthdate : ", user.birthdate);
      console.log("createdate เดิม : ", user.createdate);
      this.name = user.name;
      this.lastname = user.lastname;
      this.age = user.age;
      this.birthdate = this.convertBirthdateToShow(user.birthdate);
      this.gender = user.gender;
      console.log("this.birthdate : ", this.birthdate);

      this.modalRef = this.modalService.show(this.template);
    }
  }
  

  closeModal() {
    this.modalRef.hide();
  }

  addUserData(){
    if (!this.name || !this.lastname || this.age < 0 || !this.birthdate || !this.gender) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const data = {
      name: this.name,
      lastname: this.lastname,
      age: this.age,
      createdate: this.convertDateToString(new Date()),
      gender: this.gender,
      birthdate: this.convertDateToString(this.birthdate),
      createby: this.name,
      updatedate: this.convertDateToString(new Date()),
      updateby: this.name,
      fullname: this.name + " " + this.lastname,
      actions: ''
    };

    console.log("data ที่กรอก : ",data);
    this.httpClient.post<UserList>('http://127.0.0.1:8778/kwanController/insert', data).subscribe((result) => {
      console.log("ผลของการลองเพิ่มข้อมูล back-end: ", result);
      this.fetchDataFromDatabase();
    });
  }

  saveData() {
    if (this.newRow.actions === 'Add') {
      this.addUserData();
    } else if (this.newRow.actions === 'Edit') {
      console.log("ข้อมูล newRow แบบสับ : ",this.newRow);
      this.editUserData(this.newRow);
    }
    this.clearInputField();
    this.closeModal();
  }

  @ViewChild('template', { static: false }) template: TemplateRef<any>;
  
  editUserData(user: UserList) {
    if (!this.name || !this.lastname || this.age < 0 || !this.birthdate || !this.gender) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    console.log("this.birthdate in edit function : ", this.birthdate);
    console.log("user.birthdate in edit function : ", user.birthdate);
    console.log("user.birthdate in เมื่อเข้าฟังก์ชันแปลง : ", this.convertBirthdateToShow(user.birthdate));
    console.log("createdate in edit function : ", user.createdate);

    if (this.convertBirthdateToShow(user.birthdate) === this.birthdate){
      const editdata = {
        id: user.id,
        name: this.name,
        lastname: this.lastname,
        age: this.age,
        createdate: this.convertToCreateDate(user.createdate),
        gender: this.gender,
        birthdate: this.birthdate,
        createby: this.name,
        updatedate: this.convertDateToString(new Date()),
        updateby: this.name,
        fullname: this.name + " " + this.lastname
      };
      console.log("data ที่กรอกตอนแก้ไขแบบไม่แก้วันเกิด : ", editdata);
      this.httpClient.post<UserList>('http://127.0.0.1:8778/kwanController/save', editdata).subscribe(
        (result) => {
          console.log("ผลของการลองแก้ไขข้อมูล back-end: ", result);
          this.fetchDataFromDatabase();
        },
        (error) => {
          this.fetchDataFromDatabase();
        }
      );
    }else{
      const editdata = {
        id: user.id,
        name: this.name,
        lastname: this.lastname,
        age: this.age,
        createdate: this.convertToCreateDate(user.createdate),
        gender: this.gender,
        birthdate: this.convertDateToString(this.birthdate),
        createby: this.name,
        updatedate: this.convertDateToString(new Date()),
        updateby: this.name,
        fullname: this.name + " " + this.lastname
      };
      console.log("data ที่กรอกตอนแก้ไขแบบแก้วันเกิดด้วย : ", editdata);
      this.httpClient.post<UserList>('http://127.0.0.1:8778/kwanController/save', editdata).subscribe(
        (result) => {
          console.log("ผลของการลองแก้ไขข้อมูล back-end: ", result);
          this.fetchDataFromDatabase();
        },
        (error) => {
          this.fetchDataFromDatabase();
        }
      );
    }
  }

  fetchDataFromDatabase() {
    this.httpClient.get<UserList[]>('http://127.0.0.1:8778/kwanController/findAll').subscribe((Response) => {
         console.log("ผลของการลองเชื่อม back-end : ",Response);
         this.userList = Response;
    })
  }

  clearInputField() {
    this.name = '';
    this.lastname = '';
    this.age = null;
    this.birthdate = null;
    this.gender = '';
  }

  onValueChange($value: Date): void {
    if ($value) {
      this.age = this.calculateAge($value.toLocaleDateString());
    }
  }

  calculateAge(date: string){
    const today = new Date();
    const birthdate = new Date(date);
    console.log(birthdate);
    var age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age;
  }

  formatDate(date: Date): string { // ใช้แก้ format วันที่ตอนก่อนเชื่อม back-end
    const locale = 'th-BE';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(locale, options);
  }

  convertBirthdateToShow(date: string) {
    const parts = date.split('-');
    const days = parseInt(parts[2]) + 1;
    const day = days.toString(); // แปลงให้เป็น string จะได้ใช้ method padStart() ได้
    const month = parts[1];
    const year = parseInt(parts[0]);
  
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  convertToBE(date: string) { // ใช้แปลงวันที่ตอนแสดงที่หน้าเว็บ
    const parts = date.split('-');
    const days = parseInt(parts[2]) + 1;
    const day = days.toString(); // แปลงให้เป็น string จะได้ใช้ method padStart() ได้
    const month = parts[1];
    const year = parseInt(parts[0]) + 543;
  
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  convertDateToString(date: any) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  convertToCreateDate(date: string){
    const parts = date.split('-');
    const year = parseInt(parts[0]);
    const month = parts[1];
    const day = (parseInt(parts[2]) + 1).toString();
    return day.padStart(2, '0') + "/" + month + "/" + year;
  }


  deleteUserData(user: UserList) {
    console.log("UserID : ", user.id);
    if (confirm("คุณต้องการลบข้อมูลผู้ใช้งานหรือไม่?")) {
      const index = this.userList.findIndex(item => item.id === user.id);
      if (index !== -1) {
          this.httpClient.post('http://127.0.0.1:8778/kwanController/delete', user).subscribe(() => {
          console.log(`ลบข้อมูลผู้ใช้รหัส ${user.id} สำเร็จ`);
          this.userList.splice(index, 1); // ลบข้อมูลผู้ใช้ออกจากอาร์เรย์
          this.fetchDataFromDatabase(); // อัปเดตข้อมูลที่แสดงในตาราง
        });
      } else {
      console.log("ไม่ลบข้อมูล");
      }
    }
  }
  
  cancelEdit() {
    this.closeModal();
    this.clearInputField();
  }  
}
