var React = require('react/addons');

var Controls = React.createClass({
  render: function() {
    var status = this.props.status;
    var nextAction = '';
    var prevAction = '';

    switch(status) {
      case 'someday':
        nextAction = <a href="#promote" className="icon-add" title="Add to Backlog"></a>;
        prevAction = <a href="#destroy" className="icon-close destroy" title="Delete"></a>
        break;

      case 'backlog':
        nextAction = <a href="#start" className="icon-next" title="Start"></a>;
        prevAction = <a href="#reject" className="icon-close" title="Reject"></a>
        break;

      case 'in-progress':
        nextAction = <a href="#complete" className="icon-complete" title="Accept"></a>;
        prevAction = <a href="#stop" className="icon-close" title="Reject"></a>
        break;

      case 'completed':
        nextAction = <a href="#accept" className="icon-complete complete" title="Start"></a>;
        prevAction = <a href="#restart" className="icon-refresh" title="Restart"></a>
        break;

      case 'accepted':
        prevAction = <a href="#restart" className="icon-refresh" title="Restart"></a>;
        break;

      default:
        break;
    }

    return (
      <div className="item-card__controls">
        <a href="#more" className={[
          (this.props.showDetails ? 'icon-minus' : 'icon-more'),
          'details-toggle'
        ].join(' ')} title={this.props.showDetails ? 'Hide Details': 'Show Details'} onClick={this.props.toggleDetails}></a>
        {nextAction}
        {prevAction}
      </div> 
    );
  }
});

module.exports = Controls;
