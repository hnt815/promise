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
   * @return 一个新的Promise对象
   */
  Promise.prototype.then = function (onResolved, onRejected) {
    const self = this
    //假设当前状态是pending,保存回调函数
    self.callbacks.push({onResolved, onRejected})
  }

  /**
   * Promise原型对象的catch()
   * @param onRejected 失败回调
   * @return 一个新的Promise对象
   */
  Promise.prototype.catch = function (onRejected) {

  }

  /**
   * Promise函数对象的resolve
   * @param value 成功的返回
   * @return 返回一个指定value的成功的Promise对象
   */
  Promise.resolve = function (value) {

  }

  /**
   * Promise函数对象的reject
   * @param value 失败的返回
   * @return 返回一个指定reason的失败的Promise对象
   */
  Promise.reject = function (reason) {

  }

  /**
   * Promise函数对象的all
   * @param promises 数组/promise对象的数组
   * @return 只有全部promise都成功了才成功
   */
  Promise.all = function (promises) {

  }

  /**
   * Promise函数对象的race
   * @param promises 数组/promise对象的数组
   * @return 返回一个promise对象,其结果由第一个完成的promise决定
   */
  Promise.race = function (promises) {

  }

  //向外暴露Promise
  window.Promise = Promise
})(window)
