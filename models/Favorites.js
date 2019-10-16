var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FavoriteSchema = new Schema({

    title: {
        type: String,
        required: true
    }, 

    link: {
        type: String,
        required: true
    }, 

    notes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
});

var Favorite = mongoose.model("Favorite", FavoriteSchema);

module.exports = Favorite;