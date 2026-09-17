'use strict';
let modulePromise;
const load = () => (modulePromise ??= import('./index.js'));

exports.getBlurScore = (...args) => load().then((module) => module.getBlurScore(...args));
exports.isBlurry = (...args) => load().then((module) => module.isBlurry(...args));
