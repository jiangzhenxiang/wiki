let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function (data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function (element) {
    let color = element.target.value;
    // 获取当前选项卡  active：当前tab是否激活 。currentWindow：选项卡是否在当前窗口
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        // 想这个页面注入下面code代码
        chrome.tabs.executeScript(
            tabs[0].id, {
                code: 'document.body.style.backgroundColor = "' + color + '";'
            });
    });
};
