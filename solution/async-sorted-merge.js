"use strict";
const { Heap } = require("heap-js");

// Print all entries, across all of the *async* sources, in chronological order.

// Pulls logs from every source once
const moreLogs = async (sources) => {
  const promises = sources.map((source) =>
    source.drained ? Promise.resolve() : source.popAsync()
  );
  const logs = await Promise.all(promises);
  return logs.filter((log) => !!log);
};

const _queueMoreLogs = (sources, heap) => async () => {
  const logs = await moreLogs(sources);
  heap.addAll(logs);
};

module.exports = async (logSources, printer) => {
  const heap = new Heap((logA, logB) => logA.date - logB.date);
  const queueMoreLogs = _queueMoreLogs(logSources, heap);

  // Initialize the queue
  await queueMoreLogs();
  let current = heap.poll();

  while (!heap.isEmpty()) {
    const nextLog = heap.peek();

    if (current.date < nextLog.date) {
      await queueMoreLogs();
    }

    printer.print(current);

    current = heap.poll();
  }

  printer.done();
  console.log("Async sort complete.");
};
