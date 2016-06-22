module.exports = function(app){

    var user = app.controllers.user;

    app.get('/', function(req, res){res.render('index', {title : 'Green Hug API'})});
    app.post('/user/register', user.register);
    app.post('/user/register_facebook', user.register_facebook);
    app.post('/user/activate', user.activate);
    app.post('/user/login', user.autenticate);
    app.post('/user/forgot_password',user.forgot_password);
    app.post('/user/verify_token',user.verify_token);
    app.post('/user/redefine_password',user.redefine_password);
};
