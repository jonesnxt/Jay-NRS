/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

/**
 * @depends {nrs.js}
 */
var NRS = (function (NRS, $, undefined) {
    NRS.constants = {
        'DB_VERSION': 2,

        'PLUGIN_VERSION': 1,
        'MAX_INT_JAVA': 2147483647,
        'MIN_PRUNABLE_MESSAGE_LENGTH': 28,

        //Plugin launch status numbers
        'PL_RUNNING': 1,
        'PL_PAUSED': 2,
        'PL_DEACTIVATED': 3,
        'PL_HALTED': 4,

        //Plugin validity status codes
        'PV_VALID': 100,
        'PV_NOT_VALID': 300,
        'PV_UNKNOWN_MANIFEST_VERSION': 301,
        'PV_INCOMPATIBLE_MANIFEST_VERSION': 302,
        'PV_INVALID_MANIFEST_FILE': 303,
        'PV_INVALID_MISSING_FILES': 304,
        'PV_INVALID_JAVASCRIPT_FILE': 305,

        //Plugin NRS compatibility status codes
        'PNC_COMPATIBLE': 100,
        'PNC_COMPATIBILITY_MINOR_RELEASE_DIFF': 101,
        'PNC_COMPATIBILITY_WARNING': 200,
        'PNC_COMPATIBILITY_MAJOR_RELEASE_DIFF': 202,
        'PNC_NOT_COMPATIBLE': 300,
        'PNC_COMPATIBILITY_UNKNOWN': 301,
        'PNC_COMPATIBILITY_CLIENT_VERSION_TOO_OLD': 302,

        "VOTING_MODELS": {},

        'MIN_BALANCE_MODELS': {},

        'SERVER': {},
        'MAX_TAGGED_DATA_DATA_LENGTH': 0,
        "GENESIS": "",
        "GENESIS_RS": "",
        "EPOCH_BEGINNING": 0
    };

    NRS.loadServerConstants = function () {
        NRS.sendRequest("getConstants", {}, function (response) {
            if (response.genesisAccountId) {
                NRS.constants.SERVER = response;
                NRS.constants.VOTING_MODELS = response.votingModels;
                NRS.constants.MIN_BALANCE_MODELS = response.minBalanceModels;
                NRS.constants.MAX_TAGGED_DATA_DATA_LENGTH = response.maxTaggedDataDataLength;
                NRS.constants.GENESIS = response.genesisAccountId;
                NRS.constants.GENESIS_RS = NRS.convertNumericToRSAccountFormat(response.genesisAccountId);
                NRS.constants.EPOCH_BEGINNING = response.epochBeginning;
            }
        });
    };

    function getKeyByValue(map, value) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                if (value === map[key]) {
                    return key;
                }
            }
        }
        return null;
    }

    NRS.getVotingModelName = function (code) {
        return getKeyByValue(NRS.constants.VOTING_MODELS, code);
    };

    NRS.getVotingModelCode = function (name) {
        return NRS.constants.VOTING_MODELS[name];
    };

    NRS.getMinBalanceModelName = function (code) {
        return getKeyByValue(NRS.constants.MIN_BALANCE_MODELS, code);
    };

    NRS.getMinBalanceModelCode = function (name) {
        return NRS.constants.MIN_BALANCE_MODELS[name];
    };

    return NRS;
}(NRS || {}, jQuery));