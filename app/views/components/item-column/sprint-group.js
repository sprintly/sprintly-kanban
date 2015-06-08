import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import ScoreMap from '../../../lib/score-map';
import Sprint from './sprint';

const EMPTY_CHUNK = {
  points: 0,
  items: []
};

const DATE_FORMAT = 'MMMM D';

let SprintGroup = React.createClass({
  getInitialState() {
    return {
      teamStrengths: {}
    }
  },

  /**
   * Chunks the items passed into the props into sprints based on the current predicted velocity.
   * Each sprint chunk is an object with the following structure:
   * {
   *   points: {Number}, // the number of points in the sprint.
   *   items: {Array} // an array of objects containing item data
   * }
   *
   * @returns {Array} // an array of raw sprint chunks
   */
  chunkItems() {
    let chunks = [];
    let currentChunk = _.cloneDeep(EMPTY_CHUNK);
    let i = 0;
    let max = this.props.items.length;
    while (i < max) {
      let capacity = this._getCapacityForSprint(chunks.length);
      if (capacity === 0) {
        chunks.push(currentChunk);
        currentChunk = _.cloneDeep(EMPTY_CHUNK);
      } else {
        let item = this.props.items[i];
        let itemScore = ScoreMap[item.score];
        currentChunk.points += itemScore;
        currentChunk.items.push(item);

        if (this._shouldPushChunk(currentChunk, capacity, i)) {
          // Add the current chunk to the collection and start a new one
          chunks.push(currentChunk);
          currentChunk = _.cloneDeep(EMPTY_CHUNK);
        }
        i += 1;
      }
    }
    return chunks;
  },

  // Check whether adding the next item's score will push the current sprint chunks's point
  // count above the predicted velocity. If so, add it to the chunks collection and start a
  // new sprint chunk.
  // In the case that the current sprint chunk is under the predicted velocity by *more* than
  // adding the next item would cause it to go over, allow the sprint's total to
  // go over the predicted velocity instead. This prevents things like a 3 or 5 point sprint
  // when followed by an 8 point sprint.
  _shouldPushChunk(currentChunk, capacity, i) {
    let isLastItem = this.props.items.length === i + 1;

    let nextItem = this._getNextChunk(i);
    let nextItemScore = ScoreMap[nextItem.score];
    let scoreWithNext = currentChunk.points + nextItemScore;
    let nextScoreIsOverAverage = scoreWithNext >= capacity;
    let underageIsGreaterThanOverage = capacity - currentChunk.points > scoreWithNext - capacity;
    return (isLastItem || (nextScoreIsOverAverage && !underageIsGreaterThanOverage));
  },

  _getCapacityForSprint(currentChunkIdx) {
    let capacity = this.props.velocity.average;

    // If there is a team strength adjustment for this sprint, adjust the capacity
    if (_.isNumber(this.state.teamStrengths[currentChunkIdx])) {
      capacity *= this.state.teamStrengths[currentChunkIdx];
    }
    return capacity;
  },

  _getNextChunk(i) {
    return this.props.items[i + 1] || { score: '~' };
  },

  updateTeamStrengths(sprint) {
    this.state.teamStrengths[sprint.props.index] = sprint.state.teamStrength;
    this.forceUpdate();
  },

  renderSprints() {
    var rawSprints = this.chunkItems();
    return _.map(rawSprints, (sprint, i) => {
      // Start the groups in the backlog with the next week
      let startDate = moment().startOf('isoweek').add(7 * (i + 1), 'days').format(DATE_FORMAT);
      return (
        <Sprint
          key={`item-group-${i}`}
          items={sprint.items}
          sortField={this.props.sortField}
          productId={this.props.productId}
          startDate={startDate}
          startOpen={i === 0}
          points={sprint.points}
          onChangeTeamStrength={this.updateTeamStrengths}
          index={i}
        />
      );
    });
  },

  render() {
    let sprints = this.renderSprints();
    return (
      <div className="sprint-group">
        {sprints}
      </div>
    );
  }
})

export default SprintGroup;

