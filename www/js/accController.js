// #################################################################################################
// controller game
// #################################################################################################

angular.module('starter')

.controller('ProfHomeCtrl', function ($scope) {})

// #################################################################################################
// controller for showing games
// #################################################################################################

.controller('ProfGamesCtrl', function ($rootScope, $scope, $http, $location, $ionicModal, $window, $timeout,
                                        $ionicPopup, $ionicHistory, $translate, accAPI, Data, meanData, FFAdefault) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
            $rootScope.loginUserGames = vm.user.games;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUser;

    //Get back in the history
    $scope.cancelGame = function () {
        $ionicHistory.goBack();
    };

    console.log("accAPI.getBaseMetadata()");
    console.log(accAPI.getBaseMetadata());

    //################################################################
    //################################################################
    //################################################################
    // create FFA game and set to default
    $scope.createFFAgame = function() {
      console.log("createFFAgame");
        $scope.ffagameschema = {};
        var teamNamesFFA = [];
        teamNamesFFA.push("FIRE");
        teamNamesFFA.push("ICE");
        teamNamesFFA.push("LEAF");
        teamNamesFFA.push("AIR");
        teamNamesFFA.push("NIGHT");

        var teamObjectsFFA = [];
        for (var i=0; i<teamNamesFFA.length; i++) {
          var oneTeamFFA = {
              teamName: String,
              teamMates: []
          };
          oneTeamFFA.teamName = teamNamesFFA[i];
            teamObjectsFFA.push(oneTeamFFA);
        }
        $scope.ffagameschema.name = "Open World OriGami";
        $scope.ffagameschema.team = teamObjectsFFA;

        FFAdefault.createFFA($scope.ffagameschema)
            .success(function (data, status, headers, config) {
                console.log("success - data");
                console.log(data);
            })
            .error(function (data, status, headers, config) {
                console.log("error - data");
                console.log(data);
            });
    };
    $scope.playFFA = function () {
        $location.path('/acc/FFA/'+$scope.userName);
        console.log("playFFA");
        // createModal('starting-modal.html', 'welcome');
    };
    // set game mode index
    $scope.choose_mode = 0;
    $scope.chooseMode = function (type) {
      console.log("type");
      console.log(type);
        if (type == $scope.choose_mode)
            $scope.choose_mode = 0;
        else {
            $scope.choose_mode = type;
        }
    };
    //################################################################
    //################################################################
    //################################################################

    // Fetch all the games from the server
    $scope.games = [];
    accAPI.getAllBaseGames2()
        .success(function (games, status, headers, config) {
            $scope.error_msg = null;
            $scope.games = [];
            console.log($rootScope.loginUserGames)
            for (var i = 0; i < games.length; i++) {
                console.log(games[i].uniqueKey)
                for(var k=0; k<$rootScope.loginUserGames.length; k++){
                    if (games[i].uniqueKey == $rootScope.loginUserGames[k]) {
                        console.log("gamefound")
                        $scope.games.push(games[i]);
                    }
                }
                if(games[i].creator == thisUser){
                    $scope.games.push(games[i]);
                }
            }
        })
        .error(function (data, status, headers, config) {
            $scope.error_msg = $translate.instant('network_error');
            console.log("Could not fetch game metadata from server");
        });

    //Selected game
    $scope.gameSelect = function (userName, gameName) {
        param = "/acc/playmygame/" + userName + '/' + gameName;
        $location.path(param);
    };

    // Create Activity
    $scope.submitPoint = function () {

        $scope.gamestype = Data.getType();
        var points = [];

        if ($scope.map.markers.length != 0) {
            for (var i = 0; i < $scope.map.markers.length; i++) {
                var point = {
                    name: $scope.map.markers[i].name,
                    description: $scope.map.markers[i].description,
                    lon: $scope.map.markers[i].lng,
                    lat: $scope.map.markers[i].lat,
                    created: Date.now(),
                    tasks: []
                };
                points.push(point);
            }

            // Complete Activity object
            $scope.activities = {
                points: points,
                type: $scope.gamestype
            };
            Data.newAct($scope.activities);
            Data.clearType();
            $scope.modal.remove();
        } else {
            console.log("No points specified");
            $scope.modal.remove();
        }
    };

})

// #################################################################################################
// controller for showing games for editing
// #################################################################################################

.controller('ProfTeacherCtrl', function ($rootScope, $scope, $timeout, $ionicPopup, $ionicModal, $window, $ionicHistory,
                                    $translate, $ionicSlideBoxDelegate, $cordovaCamera, $q, accAPI, Edit, meanData) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUser;

    // List of all available games fetched from the server
    $scope.list = [];

    accAPI.getAllBaseGames(thisUser).success(function (data, status, headers, config) {
      console.log("ProfTeacherCtrl - getAll.success("+thisUser+")");
        $scope.list = [];
        $scope.error_msg = null;
        for (var i = 0; i < data.length; i++) {
            if (data[i].name != null) {
                $scope.list.push(data[i]);
            }
        }

        if ($scope.list.length == 0) {
            $scope.noData = true;
        } else {
            for (var i = 0; i < $scope.list.length; i++) {
                $scope.list[i].diff = Array.apply(null, Array($scope.list[i].difficulty)).map(function () {
                    return "ion-ios-star"
                });
            }
            $scope.noData = false;
        }
    }).error(function (data, status, headers, config) {
      console.log("ProfTeacherCtrl - error()");
        $scope.error_msg = $translate.instant('network_error');
        $rootScope.notify(
            $translate.instant('oops_wrong'));
    });

    $scope.editedGame = {};
    $scope.deleteGame = {};
    $scope.animation = false;

    $scope.createGame = function () {
      console.log("ProfTeacherCtrl - createGame()");
        // $scope.modal.remove();
        Edit.resetGame();
    };
    $scope.cancelGame = function () {
      console.log("ProfTeacherCtrl - cancelGame()");
        $ionicHistory.goBack();
    };

    /* Game Creation Wizard (Test Version) ------------------------------------------------ */
    $scope.newgame = {}; //General description of the game
    $scope.navactivities = []; // List of activities and types
    $scope.game_mode = 0;

    // // set base amount
    // $scope.newgame.baseAmount = 1;  //default 2 bases
    // $scope.base = Array.apply(null, Array(10)).map(function () {
    //   console.log("ProfTeacherCtrl - base()");
    //     return "ion-ios-star-outline"
    // });
    // // set base amount of the game in stars
    // $scope.setBaseAmount = function (baseAmount) {
    //   console.log("ProfTeacherCtrl - setBaseAmount(baseAmount)");
    //     $scope.base = Array.apply(null, Array(10)).map(function () {
    //         return "ion-ios-star-outline"
    //     });
    //     for (var i = 0; i <= baseAmount; i++) {
    //         $scope.base[i] = "ion-ios-star";
    //     }
    //     $scope.newgame.baseAmount = baseAmount + 1;
    // };

    $scope.addedTeam = [];
    $scope.gameTeams = [];


       $scope.forceUnknownOption = function() {
          $scope.gameTeams = [];
          $scope.addedTeam = [];
       };

    //Show progress after step1

    //Choose Activity
    $scope.game_mode = 0;
    $scope.chooseGameMode = function (type) {
      console.log("ProfTeacherCtrl - chooseActType()");
      console.log(type);
        if (type == $scope.game_mode)
            $scope.game_mode = 0;
        else {
            $scope.game_mode = type;
        }
    };

    var currentAct = {}; // Activity that is currently created
    $scope.addMode = function () {
      console.log("ProfTeacherCtrl - addMode()");
        $scope.newgame.activities = [];
        var newAct = {};
        currentAct.type = "set game";
        currentAct.basepoints = [];
    };


    $scope.addTeamnames = function (teamname) {
        var checkTeamname = false;
        if (teamname != null) {
            if ($scope.addedTeam.length != 0) {
                console.log("$scope.addedTeam.length != 0");
                for (var i=0; i<$scope.addedTeam.length; i++) {
                    if ( teamname == $scope.addedTeam[i] ) {
                        checkTeamname = true;
                    }
                }
            }
            if ( checkTeamname == false ) {
                $scope.team = {
                    teamName: String,
                    teamMates: []
                };
                $scope.team.teamName = teamname;
                console.log("$scope.team");
                console.log($scope.team);
                console.log($scope.addedTeam);
                $scope.addedTeam.push(teamname)
                $scope.gameTeams.push($scope.team);
                console.log($scope.gameTeams)
            }
        }
    };

    // $scope.addBase = function () {
    //
    // };

    /* Map Routine ------------------- */
    $scope.mainMap = {
        center: {
            autoDiscover: true,
            zoom: 16
        },

        defaults: {
            tileLayer: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18,
            zoomControlPosition: 'topleft',
            lat: 57,
            lng: 8

        },

        geojson: {},

        paths: {
            userPos: {
                type: 'circleMarker',
                color: '#2E64FE',
                weight: 2,
                radius: 1,
                opacity: 0.0,
                clickable: false,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            },
            userPosCenter: {
                type: 'circleMarker',
                color: '#2E64FE',
                fill: true,
                radius: 3,
                opacity: 0.0,
                fillOpacity: 1.0,
                clickable: false,
                updateTrigger: true,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            }
        },

        markers: [],
        events: {
            /* map: {
                 enable: ['context'],
                 logic: 'emit'
             }*/
        },

        layers: {
            baselayers: {
                osm: {
                    name: 'Satelite View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: true,
                    layerOptions: {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        continuousWorld: false
                    }
                },
                streets: {
                    name: 'Streets View',
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz',
                    top: false,
                },
                topographic: {
                    name: 'Topographic View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: false,
                    layerOptions: {
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                        continuousWorld: false
                    }
                }
            }
        }
    };

    // Map for geoReference Game creation
    $scope.gameMap = {
        center: {
            autoDiscover: true,
            zoom: 16
        },

        defaults: {
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            zoomControlPosition: 'topleft',
            lat: 57,
            lng: 8

        },

        geojson: {},

        paths: {
            userPos: {
                type: 'circleMarker',
                color: '#2E64FE',
                weight: 2,
                radius: 1,
                opacity: 0.0,
                clickable: false,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            },
            userPosCenter: {
                type: 'circleMarker',
                color: '#2E64FE',
                fill: true,
                radius: 3,
                opacity: 0.0,
                fillOpacity: 1.0,
                clickable: false,
                updateTrigger: true,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            }
        },

        markers: [],
        events: {
            map: {
                enable: ['click'],
                logic: 'emit'
            }
        },

        layers: {
            baselayers: {
                osm: {
                    name: 'Satelite View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: true,
                    layerOptions: {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        continuousWorld: false
                    }
                },
                streets: {
                    name: 'Streets View',
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz',
                    top: false,
                },
                topographic: {
                    name: 'Topographic View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: false,
                    layerOptions: {
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                        continuousWorld: false
                    }
                }
            }
        }
    };

    var Waypoint = function () {
      console.log("ProfTeacherCtrl - Waypoint()");
        if (!(this instanceof Waypoint)) return new Waypoint();
        this.lat = "";
        this.lng = "";
        this.name = "";
    };

    // Modal Windows Routine
    var createModal = function (templateUrl, id) {
      console.log("ProfTeacherCtrl - createModal("+templateUrl +" --- "+ id+")");
        $ionicModal.fromTemplateUrl(templateUrl, {
            id: id,
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.closeModal = function () {
      console.log("ProfTeacherCtrl - closeModal()");
      $ionicPopup.alert({
          title: 'closeModal()',
          template: 'remove'});
        $scope.modal.remove();
    };
    $scope.noTask = function () {
      console.log("ProfTeacherCtrl - noTask()");
        $scope.modal.remove();
        // $scope.numberTask = 0;
    };

    $scope.$on('$destroy', function () {
      console.log("ProfTeacherCtrl - on.destroy()");
        if (typeof $scope.modal != 'undefined') {
            $scope.modal.remove();
        }
    });

    //Add Waypoint with modal
    $scope.$on('leafletDirectiveMap.contextmenu', function (event, locationEvent) {
      console.log("ProfTeacherCtrl - leafletDirectiveMap.contextmenu()");
        $scope.newBasepoint = new Waypoint();
        $scope.newBasepoint.lat = locationEvent.leafletEvent.latlng.lat;
        $scope.newBasepoint.lng = locationEvent.leafletEvent.latlng.lng;
        // $scope.newWaypoint.tasks = [];

        createModal('templates/map/basepoint.html', 'm1');
        //createModal('templates/tasks/quest_type.html');
    });

    $scope.$on('leafletDirectiveMap.click', function (event, locationEvent) {
      console.log("ProfTeacherCtrl - leafletDirectiveMap.click()");
        $scope.newBasepoint = new Waypoint();
        $scope.newBasepoint.lat = locationEvent.leafletEvent.latlng.lat;
        $scope.newBasepoint.lng = locationEvent.leafletEvent.latlng.lng;
        $scope.newBasepoint.draggable = false;
        $scope.newBasepoint.message = "You can change this location";

        if ($scope.gameMap.markers.length == 0) {
            $scope.gameMap.markers.push($scope.newBasepoint);
        }
    });

    var newMarker = {};
    // $scope.numberTask = 0;
    $scope.saveBasepoint = function () {
      console.log("ProfTeacherCtrl - saveWayPoint()");
      $scope.actBaseMarker = {};

        if (($scope.newBasepoint.name == "" || $scope.newBasepoint.name == undefined) || ($scope.newBasepoint.description == undefined || $scope.newBasepoint.description == "")) {

            if ($scope.newBasepoint.name == "" || $scope.newBasepoint.name == undefined) {
                $scope.name_border = "red";
            } else {
                $scope.name_border = "";
            }

            if ($scope.newBasepoint.description == undefined || $scope.newBasepoint.description == "") {
                $scope.description_border = "red";
            } else {
                $scope.description_border = "";
            }
        } else {
            $scope.name_border = "";
            $scope.description_border = "";

            newMarker = $scope.newBasepoint;
            $scope.mainMap.markers.push($scope.newBasepoint);
            //console.log ($scope.mainMap.markers.length);
            $scope.actBaseMarker = $scope.newBasepoint;

            $scope.closeModal();
            createModal('templates/tasks/task_georef.html', 'm3');
        }
    };

    $scope.taskHandlerStart = function () {
        console.log("ProfTeacherCtrl - taskHandlerStart()")
        createModal('templates/tasks/task_choose_AQ_SP.html', 'm3');
    };

    // $scope.taskHandlerEnd = function () {
    //     console.log("ProfTeacherCtrl - taskHandlerEnd()")
    //     $scope.closeModal();
    // };

    /* Handle Task Creation routine */
    $scope.addQAtask = function () {
      console.log("ProfTeacherCtrl - addQAtask()");
        $scope.qaTask = {};
        $scope.qaTask.answers = [{}, {}, {}, {}]; // Four answers - either text or images
        $scope.qaTask.question = {};

        $scope.picFile = [];
        $scope.picFilename = [];
        $scope.imgAnsPrvw = [];
        $scope.imgQuestionPrvw = null;

        $scope.modal.remove();
        createModal('templates/tasks/quest_type.html');
    };

    $scope.addGRtask = function () {
        console.log("ProfTeacherCtrl - addGRtask()");
        $scope.geoTask = {};
        $scope.geoTask.base = {};

        $scope.closeModal();
        createModal('templates/tasks/georef_type.html');

        $scope.georP = null;
        $scope.gameMap.markers = [];
    };

    // add sports task
    $scope.addSPtask = function () {
        console.log("ProfTeacherCtrl - addSPtask()");
        $scope.sportTask = {};

        $scope.closeModal();
        createModal('templates/tasks/sports_type.html');
    };

    $scope.submitSP = function () {
        console.log("ProfTeacherCtrl - submitSP()");
    };

    $scope.imgUpload = function(file, $event) {
        console.log("ProfTeacherCtrl - imgUpload()");
        console.log("file");
        console.log(file);
        if (file) {
            var upload = accAPI.uploadImage(file);
            console.log("upload");
            var reader = new FileReader();
            var isQuestion = false;

            switch($event.target.id) {
                case 'photoAns1':
                    picIndex = 0;
                    break;
                case 'photoAns2':
                    picIndex = 1;
                    break;
                case 'photoAns3':
                    picIndex = 2;
                    break;
                case 'photoAns4':
                    picIndex = 3;
                    break;
                case 'photoQuestion':
                    isQuestion = true;
                    break;
                case 'georefPic':
                    isGeoref = true;
                    break;
            }
            console.log("upload - 01");
            // Previewing the image
            reader.onload = function(event) {
                if (isGeoref) {
                    $scope.georefPicPrvw = event.target.result;
                } else if (!isQuestion) {
                    $scope.imgAnsPrvw[picIndex] = event.target.result;
                } else {
                    $scope.imgQuestionPrvw = event.target.result;
                }
                $scope.$apply();
            }
            console.log("upload - 02");
            reader.readAsDataURL(file);
            console.log("upload - 03");
            upload.then(function(res) {
                console.log("res");
                console.log(res);
                if (res.status == 200) {
                    //$scope.picFilename[picIndex] = res.data.img_file;
                    if (isGeoref) {
                        $scope.geoTask.img = res.data.img_file;
                    } else if (isQuestion) {
                        $scope.qaTask.question.img = res.data.img_file;
                    } else {
                        $scope.qaTask.answers[picIndex].img = res.data.img_file;
                    }
                } else {
                    console.log('Error! Pic POSTed, but no filename returned')
                }
                //console.log($scope.picFilename);
            }), function(res) {
                console.log("Error uploading image.", res);
            }
        }
    };

    /* Picture is Loaded */
    $scope.onLoad1 = function (e, reader, file, fileList, fileOjects, fileObj) {
        $scope.picFile[0] = fileObj;
    };
    $scope.onLoad2 = function (e, reader, file, fileList, fileOjects, fileObj) {
        $scope.picFile[1] = fileObj;
    };
    $scope.onLoad3 = function (e, reader, file, fileList, fileOjects, fileObj) {
        $scope.picFile[2] = fileObj;
    };
    $scope.onLoad4 = function (e, reader, file, fileList, fileOjects, fileObj) {
        $scope.picFile[3] = fileObj;
    };

    $scope.newgame.tasks = [];
    $scope.submitQA = function (imgAnswers) {
        $scope.qaTask.type = "QA";
        $scope.qaTask.imgans = imgAnswers;

        // $scope.numberTask++;
        $scope.newgame.tasks.push($scope.qaTask);
        //newMarker.tasks.push($scope.qaTask);

        $scope.closeModal();
        createModal('templates/tasks/task_choose_AQ_SP.html');
    };


    $scope.onLoadG = function (e, reader, file, fileList, fileOjects, fileObj) {
        $scope.georP = fileObj;
    };

    $scope.submitGR = function (img_file) {
      console.log("ProfTeacherCtrl - submitGR()");
        /*Creation of game content */
        $scope.geoTask.type = "GeoReference";
        $scope.geoTask.base.lat = $scope.actBaseMarker.lat;
        $scope.geoTask.base.lng = $scope.actBaseMarker.lng;
        //$scope.geoTask.img = "data:image/jpeg;base64," + $scope.georP.base64;
        $scope.geoTask.lat = $scope.gameMap.markers[0].lat;
        $scope.geoTask.lng = $scope.gameMap.markers[0].lng;
        $scope.newgame.tasks.push($scope.geoTask);
        //newMarker.tasks.push($scope.geoTask);

        // $scope.numberTask++;
        $scope.closeModal();
        createModal('templates/tasks/task_georef.html', 'createGR');
        // $scope.georP = null;
    };

    // Add points to the Activity
    $scope.addActPoints = function () {
      console.log("ProfTeacherCtrl - addActPoints()");
        currentAct.basepoints = $scope.mainMap.markers;
        $scope.newgame.activities.push(currentAct);
    };

    // $scope.addGameCreator = function (){
    //   console.log("ProfTeacherCtrl - addGameCreator");
    //   console.log("gameCreator in addGameCreator");
    //   console.log(gameCreator);
    //   $scope.newgame.gameCreator = thisUser;
    // };

    $scope.stopCreation = function () {
      console.log("ProfTeacherCtrl - stopCreation()");
        $ionicHistory.goBack();
        $ionicHistory.goBack();
        $scope.newgame = {};
        // $scope.numberTask = 0;
    };

    $scope.finishGame = function () {
      console.log("ProfTeacherCtrl - finishGame()");
      $scope.newgame.gameCreator = thisUser;
      $scope.newgame.team = $scope.gameTeams;
        accAPI.saveBaseItem($scope.newgame)
            .success(function (data, status, headers, config) {
                console.log("FINISH")
                $rootScope.hide();
                $rootScope.doRefresh(1);
                $ionicHistory.goBack();
                $scope.newgame = {};
            })
            .error(function (data, status, headers, config) {
                $rootScope.hide();
// TODO:                // $rootScope.notify("Oops something went wrong!! Please try again later");
                $ionicHistory.goBack();
                $scope.newgame = {};
                $scope.numberTask = 0;
            });
    };

    $scope.removeMarkers = function () {
      console.log("ProfTeacherCtrl - removeMarkers()");
        $scope.modal.remove();
    };

    //Control of Navigation
    $scope.disableSwipe = function () {
      console.log("ProfTeacherCtrl - disableSwipe()");
        $ionicSlideBoxDelegate.enableSlide(false);
    };

    $scope.emptyFields = [];

    $scope.slideTo = function (index) {
      console.log("ProfTeacherCtrl - slideTo()");
        if (index == 1) {
            $scope.emptyFields = [false, false];
            if ($scope.newgame.name == undefined || $scope.newgame.description == undefined) {
                if ($scope.newgame.name == undefined) {
                    $scope.emptyFields[0] = true;
                }
                if ($scope.newgame.description == undefined) {
                    $scope.emptyFields[1] = true;
                }
            } else {
              console.log("ionicSlideBoxDelegate");
                $ionicSlideBoxDelegate.slide(index);
            }
        // } else if (index == 1) {
        //     console.log("index == 1 --> second page");
        // } else if (index == 2) {
        //     if ($scope.game_mode != 0) {
        //         $ionicSlideBoxDelegate.slide(index);
        //     }
      } else if (index == 2) {
          if ($scope.team != "") {
              console.log("nicht leer");
              $ionicSlideBoxDelegate.slide(index);
          } else { $ionicPopup.alert({
              title: 'Continue impossible!',
              template: 'no teams added'}); }
      } else {
          $ionicSlideBoxDelegate.slide(index);
      }


    };
    /* ----------------------------------------------------------------------- */
    // TODO: delete, edit baseGame

    // // Delete the entire game by clicking on the trash icon
    // $scope.deleteBaseItem = function (item, name) {
    //   console.log("ProfTeacherCtrl - deleteItem()");
    //     accAPI.deleteBaseItem(name, $rootScope.getToken())
    //         .success(function (data, status, headers, config) {
    //             $rootScope.hide();
    //         }).error(function (data, status, headers, config) {
    //             $rootScope.notify(
    //                 $translate.instant('oops_wrong'));
    //         });
    //     $scope.list.splice($scope.list.indexOf(item), 1);
    // };
    //
    // $scope.editBaseItem = function (item) {
    //   console.log("ProfTeacherCtrl - editItem()");
    //     $scope.navactivities = [];
    //
    //     accAPI.getOneBaseGame(item.name, thisUser)
    //         .success(function (data, status, headers, config) {
    //             $scope.deleteGame = data.slice()[0];
    //         }).error(function (data, status, headers, config) {
    //             $rootScope.notify(
    //                 $translate.instant('oops_wrong'));
    //         });
    //
    //     $scope.editedGame = $scope.list[$scope.list.indexOf(item)];
    //     $scope.navactivities = $scope.editedGame.activities;
    //
    //     Edit.pushGame($scope.editedGame);
    // };


    $scope.toggleActivity = function (activity) {
      console.log("ProfTeacherCtrl - toggleActivity()");
        activity.show = !activity.show;
    };
    $scope.isActivityShown = function (activity) {
      console.log("ProfTeacherCtrl - isActivityShown()");
        return activity.show;
    };
    $scope.closeModal = function () {
      console.log("ProfTeacherCtrl - closeModal()");
      $ionicPopup.alert({
          title: 'closeModal()',
          template: 'hide'});
        $scope.modal.hide();
    };

    // $scope.saveEditedGame = function () {
    //   console.log("ProfTeacherCtrl - saveEditedGame()");
    //     /*First delete the existing game, then save new instance.
    //          Not a very elegant solution, but i want to sleep already.*/
    //
    //     //  console.log(JSON.stringify($scope.deleteGame) == JSON.stringify($scope.editedGame));
    //     accAPI.deleteBaseItem($scope.deleteGame.name, $rootScope.getToken())
    //         .success(function (data, status, headers, config) {
    //             $rootScope.hide();
    //             $scope.list.splice($scope.list.indexOf($scope.deleteGame), 1);
    //         }).error(function (data, status, headers, config) {
    //             $rootScope.notify(
    //                 $translate.instant('oops_wrong'));
    //         });
    //
    //     accAPI.saveBaseItem($scope.editedGame)
    //         .success(function (data, status, headers, config) {
    //             $scope.list.push($scope.editedGame);
    //             $scope.modal.hide();
    //         })
    //         .error(function (data, status, headers, config) {
    //             $rootScope.hide();
    //             $translate.instant('oops_wrong');
    //         });
    // };
})

// #################################################################################################
// controller for new game creation
// #################################################################################################

.controller('ProfNewGameCtrl', ['$rootScope', '$scope', '$state', '$http', '$location', '$cordovaGeolocation', '$ionicModal',
                            '$window', '$ionicPopup', '$ionicHistory', '$stateParams', '$cordovaCamera',
                            '$translate', 'leafletData', 'accAPI', 'Edit', 'Data', 'Task', 'meanData',
                            function ($rootScope, $scope, $state, $http, $location, $cordovaGeolocation, $ionicModal,
                                        $window, $ionicPopup, $ionicHistory, $stateParams, $cordovaCamera,
                                        $translate, leafletData, accAPI, Edit, Data, Task, meanData) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUser;

    /* Game Parameters ----- */
    $scope.currentAction = "New Game";
    $scope.newgame = {}; //General description of the game
    $scope.navactivities = []; // List of activities and types
    $scope.diff = Array.apply(null, Array(5)).map(function () {
        return "ion-ios-star-outline"
    });

    $scope.newgame.difficulty = 0;

    // Rate difficulty of the game in stars
    $scope.rateGame = function (difficulty) {
        $scope.diff = Array.apply(null, Array(5)).map(function () {
            return "ion-ios-star-outline"
        });
        for (var i = 0; i <= difficulty; i++) {
            $scope.diff[i] = "ion-ios-star";
        }
        $scope.newgame.difficulty = difficulty + 1;
    };

    // Check, whether we are CREATING or EDITING new game
    if (Edit.getGame() != null) {
        $scope.currentAction = "Edit Game";
        $scope.newgame = {
            title: Edit.getGame().name,
            description: Edit.getGame().description,
            time: Edit.getGame().timecompl,
            difficulty: Edit.getGame().difficulty
        };

        $scope.navactivities = Edit.getGame().activities;
        Edit.resetActivities();

        $scope.rateGame(Edit.getGame().difficulty - 1);

        for (var i = 0; i < Data.getAct().length; i++) {
            $scope.navactivities.push(Data.getAct()[i]);
        }
    } else {
        console.log(Data.getAct().length);
        $scope.navactivities = Data.getAct();
    }

    $scope.isAndroid = false; // Platform : Android or Web

    $scope.example = "";
    $scope.myfile = {};

    // Current location of GeoReference Task Creation
    $scope.map = {
        center: {
            autoDiscover: true,
            zoom: 16
        },
        defaults: {
            tileLayer: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 18,
            zoomControlPosition: 'topleft',
            lat: 57,
            lng: 8
        },
        layers: {
            baselayers: {
                osm: {
                    name: 'Satelite',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: true
                },
                streets: {
                    name: 'Streets',
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz',
                    top: false,
                }
            }
        },
        geojson: {},

        markers: [],
        events: {
            /* map: {
                 enable: ['context'],
                 logic: 'emit'
             }*/
        },
    };

    $scope.currentLocation = function () {
        $cordovaGeolocation
            .getCurrentPosition()
            .then(function (position) {
                $scope.map.center.lat = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                $scope.map.center.zoom = 15;
                $scope.map.center.message = $translate.instant('oops_wrong');
                $scope.map.markers.push($scope.map.center);

            }, function (err) {
                // error
                console.log("Geolocation error!");
                console.log(err);
            });
    };

    // PHOTO TASK

    // $scope.imgURI = null;
    $scope.example = "";

    $scope.myfile = {};
    $scope.isAndroid = ionic.Platform.isAndroid();
    //$scope.isWeb = (ionic.Platform.platform() == "win32");
    $scope.isWeb = !$scope.isAndroid;

    $scope.takePicture = function () {
        if ($scope.isAndroid) { // If the platform is Android than we take a picture
            var options = {
                quality: 75,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true
            };

            $cordovaCamera.getPicture(options).then(function (imageData) {
                $scope.imgURI = "data:image/jpeg;base64," + imageData;
                $scope.currentLocation();
            }, function (err) {
                // An error occured. Show a message to the user
            });
        } else { // If platform is Web than we are able to upload from the local storage
            $scope.currentLocation();
        }
    };

    $scope.choosePhoto = function () {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            $scope.imgURI = "data:image/jpeg;base64," + imageData;
            $scope.currentLocation();
        }, function (err) {
            // An error occured. Show a message to the user
        });
    };

    /* After choosing Photo put a marker, indication your position on a map */
    var PhotoPositionMarker = function () {
        if (!(this instanceof PhotoPositionMarker)) return new PhotoPositionMarker();
        this.lat = "";
        this.lng = "";
    };
    $scope.$on('leafletDirectiveMap.contextmenu', function (event, locationEvent) {
        if ($scope.map.markers.length < 1) {
            $scope.point = new PhotoPositionMarker();
            $scope.point.lat = locationEvent.leafletEvent.latlng.lat;
            $scope.point.lng = locationEvent.leafletEvent.latlng.lng;;
            $scope.map.markers.push($scope.point);
        }
    });

    $scope.pathGame = function () {
        Data.addType("free to play");
    };
    $scope.aidGame = function () {
        Data.addType("set game");
    };

    //Collapsed list with tasks for each activity
    $scope.toggleActivity = function (activity) {
        activity.show = !activity.show;
    };
    $scope.isActivityShown = function (activity) {
        return activity.show;
    };

    //Function, which add new task to the choosen activity
    $scope.currentActIndex = null;
    $scope.currentPointIndex = null;
    $scope.task = {};

    $scope.addTaskPoint = function (act, item) {
        var currentActivity = $scope.navactivities[$scope.navactivities.indexOf(act)];
        var pointIndex = currentActivity.points.indexOf(item);

        Task.addIndexes($scope.navactivities.indexOf(act), pointIndex);
    };

    //Addition of a TASK to an ACTIVITY POINT
    $scope.addQAtask = function () {
        Task.addType("QA");
    };
    $scope.addGRtask = function () {
        Task.addType("GeoReference");
    };

    //Submit task when running on Windows
    $scope.submitGRTask = function (uploadedPhoto) {
        //$scope.imgURI = "data:image/jpeg;base64," + uploadedPhoto.base64;

        Task.addPhoto($scope.imgURI);
        Task.addCoordinates($scope.map.markers[0].lat, $scope.map.markers[0].lng);

        $scope.task = Task.getTask();
        $scope.currentActIndex = Task.getActIndex();
        $scope.currentPointIndex = Task.getPointIndex();

        //Add created task to the choosen activity point
        $scope.navactivities[$scope.currentActIndex].points[$scope.currentPointIndex].tasks.push($scope.task);

        //Clear the scope and get back to the new game creation menu
        $scope.task = {};
        Task.clearTask();
        $scope.currentActIndex = null;
        $scope.currentPointIndex = null;

        $ionicHistory.goBack();
        Task.clearTask();
    };

    // Submit task for Android device
    $scope.submitGRTaskAndroid = function () {
        Task.addPhoto($scope.imgURI);
        Task.addCoordinates($scope.map.markers[0].lat, $scope.map.markers[0].lng);

        $scope.task = Task.getTask();
        $scope.currentActIndex = Task.getActIndex();
        $scope.currentPointIndex = Task.getPointIndex();

        //Add created task to the choosen activity point
        $scope.navactivities[$scope.currentActIndex].points[$scope.currentPointIndex].tasks.push($scope.task);

        //Clear the scope and get back to the new game creation menu
        $scope.task = {};
        Task.clearTask();
        $scope.currentActIndex = null;
        $scope.currentPointIndex = null;
        $ionicHistory.goBack();
        Task.clearTask();
    };

    /* QUESTION TASK -------------------------------*/
    $scope.qaGame = {};

    $scope.submitQATask = function () {
        Task.addQA($scope.qaGame);

        $scope.task = Task.getTask();
        $scope.currentActIndex = Task.getActIndex();
        $scope.currentPointIndex = Task.getPointIndex();

        //Add created task to the choosen activity point
        $scope.navactivities[$scope.currentActIndex].points[$scope.currentPointIndex].tasks.push($scope.task);
        //Clear the scope and get back to the new game creation menu
        $scope.task = {};
        Task.clearTask();
        $scope.currentActIndex = null;
        $scope.currentPointIndex = null;
        $scope.qaGame = {}; // Clear the game
        $ionicHistory.goBack();

        //console.log($scope.navactivities);
    };

    $scope.cancelGRTask = function () {
        $scope.task = {};
        $scope.imgURI = null;

        Task.clearTask();
        $scope.currentActIndex = null;
        $scope.currentPointIndex = null;
        $ionicHistory.goBack();
    };

    // Two main buttons - one, which submits the complete game to the server and one, which cancels the entire progress of creation
    $scope.submitGame = function () {
        if ($scope.newgame.title != null) { // Check if the title is not empty
            $scope.border = "black";

            $scope.completeGame = {
                name: $scope.newgame.title,
                description: $scope.newgame.description,
                timecompl: $scope.newgame.time,
                difficulty: $scope.newgame.difficulty,
                activities: $scope.navactivities
            };

            if (Edit.getGame() != null) {
                accAPI.deleteBaseItem(Edit.getGame().name, $rootScope.getToken())
                    .success(function (data, status, headers, config) {
                        $rootScope.hide();
                        //$scope.list.splice($scope.list.indexOf($scope.completeGame), 1);

                        accAPI.saveBaseItem($scope.completeGame)
                            .success(function (data, status, headers, config) {
                                $rootScope.hide();
                                $rootScope.doRefresh(1);
                                $ionicHistory.goBack();
                                console.log("game is saved");
                                Data.clearAct();
                            })
                            .error(function (data, status, headers, config) {
                                $rootScope.hide();
                                $rootScope.notify("Oops something went wrong!! Please try again later");
                                $ionicHistory.goBack();
                                Data.clearAct();
                            });

                    }).error(function (data, status, headers, config) {
                        $rootScope.notify(
                            $translate.instant('oops_wrong'));
                    });
            } else {

                accAPI.saveBaseItem($scope.completeGame)
                    .success(function (data, status, headers, config) {
                        $rootScope.hide();
                        $rootScope.doRefresh(1);
                        $ionicHistory.goBack();
                        Data.clearAct();
                    })
                    .error(function (data, status, headers, config) {
                        $rootScope.hide();
                        $rootScope.notify("Oops something went wrong!! Please try again later");
                        $ionicHistory.goBack();
                        Data.clearAct();
                    });
            }

        } else {
            $scope.border = "red";
        }
    };

    $scope.cancelGame = function () {
        Data.clearAct();
        $ionicHistory.goBack();
    };

}])

// #################################################################################################
// controller for playing games
// #################################################################################################

.controller('ProfPlayCtrl', function (userService, $rootScope, $scope, $stateParams, $ionicModal, $ionicPopup, $ionicLoading, $location,  $cordovaSocialSharing,
                                      $translate, $timeout, $cookies, GameData, GameState, accAPI, PathData, PlayerStats, meanData) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUser;

    $scope.gameName = $stateParams.gameName;
    $scope.userName = $stateParams.userName;
    $scope.gameLoaded = false;
    var congratsMessages = ['Good job!', 'Well done!', 'Great!', 'Cool!', 'Perfect!', 'So Fast! :)'];

    $scope.score = 0;
    $scope.GameData = GameData; // ugly hack to make GameData visible in directives
    var gameKey = GameData.getBaseIDs();

    console.log("GameData");
    console.log(GameData);

    /* only for debug purposes */
    var debugState = function () {
        console.log("debugState function()");
        return {
            gameName: $scope.gameName,
            gameloaded: $scope.gameLoaded,
            currentActivity: GameState.getCurrentActivity(),
            currentWaypoint: GameState.getCurrentWaypoint(),
            currentTask: GameState.getCurrentTask(),
            curActCleared: GameState.currentActivityCleared(),
            allWaypointsCleared: GameState.allWaypointsCleared(),
            allTasksCleared: GameState.allTasksCleared()
        };
    };

    var createModal = function (templateUrl, id) {
        console.log("createModal - function("+templateUrl+" "+id+")");
        $ionicModal.fromTemplateUrl(templateUrl, {
            id: id,
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    var initGame = function () {
        $translate.use(GameData.getConfig('language'));
        $scope.TIME_LIMIT = GameData.getConfig('qaTimeLimit'); // time limit to answer question (in seconds)
        $scope.gameLoaded = true;
        accAPI.getOneBaseGame($scope.userName, $scope.gameName)
            .then(function (data) {
                $scope.game = data.data[0];
                $scope.gameTeamnamescope = [];
                for(var i=0; i<data.data[0].team.length; i++){
                    $scope.gameTeamnamescope.push(data.data[0].team[i].teamName)
                }
                $scope.gameDatascope = data.data[0].players;
                $scope.gameTeamscope = data.data[0].team;
                $scope.gameTaskscope = data.data[0].questions;
                $scope.gameUniqueKey = data.data[0].uniqueKey;
                console.log($scope.game);
            })
        setBasePoints()
    };

    var setBasePoints = function () {
        var gameKey = GameData.getBaseIDs();

        $scope.basepointImgURL = null;
        accAPI.getOneBaseByKey(gameKey)
            .then(function (res) {
                $scope.basepoints = res.data;
                $scope.$broadcast('basepointLoadedEvent', $scope.basepoints);
            });
    };

    // load modal to invite users to a game
    $scope.inviteUsersModal = function(){
        createModal('inviteusers-modal.html', 'inviteusers');
    };

    //invite the new player
    $scope.inviteUser = function () {
        var mail = angular.element('#newUsermail').val();
        userService.inviteUser(mail)
            .success(function (dataUser) {
                dataUser.games.push($scope.gameUniqueKey);
                userService.updateFriend(dataUser)
                    .then(function () {
                        accAPI.getOneBaseGame($scope.userName, $scope.gameName)
                            .success(function (dataGame) {
                                dataGame[0].players.push(dataUser.userName);
                                accAPI.updateBasegamePlayer(dataGame[0])
                                    .then(function (dataGameUpdated) {
                                        $scope.gameDatascope = dataGameUpdated.config.data.players;
                                    })
                            })
                    })
            })
    }

    //Add a player to a Team
    $scope.playerToTeam = function(players, team){
        console.log("playerToTeam")
        for(var i=0; i<$scope.gameTeamnamescope.length; i++){
            if($scope.gameTeamscope[i].teamName == team){
                $scope.game.team[i].teamMates.push(players);
                accAPI.updateBasegameTeammates($scope.game, $scope.game.team[i].teamName, players)
                    .then(function () {
                        accAPI.getOneBaseGame($scope.userName, $scope.gameName)
                            .then(function (data) {
                                $scope.game = data.data[0];
                                $scope.gameTeamnamescope = [];
                                for(var i=0; i<data.data[0].team.length; i++){
                                    $scope.gameTeamnamescope.push(data.data[0].team[i].teamName)
                                }
                                $scope.gameDatascope = data.data[0].players;
                                $scope.gameTeamscope = data.data[0].team;
                                console.log($scope.game);
                            })
                    })
            }
        }
    }

    $scope.attackBase = function(lat, lng){
        console.log("attackBase");
        var centerOfMap = $rootScope.centerOfMap;
        var dest = L.latLng(lat, lng);
        var distance = centerOfMap.distanceTo(dest);
        // If map center is within the threshold distance to destination, then the activity is complete
        if (distance < $rootScope.thresholdDistance) {
            var min = 0;
            var max = $scope.gameTaskscope.length - 1;
            var random  = Math.floor(Math.random() * (max - min + 1)) + min;
            if($scope.gameTaskscope[random].type == "QA"){
                console.log("QA")
                for(var i=0; i<$scope.basepoints.length; i++){
                    if($scope.basepoints[i].latitude == lat && $scope.basepoints[i].longitude == lng){
                        performQATask(random, $scope.basepoints[i]._id)
                        console.log($scope.basepoints[i]);
                    }
                }
            }
            else if($scope.gameTaskscope[random].type == "GeoReference"){
                if($scope.gameTaskscope[random].base.lat == lat && $scope.gameTaskscope[random].base.lng == lng){

                }
                else{
                    $scope.attackBase(lat, lng);
                }
            }
            else if($scope.gameTaskscope[random].type == "sport"){

            }
        } else {
            $ionicPopup.alert({
            title: 'You are too far away to attack this base!'
            });
        }
    }

    var randomSort = function(array){
        var currentIndex = array.length, temporaryValue, randomIndex;
        // Answers on a random Place in the array
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    var performQATask = function (random, baseID) {
        console.log("performQATask");
        console.log(baseID);
        createModal('qa-modal.html', 'qa');

        //$scope.nonTextAnswer = false; // True if images are used as answers
        $scope.answerPicked = false;

        if (typeof $scope.gameTaskscope[random].answers == 'undefined') {
            console.log("No answers for this activity");
        }

        $scope.rightAnswer = $scope.gameTaskscope[random].answers[0]; // Correct answer is always at position 0
        $scope.question = $scope.gameTaskscope[random].question;
        $scope.chosenAnswer = "";
        $scope.clicked = [false, false, false, false];
        $scope.ansChoosen = false;
        $scope.answer = null; // true - right; false - wrong;

        $scope.answerArray=[];
        for(var i=0; i<4; i++){
            $scope.answerArray.push($scope.gameTaskscope[random].answers[i])
        }
        setTimeout(function () {
            $scope.answerArray = randomSort($scope.answerArray);
        },50);

        $scope.imgAnsURL_0 = accAPI.getImageURL($scope.answerArray[0].img);
        $scope.imgAnsURL_1 = accAPI.getImageURL($scope.answerArray[1].img);
        $scope.imgAnsURL_2 = accAPI.getImageURL($scope.answerArray[2].img);
        $scope.imgAnsURL_3 = accAPI.getImageURL($scope.answerArray[3].img);
        $scope.imgRightAnswerURL = accAPI.getImageURL($scope.rightAnswer.img);
        // console.log($scope.imgAnsURL_0, $scope.imgAnsURL_1, $scope.imgAnsURL_2, $scope.imgAnsURL_3);

        $scope.chooseAnswer = function (answer, index) {
            if (!$scope.ansChoosen) {
                $scope.chosenAnswer = answer;
                $scope.ansChoosen = true;
                $scope.answerPicked = true;
                $scope.clicked = [false, false, false, false];
                $scope.clicked[index] = true;

                // clearInterval(intervalId);

                if ($scope.chosenAnswer == $scope.rightAnswer) {
                    $scope.answerResult = $translate.instant('right_answer');
                    $scope.answer = true;
                    $scope.icon = "ion-android-happy";
                    for(var i=0; i<$scope.basepoints.length; i++){
                        if($scope.basepoints[i]._id == baseID){
                            var oteam = $scope.basepoints[i].ownerTeam;
                            var indexi = i;
                        }
                        for(var k=0; k<$scope.gameTeamscope.length; k++){
                            if($scope.gameTeamscope[k].teamMates.indexOf($rootScope.loginUserName) > -1){
                                var userTeam = $scope.gameTeamscope[k].teamName;
                            }
                        }
                    }

                    setTimeout(function () {
                        if(oteam == userTeam){
                            $scope.basepoints[indexi].power = $scope.basepoints[indexi].power + 1;
                            accAPI.updateBasepoint($scope.basepoints[indexi])
                                .then(function(data){
                                    var gameKey = GameData.getBaseIDs();
                                    accAPI.getOneBaseByKey(gameKey)
                                        .then(function (res) {
                                            $scope.basepoints = res.data;
                                            $scope.$broadcast('basepointLoadedEvent', $scope.basepoints);
                                        });
                                })
                        }
                        else{
                            $scope.basepoints[indexi].power = $scope.basepoints[indexi].power - 1;
                            if($scope.basepoints[indexi].power < 1){
                                $scope.basepoints[indexi].ownerTeam = userTeam;
                                $scope.basepoints[indexi].power = 3;
                            }
                            accAPI.updateBasepoint($scope.basepoints[indexi])
                                .then(function(data){
                                    var gameKey = GameData.getBaseIDs();
                                    accAPI.getOneBaseByKey(gameKey)
                                        .then(function (res) {
                                            $scope.basepoints = res.data;
                                            $scope.$broadcast('basepointLoadedEvent', $scope.basepoints);
                                        });
                                })
                        }
                    }, 500)
                } else {
                    $scope.answer = false;
                    $scope.answerResult = $translate.instant("wrong_ans_1");
                    $scope.icon = "ion-sad-outline";
                }
            }
        };
        $scope.showOutput = function () {
            $scope.$broadcast('qaTaskCompleted', $scope.task);
            $scope.answerPicked = false;
        };
    };

    $scope.performGeoReferencingTask = function () {
        $scope.showInfo = true;
        $scope.subHeaderInfo = "Mark location on map";
        $scope.geoRefPhoto = accAPI.getImageURL($scope.task.img);
        createModal('georef-modal.html', 'georef');
    };

    $scope.$on('qaTaskCompleted', function (event) {
        $scope.congratsMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)]; // show random congrats message
        createModal('qa-result-modal.html', 'qaResult');
    });

    $scope.$on('modal.hidden', function (event, modal) {
        // Start playing once the game info dialog is dismissed
        if (modal.id === 'info') {
            setBasePoints();
            handleNextActivity();
        } else if (modal.id === 'georef') {
            $scope.$broadcast('georefEvent', $scope.task);
        } else if (modal.id === 'qa') {
            $scope.$broadcast('qaEvent', $scope.task);
        } else if (modal.id === 'georefResult') {
            // handleTask();
        } else if (modal.id === 'qaResult') {
            // handleTask();
        }
    });

    $scope.$on('$destroy', function () {
        if (typeof $scope.modal != 'undefined') {
            $scope.modal.remove();
        }
    });

    $scope.$on('geoRefMarkedEvent', function (event, distance) {
        $scope.geoResult = false;
        //showPopup('Result', 'The location you marked was ' + distance + "m away from the original location");
        $scope.georefDistance = distance;
        $scope.showInfo = false;
        $scope.subHeaderInfo = "";

        if (distance < 25) {
            $scope.georefSmiley = 'ion-happy-outline';
            $scope.geoResult = true;

            $scope.score += GameData.getConfig('score.georefCorrect');
        } else {
            $scope.georefSmiley = 'ion-sad-outline';
            $scope.score -= GameData.getConfig('score.georefIncorrect');
        }
        createModal('georef-result-modal.html', 'georefResult');
    });

    GameData.loadUsergame($scope.userName, $scope.gameName)
        .then(initGame);
})

// #################################################################################################
// controller for map in origami play mode
// #################################################################################################
/* - Controller for map in origami play mode
 * - Only shows waypoint and emits signal when waypoint is reached or georeference game is played
 * - Is not concerned with GameState or the game progression logic - that is a job for PlayCtrl
 */
.controller('ProfStudentMapCtrl', function ($scope, $rootScope, $cordovaGeolocation, $stateParams, $ionicModal, $ionicLoading,
                                            $timeout, leafletData, $translate, GameData, PathData, PlayerStats, meanData, $compile) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    $scope.allowEdit = false; // flag to toggle map editing when marking in georeferencing game
    $scope.showMarker = false;

    // Initialize map after game is loaded. Needed because config settings are in game data
    $scope.$on('usergameLoadedEvent', function (event, args) {
      console.log("usergameLoadedEvent function()");
        $scope.initialize();
    });

    /* Initialize view of map */
    $scope.initialize = function () {
      console.log("initialize function()");
        $rootScope.thresholdDistance = GameData.getConfig('thresholdDistance');
        $scope.geolocationAlwaysOn = GameData.getConfig('geolocationAlwaysOn');
        var defaultLayer = GameData.getConfig('map.defaultLayer')
        var isDefaultLayer = function(layerName) { return (defaultLayer === layerName) ? true : false; };

        $scope.map = {
            defaults: {
                tileLayer: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxNativeZoom: GameData.getConfig('map.maxNativeZoom'),
                maxZoom: GameData.getConfig('map.maxZoom'),
                doubleClickZoom: GameData.getConfig('map.enableZoom'),
                touchZoom: GameData.getConfig('map.enableZoom'),
                scrollWheelZoom: GameData.getConfig('map.enableZoom'),
                zoomControl : GameData.getConfig('map.enableZoom'),
                zoomControlPosition: GameData.getConfig('map.zoomControlPosition')
            },
            layers: {
                baselayers: {
                    satellite: {
                        name: 'Satellite View',
                        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        type: 'xyz',
                        top: isDefaultLayer('satellite'),
                        layerOptions: {
                            attribution: '&copy; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
                            continuousWorld: false
                        }
                    },
                    streets: {
                        name: 'OpenStreetMap View',
                        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        top: isDefaultLayer('streets'),
                        layerOptions: {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            continuousWorld: false
                        }
                    },
                    topographic: {
                        name: 'Topographic View',
                        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                        type: 'xyz',
                        top: isDefaultLayer('topographic'),
                        layerOptions: {
                            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                            continuousWorld: false
                        }
                    }
                }
            },
            events: {
                map: {
                    enable: ['contextmenu', 'move', 'zoomend'],
                    logic: 'emit'
                }
            },
            center: {
                lat: 0,
                lng: 0,
                zoom: GameData.getConfig('map.defaultZoom')
            },
            markers: {}, // must be initialized even if empty, else markers and paths won't show up later
            paths: {}
        };

        $scope.geoLocButtonColor = "button-calm";
        $scope.playerMarkerButtonColor = "button-calm";
        $scope.getRealTimePos = false; // 'true' when map button is toggled to get real position from GPS
        /*  initialDistance is a pseudo value for initial calculation of distance to map center.
            Otherwise chances are high that first waypoint is reached as soon as map is loaded.
            Actual distance is computed once map 'move' event is triggered.
            Also used to calculate max frown curvature for smile, beyond which smiley doesn't frown anymore
        */
        $scope.initialDistance = 500;
        $scope.currentDistance = 0;
        $scope.locate();
        if ($scope.geolocationAlwaysOn) {
            $scope.toggleGeoLocation(true);
        }


        // $scope.$emit('mapLoadedEvent');
    };

    $scope.updatePlayerPosMarker = function (position) {
        if (typeof $scope.map.markers.PlayerPos === "undefined") {
            var playerMarker = './img/icons/marker-transparent.png';
            var marker = {
                lat: position.lat,
                lng: position.lng,
                message: "You are here",
                draggable: false,
                icon: {
                    iconUrl: playerMarker,
                    iconSize: [48, 48],
                    iconAnchor: [24, 48]
                }
            };
            $scope.map.markers.PlayerPos = marker;
        } else {
            $scope.map.markers.PlayerPos.lat = position.lat;
            $scope.map.markers.PlayerPos.lng = position.lng;
        }
    };

    /* Center map on user's current position */
    $scope.locate = function () {
        $cordovaGeolocation
            .getCurrentPosition()
            .then(function (position) {
                $scope.map.center.lat = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                //$scope.map.center.zoom = 15;
                $scope.updatePlayerPosMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, function (err) {
                // error
                console.log("Geolocation error!");
                console.log(err);
            });
    };

    /* Add more markers once game is loaded */
    $scope.$on('basepointLoadedEvent', function (event, basepoints) {
        $scope.map.markers= {};
        for(var i=0; i<basepoints.length; i++ ){
            var baseID = basepoints[i]._id;
            var marker = {
                lat: basepoints[i].latitude,
                lng: basepoints[i].longitude,
                message: "Basename: " + basepoints[i].name + '<br>' + "Owner team: " + basepoints[i].ownerTeam + '<br>' + "Power: " + basepoints[i].power + '<br><button ng-click="attackBase(' + basepoints[i].latitude + "," + basepoints[i].longitude + ')"> Attack! </button>',
                getMessageScope: function () {
                    return $scope;
                },
                focus: false
            };
            $scope.map.markers[basepoints[i].name]= marker;
        }
    });

    /* Get bearing in degrees to destination */
    $scope.getBearing = function (orig, dest) {
        Number.prototype.toRadians = function () {
            return this * Math.PI / 180;
        };
        Number.prototype.toDegrees = function () {
            return this * 180 / Math.PI;
        };

        var lat1_radian = orig.lat.toRadians();
        var lng1_radian = orig.lng.toRadians();
        var lat2_radian = dest.lat.toRadians();
        var lng2_radian = dest.lng.toRadians();
        var lat_delta = (lat2_radian - lat1_radian).toRadians();
        var lng_delta = (lng2_radian - lng1_radian).toRadians();
        var y = Math.sin(lng2_radian - lng1_radian) * Math.cos(lat2_radian);
        var x = Math.cos(lat1_radian) * Math.sin(lat2_radian) - Math.sin(lat1_radian) * Math.cos(lat2_radian) * Math.cos(lng2_radian - lng1_radian);
        var bearing = Math.atan2(y, x).toDegrees();
        $scope.bearing = bearing;
    };

    /* (Re)compute distance to destination once map moves */
    $scope.$on('leafletDirectiveMap.move', function (event, args) {
        console.log("leafletDirectiveMap.move - function()");
        var map = args.leafletEvent.target;
        var center = map.getCenter();
        console.log("center");
        console.log(center);
        $rootScope.centerOfMap = center;
        console.log("$rootScope.centerOfMap");
        console.log($rootScope.centerOfMap);
        if ($scope.waypointLoaded) {
            var map = args.leafletEvent.target;
            var center = map.getCenter();

            PathData.addCoord(center.lat, center.lng);

            leafletData.getMap()
                .then(function (map) {
                    $sope.centerOfMap = null;
                    var center = map.getCenter();
                    console.log("center");
                    console.log(center);
                    $scope.centerOfMap = center;
                    console.log("$sope.centerOfMap");
                    console.log($scope.centerOfMap);
                    var dest = L.latLng($scope.destination.lat, $scope.destination.lng);
                    var distance = center.distanceTo(dest);
                    if ($scope.initialDistance == -1) {
                        $scope.initialDistance = distance;
                        //console.log("Setting initial distance to ", distance);
                    }
                    $scope.currentDistance = distance;
                    $scope.getBearing(center, dest);

                    /* Don't place marker on map center if geolocation tracking is on. This is handled separately */
                    if (!$scope.getRealTimePos) {
                        $scope.updatePlayerPosMarker(center);
                    }

                    if (typeof $scope.drawSmiley !== "undefined") {
                        var maxDistance = parseFloat($scope.initialDistance) * 2;
                        // normalize distance to stop frowning once distance exceeds twice the initial distance to destination
                        // otherwise smiley frowns too much
                        var normalizedDistance = (parseFloat($scope.currentDistance) > maxDistance) ? maxDistance : parseFloat($scope.currentDistance);
                        $scope.drawSmiley($scope.canvas, $scope.canvasContext, normalizedDistance);
                    }
                    // If map center is within the threshold distance to destination, then the activity is complete
                    if (distance < $rootScope.thresholdDistance) {
                        $scope.waypointLoaded = false;
                        delete $scope.map.markers.NextWaypoint;
                        $scope.$emit('waypointReachedEvent');
                    }
                }, function (err) {
                    console.log("Could not get Leaflet map object - " + err);
                });
        }
    });

    $scope.$on('leafletDirectiveMap.zoomend', function (event, args) {
        if ($scope.getRealTimePos) {
            $scope.toggleGeoLocation(false);
            $scope.locate();
            $scope.toggleGeoLocation(false);
        }
    });

    var GeoRefPoint = function () {
        if (!(this instanceof GeoRefPoint)) return new GeoRefPoint();
        this.lat = "";
        this.lng = "";
        this.name = "";
    };

    $scope.$on('leafletDirectiveMap.contextmenu', function (event, locationEvent) {
        if ($scope.allowEdit) {
            leafletData.getMap()
                .then(function (map) {
                    $scope.newGeoRefPoint = new GeoRefPoint();
                    $scope.newGeoRefPoint.lat = locationEvent.leafletEvent.latlng.lat;
                    $scope.newGeoRefPoint.lng = locationEvent.leafletEvent.latlng.lng;

                    var marker = {
                        lat: $scope.newGeoRefPoint.lat,
                        lng: $scope.newGeoRefPoint.lng,
                        message: "Marked photograph location",
                        focus: true,
                        icon: {
                            iconUrl: './img/icons/PhotoMarker2.png',
                            iconSize: [24, 38],
                            iconAnchor: [12, 38]
                        }
                    };
                    var marker2 = {
                        lat: $scope.georef.lat,
                        lng: $scope.georef.lng,
                        message: "Original photograph location",
                        focus: true,
                        icon: {
                            iconUrl: './img/icons/PhotoMarker1.png',
                            iconSize: [24, 38],
                            iconAnchor: [12, 38]
                        }
                    };
                    $scope.map.markers.playerPhotoMark = marker;
                    $scope.map.markers.origPhotoMark = marker2;

                    var origLocation = L.latLng($scope.georef.lat, $scope.georef.lng);
                    var markedLocation = L.latLng($scope.newGeoRefPoint.lat, $scope.newGeoRefPoint.lng);
                    var distance = parseInt(origLocation.distanceTo(markedLocation));

                    /* Georef task - Path from where the photograph was originally taken to where the player marked */
                    var path = {
                        type: "polyline",
                        color: 'red',
                        weight: 5,
                        latlngs: [origLocation, markedLocation]
                    };

                    $scope.map.paths = {
                        'georefTaskPath': path
                    };

                    $scope.map.center = {
                        lat: $scope.georef.lat,
                        lng: $scope.georef.lng,
                        zoom: $scope.map.center.zoom
                    };

                    $scope.allowEdit = false;
                    /* Draw and show path between original and marked locations for 2 seconds. Then show modal*/
                    $timeout(function () {
                        delete $scope.map.paths.georefTaskPath;
                        delete $scope.map.markers.playerPhotoMark;
                        delete $scope.map.markers.origPhotoMark;
                        PlayerStats.endTask ({
                            "marked_lat" : $scope.newGeoRefPoint.lat,
                            "marked_lng" : $scope.newGeoRefPoint.lng,
                            "distance_in_m" : distance
                        });
                        $scope.$emit('geoRefMarkedEvent', distance);
                    }, 2000);
                    //$scope.map.markers.pop();
                    //$scope.map.markers.pop();
                });
        };
    });

    $scope.$on('georefEvent', function (event, args) {
        $scope.allowEdit = true;
        $scope.georef = {};

        /* Dummy values. Remove after georeferecing task editing has been implemented*/
        if (typeof args.lat === "undefined") {
            $scope.georef.lat = 51.9649;
            $scope.georef.lng = 7.601;
            args.lat = 51.94;
            args.lng = 7.60;
        } else {
            $scope.georef.lat = args.lat;
            $scope.georef.lng = args.lng;
        }
    });

    $scope.trackPosition = function () {
        var watchOptions = {
            frequency: 100,
            maximumAge: 1000,
            timeout: 10000,
            enableHighAccuracy: true // may cause errors if true
        };
        $scope.trackWatch = $cordovaGeolocation.watchPosition(watchOptions);
        $scope.trackWatch.then(
            null,
            function (err) {
                $ionicLoading.show({
                    template: $translate.instant('error_geolocat'),
                    noBackdrop: true,
                    duration: 1000
                });
                console.log($translate.instant('error_watching'));
                console.log(err);
            },
            function (position) {
                $scope.map.center.lat = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                $scope.updatePlayerPosMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
    };

    $scope.toggleGeoLocation = function (showInfo) {
        if ($scope.getRealTimePos == false) {
            $scope.getRealTimePos = true;

            // Geolocation is now ON
            if (showInfo) {
                $ionicLoading.show({
                    template: $translate.instant('now_using_geo'),
                    noBackdrop: true,
                    duration: 2000
                });
            }
            leafletData.getMap()
                .then(function (map) {
                    map.dragging.disable();
                });
            $scope.geoLocButtonColor = "button-balanced";
            $rootScope.thresholdDistance = GameData.getConfig('thresholdDistanceGeolocOn');
            $scope.trackPosition();
        } else {
            $scope.getRealTimePos = false;
            leafletData.getMap()
                .then(function (map) {
                    map.dragging.enable();
                });
            $rootScope.thresholdDistance = GameData.getConfig('thresholdDistance');
            $scope.geoLocButtonColor = "button-calm";
            $scope.trackWatch.clearWatch();
        }
    };

    $scope.$on('gameOverEvent', function (event) {
        if ($scope.getRealTimePos == true) {
            // Turn off geolocation watch and reenable map drag
            $scope.toggleGeoLocation(false);
        }
    });

    // Show player position if button is pressed
    $scope.showPositionMarker = function () {
        if ($scope.showMarker == false) {
            $scope.showMarker = true;
            $scope.playerMarkerButtonColor = "button-balanced";

            if (typeof $scope.map.markers.PlayerPos != "undefined") {
                $scope.map.markers.PlayerPos.icon = {
                    iconUrl: './img/icons/Youarehere.png',
                    iconSize: [48, 48],
                    iconAnchor: [24, 48]
                };
                // Hide marker again after 5 seconds
                $timeout(function () {
                    $scope.map.markers.PlayerPos.icon = {
                        iconUrl: './img/icons/marker-transparent.png'
                    };
                    $scope.playerMarkerButtonColor = "button-calm";
                    $scope.showMarker = false;
                }, GameData.getConfig('playerLocationHintTimeout') * 1000);
            }
        }
    }

    //$scope.initialize();

})

// #################################################################################################
// controller for playing FFA games
// #################################################################################################

.controller('FFACtrl', ['SenseBox', '$rootScope', '$scope', '$stateParams', '$ionicModal', '$ionicPopup', '$ionicLoading', '$ionicHistory', '$window', '$location', '$cordovaSocialSharing',
                                    '$translate', '$timeout', '$cookies', 'accAPI', 'PathData', 'PlayerStats', 'meanData', 'userService', 'authentication', 'GameData', 'FFAdefault',
                                    function (SenseBox, $rootScope, $scope, $stateParams, $ionicModal, $ionicPopup, $ionicLoading, $ionicHistory, $window, $location, $cordovaSocialSharing,
                                    $translate, $timeout, $cookies, accAPI, PathData, PlayerStats, meanData, userService, authentication, GameData, FFAdefault) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUserName;
    $scope.userName = thisUser;

    $scope.senseMap = {
        center: {
            autoDiscover: true,
            zoom: 16
        },

        defaults: {
            tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            zoomControlPosition: 'topleft',
            lat: 57,
            lng: 8

        },

        geojson: {},

        paths: {
            userPos: {
                type: 'circleMarker',
                color: '#2E64FE',
                weight: 2,
                radius: 1,
                opacity: 0.0,
                clickable: false,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            },
            userPosCenter: {
                type: 'circleMarker',
                color: '#2E64FE',
                fill: true,
                radius: 3,
                opacity: 0.0,
                fillOpacity: 1.0,
                clickable: false,
                updateTrigger: true,
                latlngs: {
                    lat: 52,
                    lng: 7
                }
            }
        },

        markers: {},
        events: {
            map: {
                enable: ['click'],
                logic: 'emit'
            }
        },

        layers: {
            baselayers: {
                osm: {
                    name: 'Satelite View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: true,
                    layerOptions: {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                        continuousWorld: false
                    }
                },
                streets: {
                    name: 'Streets View',
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz',
                    top: false,
                },
                topographic: {
                    name: 'Topographic View',
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    type: 'xyz',
                    top: false,
                    layerOptions: {
                        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                        continuousWorld: false
                    }
                }
            }
        }
    };

    // go back in History to
    $scope.cancelGame = function () {
        $ionicHistory.goBack();
    };

    var createModal = function (templateUrl, id) {
      console.log("createModal - function("+templateUrl+" "+id+")");
        $ionicModal.fromTemplateUrl(templateUrl, {
            id: id,
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function (modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.closeModal = function () {
        $scope.modal.remove();
    };

    var configGame = function () {
      console.log("configGame");
        $translate.use(SenseBox.getConfig('language'));
        // $scope.TIME_LIMIT = SenseBox.getConfig('qaTimeLimit'); // time limit to answer question (in seconds)
        // $scope.gameLoaded = true;
        // accAPI.getFFAGame($scope.userName)
        //     .then(function (data) {
        //       console.log("data");
        //       console.log(data);
        //         // $scope.game = data.data[0];
        //         // $scope.gameTeamnamescope = [];
        //         // for(var i=0; i<data.data[0].team.length; i++){
        //         //     $scope.gameTeamnamescope.push(data.data[0].team[i].teamName)
        //         // }
        //         // $scope.gameDatascope = data.data[0].players;
        //         // $scope.gameTeamscope = data.data[0].team;
        //         // console.log($scope.gameDatascope);
        //         // console.log($scope.gameTeamscope);
        //         // console.log($scope.game);
        //         // console.log($scope.gameTeamnamescope);
        //     })

        // initializeMarker($scope.userName);
    };

    var initializeMarker = function (user) {
      console.log("initializeMarker()");
      $scope.$broadcast('senseBoxLoadedEvent', user);
    };

    $scope.showSensemap = function () {
        console.log("showSensemap - function ()");
        createModal('templates/map/sensemap.html'); //tasks/georef_type.html'); //sensemap
            FFAdefault.getBaseMarkerFromFFA()
                    .then(function(res) {
                      console.log("res");
                      console.log(res);
                      // $scope.locate();         // TODO: uf on mobile device

                      var object = res;
                      var possibleToSee = false;
                      var boxArray = [];
                      boxArray = object.data[0].bases;

                      var count = 0;
                      var potBoxes = [];
                      for (var i=0; i<boxArray.length; i++) {
                          // var sensorMessage = '<br>';
                          var sensorMessage = null;
                          for (var j=0; j<boxArray[i].sensors.length; j++) {
                              if (boxArray[i].sensors[j].lastMeasurement != undefined) {
sensorMessage=sensorMessage+'<br>'+boxArray[i].sensors[j].title+': '+boxArray[i].sensors[j].lastMeasurement.value+' '+boxArray[i].sensors[j].unit+'('+boxArray[i].sensors[j].lastMeasurement.createdAt+')'+'<br>of type - '+boxArray[i].sensors[j].sensorType;
                            } else {
sensorMessage=sensorMessage+'<br>'+boxArray[i].sensors[j].title+' '+boxArray[i].sensors[j].unit+'<br>of type - '+boxArray[i].sensors[j].sensorType;
                            }
                          }
                          var marker = {
                              lat: boxArray[i].lat,
                              lng: boxArray[i].lng,
                              id: boxArray[i].id,
                              sensors: boxArray[i].sensors,
                              message: boxArray[i].name + sensorMessage,
                              focus: false
                          };
                          $scope.senseMap.markers[boxArray[i].id] = marker;
                      }
                      console.log("$scope.senseMap.markers");
                      console.log($scope.senseMap.markers);
            })
    };

    $scope.attackBase = function(lat, lng){
        console.log("attackBase");
        var centerOfMap = $rootScope.centerOfMap;
        var dest = L.latLng(lat, lng);
        var distance = centerOfMap.distanceTo(dest);
        // If map center is within the threshold distance to destination, then the activity is complete
        if (distance < $rootScope.thresholdDistance) {
            var min = 0;
            var max = $scope.gameTaskscope.length - 1;
            var random  = Math.floor(Math.random() * (max - min + 1)) + min;
            if($scope.gameTaskscope[random].type == "QA"){
                console.log("QA")
                for(var i=0; i<$scope.basepoints.length; i++){
                    if($scope.basepoints[i].latitude == lat && $scope.basepoints[i].longitude == lng){
                        performQATask(random, $scope.basepoints[i]._id)
                        console.log($scope.basepoints[i]);
                    }
                }
            }
            else if($scope.gameTaskscope[random].type == "GeoReference"){

            }
            else if($scope.gameTaskscope[random].type == "sport"){

            }
        } else { $ionicPopup.alert({
            title: 'NO attack',
            template: 'you are not close enough'});
        }
    }

    var randomSort = function(array){
        //Shuffle the array to fill the answer boxes randomly
        var currentIndex = array.length, temporaryValue, randomIndex;

        // Answers on a random Place in the array
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    var performQATask = function (random, baseID) {
        console.log("performQATask");
        console.log(baseID);
        createModal('qa-modal.html', 'qa');

        //$scope.nonTextAnswer = false; // True if images are used as answers
        $scope.answerPicked = false;

        if (typeof $scope.gameTaskscope[random].answers == 'undefined') {
            console.log("No answers for this activity");
        }

        $scope.rightAnswer = $scope.gameTaskscope[random].answers[0]; // Correct answer is always at position 0
        $scope.question = $scope.gameTaskscope[random].question;
        $scope.chosenAnswer = "";
        $scope.clicked = [false, false, false, false];
        $scope.ansChoosen = false;
        $scope.answer = null; // true - right; false - wrong;

        $scope.answerArray = $scope.gameTaskscope[random].answers;
        $scope.answerArray = randomSort($scope.answerArray);

        $scope.imgAnsURL_0 = accAPI.getImageURL($scope.answerArray[0].img);
        $scope.imgAnsURL_1 = accAPI.getImageURL($scope.answerArray[1].img);
        $scope.imgAnsURL_2 = accAPI.getImageURL($scope.answerArray[2].img);
        $scope.imgAnsURL_3 = accAPI.getImageURL($scope.answerArray[3].img);
        $scope.imgRightAnswerURL = accAPI.getImageURL($scope.rightAnswer.img);
        // console.log($scope.imgAnsURL_0, $scope.imgAnsURL_1, $scope.imgAnsURL_2, $scope.imgAnsURL_3);

        $scope.chooseAnswer = function (answer, index) {
            if (!$scope.ansChoosen) {
                $scope.chosenAnswer = answer;
                $scope.ansChoosen = true;
                $scope.answerPicked = true;
                $scope.clicked = [false, false, false, false];
                $scope.clicked[index] = true;

                // clearInterval(intervalId);

                if ($scope.chosenAnswer == $scope.rightAnswer) {
                    $scope.answerResult = $translate.instant('right_answer');
                    $scope.answer = true;
                    $scope.icon = "ion-android-happy";
                    for(var i=0; i<$scope.basepoints.length; i++){
                        if($scope.basepoints[i]._id == baseID){
                            var oteam = $scope.basepoints[i].ownerTeam;
                            var indexi = i;
                        }
                        for(var k=0; k<$scope.gameTeamscope.length; k++){
                            if($scope.gameTeamscope[k].teamMates.indexOf($rootScope.loginUserName) > -1){
                                var userTeam = $scope.gameTeamscope[k].teamName;
                            }
                        }
                    }

                    setTimeout(function () {
                        if(oteam == userTeam){
                            $scope.basepoints[indexi].power = $scope.basepoints[indexi].power + 1;
                            accAPI.updateBasepoint($scope.basepoints[indexi])
                                .then(function(data){
                                    var gameKey = GameData.getBaseIDs();
                                    accAPI.getOneBaseByKey(gameKey)
                                        .then(function (res) {
                                            $scope.basepoints = res.data;
                                            $scope.$broadcast('basepointLoadedEvent', $scope.basepoints);
                                        });
                                })
                        }
                        else{
                            $scope.basepoints[indexi].power = $scope.basepoints[indexi].power - 1;
                            if($scope.basepoints[indexi].power < 1){
                                $scope.basepoints[indexi].ownerTeam = userTeam;
                                $scope.basepoints[indexi].power = 3;
                            }
                            accAPI.updateBasepoint($scope.basepoints[indexi])
                                .then(function(data){
                                    var gameKey = GameData.getBaseIDs();
                                    accAPI.getOneBaseByKey(gameKey)
                                        .then(function (res) {
                                            $scope.basepoints = res.data;
                                            $scope.$broadcast('basepointLoadedEvent', $scope.basepoints);
                                        });
                                })
                        }
                    }, 500)
                } else {
                    $scope.answer = false;
                    $scope.answerResult = $translate.instant("wrong_ans_1");
                    $scope.icon = "ion-sad-outline";
                }
            }
        };

        $scope.showOutput = function () {
            $scope.$broadcast('qaTaskCompleted', $scope.task);
            $scope.answerPicked = false;
        };
    };

    $scope.showUserInformation = function () {
      createModal('userInformation-modal.html', 'userinfo');
    };

    //TODO: show online user/ show user playing FFA
    //TODO: bei annäherung an eine Base --> attack button --> angreifen der Base
    //TODO: tasks anzeigen

    // $scope.$on('modal.hidden', function (event, modal) {
    //     // Start playing once the game info dialog is dismissed
    //     if (modal.id === 'info') {
    //       setBasePoints();
    //         handleNextActivity();
    //     } else if (modal.id === 'error') {
    //         $location.path('/');
    //     } else if (modal.id === 'georef') {
    //         $scope.$broadcast('georefEvent', $scope.task);
    //     } else if (modal.id === 'qa') {
    //         $scope.$broadcast('qaEvent', $scope.task);
    //     } else if (modal.id === 'georefResult') {
    //         handleTask();
    //     } else if (modal.id === 'qaResult') {
    //         handleTask();
    //     } else if (modal.id === 'waypoint') {
    //         handleTask();
    //     }
    // });

    //TODO: Wofür?
    $scope.$on('$destroy', function () {
        if (typeof $scope.modal != 'undefined') {
            $scope.modal.remove();
        }
    });

    SenseBox.FFA()
        .then(configGame);
}])

// #################################################################################################
// controller for map in origami play mode
// #################################################################################################
/* - Controller for map in origami play mode
 * - Only shows waypoint and emits signal when waypoint is reached or georeference game is played
 * - Is not concerned with GameState or the game progression logic - that is a job for PlayCtrl
 */
.controller('FFAMapCtrl', ['$scope', '$rootScope', '$cordovaGeolocation', '$stateParams', '$ionicModal', '$ionicPopup', '$ionicLoading',
                                '$timeout', 'leafletData', '$translate', 'GameData', 'PathData', 'PlayerStats', 'meanData', 'SenseBox', 'FFAdefault', '$compile',
                                function ($scope, $rootScope, $cordovaGeolocation, $stateParams, $ionicModal, $ionicPopup, $ionicLoading,
                                            $timeout, leafletData, $translate, GameData, PathData, PlayerStats, meanData, SenseBox, FFAdefault, $compile) {
    var vm = this;
    vm.user = {};

    meanData.getProfile()
        .success(function(data) {
            vm.user = data;
            $rootScope.loginUser = vm.user.email;
            $rootScope.loginUserName = vm.user.userName;
        })
        .error(function (e) {
            console.log(e);
        });

    var thisUser = $rootScope.loginUser;

    $scope.allowEdit = false; // flag to toggle map editing when marking in georeferencing game
    $scope.showMarker = false;

    $scope.$on('FFAgameLoadedEvent', function(event, args) {
      console.log("FFAgameLoadedEvent");
        $scope.init();
    });

    $scope.init = function () {
        $rootScope.thresholdDistance = SenseBox.getConfig('thresholdDistance');
        $scope.geolocationAlwaysOn = SenseBox.getConfig('geolocationAlwaysOn');
        $scope.radiusDistance = SenseBox.getConfig('radiusDistance');
        var defaultLayer = SenseBox.getConfig('map.defaultLayer')
        var isDefaultLayer = function(layerName) { return (defaultLayer === layerName) ? true : false; };

        $scope.map = {
            defaults: {
                tileLayer: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxNativeZoom: SenseBox.getConfig('map.maxNativeZoom'),
                maxZoom: SenseBox.getConfig('map.maxZoom'),
                doubleClickZoom: SenseBox.getConfig('map.enableZoom'),
                touchZoom: SenseBox.getConfig('map.enableZoom'),
                scrollWheelZoom: SenseBox.getConfig('map.enableZoom'),
                zoomControl : SenseBox.getConfig('map.enableZoom'),
                zoomControlPosition: SenseBox.getConfig('map.zoomControlPosition')
            },
            layers: {
                baselayers: {
                    satellite: {
                        name: 'Satellite View',
                        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                        type: 'xyz',
                        top: isDefaultLayer('satellite'),
                        layerOptions: {
                            attribution: '&copy; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AEX, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
                            continuousWorld: false
                        }
                    },
                    streets: {
                        name: 'OpenStreetMap View',
                        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        type: 'xyz',
                        top: isDefaultLayer('streets'),
                        layerOptions: {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            continuousWorld: false
                        }
                    },
                    topographic: {
                        name: 'Topographic View',
                        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                        type: 'xyz',
                        top: isDefaultLayer('topographic'),
                        layerOptions: {
                            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
                            continuousWorld: false
                        }
                    }
                }
            },
            events: {
                map: {
                    enable: ['contextmenu', 'move', 'zoomend'],
                    logic: 'emit'
                }
            },
            center: {
                lat: 0,
                lng: 0,
                zoom: SenseBox.getConfig('map.defaultZoom')
            },
            markers: {}, // must be initialized even if empty, else markers and paths won't show up later
            paths: {}
        };

        $scope.geoLocButtonColor = "button-calm";
        $scope.playerMarkerButtonColor = "button-calm";
        /*  initialDistance is a pseudo value for initial calculation of distance to map center.
            Otherwise chances are high that first waypoint is reached as soon as map is loaded.
            Actual distance is computed once map 'move' event is triggered.
            Also used to calculate max frown curvature for smile, beyond which smiley doesn't frown anymore
        */
        $scope.initialDistance = 500;
        $scope.currentDistance = 0;
        $scope.locate();
        if ($scope.geolocationAlwaysOn) {
            $scope.toggleGeoLocation(true);
        }
        // $scope.$emit('mapLoadedEvent');
    };

    $scope.updatePlayerPosMarker = function (position) {
        if (typeof $scope.map.markers.PlayerPos === "undefined") {
            var playerMarker = './img/icons/marker-transparent.png';
            var marker = {
                lat: position.lat,
                lng: position.lng,
                message: "You are here",
                draggable: false,
                icon: {
                    iconUrl: playerMarker,
                    iconSize: [48, 48],
                    iconAnchor: [24, 48]
                }
            };
            $scope.map.markers.PlayerPos = marker;
        } else {
            $scope.map.markers.PlayerPos.lat = position.lat;
            $scope.map.markers.PlayerPos.lng = position.lng;
        }
    };

    /* Center map on user's current position */
    $scope.locate = function () {
        $cordovaGeolocation
            .getCurrentPosition()
            .then(function (position) {
                $scope.map.center.lat = position.coords.latitude;
                $scope.map.center.lng = position.coords.longitude;
                //$scope.map.center.zoom = 15;
                $scope.updatePlayerPosMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, function (err) {
                // error
                console.log("Geolocation error!");
                console.log(err);
            });
    };

    /* (Re)compute distance to destination once map moves */
    $scope.$on('leafletDirectiveMap.move', function (event, args) {
        console.log("leafletDirectiveMap.move - function()");
        var map = args.leafletEvent.target;
        var center = map.getCenter();
        $rootScope.centerOfMap = center;
        FFAdefault.getBaseMarkerFromFFA()
                .then(function(res) {
                  $scope.gameTaskscope = res.data[0].questions;
                  var playerpos = null;
                  playerpos = $scope.map.markers.PlayerPos;
                  $scope.map.markers = {};
                  $scope.map.markers.PlayerPos = playerpos;
                  // $scope.locate();         // TODO: uf on mobile device


                  var object = res;
                  var possibleToSee = false;
                  var boxArray = [];
                  boxArray = object.data[0].bases;

                  var count = 0;
                  var potBoxes = [];
                  for (var i=0; i<boxArray.length; i++) {
                      var add = 0.01;
                      var latitude = false;
                      var longitude = false;
                      var subtrLat = center.lat -add;
                      var subtrLng = center.lng -add;
                      var addLat = center.lat +add;
                      var addLng = center.lng +add;

                      if (subtrLat <= boxArray[i].lat && boxArray[i].lat <= center.lat || center.lat <= boxArray[i].lat && boxArray[i].lat <= addLat) {
                          latitude = true;
                      }
                      if (subtrLng <= boxArray[i].lng && boxArray[i].lng <= center.lng || center.lng <= boxArray[i].lng && boxArray[i].lng <= addLng) {
                          longitude = true;
                      }
                      if (latitude == true && longitude == true) {
                          potBoxes.push(boxArray[i]);
                          count ++;
                          possibleToSee = true;
                          var marker = {
                              lat: boxArray[i].lat,
                              lng: boxArray[i].lng,
                              id: boxArray[i].id,
                              sensors: boxArray[i].sensors,
                              message: boxArray[i].name + '<br><button class="attackButton" ng-click="attackBase(' + boxArray[i].lat + "," + boxArray[i].lng + ')"> Attack! </button>',
                              getMessageScope: function () {
                                return $scope;
                              },
                              focus: false
                          };
                          $scope.map.markers[boxArray[i].id] = marker;
                      }
                       else {
                        console.log("no marker");
                        possibleToSee = false;
                      }
                }
        })
    });

        //####################################################
        //#### compute distance to marker ####################
        //####################################################

        $scope.$on('BasepointReachedEvent', function (event) {
            console.log("hey du hast eine Base erreicht");
            // $scope.congratsMessage = congratsMessages[Math.floor(Math.random() * congratsMessages.length)]; // show random congrats message
            // PlayerStats.endWaypoint();
            //TODO: on BasepointAttackEvent create Modal Questions
            // createModal('waypoint-reached-modal.html', 'waypoint');
        });

        //####################################################
        //############### for georef task ####################
        //####################################################

        // $scope.$on('leafletDirectiveMap.zoomend', function (event, args) {
        //     if ($scope.getRealTimePos) {
        //         $scope.toggleGeoLocation(false);
        //         $scope.locate();
        //         $scope.toggleGeoLocation(false);
        //     }
        // });
        // $scope.$on('leafletDirectiveMap.contextmenu', function (event, locationEvent) {
        //     if ($scope.allowEdit) {
        //         leafletData.getMap()
        //             .then(function (map) {
        //                 $scope.newGeoRefPoint = new GeoRefPoint();
        //                 $scope.newGeoRefPoint.lat = locationEvent.leafletEvent.latlng.lat;
        //                 $scope.newGeoRefPoint.lng = locationEvent.leafletEvent.latlng.lng;
        //
        //                 var marker = {
        //                     lat: $scope.newGeoRefPoint.lat,
        //                     lng: $scope.newGeoRefPoint.lng,
        //                     message: "Marked photograph location",
        //                     focus: true,
        //                     icon: {
        //                         iconUrl: './img/icons/PhotoMarker2.png',
        //                         iconSize: [24, 38],
        //                         iconAnchor: [12, 38]
        //                     }
        //                 };
        //                 var marker2 = {
        //                     lat: $scope.georef.lat,
        //                     lng: $scope.georef.lng,
        //                     message: "Original photograph location",
        //                     focus: true,
        //                     icon: {
        //                         iconUrl: './img/icons/PhotoMarker1.png',
        //                         iconSize: [24, 38],
        //                         iconAnchor: [12, 38]
        //                     }
        //                 };
        //                 $scope.map.markers.playerPhotoMark = marker;
        //                 $scope.map.markers.origPhotoMark = marker2;
        //
        //                 var origLocation = L.latLng($scope.georef.lat, $scope.georef.lng);
        //                 var markedLocation = L.latLng($scope.newGeoRefPoint.lat, $scope.newGeoRefPoint.lng);
        //                 var distance = parseInt(origLocation.distanceTo(markedLocation));
        //
        //                 /* Georef task - Path from where the photograph was originally taken to where the player marked */
        //                 var path = {
        //                     type: "polyline",
        //                     color: 'red',
        //                     weight: 5,
        //                     latlngs: [origLocation, markedLocation]
        //                 };
        //
        //                 $scope.map.paths = {
        //                     'georefTaskPath': path
        //                 };
        //
        //                 $scope.map.center = {
        //                     lat: $scope.georef.lat,
        //                     lng: $scope.georef.lng,
        //                     zoom: $scope.map.center.zoom
        //                 };
        //
        //                 $scope.allowEdit = false;
        //                 /* Draw and show path between original and marked locations for 2 seconds. Then show modal*/
        //                 $timeout(function () {
        //                     delete $scope.map.paths.georefTaskPath;
        //                     delete $scope.map.markers.playerPhotoMark;
        //                     delete $scope.map.markers.origPhotoMark;
        //                     PlayerStats.endTask ({
        //                         "marked_lat" : $scope.newGeoRefPoint.lat,
        //                         "marked_lng" : $scope.newGeoRefPoint.lng,
        //                         "distance_in_m" : distance
        //                     });
        //                     $scope.$emit('geoRefMarkedEvent', distance);
        //                 }, 2000);
        //                 //$scope.map.markers.pop();
        //                 //$scope.map.markers.pop();
        //             });
        //     };
        // });
        //
        // $scope.$on('georefEvent', function (event, args) {
        //     $scope.allowEdit = true;
        //     $scope.georef = {};
        //
        //     /* Dummy values. Remove after georeferecing task editing has been implemented*/
        //     if (typeof args.lat === "undefined") {
        //         $scope.georef.lat = 51.9649;
        //         $scope.georef.lng = 7.601;
        //         args.lat = 51.94;
        //         args.lng = 7.60;
        //     } else {
        //         $scope.georef.lat = args.lat;
        //         $scope.georef.lng = args.lng;
        //     }
        // });
        //
        $scope.trackPosition = function () {
            var watchOptions = {
                frequency: 100,
                maximumAge: 1000,
                timeout: 10000,
                enableHighAccuracy: true // may cause errors if true
            };
            $scope.trackWatch = $cordovaGeolocation.watchPosition(watchOptions);
            $scope.trackWatch.then(
                null,
                function (err) {
                    $ionicLoading.show({
                        template: $translate.instant('error_geolocat'),
                        noBackdrop: true,
                        duration: 1000
                    });
                    console.log($translate.instant('error_watching'));
                    console.log(err);
                },
                function (position) {
                    $scope.map.center.lat = position.coords.latitude;
                    $scope.map.center.lng = position.coords.longitude;
                    $scope.updatePlayerPosMarker({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                });
        };

        $scope.toggleGeoLocation = function (showInfo) {
            if ($scope.getRealTimePos == false) {
                $scope.getRealTimePos = true;

                // Geolocation is now ON
                if (showInfo) {
                    $ionicLoading.show({
                        template: $translate.instant('now_using_geo'),
                        noBackdrop: true,
                        duration: 2000
                    });
                }
                leafletData.getMap()
                    .then(function (map) {
                        map.dragging.disable();
                    });
                $scope.geoLocButtonColor = "button-balanced";
                $rootScope.thresholdDistance = SenseBox.getConfig('thresholdDistanceGeolocOn');
                $scope.trackPosition();
            } else {
                $scope.getRealTimePos = false;
                leafletData.getMap()
                    .then(function (map) {
                        map.dragging.enable();
                    });
                $rootScope.thresholdDistance = SenseBox.getConfig('thresholdDistance');
                $scope.geoLocButtonColor = "button-calm";
                $scope.trackWatch.clearWatch();
            }
        };

        // $scope.$on('gameOverEvent', function (event) {
        //     if ($scope.getRealTimePos == true) {
        //         // Turn off geolocation watch and reenable map drag
        //         $scope.toggleGeoLocation(false);
        //     }
        // });

        //####################################################
        //######### show position of user ####################
        //####################################################

        // Show player position if button is pressed
        $scope.showUsersPosition = function () {
          console.log("showUsersPosition");
            if ($scope.showMarker == false) {
                $scope.showMarker = true;
                $scope.playerMarkerButtonColor = "button-balanced";

                if (typeof $scope.map.markers.PlayerPos != "undefined") {
                  console.log("$scope.map.markers.PlayerPos");
                  console.log($scope.map.markers.PlayerPos);
                    $scope.map.markers.PlayerPos.icon = {
                        iconUrl: './img/icons/Youarehere.png',
                        iconSize: [48, 48],
                        iconAnchor: [24, 48]
                    };
                    // Hide marker again after 5 seconds
                    $timeout(function () {
                        $scope.map.markers.PlayerPos.icon = {
                            iconUrl: './img/icons/marker-transparent.png'
                        };
                        $scope.playerMarkerButtonColor = "button-calm";
                        $scope.showMarker = false;
                    }, SenseBox.getConfig('playerLocationHintTimeout') * 1000);
                }
            }
        }

}])
