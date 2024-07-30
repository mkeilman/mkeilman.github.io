import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import {PokerDeck} from './js/Deck.js'

const Deck = () => {
  const d = new PokerDeck();
  return (
      <>
        <p>{d.toString()}</p>
        <button onClick={d.shuffle}>Shuffle</button>
      </>
  )
};

export default Deck;
