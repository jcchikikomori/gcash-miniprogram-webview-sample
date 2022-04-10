// Mini Program compatibility wrapper
// Author: John Cyrill Corsanes <jccorsanes@protonmail.com>
//
// The codebase is basically inspired from ChatGenie <https://chatgenie.ph>,
// but trimmed due to disclosure & security reasons.
//
// Reminder that, Mini Program does not allow to make a reusable function
// due to strict ES6 standards including TypeScript.
//
// So use the tedious one as possible, e.g:
// my.postMessage({ 'sendToMiniProgram': '1', 'action': 'auth' })

import $ from "jquery";

// isMiniProgram is reserved variable. Already defined in application.js
var _isMiniProgram = false;
var _miniProgramDataExists = false;
var _path = window.location.pathname;
var _userInfo = {
  firstName: "",
  middleName: "",
  lastName: "",
  contactNumber: "09123456789",
  email: "",
  street: "",
};
const USER_AGENT = navigator.userAgent;
const isMiniProgram = typeof my !== "undefined";
const noMiniProgramDetected =
  "No Mini Program engine detected: Skipped Mini Program syntax";

/**
 * Redirect URL with fallback
 */
function redirectUrl(url) {
  if (typeof Turbolinks !== "undefined") {
    Turbolinks.visit(url, { action: "replace" });
  } else {
    window.location.href = url;
  }
}

/**
 * Update _isMiniProgram
 */
function setIsMiniProgram() {
  _isMiniProgram = typeof my !== "undefined";
}

/**
 * Mini Program re-initializer
 */
function reloadMiniProgram() {
  // Reload path on reload mini program
  _path = window.location.pathname;
  // Re-initialize
  if (/AliApp|Alipay|GCash/i.test(USER_AGENT)) {
    // _isMiniProgram = typeof my !== "undefined"
    setIsMiniProgram();
    if (!_isMiniProgram) {
      // This script can only be used inside the GCash app
      // More details: https://miniprogram.gcash.com/docs/miniprogram_gcash/mpdev/component_open_web-view
      var stringToAppend =
        '<script src="https://appx/web-view.min.js"' +
        ">" +
        "<" +
        "/" +
        "script>";
      $("body").append(stringToAppend);
      setIsMiniProgram();
    }
  }
  try {
    // Catch postMessage from Mini Program
    my.onMessage = function (e) {
      // Put status
      document.getElementById("status").textContent =
        "Received! \n\n(Contains: " + JSON.stringify(e) + ")";
      // update the path on listen
      _path = window.location.pathname;
      console.log(JSON.stringify(e));

      switch (e.action) {
        case "redirectToMenu":
        case "redirectToOrderHistory":
          _path = window.location.pathname;
          if (!!e.redirectUrl) {
            redirectUrl(e.redirectUrl);
          }
          break;
        case "redirectToCart":
          _path = window.location.pathname;
          // TODO: Create separated page about Cart
          if (window.location.pathname.includes("/cart")) {
            // $("#spinner").show() // force the spinner to show
            if (!!e.redirectUrl) {
              redirectUrl(e.redirectUrl);
            }
          }
          break;
        case "reloadPage":
          // $("#spinner").show() // force the spinner to show
          if (!!e.redirectUrl) {
            redirectUrl(e.redirectUrl);
          }
          break;
        case "paymentSuccess":
          // call from Mini App
          setGCashMiniProgramPaymentSuccess(e);
          break;
        case "paymentFailure":
          // call from Mini App
          setGCashMiniProgramPaymentFailure();
          break;
        case "userInfo":
          my.postMessage({
            sendToMiniProgram: "1",
            action: "log",
            message: e.userInfo,
          });
          if (typeof e.userInfo !== "undefined") {
            _userInfo.firstName = e.userInfo.firstName;
            _userInfo.lastName = e.userInfo.lastName;
            _userInfo.contactNumber = e.userInfo.contactNumber;
            _userInfo.email = e.userInfo.email;

            // remove leading zeros
            while (_userInfo.contactNumber.charAt(0) === "0") {
              _userInfo.contactNumber = _userInfo.contactNumber.substring(1);
            }

            // set user info
            setUserInfoToView();
          }
          break;
        case "setCartCountManually":
          const cartCount = e.cartCount || 0;
          $("#cartCount").html(String(e.cartCount));
          if (!!cartCount && !window.location.pathname.includes("/cart")) {
            $("#actionBtn.-ecommerce-products").show();
          } else {
            $("#actionBtn.-ecommerce-products").hide();
          }
          break;
      }
    };
    // Get Environment
    my.getEnv(function (res) {
      console.log(res.miniprogram); // true
    });
    // Log requested
    my.postMessage({
      sendToMiniProgram: "1",
      action: "log",
      message: {
        isMiniProgramUnderscored: _isMiniProgram,
        isMiniProgramConstant:
          typeof isMiniProgram !== "undefined" && isMiniProgram ? true : false,
      },
    });
    // send current path to mini program
    // to prevent reloading KYC pages
    // _path = window.location.pathname
    my.postMessage({
      sendToMiniProgram: "1",
      action: "currentPath",
      message: window.location,
    });
  } catch (error) {
    if (error instanceof ReferenceError) {
      setIsMiniProgram();
    }
  }
}

/**
 * Mini Program Initializer
 *
 * Note about Login:
 * The endpoint was being called on Mini Program app
 *
 * Note about trade pay:
 * Only use for the following
 * - Handling Third Party payment (GCash)
 *
 * Note about request user info:
 * Only use for the following:
 * - Checkout page, etc.
 */
function initMiniProgram() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    // Example path
    // TODO: Create separate path for Checkout
    if (_path.includes("checkout")) {
      try {
        my.postMessage({ sendToMiniProgram: "1", action: "requestUserInfo" });
      } catch (error) {
        if (error instanceof ReferenceError) {
          console.warn(noMiniProgramDetected);
        }
      }
    }
    // TODO: Create separate path for Trade Pay
    else if (_path.includes("payment")) {
      tradePay();
    }
  }
}

function onClickToLogin() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "login" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
        showModal();
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function onClickToAuth() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "auth" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
        showModal();
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function onClickToPay() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "pay" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
        showModal();
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

// check if loaded with IDE or GCash app
function ifMiniProgramLoaded() {
  return typeof my !== "undefined";
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
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "0", action: "none" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
        showModal();
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function onClickToMenu() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "menu" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function onClickToCart() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "cart" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function onClickToRefresh() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "refresh" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function showTabBar() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "showTabBar" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function hideTabBar() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({ sendToMiniProgram: "1", action: "hideTabBar" });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function showLoadingMiniProgram() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "showLoadingMiniProgram",
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function hideLoadingMiniProgram() {
  reloadMiniProgram();
  if (_isMiniProgram) {
    console.info("hideLoadingMiniProgram() called");
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "hideLoadingMiniProgram",
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

/**
 * Mini Program Alert
 *
 * @param {String} message
 */
function miniProgramAlert(message) {
  reloadMiniProgram();
  if (_isMiniProgram) {
    console.info("miniProgramAlert() called");
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "alert",
        message: message,
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

/**
 * Mini Program Log
 *
 * @param {any} message
 */
function miniProgramLog(message) {
  reloadMiniProgram();
  if (_isMiniProgram) {
    console.info("miniProgramLog() called");
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "log",
        message: message,
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

/**
 * Pass required field to execute payment generation AJAX
 */
function tradePay() {
  var _orderUuid = $("input[name=orderUuid]").val();
  var _currentUrl = $("input[name=current_url]").val();
  var _notifyUrl = $("input[name=notify_url]").val();
  if (!tradePayValid()) {
    return;
  }
  reloadMiniProgram();
  if (_isMiniProgram) {
    // Send back to Mini Program
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "generatePayment",
        message: {
          data: {
            orderUuid: _orderUuid,
            currentUrl: _currentUrl,
            notifyUrl: _notifyUrl,
          },
        },
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

/**
 * Check if trade pay params are valid
 * @returns Boolean
 */
function tradePayValid() {
  var _orderUuid = $("input[name=orderUuid]").val();
  var _currentUrl = $("input[name=current_url]").val();
  var _notifyUrl = $("input[name=notify_url]").val();
  if (!tradePayValid()) {
    return;
  }
  reloadMiniProgram();
  if (_isMiniProgram) {
    // Send back to Mini Program
    my.postMessage({
      sendToMiniProgram: "1",
      action: "generatePayment",
      message: {
        data: {
          orderUuid: _orderUuid,
          currentUrl: _currentUrl,
          notifyUrl: _notifyUrl,
        },
      },
    });
  } else {
    console.warn(noMiniProgramDetected);
    showModal();
  }
}

function setUserInfoToView() {
  // Final changes
  $("#firstName").val(_userInfo.firstName);
  $("#lastName").val(_userInfo.lastName);
  $("#contactNumber").val(_userInfo.contactNumber);
  $("#email").val(_userInfo.email);
}

/**
 * Set payment as success
 *
 * @param {Object} e - Post Message object
 */
function setGCashMiniProgramPaymentSuccess(e) {
  if (typeof e !== "undefined") {
    if (typeof e.returnUrl !== "undefined") {
      redirectUrl(e.redirectUrl);
      return;
    }
  }
  // Put alert otherwise
  // TODO: Create alert
}

/**
 * Set payment as failure
 */
function setGCashMiniProgramPaymentFailure() {
  // TODO: Create alert
}

/**
 * Send Cart Status to Mini Program
 *
 * @returns void
 */
function sendCartStatusToMiniProgram() {
  reloadMiniProgram();

  // Prevent using global _path for a while
  const __path = window.location.pathname;

  // TODO: Create simulated pages such as products, cart, categories, etc.
  if (
    __path.includes("/cart") ||
    __path.includes("categories") ||
    __path.includes("products") ||
    __path.includes("category")
  ) {
    const cartCount = +$("#cartCount").text() || 0;
    console.log("executed sendCartStatusToMiniProgram: " + cartCount);
    try {
      my.postMessage({
        sendToMiniProgram: "1",
        action: "cartCount",
        message: { data: { cartCount: cartCount } },
      });
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.warn(noMiniProgramDetected);
      }
    }
  }
}

function refreshCartAfterQuickUpdate() {
  reloadMiniProgram();

  const __path = window.location.pathname;
  if (__path.includes("/cart")) {
    reloadWithTurbolinks();
  }
}

function showModal() {
  $("#modal").show();
}

function hideModal() {
  $("#modal").hide();
}

function onClickToFirst() {
  window.history.back();
}

$(function () {
  reloadMiniProgram();

  // Log the User Agent string
  // console.info(navigator.userAgent)
  // Update the path
  _path = window.location.pathname;

  // Request User info or
  // Login with GCash or Alipay
  initMiniProgram();

  // see in miniprogram.js on miniprogram gem
  sendCartStatusToMiniProgram();

  if (isMiniProgram) {
    $(".button-submit-container").addClass("-miniprogram");
  }

  // View Cart via Mini Program
  $("#viewCart").on("click", function (e) {
    reloadMiniProgram();
    if (_isMiniProgram) {
      e.preventDefault();
      my.postMessage({
        sendToMiniProgram: "1",
        action: "cart",
        message: "Show Cart",
      });
      return false;
    }
  });

  // Back to Menu
  $("#backToMenu").on("click", function (e) {
    reloadMiniProgram();
    if (_isMiniProgram) {
      e.preventDefault();
      my.postMessage({
        sendToMiniProgram: "1",
        action: "menu",
        message: "Back to Menu",
      });
      return false;
    }
  });

  // This is will be a most stable one
  $(".tradeForm").on("submit", function (e) {
    reloadMiniProgram();
    if (isMiniProgram) {
      // log
      my.postMessage({
        sendToMiniProgram: "1",
        action: "log",
        message: "!! tradeForm submit state !!",
      });
      my.postMessage({
        sendToMiniProgram: "1",
        action: "log",
        message: "Submitted on other page. Skipped Trade Pay call",
      });
    }
  });

  $(".backToOrderSummaryBtn").on("click", function (e) {
    reloadMiniProgram();
    if (isMiniProgram) {
      // prevent default
      e.preventDefault();
      my.postMessage({
        sendToMiniProgram: "1",
        action: "orderHistory",
        message: "Relaunch Order History",
      });
      return false;
    }
  });

  // Opt-In (a.k.a. Login with GCash)
  $("#allowOptIn").on("click", function (e) {
    reloadMiniProgram();
    if (_isMiniProgram) {
      e.preventDefault();
      my.postMessage({
        sendToMiniProgram: "1",
        action: "allowOptIn",
        message: "Allow Opt-In",
        data: {
          // Needed to send back the link with guest params
          href: $(this).attr("href"),
        },
      });
      return false;
    }
  });

  $("#onClick").on("click", function (e) {
    e.preventDefault();
    onClick();
  });

  $("#onClickToMenu").on("click", function (e) {
    e.preventDefault();
    onClickToMenu();
  });

  $("#onClickToCart").on("click", function (e) {
    e.preventDefault();
    onClickToCart();
  });

  $("#onClickToRefresh").on("click", function (e) {
    e.preventDefault();
    onClickToRefresh();
  });

  $("#onClickToLogin").on("click", function (e) {
    e.preventDefault();
    onClickToLogin();
  });

  $("#onClickToAuth").on("click", function (e) {
    e.preventDefault();
    onClickToAuth();
  });

  $("#onClickToPay").on("click", function (e) {
    e.preventDefault();
    onClickToPay();
  });

  $("#onClickToFirst").on("click", function (e) {
    e.preventDefault();
    onClickToFirst();
  });

  // Get Environment
  if (_isMiniProgram) {
    my.getEnv(function (res) {
      console.log(res.miniprogram); // true
      _isMiniProgram = res.miniprogram == true ? true : false;
    });
  }

  $(".modal-close").on("click", function () {
    hideModal();
  });
});
