import { expect, test } from 'vitest'
import {Utils} from '../src/js/Utils.js';

test('capitalize abc to Abc', () => {
    expect(Utils.capitalize('abc')).toBe('Abc');
});


test('pick elements', () => {
    const arrToPick = [2, 4, 6, 8, 10];
    const posArr  = [0, 1, 4];
    const pickedArr = Utils.elementsAtPositions(arrToPick, posArr);
    expect(pickedArr).toStrictEqual([2, 4, 10]);
});
