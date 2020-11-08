import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnusedAddressComponent } from './unused-address.component';

describe('UnusedAddressComponent', () => {
  let component: UnusedAddressComponent;
  let fixture: ComponentFixture<UnusedAddressComponent>;

  beforeEach(async(() => {
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
