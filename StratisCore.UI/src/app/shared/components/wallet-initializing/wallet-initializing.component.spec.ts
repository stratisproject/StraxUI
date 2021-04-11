import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletInitializingComponent } from './wallet-initializing.component';

describe('WalletInitializingComponent', () => {
  let component: WalletInitializingComponent;
  let fixture: ComponentFixture<WalletInitializingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WalletInitializingComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletInitializingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
