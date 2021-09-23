"use strict";
const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

const moreLogs = (sources) => {
  const logs = sources.map((source) =>
    source.drained ? undefined : { log: source.pop(), source }
  );
  return logs.filter((entry) => !!entry);
};

const _queueMoreLogs = (sources, heap) => () => {
  const logs = moreLogs(sources);
  heap.addAll(logs);
};

const _drainSourceUnitl = (heap, printer) => (entry, nextEntry) => {
  let log = entry.log;
  const cond = nextEntry
    ? () => log.date < nextEntry?.log?.date
    : () => Boolean(log);

  while (cond()) {
    printer.print(log);
    log = entry.source.pop();
  }

  if (log) {
    heap.push({ log, source: entry.source });
  }
};

module.exports = (logSources, printer) => {
  const heap = new Heap((entryA, entryB) => entryA.log.date - entryB.log.date);
  const queueMoreLogs = _queueMoreLogs(logSources, heap);
  const drainSourceUntil = _drainSourceUnitl(heap, printer);

  // Initialize the queue
  queueMoreLogs();
  let entry;

  while (!heap.isEmpty()) {
    entry = heap.poll();
    const nextEntry = heap.peek();
    queueMoreLogs();
    drainSourceUntil(entry, nextEntry);
  }

  printer.done();
  return console.log("Sync sort complete.");
};
