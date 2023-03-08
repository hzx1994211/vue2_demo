
import { initState } from './state'
//初始化用户传入的参数
export function initMixin (Vue) {
    Vue.prototype._init = function(options) {
        const vm = this
        vm.$options = options //将用户的选项挂载到实例上
        //初始化状态
        initState(vm)
        if(options.el) {
            vm.$mount(options.el) //数据挂载
        }
    }
    Vue.prototype.$mount = function(el) {
        const vm = this
        el = document.querySelector(el) //获取元素
        
        let ops = vm.$options
        console.log(el,'---el',ops,'====ops');
        if(!ops.render){ //先查找是否有render函数
            let template; //没有render 看一下是否写了template  没写template采用外部的template
            if(!ops.template && el) { //如果没有模板 但是就el根元素
                template = el.outerHTML
            }else {
                //如果 存在template 且存在el  则直接使用模板的内容
                if(el) {
                    template = ops.template
                }
            }
            //如果有模板  则对模板进行编译
            if(template) {
                //模板编译
                const render = compileToFunction(template)
                ops.render = render
            }
            console.log(template,'---template');
        } 
        ops.render; //最终可以直接获取render
    }
}



