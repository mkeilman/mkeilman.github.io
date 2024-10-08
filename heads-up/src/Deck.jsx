import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import {PokerDeck} from './js/PokerDeck.js'
import Card from './Card.jsx';
import {Utils} from './js/Utils.js';

const Deck = ({deck}) => {
  const d = deck || new PokerDeck();
  return (
      <>
          <p>
              {d.cards.map(x => (
                  <Card card={x} key={x.toString()} ></Card>
              ))}
          </p>
      </>
  )
};

export default Deck;
