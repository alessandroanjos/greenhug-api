/**
 * Created by Alejandro Felipe on 10/04/2015.
 */
module.exports = function (app) {
    var local = app.locals;
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',
        password = 'd6F3Efeq';

    var User = app.models.user;

    function encrypt(text) {
        var cipher = crypto.createCipher(algorithm, password);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    function decrypt(text) {
        var decipher = crypto.createDecipher(algorithm, password);
        try {
            var dec = decipher.update(text, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        } catch (ex) {
            console.log('deu ruim');
            return null;
        }
    }


    var UserController = {
        register: function (req, res) {

            var body = req.body.user;
            if (!body) {
                res.send({status: 'error', message: 'Corpo da requisição inválido'});
            } else if (body.hasOwnProperty('first_name') && body.hasOwnProperty('last_name') &&
                body.hasOwnProperty('email') && body.hasOwnProperty('password') &&
                body.hasOwnProperty('birthdate')) {

                var current_date = (new Date()).valueOf().toString();
                var random = Math.random().toString();
                var token = crypto.createHash('sha1').update(current_date + random).digest('hex');

                var data = new Date();
                data.setDate(data.getDate() + 1);

                body['token'] = token;
                body['verification_token'] = encrypt(data.toISOString());
                body['birthdate'] = new Date(body['birthdate']);
                body['password'] = encrypt(body['password']);

                var user = new User(body);

                user.save(function (err) {
                    if (err) {
                        //console.log(err);
                        res.send({status: 'error', message: err.message});
                    } else {
                        res.send({status: 'success', message: 'Cadastro realizado'});
                    }
                });

            } else {
                res.send({status: 'error', message: 'campos obrigatorios não foram enviados'});
            }
        },
        register_facebook: function (req, res) {

            var body = req.body.user.user;
            if (!body) {
                res.send({status: 'error', message: 'Corpo da requisição inválido'});
            } else if (body.hasOwnProperty('first_name') && body.hasOwnProperty('last_name') &&
                body.hasOwnProperty('email') && body.hasOwnProperty('birthdate')) {

                var current_date = (new Date()).valueOf().toString();
                var random = Math.random().toString();
                var token = crypto.createHash('sha1').update(current_date + random).digest('hex');

                body['token'] = token;
                body['confirmed'] = true;
                body['birthdate'] = new Date(body['birthdate']);


                User.findOne(
                    {'accounts.facebook.id': body.accounts.facebook.id},
                    {'accounts.facebook.email': body.accounts.facebook.email})
                    .select('first_name last_name fullname email avatar token birthdate confirmed')
                    .exec(function (err, user) {
                        if (err) {
                            res.send({status: 'error', message: err.message});
                        } else {
                            if (user) {
                                res.send({status: 'success', user: user})
                            } else {
                                var user = new User(body);

                                user.save(function (err, user) {
                                    if (err) {
                                        res.send({status: 'error', message: err.message});
                                    } else {
                                        res.send({status: 'success', user: user});
                                    }
                                });
                            }
                        }
                    });


            } else {
                res.send({status: 'error', message: 'campos obrigatorios não foram enviados'});
            }
        },
        activate: function (req, res) {

            console.log('data: ' + decrypt(req.body.verification_token));
            console.log(new Date(decrypt(req.body.verification_token)));
            console.log(new Date());
            if (new Date(decrypt(req.body.verification_token)) > new Date()) {
                User.findOne({verification_token: req.body.verification_token}, function (err, user) {
                    if (err) {
                        res.send({status: 'error', message: err.message});
                    } else {
                        if (user) {
                            console.log(user);
                            user.confirmed = true;
                            user.save(function () {
                                res.send({status: 'success', message: 'Conta Confirmada'});
                            });
                        } else {
                            res.send({status: 'error', message: 'Token Invalido'});
                        }
                    }
                });
            } else {
                res.send({status: 'error', message: 'Token Expirado'});
            }
        },
        autenticate: function (req, res) {

            var body = req.body;

            if (!body) {
                res.send({status: 'error', message: 'Corpo da requisição inválido'});
            } else if (body.hasOwnProperty('email') && body.hasOwnProperty('password')) {
                User.findOne({
                        email: body.email,
                        password: encrypt(body.password)
                    }, 'first_name last_name fullname email avatar token birthdate confirmed'
                    , function (err, user) {
                        if (err) {
                            res.send({status: 'error', message: err.message});
                        } else {
                            if (user) {
                                if (user.confirmed) {
                                    res.send({status: 'success', message: 'Usuario autenticado', user: user});
                                } else {
                                    res.send({status: 'error', message: 'Conta não Confirmada'});
                                }
                            } else {
                                res.send({status: 'error', message: 'Email ou Senha incorretos'});
                            }
                        }
                    });
            } else {
                res.send({status: 'error', message: 'Campo Vazio'});
            }
        },
        forgot_password: function (req, res) {

            var body = req.body;

            if (body.hasOwnProperty('email')) {
                User.findOne({email: body.email}, function (err, user) {
                    if (err) {
                        res.send({status: 'error', message: err.message});
                    } else {
                        if (user) {

                            if (user.confirmed) {
                                var data = new Date();
                                data.setDate(data.getDate() + 1);

                                console.log(user);
                                user.verification_token = encrypt(data.toISOString());
                                user.save(function () {
                                    res.send({status: 'success', message: 'Token enviado'});
                                });
                            } else {
                                res.send({status: 'error', message: 'Conta ainda não confirmada'});
                            }

                        } else {
                            res.send({status: 'error', message: 'Email Não cadastrado'});
                        }
                    }
                });
            } else {
                res.send({status: 'error', message: 'Email Vazio'});
            }
        },
        verify_token: function (req, res) {

            if (new Date(decrypt(req.body.verification_token)) > new Date()) {
                User.findOne({verification_token: req.body.verification_token}, function (err, user) {
                    if (err) {
                        res.send({status: 'error', message: err.message});
                    } else {
                        if (user) {
                            res.send({status: 'success', message: 'Token Válido'});
                        } else {
                            res.send({status: 'error', message: 'Token Inválido'});
                        }
                    }
                });
            } else {
                res.send({status: 'error', message: 'Token Expirado'});
            }

        },
        redefine_password: function (req, res) {

            var body = req.body;

            if (new Date(decrypt(body.verification_token)) > new Date()) {
                User.findOne({verification_token: body.verification_token}, function (err, user) {
                    if (err) {
                        res.send({status: 'error', message: err.message});
                    } else {
                        if (user) {
                            console.log(user);
                            user.password = encrypt(body.password);
                            user.save(function () {
                                res.send({status: 'success', message: 'Senha Alterada'});
                            });
                        } else {
                            res.send({status: 'error', message: 'Token Invalido'});
                        }
                    }
                });
            } else {
                res.send({status: 'error', message: 'Token Expirado'});
            }

        }
    };

    return UserController;
};