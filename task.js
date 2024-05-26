const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String
},{
    collection:"registekarthik"
}
)


const ImageSchema = new mongoose.Schema(
    {
        name: String,
        url: String,
        size: String
},{
    collection:"Image_karthik"
}
)



const UserModel = mongoose.model('registe_karthik',UserSchema)
const Image = mongoose.model('Image_karthik',ImageSchema)


module.exports = {Image,UserModel}