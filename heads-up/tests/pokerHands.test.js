import { expect, test } from 'vitest'
import {PokerGame} from '../src/js/PokerGame.js';
import {PokerHand} from '../src/js/PokerHand.js';
import {PlayingCard} from '../src/js/PlayingCard.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('best hand', () => {
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

test('high card', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.eight),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.six),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.four),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.deuce)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.highCard);
    expect(hand.highestCard.rank).toBe(PlayingCard.Ranks.ten);
    expect(hand.highestCard.value()).toBe(10);
});

test('flush', () => {
    const flushHand1 = new PokerHand([
			new PlayingCard('club', 'deuce'),
			new PlayingCard('club', 'four'),
			new PlayingCard('club', 'ten'),
			new PlayingCard('club', 'king'),
			new PlayingCard('club', 'seven')
		]);
		expect(flushHand1.handRank).toBe(PokerHand.Ranks.flush);
});

