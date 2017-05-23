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
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    multiline: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    step: React.PropTypes.number,
    style: React.PropTypes.object,
    title: React.PropTypes.string,
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

  shouldComponentUpdate: function(nextProps, nextState) {
    return !(this.state.editing && nextState.editing);
  },

  _onBlur: function() {
    this.setState({editing: false});
    this.props.onChange(this.state.value);
  },

  _onDoubleClick: function(event) {
    const target = event.target;
    this.setState({editing: true}, function() {
      target.focus();
      document.execCommand('selectAll', false, null);
    });
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

  _onKeyDown: function(event) {
    if ([9, 27, 13].indexOf(event.keyCode) !== -1) { // tab, esc, or return key pressed
      if (this.props.multiline && event.keyCode === 13 && !(event.metaKey || event.ctrlKey)) { // return key pressed on a mutliline field
        return;
      }
      return event.target.blur();
    }

    if (this.props.type === 'number') {
      const allowedKeys = [8, 37, 39, 46, 110, 190]; // backspace, left, right, numpad period, delete, or period
      if (typeof this.props.min === 'undefined' || this.props.min < 0) {
        allowedKeys.push(189);
      }
      const disallowed = allowedKeys.indexOf(event.keyCode) === -1 && // isn't an allowed character
          (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && // isn't a top row number
          (event.keyCode < 96 || event.keyCode > 105) && // isn't a numpad number
          !event.metaKey && !event.ctrlKey;
      const isUpOrDown = event.keyCode === 38 || event.keyCode === 40;
      if (isUpOrDown || disallowed) {
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
    }
  },

  render: function() {
    return (
      <div className="sv-text-field"
          contentEditable={this.state.editing}
          dangerouslySetInnerHTML={{__html: this.state.value}}
          onBlur={this._onBlur}
          onDoubleClick={this._onDoubleClick}
          onInput={this._onInput}
          onKeyDown={this._onKeyDown}
          spellCheck={false}
          style={this.props.style}
          title={this.props.title}/>
    );
  }
});

module.exports = TextField;
