import {validateToken} from '../services/authenctication.js'

 function checkForAuthenticationCookie(cookieName){

    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName]
        if(!tokenCookieValue) return next()

      try {
        const userPayload = validateToken(tokenCookieValue)
        req.user = userPayload
        next()
      } catch (error) {
        return next()
      }
    }
}

// async function loggedInUser(req, res, next){
//   const userId =  req.cookies.token
//   if(!userId) return res.redirect('/signin')
//   const user = validateToken(userId)
// console.log("user", user)
// if(!user) return res.redirect('/signin')
// req.user = user;
// next()
// }



export { checkForAuthenticationCookie }