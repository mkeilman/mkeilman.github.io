import { expect, test } from 'vitest'
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {PokerPot} from '../src/js/PokerPot.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('json', () => {
    const p = new PokerPot(200);
    p.addPlayer(new PokerPlayer());
    const pp = PokerPot.fromJSON(p.toJSON());
    p.vals().forEach(x => {
        expect(p[x]).toBe(pp[x]);
    });
});
