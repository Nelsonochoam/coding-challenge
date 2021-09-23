"use strict";
const { Heap } = require("heap-js");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const drained = {};
  let sourcesWithLogs = logSources.length;
  const priorityQueue = new Heap(([logA], [logB]) => logA.date - logB.date);

  while (sourcesWithLogs) {
    // 1) Fill the min heap with a log from each source
    for (let i = 0; i < logSources.length; i++) {
      const source = logSources[i];

      if (source.drained && !drained[i]) {
        drained[i] = true;
        sourcesWithLogs--;
      } else {
        priorityQueue.push([source.pop(), i]);
      }
    }

    // 2) Print the items from different sources in chronological order
    let currentMin = priorityQueue.poll();

    while (!priorityQueue.isEmpty()) {
      const [log, index] = currentMin;
      const [nextLog] = priorityQueue.peek();

      // In case you are at the last heap element and ther is no
      // next log
      if (!nextLog && log) {
        printer.print(log);
        break;
      }

      let current = log;
      while (current.date < nextLog.date) {
        printer.print(current);
        current = logSources[index].pop();
      }

      // At this point we break but current is going to be
      // greater than the nextLog.date (Queue it again and it will come after)
      if (current && current.date > nextLog.date) {
        priorityQueue.push([current, index]);
      }

      currentMin = priorityQueue.poll();
    }
  }

  printer.done();

  return console.log("Sync sort complete.");
};
