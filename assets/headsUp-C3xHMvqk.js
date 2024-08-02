var g=Object.defineProperty;var k=(i,t,e)=>t in i?g(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var u=(i,t,e)=>k(i,typeof t!="symbol"?t+"":t,e);import{j as n,c as p,R as j}from"./client-CADlzgmn.js";class o{static capitalize(t){return t[0].toUpperCase()+t.slice(1)}static indexArray(t){const e=new Array(t);for(let s=0;s<t;++s)e[s]=s;return e}static invertMap(t){const e=Object.values(t);if(new Set(e).size!==e.length)throw new Error("Map in not onto");const s={};return Object.keys(t).forEach((c,a)=>{s[e[a]]=c}),s}static log(...t){console.log(...t)}static randomIndicesForArrayOfSize(t){const e=[],s=o.indexArray(t);let c=0;for(let a=0;a<t;++a){const f=Math.floor(Math.random()*(t-a));e.push(s[f]),c=s[f],s[f]=s[t-a-1],s[t-a-1]=c}return e}}class x{constructor(){Object.getOwnPropertyNames(this.constructor.prototype).filter(t=>t!=="constructor").forEach(t=>{this[t]=this[t].bind(this)})}}const r=class r extends x{static exclude(t,e){return e.filter(s=>!s.equals(t))}static highestCardInSubset(t){return t.toSorted((e,s)=>s.lt(e))[0]}static highestCardInSubsets(t,e){if(t.length===0||e.length===0)return null;const s=r.highestCardInSubset(t),c=r.highestCardInSubset(e);return s.equals(c)?r.highestCardInSubsets(r.exclude(s,t),r.exclude(c,e)):Math.max(s.value(),c.value())}static fromJSON(t){return new r(t.suit,t.rank)}static fromString(t){const e=o.invertMap(r.Ranks),s=o.invertMap(r.Suits);return new r(e[t[0]],s[t[1]])}static includes(t,e){return t.map(s=>s.toString()).includes(e.toString())}static isHighCardLess(t,e){if(t.length===0||e.length===0)return!1;const s=r.highestCardInSubset(t),c=r.highestCardInSubset(e);return s.lt(c)?!0:c.lt(s)?!1:r.isHighCardLess(r.exclude(s,t),r.exclude(c,e))}constructor(t,e){super(),this.suit=r.Suits[t],this.rank=r.Ranks[e]}equals(t){return this.value()===t.value()}isSameAsCard(t){return self.equals(t)&&self.suit===t.suit}lowValue(){return r.LowValues[self.rank]}gt(t){return this.value()>t.value()}lt(t){return this.value()<t.value()}value(){return r.Values[self.rank]}toString(){return`${this.suit}${this.rank}`}toJSON(){return{suit:this.suit,rank:this.rank}}};u(r,"Suits",{club:"♣️",diamond:"♦️",heart:"♥️",spade:"♠️"}),u(r,"Ranks",{deuce:"2",trey:"3",four:"4",five:"5",six:"6",seven:"7",eight:"8",nine:"9",ten:"10",jack:"J",queen:"Q",king:"K",ace:"A"}),u(r,"Values",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:14}),u(r,"LowValues",{deuce:2,trey:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,jack:11,queen:12,king:13,ace:1});let h=r;const d=class d extends x{constructor(){super(),this.cards=[];for(const t of d.suits)for(const e of d.ranks)this.cards.push(new h(t,e));this.reset()}burn(t=1){if(this.deckIndex+t>this.cards.length)return null;const e=[];for(let s=1;s<=t;++s){const c=this.cards[this.deckIndex];this.discards.push(c),e.push(c),this.deckIndex+=1}return e}currentCard(){return this.deckIndex<this.cards.length?this.cards[this.deckIndex]:null}dealCard(){if(this.deckIndex+1>this.cards.count)return null;const t=this.cards[this.deckIndex];return this.dealtCards.push(t),this.deckIndex+=1,t}reset(){this.dealtCards=[],this.deckIndex=0,this.discards=[]}shuffle(){const t=o.randomIndicesForArrayOfSize(this.cards.length),e=[];for(let s=0;s<this.cards.length;++s)e.push(this.cards[t[s]]);this.cards=e,this.reset()}toString(){return`${this.cards}`}};u(d,"ranks",Object.keys(h.Ranks)),u(d,"suits",Object.keys(h.Suits));let l=d;const S=({card:i})=>n.jsx(n.Fragment,{children:n.jsx("span",{children:i.toString()})}),v=()=>{const i=new l;return n.jsxs(n.Fragment,{children:[n.jsx("p",{children:i.cards.map((t,e)=>n.jsx(S,{card:t},e))}),n.jsx("button",{onClick:i.shuffle,children:"Shuffle"}),n.jsx("button",{onClick:i.dealCard,children:"Deal"}),n.jsx("button",{onClick:i.reset,children:"Reset"})]})},b=()=>{const i=new l;return n.jsxs(n.Fragment,{children:[n.jsx("h1",{children:"Heads Up!"}),n.jsx("div",{children:"bets"}),n.jsx("div",{children:"board"}),n.jsx("div",{children:n.jsx(v,{deck:i})})]})};p.createRoot(document.getElementById("root")).render(n.jsx(j.StrictMode,{children:n.jsx(b,{})}));
