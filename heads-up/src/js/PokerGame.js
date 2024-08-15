//
//  PokerGame.js
//  HeadsUp
//
//  Created by Michael Keilman on 2024-07-26.
//  Copyright © 2024 Michael Keilman. All rights reserved.
//

import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PlayingCard} from './PlayingCard.js'
import {PokerDeck} from './PokerDeck.js';
import {PokerHand} from './PokerHand.js';
import {PokerPlayer} from './PokerPlayer.js';
import {PokerPot} from './PokerPot.js';
import {debugLog, Utils} from './Utils.js'

class PokerGame extends BoundMethodsObject {

    static States = {
        none: 'none',
        new: 'new',  // pre-invite
        invite: 'invite',
        quorumReachedTimeRemains: 'quorumReachedTimeRemains',
        quorumReachedTimeExpired: 'quorumReachedTimeExpired',
        quorumFailedTimeExpired: 'quorumFailedTimeExpired',
        ready: 'ready',
        preFlop: 'preFlop',
        preTurn: 'preTurn',
        preRiver: 'preRiver',
        finalBets: 'finalBets',
        handOver: 'handOver',
        gameOver: 'gameOver',
        gameCanceled: 'gameCanceled',
    };

	static COMPLETE_STATES = [
		PokerGame.States.gameOver,
		PokerGame.States.state === PokerGame.States.quorumFailedTimeExpired,
		PokerGame.States.state === PokerGame.States.gameCanceled,
	];

	static IN_PROGRESS_STATES = [
		PokerGame.States.quorumReachedTimeExpired,
		PokerGame.States.state === PokerGame.States.ready,
		PokerGame.States.state === PokerGame.States.preFlop,
		PokerGame.States.state === PokerGame.States.preTurn,
		PokerGame.States.state === PokerGame.States.preRiver,
		PokerGame.States.state === PokerGame.States.finalBets,
		PokerGame.States.state === PokerGame.States.handOver,
	];

	static INVITING_STATES = [
		PokerGame.States.invite,
		PokerGame.States.state === PokerGame.States.quorumReachedTimeRemains,
	];

    static Blinds = {
        small: 0,
        big: 1,
    };

    static SMALL_BLINDS = [
        5, 10, 15, 20, 25, 50, 75, 100, 150, 200
    ];
    static CHIP_VALUES = [
        1, 5, 10, 25, 100
    ];

    static GAME_TOKENS  = [
        '♣︎♣︎','♣︎♦︎','♣︎♥︎','♣︎♠︎','♣︎♧','♣︎♢','♣︎♡','♣︎♤',
        '♦︎♣︎','♦︎♦︎','♦︎♥︎','♦︎♠︎','♦︎♧','♦︎♢','♦︎♡','♦︎♤',
        '♥︎♣︎','♥︎♦︎','♥︎♥︎','♥︎♠︎','♥︎♧','♥︎♢','♥︎♡','♥︎♤',
        '♠︎♣︎','♠︎♦︎','♠︎♥︎','♠︎♠︎','♠︎♧','♠︎♢','♠︎♡','♠︎♤',
        '♧♣︎','♧♦︎','♧♥︎','♧♠︎','♧♧','♧♢','♧♡','♧♤',
        '♢♣︎','♢♦︎','♢♥︎','♢♠︎','♢♧','♢♢','♢♡','♢♤',
        '♡♣︎','♡♦︎','♡♥︎','♡♠︎','♡♧','♡♢','♡♡','♡♤',
        '♤♣︎','♤♦︎','♤♥︎','♤♠︎','♤♧','♤♢','♤♡','♤♤',
    ];

    static KEY_GAME_MODEL = 'game';
    static KEY_GAME_ID = `${PokerGame.KEY_GAME_MODEL}.gameID`;
    static KEY_GAME_STATE_ID = `${PokerGame.KEY_GAME_MODEL}.stateID`;
    static KEY_GAME_SERVER_AUTH_TOKEN = `${PokerGame.KEY_GAME_MODEL}.authToken`;
    static KEY_GAME_STATE = `${PokerGame.KEY_GAME_MODEL}.gameState`;
    static KEY_GAME_DECK = `${PokerGame.KEY_GAME_MODEL}.deck`;
    static KEY_GAME_POTS = `${PokerGame.KEY_GAME_MODEL}.pots`;
    static KEY_GAME_POT = `${PokerGame.KEY_GAME_MODEL}.pot`;
    static KEY_GAME_COMMUNITY_CARDS = `${PokerGame.KEY_GAME_MODEL}.communityCards`;
    static KEY_GAME_PLAYERS = `${PokerGame.KEY_GAME_MODEL}.players`;
    static KEY_GAME_CURRENT_POSITION = `${PokerGame.KEY_GAME_MODEL}.currentPosition`;
    static KEY_GAME_BUTTON_POSITION = `${PokerGame.KEY_GAME_MODEL }.buttonPosition`;
    static KEY_GAME_ROUND = `${PokerGame.KEY_GAME_MODEL}.round`;
    static KEY_GAME_TOKEN = `${PokerGame.KEY_GAME_MODEL}.token`;

	static nextToken(currentToken) {
		const tokenIndex = PokerGame.GAME_TOKENS.indexOf(currentToken || "");
		if (tokenIndex >= 0) {
			return PokerGame.GAME_TOKENS[(tokenIndex + 1) % PokerGame.GAME_TOKENS.length];
		}
		return PokerGame.GAME_TOKENS[0];
	}

	static bestHandFromHandAndCards(commonHand, playerCards) {
		return PokerGame.bestHandFromCards(commonHand.cards, playerCards);
	}

	static bestHandFromCards(commonCards, playerCards) {
		if (commonCards.length < 3 || commonCards.length > 5 || playerCards.length !== 2) {
			return null;
		}

		const hArrIndex = (commonCards.length === 3 ? 0 : (commonCards.length === 4 ? 1 : 2 ));

		let hand;
		let newCards;
		let pCards;
		let cCards;

		for (const hArr of PokerHand.COMBO_INDICES[hArrIndex]) {
			cCards = Utils.distinctElementsAtPositions(commonCards, hArr);
			newCards = cCards;
			// number of cards from player
			const j = 5 - newCards.length;
			const k = j === 1 ? 1 : 0;
			for (let l = 0; l <= k; ++l) {
				newCards = cCards;
				pCards = [];
				for (let i = 0; i < j; ++i) {
					pCards.push(playerCards[i + l]);
				}
				newCards = newCards.concat(pCards);
				const newHand = new PokerHand(newCards);
				if (! hand || newHand.gt(hand)) {
					hand = newHand;
				}
			}
		}  // end loop over hand arrays
		return hand;
	}

	static fromJSON(json) {
		const d = json[PokerGame.KEY_GAME_MODEL];
		const p = d[PokerGame.KEY_GAME_PLAYERS].map(x => PokerPlayer.fromJSON(x));
		const g = new PokerGame(p.length);
		g.gameID = d[PokerGame.KEY_GAME_ID];
		g.stateID = d[PokerGame.KEY_GAME_STATE_ID];
		g.authToken = d[PokerGame.KEY_GAME_SERVER_AUTH_TOKEN];
		g.gameToken = d[PokerGame.KEY_GAME_TOKEN];
		g.state = d[PokerGame.KEY_GAME_STATE];
		g.deck = PokerDeck.fromJSON(d[PokerGame.KEY_GAME_DECK]);
		g.communityCards = d[PokerGame.KEY_GAME_COMMUNITY_CARDS].map(x => PlayingCard.fromJSON(x));
		g.currentPosition = d[PokerGame.KEY_GAME_CURRENT_POSITION];
		g.buttonPosition = d[PokerGame.KEY_GAME_BUTTON_POSITION];
		g.handNumber = d[PokerGame.KEY_GAME_ROUND];
		g.pots = d[PokerGame.KEY_GAME_POTS].map(x => PokerPot.fromJSON(x));

        return g;
    }

	static initWithPlayers(players) {
		const g = new PokerGame(null, 0);
		g.players = players;
		return g;
	}

    constructor(numPlayers=2) {
		super();
		//let gameID: UUID
		//var authToken: String?
		//var gameToken: String = ""  // used to identify a game
		//var stateID: UUID  // changed every time a player changes something
		//var inviteTime: Date?

		this.gameID = crypto.randomUUID();
		this.stateID = crypto.randomUUID();
		this.state = PokerGame.States.new;
		this.deck = new PokerDeck(true);

		this.state = PokerGame.States.new;
		this.pots = [];
		this.communityCards = [];
		this.players = [];
		this.buttonPosition = 0;
		this.currentPosition = 0;
		this.handNumber = 0;

		for (let i = 1; i <= numPlayers; ++i) {
			this.players.push(new PokerPlayer());
		}
		this.state = PokerGame.States.ready;
    }
	
	isInProgress() {
		return PokerGame.IN_PROGRESS_STATES.includes(this.state);
	}
	
	isComplete() {
		return PokerGame.COMPLETE_STATES.includes(this.state);
	}

	isInviting() {
		return PokerGame.INVITING_STATES.includes(this.state);
	}

	playersInPots() {
		const pip  = [];
		for (const pot of this.pots) {
			pip.push(
				pot.playersInPot.filter(x => this.playerWithID(x)).map(x => this.playerWithID(x))
			);
		}
		return pip;
	}

	potsWithPlayer(player) {
		return this.pots.filter(x => x.playersInPot.includes(player.playerID));
	}

	currentPlayers() {
		return this.players.filter(x =>
			x.gameState === PokerPlayer.PlayerGameStates.alive ||
			x.gameState === PokerPlayer.PlayerGameStates.busted ||
			x.gameState === PokerPlayer.PlayerGameStates.winner
		);
	}

	playersStillToJoin() {
		return this.players.filter(x => x.gameState === PokerPlayer.PlayerGameStates.invitedNotAccepted);
	}

	playersInHand() {
		return this.playersInHandIncludingAllIn().filter(x => x.stake > 0);
	}

	playersInHandIncludingAllIn() {
		return this.currentPlayers().filter(x => x.handState === PokerPlayer.PlayerHandStates.playing && ! x.wentAllInPreviousRound());
	}

	playersStillInWhoHaveBetThisRound() {
		return this.playersInHand().filter(x => x.lastAction !== PokerPlayer.RoundActions.none);
	}

	playersWhoHaveBetThisRound()  {
		return this.playersInHandIncludingAllIn().filter(x => PokerPlayer.isBettingAction(x.lastAction));
	}

	playersStillInWhoHaveBetThisRoundExcluding(player)  {
		return this.playersStillInWhoHaveBetThisRound().filter(x => x !== player);
	}
	
	numPlayersLeftToJoin() {
		return this.playersStillToJoin().length;
	}

	playerWithID(pID) {
		return this.players.filter(x => x.playerID === pID)[0];
	}

	positionsStillInHand() {
		const posArr= [];
		for (const p of this.playersInHand()) {
			posArr.push(p.position);
		}
		return posArr;
	}

	playersStillInGame() {
		return this.currentPlayers().filter(x => x.gameState === PokerPlayer.PlayerHandStates.alive || x.gameState === PokerPlayer.PlayerHandStates.winner)
	}

	playersOutOfGame() {
		return this.currentPlayers().filter(x => x.gameState === PokerPlayer.PlayerHandStates.busted);
	}

	lastPosition() { // really last position, not modulo folded players etc
		return (this.currentPosition + this.currentPlayers().length - 1) % this.currentPlayers().length;
	}

	playerAtCurrentPosition() {
		return this.currentPlayers()[this.currentPosition];
	}

	playerAtLastPosition() {
		return this.currentPlayers()[this.lastPosition];
	}

	lastBettingPlayer() {
		return this.lastBettingPlayerFromPlayer(this.playerAtCurrentPosition());
	}

	lastBettingPlayerFromPlayer(player) {
		let cp = player.position;
		let lp = cp;
		let done= false;
		let lbp;

		const curr = this.currentPlayers();
		const n = curr.length;
		do {
			lp = (lp + n - 1) % n;
			if (lp !== cp) {
				lbp = curr[lp];
				done = lbp.lastAction !== PokerPlayer.RoundActions.fold && lbp.lastAction !== PokerPlayer.RoundActions.none;
			}
			else {  // back to the original position
				done = true;
			}
		} while (! done)
		
		return lbp;
	}

	haveAllPlayersActedThisRound() {
		return this.playersStillInGame().reduce((p, c) => c && p.lastAction !== PokerPlayer.RoundActions.none, true);
	}

	didPlayersCheckAround() {
		return this.playersStillInGame().reduce((p, c) => c && p.lastAction === PokerPlayer.RoundActions.check, true);
	}
	
	// blinds follow button, which means they may end up in an empty seat
	smallBlindPositon() {
		let offset = this.currentPlayers().length > 2 ? 1 : 0;
		return (this.buttonPosition + offset) % this.currentPlayers().length;
	}

	hasSmallBlindBeenPlayed() {
		return this.playersStillInGame()
			.reduce((p, c) => c || p.lastAction === PokerPlayer.RoundActions.smallBlind, false);
	}

	bigBlindPosition() {
		return (this.buttonPosition + (this.currentPlayers().length > 2 ? 2 : 1)) % this.currentPlayers().length;
	}

	// big blind can be missed after players bust out (start > 2 players, down to 2)
	isBigBlindInGame() {
		return this.playersStillInGame().reduce((p, c) =>p ||  c.position === this.bigBlindPosition(), false);
	}

	hasBigBlindBeenPlayed() {
		return this.playersStillInGame().reduce((p, c) => p || c.lastAction === PokerPlayer.RoundActions.bigBlind, false);
	}

	nextPosition() {
		const cp = this.currentPosition;
		let np = cp;
		let done = false;

		do {
			np  = (np + 1) % this.currentPlayers().length
			if (np !== cp) {
				const player = this.currentPlayers()[np];
				done = player.handState === PokerPlayer.PlayerGameStates.playing && player.stake > 0;
			}
			else {  // back to the original position
				done = true;
			}
			
		} while (! done);

		return np;
	}

	goToNextPosition() {
		this.currentPosition = this.nextPosition();
	}
	
	// "simplified button"  - will move to next available seat.  Blinds may be missed
	nextButtonPosition() {
		const cp = this.buttonPosition;
		let np = cp;
		let done = false;

		do {
			np  = (np + 1) % this.currentPlayers().length;
			if (np !== cp) {
				const player = this.currentPlayers()[np];
				done = player.gameState === PokerPlayer.PlayerGameStates.alive;
			}
			else {  // back to the original position
				done = true
			}
		} while (! done);

		this.buttonPosition = np;
	}
	
	smallBlind() {
		return PokerGame.SMALL_BLINDS[Math.min(this.handNumber, PokerGame.SMALL_BLINDS.length - 1)];
	}

	bigBlind() {
		return 2 * this.smallBlind();
	}

	// only counts players who have bet something
	playersSortedByTotalBetsInRound()  {
		return this.currentPlayers()
			.filter(x => x.totalBetsInRound() > 0)
			.sort((p1, p2) => p1.totalBetsInRound() - p2.totalBetsInRound());
	}

	playersSortedByTotalBetsInRoundAndPot(potIndex) {
		return this.playersInPots()[potIndex]
			.filter(x => x.totalBetsInPotsInRound[potIndex] > 0 )
			.sort((p1, p2) => p1.totalBetsInRound() - p2.totalBetsInRound());
	}

	isAnyPlayerAllIn() {
		return this.playersSortedByTotalBetsInRound().reduce((p, c) => p || c.stake === 0, false);
	}

	isEveryPlayerButCurrentAllIn() {
		return this.playersInHand()
			.filter(x => x.position !== this.currentPosition)
			.reduce((p, c) => p && x.stake === 0, true);
	}
	
	minimumBet() {
		//let mb = 0;
		//for (let i = 0; i < this.pots.length; ++i) {
		//	mb += this.minimumBetInPot(i);
		//}
		return this.pots.reduce((p, c, i) => p + this.minimumBetInPot(i), 0);
		//return mb;
	}
	
	minimumBetInPot(potIndex) {
		let minBet = this.bigBlind();
		if (! this.isInProgress()) {
			return minBet;
		}
		if (! this.haveAnyBetsBeenMadeThisRound()) {
			return potIndex < this.pots.length - 1 ? 0 : minBet;
		}

		let matchBet = this.maxBetTotalInPot(potIndex);
		// bets have been made but none in this pot
		if (matchBet === 0 && ! PokerPlayer.isBettingAction(this.playerAtCurrentPosition.lastAction)) {
			
			// if bets have been made in the pots above this one, then since
			// this pot has no bets we can ignore it
			let upperMinBets = 0;
			for (let i = potIndex+1; i < this.pots.length; ++i) {
				upperMinBets += this.minimumBetInPot(i);
			}
			if (upperMinBets === 0) {  // no bets above, so look below
				let lowerMinBets = 0;
				for (let i = 0; i < potIndex; ++i) {
					lowerMinBets += this.minimumBetInPot(i);
				}
				if (! this.isEveryPlayerButCurrentAllIn()) {
					matchBet = Math.max(this.maxBetTotal(), this.bigBlind()) - lowerMinBets;
				}
			}
		}
		// can only happen if we started with > 2 players and are now at 2
		// therefore no side pots
		else if (! this.isBigBlindInGame()) {
			// player put in less than big blind...
			if (matchBet < this.bigBlind()) {
				 // ...player was not all in so it must have been small blind
				if (! this.isAnyPlayerAllIn()) {
					matchBet = this.bigBlind();
				}
			}
		}
		return matchBet - this.playerAtCurrentPosition().totalBetsInPotsInRound[potIndex];
	}
	
	minimumRaise() {
		let maxLastBet = Math.max(this.currentPlayers().map(x => x.currentBet));
		return maxLastBet > 0 ? 2 * maxLastBet : 2 * this.bigBlind();
	}
	
	raisePlus() {
		return this.minimumRaise() + this.minimumBet();
	}
	
	allBetsEqual() {
		let pihiacnt = this.playersInHandIncludingAllIn().length;
		if (pihiacnt <= 0) {
			return true;
		}
		
		let p0 = this.playersInHandIncludingAllIn()[0];
		let b0 = p0.totalBetsInRound();
		for (let i = 1; i < pihiacnt; ++i) {
			const p = this.playersInHandIncludingAllIn()[i];
			if (p.totalBetsInRound() === b0) {
				return false;
			}
		}
		return true;
	}
	
	allBetsEqualAfterBettingAround() {
		for(let i = 0; i < this.pots.length; ++i) {
			const pot = this.pots[i];
			let b0 = this.playerWithID(pot.playersInPot[0]).totalBetsInPotsInRound[i];
			for (let j = 1; j < this.playersInPots()[i].length; ++j) {
				let bi = this.playersInPots()[i][j].totalBetsInPotsInRound[i];
				if (bi !== b0) {
					return false;
				}
			}
		}
		return true;
	}
	
	allBetsEqualForPlayersNotAllIn() {
		const pihcnt = this.playersInHand().length;
		if (pihcnt <= 0) {
			return true;
		}
		
		const b0 = this.playersInHand()[0].totalBetsInRound();
		for (let i = 1; i < pihcnt; ++i) {
			if (this.playersInHand()[i].totalBetsInRound() !== b0) {
				return false;
			}
		}
		return true;
	}
	
	isRoundOver() {
		if (! this.haveAllPlayersActedThisRound()) {
			return false;
		}
		if (this.didPlayersCheckAround()) {
			return true;
		}
		if (this.allBetsEqual()) {
			return true;
		}

		if (this.playersInHandIncludingAllIn().length !== 2 || this.lastBettingPlayer() === null) {
			return this.playersInHand().length === 1 ? this.allBetsEqualAfterBettingAround() : this.allBetsEqualForPlayersNotAllIn();
		}
		return false;
	}
	
	maxBetTotal() {
		const p = this.playersSortedByTotalBetsInRound();
		return p[p.length - 1].totalBetsInRound();
	}

	maxBetTotalInPot(potIndex) {
		const p = this.playersSortedByTotalBetsInRoundAndPot(potIndex);
		return p[p.length - 1].totalBetsInPotsInRound[potIndex];
	}

	minBetTotal() {
		return this.playersSortedByTotalBetsInRound()[0].totalBetsInRound;
	}
	
	haveAnyBetsBeenMadeThisRound() {
		return this.currentPlayers().reduce((p, c) => p + c.totalBetsInRound(), 0)  > 0;
	}

	toJSON()  {
		const pj = this.pots.map(x => x.toJSON());
		const json = {};
		json[`${PokerGame.KEY_GAME_MODEL}`] = {};
		const j = json[`${PokerGame.KEY_GAME_MODEL}`];
		j[`${PokerGame.KEY_GAME_ID}`] = this.gameID;
		j[`${PokerGame.KEY_GAME_STATE_ID}`] = this.stateID;
		//j[`${PokerGame.KEY_GAME_SERVER_AUTH_TOKEN}`] = this.authToken || "";
		//j[`${PokerGame.KEY_GAME_TOKEN}`] = this.gameToken;
		j[`${PokerGame.KEY_GAME_STATE}`] = this.state;
		j[`${PokerGame.KEY_GAME_DECK}`] = this.deck.toJSON();
		j[`${PokerGame.KEY_GAME_POTS}`] = pj;
		j[`${PokerGame.KEY_GAME_COMMUNITY_CARDS}`] = this.communityCards.map(x => x.toJSON());
		j[`${PokerGame.KEY_GAME_PLAYERS}`] = this.players.map(x => x.toJSON());
		j[`${PokerGame.KEY_GAME_CURRENT_POSITION}`] = this.currentPosition;
		j[`${PokerGame.KEY_GAME_BUTTON_POSITION }`] = this.buttonPosition;
		j[`${PokerGame.KEY_GAME_ROUND}`] = this.handNumber;
		return json;
	}

	totalOfallStakesButCurrent() {
		let ts = 0;
		const j = this.currentPosition;
		let i = 0;
		for (let k = 1; k < this.currentPlayers().length; ++k)  {
			i = (j + k) % this.currentPlayers().length;
			ts += this.currentPlayers()[i].stake;
		}
		return ts;
	}
	
	_compareBestHandsForPlayers(p1, p2) {
		const bh1 = this.bestHandForPlayer(p1);
		const bh2 = this.bestHandForPlayer(p2);
		if (bh1 === null) {
			return bh2 !== null  // nulls are equals
		}
		if (bh2 !== null) {
			return bh1 - bh2;
		}
		return false
	}

	bestHandForPlayer(player) {
		return PokerGame.bestHandFromCards(this.communityCards, player.currentCards);
	}

	playersInBestHandOrder() {
		return this.currentPlayers().sort(this._compareBestHandsForPlayers);
	}

	winningOrSplitPlayers() {
		if (this.state !== PokerGame.States.handOver) {
			return null;
		}
		
		const pibho = this.playersInBestHandOrder();
		const bhp = pibho[this.currentPlayers().length - 1];
		const bh = this.bestHandForPlayer(bhp);
		const pArr = [bhp];

		for (let i = 0; i < this.currentPlayers().length - 1; ++i) {
			const obhp = pibho[i];
			if (this.bestHandForPlayer(obhp).equals(bh)) {
				pArr.push(obhp);
			}
		}
		return pArr;
	}
	
	winningOrSplitPlayersInPot(pot) {
		if (this.state !== PokerGame.States.handOver && this.state !== PokerGame.States.gameOver) {
			return null;
		}

		let pArr;
		let pInPArr = pot.playersInPot
			.filter(x => this.playerWithID(x) != null )
			.map(x => this.playerWithID(x))
			.filter(x => x.handState !== PokerPlayer.PlayerHandStates.folded)
			.sort(this._compareBestHandsForPlayers);

		const bhp = pInPArr[pInPArr.length - 1];
		if (! bhp) {
			return null;
		}

		pArr = [bhp];
		for (let i = 0; i < pInPArr.length - 1; ++i) {
			const obhp = pInPArr[i];
			if (this.bestHandForPlayer(obhp).equals(this.bestHandForPlayer(bhp))) {
				pArr.push(obhp);
			}
		}
		return pArr;
	}
	
	winningPlayer(){
		return this.state === PokerGame.States.gameOver ?
			this.playersStillInGame().filter(x => x.gameState === PokerPlayer.PlayerGameStates.winner)[0] :
			null;
	}

	/*
	init?( json: [String:Any] ) {
		guard let gameDict: [String: AnyObject] = json[KEY_GAME_MODEL] as? [String: AnyObject] else {
			return null
		}
		guard let gID = gameDict[KEY_GAME_ID] as? String else {
			return null
		}
		guard let gUID = UUID(uuidString: gID) else {
			return null
		}
		
		this.gameID = gUID
		this.stateID = UUID(uuidString: gameDict[KEY_GAME_STATE_ID] as? String ?? "") ?? UUID()
		this.authToken = gameDict[KEY_GAME_SERVER_AUTH_TOKEN] as? String
		this.gameToken = gameDict[KEY_GAME_TOKEN] as? String ?? GAME_TOKENS[0]
		this.state = GameStates(rawValue: gameDict[KEY_GAME_STATE] as? String ?? "none") ?? .none
		this.deck = PokerDeck(json: gameDict[KEY_GAME_DECK] as? [String:Any] ?? [:]) ?? PokerDeck()
		
		if let pj = gameDict[KEY_GAME_POTS] as? [[String:Any]] {
			if pj.length > 0 {
				this.pots.removeAll()
				for p in pj {
					if let pot = Pot(json: p) {
						this.pots.append(pot)
					}
				}
			}
		}
		
		this.currentPosition = gameDict[KEY_GAME_CURRENT_POSITION] as? Int ?? NSNotFound
		this.buttonPosition = gameDict[KEY_GAME_BUTTON_POSITION] as? Int ?? NSNotFound
		this.handNumber = gameDict[KEY_GAME_ROUND] as? Int ?? 0
		
		if let cCards = gameDict[KEY_GAME_COMMUNITY_CARDS] as? [[String:Any]] {
			for ccDict in cCards {
				if let card = StandardCard(json: ccDict) {
					this.communityCards.append(card)
				}
			}
		}
		if let cPlayers = gameDict[KEY_GAME_PLAYERS] as? [[String:Any]] {
			for cpDict in cPlayers {
				if let p = Player(json: cpDict) {
					this.players.append(p)
				}
			}
		}
	}
	*/

/*
	// use this to rebuild game object to a previous state without creating a new object
	func refresh( json: [String:Any] ) {
		
		guard let gameDict: [String: AnyObject] = json[KEY_GAME_MODEL] as? [String: AnyObject] else {
			NSLog("GameModel.refresh - Bad JSON")
			return
		}
		guard let gID = gameDict[KEY_GAME_ID] as? String else {
			NSLog("GameModel.refresh - Bad Game ID")
			return
		}
		guard let gUID = UUID(uuidString: gID) else {
			NSLog("GameModel.refresh - Bad Game ID")
			return
		}
			
		// refresh local summary list
		/STAR
		let gameList = UserDefaults.standard.array(forKey: USER_DEFAULT_GAME_LIST) as? [[String:Any]] ?? [[String:Any]]()
		//gameSummary
		var idx = NSNotFound
		for (gsIdx, gs) in gameList.enumerated() {
			guard let gsGID = gs[KEY_GAME_ID] as? String else {
				continue
			}
			if gsGID == gID {
				idx = gsIdx
				break
			}
		}
		// no local summary
		if idx == NSNotFound {
			
		}
		 STAR/
		
		if gUID != this.gameID {
			NSLog("GameModel.refresh - Game IDs do not match")
			return
		}
			
		this.authToken = gameDict[KEY_GAME_SERVER_AUTH_TOKEN] as? String
		if let gt = gameDict[KEY_GAME_TOKEN] as? String {
			this.gameToken = gt
		}
		
		if let sid = gameDict[KEY_GAME_STATE_ID] as? String {
			this.stateID = UUID(uuidString: sid) ?? UUID()
		}
		
		// replace values where they are valid, otherwise ignore
		if let gsj = gameDict[KEY_GAME_STATE] as? String {
			if let gs = GameStates(rawValue: gsj) { this.state = gs }
		}
		if let dj = gameDict[KEY_GAME_DECK] as? [String:Any] {
			if let d = PokerDeck(json: dj) { this.deck = d }
		}
	
		if let pj = gameDict[KEY_GAME_POTS] as? [[String:Any]] {
			if pj.length > 0 {
				this.pots.removeAll()
				for p in pj {
					if let pot = Pot(json: p) {
						this.pots.append(pot)
					}
				}
			}
		}

		if let cp = gameDict[KEY_GAME_CURRENT_POSITION] as? Int {
			this.currentPosition = cp
		}
		if let bp = gameDict[KEY_GAME_BUTTON_POSITION] as? Int {
			this.buttonPosition = bp
		}
		if let hn = gameDict[KEY_GAME_ROUND] as? Int {
			this.handNumber = hn
		}
		if let cCards = gameDict[KEY_GAME_COMMUNITY_CARDS] as? [[String:Any]] {
			this.communityCards.removeAll()  // safe to replace objects
			for ccDict in cCards {
				if let card = StandardCard(json: ccDict) {
					this.communityCards.append(card)
				}
			}
		}
		if let cPlayers = gameDict[KEY_GAME_PLAYERS] as? [[String:Any]] {
			for (pIndex, p) in this.players.enumerated() {
				if pIndex < cPlayers.length {
					let cpDict = cPlayers[pIndex]
					p.refresh(json: cpDict)
				}
			}
		}
	}
*/
	
}

export {PokerGame}
