import express from 'express'
import User  from '../models/user.model.js'
import {upload} from '../middleware/multer.middlewear.js'
import Blog  from '../models/post.model.js'
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
    return res.redirect('/')
})

router.get('/add-blog', (req, res)=>{
    const user = req.user
    console.log(user)
    return res.render('addblog',{user})
})

router.post('/add-blog',upload.single('coverImage'),async (req, res)=>{
    const blog = await Blog.create({
        title: req.body.title,
        body: req.body.body,
        coverImageUrl: req.file.filename,
    })
    return res.redirect(`/blog/${blog._id}`)
})

router.get('/blog/:id',async (req, res)=>{
    const blog = await Blog.findById(req.params.id)
    const user = req.user
    return res.render('blog',{
        blog,
        user
    }) 
})


export default router