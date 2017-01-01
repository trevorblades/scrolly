const React = require('react');
const classNames = require('classnames');

const Control = React.createClass({

  propTypes: {
    actions: React.PropTypes.arrayOf(React.PropTypes.shape({
      className: React.PropTypes.string,
      content: React.PropTypes.node.isRequired,
      onClick: React.PropTypes.func,
      title: React.PropTypes.string
    })),
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    draggable: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onDragEnd: React.PropTypes.func,
    onDragStart: React.PropTypes.func
  },

  render: function() {
    return (
      <div className={classNames('sv-control', this.props.className)}
          draggable={this.props.draggable}
          onClick={this.props.onClick}
          onDragEnd={this.props.onDragEnd}
          onDragStart={this.props.onDragStart}>
        {this.props.children}
        <div className="sv-control-actions">
          {this.props.actions.map(function(action, index) {
            const actionClassName = classNames(
              'sv-control-action',
              action.className,
              {'sv-clickable': action.onClick}
            );
            return (
              <div className={actionClassName}
                  key={index}
                  onClick={action.onClick}
                  title={action.title}>
                {action.content}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Control;
