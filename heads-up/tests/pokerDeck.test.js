import { expect, test } from 'vitest'
import {PokerDeck} from '../src/js/PokerDeck.js';
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {PokerPot} from '../src/js/PokerPot.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('json', () => {
    const d = new PokerDeck(true);
    const dd = PokerDeck.fromJSON(d.toJSON());
    d.vals().forEach(x => {
        expect(d[x]).toBe(dd[x]);
    });
    d.cards.forEach((x, i) => {
        expect(x.equals(dd.cards[i])).toBeTruthy();
    });
});

test('deal', () => {
    const d = new PokerDeck(true);
    const c = d.dealCard();
    expect(d.deckIndex).toBe(1);
    expect(d.dealtCards[0]).toBe(c);

    const cc = d.burn(3);
    expect(d.deckIndex).toBe(4);
    expect(d.discards).toStrictEqual(d.cards.slice(1, 4));
});
