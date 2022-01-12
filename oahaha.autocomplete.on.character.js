var $j = jQuery.noConflict();
var oahahaAutocompleteOnChar = (function() {
    "use strict";
    var scriptVersion = "1.0.0";
    var util = {
        version: "1.0.0",
        isDefinedAndNotNull: function(pInput) {
            if (typeof pInput !== "undefined" && pInput !== null) {
                return true;
            } else {
                return false;
            }
        },
        isAPEX: function() {
            if (typeof(apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        debug: {
            info: function(str) {
                if (util.isAPEX()) {
                    apex.debug.info(str);
                }
            },
            error: function(str) {
                if (util.isAPEX()) {
                    apex.debug.error(str);
                } else {
                    console.error(str);
                }
            }
        },
        link: function(link, tabbed) {
            if (tabbed) {
                window.open(link, "_blank");
            } else {
                return window.location = link;
            }
        },
        isTouchDevice: function() {
            return "ontouchstart" in window;
        },
        split: function(val) {
            return val.split(/\s+/);
        },
        extractLast: function(term) {
            return util.split(term).pop();
        }
    };

    return {

        initialize: function(itemId, ajaxId, items2Submit, autocompleteChar) {

            /***********************************************************************
             **
             ** function to get data from Apex
             **
             ***********************************************************************/
            function getData(f) {
                apex.server.plugin(
                    ajaxId, {
                        pageItems: items2Submit
                    }, {
                        success: function(d) {
                            f(d);
                        },
                        error: function(d) {
                            util.debug.error("Error while try to load data!");
                            util.debug.error(d.responseText);
                        },
                        dataType: "json"
                    });
            }

            getData(addAutocomplete);

            /***********************************************************************
             **
             ** Used to add autocomplete to item
             **
             ***********************************************************************/
            function addAutocomplete(dataJSON) {

                util.debug.info(dataJSON);
                for (const x in dataJSON.row) {
                    dataJSON.row[x].LABEL = autocompleteChar + dataJSON.row[x].LABEL
                }

                $j('#' + itemId).bind("keydown", function(event) {
                    if (event.keyCode === $j.ui.keyCode.TAB &&
                        $j(this).autocomplete("instance").menu.active) {
                        event.preventDefault();
                    }
                }).autocomplete({
                    minLength: 1,
                    source: function(request, response) {

                        // delegate back to autocomplete, but extract the last term
                        var lastword = util.extractLast($j.trim(request.term));

                        // Regexp for filtering those labels that start with '@'
                        var matcher = new RegExp("^" + $j.ui.autocomplete.escapeRegex(lastword), "i");
                        // Get all labels
                        var items = dataJSON.row;
                        util.debug.info(items);

                        var filterd = $j.grep(items, function(item) {
                            return matcher.test(item.LABEL);
                        });
                        response(filterd);
                    },
                    focus: function() {
                        // prevent value inserted on focus
                        return false;
                    },
                    select: function(event, ui) {
                        var terms = this.value.split(/(\s+)/);
                        // remove the current input
                        terms.pop();
                        // add the selected item
                        terms.push(ui.item.LABEL);
                        // add placeholder to get the comma-and-space at the end
                        terms.push("");
                        terms.forEach(function(part, index) {
                            if (this[index].includes(autocompleteChar)) {
                                if (!this[index].includes(" ")) {
                                    if (!this[index + 1].includes(" ")) {
                                        this[index] = this[index] + " ";
                                    }
                                }
                            }
                        }, terms);
                        this.value = terms.join("");
                        return false;
                    }
                });

                $j('#' + itemId).data("ui-autocomplete")._renderItem = function(ul, item) {
                    if (item.IMAGE == '') {
                        return $j('<li/>', { 'data-value': item.LABEL }).append($j('<a/>', { href: "#" }).append(item.LABEL))
                            .appendTo(ul);
                    } else {
                        return $j('<li/>', { 'data-value': item.LABEL }).append($j('<a/>', { href: "#" })
                                .append($j('<img/>', { src: item.IMAGE, style: "width:25px;height:25px" })).append(item.LABEL))
                            .appendTo(ul);
                    }

                }

            }
        }
    }
})();