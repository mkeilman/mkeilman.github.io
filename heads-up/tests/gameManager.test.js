import { expect, test } from 'vitest';
import {GameManager} from '../src/js/GameManager.js';
import {PokerGame} from '../src/js/PokerGame.js';
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('minBet', () => {
    const mgr = new GameManager(new PokerGame());
    let action = GameManager.BetActions.minBet;
    let bet = mgr.determineBet(action);
    expect(bet).toBe(mgr.game.minimumBet());
});

test('allIn', () => {
    const mgr = new GameManager(new PokerGame());
    let action = GameManager.BetActions.betAllIn;
    let bet = mgr.determineBet(action);
    expect(bet).toBe(mgr.me.stake);
});
