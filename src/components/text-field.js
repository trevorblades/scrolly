const React = require('react');

const resetCaret = function(node) {
  const range = document.createRange();
  range.setStart(node, 1);
  range.collapse(true);

  const selection = getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};

const TextField = React.createClass({

  propTypes: {
    onChange: React.PropTypes.func,
    step: React.PropTypes.number,
    style: React.PropTypes.object,
    type: React.PropTypes.oneOf(['text', 'number']),
    value: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]).isRequired
  },

  getDefaultProps: function() {
    return {
      step: 1,
      type: 'text'
    };
  },

  getInitialState: function() {
    return {
      editing: false,
      value: this.props.value
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({value: nextProps.value});
    }
  },

  _onBlur: function() {
    this.setState({editing: false});
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  },

  _onInput: function(event) {
    let value = event.target.innerHTML;

    if (this.props.type === 'number') {
      if (!value) {
        value = 0;
      } else if (!isNaN(value) && value.charAt(value.length - 1) !== '.') {
        value = parseFloat(value);
      }

      if (!value || (value && !this.state.value)) {
        event.target.innerHTML = value;
        resetCaret(event.target);
      }
    }

    this.setState({value: value});
  },

  _onDoubleClick: function(event) {
    const target = event.target;
    this.setState({editing: true}, function() {
      target.focus();
      document.execCommand('selectAll', false, null);
    });
  },

  _onKeyDown: function(event) {
    if ([9, 13, 27].indexOf(event.keyCode) !== -1) { // tab, esc, or return key pressed
      return event.target.blur();
    }

    const isUpOrDown = event.keyCode === 38 || event.keyCode === 40;
    const isDisallowed = [8, 37, 39, 46, 190].indexOf(event.keyCode) === -1 && // isn't backspace, left, right, delete, or period
        (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && // isn't a top row number
        (event.keyCode < 96 || event.keyCode > 105) && // isn't a numpad number
        !event.metaKey && !event.ctrlKey;
    if (this.props.type === 'number' && (isUpOrDown || isDisallowed)) {
      event.preventDefault();
      if (isUpOrDown) {
        let direction = event.keyCode === 38 ? 1 : -1;
        if (event.shiftKey) {
          direction *= 10;
        }
        let value = parseFloat(this.state.value);
        value = value + this.props.step * direction;
        value = Math.round(value * 100) / 100;
        this.setState({value: value}, resetCaret.bind(null, event.target));
      }
    }
  },

  render: function() {
    return (
      <div className="pl-text-field"
          contentEditable={this.state.editing}
          dangerouslySetInnerHTML={{__html: this.state.value}}
          onBlur={this._onBlur}
          onDoubleClick={this._onDoubleClick}
          onInput={this._onInput}
          onKeyDown={this._onKeyDown}
          spellCheck={false}
          style={this.props.style}/>
    );
  }
});

module.exports = TextField;
