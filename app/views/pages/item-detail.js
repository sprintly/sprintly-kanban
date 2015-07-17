import React from 'react/addons';
import _ from 'lodash';
import ItemActions from '../../actions/item-actions';
import ProductStore from '../../stores/product-store';
import {State,Link} from 'react-router';
import {MentionsInput, Mention} from '@sprintly/react-mentions';
import {Accordion, Panel} from 'react-bootstrap';
import helpers from '../components/helpers';
import Select from 'react-select';
import ItemCard from '../components/item-card';
import marked from 'marked';
import Gravatar from '../components/gravatar';

var ItemDetail = React.createClass({

  mixins: [State],

  getInitialState() {
    return {
      item: {}
    };
  },

  _onChange() {
    let item = ProductStore.getItem(this.getParams().id, this.getParams().number);
    if (item) {
      this.setState({
        item
      });
    }
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    ItemActions.fetchItem(this.getParams().id, this.getParams().number);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.getParams().number != this.state.item.number) {
      this._onChange();
      // ItemActions.fetchItem(this.getParams().id, this.props.number);
    }
  },

  renderDescription() {
    if (this.state.item.description) {
      return (
        <div
          className="well"
          dangerouslySetInnerHTML={{
            __html: marked(this.state.item.description, {sanitize: true})
          }}
        />
      );
    } else {
      return '';
    }
  },

  ticketDetail() {
    let members = helpers.formatSelectMembers(this.props.members);

    let tags = _.chain(_.times(2)).map(function(n) {
      return (
        <li>{`feature-tag-${n}`}</li>
      )
    })

    return (
      <div className="col-md-12 section ticket__detail">
        <div className="col-md-9 info">
          <div className="col-md-1 no-gutter collapse-gutters">
            <div className="col-md-12 type">
              Story
            </div>
            <div className="col-md-12 id">
              #91
            </div>
          </div>
          <div className="col-md-11">
            <div className="col-md-12 title">
              <span className="who">As an</span> accountant I want a QuickBooks integration so that I am more productive
            </div>
            <div className="col-md-12 meta">
              <div className="col-md-6 tags no-gutter">
                <ul>
                  <li>
                    <span className="glyphicon glyphicon-tag"></span>
                  </li>
                  {tags}
                </ul>
              </div>
              <div className="col-md-6 timestamp">
                Created by Sasha Genet 1 day ago
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 ticket-actions collapse-gutters">
          <div className="col-md-12 ticket-state">
            <div className="col-md-4">
              <div className="col-md-12 title">
                Progress
              </div>
              <div className="col-md-12 value">
                Current
              </div>
            </div>
            <div className="col-md-4">
              <div className="col-md-12 title">
                Owner
              </div>
              <div className="col-md-12 value">
                <Gravatar email={"srogers@quickleft.com"} size={36} />
              </div>
            </div>
            <div className="col-md-4">
              <div className="col-md-12 title">
                Size
              </div>
              <div className="col-md-12 value">
                <button className="estimator__button story">2</button>
              </div>
            </div>
          </div>
          <div className="col-md-12 control">
            <Select placeholder={"Choose owner"}
                    name="form-field-name"
                    className="assign-dropdown"
                    disabled={false}
                    value={"Update to ticket owner"}
                    options={members}
                    onChange={this.setAssignedTo}
                    clearable={true} />
          </div>
        </div>
      </div>
    )
  },

  setDescription(ev, value) {
    console.log('Description value: ', value);
  },

  ticketDescription() {
    let mentions = helpers.formatMentionMembers(this.props.members);

    return (
      <div className="col-md-12 section">
        <div className="col-md-9">
          {this.header('description')}
          <MentionsInput
            value={"Use ticket model description data"}
            onChange={this.setDescription}
            placeholder="Add a description...">
              <Mention data={mentions} />
          </MentionsInput>
        </div>
        <div className="col-md-3 followers">
          {this.header('followers')}
          <ul>
            <div className="col-md-4">
              <li><Gravatar email={"srogers@quickleft.com"} size={36} /></li>
            </div>
            <div className="col-md-4">
              <li><Gravatar email={"srogers@quickleft.com"} size={36} /></li>
            </div>
            <div className="col-md-4">
              <li><Gravatar email={"srogers@quickleft.com"} size={36} /></li>
            </div>
          </ul>
          <button className="detail-button kanban-button-secondary">Follow</button>
        </div>
      </div>
    )
  },

  attachments() {
    return (
      <div className="col-md-12 section">
        <Accordion>
          <Panel header='Attachments' eventKey='1'>
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
          </Panel>
        </Accordion>
      </div>
    )
  },

  createSubItem() {
    console.log('create the sub item');
  },

  subItems() {
    return (
      <div className="col-md-12 section">
        <Accordion>
          <Panel header='SubItem-1' eventKey='1'>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
              </div>
              <div className="col-md-4">
                <a className="btn btn-primary">View Full Ticket</a>
              </div>
            </div>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
                Tags
              </div>
              <div className="col-md-4">
                timestamp
              </div>
            </div>
          </Panel>
        </Accordion>
        <Accordion>
          <Panel header='SubItem-2' eventKey='2'>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
              </div>
              <div className="col-md-4">
                <a className="btn btn-primary">View Full Ticket</a>
              </div>
            </div>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
                Tags
              </div>
              <div className="col-md-4">
                timestamp
              </div>
            </div>
          </Panel>
        </Accordion>
        <Accordion>
          <Panel header='SubItem-3' eventKey='3'>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
              </div>
              <div className="col-md-4">
                <a className="btn btn-primary">View Full Ticket</a>
              </div>
            </div>
            <div className="col-md-12">
              <div className="col-md-2">
              </div>
              <div className="col-md-6">
                Tags
              </div>
              <div className="col-md-4">
                timestamp
              </div>
            </div>
          </Panel>
        </Accordion>
        <form className="item-card__add-subitem" onSubmit={this.createSubItem}>
          <input ref="addItemInput" type="text" placeholder={"Add new sub-task"} className="form-control" />
          <button className="btn btn-default">+</button>
        </form>
      </div>
    )
  },

  header(title) {
    var titleCased = helpers.toTitleCase(title);

    return (
      <div className="header">
        <div className="title">{titleCased}</div>
        <div className="sep"></div>
      </div>
    )
  },

  comments() {
    let placeholder = "Use '@' to mention another Sprintly user.  Use #[item number] (e.g. #1234) to reference another Sprintly item.";

    return (
      <div className="col-md-12 section">
        {this.header('comment')}
        <div className="comment-container">
          <textarea placeholder={placeholder} name="comment-textarea">Write something here</textarea>
          <div className="instructions">
            <div className="upload">Drag and drop or click here to attach files</div>
            <div className="syntax">Use Markdown & Emoji</div>
          </div>
        </div>
        <a className="btn btn-primary">Comment</a>
      </div>
    )
  },

  activity() {
    let activityItems = _.chain(_.times(5)).map(function(n){
      return (
        <li>{n}</li>
      )
    }).value();

    return (
      <div className="col-md-12 section">
        {activityItems}
      </div>
    )
  },

  render() {
    if (!this.state.item.number) {
      return <div/>;
    }

    // <ItemCard
    //   item={this.state.item}
    //   members={this.props.members}
    //   productId={this.props.product.id}
    //   sortField='priority'
    //   showDetails={true}
    // />
    // {this.renderDescription()}

    return (
      <div className="container-fluid item-detail no-gutter">
        <div className="stripe">
          <Link to="product" params={{ id: this.getParams().id }} className="item-detail__close">
            <span aria-hidden="true" className="glyphicon glyphicon-menu-right"/>
          </Link>
          <div className={"story"}>
          </div>
        </div>
        <div className="content">
            {this.ticketDetail()}
            {this.ticketDescription()}
            {this.attachments()}
            {this.subItems()}
            {this.comments()}
            {this.activity()}
        </div>
      </div>
    )
  }
});

export default ItemDetail;
