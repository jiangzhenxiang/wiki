const base = {
    logPackage() {},
    getLoadTime() {},
    getTimeoutRes() {},
    bindEvent() {},
    init() {}
};

const pm = (function () {
    // 向前兼容
    if (!window.performance) return base;
    const pMonitor = { ...base
    };
    let config = {};

    // 获取页面的timing
    pMonitor.getLoadTime = () => {
        var performance = window.performance;

        if (!performance) {
            // 当前浏览器不支持
            console.log('你的浏览器不支持 performance 接口');
            return;
        }

        var t = performance.timing;
        var times = {};

        //【重要】页面加载完成的时间
        //【原因】这几乎代表了用户等待页面可用的时间
        times.loadPage = t.loadEventEnd - t.navigationStart;

        //【重要】解析 DOM 树结构的时间
        //【原因】反省下你的 DOM 树嵌套是不是太多了！
        times.domReady = t.domComplete - t.responseEnd;

        //【重要】重定向的时间
        //【原因】拒绝重定向！比如，http://example.com/ 就不该写成 http://example.com
        times.redirect = t.redirectEnd - t.redirectStart;

        //【重要】DNS 查询时间
        //【原因】DNS 预加载做了么？页面内是不是使用了太多不同的域名导致域名查询的时间太长？
        // 可使用 HTML5 Prefetch 预查询 DNS ，见：[HTML5 prefetch](http://segmentfault.com/a/1190000000633364)
        times.lookupDomain = t.domainLookupEnd - t.domainLookupStart;

        //【重要】读取页面第一个字节的时间
        //【原因】这可以理解为用户拿到你的资源占用的时间，加异地机房了么，加CDN 处理了么？加带宽了么？加 CPU 运算速度了么？
        // TTFB 即 Time To First Byte 的意思
        // 维基百科：https://en.wikipedia.org/wiki/Time_To_First_Byte
        times.ttfb = t.responseStart - t.navigationStart;

        //【重要】内容加载完成的时间
        //【原因】页面内容经过 gzip 压缩了么，静态资源 img/js 等压缩了么？
        times.request = t.responseEnd - t.requestStart;

        //【重要】执行 onload 回调函数的时间
        //【原因】是否太多不必要的操作都放到 onload 回调函数里执行了，考虑过延迟加载、按需加载的策略么？
        times.loadEvent = t.loadEventEnd - t.loadEventStart;

        // DNS 缓存时间
        times.dnsCache = t.domainLookupStart - t.fetchStart;

        // TCP 建立连接完成握手的时间
        times.TCPconnect = t.connectEnd - t.connectStart;

        console.log(t);
        console.log(times);
        return times;
    };

    // 获取资源时间
    pMonitor.getTimeoutRes = () => {
        let resource = performance.getEntriesByType('resource');
        let ajaxMsg = [];
        let pushArr = [];
        let resourceTime = 0;
        resource.forEach((item) => {
            let json = {
                name: item.name,
                type: item.initiatorType,
                duration: item.duration.toFixed(2) || 0,
                decodedBodySize: item.decodedBodySize || 0,
                nextHopProtocol: item.nextHopProtocol,
            };
            for (let i = 0, len = ajaxMsg.length; i < len; i++) {
                if (ajaxMsg[i][1] === item.name) {
                    json.method = ajaxMsg[i][0] || 'GET'
                }
            }
            resourceTime += item.duration;
            pushArr.push(json)
        });

        console.log(pushArr);
        return pushArr;
    };

    // 封装一个上报两项核心数据的方法
    pMonitor.logPackage = () => {
        const {
            url,
            method
        } = config;

        // 页面的timing
        const times = pMonitor.getLoadTime();

        // 资源加载时间
        const timeoutRes = pMonitor.getTimeoutRes();

        // fetch方式上传 可能存在跨域问题
        fetch(url, {
            method: method,
            body: JSON.stringify({
                times: times,
                timeoutRes: timeoutRes
            })
        }).then(function (response) {
            // console.log(response)
        });


        //或者构造空的Image对象的方式，请求图片并不涉及到跨域的问题；
        // const myImage = new Image();
        // myImage.src = url;
    };

    // 当页面 DOM 结构中的 js、css、图片，以及 js 异步加载的 js、css 、图片都加载完成之后，才会触发 load 事件
    //性能监控只是辅助功能，不应阻塞页面加载，因此只有当页面完成加载后，我们才进行数据获取和上报
    // 事件绑定
    pMonitor.bindEvent = () => {
        const oldOnload = window.onload;
        window.onload = e => {
            if (oldOnload && typeof oldOnload === 'function') {
                oldOnload(e);
            }
            // 尽量不影响页面主线程
            // window.requestIdleCallback()会在浏览器空闲时期依次调用函数
            if (window.requestIdleCallback) {
                window.requestIdleCallback(pMonitor.logPackage)
            } else {
                setTimeout(pMonitor.logPackage)
            }
        }
    };

    /**
     * 初始化
     * @param {object} option
     * @param {string} option.url 页面加载数据的上报地址
     * @param {string} option.timeoutUrl 页面资源超时的上报地址
     * @param {string=} [option.method='POST'] 请求方式
     * @param {number=} [option.timeout=10000]
     */
    pMonitor.init = option => {
        const {
            url,
            method = 'POST'
        } = option;
        config = {
            url,
            method
        };
        // 绑定事件 用于触发上报数据
        pMonitor.bindEvent()
    };

    return pMonitor;
})();

export default pm;
