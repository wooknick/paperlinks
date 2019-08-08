import { API_KEY } from "./api";

let searchTerm = "";
let pageCount = "5";
let url = "";

const convertToCorsUrl = url => {
    var protocol = window.location.protocol === "http:" ? "http:" : "https:";
    return protocol + "//cors-anywhere.herokuapp.com/" + url;
};

const doSearch = () => {
    fetch(convertToCorsUrl(url))
        .then(resp => resp.json())
        .then(data => {
            const [{ result }] = data;
            // console.log(result);
            // console.log(typeof result);
            printData(result);
        });
};
const makeURL = () => {
    url = `http://api.dbpia.co.kr/v2/search/search.json?searchall=${searchTerm}&target=se&pagecount=${pageCount}&key=${API_KEY}`;
};

const printData = datum => {
    const { item } = datum;
    item.map((data, i) => {
        const { title, authors } = data;
        const { name } = authors[0];
        console.log(title, name);
        // document.createElement("span");
        $(".result").append(`<span>${title} - ${name}\n</span>`);
    });
};

$(() => {
    $("#searchButton").on("click", () => {
        searchTerm = $(".searchTerm").val();
        makeURL();
        doSearch();
    });
});
