import { ElementRef, EmbeddedViewRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Cursor } from './cursor';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';

interface Data {
  createdAt: number;
  name: string;
}

describe('MugenScrollDataDirective', () => {
  let mockTemplateRef: any;
  let mockViewContainerRef: any;
  let mockViewRef: any;

  beforeEach(async () => {
    mockTemplateRef = {};
    mockViewContainerRef = {
      clear(): void { }
    };
    mockViewRef = {};
  });

  describe('0 data', () => {
    let v: MugenScrollDataDirective;
    beforeEach(() => {
      mockViewContainerRef.length = 0;
      spyOn(mockViewContainerRef, 'clear').and.returnValue(undefined);
      v = new MugenScrollDataDirective(
        mockTemplateRef,
        mockViewContainerRef,
      );
      v.newCursor = (u: any) => new Cursor([u.createdAt, u.name]);
    });

    it('length', () => {
      expect(v.length).toBe(0);
      v.clear();
      expect(v.bottom).toBeUndefined();
      expect(v.top).toBeUndefined();
    });

    it('push', () => {
      spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      v.push({ createdAt: 1, name: '' });
    });
  });
});
