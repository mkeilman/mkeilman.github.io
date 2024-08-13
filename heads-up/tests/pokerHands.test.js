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
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.four),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.king),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.seven)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.flush);
});

test('flush comparison', () => {
    const hand1 = new PokerHand([
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.four),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.king),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.seven)
    ]);
    expect(hand1.handRank).toBe(PokerHand.Ranks.flush);

    const hand2 = new PokerHand([
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.four),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.king),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.ace)
    ]);
    expect(hand2.handRank).toBe(PokerHand.Ranks.flush);
    expect(PlayingCard.isHighCardLess(hand1.cards, hand2.cards)).toBeTruthy();
});

test('straight', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.seven),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.jack),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.nine),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.eight)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.straight);
});

test('straight ace low', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.ace),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.four),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.five)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.straight);
});

test('straight ace high', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.ace),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.king),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.jack),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.queen)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.straight);
});

test('straight flush', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.seven),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.jack),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.nine),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.eight)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.straightFlush);
});

test('royal flush', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.ten),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.ace),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.queen),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.jack),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.king)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.royalFlush);
});

test('four of a kind', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.deuce),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.king)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.fourOfAKind);
});

test('full house', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.eight),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.eight)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.fullHouse);
    expect(hand.handRank).not.toBe(PokerHand.Ranks.threeOfAKind);
});

test('three of a kind', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.eight),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.queen),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.trey)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.threeOfAKind);
});

test('two pair', () => {
    const hand = new PokerHand([
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.club, PlayingCard.Ranks.trey),
        new PlayingCard(PlayingCard.Suits.heart, PlayingCard.Ranks.eight),
        new PlayingCard(PlayingCard.Suits.diamond, PlayingCard.Ranks.queen),
        new PlayingCard(PlayingCard.Suits.spade, PlayingCard.Ranks.queen)
    ]);
    expect(hand.handRank).toBe(PokerHand.Ranks.twoPair);
    expect(hand.handRank).not.toBe(PokerHand.Ranks.pair);
});
