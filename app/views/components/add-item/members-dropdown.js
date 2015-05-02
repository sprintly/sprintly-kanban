import _ from 'lodash';
import React from 'react/addons';
import {SelectorMenu} from 'sprintly-ui';

let MembersDropdown = React.createClass({

  propTypes: {
    members: React.PropTypes.array,
    assigned_to: React.PropTypes.any,
    onChange: React.PropTypes.func.isRequired
  },

  render() {
    let active = _.findWhere(this.props.members, { id: this.props.assigned_to });
    let selection = 'Unassigned';
    let members = _.map(this.props.members, function(member) {
      let title = `${member.first_name} ${member.last_name.slice(0,1)}.`;
      return {
        title,
        id: member.id
      }
    });

    members = _.sortBy(members, 'title');

    if (active) {
      selection = `${active.first_name} ${active.last_name.slice(0,1)}.`;
      members.unshift({ title: 'Unassigned', id: '' });
    }

    return (
      <div className="form-group selector members-dropdown">
        <SelectorMenu
          optionslist={members}
          selection={selection}
          onSelectionChange={(title) => {
            this.onChange(_.findWhere(members, { title }).id);
          }}
        />
      </div>
    );
  }

});

export default MembersDropdown;
