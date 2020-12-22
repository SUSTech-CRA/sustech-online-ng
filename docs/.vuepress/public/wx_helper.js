function post_to_wx() {
    var obj = {
        'shareTitle': document.title,
        'shareURL': document.URL,
        'time': (new Date()).valueOf()
    }
    wx.miniProgram.postMessage({
        data: obj
    })
}
setInterval(post_to_wx, 1000);