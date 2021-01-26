import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendDefaultComponent } from './send-default.component';

describe('SendDefaultComponent', () => {
  let component: SendDefaultComponent;
  let fixture: ComponentFixture<SendDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendDefaultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
