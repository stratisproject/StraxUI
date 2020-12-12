import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExtPubkeyComponent } from './ext-pubkey.component';

describe('ExtPubkeyComponent', () => {
  let component: ExtPubkeyComponent;
  let fixture: ComponentFixture<ExtPubkeyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtPubkeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtPubkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
