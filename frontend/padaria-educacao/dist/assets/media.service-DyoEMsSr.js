import{i as o,h as n}from"./index-D9cHVwAi.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=o("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=o("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=o("Music",[["path",{d:"M9 18V5l12-2v13",key:"1jmyc2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["circle",{cx:"18",cy:"16",r:"3",key:"1hluhg"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=o("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=o("Video",[["path",{d:"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5",key:"ftymec"}],["rect",{x:"2",y:"6",width:"14",height:"12",rx:"2",key:"158x01"}]]);async function g(e,t){const i=new FormData;return i.append("file",e),t!=null&&i.append("media_category_id",String(t)),(await n.post("/media",i,{headers:{"Content-Type":"multipart/form-data"}})).data}async function h(e){const t=new URLSearchParams;e!=null&&e.type&&t.set("type",e.type),e!=null&&e.source&&t.set("source",e.source),(e==null?void 0:e.category_id)!=null&&t.set("category_id",String(e.category_id)),e!=null&&e.per_page&&t.set("per_page",String(e.per_page)),e!=null&&e.page&&t.set("page",String(e.page));const i=t.toString(),c=i?`/media?${i}`:"/media";return(await n.get(c)).data}async function p(){return(await n.get("/media-categories")).data}async function f(e){return(await n.post("/media-categories",{name:e})).data}async function M(e,t){return(await n.patch(`/media/${e}`,t)).data}async function k(e){await n.delete(`/media/${e}`)}export{s as F,r as L,y as M,l as U,u as V,M as a,f as c,k as d,p as g,h as l,g as u};
