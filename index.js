// import { KCI_KEY } from "./api";
// import { xml2js } from "xml-js";

// let searchTerm = "";
// let resultCount = "5";
// let url = "";

// const convertToCorsUrl = url => {
//     var protocol = window.location.protocol === "http:" ? "http:" : "https:";
//     return protocol + "//cors-anywhere.herokuapp.com/" + url;
// };

// const doSearch = () => {
//     fetch(convertToCorsUrl(url))
//         .then(resp => resp.text())
//         .then(xml => {
//             const jsobject = xml2js(xml, { compact: true, spaces: 4 });
//             const {
//                 MetaData: {
//                     outputData: { record }
//                 }
//             } = jsobject;
//             console.log(record);
//             return record;
//         });
// };
// const makeURL = () => {
//     // url = `http://api.dbpia.co.kr/v2/search/search.json?searchall=${searchTerm}&target=se&pagecount=${pageCount}&key=${API_KEY}`;
//     url = `http://open.kci.go.kr/po/openapi/openApiSearch.kci?apiCode=articleSearch&key=${KCI_KEY}&title=${searchTerm}&displayCount=${resultCount}`;
// };

// const printData = items => {
//     items.map((item, i) => {
//         const { articleInfo } = item;
//         const abstracts = articleInfo["abstract-group"]["abstract"];
//         const authors = articleInfo["author-group"]["author"];
//         const titles = articleInfo["title-group"]["article-title"];
//         let abstract, author, title;
//         if (abstracts === {}) {
//             abstract = "";
//         } else if (Array.isArray(abstracts)) {
//             abstract = abstracts[0]["_cdata"];
//         } else {
//             abstract = abstracts["_cdata"];
//         }
//         if (authors === {}) {
//             author = "";
//         } else if (Array.isArray(authors)) {
//             author = authors[0]["_text"];
//         } else {
//             author = authors["_text"];
//         }
//         if (titles === {}) {
//             title = "";
//         } else if (Array.isArray(titles)) {
//             title = titles[0]["_cdata"];
//         } else {
//             title = titles["_cdata"];
//         }
//         console.log(abstract + "\n" + author + "\n" + title);
//         // document.createElement("span");
//         $("#bigpicture")
//             .append(`<div contenteditable="false" class="text" data-size="25" data-x="0" data-y="${i *
//             120}">
//         ${title} - ${author}
//     </div>`);
//     });
//     $(".text").each(function() {
//         updateTextPosition(this);
//     });
// };

// // jquery init
// $(() => {
//     $("#searchButton").on("click", () => {
//         searchTerm = $(".searchTerm").val();
//         makeURL();
//         doSearch();
//     });
// });
