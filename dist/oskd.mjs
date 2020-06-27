/* @license
	On-screen keyboard detector (OSKD) v.2.0.0
	(c) 2020-2020 Matthias Seemann
	OSKD may be freely distributed under the MIT license.
*/
/** @license MIT License (c) copyright 2010-2016 original author or authors */

// append :: a -> [a] -> [a]
// a with x appended
function append(x, a) {
  var l = a.length;
  var b = new Array(l + 1);
  for (var i = 0; i < l; ++i) {
    b[i] = a[i];
  }

  b[l] = x;
  return b;
}

// reduce :: (a -> b -> a) -> a -> [b] -> a
// accumulate via left-fold
function reduce(f, z, a) {
  var r = z;
  for (var i = 0, l = a.length; i < l; ++i) {
    r = f(r, a[i], i);
  }
  return r;
}

// remove :: Int -> [a] -> [a]
// remove element at index
function remove(i, a) {
  // eslint-disable-line complexity
  if (i < 0) {
    throw new TypeError('i must be >= 0');
  }

  var l = a.length;
  if (l === 0 || i >= l) {
    // exit early if index beyond end of array
    return a;
  }

  if (l === 1) {
    // exit early if index in bounds and length === 1
    return [];
  }

  return unsafeRemove(i, a, l - 1);
}

// unsafeRemove :: Int -> [a] -> Int -> [a]
// Internal helper to remove element at index
function unsafeRemove(i, a, l) {
  var b = new Array(l);
  var j = void 0;
  for (j = 0; j < i; ++j) {
    b[j] = a[j];
  }
  for (j = i; j < l; ++j) {
    b[j] = a[j + 1];
  }

  return b;
}

// removeAll :: (a -> boolean) -> [a] -> [a]
// remove all elements matching a predicate
// @deprecated
function removeAll(f, a) {
  var l = a.length;
  var b = new Array(l);
  var j = 0;
  for (var x, i = 0; i < l; ++i) {
    x = a[i];
    if (!f(x)) {
      b[j] = x;
      ++j;
    }
  }

  b.length = j;
  return b;
}

// findIndex :: a -> [a] -> Int
// find index of x in a, from the left
function findIndex(x, a) {
  for (var i = 0, l = a.length; i < l; ++i) {
    if (x === a[i]) {
      return i;
    }
  }
  return -1;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */

// id :: a -> a
var id = function id(x) {
  return x;
};

// compose :: (b -> c) -> (a -> b) -> (a -> c)
var compose = function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
};

// curry2 :: ((a, b) -> c) -> (a -> b -> c)
function curry2(f) {
  function curried(a, b) {
    switch (arguments.length) {
      case 0:
        return curried;
      case 1:
        return function (b) {
          return f(a, b);
        };
      default:
        return f(a, b);
    }
  }
  return curried;
}

// curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
function curry3(f) {
  function curried(a, b, c) {
    // eslint-disable-line complexity
    switch (arguments.length) {
      case 0:
        return curried;
      case 1:
        return curry2(function (b, c) {
          return f(a, b, c);
        });
      case 2:
        return function (c) {
          return f(a, b, c);
        };
      default:
        return f(a, b, c);
    }
  }
  return curried;
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var ScheduledTask = /*#__PURE__*/function () {
  function ScheduledTask(time, localOffset, period, task, scheduler) {
    classCallCheck(this, ScheduledTask);

    this.time = time;
    this.localOffset = localOffset;
    this.period = period;
    this.task = task;
    this.scheduler = scheduler;
    this.active = true;
  }

  ScheduledTask.prototype.run = function run() {
    return this.task.run(this.time - this.localOffset);
  };

  ScheduledTask.prototype.error = function error(e) {
    return this.task.error(this.time - this.localOffset, e);
  };

  ScheduledTask.prototype.dispose = function dispose() {
    this.active = false;
    this.scheduler.cancel(this);
    return this.task.dispose();
  };

  return ScheduledTask;
}();

var RelativeScheduler = /*#__PURE__*/function () {
  function RelativeScheduler(origin, scheduler) {
    classCallCheck(this, RelativeScheduler);

    this.origin = origin;
    this.scheduler = scheduler;
  }

  RelativeScheduler.prototype.currentTime = function currentTime() {
    return this.scheduler.currentTime() - this.origin;
  };

  RelativeScheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
    return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
  };

  RelativeScheduler.prototype.relative = function relative(origin) {
    return new RelativeScheduler(origin + this.origin, this.scheduler);
  };

  RelativeScheduler.prototype.cancel = function cancel(task) {
    return this.scheduler.cancel(task);
  };

  RelativeScheduler.prototype.cancelAll = function cancelAll(f) {
    return this.scheduler.cancelAll(f);
  };

  return RelativeScheduler;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var defer = function defer(task) {
  return Promise.resolve(task).then(runTask);
};

function runTask(task) {
  try {
    return task.run();
  } catch (e) {
    return task.error(e);
  }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var Scheduler = /*#__PURE__*/function () {
  function Scheduler(timer, timeline) {
    var _this = this;

    classCallCheck(this, Scheduler);

    this.timer = timer;
    this.timeline = timeline;

    this._timer = null;
    this._nextArrival = Infinity;

    this._runReadyTasksBound = function () {
      return _this._runReadyTasks(_this.currentTime());
    };
  }

  Scheduler.prototype.currentTime = function currentTime() {
    return this.timer.now();
  };

  Scheduler.prototype.scheduleTask = function scheduleTask(localOffset, delay, period, task) {
    var time = this.currentTime() + Math.max(0, delay);
    var st = new ScheduledTask(time, localOffset, period, task, this);

    this.timeline.add(st);
    this._scheduleNextRun();
    return st;
  };

  Scheduler.prototype.relative = function relative(offset) {
    return new RelativeScheduler(offset, this);
  };

  Scheduler.prototype.cancel = function cancel(task) {
    task.active = false;
    if (this.timeline.remove(task)) {
      this._reschedule();
    }
  };

  // @deprecated


  Scheduler.prototype.cancelAll = function cancelAll(f) {
    this.timeline.removeAll(f);
    this._reschedule();
  };

  Scheduler.prototype._reschedule = function _reschedule() {
    if (this.timeline.isEmpty()) {
      this._unschedule();
    } else {
      this._scheduleNextRun(this.currentTime());
    }
  };

  Scheduler.prototype._unschedule = function _unschedule() {
    this.timer.clearTimer(this._timer);
    this._timer = null;
  };

  Scheduler.prototype._scheduleNextRun = function _scheduleNextRun() {
    // eslint-disable-line complexity
    if (this.timeline.isEmpty()) {
      return;
    }

    var nextArrival = this.timeline.nextArrival();

    if (this._timer === null) {
      this._scheduleNextArrival(nextArrival);
    } else if (nextArrival < this._nextArrival) {
      this._unschedule();
      this._scheduleNextArrival(nextArrival);
    }
  };

  Scheduler.prototype._scheduleNextArrival = function _scheduleNextArrival(nextArrival) {
    this._nextArrival = nextArrival;
    var delay = Math.max(0, nextArrival - this.currentTime());
    this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
  };

  Scheduler.prototype._runReadyTasks = function _runReadyTasks() {
    this._timer = null;
    this.timeline.runTasks(this.currentTime(), runTask);
    this._scheduleNextRun();
  };

  return Scheduler;
}();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var Timeline = /*#__PURE__*/function () {
  function Timeline() {
    classCallCheck(this, Timeline);

    this.tasks = [];
  }

  Timeline.prototype.nextArrival = function nextArrival() {
    return this.isEmpty() ? Infinity : this.tasks[0].time;
  };

  Timeline.prototype.isEmpty = function isEmpty() {
    return this.tasks.length === 0;
  };

  Timeline.prototype.add = function add(st) {
    insertByTime(st, this.tasks);
  };

  Timeline.prototype.remove = function remove(st) {
    var i = binarySearch(getTime(st), this.tasks);

    if (i >= 0 && i < this.tasks.length) {
      var events = this.tasks[i].events;
      var at = findIndex(st, events);
      if (at >= 0) {
        events.splice(at, 1);
        if (events.length === 0) {
          this.tasks.splice(i, 1);
        }
        return true;
      }
    }

    return false;
  };

  // @deprecated


  Timeline.prototype.removeAll = function removeAll$$1(f) {
    for (var i = 0; i < this.tasks.length; ++i) {
      removeAllFrom(f, this.tasks[i]);
    }
  };

  Timeline.prototype.runTasks = function runTasks(t, runTask) {
    var tasks = this.tasks;
    var l = tasks.length;
    var i = 0;

    while (i < l && tasks[i].time <= t) {
      ++i;
    }

    this.tasks = tasks.slice(i);

    // Run all ready tasks
    for (var j = 0; j < i; ++j) {
      this.tasks = runReadyTasks(runTask, tasks[j].events, this.tasks);
    }
  };

  return Timeline;
}();

function runReadyTasks(runTask, events, tasks) {
  // eslint-disable-line complexity
  for (var i = 0; i < events.length; ++i) {
    var task = events[i];

    if (task.active) {
      runTask(task);

      // Reschedule periodic repeating tasks
      // Check active again, since a task may have canceled itself
      if (task.period >= 0 && task.active) {
        task.time = task.time + task.period;
        insertByTime(task, tasks);
      }
    }
  }

  return tasks;
}

function insertByTime(task, timeslots) {
  var l = timeslots.length;
  var time = getTime(task);

  if (l === 0) {
    timeslots.push(newTimeslot(time, [task]));
    return;
  }

  var i = binarySearch(time, timeslots);

  if (i >= l) {
    timeslots.push(newTimeslot(time, [task]));
  } else {
    insertAtTimeslot(task, timeslots, time, i);
  }
}

function insertAtTimeslot(task, timeslots, time, i) {
  var timeslot = timeslots[i];
  if (time === timeslot.time) {
    addEvent(task, timeslot.events);
  } else {
    timeslots.splice(i, 0, newTimeslot(time, [task]));
  }
}

function addEvent(task, events) {
  if (events.length === 0 || task.time >= events[events.length - 1].time) {
    events.push(task);
  } else {
    spliceEvent(task, events);
  }
}

function spliceEvent(task, events) {
  for (var j = 0; j < events.length; j++) {
    if (task.time < events[j].time) {
      events.splice(j, 0, task);
      break;
    }
  }
}

function getTime(scheduledTask) {
  return Math.floor(scheduledTask.time);
}

// @deprecated
function removeAllFrom(f, timeslot) {
  timeslot.events = removeAll(f, timeslot.events);
}

function binarySearch(t, sortedArray) {
  // eslint-disable-line complexity
  var lo = 0;
  var hi = sortedArray.length;
  var mid = void 0,
      y = void 0;

  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    y = sortedArray[mid];

    if (t === y.time) {
      return mid;
    } else if (t < y.time) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return hi;
}

var newTimeslot = function newTimeslot(t, events) {
  return { time: t, events: events };
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

/* global setTimeout, clearTimeout */

var ClockTimer = /*#__PURE__*/function () {
  function ClockTimer(clock) {
    classCallCheck(this, ClockTimer);

    this._clock = clock;
  }

  ClockTimer.prototype.now = function now() {
    return this._clock.now();
  };

  ClockTimer.prototype.setTimer = function setTimer(f, dt) {
    return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
  };

  ClockTimer.prototype.clearTimer = function clearTimer(t) {
    return t instanceof Asap ? t.cancel() : clearTimeout(t);
  };

  return ClockTimer;
}();

var Asap = /*#__PURE__*/function () {
  function Asap(f) {
    classCallCheck(this, Asap);

    this.f = f;
    this.active = true;
  }

  Asap.prototype.run = function run() {
    return this.active && this.f();
  };

  Asap.prototype.error = function error(e) {
    throw e;
  };

  Asap.prototype.cancel = function cancel() {
    this.active = false;
  };

  return Asap;
}();

function runAsap(f) {
  var task = new Asap(f);
  defer(task);
  return task;
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

/* global performance, process */

var RelativeClock = /*#__PURE__*/function () {
  function RelativeClock(clock, origin) {
    classCallCheck(this, RelativeClock);

    this.origin = origin;
    this.clock = clock;
  }

  RelativeClock.prototype.now = function now() {
    return this.clock.now() - this.origin;
  };

  return RelativeClock;
}();

var HRTimeClock = /*#__PURE__*/function () {
  function HRTimeClock(hrtime, origin) {
    classCallCheck(this, HRTimeClock);

    this.origin = origin;
    this.hrtime = hrtime;
  }

  HRTimeClock.prototype.now = function now() {
    var hrt = this.hrtime(this.origin);
    return (hrt[0] * 1e9 + hrt[1]) / 1e6;
  };

  return HRTimeClock;
}();

var clockRelativeTo = function clockRelativeTo(clock) {
  return new RelativeClock(clock, clock.now());
};

var newPerformanceClock = function newPerformanceClock() {
  return clockRelativeTo(performance);
};

// @deprecated will be removed in 2.0.0
// Date.now is not monotonic, and performance.now is ubiquitous:
// See https://caniuse.com/#search=performance.now
var newDateClock = function newDateClock() {
  return clockRelativeTo(Date);
};

var newHRTimeClock = function newHRTimeClock() {
  return new HRTimeClock(process.hrtime, process.hrtime());
};

var newPlatformClock = function newPlatformClock() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return newPerformanceClock();
  } else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
    return newHRTimeClock();
  }

  return newDateClock();
};

// Read the current time from the provided Scheduler
var currentTime = function currentTime(scheduler) {
  return scheduler.currentTime();
};

// Schedule a task to run as soon as possible, but
// not in the current call stack
var asap = /*#__PURE__*/curry2(function (task, scheduler) {
  return scheduler.scheduleTask(0, 0, -1, task);
});

// Schedule a task to run after a millisecond delay
var delay = /*#__PURE__*/curry3(function (delay, task, scheduler) {
  return scheduler.scheduleTask(0, delay, -1, task);
});

// Cancel a scheduledTask
var cancelTask = function cancelTask(scheduledTask) {
  return scheduledTask.dispose();
};

var schedulerRelativeTo = /*#__PURE__*/curry2(function (offset, scheduler) {
  return new RelativeScheduler(offset, scheduler);
});

var newDefaultScheduler = function newDefaultScheduler() {
  return new Scheduler(newDefaultTimer(), new Timeline());
};

var newDefaultTimer = function newDefaultTimer() {
  return new ClockTimer(newPlatformClock());
};

var classCallCheck$1 = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var disposeNone = function disposeNone() {
  return NONE;
};
var NONE = /*#__PURE__*/new (function () {
  function DisposeNone() {
    classCallCheck$1(this, DisposeNone);
  }

  DisposeNone.prototype.dispose = function dispose() {};

  return DisposeNone;
}())();

var isDisposeNone = function isDisposeNone(d) {
  return d === NONE;
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Wrap an existing disposable (which may not already have been once()d)
// so that it will only dispose its underlying resource at most once.
var disposeOnce = function disposeOnce(disposable) {
  return new DisposeOnce(disposable);
};

var DisposeOnce = /*#__PURE__*/function () {
  function DisposeOnce(disposable) {
    classCallCheck$1(this, DisposeOnce);

    this.disposed = false;
    this.disposable = disposable;
  }

  DisposeOnce.prototype.dispose = function dispose() {
    if (!this.disposed) {
      this.disposed = true;
      this.disposable.dispose();
      this.disposable = undefined;
    }
  };

  return DisposeOnce;
}();

/** @license MIT License (c) copyright 2010 original author or authors */
// Aggregate a list of disposables into a DisposeAll
var disposeAll = function disposeAll(ds) {
  var merged = reduce(merge, [], ds);
  return merged.length === 0 ? disposeNone() : new DisposeAll(merged);
};

// Convenience to aggregate 2 disposables
var disposeBoth = /*#__PURE__*/curry2(function (d1, d2) {
  return disposeAll([d1, d2]);
});

var merge = function merge(ds, d) {
  return isDisposeNone(d) ? ds : d instanceof DisposeAll ? ds.concat(d.disposables) : append(d, ds);
};

var DisposeAll = /*#__PURE__*/function () {
  function DisposeAll(disposables) {
    classCallCheck$1(this, DisposeAll);

    this.disposables = disposables;
  }

  DisposeAll.prototype.dispose = function dispose() {
    throwIfErrors(disposeCollectErrors(this.disposables));
  };

  return DisposeAll;
}();

// Dispose all, safely collecting errors into an array


var disposeCollectErrors = function disposeCollectErrors(disposables) {
  return reduce(appendIfError, [], disposables);
};

// Call dispose and if throws, append thrown error to errors
var appendIfError = function appendIfError(errors, d) {
  try {
    d.dispose();
  } catch (e) {
    errors.push(e);
  }
  return errors;
};

// Throw DisposeAllError if errors is non-empty
var throwIfErrors = function throwIfErrors(errors) {
  if (errors.length > 0) {
    throw new DisposeAllError(errors.length + ' errors', errors);
  }
};

var DisposeAllError = /*#__PURE__*/function (Error) {
  function DisposeAllError(message, errors) {
    Error.call(this, message);
    this.message = message;
    this.name = DisposeAllError.name;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DisposeAllError);
    }

    this.stack = '' + this.stack + formatErrorStacks(this.errors);
  }

  DisposeAllError.prototype = /*#__PURE__*/Object.create(Error.prototype);

  return DisposeAllError;
}(Error);

var formatErrorStacks = function formatErrorStacks(errors) {
  return reduce(formatErrorStack, '', errors);
};

var formatErrorStack = function formatErrorStack(s, e, i) {
  return s + ('\n[' + (i + 1) + '] ' + e.stack);
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Try to dispose the disposable.  If it throws, send
// the error to sink.error with the provided Time value
var tryDispose = /*#__PURE__*/curry3(function (t, disposable, sink) {
  try {
    disposable.dispose();
  } catch (e) {
    sink.error(t, e);
  }
});

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function fatalError(e) {
  setTimeout(rethrow, 0, e);
}

function rethrow(e) {
  throw e;
}





var classCallCheck$2 = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var propagateTask$1 = function propagateTask(run, value, sink) {
  return new PropagateTask(run, value, sink);
};

var propagateEventTask$1 = function propagateEventTask(value, sink) {
  return propagateTask$1(runEvent, value, sink);
};

var propagateEndTask = function propagateEndTask(sink) {
  return propagateTask$1(runEnd, undefined, sink);
};

var PropagateTask = /*#__PURE__*/function () {
  function PropagateTask(run, value, sink) {
    classCallCheck$2(this, PropagateTask);

    this._run = run;
    this.value = value;
    this.sink = sink;
    this.active = true;
  }

  PropagateTask.prototype.dispose = function dispose() {
    this.active = false;
  };

  PropagateTask.prototype.run = function run(t) {
    if (!this.active) {
      return;
    }
    var run = this._run;
    run(t, this.value, this.sink);
  };

  PropagateTask.prototype.error = function error(t, e) {
    // TODO: Remove this check and just do this.sink.error(t, e)?
    if (!this.active) {
      return fatalError(e);
    }
    this.sink.error(t, e);
  };

  return PropagateTask;
}();

var runEvent = function runEvent(t, x, sink) {
  return sink.event(t, x);
};

var runEnd = function runEnd(t, _, sink) {
  return sink.end(t);
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var empty = function empty() {
  return EMPTY;
};

var isCanonicalEmpty = function isCanonicalEmpty(stream) {
  return stream === EMPTY;
};

var Empty = /*#__PURE__*/function () {
  function Empty() {
    classCallCheck$2(this, Empty);
  }

  Empty.prototype.run = function run(sink, scheduler$$1) {
    return asap(propagateEndTask(sink), scheduler$$1);
  };

  return Empty;
}();

var EMPTY = /*#__PURE__*/new Empty();

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var at = function at(t, x) {
  return new At(t, x);
};

var At = /*#__PURE__*/function () {
  function At(t, x) {
    classCallCheck$2(this, At);

    this.time = t;
    this.value = x;
  }

  At.prototype.run = function run(sink, scheduler$$1) {
    return delay(this.time, propagateTask$1(runAt, this.value, sink), scheduler$$1);
  };

  return At;
}();

function runAt(t, x, sink) {
  sink.event(t, x);
  sink.end(t);
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var now = function now(x) {
  return at(0, x);
};

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/** @author Brian Cavalier */

var Pipe = /*#__PURE__*/function () {
  function Pipe(sink) {
    classCallCheck$2(this, Pipe);

    this.sink = sink;
  }

  Pipe.prototype.event = function event(t, x) {
    return this.sink.event(t, x);
  };

  Pipe.prototype.end = function end(t) {
    return this.sink.end(t);
  };

  Pipe.prototype.error = function error(t, e) {
    return this.sink.error(t, e);
  };

  return Pipe;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Filter = /*#__PURE__*/function () {
  function Filter(p, source) {
    classCallCheck$2(this, Filter);

    this.p = p;
    this.source = source;
  }

  Filter.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(new FilterSink(this.p, sink), scheduler$$1);
  };

  /**
   * Create a filtered source, fusing adjacent filter.filter if possible
   * @param {function(x:*):boolean} p filtering predicate
   * @param {{run:function}} source source to filter
   * @returns {Filter} filtered source
   */


  Filter.create = function create(p, source) {
    if (isCanonicalEmpty(source)) {
      return source;
    }

    if (source instanceof Filter) {
      return new Filter(and(source.p, p), source.source);
    }

    return new Filter(p, source);
  };

  return Filter;
}();

var FilterSink = /*#__PURE__*/function (_Pipe) {
  inherits(FilterSink, _Pipe);

  function FilterSink(p, sink) {
    classCallCheck$2(this, FilterSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.p = p;
    return _this;
  }

  FilterSink.prototype.event = function event(t, x) {
    var p = this.p;
    p(x) && this.sink.event(t, x);
  };

  return FilterSink;
}(Pipe);

var and = function and(p, q) {
  return function (x) {
    return p(x) && q(x);
  };
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var FilterMap = /*#__PURE__*/function () {
  function FilterMap(p, f, source) {
    classCallCheck$2(this, FilterMap);

    this.p = p;
    this.f = f;
    this.source = source;
  }

  FilterMap.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler$$1);
  };

  return FilterMap;
}();

var FilterMapSink = /*#__PURE__*/function (_Pipe) {
  inherits(FilterMapSink, _Pipe);

  function FilterMapSink(p, f, sink) {
    classCallCheck$2(this, FilterMapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.p = p;
    _this.f = f;
    return _this;
  }

  FilterMapSink.prototype.event = function event(t, x) {
    var f = this.f;
    var p = this.p;
    p(x) && this.sink.event(t, f(x));
  };

  return FilterMapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Map = /*#__PURE__*/function () {
  function Map(f, source) {
    classCallCheck$2(this, Map);

    this.f = f;
    this.source = source;
  }

  Map.prototype.run = function run(sink, scheduler$$1) {
    // eslint-disable-line no-extend-native
    return this.source.run(new MapSink(this.f, sink), scheduler$$1);
  };

  /**
   * Create a mapped source, fusing adjacent map.map, filter.map,
   * and filter.map.map if possible
   * @param {function(*):*} f mapping function
   * @param {{run:function}} source source to map
   * @returns {Map|FilterMap} mapped source, possibly fused
   */


  Map.create = function create(f, source) {
    if (isCanonicalEmpty(source)) {
      return empty();
    }

    if (source instanceof Map) {
      return new Map(compose(f, source.f), source.source);
    }

    if (source instanceof Filter) {
      return new FilterMap(source.p, f, source.source);
    }

    return new Map(f, source);
  };

  return Map;
}();

var MapSink = /*#__PURE__*/function (_Pipe) {
  inherits(MapSink, _Pipe);

  function MapSink(f, sink) {
    classCallCheck$2(this, MapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    return _this;
  }

  MapSink.prototype.event = function event(t, x) {
    var f = this.f;
    this.sink.event(t, f(x));
  };

  return MapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var SettableDisposable = /*#__PURE__*/function () {
  function SettableDisposable() {
    classCallCheck$2(this, SettableDisposable);

    this.disposable = undefined;
    this.disposed = false;
  }

  SettableDisposable.prototype.setDisposable = function setDisposable(disposable$$1) {
    if (this.disposable !== void 0) {
      throw new Error('setDisposable called more than once');
    }

    this.disposable = disposable$$1;

    if (this.disposed) {
      disposable$$1.dispose();
    }
  };

  SettableDisposable.prototype.dispose = function dispose() {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    if (this.disposable !== void 0) {
      this.disposable.dispose();
    }
  };

  return SettableDisposable;
}();

var skipAfter$1 = function skipAfter(p, stream) {
  return isCanonicalEmpty(stream) ? empty() : new SkipAfter(p, stream);
};

var SkipAfter = /*#__PURE__*/function () {
  function SkipAfter(p, source) {
    classCallCheck$2(this, SkipAfter);

    this.p = p;
    this.source = source;
  }

  SkipAfter.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(new SkipAfterSink(this.p, sink), scheduler$$1);
  };

  return SkipAfter;
}();

var SkipAfterSink = /*#__PURE__*/function (_Pipe4) {
  inherits(SkipAfterSink, _Pipe4);

  function SkipAfterSink(p, sink) {
    classCallCheck$2(this, SkipAfterSink);

    var _this4 = possibleConstructorReturn(this, _Pipe4.call(this, sink));

    _this4.p = p;
    _this4.skipping = false;
    return _this4;
  }

  SkipAfterSink.prototype.event = function event(t, x) {
    if (this.skipping) {
      return;
    }

    var p = this.p;
    this.skipping = p(x);
    this.sink.event(t, x);

    if (this.skipping) {
      this.sink.end(t);
    }
  };

  return SkipAfterSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var runEffects$1 = /*#__PURE__*/curry2(function (stream, scheduler$$1) {
  return new Promise(function (resolve, reject) {
    return runStream(stream, scheduler$$1, resolve, reject);
  });
});

function runStream(stream, scheduler$$1, resolve, reject) {
  var disposable$$1 = new SettableDisposable();
  var observer = new RunEffectsSink(resolve, reject, disposable$$1);

  disposable$$1.setDisposable(stream.run(observer, scheduler$$1));
}

var RunEffectsSink = /*#__PURE__*/function () {
  function RunEffectsSink(end, error, disposable$$1) {
    classCallCheck$2(this, RunEffectsSink);

    this._end = end;
    this._error = error;
    this._disposable = disposable$$1;
    this.active = true;
  }

  RunEffectsSink.prototype.event = function event(t, x) {};

  RunEffectsSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }
    this._dispose(this._error, this._end, undefined);
  };

  RunEffectsSink.prototype.error = function error(t, e) {
    this._dispose(this._error, this._error, e);
  };

  RunEffectsSink.prototype._dispose = function _dispose(error, end, x) {
    this.active = false;
    tryDispose$1(error, end, x, this._disposable);
  };

  return RunEffectsSink;
}();

function tryDispose$1(error, end, x, disposable$$1) {
  try {
    disposable$$1.dispose();
  } catch (e) {
    error(e);
    return;
  }

  end(x);
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */

// Run a Stream, sending all its events to the
// provided Sink.
var run$1 = function run(sink, scheduler$$1, stream) {
  return stream.run(sink, scheduler$$1);
};

var RelativeSink = /*#__PURE__*/function () {
  function RelativeSink(offset, sink) {
    classCallCheck$2(this, RelativeSink);

    this.sink = sink;
    this.offset = offset;
  }

  RelativeSink.prototype.event = function event(t, x) {
    this.sink.event(t + this.offset, x);
  };

  RelativeSink.prototype.error = function error(t, e) {
    this.sink.error(t + this.offset, e);
  };

  RelativeSink.prototype.end = function end(t) {
    this.sink.end(t + this.offset);
  };

  return RelativeSink;
}();

// Create a stream with its own local clock
// This transforms time from the provided scheduler's clock to a stream-local
// clock (which starts at 0), and then *back* to the scheduler's clock before
// propagating events to sink.  In other words, upstream sources will see local times,
// and downstream sinks will see non-local (original) times.
var withLocalTime$1 = function withLocalTime(origin, stream) {
  return new WithLocalTime(origin, stream);
};

var WithLocalTime = /*#__PURE__*/function () {
  function WithLocalTime(origin, source) {
    classCallCheck$2(this, WithLocalTime);

    this.origin = origin;
    this.source = source;
  }

  WithLocalTime.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler$$1));
  };

  return WithLocalTime;
}();

// Accumulate offsets instead of nesting RelativeSinks, which can happen
// with higher-order stream and combinators like continueWith when they're
// applied recursively.


var relativeSink = function relativeSink(origin, sink) {
  return sink instanceof RelativeSink ? new RelativeSink(origin + sink.offset, sink.sink) : new RelativeSink(origin, sink);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
var scan$1 = function scan(f, initial, stream) {
  return new Scan(f, initial, stream);
};

var Scan = /*#__PURE__*/function () {
  function Scan(f, z, source) {
    classCallCheck$2(this, Scan);

    this.source = source;
    this.f = f;
    this.value = z;
  }

  Scan.prototype.run = function run(sink, scheduler$$1) {
    var d1 = asap(propagateEventTask$1(this.value, sink), scheduler$$1);
    var d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler$$1);
    return disposeBoth(d1, d2);
  };

  return Scan;
}();

var ScanSink = /*#__PURE__*/function (_Pipe) {
  inherits(ScanSink, _Pipe);

  function ScanSink(f, z, sink) {
    classCallCheck$2(this, ScanSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.value = z;
    return _this;
  }

  ScanSink.prototype.event = function event(t, x) {
    var f = this.f;
    this.value = f(this.value, x);
    this.sink.event(t, this.value);
  };

  return ScanSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var continueWith$1 = function continueWith(f, stream) {
  return new ContinueWith(f, stream);
};

var ContinueWith = /*#__PURE__*/function () {
  function ContinueWith(f, source) {
    classCallCheck$2(this, ContinueWith);

    this.f = f;
    this.source = source;
  }

  ContinueWith.prototype.run = function run(sink, scheduler$$1) {
    return new ContinueWithSink(this.f, this.source, sink, scheduler$$1);
  };

  return ContinueWith;
}();

var ContinueWithSink = /*#__PURE__*/function (_Pipe) {
  inherits(ContinueWithSink, _Pipe);

  function ContinueWithSink(f, source, sink, scheduler$$1) {
    classCallCheck$2(this, ContinueWithSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.scheduler = scheduler$$1;
    _this.active = true;
    _this.disposable = disposeOnce(source.run(_this, scheduler$$1));
    return _this;
  }

  ContinueWithSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }
    this.sink.event(t, x);
  };

  ContinueWithSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }

    tryDispose(t, this.disposable, this.sink);

    this._startNext(t, this.sink);
  };

  ContinueWithSink.prototype._startNext = function _startNext(t, sink) {
    try {
      this.disposable = this._continue(this.f, t, sink);
    } catch (e) {
      sink.error(t, e);
    }
  };

  ContinueWithSink.prototype._continue = function _continue(f, t, sink) {
    return run$1(sink, this.scheduler, withLocalTime$1(t, f()));
  };

  ContinueWithSink.prototype.dispose = function dispose() {
    this.active = false;
    return this.disposable.dispose();
  };

  return ContinueWithSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2017 original author or authors */

var startWith$1 = function startWith(x, stream) {
  return continueWith$1(function () {
    return stream;
  }, now(x));
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @param {Stream} stream stream to map
 * @returns {Stream} stream containing items transformed by f
 */
var map$2 = function map$$1(f, stream) {
  return Map.create(f, stream);
};

/**
* Perform a side effect for each item in the stream
* @param {function(x:*):*} f side effect to execute for each item. The
*  return value will be discarded.
* @param {Stream} stream stream to tap
* @returns {Stream} new stream containing the same items as this stream
*/
var tap$1 = function tap(f, stream) {
  return new Tap(f, stream);
};

var Tap = /*#__PURE__*/function () {
  function Tap(f, source) {
    classCallCheck$2(this, Tap);

    this.source = source;
    this.f = f;
  }

  Tap.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(new TapSink(this.f, sink), scheduler$$1);
  };

  return Tap;
}();

var TapSink = /*#__PURE__*/function (_Pipe) {
  inherits(TapSink, _Pipe);

  function TapSink(f, sink) {
    classCallCheck$2(this, TapSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    return _this;
  }

  TapSink.prototype.event = function event(t, x) {
    var f = this.f;
    f(x);
    this.sink.event(t, x);
  };

  return TapSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var IndexSink = /*#__PURE__*/function (_Sink) {
  inherits(IndexSink, _Sink);

  function IndexSink(i, sink) {
    classCallCheck$2(this, IndexSink);

    var _this = possibleConstructorReturn(this, _Sink.call(this, sink));

    _this.index = i;
    _this.active = true;
    _this.value = undefined;
    return _this;
  }

  IndexSink.prototype.event = function event(t, x) {
    if (!this.active) {
      return;
    }
    this.value = x;
    this.sink.event(t, this);
  };

  IndexSink.prototype.end = function end(t) {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.sink.event(t, this);
  };

  return IndexSink;
}(Pipe);

/** @license MIT License (c) copyright 2010 original author or authors */

var mergeConcurrently$1 = function mergeConcurrently(concurrency, stream) {
  return mergeMapConcurrently$1(id, concurrency, stream);
};

var mergeMapConcurrently$1 = function mergeMapConcurrently(f, concurrency, stream) {
  return isCanonicalEmpty(stream) ? empty() : new MergeConcurrently(f, concurrency, stream);
};

var MergeConcurrently = /*#__PURE__*/function () {
  function MergeConcurrently(f, concurrency, source) {
    classCallCheck$2(this, MergeConcurrently);

    this.f = f;
    this.concurrency = concurrency;
    this.source = source;
  }

  MergeConcurrently.prototype.run = function run(sink, scheduler$$1) {
    return new Outer(this.f, this.concurrency, this.source, sink, scheduler$$1);
  };

  return MergeConcurrently;
}();

var Outer = /*#__PURE__*/function () {
  function Outer(f, concurrency, source, sink, scheduler$$1) {
    classCallCheck$2(this, Outer);

    this.f = f;
    this.concurrency = concurrency;
    this.sink = sink;
    this.scheduler = scheduler$$1;
    this.pending = [];
    this.current = [];
    this.disposable = disposeOnce(source.run(this, scheduler$$1));
    this.active = true;
  }

  Outer.prototype.event = function event(t, x) {
    this._addInner(t, x);
  };

  Outer.prototype._addInner = function _addInner(t, x) {
    if (this.current.length < this.concurrency) {
      this._startInner(t, x);
    } else {
      this.pending.push(x);
    }
  };

  Outer.prototype._startInner = function _startInner(t, x) {
    try {
      this._initInner(t, x);
    } catch (e) {
      this.error(t, e);
    }
  };

  Outer.prototype._initInner = function _initInner(t, x) {
    var innerSink = new Inner(t, this, this.sink);
    innerSink.disposable = mapAndRun(this.f, t, x, innerSink, this.scheduler);
    this.current.push(innerSink);
  };

  Outer.prototype.end = function end(t) {
    this.active = false;
    tryDispose(t, this.disposable, this.sink);
    this._checkEnd(t);
  };

  Outer.prototype.error = function error(t, e) {
    this.active = false;
    this.sink.error(t, e);
  };

  Outer.prototype.dispose = function dispose() {
    this.active = false;
    this.pending.length = 0;
    this.disposable.dispose();
    disposeAll(this.current).dispose();
  };

  Outer.prototype._endInner = function _endInner(t, inner) {
    var i = this.current.indexOf(inner);
    if (i >= 0) {
      this.current.splice(i, 1);
    }
    tryDispose(t, inner, this);

    if (this.pending.length === 0) {
      this._checkEnd(t);
    } else {
      this._startInner(t, this.pending.shift());
    }
  };

  Outer.prototype._checkEnd = function _checkEnd(t) {
    if (!this.active && this.current.length === 0) {
      this.sink.end(t);
    }
  };

  return Outer;
}();

var mapAndRun = function mapAndRun(f, t, x, sink, scheduler$$1) {
  return f(x).run(sink, schedulerRelativeTo(t, scheduler$$1));
};

var Inner = /*#__PURE__*/function () {
  function Inner(time, outer, sink) {
    classCallCheck$2(this, Inner);

    this.time = time;
    this.outer = outer;
    this.sink = sink;
    this.disposable = disposeNone();
  }

  Inner.prototype.event = function event(t, x) {
    this.sink.event(t + this.time, x);
  };

  Inner.prototype.end = function end(t) {
    this.outer._endInner(t + this.time, this);
  };

  Inner.prototype.error = function error(t, e) {
    this.outer.error(t + this.time, e);
  };

  Inner.prototype.dispose = function dispose() {
    return this.disposable.dispose();
  };

  return Inner;
}();

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer. Event arrival times are preserved.
 * @param {Stream<Stream<X>>} stream stream of streams
 * @returns {Stream<X>} new stream containing all events of all inner streams
 */
var join = function join(stream) {
  return mergeConcurrently$1(Infinity, stream);
};

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * @returns {Stream} stream containing events from two streams in time order.
 * If two events are simultaneous they will be merged in arbitrary order.
 */
function merge$1(stream1, stream2) {
  return mergeArray([stream1, stream2]);
}

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
var mergeArray = function mergeArray(streams) {
  return mergeStreams(withoutCanonicalEmpty(streams));
};

/**
 * This implements fusion/flattening for merge.  It will
 * fuse adjacent merge operations.  For example:
 * - a.merge(b).merge(c) effectively becomes merge(a, b, c)
 * - merge(a, merge(b, c)) effectively becomes merge(a, b, c)
 * It does this by concatenating the sources arrays of
 * any nested Merge sources, in effect "flattening" nested
 * merge operations into a single merge.
 */
var mergeStreams = function mergeStreams(streams) {
  return streams.length === 0 ? empty() : streams.length === 1 ? streams[0] : new Merge(reduce(appendSources, [], streams));
};

var withoutCanonicalEmpty = function withoutCanonicalEmpty(streams) {
  return streams.filter(isNotCanonicalEmpty);
};

var isNotCanonicalEmpty = function isNotCanonicalEmpty(stream) {
  return !isCanonicalEmpty(stream);
};

var appendSources = function appendSources(sources, stream) {
  return sources.concat(stream instanceof Merge ? stream.sources : stream);
};

var Merge = /*#__PURE__*/function () {
  function Merge(sources) {
    classCallCheck$2(this, Merge);

    this.sources = sources;
  }

  Merge.prototype.run = function run(sink, scheduler$$1) {
    var l = this.sources.length;
    var disposables = new Array(l);
    var sinks = new Array(l);

    var mergeSink = new MergeSink(disposables, sinks, sink);

    for (var indexSink, i = 0; i < l; ++i) {
      indexSink = sinks[i] = new IndexSink(i, mergeSink);
      disposables[i] = this.sources[i].run(indexSink, scheduler$$1);
    }

    return disposeAll(disposables);
  };

  return Merge;
}();

var MergeSink = /*#__PURE__*/function (_Pipe) {
  inherits(MergeSink, _Pipe);

  function MergeSink(disposables, sinks, sink) {
    classCallCheck$2(this, MergeSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.disposables = disposables;
    _this.activeCount = sinks.length;
    return _this;
  }

  MergeSink.prototype.event = function event(t, indexValue) {
    if (!indexValue.active) {
      this._dispose(t, indexValue.index);
      return;
    }
    this.sink.event(t, indexValue.value);
  };

  MergeSink.prototype._dispose = function _dispose(t, index) {
    tryDispose(t, this.disposables[index], this.sink);
    if (--this.activeCount === 0) {
      this.sink.end(t);
    }
  };

  return MergeSink;
}(Pipe);

var snapshot$1 = function snapshot(f, values, sampler) {
  return isCanonicalEmpty(sampler) || isCanonicalEmpty(values) ? empty() : new Snapshot(f, values, sampler);
};

var Snapshot = /*#__PURE__*/function () {
  function Snapshot(f, values, sampler) {
    classCallCheck$2(this, Snapshot);

    this.f = f;
    this.values = values;
    this.sampler = sampler;
  }

  Snapshot.prototype.run = function run(sink, scheduler$$1) {
    var sampleSink = new SnapshotSink(this.f, sink);
    var valuesDisposable = this.values.run(sampleSink.latest, scheduler$$1);
    var samplerDisposable = this.sampler.run(sampleSink, scheduler$$1);

    return disposeBoth(samplerDisposable, valuesDisposable);
  };

  return Snapshot;
}();

var SnapshotSink = /*#__PURE__*/function (_Pipe) {
  inherits(SnapshotSink, _Pipe);

  function SnapshotSink(f, sink) {
    classCallCheck$2(this, SnapshotSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.f = f;
    _this.latest = new LatestValueSink(_this);
    return _this;
  }

  SnapshotSink.prototype.event = function event(t, x) {
    if (this.latest.hasValue) {
      var f = this.f;
      this.sink.event(t, f(this.latest.value, x));
    }
  };

  return SnapshotSink;
}(Pipe);

var LatestValueSink = /*#__PURE__*/function (_Pipe2) {
  inherits(LatestValueSink, _Pipe2);

  function LatestValueSink(sink) {
    classCallCheck$2(this, LatestValueSink);

    var _this2 = possibleConstructorReturn(this, _Pipe2.call(this, sink));

    _this2.hasValue = false;
    return _this2;
  }

  LatestValueSink.prototype.event = function event(t, x) {
    this.value = x;
    this.hasValue = true;
  };

  LatestValueSink.prototype.end = function end() {};

  return LatestValueSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
var switchLatest = function switchLatest(stream) {
  return isCanonicalEmpty(stream) ? empty() : new Switch(stream);
};

var Switch = /*#__PURE__*/function () {
  function Switch(source) {
    classCallCheck$2(this, Switch);

    this.source = source;
  }

  Switch.prototype.run = function run(sink, scheduler$$1) {
    var switchSink = new SwitchSink(sink, scheduler$$1);
    return disposeBoth(switchSink, this.source.run(switchSink, scheduler$$1));
  };

  return Switch;
}();

var SwitchSink = /*#__PURE__*/function () {
  function SwitchSink(sink, scheduler$$1) {
    classCallCheck$2(this, SwitchSink);

    this.sink = sink;
    this.scheduler = scheduler$$1;
    this.current = null;
    this.ended = false;
  }

  SwitchSink.prototype.event = function event(t, stream) {
    this._disposeCurrent(t);
    this.current = new Segment(stream, t, Infinity, this, this.sink, this.scheduler);
  };

  SwitchSink.prototype.end = function end(t) {
    this.ended = true;
    this._checkEnd(t);
  };

  SwitchSink.prototype.error = function error(t, e) {
    this.ended = true;
    this.sink.error(t, e);
  };

  SwitchSink.prototype.dispose = function dispose() {
    return this._disposeCurrent(currentTime(this.scheduler));
  };

  SwitchSink.prototype._disposeCurrent = function _disposeCurrent(t) {
    if (this.current !== null) {
      return this.current._dispose(t);
    }
  };

  SwitchSink.prototype._disposeInner = function _disposeInner(t, inner) {
    inner._dispose(t);
    if (inner === this.current) {
      this.current = null;
    }
  };

  SwitchSink.prototype._checkEnd = function _checkEnd(t) {
    if (this.ended && this.current === null) {
      this.sink.end(t);
    }
  };

  SwitchSink.prototype._endInner = function _endInner(t, inner) {
    this._disposeInner(t, inner);
    this._checkEnd(t);
  };

  SwitchSink.prototype._errorInner = function _errorInner(t, e, inner) {
    this._disposeInner(t, inner);
    this.sink.error(t, e);
  };

  return SwitchSink;
}();

var Segment = /*#__PURE__*/function () {
  function Segment(source, min, max, outer, sink, scheduler$$1) {
    classCallCheck$2(this, Segment);

    this.min = min;
    this.max = max;
    this.outer = outer;
    this.sink = sink;
    this.disposable = source.run(this, schedulerRelativeTo(min, scheduler$$1));
  }

  Segment.prototype.event = function event(t, x) {
    var time = Math.max(0, t + this.min);
    if (time < this.max) {
      this.sink.event(time, x);
    }
  };

  Segment.prototype.end = function end(t) {
    this.outer._endInner(t + this.min, this);
  };

  Segment.prototype.error = function error(t, e) {
    this.outer._errorInner(t + this.min, e, this);
  };

  Segment.prototype._dispose = function _dispose(t) {
    tryDispose(t, this.disposable, this.sink);
  };

  return Segment;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * Retain only items matching a predicate
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
var filter$1 = function filter(p, stream) {
  return Filter.create(p, stream);
};

/**
 * Skip repeated events, using === to detect duplicates
 * @param {Stream} stream stream from which to omit repeated events
 * @returns {Stream} stream without repeated events
 */
var skipRepeats = function skipRepeats(stream) {
  return skipRepeatsWith$1(same, stream);
};

/**
 * Skip repeated events using the provided equals function to detect duplicates
 * @param {function(a:*, b:*):boolean} equals optional function to compare items
 * @param {Stream} stream stream from which to omit repeated events
 * @returns {Stream} stream without repeated events
 */
var skipRepeatsWith$1 = function skipRepeatsWith(equals, stream) {
  return isCanonicalEmpty(stream) ? empty() : new SkipRepeats(equals, stream);
};

var SkipRepeats = /*#__PURE__*/function () {
  function SkipRepeats(equals, source) {
    classCallCheck$2(this, SkipRepeats);

    this.equals = equals;
    this.source = source;
  }

  SkipRepeats.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler$$1);
  };

  return SkipRepeats;
}();

var SkipRepeatsSink = /*#__PURE__*/function (_Pipe) {
  inherits(SkipRepeatsSink, _Pipe);

  function SkipRepeatsSink(equals, sink) {
    classCallCheck$2(this, SkipRepeatsSink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.equals = equals;
    _this.value = void 0;
    _this.init = true;
    return _this;
  }

  SkipRepeatsSink.prototype.event = function event(t, x) {
    if (this.init) {
      this.init = false;
      this.value = x;
      this.sink.event(t, x);
    } else if (!this.equals(this.value, x)) {
      this.value = x;
      this.sink.event(t, x);
    }
  };

  return SkipRepeatsSink;
}(Pipe);

function same(a, b) {
  return a === b;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var until$1 = function until(signal, stream) {
  return new Until(signal, stream);
};

var Until = /*#__PURE__*/function () {
  function Until(maxSignal, source) {
    classCallCheck$2(this, Until);

    this.maxSignal = maxSignal;
    this.source = source;
  }

  Until.prototype.run = function run(sink, scheduler$$1) {
    var disposable$$1 = new SettableDisposable();

    var d1 = this.source.run(sink, scheduler$$1);
    var d2 = this.maxSignal.run(new UntilSink(sink, disposable$$1), scheduler$$1);
    disposable$$1.setDisposable(disposeBoth(d1, d2));

    return disposable$$1;
  };

  return Until;
}();

var UntilSink = /*#__PURE__*/function (_Pipe3) {
  inherits(UntilSink, _Pipe3);

  function UntilSink(sink, disposable$$1) {
    classCallCheck$2(this, UntilSink);

    var _this3 = possibleConstructorReturn(this, _Pipe3.call(this, sink));

    _this3.disposable = disposable$$1;
    return _this3;
  }

  UntilSink.prototype.event = function event(t, x) {
    this.disposable.dispose();
    this.sink.end(t);
  };

  UntilSink.prototype.end = function end() {};

  return UntilSink;
}(Pipe);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
var delay$2 = function delay$$1(delayTime, stream) {
  return delayTime <= 0 ? stream : new Delay(delayTime, stream);
};

var Delay = /*#__PURE__*/function () {
  function Delay(dt, source) {
    classCallCheck$2(this, Delay);

    this.dt = dt;
    this.source = source;
  }

  Delay.prototype.run = function run(sink, scheduler$$1) {
    var delaySink = new DelaySink(this.dt, sink, scheduler$$1);
    return disposeBoth(delaySink, this.source.run(delaySink, scheduler$$1));
  };

  return Delay;
}();

var DelaySink = /*#__PURE__*/function (_Pipe) {
  inherits(DelaySink, _Pipe);

  function DelaySink(dt, sink, scheduler$$1) {
    classCallCheck$2(this, DelaySink);

    var _this = possibleConstructorReturn(this, _Pipe.call(this, sink));

    _this.dt = dt;
    _this.scheduler = scheduler$$1;
    _this.tasks = [];
    return _this;
  }

  DelaySink.prototype.dispose = function dispose() {
    this.tasks.forEach(cancelTask);
  };

  DelaySink.prototype.event = function event(t, x) {
    this.tasks.push(delay(this.dt, propagateEventTask$1(x, this.sink), this.scheduler));
  };

  DelaySink.prototype.end = function end(t) {
    this.tasks.push(delay(this.dt, propagateEndTask(this.sink), this.scheduler));
  };

  return DelaySink;
}(Pipe);
/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * @param {Number} period events occuring more frequently than this
 *  will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */


var debounce$1 = function debounce(period, stream) {
  return isCanonicalEmpty(stream) ? empty() : new Debounce(period, stream);
};

var Debounce = /*#__PURE__*/function () {
  function Debounce(dt, source) {
    classCallCheck$2(this, Debounce);

    this.dt = dt;
    this.source = source;
  }

  Debounce.prototype.run = function run(sink, scheduler$$1) {
    return new DebounceSink(this.dt, this.source, sink, scheduler$$1);
  };

  return Debounce;
}();

var DebounceSink = /*#__PURE__*/function () {
  function DebounceSink(dt, source, sink, scheduler$$1) {
    classCallCheck$2(this, DebounceSink);

    this.dt = dt;
    this.sink = sink;
    this.scheduler = scheduler$$1;
    this.value = void 0;
    this.timer = null;

    this.disposable = source.run(this, scheduler$$1);
  }

  DebounceSink.prototype.event = function event(t, x) {
    this._clearTimer();
    this.value = x;
    this.timer = delay(this.dt, new DebounceTask(this, x), this.scheduler);
  };

  DebounceSink.prototype._event = function _event(t, x) {
    this._clearTimer();
    this.sink.event(t, x);
  };

  DebounceSink.prototype.end = function end(t) {
    if (this._clearTimer()) {
      this.sink.event(t, this.value);
      this.value = undefined;
    }
    this.sink.end(t);
  };

  DebounceSink.prototype.error = function error(t, x) {
    this._clearTimer();
    this.sink.error(t, x);
  };

  DebounceSink.prototype.dispose = function dispose() {
    this._clearTimer();
    this.disposable.dispose();
  };

  DebounceSink.prototype._clearTimer = function _clearTimer() {
    if (this.timer === null) {
      return false;
    }
    this.timer.dispose();
    this.timer = null;
    return true;
  };

  return DebounceSink;
}();

var DebounceTask = /*#__PURE__*/function () {
  function DebounceTask(debounce, value) {
    classCallCheck$2(this, DebounceTask);

    this.debounce = debounce;
    this.value = value;
  }

  DebounceTask.prototype.run = function run(t) {
    this.debounce._event(t, this.value);
  };

  DebounceTask.prototype.error = function error(t, e) {
    this.debounce.error(t, e);
  };

  DebounceTask.prototype.dispose = function dispose() {};

  return DebounceTask;
}();

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

function tryEvent(t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
}

function tryEnd(t, sink) {
  try {
    sink.end(t);
  } catch (e) {
    sink.error(t, e);
  }
}

var multicast = function multicast(stream) {
  return stream instanceof Multicast || isCanonicalEmpty(stream) ? stream : new Multicast(stream);
};

var Multicast = /*#__PURE__*/function () {
  function Multicast(source) {
    classCallCheck$2(this, Multicast);

    this.source = new MulticastSource(source);
  }

  Multicast.prototype.run = function run(sink, scheduler$$1) {
    return this.source.run(sink, scheduler$$1);
  };

  return Multicast;
}();

var MulticastSource = /*#__PURE__*/function () {
  function MulticastSource(source) {
    classCallCheck$2(this, MulticastSource);

    this.source = source;
    this.sinks = [];
    this.disposable = disposeNone();
  }

  MulticastSource.prototype.run = function run(sink, scheduler$$1) {
    var n = this.add(sink);
    if (n === 1) {
      this.disposable = this.source.run(this, scheduler$$1);
    }
    return disposeOnce(new MulticastDisposable(this, sink));
  };

  MulticastSource.prototype.dispose = function dispose() {
    var disposable$$1 = this.disposable;
    this.disposable = disposeNone();
    return disposable$$1.dispose();
  };

  MulticastSource.prototype.add = function add(sink) {
    this.sinks = append(sink, this.sinks);
    return this.sinks.length;
  };

  MulticastSource.prototype.remove = function remove$$1(sink) {
    var i = findIndex(sink, this.sinks);
    // istanbul ignore next
    if (i >= 0) {
      this.sinks = remove(i, this.sinks);
    }

    return this.sinks.length;
  };

  MulticastSource.prototype.event = function event(time, value) {
    var s = this.sinks;
    if (s.length === 1) {
      return s[0].event(time, value);
    }
    for (var i = 0; i < s.length; ++i) {
      tryEvent(time, value, s[i]);
    }
  };

  MulticastSource.prototype.end = function end(time) {
    var s = this.sinks;
    for (var i = 0; i < s.length; ++i) {
      tryEnd(time, s[i]);
    }
  };

  MulticastSource.prototype.error = function error(time, err) {
    var s = this.sinks;
    for (var i = 0; i < s.length; ++i) {
      s[i].error(time, err);
    }
  };

  return MulticastSource;
}();

var MulticastDisposable = /*#__PURE__*/function () {
  function MulticastDisposable(source, sink) {
    classCallCheck$2(this, MulticastDisposable);

    this.source = source;
    this.sink = sink;
  }

  MulticastDisposable.prototype.dispose = function dispose() {
    if (this.source.remove(this.sink) === 0) {
      this.source.dispose();
    }
  };

  return MulticastDisposable;
}();

// -----------------------------------------------------------------------
// Observing

var runEffects$$1 = /*#__PURE__*/curry2(runEffects$1);

// -------------------------------------------------------

var scan$$1 = /*#__PURE__*/curry3(scan$1);

// -----------------------------------------------------------------------
// Extending

var startWith$$1 = /*#__PURE__*/curry2(startWith$1);

// -----------------------------------------------------------------------
// Transforming

var map$1 = /*#__PURE__*/curry2(map$2);
var tap$$1 = /*#__PURE__*/curry2(tap$1);

// -----------------------------------------------------------------------
// Merging

var merge$$1 = /*#__PURE__*/curry2(merge$1);
var snapshot$$1 = /*#__PURE__*/curry3(snapshot$1);

// -----------------------------------------------------------------------
// Filtering

var filter$$1 = /*#__PURE__*/curry2(filter$1);
var skipAfter$$1 = /*#__PURE__*/curry2(skipAfter$1);

// -----------------------------------------------------------------------
// Time slicing

var until$$1 = /*#__PURE__*/curry2(until$1);

// -----------------------------------------------------------------------
// Delaying

var delay$1 = /*#__PURE__*/curry2(delay$2);
var debounce$$1 = /*#__PURE__*/curry2(debounce$1);

/** @license MIT License (c) copyright 2015-2016 original author or authors */
/** @author Brian Cavalier */
// domEvent :: (EventTarget t, Event e) => String -> t -> boolean=false -> Stream e
var domEvent = function (event, node, capture) {
    if ( capture === void 0 ) capture = false;

    return new DomEvent(event, node, capture);
};
var focusin = function (node, capture) {
  if ( capture === void 0 ) capture = false;

  return domEvent('focusin', node, capture);
};
var focusout = function (node, capture) {
  if ( capture === void 0 ) capture = false;

  return domEvent('focusout', node, capture);
};
var change = function (node, capture) {
  if ( capture === void 0 ) capture = false;

  return domEvent('change', node, capture);
};
var resize = function (node, capture) {
  if ( capture === void 0 ) capture = false;

  return domEvent('resize', node, capture);
};

var DomEvent = function DomEvent (event, node, capture) {
  this.event = event;
  this.node = node;
  this.capture = capture;
};

DomEvent.prototype.run = function run (sink, scheduler$$1) {
    var this$1 = this;

  var send = function (e) { return tryEvent$1(currentTime(scheduler$$1), e, sink); };
  var dispose = function () { return this$1.node.removeEventListener(this$1.event, send, this$1.capture); };

  this.node.addEventListener(this.event, send, this.capture);

  return { dispose: dispose }
};

function tryEvent$1 (t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
}

var createAdapter = function () {
    var sinks = [];
    return [function (a) { return broadcast(sinks, a); }, new FanoutPortStream(sinks)];
};
var broadcast = function (sinks, a) {
    return sinks.forEach(function (_a) {
        var sink = _a.sink, scheduler = _a.scheduler;
        return tryEvent$2(scheduler.currentTime(), a, sink);
    });
};
var FanoutPortStream = /** @class */ (function () {
    function FanoutPortStream(sinks) {
        this.sinks = sinks;
    }
    FanoutPortStream.prototype.run = function (sink, scheduler) {
        var s = { sink: sink, scheduler: scheduler };
        this.sinks.push(s);
        return new RemovePortDisposable(s, this.sinks);
    };
    return FanoutPortStream;
}());
var RemovePortDisposable = /** @class */ (function () {
    function RemovePortDisposable(sink, sinks) {
        this.sink = sink;
        this.sinks = sinks;
    }
    RemovePortDisposable.prototype.dispose = function () {
        var i = this.sinks.indexOf(this.sink);
        if (i >= 0) {
            this.sinks.splice(i, 1);
        }
    };
    return RemovePortDisposable;
}());
function tryEvent$2(t, a, sink) {
    try {
        sink.event(t, a);
    }
    catch (e) {
        sink.error(t, e);
    }
}

function _isPlaceholder(a) {
  return a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;
}

/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;

      case 1:
        return _isPlaceholder(a) ? f2 : _curry1(function (_b) {
          return fn(a, _b);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b);
        }) : fn(a, b);
    }
  };
}

function _arity(n, fn) {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };

    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };

    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };

    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };

    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };

    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };

    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };

    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };

    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };

    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };

    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };

    default:
      throw new Error('First argument to _arity must be a non-negative integer no greater than ten');
  }
}

/**
 * Internal curryN function.
 *
 * @private
 * @category Function
 * @param {Number} length The arity of the curried function.
 * @param {Array} received An array of arguments received thus far.
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curryN(length, received, fn) {
  return function () {
    var combined = [];
    var argsIdx = 0;
    var left = length;
    var combinedIdx = 0;

    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result;

      if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
        result = received[combinedIdx];
      } else {
        result = arguments[argsIdx];
        argsIdx += 1;
      }

      combined[combinedIdx] = result;

      if (!_isPlaceholder(result)) {
        left -= 1;
      }

      combinedIdx += 1;
    }

    return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
  };
}

/**
 * Returns a curried equivalent of the provided function, with the specified
 * arity. The curried function has two unusual capabilities. First, its
 * arguments needn't be provided one at a time. If `g` is `R.curryN(3, f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.5.0
 * @category Function
 * @sig Number -> (* -> a) -> (* -> a)
 * @param {Number} length The arity for the returned function.
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curry
 * @example
 *
 *      const sumArgs = (...args) => R.sum(args);
 *
 *      const curriedAddFourNumbers = R.curryN(4, sumArgs);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */

var curryN =
/*#__PURE__*/
_curry2(function curryN(length, fn) {
  if (length === 1) {
    return _curry1(fn);
  }

  return _arity(length, _curryN(length, [], fn));
});

/**
 * Optimized internal three-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */

function _curry3(fn) {
  return function f3(a, b, c) {
    switch (arguments.length) {
      case 0:
        return f3;

      case 1:
        return _isPlaceholder(a) ? f3 : _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        });

      case 2:
        return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _curry1(function (_c) {
          return fn(a, b, _c);
        });

      default:
        return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function (_a, _b) {
          return fn(_a, _b, c);
        }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function (_a, _c) {
          return fn(_a, b, _c);
        }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function (_b, _c) {
          return fn(a, _b, _c);
        }) : _isPlaceholder(a) ? _curry1(function (_a) {
          return fn(_a, b, c);
        }) : _isPlaceholder(b) ? _curry1(function (_b) {
          return fn(a, _b, c);
        }) : _isPlaceholder(c) ? _curry1(function (_c) {
          return fn(a, b, _c);
        }) : fn(a, b, c);
    }
  };
}

/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
const _isArray = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
}

/**
 * Tests whether or not an object is similar to an array.
 *
 * @private
 * @category Type
 * @category List
 * @sig * -> Boolean
 * @param {*} x The object to test.
 * @return {Boolean} `true` if `x` has a numeric length property and extreme indices defined; `false` otherwise.
 * @example
 *
 *      _isArrayLike([]); //=> true
 *      _isArrayLike(true); //=> false
 *      _isArrayLike({}); //=> false
 *      _isArrayLike({length: 10}); //=> false
 *      _isArrayLike({0: 'zero', 9: 'nine', length: 10}); //=> true
 */

var _isArrayLike =
/*#__PURE__*/
_curry1(function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }

  if (!x) {
    return false;
  }

  if (typeof x !== 'object') {
    return false;
  }

  if (_isString(x)) {
    return false;
  }

  if (x.nodeType === 1) {
    return !!x.length;
  }

  if (x.length === 0) {
    return true;
  }

  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }

  return false;
});

var XWrap =
/*#__PURE__*/
function () {
  function XWrap(fn) {
    this.f = fn;
  }

  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };

  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };

  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };

  return XWrap;
}();

function _xwrap(fn) {
  return new XWrap(fn);
}

/**
 * Creates a function that is bound to a context.
 * Note: `R.bind` does not provide the additional argument-binding capabilities of
 * [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
 *
 * @func
 * @memberOf R
 * @since v0.6.0
 * @category Function
 * @category Object
 * @sig (* -> *) -> {*} -> (* -> *)
 * @param {Function} fn The function to bind to context
 * @param {Object} thisObj The context to bind `fn` to
 * @return {Function} A function that will execute in the context of `thisObj`.
 * @see R.partial
 * @example
 *
 *      const log = R.bind(console.log, console);
 *      R.pipe(R.assoc('a', 2), R.tap(log), R.assoc('a', 3))({a: 1}); //=> {a: 3}
 *      // logs {a: 2}
 * @symb R.bind(f, o)(a, b) = f.call(o, a, b)
 */

var bind =
/*#__PURE__*/
_curry2(function bind(fn, thisObj) {
  return _arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
});

function _arrayReduce(xf, acc, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    acc = xf['@@transducer/step'](acc, list[idx]);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    idx += 1;
  }

  return xf['@@transducer/result'](acc);
}

function _iterableReduce(xf, acc, iter) {
  var step = iter.next();

  while (!step.done) {
    acc = xf['@@transducer/step'](acc, step.value);

    if (acc && acc['@@transducer/reduced']) {
      acc = acc['@@transducer/value'];
      break;
    }

    step = iter.next();
  }

  return xf['@@transducer/result'](acc);
}

function _methodReduce(xf, acc, obj, methodName) {
  return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
}

var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
function _reduce(fn, acc, list) {
  if (typeof fn === 'function') {
    fn = _xwrap(fn);
  }

  if (_isArrayLike(list)) {
    return _arrayReduce(fn, acc, list);
  }

  if (typeof list['fantasy-land/reduce'] === 'function') {
    return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
  }

  if (list[symIterator] != null) {
    return _iterableReduce(fn, acc, list[symIterator]());
  }

  if (typeof list.next === 'function') {
    return _iterableReduce(fn, acc, list);
  }

  if (typeof list.reduce === 'function') {
    return _methodReduce(fn, acc, list, 'reduce');
  }

  throw new TypeError('reduce: list must be array or iterable');
}

function _has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var toString = Object.prototype.toString;

var _isArguments =
/*#__PURE__*/
function () {
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return _has('callee', x);
  };
}();

var hasEnumBug = !
/*#__PURE__*/
{
  toString: null
}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString']; // Safari bug

var hasArgsEnumBug =
/*#__PURE__*/
function () {

  return arguments.propertyIsEnumerable('length');
}();

var contains = function contains(list, item) {
  var idx = 0;

  while (idx < list.length) {
    if (list[idx] === item) {
      return true;
    }

    idx += 1;
  }

  return false;
};
/**
 * Returns a list containing the names of all the enumerable own properties of
 * the supplied object.
 * Note that the order of the output array is not guaranteed to be consistent
 * across different JS platforms.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Object
 * @sig {k: v} -> [k]
 * @param {Object} obj The object to extract properties from
 * @return {Array} An array of the object's own properties.
 * @see R.keysIn, R.values
 * @example
 *
 *      R.keys({a: 1, b: 2, c: 3}); //=> ['a', 'b', 'c']
 */


var keys = typeof Object.keys === 'function' && !hasArgsEnumBug ?
/*#__PURE__*/
_curry1(function keys(obj) {
  return Object(obj) !== obj ? [] : Object.keys(obj);
}) :
/*#__PURE__*/
_curry1(function keys(obj) {
  if (Object(obj) !== obj) {
    return [];
  }

  var prop, nIdx;
  var ks = [];

  var checkArgsLength = hasArgsEnumBug && _isArguments(obj);

  for (prop in obj) {
    if (_has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
      ks[ks.length] = prop;
    }
  }

  if (hasEnumBug) {
    nIdx = nonEnumerableProps.length - 1;

    while (nIdx >= 0) {
      prop = nonEnumerableProps[nIdx];

      if (_has(prop, obj) && !contains(ks, prop)) {
        ks[ks.length] = prop;
      }

      nIdx -= 1;
    }
  }

  return ks;
});

/**
 * Returns a single item by iterating through the list, successively calling
 * the iterator function and passing it an accumulator value and the current
 * value from the array, and then passing the result to the next call.
 *
 * The iterator function receives two values: *(acc, value)*. It may use
 * [`R.reduced`](#reduced) to shortcut the iteration.
 *
 * The arguments' order of [`reduceRight`](#reduceRight)'s iterator function
 * is *(value, acc)*.
 *
 * Note: `R.reduce` does not skip deleted or unassigned indices (sparse
 * arrays), unlike the native `Array.prototype.reduce` method. For more details
 * on this behavior, see:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce#Description
 *
 * Dispatches to the `reduce` method of the third argument, if present. When
 * doing so, it is up to the user to handle the [`R.reduced`](#reduced)
 * shortcuting, as this is not implemented by `reduce`.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig ((a, b) -> a) -> a -> [b] -> a
 * @param {Function} fn The iterator function. Receives two values, the accumulator and the
 *        current element from the array.
 * @param {*} acc The accumulator value.
 * @param {Array} list The list to iterate over.
 * @return {*} The final, accumulated value.
 * @see R.reduced, R.addIndex, R.reduceRight
 * @example
 *
 *      R.reduce(R.subtract, 0, [1, 2, 3, 4]) // => ((((0 - 1) - 2) - 3) - 4) = -10
 *      //          -               -10
 *      //         / \              / \
 *      //        -   4           -6   4
 *      //       / \              / \
 *      //      -   3   ==>     -3   3
 *      //     / \              / \
 *      //    -   2           -1   2
 *      //   / \              / \
 *      //  0   1            0   1
 *
 * @symb R.reduce(f, a, [b, c, d]) = f(f(f(a, b), c), d)
 */

var reduce$1 =
/*#__PURE__*/
_curry3(_reduce);

/**
 * Returns a function that always returns the given value. Note that for
 * non-primitives the value returned is a reference to the original value.
 *
 * This function is known as `const`, `constant`, or `K` (for K combinator) in
 * other languages and libraries.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig a -> (* -> a)
 * @param {*} val The value to wrap in a function
 * @return {Function} A Function :: * -> val.
 * @example
 *
 *      const t = R.always('Tee');
 *      t(); //=> 'Tee'
 */

var always =
/*#__PURE__*/
_curry1(function always(val) {
  return function () {
    return val;
  };
});

/**
 * Takes a value and applies a function to it.
 *
 * This function is also known as the `thrush` combinator.
 *
 * @func
 * @memberOf R
 * @since v0.25.0
 * @category Function
 * @sig a -> (a -> b) -> b
 * @param {*} x The value
 * @param {Function} f The function to apply
 * @return {*} The result of applying `f` to `x`
 * @example
 *
 *      const t42 = R.applyTo(42);
 *      t42(R.identity); //=> 42
 *      t42(R.add(1)); //=> 43
 */

var applyTo =
/*#__PURE__*/
_curry2(function applyTo(x, f) {
  return f(x);
});

/**
 * Makes a shallow clone of an object, setting or overriding the specified
 * property with the given value. Note that this copies and flattens prototype
 * properties onto the new object as well. All non-primitive properties are
 * copied by reference.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Object
 * @sig String -> a -> {k: v} -> {k: v}
 * @param {String} prop The property name to set
 * @param {*} val The new value
 * @param {Object} obj The object to clone
 * @return {Object} A new object equivalent to the original except for the changed property.
 * @see R.dissoc, R.pick
 * @example
 *
 *      R.assoc('c', 3, {a: 1, b: 2}); //=> {a: 1, b: 2, c: 3}
 */

var assoc =
/*#__PURE__*/
_curry3(function assoc(prop, val, obj) {
  var result = {};

  for (var p in obj) {
    result[p] = obj[p];
  }

  result[prop] = val;
  return result;
});

/**
 * Returns a curried equivalent of the provided function. The curried function
 * has two unusual capabilities. First, its arguments needn't be provided one
 * at a time. If `f` is a ternary function and `g` is `R.curry(f)`, the
 * following are equivalent:
 *
 *   - `g(1)(2)(3)`
 *   - `g(1)(2, 3)`
 *   - `g(1, 2)(3)`
 *   - `g(1, 2, 3)`
 *
 * Secondly, the special placeholder value [`R.__`](#__) may be used to specify
 * "gaps", allowing partial application of any combination of arguments,
 * regardless of their positions. If `g` is as above and `_` is [`R.__`](#__),
 * the following are equivalent:
 *
 *   - `g(1, 2, 3)`
 *   - `g(_, 2, 3)(1)`
 *   - `g(_, _, 3)(1)(2)`
 *   - `g(_, _, 3)(1, 2)`
 *   - `g(_, 2)(1)(3)`
 *   - `g(_, 2)(1, 3)`
 *   - `g(_, 2)(_, 3)(1)`
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (* -> a) -> (* -> a)
 * @param {Function} fn The function to curry.
 * @return {Function} A new, curried function.
 * @see R.curryN, R.partial
 * @example
 *
 *      const addFourNumbers = (a, b, c, d) => a + b + c + d;
 *
 *      const curriedAddFourNumbers = R.curry(addFourNumbers);
 *      const f = curriedAddFourNumbers(1, 2);
 *      const g = f(3);
 *      g(4); //=> 10
 */

var curry =
/*#__PURE__*/
_curry1(function curry(fn) {
  return curryN(fn.length, fn);
});

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */

var type =
/*#__PURE__*/
_curry1(function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
});

function _pipe(f, g) {
  return function () {
    return g.call(this, f.apply(this, arguments));
  };
}

/**
 * This checks whether a function has a [methodname] function. If it isn't an
 * array it will execute that function otherwise it will default to the ramda
 * implementation.
 *
 * @private
 * @param {Function} fn ramda implemtation
 * @param {String} methodname property to check for a custom implementation
 * @return {Object} Whatever the return value of the method is.
 */

function _checkForMethod(methodname, fn) {
  return function () {
    var length = arguments.length;

    if (length === 0) {
      return fn();
    }

    var obj = arguments[length - 1];
    return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
  };
}

/**
 * Returns the elements of the given list or string (or object with a `slice`
 * method) from `fromIndex` (inclusive) to `toIndex` (exclusive).
 *
 * Dispatches to the `slice` method of the third argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.4
 * @category List
 * @sig Number -> Number -> [a] -> [a]
 * @sig Number -> Number -> String -> String
 * @param {Number} fromIndex The start index (inclusive).
 * @param {Number} toIndex The end index (exclusive).
 * @param {*} list
 * @return {*}
 * @example
 *
 *      R.slice(1, 3, ['a', 'b', 'c', 'd']);        //=> ['b', 'c']
 *      R.slice(1, Infinity, ['a', 'b', 'c', 'd']); //=> ['b', 'c', 'd']
 *      R.slice(0, -1, ['a', 'b', 'c', 'd']);       //=> ['a', 'b', 'c']
 *      R.slice(-3, -1, ['a', 'b', 'c', 'd']);      //=> ['b', 'c']
 *      R.slice(0, 3, 'ramda');                     //=> 'ram'
 */

var slice =
/*#__PURE__*/
_curry3(
/*#__PURE__*/
_checkForMethod('slice', function slice(fromIndex, toIndex, list) {
  return Array.prototype.slice.call(list, fromIndex, toIndex);
}));

/**
 * Returns all but the first element of the given list or string (or object
 * with a `tail` method).
 *
 * Dispatches to the `slice` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {*} list
 * @return {*}
 * @see R.head, R.init, R.last
 * @example
 *
 *      R.tail([1, 2, 3]);  //=> [2, 3]
 *      R.tail([1, 2]);     //=> [2]
 *      R.tail([1]);        //=> []
 *      R.tail([]);         //=> []
 *
 *      R.tail('abc');  //=> 'bc'
 *      R.tail('ab');   //=> 'b'
 *      R.tail('a');    //=> ''
 *      R.tail('');     //=> ''
 */

var tail =
/*#__PURE__*/
_curry1(
/*#__PURE__*/
_checkForMethod('tail',
/*#__PURE__*/
slice(1, Infinity)));

/**
 * Performs left-to-right function composition. The first argument may have
 * any arity; the remaining arguments must be unary.
 *
 * In some libraries this function is named `sequence`.
 *
 * **Note:** The result of pipe is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig (((a, b, ..., n) -> o), (o -> p), ..., (x -> y), (y -> z)) -> ((a, b, ..., n) -> z)
 * @param {...Function} functions
 * @return {Function}
 * @see R.compose
 * @example
 *
 *      const f = R.pipe(Math.pow, R.negate, R.inc);
 *
 *      f(3, 4); // -(3^4) + 1
 * @symb R.pipe(f, g, h)(a, b) = h(g(f(a, b)))
 */

function pipe() {
  if (arguments.length === 0) {
    throw new Error('pipe requires at least one argument');
  }

  return _arity(arguments[0].length, reduce$1(_pipe, arguments[0], tail(arguments)));
}

/**
 * Returns a new list or string with the elements or characters in reverse
 * order.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category List
 * @sig [a] -> [a]
 * @sig String -> String
 * @param {Array|String} list
 * @return {Array|String}
 * @example
 *
 *      R.reverse([1, 2, 3]);  //=> [3, 2, 1]
 *      R.reverse([1, 2]);     //=> [2, 1]
 *      R.reverse([1]);        //=> [1]
 *      R.reverse([]);         //=> []
 *
 *      R.reverse('abc');      //=> 'cba'
 *      R.reverse('ab');       //=> 'ba'
 *      R.reverse('a');        //=> 'a'
 *      R.reverse('');         //=> ''
 */

var reverse =
/*#__PURE__*/
_curry1(function reverse(list) {
  return _isString(list) ? list.split('').reverse().join('') : Array.prototype.slice.call(list, 0).reverse();
});

/**
 * Performs right-to-left function composition. The last argument may have
 * any arity; the remaining arguments must be unary.
 *
 * **Note:** The result of compose is not automatically curried.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Function
 * @sig ((y -> z), (x -> y), ..., (o -> p), ((a, b, ..., n) -> o)) -> ((a, b, ..., n) -> z)
 * @param {...Function} ...functions The functions to compose
 * @return {Function}
 * @see R.pipe
 * @example
 *
 *      const classyGreeting = (firstName, lastName) => "The name's " + lastName + ", " + firstName + " " + lastName
 *      const yellGreeting = R.compose(R.toUpper, classyGreeting);
 *      yellGreeting('James', 'Bond'); //=> "THE NAME'S BOND, JAMES BOND"
 *
 *      R.compose(Math.abs, R.add(1), R.multiply(2))(-4) //=> 7
 *
 * @symb R.compose(f, g, h)(a, b) = f(g(h(a, b)))
 */

function compose$1() {
  if (arguments.length === 0) {
    throw new Error('compose requires at least one argument');
  }

  return pipe.apply(this, reverse(arguments));
}

function _arrayFromIterator(iter) {
  var list = [];
  var next;

  while (!(next = iter.next()).done) {
    list.push(next.value);
  }

  return list;
}

function _includesWith(pred, x, list) {
  var idx = 0;
  var len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }

    idx += 1;
  }

  return false;
}

function _functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function _objectIs(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
}

const _objectIs$1 = typeof Object.is === 'function' ? Object.is : _objectIs;

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
  var a = _arrayFromIterator(aIterator);

  var b = _arrayFromIterator(bIterator);

  function eq(_a, _b) {
    return _equals(_a, _b, stackA.slice(), stackB.slice());
  } // if *a* array contains any element that is not included in *b*


  return !_includesWith(function (b, aItem) {
    return !_includesWith(eq, aItem, b);
  }, b, a);
}

function _equals(a, b, stackA, stackB) {
  if (_objectIs$1(a, b)) {
    return true;
  }

  var typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (a == null || b == null) {
    return false;
  }

  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && _functionName(a.constructor) === 'Promise') {
        return a === b;
      }

      break;

    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && _objectIs$1(a.valueOf(), b.valueOf()))) {
        return false;
      }

      break;

    case 'Date':
      if (!_objectIs$1(a.valueOf(), b.valueOf())) {
        return false;
      }

      break;

    case 'Error':
      return a.name === b.name && a.message === b.message;

    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }

      break;
  }

  var idx = stackA.length - 1;

  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }

    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));

    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));

    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;

    default:
      // Values of other types are only equal if identical.
      return false;
  }

  var keysA = keys(a);

  if (keysA.length !== keys(b).length) {
    return false;
  }

  var extendedStackA = stackA.concat([a]);
  var extendedStackB = stackB.concat([b]);
  idx = keysA.length - 1;

  while (idx >= 0) {
    var key = keysA[idx];

    if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
      return false;
    }

    idx -= 1;
  }

  return true;
}

/**
 * Returns `true` if its arguments are equivalent, `false` otherwise. Handles
 * cyclical data structures.
 *
 * Dispatches symmetrically to the `equals` methods of both arguments, if
 * present.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> b -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      R.equals(1, 1); //=> true
 *      R.equals(1, '1'); //=> false
 *      R.equals([1, 2, 3], [1, 2, 3]); //=> true
 *
 *      const a = {}; a.v = a;
 *      const b = {}; b.v = b;
 *      R.equals(a, b); //=> true
 */

var equals =
/*#__PURE__*/
_curry2(function equals(a, b) {
  return _equals(a, b, [], []);
});

function _indexOf(list, a, idx) {
  var inf, item; // Array.prototype.indexOf doesn't exist below IE9

  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;

          while (idx < list.length) {
            item = list[idx];

            if (item === 0 && 1 / item === inf) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];

            if (typeof item === 'number' && item !== item) {
              return idx;
            }

            idx += 1;
          }

          return -1;
        } // non-zero numbers can utilise Set


        return list.indexOf(a, idx);
      // all these types can utilise Set

      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);

      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }

    }
  } // anything else not covered above, defer to R.equals


  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }

    idx += 1;
  }

  return -1;
}

function _includes(a, list) {
  return _indexOf(list, a, 0) >= 0;
}

function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

var _Set =
/*#__PURE__*/
function () {
  function _Set() {
    /* globals Set */
    this._nativeSet = typeof Set === 'function' ? new Set() : null;
    this._items = {};
  }

  // until we figure out why jsdoc chokes on this
  // @param item The item to add to the Set
  // @returns {boolean} true if the item did not exist prior, otherwise false
  //
  _Set.prototype.add = function (item) {
    return !hasOrAdd(item, true, this);
  }; //
  // @param item The item to check for existence in the Set
  // @returns {boolean} true if the item exists in the Set, otherwise false
  //


  _Set.prototype.has = function (item) {
    return hasOrAdd(item, false, this);
  }; //
  // Combines the logic for checking whether an item is a member of the set and
  // for adding a new item to the set.
  //
  // @param item       The item to check or add to the Set instance.
  // @param shouldAdd  If true, the item will be added to the set if it doesn't
  //                   already exist.
  // @param set        The set instance to check or add to.
  // @return {boolean} true if the item already existed, otherwise false.
  //


  return _Set;
}();

function hasOrAdd(item, shouldAdd, set) {
  var type = typeof item;
  var prevSize, newSize;

  switch (type) {
    case 'string':
    case 'number':
      // distinguish between +0 and -0
      if (item === 0 && 1 / item === -Infinity) {
        if (set._items['-0']) {
          return true;
        } else {
          if (shouldAdd) {
            set._items['-0'] = true;
          }

          return false;
        }
      } // these types can all utilise the native Set


      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;

          set._nativeSet.add(item);

          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = {};
            set._items[type][item] = true;
          }

          return false;
        } else if (item in set._items[type]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][item] = true;
          }

          return false;
        }
      }

    case 'boolean':
      // set._items['boolean'] holds a two element array
      // representing [ falseExists, trueExists ]
      if (type in set._items) {
        var bIdx = item ? 1 : 0;

        if (set._items[type][bIdx]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type][bIdx] = true;
          }

          return false;
        }
      } else {
        if (shouldAdd) {
          set._items[type] = item ? [false, true] : [true, false];
        }

        return false;
      }

    case 'function':
      // compare functions for reference equality
      if (set._nativeSet !== null) {
        if (shouldAdd) {
          prevSize = set._nativeSet.size;

          set._nativeSet.add(item);

          newSize = set._nativeSet.size;
          return newSize === prevSize;
        } else {
          return set._nativeSet.has(item);
        }
      } else {
        if (!(type in set._items)) {
          if (shouldAdd) {
            set._items[type] = [item];
          }

          return false;
        }

        if (!_includes(item, set._items[type])) {
          if (shouldAdd) {
            set._items[type].push(item);
          }

          return false;
        }

        return true;
      }

    case 'undefined':
      if (set._items[type]) {
        return true;
      } else {
        if (shouldAdd) {
          set._items[type] = true;
        }

        return false;
      }

    case 'object':
      if (item === null) {
        if (!set._items['null']) {
          if (shouldAdd) {
            set._items['null'] = true;
          }

          return false;
        }

        return true;
      }

    /* falls through */

    default:
      // reduce the search size of heterogeneous sets by creating buckets
      // for each type.
      type = Object.prototype.toString.call(item);

      if (!(type in set._items)) {
        if (shouldAdd) {
          set._items[type] = [item];
        }

        return false;
      } // scan through all previously applied items


      if (!_includes(item, set._items[type])) {
        if (shouldAdd) {
          set._items[type].push(item);
        }

        return false;
      }

      return true;
  }
} // A simple Set type that honours R.equals semantics

/**
 * Finds the set (i.e. no duplicates) of all elements in the first list not
 * contained in the second list. Objects and Arrays are compared in terms of
 * value equality, not reference equality.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig [*] -> [*] -> [*]
 * @param {Array} list1 The first list.
 * @param {Array} list2 The second list.
 * @return {Array} The elements in `list1` that are not in `list2`.
 * @see R.differenceWith, R.symmetricDifference, R.symmetricDifferenceWith, R.without
 * @example
 *
 *      R.difference([1,2,3,4], [7,6,5,4,3]); //=> [1,2]
 *      R.difference([7,6,5,4,3], [1,2,3,4]); //=> [7,6,5]
 *      R.difference([{a: 1}, {b: 2}], [{a: 1}, {c: 3}]) //=> [{b: 2}]
 */

var difference =
/*#__PURE__*/
_curry2(function difference(first, second) {
  var out = [];
  var idx = 0;
  var firstLen = first.length;
  var secondLen = second.length;
  var toFilterOut = new _Set();

  for (var i = 0; i < secondLen; i += 1) {
    toFilterOut.add(second[i]);
  }

  while (idx < firstLen) {
    if (toFilterOut.add(first[idx])) {
      out[out.length] = first[idx];
    }

    idx += 1;
  }

  return out;
});

/**
 * Returns the empty value of its argument's type. Ramda defines the empty
 * value of Array (`[]`), Object (`{}`), String (`''`), and Arguments. Other
 * types are supported if they define `<Type>.empty`,
 * `<Type>.prototype.empty` or implement the
 * [FantasyLand Monoid spec](https://github.com/fantasyland/fantasy-land#monoid).
 *
 * Dispatches to the `empty` method of the first argument, if present.
 *
 * @func
 * @memberOf R
 * @since v0.3.0
 * @category Function
 * @sig a -> a
 * @param {*} x
 * @return {*}
 * @example
 *
 *      R.empty(Just(42));      //=> Nothing()
 *      R.empty([1, 2, 3]);     //=> []
 *      R.empty('unicorns');    //=> ''
 *      R.empty({x: 1, y: 2});  //=> {}
 */

var empty$1 =
/*#__PURE__*/
_curry1(function empty(x) {
  return x != null && typeof x['fantasy-land/empty'] === 'function' ? x['fantasy-land/empty']() : x != null && x.constructor != null && typeof x.constructor['fantasy-land/empty'] === 'function' ? x.constructor['fantasy-land/empty']() : x != null && typeof x.empty === 'function' ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === 'function' ? x.constructor.empty() : _isArray(x) ? [] : _isString(x) ? '' : _isObject(x) ? {} : _isArguments(x) ? function () {
    return arguments;
  }() : void 0 // else
  ;
});

/**
 * Returns true if its arguments are identical, false otherwise. Values are
 * identical if they reference the same memory. `NaN` is identical to `NaN`;
 * `0` and `-0` are not identical.
 *
 * Note this is merely a curried version of ES6 `Object.is`.
 *
 * @func
 * @memberOf R
 * @since v0.15.0
 * @category Relation
 * @sig a -> a -> Boolean
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 * @example
 *
 *      const o = {};
 *      R.identical(o, o); //=> true
 *      R.identical(1, 1); //=> true
 *      R.identical(1, '1'); //=> false
 *      R.identical([], []); //=> false
 *      R.identical(0, -0); //=> false
 *      R.identical(NaN, NaN); //=> true
 */

var identical =
/*#__PURE__*/
_curry2(_objectIs$1);

/**
 * Returns `true` if the given value is its type's empty value; `false`
 * otherwise.
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Logic
 * @sig a -> Boolean
 * @param {*} x
 * @return {Boolean}
 * @see R.empty
 * @example
 *
 *      R.isEmpty([1, 2, 3]);   //=> false
 *      R.isEmpty([]);          //=> true
 *      R.isEmpty('');          //=> true
 *      R.isEmpty(null);        //=> false
 *      R.isEmpty({});          //=> true
 *      R.isEmpty({length: 0}); //=> false
 */

var isEmpty =
/*#__PURE__*/
_curry1(function isEmpty(x) {
  return x != null && equals(x, empty$1(x));
});

/**
 * Returns `true` if the specified object property is equal, in
 * [`R.equals`](#equals) terms, to the given value; `false` otherwise.
 * You can test multiple properties with [`R.whereEq`](#whereEq).
 *
 * @func
 * @memberOf R
 * @since v0.1.0
 * @category Relation
 * @sig String -> a -> Object -> Boolean
 * @param {String} name
 * @param {*} val
 * @param {*} obj
 * @return {Boolean}
 * @see R.whereEq, R.propSatisfies, R.equals
 * @example
 *
 *      const abby = {name: 'Abby', age: 7, hair: 'blond'};
 *      const fred = {name: 'Fred', age: 12, hair: 'brown'};
 *      const rusty = {name: 'Rusty', age: 10, hair: 'brown'};
 *      const alois = {name: 'Alois', age: 15, disposition: 'surly'};
 *      const kids = [abby, fred, rusty, alois];
 *      const hasBrownHair = R.propEq('hair', 'brown');
 *      R.filter(hasBrownHair, kids); //=> [fred, rusty]
 */

var propEq =
/*#__PURE__*/
_curry3(function propEq(name, val, obj) {
  return equals(val, obj[name]);
});

/**
 * on-screen-keyboard-detector: oskd-ios.js
 *
 * Created by Matthias Seemann on 28.04.2020.
 */

const
	isVisualViewportSupported = "visualViewport" in window;

function isSupported() {
	 return isVisualViewportSupported;
}

const skipDuplicates = whenDifferent => {
	var previous = "_one_time_initial_";
	return function (next) {
		if (next !== previous) {
			previous = next;
			whenDifferent(next);
		}
	};
};

/**
 *
 * @param {function(String)} callback
 * @return {function(): void}
 */
// initWithCallback :: (String -> *) -> (... -> undefined)
function subscribe(callback) {
	if (!isSupported()) {
		console.warn("On-Screen-Keyboard detection not supported on this version of iOS");
		return () => undefined;
	}
	
	const
		nonRepeatingCallback = skipDuplicates(callback),
	
		onResize = evt => {
			nonRepeatingCallback(evt.target.height === window.innerHeight ? 'hidden' : 'visible');
		};
	
	visualViewport.addEventListener('resize', onResize);
	
	return function(){ visualViewport.removeEventListener('resize', onResize); };
}

/**
 * onscreen-keyboard-detector: osk-detector.js
 *
 * Created by Matthias Seemann on 21.03.2020.
 */

const
	isiOS = /iPhone/.test(navigator.userAgent),

	getScreenOrientationType = () =>
		screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape',
	
	// rejectCapture :: Stream Boolean -> Stream a -> Stream a
	rejectCapture = curry(compose$1(join, snapshot$$1((valveValue, event) => valveValue ? empty() : now(event)))),

	isAnyElementActive = () => document.activeElement && (document.activeElement !== document.body);

function isSupported$1() {
	if (isiOS) {
		return isSupported();
	}
	
	return true;
}

/**
 *
 * @param {function(String)} userCallback
 * @return {function(): void}
 */
// initWithCallback :: (String -> *) -> (... -> undefined)
function initWithCallback(userCallback) {
	if(isiOS) {
		return subscribe(userCallback);
	}
	
	const
		INPUT_ELEMENT_FOCUS_JUMP_DELAY = 700,
		SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY = 700,
		RESIZE_QUIET_PERIOD = 500,
		LAYOUT_RESIZE_TO_LAYOUT_HEIGHT_FIX_DELAY =
			Math.max(INPUT_ELEMENT_FOCUS_JUMP_DELAY, SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY) - RESIZE_QUIET_PERIOD + 200,
		
		[ induceUnsubscribe, userUnsubscription ] = createAdapter(),
		scheduler = newDefaultScheduler(),
		
		// assumes initially hidden OSK
		initialLayoutHeight = window.innerHeight,
		// assumes initially hidden OSK
		approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight,
		
		focus =
			merge$$1(focusin(document.documentElement), focusout(document.documentElement)),
		
		documentVisibility =
			applyTo(domEvent('visibilitychange', document))(pipe(
				map$1(() => document.visibilityState),
				startWith$$1(document.visibilityState)
			)),
		
		isUnfocused =
			applyTo(focus)(pipe(
				map$1(evt =>
					evt.type === 'focusin' ? now(false) : at(INPUT_ELEMENT_FOCUS_JUMP_DELAY, true)
				),
				switchLatest,
				startWith$$1(!isAnyElementActive()),
				skipRepeats,
				multicast
			)),
		
		layoutHeightOnOSKFreeOrientationChange =
			applyTo(change(screen.orientation))(pipe(
				// The 'change' event hits very early BEFORE window.innerHeight is updated (e.g. on "resize")
				snapshot$$1(
					unfocused => unfocused || (window.innerHeight === initialLayoutHeight),
					isUnfocused
				),
				debounce$$1(SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY),
				map$1(isOSKFree => ({
					screenOrientation: getScreenOrientationType(),
					height: isOSKFree ? window.innerHeight : screen.availHeight - approximateBrowserToolbarHeight
				}))
			)),
		
		layoutHeightOnUnfocus =
			applyTo(isUnfocused)(pipe(
				filter$$1(identical(true)),
				map$1(() => ({screenOrientation: getScreenOrientationType(), height: window.innerHeight}))
			)),
		
		// Difficulties: The exact layout height in the perpendicular orientation is only to determine on orientation change,
		// Orientation change can happen:
		// - entirely unfocused,
		// - focused but w/o OSK, or
		// - with OSK.
		// Thus on arriving in the new orientation, until complete unfocus, it is uncertain what the current window.innerHeight value means
		
		// Solution?: Assume initially hidden OSK (even if any input has the "autofocus" attribute),
		// and initialize other dimension with screen.availWidth
		// so there can always be made a decision on the keyboard.
		layoutHeights =
			// Ignores source streams while documentVisibility is 'hidden'
			// sadly visibilitychange comes 1 sec after focusout!
			applyTo(mergeArray([layoutHeightOnUnfocus, layoutHeightOnOSKFreeOrientationChange]))(pipe(
				delay$1(1000),
				rejectCapture(map$1(equals("hidden"), documentVisibility)),
				scan$$1(
					(accHeights, {screenOrientation, height}) =>
						assoc(screenOrientation, height, accHeights),
					{
						[getScreenOrientationType()]: window.innerHeight
					}
				),
				skipAfter$$1(compose$1(isEmpty, difference(['portrait', 'landscape']), keys))
			)),
		
		layoutHeightOnVerticalResize =
			applyTo(resize(window))(pipe(
				debounce$$1(RESIZE_QUIET_PERIOD),
				map$1(evt => ({ width: evt.target.innerWidth, height: evt.target.innerHeight})),
				scan$$1(
					(prev, size) =>
						({
							...size,
							isJustHeightResize: prev.width === size.width,
							dH: size.height - prev.height
						}),
					{
						width: window.innerWidth,
						height: window.innerHeight,
						isJustHeightResize: false,
						dH: 0
					}
				),
				filter$$1(propEq('isJustHeightResize', true))
			)),
		
		osk =
			applyTo(layoutHeightOnVerticalResize)(pipe(
				delay$1(LAYOUT_RESIZE_TO_LAYOUT_HEIGHT_FIX_DELAY),
				snapshot$$1(
					(layoutHeightByOrientation, {height, dH}) => {
						const
							nonOSKLayoutHeight = layoutHeightByOrientation[getScreenOrientationType()];
						
						if (!nonOSKLayoutHeight) {
							return (dH > 0.1 * screen.availHeight) ? now("hidden")
								: (dH < -0.1 * screen.availHeight) ? now("visible")
									: empty();
						}
						
						return (height < 0.9 * nonOSKLayoutHeight) && (dH < 0) ? now("visible")
							: (height === nonOSKLayoutHeight) && (dH > 0) ? now("hidden")
							: empty();
					},
					layoutHeights
				),
				join,
				merge$$1(applyTo(isUnfocused)(pipe(
					filter$$1(identical(true)),
					map$1(always("hidden"))
				))),
				until$$1(userUnsubscription),
				skipRepeats
			));
	
	runEffects$$1(tap$$1(userCallback, osk), scheduler);
	
	return induceUnsubscribe;
}

export { isSupported$1 as isSupported, initWithCallback as subscribe };
