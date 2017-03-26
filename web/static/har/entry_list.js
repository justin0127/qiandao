// Generated by CoffeeScript 1.7.1
(function() {
  define(function(require, exports, module) {
    var analysis, utils;
    analysis = require('/static/har/analysis');
    utils = require('/static/utils');
    return angular.module('entry_list', []).controller('EntryList', function($scope, $rootScope, $http) {
      var har2tpl;
      $scope.filter = {};
      $rootScope.$on('har-loaded', function(ev, data) {
        var x;
        console.info(data);
        $scope.filename = data.filename;
        $scope.har = data.har;
        $scope.init_env = data.env;
        $scope.env = utils.dict2list(data.env);
        $scope.session = [];
        $scope.setting = data.setting;
        $scope.readonly = data.readonly || !HASUSER;
        $scope.recommend();
        if (((function() {
          var _i, _len, _ref, _results;
          _ref = $scope.har.log.entries;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            x = _ref[_i];
            if (x.recommend) {
              _results.push(x);
            }
          }
          return _results;
        })()).length > 0) {
          $scope.filter.recommend = true;
        }
        if (!$scope.readonly) {
          utils.storage.set('har_filename', data.filename);
          utils.storage.set('har_env', data.env);
          if (data.upload) {
            return utils.storage.set('har_har', data.har);
          } else {
            return utils.storage.del('har_har');
          }
        }
      });
      $scope.$on('har-change', function() {
        return $scope.save_change();
      });
      $scope.save_change = utils.debounce((function() {
        if ($scope.filename && !$scope.readonly) {
          console.debug('local saved');
          return utils.storage.set('har_har', $scope.har);
        }
      }), 1000);
      $scope.status_label = function(status) {
        if (Math.floor(status / 100) === 2) {
          return 'label-success';
        } else if (Math.floor(status / 100) === 3) {
          return 'label-info';
        } else if (status === 0) {
          return 'label-danger';
        } else {
          return 'label-warning';
        }
      };
      $scope.variables_in_entry = analysis.variables_in_entry;
      $scope.badge_filter = function(update) {
        var filter, key, value;
        filter = angular.copy($scope.filter);
        for (key in update) {
          value = update[key];
          filter[key] = value;
        }
        return filter;
      };
      $scope.track_item = function() {
        $scope.filted = [];
        return function(item) {
          $scope.filted.push(item);
          return true;
        };
      };
      $scope.edit = function(entry) {
        $scope.$broadcast('edit-entry', entry);
        return false;
      };
      $scope.recommend = function() {
        return analysis.recommend($scope.har);
      };
      $scope.download = function() {
        var tpl;
        $scope.pre_save();
        tpl = btoa(unescape(encodeURIComponent(angular.toJson(har2tpl($scope.har)))));
        angular.element('#download-har').attr('download', $scope.setting.sitename + '.har').attr('href', 'data:application/json;base64,' + tpl);
        return true;
      };
      $scope.pre_save = function() {
        var alert_elem, alert_info_elem, error, first_entry, parsed_url, _base, _base1;
        alert_elem = angular.element('#save-har .alert-danger').hide();
        alert_info_elem = angular.element('#save-har .alert-info').hide();
        first_entry = (function() {
          var entry, _i, _len, _ref;
          _ref = $scope.har.log.entries;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            entry = _ref[_i];
            if (entry.checked) {
              return entry;
            }
          }
        })();
        try {
          if ($scope.setting == null) {
            $scope.setting = {};
          }
          if ((_base = $scope.setting).sitename == null) {
            _base.sitename = first_entry && utils.get_domain(first_entry.request.url).split('.')[0];
          }
          parsed_url = first_entry && utils.url_parse(first_entry.request.url);
          return (_base1 = $scope.setting).siteurl != null ? _base1.siteurl : _base1.siteurl = parsed_url.protocol === 'https:' && ("" + parsed_url.protocol + "//" + parsed_url.host) || parsed_url.host;
        } catch (_error) {
          error = _error;
          return console.error(error);
        }
      };
      har2tpl = function(har) {
        var c, entry, h;
        return (function() {
          var _i, _len, _ref, _ref1, _ref2, _results;
          _ref = har.log.entries;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            entry = _ref[_i];
            if (entry.checked) {
              _results.push({
                request: {
                  method: entry.request.method,
                  url: entry.request.url,
                  headers: (function() {
                    var _j, _len1, _ref1, _results1;
                    _ref1 = entry.request.headers;
                    _results1 = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                      h = _ref1[_j];
                      if (h.checked) {
                        _results1.push({
                          name: h.name,
                          value: h.value
                        });
                      }
                    }
                    return _results1;
                  })(),
                  cookies: (function() {
                    var _j, _len1, _ref1, _results1;
                    _ref1 = entry.request.cookies;
                    _results1 = [];
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                      c = _ref1[_j];
                      if (c.checked) {
                        _results1.push({
                          name: c.name,
                          value: c.value
                        });
                      }
                    }
                    return _results1;
                  })(),
                  data: (_ref1 = entry.request.postData) != null ? _ref1.text : void 0,
                  mimeType: (_ref2 = entry.request.postData) != null ? _ref2.mimeType : void 0
                },
                rule: {
                  success_asserts: entry.success_asserts,
                  failed_asserts: entry.failed_asserts,
                  extract_variables: entry.extract_variables
                }
              });
            }
          }
          return _results;
        })();
      };
      $scope.save = function() {
        var alert_elem, alert_info_elem, data, save_btn;
        data = {
          id: $scope.id,
          har: $scope.har,
          tpl: har2tpl($scope.har),
          setting: $scope.setting
        };
        save_btn = angular.element('#save-har .btn').button('loading');
        alert_elem = angular.element('#save-har .alert-danger').hide();
        alert_info_elem = angular.element('#save-har .alert-info').hide();
        return $http.post(location.pathname.replace('edit', 'save'), data).success(function(data, status, headers, config) {
          var pathname;
          utils.storage.del('har_filename');
          utils.storage.del('har_har');
          utils.storage.del('har_env');
          save_btn.button('reset');
          pathname = "/tpl/" + data.id + "/edit";
          if (pathname !== location.pathname) {
            location.pathname = pathname;
          }
          return alert_info_elem.text('保存成功').show();
        }).error(function(data, status, headers, config) {
          alert_elem.text(data).show();
          return save_btn.button('reset');
        });
      };
      return $scope.test = function() {
        var btn, data, result;
        data = {
          env: {
            variables: utils.list2dict($scope.env),
            session: []
          },
          tpl: har2tpl($scope.har)
        };
        result = angular.element('#test-har .result').hide();
        btn = angular.element('#test-har .btn').button('loading');
        return $http.post('/tpl/run', data).success(function(data) {
          result.html(data).show();
          return btn.button('reset');
        }).error(function(data) {
          result.html('<h1 class="alert alert-danger text-center">签到失败</h1><div class="well"></div>').show().find('div').text(data);
          return btn.button('reset');
        });
      };
    });
  });

}).call(this);
