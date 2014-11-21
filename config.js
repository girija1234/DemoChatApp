module.exports = function(app, express, mongoose){

  var config = this;

  // Configuration
    /*
  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
      layout: false
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use(express.errorHandler());
  });
  */
    // all environments
    app.set('title', 'Application Title');
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {
        layout: false
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    }

    // production only
    if ('production' == app.get('env')) {
        app.use(express.errorHandler());
    }
  return config;

};