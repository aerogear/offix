function manage(cmd) {
  return fetch(`http://localhost:4001/${cmd}`, { method: 'POST' });
}

function start() {
  return manage('start');
}

function stop() {
  return manage('stop');
}

module.exports = {
  start,
  stop
};
