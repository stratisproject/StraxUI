import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotStakingComponent } from './hot-staking.component';

describe('HotStakingComponent', () => {
  let component: HotStakingComponent;
  let fixture: ComponentFixture<HotStakingComponent>;

  beforeEach(async(() => {
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
