function manage(cmd) {
  return fetch(`http://localhost:4001/${cmd}`, { method: 'POST' });
}

function start() {
  return manage('start');
}

function stop() {
  return manage('stop');
}

function reset() {
  return manage('reset');
}

module.exports = {
  start,
  stop,
  reset
};
