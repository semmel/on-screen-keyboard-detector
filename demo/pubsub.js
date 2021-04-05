/**
 * on-screen-keyboard-detector: pubsub.js
 *
 * Created by Matthias Seemann on 5.04.2021.
 */
import  {subscribe} from '../src/osk-detector.js';
import Emitter from './emittery.mjs';

const
	emitter = new Emitter(),
	outBox = document.querySelector('.outbox');

subscribe(visibility => emitter.emit(visibility));

emitter.on('hidden', () => outBox.textContent += "hidden\n");
emitter.on('visible', () => outBox.textContent += "visible\n");
