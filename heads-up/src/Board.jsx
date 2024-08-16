import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import Card from './Card.jsx';

const Board = ({game}) => {

  return (
    <>
      <p>
        {game.communityCards.map(x => (
            <Card card={x} key={x.toString()}></Card>
        ))}
      </p>
    </>
  )
};

export default Board;
