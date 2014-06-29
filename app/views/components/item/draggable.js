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
}

exports.dragOver = function(e) {
  e.preventDefault();
  var node = this.getDOMNode()
  node.classList.add('over')
}

exports.drop = function(e) {
  var node = this.getDOMNode()
  node.classList.remove('over')
  this.props.reorder(this.props.key, e.dataTransfer.getData('text'))
}


