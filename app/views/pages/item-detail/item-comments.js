import React from 'react/addons';
import ItemActions from '../../../actions/item-actions';
import ItemDetailMixin from './detail-mixin';
import {State} from 'react-router'
const placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item.";

var TicketComments = React.createClass({
  mixins: [State, ItemDetailMixin],

  getInitialState() {
    return {
      comment: ''
    }
  },

  saveComment(ev) {
    let comment = ev.currentTarget.getElementsByTagName("textarea")[0].value;
    ItemActions.createComment(this.getParams().id, this.getParams().number, comment)
    this.setState({comment: ''});
  },

  updateComment(ev, value) {
    this.setState({comment: value})
  },

  render: function() {
    let mentionsComponent = this.mentionsComponent(this.state.comment, placeholder, this.updateComment);

    return (
      <div className="col-md-12 section comments">
        <div className="col-md-12">
          {this.header('comment')}
          <form className="comment__form" onSubmit={this.saveComment}>
            <div className="col-md-12 no-gutter">
              {mentionsComponent}
            </div>
            <div className="col-md-12 no-gutter">
              <div className="instructions">
                <div className="upload">Drag and drop or <span className="blue__light">click here</span> to attach files</div>
                <div className="syntax">Use <span className="blue">Markdown</span> & <span className="blue">Emoji</span></div>
              </div>
              <div className="col-md-3 collapse-right pull-right">
                <button className="detail-button kanban-button-secondary">Comment</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
});

export default TicketComments;
