import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PokerGame} from './PokerGame.js';
import {PokerHand} from './PokerHand.js';
import {PokerPlayer} from './PokerPlayer.js';
import {PokerPot} from './PokerPot.js';
import {Utils, debugLog} from './Utils.js';

class GameManager  extends BoundMethodsObject {
	static BetActions = {
		betAllIn: 'betAllIn',
		call:  'call',
		betCancel: 'betCancel',
		minBet: 'minBet',
		minBetPlus: 'minBetPlus',
		raise: 'raise',
	}

	static BetActionStrings = {
		betAllIn: 'All In',
		call:  'Call',
		betCancel: 'Cancel',
		minBet: '',
		minBetPlus: '',
		raise: 'Raise',
	}

	static RaiseActions = {
		raiseAllIn: 'raiseAllIn',
		raiseCancel: 'raiseCancel',
		minRaise: 'minRaise',
		minRaisePlus: 'minRaisePlus',
	}

	static RaiseActionStrings = {
		raiseAllIn: 'All In',
		raiseCancel: 'Cancel',
		minRaise: '',
		minRaisePlus: '',
	}

	static GameActions = {
		none: 'none',
		newGame: 'newGame',
		deal: 'deal',
		flop: 'flop',
		turn: 'turn',
		river: 'river',
		finish: 'finish',
		show: 'show',
		next: 'next',
		bet: 'bet',
		call: 'call',
		raise: 'raise',
		allIn: 'allIn',
		check: 'check',
		fold: 'fold',
	};

	constructor(game) {
		super();
		this.game = game
		this.me = game.players[1];
		this.actions = {};
		this.betActions = {};
		this.raiseActions = {};
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

	determineBet(action) {
		if (Object.keys(GameManager.BetActions).includes(action)) {
			if (action === GameManager.BetActions.call) {
				this.me.lastAction = PokerPlayer.RoundActions.call;
				return Math.min(this.game.minimumBet(), this.me.stake);
			}

			this.me.lastAction = PokerPlayer.RoundActions.bet;
			if (action === GameManager.BetActions.minBet) {
				return Math.min(this.game.minimumBet(), this.me.stake);
			}

			if (action === GameManager.BetActions.minBetPlus) {
				return Math.min(2 * this.game.minimumBet(), this.me.stake);
			}

			if (action === GameManager.BetActions.betAllIn) {
				return this.me.stake;
			}
		}

		this.me.lastAction = PokerPlayer.RoundActions.raise;
		if (action === GameManager.RaiseActions.minRaise) {
			return Math.min(this.game.minimumRaise(), this.me.stake);
		}
		if (action === GameManager.RaiseActions.minRaisePlus) {
			return Math.min(this.game.raisePlus(), this.me.stake);
		}
		return this.me.stake;
	}

	goAllIn() {
		let didAddPot = false;
		// create side pot for the remaining players (unless only one remains)
		// but only if next player cannot cover
		if (this.game.playersInHand().length > 1) {
			this.game.pots.push(
				new PokerPot(0, this.game.playersInHand().map(x => x.playerID))
			);
			for (p of this.game.currentPlayers()) {
				p.currentBets.push(0);
				p.totalBetsInPotsInRound.push(0);
				p.totalBetsInPotsInHand.push(0);
			}
			didAddPot = true;
		}

		const numPots = this.game.pots.length;
		for (const player of this.game.playersWhoHaveBetThisRound().filter(x => ! x.equals(this.game.me))) {
			if (player.totalBetsInRound() <= this.me.totalBetsInRound()) {
				continue;
			}

			const kickBack = player.currentBet - this.me.totalBetsInRound();

			// move extra from previous pot to newest pot
			if (numPots > 1 && didAddPot) {
				this.game.pots[numPots - 1].amount += kickBack;
				this.game.pots[numPots - 2].amount -= kickBack;
				player.currentBets[numPots - 1] += kickBack;
				player.currentBets[numPots - 2] -= kickBack;
				player.totalBetsInPotsInRound[numPots - 1] += kickBack;
				player.totalBetsInPotsInRound[numPots - 2] -= kickBack;
				player.totalBetsInPotsInHand[numPots - 1] += kickBack;
				player.totalBetsInPotsInHand[numPots - 2] -= kickBack;
			}
			else {
				let kb = kickBack;
				for (let i = 1; i <= this.game.pots.length; ++i) {
					let j = this.game.pots.length - i;
					if (kb > 0 && PokerPlayer.includes(this.game.playersInPots[j], player)) {
						const potKick = kb > player.currentBets[j] ? player.currentBets[j] : kb;
						this.game.pots[j].amount -= potKick;
						player.totalBetsInPotsInHand[j] -= potKick;
						player.totalBetsInPotsInRound[j] -= potKick;
						player.currentBets[j] -= potKick;
						kb -= potKick;
					}
				}
				player.lastBetInRound -= kickBack;
				player.stake += kickBack;
				player.currentBet -= kickBack;
			}

			// if, after all that, the player has a stake again, they can be in every pot
			if (player.stake > 0) {
				for (const p of this.game.pots) {
					p.addPlayer(player);
				}
			}
		}
	}

	placeBet(action) {

		const bet = this.determineBet(action);

		// build this before the bet is recorded
		const coverArr = [];
		for (let i = 0; i < this.game.pots.length; ++i) {
			coverArr.push(this.game.minimumBetInPot(i));
		}

		this.myLastStake = this.me.stake;;
		this.me.stake -= bet;
		this.me.currentBet = bet;
		this.me.lastBetInRound = bet;
		this.me.totalBetsInHand += bet;

		let numPots = this.game.pots.length;
		let didAddPot = false;

		if (numPots > 1) {
			let betAmount = bet;
			for (let i = 0; i < this.game.pots.length - 1; ++i) {
				const pot = this.game.pots[i];
				let toCover = coverArr[i];
				if (betAmount >= toCover) {
					pot.amount += toCover;
					this.me.currentBets[i] = toCover;
					this.me.totalBetsInPotsInRound[i] += toCover;
					this.me.totalBetsInPotsInHand[i] += toCover;
					betAmount -= toCover;
				}
				else {
					pot.amount += betAmount;
					this.me.currentBets[i] = betAmount;
					this.me.totalBetsInPotsInRound[i] += betAmount;
					this.me.totalBetsInPotsInHand[i] += betAmount;
					betAmount = 0;
				}
			}

			// leftovers in final pot
			const i = this.game.pots.length - 1;
			let pot = this.game.pots[i];
			if (betAmount > 0) {
				pot.amount += betAmount;
				this.me.currentBets[i] = betAmount;
				this.me.totalBetsInPotsInRound[i] += betAmount;
				this.me.totalBetsInPotsInHand[i] += betAmount;
				betAmount = 0;
			}

			// everything already in - if I am in the last pot, remove me
			else {
				if (this.me.stake === 0 && this.me.currentBets[i] === 0) {
					pot.removePlayer(this.me);
				}
			}
		}

		else {
			this.game.pots[0].amount += bet;
			this.me.currentBets[0] = bet;
			this.me.totalBetsInPotsInRound[0] += bet;
			this.me.totalBetsInPotsInHand[0] += bet;
		}

		if (this.me.stake === 0) {
			this.goAllIn();
		}


		// if a bet has been made, check to see if all players have same bet,
		// in which case this round is over
		if (! this.game.isRoundOver()) {
			this.game.goToNextPosition();
		}
		else {
			this.game.currentPosition = this.game.buttonPosition;
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

	
	getActions() {
		
		const s = this.game.state;
		if (s == PokerGame.States.none || s == PokerGame.States.gameOver) {
			return [PokerGame.GameActions.newGame];
		}

		if (s == PokerGame.States.ready) {
			return [PokerGame.GameActions.deal];
		}

		if (this.myPosition != this.game.currentPosition) {
			return [];
		}

		// these depend on position and previous bet
		if (s == PokerGame.States.preFlop) {
			if (this.me.stake > 0) {
				// cannot check, as the blinds count as bets
				if (! this.game.isRoundOver()) {  
					return [PokerGame.GameActions.bet, PokerGame.GameActions.fold];
				}

				if (this.game.playersInHand().length > 1) {
					return [PokerGame.GameActions.flop];
				}
				return [PokerGame.GameActions.finish];
			}
			if (this.game.playersInHand.length > 1) {
				return [PokerGame.GameActions.flop];
			}
			return [PokerGame.GameActions.finish];
		}

		if (s == PokerGame.States.preTurn) {
			if (this.me.stake > 0) {
				const a = [];
				// no bets, can check
				if (! this.game.haveAnyBetsBeenMadeThisRound() && this.me.lastAction == PokerPlayer.RoundActions.none) {
					a.push(PokerGame.GameActions.check);
				}
				
				if (! this.game.isRoundOver()) {
					a.push(PokerGame.GameActions.bet, PokerGame.GameActions.fold);
				}

				else {
					if (this.game.playersInHand.length > 1) {
						return [PokerGame.GameActions.turn];
					}
					return [PokerGame.GameActions.finish];
				}
				return a;
			}
			else {
				if (this.game.playersInHand.length > 1) {
					return [PokerGame.GameActions.turn];
				}
				return [PokerGame.GameActions.finish];
			}
		}
		
		if (s == PokerGame.States.preRiver) {
			if (this.me.stake > 0) {
				const a = [];
				 // no bets, can check
				if (! this.game.haveAnyBetsBeenMadeThisRound() && this.me.lastAction == PokerPlayer.RoundActions.none) { 
					a.push(PokerGame.GameActions.check);
				}
				
				if (! this.game.isRoundOver()) {
					a.push(PokerGame.GameActions.bet, PokerGame.GameActions.fold);
				}
				else {
					if (this.game.playersInHand().length > 1) {
						return [PokerGame.GameActions.river];
					}
					return [PokerGame.GameActions.finish];
				}
				return a;
			}
			else {
				if (this.game.playersInHand().length > 1) {
					return [PokerGame.GameActions.river];
				}
				return [PokerGame.GameActions.finish];
			}
		}
			
		if (s == PokerGame.States.preRiver) {
			if (this.me.stake > 0) {
				const a = [];
				if (! this.game.haveAnyBetsBeenMadeThisRound() && this.me.lastAction == PokerPlayer.RoundActions.none) { 
					a.push(PokerGame.GameActions.check);
				}
				
				if (! this.game.isRoundOver()) {
					a.push(PokerGame.GameActions.bet, PokerGame.GameActions.fold);
				}
				else {
					return [PokerGame.GameActions.show];
				}
				return a;
			}
			return [PokerGame.GameActions.show];
		}
				
		if (s == PokerGame.States.handOver) {
			return [PokerGame.GameActions.next];
		}

		return [];
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

export {GameManager};

