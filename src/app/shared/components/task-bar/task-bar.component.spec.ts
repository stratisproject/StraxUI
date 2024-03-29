import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskBarComponent } from './task-bar.component';

describe('TaskBarComponent', () => {
  let component: TaskBarComponent;
  let fixture: ComponentFixture<TaskBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskBarComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
