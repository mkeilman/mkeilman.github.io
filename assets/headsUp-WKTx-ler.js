var f=Object.defineProperty;var g=(i,t,e)=>t in i?f(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var u=(i,t,e)=>g(i,typeof t!="symbol"?t+"":t,e);import{j as c,c as x,R as k}from"./client-CADlzgmn.js";class v{static randomIndicesForArrayOfSize(t){const e=[],s=new Array(t).fill(0);let n=0;for(let d=0;d<t;++d){const h=Math.floor(Math.random()*(t-d));e.push(s[h]),n=s[h],s[h]=s[t-d-1],s[t-d-1]=n}return e}static log(...t){console.log(t)}}const r=class r{static exclude(t,e){return e.filter(s=>!s.equals(t))}static highestCardInSubset(t){return t.toSorted((e,s)=>s.lt(e))[0]}static highestCardInSubsets(t,e){if(t.length===0||e.length===0)return null;const s=r.highestCardInSubset(t),n=r.highestCardInSubset(e);return s.equals(n)?r.highestCardInSubsets(r.exclude(s,t),r.exclude(n,e)):Math.max(s.value(),n.value())}static fromJSON(t){return new r(t.suit,t.rank)}static isHighCardLess(t,e){if(t.length===0||e.length===0)return!1;const s=r.highestCardInSubset(t),n=r.highestCardInSubset(e);return s.lt(n)?!0:n.lt(s)?!1:r.isHighCardLess(r.exclude(s,t),r.exclude(n,e))}constructor(t,e){this.suit=r.Suits[t],this.rank=r.Ranks[e]}equals(t){return this.value()===t.value()}isSameAsCard(t){return self.equals(t)&&self.suit===t.suit}lowValue(){return r.LowValues[self.rank]}lt(t){return this.value()<t.value()}value(){return r.Values[self.rank]}toString(){return`${this.suit}${this.rank}`}toJSON(){return{suit:this.suit,rank:this.rank}}};u(r,"Suits",{club:"♣️",diamond:"♦️",heart:"♥️",spade:"♠️"}),u(r,"Ranks",{deuce:"2",trey:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",nine:"9",ten:"10",jack:"J",queen:"Q",king:"K",ace:"A"}),u(r,"Values",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:14}),u(r,"LowValues",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:1});let l=r;const a=class a{constructor(){this.cards=[],this.discards=[],this.dealtCards=[],this.deckIndex=0;for(const t of a.availableSuits)for(const e of a.availableRanks)this.cards.push(new l(t,e))}currentCard(){return this.deckIndex<this.cards.length?this.cards[this.deckIndex]:null}hasAllCards(){let t=this.cards.length===a.availableSuits.length*a.availableRanks.length;if(!t)return!1;for(const e of a.availableSuits)for(const s of a.availableRanks)t=t&&this.cards.contains(new l(e,s));return t}shuffle(){this.dealtCards=[];const t=v.randomIndicesForArrayOfSize(this.cards.length),e=[];for(let s=0;s<this.cards.length;++s)e.push(this.cards[t[s]]);this.cards=e,this.reset()}burn(t=1){if(this.deckIndex+t>this.cards.length)return null;const e=[];for(let s=1;s<=t;++s){const n=this.cards[this.deckIndex];this.discards.push(n),e.push(n),this.deckIndex+=1}return e}dealCard(){if(this.deckIndex+1>this.cards.count)return null;const t=this.cards[this.deckIndex];return this.dealtCards.push(t),this.deckIndex+=1,t}reset(){this.dealtCards=[],this.deckIndex=0,this.discards=[]}toString(){return`${this.cards}`}};u(a,"availableSuits",Object.keys(l.Suits)),u(a,"availableRanks",Object.keys(l.Ranks));let o=a;const S=()=>{const i=new o;return c.jsxs(c.Fragment,{children:[c.jsx("h1",{children:"Heads Up!"}),c.jsx("div",{children:"bets"}),c.jsx("div",{children:"board"}),c.jsx("div",{children:i.toString()})]})};x.createRoot(document.getElementById("root")).render(c.jsx(k.StrictMode,{children:c.jsx(S,{})}));
