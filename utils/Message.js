/**
 * Created by Alejandro Felipe on 07/05/2015.
 */
module.exports = function (app) {
    var messages = {
        ERR_DATABASE:               'database error',

        UNAUTHORIZED_ACCESS:        'unauthorized access',

        ERR_UPDATE_ENV_ACC:         'error updating environmental account',

        ERR_CREATE_ACTION:          "error creating the action",
        ERR_CREATE_ACTION_TYPE:     "error creating the action type",

        ERR_EMPTY_ACTION:           "unknown action",
        ERR_EMPTY_ACTION_TYPE:      "unknown type of action",
        ERR_EMPTY_ACTION_MACRO:     "unknown macro of action",

        ERR_INVALID_BODY:           'invalid body',
        ERR_INVALID_USER:           'invalid user',
        ERR_INVALID_ACTION:         'invalid action',
        ERR_INVALID_ACTION_TYPE:    'invalid action type',
        ERR_INVALID_ACTION_MACRO:   'invalid action macro',

        ERR_POPULATION_TAG:         'tags population error'
    };
    var Message = function(){
        this.messages = messages;
    };

    Message.prototype ={
        getMessage: function(name){return this.messages[name]},
        getInvalidError: function(name){return 'invalid ' + name}
    };

    return new Message();
};