'use strict';

var current_username;
var baseUrl = 'https://boiling-springs-6652.herokuapp.com/';
/* Controllers */
app.controller('loginController', ['$scope','$http','$location','$window','$cookieStore',function($scope,$http,$location,$window,$cookieStore) {


    function User() {
        this.firstName = '';
        this.lastName = '';
        this.username = '';
        this.password = '';
        this.contact = '';
        this.birthDate = '';
        this.isActive = false;
    }

    $scope.user = new User();
    $scope.users = [];
    $scope.createUser = function () {
        $http.post('/add', $scope.user).success(function (data) {
            $scope.users.push($scope.user);
            $scope.termsncond = '';
            $scope.user = new User();
            $cookieStore.put('currUser', data.currUser);
            $window.location.href =  baseUrl;
        });
    }

    $scope.authenticateUser = function () {
        $http.post('/getUser', $scope.loginuser).success(function (data) {
            $cookieStore.put('currUser', data.currUser);
            $scope.users.push($scope.loginuser);
            $scope.loginuser = '';
            $window.location.href =  baseUrl+'home';

        });
    }
}]);


app.controller('ChartController', ['$scope','$http','$routeParams','$location','$window','socket','$cookieStore',function($scope,$http,$routeParams,$location,$window,socket,$cookieStore) {
    $scope.status;
    $scope.allusersList;
    getAllUsersList();
    getAllMessageList();
    function getAllUsersList() {
        var curUser = $cookieStore.get('currUser')[0];
        $http.get('/getAllUser/' + curUser.username)

            .success(function (data) {
                $scope.users = data.allUsers;
                $scope.loggedinUser = curUser;
                $scope.name = curUser.username;
            })
            .error(function (error) {
                $scope.status = 'Unable to load wish data: ' + error.message;
            });
    }
    function getAllMessageList() {
        // Get all messages For the loggedin user
         $http.get('/getAllMessage')

            .success(function(data) {
                $scope.allMessages = data.allMessages;
            })
            .error(function(error) {
                $scope.status = 'Unable to load wish data: ' + error.message;
            });
    }

    $scope.logout = function () {
        // Update the logged in user's status as inactive
        var curUser = $cookieStore.get('currUser')[0];
        $http.get('/logout/'+curUser.username)

            .success(function(data) {
                $cookieStore.put('currUser', '');
                $scope.allMessages = '';
                $scope.messages = [];
                $scope.users = [];
                $window.location.href =  baseUrl;
            })
            .error(function(error) {
                console.log(error);
                $scope.status = 'Unable to load wish data: ' + error.message;
            });
    }

    // Socket listeners
    // ================

    socket.on('init', function (data) {
        current_username =  data.name;
        //$scope.name = data.name;
        //$scope.users = data.users;
    });

    socket.on('send:message', function (message) {
        var mention, me;
        mention = getMention(message.text);
        if(mention) {
            me = "active"
        } else {
            me = null;
        }
        $scope.messages.push({
            user: message.user,
            text: message.text,
            me: me
        });
    });

    socket.on('change:name', function (data) {
        changeName(data.oldName, data.newName);
        current_username = data.newName;
    });

    socket.on('user:join', function (data) {
        $scope.messages.push({
            user: 'Chatroom',
            text:  $scope.name + ' has joined.'
        });
        //$scope.users.push(data.name);
    });

    // add a message to the conversation when a user disconnects or leaves the room
    socket.on('user:left', function (data) {
        $scope.messages.push({
            user: 'Chatroom',
            text: $scope.name + ' has left.'
        });
        var i, user;
        for (i = 0; i < $scope.users.length; i++) {
            user = $scope.users[i];
            if (user === $scope.name) {
                $scope.users.splice(i, 1);
                break;
            }
        }
    });

    $(function(){
        $('#changeNameModal').modal('show')
    })

    // Private helpers
    // ===============

    var retrieveUsername = function() {
        var username;
        username = (localStorage.getItem("username") || false);
        if (!username) { return false; }
        return username;
    }


    var setup_member = function() {
        var username;
        username = retrieveUsername();
        console.log(username);
        if(username) {
            socket.emit('change:name', {
                name: username
            }, function (result) {
                if (!result) {
                    alert('There was an error changing your name');
                } else {

                    changeName($scope.name, username);

                    $scope.name = username;
                    $scope.newName = '';
                }
            });

            return;
        }
        return false;
    }

    // Check if message has a mention for current user
    var getMention = function(message) {
        var text,pattern,mention;
        text = message;
        pattern = /\B\@([\w\-]+)/gim;
        mention = text.match(pattern);

        if(mention){
            mention = String(mention).split("@")[1];
            if(mention === current_username) return mention;
        }

        return false;
    }

    var changeName = function (oldName, newName, member) {
        // rename user in list of users
        var i;
        for (i = 0; i < $scope.users.length; i++) {
            if ($scope.users[i] === oldName) {
                //$scope.users[i] = newName;
            }
        }

        localStorage.setItem("username",newName);
        current_username = newName;

        $scope.messages.push({
            user: 'chatroom',
            text: 'User ' + oldName + ' is now known as ' + newName + '.'
        });
    }

    // Methods published to the scope
    // ==============================

    $scope.mention = function (user) {
        $scope.receiverName = user.firstName + ' '+ user.lastName;
        $scope.message = '@' + user.firstName + ' ';
        $('.input-message').focus()
    };

    $scope.changeName = function () {
        socket.emit('change:name', {
            name: $scope.newName
        }, function (result) {
            if (!result) {
                alert('There was an error changing your name');
            } else {

                changeName($scope.name, $scope.newName);

                $scope.name = $scope.newName;
                $scope.newName = '';
                $('#changeNameModal').modal('hide')
            }
        });
    };

    $scope.messages = [];
    $scope.msg=[];

        $scope.sendMessage = function () {
            socket.emit('send:message', {
                message: $scope.message,
                user : $cookieStore.get('currUser')[0].firstName + ' ' + $cookieStore.get('currUser')[0].lastName
            });

            // add the message to our model locally
            $scope.messages.push({
                user: $cookieStore.get('currUser')[0].firstName + ' ' + $cookieStore.get('currUser')[0].lastName,
                text: $scope.message
            });



            //Saving into DB
            var currMsg = {};
            currMsg["message"] = $scope.message;
            currMsg["fromUser"] = $cookieStore.get('currUser')[0].firstName + ' ' + $cookieStore.get('currUser')[0].lastName;
            currMsg["messageDate"] = Date.now();

            $http.post('/saveMessage', JSON.stringify(currMsg)).success(function (data) {
                //$scope.allMessages.push(data.message);
                // clear message box
                $scope.message = '';


            });

        };

}
]);

