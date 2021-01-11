import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressSelectionComponent } from './address-selection.component';

describe('AddressSelectionComponent', () => {
  let component: AddressSelectionComponent;
  let fixture: ComponentFixture<AddressSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
