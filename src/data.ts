/**
 * Created by coffee on 2016/11/10.
 */

class Parse{

    constructor(){

    }

}

class Utils {

    /**
     * 遍历数组、伪数组、以及普通对象
     * @param arr
     * @param callback
     */
    static each(arr, callback: (obj?, index?) => boolean | void){

        if(Array.isArray(arr)){

            arr.forEach(function (ele, index) {
                callback.call(this, ele, index);
            });

        }else if(typeof arr === "object" && typeof arr.length === 'number'){
            Array.prototype.forEach.call(arr, function (ele, index) {
                callback.call(this, ele, index);
            })
        }else if(typeof arr === "object"){

            let index = 0;

            for(let i in arr){
                if(arr.hasOwnProperty(i)){
                    callback.call(this, arr[i], index++);
                }
            }
        }

    }

    /**
     * 对一个数组或者字符串进行插入元素的操作
     * @param arr 数组或者字符串
     * @param obj 插入的对象
     * @param index 插入的位置
     */
    static insert(arr:Array<any> | string, obj:any, index:number = 0): Array<any> | string{

        if(Array.isArray(arr)){
            arr.splice(index, 0, obj);
        }else{
            if(arr.length < index){
                throw new Error("插入的位置超出了字符串原有的长度");
            }
        }

        return arr;
    }

}


class Vue{

    private _data;
    private app;

    private subList = {};

    // private TAG_REG:RegExp = /\{\{\s*([\w\s\[\]+.*]*)\s*}}/g;
    private TAG_REG:RegExp = /{{\s?([\s\w.+*-/><]*)\s?}}/g;
    private VAR_REG:RegExp = /(([A-Za-z_]+[\w_.]*)(\[\s?(["'])?\s?\w+\s?(\4)\s?])?((\.[A-Za-z_]\w*)*(\[\s?(["'])?\s?\w+\s?(\4)\s?])*)*)/g;

    constructor(option){

        this._data = {};

        this.app = document.querySelector(option.el);
        this._data = option.data;

        this.init();

        this.parseText();
    }

    private init(){

    }

    /**
     * 解析文本
     */
    private parseText(){

        let textNodeList: HTMLElement[] = [];

        let getTextNode = (element: HTMLElement) => {

            let childNodes= element.childNodes;

            Utils.each(childNodes, (ele) => {

                this.TAG_REG.lastIndex = 0;

                // 文本节点并且包含标识符
                if(ele.nodeType === document.TEXT_NODE && this.TAG_REG.test(ele.textContent)){
                    textNodeList.push(ele);

                }

                // 还有子节点就要进行递归
                if(ele.nodeType === document.ELEMENT_NODE && ele.childNodes.length > 0){
                    getTextNode(ele);
                }

            })

        };
        getTextNode(this.app);

        // 开始进行字符串解析
        Utils.each(textNodeList, (textNode:Text) => {

            this.TAG_REG.lastIndex = 0;

            // 复制出一个文本列表组，拼接之后的结果和原文本节点是一样的
            let newTextNodeList:Text[] = [];

            // 记录处理文本的位置
            let searchIndex:number = 0;
            while(true){

                let result:RegExpExecArray = this.TAG_REG.exec(textNode.textContent);

                // 末尾文本节点
                if(result === null && searchIndex !== textNode.textContent.length){
                    let newTextNode:Text = document.createTextNode(textNode.textContent.substr(searchIndex));
                    newTextNodeList.push(newTextNode);

                    break;
                }else if(result === null) break;

                // 使用前一次处理文本的位置，判断前面是否有多余的文本节点
                if(result.index > searchIndex){
                    let newTextNode:Text = document.createTextNode(textNode.textContent.substr(searchIndex, result.index - searchIndex));

                    newTextNodeList.push(newTextNode);
                }

                // 对所有合法变量追加"this."作用域
                let result1 = result[1].replace(this.VAR_REG, function ($0, $1) {
                    return "this."+$1;
                });

                let fun = new Function(`return ${result1}`).bind(this.data);

                let variableTextNode:Text = document.createTextNode(fun());

                newTextNodeList.push(variableTextNode);

                searchIndex = result.index + result[0].length;

            }


            Utils.each(newTextNodeList, (ele:Text, index:number) => {

                // 两种方法都可以，前者ts报错，但是正常运行
                // textNode.before(ele);
                textNode.parentNode.insertBefore(ele, textNode);
            });


            textNode.remove();
        })

    }

    get data(){
        return this._data;
    }

}

let vm = new Vue({
    el: "#app",
    data: {
        name: "咖啡",
        title: "数据绑定测试",
        age: 11,
        sex: 1,
        love: [
            "yuan",
            "ping"
        ],
        test0: {
            test: "看到你我就放心了",
            a: {
                b: "好开心"
            }
        }
    }
});
