import client from './lib/sprintly-client';
import router from './router';
import React from 'react';

// Enable React dev tools
window.React = React;
window.manifold = router(client);
