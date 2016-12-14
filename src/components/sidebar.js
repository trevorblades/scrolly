const React = require('react');
const classNames = require('classnames');

const Sidebar = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    width: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      activeTabIndex: 0
    };
  },

  render: function() {
    return (
      <div className="pl-sidebar" style={{width: this.props.width}}>
        <div className="pl-sidebar-tabs">
          {this.props.children.map((child, index) => {
            const tabClassName = classNames('pl-sidebar-tab', {
              'pl-active': index === this.state.activeTabIndex
            });
            return <div className={tabClassName} key={index}>Tab</div>;
          })}
        </div>
        <div className="pl-sidebar-content">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Sidebar;
