module.exports = {
  isMobile(window) {
    return window.innerWidth <= 420
  },

  generateTranslation(current, columnCount, elWidth, increment) {
    var position = current.position;
    var value = current.value;

    if (increment) {
      if (position < columnCount-1) {
        position = position + 1;
      }
    } else if (position > 0) {
      position = position - 1;
    }

    value = position ? `-${elWidth * position}px`: '0px';

    return {
      position: position,
      value: value
    }
  }
}
