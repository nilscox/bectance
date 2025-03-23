/* @refresh reload */
import 'solid-devtools';

import { render } from 'solid-js/web';

import { App } from './app';

import './index.css';

render(() => <App />, document.getElementById('root') as HTMLElement);
