import { TestBed } from '@angular/core/testing';
import { Cursor } from './cursor';

import { CursorStoreService } from './cursor-store.service';

describe('CursorStoreService', () => {
  let service: CursorStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CursorStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('When service has no data', () => {
    it('delete', () => {
      service.delete('path1');
      expect(service.length).toBe(0);
    });
    it('load', () => {
      expect(service.load('path1')).toBeUndefined();
    });
    it('save', () => {
      service.save('path1', new Cursor([1]), new Cursor([10]), 20, 30);
      expect(service.length).toBe(1);
      expect(service.load('path1')).toEqual({
        bottomCursor: new Cursor([1]),
        topCursor: new Cursor([10]),
        n: 20,
        scrollY: 30,
        scrollX: 0,
      });
      service.delete('path1');
      expect(service.length).toBe(0);
    });
  });

  describe('When service has no data', () => {
    beforeEach(() => {
      service.save('path1', new Cursor([1]), new Cursor([10]), 20, 30);
    });
    it('Overwrite when call save', () => {
      service.save('path1', new Cursor([2]), new Cursor([20]), 30, 40);
      expect(service.length).toBe(1);
      expect(service.load('path1')).toEqual({
        bottomCursor: new Cursor([2]),
        topCursor: new Cursor([20]),
        n: 30,
        scrollY: 40,
        scrollX: 0,
      });
    });
  });
});
