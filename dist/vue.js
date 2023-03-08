(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var oldArrayProto = Array.prototype;

  //newArrayProto.proto = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    //重写数组方法 使用数组方法时先执行自己内部的7大方法
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      //函数劫持   使用函数劫持重写数组方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      //对新增数据进行劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.slice(2);
          break;
      }
      if (inserted) {
        //对新增的内容进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // data.__ob__ = this //给数据加个标识  如果数据上有__ob__ 则说明数据被观测过

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 将__ob__变成不可枚举 （循环的时候拿不到这个值）
      });

      //如果是数组
      if (Array.isArray(data)) {
        //使用函数劫持重写了数组的方法
        data.__proto__ = newArrayProto;
        this.observeArray(data); //如果数组中是对象  再次调用observe进行观察
      } else {
        //这里会重新遍历定义响应式   不管是否已被定义过都会重新定义
        this.walk(data);
      }
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEac(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
  }();
  function defineReactive(target, key, value) {
    observe(value); //给所以对象定义响应式

    // 对象， 代理的Key, 值
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      //数据劫持
      set: function set(newValue) {
        //如果值未变化就直接return
        if (value == newValue) return;
        observe(newValue); //递归对象重新定义响应式
        value = newValue;
      }
    });
  }
  function observe(data) {
    console.log(data, '--data');
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }
    //如果data下面有ob  说明已经被代理过了
    if (data.__ob__ instanceof Observer) return data.__ob__;
    //new一个Ob 定义响应式
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; //获取所有属性
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      //vm.name 的时候  会返回vm._data.name
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; //将返回的值重新定义到_data上
    console.log(data);
    //对数据进行劫持  核心使用definePropetry定义数据响应式
    observe(data);
    //将vm._data 用vm来代理   ，为了解决通过vm._data.name 这样去取数据
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  //初始化用户传入的参数
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; //将用户的选项挂载到实例上
      //初始化状态
      initState(vm);
      if (options.el) {
        vm.$mount(options.el); //数据挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el); //获取元素

      var ops = vm.$options;
      console.log(el, '---el', ops, '====ops');
      if (!ops.render) {
        //先查找是否有render函数
        var template; //没有render 看一下是否写了template  没写template采用外部的template
        if (!ops.template && el) {
          //如果没有模板 但是就el根元素
          template = el.outerHTML;
        } else {
          //如果 存在template 且存在el  则直接使用模板的内容
          if (el) {
            template = ops.template;
          }
        }
        //如果有模板  则对模板进行编译
        if (template) {
          //模板编译
          var render = compileToFunction(template);
          ops.render = render;
        }
        console.log(template, '---template');
      }
      ops.render; //最终可以直接获取render
    };
  }

  //将所有的方法耦合在一起
  function Vue(options) {
    // debugger
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
