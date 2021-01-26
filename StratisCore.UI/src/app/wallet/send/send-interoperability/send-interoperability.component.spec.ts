import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInteroperabilityComponent } from './send-interoperability.component';

describe('SendInteroperabilityComponent', () => {
  let component: SendInteroperabilityComponent;
  let fixture: ComponentFixture<SendInteroperabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendInteroperabilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendInteroperabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
