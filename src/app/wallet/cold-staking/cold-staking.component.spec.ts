import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ColdStakingComponent } from './cold-staking.component';

describe('ColdStakingComponent', () => {
  let component: ColdStakingComponent;
  let fixture: ComponentFixture<ColdStakingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ColdStakingComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdStakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
