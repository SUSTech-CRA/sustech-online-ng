(() => {
  const ENABLE_LOG = false;
  const ENABLE_FOR_AUDIT = false;
  const ENABLE_HOME_GRAY = false;
  const HEARTBEAT_INTERVAL_MS = 1000;
  const ADSENSE_DELAY_MS = 500;

  const WHITELIST_HOSTS = new Set([
    "mirrors.sustech.edu.cn",
    "bus.sustcra.com",
    "sustech.online",
    "daily.sustech.online",
    "susteen.itbill.cn",
  ]);

  const SUPPORTED_FILE_EXTENSIONS = new Set([
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "pdf",
  ]);

  window.is_miniprogram = window.is_miniprogram || false;

  function log(...args) {
    if (ENABLE_LOG) {
      console.log("[wx_helper]", ...args);
    }
  }

  function getMiniProgramAPI() {
    return window.wx && window.wx.miniProgram ? window.wx.miniProgram : null;
  }

  function isInWechatMP() {
    return (
      /miniprogram/i.test(navigator.userAgent) ||
      window.__wxjs_environment === "miniprogram" ||
      window.is_miniprogram === true
    );
  }

  function updateMiniProgramEnv() {
    const miniProgram = getMiniProgramAPI();
    if (!miniProgram || typeof miniProgram.getEnv !== "function") {
      return;
    }

    miniProgram.getEnv((res) => {
      window.is_miniprogram = Boolean(res && res.miniprogram);
    });
  }

  function postHeartbeatToWx() {
    const miniProgram = getMiniProgramAPI();
    if (!miniProgram || typeof miniProgram.postMessage !== "function") {
      return;
    }

    miniProgram.postMessage({
      data: {
        msgType: "heartbeat",
        shareTitle: document.title,
        shareURL: document.URL,
        scrollTop: document.documentElement.scrollTop,
        time: Date.now(),
      },
    });

    updateMiniProgramEnv();
  }

  function getResolvedURL(rawUrl) {
    try {
      return new URL(rawUrl, window.location.href);
    } catch (error) {
      log("invalid url", rawUrl, error);
      return null;
    }
  }

  function getPathExtension(pathname) {
    const segments = pathname.split(".");
    if (segments.length < 2) {
      return "";
    }

    return segments.pop().toLowerCase();
  }

  function getURLMeta(url) {
    const urlObject = getResolvedURL(url);
    if (!urlObject) {
      return null;
    }

    const fileExt = getPathExtension(urlObject.pathname);
    return {
      url: urlObject.toString(),
      hostname: urlObject.hostname,
      fileExt,
      isWhitelisted: WHITELIST_HOSTS.has(urlObject.hostname),
      isSupportedFile: SUPPORTED_FILE_EXTENSIONS.has(fileExt),
    };
  }

  function handleOutURL(meta) {
    const miniProgram = getMiniProgramAPI();
    if (!miniProgram || typeof miniProgram.navigateTo !== "function") {
      return;
    }

    log("intercept url", meta.url, meta);

    if (ENABLE_FOR_AUDIT) {
      return;
    }

    miniProgram.navigateTo({
      url:
        "/pages/index/redirect?outURL=" +
        encodeURIComponent(meta.url) +
        "&inwhitelist=" +
        meta.isWhitelisted +
        "&handleFile=" +
        meta.isSupportedFile +
        "&ext=" +
        meta.fileExt,
    });
  }

  function shouldBypassAnchor(anchor) {
    return (
      !anchor ||
      anchor.hasAttribute("data-fancybox") ||
      anchor.hasAttribute("download") ||
      anchor.target === "_blank" ||
      anchor.getAttribute("href") === null
    );
  }

  function handleAnchorClick(event) {
    if (!isInWechatMP()) {
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const anchor = event.target.closest("a");
    if (shouldBypassAnchor(anchor)) {
      return;
    }

    const href = anchor.getAttribute("href");
    const meta = getURLMeta(href);
    if (!meta) {
      return;
    }

    if (meta.isWhitelisted && !meta.isSupportedFile) {
      log("allow whitelisted url", meta.url);
      return;
    }

    event.preventDefault();
    handleOutURL(meta);
  }

  function loadAdsense() {
    log("check environment before loading adsense");

    if (isInWechatMP()) {
      log("skip adsense in mini program");
      return;
    }

    if (document.querySelector('script[data-ad-client="ca-pub-9039393129169217"]')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.setAttribute("data-ad-client", "ca-pub-9039393129169217");
    document.head.appendChild(script);
  }

  function toggleClass(element, className, shouldAdd) {
    if (!element) {
      return;
    }

    element.classList.toggle(className, shouldAdd);
  }

  function changeGray() {
    if (!ENABLE_HOME_GRAY) {
      return;
    }

    const isHomePage = window.location.pathname === "/";
    toggleClass(document.querySelector(".navbar"), "home-gray", isHomePage);
    toggleClass(document.querySelector(".sidebar"), "home-gray", isHomePage);
    toggleClass(document.querySelector(".page"), "home-gray", isHomePage);
  }

  function bindEvents() {
    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("hashchange", changeGray, false);
  }

  function observeDOMChanges() {
    const domObserver = new MutationObserver(() => {
      changeGray();
    });

    domObserver.observe(document, { subtree: true, childList: true });
  }

  function init() {
    updateMiniProgramEnv();
    postHeartbeatToWx();
    setInterval(postHeartbeatToWx, HEARTBEAT_INTERVAL_MS);
    setTimeout(loadAdsense, ADSENSE_DELAY_MS);
    bindEvents();
    observeDOMChanges();
    changeGray();
  }

  init();
})();
