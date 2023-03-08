
 let oldArrayProto = Array.prototype

//newArrayProto.proto = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => {
    //重写数组方法 使用数组方法时先执行自己内部的7大方法
    newArrayProto[method] = function (...args) {
        //函数劫持   使用函数劫持重写数组方法
       const result = oldArrayProto[method].call(this,...args)

       //对新增数据进行劫持
       let inserted;
       let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
            default:
                break;
        }
        if(inserted) {
            //对新增的内容进行观测
            ob.observeArray(inserted)
        }

       return result
    }
})