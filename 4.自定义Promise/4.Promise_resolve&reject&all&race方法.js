/**
 * IIFE
 */
(function (window) {

  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  /**
   * Promise的构造器函数
   * @param executor 同步执行器函数
   * @constructor
   */
  function Promise(executor) {
    const self = this //记录this对象,避免在后面的函数中this变window对象

    self.status = PENDING //当前状态,初始值为pending
    self.data = undefined //存储结果
    self.callbacks = [] // 回调函数, 结构为{ onResolved() {}, onRejected() {}}

    function resolve(value) {
      //resolve函数直接调用,函数内的this会变成window,所以上面会用self保存了this
      //如果当前不是pending状态,直接结束
      if (self.status !== PENDING) return

      //修改状态
      self.status = RESOLVED
      //保存数据
      self.data = value
      //如果callbacks中有回调函数,立即加入到回调队里中
      //promise的回调属于微队列任务,这里用宏队列的setTimeout模拟
      if (self.callbacks.length > 0) {
        setTimeout(() => {
          self.callbacks.forEach(callbackObj => {
            callbackObj.onResolved(value)
          })
        }, 0)
      }
    }

    //和resolve函数几乎一样
    function reject(reason) {
      if (self.status !== PENDING) return

      self.status = REJECTED
      self.data = reason

      if (self.callbacks.length > 0) {
        setTimeout(() => {
          self.callbacks.forEach(callbackObj => {
            callbackObj.onRejected(reason)
          })
        }, 0)
      }
    }

    //立即同步执行executor
    //如果throw异常,promise失败
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  /**
   * Promise原型对象的then()
   * @param onResolved 成功回调
   * @param onRejected 失败回调
   * @return Promise
   */
  Promise.prototype.then = function (onResolved, onRejected) {
    //向后传递成功的结果
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    //向后传递失败的结果
    //指定默认的失败回调,此处是实现异常穿透的关键点
    onRejected = typeof onRejected === 'function' ? onRejected : reason => {
      throw reason
    }

    const self = this

    //返回一个新的promise对象
    return new Promise((resolve, reject) => {

      /**
       * 调用指定的回调函数,根据回调函数的执行结果,改变return的promise的状态
       * @param callback
       */
      function handle(callback) {
        /*
           1. 如果抛出异常, return的promise就会失败, reason就是error
           2. 如果回调函数返回不是promise, return的promise就会成功, value就是返回的值
           3. 如果回调函数返回是promise, return的promise结果就是这个promise的结果
          */
        try {
          const result = callback(self.data)
          if (result instanceof Promise) {
            //3.如果回调函数返回是promise, return的promise结果就是这个promise的结果
            result.then(
              // 当result成功时,return的promise成功
              value => resolve(value),
              // 当result失败时,return的promise失败
              reason => reject(reason)
            )
            //简写方式
            //result.then(resolve, reject)
          } else {
            //2. 如果回调函数返回不是promise, return的promise就会成功, value就是返回的值
            resolve(result)
          }
        } catch (error) {
          //1. 如果抛出异常, return的promise就会失败, reason就是error
          reject(error)
        }
      }

      if (self.status === PENDING) {
        //resovle/reject 已经将回调放入队列中了
        self.callbacks.push({
          onResolved() {
            handle(onResolved)
          },
          onRejected() {
            handle(onRejected)
          }
        })

      } else if (self.status === RESOLVED) {
        //如果当前是resolved状态, 异步执行onResolved并改变return的promise状态
        setTimeout(() => {
          handle(onResolved)
        })
      } else {
        //如果当前是rejected状态, 异步执行onRejected并改变return的promise状态
        setTimeout(() => {
          handle(onRejected)
        })
      }
    })
  }

  /**
   * Promise原型对象的catch()
   * @param onRejected 失败回调
   * @return Promise
   */
  Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
  }

  /**
   * Promise函数对象的resolve
   * @param value 成功的返回
   * @return Promise
   */
  Promise.resolve = function (value) {
    //返回一个Promise
    return new Promise((resolve, reject) => {
      //如果value是Promise,value的结果就是return promise的结果
      if(value instanceof Promise){
        value.then(resolve, reject)
      } else{
        //直接返回成功
        reject(value)
      }
    })
  }

  /**
   * Promise函数对象的reject
   * @param value 失败的返回
   * @return Promise
   */
  Promise.reject = function (reason) {
    //返回一个失败的Promise
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  /**
   * Promise函数对象的all
   * @param promises 数组/promise对象的数组
   * @return Promise
   */
  Promise.all = function (promises) {
    //保存所有已成功的promise的结果,最大长度已确定
    const resolvedValues = new Array(promises.length)
    //计数,已成功的promise的个数
    let resolvedCount = 0
    //返回一个promise
    return new Promise((resolve, reject) => {
      //遍历promises,成功了就记录下来,有一个失败就返回失败
      promises.forEach((item, index) => {
        //用上前面定义的resolve方法
        Promise.resolve(item).then(
          value => {
            //数量+1
            resolvedCount ++
            //保存成功的结果,不能用push,要保证结果顺序和Promises的元素顺序一致
            resolvedValues[index] = value
            //当成功数量和promises的长度一致时,全部成功
            if(resolvedCount === promises.length){
              resolve(resolvedValues)
            }
          },
          reason => {
            //有一个失败就返回失败promise
            reject(reason)
          }
        )
      })
    })
  }

  /**
   * Promise函数对象的race
   * @param promises 数组/promise对象的数组
   * @return Promise
   */
  Promise.race = function (promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((item, index) => {
        Promise.resolve(item).then(
          //由第一个完成的promise的结果决定return的promise的结果
          value => {
            resolve(value)
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }

  //向外暴露Promise
  window.Promise = Promise
})(window)
