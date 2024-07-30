//
//  Deck.js
//  HeadsUp
//
//  Created by Michael Keilman on 2024-07-26.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//

import {PlayingCard} from './Card.js'
import {Utils} from './Utils.js'

class PokerDeck {

	static availableSuits = Object.keys(PlayingCard.Suits);

	static availableRanks = Object.keys(PlayingCard.Ranks);

	constructor() {
        this.cards = [];
        this.discards = [];
        this.dealtCards = [];
        this.deckIndex = 0;
		for (const s of PokerDeck.availableSuits) {
			for (const r of PokerDeck.availableRanks) {
				this.cards.push(new PlayingCard(s, r));
			}
		}
	}

    currentCard() {
		return this.deckIndex < this.cards.length ? this.cards[this.deckIndex] : null;
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
	shuffle() {
		const newCardIndices = Utils.randomIndicesForArrayOfSize(this.cards.length);
		const newCards = [];
		for (let i = 0; i < this.cards.length; ++i) {
			newCards.push(this.cards[newCardIndices[i]]);
		}
		this.cards = newCards;
		this.reset();
	}

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

	dealCard()  {
        if (this.deckIndex + 1 > this.cards.count) {
            return null;
        }
        const card = this.cards[this.deckIndex];
        this.dealtCards.push(card);
        this.deckIndex += 1;
		return card;
	}

	reset() {
		this.dealtCards = [];
		this.deckIndex = 0;
        this.discards = [];
	}

	toString() {
		return `${this.cards}`;
	}

    /*
	func toJSON() -> [String : Any] {

		var jCards : [[String : Any]] = []
		for card in self.cards {
			jCards.append(card.toJSON())
		}
		let json = [KEY_POKER_DECK:[
			KEY_POKER_DECK_CARDS : jCards,
			KEY_POKER_DECK_INDEX : self.deckIndex
		]]

		//if JSONSerialization.isValidJSONObject(json) {
		//	debugPrint("deck JSON OK")
		//}
		//else {
		//	debugPrint("deck JSON BAD")
		//}
		return json

	}
     */
}

export {PokerDeck}
