import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressBookCardComponent } from './address-book-card.component';

describe('AddressBookCardComponent', () => {
  let component: AddressBookCardComponent;
  let fixture: ComponentFixture<AddressBookCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressBookCardComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressBookCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
