(function(){
  var app = angular.module("todo",["ngResource","angular.filter"]);

  //services
  app.factory('Entry',function($resource){
    return $resource('/tasks/:id.json',{id: '@id'},{
      update:{
        method: 'PATCH'
      },
      query:{
        method:'GET',isArray:true
      }
    },{
      stripTrailingSlashes: false
    });
  });


  app.factory('data',function(){
    this.date_v = new Date();
    this.date_v.setHours(0,0,0,0);
    this.date_v =this.date_v.toISOString();
    this.tasks={};
    this.waiting = false;
    this.addTask = function(task){
      if (this.tasks[this.date_v]==null){
        this.tasks[this.date_v] = [task];
      }
      else{
        this.tasks[this.date_v].push(task);
      }
    }
    return this;

  });

  //filters
  app.filter('orderObjectBy',function(){
  });

  app.controller('TodoController',['$log','$http','Entry','data',function($log,$http,Entry,data){
    var root = this;
    this.$log =$log;
    this.date = new Date();
    this.date_v =data.date_v;
    Entry.query().$promise.then(function(response){
      data.tasks = response;
      root.data = {};
      angular.forEach(response,function(result){
        if (root.data[result.done_at]==null){
          root.data[result.done_at]=[result];
        }
        else{
          root.data[result.done_at].push(result);
        }
      });
      root.data[root.date_v] = root.data[root.date_v].concat(root.data["null"]);
      root.data["null"] = [];
      data.tasks = root.data;
    });


    this.getDelay = function(end_date){
      end_date = new Date(end_date);
      var timeDiff,days,hours;
      if(this.date>end_date){
         timeDiff = this.date.getTime()-end_date.getTime();
         days = Math.floor(timeDiff/(1000*3600*24));
         hours = Math.floor((timeDiff-(days*1000*3600*24))/(1000*3600));
         return "Delayed by "+days+" Days "+hours+" Hours";
      }
      else{
         timeDiff = end_date.getTime()-this.date.getTime();
         days = Math.floor(timeDiff/(1000*3600*24));
         hours = Math.floor((timeDiff-(days*1000*3600*24))/(1000*3600));
         return "Due by "+days+" Days "+hours+" Hours";
      }
    }
  }]);

  app.controller('TaskController',['$http','Entry','$resource','data',function($http,Entry,$resource,data){
    var root = this;
    root.task = {};
    root.date = new Date();
    root.time = '';

    this.addTask = function(){
      data.waiting = true;

      root.task.end_at=new Date(this.date.getFullYear(),this.date.getMonth(),this.date.getDate(),this.time.getHours(),this.time.getMinutes());

      var entry = new Entry();
      entry.task = root.task;

      Entry.save(entry,function(task){
        data.addTask(task);
        data.waiting = false;
        root.task = {};
        root.date =new Date();
        root.time = '';
      });
    };

    this.toggleRead = function(task){
      data.waiting = true;
      if (task.done){
        task.done = false;
        var i=data.tasks[task.done_at].indexOf(task);
        console.log(data.tasks[task.done_at]);
        console.log(i);
        data.tasks[task.done_at].splice(i,1);
        task.done_at = null;
        data.tasks[data.date_v].push(task);
      }
      else{
        var v= new Date();
        task.done_at = new Date(v.getFullYear(),v.getMonth(),v.getDate());
        task.done = true;
      }
      var entry = new Entry();
      entry.task = task;
      entry.$update({id:task.id},function(task){
        data.waiting = false
      });
    }

    this.circle_class = function(task){
      if (task.done){
        if (new Date(task.end_at) > new Date(task.done_at)){
          return "fa fa-circle fa-lg text-success";
        }
        else{
          return "fa fa-circle fa-lg text-danger";
        }
      }
      else{
        if(new Date(task.end_at) > new Date()){
          return "fa fa-circle-o fa-lg text-success";
        }
        else{
          return "fa fa-circle-o fa-lg text-danger";
        }
      }
    };
  }]);
})();
