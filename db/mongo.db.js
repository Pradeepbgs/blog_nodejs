import mongoose from "mongoose";

async function connect() {
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/blog_backend`);
        console.log('MongoDB connect successfully!!!');
    } catch (error) {
        console.log('MongoDB Connect failure!!!');
    }
}

export default connect ;