/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function (app) {
    try {
        var db = require('../libs/db_connect')();
        var schema = require('mongoose').Schema;
        var Action = schema({
            _creator : { type: schema.Types.ObjectId, ref: 'User' },
            action_type : { type: schema.Types.ObjectId, ref: 'Type' },
            media : {type: schema.Types.Mixed, default: null},
            description: {type: String, default:""},
            credit: {type: Number, required: true},
            location: {
                latitude : Number,
                longitude: Number
            },
            tags: [{type: schema.Types.ObjectId, ref: 'Tag'}],
            updated: { type: Date, default: Date.now },
            extra: {type: schema.Types.Mixed, default: null}
        });
        console.log('Criado model a��o');
        return db.model('Action', Action);
    } catch (e) {
        console.log('Falhou ao criar model a��o');
    }
};