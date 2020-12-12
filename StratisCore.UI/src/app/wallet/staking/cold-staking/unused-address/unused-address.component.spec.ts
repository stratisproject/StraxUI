import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnusedAddressComponent } from './unused-address.component';

describe('UnusedAddressComponent', () => {
  let component: UnusedAddressComponent;
  let fixture: ComponentFixture<UnusedAddressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnusedAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnusedAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
