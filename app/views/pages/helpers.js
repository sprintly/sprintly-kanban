export default {
  isMobile(window) {
    return window.innerWidth <= 420
  },

  generateTranslation(current, columnCount, elWidth, increment) {
    var position = current.position
    var value = current.value

    if (increment) {
      if (position < columnCount-1) {
        position = position + 1
      }
    } else if (position > 0) {
      position = position - 1
    }

    value = position ? `-${elWidth * position}px`: '0px'

    return {
      position: position,
      value: value
    }
  },

  browserPrefix(attr, value) {
    var object = {}

    object[`-webkit-${attr}`] = value
    object[`-moz-${attr}`] = value
    object[`-o-${attr}`] = value

    return object
  },

  stripeHeight() {
    const PRODUCT_HEADER_CLASS = 'product__header-menu'
    let bodyHeight = document.body.getBoundingClientRect().height
    let headerHeight = document.getElementsByClassName(PRODUCT_HEADER_CLASS)[0].getBoundingClientRect().height

    return bodyHeight - headerHeight
  }
}
