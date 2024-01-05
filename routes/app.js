import express from 'express'
import User  from '../models/user.model.js'
import {upload} from '../middleware/multer.middlewear.js'
import Blog  from '../models/post.model.js'
import commentModel from '../models/comment.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'


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

    try {
        const existedUser = await User.findOne({email})
        if(existedUser) return res.render('signup', {error: "user already exists"})
        await User.create({
            name,
            email,
            password,
        })
        return res.redirect('/signin')
    } catch (error) {
        console.log("error while trying to register user")
        return res.render('signup', {error: "error while trying to register user"})
    }
})
 
router.get('/add-blog', (req, res)=>{
    const user = req.user
    return res.render('addblog',{user})
})

router.post('/add-blog', upload.single('coverImage'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const imgPath = await uploadOnCloudinary(req.file.path);
        const blog = await Blog.create({
            title: req.body.title,
            body: req.body.body,
            coverImageUrl: imgPath.url || "",
            createdBy: user._id
        });

        user.posts.push(blog._id);
        await user.save();

        res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/blog/:id',async (req, res)=>{
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy")
        const comment = await commentModel.find({blogId: req.params.id}).populate("createdBy")
        return res.render('blog',{
            blog,
            user : req.user,
            comment
        }) 
    } catch (error) {
        console.error("error while loading blog page", error);
        return res.status(500).send('Internal Server Error');
    }
})

router.post('/delete/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id).populate("createdBy");
        const comment = await commentModel.deleteMany({blogId: req.params.id})
   
        if (!blog) return res.status(404).send("Blog not found");
        if(!comment) return res.status(404).json({res: "no comment found on this blog page"})

        const user = await User.findById(blog.createdBy._id);
        // Remove the deleted blog ID from the user's posts array
        user.posts = user.posts.filter(post => post.toString() !== req.params.id);
        await user.save();
        res
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

router.get('/update/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    return res.render('update',{blog, user:req.user})
})
 
router.post('/update/:id', upload.single('coverImage'), async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
        })
        if(req.body.body){
            blog.body = req.body.body
            await blog.save()
        }
        if(req.file){
            blog.coverImageUrl = req.file.filename
            await blog.save()
        }
        res.redirect(`/blog/${req.params.id}`)
    } catch (error) {
        console.error("error while trying to update db");
        res.send(error)
    }
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