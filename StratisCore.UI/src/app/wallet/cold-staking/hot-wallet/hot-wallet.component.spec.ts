import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HotWalletComponent } from './hot-wallet.component';

describe('HotWalletComponent', () => {
  let component: HotWalletComponent;
  let fixture: ComponentFixture<HotWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HotWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HotWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
