import express from 'express'
import connect from './db/mongo.db.js'
import dotenv from 'dotenv'
import appRouter from './routes/app.js'
import cookieParser from 'cookie-parser'
import { checkForAuthenticationCookie } from './middleware/auth.middleware.js'
import path from 'path'
dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.static(path.resolve('./public')))
app.use(express.urlencoded({ extended: false }))
app.use('/', checkForAuthenticationCookie('token'),appRouter)


connect()

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})