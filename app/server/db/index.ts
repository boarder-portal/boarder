import mongoose from 'mongoose';

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/boarder`);

export default mongoose;
