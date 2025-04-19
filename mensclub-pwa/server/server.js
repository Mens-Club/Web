const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
 
// http://localhost:4000/ 으로 접속 시 응답메시지 출력
app.get('/', (req,res) => {
    res.send({ test : "this is test!!"});
})
 
app.listen(PORT, () => {
    console.log(`Server run : http://localhost:${PORT}/`)
})