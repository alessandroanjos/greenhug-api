/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function (app) {
    try {
        var db = require('../libs/db_connect')();
        var schema = require('mongoose').Schema;
        var Macro = schema({
            name: {type: String, unique: true, required: true},
            types: [{type: schema.Types.ObjectId, ref: 'Type'}]
        });
        console.log('Criado model ação macro');
        return db.model('Macro', Macro);
    } catch (e) {
        console.log('Falhou ao criar model ação macro');
    }
};

