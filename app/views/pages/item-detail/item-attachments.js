import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State} from 'react-router'

const CarouselSettings = {
  dots: false,
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
        infinite: true
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

var ItemAttachments = React.createClass({

  mixins: [State, ItemDetailMixin],

  getInitialState() {
    return {
      panelOpen: false
    }
  },

  propTypes() {
    attachments: React.PropTypes.array
  },

  togglePanel() {
    this.setState({panelOpen: !this.state.panelOpen});
  },

  counts(imageCount, fileCount) {
    let counts = [];

    if (!imageCount && !fileCount) {
      counts.push(<li>No Attachments</li>)
    }

    if (imageCount) {
      counts.push(<li>Images: {imageCount}</li>)
    }
    if (fileCount) {
      counts.push(<li>Files: {fileCount}</li>);
    }

    return counts;
  },

  attachmentsHeader(imagesCount, filesCount) {
    let counts = this.counts(imagesCount, filesCount);
    let headerClasses = React.addons.classSet({
      'header': true,
      'open': this.state.panelOpen
    });
    let toggleClasses = React.addons.classSet({
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

  attachmentsViewer() {
    if (this.props.attachments) {
      var attachments = _.map(this.images(), (image, i) => {
                          // Temp Greyscale before authed asset use
                          var styles = {
                            width: '33%',
                            height: '170px',
                            'background-color': `RGBA(69,69,69, ${parseFloat((Math.random() * (0.120 - 0.0200) + 0.0200))})`,
                          }
                          // background: `url(${image.meta.permalink}) no-repeat`

                          return (
                            <div className="attachment-slide" key={i} style={styles} onClick={this.showAttachment}></div>
                          );
                        });

      return (
        <Slick {...CarouselSettings}>
          {attachments}
        </Slick>
      );
    }
  },

  showAttachment() {
    console.log('Implement attachment viewer: ');
  },

  caretState() {
    return this.state.panelOpen ? 'down' : 'right'
  },

  fileList(files) {
    if (files) {
      return _.map(files, function(file, i) {
        return (
          <li key={i}>
            <a className="attachment-link">{file.meta.title}</a>
          </li>
        )
      })
    } else {
      return (<li><a className="attachment-link">No files attached</a></li>)
    }
  },

  images() {
    return _.chain(this.props.attachments)
                    .map((attachment) => {
                      if (this.imageFileExt(attachment.meta.url)) {
                        return attachment;
                      }
                    })
                    .compact()
                    .value();
  },

  imageFileExt(url) {
    return (/\.(gif|jpg|jpeg|tiff|png)$/i).test(url);
  },

  render: function() {
    console.log('ATTACHMENTS');

    // let attachmentViewer = this.attachmentsViewer();;
    // {attachmentViewer}

    let images = this.images();
    let files = _.difference(this.props.attachments, images);
    let fileList = this.fileList(files);
    let header = this.attachmentsHeader(images.length, files.length);
    let contentClasses = React.addons.classSet({
      'content': true,
      'open': this.state.panelOpen
    });

    return (
      <div className="col-md-12 section attachments">
        <div className="col-md-12">
          {header}
          <div className={contentClasses}>
            <div className="col-md-12 attachments__internals">
              <div className="col-md-9">
                <div className="title">
                  Images: {images.length}
                </div>
                <div className="attachments-viewer">
                </div>
              </div>
              <div className="attachments__links">
                <div className="title">
                  Files: {files.length}
                </div>
                <div className="sep"></div>
                <ul className="links">
                  {fileList}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

});

export default ItemAttachments;
