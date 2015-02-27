var React = require('react/addons');

var Controls = React.createClass({
  render: function() {
    var status = this.props.status;
    var nextAction = '';
    var prevAction = '';

    switch(status) {
      case 'someday':
        nextAction = <a href="#promote" className="icon-add" title="Add to Backlog"></a>;
        break;

      case 'backlog':
        nextAction = <a href="#start" className="icon-next" title="Start"></a>;
        break;

      case 'in-progress':
        nextAction = <a href="#complete" className="icon-complete" title="Accept"></a>;
        break;

      case 'completed':
        nextAction = <a href="#accept" className="icon-complete complete" title="Start"></a>;
        break;

      case 'accepted':
        nextAction = <a href="#restart" className="icon-refresh" title="Restart"></a>;
        break;

      default:
        break;
    }

    return (
      <div className="item-card__controls">
        {nextAction}
      </div>
    );
  }
});

module.exports = Controls;
