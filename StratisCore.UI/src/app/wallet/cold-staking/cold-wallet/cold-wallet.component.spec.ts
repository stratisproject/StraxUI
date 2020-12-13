import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColdWalletComponent } from './cold-wallet.component';

describe('ColdWalletComponent', () => {
  let component: ColdWalletComponent;
  let fixture: ComponentFixture<ColdWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColdWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
