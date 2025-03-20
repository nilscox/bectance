/* @refresh reload */
import { hydrate } from 'solid-js/web';

import { App } from './client/app';
import './index.css';

hydrate(() => <App />, document.getElementById('root'));
