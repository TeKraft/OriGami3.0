/**
 * Created by Basti on 03.03.2017.
 */

var mongoose = require( 'mongoose' );

var baseSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },

    coordinates: {
        lat: {
            type: float,
            required: true,
            unique: false
        },
        long: {
            type: float,
            required: true,
            unique: false
        }
    },

    categories: {
        type: String,
        required: true,
        unique: false
    },

    pictures: {
        type: jpg|png,
        required: false,
        unique: false
    },


    description: {
        type: String,
        required: true,
        unique: true
    },

    holding_team: {
        type: JSON,
        required: false,
        unique: false
    },

    date_taken: {
        type: date,
        required: false,
        unique: false
    },

    safety_measures: {
        type: JSON,
        required: false,
        unique: false
    },

})

mongoose.model('Base', basesSchema);
