export default [
  {
    type: 'checkbox',
    label: 'Type',
    active: false,
    alwaysVisible: true,
    field: 'type',
    criteria: ['story', 'task', 'defect', 'test'],
    criteriaOptions: [
      { field: 'story', label: 'Story', default: true },
      { field: 'task', label: 'Task', default: true },
      { field: 'defect', label: 'Defect', default: true},
      { field: 'test', label: 'Test', default: true }
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
      { field: 'unassigned', value: 'unassigned', label: 'Unassigned', default: false }
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
