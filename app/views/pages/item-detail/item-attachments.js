import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import ItemHeader from './item-header';
import {State} from 'react-router'
import Slick from 'react-slick';
import classNames from "classnames";

const CarouselSettings = {
  dots: false,
  draggable: false,
  infinite: true,
  slidesToShow: 3,
  speed: 500,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3
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

let ItemAttachments = React.createClass({

  mixins: [State, ItemDetailMixin],

  getInitialState() {
    return {
      panelOpen: false
    }
  },

  propTypes() {
    attachments: React.PropTypes.shape({
      _href: React.PropTypes.string,
      created_at: React.PropTypes.string,
      created_by: React.PropsTypes.shape({
        account: React.PropTypes.object,
        created_at: React.PropTypes.string,
        email: React.PropTypes.string,
        first_name: React.PropTypes.string,
        id: React.PropTypes.number,
        last_login: React.PropTypes.string,
        last_name: React.PropTypes.string
      }),
      href: React.PropTypes.string,
      id: React.PropTypes.number,
      item: React.PropTypes.object,
      name: React.PropTypes.string
    })
  },

  togglePanel() {
    this.setState({panelOpen: !this.state.panelOpen});
  },

  counts() {
    let counts = [];
    let imageCount = this.images().length;
    let fileCount = this.files().length;

    if (!imageCount && !fileCount) {
      counts.push(<li key="no-attachment">No Attachments</li>)
    }

    if (imageCount) {
      counts.push(<li key="count__images">Images: {imageCount}</li>)
    }
    if (fileCount) {
      counts.push(<li key="count__files">Files: {fileCount}</li>);
    }

    return counts;
  },

  attachmentsHeader() {
    let counts = this.counts();
    let headerClasses = classNames({
      'header-dark': true,
      'open': this.state.panelOpen
    });
    let toggleClasses = classNames({
      'toggle': true,
      'transparent': !this.props.attachments.length
    })
    let caretClasses = `glyphicon glyphicon-menu-${this.caretState()}`;

    return (
      <div className={headerClasses}>
        <a className={toggleClasses} onClick={this.togglePanel}>
          <span aria-hidden="true" className={caretClasses}/>
        </a>
        <div className="sep-vertical"></div>
        <div className="title">Attachments</div>
        <ul className="attachments__info-list">{counts}</ul>
      </div>
    )
  },

  attachmentsViewer(images) {
    let images = this.images();
    if (images && images.length) {
      let styles = { 'height': '170px' };
      let attachments = _.map(this.props.attachments, (attachment, i) => {
                          // Carousel didnt function correctly with a ReactSubcomponent
                          return (
                            <div key={i} className="attachment__slide">
                              <img className="image" style={styles} src={attachment.href}></img>
                              <button onClick={_.partial(this.showAttachment,attachment.href)} className="btn btn-primary preview">{`View Image ${i+1}`}</button>
                            </div>
                          )
                        });

      return (
        <Slick className="attachments__carousel" {...CarouselSettings}>
          {attachments}
        </Slick>
      );
    }
  },

  showAttachment(src, ev) {
    window.open(src);
  },

  caretState() {
    return this.state.panelOpen ? 'down' : 'right'
  },

  fileList() {
    let files = this.files();

    if (files && files.length) {
      return _.map(files, (file, i) => {
        return (
          <li key={i}>
            {this.openNewTabLink(file.href, file.name)}
          </li>
        )
      })
    }
  },

  images() {
    return _.chain(this.props.attachments)
                    .map((attachment) => {
                      if (this.imageFileExt(attachment._href)) {
                        return attachment;
                      }
                    })
                    .compact()
                    .value();
  },

  files() {
    return _.difference(this.props.attachments, this.images());
  },

  attachmentsContent() {
    if (this.props.attachments.length) {
      let attachmentViewer = this.attachmentsViewer();
      let fileList = this.fileList();

      return ([
        <div key="attachments" className="col-xs-9">
          {attachmentViewer}
        </div>,
        <div key="files" className="col-xs-3">
          <ul className="links">
            {fileList}
          </ul>
        </div>
      ])
    }
  },

  imageFileExt(url) {
    return (/\.(gif|jpg|jpeg|tiff|png)/i).test(url);
  },

  render: function() {
    let content = this.attachmentsContent();
    let containerClasses = classNames({
      "section attachments no-gutter": true,
      "col-xs-12 visible-lg-block": this.props.size === 'large',
      "col-xs-12 col-sm-6 visible-md-block visible-sm-block visible-xs-block": this.props.size === 'medium'
    })
    let contentClasses = classNames({
      'content-dark': true,
      'open': this.state.panelOpen
    });

    return (
      <div className={containerClasses}>
        <div className="col-xs-12">
          {this.attachmentsHeader()}
          <div className={contentClasses}>
            <div className="attachments__viewer">
              {content}
            </div>
            <div className="attachments__links">
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default ItemAttachments;
