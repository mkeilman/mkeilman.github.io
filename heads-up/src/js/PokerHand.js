//
//  PokerHand.js
//  HeadsUp
//
//  Created by Michael Keilman on 2024-07-31.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//

'use strict';

import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PlayingCard} from './PlayingCard.js'
import {Utils} from './Utils.js'

class PokerHand extends BoundMethodsObject {

    static lowestHand = new PokerHand(
        [
            new PlayingCard('club', 'seven'),
            new PlayingCard('diamond', 'five'),
            new PlayingCard('heart', 'four'),
            new PlayingCard('spade', 'trey'),
            new PlayingCard('club', 'deuce'),
        ]
    );

	static highestHand = new PokerHand(
        [
            new PlayingCard('spade', 'ten'),
            new PlayingCard('spade', 'jack'),
            new PlayingCard('spade', 'queen'),
            new PlayingCard('spade', 'king'),
            new PlayingCard('spade', 'ace'),
        ]
    );

    static Ranks = {
        highCard: 0,
	    pair: 1,
        twoPair: 2,
        threeOfAKind: 3,
        straight:4,
        flush: 5,
        fullHouse: 6,
        fourOfAKind: 7,
        straightFlush: 8,
        royalFlush: 9,
    };

    // indices of the community cards ([0,1,2,3,4]) used to make hands
    static COMBO_INDICES = [
        [
            // make hand from 3 community cards plus...
            // ...both player cards
            [0,1,2]
        ],
        [
            // make hand from 4 community cards plus...
            // ...one player card
            [0,1,2,3],
            // ...both player cards
            [0,1,2], [0,2,3], [0,1,3], [1,2,3]
        ],
        [
            // make hand from 5 community cards plus...
            // ...no player cards
            [0,1,2,3,4],
            // ...one player card
            [0,1,2,3], [0,1,2,4], [0,1,3,4], [0,2,3,4], [2,3,4,1],  [1,2,3,4],
            // ...both player cards
            [0,1,2], [0,1,3], [0,1,4], [0,2,3], [0,2,4], [0,3,4],
            [1,2,3], [1,2,4], [1,3,4],
            [2,3,4]
        ]
    ];

    static cardsInRankOrderAceLow(cards, isAceLow= false)  {
		const cro = cards.toSorted((a, b) => a.lt(b));
        if (! isAceLow || cro[cro.length - 1].rank === PlayingCard.Ranks.ace) {
            return cro;
        }
        cro.reverse();
        for (let i = 1; i <= cro.length - 1; ++i) {
            const t = cro[i];
            cro[i] = cro[i - 1];
            cro[i - 1] = t;
        }
		return cro;
	}

	static kicker(hand1, hand2) {
		const hr1 = hand1.handRank;
		const hr2 = hand2.handRank;

		// if the hands are the same, or the ranks are different, there is no tiebreaker
		if (hr1 !== hr2 || hand1.equals(hand2)) {
			return null;
		}

		const bestHand = PokerHand.max(hand1, hand2);
		const worstHand = PokerHand.min(hand1, hand2);

		if (hr1 === PokerHand.Ranks.fourOfAKind) {
			return bestHand.cardsGroupedByRank[1][0];
		}
		if (hr1 === PokerHand.Ranks.threeOfAKind || hr1 === PokerHand.Ranks.pair) {
			if (! hand1.cardsGroupedByRank[0][0].equals(hand2.cardsGroupedByRank[0][0])) {
				return null;
			}
			return PlayingCard.highestCardInSubsets(
				bestHand.cards.filter(x => ! PlayingCard.includes(bestHand.cardsGroupedByRank[0], x)),
				worstHand.cards.filter(x => ! PlayingCard.includes(worstHand.cardsGroupedByRank[0], x))
			);
		}
		if (hr1 === PokerHand.Ranks.twoPair) {
			if (hand1.cardsGroupedByRank[1][0].equals(hand2.cardsGroupedByRank[1][0]) && hand1.cardsGroupedByRank[0][0].equals(hand2.cardsGroupedByRank[0][0])) {
				return bestHand.cardsGroupedByRank[2][0];
			}
		}
		return null;
	}

	static kickersAgainstHands(hand, otherHands) {
		const kArr = otherHands
			.map(x => PlayingCard.kicker(hand, x))
			.filter(x => x)
			.map(x => x.toString());
		return Array.from(new Set(kArr)).map(x => PlayingCard.fromString(x));
	}

	static kickersDesc(cards) {
		if (! cards.length) {
			return '';
		}

		let ks = '';
		for (let i = 0; i < cards.length - 1; ++i) {
			ks += `${cards[i].rank}, `;
		}
		return ks + `${cards[cards.length - 1].rank} Kicker${cards.length > 1 ? 's' : ''}`;
	}

	static max(hand1, hand2) {
		return hand1.lt(hand2) ? hand2 : hand1;
	}

	static min(hand1, hand2) {
		return hand1.lt(hand2) ? hand1 : hand2;
	}

    constructor(cards) {
        const _getHandRank = () =>  {
            for (const r of Object.keys(PokerHand.Ranks)) {
                if (this[`is${Utils.capitalize(r)}`]()) {
                    return PokerHand.Ranks[r];
                }
            }
            return null;
	    }

        super();
        if (cards.length !== 5) {
            throw new Error(`Must supply 5 cards (num cards = ${cards.length})`);
        }

        this.cards = cards;
        this.highestCard = PlayingCard.highestCardInSubset(cards);
        this.cardsGroupedByRank = this.groupByRank();
        this.handRank = _getHandRank();
		this.descriptions = this.buildDescriptions();
		this.descriptionsNoSuits = this.buildDescriptions(false);
    }

	buildDescriptions(includeSuits = true, shorten = false) {
		const self = this;
		const desc = {};
        function _straight(shorten) {
			if (shorten) {
				return 'Straight';
			}
            return `
				Straight to the ${
					self.isStraightAceLow(true) ?
						self.cardsInRankOrderAceLow(true)[this.cards.length - 1] :
						this.highestCard
				}
			`;
        }

        function _twoPair(shorten) {
			if (shorten) {
				return 'Two Pair';
			}
            const c11 = this.cardsGroupedByRank[0][0];
			const c12 = this.cardsGroupedByRank[0][1]
			const c21 = this.cardsGroupedByRank[1][0];
			const c22 = this.cardsGroupedByRank[1][1];
			if (c11.rank === PlayingCard.Ranks.eight && c21.rank === PlayingCard.Ranks.ace) {
                if ((c11.suit === PlayingCard.Suits.club && c12.suit === PlayingCard.Suits.spade) || (c11.suit === PlayingCard.Suits.spade && c12.suit === PlayingCard.Suits.club)) {
                    if ((c21.suit === PlayingCard.Suits.club && c22.suit === PlayingCard.Suits.spade) || (c21.suit === PlayingCard.Suits.spade && c22.suit === PlayingCard.Suits.club)) {
                        return `Dead Man's Hand`;
                    }
                }
			}
            return `${c21.rank.rawValue}s and ${c11.rank.rawValue}s`;
        }

        desc[`${PokerHand.Ranks.royalFlush}`] = 'Royal Flush!';
		desc[`${PokerHand.Ranks.straightFlush}`] = 'Straight Flush' + shorten ? '' : ` to the ${this.highestCard}`;
		desc[`${PokerHand.Ranks.fourOfAKind}`] = `Four ${this.cardsGroupedByRank[0][0].rank}s`;
		desc[`${PokerHand.Ranks.fullHouse}`] = 'Full House' + shorten ? '' : ` ${this.cardsGroupedByRank[0][0].rank}s over ${this.cardsGroupedByRank[1][0].rank}s`;
		desc[`${PokerHand.Ranks.flush}`] = `${includeSuits && ! shorten ? self.cards[0].suit + ' ' : ''}Flush`;
		desc[`${PokerHand.Ranks.straight}`] = _straight(shorten);
        desc[`${PokerHand.Ranks.threeOfAKind}`] = `Trip ${self.cardsGroupedByRank[0][0].rank}s`;
        desc[`${PokerHand.Ranks.twoPair}`] = _twoPair(shorten);
        desc[`${PokerHand.Ranks.pair}`] = `Pair of ${self.cardsGroupedByRank[0][0].rank}s`;
        desc[`${PokerHand.Ranks.highCard}`] = `${self.highestCard} High`;

		return desc;
    }

	description(rank) {
		return rank ? this.descriptions[rank] : 'Nothing';
	}

    groupByRank(cards) {
		const cardGroups = [];
		let lastCard;
        let cardGroup= [];
		for (const card of PokerHand.cardsInRankOrderAceLow(cards)) {
            // first card in hand
			if (! lastCard) {
				cardGroup.push(card);
			}
			else {
				if (card.gt(lastCard)) {
					cardGroups.push(cardGroup);
					cardGroup = [];
                    cardGroup.push(card);
				}
                // must be equal since they came in sorted
				else {
					cardGroup.push(card);
				}
			}
			lastCard = card;
		}
		cardGroups.push(cardGroup);
		cardGroups.sort((a, b) => a.length - b.length);
		return cardGroups;
    }

    equals(otherHand) {
        if (this.handRank !== otherHand.handRank) {
            return false;
        }

        const hr = this.handRank;
		const cg = this.cardsGroupedByRank;
        if (hr === PokerHand.Ranks.royalFlush) {
            return true;
        }
        if (hr === PokerHand.Ranks.straightFlush) {
            return this.highestCard === otherHand.highestCard;
        }
        if (hr === PokerHand.Ranks.fourOfAKind) {
            return cg[0][0] === otherHand.cardsGroupedByRank[0][0] &&
                cg[1][0] === otherHand.cardsGroupedByRank[1][0];
        }
        if (hr === PokerHand.Ranks.fullHouse) {
            return cg[0][0] === otherHand.cardsGroupedByRank[0][0] &&
                cg[1][0] === otherHand.cardsGroupedByRank[1][0];
        }
        if (hr === PokerHand.Ranks.flush) {
            return PlayingCard.isHighCardLess(this.cards, otherHand.cards);
        }
        if (hr === PokerHand.Ranks.straight) {
            return this.highestCard = otherHand.highestCard;
        }
        if (hr === PokerHand.Ranks.threeOfAKind) {
            return cg[0][0] === otherHand.cardsGroupedByRank[0][0] &&
                cg[1][0] === otherHand.cardsGroupedByRank[1][0] &&
                cg[2][0] === otherHand.cardsGroupedByRank[2][0];
        }
        if (hr === PokerHand.Ranks.twoPair) {
            return cg[0][0] === otherHand.cardsGroupedByRank[0][0] &&
                cg[1][0] === otherHand.cardsGroupedByRank[1][0] &&
                cg[2][0] === otherHand.cardsGroupedByRank[2][0];
        }
        if (hr === PokerHand.Ranks.pair) {
            if (cg[0][0] !== otherHand.cardsGroupedByRank[0][0]) {
                return false;
            }
            return ! PlayingCard.isHighCardLess(
                this.cards.filter(x => ! PlayingCard.includes(cg[0], x)),
                otherHand.cards.filter(x => ! PlayingCard.includes(otherHand.cardsGroupedByRank[0], x) )
            ) &&
                ! PlayingCard.isHighCardLess(
                    otherHand.cards.filter(x => ! PlayingCard.includes(otherHand.cardsGroupedByRank[0], x)),
                    this.cards.filter(x =>  ! PlayingCard.includes(cg[0], x))
                );
        }
        if (hr === PokerHand.Ranks.highCard) {
            return ! PlayingCard.isHighCardLess(this.cards, otherHand.cards);
        }
        return false;
	}

    gt(otherHand) {
        return ! this.equals(otherHand) && ! this.lt(otherHand);
    }

    isFlush() {
		return this.cards.every(x => x.suit === this.cards[0].suit);
	}

    isFourOfAKind() {
		return this.cardsGroupedByRank[0].count === 4;
	}

    isFullHouse() {
		return this.cardsGroupedByRank[0].length === 3 && this.cardsGroupedByRank[1].length === 2;
	}

    isPair() {
		return this.cardsGroupedByRank[0].length === 2 && this.cardsGroupedByRank[1].length === 1;
	}

    isRoyalFlush() {
		return this.isStraightFlush() && this.highestCard.rank === PlayingCard.Ranks.ace;
	}

    isStraight() {
        return this.isStraightAceLow() ? true : this.isStraightAceLow(true);
	}

    isStraightAceLow(isLow = false)  {
		let s = true;
		let cro = PokerHand.cardsInRankOrderAceLow(this.cards, isLow);
		let thisCard = cro[0];
        let nextCard;
		let thisVal = 0;
        let nextVal = 0;
		for (let i = 1; i < cro.length; ++i) {
			nextCard = cro[i];
			thisVal = isLow ? thisCard.lowValue : thisCard.value;
			nextVal = isLow ? nextCard.lowValue : nextCard.value;
			s = s && nextVal === thisVal + 1;
			thisCard = nextCard;
		}
		return s;
	}

    isStraightFlush() {
		return this.isStraight() && this.isFlush();
	}

    isThreeOfAKind() {
		return this.cardsGroupedByRank[0].length === 3 && this.cardsGroupedByRank[1].length === 1;
	}

    isTwoPair() {
		return this.cardsGroupedByRank[0].length === 2 && this.cardsGroupedByRank[1].length === 2;
	}

    lt(otherHand) {
        // royal flush can only be equal or greater
        if (this.handRank >= PokerHand.Ranks.royalFlush) {
            return false;
        }

        if (this.handRank < otherHand.handRank) {
            return true;
        }

        // same hand, check details
        const hr = this.handRank;
		const cg = this.cardsGroupedByRank;
        if (hr === PokerHand.Ranks.straightFlush) {
            return this.highestCard.lt(otherHand.highestCard);
        }
        if (hr === PokerHand.Ranks.fourOfAKind) {
            if (cg[0][0].lt(otherHand.cardsGroupedByRank[0][0])) {
			    return true;
            }
			if (cg[0][0].equals(otherHand.cardsGroupedByRank[0][0])) {
                return cg[1][0].lt(otherHand.cardsGroupedByRank[1][0]);
            }
            return false;
        }
        if (hr === PokerHand.Ranks.fullHouse) {
            if (cg[0][0].lt(otherHand.cardsGroupedByRank[0][0])) {
                return true;
            }
			if (cg[0][0].equals(otherHand.cardsGroupedByRank[0][0])) {
                return cg[1][0].lt(otherHand.cardsGroupedByRank[1][0]);
            }
            return false;
        }
        if (hr === PokerHand.Ranks.flush) {
            return PlayingCard.isHighCardLess(this.cards, otherHand.cards);
        }
        if (hr === PokerHand.Ranks.straight) {
            if (
                (this.isStraightAceLow() && otherHand.isStraightAceLow()) ||
                (this.isStraightAceLow(true) && otherHand.isStraightAceLow(true))
            ) {
                return this.highestCard.lt(otherHand.highestCard);
            }
            return this.isStraightAceLow(true);
        }
        if (hr === PokerHand.Ranks.threeOfAKind) {
            if (cg[0][0].lt(otherHand.cardsGroupedByRank[0][0])) {
                return true;
            }
			if (cg[0][0].equals(otherHand.cardsGroupedByRank[0][0])) {
                return PlayingCard.isHighCardLess(
                    this.cards.filter(x => ! PlayingCard.includes(cg[0], x)),
                    otherHand.cards.filter(x => ! PlayingCard.includes(otherHand.cardsGroupedByRank[0], x))
                );
            }
            return false;
        }
        if (hr === PokerHand.Ranks.twoPair) {
            if (cg[1][0].lt(otherHand.cardsGroupedByRank[1][0])) {
                return true;
            }
			if (cg[1][0].equals(otherHand.cardsGroupedByRank[1][0])) {
                if (cg[0][0].lt(otherHand.cardsGroupedByRank[0][0])) {
                    return true;
                }
                if (cg[0][0].equals(otherHand.cardsGroupedByRank[0][0])) {
                    return cg[2][0].lt(otherHand.cardsGroupedByRank[2][0]);
                }
            }
            return false;
        }
        if (hr === PokerHand.Ranks.pair) {
            if (cg[0][0].lt(otherHand.cardsGroupedByRank[0][0])) {
                return true;
            }
			if (cg[0][0].equals(otherHand.cardsGroupedByRank[0][0])) {
                return PlayingCard.isHighCardLess(
                    this.cards.filter(x => ! PlayingCard.includes(cg[0], x)),
                    otherHand.cards.filter(x => ! PlayingCard.includes(otherHand.cardsGroupedByRank[0], x) )
                );
            }
            return false;
        }
        if (hr === PokerHand.Ranks.highCard) {
            return PlayingCard.isHighCardLess(this.cards, otherHand.cards);
        }
        return false;
	}

    // the "meat" of a hand excluding irrelevant cards
    pertinentCards() {
		if (
            this.isRoyalFlush() ||
            this.isStraightFlush() ||
            this.isStraight() ||
            this.isFullHouse() ||
            this.isFlush()
        ) {
			return this.cards;
		}

		if (this.isFourOfAKind() || this.isThreeOfAKind() || this.isPair()) {
			return this.cardsGroupedByRank[0];
		}

		if (this.isTwoPair()) {
			return this.cardsGroupedByRank[0].concat(this.cardsGroupedByRank[1]);
		}

		return this.highestCard;
    }

    ranksInHand() {
        const r = {};
        Object.keys(PlayingCard.Ranks).forEach(x => {
            r[x] = 0;
        });
		for (let c of this.cards) {
            r[c.rank] = r[c.rank] + 1;
		}
		return r;
	}

    suitsInHand() {
        const s = {};
        Object.keys(PlayingCard.Suits).forEach(x => {
            s[x] = 0;
        });
		for (const c of this.cards) {
            s[c.suit] = s[c.suit] + 1;
		}
		return s;
    }

	toJSON() {
		return {
			cards:  this.cards.map(x => x.toJSON())
		};
	}

	toString() {
		return `${self.cards}`;
	}
}


/*
	init?( json: [String:Any] ) {
		if let handArr = json[KEY_POKER_HAND] as? [[String:Any]] {
			var card: StandardCard?
			for (cjIndex, cj) in handArr.enumerated() {
				card = StandardCard(json: cj);
				if card != nil {
					self.cards[cjIndex] = card!
				}
			}
			setCardsGroupedByRank()
			buildHandRank()
		}
		else {
			return nil
		}
	}
*/

export {PokerHand}
