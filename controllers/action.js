/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function (app) {
    //TODO Adicionar Cast Error as querys
    //var local = app.locals;
    var Action = app.models.action;
    var ActionType = app.models.type;
    var ActionMacro = app.models.macro;
    var User = app.models.user;
    var Tag = app.models.tag;
    var schema = require('mongoose');

    var ResponseHolder = app.utils.ResponseHolder;
    var Message = app.utils.Message;


    var action_type_controller = {
        get: function (req, res) {
            var body = req.params;
            if (!body.type_id) res.send({
                status: 'error',
                message: Message.get('ERR_EMPTY_ACTION_TYPE')
            });
            else ActionType.find({_id: body.type_id})
                .select('name')
                .exec(function (err, type) {
                    if (err) res.send({
                        status: 'error',
                        message: Message.get('ERR_DATABASE')
                    });
                    else if (type == null) res.send({
                        status: 'error',
                        message: Message.get('ERR_INVALID_ACTION_TYPE')
                    });
                    else res.send({status: 'success', type: type});
                });
        },
        list: function (req, res) {
            ActionType.find({})
                .select('name impact action_macro')
                .populate({path: 'action_macro', select: 'name'})
                .exec(function (err, type) {
                    if (err) res.send({
                        status: 'error',
                        message: Message.get('ERR_DATABASE')
                    });
                    else res.send({status: 'success', types: type});
                });
        },
        add: function (req, res) {
            var resHolder = new ResponseHolder(res);
            var body = req.body;

            if (!body.action_type) resHolder.saveErrorCode('ERR_EMPTY_ACTION_TYPE').send();
            else ActionMacro.findOne({_id: body.action_type.action_macro})
                .exec(function (err, action_macro) {
                    if (err) resHolder.saveErrorCode('ERR_DATABASE').send();
                    else if (action_macro == null) resHolder.saveErrorCode('ERR_INVALID_ACTION_MACRO');
                    else ActionType.create(body.action_type, function (err, action_type) {
                            if (err) resHolder.saveErrorCode('ERR_DATABASE').send();
                            else if (action_type == null) resHolder.saveErrorCode('ERR_CREATE_ACTION_TYPE').send();
                            else {
                                action_macro.types.push(action_type._id);
                                action_macro.save(function (err, action_m) {
                                    if (err) resHolder.saveErrorCode('ERR_DATABASE').send();
                                    else {
                                        resHolder.setCustomObject('action_type',
                                            {
                                                action_macro: {
                                                    _id: action_m._id,
                                                    name: action_m.name
                                                },
                                                name: action_type.name,
                                                impact: action_type.impact
                                            }).send();
                                    }
                                })
                            }
                        })
                });
        },
        update: function (req, res) {
            var param = req.params;
            var body = req.body;

            if (!param.type_id) res.send({status: 'error', message: 'Id do tipo de acao não informado'});
            else if (
                !body.action_type
                || (!body.action_type.hasOwnProperty('name') && !body.action_type.hasOwnProperty('impact'))
                || !(Object.keys(body.action_type).length <= 2 && Object.keys(body.action_type).length > 0))
                res.send({status: 'error', message: 'Corpo da requisição invalido'});
            else {
                res.send({obj: body.action_type.hasOwnProperty('name')})
            }
        },//TODO update:action_type
        delete: function (req, res) {
        } //TODO delete:action_type
    };

    var action_macro_controller = {
        get: function (req, res) {
            var body = req.params;
            if (!body.macro_id) res.send({status: 'error', message: Message.get('ERR_EMPTY_ACTION_MACRO')});
            else ActionMacro.find({_id: body.macro_id})
                .select('name')
                .exec(function (err, macro) {
                    if (err) res.send({status: 'error', message: Message.get('ERR_DATABASE')});
                    else if (macro == null) res.send({status: 'error', message: Message.get('ERR_INVALID_ACTION_MACRO')});
                    else res.send({status: 'success', macro: macro});
                });
        },
        list: function (req, res) {
            ActionMacro.find({})
                .select('name')
                .exec(function (err, macro) {
                    if (err) res.send({status: 'error', message: Message.get('ERR_DATABASE')});
                    else res.send({status: 'success', macros: macro});
                });
        },
        add: function (req, res) {
        }, //TODO add:action_type
        update: function (req, res) {
        }, //TODO update:action_macro
        delete: function (req, res) {
        }, //TODO delete:action_macro

        listTypes: function (req, res) {
            var resHolder = new ResponseHolder(res);
            var body = req.params;

            if (!body.macro_id) resHolder.saveErrorCode('ERR_EMPTY_ACTION_MACRO').send();
            else ActionMacro.find({_id: body.macro_id})
                .select('name types')
                .populate({path: 'types', select: 'name impact'})
                .exec(function (err, macro) {
                    if (err) resHolder.saveErrorCode('ERR_DATABASE').send();
                    else if (macro == null) resHolder.saveErrorCode('ERR_INVALID_ACTION_MACRO').send();
                    else resHolder.setCustomObject('macro', macro);
                });
        },
        existType: function (req, res) {
            var resHolder = new ResponseHolder(res);
            var body = req.params;

            if (!body.macro_id) resHolder.saveErrorCode('ERR_EMPTY_ACTION_MACRO').send();
            else if (!body.type_id) resHolder.saveErrorCode('ERR_EMPTY_ACTION_TYPE').send();
            else ActionMacro.findOne({_id: body.macro_id, types: body.type_id})
                    .select('name types')
                    .exec(function (err, macro) {
                        if (err) {
                            if (err.name === 'CastError')
                                resHolder.saveError(
                                    Message.getInvalidError(err.path == 'types' ? 'type_id' : 'macro_id')
                                ).send();
                            else resHolder.saveErrorCode('ERR_DATABASE').send();
                        } else if (macro == null) resHolder.setCustomObject('exist', false).send();
                        else resHolder.setCustomObject('exist', true).send()
                    })
        }
    };

    var ActionController = {
        type: action_type_controller,
        macro: action_macro_controller,
        get: function (req, res) {
            var body = req.params;
            if (!body.action_id) res.send({status: 'error', message: 'Acao nao informada'});
            else Action.findOne({_id: body.action_id})
                .populate({path: '_creator', select: 'first_name last_name avatar'})
                .populate({path: 'action_type', select: 'name impact'})
                .populate({path: 'tags', select: 'name'})
                .exec(function (err, action) {
                    if (err) res.send({
                        status: 'error',
                        message: Message.get('ERR_DATABASE')
                    });
                    else if (action == null) res.send({
                        status: 'error',
                        message: Message.get('INVALID_ACTION')
                    });
                    else res.send({status: 'success', action: action});
                }
            );
        },
        list: function (req, res) {
            Action.find({}).select('_creator action_type tags description location updated')
                .populate({path: '_creator', select: 'first_name last_name avatar'})
                .populate({path: 'action_type', select: 'name impact'})
                .populate({path: 'tags', select: 'name'})
                .exec(function (err, actions) {
                    res.send({status: 'success', actions: actions});
                });
        },
        add: function (req, res) {
            var resHolder = new ResponseHolder(res);
            var body = req.body;

            if (!body.action)
                resHolder.saveErrorCode('ERR_INVALID_BODY').send();
            else if (!body.user_token)
                resHolder.saveErrorCode('UNAUTHORIZED_ACCESS').send();
            else User.findOne({token: body.user_token},
                    function (err, user) {
                        if (err)
                            resHolder.saveErrorCode('ERR_DATABASE').send();
                        else if (user == null)
                            resHolder.saveErrorCode('ERR_INVALID_USER').send();
                        else {
                            var btags = [];
                            for (var i = 0; i < body.action.tags.length; i++)
                                btags.push({name: body.action.tags[i]});

                            Tag.create(btags, function (err) {
                                Tag.find(btags, 'name', function (err, dataTags) {
                                    var act = body.action;
                                    Action.create({
                                        _creator: user._id,
                                        action_type: new schema.Types.ObjectId(act.action_type),
                                        media: act.media,
                                        description: act.description,
                                        location: act.location,
                                        tags: dataTags,
                                        credit: act.credit
                                    }, function (err, action) {
                                        if (err)
                                            resHolder.saveErrorCode('ERR_CREATE_ACTION').send();
                                        else {
                                            Action.populate(action, {path: 'tags'}, function (err, action) {
                                                if (!err) {
                                                    user.enviromental_account.balance = user.enviromental_account.balance + (( body.action.credit) * action.action_type.impact);
                                                    user.save(function (err) {
                                                        if (err) resHolder.saveErrorCode('ERR_UPDATE_ENV_ACC').send();
                                                    });
                                                    if (!resHolder.has_error()) {
                                                        resHolder.deleteMessage();
                                                        resHolder.setCustomObject('action', action).send();
                                                    }
                                                } else resHolder.saveErrorCode('ERR_POPULATION_TAG').send();
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
        },
        update: function (req, res) {
        }, //TODO update:action
        delete: function (req, res) {
        }, //TODO delete:action

        listByUser: function (req, res) {
            var resHolder = app.utils.ResponseHolder;
            var body = req.params;

            if (!body.user_id) res.send({status: 'error', message: 'Usu�rio n�o informado'});
            else {
                User.findOne({_id: body.user_id},
                    function (err, user) {
                        if (err) resHolder.saveErrorCode('ERR_DATABASE');
                        else if (user == null) resHolder.saveErrorCode('ERR_INVALID_USER');
                        else Action.find({_creator: user._id})
                                .select('action_type tags description location updated')
                                .populate({path: 'action_type', select: 'name impact'})
                                .populate({path: 'tags', select: 'name'})
                                .exec(function (err, actions) {
                                    if (err) resHolder.saveErrorCode('ERR_DATABASE');
                                    else {
                                        resHolder.deleteMessage();
                                        resHolder.setCustomObject('actions', actions);
                                    }
                                    res.send(resHolder.getBody());
                                });
                    });
            }

        }
    };

    return ActionController;
};

