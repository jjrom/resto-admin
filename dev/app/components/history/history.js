(function() {

    'use strict';

    /*
     * Copyright 2014 Jérôme Gasperi
     *
     * Licensed under the Apache License, version 2.0 (the "License");
     * You may not use this file except in compliance with the License.
     * You may obtain a copy of the License at:
     *
     *   http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
     * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
     * License for the specific language governing permissions and limitations
     * under the License.
     */
    /* 
     Author     : remi.mourembles@capgemini.com
     */

    /* Controller Users */

    /*
     * 
     * history :
     * 
     * [
     {
     "gid": "3417",
     "userid": "2",
     "method": "GET",
     "service": "search",
     "collection": "SpotWorldHeritage",
     "resourceid": null,
     "query": "{\"lang\":\"en\",\"_view\":\"panel-list\",\"_\":\"1424249607459\"}",
     "querytime": "2015-02-18 09:53:31.010211",
     "url": "http:\/\/localhost\/PEPS\/api\/collections\/SpotWorldHeritage\/search.json?lang=en&_view=panel-list&_=1424249607459",
     "ip": "127.0.0.1"
     },
     ...
     ]
     */

    angular.module('administration').controller('HistoryController', ['$scope', 'administrationServices', 'administrationAPI', 'CONFIG', historyController]);

    function historyController($scope, administrationServices, administrationAPI, CONFIG) {

        if (administrationServices.isUserAnAdministrator()) {

            /*
             * Get filters from configuration
             */
            var arr = [''];
            $scope.methods = arr.concat(CONFIG.filters.methods);
            $scope.services = arr.concat(CONFIG.filters.services);
            $scope.collections = [];

            /**
             * Set history order by field "orderBy"
             * 
             * @param {String} orderBy
             */
            $scope.setHistory = function(orderBy) {
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;
                $scope.showHistory = false;

                if ($scope.ascOrDesc === 'DESC') {
                    $scope.ascOrDesc = 'ASC';
                } else {
                    $scope.ascOrDesc = 'DESC';
                }

                $scope.orderBy = orderBy;
                $scope.getHistory(false);
            };

            /**
             * Get history
             * 
             * If concatData is true, data is concataning with existing data. If not,
             * data is replacing existing data.
             * 
             * @param {boolean} concatData
             */
            $scope.getHistory = function(concatData) {

                var options = [];
                options.limit = $scope.limit;
                options.offset = $scope.offset;
                options.ascordesc = $scope.ascOrDesc;
                options.orderby = $scope.orderBy;
                options.collection = $scope.collection;
                options.method = $scope.method;
                options.service = $scope.service;
                options.maxdate = $scope.maxdate;
                options.mindate = $scope.mindate;

                administrationAPI.getHistory(options, function(data) {
                    $scope.offset = $scope.offset + $scope.limit;
                    if (concatData === false) {
                        $scope.history = data;
                    } else {
                        $scope.history = $scope.history.concat(data);
                    }
                    $scope.showHistory = true;
                    
                    if (!data[0]) {
                        $scope.offset = $scope.offset - $scope.limit;
                    }
                }, function() {
                    alert($filter('translate')('error.getHistory'));
                });
            };

            /**
             * Call to load more data
             * 
             * @returns {undefined}
             */
            $scope.loadMore = function() {
                $scope.getHistory(true);
            };

            /**
             * Get collections list
             * 
             * @returns {undefined}
             */
            $scope.getCollections = function() {
                administrationAPI.getCollections(function(data) {
                    $scope.collections.push('');
                    for (var c in data) {
                        $scope.collections.push(data[c].name);
                    }
                }, function() {
                    alert($filter('translate')('error.setCollections'));
                });
            };

            /**
             * Set param by passing his name and his value
             * 
             * @param {string} type - name of the param
             * @param {string} value - value of the param
             * @returns {undefined}
             */
            $scope.setParam = function(type, value) {
                $scope.init();

                if (type === 'method') {
                    $scope.method = value;
                } else if (type === 'service') {
                    $scope.service = value;
                } else if (type === 'collection') {
                    $scope.collection = value;
                } else if (type === 'mindate') {
                    $scope.mindate = value;
                } else if (type === 'maxdate') {
                    $scope.maxdate = value;
                }
                
                /*
                 * Once params are set, reload history
                 */
                $scope.getHistory(false);
            };

            /**
             * Reset filters by calling init functions - then reload history
             * 
             * @returns {undefined}
             */
            $scope.resetFilters = function() {
                $scope.init();
                $scope.initFilters();
                $scope.getHistory(false);
            };

            /**
             * Init context
             * 
             * @returns {undefined}
             */
            $scope.init = function() {
                $scope.ascOrDesc = 'DESC';
                $scope.orderBy = null;
                $scope.history = [];
                $scope.offset = 0;
                $scope.limit = CONFIG.limit;
                $scope.showHistory = false;
            };

            /**
             * Init filters
             * 
             * @returns {undefined}
             */
            $scope.initFilters = function() {
                $scope.selectedService = null;
                $scope.selectedCollection = null;
                $scope.selectedMethod = null;
                $scope.method = null;
                $scope.service = null;
                $scope.collection = null;
            };

            $scope.init();
            $scope.getHistory();
            $scope.getCollections();
            
            /*
             * Inform mainController that we are loading history section
             */
            $scope.$emit('showHistory');
        }
    }
})();
