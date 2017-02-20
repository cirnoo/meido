import {EventEmitter} from 'events'
import plugins from './plugins'
import { Queue, Message, Observer } from 'meidos'

const baseOptions = {
  logLevel: 'info',
  components: [plugins],
  completions: []
}

export default class Meido {
  constructor(options) {
    this.Event = new EventEmitter()
    this.Observer = new Observer(this.Event)
    this.Queue = new Queue(this.Event)
    this.Message = new Message(this.Event)

    this.options = Object.assign(baseOptions, options)
    this.state = {}
    this._state = {}
    this.init()    
  }

  init() {
    // inject plugins
    if(this.options.components) {
      this.options.components.forEach(component => {
        this.Queue
          .run(async (queue, next) => {

            component.start && await component.start.call(this)
             
            Object.keys(component).forEach(key => {
              if(key !== "start" && key !== "name") {
                if(typeof component[key] === 'function') {
                  this.options.completions.push(`:${component.name}.${key}`)                
                } else if(key === 'completions'){
                  meido.options.completions = meido.options.completions.concat(component[key])
                }else {
                  this.options.completions.push(`${component.name}.${key}`)
                }
              }
            })

          next()
        })
      })
    }
  }

  set(obj) {
    Object.assign(this.options, obj)
  }
  
  on(name, fn) {
    this.Event.on(name, fn)
    return this
  }

  emit(name, ...args) {
    this.Event.emit(name, ...args)
    return this
  }

  observer(name, fn) {
    this.emit("observer", name, fn)
    return this
  }
}

