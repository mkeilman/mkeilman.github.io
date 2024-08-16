import { useState } from 'react'
import './css/HeadsUp.css'

import {GameManager} from './js/GameManager.js';
import {PokerDeck} from './js/PokerDeck.js';
import {PokerGame} from './js/PokerGame.js';
import {PokerPlayer} from './js/PokerPlayer.js';
import Deck from './Deck.jsx';
import Player from './Player.jsx';
import {Utils, debugLog} from './js/Utils.js';
import Board from './Board.jsx';

const HeadsUp = () => {
    //let [deck, setDeck] = useState(() => new PokerDeck());
    //let [players, setPlayers] = useState(() => [new PokerPlayer(), new PokerPlayer()]);
    //let [game, setGame] = useState(() => new PokerGame(players.length));
    let [game, setGame] = useState(() => new PokerGame(2));

    const mgr = new GameManager(game);

    let playerIndex = 0;
    //const numPlayers = players.length;
    //game.players = players;

    const deal = () => {
        //const c = deck.dealCard();
        //players[playerIndex].currentCards.push(c);
        //playerIndex = (playerIndex + 1) % numPlayers;
        mgr.nextDeal();
        setGame(PokerGame.fromJSON(mgr.game.toJSON()));
    };

    const newGame = () => {
        const p = mgr.game.players.slice();
        const g = new PokerGame(2);
        g.players = p;
        setGame(g);
    };

    const shuffle = () => {
        mgr.game.deck.shuffle();
        setGame(PokerGame.fromJSON(mgr.game.toJSON()));
        //setDeck(new PokerDeck(true));
    };
    //<Deck deck={mgr.game.deck}></Deck>
    //<button onClick={shuffle}>Shuffle</button>
    return (
        <>
            <h1>Heads Up!</h1>
            <button>New Game</button>
            <div>
                bets
            </div>
            <div>
                <Board game={mgr.game}></Board>
            </div>
            <div>
                <button onClick={deal}>Deal</button>
            </div>
            {mgr.game.players.map((x, i) => (
                <Player player={x} key={x.playerID} isBot={i === 0}></Player>
            ))}
        </>
    )
};

export default HeadsUp;
