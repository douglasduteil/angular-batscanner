(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler'), require('@angular/core'), require('rxjs/Observable'), require('rxjs/Subject')) :
  typeof define === 'function' && define.amd ? define(['exports', '@angular/compiler', '@angular/core', 'rxjs/Observable', 'rxjs/Subject'], factory) :
  (factory((global.angularBatscannerCore = global.angularBatscannerCore || {}),global.ng.compiler,global.ng.core,global.Rx,global.Rx));
}(this, (function (exports,_angular_compiler,_angular_core,rxjs_Observable,rxjs_Subject) { 'use strict';

//

//

var HAS_RUNTIME_METADATA_RESOLVER_HOOK = '__HAS_RUNTIME_METADATA_RESOLVER_HOOK__'; // Make this a symbol
var IS_PART_OF_THE_DEBUGGER = '__IS_PART_OF_THE_DEBUGGER__';
var BATSCANNER_ID = '__BATSCANNER_ID__';


//

var BATSCANNER_ROOT_COMPONENT = new _angular_core.OpaqueToken('BATSCANNER_ROOT_COMPONENT');

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
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



var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

//

var BatscannerEventEmitter = function () {
  function BatscannerEventEmitter() {
    classCallCheck(this, BatscannerEventEmitter);
  }

  createClass(BatscannerEventEmitter, [{
    key: "next",
    value: function next() {}
  }]);
  return BatscannerEventEmitter;
}();

//

//

function needToBeScaned(directiveType) {
  var requireRuntimeMetadataResolverHooks = true;
  requireRuntimeMetadataResolverHooks &= !directiveType[IS_PART_OF_THE_DEBUGGER];
  requireRuntimeMetadataResolverHooks &= !directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK];

  return Boolean(requireRuntimeMetadataResolverHooks);
}

function markAsScaned(directiveType) {
  directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK] = true;
}

//

//

var LifecycleHooks = _angular_core.__core_private__.LifecycleHooks;
var LIFECYCLE_HOOKS_VALUES = _angular_core.__core_private__.LIFECYCLE_HOOKS_VALUES;
var CompileMetadataResolver$1 = _angular_compiler.__compiler_private__.CompileMetadataResolver;

var GLOBAL_ID = 0;

//

var BatScannerCompileMetadataResolver = function (_CompileMetadataResol) {
  inherits(BatScannerCompileMetadataResolver, _CompileMetadataResol);

  function BatScannerCompileMetadataResolver(
  // HACK(@douglasduteil): Force inject the injector in the CompileMetadataResolver
  _injector,
  //
  _ngModuleResolver, _directiveResolver, _pipeResolver, _viewResolver, _config, _console, _reflector) {
    classCallCheck(this, BatScannerCompileMetadataResolver);

    var _this = possibleConstructorReturn(this, (BatScannerCompileMetadataResolver.__proto__ || Object.getPrototypeOf(BatScannerCompileMetadataResolver)).call(this, _ngModuleResolver, _directiveResolver, _pipeResolver, _viewResolver, _config, _console, _reflector));

    _this._eventEmitter = _injector.get(BatscannerEventEmitter);
    return _this;
  }

  createClass(BatScannerCompileMetadataResolver, [{
    key: 'getTypeMetadata',
    value: function getTypeMetadata(directiveType, moduleUrl, dependencies) {
      directiveType = _angular_core.resolveForwardRef(directiveType);

      if (!needToBeScaned(directiveType)) {
        return get(BatScannerCompileMetadataResolver.prototype.__proto__ || Object.getPrototypeOf(BatScannerCompileMetadataResolver.prototype), 'getTypeMetadata', this).call(this, directiveType, moduleUrl, dependencies);
      }

      //

      markAsScaned(directiveType);

      //

      var emitter = this._eventEmitter;
      directiveType.prototype = LIFECYCLE_HOOKS_VALUES.reduce(function (proto, lifecycleHook) {
        var lifecycleHookName = LifecycleHooks[lifecycleHook];
        var existingHook = proto['ng' + lifecycleHookName];

        if (lifecycleHook === LifecycleHooks.OnInit) {
          (function () {
            var originalHook = proto.ngOnInit;
            proto.ngOnInit = function ngOnInitBatScanner() {
              this[BATSCANNER_ID] = GLOBAL_ID++;
              if (originalHook) {
                originalHook.call(this);
              }
            };

            existingHook = proto.ngOnInit;
          })();
        }

        proto['ng' + lifecycleHookName] = function (changes) {
          if (existingHook) {
            existingHook.call(this, changes);
          }

          emitter.next({
            id: this[BATSCANNER_ID],
            timestamp: window.performance.now(),
            type: lifecycleHookName,
            targetName: directiveType.name,
            target: directiveType,
            changes: changes
          });
        };

        return proto;
      }, directiveType.prototype);

      return get(BatScannerCompileMetadataResolver.prototype.__proto__ || Object.getPrototypeOf(BatScannerCompileMetadataResolver.prototype), 'getTypeMetadata', this).call(this, directiveType, moduleUrl, dependencies);
    }
  }]);
  return BatScannerCompileMetadataResolver;
}(CompileMetadataResolver$1);

BatScannerCompileMetadataResolver.ctorParameters =
// Copy CompileMetadataResolver.ctorParameters
CompileMetadataResolver$1.ctorParameters.map(function (token) {
  return { type: token.type };
});
BatScannerCompileMetadataResolver.ctorParameters.unshift({ type: _angular_core.Injector });

//

//

var LifecycleHooks$1 = _angular_core.__core_private__.LifecycleHooks;

//

function BatscannerEventAggregator() {
  this.aggregateUntill = aggregateUntill;
}

//

function aggregateUntill(source, componentToken) {
  // HACK(@douglasduteil): source filter triggered before the buffer problem
  //
  // Basic implementation would suggest to directly listen to the source
  // without wrapping it in another Observable. But it's causing problem of
  // notification ordnance. Indeed, if we subscribe to the source here, the
  // first puller will be the closingNotifier$ and not the buffer$ that will
  // start pulling after the client subscribe to the source. Thus the
  // closingNotifier$ end the buffer$ before it has the chance to get the last
  // event...
  //
  // We get :
  //
  // ```
  //           source : ---A---B---C---X------------>
  // closingNotifier$ : ---------------X------------>
  //          buffer$ : ---------------[A, B, C]---->
  // ```
  //
  // Instead of:
  //
  // ```
  //           source : ---A---B---C---X------------>
  //          buffer$ : ---------------[A, B, C, X]->
  // closingNotifier$ : ---------------X------------>
  // ```

  var hasCheckedTheRootComponent = rootComponentAfterViewChecked.bind(null, componentToken);

  return rxjs_Observable.Observable.create(aggregationObservable);

  //

  function aggregationObservable(observer) {
    // Manually on next the buffer at the end of each RootComponent check
    var everyRootComponentAfterViewChecked = new rxjs_Subject.Subject();

    // Must be the first to subscribe to source to buffer any incoming events
    var buffer$ = source.buffer(everyRootComponentAfterViewChecked).subscribe(function (e) {
      return observer.next(e);
    });

    // Listen to the source for AfterViewChecked AFTER buffering stuff
    var closingNotifier$ = source.filter(function (e) {
      return hasCheckedTheRootComponent(e);
    }).subscribe(function () {
      return everyRootComponentAfterViewChecked.next();
    });

    return function () {
      buffer$.dispose();
      closingNotifier$.dispose();
    };
  }
}

function rootComponentAfterViewChecked(root, event) {
  var type = event.type;
  var target = event.target;

  var isTheRootComponent = target === root;
  var isDoCheckEventType = LifecycleHooks$1[type] === LifecycleHooks$1.AfterViewChecked;
  return isTheRootComponent && isDoCheckEventType;
}

//

//

BatscannerWindowPostMessageEmitter.ctorParameters = [{ type: _angular_core.Injector }];
function BatscannerWindowPostMessageEmitter(injector) {
  var rootComponent = injector.get(BATSCANNER_ROOT_COMPONENT);
  var eventAggregator = injector.get(BatscannerEventAggregator);

  //

  window.__ANGULAR_BATSCANNER__ = true;

  var suject = new rxjs_Subject.Subject();
  this.next = suject.next.bind(suject);

  //

  var source = eventAggregator.aggregateUntill(suject, rootComponent);

  //

  source.subscribe(function postMessage(aggregatedEvents) {
    console.log('#postMessage', aggregatedEvents);

    window.postMessage({
      source: 'foobar',
      payload: JSON.parse(JSON.stringify(aggregatedEvents))
    }, '*');
  });
}

//

//

//

var CompileMetadataResolver = _angular_compiler.__compiler_private__.CompileMetadataResolver;

var BATSCANNER_PROVIDERS = [
// TODO(@douglasduteil): clarrify if must be required by default or not
// Will throw
// "DI Error caused by: No provider for Token BATSCANNER_ROOT_COMPONENT"
// if not defined by the user
// {provide: BATSCANNER_ROOT_COMPONENT, useValue: ''},

{ provide: CompileMetadataResolver, useClass: BatScannerCompileMetadataResolver }, { provide: BatscannerEventEmitter, useClass: BatscannerWindowPostMessageEmitter }, BatscannerEventAggregator];

//



//

exports.BATSCANNER_ROOT_COMPONENT = BATSCANNER_ROOT_COMPONENT;
exports.BATSCANNER_PROVIDERS = BATSCANNER_PROVIDERS;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-batscanner-core.umd.js.map
