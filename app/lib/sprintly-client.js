import {createClient} from 'sprintly-data';

if (!window.__token) {
  throw new Error('Host environment missing token');
}

export default createClient({ token: window.__token });
