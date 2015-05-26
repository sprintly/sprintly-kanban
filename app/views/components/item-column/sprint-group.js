import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import ScoreMap from '../../../lib/score-map';
import Sprint from './sprint';

const EMPTY_CHUNK = {
  points: 0,
  items: []
};

let SprintGroup = React.createClass({

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
    let sprints = [];
    let currentChunk = _.cloneDeep(EMPTY_CHUNK);
    //let adjustedVelocity = this.props.velocity.average *
    _.each(this.props.items, (item, i) => {
      let itemScore = ScoreMap[item.score];
      currentChunk.points += itemScore;
      currentChunk.items.push(item);

      // Check whether adding the next item's score will push the current sprint chunks's point
      // count above the predicted velocity. If so, add it to the chunks collection and start a
      // new sprint chunk. In the case that the current sprint chunk is under the predicted velocity
      // by *more* than adding the next item would cause it to go over, allow the sprint's total to
      // go over the predicted velocity instead. This prevents things like a 3 or 5 point sprint
      // when followed by an 8 point sprint.
      let nextItem = this.props.items[i + 1] || {score: '~'};
      let nextItemScore = ScoreMap[nextItem.score];
      let scoreWithNext = currentChunk.points + nextItemScore;
      let nextScoreIsOverAverage = currentChunk.points + nextItemScore >= this.props.velocity.average;
      let underageIsGreaterThanOverage = this.props.velocity.average - currentChunk.points >
      scoreWithNext - this.props.velocity.average;

      let isLastItem = this.props.items.length === i + 1;

      if ((nextScoreIsOverAverage && !underageIsGreaterThanOverage) || isLastItem) {
        // Add the current chunk to the collection and start a new one
        chunks.push(currentChunk);
        currentChunk = _.cloneDeep(EMPTY_CHUNK);
      }
    });
    return chunks;
  },

  renderSprints() {
    let rawSprints = this.chunkItems();
    return _.map(rawSprints, (sprint, i) => {
      // Start the groups in the backlog with the next week
      let startDate = moment().startOf('isoweek').add(7 * (i + 1), 'days').format('D MMM');
      return (
        <Sprint
          key={`item-group-${i}`}
          items={sprint.items}
          sortField={this.props.sortField}
          productId={this.props.productId}
          startDate={startDate}
          startOpen={i === 0}
          points={sprint.points}
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

