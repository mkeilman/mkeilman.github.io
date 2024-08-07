import {PokerPlayer} from './js/PokerPlayer.js';
import {PokerDeck} from './js/Deck.js';
import Card from './Card.jsx';

const Player = () => {
  const p = new PokerPlayer();
  return (
      <>
          <p>
              {p.cards.map((x, i) => (
                  <Card card={x} key={i} ></Card>
              ))}
          </p>
          <button>Bet</button>
      </>
  )
};