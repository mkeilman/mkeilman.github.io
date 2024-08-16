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
    let [game, setGame] = useState(() => new PokerGame(2));
    const mgr = new GameManager(game);

    const deal = () => {
        mgr.nextDeal();
        setGame(PokerGame.fromJSON(mgr.game.toJSON()));
    };

    const newGame = () => {
        const p = mgr.game.players.slice();
        const g = new PokerGame(2);
        g.players = p;
        setGame(g);
    };

    return (
        <div className="card-table">
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
        </div>
    )
};

export default HeadsUp;
