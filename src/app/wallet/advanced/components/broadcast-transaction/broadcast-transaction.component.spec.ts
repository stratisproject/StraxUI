import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BroadcastTransactionComponent } from './broadcast-transaction.component';

describe('BroadcastTransactionComponent', () => {
  let component: BroadcastTransactionComponent;
  let fixture: ComponentFixture<BroadcastTransactionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastTransactionComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
