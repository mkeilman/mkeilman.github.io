import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import {PokerDeck} from './js/Deck.js'
import Card from './Card.jsx';
import {Utils} from './js/Utils.js';

const Deck = () => {
  const d = new PokerDeck();
  return (
      <>
          <p>
              {d.cards.map((x, i) => (
                  <Card card={x} key={i} ></Card>
              ))}
          </p>
          <button onClick={d.shuffle}>Shuffle</button>
          <button onClick={d.dealCard}>Deal</button>
          <button onClick={d.reset}>Reset</button>
      </>
  )
};

export default Deck;
