import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveWalletComponent } from './remove-wallet.component';

describe('RemoveWalletComponent', () => {
  let component: RemoveWalletComponent;
  let fixture: ComponentFixture<RemoveWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveWalletComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
