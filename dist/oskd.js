/* @license
	On-screen keyboard detector (OSKD) v.2.3.0
	(c) 2020-2021 Matthias Seemann
	OSKD may be freely distributed under the MIT license.
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.OSKD = {}));
}(this, (function (exports) { 'use strict';

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * a with x appended
     */
    function append(x, a) {
        var l = a.length;
        var b = new Array(l + 1);
        for (var i = 0; i < l; ++i) {
            b[i] = a[i];
        }
        b[l] = x;
        return b;
    }
    /**
     * transform each element with f
     */
    function map(f, a) {
        var l = a.length;
        var b = new Array(l);
        for (var i = 0; i < l; ++i) {
            b[i] = f(a[i]);
        }
        return b;
    }
    /**
     * accumulate via left-fold
     */
    function reduce(f, z, a) {
        var r = z;
        for (var i = 0, l = a.length; i < l; ++i) {
            r = f(r, a[i], i);
        }
        return r;
    }
    /**
     * remove element at index
     * @throws
     */
    function remove(i, a) {
        if (i < 0) {
            throw new TypeError('i must be >= 0');
        }
        var l = a.length;
        if (l === 0 || i >= l) { // exit early if index beyond end of array
            return a;
        }
        if (l === 1) { // exit early if index in bounds and length === 1
            return [];
        }
        return unsafeRemove(i, a, l - 1);
    }
    /**
     * Internal helper to remove element at index
     */
    function unsafeRemove(i, a, l) {
        var b = new Array(l);
        var j;
        for (j = 0; j < i; ++j) {
            b[j] = a[j];
        }
        for (j = i; j < l; ++j) {
            b[j] = a[j + 1];
        }
        return b;
    }
    /**
     * find index of x in a, from the left
     */
    function findIndex(x, a) {
        for (var i = 0, l = a.length; i < l; ++i) {
            if (x === a[i]) {
                return i;
            }
        }
        return -1;
    }

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var id = function (x) { return x; };
    var compose = function (f, g) { return function (x) { return f(g(x)); }; };
    function curry2(f) {
        function curried(a, b) {
            switch (arguments.length) {
                case 0: return curried;
                case 1: return function (b) { return f(a, b); };
                default: return f(a, b);
            }
        }
        return curried;
    }
    function curry3(f) {
        function curried(a, b, c) {
            switch (arguments.length) {
                case 0: return curried;
                case 1: return curry2(function (b, c) { return f(a, b, c); });
                case 2: return function (c) { return f(a, b, c); };
                default: return f(a, b, c);
            }
        }
        return curried;
    }

    var RelativeScheduler = /** @class */ (function () {
        function RelativeScheduler(origin, scheduler) {
            this.origin = origin;
            this.scheduler = scheduler;
        }
        RelativeScheduler.prototype.currentTime = function () {
            return this.scheduler.currentTime() - this.origin;
        };
        RelativeScheduler.prototype.scheduleTask = function (localOffset, delay, period, task) {
            return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
        };
        RelativeScheduler.prototype.relative = function (origin) {
            return new RelativeScheduler(origin + this.origin, this.scheduler);
        };
        RelativeScheduler.prototype.cancel = function (task) {
            return this.scheduler.cancel(task);
        };
        RelativeScheduler.prototype.cancelAll = function (f) {
            return this.scheduler.cancelAll(f);
        };
        return RelativeScheduler;
    }());

    /**
     * Read the current time from the provided Scheduler
     */
    var currentTime = function (scheduler) {
        return scheduler.currentTime();
    };
    /**
     * Schedule a task to run as soon as possible, but
     * not in the current call stack
     */
    var asap = curry2(function (task, scheduler) {
        return scheduler.scheduleTask(0, 0, -1, task);
    });
    /**
     * Schedule a task to run after a millisecond delay
     */
    var delay = curry3(function (delay, task, scheduler) {
        return scheduler.scheduleTask(0, delay, -1, task);
    });
    /**
     * Cancel a scheduledTask
     */
    var cancelTask = function (scheduledTask) {
        return scheduledTask.dispose();
    };

    var schedulerRelativeTo = curry2(function (offset, scheduler) {
        return new RelativeScheduler(offset, scheduler);
    });

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * a with x appended
     */
    function append$1(x, a) {
        var l = a.length;
        var b = new Array(l + 1);
        for (var i = 0; i < l; ++i) {
            b[i] = a[i];
        }
        b[l] = x;
        return b;
    }
    /**
     * Concats two `ArrayLike`s
     */
    function concat(a, b) {
        var al = a.length;
        var bl = b.length;
        var r = new Array(al + bl);
        var i = 0;
        for (i = 0; i < al; i++) {
            r[i] = a[i];
        }
        for (var j = 0; j < bl; j++) {
            r[i++] = b[j];
        }
        return r;
    }
    /**
     * accumulate via left-fold
     */
    function reduce$1(f, z, a) {
        var r = z;
        for (var i = 0, l = a.length; i < l; ++i) {
            r = f(r, a[i], i);
        }
        return r;
    }
    function curry2$1(f) {
        function curried(a, b) {
            switch (arguments.length) {
                case 0: return curried;
                case 1: return function (b) { return f(a, b); };
                default: return f(a, b);
            }
        }
        return curried;
    }
    function curry3$1(f) {
        function curried(a, b, c) {
            switch (arguments.length) {
                case 0: return curried;
                case 1: return curry2$1(function (b, c) { return f(a, b, c); });
                case 2: return function (c) { return f(a, b, c); };
                default: return f(a, b, c);
            }
        }
        return curried;
    }

    var disposeNone = function () { return NONE; };
    var NONE = new (/** @class */ (function () {
        function DisposeNone() {
        }
        DisposeNone.prototype.dispose = function () { };
        return DisposeNone;
    }()))();
    var isDisposeNone = function (d) {
        return d === NONE;
    };

    /**
     * Wrap an existing disposable (which may not already have been once()d)
     * so that it will only dispose its underlying resource at most once.
     */
    var disposeOnce = function (disposable) {
        return new DisposeOnce(disposable);
    };
    var DisposeOnce = /** @class */ (function () {
        function DisposeOnce(disposable) {
            this.disposed = false;
            this.disposable = disposable;
        }
        DisposeOnce.prototype.dispose = function () {
            if (!this.disposed) {
                this.disposed = true;
                if (this.disposable) {
                    this.disposable.dispose();
                    this.disposable = undefined;
                }
            }
        };
        return DisposeOnce;
    }());

    /** @license MIT License (c) copyright 2010 original author or authors */
    /**
     * Aggregate a list of disposables into a DisposeAll
     */
    var disposeAll = function (ds) {
        var merged = reduce$1(merge, [], ds);
        return merged.length === 0 ? disposeNone() : new DisposeAll(merged);
    };
    /**
     * Convenience to aggregate 2 disposables
     */
    var disposeBoth = curry2$1(function (d1, d2) {
        return disposeAll([d1, d2]);
    });
    var merge = function (ds, d) {
        return isDisposeNone(d) ? ds
            : d instanceof DisposeAll ? concat(ds, d.disposables)
                : append$1(d, ds);
    };
    var DisposeAll = /** @class */ (function () {
        function DisposeAll(disposables) {
            this.disposables = disposables;
        }
        DisposeAll.prototype.dispose = function () {
            throwIfErrors(disposeCollectErrors(this.disposables));
        };
        return DisposeAll;
    }());
    /**
     * Dispose all, safely collecting errors into an array
     */
    var disposeCollectErrors = function (disposables) {
        return reduce$1(appendIfError, [], disposables);
    };
    /**
     * Call dispose and if throws, append thrown error to errors
     */
    var appendIfError = function (errors, d) {
        try {
            d.dispose();
        }
        catch (e) {
            errors.push(e);
        }
        return errors;
    };
    /**
     * Throw DisposeAllError if errors is non-empty
     * @throws
     */
    var throwIfErrors = function (errors) {
        if (errors.length > 0) {
            throw new DisposeAllError(errors.length + " errors", errors);
        }
    };
    var DisposeAllError = /** @class */ (function () {
        function DisposeAllError(message, errors) {
            this.name = 'DisposeAllError';
            this.message = message;
            this.errors = errors;
            Error.call(this, message);
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, DisposeAllError);
            }
            this.stack = "" + this.stack + formatErrorStacks(this.errors);
        }
        return DisposeAllError;
    }());
    DisposeAllError.prototype = Object.create(Error.prototype);
    var formatErrorStacks = function (errors) {
        return reduce$1(formatErrorStack, '', errors);
    };
    var formatErrorStack = function (s, e, i) {
        return s + ("\n[" + (i + 1) + "] " + e.stack);
    };

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    // Try to dispose the disposable.  If it throws, send
    // the error to sink.error with the provided Time value
    var tryDispose = curry3$1(function (t, disposable, sink) {
        try {
            disposable.dispose();
        }
        catch (e) {
            sink.error(t, e);
        }
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /** @author Brian Cavalier */
    /** @author John Hann */
    function fatalError(e) {
        setTimeout(rethrow, 0, e);
    }
    function rethrow(e) {
        throw e;
    }

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var propagateTask = function (run, value, sink) { return new PropagateRunEventTask(run, value, sink); };
    var propagateEventTask = function (value, sink) { return new PropagateEventTask(value, sink); };
    var propagateEndTask = function (sink) { return new PropagateEndTask(sink); };
    var PropagateTask = /** @class */ (function () {
        function PropagateTask(sink) {
            this.sink = sink;
            this.active = true;
        }
        PropagateTask.prototype.dispose = function () {
            this.active = false;
        };
        PropagateTask.prototype.run = function (t) {
            if (!this.active) {
                return;
            }
            this.runIfActive(t);
        };
        PropagateTask.prototype.error = function (t, e) {
            // TODO: Remove this check and just do this.sink.error(t, e)?
            if (!this.active) {
                return fatalError(e);
            }
            this.sink.error(t, e);
        };
        return PropagateTask;
    }());
    var PropagateRunEventTask = /** @class */ (function (_super) {
        __extends(PropagateRunEventTask, _super);
        function PropagateRunEventTask(runEvent, value, sink) {
            var _this = _super.call(this, sink) || this;
            _this.runEvent = runEvent;
            _this.value = value;
            return _this;
        }
        PropagateRunEventTask.prototype.runIfActive = function (t) {
            this.runEvent(t, this.value, this.sink);
        };
        return PropagateRunEventTask;
    }(PropagateTask));
    var PropagateEventTask = /** @class */ (function (_super) {
        __extends(PropagateEventTask, _super);
        function PropagateEventTask(value, sink) {
            var _this = _super.call(this, sink) || this;
            _this.value = value;
            return _this;
        }
        PropagateEventTask.prototype.runIfActive = function (t) {
            this.sink.event(t, this.value);
        };
        return PropagateEventTask;
    }(PropagateTask));
    var PropagateEndTask = /** @class */ (function (_super) {
        __extends(PropagateEndTask, _super);
        function PropagateEndTask() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PropagateEndTask.prototype.runIfActive = function (t) {
            this.sink.end(t);
        };
        return PropagateEndTask;
    }(PropagateTask));
    var PropagateErrorTask = /** @class */ (function (_super) {
        __extends(PropagateErrorTask, _super);
        function PropagateErrorTask(value, sink) {
            var _this = _super.call(this, sink) || this;
            _this.value = value;
            return _this;
        }
        PropagateErrorTask.prototype.runIfActive = function (t) {
            this.sink.error(t, this.value);
        };
        return PropagateErrorTask;
    }(PropagateTask));

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var empty = function () { return EMPTY; };
    var isCanonicalEmpty = function (stream) {
        return stream === EMPTY;
    };
    var Empty = /** @class */ (function () {
        function Empty() {
        }
        Empty.prototype.run = function (sink, scheduler) {
            return asap(propagateEndTask(sink), scheduler);
        };
        return Empty;
    }());
    var EMPTY = new Empty();

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var at = function (t, x) { return new At(t, x); };
    var At = /** @class */ (function () {
        function At(t, x) {
            this.time = t;
            this.value = x;
        }
        At.prototype.run = function (sink, scheduler) {
            return delay(this.time, propagateTask(runAt, this.value, sink), scheduler);
        };
        return At;
    }());
    function runAt(t, x, sink) {
        sink.event(t, x);
        sink.end(t);
    }

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var now = function (x) { return at(0, x); };

    var SettableDisposable = /** @class */ (function () {
        function SettableDisposable() {
            this.disposable = undefined;
            this.disposed = false;
        }
        SettableDisposable.prototype.setDisposable = function (disposable) {
            if (this.disposable !== undefined) {
                throw new Error('setDisposable called more than once');
            }
            this.disposable = disposable;
            if (this.disposed) {
                disposable.dispose();
            }
        };
        SettableDisposable.prototype.dispose = function () {
            if (this.disposed) {
                return;
            }
            this.disposed = true;
            if (this.disposable !== undefined) {
                this.disposable.dispose();
            }
        };
        return SettableDisposable;
    }());

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var runEffects = curry2(function (stream, scheduler) {
        return new Promise(function (resolve, reject) {
            return runStream(stream, scheduler, resolve, reject);
        });
    });
    function runStream(stream, scheduler, resolve, reject) {
        var disposable = new SettableDisposable();
        var observer = new RunEffectsSink(resolve, reject, disposable);
        disposable.setDisposable(stream.run(observer, scheduler));
    }
    var RunEffectsSink = /** @class */ (function () {
        function RunEffectsSink(end, error, disposable) {
            this._end = end;
            this._error = error;
            this._disposable = disposable;
            this.active = true;
        }
        RunEffectsSink.prototype.event = function () { };
        RunEffectsSink.prototype.end = function () {
            if (!this.active) {
                return;
            }
            this.dispose(this._error, this._end, undefined);
        };
        RunEffectsSink.prototype.error = function (_t, e) {
            this.dispose(this._error, this._error, e);
        };
        RunEffectsSink.prototype.dispose = function (error, end, x) {
            this.active = false;
            tryDispose$1(error, end, x, this._disposable);
        };
        return RunEffectsSink;
    }());
    function tryDispose$1(error, end, x, disposable) {
        try {
            disposable.dispose();
        }
        catch (e) {
            error(e);
            return;
        }
        end(x);
    }

    /**
     * Run a Stream, sending all its events to the provided Sink.
     */
    var run = function (sink, scheduler, stream) {
        return stream.run(sink, scheduler);
    };

    var RelativeSink = /** @class */ (function () {
        function RelativeSink(offset, sink) {
            this.sink = sink;
            this.offset = offset;
        }
        RelativeSink.prototype.event = function (t, x) {
            this.sink.event(t + this.offset, x);
        };
        RelativeSink.prototype.error = function (t, e) {
            this.sink.error(t + this.offset, e);
        };
        RelativeSink.prototype.end = function (t) {
            this.sink.end(t + this.offset);
        };
        return RelativeSink;
    }());

    /**
     * Create a stream with its own local clock
     * This transforms time from the provided scheduler's clock to a stream-local
     * clock (which starts at 0), and then *back* to the scheduler's clock before
     * propagating events to sink.  In other words, upstream sources will see local times,
     * and downstream sinks will see non-local (original) times.
     */
    var withLocalTime = function (origin, stream) {
        return new WithLocalTime(origin, stream);
    };
    var WithLocalTime = /** @class */ (function () {
        function WithLocalTime(origin, source) {
            this.origin = origin;
            this.source = source;
        }
        WithLocalTime.prototype.run = function (sink, scheduler) {
            return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler));
        };
        return WithLocalTime;
    }());
    /**
     * Accumulate offsets instead of nesting RelativeSinks, which can happen
     * with higher-order stream and combinators like continueWith when they're
     * applied recursively.
     */
    var relativeSink = function (origin, sink) {
        return sink instanceof RelativeSink
            ? new RelativeSink(origin + sink.offset, sink.sink)
            : new RelativeSink(origin, sink);
    };

    var Pipe = /** @class */ (function () {
        function Pipe(sink) {
            this.sink = sink;
        }
        Pipe.prototype.end = function (t) {
            return this.sink.end(t);
        };
        Pipe.prototype.error = function (t, e) {
            return this.sink.error(t, e);
        };
        return Pipe;
    }());
    var LoopSink = /** @class */ (function (_super) {
        __extends(LoopSink, _super);
        function LoopSink(stepper, seed, sink) {
            var _this = _super.call(this, sink) || this;
            _this.step = stepper;
            _this.seed = seed;
            return _this;
        }
        LoopSink.prototype.event = function (t, x) {
            var result = this.step(this.seed, x);
            this.seed = result.seed;
            this.sink.event(t, result.value);
        };
        return LoopSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * Create a stream containing successive reduce results of applying f to
     * the previous reduce result and the current stream item.
     * @param f reducer function
     * @param initial initial value
     * @param stream stream to scan
     * @returns new stream containing successive reduce results
     */
    var scan = function (f, initial, stream) {
        return new Scan(f, initial, stream);
    };
    var Scan = /** @class */ (function () {
        function Scan(f, z, source) {
            this.source = source;
            this.f = f;
            this.value = z;
        }
        Scan.prototype.run = function (sink, scheduler) {
            var d1 = asap(propagateEventTask(this.value, sink), scheduler);
            var d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
            return disposeBoth(d1, d2);
        };
        return Scan;
    }());
    var ScanSink = /** @class */ (function (_super) {
        __extends(ScanSink, _super);
        function ScanSink(f, z, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            _this.value = z;
            return _this;
        }
        ScanSink.prototype.event = function (t, x) {
            var f = this.f;
            this.value = f(this.value, x);
            this.sink.event(t, this.value);
        };
        return ScanSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var continueWith = function (f, stream) {
        return new ContinueWith(f, stream);
    };
    var ContinueWith = /** @class */ (function () {
        function ContinueWith(f, source) {
            this.f = f;
            this.source = source;
        }
        ContinueWith.prototype.run = function (sink, scheduler) {
            return new ContinueWithSink(this.f, this.source, sink, scheduler);
        };
        return ContinueWith;
    }());
    var ContinueWithSink = /** @class */ (function (_super) {
        __extends(ContinueWithSink, _super);
        function ContinueWithSink(f, source, sink, scheduler) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            _this.scheduler = scheduler;
            _this.active = true;
            _this.disposable = disposeOnce(source.run(_this, scheduler));
            return _this;
        }
        ContinueWithSink.prototype.event = function (t, x) {
            if (!this.active) {
                return;
            }
            this.sink.event(t, x);
        };
        ContinueWithSink.prototype.end = function (t) {
            if (!this.active) {
                return;
            }
            tryDispose(t, this.disposable, this.sink);
            this.startNext(t, this.sink);
        };
        ContinueWithSink.prototype.startNext = function (t, sink) {
            try {
                this.disposable = this.continue(this.f, t, sink);
            }
            catch (e) {
                sink.error(t, e);
            }
        };
        ContinueWithSink.prototype.continue = function (f, t, sink) {
            return run(sink, this.scheduler, withLocalTime(t, f()));
        };
        ContinueWithSink.prototype.dispose = function () {
            this.active = false;
            return this.disposable.dispose();
        };
        return ContinueWithSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var startWith = function (x, stream) {
        return continueWith(function () { return stream; }, now(x));
    };

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var Filter = /** @class */ (function () {
        function Filter(p, source) {
            this.p = p;
            this.source = source;
        }
        Filter.prototype.run = function (sink, scheduler) {
            return this.source.run(new FilterSink(this.p, sink), scheduler);
        };
        /**
         * Create a filtered source, fusing adjacent filter.filter if possible
         * @param {function(x:*):boolean} p filtering predicate
         * @param {{run:function}} source source to filter
         * @returns {Filter} filtered source
         */
        Filter.create = function (p, source) {
            if (isCanonicalEmpty(source)) {
                return source;
            }
            if (source instanceof Filter) {
                return new Filter(and(source.p, p), source.source);
            }
            return new Filter(p, source);
        };
        return Filter;
    }());
    var FilterSink = /** @class */ (function (_super) {
        __extends(FilterSink, _super);
        function FilterSink(p, sink) {
            var _this = _super.call(this, sink) || this;
            _this.p = p;
            return _this;
        }
        FilterSink.prototype.event = function (t, x) {
            var p = this.p;
            p(x) && this.sink.event(t, x);
        };
        return FilterSink;
    }(Pipe));
    var and = function (p, q) { return function (x) { return p(x) && q(x); }; };

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var FilterMap = /** @class */ (function () {
        function FilterMap(p, f, source) {
            this.p = p;
            this.f = f;
            this.source = source;
        }
        FilterMap.prototype.run = function (sink, scheduler) {
            return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler);
        };
        return FilterMap;
    }());
    var FilterMapSink = /** @class */ (function (_super) {
        __extends(FilterMapSink, _super);
        function FilterMapSink(p, f, sink) {
            var _this = _super.call(this, sink) || this;
            _this.p = p;
            _this.f = f;
            return _this;
        }
        FilterMapSink.prototype.event = function (t, x) {
            var f = this.f;
            var p = this.p;
            p(x) && this.sink.event(t, f(x));
        };
        return FilterMapSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var Map = /** @class */ (function () {
        function Map(f, source) {
            this.f = f;
            this.source = source;
        }
        Map.prototype.run = function (sink, scheduler) {
            return this.source.run(new MapSink(this.f, sink), scheduler);
        };
        /**
         * Create a mapped source, fusing adjacent map.map, filter.map,
         * and filter.map.map if possible
         * @param {function(*):*} f mapping function
         * @param {{run:function}} source source to map
         * @returns {Map|FilterMap} mapped source, possibly fused
         */
        Map.create = function (f, source) {
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
    }());
    var MapSink = /** @class */ (function (_super) {
        __extends(MapSink, _super);
        function MapSink(f, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            return _this;
        }
        MapSink.prototype.event = function (t, x) {
            var f = this.f;
            this.sink.event(t, f(x));
        };
        return MapSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * Transform each value in the stream by applying f to each
     * @param f mapping function
     * @param stream stream to map
     * @returns stream containing items transformed by f
     */
    var map$1 = function (f, stream) {
        return Map.create(f, stream);
    };
    /**
    * Perform a side effect for each item in the stream
    * @param f side effect to execute for each item. The return value will be discarded.
    * @param stream stream to tap
    * @returns new stream containing the same items as this stream
    */
    var tap = function (f, stream) {
        return new Tap(f, stream);
    };
    var Tap = /** @class */ (function () {
        function Tap(f, source) {
            this.source = source;
            this.f = f;
        }
        Tap.prototype.run = function (sink, scheduler) {
            return this.source.run(new TapSink(this.f, sink), scheduler);
        };
        return Tap;
    }());
    var TapSink = /** @class */ (function (_super) {
        __extends(TapSink, _super);
        function TapSink(f, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            return _this;
        }
        TapSink.prototype.event = function (t, x) {
            var f = this.f;
            f(x);
            this.sink.event(t, x);
        };
        return TapSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var IndexSink = /** @class */ (function (_super) {
        __extends(IndexSink, _super);
        function IndexSink(i, sink) {
            var _this = _super.call(this, sink) || this;
            _this.index = i;
            _this.active = true;
            _this.value = undefined;
            return _this;
        }
        IndexSink.prototype.event = function (t, x) {
            if (!this.active) {
                return;
            }
            this.value = x;
            this.sink.event(t, this);
        };
        IndexSink.prototype.end = function (t) {
            if (!this.active) {
                return;
            }
            this.active = false;
            this.sink.event(t, this);
        };
        return IndexSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /** @author Brian Cavalier */
    /** @author John Hann */
    /**
     * TODO: find a better way (without `any`)
     */
    function invoke(f, args) {
        /* eslint complexity: [2,7] */
        switch (args.length) {
            case 0: return f();
            case 1: return f(args[0]);
            case 2: return f(args[0], args[1]);
            case 3: return f(args[0], args[1], args[2]);
            case 4: return f(args[0], args[1], args[2], args[3]);
            case 5: return f(args[0], args[1], args[2], args[3], args[4]);
            default:
                return f.apply(undefined, args);
        }
    }
    var CombineSink = /** @class */ (function (_super) {
        __extends(CombineSink, _super);
        function CombineSink(disposables, length, sink, f) {
            var _this = _super.call(this, sink) || this;
            _this.disposables = disposables;
            _this.f = f;
            _this.awaiting = length;
            _this.values = new Array(length);
            _this.hasValue = new Array(length).fill(false);
            _this.activeCount = length;
            return _this;
        }
        CombineSink.prototype.event = function (t, indexedValue) {
            if (!indexedValue.active) {
                this.dispose(t, indexedValue.index);
                return;
            }
            var i = indexedValue.index;
            var awaiting = this.updateReady(i);
            this.values[i] = indexedValue.value;
            if (awaiting === 0) {
                this.sink.event(t, invoke(this.f, this.values));
            }
        };
        CombineSink.prototype.updateReady = function (index) {
            if (this.awaiting > 0) {
                if (!this.hasValue[index]) {
                    this.hasValue[index] = true;
                    this.awaiting -= 1;
                }
            }
            return this.awaiting;
        };
        CombineSink.prototype.dispose = function (t, index) {
            tryDispose(t, this.disposables[index], this.sink);
            if (--this.activeCount === 0) {
                this.sink.end(t);
            }
        };
        return CombineSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010 original author or authors */
    var mergeConcurrently = function (concurrency, stream) {
        return mergeMapConcurrently(id, concurrency, stream);
    };
    var mergeMapConcurrently = function (f, concurrency, stream) {
        return isCanonicalEmpty(stream) ? empty()
            : new MergeConcurrently(f, concurrency, stream);
    };
    var MergeConcurrently = /** @class */ (function () {
        function MergeConcurrently(f, concurrency, source) {
            this.f = f;
            this.concurrency = concurrency;
            this.source = source;
        }
        MergeConcurrently.prototype.run = function (sink, scheduler) {
            return new Outer(this.f, this.concurrency, this.source, sink, scheduler);
        };
        return MergeConcurrently;
    }());
    var isNonEmpty = function (array) { return array.length > 0; };
    var Outer = /** @class */ (function () {
        function Outer(f, concurrency, source, sink, scheduler) {
            this.f = f;
            this.concurrency = concurrency;
            this.sink = sink;
            this.scheduler = scheduler;
            this.pending = [];
            this.current = [];
            this.disposable = disposeOnce(source.run(this, scheduler));
            this.active = true;
        }
        Outer.prototype.event = function (t, x) {
            this.addInner(t, x);
        };
        Outer.prototype.addInner = function (t, x) {
            if (this.current.length < this.concurrency) {
                this.startInner(t, x);
            }
            else {
                this.pending.push(x);
            }
        };
        Outer.prototype.startInner = function (t, x) {
            try {
                this.initInner(t, x);
            }
            catch (e) {
                this.error(t, e);
            }
        };
        Outer.prototype.initInner = function (t, x) {
            var innerSink = new Inner(t, this, this.sink);
            innerSink.disposable = mapAndRun(this.f, t, x, innerSink, this.scheduler);
            this.current.push(innerSink);
        };
        Outer.prototype.end = function (t) {
            this.active = false;
            tryDispose(t, this.disposable, this.sink);
            this.checkEnd(t);
        };
        Outer.prototype.error = function (t, e) {
            this.active = false;
            this.sink.error(t, e);
        };
        Outer.prototype.dispose = function () {
            this.active = false;
            this.pending.length = 0;
            this.disposable.dispose();
            disposeAll(this.current).dispose();
        };
        Outer.prototype.endInner = function (t, inner) {
            var i = this.current.indexOf(inner);
            if (i >= 0) {
                this.current.splice(i, 1);
            }
            tryDispose(t, inner, this);
            var pending = this.pending;
            if (isNonEmpty(pending)) {
                this.startInner(t, pending.shift());
            }
            else {
                this.checkEnd(t);
            }
        };
        Outer.prototype.checkEnd = function (t) {
            if (!this.active && this.current.length === 0) {
                this.sink.end(t);
            }
        };
        return Outer;
    }());
    var mapAndRun = function (f, t, x, sink, scheduler) {
        return f(x).run(sink, schedulerRelativeTo(t, scheduler));
    };
    var Inner = /** @class */ (function () {
        function Inner(time, outer, sink) {
            this.time = time;
            this.outer = outer;
            this.sink = sink;
            this.disposable = disposeNone();
        }
        Inner.prototype.event = function (t, x) {
            this.sink.event(t + this.time, x);
        };
        Inner.prototype.end = function (t) {
            this.outer.endInner(t + this.time, this);
        };
        Inner.prototype.error = function (t, e) {
            this.outer.error(t + this.time, e);
        };
        Inner.prototype.dispose = function () {
            return this.disposable.dispose();
        };
        return Inner;
    }());
    /**
     * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
     * streams to the outer. Event arrival times are preserved.
     * @param stream stream of streams
     * @returns new stream containing all events of all inner streams
     */
    var join = function (stream) { return mergeConcurrently(Infinity, stream); };

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * @returns stream containing events from two streams in time order.
     * If two events are simultaneous they will be merged in arbitrary order.
     */
    function merge$1(stream1, stream2) {
        return mergeArray([stream1, stream2]);
    }
    /**
     * @param streams array of stream to merge
     * @returns stream containing events from all input observables
     * in time order.  If two events are simultaneous they will be merged in
     * arbitrary order.
     */
    var mergeArray = function (streams) {
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
     * TODO: use {@link MergeArray}
     */
    var mergeStreams = function (streams) {
        return streams.length === 0 ? empty()
            : streams.length === 1 ? streams[0]
                : new Merge(reduce(appendSources, [], streams));
    };
    var withoutCanonicalEmpty = function (streams) {
        return streams.filter(isNotCanonicalEmpty);
    };
    var isNotCanonicalEmpty = function (stream) {
        return !isCanonicalEmpty(stream);
    };
    var appendSources = function (sources, stream) {
        return sources.concat(stream instanceof Merge ? stream.sources : stream);
    };
    var Merge = /** @class */ (function () {
        function Merge(sources) {
            this.sources = sources;
        }
        Merge.prototype.run = function (sink, scheduler) {
            var l = this.sources.length;
            var disposables = new Array(l);
            var sinks = new Array(l);
            var mergeSink = new MergeSink(disposables, sinks, sink);
            for (var indexSink = void 0, i = 0; i < l; ++i) {
                indexSink = sinks[i] = new IndexSink(i, mergeSink);
                disposables[i] = this.sources[i].run(indexSink, scheduler);
            }
            return disposeAll(disposables);
        };
        return Merge;
    }());
    var MergeSink = /** @class */ (function (_super) {
        __extends(MergeSink, _super);
        function MergeSink(disposables, sinks, sink) {
            var _this = _super.call(this, sink) || this;
            _this.disposables = disposables;
            _this.activeCount = sinks.length;
            return _this;
        }
        MergeSink.prototype.event = function (t, indexValue) {
            if (!indexValue.active) {
                this.dispose(t, indexValue.index);
                return;
            }
            this.sink.event(t, indexValue.value);
        };
        MergeSink.prototype.dispose = function (t, index) {
            tryDispose(t, this.disposables[index], this.sink);
            if (--this.activeCount === 0) {
                this.sink.end(t);
            }
        };
        return MergeSink;
    }(Pipe));
    var snapshot = function (f, values, sampler) {
        return isCanonicalEmpty(sampler) || isCanonicalEmpty(values)
            ? empty()
            : new Snapshot(f, values, sampler);
    };
    var Snapshot = /** @class */ (function () {
        function Snapshot(f, values, sampler) {
            this.f = f;
            this.values = values;
            this.sampler = sampler;
        }
        Snapshot.prototype.run = function (sink, scheduler) {
            var sampleSink = new SnapshotSink(this.f, sink);
            var valuesDisposable = this.values.run(sampleSink.latest, scheduler);
            var samplerDisposable = this.sampler.run(sampleSink, scheduler);
            return disposeBoth(samplerDisposable, valuesDisposable);
        };
        return Snapshot;
    }());
    var SnapshotSink = /** @class */ (function (_super) {
        __extends(SnapshotSink, _super);
        function SnapshotSink(f, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            _this.latest = new LatestValueSink(_this);
            return _this;
        }
        SnapshotSink.prototype.event = function (t, x) {
            if (this.latest.hasValue) {
                var f = this.f;
                // TODO: value should be boxed to avoid ! bang
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.sink.event(t, f(this.latest.value, x));
            }
        };
        return SnapshotSink;
    }(Pipe));
    var LatestValueSink = /** @class */ (function (_super) {
        __extends(LatestValueSink, _super);
        function LatestValueSink(sink) {
            var _this = _super.call(this, sink) || this;
            _this.hasValue = false;
            return _this;
        }
        LatestValueSink.prototype.event = function (_t, x) {
            this.value = x;
            this.hasValue = true;
        };
        LatestValueSink.prototype.end = function () { };
        return LatestValueSink;
    }(Pipe));
    var SliceSink = /** @class */ (function (_super) {
        __extends(SliceSink, _super);
        function SliceSink(skip, take, sink, disposable) {
            var _this = _super.call(this, sink) || this;
            _this.skip = skip;
            _this.take = take;
            _this.disposable = disposable;
            return _this;
        }
        SliceSink.prototype.event = function (t, x) {
            /* eslint complexity: [1, 4] */
            if (this.skip > 0) {
                this.skip -= 1;
                return;
            }
            if (this.take === 0) {
                return;
            }
            this.take -= 1;
            this.sink.event(t, x);
            if (this.take === 0) {
                this.disposable.dispose();
                this.sink.end(t);
            }
        };
        return SliceSink;
    }(Pipe));
    var TakeWhileSink = /** @class */ (function (_super) {
        __extends(TakeWhileSink, _super);
        function TakeWhileSink(p, sink, disposable) {
            var _this = _super.call(this, sink) || this;
            _this.p = p;
            _this.active = true;
            _this.disposable = disposable;
            return _this;
        }
        TakeWhileSink.prototype.event = function (t, x) {
            if (!this.active) {
                return;
            }
            var p = this.p;
            this.active = p(x);
            if (this.active) {
                this.sink.event(t, x);
            }
            else {
                this.disposable.dispose();
                this.sink.end(t);
            }
        };
        return TakeWhileSink;
    }(Pipe));
    var SkipWhileSink = /** @class */ (function (_super) {
        __extends(SkipWhileSink, _super);
        function SkipWhileSink(p, sink) {
            var _this = _super.call(this, sink) || this;
            _this.p = p;
            _this.skipping = true;
            return _this;
        }
        SkipWhileSink.prototype.event = function (t, x) {
            if (this.skipping) {
                var p = this.p;
                this.skipping = p(x);
                if (this.skipping) {
                    return;
                }
            }
            this.sink.event(t, x);
        };
        return SkipWhileSink;
    }(Pipe));
    var skipAfter = function (p, stream) {
        return isCanonicalEmpty(stream) ? empty()
            : new SkipAfter(p, stream);
    };
    var SkipAfter = /** @class */ (function () {
        function SkipAfter(p, source) {
            this.p = p;
            this.source = source;
        }
        SkipAfter.prototype.run = function (sink, scheduler) {
            return this.source.run(new SkipAfterSink(this.p, sink), scheduler);
        };
        return SkipAfter;
    }());
    var SkipAfterSink = /** @class */ (function (_super) {
        __extends(SkipAfterSink, _super);
        function SkipAfterSink(p, sink) {
            var _this = _super.call(this, sink) || this;
            _this.p = p;
            _this.skipping = false;
            return _this;
        }
        SkipAfterSink.prototype.event = function (t, x) {
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
    }(Pipe));
    var ZipItemsSink = /** @class */ (function (_super) {
        __extends(ZipItemsSink, _super);
        function ZipItemsSink(f, items, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            _this.items = items;
            _this.index = 0;
            return _this;
        }
        ZipItemsSink.prototype.event = function (t, b) {
            var f = this.f;
            this.sink.event(t, f(this.items[this.index], b));
            this.index += 1;
        };
        return ZipItemsSink;
    }(Pipe));
    var ZipSink = /** @class */ (function (_super) {
        __extends(ZipSink, _super);
        function ZipSink(f, buffers, sinks, sink) {
            var _this = _super.call(this, sink) || this;
            _this.f = f;
            _this.sinks = sinks;
            _this.buffers = buffers;
            return _this;
        }
        ZipSink.prototype.event = function (t, indexedValue) {
            /* eslint complexity: [1, 5] */
            if (!indexedValue.active) {
                this.dispose(t, indexedValue.index);
                return;
            }
            var buffers = this.buffers;
            var buffer = buffers[indexedValue.index];
            buffer.push(indexedValue.value);
            if (buffer.length() === 1) {
                if (!ready(buffers)) {
                    return;
                }
                emitZipped(this.f, t, buffers, this.sink);
                if (ended(this.buffers, this.sinks)) {
                    this.sink.end(t);
                }
            }
        };
        ZipSink.prototype.dispose = function (t, index) {
            var buffer = this.buffers[index];
            if (buffer.isEmpty()) {
                this.sink.end(t);
            }
        };
        return ZipSink;
    }(Pipe));
    var emitZipped = function (f, t, buffers, sink) {
        return sink.event(t, invoke(f, map(head, buffers)));
    };
    var head = function (buffer) { return buffer.shift(); };
    function ended(buffers, sinks) {
        for (var i = 0, l = buffers.length; i < l; ++i) {
            if (buffers[i].isEmpty() && !sinks[i].active) {
                return true;
            }
        }
        return false;
    }
    function ready(buffers) {
        for (var i = 0, l = buffers.length; i < l; ++i) {
            if (buffers[i].isEmpty()) {
                return false;
            }
        }
        return true;
    }

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * Given a stream of streams, return a new stream that adopts the behavior
     * of the most recent inner stream.
     * @param stream of streams on which to switch
     * @returns switching stream
     */
    var switchLatest = function (stream) {
        return isCanonicalEmpty(stream)
            ? empty()
            : new Switch(stream);
    };
    var Switch = /** @class */ (function () {
        function Switch(source) {
            this.source = source;
        }
        Switch.prototype.run = function (sink, scheduler) {
            var switchSink = new SwitchSink(sink, scheduler);
            return disposeBoth(switchSink, this.source.run(switchSink, scheduler));
        };
        return Switch;
    }());
    var SwitchSink = /** @class */ (function () {
        function SwitchSink(sink, scheduler) {
            this.sink = sink;
            this.scheduler = scheduler;
            this.current = null;
            this.ended = false;
        }
        SwitchSink.prototype.event = function (t, stream) {
            this.disposeCurrent(t);
            this.current = new Segment(stream, t, Infinity, this, this.sink, this.scheduler);
        };
        SwitchSink.prototype.end = function (t) {
            this.ended = true;
            this.checkEnd(t);
        };
        SwitchSink.prototype.error = function (t, e) {
            this.ended = true;
            this.sink.error(t, e);
        };
        SwitchSink.prototype.dispose = function () {
            return this.disposeCurrent(currentTime(this.scheduler));
        };
        SwitchSink.prototype.disposeCurrent = function (t) {
            if (this.current !== null) {
                return this.current.dispose(t);
            }
        };
        SwitchSink.prototype.disposeInner = function (t, inner) {
            inner.dispose(t);
            if (inner === this.current) {
                this.current = null;
            }
        };
        SwitchSink.prototype.checkEnd = function (t) {
            if (this.ended && this.current === null) {
                this.sink.end(t);
            }
        };
        SwitchSink.prototype.endInner = function (t, inner) {
            this.disposeInner(t, inner);
            this.checkEnd(t);
        };
        SwitchSink.prototype.errorInner = function (t, e, inner) {
            this.disposeInner(t, inner);
            this.sink.error(t, e);
        };
        return SwitchSink;
    }());
    var Segment = /** @class */ (function () {
        function Segment(source, min, max, outer, sink, scheduler) {
            this.min = min;
            this.max = max;
            this.outer = outer;
            this.sink = sink;
            this.disposable = source.run(this, schedulerRelativeTo(min, scheduler));
        }
        Segment.prototype.event = function (t, x) {
            var time = Math.max(0, t + this.min);
            if (time < this.max) {
                this.sink.event(time, x);
            }
        };
        Segment.prototype.end = function (t) {
            this.outer.endInner(t + this.min, this);
        };
        Segment.prototype.error = function (t, e) {
            this.outer.errorInner(t + this.min, e, this);
        };
        Segment.prototype.dispose = function (t) {
            tryDispose(t, this.disposable, this.sink);
        };
        return Segment;
    }());

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    function filter(p, stream) {
        return Filter.create(p, stream);
    }
    /**
     * Skip repeated events, using === to detect duplicates
     * @param stream stream from which to omit repeated events
     * @returns stream without repeated events
     */
    var skipRepeats = function (stream) {
        return skipRepeatsWith(same, stream);
    };
    /**
     * Skip repeated events using the provided equals function to detect duplicates
     * @param equals optional function to compare items
     * @param stream stream from which to omit repeated events
     * @returns stream without repeated events
     */
    var skipRepeatsWith = function (equals, stream) {
        return isCanonicalEmpty(stream) ? empty()
            : new SkipRepeats(equals, stream);
    };
    var SkipRepeats = /** @class */ (function () {
        function SkipRepeats(equals, source) {
            this.equals = equals;
            this.source = source;
        }
        SkipRepeats.prototype.run = function (sink, scheduler) {
            return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
        };
        return SkipRepeats;
    }());
    var SkipRepeatsSink = /** @class */ (function (_super) {
        __extends(SkipRepeatsSink, _super);
        function SkipRepeatsSink(equals, sink) {
            var _this = _super.call(this, sink) || this;
            _this.equals = equals;
            _this.value = undefined;
            _this.init = true;
            return _this;
        }
        SkipRepeatsSink.prototype.event = function (t, x) {
            if (this.init) {
                this.init = false;
                this.value = x;
                this.sink.event(t, x);
                // TODO: value should be boxed to avoid ! bang
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            }
            else if (!this.equals(this.value, x)) {
                this.value = x;
                this.sink.event(t, x);
            }
        };
        return SkipRepeatsSink;
    }(Pipe));
    function same(a, b) {
        return a === b;
    }

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    var until = function (signal, stream) {
        return new Until(signal, stream);
    };
    var Until = /** @class */ (function () {
        function Until(maxSignal, source) {
            this.maxSignal = maxSignal;
            this.source = source;
        }
        Until.prototype.run = function (sink, scheduler) {
            var disposable = new SettableDisposable();
            var d1 = this.source.run(sink, scheduler);
            var d2 = this.maxSignal.run(new UntilSink(sink, disposable), scheduler);
            disposable.setDisposable(disposeBoth(d1, d2));
            return disposable;
        };
        return Until;
    }());
    var SinceSink = /** @class */ (function (_super) {
        __extends(SinceSink, _super);
        function SinceSink(min, sink) {
            var _this = _super.call(this, sink) || this;
            _this.min = min;
            return _this;
        }
        SinceSink.prototype.event = function (t, x) {
            if (this.min.allow) {
                this.sink.event(t, x);
            }
        };
        return SinceSink;
    }(Pipe));
    var LowerBoundSink = /** @class */ (function (_super) {
        __extends(LowerBoundSink, _super);
        function LowerBoundSink(signal, sink, scheduler) {
            var _this = _super.call(this, sink) || this;
            _this.allow = false;
            _this.disposable = signal.run(_this, scheduler);
            return _this;
        }
        LowerBoundSink.prototype.event = function () {
            this.allow = true;
            this.dispose();
        };
        LowerBoundSink.prototype.end = function () { };
        LowerBoundSink.prototype.dispose = function () {
            this.disposable.dispose();
        };
        return LowerBoundSink;
    }(Pipe));
    var UntilSink = /** @class */ (function (_super) {
        __extends(UntilSink, _super);
        function UntilSink(sink, disposable) {
            var _this = _super.call(this, sink) || this;
            _this.disposable = disposable;
            return _this;
        }
        UntilSink.prototype.event = function (t) {
            this.disposable.dispose();
            this.sink.end(t);
        };
        UntilSink.prototype.end = function () { };
        return UntilSink;
    }(Pipe));

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * @param delayTime milliseconds to delay each item
     * @param stream
     * @returns new stream containing the same items, but delayed by ms
     */
    var delay$1 = function (delayTime, stream) {
        return delayTime <= 0 ? stream : new Delay(delayTime, stream);
    };
    var Delay = /** @class */ (function () {
        function Delay(dt, source) {
            this.dt = dt;
            this.source = source;
        }
        Delay.prototype.run = function (sink, scheduler) {
            var delaySink = new DelaySink(this.dt, sink, scheduler);
            return disposeBoth(delaySink, this.source.run(delaySink, scheduler));
        };
        return Delay;
    }());
    var DelaySink = /** @class */ (function (_super) {
        __extends(DelaySink, _super);
        function DelaySink(dt, sink, scheduler) {
            var _this = _super.call(this, sink) || this;
            _this.dt = dt;
            _this.scheduler = scheduler;
            _this.tasks = [];
            return _this;
        }
        DelaySink.prototype.dispose = function () {
            this.tasks.forEach(cancelTask);
        };
        DelaySink.prototype.event = function (_t, x) {
            this.tasks.push(delay(this.dt, propagateEventTask(x, this.sink), this.scheduler));
        };
        DelaySink.prototype.end = function () {
            this.tasks.push(delay(this.dt, propagateEndTask(this.sink), this.scheduler));
        };
        return DelaySink;
    }(Pipe));
    var ThrottleSink = /** @class */ (function (_super) {
        __extends(ThrottleSink, _super);
        function ThrottleSink(period, sink) {
            var _this = _super.call(this, sink) || this;
            _this.time = 0;
            _this.period = period;
            return _this;
        }
        ThrottleSink.prototype.event = function (t, x) {
            if (t >= this.time) {
                this.time = t + this.period;
                this.sink.event(t, x);
            }
        };
        return ThrottleSink;
    }(Pipe));
    /**
     * Wait for a burst of events to subside and emit only the last event in the burst
     * @param period events occuring more frequently than this will be suppressed
     * @param stream stream to debounce
     * @returns new debounced stream
     */
    var debounce = function (period, stream) {
        return isCanonicalEmpty(stream) ? empty()
            : new Debounce(period, stream);
    };
    var Debounce = /** @class */ (function () {
        function Debounce(dt, source) {
            this.dt = dt;
            this.source = source;
        }
        Debounce.prototype.run = function (sink, scheduler) {
            return new DebounceSink(this.dt, this.source, sink, scheduler);
        };
        return Debounce;
    }());
    var DebounceSink = /** @class */ (function () {
        function DebounceSink(dt, source, sink, scheduler) {
            this.dt = dt;
            this.sink = sink;
            this.scheduler = scheduler;
            this.timer = null;
            this.disposable = source.run(this, scheduler);
        }
        DebounceSink.prototype.event = function (_t, x) {
            this.clearTimer();
            this.value = x;
            this.timer = delay(this.dt, new DebounceTask(this, x), this.scheduler);
        };
        DebounceSink.prototype.handleEventFromTask = function (t, x) {
            this.clearTimer();
            this.sink.event(t, x);
        };
        DebounceSink.prototype.end = function (t) {
            if (this.clearTimer()) {
                // TODO: value should be boxed to avoid ! bang
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.sink.event(t, this.value);
                this.value = undefined;
            }
            this.sink.end(t);
        };
        DebounceSink.prototype.error = function (t, x) {
            this.clearTimer();
            this.sink.error(t, x);
        };
        DebounceSink.prototype.dispose = function () {
            this.clearTimer();
            this.disposable.dispose();
        };
        DebounceSink.prototype.clearTimer = function () {
            if (this.timer === null) {
                return false;
            }
            this.timer.dispose();
            this.timer = null;
            return true;
        };
        return DebounceSink;
    }());
    var DebounceTask = /** @class */ (function () {
        function DebounceTask(sink, value) {
            this.sink = sink;
            this.value = value;
        }
        DebounceTask.prototype.run = function (t) {
            this.sink.handleEventFromTask(t, this.value);
        };
        DebounceTask.prototype.error = function (t, e) {
            this.sink.error(t, e);
        };
        DebounceTask.prototype.dispose = function () { };
        return DebounceTask;
    }());

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /** @author Brian Cavalier */
    /** @author John Hann */
    function tryEvent(t, x, sink) {
        try {
            sink.event(t, x);
        }
        catch (e) {
            sink.error(t, e);
        }
    }
    function tryEnd(t, sink) {
        try {
            sink.end(t);
        }
        catch (e) {
            sink.error(t, e);
        }
    }

    var multicast = function (stream) {
        return stream instanceof Multicast || isCanonicalEmpty(stream)
            ? stream
            : new Multicast(stream);
    };
    var Multicast = /** @class */ (function () {
        function Multicast(source) {
            this.source = new MulticastSource(source);
        }
        Multicast.prototype.run = function (sink, scheduler) {
            return this.source.run(sink, scheduler);
        };
        return Multicast;
    }());
    var MulticastSource = /** @class */ (function () {
        function MulticastSource(source) {
            this.source = source;
            this.sinks = [];
            this.disposable = disposeNone();
        }
        MulticastSource.prototype.run = function (sink, scheduler) {
            var n = this.add(sink);
            if (n === 1) {
                this.disposable = this.source.run(this, scheduler);
            }
            return disposeOnce(new MulticastDisposable(this, sink));
        };
        MulticastSource.prototype.dispose = function () {
            var disposable = this.disposable;
            this.disposable = disposeNone();
            return disposable.dispose();
        };
        MulticastSource.prototype.add = function (sink) {
            this.sinks = append(sink, this.sinks);
            return this.sinks.length;
        };
        MulticastSource.prototype.remove = function (sink) {
            var i = findIndex(sink, this.sinks);
            // istanbul ignore next
            if (i >= 0) {
                this.sinks = remove(i, this.sinks);
            }
            return this.sinks.length;
        };
        MulticastSource.prototype.event = function (time, value) {
            var s = this.sinks;
            if (s.length === 1) {
                return s[0].event(time, value);
            }
            for (var i = 0; i < s.length; ++i) {
                tryEvent(time, value, s[i]);
            }
        };
        MulticastSource.prototype.end = function (time) {
            var s = this.sinks;
            for (var i = 0; i < s.length; ++i) {
                tryEnd(time, s[i]);
            }
        };
        MulticastSource.prototype.error = function (time, err) {
            var s = this.sinks;
            for (var i = 0; i < s.length; ++i) {
                s[i].error(time, err);
            }
        };
        return MulticastSource;
    }());
    var MulticastDisposable = /** @class */ (function () {
        function MulticastDisposable(source, sink) {
            this.source = source;
            this.sink = sink;
        }
        MulticastDisposable.prototype.dispose = function () {
            if (this.source.remove(this.sink) === 0) {
                this.source.dispose();
            }
        };
        return MulticastDisposable;
    }());
    var scan$1 = curry3(scan);
    var startWith$1 = curry2(startWith);
    var map$1$1 = curry2(map$1);
    var tap$1 = curry2(tap);
    var merge$1$1 = curry2(merge$1);
    var snapshot$1 = curry3(snapshot);
    var filter$1 = curry2(filter);
    var skipAfter$1 = curry2(skipAfter);
    var until$1 = curry2(until);
    var delay$1$1 = curry2(delay$1);
    var debounce$1 = curry2(debounce);

    /** @license MIT License (c) copyright 2010-2016 original author or authors */
    /**
     * remove all elements matching a predicate
     * @deprecated
     */
    function removeAll(f, a) {
        var l = a.length;
        var b = new Array(l);
        var j = 0;
        for (var x = void 0, i = 0; i < l; ++i) {
            x = a[i];
            if (!f(x)) {
                b[j] = x;
                ++j;
            }
        }
        b.length = j;
        return b;
    }
    /**
     * find index of x in a, from the left
     */
    function findIndex$1(x, a) {
        for (var i = 0, l = a.length; i < l; ++i) {
            if (x === a[i]) {
                return i;
            }
        }
        return -1;
    }

    var ScheduledTaskImpl = /** @class */ (function () {
        function ScheduledTaskImpl(time, localOffset, period, task, scheduler) {
            this.time = time;
            this.localOffset = localOffset;
            this.period = period;
            this.task = task;
            this.scheduler = scheduler;
            this.active = true;
        }
        ScheduledTaskImpl.prototype.run = function () {
            return this.task.run(this.time - this.localOffset);
        };
        ScheduledTaskImpl.prototype.error = function (e) {
            return this.task.error(this.time - this.localOffset, e);
        };
        ScheduledTaskImpl.prototype.dispose = function () {
            this.active = false;
            this.scheduler.cancel(this);
            return this.task.dispose();
        };
        return ScheduledTaskImpl;
    }());

    var RelativeScheduler$1 = /** @class */ (function () {
        function RelativeScheduler(origin, scheduler) {
            this.origin = origin;
            this.scheduler = scheduler;
        }
        RelativeScheduler.prototype.currentTime = function () {
            return this.scheduler.currentTime() - this.origin;
        };
        RelativeScheduler.prototype.scheduleTask = function (localOffset, delay, period, task) {
            return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
        };
        RelativeScheduler.prototype.relative = function (origin) {
            return new RelativeScheduler(origin + this.origin, this.scheduler);
        };
        RelativeScheduler.prototype.cancel = function (task) {
            return this.scheduler.cancel(task);
        };
        RelativeScheduler.prototype.cancelAll = function (f) {
            return this.scheduler.cancelAll(f);
        };
        return RelativeScheduler;
    }());

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var defer = function (task) {
        return Promise.resolve(task).then(runTask);
    };
    function runTask(task) {
        try {
            return task.run();
        }
        catch (e) {
            return task.error(e);
        }
    }

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var SchedulerImpl = /** @class */ (function () {
        function SchedulerImpl(timer, timeline) {
            var _this = this;
            this._runReadyTasksBound = function () { return _this._runReadyTasks(); };
            this.timer = timer;
            this.timeline = timeline;
            this._timer = null;
            this._nextArrival = Infinity;
        }
        SchedulerImpl.prototype.currentTime = function () {
            return this.timer.now();
        };
        SchedulerImpl.prototype.scheduleTask = function (localOffset, delay, period, task) {
            var time = this.currentTime() + Math.max(0, delay);
            var st = new ScheduledTaskImpl(time, localOffset, period, task, this);
            this.timeline.add(st);
            this._scheduleNextRun();
            return st;
        };
        SchedulerImpl.prototype.relative = function (offset) {
            return new RelativeScheduler$1(offset, this);
        };
        SchedulerImpl.prototype.cancel = function (task) {
            task.active = false;
            if (this.timeline.remove(task)) {
                this._reschedule();
            }
        };
        // @deprecated
        SchedulerImpl.prototype.cancelAll = function (f) {
            this.timeline.removeAll(f);
            this._reschedule();
        };
        SchedulerImpl.prototype._reschedule = function () {
            if (this.timeline.isEmpty()) {
                this._unschedule();
            }
            else {
                this._scheduleNextRun();
            }
        };
        SchedulerImpl.prototype._unschedule = function () {
            this.timer.clearTimer(this._timer);
            this._timer = null;
        };
        SchedulerImpl.prototype._scheduleNextRun = function () {
            if (this.timeline.isEmpty()) {
                return;
            }
            var nextArrival = this.timeline.nextArrival();
            if (this._timer === null) {
                this._scheduleNextArrival(nextArrival);
            }
            else if (nextArrival < this._nextArrival) {
                this._unschedule();
                this._scheduleNextArrival(nextArrival);
            }
        };
        SchedulerImpl.prototype._scheduleNextArrival = function (nextArrival) {
            this._nextArrival = nextArrival;
            var delay = Math.max(0, nextArrival - this.currentTime());
            this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
        };
        SchedulerImpl.prototype._runReadyTasks = function () {
            this._timer = null;
            this.timeline.runTasks(this.currentTime(), runTask);
            this._scheduleNextRun();
        };
        return SchedulerImpl;
    }());

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    var TimelineImpl = /** @class */ (function () {
        function TimelineImpl() {
            this.tasks = [];
        }
        TimelineImpl.prototype.nextArrival = function () {
            return this.isEmpty() ? Infinity : this.tasks[0].time;
        };
        TimelineImpl.prototype.isEmpty = function () {
            return this.tasks.length === 0;
        };
        TimelineImpl.prototype.add = function (st) {
            insertByTime(st, this.tasks);
        };
        TimelineImpl.prototype.remove = function (st) {
            var i = binarySearch(getTime(st), this.tasks);
            if (i >= 0 && i < this.tasks.length) {
                var events = this.tasks[i].events;
                var at = findIndex$1(st, events);
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
        /**
         * @deprecated
         */
        TimelineImpl.prototype.removeAll = function (f) {
            for (var i = 0; i < this.tasks.length; ++i) {
                removeAllFrom(f, this.tasks[i]);
            }
        };
        TimelineImpl.prototype.runTasks = function (t, runTask) {
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
        return TimelineImpl;
    }());
    function runReadyTasks(runTask, events, tasks) {
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
        }
        else {
            insertAtTimeslot(task, timeslots, time, i);
        }
    }
    function insertAtTimeslot(task, timeslots, time, i) {
        var timeslot = timeslots[i];
        if (time === timeslot.time) {
            addEvent(task, timeslot.events);
        }
        else {
            timeslots.splice(i, 0, newTimeslot(time, [task]));
        }
    }
    function addEvent(task, events) {
        if (events.length === 0 || task.time >= events[events.length - 1].time) {
            events.push(task);
        }
        else {
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
    /**
     * @deprecated
     */
    function removeAllFrom(f, timeslot) {
        timeslot.events = removeAll(f, timeslot.events);
    }
    function binarySearch(t, sortedArray) {
        var lo = 0;
        var hi = sortedArray.length;
        var mid, y;
        while (lo < hi) {
            mid = Math.floor((lo + hi) / 2);
            y = sortedArray[mid];
            if (t === y.time) {
                return mid;
            }
            else if (t < y.time) {
                hi = mid;
            }
            else {
                lo = mid + 1;
            }
        }
        return hi;
    }
    var newTimeslot = function (t, events) { return ({ time: t, events: events }); };

    /** @license MIT License (c) copyright 2010-2017 original author or authors */
    /* global setTimeout, clearTimeout */
    var ClockTimer = /** @class */ (function () {
        function ClockTimer(clock) {
            this._clock = clock;
        }
        ClockTimer.prototype.now = function () {
            return this._clock.now();
        };
        ClockTimer.prototype.setTimer = function (f, dt) {
            return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
        };
        ClockTimer.prototype.clearTimer = function (t) {
            return t instanceof Asap ? t.cancel() : clearTimeout(t);
        };
        return ClockTimer;
    }());
    var Asap = /** @class */ (function () {
        function Asap(f) {
            this.f = f;
            this.active = true;
        }
        Asap.prototype.run = function () {
            if (this.active) {
                return this.f();
            }
        };
        Asap.prototype.error = function (e) {
            throw e;
        };
        Asap.prototype.cancel = function () {
            this.active = false;
        };
        return Asap;
    }());
    function runAsap(f) {
        var task = new Asap(f);
        defer(task);
        return task;
    }

    /* global performance, process */
    var RelativeClock = /** @class */ (function () {
        function RelativeClock(clock, origin) {
            this.origin = origin;
            this.clock = clock;
        }
        RelativeClock.prototype.now = function () {
            return this.clock.now() - this.origin;
        };
        return RelativeClock;
    }());
    var HRTimeClock = /** @class */ (function () {
        function HRTimeClock(hrtime, origin) {
            this.origin = origin;
            this.hrtime = hrtime;
        }
        HRTimeClock.prototype.now = function () {
            var hrt = this.hrtime(this.origin);
            return (hrt[0] * 1e9 + hrt[1]) / 1e6;
        };
        return HRTimeClock;
    }());
    var clockRelativeTo = function (clock) {
        return new RelativeClock(clock, clock.now());
    };
    var newPerformanceClock = function () {
        return clockRelativeTo(performance);
    };
    /**
     * @deprecated will be removed in 2.0.0
     * Date.now is not monotonic, and performance.now is ubiquitous:
     * @see https://caniuse.com/#search=performance.now
     */
    var newDateClock = function () {
        return clockRelativeTo(Date);
    };
    var newHRTimeClock = function () {
        return new HRTimeClock(process.hrtime, process.hrtime());
    };
    var newPlatformClock = function () {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return newPerformanceClock();
        }
        else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
            return newHRTimeClock();
        }
        return newDateClock();
    };
    var newDefaultScheduler = function () { return new SchedulerImpl(newDefaultTimer(), new TimelineImpl()); };
    var newDefaultTimer = function () { return new ClockTimer(newPlatformClock()); };

    // Read the current time from the provided Scheduler
    var currentTime$1 = function (scheduler) { return scheduler.currentTime(); };

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
    var scroll = function (node, capture) {
      if ( capture === void 0 ) capture = false;

      return domEvent('scroll', node, capture);
    };

    var DomEvent = function DomEvent (event, node, capture) {
      this.event = event;
      this.node = node;
      this.capture = capture;
    };

    DomEvent.prototype.run = function run (sink, scheduler$$1) {
        var this$1 = this;

      var send = function (e) { return tryEvent$1(currentTime$1(scheduler$$1), e, sink); };
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
    var _isArray = Array.isArray || function _isArray(val) {
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

    var reduce$2 =
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

      return _arity(arguments[0].length, reduce$2(_pipe, arguments[0], tail(arguments)));
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

    var _objectIs$1 = typeof Object.is === 'function' ? Object.is : _objectIs;

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

    /**
     *
     * @param {function(String)} callback
     * @return {function(): void}
     */
    // initWithCallback :: (String -> *) -> (... -> undefined)
    function initWithCallback(callback) {
    	if (!isSupported()) {
    		console.warn("On-Screen-Keyboard detection not supported on this version of iOS");
    		return () => undefined;
    	}
    	
    	const
    		[ induceUnsubscribe, userUnsubscription ] = createAdapter(),
    		scheduler = newDefaultScheduler(),
    		HEURISTIC_VIEWPORT_HEIGHT_CLIENT_HEIGHT_RATIO = 0.85,
    		
    		isKeyboardShown = pipe(
    			() => mergeArray([
    				scroll(visualViewport),
    				resize(visualViewport),
    				scroll(window)
    			]),
    			debounce$1(800),
    			tap$1(() => { console.log(visualViewport.height * visualViewport.scale / document.documentElement.clientHeight); }),
    			map$1$1(() =>
    				visualViewport.height * visualViewport.scale / document.documentElement.clientHeight < HEURISTIC_VIEWPORT_HEIGHT_CLIENT_HEIGHT_RATIO
    			),
    			skipRepeats,
    			map$1$1(isShown => isShown ? "visible" : "hidden"),
    			until$1(userUnsubscription)
    		)();
    	
    	runEffects(tap$1(callback, isKeyboardShown), scheduler);
    	
    	return induceUnsubscribe;
    }

    /**
     * onscreen-keyboard-detector: osk-detector.js
     *
     * Created by Matthias Seemann on 21.03.2020.
     */

    const
    	userAgent = navigator.userAgent,
    	isTouchable = "ontouchend" in document,
       isIPad = /\b(\w*Macintosh\w*)\b/.test(userAgent) && isTouchable,
       isIPhone = /\b(\w*iPhone\w*)\b/.test(userAgent) &&
                /\b(\w*Mobile\w*)\b/.test(userAgent) &&
                isTouchable,
    	isIOS = isIPad || isIPhone,

    	getScreenOrientationType = () =>
    		screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape',
    	
    	// rejectCapture :: Stream Boolean -> Stream a -> Stream a
    	rejectCapture = curry(compose$1(join, snapshot$1((valveValue, event) => valveValue ? empty() : now(event)))),

    	isAnyElementActive = () => document.activeElement && (document.activeElement !== document.body);

    function isSupported$1() {
    	if (isIOS) {
    		return isSupported();
    	}
    	
    	return isTouchable;
    }

    /**
     *
     * @param {function(String)} userCallback
     * @return {function(): void}
     */
    // initWithCallback :: (String -> *) -> (... -> undefined)
    function initWithCallback$1(userCallback) {
    	if(isIOS) {
    		return initWithCallback(userCallback);
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
    		// Implementation note:
    		// On Chrome window.outerHeight changes together with window.innerHeight
    		// They seem to be always equal to each other.
    		
    		focus =
    			merge$1$1(focusin(document.documentElement), focusout(document.documentElement)),
    		
    		documentVisibility =
    			applyTo(domEvent('visibilitychange', document))(pipe(
    				map$1$1(() => document.visibilityState),
    				startWith$1(document.visibilityState)
    			)),
    		
    		isUnfocused =
    			applyTo(focus)(pipe(
    				map$1$1(evt =>
    					evt.type === 'focusin' ? now(false) : at(INPUT_ELEMENT_FOCUS_JUMP_DELAY, true)
    				),
    				switchLatest,
    				startWith$1(!isAnyElementActive()),
    				skipRepeats,
    				multicast
    			)),
    		
    		layoutHeightOnOSKFreeOrientationChange =
    			applyTo(change(screen.orientation))(pipe(
    				// The 'change' event hits very early BEFORE window.innerHeight is updated (e.g. on "resize")
    				snapshot$1(
    					unfocused => unfocused || (window.innerHeight === initialLayoutHeight),
    					isUnfocused
    				),
    				debounce$1(SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY),
    				map$1$1(isOSKFree => ({
    					screenOrientation: getScreenOrientationType(),
    					height: isOSKFree ? window.innerHeight : screen.availHeight - approximateBrowserToolbarHeight
    				}))
    			)),
    		
    		layoutHeightOnUnfocus =
    			applyTo(isUnfocused)(pipe(
    				filter$1(identical(true)),
    				map$1$1(() => ({screenOrientation: getScreenOrientationType(), height: window.innerHeight}))
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
    				delay$1$1(1000),
    				rejectCapture(map$1$1(equals("hidden"), documentVisibility)),
    				scan$1(
    					(accHeights, {screenOrientation, height}) =>
    						assoc(screenOrientation, height, accHeights),
    					{
    						[getScreenOrientationType()]: window.innerHeight
    					}
    				),
    				skipAfter$1(compose$1(isEmpty, difference(['portrait', 'landscape']), keys))
    			)),
    		
    		layoutHeightOnVerticalResize =
    			applyTo(resize(window))(pipe(
    				debounce$1(RESIZE_QUIET_PERIOD),
    				map$1$1(evt => ({ width: evt.target.innerWidth, height: evt.target.innerHeight})),
    				scan$1(
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
    				filter$1(propEq('isJustHeightResize', true))
    			)),
    		
    		osk =
    			applyTo(layoutHeightOnVerticalResize)(pipe(
    				delay$1$1(LAYOUT_RESIZE_TO_LAYOUT_HEIGHT_FIX_DELAY),
    				snapshot$1(
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
    				merge$1$1(applyTo(isUnfocused)(pipe(
    					filter$1(identical(true)),
    					map$1$1(always("hidden"))
    				))),
    				until$1(userUnsubscription),
    				skipRepeats
    			));
    	
    	runEffects(tap$1(userCallback, osk), scheduler);
    	
    	return induceUnsubscribe;
    }

    exports.isSupported = isSupported$1;
    exports.subscribe = initWithCallback$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
