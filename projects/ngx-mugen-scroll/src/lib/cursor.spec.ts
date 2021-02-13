import { Cursor } from './cursor';

describe('Cursor', () => {
  it('0 items', () => {
    const v = new Cursor([]);
    expect(v.getItems()).toEqual([]);
    expect(v.length).toBe(0);
    expect(v.toString()).toBe('');
  });
  it('1 items', () => {
    const v = new Cursor([1]);
    expect(v.getItems()).toEqual([1]);
    expect(v.length).toBe(1);
    expect(v.getItem(0)).toEqual(1);
    expect(v.toString()).toBe('1');
  });
  it('3 items', () => {
    const v = new Cursor([1, 'a', 2]);
    expect(v.getItems()).toEqual([1, 'a', 2]);
    expect(v.length).toBe(3);
    expect(v.getItem(0)).toEqual(1);
    expect(v.getItem(1)).toEqual('a');
    expect(v.getItem(2)).toEqual(2);
    expect(v.toString()).toBe('1-a-2');
  });
});
