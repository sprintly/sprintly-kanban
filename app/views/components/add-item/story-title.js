import React from 'react/addons';

let AddItemStoryTitle = React.createClass({

  propTypes: {
    who: React.PropTypes.object.isRequired,
    what: React.PropTypes.object.isRequired,
    why: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="form-group story-title">
        <div className="add-item__field who">
          <span>As an</span>
          <div className="input-group">
            <label>Who</label>
            <input className="form-control" type="text" name="who" placeholder="e.g. accountant" valueLink={this.props.who}/>
          </div>
        </div>
        <div className="add-item__field what">
          <span>I want</span>
          <div className="input-group">
            <label>What</label>
            <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration" valueLink={this.props.what}/>
          </div>
        </div>
        <div className="add-item__field why">
          <span>so that</span>
          <div className="input-group">
            <label>Why</label>
            <input className="form-control" type="text" name="what" placeholder="e.g. Quickbooks integration" valueLink={this.props.why}/>
          </div>
        </div>
      </div>
    )
  }
});

export default AddItemStoryTitle;
