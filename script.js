const addButton = document.querySelector(".add");
const deleteButton = document.querySelector(".delete");
const searchButton = document.querySelector(".search");
const itemList = document.querySelector(".lists");
const selectList = document.querySelector(".selectList");
let items2 = JSON.parse(localStorage.getItem("items2")) || [];///
//不管它在 DOM 的哪一级、不管它是不是 <div>，只要它有且仅有一个这个类名，就会被选中。
const searchBox = document.querySelector(".search_box");
const quit = document.querySelector(".quit");

//Edit
function startEdit(index) {
    //
    const labels = itemList.children[index].querySelector(".text_read");
    const inputs = itemList.children[index].querySelector(".text_input");

    labels.style.display = 'none';
    inputs.style.display = 'inline-block';
}
function saveEdit(index){
    const input = itemList.children[index].querySelector(".text_input");

    items2[index].text = input.value || "请输入💌";

    localStorage.setItem("items2",JSON.stringify(items2));///

    writeItem(items2,itemList);
}

//Add
function addItem(e) {
    e.preventDefault();

    const item = {
        text : "",///
        done : false
    }

    items2.push(item);

    localStorage.setItem("items2",JSON.stringify(items2));///

    writeItem(items2,itemList);

    startEdit(items2.length-1);////
    
    ////items2 只是 数组，数组没有 DOM 节点\\\
    const curText = itemList.lastElementChild?.querySelector(".text_input");
    if(curText){
        curText.focus();
        curText.setSelectionRange(0,0);
    }
    
}

//Write || show
function writeItem(plates,plateList){
    plateList.innerHTML = plates.map((plate,i) => {
        //。。。是字体颜色问题
        //。。。打太快，拼写错误
        //
        return `
            <div class="list">
                
                <input type="checkbox" class="checkbox" data-index="${i}" ${plate.done ? "checked" : ""}>
                <label class="text_read" data-index="${i}">${plate.text ? plate.text : "未知"}</label>

                <input type="text" class="text_input"  data-index="${i}" value="${plate.text}" style="display:none">
                <input type="radio" class="deletebox" data-index="${i}" style="display:none">
            </div>
        `
    }).join("");
    //。。。有埋下伏笔————删除时偷懒，没全部相关都删掉、导致报错、、、
    //<button class="confirm" data-index="${i}" style="display:none">确认</button>
}

//Storage
function showChecked(e){
    const elem = e.target;
    const index = elem.dataset.index;

    items2[index].done = !items2[index].done;
    localStorage.setItem("items2",JSON.stringify(items2));///

    writeItem(items2,itemList);
}

//Delete
function deleteShow() {
    //把itemList 当成数组去 .forEach 了——它只是一个 DOM 元素，循环会立即报错，后续代码不执行。
    itemList.querySelectorAll('.deletebox').forEach(list => list.style.display = 'inline-block');
    const deleteBtn = document.querySelector(".deletebtn");
    deleteBtn.style.display = "inline-block";
}
function deleteSelect(){
    ///
    items2 = items2.filter( (_,idx) => !itemList.children[idx].querySelector(".deletebox").checked );
    localStorage.setItem("items2",JSON.stringify(items2));
    writeItem(items2,itemList);

    const deleteBtn = document.querySelector(".deletebtn");
    deleteBtn.style.display = "none";
}


//Search
function showSearchBox(){
    const searchBoxs = document.querySelector(".searchbox");
    searchBoxs.style.display = "flex";

    itemList.style.display = "none";
    searchBox.focus();
    searchBox.setSelectionRange(0,0);
}
function findText(inputText,items2){
    //
    return items2.filter(item => {
        ////
        const regex = new RegExp(inputText,"gi");
        return item.text.match(regex)
    });
}
function showSelected(){
    searchBox.style.display = "flex";

    const matchItems = findText(searchBox.value,items2);
    selectList.innerHTML = matchItems.map(
        item => 
        {
            //
            const regex = new RegExp(searchBox.value,'gi');
            const matchInput = item.text.replace(regex,`<span class="hl">${searchBox.value}</span>`);
            //
            const i = items2.indexOf(item);
            return `
                <div class="list">
                    <input type="checkbox" class="checkbox" data-index="${i}" ${item.done ? "checked" : ""}>
                    <label class="text_read" data-index="${i}">${matchInput}</label>

                    <input type="text" class="text_input"  data-index="${i}" value="${item.text}" style="display:none">
                    <input type="radio" class="deletebox" data-index="${i}" style="display:none">
                </div>
            `;
        }
    ).join("");

    // 确保搜索结果能被看见
    selectList.style.display = "block";

}

//Show & Write
writeItem(items2,itemList);

//Add
addButton.addEventListener("click",addItem);//

//Delete
deleteButton.addEventListener("click",deleteShow);
document.querySelector(".deletebtn").addEventListener("click",deleteSelect);

//Storage
/* 事件委托：统一监听 change */
itemList.addEventListener("change",e => {
    //
    if(!e.target.matches('.checkbox')) return;
    showChecked(e);
});

//Edit
itemList.addEventListener("click",e => {
    if(e.target.matches(".text_read")) startEdit(e.target.dataset.index);
});
itemList.addEventListener('keydown',e => {
    if (e.key==='Enter' && e.target.matches('.text_input'))
      saveEdit(e.target.dataset.index);
});

//Search
searchButton.addEventListener("click",showSearchBox);
searchBox.addEventListener("keyup",showSelected);
searchBox.addEventListener("input",showSelected);
quit.addEventListener("click",e => {
    const searchB = document.querySelector(".searchbox");
    searchB.style.display = "none";
    selectList.style.display = "none";//
    itemList.style.display = "block";
    
    searchBox.value = "";//
});
