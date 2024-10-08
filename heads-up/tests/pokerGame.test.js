import { expect, test } from 'vitest'
import {GameManager} from '../src/js/GameManager.js';
import {PokerGame} from '../src/js/PokerGame.js';
import {PokerPlayer} from '../src/js/PokerPlayer.js';
import {Utils, debugLog} from '../src/js/Utils.js';

test('json', () => {
    const g = new PokerGame();
    const gg = PokerGame.fromJSON(g.toJSON());
    g.vals().forEach(x => {
        expect(g[x]).toBe(gg[x]);
    });
});

test('shuffle up', () => {
    const g = new PokerGame();
    const mgr = new GameManager(g);
    mgr.shuffleUpAndDeal();
    expect(g.state).toBe(PokerGame.States.preFlop);
    for (const p of g.playersStillInGame()) {
        expect(p.currentCards.length).toBe(2);
    }
});

test('flop', () => {
    const g = new PokerGame();
    const mgr = new GameManager(g);
    ['flop'].forEach(f => {
        expect(() => {mgr[f]();}).toThrowError();
    });
    mgr.shuffleUpAndDeal();
    mgr.flop();
    expect(g.state).toBe(PokerGame.States.preTurn);
    expect(g.communityCards.length).toBe(3);
});

test('turn', () => {
    const g = new PokerGame();
    const mgr = new GameManager(g);
    ['flop', 'turn'].forEach(f => {
        expect(() => {mgr[f]();}).toThrowError();
    });
    mgr.shuffleUpAndDeal();
    mgr.flop();
    mgr.turn();
    expect(g.state).toBe(PokerGame.States.preRiver);
    expect(g.communityCards.length).toBe(4);
});

test('river', () => {
    const g = new PokerGame();
    const mgr = new GameManager(g);
    ['flop', 'turn', 'river'].forEach(f => {
        expect(() => {mgr[f]();}).toThrowError();
    });
    mgr.shuffleUpAndDeal();
    mgr.flop();
    mgr.turn();
    mgr.river();
    expect(g.state).toBe(PokerGame.States.finalBets);
    expect(g.communityCards.length).toBe(5);
});

test('all deals', () => {
    const g = new PokerGame();
    const mgr = new GameManager(g);
    expect(g.state).toBe(PokerGame.States.ready);
    // deal to players
    mgr.nextDeal();
    expect(g.state).toBe(PokerGame.States.preFlop);
    for (const p of g.playersStillInGame()) {
        expect(p.currentCards.length).toBe(2);
    }
    // flop
    mgr.nextDeal();
    expect(g.state).toBe(PokerGame.States.preTurn);
    expect(g.communityCards.length).toBe(3);
    // turn
    mgr.nextDeal();
    expect(g.state).toBe(PokerGame.States.preRiver);
    expect(g.communityCards.length).toBe(4);
    // river
    mgr.nextDeal();
    expect(g.state).toBe(PokerGame.States.finalBets);
    expect(g.communityCards.length).toBe(5);
    // does nothing
    mgr.nextDeal();
    expect(g.state).toBe(PokerGame.States.finalBets);
    expect(g.communityCards.length).toBe(5);
});
