import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddNewAddressComponent } from './add-new-address.component';

describe('AddNewAddressComponent', () => {
  let component: AddNewAddressComponent;
  let fixture: ComponentFixture<AddNewAddressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewAddressComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
