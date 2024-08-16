import {PokerPlayer} from './js/PokerPlayer.js';
import Card from './Card.jsx';

const Player = ({player, isBot=false}) => {
  const p = player;
  return (
      <>
          <span>{p.pokerFace}</span>
          <span>Stake ${p.stake}</span>
          <p>
              {p.currentCards.map(x => (
                  <Card card={x} key={x.toString()}></Card>
              ))}
          </p>
          {!isBot && <button>Bet</button>}
      </>
  )
};

export default Player
