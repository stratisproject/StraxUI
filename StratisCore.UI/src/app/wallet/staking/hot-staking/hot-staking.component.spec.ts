import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HotStakingComponent } from './hot-staking.component';

describe('HotStakingComponent', () => {
  let component: HotStakingComponent;
  let fixture: ComponentFixture<HotStakingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HotStakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
