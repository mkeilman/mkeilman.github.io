import { useState } from 'react'
import './css/HeadsUp.css'
import {PokerDeck} from './js/Deck.js';

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
            <div>{d.toString()}</div>
    </>
  )
};

export default HeadsUp;
