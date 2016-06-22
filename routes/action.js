/**
 * Created by Alejandro Felipe on 02/05/2015.
 */
module.exports = function(app){
    var action = app.controllers.action;

    //Tipos de Ações
    app.get     ('/action/type', action.type.list);
    app.put     ('/action/type', action.type.add);
    app.get     ('/action/type/:type_id', action.type.get);
    app.put     ('/action/type/:type_id', action.type.update);
    app.delete  ('/action/type/:type_id', action.type.delete);

    //Macro para tipos de ações
    app.get     ('/action/macro', action.macro.list);
    app.put     ('/action/macro', action.macro.add);
    app.delete  ('/action/macro/:macro_id', action.macro.delete);
    app.get     ('/action/macro/:macro_id', action.macro.get);

    app.get     ('/action/macro/:macro_id/type', action.macro.listTypes);
    app.get     ('/action/macro/:macro_id/type/:type_id', action.macro.existType);

    //Ações
    app.get     ('/action', action.list);
    app.put     ('/action', action.add);
    app.get     ('/action/:action_id', action.get);
    app.put     ('/action/:action_id', action.update);
    app.delete  ('/action/:action_id', action.delete);

    app.get     ('/action/user/:user_id', action.listByUser);

};