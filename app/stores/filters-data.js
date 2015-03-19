export default [
  {
    type: 'checkbox',
    label: 'Type',
    active: false,
    alwaysVisible: true,
    field: 'type',
    criteria: [],
    criteriaOptions: [
      { field: 'story', label: 'Story', default: true },
      { field: 'task', label: 'Task', default: true },
      { field: 'defect', label: 'Defect', default: true},
      { field: 'test', label: 'Test', default: true }
    ]
  },
  {
    type: 'checkbox',
    label: 'Estimate',
    active: false,
    alwaysVisible: true,
    defaultCriterLabel: 'All',
    field: 'estimate',
    criteria: [],
    criteriaOptions: [
      { field: '~', label: 'Unestimated', default: true },
      { field: 's', label: 'Small', default: true },
      { field: 'm', label: 'Medium', default: true },
      { field: 'l', label: 'Large', default: true },
      { field: 'xl', label: 'Extra Large', default: true }
    ]
  },
  {
    type: 'tags',
    label: 'Tagged with',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'tags',
    criteria: '',
    criteriaOptions: []
  },
  {
    type: 'members',
    label: 'Assigned to',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'assigned_to',
    criteria: '',
    criteriaOptions: [
      { field: 'unassigned', value: '', label: 'Unassigned', default: false }
    ]
  },
  {
    type: 'members',
    label: 'Created by',
    active: false,
    alwaysVisible: false,
    defaultCriteriaLabel: 'None',
    field: 'created_by',
    criteria: '',
    criteriaOptions: []
  }
];
