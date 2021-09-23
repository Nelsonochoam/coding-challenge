"use strict";
const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

const moreLogs = (sources) => {
  const logs = sources.map((source) =>
    source.drained ? undefined : source.pop()
  );
  return logs.filter((log) => !!log);
};

const _queueMoreLogs = (sources, heap) => () => {
  const logs = moreLogs(sources);
  heap.addAll(logs);
};

module.exports = (logSources, printer) => {
  const heap = new Heap((logA, logB) => logA.date - logB.date);
  const queueMoreLogs = _queueMoreLogs(logSources, heap);

  // Initialize the queue
  queueMoreLogs();
  let current = heap.poll();

  while (!heap.isEmpty()) {
    queueMoreLogs();
    printer.print(current);
    current = heap.poll();
  }

  printer.done();
  return console.log("Sync sort complete.");
};
