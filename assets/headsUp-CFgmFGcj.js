var _=Object.defineProperty;var T=(o,t,n)=>t in o?_(o,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):o[t]=n;var i=(o,t,n)=>T(o,typeof t!="symbol"?t+"":t,n);import{j as r,r as K,c as B,R as f}from"./client-DD4c7S6m.js";console.log.bind(console);class A{static capitalize(t){return t[0].toUpperCase()+t.slice(1)}static distinctElementsAtPositions(t,n){const e=[];for(const a of n)a>=0&&a<t.length&&e.push(t[a]);return e}static elementsAtPositions(t,n){return t.filter(e=>n.includes(t.indexOf(e)))}static indexArray(t){const n=new Array(t);for(let e=0;e<t;++e)n[e]=e;return n}static invertMap(t){const n=Object.values(t);if(new Set(n).size!==n.length)throw new Error("Map in not onto");const e={};return Object.keys(t).forEach((a,d)=>{e[n[d]]=a}),e}static log(...t){console.log(...t)}static randomIndicesForArrayOfSize(t){const n=[],e=A.indexArray(t);let a=0;for(let d=0;d<t;++d){const l=Math.floor(Math.random()*(t-d));n.push(e[l]),a=e[l],e[l]=e[t-d-1],e[t-d-1]=a}return n}}class R{constructor(){Object.getOwnPropertyNames(this.constructor.prototype).filter(t=>t!=="constructor").forEach(t=>{this[t]=this[t].bind(this)})}funcs(){return Object.getOwnPropertyNames(this).filter(t=>typeof this[t]=="function")}objs(){return this.props().filter(t=>typeof this[t]=="object")}props(){return Object.getOwnPropertyNames(this).filter(t=>!this.funcs().includes(t))}vals(){return this.props().filter(t=>typeof this[t]!="object")}}const E=class E extends R{static exclude(t,n){return n.filter(e=>!e.equals(t))}static highestCardInSubset(t){return t.toSorted((n,e)=>e.value()-n.value())[0]}static highestCardInSubsets(t,n){if(t.length===0||n.length===0)return null;const e=E.highestCardInSubset(t),a=E.highestCardInSubset(n);return e.equals(a)?E.highestCardInSubsets(E.exclude(e,t),E.exclude(a,n)):E.max(e,a)}static fromJSON(t){return new E(t.suit,t.rank)}static fromString(t){const n=A.invertMap(E.Ranks),e=A.invertMap(E.Suits);return new E(n[t[0]],e[t[1]])}static includes(t,n){return t.map(e=>e.toString()).includes(n.toString())}static isHighCardLess(t,n){if(t.length===0||n.length===0)return!1;const e=E.highestCardInSubset(t),a=E.highestCardInSubset(n);return e.lt(a)?!0:a.lt(e)?!1:E.isHighCardLess(E.exclude(e,t),E.exclude(a,n))}static max(t,n){return t.lt(n)?n:t}static min(t,n){return t.lt(n)?t:n}constructor(t,n){super(),this.suit=t,this.rank=n}equals(t){return this.value()===t.value()}gt(t){return this.value()>t.value()}isSameAsCard(t){return this.equals(t)&&this.suit===t.suit}lowValue(){return E.LowValues[this.rank]}lt(t){return this.value()<t.value()}toJSON(){return{suit:this.suit,rank:this.rank}}toString(){return`${E.SuitStrings[this.suit]}${E.RankStrings[this.rank]}`}value(){return E.Values[this.rank]}};i(E,"LowValues",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:1}),i(E,"Ranks",{deuce:"deuce",trey:"trey",four:"four",five:"five",six:"six",seven:"seven",eight:"eight",nine:"nine",ten:"ten",jack:"jack",queen:"queen",king:"king",ace:"ace"}),i(E,"RankStrings",{deuce:"2",trey:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",nine:"9",ten:"10",jack:"J",queen:"Q",king:"K",ace:"A"}),i(E,"Suits",{club:"club",diamond:"diamond",heart:"heart",spade:"spade"}),i(E,"SuitStrings",{club:"♣️",diamond:"♦️",heart:"♥️",spade:"♠️"}),i(E,"Values",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:14});let u=E;const c=class c extends R{static freshCards(){const t=[];for(const n of c.suits)for(const e of c.ranks)t.push(new u(n,e));return t}static fromJSON(t){const n=t[c.KEY_POKER_DECK],e=new c(!1,n[c.KEY_POKER_DECK_DEALT_CARDS].map(a=>u.fromJSON(a)),n[c.KEY_POKER_DECK_DISCARDS].map(a=>u.fromJSON(a)));return e.cards=n[c.KEY_POKER_DECK_CARDS].map(a=>u.fromJSON(a)),e.deckIndex=n[c.KEY_POKER_DECK_INDEX],e}constructor(t=!1,n=[],e=[]){super(),this.cards=c.freshCards(),t?this.shuffle():this.setup(n,e)}burn(t=1){if(this.deckIndex+t>this.cards.length)return null;const n=[];for(let e=1;e<=t;++e){const a=this.cards[this.deckIndex];this.discards.push(a),n.push(a),this.deckIndex+=1}return n}currentCard(){return this.deckIndex<this.cards.length?this.cards[this.deckIndex]:null}dealCard(){if(this.deckIndex+1>this.cards.count)return null;const t=this.cards[this.deckIndex];return this.dealtCards.push(t),this.deckIndex+=1,t}setup(t=[],n=[]){this.dealtCards=t,this.discards=n,this.deckIndex=this.dealtCards.length+this.discards.length}shuffle(){const t=A.randomIndicesForArrayOfSize(this.cards.length),n=[];for(let e=0;e<this.cards.length;++e)n.push(this.cards[t[e]]);this.cards=n,this.setup()}toJSON(){const t={};t[c.KEY_POKER_DECK]={};const n=t[c.KEY_POKER_DECK];return n[c.KEY_POKER_DECK_CARDS]=this.cards.map(e=>e.toJSON()),n[c.KEY_POKER_DECK_DEALT_CARDS]=this.dealtCards.map(e=>e.toJSON()),n[c.KEY_POKER_DECK_DISCARDS]=this.discards.map(e=>e.toJSON()),n[c.KEY_POKER_DECK_INDEX]=this.deckIndex,t}toString(){return`${this.cards}`}};i(c,"ranks",Object.keys(u.Ranks)),i(c,"suits",Object.keys(u.Suits)),i(c,"KEY_POKER_DECK","deck"),i(c,"KEY_POKER_DECK_CARDS",`${c.KEY_POKER_DECK}.cards`),i(c,"KEY_POKER_DECK_DEALT_CARDS",`${c.KEY_POKER_DECK}.dealtCards`),i(c,"KEY_POKER_DECK_DISCARDS",`${c.KEY_POKER_DECK}.discards`),i(c,"KEY_POKER_DECK_INDEX",`${c.KEY_POKER_DECK}.deckIndex`);let h=c;const s=class s extends R{static isBettingAction(t){return t===s.RoundActions.smallBlind||t===s.RoundActions.bigBlind||t===s.RoundActions.bet||t===s.RoundActions.call||t===s.RoundActions.raise}static fromJSON(t){const n=t[s.KEY_PLAYER],e=new s(n[s.KEY_PLAYER_ID]);return e.isAssigned=n[s.KEY_PLAYER_IS_ASSIGNED],e.stake=n[s.KEY_PLAYER_STAKE],e.wentAllInPreviousRound=n[s.KEY_PLAYER_ALREADY_ALL_IN],e.gameState=n[s.KEY_PLAYER_GAME_STATE],e.handState=n[s.KEY_PLAYER_HAND_STATE],e.hasButton=n[s.KEY_PLAYER_HAS_BUTTON],e.isSmallBlind=n[s.KEY_PLAYER_IS_SMALL_BLIND],e.isBigBlind=n[s.KEY_PLAYER_IS_BIG_BLIND],e.position=n[s.KEY_PLAYER_POSITION],e.pokerFace=n[s.KEY_PLAYER_POKER_FACE],e.currentCards=n[s.KEY_PLAYER_CARDS].map(a=>u.fromJSON(a)),e.lastAction=n[s.KEY_PLAYER_LAST_ACTION],e.currentBets=n[s.KEY_PLAYER_CURRENT_BETS],e.currentBet=n[s.KEY_PLAYER_CURRENT_BET],e.lastBetInRound=n[s.KEY_PLAYER_LAST_BET],e.totalBetsInPotsInRound=n[s.KEY_PLAYER_TOTAL_BETS],e.totalBetsInHand=n[s.KEY_PLAYER_TOTAL_BET_HAND],e.totalBetsInPotsInHand=n[s.KEY_PLAYER_TOTAL_BETS_HAND],e}static getPokerFace(t=null){return t===null?s.PokerFaces.none:s.ValidFaces[t%s.ValidFaces.length]}static buildPlayerArray(t,n=!1){if(t<=0)return[];const e=[];for(let a=0;a<t;++a){const d=new s;n&&(d.pokerFace=self.getPokerFace(a)),e.push(d)}return e}constructor(t=null){super(),this.playerID=t||crypto.randomUUID(),this.isAssigned=!1,this.pokerFace=s.PokerFaces.none,this.stake=s.STARTING_STAKE,this.wentAllInPreviousRound=!1,this.gameState=s.PlayerGameStates.none,this.handState=s.PlayerHandStates.none,this.position=NaN,this.hasButton=!1,this.isSmallBlind=!1,this.isBigBlind=!1,this.currentCards=[],this.currentHand=[],this.currentBets=[0],this.totalBetsInPotsInRound=[0],this.totalBetsInHand=0,this.totalBetsInPotsInHand=[0],this.currentBet=0,this.lastBetInRound=0,this.lastAction=s.RoundActions.none,this.bestHandString=""}totalBetsInRound(){return this.totalBetsInPotsInRound.reduce((t,n)=>t+n,0)}equals(t){return this.playerID===p2.playerID}toJSON(){const t={},n=`${s.KEY_PLAYER}`;t[n]={};const e=t[n];return e[s.KEY_PLAYER_ID]=this.playerID,e[s.KEY_PLAYER_IS_ASSIGNED]=this.isAssigned,e[s.KEY_PLAYER_STAKE]=this.stake,e[s.KEY_PLAYER_ALREADY_ALL_IN]=this.wentAllInPreviousRound,e[s.KEY_PLAYER_GAME_STATE]=this.gameState,e[s.KEY_PLAYER_HAND_STATE]=this.handState,e[s.KEY_PLAYER_HAS_BUTTON]=this.hasButton,e[s.KEY_PLAYER_IS_SMALL_BLIND]=this.isSmallBlind,e[s.KEY_PLAYER_IS_BIG_BLIND]=this.isBigBlind,e[s.KEY_PLAYER_POSITION]=this.position,e[s.KEY_PLAYER_POKER_FACE]=this.pokerFace,e[s.KEY_PLAYER_CARDS]=this.currentCards.map(a=>a.toJSON()),e[s.KEY_PLAYER_LAST_ACTION]=this.lastAction,e[s.KEY_PLAYER_CURRENT_BETS]=this.currentBets,e[s.KEY_PLAYER_CURRENT_BET]=this.currentBet,e[s.KEY_PLAYER_LAST_BET]=this.lastBetInRound,e[s.KEY_PLAYER_TOTAL_BET]=this.totalBetsInRound(),e[s.KEY_PLAYER_TOTAL_BETS]=this.totalBetsInPotsInRound,e[s.KEY_PLAYER_TOTAL_BET_HAND]=this.totalBetsInHand,e[s.KEY_PLAYER_TOTAL_BETS_HAND]=this.totalBetsInPotsInHand,t}};i(s,"PlayerHandStates",{none:0,playing:1,folded:2,winner:3}),i(s,"PlayerGameStates",{none:0,invitedNotAccepted:1,alive:2,busted:3,invitedRejected:4,winner:5}),i(s,"RoundActions",{none:"",smallBlind:"Small",bigBlind:"Big",bet:"Bet",call:"Call",raise:"Raise",check:"Check",fold:"Fold"}),i(s,"ValidActions",[s.RoundActions.none,s.RoundActions.bet,s.RoundActions.call,s.RoundActions.raise,s.RoundActions.check,s.RoundActions.fold]),i(s,"PokerFaces",{none:"😶",cool:"😎",kiss:"😙",smile:"😀",greed:"🤑",wink:"😜",love:"😍",hmm:"🤔",poop:"💩"}),i(s,"ValidFaces",[s.PokerFaces.cool,s.PokerFaces.kiss,s.PokerFaces.smile,s.PokerFaces.greed,s.PokerFaces.wink,s.PokerFaces.love,s.PokerFaces.hmm,s.PokerFaces.poop]),i(s,"STARTING_STAKE",1e3),i(s,"KEY_PLAYER","player"),i(s,"KEY_PLAYER_IS_ASSIGNED",`${s.KEY_PLAYER}.isAssigned`),i(s,"KEY_PLAYER_STAKE",`${s.KEY_PLAYER}.stake`),i(s,"KEY_PLAYER_ALREADY_ALL_IN",`${s.KEY_PLAYER}.alreadyAllIn`),i(s,"KEY_PLAYER_GAME_STATE",`${s.KEY_PLAYER}.gameState`),i(s,"KEY_PLAYER_HAND_STATE",`${s.KEY_PLAYER}.handState`),i(s,"KEY_PLAYER_HAS_BUTTON",`${s.KEY_PLAYER}.hasButton`),i(s,"KEY_PLAYER_IS_SMALL_BLIND",`${s.KEY_PLAYER}.isSmallBlind`),i(s,"KEY_PLAYER_IS_BIG_BLIND",`${s.KEY_PLAYER}.isBigBlind`),i(s,"KEY_PLAYER_POSITION",`${s.KEY_PLAYER}.position`),i(s,"KEY_PLAYER_POKER_FACE",`${s.KEY_PLAYER}.pokerFace`),i(s,"KEY_PLAYER_CARDS",`${s.KEY_PLAYER}.cards`),i(s,"KEY_PLAYER_LAST_ACTION",`${s.KEY_PLAYER}.lastAction`),i(s,"KEY_PLAYER_CURRENT_BET",`${s.KEY_PLAYER}.currentBet`),i(s,"KEY_PLAYER_CURRENT_BETS",`${s.KEY_PLAYER}.currentBets`),i(s,"KEY_PLAYER_LAST_BET",`${s.KEY_PLAYER}.lastBet`),i(s,"KEY_PLAYER_TOTAL_BET",`${s.KEY_PLAYER}.totalBet`),i(s,"KEY_PLAYER_TOTAL_BETS",`${s.KEY_PLAYER}.totalBets`),i(s,"KEY_PLAYER_TOTAL_BET_HAND",`${s.KEY_PLAYER}.totalBetInHand`),i(s,"KEY_PLAYER_TOTAL_BETS_HAND",`${s.KEY_PLAYER}.totalBetsInHand`),i(s,"KEY_PLAYER_ID",`${s.KEY_PLAYER}.playerID`);let Y=s;const L=({card:o})=>r.jsx(r.Fragment,{children:r.jsx("span",{children:o.toString()})}),O=({deck:o})=>{const t=o||new h;return r.jsx(r.Fragment,{children:r.jsx("p",{children:t.cards.map((n,e)=>r.jsx(L,{card:n},e))})})},S=({player:o,isBot:t=!1})=>{const n=o||new Y;return r.jsxs(r.Fragment,{children:[r.jsx("span",{children:n.pokerFace}),r.jsxs("span",{children:["Stake $",n.stake]}),r.jsx("p",{children:n.currentCards.map((e,a)=>r.jsx(L,{card:e},a))}),!t&&r.jsx("button",{children:"Bet"})]})},P=()=>{let[o,t]=K.useState(()=>new h),[n,e]=K.useState(()=>[new Y,new Y]),a=0;const d=n.length,l=()=>{const p=o.dealCard();n[a].currentCards.push(p),a=(a+1)%d},I=()=>{t(new h(!0))};return r.jsxs(r.Fragment,{children:[r.jsx("h1",{children:"Heads Up!"}),r.jsx("div",{children:"bets"}),r.jsx("div",{children:"board"}),r.jsxs("div",{children:[r.jsx(O,{deck:o}),r.jsx("button",{onClick:I,children:"Shuffle"}),r.jsx("button",{onClick:l,children:"Deal"})]}),r.jsx("div",{children:r.jsx(S,{player:n[0],isBot:"true"})}),r.jsx("div",{children:r.jsx(S,{player:n[1]})})]})};B.createRoot(document.getElementById("root")).render(r.jsx(f.StrictMode,{children:r.jsx(P,{})}));
