
(function (angular) {
'use strict';

angular.module('vissense.playground.states', [
    'ui.router'
])

.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/demos/overview');
    $urlRouterProvider.when('/', '/demos/overview');

    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/demos.html',
      controller: 'DemoCtrl'
    })
    .state('download', {
      url: '/download',
      templateUrl: 'partials/download.html',
      controller: 'NoopCtrl'
    })
  .state('demos', {
    abstract: true,
    url:'/demos',
    template: '<ui-view/>'
  })
  .state('demos.overview', {
    url: '/overview',
    templateUrl: 'partials/demos.html',
    controller: 'DemoCtrl'
  })
  .state('demos.fire-callbacks', {
    url: '/demo-fire-callbacks',
    templateUrl: 'partials/demos/demo_fire_callbacks.html',
    controller: 'FireCallbacksDemoCtrl'
  })
  .state('demos.track-visibility', {
    url: '/demo-track-visibility',
    templateUrl: 'partials/demos/demo_track_visibility.html',
    controller: 'TrackVisiblityDemoCtrl'
  })
  .state('demos.track-sections', {
    url: '/demo-track-sections',
    templateUrl: 'partials/demos/demo_track_sections.html',
    controller: 'TrackSectionsDemoCtrl'
  })
  .state('demos.draggable-element', {
    url: '/single',
    templateUrl: 'partials/demos/demo_draggable_element.html',
  })
  .state('demos.percentage-time-test', {
    url: '/demo-percentage-time-test',
    templateUrl: 'partials/demos/demo_percentage_time_test.html',
  })
  .state('demos.angular-vissense-monitor', {
    url: '/demo-angular-vissense-monitor',
    templateUrl: 'partials/demos/demo_angular_vissense_monitor.html',
    controller: 'AngularVissenseMonitorDemoCtrl'
  })
  .state('demos.angular-many-monitors', {
    url: '/demo-angular-many-monitors',
    templateUrl: 'partials/demos/demo_angular_many_monitors.html',
    controller: 'ManyMonitorsDemoCtrl'
  });

  $urlRouterProvider.otherwise('/demos/overview');
})

;

})(angular);
