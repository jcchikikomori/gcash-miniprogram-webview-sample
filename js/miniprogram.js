// Reminder:
// Mini Program does not allow to make a reusable function
// due to strict ES6 standards including TypeScript.
//
// So use the tedious one as possible, e.g:
// my.postMessage({ 'sendToMiniProgram': '1', 'action': 'auth' });
// 

var USER_AGENT = navigator.userAgent;
var _isMiniProgram = false;
var _miniProgramDataExists = false;
var _path = window.location.pathname;
var _userInfo = {
  firstName: 'Ragde',
  middleName: '',
  lastName: 'Falcis',
  contactNumber: '09123456789',
  email: 'ragdefalcis@gorated.ph',
  street: ''
};

function showModal() {
  $('#modal').show();
}
function hideModal() {
  $('#modal').hide();
}

/**
 * Mini Program initializer
 */
function reloadMiniProgram() {
  if (/AliApp|Alipay|GCash/i.test(USER_AGENT)) {
    _isMiniProgram = typeof my !== "undefined";
    if (!_isMiniProgram) {
      var stringToAppend = '<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>';
      $("body").append(stringToAppend);
    }
  }
}

/**
 * Login Steps:
 * 1. Get Auth Code first with Mini Program
 * 2. Obtain and send to this endpoint
 * 3. Execute requestAccessToken()
 * 
 * Note: Only request user info for the following
 * - Cart
 * - Checkout
 */
function loginMiniProgram() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    if (_path == "/ecommerce/checkout" || _path == "/ecommerce/cart") {
      my.postMessage({ 'sendToMiniProgram': '1', 'action': 'requestUserInfo' });
    } else {
      my.postMessage({ 'sendToMiniProgram': '1', 'action': 'auth' });
    }
  }
}

/**
 * Get saved User Info that has been fetched from
 * Mini Program before
 * 
 * @returns {Object} _userInfo
 */
function getUserInfoCached() {
  return _userInfo;
}

function onClick() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '0', 'action': 'none' });
  }
}

function onClickToMenu() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'menu' });
  }
}

function onClickToCart() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'cart' });
  }
}

function onClickToRefresh() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'refresh' });
  }
}

function showTabBar() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'showTabBar' });
  }
}

function hideTabBar() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'hideTabBar' });
  }
}

function showLoadingMiniProgram() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'showLoadingMiniProgram' });
  }
}

function hideLoadingMiniProgram() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    console.info('hideLoadingMiniProgram() called');
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'hideLoadingMiniProgram' });
  }
}

function onClickToLogin() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'login' });
  } else {
    showModal();
  }
}

function onClickToAuth() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'auth' });
  } else {
    showModal();
  }
}

function onClickToPay() {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'pay' });
  } else {
    showModal();
  }
}

// check if loaded with IDE or GCash app
function ifMiniProgramLoaded() {
  reloadMiniProgram();
  return typeof my !== "undefined" || _isMiniProgram;
}

/**
 * Mini Program Alert
 * 
 * @param {String} message 
 */
function miniProgramAlert(message) {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    console.info('miniProgramAlert() called');
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'alert', 'message': message });
  }
}

/**
 * Mini Program Log
 * 
 * @param {any} message 
 */
function miniProgramLog(message) {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    console.info('miniProgramLog() called');
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'log', 'message': message });
  }
}

/**
 * Mini Program Checkout params
 * 
 * @param {Object} data 
 * @param {String} field
 */
function miniProgramCheckoutParams(data, field) {
  reloadMiniProgram();
  if (ifMiniProgramLoaded()) {
    my.postMessage({ 'sendToMiniProgram': '1', 'action': 'checkout', 'message': data, 'field': field });
  }
}

/** 
 * Sign In to obtain Access Token and PSID
 *
 * @param {String} authCode - GCash Mini Program's Auth Code
 * @param {String} pageId - Facebook Page ID
 * @return {void} Sends result back to Mini Program
 */
function signIn(authCode, pageId) {
  var postUrl = "/gcash_mini_programs/sign_in";
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {
      auth_code: authCode,
      fb_page_id: pageId
    },
    url: postUrl,
    success: function (data) {
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'signIn',
        'message': data
      });
    },
    error: function (data) {
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'log',
        'message': data
      });
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'alert',
        'message': 'Unable to obtain access token! [error callback]'
      });
    }
  });
}

/**
 * Request/Inquire User Info from GCash's OPENAPI
 * 
 * @param {String} accessToken 
 */
function requestUserInfo(accessToken) {
  var postUrl = "/gcash_mini_programs/inquiry_user_info";
  $.ajax({
    type: "POST",
    dataType: "json",
    data: {
      access_token: accessToken
    },
    url: postUrl,
    success: function (data) {
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'userInfo',
        'message': data
      });
    },
    error: function (data) {
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'alert',
        'message': 'Unable to obtain user info [error callback]'
      });
    }
  });
}

// make sure the mini app is ready
$(document).ready(function () {
  // Log the User Agent string
  console.info(navigator.userAgent);

  // Import Alipay appx script (only works inside web-view of the mini program)
  if (/AliApp|Alipay|GCash/i.test(USER_AGENT)) {

    _isMiniProgram = typeof my !== "undefined";

    var stringToAppend = '<script src="https://appx/web-view.min.js"' + '>' + '<' + '/' + 'script>';
    $("body").append(stringToAppend);

    var miniProgramStatus = typeof my === "undefined" ? 'ERROR' : 'ACTIVE';

    // 判断是否运行在小程序环境里
    // Get Environment
    if (ifMiniProgramLoaded()) {
      my.getEnv(function (res) {
        console.log(res.miniprogram); // true
        _isMiniProgram = res.miniprogram == true ? true : false;
      });
    }

    // Send engine status to Mini Program
    if (ifMiniProgramLoaded()) {
      my.postMessage({
        'sendToMiniProgram': '1',
        'action': 'log',
        'message': 'ENGINE STATUS: ' + miniProgramStatus
      });
    }

    // Catch postMessage from Mini Program
    if (ifMiniProgramLoaded()) {
      my.onMessage = function (e) {
        console.log(JSON.stringify(e));

        switch (e.action) {
          case 'alreadyExists':
            if (typeof e.alreadyExists !== "undefined") {
              _miniProgramDataExists = e.alreadyExists == 1 ? true : false;
              // Refresh Access Token
              if (typeof e.authCode !== "undefined" && typeof e.pageId !== "undefined") {
                signIn(e.authCode, e.pageId);
              }
            }
            break;
          case 'signIn':
            if (typeof e.authCode !== "undefined" && typeof e.pageId !== "undefined") {
              if (!_miniProgramDataExists) {
                signIn(e.authCode, e.pageId);
              }
            }
            break;
          case 'requestUserInfo':
            $("#status").text(JSON.stringify(e));
            if (typeof e.accessToken !== "undefined") {
              requestUserInfo(e.accessToken);
            }
            break;
          case 'redirectToMenu':
          case 'redirectToCart':
          case 'redirectToOrderHistory':
            if (typeof e.redirectUrl !== "undefined") {
              if (_path == "/gcash_mini_programs/onboarding") {
                // Turbolinks.visit(e.redirectUrl);
                // console.log(e.redirectUrl);
                my.postMessage({
                  'sendToMiniProgram': '1',
                  'action': 'alert',
                  'message': 'Redirect is not supported. Please proceed to cart manually.'
                });
              }
            }
            break;
          case 'paymentSuccess':
            // call from Mini App
            setGCashMiniProgramPaymentSuccess();
            break;
          case 'paymentFailure':
            // call from Mini App
            setGCashMiniProgramPaymentFailure();
            break;
          case 'loginNotNeeded':
            requestUserInfoFromMiniProgram();
            break;
          case 'userInfo':
            if (typeof e.userInfo !== "undefined") {
              _userInfo.firstName = e.userInfo.firstName;
              _userInfo.lastName = e.userInfo.lastName;
              _userInfo.contactNumber = e.userInfo.contactNumber;
              _userInfo.email = e.userInfo.email;
            }
            break;
        }
      };
    }

    // View Cart via Mini Program
    $('#viewCart').on('click', function (e) {
      if (ifMiniProgramLoaded()) {
        e.preventDefault();
        my.postMessage({
          'sendToMiniProgram': '1',
          'action': 'cart',
          'message': 'Show Cart'
        });
      }
    });

    // Go to checkout
    $('#cartItemsForm').on('submit', function (e) {
      if (ifMiniProgramLoaded()) {
        my.postMessage({
          'sendToMiniProgram': '1',
          'action': 'hideTabBar',
          'message': 'hideTabBar via Checkout'
        });
      }
    });
  }

  $('.modal-close').click(function () {
    hideModal();
  });

  // Request User info or
  // Login with GCash or Alipay
  loginMiniProgram();
});
