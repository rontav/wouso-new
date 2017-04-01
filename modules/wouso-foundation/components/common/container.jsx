import React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import Card from './Card';
import ReactDnD from 'react-dnd';

var style = {
    width: 400
};

class Container extends React.Component {
    constructor() {
        super();
        this.getInitialState = this.getInitialState.bind(this);
        this.compareCards = this.compareCards.bind(this);
        this.swapCards = this.swapCards.bind(this);   
    }

    getInitialState() {
        return {
            cards: [{
                id: 1,
                order: 1,
                text: 'Write a cool JS library'
            }, {
                id: 2,
                order: 2,
                text: 'Make it generic enough'
            }, {
                id: 3,
                order: 3,
                text: 'Write README'
            }, {
                id: 4,
                order: 4,
                text: 'Create some examples'
            }, {
                id: 5,
                order: 5,
                text: 'Spam in Twitter and IRC to promote it'
            }, {
                id: 6,
                order: 6,
                text: '???'
            }, {
                id: 7,
                order: 7,
                text: 'PROFIT'
            }]
        };
    }

    compareCards(card1, card2) {
        return card1.order - card2.order;
    }

    swapCards(id1, id2) {
        var cards = this.state.cards;

        var card1 = cards.filter((c) => {return c.id === id1})[0];
        var card2 = cards.filter((c) => {return c.id === id2})[0];

        var temp = card1.order;
        card1.order = card2.order;
        card2.order = temp;

        cards.sort(this.compareCards);

        this.setState({
            cards: cards
        });
    }

    render() {
        return (
            <div style={style}>
                {this.state.cards.map((card) =>  {
                    return (
                        <Card key={card.id}
                                    id={card.id}
                                    text={card.text}
                                    swapCards={this.swapCards} />
                    );
                }, this)}
            </div>
        );
    }
}

module.exports = ReactDnD.DragDropContext(HTML5Backend)(Container);
