function post_to_wx() {
    var obj = {
        'msgType': "heartbeat",
        'shareTitle': document.title,
        'shareURL': document.URL,
        'scrollTop': document.documentElement.scrollTop,
        'time': (new Date()).valueOf()
    };
    wx.miniProgram.postMessage({
        data: obj
    });
    wx.miniProgram.getEnv(function (res) {
        window.is_miniprogram = res.miniprogram;
    });
}
setInterval(post_to_wx, 1000);

function handleOutURL(url, whitelist_flag, file_flag, file_ext) {
    console.log("劫持链接 " + url);
    wx.miniProgram.navigateTo({
        url: '/pages/index/redirect?outURL=' + encodeURIComponent(url) +
            '&inwhitelist=' + whitelist_flag +
            '&handleFile=' + file_flag +
            '&ext=' + file_ext,
    });
}

function override_onclick(event) {
    if (window.is_miniprogram) {
        let url = event.currentTarget.getAttribute('href');

        let url_obj = new URL(url);
        let whitelist = new Set();
        whitelist.add("mirrors.sustech.edu.cn");
        whitelist.add("bus.sustcra.com");
        whitelist.add("sustech.online");
        whitelist.add("daily.sustech.online");
        whitelist.add("");

        let supportFiles = new Set();
        supportFiles.add("doc");
        supportFiles.add("docx");
        supportFiles.add("xls");
        supportFiles.add("xlsx");
        supportFiles.add("ppt");
        supportFiles.add("pptx");
        supportFiles.add("pdf");
        let the_hostname = url_obj.hostname;
        let path_ext = url_obj.pathname.split('.').pop().toLowerCase();
        let whitelist_flag = whitelist.has(the_hostname);
        let file_flag = supportFiles.has(path_ext);
        if (whitelist_flag && !file_flag) {
            // 当 url 在白名单里面，且不为可微信显示的文件。
            console.log("放行白名单页面 " + url);
            window.location.href = url;
            return;
        }

        event.preventDefault();
        console.log("小程序环境，拦截外部链接或者可显示文件。");
        handleOutURL(url, whitelist_flag, file_flag, path_ext);
        // return false;
    }
    // ------------
    // else {
    //     return true;
    // }
}

function reset_all_anchor() {
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (anchor.hasAttribute("data-fancybox")) {
            console.log("skip fancybox a tag: ", anchor.getAttribute('href'));
        } else {
            anchor.onclick = function () {
                override_onclick(event);
            }
        }
    }
}

setInterval(reset_all_anchor, 1000);

function isInWechatMP() {
    return navigator.userAgent.match(/miniprogram/i) || window.__wxjs_environment === 'miniprogram';
};

// function load_adsense() {
//     console.log("判断环境，加载 adsense")

//     if (isInWechatMP() === false) {
//         console.log("非小程序环境，加载");
//         var oScript = document.createElement("script");
//         oScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
//         oScript.setAttribute("async", "");
//         oScript.setAttribute("data-ad-client", "ca-pub-9039393129169217");
//         document.head.appendChild(oScript);
//         // <script data-ad-client="ca-pub-9039393129169217" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
//     } else {
//         console.log("小程序环境，跳过");
//     }
// }
// setTimeout("load_adsense()", 500);
