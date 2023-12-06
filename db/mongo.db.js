import mongoose from "mongoose";

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/blog_backend');
        console.log('MongoDB connect successfully!!!');
    } catch (error) {
        console.log('MongoDB Connect failure!!!');
    }
}

export default connect ;