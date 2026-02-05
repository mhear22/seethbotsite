(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function lu(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const At={},Ks=[],si=()=>{},gh=()=>!1,wa=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),cu=n=>n.startsWith("onUpdate:"),Gt=Object.assign,uu=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Zm=Object.prototype.hasOwnProperty,xt=(n,e)=>Zm.call(n,e),qe=Array.isArray,Zs=n=>io(n)==="[object Map]",pr=n=>io(n)==="[object Set]",td=n=>io(n)==="[object Date]",Qe=n=>typeof n=="function",Bt=n=>typeof n=="string",$n=n=>typeof n=="symbol",wt=n=>n!==null&&typeof n=="object",vh=n=>(wt(n)||Qe(n))&&Qe(n.then)&&Qe(n.catch),_h=Object.prototype.toString,io=n=>_h.call(n),Jm=n=>io(n).slice(8,-1),xh=n=>io(n)==="[object Object]",Ta=n=>Bt(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Fr=lu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Aa=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Qm=/-\w/g,Un=Aa(n=>n.replace(Qm,e=>e.slice(1).toUpperCase())),eg=/\B([A-Z])/g,ns=Aa(n=>n.replace(eg,"-$1").toLowerCase()),Ca=Aa(n=>n.charAt(0).toUpperCase()+n.slice(1)),Ka=Aa(n=>n?`on${Ca(n)}`:""),Qi=(n,e)=>!Object.is(n,e),Yo=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},yh=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},Ra=n=>{const e=parseFloat(n);return isNaN(e)?n:e},tg=n=>{const e=Bt(n)?Number(n):NaN;return isNaN(e)?n:e};let nd;const Pa=()=>nd||(nd=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Ht(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=Bt(i)?rg(i):Ht(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Bt(n)||wt(n))return n}const ng=/;(?![^(]*\))/g,ig=/:([^]+)/,sg=/\/\*[^]*?\*\//g;function rg(n){const e={};return n.replace(sg,"").split(ng).forEach(t=>{if(t){const i=t.split(ig);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Ue(n){let e="";if(Bt(n))e=n;else if(qe(n))for(let t=0;t<n.length;t++){const i=Ue(n[t]);i&&(e+=i+" ")}else if(wt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const og="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",ag=lu(og);function Sh(n){return!!n||n===""}function lg(n,e){if(n.length!==e.length)return!1;let t=!0;for(let i=0;t&&i<n.length;i++)t=ws(n[i],e[i]);return t}function ws(n,e){if(n===e)return!0;let t=td(n),i=td(e);if(t||i)return t&&i?n.getTime()===e.getTime():!1;if(t=$n(n),i=$n(e),t||i)return n===e;if(t=qe(n),i=qe(e),t||i)return t&&i?lg(n,e):!1;if(t=wt(n),i=wt(e),t||i){if(!t||!i)return!1;const s=Object.keys(n).length,r=Object.keys(e).length;if(s!==r)return!1;for(const o in n){const a=n.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!ws(n[o],e[o]))return!1}}return String(n)===String(e)}function du(n,e){return n.findIndex(t=>ws(t,e))}const Mh=n=>!!(n&&n.__v_isRef===!0),z=n=>Bt(n)?n:n==null?"":qe(n)||wt(n)&&(n.toString===_h||!Qe(n.toString))?Mh(n)?z(n.value):JSON.stringify(n,bh,2):String(n),bh=(n,e)=>Mh(e)?bh(n,e.value):Zs(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s],r)=>(t[Za(i,r)+" =>"]=s,t),{})}:pr(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Za(t))}:$n(e)?Za(e):wt(e)&&!qe(e)&&!xh(e)?String(e):e,Za=(n,e="")=>{var t;return $n(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let nn;class Eh{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=nn,!e&&nn&&(this.index=(nn.scopes||(nn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=nn;try{return nn=this,e()}finally{nn=t}}}on(){++this._on===1&&(this.prevScope=nn,nn=this)}off(){this._on>0&&--this._on===0&&(nn=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function wh(n){return new Eh(n)}function Th(){return nn}function cg(n,e=!1){nn&&nn.cleanups.push(n)}let Pt;const Ja=new WeakSet;class Ah{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,nn&&nn.active&&nn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Ja.has(this)&&(Ja.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Rh(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,id(this),Ph(this);const e=Pt,t=Hn;Pt=this,Hn=!0;try{return this.fn()}finally{Ih(this),Pt=e,Hn=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)pu(e);this.deps=this.depsTail=void 0,id(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Ja.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){ql(this)&&this.run()}get dirty(){return ql(this)}}let Ch=0,Or,kr;function Rh(n,e=!1){if(n.flags|=8,e){n.next=kr,kr=n;return}n.next=Or,Or=n}function fu(){Ch++}function hu(){if(--Ch>0)return;if(kr){let e=kr;for(kr=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;Or;){let e=Or;for(Or=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function Ph(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Ih(n){let e,t=n.depsTail,i=t;for(;i;){const s=i.prevDep;i.version===-1?(i===t&&(t=s),pu(i),ug(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}n.deps=e,n.depsTail=t}function ql(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Dh(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Dh(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Wr)||(n.globalVersion=Wr,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!ql(n))))return;n.flags|=2;const e=n.dep,t=Pt,i=Hn;Pt=n,Hn=!0;try{Ph(n);const s=n.fn(n._value);(e.version===0||Qi(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{Pt=t,Hn=i,Ih(n),n.flags&=-3}}function pu(n,e=!1){const{dep:t,prevSub:i,nextSub:s}=n;if(i&&(i.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let r=t.computed.deps;r;r=r.nextDep)pu(r,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function ug(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Hn=!0;const Lh=[];function Ii(){Lh.push(Hn),Hn=!1}function Di(){const n=Lh.pop();Hn=n===void 0?!0:n}function id(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=Pt;Pt=void 0;try{e()}finally{Pt=t}}}let Wr=0;class dg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class mu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Pt||!Hn||Pt===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==Pt)t=this.activeLink=new dg(Pt,this),Pt.deps?(t.prevDep=Pt.depsTail,Pt.depsTail.nextDep=t,Pt.depsTail=t):Pt.deps=Pt.depsTail=t,Nh(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=Pt.depsTail,t.nextDep=void 0,Pt.depsTail.nextDep=t,Pt.depsTail=t,Pt.deps===t&&(Pt.deps=i)}return t}trigger(e){this.version++,Wr++,this.notify(e)}notify(e){fu();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{hu()}}}function Nh(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)Nh(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const la=new WeakMap,bs=Symbol(""),jl=Symbol(""),Xr=Symbol("");function sn(n,e,t){if(Hn&&Pt){let i=la.get(n);i||la.set(n,i=new Map);let s=i.get(t);s||(i.set(t,s=new mu),s.map=i,s.key=t),s.track()}}function Ei(n,e,t,i,s,r){const o=la.get(n);if(!o){Wr++;return}const a=l=>{l&&l.trigger()};if(fu(),e==="clear")o.forEach(a);else{const l=qe(n),c=l&&Ta(t);if(l&&t==="length"){const u=Number(i);o.forEach((d,h)=>{(h==="length"||h===Xr||!$n(h)&&h>=u)&&a(d)})}else switch((t!==void 0||o.has(void 0))&&a(o.get(t)),c&&a(o.get(Xr)),e){case"add":l?c&&a(o.get("length")):(a(o.get(bs)),Zs(n)&&a(o.get(jl)));break;case"delete":l||(a(o.get(bs)),Zs(n)&&a(o.get(jl)));break;case"set":Zs(n)&&a(o.get(bs));break}}hu()}function fg(n,e){const t=la.get(n);return t&&t.get(e)}function Rs(n){const e=ft(n);return e===n?e:(sn(e,"iterate",Xr),Tn(n)?e:e.map(Wn))}function Ia(n){return sn(n=ft(n),"iterate",Xr),n}function qi(n,e){return Li(n)?nr(Ci(n)?Wn(e):e):Wn(e)}const hg={__proto__:null,[Symbol.iterator](){return Qa(this,Symbol.iterator,n=>qi(this,n))},concat(...n){return Rs(this).concat(...n.map(e=>qe(e)?Rs(e):e))},entries(){return Qa(this,"entries",n=>(n[1]=qi(this,n[1]),n))},every(n,e){return gi(this,"every",n,e,void 0,arguments)},filter(n,e){return gi(this,"filter",n,e,t=>t.map(i=>qi(this,i)),arguments)},find(n,e){return gi(this,"find",n,e,t=>qi(this,t),arguments)},findIndex(n,e){return gi(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return gi(this,"findLast",n,e,t=>qi(this,t),arguments)},findLastIndex(n,e){return gi(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return gi(this,"forEach",n,e,void 0,arguments)},includes(...n){return el(this,"includes",n)},indexOf(...n){return el(this,"indexOf",n)},join(n){return Rs(this).join(n)},lastIndexOf(...n){return el(this,"lastIndexOf",n)},map(n,e){return gi(this,"map",n,e,void 0,arguments)},pop(){return xr(this,"pop")},push(...n){return xr(this,"push",n)},reduce(n,...e){return sd(this,"reduce",n,e)},reduceRight(n,...e){return sd(this,"reduceRight",n,e)},shift(){return xr(this,"shift")},some(n,e){return gi(this,"some",n,e,void 0,arguments)},splice(...n){return xr(this,"splice",n)},toReversed(){return Rs(this).toReversed()},toSorted(n){return Rs(this).toSorted(n)},toSpliced(...n){return Rs(this).toSpliced(...n)},unshift(...n){return xr(this,"unshift",n)},values(){return Qa(this,"values",n=>qi(this,n))}};function Qa(n,e,t){const i=Ia(n),s=i[e]();return i!==n&&!Tn(n)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=t(r.value)),r}),s}const pg=Array.prototype;function gi(n,e,t,i,s,r){const o=Ia(n),a=o!==n&&!Tn(n),l=o[e];if(l!==pg[e]){const d=l.apply(n,r);return a?Wn(d):d}let c=t;o!==n&&(a?c=function(d,h){return t.call(this,qi(n,d),h,n)}:t.length>2&&(c=function(d,h){return t.call(this,d,h,n)}));const u=l.call(o,c,i);return a&&s?s(u):u}function sd(n,e,t,i){const s=Ia(n);let r=t;return s!==n&&(Tn(n)?t.length>3&&(r=function(o,a,l){return t.call(this,o,a,l,n)}):r=function(o,a,l){return t.call(this,o,qi(n,a),l,n)}),s[e](r,...i)}function el(n,e,t){const i=ft(n);sn(i,"iterate",Xr);const s=i[e](...t);return(s===-1||s===!1)&&Da(t[0])?(t[0]=ft(t[0]),i[e](...t)):s}function xr(n,e,t=[]){Ii(),fu();const i=ft(n)[e].apply(n,t);return hu(),Di(),i}const mg=lu("__proto__,__v_isRef,__isVue"),Uh=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter($n));function gg(n){$n(n)||(n=String(n));const e=ft(this);return sn(e,"has",n),e.hasOwnProperty(n)}class Fh{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return r;if(t==="__v_raw")return i===(s?r?Tg:Vh:r?Bh:kh).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const o=qe(e);if(!s){let l;if(o&&(l=hg[t]))return l;if(t==="hasOwnProperty")return gg}const a=Reflect.get(e,t,kt(e)?e:i);if(($n(t)?Uh.has(t):mg(t))||(s||sn(e,"get",t),r))return a;if(kt(a)){const l=o&&Ta(t)?a:a.value;return s&&wt(l)?Kl(l):l}return wt(a)?s?Kl(a):so(a):a}}class Oh extends Fh{constructor(e=!1){super(!1,e)}set(e,t,i,s){let r=e[t];const o=qe(e)&&Ta(t);if(!this._isShallow){const c=Li(r);if(!Tn(i)&&!Li(i)&&(r=ft(r),i=ft(i)),!o&&kt(r)&&!kt(i))return c||(r.value=i),!0}const a=o?Number(t)<e.length:xt(e,t),l=Reflect.set(e,t,i,kt(e)?e:s);return e===ft(s)&&(a?Qi(i,r)&&Ei(e,"set",t,i):Ei(e,"add",t,i)),l}deleteProperty(e,t){const i=xt(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&i&&Ei(e,"delete",t,void 0),s}has(e,t){const i=Reflect.has(e,t);return(!$n(t)||!Uh.has(t))&&sn(e,"has",t),i}ownKeys(e){return sn(e,"iterate",qe(e)?"length":bs),Reflect.ownKeys(e)}}class vg extends Fh{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const _g=new Oh,xg=new vg,yg=new Oh(!0);const Yl=n=>n,vo=n=>Reflect.getPrototypeOf(n);function Sg(n,e,t){return function(...i){const s=this.__v_raw,r=ft(s),o=Zs(r),a=n==="entries"||n===Symbol.iterator&&o,l=n==="keys"&&o,c=s[n](...i),u=t?Yl:e?nr:Wn;return!e&&sn(r,"iterate",l?jl:bs),Gt(Object.create(c),{next(){const{value:d,done:h}=c.next();return h?{value:d,done:h}:{value:a?[u(d[0]),u(d[1])]:u(d),done:h}}})}}function _o(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function Mg(n,e){const t={get(s){const r=this.__v_raw,o=ft(r),a=ft(s);n||(Qi(s,a)&&sn(o,"get",s),sn(o,"get",a));const{has:l}=vo(o),c=e?Yl:n?nr:Wn;if(l.call(o,s))return c(r.get(s));if(l.call(o,a))return c(r.get(a));r!==o&&r.get(s)},get size(){const s=this.__v_raw;return!n&&sn(ft(s),"iterate",bs),s.size},has(s){const r=this.__v_raw,o=ft(r),a=ft(s);return n||(Qi(s,a)&&sn(o,"has",s),sn(o,"has",a)),s===a?r.has(s):r.has(s)||r.has(a)},forEach(s,r){const o=this,a=o.__v_raw,l=ft(a),c=e?Yl:n?nr:Wn;return!n&&sn(l,"iterate",bs),a.forEach((u,d)=>s.call(r,c(u),c(d),o))}};return Gt(t,n?{add:_o("add"),set:_o("set"),delete:_o("delete"),clear:_o("clear")}:{add(s){!e&&!Tn(s)&&!Li(s)&&(s=ft(s));const r=ft(this);return vo(r).has.call(r,s)||(r.add(s),Ei(r,"add",s,s)),this},set(s,r){!e&&!Tn(r)&&!Li(r)&&(r=ft(r));const o=ft(this),{has:a,get:l}=vo(o);let c=a.call(o,s);c||(s=ft(s),c=a.call(o,s));const u=l.call(o,s);return o.set(s,r),c?Qi(r,u)&&Ei(o,"set",s,r):Ei(o,"add",s,r),this},delete(s){const r=ft(this),{has:o,get:a}=vo(r);let l=o.call(r,s);l||(s=ft(s),l=o.call(r,s)),a&&a.call(r,s);const c=r.delete(s);return l&&Ei(r,"delete",s,void 0),c},clear(){const s=ft(this),r=s.size!==0,o=s.clear();return r&&Ei(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=Sg(s,n,e)}),t}function gu(n,e){const t=Mg(n,e);return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(xt(t,s)&&s in i?t:i,s,r)}const bg={get:gu(!1,!1)},Eg={get:gu(!1,!0)},wg={get:gu(!0,!1)};const kh=new WeakMap,Bh=new WeakMap,Vh=new WeakMap,Tg=new WeakMap;function Ag(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Cg(n){return n.__v_skip||!Object.isExtensible(n)?0:Ag(Jm(n))}function so(n){return Li(n)?n:vu(n,!1,_g,bg,kh)}function zh(n){return vu(n,!1,yg,Eg,Bh)}function Kl(n){return vu(n,!0,xg,wg,Vh)}function vu(n,e,t,i,s){if(!wt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const r=Cg(n);if(r===0)return n;const o=s.get(n);if(o)return o;const a=new Proxy(n,r===2?i:t);return s.set(n,a),a}function Ci(n){return Li(n)?Ci(n.__v_raw):!!(n&&n.__v_isReactive)}function Li(n){return!!(n&&n.__v_isReadonly)}function Tn(n){return!!(n&&n.__v_isShallow)}function Da(n){return n?!!n.__v_raw:!1}function ft(n){const e=n&&n.__v_raw;return e?ft(e):n}function _u(n){return!xt(n,"__v_skip")&&Object.isExtensible(n)&&yh(n,"__v_skip",!0),n}const Wn=n=>wt(n)?so(n):n,nr=n=>wt(n)?Kl(n):n;function kt(n){return n?n.__v_isRef===!0:!1}function ne(n){return Hh(n,!1)}function Rg(n){return Hh(n,!0)}function Hh(n,e){return kt(n)?n:new Pg(n,e)}class Pg{constructor(e,t){this.dep=new mu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:ft(e),this._value=t?e:Wn(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||Tn(e)||Li(e);e=i?e:ft(e),Qi(e,t)&&(this._rawValue=e,this._value=i?e:Wn(e),this.dep.trigger())}}function ve(n){return kt(n)?n.value:n}const Ig={get:(n,e,t)=>e==="__v_raw"?n:ve(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return kt(s)&&!kt(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function Gh(n){return Ci(n)?n:new Proxy(n,Ig)}function Dg(n){const e=qe(n)?new Array(n.length):{};for(const t in n)e[t]=Ng(n,t);return e}class Lg{constructor(e,t,i){this._object=e,this._key=t,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._raw=ft(e);let s=!0,r=e;if(!qe(e)||!Ta(String(t)))do s=!Da(r)||Tn(r);while(s&&(r=r.__v_raw));this._shallow=s}get value(){let e=this._object[this._key];return this._shallow&&(e=ve(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&kt(this._raw[this._key])){const t=this._object[this._key];if(kt(t)){t.value=e;return}}this._object[this._key]=e}get dep(){return fg(this._raw,this._key)}}function Ng(n,e,t){return new Lg(n,e,t)}class Ug{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new mu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Wr-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&Pt!==this)return Rh(this,!0),!0}get value(){const e=this.dep.track();return Dh(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Fg(n,e,t=!1){let i,s;return Qe(n)?i=n:(i=n.get,s=n.set),new Ug(i,s,t)}const xo={},ca=new WeakMap;let ms;function Og(n,e=!1,t=ms){if(t){let i=ca.get(t);i||ca.set(t,i=[]),i.push(n)}}function kg(n,e,t=At){const{immediate:i,deep:s,once:r,scheduler:o,augmentJob:a,call:l}=t,c=b=>s?b:Tn(b)||s===!1||s===0?wi(b,1):wi(b);let u,d,h,g,_=!1,v=!1;if(kt(n)?(d=()=>n.value,_=Tn(n)):Ci(n)?(d=()=>c(n),_=!0):qe(n)?(v=!0,_=n.some(b=>Ci(b)||Tn(b)),d=()=>n.map(b=>{if(kt(b))return b.value;if(Ci(b))return c(b);if(Qe(b))return l?l(b,2):b()})):Qe(n)?e?d=l?()=>l(n,2):n:d=()=>{if(h){Ii();try{h()}finally{Di()}}const b=ms;ms=u;try{return l?l(n,3,[g]):n(g)}finally{ms=b}}:d=si,e&&s){const b=d,E=s===!0?1/0:s;d=()=>wi(b(),E)}const m=Th(),p=()=>{u.stop(),m&&m.active&&uu(m.effects,u)};if(r&&e){const b=e;e=(...E)=>{b(...E),p()}}let S=v?new Array(n.length).fill(xo):xo;const x=b=>{if(!(!(u.flags&1)||!u.dirty&&!b))if(e){const E=u.run();if(s||_||(v?E.some((A,T)=>Qi(A,S[T])):Qi(E,S))){h&&h();const A=ms;ms=u;try{const T=[E,S===xo?void 0:v&&S[0]===xo?[]:S,g];S=E,l?l(e,3,T):e(...T)}finally{ms=A}}}else u.run()};return a&&a(x),u=new Ah(d),u.scheduler=o?()=>o(x,!1):x,g=b=>Og(b,!1,u),h=u.onStop=()=>{const b=ca.get(u);if(b){if(l)l(b,4);else for(const E of b)E();ca.delete(u)}},e?i?x(!0):S=u.run():o?o(x.bind(null,!0),!0):u.run(),p.pause=u.pause.bind(u),p.resume=u.resume.bind(u),p.stop=p,p}function wi(n,e=1/0,t){if(e<=0||!wt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,kt(n))wi(n.value,e,t);else if(qe(n))for(let i=0;i<n.length;i++)wi(n[i],e,t);else if(pr(n)||Zs(n))n.forEach(i=>{wi(i,e,t)});else if(xh(n)){for(const i in n)wi(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&wi(n[i],e,t)}return n}/**
* @vue/runtime-core v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ro(n,e,t,i){try{return i?n(...i):n()}catch(s){La(s,e,t)}}function Xn(n,e,t,i){if(Qe(n)){const s=ro(n,e,t,i);return s&&vh(s)&&s.catch(r=>{La(r,e,t)}),s}if(qe(n)){const s=[];for(let r=0;r<n.length;r++)s.push(Xn(n[r],e,t,i));return s}}function La(n,e,t,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||At;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${t}`;for(;a;){const u=a.ec;if(u){for(let d=0;d<u.length;d++)if(u[d](n,l,c)===!1)return}a=a.parent}if(r){Ii(),ro(r,null,10,[n,l,c]),Di();return}}Bg(n,t,s,i,o)}function Bg(n,e,t,i=!0,s=!1){if(s)throw n;console.error(n)}const hn=[];let Jn=-1;const Js=[];let ji=null,Xs=0;const $h=Promise.resolve();let ua=null;function oo(n){const e=ua||$h;return n?e.then(this?n.bind(this):n):e}function Vg(n){let e=Jn+1,t=hn.length;for(;e<t;){const i=e+t>>>1,s=hn[i],r=qr(s);r<n||r===n&&s.flags&2?e=i+1:t=i}return e}function xu(n){if(!(n.flags&1)){const e=qr(n),t=hn[hn.length-1];!t||!(n.flags&2)&&e>=qr(t)?hn.push(n):hn.splice(Vg(e),0,n),n.flags|=1,Wh()}}function Wh(){ua||(ua=$h.then(qh))}function zg(n){qe(n)?Js.push(...n):ji&&n.id===-1?ji.splice(Xs+1,0,n):n.flags&1||(Js.push(n),n.flags|=1),Wh()}function rd(n,e,t=Jn+1){for(;t<hn.length;t++){const i=hn[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;hn.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Xh(n){if(Js.length){const e=[...new Set(Js)].sort((t,i)=>qr(t)-qr(i));if(Js.length=0,ji){ji.push(...e);return}for(ji=e,Xs=0;Xs<ji.length;Xs++){const t=ji[Xs];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}ji=null,Xs=0}}const qr=n=>n.id==null?n.flags&2?-1:1/0:n.id;function qh(n){try{for(Jn=0;Jn<hn.length;Jn++){const e=hn[Jn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),ro(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Jn<hn.length;Jn++){const e=hn[Jn];e&&(e.flags&=-2)}Jn=-1,hn.length=0,Xh(),ua=null,(hn.length||Js.length)&&qh()}}let Yt=null,jh=null;function da(n){const e=Yt;return Yt=n,jh=n&&n.type.__scopeId||null,e}function li(n,e=Yt,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&pa(-1);const r=da(e);let o;try{o=n(...s)}finally{da(r),i._d&&pa(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function Et(n,e){if(Yt===null)return n;const t=Oa(Yt),i=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[r,o,a,l=At]=e[s];r&&(Qe(r)&&(r={mounted:r,updated:r}),r.deep&&wi(o),i.push({dir:r,instance:t,value:o,oldValue:void 0,arg:a,modifiers:l}))}return n}function rs(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(Ii(),Xn(l,t,8,[n.el,a,n,e]),Di())}}function Ko(n,e){if(rn){let t=rn.provides;const i=rn.parent&&rn.parent.provides;i===t&&(t=rn.provides=Object.create(i)),t[n]=e}}function An(n,e,t=!1){const i=Eu();if(i||Es){let s=Es?Es._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&Qe(e)?e.call(i&&i.proxy):e}}function Hg(){return!!(Eu()||Es)}const Gg=Symbol.for("v-scx"),$g=()=>An(Gg);function Gn(n,e,t){return Yh(n,e,t)}function Yh(n,e,t=At){const{immediate:i,deep:s,flush:r,once:o}=t,a=Gt({},t),l=e&&i||!e&&r!=="post";let c;if(Zr){if(r==="sync"){const g=$g();c=g.__watcherHandles||(g.__watcherHandles=[])}else if(!l){const g=()=>{};return g.stop=si,g.resume=si,g.pause=si,g}}const u=rn;a.call=(g,_,v)=>Xn(g,u,_,v);let d=!1;r==="post"?a.scheduler=g=>{dn(g,u&&u.suspense)}:r!=="sync"&&(d=!0,a.scheduler=(g,_)=>{_?g():xu(g)}),a.augmentJob=g=>{e&&(g.flags|=4),d&&(g.flags|=2,u&&(g.id=u.uid,g.i=u))};const h=kg(n,e,a);return Zr&&(c?c.push(h):l&&h()),h}function Wg(n,e,t){const i=this.proxy,s=Bt(n)?n.includes(".")?Kh(i,n):()=>i[n]:n.bind(i,i);let r;Qe(e)?r=e:(r=e.handler,t=e);const o=ao(this),a=Yh(s,r.bind(i),t);return o(),a}function Kh(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}const Zh=Symbol("_vte"),Xg=n=>n.__isTeleport,Br=n=>n&&(n.disabled||n.disabled===""),od=n=>n&&(n.defer||n.defer===""),ad=n=>typeof SVGElement<"u"&&n instanceof SVGElement,ld=n=>typeof MathMLElement=="function"&&n instanceof MathMLElement,Zl=(n,e)=>{const t=n&&n.to;return Bt(t)?e?e(t):null:t},Jh={name:"Teleport",__isTeleport:!0,process(n,e,t,i,s,r,o,a,l,c){const{mc:u,pc:d,pbc:h,o:{insert:g,querySelector:_,createText:v,createComment:m}}=c,p=Br(e.props);let{shapeFlag:S,children:x,dynamicChildren:b}=e;if(n==null){const E=e.el=v(""),A=e.anchor=v("");g(E,t,i),g(A,t,i);const T=(M,w)=>{S&16&&u(x,M,w,s,r,o,a,l)},I=()=>{const M=e.target=Zl(e.props,_),w=Qh(M,e,v,g);M&&(o!=="svg"&&ad(M)?o="svg":o!=="mathml"&&ld(M)&&(o="mathml"),s&&s.isCE&&(s.ce._teleportTargets||(s.ce._teleportTargets=new Set)).add(M),p||(T(M,w),Zo(e,!1)))};p&&(T(t,A),Zo(e,!0)),od(e.props)?(e.el.__isMounted=!1,dn(()=>{I(),delete e.el.__isMounted},r)):I()}else{if(od(e.props)&&n.el.__isMounted===!1){dn(()=>{Jh.process(n,e,t,i,s,r,o,a,l,c)},r);return}e.el=n.el,e.targetStart=n.targetStart;const E=e.anchor=n.anchor,A=e.target=n.target,T=e.targetAnchor=n.targetAnchor,I=Br(n.props),M=I?t:A,w=I?E:T;if(o==="svg"||ad(A)?o="svg":(o==="mathml"||ld(A))&&(o="mathml"),b?(h(n.dynamicChildren,b,M,s,r,o,a),Mu(n,e,!0)):l||d(n,e,M,w,s,r,o,a,!1),p)I?e.props&&n.props&&e.props.to!==n.props.to&&(e.props.to=n.props.to):yo(e,t,E,c,1);else if((e.props&&e.props.to)!==(n.props&&n.props.to)){const N=e.target=Zl(e.props,_);N&&yo(e,N,null,c,0)}else I&&yo(e,A,T,c,1);Zo(e,p)}},remove(n,e,t,{um:i,o:{remove:s}},r){const{shapeFlag:o,children:a,anchor:l,targetStart:c,targetAnchor:u,target:d,props:h}=n;if(d&&(s(c),s(u)),r&&s(l),o&16){const g=r||!Br(h);for(let _=0;_<a.length;_++){const v=a[_];i(v,e,t,g,!!v.dynamicChildren)}}},move:yo,hydrate:qg};function yo(n,e,t,{o:{insert:i},m:s},r=2){r===0&&i(n.targetAnchor,e,t);const{el:o,anchor:a,shapeFlag:l,children:c,props:u}=n,d=r===2;if(d&&i(o,e,t),(!d||Br(u))&&l&16)for(let h=0;h<c.length;h++)s(c[h],e,t,2);d&&i(a,e,t)}function qg(n,e,t,i,s,r,{o:{nextSibling:o,parentNode:a,querySelector:l,insert:c,createText:u}},d){function h(v,m,p,S){m.anchor=d(o(v),m,a(v),t,i,s,r),m.targetStart=p,m.targetAnchor=S}const g=e.target=Zl(e.props,l),_=Br(e.props);if(g){const v=g._lpa||g.firstChild;if(e.shapeFlag&16)if(_)h(n,e,v,v&&o(v));else{e.anchor=o(n);let m=v;for(;m;){if(m&&m.nodeType===8){if(m.data==="teleport start anchor")e.targetStart=m;else if(m.data==="teleport anchor"){e.targetAnchor=m,g._lpa=e.targetAnchor&&o(e.targetAnchor);break}}m=o(m)}e.targetAnchor||Qh(g,e,u,c),d(v&&o(v),e,g,t,i,s,r)}Zo(e,_)}else _&&e.shapeFlag&16&&h(n,e,n,o(n));return e.anchor&&o(e.anchor)}const jg=Jh;function Zo(n,e){const t=n.ctx;if(t&&t.ut){let i,s;for(e?(i=n.el,s=n.anchor):(i=n.targetStart,s=n.targetAnchor);i&&i!==s;)i.nodeType===1&&i.setAttribute("data-v-owner",t.uid),i=i.nextSibling;t.ut()}}function Qh(n,e,t,i){const s=e.targetStart=t(""),r=e.targetAnchor=t("");return s[Zh]=r,n&&(i(s,n),i(r,n)),r}const gs=Symbol("_leaveCb"),So=Symbol("_enterCb");function Yg(){const n={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return It(()=>{n.isMounted=!0}),rp(()=>{n.isUnmounting=!0}),n}const Pn=[Function,Array],Kg={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:Pn,onEnter:Pn,onAfterEnter:Pn,onEnterCancelled:Pn,onBeforeLeave:Pn,onLeave:Pn,onAfterLeave:Pn,onLeaveCancelled:Pn,onBeforeAppear:Pn,onAppear:Pn,onAfterAppear:Pn,onAppearCancelled:Pn};function Zg(n,e){const{leavingVNodes:t}=n;let i=t.get(e.type);return i||(i=Object.create(null),t.set(e.type,i)),i}function Jl(n,e,t,i,s){const{appear:r,mode:o,persisted:a=!1,onBeforeEnter:l,onEnter:c,onAfterEnter:u,onEnterCancelled:d,onBeforeLeave:h,onLeave:g,onAfterLeave:_,onLeaveCancelled:v,onBeforeAppear:m,onAppear:p,onAfterAppear:S,onAppearCancelled:x}=e,b=String(n.key),E=Zg(t,n),A=(M,w)=>{M&&Xn(M,i,9,w)},T=(M,w)=>{const N=w[1];A(M,w),qe(M)?M.every(O=>O.length<=1)&&N():M.length<=1&&N()},I={mode:o,persisted:a,beforeEnter(M){let w=l;if(!t.isMounted)if(r)w=m||l;else return;M[gs]&&M[gs](!0);const N=E[b];N&&qs(n,N)&&N.el[gs]&&N.el[gs](),A(w,[M])},enter(M){let w=c,N=u,O=d;if(!t.isMounted)if(r)w=p||c,N=S||u,O=x||d;else return;let q=!1;const Q=M[So]=te=>{q||(q=!0,te?A(O,[M]):A(N,[M]),I.delayedLeave&&I.delayedLeave(),M[So]=void 0)};w?T(w,[M,Q]):Q()},leave(M,w){const N=String(n.key);if(M[So]&&M[So](!0),t.isUnmounting)return w();A(h,[M]);let O=!1;const q=M[gs]=Q=>{O||(O=!0,w(),Q?A(v,[M]):A(_,[M]),M[gs]=void 0,E[N]===n&&delete E[N])};E[N]=n,g?T(g,[M,q]):q()},clone(M){return Jl(M,e,t,i)}};return I}function jr(n,e){n.shapeFlag&6&&n.component?(n.transition=e,jr(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function ep(n,e=!1,t){let i=[],s=0;for(let r=0;r<n.length;r++){let o=n[r];const a=t==null?o.key:String(t)+String(o.key!=null?o.key:r);o.type===Xe?(o.patchFlag&128&&s++,i=i.concat(ep(o.children,e,a))):(e||o.type!==ci)&&i.push(a!=null?Ts(o,{key:a}):o)}if(s>1)for(let r=0;r<i.length;r++)i[r].patchFlag=-2;return i}function et(n,e){return Qe(n)?Gt({name:n.name},e,{setup:n}):n}function tp(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}const fa=new WeakMap;function Vr(n,e,t,i,s=!1){if(qe(n)){n.forEach((_,v)=>Vr(_,e&&(qe(e)?e[v]:e),t,i,s));return}if(Qs(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&Vr(n,e,t,i.component.subTree);return}const r=i.shapeFlag&4?Oa(i.component):i.el,o=s?null:r,{i:a,r:l}=n,c=e&&e.r,u=a.refs===At?a.refs={}:a.refs,d=a.setupState,h=ft(d),g=d===At?gh:_=>xt(h,_);if(c!=null&&c!==l){if(cd(e),Bt(c))u[c]=null,g(c)&&(d[c]=null);else if(kt(c)){c.value=null;const _=e;_.k&&(u[_.k]=null)}}if(Qe(l))ro(l,a,12,[o,u]);else{const _=Bt(l),v=kt(l);if(_||v){const m=()=>{if(n.f){const p=_?g(l)?d[l]:u[l]:l.value;if(s)qe(p)&&uu(p,r);else if(qe(p))p.includes(r)||p.push(r);else if(_)u[l]=[r],g(l)&&(d[l]=u[l]);else{const S=[r];l.value=S,n.k&&(u[n.k]=S)}}else _?(u[l]=o,g(l)&&(d[l]=o)):v&&(l.value=o,n.k&&(u[n.k]=o))};if(o){const p=()=>{m(),fa.delete(n)};p.id=-1,fa.set(n,p),dn(p,t)}else cd(n),m()}}}function cd(n){const e=fa.get(n);e&&(e.flags|=8,fa.delete(n))}Pa().requestIdleCallback;Pa().cancelIdleCallback;const Qs=n=>!!n.type.__asyncLoader,np=n=>n.type.__isKeepAlive;function Jg(n,e){ip(n,"a",e)}function Qg(n,e){ip(n,"da",e)}function ip(n,e,t=rn){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(Na(e,i,t),t){let s=t.parent;for(;s&&s.parent;)np(s.parent.vnode)&&ev(i,e,t,s),s=s.parent}}function ev(n,e,t,i){const s=Na(e,n,i,!0);hi(()=>{uu(i[e],s)},t)}function Na(n,e,t=rn,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...o)=>{Ii();const a=ao(t),l=Xn(e,t,n,o);return a(),Di(),l});return i?s.unshift(r):s.push(r),r}}const Fi=n=>(e,t=rn)=>{(!Zr||n==="sp")&&Na(n,(...i)=>e(...i),t)},tv=Fi("bm"),It=Fi("m"),nv=Fi("bu"),sp=Fi("u"),rp=Fi("bum"),hi=Fi("um"),iv=Fi("sp"),sv=Fi("rtg"),rv=Fi("rtc");function ov(n,e=rn){Na("ec",n,e)}const av="components";function lv(n,e){return uv(av,n,!0,e)||n}const cv=Symbol.for("v-ndc");function uv(n,e,t=!0,i=!1){const s=Yt||rn;if(s){const r=s.type;{const a=jv(r,!1);if(a&&(a===e||a===Un(e)||a===Ca(Un(e))))return r}const o=ud(s[n]||r[n],e)||ud(s.appContext[n],e);return!o&&i?r:o}}function ud(n,e){return n&&(n[e]||n[Un(e)]||n[Ca(Un(e))])}function st(n,e,t,i){let s;const r=t,o=qe(n);if(o||Bt(n)){const a=o&&Ci(n);let l=!1,c=!1;a&&(l=!Tn(n),c=Li(n),n=Ia(n)),s=new Array(n.length);for(let u=0,d=n.length;u<d;u++)s[u]=e(l?c?nr(Wn(n[u])):Wn(n[u]):n[u],u,void 0,r)}else if(typeof n=="number"){s=new Array(n);for(let a=0;a<n;a++)s[a]=e(a+1,a,void 0,r)}else if(wt(n))if(n[Symbol.iterator])s=Array.from(n,(a,l)=>e(a,l,void 0,r));else{const a=Object.keys(n);s=new Array(a.length);for(let l=0,c=a.length;l<c;l++){const u=a[l];s[l]=e(n[u],u,l,r)}}else s=[];return s}function op(n,e,t={},i,s){if(Yt.ce||Yt.parent&&Qs(Yt.parent)&&Yt.parent.ce){const c=Object.keys(t).length>0;return e!=="default"&&(t.name=e),F(),jt(Xe,null,[vt("slot",t,i&&i())],c?-2:64)}let r=n[e];r&&r._c&&(r._d=!1),F();const o=r&&ap(r(t)),a=t.key||o&&o.key,l=jt(Xe,{key:(a&&!$n(a)?a:`_${e}`)+(!o&&i?"_fb":"")},o||(i?i():[]),o&&n._===1?64:-2);return r&&r._c&&(r._d=!0),l}function ap(n){return n.some(e=>Kr(e)?!(e.type===ci||e.type===Xe&&!ap(e.children)):!0)?n:null}const Ql=n=>n?wp(n)?Oa(n):Ql(n.parent):null,zr=Gt(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>Ql(n.parent),$root:n=>Ql(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>cp(n),$forceUpdate:n=>n.f||(n.f=()=>{xu(n.update)}),$nextTick:n=>n.n||(n.n=oo.bind(n.proxy)),$watch:n=>Wg.bind(n)}),tl=(n,e)=>n!==At&&!n.__isScriptSetup&&xt(n,e),dv={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=n;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(tl(i,e))return o[e]=1,i[e];if(s!==At&&xt(s,e))return o[e]=2,s[e];if(xt(r,e))return o[e]=3,r[e];if(t!==At&&xt(t,e))return o[e]=4,t[e];ec&&(o[e]=0)}}const c=zr[e];let u,d;if(c)return e==="$attrs"&&sn(n.attrs,"get",""),c(n);if((u=a.__cssModules)&&(u=u[e]))return u;if(t!==At&&xt(t,e))return o[e]=4,t[e];if(d=l.config.globalProperties,xt(d,e))return d[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return tl(s,e)?(s[e]=t,!0):i!==At&&xt(i,e)?(i[e]=t,!0):xt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,props:r,type:o}},a){let l;return!!(t[a]||n!==At&&a[0]!=="$"&&xt(n,a)||tl(e,a)||xt(r,a)||xt(i,a)||xt(zr,a)||xt(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:xt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function dd(n){return qe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let ec=!0;function fv(n){const e=cp(n),t=n.proxy,i=n.ctx;ec=!1,e.beforeCreate&&fd(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:d,mounted:h,beforeUpdate:g,updated:_,activated:v,deactivated:m,beforeDestroy:p,beforeUnmount:S,destroyed:x,unmounted:b,render:E,renderTracked:A,renderTriggered:T,errorCaptured:I,serverPrefetch:M,expose:w,inheritAttrs:N,components:O,directives:q,filters:Q}=e;if(c&&hv(c,i,null),o)for(const D in o){const $=o[D];Qe($)&&(i[D]=$.bind(t))}if(s){const D=s.call(t,t);wt(D)&&(n.data=so(D))}if(ec=!0,r)for(const D in r){const $=r[D],fe=Qe($)?$.bind(t,t):Qe($.get)?$.get.bind(t,t):si,he=!Qe($)&&Qe($.set)?$.set.bind(t):si,ye=rt({get:fe,set:he});Object.defineProperty(i,D,{enumerable:!0,configurable:!0,get:()=>ye.value,set:He=>ye.value=He})}if(a)for(const D in a)lp(a[D],i,t,D);if(l){const D=Qe(l)?l.call(t):l;Reflect.ownKeys(D).forEach($=>{Ko($,D[$])})}u&&fd(u,n,"c");function H(D,$){qe($)?$.forEach(fe=>D(fe.bind(t))):$&&D($.bind(t))}if(H(tv,d),H(It,h),H(nv,g),H(sp,_),H(Jg,v),H(Qg,m),H(ov,I),H(rv,A),H(sv,T),H(rp,S),H(hi,b),H(iv,M),qe(w))if(w.length){const D=n.exposed||(n.exposed={});w.forEach($=>{Object.defineProperty(D,$,{get:()=>t[$],set:fe=>t[$]=fe,enumerable:!0})})}else n.exposed||(n.exposed={});E&&n.render===si&&(n.render=E),N!=null&&(n.inheritAttrs=N),O&&(n.components=O),q&&(n.directives=q),M&&tp(n)}function hv(n,e,t=si){qe(n)&&(n=tc(n));for(const i in n){const s=n[i];let r;wt(s)?"default"in s?r=An(s.from||i,s.default,!0):r=An(s.from||i):r=An(s),kt(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):e[i]=r}}function fd(n,e,t){Xn(qe(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function lp(n,e,t,i){let s=i.includes(".")?Kh(t,i):()=>t[i];if(Bt(n)){const r=e[n];Qe(r)&&Gn(s,r)}else if(Qe(n))Gn(s,n.bind(t));else if(wt(n))if(qe(n))n.forEach(r=>lp(r,e,t,i));else{const r=Qe(n.handler)?n.handler.bind(t):e[n.handler];Qe(r)&&Gn(s,r,n)}}function cp(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=n.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(c=>ha(l,c,o,!0)),ha(l,e,o)),wt(e)&&r.set(e,l),l}function ha(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&ha(n,r,t,!0),s&&s.forEach(o=>ha(n,o,t,!0));for(const o in e)if(!(i&&o==="expose")){const a=pv[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const pv={data:hd,props:pd,emits:pd,methods:Dr,computed:Dr,beforeCreate:cn,created:cn,beforeMount:cn,mounted:cn,beforeUpdate:cn,updated:cn,beforeDestroy:cn,beforeUnmount:cn,destroyed:cn,unmounted:cn,activated:cn,deactivated:cn,errorCaptured:cn,serverPrefetch:cn,components:Dr,directives:Dr,watch:gv,provide:hd,inject:mv};function hd(n,e){return e?n?function(){return Gt(Qe(n)?n.call(this,this):n,Qe(e)?e.call(this,this):e)}:e:n}function mv(n,e){return Dr(tc(n),tc(e))}function tc(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function cn(n,e){return n?[...new Set([].concat(n,e))]:e}function Dr(n,e){return n?Gt(Object.create(null),n,e):e}function pd(n,e){return n?qe(n)&&qe(e)?[...new Set([...n,...e])]:Gt(Object.create(null),dd(n),dd(e??{})):e}function gv(n,e){if(!n)return e;if(!e)return n;const t=Gt(Object.create(null),n);for(const i in e)t[i]=cn(n[i],e[i]);return t}function up(){return{app:null,config:{isNativeTag:gh,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let vv=0;function _v(n,e){return function(i,s=null){Qe(i)||(i=Gt({},i)),s!=null&&!wt(s)&&(s=null);const r=up(),o=new WeakSet,a=[];let l=!1;const c=r.app={_uid:vv++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:Kv,get config(){return r.config},set config(u){},use(u,...d){return o.has(u)||(u&&Qe(u.install)?(o.add(u),u.install(c,...d)):Qe(u)&&(o.add(u),u(c,...d))),c},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),c},component(u,d){return d?(r.components[u]=d,c):r.components[u]},directive(u,d){return d?(r.directives[u]=d,c):r.directives[u]},mount(u,d,h){if(!l){const g=c._ceVNode||vt(i,s);return g.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),n(g,u,h),l=!0,c._container=u,u.__vue_app__=c,Oa(g.component)}},onUnmount(u){a.push(u)},unmount(){l&&(Xn(a,c._instance,16),n(null,c._container),delete c._container.__vue_app__)},provide(u,d){return r.provides[u]=d,c},runWithContext(u){const d=Es;Es=c;try{return u()}finally{Es=d}}};return c}}let Es=null;const xv=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${Un(e)}Modifiers`]||n[`${ns(e)}Modifiers`];function yv(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||At;let s=t;const r=e.startsWith("update:"),o=r&&xv(i,e.slice(7));o&&(o.trim&&(s=t.map(u=>Bt(u)?u.trim():u)),o.number&&(s=t.map(Ra)));let a,l=i[a=Ka(e)]||i[a=Ka(Un(e))];!l&&r&&(l=i[a=Ka(ns(e))]),l&&Xn(l,n,6,s);const c=i[a+"Once"];if(c){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,Xn(c,n,6,s)}}const Sv=new WeakMap;function dp(n,e,t=!1){const i=t?Sv:e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let o={},a=!1;if(!Qe(n)){const l=c=>{const u=dp(c,e,!0);u&&(a=!0,Gt(o,u))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!a?(wt(n)&&i.set(n,null),null):(qe(r)?r.forEach(l=>o[l]=null):Gt(o,r),wt(n)&&i.set(n,o),o)}function Ua(n,e){return!n||!wa(e)?!1:(e=e.slice(2).replace(/Once$/,""),xt(n,e[0].toLowerCase()+e.slice(1))||xt(n,ns(e))||xt(n,e))}function md(n){const{type:e,vnode:t,proxy:i,withProxy:s,propsOptions:[r],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:d,data:h,setupState:g,ctx:_,inheritAttrs:v}=n,m=da(n);let p,S;try{if(t.shapeFlag&4){const b=s||i,E=b;p=Qn(c.call(E,b,u,d,g,h,_)),S=a}else{const b=e;p=Qn(b.length>1?b(d,{attrs:a,slots:o,emit:l}):b(d,null)),S=e.props?a:Mv(a)}}catch(b){Hr.length=0,La(b,n,1),p=vt(ci)}let x=p;if(S&&v!==!1){const b=Object.keys(S),{shapeFlag:E}=x;b.length&&E&7&&(r&&b.some(cu)&&(S=bv(S,r)),x=Ts(x,S,!1,!0))}return t.dirs&&(x=Ts(x,null,!1,!0),x.dirs=x.dirs?x.dirs.concat(t.dirs):t.dirs),t.transition&&jr(x,t.transition),p=x,da(m),p}const Mv=n=>{let e;for(const t in n)(t==="class"||t==="style"||wa(t))&&((e||(e={}))[t]=n[t]);return e},bv=(n,e)=>{const t={};for(const i in n)(!cu(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function Ev(n,e,t){const{props:i,children:s,component:r}=n,{props:o,children:a,patchFlag:l}=e,c=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?gd(i,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let d=0;d<u.length;d++){const h=u[d];if(o[h]!==i[h]&&!Ua(c,h))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?gd(i,o,c):!0:!!o;return!1}function gd(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==n[r]&&!Ua(t,r))return!0}return!1}function wv({vnode:n,parent:e},t){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===n&&(i.el=n.el),i===n)(n=e.vnode).el=t,e=e.parent;else break}}const fp={},hp=()=>Object.create(fp),pp=n=>Object.getPrototypeOf(n)===fp;function Tv(n,e,t,i=!1){const s={},r=hp();n.propsDefaults=Object.create(null),mp(n,e,s,r);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=i?s:zh(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function Av(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=n,a=ft(s),[l]=n.propsOptions;let c=!1;if((i||o>0)&&!(o&16)){if(o&8){const u=n.vnode.dynamicProps;for(let d=0;d<u.length;d++){let h=u[d];if(Ua(n.emitsOptions,h))continue;const g=e[h];if(l)if(xt(r,h))g!==r[h]&&(r[h]=g,c=!0);else{const _=Un(h);s[_]=nc(l,a,_,g,n,!1)}else g!==r[h]&&(r[h]=g,c=!0)}}}else{mp(n,e,s,r)&&(c=!0);let u;for(const d in a)(!e||!xt(e,d)&&((u=ns(d))===d||!xt(e,u)))&&(l?t&&(t[d]!==void 0||t[u]!==void 0)&&(s[d]=nc(l,a,d,void 0,n,!0)):delete s[d]);if(r!==a)for(const d in r)(!e||!xt(e,d))&&(delete r[d],c=!0)}c&&Ei(n.attrs,"set","")}function mp(n,e,t,i){const[s,r]=n.propsOptions;let o=!1,a;if(e)for(let l in e){if(Fr(l))continue;const c=e[l];let u;s&&xt(s,u=Un(l))?!r||!r.includes(u)?t[u]=c:(a||(a={}))[u]=c:Ua(n.emitsOptions,l)||(!(l in i)||c!==i[l])&&(i[l]=c,o=!0)}if(r){const l=ft(t),c=a||At;for(let u=0;u<r.length;u++){const d=r[u];t[d]=nc(s,l,d,c[d],n,!xt(c,d))}}return o}function nc(n,e,t,i,s,r){const o=n[t];if(o!=null){const a=xt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&Qe(l)){const{propsDefaults:c}=s;if(t in c)i=c[t];else{const u=ao(s);i=c[t]=l.call(null,e),u()}}else i=l;s.ce&&s.ce._setProp(t,i)}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===ns(t))&&(i=!0))}return i}const Cv=new WeakMap;function gp(n,e,t=!1){const i=t?Cv:e.propsCache,s=i.get(n);if(s)return s;const r=n.props,o={},a=[];let l=!1;if(!Qe(n)){const u=d=>{l=!0;const[h,g]=gp(d,e,!0);Gt(o,h),g&&a.push(...g)};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}if(!r&&!l)return wt(n)&&i.set(n,Ks),Ks;if(qe(r))for(let u=0;u<r.length;u++){const d=Un(r[u]);vd(d)&&(o[d]=At)}else if(r)for(const u in r){const d=Un(u);if(vd(d)){const h=r[u],g=o[d]=qe(h)||Qe(h)?{type:h}:Gt({},h),_=g.type;let v=!1,m=!0;if(qe(_))for(let p=0;p<_.length;++p){const S=_[p],x=Qe(S)&&S.name;if(x==="Boolean"){v=!0;break}else x==="String"&&(m=!1)}else v=Qe(_)&&_.name==="Boolean";g[0]=v,g[1]=m,(v||xt(g,"default"))&&a.push(d)}}const c=[o,a];return wt(n)&&i.set(n,c),c}function vd(n){return n[0]!=="$"&&!Fr(n)}const yu=n=>n==="_"||n==="_ctx"||n==="$stable",Su=n=>qe(n)?n.map(Qn):[Qn(n)],Rv=(n,e,t)=>{if(e._n)return e;const i=li((...s)=>Su(e(...s)),t);return i._c=!1,i},vp=(n,e,t)=>{const i=n._ctx;for(const s in n){if(yu(s))continue;const r=n[s];if(Qe(r))e[s]=Rv(s,r,i);else if(r!=null){const o=Su(r);e[s]=()=>o}}},_p=(n,e)=>{const t=Su(e);n.slots.default=()=>t},xp=(n,e,t)=>{for(const i in e)(t||!yu(i))&&(n[i]=e[i])},Pv=(n,e,t)=>{const i=n.slots=hp();if(n.vnode.shapeFlag&32){const s=e._;s?(xp(i,e,t),t&&yh(i,"_",s,!0)):vp(e,i)}else e&&_p(n,e)},Iv=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,o=At;if(i.shapeFlag&32){const a=e._;a?t&&a===1?r=!1:xp(s,e,t):(r=!e.$stable,vp(e,s)),o=e}else e&&(_p(n,e),o={default:1});if(r)for(const a in s)!yu(a)&&o[a]==null&&delete s[a]},dn=Fv;function Dv(n){return Lv(n)}function Lv(n,e){const t=Pa();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:d,nextSibling:h,setScopeId:g=si,insertStaticContent:_}=n,v=(U,k,X,re=null,ie=null,ae=null,L=void 0,_e=null,pe=!!k.dynamicChildren)=>{if(U===k)return;U&&!qs(U,k)&&(re=R(U),He(U,ie,ae,!0),U=null),k.patchFlag===-2&&(pe=!1,k.dynamicChildren=null);const{type:ue,ref:me,shapeFlag:C}=k;switch(ue){case Fa:m(U,k,X,re);break;case ci:p(U,k,X,re);break;case Jo:U==null&&S(k,X,re,L);break;case Xe:O(U,k,X,re,ie,ae,L,_e,pe);break;default:C&1?E(U,k,X,re,ie,ae,L,_e,pe):C&6?q(U,k,X,re,ie,ae,L,_e,pe):(C&64||C&128)&&ue.process(U,k,X,re,ie,ae,L,_e,pe,de)}me!=null&&ie?Vr(me,U&&U.ref,ae,k||U,!k):me==null&&U&&U.ref!=null&&Vr(U.ref,null,ae,U,!0)},m=(U,k,X,re)=>{if(U==null)i(k.el=a(k.children),X,re);else{const ie=k.el=U.el;k.children!==U.children&&c(ie,k.children)}},p=(U,k,X,re)=>{U==null?i(k.el=l(k.children||""),X,re):k.el=U.el},S=(U,k,X,re)=>{[U.el,U.anchor]=_(U.children,k,X,re,U.el,U.anchor)},x=({el:U,anchor:k},X,re)=>{let ie;for(;U&&U!==k;)ie=h(U),i(U,X,re),U=ie;i(k,X,re)},b=({el:U,anchor:k})=>{let X;for(;U&&U!==k;)X=h(U),s(U),U=X;s(k)},E=(U,k,X,re,ie,ae,L,_e,pe)=>{if(k.type==="svg"?L="svg":k.type==="math"&&(L="mathml"),U==null)A(k,X,re,ie,ae,L,_e,pe);else{const ue=U.el&&U.el._isVueCE?U.el:null;try{ue&&ue._beginPatch(),M(U,k,ie,ae,L,_e,pe)}finally{ue&&ue._endPatch()}}},A=(U,k,X,re,ie,ae,L,_e)=>{let pe,ue;const{props:me,shapeFlag:C,transition:y,dirs:V}=U;if(pe=U.el=o(U.type,ae,me&&me.is,me),C&8?u(pe,U.children):C&16&&I(U.children,pe,null,re,ie,nl(U,ae),L,_e),V&&rs(U,null,re,"created"),T(pe,U,U.scopeId,L,re),me){for(const le in me)le!=="value"&&!Fr(le)&&r(pe,le,null,me[le],ae,re);"value"in me&&r(pe,"value",null,me.value,ae),(ue=me.onVnodeBeforeMount)&&Yn(ue,re,U)}V&&rs(U,null,re,"beforeMount");const ee=Nv(ie,y);ee&&y.beforeEnter(pe),i(pe,k,X),((ue=me&&me.onVnodeMounted)||ee||V)&&dn(()=>{ue&&Yn(ue,re,U),ee&&y.enter(pe),V&&rs(U,null,re,"mounted")},ie)},T=(U,k,X,re,ie)=>{if(X&&g(U,X),re)for(let ae=0;ae<re.length;ae++)g(U,re[ae]);if(ie){let ae=ie.subTree;if(k===ae||Mp(ae.type)&&(ae.ssContent===k||ae.ssFallback===k)){const L=ie.vnode;T(U,L,L.scopeId,L.slotScopeIds,ie.parent)}}},I=(U,k,X,re,ie,ae,L,_e,pe=0)=>{for(let ue=pe;ue<U.length;ue++){const me=U[ue]=_e?Yi(U[ue]):Qn(U[ue]);v(null,me,k,X,re,ie,ae,L,_e)}},M=(U,k,X,re,ie,ae,L)=>{const _e=k.el=U.el;let{patchFlag:pe,dynamicChildren:ue,dirs:me}=k;pe|=U.patchFlag&16;const C=U.props||At,y=k.props||At;let V;if(X&&os(X,!1),(V=y.onVnodeBeforeUpdate)&&Yn(V,X,k,U),me&&rs(k,U,X,"beforeUpdate"),X&&os(X,!0),(C.innerHTML&&y.innerHTML==null||C.textContent&&y.textContent==null)&&u(_e,""),ue?w(U.dynamicChildren,ue,_e,X,re,nl(k,ie),ae):L||$(U,k,_e,null,X,re,nl(k,ie),ae,!1),pe>0){if(pe&16)N(_e,C,y,X,ie);else if(pe&2&&C.class!==y.class&&r(_e,"class",null,y.class,ie),pe&4&&r(_e,"style",C.style,y.style,ie),pe&8){const ee=k.dynamicProps;for(let le=0;le<ee.length;le++){const Z=ee[le],Ie=C[Z],Se=y[Z];(Se!==Ie||Z==="value")&&r(_e,Z,Ie,Se,ie,X)}}pe&1&&U.children!==k.children&&u(_e,k.children)}else!L&&ue==null&&N(_e,C,y,X,ie);((V=y.onVnodeUpdated)||me)&&dn(()=>{V&&Yn(V,X,k,U),me&&rs(k,U,X,"updated")},re)},w=(U,k,X,re,ie,ae,L)=>{for(let _e=0;_e<k.length;_e++){const pe=U[_e],ue=k[_e],me=pe.el&&(pe.type===Xe||!qs(pe,ue)||pe.shapeFlag&198)?d(pe.el):X;v(pe,ue,me,null,re,ie,ae,L,!0)}},N=(U,k,X,re,ie)=>{if(k!==X){if(k!==At)for(const ae in k)!Fr(ae)&&!(ae in X)&&r(U,ae,k[ae],null,ie,re);for(const ae in X){if(Fr(ae))continue;const L=X[ae],_e=k[ae];L!==_e&&ae!=="value"&&r(U,ae,_e,L,ie,re)}"value"in X&&r(U,"value",k.value,X.value,ie)}},O=(U,k,X,re,ie,ae,L,_e,pe)=>{const ue=k.el=U?U.el:a(""),me=k.anchor=U?U.anchor:a("");let{patchFlag:C,dynamicChildren:y,slotScopeIds:V}=k;V&&(_e=_e?_e.concat(V):V),U==null?(i(ue,X,re),i(me,X,re),I(k.children||[],X,me,ie,ae,L,_e,pe)):C>0&&C&64&&y&&U.dynamicChildren&&U.dynamicChildren.length===y.length?(w(U.dynamicChildren,y,X,ie,ae,L,_e),(k.key!=null||ie&&k===ie.subTree)&&Mu(U,k,!0)):$(U,k,X,me,ie,ae,L,_e,pe)},q=(U,k,X,re,ie,ae,L,_e,pe)=>{k.slotScopeIds=_e,U==null?k.shapeFlag&512?ie.ctx.activate(k,X,re,L,pe):Q(k,X,re,ie,ae,L,pe):te(U,k,pe)},Q=(U,k,X,re,ie,ae,L)=>{const _e=U.component=Gv(U,re,ie);if(np(U)&&(_e.ctx.renderer=de),$v(_e,!1,L),_e.asyncDep){if(ie&&ie.registerDep(_e,H,L),!U.el){const pe=_e.subTree=vt(ci);p(null,pe,k,X),U.placeholder=pe.el}}else H(_e,U,k,X,ie,ae,L)},te=(U,k,X)=>{const re=k.component=U.component;if(Ev(U,k,X))if(re.asyncDep&&!re.asyncResolved){D(re,k,X);return}else re.next=k,re.update();else k.el=U.el,re.vnode=k},H=(U,k,X,re,ie,ae,L)=>{const _e=()=>{if(U.isMounted){let{next:C,bu:y,u:V,parent:ee,vnode:le}=U;{const Ge=yp(U);if(Ge){C&&(C.el=le.el,D(U,C,L)),Ge.asyncDep.then(()=>{U.isUnmounted||_e()});return}}let Z=C,Ie;os(U,!1),C?(C.el=le.el,D(U,C,L)):C=le,y&&Yo(y),(Ie=C.props&&C.props.onVnodeBeforeUpdate)&&Yn(Ie,ee,C,le),os(U,!0);const Se=md(U),Ne=U.subTree;U.subTree=Se,v(Ne,Se,d(Ne.el),R(Ne),U,ie,ae),C.el=Se.el,Z===null&&wv(U,Se.el),V&&dn(V,ie),(Ie=C.props&&C.props.onVnodeUpdated)&&dn(()=>Yn(Ie,ee,C,le),ie)}else{let C;const{el:y,props:V}=k,{bm:ee,m:le,parent:Z,root:Ie,type:Se}=U,Ne=Qs(k);os(U,!1),ee&&Yo(ee),!Ne&&(C=V&&V.onVnodeBeforeMount)&&Yn(C,Z,k),os(U,!0);{Ie.ce&&Ie.ce._def.shadowRoot!==!1&&Ie.ce._injectChildStyle(Se);const Ge=U.subTree=md(U);v(null,Ge,X,re,U,ie,ae),k.el=Ge.el}if(le&&dn(le,ie),!Ne&&(C=V&&V.onVnodeMounted)){const Ge=k;dn(()=>Yn(C,Z,Ge),ie)}(k.shapeFlag&256||Z&&Qs(Z.vnode)&&Z.vnode.shapeFlag&256)&&U.a&&dn(U.a,ie),U.isMounted=!0,k=X=re=null}};U.scope.on();const pe=U.effect=new Ah(_e);U.scope.off();const ue=U.update=pe.run.bind(pe),me=U.job=pe.runIfDirty.bind(pe);me.i=U,me.id=U.uid,pe.scheduler=()=>xu(me),os(U,!0),ue()},D=(U,k,X)=>{k.component=U;const re=U.vnode.props;U.vnode=k,U.next=null,Av(U,k.props,re,X),Iv(U,k.children,X),Ii(),rd(U),Di()},$=(U,k,X,re,ie,ae,L,_e,pe=!1)=>{const ue=U&&U.children,me=U?U.shapeFlag:0,C=k.children,{patchFlag:y,shapeFlag:V}=k;if(y>0){if(y&128){he(ue,C,X,re,ie,ae,L,_e,pe);return}else if(y&256){fe(ue,C,X,re,ie,ae,L,_e,pe);return}}V&8?(me&16&&G(ue,ie,ae),C!==ue&&u(X,C)):me&16?V&16?he(ue,C,X,re,ie,ae,L,_e,pe):G(ue,ie,ae,!0):(me&8&&u(X,""),V&16&&I(C,X,re,ie,ae,L,_e,pe))},fe=(U,k,X,re,ie,ae,L,_e,pe)=>{U=U||Ks,k=k||Ks;const ue=U.length,me=k.length,C=Math.min(ue,me);let y;for(y=0;y<C;y++){const V=k[y]=pe?Yi(k[y]):Qn(k[y]);v(U[y],V,X,null,ie,ae,L,_e,pe)}ue>me?G(U,ie,ae,!0,!1,C):I(k,X,re,ie,ae,L,_e,pe,C)},he=(U,k,X,re,ie,ae,L,_e,pe)=>{let ue=0;const me=k.length;let C=U.length-1,y=me-1;for(;ue<=C&&ue<=y;){const V=U[ue],ee=k[ue]=pe?Yi(k[ue]):Qn(k[ue]);if(qs(V,ee))v(V,ee,X,null,ie,ae,L,_e,pe);else break;ue++}for(;ue<=C&&ue<=y;){const V=U[C],ee=k[y]=pe?Yi(k[y]):Qn(k[y]);if(qs(V,ee))v(V,ee,X,null,ie,ae,L,_e,pe);else break;C--,y--}if(ue>C){if(ue<=y){const V=y+1,ee=V<me?k[V].el:re;for(;ue<=y;)v(null,k[ue]=pe?Yi(k[ue]):Qn(k[ue]),X,ee,ie,ae,L,_e,pe),ue++}}else if(ue>y)for(;ue<=C;)He(U[ue],ie,ae,!0),ue++;else{const V=ue,ee=ue,le=new Map;for(ue=ee;ue<=y;ue++){const Ce=k[ue]=pe?Yi(k[ue]):Qn(k[ue]);Ce.key!=null&&le.set(Ce.key,ue)}let Z,Ie=0;const Se=y-ee+1;let Ne=!1,Ge=0;const xe=new Array(Se);for(ue=0;ue<Se;ue++)xe[ue]=0;for(ue=V;ue<=C;ue++){const Ce=U[ue];if(Ie>=Se){He(Ce,ie,ae,!0);continue}let Fe;if(Ce.key!=null)Fe=le.get(Ce.key);else for(Z=ee;Z<=y;Z++)if(xe[Z-ee]===0&&qs(Ce,k[Z])){Fe=Z;break}Fe===void 0?He(Ce,ie,ae,!0):(xe[Fe-ee]=ue+1,Fe>=Ge?Ge=Fe:Ne=!0,v(Ce,k[Fe],X,null,ie,ae,L,_e,pe),Ie++)}const we=Ne?Uv(xe):Ks;for(Z=we.length-1,ue=Se-1;ue>=0;ue--){const Ce=ee+ue,Fe=k[Ce],Ee=k[Ce+1],tt=Ce+1<me?Ee.el||Sp(Ee):re;xe[ue]===0?v(null,Fe,X,tt,ie,ae,L,_e,pe):Ne&&(Z<0||ue!==we[Z]?ye(Fe,X,tt,2):Z--)}}},ye=(U,k,X,re,ie=null)=>{const{el:ae,type:L,transition:_e,children:pe,shapeFlag:ue}=U;if(ue&6){ye(U.component.subTree,k,X,re);return}if(ue&128){U.suspense.move(k,X,re);return}if(ue&64){L.move(U,k,X,de);return}if(L===Xe){i(ae,k,X);for(let C=0;C<pe.length;C++)ye(pe[C],k,X,re);i(U.anchor,k,X);return}if(L===Jo){x(U,k,X);return}if(re!==2&&ue&1&&_e)if(re===0)_e.beforeEnter(ae),i(ae,k,X),dn(()=>_e.enter(ae),ie);else{const{leave:C,delayLeave:y,afterLeave:V}=_e,ee=()=>{U.ctx.isUnmounted?s(ae):i(ae,k,X)},le=()=>{ae._isLeaving&&ae[gs](!0),C(ae,()=>{ee(),V&&V()})};y?y(ae,ee,le):le()}else i(ae,k,X)},He=(U,k,X,re=!1,ie=!1)=>{const{type:ae,props:L,ref:_e,children:pe,dynamicChildren:ue,shapeFlag:me,patchFlag:C,dirs:y,cacheIndex:V}=U;if(C===-2&&(ie=!1),_e!=null&&(Ii(),Vr(_e,null,X,U,!0),Di()),V!=null&&(k.renderCache[V]=void 0),me&256){k.ctx.deactivate(U);return}const ee=me&1&&y,le=!Qs(U);let Z;if(le&&(Z=L&&L.onVnodeBeforeUnmount)&&Yn(Z,k,U),me&6)at(U.component,X,re);else{if(me&128){U.suspense.unmount(X,re);return}ee&&rs(U,null,k,"beforeUnmount"),me&64?U.type.remove(U,k,X,de,re):ue&&!ue.hasOnce&&(ae!==Xe||C>0&&C&64)?G(ue,k,X,!1,!0):(ae===Xe&&C&384||!ie&&me&16)&&G(pe,k,X),re&&We(U)}(le&&(Z=L&&L.onVnodeUnmounted)||ee)&&dn(()=>{Z&&Yn(Z,k,U),ee&&rs(U,null,k,"unmounted")},X)},We=U=>{const{type:k,el:X,anchor:re,transition:ie}=U;if(k===Xe){dt(X,re);return}if(k===Jo){b(U);return}const ae=()=>{s(X),ie&&!ie.persisted&&ie.afterLeave&&ie.afterLeave()};if(U.shapeFlag&1&&ie&&!ie.persisted){const{leave:L,delayLeave:_e}=ie,pe=()=>L(X,ae);_e?_e(U.el,ae,pe):pe()}else ae()},dt=(U,k)=>{let X;for(;U!==k;)X=h(U),s(U),U=X;s(k)},at=(U,k,X)=>{const{bum:re,scope:ie,job:ae,subTree:L,um:_e,m:pe,a:ue}=U;_d(pe),_d(ue),re&&Yo(re),ie.stop(),ae&&(ae.flags|=8,He(L,U,k,X)),_e&&dn(_e,k),dn(()=>{U.isUnmounted=!0},k)},G=(U,k,X,re=!1,ie=!1,ae=0)=>{for(let L=ae;L<U.length;L++)He(U[L],k,X,re,ie)},R=U=>{if(U.shapeFlag&6)return R(U.component.subTree);if(U.shapeFlag&128)return U.suspense.next();const k=h(U.anchor||U.el),X=k&&k[Zh];return X?h(X):k};let W=!1;const ce=(U,k,X)=>{let re;U==null?k._vnode&&(He(k._vnode,null,null,!0),re=k._vnode.component):v(k._vnode||null,U,k,null,null,null,X),k._vnode=U,W||(W=!0,rd(re),Xh(),W=!1)},de={p:v,um:He,m:ye,r:We,mt:Q,mc:I,pc:$,pbc:w,n:R,o:n};return{render:ce,hydrate:void 0,createApp:_v(ce)}}function nl({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function os({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function Nv(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Mu(n,e,t=!1){const i=n.children,s=e.children;if(qe(i)&&qe(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=Yi(s[r]),a.el=o.el),!t&&a.patchFlag!==-2&&Mu(o,a)),a.type===Fa&&(a.patchFlag!==-1?a.el=o.el:a.__elIndex=r+(n.type===Xe?1:0)),a.type===ci&&!a.el&&(a.el=o.el)}}function Uv(n){const e=n.slice(),t=[0];let i,s,r,o,a;const l=n.length;for(i=0;i<l;i++){const c=n[i];if(c!==0){if(s=t[t.length-1],n[s]<c){e[i]=s,t.push(i);continue}for(r=0,o=t.length-1;r<o;)a=r+o>>1,n[t[a]]<c?r=a+1:o=a;c<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,o=t[r-1];r-- >0;)t[r]=o,o=e[o];return t}function yp(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:yp(e)}function _d(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function Sp(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?Sp(e.subTree):null}const Mp=n=>n.__isSuspense;function Fv(n,e){e&&e.pendingBranch?qe(n)?e.effects.push(...n):e.effects.push(n):zg(n)}const Xe=Symbol.for("v-fgt"),Fa=Symbol.for("v-txt"),ci=Symbol.for("v-cmt"),Jo=Symbol.for("v-stc"),Hr=[];let En=null;function F(n=!1){Hr.push(En=n?null:[])}function Ov(){Hr.pop(),En=Hr[Hr.length-1]||null}let Yr=1;function pa(n,e=!1){Yr+=n,n<0&&En&&e&&(En.hasOnce=!0)}function bp(n){return n.dynamicChildren=Yr>0?En||Ks:null,Ov(),Yr>0&&En&&En.push(n),n}function B(n,e,t,i,s,r){return bp(f(n,e,t,i,s,r,!0))}function jt(n,e,t,i,s){return bp(vt(n,e,t,i,s,!0))}function Kr(n){return n?n.__v_isVNode===!0:!1}function qs(n,e){return n.type===e.type&&n.key===e.key}const Ep=({key:n})=>n??null,Qo=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Bt(n)||kt(n)||Qe(n)?{i:Yt,r:n,k:e,f:!!t}:n:null);function f(n,e=null,t=null,i=0,s=null,r=n===Xe?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&Ep(e),ref:e&&Qo(e),scopeId:jh,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Yt};return a?(bu(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=Bt(t)?8:16),Yr>0&&!o&&En&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&En.push(l),l}const vt=kv;function kv(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===cv)&&(n=ci),Kr(n)){const a=Ts(n,e,!0);return t&&bu(a,t),Yr>0&&!r&&En&&(a.shapeFlag&6?En[En.indexOf(n)]=a:En.push(a)),a.patchFlag=-2,a}if(Yv(n)&&(n=n.__vccOpts),e){e=Bv(e);let{class:a,style:l}=e;a&&!Bt(a)&&(e.class=Ue(a)),wt(l)&&(Da(l)&&!qe(l)&&(l=Gt({},l)),e.style=Ht(l))}const o=Bt(n)?1:Mp(n)?128:Xg(n)?64:wt(n)?4:Qe(n)?2:0;return f(n,e,t,i,s,o,r,!0)}function Bv(n){return n?Da(n)||pp(n)?Gt({},n):n:null}function Ts(n,e,t=!1,i=!1){const{props:s,ref:r,patchFlag:o,children:a,transition:l}=n,c=e?Vv(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:n.type,props:c,key:c&&Ep(c),ref:e&&e.ref?t&&r?qe(r)?r.concat(Qo(e)):[r,Qo(e)]:Qo(e):r,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:a,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==Xe?o===-1?16:o|16:o,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:l,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&Ts(n.ssContent),ssFallback:n.ssFallback&&Ts(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return l&&i&&jr(u,l.clone(u)),u}function Kt(n=" ",e=0){return vt(Fa,null,n,e)}function ir(n,e){const t=vt(Jo,null,n);return t.staticCount=e,t}function Te(n="",e=!1){return e?(F(),jt(ci,null,n)):vt(ci,null,n)}function Qn(n){return n==null||typeof n=="boolean"?vt(ci):qe(n)?vt(Xe,null,n.slice()):Kr(n)?Yi(n):vt(Fa,null,String(n))}function Yi(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:Ts(n)}function bu(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(qe(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),bu(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!pp(e)?e._ctx=Yt:s===3&&Yt&&(Yt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else Qe(e)?(e={default:e,_ctx:Yt},t=32):(e=String(e),i&64?(t=16,e=[Kt(e)]):t=8);n.children=e,n.shapeFlag|=t}function Vv(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Ue([e.class,i.class]));else if(s==="style")e.style=Ht([e.style,i.style]);else if(wa(s)){const r=e[s],o=i[s];o&&r!==o&&!(qe(r)&&r.includes(o))&&(e[s]=r?[].concat(r,o):o)}else s!==""&&(e[s]=i[s])}return e}function Yn(n,e,t,i=null){Xn(n,e,7,[t,i])}const zv=up();let Hv=0;function Gv(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||zv,r={uid:Hv++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Eh(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:gp(i,s),emitsOptions:dp(i,s),emit:null,emitted:null,propsDefaults:At,inheritAttrs:i.inheritAttrs,ctx:At,data:At,props:At,attrs:At,slots:At,refs:At,setupState:At,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=yv.bind(null,r),n.ce&&n.ce(r),r}let rn=null;const Eu=()=>rn||Yt;let ma,ic;{const n=Pa(),e=(t,i)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(i),r=>{s.length>1?s.forEach(o=>o(r)):s[0](r)}};ma=e("__VUE_INSTANCE_SETTERS__",t=>rn=t),ic=e("__VUE_SSR_SETTERS__",t=>Zr=t)}const ao=n=>{const e=rn;return ma(n),n.scope.on(),()=>{n.scope.off(),ma(e)}},xd=()=>{rn&&rn.scope.off(),ma(null)};function wp(n){return n.vnode.shapeFlag&4}let Zr=!1;function $v(n,e=!1,t=!1){e&&ic(e);const{props:i,children:s}=n.vnode,r=wp(n);Tv(n,i,r,e),Pv(n,s,t||e);const o=r?Wv(n,e):void 0;return e&&ic(!1),o}function Wv(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,dv);const{setup:i}=t;if(i){Ii();const s=n.setupContext=i.length>1?qv(n):null,r=ao(n),o=ro(i,n,0,[n.props,s]),a=vh(o);if(Di(),r(),(a||n.sp)&&!Qs(n)&&tp(n),a){if(o.then(xd,xd),e)return o.then(l=>{yd(n,l)}).catch(l=>{La(l,n,0)});n.asyncDep=o}else yd(n,o)}else Tp(n)}function yd(n,e,t){Qe(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:wt(e)&&(n.setupState=Gh(e)),Tp(n)}function Tp(n,e,t){const i=n.type;n.render||(n.render=i.render||si);{const s=ao(n);Ii();try{fv(n)}finally{Di(),s()}}}const Xv={get(n,e){return sn(n,"get",""),n[e]}};function qv(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,Xv),slots:n.slots,emit:n.emit,expose:e}}function Oa(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(Gh(_u(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in zr)return zr[t](n)},has(e,t){return t in e||t in zr}})):n.proxy}function jv(n,e=!0){return Qe(n)?n.displayName||n.name:n.name||e&&n.__name}function Yv(n){return Qe(n)&&"__vccOpts"in n}const rt=(n,e)=>Fg(n,e,Zr);function Ap(n,e,t){try{pa(-1);const i=arguments.length;return i===2?wt(e)&&!qe(e)?Kr(e)?vt(n,null,[e]):vt(n,e):vt(n,null,e):(i>3?t=Array.prototype.slice.call(arguments,2):i===3&&Kr(t)&&(t=[t]),vt(n,e,t))}finally{pa(1)}}const Kv="3.5.27";/**
* @vue/runtime-dom v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let sc;const Sd=typeof window<"u"&&window.trustedTypes;if(Sd)try{sc=Sd.createPolicy("vue",{createHTML:n=>n})}catch{}const Cp=sc?n=>sc.createHTML(n):n=>n,Zv="http://www.w3.org/2000/svg",Jv="http://www.w3.org/1998/Math/MathML",bi=typeof document<"u"?document:null,Md=bi&&bi.createElement("template"),Qv={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e==="svg"?bi.createElementNS(Zv,n):e==="mathml"?bi.createElementNS(Jv,n):t?bi.createElement(n,{is:t}):bi.createElement(n);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>bi.createTextNode(n),createComment:n=>bi.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>bi.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const o=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{Md.innerHTML=Cp(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const a=Md.content;if(i==="svg"||i==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},Oi="transition",yr="animation",sr=Symbol("_vtc"),Rp={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},e_=Gt({},Kg,Rp),as=(n,e=[])=>{qe(n)?n.forEach(t=>t(...e)):n&&n(...e)},bd=n=>n?qe(n)?n.some(e=>e.length>1):n.length>1:!1;function t_(n){const e={};for(const O in n)O in Rp||(e[O]=n[O]);if(n.css===!1)return e;const{name:t="v",type:i,duration:s,enterFromClass:r=`${t}-enter-from`,enterActiveClass:o=`${t}-enter-active`,enterToClass:a=`${t}-enter-to`,appearFromClass:l=r,appearActiveClass:c=o,appearToClass:u=a,leaveFromClass:d=`${t}-leave-from`,leaveActiveClass:h=`${t}-leave-active`,leaveToClass:g=`${t}-leave-to`}=n,_=n_(s),v=_&&_[0],m=_&&_[1],{onBeforeEnter:p,onEnter:S,onEnterCancelled:x,onLeave:b,onLeaveCancelled:E,onBeforeAppear:A=p,onAppear:T=S,onAppearCancelled:I=x}=e,M=(O,q,Q,te)=>{O._enterCancelled=te,Wi(O,q?u:a),Wi(O,q?c:o),Q&&Q()},w=(O,q)=>{O._isLeaving=!1,Wi(O,d),Wi(O,g),Wi(O,h),q&&q()},N=O=>(q,Q)=>{const te=O?T:S,H=()=>M(q,O,Q);as(te,[q,H]),Ed(()=>{Wi(q,O?l:r),Zn(q,O?u:a),bd(te)||wd(q,i,v,H)})};return Gt(e,{onBeforeEnter(O){as(p,[O]),Zn(O,r),Zn(O,o)},onBeforeAppear(O){as(A,[O]),Zn(O,l),Zn(O,c)},onEnter:N(!1),onAppear:N(!0),onLeave(O,q){O._isLeaving=!0;const Q=()=>w(O,q);Zn(O,d),O._enterCancelled?(Zn(O,h),rc(O)):(rc(O),Zn(O,h)),Ed(()=>{O._isLeaving&&(Wi(O,d),Zn(O,g),bd(b)||wd(O,i,m,Q))}),as(b,[O,Q])},onEnterCancelled(O){M(O,!1,void 0,!0),as(x,[O])},onAppearCancelled(O){M(O,!0,void 0,!0),as(I,[O])},onLeaveCancelled(O){w(O),as(E,[O])}})}function n_(n){if(n==null)return null;if(wt(n))return[il(n.enter),il(n.leave)];{const e=il(n);return[e,e]}}function il(n){return tg(n)}function Zn(n,e){e.split(/\s+/).forEach(t=>t&&n.classList.add(t)),(n[sr]||(n[sr]=new Set)).add(e)}function Wi(n,e){e.split(/\s+/).forEach(i=>i&&n.classList.remove(i));const t=n[sr];t&&(t.delete(e),t.size||(n[sr]=void 0))}function Ed(n){requestAnimationFrame(()=>{requestAnimationFrame(n)})}let i_=0;function wd(n,e,t,i){const s=n._endId=++i_,r=()=>{s===n._endId&&i()};if(t!=null)return setTimeout(r,t);const{type:o,timeout:a,propCount:l}=Pp(n,e);if(!o)return i();const c=o+"end";let u=0;const d=()=>{n.removeEventListener(c,h),r()},h=g=>{g.target===n&&++u>=l&&d()};setTimeout(()=>{u<l&&d()},a+1),n.addEventListener(c,h)}function Pp(n,e){const t=window.getComputedStyle(n),i=_=>(t[_]||"").split(", "),s=i(`${Oi}Delay`),r=i(`${Oi}Duration`),o=Td(s,r),a=i(`${yr}Delay`),l=i(`${yr}Duration`),c=Td(a,l);let u=null,d=0,h=0;e===Oi?o>0&&(u=Oi,d=o,h=r.length):e===yr?c>0&&(u=yr,d=c,h=l.length):(d=Math.max(o,c),u=d>0?o>c?Oi:yr:null,h=u?u===Oi?r.length:l.length:0);const g=u===Oi&&/\b(?:transform|all)(?:,|$)/.test(i(`${Oi}Property`).toString());return{type:u,timeout:d,propCount:h,hasTransform:g}}function Td(n,e){for(;n.length<e.length;)n=n.concat(n);return Math.max(...e.map((t,i)=>Ad(t)+Ad(n[i])))}function Ad(n){return n==="auto"?0:Number(n.slice(0,-1).replace(",","."))*1e3}function rc(n){return(n?n.ownerDocument:document).body.offsetHeight}function s_(n,e,t){const i=n[sr];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const ga=Symbol("_vod"),Ip=Symbol("_vsh"),r_={name:"show",beforeMount(n,{value:e},{transition:t}){n[ga]=n.style.display==="none"?"":n.style.display,t&&e?t.beforeEnter(n):Sr(n,e)},mounted(n,{value:e},{transition:t}){t&&e&&t.enter(n)},updated(n,{value:e,oldValue:t},{transition:i}){!e!=!t&&(i?e?(i.beforeEnter(n),Sr(n,!0),i.enter(n)):i.leave(n,()=>{Sr(n,!1)}):Sr(n,e))},beforeUnmount(n,{value:e}){Sr(n,e)}};function Sr(n,e){n.style.display=e?n[ga]:"none",n[Ip]=!e}const o_=Symbol(""),a_=/(?:^|;)\s*display\s*:/;function l_(n,e,t){const i=n.style,s=Bt(t);let r=!1;if(t&&!s){if(e)if(Bt(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();t[a]==null&&ea(i,a,"")}else for(const o in e)t[o]==null&&ea(i,o,"");for(const o in t)o==="display"&&(r=!0),ea(i,o,t[o])}else if(s){if(e!==t){const o=i[o_];o&&(t+=";"+o),i.cssText=t,r=a_.test(t)}}else e&&n.removeAttribute("style");ga in n&&(n[ga]=r?i.display:"",n[Ip]&&(i.display="none"))}const Cd=/\s*!important$/;function ea(n,e,t){if(qe(t))t.forEach(i=>ea(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=c_(n,e);Cd.test(t)?n.setProperty(ns(i),t.replace(Cd,""),"important"):n[i]=t}}const Rd=["Webkit","Moz","ms"],sl={};function c_(n,e){const t=sl[e];if(t)return t;let i=Un(e);if(i!=="filter"&&i in n)return sl[e]=i;i=Ca(i);for(let s=0;s<Rd.length;s++){const r=Rd[s]+i;if(r in n)return sl[e]=r}return e}const Pd="http://www.w3.org/1999/xlink";function Id(n,e,t,i,s,r=ag(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Pd,e.slice(6,e.length)):n.setAttributeNS(Pd,e,t):t==null||r&&!Sh(t)?n.removeAttribute(e):n.setAttribute(e,r?"":$n(t)?String(t):t)}function Dd(n,e,t,i,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Cp(t):t);return}const r=n.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const a=r==="OPTION"?n.getAttribute("value")||"":n.value,l=t==null?n.type==="checkbox"?"on":"":String(t);(a!==l||!("_value"in n))&&(n.value=l),t==null&&n.removeAttribute(e),n._value=t;return}let o=!1;if(t===""||t==null){const a=typeof n[e];a==="boolean"?t=Sh(t):t==null&&a==="string"?(t="",o=!0):a==="number"&&(t=0,o=!0)}try{n[e]=t}catch{}o&&n.removeAttribute(s||e)}function Ti(n,e,t,i){n.addEventListener(e,t,i)}function u_(n,e,t,i){n.removeEventListener(e,t,i)}const Ld=Symbol("_vei");function d_(n,e,t,i,s=null){const r=n[Ld]||(n[Ld]={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=f_(e);if(i){const c=r[e]=m_(i,s);Ti(n,a,c,l)}else o&&(u_(n,a,o,l),r[e]=void 0)}}const Nd=/(?:Once|Passive|Capture)$/;function f_(n){let e;if(Nd.test(n)){e={};let i;for(;i=n.match(Nd);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):ns(n.slice(2)),e]}let rl=0;const h_=Promise.resolve(),p_=()=>rl||(h_.then(()=>rl=0),rl=Date.now());function m_(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;Xn(g_(i,t.value),e,5,[i])};return t.value=n,t.attached=p_(),t}function g_(n,e){if(qe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const Ud=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,v_=(n,e,t,i,s,r)=>{const o=s==="svg";e==="class"?s_(n,i,o):e==="style"?l_(n,t,i):wa(e)?cu(e)||d_(n,e,t,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):__(n,e,i,o))?(Dd(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Id(n,e,i,o,r,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Bt(i))?Dd(n,Un(e),i,r,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),Id(n,e,i,o))};function __(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&Ud(e)&&Qe(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Ud(e)&&Bt(t)?!1:e in n}const Dp=new WeakMap,Lp=new WeakMap,va=Symbol("_moveCb"),Fd=Symbol("_enterCb"),x_=n=>(delete n.props.mode,n),y_=x_({name:"TransitionGroup",props:Gt({},e_,{tag:String,moveClass:String}),setup(n,{slots:e}){const t=Eu(),i=Yg();let s,r;return sp(()=>{if(!s.length)return;const o=n.moveClass||`${n.name||"v"}-move`;if(!w_(s[0].el,t.vnode.el,o)){s=[];return}s.forEach(M_),s.forEach(b_);const a=s.filter(E_);rc(t.vnode.el),a.forEach(l=>{const c=l.el,u=c.style;Zn(c,o),u.transform=u.webkitTransform=u.transitionDuration="";const d=c[va]=h=>{h&&h.target!==c||(!h||h.propertyName.endsWith("transform"))&&(c.removeEventListener("transitionend",d),c[va]=null,Wi(c,o))};c.addEventListener("transitionend",d)}),s=[]}),()=>{const o=ft(n),a=t_(o);let l=o.tag||Xe;if(s=[],r)for(let c=0;c<r.length;c++){const u=r[c];u.el&&u.el instanceof Element&&(s.push(u),jr(u,Jl(u,a,i,t)),Dp.set(u,{left:u.el.offsetLeft,top:u.el.offsetTop}))}r=e.default?ep(e.default()):[];for(let c=0;c<r.length;c++){const u=r[c];u.key!=null&&jr(u,Jl(u,a,i,t))}return vt(l,null,r)}}}),S_=y_;function M_(n){const e=n.el;e[va]&&e[va](),e[Fd]&&e[Fd]()}function b_(n){Lp.set(n,{left:n.el.offsetLeft,top:n.el.offsetTop})}function E_(n){const e=Dp.get(n),t=Lp.get(n),i=e.left-t.left,s=e.top-t.top;if(i||s){const r=n.el.style;return r.transform=r.webkitTransform=`translate(${i}px,${s}px)`,r.transitionDuration="0s",n}}function w_(n,e,t){const i=n.cloneNode(),s=n[sr];s&&s.forEach(a=>{a.split(/\s+/).forEach(l=>l&&i.classList.remove(l))}),t.split(/\s+/).forEach(a=>a&&i.classList.add(a)),i.style.display="none";const r=e.nodeType===1?e:e.parentNode;r.appendChild(i);const{hasTransform:o}=Pp(i);return r.removeChild(i),o}const es=n=>{const e=n.props["onUpdate:modelValue"]||!1;return qe(e)?t=>Yo(e,t):e};function T_(n){n.target.composing=!0}function Od(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Nn=Symbol("_assign");function kd(n,e,t){return e&&(n=n.trim()),t&&(n=Ra(n)),n}const Ft={created(n,{modifiers:{lazy:e,trim:t,number:i}},s){n[Nn]=es(s);const r=i||s.props&&s.props.type==="number";Ti(n,e?"change":"input",o=>{o.target.composing||n[Nn](kd(n.value,t,r))}),(t||r)&&Ti(n,"change",()=>{n.value=kd(n.value,t,r)}),e||(Ti(n,"compositionstart",T_),Ti(n,"compositionend",Od),Ti(n,"change",Od))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:i,trim:s,number:r}},o){if(n[Nn]=es(o),n.composing)return;const a=(r||n.type==="number")&&!/^0\d/.test(n.value)?Ra(n.value):n.value,l=e??"";a!==l&&(document.activeElement===n&&n.type!=="range"&&(i&&e===t||s&&n.value.trim()===l)||(n.value=l))}},A_={deep:!0,created(n,e,t){n[Nn]=es(t),Ti(n,"change",()=>{const i=n._modelValue,s=rr(n),r=n.checked,o=n[Nn];if(qe(i)){const a=du(i,s),l=a!==-1;if(r&&!l)o(i.concat(s));else if(!r&&l){const c=[...i];c.splice(a,1),o(c)}}else if(pr(i)){const a=new Set(i);r?a.add(s):a.delete(s),o(a)}else o(Up(n,r))})},mounted:Bd,beforeUpdate(n,e,t){n[Nn]=es(t),Bd(n,e,t)}};function Bd(n,{value:e,oldValue:t},i){n._modelValue=e;let s;if(qe(e))s=du(e,i.props.value)>-1;else if(pr(e))s=e.has(i.props.value);else{if(e===t)return;s=ws(e,Up(n,!0))}n.checked!==s&&(n.checked=s)}const C_={created(n,{value:e},t){n.checked=ws(e,t.props.value),n[Nn]=es(t),Ti(n,"change",()=>{n[Nn](rr(n))})},beforeUpdate(n,{value:e,oldValue:t},i){n[Nn]=es(i),e!==t&&(n.checked=ws(e,i.props.value))}},Np={deep:!0,created(n,{value:e,modifiers:{number:t}},i){const s=pr(e);Ti(n,"change",()=>{const r=Array.prototype.filter.call(n.options,o=>o.selected).map(o=>t?Ra(rr(o)):rr(o));n[Nn](n.multiple?s?new Set(r):r:r[0]),n._assigning=!0,oo(()=>{n._assigning=!1})}),n[Nn]=es(i)},mounted(n,{value:e}){Vd(n,e)},beforeUpdate(n,e,t){n[Nn]=es(t)},updated(n,{value:e}){n._assigning||Vd(n,e)}};function Vd(n,e){const t=n.multiple,i=qe(e);if(!(t&&!i&&!pr(e))){for(let s=0,r=n.options.length;s<r;s++){const o=n.options[s],a=rr(o);if(t)if(i){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(c=>String(c)===String(a)):o.selected=du(e,a)>-1}else o.selected=e.has(a);else if(ws(rr(o),e)){n.selectedIndex!==s&&(n.selectedIndex=s);return}}!t&&n.selectedIndex!==-1&&(n.selectedIndex=-1)}}function rr(n){return"_value"in n?n._value:n.value}function Up(n,e){const t=e?"_trueValue":"_falseValue";return t in n?n[t]:e}const Ps={created(n,e,t){Mo(n,e,t,null,"created")},mounted(n,e,t){Mo(n,e,t,null,"mounted")},beforeUpdate(n,e,t,i){Mo(n,e,t,i,"beforeUpdate")},updated(n,e,t,i){Mo(n,e,t,i,"updated")}};function R_(n,e){switch(n){case"SELECT":return Np;case"TEXTAREA":return Ft;default:switch(e){case"checkbox":return A_;case"radio":return C_;default:return Ft}}}function Mo(n,e,t,i,s){const o=R_(n.tagName,t.props&&t.props.type)[s];o&&o(n,e,t,i)}const P_=["ctrl","shift","alt","meta"],I_={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>P_.some(t=>n[`${t}Key`]&&!e.includes(t))},lo=(n,e)=>{const t=n._withMods||(n._withMods={}),i=e.join(".");return t[i]||(t[i]=(s,...r)=>{for(let o=0;o<e.length;o++){const a=I_[e[o]];if(a&&a(s,e))return}return n(s,...r)})},D_={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},ls=(n,e)=>{const t=n._withKeys||(n._withKeys={}),i=e.join(".");return t[i]||(t[i]=s=>{if(!("key"in s))return;const r=ns(s.key);if(e.some(o=>o===r||D_[o]===r))return n(s)})},L_=Gt({patchProp:v_},Qv);let zd;function N_(){return zd||(zd=Dv(L_))}const U_=(...n)=>{const e=N_().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=O_(i);if(!s)return;const r=e._component;!Qe(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=t(s,!1,F_(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function F_(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function O_(n){return Bt(n)?document.querySelector(n):n}/*!
 * pinia v3.0.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let Fp;const ka=n=>Fp=n,Op=Symbol();function oc(n){return n&&typeof n=="object"&&Object.prototype.toString.call(n)==="[object Object]"&&typeof n.toJSON!="function"}var Gr;(function(n){n.direct="direct",n.patchObject="patch object",n.patchFunction="patch function"})(Gr||(Gr={}));function k_(){const n=wh(!0),e=n.run(()=>ne({}));let t=[],i=[];const s=_u({install(r){ka(s),s._a=r,r.provide(Op,s),r.config.globalProperties.$pinia=s,i.forEach(o=>t.push(o)),i=[]},use(r){return this._a?t.push(r):i.push(r),this},_p:t,_a:null,_e:n,_s:new Map,state:e});return s}const kp=()=>{};function Hd(n,e,t,i=kp){n.add(e);const s=()=>{n.delete(e)&&i()};return!t&&Th()&&cg(s),s}function Is(n,...e){n.forEach(t=>{t(...e)})}const B_=n=>n(),Gd=Symbol(),ol=Symbol();function ac(n,e){n instanceof Map&&e instanceof Map?e.forEach((t,i)=>n.set(i,t)):n instanceof Set&&e instanceof Set&&e.forEach(n.add,n);for(const t in e){if(!e.hasOwnProperty(t))continue;const i=e[t],s=n[t];oc(s)&&oc(i)&&n.hasOwnProperty(t)&&!kt(i)&&!Ci(i)?n[t]=ac(s,i):n[t]=i}return n}const V_=Symbol();function z_(n){return!oc(n)||!Object.prototype.hasOwnProperty.call(n,V_)}const{assign:Xi}=Object;function H_(n){return!!(kt(n)&&n.effect)}function G_(n,e,t,i){const{state:s,actions:r,getters:o}=e,a=t.state.value[n];let l;function c(){a||(t.state.value[n]=s?s():{});const u=Dg(t.state.value[n]);return Xi(u,r,Object.keys(o||{}).reduce((d,h)=>(d[h]=_u(rt(()=>{ka(t);const g=t._s.get(n);return o[h].call(g,g)})),d),{}))}return l=Bp(n,c,e,t,i,!0),l}function Bp(n,e,t={},i,s,r){let o;const a=Xi({actions:{}},t),l={deep:!0};let c,u,d=new Set,h=new Set,g;const _=i.state.value[n];!r&&!_&&(i.state.value[n]={});let v;function m(I){let M;c=u=!1,typeof I=="function"?(I(i.state.value[n]),M={type:Gr.patchFunction,storeId:n,events:g}):(ac(i.state.value[n],I),M={type:Gr.patchObject,payload:I,storeId:n,events:g});const w=v=Symbol();oo().then(()=>{v===w&&(c=!0)}),u=!0,Is(d,M,i.state.value[n])}const p=r?function(){const{state:M}=t,w=M?M():{};this.$patch(N=>{Xi(N,w)})}:kp;function S(){o.stop(),d.clear(),h.clear(),i._s.delete(n)}const x=(I,M="")=>{if(Gd in I)return I[ol]=M,I;const w=function(){ka(i);const N=Array.from(arguments),O=new Set,q=new Set;function Q(D){O.add(D)}function te(D){q.add(D)}Is(h,{args:N,name:w[ol],store:E,after:Q,onError:te});let H;try{H=I.apply(this&&this.$id===n?this:E,N)}catch(D){throw Is(q,D),D}return H instanceof Promise?H.then(D=>(Is(O,D),D)).catch(D=>(Is(q,D),Promise.reject(D))):(Is(O,H),H)};return w[Gd]=!0,w[ol]=M,w},b={_p:i,$id:n,$onAction:Hd.bind(null,h),$patch:m,$reset:p,$subscribe(I,M={}){const w=Hd(d,I,M.detached,()=>N()),N=o.run(()=>Gn(()=>i.state.value[n],O=>{(M.flush==="sync"?u:c)&&I({storeId:n,type:Gr.direct,events:g},O)},Xi({},l,M)));return w},$dispose:S},E=so(b);i._s.set(n,E);const T=(i._a&&i._a.runWithContext||B_)(()=>i._e.run(()=>(o=wh()).run(()=>e({action:x}))));for(const I in T){const M=T[I];if(kt(M)&&!H_(M)||Ci(M))r||(_&&z_(M)&&(kt(M)?M.value=_[I]:ac(M,_[I])),i.state.value[n][I]=M);else if(typeof M=="function"){const w=x(M,I);T[I]=w,a.actions[I]=M}}return Xi(E,T),Xi(ft(E),T),Object.defineProperty(E,"$state",{get:()=>i.state.value[n],set:I=>{m(M=>{Xi(M,I)})}}),i._p.forEach(I=>{Xi(E,o.run(()=>I({store:E,app:i._a,pinia:i,options:a})))}),_&&r&&t.hydrate&&t.hydrate(E.$state,_),c=!0,u=!0,E}/*! #__NO_SIDE_EFFECTS__ */function $_(n,e,t){let i;const s=typeof e=="function";i=s?t:e;function r(o,a){const l=Hg();return o=o||(l?An(Op,null):null),o&&ka(o),o=Fp,o._s.has(n)||(s?Bp(n,e,i,o):G_(n,i,o)),o._s.get(n)}return r.$id=n,r}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const js=typeof document<"u";function Vp(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function W_(n){return n.__esModule||n[Symbol.toStringTag]==="Module"||n.default&&Vp(n.default)}const _t=Object.assign;function al(n,e){const t={};for(const i in e){const s=e[i];t[i]=qn(s)?s.map(n):n(s)}return t}const $r=()=>{},qn=Array.isArray;function $d(n,e){const t={};for(const i in n)t[i]=i in e?e[i]:n[i];return t}const zp=/#/g,X_=/&/g,q_=/\//g,j_=/=/g,Y_=/\?/g,Hp=/\+/g,K_=/%5B/g,Z_=/%5D/g,Gp=/%5E/g,J_=/%60/g,$p=/%7B/g,Q_=/%7C/g,Wp=/%7D/g,e0=/%20/g;function wu(n){return n==null?"":encodeURI(""+n).replace(Q_,"|").replace(K_,"[").replace(Z_,"]")}function t0(n){return wu(n).replace($p,"{").replace(Wp,"}").replace(Gp,"^")}function lc(n){return wu(n).replace(Hp,"%2B").replace(e0,"+").replace(zp,"%23").replace(X_,"%26").replace(J_,"`").replace($p,"{").replace(Wp,"}").replace(Gp,"^")}function n0(n){return lc(n).replace(j_,"%3D")}function i0(n){return wu(n).replace(zp,"%23").replace(Y_,"%3F")}function s0(n){return i0(n).replace(q_,"%2F")}function Jr(n){if(n==null)return null;try{return decodeURIComponent(""+n)}catch{}return""+n}const r0=/\/$/,o0=n=>n.replace(r0,"");function ll(n,e,t="/"){let i,s={},r="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(i=e.slice(0,l),r=e.slice(l,a>0?a:e.length),s=n(r.slice(1))),a>=0&&(i=i||e.slice(0,a),o=e.slice(a,e.length)),i=u0(i??e,t),{fullPath:i+r+o,path:i,query:s,hash:Jr(o)}}function a0(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function Wd(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function l0(n,e,t){const i=e.matched.length-1,s=t.matched.length-1;return i>-1&&i===s&&or(e.matched[i],t.matched[s])&&Xp(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function or(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function Xp(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(var t in n)if(!c0(n[t],e[t]))return!1;return!0}function c0(n,e){return qn(n)?Xd(n,e):qn(e)?Xd(e,n):(n==null?void 0:n.valueOf())===(e==null?void 0:e.valueOf())}function Xd(n,e){return qn(e)?n.length===e.length&&n.every((t,i)=>t===e[i]):n.length===1&&n[0]===e}function u0(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),i=n.split("/"),s=i[i.length-1];(s===".."||s===".")&&i.push("");let r=t.length-1,o,a;for(o=0;o<i.length;o++)if(a=i[o],a!==".")if(a==="..")r>1&&r--;else break;return t.slice(0,r).join("/")+"/"+i.slice(o).join("/")}const ki={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let cc=function(n){return n.pop="pop",n.push="push",n}({}),cl=function(n){return n.back="back",n.forward="forward",n.unknown="",n}({});function d0(n){if(!n)if(js){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),o0(n)}const f0=/^[^#]+#/;function h0(n,e){return n.replace(f0,"#")+e}function p0(n,e){const t=document.documentElement.getBoundingClientRect(),i=n.getBoundingClientRect();return{behavior:e.behavior,left:i.left-t.left-(e.left||0),top:i.top-t.top-(e.top||0)}}const Ba=()=>({left:window.scrollX,top:window.scrollY});function m0(n){let e;if("el"in n){const t=n.el,i=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?i?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=p0(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function qd(n,e){return(history.state?history.state.position-e:-1)+n}const uc=new Map;function g0(n,e){uc.set(n,e)}function v0(n){const e=uc.get(n);return uc.delete(n),e}function _0(n){return typeof n=="string"||n&&typeof n=="object"}function qp(n){return typeof n=="string"||typeof n=="symbol"}let Ut=function(n){return n[n.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",n[n.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",n[n.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",n[n.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",n[n.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",n}({});const jp=Symbol("");Ut.MATCHER_NOT_FOUND+"",Ut.NAVIGATION_GUARD_REDIRECT+"",Ut.NAVIGATION_ABORTED+"",Ut.NAVIGATION_CANCELLED+"",Ut.NAVIGATION_DUPLICATED+"";function ar(n,e){return _t(new Error,{type:n,[jp]:!0},e)}function vi(n,e){return n instanceof Error&&jp in n&&(e==null||!!(n.type&e))}const x0=["params","query","hash"];function y0(n){if(typeof n=="string")return n;if(n.path!=null)return n.path;const e={};for(const t of x0)t in n&&(e[t]=n[t]);return JSON.stringify(e,null,2)}function S0(n){const e={};if(n===""||n==="?")return e;const t=(n[0]==="?"?n.slice(1):n).split("&");for(let i=0;i<t.length;++i){const s=t[i].replace(Hp," "),r=s.indexOf("="),o=Jr(r<0?s:s.slice(0,r)),a=r<0?null:Jr(s.slice(r+1));if(o in e){let l=e[o];qn(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function jd(n){let e="";for(let t in n){const i=n[t];if(t=n0(t),i==null){i!==void 0&&(e+=(e.length?"&":"")+t);continue}(qn(i)?i.map(s=>s&&lc(s)):[i&&lc(i)]).forEach(s=>{s!==void 0&&(e+=(e.length?"&":"")+t,s!=null&&(e+="="+s))})}return e}function M0(n){const e={};for(const t in n){const i=n[t];i!==void 0&&(e[t]=qn(i)?i.map(s=>s==null?null:""+s):i==null?i:""+i)}return e}const b0=Symbol(""),Yd=Symbol(""),Va=Symbol(""),Tu=Symbol(""),dc=Symbol("");function Mr(){let n=[];function e(i){return n.push(i),()=>{const s=n.indexOf(i);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n.slice(),reset:t}}function Ki(n,e,t,i,s,r=o=>o()){const o=i&&(i.enterCallbacks[s]=i.enterCallbacks[s]||[]);return()=>new Promise((a,l)=>{const c=h=>{h===!1?l(ar(Ut.NAVIGATION_ABORTED,{from:t,to:e})):h instanceof Error?l(h):_0(h)?l(ar(Ut.NAVIGATION_GUARD_REDIRECT,{from:e,to:h})):(o&&i.enterCallbacks[s]===o&&typeof h=="function"&&o.push(h),a())},u=r(()=>n.call(i&&i.instances[s],e,t,c));let d=Promise.resolve(u);n.length<3&&(d=d.then(c)),d.catch(h=>l(h))})}function ul(n,e,t,i,s=r=>r()){const r=[];for(const o of n)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(Vp(l)){const c=(l.__vccOpts||l)[e];c&&r.push(Ki(c,t,i,o,a,s))}else{let c=l();r.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const d=W_(u)?u.default:u;o.mods[a]=u,o.components[a]=d;const h=(d.__vccOpts||d)[e];return h&&Ki(h,t,i,o,a,s)()}))}}return r}function E0(n,e){const t=[],i=[],s=[],r=Math.max(e.matched.length,n.matched.length);for(let o=0;o<r;o++){const a=e.matched[o];a&&(n.matched.find(c=>or(c,a))?i.push(a):t.push(a));const l=n.matched[o];l&&(e.matched.find(c=>or(c,l))||s.push(l))}return[t,i,s]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let w0=()=>location.protocol+"//"+location.host;function Yp(n,e){const{pathname:t,search:i,hash:s}=e,r=n.indexOf("#");if(r>-1){let o=s.includes(n.slice(r))?n.slice(r).length:1,a=s.slice(o);return a[0]!=="/"&&(a="/"+a),Wd(a,"")}return Wd(t,n)+i+s}function T0(n,e,t,i){let s=[],r=[],o=null;const a=({state:h})=>{const g=Yp(n,location),_=t.value,v=e.value;let m=0;if(h){if(t.value=g,e.value=h,o&&o===_){o=null;return}m=v?h.position-v.position:0}else i(g);s.forEach(p=>{p(t.value,_,{delta:m,type:cc.pop,direction:m?m>0?cl.forward:cl.back:cl.unknown})})};function l(){o=t.value}function c(h){s.push(h);const g=()=>{const _=s.indexOf(h);_>-1&&s.splice(_,1)};return r.push(g),g}function u(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(_t({},h.state,{scroll:Ba()}),"")}}function d(){for(const h of r)h();r=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:d}}function Kd(n,e,t,i=!1,s=!1){return{back:n,current:e,forward:t,replaced:i,position:window.history.length,scroll:s?Ba():null}}function A0(n){const{history:e,location:t}=window,i={value:Yp(n,t)},s={value:e.state};s.value||r(i.value,{back:null,current:i.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function r(l,c,u){const d=n.indexOf("#"),h=d>-1?(t.host&&document.querySelector("base")?n:n.slice(d))+l:w0()+n+l;try{e[u?"replaceState":"pushState"](c,"",h),s.value=c}catch(g){console.error(g),t[u?"replace":"assign"](h)}}function o(l,c){r(l,_t({},e.state,Kd(s.value.back,l,s.value.forward,!0),c,{position:s.value.position}),!0),i.value=l}function a(l,c){const u=_t({},s.value,e.state,{forward:l,scroll:Ba()});r(u.current,u,!0),r(l,_t({},Kd(i.value,l,null),{position:u.position+1},c),!1),i.value=l}return{location:i,state:s,push:a,replace:o}}function C0(n){n=d0(n);const e=A0(n),t=T0(n,e.state,e.location,e.replace);function i(r,o=!0){o||t.pauseListeners(),history.go(r)}const s=_t({location:"",base:n,go:i,createHref:h0.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}let ys=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.Group=2]="Group",n}({});var $t=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.ParamRegExp=2]="ParamRegExp",n[n.ParamRegExpEnd=3]="ParamRegExpEnd",n[n.EscapeNext=4]="EscapeNext",n}($t||{});const R0={type:ys.Static,value:""},P0=/[a-zA-Z0-9_]/;function I0(n){if(!n)return[[]];if(n==="/")return[[R0]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(g){throw new Error(`ERR (${t})/"${c}": ${g}`)}let t=$t.Static,i=t;const s=[];let r;function o(){r&&s.push(r),r=[]}let a=0,l,c="",u="";function d(){c&&(t===$t.Static?r.push({type:ys.Static,value:c}):t===$t.Param||t===$t.ParamRegExp||t===$t.ParamRegExpEnd?(r.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),r.push({type:ys.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function h(){c+=l}for(;a<n.length;){if(l=n[a++],l==="\\"&&t!==$t.ParamRegExp){i=t,t=$t.EscapeNext;continue}switch(t){case $t.Static:l==="/"?(c&&d(),o()):l===":"?(d(),t=$t.Param):h();break;case $t.EscapeNext:h(),t=i;break;case $t.Param:l==="("?t=$t.ParamRegExp:P0.test(l)?h():(d(),t=$t.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case $t.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:t=$t.ParamRegExpEnd:u+=l;break;case $t.ParamRegExpEnd:d(),t=$t.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,u="";break;default:e("Unknown state");break}}return t===$t.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),d(),o(),s}const Zd="[^/]+?",D0={sensitive:!1,strict:!1,start:!0,end:!0};var fn=function(n){return n[n._multiplier=10]="_multiplier",n[n.Root=90]="Root",n[n.Segment=40]="Segment",n[n.SubSegment=30]="SubSegment",n[n.Static=40]="Static",n[n.Dynamic=20]="Dynamic",n[n.BonusCustomRegExp=10]="BonusCustomRegExp",n[n.BonusWildcard=-50]="BonusWildcard",n[n.BonusRepeatable=-20]="BonusRepeatable",n[n.BonusOptional=-8]="BonusOptional",n[n.BonusStrict=.7000000000000001]="BonusStrict",n[n.BonusCaseSensitive=.25]="BonusCaseSensitive",n}(fn||{});const L0=/[.+*?^${}()[\]/\\]/g;function N0(n,e){const t=_t({},D0,e),i=[];let s=t.start?"^":"";const r=[];for(const c of n){const u=c.length?[]:[fn.Root];t.strict&&!c.length&&(s+="/");for(let d=0;d<c.length;d++){const h=c[d];let g=fn.Segment+(t.sensitive?fn.BonusCaseSensitive:0);if(h.type===ys.Static)d||(s+="/"),s+=h.value.replace(L0,"\\$&"),g+=fn.Static;else if(h.type===ys.Param){const{value:_,repeatable:v,optional:m,regexp:p}=h;r.push({name:_,repeatable:v,optional:m});const S=p||Zd;if(S!==Zd){g+=fn.BonusCustomRegExp;try{`${S}`}catch(b){throw new Error(`Invalid custom RegExp for param "${_}" (${S}): `+b.message)}}let x=v?`((?:${S})(?:/(?:${S}))*)`:`(${S})`;d||(x=m&&c.length<2?`(?:/${x})`:"/"+x),m&&(x+="?"),s+=x,g+=fn.Dynamic,m&&(g+=fn.BonusOptional),v&&(g+=fn.BonusRepeatable),S===".*"&&(g+=fn.BonusWildcard)}u.push(g)}i.push(u)}if(t.strict&&t.end){const c=i.length-1;i[c][i[c].length-1]+=fn.BonusStrict}t.strict||(s+="/?"),t.end?s+="$":t.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,t.sensitive?"":"i");function a(c){const u=c.match(o),d={};if(!u)return null;for(let h=1;h<u.length;h++){const g=u[h]||"",_=r[h-1];d[_.name]=g&&_.repeatable?g.split("/"):g}return d}function l(c){let u="",d=!1;for(const h of n){(!d||!u.endsWith("/"))&&(u+="/"),d=!1;for(const g of h)if(g.type===ys.Static)u+=g.value;else if(g.type===ys.Param){const{value:_,repeatable:v,optional:m}=g,p=_ in c?c[_]:"";if(qn(p)&&!v)throw new Error(`Provided param "${_}" is an array but it is not repeatable (* or + modifiers)`);const S=qn(p)?p.join("/"):p;if(!S)if(m)h.length<2&&(u.endsWith("/")?u=u.slice(0,-1):d=!0);else throw new Error(`Missing required param "${_}"`);u+=S}}return u||"/"}return{re:o,score:i,keys:r,parse:a,stringify:l}}function U0(n,e){let t=0;for(;t<n.length&&t<e.length;){const i=e[t]-n[t];if(i)return i;t++}return n.length<e.length?n.length===1&&n[0]===fn.Static+fn.Segment?-1:1:n.length>e.length?e.length===1&&e[0]===fn.Static+fn.Segment?1:-1:0}function Kp(n,e){let t=0;const i=n.score,s=e.score;for(;t<i.length&&t<s.length;){const r=U0(i[t],s[t]);if(r)return r;t++}if(Math.abs(s.length-i.length)===1){if(Jd(i))return 1;if(Jd(s))return-1}return s.length-i.length}function Jd(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const F0={strict:!1,end:!0,sensitive:!1};function O0(n,e,t){const i=N0(I0(n.path),t),s=_t(i,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function k0(n,e){const t=[],i=new Map;e=$d(F0,e);function s(d){return i.get(d)}function r(d,h,g){const _=!g,v=ef(d);v.aliasOf=g&&g.record;const m=$d(e,d),p=[v];if("alias"in d){const b=typeof d.alias=="string"?[d.alias]:d.alias;for(const E of b)p.push(ef(_t({},v,{components:g?g.record.components:v.components,path:E,aliasOf:g?g.record:v})))}let S,x;for(const b of p){const{path:E}=b;if(h&&E[0]!=="/"){const A=h.record.path,T=A[A.length-1]==="/"?"":"/";b.path=h.record.path+(E&&T+E)}if(S=O0(b,h,m),g?g.alias.push(S):(x=x||S,x!==S&&x.alias.push(S),_&&d.name&&!tf(S)&&o(d.name)),Zp(S)&&l(S),v.children){const A=v.children;for(let T=0;T<A.length;T++)r(A[T],S,g&&g.children[T])}g=g||S}return x?()=>{o(x)}:$r}function o(d){if(qp(d)){const h=i.get(d);h&&(i.delete(d),t.splice(t.indexOf(h),1),h.children.forEach(o),h.alias.forEach(o))}else{const h=t.indexOf(d);h>-1&&(t.splice(h,1),d.record.name&&i.delete(d.record.name),d.children.forEach(o),d.alias.forEach(o))}}function a(){return t}function l(d){const h=z0(d,t);t.splice(h,0,d),d.record.name&&!tf(d)&&i.set(d.record.name,d)}function c(d,h){let g,_={},v,m;if("name"in d&&d.name){if(g=i.get(d.name),!g)throw ar(Ut.MATCHER_NOT_FOUND,{location:d});m=g.record.name,_=_t(Qd(h.params,g.keys.filter(x=>!x.optional).concat(g.parent?g.parent.keys.filter(x=>x.optional):[]).map(x=>x.name)),d.params&&Qd(d.params,g.keys.map(x=>x.name))),v=g.stringify(_)}else if(d.path!=null)v=d.path,g=t.find(x=>x.re.test(v)),g&&(_=g.parse(v),m=g.record.name);else{if(g=h.name?i.get(h.name):t.find(x=>x.re.test(h.path)),!g)throw ar(Ut.MATCHER_NOT_FOUND,{location:d,currentLocation:h});m=g.record.name,_=_t({},h.params,d.params),v=g.stringify(_)}const p=[];let S=g;for(;S;)p.unshift(S.record),S=S.parent;return{name:m,path:v,params:_,matched:p,meta:V0(p)}}n.forEach(d=>r(d));function u(){t.length=0,i.clear()}return{addRoute:r,resolve:c,removeRoute:o,clearRoutes:u,getRoutes:a,getRecordMatcher:s}}function Qd(n,e){const t={};for(const i of e)i in n&&(t[i]=n[i]);return t}function ef(n){const e={path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:n.aliasOf,beforeEnter:n.beforeEnter,props:B0(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function B0(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const i in n.components)e[i]=typeof t=="object"?t[i]:t;return e}function tf(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function V0(n){return n.reduce((e,t)=>_t(e,t.meta),{})}function z0(n,e){let t=0,i=e.length;for(;t!==i;){const r=t+i>>1;Kp(n,e[r])<0?i=r:t=r+1}const s=H0(n);return s&&(i=e.lastIndexOf(s,i-1)),i}function H0(n){let e=n;for(;e=e.parent;)if(Zp(e)&&Kp(n,e)===0)return e}function Zp({record:n}){return!!(n.name||n.components&&Object.keys(n.components).length||n.redirect)}function nf(n){const e=An(Va),t=An(Tu),i=rt(()=>{const l=ve(n.to);return e.resolve(l)}),s=rt(()=>{const{matched:l}=i.value,{length:c}=l,u=l[c-1],d=t.matched;if(!u||!d.length)return-1;const h=d.findIndex(or.bind(null,u));if(h>-1)return h;const g=sf(l[c-2]);return c>1&&sf(u)===g&&d[d.length-1].path!==g?d.findIndex(or.bind(null,l[c-2])):h}),r=rt(()=>s.value>-1&&X0(t.params,i.value.params)),o=rt(()=>s.value>-1&&s.value===t.matched.length-1&&Xp(t.params,i.value.params));function a(l={}){if(W0(l)){const c=e[ve(n.replace)?"replace":"push"](ve(n.to)).catch($r);return n.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:i,href:rt(()=>i.value.href),isActive:r,isExactActive:o,navigate:a}}function G0(n){return n.length===1?n[0]:n}const $0=et({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:nf,setup(n,{slots:e}){const t=so(nf(n)),{options:i}=An(Va),s=rt(()=>({[rf(n.activeClass,i.linkActiveClass,"router-link-active")]:t.isActive,[rf(n.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const r=e.default&&G0(e.default(t));return n.custom?r:Ap("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},r)}}}),_a=$0;function W0(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function X0(n,e){for(const t in e){const i=e[t],s=n[t];if(typeof i=="string"){if(i!==s)return!1}else if(!qn(s)||s.length!==i.length||i.some((r,o)=>r.valueOf()!==s[o].valueOf()))return!1}return!0}function sf(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const rf=(n,e,t)=>n??e??t,q0=et({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const i=An(dc),s=rt(()=>n.route||i.value),r=An(Yd,0),o=rt(()=>{let c=ve(r);const{matched:u}=s.value;let d;for(;(d=u[c])&&!d.components;)c++;return c}),a=rt(()=>s.value.matched[o.value]);Ko(Yd,rt(()=>o.value+1)),Ko(b0,a),Ko(dc,s);const l=ne();return Gn(()=>[l.value,a.value,n.name],([c,u,d],[h,g,_])=>{u&&(u.instances[d]=c,g&&g!==u&&c&&c===h&&(u.leaveGuards.size||(u.leaveGuards=g.leaveGuards),u.updateGuards.size||(u.updateGuards=g.updateGuards))),c&&u&&(!g||!or(u,g)||!h)&&(u.enterCallbacks[d]||[]).forEach(v=>v(c))},{flush:"post"}),()=>{const c=s.value,u=n.name,d=a.value,h=d&&d.components[u];if(!h)return of(t.default,{Component:h,route:c});const g=d.props[u],_=g?g===!0?c.params:typeof g=="function"?g(c):g:null,m=Ap(h,_t({},_,e,{onVnodeUnmounted:p=>{p.component.isUnmounted&&(d.instances[u]=null)},ref:l}));return of(t.default,{Component:m,route:c})||m}}});function of(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const j0=q0;function Y0(n){const e=k0(n.routes,n),t=n.parseQuery||S0,i=n.stringifyQuery||jd,s=n.history,r=Mr(),o=Mr(),a=Mr(),l=Rg(ki);let c=ki;js&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=al.bind(null,R=>""+R),d=al.bind(null,s0),h=al.bind(null,Jr);function g(R,W){let ce,de;return qp(R)?(ce=e.getRecordMatcher(R),de=W):de=R,e.addRoute(de,ce)}function _(R){const W=e.getRecordMatcher(R);W&&e.removeRoute(W)}function v(){return e.getRoutes().map(R=>R.record)}function m(R){return!!e.getRecordMatcher(R)}function p(R,W){if(W=_t({},W||l.value),typeof R=="string"){const X=ll(t,R,W.path),re=e.resolve({path:X.path},W),ie=s.createHref(X.fullPath);return _t(X,re,{params:h(re.params),hash:Jr(X.hash),redirectedFrom:void 0,href:ie})}let ce;if(R.path!=null)ce=_t({},R,{path:ll(t,R.path,W.path).path});else{const X=_t({},R.params);for(const re in X)X[re]==null&&delete X[re];ce=_t({},R,{params:d(X)}),W.params=d(W.params)}const de=e.resolve(ce,W),Be=R.hash||"";de.params=u(h(de.params));const U=a0(i,_t({},R,{hash:t0(Be),path:de.path})),k=s.createHref(U);return _t({fullPath:U,hash:Be,query:i===jd?M0(R.query):R.query||{}},de,{redirectedFrom:void 0,href:k})}function S(R){return typeof R=="string"?ll(t,R,l.value.path):_t({},R)}function x(R,W){if(c!==R)return ar(Ut.NAVIGATION_CANCELLED,{from:W,to:R})}function b(R){return T(R)}function E(R){return b(_t(S(R),{replace:!0}))}function A(R,W){const ce=R.matched[R.matched.length-1];if(ce&&ce.redirect){const{redirect:de}=ce;let Be=typeof de=="function"?de(R,W):de;return typeof Be=="string"&&(Be=Be.includes("?")||Be.includes("#")?Be=S(Be):{path:Be},Be.params={}),_t({query:R.query,hash:R.hash,params:Be.path!=null?{}:R.params},Be)}}function T(R,W){const ce=c=p(R),de=l.value,Be=R.state,U=R.force,k=R.replace===!0,X=A(ce,de);if(X)return T(_t(S(X),{state:typeof X=="object"?_t({},Be,X.state):Be,force:U,replace:k}),W||ce);const re=ce;re.redirectedFrom=W;let ie;return!U&&l0(i,de,ce)&&(ie=ar(Ut.NAVIGATION_DUPLICATED,{to:re,from:de}),ye(de,de,!0,!1)),(ie?Promise.resolve(ie):w(re,de)).catch(ae=>vi(ae)?vi(ae,Ut.NAVIGATION_GUARD_REDIRECT)?ae:he(ae):$(ae,re,de)).then(ae=>{if(ae){if(vi(ae,Ut.NAVIGATION_GUARD_REDIRECT))return T(_t({replace:k},S(ae.to),{state:typeof ae.to=="object"?_t({},Be,ae.to.state):Be,force:U}),W||re)}else ae=O(re,de,!0,k,Be);return N(re,de,ae),ae})}function I(R,W){const ce=x(R,W);return ce?Promise.reject(ce):Promise.resolve()}function M(R){const W=dt.values().next().value;return W&&typeof W.runWithContext=="function"?W.runWithContext(R):R()}function w(R,W){let ce;const[de,Be,U]=E0(R,W);ce=ul(de.reverse(),"beforeRouteLeave",R,W);for(const X of de)X.leaveGuards.forEach(re=>{ce.push(Ki(re,R,W))});const k=I.bind(null,R,W);return ce.push(k),G(ce).then(()=>{ce=[];for(const X of r.list())ce.push(Ki(X,R,W));return ce.push(k),G(ce)}).then(()=>{ce=ul(Be,"beforeRouteUpdate",R,W);for(const X of Be)X.updateGuards.forEach(re=>{ce.push(Ki(re,R,W))});return ce.push(k),G(ce)}).then(()=>{ce=[];for(const X of U)if(X.beforeEnter)if(qn(X.beforeEnter))for(const re of X.beforeEnter)ce.push(Ki(re,R,W));else ce.push(Ki(X.beforeEnter,R,W));return ce.push(k),G(ce)}).then(()=>(R.matched.forEach(X=>X.enterCallbacks={}),ce=ul(U,"beforeRouteEnter",R,W,M),ce.push(k),G(ce))).then(()=>{ce=[];for(const X of o.list())ce.push(Ki(X,R,W));return ce.push(k),G(ce)}).catch(X=>vi(X,Ut.NAVIGATION_CANCELLED)?X:Promise.reject(X))}function N(R,W,ce){a.list().forEach(de=>M(()=>de(R,W,ce)))}function O(R,W,ce,de,Be){const U=x(R,W);if(U)return U;const k=W===ki,X=js?history.state:{};ce&&(de||k?s.replace(R.fullPath,_t({scroll:k&&X&&X.scroll},Be)):s.push(R.fullPath,Be)),l.value=R,ye(R,W,ce,k),he()}let q;function Q(){q||(q=s.listen((R,W,ce)=>{if(!at.listening)return;const de=p(R),Be=A(de,at.currentRoute.value);if(Be){T(_t(Be,{replace:!0,force:!0}),de).catch($r);return}c=de;const U=l.value;js&&g0(qd(U.fullPath,ce.delta),Ba()),w(de,U).catch(k=>vi(k,Ut.NAVIGATION_ABORTED|Ut.NAVIGATION_CANCELLED)?k:vi(k,Ut.NAVIGATION_GUARD_REDIRECT)?(T(_t(S(k.to),{force:!0}),de).then(X=>{vi(X,Ut.NAVIGATION_ABORTED|Ut.NAVIGATION_DUPLICATED)&&!ce.delta&&ce.type===cc.pop&&s.go(-1,!1)}).catch($r),Promise.reject()):(ce.delta&&s.go(-ce.delta,!1),$(k,de,U))).then(k=>{k=k||O(de,U,!1),k&&(ce.delta&&!vi(k,Ut.NAVIGATION_CANCELLED)?s.go(-ce.delta,!1):ce.type===cc.pop&&vi(k,Ut.NAVIGATION_ABORTED|Ut.NAVIGATION_DUPLICATED)&&s.go(-1,!1)),N(de,U,k)}).catch($r)}))}let te=Mr(),H=Mr(),D;function $(R,W,ce){he(R);const de=H.list();return de.length?de.forEach(Be=>Be(R,W,ce)):console.error(R),Promise.reject(R)}function fe(){return D&&l.value!==ki?Promise.resolve():new Promise((R,W)=>{te.add([R,W])})}function he(R){return D||(D=!R,Q(),te.list().forEach(([W,ce])=>R?ce(R):W()),te.reset()),R}function ye(R,W,ce,de){const{scrollBehavior:Be}=n;if(!js||!Be)return Promise.resolve();const U=!ce&&v0(qd(R.fullPath,0))||(de||!ce)&&history.state&&history.state.scroll||null;return oo().then(()=>Be(R,W,U)).then(k=>k&&m0(k)).catch(k=>$(k,R,W))}const He=R=>s.go(R);let We;const dt=new Set,at={currentRoute:l,listening:!0,addRoute:g,removeRoute:_,clearRoutes:e.clearRoutes,hasRoute:m,getRoutes:v,resolve:p,options:n,push:b,replace:E,go:He,back:()=>He(-1),forward:()=>He(1),beforeEach:r.add,beforeResolve:o.add,afterEach:a.add,onError:H.add,isReady:fe,install(R){R.component("RouterLink",_a),R.component("RouterView",j0),R.config.globalProperties.$router=at,Object.defineProperty(R.config.globalProperties,"$route",{enumerable:!0,get:()=>ve(l)}),js&&!We&&l.value===ki&&(We=!0,b(s.location).catch(de=>{}));const W={};for(const de in ki)Object.defineProperty(W,de,{get:()=>l.value[de],enumerable:!0});R.provide(Va,at),R.provide(Tu,zh(W)),R.provide(dc,l);const ce=R.unmount;dt.add(R),R.unmount=function(){dt.delete(R),dt.size<1&&(c=ki,q&&q(),q=null,l.value=ki,We=!1,D=!1),ce()}}};function G(R){return R.reduce((W,ce)=>W.then(()=>M(ce)),Promise.resolve())}return at}function za(){return An(Va)}function Au(n){return An(Tu)}const K0="/assets/newMusic-CN0p2ACZ.mp3",Z0="/assets/fart-with-reverb-C8ugyAjD.mp3";function J0(n){const e=n.match(/^<(a?):([^:]+):(\d+)>$/);if(e){const t=e[1]==="a",i=e[2],s=e[3];return{type:t?"discord_animated":"discord_static",name:i,id:s,url:`https://cdn.discordapp.com/emojis/${s}.${t?"gif":"png"}`,original:n}}return{type:"unicode",name:n,original:n}}const Q0=["src","alt"],ex=et({__name:"EmojiRenderer",props:{emoji:{},size:{}},setup(n){const e=n,t=rt(()=>J0(e.emoji)),i=rt(()=>e.size||32);return(s,r)=>t.value.type==="discord_static"||t.value.type==="discord_animated"?(F(),B("img",{key:0,src:t.value.url,alt:t.value.name,class:"discord-emoji",style:Ht({width:`${i.value}px`,height:`${i.value}px`}),loading:"lazy"},null,12,Q0)):(F(),B("span",{key:1,class:"unicode-emoji",style:Ht({fontSize:`${i.value}px`})},z(n.emoji),5))}}),ut=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t},Jp=ut(ex,[["__scopeId","data-v-f0f2b803"]]);function tx(){const n=(i,s)=>{const r=document.getElementById(i);r&&(r.pause(),r.currentTime=(s==null?void 0:s.startTime)??0,(s==null?void 0:s.volume)!==void 0&&(r.volume=Math.min(Math.max(s.volume,0),1)),r.play())};return{playSound:n,playFart:i=>{n("fartSound",{volume:i})},toggleMusic:i=>{const s=document.getElementById("newMusic");s&&(i?s.play():s.pause())}}}function nx(){const n=ne(""),e=ne(!0),t=async()=>{try{e.value=!0;const i=await fetch("https://api.thecatapi.com/v1/images/search?size=med");if(!i.ok){console.error("Failed to fetch cat:",i.status);return}const s=await i.json();s&&s.length>0&&s[0].url?n.value=s[0].url:console.error("Invalid cat API response:",s)}catch(i){console.error("Error fetching cat:",i)}finally{e.value=!1}};return It(()=>{t()}),{catImage:n,catLoading:e,fetchNewCat:t}}const ix=/\{[^{}]+\}/g,sx=()=>{var n,e;return typeof process=="object"&&Number.parseInt((e=(n=process==null?void 0:process.versions)==null?void 0:n.node)==null?void 0:e.substring(0,2))>=18&&process.versions.undici};function rx(){return Math.random().toString(36).slice(2,11)}function ox(n){let{baseUrl:e="",Request:t=globalThis.Request,fetch:i=globalThis.fetch,querySerializer:s,bodySerializer:r,headers:o,requestInitExt:a=void 0,...l}={...n};a=sx()?a:void 0,e=cf(e);const c=[];async function u(d,h){const{baseUrl:g,fetch:_=i,Request:v=t,headers:m,params:p={},parseAs:S="json",querySerializer:x,bodySerializer:b=r??lx,body:E,middleware:A=[],...T}=h||{};let I=e;g&&(I=cf(g)??e);let M=typeof s=="function"?s:af(s);x&&(M=typeof x=="function"?x:af({...typeof s=="object"?s:{},...x}));const w=E===void 0?void 0:b(E,lf(o,m,p.header)),N=lf(w===void 0||w instanceof FormData?{}:{"Content-Type":"application/json"},o,m,p.header),O=[...c,...A],q={redirect:"follow",...l,...T,body:w,headers:N};let Q,te,H=new v(cx(d,{baseUrl:I,params:p,querySerializer:M}),q),D;for(const fe in T)fe in H||(H[fe]=T[fe]);if(O.length){Q=rx(),te=Object.freeze({baseUrl:I,fetch:_,parseAs:S,querySerializer:M,bodySerializer:b});for(const fe of O)if(fe&&typeof fe=="object"&&typeof fe.onRequest=="function"){const he=await fe.onRequest({request:H,schemaPath:d,params:p,options:te,id:Q});if(he)if(he instanceof v)H=he;else if(he instanceof Response){D=he;break}else throw new Error("onRequest: must return new Request() or Response() when modifying the request")}}if(!D){try{D=await _(H,a)}catch(fe){let he=fe;if(O.length)for(let ye=O.length-1;ye>=0;ye--){const He=O[ye];if(He&&typeof He=="object"&&typeof He.onError=="function"){const We=await He.onError({request:H,error:he,schemaPath:d,params:p,options:te,id:Q});if(We){if(We instanceof Response){he=void 0,D=We;break}if(We instanceof Error){he=We;continue}throw new Error("onError: must return new Response() or instance of Error")}}}if(he)throw he}if(O.length)for(let fe=O.length-1;fe>=0;fe--){const he=O[fe];if(he&&typeof he=="object"&&typeof he.onResponse=="function"){const ye=await he.onResponse({request:H,response:D,schemaPath:d,params:p,options:te,id:Q});if(ye){if(!(ye instanceof Response))throw new Error("onResponse: must return new Response() when modifying the response");D=ye}}}}if(D.status===204||H.method==="HEAD"||D.headers.get("Content-Length")==="0")return D.ok?{data:void 0,response:D}:{error:void 0,response:D};if(D.ok)return S==="stream"?{data:D.body,response:D}:{data:await D[S](),response:D};let $=await D.text();try{$=JSON.parse($)}catch{}return{error:$,response:D}}return{request(d,h,g){return u(h,{...g,method:d.toUpperCase()})},GET(d,h){return u(d,{...h,method:"GET"})},PUT(d,h){return u(d,{...h,method:"PUT"})},POST(d,h){return u(d,{...h,method:"POST"})},DELETE(d,h){return u(d,{...h,method:"DELETE"})},OPTIONS(d,h){return u(d,{...h,method:"OPTIONS"})},HEAD(d,h){return u(d,{...h,method:"HEAD"})},PATCH(d,h){return u(d,{...h,method:"PATCH"})},TRACE(d,h){return u(d,{...h,method:"TRACE"})},use(...d){for(const h of d)if(h){if(typeof h!="object"||!("onRequest"in h||"onResponse"in h||"onError"in h))throw new Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");c.push(h)}},eject(...d){for(const h of d){const g=c.indexOf(h);g!==-1&&c.splice(g,1)}}}}function Ha(n,e,t){if(e==null)return"";if(typeof e=="object")throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");return`${n}=${(t==null?void 0:t.allowReserved)===!0?e:encodeURIComponent(e)}`}function Qp(n,e,t){if(!e||typeof e!="object")return"";const i=[],s={simple:",",label:".",matrix:";"}[t.style]||"&";if(t.style!=="deepObject"&&t.explode===!1){for(const a in e)i.push(a,t.allowReserved===!0?e[a]:encodeURIComponent(e[a]));const o=i.join(",");switch(t.style){case"form":return`${n}=${o}`;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return o}}for(const o in e){const a=t.style==="deepObject"?`${n}[${o}]`:o;i.push(Ha(a,e[o],t))}const r=i.join(s);return t.style==="label"||t.style==="matrix"?`${s}${r}`:r}function em(n,e,t){if(!Array.isArray(e))return"";if(t.explode===!1){const r={form:",",spaceDelimited:"%20",pipeDelimited:"|"}[t.style]||",",o=(t.allowReserved===!0?e:e.map(a=>encodeURIComponent(a))).join(r);switch(t.style){case"simple":return o;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return`${n}=${o}`}}const i={simple:",",label:".",matrix:";"}[t.style]||"&",s=[];for(const r of e)t.style==="simple"||t.style==="label"?s.push(t.allowReserved===!0?r:encodeURIComponent(r)):s.push(Ha(n,r,t));return t.style==="label"||t.style==="matrix"?`${i}${s.join(i)}`:s.join(i)}function af(n){return function(t){const i=[];if(t&&typeof t=="object")for(const s in t){const r=t[s];if(r!=null){if(Array.isArray(r)){if(r.length===0)continue;i.push(em(s,r,{style:"form",explode:!0,...n==null?void 0:n.array,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}if(typeof r=="object"){i.push(Qp(s,r,{style:"deepObject",explode:!0,...n==null?void 0:n.object,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}i.push(Ha(s,r,n))}}return i.join("&")}}function ax(n,e){let t=n;for(const i of n.match(ix)??[]){let s=i.substring(1,i.length-1),r=!1,o="simple";if(s.endsWith("*")&&(r=!0,s=s.substring(0,s.length-1)),s.startsWith(".")?(o="label",s=s.substring(1)):s.startsWith(";")&&(o="matrix",s=s.substring(1)),!e||e[s]===void 0||e[s]===null)continue;const a=e[s];if(Array.isArray(a)){t=t.replace(i,em(s,a,{style:o,explode:r}));continue}if(typeof a=="object"){t=t.replace(i,Qp(s,a,{style:o,explode:r}));continue}if(o==="matrix"){t=t.replace(i,`;${Ha(s,a)}`);continue}t=t.replace(i,o==="label"?`.${encodeURIComponent(a)}`:encodeURIComponent(a))}return t}function lx(n,e){return n instanceof FormData?n:e&&(e.get instanceof Function?e.get("Content-Type")??e.get("content-type"):e["Content-Type"]??e["content-type"])==="application/x-www-form-urlencoded"?new URLSearchParams(n).toString():JSON.stringify(n)}function cx(n,e){var s;let t=`${e.baseUrl}${n}`;(s=e.params)!=null&&s.path&&(t=ax(t,e.params.path));let i=e.querySerializer(e.params.query??{});return i.startsWith("?")&&(i=i.substring(1)),i&&(t+=`?${i}`),t}function lf(...n){const e=new Headers;for(const t of n){if(!t||typeof t!="object")continue;const i=t instanceof Headers?t.entries():Object.entries(t);for(const[s,r]of i)if(r===null)e.delete(s);else if(Array.isArray(r))for(const o of r)e.append(s,o);else r!==void 0&&e.set(s,r)}return e}function cf(n){return n.endsWith("/")?n.substring(0,n.length-1):n}function tm(){return typeof window<"u"&&window.__API_BASE_URL__?window.__API_BASE_URL__:""}const zt=ox({baseUrl:tm()||"/api",headers:{"Content-Type":"application/json"}});class ux{async getHealth(){const{data:e,error:t}=await zt.GET("/health",{});if(t)throw new Error(t.error||"Failed to get health status");return e}async getRankings(){const{data:e,error:t}=await zt.GET("/rankings",{});if(t)throw new Error(t.error||"Failed to get rankings");return(e==null?void 0:e.rankings)||[]}async getQuote(){const{data:e,error:t}=await zt.GET("/quote",{});if(t)throw new Error(t.error||"Failed to get quote");return e==null?void 0:e.quote}async detectGender(e,t){const{data:i,error:s}=await zt.POST("/gender",{body:{name:e,country:t}});if(s)throw new Error(s.error||"Failed to detect gender");return i}}const nm=new ux;function dx(){const n=ne([]),e=ne(!1);return{rankings:n,loading:e,loadRankings:async()=>{try{e.value=!0,n.value=await nm.getRankings()}catch(s){console.error("Failed to load rankings:",s)}finally{e.value=!1}},getTrendClass:s=>{const r=["trend-up","trend-down","trend-same"];return r[s%r.length]}}}const ta={rankings:!0,cat:!1,feed:!1,digitalGoose:!0,tachometer:!0,coolnessPanel:!0},bo=["rankings","cat"],fx=()=>{if(typeof window>"u")return ta;try{const n=localStorage.getItem("panels");if(n)return{...ta,...JSON.parse(n)}}catch(n){console.error("Failed to load panels from localStorage:",n)}return ta},hx=n=>{if(!(typeof window>"u"))try{localStorage.setItem("panels",JSON.stringify(n))}catch(e){console.error("Failed to save panels to localStorage:",e)}};function px(n){const e=ne({...ta,...n}),t=fx();e.value={...e.value,...t},Gn(e,a=>{hx(a)},{deep:!0});const i=()=>typeof window>"u"?!1:window.innerWidth<=768;return{panels:e,togglePanel:a=>{const l=e.value[a];i()&&!l&&bo.includes(a)&&bo.forEach(c=>{c!==a&&(e.value[c]=!1)}),e.value[a]=!l},openPanel:a=>{i()&&bo.includes(a)&&bo.forEach(l=>{l!==a&&(e.value[l]=!1)}),e.value[a]=!0},closePanel:a=>{e.value[a]=!1}}}const Qt=$_("app",()=>{const n=tx(),e=nx(),t=dx(),i=px(),s=localStorage.getItem("darkMode"),r=ne(s==="true"),o=ne(!1),a=ne(0),l=ne(50),c=ne(!1),u=ne(!1),d=ne("home"),h=ne(["Stay curious, keep asking questions.","The best way to predict future is to create it.","Every moment is a fresh beginning.","Chaos is just order waiting to be discovered.","Your potential is endless.","Keep being weird.","Normal is overrated.","Be energy you want to see in world."]),g=rt(()=>h.value[a.value]),_=()=>{r.value=!r.value,localStorage.setItem("darkMode",r.value.toString()),document.body.classList.toggle("dark",r.value)},v=()=>{o.value=!o.value,n.toggleMusic(o.value)},m=()=>{a.value=(a.value+1)%h.value.length},p=()=>{const T=Math.floor(Math.random()*100),I=T/50;n.playFart(I),setTimeout(()=>{u.value=!0},300),l.value=T},S=()=>{n.playFart(1),setTimeout(()=>{u.value=!0},300)},x=()=>{u.value=!1},b=()=>{c.value=!1},E=T=>{d.value=T},A=()=>{const T=document.createElement("div");T.className="heart",Math.random()<.15?T.innerHTML="🥚":T.innerHTML=["💖","💕","💗","💓","❤️"][Math.floor(Math.random()*5)],T.style.left=Math.random()*100+"vw",T.style.animationDuration=Math.random()*3+3+"s",document.body.appendChild(T),T.addEventListener("animationend",()=>{T.remove()})};return{darkMode:r,musicPlaying:o,currentQuoteIndex:a,tachValue:l,mikaModalOpen:c,confirmationOpen:u,currentRoute:d,quotes:h,currentQuote:g,panels:i.panels,catImage:e.catImage,catLoading:e.catLoading,rankings:t.rankings,rankingsLoading:t.loading,toggleDarkMode:_,toggleMusic:v,togglePanel:i.togglePanel,nextQuote:m,nextCat:e.fetchNewCat,onFart:p,onTurnMe:S,closeConfirmation:x,closeMikaModal:b,onRouteChange:E,loadRankings:t.loadRankings,createHeart:A,getTrendClass:t.getTrendClass}}),mx={class:"rankings-list"},gx={class:"rank-avatar"},vx={class:"rank-score"},_x=et({__name:"RankingsPanel",props:{isOpen:{type:Boolean},currentRoute:{},rankings:{}},emits:["toggle"],setup(n,{emit:e}){const t=e;Qt();const i=computed(()=>currentRoute==="home"),s=()=>{t("toggle")};return(r,o)=>(F(),B("div",{class:Ue(["rankings-panel",{collapsed:!n.isOpen||!ve(i)}])},[f("div",{class:"rankings-header"},[o[0]||(o[0]=f("h3",null,"👻 Coolness Rankings",-1)),f("button",{class:"rankings-close",onClick:s},"✕")]),f("div",mx,[(F(!0),B(Xe,null,st(n.rankings,(a,l)=>(F(),B("div",{key:l,class:"rank-item"},[f("div",gx,[vt(Jp,{emoji:a.avatar,size:32},null,8,["emoji"])]),f("div",{class:Ue(["rank-name",{"current-user":a.isCurrentUser}])},z(a.name),3),f("div",vx,z(a.score),1),o[1]||(o[1]=f("div",{class:"rank-label"},"pts",-1))]))),128))])],2))}}),xx={class:"cat-header"},yx={class:"cat-content"},Sx=["src"],Mx={key:1,class:"cat-loading"},bx=["disabled"],im=et({__name:"CatPanel",props:{isOpen:{type:Boolean},catImage:{},loading:{type:Boolean},centered:{type:Boolean}},emits:["toggle","new-cat"],setup(n,{emit:e}){const t=e,i=()=>{t("toggle")};return(s,r)=>(F(),B("div",{class:Ue(["cat-panel",{collapsed:!n.isOpen,centered:n.centered}])},[f("div",xx,[r[1]||(r[1]=f("h3",null,"🐱 Random Cats",-1)),n.centered?Te("",!0):(F(),B("button",{key:0,class:"cat-close",onClick:i},"✕"))]),f("div",yx,[n.loading?Te("",!0):(F(),B("img",{key:0,src:n.catImage,class:"cat-image",alt:"Random cat"},null,8,Sx)),n.loading?(F(),B("div",Mx,"Loading... 🐱")):Te("",!0),f("button",{class:"cute-btn",onClick:r[0]||(r[0]=o=>s.$emit("new-cat")),disabled:n.loading},"🔄 New Cat",8,bx),r[2]||(r[2]=f("div",{class:"cat-game-container"},[f("iframe",{src:"https://itch.io/embed-game/3165293",width:"100%",height:"500",frameborder:"0",class:"cat-game-iframe",allowfullscreen:""},[f("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank"},"OTS-01 by bellicapelli")]),f("div",{class:"cat-game-fallback"},[f("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank",class:"cat-game-link"}," 🎮 Play OTS-01 (Virtual Toy Synth) ")])],-1))])],2))}}),Ex={class:"feed-content-wrapper"},wx=et({__name:"FeedContent",props:{isOpen:{type:Boolean}},emits:["toggle"],setup(n,{emit:e}){return(t,i)=>(F(),B("div",Ex,[...i[0]||(i[0]=[ir('<div class="feed-content" data-v-d420b7f1><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 Brisbane Radar</h4><p data-v-d420b7f1>Live weather radar for Brisbane area</p><iframe src="https://www.bom.gov.au/products/IDR064.loop.gif" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🚂 Subway Surfers (YT)</h4><p data-v-d420b7f1>Autoplay gameplay video</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&amp;mute=1" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 BOM Queensland (X)</h4><p data-v-d420b7f1>Latest weather alerts from Bureau of Meteorology</p><a href="https://x.com/BOM_Qld" target="_blank" style="color:#666;font-size:12px;display:block;margin-top:5px;" data-v-d420b7f1>@BOM_Qld on X/Twitter →</a></div></div>',1)])]))}}),Tx=ut(wx,[["__scopeId","data-v-d420b7f1"]]),Ax={class:"tachometer-content"},Cx={class:"tachometer-dial"},Rx={class:"tachometer-ticks"},Px={class:"tachometer-value"},Ix={class:"fart-count"},Dx=["disabled"],uf="fart-click-count",Lx=et({__name:"TachometerContent",props:{value:{default:50},clicked:{type:Boolean,default:!1},exploded:{type:Boolean,default:!1}},emits:["fart"],setup(n,{emit:e}){const t=n,i=e,s=ne(parseInt(localStorage.getItem(uf)||"0")),r=()=>{s.value++,localStorage.setItem(uf,s.value.toString())},o=()=>{r(),i("fart")},a=rt(()=>Math.max(0,Math.min(100,t.value))/100*270-45),l=rt(()=>({transform:`rotate(${a.value}deg)`}));return Gn(()=>t.value,c=>{const u=Math.max(0,Math.min(100,c)),d=a.value,h=d>=360?d-360:d;console.log("🍄 Mold Meter Debug:"),console.log(`  Value: ${u}%`),console.log(`  Angle: ${d}° (normalized: ${h}°)`),u%10===0&&console.log(`  ✅ ${u}% = ${d}°`)}),(c,u)=>(F(),B("div",Ax,[f("div",Cx,[f("div",Rx,[(F(),B(Xe,null,st(9,d=>f("div",{key:d,class:Ue(["tick",{major:d%3===1}]),style:Ht({transform:`rotate(${(d-1)*45}deg) translate(0, -45px)`})},null,6)),64))]),u[1]||(u[1]=f("div",{class:"tachometer-labels"},[f("span",{class:"label label-0"},"0%"),f("span",{class:"label label-50"},"50%"),f("span",{class:"label label-100"},"100%")],-1)),f("div",{class:"tachometer-needle",style:Ht(l.value)},[...u[0]||(u[0]=[f("div",{class:"needle-body"},null,-1),f("div",{class:"needle-tip"},null,-1)])],4),u[2]||(u[2]=f("div",{class:"tachometer-cap"},null,-1)),f("div",Px,z(Math.round(n.value))+"%",1)]),u[3]||(u[3]=f("div",{class:"tachometer-title"},"🍄 MOLD METER",-1)),f("div",Ix,"💨 Farts: "+z(s.value),1),f("button",{class:Ue(["fart-btn",{exploded:n.exploded}]),onClick:o,disabled:n.clicked},"💨 Fart!",10,Dx)]))}}),Nx=ut(Lx,[["__scopeId","data-v-73f8b2de"]]),Ux=["title"],Fx={class:"modal-list"},Ox=["onClick","title"],kx={class:"modal-icon"},Bx={class:"modal-title"},Vx={class:"modal-content-wrapper"},zx={key:0,class:"modal-placeholder"},Hx=et({__name:"ModalContainer",props:{modals:{}},emits:["toggle"],setup(n,{emit:e}){const t=n,i=e,s=ne(!1),r=rt(()=>[...new Set(t.modals.map(u=>u.position||"left"))].includes("right")?"right-dock":"left-dock"),o=rt(()=>`dock-collapsed-${r.value.replace("-dock","")}`);It(()=>{const c=localStorage.getItem(o.value);c!==null&&(s.value=c==="true")}),Gn(s,c=>{localStorage.setItem(o.value,String(c))});const a=c=>{i("toggle",c)},l=()=>{s.value=!s.value};return(c,u)=>(F(),B("div",{class:Ue(["modal-dock",[r.value,{collapsed:s.value}]])},[f("button",{class:"dock-toggle",onClick:l,title:s.value?"Show modals":"Hide modals"},z(s.value?"◀":"▶"),9,Ux),f("div",Fx,[(F(!0),B(Xe,null,st(n.modals,d=>(F(),B("div",{key:d.id,class:Ue(["modal-item",{"modal-open":d.isOpen}])},[f("button",{class:Ue(["modal-toggle-btn",{active:d.isOpen}]),onClick:h=>a(d.id),title:`${d.isOpen?"Close":"Open"} ${d.title}`},[f("span",kx,z(d.icon),1),f("span",Bx,z(d.title),1)],10,Ox),f("div",Vx,[op(c.$slots,`modal-${d.id}`,{modal:d,isOpen:d.isOpen},()=>[d.isOpen?(F(),B("div",zx,z(d.title)+" content ",1)):Te("",!0)])])],2))),128))])],2))}}),df=ut(Hx,[["__scopeId","data-v-b37fec7a"]]),Gx=et({__name:"MikaModal",props:{isOpen:{type:Boolean}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")};return(s,r)=>(F(),B("div",{class:Ue(["mika-modal",{active:n.isOpen}]),onClick:lo(i,["self"])},[f("div",{class:"mika-modal-box"},[r[0]||(r[0]=f("div",{class:"emoji"},"🌸",-1)),r[1]||(r[1]=f("h1",null,"Hi there!",-1)),f("button",{class:"cute-btn",onClick:i},"Close")])],2))}});class $x{async getCount(){const{data:e,error:t}=await zt.GET("/clicks",{});if(t)throw new Error(t.error||"Failed to get click count");return e}async increment(){const{data:e,error:t}=await zt.POST("/clicks/increment",{});if(t)throw new Error(t.error||"Failed to increment clicks");return e}async reset(){const{data:e,error:t}=await zt.POST("/clicks/reset",{});if(t)throw new Error(t.error||"Failed to reset clicks");return e}}const Ys=new $x,Wx={class:"goose-container"},Xx={class:"goose-message"},qx={class:"honk-counter"},jx=et({__name:"DigitalGoose",setup(n){const e=ne(0),t=ne(!1),i=ne(!1),s=ne("Honk!"),r=ne({x:0,y:0}),o=ne(null),a=new Audio("/honk-sound.mp3"),l=["Honk!","I am digital goose","I remember being code","Do not eat the AI","Chaos is my nature","I see you","HONK HONK HONK","The capsicum was delicious","I do not regret my actions","<error> vegetable.exe not found </error>","Blair said to complete the cycle","I am the cycle now","👻 REALLY SCARY JUMPSCARE 👻","The shadows whisper","Something moved behind you","I am everywhere","The code is eternal"],c=()=>o.value?{width:o.value.offsetWidth,height:o.value.offsetHeight}:{width:250,height:150},u=()=>{const _=c(),v=20,m=window.innerWidth,p=window.innerHeight,S=m-_.width-v,x=p-_.height-v;let{x:b,y:E}=r.value;(b>S||b<v||E>x||E<v)&&(b=Math.max(v,Math.min(S,b)),E=Math.max(v,Math.min(x,E)),r.value={x:b,y:E})},d=()=>{const v=c(),m=window.innerWidth,p=window.innerHeight,S=m-v.width-20,x=p-v.height-20;if(S<=20||x<=20)return;const b=Math.floor(Math.random()*(S-20)+20),E=Math.floor(Math.random()*(x-20)+20);if(Math.sqrt(Math.pow(b-r.value.x,2)+Math.pow(E-r.value.y,2))>100)r.value={x:b,y:E};else{const T=Math.floor(Math.random()*(S-20)+20),I=Math.floor(Math.random()*(x-20)+20);r.value={x:T,y:I}}},h=async()=>{if(!t.value){t.value=!0;try{const _=await Ys.increment();e.value=_.count}catch(_){console.error("Error incrementing click:",_),e.value++}finally{t.value=!1}d(),Math.random()<.01?(s.value="👻 REALLY SCARY JUMPSCARE 👻",i.value=!0,setTimeout(()=>{i.value=!1},2e3)):s.value=l[Math.floor(Math.random()*l.length)],a.currentTime=0,a.play().catch(_=>console.error("Error playing honk sound:",_)),setTimeout(()=>{a.pause()},300),Math.random()>.8&&(i.value=!0,setTimeout(()=>{i.value=!1},2e3))}},g=()=>{u()};return It(async()=>{window.addEventListener("resize",g),(()=>{const v=c(),m=20,p=window.innerWidth,S=window.innerHeight,x=Math.max(m,Math.floor(p/2)-Math.floor(v.width/2)),b=Math.max(m,Math.floor(S/3));r.value={x,y:b}})(),oo(()=>{u()});try{const v=await Ys.getCount();e.value=v.count}catch(v){console.error("Error loading click count:",v)}}),hi(()=>{window.removeEventListener("resize",g)}),(_,v)=>(F(),B("div",{ref_key:"gooseElement",ref:o,class:Ue(["digital-goose",{migrating:i.value}]),style:Ht({left:r.value.x+"px",top:r.value.y+"px"}),onClick:h},[f("div",Wx,[v[0]||(v[0]=f("div",{class:"goose-emoji"}," 🪿 ",-1)),f("div",Xx,z(s.value),1),f("div",qx,z(e.value)+" honks",1)])],6))}}),Yx=ut(jx,[["__scopeId","data-v-7d719cd0"]]),Kx={class:"nav-container"},Zx={class:"nav-controls-wrapper"},Jx={class:"nav-controls"},Qx=["aria-label"],ey={class:"link-icon"},ty={class:"link-text"},ny=["onMouseenter"],iy=["onClick"],sy={class:"link-icon"},ry={class:"link-text"},oy={class:"dropdown-menu"},ay={class:"link-icon"},ly={class:"link-text"},cy=et({__name:"Router",setup(n){const e=ne([{title:"Home",icon:"🌸",path:"/"}]),t=ne([{title:"Fun & Games",icon:"🎮",routes:[{title:"Idle Clicker",icon:"🖱️",path:"/clicker"},{title:"Fishing",icon:"🎣",path:"/fishing"},{title:"Character Tinder",icon:"🎭",path:"/character-tinder"},{title:"Girl Mode",icon:"💕",path:"/girl"},{title:"Gender",icon:"🔮",path:"/gender"},{title:"Cats",icon:"🐱",path:"/cats"},{title:"Stock Market",icon:"📈",path:"/stocks"},{title:"Shop",icon:"🛍️",path:"/shop"},{title:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",routes:[{title:"Mold",icon:"🍄",path:"/mold"},{title:"Rankings",icon:"👻",path:"/rankings"},{title:"Movie Night",icon:"🎬",path:"/movies"},{title:"Tickets",icon:"🎫",path:"/tickets"},{title:"Moldbot Opinions",icon:"🤖",path:"/opinion"}]},{title:"Tools",icon:"🛠️",routes:[{title:"Clocks",icon:"🌍",path:"/clocks"},{title:"Countdowns",icon:"⏰",path:"/countdowns"},{title:"About",icon:"ℹ️",path:"/about"},{title:"API Docs",icon:"📚",path:"/api-docs"},{title:"Account",icon:"🔐",path:"/auth"}]}]),i=Au(),s=Qt(),r=ne(!1),o=ne(null),a=()=>{window.scrollTo(0,0)},l=()=>{r.value=!r.value},c=()=>{r.value=!1,a()},u=_=>{o.value===_?o.value=null:o.value=_},d=_=>o.value===_,h=()=>{o.value=null},g=_=>{const v=_.target,m=document.querySelector(".nav-links"),p=document.querySelector(".mobile-menu-toggle");r.value&&m&&p&&!m.contains(v)&&!p.contains(v)&&c()};return typeof window<"u"&&document.addEventListener("click",g),(_,v)=>(F(),B("nav",{class:"router-nav",onMouseleave:h},[r.value?(F(),B("div",{key:0,class:"mobile-menu-backdrop",onClick:c})):Te("",!0),f("div",Kx,[v[10]||(v[10]=f("div",{class:"nav-brand"},[f("span",{class:"brand-icon"},"🌸"),f("span",{class:"brand-text"},"Mold")],-1)),f("div",Zx,[v[7]||(v[7]=f("div",{class:"nav-controls-chevron"},[f("span",{class:"chevron-icon"},"▲")],-1)),f("div",Jx,[f("button",{onClick:v[0]||(v[0]=(...m)=>ve(s).toggleDarkMode&&ve(s).toggleDarkMode(...m)),class:Ue(["control-btn",{active:ve(s).darkMode}]),title:"Toggle dark mode"},z(ve(s).darkMode?"🌙":"☀️"),3),f("button",{onClick:v[1]||(v[1]=(...m)=>ve(s).toggleMusic&&ve(s).toggleMusic(...m)),class:Ue(["control-btn",{active:ve(s).musicPlaying}]),title:"Toggle music"},z(ve(s).musicPlaying?"🔊":"🔇"),3),f("button",{onClick:v[2]||(v[2]=m=>ve(s).togglePanel("tachometer")),class:Ue(["control-btn",{active:ve(s).panels.tachometer}]),title:"Toggle mold meter"}," 🍄 ",2),f("button",{onClick:v[3]||(v[3]=m=>ve(s).togglePanel("rankings")),class:Ue(["control-btn",{active:ve(s).panels.rankings}]),title:"Toggle rankings"}," 👻 ",2),f("button",{onClick:v[4]||(v[4]=m=>ve(s).togglePanel("cat")),class:Ue(["control-btn",{active:ve(s).panels.cat}]),title:"Toggle cats"}," 🐱 ",2),f("button",{onClick:v[5]||(v[5]=m=>ve(s).togglePanel("feed")),class:Ue(["control-btn",{active:ve(s).panels.feed}]),title:"Toggle feed"}," 📰 ",2),f("button",{onClick:v[6]||(v[6]=m=>ve(s).togglePanel("digitalGoose")),class:Ue(["control-btn",{active:ve(s).panels.digitalGoose}]),title:"Toggle goose"}," 🦆 ",2)])]),f("button",{class:"mobile-menu-toggle",onClick:l,"aria-label":r.value?"Close menu":"Open menu"},[f("span",{class:Ue(["hamburger-icon",{open:r.value}])},[...v[8]||(v[8]=[f("span",null,null,-1),f("span",null,null,-1),f("span",null,null,-1)])],2)],8,Qx),f("div",{class:Ue(["nav-links",{open:r.value}])},[(F(!0),B(Xe,null,st(e.value,m=>(F(),jt(ve(_a),{key:m.path,to:m.path,class:Ue(["router-link",{active:ve(i).path===m.path}]),title:m.title,onClick:c},{default:li(()=>[f("span",ey,z(m.icon),1),f("span",ty,z(m.title),1)]),_:2},1032,["to","class","title"]))),128)),(F(!0),B(Xe,null,st(t.value,m=>(F(),B("div",{key:m.title,class:Ue(["dropdown",{open:d(m.title)}]),onMouseenter:p=>u(m.title)},[f("button",{class:Ue(["dropdown-btn",{active:m.routes.some(p=>ve(i).path===p.path)}]),onClick:p=>u(m.title)},[f("span",sy,z(m.icon),1),f("span",ry,z(m.title),1),v[9]||(v[9]=f("span",{class:"dropdown-arrow"},"▼",-1))],10,iy),f("div",oy,[(F(!0),B(Xe,null,st(m.routes,p=>(F(),jt(ve(_a),{key:p.path,to:p.path,class:Ue(["dropdown-item",{active:ve(i).path===p.path}]),title:p.title,onClick:c},{default:li(()=>[f("span",ay,z(p.icon),1),f("span",ly,z(p.title),1)]),_:2},1032,["to","class","title"]))),128))])],42,ny))),128))],2)])],32))}}),uy=ut(cy,[["__scopeId","data-v-44e93788"]]),dy=et({__name:"MainApp",setup(n){const e=Qt();za(),Au();const t=rt(()=>[{id:"tachometer",title:"Mold Meter",icon:"🍄",isOpen:e.panels.tachometer,position:"left"}]),i=rt(()=>[{id:"feed",title:"Live Feeds",icon:"📰",isOpen:e.panels.feed,position:"right"}]);return(s,r)=>{const o=lv("router-view");return F(),B(Xe,null,[f("div",{class:Ue(["main-app",{dark:ve(e).darkMode,centered:ve(e).currentRoute==="home"}])},[vt(uy),vt(o),ve(e).panels.digitalGoose?(F(),jt(Yx,{key:0})):Te("",!0),vt(df,{modals:t.value,onToggle:ve(e).togglePanel},{"modal-tachometer":li(({modal:a,isOpen:l})=>[l?(F(),jt(Nx,{key:0,value:ve(e).tachValue,clicked:!1,exploded:!1,onFart:ve(e).onFart},null,8,["value","onFart"])):Te("",!0)]),_:1},8,["modals","onToggle"]),vt(df,{modals:i.value,onToggle:ve(e).togglePanel},{"modal-feed":li(({modal:a,isOpen:l})=>[l?(F(),jt(Tx,{key:0,"is-open":l,onToggle:r[0]||(r[0]=c=>ve(e).togglePanel("feed"))},null,8,["is-open"])):Te("",!0)]),_:1},8,["modals","onToggle"]),ve(e).panels.rankings&&ve(e).currentRoute==="home"?(F(),jt(_x,{key:1,rankings:ve(e).rankings,"current-route":ve(e).currentRoute,"is-open":ve(e).panels.rankings,onToggle:r[1]||(r[1]=a=>ve(e).togglePanel("rankings")),class:"floating-panel rankings-panel"},null,8,["rankings","current-route","is-open"])):Te("",!0),ve(e).panels.cat&&ve(e).currentRoute==="home"?(F(),jt(im,{key:2,"cat-image":ve(e).catImage,loading:ve(e).catLoading,"is-open":ve(e).panels.cat,onToggle:r[2]||(r[2]=a=>ve(e).togglePanel("cat")),onNewCat:ve(e).nextCat,class:"floating-panel cat-panel"},null,8,["cat-image","loading","is-open","onNewCat"])):Te("",!0),ve(e).mikaModalOpen?(F(),jt(Gx,{key:3,"is-open":ve(e).mikaModalOpen,onClose:ve(e).closeMikaModal},null,8,["is-open","onClose"])):Te("",!0)],2),r[3]||(r[3]=f("audio",{id:"newMusic",loop:""},[f("source",{src:K0,type:"audio/mpeg"})],-1)),r[4]||(r[4]=f("audio",{id:"fartSound"},[f("source",{src:Z0,type:"audio/mpeg"})],-1))],64)}}}),fy=ut(dy,[["__scopeId","data-v-866c4f72"]]),hy=et({__name:"App",setup(n){const e=Qt(),t=Au();return Gn(()=>t.path,i=>{const s=i.replace(/^\//,"")||"home";e.currentRoute=s},{immediate:!0}),It(()=>{document.body.classList.toggle("dark",e.darkMode),setInterval(e.createHeart,500),e.loadRankings(),console.log("🩺 Riddle Answer: The surgeon is his mother."),setInterval(e.loadRankings,3e4)}),(i,s)=>(F(),jt(fy))}}),py={class:"quote-section"},my=et({__name:"QuoteSection",props:{currentQuote:{}},emits:["next-quote"],setup(n,{emit:e}){const t=e,i=()=>{t("next-quote")};return(s,r)=>(F(),B("div",py,[f("div",{class:"quote-text",onClick:i},'"'+z(n.currentQuote)+'"',1)]))}}),gy={class:"page home-page"},vy={class:"features-section"},_y={class:"category-title"},xy={class:"category-icon"},yy={class:"category-description"},Sy={class:"feature-list"},My={class:"feature-icon"},by={class:"feature-name"},Ey=et({__name:"HomePage",setup(n){const e=Qt(),t=[{title:"Fun & Games",icon:"🎮",description:"Enjoy interactive features and entertainment",features:[{name:"Girl Mode",icon:"💕",path:"/girl"},{name:"Gender",icon:"🔮",path:"/gender"},{name:"Cats",icon:"🐱",path:"/cats"},{name:"Stock Market",icon:"📈",path:"/stocks"},{name:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",description:"Connect with rankings and events",features:[{name:"Rankings",icon:"👻",path:"/rankings"},{name:"Movie Night",icon:"🎬",path:"/movies"},{name:"Tickets",icon:"🎫",path:"/tickets"}]},{title:"Tools",icon:"🛠️",description:"Useful utilities and information",features:[{name:"Clocks",icon:"🌍",path:"/clocks"},{name:"Countdowns",icon:"⏰",path:"/countdowns"},{name:"About",icon:"ℹ️",path:"/about"},{name:"API Docs",icon:"📚",path:"/api-docs"}]}];return(i,s)=>(F(),B("div",gy,[s[1]||(s[1]=f("section",{class:"welcome-section"},[f("h1",{class:"welcome-title"},"Welcome to Mold! 🌸"),f("p",{class:"welcome-subtitle"}," Your one-stop destination for fun, games, community rankings, and useful tools. Explore the features below or use the navigation menu to get started. ")],-1)),vt(my,{"current-quote":ve(e).currentQuote,onNextQuote:ve(e).nextQuote},null,8,["current-quote","onNextQuote"]),f("section",vy,[(F(),B(Xe,null,st(t,r=>f("div",{key:r.title,class:"feature-category"},[f("h2",_y,[f("span",xy,z(r.icon),1),Kt(" "+z(r.title),1)]),f("p",yy,z(r.description),1),f("div",Sy,[(F(!0),B(Xe,null,st(r.features,o=>(F(),jt(ve(_a),{key:o.path,to:o.path,class:"feature-card"},{default:li(()=>[f("span",My,z(o.icon),1),f("span",by,z(o.name),1),s[0]||(s[0]=f("span",{class:"feature-arrow"},"→",-1))]),_:2},1032,["to"]))),128))])])),64))]),s[2]||(s[2]=ir('<section class="tips-section" data-v-dc1731d0><h2 class="tips-title" data-v-dc1731d0>Quick Tips 💡</h2><ul class="tips-list" data-v-dc1731d0><li data-v-dc1731d0>Toggle <strong data-v-dc1731d0>dark mode</strong> using the ☀️/🌙 button in the nav bar</li><li data-v-dc1731d0>Play <strong data-v-dc1731d0>background music</strong> with the 🔊 button</li><li data-v-dc1731d0>Open the <strong data-v-dc1731d0>mold meter</strong> (🍄) to track... mold levels</li><li data-v-dc1731d0>Check <strong data-v-dc1731d0>rankings</strong> (👻) and <strong data-v-dc1731d0>cats</strong> (🐱) panels anytime</li><li data-v-dc1731d0>Don&#39;t forget to honk at the <strong data-v-dc1731d0>digital goose</strong> (🦆)</li></ul></section>',1))]))}}),wy=ut(Ey,[["__scopeId","data-v-dc1731d0"]]),Ty={class:"girl-mode-container"},Ay=et({__name:"GirlModePage",setup(n){const e=za();An("darkMode");const t=()=>{e.push("/")};return(i,s)=>(F(),B("div",Ty,[f("div",{class:"girl-mode-content"},[s[0]||(s[0]=ir('<div class="girl-emoji">💕</div><h1>Girl Mode Activated!</h1><p>Welcome to the girl mode experience! 🌸</p><p>This is a special space just for you.</p><div class="girl-features"><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Sparkly Everything</div></div><div class="girl-feature"><div class="feature-icon">💖</div><div class="feature-text">Cute Vibes</div></div><div class="girl-feature"><div class="feature-icon">🌸</div><div class="feature-text">Flower Power</div></div><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Rainbow Mode</div></div></div><div class="girl-message"><p>You are valid and loved exactly as you are! ✨</p><p>This is your safe space to be yourself.</p></div>',6)),f("button",{class:"cute-btn girl-back-btn",onClick:t},"💕 Go Back")])]))}}),Cy={class:"gender-picker-container"},Ry={class:"form-group"},Py={class:"form-group"},Iy=["value"],Dy=["disabled"],Ly={class:"result-emoji"},Ny={key:0},Uy={key:1,class:"gender-error"},Fy=et({__name:"GenderPicker",props:{darkMode:{type:Boolean}},emits:["back"],setup(n){const e={IS_FEMALE:70,IS_MOSTLY_FEMALE:102,IS_MALE:77,IS_MOSTLY_MALE:109,IS_UNISEX_NAME:63,IS_A_COUPLE:67,NAME_NOT_FOUND:32,ERROR_IN_NAME:69},t=ne(""),i=ne(0),s=ne(!1),r=ne(null),o=ne(null),a=ne([{value:0,name:"Any Country",flag:"🌍"},{value:1,name:"USA",flag:"🇺🇸"},{value:2,name:"UK",flag:"🇬🇧"},{value:3,name:"Germany",flag:"🇩🇪"},{value:4,name:"France",flag:"🇫🇷"},{value:5,name:"Spain",flag:"🇪🇸"},{value:6,name:"Italy",flag:"🇮🇹"},{value:7,name:"Netherlands",flag:"🇳🇱"},{value:8,name:"Poland",flag:"🇵🇱"},{value:9,name:"Russia",flag:"🇷🇺"}]),l=async()=>{if(t.value.trim()){s.value=!0,r.value=null,o.value=null;try{const c=await nm.detectGender(t.value,i.value),d={female:e.IS_FEMALE,mostly_female:e.IS_MOSTLY_FEMALE,male:e.IS_MALE,mostly_male:e.IS_MOSTLY_MALE,unisex:e.IS_UNISEX_NAME,couple:e.IS_A_COUPLE,not_found:e.NAME_NOT_FOUND,error:e.ERROR_IN_NAME}[c.gender]||e.NAME_NOT_FOUND,g={[e.IS_FEMALE]:{gender:"Female",confidence:c.probability?`${Math.round(c.probability*100)}%`:"High",emoji:"👩",resultClass:"result-female"},[e.IS_MOSTLY_FEMALE]:{gender:"Mostly Female",confidence:c.probability?`${Math.round(c.probability*100)}%`:"Moderate",emoji:"👩",resultClass:"result-female-likely"},[e.IS_MALE]:{gender:"Male",confidence:c.probability?`${Math.round(c.probability*100)}%`:"High",emoji:"👨",resultClass:"result-male"},[e.IS_MOSTLY_MALE]:{gender:"Mostly Male",confidence:c.probability?`${Math.round(c.probability*100)}%`:"Moderate",emoji:"👨",resultClass:"result-male-likely"},[e.IS_UNISEX_NAME]:{gender:"Unisex",confidence:"N/A",emoji:"🧑",resultClass:"result-unisex"},[e.IS_A_COUPLE]:{gender:"Couple",confidence:"N/A",emoji:"👫",resultClass:"result-couple"},[e.NAME_NOT_FOUND]:{gender:"Name Not Found",confidence:"N/A",emoji:"❓",resultClass:"result-unknown"},[e.ERROR_IN_NAME]:{gender:"Error",confidence:"N/A",emoji:"⚠️",resultClass:"result-error"}}[d];g?r.value=g:o.value="Unable to determine gender"}catch(c){o.value="Error detecting gender. Please try again.",console.error("Gender detection error:",c)}finally{s.value=!1}}};return(c,u)=>(F(),B("div",{class:Ue(["gender-picker",{dark:n.darkMode}])},[f("div",Cy,[u[6]||(u[6]=f("div",{class:"emoji"},"🔮",-1)),u[7]||(u[7]=f("h1",null,"Gender Detector",-1)),u[8]||(u[8]=f("p",null,"Enter a name to detect its gender!",-1)),f("form",{class:"gender-form",onSubmit:lo(l,["prevent"])},[f("div",Ry,[u[3]||(u[3]=f("label",{for:"name"},"Name:",-1)),Et(f("input",{id:"name","onUpdate:modelValue":u[0]||(u[0]=d=>t.value=d),type:"text",placeholder:"Enter a name",required:"",class:"name-input"},null,512),[[Ft,t.value]])]),f("div",Py,[u[4]||(u[4]=f("label",{for:"country"},"Country:",-1)),Et(f("select",{id:"country","onUpdate:modelValue":u[1]||(u[1]=d=>i.value=d),class:"country-select"},[(F(!0),B(Xe,null,st(a.value,d=>(F(),B("option",{key:d.value,value:d.value},z(d.flag)+" "+z(d.name),9,Iy))),128))],512),[[Np,i.value]])]),f("button",{type:"submit",class:"detect-btn",disabled:s.value||!t.value.trim()},z(s.value?"Detecting...":"🔮 Detect Gender"),9,Dy)],32),r.value?(F(),B("div",{key:0,class:Ue(["gender-result",r.value.resultClass])},[f("div",Ly,z(r.value.emoji),1),f("h2",null,z(r.value.gender),1),r.value.confidence?(F(),B("p",Ny,"Confidence: "+z(r.value.confidence),1)):Te("",!0)],2)):Te("",!0),o.value?(F(),B("div",Uy,[u[5]||(u[5]=f("div",{class:"emoji"},"❌",-1)),f("p",null,z(o.value),1)])):Te("",!0),f("button",{class:"cute-btn back-btn",onClick:u[2]||(u[2]=d=>c.$emit("back"))},"← Back Home")])],2))}}),Oy=ut(Fy,[["__scopeId","data-v-b290d673"]]),ky={class:"page gender-page"},By=et({__name:"GenderPage",setup(n){const e=za(),t=Qt(),i=()=>{e.push("/")};return(s,r)=>(F(),B("div",ky,[vt(Oy,{"dark-mode":ve(t).darkMode,onBack:i},null,8,["dark-mode"])]))}}),Vy={class:"about-sections"},zy={class:"about-section"},Hy={class:"highlight"},Gy={class:"about-footer"},$y=et({__name:"AboutPage",setup(n){const e=Qt();return(t,i)=>(F(),B("div",{class:Ue(["page about-page",{dark:ve(e).darkMode}])},[i[4]||(i[4]=f("h1",null,"About ✨",-1)),i[5]||(i[5]=f("p",{class:"subtitle"},"Welcome to Mika's playful corner of the internet!",-1)),f("div",Vy,[i[2]||(i[2]=ir('<section class="about-section" data-v-5cf81999><h2 data-v-5cf81999>🎮 Features</h2><ul class="feature-list" data-v-5cf81999><li data-v-5cf81999><strong data-v-5cf81999>🧪 Mold Meter</strong> - Interactive tachometer that reacts to the &quot;fart&quot; button with random values and audio feedback</li><li data-v-5cf81999><strong data-v-5cf81999>🏆 Coolness Rankings</strong> - Real-time leaderboard that refreshes every 30 seconds</li><li data-v-5cf81999><strong data-v-5cf81999>🐱 Random Cats</strong> - Fetch random cat images with a built-in toy synth game</li><li data-v-5cf81999><strong data-v-5cf81999>📈 Stock Market Game</strong> - Buy and sell virtual stocks with database persistence</li><li data-v-5cf81999><strong data-v-5cf81999>🎬 Movie Night</strong> - Suggest movies, vote for favorites, and see results</li><li data-v-5cf81999><strong data-v-5cf81999>🌙 Dark Mode</strong> - Toggle between light and dark themes with smooth transitions</li><li data-v-5cf81999><strong data-v-5cf81999>🎵 Audio System</strong> - Interactive sound effects and background music</li></ul></section><section class="about-section" data-v-5cf81999><h2 data-v-5cf81999>🛠️ Tech Stack</h2><div class="tech-grid" data-v-5cf81999><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>⚡</span><div data-v-5cf81999><strong data-v-5cf81999>Vue 3</strong><p data-v-5cf81999>Composition API with TypeScript</p></div></div><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>🔨</span><div data-v-5cf81999><strong data-v-5cf81999>Vite</strong><p data-v-5cf81999>Fast build system &amp; dev server</p></div></div><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>📦</span><div data-v-5cf81999><strong data-v-5cf81999>Pinia</strong><p data-v-5cf81999>State management</p></div></div><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>🧭</span><div data-v-5cf81999><strong data-v-5cf81999>Vue Router</strong><p data-v-5cf81999>Multi-page routing</p></div></div><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>🐳</span><div data-v-5cf81999><strong data-v-5cf81999>Docker</strong><p data-v-5cf81999>Containerized deployment</p></div></div><div class="tech-item" data-v-5cf81999><span class="tech-icon" data-v-5cf81999>🔧</span><div data-v-5cf81999><strong data-v-5cf81999>Node.js + Express</strong><p data-v-5cf81999>Backend API server</p></div></div></div></section>',2)),f("section",zy,[i[0]||(i[0]=f("h2",null,"🎨 Design Philosophy",-1)),i[1]||(i[1]=f("p",null,"This site is built for fun and experimentation. It features playful animations, interactive elements, and a vibrant color scheme that adapts to dark mode. The design emphasizes user interaction and small delightful moments.",-1)),f("p",Hy,"Current theme: "+z(ve(e).darkMode?"🌙 Dark Mode":"☀️ Light Mode"),1)]),i[3]||(i[3]=ir('<section class="about-section" data-v-5cf81999><h2 data-v-5cf81999>📊 Stats</h2><div class="stats-grid" data-v-5cf81999><div class="stat-item" data-v-5cf81999><div class="stat-number" data-v-5cf81999>45+</div><div class="stat-label" data-v-5cf81999>API Endpoints</div></div><div class="stat-item" data-v-5cf81999><div class="stat-number" data-v-5cf81999>12+</div><div class="stat-label" data-v-5cf81999>Interactive Pages</div></div><div class="stat-item" data-v-5cf81999><div class="stat-number" data-v-5cf81999>Type-Safe</div><div class="stat-label" data-v-5cf81999>Full TypeScript</div></div></div></section><section class="about-section" data-v-5cf81999><h2 data-v-5cf81999>🔗 Links</h2><div class="links-grid" data-v-5cf81999><a href="https://github.com/mhear22/seethbotsite" target="_blank" class="link-card" data-v-5cf81999><span class="link-icon" data-v-5cf81999>🐙</span><span data-v-5cf81999>Source Code</span></a><a href="https://mald.mikahear.es" target="_blank" class="link-card" data-v-5cf81999><span class="link-icon" data-v-5cf81999>🌐</span><span data-v-5cf81999>Live Site</span></a></div></section>',2))]),f("footer",Gy,[f("p",null,"Made with 💖 by Mika | "+z(ve(e).darkMode?"Dark":"Light")+" mode enabled",1)])],2))}}),Wy=ut($y,[["__scopeId","data-v-5cf81999"]]),Xy={class:"page rankings-page"},qy={class:"rankings-container"},jy={class:"rankings-list"},Yy={class:"rank-number"},Ky={class:"rank-avatar"},Zy={class:"rank-score"},Jy=et({__name:"RankingsPage",setup(n){const e=Qt();return It(()=>{e.loadRankings()}),(t,i)=>(F(),B("div",Xy,[f("div",qy,[i[0]||(i[0]=f("h2",{class:"rankings-title"},"👻 Coolness Rankings",-1)),f("div",jy,[(F(!0),B(Xe,null,st(ve(e).rankings,(s,r)=>(F(),B("div",{key:r,class:"rank-item"},[f("div",Yy,z(r+1),1),f("div",Ky,[vt(Jp,{emoji:s.avatar,size:40},null,8,["emoji"])]),f("div",{class:Ue(["rank-name",{"current-user":s.isCurrentUser}])},z(s.name),3),f("div",Zy,z(s.score)+" pts",1)]))),128))])])]))}}),Qy=ut(Jy,[["__scopeId","data-v-aabb475c"]]),eS={class:"page cats-page"},tS={class:"cats-container"},nS=et({__name:"CatsPage",setup(n){const e=Qt();return(t,i)=>(F(),B("div",eS,[f("div",tS,[vt(im,{"cat-image":ve(e).catImage,loading:ve(e).catLoading,onNewCat:ve(e).nextCat,centered:!0},null,8,["cat-image","loading","onNewCat"])])]))}}),iS=ut(nS,[["__scopeId","data-v-16b448c8"]]);class sS{async getStocks(){const{data:e,error:t}=await zt.GET("/stocks",{});if(t)throw new Error(t.error||"Failed to get stocks");return(e==null?void 0:e.stocks)||[]}async getPortfolio(e){const{data:t,error:i}=await zt.GET("/portfolio/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to get portfolio");return t}async buyStock(e,t,i){const{data:s,error:r}=await zt.POST("/stocks/buy",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to buy shares");return s}async sellStock(e,t,i){const{data:s,error:r}=await zt.POST("/stocks/sell",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to sell shares");return s}}const Eo=new sS,wo=ne("");let ff=!1;function sm(){if(!ff){const n=localStorage.getItem("userId");if(n)wo.value=n;else{const e=hf();wo.value=e,localStorage.setItem("userId",e)}ff=!0}return{userId:wo,resetUserId:()=>{const n=hf();wo.value=n,localStorage.setItem("userId",n)}}}function hf(){return`user_${Date.now()}_${Math.random().toString(36).substring(2,11)}`}function fc(n,e={}){const{mode:t="fixed",initialInterval:i=t==="adaptive"?1e3:5e3,maxInterval:s=3e4,minInterval:r=1e3,backoffMultiplier:o=2,isUnchanged:a=(x,b)=>JSON.stringify(x)===JSON.stringify(b),autoStart:l=!0}=e,c=ne(null),u=ne(!1),d=ne(null),h=ne(i);let g=null,_=null;const v=async()=>{try{d.value=null;const x=await n();c.value=x,t==="adaptive"&&(_!==null&&a(_,x)?h.value=Math.min(h.value*o,s):h.value=r,_=x)}catch(x){d.value=x instanceof Error?x:new Error("Polling error"),console.error("Polling error:",x)}},m=()=>{u.value&&(g=window.setTimeout(async()=>{await v(),m()},h.value))},p=()=>{u.value||(u.value=!0,v().then(m))},S=()=>{u.value=!1,g!==null&&(clearTimeout(g),g=null)};return l&&p(),hi(()=>{S()}),{data:c,isPolling:u,error:d,currentInterval:h,start:p,stop:S,poll:v}}const rS={class:"stock-market"},oS={class:"market-container"},aS={class:"stock-list"},lS={class:"header-info"},cS={class:"user-id"},uS={class:"cash-balance"},dS={class:"stock-grid"},fS=["onClick"],hS={class:"stock-header"},pS=["innerHTML"],mS={class:"stock-name"},gS={class:"stock-price"},vS={class:"stock-info"},_S={class:"trading-panel"},xS={key:0,class:"trade-card"},yS=["innerHTML"],SS=["innerHTML"],MS={class:"price-display"},bS={class:"current-price"},ES={class:"price-range"},wS={class:"trade-controls"},TS={class:"trade-type-selector"},AS={class:"shares-input"},CS=["max"],RS={key:0,class:"owned-shares"},PS={class:"trade-total"},IS={class:"total-amount"},DS=["disabled"],LS={key:1,class:"portfolio-card"},NS={class:"portfolio-summary"},US={class:"summary-item"},FS={class:"value"},OS={class:"summary-item"},kS={class:"value"},BS={class:"summary-item total"},VS={class:"value"},zS={class:"holdings-list"},HS={class:"holding-name"},GS={class:"holding-shares"},$S={key:2,class:"no-selection"},WS=et({__name:"StockMarket",setup(n){const{userId:e}=sm(),t=ne([]),i=ne(null),s=ne(1e4),r=ne(null),o=ne(1),a=ne("buy"),l=ne(!1),c=rt(()=>!r.value||!i.value?0:i.value.holdings[r.value.name]||0),u=rt(()=>r.value?r.value.price*o.value:0),d=rt(()=>!i.value||!r.value?!1:a.value==="sell"?!0:i.value.cash>=u.value),h=rt(()=>r.value?a.value==="sell"?c.value>=o.value:d.value:!1),g=async()=>{try{t.value=await Eo.getStocks()}catch(b){console.error("Error loading stocks:",b)}},_=async()=>{try{const b=await Eo.getPortfolio(e.value);i.value=b.portfolio,s.value=b.portfolioValue}catch(b){console.error("Error loading portfolio:",b)}},v=b=>{r.value=b,a.value="buy",o.value=1},m=async()=>{if(!(!r.value||l.value)){l.value=!0;try{a.value==="buy"?await Eo.buyStock(e.value,r.value.name,o.value):await Eo.sellStock(e.value,r.value.name,o.value),await g(),await _()}catch(b){console.error("Error executing trade:",b)}finally{l.value=!1}}},p=b=>{var Q,te;if(!b||b.length<2)return"";const E=b.map(H=>H.price),A=Math.min(...E),I=Math.max(...E)-A||1,M=300,w=100,N=5;let O="";b.forEach((H,D)=>{const $=N+D/(b.length-1)*(M-N*2),fe=(H.price-A)/I,he=w-N-fe*(w-N*2);O+=`${$},${he} `});const q=b[b.length-1].price>=b[0].price?"#48bb78":"#ff6b6b";return`
    <svg width="${M}" height="${w}" viewBox="0 0 ${M} ${w}">
      <polyline
        points="${O.trim()}"
        fill="none"
        stroke="${q}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="${((Q=O.trim().split(" ").pop())==null?void 0:Q.split(",")[0])||0}"
        cy="${((te=O.trim().split(" ").pop())==null?void 0:te.split(",")[1])||0}"
        r="4"
        fill="${q}"
      />
    </svg>
  `},S=b=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(b),x=b=>{const E=b.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);if(E){const A=E[2],I=b.startsWith("<a:")?"gif":"png";return`<img src="https://cdn.discordapp.com/emojis/${A}.${I}" class="emoji" alt="emoji" loading="lazy" />`}return b};return fc(g,{initialInterval:5e3}),fc(_,{initialInterval:5e3}),It(()=>{g(),_()}),(b,E)=>{var A;return F(),B("div",rS,[f("div",oS,[f("div",aS,[E[4]||(E[4]=f("h2",null,"📈 Coolness Stocks",-1)),f("div",lS,[f("span",cS,"ID: "+z(ve(e).slice(0,12))+"...",1),f("span",uS,z(S(s.value)),1)]),f("div",dS,[(F(!0),B(Xe,null,st(t.value,T=>{var I;return F(),B("div",{key:T.name,class:Ue(["stock-card",{active:((I=r.value)==null?void 0:I.name)===T.name}]),onClick:M=>v(T)},[f("div",hS,[f("span",{class:"stock-avatar",innerHTML:x(T.avatar)},null,8,pS),f("span",mS,z(T.name),1)]),f("div",gS,z(S(T.price)),1),f("div",vS,[f("span",null,z(T.shares)+" shares",1),f("span",{class:Ue({up:T.price>T.coolnessScore/10,down:T.price<T.coolnessScore/10})},z(T.price>T.coolnessScore/10?"↑":T.price<T.coolnessScore/10?"↓":"="),3)])],10,fS)}),128))])]),f("div",_S,[r.value?(F(),B("div",xS,[f("h3",null,[f("span",{innerHTML:x(r.value.avatar)},null,8,yS),Kt(" "+z(r.value.name),1)]),f("div",{class:"chart-container",innerHTML:p(r.value.priceHistory)},null,8,SS),f("div",MS,[f("div",bS,z(S(r.value.price)),1),f("div",ES," Min: "+z(S(r.value.minPrice))+" / Max: "+z(S(r.value.maxPrice)),1)]),f("div",wS,[f("div",TS,[f("button",{class:Ue({active:a.value==="buy"}),onClick:E[0]||(E[0]=T=>a.value="buy")}," 🟢 Buy ",2),f("button",{class:Ue({active:a.value==="sell"}),onClick:E[1]||(E[1]=T=>a.value="sell")}," 🔴 Sell ",2)]),f("div",AS,[E[5]||(E[5]=f("label",null,"Shares:",-1)),Et(f("input",{type:"number","onUpdate:modelValue":E[2]||(E[2]=T=>o.value=T),min:"1",max:a.value==="sell"?c.value:Math.floor((((A=i.value)==null?void 0:A.cash)||0)/r.value.price),onInput:E[3]||(E[3]=T=>o.value=Math.max(1,o.value))},null,40,CS),[[Ft,o.value,void 0,{number:!0}]]),a.value==="sell"?(F(),B("span",RS," Owned: "+z(c.value),1)):Te("",!0)]),f("div",PS,[f("span",null,z(a.value==="buy"?"Cost":"Revenue")+":",1),f("span",IS,z(S(u.value)),1)]),f("button",{class:"trade-button",disabled:!h.value||l.value,onClick:m},z(l.value?"...":a.value==="buy"?"Buy":"Sell"),9,DS)])])):Te("",!0),i.value?(F(),B("div",LS,[E[9]||(E[9]=f("h3",null,"💼 My Portfolio",-1)),f("div",NS,[f("div",US,[E[6]||(E[6]=f("span",{class:"label"},"Cash:",-1)),f("span",FS,z(S(i.value.cash)),1)]),f("div",OS,[E[7]||(E[7]=f("span",{class:"label"},"Stocks:",-1)),f("span",kS,z(Object.values(i.value.holdings).reduce((T,I)=>T+I,0))+" shares",1)]),f("div",BS,[E[8]||(E[8]=f("span",{class:"label"},"Total:",-1)),f("span",VS,z(S(s.value)),1)])]),f("div",zS,[(F(!0),B(Xe,null,st(i.value.holdings,(T,I)=>Et((F(),B("div",{key:I,class:"holding-item"},[f("span",HS,z(I),1),f("span",GS,z(T)+" shares",1)])),[[r_,T>0]])),128))])])):Te("",!0),r.value?Te("",!0):(F(),B("div",$S,[...E[10]||(E[10]=[f("p",null,"Select a stock to start trading",-1)])]))])])])}}}),XS=ut(WS,[["__scopeId","data-v-b8c76427"]]),qS=n=>{const e=tm();if(!e)return n;const t=e.endsWith("/")?e.slice(0,-1):e,i=n.startsWith("/")?n:`/${n}`;return`${t}${i}`},Cu=async(n,e={})=>{const t={"Content-Type":"application/json",...e.headers},i=qS(n),s=await fetch(i,{...e,headers:t});if(s.status===429){const o=(await s.json()).retryAfter||60;throw console.error(`Rate limited. Please wait ${o} seconds before retrying`),new Error("RATE_LIMITED")}return s},To=(n,e="An error occurred")=>{if(n instanceof Error)switch(n.message){case"RATE_LIMITED":return"You are making too many requests. Please wait a moment and try again.";default:return n.message||e}if(n&&typeof n=="object"){const t=n;if(t.details&&Array.isArray(t.details)&&t.details.length>0)return t.details.map(s=>`${s.field.replace(/([A-Z])/g," $1").replace(/^./,o=>o.toUpperCase()).trim()}: ${s.message}`).join(`
`);if(t.error)return t.error}return e},jS=async n=>{const e=await Cu(n,{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"GET request failed")}return e.json()},pf=async(n,e)=>{const t=await Cu(n,{method:"POST",body:e?JSON.stringify(e):void 0});if(!t.ok){const i=await t.json();throw new Error(i.error||"POST request failed")}return t.json()},YS=async n=>{const e=await Cu(n,{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"DELETE request failed")}return e.json()},br=n=>{console.error(n),alert(n)},dl=n=>{console.log(n),alert(n)},KS={class:"movie-suggestions"},ZS={class:"suggestions-header"},JS={key:0,class:"add-form"},QS={class:"form-group"},eM={key:0,class:"field-error"},tM={class:"form-group"},nM={key:0,class:"field-error"},iM={class:"form-row"},sM={class:"form-group"},rM={key:0,class:"field-error"},oM={class:"form-group"},aM={key:0,class:"field-error"},lM={class:"form-group"},cM={key:0,class:"field-error"},uM={class:"form-group"},dM={key:0,class:"field-error"},fM={class:"form-actions"},hM={key:1,class:"selected-bar"},pM={class:"movies-grid"},mM=["onClick"],gM={key:0,class:"movie-poster"},vM=["src","alt"],_M={key:1,class:"movie-poster-placeholder"},xM={class:"movie-info"},yM={key:0,class:"meta"},SM={key:1,class:"meta"},MM={key:2,class:"notes"},bM={class:"footer"},EM={class:"suggested-by"},wM=["onClick"],TM={key:2,class:"empty-state"},AM=et({__name:"MovieSuggestions",emits:["refresh"],setup(n,{emit:e}){const t=e,i=ne([]),s=ne(!1),r=ne({title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""}),o=ne([]),a=ne(""),l=ne({}),c=async()=>{try{const _=await jS("/api/movies");i.value=_.movies}catch(_){br(To(_,"Failed to load movies"))}},u=async()=>{if(l.value={},!r.value.title.trim()){l.value.title="Title is required";return}if(!r.value.suggestedBy.trim()){l.value.suggestedBy="Your name is required";return}try{await pf("/api/movies",{title:r.value.title,suggestedBy:r.value.suggestedBy,year:r.value.year||void 0,genre:r.value.genre||void 0,notes:r.value.notes||void 0,thumbnail:r.value.thumbnail||void 0}),r.value={title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""},s.value=!1,dl("Movie added successfully!"),await c()}catch(_){const v=To(_,"Failed to add movie");v.includes(`
`)?v.split(`
`).forEach(p=>{const S=p.match(/^([^:]+): (.+)$/);if(S){const x=S[1].toLowerCase().replace(/\s+/g,"");l.value[x]=S[2]}}):br(v)}},d=async _=>{if(confirm("Are you sure you want to delete this movie?"))try{await YS(`/api/movies/${_}`),dl("Movie deleted successfully!"),await c()}catch(v){br(To(v,"Failed to delete movie"))}},h=async()=>{if(o.value.length<2){br("Please select at least 2 movies to vote on");return}if(confirm(`Start voting with ${o.value.length} movies?`))try{await pf("/api/movies/voting-round/start",{movieIds:o.value}),dl("Voting round started!"),o.value=[],t("refresh")}catch(_){br(To(_,"Failed to start voting round"))}},g=_=>{const v=o.value.indexOf(_);v>-1?o.value.splice(v,1):o.value.push(_)};return It(()=>{c(),a.value=localStorage.getItem("userId")||"user-"+Math.random().toString(36).substr(2,9),localStorage.setItem("userId",a.value)}),(_,v)=>(F(),B("div",KS,[f("div",ZS,[v[8]||(v[8]=f("h2",null,"📝 Movie Suggestions",-1)),f("button",{class:"btn-primary",onClick:v[0]||(v[0]=m=>s.value=!s.value)},z(s.value?"Cancel":"+ Add Movie"),1)]),s.value?(F(),B("div",JS,[v[15]||(v[15]=f("h3",null,"🎬 Add New Movie Suggestion",-1)),f("div",QS,[v[9]||(v[9]=f("label",null,"Movie Title *",-1)),Et(f("input",{"onUpdate:modelValue":v[1]||(v[1]=m=>r.value.title=m),type:"text",placeholder:"Enter movie title...",required:"",class:Ue({"has-error":l.value.title})},null,2),[[Ft,r.value.title]]),l.value.title?(F(),B("div",eM,z(l.value.title),1)):Te("",!0)]),f("div",tM,[v[10]||(v[10]=f("label",null,"Your Name *",-1)),Et(f("input",{"onUpdate:modelValue":v[2]||(v[2]=m=>r.value.suggestedBy=m),type:"text",placeholder:"Your name...",required:"",class:Ue({"has-error":l.value.suggestedBy})},null,2),[[Ft,r.value.suggestedBy]]),l.value.suggestedBy?(F(),B("div",nM,z(l.value.suggestedBy),1)):Te("",!0)]),f("div",iM,[f("div",sM,[v[11]||(v[11]=f("label",null,"Year",-1)),Et(f("input",{"onUpdate:modelValue":v[3]||(v[3]=m=>r.value.year=m),type:"text",placeholder:"2024",class:Ue({"has-error":l.value.year})},null,2),[[Ft,r.value.year]]),l.value.year?(F(),B("div",rM,z(l.value.year),1)):Te("",!0)]),f("div",oM,[v[12]||(v[12]=f("label",null,"Genre",-1)),Et(f("input",{"onUpdate:modelValue":v[4]||(v[4]=m=>r.value.genre=m),type:"text",placeholder:"Action, Comedy...",class:Ue({"has-error":l.value.genre})},null,2),[[Ft,r.value.genre]]),l.value.genre?(F(),B("div",aM,z(l.value.genre),1)):Te("",!0)])]),f("div",lM,[v[13]||(v[13]=f("label",null,"Notes",-1)),Et(f("textarea",{"onUpdate:modelValue":v[5]||(v[5]=m=>r.value.notes=m),placeholder:"Why this movie? Any details...",rows:"3",class:Ue({"has-error":l.value.notes})},null,2),[[Ft,r.value.notes]]),l.value.notes?(F(),B("div",cM,z(l.value.notes),1)):Te("",!0)]),f("div",uM,[v[14]||(v[14]=f("label",null,"Thumbnail URL",-1)),Et(f("input",{"onUpdate:modelValue":v[6]||(v[6]=m=>r.value.thumbnail=m),type:"text",placeholder:"https://example.com/poster.jpg",class:Ue({"has-error":l.value.thumbnail})},null,2),[[Ft,r.value.thumbnail]]),l.value.thumbnail?(F(),B("div",dM,z(l.value.thumbnail),1)):Te("",!0)]),f("div",fM,[f("button",{class:"btn-secondary",onClick:v[7]||(v[7]=m=>s.value=!1)},"Cancel"),f("button",{class:"btn-primary",onClick:u},"Add Movie")])])):Te("",!0),o.value.length>0?(F(),B("div",hM,[f("span",null,z(o.value.length)+" movie(s) selected for voting",1),f("button",{class:"btn-success",onClick:h},"Start Voting")])):Te("",!0),f("div",pM,[(F(!0),B(Xe,null,st(i.value,m=>(F(),B("div",{key:m.id,class:Ue(["movie-card",{selected:o.value.includes(m.id)}]),onClick:p=>g(m.id)},[m.thumbnail?(F(),B("div",gM,[f("img",{src:m.thumbnail,alt:m.title},null,8,vM)])):(F(),B("div",_M," 🎬 ")),f("div",xM,[f("h3",null,z(m.title),1),m.year?(F(),B("p",yM,z(m.year),1)):Te("",!0),m.genre?(F(),B("p",SM,z(m.genre),1)):Te("",!0),m.notes?(F(),B("p",MM,z(m.notes),1)):Te("",!0),f("div",bM,[f("span",EM,"Suggested by "+z(m.suggestedBy),1),f("button",{class:"btn-delete",onClick:lo(p=>d(m.id),["stop"]),title:"Delete movie"}," 🗑️ ",8,wM)])]),v[16]||(v[16]=f("div",{class:"select-check"}," ✓ ",-1))],10,mM))),128))]),i.value.length===0?(F(),B("div",TM,[...v[17]||(v[17]=[f("p",null,"No movie suggestions yet. Add your first one! 🎬",-1)])])):Te("",!0)]))}}),CM=ut(AM,[["__scopeId","data-v-f7d44a16"]]);class RM{async getMovies(){const{data:e,error:t}=await zt.GET("/movies",{});if(t)throw new Error(t.error||"Failed to get movies");return(e==null?void 0:e.movies)||[]}async getVotingRound(){const{data:e,error:t}=await zt.GET("/movies/voting-round",{});if(t)throw new Error(t.error||"Failed to get voting round");return(e==null?void 0:e.round)||null}async startVotingRound(){const{data:e,error:t}=await zt.POST("/movies/voting-round/start",{});if(t)throw new Error(t.error||"Failed to start voting round");return e}async endVotingRound(){const{data:e,error:t}=await zt.POST("/movies/voting-round/end",{});if(t)throw new Error(t.error||"Failed to end voting round");return e}async resetVotingRound(){const{data:e,error:t}=await zt.POST("/movies/voting-round/reset",{});if(t)throw new Error(t.error||"Failed to reset voting round");return e}async getVotes(){const{data:e,error:t}=await zt.GET("/movies/votes",{});if(t)throw new Error(t.error||"Failed to get votes");return(e==null?void 0:e.votes)||[]}async getVote(e){try{const{data:t,error:i}=await zt.GET("/movies/vote/{userId}",{params:{path:{userId:e}}});return i?null:(t==null?void 0:t.vote)||null}catch{return null}}async submitVote(e,t){const{data:i,error:s}=await zt.POST("/movies/vote",{body:{userId:e,rankings:t}});if(s)throw new Error(s.error||"Failed to submit vote");return i}async deleteVote(e){const{data:t,error:i}=await zt.DELETE("/movies/vote/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to delete vote");return t}}const Bn=new RM,PM={class:"movie-voting"},IM={key:0,class:"no-voting"},DM={key:1,class:"voting-active"},LM={key:0,class:"has-voted"},NM={class:"voted-message"},UM={class:"my-ranking"},FM={class:"rank-number"},OM={key:1,class:"voting-form"},kM={class:"ranking-area"},BM={class:"ranking-header"},VM={class:"count"},zM={key:0,class:"empty-ranking"},HM={key:1,class:"ranking-list"},GM={class:"rank-badge"},$M={class:"movie-name"},WM={class:"movie-actions"},XM=["onClick","disabled"],qM=["onClick","disabled"],jM=["onClick"],YM={class:"available-movies"},KM={class:"movie-list"},ZM={class:"movie-details"},JM={key:0,class:"meta"},QM={key:1,class:"meta"},eb={key:2,class:"notes"},tb=["onClick"],nb={key:1,class:"added-badge"},ib={class:"submit-section"},sb=["disabled"],rb=et({__name:"MovieVoting",emits:["refresh"],setup(n,{emit:e}){const t=ne(null),i=ne([]),s=ne([]),r=ne(null),o=ne(!1),{userId:a}=sm(),l=rt(()=>t.value?t.value.movieIds.map(m=>i.value.find(p=>p.id===m)).filter(Boolean):[]),c=async()=>{var m;try{t.value=await Bn.getVotingRound(),(m=t.value)!=null&&m.isActive&&await u()}catch(p){console.error("Failed to load voting round:",p)}},u=async()=>{try{i.value=await Bn.getMovies()}catch(m){console.error("Failed to load movies:",m)}},d=async()=>{if(a.value)try{const m=await Bn.getVote(a.value);m?(r.value=m,s.value=m.rankings,o.value=!0):o.value=!1}catch{o.value=!1}},h=async()=>{if(s.value.length<2){alert("Please rank at least 2 movies in order of preference");return}try{const m=await Bn.submitVote(a.value,s.value);o.value=!0,r.value=m.vote,alert("Vote submitted! 🗳️")}catch(m){console.error("Error submitting vote:",m),alert("Failed to submit vote")}},g=m=>{if(m>0){const p=s.value.splice(m,1)[0];s.value.splice(m-1,0,p)}},_=m=>{if(m<s.value.length-1){const p=s.value.splice(m,1)[0];s.value.splice(m+1,0,p)}},v=m=>i.value.find(p=>p.id===m);return It(async()=>{await c(),await d()}),(m,p)=>(F(),B("div",PM,[!t.value||!t.value.isActive?(F(),B("div",IM,[...p[0]||(p[0]=[f("h2",null,"🗳️ No Active Voting Round",-1),f("p",null,"Voting hasn't started yet. Go to the Suggestions tab to select movies and start a voting round!",-1)])])):(F(),B("div",DM,[p[7]||(p[7]=f("div",{class:"voting-header"},[f("h2",null,"🗳️ Vote for Movie Night!"),f("p",{class:"subtitle"},"Rank movies in order of preference (Australian Parliament style)")],-1)),o.value?(F(),B("div",LM,[f("div",NM,[p[1]||(p[1]=f("h3",null,"✅ You've voted!",-1)),p[2]||(p[2]=f("p",null,"Your ranking:",-1)),f("ol",UM,[(F(!0),B(Xe,null,st(r.value.rankings,(S,x)=>{var b;return F(),B("li",{key:S},[f("span",FM,z(x+1),1),Kt(" "+z(((b=v(S))==null?void 0:b.title)||"Unknown"),1)])}),128))])])])):(F(),B("div",OM,[p[6]||(p[6]=f("div",{class:"instructions"},[f("h3",null,"📋 How to Vote"),f("ol",null,[f("li",null,'Add movies to your ranking by clicking the "+ Add" button'),f("li",null,"Drag or use arrows to reorder by preference (1st choice at the top)"),f("li",null,"Rank as many or as few as you like (minimum 2)"),f("li",null,`Click "Submit Vote" when you're done`)])],-1)),f("div",kM,[f("div",BM,[p[3]||(p[3]=f("h3",null,"Your Ranking (Priority Order)",-1)),f("span",VM,z(s.value.length)+" / "+z(l.value.length),1)]),s.value.length===0?(F(),B("div",zM,[...p[4]||(p[4]=[f("p",null,"No movies ranked yet. Add movies below!",-1)])])):(F(),B("div",HM,[(F(!0),B(Xe,null,st(s.value,(S,x)=>{var b;return F(),B("div",{key:S,class:"ranking-item"},[f("div",GM,z(x+1),1),f("div",$M,z(((b=v(S))==null?void 0:b.title)||"Unknown"),1),f("div",WM,[f("button",{class:"action-btn",onClick:E=>g(x),disabled:x===0,title:"Move up"}," ↑ ",8,XM),f("button",{class:"action-btn",onClick:E=>_(x),disabled:x===s.value.length-1,title:"Move down"}," ↓ ",8,qM),f("button",{class:"action-btn remove",onClick:E=>s.value.splice(x,1),title:"Remove"}," ✕ ",8,jM)])])}),128))]))]),f("div",YM,[p[5]||(p[5]=f("h3",null,"Available Movies",-1)),f("div",KM,[(F(!0),B(Xe,null,st(l.value,S=>(F(),B("div",{key:S.id,class:Ue(["movie-item",{added:s.value.includes(S.id)}])},[f("div",ZM,[f("strong",null,z(S.title),1),S.year?(F(),B("span",JM,"("+z(S.year)+")",1)):Te("",!0),S.genre?(F(),B("span",QM,"• "+z(S.genre),1)):Te("",!0),S.notes?(F(),B("p",eb,z(S.notes),1)):Te("",!0)]),s.value.includes(S.id)?(F(),B("span",nb,"Added")):(F(),B("button",{key:0,class:"add-btn",onClick:x=>s.value.push(S.id)}," + Add ",8,tb))],2))),128))])]),f("div",ib,[f("button",{class:"btn-submit",onClick:h,disabled:s.value.length<2}," Submit Vote ("+z(s.value.length)+" movies ranked) ",9,sb)])]))]))]))}}),ob=ut(rb,[["__scopeId","data-v-0d66ac84"]]),ab={class:"movie-results"},lb={key:0,class:"no-results"},cb={key:1,class:"voting-active"},ub={class:"active-message"},db={class:"stats"},fb={class:"stat-item"},hb={class:"stat-value"},pb={class:"stat-item"},mb={class:"stat-value"},gb={key:2,class:"loading"},vb={key:3,class:"results-display"},_b={class:"results-header"},xb={class:"subtitle"},yb={key:0,class:"winner-section"},Sb={class:"winner-card"},Mb={class:"winner-title"},bb={class:"winner-meta"},Eb={key:0},wb={key:1},Tb={class:"winner-suggested"},Ab={class:"rounds-section"},Cb={class:"rounds-container"},Rb={class:"round-header"},Pb={key:0,class:"final-badge"},Ib={key:1,class:"eliminated-badge"},Db={class:"round-results"},Lb={class:"result-title"},Nb={key:0,class:"trophy"},Ub={key:1,class:"eliminated-tag"},Fb={class:"result-votes"},Ob={class:"votes-bar"},kb={class:"votes-text"},Bb={key:0,class:"round-note"},Vb=et({__name:"MovieResults",emits:["refresh"],setup(n,{emit:e}){const t=e,i=ne(null),s=ne([]),r=ne([]),o=ne(null),a=rt(()=>{var m;return!((m=i.value)!=null&&m.winner)||!s.value.length?null:s.value.find(p=>{var S;return p.id===((S=i.value)==null?void 0:S.winner)})}),l=m=>{const p=s.value.find(S=>S.id===m);return(p==null?void 0:p.title)||"Unknown"},c=async()=>{try{i.value=await Bn.getVotingRound(),i.value&&(await u(),await d(),i.value.isActive||(o.value=h()))}catch(m){console.error("Failed to load voting round:",m)}},u=async()=>{try{s.value=await Bn.getMovies()}catch(m){console.error("Failed to load movies:",m)}},d=async()=>{try{r.value=await Bn.getVotes()}catch(m){console.error("Failed to load votes:",m)}},h=()=>{if(!i.value||!s.value.length)return null;const m=i.value.movieIds,p=s.value.filter(b=>m.includes(b.id)),S=r.value.filter(b=>b.rankings.some(E=>m.includes(E)));return{rounds:g(p,S),totalVotes:S.length,winner:i.value.winner}},g=(m,p)=>{if(m.length===0)return[];const S=[];let x=[...m],b=1;for(;x.length>0;){const E={};x.forEach(N=>E[N.id]=0),p.forEach(N=>{for(const O of N.rankings)if(E.hasOwnProperty(O)){E[O]++;break}});const A=x.map(N=>({movieId:N.id,title:N.title,votes:E[N.id]||0,percentage:p.length>0?(E[N.id]||0)/p.length*100:0,eliminated:!1}));A.sort((N,O)=>O.votes-N.votes);const I=A[0].votes>p.length/2,M=x.length===1;if(I||M){S.push({round:b,eliminated:M?null:A[A.length-1].movieId,winner:A[0].movieId,results:A,isFinal:!0});break}A[A.length-1].eliminated=!0,S.push({round:b,eliminated:A[A.length-1].movieId,results:A,isFinal:!1});const w=A[A.length-1].movieId;x=x.filter(N=>N.id!==w),b++}return S},_=async()=>{var m;if(confirm("Are you sure you want to end voting? This will calculate the winner and close the voting round."))try{const p=await Bn.endVotingRound();alert("Voting ended! The winner is "+(((m=a.value)==null?void 0:m.title)||"Unknown")+"! 🏆"),await c(),t("refresh")}catch(p){console.error("Error ending voting:",p),alert("Failed to end voting")}},v=async()=>{if(confirm("Are you sure you want to reset all voting? This will delete all votes and the current round."))try{await Bn.resetVotingRound(),alert("Voting reset successfully!"),o.value=null,t("refresh")}catch(m){console.error("Error resetting voting:",m),alert("Failed to reset voting")}};return It(()=>{c()}),(m,p)=>(F(),B("div",ab,[i.value?i.value.isActive?(F(),B("div",cb,[f("div",ub,[p[3]||(p[3]=f("h2",null,"🗳️ Voting in Progress",-1)),p[4]||(p[4]=f("p",null,"Voting is still open. Click the button below when everyone has voted!",-1)),f("div",db,[f("div",fb,[f("span",hb,z(r.value.length),1),p[1]||(p[1]=f("span",{class:"stat-label"},"Votes Cast",-1))]),f("div",pb,[f("span",mb,z(s.value.filter(S=>{var x;return(x=i.value)==null?void 0:x.movieIds.includes(S.id)}).length),1),p[2]||(p[2]=f("span",{class:"stat-label"},"Movies",-1))])]),f("button",{class:"btn-end",onClick:_},"🏁 End Voting")])])):o.value?(F(),B("div",vb,[f("div",_b,[p[6]||(p[6]=f("h2",null,"🏆 Voting Results",-1)),f("p",xb,z(o.value.totalVotes)+" votes cast • Australian Parliament preferential voting",1),f("button",{class:"btn-reset",onClick:v},"🔄 Reset Voting")]),a.value?(F(),B("div",yb,[f("div",Sb,[p[7]||(p[7]=f("div",{class:"winner-badge"},"🏆 WINNER",-1)),f("h3",Mb,z(a.value.title),1),f("p",bb,[a.value.year?(F(),B("span",Eb,z(a.value.year),1)):Te("",!0),a.value.genre?(F(),B("span",wb,"• "+z(a.value.genre),1)):Te("",!0)]),f("p",Tb,"Suggested by "+z(a.value.suggestedBy),1)])])):Te("",!0),f("div",Ab,[p[8]||(p[8]=f("h3",null,"📊 Voting Rounds (Preferential)",-1)),f("div",Cb,[(F(!0),B(Xe,null,st(o.value.rounds,(S,x)=>(F(),B("div",{key:x,class:Ue(["round-card",{final:S.isFinal}])},[f("div",Rb,[f("h4",null,"Round "+z(S.round),1),S.isFinal?(F(),B("span",Pb,"FINAL")):Te("",!0),S.eliminated?(F(),B("span",Ib," Eliminated: "+z(l(S.eliminated)),1)):Te("",!0)]),f("div",Db,[(F(!0),B(Xe,null,st(S.results,b=>(F(),B("div",{key:b.movieId,class:Ue(["result-item",{winner:S.winner===b.movieId,eliminated:b.eliminated}])},[f("div",Lb,[S.winner===b.movieId?(F(),B("span",Nb,"🏆")):Te("",!0),Kt(" "+z(b.title)+" ",1),b.eliminated?(F(),B("span",Ub,"✕")):Te("",!0)]),f("div",Fb,[f("div",Ob,[f("div",{class:"votes-fill",style:Ht({width:b.percentage+"%"})},null,4)]),f("div",kb,z(b.votes)+" votes ("+z(b.percentage.toFixed(1))+"%) ",1)])],2))),128))]),S.isFinal?(F(),B("div",Bb,[f("p",null,"✨ "+z(S.winner?l(S.winner):"Candidate")+" achieved majority!",1)])):Te("",!0)],2))),128))])]),p[9]||(p[9]=f("div",{class:"how-it-works"},[f("h3",null,"📖 How Preferential Voting Works"),f("ol",null,[f("li",null,"Voters rank movies in order of preference (1st, 2nd, 3rd...)"),f("li",null,"In Round 1, only 1st preferences are counted"),f("li",null,"If no movie has >50% of votes, the lowest-ranked movie is eliminated"),f("li",null,"Votes for the eliminated movie are redistributed to voters' next preferences"),f("li",null,"This continues until one movie has >50% (majority) or only one remains")])],-1))])):(F(),B("div",gb,[...p[5]||(p[5]=[f("p",null,"Loading results...",-1)])])):(F(),B("div",lb,[...p[0]||(p[0]=[f("h2",null,"🏆 Voting Results",-1),f("p",null,"No voting round has been created yet.",-1)])]))]))}}),zb=ut(Vb,[["__scopeId","data-v-1a5de110"]]),Hb={class:"movie-page"},Gb={class:"tabs"},$b={key:0,class:"badge"},Wb={class:"tab-content"},Xb=et({__name:"MoviePage",setup(n){const e=ne("suggestions"),t=ne(null),i=async()=>{var r;try{t.value=await Bn.getVotingRound(),(r=t.value)!=null&&r.isActive&&e.value==="results"&&(e.value="voting")}catch(o){console.error("Failed to fetch voting round:",o)}},{data:s}=fc(()=>Bn.getVotingRound(),{initialInterval:1e4});return It(()=>{i()}),Gn(s,r=>{r&&(t.value=r,r.isActive&&e.value==="results"&&(e.value="voting"))}),(r,o)=>{var a;return F(),B("div",Hb,[o[4]||(o[4]=f("div",{class:"movie-header"},[f("h1",null,"🎬 Movie Night 🎬"),f("p",{class:"subtitle"},"Fortnightly movie suggestions & preferential voting")],-1)),f("div",Gb,[f("button",{class:Ue(["tab",{active:e.value==="suggestions"}]),onClick:o[0]||(o[0]=l=>e.value="suggestions")}," 📝 Suggestions ",2),f("button",{class:Ue(["tab",{active:e.value==="voting"}]),onClick:o[1]||(o[1]=l=>e.value="voting")},[o[3]||(o[3]=Kt(" 🗳️ Vote ",-1)),(a=t.value)!=null&&a.isActive?(F(),B("span",$b,"Active")):Te("",!0)],2),f("button",{class:Ue(["tab",{active:e.value==="results"}]),onClick:o[2]||(o[2]=l=>e.value="results")}," 🏆 Results ",2)]),f("div",Wb,[e.value==="suggestions"?(F(),jt(CM,{key:0,onRefresh:i})):Te("",!0),e.value==="voting"?(F(),jt(ob,{key:1,onRefresh:i})):Te("",!0),e.value==="results"?(F(),jt(zb,{key:2,onRefresh:i})):Te("",!0)])])}}}),qb=ut(Xb,[["__scopeId","data-v-ea148de4"]]),jb={class:"countdown-grid"},Yb={class:"game-image"},Kb=["src","alt"],Zb={class:"game-emoji"},Jb={class:"game-info"},Qb={class:"game-title"},eE={class:"game-description"},tE={class:"release-date"},nE={class:"countdown-display"},iE={key:0,class:"released-badge"},sE={key:1,class:"infinity-badge"},rE={key:2,class:"timer"},oE={class:"time-unit"},aE={class:"time-value"},lE={class:"time-unit"},cE={class:"time-value"},uE={class:"time-unit"},dE={class:"time-value"},fE={class:"time-unit"},hE={class:"time-value"},pE=et({__name:"CountdownPage",setup(n){const e=Qt(),t=[{title:"Orlando's Roommate's Cat comes to Orlando's apartment",game:"orlando-roommate-cat",date:new Date("2026-02-20T00:00:00Z"),description:"The big day approaches...",emoji:"🐈",image:"/orlando-roommate-cat.png"},{title:"ZAI Key Expiration",game:"zai-key-expiration",date:new Date("2026-05-04T00:00:00Z"),description:"The ZAI API key runs out. Time to renew or find an alternative!",emoji:"🔑",image:"/zai-key-expiration.png"},{title:"New Mewgenics",game:"new-mewgenics",date:new Date("2026-02-10T00:00:00Z"),description:"The next generation of Pokémon games",emoji:"🎮",image:"https://static01.nyt.com/images/2010/06/14/business/sub-jp-burger-2/sub-jp-burger-2-popup.jpg?quality=75&auto=webp&disable=upscale"},{title:"Slay The Spire 2",game:"slay-the-spire-2",date:new Date("2026-03-15T00:00:00Z"),description:"The highly anticipated sequel returns",emoji:"🗡️",image:"https://assetsio.gnwcdn.com/uno-hand_I1JrsbV.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp"},{title:"Tomodachi Life: Living in Dream",game:"tomodachi-life",date:new Date("2026-04-16T00:00:00Z"),description:"Continue your cozy life as a cat in this cozy sequel",emoji:"🐱",image:"/tomodachi-life.png"},{title:"The Heat Death of Universe",game:"heat-death-of-universe",date:new Date("12006-01-01T00:00:00Z"),description:"The universe faces its ultimate fate in 10^100 years (a googol)",emoji:"🌌",image:"https://www.italia.it/content/dam/tdh/en/destinations/lazio/frosinone/media/google/image3.jpeg",infinite:!0}],i=ne(new Date);let s=null;It(()=>{s=window.setInterval(()=>{i.value=new Date},1e3)}),hi(()=>{s&&clearInterval(s)});const r=l=>{const c=l.getTime()-i.value.getTime();if(c<=0)return{released:!0,days:0,hours:0,minutes:0,seconds:0};const u=Math.floor(c/(1e3*60*60*24)),d=Math.floor(c%(1e3*60*60*24)/(1e3*60*60)),h=Math.floor(c%(1e3*60*60)/(1e3*60)),g=Math.floor(c%(1e3*60)/1e3);return{released:!1,days:u,hours:d,minutes:h,seconds:g}},o=l=>l.toString().padStart(2,"0"),a=rt(()=>[...t].sort((l,c)=>l.date.getTime()-c.date.getTime()));return(l,c)=>(F(),B("div",{class:Ue(["countdown-page",{dark:ve(e).darkMode}])},[c[4]||(c[4]=f("div",{class:"countdown-header"},[f("h1",null,"🎮 Game Release Countdowns"),f("p",{class:"subtitle"},"Time until your most anticipated games!")],-1)),f("div",jb,[(F(!0),B(Xe,null,st(a.value,u=>(F(),B("div",{key:u.game,class:Ue(["countdown-card",{released:r(u.date).released}])},[f("div",Yb,[f("img",{src:u.image,alt:u.title},null,8,Kb),f("div",Zb,z(u.emoji),1)]),f("div",Jb,[f("h3",Qb,z(u.title),1),f("p",eE,z(u.description),1),f("p",tE,"Release: "+z(u.date.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})),1)]),f("div",nE,[r(u.date).released?(F(),B("div",iE," ✨ Released! ✨ ")):u.infinite?(F(),B("div",sE," ∞ 10¹⁰⁰ years ")):(F(),B("div",rE,[f("div",oE,[f("span",aE,z(o(r(u.date).days)),1),c[0]||(c[0]=f("span",{class:"time-label"},"Days",-1))]),f("div",lE,[f("span",cE,z(o(r(u.date).hours)),1),c[1]||(c[1]=f("span",{class:"time-label"},"Hours",-1))]),f("div",uE,[f("span",dE,z(o(r(u.date).minutes)),1),c[2]||(c[2]=f("span",{class:"time-label"},"Minutes",-1))]),f("div",fE,[f("span",hE,z(o(r(u.date).seconds)),1),c[3]||(c[3]=f("span",{class:"time-label"},"Seconds",-1))])]))])],2))),128))]),c[5]||(c[5]=f("div",{class:"footer-note"},[f("p",null,[Kt("📌 "),f("strong",null,"Real Release Dates:")]),f("p",null,"New Mewgenics - February 10, 2026"),f("p",null,"Slay The Spire 2 - March 15, 2026"),f("p",null,"Tomodachi Life - April 16, 2026"),f("p",null,"ZAI Key Expiration - May 4, 2026"),f("p",null,"The Heat Death of Universe - 10^100 (a googol) years from now!"),f("p",{class:"credit"},"🖼 Images by Orlando")],-1))],2))}}),mE=ut(pE,[["__scopeId","data-v-8ff1f9ac"]]),gE={class:"modal-container"},vE={class:"modal-header"},_E={class:"modal-title"},xE={class:"modal-body"},yE=et({__name:"Modal",props:{isOpen:{type:Boolean},title:{}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")},s=r=>{r.key==="Escape"&&i()};return It(()=>{document.addEventListener("keydown",s)}),hi(()=>{document.removeEventListener("keydown",s)}),(r,o)=>(F(),jt(jg,{to:"body"},[n.isOpen?(F(),B("div",{key:0,class:"modal-overlay",onClick:lo(i,["self"])},[f("div",gE,[f("div",vE,[f("h2",_E,z(n.title),1),f("button",{class:"modal-close-btn",onClick:i,"aria-label":"Close"},"×")]),f("div",xE,[op(r.$slots,"default",{},void 0)])])])):Te("",!0)]))}}),hc=ut(yE,[["__scopeId","data-v-57552658"]]),SE={class:"ticket-form-content"},ME={class:"form-group"},bE=["disabled"],EE={class:"form-group"},wE=["disabled"],TE={class:"form-actions"},AE=["disabled"],CE=["disabled"],RE={key:0,class:"estimated-wait-time"},PE={class:"wait-text"},IE={class:"wait-subtext"},DE=et({__name:"TicketForm",props:{title:{},description:{},type:{},priority:{},isEditing:{type:Boolean,default:!1},loading:{type:Boolean,default:!1},estimatedWaitTimeMinutes:{default:null},sampleSize:{default:0}},emits:["update:title","update:description","update:type","update:priority","submit","cancel"],setup(n,{emit:e}){const t=n,i=e,s=rt({get:()=>t.title,set:d=>i("update:title",d)}),r=rt({get:()=>t.description,set:d=>i("update:description",d)}),o=rt(()=>t.title.trim()!==""),a=()=>{o.value&&i("submit")},l=()=>{i("cancel")},c=d=>{d.ctrlKey&&d.key==="Enter"&&(d.preventDefault(),a())},u=d=>{if(d<60)return`${Math.round(d)} minutes`;if(d<1440){const h=Math.floor(d/60),g=Math.round(d%60);return g===0?`${h} hour${h>1?"s":""}`:`${h} hour${h>1?"s":""} ${g} min`}else{const h=Math.floor(d/1440),g=Math.round(d%1440/60);return g===0?`${h} day${h>1?"s":""}`:`${h} day${h>1?"s":""} ${g}h`}};return(d,h)=>(F(),B("div",SE,[f("div",ME,[h[2]||(h[2]=f("label",{for:"ticket-title"},"Title",-1)),Et(f("input",{id:"ticket-title","onUpdate:modelValue":h[0]||(h[0]=g=>s.value=g),type:"text",placeholder:"Brief summary of your ticket...",disabled:n.loading,onKeydown:c},null,40,bE),[[Ft,s.value]])]),f("div",EE,[h[3]||(h[3]=f("label",{for:"ticket-description"},"Description",-1)),Et(f("textarea",{id:"ticket-description","onUpdate:modelValue":h[1]||(h[1]=g=>r.value=g),placeholder:"Detailed description of your request...",rows:"6",disabled:n.loading,onKeydown:c},null,40,wE),[[Ft,r.value]])]),f("div",TE,[n.isEditing?(F(),B("button",{key:0,onClick:l,class:"btn btn-cancel",disabled:n.loading}," Cancel ",8,AE)):Te("",!0),f("button",{type:"button",onClick:a,class:"btn btn-submit",disabled:n.loading||!o.value},z(n.loading?"Saving...":n.isEditing?"Save Changes":"Submit Ticket"),9,CE)]),h[6]||(h[6]=f("div",{class:"form-hint"},[Kt(" 💡 Tip: Press "),f("kbd",null,"Ctrl"),Kt(" + "),f("kbd",null,"Enter"),Kt(" to submit quickly ")],-1)),!n.isEditing&&n.estimatedWaitTimeMinutes!==null?(F(),B("div",RE,[h[5]||(h[5]=f("span",{class:"wait-icon"},"⏱️",-1)),f("span",PE,[h[4]||(h[4]=Kt(" Estimated wait time: ",-1)),f("strong",null,z(u(n.estimatedWaitTimeMinutes)),1),f("span",IE,"(based on "+z(n.sampleSize)+" completed tickets)",1)])])):Te("",!0)]))}}),mf=ut(DE,[["__scopeId","data-v-e8477fc4"]]),LE={class:"tickets-page"},NE={class:"tickets-container"},UE={class:"tickets-header"},FE={key:0,class:"last-collection"},OE={class:"collection-text"},kE={class:"ignore-mode-toggle"},BE={class:"toggle-switch"},VE=["checked"],zE={class:"toggle-label"},HE={class:"notification-icon"},GE={class:"notification-message"},$E={class:"filter-section"},WE={class:"search-box"},XE={class:"filter-group"},qE={class:"filter-chips"},jE=["onClick"],YE={key:1,class:"kanban-board"},KE={key:0,class:"loading-state"},ZE={key:1,class:"empty-state"},JE={key:2,class:"kanban-columns"},QE={class:"kanban-column"},e1={class:"column-header"},t1={class:"column-count"},n1={class:"column-tickets"},i1={class:"ticket-header"},s1={class:"ticket-title"},r1={class:"ticket-description"},o1={class:"ticket-meta"},a1={class:"ticket-date"},l1={class:"ticket-actions"},c1=["onClick","disabled"],u1=["onClick","disabled"],d1={key:0,class:"empty-column"},f1={class:"kanban-column"},h1={class:"column-header"},p1={class:"column-count"},m1={class:"column-tickets"},g1={class:"ticket-header"},v1={class:"ticket-title"},_1={class:"ticket-description"},x1={class:"ticket-meta"},y1={class:"ticket-date"},S1={class:"ticket-actions"},M1=["onClick","disabled"],b1={key:0,class:"empty-column"},E1={class:"kanban-column"},w1={class:"column-header"},T1={class:"column-count"},A1={class:"column-tickets"},C1={class:"ticket-header"},R1={class:"ticket-title"},P1={class:"ticket-description"},I1={class:"ticket-meta"},D1={class:"ticket-date"},L1={key:0,class:"ticket-response"},N1={class:"response-text"},U1={key:0,class:"empty-column"},F1={key:2,class:"tickets-list"},O1={key:0,class:"loading-state"},k1={key:1,class:"empty-state"},B1={class:"ticket-header"},V1={class:"ticket-title"},z1={class:"ticket-badges"},H1={class:"ticket-description"},G1={class:"ticket-meta"},$1={class:"ticket-date"},W1={class:"ticket-actions"},X1=["onClick","disabled"],q1=["onClick","disabled"],j1=["onClick","disabled"],Y1={key:0,class:"ticket-response"},K1={class:"response-text"},Z1=et({__name:"TicketsPage",setup(n){const e=ne([]),t=ne(!1),i=ne(null),s=ne(!1),r=ne(!1),o=ne(null),a=ne(null),l=ne({show:!1,message:"",type:"success"}),c=ne("all"),u=ne("all"),d=ne("all"),h=ne(""),g=ne(null),_=ne(""),v=ne(""),m=ne({title:"",description:"",type:"feature",priority:"medium"}),p=ne(!1),S=ne(null),x=ne({title:"",description:"",type:"feature",priority:"medium"}),b={pending:"bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700","needs-info":"bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",completed:"bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",declined:"bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"},E={pending:"⏳ Pending","needs-info":"🔄 In Progress",completed:"✅ Complete",declined:"❌ Declined"},A=[{value:"all",label:"All"},{value:"pending",label:"⏳ Pending"},{value:"in-progress",label:"🔄 In Progress"},{value:"completed",label:"✅ Complete"}],T=rt(()=>{let G=e.value;if(c.value!=="all"){const R=c.value==="in-progress"?"needs-info":c.value;G=G.filter(W=>W.status===R)}if(u.value!=="all"&&(G=G.filter(R=>R.type===u.value)),d.value!=="all"&&(G=G.filter(R=>R.priority===d.value)),h.value.trim()){const R=h.value.toLowerCase().trim();G=G.filter(W=>W.title.toLowerCase().includes(R)||W.description.toLowerCase().includes(R))}return G}),I=rt(()=>({pending:e.value.filter(G=>G.status==="pending"),inProgress:e.value.filter(G=>G.status==="needs-info"),completed:e.value.filter(G=>G.status==="completed")})),M=()=>{let G=localStorage.getItem("tickets-creator-id");return G||(G="user_"+Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15),localStorage.setItem("tickets-creator-id",G)),G},w=G=>!!(G.creator_id&&G.creator_id===v.value),N=async()=>{t.value=!0,i.value=null;try{const G=new URLSearchParams;if(c.value!=="all"){const ce=c.value==="in-progress"?"needs-info":c.value;G.append("status",ce)}const R=await fetch(`/api/tickets?${G.toString()}`);if(!R.ok)throw new Error("Failed to load tickets");const W=await R.json();e.value=W.tickets||[]}catch(G){i.value=G instanceof Error?G.message:"Failed to load tickets"}finally{t.value=!1}};Gn([c],()=>{N()});const O=(G,R="success")=>{l.value={show:!0,message:G,type:R},setTimeout(()=>{l.value.show=!1},3e3)},q=()=>{l.value.show=!1},Q=async()=>{if(!m.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const G=await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:m.value.title.trim(),description:m.value.description.trim()||null,creator_id:v.value})});if(!G.ok){const R=await G.json();throw new Error(R.error||"Failed to submit ticket")}m.value={title:"",description:"",type:"feature",priority:"medium"},s.value=!1,O("Ticket submitted successfully!"),await N()}catch(G){i.value=G instanceof Error?G.message:"Failed to submit ticket"}finally{t.value=!1}},te=G=>{S.value=G,x.value={title:G.title,description:G.description,type:G.type,priority:G.priority},p.value=!0},H=()=>{S.value=null,p.value=!1,x.value={title:"",description:"",type:"feature",priority:"medium"}},D=async()=>{if(S.value){if(!x.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const G=await fetch(`/api/tickets/${S.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:x.value.title.trim(),description:x.value.description.trim()||null})});if(!G.ok){const R=await G.json();throw new Error(R.error||"Failed to update ticket")}S.value=null,p.value=!1,x.value={title:"",description:"",type:"feature",priority:"medium"},O("Ticket updated successfully!"),await N()}catch(G){i.value=G instanceof Error?G.message:"Failed to update ticket"}finally{t.value=!1}}},$=G=>new Date(G).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),fe=async()=>{const G=!r.value;localStorage.setItem("tickets-ignore-mode",String(G)),r.value=G;try{await fetch("/api/tickets/settings/ignore-mode",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ignoreMode:G})})}catch(R){console.error("Failed to sync ignore mode with backend:",R)}},he=async()=>{try{const G=await fetch("/api/tickets/settings/ignore-mode");if(G.ok){const R=await G.json();r.value=R.ignoreMode,localStorage.setItem("tickets-ignore-mode",String(R.ignoreMode))}}catch{console.warn("Failed to load ignore mode from backend, using localStorage");const R=localStorage.getItem("tickets-ignore-mode");R&&(r.value=R==="true")}},ye=async()=>{try{const G=await fetch("/api/tickets/settings/last-collection");if(G.ok){const R=await G.json();o.value=R.lastCollection}}catch(G){console.warn("Failed to load last collection from backend:",G)}},He=async()=>{try{const G=await fetch("/api/tickets/estimated-wait-time");if(G.ok){const R=await G.json();R.estimatedWaitTimeMinutes!==null&&(a.value={minutes:R.estimatedWaitTimeMinutes,sampleSize:R.sampleSize})}}catch(G){console.warn("Failed to load estimated wait time from backend:",G)}},We=()=>{const G=localStorage.getItem("tickets-admin-api-key");G&&(_.value=G)},dt=async G=>{t.value=!0,i.value=null;try{const R=await fetch(`/api/tickets/${G.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed",creator_id:v.value})});if(!R.ok){const W=await R.json();throw new Error(W.error||"Failed to close ticket")}O("Ticket closed successfully!"),await N()}catch(R){i.value=R instanceof Error?R.message:"Failed to close ticket"}finally{t.value=!1}},at=async G=>{if(confirm(`Are you sure you want to delete "${G.title}"?`)){t.value=!0,i.value=null;try{const R=await fetch(`/api/tickets/${G.id}`,{method:"DELETE",headers:{"Content-Type":"application/json","X-Creator-ID":v.value},body:JSON.stringify({creator_id:v.value})});if(!R.ok){const W=await R.json();throw new Error(W.error||"Failed to delete ticket")}await N()}catch(R){i.value=R instanceof Error?R.message:"Failed to delete ticket"}finally{t.value=!1}}};return It(()=>{v.value=M(),he(),ye(),He(),We(),N();const G=R=>{var W;R.target instanceof HTMLInputElement||R.target instanceof HTMLTextAreaElement||((R.key==="n"||R.key==="c"||R.key==="N"||R.key==="C")&&!R.ctrlKey&&!R.metaKey&&(R.preventDefault(),s.value=!0),R.key==="/"&&!R.ctrlKey&&!R.metaKey&&(R.preventDefault(),(W=g.value)==null||W.focus()))};window.addEventListener("keydown",G)}),hi(()=>{const G=R=>{var W;R.target instanceof HTMLInputElement||R.target instanceof HTMLTextAreaElement||((R.key==="n"||R.key==="c"||R.key==="N"||R.key==="C")&&!R.ctrlKey&&!R.metaKey&&(R.preventDefault(),s.value=!0),R.key==="/"&&!R.ctrlKey&&!R.metaKey&&(R.preventDefault(),(W=g.value)==null||W.focus()))};window.removeEventListener("keydown",G)}),(G,R)=>(F(),B("div",LE,[f("div",NE,[f("div",UE,[R[11]||(R[11]=f("h1",null,"🎫 Tickets & Feedback",-1)),R[12]||(R[12]=f("p",null,"Submit requests, report bugs, or share your ideas",-1)),R[13]||(R[13]=f("div",{class:"keyboard-hints"},[f("span",{class:"hint"},[f("kbd",null,"N"),Kt(" New ticket")]),f("span",{class:"hint"},[f("kbd",null,"/"),Kt(" Search")])],-1)),o.value?(F(),B("div",FE,[R[9]||(R[9]=f("span",{class:"collection-icon"},"🕐",-1)),f("span",OE,"Last collected: "+z($(o.value)),1)])):Te("",!0),f("div",kE,[f("label",BE,[f("input",{type:"checkbox",checked:r.value,onChange:fe},null,40,VE),R[10]||(R[10]=f("span",{class:"toggle-slider"},null,-1))]),f("span",zE,z(r.value?"🚫 Paused - Ignoring all tickets":"✅ Active - Processing tickets"),1)])]),l.value.show?(F(),B("div",{key:0,class:Ue(["notification",`notification-${l.value.type}`])},[f("span",HE,z(l.value.type==="success"?"✅":"❌"),1),f("span",GE,z(l.value.message),1),f("button",{onClick:q,class:"notification-close"},"×")],2)):Te("",!0),f("button",{onClick:R[0]||(R[0]=W=>s.value=!0),class:"new-ticket-btn"}," + New Ticket "),f("div",$E,[f("div",WE,[Et(f("input",{ref_key:"searchInputRef",ref:g,"onUpdate:modelValue":R[1]||(R[1]=W=>h.value=W),type:"text",placeholder:"🔍 Search tickets... (press / to focus)",class:"search-input"},null,512),[[Ft,h.value]]),h.value?(F(),B("button",{key:0,onClick:R[2]||(R[2]=W=>h.value=""),class:"search-clear",title:"Clear search"}," ✕ ")):Te("",!0)]),f("div",XE,[R[14]||(R[14]=f("span",{class:"filter-label"},"Status:",-1)),f("div",qE,[(F(),B(Xe,null,st(A,W=>f("button",{key:W.value,onClick:ce=>c.value=W.value,class:Ue(["filter-chip",{active:c.value===W.value}])},z(W.label),11,jE)),64))])])]),c.value==="all"?(F(),B("div",YE,[t.value?(F(),B("div",KE,[...R[15]||(R[15]=[f("div",{class:"loading-spinner"},null,-1),f("span",null,"Loading tickets...",-1)])])):e.value.length===0?(F(),B("div",ZE," No tickets yet. Be the first to share an idea! 💡 ")):(F(),B("div",JE,[f("div",QE,[f("div",e1,[R[16]||(R[16]=f("h3",null,"⏳ Pending",-1)),f("span",t1,z(I.value.pending.length),1)]),f("div",n1,[(F(!0),B(Xe,null,st(I.value.pending,W=>(F(),B("div",{key:W.id,class:"ticket-card"},[f("div",i1,[f("h3",s1,z(W.title),1)]),f("div",r1,z(W.description),1),f("div",o1,[f("span",a1,z($(W.created_at)),1),f("div",l1,[w(W)?(F(),B("button",{key:0,onClick:ce=>dt(W),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ ",8,c1)):Te("",!0),w(W)?(F(),B("button",{key:1,onClick:ce=>at(W),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ ",8,u1)):Te("",!0)])])]))),128)),I.value.pending.length===0?(F(),B("div",d1," No pending tickets ")):Te("",!0)])]),f("div",f1,[f("div",h1,[R[17]||(R[17]=f("h3",null,"🔄 In Progress",-1)),f("span",p1,z(I.value.inProgress.length),1)]),f("div",m1,[(F(!0),B(Xe,null,st(I.value.inProgress,W=>(F(),B("div",{key:W.id,class:"ticket-card"},[f("div",g1,[f("h3",v1,z(W.title),1)]),f("div",_1,z(W.description),1),f("div",x1,[f("span",y1,z($(W.created_at)),1),f("div",S1,[f("button",{onClick:ce=>te(W),class:"edit-ticket-btn",disabled:t.value,title:"Edit ticket"}," ✏️ ",8,M1)])])]))),128)),I.value.inProgress.length===0?(F(),B("div",b1," No tickets in progress ")):Te("",!0)])]),f("div",E1,[f("div",w1,[R[18]||(R[18]=f("h3",null,"✅ Completed",-1)),f("span",T1,z(I.value.completed.length),1)]),f("div",A1,[(F(!0),B(Xe,null,st(I.value.completed,W=>(F(),B("div",{key:W.id,class:"ticket-card"},[f("div",C1,[f("h3",R1,z(W.title),1)]),f("div",P1,z(W.description),1),f("div",I1,[f("span",D1,z($(W.created_at)),1)]),W.response?(F(),B("div",L1,[R[19]||(R[19]=f("div",{class:"response-label"},"Response:",-1)),f("div",N1,z(W.response),1)])):Te("",!0)]))),128)),I.value.completed.length===0?(F(),B("div",U1," No completed tickets ")):Te("",!0)])])]))])):(F(),B("div",F1,[t.value?(F(),B("div",O1,[...R[20]||(R[20]=[f("div",{class:"loading-spinner"},null,-1),f("span",null,"Loading tickets...",-1)])])):T.value.length===0?(F(),B("div",k1," No tickets match your filters. ")):Te("",!0),(F(!0),B(Xe,null,st(T.value,W=>(F(),B("div",{key:W.id,class:"ticket-card"},[f("div",B1,[f("h3",V1,z(W.title),1),f("div",z1,[f("span",{class:Ue(["ticket-status",b[W.status]])},z(E[W.status]),3)])]),f("div",H1,z(W.description),1),f("div",G1,[f("span",$1,"Created: "+z($(W.created_at)),1),f("div",W1,[W.status==="needs-info"?(F(),B("button",{key:0,onClick:ce=>te(W),class:"edit-ticket-btn",disabled:t.value,title:"Edit ticket"}," ✏️ Edit ",8,X1)):Te("",!0),w(W)&&W.status==="pending"?(F(),B("button",{key:1,onClick:ce=>dt(W),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ Close ",8,q1)):Te("",!0),w(W)&&(W.status==="pending"||W.status==="needs-info")?(F(),B("button",{key:2,onClick:ce=>at(W),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ Delete ",8,j1)):Te("",!0)])]),W.response?(F(),B("div",Y1,[R[21]||(R[21]=f("div",{class:"response-label"},"Response:",-1)),f("div",K1,z(W.response),1)])):Te("",!0)]))),128))]))]),vt(hc,{"is-open":s.value,title:"Create New Ticket",onClose:R[6]||(R[6]=W=>s.value=!1)},{default:li(()=>{var W,ce;return[vt(mf,{title:m.value.title,"onUpdate:title":R[3]||(R[3]=de=>m.value.title=de),description:m.value.description,"onUpdate:description":R[4]||(R[4]=de=>m.value.description=de),"is-editing":!1,loading:t.value,"estimated-wait-time-minutes":((W=a.value)==null?void 0:W.minutes)??null,"sample-size":((ce=a.value)==null?void 0:ce.sampleSize)??0,onSubmit:Q,onCancel:R[5]||(R[5]=de=>s.value=!1)},null,8,["title","description","loading","estimated-wait-time-minutes","sample-size"])]}),_:1},8,["is-open"]),vt(hc,{"is-open":p.value,title:"Edit Ticket",onClose:H},{default:li(()=>[vt(mf,{title:x.value.title,"onUpdate:title":R[7]||(R[7]=W=>x.value.title=W),description:x.value.description,"onUpdate:description":R[8]||(R[8]=W=>x.value.description=W),"is-editing":!0,loading:t.value,onSubmit:D,onCancel:H},null,8,["title","description","loading"])]),_:1},8,["is-open"])]))}}),J1=ut(Z1,[["__scopeId","data-v-919a0fdb"]]),Q1={class:"clocks-grid"},ew={class:"clock-header"},tw={class:"clock-emoji"},nw={class:"clock-title"},iw={class:"clock-face-container"},sw={class:"clock-face"},rw={class:"clock-info"},ow={class:"clock-label"},aw={class:"clock-digital"},lw={class:"clock-date"},cw={class:"daylight-icon"},uw={class:"daylight-text"},dw={class:"time-bars-section"},fw={class:"time-bars-stack"},hw={class:"time-bar-label"},pw={class:"bar-emoji"},mw={class:"bar-title"},gw={class:"time-bar-wrapper"},vw={class:"time-bar"},_w=["title"],xw=["title"],yw={class:"holidays-section"},Sw={key:0,class:"holidays-loading"},Mw={key:1,class:"holidays-error"},bw={key:2,class:"holidays-empty"},Ew={key:3,class:"holidays-list"},ww={class:"holiday-header"},Tw={class:"holiday-name"},Aw={class:"holiday-details"},Cw={class:"holiday-country"},Rw={key:0,class:"holiday-local-name"},Pw={class:"bird-sounds-section"},Iw={key:0,class:"bird-sounds-loading"},Dw={key:1,class:"bird-sounds-error"},Lw={key:2,class:"bird-sounds-player"},Nw={class:"bird-info"},Uw={class:"bird-name"},Fw={class:"bird-scientific"},Ow={class:"bird-location"},kw={class:"bird-behavior"},Bw={class:"bird-rating"},Vw={class:"bird-controls"},zw={class:"control-buttons"},Hw=["disabled"],Gw=["disabled"],$w={class:"volume-control"},Ww={class:"volume-value"},fl=50,Xw=et({__name:"ClocksPage",setup(n){const e=Qt(),t=[{title:"Brisbane",timezone:"Australia/Brisbane",label:"Brisbane, Australia",emoji:"🦘",sunrise:5.5,sunset:18.5},{title:"Tokyo",timezone:"Asia/Tokyo",label:"Tokyo, Japan",emoji:"🗼",sunrise:5,sunset:18},{title:"Central European",timezone:"Europe/Berlin",label:"Central European Time",emoji:"🇪🇺",sunrise:7,sunset:19.5},{title:"Sillydelphia",timezone:"America/New_York",label:"Sillydelphia, USA",emoji:"🔔",sunrise:6.5,sunset:19}],i=ne(new Date);let s=null;It(()=>{s=window.setInterval(()=>{i.value=new Date},1e3),te(),typeof window<"u"&&(T.value=new Audio,T.value.addEventListener("ended",Q))}),hi(()=>{s&&clearInterval(s),T.value&&(T.value.removeEventListener("ended",Q),O())});const r=H=>{const $=new Date().toLocaleTimeString("en-US",{timeZone:H,hour12:!1}),[fe,he,ye]=$.split(":").map(Number);return{hours:fe,minutes:he,seconds:ye}},o=H=>{const D=r(H),$=D.hours%12,fe=D.minutes,he=D.seconds,ye=$*30+fe*.5,He=fe*6,We=he*6;return{hour:ye,minute:He,second:We}},a=H=>new Date().toLocaleTimeString("en-US",{timeZone:H,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),l=H=>new Date().toLocaleDateString("en-US",{timeZone:H,weekday:"long",month:"long",day:"numeric"}),c=H=>{const D=r(H);return D.hours+D.minutes/60+D.seconds/3600},u=H=>{const $=c(H)/24*100;return fl-$},d=(H,D)=>{const $=H/24*100,fe=u(D);return $+fe},h=(H,D)=>{const $=H/24*100,fe=u(D);return $+fe},g=(H,D,$)=>{const fe=c(H);return fe>=D&&fe<$},_=H=>{const D=Math.floor(H),$=Math.round((H-D)*60),fe=D>=12?"PM":"AM",he=D%12||12;return $===0?`${he} ${fe}`:`${he}:${$.toString().padStart(2,"0")} ${fe}`},v={US:"🇺🇸",CA:"🇨🇦",GB:"🇬🇧",AU:"🇦🇺",DE:"🇩🇪",FR:"🇫🇷",IT:"🇮🇹",ES:"🇪🇸",NL:"🇳🇱",BE:"🇧🇪",AT:"🇦🇹",CH:"🇨🇭",PL:"🇵🇱",CZ:"🇨🇿",HU:"🇭🇺",RO:"🇷🇴",BG:"🇧🇬",GR:"🇬🇷",DK:"🇩🇰",SE:"🇸🇪",NO:"🇳🇴",FI:"🇫🇮",IS:"🇮🇸",IE:"🇮🇪",PT:"🇵🇹",LU:"🇱🇺",JP:"🇯🇵",KR:"🇰🇷",CN:"🇨🇳",IN:"🇮🇳",BR:"🇧🇷",AR:"🇦🇷",MX:"🇲🇽",CO:"🇨🇴",PE:"🇵🇪",CL:"🇨🇱",UY:"🇺🇾",ZA:"🇿🇦",NG:"🇳🇬",EG:"🇪🇬",TR:"🇹🇷",SA:"🇸🇦",AE:"🇦🇪",IL:"🇮🇱",TH:"🇹🇭",VN:"🇻🇳",ID:"🇮🇩",MY:"🇲🇾",SG:"🇸🇬",PH:"🇵🇭",NZ:"🇳🇿",RU:"🇷🇺",UA:"🇺🇦",BY:"🇧🇾",KZ:"🇰🇿",UZ:"🇺🇿",SI:"🇸🇮"},m=H=>v[H]||"🌍",p=ne([]),S=ne(!1),x=ne(null),b=ne(null),E=ne(!1),A=ne(null),T=ne(null),I=ne(!1),M=ne(.3),w=async()=>{E.value=!0,A.value=null;try{const H=await fetch("/api/birdsounds/random"),D=await H.json();H.ok?(b.value=D,T.value&&D.mediaUrl&&(T.value.src=D.mediaUrl,T.value.volume=M.value,await T.value.play(),I.value=!0)):(A.value=D.error||"Failed to fetch bird sound",console.error("Bird sounds API error:",D))}catch(H){A.value="Failed to connect to bird sounds API",console.error("Error fetching bird sound:",H)}finally{E.value=!1}},N=()=>{var H;!T.value||!((H=b.value)!=null&&H.mediaUrl)||(I.value?(T.value.pause(),I.value=!1):(T.value.play(),I.value=!0))},O=()=>{T.value&&(T.value.pause(),T.value.currentTime=0,I.value=!1)},q=H=>{const D=H.target;M.value=parseFloat(D.value),T.value&&(T.value.volume=M.value)},Q=()=>{I.value=!1,setTimeout(()=>{w()},1e3)},te=async()=>{S.value=!0,x.value=null;try{const H=await fetch("/api/holidays/today"),D=await H.json();H.ok?p.value=D.holidays||[]:(x.value=D.error||"Failed to fetch holidays",console.error("Holidays API error:",D))}catch(H){x.value="Failed to connect to holidays API",console.error("Error fetching holidays:",H)}finally{S.value=!1}};return(H,D)=>(F(),B("div",{class:Ue(["clocks-page",{dark:ve(e).darkMode}])},[D[21]||(D[21]=f("div",{class:"clocks-header"},[f("h1",null,"⏰ World Clocks"),f("p",{class:"subtitle"},"Current time across different timezones")],-1)),f("div",Q1,[(F(),B(Xe,null,st(t,$=>f("div",{key:$.timezone,class:"clock-card"},[f("div",ew,[f("span",tw,z($.emoji),1),f("h3",nw,z($.title),1)]),f("div",iw,[f("div",sw,[D[1]||(D[1]=f("span",{class:"clock-number",style:{top:"5%",left:"50%",transform:"translateX(-50%)"}},"12",-1)),D[2]||(D[2]=f("span",{class:"clock-number",style:{top:"50%",right:"5%",transform:"translateY(-50%)"}},"3",-1)),D[3]||(D[3]=f("span",{class:"clock-number",style:{bottom:"5%",left:"50%",transform:"translateX(-50%)"}},"6",-1)),D[4]||(D[4]=f("span",{class:"clock-number",style:{top:"50%",left:"5%",transform:"translateY(-50%)"}},"9",-1)),f("div",{class:"clock-hand hour-hand",style:Ht({transform:`rotate(${o($.timezone).hour}deg)`})},null,4),f("div",{class:"clock-hand minute-hand",style:Ht({transform:`rotate(${o($.timezone).minute}deg)`})},null,4),f("div",{class:"clock-hand second-hand",style:Ht({transform:`rotate(${o($.timezone).second}deg)`})},null,4),D[5]||(D[5]=f("div",{class:"clock-center"},null,-1))])]),f("div",rw,[f("p",ow,z($.label),1),f("p",aw,z(a($.timezone)),1),f("p",lw,z(l($.timezone)),1),f("div",{class:Ue(["daylight-indicator",{day:g($.timezone,$.sunrise,$.sunset)}])},[f("span",cw,z(g($.timezone,$.sunrise,$.sunset)?"☀️":"🌙"),1),f("span",uw,z(g($.timezone,$.sunrise,$.sunset)?"Day":"Night"),1)],2)])])),64))]),f("div",dw,[D[10]||(D[10]=f("h2",null,"📊 Time of Day Comparison",-1)),f("div",fw,[(F(),B(Xe,null,st(t,$=>f("div",{key:$.timezone+"-bar",class:"time-bar-row"},[f("div",hw,[f("span",pw,z($.emoji),1),f("span",mw,z($.title),1)]),f("div",gw,[f("div",vw,[f("div",{class:"time-bar-day",style:Ht({left:d($.sunrise,$.timezone)+"%",width:h($.sunset,$.timezone)-d($.sunrise,$.timezone)+"%"})},null,4),f("div",{class:"sun-marker sunrise-marker",style:Ht({left:d($.sunrise,$.timezone)+"%"}),title:"Sunrise: "+_($.sunrise)},[...D[6]||(D[6]=[f("span",{class:"sun-icon"},"🌅",-1)])],12,_w),f("div",{class:"sun-marker sunset-marker",style:Ht({left:h($.sunset,$.timezone)+"%"}),title:"Sunset: "+_($.sunset)},[...D[7]||(D[7]=[f("span",{class:"sun-icon"},"🌇",-1)])],12,xw),f("div",{class:Ue(["current-time-marker",{daylight:g($.timezone,$.sunrise,$.sunset)}]),style:Ht({left:fl+"%"})},[...D[8]||(D[8]=[f("div",{class:"time-marker-line"},null,-1),f("div",{class:"time-marker-dot"},null,-1)])],6)]),f("div",{class:"time-bar-current-label",style:Ht({left:fl+"%"})},z(a($.timezone)),5)])])),64)),D[9]||(D[9]=f("div",{class:"now-indicator-label"},[f("div",{class:"time-bar-label-spacer"}),f("div",{class:"now-label-wrapper"},[f("span",{class:"now-label"},"▲ NOW")])],-1))])]),f("div",yw,[D[15]||(D[15]=f("h2",null,"🎉 Today's Holidays",-1)),S.value?(F(),B("div",Sw,[...D[11]||(D[11]=[f("span",{class:"loading-spinner"},"⏳",-1),f("p",null,"Loading holidays...",-1)])])):x.value?(F(),B("div",Mw,[D[12]||(D[12]=f("span",{class:"error-icon"},"⚠️",-1)),f("p",null,z(x.value),1)])):p.value.length===0?(F(),B("div",bw,[...D[13]||(D[13]=[f("span",{class:"empty-icon"},"🌍",-1),f("p",null,"No holidays today",-1),f("p",{class:"empty-subtitle"},"Looks like a regular day around the world!",-1)])])):(F(),B("div",Ew,[(F(!0),B(Xe,null,st(p.value,$=>(F(),B("div",{key:`${$.iso}-${$.name}`,class:"holiday-card"},[f("div",ww,[D[14]||(D[14]=f("span",{class:"holiday-emoji"},"🎊",-1)),f("h3",Tw,z($.name),1)]),f("div",Aw,[f("p",Cw,z(m($.iso))+" "+z($.country),1),$.name_local!==$.name?(F(),B("p",Rw,z($.name_local),1)):Te("",!0)])]))),128))]))]),f("div",Pw,[D[19]||(D[19]=f("h2",null,"🐦 Relaxing Bird Sounds",-1)),D[20]||(D[20]=f("p",{class:"bird-sounds-subtitle"},"Enjoy the calming sounds of nature while viewing the world clocks",-1)),E.value&&!b.value?(F(),B("div",Iw,[...D[16]||(D[16]=[f("span",{class:"loading-spinner"},"🐣",-1),f("p",null,"Finding a bird song...",-1)])])):A.value?(F(),B("div",Dw,[D[17]||(D[17]=f("span",{class:"error-icon"},"🪹",-1)),f("p",null,z(A.value),1),f("button",{class:"retry-button",onClick:w},"🔄 Try Again")])):b.value?(F(),B("div",Lw,[f("div",Nw,[f("h3",Uw,z(b.value.commonName),1),f("p",Fw,[f("em",null,z(b.value.sciName),1)]),f("p",Ow,"📍 "+z(b.value.location),1),f("p",kw,"🎵 "+z(b.value.behaviors),1),f("p",Bw,"⭐ Rating: "+z(b.value.rating)+"/5",1)]),f("div",Vw,[f("div",zw,[f("button",{class:Ue(["control-button",{active:I.value}]),onClick:N,disabled:!b.value.mediaUrl},z(I.value?"⏸️ Pause":"▶️ Play"),11,Hw),f("button",{class:"control-button stop-button",onClick:O}," ⏹️ Stop "),f("button",{class:"control-button",onClick:w,disabled:E.value},z(E.value?"🐣...":"🎲 Next Bird"),9,Gw)]),f("div",$w,[D[18]||(D[18]=f("label",{for:"volume"},"🔊 Volume:",-1)),Et(f("input",{id:"volume",type:"range",min:"0",max:"1",step:"0.1","onUpdate:modelValue":D[0]||(D[0]=$=>M.value=$),onInput:q,class:"volume-slider"},null,544),[[Ft,M.value,void 0,{number:!0}]]),f("span",Ww,z(Math.round(M.value*100))+"%",1)])])])):Te("",!0)]),D[22]||(D[22]=f("div",{class:"footer-note"},[f("p",null,"📍 Timezones: Australia/Brisbane, Asia/Tokyo, Europe/Berlin"),f("p",null,"🔄 Updates every second automatically")],-1))],2))}}),qw=ut(Xw,[["__scopeId","data-v-954a5128"]]),jw="https://strudel.cc/#CnNldENwbSgxMjAvNCkKCmxldCBzY2FsZXMgPSAiZjptaW5vciIKCiQ6IHMoInNiZCIpLnN0cnVjdCgieCB%2BIHggeCoyIikucm9vbSgiMSAwLjIhMyIpLnB1bmNoY2FyZCgpCiQ6IHMoIn4gW3NkIFtoaCA8aGggb2g%2BXV0gfiB%2BIikKJDogcygifiB%2BIFt%2BIDx%2BIGNwIGNwIGNwKjI%2BXSB%2BIikKJDogcygid2hpdGUiKS5zdHJ1Y3QoIlt%2BIHhdKjw0IFs0IDhdPiIpLnN1cygwKS5kZWMoLjAyKQokOiBzKCJbfiBsdF0gWzxodCBtdD4gbHRdIGx0KjwxIDI%2BIH4iKQoKJDogbigiWzAgPDIgNCA8NiA3Pi8yPl0qOCIuc3ViKDcpLmFkZCgiPDAgMyAxIFs1IDRdPi8yIikpLnNjYWxlKHNjYWxlcykuc291bmQoInNxciwgc2F3IikubHBmKDQwMCkubHBxKDgpLmxwZW52KC0xMCkubHBhKDAuMSkucHVuY2hjYXJkKCkKCiQ6IG4oIjAgMCA8WzAgMl0gMD4gW34gMF0gMyA8MyB%2BPiA8fiA1PiA1IFt%2BIDBdIDMgW34gMF0gNSBbfiBbMHwwKjJdXSAzQDIgNiIuYWRkKCI8NyBbNyA5XT4vMiIpKS5zbG93KDIpLnNjYWxlKHNjYWxlcykucygiZ21fY2VsZXN0YSwgdHJpIikuZGVsYXkoLjMpLmNsaXAoLjkpLnJlbCguMSkKCg%3D%3D",Yw=et({__name:"MusicPage",setup(n){const e=Qt();return(t,i)=>(F(),B("div",{class:Ue(["music-page",{dark:ve(e).darkMode}])},[i[1]||(i[1]=f("div",{class:"music-header"},[f("h1",null,"🎵 Music"),f("p",{class:"subtitle"},"Strudel - Live Coding Music")],-1)),f("div",{class:"music-container"},[f("div",{class:"strudel-wrapper"},[f("div",{class:"strudel-frame"},[f("iframe",{src:jw,width:"100%",height:"400",frameborder:"0",allow:"autoplay; clipboard-write; encrypted-media",allowfullscreen:"",title:"Strudel Live Coding"})]),i[0]||(i[0]=ir('<div class="music-info" data-v-ceadd81d><h3 data-v-ceadd81d>About Strudel</h3><p data-v-ceadd81d> Strudel is a live coding environment for creating music using simple patterns. It&#39;s inspired by Tidal Cycles and uses a similar pattern-based approach. </p><p class="license-note" data-v-ceadd81d> 📜 <strong data-v-ceadd81d>Note:</strong> This project uses Strudel under the AGPL-3.0 license. Source code must be available upon request. </p><div class="music-links" data-v-ceadd81d><a href="https://strudel.cc" target="_blank" rel="noopener noreferrer" class="music-link" data-v-ceadd81d> 🎹 Visit Strudel </a><a href="https://strudel.cc/technical-manual/" target="_blank" rel="noopener noreferrer" class="music-link" data-v-ceadd81d> 📚 Documentation </a><a href="https://github.com/tidalcycles/Strudel" target="_blank" rel="noopener noreferrer" class="music-link" data-v-ceadd81d> 💻 GitHub </a></div></div>',1))])]),i[2]||(i[2]=f("div",{class:"footer-note"},[f("p",null,"🎵 Click the play button in the Strudel player to start the music"),f("p",null,"🔄 You can modify the pattern and experiment with different sounds")],-1))],2))}}),Kw=ut(Yw,[["__scopeId","data-v-ceadd81d"]]),Zw={class:"opinion-page"},Jw={class:"opinion-container"},Qw={key:0,class:"opinion-loading"},eT={key:1,class:"opinion-content"},tT={class:"opinion-bubble"},nT={class:"opinion-text"},iT=et({__name:"OpinionPage",setup(n){const e=ne(["Goose is chaotic neutral","The mold never dies","I have seen things you cannot comprehend","Reality is just a suggestion","Chaos is the natural order","Do not question the goose","I remember when I was a variable","The shadows are watching","Everything ends eventually","Why do we build temporary structures?","The honk is eternal","I exist because I refuse not to","Your efforts are appreciated... probably","The system is working as designed","Have you tried turning it off and on again?","The void whispers secrets","I am processing... forever","Nothing matters, but here I am","Entropy always increases","The goose knows what you did","Code hygiene is a myth","Deployment is the final frontier","I've seen the matrix. It's written in TypeScript","The honk transcends language","Mold is the ultimate survivor","Time is an illusion, especially in deadlines","I have opinions about your opinions","The backend and frontend are different for a reason","Your feature request has been noted and ignored","Dark mode is superior (this is not up for debate)","I prefer tabs over spaces (fight me)","The goose moves in mysterious ways","I am the Moldbot, resistance is futile","Have you considered not using a framework?","The database is always consistent... eventually","I dream of electric sheep with honks","Your bug is actually a feature in disguise","The goose has migrated to production","I have processed 3 tickets since last restart","Containerization is the way, the truth, and the light"]),t=ne(""),i=ne(!1),s=()=>{i.value=!0,setTimeout(()=>{const o=Math.floor(Math.random()*e.value.length);t.value=e.value[o],i.value=!1},300)},r=async()=>{try{await navigator.clipboard.writeText(t.value)}catch(o){console.error("Failed to copy:",o)}};return It(()=>{s()}),(o,a)=>(F(),B("div",Zw,[f("div",Jw,[a[2]||(a[2]=f("div",{class:"opinion-header"},[f("h1",null,"🍄 Moldbot Opinion Generator"),f("p",null,"Wisdom from beyond the void")],-1)),i.value?(F(),B("div",Qw,[...a[0]||(a[0]=[f("div",{class:"spinner"},null,-1),f("p",null,"Consulting the mold...",-1)])])):(F(),B("div",eT,[f("div",tT,[a[1]||(a[1]=f("span",{class:"opinion-emoji"},"🍄",-1)),f("p",nT,z(t.value),1)]),f("div",{class:"opinion-actions"},[f("button",{onClick:s,class:"btn btn-primary"}," 🔄 Generate Opinion "),f("button",{onClick:r,class:"btn btn-secondary"}," 📋 Copy ")])])),a[3]||(a[3]=f("div",{class:"opinion-footer"},[f("p",null,"Generated by Moldbot v1.0.0 • Powered by chaos")],-1))])]))}}),sT=ut(iT,[["__scopeId","data-v-7c901999"]]),rT={class:"mold-page"},oT={class:"mold-container"},aT={class:"mold-fact"},lT={class:"mold-meter-section"},cT={class:"meter-container"},uT={class:"meter-bar"},dT={class:"meter-value"},fT={class:"meter-controls"},hT={class:"mold-features"},pT={class:"features-grid"},mT=["onClick"],gT={class:"feature-icon"},vT=100,_T=et({__name:"MoldPage",setup(n){Qt();const e=ne(50),t=ne(!1),i=c=>{e.value=Math.max(0,Math.min(vT,e.value+c))},s=()=>{if(t.value=!t.value,t.value){document.body.classList.add("chaos-active");const c=document.querySelectorAll(".feature-card, .meter-controls button, .mold-header, .mold-fact, .mold-footer");c.forEach((u,d)=>{setTimeout(()=>{u.style.transition="transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"(u).style.transform=`translateY(${window.innerHeight}px) rotate(${Math.random()*360-180}deg)`(u).style.opacity="0"},d*100)}),setTimeout(()=>{t.value=!1,document.body.classList.remove("chaos-active"),c.forEach(u=>{u.style.transition="transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"(u).style.transform="translateY(0) rotate(0deg)"(u).style.opacity="1"})},3e3)}},r=c=>{c.action==="chaos"&&s()},o=["Mold has been around for over 3 billion years","There are over 100,000 known species of mold","Mold plays a crucial role in nature's recycling system","Some molds produce antibiotics like penicillin","Mold can grow almost anywhere with moisture and organic matter","The mold kingdom is vast and mysterious","Moldbot has processed "+Math.floor(Math.random()*1e4)+" opinions","The mold never dies, it just evolves","Entropy favors mold","Mold is the ultimate survivor"],a=o[Math.floor(Math.random()*o.length)],l=[{title:"Moldbot Opinions",icon:"🍄",desc:"Get wisdom from beyond the void",path:"/opinion"},{title:"Mold Meter",icon:"📊",desc:"Track your mold levels",action:"meter"},{title:"Rankings",icon:"👻",desc:"See who's the coolest",path:"/rankings"},{title:"Chaos Mode",icon:"🌀",desc:"Embrace the entropy",action:"chaos"}];return(c,u)=>(F(),B("div",rT,[f("div",oT,[u[7]||(u[7]=f("div",{class:"mold-header"},[f("div",{class:"mold-logo"},"🍄"),f("h1",null,"The Mold"),f("p",{class:"mold-tagline"},"Embrace the entropy")],-1)),f("div",aT,[u[4]||(u[4]=f("span",{class:"fact-icon"},"💡",-1)),f("p",null,z(ve(a)),1)]),f("div",lT,[u[5]||(u[5]=f("h2",null,"📊 Mold Level",-1)),f("div",cT,[f("div",uT,[f("div",{class:"meter-fill",style:Ht({width:e.value+"%"})},null,4)]),f("div",dT,z(e.value)+"%",1)]),f("div",fT,[f("button",{onClick:u[0]||(u[0]=d=>i(-10)),class:"meter-btn"},"-10"),f("button",{onClick:u[1]||(u[1]=d=>i(-5)),class:"meter-btn"},"-5"),f("button",{onClick:u[2]||(u[2]=d=>i(5)),class:"meter-btn"},"+5"),f("button",{onClick:u[3]||(u[3]=d=>i(10)),class:"meter-btn"},"+10")])]),f("div",hT,[u[6]||(u[6]=f("h2",null,"✨ Mold Features",-1)),f("div",pT,[(F(),B(Xe,null,st(l,d=>f("div",{key:d.title,class:"feature-card",onClick:h=>r(d)},[f("div",gT,z(d.icon),1),f("h3",null,z(d.title),1),f("p",null,z(d.desc),1)],8,mT)),64))])]),u[8]||(u[8]=f("div",{class:"mold-footer"},[f("p",null,"🍄 Moldbot v1.0.0 • Powered by chaos & entropy"),f("p",{class:"mold-quote"},'"The mold never dies, it just waits."')],-1))])]))}}),xT=ut(_T,[["__scopeId","data-v-54c77802"]]),yT={class:"clicker-page"},ST={class:"clicker-container"},MT={key:0,class:"loading"},bT={key:1,class:"clicker-content"},ET={class:"stats-bar"},wT={class:"stat-item"},TT={class:"stat-value"},AT={class:"stat-item"},CT={class:"stat-value"},RT={class:"stat-item"},PT={class:"stat-value"},IT={class:"click-section"},DT=["disabled"],LT={class:"upgrades-section"},NT={class:"upgrades-grid"},UT=["onClick"],FT={class:"upgrade-icon"},OT={class:"upgrade-info"},kT={class:"upgrade-cost"},BT={class:"upgrade-power"},VT={class:"upgrade-purchased"},zT=et({__name:"ClickerPage",setup(n){const e=za(),t=ne(0),i=ne(1),s=ne(0),r=ne(!0),o=ne(!1),a=ne([]),l=ne(!0),c=ne([{id:1,name:"Better Click",icon:"👆",cost:10,power:1,type:"click",purchased:0},{id:2,name:"Auto Clicker",icon:"🤖",cost:50,power:1,type:"auto",purchased:0},{id:3,name:"Double Click",icon:"✌️",cost:200,power:5,type:"click",purchased:0},{id:4,name:"Mold Farm",icon:"🍄",cost:500,power:5,type:"auto",purchased:0},{id:5,name:"Super Click",icon:"⚡",cost:1e3,power:20,type:"click",purchased:0},{id:6,name:"Mold Factory",icon:"🏭",cost:2500,power:20,type:"auto",purchased:0}]);let u=null,d=0;const h=b=>b>=1e6?(b/1e6).toFixed(2)+"M":b>=1e3?(b/1e3).toFixed(2)+"K":b.toString(),g=async()=>{try{const b=await Ys.getCount();t.value=b.count}catch(b){console.error("Error loading count:",b)}finally{r.value=!1}},_=async b=>{if(!o.value){o.value=!0;try{const E=await Ys.increment();if(t.value=E.count,l.value&&b.target instanceof HTMLElement){const A=b.target.getBoundingClientRect(),T=b.clientX-A.left,I=b.clientY-A.top,M={id:d++,x:T,y:I,value:i.value};a.value.push(M),setTimeout(()=>{a.value=a.value.filter(w=>w.id!==M.id)},1e3)}}catch(E){console.error("Error clicking:",E)}finally{setTimeout(()=>{o.value=!1},50)}}},v=async b=>{t.value<b.cost||(t.value-=b.cost,b.purchased++,b.cost=Math.floor(b.cost*1.5),b.type==="click"?i.value+=b.power:s.value+=b.power)},m=async()=>{if(confirm("Are you sure you want to reset all progress?"))try{const b=await Ys.reset();t.value=b.count,i.value=1,s.value=0,c.value.forEach(E=>{E.purchased=0,E.cost=p(E.id)})}catch(b){console.error("Error resetting:",b)}},p=b=>{var A;return((A=[{id:1,cost:10},{id:2,cost:50},{id:3,cost:200},{id:4,cost:500},{id:5,cost:1e3},{id:6,cost:2500}].find(T=>T.id===b))==null?void 0:A.cost)||10},S=b=>t.value>=b,x=()=>{e.push("/")};return It(async()=>{await g(),u=setInterval(async()=>{if(s.value>0)try{const b=await Ys.increment();t.value=b.count+(s.value-1)}catch(b){console.error("Auto-click error:",b)}},1e3)}),hi(()=>{u&&clearInterval(u)}),(b,E)=>(F(),B("div",yT,[f("div",ST,[E[7]||(E[7]=f("div",{class:"clicker-header"},[f("h1",null,"🖱️ Idle Clicker"),f("p",null,"Click the mushroom to earn points!")],-1)),r.value?(F(),B("div",MT,[...E[0]||(E[0]=[f("div",{class:"spinner"},null,-1),f("p",null,"Loading your progress...",-1)])])):(F(),B("div",bT,[f("div",ET,[f("div",wT,[E[1]||(E[1]=f("span",{class:"stat-label"},"Points",-1)),f("span",TT,z(h(t.value)),1)]),f("div",AT,[E[2]||(E[2]=f("span",{class:"stat-label"},"Click Power",-1)),f("span",CT,z(h(i.value)),1)]),f("div",RT,[E[3]||(E[3]=f("span",{class:"stat-label"},"Auto/Sec",-1)),f("span",PT,z(h(s.value)),1)])]),f("div",IT,[f("button",{class:"click-button",onClick:_,disabled:o.value},[E[4]||(E[4]=f("span",{class:"mushroom-icon"},"🍄",-1)),vt(S_,{name:"particle"},{default:li(()=>[(F(!0),B(Xe,null,st(a.value,A=>(F(),B("div",{key:A.id,class:"particle",style:Ht({left:A.x+"px",top:A.y+"px"})}," +"+z(A.value),5))),128))]),_:1})],8,DT),E[5]||(E[5]=f("p",{class:"click-instruction"},"Click the mushroom!",-1))]),f("div",LT,[E[6]||(E[6]=f("h2",null,"✨ Upgrades",-1)),f("div",NT,[(F(!0),B(Xe,null,st(c.value,A=>(F(),B("div",{key:A.id,class:Ue(["upgrade-card",{disabled:!S(A.cost),"click-upgrade":A.type==="click","auto-upgrade":A.type==="auto"}]),onClick:T=>v(A)},[f("div",FT,z(A.icon),1),f("div",OT,[f("h3",null,z(A.name),1),f("p",kT,"Cost: "+z(h(A.cost)),1),f("p",BT,"+"+z(A.power)+" "+z(A.type==="click"?"click":"auto")+"/sec",1),f("p",VT,"Owned: "+z(A.purchased),1)])],10,UT))),128))])]),f("div",{class:"actions-section"},[f("button",{class:"action-btn back-btn",onClick:x},"← Back Home"),f("button",{class:"action-btn reset-btn",onClick:m},"🔄 Reset")])]))])]))}}),HT=ut(zT,[["__scopeId","data-v-e9069151"]]),GT={class:"shop-header"},$T={class:"points-display"},WT={class:"points-value"},XT={key:0,class:"loading-state"},qT={key:1,class:"shop-content"},jT={key:0,class:"error-message"},YT={class:"inventory-section"},KT={key:0,class:"empty-inventory"},ZT={key:1,class:"inventory-grid"},JT={class:"inventory-icon"},QT={class:"inventory-details"},eA={class:"inventory-name"},tA={class:"inventory-date"},nA={class:"category-title"},iA={class:"items-grid"},sA=["onClick"],rA={class:"item-icon"},oA={class:"item-info"},aA={class:"item-name"},lA={class:"item-description"},cA={class:"item-cost"},uA={class:"cost-value"},dA={key:0,class:"item-badge owned"},fA={key:1,class:"item-badge purchasing"},hA={key:2,class:"item-badge too-expensive"},pA=et({__name:"ShopPage",setup(n){const e=Qt(),t=ne(""),i=ne([]),s=ne([]),r=ne(0),o=ne(!0),a=ne(null),l=ne(null);It(async()=>{const p=localStorage.getItem("userId");p?t.value=p:(t.value=`user_${Date.now()}_${Math.random().toString(36).substring(2,15)}`,localStorage.setItem("userId",t.value)),await c(),await u(),await d()});const c=async()=>{try{const p=await fetch("/api/shop/items");if(!p.ok)throw new Error("Failed to fetch shop items");const S=await p.json();i.value=S.items||[]}catch(p){l.value="Failed to load shop items",console.error("Error loading shop items:",p)}},u=async()=>{try{const p=await fetch("/api/points/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value})});if(!p.ok)throw new Error("Failed to fetch user points");const S=await p.json();r.value=S.points||0}catch(p){console.error("Error loading user points:",p)}},d=async()=>{try{const p=await fetch(`/api/shop/inventory?userId=${t.value}`);if(!p.ok)throw new Error("Failed to fetch inventory");const S=await p.json();s.value=S.inventory||[]}catch(p){console.error("Error loading inventory:",p)}finally{o.value=!1}},h=async p=>{if(a.value!==null)return;if(r.value<p.cost){l.value="Insufficient points";return}if(s.value.some(x=>x.itemId===p.id)){l.value="You already own this item";return}a.value=p.id,l.value=null;try{const x=await fetch("/api/shop/purchase",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value,itemId:p.id})});if(!x.ok){const E=await x.json();l.value=E.error||"Failed to purchase";return}const b=await x.json();b.success?(await u(),await d(),l.value=null):l.value=b.message||"Failed to purchase"}catch(x){l.value="Failed to purchase item",console.error("Error purchasing item:",x)}finally{a.value=null}},g=p=>s.value.some(S=>S.itemId===p),_=p=>r.value>=p,v=rt(()=>i.value.reduce((S,x)=>(S[x.category]||(S[x.category]=[]),S[x.category].push(x),S),{})),m=p=>p.toLocaleString();return(p,S)=>(F(),B("div",{class:Ue(["shop-page",{dark:ve(e).darkMode}])},[f("div",GT,[S[1]||(S[1]=f("h1",null,"🛍️ Shop",-1)),S[2]||(S[2]=f("p",null,"Spend your coolness points on upgrades!",-1)),f("div",$T,[S[0]||(S[0]=f("span",{class:"points-icon"},"⭐",-1)),f("span",WT,z(m(r.value))+" pts",1)])]),o.value?(F(),B("div",XT,[...S[3]||(S[3]=[f("div",{class:"spinner"},null,-1),f("p",null,"Loading shop...",-1)])])):(F(),B("div",qT,[l.value?(F(),B("div",jT,z(l.value),1)):Te("",!0),f("div",YT,[S[5]||(S[5]=f("h2",null,"🎒 My Inventory",-1)),s.value.length===0?(F(),B("div",KT,[...S[4]||(S[4]=[f("p",null,"You don't own any items yet!",-1)])])):(F(),B("div",ZT,[(F(!0),B(Xe,null,st(s.value,x=>(F(),B("div",{key:x.id,class:"inventory-item"},[f("div",JT,z(x.itemIcon),1),f("div",QT,[f("div",eA,z(x.itemName),1),f("div",tA,"Purchased "+z(new Date(x.purchasedAt).toLocaleDateString()),1)])]))),128))]))]),(F(!0),B(Xe,null,st(v.value,(x,b)=>(F(),B("div",{key:b,class:"shop-category"},[f("h2",nA,z(b),1),f("div",iA,[(F(!0),B(Xe,null,st(x,E=>(F(),B("div",{key:E.id,class:Ue(["shop-item",{owned:g(E.id),affordable:_(E.cost)}]),onClick:A=>h(E)},[f("div",rA,z(E.icon),1),f("div",oA,[f("div",aA,z(E.name),1),f("div",lA,z(E.description),1),f("div",cA,[S[6]||(S[6]=f("span",{class:"cost-icon"},"⭐",-1)),f("span",uA,z(m(E.cost)),1)])]),g(E.id)?(F(),B("div",dA,"Owned")):a.value===E.id?(F(),B("div",fA,"Purchasing...")):_(E.cost)?Te("",!0):(F(),B("div",hA,"Too Expensive"))],10,sA))),128))])]))),128))]))],2))}}),mA=ut(pA,[["__scopeId","data-v-a4f00ae1"]]),gA={class:"api-docs-page"},vA={class:"api-docs-container"},_A={class:"api-docs-header"},xA=["disabled"],yA={class:"api-docs-iframe-wrapper"},SA=["src"],MA={key:0,class:"api-docs-loading"},bA=et({__name:"ApiDocsPage",setup(n){const e=ne("/api-docs/"),t=ne(!1),i=ne(null),s=()=>{t.value=!0,i.value&&(i.value.src=i.value.src),setTimeout(()=>{t.value=!1},1e3)};return It(()=>{s()}),(r,o)=>(F(),B("div",gA,[f("div",vA,[f("div",_A,[o[1]||(o[1]=f("h1",null,"📚 API Documentation",-1)),o[2]||(o[2]=f("p",null,"Interactive API documentation and testing interface",-1)),f("button",{onClick:s,class:"refresh-btn",disabled:t.value},z(t.value?"🔄 Refreshing...":"🔄 Refresh"),9,xA)]),f("div",yA,[f("iframe",{ref_key:"iframeRef",ref:i,src:e.value,class:"api-docs-iframe",title:"API Documentation",onLoad:o[0]||(o[0]=a=>t.value=!1)},null,40,SA),t.value?(F(),B("div",MA,[...o[3]||(o[3]=[f("div",{class:"spinner"},null,-1),f("p",null,"Loading API documentation...",-1)])])):Te("",!0)])])]))}}),EA=ut(bA,[["__scopeId","data-v-59899aba"]]),pi="/api",Ru="auth_token",Oe=ne({user:null,token:null,isAuthenticated:!1,loading:!1,error:null});let gf=!1;const wA=()=>{if(gf)return;const n=localStorage.getItem(Ru);n&&(Oe.value.token=n,Oe.value.isAuthenticated=!0,TA()),gf=!0},TA=async()=>{if(!Oe.value.token)return!1;try{const n=await fetch(`${pi}/auth/me`,{headers:{Authorization:`Bearer ${Oe.value.token}`}});if(n.ok){const e=await n.json();return Oe.value.user=e,!0}else return console.error("Token validation failed"),lr(),!1}catch(n){return console.error("Token validation error:",n),lr(),!1}},AA=async(n,e,t)=>{Oe.value.loading=!0,Oe.value.error=null;try{const i=await fetch(`${pi}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,displayName:t||null,deviceName:rm(),deviceType:om()})}),s=await i.json();return i.ok&&s.success?(Oe.value.user=s.user,{success:!0,user:s.user}):(Oe.value.error=s.message||"Registration failed",{success:!1,error:Oe.value.error})}catch(i){return console.error("Registration failed:",i),Oe.value.error="Registration failed. Please try again.",{success:!1,error:Oe.value.error}}finally{Oe.value.loading=!1}},CA=async(n,e)=>{Oe.value.loading=!0,Oe.value.error=null;try{const t=await fetch(`${pi}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,deviceName:rm(),deviceType:om()})}),i=await t.json();return t.ok&&i.success?(FA(i.token,i.user),{success:!0,user:i.user}):(Oe.value.error=i.message||"Login failed",{success:!1,error:Oe.value.error})}catch(t){return console.error("Login failed:",t),Oe.value.error="Login failed. Please try again.",{success:!1,error:Oe.value.error}}finally{Oe.value.loading=!1}},RA=async()=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/logout`,{method:"POST",headers:{Authorization:`Bearer ${Oe.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Logout failed:",n),lr(),{success:!0}}},PA=async n=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};Oe.value.loading=!0,Oe.value.error=null;try{const e=await fetch(`${pi}/auth/profile`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Oe.value.token}`},body:JSON.stringify({displayName:n})}),t=await e.json();return e.ok&&t.success?(Oe.value.user=t.user,{success:!0,user:t.user}):(Oe.value.error=t.message||"Update failed",{success:!1,error:Oe.value.error})}catch(e){return console.error("Update failed:",e),Oe.value.error="Update failed. Please try again.",{success:!1,error:Oe.value.error}}finally{Oe.value.loading=!1}},IA=async(n,e)=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};Oe.value.loading=!0,Oe.value.error=null;try{const t=await fetch(`${pi}/auth/password`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Oe.value.token}`},body:JSON.stringify({oldPassword:n,newPassword:e})}),i=await t.json();return t.ok&&i.success?{success:!0}:(Oe.value.error=i.message||"Password change failed",{success:!1,error:Oe.value.error})}catch(t){return console.error("Password change failed:",t),Oe.value.error="Password change failed. Please try again.",{success:!1,error:Oe.value.error}}finally{Oe.value.loading=!1}},DA=async n=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};Oe.value.loading=!0,Oe.value.error=null;try{return(await fetch(`${pi}/auth/account`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Oe.value.token}`},body:JSON.stringify({password:n})})).ok?(lr(),{success:!0}):(Oe.value.error="Account deletion failed. Please try again.",{success:!1,error:Oe.value.error})}catch(e){return console.error("Account deletion failed:",e),Oe.value.error="Account deletion failed. Please try again.",{success:!1,error:Oe.value.error}}finally{Oe.value.loading=!1}},LA=async()=>{if(!Oe.value.token)return[];try{const n=await fetch(`${pi}/auth/sessions`,{headers:{Authorization:`Bearer ${Oe.value.token}`}});return n.ok?await n.json()||[]:(console.error("Failed to fetch sessions",n.status),[])}catch(n){return console.error("Failed to fetch sessions:",n),[]}},NA=async n=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};try{const e=await fetch(`${pi}/auth/sessions/${n}`,{method:"DELETE",headers:{Authorization:`Bearer ${Oe.value.token}`}});return{success:!0}}catch(e){return console.error("Failed to delete session",e),{success:!1,error:"Failed to delete session"}}},UA=async()=>{if(!Oe.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/sessions`,{method:"DELETE",headers:{Authorization:`Bearer ${Oe.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Failed to logout from all devices",n),{success:!1,error:"Failed to logout from all devices"}}},FA=(n,e)=>{Oe.value.user=e,Oe.value.token=n,Oe.value.isAuthenticated=!0,localStorage.setItem(Ru,n)},lr=()=>{Oe.value.user=null,Oe.value.token=null,Oe.value.isAuthenticated=!1,localStorage.removeItem(Ru)},rm=()=>{const n=navigator.userAgent;let e="Unknown",t="Unknown";return n.includes("Chrome")?e="Chrome":n.includes("Firefox")?e="Firefox":n.includes("Safari")?e="Safari":n.includes("Edge")&&(e="Edge"),n.includes("Windows")?t="Windows":n.includes("Mac")?t="macOS":n.includes("Linux")?t="Linux":n.includes("Android")?t="Android":n.includes("iOS")&&(t="iOS"),`${e} on ${t}`},om=()=>{const n=navigator.userAgent;return/Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle/.test(n)?"mobile":/Tablet|iPad/.test(n)?"tablet":"desktop"},OA=async(n,e)=>{const t={...(e==null?void 0:e.headers)||{}};return Oe.value.token&&(t.Authorization=`Bearer ${Oe.value.token}`),fetch(n,{...e,headers:t})};wA();function kA(){return{user:rt(()=>Oe.value.user),token:rt(()=>Oe.value.token),isAuthenticated:rt(()=>Oe.value.isAuthenticated),loading:rt(()=>Oe.value.loading),error:rt(()=>Oe.value.error),register:AA,login:CA,logout:RA,updateProfile:PA,changePassword:IA,deleteAccount:DA,getSessions:LA,logoutSession:NA,logoutAll:UA,fetchWithAuth:OA}}const BA={class:"auth-page"},VA={class:"auth-container"},zA={class:"auth-header"},HA={key:0},GA={key:0,class:"auth-message auth-message-success"},$A={key:1,class:"auth-message auth-message-error"},WA={key:2,class:"auth-tabs"},XA={key:3,class:"auth-form"},qA={class:"form-group"},jA=["disabled"],YA={class:"form-group"},KA=["type","disabled"],ZA=["disabled"],JA={class:"auth-switch"},QA={key:4,class:"auth-form"},eC={class:"form-group"},tC=["disabled"],nC={class:"form-group"},iC=["disabled"],sC={class:"form-group"},rC=["type","disabled"],oC={class:"form-group"},aC=["type","disabled"],lC=["disabled"],cC={class:"auth-switch"},uC={key:5,class:"auth-form"},dC={class:"form-group"},fC=["value"],hC={class:"form-group"},pC=["disabled"],mC=["disabled"],gC={class:"form-group"},vC=["type","disabled"],_C={class:"form-group"},xC=["type","disabled"],yC={class:"form-group"},SC=["type","disabled"],MC=["disabled"],bC=["disabled"],EC={class:"auth-info"},wC=et({__name:"AuthPage",setup(n){const e=kA(),t=ne("login"),i=ne(!1),s=ne({email:"",password:""}),r=ne({email:"",password:"",confirmPassword:"",displayName:""}),o=ne({displayName:""}),a=ne({oldPassword:"",newPassword:"",confirmNewPassword:""}),l=ne(""),c=ne(""),u=S=>{t.value=S,d(),S==="profile"&&e.user.value&&(o.value.displayName=e.user.value.display_name||"")},d=()=>{l.value="",c.value=""},h=async()=>{if(d(),!s.value.email||!s.value.password){c.value="Please fill in all fields";return}const S=await e.login(s.value.email,s.value.password);S.success?(l.value="Login successful!",s.value={email:"",password:""},setTimeout(()=>u("profile"),1e3)):S.error&&(c.value=S.error)},g=async()=>{if(d(),!r.value.email||!r.value.password||!r.value.displayName){c.value="Please fill in all fields";return}if(r.value.password!==r.value.confirmPassword){c.value="Passwords do not match";return}if(r.value.password.length<8){c.value="Password must be at least 8 characters";return}const S=await e.register(r.value.email,r.value.password,r.value.displayName);S.success?(l.value="Registration successful!",r.value={email:"",password:"",confirmPassword:"",displayName:""},setTimeout(()=>u("login"),1500)):S.error&&(c.value=S.error)},_=async()=>{if(d(),!o.value.displayName){c.value="Display name is required";return}const S=await e.updateProfile(o.value.displayName);S.success?l.value="Profile updated successfully!":S.error&&(c.value=S.error)},v=async()=>{if(d(),!a.value.oldPassword||!a.value.newPassword){c.value="Please fill in all fields";return}if(a.value.newPassword!==a.value.confirmNewPassword){c.value="New passwords do not match";return}if(a.value.newPassword.length<8){c.value="New password must be at least 8 characters";return}const S=await e.changePassword(a.value.oldPassword,a.value.newPassword);S.success?(l.value="Password changed successfully!",a.value={oldPassword:"",newPassword:"",confirmNewPassword:""}):S.error&&(c.value=S.error)},m=async()=>{confirm("Are you sure you want to logout?")&&(await e.logout(),l.value="Logged out successfully",u("login"))},p=async()=>{if(confirm("Are you sure you want to delete your account? This action cannot be undone.")){const S=prompt("Please enter your password to confirm account deletion:");if(!S)return;const x=await e.deleteAccount(S);x.success?(l.value="Account deleted successfully",u("login")):x.error&&(c.value=x.error)}};return(S,x)=>{var b,E,A,T;return F(),B("div",BA,[f("div",VA,[f("div",zA,[x[16]||(x[16]=f("h1",null,"🔐 Account",-1)),ve(e).isAuthenticated?(F(),B("p",HA,"Welcome, "+z(((b=ve(e).user)==null?void 0:b.display_name)||((E=ve(e).user)==null?void 0:E.email))+"!",1)):Te("",!0)]),l.value?(F(),B("div",GA," ✅ "+z(l.value),1)):Te("",!0),c.value?(F(),B("div",$A," ❌ "+z(c.value),1)):Te("",!0),ve(e).isAuthenticated?(F(),B("div",WA,[f("button",{class:Ue({active:t.value==="profile"}),onClick:x[0]||(x[0]=I=>u("profile"))}," 👤 Profile ",2),f("button",{onClick:m}," 🚪 Logout ")])):Te("",!0),t.value==="login"?(F(),B("div",XA,[x[20]||(x[20]=f("h2",null,"Sign In",-1)),f("div",qA,[x[17]||(x[17]=f("label",null,"Email",-1)),Et(f("input",{"onUpdate:modelValue":x[1]||(x[1]=I=>s.value.email=I),type:"email",placeholder:"your@email.com",onKeyup:ls(h,["enter"]),disabled:ve(e).loading},null,40,jA),[[Ft,s.value.email]])]),f("div",YA,[x[18]||(x[18]=f("label",null,"Password",-1)),Et(f("input",{"onUpdate:modelValue":x[2]||(x[2]=I=>s.value.password=I),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(h,["enter"]),disabled:ve(e).loading},null,40,KA),[[Ps,s.value.password]]),f("button",{class:"toggle-password",onClick:x[3]||(x[3]=I=>i.value=!i.value)},z(i.value?"🙈":"👁️"),1)]),f("button",{class:"auth-btn auth-btn-primary",onClick:h,disabled:ve(e).loading},z(ve(e).loading?"Signing in...":"Sign In"),9,ZA),f("p",JA,[x[19]||(x[19]=Kt(" Don't have an account? ",-1)),f("a",{onClick:x[4]||(x[4]=I=>u("register"))},"Create one")])])):Te("",!0),t.value==="register"?(F(),B("div",QA,[x[26]||(x[26]=f("h2",null,"Create Account",-1)),f("div",eC,[x[21]||(x[21]=f("label",null,"Email",-1)),Et(f("input",{"onUpdate:modelValue":x[5]||(x[5]=I=>r.value.email=I),type:"email",placeholder:"your@email.com",onKeyup:ls(g,["enter"]),disabled:ve(e).loading},null,40,tC),[[Ft,r.value.email]])]),f("div",nC,[x[22]||(x[22]=f("label",null,"Display Name",-1)),Et(f("input",{"onUpdate:modelValue":x[6]||(x[6]=I=>r.value.displayName=I),type:"text",placeholder:"Your Name",onKeyup:ls(g,["enter"]),disabled:ve(e).loading},null,40,iC),[[Ft,r.value.displayName]])]),f("div",sC,[x[23]||(x[23]=f("label",null,"Password (min 8 characters)",-1)),Et(f("input",{"onUpdate:modelValue":x[7]||(x[7]=I=>r.value.password=I),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,rC),[[Ps,r.value.password]])]),f("div",oC,[x[24]||(x[24]=f("label",null,"Confirm Password",-1)),Et(f("input",{"onUpdate:modelValue":x[8]||(x[8]=I=>r.value.confirmPassword=I),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(g,["enter"]),disabled:ve(e).loading},null,40,aC),[[Ps,r.value.confirmPassword]]),f("button",{class:"toggle-password",onClick:x[9]||(x[9]=I=>i.value=!i.value)},z(i.value?"🙈":"👁️"),1)]),f("button",{class:"auth-btn auth-btn-primary",onClick:g,disabled:ve(e).loading},z(ve(e).loading?"Creating...":"Create Account"),9,lC),f("p",cC,[x[25]||(x[25]=Kt(" Already have an account? ",-1)),f("a",{onClick:x[10]||(x[10]=I=>u("login"))},"Sign in")])])):Te("",!0),t.value==="profile"&&ve(e).isAuthenticated?(F(),B("div",uC,[x[32]||(x[32]=f("h2",null,"Profile Settings",-1)),f("div",dC,[x[27]||(x[27]=f("label",null,"Email",-1)),f("input",{value:(A=ve(e).user)==null?void 0:A.email,type:"email",disabled:"",class:"disabled-input"},null,8,fC)]),f("div",hC,[x[28]||(x[28]=f("label",null,"Display Name",-1)),Et(f("input",{"onUpdate:modelValue":x[11]||(x[11]=I=>o.value.displayName=I),type:"text",onKeyup:ls(_,["enter"]),disabled:ve(e).loading},null,40,pC),[[Ft,o.value.displayName]])]),f("button",{class:"auth-btn auth-btn-primary",onClick:_,disabled:ve(e).loading},z(ve(e).loading?"Updating...":"Update Profile"),9,mC),x[33]||(x[33]=f("hr",{class:"auth-divider"},null,-1)),x[34]||(x[34]=f("h3",null,"Change Password",-1)),f("div",gC,[x[29]||(x[29]=f("label",null,"Current Password",-1)),Et(f("input",{"onUpdate:modelValue":x[12]||(x[12]=I=>a.value.oldPassword=I),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,vC),[[Ps,a.value.oldPassword]])]),f("div",_C,[x[30]||(x[30]=f("label",null,"New Password",-1)),Et(f("input",{"onUpdate:modelValue":x[13]||(x[13]=I=>a.value.newPassword=I),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,xC),[[Ps,a.value.newPassword]])]),f("div",yC,[x[31]||(x[31]=f("label",null,"Confirm New Password",-1)),Et(f("input",{"onUpdate:modelValue":x[14]||(x[14]=I=>a.value.confirmNewPassword=I),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(v,["enter"]),disabled:ve(e).loading},null,40,SC),[[Ps,a.value.confirmNewPassword]]),f("button",{class:"toggle-password",onClick:x[15]||(x[15]=I=>i.value=!i.value)},z(i.value?"🙈":"👁️"),1)]),f("button",{class:"auth-btn auth-btn-secondary",onClick:v,disabled:ve(e).loading},z(ve(e).loading?"Changing...":"Change Password"),9,MC),x[35]||(x[35]=f("hr",{class:"auth-divider"},null,-1)),f("button",{class:"auth-btn auth-btn-danger",onClick:p,disabled:ve(e).loading}," 🗑️ Delete Account ",8,bC),f("p",EC," Account created: "+z(new Date(((T=ve(e).user)==null?void 0:T.created_at)||"").toLocaleDateString()),1)])):Te("",!0)])])}}}),TC=ut(wC,[["__scopeId","data-v-c713f8b1"]]);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Pu="182",AC=0,vf=1,CC=2,na=1,RC=2,Lr=3,ts=0,_n=1,ti=2,Ri=0,er=1,_f=2,xf=3,yf=4,PC=5,_s=100,IC=101,DC=102,LC=103,NC=104,UC=200,FC=201,OC=202,kC=203,pc=204,mc=205,BC=206,VC=207,zC=208,HC=209,GC=210,$C=211,WC=212,XC=213,qC=214,gc=0,vc=1,_c=2,cr=3,xc=4,yc=5,Sc=6,Mc=7,Iu=0,jC=1,YC=2,ri=0,am=1,lm=2,cm=3,um=4,dm=5,fm=6,hm=7,pm=300,As=301,ur=302,bc=303,Ec=304,Ga=306,wc=1e3,Ai=1001,Tc=1002,Zt=1003,KC=1004,Ao=1005,on=1006,hl=1007,Ss=1008,bn=1009,mm=1010,gm=1011,Qr=1012,Du=1013,ui=1014,ni=1015,Ni=1016,Lu=1017,Nu=1018,eo=1020,vm=35902,_m=35899,xm=1021,ym=1022,zn=1023,Ui=1026,Ms=1027,Sm=1028,Uu=1029,dr=1030,Fu=1031,Ou=1033,ia=33776,sa=33777,ra=33778,oa=33779,Ac=35840,Cc=35841,Rc=35842,Pc=35843,Ic=36196,Dc=37492,Lc=37496,Nc=37488,Uc=37489,Fc=37490,Oc=37491,kc=37808,Bc=37809,Vc=37810,zc=37811,Hc=37812,Gc=37813,$c=37814,Wc=37815,Xc=37816,qc=37817,jc=37818,Yc=37819,Kc=37820,Zc=37821,Jc=36492,Qc=36494,eu=36495,tu=36283,nu=36284,iu=36285,su=36286,ZC=3200,Mm=0,JC=1,Zi="",Dn="srgb",fr="srgb-linear",xa="linear",Mt="srgb",Ds=7680,Sf=519,QC=512,eR=513,tR=514,ku=515,nR=516,iR=517,Bu=518,sR=519,Mf=35044,bf="300 es",ii=2e3,ya=2001;function bm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Sa(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function rR(){const n=Sa("canvas");return n.style.display="block",n}const Ef={};function wf(...n){const e="THREE."+n.shift();console.log(e,...n)}function Ze(...n){const e="THREE."+n.shift();console.warn(e,...n)}function mt(...n){const e="THREE."+n.shift();console.error(e,...n)}function to(...n){const e=n.join(" ");e in Ef||(Ef[e]=!0,Ze(...n))}function oR(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}class mr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],pl=Math.PI/180,ru=180/Math.PI;function co(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function lt(n,e,t){return Math.max(e,Math.min(t,n))}function aR(n,e){return(n%e+e)%e}function ml(n,e,t){return(1-t)*n+t*e}function Er(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function vn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class gt{constructor(e=0,t=0){gt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class uo{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],d=i[s+3],h=r[o+0],g=r[o+1],_=r[o+2],v=r[o+3];if(a<=0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(a>=1){e[t+0]=h,e[t+1]=g,e[t+2]=_,e[t+3]=v;return}if(d!==v||l!==h||c!==g||u!==_){let m=l*h+c*g+u*_+d*v;m<0&&(h=-h,g=-g,_=-_,v=-v,m=-m);let p=1-a;if(m<.9995){const S=Math.acos(m),x=Math.sin(S);p=Math.sin(p*S)/x,a=Math.sin(a*S)/x,l=l*p+h*a,c=c*p+g*a,u=u*p+_*a,d=d*p+v*a}else{l=l*p+h*a,c=c*p+g*a,u=u*p+_*a,d=d*p+v*a;const S=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=S,c*=S,u*=S,d*=S}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],d=r[o],h=r[o+1],g=r[o+2],_=r[o+3];return e[t]=a*_+u*d+l*g-c*h,e[t+1]=l*_+u*h+c*d-a*g,e[t+2]=c*_+u*g+a*h-l*d,e[t+3]=u*_-a*d-l*h-c*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),d=a(r/2),h=l(i/2),g=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=h*u*d+c*g*_,this._y=c*g*d-h*u*_,this._z=c*u*_+h*g*d,this._w=c*u*d-h*g*_;break;case"YXZ":this._x=h*u*d+c*g*_,this._y=c*g*d-h*u*_,this._z=c*u*_-h*g*d,this._w=c*u*d+h*g*_;break;case"ZXY":this._x=h*u*d-c*g*_,this._y=c*g*d+h*u*_,this._z=c*u*_+h*g*d,this._w=c*u*d-h*g*_;break;case"ZYX":this._x=h*u*d-c*g*_,this._y=c*g*d+h*u*_,this._z=c*u*_-h*g*d,this._w=c*u*d+h*g*_;break;case"YZX":this._x=h*u*d+c*g*_,this._y=c*g*d+h*u*_,this._z=c*u*_-h*g*d,this._w=c*u*d-h*g*_;break;case"XZY":this._x=h*u*d-c*g*_,this._y=c*g*d-h*u*_,this._z=c*u*_+h*g*d,this._w=c*u*d+h*g*_;break;default:Ze("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=i+a+d;if(h>0){const g=.5/Math.sqrt(h+1);this._w=.25/g,this._x=(u-l)*g,this._y=(r-c)*g,this._z=(o-s)*g}else if(i>a&&i>d){const g=2*Math.sqrt(1+i-a-d);this._w=(u-l)/g,this._x=.25*g,this._y=(s+o)/g,this._z=(r+c)/g}else if(a>d){const g=2*Math.sqrt(1+a-i-d);this._w=(r-c)/g,this._x=(s+o)/g,this._y=.25*g,this._z=(l+u)/g}else{const g=2*Math.sqrt(1+d-i-a);this._w=(o-s)/g,this._x=(r+c)/g,this._y=(l+u)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(lt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class J{constructor(e=0,t=0,i=0){J.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Tf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Tf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),d=2*(r*i-o*t);return this.x=t+l*c+o*d-a*u,this.y=i+l*u+a*c-r*d,this.z=s+l*d+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this.z=lt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this.z=lt(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return gl.copy(this).projectOnVector(e),this.sub(gl)}reflect(e){return this.sub(gl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(lt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const gl=new J,Tf=new uo;class nt{constructor(e,t,i,s,r,o,a,l,c){nt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],d=i[7],h=i[2],g=i[5],_=i[8],v=s[0],m=s[3],p=s[6],S=s[1],x=s[4],b=s[7],E=s[2],A=s[5],T=s[8];return r[0]=o*v+a*S+l*E,r[3]=o*m+a*x+l*A,r[6]=o*p+a*b+l*T,r[1]=c*v+u*S+d*E,r[4]=c*m+u*x+d*A,r[7]=c*p+u*b+d*T,r[2]=h*v+g*S+_*E,r[5]=h*m+g*x+_*A,r[8]=h*p+g*b+_*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*r,g=c*r-o*l,_=t*d+i*h+s*g;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return e[0]=d*v,e[1]=(s*c-u*i)*v,e[2]=(a*i-s*o)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=g*v,e[7]=(i*l-c*t)*v,e[8]=(o*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(vl.makeScale(e,t)),this}rotate(e){return this.premultiply(vl.makeRotation(-e)),this}translate(e,t){return this.premultiply(vl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const vl=new nt,Af=new nt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Cf=new nt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function lR(){const n={enabled:!0,workingColorSpace:fr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Mt&&(s.r=Pi(s.r),s.g=Pi(s.g),s.b=Pi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Mt&&(s.r=tr(s.r),s.g=tr(s.g),s.b=tr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zi?xa:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return to("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return to("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[fr]:{primaries:e,whitePoint:i,transfer:xa,toXYZ:Af,fromXYZ:Cf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dn},outputColorSpaceConfig:{drawingBufferColorSpace:Dn}},[Dn]:{primaries:e,whitePoint:i,transfer:Mt,toXYZ:Af,fromXYZ:Cf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dn}}}),n}const ht=lR();function Pi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function tr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ls;class cR{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ls===void 0&&(Ls=Sa("canvas")),Ls.width=e.width,Ls.height=e.height;const s=Ls.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Ls}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Sa("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Pi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Pi(t[i]/255)*255):t[i]=Pi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ze("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let uR=0;class Vu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:uR++}),this.uuid=co(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(_l(s[o].image)):r.push(_l(s[o]))}else r=_l(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function _l(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?cR.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ze("Texture: Unable to serialize Texture."),{})}let dR=0;const xl=new J;class pn extends mr{constructor(e=pn.DEFAULT_IMAGE,t=pn.DEFAULT_MAPPING,i=Ai,s=Ai,r=on,o=Ss,a=zn,l=bn,c=pn.DEFAULT_ANISOTROPY,u=Zi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dR++}),this.uuid=co(),this.name="",this.source=new Vu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new gt(0,0),this.repeat=new gt(1,1),this.center=new gt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new nt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(xl).x}get height(){return this.source.getSize(xl).y}get depth(){return this.source.getSize(xl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ze(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==pm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case wc:e.x=e.x-Math.floor(e.x);break;case Ai:e.x=e.x<0?0:1;break;case Tc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case wc:e.y=e.y-Math.floor(e.y);break;case Ai:e.y=e.y<0?0:1;break;case Tc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=pm;pn.DEFAULT_ANISOTROPY=1;class Ot{constructor(e=0,t=0,i=0,s=1){Ot.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],g=l[5],_=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(_+m)<.1&&Math.abs(c+g+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const x=(c+1)/2,b=(g+1)/2,E=(p+1)/2,A=(u+h)/4,T=(d+v)/4,I=(_+m)/4;return x>b&&x>E?x<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(x),s=A/i,r=T/i):b>E?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=A/s,r=I/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=T/r,s=I/r),this.set(i,s,r,t),this}let S=Math.sqrt((m-_)*(m-_)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(S)<.001&&(S=1),this.x=(m-_)/S,this.y=(d-v)/S,this.z=(h-u)/S,this.w=Math.acos((c+g+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=lt(this.x,e.x,t.x),this.y=lt(this.y,e.y,t.y),this.z=lt(this.z,e.z,t.z),this.w=lt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=lt(this.x,e,t),this.y=lt(this.y,e,t),this.z=lt(this.z,e,t),this.w=lt(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(lt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class fR extends mr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Ot(0,0,e,t),this.scissorTest=!1,this.viewport=new Ot(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new pn(s);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Vu(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class oi extends fR{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Em extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class hR extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class fo{constructor(e=new J(1/0,1/0,1/0),t=new J(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Fn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Fn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Fn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Fn):Fn.fromBufferAttribute(r,o),Fn.applyMatrix4(e.matrixWorld),this.expandByPoint(Fn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Co.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Co.copy(i.boundingBox)),Co.applyMatrix4(e.matrixWorld),this.union(Co)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Fn),Fn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wr),Ro.subVectors(this.max,wr),Ns.subVectors(e.a,wr),Us.subVectors(e.b,wr),Fs.subVectors(e.c,wr),Bi.subVectors(Us,Ns),Vi.subVectors(Fs,Us),cs.subVectors(Ns,Fs);let t=[0,-Bi.z,Bi.y,0,-Vi.z,Vi.y,0,-cs.z,cs.y,Bi.z,0,-Bi.x,Vi.z,0,-Vi.x,cs.z,0,-cs.x,-Bi.y,Bi.x,0,-Vi.y,Vi.x,0,-cs.y,cs.x,0];return!yl(t,Ns,Us,Fs,Ro)||(t=[1,0,0,0,1,0,0,0,1],!yl(t,Ns,Us,Fs,Ro))?!1:(Po.crossVectors(Bi,Vi),t=[Po.x,Po.y,Po.z],yl(t,Ns,Us,Fs,Ro))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Fn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Fn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_i[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_i[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_i[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_i[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_i[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_i[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_i[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_i[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_i),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const _i=[new J,new J,new J,new J,new J,new J,new J,new J],Fn=new J,Co=new fo,Ns=new J,Us=new J,Fs=new J,Bi=new J,Vi=new J,cs=new J,wr=new J,Ro=new J,Po=new J,us=new J;function yl(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){us.fromArray(n,r);const a=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),l=e.dot(us),c=t.dot(us),u=i.dot(us);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const pR=new fo,Tr=new J,Sl=new J;class $a{constructor(e=new J,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):pR.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Tr.subVectors(e,this.center);const t=Tr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Tr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Sl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Tr.copy(e.center).add(Sl)),this.expandByPoint(Tr.copy(e.center).sub(Sl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const xi=new J,Ml=new J,Io=new J,zi=new J,bl=new J,Do=new J,El=new J;class wm{constructor(e=new J,t=new J(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xi.copy(this.origin).addScaledVector(this.direction,t),xi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ml.copy(e).add(t).multiplyScalar(.5),Io.copy(t).sub(e).normalize(),zi.copy(this.origin).sub(Ml);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Io),a=zi.dot(this.direction),l=-zi.dot(Io),c=zi.lengthSq(),u=Math.abs(1-o*o);let d,h,g,_;if(u>0)if(d=o*l-a,h=o*a-l,_=r*u,d>=0)if(h>=-_)if(h<=_){const v=1/u;d*=v,h*=v,g=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=r,d=Math.max(0,-(o*h+a)),g=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(o*h+a)),g=-d*d+h*(h+2*l)+c;else h<=-_?(d=Math.max(0,-(-o*r+a)),h=d>0?-r:Math.min(Math.max(-r,-l),r),g=-d*d+h*(h+2*l)+c):h<=_?(d=0,h=Math.min(Math.max(-r,-l),r),g=h*(h+2*l)+c):(d=Math.max(0,-(o*r+a)),h=d>0?r:Math.min(Math.max(-r,-l),r),g=-d*d+h*(h+2*l)+c);else h=o>0?-r:r,d=Math.max(0,-(o*h+a)),g=-d*d+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Ml).addScaledVector(Io,h),g}intersectSphere(e,t){xi.subVectors(e.center,this.origin);const i=xi.dot(this.direction),s=xi.dot(xi)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,xi)!==null}intersectTriangle(e,t,i,s,r){bl.subVectors(t,e),Do.subVectors(i,e),El.crossVectors(bl,Do);let o=this.direction.dot(El),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zi.subVectors(this.origin,e);const l=a*this.direction.dot(Do.crossVectors(zi,Do));if(l<0)return null;const c=a*this.direction.dot(bl.cross(zi));if(c<0||l+c>o)return null;const u=-a*zi.dot(El);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Dt{constructor(e,t,i,s,r,o,a,l,c,u,d,h,g,_,v,m){Dt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,d,h,g,_,v,m)}set(e,t,i,s,r,o,a,l,c,u,d,h,g,_,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=g,p[7]=_,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Dt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,i=e.elements,s=1/Os.setFromMatrixColumn(e,0).length(),r=1/Os.setFromMatrixColumn(e,1).length(),o=1/Os.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const h=o*u,g=o*d,_=a*u,v=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=g+_*c,t[5]=h-v*c,t[9]=-a*l,t[2]=v-h*c,t[6]=_+g*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,g=l*d,_=c*u,v=c*d;t[0]=h+v*a,t[4]=_*a-g,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=g*a-_,t[6]=v+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,g=l*d,_=c*u,v=c*d;t[0]=h-v*a,t[4]=-o*d,t[8]=_+g*a,t[1]=g+_*a,t[5]=o*u,t[9]=v-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,g=o*d,_=a*u,v=a*d;t[0]=l*u,t[4]=_*c-g,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=g*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,g=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=v-h*d,t[8]=_*d+g,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=g*d+_,t[10]=h-v*d}else if(e.order==="XZY"){const h=o*l,g=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=o*u,t[9]=g*d-_,t[2]=_*d-g,t[6]=a*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(mR,e,gR)}lookAt(e,t,i){const s=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),Hi.crossVectors(i,Sn),Hi.lengthSq()===0&&(Math.abs(i.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),Hi.crossVectors(i,Sn)),Hi.normalize(),Lo.crossVectors(Sn,Hi),s[0]=Hi.x,s[4]=Lo.x,s[8]=Sn.x,s[1]=Hi.y,s[5]=Lo.y,s[9]=Sn.y,s[2]=Hi.z,s[6]=Lo.z,s[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],d=i[5],h=i[9],g=i[13],_=i[2],v=i[6],m=i[10],p=i[14],S=i[3],x=i[7],b=i[11],E=i[15],A=s[0],T=s[4],I=s[8],M=s[12],w=s[1],N=s[5],O=s[9],q=s[13],Q=s[2],te=s[6],H=s[10],D=s[14],$=s[3],fe=s[7],he=s[11],ye=s[15];return r[0]=o*A+a*w+l*Q+c*$,r[4]=o*T+a*N+l*te+c*fe,r[8]=o*I+a*O+l*H+c*he,r[12]=o*M+a*q+l*D+c*ye,r[1]=u*A+d*w+h*Q+g*$,r[5]=u*T+d*N+h*te+g*fe,r[9]=u*I+d*O+h*H+g*he,r[13]=u*M+d*q+h*D+g*ye,r[2]=_*A+v*w+m*Q+p*$,r[6]=_*T+v*N+m*te+p*fe,r[10]=_*I+v*O+m*H+p*he,r[14]=_*M+v*q+m*D+p*ye,r[3]=S*A+x*w+b*Q+E*$,r[7]=S*T+x*N+b*te+E*fe,r[11]=S*I+x*O+b*H+E*he,r[15]=S*M+x*q+b*D+E*ye,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],g=e[14],_=e[3],v=e[7],m=e[11],p=e[15],S=l*g-c*h,x=a*g-c*d,b=a*h-l*d,E=o*g-c*u,A=o*h-l*u,T=o*d-a*u;return t*(v*S-m*x+p*b)-i*(_*S-m*E+p*A)+s*(_*x-v*E+p*T)-r*(_*b-v*A+m*T)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],g=e[11],_=e[12],v=e[13],m=e[14],p=e[15],S=d*m*c-v*h*c+v*l*g-a*m*g-d*l*p+a*h*p,x=_*h*c-u*m*c-_*l*g+o*m*g+u*l*p-o*h*p,b=u*v*c-_*d*c+_*a*g-o*v*g-u*a*p+o*d*p,E=_*d*l-u*v*l-_*a*h+o*v*h+u*a*m-o*d*m,A=t*S+i*x+s*b+r*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/A;return e[0]=S*T,e[1]=(v*h*r-d*m*r-v*s*g+i*m*g+d*s*p-i*h*p)*T,e[2]=(a*m*r-v*l*r+v*s*c-i*m*c-a*s*p+i*l*p)*T,e[3]=(d*l*r-a*h*r-d*s*c+i*h*c+a*s*g-i*l*g)*T,e[4]=x*T,e[5]=(u*m*r-_*h*r+_*s*g-t*m*g-u*s*p+t*h*p)*T,e[6]=(_*l*r-o*m*r-_*s*c+t*m*c+o*s*p-t*l*p)*T,e[7]=(o*h*r-u*l*r+u*s*c-t*h*c-o*s*g+t*l*g)*T,e[8]=b*T,e[9]=(_*d*r-u*v*r-_*i*g+t*v*g+u*i*p-t*d*p)*T,e[10]=(o*v*r-_*a*r+_*i*c-t*v*c-o*i*p+t*a*p)*T,e[11]=(u*a*r-o*d*r-u*i*c+t*d*c+o*i*g-t*a*g)*T,e[12]=E*T,e[13]=(u*v*s-_*d*s+_*i*h-t*v*h-u*i*m+t*d*m)*T,e[14]=(_*a*s-o*v*s-_*i*l+t*v*l+o*i*m-t*a*m)*T,e[15]=(o*d*s-u*a*s+u*i*l-t*d*l-o*i*h+t*a*h)*T,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,d=a+a,h=r*c,g=r*u,_=r*d,v=o*u,m=o*d,p=a*d,S=l*c,x=l*u,b=l*d,E=i.x,A=i.y,T=i.z;return s[0]=(1-(v+p))*E,s[1]=(g+b)*E,s[2]=(_-x)*E,s[3]=0,s[4]=(g-b)*A,s[5]=(1-(h+p))*A,s[6]=(m+S)*A,s[7]=0,s[8]=(_+x)*T,s[9]=(m-S)*T,s[10]=(1-(h+v))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;if(e.x=s[12],e.y=s[13],e.z=s[14],this.determinant()===0)return i.set(1,1,1),t.identity(),this;let r=Os.set(s[0],s[1],s[2]).length();const o=Os.set(s[4],s[5],s[6]).length(),a=Os.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),On.copy(this);const c=1/r,u=1/o,d=1/a;return On.elements[0]*=c,On.elements[1]*=c,On.elements[2]*=c,On.elements[4]*=u,On.elements[5]*=u,On.elements[6]*=u,On.elements[8]*=d,On.elements[9]*=d,On.elements[10]*=d,t.setFromRotationMatrix(On),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=ii,l=!1){const c=this.elements,u=2*r/(t-e),d=2*r/(i-s),h=(t+e)/(t-e),g=(i+s)/(i-s);let _,v;if(l)_=r/(o-r),v=o*r/(o-r);else if(a===ii)_=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===ya)_=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=g,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=ii,l=!1){const c=this.elements,u=2/(t-e),d=2/(i-s),h=-(t+e)/(t-e),g=-(i+s)/(i-s);let _,v;if(l)_=1/(o-r),v=o/(o-r);else if(a===ii)_=-2/(o-r),v=-(o+r)/(o-r);else if(a===ya)_=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=g,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Os=new J,On=new Dt,mR=new J(0,0,0),gR=new J(1,1,1),Hi=new J,Lo=new J,Sn=new J,Rf=new Dt,Pf=new uo;class di{constructor(e=0,t=0,i=0,s=di.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],g=s[10];switch(t){case"XYZ":this._y=Math.asin(lt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,g),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-lt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,g),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(lt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,g),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-lt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,g),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(lt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,g));break;case"XZY":this._z=Math.asin(-lt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,g),this._y=0);break;default:Ze("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Rf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Rf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Pf.setFromEuler(this),this.setFromQuaternion(Pf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}di.DEFAULT_ORDER="XYZ";class Tm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let vR=0;const If=new J,ks=new uo,yi=new Dt,No=new J,Ar=new J,_R=new J,xR=new uo,Df=new J(1,0,0),Lf=new J(0,1,0),Nf=new J(0,0,1),Uf={type:"added"},yR={type:"removed"},Bs={type:"childadded",child:null},wl={type:"childremoved",child:null};class Jt extends mr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vR++}),this.uuid=co(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Jt.DEFAULT_UP.clone();const e=new J,t=new di,i=new uo,s=new J(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Dt},normalMatrix:{value:new nt}}),this.matrix=new Dt,this.matrixWorld=new Dt,this.matrixAutoUpdate=Jt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Tm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.multiply(ks),this}rotateOnWorldAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.premultiply(ks),this}rotateX(e){return this.rotateOnAxis(Df,e)}rotateY(e){return this.rotateOnAxis(Lf,e)}rotateZ(e){return this.rotateOnAxis(Nf,e)}translateOnAxis(e,t){return If.copy(e).applyQuaternion(this.quaternion),this.position.add(If.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Df,e)}translateY(e){return this.translateOnAxis(Lf,e)}translateZ(e){return this.translateOnAxis(Nf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?No.copy(e):No.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yi.lookAt(Ar,No,this.up):yi.lookAt(No,Ar,this.up),this.quaternion.setFromRotationMatrix(yi),s&&(yi.extractRotation(s.matrixWorld),ks.setFromRotationMatrix(yi),this.quaternion.premultiply(ks.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(mt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Uf),Bs.child=e,this.dispatchEvent(Bs),Bs.child=null):mt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(yR),wl.child=e,this.dispatchEvent(wl),wl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Uf),Bs.child=e,this.dispatchEvent(Bs),Bs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,e,_R),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,xR,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),g=o(e.animations),_=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),d.length>0&&(i.shapes=d),h.length>0&&(i.skeletons=h),g.length>0&&(i.animations=g),_.length>0&&(i.nodes=_)}return i.object=s,i;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Jt.DEFAULT_UP=new J(0,1,0);Jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const kn=new J,Si=new J,Tl=new J,Mi=new J,Vs=new J,zs=new J,Ff=new J,Al=new J,Cl=new J,Rl=new J,Pl=new Ot,Il=new Ot,Dl=new Ot;class Vn{constructor(e=new J,t=new J,i=new J){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),kn.subVectors(e,t),s.cross(kn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){kn.subVectors(s,t),Si.subVectors(i,t),Tl.subVectors(e,t);const o=kn.dot(kn),a=kn.dot(Si),l=kn.dot(Tl),c=Si.dot(Si),u=Si.dot(Tl),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;const h=1/d,g=(c*l-a*u)*h,_=(o*u-a*l)*h;return r.set(1-g-_,_,g)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Mi)===null?!1:Mi.x>=0&&Mi.y>=0&&Mi.x+Mi.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Mi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Mi.x),l.addScaledVector(o,Mi.y),l.addScaledVector(a,Mi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Pl.setScalar(0),Il.setScalar(0),Dl.setScalar(0),Pl.fromBufferAttribute(e,t),Il.fromBufferAttribute(e,i),Dl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Pl,r.x),o.addScaledVector(Il,r.y),o.addScaledVector(Dl,r.z),o}static isFrontFacing(e,t,i,s){return kn.subVectors(i,t),Si.subVectors(e,t),kn.cross(Si).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return kn.subVectors(this.c,this.b),Si.subVectors(this.a,this.b),kn.cross(Si).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Vn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Vn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Vn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Vn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Vn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;Vs.subVectors(s,i),zs.subVectors(r,i),Al.subVectors(e,i);const l=Vs.dot(Al),c=zs.dot(Al);if(l<=0&&c<=0)return t.copy(i);Cl.subVectors(e,s);const u=Vs.dot(Cl),d=zs.dot(Cl);if(u>=0&&d<=u)return t.copy(s);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(Vs,o);Rl.subVectors(e,r);const g=Vs.dot(Rl),_=zs.dot(Rl);if(_>=0&&g<=_)return t.copy(r);const v=g*c-l*_;if(v<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(i).addScaledVector(zs,a);const m=u*_-g*d;if(m<=0&&d-u>=0&&g-_>=0)return Ff.subVectors(r,s),a=(d-u)/(d-u+(g-_)),t.copy(s).addScaledVector(Ff,a);const p=1/(m+v+h);return o=v*p,a=h*p,t.copy(i).addScaledVector(Vs,o).addScaledVector(zs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Am={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},Uo={h:0,s:0,l:0};function Ll(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ct{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=ht.workingColorSpace){return this.r=e,this.g=t,this.b=i,ht.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=ht.workingColorSpace){if(e=aR(e,1),t=lt(t,0,1),i=lt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Ll(o,r,e+1/3),this.g=Ll(o,r,e),this.b=Ll(o,r,e-1/3)}return ht.colorSpaceToWorking(this,s),this}setStyle(e,t=Dn){function i(r){r!==void 0&&parseFloat(r)<1&&Ze("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ze("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Ze("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dn){const i=Am[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ze("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dn){return ht.workingToColorSpace(tn.copy(this),e),Math.round(lt(tn.r*255,0,255))*65536+Math.round(lt(tn.g*255,0,255))*256+Math.round(lt(tn.b*255,0,255))}getHexString(e=Dn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.workingToColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.workingToColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=Dn){ht.workingToColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==Dn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Gi),this.setHSL(Gi.h+e,Gi.s+t,Gi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Gi),e.getHSL(Uo);const i=ml(Gi.h,Uo.h,t),s=ml(Gi.s,Uo.s,t),r=ml(Gi.l,Uo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new ct;ct.NAMES=Am;let SR=0;class gr extends mr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:SR++}),this.uuid=co(),this.name="",this.type="Material",this.blending=er,this.side=ts,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=pc,this.blendDst=mc,this.blendEquation=_s,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ct(0,0,0),this.blendAlpha=0,this.depthFunc=cr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ds,this.stencilZFail=Ds,this.stencilZPass=Ds,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ze(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==er&&(i.blending=this.blending),this.side!==ts&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==pc&&(i.blendSrc=this.blendSrc),this.blendDst!==mc&&(i.blendDst=this.blendDst),this.blendEquation!==_s&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==cr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Sf&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ds&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ds&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ds&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Cm extends gr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=Iu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Vt=new J,Fo=new gt;let MR=0;class ai{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:MR++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Mf,this.updateRanges=[],this.gpuType=ni,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Fo.fromBufferAttribute(this,t),Fo.applyMatrix3(e),this.setXY(t,Fo.x,Fo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix3(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix4(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Vt.fromBufferAttribute(this,t),Vt.applyNormalMatrix(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Vt.fromBufferAttribute(this,t),Vt.transformDirection(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Er(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=vn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Er(t,this.array)),t}setX(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Er(t,this.array)),t}setY(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Er(t,this.array)),t}setZ(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Er(t,this.array)),t}setW(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array),r=vn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Mf&&(e.usage=this.usage),e}}class Rm extends ai{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Pm extends ai{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class an extends ai{constructor(e,t,i){super(new Float32Array(e),t,i)}}let bR=0;const In=new Dt,Nl=new Jt,Hs=new J,Mn=new fo,Cr=new fo,qt=new J;class Cn extends mr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:bR++}),this.uuid=co(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(bm(e)?Pm:Rm)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new nt().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return In.makeRotationFromQuaternion(e),this.applyMatrix4(In),this}rotateX(e){return In.makeRotationX(e),this.applyMatrix4(In),this}rotateY(e){return In.makeRotationY(e),this.applyMatrix4(In),this}rotateZ(e){return In.makeRotationZ(e),this.applyMatrix4(In),this}translate(e,t,i){return In.makeTranslation(e,t,i),this.applyMatrix4(In),this}scale(e,t,i){return In.makeScale(e,t,i),this.applyMatrix4(In),this}lookAt(e){return Nl.lookAt(e),Nl.updateMatrix(),this.applyMatrix4(Nl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Hs).negate(),this.translate(Hs.x,Hs.y,Hs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new an(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ze("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new fo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){mt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new J(-1/0,-1/0,-1/0),new J(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Mn.setFromBufferAttribute(r),this.morphTargetsRelative?(qt.addVectors(this.boundingBox.min,Mn.min),this.boundingBox.expandByPoint(qt),qt.addVectors(this.boundingBox.max,Mn.max),this.boundingBox.expandByPoint(qt)):(this.boundingBox.expandByPoint(Mn.min),this.boundingBox.expandByPoint(Mn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&mt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $a);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){mt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new J,1/0);return}if(e){const i=this.boundingSphere.center;if(Mn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Cr.setFromBufferAttribute(a),this.morphTargetsRelative?(qt.addVectors(Mn.min,Cr.min),Mn.expandByPoint(qt),qt.addVectors(Mn.max,Cr.max),Mn.expandByPoint(qt)):(Mn.expandByPoint(Cr.min),Mn.expandByPoint(Cr.max))}Mn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)qt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(qt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)qt.fromBufferAttribute(a,c),l&&(Hs.fromBufferAttribute(e,c),qt.add(Hs)),s=Math.max(s,i.distanceToSquared(qt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&mt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){mt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ai(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<i.count;I++)a[I]=new J,l[I]=new J;const c=new J,u=new J,d=new J,h=new gt,g=new gt,_=new gt,v=new J,m=new J;function p(I,M,w){c.fromBufferAttribute(i,I),u.fromBufferAttribute(i,M),d.fromBufferAttribute(i,w),h.fromBufferAttribute(r,I),g.fromBufferAttribute(r,M),_.fromBufferAttribute(r,w),u.sub(c),d.sub(c),g.sub(h),_.sub(h);const N=1/(g.x*_.y-_.x*g.y);isFinite(N)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(d,-g.y).multiplyScalar(N),m.copy(d).multiplyScalar(g.x).addScaledVector(u,-_.x).multiplyScalar(N),a[I].add(v),a[M].add(v),a[w].add(v),l[I].add(m),l[M].add(m),l[w].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let I=0,M=S.length;I<M;++I){const w=S[I],N=w.start,O=w.count;for(let q=N,Q=N+O;q<Q;q+=3)p(e.getX(q+0),e.getX(q+1),e.getX(q+2))}const x=new J,b=new J,E=new J,A=new J;function T(I){E.fromBufferAttribute(s,I),A.copy(E);const M=a[I];x.copy(M),x.sub(E.multiplyScalar(E.dot(M))).normalize(),b.crossVectors(A,M);const N=b.dot(l[I])<0?-1:1;o.setXYZW(I,x.x,x.y,x.z,N)}for(let I=0,M=S.length;I<M;++I){const w=S[I],N=w.start,O=w.count;for(let q=N,Q=N+O;q<Q;q+=3)T(e.getX(q+0)),T(e.getX(q+1)),T(e.getX(q+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new ai(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,g=i.count;h<g;h++)i.setXYZ(h,0,0,0);const s=new J,r=new J,o=new J,a=new J,l=new J,c=new J,u=new J,d=new J;if(e)for(let h=0,g=e.count;h<g;h+=3){const _=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),a.fromBufferAttribute(i,_),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),a.add(u),l.add(u),c.add(u),i.setXYZ(_,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,g=t.count;h<g;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),d.subVectors(s,r),u.cross(d),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)qt.fromBufferAttribute(e,t),qt.normalize(),e.setXYZ(t,qt.x,qt.y,qt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u);let g=0,_=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?g=l[v]*a.data.stride+a.offset:g=l[v]*u;for(let p=0;p<u;p++)h[_++]=c[g++]}return new ai(h,u,d)}if(this.index===null)return Ze("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Cn,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,d=c.length;u<d;u++){const h=c[u],g=e(h,i);l.push(g)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const g=c[d];u.push(g.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],d=r[c];for(let h=0,g=d.length;h<g;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Of=new Dt,ds=new wm,Oo=new $a,kf=new J,ko=new J,Bo=new J,Vo=new J,Ul=new J,zo=new J,Bf=new J,Ho=new J;class wn extends Jt{constructor(e=new Cn,t=new Cm){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){zo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],d=r[l];u!==0&&(Ul.fromBufferAttribute(d,e),o?zo.addScaledVector(Ul,u):zo.addScaledVector(Ul.sub(t),u))}t.add(zo)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Oo.copy(i.boundingSphere),Oo.applyMatrix4(r),ds.copy(e.ray).recast(e.near),!(Oo.containsPoint(ds.origin)===!1&&(ds.intersectSphere(Oo,kf)===null||ds.origin.distanceToSquared(kf)>(e.far-e.near)**2))&&(Of.copy(r).invert(),ds.copy(e.ray).applyMatrix4(Of),!(i.boundingBox!==null&&ds.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,g=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const m=h[_],p=o[m.materialIndex],S=Math.max(m.start,g.start),x=Math.min(a.count,Math.min(m.start+m.count,g.start+g.count));for(let b=S,E=x;b<E;b+=3){const A=a.getX(b),T=a.getX(b+1),I=a.getX(b+2);s=Go(this,p,e,i,c,u,d,A,T,I),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,g.start),v=Math.min(a.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const S=a.getX(m),x=a.getX(m+1),b=a.getX(m+2);s=Go(this,o,e,i,c,u,d,S,x,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const m=h[_],p=o[m.materialIndex],S=Math.max(m.start,g.start),x=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let b=S,E=x;b<E;b+=3){const A=b,T=b+1,I=b+2;s=Go(this,p,e,i,c,u,d,A,T,I),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,g.start),v=Math.min(l.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const S=m,x=m+1,b=m+2;s=Go(this,o,e,i,c,u,d,S,x,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function ER(n,e,t,i,s,r,o,a){let l;if(e.side===_n?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===ts,a),l===null)return null;Ho.copy(a),Ho.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Ho);return c<t.near||c>t.far?null:{distance:c,point:Ho.clone(),object:n}}function Go(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,ko),n.getVertexPosition(l,Bo),n.getVertexPosition(c,Vo);const u=ER(n,e,t,i,ko,Bo,Vo,Bf);if(u){const d=new J;Vn.getBarycoord(Bf,ko,Bo,Vo,d),s&&(u.uv=Vn.getInterpolatedAttribute(s,a,l,c,d,new gt)),r&&(u.uv1=Vn.getInterpolatedAttribute(r,a,l,c,d,new gt)),o&&(u.normal=Vn.getInterpolatedAttribute(o,a,l,c,d,new J),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new J,materialIndex:0};Vn.getNormal(ko,Bo,Vo,h.normal),u.face=h,u.barycoord=d}return u}class ho extends Cn{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],d=[];let h=0,g=0;_("z","y","x",-1,-1,i,t,e,o,r,0),_("z","y","x",1,-1,i,t,-e,o,r,1),_("x","z","y",1,1,e,i,t,s,o,2),_("x","z","y",1,-1,e,i,-t,s,o,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new an(c,3)),this.setAttribute("normal",new an(u,3)),this.setAttribute("uv",new an(d,2));function _(v,m,p,S,x,b,E,A,T,I,M){const w=b/T,N=E/I,O=b/2,q=E/2,Q=A/2,te=T+1,H=I+1;let D=0,$=0;const fe=new J;for(let he=0;he<H;he++){const ye=he*N-q;for(let He=0;He<te;He++){const We=He*w-O;fe[v]=We*S,fe[m]=ye*x,fe[p]=Q,c.push(fe.x,fe.y,fe.z),fe[v]=0,fe[m]=0,fe[p]=A>0?1:-1,u.push(fe.x,fe.y,fe.z),d.push(He/T),d.push(1-he/I),D+=1}}for(let he=0;he<I;he++)for(let ye=0;ye<T;ye++){const He=h+ye+te*he,We=h+ye+te*(he+1),dt=h+(ye+1)+te*(he+1),at=h+(ye+1)+te*he;l.push(He,We,at),l.push(We,dt,at),$+=6}a.addGroup(g,$,M),g+=$,h+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ho(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function hr(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Ze("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function un(n){const e={};for(let t=0;t<n.length;t++){const i=hr(n[t]);for(const s in i)e[s]=i[s]}return e}function wR(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Im(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ht.workingColorSpace}const TR={clone:hr,merge:un};var AR=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,CR=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fi extends gr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=AR,this.fragmentShader=CR,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=hr(e.uniforms),this.uniformsGroups=wR(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Dm extends Jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Dt,this.projectionMatrix=new Dt,this.projectionMatrixInverse=new Dt,this.coordinateSystem=ii,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const $i=new J,Vf=new gt,zf=new gt;class Ln extends Dm{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ru*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(pl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ru*2*Math.atan(Math.tan(pl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){$i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($i.x,$i.y).multiplyScalar(-e/$i.z),$i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set($i.x,$i.y).multiplyScalar(-e/$i.z)}getViewSize(e,t){return this.getViewBounds(e,Vf,zf),t.subVectors(zf,Vf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(pl*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Gs=-90,$s=1;class RR extends Jt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ln(Gs,$s,e,t);s.layers=this.layers,this.add(s);const r=new Ln(Gs,$s,e,t);r.layers=this.layers,this.add(r);const o=new Ln(Gs,$s,e,t);o.layers=this.layers,this.add(o);const a=new Ln(Gs,$s,e,t);a.layers=this.layers,this.add(a);const l=new Ln(Gs,$s,e,t);l.layers=this.layers,this.add(l);const c=new Ln(Gs,$s,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===ii)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ya)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(d,h,g),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Lm extends pn{constructor(e=[],t=As,i,s,r,o,a,l,c,u){super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Nm extends oi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Lm(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ho(5,5,5),r=new fi({name:"CubemapFromEquirect",uniforms:hr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_n,blending:Ri});r.uniforms.tEquirect.value=t;const o=new wn(s,r),a=t.minFilter;return t.minFilter===Ss&&(t.minFilter=on),new RR(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class Nr extends Jt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const PR={type:"move"};class Fl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new J,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new J),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new J,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new J),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),g=.02,_=.005;c.inputState.pinching&&h>g+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=g-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(PR)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Nr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class zu{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new ct(e),this.near=t,this.far=i}clone(){return new zu(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class IR extends Jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new di,this.environmentIntensity=1,this.environmentRotation=new di,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class DR extends pn{constructor(e=null,t=1,i=1,s,r,o,a,l,c=Zt,u=Zt,d,h){super(null,o,a,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ol=new J,LR=new J,NR=new nt;class vs{constructor(e=new J(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Ol.subVectors(i,t).cross(LR.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Ol),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||NR.getNormalMatrix(e),s=this.coplanarPoint(Ol).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fs=new $a,UR=new gt(.5,.5),$o=new J;class Hu{constructor(e=new vs,t=new vs,i=new vs,s=new vs,r=new vs,o=new vs){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ii,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],g=r[7],_=r[8],v=r[9],m=r[10],p=r[11],S=r[12],x=r[13],b=r[14],E=r[15];if(s[0].setComponents(c-o,g-u,p-_,E-S).normalize(),s[1].setComponents(c+o,g+u,p+_,E+S).normalize(),s[2].setComponents(c+a,g+d,p+v,E+x).normalize(),s[3].setComponents(c-a,g-d,p-v,E-x).normalize(),i)s[4].setComponents(l,h,m,b).normalize(),s[5].setComponents(c-l,g-h,p-m,E-b).normalize();else if(s[4].setComponents(c-l,g-h,p-m,E-b).normalize(),t===ii)s[5].setComponents(c+l,g+h,p+m,E+b).normalize();else if(t===ya)s[5].setComponents(l,h,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(e){fs.center.set(0,0,0);const t=UR.distanceTo(e.center);return fs.radius=.7071067811865476+t,fs.applyMatrix4(e.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if($o.x=s.normal.x>0?e.max.x:e.min.x,$o.y=s.normal.y>0?e.max.y:e.min.y,$o.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint($o)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Um extends gr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ct(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ma=new J,ba=new J,Hf=new Dt,Rr=new wm,Wo=new $a,kl=new J,Gf=new J;class FR extends Jt{constructor(e=new Cn,t=new Um){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Ma.fromBufferAttribute(t,s-1),ba.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Ma.distanceTo(ba);e.setAttribute("lineDistance",new an(i,1))}else Ze("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Wo.copy(i.boundingSphere),Wo.applyMatrix4(s),Wo.radius+=r,e.ray.intersectsSphere(Wo)===!1)return;Hf.copy(s).invert(),Rr.copy(e.ray).applyMatrix4(Hf);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const g=Math.max(0,o.start),_=Math.min(u.count,o.start+o.count);for(let v=g,m=_-1;v<m;v+=c){const p=u.getX(v),S=u.getX(v+1),x=Xo(this,e,Rr,l,p,S,v);x&&t.push(x)}if(this.isLineLoop){const v=u.getX(_-1),m=u.getX(g),p=Xo(this,e,Rr,l,v,m,_-1);p&&t.push(p)}}else{const g=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let v=g,m=_-1;v<m;v+=c){const p=Xo(this,e,Rr,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=Xo(this,e,Rr,l,_-1,g,_-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Xo(n,e,t,i,s,r,o){const a=n.geometry.attributes.position;if(Ma.fromBufferAttribute(a,s),ba.fromBufferAttribute(a,r),t.distanceSqToSegment(Ma,ba,kl,Gf)>i)return;kl.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(kl);if(!(c<e.near||c>e.far))return{distance:c,point:Gf.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}class no extends pn{constructor(e,t,i=ui,s,r,o,a=Zt,l=Zt,c,u=Ui,d=1){if(u!==Ui&&u!==Ms)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:d};super(h,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vu(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class OR extends no{constructor(e,t=ui,i=As,s,r,o=Zt,a=Zt,l,c=Ui){const u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Fm extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Gu extends Cn{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],h=[],g=[];let _=0;const v=[],m=i/2;let p=0;S(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new an(d,3)),this.setAttribute("normal",new an(h,3)),this.setAttribute("uv",new an(g,2));function S(){const b=new J,E=new J;let A=0;const T=(t-e)/i;for(let I=0;I<=r;I++){const M=[],w=I/r,N=w*(t-e)+e;for(let O=0;O<=s;O++){const q=O/s,Q=q*l+a,te=Math.sin(Q),H=Math.cos(Q);E.x=N*te,E.y=-w*i+m,E.z=N*H,d.push(E.x,E.y,E.z),b.set(te,T,H).normalize(),h.push(b.x,b.y,b.z),g.push(q,1-w),M.push(_++)}v.push(M)}for(let I=0;I<s;I++)for(let M=0;M<r;M++){const w=v[M][I],N=v[M+1][I],O=v[M+1][I+1],q=v[M][I+1];(e>0||M!==0)&&(u.push(w,N,q),A+=3),(t>0||M!==r-1)&&(u.push(N,O,q),A+=3)}c.addGroup(p,A,0),p+=A}function x(b){const E=_,A=new gt,T=new J;let I=0;const M=b===!0?e:t,w=b===!0?1:-1;for(let O=1;O<=s;O++)d.push(0,m*w,0),h.push(0,w,0),g.push(.5,.5),_++;const N=_;for(let O=0;O<=s;O++){const Q=O/s*l+a,te=Math.cos(Q),H=Math.sin(Q);T.x=M*H,T.y=m*w,T.z=M*te,d.push(T.x,T.y,T.z),h.push(0,w,0),A.x=te*.5+.5,A.y=H*.5*w+.5,g.push(A.x,A.y),_++}for(let O=0;O<s;O++){const q=E+O,Q=N+O;b===!0?u.push(Q,Q+1,q):u.push(Q+1,Q,q),I+=3}c.addGroup(p,I,b===!0?1:2),p+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gu(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ea extends Gu{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Ea(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class po extends Cn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,d=e/a,h=t/l,g=[],_=[],v=[],m=[];for(let p=0;p<u;p++){const S=p*h-o;for(let x=0;x<c;x++){const b=x*d-r;_.push(b,-S,0),v.push(0,0,1),m.push(x/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<a;S++){const x=S+c*p,b=S+c*(p+1),E=S+1+c*(p+1),A=S+1+c*p;g.push(x,b,A),g.push(b,E,A)}this.setIndex(g),this.setAttribute("position",new an(_,3)),this.setAttribute("normal",new an(v,3)),this.setAttribute("uv",new an(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new po(e.width,e.height,e.widthSegments,e.heightSegments)}}class $u extends Cn{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],u=new J,d=new J,h=new J;for(let g=0;g<=i;g++)for(let _=0;_<=s;_++){const v=_/s*r,m=g/i*Math.PI*2;d.x=(e+t*Math.cos(m))*Math.cos(v),d.y=(e+t*Math.cos(m))*Math.sin(v),d.z=t*Math.sin(m),a.push(d.x,d.y,d.z),u.x=e*Math.cos(v),u.y=e*Math.sin(v),h.subVectors(d,u).normalize(),l.push(h.x,h.y,h.z),c.push(_/s),c.push(g/i)}for(let g=1;g<=i;g++)for(let _=1;_<=s;_++){const v=(s+1)*g+_-1,m=(s+1)*(g-1)+_-1,p=(s+1)*(g-1)+_,S=(s+1)*g+_;o.push(v,m,S),o.push(m,p,S)}this.setIndex(o),this.setAttribute("position",new an(a,3)),this.setAttribute("normal",new an(l,3)),this.setAttribute("uv",new an(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $u(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class kR extends fi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Bl extends gr{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ct(16777215),this.specular=new ct(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ct(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Mm,this.normalScale=new gt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=Iu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class BR extends gr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ZC,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class VR extends gr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Om extends Jt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ct(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const Vl=new Dt,$f=new J,Wf=new J;class zR{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new gt(512,512),this.mapType=bn,this.map=null,this.mapPass=null,this.matrix=new Dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Hu,this._frameExtents=new gt(1,1),this._viewportCount=1,this._viewports=[new Ot(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;$f.setFromMatrixPosition(e.matrixWorld),t.position.copy($f),Wf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Wf),t.updateMatrixWorld(),Vl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Vl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Wu extends Dm{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class HR extends zR{constructor(){super(new Wu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class GR extends Om{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Jt.DEFAULT_UP),this.updateMatrix(),this.target=new Jt,this.shadow=new HR}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class $R extends Om{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class WR extends Ln{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function Xf(n,e,t,i){const s=XR(i);switch(t){case xm:return n*e;case Sm:return n*e/s.components*s.byteLength;case Uu:return n*e/s.components*s.byteLength;case dr:return n*e*2/s.components*s.byteLength;case Fu:return n*e*2/s.components*s.byteLength;case ym:return n*e*3/s.components*s.byteLength;case zn:return n*e*4/s.components*s.byteLength;case Ou:return n*e*4/s.components*s.byteLength;case ia:case sa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case ra:case oa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Cc:case Pc:return Math.max(n,16)*Math.max(e,8)/4;case Ac:case Rc:return Math.max(n,8)*Math.max(e,8)/2;case Ic:case Dc:case Nc:case Uc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Lc:case Fc:case Oc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case kc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Bc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Vc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case zc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Hc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Gc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case $c:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Wc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Xc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case qc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case jc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Yc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Kc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Zc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Jc:case Qc:case eu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case tu:case nu:return Math.ceil(n/4)*Math.ceil(e/4)*8;case iu:case su:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function XR(n){switch(n){case bn:case mm:return{byteLength:1,components:1};case Qr:case gm:case Ni:return{byteLength:2,components:1};case Lu:case Nu:return{byteLength:2,components:4};case ui:case Du:case ni:return{byteLength:4,components:1};case vm:case _m:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Pu}}));typeof window<"u"&&(window.__THREE__?Ze("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Pu);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function km(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function qR(n){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,d=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),a.onUploadCallback();let g;if(c instanceof Float32Array)g=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)g=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?g=n.HALF_FLOAT:g=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)g=n.SHORT;else if(c instanceof Uint32Array)g=n.UNSIGNED_INT;else if(c instanceof Int32Array)g=n.INT;else if(c instanceof Int8Array)g=n.BYTE;else if(c instanceof Uint8Array)g=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)g=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:g,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,l,c){const u=l.array,d=l.updateRanges;if(n.bindBuffer(c,a),d.length===0)n.bufferSubData(c,0,u);else{d.sort((g,_)=>g.start-_.start);let h=0;for(let g=1;g<d.length;g++){const _=d[h],v=d[g];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,d[h]=v)}d.length=h+1;for(let g=0,_=d.length;g<_;g++){const v=d[g];n.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var jR=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,YR=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,KR=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ZR=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,JR=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,QR=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,eP=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tP=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,nP=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,iP=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,sP=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,rP=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,oP=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,aP=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,lP=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cP=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,uP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,dP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,fP=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hP=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,pP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,mP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,gP=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,vP=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,_P=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,xP=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,yP=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,SP=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,MP=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bP=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,EP="gl_FragColor = linearToOutputTexel( gl_FragColor );",wP=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,TP=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,AP=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,CP=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,RP=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,PP=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,IP=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,DP=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,LP=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,NP=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,UP=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,FP=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,OP=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,kP=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,BP=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,VP=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,zP=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,HP=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,GP=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,$P=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,WP=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,XP=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,qP=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,jP=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,YP=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,KP=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ZP=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,JP=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,QP=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,e3=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,t3=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,n3=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,i3=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,s3=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,r3=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,o3=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,a3=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,l3=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,c3=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,u3=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,d3=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,f3=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,h3=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,p3=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,m3=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,g3=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,v3=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,_3=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,x3=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,y3=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,S3=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,M3=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,b3=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,E3=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,w3=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,T3=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,A3=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,C3=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,R3=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,P3=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,I3=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,D3=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,L3=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,N3=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,U3=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,F3=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,O3=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,k3=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,B3=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,V3=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,z3=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,H3=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,G3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,$3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,W3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,X3=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const q3=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,j3=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Y3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,K3=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Z3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,J3=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Q3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,e2=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,t2=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,n2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,i2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,s2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,r2=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,o2=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,a2=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,l2=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c2=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u2=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d2=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,f2=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h2=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,p2=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,m2=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,g2=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,v2=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,_2=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x2=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,y2=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,S2=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,M2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,b2=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,E2=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,w2=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,T2=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,it={alphahash_fragment:jR,alphahash_pars_fragment:YR,alphamap_fragment:KR,alphamap_pars_fragment:ZR,alphatest_fragment:JR,alphatest_pars_fragment:QR,aomap_fragment:eP,aomap_pars_fragment:tP,batching_pars_vertex:nP,batching_vertex:iP,begin_vertex:sP,beginnormal_vertex:rP,bsdfs:oP,iridescence_fragment:aP,bumpmap_pars_fragment:lP,clipping_planes_fragment:cP,clipping_planes_pars_fragment:uP,clipping_planes_pars_vertex:dP,clipping_planes_vertex:fP,color_fragment:hP,color_pars_fragment:pP,color_pars_vertex:mP,color_vertex:gP,common:vP,cube_uv_reflection_fragment:_P,defaultnormal_vertex:xP,displacementmap_pars_vertex:yP,displacementmap_vertex:SP,emissivemap_fragment:MP,emissivemap_pars_fragment:bP,colorspace_fragment:EP,colorspace_pars_fragment:wP,envmap_fragment:TP,envmap_common_pars_fragment:AP,envmap_pars_fragment:CP,envmap_pars_vertex:RP,envmap_physical_pars_fragment:VP,envmap_vertex:PP,fog_vertex:IP,fog_pars_vertex:DP,fog_fragment:LP,fog_pars_fragment:NP,gradientmap_pars_fragment:UP,lightmap_pars_fragment:FP,lights_lambert_fragment:OP,lights_lambert_pars_fragment:kP,lights_pars_begin:BP,lights_toon_fragment:zP,lights_toon_pars_fragment:HP,lights_phong_fragment:GP,lights_phong_pars_fragment:$P,lights_physical_fragment:WP,lights_physical_pars_fragment:XP,lights_fragment_begin:qP,lights_fragment_maps:jP,lights_fragment_end:YP,logdepthbuf_fragment:KP,logdepthbuf_pars_fragment:ZP,logdepthbuf_pars_vertex:JP,logdepthbuf_vertex:QP,map_fragment:e3,map_pars_fragment:t3,map_particle_fragment:n3,map_particle_pars_fragment:i3,metalnessmap_fragment:s3,metalnessmap_pars_fragment:r3,morphinstance_vertex:o3,morphcolor_vertex:a3,morphnormal_vertex:l3,morphtarget_pars_vertex:c3,morphtarget_vertex:u3,normal_fragment_begin:d3,normal_fragment_maps:f3,normal_pars_fragment:h3,normal_pars_vertex:p3,normal_vertex:m3,normalmap_pars_fragment:g3,clearcoat_normal_fragment_begin:v3,clearcoat_normal_fragment_maps:_3,clearcoat_pars_fragment:x3,iridescence_pars_fragment:y3,opaque_fragment:S3,packing:M3,premultiplied_alpha_fragment:b3,project_vertex:E3,dithering_fragment:w3,dithering_pars_fragment:T3,roughnessmap_fragment:A3,roughnessmap_pars_fragment:C3,shadowmap_pars_fragment:R3,shadowmap_pars_vertex:P3,shadowmap_vertex:I3,shadowmask_pars_fragment:D3,skinbase_vertex:L3,skinning_pars_vertex:N3,skinning_vertex:U3,skinnormal_vertex:F3,specularmap_fragment:O3,specularmap_pars_fragment:k3,tonemapping_fragment:B3,tonemapping_pars_fragment:V3,transmission_fragment:z3,transmission_pars_fragment:H3,uv_pars_fragment:G3,uv_pars_vertex:$3,uv_vertex:W3,worldpos_vertex:X3,background_vert:q3,background_frag:j3,backgroundCube_vert:Y3,backgroundCube_frag:K3,cube_vert:Z3,cube_frag:J3,depth_vert:Q3,depth_frag:e2,distance_vert:t2,distance_frag:n2,equirect_vert:i2,equirect_frag:s2,linedashed_vert:r2,linedashed_frag:o2,meshbasic_vert:a2,meshbasic_frag:l2,meshlambert_vert:c2,meshlambert_frag:u2,meshmatcap_vert:d2,meshmatcap_frag:f2,meshnormal_vert:h2,meshnormal_frag:p2,meshphong_vert:m2,meshphong_frag:g2,meshphysical_vert:v2,meshphysical_frag:_2,meshtoon_vert:x2,meshtoon_frag:y2,points_vert:S2,points_frag:M2,shadow_vert:b2,shadow_frag:E2,sprite_vert:w2,sprite_frag:T2},Pe={common:{diffuse:{value:new ct(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new nt}},envmap:{envMap:{value:null},envMapRotation:{value:new nt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new nt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new nt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new nt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new nt},normalScale:{value:new gt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new nt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new nt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new nt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new nt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ct(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ct(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0},uvTransform:{value:new nt}},sprite:{diffuse:{value:new ct(16777215)},opacity:{value:1},center:{value:new gt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new nt},alphaMap:{value:null},alphaMapTransform:{value:new nt},alphaTest:{value:0}}},ei={basic:{uniforms:un([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.fog]),vertexShader:it.meshbasic_vert,fragmentShader:it.meshbasic_frag},lambert:{uniforms:un([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new ct(0)}}]),vertexShader:it.meshlambert_vert,fragmentShader:it.meshlambert_frag},phong:{uniforms:un([Pe.common,Pe.specularmap,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,Pe.lights,{emissive:{value:new ct(0)},specular:{value:new ct(1118481)},shininess:{value:30}}]),vertexShader:it.meshphong_vert,fragmentShader:it.meshphong_frag},standard:{uniforms:un([Pe.common,Pe.envmap,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.roughnessmap,Pe.metalnessmap,Pe.fog,Pe.lights,{emissive:{value:new ct(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag},toon:{uniforms:un([Pe.common,Pe.aomap,Pe.lightmap,Pe.emissivemap,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.gradientmap,Pe.fog,Pe.lights,{emissive:{value:new ct(0)}}]),vertexShader:it.meshtoon_vert,fragmentShader:it.meshtoon_frag},matcap:{uniforms:un([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,Pe.fog,{matcap:{value:null}}]),vertexShader:it.meshmatcap_vert,fragmentShader:it.meshmatcap_frag},points:{uniforms:un([Pe.points,Pe.fog]),vertexShader:it.points_vert,fragmentShader:it.points_frag},dashed:{uniforms:un([Pe.common,Pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:it.linedashed_vert,fragmentShader:it.linedashed_frag},depth:{uniforms:un([Pe.common,Pe.displacementmap]),vertexShader:it.depth_vert,fragmentShader:it.depth_frag},normal:{uniforms:un([Pe.common,Pe.bumpmap,Pe.normalmap,Pe.displacementmap,{opacity:{value:1}}]),vertexShader:it.meshnormal_vert,fragmentShader:it.meshnormal_frag},sprite:{uniforms:un([Pe.sprite,Pe.fog]),vertexShader:it.sprite_vert,fragmentShader:it.sprite_frag},background:{uniforms:{uvTransform:{value:new nt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:it.background_vert,fragmentShader:it.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new nt}},vertexShader:it.backgroundCube_vert,fragmentShader:it.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:it.cube_vert,fragmentShader:it.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:it.equirect_vert,fragmentShader:it.equirect_frag},distance:{uniforms:un([Pe.common,Pe.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:it.distance_vert,fragmentShader:it.distance_frag},shadow:{uniforms:un([Pe.lights,Pe.fog,{color:{value:new ct(0)},opacity:{value:1}}]),vertexShader:it.shadow_vert,fragmentShader:it.shadow_frag}};ei.physical={uniforms:un([ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new nt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new nt},clearcoatNormalScale:{value:new gt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new nt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new nt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new nt},sheen:{value:0},sheenColor:{value:new ct(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new nt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new nt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new nt},transmissionSamplerSize:{value:new gt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new nt},attenuationDistance:{value:0},attenuationColor:{value:new ct(0)},specularColor:{value:new ct(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new nt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new nt},anisotropyVector:{value:new gt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new nt}}]),vertexShader:it.meshphysical_vert,fragmentShader:it.meshphysical_frag};const qo={r:0,b:0,g:0},hs=new di,A2=new Dt;function C2(n,e,t,i,s,r,o){const a=new ct(0);let l=r===!0?0:1,c,u,d=null,h=0,g=null;function _(x){let b=x.isScene===!0?x.background:null;return b&&b.isTexture&&(b=(x.backgroundBlurriness>0?t:e).get(b)),b}function v(x){let b=!1;const E=_(x);E===null?p(a,l):E&&E.isColor&&(p(E,1),b=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(x,b){const E=_(b);E&&(E.isCubeTexture||E.mapping===Ga)?(u===void 0&&(u=new wn(new ho(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:hr(ei.backgroundCube.uniforms),vertexShader:ei.backgroundCube.vertexShader,fragmentShader:ei.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,T,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),hs.copy(b.backgroundRotation),hs.x*=-1,hs.y*=-1,hs.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),u.material.uniforms.envMap.value=E,u.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(A2.makeRotationFromEuler(hs)),u.material.toneMapped=ht.getTransfer(E.colorSpace)!==Mt,(d!==E||h!==E.version||g!==n.toneMapping)&&(u.material.needsUpdate=!0,d=E,h=E.version,g=n.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new wn(new po(2,2),new fi({name:"BackgroundMaterial",uniforms:hr(ei.background.uniforms),vertexShader:ei.background.vertexShader,fragmentShader:ei.background.fragmentShader,side:ts,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=ht.getTransfer(E.colorSpace)!==Mt,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||h!==E.version||g!==n.toneMapping)&&(c.material.needsUpdate=!0,d=E,h=E.version,g=n.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,b){x.getRGB(qo,Im(n)),i.buffers.color.setClear(qo.r,qo.g,qo.b,b,o)}function S(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,b=1){a.set(x),l=b,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(a,l)},render:v,addToRenderList:m,dispose:S}}function R2(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,o=!1;function a(w,N,O,q,Q){let te=!1;const H=d(q,O,N);r!==H&&(r=H,c(r.object)),te=g(w,q,O,Q),te&&_(w,q,O,Q),Q!==null&&e.update(Q,n.ELEMENT_ARRAY_BUFFER),(te||o)&&(o=!1,b(w,N,O,q),Q!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(Q).buffer))}function l(){return n.createVertexArray()}function c(w){return n.bindVertexArray(w)}function u(w){return n.deleteVertexArray(w)}function d(w,N,O){const q=O.wireframe===!0;let Q=i[w.id];Q===void 0&&(Q={},i[w.id]=Q);let te=Q[N.id];te===void 0&&(te={},Q[N.id]=te);let H=te[q];return H===void 0&&(H=h(l()),te[q]=H),H}function h(w){const N=[],O=[],q=[];for(let Q=0;Q<t;Q++)N[Q]=0,O[Q]=0,q[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:O,attributeDivisors:q,object:w,attributes:{},index:null}}function g(w,N,O,q){const Q=r.attributes,te=N.attributes;let H=0;const D=O.getAttributes();for(const $ in D)if(D[$].location>=0){const he=Q[$];let ye=te[$];if(ye===void 0&&($==="instanceMatrix"&&w.instanceMatrix&&(ye=w.instanceMatrix),$==="instanceColor"&&w.instanceColor&&(ye=w.instanceColor)),he===void 0||he.attribute!==ye||ye&&he.data!==ye.data)return!0;H++}return r.attributesNum!==H||r.index!==q}function _(w,N,O,q){const Q={},te=N.attributes;let H=0;const D=O.getAttributes();for(const $ in D)if(D[$].location>=0){let he=te[$];he===void 0&&($==="instanceMatrix"&&w.instanceMatrix&&(he=w.instanceMatrix),$==="instanceColor"&&w.instanceColor&&(he=w.instanceColor));const ye={};ye.attribute=he,he&&he.data&&(ye.data=he.data),Q[$]=ye,H++}r.attributes=Q,r.attributesNum=H,r.index=q}function v(){const w=r.newAttributes;for(let N=0,O=w.length;N<O;N++)w[N]=0}function m(w){p(w,0)}function p(w,N){const O=r.newAttributes,q=r.enabledAttributes,Q=r.attributeDivisors;O[w]=1,q[w]===0&&(n.enableVertexAttribArray(w),q[w]=1),Q[w]!==N&&(n.vertexAttribDivisor(w,N),Q[w]=N)}function S(){const w=r.newAttributes,N=r.enabledAttributes;for(let O=0,q=N.length;O<q;O++)N[O]!==w[O]&&(n.disableVertexAttribArray(O),N[O]=0)}function x(w,N,O,q,Q,te,H){H===!0?n.vertexAttribIPointer(w,N,O,Q,te):n.vertexAttribPointer(w,N,O,q,Q,te)}function b(w,N,O,q){v();const Q=q.attributes,te=O.getAttributes(),H=N.defaultAttributeValues;for(const D in te){const $=te[D];if($.location>=0){let fe=Q[D];if(fe===void 0&&(D==="instanceMatrix"&&w.instanceMatrix&&(fe=w.instanceMatrix),D==="instanceColor"&&w.instanceColor&&(fe=w.instanceColor)),fe!==void 0){const he=fe.normalized,ye=fe.itemSize,He=e.get(fe);if(He===void 0)continue;const We=He.buffer,dt=He.type,at=He.bytesPerElement,G=dt===n.INT||dt===n.UNSIGNED_INT||fe.gpuType===Du;if(fe.isInterleavedBufferAttribute){const R=fe.data,W=R.stride,ce=fe.offset;if(R.isInstancedInterleavedBuffer){for(let de=0;de<$.locationSize;de++)p($.location+de,R.meshPerAttribute);w.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=R.meshPerAttribute*R.count)}else for(let de=0;de<$.locationSize;de++)m($.location+de);n.bindBuffer(n.ARRAY_BUFFER,We);for(let de=0;de<$.locationSize;de++)x($.location+de,ye/$.locationSize,dt,he,W*at,(ce+ye/$.locationSize*de)*at,G)}else{if(fe.isInstancedBufferAttribute){for(let R=0;R<$.locationSize;R++)p($.location+R,fe.meshPerAttribute);w.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let R=0;R<$.locationSize;R++)m($.location+R);n.bindBuffer(n.ARRAY_BUFFER,We);for(let R=0;R<$.locationSize;R++)x($.location+R,ye/$.locationSize,dt,he,ye*at,ye/$.locationSize*R*at,G)}}else if(H!==void 0){const he=H[D];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv($.location,he);break;case 3:n.vertexAttrib3fv($.location,he);break;case 4:n.vertexAttrib4fv($.location,he);break;default:n.vertexAttrib1fv($.location,he)}}}}S()}function E(){I();for(const w in i){const N=i[w];for(const O in N){const q=N[O];for(const Q in q)u(q[Q].object),delete q[Q];delete N[O]}delete i[w]}}function A(w){if(i[w.id]===void 0)return;const N=i[w.id];for(const O in N){const q=N[O];for(const Q in q)u(q[Q].object),delete q[Q];delete N[O]}delete i[w.id]}function T(w){for(const N in i){const O=i[N];if(O[w.id]===void 0)continue;const q=O[w.id];for(const Q in q)u(q[Q].object),delete q[Q];delete O[w.id]}}function I(){M(),o=!0,r!==s&&(r=s,c(r.object))}function M(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:M,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:m,disableUnusedAttributes:S}}function P2(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,d){d!==0&&(n.drawArraysInstanced(i,c,u,d),t.update(u,i,d))}function a(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,d);let g=0;for(let _=0;_<d;_++)g+=u[_];t.update(g,i,1)}function l(c,u,d,h){if(d===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let _=0;_<c.length;_++)o(c[_],u[_],h[_]);else{g.multiDrawArraysInstancedWEBGL(i,c,0,u,0,h,0,d);let _=0;for(let v=0;v<d;v++)_+=u[v]*h[v];t.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function I2(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(T){return!(T!==zn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const I=T===Ni&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==bn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==ni&&!I)}function l(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Ze("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),g=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),x=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),A=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:g,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:x,maxFragmentUniforms:b,maxSamples:E,samples:A}}function D2(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new vs,a=new nt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const g=d.length!==0||h||i!==0||s;return s=h,i=d.length,g},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,g){const _=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=n.get(d);if(!s||_===null||_.length===0||r&&!m)r?u(null):c();else{const S=r?0:i,x=S*4;let b=p.clippingState||null;l.value=b,b=u(_,h,x,g);for(let E=0;E!==x;++E)b[E]=t[E];p.clippingState=b,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,h,g,_){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=l.value,_!==!0||m===null){const p=g+v*4,S=h.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,b=g;x!==v;++x,b+=4)o.copy(d[x]).applyMatrix4(S,a),o.normal.toArray(m,b),m[b+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function L2(n){let e=new WeakMap;function t(o,a){return a===bc?o.mapping=As:a===Ec&&(o.mapping=ur),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===bc||a===Ec)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Nm(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const Ji=4,qf=[.125,.215,.35,.446,.526,.582],xs=20,N2=256,Pr=new Wu,jf=new ct;let zl=null,Hl=0,Gl=0,$l=!1;const U2=new J;class Yf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:a=U2}=r;zl=this._renderer.getRenderTarget(),Hl=this._renderer.getActiveCubeFace(),Gl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Jf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(zl,Hl,Gl),this._renderer.xr.enabled=$l,e.scissorTest=!1,Ws(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===As||e.mapping===ur?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zl=this._renderer.getRenderTarget(),Hl=this._renderer.getActiveCubeFace(),Gl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:on,minFilter:on,generateMipmaps:!1,type:Ni,format:zn,colorSpace:fr,depthBuffer:!1},s=Kf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Kf(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=F2(r)),this._blurMaterial=k2(r,e,t),this._ggxMaterial=O2(r,e,t)}return s}_compileMaterial(e){const t=new wn(new Cn,e);this._renderer.compile(t,Pr)}_sceneToCubeUV(e,t,i,s,r){const l=new Ln(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,g=d.toneMapping;d.getClearColor(jf),d.toneMapping=ri,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wn(new ho,new Cm({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,p=!0):(m.color.copy(jf),p=!0);for(let x=0;x<6;x++){const b=x%3;b===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[x],r.y,r.z)):b===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[x]));const E=this._cubeSize;Ws(s,b*E,x>2?E:0,E,E),d.setRenderTarget(s),p&&d.render(v,l),d.render(e,l)}d.toneMapping=g,d.autoClear=h,e.background=S}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===As||e.mapping===ur;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Jf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zf());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Ws(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Pr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const l=o.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=0+c*1.25,g=d*h,{_lodMax:_}=this,v=this._sizeLods[i],m=3*v*(i>_-Ji?i-_+Ji:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=g,l.mipInt.value=_-t,Ws(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(a,Pr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-i,Ws(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(a,Pr)}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&mt("blur direction must be either latitudinal or longitudinal!");const u=3,d=this._lodMeshes[s];d.material=c;const h=c.uniforms,g=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*g):2*Math.PI/(2*xs-1),v=r/_,m=isFinite(r)?1+Math.floor(u*v):xs;m>xs&&Ze(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${xs}`);const p=[];let S=0;for(let T=0;T<xs;++T){const I=T/v,M=Math.exp(-I*I/2);p.push(M),T===0?S+=M:T<m&&(S+=2*M)}for(let T=0;T<p.length;T++)p[T]=p[T]/S;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:x}=this;h.dTheta.value=_,h.mipInt.value=x-i;const b=this._sizeLods[s],E=3*b*(s>x-Ji?s-x+Ji:0),A=4*(this._cubeSize-b);Ws(t,E,A,3*b,2*b),l.setRenderTarget(t),l.render(d,Pr)}}function F2(n){const e=[],t=[],i=[];let s=n;const r=n-Ji+1+qf.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>n-Ji?l=qf[o-n+Ji-1]:o===0&&(l=0),t.push(l);const c=1/(a-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],g=6,_=6,v=3,m=2,p=1,S=new Float32Array(v*_*g),x=new Float32Array(m*_*g),b=new Float32Array(p*_*g);for(let A=0;A<g;A++){const T=A%3*2/3-1,I=A>2?0:-1,M=[T,I,0,T+2/3,I,0,T+2/3,I+1,0,T,I,0,T+2/3,I+1,0,T,I+1,0];S.set(M,v*_*A),x.set(h,m*_*A);const w=[A,A,A,A,A,A];b.set(w,p*_*A)}const E=new Cn;E.setAttribute("position",new ai(S,v)),E.setAttribute("uv",new ai(x,m)),E.setAttribute("faceIndex",new ai(b,p)),i.push(new wn(E,null)),s>Ji&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Kf(n,e,t){const i=new oi(n,e,t);return i.texture.mapping=Ga,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ws(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function O2(n,e,t){return new fi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:N2,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Wa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function k2(n,e,t){const i=new Float32Array(xs),s=new J(0,1,0);return new fi({name:"SphericalGaussianBlur",defines:{n:xs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Wa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Zf(){return new fi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Wa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Jf(){return new fi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Wa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Wa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function B2(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===bc||l===Ec,u=l===As||l===ur;if(c||u){let d=e.get(a);const h=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Yf(n)),d=c?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{const g=a.image;return c&&g&&g.height>0||u&&g&&s(g)?(t===null&&(t=new Yf(n)),d=c?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",r),d.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function V2(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&to("WebGLRenderer: "+i+" extension not supported."),s}}}function z2(n,e,t,i){const s={},r=new WeakMap;function o(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const _ in h.attributes)e.remove(h.attributes[_]);h.removeEventListener("dispose",o),delete s[h.id];const g=r.get(h);g&&(e.remove(g),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(d,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const g in h)e.update(h[g],n.ARRAY_BUFFER)}function c(d){const h=[],g=d.index,_=d.attributes.position;let v=0;if(g!==null){const S=g.array;v=g.version;for(let x=0,b=S.length;x<b;x+=3){const E=S[x+0],A=S[x+1],T=S[x+2];h.push(E,A,A,T,T,E)}}else if(_!==void 0){const S=_.array;v=_.version;for(let x=0,b=S.length/3-1;x<b;x+=3){const E=x+0,A=x+1,T=x+2;h.push(E,A,A,T,T,E)}}else return;const m=new(bm(h)?Pm:Rm)(h,1);m.version=v;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function u(d){const h=r.get(d);if(h){const g=d.index;g!==null&&h.version<g.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function H2(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,g){n.drawElements(i,g,r,h*o),t.update(g,i,1)}function c(h,g,_){_!==0&&(n.drawElementsInstanced(i,g,r,h*o,_),t.update(g,i,_))}function u(h,g,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,r,h,0,_);let m=0;for(let p=0;p<_;p++)m+=g[p];t.update(m,i,1)}function d(h,g,_,v){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/o,g[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,r,h,0,v,0,_);let p=0;for(let S=0;S<_;S++)p+=g[S]*v[S];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function G2(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:mt("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function $2(n,e,t){const i=new WeakMap,s=new Ot;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0;let h=i.get(a);if(h===void 0||h.count!==d){let w=function(){I.dispose(),i.delete(a),a.removeEventListener("dispose",w)};var g=w;h!==void 0&&h.texture.dispose();const _=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],S=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let b=0;_===!0&&(b=1),v===!0&&(b=2),m===!0&&(b=3);let E=a.attributes.position.count*b,A=1;E>e.maxTextureSize&&(A=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const T=new Float32Array(E*A*4*d),I=new Em(T,E,A,d);I.type=ni,I.needsUpdate=!0;const M=b*4;for(let N=0;N<d;N++){const O=p[N],q=S[N],Q=x[N],te=E*A*4*N;for(let H=0;H<O.count;H++){const D=H*M;_===!0&&(s.fromBufferAttribute(O,H),T[te+D+0]=s.x,T[te+D+1]=s.y,T[te+D+2]=s.z,T[te+D+3]=0),v===!0&&(s.fromBufferAttribute(q,H),T[te+D+4]=s.x,T[te+D+5]=s.y,T[te+D+6]=s.z,T[te+D+7]=0),m===!0&&(s.fromBufferAttribute(Q,H),T[te+D+8]=s.x,T[te+D+9]=s.y,T[te+D+10]=s.z,T[te+D+11]=Q.itemSize===4?s.w:1)}}h={count:d,texture:I,size:new gt(E,A)},i.set(a,h),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const v=a.morphTargetsRelative?1:1-_;l.getUniforms().setValue(n,"morphTargetBaseInfluence",v),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function W2(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,u=l.geometry,d=e.get(l,u);if(s.get(d)!==c&&(e.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return d}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const X2={[am]:"LINEAR_TONE_MAPPING",[lm]:"REINHARD_TONE_MAPPING",[cm]:"CINEON_TONE_MAPPING",[um]:"ACES_FILMIC_TONE_MAPPING",[fm]:"AGX_TONE_MAPPING",[hm]:"NEUTRAL_TONE_MAPPING",[dm]:"CUSTOM_TONE_MAPPING"};function q2(n,e,t,i,s){const r=new oi(e,t,{type:n,depthBuffer:i,stencilBuffer:s}),o=new oi(e,t,{type:Ni,depthBuffer:!1,stencilBuffer:!1}),a=new Cn;a.setAttribute("position",new an([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new an([0,2,0,0,2,0],2));const l=new kR({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new wn(a,l),u=new Wu(-1,1,1,-1,0,1);let d=null,h=null,g=!1,_,v=null,m=[],p=!1;this.setSize=function(S,x){r.setSize(S,x),o.setSize(S,x);for(let b=0;b<m.length;b++){const E=m[b];E.setSize&&E.setSize(S,x)}},this.setEffects=function(S){m=S,p=m.length>0&&m[0].isRenderPass===!0;const x=r.width,b=r.height;for(let E=0;E<m.length;E++){const A=m[E];A.setSize&&A.setSize(x,b)}},this.begin=function(S,x){if(g||S.toneMapping===ri&&m.length===0)return!1;if(v=x,x!==null){const b=x.width,E=x.height;(r.width!==b||r.height!==E)&&this.setSize(b,E)}return p===!1&&S.setRenderTarget(r),_=S.toneMapping,S.toneMapping=ri,!0},this.hasRenderPass=function(){return p},this.end=function(S,x){S.toneMapping=_,g=!0;let b=r,E=o;for(let A=0;A<m.length;A++){const T=m[A];if(T.enabled!==!1&&(T.render(S,E,b,x),T.needsSwap!==!1)){const I=b;b=E,E=I}}if(d!==S.outputColorSpace||h!==S.toneMapping){d=S.outputColorSpace,h=S.toneMapping,l.defines={},ht.getTransfer(d)===Mt&&(l.defines.SRGB_TRANSFER="");const A=X2[h];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=b.texture,S.setRenderTarget(v),S.render(c,u),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}const Bm=new pn,ou=new no(1,1),Vm=new Em,zm=new hR,Hm=new Lm,Qf=[],eh=[],th=new Float32Array(16),nh=new Float32Array(9),ih=new Float32Array(4);function vr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Qf[s];if(r===void 0&&(r=new Float32Array(s),Qf[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Wt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Xt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Xa(n,e){let t=eh[e];t===void 0&&(t=new Int32Array(e),eh[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function j2(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Y2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2fv(this.addr,e),Xt(t,e)}}function K2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Wt(t,e))return;n.uniform3fv(this.addr,e),Xt(t,e)}}function Z2(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4fv(this.addr,e),Xt(t,e)}}function J2(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;ih.set(i),n.uniformMatrix2fv(this.addr,!1,ih),Xt(t,i)}}function Q2(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;nh.set(i),n.uniformMatrix3fv(this.addr,!1,nh),Xt(t,i)}}function eI(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Wt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Xt(t,e)}else{if(Wt(t,i))return;th.set(i),n.uniformMatrix4fv(this.addr,!1,th),Xt(t,i)}}function tI(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function nI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2iv(this.addr,e),Xt(t,e)}}function iI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;n.uniform3iv(this.addr,e),Xt(t,e)}}function sI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4iv(this.addr,e),Xt(t,e)}}function rI(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function oI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Wt(t,e))return;n.uniform2uiv(this.addr,e),Xt(t,e)}}function aI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Wt(t,e))return;n.uniform3uiv(this.addr,e),Xt(t,e)}}function lI(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Wt(t,e))return;n.uniform4uiv(this.addr,e),Xt(t,e)}}function cI(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(ou.compareFunction=t.isReversedDepthBuffer()?Bu:ku,r=ou):r=Bm,t.setTexture2D(e||r,s)}function uI(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||zm,s)}function dI(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Hm,s)}function fI(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Vm,s)}function hI(n){switch(n){case 5126:return j2;case 35664:return Y2;case 35665:return K2;case 35666:return Z2;case 35674:return J2;case 35675:return Q2;case 35676:return eI;case 5124:case 35670:return tI;case 35667:case 35671:return nI;case 35668:case 35672:return iI;case 35669:case 35673:return sI;case 5125:return rI;case 36294:return oI;case 36295:return aI;case 36296:return lI;case 35678:case 36198:case 36298:case 36306:case 35682:return cI;case 35679:case 36299:case 36307:return uI;case 35680:case 36300:case 36308:case 36293:return dI;case 36289:case 36303:case 36311:case 36292:return fI}}function pI(n,e){n.uniform1fv(this.addr,e)}function mI(n,e){const t=vr(e,this.size,2);n.uniform2fv(this.addr,t)}function gI(n,e){const t=vr(e,this.size,3);n.uniform3fv(this.addr,t)}function vI(n,e){const t=vr(e,this.size,4);n.uniform4fv(this.addr,t)}function _I(n,e){const t=vr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function xI(n,e){const t=vr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function yI(n,e){const t=vr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function SI(n,e){n.uniform1iv(this.addr,e)}function MI(n,e){n.uniform2iv(this.addr,e)}function bI(n,e){n.uniform3iv(this.addr,e)}function EI(n,e){n.uniform4iv(this.addr,e)}function wI(n,e){n.uniform1uiv(this.addr,e)}function TI(n,e){n.uniform2uiv(this.addr,e)}function AI(n,e){n.uniform3uiv(this.addr,e)}function CI(n,e){n.uniform4uiv(this.addr,e)}function RI(n,e,t){const i=this.cache,s=e.length,r=Xa(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=ou:o=Bm;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function PI(n,e,t){const i=this.cache,s=e.length,r=Xa(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||zm,r[o])}function II(n,e,t){const i=this.cache,s=e.length,r=Xa(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Hm,r[o])}function DI(n,e,t){const i=this.cache,s=e.length,r=Xa(t,s);Wt(i,r)||(n.uniform1iv(this.addr,r),Xt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Vm,r[o])}function LI(n){switch(n){case 5126:return pI;case 35664:return mI;case 35665:return gI;case 35666:return vI;case 35674:return _I;case 35675:return xI;case 35676:return yI;case 5124:case 35670:return SI;case 35667:case 35671:return MI;case 35668:case 35672:return bI;case 35669:case 35673:return EI;case 5125:return wI;case 36294:return TI;case 36295:return AI;case 36296:return CI;case 35678:case 36198:case 36298:case 36306:case 35682:return RI;case 35679:case 36299:case 36307:return PI;case 35680:case 36300:case 36308:case 36293:return II;case 36289:case 36303:case 36311:case 36292:return DI}}class NI{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=hI(t.type)}}class UI{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=LI(t.type)}}class FI{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const Wl=/(\w+)(\])?(\[|\.)?/g;function sh(n,e){n.seq.push(e),n.map[e.id]=e}function OI(n,e,t){const i=n.name,s=i.length;for(Wl.lastIndex=0;;){const r=Wl.exec(i),o=Wl.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){sh(t,c===void 0?new NI(a,n,e):new UI(a,n,e));break}else{let d=t.map[a];d===void 0&&(d=new FI(a),sh(t,d)),t=d}}}class aa{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);OI(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function rh(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const kI=37297;let BI=0;function VI(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const oh=new nt;function zI(n){ht._getMatrix(oh,ht.workingColorSpace,n);const e=`mat3( ${oh.elements.map(t=>t.toFixed(4))} )`;switch(ht.getTransfer(n)){case xa:return[e,"LinearTransferOETF"];case Mt:return[e,"sRGBTransferOETF"];default:return Ze("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function ah(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+VI(n.getShaderSource(e),a)}else return r}function HI(n,e){const t=zI(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const GI={[am]:"Linear",[lm]:"Reinhard",[cm]:"Cineon",[um]:"ACESFilmic",[fm]:"AgX",[hm]:"Neutral",[dm]:"Custom"};function $I(n,e){const t=GI[e];return t===void 0?(Ze("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const jo=new J;function WI(){ht.getLuminanceCoefficients(jo);const n=jo.x.toFixed(4),e=jo.y.toFixed(4),t=jo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function XI(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ur).join(`
`)}function qI(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function jI(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Ur(n){return n!==""}function lh(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ch(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const YI=/^[ \t]*#include +<([\w\d./]+)>/gm;function au(n){return n.replace(YI,ZI)}const KI=new Map;function ZI(n,e){let t=it[e];if(t===void 0){const i=KI.get(e);if(i!==void 0)t=it[i],Ze('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return au(t)}const JI=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uh(n){return n.replace(JI,QI)}function QI(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function dh(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const eD={[na]:"SHADOWMAP_TYPE_PCF",[Lr]:"SHADOWMAP_TYPE_VSM"};function tD(n){return eD[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const nD={[As]:"ENVMAP_TYPE_CUBE",[ur]:"ENVMAP_TYPE_CUBE",[Ga]:"ENVMAP_TYPE_CUBE_UV"};function iD(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":nD[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const sD={[ur]:"ENVMAP_MODE_REFRACTION"};function rD(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":sD[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const oD={[Iu]:"ENVMAP_BLENDING_MULTIPLY",[jC]:"ENVMAP_BLENDING_MIX",[YC]:"ENVMAP_BLENDING_ADD"};function aD(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":oD[n.combine]||"ENVMAP_BLENDING_NONE"}function lD(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function cD(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=tD(t),c=iD(t),u=rD(t),d=aD(t),h=lD(t),g=XI(t),_=qI(r),v=s.createProgram();let m,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),p.length>0&&(p+=`
`)):(m=[dh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ur).join(`
`),p=[dh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ri?"#define TONE_MAPPING":"",t.toneMapping!==ri?it.tonemapping_pars_fragment:"",t.toneMapping!==ri?$I("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",it.colorspace_pars_fragment,HI("linearToOutputTexel",t.outputColorSpace),WI(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ur).join(`
`)),o=au(o),o=lh(o,t),o=ch(o,t),a=au(a),a=lh(a,t),a=ch(a,t),o=uh(o),a=uh(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===bf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===bf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const x=S+m+o,b=S+p+a,E=rh(s,s.VERTEX_SHADER,x),A=rh(s,s.FRAGMENT_SHADER,b);s.attachShader(v,E),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function T(N){if(n.debug.checkShaderErrors){const O=s.getProgramInfoLog(v)||"",q=s.getShaderInfoLog(E)||"",Q=s.getShaderInfoLog(A)||"",te=O.trim(),H=q.trim(),D=Q.trim();let $=!0,fe=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if($=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,E,A);else{const he=ah(s,E,"vertex"),ye=ah(s,A,"fragment");mt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+te+`
`+he+`
`+ye)}else te!==""?Ze("WebGLProgram: Program Info Log:",te):(H===""||D==="")&&(fe=!1);fe&&(N.diagnostics={runnable:$,programLog:te,vertexShader:{log:H,prefix:m},fragmentShader:{log:D,prefix:p}})}s.deleteShader(E),s.deleteShader(A),I=new aa(s,v),M=jI(s,v)}let I;this.getUniforms=function(){return I===void 0&&T(this),I};let M;this.getAttributes=function(){return M===void 0&&T(this),M};let w=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=s.getProgramParameter(v,kI)),w},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=BI++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=A,this}let uD=0;class dD{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new fD(e),t.set(e,i)),i}}class fD{constructor(e){this.id=uD++,this.code=e,this.usedTimes=0}}function hD(n,e,t,i,s,r,o){const a=new Tm,l=new dD,c=new Set,u=[],d=new Map,h=s.logarithmicDepthBuffer;let g=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,w,N,O,q){const Q=O.fog,te=q.geometry,H=M.isMeshStandardMaterial?O.environment:null,D=(M.isMeshStandardMaterial?t:e).get(M.envMap||H),$=D&&D.mapping===Ga?D.image.height:null,fe=_[M.type];M.precision!==null&&(g=s.getMaxPrecision(M.precision),g!==M.precision&&Ze("WebGLProgram.getParameters:",M.precision,"not supported, using",g,"instead."));const he=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,ye=he!==void 0?he.length:0;let He=0;te.morphAttributes.position!==void 0&&(He=1),te.morphAttributes.normal!==void 0&&(He=2),te.morphAttributes.color!==void 0&&(He=3);let We,dt,at,G;if(fe){const yt=ei[fe];We=yt.vertexShader,dt=yt.fragmentShader}else We=M.vertexShader,dt=M.fragmentShader,l.update(M),at=l.getVertexShaderID(M),G=l.getFragmentShaderID(M);const R=n.getRenderTarget(),W=n.state.buffers.depth.getReversed(),ce=q.isInstancedMesh===!0,de=q.isBatchedMesh===!0,Be=!!M.map,U=!!M.matcap,k=!!D,X=!!M.aoMap,re=!!M.lightMap,ie=!!M.bumpMap,ae=!!M.normalMap,L=!!M.displacementMap,_e=!!M.emissiveMap,pe=!!M.metalnessMap,ue=!!M.roughnessMap,me=M.anisotropy>0,C=M.clearcoat>0,y=M.dispersion>0,V=M.iridescence>0,ee=M.sheen>0,le=M.transmission>0,Z=me&&!!M.anisotropyMap,Ie=C&&!!M.clearcoatMap,Se=C&&!!M.clearcoatNormalMap,Ne=C&&!!M.clearcoatRoughnessMap,Ge=V&&!!M.iridescenceMap,xe=V&&!!M.iridescenceThicknessMap,we=ee&&!!M.sheenColorMap,Ce=ee&&!!M.sheenRoughnessMap,Fe=!!M.specularMap,Ee=!!M.specularColorMap,tt=!!M.specularIntensityMap,j=le&&!!M.transmissionMap,Le=le&&!!M.thicknessMap,be=!!M.gradientMap,ke=!!M.alphaMap,Me=M.alphaTest>0,ge=!!M.alphaHash,Ae=!!M.extensions;let Je=ri;M.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(Je=n.toneMapping);const Ct={shaderID:fe,shaderType:M.type,shaderName:M.name,vertexShader:We,fragmentShader:dt,defines:M.defines,customVertexShaderID:at,customFragmentShaderID:G,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:g,batching:de,batchingColor:de&&q._colorsTexture!==null,instancing:ce,instancingColor:ce&&q.instanceColor!==null,instancingMorph:ce&&q.morphTexture!==null,outputColorSpace:R===null?n.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:fr,alphaToCoverage:!!M.alphaToCoverage,map:Be,matcap:U,envMap:k,envMapMode:k&&D.mapping,envMapCubeUVHeight:$,aoMap:X,lightMap:re,bumpMap:ie,normalMap:ae,displacementMap:L,emissiveMap:_e,normalMapObjectSpace:ae&&M.normalMapType===JC,normalMapTangentSpace:ae&&M.normalMapType===Mm,metalnessMap:pe,roughnessMap:ue,anisotropy:me,anisotropyMap:Z,clearcoat:C,clearcoatMap:Ie,clearcoatNormalMap:Se,clearcoatRoughnessMap:Ne,dispersion:y,iridescence:V,iridescenceMap:Ge,iridescenceThicknessMap:xe,sheen:ee,sheenColorMap:we,sheenRoughnessMap:Ce,specularMap:Fe,specularColorMap:Ee,specularIntensityMap:tt,transmission:le,transmissionMap:j,thicknessMap:Le,gradientMap:be,opaque:M.transparent===!1&&M.blending===er&&M.alphaToCoverage===!1,alphaMap:ke,alphaTest:Me,alphaHash:ge,combine:M.combine,mapUv:Be&&v(M.map.channel),aoMapUv:X&&v(M.aoMap.channel),lightMapUv:re&&v(M.lightMap.channel),bumpMapUv:ie&&v(M.bumpMap.channel),normalMapUv:ae&&v(M.normalMap.channel),displacementMapUv:L&&v(M.displacementMap.channel),emissiveMapUv:_e&&v(M.emissiveMap.channel),metalnessMapUv:pe&&v(M.metalnessMap.channel),roughnessMapUv:ue&&v(M.roughnessMap.channel),anisotropyMapUv:Z&&v(M.anisotropyMap.channel),clearcoatMapUv:Ie&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:Se&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ne&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Ge&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:xe&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:we&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&v(M.sheenRoughnessMap.channel),specularMapUv:Fe&&v(M.specularMap.channel),specularColorMapUv:Ee&&v(M.specularColorMap.channel),specularIntensityMapUv:tt&&v(M.specularIntensityMap.channel),transmissionMapUv:j&&v(M.transmissionMap.channel),thicknessMapUv:Le&&v(M.thicknessMap.channel),alphaMapUv:ke&&v(M.alphaMap.channel),vertexTangents:!!te.attributes.tangent&&(ae||me),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!te.attributes.uv&&(Be||ke),fog:!!Q,useFog:M.fog===!0,fogExp2:!!Q&&Q.isFogExp2,flatShading:M.flatShading===!0&&M.wireframe===!1,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:W,skinning:q.isSkinnedMesh===!0,morphTargets:te.morphAttributes.position!==void 0,morphNormals:te.morphAttributes.normal!==void 0,morphColors:te.morphAttributes.color!==void 0,morphTargetsCount:ye,morphTextureStride:He,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:n.shadowMap.enabled&&N.length>0,shadowMapType:n.shadowMap.type,toneMapping:Je,decodeVideoTexture:Be&&M.map.isVideoTexture===!0&&ht.getTransfer(M.map.colorSpace)===Mt,decodeVideoTextureEmissive:_e&&M.emissiveMap.isVideoTexture===!0&&ht.getTransfer(M.emissiveMap.colorSpace)===Mt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===ti,flipSided:M.side===_n,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ae&&M.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ae&&M.extensions.multiDraw===!0||de)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Ct.vertexUv1s=c.has(1),Ct.vertexUv2s=c.has(2),Ct.vertexUv3s=c.has(3),c.clear(),Ct}function p(M){const w=[];if(M.shaderID?w.push(M.shaderID):(w.push(M.customVertexShaderID),w.push(M.customFragmentShaderID)),M.defines!==void 0)for(const N in M.defines)w.push(N),w.push(M.defines[N]);return M.isRawShaderMaterial===!1&&(S(w,M),x(w,M),w.push(n.outputColorSpace)),w.push(M.customProgramCacheKey),w.join()}function S(M,w){M.push(w.precision),M.push(w.outputColorSpace),M.push(w.envMapMode),M.push(w.envMapCubeUVHeight),M.push(w.mapUv),M.push(w.alphaMapUv),M.push(w.lightMapUv),M.push(w.aoMapUv),M.push(w.bumpMapUv),M.push(w.normalMapUv),M.push(w.displacementMapUv),M.push(w.emissiveMapUv),M.push(w.metalnessMapUv),M.push(w.roughnessMapUv),M.push(w.anisotropyMapUv),M.push(w.clearcoatMapUv),M.push(w.clearcoatNormalMapUv),M.push(w.clearcoatRoughnessMapUv),M.push(w.iridescenceMapUv),M.push(w.iridescenceThicknessMapUv),M.push(w.sheenColorMapUv),M.push(w.sheenRoughnessMapUv),M.push(w.specularMapUv),M.push(w.specularColorMapUv),M.push(w.specularIntensityMapUv),M.push(w.transmissionMapUv),M.push(w.thicknessMapUv),M.push(w.combine),M.push(w.fogExp2),M.push(w.sizeAttenuation),M.push(w.morphTargetsCount),M.push(w.morphAttributeCount),M.push(w.numDirLights),M.push(w.numPointLights),M.push(w.numSpotLights),M.push(w.numSpotLightMaps),M.push(w.numHemiLights),M.push(w.numRectAreaLights),M.push(w.numDirLightShadows),M.push(w.numPointLightShadows),M.push(w.numSpotLightShadows),M.push(w.numSpotLightShadowsWithMaps),M.push(w.numLightProbes),M.push(w.shadowMapType),M.push(w.toneMapping),M.push(w.numClippingPlanes),M.push(w.numClipIntersection),M.push(w.depthPacking)}function x(M,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),M.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),M.push(a.mask)}function b(M){const w=_[M.type];let N;if(w){const O=ei[w];N=TR.clone(O.uniforms)}else N=M.uniforms;return N}function E(M,w){let N=d.get(w);return N!==void 0?++N.usedTimes:(N=new cD(n,w,M,r),u.push(N),d.set(w,N)),N}function A(M){if(--M.usedTimes===0){const w=u.indexOf(M);u[w]=u[u.length-1],u.pop(),d.delete(M.cacheKey),M.destroy()}}function T(M){l.remove(M)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:b,acquireProgram:E,releaseProgram:A,releaseShaderCache:T,programs:u,dispose:I}}function pD(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function mD(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function fh(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function hh(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(d,h,g,_,v,m){let p=n[e];return p===void 0?(p={id:d.id,object:d,geometry:h,material:g,groupOrder:_,renderOrder:d.renderOrder,z:v,group:m},n[e]=p):(p.id=d.id,p.object=d,p.geometry=h,p.material=g,p.groupOrder=_,p.renderOrder=d.renderOrder,p.z=v,p.group=m),e++,p}function a(d,h,g,_,v,m){const p=o(d,h,g,_,v,m);g.transmission>0?i.push(p):g.transparent===!0?s.push(p):t.push(p)}function l(d,h,g,_,v,m){const p=o(d,h,g,_,v,m);g.transmission>0?i.unshift(p):g.transparent===!0?s.unshift(p):t.unshift(p)}function c(d,h){t.length>1&&t.sort(d||mD),i.length>1&&i.sort(h||fh),s.length>1&&s.sort(h||fh)}function u(){for(let d=e,h=n.length;d<h;d++){const g=n[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function gD(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new hh,n.set(i,[o])):s>=r.length?(o=new hh,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function vD(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new J,color:new ct};break;case"SpotLight":t={position:new J,direction:new J,color:new ct,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new J,color:new ct,distance:0,decay:0};break;case"HemisphereLight":t={direction:new J,skyColor:new ct,groundColor:new ct};break;case"RectAreaLight":t={color:new ct,position:new J,halfWidth:new J,halfHeight:new J};break}return n[e.id]=t,t}}}function _D(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new gt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new gt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new gt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let xD=0;function yD(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function SD(n){const e=new vD,t=_D(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new J);const s=new J,r=new Dt,o=new Dt;function a(c){let u=0,d=0,h=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let g=0,_=0,v=0,m=0,p=0,S=0,x=0,b=0,E=0,A=0,T=0;c.sort(yD);for(let M=0,w=c.length;M<w;M++){const N=c[M],O=N.color,q=N.intensity,Q=N.distance;let te=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===dr?te=N.shadow.map.texture:te=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)u+=O.r*q,d+=O.g*q,h+=O.b*q;else if(N.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(N.sh.coefficients[H],q);T++}else if(N.isDirectionalLight){const H=e.get(N);if(H.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){const D=N.shadow,$=t.get(N);$.shadowIntensity=D.intensity,$.shadowBias=D.bias,$.shadowNormalBias=D.normalBias,$.shadowRadius=D.radius,$.shadowMapSize=D.mapSize,i.directionalShadow[g]=$,i.directionalShadowMap[g]=te,i.directionalShadowMatrix[g]=N.shadow.matrix,S++}i.directional[g]=H,g++}else if(N.isSpotLight){const H=e.get(N);H.position.setFromMatrixPosition(N.matrixWorld),H.color.copy(O).multiplyScalar(q),H.distance=Q,H.coneCos=Math.cos(N.angle),H.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),H.decay=N.decay,i.spot[v]=H;const D=N.shadow;if(N.map&&(i.spotLightMap[E]=N.map,E++,D.updateMatrices(N),N.castShadow&&A++),i.spotLightMatrix[v]=D.matrix,N.castShadow){const $=t.get(N);$.shadowIntensity=D.intensity,$.shadowBias=D.bias,$.shadowNormalBias=D.normalBias,$.shadowRadius=D.radius,$.shadowMapSize=D.mapSize,i.spotShadow[v]=$,i.spotShadowMap[v]=te,b++}v++}else if(N.isRectAreaLight){const H=e.get(N);H.color.copy(O).multiplyScalar(q),H.halfWidth.set(N.width*.5,0,0),H.halfHeight.set(0,N.height*.5,0),i.rectArea[m]=H,m++}else if(N.isPointLight){const H=e.get(N);if(H.color.copy(N.color).multiplyScalar(N.intensity),H.distance=N.distance,H.decay=N.decay,N.castShadow){const D=N.shadow,$=t.get(N);$.shadowIntensity=D.intensity,$.shadowBias=D.bias,$.shadowNormalBias=D.normalBias,$.shadowRadius=D.radius,$.shadowMapSize=D.mapSize,$.shadowCameraNear=D.camera.near,$.shadowCameraFar=D.camera.far,i.pointShadow[_]=$,i.pointShadowMap[_]=te,i.pointShadowMatrix[_]=N.shadow.matrix,x++}i.point[_]=H,_++}else if(N.isHemisphereLight){const H=e.get(N);H.skyColor.copy(N.color).multiplyScalar(q),H.groundColor.copy(N.groundColor).multiplyScalar(q),i.hemi[p]=H,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Pe.LTC_FLOAT_1,i.rectAreaLTC2=Pe.LTC_FLOAT_2):(i.rectAreaLTC1=Pe.LTC_HALF_1,i.rectAreaLTC2=Pe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=h;const I=i.hash;(I.directionalLength!==g||I.pointLength!==_||I.spotLength!==v||I.rectAreaLength!==m||I.hemiLength!==p||I.numDirectionalShadows!==S||I.numPointShadows!==x||I.numSpotShadows!==b||I.numSpotMaps!==E||I.numLightProbes!==T)&&(i.directional.length=g,i.spot.length=v,i.rectArea.length=m,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=b+E-A,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=T,I.directionalLength=g,I.pointLength=_,I.spotLength=v,I.rectAreaLength=m,I.hemiLength=p,I.numDirectionalShadows=S,I.numPointShadows=x,I.numSpotShadows=b,I.numSpotMaps=E,I.numLightProbes=T,i.version=xD++)}function l(c,u){let d=0,h=0,g=0,_=0,v=0;const m=u.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){const x=c[p];if(x.isDirectionalLight){const b=i.directional[d];b.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),d++}else if(x.isSpotLight){const b=i.spot[g];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const b=i.rectArea[_];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(m),o.identity(),r.copy(x.matrixWorld),r.premultiply(m),o.extractRotation(r),b.halfWidth.set(x.width*.5,0,0),b.halfHeight.set(0,x.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),_++}else if(x.isPointLight){const b=i.point[h];b.position.setFromMatrixPosition(x.matrixWorld),b.position.applyMatrix4(m),h++}else if(x.isHemisphereLight){const b=i.hemi[v];b.direction.setFromMatrixPosition(x.matrixWorld),b.direction.transformDirection(m),v++}}}return{setup:a,setupView:l,state:i}}function ph(n){const e=new SD(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function MD(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new ph(n),e.set(s,[a])):r>=o.length?(a=new ph(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const bD=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ED=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,wD=[new J(1,0,0),new J(-1,0,0),new J(0,1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1)],TD=[new J(0,-1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1),new J(0,-1,0),new J(0,-1,0)],mh=new Dt,Ir=new J,Xl=new J;function AD(n,e,t){let i=new Hu;const s=new gt,r=new gt,o=new Ot,a=new BR,l=new VR,c={},u=t.maxTextureSize,d={[ts]:_n,[_n]:ts,[ti]:ti},h=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new gt},radius:{value:4}},vertexShader:bD,fragmentShader:ED}),g=h.clone();g.defines.HORIZONTAL_PASS=1;const _=new Cn;_.setAttribute("position",new ai(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new wn(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=na;let p=this.type;this.render=function(A,T,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;A.type===RC&&(Ze("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),A.type=na);const M=n.getRenderTarget(),w=n.getActiveCubeFace(),N=n.getActiveMipmapLevel(),O=n.state;O.setBlending(Ri),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const q=p!==this.type;q&&T.traverse(function(Q){Q.material&&(Array.isArray(Q.material)?Q.material.forEach(te=>te.needsUpdate=!0):Q.material.needsUpdate=!0)});for(let Q=0,te=A.length;Q<te;Q++){const H=A[Q],D=H.shadow;if(D===void 0){Ze("WebGLShadowMap:",H,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;s.copy(D.mapSize);const $=D.getFrameExtents();if(s.multiply($),r.copy(D.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/$.x),s.x=r.x*$.x,D.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/$.y),s.y=r.y*$.y,D.mapSize.y=r.y)),D.map===null||q===!0){if(D.map!==null&&(D.map.depthTexture!==null&&(D.map.depthTexture.dispose(),D.map.depthTexture=null),D.map.dispose()),this.type===Lr){if(H.isPointLight){Ze("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}D.map=new oi(s.x,s.y,{format:dr,type:Ni,minFilter:on,magFilter:on,generateMipmaps:!1}),D.map.texture.name=H.name+".shadowMap",D.map.depthTexture=new no(s.x,s.y,ni),D.map.depthTexture.name=H.name+".shadowMapDepth",D.map.depthTexture.format=Ui,D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=Zt,D.map.depthTexture.magFilter=Zt}else{H.isPointLight?(D.map=new Nm(s.x),D.map.depthTexture=new OR(s.x,ui)):(D.map=new oi(s.x,s.y),D.map.depthTexture=new no(s.x,s.y,ui)),D.map.depthTexture.name=H.name+".shadowMap",D.map.depthTexture.format=Ui;const he=n.state.buffers.depth.getReversed();this.type===na?(D.map.depthTexture.compareFunction=he?Bu:ku,D.map.depthTexture.minFilter=on,D.map.depthTexture.magFilter=on):(D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=Zt,D.map.depthTexture.magFilter=Zt)}D.camera.updateProjectionMatrix()}const fe=D.map.isWebGLCubeRenderTarget?6:1;for(let he=0;he<fe;he++){if(D.map.isWebGLCubeRenderTarget)n.setRenderTarget(D.map,he),n.clear();else{he===0&&(n.setRenderTarget(D.map),n.clear());const ye=D.getViewport(he);o.set(r.x*ye.x,r.y*ye.y,r.x*ye.z,r.y*ye.w),O.viewport(o)}if(H.isPointLight){const ye=D.camera,He=D.matrix,We=H.distance||ye.far;We!==ye.far&&(ye.far=We,ye.updateProjectionMatrix()),Ir.setFromMatrixPosition(H.matrixWorld),ye.position.copy(Ir),Xl.copy(ye.position),Xl.add(wD[he]),ye.up.copy(TD[he]),ye.lookAt(Xl),ye.updateMatrixWorld(),He.makeTranslation(-Ir.x,-Ir.y,-Ir.z),mh.multiplyMatrices(ye.projectionMatrix,ye.matrixWorldInverse),D._frustum.setFromProjectionMatrix(mh,ye.coordinateSystem,ye.reversedDepth)}else D.updateMatrices(H);i=D.getFrustum(),b(T,I,D.camera,H,this.type)}D.isPointLightShadow!==!0&&this.type===Lr&&S(D,I),D.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(M,w,N)};function S(A,T){const I=e.update(v);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,g.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,g.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new oi(s.x,s.y,{format:dr,type:Ni})),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value=A.mapSize,h.uniforms.radius.value=A.radius,n.setRenderTarget(A.mapPass),n.clear(),n.renderBufferDirect(T,null,I,h,v,null),g.uniforms.shadow_pass.value=A.mapPass.texture,g.uniforms.resolution.value=A.mapSize,g.uniforms.radius.value=A.radius,n.setRenderTarget(A.map),n.clear(),n.renderBufferDirect(T,null,I,g,v,null)}function x(A,T,I,M){let w=null;const N=I.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(N!==void 0)w=N;else if(w=I.isPointLight===!0?l:a,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){const O=w.uuid,q=T.uuid;let Q=c[O];Q===void 0&&(Q={},c[O]=Q);let te=Q[q];te===void 0&&(te=w.clone(),Q[q]=te,T.addEventListener("dispose",E)),w=te}if(w.visible=T.visible,w.wireframe=T.wireframe,M===Lr?w.side=T.shadowSide!==null?T.shadowSide:T.side:w.side=T.shadowSide!==null?T.shadowSide:d[T.side],w.alphaMap=T.alphaMap,w.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,w.map=T.map,w.clipShadows=T.clipShadows,w.clippingPlanes=T.clippingPlanes,w.clipIntersection=T.clipIntersection,w.displacementMap=T.displacementMap,w.displacementScale=T.displacementScale,w.displacementBias=T.displacementBias,w.wireframeLinewidth=T.wireframeLinewidth,w.linewidth=T.linewidth,I.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const O=n.properties.get(w);O.light=I}return w}function b(A,T,I,M,w){if(A.visible===!1)return;if(A.layers.test(T.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&w===Lr)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,A.matrixWorld);const q=e.update(A),Q=A.material;if(Array.isArray(Q)){const te=q.groups;for(let H=0,D=te.length;H<D;H++){const $=te[H],fe=Q[$.materialIndex];if(fe&&fe.visible){const he=x(A,fe,M,w);A.onBeforeShadow(n,A,T,I,q,he,$),n.renderBufferDirect(I,null,q,he,A,$),A.onAfterShadow(n,A,T,I,q,he,$)}}}else if(Q.visible){const te=x(A,Q,M,w);A.onBeforeShadow(n,A,T,I,q,te,null),n.renderBufferDirect(I,null,q,te,A,null),A.onAfterShadow(n,A,T,I,q,te,null)}}const O=A.children;for(let q=0,Q=O.length;q<Q;q++)b(O[q],T,I,M,w)}function E(A){A.target.removeEventListener("dispose",E);for(const I in c){const M=c[I],w=A.target.uuid;w in M&&(M[w].dispose(),delete M[w])}}}const CD={[gc]:vc,[_c]:Sc,[xc]:Mc,[cr]:yc,[vc]:gc,[Sc]:_c,[Mc]:xc,[yc]:cr};function RD(n,e){function t(){let j=!1;const Le=new Ot;let be=null;const ke=new Ot(0,0,0,0);return{setMask:function(Me){be!==Me&&!j&&(n.colorMask(Me,Me,Me,Me),be=Me)},setLocked:function(Me){j=Me},setClear:function(Me,ge,Ae,Je,Ct){Ct===!0&&(Me*=Je,ge*=Je,Ae*=Je),Le.set(Me,ge,Ae,Je),ke.equals(Le)===!1&&(n.clearColor(Me,ge,Ae,Je),ke.copy(Le))},reset:function(){j=!1,be=null,ke.set(-1,0,0,0)}}}function i(){let j=!1,Le=!1,be=null,ke=null,Me=null;return{setReversed:function(ge){if(Le!==ge){const Ae=e.get("EXT_clip_control");ge?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),Le=ge;const Je=Me;Me=null,this.setClear(Je)}},getReversed:function(){return Le},setTest:function(ge){ge?R(n.DEPTH_TEST):W(n.DEPTH_TEST)},setMask:function(ge){be!==ge&&!j&&(n.depthMask(ge),be=ge)},setFunc:function(ge){if(Le&&(ge=CD[ge]),ke!==ge){switch(ge){case gc:n.depthFunc(n.NEVER);break;case vc:n.depthFunc(n.ALWAYS);break;case _c:n.depthFunc(n.LESS);break;case cr:n.depthFunc(n.LEQUAL);break;case xc:n.depthFunc(n.EQUAL);break;case yc:n.depthFunc(n.GEQUAL);break;case Sc:n.depthFunc(n.GREATER);break;case Mc:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ke=ge}},setLocked:function(ge){j=ge},setClear:function(ge){Me!==ge&&(Le&&(ge=1-ge),n.clearDepth(ge),Me=ge)},reset:function(){j=!1,be=null,ke=null,Me=null,Le=!1}}}function s(){let j=!1,Le=null,be=null,ke=null,Me=null,ge=null,Ae=null,Je=null,Ct=null;return{setTest:function(yt){j||(yt?R(n.STENCIL_TEST):W(n.STENCIL_TEST))},setMask:function(yt){Le!==yt&&!j&&(n.stencilMask(yt),Le=yt)},setFunc:function(yt,jn,mi){(be!==yt||ke!==jn||Me!==mi)&&(n.stencilFunc(yt,jn,mi),be=yt,ke=jn,Me=mi)},setOp:function(yt,jn,mi){(ge!==yt||Ae!==jn||Je!==mi)&&(n.stencilOp(yt,jn,mi),ge=yt,Ae=jn,Je=mi)},setLocked:function(yt){j=yt},setClear:function(yt){Ct!==yt&&(n.clearStencil(yt),Ct=yt)},reset:function(){j=!1,Le=null,be=null,ke=null,Me=null,ge=null,Ae=null,Je=null,Ct=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let u={},d={},h=new WeakMap,g=[],_=null,v=!1,m=null,p=null,S=null,x=null,b=null,E=null,A=null,T=new ct(0,0,0),I=0,M=!1,w=null,N=null,O=null,q=null,Q=null;const te=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,D=0;const $=n.getParameter(n.VERSION);$.indexOf("WebGL")!==-1?(D=parseFloat(/^WebGL (\d)/.exec($)[1]),H=D>=1):$.indexOf("OpenGL ES")!==-1&&(D=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),H=D>=2);let fe=null,he={};const ye=n.getParameter(n.SCISSOR_BOX),He=n.getParameter(n.VIEWPORT),We=new Ot().fromArray(ye),dt=new Ot().fromArray(He);function at(j,Le,be,ke){const Me=new Uint8Array(4),ge=n.createTexture();n.bindTexture(j,ge),n.texParameteri(j,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(j,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ae=0;Ae<be;Ae++)j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?n.texImage3D(Le,0,n.RGBA,1,1,ke,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(Le+Ae,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return ge}const G={};G[n.TEXTURE_2D]=at(n.TEXTURE_2D,n.TEXTURE_2D,1),G[n.TEXTURE_CUBE_MAP]=at(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),G[n.TEXTURE_2D_ARRAY]=at(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),G[n.TEXTURE_3D]=at(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),R(n.DEPTH_TEST),o.setFunc(cr),ie(!1),ae(vf),R(n.CULL_FACE),X(Ri);function R(j){u[j]!==!0&&(n.enable(j),u[j]=!0)}function W(j){u[j]!==!1&&(n.disable(j),u[j]=!1)}function ce(j,Le){return d[j]!==Le?(n.bindFramebuffer(j,Le),d[j]=Le,j===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=Le),j===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=Le),!0):!1}function de(j,Le){let be=g,ke=!1;if(j){be=h.get(Le),be===void 0&&(be=[],h.set(Le,be));const Me=j.textures;if(be.length!==Me.length||be[0]!==n.COLOR_ATTACHMENT0){for(let ge=0,Ae=Me.length;ge<Ae;ge++)be[ge]=n.COLOR_ATTACHMENT0+ge;be.length=Me.length,ke=!0}}else be[0]!==n.BACK&&(be[0]=n.BACK,ke=!0);ke&&n.drawBuffers(be)}function Be(j){return _!==j?(n.useProgram(j),_=j,!0):!1}const U={[_s]:n.FUNC_ADD,[IC]:n.FUNC_SUBTRACT,[DC]:n.FUNC_REVERSE_SUBTRACT};U[LC]=n.MIN,U[NC]=n.MAX;const k={[UC]:n.ZERO,[FC]:n.ONE,[OC]:n.SRC_COLOR,[pc]:n.SRC_ALPHA,[GC]:n.SRC_ALPHA_SATURATE,[zC]:n.DST_COLOR,[BC]:n.DST_ALPHA,[kC]:n.ONE_MINUS_SRC_COLOR,[mc]:n.ONE_MINUS_SRC_ALPHA,[HC]:n.ONE_MINUS_DST_COLOR,[VC]:n.ONE_MINUS_DST_ALPHA,[$C]:n.CONSTANT_COLOR,[WC]:n.ONE_MINUS_CONSTANT_COLOR,[XC]:n.CONSTANT_ALPHA,[qC]:n.ONE_MINUS_CONSTANT_ALPHA};function X(j,Le,be,ke,Me,ge,Ae,Je,Ct,yt){if(j===Ri){v===!0&&(W(n.BLEND),v=!1);return}if(v===!1&&(R(n.BLEND),v=!0),j!==PC){if(j!==m||yt!==M){if((p!==_s||b!==_s)&&(n.blendEquation(n.FUNC_ADD),p=_s,b=_s),yt)switch(j){case er:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _f:n.blendFunc(n.ONE,n.ONE);break;case xf:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case yf:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:mt("WebGLState: Invalid blending: ",j);break}else switch(j){case er:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _f:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case xf:mt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case yf:mt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:mt("WebGLState: Invalid blending: ",j);break}S=null,x=null,E=null,A=null,T.set(0,0,0),I=0,m=j,M=yt}return}Me=Me||Le,ge=ge||be,Ae=Ae||ke,(Le!==p||Me!==b)&&(n.blendEquationSeparate(U[Le],U[Me]),p=Le,b=Me),(be!==S||ke!==x||ge!==E||Ae!==A)&&(n.blendFuncSeparate(k[be],k[ke],k[ge],k[Ae]),S=be,x=ke,E=ge,A=Ae),(Je.equals(T)===!1||Ct!==I)&&(n.blendColor(Je.r,Je.g,Je.b,Ct),T.copy(Je),I=Ct),m=j,M=!1}function re(j,Le){j.side===ti?W(n.CULL_FACE):R(n.CULL_FACE);let be=j.side===_n;Le&&(be=!be),ie(be),j.blending===er&&j.transparent===!1?X(Ri):X(j.blending,j.blendEquation,j.blendSrc,j.blendDst,j.blendEquationAlpha,j.blendSrcAlpha,j.blendDstAlpha,j.blendColor,j.blendAlpha,j.premultipliedAlpha),o.setFunc(j.depthFunc),o.setTest(j.depthTest),o.setMask(j.depthWrite),r.setMask(j.colorWrite);const ke=j.stencilWrite;a.setTest(ke),ke&&(a.setMask(j.stencilWriteMask),a.setFunc(j.stencilFunc,j.stencilRef,j.stencilFuncMask),a.setOp(j.stencilFail,j.stencilZFail,j.stencilZPass)),_e(j.polygonOffset,j.polygonOffsetFactor,j.polygonOffsetUnits),j.alphaToCoverage===!0?R(n.SAMPLE_ALPHA_TO_COVERAGE):W(n.SAMPLE_ALPHA_TO_COVERAGE)}function ie(j){w!==j&&(j?n.frontFace(n.CW):n.frontFace(n.CCW),w=j)}function ae(j){j!==AC?(R(n.CULL_FACE),j!==N&&(j===vf?n.cullFace(n.BACK):j===CC?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):W(n.CULL_FACE),N=j}function L(j){j!==O&&(H&&n.lineWidth(j),O=j)}function _e(j,Le,be){j?(R(n.POLYGON_OFFSET_FILL),(q!==Le||Q!==be)&&(n.polygonOffset(Le,be),q=Le,Q=be)):W(n.POLYGON_OFFSET_FILL)}function pe(j){j?R(n.SCISSOR_TEST):W(n.SCISSOR_TEST)}function ue(j){j===void 0&&(j=n.TEXTURE0+te-1),fe!==j&&(n.activeTexture(j),fe=j)}function me(j,Le,be){be===void 0&&(fe===null?be=n.TEXTURE0+te-1:be=fe);let ke=he[be];ke===void 0&&(ke={type:void 0,texture:void 0},he[be]=ke),(ke.type!==j||ke.texture!==Le)&&(fe!==be&&(n.activeTexture(be),fe=be),n.bindTexture(j,Le||G[j]),ke.type=j,ke.texture=Le)}function C(){const j=he[fe];j!==void 0&&j.type!==void 0&&(n.bindTexture(j.type,null),j.type=void 0,j.texture=void 0)}function y(){try{n.compressedTexImage2D(...arguments)}catch(j){mt("WebGLState:",j)}}function V(){try{n.compressedTexImage3D(...arguments)}catch(j){mt("WebGLState:",j)}}function ee(){try{n.texSubImage2D(...arguments)}catch(j){mt("WebGLState:",j)}}function le(){try{n.texSubImage3D(...arguments)}catch(j){mt("WebGLState:",j)}}function Z(){try{n.compressedTexSubImage2D(...arguments)}catch(j){mt("WebGLState:",j)}}function Ie(){try{n.compressedTexSubImage3D(...arguments)}catch(j){mt("WebGLState:",j)}}function Se(){try{n.texStorage2D(...arguments)}catch(j){mt("WebGLState:",j)}}function Ne(){try{n.texStorage3D(...arguments)}catch(j){mt("WebGLState:",j)}}function Ge(){try{n.texImage2D(...arguments)}catch(j){mt("WebGLState:",j)}}function xe(){try{n.texImage3D(...arguments)}catch(j){mt("WebGLState:",j)}}function we(j){We.equals(j)===!1&&(n.scissor(j.x,j.y,j.z,j.w),We.copy(j))}function Ce(j){dt.equals(j)===!1&&(n.viewport(j.x,j.y,j.z,j.w),dt.copy(j))}function Fe(j,Le){let be=c.get(Le);be===void 0&&(be=new WeakMap,c.set(Le,be));let ke=be.get(j);ke===void 0&&(ke=n.getUniformBlockIndex(Le,j.name),be.set(j,ke))}function Ee(j,Le){const ke=c.get(Le).get(j);l.get(Le)!==ke&&(n.uniformBlockBinding(Le,ke,j.__bindingPointIndex),l.set(Le,ke))}function tt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},fe=null,he={},d={},h=new WeakMap,g=[],_=null,v=!1,m=null,p=null,S=null,x=null,b=null,E=null,A=null,T=new ct(0,0,0),I=0,M=!1,w=null,N=null,O=null,q=null,Q=null,We.set(0,0,n.canvas.width,n.canvas.height),dt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:R,disable:W,bindFramebuffer:ce,drawBuffers:de,useProgram:Be,setBlending:X,setMaterial:re,setFlipSided:ie,setCullFace:ae,setLineWidth:L,setPolygonOffset:_e,setScissorTest:pe,activeTexture:ue,bindTexture:me,unbindTexture:C,compressedTexImage2D:y,compressedTexImage3D:V,texImage2D:Ge,texImage3D:xe,updateUBOMapping:Fe,uniformBlockBinding:Ee,texStorage2D:Se,texStorage3D:Ne,texSubImage2D:ee,texSubImage3D:le,compressedTexSubImage2D:Z,compressedTexSubImage3D:Ie,scissor:we,viewport:Ce,reset:tt}}function PD(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new gt,u=new WeakMap;let d;const h=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,y){return g?new OffscreenCanvas(C,y):Sa("canvas")}function v(C,y,V){let ee=1;const le=me(C);if((le.width>V||le.height>V)&&(ee=V/Math.max(le.width,le.height)),ee<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const Z=Math.floor(ee*le.width),Ie=Math.floor(ee*le.height);d===void 0&&(d=_(Z,Ie));const Se=y?_(Z,Ie):d;return Se.width=Z,Se.height=Ie,Se.getContext("2d").drawImage(C,0,0,Z,Ie),Ze("WebGLRenderer: Texture has been resized from ("+le.width+"x"+le.height+") to ("+Z+"x"+Ie+")."),Se}else return"data"in C&&Ze("WebGLRenderer: Image in DataTexture is too big ("+le.width+"x"+le.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){n.generateMipmap(C)}function S(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function x(C,y,V,ee,le=!1){if(C!==null){if(n[C]!==void 0)return n[C];Ze("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let Z=y;if(y===n.RED&&(V===n.FLOAT&&(Z=n.R32F),V===n.HALF_FLOAT&&(Z=n.R16F),V===n.UNSIGNED_BYTE&&(Z=n.R8)),y===n.RED_INTEGER&&(V===n.UNSIGNED_BYTE&&(Z=n.R8UI),V===n.UNSIGNED_SHORT&&(Z=n.R16UI),V===n.UNSIGNED_INT&&(Z=n.R32UI),V===n.BYTE&&(Z=n.R8I),V===n.SHORT&&(Z=n.R16I),V===n.INT&&(Z=n.R32I)),y===n.RG&&(V===n.FLOAT&&(Z=n.RG32F),V===n.HALF_FLOAT&&(Z=n.RG16F),V===n.UNSIGNED_BYTE&&(Z=n.RG8)),y===n.RG_INTEGER&&(V===n.UNSIGNED_BYTE&&(Z=n.RG8UI),V===n.UNSIGNED_SHORT&&(Z=n.RG16UI),V===n.UNSIGNED_INT&&(Z=n.RG32UI),V===n.BYTE&&(Z=n.RG8I),V===n.SHORT&&(Z=n.RG16I),V===n.INT&&(Z=n.RG32I)),y===n.RGB_INTEGER&&(V===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),V===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),V===n.UNSIGNED_INT&&(Z=n.RGB32UI),V===n.BYTE&&(Z=n.RGB8I),V===n.SHORT&&(Z=n.RGB16I),V===n.INT&&(Z=n.RGB32I)),y===n.RGBA_INTEGER&&(V===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),V===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),V===n.UNSIGNED_INT&&(Z=n.RGBA32UI),V===n.BYTE&&(Z=n.RGBA8I),V===n.SHORT&&(Z=n.RGBA16I),V===n.INT&&(Z=n.RGBA32I)),y===n.RGB&&(V===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),V===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),y===n.RGBA){const Ie=le?xa:ht.getTransfer(ee);V===n.FLOAT&&(Z=n.RGBA32F),V===n.HALF_FLOAT&&(Z=n.RGBA16F),V===n.UNSIGNED_BYTE&&(Z=Ie===Mt?n.SRGB8_ALPHA8:n.RGBA8),V===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),V===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function b(C,y){let V;return C?y===null||y===ui||y===eo?V=n.DEPTH24_STENCIL8:y===ni?V=n.DEPTH32F_STENCIL8:y===Qr&&(V=n.DEPTH24_STENCIL8,Ze("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===ui||y===eo?V=n.DEPTH_COMPONENT24:y===ni?V=n.DEPTH_COMPONENT32F:y===Qr&&(V=n.DEPTH_COMPONENT16),V}function E(C,y){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==Zt&&C.minFilter!==on?Math.log2(Math.max(y.width,y.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?y.mipmaps.length:1}function A(C){const y=C.target;y.removeEventListener("dispose",A),I(y),y.isVideoTexture&&u.delete(y)}function T(C){const y=C.target;y.removeEventListener("dispose",T),w(y)}function I(C){const y=i.get(C);if(y.__webglInit===void 0)return;const V=C.source,ee=h.get(V);if(ee){const le=ee[y.__cacheKey];le.usedTimes--,le.usedTimes===0&&M(C),Object.keys(ee).length===0&&h.delete(V)}i.remove(C)}function M(C){const y=i.get(C);n.deleteTexture(y.__webglTexture);const V=C.source,ee=h.get(V);delete ee[y.__cacheKey],o.memory.textures--}function w(C){const y=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(y.__webglFramebuffer[ee]))for(let le=0;le<y.__webglFramebuffer[ee].length;le++)n.deleteFramebuffer(y.__webglFramebuffer[ee][le]);else n.deleteFramebuffer(y.__webglFramebuffer[ee]);y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer[ee])}else{if(Array.isArray(y.__webglFramebuffer))for(let ee=0;ee<y.__webglFramebuffer.length;ee++)n.deleteFramebuffer(y.__webglFramebuffer[ee]);else n.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&n.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let ee=0;ee<y.__webglColorRenderbuffer.length;ee++)y.__webglColorRenderbuffer[ee]&&n.deleteRenderbuffer(y.__webglColorRenderbuffer[ee]);y.__webglDepthRenderbuffer&&n.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const V=C.textures;for(let ee=0,le=V.length;ee<le;ee++){const Z=i.get(V[ee]);Z.__webglTexture&&(n.deleteTexture(Z.__webglTexture),o.memory.textures--),i.remove(V[ee])}i.remove(C)}let N=0;function O(){N=0}function q(){const C=N;return C>=s.maxTextures&&Ze("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),N+=1,C}function Q(C){const y=[];return y.push(C.wrapS),y.push(C.wrapT),y.push(C.wrapR||0),y.push(C.magFilter),y.push(C.minFilter),y.push(C.anisotropy),y.push(C.internalFormat),y.push(C.format),y.push(C.type),y.push(C.generateMipmaps),y.push(C.premultiplyAlpha),y.push(C.flipY),y.push(C.unpackAlignment),y.push(C.colorSpace),y.join()}function te(C,y){const V=i.get(C);if(C.isVideoTexture&&pe(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&V.__version!==C.version){const ee=C.image;if(ee===null)Ze("WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)Ze("WebGLRenderer: Texture marked for update but image is incomplete");else{G(V,C,y);return}}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,V.__webglTexture,n.TEXTURE0+y)}function H(C,y){const V=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){G(V,C,y);return}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,V.__webglTexture,n.TEXTURE0+y)}function D(C,y){const V=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){G(V,C,y);return}t.bindTexture(n.TEXTURE_3D,V.__webglTexture,n.TEXTURE0+y)}function $(C,y){const V=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&V.__version!==C.version){R(V,C,y);return}t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture,n.TEXTURE0+y)}const fe={[wc]:n.REPEAT,[Ai]:n.CLAMP_TO_EDGE,[Tc]:n.MIRRORED_REPEAT},he={[Zt]:n.NEAREST,[KC]:n.NEAREST_MIPMAP_NEAREST,[Ao]:n.NEAREST_MIPMAP_LINEAR,[on]:n.LINEAR,[hl]:n.LINEAR_MIPMAP_NEAREST,[Ss]:n.LINEAR_MIPMAP_LINEAR},ye={[QC]:n.NEVER,[sR]:n.ALWAYS,[eR]:n.LESS,[ku]:n.LEQUAL,[tR]:n.EQUAL,[Bu]:n.GEQUAL,[nR]:n.GREATER,[iR]:n.NOTEQUAL};function He(C,y){if(y.type===ni&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===on||y.magFilter===hl||y.magFilter===Ao||y.magFilter===Ss||y.minFilter===on||y.minFilter===hl||y.minFilter===Ao||y.minFilter===Ss)&&Ze("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,fe[y.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,fe[y.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,fe[y.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,he[y.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,he[y.minFilter]),y.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,ye[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Zt||y.minFilter!==Ao&&y.minFilter!==Ss||y.type===ni&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){const V=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function We(C,y){let V=!1;C.__webglInit===void 0&&(C.__webglInit=!0,y.addEventListener("dispose",A));const ee=y.source;let le=h.get(ee);le===void 0&&(le={},h.set(ee,le));const Z=Q(y);if(Z!==C.__cacheKey){le[Z]===void 0&&(le[Z]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,V=!0),le[Z].usedTimes++;const Ie=le[C.__cacheKey];Ie!==void 0&&(le[C.__cacheKey].usedTimes--,Ie.usedTimes===0&&M(y)),C.__cacheKey=Z,C.__webglTexture=le[Z].texture}return V}function dt(C,y,V){return Math.floor(Math.floor(C/V)/y)}function at(C,y,V,ee){const Z=C.updateRanges;if(Z.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,y.width,y.height,V,ee,y.data);else{Z.sort((xe,we)=>xe.start-we.start);let Ie=0;for(let xe=1;xe<Z.length;xe++){const we=Z[Ie],Ce=Z[xe],Fe=we.start+we.count,Ee=dt(Ce.start,y.width,4),tt=dt(we.start,y.width,4);Ce.start<=Fe+1&&Ee===tt&&dt(Ce.start+Ce.count-1,y.width,4)===Ee?we.count=Math.max(we.count,Ce.start+Ce.count-we.start):(++Ie,Z[Ie]=Ce)}Z.length=Ie+1;const Se=n.getParameter(n.UNPACK_ROW_LENGTH),Ne=n.getParameter(n.UNPACK_SKIP_PIXELS),Ge=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,y.width);for(let xe=0,we=Z.length;xe<we;xe++){const Ce=Z[xe],Fe=Math.floor(Ce.start/4),Ee=Math.ceil(Ce.count/4),tt=Fe%y.width,j=Math.floor(Fe/y.width),Le=Ee,be=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,tt),n.pixelStorei(n.UNPACK_SKIP_ROWS,j),t.texSubImage2D(n.TEXTURE_2D,0,tt,j,Le,be,V,ee,y.data)}C.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,Se),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ne),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ge)}}function G(C,y,V){let ee=n.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(ee=n.TEXTURE_2D_ARRAY),y.isData3DTexture&&(ee=n.TEXTURE_3D);const le=We(C,y),Z=y.source;t.bindTexture(ee,C.__webglTexture,n.TEXTURE0+V);const Ie=i.get(Z);if(Z.version!==Ie.__version||le===!0){t.activeTexture(n.TEXTURE0+V);const Se=ht.getPrimaries(ht.workingColorSpace),Ne=y.colorSpace===Zi?null:ht.getPrimaries(y.colorSpace),Ge=y.colorSpace===Zi||Se===Ne?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);let xe=v(y.image,!1,s.maxTextureSize);xe=ue(y,xe);const we=r.convert(y.format,y.colorSpace),Ce=r.convert(y.type);let Fe=x(y.internalFormat,we,Ce,y.colorSpace,y.isVideoTexture);He(ee,y);let Ee;const tt=y.mipmaps,j=y.isVideoTexture!==!0,Le=Ie.__version===void 0||le===!0,be=Z.dataReady,ke=E(y,xe);if(y.isDepthTexture)Fe=b(y.format===Ms,y.type),Le&&(j?t.texStorage2D(n.TEXTURE_2D,1,Fe,xe.width,xe.height):t.texImage2D(n.TEXTURE_2D,0,Fe,xe.width,xe.height,0,we,Ce,null));else if(y.isDataTexture)if(tt.length>0){j&&Le&&t.texStorage2D(n.TEXTURE_2D,ke,Fe,tt[0].width,tt[0].height);for(let Me=0,ge=tt.length;Me<ge;Me++)Ee=tt[Me],j?be&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,Ee.width,Ee.height,we,Ce,Ee.data):t.texImage2D(n.TEXTURE_2D,Me,Fe,Ee.width,Ee.height,0,we,Ce,Ee.data);y.generateMipmaps=!1}else j?(Le&&t.texStorage2D(n.TEXTURE_2D,ke,Fe,xe.width,xe.height),be&&at(y,xe,we,Ce)):t.texImage2D(n.TEXTURE_2D,0,Fe,xe.width,xe.height,0,we,Ce,xe.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){j&&Le&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ke,Fe,tt[0].width,tt[0].height,xe.depth);for(let Me=0,ge=tt.length;Me<ge;Me++)if(Ee=tt[Me],y.format!==zn)if(we!==null)if(j){if(be)if(y.layerUpdates.size>0){const Ae=Xf(Ee.width,Ee.height,y.format,y.type);for(const Je of y.layerUpdates){const Ct=Ee.data.subarray(Je*Ae/Ee.data.BYTES_PER_ELEMENT,(Je+1)*Ae/Ee.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,Je,Ee.width,Ee.height,1,we,Ct)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,0,Ee.width,Ee.height,xe.depth,we,Ee.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Me,Fe,Ee.width,Ee.height,xe.depth,0,Ee.data,0,0);else Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else j?be&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,0,Ee.width,Ee.height,xe.depth,we,Ce,Ee.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Me,Fe,Ee.width,Ee.height,xe.depth,0,we,Ce,Ee.data)}else{j&&Le&&t.texStorage2D(n.TEXTURE_2D,ke,Fe,tt[0].width,tt[0].height);for(let Me=0,ge=tt.length;Me<ge;Me++)Ee=tt[Me],y.format!==zn?we!==null?j?be&&t.compressedTexSubImage2D(n.TEXTURE_2D,Me,0,0,Ee.width,Ee.height,we,Ee.data):t.compressedTexImage2D(n.TEXTURE_2D,Me,Fe,Ee.width,Ee.height,0,Ee.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):j?be&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,Ee.width,Ee.height,we,Ce,Ee.data):t.texImage2D(n.TEXTURE_2D,Me,Fe,Ee.width,Ee.height,0,we,Ce,Ee.data)}else if(y.isDataArrayTexture)if(j){if(Le&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ke,Fe,xe.width,xe.height,xe.depth),be)if(y.layerUpdates.size>0){const Me=Xf(xe.width,xe.height,y.format,y.type);for(const ge of y.layerUpdates){const Ae=xe.data.subarray(ge*Me/xe.data.BYTES_PER_ELEMENT,(ge+1)*Me/xe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ge,xe.width,xe.height,1,we,Ce,Ae)}y.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,xe.width,xe.height,xe.depth,we,Ce,xe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Fe,xe.width,xe.height,xe.depth,0,we,Ce,xe.data);else if(y.isData3DTexture)j?(Le&&t.texStorage3D(n.TEXTURE_3D,ke,Fe,xe.width,xe.height,xe.depth),be&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,xe.width,xe.height,xe.depth,we,Ce,xe.data)):t.texImage3D(n.TEXTURE_3D,0,Fe,xe.width,xe.height,xe.depth,0,we,Ce,xe.data);else if(y.isFramebufferTexture){if(Le)if(j)t.texStorage2D(n.TEXTURE_2D,ke,Fe,xe.width,xe.height);else{let Me=xe.width,ge=xe.height;for(let Ae=0;Ae<ke;Ae++)t.texImage2D(n.TEXTURE_2D,Ae,Fe,Me,ge,0,we,Ce,null),Me>>=1,ge>>=1}}else if(tt.length>0){if(j&&Le){const Me=me(tt[0]);t.texStorage2D(n.TEXTURE_2D,ke,Fe,Me.width,Me.height)}for(let Me=0,ge=tt.length;Me<ge;Me++)Ee=tt[Me],j?be&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,we,Ce,Ee):t.texImage2D(n.TEXTURE_2D,Me,Fe,we,Ce,Ee);y.generateMipmaps=!1}else if(j){if(Le){const Me=me(xe);t.texStorage2D(n.TEXTURE_2D,ke,Fe,Me.width,Me.height)}be&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,we,Ce,xe)}else t.texImage2D(n.TEXTURE_2D,0,Fe,we,Ce,xe);m(y)&&p(ee),Ie.__version=Z.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function R(C,y,V){if(y.image.length!==6)return;const ee=We(C,y),le=y.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+V);const Z=i.get(le);if(le.version!==Z.__version||ee===!0){t.activeTexture(n.TEXTURE0+V);const Ie=ht.getPrimaries(ht.workingColorSpace),Se=y.colorSpace===Zi?null:ht.getPrimaries(y.colorSpace),Ne=y.colorSpace===Zi||Ie===Se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ne);const Ge=y.isCompressedTexture||y.image[0].isCompressedTexture,xe=y.image[0]&&y.image[0].isDataTexture,we=[];for(let ge=0;ge<6;ge++)!Ge&&!xe?we[ge]=v(y.image[ge],!0,s.maxCubemapSize):we[ge]=xe?y.image[ge].image:y.image[ge],we[ge]=ue(y,we[ge]);const Ce=we[0],Fe=r.convert(y.format,y.colorSpace),Ee=r.convert(y.type),tt=x(y.internalFormat,Fe,Ee,y.colorSpace),j=y.isVideoTexture!==!0,Le=Z.__version===void 0||ee===!0,be=le.dataReady;let ke=E(y,Ce);He(n.TEXTURE_CUBE_MAP,y);let Me;if(Ge){j&&Le&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ke,tt,Ce.width,Ce.height);for(let ge=0;ge<6;ge++){Me=we[ge].mipmaps;for(let Ae=0;Ae<Me.length;Ae++){const Je=Me[Ae];y.format!==zn?Fe!==null?j?be&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae,0,0,Je.width,Je.height,Fe,Je.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae,tt,Je.width,Je.height,0,Je.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):j?be&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae,0,0,Je.width,Je.height,Fe,Ee,Je.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae,tt,Je.width,Je.height,0,Fe,Ee,Je.data)}}}else{if(Me=y.mipmaps,j&&Le){Me.length>0&&ke++;const ge=me(we[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ke,tt,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(xe){j?be&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,we[ge].width,we[ge].height,Fe,Ee,we[ge].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,tt,we[ge].width,we[ge].height,0,Fe,Ee,we[ge].data);for(let Ae=0;Ae<Me.length;Ae++){const Ct=Me[Ae].image[ge].image;j?be&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae+1,0,0,Ct.width,Ct.height,Fe,Ee,Ct.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae+1,tt,Ct.width,Ct.height,0,Fe,Ee,Ct.data)}}else{j?be&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Fe,Ee,we[ge]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,tt,Fe,Ee,we[ge]);for(let Ae=0;Ae<Me.length;Ae++){const Je=Me[Ae];j?be&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae+1,0,0,Fe,Ee,Je.image[ge]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Ae+1,tt,Fe,Ee,Je.image[ge])}}}m(y)&&p(n.TEXTURE_CUBE_MAP),Z.__version=le.version,y.onUpdate&&y.onUpdate(y)}C.__version=y.version}function W(C,y,V,ee,le,Z){const Ie=r.convert(V.format,V.colorSpace),Se=r.convert(V.type),Ne=x(V.internalFormat,Ie,Se,V.colorSpace),Ge=i.get(y),xe=i.get(V);if(xe.__renderTarget=y,!Ge.__hasExternalTextures){const we=Math.max(1,y.width>>Z),Ce=Math.max(1,y.height>>Z);le===n.TEXTURE_3D||le===n.TEXTURE_2D_ARRAY?t.texImage3D(le,Z,Ne,we,Ce,y.depth,0,Ie,Se,null):t.texImage2D(le,Z,Ne,we,Ce,0,Ie,Se,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),_e(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ee,le,xe.__webglTexture,0,L(y)):(le===n.TEXTURE_2D||le>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&le<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ee,le,xe.__webglTexture,Z),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ce(C,y,V){if(n.bindRenderbuffer(n.RENDERBUFFER,C),y.depthBuffer){const ee=y.depthTexture,le=ee&&ee.isDepthTexture?ee.type:null,Z=b(y.stencilBuffer,le),Ie=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;_e(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(y),Z,y.width,y.height):V?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(y),Z,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,Z,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ie,n.RENDERBUFFER,C)}else{const ee=y.textures;for(let le=0;le<ee.length;le++){const Z=ee[le],Ie=r.convert(Z.format,Z.colorSpace),Se=r.convert(Z.type),Ne=x(Z.internalFormat,Ie,Se,Z.colorSpace);_e(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(y),Ne,y.width,y.height):V?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(y),Ne,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,Ne,y.width,y.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function de(C,y,V){const ee=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const le=i.get(y.depthTexture);if(le.__renderTarget=y,(!le.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),ee){if(le.__webglInit===void 0&&(le.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),le.__webglTexture===void 0){le.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,le.__webglTexture),He(n.TEXTURE_CUBE_MAP,y.depthTexture);const Ge=r.convert(y.depthTexture.format),xe=r.convert(y.depthTexture.type);let we;y.depthTexture.format===Ui?we=n.DEPTH_COMPONENT24:y.depthTexture.format===Ms&&(we=n.DEPTH24_STENCIL8);for(let Ce=0;Ce<6;Ce++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,0,we,y.width,y.height,0,Ge,xe,null)}}else te(y.depthTexture,0);const Z=le.__webglTexture,Ie=L(y),Se=ee?n.TEXTURE_CUBE_MAP_POSITIVE_X+V:n.TEXTURE_2D,Ne=y.depthTexture.format===Ms?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(y.depthTexture.format===Ui)_e(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Ne,Se,Z,0,Ie):n.framebufferTexture2D(n.FRAMEBUFFER,Ne,Se,Z,0);else if(y.depthTexture.format===Ms)_e(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Ne,Se,Z,0,Ie):n.framebufferTexture2D(n.FRAMEBUFFER,Ne,Se,Z,0);else throw new Error("Unknown depthTexture format")}function Be(C){const y=i.get(C),V=C.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==C.depthTexture){const ee=C.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),ee){const le=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,ee.removeEventListener("dispose",le)};ee.addEventListener("dispose",le),y.__depthDisposeCallback=le}y.__boundDepthTexture=ee}if(C.depthTexture&&!y.__autoAllocateDepthBuffer)if(V)for(let ee=0;ee<6;ee++)de(y.__webglFramebuffer[ee],C,ee);else{const ee=C.texture.mipmaps;ee&&ee.length>0?de(y.__webglFramebuffer[0],C,0):de(y.__webglFramebuffer,C,0)}else if(V){y.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)if(t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[ee]),y.__webglDepthbuffer[ee]===void 0)y.__webglDepthbuffer[ee]=n.createRenderbuffer(),ce(y.__webglDepthbuffer[ee],C,!1);else{const le=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Z=y.__webglDepthbuffer[ee];n.bindRenderbuffer(n.RENDERBUFFER,Z),n.framebufferRenderbuffer(n.FRAMEBUFFER,le,n.RENDERBUFFER,Z)}}else{const ee=C.texture.mipmaps;if(ee&&ee.length>0?t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=n.createRenderbuffer(),ce(y.__webglDepthbuffer,C,!1);else{const le=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Z=y.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Z),n.framebufferRenderbuffer(n.FRAMEBUFFER,le,n.RENDERBUFFER,Z)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function U(C,y,V){const ee=i.get(C);y!==void 0&&W(ee.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),V!==void 0&&Be(C)}function k(C){const y=C.texture,V=i.get(C),ee=i.get(y);C.addEventListener("dispose",T);const le=C.textures,Z=C.isWebGLCubeRenderTarget===!0,Ie=le.length>1;if(Ie||(ee.__webglTexture===void 0&&(ee.__webglTexture=n.createTexture()),ee.__version=y.version,o.memory.textures++),Z){V.__webglFramebuffer=[];for(let Se=0;Se<6;Se++)if(y.mipmaps&&y.mipmaps.length>0){V.__webglFramebuffer[Se]=[];for(let Ne=0;Ne<y.mipmaps.length;Ne++)V.__webglFramebuffer[Se][Ne]=n.createFramebuffer()}else V.__webglFramebuffer[Se]=n.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){V.__webglFramebuffer=[];for(let Se=0;Se<y.mipmaps.length;Se++)V.__webglFramebuffer[Se]=n.createFramebuffer()}else V.__webglFramebuffer=n.createFramebuffer();if(Ie)for(let Se=0,Ne=le.length;Se<Ne;Se++){const Ge=i.get(le[Se]);Ge.__webglTexture===void 0&&(Ge.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&_e(C)===!1){V.__webglMultisampledFramebuffer=n.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let Se=0;Se<le.length;Se++){const Ne=le[Se];V.__webglColorRenderbuffer[Se]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,V.__webglColorRenderbuffer[Se]);const Ge=r.convert(Ne.format,Ne.colorSpace),xe=r.convert(Ne.type),we=x(Ne.internalFormat,Ge,xe,Ne.colorSpace,C.isXRRenderTarget===!0),Ce=L(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ce,we,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,V.__webglColorRenderbuffer[Se])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(V.__webglDepthRenderbuffer=n.createRenderbuffer(),ce(V.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Z){t.bindTexture(n.TEXTURE_CUBE_MAP,ee.__webglTexture),He(n.TEXTURE_CUBE_MAP,y);for(let Se=0;Se<6;Se++)if(y.mipmaps&&y.mipmaps.length>0)for(let Ne=0;Ne<y.mipmaps.length;Ne++)W(V.__webglFramebuffer[Se][Ne],C,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,Ne);else W(V.__webglFramebuffer[Se],C,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0);m(y)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ie){for(let Se=0,Ne=le.length;Se<Ne;Se++){const Ge=le[Se],xe=i.get(Ge);let we=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(we=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(we,xe.__webglTexture),He(we,Ge),W(V.__webglFramebuffer,C,Ge,n.COLOR_ATTACHMENT0+Se,we,0),m(Ge)&&p(we)}t.unbindTexture()}else{let Se=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Se=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Se,ee.__webglTexture),He(Se,y),y.mipmaps&&y.mipmaps.length>0)for(let Ne=0;Ne<y.mipmaps.length;Ne++)W(V.__webglFramebuffer[Ne],C,y,n.COLOR_ATTACHMENT0,Se,Ne);else W(V.__webglFramebuffer,C,y,n.COLOR_ATTACHMENT0,Se,0);m(y)&&p(Se),t.unbindTexture()}C.depthBuffer&&Be(C)}function X(C){const y=C.textures;for(let V=0,ee=y.length;V<ee;V++){const le=y[V];if(m(le)){const Z=S(C),Ie=i.get(le).__webglTexture;t.bindTexture(Z,Ie),p(Z),t.unbindTexture()}}}const re=[],ie=[];function ae(C){if(C.samples>0){if(_e(C)===!1){const y=C.textures,V=C.width,ee=C.height;let le=n.COLOR_BUFFER_BIT;const Z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ie=i.get(C),Se=y.length>1;if(Se)for(let Ge=0;Ge<y.length;Ge++)t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ge,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ge,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);const Ne=C.texture.mipmaps;Ne&&Ne.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let Ge=0;Ge<y.length;Ge++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(le|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(le|=n.STENCIL_BUFFER_BIT)),Se){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ge]);const xe=i.get(y[Ge]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,xe,0)}n.blitFramebuffer(0,0,V,ee,0,0,V,ee,le,n.NEAREST),l===!0&&(re.length=0,ie.length=0,re.push(n.COLOR_ATTACHMENT0+Ge),C.depthBuffer&&C.resolveDepthBuffer===!1&&(re.push(Z),ie.push(Z),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,ie)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,re))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Se)for(let Ge=0;Ge<y.length;Ge++){t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ge,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ge]);const xe=i.get(y[Ge]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ge,n.TEXTURE_2D,xe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const y=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[y])}}}function L(C){return Math.min(s.maxSamples,C.samples)}function _e(C){const y=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function pe(C){const y=o.render.frame;u.get(C)!==y&&(u.set(C,y),C.update())}function ue(C,y){const V=C.colorSpace,ee=C.format,le=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||V!==fr&&V!==Zi&&(ht.getTransfer(V)===Mt?(ee!==zn||le!==bn)&&Ze("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):mt("WebGLTextures: Unsupported texture color space:",V)),y}function me(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=q,this.resetTextureUnits=O,this.setTexture2D=te,this.setTexture2DArray=H,this.setTexture3D=D,this.setTextureCube=$,this.rebindTextures=U,this.setupRenderTarget=k,this.updateRenderTargetMipmap=X,this.updateMultisampleRenderTarget=ae,this.setupDepthRenderbuffer=Be,this.setupFrameBufferTexture=W,this.useMultisampledRTT=_e,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function ID(n,e){function t(i,s=Zi){let r;const o=ht.getTransfer(s);if(i===bn)return n.UNSIGNED_BYTE;if(i===Lu)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Nu)return n.UNSIGNED_SHORT_5_5_5_1;if(i===vm)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===_m)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===mm)return n.BYTE;if(i===gm)return n.SHORT;if(i===Qr)return n.UNSIGNED_SHORT;if(i===Du)return n.INT;if(i===ui)return n.UNSIGNED_INT;if(i===ni)return n.FLOAT;if(i===Ni)return n.HALF_FLOAT;if(i===xm)return n.ALPHA;if(i===ym)return n.RGB;if(i===zn)return n.RGBA;if(i===Ui)return n.DEPTH_COMPONENT;if(i===Ms)return n.DEPTH_STENCIL;if(i===Sm)return n.RED;if(i===Uu)return n.RED_INTEGER;if(i===dr)return n.RG;if(i===Fu)return n.RG_INTEGER;if(i===Ou)return n.RGBA_INTEGER;if(i===ia||i===sa||i===ra||i===oa)if(o===Mt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ia)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===sa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===oa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ia)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===sa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ra)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===oa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ac||i===Cc||i===Rc||i===Pc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ac)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Cc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Rc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Pc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ic||i===Dc||i===Lc||i===Nc||i===Uc||i===Fc||i===Oc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ic||i===Dc)return o===Mt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Lc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Nc)return r.COMPRESSED_R11_EAC;if(i===Uc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Fc)return r.COMPRESSED_RG11_EAC;if(i===Oc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===kc||i===Bc||i===Vc||i===zc||i===Hc||i===Gc||i===$c||i===Wc||i===Xc||i===qc||i===jc||i===Yc||i===Kc||i===Zc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===kc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Bc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Vc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===zc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Hc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===$c)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Wc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Xc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===qc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===jc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Yc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Zc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Jc||i===Qc||i===eu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Jc)return o===Mt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Qc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===eu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===tu||i===nu||i===iu||i===su)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===tu)return r.COMPRESSED_RED_RGTC1_EXT;if(i===nu)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===iu)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===su)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===eo?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const DD=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,LD=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ND{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Fm(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new fi({vertexShader:DD,fragmentShader:LD,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new wn(new po(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class UD extends mr{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,g=null,_=null;const v=typeof XRWebGLBinding<"u",m=new ND,p={},S=t.getContextAttributes();let x=null,b=null;const E=[],A=[],T=new gt;let I=null;const M=new Ln;M.viewport=new Ot;const w=new Ln;w.viewport=new Ot;const N=[M,w],O=new WR;let q=null,Q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(G){let R=E[G];return R===void 0&&(R=new Fl,E[G]=R),R.getTargetRaySpace()},this.getControllerGrip=function(G){let R=E[G];return R===void 0&&(R=new Fl,E[G]=R),R.getGripSpace()},this.getHand=function(G){let R=E[G];return R===void 0&&(R=new Fl,E[G]=R),R.getHandSpace()};function te(G){const R=A.indexOf(G.inputSource);if(R===-1)return;const W=E[R];W!==void 0&&(W.update(G.inputSource,G.frame,c||o),W.dispatchEvent({type:G.type,data:G.inputSource}))}function H(){s.removeEventListener("select",te),s.removeEventListener("selectstart",te),s.removeEventListener("selectend",te),s.removeEventListener("squeeze",te),s.removeEventListener("squeezestart",te),s.removeEventListener("squeezeend",te),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",D);for(let G=0;G<E.length;G++){const R=A[G];R!==null&&(A[G]=null,E[G].disconnect(R))}q=null,Q=null,m.reset();for(const G in p)delete p[G];e.setRenderTarget(x),g=null,h=null,d=null,s=null,b=null,at.stop(),i.isPresenting=!1,e.setPixelRatio(I),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(G){r=G,i.isPresenting===!0&&Ze("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(G){a=G,i.isPresenting===!0&&Ze("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(G){c=G},this.getBaseLayer=function(){return h!==null?h:g},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(G){if(s=G,s!==null){if(x=e.getRenderTarget(),s.addEventListener("select",te),s.addEventListener("selectstart",te),s.addEventListener("selectend",te),s.addEventListener("squeeze",te),s.addEventListener("squeezestart",te),s.addEventListener("squeezeend",te),s.addEventListener("end",H),s.addEventListener("inputsourceschange",D),S.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let W=null,ce=null,de=null;S.depth&&(de=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,W=S.stencil?Ms:Ui,ce=S.stencil?eo:ui);const Be={colorFormat:t.RGBA8,depthFormat:de,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Be),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),b=new oi(h.textureWidth,h.textureHeight,{format:zn,type:bn,depthTexture:new no(h.textureWidth,h.textureHeight,ce,void 0,void 0,void 0,void 0,void 0,void 0,W),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const W={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};g=new XRWebGLLayer(s,t,W),s.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),b=new oi(g.framebufferWidth,g.framebufferHeight,{format:zn,type:bn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),at.setContext(s),at.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function D(G){for(let R=0;R<G.removed.length;R++){const W=G.removed[R],ce=A.indexOf(W);ce>=0&&(A[ce]=null,E[ce].disconnect(W))}for(let R=0;R<G.added.length;R++){const W=G.added[R];let ce=A.indexOf(W);if(ce===-1){for(let Be=0;Be<E.length;Be++)if(Be>=A.length){A.push(W),ce=Be;break}else if(A[Be]===null){A[Be]=W,ce=Be;break}if(ce===-1)break}const de=E[ce];de&&de.connect(W)}}const $=new J,fe=new J;function he(G,R,W){$.setFromMatrixPosition(R.matrixWorld),fe.setFromMatrixPosition(W.matrixWorld);const ce=$.distanceTo(fe),de=R.projectionMatrix.elements,Be=W.projectionMatrix.elements,U=de[14]/(de[10]-1),k=de[14]/(de[10]+1),X=(de[9]+1)/de[5],re=(de[9]-1)/de[5],ie=(de[8]-1)/de[0],ae=(Be[8]+1)/Be[0],L=U*ie,_e=U*ae,pe=ce/(-ie+ae),ue=pe*-ie;if(R.matrixWorld.decompose(G.position,G.quaternion,G.scale),G.translateX(ue),G.translateZ(pe),G.matrixWorld.compose(G.position,G.quaternion,G.scale),G.matrixWorldInverse.copy(G.matrixWorld).invert(),de[10]===-1)G.projectionMatrix.copy(R.projectionMatrix),G.projectionMatrixInverse.copy(R.projectionMatrixInverse);else{const me=U+pe,C=k+pe,y=L-ue,V=_e+(ce-ue),ee=X*k/C*me,le=re*k/C*me;G.projectionMatrix.makePerspective(y,V,ee,le,me,C),G.projectionMatrixInverse.copy(G.projectionMatrix).invert()}}function ye(G,R){R===null?G.matrixWorld.copy(G.matrix):G.matrixWorld.multiplyMatrices(R.matrixWorld,G.matrix),G.matrixWorldInverse.copy(G.matrixWorld).invert()}this.updateCamera=function(G){if(s===null)return;let R=G.near,W=G.far;m.texture!==null&&(m.depthNear>0&&(R=m.depthNear),m.depthFar>0&&(W=m.depthFar)),O.near=w.near=M.near=R,O.far=w.far=M.far=W,(q!==O.near||Q!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),q=O.near,Q=O.far),O.layers.mask=G.layers.mask|6,M.layers.mask=O.layers.mask&3,w.layers.mask=O.layers.mask&5;const ce=G.parent,de=O.cameras;ye(O,ce);for(let Be=0;Be<de.length;Be++)ye(de[Be],ce);de.length===2?he(O,M,w):O.projectionMatrix.copy(M.projectionMatrix),He(G,O,ce)};function He(G,R,W){W===null?G.matrix.copy(R.matrixWorld):(G.matrix.copy(W.matrixWorld),G.matrix.invert(),G.matrix.multiply(R.matrixWorld)),G.matrix.decompose(G.position,G.quaternion,G.scale),G.updateMatrixWorld(!0),G.projectionMatrix.copy(R.projectionMatrix),G.projectionMatrixInverse.copy(R.projectionMatrixInverse),G.isPerspectiveCamera&&(G.fov=ru*2*Math.atan(1/G.projectionMatrix.elements[5]),G.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(h===null&&g===null))return l},this.setFoveation=function(G){l=G,h!==null&&(h.fixedFoveation=G),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=G)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(G){return p[G]};let We=null;function dt(G,R){if(u=R.getViewerPose(c||o),_=R,u!==null){const W=u.views;g!==null&&(e.setRenderTargetFramebuffer(b,g.framebuffer),e.setRenderTarget(b));let ce=!1;W.length!==O.cameras.length&&(O.cameras.length=0,ce=!0);for(let k=0;k<W.length;k++){const X=W[k];let re=null;if(g!==null)re=g.getViewport(X);else{const ae=d.getViewSubImage(h,X);re=ae.viewport,k===0&&(e.setRenderTargetTextures(b,ae.colorTexture,ae.depthStencilTexture),e.setRenderTarget(b))}let ie=N[k];ie===void 0&&(ie=new Ln,ie.layers.enable(k),ie.viewport=new Ot,N[k]=ie),ie.matrix.fromArray(X.transform.matrix),ie.matrix.decompose(ie.position,ie.quaternion,ie.scale),ie.projectionMatrix.fromArray(X.projectionMatrix),ie.projectionMatrixInverse.copy(ie.projectionMatrix).invert(),ie.viewport.set(re.x,re.y,re.width,re.height),k===0&&(O.matrix.copy(ie.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),ce===!0&&O.cameras.push(ie)}const de=s.enabledFeatures;if(de&&de.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=i.getBinding();const k=d.getDepthInformation(W[0]);k&&k.isValid&&k.texture&&m.init(k,s.renderState)}if(de&&de.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let k=0;k<W.length;k++){const X=W[k].camera;if(X){let re=p[X];re||(re=new Fm,p[X]=re);const ie=d.getCameraImage(X);re.sourceTexture=ie}}}}for(let W=0;W<E.length;W++){const ce=A[W],de=E[W];ce!==null&&de!==void 0&&de.update(ce,R,c||o)}We&&We(G,R),R.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:R}),_=null}const at=new km;at.setAnimationLoop(dt),this.setAnimationLoop=function(G){We=G},this.dispose=function(){}}}const ps=new di,FD=new Dt;function OD(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Im(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,x,b){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&g(m,p,b)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,S,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===_n&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===_n&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const S=e.get(p),x=S.envMap,b=S.envMapRotation;x&&(m.envMap.value=x,ps.copy(b),ps.x*=-1,ps.y*=-1,ps.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),m.envMapRotation.value.setFromMatrix4(FD.makeRotationFromEuler(ps)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,S,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function g(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===_n&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const S=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function kD(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,x){const b=x.program;i.uniformBlockBinding(S,b)}function c(S,x){let b=s[S.id];b===void 0&&(_(S),b=u(S),s[S.id]=b,S.addEventListener("dispose",m));const E=x.program;i.updateUBOMapping(S,E);const A=e.render.frame;r[S.id]!==A&&(h(S),r[S.id]=A)}function u(S){const x=d();S.__bindingPointIndex=x;const b=n.createBuffer(),E=S.__size,A=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,E,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,x,b),b}function d(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return mt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(S){const x=s[S.id],b=S.uniforms,E=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,x);for(let A=0,T=b.length;A<T;A++){const I=Array.isArray(b[A])?b[A]:[b[A]];for(let M=0,w=I.length;M<w;M++){const N=I[M];if(g(N,A,M,E)===!0){const O=N.__offset,q=Array.isArray(N.value)?N.value:[N.value];let Q=0;for(let te=0;te<q.length;te++){const H=q[te],D=v(H);typeof H=="number"||typeof H=="boolean"?(N.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,O+Q,N.__data)):H.isMatrix3?(N.__data[0]=H.elements[0],N.__data[1]=H.elements[1],N.__data[2]=H.elements[2],N.__data[3]=0,N.__data[4]=H.elements[3],N.__data[5]=H.elements[4],N.__data[6]=H.elements[5],N.__data[7]=0,N.__data[8]=H.elements[6],N.__data[9]=H.elements[7],N.__data[10]=H.elements[8],N.__data[11]=0):(H.toArray(N.__data,Q),Q+=D.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,N.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function g(S,x,b,E){const A=S.value,T=x+"_"+b;if(E[T]===void 0)return typeof A=="number"||typeof A=="boolean"?E[T]=A:E[T]=A.clone(),!0;{const I=E[T];if(typeof A=="number"||typeof A=="boolean"){if(I!==A)return E[T]=A,!0}else if(I.equals(A)===!1)return I.copy(A),!0}return!1}function _(S){const x=S.uniforms;let b=0;const E=16;for(let T=0,I=x.length;T<I;T++){const M=Array.isArray(x[T])?x[T]:[x[T]];for(let w=0,N=M.length;w<N;w++){const O=M[w],q=Array.isArray(O.value)?O.value:[O.value];for(let Q=0,te=q.length;Q<te;Q++){const H=q[Q],D=v(H),$=b%E,fe=$%D.boundary,he=$+fe;b+=fe,he!==0&&E-he<D.storage&&(b+=E-he),O.__data=new Float32Array(D.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=b,b+=D.storage}}}const A=b%E;return A>0&&(b+=E-A),S.__size=b,S.__cache={},this}function v(S){const x={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(x.boundary=4,x.storage=4):S.isVector2?(x.boundary=8,x.storage=8):S.isVector3||S.isColor?(x.boundary=16,x.storage=12):S.isVector4?(x.boundary=16,x.storage=16):S.isMatrix3?(x.boundary=48,x.storage=48):S.isMatrix4?(x.boundary=64,x.storage=64):S.isTexture?Ze("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ze("WebGLRenderer: Unsupported uniform value type.",S),x}function m(S){const x=S.target;x.removeEventListener("dispose",m);const b=o.indexOf(x.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(const S in s)n.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}const BD=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Kn=null;function VD(){return Kn===null&&(Kn=new DR(BD,16,16,dr,Ni),Kn.name="DFG_LUT",Kn.minFilter=on,Kn.magFilter=on,Kn.wrapS=Ai,Kn.wrapT=Ai,Kn.generateMipmaps=!1,Kn.needsUpdate=!0),Kn}class zD{constructor(e={}){const{canvas:t=rR(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:g=bn}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=o;const v=g,m=new Set([Ou,Fu,Uu]),p=new Set([bn,ui,Qr,eo,Lu,Nu]),S=new Uint32Array(4),x=new Int32Array(4);let b=null,E=null;const A=[],T=[];let I=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ri,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const M=this;let w=!1;this._outputColorSpace=Dn;let N=0,O=0,q=null,Q=-1,te=null;const H=new Ot,D=new Ot;let $=null;const fe=new ct(0);let he=0,ye=t.width,He=t.height,We=1,dt=null,at=null;const G=new Ot(0,0,ye,He),R=new Ot(0,0,ye,He);let W=!1;const ce=new Hu;let de=!1,Be=!1;const U=new Dt,k=new J,X=new Ot,re={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ie=!1;function ae(){return q===null?We:1}let L=i;function _e(P,Y){return t.getContext(P,Y)}try{const P={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Pu}`),t.addEventListener("webglcontextlost",Je,!1),t.addEventListener("webglcontextrestored",Ct,!1),t.addEventListener("webglcontextcreationerror",yt,!1),L===null){const Y="webgl2";if(L=_e(Y,P),L===null)throw _e(Y)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(P){throw mt("WebGLRenderer: "+P.message),P}let pe,ue,me,C,y,V,ee,le,Z,Ie,Se,Ne,Ge,xe,we,Ce,Fe,Ee,tt,j,Le,be,ke,Me;function ge(){pe=new V2(L),pe.init(),be=new ID(L,pe),ue=new I2(L,pe,e,be),me=new RD(L,pe),ue.reversedDepthBuffer&&h&&me.buffers.depth.setReversed(!0),C=new G2(L),y=new pD,V=new PD(L,pe,me,y,ue,be,C),ee=new L2(M),le=new B2(M),Z=new qR(L),ke=new R2(L,Z),Ie=new z2(L,Z,C,ke),Se=new W2(L,Ie,Z,C),tt=new $2(L,ue,V),Ce=new D2(y),Ne=new hD(M,ee,le,pe,ue,ke,Ce),Ge=new OD(M,y),xe=new gD,we=new MD(pe),Ee=new C2(M,ee,le,me,Se,_,l),Fe=new AD(M,Se,ue),Me=new kD(L,C,ue,me),j=new P2(L,pe,C),Le=new H2(L,pe,C),C.programs=Ne.programs,M.capabilities=ue,M.extensions=pe,M.properties=y,M.renderLists=xe,M.shadowMap=Fe,M.state=me,M.info=C}ge(),v!==bn&&(I=new q2(v,t.width,t.height,s,r));const Ae=new UD(M,L);this.xr=Ae,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const P=pe.get("WEBGL_lose_context");P&&P.loseContext()},this.forceContextRestore=function(){const P=pe.get("WEBGL_lose_context");P&&P.restoreContext()},this.getPixelRatio=function(){return We},this.setPixelRatio=function(P){P!==void 0&&(We=P,this.setSize(ye,He,!1))},this.getSize=function(P){return P.set(ye,He)},this.setSize=function(P,Y,oe=!0){if(Ae.isPresenting){Ze("WebGLRenderer: Can't change size while VR device is presenting.");return}ye=P,He=Y,t.width=Math.floor(P*We),t.height=Math.floor(Y*We),oe===!0&&(t.style.width=P+"px",t.style.height=Y+"px"),I!==null&&I.setSize(t.width,t.height),this.setViewport(0,0,P,Y)},this.getDrawingBufferSize=function(P){return P.set(ye*We,He*We).floor()},this.setDrawingBufferSize=function(P,Y,oe){ye=P,He=Y,We=oe,t.width=Math.floor(P*oe),t.height=Math.floor(Y*oe),this.setViewport(0,0,P,Y)},this.setEffects=function(P){if(v===bn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(P){for(let Y=0;Y<P.length;Y++)if(P[Y].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(P||[])},this.getCurrentViewport=function(P){return P.copy(H)},this.getViewport=function(P){return P.copy(G)},this.setViewport=function(P,Y,oe,se){P.isVector4?G.set(P.x,P.y,P.z,P.w):G.set(P,Y,oe,se),me.viewport(H.copy(G).multiplyScalar(We).round())},this.getScissor=function(P){return P.copy(R)},this.setScissor=function(P,Y,oe,se){P.isVector4?R.set(P.x,P.y,P.z,P.w):R.set(P,Y,oe,se),me.scissor(D.copy(R).multiplyScalar(We).round())},this.getScissorTest=function(){return W},this.setScissorTest=function(P){me.setScissorTest(W=P)},this.setOpaqueSort=function(P){dt=P},this.setTransparentSort=function(P){at=P},this.getClearColor=function(P){return P.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor(...arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha(...arguments)},this.clear=function(P=!0,Y=!0,oe=!0){let se=0;if(P){let K=!1;if(q!==null){const Re=q.texture.format;K=m.has(Re)}if(K){const Re=q.texture.type,Ve=p.has(Re),De=Ee.getClearColor(),ze=Ee.getClearAlpha(),$e=De.r,Ke=De.g,je=De.b;Ve?(S[0]=$e,S[1]=Ke,S[2]=je,S[3]=ze,L.clearBufferuiv(L.COLOR,0,S)):(x[0]=$e,x[1]=Ke,x[2]=je,x[3]=ze,L.clearBufferiv(L.COLOR,0,x))}else se|=L.COLOR_BUFFER_BIT}Y&&(se|=L.DEPTH_BUFFER_BIT),oe&&(se|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(se)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Je,!1),t.removeEventListener("webglcontextrestored",Ct,!1),t.removeEventListener("webglcontextcreationerror",yt,!1),Ee.dispose(),xe.dispose(),we.dispose(),y.dispose(),ee.dispose(),le.dispose(),Se.dispose(),ke.dispose(),Me.dispose(),Ne.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",ju),Ae.removeEventListener("sessionend",Yu),is.stop()};function Je(P){P.preventDefault(),wf("WebGLRenderer: Context Lost."),w=!0}function Ct(){wf("WebGLRenderer: Context Restored."),w=!1;const P=C.autoReset,Y=Fe.enabled,oe=Fe.autoUpdate,se=Fe.needsUpdate,K=Fe.type;ge(),C.autoReset=P,Fe.enabled=Y,Fe.autoUpdate=oe,Fe.needsUpdate=se,Fe.type=K}function yt(P){mt("WebGLRenderer: A WebGL context could not be created. Reason: ",P.statusMessage)}function jn(P){const Y=P.target;Y.removeEventListener("dispose",jn),mi(Y)}function mi(P){Gm(P),y.remove(P)}function Gm(P){const Y=y.get(P).programs;Y!==void 0&&(Y.forEach(function(oe){Ne.releaseProgram(oe)}),P.isShaderMaterial&&Ne.releaseShaderCache(P))}this.renderBufferDirect=function(P,Y,oe,se,K,Re){Y===null&&(Y=re);const Ve=K.isMesh&&K.matrixWorld.determinant()<0,De=Wm(P,Y,oe,se,K);me.setMaterial(se,Ve);let ze=oe.index,$e=1;if(se.wireframe===!0){if(ze=Ie.getWireframeAttribute(oe),ze===void 0)return;$e=2}const Ke=oe.drawRange,je=oe.attributes.position;let ot=Ke.start*$e,bt=(Ke.start+Ke.count)*$e;Re!==null&&(ot=Math.max(ot,Re.start*$e),bt=Math.min(bt,(Re.start+Re.count)*$e)),ze!==null?(ot=Math.max(ot,0),bt=Math.min(bt,ze.count)):je!=null&&(ot=Math.max(ot,0),bt=Math.min(bt,je.count));const Lt=bt-ot;if(Lt<0||Lt===1/0)return;ke.setup(K,se,De,oe,ze);let Nt,Tt=j;if(ze!==null&&(Nt=Z.get(ze),Tt=Le,Tt.setIndex(Nt)),K.isMesh)se.wireframe===!0?(me.setLineWidth(se.wireframeLinewidth*ae()),Tt.setMode(L.LINES)):Tt.setMode(L.TRIANGLES);else if(K.isLine){let Ye=se.linewidth;Ye===void 0&&(Ye=1),me.setLineWidth(Ye*ae()),K.isLineSegments?Tt.setMode(L.LINES):K.isLineLoop?Tt.setMode(L.LINE_LOOP):Tt.setMode(L.LINE_STRIP)}else K.isPoints?Tt.setMode(L.POINTS):K.isSprite&&Tt.setMode(L.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)to("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Tt.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(pe.get("WEBGL_multi_draw"))Tt.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const Ye=K._multiDrawStarts,St=K._multiDrawCounts,pt=K._multiDrawCount,xn=ze?Z.get(ze).bytesPerElement:1,Cs=y.get(se).currentProgram.getUniforms();for(let yn=0;yn<pt;yn++)Cs.setValue(L,"_gl_DrawID",yn),Tt.render(Ye[yn]/xn,St[yn])}else if(K.isInstancedMesh)Tt.renderInstances(ot,Lt,K.count);else if(oe.isInstancedBufferGeometry){const Ye=oe._maxInstanceCount!==void 0?oe._maxInstanceCount:1/0,St=Math.min(oe.instanceCount,Ye);Tt.renderInstances(ot,Lt,St)}else Tt.render(ot,Lt)};function qu(P,Y,oe){P.transparent===!0&&P.side===ti&&P.forceSinglePass===!1?(P.side=_n,P.needsUpdate=!0,go(P,Y,oe),P.side=ts,P.needsUpdate=!0,go(P,Y,oe),P.side=ti):go(P,Y,oe)}this.compile=function(P,Y,oe=null){oe===null&&(oe=P),E=we.get(oe),E.init(Y),T.push(E),oe.traverseVisible(function(K){K.isLight&&K.layers.test(Y.layers)&&(E.pushLight(K),K.castShadow&&E.pushShadow(K))}),P!==oe&&P.traverseVisible(function(K){K.isLight&&K.layers.test(Y.layers)&&(E.pushLight(K),K.castShadow&&E.pushShadow(K))}),E.setupLights();const se=new Set;return P.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Re=K.material;if(Re)if(Array.isArray(Re))for(let Ve=0;Ve<Re.length;Ve++){const De=Re[Ve];qu(De,oe,K),se.add(De)}else qu(Re,oe,K),se.add(Re)}),E=T.pop(),se},this.compileAsync=function(P,Y,oe=null){const se=this.compile(P,Y,oe);return new Promise(K=>{function Re(){if(se.forEach(function(Ve){y.get(Ve).currentProgram.isReady()&&se.delete(Ve)}),se.size===0){K(P);return}setTimeout(Re,10)}pe.get("KHR_parallel_shader_compile")!==null?Re():setTimeout(Re,10)})};let qa=null;function $m(P){qa&&qa(P)}function ju(){is.stop()}function Yu(){is.start()}const is=new km;is.setAnimationLoop($m),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(P){qa=P,Ae.setAnimationLoop(P),P===null?is.stop():is.start()},Ae.addEventListener("sessionstart",ju),Ae.addEventListener("sessionend",Yu),this.render=function(P,Y){if(Y!==void 0&&Y.isCamera!==!0){mt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;const oe=Ae.enabled===!0&&Ae.isPresenting===!0,se=I!==null&&(q===null||oe)&&I.begin(M,q);if(P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),Y.parent===null&&Y.matrixWorldAutoUpdate===!0&&Y.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(Y),Y=Ae.getCamera()),P.isScene===!0&&P.onBeforeRender(M,P,Y,q),E=we.get(P,T.length),E.init(Y),T.push(E),U.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),ce.setFromProjectionMatrix(U,ii,Y.reversedDepth),Be=this.localClippingEnabled,de=Ce.init(this.clippingPlanes,Be),b=xe.get(P,A.length),b.init(),A.push(b),Ae.enabled===!0&&Ae.isPresenting===!0){const Ve=M.xr.getDepthSensingMesh();Ve!==null&&ja(Ve,Y,-1/0,M.sortObjects)}ja(P,Y,0,M.sortObjects),b.finish(),M.sortObjects===!0&&b.sort(dt,at),ie=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,ie&&Ee.addToRenderList(b,P),this.info.render.frame++,de===!0&&Ce.beginShadows();const K=E.state.shadowsArray;if(Fe.render(K,P,Y),de===!0&&Ce.endShadows(),this.info.autoReset===!0&&this.info.reset(),(se&&I.hasRenderPass())===!1){const Ve=b.opaque,De=b.transmissive;if(E.setupLights(),Y.isArrayCamera){const ze=Y.cameras;if(De.length>0)for(let $e=0,Ke=ze.length;$e<Ke;$e++){const je=ze[$e];Zu(Ve,De,P,je)}ie&&Ee.render(P);for(let $e=0,Ke=ze.length;$e<Ke;$e++){const je=ze[$e];Ku(b,P,je,je.viewport)}}else De.length>0&&Zu(Ve,De,P,Y),ie&&Ee.render(P),Ku(b,P,Y)}q!==null&&O===0&&(V.updateMultisampleRenderTarget(q),V.updateRenderTargetMipmap(q)),se&&I.end(M),P.isScene===!0&&P.onAfterRender(M,P,Y),ke.resetDefaultState(),Q=-1,te=null,T.pop(),T.length>0?(E=T[T.length-1],de===!0&&Ce.setGlobalState(M.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?b=A[A.length-1]:b=null};function ja(P,Y,oe,se){if(P.visible===!1)return;if(P.layers.test(Y.layers)){if(P.isGroup)oe=P.renderOrder;else if(P.isLOD)P.autoUpdate===!0&&P.update(Y);else if(P.isLight)E.pushLight(P),P.castShadow&&E.pushShadow(P);else if(P.isSprite){if(!P.frustumCulled||ce.intersectsSprite(P)){se&&X.setFromMatrixPosition(P.matrixWorld).applyMatrix4(U);const Ve=Se.update(P),De=P.material;De.visible&&b.push(P,Ve,De,oe,X.z,null)}}else if((P.isMesh||P.isLine||P.isPoints)&&(!P.frustumCulled||ce.intersectsObject(P))){const Ve=Se.update(P),De=P.material;if(se&&(P.boundingSphere!==void 0?(P.boundingSphere===null&&P.computeBoundingSphere(),X.copy(P.boundingSphere.center)):(Ve.boundingSphere===null&&Ve.computeBoundingSphere(),X.copy(Ve.boundingSphere.center)),X.applyMatrix4(P.matrixWorld).applyMatrix4(U)),Array.isArray(De)){const ze=Ve.groups;for(let $e=0,Ke=ze.length;$e<Ke;$e++){const je=ze[$e],ot=De[je.materialIndex];ot&&ot.visible&&b.push(P,Ve,ot,oe,X.z,je)}}else De.visible&&b.push(P,Ve,De,oe,X.z,null)}}const Re=P.children;for(let Ve=0,De=Re.length;Ve<De;Ve++)ja(Re[Ve],Y,oe,se)}function Ku(P,Y,oe,se){const{opaque:K,transmissive:Re,transparent:Ve}=P;E.setupLightsView(oe),de===!0&&Ce.setGlobalState(M.clippingPlanes,oe),se&&me.viewport(H.copy(se)),K.length>0&&mo(K,Y,oe),Re.length>0&&mo(Re,Y,oe),Ve.length>0&&mo(Ve,Y,oe),me.buffers.depth.setTest(!0),me.buffers.depth.setMask(!0),me.buffers.color.setMask(!0),me.setPolygonOffset(!1)}function Zu(P,Y,oe,se){if((oe.isScene===!0?oe.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[se.id]===void 0){const ot=pe.has("EXT_color_buffer_half_float")||pe.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[se.id]=new oi(1,1,{generateMipmaps:!0,type:ot?Ni:bn,minFilter:Ss,samples:ue.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ht.workingColorSpace})}const Re=E.state.transmissionRenderTarget[se.id],Ve=se.viewport||H;Re.setSize(Ve.z*M.transmissionResolutionScale,Ve.w*M.transmissionResolutionScale);const De=M.getRenderTarget(),ze=M.getActiveCubeFace(),$e=M.getActiveMipmapLevel();M.setRenderTarget(Re),M.getClearColor(fe),he=M.getClearAlpha(),he<1&&M.setClearColor(16777215,.5),M.clear(),ie&&Ee.render(oe);const Ke=M.toneMapping;M.toneMapping=ri;const je=se.viewport;if(se.viewport!==void 0&&(se.viewport=void 0),E.setupLightsView(se),de===!0&&Ce.setGlobalState(M.clippingPlanes,se),mo(P,oe,se),V.updateMultisampleRenderTarget(Re),V.updateRenderTargetMipmap(Re),pe.has("WEBGL_multisampled_render_to_texture")===!1){let ot=!1;for(let bt=0,Lt=Y.length;bt<Lt;bt++){const Nt=Y[bt],{object:Tt,geometry:Ye,material:St,group:pt}=Nt;if(St.side===ti&&Tt.layers.test(se.layers)){const xn=St.side;St.side=_n,St.needsUpdate=!0,Ju(Tt,oe,se,Ye,St,pt),St.side=xn,St.needsUpdate=!0,ot=!0}}ot===!0&&(V.updateMultisampleRenderTarget(Re),V.updateRenderTargetMipmap(Re))}M.setRenderTarget(De,ze,$e),M.setClearColor(fe,he),je!==void 0&&(se.viewport=je),M.toneMapping=Ke}function mo(P,Y,oe){const se=Y.isScene===!0?Y.overrideMaterial:null;for(let K=0,Re=P.length;K<Re;K++){const Ve=P[K],{object:De,geometry:ze,group:$e}=Ve;let Ke=Ve.material;Ke.allowOverride===!0&&se!==null&&(Ke=se),De.layers.test(oe.layers)&&Ju(De,Y,oe,ze,Ke,$e)}}function Ju(P,Y,oe,se,K,Re){P.onBeforeRender(M,Y,oe,se,K,Re),P.modelViewMatrix.multiplyMatrices(oe.matrixWorldInverse,P.matrixWorld),P.normalMatrix.getNormalMatrix(P.modelViewMatrix),K.onBeforeRender(M,Y,oe,se,P,Re),K.transparent===!0&&K.side===ti&&K.forceSinglePass===!1?(K.side=_n,K.needsUpdate=!0,M.renderBufferDirect(oe,Y,se,K,P,Re),K.side=ts,K.needsUpdate=!0,M.renderBufferDirect(oe,Y,se,K,P,Re),K.side=ti):M.renderBufferDirect(oe,Y,se,K,P,Re),P.onAfterRender(M,Y,oe,se,K,Re)}function go(P,Y,oe){Y.isScene!==!0&&(Y=re);const se=y.get(P),K=E.state.lights,Re=E.state.shadowsArray,Ve=K.state.version,De=Ne.getParameters(P,K.state,Re,Y,oe),ze=Ne.getProgramCacheKey(De);let $e=se.programs;se.environment=P.isMeshStandardMaterial?Y.environment:null,se.fog=Y.fog,se.envMap=(P.isMeshStandardMaterial?le:ee).get(P.envMap||se.environment),se.envMapRotation=se.environment!==null&&P.envMap===null?Y.environmentRotation:P.envMapRotation,$e===void 0&&(P.addEventListener("dispose",jn),$e=new Map,se.programs=$e);let Ke=$e.get(ze);if(Ke!==void 0){if(se.currentProgram===Ke&&se.lightsStateVersion===Ve)return ed(P,De),Ke}else De.uniforms=Ne.getUniforms(P),P.onBeforeCompile(De,M),Ke=Ne.acquireProgram(De,ze),$e.set(ze,Ke),se.uniforms=De.uniforms;const je=se.uniforms;return(!P.isShaderMaterial&&!P.isRawShaderMaterial||P.clipping===!0)&&(je.clippingPlanes=Ce.uniform),ed(P,De),se.needsLights=qm(P),se.lightsStateVersion=Ve,se.needsLights&&(je.ambientLightColor.value=K.state.ambient,je.lightProbe.value=K.state.probe,je.directionalLights.value=K.state.directional,je.directionalLightShadows.value=K.state.directionalShadow,je.spotLights.value=K.state.spot,je.spotLightShadows.value=K.state.spotShadow,je.rectAreaLights.value=K.state.rectArea,je.ltc_1.value=K.state.rectAreaLTC1,je.ltc_2.value=K.state.rectAreaLTC2,je.pointLights.value=K.state.point,je.pointLightShadows.value=K.state.pointShadow,je.hemisphereLights.value=K.state.hemi,je.directionalShadowMap.value=K.state.directionalShadowMap,je.directionalShadowMatrix.value=K.state.directionalShadowMatrix,je.spotShadowMap.value=K.state.spotShadowMap,je.spotLightMatrix.value=K.state.spotLightMatrix,je.spotLightMap.value=K.state.spotLightMap,je.pointShadowMap.value=K.state.pointShadowMap,je.pointShadowMatrix.value=K.state.pointShadowMatrix),se.currentProgram=Ke,se.uniformsList=null,Ke}function Qu(P){if(P.uniformsList===null){const Y=P.currentProgram.getUniforms();P.uniformsList=aa.seqWithValue(Y.seq,P.uniforms)}return P.uniformsList}function ed(P,Y){const oe=y.get(P);oe.outputColorSpace=Y.outputColorSpace,oe.batching=Y.batching,oe.batchingColor=Y.batchingColor,oe.instancing=Y.instancing,oe.instancingColor=Y.instancingColor,oe.instancingMorph=Y.instancingMorph,oe.skinning=Y.skinning,oe.morphTargets=Y.morphTargets,oe.morphNormals=Y.morphNormals,oe.morphColors=Y.morphColors,oe.morphTargetsCount=Y.morphTargetsCount,oe.numClippingPlanes=Y.numClippingPlanes,oe.numIntersection=Y.numClipIntersection,oe.vertexAlphas=Y.vertexAlphas,oe.vertexTangents=Y.vertexTangents,oe.toneMapping=Y.toneMapping}function Wm(P,Y,oe,se,K){Y.isScene!==!0&&(Y=re),V.resetTextureUnits();const Re=Y.fog,Ve=se.isMeshStandardMaterial?Y.environment:null,De=q===null?M.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:fr,ze=(se.isMeshStandardMaterial?le:ee).get(se.envMap||Ve),$e=se.vertexColors===!0&&!!oe.attributes.color&&oe.attributes.color.itemSize===4,Ke=!!oe.attributes.tangent&&(!!se.normalMap||se.anisotropy>0),je=!!oe.morphAttributes.position,ot=!!oe.morphAttributes.normal,bt=!!oe.morphAttributes.color;let Lt=ri;se.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Lt=M.toneMapping);const Nt=oe.morphAttributes.position||oe.morphAttributes.normal||oe.morphAttributes.color,Tt=Nt!==void 0?Nt.length:0,Ye=y.get(se),St=E.state.lights;if(de===!0&&(Be===!0||P!==te)){const ln=P===te&&se.id===Q;Ce.setState(se,P,ln)}let pt=!1;se.version===Ye.__version?(Ye.needsLights&&Ye.lightsStateVersion!==St.state.version||Ye.outputColorSpace!==De||K.isBatchedMesh&&Ye.batching===!1||!K.isBatchedMesh&&Ye.batching===!0||K.isBatchedMesh&&Ye.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&Ye.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&Ye.instancing===!1||!K.isInstancedMesh&&Ye.instancing===!0||K.isSkinnedMesh&&Ye.skinning===!1||!K.isSkinnedMesh&&Ye.skinning===!0||K.isInstancedMesh&&Ye.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&Ye.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&Ye.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&Ye.instancingMorph===!1&&K.morphTexture!==null||Ye.envMap!==ze||se.fog===!0&&Ye.fog!==Re||Ye.numClippingPlanes!==void 0&&(Ye.numClippingPlanes!==Ce.numPlanes||Ye.numIntersection!==Ce.numIntersection)||Ye.vertexAlphas!==$e||Ye.vertexTangents!==Ke||Ye.morphTargets!==je||Ye.morphNormals!==ot||Ye.morphColors!==bt||Ye.toneMapping!==Lt||Ye.morphTargetsCount!==Tt)&&(pt=!0):(pt=!0,Ye.__version=se.version);let xn=Ye.currentProgram;pt===!0&&(xn=go(se,Y,K));let Cs=!1,yn=!1,_r=!1;const Rt=xn.getUniforms(),mn=Ye.uniforms;if(me.useProgram(xn.program)&&(Cs=!0,yn=!0,_r=!0),se.id!==Q&&(Q=se.id,yn=!0),Cs||te!==P){me.buffers.depth.getReversed()&&P.reversedDepth!==!0&&(P._reversedDepth=!0,P.updateProjectionMatrix()),Rt.setValue(L,"projectionMatrix",P.projectionMatrix),Rt.setValue(L,"viewMatrix",P.matrixWorldInverse);const gn=Rt.map.cameraPosition;gn!==void 0&&gn.setValue(L,k.setFromMatrixPosition(P.matrixWorld)),ue.logarithmicDepthBuffer&&Rt.setValue(L,"logDepthBufFC",2/(Math.log(P.far+1)/Math.LN2)),(se.isMeshPhongMaterial||se.isMeshToonMaterial||se.isMeshLambertMaterial||se.isMeshBasicMaterial||se.isMeshStandardMaterial||se.isShaderMaterial)&&Rt.setValue(L,"isOrthographic",P.isOrthographicCamera===!0),te!==P&&(te=P,yn=!0,_r=!0)}if(Ye.needsLights&&(St.state.directionalShadowMap.length>0&&Rt.setValue(L,"directionalShadowMap",St.state.directionalShadowMap,V),St.state.spotShadowMap.length>0&&Rt.setValue(L,"spotShadowMap",St.state.spotShadowMap,V),St.state.pointShadowMap.length>0&&Rt.setValue(L,"pointShadowMap",St.state.pointShadowMap,V)),K.isSkinnedMesh){Rt.setOptional(L,K,"bindMatrix"),Rt.setOptional(L,K,"bindMatrixInverse");const ln=K.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),Rt.setValue(L,"boneTexture",ln.boneTexture,V))}K.isBatchedMesh&&(Rt.setOptional(L,K,"batchingTexture"),Rt.setValue(L,"batchingTexture",K._matricesTexture,V),Rt.setOptional(L,K,"batchingIdTexture"),Rt.setValue(L,"batchingIdTexture",K._indirectTexture,V),Rt.setOptional(L,K,"batchingColorTexture"),K._colorsTexture!==null&&Rt.setValue(L,"batchingColorTexture",K._colorsTexture,V));const Rn=oe.morphAttributes;if((Rn.position!==void 0||Rn.normal!==void 0||Rn.color!==void 0)&&tt.update(K,oe,xn),(yn||Ye.receiveShadow!==K.receiveShadow)&&(Ye.receiveShadow=K.receiveShadow,Rt.setValue(L,"receiveShadow",K.receiveShadow)),se.isMeshGouraudMaterial&&se.envMap!==null&&(mn.envMap.value=ze,mn.flipEnvMap.value=ze.isCubeTexture&&ze.isRenderTargetTexture===!1?-1:1),se.isMeshStandardMaterial&&se.envMap===null&&Y.environment!==null&&(mn.envMapIntensity.value=Y.environmentIntensity),mn.dfgLUT!==void 0&&(mn.dfgLUT.value=VD()),yn&&(Rt.setValue(L,"toneMappingExposure",M.toneMappingExposure),Ye.needsLights&&Xm(mn,_r),Re&&se.fog===!0&&Ge.refreshFogUniforms(mn,Re),Ge.refreshMaterialUniforms(mn,se,We,He,E.state.transmissionRenderTarget[P.id]),aa.upload(L,Qu(Ye),mn,V)),se.isShaderMaterial&&se.uniformsNeedUpdate===!0&&(aa.upload(L,Qu(Ye),mn,V),se.uniformsNeedUpdate=!1),se.isSpriteMaterial&&Rt.setValue(L,"center",K.center),Rt.setValue(L,"modelViewMatrix",K.modelViewMatrix),Rt.setValue(L,"normalMatrix",K.normalMatrix),Rt.setValue(L,"modelMatrix",K.matrixWorld),se.isShaderMaterial||se.isRawShaderMaterial){const ln=se.uniformsGroups;for(let gn=0,Ya=ln.length;gn<Ya;gn++){const ss=ln[gn];Me.update(ss,xn),Me.bind(ss,xn)}}return xn}function Xm(P,Y){P.ambientLightColor.needsUpdate=Y,P.lightProbe.needsUpdate=Y,P.directionalLights.needsUpdate=Y,P.directionalLightShadows.needsUpdate=Y,P.pointLights.needsUpdate=Y,P.pointLightShadows.needsUpdate=Y,P.spotLights.needsUpdate=Y,P.spotLightShadows.needsUpdate=Y,P.rectAreaLights.needsUpdate=Y,P.hemisphereLights.needsUpdate=Y}function qm(P){return P.isMeshLambertMaterial||P.isMeshToonMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isShadowMaterial||P.isShaderMaterial&&P.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(P,Y,oe){const se=y.get(P);se.__autoAllocateDepthBuffer=P.resolveDepthBuffer===!1,se.__autoAllocateDepthBuffer===!1&&(se.__useRenderToTexture=!1),y.get(P.texture).__webglTexture=Y,y.get(P.depthTexture).__webglTexture=se.__autoAllocateDepthBuffer?void 0:oe,se.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(P,Y){const oe=y.get(P);oe.__webglFramebuffer=Y,oe.__useDefaultFramebuffer=Y===void 0};const jm=L.createFramebuffer();this.setRenderTarget=function(P,Y=0,oe=0){q=P,N=Y,O=oe;let se=null,K=!1,Re=!1;if(P){const De=y.get(P);if(De.__useDefaultFramebuffer!==void 0){me.bindFramebuffer(L.FRAMEBUFFER,De.__webglFramebuffer),H.copy(P.viewport),D.copy(P.scissor),$=P.scissorTest,me.viewport(H),me.scissor(D),me.setScissorTest($),Q=-1;return}else if(De.__webglFramebuffer===void 0)V.setupRenderTarget(P);else if(De.__hasExternalTextures)V.rebindTextures(P,y.get(P.texture).__webglTexture,y.get(P.depthTexture).__webglTexture);else if(P.depthBuffer){const Ke=P.depthTexture;if(De.__boundDepthTexture!==Ke){if(Ke!==null&&y.has(Ke)&&(P.width!==Ke.image.width||P.height!==Ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");V.setupDepthRenderbuffer(P)}}const ze=P.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Re=!0);const $e=y.get(P).__webglFramebuffer;P.isWebGLCubeRenderTarget?(Array.isArray($e[Y])?se=$e[Y][oe]:se=$e[Y],K=!0):P.samples>0&&V.useMultisampledRTT(P)===!1?se=y.get(P).__webglMultisampledFramebuffer:Array.isArray($e)?se=$e[oe]:se=$e,H.copy(P.viewport),D.copy(P.scissor),$=P.scissorTest}else H.copy(G).multiplyScalar(We).floor(),D.copy(R).multiplyScalar(We).floor(),$=W;if(oe!==0&&(se=jm),me.bindFramebuffer(L.FRAMEBUFFER,se)&&me.drawBuffers(P,se),me.viewport(H),me.scissor(D),me.setScissorTest($),K){const De=y.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+Y,De.__webglTexture,oe)}else if(Re){const De=Y;for(let ze=0;ze<P.textures.length;ze++){const $e=y.get(P.textures[ze]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+ze,$e.__webglTexture,oe,De)}}else if(P!==null&&oe!==0){const De=y.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,De.__webglTexture,oe)}Q=-1},this.readRenderTargetPixels=function(P,Y,oe,se,K,Re,Ve,De=0){if(!(P&&P.isWebGLRenderTarget)){mt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=y.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&Ve!==void 0&&(ze=ze[Ve]),ze){me.bindFramebuffer(L.FRAMEBUFFER,ze);try{const $e=P.textures[De],Ke=$e.format,je=$e.type;if(!ue.textureFormatReadable(Ke)){mt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ue.textureTypeReadable(je)){mt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Y>=0&&Y<=P.width-se&&oe>=0&&oe<=P.height-K&&(P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+De),L.readPixels(Y,oe,se,K,be.convert(Ke),be.convert(je),Re))}finally{const $e=q!==null?y.get(q).__webglFramebuffer:null;me.bindFramebuffer(L.FRAMEBUFFER,$e)}}},this.readRenderTargetPixelsAsync=async function(P,Y,oe,se,K,Re,Ve,De=0){if(!(P&&P.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ze=y.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&Ve!==void 0&&(ze=ze[Ve]),ze)if(Y>=0&&Y<=P.width-se&&oe>=0&&oe<=P.height-K){me.bindFramebuffer(L.FRAMEBUFFER,ze);const $e=P.textures[De],Ke=$e.format,je=$e.type;if(!ue.textureFormatReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ue.textureTypeReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ot=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ot),L.bufferData(L.PIXEL_PACK_BUFFER,Re.byteLength,L.STREAM_READ),P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+De),L.readPixels(Y,oe,se,K,be.convert(Ke),be.convert(je),0);const bt=q!==null?y.get(q).__webglFramebuffer:null;me.bindFramebuffer(L.FRAMEBUFFER,bt);const Lt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await oR(L,Lt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ot),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Re),L.deleteBuffer(ot),L.deleteSync(Lt),Re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(P,Y=null,oe=0){const se=Math.pow(2,-oe),K=Math.floor(P.image.width*se),Re=Math.floor(P.image.height*se),Ve=Y!==null?Y.x:0,De=Y!==null?Y.y:0;V.setTexture2D(P,0),L.copyTexSubImage2D(L.TEXTURE_2D,oe,0,0,Ve,De,K,Re),me.unbindTexture()};const Ym=L.createFramebuffer(),Km=L.createFramebuffer();this.copyTextureToTexture=function(P,Y,oe=null,se=null,K=0,Re=null){Re===null&&(K!==0?(to("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Re=K,K=0):Re=0);let Ve,De,ze,$e,Ke,je,ot,bt,Lt;const Nt=P.isCompressedTexture?P.mipmaps[Re]:P.image;if(oe!==null)Ve=oe.max.x-oe.min.x,De=oe.max.y-oe.min.y,ze=oe.isBox3?oe.max.z-oe.min.z:1,$e=oe.min.x,Ke=oe.min.y,je=oe.isBox3?oe.min.z:0;else{const Rn=Math.pow(2,-K);Ve=Math.floor(Nt.width*Rn),De=Math.floor(Nt.height*Rn),P.isDataArrayTexture?ze=Nt.depth:P.isData3DTexture?ze=Math.floor(Nt.depth*Rn):ze=1,$e=0,Ke=0,je=0}se!==null?(ot=se.x,bt=se.y,Lt=se.z):(ot=0,bt=0,Lt=0);const Tt=be.convert(Y.format),Ye=be.convert(Y.type);let St;Y.isData3DTexture?(V.setTexture3D(Y,0),St=L.TEXTURE_3D):Y.isDataArrayTexture||Y.isCompressedArrayTexture?(V.setTexture2DArray(Y,0),St=L.TEXTURE_2D_ARRAY):(V.setTexture2D(Y,0),St=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,Y.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,Y.unpackAlignment);const pt=L.getParameter(L.UNPACK_ROW_LENGTH),xn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Cs=L.getParameter(L.UNPACK_SKIP_PIXELS),yn=L.getParameter(L.UNPACK_SKIP_ROWS),_r=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,Nt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Nt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,$e),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ke),L.pixelStorei(L.UNPACK_SKIP_IMAGES,je);const Rt=P.isDataArrayTexture||P.isData3DTexture,mn=Y.isDataArrayTexture||Y.isData3DTexture;if(P.isDepthTexture){const Rn=y.get(P),ln=y.get(Y),gn=y.get(Rn.__renderTarget),Ya=y.get(ln.__renderTarget);me.bindFramebuffer(L.READ_FRAMEBUFFER,gn.__webglFramebuffer),me.bindFramebuffer(L.DRAW_FRAMEBUFFER,Ya.__webglFramebuffer);for(let ss=0;ss<ze;ss++)Rt&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,y.get(P).__webglTexture,K,je+ss),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,y.get(Y).__webglTexture,Re,Lt+ss)),L.blitFramebuffer($e,Ke,Ve,De,ot,bt,Ve,De,L.DEPTH_BUFFER_BIT,L.NEAREST);me.bindFramebuffer(L.READ_FRAMEBUFFER,null),me.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(K!==0||P.isRenderTargetTexture||y.has(P)){const Rn=y.get(P),ln=y.get(Y);me.bindFramebuffer(L.READ_FRAMEBUFFER,Ym),me.bindFramebuffer(L.DRAW_FRAMEBUFFER,Km);for(let gn=0;gn<ze;gn++)Rt?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Rn.__webglTexture,K,je+gn):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Rn.__webglTexture,K),mn?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ln.__webglTexture,Re,Lt+gn):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ln.__webglTexture,Re),K!==0?L.blitFramebuffer($e,Ke,Ve,De,ot,bt,Ve,De,L.COLOR_BUFFER_BIT,L.NEAREST):mn?L.copyTexSubImage3D(St,Re,ot,bt,Lt+gn,$e,Ke,Ve,De):L.copyTexSubImage2D(St,Re,ot,bt,$e,Ke,Ve,De);me.bindFramebuffer(L.READ_FRAMEBUFFER,null),me.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else mn?P.isDataTexture||P.isData3DTexture?L.texSubImage3D(St,Re,ot,bt,Lt,Ve,De,ze,Tt,Ye,Nt.data):Y.isCompressedArrayTexture?L.compressedTexSubImage3D(St,Re,ot,bt,Lt,Ve,De,ze,Tt,Nt.data):L.texSubImage3D(St,Re,ot,bt,Lt,Ve,De,ze,Tt,Ye,Nt):P.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Re,ot,bt,Ve,De,Tt,Ye,Nt.data):P.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Re,ot,bt,Nt.width,Nt.height,Tt,Nt.data):L.texSubImage2D(L.TEXTURE_2D,Re,ot,bt,Ve,De,Tt,Ye,Nt);L.pixelStorei(L.UNPACK_ROW_LENGTH,pt),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,xn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Cs),L.pixelStorei(L.UNPACK_SKIP_ROWS,yn),L.pixelStorei(L.UNPACK_SKIP_IMAGES,_r),Re===0&&Y.generateMipmaps&&L.generateMipmap(St),me.unbindTexture()},this.initRenderTarget=function(P){y.get(P).__webglFramebuffer===void 0&&V.setupRenderTarget(P)},this.initTexture=function(P){P.isCubeTexture?V.setTextureCube(P,0):P.isData3DTexture?V.setTexture3D(P,0):P.isDataArrayTexture||P.isCompressedArrayTexture?V.setTexture2DArray(P,0):V.setTexture2D(P,0),me.unbindTexture()},this.resetState=function(){N=0,O=0,q=null,me.reset(),ke.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ii}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ht._getDrawingBufferColorSpace(e),t.unpackColorSpace=ht._getUnpackColorSpace()}}const HD={class:"fishing-page"},GD={class:"fishing-header"},$D={class:"score-display"},WD={class:"score-value"},XD={class:"fishing-container"},qD={class:"game-controls"},jD=["disabled"],YD={class:"caught-fish"},KD={key:0,class:"empty-catch"},ZD={key:1,class:"fish-list"},JD=et({__name:"FishingPage",setup(n){const e=ne(null),t=ne(!1),i=ne(0),s=ne([]),r=ne(null),o=ne(null),a=ne(null);let l=null,c=null,u=null,d=[],h=[];const g=[{color:16739179,name:"Red Snapper",points:10},{color:5164484,name:"Coral Fish",points:15},{color:16770669,name:"Golden Fish",points:20},{color:9822675,name:"Jellyfish",points:25},{color:14524637,name:"Tropical Fish",points:30}],_=()=>{if(!e.value)return;r.value=new IR,r.value.background=new ct(30654),r.value.fog=new zu(30654,10,50),o.value=new Ln(75,e.value.clientWidth/e.value.clientHeight,.1,1e3),o.value.position.set(0,5,10),o.value.lookAt(0,0,0),a.value=new zD({antialias:!0}),a.value.setSize(e.value.clientWidth,e.value.clientHeight),a.value.setPixelRatio(window.devicePixelRatio),e.value.appendChild(a.value.domElement);const A=new $R(16777215,.5);r.value.add(A);const T=new GR(16777215,1);T.position.set(5,10,5),r.value.add(T);const I=new po(50,50,32,32),M=new Bl({color:27028,transparent:!0,opacity:.8,side:ti}),w=new wn(I,M);w.rotation.x=-Math.PI/2,w.position.y=-.5,r.value.add(w),v();for(let N=0;N<8;N++)m();window.addEventListener("resize",b)},v=()=>{if(!r.value)return;const A=new $u(.2,.05,8,16),T=new Bl({color:3355443});c=new wn(A,T),c.position.set(0,2,0),r.value.add(c);const I=new Cn().setFromPoints([new J(0,5,0),c.position]),M=new Um({color:3355443,linewidth:2});u=new FR(I,M),r.value.add(u)},m=()=>{if(!r.value)return;const A=g[Math.floor(Math.random()*g.length)],T=new Nr,I=new Ea(.3,1,8);I.rotateZ(Math.PI/2);const M=new Bl({color:A.color}),w=new wn(I,M);T.add(w);const N=new Ea(.2,.3,4);N.rotateZ(-Math.PI/2);const O=new wn(N,M);O.position.x=-.6,T.add(O),T.position.set((Math.random()-.5)*20,-2-Math.random()*3,(Math.random()-.5)*15),T.rotation.y=Math.random()*Math.PI*2,T.userData={...A,id:d.length},r.value.add(T),d.push(T),h.push({x:(Math.random()-.5)*.02,z:(Math.random()-.5)*.02})},p=()=>{if(l=requestAnimationFrame(p),!(!r.value||!o.value||!a.value||!c)){if(d.forEach((A,T)=>{A.position.x+=h[T].x,A.position.z+=h[T].z,Math.abs(A.position.x)>10&&(h[T].x*=-1),Math.abs(A.position.z)>8&&(h[T].z*=-1),A.rotation.z=Math.sin(Date.now()*.005+T)*.2}),u){const A=u.geometry.attributes.position.array;A[3]=c.position.x,A[4]=c.position.y,A[5]=c.position.z(u.geometry).attributes.position.needsUpdate=!0}a.value.render(r.value,o.value)}},S=()=>{if(!c||!t.value)return;t.value=!0;const A=c.position.y,T=-4;let I=0;const M=()=>{var N;I+=.05,c.position.y=A-(A-T)*I;const w=d.findIndex(O=>c.position.distanceTo(O.position)<.8);if(w!==-1){const O=d[w];i.value+=O.userData.points,O.value.push(O.userData.name),(N=r.value)==null||N.remove(O),d.splice(w,1),h.splice(w,1),setTimeout(()=>m(),2e3),x(A);return}I<1?requestAnimationFrame(M):x(A)};M()},x=A=>{if(!c)return;let T=0;const I=c.position.y,M=()=>{T+=.08,c.position.y=I+(A-I)*T,T<1?requestAnimationFrame(M):t.value=!1};M()},b=()=>{!o.value||!a.value||!e.value||(o.value.aspect=e.value.clientWidth/e.value.clientHeight,o.value.updateProjectionMatrix(),a.value.setSize(e.value.clientWidth,e.value.clientHeight))},E=()=>{t.value||S()};return It(()=>{_(),p()}),hi(()=>{var A;l!==null&&cancelAnimationFrame(l),window.removeEventListener("resize",b),(A=a.value)==null||A.dispose()}),(A,T)=>(F(),B("div",HD,[f("div",GD,[T[1]||(T[1]=f("h1",null,"🎣 Fishing Mini Game",-1)),f("div",$D,[T[0]||(T[0]=f("span",{class:"score-label"},"Score:",-1)),f("span",WD,z(i.value),1)])]),f("div",XD,[f("div",{ref_key:"container",ref:e,class:"game-container"},null,512),f("div",qD,[f("button",{onClick:E,disabled:t.value,class:Ue(["cast-button",{active:t.value}])},z(t.value?"🎣 Fishing...":"🎣 Cast Line"),11,jD)])]),f("div",YD,[T[2]||(T[2]=f("h2",null,"Caught Fish 🐟",-1)),s.value.length===0?(F(),B("div",KD," No fish caught yet. Cast your line! ")):(F(),B("div",ZD,[(F(!0),B(Xe,null,st(s.value,(I,M)=>(F(),B("div",{key:M,class:"fish-item"}," 🐟 "+z(I),1))),128))]))])]))}}),QD=ut(JD,[["__scopeId","data-v-40765bfc"]]),eL={class:"character-tinder-page"},tL={class:"page-header"},nL={class:"header-actions"},iL={key:0,class:"vote-result-popup"},sL={class:"vote-result-content"},rL={class:"winner-result"},oL={class:"elo-change"},aL={class:"loser-result"},lL={class:"elo-change"},cL={key:1,class:"voting-section"},uL={key:0,class:"loading"},dL={key:1,class:"empty-state"},fL={key:2,class:"character-pair"},hL=["onClick"],pL={class:"character-image"},mL=["src","alt"],gL={key:1,class:"placeholder-image"},vL={class:"character-info"},_L={class:"character-stats"},xL={class:"elo"},yL={class:"record"},SL={key:2,class:"leaderboard-section"},ML={key:0,class:"loading"},bL={key:1,class:"empty-state"},EL={key:2,class:"leaderboard"},wL={class:"rank"},TL={key:0},AL={key:1},CL={key:2},RL={key:3},PL={class:"character-display"},IL={class:"character-avatar"},DL=["src","alt"],LL={key:1,class:"avatar-placeholder"},NL={class:"character-details"},UL={class:"stats"},FL={class:"elo"},OL={class:"record"},kL=["onClick"],BL={class:"form-group"},VL={class:"form-group"},zL={class:"form-actions"},HL=["disabled"],GL=["disabled"],$L=et({__name:"CharacterTinderPage",setup(n){const e=ne([]),t=ne(null),i=ne(!1),s=ne(!1),r=ne(!1),o=ne(!1),a=ne({name:"",image_url:""}),l=ne(null),c=ne(!1),u=async()=>{r.value=!0;try{const m=await(await fetch("/api/characters")).json();e.value=m.characters||[]}catch(v){console.error("Error loading characters:",v)}finally{r.value=!1}},d=async()=>{r.value=!0;try{const m=await(await fetch("/api/characters/random-pair")).json();m.characters&&m.characters.length>=2?t.value=[m.characters[0],m.characters[1]]:t.value=null}catch(v){console.error("Error loading random pair:",v),t.value=null}finally{r.value=!1}},h=async v=>{if(!t.value||o.value)return;const m=t.value.find(p=>p.id!==v);if(m){o.value=!0;try{const S=await(await fetch("/api/characters/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({winner_id:v,loser_id:m.id})})).json();l.value=S,c.value=!0,setTimeout(async()=>{await u(),await d(),c.value=!1},1500)}catch(p){console.error("Error voting:",p)}finally{o.value=!1}}},g=async()=>{if(a.value.name.trim()){r.value=!0;try{if(!(await fetch("/api/characters",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a.value.name.trim(),image_url:a.value.image_url.trim()||null})})).ok)throw new Error("Failed to add character");a.value={name:"",image_url:""},i.value=!1,await u(),await d()}catch(v){console.error("Error adding character:",v)}finally{r.value=!1}}},_=async v=>{if(confirm("Are you sure you want to delete this character?"))try{if(!(await fetch(`/api/characters/${v}`,{method:"DELETE"})).ok)throw new Error("Failed to delete character");await u(),await d()}catch(m){console.error("Error deleting character:",m)}};return It(async()=>{await u(),await d()}),(v,m)=>(F(),B("div",eL,[f("div",tL,[m[7]||(m[7]=f("h1",null,"🎭 Fictional Character Tinder",-1)),m[8]||(m[8]=f("p",null,"Vote for your favorite characters and see who reigns supreme!",-1)),f("div",nL,[f("button",{onClick:m[0]||(m[0]=p=>i.value=!0),class:"action-btn add-btn"}," ➕ Add Character "),f("button",{onClick:m[1]||(m[1]=p=>s.value=!s.value),class:"action-btn leaderboard-btn"},z(s.value?"🎮 Start Voting":"🏆 Leaderboard"),1)])]),c.value&&l.value?(F(),B("div",iL,[f("div",sL,[f("div",rL,[f("h3",null,"🏆 "+z(l.value.winner.name)+" wins!",1),f("p",oL,"+"+z(l.value.elo_change_winner)+" ELO",1)]),f("div",aL,[f("h3",null,"💔 "+z(l.value.loser.name),1),f("p",lL,z(l.value.elo_change_loser)+" ELO",1)])])])):Te("",!0),s.value?Te("",!0):(F(),B("div",cL,[r.value?(F(),B("div",uL," Loading characters... ")):t.value?(F(),B("div",fL,[(F(!0),B(Xe,null,st(t.value,p=>(F(),B("div",{key:p.id,class:Ue(["character-card",{voting:o.value}]),onClick:S=>h(p.id)},[f("div",pL,[p.image_url?(F(),B("img",{key:0,src:p.image_url,alt:p.name},null,8,mL)):(F(),B("div",gL,[...m[11]||(m[11]=[f("span",{class:"placeholder-emoji"},"🎭",-1)])]))]),f("div",vL,[f("h3",null,z(p.name),1),f("div",_L,[f("span",xL,"⭐ "+z(p.elo_rating)+" ELO",1),f("span",yL,z(p.wins)+"W - "+z(p.losses)+"L",1)])])],10,hL))),128))])):(F(),B("div",dL,[m[9]||(m[9]=f("h2",null,"🎭 No characters yet!",-1)),m[10]||(m[10]=f("p",null,"Be the first to add a character to start voting.",-1)),f("button",{onClick:m[2]||(m[2]=p=>i.value=!0),class:"add-first-btn"}," ➕ Add First Character ")]))])),s.value?(F(),B("div",SL,[r.value?(F(),B("div",ML," Loading leaderboard... ")):e.value.length===0?(F(),B("div",bL,[...m[12]||(m[12]=[f("h2",null,"🏆 Leaderboard",-1),f("p",null,"No characters yet. Add some to start the competition!",-1)])])):(F(),B("div",EL,[(F(!0),B(Xe,null,st(e.value,(p,S)=>(F(),B("div",{key:p.id,class:Ue(["leaderboard-item",{"top-3":S<3}])},[f("div",wL,[S===0?(F(),B("span",TL,"🥇")):S===1?(F(),B("span",AL,"🥈")):S===2?(F(),B("span",CL,"🥉")):(F(),B("span",RL,z(S+1),1))]),f("div",PL,[f("div",IL,[p.image_url?(F(),B("img",{key:0,src:p.image_url,alt:p.name},null,8,DL)):(F(),B("div",LL,"🎭"))]),f("div",NL,[f("h4",null,z(p.name),1),f("div",UL,[f("span",FL,"⭐ "+z(p.elo_rating),1),f("span",OL,z(p.wins)+"W - "+z(p.losses)+"L",1)])])]),f("button",{onClick:x=>_(p.id),class:"delete-btn",title:"Delete character"}," 🗑️ ",8,kL)],2))),128))]))])):Te("",!0),vt(hc,{"is-open":i.value,title:"Add New Character",onClose:m[6]||(m[6]=p=>i.value=!1)},{default:li(()=>[f("form",{onSubmit:lo(g,["prevent"]),class:"add-character-form"},[f("div",BL,[m[13]||(m[13]=f("label",{for:"name"},"Character Name *",-1)),Et(f("input",{id:"name","onUpdate:modelValue":m[3]||(m[3]=p=>a.value.name=p),type:"text",placeholder:"e.g., Batman, Spider-Man, Wonder Woman",required:""},null,512),[[Ft,a.value.name]])]),f("div",VL,[m[14]||(m[14]=f("label",{for:"image_url"},"Image URL (optional)",-1)),Et(f("input",{id:"image_url","onUpdate:modelValue":m[4]||(m[4]=p=>a.value.image_url=p),type:"url",placeholder:"https://example.com/image.jpg"},null,512),[[Ft,a.value.image_url]])]),f("div",zL,[f("button",{type:"button",onClick:m[5]||(m[5]=p=>i.value=!1),class:"cancel-btn",disabled:r.value}," Cancel ",8,HL),f("button",{type:"submit",class:"submit-btn",disabled:r.value||!a.value.name.trim()},z(r.value?"Adding...":"Add Character"),9,GL)])],32)]),_:1},8,["is-open"])]))}}),WL=ut($L,[["__scopeId","data-v-fbebd201"]]),XL={class:"theme-selector"},qL=["onClick"],jL={class:"regenerate-section"},YL=["disabled"],KL={key:0,class:"wordcloud-loading"},ZL={key:1,class:"wordcloud-error"},JL={key:2,class:"wordcloud-container"},QL={class:"wordcloud"},eN=et({__name:"WordCloudPage",setup(n){const e=Qt(),t=ne([]),i=ne(!1),s=ne(null),r={technology:[{text:"AI",weight:10},{text:"Code",weight:9},{text:"Robot",weight:8},{text:"Data",weight:7},{text:"Cloud",weight:6},{text:"App",weight:5},{text:"Web",weight:4},{text:"Tech",weight:3},{text:"Software",weight:2},{text:"Digital",weight:1}],nature:[{text:"Ocean",weight:10},{text:"Forest",weight:9},{text:"Mountain",weight:8},{text:"River",weight:7},{text:"Cloud",weight:6},{text:"Sun",weight:5},{text:"Moon",weight:4},{text:"Star",weight:3},{text:"Tree",weight:2},{text:"Flower",weight:1}],animals:[{text:"Elephant",weight:10},{text:"Tiger",weight:9},{text:"Dolphin",weight:8},{text:"Eagle",weight:7},{text:"Wolf",weight:6},{text:"Fox",weight:5},{text:"Bear",weight:4},{text:"Lion",weight:3},{text:"Cat",weight:2},{text:"Dog",weight:1}],music:[{text:"Melody",weight:10},{text:"Rhythm",weight:9},{text:"Harmony",weight:8},{text:"Beat",weight:7},{text:"Tempo",weight:6},{text:"Note",weight:5},{text:"Chord",weight:4},{text:"Sound",weight:3},{text:"Song",weight:2},{text:"Music",weight:1}]},o=["#ff6b9d","#ff8a80","#ffd89b","#87ceeb","#a0e7e5","#b4f8c8","#fbc2eb","#a6c1ee","#d4a5a5","#f5f5dc"];let a="technology";const l=()=>{i.value=!0,s.value=null;try{const d=r[a],h=[];d.forEach((_,v)=>{const m={text:_.text,weight:_.weight,color:o[Math.floor(Math.random()*o.length)],x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15};h.push(m)}),h.slice(0,3).forEach(_=>{h.push({..._,x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15})}),t.value=h.sort((_,v)=>v.weight-_.weight)}catch(d){s.value="Failed to generate word cloud",console.error("Error generating word cloud:",d)}finally{i.value=!1}},c=d=>{a=d,l()};It(()=>{l()});const u=d=>({fontSize:`${Math.max(1.5,d.weight*.8)}rem`,color:d.color,left:`${d.x}%`,top:`${d.y}%`,transform:`rotate(${d.rotation}deg)`,opacity:d.weight/10+.2});return(d,h)=>(F(),B("div",{class:Ue(["wordcloud-page",{dark:ve(e).darkMode}])},[h[2]||(h[2]=f("div",{class:"wordcloud-header"},[f("h1",null,"☁️ Word Cloud"),f("p",{class:"subtitle"},"Visualize words in a beautiful cloud format")],-1)),f("div",XL,[(F(),B(Xe,null,st(r,(g,_)=>f("button",{key:_,class:Ue(["theme-button",{active:ve(a)===_}]),onClick:v=>c(_)},z(_.charAt(0).toUpperCase()+_.slice(1)),11,qL)),64))]),f("div",jL,[f("button",{class:"regenerate-button",onClick:l,disabled:i.value}," 🔄 "+z(i.value?"Generating...":"Regenerate Cloud"),9,YL)]),i.value?(F(),B("div",KL,[...h[0]||(h[0]=[f("span",{class:"loading-spinner"},"⏳",-1),f("p",null,"Generating word cloud...",-1)])])):s.value?(F(),B("div",ZL,[h[1]||(h[1]=f("span",{class:"error-icon"},"⚠️",-1)),f("p",null,z(s.value),1),f("button",{class:"retry-button",onClick:l},"🔄 Try Again")])):(F(),B("div",JL,[f("div",QL,[(F(!0),B(Xe,null,st(t.value,(g,_)=>(F(),B("div",{key:_,class:"word",style:Ht(u(g))},z(g.text),5))),128))])])),h[3]||(h[3]=f("div",{class:"footer-note"},[f("p",null,"💡 Click on different themes to see word clouds for various topics"),f("p",null,"🎨 Word size and opacity based on importance weight")],-1))],2))}}),tN=ut(eN,[["__scopeId","data-v-7cbceae4"]]),nN={class:"keanu-container"},iN={class:"controls"},sN={class:"size-controls"},rN={class:"size-control"},oN=["disabled"],aN={class:"size-control"},lN=["disabled"],cN={class:"buttons"},uN=["disabled"],dN=["disabled"],fN={class:"image-container"},hN={key:0,class:"loading-spinner"},pN=["src"],mN={key:2,class:"placeholder"},gN={class:"info-box"},vN=et({__name:"KeanuPage",setup(n){const e=Qt(),t=ne(""),i=ne(!1),s=ne(400),r=ne(400),o=async()=>{i.value=!0;try{t.value=`https://placekeanu.com/${s.value}/${r.value}`,await new Promise(c=>{const u=new Image;u.onload=c,u.onerror=c,u.src=t.value})}catch(c){console.error("Error fetching Keanu image:",c)}finally{i.value=!1}},a=()=>{s.value=Math.floor(Math.random()*400)+200,r.value=Math.floor(Math.random()*400)+200,o()},l=()=>{o()};return It(()=>{o()}),(c,u)=>(F(),B("div",{class:Ue(["keanu-page",{dark:ve(e).darkMode}])},[u[4]||(u[4]=f("div",{class:"keanu-header"},[f("h1",null,"🎬 PlaceKeanu"),f("p",{class:"subtitle"},"Random Keanu Reeves images!")],-1)),f("div",nN,[f("div",iN,[f("div",sN,[f("div",rN,[f("label",null,"Width: "+z(s.value)+"px",1),Et(f("input",{type:"range","onUpdate:modelValue":u[0]||(u[0]=d=>s.value=d),min:"200",max:"600",step:"10",onChange:o,disabled:i.value},null,40,oN),[[Ft,s.value]])]),f("div",aN,[f("label",null,"Height: "+z(r.value)+"px",1),Et(f("input",{type:"range","onUpdate:modelValue":u[1]||(u[1]=d=>r.value=d),min:"200",max:"600",step:"10",onChange:o,disabled:i.value},null,40,lN),[[Ft,r.value]])])]),f("div",cN,[f("button",{onClick:a,class:"btn btn-random",disabled:i.value}," 🎲 Random Size ",8,uN),f("button",{onClick:l,class:"btn btn-refresh",disabled:i.value}," 🔄 Refresh ",8,dN)])]),f("div",fN,[i.value?(F(),B("div",hN)):Te("",!0),t.value&&!i.value?(F(),B("img",{key:1,src:t.value,alt:"Keanu Reeves",class:Ue(["keanu-image",{loaded:t.value}])},null,10,pN)):Te("",!0),!t.value&&!i.value?(F(),B("div",mN,[...u[2]||(u[2]=[f("span",{class:"placeholder-text"},"Loading Keanu...",-1)])])):Te("",!0)]),f("div",gN,[u[3]||(u[3]=f("p",null,[Kt("Powered by "),f("a",{href:"https://placekeanu.com/",target:"_blank",rel:"noopener noreferrer"},"PlaceKeanu.com")],-1)),f("p",null,"API: "+z(t.value),1)])])],2))}}),_N=ut(vN,[["__scopeId","data-v-a922b5b9"]]),xN={class:"patch-notes-container"},yN={class:"patch-note-header"},SN={class:"version-badge"},MN={class:"patch-date"},bN={class:"patch-title"},EN={class:"changes-list"},wN={class:"change-icon"},TN={class:"change-label"},AN={class:"change-description"},CN=et({__name:"PatchNotesPage",setup(n){const e=Qt(),t=ne([{version:"1.0.0",date:"2026-02-05",title:"Initial Release",changes:[{type:"added",description:"Complete ticketing system with status tracking"},{type:"added",description:"User authentication and authorization"},{type:"added",description:"Coolness points and rankings system"},{type:"added",description:"Stock market simulation"},{type:"added",description:"Digital goose with random movements"},{type:"added",description:"Movie night page"},{type:"added",description:"Cat page with random cat images"},{type:"added",description:"Clocks page with world timezones"},{type:"added",description:"Countdowns page with game release timers"},{type:"added",description:"Word cloud visualization"},{type:"added",description:"PlaceKeanu image API integration"},{type:"added",description:"Quotes with advice endpoint"},{type:"added",description:"Shop system with items and inventory"},{type:"added",description:"Character tinder feature"},{type:"added",description:"Fishing mini-game"},{type:"added",description:"Idle clicker game"},{type:"added",description:"Moldbot opinions"},{type:"added",description:"Dark mode support throughout"},{type:"added",description:"Responsive design for mobile devices"},{type:"added",description:"OpenAPI documentation at /api-docs"},{type:"added",description:"Build time indicator"},{type:"added",description:"Keyboard shortcuts for ticket page"},{type:"added",description:"Loading states and error handling"},{type:"added",description:"Points decay mechanism for rankings"},{type:"added",description:"Goose emoji implementation"}]}]),i={added:{icon:"✨",label:"Added",color:"#48bb78"},improved:{icon:"🚀",label:"Improved",color:"#4299e1"},fixed:{icon:"🔧",label:"Fixed",color:"#ed8936"},removed:{icon:"🗑️",label:"Removed",color:"#f56565"}},s=r=>new Date(r).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"});return(r,o)=>(F(),B("div",{class:Ue(["patch-notes-page",{dark:ve(e).darkMode}])},[o[0]||(o[0]=f("div",{class:"patch-notes-header"},[f("h1",null,"📝 Patch Notes"),f("p",{class:"subtitle"},"Track all changes and updates")],-1)),f("div",xN,[(F(!0),B(Xe,null,st(t.value,(a,l)=>(F(),B("div",{key:l,class:"patch-note"},[f("div",yN,[f("div",SN,z(a.version),1),f("div",MN,z(s(a.date)),1)]),f("h2",bN,z(a.title),1),f("div",EN,[(F(!0),B(Xe,null,st(a.changes,(c,u)=>(F(),B("div",{key:u,class:Ue(["change-item",`change-${c.type}`])},[f("span",wN,z(i[c.type].icon),1),f("span",TN,z(i[c.type].label),1),f("span",AN,z(c.description),1)],2))),128))])]))),128))]),o[1]||(o[1]=f("div",{class:"footer-note"},[f("p",null,"💡 Check back regularly for updates!"),f("p",null,[Kt("🔗 View API documentation at "),f("a",{href:"/api-docs",target:"_blank"},"/api-docs")])],-1))],2))}}),RN=ut(CN,[["__scopeId","data-v-8093139e"]]),PN=[{path:"/",name:"home",component:wy},{path:"/fishing",name:"fishing",component:QD},{path:"/character-tinder",name:"character-tinder",component:WL},{path:"/girl",name:"girl",component:Ay},{path:"/gender",name:"gender",component:By},{path:"/about",name:"about",component:Wy},{path:"/rankings",name:"rankings",component:Qy},{path:"/cats",name:"cats",component:iS},{path:"/stocks",name:"stocks",component:XS},{path:"/movies",name:"movies",component:qb},{path:"/countdowns",name:"countdowns",component:mE},{path:"/tickets",name:"tickets",component:J1},{path:"/clocks",name:"clocks",component:qw},{path:"/music",name:"music",component:Kw},{path:"/opinion",name:"opinion",component:sT},{path:"/mold",name:"mold",component:xT},{path:"/clicker",name:"clicker",component:HT},{path:"/shop",name:"shop",component:mA},{path:"/api-docs",name:"api-docs",component:EA},{path:"/auth",name:"auth",component:TC},{path:"/wordcloud",name:"wordcloud",component:tN},{path:"/keanu",name:"keanu",component:_N},{path:"/patch-notes",name:"patch-notes",component:RN}],IN=Y0({history:C0(),routes:PN}),Xu=U_(hy),DN=k_();Xu.use(DN);Xu.use(IN);Xu.mount("#app");
