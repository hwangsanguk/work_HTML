const express = require('express');


module.exports =function(){
const router = express.Router();

router.get('/mode', (req,res)=>{
    console.log("/investment/mode를 요청 받음");
  
res.render('investment.html');
});

return router;
}
