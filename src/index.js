import { initMixin } from './init'

//将所有的方法耦合在一起
function Vue(options) {
    // debugger
    this._init(options)
}

initMixin(Vue)

export default Vue