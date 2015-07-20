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
import Slick from 'react-slick';

var ItemDetail = React.createClass({

  mixins: [State],

  getInitialState() {
    return {
      item: {},
      attachments: false,
      subitems: [
        true
      ]
    };
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

  buildTags() {
    return _.chain(_.times(2)).map(function(n) {
      return (
        <li>{`feature-tag-${n}`}</li>
      )
    })
  },

  ticketDetail() {
    let members = helpers.formatSelectMembers(this.props.members);

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
                  {this.buildTags()}
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

  toggleAttachments() {
    this.setState({attachments: !this.state.attachments});
  },

  showAttachment() {
    console.log('Implement attachment viewer: ');
  },

  attachmentsViewer() {
    var attachments = _.chain(_.times(4))
                            .map((i) => {
                              var styles = {
                                width: '33%',
                                height: '170px',
                                'background-color': `RGBA(69, 69, 69, ${1-(0.15*(i+1))})`,
                              }

                              return (
                                <div className="attachment-slide" key={i} style={styles} onClick={this.showAttachment}></div>
                              );
                            }).value();

    var settings = {
      dots: true,
      infinite: true,
      slidesToShow: 3,
      speed: 500,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    return (
      <Slick {...settings}>
        {attachments}
      </Slick>
    );
  },

  openAttachments(ev, value) {
    ev.preventDefault();
    console.log('openAttachments: ', value);
  },

  attachments() {
    var contentClasses = React.addons.classSet({
      'content': true,
      'open': this.state.attachments
    })

    var attachmentLinks = _.chain(_.times(10))
                          .map(function(i) {
                            return (
                              <li>
                                <a className="attachment-link">{`customer-req-doc-${i}`}</a>
                              </li>
                            )
                          }).value();

    return (
      <div className="col-md-12 attachments">
        <div className="header">
          <a className="toggle" onClick={this.toggleAttachments}>
            <span aria-hidden="true" className="glyphicon glyphicon-menu-right"/>
          </a>
          <div className="sep-vertical"></div>
          <div className="title">Attachments</div>
        </div>
        <div className={contentClasses}>
          <div className="col-md-12">
            <div className="col-md-9">
              <div className="title">
                Attachments: #TBD
              </div>
              <div className="attachments-viewer">
                {this.attachmentsViewer()}
              </div>
            </div>
            <div className="col-md-3">
              <div className="title">
                Links: {attachmentLinks.length}
              </div>
              <div className="sep"></div>
              <ul className="links">
                {attachmentLinks}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  },

  createSubItem() {
    console.log('create the sub item');
  },

  toggleSubItem(index, ev) {
    var subitems = _.clone(this.state.subitems);

    subitems[index] = !this.state.subitems[index];

    this.setState({subitems: subitems})
  },

  subItems() {
    var mockItems = [
      {
        id: '1234',
        title: 'Swap radio buttons for checkboxes',
        status: 'current',
        assignee: 'srogers@quickleft.com',
        score: 'S',
        description: "Swap out existing radio buttons for a React component.\nhttp://react-components.com/component/react-radio-group\nEnsure selections are bubbled up through the flux arch and represented in the view state"
      }
    ]

    var subItems = _.map(mockItems, (item, i) => {
      var contentClasses = React.addons.classSet({
        'content': true,
        'open': this.state.subitems[i]
      })

      return (
        <div className="subitem">
          <div className="header">
            <a className="toggle" onClick={_.partial(this.toggleSubItem, i)}>
              <span aria-hidden="true" className="glyphicon glyphicon-menu-right"/>
            </a>
            <div className="sep-vertical"></div>
            <div className="title">Swap radio buttons for checkboxes</div>
            <div className="col-md-4 state">
              <ul>
                <li><div className="meta status">Current</div></li>
                <li><div className="meta id">#2834</div></li>
                <li><div className="meta"><Gravatar email={"srogers@quickleft.com"} size={36} /></div></li>
                <li><div className="meta"><button className="estimator__button story">2</button></div></li>
              </ul>
            </div>
          </div>
          <div className={contentClasses}>
            <div className="col-md-12">
              <div className="col-md-12 collapse-right">
                <div className="col-md-9 description">
                  Swap out existing radio buttons for a React component.

                  http://react-components.com/component/react-radio-group. Ensure selections are bubbled up through the flux arch and represented in the view state
                </div>
                <div className="col-md-3 collapse-right">
                  <button className="detail-button kanban-button-secondary">View Full Ticket</button>
                </div>
              </div>
              <div className="col-md-12 meta collapse-right">
                <div className="col-md-6 tags no-gutter">
                  <ul>
                    <li>
                      <span className="glyphicon glyphicon-tag"></span>
                    </li>
                    {this.buildTags()}
                  </ul>
                </div>
                <div className="col-md-6 timestamp no-gutter">
                  Created by Sasha Genet 1 day ago
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div className="col-md-12 section">
        <div className="col-md-12">
          {this.header('sub-items')}
        </div>
        <div className="col-md-12">
          {subItems}
        </div>
        <div className="col-md-12 add-subitem">
          <form className="item-card__add-subitem" onSubmit={this.createSubItem}>
            <input ref="addItemInput" type="text" placeholder={"Add new sub-task"} className="form-control" />
            <button className="btn btn-default">+</button>
          </form>
        </div>
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

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    ItemActions.fetchItem(this.getParams().id, this.getParams().number);

    console.log('Setup the subitem visibility state based on item.subitems');
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

    // {this.comments()}
    // {this.activity()}
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
        </div>
      </div>
    )
  },

  _onChange() {
    let item = ProductStore.getItem(this.getParams().id, this.getParams().number);
    if (item) {
      this.setState({
        item
      });
    }
  }
});

export default ItemDetail;
