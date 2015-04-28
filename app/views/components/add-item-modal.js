import _ from 'lodash'; import React from 'react/addons';

import {Modal,Nav,NavItem} from 'react-bootstrap';
import {MentionsInput, Mention} from 'react-mentions';
import Title from './add-item/title';
import TagsInput from './tags-input';
import StoryTitle from './add-item/story-title';
import MembersDropdown from './add-item/members-dropdown';

import ItemActions from '../../actions/item-actions';
import AttachmentActions from '../../actions/attachment-actions';
import AttachmentStore from '../../stores/attachment-store';

import LocalStorageMixin from 'react-localstorage';
import {DragDropMixin, NativeDragItemTypes} from 'react-dnd';


const NAV_ITEMS = [
  { type: 'story', label: 'Story' },
  { type: 'task', label: 'Task' },
  { type: 'defect', label: 'Defect' },
  { type: 'test', label: 'Test' },
];


var AddItemModal = React.createClass({

  propTypes: {
    tags: React.PropTypes.array,
    members: React.PropTypes.array,
    product: React.PropTypes.object
  },

  mixins: [
    DragDropMixin,
    // LocalStorageMixin,
    React.addons.LinkedStateMixin
  ],

  statics: {
    configureDragDrop(register) {
      register(NativeDragItemTypes.FILE, {
        dropTarget: {
          acceptDrop(component, item) {
            if (item.files && item.files[0]) {
              AttachmentActions.createUpload(item.files[0]);
            }
          }
        }
      });
    }
  },

  getInitialState() {
    return {
      type: 'story',
      title: '',
      who: '',
      what: '',
      why: '',
      description: '',
      tags: [],
      assigned_to: null,
      sendToBacklog: true,
      attachments: AttachmentStore.getPendingAttachments()
    }
  },

  getDefaultProps() {
    return {
      members: []
    }
  },

  componentDidMount() {
    AttachmentStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    AttachmentStore.removeChangeListener(this._onChange);
  },

  _onChange() {
    let uploads = AttachmentStore.getActiveUploads();
    let attachments = AttachmentStore.getPendingAttachments();
    let description = this.state.description;

    for(let i=0; i < uploads.length; i++) {
      let embed = `![Uploading ${uploads[i].name}](...)`
      if (description.indexOf(embed) < 0) {
        description = _.compact([description, embed]).join('\n');
      }
    }

    for(let i=0; i < attachments.length; i++) {
      let image = attachments[i][':original'][0];
      let embed = `![Uploading ${image.name}](...)`;
      description = description
        .replace(embed, `![${image.name}](${image.ssl_url})`, 'g');
    }

    this.setState({
      description,
      attachments
    });
  },

  setDescription(value) {
    this.setState({ description: value });
  },

  setAssignedTo(assigned) {
    this.setState({ assigned_to: assigned })
  },

  updateTags(tags) {
    this.setState({ tags });
  },

  changeType(type) {
    this.setState({ type: type });
  },

  dismiss(ev) {
    ev.preventDefault();
    let state = this.getInitialState();
    state.attachments = [];
    this.setState(state);
    this.props.onRequestHide();
  },

  createItem(ev) {
    ev.preventDefault();
    let item = _.pick(this.state, ['type', 'description', 'tags', 'assigned_to']);

    if (this.state.type === 'story') {
      _.assign(item, _.pick(this.state, ['who', 'what', 'why']));
    } else {
      item.title = this.state.title;
    }

    if (this.state.sendToBacklog) {
      item.status = 'backlog';
    }

    ItemActions.addItem(this.props.product.id, item).then(() => {
      this.setState(this.getInitialState());
      this.props.onRequestHide();
    });
  },

  render() {
    let fileDropState = this.getDropState(NativeDragItemTypes.FILE);

    let bodyClasses = React.addons.classSet({
      'modal-body': true,
      'dragging': fileDropState.isHovering
    });

    let mentions = _.map(this.props.members, function(member) {
      return {
        id: member.id,
        display: `${member.first_name} ${member.last_name.slice(0,1)}.`
      }
    });

    let tags = _.pluck(this.props.tags, 'tag');

    let title = this.state.type === 'story' ?
      (<StoryTitle
        who={this.linkState('who')}
        what={this.linkState('what')}
        why={this.linkState('why')}
      />):
      <Title title={this.linkState('title')} />;

    return (
      <Modal {...this.props} className="add-item">
        <Nav className="add-item__tabs" bsStyle='tabs' activeKey={this.state.type} onSelect={this.changeType}>
          {_.map(NAV_ITEMS, (item) => {
            return (
              <NavItem tabIndex="1" aria-role="tab" eventKey={item.type} className={`add-item__nav-${item.type}`}>
                {item.label}
              </NavItem>
            )
          })}
        </Nav>
        <div className={bodyClasses} {...this.dropTargetFor(NativeDragItemTypes.FILE)}>
          <form onSubmit={this.createItem}>
            {title}
            <div className="form-group">
              <MentionsInput
                value={this.state.description}
                onChange={this.setDescription}
                placeholder="Add a description and drag files here to attach...">
                  <Mention data={mentions} />
              </MentionsInput>
            </div>
            <div className="form-group">
              <TagsInput tags={tags} onChange={this.updateTags} value={this.state.tags}/>
            </div>
            <div className="row">
              <div className="col-xs-7">
                <MembersDropdown
                  members={this.props.members}
                  assigned_to={this.state.assigned_to}
                  onChange={this.setAssignedTo}
                />
              </div>
              <div className="col-xs-5 add-item__actions">
                <input type="submit" className="btn btn-primary btn-lg create-item" value="Create Item"/>
                <button className="btn btn-default btn-lg cancel-item" onClick={this.dismiss}>Cancel</button>
                <div className="checkbox">
                  <label>
                    <input className="backlog-checkbox" type="checkbox" name="backlog" checkedLink={this.linkState('sendToBacklog')}/>
                    Automatically send to backlog.
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
});

export default AddItemModal;
