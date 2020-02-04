import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSelectComponent } from './create-select.component';

describe('CreateSelectComponent', () => {
  let component: CreateSelectComponent;
  let fixture: ComponentFixture<CreateSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
