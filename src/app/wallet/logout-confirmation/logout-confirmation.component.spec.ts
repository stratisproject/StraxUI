import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LogoutConfirmationComponent } from './logout-confirmation.component';

describe('LogoutConfirmationComponent', () => {
  let component: LogoutConfirmationComponent;
  let fixture: ComponentFixture<LogoutConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LogoutConfirmationComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoutConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
