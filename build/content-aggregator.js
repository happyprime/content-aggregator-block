!function(){var e={0:function(e,t,o){"use strict";var a=window.wp.element,l=window.wp.blocks,n=window.wp.primitives,r=JSON.parse('{"$schema":"https://json.schemastore.org/block.json","apiVersion":2,"name":"happyprime/content-aggregator","title":"Content Aggregator","category":"widgets","description":"A list of posts for a custom post type and/or taxonomy.","keywords":["recent","latest","custom","post type"],"attributes":{"customPostType":{"type":"string","default":"post,posts"},"taxonomies":{"type":"array","items":{"type":"object"}},"taxRelation":{"type":"string","default":""},"itemCount":{"type":"integer","default":3},"order":{"type":"string","default":"desc"},"orderBy":{"type":"string","default":"date"},"displayPostDate":{"type":"boolean","default":false},"postLayout":{"type":"string","default":"list"},"columns":{"type":"integer","default":2},"displayPostContent":{"type":"boolean","default":false},"postContent":{"type":"string","default":"excerpt"},"excerptLength":{"type":"number","default":55},"displayImage":{"type":"boolean","default":false},"imageSize":{"type":"string","default":"thumbnail"},"stickyPosts":{"type":"boolean","default":true},"addLinkToFeaturedImage":{"type":"boolean","default":false},"orderByMetaKey":{"type":"string","default":""},"orderByMetaOrder":{"type":"string","default":""},"customTaxonomy":{},"termID":{"type":"number","default":0}},"supports":{"align":true,"html":false},"editorScript":"file:../../build/content-aggregator.js","editorStyle":"file:../../build/content-aggregator.css"}'),s=o(184),c=o.n(s),i=window.wp.apiFetch,m=o.n(i),p=window.wp.blockEditor,u=window.wp.components,d=window.wp.data,g=window.wp.date,y=window.wp.hooks,h=window.wp.i18n,_=(0,a.createElement)(n.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,a.createElement)(n.Path,{d:"M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM15.5303 8.46967C15.8232 8.76256 15.8232 9.23744 15.5303 9.53033L13.0607 12L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7626 15.8232 14.4697 15.5303L12 13.0607L9.53033 15.5303C9.23744 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7626 8.46967 14.4697L10.9393 12L8.46967 9.53033C8.17678 9.23744 8.17678 8.76256 8.46967 8.46967C8.76256 8.17678 9.23744 8.17678 9.53033 8.46967L12 10.9393L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z"})),b=(0,a.createElement)(n.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"-2 -2 24 24"},(0,a.createElement)(n.Path,{d:"M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6zM10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6z"})),v=(0,a.createElement)(n.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},(0,a.createElement)(n.Path,{d:"m21.5 9.1-6.6-6.6-4.2 5.6c-1.2-.1-2.4.1-3.6.7-.1 0-.1.1-.2.1-.5.3-.9.6-1.2.9l3.7 3.7-5.7 5.7v1.1h1.1l5.7-5.7 3.7 3.7c.4-.4.7-.8.9-1.2.1-.1.1-.2.2-.3.6-1.1.8-2.4.6-3.6l5.6-4.1zm-7.3 3.5.1.9c.1.9 0 1.8-.4 2.6l-6-6c.8-.4 1.7-.5 2.6-.4l.9.1L15 4.9 19.1 9l-4.9 3.6z"})),f=(0,a.createElement)(n.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,a.createElement)(n.Path,{d:"M4 4v1.5h16V4H4zm8 8.5h8V11h-8v1.5zM4 20h16v-1.5H4V20zm4-8c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"})),x=(0,a.createElement)(n.SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},(0,a.createElement)(n.Path,{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7.8 16.5H5c-.3 0-.5-.2-.5-.5v-6.2h6.8v6.7zm0-8.3H4.5V5c0-.3.2-.5.5-.5h6.2v6.7zm8.3 7.8c0 .3-.2.5-.5.5h-6.2v-6.8h6.8V19zm0-7.8h-6.8V4.5H19c.3 0 .5.2.5.5v6.2z",fillRule:"evenodd",clipRule:"evenodd"})),w=window.wp.url,C=window.wp.htmlEntities;function E(e){const{blockProps:t}=e,{attributes:o,setAttributes:l}=t,{customPostType:n,orderByMetaKey:r,orderByMetaOrder:s}=o,[c,i]=(0,a.useState)([]),p=(0,a.useRef)();return(0,a.useEffect)((()=>(p.current=!0,m()({path:(0,w.addQueryArgs)("/content-aggregator-block/v1/meta/",{post_type:n})}).then((e=>{if(p.current){const t=[{label:(0,h.__)("None"),value:""}],o=e.map((e=>({label:(0,C.decodeEntities)(e),value:e})));i(t.concat(o))}})).catch((()=>{p.current&&i([])})),()=>{p.current=!1})),[n]),(0,a.createElement)("div",{className:"happyprime-block-cab_meta-order-settings"},(0,a.createElement)(u.SelectControl,{className:"happyprime-block-cab_meta-order-key-select",label:(0,h.__)("Meta Key"),onChange:e=>l({orderByMetaKey:e}),options:c,value:r}),(0,a.createElement)(u.SelectControl,{className:"happyprime-block-cab_meta-order-order-select",label:(0,h.__)("Order"),onChange:e=>l({orderByMetaOrder:e}),options:[{label:(0,h.__)("ASC"),value:"ASC"},{label:(0,h.__)("DESC"),value:"DESC"}],value:s}))}function k(e){const{onChange:t,selectedTerms:o,taxonomy:l}=e,[n,r]=(0,a.useState)([]),s=(0,a.useRef)(),c=l.split(",")[1];return(0,a.useEffect)((()=>(s.current=!0,m()({path:(0,w.addQueryArgs)(`/wp/v2/${c}`,{per_page:-1})}).then((e=>{if(s.current){const t=e.map((e=>({label:(0,C.decodeEntities)(e.name),value:e.id})));r(t)}})).catch((()=>{s.current&&r([])})),()=>{s.current=!1})),[l]),(0,a.createElement)(u.SelectControl,{className:"happyprime-block-cab_taxonomy-term-select",help:(0,h.__)("Ctrl/Cmd + click to select multiple terms"),label:(0,h.__)("Term(s)"),multiple:!0,onChange:t,options:n,value:o})}const P={per_page:-1},S={slug:"",terms:[],operator:"IN"};var T={from:[{type:"block",blocks:["core/latest-posts"],transform:e=>(0,l.createBlock)("happyprime/content-aggregator",{itemCount:e.postsToShow,order:e.order,orderBy:e.orderBy,displayPostDate:e.displayPostDate,postLayout:e.postLayout,columns:e.columns,displayPostContent:e.displayPostContent,postContent:e.displayPostContentRadio,excerptLength:e.excerptLength,displayImage:e.displayFeaturedImage,imageSize:e.featuredImageSizeSlug,stickyPosts:!1,addLinkToFeaturedImage:e.addLinkToFeaturedImage})},{type:"block",blocks:["happyprime/latest-custom-posts"],transform:e=>{const t=e.taxonomies&&0<e.taxonomies.length?e.taxonomies:e.customTaxonomy?"string"!=typeof e.customTaxonomy?e.customTaxonomy:[{slug:e.customTaxonomy,terms:[`${e.termID}`]}]:[];return(0,l.createBlock)("happyprime/content-aggregator",{customPostType:e.customPostType,taxonomies:t,taxRelation:e.taxRelation,itemCount:e.itemCount,order:e.order,orderBy:e.orderBy,displayPostDate:e.displayPostDate,postLayout:e.postLayout,columns:e.columns,displayPostContent:e.displayPostContent,postContent:e.postContent,excerptLength:e.excerptLength,displayImage:e.displayImage,imageSize:e.imageSize,stickyPosts:e.stickyPosts})}}]};(0,l.registerBlockType)(r,{icon:(0,a.createElement)(n.SVG,{viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg"},(0,a.createElement)(n.Path,{d:"M11 7h6v2h-6zM11 11h6v2h-6zM11 15h6v2h-6zM7 7h2v2H7zM7 11h2v2H7zM7 15h2v2H7z"}),(0,a.createElement)(n.Path,{d:"M20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z"})),transforms:T,edit:function(e){const{attributes:t,setAttributes:o}=e,{addLinkToFeaturedImage:l,columns:n,customPostType:r,displayImage:s,displayPostContent:i,displayPostDate:C,excerptLength:T,imageSize:z,itemCount:N,order:B,orderBy:L,orderByMetaKey:M,orderByMetaOrder:A,postContent:I,postLayout:R,stickyPosts:O,taxRelation:D,taxonomies:V}=t,H=r.split(",")[0],{postTypeOptions:j,taxonomyOptions:F,imageSizeOptions:G}=(0,d.useSelect)((e=>{const{getPostTypes:t,getTaxonomies:o}=e("core"),a=t(P),l=o(P),n=e("core/block-editor").getSettings().imageSizes,r=(0,y.applyFilters)("contentAggregatorBlock.ExcludePostTypes",["attachment"]),s=[],c=[],i=[];return a&&a.forEach((e=>{e.viewable&&e.rest_base&&!r.includes(e.slug)&&(s.push({label:e.labels.singular_name,value:e.slug}),H===e.slug&&e.taxonomies.length&&l&&(c.push({label:(0,h.__)("None"),value:""}),l.forEach((t=>{t.visibility.public&&e.taxonomies.includes(t.slug)&&c.push({label:t.name,value:t.slug+","+t.rest_base})}))))})),n&&n.forEach((e=>{i.push({value:e.slug,label:e.name})})),{postTypeOptions:s,taxonomyOptions:c,imageSizeOptions:i}}),[H]),[$,K]=(0,a.useState)(""),W=(0,a.useRef)();(0,a.useEffect)((()=>{W.current=!0;const e={post_type:H,per_page:N,order:B,orderby:L};if("meta_value"===L&&M&&(e.meta_key=M,e.order=A),cabStickyPostSupport.includes(H)&&O&&(e.sticky_posts=!0),V&&(e.taxonomies=V,D&&(e.tax_relation=D)),m()({path:(0,w.addQueryArgs)("/content-aggregator-block/v1/posts/",e)}).then((e=>{W.current&&K(e)})).catch((()=>{W.current&&K([])})),W.currrent&&(t.customTaxonomy||t.termID)){const e=[{slug:t.customTaxonomy,terms:[`${t.termID}`]}];o({taxonomies:e,customTaxonomy:void 0,termID:void 0})}return()=>{W.current=!1}}),[N,B,L,M,A,H,O,V,D]);const Z=Array.isArray($)&&$.length,Q=(0,p.useBlockProps)({className:c()({"wp-block-latest-posts":!0,"happyprime-block-cab_error":!Z,"cab-has-post-thumbnail":s,"cab-has-post-date":C,"cab-has-post-content":i&&"full_post"===I,"cab-has-post-excerpt":i&&"excerpt"===I,"is-grid":"grid"===R,[`columns-${n}`]:"grid"===R})}),q=(e,t,o)=>{let a;if(void 0!==V&&V.length&&(a=Object.values({...V,[e]:{...V[e],[t]:o}})),"slug"===t&&(void 0!==V&&V.length?o!==V[e].slug&&(a=Object.values({...a,[e]:{...a[e],terms:[],operator:void 0}})):a=[{slug:o,terms:[],operator:"IN"}]),"terms"===t){const t=!V[e].operator&&1<o.length?"IN":1<o.length?V[e].operator:void 0;a=Object.values({...a,[e]:{...a[e],operator:t}})}return a},J=(e,t)=>(0,a.createElement)("div",{className:"happyprime-block-cab_taxonomy-setting-wrapper"},0<t&&(0,a.createElement)(u.Button,{className:"happyprime-block-cab_taxonomy-remove-setting",icon:_,label:(0,h.__)("Remove taxonomy setting"),onClick:()=>{V.splice(t,1),o({taxonomies:[...V]}),1===V.length&&o({taxRelation:void 0})}}),(0,a.createElement)("div",{className:"happyprime-block-cab_taxonomy-setting"},(0,a.createElement)(u.SelectControl,{label:(0,h.__)("Taxonomy"),value:e.slug?e.slug:"",options:F,onChange:e=>{""===e?1===V.length?o({taxonomies:[]}):(V.splice(t,1),o({taxonomies:[...V]})):o({taxonomies:q(t,"slug",e)})}}),""!==e.slug&&(0,a.createElement)(k,{onChange:e=>o({taxonomies:q(t,"terms",e)}),selectedTerms:e.terms,taxonomy:e.slug}),e.terms&&1<e.terms.length&&(0,a.createElement)(u.RadioControl,{label:(0,h.__)("Show posts:"),selected:e.operator,options:[{label:(0,h.__)("With any selected terms"),value:"IN"},{label:(0,h.__)("With all selected terms"),value:"AND"},{label:(0,h.__)("Without the selected terms"),value:"NOT IN"}],onChange:e=>o({taxonomies:q(t,"operator",e)})}))),U=(0,a.createElement)(p.InspectorControls,null,(0,a.createElement)(u.PanelBody,{title:(0,h.__)("Settings"),className:"happyprime-block-cab"},"grid"===R&&(0,a.createElement)(u.RangeControl,{label:(0,h.__)("Columns"),value:n,onChange:e=>o({columns:e}),min:2,max:Z?Math.min(6,$.length):6,required:!0}),(0,a.createElement)(u.SelectControl,{help:(0,h.__)('WordPress contains different types of content which are divided into collections called "Post Types". Default types include blog posts and pages, though plugins may remove these or add others.'),label:(0,h.__)("Post Type"),value:r,options:j,onChange:e=>{o({customPostType:e,taxonomies:[]})}}),(0,a.createElement)(u.RangeControl,{label:(0,h.__)("Number of Items"),value:N,onChange:e=>{o({itemCount:Number(e)})},min:1,max:100}),(0,a.createElement)(u.SelectControl,{key:"query-controls-order-select",label:(0,h.__)("Order By"),value:`${L}/${B}`,options:[{label:(0,h.__)("Newest to Oldest"),value:"date/desc"},{label:(0,h.__)("Oldest to Newest"),value:"date/asc"},{label:(0,h.__)("A → Z"),value:"title/asc"},{label:(0,h.__)("Z → A"),value:"title/desc"},{label:(0,h.__)("Random"),value:"rand/desc"},{label:(0,h.__)("Meta Value"),value:"meta_value/desc"}],onChange:e=>{const[t,a]=e.split("/"),l={};a!==B&&(l.order=a),t!==L&&(l.orderBy=t),(l.order||l.orderBy)&&o(l)}}),"meta_value"===L&&(0,a.createElement)(E,{blockProps:e}),cabStickyPostSupport.includes(r.split(",")[0])&&"date"===L&&(0,a.createElement)(u.ToggleControl,{label:(0,h.__)("Show sticky posts at the start of the set"),checked:O,onChange:e=>{o({stickyPosts:e})}})),(0,a.createElement)(u.PanelBody,{title:(0,h.__)("Filters"),className:"happyprime-block-cab"},(0,a.createElement)("div",{className:"happyprime-block-cab_taxonomy-settings"},(0,a.createElement)("p",null,(0,h.__)("Taxonomies")),V&&0<V.length?V.map(((e,t)=>J(e,t))):J(S,0),V&&0<V.length&&V[0].terms&&0<V[0].terms.length&&(0,a.createElement)(u.Button,{className:"happyprime-block-cab_taxonomy-add-setting",icon:b,onClick:()=>{o({taxonomies:V.concat(S)}),D||o({taxRelation:"AND"})},text:(0,h.__)("Add more taxonomy settings")}),V&&1<V.length&&(0,a.createElement)("div",{className:"happyprime-block-cab_taxonomy-relation"},(0,a.createElement)("p",null,(0,h.__)("Taxonomy Settings Relationship")),(0,a.createElement)(u.RadioControl,{label:(0,h.__)("Show posts that match:"),selected:D,options:[{label:(0,h.__)('All settings ("AND")'),value:"AND"},{label:(0,h.__)('Any settings ("OR")'),value:"OR"}],onChange:e=>o({taxRelation:e})})))),(0,a.createElement)(u.PanelBody,{title:(0,h.__)("Post Template"),className:"happyprime-block-cab"},(0,a.createElement)(u.ToggleControl,{label:(0,h.__)("Display post date"),checked:C,onChange:e=>o({displayPostDate:e})}),(0,a.createElement)(u.ToggleControl,{label:(0,h.__)("Display post content"),checked:i,onChange:e=>o({displayPostContent:e})}),i&&(0,a.createElement)(u.RadioControl,{label:(0,h.__)("Show"),selected:I,options:[{label:(0,h.__)("Excerpt"),value:"excerpt"},{label:(0,h.__)("Full Post"),value:"full_post"}],onChange:e=>o({postContent:e})}),i&&"excerpt"===I&&(0,a.createElement)(u.RangeControl,{label:(0,h.__)("Max number of words in excerpt"),value:T,onChange:e=>o({excerptLength:e}),min:10,max:100}),(0,a.createElement)(u.ToggleControl,{label:(0,h.__)("Display featured image"),checked:s,onChange:e=>o({displayImage:e})}),s&&(0,a.createElement)(a.Fragment,null,(0,a.createElement)(u.SelectControl,{label:(0,h.__)("Image size"),onChange:e=>o({imageSize:e}),options:G,value:z}),(0,a.createElement)(u.ToggleControl,{label:(0,h.__)("Add link to featured image"),checked:l,onChange:e=>o({addLinkToFeaturedImage:e})}))));if(!Z)return(0,a.createElement)("div",Q,U,(0,a.createElement)(u.Placeholder,{icon:v,label:(0,h.__)("Content Aggregator")},Array.isArray($)?(0,h.__)("No current items."):(0,a.createElement)(u.Spinner,null)));const X=$.length>N?$.slice(0,N):$;return(0,a.createElement)(a.Fragment,null,U,(0,a.createElement)(p.BlockControls,null,(0,a.createElement)(u.ToolbarGroup,{controls:[{icon:f,title:(0,h.__)("List View"),onClick:()=>o({postLayout:"list"}),isActive:"list"===R},{icon:x,title:(0,h.__)("Grid View"),onClick:()=>o({postLayout:"grid"}),isActive:"grid"===R}]})),(0,a.createElement)("ul",Q,X.map((e=>(e=>{const o=e.title.trim(),n=document.createElement("div");n.innerHTML=e.excerpt;const r=n.textContent||n.innerText||"",c=(0,a.createElement)("li",null,(0,a.createElement)(u.Disabled,null,(0,a.createElement)("a",{href:e.link,rel:"noreferrer noopener"},o?(0,a.createElement)(a.RawHTML,null,o):(0,h.__)("(Untitled)"))),C&&e.date_gmt&&(0,a.createElement)("time",{dateTime:(0,g.format)("c",e.date_gmt),className:"wp-block-latest-posts__post-date"},(0,g.dateI18n)((0,g.__experimentalGetSettings)().formats.date,e.date_gmt)),s&&e.image[z]&&(0,a.createElement)("figure",{className:"wp-block-latest-posts__post-thumbnail"},l?(0,a.createElement)(u.Disabled,null,(0,a.createElement)("a",{href:e.link,rel:"noreferrer noopener"},(0,a.createElement)("img",{src:e.image[z],alt:""}))):(0,a.createElement)("img",{src:e.image[z],alt:""})),i&&"excerpt"===I&&(0,a.createElement)("div",{className:"wp-block-latest-posts__post-excerpt"},(0,a.createElement)(a.RawHTML,{key:"html"},T<r.trim().split(" ").length?r.trim().split(" ",T).join(" ")+"…":r.trim().split(" ",T).join(" "))),i&&"full_post"===I&&(0,a.createElement)("div",{className:"wp-block-latest-posts__post-full-content"},(0,a.createElement)(a.RawHTML,{key:"html"},e.content.trim())));return(0,y.applyFilters)("contentAggregatorBlock.itemHTML",c,e,t)})(e)))))}})},184:function(e,t){var o;!function(){"use strict";var a={}.hasOwnProperty;function l(){for(var e=[],t=0;t<arguments.length;t++){var o=arguments[t];if(o){var n=typeof o;if("string"===n||"number"===n)e.push(o);else if(Array.isArray(o)){if(o.length){var r=l.apply(null,o);r&&e.push(r)}}else if("object"===n)if(o.toString===Object.prototype.toString)for(var s in o)a.call(o,s)&&o[s]&&e.push(s);else e.push(o.toString())}}return e.join(" ")}e.exports?(l.default=l,e.exports=l):void 0===(o=function(){return l}.apply(t,[]))||(e.exports=o)}()}},t={};function o(a){var l=t[a];if(void 0!==l)return l.exports;var n=t[a]={exports:{}};return e[a](n,n.exports,o),n.exports}o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,{a:t}),t},o.d=function(e,t){for(var a in t)o.o(t,a)&&!o.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o(0)}();