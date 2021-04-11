import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SendConfirmationComponent } from './send-confirmation.component';

describe('SendConfirmationComponent', () => {
  let component: SendConfirmationComponent;
  let fixture: ComponentFixture<SendConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SendConfirmationComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
