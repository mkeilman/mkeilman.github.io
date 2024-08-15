//
//  Pot.js
//  GutShot
//
//  Created by Michael Keilman on 2024-08-09.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//
import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PokerPlayer} from './PokerPlayer.js';


class PokerPot extends BoundMethodsObject {

    static KEY_POT = 'pot'
    static KEY_POT_AMOUNT = `${PokerPot.KEY_POT}.amount`;
    static KEY_POT_PLAYERS = `${PokerPot.KEY_POT}.players`;

	static fromJSON(json) {
		const d = json[`${PokerPot.KEY_POT}`];

		return new PokerPot(
			d[PokerPot.KEY_POT_AMOUNT],
			d[PokerPot.KEY_POT_PLAYERS]
		);
	}

	constructor(amt= 0, players=[]) {
        super();
		this.amount = amt
		this.playersInPot = players;
	}

    description() {
		return `Amount: ${this.amount}; players: ${this.playersInPot}`;
	}

	hasPlayer(player)  {
		return this.playersInPot.includes(player.playerID);
	}
	
	addPlayer(player) {
		if (! this.hasPlayer(player)) {
			this.playersInPot.push(player.playerID);
		}
	}
	
	removePlayer(player) {
		if (! this.hasPlayer(player)) {
			return;
		}
		this.playersInPot.splice(this.playersInPot.indexOf(player.playerID), 1);
	}
	
	toJSON() {
        const json = {};
        json[PokerPot.KEY_POT] = {};
        json[PokerPot.KEY_POT][PokerPot.KEY_POT_AMOUNT] = this.amount;
        json[PokerPot.KEY_POT][PokerPot.KEY_POT_PLAYERS] = this.playersInPot;
		return json;
	}

}

export {PokerPot};
