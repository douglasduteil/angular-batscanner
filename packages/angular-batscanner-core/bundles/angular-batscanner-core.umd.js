(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/compiler'), require('@angular/core')) :
  typeof define === 'function' && define.amd ? define(['exports', '@angular/compiler', '@angular/core'], factory) :
  (factory((global.angularBatscannerCore = global.angularBatscannerCore || {}),global._angular_compiler,global._angular_core));
}(this, (function (exports,_angular_compiler,_angular_core) { 'use strict';

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

var BatscannerEventAggregator = function BatscannerEventAggregator() {
  classCallCheck(this, BatscannerEventAggregator);
};

//

var HAS_RUNTIME_METADATA_RESOLVER_HOOK = '__HAS_RUNTIME_METADATA_RESOLVER_HOOK__'; // Make this a symbol
var IS_PART_OF_THE_DEBUGGER = '__IS_PART_OF_THE_DEBUGGER__';

//

//

function needToBeScaned(directiveType) {
  var requireRuntimeMetadataResolverHooks = true;
  requireRuntimeMetadataResolverHooks = requireRuntimeMetadataResolverHooks && !directiveType[IS_PART_OF_THE_DEBUGGER];
  requireRuntimeMetadataResolverHooks = requireRuntimeMetadataResolverHooks && !directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK];

  return requireRuntimeMetadataResolverHooks;
}

function markAsScaned(directiveType) {
  directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK] = true;
}

//

//

var CompileMetadataResolver$1 = _angular_compiler.__compiler_private__.CompileMetadataResolver;

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

    _this._eventAggregator = _injector.get(BatscannerEventAggregator);
    return _this;
  }

  createClass(BatScannerCompileMetadataResolver, [{
    key: 'getDirectiveMetadata',
    value: function getDirectiveMetadata(directiveType, throwIfNotFound) {
      directiveType = _angular_core.resolveForwardRef(directiveType);
      var meta = this._directiveCache.get(directiveType);

      if (!meta || !needToBeScaned(directiveType)) {
        return get(BatScannerCompileMetadataResolver.prototype.__proto__ || Object.getPrototypeOf(BatScannerCompileMetadataResolver.prototype), 'getDirectiveMetadata', this).call(this, directiveType, throwIfNotFound);
      }

      // directiveType.prototype = wrapAllLifeCyleHooksOf(directiveType)

      markAsScaned(directiveType);

      return get(BatScannerCompileMetadataResolver.prototype.__proto__ || Object.getPrototypeOf(BatScannerCompileMetadataResolver.prototype), 'getDirectiveMetadata', this).call(this, directiveType, throwIfNotFound);
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

var CompileMetadataResolver = _angular_compiler.__compiler_private__.CompileMetadataResolver;

//

var BATSCANNER_ROOT_COMPONENT = 'BATSCANNER_ROOT_COMPONENT';

var BATSCANNER_PROVIDERS = [{ provide: CompileMetadataResolver, useClass: BatScannerCompileMetadataResolver }, BatscannerEventAggregator];

//



//

exports.BATSCANNER_ROOT_COMPONENT = BATSCANNER_ROOT_COMPONENT;
exports.BATSCANNER_PROVIDERS = BATSCANNER_PROVIDERS;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-batscanner-core.umd.js.map
