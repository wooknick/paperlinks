import { KCI_KEY } from "./api";
import { xml2js } from "xml-js";

let searchTerm = "";
let resultCount = "20";
let contentIndex = 0;
let page = 1;
let url = "";
let contents = [];

const convertToCorsUrl = url => {
    var protocol = window.location.protocol === "http:" ? "http:" : "https:";
    return protocol + "//cors-anywhere.herokuapp.com/" + url;
};
const makeURL = term => {
    // url = `http://api.dbpia.co.kr/v2/search/search.json?searchall=${searchTerm}&target=se&pagecount=${pageCount}&key=${API_KEY}`;
    url = `http://open.kci.go.kr/po/openapi/openApiSearch.kci?apiCode=articleSearch&key=${KCI_KEY}&title=${term}&displayCount=${resultCount}&page=${page}`;
    return url;
};

const shuffle = array => {
    array.sort(() => Math.random() - 0.5);
};

// jquery init
$(() => {
    $("#help").on("mouseover", e => {
        // e.preventDefault();
        $("#guide").show();
    });
    $("#help").on("mouseout", e => {
        // e.preventDefault();
        $("#guide").hide();
    });
    // $("#searchButton").on("click", () => {
    //     // searchTerm = $(".searchTerm").val();
    //     contents = doSearch(searchTerm);
    //     // console.log(data);
    // });
    // $("#refresh").css("visibility", "visible");
});

var bigpicture = (function() {
    "use strict";

    const searchBtn = document.getElementById("searchButton");
    const searchInput = document.getElementById("searchTerm");
    const refreshBtn = document.getElementById("refresh");
    const eraseBtn = document.getElementById("erase");
    /*
     * INITIALIZATION
     */

    var bpContainer = document.getElementById("bigpicture-container"),
        bp = document.getElementById("bigpicture");

    if (!bp) {
        return;
    }

    bp.setAttribute("spellcheck", false);

    var params = {
        x: getQueryVariable("x"),
        y: getQueryVariable("y"),
        zoom: getQueryVariable("zoom")
    };

    var current = {};
    current.x = params.x ? parseFloat(params.x) : $(bp).data("x");
    current.y = params.y ? parseFloat(params.y) : $(bp).data("y");
    current.zoom = params.zoom ? parseFloat(params.zoom) : $(bp).data("zoom");

    bp.x = 0;
    bp.y = 0;
    bp.updateContainerPosition = function() {
        bp.style.left = bp.x + "px";
        bp.style.top = bp.y + "px";
    };

    /*
     * TEXT BOXES
     */

    $(".text").each(function() {
        updateTextPosition(this);
    }); // initialization
    $(".block").each(() => {
        updateBlockPosition(this);
    });

    $(bp).on("blur", ".text", function() {
        if (
            $(this)
                .text()
                .replace(/^\s+|\s+$/g, "") === ""
        ) {
            $(this).remove();
        }
    });

    $(bp).on("input", ".text", function() {
        redoSearch = true;
    });

    function updateTextPosition(e) {
        e.style.fontSize = $(e).data("size") / current.zoom + "px";
        e.style.left = ($(e).data("x") - current.x) / current.zoom - bp.x + "px";
        e.style.top = ($(e).data("y") - current.y) / current.zoom - bp.y + "px";
    }

    function updateBlockPosition(e) {
        e.style.fontSize = $(e).data("fsize") / current.zoom + "px";
        e.style.left = ($(e).data("x") - current.x) / current.zoom - bp.x + "px";
        e.style.top = ($(e).data("y") - current.y) / current.zoom - bp.y + "px";
        e.style.width = ($(e).data("lsize") / current.zoom) * 10 + "px";
        e.style.height = $(e).data("lsize") / current.zoom + "px";
    }

    function newText(x, y, size, text) {
        var tb = document.createElement("div");
        tb.className = "text";
        tb.contentEditable = true;
        tb.innerHTML = text;
        $(tb)
            .data("x", x)
            .data("y", y)
            .data("size", size);
        updateTextPosition(tb);
        bp.appendChild(tb);
        return tb;
    }

    function newBlock(x, y, fsize, lsize, title, author) {
        var tb = document.createElement("div");
        tb.className = "block";
        var tt = document.createElement("div");
        tt.innerHTML = title;
        tt.className = "__title";
        var ta = document.createElement("span");
        ta.innerHTML = author;
        tb.appendChild(tt);
        tb.appendChild(ta);

        $(tb)
            .data("x", x)
            .data("y", y)
            .data("fsize", fsize)
            .data("lsize", lsize);
        updateBlockPosition(tb);
        bp.appendChild(tb);
        return tb;
    }

    bpContainer.onclick = function(e) {
        if (isContainedByClass(e.target, "block")) {
            return;
        } else if (contentIndex >= resultCount) {
            alert("새 데이터를 가져오세요.");
        }
        const { author, title, abstract } = parceItem(contents[contentIndex]);
        newBlock(
            current.x + e.offsetX * current.zoom,
            current.y + e.offsetY * current.zoom,
            20,
            100,
            title,
            author
        ).focus();
        contentIndex++;
    };
    const doSearch = term => {
        fetch(convertToCorsUrl(makeURL(term)))
            .then(resp => resp.text())
            .then(xml => {
                const jsobject = xml2js(xml, { compact: true, spaces: 4 });
                const {
                    MetaData: {
                        outputData: { record }
                    }
                } = jsobject;
                contents = record;
            });
    };
    const parceItem = item => {
        const { articleInfo } = item;
        const abstracts = articleInfo["abstract-group"]["abstract"];
        const authors = articleInfo["author-group"]["author"];
        const titles = articleInfo["title-group"]["article-title"];
        let abstract, author, title;
        if (abstracts === {}) {
            abstract = "";
        } else if (Array.isArray(abstracts)) {
            abstract = abstracts[0]["_cdata"];
        } else {
            abstract = abstracts["_cdata"];
        }
        if (authors === {}) {
            author = "";
        } else if (Array.isArray(authors)) {
            author = authors[0]["_text"];
        } else {
            author = authors["_text"];
        }
        if (titles === {}) {
            title = "";
        } else if (Array.isArray(titles)) {
            title = titles[0]["_cdata"];
        } else {
            title = titles["_cdata"];
        }
        return { abstract, author, title };
    };

    searchBtn.onclick = function(e) {
        searchTerm = searchInput.value;
        page = 1;
        contentIndex = 0;
        doSearch(searchTerm);
        shuffle(contents);
        $("#refresh").css("visibility", "visible");
    };

    refreshBtn.onclick = function(e) {
        page++;
        searchTerm = searchInput.value;
        contentIndex = 0;
        doSearch(searchTerm);
        shuffle(contents);
    };

    eraseBtn.onclick = function(e) {
        $(".block").remove();
    };

    /*
     * PAN AND MOVE
     */

    var movingText = null,
        dragging = false,
        previousMousePosition;

    bpContainer.onmousedown = function(e) {
        if ($(e.target).hasClass("text") && (e.ctrlKey || e.metaKey)) {
            movingText = e.target;
            movingText.className = "text noselect notransition";
        } else {
            movingText = null;
            dragging = true;
        }
        biggestPictureSeen = false;
        previousMousePosition = { x: e.pageX, y: e.pageY };
    };

    window.onmouseup = function() {
        dragging = false;
        if (movingText) {
            movingText.className = "text";
        }
        movingText = null;
    };

    bpContainer.ondragstart = function(e) {
        e.preventDefault();
    };

    bpContainer.onmousemove = function(e) {
        if (dragging && !e.shiftKey) {
            // SHIFT prevents panning / allows selection
            bp.style.transitionDuration = "0s";
            bp.x += e.pageX - previousMousePosition.x;
            bp.y += e.pageY - previousMousePosition.y;
            bp.updateContainerPosition();
            current.x -= (e.pageX - previousMousePosition.x) * current.zoom;
            current.y -= (e.pageY - previousMousePosition.y) * current.zoom;
            previousMousePosition = { x: e.pageX, y: e.pageY };
        }
        if (movingText) {
            $(movingText).data(
                "x",
                $(movingText).data("x") + (e.pageX - previousMousePosition.x) * current.zoom
            );
            $(movingText).data(
                "y",
                $(movingText).data("y") + (e.pageY - previousMousePosition.y) * current.zoom
            );
            updateTextPosition(movingText);
            previousMousePosition = { x: e.pageX, y: e.pageY };
        }
    };

    /*
     * ZOOM
     */

    bpContainer.ondblclick = function(e) {
        e.preventDefault();
        // onZoom(
        //     e.ctrlKey || e.metaKey ? current.zoom * 1.1 * 1.1 : current.zoom / 1.1 / 1.1,
        //     current.x + e.clientX * current.zoom,
        //     current.y + e.clientY * current.zoom,
        //     e.clientX,
        //     e.clientY
        // );
    };

    var biggestPictureSeen = false,
        previous;

    function onZoom(zoom, wx, wy, sx, sy) {
        // zoom on (wx, wy) (world coordinates) which will be placed on (sx, sy) (screen coordinates)
        wx = typeof wx === "undefined" ? current.x + (window.innerWidth / 2) * current.zoom : wx;
        wy = typeof wy === "undefined" ? current.y + (window.innerHeight / 2) * current.zoom : wy;
        sx = typeof sx === "undefined" ? window.innerWidth / 2 : sx;
        sy = typeof sy === "undefined" ? window.innerHeight / 2 : sy;

        bp.style.transitionDuration = "0.2s";

        bp.x = 0;
        bp.y = 0;
        bp.updateContainerPosition();
        current.x = wx - sx * zoom;
        current.y = wy - sy * zoom;
        current.zoom = zoom;

        $(".text").each(function() {
            updateTextPosition(this);
        });
        $(".block").each(function() {
            updateBlockPosition(this);
        });

        biggestPictureSeen = false;
    }

    function zoomOnText(res) {
        onZoom($(res).data("size") / 20, $(res).data("x"), $(res).data("y"));
    }

    function seeBiggestPicture(e) {
        e.preventDefault();
        document.activeElement.blur();
        function universeboundingrect() {
            var minX = Infinity,
                maxX = -Infinity,
                minY = Infinity,
                maxY = -Infinity;
            var texteelements = document.getElementsByClassName("text");
            [].forEach.call(texteelements, function(elt) {
                var rect2 = elt.getBoundingClientRect();
                var rect = {
                    left: $(elt).data("x"),
                    top: $(elt).data("y"),
                    right:
                        rect2.width > 2 && rect2.width < 10000
                            ? current.x + rect2.right * current.zoom
                            : $(elt).data("x") + (300 * $(elt).data("size")) / 20,
                    bottom:
                        rect2.height > 2 && rect2.height < 10000
                            ? current.y + rect2.bottom * current.zoom
                            : $(elt).data("y") + (100 * $(elt).data("size")) / 20
                };
                if (rect.left < minX) {
                    minX = rect.left;
                }
                if (rect.right > maxX) {
                    maxX = rect.right;
                }
                if (rect.top < minY) {
                    minY = rect.top;
                }
                if (rect.bottom > maxY) {
                    maxY = rect.bottom;
                }
            });
            return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
        }

        var texts = document.getElementsByClassName("text");
        if (texts.length === 0) {
            return;
        }
        if (texts.length === 1) {
            zoomOnText(texts[0]);
            return;
        }

        if (!biggestPictureSeen) {
            previous = { x: current.x, y: current.y, zoom: current.zoom };
            var rect = universeboundingrect();
            var zoom =
                Math.max(
                    (rect.maxX - rect.minX) / window.innerWidth,
                    (rect.maxY - rect.minY) / window.innerHeight
                ) * 1.1;
            onZoom(zoom, (rect.minX + rect.maxX) / 2, (rect.minY + rect.maxY) / 2);
            biggestPictureSeen = true;
        } else {
            onZoom(previous.zoom, previous.x, previous.y, 0, 0);
            biggestPictureSeen = false;
        }
    }

    /*
     * SEARCH
     */

    var results = { index: -1, elements: [], text: "" },
        redoSearch = true,
        query;

    function find(txt) {
        results = { index: -1, elements: [], text: txt };
        $(".text").each(function() {
            if (
                $(this)
                    .text()
                    .toLowerCase()
                    .indexOf(txt.toLowerCase()) != -1
            ) {
                results.elements.push(this);
            }
        });
        if (results.elements.length > 0) {
            results.index = 0;
        }
    }

    function findNext(txt) {
        if (!txt || txt.replace(/^\s+|\s+$/g, "") === "") {
            return;
        } // empty search
        if (results.index == -1 || results.text != txt || redoSearch) {
            find(txt);
            if (results.index == -1) {
                return;
            } // still no results
            redoSearch = false;
        }
        var res = results.elements[results.index];
        zoomOnText(res);
        results.index += 1;
        if (results.index == results.elements.length) {
            results.index = 0;
        } // loop
    }

    /*
     * MOUSEWHEEL
     */

    var mousewheeldelta = 0,
        last_e,
        mousewheeltimer = null,
        mousewheel;

    if (navigator.appVersion.indexOf("Mac") != -1) {
        // Mac OS X
        mousewheel = function(e) {
            e.preventDefault();
            mousewheeldelta += Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
            last_e = e;
            if (!mousewheeltimer) {
                mousewheeltimer = setTimeout(function() {
                    onZoom(
                        mousewheeldelta > 0 ? current.zoom / 1.2 : current.zoom * 1.2,
                        current.x + last_e.clientX * current.zoom,
                        current.y + last_e.clientY * current.zoom,
                        last_e.clientX,
                        last_e.clientY
                    );
                    mousewheeldelta = 0;
                    mousewheeltimer = null;
                }, 70);
            }
        };
    } else {
        mousewheel = function(e) {
            e.preventDefault();
            var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
            onZoom(
                delta > 0 ? current.zoom / 1.2 : current.zoom * 1.2,
                current.x + e.clientX * current.zoom,
                current.y + e.clientY * current.zoom,
                e.clientX,
                e.clientY
            );
        };
    }

    if ("onmousewheel" in document) {
        bpContainer.onmousewheel = mousewheel;
    } else {
        bpContainer.addEventListener("DOMMouseScroll", mousewheel, false);
    }

    /*
     * KEYBOARD SHORTCUTS
     */

    window.onkeydown = function(e) {
        if (
            (((e.ctrlKey && !e.altKey) || e.metaKey) &&
                (e.keyCode == 61 ||
                    e.keyCode == 187 ||
                    e.keyCode == 171 ||
                    e.keyCode == 107 ||
                    e.key == "+" ||
                    e.key == "=")) || // CTRL+PLUS or COMMAND+PLUS
            e.keyCode == 34
        ) {
            // PAGE DOWN     // !e.altKey to prevent catching of ALT-GR
            e.preventDefault();
            onZoom(current.zoom / 1.7);
            return;
        }
        if (
            (((e.ctrlKey && !e.altKey) || e.metaKey) &&
                (e.keyCode == 54 ||
                    e.keyCode == 189 ||
                    e.keyCode == 173 ||
                    e.keyCode == 167 ||
                    e.keyCode == 109 ||
                    e.keyCode == 169 ||
                    e.keyCode == 219 ||
                    e.key == "-")) || // CTRL+MINUS or COMMAND+MINUS
            e.keyCode == 33
        ) {
            // PAGE UP
            e.preventDefault();
            onZoom(current.zoom * 1.7);
            return;
        }
        if (((e.ctrlKey && !e.altKey) || e.metaKey) && e.keyCode == 70) {
            // CTRL+F
            e.preventDefault();
            setTimeout(function() {
                query = window.prompt("What are you looking for?", "");
                findNext(query);
            }, 10);
            return;
        }
        if (e.keyCode == 114) {
            // F3
            e.preventDefault();
            if (results.index == -1) {
                setTimeout(function() {
                    query = window.prompt("What are you looking for?", "");
                    findNext(query);
                }, 10);
            } else {
                findNext(query);
            }
            return;
        }
        if (e.keyCode == 113) {
            // F2
            e.preventDefault();
            seeBiggestPicture(e);
            return;
        }
    };

    /*
     * USEFUL FUNCTIONS
     */

    function isContainedByClass(e, cls) {
        while (e && e.tagName) {
            if (e.classList.contains(cls)) {
                return true;
            }
            e = e.parentNode;
        }
        return false;
    }

    function getQueryVariable(id) {
        var params = window.location.search.substring(1).split("&");
        for (var i = 0; i < params.length; i++) {
            var p = params[i].split("=");
            if (p[0] == id) {
                return p[1];
            }
        }
        return false;
    }

    /*
     * API
     */

    return { newText: newText, current: current, updateTextPosition: updateTextPosition };
})();
