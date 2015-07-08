import _ from 'lodash';
import React from 'react/addons';
import ItemCard from '../item-card';
import {Label, Popover} from 'react-bootstrap';
import onClickOutside from '@sprintly/react-onclickoutside';

let Sprint = React.createClass({

  getInitialState() {
    return {
      expanded: this.props.startOpen,
      teamStrength: 1
    };
  },

  mixins: [
    onClickOutside
  ],

  toggleTeamStrengthPopover(e) {
    e.stopPropagation();
    this.setState({
      showingTeamStrengthPopover: !this.state.showingTeamStrengthPopover
    },
    function() {
      this.refs.team_strength_input.getDOMNode().focus();
    });
  },

  adjustTeamStrength(e) {
    e.preventDefault();
    e.stopPropagation();

    let newStrength = this.refs.team_strength_input.getDOMNode().value / 100;
    this.setState({
      teamStrength: newStrength,
      showingTeamStrengthPopover: false
    }, () => {
      this.props.onChangeTeamStrength(this)
    });
  },

  toggleItemCards() {
    this.setState({ expanded: !this.state.expanded });
  },

  handleClickOutside() {
    this.setState({ showingTeamStrengthPopover: false });
  },

  escapeTeamStrengthPopover(e) {
    if (e.keyCode === 27) { // ESC
      this.setState({ showingTeamStrengthPopover: false });
    }
  },

  placeCursor() {
    // http://stackoverflow.com/questions/511088/use-javascript-to-place-cursor-at-end-of-text-in-text-input-element
    // Moves cursor to the end of the input
    this.refs.team_strength_input.getDOMNode().value = this.refs.team_strength_input.getDOMNode().value;
  },

  renderItemCard(item, index) {
    if (!item) { return; }
    let card = (
      <ItemCard
        item={item}
        sortField={this.props.sortField}
        productId={this.props.productId}
        members={this.props.members}
        key={`item-${this.props.productId}${item.number}`}
      />
    );
    return card;
  },

  renderTeamStrengthPopover() {
    return (
      <Popover
        placement='top'
        positionLeft={-22}
        positionTop={-7}
        onClick={(e) => e.stopPropagation()}
        className="team__strength__popover">
        <form onSubmit={this.adjustTeamStrength} className="team__strength__form form-inline">
          <div className="form-group">
            <label for="team-strength-input">Team strength:
              <input
                ref="team_strength_input"
                onKeyDown={this.escapeTeamStrengthPopover}
                onFocus={this.placeCursor}
                defaultValue={Math.round(this.state.teamStrength * 100, 2)}
                id="team-strength-input"
                className="form-control" />
              %
            </label>
            <button
              className="btn btn-default btn-sm form-control"
              onClick={this.adjustTeamStrength}>
              Adjust
            </button>
          </div>
        </form>
      </Popover>
    );
  },

  render() {
    let itemCards = _.map(this.props.items, this.renderItemCard);
    let teamStrength = `${Math.round(this.state.teamStrength * 100, 2)}%`;
    let chevronClass = `sprint__chevron glyphicon glyphicon-menu-${this.state.expanded ? 'up' : 'down'}`;
    return (
      <div className={`sprint sprint-${this.state.expanded ? 'open' : 'closed'}`}>
        <div className="panel panel-default">
          <div className="panel-heading" onClick={this.toggleItemCards}>
            {this.props.startDate}
            <Label onClick={this.toggleTeamStrengthPopover}>{this.props.points} points</Label>
            {this.state.showingTeamStrengthPopover ? this.renderTeamStrengthPopover() : ''}
            <span className={chevronClass}></span>
          </div>
          <div className="panel-body">
            {this.state.expanded ? <div>{itemCards}</div> : '' }
          </div>
        </div>
      </div>
    );
  }
})

export default Sprint;
