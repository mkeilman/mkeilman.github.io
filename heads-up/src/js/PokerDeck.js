//
//  PokerDeck.js
//  HeadsUp
//
//  Created by Michael Keilman on 2024-07-26.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//

import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PlayingCard} from './PlayingCard.js'
import {Utils} from './Utils.js'

class PokerDeck extends BoundMethodsObject {

	static ranks = Object.keys(PlayingCard.Ranks);
	static suits = Object.keys(PlayingCard.Suits);

	static KEY_POKER_DECK = 'deck';
	static KEY_POKER_DECK_CARDS = `${PokerDeck.KEY_POKER_DECK}.cards`;
	static KEY_POKER_DECK_DEALT_CARDS = `${PokerDeck.KEY_POKER_DECK}.dealtCards`;
	static KEY_POKER_DECK_DISCARDS = `${PokerDeck.KEY_POKER_DECK}.discards`;
	static KEY_POKER_DECK_INDEX = `${PokerDeck.KEY_POKER_DECK}.deckIndex`;

	static freshCards() {
		const c = [];
		for (const s of PokerDeck.suits) {
			for (const r of PokerDeck.ranks) {
				c.push(new PlayingCard(s, r));
			}
		}
		return c;
	}

	static fromJSON(json) {
		const d = json[PokerDeck.KEY_POKER_DECK];
		const deck = new PokerDeck(
			false,
			d[PokerDeck.KEY_POKER_DECK_DEALT_CARDS].map(x => PlayingCard.fromJSON(x)),
			d[PokerDeck.KEY_POKER_DECK_DISCARDS].map(x => PlayingCard.fromJSON(x))
		);
		deck.cards = d[PokerDeck.KEY_POKER_DECK_CARDS].map(x => PlayingCard.fromJSON(x));
		deck.deckIndex = d[PokerDeck.KEY_POKER_DECK_INDEX];
		return deck;
	}

	constructor(doShuffle=false, dealtCards=[], discards=[]) {
		super();
        this.cards = PokerDeck.freshCards();
		// ignore dealt and discarded cards
		if (doShuffle) {
			this.shuffle();
		}
		else {
			this.setup(dealtCards, discards);
		}
	}

/*
	init?( json: [String:Any] ) {

		if let deckDict = json[KEY_POKER_DECK] as? [String:Any]  {
			self.deckIndex = deckDict[KEY_POKER_DECK_INDEX] as? Int ?? 0
			if let cArr = deckDict[KEY_POKER_DECK_CARDS] as? [[String:Any]] {
				var card: StandardCard?
				for cj in cArr {
					card = StandardCard(json: cj)
					if card != nil {
						self.cards.push(card!)
					}
					else {
						return nil
					}
				}
			}
		}
		else {
			return nil
		}
		for i in 0..<self.deckIndex {
			self.discards.push(self.cards[i])
		}
	}
*/

	burn(numCards= 1)  {
        if (this.deckIndex + numCards > this.cards.length) {
            return null;
        }

        const cards = [];
        for (let i = 1; i <= numCards; ++i) {
            const card = this.cards[this.deckIndex];
            this.discards.push(card);
            cards.push(card);
            this.deckIndex += 1;
        }
		return cards;
	}

	currentCard() {
		return this.deckIndex < this.cards.length ? this.cards[this.deckIndex] : null;
    }

	dealCard()  {
        if (this.deckIndex + 1 > this.cards.count) {
            return null;
        }
        const card = this.cards[this.deckIndex];
        this.dealtCards.push(card);
        this.deckIndex += 1;
		return card;
	}

	setup(dealtCards=[], discards=[]) {
		this.dealtCards = dealtCards;
        this.discards = discards;
		this.deckIndex = this.dealtCards.length + this.discards.length;
	}

	shuffle() {
		const newCardIndices = Utils.randomIndicesForArrayOfSize(this.cards.length);
		const newCards = [];
		for (let i = 0; i < this.cards.length; ++i) {
			newCards.push(this.cards[newCardIndices[i]]);
		}
		this.cards = newCards;
		this.setup();
	}

	toJSON() {
		const json = {};
		json[PokerDeck.KEY_POKER_DECK] = {};
		const d = json[PokerDeck.KEY_POKER_DECK];
		d[PokerDeck.KEY_POKER_DECK_CARDS] = this.cards.map(x => x.toJSON());
		d[PokerDeck.KEY_POKER_DECK_DEALT_CARDS] = this.dealtCards.map(x => x.toJSON());
		d[PokerDeck.KEY_POKER_DECK_DISCARDS] = this.discards.map(x => x.toJSON());
		d[PokerDeck.KEY_POKER_DECK_INDEX] = this.deckIndex;

		return json;
	}

	toString() {
		return `${this.cards}`;
	}
}

export {PokerDeck}
