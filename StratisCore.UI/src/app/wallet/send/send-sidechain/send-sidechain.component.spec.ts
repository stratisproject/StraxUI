import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendSidechainComponent } from './send-sidechain.component';

describe('SendSidechainComponent', () => {
  let component: SendSidechainComponent;
  let fixture: ComponentFixture<SendSidechainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendSidechainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendSidechainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
