import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const Control = React.createClass({
  propTypes: {
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        className: PropTypes.string,
        content: PropTypes.node.isRequired,
        onClick: PropTypes.func,
        title: PropTypes.string
      })
    ),
    children: PropTypes.node,
    className: PropTypes.string,
    draggable: PropTypes.bool,
    onClick: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDragStart: PropTypes.func
  },

  render() {
    return (
      <div
        className={classNames('sv-control', this.props.className)}
        draggable={this.props.draggable}
        onClick={this.props.onClick}
        onDragEnd={this.props.onDragEnd}
        onDragStart={this.props.onDragStart}
      >
        {this.props.children}
        <div className="sv-control-actions">
          {this.props.actions.map(action => {
            const actionClassName = classNames(
              'sv-control-action',
              action.className,
              {'sv-clickable': action.onClick}
            );
            return (
              <div
                key={action.id}
                className={actionClassName}
                onClick={action.onClick}
                title={action.title}
              >
                {action.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

export default Control;
