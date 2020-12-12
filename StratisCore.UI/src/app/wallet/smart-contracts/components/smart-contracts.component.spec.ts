import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SmartContractsComponent } from './smart-contracts.component';

describe('SmartContractsComponent', () => {
  let component: SmartContractsComponent;
  let fixture: ComponentFixture<SmartContractsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
