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
  let spyCreateEmbeddedView: jasmine.Spy<any>;
  let spyRemove: jasmine.Spy<any>;
  let spyGet: jasmine.Spy<any>;
  let spyClear: jasmine.Spy<any>;
  let mockViewRef: any;
  let spyDetectChanges: jasmine.Spy<any>;
  let mockRootNode: any;
  let spySetAttribute: jasmine.Spy<any>;
  let v: MugenScrollDataDirective;

  beforeEach(async () => {
    mockTemplateRef = {};
    mockViewContainerRef = {
      clear(): void { },
      createEmbeddedView(): void { },
      remove(): void { },
      get(): void { },
    };
    mockViewRef = {
      rootNodes: [
        {
          setAttribute(): void { },
        },
      ],
      detectChanges(): void { },
      context: undefined,
    };
    v = new MugenScrollDataDirective(
      mockTemplateRef,
      mockViewContainerRef,
    );
    v.newCursor = (u: any) => new Cursor([u.createdAt, u.name]);
  });

  describe('0 data', () => {
    it('length and clear', () => {
      spyClear = spyOn(mockViewContainerRef, 'clear').and.returnValue(undefined);
      mockViewContainerRef.length = 0;
      expect(v.length).toBe(0);
      v.clear();
      expect(v.bottom).toBeUndefined();
      expect(v.top).toBeUndefined();
      expect(spyClear.calls.count()).toBe(1);
    });

    it('push', () => {
      spyCreateEmbeddedView = spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      spySetAttribute = spyOn(mockViewRef.rootNodes[0], 'setAttribute');
      spyDetectChanges = spyOn(mockViewRef, 'detectChanges');
      v.push(
        { createdAt: 1, name: 'a' },
        { createdAt: 2, name: 'b' },
        { createdAt: 2, name: 'b' }, // Same data is ignored
        { createdAt: 3, name: 'c' },
      );
      expect(spyCreateEmbeddedView.calls.count()).toBe(3);
      expect(spyDetectChanges.calls.count()).toBe(3);
      expect(spySetAttribute.calls.count()).toBe(3);
      expect(spySetAttribute.calls.argsFor(0)).toEqual(['_cursor', new Cursor([1, 'a'])]);
      expect(spySetAttribute.calls.argsFor(1)).toEqual(['_cursor', new Cursor([2, 'b'])]);
      expect(spySetAttribute.calls.argsFor(2)).toEqual(['_cursor', new Cursor([3, 'c'])]);
      expect(v.top).toEqual({ createdAt: 1, name: 'a' });
      expect(v.bottom).toEqual({ createdAt: 3, name: 'c' });
    });

    it('push empty', () => {
      spyCreateEmbeddedView = spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      spySetAttribute = spyOn(mockViewRef.rootNodes[0], 'setAttribute');
      spyDetectChanges = spyOn(mockViewRef, 'detectChanges');
      v.push();
      expect(spyCreateEmbeddedView.calls.count()).toBe(0);
      expect(spyDetectChanges.calls.count()).toBe(0);
      expect(spySetAttribute.calls.count()).toBe(0);
      expect(v.bottom).toBeUndefined();
      expect(v.top).toBeUndefined();
    });

    it('unshift', () => {
      spyCreateEmbeddedView = spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      spySetAttribute = spyOn(mockViewRef.rootNodes[0], 'setAttribute');
      spyDetectChanges = spyOn(mockViewRef, 'detectChanges');
      v.unshift(
        { createdAt: 1, name: 'a' },
        { createdAt: 2, name: 'b' },
        { createdAt: 2, name: 'b' }, // Same data is ignored
        { createdAt: 3, name: 'c' },
      );
      expect(spyCreateEmbeddedView.calls.count()).toBe(3);
      expect(spyDetectChanges.calls.count()).toBe(3);
      expect(spySetAttribute.calls.count()).toBe(3);
      expect(spySetAttribute.calls.argsFor(0)).toEqual(['_cursor', new Cursor([3, 'c'])]);
      expect(spySetAttribute.calls.argsFor(1)).toEqual(['_cursor', new Cursor([2, 'b'])]);
      expect(spySetAttribute.calls.argsFor(2)).toEqual(['_cursor', new Cursor([1, 'a'])]);
      expect(v.top).toEqual({ createdAt: 1, name: 'a' });
      expect(v.bottom).toEqual({ createdAt: 3, name: 'c' });
    });

    it('unshift empty', () => {
      spyCreateEmbeddedView = spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      spySetAttribute = spyOn(mockViewRef.rootNodes[0], 'setAttribute');
      spyDetectChanges = spyOn(mockViewRef, 'detectChanges');
      v.unshift();
      expect(spyCreateEmbeddedView.calls.count()).toBe(0);
      expect(spyDetectChanges.calls.count()).toBe(0);
      expect(spySetAttribute.calls.count()).toBe(0);
      expect(v.top).toBeUndefined();
      expect(v.bottom).toBeUndefined();
    });
  });

  describe('2 data', () => {
    beforeEach(() => {
      spyCreateEmbeddedView = spyOn(mockViewContainerRef, 'createEmbeddedView').and.returnValue(mockViewRef);
      spySetAttribute = spyOn(mockViewRef.rootNodes[0], 'setAttribute');
      spyDetectChanges = spyOn(mockViewRef, 'detectChanges');
      v.push({ createdAt: 1, name: 'a' });
      v.push({ createdAt: 2, name: 'b' });
    });

    it('push', () => {
      v.push(
        { createdAt: 3, name: 'c' },
      );
      expect(spySetAttribute.calls.argsFor(2)).toEqual(['_cursor', new Cursor([3, 'c'])]);
      expect(v.top).toEqual({ createdAt: 1, name: 'a' });
      expect(v.bottom).toEqual({ createdAt: 3, name: 'c' });
    });

    it('unshift', () => {
      v.unshift(
        { createdAt: 3, name: 'c' },
      );
      expect(spySetAttribute.calls.argsFor(2)).toEqual(['_cursor', new Cursor([3, 'c'])]);
      expect(v.top).toEqual({ createdAt: 3, name: 'c' });
      expect(v.bottom).toEqual({ createdAt: 2, name: 'b' });
    });
  });

  describe('Existing 10 data', () => {
    beforeEach(() => {
      mockViewContainerRef.length = 10;
    });

    describe('Max is 10', () => {
      beforeEach(() => {
        v.max = 10;
      })
      it('Not arrenge', () => {
        v.arrangeAfterPush();
        v.arrangeAfterUnshift();
      });
    });

    describe('Max is 9', () => {
      beforeEach(() => {
        v.max = 9;
      });
      it('Remove 1 using arrangeAfterPush (Removing data from top)', () => {
        spyRemove = spyOn(mockViewContainerRef, 'remove');
        spyGet = spyOn(mockViewContainerRef, 'get').and.returnValue({ context: { data: { createdAt: 123, name: 'a' } } });
        v.arrangeAfterPush();
        expect(spyRemove.calls.count()).toBe(1);
        expect(spyGet.calls.count()).toBe(1);
        expect(v.top).toEqual({ createdAt: 123, name: 'a' });
      });
      it('Remove 1 using arrangeAfterUnshift (Removing data from bottom)', () => {
        spyRemove = spyOn(mockViewContainerRef, 'remove');
        spyGet = spyOn(mockViewContainerRef, 'get').and.returnValue({ context: { data: { createdAt: 123, name: 'a' } } });
        v.arrangeAfterUnshift();
        expect(spyRemove.calls.count()).toBe(1);
        expect(spyGet.calls.count()).toBe(1);
        expect(v.bottom).toEqual({ createdAt: 123, name: 'a' });
      });
    });

    describe('Max is 8', () => {
      beforeEach(() => {
        v.max = 8;
      });
      it('Remove 2 using arrangeAfterPush (Removing data from top)', () => {
        spyRemove = spyOn(mockViewContainerRef, 'remove');
        spyGet = spyOn(mockViewContainerRef, 'get').and.returnValue({ context: { data: { createdAt: 123, name: 'a' } } });
        v.arrangeAfterPush();
        expect(spyRemove.calls.count()).toBe(2);
        expect(spyGet.calls.count()).toBe(2);
        expect(v.top).toEqual({ createdAt: 123, name: 'a' });
      });
      it('Remove 2 using arrangeAfterUnshift (Removing data from bottom)', () => {
        spyRemove = spyOn(mockViewContainerRef, 'remove');
        spyGet = spyOn(mockViewContainerRef, 'get').and.returnValue({ context: { data: { createdAt: 123, name: 'a' } } });
        v.arrangeAfterUnshift();
        expect(spyRemove.calls.count()).toBe(2);
        expect(spyGet.calls.count()).toBe(2);
        expect(v.bottom).toEqual({ createdAt: 123, name: 'a' });
      });
    });
  });
});
