import { expect, test } from 'vitest'
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('json', () => {
    const p = new PokerPlayer();
    p.pokerFace = PokerPlayer.PokerFaces.cool;
    const j = p.toJSON();
    const pp = PokerPlayer.fromJSON(p.toJSON());
    expect(pp.pokerFace).toBe(p.pokerFace);
});
