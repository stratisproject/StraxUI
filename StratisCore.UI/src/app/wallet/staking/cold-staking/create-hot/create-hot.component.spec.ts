import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHotComponent } from './create-hot.component';

describe('CreateHotComponent', () => {
  let component: CreateHotComponent;
  let fixture: ComponentFixture<CreateHotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
