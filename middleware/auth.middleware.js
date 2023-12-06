import {validateToken} from '../services/authenctication.js'

 function checkForAuthenticationCookie(cookieName){
  console.log(cookieName, "cookiename")
  // here i can see my cookie name
    return (req, res, next) => {
      // but here i cant log the value or  cookie name
      console.log("cookie value")
      console.log("cookievaue", req.cookies[cookieName])
        const tokenCookieValue = req.cookies[cookieName]
        console.log("tokenCookieValue", tokenCookieValue)
        if(!tokenCookieValue) return next()

      try {
        const userPayload = validateToken(tokenCookieValue)
        console.log("userPayload", userPayload)
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