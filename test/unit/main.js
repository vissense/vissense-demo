'use strict';

describe('controllers', function () {
  var scope;

  beforeEach(module('vissensePlayground'));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should define 3 awesome things', inject(function ($controller) {
    expect(scope.model).toBeUndefined()

    $controller('ManyMonitorsDemoCtrl', {
      $scope: scope
    })

    expect(scope.model).toBeDefined();
    expect(scope.model.monitorCount).toBe(42);
    expect(scope.model.monitorCountMax).toBe(200);
  }));
});
