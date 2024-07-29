import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import {PlayingCard} from './js/Card.js'

const Card = (suit, rank) => {

  const c = new PlayingCard(suit, rank);
  return (
    <>
      <p>{c.toString()}</p>
    </>
  )
};

export default Card;
