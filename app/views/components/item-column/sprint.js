import _ from 'lodash';
import React from 'react/addons';
import Bootstrap from 'react-bootstrap';
import ItemCard from '../item-card';
import onClickOutside from 'react-onclickoutside';

let Sprint = React.createClass({
  mixins: [ onClickOutside ],

  getInitialState() {
    return {
      expanded: this.props.startOpen,
      showingTeamStrengthInput: false,
      teamStrength: 1
    };
  },

  toggleTeamStrengthInput(e) {
    e.stopPropagation();
    this.setState({
      showingTeamStrengthInput: !this.state.showingTeamStrengthInput
    },
    function() {
      this.refs.team_strength_input.getDOMNode().focus();
    });
  },

  adjustTeamStrength(e) {
    e.preventDefault();
    let newStrength = this.refs.team_strength_input.getDOMNode().value / 100;
    this.setState({
      teamStrength: newStrength,
      showingTeamStrengthInput: false
    }, () => {
      this.props.onChangeTeamStrength(this)
    });
  },

  toggleItemCards() {
    this.setState({ expanded: !this.state.expanded });
  },

  handleClickOutside() {
    this.setState({ showingTeamStrengthInput: false });
  },

  escapeTeamStrengthInput(e) {
    if (e.keyCode === 27) { // ESC
      this.setState({ showingTeamStrengthInput: false });
    }
  },

  renderItemCard(item, index) {
    if (!item) { return; }
    let card = (
      <ItemCard
        item={item}
        sortField={this.props.sortField}
        productId={this.props.productId}
        key={`item-${this.props.productId}${item.number}`}
      />
    );
    return card;
  },

  renderTeamStrengthInput() {
    if (!this.state.showingTeamStrengthInput) {
      return '';
    } else {
      return (
        <form onSubmit={this.adjustTeamStrength} className="team__strength">
          <input type="text" ref="team_strength_input" onKeyDown={this.escapeTeamStrengthInput} />
        </form>
      );
    }
  },

  render() {
    let itemCards = _.map(this.props.items, this.renderItemCard);
    let teamStrength = `${Math.round(this.state.teamStrength * 100, 2)}%`;
    let chevronClass = 'sprint__chevron glyphicon glyphicon-chevron-';
    chevronClass += this.state.expanded ? 'up' : 'down';
    let teamStrengthDisplay = this.state.showingTeamStrengthInput ? '' :
      <span className="team__strength" onClick={this.toggleTeamStrengthInput}>{teamStrength}</span>
    return (
      <div className="sprint">
        <Bootstrap.Panel>
          {this.props.startDate} ({this.props.points} points)
          TS: {teamStrengthDisplay}
          {this.renderTeamStrengthInput()}
          <span onClick={this.toggleItemCards} className={chevronClass}></span>
        </Bootstrap.Panel>
        { this.state.expanded ? <div>{itemCards}</div> : <div></div> }
      </div>
    );
  }
})

export default Sprint;
