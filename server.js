/*
 * @Author: shichuyu
 * @Date: 2020-09-22 15:44:41
 * @LastEditors: shichuyu
 * @LastEditTime: 2020-09-22 15:46:43
 * @Description: 利用webpack解决跨域问题
 */
// 假设前端在3000端口，服务端在4000端口，我们通过 webpack 配置的方式去实现跨域。
let express = require('express');
let app = express();
app.get('/user',(req,res) => {
  res.json({name: 'bdyjy'})
})

app.listen(4000);