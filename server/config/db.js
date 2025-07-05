import mongoose from 'mongoose';

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        process.exit(1);
    }
}

export default connectDB;