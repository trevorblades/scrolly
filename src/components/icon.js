const React = require('react');
const classNames = require('classnames');

const icons = {
  add: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,13H13v6H11V13H5V11h6V5h2v6h6v2Z"/><path d="M0,0H24V24H0V0Z" fill="none"/></svg>',
  addLayer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M4,6H2V20a2,2,0,0,0,2,2H18V20H4V6ZM20,2H8A2,2,0,0,0,6,4V16a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V4A2,2,0,0,0,20,2Zm-1,9H15v4H13V11H9V9h4V5h2V9h4v2Z"/></svg>',
  image: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M21,19V5a2,2,0,0,0-2-2H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19A2,2,0,0,0,21,19ZM8.5,13.5l2.5,3L14.5,12,19,18H5Z"/></svg>',
  invisible: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0ZM0,0H24V24H0V0ZM0,0H24V24H0V0ZM0,0H24V24H0V0Z" fill="none"/><path d="M12,7a5,5,0,0,1,5,5,4.85,4.85,0,0,1-.36,1.83l2.92,2.92A11.82,11.82,0,0,0,23,12,11.83,11.83,0,0,0,12,4.5a11.65,11.65,0,0,0-4,.7l2.16,2.16A4.85,4.85,0,0,1,12,7ZM2,4.27L4.28,6.55,4.74,7A11.8,11.8,0,0,0,1,12a11.82,11.82,0,0,0,15.38,6.66l0.42,0.42L19.73,22,21,20.73,3.27,3ZM7.53,9.8l1.55,1.55A2.82,2.82,0,0,0,9,12a3,3,0,0,0,3,3,2.82,2.82,0,0,0,.65-0.08l1.55,1.55A5,5,0,0,1,7.53,9.8ZM11.84,9L15,12.17,15,12a3,3,0,0,0-3-3H11.84Z"/></svg>',
  link: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M3.9,12A3.1,3.1,0,0,1,7,8.9h4V7H7A5,5,0,0,0,7,17h4V15.1H7A3.1,3.1,0,0,1,3.9,12ZM8,13h8V11H8v2Zm9-6H13V8.9h4a3.1,3.1,0,0,1,0,6.2H13V17h4A5,5,0,0,0,17,7Z"/></svg>',
  more: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M6,10a2,2,0,1,0,2,2A2,2,0,0,0,6,10Zm12,0a2,2,0,1,0,2,2A2,2,0,0,0,18,10Zm-6,0a2,2,0,1,0,2,2A2,2,0,0,0,12,10Z"/></svg>',
  remove: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,13H5V11H19v2Z"/><path d="M0,0H24V24H0V0Z" fill="none"/></svg>',
  keyframes: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M19,10v9H5V5h9V3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V10H19Zm-2,0,0.94-2.06L20,7l-2.06-.94L17,4,16.06,6.06,14,7l2.06,0.94Zm-3.75.75L12,8l-1.25,2.75L8,12l2.75,1.25L12,16l1.25-2.75L16,12Z"/></svg>',
  scroll: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,17V10H14v7H11l4,4,4-4H16ZM9,3L5,7H8v7h2V7h3Z"/><path d="M0,0H24V24H0V0Z" fill="none"/></svg>',
  target: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M5,15H3v4a2,2,0,0,0,2,2H9V19H5V15ZM5,5H9V3H5A2,2,0,0,0,3,5V9H5V5ZM19,3H15V5h4V9h2V5A2,2,0,0,0,19,3Zm0,16H15v2h4a2,2,0,0,0,2-2V15H19v4ZM12,9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Z"/></svg>',
  timer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M15,1H9V3h6V1ZM11,14h2V8H11v6Zm8-6.61L20.45,6A11,11,0,0,0,19,4.56L17.62,6A9,9,0,1,0,19,7.39ZM12,20a7,7,0,1,1,7-7A7,7,0,0,1,12,20Z"/></svg>',
  trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M6,19a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V7H6V19Zm2.46-7.12,1.41-1.41L12,12.59l2.12-2.12,1.41,1.41L13.41,14l2.12,2.12-1.41,1.41L12,15.41,9.88,17.53,8.47,16.12,10.59,14ZM15.5,4l-1-1h-5l-1,1H5V6H19V4H15.5Z"/></svg>',
  visible: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M12,4.5A11.83,11.83,0,0,0,1,12a11.82,11.82,0,0,0,22,0A11.83,11.83,0,0,0,12,4.5ZM12,17a5,5,0,1,1,5-5A5,5,0,0,1,12,17Zm0-8a3,3,0,1,0,3,3A3,3,0,0,0,12,9Z"/></svg>',
  wholeNumbers: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0,0H24V24H0V0Z" fill="none"/><path d="M12,17h2V7H10V9h2v8ZM19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3Zm0,16H5V5H19V19Z"/></svg>'
};

const parser = new DOMParser();

const Icon = React.createClass({

  propTypes: {
    className: React.PropTypes.string,
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
      <svg className={classNames('pl-icon', this.props.className)}
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
