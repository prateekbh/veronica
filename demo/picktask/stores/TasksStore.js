(function(veronica) {
    function TasksStore() {
        var _self = this;
        var tasks=[];
        var markedTasks=[];
        var unMarkedTasks=[];

        _self.Dispatcher.register("addtask", function(data){
            var task={
                done:false,
                label:data.task
            };
            tasks.push(task);
            _self.emit("task:added");
        });

        _self.Dispatcher.register("marktask", function(data){
           tasks.forEach(function(e){
                if(e.label===data.task){
                    e.done=data.done;
                }
            });
        });


        this.getAllTasks=function(){
            return tasks;
        }

        this.getMarkedTasks = function () {
            tasks.map(function(i){
                if(i.done === true){
                    markedTasks.push(i);
                }
            })

            return markedTasks;
        }

        this.getUnmarkedTasks = function () {
            tasks.map(function (j) {
                if(j.done === false){
                    unMarkedTasks.push(j);
                }
            });
            return unMarkedTasks;
        }

        this.resetMarkedUnmarkedTasks = function(){
            markedTasks=[];
            unMarkedTasks=[];
            tasks.forEach(function(i){
                i.done=false;
            })
        }
    }
    veronica.flux.Stores.createStore("TasksStore", TasksStore);
})(veronica);