import _ from 'lodash';
import React from 'react/addons';
import MembersFilter from './forms/members-filter';
import CheckboxFilter from './forms/checkbox-filter';
import TagsFilter from './forms/tags-filter';

var FiltersMenu = React.createClass({

  getInitialState: function() {
    return {
      showPopup: false,
      visibleFilters: []
    }
  },

  propTypes: {
    members: React.PropTypes.array.isRequired,
    allFilters: React.PropTypes.array.isRequired,
    updateFilters: React.PropTypes.func.isRequired
  },

  toggleFiltersMenu: function() {
    this.setState({ showPopup: !this.state.showPopup });
  },

  toggleVisible: function(filter) {
    let visibleFilters = _.clone(this.state.visibleFilters);
    if (_.contains(visibleFilters, filter)) {
      this.setState({ visibleFilters: _.without(visibleFilters, filter) })
    } else {
      visibleFilters.push(filter);
      this.setState({ visibleFilters });
    }
  },

  renderForm: function(filter) {
    var form;
    var formProps = {
      name: filter.field,
      updateFilters: this.props.updateFilters,
      options: filter.criteriaOptions,
      criteria: filter.criteria,
      visible: true
    };
    switch (filter.type) {
      case 'members':
        form = <MembersFilter {...formProps} members={this.props.members}/>
        break;
      case 'checkbox':
        form = <CheckboxFilter {...formProps} />
        break;
      case 'tags':
        form = <TagsFilter {...formProps} />
        break;
      default:
        form = '';
        break;
    }
    return form;
  },

  render: function() {
    var classes = React.addons.classSet({
      'col-sm-2': true,
      'filters-menu': true,
      'show-popup': this.state.showPopup
    })
    return (
      <div className={classes}>
        <button className="btn btn-default filters-menu__button" onClick={this.toggleFiltersMenu}>Add Filter</button>
        <div className="col-sm-12 filters-menu__popup">
          <div className="filters-menu__scroll-wrapper">
            <ul className="filters-menu__list">
            {_.map(this.props.allFilters, function(filter) {
              var classes = React.addons.classSet({
                'show-form': _.contains(this.state.visibleFilters, filter.field)
              });
              return (
                <li className={classes}>
                  <h3 onClick={_.partial(this.toggleVisible, filter.field)}>{filter.label}</h3>
                  {this.renderForm(filter)}
                </li>
              );
            }, this)}
            </ul>
          </div>
        </div>
      </div>
    )
  }
});

export default FiltersMenu;

