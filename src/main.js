/* eslint-disable max-len */

'use strict';

// document.getElementById('app').innerHTML = `<p>You have been here for ${seconds} seconds.</p>`;

const Static = (() => ({
  getValueToLabelMapping: () => ({
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 12,
    Q: 13,
    K: 14,
    A: 15,
  }),

  getSuitToSymbolMapping: () => ({
    club: { symbol: '&#9827;', color: 'black' }, spade: { symbol: '&#9824;', color: 'black' }, heart: { symbol: '&#9829;', color: 'red' }, diamond: { symbol: '&#9830;', color: 'red' },
  }),
}))();

/* eslint no-underscore-dangle: 0 */
const Card = (suit, label) => {
  const _suit = suit.toLowerCase();
  const _label = label.toUpperCase();
  const _value = Static.getValueToLabelMapping()[_label];
  const _symbol = Static.getSuitToSymbolMapping()[_suit].symbol;
  const _color = Static.getSuitToSymbolMapping()[_suit].color;

  const _uiElement = ((label_, symbol_, color_, value_, suit_) => {
    // construct the card inside a wrapper. We will use the wrapper container to change it's innerHTML during the shuffle
    const cardWrapper = document.createElement('div');
    cardWrapper.setAttribute('id', `${color_}_${value_}_${suit_}`);

    // this is the real card. It contains as attributes the 'value' - used for sorting and the 'suite' used also for sorting, to know in which suite card deck to be shown
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('value', value_);
    card.setAttribute('suit', suit_);

    const labelElement = document.createElement('div');
    labelElement.className = `label ${color_}`;
    labelElement.innerHTML = label_;

    const symbolElement = document.createElement('div');
    symbolElement.className = `symbol ${color_}`;
    symbolElement.innerHTML = symbol_;

    card.appendChild(labelElement);
    card.appendChild(symbolElement);
    cardWrapper.appendChild(card);

    return cardWrapper;
  })(_label, _symbol, _color, _value, _suit);

  // the only publicly exposed method is the getUIElement - which returns the card as a dom element
  return {
    getUIElement: () => _uiElement,
  };
};

const Deck = () => {
  // this array contains the entire deck cards
  let cards = [];

  const _shuffleCards = () => {
    const aLength = cards.length;
    for (let i = aLength - 1; i > 0; i -= 1) {
      const j = Math.ceil(Math.random() * i);
      [cards[i].innerHTML, cards[j].innerHTML] = [cards[j].innerHTML, cards[i].innerHTML];
    }
    return this;
  };
  const removedCards = {
    club: [], spade: [], heart: [], diamond: [],
  };
  const createCardBySuit = (suit, deckElement) => Object.keys(Static.getValueToLabelMapping())
    .map((label) => {
      const card = Card(suit, label).getUIElement();
      deckElement.appendChild(card);
      return card;
    });
  const redrawRemovedCards = (suite) => {
    const targetDeckId = `${suite}_deck`;
    const targetDeck = document.getElementById(targetDeckId);

    // remove all the cards which are already in the suite
    while (targetDeck.hasChildNodes()) {
      targetDeck.removeChild(targetDeck.lastChild);
    }

    // add the sorted cards to the suite
    removedCards[suite].forEach((card) => { targetDeck.appendChild(card[0]); });
  };
  const sortTheSuite = (targetArr) => {
    targetArr.sort(
      (a, b) => a[0].firstChild.getAttribute('value') - b[0].firstChild.getAttribute('value'),
    );

    return targetArr;
  };
  const addCardToRemovedDeck = (cardWraper) => {
    // check to see to which suite to add it
    const suite = cardWraper[0].firstChild.getAttribute('suit');
    removedCards[suite] = [...removedCards[suite], cardWraper];
    removedCards[suite] = sortTheSuite(removedCards[suite], suite);
    redrawRemovedCards(suite);
  };
  const moveCardFromDeck = (event) => {
    const cardWrapper = event.target.parentElement.parentElement;
    const cardWrapperId = cardWrapper.getAttribute('id');
    const cardIndex = cards.findIndex((card) => card.id === cardWrapperId);
    cardWrapper.parentElement.removeChild(cardWrapper);

    addCardToRemovedDeck(cards.splice(cardIndex, 1));
  };
  const createDeckElement = (id, className) => {
    const deckElement = document.createElement('div');
    deckElement.className = `${className}`;
    deckElement.setAttribute('id', `${id}`);
    document.body.appendChild(deckElement);
    return deckElement;
  };
  const _create = () => {
    // create the main deck
    const deck = createDeckElement('deck', 'deck');
    deck.addEventListener('click', (event) => {
      moveCardFromDeck(event);
    });

    // create the decks for the removed cards. These are placeholders for the sorted by Value and Suite cards
    createDeckElement('club_deck', 'clubDeck');
    createDeckElement('heart_deck', 'heartDeck');
    createDeckElement('spade_deck', 'spadeDeck');
    createDeckElement('diamond_deck', 'diamondDeck');

    // create the cards for a new deck
    cards = [].concat(
      ...Object.keys(Static.getSuitToSymbolMapping()).map((suit) => createCardBySuit(suit, deck)),
    );

    setTimeout(() => { _shuffleCards(); }, 1000);
  };

  return {
    shuffleCards: _shuffleCards,
    create: _create,
  };
};

const deck = Deck();
deck.create();
