import React from 'react/addons';
import _ from 'lodash';
import {State,Link} from 'react-router';
import {Modal, Nav, NavItem} from 'react-bootstrap';
// Components
import {MentionsInput, Mention} from '@sprintly/react-mentions';
import TagsInput from '../components/tags-input';
import DrawerStripe from '../components/drawer-stripe';
import Subitems from '../components/subitems';
import Title from '../components/add-item/title';
import StoryTitle from '../components/add-item/story-title';
import MembersDropdown from '../components/add-item/members-dropdown';
import IssueTemplates from '../components/add-item/issue-templates';
import AddItemActions from '../components/add-item/item-actions';
import Select from 'react-select';

import ItemActions from '../../actions/item-actions';
import ProductStore from '../../stores/product-store';
import helpers from '../components/helpers';
import pagesHelpers from '../pages/helpers';

const ITEM_TYPES = ['story', 'task', 'defect', 'test'];
const STORY_ATTRS = ['who', 'what', 'why'];

var AddItemPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin, State],

  propTypes: {
    tags: React.PropTypes.array,
    members: React.PropTypes.array,
    product: React.PropTypes.object
  },

  getInitialState() {
    let product = ProductStore.getProduct(this.getParams().id);

    return {
      product: product,
      stripeHeight: pagesHelpers.stripeHeight(),
      type: 'story',
      title: '',
      who: '',
      what: '',
      why: '',
      description: '',
      tags: [],
      subitems: [],
      assigned_to: null,
      assigneeName: '',
      sendToBacklog: true,
      validation: {
        title: true,
        who: true,
        what: true,
        why: true
      }
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

  setAssignedTo(value, member) {
    let memberName = _.chain(member).pluck('label').first().value()

    this.setState({
      assigned_to: value,
      assigneeName: memberName
    })
  },

  updateTags(tags) {
    this.setState({ tags });
  },

  changeType(type) {
    var descriptionTemplate = (type === 'defect') ? IssueTemplates.defect : '';
    this.setDescription(null, descriptionTemplate);

    this.setState({ type: type }, () => {
      // ensure focus follows tabbing through types
      this.setFocus(type);
    });
  },

  setFocus(itemType) {
    let ref = itemType === 'story' ? this.refs.title.refs.whoInput :
        this.refs.title.refs.titleInput;
      React.findDOMNode(ref).focus();
  },

  dismiss(ev) {
    ev.preventDefault();
    this.props.onHide();
  },

  onKeyDown(ev) {
    let charCode = (typeof ev.which === "number") ? ev.which : ev.keyCode;
    if ((ev.metaKey || ev.ctrlKey) && (charCode === 13 || charCode === 10)) {
      this.createItem(ev, false);
    }
    return;
  },

  createItem(ev) {
    ev.preventDefault();

    let item = _.pick(this.state, ['type', 'description', 'tags', 'assigned_to']);

    if (this.state.type === 'story') {
      _.assign(item, _.pick(this.state, STORY_ATTRS));
    } else {
      item.title = this.state.title;
    }

    if (this.state.sendToBacklog) {
      item.status = 'backlog';
    }

    ItemActions.addItem(this.props.product.id, item).then( () => {
      let resetState = _.extend({}, this.getInitialState(), { type: this.state.type });
      this.setState(resetState);
      this.setFocus(this.state.type);
    }, (err) => {
      this.updateValidation(err);
    });
  },

  updateValidation(err) {
    let validationState = this.state.validation;
    let errors = err.validationError.split(':')[1].replace(/\s+/g, '').split(',');

    _.each(errors, (attr) => {
      validationState[attr] = false;
    });

    this.setState({validation: validationState});
  },

  notAssignable() {
    return !this.props.members.length;
  },

  assignPlaceholder() {
    return this.notAssignable() ? 'Nobody to assign to': 'Unassigned';
  },

  assigneeName() {
    return this.state.assigneeName ? this.state.assigneeName : null;
  },

  typeSelector() {
    let options = _.map(ITEM_TYPES, (option) => {
      return {label: helpers.toTitleCase(option), value: option}
    })

    return (
      <div className="col-xs-12 form-group add-item__type-dropdown">
        <div className="col-xs-2 no-gutter">
          <span>Create a new</span>
        </div>
        <div className="col-xs-10 no-gutter">
          <Select ref="type-select"
                  name="form-field-name"
                  className="type-select"
                  value={this.state.type}
                  options={options}
                  onChange={this.changeType}
                  clearable={false} />
        </div>
      </div>
    )
  },

  itemDescription() {
    let mentions = helpers.formatMentionMembers(this.props.members);

    return (
      <div className="form-group">
        <MentionsInput
          value={this.state.description}
          onChange={this.setDescription}
          placeholder="Add a description...">
            <Mention data={mentions} />
        </MentionsInput>
      </div>
    )
  },

  addSubitemTitle(title) {
    let subitems = _.cloneDeep(this.state.subitems);
    let sameTitleItem = _.find(subitems, (item) => {
      return item.title == title
    })

    if (!sameTitleItem) {
      subitems.push({title})
      this.setState({
        subitems
      })
    }
  },

  deleteSubitem(subitem) {
    let subitems = _.cloneDeep(this.state.subitems);
    subitems = _.reject(subitems, (item) => {
      return item.title === subitem.title
    })
    this.setState({
      subitems
    })
  },

  itemSubitems () {
    if (this.state.type === 'story') {
      return (
        <div className="form-group add-item__subitems">
          <Subitems subitems={this.state.subitems}
                  createItem={this.addSubitemTitle}
                  deleteItem={this.deleteSubitem}
                  updateItem={false} />
        </div>
      )
    }
  },

  itemTags() {
    let tags = _.pluck(this.state.product.tags, 'tag');

    return (
      <div className="form-group">
        <TagsInput tags={tags} onChange={this.updateTags} value={this.state.tags}/>
      </div>
    )
  },

  membersSelect() {
    let members = helpers.formatSelectMembers(this.props.members);

    return (
      <div className="form-group add-item__member-dropdown">
        <Select placeholder={this.assignPlaceholder()}
                name="form-field-name"
                className="assign-dropdown"
                disabled={this.notAssignable()}
                value={this.assigneeName()}
                options={members}
                onChange={this.setAssignedTo}
                clearable={true} />
      </div>
    )
  },

  itemTitle() {
    if (this.state.type === 'story') {
      return (
        <StoryTitle
          ref="title"
          who={this.linkState('who')}
          what={this.linkState('what')}
          why={this.linkState('why')}
          validation={this.linkState('validation')}
        />
      );
    } else {
      return (
        <Title
          ref="title"
          title={this.linkState('title')}
          validation={this.linkState('validation')}
        />
      )
    }
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
  },

  render() {
    return (
      <div className="container-fluid add-item no-gutter drawer">
        <DrawerStripe type={this.state.type}
                      height={this.state.stripeHeight} />
        <div className="drawer__content">
          <div className="col-xs-12">
            {this.typeSelector()}
            <div className="col-xs-12 add-item__form" onKeyDown={this.onKeyDown}>
              {this.itemTitle()}
              {this.itemDescription()}
              {this.itemTags()}
              {this.membersSelect()}
              {this.itemSubitems()}
              <AddItemActions dismiss={this.dismiss}
                            productId={this.getParams().id}
                              addItem={this.createItem}
                              checked={this.linkState('sendToBacklog')} />
            </div>
          </div>
        </div>
      </div>
    )
  },

  _onChange(type, record) {
    if (type === 'afterCreate') {
      if (record.type === 'story' && this.state.subitems.length) {
        ItemActions.bulkAdd('subitems', this.props.product.id, record, this.state.subitems);
      } else if (this.state.attachments) {
        console.log('IMPLEMENT ATTACHMENTS');
      }
    } else {
      let product = ProductStore.getProduct(this.getParams().id);

      if (product) {
        this.setState({product});
      }
    }
  }
});

export default AddItemPage;
