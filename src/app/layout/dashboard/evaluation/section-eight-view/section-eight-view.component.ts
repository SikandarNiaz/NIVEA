import { Component, OnInit, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { config } from 'src/assets/config';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {EvaluationService} from '../evaluation.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'section-eight-view',
  templateUrl: './section-eight-view.component.html',
  styleUrls: ['./section-eight-view.component.scss']
})
export class SectionEightViewComponent implements OnInit {

  @Input('data') data;
  @ViewChild('childModal') childModal: ModalDirective;
  @Output('showModal') showModal: any = new EventEmitter<any>();
  @Input('isEditable') isEditable: any;
  @Output('productList') productForEmit: any = new EventEmitter<any>();
  selectedShop: any = {};
  selectedImage: any = {};
  // ip=environment.ip;
  configFile = config;

  ip: any = this.configFile.ip;
  hover = 'hover';
  zoomOptions = {
    Mode: 'hover'
  };
  zoomedImage = 'https://image.shutterstock.com/image-photo/micro-peacock-feather-hd-imagebest-260nw-1127238569.jpg';
  products: any;
  availability: any;
  changeColor: boolean;
  updatingMSL: boolean;
  colorUpdateList: any = [];
  surveyId: any;
  evaluatorId: any;
  MSLCount = 0;
  MSLNAvailabilityCount: number;
  facing: any;
  availableDepth: any;
  desiredDepth: any;
  stock: any;
  total: any;
  selectedProduct: any = {};
  selectedFacing: any;
  loadingData: boolean;
  loading = false;

  constructor(private router: Router, private toastr: ToastrService, private httpService: EvaluationService) { }

  ngOnInit() {
    const arr = this.router.url.split('/');
    this.surveyId = +arr[arr.length - 1];
    this.evaluatorId = localStorage.getItem('user_id');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue) {
      this.data = changes.data.currentValue;
      this.selectedImage = this.data.imageList[0];
      this.products = this.data.chillerTable || [];
    }

if (this.products.length > 0) {
      this.facing = this.getFacingCount(this.products);
      this.availableDepth = this.getAvailDepthCount(this.products);
      this.desiredDepth = this.getDesDepthCount(this.products);
      this.stock = this.getStockCount(this.products);
      this.total = this.getTotalCount(this.availableDepth, this.desiredDepth);
      }

  }

  setSelectedImage(img) {
    this.selectedImage = img;

  }
  getFacingCount(products) {
    let sum = 0;
    products.forEach(el => {
      sum = +el.face_unit + sum;
    });
    return sum;
}

getAvailDepthCount(products) {
  let sum = 0;
  products.forEach(el => {
    sum = sum + el.unit_available;
  });
  return sum;
}

getDesDepthCount(products) {
  let sum = 0;
  products.forEach(el => {
    sum = sum + el.desiredDepth;
  });
  return sum;
}

getStockCount(products) {
  let sum = 0;
  products.forEach(el => {
    sum = sum + el.stock;
  });
  return sum;
}

getTotalCount(availableDepth, desiredDepth) {
  const percentage = ((availableDepth / desiredDepth) * 100).toFixed(1);
  return percentage;
}

    showChildModal(shop): void {
    this.selectedShop = shop;
    this.selectedFacing = this.selectedShop.face_unit;
    this.showModal.emit(this.selectedShop);
    // this.childModal.show();
  }


  showFacingChildModal(product) {
    if (this.isEditable) {
    this.selectedProduct = product;
    this.childModal.show();
  }
}

  hideChildModal() {
    this.childModal.hide();
  }


  toggleValue(value) {
    // if (this.selectedFacing > '0' && this.selectedSku === '0') {
    //   this.toastr.error('Availability and Facing has conflicting values', 'Error');
    //   return;
    // } else if (this.selectedFacing === '' || this.selectedSku === '') {
    //   this.toastr.error('Add facing and Availability', 'Error');
    //   return;
    // }
    if (this.isEditable) {

    this.loading = true;
      this.changeColor = true;

      this.colorUpdateList.push(value.id);
      const obj = {
        msdId: value.detailId,
        facing: value.face_unit,
        surveyId: value.surveyId,
        evaluatorId: this.evaluatorId
      };

  this.httpService.updateChillerData(obj).subscribe((data: any) => {
    if (data.success) {
      this.loading = false;
      this.toastr.success('Data Updated Successfully');
      this.childModal.hide();
      const key = data.detailId;
      this.products.forEach(e => {
        if (key === e.detailId) {
          const i = this.products.findIndex(p => p.detailId === key);
          const obj = {
            id: e.detailId,
            stock: e.stock,
            unit_available: e.unit_available,
            product_title: e.product_title,
            face_unit: e.face_unit,
            color: 'red'
          };


          this.products.splice(i, 1, obj);

          // console.log(this.products[i])
        }
        localStorage.setItem('productList', JSON.stringify(this.products));


      this.facing = this.getFacingCount(this.products);


      });

       this.productForEmit.emit(this.products);
      // this.toastr.success('Status updated successfully.','Update MSL');
      this.updatingMSL = false;


    } else {
      this.toastr.error(data.message, 'Update Data');
    }
  });

    }
  }
}

