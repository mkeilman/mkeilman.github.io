import { expect, test } from 'vitest'
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('json', () => {
    const p = new PokerPlayer();
    p.pokerFace = PokerPlayer.PokerFaces.cool;
    const pp = PokerPlayer.fromJSON(p.toJSON());
    p.vals().forEach(x => {
        expect(p[x]).toBe(pp[x]);
    });
    p.objs().forEach(x => {
        expect(p[x]).toStrictEqual(pp[x]);
    });
});
