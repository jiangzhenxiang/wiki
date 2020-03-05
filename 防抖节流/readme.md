# 防抖与节流函数

> 优化高频事件 onscroll oninput resize onkeyup 降低代码执行频率

> 网页展示过程：JavaScript 》style 》 layout 》 paint 》 composite 
> 
> 重绘：css样式发送变化触发重绘。 重排：dom元素位置变化了触发重排。重排肯定会触发重绘

----

用scroll和resize会导致页面不断的重新渲染。

### 节流函数（throttle）

节流就是保证一段时间内，代码只执行一次


---

### 防抖（debounce）

防抖是一段时间结束后，才能触发一次事件，如果一段时间未结束再次触发时间，就会重新开始计算时间
