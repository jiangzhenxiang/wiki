// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// 使用 chrome.runtime API 获取后台网页、返回清单文件详情、监听并响应应用或扩展程序生命周期内的事件.
// onInstalled当扩展程序第一次安装、更新时 ...
chrome.runtime.onInstalled.addListener(function () {
  // Declarative Content API允许您根据网页的URL和其内容匹配的CSS选择器显示扩展的页面操作

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([{

      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'www.google.com',
            schemes: ['https']
          },
        }),
        new chrome.declarativeContent.PageStateMatcher({
          css: ["video"]
        })
      ],
      // And shows the extension's page action.
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
