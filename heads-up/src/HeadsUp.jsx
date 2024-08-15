import { useState } from 'react'
import './css/HeadsUp.css'
import {PokerDeck} from './js/PokerDeck.js';
import {PokerGame} from './js/PokerGame.js';
import {PokerPlayer} from './js/PokerPlayer.js';
import Deck from './Deck.jsx';
import Player from './Player.jsx';
import {Utils, debugLog} from './js/Utils.js';

const HeadsUp = () => {
    let [deck, setDeck] = useState(() => new PokerDeck());
    let [players, setPlayers] = useState(() => [new PokerPlayer(), new PokerPlayer()]);
    let [game, setGame] = useState(() => new PokerGame(players.length));

    let playerIndex = 0;
    const numPlayers = players.length;
    game.players = players;

    const deal = () => {
        const c = deck.dealCard();
        players[playerIndex].currentCards.push(c);
        playerIndex = (playerIndex + 1) % numPlayers;
    };

    const reset = () => {
        deck.reset();
        setDeck();
    };

    const shuffle = () => {
        setDeck(new PokerDeck(true));
    };

    return (
        <>
            <h1>Heads Up!</h1>
            <div>
                bets
            </div>
            <div>
                board
            </div>
            <div>
                <Deck deck={game.deck}></Deck>
                <button onClick={shuffle}>Shuffle</button>
                <button onClick={deal}>Deal</button>
            </div>
            <div>
                <Player player={players[0]} isBot="true"></Player>
            </div>
            <div>
                <Player player={players[1]}></Player>
            </div>
        </>
    )
};

export default HeadsUp;
