var NRS = (function (NRS, $, undefined) {
    NRS.initJay = function () {
        $(".advanced_info").html('<strong data-i18n="fee">Fee</strong>: <span class="advanced_fee">1 NXT</span>');
    }

    NRS.getJayCode = function (requestType, data, modal) {
        var trf;
        switch (requestType) {
            case "sendMoney":
                if (checkRecipient(data, modal) && checkAmount(data, modal)) {
                    var appendage = makeAppendage(data);
                    trf = Jay.sendMoney(data.recipient, data.amountNXT, appendage);
                }
                break;
            case "sendMessage":
                if (checkRecipient(data, modal)) {
                    //TODO - Jay.sendMessage already addAppendage to Jay.appendages.message
                    //var appendage;
                    //if (data.encrypt_message) {
                    //    appendage = Jay.addAppendage(Jay.appendages.encryptedMessage, data.message);
                    //}
                    //else {
                    //    appendage = Jay.addAppendage(Jay.appendages.encryptedMessage, data.message);
                    //}
                    trf = Jay.sendMessage(data.recipient, data.message, null);
                }
                break;
            case "setAccountInfo":
                trf = Jay.setAccountInfo(data.name, data.description, null);
                break;
            case "leaseBalance":
                if (checkRecipient(data, modal)) {
                    var appendage = makeAppendage(data);
                    trf = Jay.leaseBalance(data.recipient, data.period, appendage);
                }
                break;
            case "setAlias":
                if (checkAliasName(data, modal)) {
                    if (data.type == "account") {
                        data.aliasURI = "acct:" + data.aliasURI + "@nxt";
                    }
                    trf = Jay.setAlias(data.aliasName, data.aliasURI, null);
                }
                break;
            case "sellAlias":
                if (checkRecipient(data, modal)) {
                    var appendage = makeAppendage(data);
                    if (data.priceNQT) {
                        trf = Jay.sellAlias(data.aliasName, data.priceNQT, data.recipient, appendage);
                    } else if (data.priceNXT) {
                        trf = Jay.sellAlias(data.aliasName, data.priceNXT, data.recipient, appendage);
                    }
                }
                break;
            case "buyAlias":
                var appendage = makeAppendage(data);
                trf = Jay.buyAlias(data.aliasName, data.amountNXT, data.recipient, appendage);
                break;
            case "issueAsset":
                if (checkAssetName(data, modal) && checkDescription(data, modal) && checkIssueAssetQuantity(data, modal)) {
                    trf = Jay.issueAsset(data.name, data.description, data.quantity, data.decimals, null);
                }
                break;
            case "orderAsset":
                switch (data.asset_order_type) {
                    case "placeBidOrder":
                        trf = Jay.placeBidOrder(data.asset, data.quantityQNT, data.priceNQT);
                        break;
                    case "placeAskOrder":
                        trf = Jay.placeAskOrder(data.asset, data.quantityQNT, data.priceNQT);
                        break;
                }
                break;
            case "transferAsset":
                if (checkRecipient(data, modal) && checkQuantity(data, modal)) {
                    var appendage = makeAppendage(data);
                    var quantityQNT;
                    if (data.quantityQNT) {
                        quantityQNT = data.quantityQNT;
                    } else {
                        quantityQNT = NRS.convertToQNT(data.quantity, data.decimals);
                    }
                    trf = Jay.transferAsset(data.recipient, data.asset, quantityQNT, appendage);
                }
                break;
            case "cancelOrder":
                switch (data.cancel_order_type) {
                    case "cancelAskOrder":
                        trf = Jay.cancelAskOrder(data.order);
                        break;
                    case "cancelBidOrder":
                        trf = Jay.cancelBidOrder(data.order);
                        break;
                }
                break;
            case "dgsPurchase":
                var appendage = makeAppendage(data);
                trf = Jay.dgsPurchase(data.goods, data.quantity, data.priceNQT, appendage);
                break;
            case "dgsListing":
                if (checkName(data, modal) && checkDescription(data, modal) && checkPrice(data, modal) && checkDgsListingQuantity(data, modal) && checkProductTag(data,modal)) {
                    var appendage = makeAppendage(data);
                    trf = Jay.dgsListing(data.name, data.description, data.tags, data.quantity, data.priceNXT, appendage);
                    break;
                }
            case "dgsPriceChange":
                if (checkPrice(data, modal) && checkPriceMin(data, modal, 1)) {
                    trf = Jay.dgsPriceChange(data.goods, data.priceNXT);
                }
                break;
            case "dgsQuantityChange":
                if (checkDgsListingQuantity(data, modal)) {
                    trf = Jay.dgsQuantityChange(data.goods, data.quantity);
                }
                break;
            case "dgsDelisting":
                trf = Jay.dgsDelisting(data.goods);
                break;
            case "dgsDelivery":
                trf = Jay.dgsDelivery(data.purchase, data.discountNXT);
                break;
            case "dgsRefund":
                var appendage = makeAppendage(data);
                trf = Jay.dgsRefund(data.purchase, data.refundNXT, appendage);
                break;
            case "dgsFeedback":
                trf = Jay.dgsFeedback(data.purchase, data.message);
                break;
            default:
                NRS.submitForm(modal);
                break;
        }

        if (trf) {
            showTrf(trf, modal);
        } else {
            showTrf('', modal);
        }
    }
    NRS.jayMgwVerifyDepositAddr = function (e) {
        var transaction = $(e.currentTarget).data("transaction");
        var trf = Jay.verifyMgwDepositAddrV1(transaction, $("#mgw_coin_deposit_addr").text().trim(), NRS.accountRS);
        NRS.showTftModal(trf);
    }
    NRS.showTftModal = function (trf) {
        if (trf) {
            $("#jay_code_qr").empty().qrcode({
                "text": trf,
                "width": 256,
                "height": 256
            }).show();
            $("#jay_code").val(trf);
            $('#jay_modal').modal('show');
        }
    }

    function checkRecipient(data, modal) {
        NRS.checkRecipient(data.recipient, modal);
        var address = new NxtAddress();
        if (address.set(data.recipient)) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkAmount(data, modal) {
        if (data.amountNXT) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_incorrect_name", { "name": $.t("amount")}), modal);
            return false;
        }
    }

    function checkQuantity(data, modal) {
        if (data.quantity || data.quantityQNT) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_not_specified", { "name": $.t("quantity")}), modal);
            return false;
        }
    }

    function checkAliasName(data, modal) {
        if (data.aliasName) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_not_specified", { "name": $.t("alias_name") }), modal);
            return false;
        }
    }

    function checkAssetName(data, modal) {
        if (data.name) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_incorrect_name", { "name": $.t("asset_name") }), modal);
            return false;
        }
    }

    function checkDescription(data, modal) {
        if (data.description) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_description_required"), modal);
            return false;
        }
    }

    function checkIssueAssetQuantity(data, modal) {
        if (data.quantity) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_whole_quantity"), modal);
            return false;
        }
    }

    function checkPrice(data, modal) {
        if (data.priceNXT || data.priceNQT) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_incorrect_name", { "name": $.t("price") }), modal);
            return false;
        }
    }

    function checkName(data, modal) {
        if (data.name) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_not_specified", { "name": $.t("name") }), modal);
            return false;
        }
    }

    function checkProductTag(data, modal) {
        var result = false;
        if (data.tags) {
            data.tags = data.tags.toLowerCase();

            var tags = data.tags.split(",");

            if (tags.length > 3) {
                showErrorMsg($.t("error_max_tags", { "nr": 3 }), modal);
            } else {
                var clean_tags = [];

                for (var i = 0; i < tags.length; i++) {
                    var tag = $.trim(tags[i]);

                    if (tag.length < 3 || tag.length > 20) {
                        showErrorMsg($.t("error_incorrect_tag_length", { "min": 3, "max": 20 }), modal);
                        return false;
                    } else if (!tag.match(/^[a-z]+$/i)) {
                        showErrorMsg($.t("error_incorrect_tag_alpha"), modal);
                        return false;
                    } else if (clean_tags.indexOf(tag) > -1) {
                        showErrorMsg($.t("error_duplicate_tags"), modal);
                        return false;
                    } else {
                        clean_tags.push(tag);
                    }
                }
                showErrorMsg("", modal);
                result = true;
            }
        } else {
            result = true;
        }
        return result;
    }

    function checkDgsListingQuantity(data, modal) {
        var result = false;
        if (data.quantity) {
            if (data.quantity < 1) {
                showErrorMsg($.t("error_min_value", {
                    "field": $.t("quantity"),
                    "min": 1
                }), modal);
            }
            else {
                try{
                    converters.int32ToBytes(data.quantity);
                    showErrorMsg("", modal);
                    result = true;
                }
                catch(err){
                    showErrorMsg($.t("error_invalid_field", { "field": $.t("quantity") }), modal);
                }
            }
        } else {
            showErrorMsg($.t("error_not_specified", { "name": $.t("quantity") }), modal);
        }
        return result;
    }

    function checkPriceMin(data, modal, min) {
        if (data.priceNXT >= min) {
            showErrorMsg("", modal);
            return true;
        } else {
            showErrorMsg($.t("error_min_value", {
                "field": $.t("price"),
                "min": min
            }), modal);
            return false;
        }
    }

    function showErrorMsg(msg, modal) {
        if (msg) {
            modal.find(".error_message").first().html(msg).show(); 
        } else {
            modal.find(".error_message").first().hide();
        }
    }

    function showTrf(trf,modal) {
        var name = modal.attr('id').replace('_modal', '');

        if (trf) {
            $("#" + name + "_jay_tx").val(trf);
 $("#" + name + "_jay_tx").parent().append("<div class='img-responsive text-center' style='margin-top:10px;' id='jay_qr_"+name+"'></div>");
            $("#jay_qr_"+name).empty().qrcode({
            "text": trf,
            "width": 256,
            "height": 256
        });  
            $(".jay-tx").show();
        } else {
            $("#" + name + "_jay_tx").val('');
            $(".jay-tx").hide();
        }
    }

    function makeAppendage(data) {
        var appendage;
        if (data.message) {
            if (data.encrypt_message) {
                appendage = Jay.addAppendage(Jay.appendages.encryptedMessage, data.message);
            }
            else {
                appendage = Jay.addAppendage(Jay.appendages.message, data.message);
            }
        }
        return appendage;
    }
    return NRS;
}(NRS || {}, jQuery));