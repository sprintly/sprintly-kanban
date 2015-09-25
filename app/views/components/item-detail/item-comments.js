import React from 'react/addons'
import ItemActions from '../../../actions/item-actions'
import ItemDetailMixin from './detail-mixin'
import ItemHeader from './item-header'
import {State} from 'react-router'

const placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item."

var TicketComments = React.createClass({
  mixins: [State, ItemDetailMixin],

  getInitialState() {
    return {
      comment: ''
    }
  },

  propsTypes: {
    members: React.PropTypes.array
  },

  saveComment(ev) {
    ItemActions.createComment(this.getParams().id, this.getParams().number, this.state.comment)
    this.setState({comment: ''})
  },

  updateComment(ev, value) {
    this.setState({comment: value})
  },

  render: function() {
    let mentionsComponent = this.mentionsComponent(this.state.comment, placeholder, this.props.members, this.updateComment)

    return (
      <div className="col-xs-12 section comments">
        <div className="col-xs-12">
          <ItemHeader title="comments" />
          <div className="comment__form">
            <div className="col-xs-12 no-gutter">
              {mentionsComponent}
            </div>
            <div className="col-xs-12 no-gutter">
              <div className="instructions">
                <div className="syntax">Supports <span className="blue">Markdown</span></div>
              </div>
              <div className="col-xs-12 col-sm-3 comment__button collapse-right pull-right">
                <button className="detail-button kanban-button-secondary" onClick={this.saveComment}>Comment</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default TicketComments
/*
  When attachmetns are supported:
  <div className="upload">Drag and drop or <span className="blue__light">click here</span> to attach files</div>
   & <span className="blue">Emoji</span>
*/
