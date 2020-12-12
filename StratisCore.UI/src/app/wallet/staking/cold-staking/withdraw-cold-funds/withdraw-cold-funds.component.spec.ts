import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WithdrawColdFundsComponent } from './withdraw-cold-funds.component';

describe('WithdrawColdFundsComponent', () => {
  let component: WithdrawColdFundsComponent;
  let fixture: ComponentFixture<WithdrawColdFundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawColdFundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawColdFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
