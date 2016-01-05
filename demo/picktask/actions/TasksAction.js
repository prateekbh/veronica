/**
 * Created by manzur.husain on 04/01/16.
 */
(function(veronica) {
    function TasksAction() {
        var _self = this;
        this.addTask = function(label) {
            this.Dispatcher.trigger("addtask", {
                task: label
            });
        };

        this.markTask=function(label,readStatus){
            this.Dispatcher.trigger("marktask", {
                task: label,
                done:readStatus
            });
        };

        this.removeTask=function(label){

        };
    }
    veronica.flux.Actions.createAction("TasksAction", TasksAction);
})(veronica);
