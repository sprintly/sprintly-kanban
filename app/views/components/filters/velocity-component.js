import _ from 'lodash';
import React from 'react/addons';
import {Popover} from 'react-bootstrap';
import onClickOutside from 'react-onclickoutside';
import VelocityActions from '../../../actions/velocity-actions';

var VelocityComponent = React.createClass({
  mixins: [ onClickOutside ],

  getInitialState() {
    return {
      showFiltersMenu: false,
      showVelocityPopover: false
    };
  },

  changeVelocity(e) {
    e.preventDefault();
    let newVelocity = this.refs.velocity_input.getDOMNode().value;
    VelocityActions.setVelocity(this.props.productId, newVelocity);
    this.setState({ showVelocityInput: false });
    this.hideVelocityPopover();
  },

  showVelocityPopover() {
    this.setState({
      showVelocityPopover: true
    }, () => {
      this.refs.velocity_input.getDOMNode().focus();
    });
  },

  hideVelocityPopover() {
    this.setState({ showVelocityPopover: false });
  },

  handleClickOutside() {
    this.hideVelocityPopover();
  },

  escapePopover(e) {
    if (e.keyCode === 27) { // ESC
      return this.hideVelocityPopover();
    }
  },

  placeCursor() {
    // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
    // Moves cursor to the end of the input
    this.refs.velocity_input.getDOMNode().value = this.refs.velocity_input.getDOMNode().value;
  },

  renderVelocityPopover() {
    return (
      <Popover
        placement='bottom'
        positionLeft={8}
        positionTop={18}
        className="velocity__popover" >
        Adjust the predicted weekly velocity of the project
        <form
          onSubmit={this.changeVelocity}
          className="velocity__form form-inline"
          ref="velocity_form">
          <div className="form-group">
            <input
              className="form-control"
              ref="velocity_input"
              defaultValue={Math.round(this.props.velocity)}
              onKeyDown={this.escapePopover}
              onFocus={this.placeCursor}
            />
            <button
              className="btn btn-default btn-sm form-control"
              onClick={this.changeVelocity}>
              Adjust
            </button>
          </div>
        </form>
      </Popover>
    );
  },

  render() {
    let velocityPopover = this.renderVelocityPopover();
    return (
      <div>
        {this.state.showVelocityPopover ? velocityPopover : ''}
        <span className="velocity" onClick={this.showVelocityPopover}>
          <i className="glyphicon glyphicon-dashboard"></i>
          <span>{Math.round(this.props.velocity)}</span>
        </span>
      </div>
    )
  }
});

export default VelocityComponent;
