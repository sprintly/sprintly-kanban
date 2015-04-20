import React from 'react/addons';

let AddItemTitle = React.createClass({
  propTypes: {
    title: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="form-group">
        <input className="form-control" placeholder="What is it?" name="title" valueLink={this.props.title}/>
      </div>
    );
  }
});

export default AddItemTitle;
