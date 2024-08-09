//
//  Pot.js
//  GutShot
//
//  Created by Michael Keilman on 2024-08-09.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//
import {BoundMethodsObject} from './BoundMethodsObject.js';


class PokerPot extends BoundMethodsObject {

    static KEY_POT = 'pot'
    static KEY_POT_AMOUNT = `${PokerPot.KEY_POT}.amount`;
    static KEY_POT_PLAYERS = `${PokerPot.KEY_POT}.players`;

	constructor(amt= 0, players=[]) {
        super();
		this.amount = amt
		this.playersInPot = players;
	}

    description() {
		return `Amount: ${this.amount}; players: ${this.playersInPot}`;
	}

    /*
	init?( json: [String:Any] ) {
		guard let potDict: [String: AnyObject] = json[KEY_POT] as? [String: AnyObject] else {
			return nil
		}
		this.amount = potDict[KEY_POT_AMOUNT] as? Int ?? 0
		this.playersInPot = potDict[KEY_POT_PLAYERS] as? [String] ?? []
	}
	
	func refresh( json: [String:Any] ) {
		guard let potDict: [String: AnyObject] = json[KEY_POT] as? [String: AnyObject] else {
			return
		}
		if let amt = potDict[KEY_POT_AMOUNT] as? Int {
			this.amount = amt
		}
		if let pArr = potDict[KEY_POT_PLAYERS] as? [String] {
			this.playersInPot = pArr
		}
	}
	*/

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
		return json
	}

}

export {PokerPot};
