(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=s(i);fetch(i.href,r)}})();/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function xs(e){const t=Object.create(null);for(const s of e.split(","))t[s]=1;return s=>s in t}const V={},gt=[],Se=()=>{},Sn=()=>!1,Kt=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&(e.charCodeAt(2)>122||e.charCodeAt(2)<97),Cs=e=>e.startsWith("onUpdate:"),J=Object.assign,ws=(e,t)=>{const s=e.indexOf(t);s>-1&&e.splice(s,1)},Ti=Object.prototype.hasOwnProperty,j=(e,t)=>Ti.call(e,t),k=Array.isArray,mt=e=>Wt(e)==="[object Map]",Ei=e=>Wt(e)==="[object Set]",A=e=>typeof e=="function",Q=e=>typeof e=="string",lt=e=>typeof e=="symbol",G=e=>e!==null&&typeof e=="object",Mn=e=>(G(e)||A(e))&&A(e.then)&&A(e.catch),Oi=Object.prototype.toString,Wt=e=>Oi.call(e),Pi=e=>Wt(e).slice(8,-1),Ai=e=>Wt(e)==="[object Object]",Ss=e=>Q(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,vt=xs(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),qt=e=>{const t=Object.create(null);return s=>t[s]||(t[s]=e(s))},Ri=/-\w/g,Be=qt(e=>e.replace(Ri,t=>t.slice(1).toUpperCase())),ki=/\B([A-Z])/g,Xe=qt(e=>e.replace(ki,"-$1").toLowerCase()),Tn=qt(e=>e.charAt(0).toUpperCase()+e.slice(1)),Zt=qt(e=>e?`on${Tn(e)}`:""),Ue=(e,t)=>!Object.is(e,t),es=(e,...t)=>{for(let s=0;s<e.length;s++)e[s](...t)},En=(e,t,s,n=!1)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,writable:n,value:s})},Ii=e=>{const t=parseFloat(e);return isNaN(t)?e:t};let Ys;const Gt=()=>Ys||(Ys=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Ms(e){if(k(e)){const t={};for(let s=0;s<e.length;s++){const n=e[s],i=Q(n)?ji(n):Ms(n);if(i)for(const r in i)t[r]=i[r]}return t}else if(Q(e)||G(e))return e}const Fi=/;(?![^(]*\))/g,Ni=/:([^]+)/,Li=/\/\*[^]*?\*\//g;function ji(e){const t={};return e.replace(Li,"").split(Fi).forEach(s=>{if(s){const n=s.split(Ni);n.length>1&&(t[n[0].trim()]=n[1].trim())}}),t}function Ts(e){let t="";if(Q(e))t=e;else if(k(e))for(let s=0;s<e.length;s++){const n=Ts(e[s]);n&&(t+=n+" ")}else if(G(e))for(const s in e)e[s]&&(t+=s+" ");return t.trim()}const Di="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",$i=xs(Di);function On(e){return!!e||e===""}/**
* @vue/reactivity v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let oe;class Hi{constructor(t=!1){this.detached=t,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=oe,!t&&oe&&(this.index=(oe.scopes||(oe.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let t,s;if(this.scopes)for(t=0,s=this.scopes.length;t<s;t++)this.scopes[t].pause();for(t=0,s=this.effects.length;t<s;t++)this.effects[t].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let t,s;if(this.scopes)for(t=0,s=this.scopes.length;t<s;t++)this.scopes[t].resume();for(t=0,s=this.effects.length;t<s;t++)this.effects[t].resume()}}run(t){if(this._active){const s=oe;try{return oe=this,t()}finally{oe=s}}}on(){++this._on===1&&(this.prevScope=oe,oe=this)}off(){this._on>0&&--this._on===0&&(oe=this.prevScope,this.prevScope=void 0)}stop(t){if(this._active){this._active=!1;let s,n;for(s=0,n=this.effects.length;s<n;s++)this.effects[s].stop();for(this.effects.length=0,s=0,n=this.cleanups.length;s<n;s++)this.cleanups[s]();if(this.cleanups.length=0,this.scopes){for(s=0,n=this.scopes.length;s<n;s++)this.scopes[s].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!t){const i=this.parent.scopes.pop();i&&i!==this&&(this.parent.scopes[this.index]=i,i.index=this.index)}this.parent=void 0}}}function Ui(){return oe}let B;const ts=new WeakSet;class Pn{constructor(t){this.fn=t,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,oe&&oe.active&&oe.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,ts.has(this)&&(ts.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Rn(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Js(this),kn(this);const t=B,s=ue;B=this,ue=!0;try{return this.fn()}finally{In(this),B=t,ue=s,this.flags&=-3}}stop(){if(this.flags&1){for(let t=this.deps;t;t=t.nextDep)Ps(t);this.deps=this.depsTail=void 0,Js(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?ts.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){fs(this)&&this.run()}get dirty(){return fs(this)}}let An=0,bt,_t;function Rn(e,t=!1){if(e.flags|=8,t){e.next=_t,_t=e;return}e.next=bt,bt=e}function Es(){An++}function Os(){if(--An>0)return;if(_t){let t=_t;for(_t=void 0;t;){const s=t.next;t.next=void 0,t.flags&=-9,t=s}}let e;for(;bt;){let t=bt;for(bt=void 0;t;){const s=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(n){e||(e=n)}t=s}}if(e)throw e}function kn(e){for(let t=e.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function In(e){let t,s=e.depsTail,n=s;for(;n;){const i=n.prevDep;n.version===-1?(n===s&&(s=i),Ps(n),Bi(n)):t=n,n.dep.activeLink=n.prevActiveLink,n.prevActiveLink=void 0,n=i}e.deps=t,e.depsTail=s}function fs(e){for(let t=e.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(Fn(t.dep.computed)||t.dep.version!==t.version))return!0;return!!e._dirty}function Fn(e){if(e.flags&4&&!(e.flags&16)||(e.flags&=-17,e.globalVersion===wt)||(e.globalVersion=wt,!e.isSSR&&e.flags&128&&(!e.deps&&!e._dirty||!fs(e))))return;e.flags|=2;const t=e.dep,s=B,n=ue;B=e,ue=!0;try{kn(e);const i=e.fn(e._value);(t.version===0||Ue(i,e._value))&&(e.flags|=128,e._value=i,t.version++)}catch(i){throw t.version++,i}finally{B=s,ue=n,In(e),e.flags&=-3}}function Ps(e,t=!1){const{dep:s,prevSub:n,nextSub:i}=e;if(n&&(n.nextSub=i,e.prevSub=void 0),i&&(i.prevSub=n,e.nextSub=void 0),s.subs===e&&(s.subs=n,!n&&s.computed)){s.computed.flags&=-5;for(let r=s.computed.deps;r;r=r.nextDep)Ps(r,!0)}!t&&!--s.sc&&s.map&&s.map.delete(s.key)}function Bi(e){const{prevDep:t,nextDep:s}=e;t&&(t.nextDep=s,e.prevDep=void 0),s&&(s.prevDep=t,e.nextDep=void 0)}let ue=!0;const Nn=[];function Ae(){Nn.push(ue),ue=!1}function Re(){const e=Nn.pop();ue=e===void 0?!0:e}function Js(e){const{cleanup:t}=e;if(e.cleanup=void 0,t){const s=B;B=void 0;try{t()}finally{B=s}}}let wt=0;class Vi{constructor(t,s){this.sub=t,this.dep=s,this.version=s.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class As{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(t){if(!B||!ue||B===this.computed)return;let s=this.activeLink;if(s===void 0||s.sub!==B)s=this.activeLink=new Vi(B,this),B.deps?(s.prevDep=B.depsTail,B.depsTail.nextDep=s,B.depsTail=s):B.deps=B.depsTail=s,Ln(s);else if(s.version===-1&&(s.version=this.version,s.nextDep)){const n=s.nextDep;n.prevDep=s.prevDep,s.prevDep&&(s.prevDep.nextDep=n),s.prevDep=B.depsTail,s.nextDep=void 0,B.depsTail.nextDep=s,B.depsTail=s,B.deps===s&&(B.deps=n)}return s}trigger(t){this.version++,wt++,this.notify(t)}notify(t){Es();try{for(let s=this.subs;s;s=s.prevSub)s.sub.notify()&&s.sub.dep.notify()}finally{Os()}}}function Ln(e){if(e.dep.sc++,e.sub.flags&4){const t=e.dep.computed;if(t&&!e.dep.subs){t.flags|=20;for(let n=t.deps;n;n=n.nextDep)Ln(n)}const s=e.dep.subs;s!==e&&(e.prevSub=s,s&&(s.nextSub=e)),e.dep.subs=e}}const us=new WeakMap,Je=Symbol(""),ds=Symbol(""),St=Symbol("");function z(e,t,s){if(ue&&B){let n=us.get(e);n||us.set(e,n=new Map);let i=n.get(s);i||(n.set(s,i=new As),i.map=n,i.key=s),i.track()}}function Pe(e,t,s,n,i,r){const o=us.get(e);if(!o){wt++;return}const c=f=>{f&&f.trigger()};if(Es(),t==="clear")o.forEach(c);else{const f=k(e),p=f&&Ss(s);if(f&&s==="length"){const u=Number(n);o.forEach((h,w)=>{(w==="length"||w===St||!lt(w)&&w>=u)&&c(h)})}else switch((s!==void 0||o.has(void 0))&&c(o.get(s)),p&&c(o.get(St)),t){case"add":f?p&&c(o.get("length")):(c(o.get(Je)),mt(e)&&c(o.get(ds)));break;case"delete":f||(c(o.get(Je)),mt(e)&&c(o.get(ds)));break;case"set":mt(e)&&c(o.get(Je));break}}Os()}function et(e){const t=L(e);return t===e?t:(z(t,"iterate",St),de(e)?t:t.map(ke))}function Rs(e){return z(e=L(e),"iterate",St),e}function Le(e,t){return Ve(e)?Mt(st(e)?ke(t):t):ke(t)}const Ki={__proto__:null,[Symbol.iterator](){return ss(this,Symbol.iterator,e=>Le(this,e))},concat(...e){return et(this).concat(...e.map(t=>k(t)?et(t):t))},entries(){return ss(this,"entries",e=>(e[1]=Le(this,e[1]),e))},every(e,t){return Ee(this,"every",e,t,void 0,arguments)},filter(e,t){return Ee(this,"filter",e,t,s=>s.map(n=>Le(this,n)),arguments)},find(e,t){return Ee(this,"find",e,t,s=>Le(this,s),arguments)},findIndex(e,t){return Ee(this,"findIndex",e,t,void 0,arguments)},findLast(e,t){return Ee(this,"findLast",e,t,s=>Le(this,s),arguments)},findLastIndex(e,t){return Ee(this,"findLastIndex",e,t,void 0,arguments)},forEach(e,t){return Ee(this,"forEach",e,t,void 0,arguments)},includes(...e){return ns(this,"includes",e)},indexOf(...e){return ns(this,"indexOf",e)},join(e){return et(this).join(e)},lastIndexOf(...e){return ns(this,"lastIndexOf",e)},map(e,t){return Ee(this,"map",e,t,void 0,arguments)},pop(){return dt(this,"pop")},push(...e){return dt(this,"push",e)},reduce(e,...t){return zs(this,"reduce",e,t)},reduceRight(e,...t){return zs(this,"reduceRight",e,t)},shift(){return dt(this,"shift")},some(e,t){return Ee(this,"some",e,t,void 0,arguments)},splice(...e){return dt(this,"splice",e)},toReversed(){return et(this).toReversed()},toSorted(e){return et(this).toSorted(e)},toSpliced(...e){return et(this).toSpliced(...e)},unshift(...e){return dt(this,"unshift",e)},values(){return ss(this,"values",e=>Le(this,e))}};function ss(e,t,s){const n=Rs(e),i=n[t]();return n!==e&&!de(e)&&(i._next=i.next,i.next=()=>{const r=i._next();return r.done||(r.value=s(r.value)),r}),i}const Wi=Array.prototype;function Ee(e,t,s,n,i,r){const o=Rs(e),c=o!==e&&!de(e),f=o[t];if(f!==Wi[t]){const h=f.apply(e,r);return c?ke(h):h}let p=s;o!==e&&(c?p=function(h,w){return s.call(this,Le(e,h),w,e)}:s.length>2&&(p=function(h,w){return s.call(this,h,w,e)}));const u=f.call(o,p,n);return c&&i?i(u):u}function zs(e,t,s,n){const i=Rs(e);let r=s;return i!==e&&(de(e)?s.length>3&&(r=function(o,c,f){return s.call(this,o,c,f,e)}):r=function(o,c,f){return s.call(this,o,Le(e,c),f,e)}),i[t](r,...n)}function ns(e,t,s){const n=L(e);z(n,"iterate",St);const i=n[t](...s);return(i===-1||i===!1)&&Ns(s[0])?(s[0]=L(s[0]),n[t](...s)):i}function dt(e,t,s=[]){Ae(),Es();const n=L(e)[t].apply(e,s);return Os(),Re(),n}const qi=xs("__proto__,__v_isRef,__isVue"),jn=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(lt));function Gi(e){lt(e)||(e=String(e));const t=L(this);return z(t,"has",e),t.hasOwnProperty(e)}class Dn{constructor(t=!1,s=!1){this._isReadonly=t,this._isShallow=s}get(t,s,n){if(s==="__v_skip")return t.__v_skip;const i=this._isReadonly,r=this._isShallow;if(s==="__v_isReactive")return!i;if(s==="__v_isReadonly")return i;if(s==="__v_isShallow")return r;if(s==="__v_raw")return n===(i?r?nr:Bn:r?Un:Hn).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(n)?t:void 0;const o=k(t);if(!i){let f;if(o&&(f=Ki[s]))return f;if(s==="hasOwnProperty")return Gi}const c=Reflect.get(t,s,X(t)?t:n);if((lt(s)?jn.has(s):qi(s))||(i||z(t,"get",s),r))return c;if(X(c)){const f=o&&Ss(s)?c:c.value;return i&&G(f)?hs(f):f}return G(c)?i?hs(c):Is(c):c}}class $n extends Dn{constructor(t=!1){super(!1,t)}set(t,s,n,i){let r=t[s];const o=k(t)&&Ss(s);if(!this._isShallow){const p=Ve(r);if(!de(n)&&!Ve(n)&&(r=L(r),n=L(n)),!o&&X(r)&&!X(n))return p||(r.value=n),!0}const c=o?Number(s)<t.length:j(t,s),f=Reflect.set(t,s,n,X(t)?t:i);return t===L(i)&&(c?Ue(n,r)&&Pe(t,"set",s,n):Pe(t,"add",s,n)),f}deleteProperty(t,s){const n=j(t,s);t[s];const i=Reflect.deleteProperty(t,s);return i&&n&&Pe(t,"delete",s,void 0),i}has(t,s){const n=Reflect.has(t,s);return(!lt(s)||!jn.has(s))&&z(t,"has",s),n}ownKeys(t){return z(t,"iterate",k(t)?"length":Je),Reflect.ownKeys(t)}}class Qi extends Dn{constructor(t=!1){super(!0,t)}set(t,s){return!0}deleteProperty(t,s){return!0}}const Yi=new $n,Ji=new Qi,zi=new $n(!0);const ps=e=>e,kt=e=>Reflect.getPrototypeOf(e);function Xi(e,t,s){return function(...n){const i=this.__v_raw,r=L(i),o=mt(r),c=e==="entries"||e===Symbol.iterator&&o,f=e==="keys"&&o,p=i[e](...n),u=s?ps:t?Mt:ke;return!t&&z(r,"iterate",f?ds:Je),J(Object.create(p),{next(){const{value:h,done:w}=p.next();return w?{value:h,done:w}:{value:c?[u(h[0]),u(h[1])]:u(h),done:w}}})}}function It(e){return function(...t){return e==="delete"?!1:e==="clear"?void 0:this}}function Zi(e,t){const s={get(i){const r=this.__v_raw,o=L(r),c=L(i);e||(Ue(i,c)&&z(o,"get",i),z(o,"get",c));const{has:f}=kt(o),p=t?ps:e?Mt:ke;if(f.call(o,i))return p(r.get(i));if(f.call(o,c))return p(r.get(c));r!==o&&r.get(i)},get size(){const i=this.__v_raw;return!e&&z(L(i),"iterate",Je),i.size},has(i){const r=this.__v_raw,o=L(r),c=L(i);return e||(Ue(i,c)&&z(o,"has",i),z(o,"has",c)),i===c?r.has(i):r.has(i)||r.has(c)},forEach(i,r){const o=this,c=o.__v_raw,f=L(c),p=t?ps:e?Mt:ke;return!e&&z(f,"iterate",Je),c.forEach((u,h)=>i.call(r,p(u),p(h),o))}};return J(s,e?{add:It("add"),set:It("set"),delete:It("delete"),clear:It("clear")}:{add(i){!t&&!de(i)&&!Ve(i)&&(i=L(i));const r=L(this);return kt(r).has.call(r,i)||(r.add(i),Pe(r,"add",i,i)),this},set(i,r){!t&&!de(r)&&!Ve(r)&&(r=L(r));const o=L(this),{has:c,get:f}=kt(o);let p=c.call(o,i);p||(i=L(i),p=c.call(o,i));const u=f.call(o,i);return o.set(i,r),p?Ue(r,u)&&Pe(o,"set",i,r):Pe(o,"add",i,r),this},delete(i){const r=L(this),{has:o,get:c}=kt(r);let f=o.call(r,i);f||(i=L(i),f=o.call(r,i)),c&&c.call(r,i);const p=r.delete(i);return f&&Pe(r,"delete",i,void 0),p},clear(){const i=L(this),r=i.size!==0,o=i.clear();return r&&Pe(i,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(i=>{s[i]=Xi(i,e,t)}),s}function ks(e,t){const s=Zi(e,t);return(n,i,r)=>i==="__v_isReactive"?!e:i==="__v_isReadonly"?e:i==="__v_raw"?n:Reflect.get(j(s,i)&&i in n?s:n,i,r)}const er={get:ks(!1,!1)},tr={get:ks(!1,!0)},sr={get:ks(!0,!1)};const Hn=new WeakMap,Un=new WeakMap,Bn=new WeakMap,nr=new WeakMap;function ir(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function rr(e){return e.__v_skip||!Object.isExtensible(e)?0:ir(Pi(e))}function Is(e){return Ve(e)?e:Fs(e,!1,Yi,er,Hn)}function or(e){return Fs(e,!1,zi,tr,Un)}function hs(e){return Fs(e,!0,Ji,sr,Bn)}function Fs(e,t,s,n,i){if(!G(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const r=rr(e);if(r===0)return e;const o=i.get(e);if(o)return o;const c=new Proxy(e,r===2?n:s);return i.set(e,c),c}function st(e){return Ve(e)?st(e.__v_raw):!!(e&&e.__v_isReactive)}function Ve(e){return!!(e&&e.__v_isReadonly)}function de(e){return!!(e&&e.__v_isShallow)}function Ns(e){return e?!!e.__v_raw:!1}function L(e){const t=e&&e.__v_raw;return t?L(t):e}function lr(e){return!j(e,"__v_skip")&&Object.isExtensible(e)&&En(e,"__v_skip",!0),e}const ke=e=>G(e)?Is(e):e,Mt=e=>G(e)?hs(e):e;function X(e){return e?e.__v_isRef===!0:!1}function ee(e){return cr(e,!1)}function cr(e,t){return X(e)?e:new ar(e,t)}class ar{constructor(t,s){this.dep=new As,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=s?t:L(t),this._value=s?t:ke(t),this.__v_isShallow=s}get value(){return this.dep.track(),this._value}set value(t){const s=this._rawValue,n=this.__v_isShallow||de(t)||Ve(t);t=n?t:L(t),Ue(t,s)&&(this._rawValue=t,this._value=n?t:ke(t),this.dep.trigger())}}function fr(e){return X(e)?e.value:e}const ur={get:(e,t,s)=>t==="__v_raw"?e:fr(Reflect.get(e,t,s)),set:(e,t,s,n)=>{const i=e[t];return X(i)&&!X(s)?(i.value=s,!0):Reflect.set(e,t,s,n)}};function Vn(e){return st(e)?e:new Proxy(e,ur)}class dr{constructor(t,s,n){this.fn=t,this.setter=s,this._value=void 0,this.dep=new As(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=wt-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!s,this.isSSR=n}notify(){if(this.flags|=16,!(this.flags&8)&&B!==this)return Rn(this,!0),!0}get value(){const t=this.dep.track();return Fn(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function pr(e,t,s=!1){let n,i;return A(e)?n=e:(n=e.get,i=e.set),new dr(n,i,s)}const Ft={},Dt=new WeakMap;let Ye;function hr(e,t=!1,s=Ye){if(s){let n=Dt.get(s);n||Dt.set(s,n=[]),n.push(e)}}function gr(e,t,s=V){const{immediate:n,deep:i,once:r,scheduler:o,augmentJob:c,call:f}=s,p=E=>i?E:de(E)||i===!1||i===0?$e(E,1):$e(E);let u,h,w,S,R=!1,I=!1;if(X(e)?(h=()=>e.value,R=de(e)):st(e)?(h=()=>p(e),R=!0):k(e)?(I=!0,R=e.some(E=>st(E)||de(E)),h=()=>e.map(E=>{if(X(E))return E.value;if(st(E))return p(E);if(A(E))return f?f(E,2):E()})):A(e)?t?h=f?()=>f(e,2):e:h=()=>{if(w){Ae();try{w()}finally{Re()}}const E=Ye;Ye=u;try{return f?f(e,3,[S]):e(S)}finally{Ye=E}}:h=Se,t&&i){const E=h,q=i===!0?1/0:i;h=()=>$e(E(),q)}const Y=Ui(),N=()=>{u.stop(),Y&&Y.active&&ws(Y.effects,u)};if(r&&t){const E=t;t=(...q)=>{E(...q),N()}}let $=I?new Array(e.length).fill(Ft):Ft;const K=E=>{if(!(!(u.flags&1)||!u.dirty&&!E))if(t){const q=u.run();if(i||R||(I?q.some((pe,ae)=>Ue(pe,$[ae])):Ue(q,$))){w&&w();const pe=Ye;Ye=u;try{const ae=[q,$===Ft?void 0:I&&$[0]===Ft?[]:$,S];$=q,f?f(t,3,ae):t(...ae)}finally{Ye=pe}}}else u.run()};return c&&c(K),u=new Pn(h),u.scheduler=o?()=>o(K,!1):K,S=E=>hr(E,!1,u),w=u.onStop=()=>{const E=Dt.get(u);if(E){if(f)f(E,4);else for(const q of E)q();Dt.delete(u)}},t?n?K(!0):$=u.run():o?o(K.bind(null,!0),!0):u.run(),N.pause=u.pause.bind(u),N.resume=u.resume.bind(u),N.stop=N,N}function $e(e,t=1/0,s){if(t<=0||!G(e)||e.__v_skip||(s=s||new Map,(s.get(e)||0)>=t))return e;if(s.set(e,t),t--,X(e))$e(e.value,t,s);else if(k(e))for(let n=0;n<e.length;n++)$e(e[n],t,s);else if(Ei(e)||mt(e))e.forEach(n=>{$e(n,t,s)});else if(Ai(e)){for(const n in e)$e(e[n],t,s);for(const n of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,n)&&$e(e[n],t,s)}return e}/**
* @vue/runtime-core v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Ot(e,t,s,n){try{return n?e(...n):e()}catch(i){Qt(i,t,s)}}function Me(e,t,s,n){if(A(e)){const i=Ot(e,t,s,n);return i&&Mn(i)&&i.catch(r=>{Qt(r,t,s)}),i}if(k(e)){const i=[];for(let r=0;r<e.length;r++)i.push(Me(e[r],t,s,n));return i}}function Qt(e,t,s,n=!0){const i=t?t.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=t&&t.appContext.config||V;if(t){let c=t.parent;const f=t.proxy,p=`https://vuejs.org/error-reference/#runtime-${s}`;for(;c;){const u=c.ec;if(u){for(let h=0;h<u.length;h++)if(u[h](e,f,p)===!1)return}c=c.parent}if(r){Ae(),Ot(r,null,10,[e,f,p]),Re();return}}mr(e,s,i,n,o)}function mr(e,t,s,n=!0,i=!1){if(i)throw e;console.error(e)}const se=[];let ye=-1;const nt=[];let je=null,tt=0;const Kn=Promise.resolve();let $t=null;function vr(e){const t=$t||Kn;return e?t.then(this?e.bind(this):e):t}function br(e){let t=ye+1,s=se.length;for(;t<s;){const n=t+s>>>1,i=se[n],r=Tt(i);r<e||r===e&&i.flags&2?t=n+1:s=n}return t}function Ls(e){if(!(e.flags&1)){const t=Tt(e),s=se[se.length-1];!s||!(e.flags&2)&&t>=Tt(s)?se.push(e):se.splice(br(t),0,e),e.flags|=1,Wn()}}function Wn(){$t||($t=Kn.then(Gn))}function _r(e){k(e)?nt.push(...e):je&&e.id===-1?je.splice(tt+1,0,e):e.flags&1||(nt.push(e),e.flags|=1),Wn()}function Xs(e,t,s=ye+1){for(;s<se.length;s++){const n=se[s];if(n&&n.flags&2){if(e&&n.id!==e.uid)continue;se.splice(s,1),s--,n.flags&4&&(n.flags&=-2),n(),n.flags&4||(n.flags&=-2)}}}function qn(e){if(nt.length){const t=[...new Set(nt)].sort((s,n)=>Tt(s)-Tt(n));if(nt.length=0,je){je.push(...t);return}for(je=t,tt=0;tt<je.length;tt++){const s=je[tt];s.flags&4&&(s.flags&=-2),s.flags&8||s(),s.flags&=-2}je=null,tt=0}}const Tt=e=>e.id==null?e.flags&2?-1:1/0:e.id;function Gn(e){try{for(ye=0;ye<se.length;ye++){const t=se[ye];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),Ot(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;ye<se.length;ye++){const t=se[ye];t&&(t.flags&=-2)}ye=-1,se.length=0,qn(),$t=null,(se.length||nt.length)&&Gn()}}let we=null,Qn=null;function Ht(e){const t=we;return we=e,Qn=e&&e.type.__scopeId||null,t}function yr(e,t=we,s){if(!t||e._n)return e;const n=(...i)=>{n._d&&an(-1);const r=Ht(t);let o;try{o=e(...i)}finally{Ht(r),n._d&&an(1)}return o};return n._n=!0,n._c=!0,n._d=!0,n}function Ge(e,t,s,n){const i=e.dirs,r=t&&t.dirs;for(let o=0;o<i.length;o++){const c=i[o];r&&(c.oldValue=r[o].value);let f=c.dir[n];f&&(Ae(),Me(f,s,8,[e.el,c,e,t]),Re())}}function xr(e,t){if(ne){let s=ne.provides;const n=ne.parent&&ne.parent.provides;n===s&&(s=ne.provides=Object.create(n)),s[e]=t}}function Nt(e,t,s=!1){const n=xo();if(n||it){let i=it?it._context.provides:n?n.parent==null||n.ce?n.vnode.appContext&&n.vnode.appContext.provides:n.parent.provides:void 0;if(i&&e in i)return i[e];if(arguments.length>1)return s&&A(t)?t.call(n&&n.proxy):t}}const Cr=Symbol.for("v-scx"),wr=()=>Nt(Cr);function is(e,t,s){return Yn(e,t,s)}function Yn(e,t,s=V){const{immediate:n,deep:i,flush:r,once:o}=s,c=J({},s),f=t&&n||!t&&r!=="post";let p;if(Et){if(r==="sync"){const S=wr();p=S.__watcherHandles||(S.__watcherHandles=[])}else if(!f){const S=()=>{};return S.stop=Se,S.resume=Se,S.pause=Se,S}}const u=ne;c.call=(S,R,I)=>Me(S,u,R,I);let h=!1;r==="post"?c.scheduler=S=>{ce(S,u&&u.suspense)}:r!=="sync"&&(h=!0,c.scheduler=(S,R)=>{R?S():Ls(S)}),c.augmentJob=S=>{t&&(S.flags|=4),h&&(S.flags|=2,u&&(S.id=u.uid,S.i=u))};const w=gr(e,t,c);return Et&&(p?p.push(w):f&&w()),w}function Sr(e,t,s){const n=this.proxy,i=Q(e)?e.includes(".")?Jn(n,e):()=>n[e]:e.bind(n,n);let r;A(t)?r=t:(r=t.handler,s=t);const o=Pt(this),c=Yn(i,r.bind(n),s);return o(),c}function Jn(e,t){const s=t.split(".");return()=>{let n=e;for(let i=0;i<s.length&&n;i++)n=n[s[i]];return n}}const Mr=Symbol("_vte"),Tr=e=>e.__isTeleport,Er=Symbol("_leaveCb");function js(e,t){e.shapeFlag&6&&e.component?(e.transition=t,js(e.component.subTree,t)):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function fe(e,t){return A(e)?J({name:e.name},t,{setup:e}):e}function zn(e){e.ids=[e.ids[0]+e.ids[2]+++"-",0,0]}const Ut=new WeakMap;function yt(e,t,s,n,i=!1){if(k(e)){e.forEach((R,I)=>yt(R,t&&(k(t)?t[I]:t),s,n,i));return}if(xt(n)&&!i){n.shapeFlag&512&&n.type.__asyncResolved&&n.component.subTree.component&&yt(e,t,s,n.component.subTree);return}const r=n.shapeFlag&4?Bs(n.component):n.el,o=i?null:r,{i:c,r:f}=e,p=t&&t.r,u=c.refs===V?c.refs={}:c.refs,h=c.setupState,w=L(h),S=h===V?Sn:R=>j(w,R);if(p!=null&&p!==f){if(Zs(t),Q(p))u[p]=null,S(p)&&(h[p]=null);else if(X(p)){p.value=null;const R=t;R.k&&(u[R.k]=null)}}if(A(f))Ot(f,c,12,[o,u]);else{const R=Q(f),I=X(f);if(R||I){const Y=()=>{if(e.f){const N=R?S(f)?h[f]:u[f]:f.value;if(i)k(N)&&ws(N,r);else if(k(N))N.includes(r)||N.push(r);else if(R)u[f]=[r],S(f)&&(h[f]=u[f]);else{const $=[r];f.value=$,e.k&&(u[e.k]=$)}}else R?(u[f]=o,S(f)&&(h[f]=o)):I&&(f.value=o,e.k&&(u[e.k]=o))};if(o){const N=()=>{Y(),Ut.delete(e)};N.id=-1,Ut.set(e,N),ce(N,s)}else Zs(e),Y()}}}function Zs(e){const t=Ut.get(e);t&&(t.flags|=8,Ut.delete(e))}Gt().requestIdleCallback;Gt().cancelIdleCallback;const xt=e=>!!e.type.__asyncLoader,Xn=e=>e.type.__isKeepAlive;function Or(e,t){Zn(e,"a",t)}function Pr(e,t){Zn(e,"da",t)}function Zn(e,t,s=ne){const n=e.__wdc||(e.__wdc=()=>{let i=s;for(;i;){if(i.isDeactivated)return;i=i.parent}return e()});if(Yt(t,n,s),s){let i=s.parent;for(;i&&i.parent;)Xn(i.parent.vnode)&&Ar(n,t,s,i),i=i.parent}}function Ar(e,t,s,n){const i=Yt(t,e,n,!0);ti(()=>{ws(n[t],i)},s)}function Yt(e,t,s=ne,n=!1){if(s){const i=s[e]||(s[e]=[]),r=t.__weh||(t.__weh=(...o)=>{Ae();const c=Pt(s),f=Me(t,s,e,o);return c(),Re(),f});return n?i.unshift(r):i.push(r),r}}const Ie=e=>(t,s=ne)=>{(!Et||e==="sp")&&Yt(e,(...n)=>t(...n),s)},Rr=Ie("bm"),ei=Ie("m"),kr=Ie("bu"),Ir=Ie("u"),Fr=Ie("bum"),ti=Ie("um"),Nr=Ie("sp"),Lr=Ie("rtg"),jr=Ie("rtc");function Dr(e,t=ne){Yt("ec",e,t)}const $r=Symbol.for("v-ndc"),gs=e=>e?yi(e)?Bs(e):gs(e.parent):null,Ct=J(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>gs(e.parent),$root:e=>gs(e.root),$host:e=>e.ce,$emit:e=>e.emit,$options:e=>ni(e),$forceUpdate:e=>e.f||(e.f=()=>{Ls(e.update)}),$nextTick:e=>e.n||(e.n=vr.bind(e.proxy)),$watch:e=>Sr.bind(e)}),rs=(e,t)=>e!==V&&!e.__isScriptSetup&&j(e,t),Hr={get({_:e},t){if(t==="__v_skip")return!0;const{ctx:s,setupState:n,data:i,props:r,accessCache:o,type:c,appContext:f}=e;if(t[0]!=="$"){const w=o[t];if(w!==void 0)switch(w){case 1:return n[t];case 2:return i[t];case 4:return s[t];case 3:return r[t]}else{if(rs(n,t))return o[t]=1,n[t];if(i!==V&&j(i,t))return o[t]=2,i[t];if(j(r,t))return o[t]=3,r[t];if(s!==V&&j(s,t))return o[t]=4,s[t];ms&&(o[t]=0)}}const p=Ct[t];let u,h;if(p)return t==="$attrs"&&z(e.attrs,"get",""),p(e);if((u=c.__cssModules)&&(u=u[t]))return u;if(s!==V&&j(s,t))return o[t]=4,s[t];if(h=f.config.globalProperties,j(h,t))return h[t]},set({_:e},t,s){const{data:n,setupState:i,ctx:r}=e;return rs(i,t)?(i[t]=s,!0):n!==V&&j(n,t)?(n[t]=s,!0):j(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(r[t]=s,!0)},has({_:{data:e,setupState:t,accessCache:s,ctx:n,appContext:i,props:r,type:o}},c){let f;return!!(s[c]||e!==V&&c[0]!=="$"&&j(e,c)||rs(t,c)||j(r,c)||j(n,c)||j(Ct,c)||j(i.config.globalProperties,c)||(f=o.__cssModules)&&f[c])},defineProperty(e,t,s){return s.get!=null?e._.accessCache[t]=0:j(s,"value")&&this.set(e,t,s.value,null),Reflect.defineProperty(e,t,s)}};function en(e){return k(e)?e.reduce((t,s)=>(t[s]=null,t),{}):e}let ms=!0;function Ur(e){const t=ni(e),s=e.proxy,n=e.ctx;ms=!1,t.beforeCreate&&tn(t.beforeCreate,e,"bc");const{data:i,computed:r,methods:o,watch:c,provide:f,inject:p,created:u,beforeMount:h,mounted:w,beforeUpdate:S,updated:R,activated:I,deactivated:Y,beforeDestroy:N,beforeUnmount:$,destroyed:K,unmounted:E,render:q,renderTracked:pe,renderTriggered:ae,errorCaptured:he,serverPrefetch:Ze,expose:Te,inheritAttrs:Ke,components:P,directives:Fe,filters:ct}=t;if(p&&Br(p,n,null),o)for(const W in o){const H=o[W];A(H)&&(n[W]=H.bind(s))}if(i){const W=i.call(s,s);G(W)&&(e.data=Is(W))}if(ms=!0,r)for(const W in r){const H=r[W],We=A(H)?H.bind(s,s):A(H.get)?H.get.bind(s,s):Se,At=!A(H)&&A(H.set)?H.set.bind(s):Se,qe=Ci({get:We,set:At});Object.defineProperty(n,W,{enumerable:!0,configurable:!0,get:()=>qe.value,set:ge=>qe.value=ge})}if(c)for(const W in c)si(c[W],n,s,W);if(f){const W=A(f)?f.call(s):f;Reflect.ownKeys(W).forEach(H=>{xr(H,W[H])})}u&&tn(u,e,"c");function Z(W,H){k(H)?H.forEach(We=>W(We.bind(s))):H&&W(H.bind(s))}if(Z(Rr,h),Z(ei,w),Z(kr,S),Z(Ir,R),Z(Or,I),Z(Pr,Y),Z(Dr,he),Z(jr,pe),Z(Lr,ae),Z(Fr,$),Z(ti,E),Z(Nr,Ze),k(Te))if(Te.length){const W=e.exposed||(e.exposed={});Te.forEach(H=>{Object.defineProperty(W,H,{get:()=>s[H],set:We=>s[H]=We,enumerable:!0})})}else e.exposed||(e.exposed={});q&&e.render===Se&&(e.render=q),Ke!=null&&(e.inheritAttrs=Ke),P&&(e.components=P),Fe&&(e.directives=Fe),Ze&&zn(e)}function Br(e,t,s=Se){k(e)&&(e=vs(e));for(const n in e){const i=e[n];let r;G(i)?"default"in i?r=Nt(i.from||n,i.default,!0):r=Nt(i.from||n):r=Nt(i),X(r)?Object.defineProperty(t,n,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):t[n]=r}}function tn(e,t,s){Me(k(e)?e.map(n=>n.bind(t.proxy)):e.bind(t.proxy),t,s)}function si(e,t,s,n){let i=n.includes(".")?Jn(s,n):()=>s[n];if(Q(e)){const r=t[e];A(r)&&is(i,r)}else if(A(e))is(i,e.bind(s));else if(G(e))if(k(e))e.forEach(r=>si(r,t,s,n));else{const r=A(e.handler)?e.handler.bind(s):t[e.handler];A(r)&&is(i,r,e)}}function ni(e){const t=e.type,{mixins:s,extends:n}=t,{mixins:i,optionsCache:r,config:{optionMergeStrategies:o}}=e.appContext,c=r.get(t);let f;return c?f=c:!i.length&&!s&&!n?f=t:(f={},i.length&&i.forEach(p=>Bt(f,p,o,!0)),Bt(f,t,o)),G(t)&&r.set(t,f),f}function Bt(e,t,s,n=!1){const{mixins:i,extends:r}=t;r&&Bt(e,r,s,!0),i&&i.forEach(o=>Bt(e,o,s,!0));for(const o in t)if(!(n&&o==="expose")){const c=Vr[o]||s&&s[o];e[o]=c?c(e[o],t[o]):t[o]}return e}const Vr={data:sn,props:nn,emits:nn,methods:ht,computed:ht,beforeCreate:te,created:te,beforeMount:te,mounted:te,beforeUpdate:te,updated:te,beforeDestroy:te,beforeUnmount:te,destroyed:te,unmounted:te,activated:te,deactivated:te,errorCaptured:te,serverPrefetch:te,components:ht,directives:ht,watch:Wr,provide:sn,inject:Kr};function sn(e,t){return t?e?function(){return J(A(e)?e.call(this,this):e,A(t)?t.call(this,this):t)}:t:e}function Kr(e,t){return ht(vs(e),vs(t))}function vs(e){if(k(e)){const t={};for(let s=0;s<e.length;s++)t[e[s]]=e[s];return t}return e}function te(e,t){return e?[...new Set([].concat(e,t))]:t}function ht(e,t){return e?J(Object.create(null),e,t):t}function nn(e,t){return e?k(e)&&k(t)?[...new Set([...e,...t])]:J(Object.create(null),en(e),en(t??{})):t}function Wr(e,t){if(!e)return t;if(!t)return e;const s=J(Object.create(null),e);for(const n in t)s[n]=te(e[n],t[n]);return s}function ii(){return{app:null,config:{isNativeTag:Sn,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let qr=0;function Gr(e,t){return function(n,i=null){A(n)||(n=J({},n)),i!=null&&!G(i)&&(i=null);const r=ii(),o=new WeakSet,c=[];let f=!1;const p=r.app={_uid:qr++,_component:n,_props:i,_container:null,_context:r,_instance:null,version:Eo,get config(){return r.config},set config(u){},use(u,...h){return o.has(u)||(u&&A(u.install)?(o.add(u),u.install(p,...h)):A(u)&&(o.add(u),u(p,...h))),p},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),p},component(u,h){return h?(r.components[u]=h,p):r.components[u]},directive(u,h){return h?(r.directives[u]=h,p):r.directives[u]},mount(u,h,w){if(!f){const S=p._ceVNode||ze(n,i);return S.appContext=r,w===!0?w="svg":w===!1&&(w=void 0),e(S,u,w),f=!0,p._container=u,u.__vue_app__=p,Bs(S.component)}},onUnmount(u){c.push(u)},unmount(){f&&(Me(c,p._instance,16),e(null,p._container),delete p._container.__vue_app__)},provide(u,h){return r.provides[u]=h,p},runWithContext(u){const h=it;it=p;try{return u()}finally{it=h}}};return p}}let it=null;const Qr=(e,t)=>t==="modelValue"||t==="model-value"?e.modelModifiers:e[`${t}Modifiers`]||e[`${Be(t)}Modifiers`]||e[`${Xe(t)}Modifiers`];function Yr(e,t,...s){if(e.isUnmounted)return;const n=e.vnode.props||V;let i=s;const r=t.startsWith("update:"),o=r&&Qr(n,t.slice(7));o&&(o.trim&&(i=s.map(u=>Q(u)?u.trim():u)),o.number&&(i=s.map(Ii)));let c,f=n[c=Zt(t)]||n[c=Zt(Be(t))];!f&&r&&(f=n[c=Zt(Xe(t))]),f&&Me(f,e,6,i);const p=n[c+"Once"];if(p){if(!e.emitted)e.emitted={};else if(e.emitted[c])return;e.emitted[c]=!0,Me(p,e,6,i)}}const Jr=new WeakMap;function ri(e,t,s=!1){const n=s?Jr:t.emitsCache,i=n.get(e);if(i!==void 0)return i;const r=e.emits;let o={},c=!1;if(!A(e)){const f=p=>{const u=ri(p,t,!0);u&&(c=!0,J(o,u))};!s&&t.mixins.length&&t.mixins.forEach(f),e.extends&&f(e.extends),e.mixins&&e.mixins.forEach(f)}return!r&&!c?(G(e)&&n.set(e,null),null):(k(r)?r.forEach(f=>o[f]=null):J(o,r),G(e)&&n.set(e,o),o)}function Jt(e,t){return!e||!Kt(t)?!1:(t=t.slice(2).replace(/Once$/,""),j(e,t[0].toLowerCase()+t.slice(1))||j(e,Xe(t))||j(e,t))}function rn(e){const{type:t,vnode:s,proxy:n,withProxy:i,propsOptions:[r],slots:o,attrs:c,emit:f,render:p,renderCache:u,props:h,data:w,setupState:S,ctx:R,inheritAttrs:I}=e,Y=Ht(e);let N,$;try{if(s.shapeFlag&4){const E=i||n,q=E;N=Ce(p.call(q,E,u,h,S,w,R)),$=c}else{const E=t;N=Ce(E.length>1?E(h,{attrs:c,slots:o,emit:f}):E(h,null)),$=t.props?c:zr(c)}}catch(E){Qt(E,e,1),N=ze(rt)}let K=N;if($&&I!==!1){const E=Object.keys($),{shapeFlag:q}=K;E.length&&q&7&&(r&&E.some(Cs)&&($=Xr($,r)),K=ot(K,$,!1,!0))}return s.dirs&&(K=ot(K,null,!1,!0),K.dirs=K.dirs?K.dirs.concat(s.dirs):s.dirs),s.transition&&js(K,s.transition),N=K,Ht(Y),N}const zr=e=>{let t;for(const s in e)(s==="class"||s==="style"||Kt(s))&&((t||(t={}))[s]=e[s]);return t},Xr=(e,t)=>{const s={};for(const n in e)(!Cs(n)||!(n.slice(9)in t))&&(s[n]=e[n]);return s};function Zr(e,t,s){const{props:n,children:i,component:r}=e,{props:o,children:c,patchFlag:f}=t,p=r.emitsOptions;if(t.dirs||t.transition)return!0;if(s&&f>=0){if(f&1024)return!0;if(f&16)return n?on(n,o,p):!!o;if(f&8){const u=t.dynamicProps;for(let h=0;h<u.length;h++){const w=u[h];if(o[w]!==n[w]&&!Jt(p,w))return!0}}}else return(i||c)&&(!c||!c.$stable)?!0:n===o?!1:n?o?on(n,o,p):!0:!!o;return!1}function on(e,t,s){const n=Object.keys(t);if(n.length!==Object.keys(e).length)return!0;for(let i=0;i<n.length;i++){const r=n[i];if(t[r]!==e[r]&&!Jt(s,r))return!0}return!1}function eo({vnode:e,parent:t},s){for(;t;){const n=t.subTree;if(n.suspense&&n.suspense.activeBranch===e&&(n.el=e.el),n===e)(e=t.vnode).el=s,t=t.parent;else break}}const oi={},li=()=>Object.create(oi),ci=e=>Object.getPrototypeOf(e)===oi;function to(e,t,s,n=!1){const i={},r=li();e.propsDefaults=Object.create(null),ai(e,t,i,r);for(const o in e.propsOptions[0])o in i||(i[o]=void 0);s?e.props=n?i:or(i):e.type.props?e.props=i:e.props=r,e.attrs=r}function so(e,t,s,n){const{props:i,attrs:r,vnode:{patchFlag:o}}=e,c=L(i),[f]=e.propsOptions;let p=!1;if((n||o>0)&&!(o&16)){if(o&8){const u=e.vnode.dynamicProps;for(let h=0;h<u.length;h++){let w=u[h];if(Jt(e.emitsOptions,w))continue;const S=t[w];if(f)if(j(r,w))S!==r[w]&&(r[w]=S,p=!0);else{const R=Be(w);i[R]=bs(f,c,R,S,e,!1)}else S!==r[w]&&(r[w]=S,p=!0)}}}else{ai(e,t,i,r)&&(p=!0);let u;for(const h in c)(!t||!j(t,h)&&((u=Xe(h))===h||!j(t,u)))&&(f?s&&(s[h]!==void 0||s[u]!==void 0)&&(i[h]=bs(f,c,h,void 0,e,!0)):delete i[h]);if(r!==c)for(const h in r)(!t||!j(t,h))&&(delete r[h],p=!0)}p&&Pe(e.attrs,"set","")}function ai(e,t,s,n){const[i,r]=e.propsOptions;let o=!1,c;if(t)for(let f in t){if(vt(f))continue;const p=t[f];let u;i&&j(i,u=Be(f))?!r||!r.includes(u)?s[u]=p:(c||(c={}))[u]=p:Jt(e.emitsOptions,f)||(!(f in n)||p!==n[f])&&(n[f]=p,o=!0)}if(r){const f=L(s),p=c||V;for(let u=0;u<r.length;u++){const h=r[u];s[h]=bs(i,f,h,p[h],e,!j(p,h))}}return o}function bs(e,t,s,n,i,r){const o=e[s];if(o!=null){const c=j(o,"default");if(c&&n===void 0){const f=o.default;if(o.type!==Function&&!o.skipFactory&&A(f)){const{propsDefaults:p}=i;if(s in p)n=p[s];else{const u=Pt(i);n=p[s]=f.call(null,t),u()}}else n=f;i.ce&&i.ce._setProp(s,n)}o[0]&&(r&&!c?n=!1:o[1]&&(n===""||n===Xe(s))&&(n=!0))}return n}const no=new WeakMap;function fi(e,t,s=!1){const n=s?no:t.propsCache,i=n.get(e);if(i)return i;const r=e.props,o={},c=[];let f=!1;if(!A(e)){const u=h=>{f=!0;const[w,S]=fi(h,t,!0);J(o,w),S&&c.push(...S)};!s&&t.mixins.length&&t.mixins.forEach(u),e.extends&&u(e.extends),e.mixins&&e.mixins.forEach(u)}if(!r&&!f)return G(e)&&n.set(e,gt),gt;if(k(r))for(let u=0;u<r.length;u++){const h=Be(r[u]);ln(h)&&(o[h]=V)}else if(r)for(const u in r){const h=Be(u);if(ln(h)){const w=r[u],S=o[h]=k(w)||A(w)?{type:w}:J({},w),R=S.type;let I=!1,Y=!0;if(k(R))for(let N=0;N<R.length;++N){const $=R[N],K=A($)&&$.name;if(K==="Boolean"){I=!0;break}else K==="String"&&(Y=!1)}else I=A(R)&&R.name==="Boolean";S[0]=I,S[1]=Y,(I||j(S,"default"))&&c.push(h)}}const p=[o,c];return G(e)&&n.set(e,p),p}function ln(e){return e[0]!=="$"&&!vt(e)}const Ds=e=>e==="_"||e==="_ctx"||e==="$stable",$s=e=>k(e)?e.map(Ce):[Ce(e)],io=(e,t,s)=>{if(t._n)return t;const n=yr((...i)=>$s(t(...i)),s);return n._c=!1,n},ui=(e,t,s)=>{const n=e._ctx;for(const i in e){if(Ds(i))continue;const r=e[i];if(A(r))t[i]=io(i,r,n);else if(r!=null){const o=$s(r);t[i]=()=>o}}},di=(e,t)=>{const s=$s(t);e.slots.default=()=>s},pi=(e,t,s)=>{for(const n in t)(s||!Ds(n))&&(e[n]=t[n])},ro=(e,t,s)=>{const n=e.slots=li();if(e.vnode.shapeFlag&32){const i=t._;i?(pi(n,t,s),s&&En(n,"_",i,!0)):ui(t,n)}else t&&di(e,t)},oo=(e,t,s)=>{const{vnode:n,slots:i}=e;let r=!0,o=V;if(n.shapeFlag&32){const c=t._;c?s&&c===1?r=!1:pi(i,t,s):(r=!t.$stable,ui(t,i)),o=t}else t&&(di(e,t),o={default:1});if(r)for(const c in i)!Ds(c)&&o[c]==null&&delete i[c]},ce=uo;function lo(e){return co(e)}function co(e,t){const s=Gt();s.__VUE__=!0;const{insert:n,remove:i,patchProp:r,createElement:o,createText:c,createComment:f,setText:p,setElementText:u,parentNode:h,nextSibling:w,setScopeId:S=Se,insertStaticContent:R}=e,I=(l,a,d,b=null,g=null,m=null,x=void 0,y=null,_=!!a.dynamicChildren)=>{if(l===a)return;l&&!pt(l,a)&&(b=Rt(l),ge(l,g,m,!0),l=null),a.patchFlag===-2&&(_=!1,a.dynamicChildren=null);const{type:v,ref:T,shapeFlag:C}=a;switch(v){case zt:Y(l,a,d,b);break;case rt:N(l,a,d,b);break;case ls:l==null&&$(a,d,b,x);break;case xe:P(l,a,d,b,g,m,x,y,_);break;default:C&1?q(l,a,d,b,g,m,x,y,_):C&6?Fe(l,a,d,b,g,m,x,y,_):(C&64||C&128)&&v.process(l,a,d,b,g,m,x,y,_,ft)}T!=null&&g?yt(T,l&&l.ref,m,a||l,!a):T==null&&l&&l.ref!=null&&yt(l.ref,null,m,l,!0)},Y=(l,a,d,b)=>{if(l==null)n(a.el=c(a.children),d,b);else{const g=a.el=l.el;a.children!==l.children&&p(g,a.children)}},N=(l,a,d,b)=>{l==null?n(a.el=f(a.children||""),d,b):a.el=l.el},$=(l,a,d,b)=>{[l.el,l.anchor]=R(l.children,a,d,b,l.el,l.anchor)},K=({el:l,anchor:a},d,b)=>{let g;for(;l&&l!==a;)g=w(l),n(l,d,b),l=g;n(a,d,b)},E=({el:l,anchor:a})=>{let d;for(;l&&l!==a;)d=w(l),i(l),l=d;i(a)},q=(l,a,d,b,g,m,x,y,_)=>{if(a.type==="svg"?x="svg":a.type==="math"&&(x="mathml"),l==null)pe(a,d,b,g,m,x,y,_);else{const v=l.el&&l.el._isVueCE?l.el:null;try{v&&v._beginPatch(),Ze(l,a,g,m,x,y,_)}finally{v&&v._endPatch()}}},pe=(l,a,d,b,g,m,x,y)=>{let _,v;const{props:T,shapeFlag:C,transition:M,dirs:O}=l;if(_=l.el=o(l.type,m,T&&T.is,T),C&8?u(_,l.children):C&16&&he(l.children,_,null,b,g,os(l,m),x,y),O&&Ge(l,null,b,"created"),ae(_,l,l.scopeId,x,b),T){for(const U in T)U!=="value"&&!vt(U)&&r(_,U,null,T[U],m,b);"value"in T&&r(_,"value",null,T.value,m),(v=T.onVnodeBeforeMount)&&_e(v,b,l)}O&&Ge(l,null,b,"beforeMount");const F=ao(g,M);F&&M.beforeEnter(_),n(_,a,d),((v=T&&T.onVnodeMounted)||F||O)&&ce(()=>{v&&_e(v,b,l),F&&M.enter(_),O&&Ge(l,null,b,"mounted")},g)},ae=(l,a,d,b,g)=>{if(d&&S(l,d),b)for(let m=0;m<b.length;m++)S(l,b[m]);if(g){let m=g.subTree;if(a===m||vi(m.type)&&(m.ssContent===a||m.ssFallback===a)){const x=g.vnode;ae(l,x,x.scopeId,x.slotScopeIds,g.parent)}}},he=(l,a,d,b,g,m,x,y,_=0)=>{for(let v=_;v<l.length;v++){const T=l[v]=y?De(l[v]):Ce(l[v]);I(null,T,a,d,b,g,m,x,y)}},Ze=(l,a,d,b,g,m,x)=>{const y=a.el=l.el;let{patchFlag:_,dynamicChildren:v,dirs:T}=a;_|=l.patchFlag&16;const C=l.props||V,M=a.props||V;let O;if(d&&Qe(d,!1),(O=M.onVnodeBeforeUpdate)&&_e(O,d,a,l),T&&Ge(a,l,d,"beforeUpdate"),d&&Qe(d,!0),(C.innerHTML&&M.innerHTML==null||C.textContent&&M.textContent==null)&&u(y,""),v?Te(l.dynamicChildren,v,y,d,b,os(a,g),m):x||H(l,a,y,null,d,b,os(a,g),m,!1),_>0){if(_&16)Ke(y,C,M,d,g);else if(_&2&&C.class!==M.class&&r(y,"class",null,M.class,g),_&4&&r(y,"style",C.style,M.style,g),_&8){const F=a.dynamicProps;for(let U=0;U<F.length;U++){const D=F[U],ie=C[D],re=M[D];(re!==ie||D==="value")&&r(y,D,ie,re,g,d)}}_&1&&l.children!==a.children&&u(y,a.children)}else!x&&v==null&&Ke(y,C,M,d,g);((O=M.onVnodeUpdated)||T)&&ce(()=>{O&&_e(O,d,a,l),T&&Ge(a,l,d,"updated")},b)},Te=(l,a,d,b,g,m,x)=>{for(let y=0;y<a.length;y++){const _=l[y],v=a[y],T=_.el&&(_.type===xe||!pt(_,v)||_.shapeFlag&198)?h(_.el):d;I(_,v,T,null,b,g,m,x,!0)}},Ke=(l,a,d,b,g)=>{if(a!==d){if(a!==V)for(const m in a)!vt(m)&&!(m in d)&&r(l,m,a[m],null,g,b);for(const m in d){if(vt(m))continue;const x=d[m],y=a[m];x!==y&&m!=="value"&&r(l,m,y,x,g,b)}"value"in d&&r(l,"value",a.value,d.value,g)}},P=(l,a,d,b,g,m,x,y,_)=>{const v=a.el=l?l.el:c(""),T=a.anchor=l?l.anchor:c("");let{patchFlag:C,dynamicChildren:M,slotScopeIds:O}=a;O&&(y=y?y.concat(O):O),l==null?(n(v,d,b),n(T,d,b),he(a.children||[],d,T,g,m,x,y,_)):C>0&&C&64&&M&&l.dynamicChildren&&l.dynamicChildren.length===M.length?(Te(l.dynamicChildren,M,d,g,m,x,y),(a.key!=null||g&&a===g.subTree)&&hi(l,a,!0)):H(l,a,d,T,g,m,x,y,_)},Fe=(l,a,d,b,g,m,x,y,_)=>{a.slotScopeIds=y,l==null?a.shapeFlag&512?g.ctx.activate(a,d,b,x,_):ct(a,d,b,g,m,x,_):Vs(l,a,_)},ct=(l,a,d,b,g,m,x)=>{const y=l.component=yo(l,b,g);if(Xn(l)&&(y.ctx.renderer=ft),Co(y,!1,x),y.asyncDep){if(g&&g.registerDep(y,Z,x),!l.el){const _=y.subTree=ze(rt);N(null,_,a,d),l.placeholder=_.el}}else Z(y,l,a,d,g,m,x)},Vs=(l,a,d)=>{const b=a.component=l.component;if(Zr(l,a,d))if(b.asyncDep&&!b.asyncResolved){W(b,a,d);return}else b.next=a,b.update();else a.el=l.el,b.vnode=a},Z=(l,a,d,b,g,m,x)=>{const y=()=>{if(l.isMounted){let{next:C,bu:M,u:O,parent:F,vnode:U}=l;{const ve=gi(l);if(ve){C&&(C.el=U.el,W(l,C,x)),ve.asyncDep.then(()=>{l.isUnmounted||y()});return}}let D=C,ie;Qe(l,!1),C?(C.el=U.el,W(l,C,x)):C=U,M&&es(M),(ie=C.props&&C.props.onVnodeBeforeUpdate)&&_e(ie,F,C,U),Qe(l,!0);const re=rn(l),me=l.subTree;l.subTree=re,I(me,re,h(me.el),Rt(me),l,g,m),C.el=re.el,D===null&&eo(l,re.el),O&&ce(O,g),(ie=C.props&&C.props.onVnodeUpdated)&&ce(()=>_e(ie,F,C,U),g)}else{let C;const{el:M,props:O}=a,{bm:F,m:U,parent:D,root:ie,type:re}=l,me=xt(a);Qe(l,!1),F&&es(F),!me&&(C=O&&O.onVnodeBeforeMount)&&_e(C,D,a),Qe(l,!0);{ie.ce&&ie.ce._def.shadowRoot!==!1&&ie.ce._injectChildStyle(re);const ve=l.subTree=rn(l);I(null,ve,d,b,l,g,m),a.el=ve.el}if(U&&ce(U,g),!me&&(C=O&&O.onVnodeMounted)){const ve=a;ce(()=>_e(C,D,ve),g)}(a.shapeFlag&256||D&&xt(D.vnode)&&D.vnode.shapeFlag&256)&&l.a&&ce(l.a,g),l.isMounted=!0,a=d=b=null}};l.scope.on();const _=l.effect=new Pn(y);l.scope.off();const v=l.update=_.run.bind(_),T=l.job=_.runIfDirty.bind(_);T.i=l,T.id=l.uid,_.scheduler=()=>Ls(T),Qe(l,!0),v()},W=(l,a,d)=>{a.component=l;const b=l.vnode.props;l.vnode=a,l.next=null,so(l,a.props,b,d),oo(l,a.children,d),Ae(),Xs(l),Re()},H=(l,a,d,b,g,m,x,y,_=!1)=>{const v=l&&l.children,T=l?l.shapeFlag:0,C=a.children,{patchFlag:M,shapeFlag:O}=a;if(M>0){if(M&128){At(v,C,d,b,g,m,x,y,_);return}else if(M&256){We(v,C,d,b,g,m,x,y,_);return}}O&8?(T&16&&at(v,g,m),C!==v&&u(d,C)):T&16?O&16?At(v,C,d,b,g,m,x,y,_):at(v,g,m,!0):(T&8&&u(d,""),O&16&&he(C,d,b,g,m,x,y,_))},We=(l,a,d,b,g,m,x,y,_)=>{l=l||gt,a=a||gt;const v=l.length,T=a.length,C=Math.min(v,T);let M;for(M=0;M<C;M++){const O=a[M]=_?De(a[M]):Ce(a[M]);I(l[M],O,d,null,g,m,x,y,_)}v>T?at(l,g,m,!0,!1,C):he(a,d,b,g,m,x,y,_,C)},At=(l,a,d,b,g,m,x,y,_)=>{let v=0;const T=a.length;let C=l.length-1,M=T-1;for(;v<=C&&v<=M;){const O=l[v],F=a[v]=_?De(a[v]):Ce(a[v]);if(pt(O,F))I(O,F,d,null,g,m,x,y,_);else break;v++}for(;v<=C&&v<=M;){const O=l[C],F=a[M]=_?De(a[M]):Ce(a[M]);if(pt(O,F))I(O,F,d,null,g,m,x,y,_);else break;C--,M--}if(v>C){if(v<=M){const O=M+1,F=O<T?a[O].el:b;for(;v<=M;)I(null,a[v]=_?De(a[v]):Ce(a[v]),d,F,g,m,x,y,_),v++}}else if(v>M)for(;v<=C;)ge(l[v],g,m,!0),v++;else{const O=v,F=v,U=new Map;for(v=F;v<=M;v++){const le=a[v]=_?De(a[v]):Ce(a[v]);le.key!=null&&U.set(le.key,v)}let D,ie=0;const re=M-F+1;let me=!1,ve=0;const ut=new Array(re);for(v=0;v<re;v++)ut[v]=0;for(v=O;v<=C;v++){const le=l[v];if(ie>=re){ge(le,g,m,!0);continue}let be;if(le.key!=null)be=U.get(le.key);else for(D=F;D<=M;D++)if(ut[D-F]===0&&pt(le,a[D])){be=D;break}be===void 0?ge(le,g,m,!0):(ut[be-F]=v+1,be>=ve?ve=be:me=!0,I(le,a[be],d,null,g,m,x,y,_),ie++)}const qs=me?fo(ut):gt;for(D=qs.length-1,v=re-1;v>=0;v--){const le=F+v,be=a[le],Gs=a[le+1],Qs=le+1<T?Gs.el||mi(Gs):b;ut[v]===0?I(null,be,d,Qs,g,m,x,y,_):me&&(D<0||v!==qs[D]?qe(be,d,Qs,2):D--)}}},qe=(l,a,d,b,g=null)=>{const{el:m,type:x,transition:y,children:_,shapeFlag:v}=l;if(v&6){qe(l.component.subTree,a,d,b);return}if(v&128){l.suspense.move(a,d,b);return}if(v&64){x.move(l,a,d,ft);return}if(x===xe){n(m,a,d);for(let C=0;C<_.length;C++)qe(_[C],a,d,b);n(l.anchor,a,d);return}if(x===ls){K(l,a,d);return}if(b!==2&&v&1&&y)if(b===0)y.beforeEnter(m),n(m,a,d),ce(()=>y.enter(m),g);else{const{leave:C,delayLeave:M,afterLeave:O}=y,F=()=>{l.ctx.isUnmounted?i(m):n(m,a,d)},U=()=>{m._isLeaving&&m[Er](!0),C(m,()=>{F(),O&&O()})};M?M(m,F,U):U()}else n(m,a,d)},ge=(l,a,d,b=!1,g=!1)=>{const{type:m,props:x,ref:y,children:_,dynamicChildren:v,shapeFlag:T,patchFlag:C,dirs:M,cacheIndex:O}=l;if(C===-2&&(g=!1),y!=null&&(Ae(),yt(y,null,d,l,!0),Re()),O!=null&&(a.renderCache[O]=void 0),T&256){a.ctx.deactivate(l);return}const F=T&1&&M,U=!xt(l);let D;if(U&&(D=x&&x.onVnodeBeforeUnmount)&&_e(D,a,l),T&6)Mi(l.component,d,b);else{if(T&128){l.suspense.unmount(d,b);return}F&&Ge(l,null,a,"beforeUnmount"),T&64?l.type.remove(l,a,d,ft,b):v&&!v.hasOnce&&(m!==xe||C>0&&C&64)?at(v,a,d,!1,!0):(m===xe&&C&384||!g&&T&16)&&at(_,a,d),b&&Ks(l)}(U&&(D=x&&x.onVnodeUnmounted)||F)&&ce(()=>{D&&_e(D,a,l),F&&Ge(l,null,a,"unmounted")},d)},Ks=l=>{const{type:a,el:d,anchor:b,transition:g}=l;if(a===xe){Si(d,b);return}if(a===ls){E(l);return}const m=()=>{i(d),g&&!g.persisted&&g.afterLeave&&g.afterLeave()};if(l.shapeFlag&1&&g&&!g.persisted){const{leave:x,delayLeave:y}=g,_=()=>x(d,m);y?y(l.el,m,_):_()}else m()},Si=(l,a)=>{let d;for(;l!==a;)d=w(l),i(l),l=d;i(a)},Mi=(l,a,d)=>{const{bum:b,scope:g,job:m,subTree:x,um:y,m:_,a:v}=l;cn(_),cn(v),b&&es(b),g.stop(),m&&(m.flags|=8,ge(x,l,a,d)),y&&ce(y,a),ce(()=>{l.isUnmounted=!0},a)},at=(l,a,d,b=!1,g=!1,m=0)=>{for(let x=m;x<l.length;x++)ge(l[x],a,d,b,g)},Rt=l=>{if(l.shapeFlag&6)return Rt(l.component.subTree);if(l.shapeFlag&128)return l.suspense.next();const a=w(l.anchor||l.el),d=a&&a[Mr];return d?w(d):a};let Xt=!1;const Ws=(l,a,d)=>{let b;l==null?a._vnode&&(ge(a._vnode,null,null,!0),b=a._vnode.component):I(a._vnode||null,l,a,null,null,null,d),a._vnode=l,Xt||(Xt=!0,Xs(b),qn(),Xt=!1)},ft={p:I,um:ge,m:qe,r:Ks,mt:ct,mc:he,pc:H,pbc:Te,n:Rt,o:e};return{render:Ws,hydrate:void 0,createApp:Gr(Ws)}}function os({type:e,props:t},s){return s==="svg"&&e==="foreignObject"||s==="mathml"&&e==="annotation-xml"&&t&&t.encoding&&t.encoding.includes("html")?void 0:s}function Qe({effect:e,job:t},s){s?(e.flags|=32,t.flags|=4):(e.flags&=-33,t.flags&=-5)}function ao(e,t){return(!e||e&&!e.pendingBranch)&&t&&!t.persisted}function hi(e,t,s=!1){const n=e.children,i=t.children;if(k(n)&&k(i))for(let r=0;r<n.length;r++){const o=n[r];let c=i[r];c.shapeFlag&1&&!c.dynamicChildren&&((c.patchFlag<=0||c.patchFlag===32)&&(c=i[r]=De(i[r]),c.el=o.el),!s&&c.patchFlag!==-2&&hi(o,c)),c.type===zt&&(c.patchFlag!==-1?c.el=o.el:c.__elIndex=r+(e.type===xe?1:0)),c.type===rt&&!c.el&&(c.el=o.el)}}function fo(e){const t=e.slice(),s=[0];let n,i,r,o,c;const f=e.length;for(n=0;n<f;n++){const p=e[n];if(p!==0){if(i=s[s.length-1],e[i]<p){t[n]=i,s.push(n);continue}for(r=0,o=s.length-1;r<o;)c=r+o>>1,e[s[c]]<p?r=c+1:o=c;p<e[s[r]]&&(r>0&&(t[n]=s[r-1]),s[r]=n)}}for(r=s.length,o=s[r-1];r-- >0;)s[r]=o,o=t[o];return s}function gi(e){const t=e.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:gi(t)}function cn(e){if(e)for(let t=0;t<e.length;t++)e[t].flags|=8}function mi(e){if(e.placeholder)return e.placeholder;const t=e.component;return t?mi(t.subTree):null}const vi=e=>e.__isSuspense;function uo(e,t){t&&t.pendingBranch?k(e)?t.effects.push(...e):t.effects.push(e):_r(e)}const xe=Symbol.for("v-fgt"),zt=Symbol.for("v-txt"),rt=Symbol.for("v-cmt"),ls=Symbol.for("v-stc");let He=null,Hs=1;function an(e,t=!1){Hs+=e,e<0&&He&&t&&(He.hasOnce=!0)}function bi(e){return e?e.__v_isVNode===!0:!1}function pt(e,t){return e.type===t.type&&e.key===t.key}const _i=({key:e})=>e??null,Lt=({ref:e,ref_key:t,ref_for:s})=>(typeof e=="number"&&(e=""+e),e!=null?Q(e)||X(e)||A(e)?{i:we,r:e,k:t,f:!!s}:e:null);function po(e,t=null,s=null,n=0,i=null,r=e===xe?0:1,o=!1,c=!1){const f={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&_i(t),ref:t&&Lt(t),scopeId:Qn,slotScopeIds:null,children:s,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:n,dynamicProps:i,dynamicChildren:null,appContext:null,ctx:we};return c?(Us(f,s),r&128&&e.normalize(f)):s&&(f.shapeFlag|=Q(s)?8:16),Hs>0&&!o&&He&&(f.patchFlag>0||r&6)&&f.patchFlag!==32&&He.push(f),f}const ze=ho;function ho(e,t=null,s=null,n=0,i=null,r=!1){if((!e||e===$r)&&(e=rt),bi(e)){const c=ot(e,t,!0);return s&&Us(c,s),Hs>0&&!r&&He&&(c.shapeFlag&6?He[He.indexOf(e)]=c:He.push(c)),c.patchFlag=-2,c}if(To(e)&&(e=e.__vccOpts),t){t=go(t);let{class:c,style:f}=t;c&&!Q(c)&&(t.class=Ts(c)),G(f)&&(Ns(f)&&!k(f)&&(f=J({},f)),t.style=Ms(f))}const o=Q(e)?1:vi(e)?128:Tr(e)?64:G(e)?4:A(e)?2:0;return po(e,t,s,n,i,o,r,!0)}function go(e){return e?Ns(e)||ci(e)?J({},e):e:null}function ot(e,t,s=!1,n=!1){const{props:i,ref:r,patchFlag:o,children:c,transition:f}=e,p=t?vo(i||{},t):i,u={__v_isVNode:!0,__v_skip:!0,type:e.type,props:p,key:p&&_i(p),ref:t&&t.ref?s&&r?k(r)?r.concat(Lt(t)):[r,Lt(t)]:Lt(t):r,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:c,target:e.target,targetStart:e.targetStart,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==xe?o===-1?16:o|16:o,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:f,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&ot(e.ssContent),ssFallback:e.ssFallback&&ot(e.ssFallback),placeholder:e.placeholder,el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce};return f&&n&&js(u,f.clone(u)),u}function mo(e=" ",t=0){return ze(zt,null,e,t)}function Ce(e){return e==null||typeof e=="boolean"?ze(rt):k(e)?ze(xe,null,e.slice()):bi(e)?De(e):ze(zt,null,String(e))}function De(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:ot(e)}function Us(e,t){let s=0;const{shapeFlag:n}=e;if(t==null)t=null;else if(k(t))s=16;else if(typeof t=="object")if(n&65){const i=t.default;i&&(i._c&&(i._d=!1),Us(e,i()),i._c&&(i._d=!0));return}else{s=32;const i=t._;!i&&!ci(t)?t._ctx=we:i===3&&we&&(we.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else A(t)?(t={default:t,_ctx:we},s=32):(t=String(t),n&64?(s=16,t=[mo(t)]):s=8);e.children=t,e.shapeFlag|=s}function vo(...e){const t={};for(let s=0;s<e.length;s++){const n=e[s];for(const i in n)if(i==="class")t.class!==n.class&&(t.class=Ts([t.class,n.class]));else if(i==="style")t.style=Ms([t.style,n.style]);else if(Kt(i)){const r=t[i],o=n[i];o&&r!==o&&!(k(r)&&r.includes(o))&&(t[i]=r?[].concat(r,o):o)}else i!==""&&(t[i]=n[i])}return t}function _e(e,t,s,n=null){Me(e,t,7,[s,n])}const bo=ii();let _o=0;function yo(e,t,s){const n=e.type,i=(t?t.appContext:e.appContext)||bo,r={uid:_o++,vnode:e,type:n,parent:t,appContext:i,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Hi(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(i.provides),ids:t?t.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:fi(n,i),emitsOptions:ri(n,i),emit:null,emitted:null,propsDefaults:V,inheritAttrs:n.inheritAttrs,ctx:V,data:V,props:V,attrs:V,slots:V,refs:V,setupState:V,setupContext:null,suspense:s,suspenseId:s?s.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=t?t.root:r,r.emit=Yr.bind(null,r),e.ce&&e.ce(r),r}let ne=null;const xo=()=>ne||we;let Vt,_s;{const e=Gt(),t=(s,n)=>{let i;return(i=e[s])||(i=e[s]=[]),i.push(n),r=>{i.length>1?i.forEach(o=>o(r)):i[0](r)}};Vt=t("__VUE_INSTANCE_SETTERS__",s=>ne=s),_s=t("__VUE_SSR_SETTERS__",s=>Et=s)}const Pt=e=>{const t=ne;return Vt(e),e.scope.on(),()=>{e.scope.off(),Vt(t)}},fn=()=>{ne&&ne.scope.off(),Vt(null)};function yi(e){return e.vnode.shapeFlag&4}let Et=!1;function Co(e,t=!1,s=!1){t&&_s(t);const{props:n,children:i}=e.vnode,r=yi(e);to(e,n,r,t),ro(e,i,s||t);const o=r?wo(e,t):void 0;return t&&_s(!1),o}function wo(e,t){const s=e.type;e.accessCache=Object.create(null),e.proxy=new Proxy(e.ctx,Hr);const{setup:n}=s;if(n){Ae();const i=e.setupContext=n.length>1?Mo(e):null,r=Pt(e),o=Ot(n,e,0,[e.props,i]),c=Mn(o);if(Re(),r(),(c||e.sp)&&!xt(e)&&zn(e),c){if(o.then(fn,fn),t)return o.then(f=>{un(e,f)}).catch(f=>{Qt(f,e,0)});e.asyncDep=o}else un(e,o)}else xi(e)}function un(e,t,s){A(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:G(t)&&(e.setupState=Vn(t)),xi(e)}function xi(e,t,s){const n=e.type;e.render||(e.render=n.render||Se);{const i=Pt(e);Ae();try{Ur(e)}finally{Re(),i()}}}const So={get(e,t){return z(e,"get",""),e[t]}};function Mo(e){const t=s=>{e.exposed=s||{}};return{attrs:new Proxy(e.attrs,So),slots:e.slots,emit:e.emit,expose:t}}function Bs(e){return e.exposed?e.exposeProxy||(e.exposeProxy=new Proxy(Vn(lr(e.exposed)),{get(t,s){if(s in t)return t[s];if(s in Ct)return Ct[s](e)},has(t,s){return s in t||s in Ct}})):e.proxy}function To(e){return A(e)&&"__vccOpts"in e}const Ci=(e,t)=>pr(e,t,Et),Eo="3.5.27";/**
* @vue/runtime-dom v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ys;const dn=typeof window<"u"&&window.trustedTypes;if(dn)try{ys=dn.createPolicy("vue",{createHTML:e=>e})}catch{}const wi=ys?e=>ys.createHTML(e):e=>e,Oo="http://www.w3.org/2000/svg",Po="http://www.w3.org/1998/Math/MathML",Oe=typeof document<"u"?document:null,pn=Oe&&Oe.createElement("template"),Ao={insert:(e,t,s)=>{t.insertBefore(e,s||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,s,n)=>{const i=t==="svg"?Oe.createElementNS(Oo,e):t==="mathml"?Oe.createElementNS(Po,e):s?Oe.createElement(e,{is:s}):Oe.createElement(e);return e==="select"&&n&&n.multiple!=null&&i.setAttribute("multiple",n.multiple),i},createText:e=>Oe.createTextNode(e),createComment:e=>Oe.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>Oe.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,s,n,i,r){const o=s?s.previousSibling:t.lastChild;if(i&&(i===r||i.nextSibling))for(;t.insertBefore(i.cloneNode(!0),s),!(i===r||!(i=i.nextSibling)););else{pn.innerHTML=wi(n==="svg"?`<svg>${e}</svg>`:n==="mathml"?`<math>${e}</math>`:e);const c=pn.content;if(n==="svg"||n==="mathml"){const f=c.firstChild;for(;f.firstChild;)c.appendChild(f.firstChild);c.removeChild(f)}t.insertBefore(c,s)}return[o?o.nextSibling:t.firstChild,s?s.previousSibling:t.lastChild]}},Ro=Symbol("_vtc");function ko(e,t,s){const n=e[Ro];n&&(t=(t?[t,...n]:[...n]).join(" ")),t==null?e.removeAttribute("class"):s?e.setAttribute("class",t):e.className=t}const hn=Symbol("_vod"),Io=Symbol("_vsh"),Fo=Symbol(""),No=/(?:^|;)\s*display\s*:/;function Lo(e,t,s){const n=e.style,i=Q(s);let r=!1;if(s&&!i){if(t)if(Q(t))for(const o of t.split(";")){const c=o.slice(0,o.indexOf(":")).trim();s[c]==null&&jt(n,c,"")}else for(const o in t)s[o]==null&&jt(n,o,"");for(const o in s)o==="display"&&(r=!0),jt(n,o,s[o])}else if(i){if(t!==s){const o=n[Fo];o&&(s+=";"+o),n.cssText=s,r=No.test(s)}}else t&&e.removeAttribute("style");hn in e&&(e[hn]=r?n.display:"",e[Io]&&(n.display="none"))}const gn=/\s*!important$/;function jt(e,t,s){if(k(s))s.forEach(n=>jt(e,t,n));else if(s==null&&(s=""),t.startsWith("--"))e.setProperty(t,s);else{const n=jo(e,t);gn.test(s)?e.setProperty(Xe(n),s.replace(gn,""),"important"):e[n]=s}}const mn=["Webkit","Moz","ms"],cs={};function jo(e,t){const s=cs[t];if(s)return s;let n=Be(t);if(n!=="filter"&&n in e)return cs[t]=n;n=Tn(n);for(let i=0;i<mn.length;i++){const r=mn[i]+n;if(r in e)return cs[t]=r}return t}const vn="http://www.w3.org/1999/xlink";function bn(e,t,s,n,i,r=$i(t)){n&&t.startsWith("xlink:")?s==null?e.removeAttributeNS(vn,t.slice(6,t.length)):e.setAttributeNS(vn,t,s):s==null||r&&!On(s)?e.removeAttribute(t):e.setAttribute(t,r?"":lt(s)?String(s):s)}function _n(e,t,s,n,i){if(t==="innerHTML"||t==="textContent"){s!=null&&(e[t]=t==="innerHTML"?wi(s):s);return}const r=e.tagName;if(t==="value"&&r!=="PROGRESS"&&!r.includes("-")){const c=r==="OPTION"?e.getAttribute("value")||"":e.value,f=s==null?e.type==="checkbox"?"on":"":String(s);(c!==f||!("_value"in e))&&(e.value=f),s==null&&e.removeAttribute(t),e._value=s;return}let o=!1;if(s===""||s==null){const c=typeof e[t];c==="boolean"?s=On(s):s==null&&c==="string"?(s="",o=!0):c==="number"&&(s=0,o=!0)}try{e[t]=s}catch{}o&&e.removeAttribute(i||t)}function Do(e,t,s,n){e.addEventListener(t,s,n)}function $o(e,t,s,n){e.removeEventListener(t,s,n)}const yn=Symbol("_vei");function Ho(e,t,s,n,i=null){const r=e[yn]||(e[yn]={}),o=r[t];if(n&&o)o.value=n;else{const[c,f]=Uo(t);if(n){const p=r[t]=Ko(n,i);Do(e,c,p,f)}else o&&($o(e,c,o,f),r[t]=void 0)}}const xn=/(?:Once|Passive|Capture)$/;function Uo(e){let t;if(xn.test(e)){t={};let n;for(;n=e.match(xn);)e=e.slice(0,e.length-n[0].length),t[n[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):Xe(e.slice(2)),t]}let as=0;const Bo=Promise.resolve(),Vo=()=>as||(Bo.then(()=>as=0),as=Date.now());function Ko(e,t){const s=n=>{if(!n._vts)n._vts=Date.now();else if(n._vts<=s.attached)return;Me(Wo(n,s.value),t,5,[n])};return s.value=e,s.attached=Vo(),s}function Wo(e,t){if(k(t)){const s=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{s.call(e),e._stopped=!0},t.map(n=>i=>!i._stopped&&n&&n(i))}else return t}const Cn=e=>e.charCodeAt(0)===111&&e.charCodeAt(1)===110&&e.charCodeAt(2)>96&&e.charCodeAt(2)<123,qo=(e,t,s,n,i,r)=>{const o=i==="svg";t==="class"?ko(e,n,o):t==="style"?Lo(e,s,n):Kt(t)?Cs(t)||Ho(e,t,s,n,r):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):Go(e,t,n,o))?(_n(e,t,n),!e.tagName.includes("-")&&(t==="value"||t==="checked"||t==="selected")&&bn(e,t,n,o,r,t!=="value")):e._isVueCE&&(/[A-Z]/.test(t)||!Q(n))?_n(e,Be(t),n,r,t):(t==="true-value"?e._trueValue=n:t==="false-value"&&(e._falseValue=n),bn(e,t,n,o))};function Go(e,t,s,n){if(n)return!!(t==="innerHTML"||t==="textContent"||t in e&&Cn(t)&&A(s));if(t==="spellcheck"||t==="draggable"||t==="translate"||t==="autocorrect"||t==="sandbox"&&e.tagName==="IFRAME"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA")return!1;if(t==="width"||t==="height"){const i=e.tagName;if(i==="IMG"||i==="VIDEO"||i==="CANVAS"||i==="SOURCE")return!1}return Cn(t)&&Q(s)?!1:t in e}const Qo=J({patchProp:qo},Ao);let wn;function Yo(){return wn||(wn=lo(Qo))}const Jo=(...e)=>{const t=Yo().createApp(...e),{mount:s}=t;return t.mount=n=>{const i=Xo(n);if(!i)return;const r=t._component;!A(r)&&!r.render&&!r.template&&(r.template=i.innerHTML),i.nodeType===1&&(i.textContent="");const o=s(i,!1,zo(i));return i instanceof Element&&(i.removeAttribute("v-cloak"),i.setAttribute("data-v-app","")),o},t};function zo(e){if(e instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&e instanceof MathMLElement)return"mathml"}function Xo(e){return Q(e)?document.querySelector(e):e}const Zo=fe({template:`
    <div class="quote-section">
      <div class="quote-text" @click="nextQuote">"{{ currentQuote }}"</div>
    </div>
  `,props:{currentQuote:{type:String,required:!0}},emits:["next-quote"],methods:{nextQuote(){this.$emit("next-quote")}}}),el=fe({template:`
    <div class="rankings-panel" :class="{ collapsed: !isOpen }">
      <div class="rankings-header">
        <h3>👻 Coolness Rankings</h3>
        <button class="rankings-close" @click="toggle">✕</button>
      </div>
      <div class="rankings-list">
        <div v-for="(rank, index) in rankings" :key="index" class="rank-item">
          <div class="rank-avatar">{{ rank.avatar }}</div>
          <div class="rank-name" :class="{ 'current-user': rank.isCurrentUser }">{{ rank.name }}</div>
          <div class="rank-score">{{ rank.score }}</div>
          <div class="rank-label">pts</div>
        </div>
      </div>
    </div>
  `,props:{isOpen:{type:Boolean,default:!0},rankings:{type:Array,required:!0}},emits:["toggle"],methods:{toggle(){this.$emit("toggle")}}}),tl=fe({template:`
    <div class="cat-panel" :class="{ collapsed: !isOpen }">
      <div class="cat-header">
        <h3>🐱 Random Cats</h3>
        <button class="cat-close" @click="toggle">✕</button>
      </div>
      <div class="cat-content">
        <img v-if="!loading" :src="catImage" class="cat-image" alt="Random cat" />
        <div v-if="loading" class="cat-loading">Loading... 🐱</div>
        <button class="cute-btn" @click="$emit('new-cat')" :disabled="loading">🔄 New Cat</button>
      </div>
    </div>
  `,props:{isOpen:{type:Boolean,default:!0},catImage:{type:String,required:!0},loading:{type:Boolean,default:!1}},emits:["toggle","new-cat"],methods:{toggle(){this.$emit("toggle")}}}),sl=fe({template:`
    <div class="tachometer">
      <div class="tachometer-dial">
        <div class="tachometer-ticks">
          <div class="tick"></div>
          <div class="tick major"></div>
          <div class="tick"></div>
          <div class="tick major"></div>
          <div class="tick"></div>
        </div>
        <div class="tachometer-needle" :style="needleStyle"></div>
        <div class="tachometer-label">🍄 MOLD METER</div>
        <div class="tachometer-value">{{ value }}%</div>
      </div>
      <button class="fart-btn" @click="onFart" :class="{ exploded: exploded }" :disabled="clicked">💨 Fart!</button>
    </div>
  `,props:{value:{type:Number,default:77,validator:e=>e>=0&&e<=100},clicked:{type:Boolean,default:!1},exploded:{type:Boolean,default:!1}},emits:["fart"],computed:{needleAngle(){return 225+Math.max(0,Math.min(100,this.value))*.9},needleStyle(){return{transform:`rotate(${this.needleAngle}deg)`}}},methods:{onFart(){this.$emit("fart")}}}),nl=fe({template:`
    <div class="girl-mode-container">
      <div class="girl-mode-content">
        <div class="girl-emoji">💕</div>
        <h1>Girl Mode Activated!</h1>
        <p>Welcome to the girl mode experience! 🌸</p>
        <p>This is a special space just for you.</p>
        <div class="girl-features">
          <div class="girl-feature">
            <div class="feature-icon">🎀</div>
            <div class="feature-text">Sparkly Everything</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">💖</div>
            <div class="feature-text">Cute Vibes</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">🌸</div>
            <div class="feature-text">Flower Power</div>
          </div>
          <div class="girl-feature">
            <div class="feature-icon">🎀</div>
            <div class="feature-text">Rainbow Mode</div>
          </div>
        </div>
        <div class="girl-message">
          <p>You are valid and loved exactly as you are! ✨</p>
          <p>This is your safe space to be yourself.</p>
        </div>
        <button class="cute-btn girl-back-btn" @click="$emit('back')">💕 Go Back</button>
      </div>
    </div>
  `,props:{darkMode:{type:Boolean,default:!1}},emits:["back"]}),il=fe({template:`
    <div class="feed-panel" :class="{ collapsed: !isOpen }">
      <div class="feed-header">
        <h3>☁️ Live Feeds</h3>
        <button class="feed-close" @click="toggle">✕</button>
      </div>
      <div class="feed-content">
        <div class="feed-section">
          <h4>🐦 Brisbane Radar</h4>
          <p>Live weather radar for Brisbane area</p>
          <iframe src="https://www.bom.gov.au/products/IDR064.loop.gif"></iframe>
        </div>
        <div class="feed-section">
          <h4>🚂 Subway Surfers (YT)</h4>
          <p>Autoplay gameplay video</p>
          <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"></iframe>
        </div>
        <div class="feed-section">
          <h4>🐦 BOM Queensland (X)</h4>
          <p>Latest weather alerts from Bureau of Meteorology</p>
          <a href="https://x.com/BOM_Qld" target="_blank" style="color: #666; font-size: 12px; display: block; margin-top: 5px;">@BOM_Qld on X/Twitter →</a>
        </div>
      </div>
    </div>
  `,props:{isOpen:{type:Boolean,default:!1}},emits:["toggle"],methods:{toggle(){this.$emit("toggle")}}}),rl=fe({template:`
    <div class="mika-modal" :class="{ active: isOpen }" @click.self="close">
      <div class="mika-modal-box">
        <div class="emoji">🌸</div>
        <h1>Hi there!</h1>
        <button class="cute-btn" @click="close">Close</button>
      </div>
    </div>
  `,props:{isOpen:{type:Boolean,default:!1}},emits:["close"],methods:{close(){this.$emit("close")}}}),ol=fe({template:`
    <div class="click-counter">
      <div class="counter-header">
        <h3>🖱️ Click Counter</h3>
      </div>
      <div class="counter-content">
        <div class="click-count">{{ count }}</div>
        <button 
          class="click-btn" 
          @click="incrementClick"
          :disabled="loading"
          :class="{ clicking: isClicking }"
        >
          {{ loading ? '...' : 'CLICK ME!' }}
        </button>
        <div class="click-info">
          <span v-if="lastUpdate">Last click: {{ formatTime(lastUpdate) }}</span>
        </div>
      </div>
    </div>
  `,props:{apiUrl:{type:String,default:"/api/clicks"}},data(){return{count:0,loading:!1,isClicking:!1,lastUpdate:null}},methods:{async fetchCount(){try{const t=await(await fetch(this.apiUrl)).json();this.count=t.count,this.lastUpdate=new Date(t.timestamp)}catch(e){console.error("Error fetching click count:",e)}},async incrementClick(){if(!this.loading){this.loading=!0,this.isClicking=!0;try{const t=await(await fetch(`${this.apiUrl}/increment`,{method:"POST"})).json();this.count=t.count,this.lastUpdate=new Date(t.timestamp),setTimeout(()=>{this.isClicking=!1},100)}catch(e){console.error("Error incrementing click:",e)}finally{this.loading=!1}}},formatTime(e){const s=new Date().getTime()-e.getTime();return s<1e3?"just now":s<6e4?`${Math.floor(s/1e3)}s ago`:s<36e5?`${Math.floor(s/6e4)}m ago`:e.toLocaleTimeString()}},mounted(){this.fetchCount(),setInterval(()=>this.fetchCount(),5e3)}}),Ne={IS_FEMALE:70,IS_MOSTLY_FEMALE:102,IS_MALE:77,IS_MOSTLY_MALE:109,IS_UNISEX_NAME:63,IS_A_COUPLE:67,NAME_NOT_FOUND:32,ERROR_IN_NAME:69},ll=fe({template:`
    <div class="gender-picker">
      <div class="gender-picker-container">
        <div class="emoji">🔮</div>
        <h1>Gender Detector</h1>
        <p>Enter a name to detect its gender!</p>
        
        <form class="gender-form" @submit.prevent="detectGender">
          <div class="form-group">
            <label for="name">Name:</label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="Enter a name"
              required
              class="name-input"
            />
          </div>
          
          <div class="form-group">
            <label for="country">Country:</label>
            <select
              id="country"
              v-model="selectedCountry"
              class="country-select"
            >
              <option v-for="country in countries" :key="country.value" :value="country.value">
                {{ country.flag }} {{ country.name }}
              </option>
            </select>
          </div>
          
          <button
            type="submit"
            class="detect-btn"
            :disabled="loading || !name.trim()"
          >
            {{ loading ? 'Detecting...' : '🔮 Detect Gender' }}
          </button>
        </form>
        
        <div v-if="result" class="gender-result" :class="result.resultClass">
          <div class="result-emoji">{{ result.emoji }}</div>
          <h2>{{ result.gender }}</h2>
          <p v-if="result.confidence">Confidence: {{ result.confidence }}</p>
        </div>
        
        <div v-if="error" class="gender-error">
          <div class="emoji">❌</div>
          <p>{{ error }}</p>
        </div>
        
        <button class="cute-btn back-btn" @click="$emit('back')">← Back Home</button>
      </div>
    </div>
  `,props:{darkMode:{type:Boolean,default:!1}},emits:["back"],data(){return{name:"",selectedCountry:0,loading:!1,result:null,error:null,countries:[{value:0,name:"Any Country",flag:"🌍"},{value:1,name:"USA",flag:"🇺🇸"},{value:2,name:"UK",flag:"🇬🇧"},{value:3,name:"Germany",flag:"🇩🇪"},{value:4,name:"France",flag:"🇫🇷"},{value:5,name:"Spain",flag:"🇪🇸"},{value:6,name:"Italy",flag:"🇮🇹"},{value:7,name:"Netherlands",flag:"🇳🇱"},{value:8,name:"Poland",flag:"🇵🇱"},{value:9,name:"Russia",flag:"🇷🇺"}]}},methods:{async detectGender(){if(this.name.trim()){this.loading=!0,this.result=null,this.error=null;try{const e=await fetch("/api/gender",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:this.name,country:this.selectedCountry})});if(!e.ok)throw new Error("Failed to detect gender");const t=await e.json(),n={[Ne.IS_FEMALE]:{gender:"Female",confidence:"High",emoji:"👩",resultClass:"result-female"},[Ne.IS_MOSTLY_FEMALE]:{gender:"Mostly Female",confidence:"Moderate",emoji:"👩",resultClass:"result-female-likely"},[Ne.IS_MALE]:{gender:"Male",confidence:"High",emoji:"👨",resultClass:"result-male"},[Ne.IS_MOSTLY_MALE]:{gender:"Mostly Male",confidence:"Moderate",emoji:"👨",resultClass:"result-male-likely"},[Ne.IS_UNISEX_NAME]:{gender:"Unisex",confidence:"N/A",emoji:"🧑",resultClass:"result-unisex"},[Ne.IS_A_COUPLE]:{gender:"Couple",confidence:"N/A",emoji:"👫",resultClass:"result-couple"},[Ne.NAME_NOT_FOUND]:{gender:"Name Not Found",confidence:"N/A",emoji:"❓",resultClass:"result-unknown"},[Ne.ERROR_IN_NAME]:{gender:"Error",confidence:"N/A",emoji:"⚠️",resultClass:"result-error"}}[t.gender_code];n?this.result=n:this.error="Unable to determine gender"}catch(e){this.error="Error detecting gender. Please try again.",console.error("Gender detection error:",e)}finally{this.loading=!1}}}}}),cl=fe({components:{QuoteSection:Zo,RankingsPanel:el,CatPanel:tl,Tachometer:sl,GirlModePage:nl,FeedPanel:il,MikaModal:rl,ClickCounter:ol,GenderPicker:ll},props:{darkMode:{type:Boolean,default:!1},musicPlaying:{type:Boolean,default:!1},currentRoute:{type:String,default:"home"},currentQuote:{type:String,required:!0},currentCatImage:{type:String,required:!0},tachValue:{type:Number,default:77},fartClicked:{type:Boolean,default:!1},fartExploded:{type:Boolean,default:!1},rankings:{type:Array,required:!0},panels:{type:Object,default:()=>({rankings:!0,cat:!0,feed:!1})},mikaModalOpen:{type:Boolean,default:!1},confirmationOpen:{type:Boolean,default:!1}},emits:["toggle-dark-mode","toggle-music","toggle-panel","route-change","mika-close","close-confirmation","next-quote","new-cat","fart","turn-me"],methods:{toggleDarkMode(){this.$emit("toggle-dark-mode")},toggleMusic(){this.$emit("toggle-music")},togglePanel(e){this.$emit("toggle-panel",e)},onRouteChange(e){this.$emit("route-change",e)},nextQuote(){this.$emit("next-quote")},nextCat(){this.$emit("new-cat")},onFart(){this.$emit("fart")},onTurnMe(){this.$emit("turn-me")},openMikaModal(){this.$emit("confirmation-open")},closeMikaModal(){this.$emit("mika-close")},closeConfirmation(){this.$emit("close-confirmation")},goToGirlMode(){console.log("Going to girl mode..."),this.$emit("close-confirmation"),setTimeout(()=>{this.$emit("route-change","girl"),console.log("Route change emitted: girl")},100)},getTrendClass(e){const t=["trend-up","trend-down","trend-same"];return t[e%t.length]}},template:`
    <div class="main-app" :class="{ dark: darkMode }">
      <!-- Header Controls -->
      <div class="header-controls">
        <button @click="toggleDarkMode" class="control-btn" :class="{ active: darkMode }">
          {{ darkMode ? '🌙' : '☀️' }}
        </button>
        <button @click="toggleMusic" class="control-btn" :class="{ active: musicPlaying }">
          {{ musicPlaying ? '🔊' : '🔇' }}
        </button>
        <button @click="togglePanel('rankings')" class="control-btn" :class="{ active: panels.rankings }">
          👻
        </button>
        <button @click="togglePanel('cat')" class="control-btn" :class="{ active: panels.cat }">
          🐱
        </button>
        <button @click="togglePanel('feed')" class="control-btn" :class="{ active: panels.feed }">
          📰
        </button>
      </div>

      <!-- Route-specific content -->
      <div class="content-area">
        <!-- Home Page -->
        <div v-if="currentRoute === 'home'" class="page home-page">
          <QuoteSection :quote="currentQuote" @next="nextQuote" />
          <Tachometer :value="tachValue" />
          <ClickCounter @fart="onFart" @turn-me="onTurnMe" />
        </div>

        <!-- Girl Mode Page -->
        <GirlModePage v-else-if="currentRoute === 'girl'" @close="onRouteChange('home')" />

        <!-- Gender Page -->
        <div v-else-if="currentRoute === 'gender'" class="page gender-page">
          <GenderPicker @close="onRouteChange('home')" />
        </div>

        <!-- About Page -->
        <div v-else-if="currentRoute === 'about'" class="page about-page">
          <h1>About</h1>
          <p>This is Mika's cool website! ✨</p>
        </div>

        <!-- Rankings Page -->
        <div v-else-if="currentRoute === 'rankings'" class="page rankings-page">
          <RankingsPanel :rankings="rankings" :get-trend-class="getTrendClass" />
        </div>

        <!-- Cats Page -->
        <div v-else-if="currentRoute === 'cats'" class="page cats-page">
          <CatPanel :cat-image="currentCatImage" :loading="false" @new-cat="nextCat" />
        </div>
      </div>

      <!-- Floating Panels -->
      <!-- Bottom Left Coolness Rankings Panel (Always Visible) -->
      <div v-if="panelOpen.coolnessPanel" class="coolness-panel-bottom-left">
        <div class="coolness-panel-header">
          <span>🏆 Coolness Rankings</span>
          <button @click="togglePanel('coolnessPanel')" class="close-btn">×</button>
        </div>
        <div class="coolness-panel-list">
          <div
            v-for="(person, index) in rankings"
            :key="person.name"
            class="coolness-item"
            :class="{ 'is-current-user': person.isCurrentUser }"
          >
            <span class="rank">{{ index + 1 }}.</span>
            <span class="avatar">{{ person.avatar }}</span>
            <span class="name">{{ person.name }}</span>
            <span class="score">{{ person.score.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <RankingsPanel
        v-if="panels.rankings && currentRoute === 'home'"
        :rankings="rankings"
        :get-trend-class="getTrendClass"
        class="floating-panel rankings-panel"
      />
      <CatPanel
        v-if="panels.cat && currentRoute === 'home'"
        :cat-image="currentCatImage"
        :loading="false"
        @new-cat="nextCat"
        class="floating-panel cat-panel"
      />
      <FeedPanel
        v-if="panels.feed"
        class="floating-panel feed-panel"
        @close="togglePanel('feed')"
      />

      <!-- Modals -->
      <MikaModal
        v-if="mikaModalOpen"
        @close="closeMikaModal"
      />
    </div>

    <!-- Audio elements -->
    <audio id="newMusic" loop>
      <source src="/newMusic.mp3" type="audio/mpeg">
    </audio>
    <audio id="fartSound">
      <source src="/fart-with-reverb.mp3" type="audio/mpeg">
    </audio>

    <style>
      /* Bottom Left Coolness Panel */
      .coolness-panel-bottom-left {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(40, 44, 52, 0.95);
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .dark .coolness-panel-bottom-left {
        background: rgba(20, 24, 32, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .coolness-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-weight: bold;
        color: #e2e8f0;
        font-size: 14px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #a0aec0;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .coolness-panel-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .coolness-item {
        display: grid;
        grid-template-columns: 24px 24px 1fr auto;
        gap: 8px;
        align-items: center;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        font-size: 13px;
        transition: background 0.2s;
      }

      .coolness-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .coolness-item.is-current-user {
        background: rgba(34, 197, 94, 0.2);
        border: 1px solid rgba(34, 197, 94, 0.4);
      }

      .rank {
        color: #a0aec0;
        font-weight: bold;
      }

      .avatar {
        font-size: 16px;
      }

      .name {
        color: #e2e8f0;
        font-weight: 500;
      }

      .score {
        color: #48bb78;
        font-weight: bold;
        font-size: 12px;
      }

      .dark .score {
        color: #68d391;
      }
    </style>
  `}),al=fe({props:{currentRoute:{type:String,default:"home"}},data(){return{routes:{home:{title:"Home",icon:"🌸"},girl:{title:"Girl Mode",icon:"💕"},gender:{title:"Gender",icon:"🔮"},about:{title:"About",icon:"ℹ️"},rankings:{title:"Rankings",icon:"👻"},cats:{title:"Cats",icon:"🐱"}}}},methods:{navigate(e){this.$emit("route-change",e),window.scrollTo(0,0)}},template:`
    <div class="router-nav">
      <button
        v-for="(routeData, routeName) in routes"
        :key="routeName"
        :class="{ active: currentRoute === routeName }"
        @click="navigate(routeName)"
        class="router-link"
        :title="routeData.title"
      >
        {{ routeData.icon }} {{ routeData.title }}
      </button>
    </div>
  `,emits:["route-change"]}),fl=fe({name:"App",components:{MainApp:cl,Router:al},setup(){const e=ee("home"),t=ee(!1),s=ee(!1),n=ee(!1),i=ee(0),r=ee(77),o=ee(!1),c=ee(!1),f=ee(!1),p=ee(!1),u=ee({rankings:!0,cat:!0,feed:!1,coolnessPanel:!0}),h=ee(["Stay curious, keep asking questions.","The best way to predict future is to create it.","Every moment is a fresh beginning.","Chaos is just order waiting to be discovered.","Your potential is endless.","Keep being weird.","Normal is overrated.","Be energy you want to see in world."]),w=ee("https://cataas.com/cat"),S=ee(!1),R=ee([]),I=()=>{t.value=!t.value,document.body.classList.toggle("dark",t.value)},Y=()=>{s.value=!s.value;const P=document.getElementById("newMusic");s.value?P.play():P.pause()},N=P=>{u.value[P]=!u.value[P]},$=()=>{i.value=(i.value+1)%h.value.length},K=async()=>{try{S.value=!0;const P=await fetch("https://cataas.com/cat");if(!P.ok){console.error("Failed to fetch cat:",P.status);return}const Fe=await P.blob(),ct=URL.createObjectURL(Fe);w.value=ct}catch(P){console.error("Error fetching cat:",P)}finally{S.value=!1}},E=()=>{if(o.value)return;o.value=!0;const P=document.getElementById("fartSound");P&&(P.currentTime=0,P.play()),setTimeout(()=>{p.value=!0},300),c.value=!0,setTimeout(()=>{c.value=!1,o.value=!1},500),r.value=Math.floor(Math.random()*100)},q=()=>{const P=document.getElementById("fartSound");P&&(P.currentTime=0,P.play()),setTimeout(()=>{p.value=!0},300)},pe=()=>{p.value=!1},ae=()=>{f.value=!1},he=P=>{e.value=P},Ze=async()=>{try{const Fe=await(await fetch("/api/rankings")).json();R.value=Fe}catch(P){console.error("Failed to load rankings:",P)}},Te=()=>{const P=document.createElement("div");P.className="heart",P.innerHTML=["💖","💕","💗","💓","❤️"][Math.floor(Math.random()*5)],P.style.left=Math.random()*100+"vw",P.style.animationDuration=Math.random()*3+3+"s",document.body.appendChild(P),setTimeout(()=>P.remove(),6e3)},Ke=Ci(()=>h.value[i.value]);return ei(()=>{document.body.classList.toggle("dark",t.value),setInterval(Te,500),fetch("/api/rankings").then(P=>P.json()).then(P=>{R.value=P}).catch(P=>console.error("Failed to load rankings:",P)),console.log("🩺 Riddle Answer: The surgeon is his mother."),setInterval(Ze,3e4)}),{currentRoute:e,darkMode:t,musicPlaying:s,feedOpen:n,currentQuote:Ke,catImage:w,catLoading:S,tachValue:r,fartClicked:o,fartExploded:c,panelOpen:u,mikaModalOpen:f,confirmationOpen:p,rankings:R,toggleDarkMode:I,toggleMusic:Y,togglePanel:N,nextQuote:$,nextCat:K,onFart:E,onTurnMe:q,closeConfirmation:pe,closeMikaModal:ae,onRouteChange:he}},template:`
    <div class="main-app">
      <Router
        :current-route="currentRoute"
        @route-change="onRouteChange"
      />

      <MainApp
        :dark-mode="darkMode"
        :music-playing="musicPlaying"
        :current-route="currentRoute"
        :current-quote="currentQuote"
        :current-cat-image="catImage"
        :tach-value="tachValue"
        :fart-clicked="fartClicked"
        :fart-exploded="fartExploded"
        :rankings="rankings"
        :panels="panelOpen"
        :mika-modal-open="mikaModalOpen"
        :confirmation-open="confirmationOpen"
        @toggle-dark-mode="toggleDarkMode"
        @toggle-music="toggleMusic"
        @toggle-panel="togglePanel"
        @next-quote="nextQuote"
        @new-cat="nextCat"
        @fart="onFart"
        @turn-me="onTurnMe"
        @close-confirmation="closeConfirmation"
        @route-change="onRouteChange"
      />
    </div>
  `});Jo(fl).mount("#app");
