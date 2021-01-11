import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransactionDetailsModalComponent } from './transaction-details-modal.component';

describe('TransactionDetailsModalComponent', () => {
  let component: TransactionDetailsModalComponent;
  let fixture: ComponentFixture<TransactionDetailsModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
