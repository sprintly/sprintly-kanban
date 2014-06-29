/**
 * Drag and Drop to Reorder
 */

exports.dragStart = function(e) {
  console.log('drag start')
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text', this.props.key)
  this.setState({ dragging: true })
}

exports.dragEnd = function() {
  this.setState({ dragging: false })
}

exports.dragEnter = function(e) {
  if (!this.state.dragging) {
    var node = this.getDOMNode()
    node.classList.add('over')
  }
}

exports.dragLeave = function(e) {
  var node = this.getDOMNode()
  node.classList.remove('over')
  node.classList.remove('merge')
}

exports.dragOver = function(e) {
  e.preventDefault();
  var node = this.getDOMNode()
  node.classList.add('over')

  if (e.shiftKey && !this.state.dragging) {
    node.classList.add('merge')
  }
}

exports.drop = function(e) {
  var node = this.getDOMNode()
  node.classList.remove('over')
  node.classList.remove('merge')
  if (e.shiftKey) {

  } else {
    this.props.reorder(this.props.key, e.dataTransfer.getData('text'))
  }
}

