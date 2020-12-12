import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResyncComponent } from './resync.component';

describe('ResyncComponent', () => {
  let component: ResyncComponent;
  let fixture: ComponentFixture<ResyncComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResyncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
