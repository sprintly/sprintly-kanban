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
  speed: 750
};

let ItemAttachments = React.createClass({

  mixins: [State, ItemDetailMixin],

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
      'open': this.props.open
    });
    let toggleClasses = classNames({
      'toggle': true,
      'transparent': !this.props.attachments.length
    })
    let caretClasses = `glyphicon glyphicon-menu-${this.caretState()}`;

    return (
      <div className={headerClasses}>
        <a className={toggleClasses} onClick={this.props.toggle}>
          <span aria-hidden="true" className={caretClasses}/>
        </a>
        <div className="sep-vertical"></div>
        <div className="title">Attachments</div>
        <ul className="attachments__info-list">{counts}</ul>
      </div>
    )
  },

  imageViewer(images) {
    let images = this.images();
    if (images && images.length) {
      let styles = { 'height': '170px' };
      let imageSlides = _.map(images, (image, i) => {
                          // Carousel didnt function correctly with a ReactSubcomponent

                          return (
                            <div key={i} className="attachment__slide">
                              <img className="image" style={styles} src={image.href}></img>
                              <button onClick={_.partial(this.showAttachment,image.href)} className="btn btn-primary preview">{`View Image ${i+1}`}</button>
                            </div>
                          )
                        });

      return (
        <Slick className="attachments__carousel" {...CarouselSettings}>
          {imageSlides}
        </Slick>
      );
    }
  },

  showAttachment(src, ev) {
    window.open(src);
  },

  caretState() {
    return this.props.open ? 'down' : 'right';
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
    } else {
      return <li className="action__restricted">{`No files attached`}</li>
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
      let imageViewer = this.imageViewer();
      let fileList = this.fileList();
      let fileCount = fileList.length || 0;

      return ([
        <div key="attachments" className="col-xs-9">
          {imageViewer}
        </div>,
        <div key="files" className="col-xs-3">
          <div className="title">Files: {fileCount}</div>
          <div className="sep"></div>
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
      'open': this.props.open
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
