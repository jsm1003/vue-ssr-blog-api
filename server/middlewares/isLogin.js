
module.exports = (req, res, next) => {
        if (req.currentUser) {
            next()
             //res.send(req.currentUser);
        } else {
            res.json({msg: '请先登录',code: 401})//临时办法
        // 没有登录，最终跳转到登录页面。
        // res.redirect('/login');

         }
    }
