(()=>{var e={184:(e,t)=>{var o;!function(){"use strict";var a={}.hasOwnProperty;function l(){for(var e=[],t=0;t<arguments.length;t++){var o=arguments[t];if(o){var n=typeof o;if("string"===n||"number"===n)e.push(o);else if(Array.isArray(o)){if(o.length){var s=l.apply(null,o);s&&e.push(s)}}else if("object"===n){if(o.toString!==Object.prototype.toString&&!o.toString.toString().includes("[native code]")){e.push(o.toString());continue}for(var r in o)a.call(o,r)&&o[r]&&e.push(r)}}}return e.join(" ")}e.exports?(l.default=l,e.exports=l):void 0===(o=function(){return l}.apply(t,[]))||(e.exports=o)}()}},t={};function o(a){var l=t[a];if(void 0!==l)return l.exports;var n=t[a]={exports:{}};return e[a](n,n.exports,o),n.exports}o.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return o.d(t,{a:t}),t},o.d=(e,t)=>{for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";const e=window.wp.element,t=window.wp.blocks,a=window.wp.primitives,l=JSON.parse('{"$schema":"https://json.schemastore.org/block.json","apiVersion":2,"name":"happyprime/content-aggregator","title":"Content Aggregator","category":"widgets","description":"A list of posts for a custom post type and/or taxonomy.","keywords":["recent","latest","custom","post type"],"attributes":{"customPostType":{"type":"string","default":"post,posts"},"taxonomies":{"type":"array","items":{"type":"object"}},"taxRelation":{"type":"string","default":""},"itemCount":{"type":"integer","default":3},"order":{"type":"string","default":"desc"},"orderBy":{"type":"string","default":"date"},"displayPostDate":{"type":"boolean","default":false},"postLayout":{"type":"string","default":"list"},"columns":{"type":"integer","default":2},"displayPostContent":{"type":"boolean","default":false},"postContent":{"type":"string","default":"excerpt"},"excerptLength":{"type":"number","default":55},"displayImage":{"type":"boolean","default":false},"imageSize":{"type":"string","default":"thumbnail"},"stickyPosts":{"type":"boolean","default":true},"addLinkToFeaturedImage":{"type":"boolean","default":false},"authors":{"type":"string"},"displayPostAuthor":{"type":"boolean","default":false},"orderByMetaKey":{"type":"string","default":""},"orderByMetaOrder":{"type":"string","default":""},"customTaxonomy":{},"termID":{"type":"number","default":0}},"supports":{"align":true,"html":false},"editorScript":"file:../../build/content-aggregator.js","editorStyle":"file:../../build/content-aggregator.css"}');var n=o(184),s=o.n(n);const r=window.wp.apiFetch;var c=o.n(r);const i=window.wp.blockEditor,m=window.wp.components,p=window.wp.data,u=window.wp.date,d=window.wp.hooks,g=window.wp.i18n,h=(0,e.createElement)(a.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,e.createElement)(a.Path,{d:"M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM15.5303 8.46967C15.8232 8.76256 15.8232 9.23744 15.5303 9.53033L13.0607 12L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7626 15.8232 14.4697 15.5303L12 13.0607L9.53033 15.5303C9.23744 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7626 8.46967 14.4697L10.9393 12L8.46967 9.53033C8.17678 9.23744 8.17678 8.76256 8.46967 8.46967C8.76256 8.17678 9.23744 8.17678 9.53033 8.46967L12 10.9393L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z"})),y=(0,e.createElement)(a.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"-2 -2 24 24"},(0,e.createElement)(a.Path,{d:"M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6zM10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6z"})),_=(0,e.createElement)(a.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},(0,e.createElement)(a.Path,{d:"m21.5 9.1-6.6-6.6-4.2 5.6c-1.2-.1-2.4.1-3.6.7-.1 0-.1.1-.2.1-.5.3-.9.6-1.2.9l3.7 3.7-5.7 5.7v1.1h1.1l5.7-5.7 3.7 3.7c.4-.4.7-.8.9-1.2.1-.1.1-.2.2-.3.6-1.1.8-2.4.6-3.6l5.6-4.1zm-7.3 3.5.1.9c.1.9 0 1.8-.4 2.6l-6-6c.8-.4 1.7-.5 2.6-.4l.9.1L15 4.9 19.1 9l-4.9 3.6z"})),b=(0,e.createElement)(a.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,e.createElement)(a.Path,{d:"M4 4v1.5h16V4H4zm8 8.5h8V11h-8v1.5zM4 20h16v-1.5H4V20zm4-8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"})),v=(0,e.createElement)(a.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},(0,e.createElement)(a.Path,{d:"m3 5c0-1.10457.89543-2 2-2h13.5c1.1046 0 2 .89543 2 2v13.5c0 1.1046-.8954 2-2 2h-13.5c-1.10457 0-2-.8954-2-2zm2-.5h6v6.5h-6.5v-6c0-.27614.22386-.5.5-.5zm-.5 8v6c0 .2761.22386.5.5.5h6v-6.5zm8 0v6.5h6c.2761 0 .5-.2239.5-.5v-6zm0-8v6.5h6.5v-6c0-.27614-.2239-.5-.5-.5z",fillRule:"evenodd",clipRule:"evenodd"})),f=window.wp.url,w=window.wp.coreData,x={who:"authors",per_page:-1,_fields:"id,name",context:"view"};function C({value:t,onChange:o}){const a=(0,p.useSelect)((e=>{const{getUsers:t}=e(w.store);return t(x)}),[]);if(!a)return null;const l=(e=>{const t=e?.reduce(((e,t)=>{const{mapById:o,mapByName:a,names:l}=e;return o[t.id]=t,a[t.name]=t,l.push(t.name),e}),{mapById:{},mapByName:{},names:[]});return{entities:e,...t}})(a),n=(t?t.toString().split(","):[]).reduce(((e,t)=>{const o=l.mapById[t];return o&&e.push({id:t,value:o.name}),e}),[]);return(0,e.createElement)(m.FormTokenField,{label:(0,g.__)("Authors"),value:n,suggestions:l.names,onChange:e=>{const t=Array.from(e.reduce(((e,t)=>{const o=((e,t)=>{const o=t?.id||e[t]?.id;if(o)return o})(l.mapByName,t);return o&&e.add(o),e}),new Set));o(t.join(","))}})}const E=window.wp.htmlEntities;function k(t){const{blockProps:o}=t,{attributes:a,setAttributes:l}=o,{customPostType:n,orderByMetaKey:s,orderByMetaOrder:r}=a,[i,p]=(0,e.useState)([]),u=(0,e.useRef)();return(0,e.useEffect)((()=>(u.current=!0,c()({path:(0,f.addQueryArgs)("/content-aggregator-block/v1/meta/",{post_type:n})}).then((e=>{if(u.current){const t=[{label:(0,g.__)("None"),value:""}],o=e.map((e=>({label:(0,E.decodeEntities)(e),value:e})));p(t.concat(o))}})).catch((()=>{u.current&&p([])})),()=>{u.current=!1})),[n]),(0,e.createElement)("div",{className:"happyprime-block-cab_meta-order-settings"},(0,e.createElement)(m.SelectControl,{className:"happyprime-block-cab_meta-order-key-select",label:(0,g.__)("Meta Key"),onChange:e=>l({orderByMetaKey:e}),options:i,value:s}),(0,e.createElement)(m.SelectControl,{className:"happyprime-block-cab_meta-order-order-select",label:(0,g.__)("Order"),onChange:e=>l({orderByMetaOrder:e}),options:[{label:(0,g.__)("ASC"),value:"ASC"},{label:(0,g.__)("DESC"),value:"DESC"}],value:r}))}function P(t){const{onChange:o,selectedTerms:a,taxonomy:l}=t,[n,s]=(0,e.useState)([]),r=(0,e.useRef)(),i=l.split(",")[1];return(0,e.useEffect)((()=>(r.current=!0,c()({path:(0,f.addQueryArgs)(`/wp/v2/${i}`,{per_page:-1})}).then((e=>{if(r.current){const t=e.map((e=>({label:(0,E.decodeEntities)(e.name),value:e.id})));s(t)}})).catch((()=>{r.current&&s([])})),()=>{r.current=!1})),[l]),(0,e.createElement)(m.SelectControl,{className:"happyprime-block-cab_taxonomy-term-select",help:(0,g.__)("Ctrl/Cmd + click to select/deselect multiple terms"),label:(0,g.__)("Term(s)"),multiple:!0,onChange:o,options:n,value:a})}const S={per_page:-1},T={slug:"",terms:[],operator:"IN"},N={from:[{type:"block",blocks:["core/latest-posts"],transform:e=>(0,t.createBlock)("happyprime/content-aggregator",{itemCount:e.postsToShow,order:e.order,orderBy:e.orderBy,displayPostDate:e.displayPostDate,postLayout:e.postLayout,columns:e.columns,displayPostContent:e.displayPostContent,postContent:e.displayPostContentRadio,excerptLength:e.excerptLength,displayImage:e.displayFeaturedImage,imageSize:e.featuredImageSizeSlug,stickyPosts:!1,addLinkToFeaturedImage:e.addLinkToFeaturedImage})},{type:"block",blocks:["happyprime/latest-custom-posts"],transform:e=>{const o=e.taxonomies&&0<e.taxonomies.length?e.taxonomies:e.customTaxonomy?"string"!=typeof e.customTaxonomy?e.customTaxonomy:[{slug:e.customTaxonomy,terms:[`${e.termID}`]}]:[];return(0,t.createBlock)("happyprime/content-aggregator",{customPostType:e.customPostType,taxonomies:o,taxRelation:e.taxRelation,itemCount:e.itemCount,order:e.order,orderBy:e.orderBy,displayPostDate:e.displayPostDate,postLayout:e.postLayout,columns:e.columns,displayPostContent:e.displayPostContent,postContent:e.postContent,excerptLength:e.excerptLength,displayImage:e.displayImage,imageSize:e.imageSize,stickyPosts:e.stickyPosts})}}]};(0,t.registerBlockType)(l,{icon:(0,e.createElement)(a.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,e.createElement)(a.Path,{d:"M11 7h6v2h-6zM11 11h6v2h-6zM11 15h6v2h-6zM7 7h2v2H7zM7 11h2v2H7zM7 15h2v2H7z"}),(0,e.createElement)(a.Path,{d:"M20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"})),transforms:N,edit:function(t){const{attributes:o,setAttributes:a}=t,{addLinkToFeaturedImage:l,authors:n,columns:r,customPostType:w,displayImage:x,displayPostAuthor:E,displayPostContent:N,displayPostDate:B,excerptLength:z,imageSize:A,itemCount:L,order:M,orderBy:I,orderByMetaKey:O,orderByMetaOrder:D,postContent:R,postLayout:V,stickyPosts:H,taxRelation:j,taxonomies:F}=o,G=w.split(",")[0],{postTypeOptions:$,taxonomyOptions:W,imageSizeOptions:K}=(0,p.useSelect)((e=>{const{getPostTypes:t,getTaxonomies:o}=e("core"),a=t(S),l=o(S),n=e("core/block-editor").getSettings().imageSizes,s=(0,d.applyFilters)("contentAggregatorBlock.ExcludePostTypes",["attachment"]),r=[],c=[],i=[];return a&&a.forEach((e=>{e.viewable&&e.rest_base&&!s.includes(e.slug)&&(r.push({label:e.labels.singular_name,value:e.slug}),G===e.slug&&e.taxonomies.length&&l&&(c.push({label:(0,g.__)("None"),value:""}),l.forEach((t=>{e.taxonomies.includes(t.slug)&&c.push({label:t.name,value:t.slug+","+t.rest_base})}))))})),n&&n.forEach((e=>{i.push({value:e.slug,label:e.name})})),{postTypeOptions:r,taxonomyOptions:c,imageSizeOptions:i}}),[G]),[Z,Q]=(0,e.useState)(""),q=(0,e.useRef)();(0,e.useEffect)((()=>{q.current=!0;const e={post_type:G,per_page:L,order:M,orderby:I};if("meta_value"===I&&O&&(e.meta_key=O,e.order=D),cabStickyPostSupport.includes(G)&&H&&(e.sticky_posts=!0),n&&(e.authors=n),F&&(e.taxonomies=F,j&&(e.tax_relation=j)),c()({path:(0,f.addQueryArgs)("/content-aggregator-block/v1/posts/",e)}).then((e=>{q.current&&Q(e)})).catch((()=>{q.current&&Q([])})),q.currrent&&(o.customTaxonomy||o.termID)){const e=[{slug:o.customTaxonomy,terms:[`${o.termID}`]}];a({taxonomies:e,customTaxonomy:void 0,termID:void 0})}return()=>{q.current=!1}}),[n,L,M,I,O,D,G,H,F,j]);const U=Array.isArray(Z)&&Z.length,J=(0,i.useBlockProps)({className:s()({"wp-block-latest-posts":!0,"happyprime-block-cab_error":!U,"cab-has-post-thumbnail":x,"cab-has-post-date":B,"cab-has-post-author":E,"cab-has-post-content":N&&"full_post"===R,"cab-has-post-excerpt":N&&"excerpt"===R,"is-grid":"grid"===V,[`columns-${r}`]:"grid"===V})}),X=(e,t,o)=>{let a;if(F?.length&&(a=Object.values({...F,[e]:{...F[e],[t]:o}})),"slug"===t&&(F?.length?o!==F[e].slug&&(a=Object.values({...a,[e]:{...a[e],terms:[],operator:void 0}})):a=[{slug:o,terms:[],operator:"IN"}]),"terms"===t){const t=F[e].operator?F[e].operator:"IN";a=Object.values({...a,[e]:{...a[e],operator:t}})}return a},Y=(t,o)=>{const l=1<t?.terms?.length?[{label:(0,g.__)("With any selected terms"),value:"IN"},{label:(0,g.__)("With all selected terms"),value:"AND"},{label:(0,g.__)("Without the selected terms"),value:"NOT IN"}]:[{label:(0,g.__)("With the selected term"),value:"IN"},{label:(0,g.__)("Without the selected term"),value:"NOT IN"}];return(0,e.createElement)("div",{className:"happyprime-block-cab_taxonomy-setting-wrapper"},0<o&&(0,e.createElement)(m.Button,{className:"happyprime-block-cab_taxonomy-remove-setting",icon:h,label:(0,g.__)("Remove taxonomy setting"),onClick:()=>{F.splice(o,1),a({taxonomies:[...F]}),1===F.length&&a({taxRelation:void 0})}}),(0,e.createElement)("div",{className:"happyprime-block-cab_taxonomy-setting"},(0,e.createElement)(m.SelectControl,{label:(0,g.__)("Taxonomy"),value:t.slug?t.slug:"",options:W,onChange:e=>{""===e?1===F.length?a({taxonomies:[]}):(F.splice(o,1),a({taxonomies:[...F]})):a({taxonomies:X(o,"slug",e)})}}),""!==t.slug&&(0,e.createElement)(P,{onChange:e=>a({taxonomies:X(o,"terms",e)}),selectedTerms:t.terms,taxonomy:t.slug}),""!==t.slug&&(0,e.createElement)(m.RadioControl,{label:(0,g.__)("Show posts:"),selected:t.operator,options:l,onChange:e=>a({taxonomies:X(o,"operator",e)})})))},ee=(0,e.createElement)(i.InspectorControls,null,(0,e.createElement)(m.PanelBody,{title:(0,g.__)("Settings"),className:"happyprime-block-cab"},"grid"===V&&(0,e.createElement)(m.RangeControl,{label:(0,g.__)("Columns"),value:r,onChange:e=>a({columns:e}),min:2,max:U?Math.min(6,Z.length):6,required:!0}),(0,e.createElement)(m.SelectControl,{help:(0,g.__)('WordPress contains different types of content which are divided into collections called "Post Types". Default types include blog posts and pages, though plugins may remove these or add others.'),label:(0,g.__)("Post Type"),value:w,options:$,onChange:e=>{a({customPostType:e,taxonomies:[]})}}),(0,e.createElement)(m.__experimentalNumberControl,{label:(0,g.__)("Number of Items"),value:L,onChange:e=>{a({itemCount:Number(e)})},min:1}),(0,e.createElement)(m.SelectControl,{key:"query-controls-order-select",label:(0,g.__)("Order By"),value:`${I}/${M}`,options:[{label:(0,g.__)("Published - Newest to Oldest"),value:"date/desc"},{label:(0,g.__)("Published - Oldest to Newest"),value:"date/asc"},{label:(0,g.__)("Modified - Newest to Oldest"),value:"modified/desc"},{label:(0,g.__)("Modified - Oldest to Newest"),value:"modified/asc"},{label:(0,g.__)("A → Z"),value:"title/asc"},{label:(0,g.__)("Z → A"),value:"title/desc"},{label:(0,g.__)("Random"),value:"rand/desc"},{label:(0,g.__)("Meta Value"),value:"meta_value/desc"},{label:(0,g.__)("Menu Order"),value:"menu_order/asc"}],onChange:e=>{const[t,o]=e.split("/"),l={};o!==M&&(l.order=o),t!==I&&(l.orderBy=t),(l.order||l.orderBy)&&a(l)}}),"meta_value"===I&&(0,e.createElement)(k,{blockProps:t}),cabStickyPostSupport.includes(w.split(",")[0])&&"date"===I&&(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Show sticky posts at the start of the set"),checked:H,onChange:e=>{a({stickyPosts:e})}})),(0,e.createElement)(m.PanelBody,{title:(0,g.__)("Filters"),className:"happyprime-block-cab"},(0,e.createElement)("div",{className:"happyprime-block-cab_taxonomy-settings"},(0,e.createElement)("p",null,(0,g.__)("Taxonomies")),0<F?.length?F.map(((e,t)=>Y(e,t))):Y(T,0),0<F?.length&&0<F[0]?.terms?.length&&(0,e.createElement)(m.Button,{className:"happyprime-block-cab_taxonomy-add-setting",icon:y,onClick:()=>{a({taxonomies:F.concat(T)}),j||a({taxRelation:"AND"})},text:(0,g.__)("Add more taxonomy settings")}),1<F?.length&&(0,e.createElement)("div",{className:"happyprime-block-cab_taxonomy-relation"},(0,e.createElement)("p",null,(0,g.__)("Taxonomy Settings Relationship")),(0,e.createElement)(m.RadioControl,{label:(0,g.__)("Show posts that match:"),selected:j,options:[{label:(0,g.__)('All settings ("AND")'),value:"AND"},{label:(0,g.__)('Any settings ("OR")'),value:"OR"}],onChange:e=>a({taxRelation:e})}))),(0,e.createElement)(C,{onChange:e=>a({authors:e}),value:n})),(0,e.createElement)(m.PanelBody,{title:(0,g.__)("Post Template"),className:"happyprime-block-cab"},(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Display post date"),checked:B,onChange:e=>a({displayPostDate:e})}),(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Display post author"),checked:E,onChange:e=>a({displayPostAuthor:e})}),(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Display post content"),checked:N,onChange:e=>a({displayPostContent:e})}),N&&(0,e.createElement)(m.RadioControl,{label:(0,g.__)("Show"),selected:R,options:[{label:(0,g.__)("Excerpt"),value:"excerpt"},{label:(0,g.__)("Full Post"),value:"full_post"}],onChange:e=>a({postContent:e})}),N&&"excerpt"===R&&(0,e.createElement)(m.RangeControl,{label:(0,g.__)("Max number of words in excerpt"),value:z,onChange:e=>a({excerptLength:e}),min:10,max:100}),(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Display featured image"),checked:x,onChange:e=>a({displayImage:e})}),x&&(0,e.createElement)(e.Fragment,null,(0,e.createElement)(m.SelectControl,{label:(0,g.__)("Image size"),onChange:e=>a({imageSize:e}),options:K,value:A}),(0,e.createElement)(m.ToggleControl,{label:(0,g.__)("Add link to featured image"),checked:l,onChange:e=>a({addLinkToFeaturedImage:e})}))));if(!U)return(0,e.createElement)("div",J,ee,(0,e.createElement)(m.Placeholder,{icon:_,label:(0,g.__)("Content Aggregator")},Array.isArray(Z)?(0,g.__)("No current items."):(0,e.createElement)(m.Spinner,null)));const te=Z.length>L?Z.slice(0,L):Z;return(0,e.createElement)(e.Fragment,null,ee,(0,e.createElement)(i.BlockControls,null,(0,e.createElement)(m.ToolbarGroup,{controls:[{icon:b,title:(0,g.__)("List View"),onClick:()=>a({postLayout:"list"}),isActive:"list"===V},{icon:v,title:(0,g.__)("Grid View"),onClick:()=>a({postLayout:"grid"}),isActive:"grid"===V}]})),(0,e.createElement)("ul",J,te.map((t=>(t=>{const a=t.title.trim(),n=document.createElement("div");n.innerHTML=t.excerpt;const s=n.textContent||n.innerText||"",r=(0,e.createElement)("li",null,(0,e.createElement)(m.Disabled,null,(0,e.createElement)("a",{href:t.link,rel:"noreferrer noopener"},a?(0,e.createElement)(e.RawHTML,null,a):(0,g.__)("(Untitled)"))),E&&t.author&&(0,e.createElement)("div",{className:"wp-block-latest-posts__post-author"},(0,e.createElement)("span",{className:"byline"},"By ",(0,e.createElement)("span",{className:"author"},t.author))),B&&t.date_gmt&&(0,e.createElement)("time",{dateTime:(0,u.format)("c",t.date_gmt),className:"wp-block-latest-posts__post-date"},(0,u.dateI18n)((0,u.__experimentalGetSettings)().formats.date,t.date_gmt)),x&&t.image[A]&&(0,e.createElement)("figure",{className:"wp-block-latest-posts__post-thumbnail"},l?(0,e.createElement)(m.Disabled,null,(0,e.createElement)("a",{href:t.link,rel:"noreferrer noopener"},(0,e.createElement)("img",{src:t.image[A],alt:""}))):(0,e.createElement)("img",{src:t.image[A],alt:""})),N&&"excerpt"===R&&(0,e.createElement)("div",{className:"wp-block-latest-posts__post-excerpt"},(0,e.createElement)(e.RawHTML,{key:"html"},z<s.trim().split(" ").length?s.trim().split(" ",z).join(" ")+"…":s.trim().split(" ",z).join(" "))),N&&"full_post"===R&&(0,e.createElement)("div",{className:"wp-block-latest-posts__post-full-content"},(0,e.createElement)(e.RawHTML,{key:"html"},t.content.trim())));return(0,d.applyFilters)("contentAggregatorBlock.itemHTML",r,t,o)})(t)))))}})})()})();