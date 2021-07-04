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

function handleOutURL(url) {
    console.log("劫持链接 " + url);
    wx.miniProgram.navigateTo({
        url: '/pages/index/redirect?outURL=' + encodeURIComponent(url),
    });
}

function override_onclick(event) {
    if (window.is_miniprogram) {
        let url = event.currentTarget.getAttribute('href');

        let domain = new URL(url);
        domain = domain.hostname;
        let whitelist = new Set();
        whitelist.add("mirrors.sustech.edu.cn");
        whitelist.add("bus.sustcra.com");
        whitelist.add("sustech.online");
        if (whitelist.has(domain)) {
            console.log("放行白名单页面 " + url);
            window.location.href = url;
            return;
        }

        event.preventDefault();
        console.log("小程序环境，拦截外部链接。");
        handleOutURL(url);
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
        anchor.onclick = function () {
            override_onclick(event);
        }
    }
}

setInterval(reset_all_anchor, 1000);
