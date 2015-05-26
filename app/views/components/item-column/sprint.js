import _ from 'lodash';
import React from 'react/addons';
import Bootstrap from 'react-bootstrap';
import ItemCard from '../item-card';

let Sprint = React.createClass({
  getInitialState() {
    return {
      expanded: this.props.startOpen,
      showingTeamStrengthPanel: false,
      teamStrength: 1
    };
  },

  toggleTeamStrengthPanel(e) {
    e.stopPropagation();
    this.setState({ showingTeamStrengthPanel: !this.state.showingTeamStrengthPanel });
  },

  adjustTeamStrength(e) {
    e.preventDefault();
    let newStrength = this.refs.team_strength.getDOMNode().value / 100;
    this.setState({
      teamStrength: newStrength,
      showingTeamStrengthPanel: false
    });
  },

  toggleItemCards() {
    this.setState({ expanded: !this.state.expanded });
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

  renderTeamStrengthPanel() {
    if (!this.state.showingTeamStrengthPanel) {
      return '';
    } else {
      return (
        <form onSubmit={this.adjustTeamStrength}>
          <input type="text" ref="team_strength" />
        </form>
      );
    }
  },

  render() {
    let itemCards = _.map(this.props.items, this.renderItemCard);
    let teamStrength = `${this.state.teamStrength * 100}%`;
    let chevronClass = 'sprint__chevron glyphicon glyphicon-chevron-';
    chevronClass += this.state.expanded ? 'up' : 'down';
    return (
      <div className="sprint">
        <Bootstrap.Panel onClick={this.toggleItemCards}>
          {this.props.startDate} ({this.props.points} points)
          <span className="team__strength" onClick={this.toggleTeamStrengthPanel}>{teamStrength}</span>
          {this.renderTeamStrengthPanel()}
          <span className={chevronClass}></span>
        </Bootstrap.Panel>
        { this.state.expanded ? <div>{itemCards}</div> : <div></div> }
      </div>
    );
  }
})

export default Sprint;
