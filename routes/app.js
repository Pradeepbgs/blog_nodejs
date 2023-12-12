import express from 'express'
import User  from '../models/user.model.js'
import {upload} from '../middleware/multer.middlewear.js'
import Blog  from '../models/post.model.js'
import commentModel from '../models/comment.model.js'
import { checkForAuthenticationCookie } from '../middleware/auth.middleware.js'


const router = express.Router()

router.get('/',async (req, res) => {
    const blog = await Blog.find()
    const user = req.user
   return res.render('home',{blog, user});
})

router.get('/signin', (req, res) => {
    return res.render('signin')
})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password)
        return res.cookie('token', token).redirect('/')
    } catch (error) {
        res.render('signin', {error: "incorrect username or password"})
    }
})

router.get('/logout', (req, res) => {
    return res.clearCookie('token').redirect('/')
})

router.get('/signup', (req, res) => {
    return res.render('signup')
})


router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body
    await User.create({
        name,
        email,
        password,
    })
    return res.redirect('/signin')
})
 
router.get('/add-blog', (req, res)=>{
    const user = req.user
    return res.render('addblog',{user})
})

router.post('/add-blog',upload.single('coverImage'), async(req, res, next)=>{
    const user = await User.findById(req.user._id)
    console.log(user, "user")
    const blog = await Blog.create({
        title: req.body.title,
        body: req.body.body,
        coverImageUrl: req.file.filename,
        createdBy: user._id
      });
      user.posts.push(blog._id);
      try {
        await user.save();
      } catch (error) {
        console.log(error, 'user save error');
      }
      res.redirect(`/blog/${blog._id}`);
      next()
})

router.get('/blog/:id',async (req, res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy")
    const comment = await commentModel.find({blogId: req.params.id}).populate("createdBy")
  
    return res.render('blog',{
        blog,
        user : req.user,
        comment
    }) 
})

router.post('/comment/:blogId', async function(req,res, next){
    await commentModel.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    }) 
    
    res.redirect(`/blog/${req.params.blogId}`)
})

export default router