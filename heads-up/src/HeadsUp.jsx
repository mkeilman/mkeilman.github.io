import { useState } from 'react'
import './css/HeadsUp.css'
import {PokerDeck} from './js/PokerDeck.js';
import Deck from './Deck.jsx';
import Player from './Player.jsx';

const HeadsUp = () => {
    const d = new PokerDeck();
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
                <Deck deck={d}></Deck>
            </div>
            <div>
                <Player></Player>
            </div>
    </>
  )
};

export default HeadsUp;
