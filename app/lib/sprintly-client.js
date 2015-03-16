import {createClient} from 'sprintly-data';

if (!window.__token && process.env.NODE_ENV !== 'test') {
  throw new Error('Host environment missing token');
}

export default createClient({ token: window.__token });
