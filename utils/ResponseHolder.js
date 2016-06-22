/**
 * Created by Alejandro Felipe on 07/05/2015.
 */
module.exports = function (app) {
    var ResponseHolder = function (response) {
        this.body = {status: 'success'};
        this.messageHelper = app.utils.Message;
        this.response = response;
        this.sended = false;
    };
    ResponseHolder.prototype = {
        saveBody: function (body) {this.body = body; return this},
        setCustomObject: function (name, obj) {this.body[name] = obj; return this},

        setMessage :function (m) {this.body.message = m; return this},
        deleteMessage: function(){delete this.body.message},

        setStatus: function (s) {this.body.status = s},

        setError: function () {this.setStatus('error')},
        saveError: function(m){this.saveBody({status: 'error', message: m}); return this},
        saveErrorCode: function(code){this.saveError(this.messageHelper.getMessage(code)); return this},

        setSuccess: function (s) {this.setStatus('success')},


        has_error: function(){return this.body.status === 'error'},


        getBody: function () {return this.body},

        send: function(){
            if(!this.sended){
                this.sended = true;
                this.response.send(this.body)
            }
        }
    };
    return ResponseHolder;
};