import jwt from 'jsonwebtoken'

const secret = "batman@123"

function createToken(user) {
    const payload = {
        _id: user._id,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role
    };
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });
    return token;
}

function validateToken(token){
    try {
        const payload = jwt.verify(token, secret);
        return payload;
    } catch (error) {
        
    }

}

export { createToken, validateToken }