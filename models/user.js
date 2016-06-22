/**
 * Created by Alejandro Felipe on 10/04/2015.
 */
module.exports = function (app) {
    try {
        var db = require('../libs/db_connect')();
        var schema = require('mongoose').Schema;
        var user = schema({
            first_name: {type: String, required: true},
            last_name: {type: String, required: true},
            email: {type: String, required: true, index: {unique: true}},
            password: {type: String},
            birthdate: {type: Date, required: true},
            avatar: {type: String},
            confirmed: {type: Boolean, required: true, default: false},
            deactivated: {type: Boolean, required: true, default: false},
            enviromental_account:{
                balance: {type: Number, default: 0}
            },
            accounts: {type: schema.Types.Mixed, default: null},
            token: {type: String, required: true},
            verification_token: {type: String, default: null},
            current_place: {type: Number}
        }, {
            toObject: {virtuals: true},
            toJSON: {virtuals: true}
        });
        user.virtual('full_name').get(function () {
            return this.first_name + ' ' + this.last_name;
        });
        console.log('Criado model usu�rio');
        return db.model('User', user);
    } catch (e) {
        console.log('Falhou ao criar model usu�rio');
    }
};