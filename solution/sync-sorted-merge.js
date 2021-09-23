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

  // NOTE: I know here instead of pulling from every source (every loop)
  // I could have peeked the next element on the heap and keep poping that source
  // until it becomes greater than then next item on the min heap.
  // That would have been way better for memory than this. I just didn't
  // have the time to do it.
  
  while (!heap.isEmpty()) {
    queueMoreLogs();
    printer.print(current);
    current = heap.poll();
  }

  printer.done();
  return console.log("Sync sort complete.");
};
