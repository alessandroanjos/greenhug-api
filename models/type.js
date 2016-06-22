/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function (app) {
    try {
        var db = require('../libs/db_connect')();
        var schema = require('mongoose').Schema;
        var Type = schema({
            action_macro: {type: schema.Types.ObjectId, ref: 'Macro'},
            name: {type: String, unique: true, required: true},
            impact: {type: Number, default: 0, required: true} //-1 Negativo | 1 Positivo
        });
        console.log('Criado model tipo de ação');
        return db.model('Type', Type);
    } catch (e) {
        console.log('Falhou ao criar model tipo de ação');
    }
};