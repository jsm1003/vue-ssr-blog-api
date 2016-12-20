const AV = require('leanengine');

module.exports = {
    async signup (req, res) {
      var user = new AV.User()
      user.setUsername(req.body.username)
      user.setPassword(req.body.password)
      user.setEmail(req.body.email)
      var nUser = await user.signUp()
      res.json({code: 200, msg:'用户注册成功'})
    },
     async login (req, res) {
       var json = {}
       try {
         var user = await AV.User.logIn(req.body.username, req.body.password)
          res.saveCurrentUser(user)
         // res.send(user.id)
          json = {
            code: 200,
            msg: '登陆成功',
            data: user.id
          }
       } catch (err) {
         if(err.code === -1){
           json = {
             code: -1,
             msg: '服务器错误'
           }
         } else if (err.code === 210){
           console.log(err)
          json = {
            code: -210,
            msg: '用户名或密码错误'
          }
         }      
       }
       res.json(json)
       
    },
    logout (req, res) {
      req.currentUser.logOut()
      res.clearCurrentUser() // 从 Cookie 中删除用户他只是把avos:sess字段设置为空
      //其实下面这两句不加也可以，我就是试一下效果
      //试了一下没有效果，好吧，不用了
      // res.clearCookie('avos:sess')
      // res.clearCookie('avos:sess.sig')
      //res.redirect('/profile');
      res.json({
        msg: '退出成功',
        code: 200
      })
    },
     async info ({currentUser: {id}}, res) {
       var User = AV.Object.createWithoutData('_User', id)
       var user = await User.fetch()
       res.json({user, code: 200, msg: '获取用户信息成功'})
    }
}

//code: 206 没有sessionId