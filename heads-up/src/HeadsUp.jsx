import { useState } from 'react'
import './css/HeadsUp.css'
import {PokerDeck} from './js/PokerDeck.js';
import {PokerPlayer} from './js/PokerPlayer.js';
import Deck from './Deck.jsx';
import Player from './Player.jsx';
import {Utils} from './js/Utils.js';

const HeadsUp = () => {
    let [deck, setDeck] = useState(() => new PokerDeck());
    //const d = new PokerDeck();
    const players = [new PokerPlayer(), new PokerPlayer()];
    let playerIndex = 0;
    const numPlayers = players.length;

    const deal = () => {
        const c = deck.dealCard();
        //Utils.log('DEALT', c);
        players[playerIndex].currentCards.push(c);
        playerIndex = (playerIndex + 1) % numPlayers;
    };

    const reset = () => {
        deck.reset();
        setDeck();
    };

    const shuffle = () => {
        deck = new PokerDeck(true);
        setDeck(deck);
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
                <Deck deck={deck}></Deck>
                <button onClick={shuffle}>Shuffle</button>
                <button onClick={deal}>Deal</button>
                <button onClick={reset}>Reset</button>
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
