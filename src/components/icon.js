const React = require('react');

const icons = {
  invisible: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21.99 19"><path d="M11,4a5,5,0,0,1,5,5,4.85,4.85,0,0,1-.36,1.83l2.92,2.92A11.82,11.82,0,0,0,22,9,11.83,11.83,0,0,0,11,1.5a11.65,11.65,0,0,0-4,.7L9.17,4.36A4.85,4.85,0,0,1,11,4ZM1,1.27L3.28,3.55,3.74,4A11.8,11.8,0,0,0,0,9a11.83,11.83,0,0,0,11,7.5,11.78,11.78,0,0,0,4.38-.84l0.42,0.42L18.73,19,20,17.73,2.27,0ZM6.53,6.8L8.08,8.35A2.82,2.82,0,0,0,8,9a3,3,0,0,0,3,3,2.82,2.82,0,0,0,.65-0.08l1.55,1.55A5,5,0,0,1,6.53,6.8ZM10.84,6L14,9.17,14,9a3,3,0,0,0-3-3H10.84Z"/></svg>',
  visible: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 15"><path d="M11,0A11.83,11.83,0,0,0,0,7.5a11.82,11.82,0,0,0,22,0A11.83,11.83,0,0,0,11,0Zm0,12.5a5,5,0,1,1,5-5A5,5,0,0,1,11,12.5Zm0-8a3,3,0,1,0,3,3A3,3,0,0,0,11,4.5Z"/></svg>'
};

const parser = new DOMParser();

const Icon = React.createClass({

  propTypes: {
    name: React.PropTypes.string.isRequired
  },

  render: function() {
    if (!icons[this.props.name]) {
      return null;
    }

    const shapes = [];
    const icon = parser.parseFromString(icons[this.props.name], 'image/svg+xml').childNodes[0];
    for (let i = 0; i < icon.childNodes.length; i++) {
      const childNode = icon.childNodes.item(i);
      if (childNode.nodeType === 1 && childNode.tagName !== 'title') {
        var attributes = Array.prototype.slice.call(childNode.attributes, 0);
        shapes.push({
          tagName: childNode.tagName,
          attributes: attributes.reduce(function(obj, attr) {
            obj[attr.name] = attr.value;
            return obj;
          }, {})
        });
      }
    }

    return (
      <svg className="pl-icon"
          viewBox={icon.attributes.viewBox.value}
          xmlns="http://www.w3.org/2000/svg">
        {shapes.map(function(shape, index) {
          return React.createElement(shape.tagName,
              Object.assign({key: index}, shape.attributes));
        })}
      </svg>
    );
  }
});

module.exports = Icon;
