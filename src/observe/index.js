import { newArrayProto } from './array.js'
class Observer {
    constructor(data) {
        // data.__ob__ = this //给数据加个标识  如果数据上有__ob__ 则说明数据被观测过

        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable:false ,// 将__ob__变成不可枚举 （循环的时候拿不到这个值）
        })

        //如果是数组
        if(Array.isArray(data)) {
            //使用函数劫持重写了数组的方法
            data.__proto__ = newArrayProto
            this.observeArray(data) //如果数组中是对象  再次调用observe进行观察
        } else {
            //这里会重新遍历定义响应式   不管是否已被定义过都会重新定义
            this.walk(data)
        }
        
    }
    walk(data) {
        Object.keys(data).forEach(key=> defineReactive(data,key,data[key])) 
    }
    observeArray(data) {
        data.forEac(item => observe(item))
    }
}

export function defineReactive(target,key,value) {
    
    observe(value) //给所以对象定义响应式

    // 对象， 代理的Key, 值
    Object.defineProperty(target,key,{
        get() {
            return value
        },
        //数据劫持
        set(newValue) {
            //如果值未变化就直接return
            if(value == newValue) return 
            observe(newValue) //递归对象重新定义响应式
            value = newValue
        }
    })
}

export function observe(data) {
    console.log(data,'--data');
    if(typeof data !==  'object' || data == null) {
        return
    }
    //如果data下面有ob  说明已经被代理过了
    if(data.__ob__ instanceof Observer) return data.__ob__
    //new一个Ob 定义响应式
    return new Observer(data)

}