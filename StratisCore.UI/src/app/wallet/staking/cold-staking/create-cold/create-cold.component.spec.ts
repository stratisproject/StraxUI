import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateColdComponent } from './create-cold.component';

describe('CreateColdComponent', () => {
  let component: CreateColdComponent;
  let fixture: ComponentFixture<CreateColdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateColdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateColdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
