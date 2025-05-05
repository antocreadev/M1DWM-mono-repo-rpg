import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileIconComponent } from './tile-icon.component';

describe('TileIconComponent', () => {
  let component: TileIconComponent;
  let fixture: ComponentFixture<TileIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TileIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TileIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
