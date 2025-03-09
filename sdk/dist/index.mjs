var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js
import { createContextKey } from "@opentelemetry/api";
function isTracingSuppressed(context2) {
  return context2.getValue(SUPPRESS_TRACING_KEY) === true;
}
var SUPPRESS_TRACING_KEY;
var init_suppress_tracing = __esm({
  "../../node_modules/@opentelemetry/core/build/esm/trace/suppress-tracing.js"() {
    SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
  }
});

// ../../node_modules/@opentelemetry/core/build/esm/ExportResult.js
var ExportResultCode;
var init_ExportResult = __esm({
  "../../node_modules/@opentelemetry/core/build/esm/ExportResult.js"() {
    (function(ExportResultCode2) {
      ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
      ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
    })(ExportResultCode || (ExportResultCode = {}));
  }
});

// ../../node_modules/@opentelemetry/core/build/esm/index.js
var init_esm = __esm({
  "../../node_modules/@opentelemetry/core/build/esm/index.js"() {
    init_ExportResult();
    init_suppress_tracing();
  }
});

// ../../node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js
var require_AbstractAsyncHooksContextManager = __commonJS({
  "../../node_modules/@opentelemetry/context-async-hooks/build/src/AbstractAsyncHooksContextManager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractAsyncHooksContextManager = void 0;
    var events_1 = __require("events");
    var ADD_LISTENER_METHODS = [
      "addListener",
      "on",
      "once",
      "prependListener",
      "prependOnceListener"
    ];
    var AbstractAsyncHooksContextManager = class {
      constructor() {
        this._kOtListeners = Symbol("OtListeners");
        this._wrapped = false;
      }
      /**
       * Binds a the certain context or the active one to the target function and then returns the target
       * @param context A context (span) to be bind to target
       * @param target a function or event emitter. When target or one of its callbacks is called,
       *  the provided context will be used as the active context for the duration of the call.
       */
      bind(context2, target) {
        if (target instanceof events_1.EventEmitter) {
          return this._bindEventEmitter(context2, target);
        }
        if (typeof target === "function") {
          return this._bindFunction(context2, target);
        }
        return target;
      }
      _bindFunction(context2, target) {
        const manager = this;
        const contextWrapper = function(...args) {
          return manager.with(context2, () => target.apply(this, args));
        };
        Object.defineProperty(contextWrapper, "length", {
          enumerable: false,
          configurable: true,
          writable: false,
          value: target.length
        });
        return contextWrapper;
      }
      /**
       * By default, EventEmitter call their callback with their context, which we do
       * not want, instead we will bind a specific context to all callbacks that
       * go through it.
       * @param context the context we want to bind
       * @param ee EventEmitter an instance of EventEmitter to patch
       */
      _bindEventEmitter(context2, ee) {
        const map = this._getPatchMap(ee);
        if (map !== void 0)
          return ee;
        this._createPatchMap(ee);
        ADD_LISTENER_METHODS.forEach((methodName) => {
          if (ee[methodName] === void 0)
            return;
          ee[methodName] = this._patchAddListener(ee, ee[methodName], context2);
        });
        if (typeof ee.removeListener === "function") {
          ee.removeListener = this._patchRemoveListener(ee, ee.removeListener);
        }
        if (typeof ee.off === "function") {
          ee.off = this._patchRemoveListener(ee, ee.off);
        }
        if (typeof ee.removeAllListeners === "function") {
          ee.removeAllListeners = this._patchRemoveAllListeners(ee, ee.removeAllListeners);
        }
        return ee;
      }
      /**
       * Patch methods that remove a given listener so that we match the "patched"
       * version of that listener (the one that propagate context).
       * @param ee EventEmitter instance
       * @param original reference to the patched method
       */
      _patchRemoveListener(ee, original) {
        const contextManager = this;
        return function(event, listener) {
          var _a;
          const events = (_a = contextManager._getPatchMap(ee)) === null || _a === void 0 ? void 0 : _a[event];
          if (events === void 0) {
            return original.call(this, event, listener);
          }
          const patchedListener = events.get(listener);
          return original.call(this, event, patchedListener || listener);
        };
      }
      /**
       * Patch methods that remove all listeners so we remove our
       * internal references for a given event.
       * @param ee EventEmitter instance
       * @param original reference to the patched method
       */
      _patchRemoveAllListeners(ee, original) {
        const contextManager = this;
        return function(event) {
          const map = contextManager._getPatchMap(ee);
          if (map !== void 0) {
            if (arguments.length === 0) {
              contextManager._createPatchMap(ee);
            } else if (map[event] !== void 0) {
              delete map[event];
            }
          }
          return original.apply(this, arguments);
        };
      }
      /**
       * Patch methods on an event emitter instance that can add listeners so we
       * can force them to propagate a given context.
       * @param ee EventEmitter instance
       * @param original reference to the patched method
       * @param [context] context to propagate when calling listeners
       */
      _patchAddListener(ee, original, context2) {
        const contextManager = this;
        return function(event, listener) {
          if (contextManager._wrapped) {
            return original.call(this, event, listener);
          }
          let map = contextManager._getPatchMap(ee);
          if (map === void 0) {
            map = contextManager._createPatchMap(ee);
          }
          let listeners = map[event];
          if (listeners === void 0) {
            listeners = /* @__PURE__ */ new WeakMap();
            map[event] = listeners;
          }
          const patchedListener = contextManager.bind(context2, listener);
          listeners.set(listener, patchedListener);
          contextManager._wrapped = true;
          try {
            return original.call(this, event, patchedListener);
          } finally {
            contextManager._wrapped = false;
          }
        };
      }
      _createPatchMap(ee) {
        const map = /* @__PURE__ */ Object.create(null);
        ee[this._kOtListeners] = map;
        return map;
      }
      _getPatchMap(ee) {
        return ee[this._kOtListeners];
      }
    };
    exports.AbstractAsyncHooksContextManager = AbstractAsyncHooksContextManager;
  }
});

// ../../node_modules/@opentelemetry/context-async-hooks/build/src/AsyncHooksContextManager.js
var require_AsyncHooksContextManager = __commonJS({
  "../../node_modules/@opentelemetry/context-async-hooks/build/src/AsyncHooksContextManager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncHooksContextManager = void 0;
    var api_1 = __require("@opentelemetry/api");
    var asyncHooks = __require("async_hooks");
    var AbstractAsyncHooksContextManager_1 = require_AbstractAsyncHooksContextManager();
    var AsyncHooksContextManager = class extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
      constructor() {
        super();
        this._contexts = /* @__PURE__ */ new Map();
        this._stack = [];
        this._asyncHook = asyncHooks.createHook({
          init: this._init.bind(this),
          before: this._before.bind(this),
          after: this._after.bind(this),
          destroy: this._destroy.bind(this),
          promiseResolve: this._destroy.bind(this)
        });
      }
      active() {
        var _a;
        return (_a = this._stack[this._stack.length - 1]) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
      }
      with(context2, fn, thisArg, ...args) {
        this._enterContext(context2);
        try {
          return fn.call(thisArg, ...args);
        } finally {
          this._exitContext();
        }
      }
      enable() {
        this._asyncHook.enable();
        return this;
      }
      disable() {
        this._asyncHook.disable();
        this._contexts.clear();
        this._stack = [];
        return this;
      }
      /**
       * Init hook will be called when userland create a async context, setting the
       * context as the current one if it exist.
       * @param uid id of the async context
       * @param type the resource type
       */
      _init(uid, type) {
        if (type === "TIMERWRAP")
          return;
        const context2 = this._stack[this._stack.length - 1];
        if (context2 !== void 0) {
          this._contexts.set(uid, context2);
        }
      }
      /**
       * Destroy hook will be called when a given context is no longer used so we can
       * remove its attached context.
       * @param uid uid of the async context
       */
      _destroy(uid) {
        this._contexts.delete(uid);
      }
      /**
       * Before hook is called just before executing a async context.
       * @param uid uid of the async context
       */
      _before(uid) {
        const context2 = this._contexts.get(uid);
        if (context2 !== void 0) {
          this._enterContext(context2);
        }
      }
      /**
       * After hook is called just after completing the execution of a async context.
       */
      _after() {
        this._exitContext();
      }
      /**
       * Set the given context as active
       */
      _enterContext(context2) {
        this._stack.push(context2);
      }
      /**
       * Remove the context at the root of the stack
       */
      _exitContext() {
        this._stack.pop();
      }
    };
    exports.AsyncHooksContextManager = AsyncHooksContextManager;
  }
});

// ../../node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js
var require_AsyncLocalStorageContextManager = __commonJS({
  "../../node_modules/@opentelemetry/context-async-hooks/build/src/AsyncLocalStorageContextManager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncLocalStorageContextManager = void 0;
    var api_1 = __require("@opentelemetry/api");
    var async_hooks_1 = __require("async_hooks");
    var AbstractAsyncHooksContextManager_1 = require_AbstractAsyncHooksContextManager();
    var AsyncLocalStorageContextManager = class extends AbstractAsyncHooksContextManager_1.AbstractAsyncHooksContextManager {
      constructor() {
        super();
        this._asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
      }
      active() {
        var _a;
        return (_a = this._asyncLocalStorage.getStore()) !== null && _a !== void 0 ? _a : api_1.ROOT_CONTEXT;
      }
      with(context2, fn, thisArg, ...args) {
        const cb = thisArg == null ? fn : fn.bind(thisArg);
        return this._asyncLocalStorage.run(context2, cb, ...args);
      }
      enable() {
        return this;
      }
      disable() {
        this._asyncLocalStorage.disable();
        return this;
      }
    };
    exports.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager;
  }
});

// ../../node_modules/@opentelemetry/context-async-hooks/build/src/index.js
var require_src = __commonJS({
  "../../node_modules/@opentelemetry/context-async-hooks/build/src/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncLocalStorageContextManager = exports.AsyncHooksContextManager = void 0;
    var AsyncHooksContextManager_1 = require_AsyncHooksContextManager();
    Object.defineProperty(exports, "AsyncHooksContextManager", { enumerable: true, get: function() {
      return AsyncHooksContextManager_1.AsyncHooksContextManager;
    } });
    var AsyncLocalStorageContextManager_1 = require_AsyncLocalStorageContextManager();
    Object.defineProperty(exports, "AsyncLocalStorageContextManager", { enumerable: true, get: function() {
      return AsyncLocalStorageContextManager_1.AsyncLocalStorageContextManager;
    } });
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/common.js
import { createContextKey as createContextKey2 } from "@opentelemetry/api";
var B3_DEBUG_FLAG_KEY;
var init_common = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/common.js"() {
    B3_DEBUG_FLAG_KEY = createContextKey2("OpenTelemetry Context Key B3 Debug Flag");
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/constants.js
var B3_CONTEXT_HEADER, X_B3_TRACE_ID, X_B3_SPAN_ID, X_B3_SAMPLED, X_B3_PARENT_SPAN_ID, X_B3_FLAGS;
var init_constants = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/constants.js"() {
    B3_CONTEXT_HEADER = "b3";
    X_B3_TRACE_ID = "x-b3-traceid";
    X_B3_SPAN_ID = "x-b3-spanid";
    X_B3_SAMPLED = "x-b3-sampled";
    X_B3_PARENT_SPAN_ID = "x-b3-parentspanid";
    X_B3_FLAGS = "x-b3-flags";
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/B3MultiPropagator.js
import { isSpanContextValid, isValidSpanId, isValidTraceId, trace, TraceFlags } from "@opentelemetry/api";
function isValidSampledValue(sampled) {
  return sampled === TraceFlags.SAMPLED || sampled === TraceFlags.NONE;
}
function parseHeader(header) {
  return Array.isArray(header) ? header[0] : header;
}
function getHeaderValue(carrier, getter, key) {
  var header = getter.get(carrier, key);
  return parseHeader(header);
}
function getTraceId(carrier, getter) {
  var traceId = getHeaderValue(carrier, getter, X_B3_TRACE_ID);
  if (typeof traceId === "string") {
    return traceId.padStart(32, "0");
  }
  return "";
}
function getSpanId(carrier, getter) {
  var spanId = getHeaderValue(carrier, getter, X_B3_SPAN_ID);
  if (typeof spanId === "string") {
    return spanId;
  }
  return "";
}
function getDebug(carrier, getter) {
  var debug = getHeaderValue(carrier, getter, X_B3_FLAGS);
  return debug === "1" ? "1" : void 0;
}
function getTraceFlags(carrier, getter) {
  var traceFlags = getHeaderValue(carrier, getter, X_B3_SAMPLED);
  var debug = getDebug(carrier, getter);
  if (debug === "1" || VALID_SAMPLED_VALUES.has(traceFlags)) {
    return TraceFlags.SAMPLED;
  }
  if (traceFlags === void 0 || VALID_UNSAMPLED_VALUES.has(traceFlags)) {
    return TraceFlags.NONE;
  }
  return;
}
var VALID_SAMPLED_VALUES, VALID_UNSAMPLED_VALUES, B3MultiPropagator;
var init_B3MultiPropagator = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/B3MultiPropagator.js"() {
    init_esm();
    init_common();
    init_constants();
    VALID_SAMPLED_VALUES = /* @__PURE__ */ new Set([true, "true", "True", "1", 1]);
    VALID_UNSAMPLED_VALUES = /* @__PURE__ */ new Set([false, "false", "False", "0", 0]);
    B3MultiPropagator = /** @class */
    function() {
      function B3MultiPropagator2() {
      }
      B3MultiPropagator2.prototype.inject = function(context2, carrier, setter) {
        var spanContext = trace.getSpanContext(context2);
        if (!spanContext || !isSpanContextValid(spanContext) || isTracingSuppressed(context2))
          return;
        var debug = context2.getValue(B3_DEBUG_FLAG_KEY);
        setter.set(carrier, X_B3_TRACE_ID, spanContext.traceId);
        setter.set(carrier, X_B3_SPAN_ID, spanContext.spanId);
        if (debug === "1") {
          setter.set(carrier, X_B3_FLAGS, debug);
        } else if (spanContext.traceFlags !== void 0) {
          setter.set(carrier, X_B3_SAMPLED, (TraceFlags.SAMPLED & spanContext.traceFlags) === TraceFlags.SAMPLED ? "1" : "0");
        }
      };
      B3MultiPropagator2.prototype.extract = function(context2, carrier, getter) {
        var traceId = getTraceId(carrier, getter);
        var spanId = getSpanId(carrier, getter);
        var traceFlags = getTraceFlags(carrier, getter);
        var debug = getDebug(carrier, getter);
        if (isValidTraceId(traceId) && isValidSpanId(spanId) && isValidSampledValue(traceFlags)) {
          context2 = context2.setValue(B3_DEBUG_FLAG_KEY, debug);
          return trace.setSpanContext(context2, {
            traceId,
            spanId,
            isRemote: true,
            traceFlags
          });
        }
        return context2;
      };
      B3MultiPropagator2.prototype.fields = function() {
        return [
          X_B3_TRACE_ID,
          X_B3_SPAN_ID,
          X_B3_FLAGS,
          X_B3_SAMPLED,
          X_B3_PARENT_SPAN_ID
        ];
      };
      return B3MultiPropagator2;
    }();
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/B3SinglePropagator.js
import { isSpanContextValid as isSpanContextValid2, isValidSpanId as isValidSpanId2, isValidTraceId as isValidTraceId2, trace as trace2, TraceFlags as TraceFlags2 } from "@opentelemetry/api";
function convertToTraceId128(traceId) {
  return traceId.length === 32 ? traceId : "" + PADDING + traceId;
}
function convertToTraceFlags(samplingState) {
  if (samplingState && SAMPLED_VALUES.has(samplingState)) {
    return TraceFlags2.SAMPLED;
  }
  return TraceFlags2.NONE;
}
var __read, B3_CONTEXT_REGEX, PADDING, SAMPLED_VALUES, DEBUG_STATE, B3SinglePropagator;
var init_B3SinglePropagator = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/B3SinglePropagator.js"() {
    init_esm();
    init_common();
    init_constants();
    __read = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    B3_CONTEXT_REGEX = /((?:[0-9a-f]{16}){1,2})-([0-9a-f]{16})(?:-([01d](?![0-9a-f])))?(?:-([0-9a-f]{16}))?/;
    PADDING = "0".repeat(16);
    SAMPLED_VALUES = /* @__PURE__ */ new Set(["d", "1"]);
    DEBUG_STATE = "d";
    B3SinglePropagator = /** @class */
    function() {
      function B3SinglePropagator2() {
      }
      B3SinglePropagator2.prototype.inject = function(context2, carrier, setter) {
        var spanContext = trace2.getSpanContext(context2);
        if (!spanContext || !isSpanContextValid2(spanContext) || isTracingSuppressed(context2))
          return;
        var samplingState = context2.getValue(B3_DEBUG_FLAG_KEY) || spanContext.traceFlags & 1;
        var value = spanContext.traceId + "-" + spanContext.spanId + "-" + samplingState;
        setter.set(carrier, B3_CONTEXT_HEADER, value);
      };
      B3SinglePropagator2.prototype.extract = function(context2, carrier, getter) {
        var header = getter.get(carrier, B3_CONTEXT_HEADER);
        var b3Context = Array.isArray(header) ? header[0] : header;
        if (typeof b3Context !== "string")
          return context2;
        var match = b3Context.match(B3_CONTEXT_REGEX);
        if (!match)
          return context2;
        var _a = __read(match, 4), extractedTraceId = _a[1], spanId = _a[2], samplingState = _a[3];
        var traceId = convertToTraceId128(extractedTraceId);
        if (!isValidTraceId2(traceId) || !isValidSpanId2(spanId))
          return context2;
        var traceFlags = convertToTraceFlags(samplingState);
        if (samplingState === DEBUG_STATE) {
          context2 = context2.setValue(B3_DEBUG_FLAG_KEY, samplingState);
        }
        return trace2.setSpanContext(context2, {
          traceId,
          spanId,
          isRemote: true,
          traceFlags
        });
      };
      B3SinglePropagator2.prototype.fields = function() {
        return [B3_CONTEXT_HEADER];
      };
      return B3SinglePropagator2;
    }();
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/types.js
var B3InjectEncoding;
var init_types = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/types.js"() {
    (function(B3InjectEncoding2) {
      B3InjectEncoding2[B3InjectEncoding2["SINGLE_HEADER"] = 0] = "SINGLE_HEADER";
      B3InjectEncoding2[B3InjectEncoding2["MULTI_HEADER"] = 1] = "MULTI_HEADER";
    })(B3InjectEncoding || (B3InjectEncoding = {}));
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/B3Propagator.js
var B3Propagator;
var init_B3Propagator = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/B3Propagator.js"() {
    init_esm();
    init_B3MultiPropagator();
    init_B3SinglePropagator();
    init_constants();
    init_types();
    B3Propagator = /** @class */
    function() {
      function B3Propagator2(config) {
        if (config === void 0) {
          config = {};
        }
        this._b3MultiPropagator = new B3MultiPropagator();
        this._b3SinglePropagator = new B3SinglePropagator();
        if (config.injectEncoding === B3InjectEncoding.MULTI_HEADER) {
          this._inject = this._b3MultiPropagator.inject;
          this._fields = this._b3MultiPropagator.fields();
        } else {
          this._inject = this._b3SinglePropagator.inject;
          this._fields = this._b3SinglePropagator.fields();
        }
      }
      B3Propagator2.prototype.inject = function(context2, carrier, setter) {
        if (isTracingSuppressed(context2)) {
          return;
        }
        this._inject(context2, carrier, setter);
      };
      B3Propagator2.prototype.extract = function(context2, carrier, getter) {
        var header = getter.get(carrier, B3_CONTEXT_HEADER);
        var b3Context = Array.isArray(header) ? header[0] : header;
        if (b3Context) {
          return this._b3SinglePropagator.extract(context2, carrier, getter);
        } else {
          return this._b3MultiPropagator.extract(context2, carrier, getter);
        }
      };
      B3Propagator2.prototype.fields = function() {
        return this._fields;
      };
      return B3Propagator2;
    }();
  }
});

// ../../node_modules/@opentelemetry/propagator-b3/build/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  B3InjectEncoding: () => B3InjectEncoding,
  B3Propagator: () => B3Propagator,
  B3_CONTEXT_HEADER: () => B3_CONTEXT_HEADER,
  X_B3_FLAGS: () => X_B3_FLAGS,
  X_B3_PARENT_SPAN_ID: () => X_B3_PARENT_SPAN_ID,
  X_B3_SAMPLED: () => X_B3_SAMPLED,
  X_B3_SPAN_ID: () => X_B3_SPAN_ID,
  X_B3_TRACE_ID: () => X_B3_TRACE_ID
});
var init_esm2 = __esm({
  "../../node_modules/@opentelemetry/propagator-b3/build/esm/index.js"() {
    init_B3Propagator();
    init_constants();
    init_types();
  }
});

// ../../node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "../../node_modules/semver/internal/constants.js"(exports, module) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// ../../node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "../../node_modules/semver/internal/debug.js"(exports, module) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug;
  }
});

// ../../node_modules/semver/internal/re.js
var require_re = __commonJS({
  "../../node_modules/semver/internal/re.js"(exports, module) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// ../../node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "../../node_modules/semver/internal/parse-options.js"(exports, module) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// ../../node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "../../node_modules/semver/internal/identifiers.js"(exports, module) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// ../../node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "../../node_modules/semver/classes/semver.js"(exports, module) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// ../../node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "../../node_modules/semver/functions/parse.js"(exports, module) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse;
  }
});

// ../../node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "../../node_modules/semver/functions/valid.js"(exports, module) {
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// ../../node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "../../node_modules/semver/functions/clean.js"(exports, module) {
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// ../../node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "../../node_modules/semver/functions/inc.js"(exports, module) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// ../../node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "../../node_modules/semver/functions/diff.js"(exports, module) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// ../../node_modules/semver/functions/major.js
var require_major = __commonJS({
  "../../node_modules/semver/functions/major.js"(exports, module) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// ../../node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "../../node_modules/semver/functions/minor.js"(exports, module) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// ../../node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "../../node_modules/semver/functions/patch.js"(exports, module) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// ../../node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "../../node_modules/semver/functions/prerelease.js"(exports, module) {
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// ../../node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "../../node_modules/semver/functions/compare.js"(exports, module) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// ../../node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "../../node_modules/semver/functions/rcompare.js"(exports, module) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// ../../node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "../../node_modules/semver/functions/compare-loose.js"(exports, module) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// ../../node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "../../node_modules/semver/functions/compare-build.js"(exports, module) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// ../../node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "../../node_modules/semver/functions/sort.js"(exports, module) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// ../../node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "../../node_modules/semver/functions/rsort.js"(exports, module) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// ../../node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "../../node_modules/semver/functions/gt.js"(exports, module) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  }
});

// ../../node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "../../node_modules/semver/functions/lt.js"(exports, module) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  }
});

// ../../node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "../../node_modules/semver/functions/eq.js"(exports, module) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// ../../node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "../../node_modules/semver/functions/neq.js"(exports, module) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// ../../node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "../../node_modules/semver/functions/gte.js"(exports, module) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  }
});

// ../../node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "../../node_modules/semver/functions/lte.js"(exports, module) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// ../../node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "../../node_modules/semver/functions/cmp.js"(exports, module) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// ../../node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "../../node_modules/semver/functions/coerce.js"(exports, module) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// ../../node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "../../node_modules/semver/internal/lrucache.js"(exports, module) {
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// ../../node_modules/semver/classes/range.js
var require_range = __commonJS({
  "../../node_modules/semver/classes/range.js"(exports, module) {
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache2.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache2.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache2 = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// ../../node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "../../node_modules/semver/classes/comparator.js"(exports, module) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// ../../node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "../../node_modules/semver/functions/satisfies.js"(exports, module) {
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module.exports = satisfies;
  }
});

// ../../node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "../../node_modules/semver/ranges/to-comparators.js"(exports, module) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// ../../node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "../../node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// ../../node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "../../node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// ../../node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "../../node_modules/semver/ranges/min-version.js"(exports, module) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// ../../node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "../../node_modules/semver/ranges/valid.js"(exports, module) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// ../../node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "../../node_modules/semver/ranges/outside.js"(exports, module) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// ../../node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "../../node_modules/semver/ranges/gtr.js"(exports, module) {
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module.exports = gtr;
  }
});

// ../../node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "../../node_modules/semver/ranges/ltr.js"(exports, module) {
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module.exports = ltr;
  }
});

// ../../node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "../../node_modules/semver/ranges/intersects.js"(exports, module) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects;
  }
});

// ../../node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "../../node_modules/semver/ranges/simplify.js"(exports, module) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// ../../node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "../../node_modules/semver/ranges/subset.js"(exports, module) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// ../../node_modules/semver/index.js
var require_semver2 = __commonJS({
  "../../node_modules/semver/index.js"(exports, module) {
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// ../../node_modules/@opentelemetry/propagator-jaeger/build/esm/JaegerPropagator.js
import { propagation, trace as trace3, TraceFlags as TraceFlags3 } from "@opentelemetry/api";
function deserializeSpanContext(serializedString) {
  var headers = decodeURIComponent(serializedString).split(":");
  if (headers.length !== 4) {
    return null;
  }
  var _a = __read2(headers, 4), _traceId = _a[0], _spanId = _a[1], flags = _a[3];
  var traceId = _traceId.padStart(32, "0");
  var spanId = _spanId.padStart(16, "0");
  var traceFlags = VALID_HEX_RE.test(flags) ? parseInt(flags, 16) & 1 : 1;
  return { traceId, spanId, isRemote: true, traceFlags };
}
var __values, __read2, UBER_TRACE_ID_HEADER, UBER_BAGGAGE_HEADER_PREFIX, JaegerPropagator, VALID_HEX_RE;
var init_JaegerPropagator = __esm({
  "../../node_modules/@opentelemetry/propagator-jaeger/build/esm/JaegerPropagator.js"() {
    init_esm();
    __values = function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function() {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    __read2 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        } finally {
          if (e) throw e.error;
        }
      }
      return ar;
    };
    UBER_TRACE_ID_HEADER = "uber-trace-id";
    UBER_BAGGAGE_HEADER_PREFIX = "uberctx";
    JaegerPropagator = /** @class */
    function() {
      function JaegerPropagator2(config) {
        if (typeof config === "string") {
          this._jaegerTraceHeader = config;
          this._jaegerBaggageHeaderPrefix = UBER_BAGGAGE_HEADER_PREFIX;
        } else {
          this._jaegerTraceHeader = (config === null || config === void 0 ? void 0 : config.customTraceHeader) || UBER_TRACE_ID_HEADER;
          this._jaegerBaggageHeaderPrefix = (config === null || config === void 0 ? void 0 : config.customBaggageHeaderPrefix) || UBER_BAGGAGE_HEADER_PREFIX;
        }
      }
      JaegerPropagator2.prototype.inject = function(context2, carrier, setter) {
        var e_1, _a;
        var spanContext = trace3.getSpanContext(context2);
        var baggage = propagation.getBaggage(context2);
        if (spanContext && isTracingSuppressed(context2) === false) {
          var traceFlags = "0" + (spanContext.traceFlags || TraceFlags3.NONE).toString(16);
          setter.set(carrier, this._jaegerTraceHeader, spanContext.traceId + ":" + spanContext.spanId + ":0:" + traceFlags);
        }
        if (baggage) {
          try {
            for (var _b = __values(baggage.getAllEntries()), _c = _b.next(); !_c.done; _c = _b.next()) {
              var _d = __read2(_c.value, 2), key = _d[0], entry = _d[1];
              setter.set(carrier, this._jaegerBaggageHeaderPrefix + "-" + key, encodeURIComponent(entry.value));
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }
      };
      JaegerPropagator2.prototype.extract = function(context2, carrier, getter) {
        var e_2, _a;
        var _this = this;
        var _b;
        var uberTraceIdHeader = getter.get(carrier, this._jaegerTraceHeader);
        var uberTraceId = Array.isArray(uberTraceIdHeader) ? uberTraceIdHeader[0] : uberTraceIdHeader;
        var baggageValues = getter.keys(carrier).filter(function(key) {
          return key.startsWith(_this._jaegerBaggageHeaderPrefix + "-");
        }).map(function(key) {
          var value = getter.get(carrier, key);
          return {
            key: key.substring(_this._jaegerBaggageHeaderPrefix.length + 1),
            value: Array.isArray(value) ? value[0] : value
          };
        });
        var newContext = context2;
        if (typeof uberTraceId === "string") {
          var spanContext = deserializeSpanContext(uberTraceId);
          if (spanContext) {
            newContext = trace3.setSpanContext(newContext, spanContext);
          }
        }
        if (baggageValues.length === 0)
          return newContext;
        var currentBaggage = (_b = propagation.getBaggage(context2)) !== null && _b !== void 0 ? _b : propagation.createBaggage();
        try {
          for (var baggageValues_1 = __values(baggageValues), baggageValues_1_1 = baggageValues_1.next(); !baggageValues_1_1.done; baggageValues_1_1 = baggageValues_1.next()) {
            var baggageEntry = baggageValues_1_1.value;
            if (baggageEntry.value === void 0)
              continue;
            currentBaggage = currentBaggage.setEntry(baggageEntry.key, {
              value: decodeURIComponent(baggageEntry.value)
            });
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (baggageValues_1_1 && !baggageValues_1_1.done && (_a = baggageValues_1.return)) _a.call(baggageValues_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
        newContext = propagation.setBaggage(newContext, currentBaggage);
        return newContext;
      };
      JaegerPropagator2.prototype.fields = function() {
        return [this._jaegerTraceHeader];
      };
      return JaegerPropagator2;
    }();
    VALID_HEX_RE = /^[0-9a-f]{1,2}$/i;
  }
});

// ../../node_modules/@opentelemetry/propagator-jaeger/build/esm/index.js
var esm_exports2 = {};
__export(esm_exports2, {
  JaegerPropagator: () => JaegerPropagator,
  UBER_BAGGAGE_HEADER_PREFIX: () => UBER_BAGGAGE_HEADER_PREFIX,
  UBER_TRACE_ID_HEADER: () => UBER_TRACE_ID_HEADER
});
var init_esm3 = __esm({
  "../../node_modules/@opentelemetry/propagator-jaeger/build/esm/index.js"() {
    init_JaegerPropagator();
  }
});

// ../../node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js
var require_NodeTracerProvider = __commonJS({
  "../../node_modules/@opentelemetry/sdk-trace-node/build/src/NodeTracerProvider.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeTracerProvider = void 0;
    var context_async_hooks_1 = require_src();
    var propagator_b3_1 = (init_esm2(), __toCommonJS(esm_exports));
    var sdk_trace_base_1 = __require("@opentelemetry/sdk-trace-base");
    var semver = require_semver2();
    var propagator_jaeger_1 = (init_esm3(), __toCommonJS(esm_exports2));
    var NodeTracerProvider = class extends sdk_trace_base_1.BasicTracerProvider {
      constructor(config = {}) {
        super(config);
      }
      register(config = {}) {
        if (config.contextManager === void 0) {
          const ContextManager = semver.gte(process.version, "14.8.0") ? context_async_hooks_1.AsyncLocalStorageContextManager : context_async_hooks_1.AsyncHooksContextManager;
          config.contextManager = new ContextManager();
          config.contextManager.enable();
        }
        super.register(config);
      }
    };
    exports.NodeTracerProvider = NodeTracerProvider;
    NodeTracerProvider._registeredPropagators = new Map([
      ...sdk_trace_base_1.BasicTracerProvider._registeredPropagators,
      [
        "b3",
        () => new propagator_b3_1.B3Propagator({ injectEncoding: propagator_b3_1.B3InjectEncoding.SINGLE_HEADER })
      ],
      [
        "b3multi",
        () => new propagator_b3_1.B3Propagator({ injectEncoding: propagator_b3_1.B3InjectEncoding.MULTI_HEADER })
      ],
      ["jaeger", () => new propagator_jaeger_1.JaegerPropagator()]
    ]);
  }
});

// ../../node_modules/@opentelemetry/sdk-trace-node/build/src/index.js
var require_src2 = __commonJS({
  "../../node_modules/@opentelemetry/sdk-trace-node/build/src/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tracer = exports.TraceIdRatioBasedSampler = exports.Span = exports.SimpleSpanProcessor = exports.SamplingDecision = exports.RandomIdGenerator = exports.ParentBasedSampler = exports.NoopSpanProcessor = exports.InMemorySpanExporter = exports.ForceFlushState = exports.ConsoleSpanExporter = exports.BatchSpanProcessor = exports.BasicTracerProvider = exports.AlwaysOnSampler = exports.AlwaysOffSampler = exports.NodeTracerProvider = void 0;
    var NodeTracerProvider_1 = require_NodeTracerProvider();
    Object.defineProperty(exports, "NodeTracerProvider", { enumerable: true, get: function() {
      return NodeTracerProvider_1.NodeTracerProvider;
    } });
    var sdk_trace_base_1 = __require("@opentelemetry/sdk-trace-base");
    Object.defineProperty(exports, "AlwaysOffSampler", { enumerable: true, get: function() {
      return sdk_trace_base_1.AlwaysOffSampler;
    } });
    Object.defineProperty(exports, "AlwaysOnSampler", { enumerable: true, get: function() {
      return sdk_trace_base_1.AlwaysOnSampler;
    } });
    Object.defineProperty(exports, "BasicTracerProvider", { enumerable: true, get: function() {
      return sdk_trace_base_1.BasicTracerProvider;
    } });
    Object.defineProperty(exports, "BatchSpanProcessor", { enumerable: true, get: function() {
      return sdk_trace_base_1.BatchSpanProcessor;
    } });
    Object.defineProperty(exports, "ConsoleSpanExporter", { enumerable: true, get: function() {
      return sdk_trace_base_1.ConsoleSpanExporter;
    } });
    Object.defineProperty(exports, "ForceFlushState", { enumerable: true, get: function() {
      return sdk_trace_base_1.ForceFlushState;
    } });
    Object.defineProperty(exports, "InMemorySpanExporter", { enumerable: true, get: function() {
      return sdk_trace_base_1.InMemorySpanExporter;
    } });
    Object.defineProperty(exports, "NoopSpanProcessor", { enumerable: true, get: function() {
      return sdk_trace_base_1.NoopSpanProcessor;
    } });
    Object.defineProperty(exports, "ParentBasedSampler", { enumerable: true, get: function() {
      return sdk_trace_base_1.ParentBasedSampler;
    } });
    Object.defineProperty(exports, "RandomIdGenerator", { enumerable: true, get: function() {
      return sdk_trace_base_1.RandomIdGenerator;
    } });
    Object.defineProperty(exports, "SamplingDecision", { enumerable: true, get: function() {
      return sdk_trace_base_1.SamplingDecision;
    } });
    Object.defineProperty(exports, "SimpleSpanProcessor", { enumerable: true, get: function() {
      return sdk_trace_base_1.SimpleSpanProcessor;
    } });
    Object.defineProperty(exports, "Span", { enumerable: true, get: function() {
      return sdk_trace_base_1.Span;
    } });
    Object.defineProperty(exports, "TraceIdRatioBasedSampler", { enumerable: true, get: function() {
      return sdk_trace_base_1.TraceIdRatioBasedSampler;
    } });
    Object.defineProperty(exports, "Tracer", { enumerable: true, get: function() {
      return sdk_trace_base_1.Tracer;
    } });
  }
});

// src/config.ts
var PUZZLET_TRACE_ENDPOINT = `v1/export-traces`;
var PUZZLET_TEMPLATE_ENDPOINT = `v1/templates`;

// src/cache.ts
import TTLCache from "@isaacs/ttlcache";
var cache = new TTLCache({
  max: 1e4,
  ttl: 6e4
});
var cache_default = cache;

// src/trace/tracing.ts
import { NodeSDK } from "@opentelemetry/sdk-node";

// src/trace/puzzlet-exporter.ts
init_esm();
var PuzzletExporter = class {
  constructor(apiKey, appId, baseUrl) {
    this.sendingPromises = [];
    this.apiKey = apiKey;
    this.isShutdown = false;
    this.appId = appId;
    this.baseUrl = baseUrl;
  }
  async export(spans, resultCallback) {
    if (this.isShutdown) {
      setTimeout(
        () => resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error("Exporter has been shutdown")
        })
      );
      return;
    }
    const promise = new Promise((resolve) => {
      this.sendSpans(spans, (result) => {
        resolve();
        resultCallback(result);
      });
    });
    this.sendingPromises.push(promise);
    const popPromise = () => {
      const index = this.sendingPromises.indexOf(promise);
      this.sendingPromises.splice(index, 1);
    };
    promise.then(popPromise, popPromise);
  }
  shutdown() {
    this.isShutdown = true;
    return this.forceFlush();
  }
  /**
   * Exports any pending spans in exporter
   */
  forceFlush() {
    return new Promise((resolve, reject) => {
      Promise.all(this.sendingPromises).then(() => {
        resolve();
      }, reject);
    });
  }
  sendSpans(spans, done) {
    const spanData = spans.map((span) => this.toPuzzletFormat(span));
    fetch(`${this.baseUrl}/${PUZZLET_TRACE_ENDPOINT}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${this.apiKey}`,
        "X-Puzzlet-App-Id": this.appId
      },
      body: JSON.stringify(spanData),
      method: "POST"
    }).then(async (response) => {
      if (response.ok) {
        done == null ? void 0 : done({ code: ExportResultCode.SUCCESS });
      } else {
        done == null ? void 0 : done({
          code: ExportResultCode.FAILED,
          error: new Error(response.statusText)
        });
        throw new Error(await response.text());
      }
    }).catch((e) => {
      done == null ? void 0 : done({ code: ExportResultCode.FAILED, error: e });
      throw e;
    });
  }
  hrTimeToNanos(hrTime) {
    const nanosInOneSecond = 1e9;
    const seconds = hrTime[0];
    const nanos = hrTime[1];
    return seconds * nanosInOneSecond + nanos;
  }
  toPuzzletFormat(span) {
    const events = span.events.map((event) => ({
      timestamp: this.hrTimeToNanos(event.time),
      name: event.name,
      attributes: event.attributes
    }));
    const links = span.links.map((link) => ({
      traceId: link.context.traceId,
      spanId: link.context.spanId,
      traceState: link.context.traceState,
      attributes: link.attributes
    }));
    const nanosInOneMilli = 1e6;
    const startTimeInNano = this.hrTimeToNanos(span.startTime);
    const endTimeInNano = this.hrTimeToNanos(span.endTime);
    const durationInMillis = Math.floor(
      (endTimeInNano - startTimeInNano) / nanosInOneMilli
    );
    const spanAttributes = {
      ...span.attributes,
      "end_time": endTimeInNano
    };
    return {
      Timestamp: startTimeInNano,
      TraceId: span.spanContext().traceId,
      SpanId: span.spanContext().spanId,
      ParentSpanId: span.parentSpanId || "",
      TraceState: span.spanContext().traceState || "",
      SpanName: span.name,
      SpanKind: span.kind,
      ServiceName: span.resource.attributes["service.name"] || "",
      ResourceAttributes: span.resource.attributes,
      SpanAttributes: spanAttributes,
      Duration: durationInMillis,
      StatusCode: span.status.code,
      StatusMessage: span.status.message || "",
      "Events.Timestamp": events.map((event) => event.timestamp),
      "Events.Name": events.map((event) => event.name),
      "Events.Attributes": events.map((event) => event.attributes),
      "Links.TraceId": links.map((link) => link.traceId),
      "Links.SpanId": links.map((link) => link.spanId),
      "Links.TraceState": links.map((link) => link.traceState),
      "Links.Attributes": links.map((link) => link.attributes)
    };
  }
};

// src/trace/sampler.ts
import { SamplingDecision } from "@opentelemetry/sdk-trace-base";
var FILTERED_ATTRIBUTE_KEYS = ["next.span_name", "next.clientComponentLoadCount"];
var PuzzletSampler = class {
  shouldSample(_context, _traceId, _spanName, _spanKind, attributes) {
    let filter = false;
    FILTERED_ATTRIBUTE_KEYS.forEach((key) => {
      if (attributes == null ? void 0 : attributes[key]) {
        filter = true;
      }
    });
    return {
      decision: filter ? SamplingDecision.NOT_RECORD : SamplingDecision.RECORD_AND_SAMPLED
    };
  }
  toString() {
    return "PuzzletSampler";
  }
};

// src/trace/tracing.ts
var import_sdk_trace_node = __toESM(require_src2());
import api, { context, ROOT_CONTEXT, SpanStatusCode } from "@opentelemetry/api";
var initialize = ({
  apiKey,
  appId,
  baseUrl,
  disableBatch
}) => {
  const puzzletExporter = new PuzzletExporter(apiKey, appId, baseUrl);
  const spanProcessor = disableBatch ? new import_sdk_trace_node.SimpleSpanProcessor(puzzletExporter) : new import_sdk_trace_node.BatchSpanProcessor(puzzletExporter);
  const sdk = new NodeSDK({
    traceExporter: puzzletExporter,
    sampler: new PuzzletSampler(),
    spanProcessors: [spanProcessor]
  });
  sdk.start();
  return sdk;
};
var trace4 = (name, fn) => {
  const tracer = api.trace.getTracer("ai");
  return context.with(
    ROOT_CONTEXT,
    async () => tracer.startActiveSpan(name, async (span) => {
      try {
        const response = fn();
        if (response instanceof Promise) {
          const result = await response;
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        }
        span.setStatus({ code: SpanStatusCode.OK });
        return response;
      } catch (e) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: e.message
        });
        throw e;
      } finally {
        span.end();
      }
    })
  );
};
var component = (name, fn) => {
  const tracer = api.trace.getTracer("ai");
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const response = fn();
      if (response instanceof Promise) {
        const result = await response;
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      return response;
    } catch (e) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: e.message
      });
      throw e;
    } finally {
      span.end();
    }
  });
};

// src/puzzlet.ts
var Puzzlet = class {
  constructor({ apiKey, appId, baseUrl }, createRunner) {
    this.baseUrl = "https://api.puzzlet.ai";
    this.fetchPrompt = async (templatePath, options = { cache: { ttl: 1e3 * 60 } }) => {
      if (!this.createRunner) {
        throw new Error("createRunner is required but was not provided");
      }
      const ast = options.cache && cache_default.has(templatePath) ? cache_default.get(templatePath) : await this.fetchRequestForTemplate(templatePath);
      if (options.cache) {
        cache_default.set(templatePath, ast, {
          ttl: options.cache.ttl
        });
      }
      const runner = this.createRunner(ast);
      return {
        content: ast,
        ...runner
      };
    };
    this.fetchRequestForTemplate = async (templatePath) => {
      const headers = new Headers({
        "Content-Type": "application/json",
        "X-Puzzlet-App-Id": this.appId,
        Authorization: `${this.apiKey}`
      });
      const response = await fetch(
        `${this.baseUrl}/${PUZZLET_TEMPLATE_ENDPOINT}?path=${templatePath}`,
        {
          headers
        }
      );
      if (response.ok) {
        return (await response.json()).data;
      }
      const errorResponse = await response.json();
      throw errorResponse.error;
    };
    this.apiKey = apiKey;
    this.appId = appId;
    this.baseUrl = baseUrl || this.baseUrl;
    this.createRunner = createRunner;
  }
  initTracing({ disableBatch } = {}) {
    return initialize({
      apiKey: this.apiKey,
      appId: this.appId,
      baseUrl: this.baseUrl,
      disableBatch: !!disableBatch
    });
  }
};
export {
  Puzzlet,
  component,
  trace4 as trace
};
//# sourceMappingURL=index.mjs.map