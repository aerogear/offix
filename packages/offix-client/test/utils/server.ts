function manage(cmd: string) {
  return fetch(`http://localhost:4001/${cmd}`, { method: "POST" });
}

function start() {
  return manage("start");
}

function stop() {
  return manage("stop");
}

function reset() {
  return manage("reset");
}

export default {
  start,
  stop,
  reset
};
