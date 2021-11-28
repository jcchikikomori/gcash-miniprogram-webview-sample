// 如该 H5 页面需要同时在非支付宝客户端内使用，为避免该请求404，可参考以下写法
// 请尽量在 html 头部执行以下脚本

// AliApp applies only in production
// GCash applies only in sandbox
if (navigator.userAgent.indexOf('AliApp') > -1 || navigator.userAgent.indexOf('GCash') > -1) {
  document.writeln('<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>');
}
function onClick() {
  // Send back to mini program
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '0', 'action': 'none' });
  } else {
    showModal();
  }
}
function onClickToMenu() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'menu' });
  } else {
    showModal();
  }
}
function onClickToCart() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'cart' });
  } else {
    showModal();
  }
}
function onClickToRefresh() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'refresh' });
  } else {
    showModal();
  }
}
function onClickToLogin() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'login' });
  } else {
    showModal();
  }
}
function onClickToAuth() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'auth' });
  } else {
    showModal();
  }
}
function onClickToPay() {
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'pay' });
  } else {
    showModal();
  }
}
// check if loaded with IDE or GCash app
function ifMiniProgramLoaded() {
  return typeof my !== 'undefined';
}
function onClickToFirst() {
  window.history.back();
}

window.onload = function() {
  // 网页向小程序 postMessage 消息
  // 接收来自小程序的消息。
  // Catch postMessage from mini program
  my.onMessage = function (e) {
    document.getElementById("status").textContent = 'Received! \n\n(Contains: ' + JSON.stringify(e) + ')';
  }
  // 判断是否运行在小程序环境里
  my.getEnv(function (res) {
    console.log(res.miniprogram) // true
  });
  if (!ifMiniProgramLoaded()) {
    showModal();
  }
  $('.modal-close').click(function () {
    hideModal();
  });
};