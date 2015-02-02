;(function(angular, _, undefined) {
'use strict';

angular.module('vissensePlayground')

.directive('tbkHeader', function() {
  var d = {
    scope: {},
    templateUrl:'partials/navs/header.html',
    controller: [function() {

    }],
    link: function($scope, $element) {
      $element.addClass('tbkHeader');
       var querySelector = document.querySelector.bind(document);

        var navdrawerContainer = querySelector('.navdrawer-container');
        var body = document.body;
        var appbarElement = querySelector('.app-bar');
        var menuBtn = querySelector('.menu');
        var main = querySelector('main');

        function closeMenu() {
          body.classList.remove('open');
          appbarElement.classList.remove('open');
          navdrawerContainer.classList.remove('open');
        }

        function toggleMenu() {
          body.classList.toggle('open');
          appbarElement.classList.toggle('open');
          navdrawerContainer.classList.toggle('open');
          navdrawerContainer.classList.add('opened');
        }

        main.addEventListener('click', closeMenu);
        menuBtn.addEventListener('click', toggleMenu);
        navdrawerContainer.addEventListener('click', function (event) {
          if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
            closeMenu();
          }
        });
    }
  };

  return d;
})

.directive('tbkDraggable', ['$document', function($document) {
    return function(scope, element/*, attr*/) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }])


.directive('tbkGithubForkRibbon', function() {
  var d = {
    scope: {
      repo: '@tbkGithubForkRibbon',
      label: '@'
    },
    template: '<div class="github-fork-ribbon-wrapper right">' +
       '<div class="github-fork-ribbon">' +
           '<a data-ng-href="{{href}}">{{text}}</a>' +
       '</div>' +
    '</div>',
    controller: ['$scope', function($scope) {
      $scope.href = 'https://github.com/' + $scope.repo;
      $scope.text = $scope.label || 'Fork me on GitHub';
    }],
    link: function($scope, $element) {
      $element.addClass('tbk-github-fork-ribbon');
    }
  };

  return d;
})

  .directive('tbkGithubVersion', function() {
  var d = {
    scope: {
      repo: '@tbkGithubVersion'
    },
    template: '<span>{{version}}',
    controller: ['$scope', '$http', function($scope, $http) {
      $scope.version = '?';
      $http.get('https://api.github.com/repos/' + $scope.repo + '/git/refs/tags', {
        cache: true
      }).success(function(data) {
        if(angular.isArray(data) && data.length > 0) {
          var latest = data[data.length - 1];
          var versionIndex = latest.ref.search(/(\d(\.)?){3}$/);
          if(versionIndex > -1) {
            var version = latest.ref.substring(versionIndex, latest.ref.length);
            $scope.version = version;
          }
        }
      });
    }],
    link: function($scope, $element) {
      $element.addClass('tbk-github-version');
    }
  };

  return d;
})

  .directive('tbkDefaultDemoNavigation', function() {
    /*
     * example
     * list: [{
     *   text:'Create images for multiple resolutions'
     *   link: ''
     * }, {
     *   text:'Create images for multiple resolutions'
     *   link: ''
     * }, ... ]
     * */
    var d = {
      scope: {
      },
      template: '<section data-tbk-demo-navigation data-list="list"></section>',
      controller: ['$scope', function($scope) {
        $scope.list = [{
          text:'draggable element',
          path: '/demos/single'
        }, {
          text: 'percentage time test',
          path: '/demos/demo-percentage-time-test'
        }, {
          text: 'fire callbacks',
          path: '/demos/demo-fire-callbacks'
        }, {
          text: 'track viewtime',
          path: '/demos/demo-track-visibility'
        }, {
          text: 'track sections',
          path: '/demos/demo-track-sections'
        }];
      }],
      link: function($scope, $element) {
        $element.addClass('tbk-default-demo-navigation');
      }
    };

    return d;
  })

  .directive('tbkDemoNavigation', function() {
    /*
    * example
    * list: [{
    *   text:'Create images for multiple resolutions'
    *   link: ''
    * }, {
    *   text:'Create images for multiple resolutions'
    *   link: ''
    * }, ... ]
    * */
    var d = {
      scope: {
        list: '='
      },
      template: '<section class="styleguide__article-nav">' +
        '<div class="container-medium">' +
          '<nav class="article-nav">' +
            '<a data-ng-click="navigate(current.path)" class="article-nav-link article-nav-link--prev"><p ' +
              ' class="article-nav-count">{{currentC + 1}}</p>' +
              '<p>{{current.text}}</p>' +
            '</a> ' +
            '<a data-ng-click="navigate(current2.path)" class="article-nav-link article-nav-link--next"><p ' +
              ' class="article-nav-count">{{current2C + 1}}</p>' +
              '<p>{{current2.text}}</p>' +
            '</a>' +
          '</nav>' +
        '</div>' +
      '</section>',
      controller: ['$scope', '$location', function($scope, $location) {
        function setup() {
          $scope.cursor = _.indexOf($scope.list, _.findWhere($scope.list, function(e) {
            return e.path === $location.path();
          }));

          $scope.cursor = $scope.cursor > 0 ? $scope.cursor : 0;

          console.log($scope.cursor);

          if($scope.cursor <= 0) {
            $scope.currentC = $scope.list.length - 1;
          } else {
            $scope.currentC = $scope.cursor - 1;
          }
          $scope.current = $scope.list[ $scope.currentC];

          if($scope.cursor < $scope.list.length - 1) {
            $scope.current2C = $scope.cursor + 1;
          } else {
            $scope.current2C = 0;
          }
          $scope.current2 = $scope.list[$scope.current2C];
        }

        setup();

        $scope.navigate = function(path) {
          $location.path(path);
        };
      }],
      link: function($scope, $element) {
        $element.addClass('tbk-demo-navigation');
      }
    };

    return d;
  })
;

}(angular, _));
