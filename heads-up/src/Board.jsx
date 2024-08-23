import { useState } from 'react'
import './css/HeadsUp.css'
import './css/Card.css'
import Card from './Card.jsx';
import Pot from './Pot.jsx';

const Board = ({game}) => {

  return (
      <>
          <p>
              {game.communityCards.map(x => (
                  <Card card={x} key={x.toString()}></Card>
              ))}
          </p>
          <p>
              {game.pots.map((x, i) => (
                  <Pot pot={x} key={i}></Pot>
              ))}
          </p>
      </>
  )
};

export default Board;
