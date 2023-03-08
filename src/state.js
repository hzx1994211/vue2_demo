import { observe } from './observe/index.js'

export function initState(vm) {
 const opts = vm.$options //获取所有属性
 if(opts.data) {
    initData(vm)
 }
}

function proxy(vm,target,key) {
    Object.defineProperty(vm,key,{//vm.name 的时候  会返回vm._data.name
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data
    vm._data = data //将返回的值重新定义到_data上
    console.log(data);
    //对数据进行劫持  核心使用definePropetry定义数据响应式
    observe(data)
    //将vm._data 用vm来代理   ，为了解决通过vm._data.name 这样去取数据
    for (const key in data) {
        proxy(vm,'_data',key)
    }
}