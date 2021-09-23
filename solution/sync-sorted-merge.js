"use strict";
const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

const moreLogs = (sources) => {
  const logs = sources.map((source) =>
    source.drained ? undefined : source.pop()
  );
  return logs.filter((log) => !!log);
};

const _queueMoreLogs = (sources, queue) => () => {
  const logs = moreLogs(sources);
  queue.addAll(logs);
};

module.exports = (logSources, printer) => {
  const queue = new Heap((logA, logB) => logA.date - logB.date);
  const queueMoreLogs = _queueMoreLogs(logSources, queue);

  // Initialize the queue
  queueMoreLogs();
  let current = queue.poll();

  while (!queue.isEmpty()) {
    const nextLog = queue.peek();

    if (current.date < nextLog.date) {
      queueMoreLogs();
    }

    printer.print(current);
    current = queue.poll();
  }

  printer.done();
  return console.log("Sync sort complete.");
};
