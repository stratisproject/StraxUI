import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColdConfirmationComponent } from './create-cold-confirmation.component';

describe('CreateColdConfirmationComponent', () => {
  let component: CreateColdConfirmationComponent;
  let fixture: ComponentFixture<CreateColdConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateColdConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateColdConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
