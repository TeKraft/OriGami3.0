// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'naif.base64', 'ngMdIcons', 'pascalprecht.translate', 'ngSanitize',
    'ionic-material', 'starter.controllers', 'starter.services', 'starter.directives',
    'ngCordova', 'ngAnimate', 'ngFileUpload', 'ngCookies', 'LocalForageModule', 'nemLogging', 'ui-leaflet'])
.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins
            .Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }
    });
})
.config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
    for (lang in translations) {
        $translateProvider.translations(lang, translations[lang]);
    }
    $translateProvider.preferredLanguage('en');
    $translateProvider.fallbackLanguage('en');
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('sanitize');
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.tabs.position('bottom');

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        // setup an abstract state for the tabs directive
        .state('tab', {
            url: '/tab',
            abstract: true,
            views: {
                '': {
                    controller: 'TabCtrl',
                    templateUrl: 'templates/tabs.html'
                }
            }
        })

        // Each tab has its own nav history stack:
        .state('tab.info', {
            url: '/info',
            views: {
                'tab-info': {
                    templateUrl: 'templates/info.html'
                }
            }
        })
        .state('tab.languages', {
            url: '/languages',
            views: {
                'languages-tab': {
                    templateUrl: 'templates/languages.html'
                }
            }
        })
        .state('tab.leaders', {
            url: '/leaders',
            cache: false,
            views: {
                'leaders-tab': {
                    templateUrl: 'templates/leaders.html'
                }
            }
        })
        .state('tab.stats', {
            url: '/stats',
            cache: false,
            views: {
                'stat-tab': {
                    templateUrl: 'templates/statistics.html'
                }
            }
        })
        .state('tab.home', {
            url: '/home',
            views: {
                'tab-home': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('tab.logout', {
            url: '/home',
            views: {
                'tab-home': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })

        .state('tab.avgames', {
            url: '/avgames',
            cache: false,
            views: {
                'tab-home': {
                    templateUrl: 'templates/av-games.html',
                    controller: 'GamesCtrl'
                }
            }
        })
        .state('tab.teachmenu', {
            url: '/teachmenu',
            views: {
                'tab-home': {
                    templateUrl: 'templates/teach-menu.html',
                    controller: 'TeacherCtrl'
                }
            }
        })

        /* Test State : Create new Game  -------------------- */
        .state('tab.creategame', {
            url: '/creategame',
            views: {
                'tab-home': {
                    templateUrl: 'templates/creategame.html',
                    controller: 'TeacherCtrl'
                }
            }
        })
        /* --------------------------------------------------- */

        .state('tab.editgame', {
            url: '/editgame/:gameId',
            views: {
                'tab-home': {
                    templateUrl: 'templates/game-edition.html',
                    controller: 'TeacherCtrl'
                }
            }
        })
        .state('tab.newgame', {
            url: '/teachmenu/newgame',
            views: {
                'tab-home': {
                    templateUrl: 'templates/new-game.html',
                    controller: 'NewGameCtrl'
                }
            }
        })


        .state('tab.playgame', {
            url: '/playgame/:gameName',
            views: {
                'tab-home': {
                    templateUrl: 'templates/play-game.html',
                    controller: 'PlayCtrl'
                }
            }
        })

        // Creation of task - Aided navigation and Path planning
        .state('tab.aidnavig', {
            url: "/aidnavig",
            views: {
                'tab-home': {
                    templateUrl: "templates/map/aid_navig.html",
                    controller: 'aidController'
                }
            }
        })
        .state('tab.pathplan', {
            url: "/pathplan",
            views: {
                'tab-home': {
                    templateUrl: "templates/map/path_plan.html",
                    controller: 'pathController'
                }
            }
        })
        .state('tab.tasktype', {
            url: "/tasktype",
            views: {
                'tab-home': {
                    templateUrl: "templates/tasks/task-type.html",
                    controller: 'NewGameCtrl'
                }
            }
        })
        // States, responsible for TASK creation
        .state('tab.georef', {
            url: "/georef",
            views: {
                'tab-home': {
                    templateUrl: "templates/tasks/georef.html",
                    controller: 'NewGameCtrl'
                }
            }
        })
        .state('tab.quest', {
            url: "/quest",
            views: {
                'tab-home': {
                    templateUrl: "templates/tasks/quest.html",
                    controller: 'NewGameCtrl'
                }
            }
        })

        // ########################################################
        // starting templates for usermanagement/ OriGami-Base-Game
        // ########################################################

        // abstract for all "acc"-tabs
        .state('acc', {
            url: '/acc',
            abstract: true,
            views: {
                '': {
                    controller: 'TabCtrl',
                    templateUrl: 'templates/acc-tabs.html'
                }
            }
        })

        .state('acc.log', {
            url: '/log',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc-log.html',
                    controller: 'LoginCtrl',
                    controllerAs: "vm"
                }
            }
        })

        .state('acc.afterlogin', {
            url: '/afterlogin',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/after-login.html',
                    controller: 'AfterloginCtrl',
                    controllerAs: "vm"
                }
            }
        })

        // ########################################################
        // starting templates for user-game-management
        // ########################################################

        .state('acc.account-view', {
            url: '/account', //     /:accusername',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/profil-view.html',
                    controller: 'AccountCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        .state('acc.friend-view', {
            url: '/friendaccount/:friend', //     /:accusername',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc-friendaccount.html',
                    controller: 'FriendCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        .state('acc.register', {
            url: '/register', //     /:accusername',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc-register.html',
                    controller: 'RegisterCtrl',
                    controllerAs: "vm"
                }
            }
        })
        .state('acc.changeUser', {
            url: '/changeUser',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc-changeuser.html',
                    controller: 'AccountCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        // play game
        .state('acc.mygames', {
            url: '/mygames',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-mygames.html',
                    controller: 'ProfGamesCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        // see created games
        .state('acc.createdgames', {
            url: '/createdgames',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-createdgames.html',
                    controller: 'ProfTeacherCtrl',
                    controllerAs: 'vm'
                }
            }
        })

        /* Test State : Create new Game  -------------------- */
        .state('acc.createmygame', {
            url: '/createmygame',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-createmygame.html',
                    controller: 'ProfTeacherCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        /* --------------------------------------------------- */

        .state('acc.editmygame', {
            url: '/editmygame/:gameId',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-editmygame.html',
                    controller: 'ProfTeacherCtrl'
                }
            }
        })
        .state('acc.mynewgame', {
            url: '/teachmenu/mynewgame',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-mynewgame.html',
                    controller: 'ProfNewGameCtrl'
                }
            }
        })

        .state('acc.playmygame', {
            url: '/playmygame/:userName/:gameName',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-playmygame.html',
                    controller: 'ProfPlayCtrl',
                }
            }
        })

        .state('acc.chooseGameMode', {
            url: '/chooseGameMode',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-chooseGameMode.html',
                    controller: 'ProfGamesCtrl',
                    controllerAs: 'vm'
                }
            }
        })

        .state('acc.FFAgame', {
            url: '/FFA/:userName',
            views: {
                'tab-acc': {
                    templateUrl: 'templates/acc/acc-FFAgame.html',
                    controller: 'FFACtrl',
                    controllerAs: 'vm'
                }
            }
        })

        // ########################################################
        // starting templates for usermanagement creating games
        // ########################################################
        // // Creation of task - Aided navigation and Path planning
        // .state('tab.aidnavig', {
        //     url: "/aidnavig",
        //     views: {
        //         'tab-home': {
        //             templateUrl: "templates/map/aid_navig.html",
        //             controller: 'aidController'
        //         }
        //     }
        // })
        // .state('tab.pathplan', {
        //     url: "/pathplan",
        //     views: {
        //         'tab-home': {
        //             templateUrl: "templates/map/path_plan.html",
        //             controller: 'pathController'
        //         }
        //     }
        // })
        // .state('tab.tasktype', {
        //     url: "/tasktype",
        //     views: {
        //         'tab-home': {
        //             templateUrl: "templates/tasks/task-type.html",
        //             controller: 'NewGameCtrl'
        //         }
        //     }
        // })
        // // States, responsible for TASK creation
        // .state('tab.georef', {
        //     url: "/georef",
        //     views: {
        //         'tab-home': {
        //             templateUrl: "templates/tasks/georef.html",
        //             controller: 'NewGameCtrl'
        //         }
        //     }
        // })
        // .state('tab.quest', {
        //     url: "/quest",
        //     views: {
        //         'tab-home': {
        //             templateUrl: "templates/tasks/quest.html",
        //             controller: 'NewGameCtrl'
        //         }
        //     }
        // })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');    // TODO: '/acc/log'
})

.config(['$localForageProvider', function ($localForageProvider) {
    // set defaults for creation of new localForage
    $localForageProvider.config(
        {
            driver: localforage.INDEXEDDB,
            // storeName: 'playerdata',
            // description: 'keep track of gameplay and movement'
        }
    );
}])

.config(function ($logProvider) {
    $logProvider.debugEnabled(false);
});
