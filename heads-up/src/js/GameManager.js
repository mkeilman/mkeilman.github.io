import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PokerGame} from './PokerGame.js';
import {PokerHand} from './PokerHand.js';
import {PokerPlayer} from './PokerPlayer.js';
import {PokerPot} from './PokerPot.js';
import {Utils, debugLog} from './Utils.js';

class GameManager  extends BoundMethodsObject {
	constructor(game) {
		super();
		this.game = game
		this.lastGoodGameState = null;
	}
	
	shuffleUpAndDeal() {
		const self = this;
		function _setupActivePlayer(p) {
			p.handState = PokerPlayer.PlayerHandStates.playing;
			p.lastAction = PokerPlayer.RoundActions.none;
			p.hasButton = p.position === self.game.buttonPosition;
			p.isSmallBlind = p.position === self.game.smallBlindPositon();
			p.isBigBlind = p.position === self.game.bigBlindPosition();
			p.currentBet = 0;
			p.totalBetsInHand = 0;
			p.currentBets[0] = 0;
			p.totalBetsInPotsInRound[0] = 0;
			p.wentAllInPreviousRound = false;
		}
		
		function _setupInactivePlayer(p) {
			p.handState = PokerPlayer.PlayerHandStates.none;
			p.lastAction = PokerPlayer.RoundActions.none;
			p.hasButton = false;
			p.isSmallBlind = false;
			p.isBigBlind = false;
			p.currentCards = [];
		}

		this.game.deck.shuffle();
		if (this.game.state === PokerGame.States.ready) {
			for (const p of this.game.playersStillInGame()) {
				p.currentCards = [];
				p.currentCards.push(this.game.deck.dealCard());
				p.currentCards.push(this.game.deck.dealCard());
			}
			this.game.state = PokerGame.States.preFlop;
		}
		
		for (const p of this.game.playersStillInGame()) {
			_setupActivePlayer(p);
		}
		
		// for UI purposes mostly
		for (const p of this.game.playersOutOfGame()) {
			_setupInactivePlayer(p);
		}
		
		// put in blind bets now
		for (const p of this.game.playersInHand()) {
			if (p.hasButton) {
				this.game.currentPosition = p.position;
			}

			let bet = 0;
			if (p.isSmallBlind) {
				bet = Math.min(this.game.smallBlind(), p.stake);
				p.lastAction = PokerPlayer.RoundActions.smallBlind;
			}

			if (p.isBigBlind) {
				bet = Math.min(this.game.bigBlind(), p.stake);
				p.lastAction =  PokerPlayer.RoundActions.bigBlind;
			}
			
			if (bet > 0) {
				this.placeBlindBetForPlayer(bet, p);
			}
		}
	}
	
	placeBlindBetForPlayer(bet, player) {

		// build this before the bet is recorded
		const coverArr = [];

		for (let i = 0; i < this.game.pots.length; ++i) {
			coverArr.push(this.game.minimumBetInPot(i));
		}

		player.stake -= bet
		player.currentBet = bet
		player.lastBetInRound = bet
		player.totalBetsInHand += bet
		
		let numPots = this.game.pots.length;

		if (numPots > 1) {
			let betAmount = bet;
			for (let i = 0; i < this.game.pots.length; ++i) {
				let pot = this.game.pots[i];
				let toCover = coverArr[i];
				if (betAmount >= toCover) {
					pot.amount += toCover;
					player.currentBets[i] = toCover;
					player.totalBetsInPotsInRound[i] += toCover;
					player.totalBetsInPotsInHand[i] += toCover;
					betAmount -= toCover;
				}
				else {
					pot.amount += betAmount;
					player.currentBets[i] = betAmount;
					player.totalBetsInPotsInRound[i] += betAmount;
					player.totalBetsInPotsInHand[i] += betAmount;
					betAmount = 0;
				}
			}
		}
		else {
			this.game.pots[0].amount += bet;
			player.currentBets[0] = bet;
			player.totalBetsInPotsInRound[0] += bet;
			player.totalBetsInPotsInHand[0] += bet;
		}
		
		if (player.stake > 0) {
			return;
		}
			
		// create side pot for the remaining players (unless only one remains)
		if (this.game.playersInHand().length > 1) {
			this.game.pots.push(
				new PokerPot(0, this.game.playersInHand.map(x => x.playerID))
			);
			for (p of this.game.playersInHand()) {
				p.currentBets.push(0);
				p.totalBetsInPotsInRound.push(0)
				p.totalBetsInPotsInHand.push(0)
			}
		}

		numPots = this.game.pots.length;

		let playersIn = this.game.playersStillInWhoHaveBetThisRound();
		let numPlayersIn = playersIn.length;
		let moveToPot = false;

		for (const p of playersIn) {
			if (p === player) {
				continue;
			}
			if (p.totalBetsInRound() <= p.totalBetsInRound()) {
				continue;
			}
			
			let kickBack = p.currentBet - p.totalBetsInRound();

			// move extra from previous pot to newest pot
			if (numPots > 1 && numPlayersIn > 1) {
				this.game.pots[numPots - 1].amount += kickBack;
				this.game.pots[numPots - 2].amount -= kickBack;
				p.currentBets[numPots - 1] += kickBack;
				p.currentBets[numPots - 2] -= kickBack;
				p.totalBetsInPotsInRound[numPots - 1] += kickBack;
				p.totalBetsInPotsInRound[numPots - 2] -= kickBack;
				p.totalBetsInPotsInHand[numPots - 1] += kickBack;
				p.totalBetsInPotsInHand[numPots - 2] -= kickBack;
			}
			else {
				this.game.pots[0].amount -= kickBack;
				p.totalBetsInPotsInHand[0] -= kickBack;
				p.totalBetsInPotsInRound[0] -= kickBack;
				p.lastBetInRound -= kickBack;
				p.stake += kickBack;
				p.currentBets[0] -= kickBack;
				p.currentBet -= kickBack;
			}
		}
	}

	nextDeal(doAdvancePosition=true) {
		const d = {};
		d[`${PokerGame.States.ready}`] = 'shuffleUpAndDeal';
		d[`${PokerGame.States.preFlop}`] = 'flop';
		d[`${PokerGame.States.preTurn}`] = 'turn';
		d[`${PokerGame.States.preRiver}`] = 'river';
		(this[d[this.game.state]] || (() => {}))(doAdvancePosition);
	}

	flop(doAdvancePosition= true) {
		if (this.game.state !== PokerGame.States.preFlop) {
			throw new Error(`Cannot deal flop; state=${this.game.state}`);
		}

		if (this.game.communityCards.length > 0) {
			return false;
		}

		if (! this.game.deck.burn()) {
			return false;
		}
		
		for (let i = 1; i <= 3; ++i) {
			const c = this.game.deck.dealCard();
			if (! c) {
				return false;
			}
			this.game.communityCards.push(c);
		}

		this.game.state = PokerGame.States.preTurn;
		this.resetForNextRound(doAdvancePosition);
		return true;
	}

	turn(doAdvancePosition= true)  {
		if (this.game.state !== PokerGame.States.preTurn) {
			throw new Error(`Cannot deal turn; state=${this.game.state}`);
		}

		if (this.game.communityCards.length !== 3) {
			return false;
		}
		if (! this.game.deck.burn()) {
			return false;
		}

		const c = this.game.deck.dealCard();
		if (! c)  {
			return false;
		}
		this.game.communityCards.push(c);
		this.game.state = PokerGame.States.preRiver;
		this.resetForNextRound(doAdvancePosition);
		return true;
	}

	river(doAdvancePosition= true) {
		if (this.game.state !== PokerGame.States.preRiver) {
			throw new Error(`Cannot deal river; state=${this.game.state}`);
		}

		if (this.game.communityCards.length !== 4) {
			return false;
		}
		if (! this.game.deck.burn()) {
			return false;
		}

		const c = this.game.deck.dealCard();
		if (! c)  {
			return false;
		}

		this.game.communityCards.push(c);
		this.game.state = PokerGame.States.finalBets;
		this.resetForNextRound(doAdvancePosition);
		return true;
	}
	
	resetForNextRound(doAdvancePosition = true) {
		 // assumes dealer performed the deal
		if (doAdvancePosition) {
			this.game.goToNextPosition();
		}

		for (const p of this.game.currentPlayers()) {
			// keep showing player as folded, or last action if all in
			if (p.lastAction !== PokerPlayer.RoundActions.fold)  {
				if (p.stake > 0) {
					p.lastAction = PokerPlayer.RoundActions.none;
					p.lastBetInRound = 0;
				}
				else {
					if (p.lastAction.isBettingAction()) {
						p.wentAllInPreviousRound = true;
					}
				}
			}
			p.currentBet = 0;
			for (let i = 0; i < p.currentBets.length; ++i) {
				p.currentBets[i] = 0;
				p.totalBetsInPotsInRound[i] = 0;
			}
		}
	}

}

export {GameManager}
