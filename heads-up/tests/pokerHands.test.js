import { expect, test } from 'vitest'
import {PokerGame} from '../src/js/PokerGame.js';
import {PokerHand} from '../src/js/PokerHand.js';
import {PlayingCard} from '../src/js/PlayingCard.js';
import {Utils} from '../src/js/Utils.js';

test('compare hands', () => {
    const highCardTen = new PokerHand([
        new PlayingCard('club', 'ten'),
        new PlayingCard('diamond', 'eight'),
        new PlayingCard('heart', 'six'),
        new PlayingCard('spade', 'four'),
        new PlayingCard('club', 'deuce')
    ]);
    const myCards57 = [
        new PlayingCard('spade', 'five'),
        new PlayingCard('club', 'seven'),
    ];
    const h = PokerGame.bestHandFromHandAndCards(highCardTen, myCards57);
    expect(PokerGame.bestHandFromHandAndCards(highCardTen, myCards57).handRank).toBe(PokerHand.Ranks.straight);
});
