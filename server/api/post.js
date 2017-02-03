const AV = require('leanengine');
const marked = require('marked');
const hljs = require('highlight.js')
marked.setOptions({
  highlight (code, lang) {
    var res;
    if (lang) {
        //设置不了央视应该是这里的问题
      res = hljs.highlight(lang, code, true).value;
    } else {
      res = hljs.highlightAuto(code).value;
    }
    return res;
  },
  breaks: true //这一行干什么用的
})

//问题1： 要不要在修改文章的时候在判断一下文章是否属于用户本人呢？多一层保险？
//answer: 服务端设置404页面就不用在修改文章的时候多一层判断了

//以后应该把这些都弄成单var模式比较好？
//登陆用户修改其他用户的文章这里要加一个判断，以后在做

module.exports = {
    async getTopics ({query:{limit, page, id}}, res) {
         var aQuery = new AV.Query('Article')
        if (id) {
            var tag = AV.Object.createWithoutData('Tag', id)
            aQuery.equalTo('tagChosen', tag)
        }
        aQuery.descending('createdAt')
        aQuery.limit(limit)
        aQuery.skip((page - 1) * limit)
        try {
            var topics = await Promise.all([
            aQuery.count(),
            aQuery.find()
        ])
        res.json({topics, code: 200, msg: '文章列表获取成功'})
        } catch (err) {
            if (err.code === 101) {
                res.json({code: 404, msg: '不存在该标签'})
                //res.render('404.html')
            }
        }
    },
    async getArticle ({query:{id}}, res) {
        var query = new AV.Query('Article')
        try{
            var article = await query.get(id)
         res.json({article, code: 200, msg: '文章获取成功'})
        } catch (err) {
            if (err.code === 101)
            res.json({code: 404, msg: '文章未找到'})
            //res.render('404.html')//后面要改成这个
            else {
                //不知道该写什么了
               // throw new Error(err) ?
            }
        }
        
        //太多
    },
    async newDraft ({body:{title, content},currentUser:{id}, allTags}, res) {
        var user = AV.Object.createWithoutData('_User', id)
        var draft = new AV.Object('Draft')
        draft.set(title, title)
        draft.set(content, content)
        var newDraft = await draft.save()
        var relation = user.relation('draftChosen')
        relation.add(draft)
        await user.save()
        res.json({allTags, newDraft, code: 200, msg:'草稿创建成功'})
        //太多
    },
    async getOldDraft ({query: {id},currentUser, allTags}, res) {
        var user = AV.Object.createWithoutData('_User', currentUser.id)
        var urelation = user.relation('articleChosen')
        var uQuery = urelation.query()
        uQuery.equalTo('objectId', id)
        var find = await uQuery.first()
        if (find) {
            var article = AV.Object.createWithoutData('Article', id)
            var query = new AV.Query('Draft')
            query.equalTo('dependent', article)
            var draft = await query.first()
            var dRelation = draft.relation('tagChosen')
            var tQuery = dRelation.query()
            tQuery.ascending('createdAt')
            var tags = await tQuery.find()
            res.json({ allTags, draft, tags, code: 200, msg: '获取草稿成功' })//讲道理他应该支持...语法啊
        } else {
            res.json({code: 404, msg:'未找到这篇文章'})//临时办法
            //res.redirect('/aaa/articles')//这条语句需要同源才可以，再想想别的办法？
            //res.render('404.html')//这种办法？//也是需要同源，这中办法应该是最佳的，
            //应该是服务器端给他一个404页面比较好
           // res.send('HTTP STATUS: 404')
        }
        //改
        
    },
    async modifyContent ({body: {content, id}}, res) {
        var draft = AV.Object.createWithoutData('Draft', id)
        draft.set('content', content)
        await draft.save()
        res.json({ msg: '内容更新成功', code: 200 })
    },
    async modifyTitle ({body: {title, id}}, res) {
        var draft = AV.Object.createWithoutData('Draft', id)
        draft.set('title', title)
        await draft.save()
        res.json({ msg: '标题更新成功', code: 200 })
    },
    async getTags (req, res, next) {
        var query = new AV.Query('Tag')
        query.ascending('createdAt')
        var allTags = await query.find()
        if(req.path === '/tags') {
            allTags.map(i => {return i['name']})//这里就是测试一下
            res.json({allTags, code:200, msg: '获取所有标签成功'})
        } else {
            req.allTags = allTags
            next()
        }
        //太多
    },
    async addOldTag ({body: {tag: {name, objectId}, id}}, res) {
        var tag = AV.Object.createWithoutData('Tag', objectId )
        var draft = AV.Object.createWithoutData('Draft', id )
        var relation = draft.relation('tagChosen')
        relation.add(tag)
        await draft.save()
        //return res.id
        res.json({ code: 200, msg: '旧标签添加成功' })
    },
    async addNewTag ({body:{tag, id}},res) {
        var draft = AV.Object.createWithoutData('Draft', id )
        var nTag = new AV.Object('Tag')
        nTag.set('name', tag)
        var newTag = await nTag.save()
        var relation = draft.relation('tagChosen')
        relation.add(nTag)
        await draft.save()      
        res.json({newTag, code: 200, msg:'新标签添加成功'})
    },
    async removeTag ({body: {tag: {objectId}, id}},res) {
        var remove = false
        var tQuery = new AV.Query('Tag')
        var tag = await tQuery.get(objectId)

        var draft = AV.Object.createWithoutData('Draft', id )
        var relation = draft.relation('tagChosen')
        relation.remove(tag)
        await draft.save()

        var dQuery = new AV.Query('Draft')
        dQuery.equalTo('tagChosen', tag)
        var resDraft = await dQuery.find()
        if(! resDraft.length) {
            await tag.destroy()
            remove = true
        }
        res.json({msg:'标签删除成功',code: 200, remove})

    },
    //用户未发布草稿列表
    async getDrafts ({query: {page, limit},currentUser:{id}}, res) {
        var user = AV.Object.createWithoutData('_User', id)
        var uRelation = user.relation('draftChosen')
        var dQuery = uRelation.query()
        dQuery.doesNotExist('dependent')
        dQuery.descending('createdAt')
        dQuery.limit(limit)
        dQuery.skip((page - 1) * limit)
        var drafts = await Promise.all([
            dQuery.count(),
            dQuery.find()
        ])     
        res.json({drafts, code: 200, msg:'草稿列表获取成功'})
    },
    async getNewDraft ({query:{id},currentUser, allTags}, res) {
        var user = AV.Object.createWithoutData('_User', currentUser.id)
        var dRelation = user.relation('draftChosen')
        var dQuery = dRelation.query()
        dQuery.equalTo('objectId', id)
        var find = await dQuery.first()      
        if(find) {
            var query = new AV.Query('Draft')
            var draft = await query.get(id)
            var relation = draft.relation('tagChosen')
            var tQuery = relation.query()
            tQuery.ascending('createdAt')
            var tags = await tQuery.find()
            res.json({allTags, draft, tags, code:200, msg:'草稿获取成功'})
        } else {
            res.json({code: 404, msg:'未找到这篇文章'})//临时办法
            //res.render('404.html')//这种办法？//也是需要同源，这中办法应该是最佳的，
            //应该是服务器端给他一个404页面比较好
        }
        
    },
    //发布新文章
     async publishNew ({body:{draft,tags,user}}, res) {
         var oDraft = AV.Object.createWithoutData('Draft', draft.objectId ) 
         var User = AV.Object.createWithoutData('_User', user.objectId)
         var article = new AV.Object('Article')
         var tRelation = article.relation('tagChosen')
         var aRelation = User.relation('articleChosen')
         tags.forEach(i => {
             tRelation.add(AV.Object.createWithoutData('Tag', i.objectId ))
         })
         article.set('authname', user.username)
         article.set('authId', user.objectId)
         //把user的信息设置成对象的格式应该也可以，暂时先这样
         article.set('title', draft.title)
         article.set('content', marked(draft.content))
         await article.save()
         oDraft.set('dependent', article)
         await oDraft.save()
         aRelation.add(article)
         await User.save()

         res.json({msg: '发布成功',code: 200})
     },
     async publishOld ({body:{draft, tags, id}}, res) {
        var article = AV.Object.createWithoutData('Article', id)
        var relation = article.relation('tagChosen')
        var query = relation.query()
        var list = await query.find()
        list.forEach(i => {
            relation.remove(AV.Object.createWithoutData('Tag', i.id ))
        })
        await article.save()//这里得保存两边，感觉好恶心啊
        //现在弄成了吧之前关联的的tags全部都删掉，然后关联新的tags
        //先暂时这样
        tags.forEach(i => {
            relation.add(AV.Object.createWithoutData('Tag', i.objectId ))
        })
        article.set('title', draft.title)
        article.set('content', marked(draft.content))
        await article.save()
         res.json({msg: '文章修改成功',code: 200})
     }
    

}