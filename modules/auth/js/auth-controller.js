'use strict';

angular.module('vygoda-auth')

.controller('AuthCtrl', function ($rootScope, $scope, $http, $localStorage, $modal, Notification, ENV, AuthService) {
    $rootScope.isAuthenticated = false;

    if ($localStorage["user-token"]) {
        $rootScope.isAuthenticated = true;
        $scope.wellcome = "Привет, " + $localStorage.userData.name;
    }

    $scope.submit = function (user, success, failed) {
        AuthService.login(user,
            function (successData) {
                $rootScope.isAuthenticated = true;
                $scope.wellcome = "Привет, " + successData.name;

                if (success) {
                    success();
                }
            },
            function (errorData) {
                $scope.wellcome = '';
                $rootScope.isAuthenticated = false;

                if (failed) {
                    failed(errorData);
                }
            });
    };

  $scope.open = function (size) {
    $scope.user = {login: '', password: ''};

    if (ENV.login && ENV.password) {
        $scope.user.login = ENV.login;
        $scope.user.password = ENV.password;
    }

    var modalInstance = $modal.open({
      animation: true,
      templateUrl: 'modules/auth/view/login-modal.html',
      controller: 'ModalLoginCtrl',
      size: size,
      resolve: {
        user: function () {
          return $scope.user;
        },
        submit: function() {
          return $scope.submit;
        }
      }
    });

    modalInstance.result.then(function() {
      //Logged in
    }, function () {
      //Cancel
    });
  };

    $scope.logout = function () {
        AuthService.logout(
            function () {
                $rootScope.isAuthenticated = false;
                $scope.wellcome = '';
                $scope.message = "Logged out!";
                Notification.success({message: 'Выход выполнен успешно', delay: 2000});
            });
    };
})

.controller('ModalLoginCtrl', function ($scope, Notification, $modalInstance, user, submit) {
  $scope.user = user;

  $scope.ok = function () {
    submit($scope.user, function() {
        $modalInstance.close();
    },
    function(errorData) {
        Notification.error({message: errorData.message, delay: 3000});
    });

  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});