/*
 * @Author: shichuyu
 * @Date: 2020-09-21 17:06:44
 * @LastEditors: shichuyu
 * @LastEditTime: 2020-09-22 15:47:32
 * @Description: 
 */
// import './index.less';
import './index.scss';
class Animal {
    constructor(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
}

const dog = new Animal('dog');
console.log('aaa');

// 不希望整个页面都热刷新，还需要修改入口文件
if(module && module.hot) {
    module.hot.accept()
}

fetch("/api/user")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));