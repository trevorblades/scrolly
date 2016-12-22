const React = require('react');
const classNames = require('classnames');

const Control = React.createClass({

  propTypes: {
    actions: React.PropTypes.arrayOf(React.PropTypes.shape({
      children: React.PropTypes.node,
      onClick: React.PropTypes.func
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
      <div className={classNames('pl-control', this.props.className)}
          draggable={this.props.draggable}
          onClick={this.props.onClick}
          onDragEnd={this.props.onDragEnd}
          onDragStart={this.props.onDragStart}>
        {this.props.children}
        <div className="pl-control-actions">
          {this.props.actions.map(function(action, index) {
            return (
              <div className="pl-control-action"
                  key={index}
                  onClick={action.onClick}
                  title={action.title}>
                {action.children}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Control;
