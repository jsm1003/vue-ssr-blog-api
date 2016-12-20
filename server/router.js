// 所有 API 的路由

const router = require('express').Router();
const post = require('./api/post')
const user = require('./api/user')

const islogin = require('./middlewares/isLogin')

// --- 用户 ---
router.get('/topics', post.getTopics)
//获取文章列表
router.get('/article', post.getArticle)
//获取单篇文章
router.get('/tags', post.getTags)
//获取标签列表

router.get('/draft', islogin, post.getTags, post.getOldDraft)
//获取已发布文章草稿
router.get('/freshdraft', islogin, post.getTags, post.getNewDraft)
//获取未发布草稿
router.get('/drafts', islogin, post.getDrafts)
//获取你的草稿列表(一会儿要换成未发布草稿列表)
router.post('/draft/new', islogin, post.getTags, post.newDraft)
//创建新草稿
router.patch('/draft/edit/content', islogin, post.modifyContent)
//更新文章内容
router.patch('/draft/edit/title', islogin, post.modifyTitle)
//更新文章标题
router.patch('/draft/edit/oldtag', islogin, post.addOldTag)
//为该文章增添已有标签
router.patch('/draft/edit/newtag', islogin, post.addNewTag)
//为该篇文章添加新标签
router.delete('/draft/edit/removetag', islogin, post.removeTag)
//为该篇文章删除标签
router.post('/draft/edit/publishold', islogin, post.publishOld)
//修改旧文章
router.post('/draft/edit/publishnew', islogin, post.publishNew)
//发布新文章

// --- 用户登陆 ---
router.post('/user/login', user.login)
router.post('/user/logout', islogin, user.logout)
//router.post('/posts', post.test)

// --- 用户个人信息 ---
router.get('/user/info', islogin, user.info)
// --- admin ---

// 其他接口全部返回 404
router.use((req, res) => {
  res.status(404).send('Not Found.');

});
//操，登陆拦截这一块先不做了，以后再说
module.exports = router;
