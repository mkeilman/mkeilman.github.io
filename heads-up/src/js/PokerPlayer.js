'use strict';

import {BoundMethodsObject} from './BoundMethodsObject.js';
import {PlayingCard} from './PlayingCard.js';

class PokerPlayer extends BoundMethodsObject {

    static PlayerHandStates = {
	    none: 0,
	    playing: 1,
	    folded:  2,
	    winner: 3,
    };

    static PlayerGameStates = {
	    none:  0,
	    invitedNotAccepted: 1,
	    alive: 2,
	    busted: 3,
        invitedRejected: 4,
	    winner: 5,
    };

    static RoundActions = {
        none: '',
        smallBlind: 'Small',
        bigBlind: 'Big',
        bet: 'Bet',
        call: 'Call',
        raise: 'Raise',
        check: 'Check',
        fold: 'Fold',
    }

    // temp?  used for iterations
    static ValidActions = [
        PokerPlayer.RoundActions.none,
        PokerPlayer.RoundActions.bet,
        PokerPlayer.RoundActions.call,
        PokerPlayer.RoundActions.raise,
        PokerPlayer.RoundActions.check,
        PokerPlayer.RoundActions.fold,
    ];

    static isBettingAction(action)  {
		return action === PokerPlayer.RoundActions.smallBlind ||
            action === PokerPlayer.RoundActions.bigBlind ||
            action === PokerPlayer.RoundActions.bet ||
            action === PokerPlayer.RoundActions.call ||
            action === PokerPlayer.RoundActions.raise;
    };

    static PokerFaces  = {
        none: '😶',
        cool: '😎',
        kiss: '😙',
        smile: '😀',
        greed: '🤑',
        wink: '😜',
        love: '😍',
        hmm: '🤔',
        poop: '💩',
    }

    static ValidFaces = [
        PokerPlayer.PokerFaces.cool,
        PokerPlayer.PokerFaces.kiss,
        PokerPlayer.PokerFaces.smile,
        PokerPlayer.PokerFaces.greed,
        PokerPlayer.PokerFaces.wink,
        PokerPlayer.PokerFaces.love,
        PokerPlayer.PokerFaces.hmm,
        PokerPlayer.PokerFaces.poop,
    ];

    static STARTING_STAKE = 1000;

    static KEY_PLAYER = 'player';
    static KEY_PLAYER_IS_ASSIGNED = `${PokerPlayer.KEY_PLAYER}.isAssigned`;
    static KEY_PLAYER_STAKE = `${PokerPlayer.KEY_PLAYER}.stake`;
    static KEY_PLAYER_ALREADY_ALL_IN = `${PokerPlayer.KEY_PLAYER}.alreadyAllIn`;
    static KEY_PLAYER_GAME_STATE = `${PokerPlayer.KEY_PLAYER}.gameState`;
    static KEY_PLAYER_HAND_STATE = `${PokerPlayer.KEY_PLAYER}.handState`;
    static KEY_PLAYER_HAS_BUTTON = `${PokerPlayer.KEY_PLAYER}.hasButton`;
    static KEY_PLAYER_IS_SMALL_BLIND = `${PokerPlayer.KEY_PLAYER}.isSmallBlind`;
    static KEY_PLAYER_IS_BIG_BLIND = `${PokerPlayer.KEY_PLAYER}.isBigBlind`;
    static KEY_PLAYER_POSITION = `${PokerPlayer.KEY_PLAYER}.position`;
    static KEY_PLAYER_POKER_FACE = `${PokerPlayer.KEY_PLAYER}.pokerFace`;
    static KEY_PLAYER_CARDS = `${PokerPlayer.KEY_PLAYER}.cards`;
    static KEY_PLAYER_LAST_ACTION = `${PokerPlayer.KEY_PLAYER}.lastAction`;
    static KEY_PLAYER_CURRENT_BET = `${PokerPlayer.KEY_PLAYER}.currentBet`;
    static KEY_PLAYER_CURRENT_BETS = `${PokerPlayer.KEY_PLAYER}.currentBets`;
    static KEY_PLAYER_LAST_BET = `${PokerPlayer.KEY_PLAYER}.lastBet`;
    static KEY_PLAYER_TOTAL_BET = `${PokerPlayer.KEY_PLAYER}.totalBet`;
    static KEY_PLAYER_TOTAL_BETS = `${PokerPlayer.KEY_PLAYER}.totalBets`;
    static KEY_PLAYER_TOTAL_BET_HAND = `${PokerPlayer.KEY_PLAYER}.totalBetInHand`;
    static KEY_PLAYER_TOTAL_BETS_HAND = `${PokerPlayer.KEY_PLAYER}.totalBetsInHand`;
    static KEY_PLAYER_ID = `${PokerPlayer.KEY_PLAYER}.playerID`;

   static buildPlayerArray(size, useSequentialFace = false) {
        if (size <= 0) {
            return [];
        }

        const pArr = [];
        for (let i = 0; i < size; ++i) {
            const p = new PokerPlayer();
            if (useSequentialFace) {
                p.pokerFace = self.getPokerFace(i);
            }
            pArr.push(p);
        }
		return pArr;
   }

    static fromJSON(json) {
        const d = json[PokerPlayer.KEY_PLAYER];
        const p = new PokerPlayer(d[PokerPlayer.KEY_PLAYER_ID]);
        p.isAssigned = d[PokerPlayer.KEY_PLAYER_IS_ASSIGNED];
        p.stake = d[PokerPlayer.KEY_PLAYER_STAKE];
        p.wentAllInPreviousRound = d[PokerPlayer.KEY_PLAYER_ALREADY_ALL_IN];
		p.gameState = d[PokerPlayer.KEY_PLAYER_GAME_STATE];
        p.handState = d[PokerPlayer.KEY_PLAYER_HAND_STATE];
		p.hasButton = d[PokerPlayer.KEY_PLAYER_HAS_BUTTON];
        p.isSmallBlind = d[PokerPlayer.KEY_PLAYER_IS_SMALL_BLIND];
		p.isBigBlind = d[PokerPlayer.KEY_PLAYER_IS_BIG_BLIND];
		p.position = d[PokerPlayer.KEY_PLAYER_POSITION];
		p.pokerFace = d[PokerPlayer.KEY_PLAYER_POKER_FACE];
		p.currentCards = d[PokerPlayer.KEY_PLAYER_CARDS].map(x => PlayingCard.fromJSON(x));
		p.lastAction = d[PokerPlayer.KEY_PLAYER_LAST_ACTION];
		p.currentBets = d[PokerPlayer.KEY_PLAYER_CURRENT_BETS];
		p.currentBet = d[PokerPlayer.KEY_PLAYER_CURRENT_BET];
		p.lastBetInRound = d[PokerPlayer.KEY_PLAYER_LAST_BET];
		p.totalBetsInPotsInRound = d[PokerPlayer.KEY_PLAYER_TOTAL_BETS];
		p.totalBetsInHand = d[PokerPlayer.KEY_PLAYER_TOTAL_BET_HAND];
		p.totalBetsInPotsInHand = d[PokerPlayer.KEY_PLAYER_TOTAL_BETS_HAND];
        return p;
    }

    static getPokerFace(index = null) {
        return index === null ?
            PokerPlayer.PokerFaces.none :
            PokerPlayer.ValidFaces[index % PokerPlayer.ValidFaces.length];
	}

    static includes(players, player) {
        return players.map(x => x.playerID).includes(player.playerID);
    }

    constructor(pid = null) {
        super();

        this.playerID = pid || crypto.randomUUID();

        this.isAssigned = false;
	    this.pokerFace = PokerPlayer.PokerFaces.none;
	    this.stake = PokerPlayer.STARTING_STAKE;
	    this.wentAllInPreviousRound = false;
        this.gameState = PokerPlayer.PlayerGameStates.none;
	    this.handState = PokerPlayer.PlayerHandStates.none;

        this.position = NaN;
	    this.hasButton = false;
	    this.isSmallBlind = false;
	    this.isBigBlind = false;

        this.currentCards = [];
        // not necessarily the same as the cards
	    this.currentHand = [];

        // per pot
        this.currentBets = [0];
	    this.totalBetsInPotsInRound = [0];

	    this.totalBetsInHand = 0;
	    this.totalBetsInPotsInHand = [0];

	    this.currentBet = 0;
	    this.lastBetInRound = 0;

        this.lastAction = PokerPlayer.RoundActions.none;
        this.bestHandString = '';
    }

    totalBetsInRound() {
		return this.totalBetsInPotsInRound.reduce((t, c) => t + c, 0);
    }

	/*
	var lastActionDesc: String {
		var astr = ''
		if self.gameState == .busted {
			astr = 'BUSTED'
		}
		else if self.gameState == .alive || self.gameState == .winner {
			if !self.bestHandString.isEmpty {
				astr = self.bestHandString
			}
			else {
				let bet = self.currentBet > 0 ? self.currentBet : self.lastBetInRound
				if self.stake == 0 {
					astr = 'All In \(bet)'
				}
				else {
					astr = betString(bet: bet)
					SLASH*
					astr = self.lastAction.rawValue
					switch self.lastAction {
					case .smallBlind: fallthrough
					case .bigBlind: fallthrough
					case .bet: fallthrough
					case .call: fallthrough
					case .raise:
						astr += ' \(bet)'
					default:

						break
					}
					*SLASH
				}
			}
		}
		return astr
	}*/
	/*
	func betString(bet: Int) -> String {

		var bstr: String = self.lastAction.rawValue
		switch self.lastAction {
		case .smallBlind: fallthrough
		case .bigBlind: fallthrough
		case .bet: fallthrough
		case .call: fallthrough
		case .raise:
			bstr += ' \(bet)'
		default:
			break
		}
		return bstr
	}

	 */
	/*
	func lastActionDescForPot(pIndex: Int) -> String {
		var astr = self.lastActionDesc
		if pIndex >= 0 {
			if pIndex < self.currentBets.count {

			}
		}

		return astr
	}
	*/

    /*
	init?(json: [String : Any]) {
		if let playerDict: [String: AnyObject] = json[PokerPlayer.KEY_PLAYER] as? [String: AnyObject] {
			if let pID = playerDict[PokerPlayer.KEY_PLAYER_ID] as? String {
				let pUID = UUID(uuidString: pID)
				if pUID != nil {
					self.playerID = pUID!
					self.isAssigned = playerDict[PokerPlayer.KEY_PLAYER_IS_ASSIGNED] as? Bool ?? false
					self.stake = playerDict[PokerPlayer.KEY_PLAYER_STAKE] as? Int ?? 0
					self.wentAllInPreviousRound = playerDict[PokerPlayer.KEY_PLAYER_ALREADY_ALL_IN] as? Bool ?? false
					self.gameState = PlayerGameStates(rawValue: playerDict[PokerPlayer.KEY_PLAYER_GAME_STATE] as? Int ?? 0) ?? .none
					self.handState = PlayerHandStates(rawValue: playerDict[PokerPlayer.KEY_PLAYER_HAND_STATE] as? Int ?? 0) ?? .none
					self.hasButton = playerDict[PokerPlayer.KEY_PLAYER_HAS_BUTTON] as? Bool ?? false
					self.isSmallBlind = playerDict[PokerPlayer.KEY_PLAYER_IS_SMALL_BLIND] as? Bool ?? false
					self.isBigBlind = playerDict[PokerPlayer.KEY_PLAYER_IS_BIG_BLIND] as? Bool ?? false
					self.position = playerDict[PokerPlayer.KEY_PLAYER_POSITION] as? Int ?? NSNotFound
					self.pokerFace = PokerFaces(rawValue: playerDict[PokerPlayer.KEY_PLAYER_POKER_FACE] as? String ?? 'none') ?? .none
					if let cArr = playerDict[PokerPlayer.KEY_PLAYER_CARDS] as? [[String:Any]] {
						for cj in cArr {
							if let c = StandardCard(json: cj) {
								self.currentCards.append(c)
							}
						}
					}
					if let la = playerDict[PokerPlayer.KEY_PLAYER_LAST_ACTION] as? String {
						self.lastAction = RoundActions(rawValue: la) ?? .none
					}


					self.currentBets = playerDict[PokerPlayer.KEY_PLAYER_CURRENT_BETS] as? [Int] ?? [0]
					self.totalBetsInPotsInRound = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BETS] as? [Int] ?? [0]

					self.currentBet = playerDict[PokerPlayer.KEY_PLAYER_CURRENT_BET] as? Int ?? 0
					self.lastBetInRound = playerDict[PokerPlayer.KEY_PLAYER_LAST_BET] as? Int ?? 0
					self.totalBetsInHand = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BET_HAND] as? Int ?? 0
					self.totalBetsInPotsInHand = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BETS_HAND] as? [Int] ?? [0]

				}
				else { return nil }
			}
			else { return nil }
		}
		else { return nil }
	}
    */

/*
	func refresh(json: [String : Any]) {

		if let playerDict: [String: AnyObject] = json[PokerPlayer.KEY_PLAYER] as? [String: AnyObject] {
			if let pID = playerDict[PokerPlayer.KEY_PLAYER_ID] as? String {
				let pUID = UUID(uuidString: pID)
				if pUID != nil && pUID == self.playerID {

					if let ia = playerDict[PokerPlayer.KEY_PLAYER_IS_ASSIGNED] as? Bool  {
						self.isAssigned = ia
					}
					if let s = playerDict[PokerPlayer.KEY_PLAYER_STAKE] as? Int {
						self.stake = s
					}
					if let awai = playerDict[PokerPlayer.KEY_PLAYER_ALREADY_ALL_IN] as? Bool {
						self.wentAllInPreviousRound = awai
					}

					if let gss = playerDict[PokerPlayer.KEY_PLAYER_GAME_STATE] as? Int {
						if let gs = PlayerGameStates(rawValue: gss) {
							self.gameState = gs
						}
					}
					if let hss = playerDict[PokerPlayer.KEY_PLAYER_HAND_STATE] as? Int {
						if let hs = PlayerHandStates(rawValue: hss) {
							self.handState = hs
						}
					}
					if let hb = playerDict[PokerPlayer.KEY_PLAYER_HAS_BUTTON] as? Bool  {
						self.hasButton = hb
					}
					if let isb = playerDict[PokerPlayer.KEY_PLAYER_IS_SMALL_BLIND] as? Bool {
						self.isSmallBlind = isb
					}
					if let ibb = playerDict[PokerPlayer.KEY_PLAYER_IS_BIG_BLIND] as? Bool {
						self.isBigBlind = ibb
					}
					if let pos = playerDict[PokerPlayer.KEY_PLAYER_POSITION] as? Int {
						self.position = pos
					}
					if let pfs = playerDict[PokerPlayer.KEY_PLAYER_POKER_FACE] as? String {
						if let pf = PokerFaces(rawValue: pfs) {
							self.pokerFace = pf
						}
					}
					if let cArr = playerDict[PokerPlayer.KEY_PLAYER_CARDS] as? [[String:Any]] {
						self.currentCards.removeAll()
						for cj in cArr {
							if let c = StandardCard(json: cj) {
								self.currentCards.append(c)
							}
						}
					}
					if let las = playerDict[PokerPlayer.KEY_PLAYER_LAST_ACTION] as? String {
						if let la = RoundActions(rawValue: las) {
							self.lastAction = la
						}
					}

					if let cbs = playerDict[PokerPlayer.KEY_PLAYER_CURRENT_BETS] as? [Int] {
						self.currentBets = cbs
					}
					if let tbirs = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BETS] as? [Int] {
						self.totalBetsInPotsInRound = tbirs
					}

					if let cb = playerDict[PokerPlayer.KEY_PLAYER_CURRENT_BET] as? Int {
						self.currentBet = cb
					}
					if let lbir = playerDict[PokerPlayer.KEY_PLAYER_LAST_BET] as? Int {
						self.lastBetInRound = lbir
					}
					if let tbih = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BET_HAND] as? Int {
						self.totalBetsInHand = tbih
					}
					if let tbipih = playerDict[PokerPlayer.KEY_PLAYER_TOTAL_BETS_HAND] as? [Int] {
						self.totalBetsInPotsInHand = tbipih
					}
				}
			}
		}

	}*/


	equals(otherPlayer) {
		return this.playerID === p2.playerID;
	}

	toJSON() {
		const json = {};
		const k = `${PokerPlayer.KEY_PLAYER}`;
		json[k] = {};
		const j = json[k];
		j[PokerPlayer.KEY_PLAYER_ID] = this.playerID;
		j[PokerPlayer.KEY_PLAYER_IS_ASSIGNED] = this.isAssigned;
		j[PokerPlayer.KEY_PLAYER_STAKE] = this.stake;
		j[PokerPlayer.KEY_PLAYER_ALREADY_ALL_IN] = this.wentAllInPreviousRound;
		j[PokerPlayer.KEY_PLAYER_GAME_STATE] = this.gameState;
		j[PokerPlayer.KEY_PLAYER_HAND_STATE] = this.handState;
		j[PokerPlayer.KEY_PLAYER_HAS_BUTTON] = this.hasButton;
		j[PokerPlayer.KEY_PLAYER_IS_SMALL_BLIND] = this.isSmallBlind;
		j[PokerPlayer.KEY_PLAYER_IS_BIG_BLIND] = this.isBigBlind;
		j[PokerPlayer.KEY_PLAYER_POSITION] = this.position;
		j[PokerPlayer.KEY_PLAYER_POKER_FACE] = this.pokerFace;
		j[PokerPlayer.KEY_PLAYER_CARDS] = this.currentCards.map(x =>  x.toJSON());
		j[PokerPlayer.KEY_PLAYER_LAST_ACTION] = this.lastAction;
		j[PokerPlayer.KEY_PLAYER_CURRENT_BETS] = this.currentBets;
		j[PokerPlayer.KEY_PLAYER_CURRENT_BET] = this.currentBet;
		j[PokerPlayer.KEY_PLAYER_LAST_BET] = this.lastBetInRound;
		j[PokerPlayer.KEY_PLAYER_TOTAL_BET] = this.totalBetsInRound();
		j[PokerPlayer.KEY_PLAYER_TOTAL_BETS] = this.totalBetsInPotsInRound;
		j[PokerPlayer.KEY_PLAYER_TOTAL_BET_HAND] = this.totalBetsInHand;
		j[PokerPlayer.KEY_PLAYER_TOTAL_BETS_HAND] = this.totalBetsInPotsInHand;

		return json;
	}
}

export {PokerPlayer}
