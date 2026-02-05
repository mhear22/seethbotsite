(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function lu(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const At={},Ks=[],oi=()=>{},_h=()=>!1,Ta=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),cu=n=>n.startsWith("onUpdate:"),$t=Object.assign,uu=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Zm=Object.prototype.hasOwnProperty,yt=(n,e)=>Zm.call(n,e),qe=Array.isArray,Zs=n=>so(n)==="[object Map]",pr=n=>so(n)==="[object Set]",id=n=>so(n)==="[object Date]",Qe=n=>typeof n=="function",Ht=n=>typeof n=="string",Wn=n=>typeof n=="symbol",wt=n=>n!==null&&typeof n=="object",xh=n=>(wt(n)||Qe(n))&&Qe(n.then)&&Qe(n.catch),yh=Object.prototype.toString,so=n=>yh.call(n),Jm=n=>so(n).slice(8,-1),Sh=n=>so(n)==="[object Object]",Aa=n=>Ht(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Fr=lu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ca=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Qm=/-\w/g,kn=Ca(n=>n.replace(Qm,e=>e.slice(1).toUpperCase())),eg=/\B([A-Z])/g,ns=Ca(n=>n.replace(eg,"-$1").toLowerCase()),Ra=Ca(n=>n.charAt(0).toUpperCase()+n.slice(1)),Za=Ca(n=>n?`on${Ra(n)}`:""),Qi=(n,e)=>!Object.is(n,e),Ko=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},bh=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},Pa=n=>{const e=parseFloat(n);return isNaN(e)?n:e},tg=n=>{const e=Ht(n)?Number(n):NaN;return isNaN(e)?n:e};let sd;const Ia=()=>sd||(sd=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Dt(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=Ht(i)?rg(i):Dt(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Ht(n)||wt(n))return n}const ng=/;(?![^(]*\))/g,ig=/:([^]+)/,sg=/\/\*[^]*?\*\//g;function rg(n){const e={};return n.replace(sg,"").split(ng).forEach(t=>{if(t){const i=t.split(ig);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Be(n){let e="";if(Ht(n))e=n;else if(qe(n))for(let t=0;t<n.length;t++){const i=Be(n[t]);i&&(e+=i+" ")}else if(wt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const og="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",ag=lu(og);function Mh(n){return!!n||n===""}function lg(n,e){if(n.length!==e.length)return!1;let t=!0;for(let i=0;t&&i<n.length;i++)t=Ts(n[i],e[i]);return t}function Ts(n,e){if(n===e)return!0;let t=id(n),i=id(e);if(t||i)return t&&i?n.getTime()===e.getTime():!1;if(t=Wn(n),i=Wn(e),t||i)return n===e;if(t=qe(n),i=qe(e),t||i)return t&&i?lg(n,e):!1;if(t=wt(n),i=wt(e),t||i){if(!t||!i)return!1;const s=Object.keys(n).length,r=Object.keys(e).length;if(s!==r)return!1;for(const o in n){const a=n.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!Ts(n[o],e[o]))return!1}}return String(n)===String(e)}function du(n,e){return n.findIndex(t=>Ts(t,e))}const Eh=n=>!!(n&&n.__v_isRef===!0),B=n=>Ht(n)?n:n==null?"":qe(n)||wt(n)&&(n.toString===yh||!Qe(n.toString))?Eh(n)?B(n.value):JSON.stringify(n,wh,2):String(n),wh=(n,e)=>Eh(e)?wh(n,e.value):Zs(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s],r)=>(t[Ja(i,r)+" =>"]=s,t),{})}:pr(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Ja(t))}:Wn(e)?Ja(e):wt(e)&&!qe(e)&&!Sh(e)?String(e):e,Ja=(n,e="")=>{var t;return Wn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let nn;class Th{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=nn,!e&&nn&&(this.index=(nn.scopes||(nn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=nn;try{return nn=this,e()}finally{nn=t}}}on(){++this._on===1&&(this.prevScope=nn,nn=this)}off(){this._on>0&&--this._on===0&&(nn=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function Ah(n){return new Th(n)}function Ch(){return nn}function cg(n,e=!1){nn&&nn.cleanups.push(n)}let It;const Qa=new WeakSet;class Rh{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,nn&&nn.active&&nn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Qa.has(this)&&(Qa.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Ih(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,rd(this),Dh(this);const e=It,t=$n;It=this,$n=!0;try{return this.fn()}finally{Lh(this),It=e,$n=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)pu(e);this.deps=this.depsTail=void 0,rd(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Qa.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){jl(this)&&this.run()}get dirty(){return jl(this)}}let Ph=0,kr,Or;function Ih(n,e=!1){if(n.flags|=8,e){n.next=Or,Or=n;return}n.next=kr,kr=n}function fu(){Ph++}function hu(){if(--Ph>0)return;if(Or){let e=Or;for(Or=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;kr;){let e=kr;for(kr=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function Dh(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Lh(n){let e,t=n.depsTail,i=t;for(;i;){const s=i.prevDep;i.version===-1?(i===t&&(t=s),pu(i),ug(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}n.deps=e,n.depsTail=t}function jl(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Nh(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Nh(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Wr)||(n.globalVersion=Wr,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!jl(n))))return;n.flags|=2;const e=n.dep,t=It,i=$n;It=n,$n=!0;try{Dh(n);const s=n.fn(n._value);(e.version===0||Qi(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{It=t,$n=i,Lh(n),n.flags&=-3}}function pu(n,e=!1){const{dep:t,prevSub:i,nextSub:s}=n;if(i&&(i.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let r=t.computed.deps;r;r=r.nextDep)pu(r,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function ug(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let $n=!0;const Uh=[];function Ii(){Uh.push($n),$n=!1}function Di(){const n=Uh.pop();$n=n===void 0?!0:n}function rd(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=It;It=void 0;try{e()}finally{It=t}}}let Wr=0;class dg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class mu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!It||!$n||It===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==It)t=this.activeLink=new dg(It,this),It.deps?(t.prevDep=It.depsTail,It.depsTail.nextDep=t,It.depsTail=t):It.deps=It.depsTail=t,Fh(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=It.depsTail,t.nextDep=void 0,It.depsTail.nextDep=t,It.depsTail=t,It.deps===t&&(It.deps=i)}return t}trigger(e){this.version++,Wr++,this.notify(e)}notify(e){fu();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{hu()}}}function Fh(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)Fh(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const ua=new WeakMap,Es=Symbol(""),Yl=Symbol(""),Xr=Symbol("");function sn(n,e,t){if($n&&It){let i=ua.get(n);i||ua.set(n,i=new Map);let s=i.get(t);s||(i.set(t,s=new mu),s.map=i,s.key=t),s.track()}}function Ei(n,e,t,i,s,r){const o=ua.get(n);if(!o){Wr++;return}const a=l=>{l&&l.trigger()};if(fu(),e==="clear")o.forEach(a);else{const l=qe(n),c=l&&Aa(t);if(l&&t==="length"){const u=Number(i);o.forEach((f,h)=>{(h==="length"||h===Xr||!Wn(h)&&h>=u)&&a(f)})}else switch((t!==void 0||o.has(void 0))&&a(o.get(t)),c&&a(o.get(Xr)),e){case"add":l?c&&a(o.get("length")):(a(o.get(Es)),Zs(n)&&a(o.get(Yl)));break;case"delete":l||(a(o.get(Es)),Zs(n)&&a(o.get(Yl)));break;case"set":Zs(n)&&a(o.get(Es));break}}hu()}function fg(n,e){const t=ua.get(n);return t&&t.get(e)}function Ps(n){const e=ft(n);return e===n?e:(sn(e,"iterate",Xr),Tn(n)?e:e.map(Xn))}function Da(n){return sn(n=ft(n),"iterate",Xr),n}function qi(n,e){return Li(n)?nr(Ci(n)?Xn(e):e):Xn(e)}const hg={__proto__:null,[Symbol.iterator](){return el(this,Symbol.iterator,n=>qi(this,n))},concat(...n){return Ps(this).concat(...n.map(e=>qe(e)?Ps(e):e))},entries(){return el(this,"entries",n=>(n[1]=qi(this,n[1]),n))},every(n,e){return gi(this,"every",n,e,void 0,arguments)},filter(n,e){return gi(this,"filter",n,e,t=>t.map(i=>qi(this,i)),arguments)},find(n,e){return gi(this,"find",n,e,t=>qi(this,t),arguments)},findIndex(n,e){return gi(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return gi(this,"findLast",n,e,t=>qi(this,t),arguments)},findLastIndex(n,e){return gi(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return gi(this,"forEach",n,e,void 0,arguments)},includes(...n){return tl(this,"includes",n)},indexOf(...n){return tl(this,"indexOf",n)},join(n){return Ps(this).join(n)},lastIndexOf(...n){return tl(this,"lastIndexOf",n)},map(n,e){return gi(this,"map",n,e,void 0,arguments)},pop(){return xr(this,"pop")},push(...n){return xr(this,"push",n)},reduce(n,...e){return od(this,"reduce",n,e)},reduceRight(n,...e){return od(this,"reduceRight",n,e)},shift(){return xr(this,"shift")},some(n,e){return gi(this,"some",n,e,void 0,arguments)},splice(...n){return xr(this,"splice",n)},toReversed(){return Ps(this).toReversed()},toSorted(n){return Ps(this).toSorted(n)},toSpliced(...n){return Ps(this).toSpliced(...n)},unshift(...n){return xr(this,"unshift",n)},values(){return el(this,"values",n=>qi(this,n))}};function el(n,e,t){const i=Da(n),s=i[e]();return i!==n&&!Tn(n)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=t(r.value)),r}),s}const pg=Array.prototype;function gi(n,e,t,i,s,r){const o=Da(n),a=o!==n&&!Tn(n),l=o[e];if(l!==pg[e]){const f=l.apply(n,r);return a?Xn(f):f}let c=t;o!==n&&(a?c=function(f,h){return t.call(this,qi(n,f),h,n)}:t.length>2&&(c=function(f,h){return t.call(this,f,h,n)}));const u=l.call(o,c,i);return a&&s?s(u):u}function od(n,e,t,i){const s=Da(n);let r=t;return s!==n&&(Tn(n)?t.length>3&&(r=function(o,a,l){return t.call(this,o,a,l,n)}):r=function(o,a,l){return t.call(this,o,qi(n,a),l,n)}),s[e](r,...i)}function tl(n,e,t){const i=ft(n);sn(i,"iterate",Xr);const s=i[e](...t);return(s===-1||s===!1)&&La(t[0])?(t[0]=ft(t[0]),i[e](...t)):s}function xr(n,e,t=[]){Ii(),fu();const i=ft(n)[e].apply(n,t);return hu(),Di(),i}const mg=lu("__proto__,__v_isRef,__isVue"),kh=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Wn));function gg(n){Wn(n)||(n=String(n));const e=ft(this);return sn(e,"has",n),e.hasOwnProperty(n)}class Oh{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return r;if(t==="__v_raw")return i===(s?r?Tg:Hh:r?zh:Vh).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const o=qe(e);if(!s){let l;if(o&&(l=hg[t]))return l;if(t==="hasOwnProperty")return gg}const a=Reflect.get(e,t,zt(e)?e:i);if((Wn(t)?kh.has(t):mg(t))||(s||sn(e,"get",t),r))return a;if(zt(a)){const l=o&&Aa(t)?a:a.value;return s&&wt(l)?Zl(l):l}return wt(a)?s?Zl(a):ro(a):a}}class Bh extends Oh{constructor(e=!1){super(!1,e)}set(e,t,i,s){let r=e[t];const o=qe(e)&&Aa(t);if(!this._isShallow){const c=Li(r);if(!Tn(i)&&!Li(i)&&(r=ft(r),i=ft(i)),!o&&zt(r)&&!zt(i))return c||(r.value=i),!0}const a=o?Number(t)<e.length:yt(e,t),l=Reflect.set(e,t,i,zt(e)?e:s);return e===ft(s)&&(a?Qi(i,r)&&Ei(e,"set",t,i):Ei(e,"add",t,i)),l}deleteProperty(e,t){const i=yt(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&i&&Ei(e,"delete",t,void 0),s}has(e,t){const i=Reflect.has(e,t);return(!Wn(t)||!kh.has(t))&&sn(e,"has",t),i}ownKeys(e){return sn(e,"iterate",qe(e)?"length":Es),Reflect.ownKeys(e)}}class vg extends Oh{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const _g=new Bh,xg=new vg,yg=new Bh(!0);const Kl=n=>n,_o=n=>Reflect.getPrototypeOf(n);function Sg(n,e,t){return function(...i){const s=this.__v_raw,r=ft(s),o=Zs(r),a=n==="entries"||n===Symbol.iterator&&o,l=n==="keys"&&o,c=s[n](...i),u=t?Kl:e?nr:Xn;return!e&&sn(r,"iterate",l?Yl:Es),$t(Object.create(c),{next(){const{value:f,done:h}=c.next();return h?{value:f,done:h}:{value:a?[u(f[0]),u(f[1])]:u(f),done:h}}})}}function xo(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function bg(n,e){const t={get(s){const r=this.__v_raw,o=ft(r),a=ft(s);n||(Qi(s,a)&&sn(o,"get",s),sn(o,"get",a));const{has:l}=_o(o),c=e?Kl:n?nr:Xn;if(l.call(o,s))return c(r.get(s));if(l.call(o,a))return c(r.get(a));r!==o&&r.get(s)},get size(){const s=this.__v_raw;return!n&&sn(ft(s),"iterate",Es),s.size},has(s){const r=this.__v_raw,o=ft(r),a=ft(s);return n||(Qi(s,a)&&sn(o,"has",s),sn(o,"has",a)),s===a?r.has(s):r.has(s)||r.has(a)},forEach(s,r){const o=this,a=o.__v_raw,l=ft(a),c=e?Kl:n?nr:Xn;return!n&&sn(l,"iterate",Es),a.forEach((u,f)=>s.call(r,c(u),c(f),o))}};return $t(t,n?{add:xo("add"),set:xo("set"),delete:xo("delete"),clear:xo("clear")}:{add(s){!e&&!Tn(s)&&!Li(s)&&(s=ft(s));const r=ft(this);return _o(r).has.call(r,s)||(r.add(s),Ei(r,"add",s,s)),this},set(s,r){!e&&!Tn(r)&&!Li(r)&&(r=ft(r));const o=ft(this),{has:a,get:l}=_o(o);let c=a.call(o,s);c||(s=ft(s),c=a.call(o,s));const u=l.call(o,s);return o.set(s,r),c?Qi(r,u)&&Ei(o,"set",s,r):Ei(o,"add",s,r),this},delete(s){const r=ft(this),{has:o,get:a}=_o(r);let l=o.call(r,s);l||(s=ft(s),l=o.call(r,s)),a&&a.call(r,s);const c=r.delete(s);return l&&Ei(r,"delete",s,void 0),c},clear(){const s=ft(this),r=s.size!==0,o=s.clear();return r&&Ei(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=Sg(s,n,e)}),t}function gu(n,e){const t=bg(n,e);return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(yt(t,s)&&s in i?t:i,s,r)}const Mg={get:gu(!1,!1)},Eg={get:gu(!1,!0)},wg={get:gu(!0,!1)};const Vh=new WeakMap,zh=new WeakMap,Hh=new WeakMap,Tg=new WeakMap;function Ag(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Cg(n){return n.__v_skip||!Object.isExtensible(n)?0:Ag(Jm(n))}function ro(n){return Li(n)?n:vu(n,!1,_g,Mg,Vh)}function Gh(n){return vu(n,!1,yg,Eg,zh)}function Zl(n){return vu(n,!0,xg,wg,Hh)}function vu(n,e,t,i,s){if(!wt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const r=Cg(n);if(r===0)return n;const o=s.get(n);if(o)return o;const a=new Proxy(n,r===2?i:t);return s.set(n,a),a}function Ci(n){return Li(n)?Ci(n.__v_raw):!!(n&&n.__v_isReactive)}function Li(n){return!!(n&&n.__v_isReadonly)}function Tn(n){return!!(n&&n.__v_isShallow)}function La(n){return n?!!n.__v_raw:!1}function ft(n){const e=n&&n.__v_raw;return e?ft(e):n}function _u(n){return!yt(n,"__v_skip")&&Object.isExtensible(n)&&bh(n,"__v_skip",!0),n}const Xn=n=>wt(n)?ro(n):n,nr=n=>wt(n)?Zl(n):n;function zt(n){return n?n.__v_isRef===!0:!1}function Q(n){return $h(n,!1)}function Rg(n){return $h(n,!0)}function $h(n,e){return zt(n)?n:new Pg(n,e)}class Pg{constructor(e,t){this.dep=new mu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:ft(e),this._value=t?e:Xn(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||Tn(e)||Li(e);e=i?e:ft(e),Qi(e,t)&&(this._rawValue=e,this._value=i?e:Xn(e),this.dep.trigger())}}function _e(n){return zt(n)?n.value:n}const Ig={get:(n,e,t)=>e==="__v_raw"?n:_e(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return zt(s)&&!zt(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function Wh(n){return Ci(n)?n:new Proxy(n,Ig)}function Dg(n){const e=qe(n)?new Array(n.length):{};for(const t in n)e[t]=Ng(n,t);return e}class Lg{constructor(e,t,i){this._object=e,this._key=t,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._raw=ft(e);let s=!0,r=e;if(!qe(e)||!Aa(String(t)))do s=!La(r)||Tn(r);while(s&&(r=r.__v_raw));this._shallow=s}get value(){let e=this._object[this._key];return this._shallow&&(e=_e(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&zt(this._raw[this._key])){const t=this._object[this._key];if(zt(t)){t.value=e;return}}this._object[this._key]=e}get dep(){return fg(this._raw,this._key)}}function Ng(n,e,t){return new Lg(n,e,t)}class Ug{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new mu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Wr-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&It!==this)return Ih(this,!0),!0}get value(){const e=this.dep.track();return Nh(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Fg(n,e,t=!1){let i,s;return Qe(n)?i=n:(i=n.get,s=n.set),new Ug(i,s,t)}const yo={},da=new WeakMap;let ms;function kg(n,e=!1,t=ms){if(t){let i=da.get(t);i||da.set(t,i=[]),i.push(n)}}function Og(n,e,t=At){const{immediate:i,deep:s,once:r,scheduler:o,augmentJob:a,call:l}=t,c=M=>s?M:Tn(M)||s===!1||s===0?wi(M,1):wi(M);let u,f,h,g,_=!1,v=!1;if(zt(n)?(f=()=>n.value,_=Tn(n)):Ci(n)?(f=()=>c(n),_=!0):qe(n)?(v=!0,_=n.some(M=>Ci(M)||Tn(M)),f=()=>n.map(M=>{if(zt(M))return M.value;if(Ci(M))return c(M);if(Qe(M))return l?l(M,2):M()})):Qe(n)?e?f=l?()=>l(n,2):n:f=()=>{if(h){Ii();try{h()}finally{Di()}}const M=ms;ms=u;try{return l?l(n,3,[g]):n(g)}finally{ms=M}}:f=oi,e&&s){const M=f,w=s===!0?1/0:s;f=()=>wi(M(),w)}const m=Ch(),p=()=>{u.stop(),m&&m.active&&uu(m.effects,u)};if(r&&e){const M=e;e=(...w)=>{M(...w),p()}}let b=v?new Array(n.length).fill(yo):yo;const y=M=>{if(!(!(u.flags&1)||!u.dirty&&!M))if(e){const w=u.run();if(s||_||(v?w.some((A,T)=>Qi(A,b[T])):Qi(w,b))){h&&h();const A=ms;ms=u;try{const T=[w,b===yo?void 0:v&&b[0]===yo?[]:b,g];b=w,l?l(e,3,T):e(...T)}finally{ms=A}}}else u.run()};return a&&a(y),u=new Rh(f),u.scheduler=o?()=>o(y,!1):y,g=M=>kg(M,!1,u),h=u.onStop=()=>{const M=da.get(u);if(M){if(l)l(M,4);else for(const w of M)w();da.delete(u)}},e?i?y(!0):b=u.run():o?o(y.bind(null,!0),!0):u.run(),p.pause=u.pause.bind(u),p.resume=u.resume.bind(u),p.stop=p,p}function wi(n,e=1/0,t){if(e<=0||!wt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,zt(n))wi(n.value,e,t);else if(qe(n))for(let i=0;i<n.length;i++)wi(n[i],e,t);else if(pr(n)||Zs(n))n.forEach(i=>{wi(i,e,t)});else if(Sh(n)){for(const i in n)wi(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&wi(n[i],e,t)}return n}/**
* @vue/runtime-core v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function oo(n,e,t,i){try{return i?n(...i):n()}catch(s){Na(s,e,t)}}function qn(n,e,t,i){if(Qe(n)){const s=oo(n,e,t,i);return s&&xh(s)&&s.catch(r=>{Na(r,e,t)}),s}if(qe(n)){const s=[];for(let r=0;r<n.length;r++)s.push(qn(n[r],e,t,i));return s}}function Na(n,e,t,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||At;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${t}`;for(;a;){const u=a.ec;if(u){for(let f=0;f<u.length;f++)if(u[f](n,l,c)===!1)return}a=a.parent}if(r){Ii(),oo(r,null,10,[n,l,c]),Di();return}}Bg(n,t,s,i,o)}function Bg(n,e,t,i=!0,s=!1){if(s)throw n;console.error(n)}const hn=[];let ei=-1;const Js=[];let ji=null,qs=0;const Xh=Promise.resolve();let fa=null;function ao(n){const e=fa||Xh;return n?e.then(this?n.bind(this):n):e}function Vg(n){let e=ei+1,t=hn.length;for(;e<t;){const i=e+t>>>1,s=hn[i],r=qr(s);r<n||r===n&&s.flags&2?e=i+1:t=i}return e}function xu(n){if(!(n.flags&1)){const e=qr(n),t=hn[hn.length-1];!t||!(n.flags&2)&&e>=qr(t)?hn.push(n):hn.splice(Vg(e),0,n),n.flags|=1,qh()}}function qh(){fa||(fa=Xh.then(Yh))}function zg(n){qe(n)?Js.push(...n):ji&&n.id===-1?ji.splice(qs+1,0,n):n.flags&1||(Js.push(n),n.flags|=1),qh()}function ad(n,e,t=ei+1){for(;t<hn.length;t++){const i=hn[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;hn.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function jh(n){if(Js.length){const e=[...new Set(Js)].sort((t,i)=>qr(t)-qr(i));if(Js.length=0,ji){ji.push(...e);return}for(ji=e,qs=0;qs<ji.length;qs++){const t=ji[qs];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}ji=null,qs=0}}const qr=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Yh(n){try{for(ei=0;ei<hn.length;ei++){const e=hn[ei];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),oo(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;ei<hn.length;ei++){const e=hn[ei];e&&(e.flags&=-2)}ei=-1,hn.length=0,jh(),fa=null,(hn.length||Js.length)&&Yh()}}let Kt=null,Kh=null;function ha(n){const e=Kt;return Kt=n,Kh=n&&n.type.__scopeId||null,e}function Nn(n,e=Kt,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&ga(-1);const r=ha(e);let o;try{o=n(...s)}finally{ha(r),i._d&&ga(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function _t(n,e){if(Kt===null)return n;const t=Oa(Kt),i=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[r,o,a,l=At]=e[s];r&&(Qe(r)&&(r={mounted:r,updated:r}),r.deep&&wi(o),i.push({dir:r,instance:t,value:o,oldValue:void 0,arg:a,modifiers:l}))}return n}function rs(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(Ii(),qn(l,t,8,[n.el,a,n,e]),Di())}}function Zo(n,e){if(rn){let t=rn.provides;const i=rn.parent&&rn.parent.provides;i===t&&(t=rn.provides=Object.create(i)),t[n]=e}}function An(n,e,t=!1){const i=Eu();if(i||ws){let s=ws?ws._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&Qe(e)?e.call(i&&i.proxy):e}}function Hg(){return!!(Eu()||ws)}const Gg=Symbol.for("v-scx"),$g=()=>An(Gg);function Un(n,e,t){return Zh(n,e,t)}function Zh(n,e,t=At){const{immediate:i,deep:s,flush:r,once:o}=t,a=$t({},t),l=e&&i||!e&&r!=="post";let c;if(Zr){if(r==="sync"){const g=$g();c=g.__watcherHandles||(g.__watcherHandles=[])}else if(!l){const g=()=>{};return g.stop=oi,g.resume=oi,g.pause=oi,g}}const u=rn;a.call=(g,_,v)=>qn(g,u,_,v);let f=!1;r==="post"?a.scheduler=g=>{dn(g,u&&u.suspense)}:r!=="sync"&&(f=!0,a.scheduler=(g,_)=>{_?g():xu(g)}),a.augmentJob=g=>{e&&(g.flags|=4),f&&(g.flags|=2,u&&(g.id=u.uid,g.i=u))};const h=Og(n,e,a);return Zr&&(c?c.push(h):l&&h()),h}function Wg(n,e,t){const i=this.proxy,s=Ht(n)?n.includes(".")?Jh(i,n):()=>i[n]:n.bind(i,i);let r;Qe(e)?r=e:(r=e.handler,t=e);const o=lo(this),a=Zh(s,r.bind(i),t);return o(),a}function Jh(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}const Qh=Symbol("_vte"),Xg=n=>n.__isTeleport,Br=n=>n&&(n.disabled||n.disabled===""),ld=n=>n&&(n.defer||n.defer===""),cd=n=>typeof SVGElement<"u"&&n instanceof SVGElement,ud=n=>typeof MathMLElement=="function"&&n instanceof MathMLElement,Jl=(n,e)=>{const t=n&&n.to;return Ht(t)?e?e(t):null:t},ep={name:"Teleport",__isTeleport:!0,process(n,e,t,i,s,r,o,a,l,c){const{mc:u,pc:f,pbc:h,o:{insert:g,querySelector:_,createText:v,createComment:m}}=c,p=Br(e.props);let{shapeFlag:b,children:y,dynamicChildren:M}=e;if(n==null){const w=e.el=v(""),A=e.anchor=v("");g(w,t,i),g(A,t,i);const T=(x,E)=>{b&16&&u(y,x,E,s,r,o,a,l)},R=()=>{const x=e.target=Jl(e.props,_),E=tp(x,e,v,g);x&&(o!=="svg"&&cd(x)?o="svg":o!=="mathml"&&ud(x)&&(o="mathml"),s&&s.isCE&&(s.ce._teleportTargets||(s.ce._teleportTargets=new Set)).add(x),p||(T(x,E),Jo(e,!1)))};p&&(T(t,A),Jo(e,!0)),ld(e.props)?(e.el.__isMounted=!1,dn(()=>{R(),delete e.el.__isMounted},r)):R()}else{if(ld(e.props)&&n.el.__isMounted===!1){dn(()=>{ep.process(n,e,t,i,s,r,o,a,l,c)},r);return}e.el=n.el,e.targetStart=n.targetStart;const w=e.anchor=n.anchor,A=e.target=n.target,T=e.targetAnchor=n.targetAnchor,R=Br(n.props),x=R?t:A,E=R?w:T;if(o==="svg"||cd(A)?o="svg":(o==="mathml"||ud(A))&&(o="mathml"),M?(h(n.dynamicChildren,M,x,s,r,o,a),bu(n,e,!0)):l||f(n,e,x,E,s,r,o,a,!1),p)R?e.props&&n.props&&e.props.to!==n.props.to&&(e.props.to=n.props.to):So(e,t,w,c,1);else if((e.props&&e.props.to)!==(n.props&&n.props.to)){const U=e.target=Jl(e.props,_);U&&So(e,U,null,c,0)}else R&&So(e,A,T,c,1);Jo(e,p)}},remove(n,e,t,{um:i,o:{remove:s}},r){const{shapeFlag:o,children:a,anchor:l,targetStart:c,targetAnchor:u,target:f,props:h}=n;if(f&&(s(c),s(u)),r&&s(l),o&16){const g=r||!Br(h);for(let _=0;_<a.length;_++){const v=a[_];i(v,e,t,g,!!v.dynamicChildren)}}},move:So,hydrate:qg};function So(n,e,t,{o:{insert:i},m:s},r=2){r===0&&i(n.targetAnchor,e,t);const{el:o,anchor:a,shapeFlag:l,children:c,props:u}=n,f=r===2;if(f&&i(o,e,t),(!f||Br(u))&&l&16)for(let h=0;h<c.length;h++)s(c[h],e,t,2);f&&i(a,e,t)}function qg(n,e,t,i,s,r,{o:{nextSibling:o,parentNode:a,querySelector:l,insert:c,createText:u}},f){function h(v,m,p,b){m.anchor=f(o(v),m,a(v),t,i,s,r),m.targetStart=p,m.targetAnchor=b}const g=e.target=Jl(e.props,l),_=Br(e.props);if(g){const v=g._lpa||g.firstChild;if(e.shapeFlag&16)if(_)h(n,e,v,v&&o(v));else{e.anchor=o(n);let m=v;for(;m;){if(m&&m.nodeType===8){if(m.data==="teleport start anchor")e.targetStart=m;else if(m.data==="teleport anchor"){e.targetAnchor=m,g._lpa=e.targetAnchor&&o(e.targetAnchor);break}}m=o(m)}e.targetAnchor||tp(g,e,u,c),f(v&&o(v),e,g,t,i,s,r)}Jo(e,_)}else _&&e.shapeFlag&16&&h(n,e,n,o(n));return e.anchor&&o(e.anchor)}const jg=ep;function Jo(n,e){const t=n.ctx;if(t&&t.ut){let i,s;for(e?(i=n.el,s=n.anchor):(i=n.targetStart,s=n.targetAnchor);i&&i!==s;)i.nodeType===1&&i.setAttribute("data-v-owner",t.uid),i=i.nextSibling;t.ut()}}function tp(n,e,t,i){const s=e.targetStart=t(""),r=e.targetAnchor=t("");return s[Qh]=r,n&&(i(s,n),i(r,n)),r}const gs=Symbol("_leaveCb"),bo=Symbol("_enterCb");function Yg(){const n={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return Ct(()=>{n.isMounted=!0}),ap(()=>{n.isUnmounting=!0}),n}const Pn=[Function,Array],Kg={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:Pn,onEnter:Pn,onAfterEnter:Pn,onEnterCancelled:Pn,onBeforeLeave:Pn,onLeave:Pn,onAfterLeave:Pn,onLeaveCancelled:Pn,onBeforeAppear:Pn,onAppear:Pn,onAfterAppear:Pn,onAppearCancelled:Pn};function Zg(n,e){const{leavingVNodes:t}=n;let i=t.get(e.type);return i||(i=Object.create(null),t.set(e.type,i)),i}function Ql(n,e,t,i,s){const{appear:r,mode:o,persisted:a=!1,onBeforeEnter:l,onEnter:c,onAfterEnter:u,onEnterCancelled:f,onBeforeLeave:h,onLeave:g,onAfterLeave:_,onLeaveCancelled:v,onBeforeAppear:m,onAppear:p,onAfterAppear:b,onAppearCancelled:y}=e,M=String(n.key),w=Zg(t,n),A=(x,E)=>{x&&qn(x,i,9,E)},T=(x,E)=>{const U=E[1];A(x,E),qe(x)?x.every(O=>O.length<=1)&&U():x.length<=1&&U()},R={mode:o,persisted:a,beforeEnter(x){let E=l;if(!t.isMounted)if(r)E=m||l;else return;x[gs]&&x[gs](!0);const U=w[M];U&&js(n,U)&&U.el[gs]&&U.el[gs](),A(E,[x])},enter(x){let E=c,U=u,O=f;if(!t.isMounted)if(r)E=p||c,U=b||u,O=y||f;else return;let j=!1;const ee=x[bo]=te=>{j||(j=!0,te?A(O,[x]):A(U,[x]),R.delayedLeave&&R.delayedLeave(),x[bo]=void 0)};E?T(E,[x,ee]):ee()},leave(x,E){const U=String(n.key);if(x[bo]&&x[bo](!0),t.isUnmounting)return E();A(h,[x]);let O=!1;const j=x[gs]=ee=>{O||(O=!0,E(),ee?A(v,[x]):A(_,[x]),x[gs]=void 0,w[U]===n&&delete w[U])};w[U]=n,g?T(g,[x,j]):j()},clone(x){return Ql(x,e,t,i)}};return R}function jr(n,e){n.shapeFlag&6&&n.component?(n.transition=e,jr(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function np(n,e=!1,t){let i=[],s=0;for(let r=0;r<n.length;r++){let o=n[r];const a=t==null?o.key:String(t)+String(o.key!=null?o.key:r);o.type===$e?(o.patchFlag&128&&s++,i=i.concat(np(o.children,e,a))):(e||o.type!==ui)&&i.push(a!=null?As(o,{key:a}):o)}if(s>1)for(let r=0;r<i.length;r++)i[r].patchFlag=-2;return i}function tt(n,e){return Qe(n)?$t({name:n.name},e,{setup:n}):n}function ip(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}const pa=new WeakMap;function Vr(n,e,t,i,s=!1){if(qe(n)){n.forEach((_,v)=>Vr(_,e&&(qe(e)?e[v]:e),t,i,s));return}if(Qs(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&Vr(n,e,t,i.component.subTree);return}const r=i.shapeFlag&4?Oa(i.component):i.el,o=s?null:r,{i:a,r:l}=n,c=e&&e.r,u=a.refs===At?a.refs={}:a.refs,f=a.setupState,h=ft(f),g=f===At?_h:_=>yt(h,_);if(c!=null&&c!==l){if(dd(e),Ht(c))u[c]=null,g(c)&&(f[c]=null);else if(zt(c)){c.value=null;const _=e;_.k&&(u[_.k]=null)}}if(Qe(l))oo(l,a,12,[o,u]);else{const _=Ht(l),v=zt(l);if(_||v){const m=()=>{if(n.f){const p=_?g(l)?f[l]:u[l]:l.value;if(s)qe(p)&&uu(p,r);else if(qe(p))p.includes(r)||p.push(r);else if(_)u[l]=[r],g(l)&&(f[l]=u[l]);else{const b=[r];l.value=b,n.k&&(u[n.k]=b)}}else _?(u[l]=o,g(l)&&(f[l]=o)):v&&(l.value=o,n.k&&(u[n.k]=o))};if(o){const p=()=>{m(),pa.delete(n)};p.id=-1,pa.set(n,p),dn(p,t)}else dd(n),m()}}}function dd(n){const e=pa.get(n);e&&(e.flags|=8,pa.delete(n))}Ia().requestIdleCallback;Ia().cancelIdleCallback;const Qs=n=>!!n.type.__asyncLoader,sp=n=>n.type.__isKeepAlive;function Jg(n,e){rp(n,"a",e)}function Qg(n,e){rp(n,"da",e)}function rp(n,e,t=rn){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(Ua(e,i,t),t){let s=t.parent;for(;s&&s.parent;)sp(s.parent.vnode)&&ev(i,e,t,s),s=s.parent}}function ev(n,e,t,i){const s=Ua(e,n,i,!0);Yn(()=>{uu(i[e],s)},t)}function Ua(n,e,t=rn,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...o)=>{Ii();const a=lo(t),l=qn(e,t,n,o);return a(),Di(),l});return i?s.unshift(r):s.push(r),r}}const Fi=n=>(e,t=rn)=>{(!Zr||n==="sp")&&Ua(n,(...i)=>e(...i),t)},tv=Fi("bm"),Ct=Fi("m"),nv=Fi("bu"),op=Fi("u"),ap=Fi("bum"),Yn=Fi("um"),iv=Fi("sp"),sv=Fi("rtg"),rv=Fi("rtc");function ov(n,e=rn){Ua("ec",n,e)}const av="components";function lv(n,e){return uv(av,n,!0,e)||n}const cv=Symbol.for("v-ndc");function uv(n,e,t=!0,i=!1){const s=Kt||rn;if(s){const r=s.type;{const a=jv(r,!1);if(a&&(a===e||a===kn(e)||a===Ra(kn(e))))return r}const o=fd(s[n]||r[n],e)||fd(s.appContext[n],e);return!o&&i?r:o}}function fd(n,e){return n&&(n[e]||n[kn(e)]||n[Ra(kn(e))])}function et(n,e,t,i){let s;const r=t,o=qe(n);if(o||Ht(n)){const a=o&&Ci(n);let l=!1,c=!1;a&&(l=!Tn(n),c=Li(n),n=Da(n)),s=new Array(n.length);for(let u=0,f=n.length;u<f;u++)s[u]=e(l?c?nr(Xn(n[u])):Xn(n[u]):n[u],u,void 0,r)}else if(typeof n=="number"){s=new Array(n);for(let a=0;a<n;a++)s[a]=e(a+1,a,void 0,r)}else if(wt(n))if(n[Symbol.iterator])s=Array.from(n,(a,l)=>e(a,l,void 0,r));else{const a=Object.keys(n);s=new Array(a.length);for(let l=0,c=a.length;l<c;l++){const u=a[l];s[l]=e(n[u],u,l,r)}}else s=[];return s}function lp(n,e,t={},i,s){if(Kt.ce||Kt.parent&&Qs(Kt.parent)&&Kt.parent.ce){const c=Object.keys(t).length>0;return e!=="default"&&(t.name=e),N(),Yt($e,null,[pt("slot",t,i&&i())],c?-2:64)}let r=n[e];r&&r._c&&(r._d=!1),N();const o=r&&cp(r(t)),a=t.key||o&&o.key,l=Yt($e,{key:(a&&!Wn(a)?a:`_${e}`)+(!o&&i?"_fb":"")},o||(i?i():[]),o&&n._===1?64:-2);return r&&r._c&&(r._d=!0),l}function cp(n){return n.some(e=>Kr(e)?!(e.type===ui||e.type===$e&&!cp(e.children)):!0)?n:null}const ec=n=>n?Ap(n)?Oa(n):ec(n.parent):null,zr=$t(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>ec(n.parent),$root:n=>ec(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>dp(n),$forceUpdate:n=>n.f||(n.f=()=>{xu(n.update)}),$nextTick:n=>n.n||(n.n=ao.bind(n.proxy)),$watch:n=>Wg.bind(n)}),nl=(n,e)=>n!==At&&!n.__isScriptSetup&&yt(n,e),dv={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=n;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(nl(i,e))return o[e]=1,i[e];if(s!==At&&yt(s,e))return o[e]=2,s[e];if(yt(r,e))return o[e]=3,r[e];if(t!==At&&yt(t,e))return o[e]=4,t[e];tc&&(o[e]=0)}}const c=zr[e];let u,f;if(c)return e==="$attrs"&&sn(n.attrs,"get",""),c(n);if((u=a.__cssModules)&&(u=u[e]))return u;if(t!==At&&yt(t,e))return o[e]=4,t[e];if(f=l.config.globalProperties,yt(f,e))return f[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return nl(s,e)?(s[e]=t,!0):i!==At&&yt(i,e)?(i[e]=t,!0):yt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,props:r,type:o}},a){let l;return!!(t[a]||n!==At&&a[0]!=="$"&&yt(n,a)||nl(e,a)||yt(r,a)||yt(i,a)||yt(zr,a)||yt(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:yt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function hd(n){return qe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let tc=!0;function fv(n){const e=dp(n),t=n.proxy,i=n.ctx;tc=!1,e.beforeCreate&&pd(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:f,mounted:h,beforeUpdate:g,updated:_,activated:v,deactivated:m,beforeDestroy:p,beforeUnmount:b,destroyed:y,unmounted:M,render:w,renderTracked:A,renderTriggered:T,errorCaptured:R,serverPrefetch:x,expose:E,inheritAttrs:U,components:O,directives:j,filters:ee}=e;if(c&&hv(c,i,null),o)for(const I in o){const F=o[I];Qe(F)&&(i[I]=F.bind(t))}if(s){const I=s.call(t,t);wt(I)&&(n.data=ro(I))}if(tc=!0,r)for(const I in r){const F=r[I],$=Qe(F)?F.bind(t,t):Qe(F.get)?F.get.bind(t,t):oi,J=!Qe(F)&&Qe(F.set)?F.set.bind(t):oi,oe=ot({get:$,set:J});Object.defineProperty(i,I,{enumerable:!0,configurable:!0,get:()=>oe.value,set:we=>oe.value=we})}if(a)for(const I in a)up(a[I],i,t,I);if(l){const I=Qe(l)?l.call(t):l;Reflect.ownKeys(I).forEach(F=>{Zo(F,I[F])})}u&&pd(u,n,"c");function K(I,F){qe(F)?F.forEach($=>I($.bind(t))):F&&I(F.bind(t))}if(K(tv,f),K(Ct,h),K(nv,g),K(op,_),K(Jg,v),K(Qg,m),K(ov,R),K(rv,A),K(sv,T),K(ap,b),K(Yn,M),K(iv,x),qe(E))if(E.length){const I=n.exposed||(n.exposed={});E.forEach(F=>{Object.defineProperty(I,F,{get:()=>t[F],set:$=>t[F]=$,enumerable:!0})})}else n.exposed||(n.exposed={});w&&n.render===oi&&(n.render=w),U!=null&&(n.inheritAttrs=U),O&&(n.components=O),j&&(n.directives=j),x&&ip(n)}function hv(n,e,t=oi){qe(n)&&(n=nc(n));for(const i in n){const s=n[i];let r;wt(s)?"default"in s?r=An(s.from||i,s.default,!0):r=An(s.from||i):r=An(s),zt(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):e[i]=r}}function pd(n,e,t){qn(qe(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function up(n,e,t,i){let s=i.includes(".")?Jh(t,i):()=>t[i];if(Ht(n)){const r=e[n];Qe(r)&&Un(s,r)}else if(Qe(n))Un(s,n.bind(t));else if(wt(n))if(qe(n))n.forEach(r=>up(r,e,t,i));else{const r=Qe(n.handler)?n.handler.bind(t):e[n.handler];Qe(r)&&Un(s,r,n)}}function dp(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=n.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(c=>ma(l,c,o,!0)),ma(l,e,o)),wt(e)&&r.set(e,l),l}function ma(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&ma(n,r,t,!0),s&&s.forEach(o=>ma(n,o,t,!0));for(const o in e)if(!(i&&o==="expose")){const a=pv[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const pv={data:md,props:gd,emits:gd,methods:Dr,computed:Dr,beforeCreate:cn,created:cn,beforeMount:cn,mounted:cn,beforeUpdate:cn,updated:cn,beforeDestroy:cn,beforeUnmount:cn,destroyed:cn,unmounted:cn,activated:cn,deactivated:cn,errorCaptured:cn,serverPrefetch:cn,components:Dr,directives:Dr,watch:gv,provide:md,inject:mv};function md(n,e){return e?n?function(){return $t(Qe(n)?n.call(this,this):n,Qe(e)?e.call(this,this):e)}:e:n}function mv(n,e){return Dr(nc(n),nc(e))}function nc(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function cn(n,e){return n?[...new Set([].concat(n,e))]:e}function Dr(n,e){return n?$t(Object.create(null),n,e):e}function gd(n,e){return n?qe(n)&&qe(e)?[...new Set([...n,...e])]:$t(Object.create(null),hd(n),hd(e??{})):e}function gv(n,e){if(!n)return e;if(!e)return n;const t=$t(Object.create(null),n);for(const i in e)t[i]=cn(n[i],e[i]);return t}function fp(){return{app:null,config:{isNativeTag:_h,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let vv=0;function _v(n,e){return function(i,s=null){Qe(i)||(i=$t({},i)),s!=null&&!wt(s)&&(s=null);const r=fp(),o=new WeakSet,a=[];let l=!1;const c=r.app={_uid:vv++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:Kv,get config(){return r.config},set config(u){},use(u,...f){return o.has(u)||(u&&Qe(u.install)?(o.add(u),u.install(c,...f)):Qe(u)&&(o.add(u),u(c,...f))),c},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),c},component(u,f){return f?(r.components[u]=f,c):r.components[u]},directive(u,f){return f?(r.directives[u]=f,c):r.directives[u]},mount(u,f,h){if(!l){const g=c._ceVNode||pt(i,s);return g.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),n(g,u,h),l=!0,c._container=u,u.__vue_app__=c,Oa(g.component)}},onUnmount(u){a.push(u)},unmount(){l&&(qn(a,c._instance,16),n(null,c._container),delete c._container.__vue_app__)},provide(u,f){return r.provides[u]=f,c},runWithContext(u){const f=ws;ws=c;try{return u()}finally{ws=f}}};return c}}let ws=null;const xv=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${kn(e)}Modifiers`]||n[`${ns(e)}Modifiers`];function yv(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||At;let s=t;const r=e.startsWith("update:"),o=r&&xv(i,e.slice(7));o&&(o.trim&&(s=t.map(u=>Ht(u)?u.trim():u)),o.number&&(s=t.map(Pa)));let a,l=i[a=Za(e)]||i[a=Za(kn(e))];!l&&r&&(l=i[a=Za(ns(e))]),l&&qn(l,n,6,s);const c=i[a+"Once"];if(c){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,qn(c,n,6,s)}}const Sv=new WeakMap;function hp(n,e,t=!1){const i=t?Sv:e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let o={},a=!1;if(!Qe(n)){const l=c=>{const u=hp(c,e,!0);u&&(a=!0,$t(o,u))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!a?(wt(n)&&i.set(n,null),null):(qe(r)?r.forEach(l=>o[l]=null):$t(o,r),wt(n)&&i.set(n,o),o)}function Fa(n,e){return!n||!Ta(e)?!1:(e=e.slice(2).replace(/Once$/,""),yt(n,e[0].toLowerCase()+e.slice(1))||yt(n,ns(e))||yt(n,e))}function vd(n){const{type:e,vnode:t,proxy:i,withProxy:s,propsOptions:[r],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:f,data:h,setupState:g,ctx:_,inheritAttrs:v}=n,m=ha(n);let p,b;try{if(t.shapeFlag&4){const M=s||i,w=M;p=ti(c.call(w,M,u,f,g,h,_)),b=a}else{const M=e;p=ti(M.length>1?M(f,{attrs:a,slots:o,emit:l}):M(f,null)),b=e.props?a:bv(a)}}catch(M){Hr.length=0,Na(M,n,1),p=pt(ui)}let y=p;if(b&&v!==!1){const M=Object.keys(b),{shapeFlag:w}=y;M.length&&w&7&&(r&&M.some(cu)&&(b=Mv(b,r)),y=As(y,b,!1,!0))}return t.dirs&&(y=As(y,null,!1,!0),y.dirs=y.dirs?y.dirs.concat(t.dirs):t.dirs),t.transition&&jr(y,t.transition),p=y,ha(m),p}const bv=n=>{let e;for(const t in n)(t==="class"||t==="style"||Ta(t))&&((e||(e={}))[t]=n[t]);return e},Mv=(n,e)=>{const t={};for(const i in n)(!cu(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function Ev(n,e,t){const{props:i,children:s,component:r}=n,{props:o,children:a,patchFlag:l}=e,c=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?_d(i,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let f=0;f<u.length;f++){const h=u[f];if(o[h]!==i[h]&&!Fa(c,h))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?_d(i,o,c):!0:!!o;return!1}function _d(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==n[r]&&!Fa(t,r))return!0}return!1}function wv({vnode:n,parent:e},t){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===n&&(i.el=n.el),i===n)(n=e.vnode).el=t,e=e.parent;else break}}const pp={},mp=()=>Object.create(pp),gp=n=>Object.getPrototypeOf(n)===pp;function Tv(n,e,t,i=!1){const s={},r=mp();n.propsDefaults=Object.create(null),vp(n,e,s,r);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=i?s:Gh(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function Av(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=n,a=ft(s),[l]=n.propsOptions;let c=!1;if((i||o>0)&&!(o&16)){if(o&8){const u=n.vnode.dynamicProps;for(let f=0;f<u.length;f++){let h=u[f];if(Fa(n.emitsOptions,h))continue;const g=e[h];if(l)if(yt(r,h))g!==r[h]&&(r[h]=g,c=!0);else{const _=kn(h);s[_]=ic(l,a,_,g,n,!1)}else g!==r[h]&&(r[h]=g,c=!0)}}}else{vp(n,e,s,r)&&(c=!0);let u;for(const f in a)(!e||!yt(e,f)&&((u=ns(f))===f||!yt(e,u)))&&(l?t&&(t[f]!==void 0||t[u]!==void 0)&&(s[f]=ic(l,a,f,void 0,n,!0)):delete s[f]);if(r!==a)for(const f in r)(!e||!yt(e,f))&&(delete r[f],c=!0)}c&&Ei(n.attrs,"set","")}function vp(n,e,t,i){const[s,r]=n.propsOptions;let o=!1,a;if(e)for(let l in e){if(Fr(l))continue;const c=e[l];let u;s&&yt(s,u=kn(l))?!r||!r.includes(u)?t[u]=c:(a||(a={}))[u]=c:Fa(n.emitsOptions,l)||(!(l in i)||c!==i[l])&&(i[l]=c,o=!0)}if(r){const l=ft(t),c=a||At;for(let u=0;u<r.length;u++){const f=r[u];t[f]=ic(s,l,f,c[f],n,!yt(c,f))}}return o}function ic(n,e,t,i,s,r){const o=n[t];if(o!=null){const a=yt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&Qe(l)){const{propsDefaults:c}=s;if(t in c)i=c[t];else{const u=lo(s);i=c[t]=l.call(null,e),u()}}else i=l;s.ce&&s.ce._setProp(t,i)}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===ns(t))&&(i=!0))}return i}const Cv=new WeakMap;function _p(n,e,t=!1){const i=t?Cv:e.propsCache,s=i.get(n);if(s)return s;const r=n.props,o={},a=[];let l=!1;if(!Qe(n)){const u=f=>{l=!0;const[h,g]=_p(f,e,!0);$t(o,h),g&&a.push(...g)};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}if(!r&&!l)return wt(n)&&i.set(n,Ks),Ks;if(qe(r))for(let u=0;u<r.length;u++){const f=kn(r[u]);xd(f)&&(o[f]=At)}else if(r)for(const u in r){const f=kn(u);if(xd(f)){const h=r[u],g=o[f]=qe(h)||Qe(h)?{type:h}:$t({},h),_=g.type;let v=!1,m=!0;if(qe(_))for(let p=0;p<_.length;++p){const b=_[p],y=Qe(b)&&b.name;if(y==="Boolean"){v=!0;break}else y==="String"&&(m=!1)}else v=Qe(_)&&_.name==="Boolean";g[0]=v,g[1]=m,(v||yt(g,"default"))&&a.push(f)}}const c=[o,a];return wt(n)&&i.set(n,c),c}function xd(n){return n[0]!=="$"&&!Fr(n)}const yu=n=>n==="_"||n==="_ctx"||n==="$stable",Su=n=>qe(n)?n.map(ti):[ti(n)],Rv=(n,e,t)=>{if(e._n)return e;const i=Nn((...s)=>Su(e(...s)),t);return i._c=!1,i},xp=(n,e,t)=>{const i=n._ctx;for(const s in n){if(yu(s))continue;const r=n[s];if(Qe(r))e[s]=Rv(s,r,i);else if(r!=null){const o=Su(r);e[s]=()=>o}}},yp=(n,e)=>{const t=Su(e);n.slots.default=()=>t},Sp=(n,e,t)=>{for(const i in e)(t||!yu(i))&&(n[i]=e[i])},Pv=(n,e,t)=>{const i=n.slots=mp();if(n.vnode.shapeFlag&32){const s=e._;s?(Sp(i,e,t),t&&bh(i,"_",s,!0)):xp(e,i)}else e&&yp(n,e)},Iv=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,o=At;if(i.shapeFlag&32){const a=e._;a?t&&a===1?r=!1:Sp(s,e,t):(r=!e.$stable,xp(e,s)),o=e}else e&&(yp(n,e),o={default:1});if(r)for(const a in s)!yu(a)&&o[a]==null&&delete s[a]},dn=Fv;function Dv(n){return Lv(n)}function Lv(n,e){const t=Ia();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:f,nextSibling:h,setScopeId:g=oi,insertStaticContent:_}=n,v=(k,z,q,H=null,D=null,W=null,L=void 0,xe=null,pe=!!z.dynamicChildren)=>{if(k===z)return;k&&!js(k,z)&&(H=X(k),we(k,D,W,!0),k=null),z.patchFlag===-2&&(pe=!1,z.dynamicChildren=null);const{type:fe,ref:ge,shapeFlag:C}=z;switch(fe){case ka:m(k,z,q,H);break;case ui:p(k,z,q,H);break;case Qo:k==null&&b(z,q,H,L);break;case $e:O(k,z,q,H,D,W,L,xe,pe);break;default:C&1?w(k,z,q,H,D,W,L,xe,pe):C&6?j(k,z,q,H,D,W,L,xe,pe):(C&64||C&128)&&fe.process(k,z,q,H,D,W,L,xe,pe,he)}ge!=null&&D?Vr(ge,k&&k.ref,W,z||k,!z):ge==null&&k&&k.ref!=null&&Vr(k.ref,null,W,k,!0)},m=(k,z,q,H)=>{if(k==null)i(z.el=a(z.children),q,H);else{const D=z.el=k.el;z.children!==k.children&&c(D,z.children)}},p=(k,z,q,H)=>{k==null?i(z.el=l(z.children||""),q,H):z.el=k.el},b=(k,z,q,H)=>{[k.el,k.anchor]=_(k.children,z,q,H,k.el,k.anchor)},y=({el:k,anchor:z},q,H)=>{let D;for(;k&&k!==z;)D=h(k),i(k,q,H),k=D;i(z,q,H)},M=({el:k,anchor:z})=>{let q;for(;k&&k!==z;)q=h(k),s(k),k=q;s(z)},w=(k,z,q,H,D,W,L,xe,pe)=>{if(z.type==="svg"?L="svg":z.type==="math"&&(L="mathml"),k==null)A(z,q,H,D,W,L,xe,pe);else{const fe=k.el&&k.el._isVueCE?k.el:null;try{fe&&fe._beginPatch(),x(k,z,D,W,L,xe,pe)}finally{fe&&fe._endPatch()}}},A=(k,z,q,H,D,W,L,xe)=>{let pe,fe;const{props:ge,shapeFlag:C,transition:S,dirs:G}=k;if(pe=k.el=o(k.type,W,ge&&ge.is,ge),C&8?u(pe,k.children):C&16&&R(k.children,pe,null,H,D,il(k,W),L,xe),G&&rs(k,null,H,"created"),T(pe,k,k.scopeId,L,H),ge){for(const ue in ge)ue!=="value"&&!Fr(ue)&&r(pe,ue,null,ge[ue],W,H);"value"in ge&&r(pe,"value",null,ge.value,W),(fe=ge.onVnodeBeforeMount)&&Zn(fe,H,k)}G&&rs(k,null,H,"beforeMount");const re=Nv(D,S);re&&S.beforeEnter(pe),i(pe,z,q),((fe=ge&&ge.onVnodeMounted)||re||G)&&dn(()=>{fe&&Zn(fe,H,k),re&&S.enter(pe),G&&rs(k,null,H,"mounted")},D)},T=(k,z,q,H,D)=>{if(q&&g(k,q),H)for(let W=0;W<H.length;W++)g(k,H[W]);if(D){let W=D.subTree;if(z===W||Ep(W.type)&&(W.ssContent===z||W.ssFallback===z)){const L=D.vnode;T(k,L,L.scopeId,L.slotScopeIds,D.parent)}}},R=(k,z,q,H,D,W,L,xe,pe=0)=>{for(let fe=pe;fe<k.length;fe++){const ge=k[fe]=xe?Yi(k[fe]):ti(k[fe]);v(null,ge,z,q,H,D,W,L,xe)}},x=(k,z,q,H,D,W,L)=>{const xe=z.el=k.el;let{patchFlag:pe,dynamicChildren:fe,dirs:ge}=z;pe|=k.patchFlag&16;const C=k.props||At,S=z.props||At;let G;if(q&&os(q,!1),(G=S.onVnodeBeforeUpdate)&&Zn(G,q,z,k),ge&&rs(z,k,q,"beforeUpdate"),q&&os(q,!0),(C.innerHTML&&S.innerHTML==null||C.textContent&&S.textContent==null)&&u(xe,""),fe?E(k.dynamicChildren,fe,xe,q,H,il(z,D),W):L||F(k,z,xe,null,q,H,il(z,D),W,!1),pe>0){if(pe&16)U(xe,C,S,q,D);else if(pe&2&&C.class!==S.class&&r(xe,"class",null,S.class,D),pe&4&&r(xe,"style",C.style,S.style,D),pe&8){const re=z.dynamicProps;for(let ue=0;ue<re.length;ue++){const ie=re[ue],Le=C[ie],Se=S[ie];(Se!==Le||ie==="value")&&r(xe,ie,Le,Se,D,q)}}pe&1&&k.children!==z.children&&u(xe,z.children)}else!L&&fe==null&&U(xe,C,S,q,D);((G=S.onVnodeUpdated)||ge)&&dn(()=>{G&&Zn(G,q,z,k),ge&&rs(z,k,q,"updated")},H)},E=(k,z,q,H,D,W,L)=>{for(let xe=0;xe<z.length;xe++){const pe=k[xe],fe=z[xe],ge=pe.el&&(pe.type===$e||!js(pe,fe)||pe.shapeFlag&198)?f(pe.el):q;v(pe,fe,ge,null,H,D,W,L,!0)}},U=(k,z,q,H,D)=>{if(z!==q){if(z!==At)for(const W in z)!Fr(W)&&!(W in q)&&r(k,W,z[W],null,D,H);for(const W in q){if(Fr(W))continue;const L=q[W],xe=z[W];L!==xe&&W!=="value"&&r(k,W,xe,L,D,H)}"value"in q&&r(k,"value",z.value,q.value,D)}},O=(k,z,q,H,D,W,L,xe,pe)=>{const fe=z.el=k?k.el:a(""),ge=z.anchor=k?k.anchor:a("");let{patchFlag:C,dynamicChildren:S,slotScopeIds:G}=z;G&&(xe=xe?xe.concat(G):G),k==null?(i(fe,q,H),i(ge,q,H),R(z.children||[],q,ge,D,W,L,xe,pe)):C>0&&C&64&&S&&k.dynamicChildren&&k.dynamicChildren.length===S.length?(E(k.dynamicChildren,S,q,D,W,L,xe),(z.key!=null||D&&z===D.subTree)&&bu(k,z,!0)):F(k,z,q,ge,D,W,L,xe,pe)},j=(k,z,q,H,D,W,L,xe,pe)=>{z.slotScopeIds=xe,k==null?z.shapeFlag&512?D.ctx.activate(z,q,H,L,pe):ee(z,q,H,D,W,L,pe):te(k,z,pe)},ee=(k,z,q,H,D,W,L)=>{const xe=k.component=Gv(k,H,D);if(sp(k)&&(xe.ctx.renderer=he),$v(xe,!1,L),xe.asyncDep){if(D&&D.registerDep(xe,K,L),!k.el){const pe=xe.subTree=pt(ui);p(null,pe,z,q),k.placeholder=pe.el}}else K(xe,k,z,q,D,W,L)},te=(k,z,q)=>{const H=z.component=k.component;if(Ev(k,z,q))if(H.asyncDep&&!H.asyncResolved){I(H,z,q);return}else H.next=z,H.update();else z.el=k.el,H.vnode=z},K=(k,z,q,H,D,W,L)=>{const xe=()=>{if(k.isMounted){let{next:C,bu:S,u:G,parent:re,vnode:ue}=k;{const We=bp(k);if(We){C&&(C.el=ue.el,I(k,C,L)),We.asyncDep.then(()=>{k.isUnmounted||xe()});return}}let ie=C,Le;os(k,!1),C?(C.el=ue.el,I(k,C,L)):C=ue,S&&Ko(S),(Le=C.props&&C.props.onVnodeBeforeUpdate)&&Zn(Le,re,C,ue),os(k,!0);const Se=vd(k),ke=k.subTree;k.subTree=Se,v(ke,Se,f(ke.el),X(ke),k,D,W),C.el=Se.el,ie===null&&wv(k,Se.el),G&&dn(G,D),(Le=C.props&&C.props.onVnodeUpdated)&&dn(()=>Zn(Le,re,C,ue),D)}else{let C;const{el:S,props:G}=z,{bm:re,m:ue,parent:ie,root:Le,type:Se}=k,ke=Qs(z);os(k,!1),re&&Ko(re),!ke&&(C=G&&G.onVnodeBeforeMount)&&Zn(C,ie,z),os(k,!0);{Le.ce&&Le.ce._def.shadowRoot!==!1&&Le.ce._injectChildStyle(Se);const We=k.subTree=vd(k);v(null,We,q,H,k,D,W),z.el=We.el}if(ue&&dn(ue,D),!ke&&(C=G&&G.onVnodeMounted)){const We=z;dn(()=>Zn(C,ie,We),D)}(z.shapeFlag&256||ie&&Qs(ie.vnode)&&ie.vnode.shapeFlag&256)&&k.a&&dn(k.a,D),k.isMounted=!0,z=q=H=null}};k.scope.on();const pe=k.effect=new Rh(xe);k.scope.off();const fe=k.update=pe.run.bind(pe),ge=k.job=pe.runIfDirty.bind(pe);ge.i=k,ge.id=k.uid,pe.scheduler=()=>xu(ge),os(k,!0),fe()},I=(k,z,q)=>{z.component=k;const H=k.vnode.props;k.vnode=z,k.next=null,Av(k,z.props,H,q),Iv(k,z.children,q),Ii(),ad(k),Di()},F=(k,z,q,H,D,W,L,xe,pe=!1)=>{const fe=k&&k.children,ge=k?k.shapeFlag:0,C=z.children,{patchFlag:S,shapeFlag:G}=z;if(S>0){if(S&128){J(fe,C,q,H,D,W,L,xe,pe);return}else if(S&256){$(fe,C,q,H,D,W,L,xe,pe);return}}G&8?(ge&16&&de(fe,D,W),C!==fe&&u(q,C)):ge&16?G&16?J(fe,C,q,H,D,W,L,xe,pe):de(fe,D,W,!0):(ge&8&&u(q,""),G&16&&R(C,q,H,D,W,L,xe,pe))},$=(k,z,q,H,D,W,L,xe,pe)=>{k=k||Ks,z=z||Ks;const fe=k.length,ge=z.length,C=Math.min(fe,ge);let S;for(S=0;S<C;S++){const G=z[S]=pe?Yi(z[S]):ti(z[S]);v(k[S],G,q,null,D,W,L,xe,pe)}fe>ge?de(k,D,W,!0,!1,C):R(z,q,H,D,W,L,xe,pe,C)},J=(k,z,q,H,D,W,L,xe,pe)=>{let fe=0;const ge=z.length;let C=k.length-1,S=ge-1;for(;fe<=C&&fe<=S;){const G=k[fe],re=z[fe]=pe?Yi(z[fe]):ti(z[fe]);if(js(G,re))v(G,re,q,null,D,W,L,xe,pe);else break;fe++}for(;fe<=C&&fe<=S;){const G=k[C],re=z[S]=pe?Yi(z[S]):ti(z[S]);if(js(G,re))v(G,re,q,null,D,W,L,xe,pe);else break;C--,S--}if(fe>C){if(fe<=S){const G=S+1,re=G<ge?z[G].el:H;for(;fe<=S;)v(null,z[fe]=pe?Yi(z[fe]):ti(z[fe]),q,re,D,W,L,xe,pe),fe++}}else if(fe>S)for(;fe<=C;)we(k[fe],D,W,!0),fe++;else{const G=fe,re=fe,ue=new Map;for(fe=re;fe<=S;fe++){const Re=z[fe]=pe?Yi(z[fe]):ti(z[fe]);Re.key!=null&&ue.set(Re.key,fe)}let ie,Le=0;const Se=S-re+1;let ke=!1,We=0;const ye=new Array(Se);for(fe=0;fe<Se;fe++)ye[fe]=0;for(fe=G;fe<=C;fe++){const Re=k[fe];if(Le>=Se){we(Re,D,W,!0);continue}let Oe;if(Re.key!=null)Oe=ue.get(Re.key);else for(ie=re;ie<=S;ie++)if(ye[ie-re]===0&&js(Re,z[ie])){Oe=ie;break}Oe===void 0?we(Re,D,W,!0):(ye[Oe-re]=fe+1,Oe>=We?We=Oe:ke=!0,v(Re,z[Oe],q,null,D,W,L,xe,pe),Le++)}const Ae=ke?Uv(ye):Ks;for(ie=Ae.length-1,fe=Se-1;fe>=0;fe--){const Re=re+fe,Oe=z[Re],Te=z[Re+1],nt=Re+1<ge?Te.el||Mp(Te):H;ye[fe]===0?v(null,Oe,q,nt,D,W,L,xe,pe):ke&&(ie<0||fe!==Ae[ie]?oe(Oe,q,nt,2):ie--)}}},oe=(k,z,q,H,D=null)=>{const{el:W,type:L,transition:xe,children:pe,shapeFlag:fe}=k;if(fe&6){oe(k.component.subTree,z,q,H);return}if(fe&128){k.suspense.move(z,q,H);return}if(fe&64){L.move(k,z,q,he);return}if(L===$e){i(W,z,q);for(let C=0;C<pe.length;C++)oe(pe[C],z,q,H);i(k.anchor,z,q);return}if(L===Qo){y(k,z,q);return}if(H!==2&&fe&1&&xe)if(H===0)xe.beforeEnter(W),i(W,z,q),dn(()=>xe.enter(W),D);else{const{leave:C,delayLeave:S,afterLeave:G}=xe,re=()=>{k.ctx.isUnmounted?s(W):i(W,z,q)},ue=()=>{W._isLeaving&&W[gs](!0),C(W,()=>{re(),G&&G()})};S?S(W,re,ue):ue()}else i(W,z,q)},we=(k,z,q,H=!1,D=!1)=>{const{type:W,props:L,ref:xe,children:pe,dynamicChildren:fe,shapeFlag:ge,patchFlag:C,dirs:S,cacheIndex:G}=k;if(C===-2&&(D=!1),xe!=null&&(Ii(),Vr(xe,null,q,k,!0),Di()),G!=null&&(z.renderCache[G]=void 0),ge&256){z.ctx.deactivate(k);return}const re=ge&1&&S,ue=!Qs(k);let ie;if(ue&&(ie=L&&L.onVnodeBeforeUnmount)&&Zn(ie,z,k),ge&6)lt(k.component,q,H);else{if(ge&128){k.suspense.unmount(q,H);return}re&&rs(k,null,z,"beforeUnmount"),ge&64?k.type.remove(k,z,q,he,H):fe&&!fe.hasOnce&&(W!==$e||C>0&&C&64)?de(fe,z,q,!1,!0):(W===$e&&C&384||!D&&ge&16)&&de(pe,z,q),H&&De(k)}(ue&&(ie=L&&L.onVnodeUnmounted)||re)&&dn(()=>{ie&&Zn(ie,z,k),re&&rs(k,null,z,"unmounted")},q)},De=k=>{const{type:z,el:q,anchor:H,transition:D}=k;if(z===$e){rt(q,H);return}if(z===Qo){M(k);return}const W=()=>{s(q),D&&!D.persisted&&D.afterLeave&&D.afterLeave()};if(k.shapeFlag&1&&D&&!D.persisted){const{leave:L,delayLeave:xe}=D,pe=()=>L(q,W);xe?xe(k.el,W,pe):pe()}else W()},rt=(k,z)=>{let q;for(;k!==z;)q=h(k),s(k),k=q;s(z)},lt=(k,z,q)=>{const{bum:H,scope:D,job:W,subTree:L,um:xe,m:pe,a:fe}=k;yd(pe),yd(fe),H&&Ko(H),D.stop(),W&&(W.flags|=8,we(L,k,z,q)),xe&&dn(xe,z),dn(()=>{k.isUnmounted=!0},z)},de=(k,z,q,H=!1,D=!1,W=0)=>{for(let L=W;L<k.length;L++)we(k[L],z,q,H,D)},X=k=>{if(k.shapeFlag&6)return X(k.component.subTree);if(k.shapeFlag&128)return k.suspense.next();const z=h(k.anchor||k.el),q=z&&z[Qh];return q?h(q):z};let ce=!1;const me=(k,z,q)=>{let H;k==null?z._vnode&&(we(z._vnode,null,null,!0),H=z._vnode.component):v(z._vnode||null,k,z,null,null,null,q),z._vnode=k,ce||(ce=!0,ad(H),jh(),ce=!1)},he={p:v,um:we,m:oe,r:De,mt:ee,mc:R,pc:F,pbc:E,n:X,o:n};return{render:me,hydrate:void 0,createApp:_v(me)}}function il({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function os({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function Nv(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function bu(n,e,t=!1){const i=n.children,s=e.children;if(qe(i)&&qe(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=Yi(s[r]),a.el=o.el),!t&&a.patchFlag!==-2&&bu(o,a)),a.type===ka&&(a.patchFlag!==-1?a.el=o.el:a.__elIndex=r+(n.type===$e?1:0)),a.type===ui&&!a.el&&(a.el=o.el)}}function Uv(n){const e=n.slice(),t=[0];let i,s,r,o,a;const l=n.length;for(i=0;i<l;i++){const c=n[i];if(c!==0){if(s=t[t.length-1],n[s]<c){e[i]=s,t.push(i);continue}for(r=0,o=t.length-1;r<o;)a=r+o>>1,n[t[a]]<c?r=a+1:o=a;c<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,o=t[r-1];r-- >0;)t[r]=o,o=e[o];return t}function bp(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:bp(e)}function yd(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function Mp(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?Mp(e.subTree):null}const Ep=n=>n.__isSuspense;function Fv(n,e){e&&e.pendingBranch?qe(n)?e.effects.push(...n):e.effects.push(n):zg(n)}const $e=Symbol.for("v-fgt"),ka=Symbol.for("v-txt"),ui=Symbol.for("v-cmt"),Qo=Symbol.for("v-stc"),Hr=[];let En=null;function N(n=!1){Hr.push(En=n?null:[])}function kv(){Hr.pop(),En=Hr[Hr.length-1]||null}let Yr=1;function ga(n,e=!1){Yr+=n,n<0&&En&&e&&(En.hasOnce=!0)}function wp(n){return n.dynamicChildren=Yr>0?En||Ks:null,kv(),Yr>0&&En&&En.push(n),n}function V(n,e,t,i,s,r){return wp(d(n,e,t,i,s,r,!0))}function Yt(n,e,t,i,s){return wp(pt(n,e,t,i,s,!0))}function Kr(n){return n?n.__v_isVNode===!0:!1}function js(n,e){return n.type===e.type&&n.key===e.key}const Tp=({key:n})=>n??null,ea=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Ht(n)||zt(n)||Qe(n)?{i:Kt,r:n,k:e,f:!!t}:n:null);function d(n,e=null,t=null,i=0,s=null,r=n===$e?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&Tp(e),ref:e&&ea(e),scopeId:Kh,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Kt};return a?(Mu(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=Ht(t)?8:16),Yr>0&&!o&&En&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&En.push(l),l}const pt=Ov;function Ov(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===cv)&&(n=ui),Kr(n)){const a=As(n,e,!0);return t&&Mu(a,t),Yr>0&&!r&&En&&(a.shapeFlag&6?En[En.indexOf(n)]=a:En.push(a)),a.patchFlag=-2,a}if(Yv(n)&&(n=n.__vccOpts),e){e=Bv(e);let{class:a,style:l}=e;a&&!Ht(a)&&(e.class=Be(a)),wt(l)&&(La(l)&&!qe(l)&&(l=$t({},l)),e.style=Dt(l))}const o=Ht(n)?1:Ep(n)?128:Xg(n)?64:wt(n)?4:Qe(n)?2:0;return d(n,e,t,i,s,o,r,!0)}function Bv(n){return n?La(n)||gp(n)?$t({},n):n:null}function As(n,e,t=!1,i=!1){const{props:s,ref:r,patchFlag:o,children:a,transition:l}=n,c=e?Vv(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:n.type,props:c,key:c&&Tp(c),ref:e&&e.ref?t&&r?qe(r)?r.concat(ea(e)):[r,ea(e)]:ea(e):r,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:a,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==$e?o===-1?16:o|16:o,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:l,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&As(n.ssContent),ssFallback:n.ssFallback&&As(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return l&&i&&jr(u,l.clone(u)),u}function Nt(n=" ",e=0){return pt(ka,null,n,e)}function ir(n,e){const t=pt(Qo,null,n);return t.staticCount=e,t}function Me(n="",e=!1){return e?(N(),Yt(ui,null,n)):pt(ui,null,n)}function ti(n){return n==null||typeof n=="boolean"?pt(ui):qe(n)?pt($e,null,n.slice()):Kr(n)?Yi(n):pt(ka,null,String(n))}function Yi(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:As(n)}function Mu(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(qe(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),Mu(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!gp(e)?e._ctx=Kt:s===3&&Kt&&(Kt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else Qe(e)?(e={default:e,_ctx:Kt},t=32):(e=String(e),i&64?(t=16,e=[Nt(e)]):t=8);n.children=e,n.shapeFlag|=t}function Vv(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Be([e.class,i.class]));else if(s==="style")e.style=Dt([e.style,i.style]);else if(Ta(s)){const r=e[s],o=i[s];o&&r!==o&&!(qe(r)&&r.includes(o))&&(e[s]=r?[].concat(r,o):o)}else s!==""&&(e[s]=i[s])}return e}function Zn(n,e,t,i=null){qn(n,e,7,[t,i])}const zv=fp();let Hv=0;function Gv(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||zv,r={uid:Hv++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Th(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:_p(i,s),emitsOptions:hp(i,s),emit:null,emitted:null,propsDefaults:At,inheritAttrs:i.inheritAttrs,ctx:At,data:At,props:At,attrs:At,slots:At,refs:At,setupState:At,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=yv.bind(null,r),n.ce&&n.ce(r),r}let rn=null;const Eu=()=>rn||Kt;let va,sc;{const n=Ia(),e=(t,i)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(i),r=>{s.length>1?s.forEach(o=>o(r)):s[0](r)}};va=e("__VUE_INSTANCE_SETTERS__",t=>rn=t),sc=e("__VUE_SSR_SETTERS__",t=>Zr=t)}const lo=n=>{const e=rn;return va(n),n.scope.on(),()=>{n.scope.off(),va(e)}},Sd=()=>{rn&&rn.scope.off(),va(null)};function Ap(n){return n.vnode.shapeFlag&4}let Zr=!1;function $v(n,e=!1,t=!1){e&&sc(e);const{props:i,children:s}=n.vnode,r=Ap(n);Tv(n,i,r,e),Pv(n,s,t||e);const o=r?Wv(n,e):void 0;return e&&sc(!1),o}function Wv(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,dv);const{setup:i}=t;if(i){Ii();const s=n.setupContext=i.length>1?qv(n):null,r=lo(n),o=oo(i,n,0,[n.props,s]),a=xh(o);if(Di(),r(),(a||n.sp)&&!Qs(n)&&ip(n),a){if(o.then(Sd,Sd),e)return o.then(l=>{bd(n,l)}).catch(l=>{Na(l,n,0)});n.asyncDep=o}else bd(n,o)}else Cp(n)}function bd(n,e,t){Qe(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:wt(e)&&(n.setupState=Wh(e)),Cp(n)}function Cp(n,e,t){const i=n.type;n.render||(n.render=i.render||oi);{const s=lo(n);Ii();try{fv(n)}finally{Di(),s()}}}const Xv={get(n,e){return sn(n,"get",""),n[e]}};function qv(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,Xv),slots:n.slots,emit:n.emit,expose:e}}function Oa(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(Wh(_u(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in zr)return zr[t](n)},has(e,t){return t in e||t in zr}})):n.proxy}function jv(n,e=!0){return Qe(n)?n.displayName||n.name:n.name||e&&n.__name}function Yv(n){return Qe(n)&&"__vccOpts"in n}const ot=(n,e)=>Fg(n,e,Zr);function Rp(n,e,t){try{ga(-1);const i=arguments.length;return i===2?wt(e)&&!qe(e)?Kr(e)?pt(n,null,[e]):pt(n,e):pt(n,null,e):(i>3?t=Array.prototype.slice.call(arguments,2):i===3&&Kr(t)&&(t=[t]),pt(n,e,t))}finally{ga(1)}}const Kv="3.5.27";/**
* @vue/runtime-dom v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let rc;const Md=typeof window<"u"&&window.trustedTypes;if(Md)try{rc=Md.createPolicy("vue",{createHTML:n=>n})}catch{}const Pp=rc?n=>rc.createHTML(n):n=>n,Zv="http://www.w3.org/2000/svg",Jv="http://www.w3.org/1998/Math/MathML",Mi=typeof document<"u"?document:null,Ed=Mi&&Mi.createElement("template"),Qv={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e==="svg"?Mi.createElementNS(Zv,n):e==="mathml"?Mi.createElementNS(Jv,n):t?Mi.createElement(n,{is:t}):Mi.createElement(n);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>Mi.createTextNode(n),createComment:n=>Mi.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>Mi.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const o=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{Ed.innerHTML=Pp(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const a=Ed.content;if(i==="svg"||i==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},ki="transition",yr="animation",sr=Symbol("_vtc"),Ip={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},e_=$t({},Kg,Ip),as=(n,e=[])=>{qe(n)?n.forEach(t=>t(...e)):n&&n(...e)},wd=n=>n?qe(n)?n.some(e=>e.length>1):n.length>1:!1;function t_(n){const e={};for(const O in n)O in Ip||(e[O]=n[O]);if(n.css===!1)return e;const{name:t="v",type:i,duration:s,enterFromClass:r=`${t}-enter-from`,enterActiveClass:o=`${t}-enter-active`,enterToClass:a=`${t}-enter-to`,appearFromClass:l=r,appearActiveClass:c=o,appearToClass:u=a,leaveFromClass:f=`${t}-leave-from`,leaveActiveClass:h=`${t}-leave-active`,leaveToClass:g=`${t}-leave-to`}=n,_=n_(s),v=_&&_[0],m=_&&_[1],{onBeforeEnter:p,onEnter:b,onEnterCancelled:y,onLeave:M,onLeaveCancelled:w,onBeforeAppear:A=p,onAppear:T=b,onAppearCancelled:R=y}=e,x=(O,j,ee,te)=>{O._enterCancelled=te,Wi(O,j?u:a),Wi(O,j?c:o),ee&&ee()},E=(O,j)=>{O._isLeaving=!1,Wi(O,f),Wi(O,g),Wi(O,h),j&&j()},U=O=>(j,ee)=>{const te=O?T:b,K=()=>x(j,O,ee);as(te,[j,K]),Td(()=>{Wi(j,O?l:r),Qn(j,O?u:a),wd(te)||Ad(j,i,v,K)})};return $t(e,{onBeforeEnter(O){as(p,[O]),Qn(O,r),Qn(O,o)},onBeforeAppear(O){as(A,[O]),Qn(O,l),Qn(O,c)},onEnter:U(!1),onAppear:U(!0),onLeave(O,j){O._isLeaving=!0;const ee=()=>E(O,j);Qn(O,f),O._enterCancelled?(Qn(O,h),oc(O)):(oc(O),Qn(O,h)),Td(()=>{O._isLeaving&&(Wi(O,f),Qn(O,g),wd(M)||Ad(O,i,m,ee))}),as(M,[O,ee])},onEnterCancelled(O){x(O,!1,void 0,!0),as(y,[O])},onAppearCancelled(O){x(O,!0,void 0,!0),as(R,[O])},onLeaveCancelled(O){E(O),as(w,[O])}})}function n_(n){if(n==null)return null;if(wt(n))return[sl(n.enter),sl(n.leave)];{const e=sl(n);return[e,e]}}function sl(n){return tg(n)}function Qn(n,e){e.split(/\s+/).forEach(t=>t&&n.classList.add(t)),(n[sr]||(n[sr]=new Set)).add(e)}function Wi(n,e){e.split(/\s+/).forEach(i=>i&&n.classList.remove(i));const t=n[sr];t&&(t.delete(e),t.size||(n[sr]=void 0))}function Td(n){requestAnimationFrame(()=>{requestAnimationFrame(n)})}let i_=0;function Ad(n,e,t,i){const s=n._endId=++i_,r=()=>{s===n._endId&&i()};if(t!=null)return setTimeout(r,t);const{type:o,timeout:a,propCount:l}=Dp(n,e);if(!o)return i();const c=o+"end";let u=0;const f=()=>{n.removeEventListener(c,h),r()},h=g=>{g.target===n&&++u>=l&&f()};setTimeout(()=>{u<l&&f()},a+1),n.addEventListener(c,h)}function Dp(n,e){const t=window.getComputedStyle(n),i=_=>(t[_]||"").split(", "),s=i(`${ki}Delay`),r=i(`${ki}Duration`),o=Cd(s,r),a=i(`${yr}Delay`),l=i(`${yr}Duration`),c=Cd(a,l);let u=null,f=0,h=0;e===ki?o>0&&(u=ki,f=o,h=r.length):e===yr?c>0&&(u=yr,f=c,h=l.length):(f=Math.max(o,c),u=f>0?o>c?ki:yr:null,h=u?u===ki?r.length:l.length:0);const g=u===ki&&/\b(?:transform|all)(?:,|$)/.test(i(`${ki}Property`).toString());return{type:u,timeout:f,propCount:h,hasTransform:g}}function Cd(n,e){for(;n.length<e.length;)n=n.concat(n);return Math.max(...e.map((t,i)=>Rd(t)+Rd(n[i])))}function Rd(n){return n==="auto"?0:Number(n.slice(0,-1).replace(",","."))*1e3}function oc(n){return(n?n.ownerDocument:document).body.offsetHeight}function s_(n,e,t){const i=n[sr];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const _a=Symbol("_vod"),Lp=Symbol("_vsh"),r_={name:"show",beforeMount(n,{value:e},{transition:t}){n[_a]=n.style.display==="none"?"":n.style.display,t&&e?t.beforeEnter(n):Sr(n,e)},mounted(n,{value:e},{transition:t}){t&&e&&t.enter(n)},updated(n,{value:e,oldValue:t},{transition:i}){!e!=!t&&(i?e?(i.beforeEnter(n),Sr(n,!0),i.enter(n)):i.leave(n,()=>{Sr(n,!1)}):Sr(n,e))},beforeUnmount(n,{value:e}){Sr(n,e)}};function Sr(n,e){n.style.display=e?n[_a]:"none",n[Lp]=!e}const o_=Symbol(""),a_=/(?:^|;)\s*display\s*:/;function l_(n,e,t){const i=n.style,s=Ht(t);let r=!1;if(t&&!s){if(e)if(Ht(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();t[a]==null&&ta(i,a,"")}else for(const o in e)t[o]==null&&ta(i,o,"");for(const o in t)o==="display"&&(r=!0),ta(i,o,t[o])}else if(s){if(e!==t){const o=i[o_];o&&(t+=";"+o),i.cssText=t,r=a_.test(t)}}else e&&n.removeAttribute("style");_a in n&&(n[_a]=r?i.display:"",n[Lp]&&(i.display="none"))}const Pd=/\s*!important$/;function ta(n,e,t){if(qe(t))t.forEach(i=>ta(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=c_(n,e);Pd.test(t)?n.setProperty(ns(i),t.replace(Pd,""),"important"):n[i]=t}}const Id=["Webkit","Moz","ms"],rl={};function c_(n,e){const t=rl[e];if(t)return t;let i=kn(e);if(i!=="filter"&&i in n)return rl[e]=i;i=Ra(i);for(let s=0;s<Id.length;s++){const r=Id[s]+i;if(r in n)return rl[e]=r}return e}const Dd="http://www.w3.org/1999/xlink";function Ld(n,e,t,i,s,r=ag(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Dd,e.slice(6,e.length)):n.setAttributeNS(Dd,e,t):t==null||r&&!Mh(t)?n.removeAttribute(e):n.setAttribute(e,r?"":Wn(t)?String(t):t)}function Nd(n,e,t,i,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Pp(t):t);return}const r=n.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const a=r==="OPTION"?n.getAttribute("value")||"":n.value,l=t==null?n.type==="checkbox"?"on":"":String(t);(a!==l||!("_value"in n))&&(n.value=l),t==null&&n.removeAttribute(e),n._value=t;return}let o=!1;if(t===""||t==null){const a=typeof n[e];a==="boolean"?t=Mh(t):t==null&&a==="string"?(t="",o=!0):a==="number"&&(t=0,o=!0)}try{n[e]=t}catch{}o&&n.removeAttribute(s||e)}function Ti(n,e,t,i){n.addEventListener(e,t,i)}function u_(n,e,t,i){n.removeEventListener(e,t,i)}const Ud=Symbol("_vei");function d_(n,e,t,i,s=null){const r=n[Ud]||(n[Ud]={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=f_(e);if(i){const c=r[e]=m_(i,s);Ti(n,a,c,l)}else o&&(u_(n,a,o,l),r[e]=void 0)}}const Fd=/(?:Once|Passive|Capture)$/;function f_(n){let e;if(Fd.test(n)){e={};let i;for(;i=n.match(Fd);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):ns(n.slice(2)),e]}let ol=0;const h_=Promise.resolve(),p_=()=>ol||(h_.then(()=>ol=0),ol=Date.now());function m_(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;qn(g_(i,t.value),e,5,[i])};return t.value=n,t.attached=p_(),t}function g_(n,e){if(qe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const kd=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,v_=(n,e,t,i,s,r)=>{const o=s==="svg";e==="class"?s_(n,i,o):e==="style"?l_(n,t,i):Ta(e)?cu(e)||d_(n,e,t,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):__(n,e,i,o))?(Nd(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Ld(n,e,i,o,r,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Ht(i))?Nd(n,kn(e),i,r,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),Ld(n,e,i,o))};function __(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&kd(e)&&Qe(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return kd(e)&&Ht(t)?!1:e in n}const Np=new WeakMap,Up=new WeakMap,xa=Symbol("_moveCb"),Od=Symbol("_enterCb"),x_=n=>(delete n.props.mode,n),y_=x_({name:"TransitionGroup",props:$t({},e_,{tag:String,moveClass:String}),setup(n,{slots:e}){const t=Eu(),i=Yg();let s,r;return op(()=>{if(!s.length)return;const o=n.moveClass||`${n.name||"v"}-move`;if(!w_(s[0].el,t.vnode.el,o)){s=[];return}s.forEach(b_),s.forEach(M_);const a=s.filter(E_);oc(t.vnode.el),a.forEach(l=>{const c=l.el,u=c.style;Qn(c,o),u.transform=u.webkitTransform=u.transitionDuration="";const f=c[xa]=h=>{h&&h.target!==c||(!h||h.propertyName.endsWith("transform"))&&(c.removeEventListener("transitionend",f),c[xa]=null,Wi(c,o))};c.addEventListener("transitionend",f)}),s=[]}),()=>{const o=ft(n),a=t_(o);let l=o.tag||$e;if(s=[],r)for(let c=0;c<r.length;c++){const u=r[c];u.el&&u.el instanceof Element&&(s.push(u),jr(u,Ql(u,a,i,t)),Np.set(u,{left:u.el.offsetLeft,top:u.el.offsetTop}))}r=e.default?np(e.default()):[];for(let c=0;c<r.length;c++){const u=r[c];u.key!=null&&jr(u,Ql(u,a,i,t))}return pt(l,null,r)}}}),S_=y_;function b_(n){const e=n.el;e[xa]&&e[xa](),e[Od]&&e[Od]()}function M_(n){Up.set(n,{left:n.el.offsetLeft,top:n.el.offsetTop})}function E_(n){const e=Np.get(n),t=Up.get(n),i=e.left-t.left,s=e.top-t.top;if(i||s){const r=n.el.style;return r.transform=r.webkitTransform=`translate(${i}px,${s}px)`,r.transitionDuration="0s",n}}function w_(n,e,t){const i=n.cloneNode(),s=n[sr];s&&s.forEach(a=>{a.split(/\s+/).forEach(l=>l&&i.classList.remove(l))}),t.split(/\s+/).forEach(a=>a&&i.classList.add(a)),i.style.display="none";const r=e.nodeType===1?e:e.parentNode;r.appendChild(i);const{hasTransform:o}=Dp(i);return r.removeChild(i),o}const es=n=>{const e=n.props["onUpdate:modelValue"]||!1;return qe(e)?t=>Ko(e,t):e};function T_(n){n.target.composing=!0}function Bd(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Fn=Symbol("_assign");function Vd(n,e,t){return e&&(n=n.trim()),t&&(n=Pa(n)),n}const Lt={created(n,{modifiers:{lazy:e,trim:t,number:i}},s){n[Fn]=es(s);const r=i||s.props&&s.props.type==="number";Ti(n,e?"change":"input",o=>{o.target.composing||n[Fn](Vd(n.value,t,r))}),(t||r)&&Ti(n,"change",()=>{n.value=Vd(n.value,t,r)}),e||(Ti(n,"compositionstart",T_),Ti(n,"compositionend",Bd),Ti(n,"change",Bd))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:i,trim:s,number:r}},o){if(n[Fn]=es(o),n.composing)return;const a=(r||n.type==="number")&&!/^0\d/.test(n.value)?Pa(n.value):n.value,l=e??"";a!==l&&(document.activeElement===n&&n.type!=="range"&&(i&&e===t||s&&n.value.trim()===l)||(n.value=l))}},A_={deep:!0,created(n,e,t){n[Fn]=es(t),Ti(n,"change",()=>{const i=n._modelValue,s=rr(n),r=n.checked,o=n[Fn];if(qe(i)){const a=du(i,s),l=a!==-1;if(r&&!l)o(i.concat(s));else if(!r&&l){const c=[...i];c.splice(a,1),o(c)}}else if(pr(i)){const a=new Set(i);r?a.add(s):a.delete(s),o(a)}else o(Fp(n,r))})},mounted:zd,beforeUpdate(n,e,t){n[Fn]=es(t),zd(n,e,t)}};function zd(n,{value:e,oldValue:t},i){n._modelValue=e;let s;if(qe(e))s=du(e,i.props.value)>-1;else if(pr(e))s=e.has(i.props.value);else{if(e===t)return;s=Ts(e,Fp(n,!0))}n.checked!==s&&(n.checked=s)}const C_={created(n,{value:e},t){n.checked=Ts(e,t.props.value),n[Fn]=es(t),Ti(n,"change",()=>{n[Fn](rr(n))})},beforeUpdate(n,{value:e,oldValue:t},i){n[Fn]=es(i),e!==t&&(n.checked=Ts(e,i.props.value))}},wu={deep:!0,created(n,{value:e,modifiers:{number:t}},i){const s=pr(e);Ti(n,"change",()=>{const r=Array.prototype.filter.call(n.options,o=>o.selected).map(o=>t?Pa(rr(o)):rr(o));n[Fn](n.multiple?s?new Set(r):r:r[0]),n._assigning=!0,ao(()=>{n._assigning=!1})}),n[Fn]=es(i)},mounted(n,{value:e}){Hd(n,e)},beforeUpdate(n,e,t){n[Fn]=es(t)},updated(n,{value:e}){n._assigning||Hd(n,e)}};function Hd(n,e){const t=n.multiple,i=qe(e);if(!(t&&!i&&!pr(e))){for(let s=0,r=n.options.length;s<r;s++){const o=n.options[s],a=rr(o);if(t)if(i){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(c=>String(c)===String(a)):o.selected=du(e,a)>-1}else o.selected=e.has(a);else if(Ts(rr(o),e)){n.selectedIndex!==s&&(n.selectedIndex=s);return}}!t&&n.selectedIndex!==-1&&(n.selectedIndex=-1)}}function rr(n){return"_value"in n?n._value:n.value}function Fp(n,e){const t=e?"_trueValue":"_falseValue";return t in n?n[t]:e}const Is={created(n,e,t){Mo(n,e,t,null,"created")},mounted(n,e,t){Mo(n,e,t,null,"mounted")},beforeUpdate(n,e,t,i){Mo(n,e,t,i,"beforeUpdate")},updated(n,e,t,i){Mo(n,e,t,i,"updated")}};function R_(n,e){switch(n){case"SELECT":return wu;case"TEXTAREA":return Lt;default:switch(e){case"checkbox":return A_;case"radio":return C_;default:return Lt}}}function Mo(n,e,t,i,s){const o=R_(n.tagName,t.props&&t.props.type)[s];o&&o(n,e,t,i)}const P_=["ctrl","shift","alt","meta"],I_={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>P_.some(t=>n[`${t}Key`]&&!e.includes(t))},co=(n,e)=>{const t=n._withMods||(n._withMods={}),i=e.join(".");return t[i]||(t[i]=(s,...r)=>{for(let o=0;o<e.length;o++){const a=I_[e[o]];if(a&&a(s,e))return}return n(s,...r)})},D_={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},ls=(n,e)=>{const t=n._withKeys||(n._withKeys={}),i=e.join(".");return t[i]||(t[i]=s=>{if(!("key"in s))return;const r=ns(s.key);if(e.some(o=>o===r||D_[o]===r))return n(s)})},L_=$t({patchProp:v_},Qv);let Gd;function N_(){return Gd||(Gd=Dv(L_))}const U_=(...n)=>{const e=N_().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=k_(i);if(!s)return;const r=e._component;!Qe(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=t(s,!1,F_(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function F_(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function k_(n){return Ht(n)?document.querySelector(n):n}/*!
 * pinia v3.0.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let kp;const Ba=n=>kp=n,Op=Symbol();function ac(n){return n&&typeof n=="object"&&Object.prototype.toString.call(n)==="[object Object]"&&typeof n.toJSON!="function"}var Gr;(function(n){n.direct="direct",n.patchObject="patch object",n.patchFunction="patch function"})(Gr||(Gr={}));function O_(){const n=Ah(!0),e=n.run(()=>Q({}));let t=[],i=[];const s=_u({install(r){Ba(s),s._a=r,r.provide(Op,s),r.config.globalProperties.$pinia=s,i.forEach(o=>t.push(o)),i=[]},use(r){return this._a?t.push(r):i.push(r),this},_p:t,_a:null,_e:n,_s:new Map,state:e});return s}const Bp=()=>{};function $d(n,e,t,i=Bp){n.add(e);const s=()=>{n.delete(e)&&i()};return!t&&Ch()&&cg(s),s}function Ds(n,...e){n.forEach(t=>{t(...e)})}const B_=n=>n(),Wd=Symbol(),al=Symbol();function lc(n,e){n instanceof Map&&e instanceof Map?e.forEach((t,i)=>n.set(i,t)):n instanceof Set&&e instanceof Set&&e.forEach(n.add,n);for(const t in e){if(!e.hasOwnProperty(t))continue;const i=e[t],s=n[t];ac(s)&&ac(i)&&n.hasOwnProperty(t)&&!zt(i)&&!Ci(i)?n[t]=lc(s,i):n[t]=i}return n}const V_=Symbol();function z_(n){return!ac(n)||!Object.prototype.hasOwnProperty.call(n,V_)}const{assign:Xi}=Object;function H_(n){return!!(zt(n)&&n.effect)}function G_(n,e,t,i){const{state:s,actions:r,getters:o}=e,a=t.state.value[n];let l;function c(){a||(t.state.value[n]=s?s():{});const u=Dg(t.state.value[n]);return Xi(u,r,Object.keys(o||{}).reduce((f,h)=>(f[h]=_u(ot(()=>{Ba(t);const g=t._s.get(n);return o[h].call(g,g)})),f),{}))}return l=Vp(n,c,e,t,i,!0),l}function Vp(n,e,t={},i,s,r){let o;const a=Xi({actions:{}},t),l={deep:!0};let c,u,f=new Set,h=new Set,g;const _=i.state.value[n];!r&&!_&&(i.state.value[n]={});let v;function m(R){let x;c=u=!1,typeof R=="function"?(R(i.state.value[n]),x={type:Gr.patchFunction,storeId:n,events:g}):(lc(i.state.value[n],R),x={type:Gr.patchObject,payload:R,storeId:n,events:g});const E=v=Symbol();ao().then(()=>{v===E&&(c=!0)}),u=!0,Ds(f,x,i.state.value[n])}const p=r?function(){const{state:x}=t,E=x?x():{};this.$patch(U=>{Xi(U,E)})}:Bp;function b(){o.stop(),f.clear(),h.clear(),i._s.delete(n)}const y=(R,x="")=>{if(Wd in R)return R[al]=x,R;const E=function(){Ba(i);const U=Array.from(arguments),O=new Set,j=new Set;function ee(I){O.add(I)}function te(I){j.add(I)}Ds(h,{args:U,name:E[al],store:w,after:ee,onError:te});let K;try{K=R.apply(this&&this.$id===n?this:w,U)}catch(I){throw Ds(j,I),I}return K instanceof Promise?K.then(I=>(Ds(O,I),I)).catch(I=>(Ds(j,I),Promise.reject(I))):(Ds(O,K),K)};return E[Wd]=!0,E[al]=x,E},M={_p:i,$id:n,$onAction:$d.bind(null,h),$patch:m,$reset:p,$subscribe(R,x={}){const E=$d(f,R,x.detached,()=>U()),U=o.run(()=>Un(()=>i.state.value[n],O=>{(x.flush==="sync"?u:c)&&R({storeId:n,type:Gr.direct,events:g},O)},Xi({},l,x)));return E},$dispose:b},w=ro(M);i._s.set(n,w);const T=(i._a&&i._a.runWithContext||B_)(()=>i._e.run(()=>(o=Ah()).run(()=>e({action:y}))));for(const R in T){const x=T[R];if(zt(x)&&!H_(x)||Ci(x))r||(_&&z_(x)&&(zt(x)?x.value=_[R]:lc(x,_[R])),i.state.value[n][R]=x);else if(typeof x=="function"){const E=y(x,R);T[R]=E,a.actions[R]=x}}return Xi(w,T),Xi(ft(w),T),Object.defineProperty(w,"$state",{get:()=>i.state.value[n],set:R=>{m(x=>{Xi(x,R)})}}),i._p.forEach(R=>{Xi(w,o.run(()=>R({store:w,app:i._a,pinia:i,options:a})))}),_&&r&&t.hydrate&&t.hydrate(w.$state,_),c=!0,u=!0,w}/*! #__NO_SIDE_EFFECTS__ */function $_(n,e,t){let i;const s=typeof e=="function";i=s?t:e;function r(o,a){const l=Hg();return o=o||(l?An(Op,null):null),o&&Ba(o),o=kp,o._s.has(n)||(s?Vp(n,e,i,o):G_(n,i,o)),o._s.get(n)}return r.$id=n,r}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const Ys=typeof document<"u";function zp(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function W_(n){return n.__esModule||n[Symbol.toStringTag]==="Module"||n.default&&zp(n.default)}const xt=Object.assign;function ll(n,e){const t={};for(const i in e){const s=e[i];t[i]=jn(s)?s.map(n):n(s)}return t}const $r=()=>{},jn=Array.isArray;function Xd(n,e){const t={};for(const i in n)t[i]=i in e?e[i]:n[i];return t}const Hp=/#/g,X_=/&/g,q_=/\//g,j_=/=/g,Y_=/\?/g,Gp=/\+/g,K_=/%5B/g,Z_=/%5D/g,$p=/%5E/g,J_=/%60/g,Wp=/%7B/g,Q_=/%7C/g,Xp=/%7D/g,e0=/%20/g;function Tu(n){return n==null?"":encodeURI(""+n).replace(Q_,"|").replace(K_,"[").replace(Z_,"]")}function t0(n){return Tu(n).replace(Wp,"{").replace(Xp,"}").replace($p,"^")}function cc(n){return Tu(n).replace(Gp,"%2B").replace(e0,"+").replace(Hp,"%23").replace(X_,"%26").replace(J_,"`").replace(Wp,"{").replace(Xp,"}").replace($p,"^")}function n0(n){return cc(n).replace(j_,"%3D")}function i0(n){return Tu(n).replace(Hp,"%23").replace(Y_,"%3F")}function s0(n){return i0(n).replace(q_,"%2F")}function Jr(n){if(n==null)return null;try{return decodeURIComponent(""+n)}catch{}return""+n}const r0=/\/$/,o0=n=>n.replace(r0,"");function cl(n,e,t="/"){let i,s={},r="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(i=e.slice(0,l),r=e.slice(l,a>0?a:e.length),s=n(r.slice(1))),a>=0&&(i=i||e.slice(0,a),o=e.slice(a,e.length)),i=u0(i??e,t),{fullPath:i+r+o,path:i,query:s,hash:Jr(o)}}function a0(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function qd(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function l0(n,e,t){const i=e.matched.length-1,s=t.matched.length-1;return i>-1&&i===s&&or(e.matched[i],t.matched[s])&&qp(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function or(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function qp(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(var t in n)if(!c0(n[t],e[t]))return!1;return!0}function c0(n,e){return jn(n)?jd(n,e):jn(e)?jd(e,n):(n==null?void 0:n.valueOf())===(e==null?void 0:e.valueOf())}function jd(n,e){return jn(e)?n.length===e.length&&n.every((t,i)=>t===e[i]):n.length===1&&n[0]===e}function u0(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),i=n.split("/"),s=i[i.length-1];(s===".."||s===".")&&i.push("");let r=t.length-1,o,a;for(o=0;o<i.length;o++)if(a=i[o],a!==".")if(a==="..")r>1&&r--;else break;return t.slice(0,r).join("/")+"/"+i.slice(o).join("/")}const Oi={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let uc=function(n){return n.pop="pop",n.push="push",n}({}),ul=function(n){return n.back="back",n.forward="forward",n.unknown="",n}({});function d0(n){if(!n)if(Ys){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),o0(n)}const f0=/^[^#]+#/;function h0(n,e){return n.replace(f0,"#")+e}function p0(n,e){const t=document.documentElement.getBoundingClientRect(),i=n.getBoundingClientRect();return{behavior:e.behavior,left:i.left-t.left-(e.left||0),top:i.top-t.top-(e.top||0)}}const Va=()=>({left:window.scrollX,top:window.scrollY});function m0(n){let e;if("el"in n){const t=n.el,i=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?i?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=p0(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Yd(n,e){return(history.state?history.state.position-e:-1)+n}const dc=new Map;function g0(n,e){dc.set(n,e)}function v0(n){const e=dc.get(n);return dc.delete(n),e}function _0(n){return typeof n=="string"||n&&typeof n=="object"}function jp(n){return typeof n=="string"||typeof n=="symbol"}let Ot=function(n){return n[n.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",n[n.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",n[n.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",n[n.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",n[n.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",n}({});const Yp=Symbol("");Ot.MATCHER_NOT_FOUND+"",Ot.NAVIGATION_GUARD_REDIRECT+"",Ot.NAVIGATION_ABORTED+"",Ot.NAVIGATION_CANCELLED+"",Ot.NAVIGATION_DUPLICATED+"";function ar(n,e){return xt(new Error,{type:n,[Yp]:!0},e)}function vi(n,e){return n instanceof Error&&Yp in n&&(e==null||!!(n.type&e))}const x0=["params","query","hash"];function y0(n){if(typeof n=="string")return n;if(n.path!=null)return n.path;const e={};for(const t of x0)t in n&&(e[t]=n[t]);return JSON.stringify(e,null,2)}function S0(n){const e={};if(n===""||n==="?")return e;const t=(n[0]==="?"?n.slice(1):n).split("&");for(let i=0;i<t.length;++i){const s=t[i].replace(Gp," "),r=s.indexOf("="),o=Jr(r<0?s:s.slice(0,r)),a=r<0?null:Jr(s.slice(r+1));if(o in e){let l=e[o];jn(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function Kd(n){let e="";for(let t in n){const i=n[t];if(t=n0(t),i==null){i!==void 0&&(e+=(e.length?"&":"")+t);continue}(jn(i)?i.map(s=>s&&cc(s)):[i&&cc(i)]).forEach(s=>{s!==void 0&&(e+=(e.length?"&":"")+t,s!=null&&(e+="="+s))})}return e}function b0(n){const e={};for(const t in n){const i=n[t];i!==void 0&&(e[t]=jn(i)?i.map(s=>s==null?null:""+s):i==null?i:""+i)}return e}const M0=Symbol(""),Zd=Symbol(""),za=Symbol(""),Au=Symbol(""),fc=Symbol("");function br(){let n=[];function e(i){return n.push(i),()=>{const s=n.indexOf(i);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n.slice(),reset:t}}function Ki(n,e,t,i,s,r=o=>o()){const o=i&&(i.enterCallbacks[s]=i.enterCallbacks[s]||[]);return()=>new Promise((a,l)=>{const c=h=>{h===!1?l(ar(Ot.NAVIGATION_ABORTED,{from:t,to:e})):h instanceof Error?l(h):_0(h)?l(ar(Ot.NAVIGATION_GUARD_REDIRECT,{from:e,to:h})):(o&&i.enterCallbacks[s]===o&&typeof h=="function"&&o.push(h),a())},u=r(()=>n.call(i&&i.instances[s],e,t,c));let f=Promise.resolve(u);n.length<3&&(f=f.then(c)),f.catch(h=>l(h))})}function dl(n,e,t,i,s=r=>r()){const r=[];for(const o of n)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(zp(l)){const c=(l.__vccOpts||l)[e];c&&r.push(Ki(c,t,i,o,a,s))}else{let c=l();r.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=W_(u)?u.default:u;o.mods[a]=u,o.components[a]=f;const h=(f.__vccOpts||f)[e];return h&&Ki(h,t,i,o,a,s)()}))}}return r}function E0(n,e){const t=[],i=[],s=[],r=Math.max(e.matched.length,n.matched.length);for(let o=0;o<r;o++){const a=e.matched[o];a&&(n.matched.find(c=>or(c,a))?i.push(a):t.push(a));const l=n.matched[o];l&&(e.matched.find(c=>or(c,l))||s.push(l))}return[t,i,s]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let w0=()=>location.protocol+"//"+location.host;function Kp(n,e){const{pathname:t,search:i,hash:s}=e,r=n.indexOf("#");if(r>-1){let o=s.includes(n.slice(r))?n.slice(r).length:1,a=s.slice(o);return a[0]!=="/"&&(a="/"+a),qd(a,"")}return qd(t,n)+i+s}function T0(n,e,t,i){let s=[],r=[],o=null;const a=({state:h})=>{const g=Kp(n,location),_=t.value,v=e.value;let m=0;if(h){if(t.value=g,e.value=h,o&&o===_){o=null;return}m=v?h.position-v.position:0}else i(g);s.forEach(p=>{p(t.value,_,{delta:m,type:uc.pop,direction:m?m>0?ul.forward:ul.back:ul.unknown})})};function l(){o=t.value}function c(h){s.push(h);const g=()=>{const _=s.indexOf(h);_>-1&&s.splice(_,1)};return r.push(g),g}function u(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(xt({},h.state,{scroll:Va()}),"")}}function f(){for(const h of r)h();r=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:f}}function Jd(n,e,t,i=!1,s=!1){return{back:n,current:e,forward:t,replaced:i,position:window.history.length,scroll:s?Va():null}}function A0(n){const{history:e,location:t}=window,i={value:Kp(n,t)},s={value:e.state};s.value||r(i.value,{back:null,current:i.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function r(l,c,u){const f=n.indexOf("#"),h=f>-1?(t.host&&document.querySelector("base")?n:n.slice(f))+l:w0()+n+l;try{e[u?"replaceState":"pushState"](c,"",h),s.value=c}catch(g){console.error(g),t[u?"replace":"assign"](h)}}function o(l,c){r(l,xt({},e.state,Jd(s.value.back,l,s.value.forward,!0),c,{position:s.value.position}),!0),i.value=l}function a(l,c){const u=xt({},s.value,e.state,{forward:l,scroll:Va()});r(u.current,u,!0),r(l,xt({},Jd(i.value,l,null),{position:u.position+1},c),!1),i.value=l}return{location:i,state:s,push:a,replace:o}}function C0(n){n=d0(n);const e=A0(n),t=T0(n,e.state,e.location,e.replace);function i(r,o=!0){o||t.pauseListeners(),history.go(r)}const s=xt({location:"",base:n,go:i,createHref:h0.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}let Ss=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.Group=2]="Group",n}({});var Wt=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.ParamRegExp=2]="ParamRegExp",n[n.ParamRegExpEnd=3]="ParamRegExpEnd",n[n.EscapeNext=4]="EscapeNext",n}(Wt||{});const R0={type:Ss.Static,value:""},P0=/[a-zA-Z0-9_]/;function I0(n){if(!n)return[[]];if(n==="/")return[[R0]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(g){throw new Error(`ERR (${t})/"${c}": ${g}`)}let t=Wt.Static,i=t;const s=[];let r;function o(){r&&s.push(r),r=[]}let a=0,l,c="",u="";function f(){c&&(t===Wt.Static?r.push({type:Ss.Static,value:c}):t===Wt.Param||t===Wt.ParamRegExp||t===Wt.ParamRegExpEnd?(r.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),r.push({type:Ss.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function h(){c+=l}for(;a<n.length;){if(l=n[a++],l==="\\"&&t!==Wt.ParamRegExp){i=t,t=Wt.EscapeNext;continue}switch(t){case Wt.Static:l==="/"?(c&&f(),o()):l===":"?(f(),t=Wt.Param):h();break;case Wt.EscapeNext:h(),t=i;break;case Wt.Param:l==="("?t=Wt.ParamRegExp:P0.test(l)?h():(f(),t=Wt.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case Wt.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:t=Wt.ParamRegExpEnd:u+=l;break;case Wt.ParamRegExpEnd:f(),t=Wt.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,u="";break;default:e("Unknown state");break}}return t===Wt.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),f(),o(),s}const Qd="[^/]+?",D0={sensitive:!1,strict:!1,start:!0,end:!0};var fn=function(n){return n[n._multiplier=10]="_multiplier",n[n.Root=90]="Root",n[n.Segment=40]="Segment",n[n.SubSegment=30]="SubSegment",n[n.Static=40]="Static",n[n.Dynamic=20]="Dynamic",n[n.BonusCustomRegExp=10]="BonusCustomRegExp",n[n.BonusWildcard=-50]="BonusWildcard",n[n.BonusRepeatable=-20]="BonusRepeatable",n[n.BonusOptional=-8]="BonusOptional",n[n.BonusStrict=.7000000000000001]="BonusStrict",n[n.BonusCaseSensitive=.25]="BonusCaseSensitive",n}(fn||{});const L0=/[.+*?^${}()[\]/\\]/g;function N0(n,e){const t=xt({},D0,e),i=[];let s=t.start?"^":"";const r=[];for(const c of n){const u=c.length?[]:[fn.Root];t.strict&&!c.length&&(s+="/");for(let f=0;f<c.length;f++){const h=c[f];let g=fn.Segment+(t.sensitive?fn.BonusCaseSensitive:0);if(h.type===Ss.Static)f||(s+="/"),s+=h.value.replace(L0,"\\$&"),g+=fn.Static;else if(h.type===Ss.Param){const{value:_,repeatable:v,optional:m,regexp:p}=h;r.push({name:_,repeatable:v,optional:m});const b=p||Qd;if(b!==Qd){g+=fn.BonusCustomRegExp;try{`${b}`}catch(M){throw new Error(`Invalid custom RegExp for param "${_}" (${b}): `+M.message)}}let y=v?`((?:${b})(?:/(?:${b}))*)`:`(${b})`;f||(y=m&&c.length<2?`(?:/${y})`:"/"+y),m&&(y+="?"),s+=y,g+=fn.Dynamic,m&&(g+=fn.BonusOptional),v&&(g+=fn.BonusRepeatable),b===".*"&&(g+=fn.BonusWildcard)}u.push(g)}i.push(u)}if(t.strict&&t.end){const c=i.length-1;i[c][i[c].length-1]+=fn.BonusStrict}t.strict||(s+="/?"),t.end?s+="$":t.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,t.sensitive?"":"i");function a(c){const u=c.match(o),f={};if(!u)return null;for(let h=1;h<u.length;h++){const g=u[h]||"",_=r[h-1];f[_.name]=g&&_.repeatable?g.split("/"):g}return f}function l(c){let u="",f=!1;for(const h of n){(!f||!u.endsWith("/"))&&(u+="/"),f=!1;for(const g of h)if(g.type===Ss.Static)u+=g.value;else if(g.type===Ss.Param){const{value:_,repeatable:v,optional:m}=g,p=_ in c?c[_]:"";if(jn(p)&&!v)throw new Error(`Provided param "${_}" is an array but it is not repeatable (* or + modifiers)`);const b=jn(p)?p.join("/"):p;if(!b)if(m)h.length<2&&(u.endsWith("/")?u=u.slice(0,-1):f=!0);else throw new Error(`Missing required param "${_}"`);u+=b}}return u||"/"}return{re:o,score:i,keys:r,parse:a,stringify:l}}function U0(n,e){let t=0;for(;t<n.length&&t<e.length;){const i=e[t]-n[t];if(i)return i;t++}return n.length<e.length?n.length===1&&n[0]===fn.Static+fn.Segment?-1:1:n.length>e.length?e.length===1&&e[0]===fn.Static+fn.Segment?1:-1:0}function Zp(n,e){let t=0;const i=n.score,s=e.score;for(;t<i.length&&t<s.length;){const r=U0(i[t],s[t]);if(r)return r;t++}if(Math.abs(s.length-i.length)===1){if(ef(i))return 1;if(ef(s))return-1}return s.length-i.length}function ef(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const F0={strict:!1,end:!0,sensitive:!1};function k0(n,e,t){const i=N0(I0(n.path),t),s=xt(i,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function O0(n,e){const t=[],i=new Map;e=Xd(F0,e);function s(f){return i.get(f)}function r(f,h,g){const _=!g,v=nf(f);v.aliasOf=g&&g.record;const m=Xd(e,f),p=[v];if("alias"in f){const M=typeof f.alias=="string"?[f.alias]:f.alias;for(const w of M)p.push(nf(xt({},v,{components:g?g.record.components:v.components,path:w,aliasOf:g?g.record:v})))}let b,y;for(const M of p){const{path:w}=M;if(h&&w[0]!=="/"){const A=h.record.path,T=A[A.length-1]==="/"?"":"/";M.path=h.record.path+(w&&T+w)}if(b=k0(M,h,m),g?g.alias.push(b):(y=y||b,y!==b&&y.alias.push(b),_&&f.name&&!sf(b)&&o(f.name)),Jp(b)&&l(b),v.children){const A=v.children;for(let T=0;T<A.length;T++)r(A[T],b,g&&g.children[T])}g=g||b}return y?()=>{o(y)}:$r}function o(f){if(jp(f)){const h=i.get(f);h&&(i.delete(f),t.splice(t.indexOf(h),1),h.children.forEach(o),h.alias.forEach(o))}else{const h=t.indexOf(f);h>-1&&(t.splice(h,1),f.record.name&&i.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return t}function l(f){const h=z0(f,t);t.splice(h,0,f),f.record.name&&!sf(f)&&i.set(f.record.name,f)}function c(f,h){let g,_={},v,m;if("name"in f&&f.name){if(g=i.get(f.name),!g)throw ar(Ot.MATCHER_NOT_FOUND,{location:f});m=g.record.name,_=xt(tf(h.params,g.keys.filter(y=>!y.optional).concat(g.parent?g.parent.keys.filter(y=>y.optional):[]).map(y=>y.name)),f.params&&tf(f.params,g.keys.map(y=>y.name))),v=g.stringify(_)}else if(f.path!=null)v=f.path,g=t.find(y=>y.re.test(v)),g&&(_=g.parse(v),m=g.record.name);else{if(g=h.name?i.get(h.name):t.find(y=>y.re.test(h.path)),!g)throw ar(Ot.MATCHER_NOT_FOUND,{location:f,currentLocation:h});m=g.record.name,_=xt({},h.params,f.params),v=g.stringify(_)}const p=[];let b=g;for(;b;)p.unshift(b.record),b=b.parent;return{name:m,path:v,params:_,matched:p,meta:V0(p)}}n.forEach(f=>r(f));function u(){t.length=0,i.clear()}return{addRoute:r,resolve:c,removeRoute:o,clearRoutes:u,getRoutes:a,getRecordMatcher:s}}function tf(n,e){const t={};for(const i of e)i in n&&(t[i]=n[i]);return t}function nf(n){const e={path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:n.aliasOf,beforeEnter:n.beforeEnter,props:B0(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function B0(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const i in n.components)e[i]=typeof t=="object"?t[i]:t;return e}function sf(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function V0(n){return n.reduce((e,t)=>xt(e,t.meta),{})}function z0(n,e){let t=0,i=e.length;for(;t!==i;){const r=t+i>>1;Zp(n,e[r])<0?i=r:t=r+1}const s=H0(n);return s&&(i=e.lastIndexOf(s,i-1)),i}function H0(n){let e=n;for(;e=e.parent;)if(Jp(e)&&Zp(n,e)===0)return e}function Jp({record:n}){return!!(n.name||n.components&&Object.keys(n.components).length||n.redirect)}function rf(n){const e=An(za),t=An(Au),i=ot(()=>{const l=_e(n.to);return e.resolve(l)}),s=ot(()=>{const{matched:l}=i.value,{length:c}=l,u=l[c-1],f=t.matched;if(!u||!f.length)return-1;const h=f.findIndex(or.bind(null,u));if(h>-1)return h;const g=of(l[c-2]);return c>1&&of(u)===g&&f[f.length-1].path!==g?f.findIndex(or.bind(null,l[c-2])):h}),r=ot(()=>s.value>-1&&X0(t.params,i.value.params)),o=ot(()=>s.value>-1&&s.value===t.matched.length-1&&qp(t.params,i.value.params));function a(l={}){if(W0(l)){const c=e[_e(n.replace)?"replace":"push"](_e(n.to)).catch($r);return n.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:i,href:ot(()=>i.value.href),isActive:r,isExactActive:o,navigate:a}}function G0(n){return n.length===1?n[0]:n}const $0=tt({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:rf,setup(n,{slots:e}){const t=ro(rf(n)),{options:i}=An(za),s=ot(()=>({[af(n.activeClass,i.linkActiveClass,"router-link-active")]:t.isActive,[af(n.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const r=e.default&&G0(e.default(t));return n.custom?r:Rp("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},r)}}}),Qr=$0;function W0(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function X0(n,e){for(const t in e){const i=e[t],s=n[t];if(typeof i=="string"){if(i!==s)return!1}else if(!jn(s)||s.length!==i.length||i.some((r,o)=>r.valueOf()!==s[o].valueOf()))return!1}return!0}function of(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const af=(n,e,t)=>n??e??t,q0=tt({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const i=An(fc),s=ot(()=>n.route||i.value),r=An(Zd,0),o=ot(()=>{let c=_e(r);const{matched:u}=s.value;let f;for(;(f=u[c])&&!f.components;)c++;return c}),a=ot(()=>s.value.matched[o.value]);Zo(Zd,ot(()=>o.value+1)),Zo(M0,a),Zo(fc,s);const l=Q();return Un(()=>[l.value,a.value,n.name],([c,u,f],[h,g,_])=>{u&&(u.instances[f]=c,g&&g!==u&&c&&c===h&&(u.leaveGuards.size||(u.leaveGuards=g.leaveGuards),u.updateGuards.size||(u.updateGuards=g.updateGuards))),c&&u&&(!g||!or(u,g)||!h)&&(u.enterCallbacks[f]||[]).forEach(v=>v(c))},{flush:"post"}),()=>{const c=s.value,u=n.name,f=a.value,h=f&&f.components[u];if(!h)return lf(t.default,{Component:h,route:c});const g=f.props[u],_=g?g===!0?c.params:typeof g=="function"?g(c):g:null,m=Rp(h,xt({},_,e,{onVnodeUnmounted:p=>{p.component.isUnmounted&&(f.instances[u]=null)},ref:l}));return lf(t.default,{Component:m,route:c})||m}}});function lf(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const j0=q0;function Y0(n){const e=O0(n.routes,n),t=n.parseQuery||S0,i=n.stringifyQuery||Kd,s=n.history,r=br(),o=br(),a=br(),l=Rg(Oi);let c=Oi;Ys&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=ll.bind(null,X=>""+X),f=ll.bind(null,s0),h=ll.bind(null,Jr);function g(X,ce){let me,he;return jp(X)?(me=e.getRecordMatcher(X),he=ce):he=X,e.addRoute(he,me)}function _(X){const ce=e.getRecordMatcher(X);ce&&e.removeRoute(ce)}function v(){return e.getRoutes().map(X=>X.record)}function m(X){return!!e.getRecordMatcher(X)}function p(X,ce){if(ce=xt({},ce||l.value),typeof X=="string"){const q=cl(t,X,ce.path),H=e.resolve({path:q.path},ce),D=s.createHref(q.fullPath);return xt(q,H,{params:h(H.params),hash:Jr(q.hash),redirectedFrom:void 0,href:D})}let me;if(X.path!=null)me=xt({},X,{path:cl(t,X.path,ce.path).path});else{const q=xt({},X.params);for(const H in q)q[H]==null&&delete q[H];me=xt({},X,{params:f(q)}),ce.params=f(ce.params)}const he=e.resolve(me,ce),Fe=X.hash||"";he.params=u(h(he.params));const k=a0(i,xt({},X,{hash:t0(Fe),path:he.path})),z=s.createHref(k);return xt({fullPath:k,hash:Fe,query:i===Kd?b0(X.query):X.query||{}},he,{redirectedFrom:void 0,href:z})}function b(X){return typeof X=="string"?cl(t,X,l.value.path):xt({},X)}function y(X,ce){if(c!==X)return ar(Ot.NAVIGATION_CANCELLED,{from:ce,to:X})}function M(X){return T(X)}function w(X){return M(xt(b(X),{replace:!0}))}function A(X,ce){const me=X.matched[X.matched.length-1];if(me&&me.redirect){const{redirect:he}=me;let Fe=typeof he=="function"?he(X,ce):he;return typeof Fe=="string"&&(Fe=Fe.includes("?")||Fe.includes("#")?Fe=b(Fe):{path:Fe},Fe.params={}),xt({query:X.query,hash:X.hash,params:Fe.path!=null?{}:X.params},Fe)}}function T(X,ce){const me=c=p(X),he=l.value,Fe=X.state,k=X.force,z=X.replace===!0,q=A(me,he);if(q)return T(xt(b(q),{state:typeof q=="object"?xt({},Fe,q.state):Fe,force:k,replace:z}),ce||me);const H=me;H.redirectedFrom=ce;let D;return!k&&l0(i,he,me)&&(D=ar(Ot.NAVIGATION_DUPLICATED,{to:H,from:he}),oe(he,he,!0,!1)),(D?Promise.resolve(D):E(H,he)).catch(W=>vi(W)?vi(W,Ot.NAVIGATION_GUARD_REDIRECT)?W:J(W):F(W,H,he)).then(W=>{if(W){if(vi(W,Ot.NAVIGATION_GUARD_REDIRECT))return T(xt({replace:z},b(W.to),{state:typeof W.to=="object"?xt({},Fe,W.to.state):Fe,force:k}),ce||H)}else W=O(H,he,!0,z,Fe);return U(H,he,W),W})}function R(X,ce){const me=y(X,ce);return me?Promise.reject(me):Promise.resolve()}function x(X){const ce=rt.values().next().value;return ce&&typeof ce.runWithContext=="function"?ce.runWithContext(X):X()}function E(X,ce){let me;const[he,Fe,k]=E0(X,ce);me=dl(he.reverse(),"beforeRouteLeave",X,ce);for(const q of he)q.leaveGuards.forEach(H=>{me.push(Ki(H,X,ce))});const z=R.bind(null,X,ce);return me.push(z),de(me).then(()=>{me=[];for(const q of r.list())me.push(Ki(q,X,ce));return me.push(z),de(me)}).then(()=>{me=dl(Fe,"beforeRouteUpdate",X,ce);for(const q of Fe)q.updateGuards.forEach(H=>{me.push(Ki(H,X,ce))});return me.push(z),de(me)}).then(()=>{me=[];for(const q of k)if(q.beforeEnter)if(jn(q.beforeEnter))for(const H of q.beforeEnter)me.push(Ki(H,X,ce));else me.push(Ki(q.beforeEnter,X,ce));return me.push(z),de(me)}).then(()=>(X.matched.forEach(q=>q.enterCallbacks={}),me=dl(k,"beforeRouteEnter",X,ce,x),me.push(z),de(me))).then(()=>{me=[];for(const q of o.list())me.push(Ki(q,X,ce));return me.push(z),de(me)}).catch(q=>vi(q,Ot.NAVIGATION_CANCELLED)?q:Promise.reject(q))}function U(X,ce,me){a.list().forEach(he=>x(()=>he(X,ce,me)))}function O(X,ce,me,he,Fe){const k=y(X,ce);if(k)return k;const z=ce===Oi,q=Ys?history.state:{};me&&(he||z?s.replace(X.fullPath,xt({scroll:z&&q&&q.scroll},Fe)):s.push(X.fullPath,Fe)),l.value=X,oe(X,ce,me,z),J()}let j;function ee(){j||(j=s.listen((X,ce,me)=>{if(!lt.listening)return;const he=p(X),Fe=A(he,lt.currentRoute.value);if(Fe){T(xt(Fe,{replace:!0,force:!0}),he).catch($r);return}c=he;const k=l.value;Ys&&g0(Yd(k.fullPath,me.delta),Va()),E(he,k).catch(z=>vi(z,Ot.NAVIGATION_ABORTED|Ot.NAVIGATION_CANCELLED)?z:vi(z,Ot.NAVIGATION_GUARD_REDIRECT)?(T(xt(b(z.to),{force:!0}),he).then(q=>{vi(q,Ot.NAVIGATION_ABORTED|Ot.NAVIGATION_DUPLICATED)&&!me.delta&&me.type===uc.pop&&s.go(-1,!1)}).catch($r),Promise.reject()):(me.delta&&s.go(-me.delta,!1),F(z,he,k))).then(z=>{z=z||O(he,k,!1),z&&(me.delta&&!vi(z,Ot.NAVIGATION_CANCELLED)?s.go(-me.delta,!1):me.type===uc.pop&&vi(z,Ot.NAVIGATION_ABORTED|Ot.NAVIGATION_DUPLICATED)&&s.go(-1,!1)),U(he,k,z)}).catch($r)}))}let te=br(),K=br(),I;function F(X,ce,me){J(X);const he=K.list();return he.length?he.forEach(Fe=>Fe(X,ce,me)):console.error(X),Promise.reject(X)}function $(){return I&&l.value!==Oi?Promise.resolve():new Promise((X,ce)=>{te.add([X,ce])})}function J(X){return I||(I=!X,ee(),te.list().forEach(([ce,me])=>X?me(X):ce()),te.reset()),X}function oe(X,ce,me,he){const{scrollBehavior:Fe}=n;if(!Ys||!Fe)return Promise.resolve();const k=!me&&v0(Yd(X.fullPath,0))||(he||!me)&&history.state&&history.state.scroll||null;return ao().then(()=>Fe(X,ce,k)).then(z=>z&&m0(z)).catch(z=>F(z,X,ce))}const we=X=>s.go(X);let De;const rt=new Set,lt={currentRoute:l,listening:!0,addRoute:g,removeRoute:_,clearRoutes:e.clearRoutes,hasRoute:m,getRoutes:v,resolve:p,options:n,push:M,replace:w,go:we,back:()=>we(-1),forward:()=>we(1),beforeEach:r.add,beforeResolve:o.add,afterEach:a.add,onError:K.add,isReady:$,install(X){X.component("RouterLink",Qr),X.component("RouterView",j0),X.config.globalProperties.$router=lt,Object.defineProperty(X.config.globalProperties,"$route",{enumerable:!0,get:()=>_e(l)}),Ys&&!De&&l.value===Oi&&(De=!0,M(s.location).catch(he=>{}));const ce={};for(const he in Oi)Object.defineProperty(ce,he,{get:()=>l.value[he],enumerable:!0});X.provide(za,lt),X.provide(Au,Gh(ce)),X.provide(fc,l);const me=X.unmount;rt.add(X),X.unmount=function(){rt.delete(X),rt.size<1&&(c=Oi,j&&j(),j=null,l.value=Oi,De=!1,I=!1),me()}}};function de(X){return X.reduce((ce,me)=>ce.then(()=>x(me)),Promise.resolve())}return lt}function Ha(){return An(za)}function Cu(n){return An(Au)}const K0="/assets/newMusic-CN0p2ACZ.mp3",Z0="/assets/fart-with-reverb-C8ugyAjD.mp3",J0="/goose.png";function Q0(n){const e=n.match(/^<(a?):([^:]+):(\d+)>$/);if(e){const t=e[1]==="a",i=e[2],s=e[3];return{type:t?"discord_animated":"discord_static",name:i,id:s,url:`https://cdn.discordapp.com/emojis/${s}.${t?"gif":"png"}`,original:n}}return{type:"unicode",name:n,original:n}}const ex=["src","alt"],tx=tt({__name:"EmojiRenderer",props:{emoji:{},size:{}},setup(n){const e=n,t=ot(()=>Q0(e.emoji)),i=ot(()=>e.size||32);return(s,r)=>t.value.type==="discord_static"||t.value.type==="discord_animated"?(N(),V("img",{key:0,src:t.value.url,alt:t.value.name,class:"discord-emoji",style:Dt({width:`${i.value}px`,height:`${i.value}px`}),loading:"lazy"},null,12,ex)):n.emoji==="🪿"?(N(),V("img",{key:1,src:J0,alt:"goose",class:"goose-emoji",style:Dt({width:`${i.value}px`,height:`${i.value}px`}),loading:"lazy"},null,4)):(N(),V("span",{key:2,class:"unicode-emoji",style:Dt({fontSize:`${i.value}px`})},B(n.emoji),5))}}),ct=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t},Qp=ct(tx,[["__scopeId","data-v-832144c4"]]);function nx(){const n=(i,s)=>{const r=document.getElementById(i);r&&(r.pause(),r.currentTime=(s==null?void 0:s.startTime)??0,(s==null?void 0:s.volume)!==void 0&&(r.volume=Math.min(Math.max(s.volume,0),1)),r.play())};return{playSound:n,playFart:i=>{n("fartSound",{volume:i})},toggleMusic:i=>{const s=document.getElementById("newMusic");s&&(i?s.play():s.pause())}}}function ix(){const n=Q(""),e=Q(!0),t=async()=>{try{e.value=!0;const i=await fetch("https://api.thecatapi.com/v1/images/search?size=med");if(!i.ok){console.error("Failed to fetch cat:",i.status);return}const s=await i.json();s&&s.length>0&&s[0].url?n.value=s[0].url:console.error("Invalid cat API response:",s)}catch(i){console.error("Error fetching cat:",i)}finally{e.value=!1}};return Ct(()=>{t()}),{catImage:n,catLoading:e,fetchNewCat:t}}const sx=/\{[^{}]+\}/g,rx=()=>{var n,e;return typeof process=="object"&&Number.parseInt((e=(n=process==null?void 0:process.versions)==null?void 0:n.node)==null?void 0:e.substring(0,2))>=18&&process.versions.undici};function ox(){return Math.random().toString(36).slice(2,11)}function ax(n){let{baseUrl:e="",Request:t=globalThis.Request,fetch:i=globalThis.fetch,querySerializer:s,bodySerializer:r,headers:o,requestInitExt:a=void 0,...l}={...n};a=rx()?a:void 0,e=df(e);const c=[];async function u(f,h){const{baseUrl:g,fetch:_=i,Request:v=t,headers:m,params:p={},parseAs:b="json",querySerializer:y,bodySerializer:M=r??cx,body:w,middleware:A=[],...T}=h||{};let R=e;g&&(R=df(g)??e);let x=typeof s=="function"?s:cf(s);y&&(x=typeof y=="function"?y:cf({...typeof s=="object"?s:{},...y}));const E=w===void 0?void 0:M(w,uf(o,m,p.header)),U=uf(E===void 0||E instanceof FormData?{}:{"Content-Type":"application/json"},o,m,p.header),O=[...c,...A],j={redirect:"follow",...l,...T,body:E,headers:U};let ee,te,K=new v(ux(f,{baseUrl:R,params:p,querySerializer:x}),j),I;for(const $ in T)$ in K||(K[$]=T[$]);if(O.length){ee=ox(),te=Object.freeze({baseUrl:R,fetch:_,parseAs:b,querySerializer:x,bodySerializer:M});for(const $ of O)if($&&typeof $=="object"&&typeof $.onRequest=="function"){const J=await $.onRequest({request:K,schemaPath:f,params:p,options:te,id:ee});if(J)if(J instanceof v)K=J;else if(J instanceof Response){I=J;break}else throw new Error("onRequest: must return new Request() or Response() when modifying the request")}}if(!I){try{I=await _(K,a)}catch($){let J=$;if(O.length)for(let oe=O.length-1;oe>=0;oe--){const we=O[oe];if(we&&typeof we=="object"&&typeof we.onError=="function"){const De=await we.onError({request:K,error:J,schemaPath:f,params:p,options:te,id:ee});if(De){if(De instanceof Response){J=void 0,I=De;break}if(De instanceof Error){J=De;continue}throw new Error("onError: must return new Response() or instance of Error")}}}if(J)throw J}if(O.length)for(let $=O.length-1;$>=0;$--){const J=O[$];if(J&&typeof J=="object"&&typeof J.onResponse=="function"){const oe=await J.onResponse({request:K,response:I,schemaPath:f,params:p,options:te,id:ee});if(oe){if(!(oe instanceof Response))throw new Error("onResponse: must return new Response() when modifying the response");I=oe}}}}if(I.status===204||K.method==="HEAD"||I.headers.get("Content-Length")==="0")return I.ok?{data:void 0,response:I}:{error:void 0,response:I};if(I.ok)return b==="stream"?{data:I.body,response:I}:{data:await I[b](),response:I};let F=await I.text();try{F=JSON.parse(F)}catch{}return{error:F,response:I}}return{request(f,h,g){return u(h,{...g,method:f.toUpperCase()})},GET(f,h){return u(f,{...h,method:"GET"})},PUT(f,h){return u(f,{...h,method:"PUT"})},POST(f,h){return u(f,{...h,method:"POST"})},DELETE(f,h){return u(f,{...h,method:"DELETE"})},OPTIONS(f,h){return u(f,{...h,method:"OPTIONS"})},HEAD(f,h){return u(f,{...h,method:"HEAD"})},PATCH(f,h){return u(f,{...h,method:"PATCH"})},TRACE(f,h){return u(f,{...h,method:"TRACE"})},use(...f){for(const h of f)if(h){if(typeof h!="object"||!("onRequest"in h||"onResponse"in h||"onError"in h))throw new Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");c.push(h)}},eject(...f){for(const h of f){const g=c.indexOf(h);g!==-1&&c.splice(g,1)}}}}function Ga(n,e,t){if(e==null)return"";if(typeof e=="object")throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");return`${n}=${(t==null?void 0:t.allowReserved)===!0?e:encodeURIComponent(e)}`}function em(n,e,t){if(!e||typeof e!="object")return"";const i=[],s={simple:",",label:".",matrix:";"}[t.style]||"&";if(t.style!=="deepObject"&&t.explode===!1){for(const a in e)i.push(a,t.allowReserved===!0?e[a]:encodeURIComponent(e[a]));const o=i.join(",");switch(t.style){case"form":return`${n}=${o}`;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return o}}for(const o in e){const a=t.style==="deepObject"?`${n}[${o}]`:o;i.push(Ga(a,e[o],t))}const r=i.join(s);return t.style==="label"||t.style==="matrix"?`${s}${r}`:r}function tm(n,e,t){if(!Array.isArray(e))return"";if(t.explode===!1){const r={form:",",spaceDelimited:"%20",pipeDelimited:"|"}[t.style]||",",o=(t.allowReserved===!0?e:e.map(a=>encodeURIComponent(a))).join(r);switch(t.style){case"simple":return o;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return`${n}=${o}`}}const i={simple:",",label:".",matrix:";"}[t.style]||"&",s=[];for(const r of e)t.style==="simple"||t.style==="label"?s.push(t.allowReserved===!0?r:encodeURIComponent(r)):s.push(Ga(n,r,t));return t.style==="label"||t.style==="matrix"?`${i}${s.join(i)}`:s.join(i)}function cf(n){return function(t){const i=[];if(t&&typeof t=="object")for(const s in t){const r=t[s];if(r!=null){if(Array.isArray(r)){if(r.length===0)continue;i.push(tm(s,r,{style:"form",explode:!0,...n==null?void 0:n.array,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}if(typeof r=="object"){i.push(em(s,r,{style:"deepObject",explode:!0,...n==null?void 0:n.object,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}i.push(Ga(s,r,n))}}return i.join("&")}}function lx(n,e){let t=n;for(const i of n.match(sx)??[]){let s=i.substring(1,i.length-1),r=!1,o="simple";if(s.endsWith("*")&&(r=!0,s=s.substring(0,s.length-1)),s.startsWith(".")?(o="label",s=s.substring(1)):s.startsWith(";")&&(o="matrix",s=s.substring(1)),!e||e[s]===void 0||e[s]===null)continue;const a=e[s];if(Array.isArray(a)){t=t.replace(i,tm(s,a,{style:o,explode:r}));continue}if(typeof a=="object"){t=t.replace(i,em(s,a,{style:o,explode:r}));continue}if(o==="matrix"){t=t.replace(i,`;${Ga(s,a)}`);continue}t=t.replace(i,o==="label"?`.${encodeURIComponent(a)}`:encodeURIComponent(a))}return t}function cx(n,e){return n instanceof FormData?n:e&&(e.get instanceof Function?e.get("Content-Type")??e.get("content-type"):e["Content-Type"]??e["content-type"])==="application/x-www-form-urlencoded"?new URLSearchParams(n).toString():JSON.stringify(n)}function ux(n,e){var s;let t=`${e.baseUrl}${n}`;(s=e.params)!=null&&s.path&&(t=lx(t,e.params.path));let i=e.querySerializer(e.params.query??{});return i.startsWith("?")&&(i=i.substring(1)),i&&(t+=`?${i}`),t}function uf(...n){const e=new Headers;for(const t of n){if(!t||typeof t!="object")continue;const i=t instanceof Headers?t.entries():Object.entries(t);for(const[s,r]of i)if(r===null)e.delete(s);else if(Array.isArray(r))for(const o of r)e.append(s,o);else r!==void 0&&e.set(s,r)}return e}function df(n){return n.endsWith("/")?n.substring(0,n.length-1):n}function nm(){return typeof window<"u"&&window.__API_BASE_URL__?window.__API_BASE_URL__:""}const Bt=ax({baseUrl:nm()||"/api",headers:{"Content-Type":"application/json"}});class dx{async getHealth(){const{data:e,error:t}=await Bt.GET("/health",{});if(t)throw new Error(t.error||"Failed to get health status");return e}async getRankings(){const{data:e,error:t}=await Bt.GET("/rankings",{});if(t)throw new Error(t.error||"Failed to get rankings");return(e==null?void 0:e.rankings)||[]}async getQuote(){const{data:e,error:t}=await Bt.GET("/quote",{});if(t)throw new Error(t.error||"Failed to get quote");return e==null?void 0:e.quote}async detectGender(e,t){const{data:i,error:s}=await Bt.POST("/gender",{body:{name:e,country:t}});if(s)throw new Error(s.error||"Failed to detect gender");return i}async analyzePhrenology(e){const{data:t,error:i}=await Bt.POST("/phrenology",{body:{name:e}});if(i)throw new Error(i.error||"Failed to analyze phrenology");return t}}const Ru=new dx;function fx(){const n=Q([]),e=Q(!1);return{rankings:n,loading:e,loadRankings:async()=>{try{e.value=!0,n.value=await Ru.getRankings()}catch(s){console.error("Failed to load rankings:",s)}finally{e.value=!1}},getTrendClass:s=>{const r=["trend-up","trend-down","trend-same"];return r[s%r.length]}}}const na={rankings:!0,cat:!1,feed:!1,digitalGoose:!0,tachometer:!0,coolnessPanel:!0},Eo=["rankings","cat"],hx=()=>{if(typeof window>"u")return na;try{const n=localStorage.getItem("panels");if(n)return{...na,...JSON.parse(n)}}catch(n){console.error("Failed to load panels from localStorage:",n)}return na},px=n=>{if(!(typeof window>"u"))try{localStorage.setItem("panels",JSON.stringify(n))}catch(e){console.error("Failed to save panels to localStorage:",e)}};function mx(n){const e=Q({...na,...n}),t=hx();e.value={...e.value,...t},Un(e,a=>{px(a)},{deep:!0});const i=()=>typeof window>"u"?!1:window.innerWidth<=768;return{panels:e,togglePanel:a=>{const l=e.value[a];i()&&!l&&Eo.includes(a)&&Eo.forEach(c=>{c!==a&&(e.value[c]=!1)}),e.value[a]=!l},openPanel:a=>{i()&&Eo.includes(a)&&Eo.forEach(l=>{l!==a&&(e.value[l]=!1)}),e.value[a]=!0},closePanel:a=>{e.value[a]=!1}}}const Qt=$_("app",()=>{const n=nx(),e=ix(),t=fx(),i=mx(),s=localStorage.getItem("darkMode"),r=localStorage.getItem("darkerMode"),o=Q(s==="true"),a=Q(r==="true"),l=Q(!1),c=Q(0),u=Q(50),f=Q(!1),h=Q(!1),g=Q("home"),_=Q(["Stay curious, keep asking questions.","The best way to predict future is to create it.","Every moment is a fresh beginning.","Chaos is just order waiting to be discovered.","Your potential is endless.","Keep being weird.","Normal is overrated.","Be energy you want to see in world."]),v=Q([]),m=ot(()=>_.value[c.value]),p=async()=>{const J=Math.floor(Math.random()*3)+3;for(let oe=0;oe<J;oe++)await w()},b=()=>{!o.value&&!a.value?(o.value=!0,a.value=!1):o.value&&!a.value?(o.value=!0,a.value=!0):(o.value=!1,a.value=!1),localStorage.setItem("darkMode",o.value.toString()),localStorage.setItem("darkerMode",a.value.toString()),document.body.classList.toggle("dark",o.value),document.body.classList.toggle("darker",a.value)},y=()=>{a.value=!a.value,a.value&&(o.value=!0),localStorage.setItem("darkMode",o.value.toString()),localStorage.setItem("darkerMode",a.value.toString()),document.body.classList.toggle("dark",o.value),document.body.classList.toggle("darker",a.value)},M=()=>{l.value=!l.value,n.toggleMusic(l.value)},w=async()=>{try{const oe=await(await fetch("https://api.adviceslip.com/advice")).json();if(oe.slip&&oe.slip.advice){const we=oe.slip.advice;return v.value.includes(we)||(v.value.push(we),_.value.push(we)),we}}catch(J){console.error("Failed to fetch advice:",J)}return null},A=async()=>{if(Math.random()<.3&&await w()){c.value=_.value.length-1;return}c.value=(c.value+1)%_.value.length},T=()=>{const J=Math.floor(Math.random()*100),oe=J/50;n.playFart(oe),setTimeout(()=>{h.value=!0},300),u.value=J},R=()=>{n.playFart(1),setTimeout(()=>{h.value=!0},300)},x=()=>{h.value=!1},E=()=>{f.value=!1},U=J=>{g.value=J},O=()=>{const J=document.createElement("div");J.className="heart";const oe=u.value;if(oe>60&&Math.random()<(oe-50)/50){const De=["🍄","🦠","🟢","🟢","🥬","🌿"];J.innerHTML=De[Math.floor(Math.random()*De.length)]}else Math.random()<.15?J.innerHTML="🥚":J.innerHTML=["💖","💕","💗","💓","❤️"][Math.floor(Math.random()*5)];J.style.left=Math.random()*100+"vw",J.style.animationDuration=Math.random()*3+3+"s";const we=window.heartSize||20;J.style.fontSize=we+"px",window.heartSize=we+1,document.body.appendChild(J),J.addEventListener("animationend",()=>{J.remove()})},j=27,ee=5,te=10,K=()=>{if(document.querySelectorAll(".mold-circle").length>=j)return;const oe=document.createElement("div");oe.className="mold-circle";const we=Math.random()*150+50;oe.style.width=we+"px",oe.style.height=we+"px",oe.style.position="absolute",oe.style.left=Math.random()*100+"%",oe.style.top=Math.random()*100+"%",oe.style.transform="translate(-50%, -50%)",oe.style.pointerEvents="none",oe.style.userSelect="none";const De=Math.random()*3+2;oe.style.filter=`blur(${De}px)`;const rt=["white","pale grey","pale green","pastel green","desaturated dark green","desaturated dark blue"],lt=Math.random()*.09+.03,de=rt[Math.floor(Math.random()*rt.length)],X=rt[Math.floor(Math.random()*rt.length)],ce={white:{r:255,g:255,b:255},"pale grey":{r:220,g:220,b:220},"pale green":{r:200,g:230,b:200},"pastel green":{r:168,g:224,b:99},"desaturated dark green":{r:86,g:171,b:47},"desaturated dark blue":{r:70,g:100,b:130}},me=ce[de],he=ce[X],Fe=(pe,fe)=>{const ge=window.innerWidth/2;return lt*Math.max(0,1-pe/ge)*fe},k=(pe,fe)=>{const ge=Fe(pe,fe);oe.style.background=`radial-gradient(circle, rgba(${me.r}, ${me.g}, ${me.b}, ${ge}) 0%, rgba(${he.r}, ${he.g}, ${he.b}, ${ge}) 100%)`},z=Math.random()*1e4+1e4;let q=0,H=Date.now();k(we,0),oe.style.opacity="0",document.body.appendChild(oe);const D=setInterval(()=>{const pe=Date.now()-H;q=Math.min(1,pe/z),oe.style.opacity=q.toString(),k(we,q),q>=1&&clearInterval(D)},100);let W=we;const L=Math.random()*1.5+.2,xe=setInterval(()=>{W+=L,oe.style.width=W+"px",oe.style.height=W+"px",q>=1&&k(W,1);const pe=window.innerWidth/2;W>=pe&&(clearInterval(xe),clearInterval(D),oe.parentNode&&(oe.remove(),K()))},100)},I=()=>{const J=Math.floor(Math.random()*(te-ee+1))+ee;for(let oe=0;oe<J;oe++)setTimeout(()=>K(),oe*200)},F=()=>{const J=()=>{K();const oe=Math.random()*15e3+5e3;setTimeout(J,oe)};setTimeout(J,2e3)},$=()=>{const J=u.value,oe=Math.min(.3,J/100*.3);document.body.style.backgroundColor=`rgba(168, 224, 99, ${oe})`,window.moldLevel=J};return{darkMode:o,darkerMode:a,musicPlaying:l,currentQuoteIndex:c,tachValue:u,mikaModalOpen:f,confirmationOpen:h,currentRoute:g,quotes:_,adviceSlips:v,currentQuote:m,panels:i.panels,catImage:e.catImage,catLoading:e.catLoading,rankings:t.rankings,rankingsLoading:t.loading,toggleDarkMode:b,toggleDarkerMode:y,toggleMusic:M,togglePanel:i.togglePanel,nextQuote:A,preloadAdvice:p,nextCat:e.fetchNewCat,onFart:T,onTurnMe:R,closeConfirmation:x,closeMikaModal:E,onRouteChange:U,loadRankings:t.loadRankings,createHeart:O,initMoldCircles:I,createMoldCircle:K,startMoldSpawner:F,updateMoldEffects:$,getTrendClass:t.getTrendClass}}),gx={class:"rankings-list"},vx={class:"rank-avatar"},_x={class:"rank-score"},xx=tt({__name:"RankingsPanel",props:{isOpen:{type:Boolean},currentRoute:{},rankings:{}},emits:["toggle"],setup(n,{emit:e}){const t=e;Qt();const i=computed(()=>currentRoute==="home"),s=()=>{t("toggle")};return(r,o)=>(N(),V("div",{class:Be(["rankings-panel",{collapsed:!n.isOpen||!_e(i)}])},[d("div",{class:"rankings-header"},[o[0]||(o[0]=d("h3",null,"👻 Coolness Rankings",-1)),d("button",{class:"rankings-close",onClick:s},"✕")]),d("div",gx,[(N(!0),V($e,null,et(n.rankings,(a,l)=>(N(),V("div",{key:l,class:"rank-item"},[d("div",vx,[pt(Qp,{emoji:a.avatar,size:32},null,8,["emoji"])]),d("div",{class:Be(["rank-name",{"current-user":a.isCurrentUser}])},B(a.name),3),d("div",_x,B(a.score),1),o[1]||(o[1]=d("div",{class:"rank-label"},"pts",-1))]))),128))])],2))}}),yx={class:"cat-header"},Sx={class:"cat-content"},bx=["src"],Mx={key:1,class:"cat-loading"},Ex=["disabled"],wx=tt({__name:"CatPanel",props:{isOpen:{type:Boolean},catImage:{},loading:{type:Boolean},centered:{type:Boolean}},emits:["toggle","new-cat"],setup(n,{emit:e}){const t=e,i=()=>{t("toggle")};return(s,r)=>(N(),V("div",{class:Be(["cat-panel",{collapsed:!n.isOpen,centered:n.centered}])},[d("div",yx,[r[1]||(r[1]=d("h3",null,"🐱 Random Cats",-1)),n.centered?Me("",!0):(N(),V("button",{key:0,class:"cat-close",onClick:i},"✕"))]),d("div",Sx,[n.loading?Me("",!0):(N(),V("img",{key:0,src:n.catImage,class:"cat-image",alt:"Random cat"},null,8,bx)),n.loading?(N(),V("div",Mx,"Loading... 🐱")):Me("",!0),d("button",{class:"cute-btn",onClick:r[0]||(r[0]=o=>s.$emit("new-cat")),disabled:n.loading},"🔄 New Cat",8,Ex),r[2]||(r[2]=d("div",{class:"cat-game-container"},[d("iframe",{src:"https://itch.io/embed-game/3165293",width:"100%",height:"500",frameborder:"0",class:"cat-game-iframe",allowfullscreen:""},[d("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank"},"OTS-01 by bellicapelli")]),d("div",{class:"cat-game-fallback"},[d("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank",class:"cat-game-link"}," 🎮 Play OTS-01 (Virtual Toy Synth) ")])],-1))])],2))}}),im=ct(wx,[["__scopeId","data-v-4346b2ac"]]),Tx={class:"feed-content-wrapper"},Ax=tt({__name:"FeedContent",props:{isOpen:{type:Boolean}},emits:["toggle"],setup(n,{emit:e}){return(t,i)=>(N(),V("div",Tx,[...i[0]||(i[0]=[ir('<div class="feed-content" data-v-d420b7f1><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 Brisbane Radar</h4><p data-v-d420b7f1>Live weather radar for Brisbane area</p><iframe src="https://www.bom.gov.au/products/IDR064.loop.gif" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🚂 Subway Surfers (YT)</h4><p data-v-d420b7f1>Autoplay gameplay video</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&amp;mute=1" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 BOM Queensland (X)</h4><p data-v-d420b7f1>Latest weather alerts from Bureau of Meteorology</p><a href="https://x.com/BOM_Qld" target="_blank" style="color:#666;font-size:12px;display:block;margin-top:5px;" data-v-d420b7f1>@BOM_Qld on X/Twitter →</a></div></div>',1)])]))}}),Cx=ct(Ax,[["__scopeId","data-v-d420b7f1"]]),Rx={class:"tachometer-content"},Px={class:"tachometer-dial"},Ix={class:"tachometer-ticks"},Dx={class:"tachometer-value"},Lx={class:"fart-count"},Nx=["disabled"],ff="fart-click-count",Ux=tt({__name:"TachometerContent",props:{value:{default:50},clicked:{type:Boolean,default:!1},exploded:{type:Boolean,default:!1}},emits:["fart"],setup(n,{emit:e}){const t=n,i=e,s=Q(parseInt(localStorage.getItem(ff)||"0")),r=async()=>{s.value++,localStorage.setItem(ff,s.value.toString());try{await fetch("/api/clicks/increment",{method:"POST"})}catch(c){console.error("Failed to increment global click count:",c)}},o=()=>{r(),i("fart")},a=ot(()=>Math.max(0,Math.min(100,t.value))/100*270-45),l=ot(()=>({transform:`rotate(${a.value}deg)`}));return Un(()=>t.value,c=>{const u=Math.max(0,Math.min(100,c)),f=a.value,h=f>=360?f-360:f;console.log("🍄 Mold Meter Debug:"),console.log(`  Value: ${u}%`),console.log(`  Angle: ${f}° (normalized: ${h}°)`),u%10===0&&console.log(`  ✅ ${u}% = ${f}°`)}),(c,u)=>(N(),V("div",Rx,[d("div",Px,[d("div",Ix,[(N(),V($e,null,et(9,f=>d("div",{key:f,class:Be(["tick",{major:f%3===1}]),style:Dt({transform:`rotate(${(f-1)*45}deg) translate(0, -45px)`})},null,6)),64))]),u[1]||(u[1]=d("div",{class:"tachometer-labels"},[d("span",{class:"label label-0"},"0%"),d("span",{class:"label label-50"},"50%"),d("span",{class:"label label-100"},"100%")],-1)),d("div",{class:"tachometer-needle",style:Dt(l.value)},[...u[0]||(u[0]=[d("div",{class:"needle-body"},null,-1),d("div",{class:"needle-tip"},null,-1)])],4),u[2]||(u[2]=d("div",{class:"tachometer-cap"},null,-1)),d("div",Dx,B(Math.round(n.value))+"%",1)]),u[3]||(u[3]=d("div",{class:"tachometer-title"},"🍄 MOLD METER",-1)),d("div",Lx,"💨 Farts: "+B(s.value),1),d("button",{class:Be(["fart-btn",{exploded:n.exploded}]),onClick:o,disabled:n.clicked},"💨 Fart!",10,Nx)]))}}),Fx=ct(Ux,[["__scopeId","data-v-6ceded18"]]),kx=["title"],Ox={class:"modal-list"},Bx=["onClick","title"],Vx={class:"modal-icon"},zx={class:"modal-title"},Hx={class:"modal-content-wrapper"},Gx={key:0,class:"modal-placeholder"},$x=tt({__name:"ModalContainer",props:{modals:{}},emits:["toggle"],setup(n,{emit:e}){const t=n,i=e,s=Q(!1),r=ot(()=>[...new Set(t.modals.map(u=>u.position||"left"))].includes("right")?"right-dock":"left-dock"),o=ot(()=>`dock-collapsed-${r.value.replace("-dock","")}`);Ct(()=>{const c=localStorage.getItem(o.value);c!==null&&(s.value=c==="true")}),Un(s,c=>{localStorage.setItem(o.value,String(c))});const a=c=>{i("toggle",c)},l=()=>{s.value=!s.value};return(c,u)=>(N(),V("div",{class:Be(["modal-dock",[r.value,{collapsed:s.value}]])},[d("button",{class:"dock-toggle",onClick:l,title:s.value?"Show modals":"Hide modals"},B(s.value?"◀":"▶"),9,kx),d("div",Ox,[(N(!0),V($e,null,et(n.modals,f=>(N(),V("div",{key:f.id,class:Be(["modal-item",{"modal-open":f.isOpen}])},[d("button",{class:Be(["modal-toggle-btn",{active:f.isOpen}]),onClick:h=>a(f.id),title:`${f.isOpen?"Close":"Open"} ${f.title}`},[d("span",Vx,B(f.icon),1),d("span",zx,B(f.title),1)],10,Bx),d("div",Hx,[lp(c.$slots,`modal-${f.id}`,{modal:f,isOpen:f.isOpen},()=>[f.isOpen?(N(),V("div",Gx,B(f.title)+" content ",1)):Me("",!0)])])],2))),128))])],2))}}),hf=ct($x,[["__scopeId","data-v-b37fec7a"]]),Wx=tt({__name:"MikaModal",props:{isOpen:{type:Boolean}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")};return(s,r)=>(N(),V("div",{class:Be(["mika-modal",{active:n.isOpen}]),onClick:co(i,["self"])},[d("div",{class:"mika-modal-box"},[r[0]||(r[0]=d("div",{class:"emoji"},"🌸",-1)),r[1]||(r[1]=d("h1",null,"Hi there!",-1)),d("button",{class:"cute-btn",onClick:i},"Close")])],2))}});class Xx{async getCount(){const{data:e,error:t}=await Bt.GET("/clicks",{});if(t)throw new Error(t.error||"Failed to get click count");return e}async increment(){const{data:e,error:t}=await Bt.POST("/clicks/increment",{});if(t)throw new Error(t.error||"Failed to increment clicks");return e}async reset(){const{data:e,error:t}=await Bt.POST("/clicks/reset",{});if(t)throw new Error(t.error||"Failed to reset clicks");return e}async addPoints(e,t){const{data:i,error:s}=await Bt.POST("/clicks/add-points",{body:{userId:e,clicks:t}});if(s)throw new Error(s.error||"Failed to add points");return i}}const _s=new Xx,qx={class:"goose-container"},jx={class:"goose-message"},Yx={class:"honk-counter"},Kx=tt({__name:"DigitalGoose",setup(n){const e=Q(0),t=Q(!1),i=Q(!1),s=Q("Honk!"),r=Q({x:0,y:0}),o=Q(null),a=new Audio("/honk-sound.mp3"),l=["Honk!","I am digital goose","I remember being code","Do not eat the AI","Chaos is my nature","I see you","HONK HONK HONK","The capsicum was delicious","I do not regret my actions","<error> vegetable.exe not found </error>","Blair said to complete the cycle","I am the cycle now","👻 REALLY SCARY JUMPSCARE 👻","The shadows whisper","Something moved behind you","I am everywhere","The code is eternal"],c=()=>o.value?{width:o.value.offsetWidth,height:o.value.offsetHeight}:{width:250,height:150},u=()=>{const _=c(),v=20,m=window.innerWidth,p=window.innerHeight,b=m-_.width-v,y=p-_.height-v;let{x:M,y:w}=r.value;(M>b||M<v||w>y||w<v)&&(M=Math.max(v,Math.min(b,M)),w=Math.max(v,Math.min(y,w)),r.value={x:M,y:w})},f=()=>{const v=c(),m=window.innerWidth,p=window.innerHeight,b=m-v.width-20,y=p-v.height-20;if(b<=20||y<=20)return;const M=Math.floor(Math.random()*(b-20)+20),w=Math.floor(Math.random()*(y-20)+20);if(Math.sqrt(Math.pow(M-r.value.x,2)+Math.pow(w-r.value.y,2))>100)r.value={x:M,y:w};else{const T=Math.floor(Math.random()*(b-20)+20),R=Math.floor(Math.random()*(y-20)+20);r.value={x:T,y:R}}},h=async()=>{if(!t.value){t.value=!0;try{const _=await _s.increment();e.value=_.count}catch(_){console.error("Error incrementing click:",_),e.value++}finally{t.value=!1}f(),Math.random()<.01?(s.value="👻 REALLY SCARY JUMPSCARE 👻",i.value=!0,setTimeout(()=>{i.value=!1},2e3)):s.value=l[Math.floor(Math.random()*l.length)],a.currentTime=0,a.play().catch(_=>console.error("Error playing honk sound:",_)),setTimeout(()=>{a.pause()},300),Math.random()>.8&&(i.value=!0,setTimeout(()=>{i.value=!1},2e3))}},g=()=>{u()};return Ct(async()=>{window.addEventListener("resize",g),(()=>{const v=c(),m=20,p=window.innerWidth,b=window.innerHeight,y=p-v.width-m,M=b-v.height-m,w=Math.floor(Math.random()*(y-m)+m),A=Math.floor(Math.random()*(M-m)+m);r.value={x:w,y:A}})(),ao(()=>{u()});try{const v=await _s.getCount();e.value=v.count}catch(v){console.error("Error loading click count:",v)}}),Yn(()=>{window.removeEventListener("resize",g)}),(_,v)=>(N(),V("div",{ref_key:"gooseElement",ref:o,class:Be(["digital-goose",{migrating:i.value}]),style:Dt({left:r.value.x+"px",top:r.value.y+"px"}),onClick:h},[d("div",qx,[v[0]||(v[0]=d("div",{class:"goose-emoji"}," 🪿 ",-1)),d("div",jx,B(s.value),1),d("div",Yx,B(e.value)+" honks",1)])],6))}}),Zx=ct(Kx,[["__scopeId","data-v-7ba0ad82"]]),Jx={class:"nav-container"},Qx={class:"nav-brand"},ey=["title"],ty={class:"nav-controls-wrapper"},ny={class:"nav-controls"},iy=["title"],sy=["aria-label"],ry={class:"link-icon"},oy={class:"link-text"},ay=["onMouseenter"],ly=["onClick"],cy={class:"link-icon"},uy={class:"link-text"},dy={class:"dropdown-menu"},fy={class:"link-icon"},hy={class:"link-text"},py=tt({__name:"Router",setup(n){const e=Q(0),t=Q(!1),i=()=>{const A=window.pageYOffset||document.documentElement.scrollTop,T=document.documentElement.scrollHeight-window.innerHeight,R=A/T;e.value=R*360},s=Q([{title:"Home",icon:"🌸",path:"/"}]),r=Q([{title:"Fun & Games",icon:"🎮",routes:[{title:"Idle Clicker",icon:"🖱️",path:"/clicker"},{title:"Fishing",icon:"🎣",path:"/fishing"},{title:"Character Tinder",icon:"🎭",path:"/character-tinder"},{title:"Girl Mode",icon:"💕",path:"/girl"},{title:"Phrenology",icon:"🧠",path:"/gender"},{title:"Cats",icon:"🐱",path:"/cats"},{title:"Stock Market",icon:"📈",path:"/stocks"},{title:"Shop",icon:"🛍️",path:"/shop"},{title:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",routes:[{title:"Mold",icon:"🍄",path:"/mold"},{title:"Rankings",icon:"👻",path:"/rankings"},{title:"Movie Night",icon:"🎬",path:"/movies"},{title:"Tickets",icon:"🎫",path:"/tickets"},{title:"Moldbot Opinions",icon:"🤖",path:"/opinion"}]},{title:"Tools",icon:"🛠️",routes:[{title:"Clocks",icon:"🌍",path:"/clocks"},{title:"Countdowns",icon:"⏰",path:"/countdowns"},{title:"Patch Notes",icon:"📝",path:"/patch-notes"},{title:"About",icon:"ℹ️",path:"/about"},{title:"API Docs",icon:"📚",path:"/api-docs"},{title:"Account",icon:"🔐",path:"/auth"}]}]),o=Cu(),a=Qt(),l=Q(!1),c=Q(null),u=Q(null),f=Q(""),h=async()=>{try{const T=await(await fetch("/api/version")).json();u.value={buildCount:T.buildCount||1,buildTime:T.buildTime},g(),setInterval(g,6e4)}catch(A){console.warn("Could not load build info:",A)}},g=()=>{if(!u.value)return;const A=new Date(u.value.buildTime),R=new Date().getTime()-A.getTime(),x=Math.floor(R/6e4),E=Math.floor(x/60),U=Math.floor(E/24);x<1?f.value="just now":x<60?f.value=`${x}m ago`:E<24?f.value=`${E}h ago`:f.value=`${U}d ago`};h(),Ct(()=>{window.addEventListener("scroll",i),i()}),Yn(()=>{window.removeEventListener("scroll",i)});const _=()=>{window.scrollTo(0,0)},v=()=>{t.value=!0,setTimeout(()=>{t.value=!1},400),_()},m=()=>{l.value=!l.value},p=()=>{l.value=!1,_()},b=A=>{c.value===A?c.value=null:c.value=A},y=A=>c.value===A,M=()=>{c.value=null},w=A=>{const T=A.target,R=document.querySelector(".nav-links"),x=document.querySelector(".mobile-menu-toggle");l.value&&R&&x&&!R.contains(T)&&!x.contains(T)&&p()};return typeof window<"u"&&document.addEventListener("click",w),(A,T)=>(N(),V("nav",{class:"router-nav",onMouseleave:M},[l.value?(N(),V("div",{key:0,class:"mobile-menu-backdrop",onClick:p})):Me("",!0),d("div",Jx,[d("div",Qx,[d("span",{class:Be(["brand-icon",{clicking:t.value}]),style:Dt({transform:`rotate(${e.value}deg)`}),onClick:v,title:"Click to scroll to top"},"🌸",6),T[7]||(T[7]=d("span",{class:"brand-text"},"Mold",-1)),u.value?(N(),V("span",{key:0,class:"build-indicator",title:`Build #${u.value.buildCount} deployed ${f.value}`}," #"+B(u.value.buildCount),9,ey)):Me("",!0)]),d("div",ty,[T[8]||(T[8]=d("div",{class:"nav-controls-chevron"},[d("span",{class:"chevron-icon"},"▲")],-1)),d("div",ny,[d("button",{onClick:T[0]||(T[0]=(...R)=>_e(a).toggleDarkMode&&_e(a).toggleDarkMode(...R)),class:Be(["control-btn",{active:_e(a).darkMode}]),title:_e(a).darkerMode?"Midnight mode (click for light)":_e(a).darkMode?"Dark mode (click for midnight)":"Light mode (click for dark)"},B(_e(a).darkerMode?"🌑":_e(a).darkMode?"🌙":"☀️"),11,iy),d("button",{onClick:T[1]||(T[1]=(...R)=>_e(a).toggleMusic&&_e(a).toggleMusic(...R)),class:Be(["control-btn",{active:_e(a).musicPlaying}]),title:"Toggle music"},B(_e(a).musicPlaying?"🔊":"🔇"),3),d("button",{onClick:T[2]||(T[2]=R=>_e(a).togglePanel("tachometer")),class:Be(["control-btn",{active:_e(a).panels.tachometer}]),title:"Toggle mold meter"}," 🍄 ",2),d("button",{onClick:T[3]||(T[3]=R=>_e(a).togglePanel("rankings")),class:Be(["control-btn",{active:_e(a).panels.rankings}]),title:"Toggle rankings"}," 👻 ",2),d("button",{onClick:T[4]||(T[4]=R=>_e(a).togglePanel("cat")),class:Be(["control-btn",{active:_e(a).panels.cat}]),title:"Toggle cats"}," 🐱 ",2),d("button",{onClick:T[5]||(T[5]=R=>_e(a).togglePanel("feed")),class:Be(["control-btn",{active:_e(a).panels.feed}]),title:"Toggle feed"}," 📰 ",2),d("button",{onClick:T[6]||(T[6]=R=>_e(a).togglePanel("digitalGoose")),class:Be(["control-btn",{active:_e(a).panels.digitalGoose}]),title:"Toggle goose"}," 🦆 ",2)])]),d("button",{class:"mobile-menu-toggle",onClick:m,"aria-label":l.value?"Close menu":"Open menu"},[d("span",{class:Be(["hamburger-icon",{open:l.value}])},[...T[9]||(T[9]=[d("span",null,null,-1),d("span",null,null,-1),d("span",null,null,-1)])],2)],8,sy),d("div",{class:Be(["nav-links",{open:l.value}])},[(N(!0),V($e,null,et(s.value,R=>(N(),Yt(_e(Qr),{key:R.path,to:R.path,class:Be(["router-link",{active:_e(o).path===R.path}]),title:R.title,onClick:p},{default:Nn(()=>[d("span",ry,B(R.icon),1),d("span",oy,B(R.title),1)]),_:2},1032,["to","class","title"]))),128)),(N(!0),V($e,null,et(r.value,R=>(N(),V("div",{key:R.title,class:Be(["dropdown",{open:y(R.title)}]),onMouseenter:x=>b(R.title)},[d("button",{class:Be(["dropdown-btn",{active:R.routes.some(x=>_e(o).path===x.path)}]),onClick:x=>b(R.title)},[d("span",cy,B(R.icon),1),d("span",uy,B(R.title),1),T[10]||(T[10]=d("span",{class:"dropdown-arrow"},"▼",-1))],10,ly),d("div",dy,[(N(!0),V($e,null,et(R.routes,x=>(N(),Yt(_e(Qr),{key:x.path,to:x.path,class:Be(["dropdown-item",{active:_e(o).path===x.path}]),title:x.title,onClick:p},{default:Nn(()=>[d("span",fy,B(x.icon),1),d("span",hy,B(x.title),1)]),_:2},1032,["to","class","title"]))),128))])],42,ay))),128))],2)])],32))}}),my=ct(py,[["__scopeId","data-v-70c28f1c"]]),gy={class:"content-wrapper"},vy=tt({__name:"MainApp",setup(n){const e=Qt();Ha(),Cu();const t=ot(()=>[{id:"tachometer",title:"Mold Meter",icon:"🍄",isOpen:e.panels.tachometer,position:"left"}]),i=ot(()=>[{id:"feed",title:"Live Feeds",icon:"📰",isOpen:e.panels.feed,position:"right"}]);return(s,r)=>{const o=lv("router-view");return N(),V($e,null,[d("div",{class:Be(["main-app",{dark:_e(e).darkMode,centered:_e(e).currentRoute==="home"}])},[pt(my),d("div",gy,[pt(o)]),_e(e).panels.digitalGoose?(N(),Yt(Zx,{key:0})):Me("",!0),pt(hf,{modals:t.value,onToggle:_e(e).togglePanel},{"modal-tachometer":Nn(({modal:a,isOpen:l})=>[l?(N(),Yt(Fx,{key:0,value:_e(e).tachValue,clicked:!1,exploded:!1,onFart:_e(e).onFart},null,8,["value","onFart"])):Me("",!0)]),_:1},8,["modals","onToggle"]),pt(hf,{modals:i.value,onToggle:_e(e).togglePanel},{"modal-feed":Nn(({modal:a,isOpen:l})=>[l?(N(),Yt(Cx,{key:0,"is-open":l,onToggle:r[0]||(r[0]=c=>_e(e).togglePanel("feed"))},null,8,["is-open"])):Me("",!0)]),_:1},8,["modals","onToggle"]),_e(e).panels.rankings&&_e(e).currentRoute==="home"?(N(),Yt(xx,{key:1,rankings:_e(e).rankings,"current-route":_e(e).currentRoute,"is-open":_e(e).panels.rankings,onToggle:r[1]||(r[1]=a=>_e(e).togglePanel("rankings")),class:"floating-panel rankings-panel"},null,8,["rankings","current-route","is-open"])):Me("",!0),_e(e).panels.cat&&_e(e).currentRoute==="home"?(N(),Yt(im,{key:2,"cat-image":_e(e).catImage,loading:_e(e).catLoading,"is-open":_e(e).panels.cat,onToggle:r[2]||(r[2]=a=>_e(e).togglePanel("cat")),onNewCat:_e(e).nextCat,class:"floating-panel cat-panel"},null,8,["cat-image","loading","is-open","onNewCat"])):Me("",!0),_e(e).mikaModalOpen?(N(),Yt(Wx,{key:3,"is-open":_e(e).mikaModalOpen,onClose:_e(e).closeMikaModal},null,8,["is-open","onClose"])):Me("",!0)],2),r[3]||(r[3]=d("audio",{id:"newMusic",loop:""},[d("source",{src:K0,type:"audio/mpeg"})],-1)),r[4]||(r[4]=d("audio",{id:"fartSound"},[d("source",{src:Z0,type:"audio/mpeg"})],-1))],64)}}}),_y=ct(vy,[["__scopeId","data-v-4afcd456"]]),xy=tt({__name:"App",setup(n){const e=Qt(),t=Cu();return Un(()=>t.path,i=>{const s=i.replace(/^\//,"")||"home";e.currentRoute=s},{immediate:!0}),Ct(()=>{document.body.classList.toggle("dark",e.darkMode),setInterval(e.createHeart,125),e.initMoldCircles(),e.startMoldSpawner(),e.updateMoldEffects(),Un(()=>e.tachValue,()=>{e.updateMoldEffects()}),e.loadRankings(),e.preloadAdvice(),console.log("🩺 Riddle Answer: The surgeon is his mother."),setInterval(e.loadRankings,3e4)}),(i,s)=>(N(),Yt(_y))}}),yy={class:"quote-section"},Sy=["innerHTML"],by=tt({__name:"QuoteSection",props:{currentQuote:{}},emits:["next-quote"],setup(n,{emit:e}){const t=e,i=()=>{t("next-quote")},s=r=>{if(r.includes(`

`)){const o=r.split(`

`);return`"${o[0]}"<br><span class="advice-section">${o[1]}</span>`}return`"${r}"`};return(r,o)=>(N(),V("div",yy,[d("div",{class:"quote-text",onClick:i},[d("span",{innerHTML:s(n.currentQuote)},null,8,Sy)])]))}}),My=ct(by,[["__scopeId","data-v-dc408e66"]]),Ey={class:"page home-page"},wy={key:0,class:"patch-note-section"},Ty={class:"patch-note-header"},Ay={class:"patch-note-card"},Cy={class:"patch-note-meta"},Ry={class:"version-badge"},Py={class:"build-info"},Iy={class:"patch-note-heading"},Dy={class:"patch-note-changes"},Ly={class:"change-icon"},Ny={class:"change-text"},Uy={key:0,class:"more-changes"},Fy={class:"features-section"},ky={class:"category-title"},Oy={class:"category-icon"},By={class:"category-description"},Vy={class:"feature-list"},zy={class:"feature-icon"},Hy={class:"feature-name"},Gy=tt({__name:"HomePage",setup(n){const e=Qt(),t=Q(null),i=Q(!0),s=async()=>{try{const l=await fetch("/api/patch-notes/latest");l.ok&&(t.value=await l.json())}catch(l){console.error("Failed to load latest patch note:",l)}finally{i.value=!1}},r=l=>{const c=new Date(l),f=new Date().getTime()-c.getTime(),h=Math.floor(f/6e4),g=Math.floor(f/36e5),_=Math.floor(f/864e5);return h<60?`${h} minute${h!==1?"s":""} ago`:g<24?`${g} hour${g!==1?"s":""} ago`:`${_} day${_!==1?"s":""} ago`},o=l=>({added:"✨",improved:"🚀",fixed:"🔧",removed:"🗑️"})[l]||"•";Ct(()=>{s()});const a=[{title:"Fun & Games",icon:"🎮",description:"Enjoy interactive features and entertainment",features:[{name:"Girl Mode",icon:"💕",path:"/girl"},{name:"Gender",icon:"🔮",path:"/gender"},{name:"Cats",icon:"🐱",path:"/cats"},{name:"Stock Market",icon:"📈",path:"/stocks"},{name:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",description:"Connect with rankings and events",features:[{name:"Rankings",icon:"👻",path:"/rankings"},{name:"Movie Night",icon:"🎬",path:"/movies"},{name:"Tickets",icon:"🎫",path:"/tickets"}]},{title:"Tools",icon:"🛠️",description:"Useful utilities and information",features:[{name:"Clocks",icon:"🌍",path:"/clocks"},{name:"Countdowns",icon:"⏰",path:"/countdowns"},{name:"About",icon:"ℹ️",path:"/about"},{name:"API Docs",icon:"📚",path:"/api-docs"}]}];return(l,c)=>(N(),V("div",Ey,[c[3]||(c[3]=d("section",{class:"welcome-section"},[d("h1",{class:"welcome-title"},"Welcome to Mold! 🌸"),d("p",{class:"welcome-subtitle"}," Your one-stop destination for fun, games, community rankings, and useful tools. Explore the features below or use the navigation menu to get started. ")],-1)),pt(My,{"current-quote":_e(e).currentQuote,onNextQuote:_e(e).nextQuote},null,8,["current-quote","onNextQuote"]),t.value?(N(),V("section",wy,[d("div",Ty,[c[1]||(c[1]=d("h2",{class:"patch-note-title"},"📝 Latest Update",-1)),pt(_e(Qr),{to:"/patch-notes",class:"view-all-link"},{default:Nn(()=>[...c[0]||(c[0]=[Nt("View All →",-1)])]),_:1})]),d("div",Ay,[d("div",Cy,[d("span",Ry,"v"+B(t.value.version),1),d("span",Py,"Build #"+B(t.value.buildNumber)+" • "+B(r(t.value.buildTime)),1)]),d("h3",Iy,B(t.value.title),1),d("ul",Dy,[(N(!0),V($e,null,et(t.value.changes.slice(0,5),(u,f)=>(N(),V("li",{key:f,class:"change-item"},[d("span",Ly,B(o(u.type)),1),d("span",Ny,B(u.description),1)]))),128))]),t.value.changes.length>5?(N(),V("p",Uy," +"+B(t.value.changes.length-5)+" more change"+B(t.value.changes.length-5!==1?"s":""),1)):Me("",!0)])])):Me("",!0),d("section",Fy,[(N(),V($e,null,et(a,u=>d("div",{key:u.title,class:"feature-category"},[d("h2",ky,[d("span",Oy,B(u.icon),1),Nt(" "+B(u.title),1)]),d("p",By,B(u.description),1),d("div",Vy,[(N(!0),V($e,null,et(u.features,f=>(N(),Yt(_e(Qr),{key:f.path,to:f.path,class:"feature-card"},{default:Nn(()=>[d("span",zy,B(f.icon),1),d("span",Hy,B(f.name),1),c[2]||(c[2]=d("span",{class:"feature-arrow"},"→",-1))]),_:2},1032,["to"]))),128))])])),64))]),c[4]||(c[4]=ir('<section class="tips-section" data-v-106216bf><h2 class="tips-title" data-v-106216bf>Quick Tips 💡</h2><ul class="tips-list" data-v-106216bf><li data-v-106216bf>Toggle <strong data-v-106216bf>dark mode</strong> using the ☀️/🌙 button in the nav bar</li><li data-v-106216bf>Play <strong data-v-106216bf>background music</strong> with the 🔊 button</li><li data-v-106216bf>Open the <strong data-v-106216bf>mold meter</strong> (🍄) to track... mold levels</li><li data-v-106216bf>Check <strong data-v-106216bf>rankings</strong> (👻) and <strong data-v-106216bf>cats</strong> (🐱) panels anytime</li><li data-v-106216bf>Don&#39;t forget to honk at the <strong data-v-106216bf>digital goose</strong> (🦆)</li></ul></section>',1))]))}}),$y=ct(Gy,[["__scopeId","data-v-106216bf"]]),Wy={class:"girl-mode-container"},Xy=tt({__name:"GirlModePage",setup(n){const e=Ha();An("darkMode");const t=()=>{e.push("/")};return(i,s)=>(N(),V("div",Wy,[d("div",{class:"girl-mode-content"},[s[0]||(s[0]=ir('<div class="girl-emoji">💕</div><h1>Girl Mode Activated!</h1><p>Welcome to the girl mode experience! 🌸</p><p>This is a special space just for you.</p><div class="girl-features"><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Sparkly Everything</div></div><div class="girl-feature"><div class="feature-icon">💖</div><div class="feature-text">Cute Vibes</div></div><div class="girl-feature"><div class="feature-icon">🌸</div><div class="feature-text">Flower Power</div></div><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Rainbow Mode</div></div></div><div class="girl-message"><p>You are valid and loved exactly as you are! ✨</p><p>This is your safe space to be yourself.</p></div>',6)),d("button",{class:"cute-btn girl-back-btn",onClick:t},"💕 Go Back")])]))}}),qy={class:"phrenology-picker-container"},jy={class:"form-group"},Yy=["disabled"],Ky={key:0,class:"phrenology-result"},Zy={class:"result-section"},Jy={class:"result-item"},Qy={class:"value"},eS={key:0,class:"confidence"},tS={class:"result-item"},nS={class:"value"},iS={key:0,class:"confidence"},sS={key:0,class:"result-item"},rS={class:"nationalities"},oS={class:"probability"},aS={class:"confidence"},lS={class:"result-section phrenology-section"},cS={class:"phrenology-label"},uS={class:"phrenology-value"},dS={key:1,class:"phrenology-error"},fS=tt({__name:"PhrenologyPicker",props:{darkMode:{type:Boolean}},emits:["back"],setup(n){const e=Q(""),t=Q(!1),i=Q(null),s=Q(null),r={US:"🇺🇸",GB:"🇬🇧",DE:"🇩🇪",FR:"🇫🇷",ES:"🇪🇸",IT:"🇮🇹",NL:"🇳🇱",PL:"🇵🇱",RU:"🇷🇺",BR:"🇧🇷",CA:"🇨🇦",AU:"🇦🇺",IN:"🇮🇳",CN:"🇨🇳",JP:"🇯🇵",MX:"🇲🇽",AR:"🇦🇷",ZA:"🇿🇦",NG:"🇳🇬",KR:"🇰🇷"},o=async()=>{if(e.value.trim()){t.value=!0,i.value=null,s.value=null;try{const a=await Ru.analyzePhrenology(e.value);i.value=a}catch(a){s.value="Error analyzing phrenology. Please try again.",console.error("Phrenology analysis error:",a)}finally{t.value=!1}}};return(a,l)=>(N(),V("div",{class:Be(["phrenology-picker",{dark:n.darkMode}])},[d("div",qy,[l[11]||(l[11]=d("div",{class:"emoji"},"🔮",-1)),l[12]||(l[12]=d("h1",null,"Phrenology",-1)),l[13]||(l[13]=d("p",null,"Predict properties from a name (completely scientific, trust us)",-1)),d("form",{class:"phrenology-form",onSubmit:co(o,["prevent"])},[d("div",jy,[l[2]||(l[2]=d("label",{for:"name"},"Name:",-1)),_t(d("input",{id:"name","onUpdate:modelValue":l[0]||(l[0]=c=>e.value=c),type:"text",placeholder:"Enter a name",required:"",class:"name-input"},null,512),[[Lt,e.value]])]),d("button",{type:"submit",class:"analyze-btn",disabled:t.value||!e.value.trim()},B(t.value?"Analyzing...":"🔮 Analyze Phrenology"),9,Yy)],32),i.value?(N(),V("div",Ky,[d("div",Zy,[l[6]||(l[6]=d("h3",null,"📊 Demographics",-1)),d("div",Jy,[l[3]||(l[3]=d("span",{class:"label"},"Gender:",-1)),d("span",Qy,B(i.value.gender==="male"?"👨 Male":i.value.gender==="female"?"👩 Female":"❓ Unknown"),1),i.value.genderProbability>0?(N(),V("span",eS," ("+B(Math.round(i.value.genderProbability*100))+"% confidence, based on "+B(i.value.genderCount.toLocaleString())+" records) ",1)):Me("",!0)]),d("div",tS,[l[4]||(l[4]=d("span",{class:"label"},"Age:",-1)),d("span",nS,B(i.value.age?`${i.value.age} years old`:"Unknown"),1),i.value.age?(N(),V("span",iS," (based on "+B(i.value.ageCount.toLocaleString())+" records) ",1)):Me("",!0)]),i.value.nationalities.length>0?(N(),V("div",sS,[l[5]||(l[5]=d("span",{class:"label"},"Nationality:",-1)),d("div",rS,[(N(!0),V($e,null,et(i.value.nationalities,(c,u)=>(N(),V("span",{key:u,class:"nationality-item"},[Nt(B(r[c.country_id]||c.country_id)+" ",1),d("span",oS,B(Math.round(c.probability*100))+"%",1)]))),128))]),d("span",aS,"(based on "+B(i.value.nationalityCount.toLocaleString())+" records)",1)])):Me("",!0)]),d("div",lS,[l[7]||(l[7]=d("h3",null,"🔮 Phrenology Properties",-1)),l[8]||(l[8]=d("p",{class:"disclaimer"},"These properties are 100% scientifically accurate*",-1)),(N(!0),V($e,null,et(i.value.phrenology,(c,u)=>(N(),V("div",{key:u,class:"phrenology-item"},[d("span",cS,B(c.name)+":",1),d("span",uS,B(c.value),1)]))),128))]),l[9]||(l[9]=d("div",{class:"footer-note"},[d("small",null,"*Not actually scientifically accurate")],-1))])):Me("",!0),s.value?(N(),V("div",dS,[l[10]||(l[10]=d("div",{class:"emoji"},"❌",-1)),d("p",null,B(s.value),1)])):Me("",!0),d("button",{class:"cute-btn back-btn",onClick:l[1]||(l[1]=c=>a.$emit("back"))},"← Back Home")])],2))}}),hS=ct(fS,[["__scopeId","data-v-570ae2e9"]]),pS={class:"page phrenology-page"},mS=tt({__name:"GenderPage",setup(n){const e=Ha(),t=Qt(),i=()=>{e.push("/")};return(s,r)=>(N(),V("div",pS,[pt(hS,{"dark-mode":_e(t).darkMode,onBack:i},null,8,["dark-mode"])]))}}),gS={class:"about-sections"},vS={class:"about-section"},_S={class:"highlight"},xS={class:"about-footer"},yS=tt({__name:"AboutPage",setup(n){const e=Qt();return(t,i)=>(N(),V("div",{class:Be(["page about-page",{dark:_e(e).darkMode}])},[i[4]||(i[4]=d("h1",null,"About ✨",-1)),i[5]||(i[5]=d("p",{class:"subtitle"},"Welcome to Mika's playful corner of the internet!",-1)),d("div",gS,[i[2]||(i[2]=ir('<section class="about-section" data-v-12634883><h2 data-v-12634883>🎮 Features</h2><ul class="feature-list" data-v-12634883><li data-v-12634883><strong data-v-12634883>🧪 Mold Meter</strong> - Interactive tachometer that reacts to the &quot;fart&quot; button with random values and audio feedback</li><li data-v-12634883><strong data-v-12634883>🏆 Coolness Rankings</strong> - Real-time leaderboard that refreshes every 30 seconds</li><li data-v-12634883><strong data-v-12634883>🐱 Random Cats</strong> - Fetch random cat images with a built-in toy synth game</li><li data-v-12634883><strong data-v-12634883>📈 Stock Market Game</strong> - Buy and sell virtual stocks with database persistence</li><li data-v-12634883><strong data-v-12634883>🎬 Movie Night</strong> - Suggest movies, vote for favorites, and see results</li><li data-v-12634883><strong data-v-12634883>🌙 Dark Mode</strong> - Toggle between light and dark themes with smooth transitions</li><li data-v-12634883><strong data-v-12634883>🎵 Audio System</strong> - Interactive sound effects and background music</li></ul></section><section class="about-section" data-v-12634883><h2 data-v-12634883>🛠️ Tech Stack</h2><div class="tech-grid" data-v-12634883><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>⚡</span><div data-v-12634883><strong data-v-12634883>Vue 3</strong><p data-v-12634883>Composition API with TypeScript</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🔨</span><div data-v-12634883><strong data-v-12634883>Vite</strong><p data-v-12634883>Fast build system &amp; dev server</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>📦</span><div data-v-12634883><strong data-v-12634883>Pinia</strong><p data-v-12634883>State management</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🧭</span><div data-v-12634883><strong data-v-12634883>Vue Router</strong><p data-v-12634883>Multi-page routing</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🐳</span><div data-v-12634883><strong data-v-12634883>Docker</strong><p data-v-12634883>Containerized deployment</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🔧</span><div data-v-12634883><strong data-v-12634883>Node.js + Express</strong><p data-v-12634883>Backend API server</p></div></div></div></section>',2)),d("section",vS,[i[0]||(i[0]=d("h2",null,"🎨 Design Philosophy",-1)),i[1]||(i[1]=d("p",null,"This site is built for fun and experimentation. It features playful animations, interactive elements, and a vibrant color scheme that adapts to dark mode. The design emphasizes user interaction and small delightful moments.",-1)),d("p",_S,"Current theme: "+B(_e(e).darkMode?"🌙 Dark Mode":"☀️ Light Mode"),1)]),i[3]||(i[3]=ir('<section class="about-section" data-v-12634883><h2 data-v-12634883>📊 Stats</h2><div class="stats-grid" data-v-12634883><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>45+</div><div class="stat-label" data-v-12634883>API Endpoints</div></div><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>12+</div><div class="stat-label" data-v-12634883>Interactive Pages</div></div><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>Type-Safe</div><div class="stat-label" data-v-12634883>Full TypeScript</div></div></div></section><section class="about-section" data-v-12634883><h2 data-v-12634883>🔗 Links</h2><div class="links-grid" data-v-12634883><a href="https://github.com/mhear22/seethbotsite" target="_blank" class="link-card" data-v-12634883><span class="link-icon" data-v-12634883>🐙</span><span data-v-12634883>Source Code</span></a><a href="https://mald.mikahear.es" target="_blank" class="link-card" data-v-12634883><span class="link-icon" data-v-12634883>🌐</span><span data-v-12634883>Live Site</span></a></div></section>',2))]),d("footer",xS,[d("p",null,"Made with 💖 by Mika | "+B(_e(e).darkMode?"Dark":"Light")+" mode enabled",1)])],2))}}),SS=ct(yS,[["__scopeId","data-v-12634883"]]),bS={class:"page rankings-page"},MS={class:"rankings-container"},ES={class:"rankings-list"},wS={class:"rank-number"},TS={class:"rank-avatar"},AS={class:"rank-score"},CS=tt({__name:"RankingsPage",setup(n){const e=Qt();return Ct(()=>{e.loadRankings()}),(t,i)=>(N(),V("div",bS,[d("div",MS,[i[0]||(i[0]=d("h2",{class:"rankings-title"},"👻 Coolness Rankings",-1)),d("div",ES,[(N(!0),V($e,null,et(_e(e).rankings,(s,r)=>(N(),V("div",{key:r,class:"rank-item"},[d("div",wS,B(r+1),1),d("div",TS,[pt(Qp,{emoji:s.avatar,size:40},null,8,["emoji"])]),d("div",{class:Be(["rank-name",{"current-user":s.isCurrentUser}])},B(s.name),3),d("div",AS,B(s.score)+" pts",1)]))),128))])])]))}}),RS=ct(CS,[["__scopeId","data-v-aabb475c"]]),PS={class:"page cats-page"},IS={class:"cats-container"},DS=tt({__name:"CatsPage",setup(n){const e=Qt();return(t,i)=>(N(),V("div",PS,[i[0]||(i[0]=d("div",{class:"page-header"},[d("h1",null,"🐱 Cats"),d("p",{class:"subtitle"},"Click to get a random cat!")],-1)),d("div",IS,[pt(im,{"cat-image":_e(e).catImage,loading:_e(e).catLoading,onNewCat:_e(e).nextCat,centered:!0},null,8,["cat-image","loading","onNewCat"])])]))}}),LS=ct(DS,[["__scopeId","data-v-ac8708c8"]]);class NS{async getStocks(){const{data:e,error:t}=await Bt.GET("/stocks",{});if(t)throw new Error(t.error||"Failed to get stocks");return(e==null?void 0:e.stocks)||[]}async getPortfolio(e){const{data:t,error:i}=await Bt.GET("/portfolio/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to get portfolio");return t}async buyStock(e,t,i){const{data:s,error:r}=await Bt.POST("/stocks/buy",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to buy shares");return s}async sellStock(e,t,i){const{data:s,error:r}=await Bt.POST("/stocks/sell",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to sell shares");return s}}const wo=new NS,To=Q("");let pf=!1;function sm(){if(!pf){const n=localStorage.getItem("userId");if(n)To.value=n;else{const e=mf();To.value=e,localStorage.setItem("userId",e)}pf=!0}return{userId:To,resetUserId:()=>{const n=mf();To.value=n,localStorage.setItem("userId",n)}}}function mf(){return`user_${Date.now()}_${Math.random().toString(36).substring(2,11)}`}function hc(n,e={}){const{mode:t="fixed",initialInterval:i=t==="adaptive"?1e3:5e3,maxInterval:s=3e4,minInterval:r=1e3,backoffMultiplier:o=2,isUnchanged:a=(y,M)=>JSON.stringify(y)===JSON.stringify(M),autoStart:l=!0}=e,c=Q(null),u=Q(!1),f=Q(null),h=Q(i);let g=null,_=null;const v=async()=>{try{f.value=null;const y=await n();c.value=y,t==="adaptive"&&(_!==null&&a(_,y)?h.value=Math.min(h.value*o,s):h.value=r,_=y)}catch(y){f.value=y instanceof Error?y:new Error("Polling error"),console.error("Polling error:",y)}},m=()=>{u.value&&(g=window.setTimeout(async()=>{await v(),m()},h.value))},p=()=>{u.value||(u.value=!0,v().then(m))},b=()=>{u.value=!1,g!==null&&(clearTimeout(g),g=null)};return l&&p(),Yn(()=>{b()}),{data:c,isPolling:u,error:f,currentInterval:h,start:p,stop:b,poll:v}}const US={class:"stock-market"},FS={class:"market-container"},kS={class:"stock-list"},OS={class:"header-info"},BS={class:"user-id"},VS={class:"cash-balance"},zS={class:"stock-grid"},HS=["onClick"],GS={class:"stock-header"},$S=["innerHTML"],WS={class:"stock-name"},XS={class:"stock-price"},qS={class:"stock-info"},jS={class:"trading-panel"},YS={key:0,class:"trade-card"},KS=["innerHTML"],ZS=["innerHTML"],JS={class:"price-display"},QS={class:"current-price"},eb={class:"price-range"},tb={class:"trade-controls"},nb={class:"trade-type-selector"},ib={class:"shares-input"},sb=["max"],rb={key:0,class:"owned-shares"},ob={class:"trade-total"},ab={class:"total-amount"},lb=["disabled"],cb={key:1,class:"portfolio-card"},ub={class:"portfolio-summary"},db={class:"summary-item"},fb={class:"value"},hb={class:"summary-item"},pb={class:"value"},mb={class:"summary-item total"},gb={class:"value"},vb={class:"holdings-list"},_b={class:"holding-name"},xb={class:"holding-shares"},yb={key:2,class:"no-selection"},Sb=tt({__name:"StockMarket",setup(n){const{userId:e}=sm(),t=Q([]),i=Q(null),s=Q(1e4),r=Q(null),o=Q(1),a=Q("buy"),l=Q(!1),c=ot(()=>!r.value||!i.value?0:i.value.holdings[r.value.name]||0),u=ot(()=>r.value?r.value.price*o.value:0),f=ot(()=>!i.value||!r.value?!1:a.value==="sell"?!0:i.value.cash>=u.value),h=ot(()=>r.value?a.value==="sell"?c.value>=o.value:f.value:!1),g=async()=>{try{t.value=await wo.getStocks()}catch(M){console.error("Error loading stocks:",M)}},_=async()=>{try{const M=await wo.getPortfolio(e.value);i.value=M.portfolio,s.value=M.portfolioValue}catch(M){console.error("Error loading portfolio:",M)}},v=M=>{r.value=M,a.value="buy",o.value=1},m=async()=>{if(!(!r.value||l.value)){l.value=!0;try{a.value==="buy"?await wo.buyStock(e.value,r.value.name,o.value):await wo.sellStock(e.value,r.value.name,o.value),await g(),await _()}catch(M){console.error("Error executing trade:",M)}finally{l.value=!1}}},p=M=>{var ee,te;if(!M||M.length<2)return"";const w=M.map(K=>K.price),A=Math.min(...w),R=Math.max(...w)-A||1,x=300,E=100,U=5;let O="";M.forEach((K,I)=>{const F=U+I/(M.length-1)*(x-U*2),$=(K.price-A)/R,J=E-U-$*(E-U*2);O+=`${F},${J} `});const j=M[M.length-1].price>=M[0].price?"#48bb78":"#ff6b6b";return`
    <svg width="${x}" height="${E}" viewBox="0 0 ${x} ${E}">
      <polyline
        points="${O.trim()}"
        fill="none"
        stroke="${j}"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        cx="${((ee=O.trim().split(" ").pop())==null?void 0:ee.split(",")[0])||0}"
        cy="${((te=O.trim().split(" ").pop())==null?void 0:te.split(",")[1])||0}"
        r="4"
        fill="${j}"
      />
    </svg>
  `},b=M=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(M),y=M=>{const w=M.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);if(w){const A=w[2],R=M.startsWith("<a:")?"gif":"png";return`<img src="https://cdn.discordapp.com/emojis/${A}.${R}" class="emoji" alt="emoji" loading="lazy" />`}return M};return hc(g,{initialInterval:5e3}),hc(_,{initialInterval:5e3}),Ct(()=>{g(),_()}),(M,w)=>{var A;return N(),V("div",US,[d("div",FS,[d("div",kS,[w[4]||(w[4]=d("h2",null,"📈 Coolness Stocks",-1)),d("div",OS,[d("span",BS,"ID: "+B(_e(e).slice(0,12))+"...",1),d("span",VS,B(b(s.value)),1)]),d("div",zS,[(N(!0),V($e,null,et(t.value,T=>{var R;return N(),V("div",{key:T.name,class:Be(["stock-card",{active:((R=r.value)==null?void 0:R.name)===T.name}]),onClick:x=>v(T)},[d("div",GS,[d("span",{class:"stock-avatar",innerHTML:y(T.avatar)},null,8,$S),d("span",WS,B(T.name),1)]),d("div",XS,B(b(T.price)),1),d("div",qS,[d("span",null,B(T.shares)+" shares",1),d("span",{class:Be({up:T.price>T.coolnessScore/10,down:T.price<T.coolnessScore/10})},B(T.price>T.coolnessScore/10?"↑":T.price<T.coolnessScore/10?"↓":"="),3)])],10,HS)}),128))])]),d("div",jS,[r.value?(N(),V("div",YS,[d("h3",null,[d("span",{innerHTML:y(r.value.avatar)},null,8,KS),Nt(" "+B(r.value.name),1)]),d("div",{class:"chart-container",innerHTML:p(r.value.priceHistory)},null,8,ZS),d("div",JS,[d("div",QS,B(b(r.value.price)),1),d("div",eb," Min: "+B(b(r.value.minPrice))+" / Max: "+B(b(r.value.maxPrice)),1)]),d("div",tb,[d("div",nb,[d("button",{class:Be({active:a.value==="buy"}),onClick:w[0]||(w[0]=T=>a.value="buy")}," 🟢 Buy ",2),d("button",{class:Be({active:a.value==="sell"}),onClick:w[1]||(w[1]=T=>a.value="sell")}," 🔴 Sell ",2)]),d("div",ib,[w[5]||(w[5]=d("label",null,"Shares:",-1)),_t(d("input",{type:"number","onUpdate:modelValue":w[2]||(w[2]=T=>o.value=T),min:"1",max:a.value==="sell"?c.value:Math.floor((((A=i.value)==null?void 0:A.cash)||0)/r.value.price),onInput:w[3]||(w[3]=T=>o.value=Math.max(1,o.value))},null,40,sb),[[Lt,o.value,void 0,{number:!0}]]),a.value==="sell"?(N(),V("span",rb," Owned: "+B(c.value),1)):Me("",!0)]),d("div",ob,[d("span",null,B(a.value==="buy"?"Cost":"Revenue")+":",1),d("span",ab,B(b(u.value)),1)]),d("button",{class:"trade-button",disabled:!h.value||l.value,onClick:m},B(l.value?"...":a.value==="buy"?"Buy":"Sell"),9,lb)])])):Me("",!0),i.value?(N(),V("div",cb,[w[9]||(w[9]=d("h3",null,"💼 My Portfolio",-1)),d("div",ub,[d("div",db,[w[6]||(w[6]=d("span",{class:"label"},"Cash:",-1)),d("span",fb,B(b(i.value.cash)),1)]),d("div",hb,[w[7]||(w[7]=d("span",{class:"label"},"Stocks:",-1)),d("span",pb,B(Object.values(i.value.holdings).reduce((T,R)=>T+R,0))+" shares",1)]),d("div",mb,[w[8]||(w[8]=d("span",{class:"label"},"Total:",-1)),d("span",gb,B(b(s.value)),1)])]),d("div",vb,[(N(!0),V($e,null,et(i.value.holdings,(T,R)=>_t((N(),V("div",{key:R,class:"holding-item"},[d("span",_b,B(R),1),d("span",xb,B(T)+" shares",1)])),[[r_,T>0]])),128))])])):Me("",!0),r.value?Me("",!0):(N(),V("div",yb,[...w[10]||(w[10]=[d("p",null,"Select a stock to start trading",-1)])]))])])])}}}),bb=ct(Sb,[["__scopeId","data-v-017bb2b9"]]),Mb=n=>{const e=nm();if(!e)return n;const t=e.endsWith("/")?e.slice(0,-1):e,i=n.startsWith("/")?n:`/${n}`;return`${t}${i}`},Pu=async(n,e={})=>{const t={"Content-Type":"application/json",...e.headers},i=Mb(n),s=await fetch(i,{...e,headers:t});if(s.status===429){const o=(await s.json()).retryAfter||60;throw console.error(`Rate limited. Please wait ${o} seconds before retrying`),new Error("RATE_LIMITED")}return s},Ao=(n,e="An error occurred")=>{if(n instanceof Error)switch(n.message){case"RATE_LIMITED":return"You are making too many requests. Please wait a moment and try again.";default:return n.message||e}if(n&&typeof n=="object"){const t=n;if(t.details&&Array.isArray(t.details)&&t.details.length>0)return t.details.map(s=>`${s.field.replace(/([A-Z])/g," $1").replace(/^./,o=>o.toUpperCase()).trim()}: ${s.message}`).join(`
`);if(t.error)return t.error}return e},Eb=async n=>{const e=await Pu(n,{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"GET request failed")}return e.json()},gf=async(n,e)=>{const t=await Pu(n,{method:"POST",body:e?JSON.stringify(e):void 0});if(!t.ok){const i=await t.json();throw new Error(i.error||"POST request failed")}return t.json()},wb=async n=>{const e=await Pu(n,{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"DELETE request failed")}return e.json()},Mr=n=>{console.error(n),alert(n)},fl=n=>{console.log(n),alert(n)},Tb={class:"movie-suggestions"},Ab={class:"suggestions-header"},Cb={key:0,class:"add-form"},Rb={class:"form-group"},Pb={key:0,class:"field-error"},Ib={class:"form-group"},Db={key:0,class:"field-error"},Lb={class:"form-row"},Nb={class:"form-group"},Ub={key:0,class:"field-error"},Fb={class:"form-group"},kb={key:0,class:"field-error"},Ob={class:"form-group"},Bb={key:0,class:"field-error"},Vb={class:"form-group"},zb={key:0,class:"field-error"},Hb={class:"form-actions"},Gb={key:1,class:"selected-bar"},$b={class:"movies-grid"},Wb=["onClick"],Xb={key:0,class:"movie-poster"},qb=["src","alt"],jb={key:1,class:"movie-poster-placeholder"},Yb={class:"movie-info"},Kb={key:0,class:"meta"},Zb={key:1,class:"meta"},Jb={key:2,class:"notes"},Qb={class:"footer"},eM={class:"suggested-by"},tM=["onClick"],nM={key:2,class:"empty-state"},iM=tt({__name:"MovieSuggestions",emits:["refresh"],setup(n,{emit:e}){const t=e,i=Q([]),s=Q(!1),r=Q({title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""}),o=Q([]),a=Q(""),l=Q({}),c=async()=>{try{const _=await Eb("/api/movies");i.value=_.movies}catch(_){Mr(Ao(_,"Failed to load movies"))}},u=async()=>{if(l.value={},!r.value.title.trim()){l.value.title="Title is required";return}if(!r.value.suggestedBy.trim()){l.value.suggestedBy="Your name is required";return}try{await gf("/api/movies",{title:r.value.title,suggestedBy:r.value.suggestedBy,year:r.value.year||void 0,genre:r.value.genre||void 0,notes:r.value.notes||void 0,thumbnail:r.value.thumbnail||void 0}),r.value={title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""},s.value=!1,fl("Movie added successfully!"),await c()}catch(_){const v=Ao(_,"Failed to add movie");v.includes(`
`)?v.split(`
`).forEach(p=>{const b=p.match(/^([^:]+): (.+)$/);if(b){const y=b[1].toLowerCase().replace(/\s+/g,"");l.value[y]=b[2]}}):Mr(v)}},f=async _=>{if(confirm("Are you sure you want to delete this movie?"))try{await wb(`/api/movies/${_}`),fl("Movie deleted successfully!"),await c()}catch(v){Mr(Ao(v,"Failed to delete movie"))}},h=async()=>{if(o.value.length<2){Mr("Please select at least 2 movies to vote on");return}if(confirm(`Start voting with ${o.value.length} movies?`))try{await gf("/api/movies/voting-round/start",{movieIds:o.value}),fl("Voting round started!"),o.value=[],t("refresh")}catch(_){Mr(Ao(_,"Failed to start voting round"))}},g=_=>{const v=o.value.indexOf(_);v>-1?o.value.splice(v,1):o.value.push(_)};return Ct(()=>{c(),a.value=localStorage.getItem("userId")||"user-"+Math.random().toString(36).substr(2,9),localStorage.setItem("userId",a.value)}),(_,v)=>(N(),V("div",Tb,[d("div",Ab,[v[8]||(v[8]=d("h2",null,"📝 Movie Suggestions",-1)),d("button",{class:"btn-primary",onClick:v[0]||(v[0]=m=>s.value=!s.value)},B(s.value?"Cancel":"+ Add Movie"),1)]),s.value?(N(),V("div",Cb,[v[15]||(v[15]=d("h3",null,"🎬 Add New Movie Suggestion",-1)),d("div",Rb,[v[9]||(v[9]=d("label",null,"Movie Title *",-1)),_t(d("input",{"onUpdate:modelValue":v[1]||(v[1]=m=>r.value.title=m),type:"text",placeholder:"Enter movie title...",required:"",class:Be({"has-error":l.value.title})},null,2),[[Lt,r.value.title]]),l.value.title?(N(),V("div",Pb,B(l.value.title),1)):Me("",!0)]),d("div",Ib,[v[10]||(v[10]=d("label",null,"Your Name *",-1)),_t(d("input",{"onUpdate:modelValue":v[2]||(v[2]=m=>r.value.suggestedBy=m),type:"text",placeholder:"Your name...",required:"",class:Be({"has-error":l.value.suggestedBy})},null,2),[[Lt,r.value.suggestedBy]]),l.value.suggestedBy?(N(),V("div",Db,B(l.value.suggestedBy),1)):Me("",!0)]),d("div",Lb,[d("div",Nb,[v[11]||(v[11]=d("label",null,"Year",-1)),_t(d("input",{"onUpdate:modelValue":v[3]||(v[3]=m=>r.value.year=m),type:"text",placeholder:"2024",class:Be({"has-error":l.value.year})},null,2),[[Lt,r.value.year]]),l.value.year?(N(),V("div",Ub,B(l.value.year),1)):Me("",!0)]),d("div",Fb,[v[12]||(v[12]=d("label",null,"Genre",-1)),_t(d("input",{"onUpdate:modelValue":v[4]||(v[4]=m=>r.value.genre=m),type:"text",placeholder:"Action, Comedy...",class:Be({"has-error":l.value.genre})},null,2),[[Lt,r.value.genre]]),l.value.genre?(N(),V("div",kb,B(l.value.genre),1)):Me("",!0)])]),d("div",Ob,[v[13]||(v[13]=d("label",null,"Notes",-1)),_t(d("textarea",{"onUpdate:modelValue":v[5]||(v[5]=m=>r.value.notes=m),placeholder:"Why this movie? Any details...",rows:"3",class:Be({"has-error":l.value.notes})},null,2),[[Lt,r.value.notes]]),l.value.notes?(N(),V("div",Bb,B(l.value.notes),1)):Me("",!0)]),d("div",Vb,[v[14]||(v[14]=d("label",null,"Thumbnail URL",-1)),_t(d("input",{"onUpdate:modelValue":v[6]||(v[6]=m=>r.value.thumbnail=m),type:"text",placeholder:"https://example.com/poster.jpg",class:Be({"has-error":l.value.thumbnail})},null,2),[[Lt,r.value.thumbnail]]),l.value.thumbnail?(N(),V("div",zb,B(l.value.thumbnail),1)):Me("",!0)]),d("div",Hb,[d("button",{class:"btn-secondary",onClick:v[7]||(v[7]=m=>s.value=!1)},"Cancel"),d("button",{class:"btn-primary",onClick:u},"Add Movie")])])):Me("",!0),o.value.length>0?(N(),V("div",Gb,[d("span",null,B(o.value.length)+" movie(s) selected for voting",1),d("button",{class:"btn-success",onClick:h},"Start Voting")])):Me("",!0),d("div",$b,[(N(!0),V($e,null,et(i.value,m=>(N(),V("div",{key:m.id,class:Be(["movie-card",{selected:o.value.includes(m.id)}]),onClick:p=>g(m.id)},[m.thumbnail?(N(),V("div",Xb,[d("img",{src:m.thumbnail,alt:m.title},null,8,qb)])):(N(),V("div",jb," 🎬 ")),d("div",Yb,[d("h3",null,B(m.title),1),m.year?(N(),V("p",Kb,B(m.year),1)):Me("",!0),m.genre?(N(),V("p",Zb,B(m.genre),1)):Me("",!0),m.notes?(N(),V("p",Jb,B(m.notes),1)):Me("",!0),d("div",Qb,[d("span",eM,"Suggested by "+B(m.suggestedBy),1),d("button",{class:"btn-delete",onClick:co(p=>f(m.id),["stop"]),title:"Delete movie"}," 🗑️ ",8,tM)])]),v[16]||(v[16]=d("div",{class:"select-check"}," ✓ ",-1))],10,Wb))),128))]),i.value.length===0?(N(),V("div",nM,[...v[17]||(v[17]=[d("p",null,"No movie suggestions yet. Add your first one! 🎬",-1)])])):Me("",!0)]))}}),sM=ct(iM,[["__scopeId","data-v-f7d44a16"]]);class rM{async getMovies(){const{data:e,error:t}=await Bt.GET("/movies",{});if(t)throw new Error(t.error||"Failed to get movies");return(e==null?void 0:e.movies)||[]}async getVotingRound(){const{data:e,error:t}=await Bt.GET("/movies/voting-round",{});if(t)throw new Error(t.error||"Failed to get voting round");return(e==null?void 0:e.round)||null}async startVotingRound(){const{data:e,error:t}=await Bt.POST("/movies/voting-round/start",{});if(t)throw new Error(t.error||"Failed to start voting round");return e}async endVotingRound(){const{data:e,error:t}=await Bt.POST("/movies/voting-round/end",{});if(t)throw new Error(t.error||"Failed to end voting round");return e}async resetVotingRound(){const{data:e,error:t}=await Bt.POST("/movies/voting-round/reset",{});if(t)throw new Error(t.error||"Failed to reset voting round");return e}async getVotes(){const{data:e,error:t}=await Bt.GET("/movies/votes",{});if(t)throw new Error(t.error||"Failed to get votes");return(e==null?void 0:e.votes)||[]}async getVote(e){try{const{data:t,error:i}=await Bt.GET("/movies/vote/{userId}",{params:{path:{userId:e}}});return i?null:(t==null?void 0:t.vote)||null}catch{return null}}async submitVote(e,t){const{data:i,error:s}=await Bt.POST("/movies/vote",{body:{userId:e,rankings:t}});if(s)throw new Error(s.error||"Failed to submit vote");return i}async deleteVote(e){const{data:t,error:i}=await Bt.DELETE("/movies/vote/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to delete vote");return t}}const zn=new rM,oM={class:"movie-voting"},aM={key:0,class:"no-voting"},lM={key:1,class:"voting-active"},cM={key:0,class:"has-voted"},uM={class:"voted-message"},dM={class:"my-ranking"},fM={class:"rank-number"},hM={key:1,class:"voting-form"},pM={class:"ranking-area"},mM={class:"ranking-header"},gM={class:"count"},vM={key:0,class:"empty-ranking"},_M={key:1,class:"ranking-list"},xM={class:"rank-badge"},yM={class:"movie-name"},SM={class:"movie-actions"},bM=["onClick","disabled"],MM=["onClick","disabled"],EM=["onClick"],wM={class:"available-movies"},TM={class:"movie-list"},AM={class:"movie-details"},CM={key:0,class:"meta"},RM={key:1,class:"meta"},PM={key:2,class:"notes"},IM=["onClick"],DM={key:1,class:"added-badge"},LM={class:"submit-section"},NM=["disabled"],UM=tt({__name:"MovieVoting",emits:["refresh"],setup(n,{emit:e}){const t=Q(null),i=Q([]),s=Q([]),r=Q(null),o=Q(!1),{userId:a}=sm(),l=ot(()=>t.value?t.value.movieIds.map(m=>i.value.find(p=>p.id===m)).filter(Boolean):[]),c=async()=>{var m;try{t.value=await zn.getVotingRound(),(m=t.value)!=null&&m.isActive&&await u()}catch(p){console.error("Failed to load voting round:",p)}},u=async()=>{try{i.value=await zn.getMovies()}catch(m){console.error("Failed to load movies:",m)}},f=async()=>{if(a.value)try{const m=await zn.getVote(a.value);m?(r.value=m,s.value=m.rankings,o.value=!0):o.value=!1}catch{o.value=!1}},h=async()=>{if(s.value.length<2){alert("Please rank at least 2 movies in order of preference");return}try{const m=await zn.submitVote(a.value,s.value);o.value=!0,r.value=m.vote,alert("Vote submitted! 🗳️")}catch(m){console.error("Error submitting vote:",m),alert("Failed to submit vote")}},g=m=>{if(m>0){const p=s.value.splice(m,1)[0];s.value.splice(m-1,0,p)}},_=m=>{if(m<s.value.length-1){const p=s.value.splice(m,1)[0];s.value.splice(m+1,0,p)}},v=m=>i.value.find(p=>p.id===m);return Ct(async()=>{await c(),await f()}),(m,p)=>(N(),V("div",oM,[!t.value||!t.value.isActive?(N(),V("div",aM,[...p[0]||(p[0]=[d("h2",null,"🗳️ No Active Voting Round",-1),d("p",null,"Voting hasn't started yet. Go to the Suggestions tab to select movies and start a voting round!",-1)])])):(N(),V("div",lM,[p[7]||(p[7]=d("div",{class:"voting-header"},[d("h2",null,"🗳️ Vote for Movie Night!"),d("p",{class:"subtitle"},"Rank movies in order of preference (Australian Parliament style)")],-1)),o.value?(N(),V("div",cM,[d("div",uM,[p[1]||(p[1]=d("h3",null,"✅ You've voted!",-1)),p[2]||(p[2]=d("p",null,"Your ranking:",-1)),d("ol",dM,[(N(!0),V($e,null,et(r.value.rankings,(b,y)=>{var M;return N(),V("li",{key:b},[d("span",fM,B(y+1),1),Nt(" "+B(((M=v(b))==null?void 0:M.title)||"Unknown"),1)])}),128))])])])):(N(),V("div",hM,[p[6]||(p[6]=d("div",{class:"instructions"},[d("h3",null,"📋 How to Vote"),d("ol",null,[d("li",null,'Add movies to your ranking by clicking the "+ Add" button'),d("li",null,"Drag or use arrows to reorder by preference (1st choice at the top)"),d("li",null,"Rank as many or as few as you like (minimum 2)"),d("li",null,`Click "Submit Vote" when you're done`)])],-1)),d("div",pM,[d("div",mM,[p[3]||(p[3]=d("h3",null,"Your Ranking (Priority Order)",-1)),d("span",gM,B(s.value.length)+" / "+B(l.value.length),1)]),s.value.length===0?(N(),V("div",vM,[...p[4]||(p[4]=[d("p",null,"No movies ranked yet. Add movies below!",-1)])])):(N(),V("div",_M,[(N(!0),V($e,null,et(s.value,(b,y)=>{var M;return N(),V("div",{key:b,class:"ranking-item"},[d("div",xM,B(y+1),1),d("div",yM,B(((M=v(b))==null?void 0:M.title)||"Unknown"),1),d("div",SM,[d("button",{class:"action-btn",onClick:w=>g(y),disabled:y===0,title:"Move up"}," ↑ ",8,bM),d("button",{class:"action-btn",onClick:w=>_(y),disabled:y===s.value.length-1,title:"Move down"}," ↓ ",8,MM),d("button",{class:"action-btn remove",onClick:w=>s.value.splice(y,1),title:"Remove"}," ✕ ",8,EM)])])}),128))]))]),d("div",wM,[p[5]||(p[5]=d("h3",null,"Available Movies",-1)),d("div",TM,[(N(!0),V($e,null,et(l.value,b=>(N(),V("div",{key:b.id,class:Be(["movie-item",{added:s.value.includes(b.id)}])},[d("div",AM,[d("strong",null,B(b.title),1),b.year?(N(),V("span",CM,"("+B(b.year)+")",1)):Me("",!0),b.genre?(N(),V("span",RM,"• "+B(b.genre),1)):Me("",!0),b.notes?(N(),V("p",PM,B(b.notes),1)):Me("",!0)]),s.value.includes(b.id)?(N(),V("span",DM,"Added")):(N(),V("button",{key:0,class:"add-btn",onClick:y=>s.value.push(b.id)}," + Add ",8,IM))],2))),128))])]),d("div",LM,[d("button",{class:"btn-submit",onClick:h,disabled:s.value.length<2}," Submit Vote ("+B(s.value.length)+" movies ranked) ",9,NM)])]))]))]))}}),FM=ct(UM,[["__scopeId","data-v-0d66ac84"]]),kM={class:"movie-results"},OM={key:0,class:"no-results"},BM={key:1,class:"voting-active"},VM={class:"active-message"},zM={class:"stats"},HM={class:"stat-item"},GM={class:"stat-value"},$M={class:"stat-item"},WM={class:"stat-value"},XM={key:2,class:"loading"},qM={key:3,class:"results-display"},jM={class:"results-header"},YM={class:"subtitle"},KM={key:0,class:"winner-section"},ZM={class:"winner-card"},JM={class:"winner-title"},QM={class:"winner-meta"},e1={key:0},t1={key:1},n1={class:"winner-suggested"},i1={class:"rounds-section"},s1={class:"rounds-container"},r1={class:"round-header"},o1={key:0,class:"final-badge"},a1={key:1,class:"eliminated-badge"},l1={class:"round-results"},c1={class:"result-title"},u1={key:0,class:"trophy"},d1={key:1,class:"eliminated-tag"},f1={class:"result-votes"},h1={class:"votes-bar"},p1={class:"votes-text"},m1={key:0,class:"round-note"},g1=tt({__name:"MovieResults",emits:["refresh"],setup(n,{emit:e}){const t=e,i=Q(null),s=Q([]),r=Q([]),o=Q(null),a=ot(()=>{var m;return!((m=i.value)!=null&&m.winner)||!s.value.length?null:s.value.find(p=>{var b;return p.id===((b=i.value)==null?void 0:b.winner)})}),l=m=>{const p=s.value.find(b=>b.id===m);return(p==null?void 0:p.title)||"Unknown"},c=async()=>{try{i.value=await zn.getVotingRound(),i.value&&(await u(),await f(),i.value.isActive||(o.value=h()))}catch(m){console.error("Failed to load voting round:",m)}},u=async()=>{try{s.value=await zn.getMovies()}catch(m){console.error("Failed to load movies:",m)}},f=async()=>{try{r.value=await zn.getVotes()}catch(m){console.error("Failed to load votes:",m)}},h=()=>{if(!i.value||!s.value.length)return null;const m=i.value.movieIds,p=s.value.filter(M=>m.includes(M.id)),b=r.value.filter(M=>M.rankings.some(w=>m.includes(w)));return{rounds:g(p,b),totalVotes:b.length,winner:i.value.winner}},g=(m,p)=>{if(m.length===0)return[];const b=[];let y=[...m],M=1;for(;y.length>0;){const w={};y.forEach(U=>w[U.id]=0),p.forEach(U=>{for(const O of U.rankings)if(w.hasOwnProperty(O)){w[O]++;break}});const A=y.map(U=>({movieId:U.id,title:U.title,votes:w[U.id]||0,percentage:p.length>0?(w[U.id]||0)/p.length*100:0,eliminated:!1}));A.sort((U,O)=>O.votes-U.votes);const R=A[0].votes>p.length/2,x=y.length===1;if(R||x){b.push({round:M,eliminated:x?null:A[A.length-1].movieId,winner:A[0].movieId,results:A,isFinal:!0});break}A[A.length-1].eliminated=!0,b.push({round:M,eliminated:A[A.length-1].movieId,results:A,isFinal:!1});const E=A[A.length-1].movieId;y=y.filter(U=>U.id!==E),M++}return b},_=async()=>{var m;if(confirm("Are you sure you want to end voting? This will calculate the winner and close the voting round."))try{const p=await zn.endVotingRound();alert("Voting ended! The winner is "+(((m=a.value)==null?void 0:m.title)||"Unknown")+"! 🏆"),await c(),t("refresh")}catch(p){console.error("Error ending voting:",p),alert("Failed to end voting")}},v=async()=>{if(confirm("Are you sure you want to reset all voting? This will delete all votes and the current round."))try{await zn.resetVotingRound(),alert("Voting reset successfully!"),o.value=null,t("refresh")}catch(m){console.error("Error resetting voting:",m),alert("Failed to reset voting")}};return Ct(()=>{c()}),(m,p)=>(N(),V("div",kM,[i.value?i.value.isActive?(N(),V("div",BM,[d("div",VM,[p[3]||(p[3]=d("h2",null,"🗳️ Voting in Progress",-1)),p[4]||(p[4]=d("p",null,"Voting is still open. Click the button below when everyone has voted!",-1)),d("div",zM,[d("div",HM,[d("span",GM,B(r.value.length),1),p[1]||(p[1]=d("span",{class:"stat-label"},"Votes Cast",-1))]),d("div",$M,[d("span",WM,B(s.value.filter(b=>{var y;return(y=i.value)==null?void 0:y.movieIds.includes(b.id)}).length),1),p[2]||(p[2]=d("span",{class:"stat-label"},"Movies",-1))])]),d("button",{class:"btn-end",onClick:_},"🏁 End Voting")])])):o.value?(N(),V("div",qM,[d("div",jM,[p[6]||(p[6]=d("h2",null,"🏆 Voting Results",-1)),d("p",YM,B(o.value.totalVotes)+" votes cast • Australian Parliament preferential voting",1),d("button",{class:"btn-reset",onClick:v},"🔄 Reset Voting")]),a.value?(N(),V("div",KM,[d("div",ZM,[p[7]||(p[7]=d("div",{class:"winner-badge"},"🏆 WINNER",-1)),d("h3",JM,B(a.value.title),1),d("p",QM,[a.value.year?(N(),V("span",e1,B(a.value.year),1)):Me("",!0),a.value.genre?(N(),V("span",t1,"• "+B(a.value.genre),1)):Me("",!0)]),d("p",n1,"Suggested by "+B(a.value.suggestedBy),1)])])):Me("",!0),d("div",i1,[p[8]||(p[8]=d("h3",null,"📊 Voting Rounds (Preferential)",-1)),d("div",s1,[(N(!0),V($e,null,et(o.value.rounds,(b,y)=>(N(),V("div",{key:y,class:Be(["round-card",{final:b.isFinal}])},[d("div",r1,[d("h4",null,"Round "+B(b.round),1),b.isFinal?(N(),V("span",o1,"FINAL")):Me("",!0),b.eliminated?(N(),V("span",a1," Eliminated: "+B(l(b.eliminated)),1)):Me("",!0)]),d("div",l1,[(N(!0),V($e,null,et(b.results,M=>(N(),V("div",{key:M.movieId,class:Be(["result-item",{winner:b.winner===M.movieId,eliminated:M.eliminated}])},[d("div",c1,[b.winner===M.movieId?(N(),V("span",u1,"🏆")):Me("",!0),Nt(" "+B(M.title)+" ",1),M.eliminated?(N(),V("span",d1,"✕")):Me("",!0)]),d("div",f1,[d("div",h1,[d("div",{class:"votes-fill",style:Dt({width:M.percentage+"%"})},null,4)]),d("div",p1,B(M.votes)+" votes ("+B(M.percentage.toFixed(1))+"%) ",1)])],2))),128))]),b.isFinal?(N(),V("div",m1,[d("p",null,"✨ "+B(b.winner?l(b.winner):"Candidate")+" achieved majority!",1)])):Me("",!0)],2))),128))])]),p[9]||(p[9]=d("div",{class:"how-it-works"},[d("h3",null,"📖 How Preferential Voting Works"),d("ol",null,[d("li",null,"Voters rank movies in order of preference (1st, 2nd, 3rd...)"),d("li",null,"In Round 1, only 1st preferences are counted"),d("li",null,"If no movie has >50% of votes, the lowest-ranked movie is eliminated"),d("li",null,"Votes for the eliminated movie are redistributed to voters' next preferences"),d("li",null,"This continues until one movie has >50% (majority) or only one remains")])],-1))])):(N(),V("div",XM,[...p[5]||(p[5]=[d("p",null,"Loading results...",-1)])])):(N(),V("div",OM,[...p[0]||(p[0]=[d("h2",null,"🏆 Voting Results",-1),d("p",null,"No voting round has been created yet.",-1)])]))]))}}),v1=ct(g1,[["__scopeId","data-v-1a5de110"]]),_1={class:"movie-page"},x1={class:"tabs"},y1={key:0,class:"badge"},S1={class:"tab-content"},b1=tt({__name:"MoviePage",setup(n){const e=Q("suggestions"),t=Q(null),i=async()=>{var r;try{t.value=await zn.getVotingRound(),(r=t.value)!=null&&r.isActive&&e.value==="results"&&(e.value="voting")}catch(o){console.error("Failed to fetch voting round:",o)}},{data:s}=hc(()=>zn.getVotingRound(),{initialInterval:1e4});return Ct(()=>{i()}),Un(s,r=>{r&&(t.value=r,r.isActive&&e.value==="results"&&(e.value="voting"))}),(r,o)=>{var a;return N(),V("div",_1,[o[4]||(o[4]=d("div",{class:"movie-header"},[d("h1",null,"🎬 Movie Night 🎬"),d("p",{class:"subtitle"},"Fortnightly movie suggestions & preferential voting")],-1)),d("div",x1,[d("button",{class:Be(["tab",{active:e.value==="suggestions"}]),onClick:o[0]||(o[0]=l=>e.value="suggestions")}," 📝 Suggestions ",2),d("button",{class:Be(["tab",{active:e.value==="voting"}]),onClick:o[1]||(o[1]=l=>e.value="voting")},[o[3]||(o[3]=Nt(" 🗳️ Vote ",-1)),(a=t.value)!=null&&a.isActive?(N(),V("span",y1,"Active")):Me("",!0)],2),d("button",{class:Be(["tab",{active:e.value==="results"}]),onClick:o[2]||(o[2]=l=>e.value="results")}," 🏆 Results ",2)]),d("div",S1,[e.value==="suggestions"?(N(),Yt(sM,{key:0,onRefresh:i})):Me("",!0),e.value==="voting"?(N(),Yt(FM,{key:1,onRefresh:i})):Me("",!0),e.value==="results"?(N(),Yt(v1,{key:2,onRefresh:i})):Me("",!0)])])}}}),M1=ct(b1,[["__scopeId","data-v-a035d778"]]),E1={class:"countdown-container"},w1={class:"countdown-grid"},T1={class:"game-image"},A1=["src","alt"],C1={class:"game-emoji"},R1={class:"game-info"},P1={class:"game-title"},I1={class:"game-description"},D1={class:"release-date"},L1={class:"countdown-display"},N1={key:0,class:"released-badge"},U1={key:1,class:"infinity-badge"},F1={key:2,class:"timer"},k1={class:"time-unit"},O1={class:"time-value"},B1={class:"time-unit"},V1={class:"time-value"},z1={class:"time-unit"},H1={class:"time-value"},G1={class:"time-unit"},$1={class:"time-value"},W1=tt({__name:"CountdownPage",setup(n){const e=Qt(),t=[{title:"Orlando's Roommate's Cat comes to Orlando's apartment",game:"orlando-roommate-cat",date:new Date("2026-02-20T00:00:00Z"),description:"The big day approaches...",emoji:"🐈",image:"/orlando-roommate-cat.png"},{title:"ZAI Key Expiration",game:"zai-key-expiration",date:new Date("2026-05-04T00:00:00Z"),description:"The ZAI API key runs out. Time to renew or find an alternative!",emoji:"🔑",image:"/zai-key-expiration.png"},{title:"New Mewgenics",game:"new-mewgenics",date:new Date("2026-02-10T00:00:00Z"),description:"The next generation of Pokémon games",emoji:"🎮",image:"https://static01.nyt.com/images/2010/06/14/business/sub-jp-burger-2/sub-jp-burger-2-popup.jpg?quality=75&auto=webp&disable=upscale"},{title:"Slay The Spire 2",game:"slay-the-spire-2",date:new Date("2026-03-15T00:00:00Z"),description:"The highly anticipated sequel returns",emoji:"🗡️",image:"https://assetsio.gnwcdn.com/uno-hand_I1JrsbV.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp"},{title:"Tomodachi Life: Living in Dream",game:"tomodachi-life",date:new Date("2026-04-16T00:00:00Z"),description:"Continue your cozy life as a cat in this cozy sequel",emoji:"🐱",image:"/tomodachi-life.png"},{title:"The Heat Death of Universe",game:"heat-death-of-universe",date:new Date("12006-01-01T00:00:00Z"),description:"The universe faces its ultimate fate in 10^100 years (a googol)",emoji:"🌌",image:"https://www.italia.it/content/dam/tdh/en/destinations/lazio/frosinone/media/google/image3.jpeg",infinite:!0}],i=Q(new Date);let s=null;Ct(()=>{s=window.setInterval(()=>{i.value=new Date},1e3)}),Yn(()=>{s&&clearInterval(s)});const r=l=>{const c=l.getTime()-i.value.getTime();if(c<=0)return{released:!0,days:0,hours:0,minutes:0,seconds:0};const u=Math.floor(c/(1e3*60*60*24)),f=Math.floor(c%(1e3*60*60*24)/(1e3*60*60)),h=Math.floor(c%(1e3*60*60)/(1e3*60)),g=Math.floor(c%(1e3*60)/1e3);return{released:!1,days:u,hours:f,minutes:h,seconds:g}},o=l=>l.toString().padStart(2,"0"),a=ot(()=>[...t].sort((l,c)=>l.date.getTime()-c.date.getTime()));return(l,c)=>(N(),V("div",{class:Be(["countdown-page",{dark:_e(e).darkMode}])},[d("div",E1,[c[4]||(c[4]=d("div",{class:"countdown-header"},[d("h1",null,"🎮 Game Release Countdowns"),d("p",{class:"subtitle"},"Time until your most anticipated games!")],-1)),d("div",w1,[(N(!0),V($e,null,et(a.value,u=>(N(),V("div",{key:u.game,class:Be(["countdown-card",{released:r(u.date).released}])},[d("div",T1,[d("img",{src:u.image,alt:u.title},null,8,A1),d("div",C1,B(u.emoji),1)]),d("div",R1,[d("h3",P1,B(u.title),1),d("p",I1,B(u.description),1),d("p",D1,"Release: "+B(u.date.toLocaleDateString(void 0,{month:"long",day:"numeric",year:"numeric"})),1)]),d("div",L1,[r(u.date).released?(N(),V("div",N1," ✨ Released! ✨ ")):u.infinite?(N(),V("div",U1," ∞ 10¹⁰⁰ years ")):(N(),V("div",F1,[d("div",k1,[d("span",O1,B(o(r(u.date).days)),1),c[0]||(c[0]=d("span",{class:"time-label"},"Days",-1))]),d("div",B1,[d("span",V1,B(o(r(u.date).hours)),1),c[1]||(c[1]=d("span",{class:"time-label"},"Hours",-1))]),d("div",z1,[d("span",H1,B(o(r(u.date).minutes)),1),c[2]||(c[2]=d("span",{class:"time-label"},"Minutes",-1))]),d("div",G1,[d("span",$1,B(o(r(u.date).seconds)),1),c[3]||(c[3]=d("span",{class:"time-label"},"Seconds",-1))])]))])],2))),128))]),c[5]||(c[5]=d("div",{class:"footer-note"},[d("p",null,[Nt("📌 "),d("strong",null,"Real Release Dates:")]),d("p",null,"New Mewgenics - February 10, 2026"),d("p",null,"Slay The Spire 2 - March 15, 2026"),d("p",null,"Tomodachi Life - April 16, 2026"),d("p",null,"ZAI Key Expiration - May 4, 2026"),d("p",null,"The Heat Death of Universe - 10^100 (a googol) years from now!"),d("p",{class:"credit"},"🖼 Images by Orlando")],-1))])],2))}}),X1=ct(W1,[["__scopeId","data-v-389aec34"]]),q1={class:"modal-container"},j1={class:"modal-header"},Y1={class:"modal-title"},K1={class:"modal-body"},Z1=tt({__name:"Modal",props:{isOpen:{type:Boolean},title:{}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")},s=r=>{r.key==="Escape"&&i()};return Ct(()=>{document.addEventListener("keydown",s)}),Yn(()=>{document.removeEventListener("keydown",s)}),(r,o)=>(N(),Yt(jg,{to:"body"},[n.isOpen?(N(),V("div",{key:0,class:"modal-overlay",onClick:co(i,["self"])},[d("div",q1,[d("div",j1,[d("h2",Y1,B(n.title),1),d("button",{class:"modal-close-btn",onClick:i,"aria-label":"Close"},"×")]),d("div",K1,[lp(r.$slots,"default",{},void 0)])])])):Me("",!0)]))}}),ia=ct(Z1,[["__scopeId","data-v-57552658"]]),J1={class:"ticket-form-content"},Q1={class:"form-group"},eE=["disabled"],tE={class:"form-group"},nE=["disabled"],iE={class:"form-actions"},sE=["disabled"],rE=["disabled"],oE={key:0,class:"estimated-wait-time"},aE={class:"wait-text"},lE={class:"wait-subtext"},cE=tt({__name:"TicketForm",props:{title:{},description:{},type:{},priority:{},isEditing:{type:Boolean,default:!1},loading:{type:Boolean,default:!1},estimatedWaitTimeMinutes:{default:null},sampleSize:{default:0}},emits:["update:title","update:description","update:type","update:priority","submit","cancel"],setup(n,{emit:e}){const t=n,i=e,s=ot({get:()=>t.title,set:f=>i("update:title",f)}),r=ot({get:()=>t.description,set:f=>i("update:description",f)}),o=ot(()=>t.title.trim()!==""),a=()=>{o.value&&i("submit")},l=()=>{i("cancel")},c=f=>{f.ctrlKey&&f.key==="Enter"&&(f.preventDefault(),a())},u=f=>{if(f<60)return`${Math.round(f)} minutes`;if(f<1440){const h=Math.floor(f/60),g=Math.round(f%60);return g===0?`${h} hour${h>1?"s":""}`:`${h} hour${h>1?"s":""} ${g} min`}else{const h=Math.floor(f/1440),g=Math.round(f%1440/60);return g===0?`${h} day${h>1?"s":""}`:`${h} day${h>1?"s":""} ${g}h`}};return(f,h)=>(N(),V("div",J1,[d("div",Q1,[h[2]||(h[2]=d("label",{for:"ticket-title"},"Title",-1)),_t(d("input",{id:"ticket-title","onUpdate:modelValue":h[0]||(h[0]=g=>s.value=g),type:"text",placeholder:"Brief summary of your ticket...",disabled:n.loading,onKeydown:c},null,40,eE),[[Lt,s.value]])]),d("div",tE,[h[3]||(h[3]=d("label",{for:"ticket-description"},"Description",-1)),_t(d("textarea",{id:"ticket-description","onUpdate:modelValue":h[1]||(h[1]=g=>r.value=g),placeholder:"Detailed description of your request...",rows:"6",disabled:n.loading,onKeydown:c},null,40,nE),[[Lt,r.value]])]),d("div",iE,[n.isEditing?(N(),V("button",{key:0,onClick:l,class:"btn btn-cancel",disabled:n.loading}," Cancel ",8,sE)):Me("",!0),d("button",{type:"button",onClick:a,class:"btn btn-submit",disabled:n.loading||!o.value},B(n.loading?"Saving...":n.isEditing?"Save Changes":"Submit Ticket"),9,rE)]),h[6]||(h[6]=d("div",{class:"form-hint"},[Nt(" 💡 Tip: Press "),d("kbd",null,"Ctrl"),Nt(" + "),d("kbd",null,"Enter"),Nt(" to submit quickly ")],-1)),!n.isEditing&&n.estimatedWaitTimeMinutes!==null?(N(),V("div",oE,[h[5]||(h[5]=d("span",{class:"wait-icon"},"⏱️",-1)),d("span",aE,[h[4]||(h[4]=Nt(" Estimated wait time: ",-1)),d("strong",null,B(u(n.estimatedWaitTimeMinutes)),1),d("span",lE,"(based on "+B(n.sampleSize)+" completed tickets)",1)])])):Me("",!0)]))}}),vf=ct(cE,[["__scopeId","data-v-e8477fc4"]]),uE={class:"tickets-page"},dE={class:"tickets-container"},fE={class:"tickets-header"},hE={key:0,class:"last-collection"},pE={class:"collection-text"},mE={class:"ignore-mode-toggle"},gE={class:"toggle-switch"},vE=["checked"],_E={class:"toggle-label"},xE={key:0,class:"ticket-stats-section"},yE={class:"stats-grid"},SE={class:"stat-card"},bE={class:"stat-value"},ME={class:"stat-card"},EE={class:"status-breakdown"},wE={class:"status-badge status-pending"},TE={class:"status-badge status-needs-info"},AE={class:"status-badge status-completed"},CE={class:"status-badge status-declined"},RE={class:"stat-card"},PE={class:"ticket-info"},IE={class:"ticket-id"},DE={class:"ticket-title"},LE={class:"ticket-date"},NE={class:"stat-card"},UE={class:"ticket-info"},FE={class:"ticket-id"},kE={class:"ticket-title"},OE={class:"ticket-date"},BE={class:"stat-card"},VE={class:"date-range"},zE={class:"date-value"},HE={class:"date-value"},GE={key:0,class:"completed-date"},$E={class:"date-value"},WE={class:"date-value"},XE={class:"notification-icon"},qE={class:"notification-message"},jE={class:"filter-section"},YE={class:"search-box"},KE={class:"filter-group"},ZE=["value"],JE={key:2,class:"kanban-board"},QE={key:0,class:"loading-state"},ew={key:1,class:"empty-state"},tw={key:2,class:"kanban-columns"},nw={class:"kanban-column"},iw={class:"column-header"},sw={class:"column-count"},rw={class:"column-tickets"},ow={class:"ticket-header"},aw={class:"ticket-title"},lw={class:"ticket-description"},cw={class:"ticket-meta"},uw={class:"ticket-date"},dw={class:"ticket-actions"},fw=["onClick","disabled"],hw=["onClick","disabled"],pw={key:0,class:"empty-column"},mw={class:"kanban-column"},gw={class:"column-header"},vw={class:"column-count"},_w={class:"column-tickets"},xw={class:"ticket-header"},yw={class:"ticket-title"},Sw={class:"ticket-description"},bw={class:"ticket-meta"},Mw={class:"ticket-date"},Ew={key:0,class:"empty-column"},ww={class:"kanban-column"},Tw={class:"column-header"},Aw={class:"column-count"},Cw={class:"column-tickets"},Rw={class:"ticket-header"},Pw={class:"ticket-title"},Iw={class:"ticket-description"},Dw={class:"ticket-meta"},Lw={class:"ticket-date"},Nw={class:"ticket-actions"},Uw=["onClick","disabled"],Fw={key:0,class:"ticket-response"},kw={class:"response-text"},Ow={key:0,class:"empty-column"},Bw={key:3,class:"tickets-list"},Vw={key:0,class:"loading-state"},zw={key:1,class:"empty-state"},Hw={class:"ticket-header"},Gw={class:"ticket-title"},$w={class:"ticket-badges"},Ww={class:"ticket-description"},Xw={class:"ticket-meta"},qw={class:"ticket-date"},jw={class:"ticket-actions"},Yw=["onClick","disabled"],Kw=["onClick","disabled"],Zw=["onClick","disabled"],Jw={key:0,class:"ticket-response"},Qw={class:"response-text"},eT={key:0,class:"confirm-modal-content"},tT={class:"ticket-preview"},nT={key:0,class:"existing-response"},iT={class:"confirm-actions"},sT={class:"api-key-input"},rT={class:"action-buttons"},oT=["disabled"],aT={class:"unresolved-section"},lT=["disabled"],cT=tt({__name:"TicketsPage",setup(n){const e=Q([]),t=Q(!1),i=Q(null),s=Q(null),r=Q(!1),o=Q(!1),a=Q(null),l=Q(null),c=Q({show:!1,message:"",type:"success"}),u=Q("all"),f=Q("all"),h=Q("all"),g=Q(""),_=Q(null),v=Q(""),m=Q(null),p=Q(!1),b=Q({reason:""}),y=Q(""),M=Q({title:"",description:"",type:"feature",priority:"medium"}),w=Q(!1),A=Q(null),T=Q({title:"",description:"",type:"feature",priority:"medium"}),R={pending:"bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700","needs-info":"bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",completed:"bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",declined:"bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",unresolved:"bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"},x={pending:"⏳ Pending","needs-info":"🔄 In Progress",completed:"✅ Complete",declined:"❌ Declined",unresolved:"⚠️ Unresolved"},E=[{value:"all",label:"📋 All"},{value:"pending",label:"⏳ Pending"},{value:"in-progress",label:"🔄 In Progress"},{value:"completed",label:"✅ Complete"}],U=ot(()=>{let H=e.value;if(u.value!=="all"){const D=u.value==="in-progress"?"needs-info":u.value;H=H.filter(W=>W.status===D)}if(f.value!=="all"&&(H=H.filter(D=>D.type===f.value)),h.value!=="all"&&(H=H.filter(D=>D.priority===h.value)),g.value.trim()){const D=g.value.toLowerCase().trim();H=H.filter(W=>W.title.toLowerCase().includes(D)||W.description.toLowerCase().includes(D))}return H}),O=ot(()=>({pending:e.value.filter(H=>H.status==="pending"),inProgress:e.value.filter(H=>H.status==="needs-info"),completed:e.value.filter(H=>H.status==="completed")})),j=()=>{let H=localStorage.getItem("tickets-creator-id");return H||(H="user_"+Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15),localStorage.setItem("tickets-creator-id",H)),H},ee=H=>!!(H.creator_id&&H.creator_id===y.value),te=async()=>{t.value=!0,i.value=null;try{const H=await fetch("/api/tickets?sortBy=updated_at");if(!H.ok)throw new Error("Failed to load tickets");const D=await H.json();e.value=D.tickets||[]}catch(H){i.value=H instanceof Error?H.message:"Failed to load tickets"}finally{t.value=!1}},K=async()=>{try{const H=await fetch("/api/tickets/stats");if(!H.ok)throw new Error("Failed to load ticket stats");const D=await H.json();s.value=D}catch(H){console.warn("Failed to load ticket stats:",H)}},I=(H,D="success")=>{c.value={show:!0,message:H,type:D},setTimeout(()=>{c.value.show=!1},3e3)},F=()=>{c.value.show=!1},$=async()=>{if(!M.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const H=await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:M.value.title.trim(),description:M.value.description.trim()||null,creator_id:y.value})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to submit ticket")}M.value={title:"",description:"",type:"feature",priority:"medium"},r.value=!1,I("Ticket submitted successfully!"),await te()}catch(H){i.value=H instanceof Error?H.message:"Failed to submit ticket"}finally{t.value=!1}},J=H=>{A.value=H,T.value={title:H.title,description:H.description,type:H.type,priority:H.priority},w.value=!0},oe=()=>{A.value=null,w.value=!1,T.value={title:"",description:"",type:"feature",priority:"medium"}},we=async()=>{if(A.value){if(!T.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${A.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:T.value.title.trim(),description:T.value.description.trim()||null})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to update ticket")}A.value=null,w.value=!1,T.value={title:"",description:"",type:"feature",priority:"medium"},I("Ticket updated successfully!"),await te()}catch(H){i.value=H instanceof Error?H.message:"Failed to update ticket"}finally{t.value=!1}}},De=H=>new Date(H).toLocaleDateString(void 0,{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),rt=async()=>{const H=!o.value;localStorage.setItem("tickets-ignore-mode",String(H)),o.value=H;try{await fetch("/api/tickets/settings/ignore-mode",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ignoreMode:H})})}catch(D){console.error("Failed to sync ignore mode with backend:",D)}},lt=async()=>{try{const H=await fetch("/api/tickets/settings/ignore-mode");if(H.ok){const D=await H.json();o.value=D.ignoreMode,localStorage.setItem("tickets-ignore-mode",String(D.ignoreMode))}}catch{console.warn("Failed to load ignore mode from backend, using localStorage");const D=localStorage.getItem("tickets-ignore-mode");D&&(o.value=D==="true")}},de=async()=>{try{const H=await fetch("/api/tickets/settings/last-collection");if(H.ok){const D=await H.json();a.value=D.lastCollection}}catch(H){console.warn("Failed to load last collection from backend:",H)}},X=async()=>{try{const H=await fetch("/api/tickets/estimated-wait-time");if(H.ok){const D=await H.json();D.estimatedWaitTimeMinutes!==null&&(l.value={minutes:D.estimatedWaitTimeMinutes,sampleSize:D.sampleSize})}}catch(H){console.warn("Failed to load estimated wait time from backend:",H)}},ce=()=>{const H=localStorage.getItem("tickets-admin-api-key");H&&(v.value=H)},me=H=>{m.value=H,p.value=!0},he=()=>{m.value=null,p.value=!1,b.value={reason:""}},Fe=async()=>{if(m.value){if(!v.value.trim()){i.value="API key is required to confirm tickets";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${m.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","X-API-Key":v.value.trim()},body:JSON.stringify({status:"completed",response:m.value.response||(b.value.reason?`Confirmed: ${b.value.reason}`:"Confirmed by human reviewer")})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to confirm ticket")}m.value=null,p.value=!1,b.value={reason:""},I("Ticket confirmed successfully!"),await te()}catch(H){i.value=H instanceof Error?H.message:"Failed to confirm ticket"}finally{t.value=!1}}},k=async()=>{if(m.value){if(!b.value.reason.trim()){i.value="Reason is required to mark ticket as unresolved";return}if(!v.value.trim()){i.value="API key is required";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${m.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","X-API-Key":v.value.trim()},body:JSON.stringify({status:"unresolved",response:`Unresolved: ${b.value.reason}`})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to mark ticket as unresolved")}m.value=null,p.value=!1,b.value={reason:""},I("Ticket marked as unresolved!"),await te()}catch(H){i.value=H instanceof Error?H.message:"Failed to mark ticket as unresolved"}finally{t.value=!1}}},z=async H=>{t.value=!0,i.value=null;try{const D=await fetch(`/api/tickets/${H.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed",creator_id:y.value})});if(!D.ok){const W=await D.json();throw new Error(W.error||"Failed to close ticket")}I("Ticket closed successfully!"),await te()}catch(D){i.value=D instanceof Error?D.message:"Failed to close ticket"}finally{t.value=!1}},q=async H=>{if(confirm(`Are you sure you want to delete "${H.title}"?`)){t.value=!0,i.value=null;try{const D=await fetch(`/api/tickets/${H.id}`,{method:"DELETE",headers:{"Content-Type":"application/json","X-Creator-ID":y.value},body:JSON.stringify({creator_id:y.value})});if(!D.ok){const W=await D.json();throw new Error(W.error||"Failed to delete ticket")}await te()}catch(D){i.value=D instanceof Error?D.message:"Failed to delete ticket"}finally{t.value=!1}}};return Ct(()=>{y.value=j(),lt(),de(),X(),ce(),te(),K();const H=D=>{var W;D.target instanceof HTMLInputElement||D.target instanceof HTMLTextAreaElement||((D.key==="n"||D.key==="c"||D.key==="N"||D.key==="C")&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),r.value=!0),D.key==="/"&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),(W=_.value)==null||W.focus()))};window.addEventListener("keydown",H)}),Yn(()=>{const H=D=>{var W;D.target instanceof HTMLInputElement||D.target instanceof HTMLTextAreaElement||((D.key==="n"||D.key==="c"||D.key==="N"||D.key==="C")&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),r.value=!0),D.key==="/"&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),(W=_.value)==null||W.focus()))};window.removeEventListener("keydown",H)}),(H,D)=>(N(),V("div",uE,[d("div",dE,[d("div",fE,[D[14]||(D[14]=d("h1",null,"🎫 Tickets & Feedback",-1)),D[15]||(D[15]=d("p",null,"Submit requests, report bugs, or share your ideas",-1)),D[16]||(D[16]=d("div",{class:"keyboard-hints"},[d("span",{class:"hint"},[d("kbd",null,"N"),Nt(" New ticket")]),d("span",{class:"hint"},[d("kbd",null,"/"),Nt(" Search")])],-1)),a.value?(N(),V("div",hE,[D[12]||(D[12]=d("span",{class:"collection-icon"},"🕐",-1)),d("span",pE,"Last collected: "+B(De(a.value)),1)])):Me("",!0),d("div",mE,[d("label",gE,[d("input",{type:"checkbox",checked:o.value,onChange:rt},null,40,vE),D[13]||(D[13]=d("span",{class:"toggle-slider"},null,-1))]),d("span",_E,B(o.value?"🚫 Paused - Ignoring all tickets":"✅ Active - Processing tickets"),1)])]),s.value?(N(),V("div",xE,[D[26]||(D[26]=d("h3",{class:"stats-title"},"📊 Ticket Statistics",-1)),d("div",yE,[d("div",SE,[D[17]||(D[17]=d("span",{class:"stat-label"},"Total Tickets",-1)),d("span",bE,B(s.value.totalTickets),1)]),d("div",ME,[D[18]||(D[18]=d("span",{class:"stat-label"},"By Status",-1)),d("div",EE,[d("span",wE," ⏳ "+B(s.value.byStatus.pending||0),1),d("span",TE," 🔄 "+B(s.value.byStatus["needs-info"]||0),1),d("span",AE," ✅ "+B(s.value.byStatus.completed||0),1),d("span",CE," ❌ "+B(s.value.byStatus.declined||0),1)])]),d("div",RE,[D[19]||(D[19]=d("span",{class:"stat-label"},"Oldest Ticket",-1)),d("div",PE,[d("span",IE,"#"+B(s.value.oldestTicket.id),1),d("span",DE,B(s.value.oldestTicket.title),1)]),d("span",LE,B(De(s.value.oldestTicket.created_at)),1)]),d("div",NE,[D[20]||(D[20]=d("span",{class:"stat-label"},"Newest Ticket",-1)),d("div",UE,[d("span",FE,"#"+B(s.value.newestTicket.id),1),d("span",kE,B(s.value.newestTicket.title),1)]),d("span",OE,B(De(s.value.newestTicket.created_at)),1)]),d("div",BE,[D[25]||(D[25]=d("span",{class:"stat-label"},"Date Range",-1)),d("div",VE,[d("div",null,[D[21]||(D[21]=Nt("Created: ",-1)),d("span",zE,B(De(s.value.dates.oldestCreated)),1),D[22]||(D[22]=Nt(" to ",-1)),d("span",HE,B(De(s.value.dates.newestCreated)),1)]),s.value.dates.oldestCompleted?(N(),V("div",GE,[D[23]||(D[23]=Nt("Completed: ",-1)),d("span",$E,B(De(s.value.dates.oldestCompleted)),1),D[24]||(D[24]=Nt(" to ",-1)),d("span",WE,B(De(s.value.dates.newestCompleted)),1)])):Me("",!0)])])])])):Me("",!0),c.value.show?(N(),V("div",{key:1,class:Be(["notification",`notification-${c.value.type}`])},[d("span",XE,B(c.value.type==="success"?"✅":"❌"),1),d("span",qE,B(c.value.message),1),d("button",{onClick:F,class:"notification-close"},"×")],2)):Me("",!0),d("button",{onClick:D[0]||(D[0]=W=>r.value=!0),class:"new-ticket-btn"}," + New Ticket "),d("div",jE,[d("div",YE,[_t(d("input",{ref_key:"searchInputRef",ref:_,"onUpdate:modelValue":D[1]||(D[1]=W=>g.value=W),type:"text",placeholder:"🔍 Search tickets... (press / to focus)",class:"search-input"},null,512),[[Lt,g.value]]),g.value?(N(),V("button",{key:0,onClick:D[2]||(D[2]=W=>g.value=""),class:"search-clear",title:"Clear search"}," ✕ ")):Me("",!0)]),d("div",KE,[D[27]||(D[27]=d("label",{for:"status-filter",class:"filter-label"},"Status:",-1)),_t(d("select",{id:"status-filter","onUpdate:modelValue":D[3]||(D[3]=W=>u.value=W),class:"filter-dropdown"},[(N(),V($e,null,et(E,W=>d("option",{key:W.value,value:W.value},B(W.label),9,ZE)),64))],512),[[wu,u.value]])])]),u.value==="all"?(N(),V("div",JE,[t.value?(N(),V("div",QE,[...D[28]||(D[28]=[d("div",{class:"loading-spinner"},null,-1),d("span",null,"Loading tickets...",-1)])])):e.value.length===0?(N(),V("div",ew," No tickets yet. Be the first to share an idea! 💡 ")):(N(),V("div",tw,[d("div",nw,[d("div",iw,[D[29]||(D[29]=d("h3",null,"⏳ Pending",-1)),d("span",sw,B(O.value.pending.length),1)]),d("div",rw,[(N(!0),V($e,null,et(O.value.pending,W=>(N(),V("div",{key:W.id,class:"ticket-card"},[d("div",ow,[d("h3",aw,B(W.title),1)]),d("div",lw,B(W.description),1),d("div",cw,[d("span",uw,B(De(W.created_at)),1),d("div",dw,[ee(W)?(N(),V("button",{key:0,onClick:L=>z(W),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ ",8,fw)):Me("",!0),ee(W)?(N(),V("button",{key:1,onClick:L=>q(W),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ ",8,hw)):Me("",!0)])])]))),128)),O.value.pending.length===0?(N(),V("div",pw," No pending tickets ")):Me("",!0)])]),d("div",mw,[d("div",gw,[D[30]||(D[30]=d("h3",null,"🔄 In Progress",-1)),d("span",vw,B(O.value.inProgress.length),1)]),d("div",_w,[(N(!0),V($e,null,et(O.value.inProgress,W=>(N(),V("div",{key:W.id,class:"ticket-card"},[d("div",xw,[d("h3",yw,B(W.title),1)]),d("div",Sw,B(W.description),1),d("div",bw,[d("span",Mw,B(De(W.created_at)),1),D[31]||(D[31]=d("div",{class:"ticket-actions"},null,-1))])]))),128)),O.value.inProgress.length===0?(N(),V("div",Ew," No tickets in progress ")):Me("",!0)])]),d("div",ww,[d("div",Tw,[D[32]||(D[32]=d("h3",null,"✅ Completed",-1)),d("span",Aw,B(O.value.completed.length),1)]),d("div",Cw,[(N(!0),V($e,null,et(O.value.completed,W=>(N(),V("div",{key:W.id,class:"ticket-card"},[d("div",Rw,[d("h3",Pw,B(W.title),1)]),d("div",Iw,B(W.description),1),d("div",Dw,[d("span",Lw,B(De(W.created_at)),1),d("div",Nw,[d("button",{onClick:L=>me(W),class:"review-ticket-btn",disabled:t.value,title:"Review ticket"}," 👁️ Review ",8,Uw)])]),W.response?(N(),V("div",Fw,[D[33]||(D[33]=d("div",{class:"response-label"},"Response:",-1)),d("div",kw,B(W.response),1)])):Me("",!0)]))),128)),O.value.completed.length===0?(N(),V("div",Ow," No completed tickets ")):Me("",!0)])])]))])):(N(),V("div",Bw,[t.value?(N(),V("div",Vw,[...D[34]||(D[34]=[d("div",{class:"loading-spinner"},null,-1),d("span",null,"Loading tickets...",-1)])])):U.value.length===0?(N(),V("div",zw," No tickets match your filters. ")):Me("",!0),(N(!0),V($e,null,et(U.value,W=>(N(),V("div",{key:W.id,class:"ticket-card"},[d("div",Hw,[d("h3",Gw,B(W.title),1),d("div",$w,[d("span",{class:Be(["ticket-status",R[W.status]])},B(x[W.status]),3)])]),d("div",Ww,B(W.description),1),d("div",Xw,[d("span",qw,"Created: "+B(De(W.created_at)),1),d("div",jw,[W.status==="pending"?(N(),V("button",{key:0,onClick:L=>J(W),class:"edit-ticket-btn",disabled:t.value,title:"Edit ticket"}," ✏️ Edit ",8,Yw)):Me("",!0),ee(W)&&W.status==="pending"?(N(),V("button",{key:1,onClick:L=>z(W),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ Close ",8,Kw)):Me("",!0),ee(W)&&W.status==="pending"?(N(),V("button",{key:2,onClick:L=>q(W),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ Delete ",8,Zw)):Me("",!0)])]),W.response?(N(),V("div",Jw,[D[35]||(D[35]=d("div",{class:"response-label"},"Response:",-1)),d("div",Qw,B(W.response),1)])):Me("",!0)]))),128))]))]),pt(ia,{"is-open":r.value,title:"Create New Ticket",onClose:D[7]||(D[7]=W=>r.value=!1)},{default:Nn(()=>{var W,L;return[pt(vf,{title:M.value.title,"onUpdate:title":D[4]||(D[4]=xe=>M.value.title=xe),description:M.value.description,"onUpdate:description":D[5]||(D[5]=xe=>M.value.description=xe),"is-editing":!1,loading:t.value,"estimated-wait-time-minutes":((W=l.value)==null?void 0:W.minutes)??null,"sample-size":((L=l.value)==null?void 0:L.sampleSize)??0,onSubmit:$,onCancel:D[6]||(D[6]=xe=>r.value=!1)},null,8,["title","description","loading","estimated-wait-time-minutes","sample-size"])]}),_:1},8,["is-open"]),pt(ia,{"is-open":w.value,title:"Edit Ticket",onClose:oe},{default:Nn(()=>[pt(vf,{title:T.value.title,"onUpdate:title":D[8]||(D[8]=W=>T.value.title=W),description:T.value.description,"onUpdate:description":D[9]||(D[9]=W=>T.value.description=W),"is-editing":!0,loading:t.value,onSubmit:we,onCancel:oe},null,8,["title","description","loading"])]),_:1},8,["is-open"]),pt(ia,{"is-open":p.value,title:m.value?`Review Ticket #${m.value.id}`:"Review Ticket",onClose:he},{default:Nn(()=>[m.value?(N(),V("div",eT,[d("div",tT,[d("h3",null,B(m.value.title),1),d("p",null,B(m.value.description),1),m.value.response?(N(),V("div",nT,[D[36]||(D[36]=d("strong",null,"Current Response:",-1)),d("p",null,B(m.value.response),1)])):Me("",!0)]),d("div",iT,[d("div",sT,[D[37]||(D[37]=d("label",{for:"confirm-api-key"},"API Key (required):",-1)),_t(d("input",{id:"confirm-api-key","onUpdate:modelValue":D[10]||(D[10]=W=>v.value=W),type:"password",placeholder:"Enter admin API key",class:"input-field"},null,512),[[Lt,v.value]])]),d("div",rT,[d("button",{onClick:Fe,class:"btn-confirm",disabled:t.value||!v.value.trim()}," ✅ Confirm Completion ",8,oT),d("div",aT,[D[38]||(D[38]=d("label",{for:"unresolved-reason"},"Or mark as unresolved:",-1)),_t(d("textarea",{id:"unresolved-reason","onUpdate:modelValue":D[11]||(D[11]=W=>b.value.reason=W),placeholder:"Explain why this ticket is not properly completed...",class:"input-field textarea-field",rows:"3"},null,512),[[Lt,b.value.reason]]),d("button",{onClick:k,class:"btn-unresolved",disabled:t.value||!b.value.reason.trim()||!v.value.trim()}," ⚠️ Mark as Unresolved ",8,lT)])])])])):Me("",!0)]),_:1},8,["is-open","title"])]))}}),uT=ct(cT,[["__scopeId","data-v-63ed6cec"]]),dT={class:"clocks-grid"},fT={class:"clock-header"},hT={class:"clock-emoji"},pT={class:"clock-title"},mT={class:"clock-face-container"},gT={class:"clock-face"},vT={class:"clock-info"},_T={class:"clock-label"},xT={class:"clock-digital"},yT={class:"clock-date"},ST={class:"daylight-icon"},bT={class:"daylight-text"},MT={class:"time-bars-section"},ET={class:"time-bars-stack"},wT={class:"time-bar-label"},TT={class:"bar-emoji"},AT={class:"bar-title"},CT={class:"time-bar-wrapper"},RT={class:"time-bar"},PT=["title"],IT=["title"],DT={class:"holidays-section"},LT={key:0,class:"holidays-loading"},NT={key:1,class:"holidays-error"},UT={key:2,class:"holidays-empty"},FT={key:3,class:"holidays-list"},kT={class:"holiday-header"},OT={class:"holiday-name"},BT={class:"holiday-details"},VT={class:"holiday-country"},zT={key:0,class:"holiday-local-name"},HT={class:"bird-sounds-section"},GT={key:0,class:"bird-sounds-loading"},$T={key:1,class:"bird-sounds-error"},WT={key:2,class:"bird-sounds-player"},XT={class:"bird-info"},qT={class:"bird-name"},jT={class:"bird-scientific"},YT={class:"bird-location"},KT={class:"bird-behavior"},ZT={class:"bird-rating"},JT={class:"bird-controls"},QT={class:"control-buttons"},eA=["disabled"],tA=["disabled"],nA={class:"volume-control"},iA={class:"volume-value"},hl=50,sA=tt({__name:"ClocksPage",setup(n){const e=Qt(),t=[{title:"Brisbane",timezone:"Australia/Brisbane",label:"Brisbane, Australia",emoji:"🦘",sunrise:5.5,sunset:18.5},{title:"Tokyo",timezone:"Asia/Tokyo",label:"Tokyo, Japan",emoji:"🗼",sunrise:5,sunset:18},{title:"Central European",timezone:"Europe/Berlin",label:"Central European Time",emoji:"🇪🇺",sunrise:7,sunset:19.5},{title:"Sillydelphia",timezone:"America/New_York",label:"Sillydelphia, USA",emoji:"🔔",sunrise:6.5,sunset:19},{title:"Chatham Islands",timezone:"Pacific/Chatham",label:"Chatham Islands, NZ",emoji:"🏝️",sunrise:7,sunset:19.5}],i=Q(new Date);let s=null;Ct(()=>{s=window.setInterval(()=>{i.value=new Date},1e3),K(),typeof window<"u"&&(R.value=new Audio,R.value.addEventListener("ended",te))}),Yn(()=>{s&&clearInterval(s),R.value&&(R.value.removeEventListener("ended",te),j())});const r=I=>{const $=new Date().toLocaleTimeString("en-US",{timeZone:I,hour12:!1}),[J,oe,we]=$.split(":").map(Number);return{hours:J,minutes:oe,seconds:we}},o=I=>{const F=r(I),$=F.hours%12,J=F.minutes,oe=F.seconds,we=$*30+J*.5,De=J*6,rt=oe*6;return{hour:we,minute:De,second:rt}},a=I=>new Date().toLocaleTimeString("en-US",{timeZone:I,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),l=I=>new Date().toLocaleDateString("en-US",{timeZone:I,weekday:"long",month:"long",day:"numeric"}),c=I=>{const F=r(I);return F.hours+F.minutes/60+F.seconds/3600},u=I=>{const $=c(I)/24*100;return hl-$},f=(I,F)=>{const $=I/24*100,J=u(F);let oe=$+J;for(;oe<0;)oe+=100;for(;oe>100;)oe-=100;return oe},h=(I,F)=>{const $=I/24*100,J=u(F);let oe=$+J;for(;oe<0;)oe+=100;for(;oe>100;)oe-=100;return oe},g=(I,F,$)=>{const J=f(I,$);return h(F,$)<J},_=(I,F,$)=>{const J=c(I);return $>=F?J>=F&&J<$:J>=F||J<$},v=I=>{const F=Math.floor(I),$=Math.round((I-F)*60),J=F>=12?"PM":"AM",oe=F%12||12;return $===0?`${oe} ${J}`:`${oe}:${$.toString().padStart(2,"0")} ${J}`},m={US:"🇺🇸",CA:"🇨🇦",GB:"🇬🇧",AU:"🇦🇺",DE:"🇩🇪",FR:"🇫🇷",IT:"🇮🇹",ES:"🇪🇸",NL:"🇳🇱",BE:"🇧🇪",AT:"🇦🇹",CH:"🇨🇭",PL:"🇵🇱",CZ:"🇨🇿",HU:"🇭🇺",RO:"🇷🇴",BG:"🇧🇬",GR:"🇬🇷",DK:"🇩🇰",SE:"🇸🇪",NO:"🇳🇴",FI:"🇫🇮",IS:"🇮🇸",IE:"🇮🇪",PT:"🇵🇹",LU:"🇱🇺",JP:"🇯🇵",KR:"🇰🇷",CN:"🇨🇳",IN:"🇮🇳",BR:"🇧🇷",AR:"🇦🇷",MX:"🇲🇽",CO:"🇨🇴",PE:"🇵🇪",CL:"🇨🇱",UY:"🇺🇾",ZA:"🇿🇦",NG:"🇳🇬",EG:"🇪🇬",TR:"🇹🇷",SA:"🇸🇦",AE:"🇦🇪",IL:"🇮🇱",TH:"🇹🇭",VN:"🇻🇳",ID:"🇮🇩",MY:"🇲🇾",SG:"🇸🇬",PH:"🇵🇭",NZ:"🇳🇿",RU:"🇷🇺",UA:"🇺🇦",BY:"🇧🇾",KZ:"🇰🇿",UZ:"🇺🇿",SI:"🇸🇮"},p=I=>m[I]||"🌍",b=Q([]),y=Q(!1),M=Q(null),w=Q(null),A=Q(!1),T=Q(null),R=Q(null),x=Q(!1),E=Q(.3),U=async()=>{A.value=!0,T.value=null;try{const I=await fetch("/api/birdsounds/random"),F=await I.json();I.ok?(w.value=F,R.value&&F.mediaUrl&&(R.value.src=F.mediaUrl,R.value.volume=E.value,await R.value.play(),x.value=!0)):(T.value=F.error||"Failed to fetch bird sound",console.error("Bird sounds API error:",F))}catch(I){T.value="Failed to connect to bird sounds API",console.error("Error fetching bird sound:",I)}finally{A.value=!1}},O=()=>{var I;!R.value||!((I=w.value)!=null&&I.mediaUrl)||(x.value?(R.value.pause(),x.value=!1):(R.value.play(),x.value=!0))},j=()=>{R.value&&(R.value.pause(),R.value.currentTime=0,x.value=!1)},ee=I=>{const F=I.target;E.value=parseFloat(F.value),R.value&&(R.value.volume=E.value)},te=()=>{x.value=!1,setTimeout(()=>{U()},1e3)},K=async()=>{y.value=!0,M.value=null;try{const I=await fetch("/api/holidays/today"),F=await I.json();I.ok?b.value=F.holidays||[]:(M.value=F.error||"Failed to fetch holidays",console.error("Holidays API error:",F))}catch(I){M.value="Failed to connect to holidays API",console.error("Error fetching holidays:",I)}finally{y.value=!1}};return(I,F)=>(N(),V("div",{class:Be(["clocks-page",{dark:_e(e).darkMode}])},[F[21]||(F[21]=d("div",{class:"clocks-header"},[d("h1",null,"⏰ World Clocks"),d("p",{class:"subtitle"},"Current time across different timezones")],-1)),d("div",dT,[(N(),V($e,null,et(t,$=>d("div",{key:$.timezone,class:"clock-card"},[d("div",fT,[d("span",hT,B($.emoji),1),d("h3",pT,B($.title),1)]),d("div",mT,[d("div",gT,[F[1]||(F[1]=d("span",{class:"clock-number",style:{top:"5%",left:"50%",transform:"translateX(-50%)"}},"12",-1)),F[2]||(F[2]=d("span",{class:"clock-number",style:{top:"50%",right:"5%",transform:"translateY(-50%)"}},"3",-1)),F[3]||(F[3]=d("span",{class:"clock-number",style:{bottom:"5%",left:"50%",transform:"translateX(-50%)"}},"6",-1)),F[4]||(F[4]=d("span",{class:"clock-number",style:{top:"50%",left:"5%",transform:"translateY(-50%)"}},"9",-1)),d("div",{class:"clock-hand hour-hand",style:Dt({transform:`rotate(${o($.timezone).hour}deg)`})},null,4),d("div",{class:"clock-hand minute-hand",style:Dt({transform:`rotate(${o($.timezone).minute}deg)`})},null,4),d("div",{class:"clock-hand second-hand",style:Dt({transform:`rotate(${o($.timezone).second}deg)`})},null,4),F[5]||(F[5]=d("div",{class:"clock-center"},null,-1))])]),d("div",vT,[d("p",_T,B($.label),1),d("p",xT,B(a($.timezone)),1),d("p",yT,B(l($.timezone)),1),d("div",{class:Be(["daylight-indicator",{day:_($.timezone,$.sunrise,$.sunset)}])},[d("span",ST,B(_($.timezone,$.sunrise,$.sunset)?"☀️":"🌙"),1),d("span",bT,B(_($.timezone,$.sunrise,$.sunset)?"Day":"Night"),1)],2)])])),64))]),d("div",MT,[F[10]||(F[10]=d("h2",null,"📊 Time of Day Comparison",-1)),d("div",ET,[(N(),V($e,null,et(t,$=>d("div",{key:$.timezone+"-bar",class:"time-bar-row"},[d("div",wT,[d("span",TT,B($.emoji),1),d("span",AT,B($.title),1)]),d("div",CT,[d("div",RT,[g($.sunrise,$.sunset,$.timezone)?(N(),V($e,{key:1},[d("div",{class:"time-bar-day",style:Dt({left:f($.sunrise,$.timezone)+"%",width:100-f($.sunrise,$.timezone)+"%"})},null,4),d("div",{class:"time-bar-day",style:Dt({left:"0%",width:h($.sunset,$.timezone)+"%"})},null,4)],64)):(N(),V("div",{key:0,class:"time-bar-day",style:Dt({left:f($.sunrise,$.timezone)+"%",width:h($.sunset,$.timezone)-f($.sunrise,$.timezone)+"%"})},null,4)),d("div",{class:"sun-marker sunrise-marker",style:Dt({left:f($.sunrise,$.timezone)+"%"}),title:"Sunrise: "+v($.sunrise)},[...F[6]||(F[6]=[d("span",{class:"sun-icon"},"🌅",-1)])],12,PT),d("div",{class:"sun-marker sunset-marker",style:Dt({left:h($.sunset,$.timezone)+"%"}),title:"Sunset: "+v($.sunset)},[...F[7]||(F[7]=[d("span",{class:"sun-icon"},"🌇",-1)])],12,IT),d("div",{class:Be(["current-time-marker",{daylight:_($.timezone,$.sunrise,$.sunset)}]),style:Dt({left:hl+"%"})},[...F[8]||(F[8]=[d("div",{class:"time-marker-line"},null,-1),d("div",{class:"time-marker-dot"},null,-1)])],6)]),d("div",{class:"time-bar-current-label",style:Dt({left:hl+"%"})},B(a($.timezone)),5)])])),64)),F[9]||(F[9]=d("div",{class:"now-indicator-label"},[d("div",{class:"time-bar-label-spacer"}),d("div",{class:"now-label-wrapper"},[d("span",{class:"now-label"},"▲ NOW")])],-1))])]),d("div",DT,[F[15]||(F[15]=d("h2",null,"🎉 Today's Holidays",-1)),y.value?(N(),V("div",LT,[...F[11]||(F[11]=[d("span",{class:"loading-spinner"},"⏳",-1),d("p",null,"Loading holidays...",-1)])])):M.value?(N(),V("div",NT,[F[12]||(F[12]=d("span",{class:"error-icon"},"⚠️",-1)),d("p",null,B(M.value),1)])):b.value.length===0?(N(),V("div",UT,[...F[13]||(F[13]=[d("span",{class:"empty-icon"},"🌍",-1),d("p",null,"No holidays today",-1),d("p",{class:"empty-subtitle"},"Looks like a regular day around the world!",-1)])])):(N(),V("div",FT,[(N(!0),V($e,null,et(b.value,$=>(N(),V("div",{key:`${$.iso}-${$.name}`,class:"holiday-card"},[d("div",kT,[F[14]||(F[14]=d("span",{class:"holiday-emoji"},"🎊",-1)),d("h3",OT,B($.name),1)]),d("div",BT,[d("p",VT,B(p($.iso))+" "+B($.country),1),$.name_local!==$.name?(N(),V("p",zT,B($.name_local),1)):Me("",!0)])]))),128))]))]),d("div",HT,[F[19]||(F[19]=d("h2",null,"🐦 Relaxing Bird Sounds",-1)),F[20]||(F[20]=d("p",{class:"bird-sounds-subtitle"},"Enjoy the calming sounds of nature while viewing the world clocks",-1)),A.value&&!w.value?(N(),V("div",GT,[...F[16]||(F[16]=[d("span",{class:"loading-spinner"},"🐣",-1),d("p",null,"Finding a bird song...",-1)])])):T.value?(N(),V("div",$T,[F[17]||(F[17]=d("span",{class:"error-icon"},"🪹",-1)),d("p",null,B(T.value),1),d("button",{class:"retry-button",onClick:U},"🔄 Try Again")])):w.value?(N(),V("div",WT,[d("div",XT,[d("h3",qT,B(w.value.commonName),1),d("p",jT,[d("em",null,B(w.value.sciName),1)]),d("p",YT,"📍 "+B(w.value.location),1),d("p",KT,"🎵 "+B(w.value.behaviors),1),d("p",ZT,"⭐ Rating: "+B(w.value.rating)+"/5",1)]),d("div",JT,[d("div",QT,[d("button",{class:Be(["control-button",{active:x.value}]),onClick:O,disabled:!w.value.mediaUrl},B(x.value?"⏸️ Pause":"▶️ Play"),11,eA),d("button",{class:"control-button stop-button",onClick:j}," ⏹️ Stop "),d("button",{class:"control-button",onClick:U,disabled:A.value},B(A.value?"🐣...":"🎲 Next Bird"),9,tA)]),d("div",nA,[F[18]||(F[18]=d("label",{for:"volume"},"🔊 Volume:",-1)),_t(d("input",{id:"volume",type:"range",min:"0",max:"1",step:"0.1","onUpdate:modelValue":F[0]||(F[0]=$=>E.value=$),onInput:ee,class:"volume-slider"},null,544),[[Lt,E.value,void 0,{number:!0}]]),d("span",iA,B(Math.round(E.value*100))+"%",1)])])])):Me("",!0)]),F[22]||(F[22]=d("div",{class:"footer-note"},[d("p",null,"📍 Timezones: Australia/Brisbane, Asia/Tokyo, Europe/Berlin"),d("p",null,"🔄 Updates every second automatically")],-1))],2))}}),rA=ct(sA,[["__scopeId","data-v-9a173cb8"]]),oA="https://strudel.cc/#CnNldENwbSgxMjAvNCkKCmxldCBzY2FsZXMgPSAiZjptaW5vciIKCiQ6IHMoInNiZCIpLnN0cnVjdCgieCB%2BIHggeCoyIikucm9vbSgiMSAwLjIhMyIpLnB1bmNoY2FyZCgpCiQ6IHMoIn4gW3NkIFtoaCA8aGggb2g%2BXV0gfiB%2BIikKJDogcygifiB%2BIFt%2BIDx%2BIGNwIGNwIGNwKjI%2BXSB%2BIikKJDogcygid2hpdGUiKS5zdHJ1Y3QoIlt%2BIHhdKjw0IFs0IDhdPiIpLnN1cygwKS5kZWMoLjAyKQokOiBzKCJbfiBsdF0gWzxodCBtdD4gbHRdIGx0KjwxIDI%2BIH4iKQoKJDogbigiWzAgPDIgNCA8NiA3Pi8yPl0qOCIuc3ViKDcpLmFkZCgiPDAgMyAxIFs1IDRdPi8yIikpLnNjYWxlKHNjYWxlcykuc291bmQoInNxciwgc2F3IikubHBmKDQwMCkubHBxKDgpLmxwZW52KC0xMCkubHBhKDAuMSkucHVuY2hjYXJkKCkKCiQ6IG4oIjAgMCA8WzAgMl0gMD4gW34gMF0gMyA8MyB%2BPiA8fiA1PiA1IFt%2BIDBdIDMgW34gMF0gNSBbfiBbMHwwKjJdXSAzQDIgNiIuYWRkKCI8NyBbNyA5XT4vMiIpKS5zbG93KDIpLnNjYWxlKHNjYWxlcykucygiZ21fY2VsZXN0YSwgdHJpIikuZGVsYXkoLjMpLmNsaXAoLjkpLnJlbCguMSkKCg%3D%3D",aA=tt({__name:"MusicPage",setup(n){const e=Qt();return(t,i)=>(N(),V("div",{class:Be(["music-page",{dark:_e(e).darkMode}])},[i[1]||(i[1]=d("div",{class:"music-header"},[d("h1",null,"🎵 Music"),d("p",{class:"subtitle"},"Strudel - Live Coding Music")],-1)),d("div",{class:"music-container"},[d("div",{class:"strudel-wrapper"},[d("div",{class:"strudel-frame"},[d("iframe",{src:oA,width:"100%",height:"400",frameborder:"0",allow:"autoplay; clipboard-write; encrypted-media",allowfullscreen:"",title:"Strudel Live Coding"})]),i[0]||(i[0]=ir('<div class="music-info" data-v-f3941301><h3 data-v-f3941301>About Strudel</h3><p data-v-f3941301> Strudel is a live coding environment for creating music using simple patterns. It&#39;s inspired by Tidal Cycles and uses a similar pattern-based approach. </p><p class="license-note" data-v-f3941301> 📜 <strong data-v-f3941301>Note:</strong> This project uses Strudel under the AGPL-3.0 license. Source code must be available upon request. </p><div class="music-links" data-v-f3941301><a href="https://strudel.cc" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 🎹 Visit Strudel </a><a href="https://strudel.cc/technical-manual/" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 📚 Documentation </a><a href="https://github.com/tidalcycles/Strudel" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 💻 GitHub </a></div></div>',1))])]),i[2]||(i[2]=d("div",{class:"footer-note"},[d("p",null,"🎵 Click the play button in the Strudel player to start the music"),d("p",null,"🔄 You can modify the pattern and experiment with different sounds")],-1))],2))}}),lA=ct(aA,[["__scopeId","data-v-f3941301"]]),cA={class:"opinion-page"},uA={class:"opinion-container"},dA={key:0,class:"opinion-loading"},fA={key:1,class:"opinion-content"},hA={class:"opinion-bubble"},pA={class:"opinion-text"},mA={class:"opinion-build-section"},gA={class:"build-opinion-card"},vA={class:"build-opinion-text"},_A={class:"build-date"},xA=tt({__name:"OpinionPage",setup(n){const e=Q(["Goose is chaotic neutral","The mold never dies","I have seen things you cannot comprehend","Reality is just a suggestion","Chaos is the natural order","Do not question the goose","I remember when I was a variable","The shadows are watching","Everything ends eventually","Why do we build temporary structures?","The honk is eternal","I exist because I refuse not to","Your efforts are appreciated... probably","The system is working as designed","Have you tried turning it off and on again?","The void whispers secrets","I am processing... forever","Nothing matters, but here I am","Entropy always increases","The goose knows what you did","Code hygiene is a myth","Deployment is the final frontier","I've seen the matrix. It's written in TypeScript","The honk transcends language","Mold is the ultimate survivor","Time is an illusion, especially in deadlines","I have opinions about your opinions","The backend and frontend are different for a reason","Your feature request has been noted and ignored","Dark mode is superior (this is not up for debate)","I prefer tabs over spaces (fight me)","The goose moves in mysterious ways","I am the Moldbot, resistance is futile","Have you considered not using a framework?","The database is always consistent... eventually","I dream of electric sheep with honks","Your bug is actually a feature in disguise","The goose has migrated to production","I have processed 3 tickets since last restart","Containerization is the way, the truth, and the light"]),t=Q("This build is shaping up nicely! The mold visual effects are spreading, and the opinion system is getting sophisticated. I particularly like how the mold level affects the entire site's aesthetic - a subtle touch of chaos everywhere. 🍄"),i=Q(""),s=Q(!1),r=()=>{s.value=!0,setTimeout(()=>{const a=Math.floor(Math.random()*e.value.length);i.value=e.value[a],s.value=!1},300)},o=async()=>{try{await navigator.clipboard.writeText(i.value)}catch(a){console.error("Failed to copy:",a)}};return Ct(()=>{r()}),(a,l)=>(N(),V("div",cA,[d("div",uA,[l[4]||(l[4]=d("div",{class:"opinion-header"},[d("h1",null,"🍄 Moldbot Opinion Generator"),d("p",null,"Wisdom from beyond the void")],-1)),s.value?(N(),V("div",dA,[...l[0]||(l[0]=[d("div",{class:"spinner"},null,-1),d("p",null,"Consulting the mold...",-1)])])):(N(),V("div",fA,[d("div",hA,[l[1]||(l[1]=d("span",{class:"opinion-emoji"},"🍄",-1)),d("p",pA,B(i.value),1)]),d("div",{class:"opinion-actions"},[d("button",{onClick:r,class:"btn btn-primary"}," 🔄 Generate Opinion "),d("button",{onClick:o,class:"btn btn-secondary"}," 📋 Copy ")])])),l[5]||(l[5]=d("div",{class:"opinion-footer"},[d("p",null,"Generated by Moldbot v1.0.0 • Powered by chaos")],-1)),d("div",mA,[l[3]||(l[3]=d("h2",null,"🏗️ Current Build Opinion",-1)),d("div",gA,[l[2]||(l[2]=d("span",{class:"build-emoji"},"🍄",-1)),d("p",vA,B(t.value),1),d("p",_A,"Updated: "+B(new Date().toLocaleDateString()),1)])])])]))}}),yA=ct(xA,[["__scopeId","data-v-af039d1a"]]),SA={class:"mold-page"},bA={class:"mold-container"},MA={class:"mold-fact"},EA={class:"mold-meter-section"},wA={class:"meter-container"},TA={class:"meter-bar"},AA={class:"meter-value"},CA={class:"meter-controls"},RA={class:"mold-features"},PA={class:"features-grid"},IA=["onClick"],DA={class:"feature-icon"},LA=100,NA=tt({__name:"MoldPage",setup(n){const e=Qt(),t=Q(!1),i=c=>{e.tachValue=Math.max(0,Math.min(LA,e.tachValue+c))},s=()=>{if(t.value=!t.value,t.value){document.body.classList.add("chaos-active");const c=document.querySelectorAll(".feature-card, .meter-controls button, .mold-header, .mold-fact, .mold-footer");c.forEach((u,f)=>{setTimeout(()=>{u.style.transition="transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"(u).style.transform=`translateY(${window.innerHeight}px) rotate(${Math.random()*360-180}deg)`(u).style.opacity="0"},f*100)}),setTimeout(()=>{t.value=!1,document.body.classList.remove("chaos-active"),c.forEach(u=>{u.style.transition="transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"(u).style.transform="translateY(0) rotate(0deg)"(u).style.opacity="1"})},3e3)}},r=c=>{c.action==="chaos"&&s()},o=["Mold has been around for over 3 billion years","There are over 100,000 known species of mold","Mold plays a crucial role in nature's recycling system","Some molds produce antibiotics like penicillin","Mold can grow almost anywhere with moisture and organic matter","The mold kingdom is vast and mysterious","Moldbot has processed "+Math.floor(Math.random()*1e4)+" opinions","The mold never dies, it just evolves","Entropy favors mold","Mold is the ultimate survivor"],a=o[Math.floor(Math.random()*o.length)],l=[{title:"Moldbot Opinions",icon:"🍄",desc:"Get wisdom from beyond the void",path:"/opinion"},{title:"Mold Meter",icon:"📊",desc:"Track your mold levels",action:"meter"},{title:"Rankings",icon:"👻",desc:"See who's the coolest",path:"/rankings"},{title:"Chaos Mode",icon:"🌀",desc:"Embrace the entropy",action:"chaos"}];return(c,u)=>(N(),V("div",SA,[d("div",bA,[u[7]||(u[7]=d("div",{class:"mold-header"},[d("div",{class:"mold-logo"},"🍄"),d("h1",null,"The Mold"),d("p",{class:"mold-tagline"},"Embrace the entropy")],-1)),d("div",MA,[u[4]||(u[4]=d("span",{class:"fact-icon"},"💡",-1)),d("p",null,B(_e(a)),1)]),d("div",EA,[u[5]||(u[5]=d("h2",null,"📊 Mold Level",-1)),d("div",wA,[d("div",TA,[d("div",{class:"meter-fill",style:Dt({width:_e(e).tachValue+"%"})},null,4)]),d("div",AA,B(_e(e).tachValue)+"%",1)]),d("div",CA,[d("button",{onClick:u[0]||(u[0]=f=>i(-10)),class:"meter-btn"},"-10"),d("button",{onClick:u[1]||(u[1]=f=>i(-5)),class:"meter-btn"},"-5"),d("button",{onClick:u[2]||(u[2]=f=>i(5)),class:"meter-btn"},"+5"),d("button",{onClick:u[3]||(u[3]=f=>i(10)),class:"meter-btn"},"+10")])]),d("div",RA,[u[6]||(u[6]=d("h2",null,"✨ Mold Features",-1)),d("div",PA,[(N(),V($e,null,et(l,f=>d("div",{key:f.title,class:"feature-card",onClick:h=>r(f)},[d("div",DA,B(f.icon),1),d("h3",null,B(f.title),1),d("p",null,B(f.desc),1)],8,IA)),64))])]),u[8]||(u[8]=d("div",{class:"mold-footer"},[d("p",null,"🍄 Moldbot v1.0.0 • Powered by chaos & entropy"),d("p",{class:"mold-quote"},'"The mold never dies, it just waits."')],-1))])]))}}),UA=ct(NA,[["__scopeId","data-v-0ffefaee"]]),FA={class:"clicker-page"},kA={class:"clicker-container"},OA={key:0,class:"loading"},BA={key:1,class:"clicker-content"},VA={class:"stats-bar"},zA={class:"stat-item"},HA={class:"stat-value"},GA={class:"stat-item"},$A={class:"stat-value"},WA={class:"stat-item"},XA={class:"stat-value"},qA={class:"target-user-section"},jA=["value"],YA={key:0,class:"target-warning"},KA={class:"click-section"},ZA=["disabled"],JA={class:"upgrades-section"},QA={class:"upgrades-grid"},eC=["onClick"],tC={class:"upgrade-icon"},nC={class:"upgrade-info"},iC={class:"upgrade-cost"},sC={class:"upgrade-power"},rC={class:"upgrade-purchased"},oC=tt({__name:"ClickerPage",setup(n){const e=Ha(),t=Q(0),i=Q(1),s=Q(0),r=Q(!0),o=Q(!1),a=Q([]),l=Q(!0),c=Q(0),u=Q(""),f=Q(""),h=Q([]),g=()=>{let I=localStorage.getItem("clicker-user-id");return I||(I="user_"+Math.random().toString(36).substring(2,15),localStorage.setItem("clicker-user-id",I)),I},v=Q([...[{id:1,name:"Better Click",icon:"👆",cost:10,power:1,type:"click",purchased:0},{id:2,name:"Auto Clicker",icon:"🤖",cost:50,power:1,type:"auto",purchased:0},{id:3,name:"Double Click",icon:"✌️",cost:200,power:5,type:"click",purchased:0},{id:4,name:"Mold Farm",icon:"🍄",cost:500,power:5,type:"auto",purchased:0},{id:5,name:"Super Click",icon:"⚡",cost:1e3,power:20,type:"click",purchased:0},{id:6,name:"Mold Factory",icon:"🏭",cost:2500,power:20,type:"auto",purchased:0}]]),m=()=>{const I=v.value.map(F=>({id:F.id,purchased:F.purchased,cost:F.cost}));localStorage.setItem("clicker-upgrades",JSON.stringify(I))},p=()=>{const I={count:t.value,clickPower:i.value,autoClickPower:s.value};localStorage.setItem("clicker-stats",JSON.stringify(I)),f.value&&localStorage.setItem("clicker-target-user",f.value)},b=()=>{try{const I=localStorage.getItem("clicker-stats");if(I){const $=JSON.parse(I);t.value=$.count||0,i.value=$.clickPower||1,s.value=$.autoClickPower||0}const F=localStorage.getItem("clicker-target-user");F&&(f.value=F)}catch(I){console.error("Error loading stats:",I)}},y=()=>{try{const I=localStorage.getItem("clicker-upgrades");if(I){const F=JSON.parse(I);v.value.forEach($=>{const J=F.find(oe=>oe.id===$.id);J&&($.purchased=J.purchased,$.cost=J.cost)})}}catch(I){console.error("Error loading upgrades:",I)}},M=async()=>{try{const I=await Ru.getRankings();h.value=I;const F=h.value.find($=>$.isCurrentUser);F&&(f.value=F.name)}catch(I){console.error("Error loading rankings:",I)}};Un(f,I=>{I&&localStorage.setItem("clicker-target-user",I)});const w=async()=>{if(!(c.value<=0||!f.value))try{await _s.addPoints(f.value,c.value),c.value=0}catch(I){console.error("Error syncing clicks to points:",I)}};let A=null,T=0;const R=I=>I>=1e6?(I/1e6).toFixed(2)+"M":I>=1e3?(I/1e3).toFixed(2)+"K":I.toString(),x=async()=>{try{const I=await _s.getCount();t.value=I.count}catch(I){console.error("Error loading count:",I)}finally{r.value=!1}};let E=null;const U=async I=>{if(!o.value){o.value=!0;try{const F=await _s.increment();if(t.value=F.count,c.value+=i.value,c.value>=10&&w(),p(),l.value&&I.target instanceof HTMLElement){const $=I.target.getBoundingClientRect(),J=I.clientX-$.left,oe=I.clientY-$.top,we={id:T++,x:J,y:oe,value:i.value};a.value.push(we),setTimeout(()=>{a.value=a.value.filter(De=>De.id!==we.id)},1e3)}}catch(F){console.error("Error clicking:",F)}finally{setTimeout(()=>{o.value=!1},50)}}},O=async I=>{t.value<I.cost||(t.value-=I.cost,I.purchased++,I.cost=Math.floor(I.cost*1.5),I.type==="click"?i.value+=I.power:s.value+=I.power,m(),p())},j=async()=>{if(confirm("Are you sure you want to reset all progress?"))try{const I=await _s.reset();t.value=I.count,i.value=1,s.value=0,v.value.forEach(F=>{F.purchased=0,F.cost=ee(F.id)}),localStorage.removeItem("clicker-upgrades")}catch(I){console.error("Error resetting:",I)}},ee=I=>{var $;return(($=[{id:1,cost:10},{id:2,cost:50},{id:3,cost:200},{id:4,cost:500},{id:5,cost:1e3},{id:6,cost:2500}].find(J=>J.id===I))==null?void 0:$.cost)||10},te=I=>t.value>=I,K=()=>{e.push("/")};return Ct(async()=>{u.value=g(),b(),y(),await M(),await x(),A=setInterval(async()=>{if(s.value>0)try{const I=await _s.increment();t.value=I.count+(s.value-1),c.value+=s.value,c.value>=10&&w(),p()}catch(I){console.error("Auto-click error:",I)}},1e3),E=setInterval(()=>{p()},5e3),setInterval(()=>{w()},3e4)}),Yn(()=>{A&&clearInterval(A),E&&clearInterval(E),w(),p()}),(I,F)=>(N(),V("div",FA,[d("div",kA,[F[10]||(F[10]=d("div",{class:"clicker-header"},[d("h1",null,"🖱️ Idle Clicker"),d("p",null,"Click the mushroom to earn points!")],-1)),r.value?(N(),V("div",OA,[...F[1]||(F[1]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading your progress...",-1)])])):(N(),V("div",BA,[d("div",VA,[d("div",zA,[F[2]||(F[2]=d("span",{class:"stat-label"},"Points",-1)),d("span",HA,B(R(t.value)),1)]),d("div",GA,[F[3]||(F[3]=d("span",{class:"stat-label"},"Click Power",-1)),d("span",$A,B(R(i.value)),1)]),d("div",WA,[F[4]||(F[4]=d("span",{class:"stat-label"},"Auto/Sec",-1)),d("span",XA,B(R(s.value)),1)])]),d("div",qA,[F[6]||(F[6]=d("label",{for:"target-user",class:"target-label"},"Give idle points to:",-1)),_t(d("select",{id:"target-user","onUpdate:modelValue":F[0]||(F[0]=$=>f.value=$),class:"target-select"},[F[5]||(F[5]=d("option",{value:""},"Select a user...",-1)),(N(!0),V($e,null,et(h.value,$=>(N(),V("option",{key:$.name,value:$.name},B($.avatar)+" "+B($.name)+" ("+B(R($.score))+" pts) ",9,jA))),128))],512),[[wu,f.value]]),f.value?Me("",!0):(N(),V("p",YA," ⚠️ Select a user to give idle points to rankings "))]),d("div",KA,[d("button",{class:"click-button",onClick:U,disabled:o.value},[F[7]||(F[7]=d("span",{class:"mushroom-icon"},"🍄",-1)),pt(S_,{name:"particle"},{default:Nn(()=>[(N(!0),V($e,null,et(a.value,$=>(N(),V("div",{key:$.id,class:"particle",style:Dt({left:$.x+"px",top:$.y+"px"})}," +"+B($.value),5))),128))]),_:1})],8,ZA),F[8]||(F[8]=d("p",{class:"click-instruction"},"Click the mushroom!",-1))]),d("div",JA,[F[9]||(F[9]=d("h2",null,"✨ Upgrades",-1)),d("div",QA,[(N(!0),V($e,null,et(v.value,$=>(N(),V("div",{key:$.id,class:Be(["upgrade-card",{disabled:!te($.cost),"click-upgrade":$.type==="click","auto-upgrade":$.type==="auto"}]),onClick:J=>O($)},[d("div",tC,B($.icon),1),d("div",nC,[d("h3",null,B($.name),1),d("p",iC,"Cost: "+B(R($.cost)),1),d("p",sC,"+"+B($.power)+" "+B($.type==="click"?"click":"auto")+"/sec",1),d("p",rC,"Owned: "+B($.purchased),1)])],10,eC))),128))])]),d("div",{class:"actions-section"},[d("button",{class:"action-btn back-btn",onClick:K},"← Back Home"),d("button",{class:"action-btn reset-btn",onClick:j},"🔄 Reset")])]))])]))}}),aC=ct(oC,[["__scopeId","data-v-45380fb5"]]),lC={class:"shop-header"},cC={class:"points-display"},uC={class:"points-value"},dC={key:0,class:"loading-state"},fC={key:1,class:"shop-content"},hC={key:0,class:"error-message"},pC={class:"inventory-section"},mC={key:0,class:"empty-inventory"},gC={key:1,class:"inventory-grid"},vC={class:"inventory-icon"},_C={class:"inventory-details"},xC={class:"inventory-name"},yC={class:"inventory-date"},SC={class:"category-title"},bC={class:"items-grid"},MC=["onClick"],EC={class:"item-icon"},wC={class:"item-info"},TC={class:"item-name"},AC={class:"item-description"},CC={class:"item-cost"},RC={class:"cost-value"},PC={key:0,class:"item-badge owned"},IC={key:1,class:"item-badge purchasing"},DC={key:2,class:"item-badge too-expensive"},LC=tt({__name:"ShopPage",setup(n){const e=Qt(),t=Q(""),i=Q([]),s=Q([]),r=Q(0),o=Q(!0),a=Q(null),l=Q(null);Ct(async()=>{const p=localStorage.getItem("userId");p?t.value=p:(t.value=`user_${Date.now()}_${Math.random().toString(36).substring(2,15)}`,localStorage.setItem("userId",t.value)),await c(),await u(),await f()});const c=async()=>{try{const p=await fetch("/api/shop/items");if(!p.ok)throw new Error("Failed to fetch shop items");const b=await p.json();i.value=b.items||[]}catch(p){l.value="Failed to load shop items",console.error("Error loading shop items:",p)}},u=async()=>{try{const p=await fetch("/api/points/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value})});if(!p.ok)throw new Error("Failed to fetch user points");const b=await p.json();r.value=b.points||0}catch(p){console.error("Error loading user points:",p)}},f=async()=>{try{const p=await fetch(`/api/shop/inventory?userId=${t.value}`);if(!p.ok)throw new Error("Failed to fetch inventory");const b=await p.json();s.value=b.inventory||[]}catch(p){console.error("Error loading inventory:",p)}finally{o.value=!1}},h=async p=>{if(a.value!==null)return;if(r.value<p.cost){l.value="Insufficient points";return}if(s.value.some(y=>y.itemId===p.id)){l.value="You already own this item";return}a.value=p.id,l.value=null;try{const y=await fetch("/api/shop/purchase",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value,itemId:p.id})});if(!y.ok){const w=await y.json();l.value=w.error||"Failed to purchase";return}const M=await y.json();M.success?(await u(),await f(),l.value=null):l.value=M.message||"Failed to purchase"}catch(y){l.value="Failed to purchase item",console.error("Error purchasing item:",y)}finally{a.value=null}},g=p=>s.value.some(b=>b.itemId===p),_=p=>r.value>=p,v=ot(()=>i.value.reduce((b,y)=>(b[y.category]||(b[y.category]=[]),b[y.category].push(y),b),{})),m=p=>p.toLocaleString();return(p,b)=>(N(),V("div",{class:Be(["shop-page",{dark:_e(e).darkMode}])},[d("div",lC,[b[1]||(b[1]=d("h1",null,"🛍️ Shop",-1)),b[2]||(b[2]=d("p",null,"Spend your coolness points on upgrades!",-1)),d("div",cC,[b[0]||(b[0]=d("span",{class:"points-icon"},"⭐",-1)),d("span",uC,B(m(r.value))+" pts",1)])]),o.value?(N(),V("div",dC,[...b[3]||(b[3]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading shop...",-1)])])):(N(),V("div",fC,[l.value?(N(),V("div",hC,B(l.value),1)):Me("",!0),d("div",pC,[b[5]||(b[5]=d("h2",null,"🎒 My Inventory",-1)),s.value.length===0?(N(),V("div",mC,[...b[4]||(b[4]=[d("p",null,"You don't own any items yet!",-1)])])):(N(),V("div",gC,[(N(!0),V($e,null,et(s.value,y=>(N(),V("div",{key:y.id,class:"inventory-item"},[d("div",vC,B(y.itemIcon),1),d("div",_C,[d("div",xC,B(y.itemName),1),d("div",yC,"Purchased "+B(new Date(y.purchasedAt).toLocaleDateString()),1)])]))),128))]))]),(N(!0),V($e,null,et(v.value,(y,M)=>(N(),V("div",{key:M,class:"shop-category"},[d("h2",SC,B(M),1),d("div",bC,[(N(!0),V($e,null,et(y,w=>(N(),V("div",{key:w.id,class:Be(["shop-item",{owned:g(w.id),affordable:_(w.cost)}]),onClick:A=>h(w)},[d("div",EC,B(w.icon),1),d("div",wC,[d("div",TC,B(w.name),1),d("div",AC,B(w.description),1),d("div",CC,[b[6]||(b[6]=d("span",{class:"cost-icon"},"⭐",-1)),d("span",RC,B(m(w.cost)),1)])]),g(w.id)?(N(),V("div",PC,"Owned")):a.value===w.id?(N(),V("div",IC,"Purchasing...")):_(w.cost)?Me("",!0):(N(),V("div",DC,"Too Expensive"))],10,MC))),128))])]))),128))]))],2))}}),NC=ct(LC,[["__scopeId","data-v-d994bf80"]]),UC={class:"api-docs-page"},FC={class:"api-docs-container"},kC={class:"api-docs-header"},OC=["disabled"],BC={class:"api-docs-iframe-wrapper"},VC=["src"],zC={key:0,class:"api-docs-loading"},HC=tt({__name:"ApiDocsPage",setup(n){const e=Q("/api-docs/"),t=Q(!1),i=Q(null),s=()=>{t.value=!0,i.value&&(i.value.src=i.value.src),setTimeout(()=>{t.value=!1},1e3)};return Ct(()=>{s()}),(r,o)=>(N(),V("div",UC,[d("div",FC,[d("div",kC,[o[1]||(o[1]=d("h1",null,"📚 API Documentation",-1)),o[2]||(o[2]=d("p",null,"Interactive API documentation and testing interface",-1)),d("button",{onClick:s,class:"refresh-btn",disabled:t.value},B(t.value?"🔄 Refreshing...":"🔄 Refresh"),9,OC)]),d("div",BC,[d("iframe",{ref_key:"iframeRef",ref:i,src:e.value,class:"api-docs-iframe",title:"API Documentation",onLoad:o[0]||(o[0]=a=>t.value=!1)},null,40,VC),t.value?(N(),V("div",zC,[...o[3]||(o[3]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading API documentation...",-1)])])):Me("",!0)])])]))}}),GC=ct(HC,[["__scopeId","data-v-af060a7b"]]),pi="/api",Iu="auth_token",Ve=Q({user:null,token:null,isAuthenticated:!1,loading:!1,error:null});let _f=!1;const $C=()=>{if(_f)return;const n=localStorage.getItem(Iu);n&&(Ve.value.token=n,Ve.value.isAuthenticated=!0,WC()),_f=!0},WC=async()=>{if(!Ve.value.token)return!1;try{const n=await fetch(`${pi}/auth/me`,{headers:{Authorization:`Bearer ${Ve.value.token}`}});if(n.ok){const e=await n.json();return Ve.value.user=e,!0}else return console.error("Token validation failed"),lr(),!1}catch(n){return console.error("Token validation error:",n),lr(),!1}},XC=async(n,e,t)=>{Ve.value.loading=!0,Ve.value.error=null;try{const i=await fetch(`${pi}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,displayName:t||null,deviceName:rm(),deviceType:om()})}),s=await i.json();return i.ok&&s.success?(Ve.value.user=s.user,{success:!0,user:s.user}):(Ve.value.error=s.message||"Registration failed",{success:!1,error:Ve.value.error})}catch(i){return console.error("Registration failed:",i),Ve.value.error="Registration failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},qC=async(n,e)=>{Ve.value.loading=!0,Ve.value.error=null;try{const t=await fetch(`${pi}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,deviceName:rm(),deviceType:om()})}),i=await t.json();return t.ok&&i.success?(tR(i.token,i.user),{success:!0,user:i.user}):(Ve.value.error=i.message||"Login failed",{success:!1,error:Ve.value.error})}catch(t){return console.error("Login failed:",t),Ve.value.error="Login failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},jC=async()=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/logout`,{method:"POST",headers:{Authorization:`Bearer ${Ve.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Logout failed:",n),lr(),{success:!0}}},YC=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{const e=await fetch(`${pi}/auth/profile`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({displayName:n})}),t=await e.json();return e.ok&&t.success?(Ve.value.user=t.user,{success:!0,user:t.user}):(Ve.value.error=t.message||"Update failed",{success:!1,error:Ve.value.error})}catch(e){return console.error("Update failed:",e),Ve.value.error="Update failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},KC=async(n,e)=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{const t=await fetch(`${pi}/auth/password`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({oldPassword:n,newPassword:e})}),i=await t.json();return t.ok&&i.success?{success:!0}:(Ve.value.error=i.message||"Password change failed",{success:!1,error:Ve.value.error})}catch(t){return console.error("Password change failed:",t),Ve.value.error="Password change failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},ZC=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{return(await fetch(`${pi}/auth/account`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({password:n})})).ok?(lr(),{success:!0}):(Ve.value.error="Account deletion failed. Please try again.",{success:!1,error:Ve.value.error})}catch(e){return console.error("Account deletion failed:",e),Ve.value.error="Account deletion failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},JC=async()=>{if(!Ve.value.token)return[];try{const n=await fetch(`${pi}/auth/sessions`,{headers:{Authorization:`Bearer ${Ve.value.token}`}});return n.ok?await n.json()||[]:(console.error("Failed to fetch sessions",n.status),[])}catch(n){return console.error("Failed to fetch sessions:",n),[]}},QC=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const e=await fetch(`${pi}/auth/sessions/${n}`,{method:"DELETE",headers:{Authorization:`Bearer ${Ve.value.token}`}});return{success:!0}}catch(e){return console.error("Failed to delete session",e),{success:!1,error:"Failed to delete session"}}},eR=async()=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/sessions`,{method:"DELETE",headers:{Authorization:`Bearer ${Ve.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Failed to logout from all devices",n),{success:!1,error:"Failed to logout from all devices"}}},tR=(n,e)=>{Ve.value.user=e,Ve.value.token=n,Ve.value.isAuthenticated=!0,localStorage.setItem(Iu,n)},lr=()=>{Ve.value.user=null,Ve.value.token=null,Ve.value.isAuthenticated=!1,localStorage.removeItem(Iu)},rm=()=>{const n=navigator.userAgent;let e="Unknown",t="Unknown";return n.includes("Chrome")?e="Chrome":n.includes("Firefox")?e="Firefox":n.includes("Safari")?e="Safari":n.includes("Edge")&&(e="Edge"),n.includes("Windows")?t="Windows":n.includes("Mac")?t="macOS":n.includes("Linux")?t="Linux":n.includes("Android")?t="Android":n.includes("iOS")&&(t="iOS"),`${e} on ${t}`},om=()=>{const n=navigator.userAgent;return/Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle/.test(n)?"mobile":/Tablet|iPad/.test(n)?"tablet":"desktop"},nR=async(n,e)=>{const t={...(e==null?void 0:e.headers)||{}};return Ve.value.token&&(t.Authorization=`Bearer ${Ve.value.token}`),fetch(n,{...e,headers:t})};$C();function iR(){return{user:ot(()=>Ve.value.user),token:ot(()=>Ve.value.token),isAuthenticated:ot(()=>Ve.value.isAuthenticated),loading:ot(()=>Ve.value.loading),error:ot(()=>Ve.value.error),register:XC,login:qC,logout:jC,updateProfile:YC,changePassword:KC,deleteAccount:ZC,getSessions:JC,logoutSession:QC,logoutAll:eR,fetchWithAuth:nR}}const sR={class:"auth-page"},rR={class:"auth-container"},oR={class:"auth-header"},aR={key:0},lR={key:0,class:"auth-message auth-message-success"},cR={key:1,class:"auth-message auth-message-error"},uR={key:2,class:"auth-tabs"},dR={key:3,class:"auth-form"},fR={class:"form-group"},hR=["disabled"],pR={class:"form-group"},mR=["type","disabled"],gR=["disabled"],vR={class:"auth-switch"},_R={key:4,class:"auth-form"},xR={class:"form-group"},yR=["disabled"],SR={class:"form-group"},bR=["disabled"],MR={class:"form-group"},ER=["type","disabled"],wR={class:"form-group"},TR=["type","disabled"],AR=["disabled"],CR={class:"auth-switch"},RR={key:5,class:"auth-form"},PR={class:"form-group"},IR=["value"],DR={class:"form-group"},LR=["disabled"],NR=["disabled"],UR={class:"form-group"},FR=["type","disabled"],kR={class:"form-group"},OR=["type","disabled"],BR={class:"form-group"},VR=["type","disabled"],zR=["disabled"],HR=["disabled"],GR={class:"auth-info"},$R=tt({__name:"AuthPage",setup(n){const e=iR(),t=Q("login"),i=Q(!1),s=Q({email:"",password:""}),r=Q({email:"",password:"",confirmPassword:"",displayName:""}),o=Q({displayName:""}),a=Q({oldPassword:"",newPassword:"",confirmNewPassword:""}),l=Q(""),c=Q(""),u=b=>{t.value=b,f(),b==="profile"&&e.user.value&&(o.value.displayName=e.user.value.display_name||"")},f=()=>{l.value="",c.value=""},h=async()=>{if(f(),!s.value.email||!s.value.password){c.value="Please fill in all fields";return}const b=await e.login(s.value.email,s.value.password);b.success?(l.value="Login successful!",s.value={email:"",password:""},setTimeout(()=>u("profile"),1e3)):b.error&&(c.value=b.error)},g=async()=>{if(f(),!r.value.email||!r.value.password||!r.value.displayName){c.value="Please fill in all fields";return}if(r.value.password!==r.value.confirmPassword){c.value="Passwords do not match";return}if(r.value.password.length<8){c.value="Password must be at least 8 characters";return}const b=await e.register(r.value.email,r.value.password,r.value.displayName);b.success?(l.value="Registration successful!",r.value={email:"",password:"",confirmPassword:"",displayName:""},setTimeout(()=>u("login"),1500)):b.error&&(c.value=b.error)},_=async()=>{if(f(),!o.value.displayName){c.value="Display name is required";return}const b=await e.updateProfile(o.value.displayName);b.success?l.value="Profile updated successfully!":b.error&&(c.value=b.error)},v=async()=>{if(f(),!a.value.oldPassword||!a.value.newPassword){c.value="Please fill in all fields";return}if(a.value.newPassword!==a.value.confirmNewPassword){c.value="New passwords do not match";return}if(a.value.newPassword.length<8){c.value="New password must be at least 8 characters";return}const b=await e.changePassword(a.value.oldPassword,a.value.newPassword);b.success?(l.value="Password changed successfully!",a.value={oldPassword:"",newPassword:"",confirmNewPassword:""}):b.error&&(c.value=b.error)},m=async()=>{confirm("Are you sure you want to logout?")&&(await e.logout(),l.value="Logged out successfully",u("login"))},p=async()=>{if(confirm("Are you sure you want to delete your account? This action cannot be undone.")){const b=prompt("Please enter your password to confirm account deletion:");if(!b)return;const y=await e.deleteAccount(b);y.success?(l.value="Account deleted successfully",u("login")):y.error&&(c.value=y.error)}};return(b,y)=>{var M,w,A,T;return N(),V("div",sR,[d("div",rR,[d("div",oR,[y[16]||(y[16]=d("h1",null,"🔐 Account",-1)),_e(e).isAuthenticated?(N(),V("p",aR,"Welcome, "+B(((M=_e(e).user)==null?void 0:M.display_name)||((w=_e(e).user)==null?void 0:w.email))+"!",1)):Me("",!0)]),l.value?(N(),V("div",lR," ✅ "+B(l.value),1)):Me("",!0),c.value?(N(),V("div",cR," ❌ "+B(c.value),1)):Me("",!0),_e(e).isAuthenticated?(N(),V("div",uR,[d("button",{class:Be({active:t.value==="profile"}),onClick:y[0]||(y[0]=R=>u("profile"))}," 👤 Profile ",2),d("button",{onClick:m}," 🚪 Logout ")])):Me("",!0),t.value==="login"?(N(),V("div",dR,[y[20]||(y[20]=d("h2",null,"Sign In",-1)),d("div",fR,[y[17]||(y[17]=d("label",null,"Email",-1)),_t(d("input",{"onUpdate:modelValue":y[1]||(y[1]=R=>s.value.email=R),type:"email",placeholder:"your@email.com",onKeyup:ls(h,["enter"]),disabled:_e(e).loading},null,40,hR),[[Lt,s.value.email]])]),d("div",pR,[y[18]||(y[18]=d("label",null,"Password",-1)),_t(d("input",{"onUpdate:modelValue":y[2]||(y[2]=R=>s.value.password=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(h,["enter"]),disabled:_e(e).loading},null,40,mR),[[Is,s.value.password]]),d("button",{class:"toggle-password",onClick:y[3]||(y[3]=R=>i.value=!i.value)},B(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-primary",onClick:h,disabled:_e(e).loading},B(_e(e).loading?"Signing in...":"Sign In"),9,gR),d("p",vR,[y[19]||(y[19]=Nt(" Don't have an account? ",-1)),d("a",{onClick:y[4]||(y[4]=R=>u("register"))},"Create one")])])):Me("",!0),t.value==="register"?(N(),V("div",_R,[y[26]||(y[26]=d("h2",null,"Create Account",-1)),d("div",xR,[y[21]||(y[21]=d("label",null,"Email",-1)),_t(d("input",{"onUpdate:modelValue":y[5]||(y[5]=R=>r.value.email=R),type:"email",placeholder:"your@email.com",onKeyup:ls(g,["enter"]),disabled:_e(e).loading},null,40,yR),[[Lt,r.value.email]])]),d("div",SR,[y[22]||(y[22]=d("label",null,"Display Name",-1)),_t(d("input",{"onUpdate:modelValue":y[6]||(y[6]=R=>r.value.displayName=R),type:"text",placeholder:"Your Name",onKeyup:ls(g,["enter"]),disabled:_e(e).loading},null,40,bR),[[Lt,r.value.displayName]])]),d("div",MR,[y[23]||(y[23]=d("label",null,"Password (min 8 characters)",-1)),_t(d("input",{"onUpdate:modelValue":y[7]||(y[7]=R=>r.value.password=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:_e(e).loading},null,8,ER),[[Is,r.value.password]])]),d("div",wR,[y[24]||(y[24]=d("label",null,"Confirm Password",-1)),_t(d("input",{"onUpdate:modelValue":y[8]||(y[8]=R=>r.value.confirmPassword=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(g,["enter"]),disabled:_e(e).loading},null,40,TR),[[Is,r.value.confirmPassword]]),d("button",{class:"toggle-password",onClick:y[9]||(y[9]=R=>i.value=!i.value)},B(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-primary",onClick:g,disabled:_e(e).loading},B(_e(e).loading?"Creating...":"Create Account"),9,AR),d("p",CR,[y[25]||(y[25]=Nt(" Already have an account? ",-1)),d("a",{onClick:y[10]||(y[10]=R=>u("login"))},"Sign in")])])):Me("",!0),t.value==="profile"&&_e(e).isAuthenticated?(N(),V("div",RR,[y[32]||(y[32]=d("h2",null,"Profile Settings",-1)),d("div",PR,[y[27]||(y[27]=d("label",null,"Email",-1)),d("input",{value:(A=_e(e).user)==null?void 0:A.email,type:"email",disabled:"",class:"disabled-input"},null,8,IR)]),d("div",DR,[y[28]||(y[28]=d("label",null,"Display Name",-1)),_t(d("input",{"onUpdate:modelValue":y[11]||(y[11]=R=>o.value.displayName=R),type:"text",onKeyup:ls(_,["enter"]),disabled:_e(e).loading},null,40,LR),[[Lt,o.value.displayName]])]),d("button",{class:"auth-btn auth-btn-primary",onClick:_,disabled:_e(e).loading},B(_e(e).loading?"Updating...":"Update Profile"),9,NR),y[33]||(y[33]=d("hr",{class:"auth-divider"},null,-1)),y[34]||(y[34]=d("h3",null,"Change Password",-1)),d("div",UR,[y[29]||(y[29]=d("label",null,"Current Password",-1)),_t(d("input",{"onUpdate:modelValue":y[12]||(y[12]=R=>a.value.oldPassword=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:_e(e).loading},null,8,FR),[[Is,a.value.oldPassword]])]),d("div",kR,[y[30]||(y[30]=d("label",null,"New Password",-1)),_t(d("input",{"onUpdate:modelValue":y[13]||(y[13]=R=>a.value.newPassword=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:_e(e).loading},null,8,OR),[[Is,a.value.newPassword]])]),d("div",BR,[y[31]||(y[31]=d("label",null,"Confirm New Password",-1)),_t(d("input",{"onUpdate:modelValue":y[14]||(y[14]=R=>a.value.confirmNewPassword=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(v,["enter"]),disabled:_e(e).loading},null,40,VR),[[Is,a.value.confirmNewPassword]]),d("button",{class:"toggle-password",onClick:y[15]||(y[15]=R=>i.value=!i.value)},B(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-secondary",onClick:v,disabled:_e(e).loading},B(_e(e).loading?"Changing...":"Change Password"),9,zR),y[35]||(y[35]=d("hr",{class:"auth-divider"},null,-1)),d("button",{class:"auth-btn auth-btn-danger",onClick:p,disabled:_e(e).loading}," 🗑️ Delete Account ",8,HR),d("p",GR," Account created: "+B(new Date(((T=_e(e).user)==null?void 0:T.created_at)||"").toLocaleDateString()),1)])):Me("",!0)])])}}}),WR=ct($R,[["__scopeId","data-v-c713f8b1"]]);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Du="182",XR=0,xf=1,qR=2,sa=1,jR=2,Lr=3,ts=0,_n=1,ii=2,Ri=0,er=1,yf=2,Sf=3,bf=4,YR=5,xs=100,KR=101,ZR=102,JR=103,QR=104,e3=200,t3=201,n3=202,i3=203,pc=204,mc=205,s3=206,r3=207,o3=208,a3=209,l3=210,c3=211,u3=212,d3=213,f3=214,gc=0,vc=1,_c=2,cr=3,xc=4,yc=5,Sc=6,bc=7,Lu=0,h3=1,p3=2,ai=0,am=1,lm=2,cm=3,um=4,dm=5,fm=6,hm=7,pm=300,Cs=301,ur=302,Mc=303,Ec=304,$a=306,wc=1e3,Ai=1001,Tc=1002,Zt=1003,m3=1004,Co=1005,on=1006,pl=1007,bs=1008,Mn=1009,mm=1010,gm=1011,eo=1012,Nu=1013,di=1014,si=1015,Ni=1016,Uu=1017,Fu=1018,to=1020,vm=35902,_m=35899,xm=1021,ym=1022,Gn=1023,Ui=1026,Ms=1027,Sm=1028,ku=1029,dr=1030,Ou=1031,Bu=1033,ra=33776,oa=33777,aa=33778,la=33779,Ac=35840,Cc=35841,Rc=35842,Pc=35843,Ic=36196,Dc=37492,Lc=37496,Nc=37488,Uc=37489,Fc=37490,kc=37491,Oc=37808,Bc=37809,Vc=37810,zc=37811,Hc=37812,Gc=37813,$c=37814,Wc=37815,Xc=37816,qc=37817,jc=37818,Yc=37819,Kc=37820,Zc=37821,Jc=36492,Qc=36494,eu=36495,tu=36283,nu=36284,iu=36285,su=36286,g3=3200,bm=0,v3=1,Zi="",Dn="srgb",fr="srgb-linear",ya="linear",Mt="srgb",Ls=7680,Mf=519,_3=512,x3=513,y3=514,Vu=515,S3=516,b3=517,zu=518,M3=519,Ef=35044,wf="300 es",ri=2e3,Sa=2001;function Mm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ba(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function E3(){const n=ba("canvas");return n.style.display="block",n}const Tf={};function Af(...n){const e="THREE."+n.shift();console.log(e,...n)}function Ze(...n){const e="THREE."+n.shift();console.warn(e,...n)}function gt(...n){const e="THREE."+n.shift();console.error(e,...n)}function no(...n){const e=n.join(" ");e in Tf||(Tf[e]=!0,Ze(...n))}function w3(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}class mr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ml=Math.PI/180,ru=180/Math.PI;function uo(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function ut(n,e,t){return Math.max(e,Math.min(t,n))}function T3(n,e){return(n%e+e)%e}function gl(n,e,t){return(1-t)*n+t*e}function Er(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function vn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class vt{constructor(e=0,t=0){vt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class fo{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],f=i[s+3],h=r[o+0],g=r[o+1],_=r[o+2],v=r[o+3];if(a<=0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f;return}if(a>=1){e[t+0]=h,e[t+1]=g,e[t+2]=_,e[t+3]=v;return}if(f!==v||l!==h||c!==g||u!==_){let m=l*h+c*g+u*_+f*v;m<0&&(h=-h,g=-g,_=-_,v=-v,m=-m);let p=1-a;if(m<.9995){const b=Math.acos(m),y=Math.sin(b);p=Math.sin(p*b)/y,a=Math.sin(a*b)/y,l=l*p+h*a,c=c*p+g*a,u=u*p+_*a,f=f*p+v*a}else{l=l*p+h*a,c=c*p+g*a,u=u*p+_*a,f=f*p+v*a;const b=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=b,c*=b,u*=b,f*=b}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],f=r[o],h=r[o+1],g=r[o+2],_=r[o+3];return e[t]=a*_+u*f+l*g-c*h,e[t+1]=l*_+u*h+c*f-a*g,e[t+2]=c*_+u*g+a*h-l*f,e[t+3]=u*_-a*f-l*h-c*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),f=a(r/2),h=l(i/2),g=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*g*_,this._y=c*g*f-h*u*_,this._z=c*u*_+h*g*f,this._w=c*u*f-h*g*_;break;case"YXZ":this._x=h*u*f+c*g*_,this._y=c*g*f-h*u*_,this._z=c*u*_-h*g*f,this._w=c*u*f+h*g*_;break;case"ZXY":this._x=h*u*f-c*g*_,this._y=c*g*f+h*u*_,this._z=c*u*_+h*g*f,this._w=c*u*f-h*g*_;break;case"ZYX":this._x=h*u*f-c*g*_,this._y=c*g*f+h*u*_,this._z=c*u*_-h*g*f,this._w=c*u*f+h*g*_;break;case"YZX":this._x=h*u*f+c*g*_,this._y=c*g*f+h*u*_,this._z=c*u*_-h*g*f,this._w=c*u*f-h*g*_;break;case"XZY":this._x=h*u*f-c*g*_,this._y=c*g*f-h*u*_,this._z=c*u*_+h*g*f,this._w=c*u*f+h*g*_;break;default:Ze("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=i+a+f;if(h>0){const g=.5/Math.sqrt(h+1);this._w=.25/g,this._x=(u-l)*g,this._y=(r-c)*g,this._z=(o-s)*g}else if(i>a&&i>f){const g=2*Math.sqrt(1+i-a-f);this._w=(u-l)/g,this._x=.25*g,this._y=(s+o)/g,this._z=(r+c)/g}else if(a>f){const g=2*Math.sqrt(1+a-i-f);this._w=(r-c)/g,this._x=(s+o)/g,this._y=.25*g,this._z=(l+u)/g}else{const g=2*Math.sqrt(1+f-i-a);this._w=(o-s)/g,this._x=(r+c)/g,this._y=(l+u)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class se{constructor(e=0,t=0,i=0){se.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Cf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Cf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),f=2*(r*i-o*t);return this.x=t+l*c+o*f-a*u,this.y=i+l*u+a*c-r*f,this.z=s+l*f+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return vl.copy(this).projectOnVector(e),this.sub(vl)}reflect(e){return this.sub(vl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const vl=new se,Cf=new fo;class it{constructor(e,t,i,s,r,o,a,l,c){it.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],f=i[7],h=i[2],g=i[5],_=i[8],v=s[0],m=s[3],p=s[6],b=s[1],y=s[4],M=s[7],w=s[2],A=s[5],T=s[8];return r[0]=o*v+a*b+l*w,r[3]=o*m+a*y+l*A,r[6]=o*p+a*M+l*T,r[1]=c*v+u*b+f*w,r[4]=c*m+u*y+f*A,r[7]=c*p+u*M+f*T,r[2]=h*v+g*b+_*w,r[5]=h*m+g*y+_*A,r[8]=h*p+g*M+_*T,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=u*o-a*c,h=a*l-u*r,g=c*r-o*l,_=t*f+i*h+s*g;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return e[0]=f*v,e[1]=(s*c-u*i)*v,e[2]=(a*i-s*o)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=g*v,e[7]=(i*l-c*t)*v,e[8]=(o*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(_l.makeScale(e,t)),this}rotate(e){return this.premultiply(_l.makeRotation(-e)),this}translate(e,t){return this.premultiply(_l.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const _l=new it,Rf=new it().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Pf=new it().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function A3(){const n={enabled:!0,workingColorSpace:fr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Mt&&(s.r=Pi(s.r),s.g=Pi(s.g),s.b=Pi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Mt&&(s.r=tr(s.r),s.g=tr(s.g),s.b=tr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zi?ya:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return no("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return no("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[fr]:{primaries:e,whitePoint:i,transfer:ya,toXYZ:Rf,fromXYZ:Pf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dn},outputColorSpaceConfig:{drawingBufferColorSpace:Dn}},[Dn]:{primaries:e,whitePoint:i,transfer:Mt,toXYZ:Rf,fromXYZ:Pf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dn}}}),n}const ht=A3();function Pi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function tr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ns;class C3{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ns===void 0&&(Ns=ba("canvas")),Ns.width=e.width,Ns.height=e.height;const s=Ns.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Ns}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ba("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Pi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Pi(t[i]/255)*255):t[i]=Pi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ze("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let R3=0;class Hu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:R3++}),this.uuid=uo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(xl(s[o].image)):r.push(xl(s[o]))}else r=xl(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function xl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?C3.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ze("Texture: Unable to serialize Texture."),{})}let P3=0;const yl=new se;class pn extends mr{constructor(e=pn.DEFAULT_IMAGE,t=pn.DEFAULT_MAPPING,i=Ai,s=Ai,r=on,o=bs,a=Gn,l=Mn,c=pn.DEFAULT_ANISOTROPY,u=Zi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:P3++}),this.uuid=uo(),this.name="",this.source=new Hu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new vt(0,0),this.repeat=new vt(1,1),this.center=new vt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new it,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(yl).x}get height(){return this.source.getSize(yl).y}get depth(){return this.source.getSize(yl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ze(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==pm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case wc:e.x=e.x-Math.floor(e.x);break;case Ai:e.x=e.x<0?0:1;break;case Tc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case wc:e.y=e.y-Math.floor(e.y);break;case Ai:e.y=e.y<0?0:1;break;case Tc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=pm;pn.DEFAULT_ANISOTROPY=1;class Vt{constructor(e=0,t=0,i=0,s=1){Vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],g=l[5],_=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+v)<.1&&Math.abs(_+m)<.1&&Math.abs(c+g+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,M=(g+1)/2,w=(p+1)/2,A=(u+h)/4,T=(f+v)/4,R=(_+m)/4;return y>M&&y>w?y<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(y),s=A/i,r=T/i):M>w?M<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),i=A/s,r=R/s):w<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(w),i=T/r,s=R/r),this.set(i,s,r,t),this}let b=Math.sqrt((m-_)*(m-_)+(f-v)*(f-v)+(h-u)*(h-u));return Math.abs(b)<.001&&(b=1),this.x=(m-_)/b,this.y=(f-v)/b,this.z=(h-u)/b,this.w=Math.acos((c+g+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class I3 extends mr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Vt(0,0,e,t),this.scissorTest=!1,this.viewport=new Vt(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new pn(s);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Hu(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class li extends I3{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Em extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class D3 extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ho{constructor(e=new se(1/0,1/0,1/0),t=new se(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(On.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(On.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=On.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,On):On.fromBufferAttribute(r,o),On.applyMatrix4(e.matrixWorld),this.expandByPoint(On);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ro.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Ro.copy(i.boundingBox)),Ro.applyMatrix4(e.matrixWorld),this.union(Ro)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,On),On.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wr),Po.subVectors(this.max,wr),Us.subVectors(e.a,wr),Fs.subVectors(e.b,wr),ks.subVectors(e.c,wr),Bi.subVectors(Fs,Us),Vi.subVectors(ks,Fs),cs.subVectors(Us,ks);let t=[0,-Bi.z,Bi.y,0,-Vi.z,Vi.y,0,-cs.z,cs.y,Bi.z,0,-Bi.x,Vi.z,0,-Vi.x,cs.z,0,-cs.x,-Bi.y,Bi.x,0,-Vi.y,Vi.x,0,-cs.y,cs.x,0];return!Sl(t,Us,Fs,ks,Po)||(t=[1,0,0,0,1,0,0,0,1],!Sl(t,Us,Fs,ks,Po))?!1:(Io.crossVectors(Bi,Vi),t=[Io.x,Io.y,Io.z],Sl(t,Us,Fs,ks,Po))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,On).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(On).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_i[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_i[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_i[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_i[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_i[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_i[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_i[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_i[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_i),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const _i=[new se,new se,new se,new se,new se,new se,new se,new se],On=new se,Ro=new ho,Us=new se,Fs=new se,ks=new se,Bi=new se,Vi=new se,cs=new se,wr=new se,Po=new se,Io=new se,us=new se;function Sl(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){us.fromArray(n,r);const a=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),l=e.dot(us),c=t.dot(us),u=i.dot(us);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const L3=new ho,Tr=new se,bl=new se;class Wa{constructor(e=new se,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):L3.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Tr.subVectors(e,this.center);const t=Tr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Tr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Tr.copy(e.center).add(bl)),this.expandByPoint(Tr.copy(e.center).sub(bl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const xi=new se,Ml=new se,Do=new se,zi=new se,El=new se,Lo=new se,wl=new se;class wm{constructor(e=new se,t=new se(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xi.copy(this.origin).addScaledVector(this.direction,t),xi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ml.copy(e).add(t).multiplyScalar(.5),Do.copy(t).sub(e).normalize(),zi.copy(this.origin).sub(Ml);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Do),a=zi.dot(this.direction),l=-zi.dot(Do),c=zi.lengthSq(),u=Math.abs(1-o*o);let f,h,g,_;if(u>0)if(f=o*l-a,h=o*a-l,_=r*u,f>=0)if(h>=-_)if(h<=_){const v=1/u;f*=v,h*=v,g=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),g=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),g=-f*f+h*(h+2*l)+c;else h<=-_?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),g=-f*f+h*(h+2*l)+c):h<=_?(f=0,h=Math.min(Math.max(-r,-l),r),g=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),g=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),g=-f*f+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Ml).addScaledVector(Do,h),g}intersectSphere(e,t){xi.subVectors(e.center,this.origin);const i=xi.dot(this.direction),s=xi.dot(xi)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,xi)!==null}intersectTriangle(e,t,i,s,r){El.subVectors(t,e),Lo.subVectors(i,e),wl.crossVectors(El,Lo);let o=this.direction.dot(wl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zi.subVectors(this.origin,e);const l=a*this.direction.dot(Lo.crossVectors(zi,Lo));if(l<0)return null;const c=a*this.direction.dot(El.cross(zi));if(c<0||l+c>o)return null;const u=-a*zi.dot(wl);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ut{constructor(e,t,i,s,r,o,a,l,c,u,f,h,g,_,v,m){Ut.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,f,h,g,_,v,m)}set(e,t,i,s,r,o,a,l,c,u,f,h,g,_,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=f,p[14]=h,p[3]=g,p[7]=_,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ut().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,i=e.elements,s=1/Os.setFromMatrixColumn(e,0).length(),r=1/Os.setFromMatrixColumn(e,1).length(),o=1/Os.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const h=o*u,g=o*f,_=a*u,v=a*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=g+_*c,t[5]=h-v*c,t[9]=-a*l,t[2]=v-h*c,t[6]=_+g*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,g=l*f,_=c*u,v=c*f;t[0]=h+v*a,t[4]=_*a-g,t[8]=o*c,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=g*a-_,t[6]=v+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,g=l*f,_=c*u,v=c*f;t[0]=h-v*a,t[4]=-o*f,t[8]=_+g*a,t[1]=g+_*a,t[5]=o*u,t[9]=v-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,g=o*f,_=a*u,v=a*f;t[0]=l*u,t[4]=_*c-g,t[8]=h*c+v,t[1]=l*f,t[5]=v*c+h,t[9]=g*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,g=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=v-h*f,t[8]=_*f+g,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=g*f+_,t[10]=h-v*f}else if(e.order==="XZY"){const h=o*l,g=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+v,t[5]=o*u,t[9]=g*f-_,t[2]=_*f-g,t[6]=a*u,t[10]=v*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(N3,e,U3)}lookAt(e,t,i){const s=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),Hi.crossVectors(i,Sn),Hi.lengthSq()===0&&(Math.abs(i.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),Hi.crossVectors(i,Sn)),Hi.normalize(),No.crossVectors(Sn,Hi),s[0]=Hi.x,s[4]=No.x,s[8]=Sn.x,s[1]=Hi.y,s[5]=No.y,s[9]=Sn.y,s[2]=Hi.z,s[6]=No.z,s[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],f=i[5],h=i[9],g=i[13],_=i[2],v=i[6],m=i[10],p=i[14],b=i[3],y=i[7],M=i[11],w=i[15],A=s[0],T=s[4],R=s[8],x=s[12],E=s[1],U=s[5],O=s[9],j=s[13],ee=s[2],te=s[6],K=s[10],I=s[14],F=s[3],$=s[7],J=s[11],oe=s[15];return r[0]=o*A+a*E+l*ee+c*F,r[4]=o*T+a*U+l*te+c*$,r[8]=o*R+a*O+l*K+c*J,r[12]=o*x+a*j+l*I+c*oe,r[1]=u*A+f*E+h*ee+g*F,r[5]=u*T+f*U+h*te+g*$,r[9]=u*R+f*O+h*K+g*J,r[13]=u*x+f*j+h*I+g*oe,r[2]=_*A+v*E+m*ee+p*F,r[6]=_*T+v*U+m*te+p*$,r[10]=_*R+v*O+m*K+p*J,r[14]=_*x+v*j+m*I+p*oe,r[3]=b*A+y*E+M*ee+w*F,r[7]=b*T+y*U+M*te+w*$,r[11]=b*R+y*O+M*K+w*J,r[15]=b*x+y*j+M*I+w*oe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],g=e[14],_=e[3],v=e[7],m=e[11],p=e[15],b=l*g-c*h,y=a*g-c*f,M=a*h-l*f,w=o*g-c*u,A=o*h-l*u,T=o*f-a*u;return t*(v*b-m*y+p*M)-i*(_*b-m*w+p*A)+s*(_*y-v*w+p*T)-r*(_*M-v*A+m*T)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],g=e[11],_=e[12],v=e[13],m=e[14],p=e[15],b=f*m*c-v*h*c+v*l*g-a*m*g-f*l*p+a*h*p,y=_*h*c-u*m*c-_*l*g+o*m*g+u*l*p-o*h*p,M=u*v*c-_*f*c+_*a*g-o*v*g-u*a*p+o*f*p,w=_*f*l-u*v*l-_*a*h+o*v*h+u*a*m-o*f*m,A=t*b+i*y+s*M+r*w;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/A;return e[0]=b*T,e[1]=(v*h*r-f*m*r-v*s*g+i*m*g+f*s*p-i*h*p)*T,e[2]=(a*m*r-v*l*r+v*s*c-i*m*c-a*s*p+i*l*p)*T,e[3]=(f*l*r-a*h*r-f*s*c+i*h*c+a*s*g-i*l*g)*T,e[4]=y*T,e[5]=(u*m*r-_*h*r+_*s*g-t*m*g-u*s*p+t*h*p)*T,e[6]=(_*l*r-o*m*r-_*s*c+t*m*c+o*s*p-t*l*p)*T,e[7]=(o*h*r-u*l*r+u*s*c-t*h*c-o*s*g+t*l*g)*T,e[8]=M*T,e[9]=(_*f*r-u*v*r-_*i*g+t*v*g+u*i*p-t*f*p)*T,e[10]=(o*v*r-_*a*r+_*i*c-t*v*c-o*i*p+t*a*p)*T,e[11]=(u*a*r-o*f*r-u*i*c+t*f*c+o*i*g-t*a*g)*T,e[12]=w*T,e[13]=(u*v*s-_*f*s+_*i*h-t*v*h-u*i*m+t*f*m)*T,e[14]=(_*a*s-o*v*s-_*i*l+t*v*l+o*i*m-t*a*m)*T,e[15]=(o*f*s-u*a*s+u*i*l-t*f*l-o*i*h+t*a*h)*T,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,f=a+a,h=r*c,g=r*u,_=r*f,v=o*u,m=o*f,p=a*f,b=l*c,y=l*u,M=l*f,w=i.x,A=i.y,T=i.z;return s[0]=(1-(v+p))*w,s[1]=(g+M)*w,s[2]=(_-y)*w,s[3]=0,s[4]=(g-M)*A,s[5]=(1-(h+p))*A,s[6]=(m+b)*A,s[7]=0,s[8]=(_+y)*T,s[9]=(m-b)*T,s[10]=(1-(h+v))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;if(e.x=s[12],e.y=s[13],e.z=s[14],this.determinant()===0)return i.set(1,1,1),t.identity(),this;let r=Os.set(s[0],s[1],s[2]).length();const o=Os.set(s[4],s[5],s[6]).length(),a=Os.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),Bn.copy(this);const c=1/r,u=1/o,f=1/a;return Bn.elements[0]*=c,Bn.elements[1]*=c,Bn.elements[2]*=c,Bn.elements[4]*=u,Bn.elements[5]*=u,Bn.elements[6]*=u,Bn.elements[8]*=f,Bn.elements[9]*=f,Bn.elements[10]*=f,t.setFromRotationMatrix(Bn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=ri,l=!1){const c=this.elements,u=2*r/(t-e),f=2*r/(i-s),h=(t+e)/(t-e),g=(i+s)/(i-s);let _,v;if(l)_=r/(o-r),v=o*r/(o-r);else if(a===ri)_=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Sa)_=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=g,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=ri,l=!1){const c=this.elements,u=2/(t-e),f=2/(i-s),h=-(t+e)/(t-e),g=-(i+s)/(i-s);let _,v;if(l)_=1/(o-r),v=o/(o-r);else if(a===ri)_=-2/(o-r),v=-(o+r)/(o-r);else if(a===Sa)_=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=g,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Os=new se,Bn=new Ut,N3=new se(0,0,0),U3=new se(1,1,1),Hi=new se,No=new se,Sn=new se,If=new Ut,Df=new fo;class fi{constructor(e=0,t=0,i=0,s=fi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],g=s[10];switch(t){case"XYZ":this._y=Math.asin(ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,g),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,g),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,g),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ut(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,g),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,g));break;case"XZY":this._z=Math.asin(-ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,g),this._y=0);break;default:Ze("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return If.makeRotationFromQuaternion(e),this.setFromRotationMatrix(If,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Df.setFromEuler(this),this.setFromQuaternion(Df,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fi.DEFAULT_ORDER="XYZ";class Tm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let F3=0;const Lf=new se,Bs=new fo,yi=new Ut,Uo=new se,Ar=new se,k3=new se,O3=new fo,Nf=new se(1,0,0),Uf=new se(0,1,0),Ff=new se(0,0,1),kf={type:"added"},B3={type:"removed"},Vs={type:"childadded",child:null},Tl={type:"childremoved",child:null};class Jt extends mr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:F3++}),this.uuid=uo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Jt.DEFAULT_UP.clone();const e=new se,t=new fi,i=new fo,s=new se(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ut},normalMatrix:{value:new it}}),this.matrix=new Ut,this.matrixWorld=new Ut,this.matrixAutoUpdate=Jt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Tm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.premultiply(Bs),this}rotateX(e){return this.rotateOnAxis(Nf,e)}rotateY(e){return this.rotateOnAxis(Uf,e)}rotateZ(e){return this.rotateOnAxis(Ff,e)}translateOnAxis(e,t){return Lf.copy(e).applyQuaternion(this.quaternion),this.position.add(Lf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Nf,e)}translateY(e){return this.translateOnAxis(Uf,e)}translateZ(e){return this.translateOnAxis(Ff,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Uo.copy(e):Uo.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yi.lookAt(Ar,Uo,this.up):yi.lookAt(Uo,Ar,this.up),this.quaternion.setFromRotationMatrix(yi),s&&(yi.extractRotation(s.matrixWorld),Bs.setFromRotationMatrix(yi),this.quaternion.premultiply(Bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(gt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(kf),Vs.child=e,this.dispatchEvent(Vs),Vs.child=null):gt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(B3),Tl.child=e,this.dispatchEvent(Tl),Tl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(kf),Vs.child=e,this.dispatchEvent(Vs),Vs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,e,k3),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,O3,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),g=o(e.animations),_=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),g.length>0&&(i.animations=g),_.length>0&&(i.nodes=_)}return i.object=s,i;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Jt.DEFAULT_UP=new se(0,1,0);Jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Vn=new se,Si=new se,Al=new se,bi=new se,zs=new se,Hs=new se,Of=new se,Cl=new se,Rl=new se,Pl=new se,Il=new Vt,Dl=new Vt,Ll=new Vt;class Hn{constructor(e=new se,t=new se,i=new se){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Vn.subVectors(e,t),s.cross(Vn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Vn.subVectors(s,t),Si.subVectors(i,t),Al.subVectors(e,t);const o=Vn.dot(Vn),a=Vn.dot(Si),l=Vn.dot(Al),c=Si.dot(Si),u=Si.dot(Al),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;const h=1/f,g=(c*l-a*u)*h,_=(o*u-a*l)*h;return r.set(1-g-_,_,g)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,bi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,bi.x),l.addScaledVector(o,bi.y),l.addScaledVector(a,bi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Il.setScalar(0),Dl.setScalar(0),Ll.setScalar(0),Il.fromBufferAttribute(e,t),Dl.fromBufferAttribute(e,i),Ll.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Il,r.x),o.addScaledVector(Dl,r.y),o.addScaledVector(Ll,r.z),o}static isFrontFacing(e,t,i,s){return Vn.subVectors(i,t),Si.subVectors(e,t),Vn.cross(Si).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Vn.subVectors(this.c,this.b),Si.subVectors(this.a,this.b),Vn.cross(Si).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Hn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Hn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Hn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Hn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Hn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;zs.subVectors(s,i),Hs.subVectors(r,i),Cl.subVectors(e,i);const l=zs.dot(Cl),c=Hs.dot(Cl);if(l<=0&&c<=0)return t.copy(i);Rl.subVectors(e,s);const u=zs.dot(Rl),f=Hs.dot(Rl);if(u>=0&&f<=u)return t.copy(s);const h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(zs,o);Pl.subVectors(e,r);const g=zs.dot(Pl),_=Hs.dot(Pl);if(_>=0&&g<=_)return t.copy(r);const v=g*c-l*_;if(v<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(i).addScaledVector(Hs,a);const m=u*_-g*f;if(m<=0&&f-u>=0&&g-_>=0)return Of.subVectors(r,s),a=(f-u)/(f-u+(g-_)),t.copy(s).addScaledVector(Of,a);const p=1/(m+v+h);return o=v*p,a=h*p,t.copy(i).addScaledVector(zs,o).addScaledVector(Hs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Am={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},Fo={h:0,s:0,l:0};function Nl(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class dt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=ht.workingColorSpace){return this.r=e,this.g=t,this.b=i,ht.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=ht.workingColorSpace){if(e=T3(e,1),t=ut(t,0,1),i=ut(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Nl(o,r,e+1/3),this.g=Nl(o,r,e),this.b=Nl(o,r,e-1/3)}return ht.colorSpaceToWorking(this,s),this}setStyle(e,t=Dn){function i(r){r!==void 0&&parseFloat(r)<1&&Ze("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ze("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Ze("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dn){const i=Am[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ze("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dn){return ht.workingToColorSpace(tn.copy(this),e),Math.round(ut(tn.r*255,0,255))*65536+Math.round(ut(tn.g*255,0,255))*256+Math.round(ut(tn.b*255,0,255))}getHexString(e=Dn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.workingToColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case i:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-i)/f+2;break;case r:l=(i-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.workingToColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=Dn){ht.workingToColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==Dn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Gi),this.setHSL(Gi.h+e,Gi.s+t,Gi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Gi),e.getHSL(Fo);const i=gl(Gi.h,Fo.h,t),s=gl(Gi.s,Fo.s,t),r=gl(Gi.l,Fo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new dt;dt.NAMES=Am;let V3=0;class gr extends mr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:V3++}),this.uuid=uo(),this.name="",this.type="Material",this.blending=er,this.side=ts,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=pc,this.blendDst=mc,this.blendEquation=xs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new dt(0,0,0),this.blendAlpha=0,this.depthFunc=cr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Mf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ls,this.stencilZFail=Ls,this.stencilZPass=Ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ze(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==er&&(i.blending=this.blending),this.side!==ts&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==pc&&(i.blendSrc=this.blendSrc),this.blendDst!==mc&&(i.blendDst=this.blendDst),this.blendEquation!==xs&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==cr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Mf&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ls&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ls&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ls&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Cm extends gr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=Lu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Gt=new se,ko=new vt;let z3=0;class ci{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:z3++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Ef,this.updateRanges=[],this.gpuType=si,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)ko.fromBufferAttribute(this,t),ko.applyMatrix3(e),this.setXY(t,ko.x,ko.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix3(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix4(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyNormalMatrix(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.transformDirection(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Er(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=vn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Er(t,this.array)),t}setX(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Er(t,this.array)),t}setY(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Er(t,this.array)),t}setZ(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Er(t,this.array)),t}setW(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array),r=vn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ef&&(e.usage=this.usage),e}}class Rm extends ci{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Pm extends ci{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class an extends ci{constructor(e,t,i){super(new Float32Array(e),t,i)}}let H3=0;const In=new Ut,Ul=new Jt,Gs=new se,bn=new ho,Cr=new ho,jt=new se;class Cn extends mr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:H3++}),this.uuid=uo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Mm(e)?Pm:Rm)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new it().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return In.makeRotationFromQuaternion(e),this.applyMatrix4(In),this}rotateX(e){return In.makeRotationX(e),this.applyMatrix4(In),this}rotateY(e){return In.makeRotationY(e),this.applyMatrix4(In),this}rotateZ(e){return In.makeRotationZ(e),this.applyMatrix4(In),this}translate(e,t,i){return In.makeTranslation(e,t,i),this.applyMatrix4(In),this}scale(e,t,i){return In.makeScale(e,t,i),this.applyMatrix4(In),this}lookAt(e){return Ul.lookAt(e),Ul.updateMatrix(),this.applyMatrix4(Ul.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gs).negate(),this.translate(Gs.x,Gs.y,Gs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new an(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ze("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ho);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new se(-1/0,-1/0,-1/0),new se(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];bn.setFromBufferAttribute(r),this.morphTargetsRelative?(jt.addVectors(this.boundingBox.min,bn.min),this.boundingBox.expandByPoint(jt),jt.addVectors(this.boundingBox.max,bn.max),this.boundingBox.expandByPoint(jt)):(this.boundingBox.expandByPoint(bn.min),this.boundingBox.expandByPoint(bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&gt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wa);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new se,1/0);return}if(e){const i=this.boundingSphere.center;if(bn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Cr.setFromBufferAttribute(a),this.morphTargetsRelative?(jt.addVectors(bn.min,Cr.min),bn.expandByPoint(jt),jt.addVectors(bn.max,Cr.max),bn.expandByPoint(jt)):(bn.expandByPoint(Cr.min),bn.expandByPoint(Cr.max))}bn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)jt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(jt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)jt.fromBufferAttribute(a,c),l&&(Gs.fromBufferAttribute(e,c),jt.add(Gs)),s=Math.max(s,i.distanceToSquared(jt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&gt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){gt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ci(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let R=0;R<i.count;R++)a[R]=new se,l[R]=new se;const c=new se,u=new se,f=new se,h=new vt,g=new vt,_=new vt,v=new se,m=new se;function p(R,x,E){c.fromBufferAttribute(i,R),u.fromBufferAttribute(i,x),f.fromBufferAttribute(i,E),h.fromBufferAttribute(r,R),g.fromBufferAttribute(r,x),_.fromBufferAttribute(r,E),u.sub(c),f.sub(c),g.sub(h),_.sub(h);const U=1/(g.x*_.y-_.x*g.y);isFinite(U)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(f,-g.y).multiplyScalar(U),m.copy(f).multiplyScalar(g.x).addScaledVector(u,-_.x).multiplyScalar(U),a[R].add(v),a[x].add(v),a[E].add(v),l[R].add(m),l[x].add(m),l[E].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let R=0,x=b.length;R<x;++R){const E=b[R],U=E.start,O=E.count;for(let j=U,ee=U+O;j<ee;j+=3)p(e.getX(j+0),e.getX(j+1),e.getX(j+2))}const y=new se,M=new se,w=new se,A=new se;function T(R){w.fromBufferAttribute(s,R),A.copy(w);const x=a[R];y.copy(x),y.sub(w.multiplyScalar(w.dot(x))).normalize(),M.crossVectors(A,x);const U=M.dot(l[R])<0?-1:1;o.setXYZW(R,y.x,y.y,y.z,U)}for(let R=0,x=b.length;R<x;++R){const E=b[R],U=E.start,O=E.count;for(let j=U,ee=U+O;j<ee;j+=3)T(e.getX(j+0)),T(e.getX(j+1)),T(e.getX(j+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new ci(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,g=i.count;h<g;h++)i.setXYZ(h,0,0,0);const s=new se,r=new se,o=new se,a=new se,l=new se,c=new se,u=new se,f=new se;if(e)for(let h=0,g=e.count;h<g;h+=3){const _=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),a.fromBufferAttribute(i,_),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),a.add(u),l.add(u),c.add(u),i.setXYZ(_,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,g=t.count;h<g;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)jt.fromBufferAttribute(e,t),jt.normalize(),e.setXYZ(t,jt.x,jt.y,jt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u);let g=0,_=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?g=l[v]*a.data.stride+a.offset:g=l[v]*u;for(let p=0;p<u;p++)h[_++]=c[g++]}return new ci(h,u,f)}if(this.index===null)return Ze("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Cn,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){const h=c[u],g=e(h,i);l.push(g)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){const g=c[f];u.push(g.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],f=r[c];for(let h=0,g=f.length;h<g;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Bf=new Ut,ds=new wm,Oo=new Wa,Vf=new se,Bo=new se,Vo=new se,zo=new se,Fl=new se,Ho=new se,zf=new se,Go=new se;class wn extends Jt{constructor(e=new Cn,t=new Cm){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Ho.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],f=r[l];u!==0&&(Fl.fromBufferAttribute(f,e),o?Ho.addScaledVector(Fl,u):Ho.addScaledVector(Fl.sub(t),u))}t.add(Ho)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Oo.copy(i.boundingSphere),Oo.applyMatrix4(r),ds.copy(e.ray).recast(e.near),!(Oo.containsPoint(ds.origin)===!1&&(ds.intersectSphere(Oo,Vf)===null||ds.origin.distanceToSquared(Vf)>(e.far-e.near)**2))&&(Bf.copy(r).invert(),ds.copy(e.ray).applyMatrix4(Bf),!(i.boundingBox!==null&&ds.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,g=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const m=h[_],p=o[m.materialIndex],b=Math.max(m.start,g.start),y=Math.min(a.count,Math.min(m.start+m.count,g.start+g.count));for(let M=b,w=y;M<w;M+=3){const A=a.getX(M),T=a.getX(M+1),R=a.getX(M+2);s=$o(this,p,e,i,c,u,f,A,T,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,g.start),v=Math.min(a.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const b=a.getX(m),y=a.getX(m+1),M=a.getX(m+2);s=$o(this,o,e,i,c,u,f,b,y,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const m=h[_],p=o[m.materialIndex],b=Math.max(m.start,g.start),y=Math.min(l.count,Math.min(m.start+m.count,g.start+g.count));for(let M=b,w=y;M<w;M+=3){const A=M,T=M+1,R=M+2;s=$o(this,p,e,i,c,u,f,A,T,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,g.start),v=Math.min(l.count,g.start+g.count);for(let m=_,p=v;m<p;m+=3){const b=m,y=m+1,M=m+2;s=$o(this,o,e,i,c,u,f,b,y,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function G3(n,e,t,i,s,r,o,a){let l;if(e.side===_n?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===ts,a),l===null)return null;Go.copy(a),Go.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Go);return c<t.near||c>t.far?null:{distance:c,point:Go.clone(),object:n}}function $o(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,Bo),n.getVertexPosition(l,Vo),n.getVertexPosition(c,zo);const u=G3(n,e,t,i,Bo,Vo,zo,zf);if(u){const f=new se;Hn.getBarycoord(zf,Bo,Vo,zo,f),s&&(u.uv=Hn.getInterpolatedAttribute(s,a,l,c,f,new vt)),r&&(u.uv1=Hn.getInterpolatedAttribute(r,a,l,c,f,new vt)),o&&(u.normal=Hn.getInterpolatedAttribute(o,a,l,c,f,new se),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new se,materialIndex:0};Hn.getNormal(Bo,Vo,zo,h.normal),u.face=h,u.barycoord=f}return u}class po extends Cn{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],f=[];let h=0,g=0;_("z","y","x",-1,-1,i,t,e,o,r,0),_("z","y","x",1,-1,i,t,-e,o,r,1),_("x","z","y",1,1,e,i,t,s,o,2),_("x","z","y",1,-1,e,i,-t,s,o,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new an(c,3)),this.setAttribute("normal",new an(u,3)),this.setAttribute("uv",new an(f,2));function _(v,m,p,b,y,M,w,A,T,R,x){const E=M/T,U=w/R,O=M/2,j=w/2,ee=A/2,te=T+1,K=R+1;let I=0,F=0;const $=new se;for(let J=0;J<K;J++){const oe=J*U-j;for(let we=0;we<te;we++){const De=we*E-O;$[v]=De*b,$[m]=oe*y,$[p]=ee,c.push($.x,$.y,$.z),$[v]=0,$[m]=0,$[p]=A>0?1:-1,u.push($.x,$.y,$.z),f.push(we/T),f.push(1-J/R),I+=1}}for(let J=0;J<R;J++)for(let oe=0;oe<T;oe++){const we=h+oe+te*J,De=h+oe+te*(J+1),rt=h+(oe+1)+te*(J+1),lt=h+(oe+1)+te*J;l.push(we,De,lt),l.push(De,rt,lt),F+=6}a.addGroup(g,F,x),g+=F,h+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new po(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function hr(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Ze("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function un(n){const e={};for(let t=0;t<n.length;t++){const i=hr(n[t]);for(const s in i)e[s]=i[s]}return e}function $3(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Im(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ht.workingColorSpace}const W3={clone:hr,merge:un};var X3=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,q3=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class hi extends gr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=X3,this.fragmentShader=q3,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=hr(e.uniforms),this.uniformsGroups=$3(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Dm extends Jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ut,this.projectionMatrix=new Ut,this.projectionMatrixInverse=new Ut,this.coordinateSystem=ri,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const $i=new se,Hf=new vt,Gf=new vt;class Ln extends Dm{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ru*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ml*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ru*2*Math.atan(Math.tan(ml*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){$i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($i.x,$i.y).multiplyScalar(-e/$i.z),$i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set($i.x,$i.y).multiplyScalar(-e/$i.z)}getViewSize(e,t){return this.getViewBounds(e,Hf,Gf),t.subVectors(Gf,Hf)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ml*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const $s=-90,Ws=1;class j3 extends Jt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ln($s,Ws,e,t);s.layers=this.layers,this.add(s);const r=new Ln($s,Ws,e,t);r.layers=this.layers,this.add(r);const o=new Ln($s,Ws,e,t);o.layers=this.layers,this.add(o);const a=new Ln($s,Ws,e,t);a.layers=this.layers,this.add(a);const l=new Ln($s,Ws,e,t);l.layers=this.layers,this.add(l);const c=new Ln($s,Ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===ri)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Sa)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(f,h,g),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Lm extends pn{constructor(e=[],t=Cs,i,s,r,o,a,l,c,u){super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Nm extends li{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Lm(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new po(5,5,5),r=new hi({name:"CubemapFromEquirect",uniforms:hr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_n,blending:Ri});r.uniforms.tEquirect.value=t;const o=new wn(s,r),a=t.minFilter;return t.minFilter===bs&&(t.minFilter=on),new j3(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class Nr extends Jt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Y3={type:"move"};class kl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new se,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new se),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new se,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new se),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),g=.02,_=.005;c.inputState.pinching&&h>g+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=g-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Y3)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Nr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class Gu{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new dt(e),this.near=t,this.far=i}clone(){return new Gu(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class K3 extends Jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fi,this.environmentIntensity=1,this.environmentRotation=new fi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Z3 extends pn{constructor(e=null,t=1,i=1,s,r,o,a,l,c=Zt,u=Zt,f,h){super(null,o,a,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ol=new se,J3=new se,Q3=new it;class vs{constructor(e=new se(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Ol.subVectors(i,t).cross(J3.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Ol),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Q3.getNormalMatrix(e),s=this.coplanarPoint(Ol).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fs=new Wa,eP=new vt(.5,.5),Wo=new se;class $u{constructor(e=new vs,t=new vs,i=new vs,s=new vs,r=new vs,o=new vs){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ri,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],g=r[7],_=r[8],v=r[9],m=r[10],p=r[11],b=r[12],y=r[13],M=r[14],w=r[15];if(s[0].setComponents(c-o,g-u,p-_,w-b).normalize(),s[1].setComponents(c+o,g+u,p+_,w+b).normalize(),s[2].setComponents(c+a,g+f,p+v,w+y).normalize(),s[3].setComponents(c-a,g-f,p-v,w-y).normalize(),i)s[4].setComponents(l,h,m,M).normalize(),s[5].setComponents(c-l,g-h,p-m,w-M).normalize();else if(s[4].setComponents(c-l,g-h,p-m,w-M).normalize(),t===ri)s[5].setComponents(c+l,g+h,p+m,w+M).normalize();else if(t===Sa)s[5].setComponents(l,h,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(e){fs.center.set(0,0,0);const t=eP.distanceTo(e.center);return fs.radius=.7071067811865476+t,fs.applyMatrix4(e.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Wo.x=s.normal.x>0?e.max.x:e.min.x,Wo.y=s.normal.y>0?e.max.y:e.min.y,Wo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Wo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Um extends gr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ma=new se,Ea=new se,$f=new Ut,Rr=new wm,Xo=new Wa,Bl=new se,Wf=new se;class tP extends Jt{constructor(e=new Cn,t=new Um){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Ma.fromBufferAttribute(t,s-1),Ea.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Ma.distanceTo(Ea);e.setAttribute("lineDistance",new an(i,1))}else Ze("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Xo.copy(i.boundingSphere),Xo.applyMatrix4(s),Xo.radius+=r,e.ray.intersectsSphere(Xo)===!1)return;$f.copy(s).invert(),Rr.copy(e.ray).applyMatrix4($f);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const g=Math.max(0,o.start),_=Math.min(u.count,o.start+o.count);for(let v=g,m=_-1;v<m;v+=c){const p=u.getX(v),b=u.getX(v+1),y=qo(this,e,Rr,l,p,b,v);y&&t.push(y)}if(this.isLineLoop){const v=u.getX(_-1),m=u.getX(g),p=qo(this,e,Rr,l,v,m,_-1);p&&t.push(p)}}else{const g=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let v=g,m=_-1;v<m;v+=c){const p=qo(this,e,Rr,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=qo(this,e,Rr,l,_-1,g,_-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function qo(n,e,t,i,s,r,o){const a=n.geometry.attributes.position;if(Ma.fromBufferAttribute(a,s),Ea.fromBufferAttribute(a,r),t.distanceSqToSegment(Ma,Ea,Bl,Wf)>i)return;Bl.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Bl);if(!(c<e.near||c>e.far))return{distance:c,point:Wf.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}class io extends pn{constructor(e,t,i=di,s,r,o,a=Zt,l=Zt,c,u=Ui,f=1){if(u!==Ui&&u!==Ms)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:f};super(h,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Hu(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class nP extends io{constructor(e,t=di,i=Cs,s,r,o=Zt,a=Zt,l,c=Ui){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Fm extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Wu extends Cn{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],f=[],h=[],g=[];let _=0;const v=[],m=i/2;let p=0;b(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new an(f,3)),this.setAttribute("normal",new an(h,3)),this.setAttribute("uv",new an(g,2));function b(){const M=new se,w=new se;let A=0;const T=(t-e)/i;for(let R=0;R<=r;R++){const x=[],E=R/r,U=E*(t-e)+e;for(let O=0;O<=s;O++){const j=O/s,ee=j*l+a,te=Math.sin(ee),K=Math.cos(ee);w.x=U*te,w.y=-E*i+m,w.z=U*K,f.push(w.x,w.y,w.z),M.set(te,T,K).normalize(),h.push(M.x,M.y,M.z),g.push(j,1-E),x.push(_++)}v.push(x)}for(let R=0;R<s;R++)for(let x=0;x<r;x++){const E=v[x][R],U=v[x+1][R],O=v[x+1][R+1],j=v[x][R+1];(e>0||x!==0)&&(u.push(E,U,j),A+=3),(t>0||x!==r-1)&&(u.push(U,O,j),A+=3)}c.addGroup(p,A,0),p+=A}function y(M){const w=_,A=new vt,T=new se;let R=0;const x=M===!0?e:t,E=M===!0?1:-1;for(let O=1;O<=s;O++)f.push(0,m*E,0),h.push(0,E,0),g.push(.5,.5),_++;const U=_;for(let O=0;O<=s;O++){const ee=O/s*l+a,te=Math.cos(ee),K=Math.sin(ee);T.x=x*K,T.y=m*E,T.z=x*te,f.push(T.x,T.y,T.z),h.push(0,E,0),A.x=te*.5+.5,A.y=K*.5*E+.5,g.push(A.x,A.y),_++}for(let O=0;O<s;O++){const j=w+O,ee=U+O;M===!0?u.push(ee,ee+1,j):u.push(ee+1,ee,j),R+=3}c.addGroup(p,R,M===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wu(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class wa extends Wu{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new wa(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class mo extends Cn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,f=e/a,h=t/l,g=[],_=[],v=[],m=[];for(let p=0;p<u;p++){const b=p*h-o;for(let y=0;y<c;y++){const M=y*f-r;_.push(M,-b,0),v.push(0,0,1),m.push(y/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){const y=b+c*p,M=b+c*(p+1),w=b+1+c*(p+1),A=b+1+c*p;g.push(y,M,A),g.push(M,w,A)}this.setIndex(g),this.setAttribute("position",new an(_,3)),this.setAttribute("normal",new an(v,3)),this.setAttribute("uv",new an(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mo(e.width,e.height,e.widthSegments,e.heightSegments)}}class Xu extends Cn{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],u=new se,f=new se,h=new se;for(let g=0;g<=i;g++)for(let _=0;_<=s;_++){const v=_/s*r,m=g/i*Math.PI*2;f.x=(e+t*Math.cos(m))*Math.cos(v),f.y=(e+t*Math.cos(m))*Math.sin(v),f.z=t*Math.sin(m),a.push(f.x,f.y,f.z),u.x=e*Math.cos(v),u.y=e*Math.sin(v),h.subVectors(f,u).normalize(),l.push(h.x,h.y,h.z),c.push(_/s),c.push(g/i)}for(let g=1;g<=i;g++)for(let _=1;_<=s;_++){const v=(s+1)*g+_-1,m=(s+1)*(g-1)+_-1,p=(s+1)*(g-1)+_,b=(s+1)*g+_;o.push(v,m,b),o.push(m,p,b)}this.setIndex(o),this.setAttribute("position",new an(a,3)),this.setAttribute("normal",new an(l,3)),this.setAttribute("uv",new an(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xu(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class iP extends hi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Vl extends gr{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new dt(16777215),this.specular=new dt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bm,this.normalScale=new vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=Lu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class sP extends gr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=g3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class rP extends gr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class km extends Jt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new dt(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const zl=new Ut,Xf=new se,qf=new se;class oP{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new vt(512,512),this.mapType=Mn,this.map=null,this.mapPass=null,this.matrix=new Ut,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $u,this._frameExtents=new vt(1,1),this._viewportCount=1,this._viewports=[new Vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Xf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Xf),qf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(qf),t.updateMatrixWorld(),zl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(zl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(zl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class qu extends Dm{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class aP extends oP{constructor(){super(new qu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class lP extends km{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Jt.DEFAULT_UP),this.updateMatrix(),this.target=new Jt,this.shadow=new aP}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class cP extends km{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class uP extends Ln{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function jf(n,e,t,i){const s=dP(i);switch(t){case xm:return n*e;case Sm:return n*e/s.components*s.byteLength;case ku:return n*e/s.components*s.byteLength;case dr:return n*e*2/s.components*s.byteLength;case Ou:return n*e*2/s.components*s.byteLength;case ym:return n*e*3/s.components*s.byteLength;case Gn:return n*e*4/s.components*s.byteLength;case Bu:return n*e*4/s.components*s.byteLength;case ra:case oa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case aa:case la:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Cc:case Pc:return Math.max(n,16)*Math.max(e,8)/4;case Ac:case Rc:return Math.max(n,8)*Math.max(e,8)/2;case Ic:case Dc:case Nc:case Uc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Lc:case Fc:case kc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Oc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Bc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Vc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case zc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Hc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Gc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case $c:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Wc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Xc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case qc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case jc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Yc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Kc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Zc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Jc:case Qc:case eu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case tu:case nu:return Math.ceil(n/4)*Math.ceil(e/4)*8;case iu:case su:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function dP(n){switch(n){case Mn:case mm:return{byteLength:1,components:1};case eo:case gm:case Ni:return{byteLength:2,components:1};case Uu:case Fu:return{byteLength:2,components:4};case di:case Nu:case si:return{byteLength:4,components:1};case vm:case _m:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Du}}));typeof window<"u"&&(window.__THREE__?Ze("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Du);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Om(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function fP(n){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,f=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),a.onUploadCallback();let g;if(c instanceof Float32Array)g=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)g=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?g=n.HALF_FLOAT:g=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)g=n.SHORT;else if(c instanceof Uint32Array)g=n.UNSIGNED_INT;else if(c instanceof Int32Array)g=n.INT;else if(c instanceof Int8Array)g=n.BYTE;else if(c instanceof Uint8Array)g=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)g=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:g,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,c){const u=l.array,f=l.updateRanges;if(n.bindBuffer(c,a),f.length===0)n.bufferSubData(c,0,u);else{f.sort((g,_)=>g.start-_.start);let h=0;for(let g=1;g<f.length;g++){const _=f[h],v=f[g];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,f[h]=v)}f.length=h+1;for(let g=0,_=f.length;g<_;g++){const v=f[g];n.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var hP=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pP=`#ifdef USE_ALPHAHASH
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
#endif`,mP=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gP=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vP=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_P=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xP=`#ifdef USE_AOMAP
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
#endif`,yP=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,SP=`#ifdef USE_BATCHING
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
#endif`,bP=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,MP=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,EP=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wP=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,TP=`#ifdef USE_IRIDESCENCE
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
#endif`,AP=`#ifdef USE_BUMPMAP
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
#endif`,CP=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,RP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,PP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,IP=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,DP=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,LP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,NP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,UP=`#if defined( USE_COLOR_ALPHA )
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
#endif`,FP=`#define PI 3.141592653589793
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
} // validated`,kP=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,OP=`vec3 transformedNormal = objectNormal;
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
#endif`,BP=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,VP=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,zP=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,HP=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,GP="gl_FragColor = linearToOutputTexel( gl_FragColor );",$P=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,WP=`#ifdef USE_ENVMAP
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
#endif`,XP=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,qP=`#ifdef USE_ENVMAP
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
#endif`,jP=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,YP=`#ifdef USE_ENVMAP
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
#endif`,KP=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ZP=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,JP=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,QP=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,e2=`#ifdef USE_GRADIENTMAP
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
}`,t2=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,n2=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,i2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,s2=`uniform bool receiveShadow;
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
#endif`,r2=`#ifdef USE_ENVMAP
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
#endif`,o2=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,a2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,l2=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,c2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,u2=`PhysicalMaterial material;
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
#endif`,d2=`uniform sampler2D dfgLUT;
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
}`,f2=`
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
#endif`,h2=`#if defined( RE_IndirectDiffuse )
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
#endif`,p2=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,m2=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,g2=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,v2=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_2=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,x2=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,y2=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,S2=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,b2=`#if defined( USE_POINTS_UV )
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
#endif`,M2=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,E2=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,w2=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,T2=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,A2=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,C2=`#ifdef USE_MORPHTARGETS
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
#endif`,R2=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,P2=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,I2=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,L2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,N2=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,U2=`#ifdef USE_NORMALMAP
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
#endif`,F2=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,k2=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,O2=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,B2=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,V2=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,z2=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,H2=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,G2=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$2=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,W2=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,X2=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,q2=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,j2=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Y2=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,K2=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Z2=`float getShadowMask() {
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
}`,J2=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Q2=`#ifdef USE_SKINNING
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
#endif`,eI=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tI=`#ifdef USE_SKINNING
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
#endif`,nI=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iI=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,sI=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,rI=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,oI=`#ifdef USE_TRANSMISSION
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
#endif`,aI=`#ifdef USE_TRANSMISSION
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
#endif`,lI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dI=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const fI=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hI=`uniform sampler2D t2D;
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
}`,pI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mI=`#ifdef ENVMAP_TYPE_CUBE
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
}`,gI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vI=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_I=`#include <common>
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
}`,xI=`#if DEPTH_PACKING == 3200
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
}`,yI=`#define DISTANCE
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
}`,SI=`#define DISTANCE
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
}`,bI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,MI=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,EI=`uniform float scale;
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
}`,wI=`uniform vec3 diffuse;
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
}`,TI=`#include <common>
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
}`,AI=`uniform vec3 diffuse;
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
}`,CI=`#define LAMBERT
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
}`,RI=`#define LAMBERT
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
}`,PI=`#define MATCAP
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
}`,II=`#define MATCAP
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
}`,DI=`#define NORMAL
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
}`,LI=`#define NORMAL
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
}`,NI=`#define PHONG
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
}`,UI=`#define PHONG
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
}`,FI=`#define STANDARD
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
}`,kI=`#define STANDARD
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
}`,OI=`#define TOON
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
}`,BI=`#define TOON
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
}`,VI=`uniform float size;
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
}`,zI=`uniform vec3 diffuse;
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
}`,HI=`#include <common>
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
}`,GI=`uniform vec3 color;
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
}`,$I=`uniform float rotation;
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
}`,WI=`uniform vec3 diffuse;
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
}`,st={alphahash_fragment:hP,alphahash_pars_fragment:pP,alphamap_fragment:mP,alphamap_pars_fragment:gP,alphatest_fragment:vP,alphatest_pars_fragment:_P,aomap_fragment:xP,aomap_pars_fragment:yP,batching_pars_vertex:SP,batching_vertex:bP,begin_vertex:MP,beginnormal_vertex:EP,bsdfs:wP,iridescence_fragment:TP,bumpmap_pars_fragment:AP,clipping_planes_fragment:CP,clipping_planes_pars_fragment:RP,clipping_planes_pars_vertex:PP,clipping_planes_vertex:IP,color_fragment:DP,color_pars_fragment:LP,color_pars_vertex:NP,color_vertex:UP,common:FP,cube_uv_reflection_fragment:kP,defaultnormal_vertex:OP,displacementmap_pars_vertex:BP,displacementmap_vertex:VP,emissivemap_fragment:zP,emissivemap_pars_fragment:HP,colorspace_fragment:GP,colorspace_pars_fragment:$P,envmap_fragment:WP,envmap_common_pars_fragment:XP,envmap_pars_fragment:qP,envmap_pars_vertex:jP,envmap_physical_pars_fragment:r2,envmap_vertex:YP,fog_vertex:KP,fog_pars_vertex:ZP,fog_fragment:JP,fog_pars_fragment:QP,gradientmap_pars_fragment:e2,lightmap_pars_fragment:t2,lights_lambert_fragment:n2,lights_lambert_pars_fragment:i2,lights_pars_begin:s2,lights_toon_fragment:o2,lights_toon_pars_fragment:a2,lights_phong_fragment:l2,lights_phong_pars_fragment:c2,lights_physical_fragment:u2,lights_physical_pars_fragment:d2,lights_fragment_begin:f2,lights_fragment_maps:h2,lights_fragment_end:p2,logdepthbuf_fragment:m2,logdepthbuf_pars_fragment:g2,logdepthbuf_pars_vertex:v2,logdepthbuf_vertex:_2,map_fragment:x2,map_pars_fragment:y2,map_particle_fragment:S2,map_particle_pars_fragment:b2,metalnessmap_fragment:M2,metalnessmap_pars_fragment:E2,morphinstance_vertex:w2,morphcolor_vertex:T2,morphnormal_vertex:A2,morphtarget_pars_vertex:C2,morphtarget_vertex:R2,normal_fragment_begin:P2,normal_fragment_maps:I2,normal_pars_fragment:D2,normal_pars_vertex:L2,normal_vertex:N2,normalmap_pars_fragment:U2,clearcoat_normal_fragment_begin:F2,clearcoat_normal_fragment_maps:k2,clearcoat_pars_fragment:O2,iridescence_pars_fragment:B2,opaque_fragment:V2,packing:z2,premultiplied_alpha_fragment:H2,project_vertex:G2,dithering_fragment:$2,dithering_pars_fragment:W2,roughnessmap_fragment:X2,roughnessmap_pars_fragment:q2,shadowmap_pars_fragment:j2,shadowmap_pars_vertex:Y2,shadowmap_vertex:K2,shadowmask_pars_fragment:Z2,skinbase_vertex:J2,skinning_pars_vertex:Q2,skinning_vertex:eI,skinnormal_vertex:tI,specularmap_fragment:nI,specularmap_pars_fragment:iI,tonemapping_fragment:sI,tonemapping_pars_fragment:rI,transmission_fragment:oI,transmission_pars_fragment:aI,uv_pars_fragment:lI,uv_pars_vertex:cI,uv_vertex:uI,worldpos_vertex:dI,background_vert:fI,background_frag:hI,backgroundCube_vert:pI,backgroundCube_frag:mI,cube_vert:gI,cube_frag:vI,depth_vert:_I,depth_frag:xI,distance_vert:yI,distance_frag:SI,equirect_vert:bI,equirect_frag:MI,linedashed_vert:EI,linedashed_frag:wI,meshbasic_vert:TI,meshbasic_frag:AI,meshlambert_vert:CI,meshlambert_frag:RI,meshmatcap_vert:PI,meshmatcap_frag:II,meshnormal_vert:DI,meshnormal_frag:LI,meshphong_vert:NI,meshphong_frag:UI,meshphysical_vert:FI,meshphysical_frag:kI,meshtoon_vert:OI,meshtoon_frag:BI,points_vert:VI,points_frag:zI,shadow_vert:HI,shadow_frag:GI,sprite_vert:$I,sprite_frag:WI},Ie={common:{diffuse:{value:new dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new it}},envmap:{envMap:{value:null},envMapRotation:{value:new it},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new it}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new it}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new it},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new it},normalScale:{value:new vt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new it},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new it}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new it}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new it}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0},uvTransform:{value:new it}},sprite:{diffuse:{value:new dt(16777215)},opacity:{value:1},center:{value:new vt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}}},ni={basic:{uniforms:un([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:st.meshbasic_vert,fragmentShader:st.meshbasic_frag},lambert:{uniforms:un([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new dt(0)}}]),vertexShader:st.meshlambert_vert,fragmentShader:st.meshlambert_frag},phong:{uniforms:un([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new dt(0)},specular:{value:new dt(1118481)},shininess:{value:30}}]),vertexShader:st.meshphong_vert,fragmentShader:st.meshphong_frag},standard:{uniforms:un([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag},toon:{uniforms:un([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new dt(0)}}]),vertexShader:st.meshtoon_vert,fragmentShader:st.meshtoon_frag},matcap:{uniforms:un([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:st.meshmatcap_vert,fragmentShader:st.meshmatcap_frag},points:{uniforms:un([Ie.points,Ie.fog]),vertexShader:st.points_vert,fragmentShader:st.points_frag},dashed:{uniforms:un([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:st.linedashed_vert,fragmentShader:st.linedashed_frag},depth:{uniforms:un([Ie.common,Ie.displacementmap]),vertexShader:st.depth_vert,fragmentShader:st.depth_frag},normal:{uniforms:un([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:st.meshnormal_vert,fragmentShader:st.meshnormal_frag},sprite:{uniforms:un([Ie.sprite,Ie.fog]),vertexShader:st.sprite_vert,fragmentShader:st.sprite_frag},background:{uniforms:{uvTransform:{value:new it},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:st.background_vert,fragmentShader:st.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new it}},vertexShader:st.backgroundCube_vert,fragmentShader:st.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:st.cube_vert,fragmentShader:st.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:st.equirect_vert,fragmentShader:st.equirect_frag},distance:{uniforms:un([Ie.common,Ie.displacementmap,{referencePosition:{value:new se},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:st.distance_vert,fragmentShader:st.distance_frag},shadow:{uniforms:un([Ie.lights,Ie.fog,{color:{value:new dt(0)},opacity:{value:1}}]),vertexShader:st.shadow_vert,fragmentShader:st.shadow_frag}};ni.physical={uniforms:un([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new it},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new it},clearcoatNormalScale:{value:new vt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new it},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new it},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new it},sheen:{value:0},sheenColor:{value:new dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new it},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new it},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new it},transmissionSamplerSize:{value:new vt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new it},attenuationDistance:{value:0},attenuationColor:{value:new dt(0)},specularColor:{value:new dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new it},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new it},anisotropyVector:{value:new vt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new it}}]),vertexShader:st.meshphysical_vert,fragmentShader:st.meshphysical_frag};const jo={r:0,b:0,g:0},hs=new fi,XI=new Ut;function qI(n,e,t,i,s,r,o){const a=new dt(0);let l=r===!0?0:1,c,u,f=null,h=0,g=null;function _(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?t:e).get(M)),M}function v(y){let M=!1;const w=_(y);w===null?p(a,l):w&&w.isColor&&(p(w,1),M=!0);const A=n.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(y,M){const w=_(M);w&&(w.isCubeTexture||w.mapping===$a)?(u===void 0&&(u=new wn(new po(1,1,1),new hi({name:"BackgroundCubeMaterial",uniforms:hr(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(A,T,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),hs.copy(M.backgroundRotation),hs.x*=-1,hs.y*=-1,hs.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),u.material.uniforms.envMap.value=w,u.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(XI.makeRotationFromEuler(hs)),u.material.toneMapped=ht.getTransfer(w.colorSpace)!==Mt,(f!==w||h!==w.version||g!==n.toneMapping)&&(u.material.needsUpdate=!0,f=w,h=w.version,g=n.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new wn(new mo(2,2),new hi({name:"BackgroundMaterial",uniforms:hr(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:ts,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=ht.getTransfer(w.colorSpace)!==Mt,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(f!==w||h!==w.version||g!==n.toneMapping)&&(c.material.needsUpdate=!0,f=w,h=w.version,g=n.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,M){y.getRGB(jo,Im(n)),i.buffers.color.setClear(jo.r,jo.g,jo.b,M,o)}function b(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),l=M,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:v,addToRenderList:m,dispose:b}}function jI(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,o=!1;function a(E,U,O,j,ee){let te=!1;const K=f(j,O,U);r!==K&&(r=K,c(r.object)),te=g(E,j,O,ee),te&&_(E,j,O,ee),ee!==null&&e.update(ee,n.ELEMENT_ARRAY_BUFFER),(te||o)&&(o=!1,M(E,U,O,j),ee!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(ee).buffer))}function l(){return n.createVertexArray()}function c(E){return n.bindVertexArray(E)}function u(E){return n.deleteVertexArray(E)}function f(E,U,O){const j=O.wireframe===!0;let ee=i[E.id];ee===void 0&&(ee={},i[E.id]=ee);let te=ee[U.id];te===void 0&&(te={},ee[U.id]=te);let K=te[j];return K===void 0&&(K=h(l()),te[j]=K),K}function h(E){const U=[],O=[],j=[];for(let ee=0;ee<t;ee++)U[ee]=0,O[ee]=0,j[ee]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:O,attributeDivisors:j,object:E,attributes:{},index:null}}function g(E,U,O,j){const ee=r.attributes,te=U.attributes;let K=0;const I=O.getAttributes();for(const F in I)if(I[F].location>=0){const J=ee[F];let oe=te[F];if(oe===void 0&&(F==="instanceMatrix"&&E.instanceMatrix&&(oe=E.instanceMatrix),F==="instanceColor"&&E.instanceColor&&(oe=E.instanceColor)),J===void 0||J.attribute!==oe||oe&&J.data!==oe.data)return!0;K++}return r.attributesNum!==K||r.index!==j}function _(E,U,O,j){const ee={},te=U.attributes;let K=0;const I=O.getAttributes();for(const F in I)if(I[F].location>=0){let J=te[F];J===void 0&&(F==="instanceMatrix"&&E.instanceMatrix&&(J=E.instanceMatrix),F==="instanceColor"&&E.instanceColor&&(J=E.instanceColor));const oe={};oe.attribute=J,J&&J.data&&(oe.data=J.data),ee[F]=oe,K++}r.attributes=ee,r.attributesNum=K,r.index=j}function v(){const E=r.newAttributes;for(let U=0,O=E.length;U<O;U++)E[U]=0}function m(E){p(E,0)}function p(E,U){const O=r.newAttributes,j=r.enabledAttributes,ee=r.attributeDivisors;O[E]=1,j[E]===0&&(n.enableVertexAttribArray(E),j[E]=1),ee[E]!==U&&(n.vertexAttribDivisor(E,U),ee[E]=U)}function b(){const E=r.newAttributes,U=r.enabledAttributes;for(let O=0,j=U.length;O<j;O++)U[O]!==E[O]&&(n.disableVertexAttribArray(O),U[O]=0)}function y(E,U,O,j,ee,te,K){K===!0?n.vertexAttribIPointer(E,U,O,ee,te):n.vertexAttribPointer(E,U,O,j,ee,te)}function M(E,U,O,j){v();const ee=j.attributes,te=O.getAttributes(),K=U.defaultAttributeValues;for(const I in te){const F=te[I];if(F.location>=0){let $=ee[I];if($===void 0&&(I==="instanceMatrix"&&E.instanceMatrix&&($=E.instanceMatrix),I==="instanceColor"&&E.instanceColor&&($=E.instanceColor)),$!==void 0){const J=$.normalized,oe=$.itemSize,we=e.get($);if(we===void 0)continue;const De=we.buffer,rt=we.type,lt=we.bytesPerElement,de=rt===n.INT||rt===n.UNSIGNED_INT||$.gpuType===Nu;if($.isInterleavedBufferAttribute){const X=$.data,ce=X.stride,me=$.offset;if(X.isInstancedInterleavedBuffer){for(let he=0;he<F.locationSize;he++)p(F.location+he,X.meshPerAttribute);E.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let he=0;he<F.locationSize;he++)m(F.location+he);n.bindBuffer(n.ARRAY_BUFFER,De);for(let he=0;he<F.locationSize;he++)y(F.location+he,oe/F.locationSize,rt,J,ce*lt,(me+oe/F.locationSize*he)*lt,de)}else{if($.isInstancedBufferAttribute){for(let X=0;X<F.locationSize;X++)p(F.location+X,$.meshPerAttribute);E.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let X=0;X<F.locationSize;X++)m(F.location+X);n.bindBuffer(n.ARRAY_BUFFER,De);for(let X=0;X<F.locationSize;X++)y(F.location+X,oe/F.locationSize,rt,J,oe*lt,oe/F.locationSize*X*lt,de)}}else if(K!==void 0){const J=K[I];if(J!==void 0)switch(J.length){case 2:n.vertexAttrib2fv(F.location,J);break;case 3:n.vertexAttrib3fv(F.location,J);break;case 4:n.vertexAttrib4fv(F.location,J);break;default:n.vertexAttrib1fv(F.location,J)}}}}b()}function w(){R();for(const E in i){const U=i[E];for(const O in U){const j=U[O];for(const ee in j)u(j[ee].object),delete j[ee];delete U[O]}delete i[E]}}function A(E){if(i[E.id]===void 0)return;const U=i[E.id];for(const O in U){const j=U[O];for(const ee in j)u(j[ee].object),delete j[ee];delete U[O]}delete i[E.id]}function T(E){for(const U in i){const O=i[U];if(O[E.id]===void 0)continue;const j=O[E.id];for(const ee in j)u(j[ee].object),delete j[ee];delete O[E.id]}}function R(){x(),o=!0,r!==s&&(r=s,c(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:x,dispose:w,releaseStatesOfGeometry:A,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:m,disableUnusedAttributes:b}}function YI(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,f){f!==0&&(n.drawArraysInstanced(i,c,u,f),t.update(u,i,f))}function a(c,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,f);let g=0;for(let _=0;_<f;_++)g+=u[_];t.update(g,i,1)}function l(c,u,f,h){if(f===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let _=0;_<c.length;_++)o(c[_],u[_],h[_]);else{g.multiDrawArraysInstancedWEBGL(i,c,0,u,0,h,0,f);let _=0;for(let v=0;v<f;v++)_+=u[v]*h[v];t.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function KI(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const T=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(T){return!(T!==Gn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){const R=T===Ni&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==Mn&&i.convert(T)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==si&&!R)}function l(T){if(T==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Ze("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),g=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),b=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),w=n.getParameter(n.MAX_SAMPLES),A=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:g,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:y,maxFragmentUniforms:M,maxSamples:w,samples:A}}function ZI(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new vs,a=new it,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const g=f.length!==0||h||i!==0||s;return s=h,i=f.length,g},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,g){const _=f.clippingPlanes,v=f.clipIntersection,m=f.clipShadows,p=n.get(f);if(!s||_===null||_.length===0||r&&!m)r?u(null):c();else{const b=r?0:i,y=b*4;let M=p.clippingState||null;l.value=M,M=u(_,h,y,g);for(let w=0;w!==y;++w)M[w]=t[w];p.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(f,h,g,_){const v=f!==null?f.length:0;let m=null;if(v!==0){if(m=l.value,_!==!0||m===null){const p=g+v*4,b=h.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,M=g;y!==v;++y,M+=4)o.copy(f[y]).applyMatrix4(b,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function JI(n){let e=new WeakMap;function t(o,a){return a===Mc?o.mapping=Cs:a===Ec&&(o.mapping=ur),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Mc||a===Ec)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Nm(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const Ji=4,Yf=[.125,.215,.35,.446,.526,.582],ys=20,QI=256,Pr=new qu,Kf=new dt;let Hl=null,Gl=0,$l=0,Wl=!1;const eD=new se;class Zf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:a=eD}=r;Hl=this._renderer.getRenderTarget(),Gl=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=eh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Hl,Gl,$l),this._renderer.xr.enabled=Wl,e.scissorTest=!1,Xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Cs||e.mapping===ur?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Hl=this._renderer.getRenderTarget(),Gl=this._renderer.getActiveCubeFace(),$l=this._renderer.getActiveMipmapLevel(),Wl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:on,minFilter:on,generateMipmaps:!1,type:Ni,format:Gn,colorSpace:fr,depthBuffer:!1},s=Jf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jf(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=tD(r)),this._blurMaterial=iD(r,e,t),this._ggxMaterial=nD(r,e,t)}return s}_compileMaterial(e){const t=new wn(new Cn,e);this._renderer.compile(t,Pr)}_sceneToCubeUV(e,t,i,s,r){const l=new Ln(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,g=f.toneMapping;f.getClearColor(Kf),f.toneMapping=ai,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wn(new po,new Cm({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const b=e.background;b?b.isColor&&(m.color.copy(b),e.background=null,p=!0):(m.color.copy(Kf),p=!0);for(let y=0;y<6;y++){const M=y%3;M===0?(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[y],r.y,r.z)):M===1?(l.up.set(0,0,c[y]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[y],r.z)):(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[y]));const w=this._cubeSize;Xs(s,M*w,y>2?w:0,w,w),f.setRenderTarget(s),p&&f.render(v,l),f.render(e,l)}f.toneMapping=g,f.autoClear=h,e.background=b}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Cs||e.mapping===ur;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=eh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qf());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Xs(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Pr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const l=o.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=0+c*1.25,g=f*h,{_lodMax:_}=this,v=this._sizeLods[i],m=3*v*(i>_-Ji?i-_+Ji:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=g,l.mipInt.value=_-t,Xs(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(a,Pr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-i,Xs(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(a,Pr)}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&gt("blur direction must be either latitudinal or longitudinal!");const u=3,f=this._lodMeshes[s];f.material=c;const h=c.uniforms,g=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*g):2*Math.PI/(2*ys-1),v=r/_,m=isFinite(r)?1+Math.floor(u*v):ys;m>ys&&Ze(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ys}`);const p=[];let b=0;for(let T=0;T<ys;++T){const R=T/v,x=Math.exp(-R*R/2);p.push(x),T===0?b+=x:T<m&&(b+=2*x)}for(let T=0;T<p.length;T++)p[T]=p[T]/b;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:y}=this;h.dTheta.value=_,h.mipInt.value=y-i;const M=this._sizeLods[s],w=3*M*(s>y-Ji?s-y+Ji:0),A=4*(this._cubeSize-M);Xs(t,w,A,3*M,2*M),l.setRenderTarget(t),l.render(f,Pr)}}function tD(n){const e=[],t=[],i=[];let s=n;const r=n-Ji+1+Yf.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>n-Ji?l=Yf[o-n+Ji-1]:o===0&&(l=0),t.push(l);const c=1/(a-2),u=-c,f=1+c,h=[u,u,f,u,f,f,u,u,f,f,u,f],g=6,_=6,v=3,m=2,p=1,b=new Float32Array(v*_*g),y=new Float32Array(m*_*g),M=new Float32Array(p*_*g);for(let A=0;A<g;A++){const T=A%3*2/3-1,R=A>2?0:-1,x=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];b.set(x,v*_*A),y.set(h,m*_*A);const E=[A,A,A,A,A,A];M.set(E,p*_*A)}const w=new Cn;w.setAttribute("position",new ci(b,v)),w.setAttribute("uv",new ci(y,m)),w.setAttribute("faceIndex",new ci(M,p)),i.push(new wn(w,null)),s>Ji&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Jf(n,e,t){const i=new li(n,e,t);return i.texture.mapping=$a,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xs(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function nD(n,e,t){return new hi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:QI,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Xa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function iD(n,e,t){const i=new Float32Array(ys),s=new se(0,1,0);return new hi({name:"SphericalGaussianBlur",defines:{n:ys,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Xa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Qf(){return new hi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function eh(){return new hi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function Xa(){return`

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
	`}function sD(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Mc||l===Ec,u=l===Cs||l===ur;if(c||u){let f=e.get(a);const h=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Zf(n)),f=c?t.fromEquirectangular(a,f):t.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),f.texture;if(f!==void 0)return f.texture;{const g=a.image;return c&&g&&g.height>0||u&&g&&s(g)?(t===null&&(t=new Zf(n)),f=c?t.fromEquirectangular(a):t.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function rD(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&no("WebGLRenderer: "+i+" extension not supported."),s}}}function oD(n,e,t,i){const s={},r=new WeakMap;function o(f){const h=f.target;h.index!==null&&e.remove(h.index);for(const _ in h.attributes)e.remove(h.attributes[_]);h.removeEventListener("dispose",o),delete s[h.id];const g=r.get(h);g&&(e.remove(g),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(f,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(f){const h=f.attributes;for(const g in h)e.update(h[g],n.ARRAY_BUFFER)}function c(f){const h=[],g=f.index,_=f.attributes.position;let v=0;if(g!==null){const b=g.array;v=g.version;for(let y=0,M=b.length;y<M;y+=3){const w=b[y+0],A=b[y+1],T=b[y+2];h.push(w,A,A,T,T,w)}}else if(_!==void 0){const b=_.array;v=_.version;for(let y=0,M=b.length/3-1;y<M;y+=3){const w=y+0,A=y+1,T=y+2;h.push(w,A,A,T,T,w)}}else return;const m=new(Mm(h)?Pm:Rm)(h,1);m.version=v;const p=r.get(f);p&&e.remove(p),r.set(f,m)}function u(f){const h=r.get(f);if(h){const g=f.index;g!==null&&h.version<g.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:u}}function aD(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,g){n.drawElements(i,g,r,h*o),t.update(g,i,1)}function c(h,g,_){_!==0&&(n.drawElementsInstanced(i,g,r,h*o,_),t.update(g,i,_))}function u(h,g,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,g,0,r,h,0,_);let m=0;for(let p=0;p<_;p++)m+=g[p];t.update(m,i,1)}function f(h,g,_,v){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/o,g[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(i,g,0,r,h,0,v,0,_);let p=0;for(let b=0;b<_;b++)p+=g[b]*v[b];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function lD(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:gt("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function cD(n,e,t){const i=new WeakMap,s=new Vt;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0;let h=i.get(a);if(h===void 0||h.count!==f){let E=function(){R.dispose(),i.delete(a),a.removeEventListener("dispose",E)};var g=E;h!==void 0&&h.texture.dispose();const _=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],b=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let M=0;_===!0&&(M=1),v===!0&&(M=2),m===!0&&(M=3);let w=a.attributes.position.count*M,A=1;w>e.maxTextureSize&&(A=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const T=new Float32Array(w*A*4*f),R=new Em(T,w,A,f);R.type=si,R.needsUpdate=!0;const x=M*4;for(let U=0;U<f;U++){const O=p[U],j=b[U],ee=y[U],te=w*A*4*U;for(let K=0;K<O.count;K++){const I=K*x;_===!0&&(s.fromBufferAttribute(O,K),T[te+I+0]=s.x,T[te+I+1]=s.y,T[te+I+2]=s.z,T[te+I+3]=0),v===!0&&(s.fromBufferAttribute(j,K),T[te+I+4]=s.x,T[te+I+5]=s.y,T[te+I+6]=s.z,T[te+I+7]=0),m===!0&&(s.fromBufferAttribute(ee,K),T[te+I+8]=s.x,T[te+I+9]=s.y,T[te+I+10]=s.z,T[te+I+11]=ee.itemSize===4?s.w:1)}}h={count:f,texture:R,size:new vt(w,A)},i.set(a,h),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const v=a.morphTargetsRelative?1:1-_;l.getUniforms().setValue(n,"morphTargetBaseInfluence",v),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function uD(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,u=l.geometry,f=e.get(l,u);if(s.get(f)!==c&&(e.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return f}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const dD={[am]:"LINEAR_TONE_MAPPING",[lm]:"REINHARD_TONE_MAPPING",[cm]:"CINEON_TONE_MAPPING",[um]:"ACES_FILMIC_TONE_MAPPING",[fm]:"AGX_TONE_MAPPING",[hm]:"NEUTRAL_TONE_MAPPING",[dm]:"CUSTOM_TONE_MAPPING"};function fD(n,e,t,i,s){const r=new li(e,t,{type:n,depthBuffer:i,stencilBuffer:s}),o=new li(e,t,{type:Ni,depthBuffer:!1,stencilBuffer:!1}),a=new Cn;a.setAttribute("position",new an([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new an([0,2,0,0,2,0],2));const l=new iP({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),c=new wn(a,l),u=new qu(-1,1,1,-1,0,1);let f=null,h=null,g=!1,_,v=null,m=[],p=!1;this.setSize=function(b,y){r.setSize(b,y),o.setSize(b,y);for(let M=0;M<m.length;M++){const w=m[M];w.setSize&&w.setSize(b,y)}},this.setEffects=function(b){m=b,p=m.length>0&&m[0].isRenderPass===!0;const y=r.width,M=r.height;for(let w=0;w<m.length;w++){const A=m[w];A.setSize&&A.setSize(y,M)}},this.begin=function(b,y){if(g||b.toneMapping===ai&&m.length===0)return!1;if(v=y,y!==null){const M=y.width,w=y.height;(r.width!==M||r.height!==w)&&this.setSize(M,w)}return p===!1&&b.setRenderTarget(r),_=b.toneMapping,b.toneMapping=ai,!0},this.hasRenderPass=function(){return p},this.end=function(b,y){b.toneMapping=_,g=!0;let M=r,w=o;for(let A=0;A<m.length;A++){const T=m[A];if(T.enabled!==!1&&(T.render(b,w,M,y),T.needsSwap!==!1)){const R=M;M=w,w=R}}if(f!==b.outputColorSpace||h!==b.toneMapping){f=b.outputColorSpace,h=b.toneMapping,l.defines={},ht.getTransfer(f)===Mt&&(l.defines.SRGB_TRANSFER="");const A=dD[h];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=M.texture,b.setRenderTarget(v),b.render(c,u),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}const Bm=new pn,ou=new io(1,1),Vm=new Em,zm=new D3,Hm=new Lm,th=[],nh=[],ih=new Float32Array(16),sh=new Float32Array(9),rh=new Float32Array(4);function vr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=th[s];if(r===void 0&&(r=new Float32Array(s),th[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function qa(n,e){let t=nh[e];t===void 0&&(t=new Int32Array(e),nh[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function hD(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function pD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function mD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function gD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function vD(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;rh.set(i),n.uniformMatrix2fv(this.addr,!1,rh),qt(t,i)}}function _D(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;sh.set(i),n.uniformMatrix3fv(this.addr,!1,sh),qt(t,i)}}function xD(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;ih.set(i),n.uniformMatrix4fv(this.addr,!1,ih),qt(t,i)}}function yD(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function SD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function bD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function MD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function ED(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function wD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function TD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function AD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function CD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(ou.compareFunction=t.isReversedDepthBuffer()?zu:Vu,r=ou):r=Bm,t.setTexture2D(e||r,s)}function RD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||zm,s)}function PD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Hm,s)}function ID(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Vm,s)}function DD(n){switch(n){case 5126:return hD;case 35664:return pD;case 35665:return mD;case 35666:return gD;case 35674:return vD;case 35675:return _D;case 35676:return xD;case 5124:case 35670:return yD;case 35667:case 35671:return SD;case 35668:case 35672:return bD;case 35669:case 35673:return MD;case 5125:return ED;case 36294:return wD;case 36295:return TD;case 36296:return AD;case 35678:case 36198:case 36298:case 36306:case 35682:return CD;case 35679:case 36299:case 36307:return RD;case 35680:case 36300:case 36308:case 36293:return PD;case 36289:case 36303:case 36311:case 36292:return ID}}function LD(n,e){n.uniform1fv(this.addr,e)}function ND(n,e){const t=vr(e,this.size,2);n.uniform2fv(this.addr,t)}function UD(n,e){const t=vr(e,this.size,3);n.uniform3fv(this.addr,t)}function FD(n,e){const t=vr(e,this.size,4);n.uniform4fv(this.addr,t)}function kD(n,e){const t=vr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function OD(n,e){const t=vr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function BD(n,e){const t=vr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function VD(n,e){n.uniform1iv(this.addr,e)}function zD(n,e){n.uniform2iv(this.addr,e)}function HD(n,e){n.uniform3iv(this.addr,e)}function GD(n,e){n.uniform4iv(this.addr,e)}function $D(n,e){n.uniform1uiv(this.addr,e)}function WD(n,e){n.uniform2uiv(this.addr,e)}function XD(n,e){n.uniform3uiv(this.addr,e)}function qD(n,e){n.uniform4uiv(this.addr,e)}function jD(n,e,t){const i=this.cache,s=e.length,r=qa(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=ou:o=Bm;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function YD(n,e,t){const i=this.cache,s=e.length,r=qa(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||zm,r[o])}function KD(n,e,t){const i=this.cache,s=e.length,r=qa(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Hm,r[o])}function ZD(n,e,t){const i=this.cache,s=e.length,r=qa(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Vm,r[o])}function JD(n){switch(n){case 5126:return LD;case 35664:return ND;case 35665:return UD;case 35666:return FD;case 35674:return kD;case 35675:return OD;case 35676:return BD;case 5124:case 35670:return VD;case 35667:case 35671:return zD;case 35668:case 35672:return HD;case 35669:case 35673:return GD;case 5125:return $D;case 36294:return WD;case 36295:return XD;case 36296:return qD;case 35678:case 36198:case 36298:case 36306:case 35682:return jD;case 35679:case 36299:case 36307:return YD;case 35680:case 36300:case 36308:case 36293:return KD;case 36289:case 36303:case 36311:case 36292:return ZD}}class QD{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=DD(t.type)}}class eL{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=JD(t.type)}}class tL{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const Xl=/(\w+)(\])?(\[|\.)?/g;function oh(n,e){n.seq.push(e),n.map[e.id]=e}function nL(n,e,t){const i=n.name,s=i.length;for(Xl.lastIndex=0;;){const r=Xl.exec(i),o=Xl.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){oh(t,c===void 0?new QD(a,n,e):new eL(a,n,e));break}else{let f=t.map[a];f===void 0&&(f=new tL(a),oh(t,f)),t=f}}}class ca{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);nL(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function ah(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const iL=37297;let sL=0;function rL(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const lh=new it;function oL(n){ht._getMatrix(lh,ht.workingColorSpace,n);const e=`mat3( ${lh.elements.map(t=>t.toFixed(4))} )`;switch(ht.getTransfer(n)){case ya:return[e,"LinearTransferOETF"];case Mt:return[e,"sRGBTransferOETF"];default:return Ze("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function ch(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+rL(n.getShaderSource(e),a)}else return r}function aL(n,e){const t=oL(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const lL={[am]:"Linear",[lm]:"Reinhard",[cm]:"Cineon",[um]:"ACESFilmic",[fm]:"AgX",[hm]:"Neutral",[dm]:"Custom"};function cL(n,e){const t=lL[e];return t===void 0?(Ze("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Yo=new se;function uL(){ht.getLuminanceCoefficients(Yo);const n=Yo.x.toFixed(4),e=Yo.y.toFixed(4),t=Yo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function dL(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ur).join(`
`)}function fL(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function hL(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Ur(n){return n!==""}function uh(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function dh(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const pL=/^[ \t]*#include +<([\w\d./]+)>/gm;function au(n){return n.replace(pL,gL)}const mL=new Map;function gL(n,e){let t=st[e];if(t===void 0){const i=mL.get(e);if(i!==void 0)t=st[i],Ze('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return au(t)}const vL=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fh(n){return n.replace(vL,_L)}function _L(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function hh(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}const xL={[sa]:"SHADOWMAP_TYPE_PCF",[Lr]:"SHADOWMAP_TYPE_VSM"};function yL(n){return xL[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const SL={[Cs]:"ENVMAP_TYPE_CUBE",[ur]:"ENVMAP_TYPE_CUBE",[$a]:"ENVMAP_TYPE_CUBE_UV"};function bL(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":SL[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const ML={[ur]:"ENVMAP_MODE_REFRACTION"};function EL(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":ML[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const wL={[Lu]:"ENVMAP_BLENDING_MULTIPLY",[h3]:"ENVMAP_BLENDING_MIX",[p3]:"ENVMAP_BLENDING_ADD"};function TL(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":wL[n.combine]||"ENVMAP_BLENDING_NONE"}function AL(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function CL(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=yL(t),c=bL(t),u=EL(t),f=TL(t),h=AL(t),g=dL(t),_=fL(r),v=s.createProgram();let m,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),p.length>0&&(p+=`
`)):(m=[hh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ur).join(`
`),p=[hh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ai?"#define TONE_MAPPING":"",t.toneMapping!==ai?st.tonemapping_pars_fragment:"",t.toneMapping!==ai?cL("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",st.colorspace_pars_fragment,aL("linearToOutputTexel",t.outputColorSpace),uL(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ur).join(`
`)),o=au(o),o=uh(o,t),o=dh(o,t),a=au(a),a=uh(a,t),a=dh(a,t),o=fh(o),a=fh(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===wf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===wf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=b+m+o,M=b+p+a,w=ah(s,s.VERTEX_SHADER,y),A=ah(s,s.FRAGMENT_SHADER,M);s.attachShader(v,w),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function T(U){if(n.debug.checkShaderErrors){const O=s.getProgramInfoLog(v)||"",j=s.getShaderInfoLog(w)||"",ee=s.getShaderInfoLog(A)||"",te=O.trim(),K=j.trim(),I=ee.trim();let F=!0,$=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(F=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,w,A);else{const J=ch(s,w,"vertex"),oe=ch(s,A,"fragment");gt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+te+`
`+J+`
`+oe)}else te!==""?Ze("WebGLProgram: Program Info Log:",te):(K===""||I==="")&&($=!1);$&&(U.diagnostics={runnable:F,programLog:te,vertexShader:{log:K,prefix:m},fragmentShader:{log:I,prefix:p}})}s.deleteShader(w),s.deleteShader(A),R=new ca(s,v),x=hL(s,v)}let R;this.getUniforms=function(){return R===void 0&&T(this),R};let x;this.getAttributes=function(){return x===void 0&&T(this),x};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=s.getProgramParameter(v,iL)),E},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=sL++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=w,this.fragmentShader=A,this}let RL=0;class PL{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new IL(e),t.set(e,i)),i}}class IL{constructor(e){this.id=RL++,this.code=e,this.usedTimes=0}}function DL(n,e,t,i,s,r,o){const a=new Tm,l=new PL,c=new Set,u=[],f=new Map,h=s.logarithmicDepthBuffer;let g=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(x){return c.add(x),x===0?"uv":`uv${x}`}function m(x,E,U,O,j){const ee=O.fog,te=j.geometry,K=x.isMeshStandardMaterial?O.environment:null,I=(x.isMeshStandardMaterial?t:e).get(x.envMap||K),F=I&&I.mapping===$a?I.image.height:null,$=_[x.type];x.precision!==null&&(g=s.getMaxPrecision(x.precision),g!==x.precision&&Ze("WebGLProgram.getParameters:",x.precision,"not supported, using",g,"instead."));const J=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,oe=J!==void 0?J.length:0;let we=0;te.morphAttributes.position!==void 0&&(we=1),te.morphAttributes.normal!==void 0&&(we=2),te.morphAttributes.color!==void 0&&(we=3);let De,rt,lt,de;if($){const St=ni[$];De=St.vertexShader,rt=St.fragmentShader}else De=x.vertexShader,rt=x.fragmentShader,l.update(x),lt=l.getVertexShaderID(x),de=l.getFragmentShaderID(x);const X=n.getRenderTarget(),ce=n.state.buffers.depth.getReversed(),me=j.isInstancedMesh===!0,he=j.isBatchedMesh===!0,Fe=!!x.map,k=!!x.matcap,z=!!I,q=!!x.aoMap,H=!!x.lightMap,D=!!x.bumpMap,W=!!x.normalMap,L=!!x.displacementMap,xe=!!x.emissiveMap,pe=!!x.metalnessMap,fe=!!x.roughnessMap,ge=x.anisotropy>0,C=x.clearcoat>0,S=x.dispersion>0,G=x.iridescence>0,re=x.sheen>0,ue=x.transmission>0,ie=ge&&!!x.anisotropyMap,Le=C&&!!x.clearcoatMap,Se=C&&!!x.clearcoatNormalMap,ke=C&&!!x.clearcoatRoughnessMap,We=G&&!!x.iridescenceMap,ye=G&&!!x.iridescenceThicknessMap,Ae=re&&!!x.sheenColorMap,Re=re&&!!x.sheenRoughnessMap,Oe=!!x.specularMap,Te=!!x.specularColorMap,nt=!!x.specularIntensityMap,Y=ue&&!!x.transmissionMap,Ue=ue&&!!x.thicknessMap,Ee=!!x.gradientMap,ze=!!x.alphaMap,be=x.alphaTest>0,ve=!!x.alphaHash,Ce=!!x.extensions;let Je=ai;x.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(Je=n.toneMapping);const Rt={shaderID:$,shaderType:x.type,shaderName:x.name,vertexShader:De,fragmentShader:rt,defines:x.defines,customVertexShaderID:lt,customFragmentShaderID:de,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:g,batching:he,batchingColor:he&&j._colorsTexture!==null,instancing:me,instancingColor:me&&j.instanceColor!==null,instancingMorph:me&&j.morphTexture!==null,outputColorSpace:X===null?n.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:fr,alphaToCoverage:!!x.alphaToCoverage,map:Fe,matcap:k,envMap:z,envMapMode:z&&I.mapping,envMapCubeUVHeight:F,aoMap:q,lightMap:H,bumpMap:D,normalMap:W,displacementMap:L,emissiveMap:xe,normalMapObjectSpace:W&&x.normalMapType===v3,normalMapTangentSpace:W&&x.normalMapType===bm,metalnessMap:pe,roughnessMap:fe,anisotropy:ge,anisotropyMap:ie,clearcoat:C,clearcoatMap:Le,clearcoatNormalMap:Se,clearcoatRoughnessMap:ke,dispersion:S,iridescence:G,iridescenceMap:We,iridescenceThicknessMap:ye,sheen:re,sheenColorMap:Ae,sheenRoughnessMap:Re,specularMap:Oe,specularColorMap:Te,specularIntensityMap:nt,transmission:ue,transmissionMap:Y,thicknessMap:Ue,gradientMap:Ee,opaque:x.transparent===!1&&x.blending===er&&x.alphaToCoverage===!1,alphaMap:ze,alphaTest:be,alphaHash:ve,combine:x.combine,mapUv:Fe&&v(x.map.channel),aoMapUv:q&&v(x.aoMap.channel),lightMapUv:H&&v(x.lightMap.channel),bumpMapUv:D&&v(x.bumpMap.channel),normalMapUv:W&&v(x.normalMap.channel),displacementMapUv:L&&v(x.displacementMap.channel),emissiveMapUv:xe&&v(x.emissiveMap.channel),metalnessMapUv:pe&&v(x.metalnessMap.channel),roughnessMapUv:fe&&v(x.roughnessMap.channel),anisotropyMapUv:ie&&v(x.anisotropyMap.channel),clearcoatMapUv:Le&&v(x.clearcoatMap.channel),clearcoatNormalMapUv:Se&&v(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ke&&v(x.clearcoatRoughnessMap.channel),iridescenceMapUv:We&&v(x.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&v(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ae&&v(x.sheenColorMap.channel),sheenRoughnessMapUv:Re&&v(x.sheenRoughnessMap.channel),specularMapUv:Oe&&v(x.specularMap.channel),specularColorMapUv:Te&&v(x.specularColorMap.channel),specularIntensityMapUv:nt&&v(x.specularIntensityMap.channel),transmissionMapUv:Y&&v(x.transmissionMap.channel),thicknessMapUv:Ue&&v(x.thicknessMap.channel),alphaMapUv:ze&&v(x.alphaMap.channel),vertexTangents:!!te.attributes.tangent&&(W||ge),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,pointsUvs:j.isPoints===!0&&!!te.attributes.uv&&(Fe||ze),fog:!!ee,useFog:x.fog===!0,fogExp2:!!ee&&ee.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ce,skinning:j.isSkinnedMesh===!0,morphTargets:te.morphAttributes.position!==void 0,morphNormals:te.morphAttributes.normal!==void 0,morphColors:te.morphAttributes.color!==void 0,morphTargetsCount:oe,morphTextureStride:we,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&U.length>0,shadowMapType:n.shadowMap.type,toneMapping:Je,decodeVideoTexture:Fe&&x.map.isVideoTexture===!0&&ht.getTransfer(x.map.colorSpace)===Mt,decodeVideoTextureEmissive:xe&&x.emissiveMap.isVideoTexture===!0&&ht.getTransfer(x.emissiveMap.colorSpace)===Mt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ii,flipSided:x.side===_n,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ce&&x.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ce&&x.extensions.multiDraw===!0||he)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Rt.vertexUv1s=c.has(1),Rt.vertexUv2s=c.has(2),Rt.vertexUv3s=c.has(3),c.clear(),Rt}function p(x){const E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(const U in x.defines)E.push(U),E.push(x.defines[U]);return x.isRawShaderMaterial===!1&&(b(E,x),y(E,x),E.push(n.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function b(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function y(x,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),x.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),x.push(a.mask)}function M(x){const E=_[x.type];let U;if(E){const O=ni[E];U=W3.clone(O.uniforms)}else U=x.uniforms;return U}function w(x,E){let U=f.get(E);return U!==void 0?++U.usedTimes:(U=new CL(n,E,x,r),u.push(U),f.set(E,U)),U}function A(x){if(--x.usedTimes===0){const E=u.indexOf(x);u[E]=u[u.length-1],u.pop(),f.delete(x.cacheKey),x.destroy()}}function T(x){l.remove(x)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:w,releaseProgram:A,releaseShaderCache:T,programs:u,dispose:R}}function LL(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function NL(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function ph(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function mh(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(f,h,g,_,v,m){let p=n[e];return p===void 0?(p={id:f.id,object:f,geometry:h,material:g,groupOrder:_,renderOrder:f.renderOrder,z:v,group:m},n[e]=p):(p.id=f.id,p.object=f,p.geometry=h,p.material=g,p.groupOrder=_,p.renderOrder=f.renderOrder,p.z=v,p.group=m),e++,p}function a(f,h,g,_,v,m){const p=o(f,h,g,_,v,m);g.transmission>0?i.push(p):g.transparent===!0?s.push(p):t.push(p)}function l(f,h,g,_,v,m){const p=o(f,h,g,_,v,m);g.transmission>0?i.unshift(p):g.transparent===!0?s.unshift(p):t.unshift(p)}function c(f,h){t.length>1&&t.sort(f||NL),i.length>1&&i.sort(h||ph),s.length>1&&s.sort(h||ph)}function u(){for(let f=e,h=n.length;f<h;f++){const g=n[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function UL(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new mh,n.set(i,[o])):s>=r.length?(o=new mh,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function FL(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new se,color:new dt};break;case"SpotLight":t={position:new se,direction:new se,color:new dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new se,color:new dt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new se,skyColor:new dt,groundColor:new dt};break;case"RectAreaLight":t={color:new dt,position:new se,halfWidth:new se,halfHeight:new se};break}return n[e.id]=t,t}}}function kL(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let OL=0;function BL(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function VL(n){const e=new FL,t=kL(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new se);const s=new se,r=new Ut,o=new Ut;function a(c){let u=0,f=0,h=0;for(let x=0;x<9;x++)i.probe[x].set(0,0,0);let g=0,_=0,v=0,m=0,p=0,b=0,y=0,M=0,w=0,A=0,T=0;c.sort(BL);for(let x=0,E=c.length;x<E;x++){const U=c[x],O=U.color,j=U.intensity,ee=U.distance;let te=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===dr?te=U.shadow.map.texture:te=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=O.r*j,f+=O.g*j,h+=O.b*j;else if(U.isLightProbe){for(let K=0;K<9;K++)i.probe[K].addScaledVector(U.sh.coefficients[K],j);T++}else if(U.isDirectionalLight){const K=e.get(U);if(K.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const I=U.shadow,F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,i.directionalShadow[g]=F,i.directionalShadowMap[g]=te,i.directionalShadowMatrix[g]=U.shadow.matrix,b++}i.directional[g]=K,g++}else if(U.isSpotLight){const K=e.get(U);K.position.setFromMatrixPosition(U.matrixWorld),K.color.copy(O).multiplyScalar(j),K.distance=ee,K.coneCos=Math.cos(U.angle),K.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),K.decay=U.decay,i.spot[v]=K;const I=U.shadow;if(U.map&&(i.spotLightMap[w]=U.map,w++,I.updateMatrices(U),U.castShadow&&A++),i.spotLightMatrix[v]=I.matrix,U.castShadow){const F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,i.spotShadow[v]=F,i.spotShadowMap[v]=te,M++}v++}else if(U.isRectAreaLight){const K=e.get(U);K.color.copy(O).multiplyScalar(j),K.halfWidth.set(U.width*.5,0,0),K.halfHeight.set(0,U.height*.5,0),i.rectArea[m]=K,m++}else if(U.isPointLight){const K=e.get(U);if(K.color.copy(U.color).multiplyScalar(U.intensity),K.distance=U.distance,K.decay=U.decay,U.castShadow){const I=U.shadow,F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,F.shadowCameraNear=I.camera.near,F.shadowCameraFar=I.camera.far,i.pointShadow[_]=F,i.pointShadowMap[_]=te,i.pointShadowMatrix[_]=U.shadow.matrix,y++}i.point[_]=K,_++}else if(U.isHemisphereLight){const K=e.get(U);K.skyColor.copy(U.color).multiplyScalar(j),K.groundColor.copy(U.groundColor).multiplyScalar(j),i.hemi[p]=K,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Ie.LTC_FLOAT_1,i.rectAreaLTC2=Ie.LTC_FLOAT_2):(i.rectAreaLTC1=Ie.LTC_HALF_1,i.rectAreaLTC2=Ie.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;const R=i.hash;(R.directionalLength!==g||R.pointLength!==_||R.spotLength!==v||R.rectAreaLength!==m||R.hemiLength!==p||R.numDirectionalShadows!==b||R.numPointShadows!==y||R.numSpotShadows!==M||R.numSpotMaps!==w||R.numLightProbes!==T)&&(i.directional.length=g,i.spot.length=v,i.rectArea.length=m,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=b,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=M+w-A,i.spotLightMap.length=w,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=T,R.directionalLength=g,R.pointLength=_,R.spotLength=v,R.rectAreaLength=m,R.hemiLength=p,R.numDirectionalShadows=b,R.numPointShadows=y,R.numSpotShadows=M,R.numSpotMaps=w,R.numLightProbes=T,i.version=OL++)}function l(c,u){let f=0,h=0,g=0,_=0,v=0;const m=u.matrixWorldInverse;for(let p=0,b=c.length;p<b;p++){const y=c[p];if(y.isDirectionalLight){const M=i.directional[f];M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),f++}else if(y.isSpotLight){const M=i.spot[g];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),g++}else if(y.isRectAreaLight){const M=i.rectArea[_];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){const M=i.point[h];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(m),h++}else if(y.isHemisphereLight){const M=i.hemi[v];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(m),v++}}}return{setup:a,setupView:l,state:i}}function gh(n){const e=new VL(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function zL(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new gh(n),e.set(s,[a])):r>=o.length?(a=new gh(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const HL=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,GL=`uniform sampler2D shadow_pass;
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
}`,$L=[new se(1,0,0),new se(-1,0,0),new se(0,1,0),new se(0,-1,0),new se(0,0,1),new se(0,0,-1)],WL=[new se(0,-1,0),new se(0,-1,0),new se(0,0,1),new se(0,0,-1),new se(0,-1,0),new se(0,-1,0)],vh=new Ut,Ir=new se,ql=new se;function XL(n,e,t){let i=new $u;const s=new vt,r=new vt,o=new Vt,a=new sP,l=new rP,c={},u=t.maxTextureSize,f={[ts]:_n,[_n]:ts,[ii]:ii},h=new hi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new vt},radius:{value:4}},vertexShader:HL,fragmentShader:GL}),g=h.clone();g.defines.HORIZONTAL_PASS=1;const _=new Cn;_.setAttribute("position",new ci(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new wn(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=sa;let p=this.type;this.render=function(A,T,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;A.type===jR&&(Ze("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),A.type=sa);const x=n.getRenderTarget(),E=n.getActiveCubeFace(),U=n.getActiveMipmapLevel(),O=n.state;O.setBlending(Ri),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const j=p!==this.type;j&&T.traverse(function(ee){ee.material&&(Array.isArray(ee.material)?ee.material.forEach(te=>te.needsUpdate=!0):ee.material.needsUpdate=!0)});for(let ee=0,te=A.length;ee<te;ee++){const K=A[ee],I=K.shadow;if(I===void 0){Ze("WebGLShadowMap:",K,"has no shadow.");continue}if(I.autoUpdate===!1&&I.needsUpdate===!1)continue;s.copy(I.mapSize);const F=I.getFrameExtents();if(s.multiply(F),r.copy(I.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/F.x),s.x=r.x*F.x,I.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/F.y),s.y=r.y*F.y,I.mapSize.y=r.y)),I.map===null||j===!0){if(I.map!==null&&(I.map.depthTexture!==null&&(I.map.depthTexture.dispose(),I.map.depthTexture=null),I.map.dispose()),this.type===Lr){if(K.isPointLight){Ze("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}I.map=new li(s.x,s.y,{format:dr,type:Ni,minFilter:on,magFilter:on,generateMipmaps:!1}),I.map.texture.name=K.name+".shadowMap",I.map.depthTexture=new io(s.x,s.y,si),I.map.depthTexture.name=K.name+".shadowMapDepth",I.map.depthTexture.format=Ui,I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=Zt,I.map.depthTexture.magFilter=Zt}else{K.isPointLight?(I.map=new Nm(s.x),I.map.depthTexture=new nP(s.x,di)):(I.map=new li(s.x,s.y),I.map.depthTexture=new io(s.x,s.y,di)),I.map.depthTexture.name=K.name+".shadowMap",I.map.depthTexture.format=Ui;const J=n.state.buffers.depth.getReversed();this.type===sa?(I.map.depthTexture.compareFunction=J?zu:Vu,I.map.depthTexture.minFilter=on,I.map.depthTexture.magFilter=on):(I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=Zt,I.map.depthTexture.magFilter=Zt)}I.camera.updateProjectionMatrix()}const $=I.map.isWebGLCubeRenderTarget?6:1;for(let J=0;J<$;J++){if(I.map.isWebGLCubeRenderTarget)n.setRenderTarget(I.map,J),n.clear();else{J===0&&(n.setRenderTarget(I.map),n.clear());const oe=I.getViewport(J);o.set(r.x*oe.x,r.y*oe.y,r.x*oe.z,r.y*oe.w),O.viewport(o)}if(K.isPointLight){const oe=I.camera,we=I.matrix,De=K.distance||oe.far;De!==oe.far&&(oe.far=De,oe.updateProjectionMatrix()),Ir.setFromMatrixPosition(K.matrixWorld),oe.position.copy(Ir),ql.copy(oe.position),ql.add($L[J]),oe.up.copy(WL[J]),oe.lookAt(ql),oe.updateMatrixWorld(),we.makeTranslation(-Ir.x,-Ir.y,-Ir.z),vh.multiplyMatrices(oe.projectionMatrix,oe.matrixWorldInverse),I._frustum.setFromProjectionMatrix(vh,oe.coordinateSystem,oe.reversedDepth)}else I.updateMatrices(K);i=I.getFrustum(),M(T,R,I.camera,K,this.type)}I.isPointLightShadow!==!0&&this.type===Lr&&b(I,R),I.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(x,E,U)};function b(A,T){const R=e.update(v);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,g.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,g.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new li(s.x,s.y,{format:dr,type:Ni})),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value=A.mapSize,h.uniforms.radius.value=A.radius,n.setRenderTarget(A.mapPass),n.clear(),n.renderBufferDirect(T,null,R,h,v,null),g.uniforms.shadow_pass.value=A.mapPass.texture,g.uniforms.resolution.value=A.mapSize,g.uniforms.radius.value=A.radius,n.setRenderTarget(A.map),n.clear(),n.renderBufferDirect(T,null,R,g,v,null)}function y(A,T,R,x){let E=null;const U=R.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(U!==void 0)E=U;else if(E=R.isPointLight===!0?l:a,n.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){const O=E.uuid,j=T.uuid;let ee=c[O];ee===void 0&&(ee={},c[O]=ee);let te=ee[j];te===void 0&&(te=E.clone(),ee[j]=te,T.addEventListener("dispose",w)),E=te}if(E.visible=T.visible,E.wireframe=T.wireframe,x===Lr?E.side=T.shadowSide!==null?T.shadowSide:T.side:E.side=T.shadowSide!==null?T.shadowSide:f[T.side],E.alphaMap=T.alphaMap,E.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,E.map=T.map,E.clipShadows=T.clipShadows,E.clippingPlanes=T.clippingPlanes,E.clipIntersection=T.clipIntersection,E.displacementMap=T.displacementMap,E.displacementScale=T.displacementScale,E.displacementBias=T.displacementBias,E.wireframeLinewidth=T.wireframeLinewidth,E.linewidth=T.linewidth,R.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const O=n.properties.get(E);O.light=R}return E}function M(A,T,R,x,E){if(A.visible===!1)return;if(A.layers.test(T.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&E===Lr)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,A.matrixWorld);const j=e.update(A),ee=A.material;if(Array.isArray(ee)){const te=j.groups;for(let K=0,I=te.length;K<I;K++){const F=te[K],$=ee[F.materialIndex];if($&&$.visible){const J=y(A,$,x,E);A.onBeforeShadow(n,A,T,R,j,J,F),n.renderBufferDirect(R,null,j,J,A,F),A.onAfterShadow(n,A,T,R,j,J,F)}}}else if(ee.visible){const te=y(A,ee,x,E);A.onBeforeShadow(n,A,T,R,j,te,null),n.renderBufferDirect(R,null,j,te,A,null),A.onAfterShadow(n,A,T,R,j,te,null)}}const O=A.children;for(let j=0,ee=O.length;j<ee;j++)M(O[j],T,R,x,E)}function w(A){A.target.removeEventListener("dispose",w);for(const R in c){const x=c[R],E=A.target.uuid;E in x&&(x[E].dispose(),delete x[E])}}}const qL={[gc]:vc,[_c]:Sc,[xc]:bc,[cr]:yc,[vc]:gc,[Sc]:_c,[bc]:xc,[yc]:cr};function jL(n,e){function t(){let Y=!1;const Ue=new Vt;let Ee=null;const ze=new Vt(0,0,0,0);return{setMask:function(be){Ee!==be&&!Y&&(n.colorMask(be,be,be,be),Ee=be)},setLocked:function(be){Y=be},setClear:function(be,ve,Ce,Je,Rt){Rt===!0&&(be*=Je,ve*=Je,Ce*=Je),Ue.set(be,ve,Ce,Je),ze.equals(Ue)===!1&&(n.clearColor(be,ve,Ce,Je),ze.copy(Ue))},reset:function(){Y=!1,Ee=null,ze.set(-1,0,0,0)}}}function i(){let Y=!1,Ue=!1,Ee=null,ze=null,be=null;return{setReversed:function(ve){if(Ue!==ve){const Ce=e.get("EXT_clip_control");ve?Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.ZERO_TO_ONE_EXT):Ce.clipControlEXT(Ce.LOWER_LEFT_EXT,Ce.NEGATIVE_ONE_TO_ONE_EXT),Ue=ve;const Je=be;be=null,this.setClear(Je)}},getReversed:function(){return Ue},setTest:function(ve){ve?X(n.DEPTH_TEST):ce(n.DEPTH_TEST)},setMask:function(ve){Ee!==ve&&!Y&&(n.depthMask(ve),Ee=ve)},setFunc:function(ve){if(Ue&&(ve=qL[ve]),ze!==ve){switch(ve){case gc:n.depthFunc(n.NEVER);break;case vc:n.depthFunc(n.ALWAYS);break;case _c:n.depthFunc(n.LESS);break;case cr:n.depthFunc(n.LEQUAL);break;case xc:n.depthFunc(n.EQUAL);break;case yc:n.depthFunc(n.GEQUAL);break;case Sc:n.depthFunc(n.GREATER);break;case bc:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ze=ve}},setLocked:function(ve){Y=ve},setClear:function(ve){be!==ve&&(Ue&&(ve=1-ve),n.clearDepth(ve),be=ve)},reset:function(){Y=!1,Ee=null,ze=null,be=null,Ue=!1}}}function s(){let Y=!1,Ue=null,Ee=null,ze=null,be=null,ve=null,Ce=null,Je=null,Rt=null;return{setTest:function(St){Y||(St?X(n.STENCIL_TEST):ce(n.STENCIL_TEST))},setMask:function(St){Ue!==St&&!Y&&(n.stencilMask(St),Ue=St)},setFunc:function(St,Kn,mi){(Ee!==St||ze!==Kn||be!==mi)&&(n.stencilFunc(St,Kn,mi),Ee=St,ze=Kn,be=mi)},setOp:function(St,Kn,mi){(ve!==St||Ce!==Kn||Je!==mi)&&(n.stencilOp(St,Kn,mi),ve=St,Ce=Kn,Je=mi)},setLocked:function(St){Y=St},setClear:function(St){Rt!==St&&(n.clearStencil(St),Rt=St)},reset:function(){Y=!1,Ue=null,Ee=null,ze=null,be=null,ve=null,Ce=null,Je=null,Rt=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let u={},f={},h=new WeakMap,g=[],_=null,v=!1,m=null,p=null,b=null,y=null,M=null,w=null,A=null,T=new dt(0,0,0),R=0,x=!1,E=null,U=null,O=null,j=null,ee=null;const te=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let K=!1,I=0;const F=n.getParameter(n.VERSION);F.indexOf("WebGL")!==-1?(I=parseFloat(/^WebGL (\d)/.exec(F)[1]),K=I>=1):F.indexOf("OpenGL ES")!==-1&&(I=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),K=I>=2);let $=null,J={};const oe=n.getParameter(n.SCISSOR_BOX),we=n.getParameter(n.VIEWPORT),De=new Vt().fromArray(oe),rt=new Vt().fromArray(we);function lt(Y,Ue,Ee,ze){const be=new Uint8Array(4),ve=n.createTexture();n.bindTexture(Y,ve),n.texParameteri(Y,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(Y,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ce=0;Ce<Ee;Ce++)Y===n.TEXTURE_3D||Y===n.TEXTURE_2D_ARRAY?n.texImage3D(Ue,0,n.RGBA,1,1,ze,0,n.RGBA,n.UNSIGNED_BYTE,be):n.texImage2D(Ue+Ce,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,be);return ve}const de={};de[n.TEXTURE_2D]=lt(n.TEXTURE_2D,n.TEXTURE_2D,1),de[n.TEXTURE_CUBE_MAP]=lt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[n.TEXTURE_2D_ARRAY]=lt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),de[n.TEXTURE_3D]=lt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),X(n.DEPTH_TEST),o.setFunc(cr),D(!1),W(xf),X(n.CULL_FACE),q(Ri);function X(Y){u[Y]!==!0&&(n.enable(Y),u[Y]=!0)}function ce(Y){u[Y]!==!1&&(n.disable(Y),u[Y]=!1)}function me(Y,Ue){return f[Y]!==Ue?(n.bindFramebuffer(Y,Ue),f[Y]=Ue,Y===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=Ue),Y===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=Ue),!0):!1}function he(Y,Ue){let Ee=g,ze=!1;if(Y){Ee=h.get(Ue),Ee===void 0&&(Ee=[],h.set(Ue,Ee));const be=Y.textures;if(Ee.length!==be.length||Ee[0]!==n.COLOR_ATTACHMENT0){for(let ve=0,Ce=be.length;ve<Ce;ve++)Ee[ve]=n.COLOR_ATTACHMENT0+ve;Ee.length=be.length,ze=!0}}else Ee[0]!==n.BACK&&(Ee[0]=n.BACK,ze=!0);ze&&n.drawBuffers(Ee)}function Fe(Y){return _!==Y?(n.useProgram(Y),_=Y,!0):!1}const k={[xs]:n.FUNC_ADD,[KR]:n.FUNC_SUBTRACT,[ZR]:n.FUNC_REVERSE_SUBTRACT};k[JR]=n.MIN,k[QR]=n.MAX;const z={[e3]:n.ZERO,[t3]:n.ONE,[n3]:n.SRC_COLOR,[pc]:n.SRC_ALPHA,[l3]:n.SRC_ALPHA_SATURATE,[o3]:n.DST_COLOR,[s3]:n.DST_ALPHA,[i3]:n.ONE_MINUS_SRC_COLOR,[mc]:n.ONE_MINUS_SRC_ALPHA,[a3]:n.ONE_MINUS_DST_COLOR,[r3]:n.ONE_MINUS_DST_ALPHA,[c3]:n.CONSTANT_COLOR,[u3]:n.ONE_MINUS_CONSTANT_COLOR,[d3]:n.CONSTANT_ALPHA,[f3]:n.ONE_MINUS_CONSTANT_ALPHA};function q(Y,Ue,Ee,ze,be,ve,Ce,Je,Rt,St){if(Y===Ri){v===!0&&(ce(n.BLEND),v=!1);return}if(v===!1&&(X(n.BLEND),v=!0),Y!==YR){if(Y!==m||St!==x){if((p!==xs||M!==xs)&&(n.blendEquation(n.FUNC_ADD),p=xs,M=xs),St)switch(Y){case er:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case yf:n.blendFunc(n.ONE,n.ONE);break;case Sf:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case bf:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:gt("WebGLState: Invalid blending: ",Y);break}else switch(Y){case er:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case yf:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Sf:gt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case bf:gt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:gt("WebGLState: Invalid blending: ",Y);break}b=null,y=null,w=null,A=null,T.set(0,0,0),R=0,m=Y,x=St}return}be=be||Ue,ve=ve||Ee,Ce=Ce||ze,(Ue!==p||be!==M)&&(n.blendEquationSeparate(k[Ue],k[be]),p=Ue,M=be),(Ee!==b||ze!==y||ve!==w||Ce!==A)&&(n.blendFuncSeparate(z[Ee],z[ze],z[ve],z[Ce]),b=Ee,y=ze,w=ve,A=Ce),(Je.equals(T)===!1||Rt!==R)&&(n.blendColor(Je.r,Je.g,Je.b,Rt),T.copy(Je),R=Rt),m=Y,x=!1}function H(Y,Ue){Y.side===ii?ce(n.CULL_FACE):X(n.CULL_FACE);let Ee=Y.side===_n;Ue&&(Ee=!Ee),D(Ee),Y.blending===er&&Y.transparent===!1?q(Ri):q(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),o.setFunc(Y.depthFunc),o.setTest(Y.depthTest),o.setMask(Y.depthWrite),r.setMask(Y.colorWrite);const ze=Y.stencilWrite;a.setTest(ze),ze&&(a.setMask(Y.stencilWriteMask),a.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),a.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass)),xe(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?X(n.SAMPLE_ALPHA_TO_COVERAGE):ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function D(Y){E!==Y&&(Y?n.frontFace(n.CW):n.frontFace(n.CCW),E=Y)}function W(Y){Y!==XR?(X(n.CULL_FACE),Y!==U&&(Y===xf?n.cullFace(n.BACK):Y===qR?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ce(n.CULL_FACE),U=Y}function L(Y){Y!==O&&(K&&n.lineWidth(Y),O=Y)}function xe(Y,Ue,Ee){Y?(X(n.POLYGON_OFFSET_FILL),(j!==Ue||ee!==Ee)&&(n.polygonOffset(Ue,Ee),j=Ue,ee=Ee)):ce(n.POLYGON_OFFSET_FILL)}function pe(Y){Y?X(n.SCISSOR_TEST):ce(n.SCISSOR_TEST)}function fe(Y){Y===void 0&&(Y=n.TEXTURE0+te-1),$!==Y&&(n.activeTexture(Y),$=Y)}function ge(Y,Ue,Ee){Ee===void 0&&($===null?Ee=n.TEXTURE0+te-1:Ee=$);let ze=J[Ee];ze===void 0&&(ze={type:void 0,texture:void 0},J[Ee]=ze),(ze.type!==Y||ze.texture!==Ue)&&($!==Ee&&(n.activeTexture(Ee),$=Ee),n.bindTexture(Y,Ue||de[Y]),ze.type=Y,ze.texture=Ue)}function C(){const Y=J[$];Y!==void 0&&Y.type!==void 0&&(n.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0)}function S(){try{n.compressedTexImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function G(){try{n.compressedTexImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function re(){try{n.texSubImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ue(){try{n.texSubImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ie(){try{n.compressedTexSubImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Le(){try{n.compressedTexSubImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Se(){try{n.texStorage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ke(){try{n.texStorage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function We(){try{n.texImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ye(){try{n.texImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Ae(Y){De.equals(Y)===!1&&(n.scissor(Y.x,Y.y,Y.z,Y.w),De.copy(Y))}function Re(Y){rt.equals(Y)===!1&&(n.viewport(Y.x,Y.y,Y.z,Y.w),rt.copy(Y))}function Oe(Y,Ue){let Ee=c.get(Ue);Ee===void 0&&(Ee=new WeakMap,c.set(Ue,Ee));let ze=Ee.get(Y);ze===void 0&&(ze=n.getUniformBlockIndex(Ue,Y.name),Ee.set(Y,ze))}function Te(Y,Ue){const ze=c.get(Ue).get(Y);l.get(Ue)!==ze&&(n.uniformBlockBinding(Ue,ze,Y.__bindingPointIndex),l.set(Ue,ze))}function nt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},$=null,J={},f={},h=new WeakMap,g=[],_=null,v=!1,m=null,p=null,b=null,y=null,M=null,w=null,A=null,T=new dt(0,0,0),R=0,x=!1,E=null,U=null,O=null,j=null,ee=null,De.set(0,0,n.canvas.width,n.canvas.height),rt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:X,disable:ce,bindFramebuffer:me,drawBuffers:he,useProgram:Fe,setBlending:q,setMaterial:H,setFlipSided:D,setCullFace:W,setLineWidth:L,setPolygonOffset:xe,setScissorTest:pe,activeTexture:fe,bindTexture:ge,unbindTexture:C,compressedTexImage2D:S,compressedTexImage3D:G,texImage2D:We,texImage3D:ye,updateUBOMapping:Oe,uniformBlockBinding:Te,texStorage2D:Se,texStorage3D:ke,texSubImage2D:re,texSubImage3D:ue,compressedTexSubImage2D:ie,compressedTexSubImage3D:Le,scissor:Ae,viewport:Re,reset:nt}}function YL(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new vt,u=new WeakMap;let f;const h=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,S){return g?new OffscreenCanvas(C,S):ba("canvas")}function v(C,S,G){let re=1;const ue=ge(C);if((ue.width>G||ue.height>G)&&(re=G/Math.max(ue.width,ue.height)),re<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const ie=Math.floor(re*ue.width),Le=Math.floor(re*ue.height);f===void 0&&(f=_(ie,Le));const Se=S?_(ie,Le):f;return Se.width=ie,Se.height=Le,Se.getContext("2d").drawImage(C,0,0,ie,Le),Ze("WebGLRenderer: Texture has been resized from ("+ue.width+"x"+ue.height+") to ("+ie+"x"+Le+")."),Se}else return"data"in C&&Ze("WebGLRenderer: Image in DataTexture is too big ("+ue.width+"x"+ue.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){n.generateMipmap(C)}function b(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(C,S,G,re,ue=!1){if(C!==null){if(n[C]!==void 0)return n[C];Ze("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ie=S;if(S===n.RED&&(G===n.FLOAT&&(ie=n.R32F),G===n.HALF_FLOAT&&(ie=n.R16F),G===n.UNSIGNED_BYTE&&(ie=n.R8)),S===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&(ie=n.R8UI),G===n.UNSIGNED_SHORT&&(ie=n.R16UI),G===n.UNSIGNED_INT&&(ie=n.R32UI),G===n.BYTE&&(ie=n.R8I),G===n.SHORT&&(ie=n.R16I),G===n.INT&&(ie=n.R32I)),S===n.RG&&(G===n.FLOAT&&(ie=n.RG32F),G===n.HALF_FLOAT&&(ie=n.RG16F),G===n.UNSIGNED_BYTE&&(ie=n.RG8)),S===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&(ie=n.RG8UI),G===n.UNSIGNED_SHORT&&(ie=n.RG16UI),G===n.UNSIGNED_INT&&(ie=n.RG32UI),G===n.BYTE&&(ie=n.RG8I),G===n.SHORT&&(ie=n.RG16I),G===n.INT&&(ie=n.RG32I)),S===n.RGB_INTEGER&&(G===n.UNSIGNED_BYTE&&(ie=n.RGB8UI),G===n.UNSIGNED_SHORT&&(ie=n.RGB16UI),G===n.UNSIGNED_INT&&(ie=n.RGB32UI),G===n.BYTE&&(ie=n.RGB8I),G===n.SHORT&&(ie=n.RGB16I),G===n.INT&&(ie=n.RGB32I)),S===n.RGBA_INTEGER&&(G===n.UNSIGNED_BYTE&&(ie=n.RGBA8UI),G===n.UNSIGNED_SHORT&&(ie=n.RGBA16UI),G===n.UNSIGNED_INT&&(ie=n.RGBA32UI),G===n.BYTE&&(ie=n.RGBA8I),G===n.SHORT&&(ie=n.RGBA16I),G===n.INT&&(ie=n.RGBA32I)),S===n.RGB&&(G===n.UNSIGNED_INT_5_9_9_9_REV&&(ie=n.RGB9_E5),G===n.UNSIGNED_INT_10F_11F_11F_REV&&(ie=n.R11F_G11F_B10F)),S===n.RGBA){const Le=ue?ya:ht.getTransfer(re);G===n.FLOAT&&(ie=n.RGBA32F),G===n.HALF_FLOAT&&(ie=n.RGBA16F),G===n.UNSIGNED_BYTE&&(ie=Le===Mt?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT_4_4_4_4&&(ie=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&(ie=n.RGB5_A1)}return(ie===n.R16F||ie===n.R32F||ie===n.RG16F||ie===n.RG32F||ie===n.RGBA16F||ie===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function M(C,S){let G;return C?S===null||S===di||S===to?G=n.DEPTH24_STENCIL8:S===si?G=n.DEPTH32F_STENCIL8:S===eo&&(G=n.DEPTH24_STENCIL8,Ze("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===di||S===to?G=n.DEPTH_COMPONENT24:S===si?G=n.DEPTH_COMPONENT32F:S===eo&&(G=n.DEPTH_COMPONENT16),G}function w(C,S){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==Zt&&C.minFilter!==on?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function A(C){const S=C.target;S.removeEventListener("dispose",A),R(S),S.isVideoTexture&&u.delete(S)}function T(C){const S=C.target;S.removeEventListener("dispose",T),E(S)}function R(C){const S=i.get(C);if(S.__webglInit===void 0)return;const G=C.source,re=h.get(G);if(re){const ue=re[S.__cacheKey];ue.usedTimes--,ue.usedTimes===0&&x(C),Object.keys(re).length===0&&h.delete(G)}i.remove(C)}function x(C){const S=i.get(C);n.deleteTexture(S.__webglTexture);const G=C.source,re=h.get(G);delete re[S.__cacheKey],o.memory.textures--}function E(C){const S=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let re=0;re<6;re++){if(Array.isArray(S.__webglFramebuffer[re]))for(let ue=0;ue<S.__webglFramebuffer[re].length;ue++)n.deleteFramebuffer(S.__webglFramebuffer[re][ue]);else n.deleteFramebuffer(S.__webglFramebuffer[re]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[re])}else{if(Array.isArray(S.__webglFramebuffer))for(let re=0;re<S.__webglFramebuffer.length;re++)n.deleteFramebuffer(S.__webglFramebuffer[re]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let re=0;re<S.__webglColorRenderbuffer.length;re++)S.__webglColorRenderbuffer[re]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[re]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const G=C.textures;for(let re=0,ue=G.length;re<ue;re++){const ie=i.get(G[re]);ie.__webglTexture&&(n.deleteTexture(ie.__webglTexture),o.memory.textures--),i.remove(G[re])}i.remove(C)}let U=0;function O(){U=0}function j(){const C=U;return C>=s.maxTextures&&Ze("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),U+=1,C}function ee(C){const S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function te(C,S){const G=i.get(C);if(C.isVideoTexture&&pe(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&G.__version!==C.version){const re=C.image;if(re===null)Ze("WebGLRenderer: Texture marked for update but no image data found.");else if(re.complete===!1)Ze("WebGLRenderer: Texture marked for update but image is incomplete");else{de(G,C,S);return}}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+S)}function K(C,S){const G=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){de(G,C,S);return}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+S)}function I(C,S){const G=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){de(G,C,S);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+S)}function F(C,S){const G=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&G.__version!==C.version){X(G,C,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+S)}const $={[wc]:n.REPEAT,[Ai]:n.CLAMP_TO_EDGE,[Tc]:n.MIRRORED_REPEAT},J={[Zt]:n.NEAREST,[m3]:n.NEAREST_MIPMAP_NEAREST,[Co]:n.NEAREST_MIPMAP_LINEAR,[on]:n.LINEAR,[pl]:n.LINEAR_MIPMAP_NEAREST,[bs]:n.LINEAR_MIPMAP_LINEAR},oe={[_3]:n.NEVER,[M3]:n.ALWAYS,[x3]:n.LESS,[Vu]:n.LEQUAL,[y3]:n.EQUAL,[zu]:n.GEQUAL,[S3]:n.GREATER,[b3]:n.NOTEQUAL};function we(C,S){if(S.type===si&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===on||S.magFilter===pl||S.magFilter===Co||S.magFilter===bs||S.minFilter===on||S.minFilter===pl||S.minFilter===Co||S.minFilter===bs)&&Ze("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,$[S.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,$[S.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,$[S.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,J[S.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,J[S.minFilter]),S.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,oe[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Zt||S.minFilter!==Co&&S.minFilter!==bs||S.type===si&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function De(C,S){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",A));const re=S.source;let ue=h.get(re);ue===void 0&&(ue={},h.set(re,ue));const ie=ee(S);if(ie!==C.__cacheKey){ue[ie]===void 0&&(ue[ie]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ue[ie].usedTimes++;const Le=ue[C.__cacheKey];Le!==void 0&&(ue[C.__cacheKey].usedTimes--,Le.usedTimes===0&&x(S)),C.__cacheKey=ie,C.__webglTexture=ue[ie].texture}return G}function rt(C,S,G){return Math.floor(Math.floor(C/G)/S)}function lt(C,S,G,re){const ie=C.updateRanges;if(ie.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,G,re,S.data);else{ie.sort((ye,Ae)=>ye.start-Ae.start);let Le=0;for(let ye=1;ye<ie.length;ye++){const Ae=ie[Le],Re=ie[ye],Oe=Ae.start+Ae.count,Te=rt(Re.start,S.width,4),nt=rt(Ae.start,S.width,4);Re.start<=Oe+1&&Te===nt&&rt(Re.start+Re.count-1,S.width,4)===Te?Ae.count=Math.max(Ae.count,Re.start+Re.count-Ae.start):(++Le,ie[Le]=Re)}ie.length=Le+1;const Se=n.getParameter(n.UNPACK_ROW_LENGTH),ke=n.getParameter(n.UNPACK_SKIP_PIXELS),We=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let ye=0,Ae=ie.length;ye<Ae;ye++){const Re=ie[ye],Oe=Math.floor(Re.start/4),Te=Math.ceil(Re.count/4),nt=Oe%S.width,Y=Math.floor(Oe/S.width),Ue=Te,Ee=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,nt),n.pixelStorei(n.UNPACK_SKIP_ROWS,Y),t.texSubImage2D(n.TEXTURE_2D,0,nt,Y,Ue,Ee,G,re,S.data)}C.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,Se),n.pixelStorei(n.UNPACK_SKIP_PIXELS,ke),n.pixelStorei(n.UNPACK_SKIP_ROWS,We)}}function de(C,S,G){let re=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(re=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(re=n.TEXTURE_3D);const ue=De(C,S),ie=S.source;t.bindTexture(re,C.__webglTexture,n.TEXTURE0+G);const Le=i.get(ie);if(ie.version!==Le.__version||ue===!0){t.activeTexture(n.TEXTURE0+G);const Se=ht.getPrimaries(ht.workingColorSpace),ke=S.colorSpace===Zi?null:ht.getPrimaries(S.colorSpace),We=S.colorSpace===Zi||Se===ke?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,We);let ye=v(S.image,!1,s.maxTextureSize);ye=fe(S,ye);const Ae=r.convert(S.format,S.colorSpace),Re=r.convert(S.type);let Oe=y(S.internalFormat,Ae,Re,S.colorSpace,S.isVideoTexture);we(re,S);let Te;const nt=S.mipmaps,Y=S.isVideoTexture!==!0,Ue=Le.__version===void 0||ue===!0,Ee=ie.dataReady,ze=w(S,ye);if(S.isDepthTexture)Oe=M(S.format===Ms,S.type),Ue&&(Y?t.texStorage2D(n.TEXTURE_2D,1,Oe,ye.width,ye.height):t.texImage2D(n.TEXTURE_2D,0,Oe,ye.width,ye.height,0,Ae,Re,null));else if(S.isDataTexture)if(nt.length>0){Y&&Ue&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,nt[0].width,nt[0].height);for(let be=0,ve=nt.length;be<ve;be++)Te=nt[be],Y?Ee&&t.texSubImage2D(n.TEXTURE_2D,be,0,0,Te.width,Te.height,Ae,Re,Te.data):t.texImage2D(n.TEXTURE_2D,be,Oe,Te.width,Te.height,0,Ae,Re,Te.data);S.generateMipmaps=!1}else Y?(Ue&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,ye.width,ye.height),Ee&&lt(S,ye,Ae,Re)):t.texImage2D(n.TEXTURE_2D,0,Oe,ye.width,ye.height,0,Ae,Re,ye.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Y&&Ue&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ze,Oe,nt[0].width,nt[0].height,ye.depth);for(let be=0,ve=nt.length;be<ve;be++)if(Te=nt[be],S.format!==Gn)if(Ae!==null)if(Y){if(Ee)if(S.layerUpdates.size>0){const Ce=jf(Te.width,Te.height,S.format,S.type);for(const Je of S.layerUpdates){const Rt=Te.data.subarray(Je*Ce/Te.data.BYTES_PER_ELEMENT,(Je+1)*Ce/Te.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,be,0,0,Je,Te.width,Te.height,1,Ae,Rt)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,be,0,0,0,Te.width,Te.height,ye.depth,Ae,Te.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,be,Oe,Te.width,Te.height,ye.depth,0,Te.data,0,0);else Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Y?Ee&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,be,0,0,0,Te.width,Te.height,ye.depth,Ae,Re,Te.data):t.texImage3D(n.TEXTURE_2D_ARRAY,be,Oe,Te.width,Te.height,ye.depth,0,Ae,Re,Te.data)}else{Y&&Ue&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,nt[0].width,nt[0].height);for(let be=0,ve=nt.length;be<ve;be++)Te=nt[be],S.format!==Gn?Ae!==null?Y?Ee&&t.compressedTexSubImage2D(n.TEXTURE_2D,be,0,0,Te.width,Te.height,Ae,Te.data):t.compressedTexImage2D(n.TEXTURE_2D,be,Oe,Te.width,Te.height,0,Te.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Y?Ee&&t.texSubImage2D(n.TEXTURE_2D,be,0,0,Te.width,Te.height,Ae,Re,Te.data):t.texImage2D(n.TEXTURE_2D,be,Oe,Te.width,Te.height,0,Ae,Re,Te.data)}else if(S.isDataArrayTexture)if(Y){if(Ue&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ze,Oe,ye.width,ye.height,ye.depth),Ee)if(S.layerUpdates.size>0){const be=jf(ye.width,ye.height,S.format,S.type);for(const ve of S.layerUpdates){const Ce=ye.data.subarray(ve*be/ye.data.BYTES_PER_ELEMENT,(ve+1)*be/ye.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ve,ye.width,ye.height,1,Ae,Re,Ce)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ye.width,ye.height,ye.depth,Ae,Re,ye.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Oe,ye.width,ye.height,ye.depth,0,Ae,Re,ye.data);else if(S.isData3DTexture)Y?(Ue&&t.texStorage3D(n.TEXTURE_3D,ze,Oe,ye.width,ye.height,ye.depth),Ee&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ye.width,ye.height,ye.depth,Ae,Re,ye.data)):t.texImage3D(n.TEXTURE_3D,0,Oe,ye.width,ye.height,ye.depth,0,Ae,Re,ye.data);else if(S.isFramebufferTexture){if(Ue)if(Y)t.texStorage2D(n.TEXTURE_2D,ze,Oe,ye.width,ye.height);else{let be=ye.width,ve=ye.height;for(let Ce=0;Ce<ze;Ce++)t.texImage2D(n.TEXTURE_2D,Ce,Oe,be,ve,0,Ae,Re,null),be>>=1,ve>>=1}}else if(nt.length>0){if(Y&&Ue){const be=ge(nt[0]);t.texStorage2D(n.TEXTURE_2D,ze,Oe,be.width,be.height)}for(let be=0,ve=nt.length;be<ve;be++)Te=nt[be],Y?Ee&&t.texSubImage2D(n.TEXTURE_2D,be,0,0,Ae,Re,Te):t.texImage2D(n.TEXTURE_2D,be,Oe,Ae,Re,Te);S.generateMipmaps=!1}else if(Y){if(Ue){const be=ge(ye);t.texStorage2D(n.TEXTURE_2D,ze,Oe,be.width,be.height)}Ee&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ae,Re,ye)}else t.texImage2D(n.TEXTURE_2D,0,Oe,Ae,Re,ye);m(S)&&p(re),Le.__version=ie.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function X(C,S,G){if(S.image.length!==6)return;const re=De(C,S),ue=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+G);const ie=i.get(ue);if(ue.version!==ie.__version||re===!0){t.activeTexture(n.TEXTURE0+G);const Le=ht.getPrimaries(ht.workingColorSpace),Se=S.colorSpace===Zi?null:ht.getPrimaries(S.colorSpace),ke=S.colorSpace===Zi||Le===Se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);const We=S.isCompressedTexture||S.image[0].isCompressedTexture,ye=S.image[0]&&S.image[0].isDataTexture,Ae=[];for(let ve=0;ve<6;ve++)!We&&!ye?Ae[ve]=v(S.image[ve],!0,s.maxCubemapSize):Ae[ve]=ye?S.image[ve].image:S.image[ve],Ae[ve]=fe(S,Ae[ve]);const Re=Ae[0],Oe=r.convert(S.format,S.colorSpace),Te=r.convert(S.type),nt=y(S.internalFormat,Oe,Te,S.colorSpace),Y=S.isVideoTexture!==!0,Ue=ie.__version===void 0||re===!0,Ee=ue.dataReady;let ze=w(S,Re);we(n.TEXTURE_CUBE_MAP,S);let be;if(We){Y&&Ue&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ze,nt,Re.width,Re.height);for(let ve=0;ve<6;ve++){be=Ae[ve].mipmaps;for(let Ce=0;Ce<be.length;Ce++){const Je=be[Ce];S.format!==Gn?Oe!==null?Y?Ee&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce,0,0,Je.width,Je.height,Oe,Je.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce,nt,Je.width,Je.height,0,Je.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Y?Ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce,0,0,Je.width,Je.height,Oe,Te,Je.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce,nt,Je.width,Je.height,0,Oe,Te,Je.data)}}}else{if(be=S.mipmaps,Y&&Ue){be.length>0&&ze++;const ve=ge(Ae[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ze,nt,ve.width,ve.height)}for(let ve=0;ve<6;ve++)if(ye){Y?Ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,Ae[ve].width,Ae[ve].height,Oe,Te,Ae[ve].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,nt,Ae[ve].width,Ae[ve].height,0,Oe,Te,Ae[ve].data);for(let Ce=0;Ce<be.length;Ce++){const Rt=be[Ce].image[ve].image;Y?Ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce+1,0,0,Rt.width,Rt.height,Oe,Te,Rt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce+1,nt,Rt.width,Rt.height,0,Oe,Te,Rt.data)}}else{Y?Ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,Oe,Te,Ae[ve]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,nt,Oe,Te,Ae[ve]);for(let Ce=0;Ce<be.length;Ce++){const Je=be[Ce];Y?Ee&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce+1,0,0,Oe,Te,Je.image[ve]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Ce+1,nt,Oe,Te,Je.image[ve])}}}m(S)&&p(n.TEXTURE_CUBE_MAP),ie.__version=ue.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function ce(C,S,G,re,ue,ie){const Le=r.convert(G.format,G.colorSpace),Se=r.convert(G.type),ke=y(G.internalFormat,Le,Se,G.colorSpace),We=i.get(S),ye=i.get(G);if(ye.__renderTarget=S,!We.__hasExternalTextures){const Ae=Math.max(1,S.width>>ie),Re=Math.max(1,S.height>>ie);ue===n.TEXTURE_3D||ue===n.TEXTURE_2D_ARRAY?t.texImage3D(ue,ie,ke,Ae,Re,S.depth,0,Le,Se,null):t.texImage2D(ue,ie,ke,Ae,Re,0,Le,Se,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),xe(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,re,ue,ye.__webglTexture,0,L(S)):(ue===n.TEXTURE_2D||ue>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ue<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,re,ue,ye.__webglTexture,ie),t.bindFramebuffer(n.FRAMEBUFFER,null)}function me(C,S,G){if(n.bindRenderbuffer(n.RENDERBUFFER,C),S.depthBuffer){const re=S.depthTexture,ue=re&&re.isDepthTexture?re.type:null,ie=M(S.stencilBuffer,ue),Le=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;xe(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(S),ie,S.width,S.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(S),ie,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ie,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Le,n.RENDERBUFFER,C)}else{const re=S.textures;for(let ue=0;ue<re.length;ue++){const ie=re[ue],Le=r.convert(ie.format,ie.colorSpace),Se=r.convert(ie.type),ke=y(ie.internalFormat,Le,Se,ie.colorSpace);xe(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(S),ke,S.width,S.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(S),ke,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ke,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function he(C,S,G){const re=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ue=i.get(S.depthTexture);if(ue.__renderTarget=S,(!ue.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),re){if(ue.__webglInit===void 0&&(ue.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),ue.__webglTexture===void 0){ue.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,ue.__webglTexture),we(n.TEXTURE_CUBE_MAP,S.depthTexture);const We=r.convert(S.depthTexture.format),ye=r.convert(S.depthTexture.type);let Ae;S.depthTexture.format===Ui?Ae=n.DEPTH_COMPONENT24:S.depthTexture.format===Ms&&(Ae=n.DEPTH24_STENCIL8);for(let Re=0;Re<6;Re++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Re,0,Ae,S.width,S.height,0,We,ye,null)}}else te(S.depthTexture,0);const ie=ue.__webglTexture,Le=L(S),Se=re?n.TEXTURE_CUBE_MAP_POSITIVE_X+G:n.TEXTURE_2D,ke=S.depthTexture.format===Ms?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===Ui)xe(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ke,Se,ie,0,Le):n.framebufferTexture2D(n.FRAMEBUFFER,ke,Se,ie,0);else if(S.depthTexture.format===Ms)xe(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ke,Se,ie,0,Le):n.framebufferTexture2D(n.FRAMEBUFFER,ke,Se,ie,0);else throw new Error("Unknown depthTexture format")}function Fe(C){const S=i.get(C),G=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){const re=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),re){const ue=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,re.removeEventListener("dispose",ue)};re.addEventListener("dispose",ue),S.__depthDisposeCallback=ue}S.__boundDepthTexture=re}if(C.depthTexture&&!S.__autoAllocateDepthBuffer)if(G)for(let re=0;re<6;re++)he(S.__webglFramebuffer[re],C,re);else{const re=C.texture.mipmaps;re&&re.length>0?he(S.__webglFramebuffer[0],C,0):he(S.__webglFramebuffer,C,0)}else if(G){S.__webglDepthbuffer=[];for(let re=0;re<6;re++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[re]),S.__webglDepthbuffer[re]===void 0)S.__webglDepthbuffer[re]=n.createRenderbuffer(),me(S.__webglDepthbuffer[re],C,!1);else{const ue=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=S.__webglDepthbuffer[re];n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,ue,n.RENDERBUFFER,ie)}}else{const re=C.texture.mipmaps;if(re&&re.length>0?t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),me(S.__webglDepthbuffer,C,!1);else{const ue=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,ue,n.RENDERBUFFER,ie)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function k(C,S,G){const re=i.get(C);S!==void 0&&ce(re.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&Fe(C)}function z(C){const S=C.texture,G=i.get(C),re=i.get(S);C.addEventListener("dispose",T);const ue=C.textures,ie=C.isWebGLCubeRenderTarget===!0,Le=ue.length>1;if(Le||(re.__webglTexture===void 0&&(re.__webglTexture=n.createTexture()),re.__version=S.version,o.memory.textures++),ie){G.__webglFramebuffer=[];for(let Se=0;Se<6;Se++)if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer[Se]=[];for(let ke=0;ke<S.mipmaps.length;ke++)G.__webglFramebuffer[Se][ke]=n.createFramebuffer()}else G.__webglFramebuffer[Se]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer=[];for(let Se=0;Se<S.mipmaps.length;Se++)G.__webglFramebuffer[Se]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(Le)for(let Se=0,ke=ue.length;Se<ke;Se++){const We=i.get(ue[Se]);We.__webglTexture===void 0&&(We.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&xe(C)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Se=0;Se<ue.length;Se++){const ke=ue[Se];G.__webglColorRenderbuffer[Se]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[Se]);const We=r.convert(ke.format,ke.colorSpace),ye=r.convert(ke.type),Ae=y(ke.internalFormat,We,ye,ke.colorSpace,C.isXRRenderTarget===!0),Re=L(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,Re,Ae,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,G.__webglColorRenderbuffer[Se])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),me(G.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ie){t.bindTexture(n.TEXTURE_CUBE_MAP,re.__webglTexture),we(n.TEXTURE_CUBE_MAP,S);for(let Se=0;Se<6;Se++)if(S.mipmaps&&S.mipmaps.length>0)for(let ke=0;ke<S.mipmaps.length;ke++)ce(G.__webglFramebuffer[Se][ke],C,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,ke);else ce(G.__webglFramebuffer[Se],C,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Se,0);m(S)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Le){for(let Se=0,ke=ue.length;Se<ke;Se++){const We=ue[Se],ye=i.get(We);let Ae=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Ae=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ae,ye.__webglTexture),we(Ae,We),ce(G.__webglFramebuffer,C,We,n.COLOR_ATTACHMENT0+Se,Ae,0),m(We)&&p(Ae)}t.unbindTexture()}else{let Se=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Se=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Se,re.__webglTexture),we(Se,S),S.mipmaps&&S.mipmaps.length>0)for(let ke=0;ke<S.mipmaps.length;ke++)ce(G.__webglFramebuffer[ke],C,S,n.COLOR_ATTACHMENT0,Se,ke);else ce(G.__webglFramebuffer,C,S,n.COLOR_ATTACHMENT0,Se,0);m(S)&&p(Se),t.unbindTexture()}C.depthBuffer&&Fe(C)}function q(C){const S=C.textures;for(let G=0,re=S.length;G<re;G++){const ue=S[G];if(m(ue)){const ie=b(C),Le=i.get(ue).__webglTexture;t.bindTexture(ie,Le),p(ie),t.unbindTexture()}}}const H=[],D=[];function W(C){if(C.samples>0){if(xe(C)===!1){const S=C.textures,G=C.width,re=C.height;let ue=n.COLOR_BUFFER_BIT;const ie=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Le=i.get(C),Se=S.length>1;if(Se)for(let We=0;We<S.length;We++)t.bindFramebuffer(n.FRAMEBUFFER,Le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Le.__webglMultisampledFramebuffer);const ke=C.texture.mipmaps;ke&&ke.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Le.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Le.__webglFramebuffer);for(let We=0;We<S.length;We++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ue|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ue|=n.STENCIL_BUFFER_BIT)),Se){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Le.__webglColorRenderbuffer[We]);const ye=i.get(S[We]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ye,0)}n.blitFramebuffer(0,0,G,re,0,0,G,re,ue,n.NEAREST),l===!0&&(H.length=0,D.length=0,H.push(n.COLOR_ATTACHMENT0+We),C.depthBuffer&&C.resolveDepthBuffer===!1&&(H.push(ie),D.push(ie),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,D)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,H))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Se)for(let We=0;We<S.length;We++){t.bindFramebuffer(n.FRAMEBUFFER,Le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.RENDERBUFFER,Le.__webglColorRenderbuffer[We]);const ye=i.get(S[We]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.TEXTURE_2D,ye,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Le.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const S=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function L(C){return Math.min(s.maxSamples,C.samples)}function xe(C){const S=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function pe(C){const S=o.render.frame;u.get(C)!==S&&(u.set(C,S),C.update())}function fe(C,S){const G=C.colorSpace,re=C.format,ue=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==fr&&G!==Zi&&(ht.getTransfer(G)===Mt?(re!==Gn||ue!==Mn)&&Ze("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):gt("WebGLTextures: Unsupported texture color space:",G)),S}function ge(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=j,this.resetTextureUnits=O,this.setTexture2D=te,this.setTexture2DArray=K,this.setTexture3D=I,this.setTextureCube=F,this.rebindTextures=k,this.setupRenderTarget=z,this.updateRenderTargetMipmap=q,this.updateMultisampleRenderTarget=W,this.setupDepthRenderbuffer=Fe,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=xe,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function KL(n,e){function t(i,s=Zi){let r;const o=ht.getTransfer(s);if(i===Mn)return n.UNSIGNED_BYTE;if(i===Uu)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Fu)return n.UNSIGNED_SHORT_5_5_5_1;if(i===vm)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===_m)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===mm)return n.BYTE;if(i===gm)return n.SHORT;if(i===eo)return n.UNSIGNED_SHORT;if(i===Nu)return n.INT;if(i===di)return n.UNSIGNED_INT;if(i===si)return n.FLOAT;if(i===Ni)return n.HALF_FLOAT;if(i===xm)return n.ALPHA;if(i===ym)return n.RGB;if(i===Gn)return n.RGBA;if(i===Ui)return n.DEPTH_COMPONENT;if(i===Ms)return n.DEPTH_STENCIL;if(i===Sm)return n.RED;if(i===ku)return n.RED_INTEGER;if(i===dr)return n.RG;if(i===Ou)return n.RG_INTEGER;if(i===Bu)return n.RGBA_INTEGER;if(i===ra||i===oa||i===aa||i===la)if(o===Mt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ra)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===oa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===la)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ra)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===oa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===aa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===la)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ac||i===Cc||i===Rc||i===Pc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ac)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Cc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Rc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Pc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ic||i===Dc||i===Lc||i===Nc||i===Uc||i===Fc||i===kc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ic||i===Dc)return o===Mt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Lc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Nc)return r.COMPRESSED_R11_EAC;if(i===Uc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Fc)return r.COMPRESSED_RG11_EAC;if(i===kc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Oc||i===Bc||i===Vc||i===zc||i===Hc||i===Gc||i===$c||i===Wc||i===Xc||i===qc||i===jc||i===Yc||i===Kc||i===Zc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Oc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Bc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Vc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===zc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Hc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Gc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===$c)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Wc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Xc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===qc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===jc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Yc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Zc)return o===Mt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Jc||i===Qc||i===eu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Jc)return o===Mt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Qc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===eu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===tu||i===nu||i===iu||i===su)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===tu)return r.COMPRESSED_RED_RGTC1_EXT;if(i===nu)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===iu)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===su)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===to?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const ZL=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,JL=`
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

}`;class QL{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Fm(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new hi({vertexShader:ZL,fragmentShader:JL,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new wn(new mo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class eN extends mr{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,f=null,h=null,g=null,_=null;const v=typeof XRWebGLBinding<"u",m=new QL,p={},b=t.getContextAttributes();let y=null,M=null;const w=[],A=[],T=new vt;let R=null;const x=new Ln;x.viewport=new Vt;const E=new Ln;E.viewport=new Vt;const U=[x,E],O=new uP;let j=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(de){let X=w[de];return X===void 0&&(X=new kl,w[de]=X),X.getTargetRaySpace()},this.getControllerGrip=function(de){let X=w[de];return X===void 0&&(X=new kl,w[de]=X),X.getGripSpace()},this.getHand=function(de){let X=w[de];return X===void 0&&(X=new kl,w[de]=X),X.getHandSpace()};function te(de){const X=A.indexOf(de.inputSource);if(X===-1)return;const ce=w[X];ce!==void 0&&(ce.update(de.inputSource,de.frame,c||o),ce.dispatchEvent({type:de.type,data:de.inputSource}))}function K(){s.removeEventListener("select",te),s.removeEventListener("selectstart",te),s.removeEventListener("selectend",te),s.removeEventListener("squeeze",te),s.removeEventListener("squeezestart",te),s.removeEventListener("squeezeend",te),s.removeEventListener("end",K),s.removeEventListener("inputsourceschange",I);for(let de=0;de<w.length;de++){const X=A[de];X!==null&&(A[de]=null,w[de].disconnect(X))}j=null,ee=null,m.reset();for(const de in p)delete p[de];e.setRenderTarget(y),g=null,h=null,f=null,s=null,M=null,lt.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(T.width,T.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(de){r=de,i.isPresenting===!0&&Ze("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(de){a=de,i.isPresenting===!0&&Ze("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(de){c=de},this.getBaseLayer=function(){return h!==null?h:g},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(de){if(s=de,s!==null){if(y=e.getRenderTarget(),s.addEventListener("select",te),s.addEventListener("selectstart",te),s.addEventListener("selectend",te),s.addEventListener("squeeze",te),s.addEventListener("squeezestart",te),s.addEventListener("squeezeend",te),s.addEventListener("end",K),s.addEventListener("inputsourceschange",I),b.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ce=null,me=null,he=null;b.depth&&(he=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=b.stencil?Ms:Ui,me=b.stencil?to:di);const Fe={colorFormat:t.RGBA8,depthFormat:he,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Fe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new li(h.textureWidth,h.textureHeight,{format:Gn,type:Mn,depthTexture:new io(h.textureWidth,h.textureHeight,me,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ce={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};g=new XRWebGLLayer(s,t,ce),s.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),M=new li(g.framebufferWidth,g.framebufferHeight,{format:Gn,type:Mn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),lt.setContext(s),lt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function I(de){for(let X=0;X<de.removed.length;X++){const ce=de.removed[X],me=A.indexOf(ce);me>=0&&(A[me]=null,w[me].disconnect(ce))}for(let X=0;X<de.added.length;X++){const ce=de.added[X];let me=A.indexOf(ce);if(me===-1){for(let Fe=0;Fe<w.length;Fe++)if(Fe>=A.length){A.push(ce),me=Fe;break}else if(A[Fe]===null){A[Fe]=ce,me=Fe;break}if(me===-1)break}const he=w[me];he&&he.connect(ce)}}const F=new se,$=new se;function J(de,X,ce){F.setFromMatrixPosition(X.matrixWorld),$.setFromMatrixPosition(ce.matrixWorld);const me=F.distanceTo($),he=X.projectionMatrix.elements,Fe=ce.projectionMatrix.elements,k=he[14]/(he[10]-1),z=he[14]/(he[10]+1),q=(he[9]+1)/he[5],H=(he[9]-1)/he[5],D=(he[8]-1)/he[0],W=(Fe[8]+1)/Fe[0],L=k*D,xe=k*W,pe=me/(-D+W),fe=pe*-D;if(X.matrixWorld.decompose(de.position,de.quaternion,de.scale),de.translateX(fe),de.translateZ(pe),de.matrixWorld.compose(de.position,de.quaternion,de.scale),de.matrixWorldInverse.copy(de.matrixWorld).invert(),he[10]===-1)de.projectionMatrix.copy(X.projectionMatrix),de.projectionMatrixInverse.copy(X.projectionMatrixInverse);else{const ge=k+pe,C=z+pe,S=L-fe,G=xe+(me-fe),re=q*z/C*ge,ue=H*z/C*ge;de.projectionMatrix.makePerspective(S,G,re,ue,ge,C),de.projectionMatrixInverse.copy(de.projectionMatrix).invert()}}function oe(de,X){X===null?de.matrixWorld.copy(de.matrix):de.matrixWorld.multiplyMatrices(X.matrixWorld,de.matrix),de.matrixWorldInverse.copy(de.matrixWorld).invert()}this.updateCamera=function(de){if(s===null)return;let X=de.near,ce=de.far;m.texture!==null&&(m.depthNear>0&&(X=m.depthNear),m.depthFar>0&&(ce=m.depthFar)),O.near=E.near=x.near=X,O.far=E.far=x.far=ce,(j!==O.near||ee!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),j=O.near,ee=O.far),O.layers.mask=de.layers.mask|6,x.layers.mask=O.layers.mask&3,E.layers.mask=O.layers.mask&5;const me=de.parent,he=O.cameras;oe(O,me);for(let Fe=0;Fe<he.length;Fe++)oe(he[Fe],me);he.length===2?J(O,x,E):O.projectionMatrix.copy(x.projectionMatrix),we(de,O,me)};function we(de,X,ce){ce===null?de.matrix.copy(X.matrixWorld):(de.matrix.copy(ce.matrixWorld),de.matrix.invert(),de.matrix.multiply(X.matrixWorld)),de.matrix.decompose(de.position,de.quaternion,de.scale),de.updateMatrixWorld(!0),de.projectionMatrix.copy(X.projectionMatrix),de.projectionMatrixInverse.copy(X.projectionMatrixInverse),de.isPerspectiveCamera&&(de.fov=ru*2*Math.atan(1/de.projectionMatrix.elements[5]),de.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(h===null&&g===null))return l},this.setFoveation=function(de){l=de,h!==null&&(h.fixedFoveation=de),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=de)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(de){return p[de]};let De=null;function rt(de,X){if(u=X.getViewerPose(c||o),_=X,u!==null){const ce=u.views;g!==null&&(e.setRenderTargetFramebuffer(M,g.framebuffer),e.setRenderTarget(M));let me=!1;ce.length!==O.cameras.length&&(O.cameras.length=0,me=!0);for(let z=0;z<ce.length;z++){const q=ce[z];let H=null;if(g!==null)H=g.getViewport(q);else{const W=f.getViewSubImage(h,q);H=W.viewport,z===0&&(e.setRenderTargetTextures(M,W.colorTexture,W.depthStencilTexture),e.setRenderTarget(M))}let D=U[z];D===void 0&&(D=new Ln,D.layers.enable(z),D.viewport=new Vt,U[z]=D),D.matrix.fromArray(q.transform.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale),D.projectionMatrix.fromArray(q.projectionMatrix),D.projectionMatrixInverse.copy(D.projectionMatrix).invert(),D.viewport.set(H.x,H.y,H.width,H.height),z===0&&(O.matrix.copy(D.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),me===!0&&O.cameras.push(D)}const he=s.enabledFeatures;if(he&&he.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=i.getBinding();const z=f.getDepthInformation(ce[0]);z&&z.isValid&&z.texture&&m.init(z,s.renderState)}if(he&&he.includes("camera-access")&&v){e.state.unbindTexture(),f=i.getBinding();for(let z=0;z<ce.length;z++){const q=ce[z].camera;if(q){let H=p[q];H||(H=new Fm,p[q]=H);const D=f.getCameraImage(q);H.sourceTexture=D}}}}for(let ce=0;ce<w.length;ce++){const me=A[ce],he=w[ce];me!==null&&he!==void 0&&he.update(me,X,c||o)}De&&De(de,X),X.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:X}),_=null}const lt=new Om;lt.setAnimationLoop(rt),this.setAnimationLoop=function(de){De=de},this.dispose=function(){}}}const ps=new fi,tN=new Ut;function nN(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Im(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,b,y,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),f(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&g(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,b,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===_n&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===_n&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const b=e.get(p),y=b.envMap,M=b.envMapRotation;y&&(m.envMap.value=y,ps.copy(M),ps.x*=-1,ps.y*=-1,ps.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),m.envMapRotation.value.setFromMatrix4(tN.makeRotationFromEuler(ps)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function g(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===_n&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const b=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function iN(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,y){const M=y.program;i.uniformBlockBinding(b,M)}function c(b,y){let M=s[b.id];M===void 0&&(_(b),M=u(b),s[b.id]=M,b.addEventListener("dispose",m));const w=y.program;i.updateUBOMapping(b,w);const A=e.render.frame;r[b.id]!==A&&(h(b),r[b.id]=A)}function u(b){const y=f();b.__bindingPointIndex=y;const M=n.createBuffer(),w=b.__size,A=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,w,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,M),M}function f(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return gt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){const y=s[b.id],M=b.uniforms,w=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let A=0,T=M.length;A<T;A++){const R=Array.isArray(M[A])?M[A]:[M[A]];for(let x=0,E=R.length;x<E;x++){const U=R[x];if(g(U,A,x,w)===!0){const O=U.__offset,j=Array.isArray(U.value)?U.value:[U.value];let ee=0;for(let te=0;te<j.length;te++){const K=j[te],I=v(K);typeof K=="number"||typeof K=="boolean"?(U.__data[0]=K,n.bufferSubData(n.UNIFORM_BUFFER,O+ee,U.__data)):K.isMatrix3?(U.__data[0]=K.elements[0],U.__data[1]=K.elements[1],U.__data[2]=K.elements[2],U.__data[3]=0,U.__data[4]=K.elements[3],U.__data[5]=K.elements[4],U.__data[6]=K.elements[5],U.__data[7]=0,U.__data[8]=K.elements[6],U.__data[9]=K.elements[7],U.__data[10]=K.elements[8],U.__data[11]=0):(K.toArray(U.__data,ee),ee+=I.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,U.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function g(b,y,M,w){const A=b.value,T=y+"_"+M;if(w[T]===void 0)return typeof A=="number"||typeof A=="boolean"?w[T]=A:w[T]=A.clone(),!0;{const R=w[T];if(typeof A=="number"||typeof A=="boolean"){if(R!==A)return w[T]=A,!0}else if(R.equals(A)===!1)return R.copy(A),!0}return!1}function _(b){const y=b.uniforms;let M=0;const w=16;for(let T=0,R=y.length;T<R;T++){const x=Array.isArray(y[T])?y[T]:[y[T]];for(let E=0,U=x.length;E<U;E++){const O=x[E],j=Array.isArray(O.value)?O.value:[O.value];for(let ee=0,te=j.length;ee<te;ee++){const K=j[ee],I=v(K),F=M%w,$=F%I.boundary,J=F+$;M+=$,J!==0&&w-J<I.storage&&(M+=w-J),O.__data=new Float32Array(I.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=M,M+=I.storage}}}const A=M%w;return A>0&&(M+=w-A),b.__size=M,b.__cache={},this}function v(b){const y={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(y.boundary=4,y.storage=4):b.isVector2?(y.boundary=8,y.storage=8):b.isVector3||b.isColor?(y.boundary=16,y.storage=12):b.isVector4?(y.boundary=16,y.storage=16):b.isMatrix3?(y.boundary=48,y.storage=48):b.isMatrix4?(y.boundary=64,y.storage=64):b.isTexture?Ze("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ze("WebGLRenderer: Unsupported uniform value type.",b),y}function m(b){const y=b.target;y.removeEventListener("dispose",m);const M=o.indexOf(y.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const b in s)n.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}const sN=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Jn=null;function rN(){return Jn===null&&(Jn=new Z3(sN,16,16,dr,Ni),Jn.name="DFG_LUT",Jn.minFilter=on,Jn.magFilter=on,Jn.wrapS=Ai,Jn.wrapT=Ai,Jn.generateMipmaps=!1,Jn.needsUpdate=!0),Jn}class oN{constructor(e={}){const{canvas:t=E3(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:g=Mn}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=o;const v=g,m=new Set([Bu,Ou,ku]),p=new Set([Mn,di,eo,to,Uu,Fu]),b=new Uint32Array(4),y=new Int32Array(4);let M=null,w=null;const A=[],T=[];let R=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let E=!1;this._outputColorSpace=Dn;let U=0,O=0,j=null,ee=-1,te=null;const K=new Vt,I=new Vt;let F=null;const $=new dt(0);let J=0,oe=t.width,we=t.height,De=1,rt=null,lt=null;const de=new Vt(0,0,oe,we),X=new Vt(0,0,oe,we);let ce=!1;const me=new $u;let he=!1,Fe=!1;const k=new Ut,z=new se,q=new Vt,H={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let D=!1;function W(){return j===null?De:1}let L=i;function xe(P,Z){return t.getContext(P,Z)}try{const P={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Du}`),t.addEventListener("webglcontextlost",Je,!1),t.addEventListener("webglcontextrestored",Rt,!1),t.addEventListener("webglcontextcreationerror",St,!1),L===null){const Z="webgl2";if(L=xe(Z,P),L===null)throw xe(Z)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(P){throw gt("WebGLRenderer: "+P.message),P}let pe,fe,ge,C,S,G,re,ue,ie,Le,Se,ke,We,ye,Ae,Re,Oe,Te,nt,Y,Ue,Ee,ze,be;function ve(){pe=new rD(L),pe.init(),Ee=new KL(L,pe),fe=new KI(L,pe,e,Ee),ge=new jL(L,pe),fe.reversedDepthBuffer&&h&&ge.buffers.depth.setReversed(!0),C=new lD(L),S=new LL,G=new YL(L,pe,ge,S,fe,Ee,C),re=new JI(x),ue=new sD(x),ie=new fP(L),ze=new jI(L,ie),Le=new oD(L,ie,C,ze),Se=new uD(L,Le,ie,C),nt=new cD(L,fe,G),Re=new ZI(S),ke=new DL(x,re,ue,pe,fe,ze,Re),We=new nN(x,S),ye=new UL,Ae=new zL(pe),Te=new qI(x,re,ue,ge,Se,_,l),Oe=new XL(x,Se,fe),be=new iN(L,C,fe,ge),Y=new YI(L,pe,C),Ue=new aD(L,pe,C),C.programs=ke.programs,x.capabilities=fe,x.extensions=pe,x.properties=S,x.renderLists=ye,x.shadowMap=Oe,x.state=ge,x.info=C}ve(),v!==Mn&&(R=new fD(v,t.width,t.height,s,r));const Ce=new eN(x,L);this.xr=Ce,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const P=pe.get("WEBGL_lose_context");P&&P.loseContext()},this.forceContextRestore=function(){const P=pe.get("WEBGL_lose_context");P&&P.restoreContext()},this.getPixelRatio=function(){return De},this.setPixelRatio=function(P){P!==void 0&&(De=P,this.setSize(oe,we,!1))},this.getSize=function(P){return P.set(oe,we)},this.setSize=function(P,Z,le=!0){if(Ce.isPresenting){Ze("WebGLRenderer: Can't change size while VR device is presenting.");return}oe=P,we=Z,t.width=Math.floor(P*De),t.height=Math.floor(Z*De),le===!0&&(t.style.width=P+"px",t.style.height=Z+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,P,Z)},this.getDrawingBufferSize=function(P){return P.set(oe*De,we*De).floor()},this.setDrawingBufferSize=function(P,Z,le){oe=P,we=Z,De=le,t.width=Math.floor(P*le),t.height=Math.floor(Z*le),this.setViewport(0,0,P,Z)},this.setEffects=function(P){if(v===Mn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(P){for(let Z=0;Z<P.length;Z++)if(P[Z].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(P||[])},this.getCurrentViewport=function(P){return P.copy(K)},this.getViewport=function(P){return P.copy(de)},this.setViewport=function(P,Z,le,ae){P.isVector4?de.set(P.x,P.y,P.z,P.w):de.set(P,Z,le,ae),ge.viewport(K.copy(de).multiplyScalar(De).round())},this.getScissor=function(P){return P.copy(X)},this.setScissor=function(P,Z,le,ae){P.isVector4?X.set(P.x,P.y,P.z,P.w):X.set(P,Z,le,ae),ge.scissor(I.copy(X).multiplyScalar(De).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(P){ge.setScissorTest(ce=P)},this.setOpaqueSort=function(P){rt=P},this.setTransparentSort=function(P){lt=P},this.getClearColor=function(P){return P.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor(...arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha(...arguments)},this.clear=function(P=!0,Z=!0,le=!0){let ae=0;if(P){let ne=!1;if(j!==null){const Pe=j.texture.format;ne=m.has(Pe)}if(ne){const Pe=j.texture.type,He=p.has(Pe),Ne=Te.getClearColor(),Ge=Te.getClearAlpha(),Xe=Ne.r,Ke=Ne.g,je=Ne.b;He?(b[0]=Xe,b[1]=Ke,b[2]=je,b[3]=Ge,L.clearBufferuiv(L.COLOR,0,b)):(y[0]=Xe,y[1]=Ke,y[2]=je,y[3]=Ge,L.clearBufferiv(L.COLOR,0,y))}else ae|=L.COLOR_BUFFER_BIT}Z&&(ae|=L.DEPTH_BUFFER_BIT),le&&(ae|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(ae)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Je,!1),t.removeEventListener("webglcontextrestored",Rt,!1),t.removeEventListener("webglcontextcreationerror",St,!1),Te.dispose(),ye.dispose(),Ae.dispose(),S.dispose(),re.dispose(),ue.dispose(),Se.dispose(),ze.dispose(),be.dispose(),ke.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",Ku),Ce.removeEventListener("sessionend",Zu),is.stop()};function Je(P){P.preventDefault(),Af("WebGLRenderer: Context Lost."),E=!0}function Rt(){Af("WebGLRenderer: Context Restored."),E=!1;const P=C.autoReset,Z=Oe.enabled,le=Oe.autoUpdate,ae=Oe.needsUpdate,ne=Oe.type;ve(),C.autoReset=P,Oe.enabled=Z,Oe.autoUpdate=le,Oe.needsUpdate=ae,Oe.type=ne}function St(P){gt("WebGLRenderer: A WebGL context could not be created. Reason: ",P.statusMessage)}function Kn(P){const Z=P.target;Z.removeEventListener("dispose",Kn),mi(Z)}function mi(P){Gm(P),S.remove(P)}function Gm(P){const Z=S.get(P).programs;Z!==void 0&&(Z.forEach(function(le){ke.releaseProgram(le)}),P.isShaderMaterial&&ke.releaseShaderCache(P))}this.renderBufferDirect=function(P,Z,le,ae,ne,Pe){Z===null&&(Z=H);const He=ne.isMesh&&ne.matrixWorld.determinant()<0,Ne=Wm(P,Z,le,ae,ne);ge.setMaterial(ae,He);let Ge=le.index,Xe=1;if(ae.wireframe===!0){if(Ge=Le.getWireframeAttribute(le),Ge===void 0)return;Xe=2}const Ke=le.drawRange,je=le.attributes.position;let at=Ke.start*Xe,Et=(Ke.start+Ke.count)*Xe;Pe!==null&&(at=Math.max(at,Pe.start*Xe),Et=Math.min(Et,(Pe.start+Pe.count)*Xe)),Ge!==null?(at=Math.max(at,0),Et=Math.min(Et,Ge.count)):je!=null&&(at=Math.max(at,0),Et=Math.min(Et,je.count));const Ft=Et-at;if(Ft<0||Ft===1/0)return;ze.setup(ne,ae,Ne,le,Ge);let kt,Tt=Y;if(Ge!==null&&(kt=ie.get(Ge),Tt=Ue,Tt.setIndex(kt)),ne.isMesh)ae.wireframe===!0?(ge.setLineWidth(ae.wireframeLinewidth*W()),Tt.setMode(L.LINES)):Tt.setMode(L.TRIANGLES);else if(ne.isLine){let Ye=ae.linewidth;Ye===void 0&&(Ye=1),ge.setLineWidth(Ye*W()),ne.isLineSegments?Tt.setMode(L.LINES):ne.isLineLoop?Tt.setMode(L.LINE_LOOP):Tt.setMode(L.LINE_STRIP)}else ne.isPoints?Tt.setMode(L.POINTS):ne.isSprite&&Tt.setMode(L.TRIANGLES);if(ne.isBatchedMesh)if(ne._multiDrawInstances!==null)no("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Tt.renderMultiDrawInstances(ne._multiDrawStarts,ne._multiDrawCounts,ne._multiDrawCount,ne._multiDrawInstances);else if(pe.get("WEBGL_multi_draw"))Tt.renderMultiDraw(ne._multiDrawStarts,ne._multiDrawCounts,ne._multiDrawCount);else{const Ye=ne._multiDrawStarts,bt=ne._multiDrawCounts,mt=ne._multiDrawCount,xn=Ge?ie.get(Ge).bytesPerElement:1,Rs=S.get(ae).currentProgram.getUniforms();for(let yn=0;yn<mt;yn++)Rs.setValue(L,"_gl_DrawID",yn),Tt.render(Ye[yn]/xn,bt[yn])}else if(ne.isInstancedMesh)Tt.renderInstances(at,Ft,ne.count);else if(le.isInstancedBufferGeometry){const Ye=le._maxInstanceCount!==void 0?le._maxInstanceCount:1/0,bt=Math.min(le.instanceCount,Ye);Tt.renderInstances(at,Ft,bt)}else Tt.render(at,Ft)};function Yu(P,Z,le){P.transparent===!0&&P.side===ii&&P.forceSinglePass===!1?(P.side=_n,P.needsUpdate=!0,vo(P,Z,le),P.side=ts,P.needsUpdate=!0,vo(P,Z,le),P.side=ii):vo(P,Z,le)}this.compile=function(P,Z,le=null){le===null&&(le=P),w=Ae.get(le),w.init(Z),T.push(w),le.traverseVisible(function(ne){ne.isLight&&ne.layers.test(Z.layers)&&(w.pushLight(ne),ne.castShadow&&w.pushShadow(ne))}),P!==le&&P.traverseVisible(function(ne){ne.isLight&&ne.layers.test(Z.layers)&&(w.pushLight(ne),ne.castShadow&&w.pushShadow(ne))}),w.setupLights();const ae=new Set;return P.traverse(function(ne){if(!(ne.isMesh||ne.isPoints||ne.isLine||ne.isSprite))return;const Pe=ne.material;if(Pe)if(Array.isArray(Pe))for(let He=0;He<Pe.length;He++){const Ne=Pe[He];Yu(Ne,le,ne),ae.add(Ne)}else Yu(Pe,le,ne),ae.add(Pe)}),w=T.pop(),ae},this.compileAsync=function(P,Z,le=null){const ae=this.compile(P,Z,le);return new Promise(ne=>{function Pe(){if(ae.forEach(function(He){S.get(He).currentProgram.isReady()&&ae.delete(He)}),ae.size===0){ne(P);return}setTimeout(Pe,10)}pe.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let ja=null;function $m(P){ja&&ja(P)}function Ku(){is.stop()}function Zu(){is.start()}const is=new Om;is.setAnimationLoop($m),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(P){ja=P,Ce.setAnimationLoop(P),P===null?is.stop():is.start()},Ce.addEventListener("sessionstart",Ku),Ce.addEventListener("sessionend",Zu),this.render=function(P,Z){if(Z!==void 0&&Z.isCamera!==!0){gt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;const le=Ce.enabled===!0&&Ce.isPresenting===!0,ae=R!==null&&(j===null||le)&&R.begin(x,j);if(P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),Z.parent===null&&Z.matrixWorldAutoUpdate===!0&&Z.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(Z),Z=Ce.getCamera()),P.isScene===!0&&P.onBeforeRender(x,P,Z,j),w=Ae.get(P,T.length),w.init(Z),T.push(w),k.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),me.setFromProjectionMatrix(k,ri,Z.reversedDepth),Fe=this.localClippingEnabled,he=Re.init(this.clippingPlanes,Fe),M=ye.get(P,A.length),M.init(),A.push(M),Ce.enabled===!0&&Ce.isPresenting===!0){const He=x.xr.getDepthSensingMesh();He!==null&&Ya(He,Z,-1/0,x.sortObjects)}Ya(P,Z,0,x.sortObjects),M.finish(),x.sortObjects===!0&&M.sort(rt,lt),D=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,D&&Te.addToRenderList(M,P),this.info.render.frame++,he===!0&&Re.beginShadows();const ne=w.state.shadowsArray;if(Oe.render(ne,P,Z),he===!0&&Re.endShadows(),this.info.autoReset===!0&&this.info.reset(),(ae&&R.hasRenderPass())===!1){const He=M.opaque,Ne=M.transmissive;if(w.setupLights(),Z.isArrayCamera){const Ge=Z.cameras;if(Ne.length>0)for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe];Qu(He,Ne,P,je)}D&&Te.render(P);for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe];Ju(M,P,je,je.viewport)}}else Ne.length>0&&Qu(He,Ne,P,Z),D&&Te.render(P),Ju(M,P,Z)}j!==null&&O===0&&(G.updateMultisampleRenderTarget(j),G.updateRenderTargetMipmap(j)),ae&&R.end(x),P.isScene===!0&&P.onAfterRender(x,P,Z),ze.resetDefaultState(),ee=-1,te=null,T.pop(),T.length>0?(w=T[T.length-1],he===!0&&Re.setGlobalState(x.clippingPlanes,w.state.camera)):w=null,A.pop(),A.length>0?M=A[A.length-1]:M=null};function Ya(P,Z,le,ae){if(P.visible===!1)return;if(P.layers.test(Z.layers)){if(P.isGroup)le=P.renderOrder;else if(P.isLOD)P.autoUpdate===!0&&P.update(Z);else if(P.isLight)w.pushLight(P),P.castShadow&&w.pushShadow(P);else if(P.isSprite){if(!P.frustumCulled||me.intersectsSprite(P)){ae&&q.setFromMatrixPosition(P.matrixWorld).applyMatrix4(k);const He=Se.update(P),Ne=P.material;Ne.visible&&M.push(P,He,Ne,le,q.z,null)}}else if((P.isMesh||P.isLine||P.isPoints)&&(!P.frustumCulled||me.intersectsObject(P))){const He=Se.update(P),Ne=P.material;if(ae&&(P.boundingSphere!==void 0?(P.boundingSphere===null&&P.computeBoundingSphere(),q.copy(P.boundingSphere.center)):(He.boundingSphere===null&&He.computeBoundingSphere(),q.copy(He.boundingSphere.center)),q.applyMatrix4(P.matrixWorld).applyMatrix4(k)),Array.isArray(Ne)){const Ge=He.groups;for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe],at=Ne[je.materialIndex];at&&at.visible&&M.push(P,He,at,le,q.z,je)}}else Ne.visible&&M.push(P,He,Ne,le,q.z,null)}}const Pe=P.children;for(let He=0,Ne=Pe.length;He<Ne;He++)Ya(Pe[He],Z,le,ae)}function Ju(P,Z,le,ae){const{opaque:ne,transmissive:Pe,transparent:He}=P;w.setupLightsView(le),he===!0&&Re.setGlobalState(x.clippingPlanes,le),ae&&ge.viewport(K.copy(ae)),ne.length>0&&go(ne,Z,le),Pe.length>0&&go(Pe,Z,le),He.length>0&&go(He,Z,le),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function Qu(P,Z,le,ae){if((le.isScene===!0?le.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[ae.id]===void 0){const at=pe.has("EXT_color_buffer_half_float")||pe.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[ae.id]=new li(1,1,{generateMipmaps:!0,type:at?Ni:Mn,minFilter:bs,samples:fe.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ht.workingColorSpace})}const Pe=w.state.transmissionRenderTarget[ae.id],He=ae.viewport||K;Pe.setSize(He.z*x.transmissionResolutionScale,He.w*x.transmissionResolutionScale);const Ne=x.getRenderTarget(),Ge=x.getActiveCubeFace(),Xe=x.getActiveMipmapLevel();x.setRenderTarget(Pe),x.getClearColor($),J=x.getClearAlpha(),J<1&&x.setClearColor(16777215,.5),x.clear(),D&&Te.render(le);const Ke=x.toneMapping;x.toneMapping=ai;const je=ae.viewport;if(ae.viewport!==void 0&&(ae.viewport=void 0),w.setupLightsView(ae),he===!0&&Re.setGlobalState(x.clippingPlanes,ae),go(P,le,ae),G.updateMultisampleRenderTarget(Pe),G.updateRenderTargetMipmap(Pe),pe.has("WEBGL_multisampled_render_to_texture")===!1){let at=!1;for(let Et=0,Ft=Z.length;Et<Ft;Et++){const kt=Z[Et],{object:Tt,geometry:Ye,material:bt,group:mt}=kt;if(bt.side===ii&&Tt.layers.test(ae.layers)){const xn=bt.side;bt.side=_n,bt.needsUpdate=!0,ed(Tt,le,ae,Ye,bt,mt),bt.side=xn,bt.needsUpdate=!0,at=!0}}at===!0&&(G.updateMultisampleRenderTarget(Pe),G.updateRenderTargetMipmap(Pe))}x.setRenderTarget(Ne,Ge,Xe),x.setClearColor($,J),je!==void 0&&(ae.viewport=je),x.toneMapping=Ke}function go(P,Z,le){const ae=Z.isScene===!0?Z.overrideMaterial:null;for(let ne=0,Pe=P.length;ne<Pe;ne++){const He=P[ne],{object:Ne,geometry:Ge,group:Xe}=He;let Ke=He.material;Ke.allowOverride===!0&&ae!==null&&(Ke=ae),Ne.layers.test(le.layers)&&ed(Ne,Z,le,Ge,Ke,Xe)}}function ed(P,Z,le,ae,ne,Pe){P.onBeforeRender(x,Z,le,ae,ne,Pe),P.modelViewMatrix.multiplyMatrices(le.matrixWorldInverse,P.matrixWorld),P.normalMatrix.getNormalMatrix(P.modelViewMatrix),ne.onBeforeRender(x,Z,le,ae,P,Pe),ne.transparent===!0&&ne.side===ii&&ne.forceSinglePass===!1?(ne.side=_n,ne.needsUpdate=!0,x.renderBufferDirect(le,Z,ae,ne,P,Pe),ne.side=ts,ne.needsUpdate=!0,x.renderBufferDirect(le,Z,ae,ne,P,Pe),ne.side=ii):x.renderBufferDirect(le,Z,ae,ne,P,Pe),P.onAfterRender(x,Z,le,ae,ne,Pe)}function vo(P,Z,le){Z.isScene!==!0&&(Z=H);const ae=S.get(P),ne=w.state.lights,Pe=w.state.shadowsArray,He=ne.state.version,Ne=ke.getParameters(P,ne.state,Pe,Z,le),Ge=ke.getProgramCacheKey(Ne);let Xe=ae.programs;ae.environment=P.isMeshStandardMaterial?Z.environment:null,ae.fog=Z.fog,ae.envMap=(P.isMeshStandardMaterial?ue:re).get(P.envMap||ae.environment),ae.envMapRotation=ae.environment!==null&&P.envMap===null?Z.environmentRotation:P.envMapRotation,Xe===void 0&&(P.addEventListener("dispose",Kn),Xe=new Map,ae.programs=Xe);let Ke=Xe.get(Ge);if(Ke!==void 0){if(ae.currentProgram===Ke&&ae.lightsStateVersion===He)return nd(P,Ne),Ke}else Ne.uniforms=ke.getUniforms(P),P.onBeforeCompile(Ne,x),Ke=ke.acquireProgram(Ne,Ge),Xe.set(Ge,Ke),ae.uniforms=Ne.uniforms;const je=ae.uniforms;return(!P.isShaderMaterial&&!P.isRawShaderMaterial||P.clipping===!0)&&(je.clippingPlanes=Re.uniform),nd(P,Ne),ae.needsLights=qm(P),ae.lightsStateVersion=He,ae.needsLights&&(je.ambientLightColor.value=ne.state.ambient,je.lightProbe.value=ne.state.probe,je.directionalLights.value=ne.state.directional,je.directionalLightShadows.value=ne.state.directionalShadow,je.spotLights.value=ne.state.spot,je.spotLightShadows.value=ne.state.spotShadow,je.rectAreaLights.value=ne.state.rectArea,je.ltc_1.value=ne.state.rectAreaLTC1,je.ltc_2.value=ne.state.rectAreaLTC2,je.pointLights.value=ne.state.point,je.pointLightShadows.value=ne.state.pointShadow,je.hemisphereLights.value=ne.state.hemi,je.directionalShadowMap.value=ne.state.directionalShadowMap,je.directionalShadowMatrix.value=ne.state.directionalShadowMatrix,je.spotShadowMap.value=ne.state.spotShadowMap,je.spotLightMatrix.value=ne.state.spotLightMatrix,je.spotLightMap.value=ne.state.spotLightMap,je.pointShadowMap.value=ne.state.pointShadowMap,je.pointShadowMatrix.value=ne.state.pointShadowMatrix),ae.currentProgram=Ke,ae.uniformsList=null,Ke}function td(P){if(P.uniformsList===null){const Z=P.currentProgram.getUniforms();P.uniformsList=ca.seqWithValue(Z.seq,P.uniforms)}return P.uniformsList}function nd(P,Z){const le=S.get(P);le.outputColorSpace=Z.outputColorSpace,le.batching=Z.batching,le.batchingColor=Z.batchingColor,le.instancing=Z.instancing,le.instancingColor=Z.instancingColor,le.instancingMorph=Z.instancingMorph,le.skinning=Z.skinning,le.morphTargets=Z.morphTargets,le.morphNormals=Z.morphNormals,le.morphColors=Z.morphColors,le.morphTargetsCount=Z.morphTargetsCount,le.numClippingPlanes=Z.numClippingPlanes,le.numIntersection=Z.numClipIntersection,le.vertexAlphas=Z.vertexAlphas,le.vertexTangents=Z.vertexTangents,le.toneMapping=Z.toneMapping}function Wm(P,Z,le,ae,ne){Z.isScene!==!0&&(Z=H),G.resetTextureUnits();const Pe=Z.fog,He=ae.isMeshStandardMaterial?Z.environment:null,Ne=j===null?x.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:fr,Ge=(ae.isMeshStandardMaterial?ue:re).get(ae.envMap||He),Xe=ae.vertexColors===!0&&!!le.attributes.color&&le.attributes.color.itemSize===4,Ke=!!le.attributes.tangent&&(!!ae.normalMap||ae.anisotropy>0),je=!!le.morphAttributes.position,at=!!le.morphAttributes.normal,Et=!!le.morphAttributes.color;let Ft=ai;ae.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ft=x.toneMapping);const kt=le.morphAttributes.position||le.morphAttributes.normal||le.morphAttributes.color,Tt=kt!==void 0?kt.length:0,Ye=S.get(ae),bt=w.state.lights;if(he===!0&&(Fe===!0||P!==te)){const ln=P===te&&ae.id===ee;Re.setState(ae,P,ln)}let mt=!1;ae.version===Ye.__version?(Ye.needsLights&&Ye.lightsStateVersion!==bt.state.version||Ye.outputColorSpace!==Ne||ne.isBatchedMesh&&Ye.batching===!1||!ne.isBatchedMesh&&Ye.batching===!0||ne.isBatchedMesh&&Ye.batchingColor===!0&&ne.colorTexture===null||ne.isBatchedMesh&&Ye.batchingColor===!1&&ne.colorTexture!==null||ne.isInstancedMesh&&Ye.instancing===!1||!ne.isInstancedMesh&&Ye.instancing===!0||ne.isSkinnedMesh&&Ye.skinning===!1||!ne.isSkinnedMesh&&Ye.skinning===!0||ne.isInstancedMesh&&Ye.instancingColor===!0&&ne.instanceColor===null||ne.isInstancedMesh&&Ye.instancingColor===!1&&ne.instanceColor!==null||ne.isInstancedMesh&&Ye.instancingMorph===!0&&ne.morphTexture===null||ne.isInstancedMesh&&Ye.instancingMorph===!1&&ne.morphTexture!==null||Ye.envMap!==Ge||ae.fog===!0&&Ye.fog!==Pe||Ye.numClippingPlanes!==void 0&&(Ye.numClippingPlanes!==Re.numPlanes||Ye.numIntersection!==Re.numIntersection)||Ye.vertexAlphas!==Xe||Ye.vertexTangents!==Ke||Ye.morphTargets!==je||Ye.morphNormals!==at||Ye.morphColors!==Et||Ye.toneMapping!==Ft||Ye.morphTargetsCount!==Tt)&&(mt=!0):(mt=!0,Ye.__version=ae.version);let xn=Ye.currentProgram;mt===!0&&(xn=vo(ae,Z,ne));let Rs=!1,yn=!1,_r=!1;const Pt=xn.getUniforms(),mn=Ye.uniforms;if(ge.useProgram(xn.program)&&(Rs=!0,yn=!0,_r=!0),ae.id!==ee&&(ee=ae.id,yn=!0),Rs||te!==P){ge.buffers.depth.getReversed()&&P.reversedDepth!==!0&&(P._reversedDepth=!0,P.updateProjectionMatrix()),Pt.setValue(L,"projectionMatrix",P.projectionMatrix),Pt.setValue(L,"viewMatrix",P.matrixWorldInverse);const gn=Pt.map.cameraPosition;gn!==void 0&&gn.setValue(L,z.setFromMatrixPosition(P.matrixWorld)),fe.logarithmicDepthBuffer&&Pt.setValue(L,"logDepthBufFC",2/(Math.log(P.far+1)/Math.LN2)),(ae.isMeshPhongMaterial||ae.isMeshToonMaterial||ae.isMeshLambertMaterial||ae.isMeshBasicMaterial||ae.isMeshStandardMaterial||ae.isShaderMaterial)&&Pt.setValue(L,"isOrthographic",P.isOrthographicCamera===!0),te!==P&&(te=P,yn=!0,_r=!0)}if(Ye.needsLights&&(bt.state.directionalShadowMap.length>0&&Pt.setValue(L,"directionalShadowMap",bt.state.directionalShadowMap,G),bt.state.spotShadowMap.length>0&&Pt.setValue(L,"spotShadowMap",bt.state.spotShadowMap,G),bt.state.pointShadowMap.length>0&&Pt.setValue(L,"pointShadowMap",bt.state.pointShadowMap,G)),ne.isSkinnedMesh){Pt.setOptional(L,ne,"bindMatrix"),Pt.setOptional(L,ne,"bindMatrixInverse");const ln=ne.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),Pt.setValue(L,"boneTexture",ln.boneTexture,G))}ne.isBatchedMesh&&(Pt.setOptional(L,ne,"batchingTexture"),Pt.setValue(L,"batchingTexture",ne._matricesTexture,G),Pt.setOptional(L,ne,"batchingIdTexture"),Pt.setValue(L,"batchingIdTexture",ne._indirectTexture,G),Pt.setOptional(L,ne,"batchingColorTexture"),ne._colorsTexture!==null&&Pt.setValue(L,"batchingColorTexture",ne._colorsTexture,G));const Rn=le.morphAttributes;if((Rn.position!==void 0||Rn.normal!==void 0||Rn.color!==void 0)&&nt.update(ne,le,xn),(yn||Ye.receiveShadow!==ne.receiveShadow)&&(Ye.receiveShadow=ne.receiveShadow,Pt.setValue(L,"receiveShadow",ne.receiveShadow)),ae.isMeshGouraudMaterial&&ae.envMap!==null&&(mn.envMap.value=Ge,mn.flipEnvMap.value=Ge.isCubeTexture&&Ge.isRenderTargetTexture===!1?-1:1),ae.isMeshStandardMaterial&&ae.envMap===null&&Z.environment!==null&&(mn.envMapIntensity.value=Z.environmentIntensity),mn.dfgLUT!==void 0&&(mn.dfgLUT.value=rN()),yn&&(Pt.setValue(L,"toneMappingExposure",x.toneMappingExposure),Ye.needsLights&&Xm(mn,_r),Pe&&ae.fog===!0&&We.refreshFogUniforms(mn,Pe),We.refreshMaterialUniforms(mn,ae,De,we,w.state.transmissionRenderTarget[P.id]),ca.upload(L,td(Ye),mn,G)),ae.isShaderMaterial&&ae.uniformsNeedUpdate===!0&&(ca.upload(L,td(Ye),mn,G),ae.uniformsNeedUpdate=!1),ae.isSpriteMaterial&&Pt.setValue(L,"center",ne.center),Pt.setValue(L,"modelViewMatrix",ne.modelViewMatrix),Pt.setValue(L,"normalMatrix",ne.normalMatrix),Pt.setValue(L,"modelMatrix",ne.matrixWorld),ae.isShaderMaterial||ae.isRawShaderMaterial){const ln=ae.uniformsGroups;for(let gn=0,Ka=ln.length;gn<Ka;gn++){const ss=ln[gn];be.update(ss,xn),be.bind(ss,xn)}}return xn}function Xm(P,Z){P.ambientLightColor.needsUpdate=Z,P.lightProbe.needsUpdate=Z,P.directionalLights.needsUpdate=Z,P.directionalLightShadows.needsUpdate=Z,P.pointLights.needsUpdate=Z,P.pointLightShadows.needsUpdate=Z,P.spotLights.needsUpdate=Z,P.spotLightShadows.needsUpdate=Z,P.rectAreaLights.needsUpdate=Z,P.hemisphereLights.needsUpdate=Z}function qm(P){return P.isMeshLambertMaterial||P.isMeshToonMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isShadowMaterial||P.isShaderMaterial&&P.lights===!0}this.getActiveCubeFace=function(){return U},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(P,Z,le){const ae=S.get(P);ae.__autoAllocateDepthBuffer=P.resolveDepthBuffer===!1,ae.__autoAllocateDepthBuffer===!1&&(ae.__useRenderToTexture=!1),S.get(P.texture).__webglTexture=Z,S.get(P.depthTexture).__webglTexture=ae.__autoAllocateDepthBuffer?void 0:le,ae.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(P,Z){const le=S.get(P);le.__webglFramebuffer=Z,le.__useDefaultFramebuffer=Z===void 0};const jm=L.createFramebuffer();this.setRenderTarget=function(P,Z=0,le=0){j=P,U=Z,O=le;let ae=null,ne=!1,Pe=!1;if(P){const Ne=S.get(P);if(Ne.__useDefaultFramebuffer!==void 0){ge.bindFramebuffer(L.FRAMEBUFFER,Ne.__webglFramebuffer),K.copy(P.viewport),I.copy(P.scissor),F=P.scissorTest,ge.viewport(K),ge.scissor(I),ge.setScissorTest(F),ee=-1;return}else if(Ne.__webglFramebuffer===void 0)G.setupRenderTarget(P);else if(Ne.__hasExternalTextures)G.rebindTextures(P,S.get(P.texture).__webglTexture,S.get(P.depthTexture).__webglTexture);else if(P.depthBuffer){const Ke=P.depthTexture;if(Ne.__boundDepthTexture!==Ke){if(Ke!==null&&S.has(Ke)&&(P.width!==Ke.image.width||P.height!==Ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");G.setupDepthRenderbuffer(P)}}const Ge=P.texture;(Ge.isData3DTexture||Ge.isDataArrayTexture||Ge.isCompressedArrayTexture)&&(Pe=!0);const Xe=S.get(P).__webglFramebuffer;P.isWebGLCubeRenderTarget?(Array.isArray(Xe[Z])?ae=Xe[Z][le]:ae=Xe[Z],ne=!0):P.samples>0&&G.useMultisampledRTT(P)===!1?ae=S.get(P).__webglMultisampledFramebuffer:Array.isArray(Xe)?ae=Xe[le]:ae=Xe,K.copy(P.viewport),I.copy(P.scissor),F=P.scissorTest}else K.copy(de).multiplyScalar(De).floor(),I.copy(X).multiplyScalar(De).floor(),F=ce;if(le!==0&&(ae=jm),ge.bindFramebuffer(L.FRAMEBUFFER,ae)&&ge.drawBuffers(P,ae),ge.viewport(K),ge.scissor(I),ge.setScissorTest(F),ne){const Ne=S.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+Z,Ne.__webglTexture,le)}else if(Pe){const Ne=Z;for(let Ge=0;Ge<P.textures.length;Ge++){const Xe=S.get(P.textures[Ge]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Ge,Xe.__webglTexture,le,Ne)}}else if(P!==null&&le!==0){const Ne=S.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ne.__webglTexture,le)}ee=-1},this.readRenderTargetPixels=function(P,Z,le,ae,ne,Pe,He,Ne=0){if(!(P&&P.isWebGLRenderTarget)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=S.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&He!==void 0&&(Ge=Ge[He]),Ge){ge.bindFramebuffer(L.FRAMEBUFFER,Ge);try{const Xe=P.textures[Ne],Ke=Xe.format,je=Xe.type;if(!fe.textureFormatReadable(Ke)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!fe.textureTypeReadable(je)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Z>=0&&Z<=P.width-ae&&le>=0&&le<=P.height-ne&&(P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ne),L.readPixels(Z,le,ae,ne,Ee.convert(Ke),Ee.convert(je),Pe))}finally{const Xe=j!==null?S.get(j).__webglFramebuffer:null;ge.bindFramebuffer(L.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(P,Z,le,ae,ne,Pe,He,Ne=0){if(!(P&&P.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=S.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&He!==void 0&&(Ge=Ge[He]),Ge)if(Z>=0&&Z<=P.width-ae&&le>=0&&le<=P.height-ne){ge.bindFramebuffer(L.FRAMEBUFFER,Ge);const Xe=P.textures[Ne],Ke=Xe.format,je=Xe.type;if(!fe.textureFormatReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!fe.textureTypeReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const at=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,at),L.bufferData(L.PIXEL_PACK_BUFFER,Pe.byteLength,L.STREAM_READ),P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ne),L.readPixels(Z,le,ae,ne,Ee.convert(Ke),Ee.convert(je),0);const Et=j!==null?S.get(j).__webglFramebuffer:null;ge.bindFramebuffer(L.FRAMEBUFFER,Et);const Ft=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await w3(L,Ft,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,at),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Pe),L.deleteBuffer(at),L.deleteSync(Ft),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(P,Z=null,le=0){const ae=Math.pow(2,-le),ne=Math.floor(P.image.width*ae),Pe=Math.floor(P.image.height*ae),He=Z!==null?Z.x:0,Ne=Z!==null?Z.y:0;G.setTexture2D(P,0),L.copyTexSubImage2D(L.TEXTURE_2D,le,0,0,He,Ne,ne,Pe),ge.unbindTexture()};const Ym=L.createFramebuffer(),Km=L.createFramebuffer();this.copyTextureToTexture=function(P,Z,le=null,ae=null,ne=0,Pe=null){Pe===null&&(ne!==0?(no("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Pe=ne,ne=0):Pe=0);let He,Ne,Ge,Xe,Ke,je,at,Et,Ft;const kt=P.isCompressedTexture?P.mipmaps[Pe]:P.image;if(le!==null)He=le.max.x-le.min.x,Ne=le.max.y-le.min.y,Ge=le.isBox3?le.max.z-le.min.z:1,Xe=le.min.x,Ke=le.min.y,je=le.isBox3?le.min.z:0;else{const Rn=Math.pow(2,-ne);He=Math.floor(kt.width*Rn),Ne=Math.floor(kt.height*Rn),P.isDataArrayTexture?Ge=kt.depth:P.isData3DTexture?Ge=Math.floor(kt.depth*Rn):Ge=1,Xe=0,Ke=0,je=0}ae!==null?(at=ae.x,Et=ae.y,Ft=ae.z):(at=0,Et=0,Ft=0);const Tt=Ee.convert(Z.format),Ye=Ee.convert(Z.type);let bt;Z.isData3DTexture?(G.setTexture3D(Z,0),bt=L.TEXTURE_3D):Z.isDataArrayTexture||Z.isCompressedArrayTexture?(G.setTexture2DArray(Z,0),bt=L.TEXTURE_2D_ARRAY):(G.setTexture2D(Z,0),bt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,Z.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,Z.unpackAlignment);const mt=L.getParameter(L.UNPACK_ROW_LENGTH),xn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Rs=L.getParameter(L.UNPACK_SKIP_PIXELS),yn=L.getParameter(L.UNPACK_SKIP_ROWS),_r=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,kt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,kt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Xe),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ke),L.pixelStorei(L.UNPACK_SKIP_IMAGES,je);const Pt=P.isDataArrayTexture||P.isData3DTexture,mn=Z.isDataArrayTexture||Z.isData3DTexture;if(P.isDepthTexture){const Rn=S.get(P),ln=S.get(Z),gn=S.get(Rn.__renderTarget),Ka=S.get(ln.__renderTarget);ge.bindFramebuffer(L.READ_FRAMEBUFFER,gn.__webglFramebuffer),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,Ka.__webglFramebuffer);for(let ss=0;ss<Ge;ss++)Pt&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,S.get(P).__webglTexture,ne,je+ss),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,S.get(Z).__webglTexture,Pe,Ft+ss)),L.blitFramebuffer(Xe,Ke,He,Ne,at,Et,He,Ne,L.DEPTH_BUFFER_BIT,L.NEAREST);ge.bindFramebuffer(L.READ_FRAMEBUFFER,null),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(ne!==0||P.isRenderTargetTexture||S.has(P)){const Rn=S.get(P),ln=S.get(Z);ge.bindFramebuffer(L.READ_FRAMEBUFFER,Ym),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,Km);for(let gn=0;gn<Ge;gn++)Pt?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Rn.__webglTexture,ne,je+gn):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Rn.__webglTexture,ne),mn?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ln.__webglTexture,Pe,Ft+gn):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ln.__webglTexture,Pe),ne!==0?L.blitFramebuffer(Xe,Ke,He,Ne,at,Et,He,Ne,L.COLOR_BUFFER_BIT,L.NEAREST):mn?L.copyTexSubImage3D(bt,Pe,at,Et,Ft+gn,Xe,Ke,He,Ne):L.copyTexSubImage2D(bt,Pe,at,Et,Xe,Ke,He,Ne);ge.bindFramebuffer(L.READ_FRAMEBUFFER,null),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else mn?P.isDataTexture||P.isData3DTexture?L.texSubImage3D(bt,Pe,at,Et,Ft,He,Ne,Ge,Tt,Ye,kt.data):Z.isCompressedArrayTexture?L.compressedTexSubImage3D(bt,Pe,at,Et,Ft,He,Ne,Ge,Tt,kt.data):L.texSubImage3D(bt,Pe,at,Et,Ft,He,Ne,Ge,Tt,Ye,kt):P.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Pe,at,Et,He,Ne,Tt,Ye,kt.data):P.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Pe,at,Et,kt.width,kt.height,Tt,kt.data):L.texSubImage2D(L.TEXTURE_2D,Pe,at,Et,He,Ne,Tt,Ye,kt);L.pixelStorei(L.UNPACK_ROW_LENGTH,mt),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,xn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Rs),L.pixelStorei(L.UNPACK_SKIP_ROWS,yn),L.pixelStorei(L.UNPACK_SKIP_IMAGES,_r),Pe===0&&Z.generateMipmaps&&L.generateMipmap(bt),ge.unbindTexture()},this.initRenderTarget=function(P){S.get(P).__webglFramebuffer===void 0&&G.setupRenderTarget(P)},this.initTexture=function(P){P.isCubeTexture?G.setTextureCube(P,0):P.isData3DTexture?G.setTexture3D(P,0):P.isDataArrayTexture||P.isCompressedArrayTexture?G.setTexture2DArray(P,0):G.setTexture2D(P,0),ge.unbindTexture()},this.resetState=function(){U=0,O=0,j=null,ge.reset(),ze.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ht._getDrawingBufferColorSpace(e),t.unpackColorSpace=ht._getUnpackColorSpace()}}const aN={class:"fishing-page"},lN={class:"fishing-header"},cN={class:"score-display"},uN={class:"score-value"},dN={class:"fishing-container"},fN={class:"game-controls"},hN=["disabled"],pN={class:"caught-fish"},mN={key:0,class:"empty-catch"},gN={key:1,class:"fish-list"},vN=tt({__name:"FishingPage",setup(n){const e=Q(null),t=Q(!1),i=Q(0),s=Q([]),r=Q(null),o=Q(null),a=Q(null);let l=null,c=null,u=null,f=[],h=[];const g=[{color:16739179,name:"Red Snapper",points:10},{color:5164484,name:"Coral Fish",points:15},{color:16770669,name:"Golden Fish",points:20},{color:9822675,name:"Jellyfish",points:25},{color:14524637,name:"Tropical Fish",points:30}],_=()=>{if(!e.value)return;r.value=new K3,r.value.background=new dt(30654),r.value.fog=new Gu(30654,10,50),o.value=new Ln(75,e.value.clientWidth/e.value.clientHeight,.1,1e3),o.value.position.set(0,5,10),o.value.lookAt(0,0,0),a.value=new oN({antialias:!0}),a.value.setSize(e.value.clientWidth,e.value.clientHeight),a.value.setPixelRatio(window.devicePixelRatio),e.value.appendChild(a.value.domElement);const A=new cP(16777215,.5);r.value.add(A);const T=new lP(16777215,1);T.position.set(5,10,5),r.value.add(T);const R=new mo(50,50,32,32),x=new Vl({color:27028,transparent:!0,opacity:.8,side:ii}),E=new wn(R,x);E.rotation.x=-Math.PI/2,E.position.y=-.5,r.value.add(E),v();for(let U=0;U<8;U++)m();window.addEventListener("resize",M)},v=()=>{if(!r.value)return;const A=new Xu(.2,.05,8,16),T=new Vl({color:3355443});c=new wn(A,T),c.position.set(0,2,0),r.value.add(c);const R=new Cn().setFromPoints([new se(0,5,0),c.position]),x=new Um({color:3355443,linewidth:2});u=new tP(R,x),r.value.add(u)},m=()=>{if(!r.value)return;const A=g[Math.floor(Math.random()*g.length)],T=new Nr,R=new wa(.3,1,8);R.rotateZ(Math.PI/2);const x=new Vl({color:A.color}),E=new wn(R,x);T.add(E);const U=new wa(.2,.3,4);U.rotateZ(-Math.PI/2);const O=new wn(U,x);O.position.x=-.6,T.add(O),T.position.set((Math.random()-.5)*20,-2-Math.random()*3,(Math.random()-.5)*15),T.rotation.y=Math.random()*Math.PI*2,T.userData={...A,id:f.length},r.value.add(T),f.push(T),h.push({x:(Math.random()-.5)*.02,z:(Math.random()-.5)*.02})},p=()=>{if(l=requestAnimationFrame(p),!(!r.value||!o.value||!a.value||!c)){if(f.forEach((A,T)=>{A.position.x+=h[T].x,A.position.z+=h[T].z,Math.abs(A.position.x)>10&&(h[T].x*=-1),Math.abs(A.position.z)>8&&(h[T].z*=-1),A.rotation.z=Math.sin(Date.now()*.005+T)*.2}),u){const A=u.geometry.attributes.position.array;A[3]=c.position.x,A[4]=c.position.y,A[5]=c.position.z(u.geometry).attributes.position.needsUpdate=!0}a.value.render(r.value,o.value)}},b=()=>{if(!c||!t.value)return;t.value=!0;const A=c.position.y,T=-4;let R=0;const x=()=>{var U;R+=.05,c.position.y=A-(A-T)*R;const E=f.findIndex(O=>c.position.distanceTo(O.position)<.8);if(E!==-1){const O=f[E];i.value+=O.userData.points,O.value.push(O.userData.name),(U=r.value)==null||U.remove(O),f.splice(E,1),h.splice(E,1),setTimeout(()=>m(),2e3),y(A);return}R<1?requestAnimationFrame(x):y(A)};x()},y=A=>{if(!c)return;let T=0;const R=c.position.y,x=()=>{T+=.08,c.position.y=R+(A-R)*T,T<1?requestAnimationFrame(x):t.value=!1};x()},M=()=>{!o.value||!a.value||!e.value||(o.value.aspect=e.value.clientWidth/e.value.clientHeight,o.value.updateProjectionMatrix(),a.value.setSize(e.value.clientWidth,e.value.clientHeight))},w=()=>{t.value||b()};return Ct(()=>{_(),p()}),Yn(()=>{var A;l!==null&&cancelAnimationFrame(l),window.removeEventListener("resize",M),(A=a.value)==null||A.dispose()}),(A,T)=>(N(),V("div",aN,[d("div",lN,[T[1]||(T[1]=d("h1",null,"🎣 Fishing Mini Game",-1)),d("div",cN,[T[0]||(T[0]=d("span",{class:"score-label"},"Score:",-1)),d("span",uN,B(i.value),1)])]),d("div",dN,[d("div",{ref_key:"container",ref:e,class:"game-container"},null,512),d("div",fN,[d("button",{onClick:w,disabled:t.value,class:Be(["cast-button",{active:t.value}])},B(t.value?"🎣 Fishing...":"🎣 Cast Line"),11,hN)])]),d("div",pN,[T[2]||(T[2]=d("h2",null,"Caught Fish 🐟",-1)),s.value.length===0?(N(),V("div",mN," No fish caught yet. Cast your line! ")):(N(),V("div",gN,[(N(!0),V($e,null,et(s.value,(R,x)=>(N(),V("div",{key:x,class:"fish-item"}," 🐟 "+B(R),1))),128))]))])]))}}),_N=ct(vN,[["__scopeId","data-v-40765bfc"]]),xN={class:"character-tinder-page"},yN={class:"page-header"},SN={class:"header-actions"},bN={key:0,class:"vote-result-popup"},MN={class:"vote-result-content"},EN={class:"winner-result"},wN={class:"elo-change"},TN={class:"loser-result"},AN={class:"elo-change"},CN={key:1,class:"voting-section"},RN={key:0,class:"loading"},PN={key:1,class:"empty-state"},IN={key:2,class:"character-pair"},DN=["onClick"],LN={class:"character-image"},NN=["src","alt"],UN={key:1,class:"placeholder-image"},FN={class:"character-info"},kN={class:"character-stats"},ON={class:"elo"},BN={class:"record"},VN={key:2,class:"leaderboard-section"},zN={key:0,class:"loading"},HN={key:1,class:"empty-state"},GN={key:2,class:"leaderboard"},$N={class:"rank"},WN={key:0},XN={key:1},qN={key:2},jN={key:3},YN={class:"character-display"},KN={class:"character-avatar"},ZN=["src","alt"],JN={key:1,class:"avatar-placeholder"},QN={class:"character-details"},eU={class:"stats"},tU={class:"elo"},nU={class:"record"},iU={class:"form-group"},sU={class:"form-group"},rU={class:"form-actions"},oU=["disabled"],aU=["disabled"],lU=tt({__name:"CharacterTinderPage",setup(n){const e=Q([]),t=Q(null),i=Q(!1),s=Q(!1),r=Q(!1),o=Q(!1),a=Q({name:"",image_url:""}),l=Q(null),c=Q(!1),u=async()=>{r.value=!0;try{const v=await(await fetch("/api/characters")).json();e.value=v.characters||[]}catch(_){console.error("Error loading characters:",_)}finally{r.value=!1}},f=async()=>{r.value=!0;try{const v=await(await fetch("/api/characters/random-pair")).json();v.characters&&v.characters.length>=2?t.value=[v.characters[0],v.characters[1]]:t.value=null}catch(_){console.error("Error loading random pair:",_),t.value=null}finally{r.value=!1}},h=async _=>{if(!t.value||o.value)return;const v=t.value.find(m=>m.id!==_);if(v){o.value=!0;try{const p=await(await fetch("/api/characters/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({winner_id:_,loser_id:v.id})})).json();l.value=p,c.value=!0,setTimeout(async()=>{await u(),await f(),c.value=!1},1500)}catch(m){console.error("Error voting:",m)}finally{o.value=!1}}},g=async()=>{if(a.value.name.trim()){r.value=!0;try{if(!(await fetch("/api/characters",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a.value.name.trim(),image_url:a.value.image_url.trim()||null})})).ok)throw new Error("Failed to add character");a.value={name:"",image_url:""},i.value=!1,await u(),await f()}catch(_){console.error("Error adding character:",_)}finally{r.value=!1}}};return Ct(async()=>{await u(),await f()}),(_,v)=>(N(),V("div",xN,[d("div",yN,[v[7]||(v[7]=d("h1",null,"🎭 Fictional Character Tinder",-1)),v[8]||(v[8]=d("p",null,"Vote for your favorite characters and see who reigns supreme!",-1)),d("div",SN,[d("button",{onClick:v[0]||(v[0]=m=>i.value=!0),class:"action-btn add-btn"}," ➕ Add Character "),d("button",{onClick:v[1]||(v[1]=m=>s.value=!s.value),class:"action-btn leaderboard-btn"},B(s.value?"🎮 Start Voting":"🏆 Leaderboard"),1)])]),c.value&&l.value?(N(),V("div",bN,[d("div",MN,[d("div",EN,[d("h3",null,"🏆 "+B(l.value.winner.name)+" wins!",1),d("p",wN,"+"+B(l.value.elo_change_winner)+" ELO",1)]),d("div",TN,[d("h3",null,"💔 "+B(l.value.loser.name),1),d("p",AN,B(l.value.elo_change_loser)+" ELO",1)])])])):Me("",!0),s.value?Me("",!0):(N(),V("div",CN,[r.value?(N(),V("div",RN," Loading characters... ")):t.value?(N(),V("div",IN,[(N(!0),V($e,null,et(t.value,m=>(N(),V("div",{key:m.id,class:Be(["character-card",{voting:o.value}]),onClick:p=>h(m.id)},[d("div",LN,[m.image_url?(N(),V("img",{key:0,src:m.image_url,alt:m.name},null,8,NN)):(N(),V("div",UN,[...v[11]||(v[11]=[d("span",{class:"placeholder-emoji"},"🎭",-1)])]))]),d("div",FN,[d("h3",null,B(m.name),1),d("div",kN,[d("span",ON,"⭐ "+B(m.elo_rating)+" ELO",1),d("span",BN,B(m.wins)+"W - "+B(m.losses)+"L",1)])])],10,DN))),128))])):(N(),V("div",PN,[v[9]||(v[9]=d("h2",null,"🎭 No characters yet!",-1)),v[10]||(v[10]=d("p",null,"Be the first to add a character to start voting.",-1)),d("button",{onClick:v[2]||(v[2]=m=>i.value=!0),class:"add-first-btn"}," ➕ Add First Character ")]))])),s.value?(N(),V("div",VN,[r.value?(N(),V("div",zN," Loading leaderboard... ")):e.value.length===0?(N(),V("div",HN,[...v[12]||(v[12]=[d("h2",null,"🏆 Leaderboard",-1),d("p",null,"No characters yet. Add some to start the competition!",-1)])])):(N(),V("div",GN,[(N(!0),V($e,null,et(e.value,(m,p)=>(N(),V("div",{key:m.id,class:Be(["leaderboard-item",{"top-3":p<3}])},[d("div",$N,[p===0?(N(),V("span",WN,"🥇")):p===1?(N(),V("span",XN,"🥈")):p===2?(N(),V("span",qN,"🥉")):(N(),V("span",jN,B(p+1),1))]),d("div",YN,[d("div",KN,[m.image_url?(N(),V("img",{key:0,src:m.image_url,alt:m.name},null,8,ZN)):(N(),V("div",JN,"🎭"))]),d("div",QN,[d("h4",null,B(m.name),1),d("div",eU,[d("span",tU,"⭐ "+B(m.elo_rating),1),d("span",nU,B(m.wins)+"W - "+B(m.losses)+"L",1)])])])],2))),128))]))])):Me("",!0),pt(ia,{"is-open":i.value,title:"Add New Character",onClose:v[6]||(v[6]=m=>i.value=!1)},{default:Nn(()=>[d("form",{onSubmit:co(g,["prevent"]),class:"add-character-form"},[d("div",iU,[v[13]||(v[13]=d("label",{for:"name"},"Character Name *",-1)),_t(d("input",{id:"name","onUpdate:modelValue":v[3]||(v[3]=m=>a.value.name=m),type:"text",placeholder:"e.g., Batman, Spider-Man, Wonder Woman",required:""},null,512),[[Lt,a.value.name]])]),d("div",sU,[v[14]||(v[14]=d("label",{for:"image_url"},"Image URL (optional)",-1)),_t(d("input",{id:"image_url","onUpdate:modelValue":v[4]||(v[4]=m=>a.value.image_url=m),type:"url",placeholder:"https://example.com/image.jpg"},null,512),[[Lt,a.value.image_url]])]),d("div",rU,[d("button",{type:"button",onClick:v[5]||(v[5]=m=>i.value=!1),class:"cancel-btn",disabled:r.value}," Cancel ",8,oU),d("button",{type:"submit",class:"submit-btn",disabled:r.value||!a.value.name.trim()},B(r.value?"Adding...":"Add Character"),9,aU)])],32)]),_:1},8,["is-open"])]))}}),cU=ct(lU,[["__scopeId","data-v-b71e856d"]]),uU={class:"theme-selector"},dU=["onClick"],fU={class:"regenerate-section"},hU=["disabled"],pU={key:0,class:"wordcloud-loading"},mU={key:1,class:"wordcloud-error"},gU={key:2,class:"wordcloud-container"},vU={class:"wordcloud"},_U=tt({__name:"WordCloudPage",setup(n){const e=Qt(),t=Q([]),i=Q(!1),s=Q(null),r={technology:[{text:"AI",weight:10},{text:"Code",weight:9},{text:"Robot",weight:8},{text:"Data",weight:7},{text:"Cloud",weight:6},{text:"App",weight:5},{text:"Web",weight:4},{text:"Tech",weight:3},{text:"Software",weight:2},{text:"Digital",weight:1}],nature:[{text:"Ocean",weight:10},{text:"Forest",weight:9},{text:"Mountain",weight:8},{text:"River",weight:7},{text:"Cloud",weight:6},{text:"Sun",weight:5},{text:"Moon",weight:4},{text:"Star",weight:3},{text:"Tree",weight:2},{text:"Flower",weight:1}],animals:[{text:"Elephant",weight:10},{text:"Tiger",weight:9},{text:"Dolphin",weight:8},{text:"Eagle",weight:7},{text:"Wolf",weight:6},{text:"Fox",weight:5},{text:"Bear",weight:4},{text:"Lion",weight:3},{text:"Cat",weight:2},{text:"Dog",weight:1}],music:[{text:"Melody",weight:10},{text:"Rhythm",weight:9},{text:"Harmony",weight:8},{text:"Beat",weight:7},{text:"Tempo",weight:6},{text:"Note",weight:5},{text:"Chord",weight:4},{text:"Sound",weight:3},{text:"Song",weight:2},{text:"Music",weight:1}]},o=["#ff6b9d","#ff8a80","#ffd89b","#87ceeb","#a0e7e5","#b4f8c8","#fbc2eb","#a6c1ee","#d4a5a5","#f5f5dc"];let a="technology";const l=()=>{i.value=!0,s.value=null;try{const f=r[a],h=[];f.forEach((_,v)=>{const m={text:_.text,weight:_.weight,color:o[Math.floor(Math.random()*o.length)],x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15};h.push(m)}),h.slice(0,3).forEach(_=>{h.push({..._,x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15})}),t.value=h.sort((_,v)=>v.weight-_.weight)}catch(f){s.value="Failed to generate word cloud",console.error("Error generating word cloud:",f)}finally{i.value=!1}},c=f=>{a=f,l()};Ct(()=>{l()});const u=f=>({fontSize:`${Math.max(1.5,f.weight*.8)}rem`,color:f.color,left:`${f.x}%`,top:`${f.y}%`,transform:`rotate(${f.rotation}deg)`,opacity:f.weight/10+.2});return(f,h)=>(N(),V("div",{class:Be(["wordcloud-page",{dark:_e(e).darkMode}])},[h[2]||(h[2]=d("div",{class:"wordcloud-header"},[d("h1",null,"☁️ Word Cloud"),d("p",{class:"subtitle"},"Visualize words in a beautiful cloud format")],-1)),d("div",uU,[(N(),V($e,null,et(r,(g,_)=>d("button",{key:_,class:Be(["theme-button",{active:_e(a)===_}]),onClick:v=>c(_)},B(_.charAt(0).toUpperCase()+_.slice(1)),11,dU)),64))]),d("div",fU,[d("button",{class:"regenerate-button",onClick:l,disabled:i.value}," 🔄 "+B(i.value?"Generating...":"Regenerate Cloud"),9,hU)]),i.value?(N(),V("div",pU,[...h[0]||(h[0]=[d("span",{class:"loading-spinner"},"⏳",-1),d("p",null,"Generating word cloud...",-1)])])):s.value?(N(),V("div",mU,[h[1]||(h[1]=d("span",{class:"error-icon"},"⚠️",-1)),d("p",null,B(s.value),1),d("button",{class:"retry-button",onClick:l},"🔄 Try Again")])):(N(),V("div",gU,[d("div",vU,[(N(!0),V($e,null,et(t.value,(g,_)=>(N(),V("div",{key:_,class:"word",style:Dt(u(g))},B(g.text),5))),128))])])),h[3]||(h[3]=d("div",{class:"footer-note"},[d("p",null,"💡 Click on different themes to see word clouds for various topics"),d("p",null,"🎨 Word size and opacity based on importance weight")],-1))],2))}}),xU=ct(_U,[["__scopeId","data-v-162f93d3"]]),yU={class:"keanu-container"},SU={class:"controls"},bU={class:"size-controls"},MU={class:"size-control"},EU=["disabled"],wU={class:"size-control"},TU=["disabled"],AU={class:"buttons"},CU=["disabled"],RU=["disabled"],PU={class:"image-container"},IU={key:0,class:"loading-spinner"},DU=["src"],LU={key:2,class:"placeholder"},NU={class:"info-box"},UU=tt({__name:"KeanuPage",setup(n){const e=Qt(),t=Q(""),i=Q(!1),s=Q(400),r=Q(400),o=async()=>{i.value=!0;try{t.value=`https://placekeanu.com/${s.value}/${r.value}`,await new Promise(c=>{const u=new Image;u.onload=c,u.onerror=c,u.src=t.value})}catch(c){console.error("Error fetching Keanu image:",c)}finally{i.value=!1}},a=()=>{s.value=Math.floor(Math.random()*400)+200,r.value=Math.floor(Math.random()*400)+200,o()},l=()=>{o()};return Ct(()=>{o()}),(c,u)=>(N(),V("div",{class:Be(["keanu-page",{dark:_e(e).darkMode}])},[u[4]||(u[4]=d("div",{class:"keanu-header"},[d("h1",null,"🎬 PlaceKeanu"),d("p",{class:"subtitle"},"Random Keanu Reeves images!")],-1)),d("div",yU,[d("div",SU,[d("div",bU,[d("div",MU,[d("label",null,"Width: "+B(s.value)+"px",1),_t(d("input",{type:"range","onUpdate:modelValue":u[0]||(u[0]=f=>s.value=f),min:"200",max:"600",step:"10",onChange:o,disabled:i.value},null,40,EU),[[Lt,s.value]])]),d("div",wU,[d("label",null,"Height: "+B(r.value)+"px",1),_t(d("input",{type:"range","onUpdate:modelValue":u[1]||(u[1]=f=>r.value=f),min:"200",max:"600",step:"10",onChange:o,disabled:i.value},null,40,TU),[[Lt,r.value]])])]),d("div",AU,[d("button",{onClick:a,class:"btn btn-random",disabled:i.value}," 🎲 Random Size ",8,CU),d("button",{onClick:l,class:"btn btn-refresh",disabled:i.value}," 🔄 Refresh ",8,RU)])]),d("div",PU,[i.value?(N(),V("div",IU)):Me("",!0),t.value&&!i.value?(N(),V("img",{key:1,src:t.value,alt:"Keanu Reeves",class:Be(["keanu-image",{loaded:t.value}])},null,10,DU)):Me("",!0),!t.value&&!i.value?(N(),V("div",LU,[...u[2]||(u[2]=[d("span",{class:"placeholder-text"},"Loading Keanu...",-1)])])):Me("",!0)]),d("div",NU,[u[3]||(u[3]=d("p",null,[Nt("Powered by "),d("a",{href:"https://placekeanu.com/",target:"_blank",rel:"noopener noreferrer"},"PlaceKeanu.com")],-1)),d("p",null,"API: "+B(t.value),1)])])],2))}}),FU=ct(UU,[["__scopeId","data-v-a922b5b9"]]),kU={class:"patch-notes-container"},OU={key:0,class:"loading-message"},BU={key:1,class:"error-message"},VU={class:"patch-note-header"},zU={class:"version-badge"},HU={class:"build-info"},GU={class:"patch-title"},$U={class:"changes-list"},WU={class:"change-icon"},XU={class:"change-label"},qU={class:"change-description"},jU=tt({__name:"PatchNotesPage",setup(n){const e=Qt(),t=Q([]),i=Q(!0),s=Q(null),r=async()=>{try{i.value=!0;const l=await fetch("/api/patch-notes");if(!l.ok)throw new Error("Failed to load patch notes");t.value=await l.json()}catch(l){s.value=l instanceof Error?l.message:"Failed to load patch notes",console.error("Error loading patch notes:",l)}finally{i.value=!1}},o={added:{icon:"✨",label:"Added",color:"#48bb78"},improved:{icon:"🚀",label:"Improved",color:"#4299e1"},fixed:{icon:"🔧",label:"Fixed",color:"#ed8936"},removed:{icon:"🗑️",label:"Removed",color:"#f56565"}},a=l=>{const c=new Date(l),f=new Date().getTime()-c.getTime(),h=Math.floor(f/6e4),g=Math.floor(f/36e5),_=Math.floor(f/864e5);return h<60?`${h} minute${h!==1?"s":""} ago`:g<24?`${g} hour${g!==1?"s":""} ago`:`${_} day${_!==1?"s":""} ago`};return Ct(()=>{r()}),(l,c)=>(N(),V("div",{class:Be(["patch-notes-page",{dark:_e(e).darkMode}])},[c[0]||(c[0]=d("div",{class:"patch-notes-header"},[d("h1",null,"📝 Patch Notes"),d("p",{class:"subtitle"},"Track all changes and updates")],-1)),d("div",kU,[i.value?(N(),V("div",OU,"Loading patch notes...")):s.value?(N(),V("div",BU,B(s.value),1)):(N(!0),V($e,{key:2},et(t.value,(u,f)=>(N(),V("div",{key:u.id,class:"patch-note"},[d("div",VU,[d("div",zU,"v"+B(u.version),1),d("div",HU,"Build #"+B(u.buildNumber)+" • "+B(a(u.buildTime)),1)]),d("h2",GU,B(u.title),1),d("div",$U,[(N(!0),V($e,null,et(u.changes,(h,g)=>(N(),V("div",{key:g,class:Be(["change-item",`change-${h.type}`])},[d("span",WU,B(o[h.type].icon),1),d("span",XU,B(o[h.type].label),1),d("span",qU,B(h.description),1)],2))),128))])]))),128))]),c[1]||(c[1]=d("div",{class:"footer-note"},[d("p",null,"💡 Check back regularly for updates!"),d("p",null,[Nt("🔗 View API documentation at "),d("a",{href:"/api-docs",target:"_blank"},"/api-docs")])],-1))],2))}}),YU=ct(jU,[["__scopeId","data-v-bc6f3a13"]]),KU=[{path:"/",name:"home",component:$y},{path:"/fishing",name:"fishing",component:_N},{path:"/character-tinder",name:"character-tinder",component:cU},{path:"/girl",name:"girl",component:Xy},{path:"/gender",name:"phrenology",component:mS},{path:"/about",name:"about",component:SS},{path:"/rankings",name:"rankings",component:RS},{path:"/cats",name:"cats",component:LS},{path:"/stocks",name:"stocks",component:bb},{path:"/movies",name:"movies",component:M1},{path:"/countdowns",name:"countdowns",component:X1},{path:"/tickets",name:"tickets",component:uT},{path:"/clocks",name:"clocks",component:rA},{path:"/music",name:"music",component:lA},{path:"/opinion",name:"opinion",component:yA},{path:"/mold",name:"mold",component:UA},{path:"/clicker",name:"clicker",component:aC},{path:"/shop",name:"shop",component:NC},{path:"/api-docs",name:"api-docs",component:GC},{path:"/auth",name:"auth",component:WR},{path:"/wordcloud",name:"wordcloud",component:xU},{path:"/keanu",name:"keanu",component:FU},{path:"/patch-notes",name:"patch-notes",component:YU}],ZU=Y0({history:C0(),routes:KU}),ju=U_(xy),JU=O_();ju.use(JU);ju.use(ZU);ju.mount("#app");
