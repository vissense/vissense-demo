;
(function (angular, _, undefined) {
  'use strict';

  angular.module('vissensePlayground')

    .directive('tbkCodePrettify', [
      '$window',
      function ($window) {
        var directive = {
          scope: {
            lang: '@',
            showLinenums: '@'
          },
          compile: function () {
            return function ($scope, $element) {
              $element.addClass('prettyprint');

              if ($scope.lang) {
                $element.addClass('lang-' + $scope.lang);
              }

              if ($scope.showLinenums) {
                $element.addClass('linenums');
              }

              setTimeout(function () {
                $window.prettyPrint();
              }, 1);
            };
          }
        };
        return directive;
      }
    ])

    .directive('tbkDefaultDraggableElement', [function () {
      var d = {
        scope: {
          elementId: '@tbkDefaultDraggableElement'
        },
        controller: ['$scope', function ($scope) {
          $scope.model = {
            elementId: $scope.elementId
          };
        }],
        templateUrl: 'partials/directives/default-draggable-element.html'
      };

      return d;
    }])

    .directive('tbkHeader', function () {
      var d = {
        scope: {},
        templateUrl: 'partials/navs/header.html',
        controller: [function () {

        }],
        link: function ($scope, $element) {
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

    .directive('tbkGithubForkRibbon', function () {
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
        controller: ['$scope', function ($scope) {
          $scope.href = 'https://github.com/' + $scope.repo;
          $scope.text = $scope.label || 'Fork me on GitHub';
        }],
        link: function ($scope, $element) {
          $element.addClass('tbk-github-fork-ribbon');
        }
      };

      return d;
    })

    .directive('tbkDefaultDemoNavigation', function () {
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
        scope: {},
        template: '<section data-tbk-demo-navigation data-list="list"></section>',
        controller: ['$scope', function ($scope) {
          $scope.list = [{
            text: 'draggable element',
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
          }, {
            text: 'angular directive: vissense-monitor',
            path: '/demos/demo-angular-vissense-monitor'
          }, {
            text: 'angular directive: vissense-monitor (many instances)',
            path: '/demos/demo-angular-many-monitors'
          }];
        }],
        link: function ($scope, $element) {
          $element.addClass('tbk-default-demo-navigation');
        }
      };

      return d;
    })

    .directive('tbkDemoNavigation', function () {
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
        controller: ['$scope', '$location', function ($scope, $location) {
          function setup() {
            $scope.cursor = _.indexOf($scope.list, _.findWhere($scope.list, function (e) {
              return e.path === $location.path();
            }));

            $scope.cursor = $scope.cursor > 0 ? $scope.cursor : 0;

            console.log($scope.cursor);

            if ($scope.cursor <= 0) {
              $scope.currentC = $scope.list.length - 1;
            } else {
              $scope.currentC = $scope.cursor - 1;
            }
            $scope.current = $scope.list[$scope.currentC];

            if ($scope.cursor < $scope.list.length - 1) {
              $scope.current2C = $scope.cursor + 1;
            } else {
              $scope.current2C = 0;
            }
            $scope.current2 = $scope.list[$scope.current2C];
          }

          setup();

          $scope.navigate = function (path) {
            $location.path(path);
          };
        }],
        link: function ($scope, $element) {
          $element.addClass('tbk-demo-navigation');
        }
      };

      return d;
    })

    .directive('tbkVissenseUserActivityDebug', ['VisSense', function (VisSense) {
      var d = {
        scope: {
          inactiveAfter: '@'
        },
        controller: ['$scope', '$interval', function ($scope, $interval) {
          $scope.options = {
            inactiveAfter: $scope.inactiveAfter || 30000
          };

          var activityMonitor = new VisSense.UserActivity($scope.options).start();

          $scope.active = true;
          var intervalId = $interval(function () {
            $scope.active = activityMonitor.isActive();
          }, 1000);

          $scope.$on('$destroy', function () {
            $interval.cancel(intervalId);
          });
        }],
        template: '<span>isActive? {{active}}</span>'
      };

      return d;
    }])
  ;

}(angular, _));
