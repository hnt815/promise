/**
 * IIFE
 */
(function (window) {

  /**
   * Promise的构造器函数
   * @param executor 同步执行器函数
   * @constructor
   */
  function Promise(executor) {

  }

  /**
   * Promise原型对象的then()
   * @param onResolved 成功回调
   * @param onRejected 失败回调
   * @return 一个新的Promise对象
   */
  Promise.prototype.then = function (onResolved, onRejected) {

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
