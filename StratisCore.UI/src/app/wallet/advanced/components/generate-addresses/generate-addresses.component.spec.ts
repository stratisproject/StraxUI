import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenerateAddressesComponent } from './generate-addresses.component';

describe('GenerateAddressesComponent', () => {
  let component: GenerateAddressesComponent;
  let fixture: ComponentFixture<GenerateAddressesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
