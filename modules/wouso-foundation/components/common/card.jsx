import React from 'react';
import ReactDnD from 'react-dnd';


var ItemTypes = {
    CARD: 'card'
};

var cardSource = {
    beginDrag: (props) => {
        return { id: props.id };
    }
};

var cardTarget = {
    hover: (props, monitor) => {
        var draggedId = monitor.getItem().id;

        if (draggedId !== props.id) {
            props.swapCards(draggedId, props.id);
        }
    }
};


class Card extends React.Component {
    static propTypes = {
        connectDragSource: React.PropTypes.func.isRequired,
        connectDropTarget: React.PropTypes.func.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        id: React.PropTypes.any.isRequired,
        text: React.PropTypes.string.isRequired,
        swapCards: React.PropTypes.func.isRequired
    }
    render() {
        var style = {
            border: '1px dashed gray',
            padding: '0.5rem 1rem',
            marginBottom: '.5rem',
            backgroundColor: 'white',
            cursor: 'move',
            opacity: this.props.isDragging ? 0 : 1
        };
        return this.props.connectDragSource(this.props.connectDropTarget(
            <div style={style}>
                {this.props.text}
            </div>
        ));
    }
};

var DragSourceDecorator = ReactDnD.DragSource(ItemTypes.CARD, cardSource,
    (connect, monitor) => {
        return {
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging()
        };
    });

var DropTargetDecorator = ReactDnD.DropTarget(ItemTypes.CARD, cardTarget,
    (connect) => {
        return {
            connectDropTarget: connect.dropTarget()
        };
    });

module.exports = DropTargetDecorator(DragSourceDecorator(Card));
