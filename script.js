// =====================================================
// 初始化变量和DOM引用：获取所有需要操作的DOM元素
// =====================================================
const addButton = document.querySelector(".add");
const deleteButton = document.querySelector(".delete");
const searchButton = document.querySelector(".search");
const itemList = document.querySelector(".lists");
const selectList = document.querySelector(".selectList");
const searchBox = document.querySelector(".search_box");
const quit = document.querySelector(".quit");
const lightBtn = document.querySelector('.cord-bulb-switch');
const priorBox = document.querySelector(".priorBox");

// 从本地存储加载任务数据，如果没有则初始化为空数组
let items2 = JSON.parse(localStorage.getItem("items2")) || [];

// =====================================================
// 核心功能：任务编辑
// =====================================================

/**
 * 进入任务编辑模式
 * index - 要编辑的任务索引
 */
function startEdit(index) {
    // 获取任务项的标签和输入框元素
    const labels = itemList.children[index].querySelector(".text_read");
    const inputs = itemList.children[index].querySelector(".text_input");

    // 隐藏标签，显示输入框并聚焦
    labels.style.display = 'none';
    inputs.style.display = 'inline-block';
    inputs.focus();
}

/**
 * 保存任务编辑内容
 * index - 要保存的任务索引
 */
function saveEdit(index){
    // 获取输入框元素
    const input = itemList.children[index].querySelector(".text_input");

    // 更新数据模型
    items2[index].text = input.value || "请输入💌"; // 默认文本
    localStorage.setItem("items2",JSON.stringify(items2)); // 保存到本地存储

    // 更新UI显示
    const label = itemList.children[index].querySelector('.text_read');
    label.textContent = input.value || "请输入💌";
    input.style.display = 'none';
    label.style.display = 'inline-block';
}

// =====================================================
// 核心功能：任务管理
// =====================================================

/**
 * 添加新任务
 * e - 事件对象
 */
function addItem(e) {
    e.preventDefault(); // 阻止默认行为

    // 创建新任务对象
    const item = {
        text : "", // 初始文本为空
        done : false, // 未完成状态
        priority: "1", // 默认优先级
        time: Date.now() // 当前时间戳
    }

    // 保存并更新UI
    items2.push(item);
    localStorage.setItem("items2",JSON.stringify(items2)); // 保存到本地存储
    appendOneItem(item); // 添加到DOM

    // 自动进入编辑模式
    startEdit(items2.length-1);
}

/**
 * 将单个任务添加到DOM
 * item - 任务对象
 * idx - 任务索引，默认为最后一个
 */
function appendOneItem(item, idx = items2.length - 1) {
    // 创建任务DOM元素
    const div = document.createElement('div');
    div.className = 'list';
    div.dataset.priority = item.priority || 4; // 优先级数据属性
    div.dataset.time = item.time || Date.now(); // 时间戳数据属性

    // 填充任务HTML内容
    div.innerHTML = `
        <input type="checkbox" class="checkbox" data-index="${idx}" ${item.done ? 'checked' : ''}>
        <label class="text_read" data-index="${idx}">${item.text || '未知'}</label>
        <input type="text" class="text_input" data-index="${idx}" value="${item.text}" style="display:none">
        <select class="priorBox" data-index="${idx}">
            <option value="4" ${item.priority === '4' ? 'selected' : ''}>❗️❗️</option>
            <option value="3" ${item.priority === '3' ? 'selected' : ''}>❗️❌</option>
            <option value="2" ${item.priority === '2' ? 'selected' : ''}>❌❗️</option>
            <option value="1" ${item.priority === '1' ? 'selected' : ''}>❌❌</option>
        </select>
        <input type="radio" class="deletebox" data-index="${idx}" style="display:none">
    `;

    // 添加到任务列表容器
    itemList.appendChild(div); 
}

// =====================================================
// 核心功能：任务删除
// =====================================================

/**
 * 显示删除选项：进入删除模式
 */
function deleteShow() {
    // 显示所有删除选择框
    itemList.querySelectorAll('.deletebox').forEach(list => list.style.display = 'inline-block');
    const deleteBtn = document.querySelector(".deletebtn");
    deleteBtn.style.display = "inline-block"; // 显示删除按钮
    document.querySelector(".foot").style.display = "none"; // 隐藏底部栏
}

/**
 * 删除选中的任务
 */
function deleteSelect(){
    // 获取所有选中的删除项并排序（从大到小避免索引问题）
    const toDel = [...itemList.querySelectorAll('.deletebox:checked')]
    .map(cb => +cb.dataset.index)
    .sort((a,b)=>b-a);

    // 删除选中的任务
    toDel.forEach(idx => {
        items2.splice(idx,1); // 从数组中移除         
        itemList.children[idx].remove(); // 从DOM中移除   
    });

    // 更新存储并重置UI
    localStorage.setItem('items2', JSON.stringify(items2)); // 保存到本地存储
    itemList.querySelectorAll('.deletebox').forEach(list => list.style.display = 'none'); // 隐藏删除框
    document.querySelector(".deletebtn").style.display = "none"; // 隐藏删除按钮
    document.querySelector(".foot").style.display = "flex"; // 显示底部栏
}

// =====================================================
// 核心功能：任务搜索
// =====================================================

/**
 * 显示搜索框
 */
function showSearchBox(){
    document.querySelector(".searchbox").style.display = "flex"; // 显示搜索框
    itemList.style.display = "none"; // 隐藏主列表
    searchBox.focus(); // 聚焦搜索框
    searchBox.setSelectionRange(0,0); // 设置光标位置
}

/**
 * 根据关键词过滤任务
 * @param {string} inputText - 搜索关键词
 * @param {Array} items - 任务数组
 * @returns {Array} 匹配的任务数组
 */
function findText(inputText, items){
    const regex = new RegExp(inputText,"gi"); // 创建不区分大小写的正则表达式
    return items.filter(item => item.text.match(regex)); // 返回匹配的任务
}

/**
 * 显示搜索结果
 */
function showSelected(){
    // 获取匹配的任务
    const matchItems = findText(searchBox.value, items2);

    // 生成搜索结果HTML
    selectList.innerHTML = matchItems.map(item => {
            const regex = new RegExp(searchBox.value,'gi');
            // 高亮匹配文本
            const matchInput = item.text.replace(regex,`<span class="hl">${searchBox.value}</span>`);
            const i = items2.indexOf(item); // 获取任务索引

            return `
                <div class="list">
                    <input type="checkbox" class="checkbox" data-index="${i}" ${item.done ? "checked" : ""}>
                    <label class="text_read" data-index="${i}">${matchInput}</label>
                    <input type="text" class="text_input"  data-index="${i}" value="${item.text}" style="display:none">
                    <select class="priorBox" data-index="${i}">
                        <option value="4" ${item.priority==='4'?'selected':''}>❗️❗️</option>
                        <option value="3" ${item.priority==='3'?'selected':''}>❗️❌</option>
                        <option value="2" ${item.priority==='2'?'selected':''}>❌❗️</option>
                        <option value="1" ${item.priority==='1'?'selected':''}>❌❌</option>
                    </select>
                    <input type="radio" class="deletebox" data-index="${i}" style="display:none">
                </div>
            `;
        }
    ).join("");

    selectList.style.display = "block"; // 显示搜索结果
}

// =====================================================
// 核心功能：任务排序
// =====================================================

/**
 * 保存任务优先级变更
 * e - 事件对象
 */
function storagePrior(e){
    const idx = e.target.dataset.index; // 获取任务索引

    // 更新优先级和时间戳
    items2[idx].priority = e.target.value;
    items2[idx].time = Date.now(); // 更新时间戳
    localStorage.setItem('items2', JSON.stringify(items2)); // 保存到本地存储
    
    // 更新DOM属性
    const listEl = e.target.closest('.list'); // 找到最近的列表项
    listEl.dataset.priority = e.target.value; // 更新优先级属性
    listEl.dataset.time = Date.now(); // 更新时间戳属性
}

/**
 * 对任务进行排序
 */
function sortTodos(){
    // 获取所有任务DOM元素
    const nodes = [...itemList.querySelectorAll('.list')];
  
    // 按优先级和时间排序
    nodes.sort((a,b)=>{
      const pa = +a.dataset.priority || 4; // 获取优先级，默认4
      const pb = +b.dataset.priority || 4;
      if(pa !== pb) return pb - pa; // 优先级降序
      return +a.dataset.time - +b.dataset.time; // 时间升序
    });
  
    // 重新排列DOM节点
    nodes.forEach(n => itemList.appendChild(n));
  
    // 更新所有数据索引
    nodes.forEach((node, newIdx) => {
        node.querySelectorAll('[data-index]').forEach(el => {
            el.dataset.index = newIdx; // 更新索引
        });
    });

    // 同步数据到数组
    items2 = nodes.map(n => ({
        text: n.querySelector('.text_read').textContent,
        done: n.querySelector('.checkbox').checked,
        priority: n.querySelector('.priorBox').value,
        time: n.dataset.time
    }));

    localStorage.setItem('items2', JSON.stringify(items2)); // 保存排序后的数据
}

// =====================================================
// 核心功能：主题管理
// =====================================================

/**
 * 初始化主题：根据系统偏好或本地存储设置主题
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme'); // 从本地存储获取主题
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // 系统偏好
    const defaultTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light'); // 确定默认主题

    document.documentElement.dataset.theme = defaultTheme; // 设置主题
}

// =====================================================
// 事件监听器设置：绑定所有事件处理函数
// =====================================================
function setupEventListeners() {
    // 添加任务按钮事件
    addButton.addEventListener("click", addItem);

    // 删除任务按钮事件
    deleteButton.addEventListener("click", deleteShow);
    document.querySelector(".deletebtn").addEventListener("click", deleteSelect);

    // 搜索功能事件
    searchButton.addEventListener("click", showSearchBox);
    searchBox.addEventListener("keyup", showSelected);
    searchBox.addEventListener("input", showSelected);
    quit.addEventListener("click", () => {
        document.querySelector(".searchbox").style.display = "none"; // 隐藏搜索框
        selectList.style.display = "none"; // 隐藏搜索结果
        itemList.style.display = "grid"; // 显示主列表
        searchBox.value = ""; // 清空搜索框
    });

    // 主题切换事件
    lightBtn.addEventListener('click', () => {
        lightBtn.classList.add('active'); // 添加激活状态
        setTimeout(() => lightBtn.classList.remove('active'), 150); // 移除激活状态

        const isDark = document.documentElement.dataset.theme === 'dark';
        const newTheme = isDark ? 'light' : 'dark'; // 切换主题
        
        document.documentElement.dataset.theme = newTheme; // 设置新主题
        localStorage.setItem('theme', newTheme); // 保存到本地存储
    });

    // 任务编辑事件
    itemList.addEventListener("click", e => {
        if(e.target.matches(".text_read")) 
            startEdit(e.target.dataset.index); // 开始编辑
    });

    // 任务保存事件（回车键）
    itemList.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.matches('.text_input'))
            saveEdit(e.target.dataset.index); // 保存编辑
    });

    // 任务状态变更事件
    itemList.addEventListener('change', e => {
        const idx = e.target.dataset.index; // 获取任务索引

        // 复选框变更
        if (e.target.matches('.checkbox')) {
            items2[idx].done = e.target.checked; // 更新完成状态
            localStorage.setItem('items2', JSON.stringify(items2)); // 保存到本地存储
        }

        // 优先级变更
        if (e.target.matches('.priorBox')) {
            storagePrior(e); // 保存优先级
            sortTodos(); // 重新排序
        }
    });
}

// =====================================================
// 初始化应用：设置初始状态
// =====================================================
function initApp() {
    // 初始化主题
    initTheme();
    
    // 初始排序（按优先级和时间）
    items2.sort((a, b) => {
        const pa = +(a.priority || 4); // 优先级，默认4
        const pb = +(b.priority || 4);
        if (pa !== pb) return pb - pa; // 优先级降序
        return +(a.time || 0) - +(b.time || 0); // 时间升序
    });
    
    // 渲染任务列表
    writeItem(items2, itemList);
    sortTodos(); // 应用排序
    
    // 设置事件监听
    setupEventListeners();
}

// =====================================================
// 辅助函数：渲染任务列表
// =====================================================

/**
 * 将任务数组渲染到DOM
 * plates - 任务数组
 * plateList - 目标容器
 */
function writeItem(plates, plateList){
    plateList.innerHTML = plates.map((plate, i) => {
        return `
            <div class="list" data-priority="${plate.priority||4}" data-time="${plate.time||Date.now()}">
                <input type="checkbox" class="checkbox" data-index="${i}" ${plate.done ? "checked" : ""}>
                <label class="text_read" data-index="${i}">${plate.text ? plate.text : "未知"}</label>
                <input type="text" class="text_input"  data-index="${i}" value="${plate.text}" style="display:none">
                <select class="priorBox" data-index="${i}">
                    <option value="4" ${plate.priority==='4'?'selected':''}>❗️❗️</option>
                    <option value="3" ${plate.priority==='3'?'selected':''}>❗️❌</option>
                    <option value="2" ${plate.priority==='2'?'selected':''}>❌❗️</option>
                    <option value="1" ${plate.priority==='1'?'selected':''}>❌❌</option>
                </select>
                <input type="radio" class="deletebox" data-index="${i}" style="display:none">
            </div>
        `;
    }).join(""); // 拼接HTML字符串
}

// =====================================================
// 启动应用：DOM加载完成后初始化
// =====================================================
document.addEventListener('DOMContentLoaded', initApp);