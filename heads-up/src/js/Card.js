//
//  Card.js
//  HeadsUp
//
//  Created by Michael Keilman on 2024-07-26.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//
'use strict';

import {BoundMethodsObject} from './BoundMethodsObject.js';
import {Utils} from './Utils.js';

class PlayingCard extends BoundMethodsObject {

    static Suits = {
        'club': '♣️',
        'diamond': '♦️',
        'heart': '♥️',
        'spade': '♠️',
    };

	static Ranks = {
        'deuce': '2',
        'trey': '3',
        'four': '4',
        'five': '5',
        'six': '6',
        'seven': '7',
        'eight': '8',
        'nine': '9',
        'ten': '10',
        'jack': 'J',
        'queen': 'Q',
        'king': 'K',
        'ace': 'A',
    };

    static Values = {
        'deuce' : 2,
        'trey' : 3,
        'four' : 4,
        'five' : 5,
        'six' : 6,
        'seven' : 7,
        'eight' : 8,
        'nine' : 9,
        'ten' : 10,
        'jack' : 11,
        'queen' : 12,
        'king' : 13,
	    'ace' : 14,
    };

    static LowValues = {
        'deuce' : 2,
        'trey' : 3,
        'four' : 4,
        'five' : 5,
        'six' : 6,
        'seven' : 7,
        'eight' : 8,
        'nine' : 9,
        'ten' : 10,
        'jack' : 11,
        'queen' : 12,
        'king' : 13,
	    'ace' : 1,
    };

    static exclude(card, cards) {
        return cards.filter((c) => ! c.equals(card));
    }

    static highestCardInSubset(subCards)  {
		return subCards.toSorted((a, b) => b.lt(a))[0];
	}

    static highestCardInSubsets(cards1, cards2)  {
        if (cards1.length === 0 || cards2.length === 0) {
            return null;
        }

        const card1 = PlayingCard.highestCardInSubset(cards1);
        const card2 = PlayingCard.highestCardInSubset(cards2);
        return card1.equals(card2) ?
			PlayingCard.highestCardInSubsets(
                PlayingCard.exclude(card1, cards1), PlayingCard.exclude(card2, cards2)
            ) :
            Math.max(card1.value(), card2.value());
	}

    static fromJSON(json) {
        return new PlayingCard(json.suit, json.rank);
    }

    static fromString(str) {
        const _ranks = Utils.invertMap(PlayingCard.Ranks);
        const _suits = Utils.invertMap(PlayingCard.Suits);
        return new PlayingCard(_ranks[str[0]], _suits[str[1]]);
    }

    static includes(cards, card) {
        return cards.map(x => x.toString()).includes(card.toString());
    }

    static isHighCardLess (cards1, cards2)  {
		let isLess = false;
        if (cards1.length === 0 || cards2.length === 0) {
            return false;
        }

        const card1 = PlayingCard.highestCardInSubset(cards1);
        const card2 = PlayingCard.highestCardInSubset(cards2);
        if (card1.lt(card2)) {
            return true;
        }
        if (card2.lt(card1)) {
            return false;
        }
        return PlayingCard.isHighCardLess(
            PlayingCard.exclude(card1, cards1), PlayingCard.exclude(card2, cards2)
        );
	}

    /**
     *
     * @param suit
     * @param rank
     */
    constructor(suit, rank) {
        super();
        this.suit = PlayingCard.Suits[suit];
        this.rank = PlayingCard.Ranks[rank];
    }

    equals(otherCard) {
        return this.value() === otherCard.value();
    }

    isSameAsCard(otherCard) {
        return self.equals(otherCard) && self.suit === otherCard.suit;
    }

    lowValue() {
		return PlayingCard.LowValues[self.rank];
	}

    gt(otherCard) {
        return this.value() > otherCard.value();
    }

    lt(otherCard) {
        return this.value() < otherCard.value();
    }

    value()  {
		return PlayingCard.Values[self.rank];
	}

    toString() {
        return `${this.suit}${this.rank}`;
    }

	toJSON()  {
		return {
            suit: this.suit,
            rank: this.rank,
        };
	}

}

export {PlayingCard};
