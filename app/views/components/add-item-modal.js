import _ from 'lodash'; import React from 'react/addons';

import {Modal,Nav,NavItem} from 'react-bootstrap';
import {MentionsInput, Mention} from 'react-mentions';
import Title from './add-item/title';
import TagsInput from './tags-input';
import StoryTitle from './add-item/story-title';
import MembersDropdown from './add-item/members-dropdown';
import IssueTemplates from './add-item/issue-templates';
import Select from 'react-select';

import ItemActions from '../../actions/item-actions';

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
    React.addons.LinkedStateMixin
  ],

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
      sendToBacklog: true
    }
  },

  getDefaultProps() {
    return {
      members: []
    }
  },

  setDescription(ev, value) {
    this.setState({ description: value });
  },

  setAssignedTo(assigned) {
    this.setState({ assigned_to: assigned })
  },

  updateTags(allTags) {
    if (allTags) {
      var tags = allTags.split(',');
      this.setState({ tags: tags });
    }
  },

  changeType(type) {
    var descriptionTemplate = (type === 'defect') ? IssueTemplates.defect : '';
    this.setDescription(null, descriptionTemplate);

    this.setState({ type: type });
  },

  dismiss(ev) {
    ev.preventDefault();
    let state = this.getInitialState();
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

  prepareTagsForSelect() {
    return _.chain(this.props.tags)
            .pluck('tag')
            .map(function(tag) {
              return {label: tag, value: tag}
            })
            .value()
  },

  addNewTag(ev) {
    console.log('adding new tag soon', ev.currentTarget.value);
  },

  render() {
    let mentions = _.map(this.props.members, function(member) {
      return {
        id: member.id,
        display: `${member.first_name} ${member.last_name.slice(0,1)}.`
      }
    });

    let tags = this.prepareTagsForSelect();

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
        <div className='modal-body'>
          <form onSubmit={this.createItem}>
            {title}
            <div className="form-group">
              <MentionsInput
                value={this.state.description}
                onChange={this.setDescription}
                placeholder="Add a description...">
                  <Mention data={mentions} />
              </MentionsInput>
            </div>
            <div className="form-group">
              <Select placeholder= "Select your Tags"
                      name="form-field-name"
                      className="select-tags"
                      delimeter=","
                      value={this.state.tags}
                      options={tags}
                      multi={true}
                      onChange={this.updateTags}
                      inputProps={{onChange: this.addNewTag}} />
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
                <button className="btn btn-default btn-lg cancel-item" onClick={this.dismiss}>Cancel</button>
                <input type="submit" className="btn btn-primary btn-lg create-item" value="Create Item"/>
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
