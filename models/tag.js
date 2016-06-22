/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function (app) {
    try {
        var db = require('../libs/db_connect')();
        var schema = require('mongoose').Schema;
        var Tag = schema({
            name: {type: String, unique: true, required: true}
        });
        console.log('Criado model tag');
        return db.model('Tag', Tag);
    } catch (e) {
        console.log('Falhou ao criar model tag');
    }
};