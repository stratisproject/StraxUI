import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletInitializingFailedComponent } from './wallet-initializing-failed.component';

describe('WalletInitializingFailedComponent', () => {
  let component: WalletInitializingFailedComponent;
  let fixture: ComponentFixture<WalletInitializingFailedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletInitializingFailedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletInitializingFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
