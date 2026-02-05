(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function cu(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const At={},Ks=[],oi=()=>{},yh=()=>!1,Aa=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),uu=n=>n.startsWith("onUpdate:"),$t=Object.assign,du=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Qm=Object.prototype.hasOwnProperty,xt=(n,e)=>Qm.call(n,e),qe=Array.isArray,Zs=n=>ro(n)==="[object Map]",pr=n=>ro(n)==="[object Set]",sd=n=>ro(n)==="[object Date]",et=n=>typeof n=="function",Ht=n=>typeof n=="string",Wn=n=>typeof n=="symbol",wt=n=>n!==null&&typeof n=="object",Sh=n=>(wt(n)||et(n))&&et(n.then)&&et(n.catch),bh=Object.prototype.toString,ro=n=>bh.call(n),eg=n=>ro(n).slice(8,-1),Mh=n=>ro(n)==="[object Object]",Ca=n=>Ht(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Fr=cu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ra=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},tg=/-\w/g,kn=Ra(n=>n.replace(tg,e=>e.slice(1).toUpperCase())),ng=/\B([A-Z])/g,ns=Ra(n=>n.replace(ng,"-$1").toLowerCase()),Pa=Ra(n=>n.charAt(0).toUpperCase()+n.slice(1)),Ja=Ra(n=>n?`on${Pa(n)}`:""),Qi=(n,e)=>!Object.is(n,e),Zo=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},Eh=(n,e,t,i=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:i,value:t})},Ia=n=>{const e=parseFloat(n);return isNaN(e)?n:e},ig=n=>{const e=Ht(n)?Number(n):NaN;return isNaN(e)?n:e};let rd;const Da=()=>rd||(rd=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Dt(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=Ht(i)?ag(i):Dt(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Ht(n)||wt(n))return n}const sg=/;(?![^(]*\))/g,rg=/:([^]+)/,og=/\/\*[^]*?\*\//g;function ag(n){const e={};return n.replace(og,"").split(sg).forEach(t=>{if(t){const i=t.split(rg);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Be(n){let e="";if(Ht(n))e=n;else if(qe(n))for(let t=0;t<n.length;t++){const i=Be(n[t]);i&&(e+=i+" ")}else if(wt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const lg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",cg=cu(lg);function wh(n){return!!n||n===""}function ug(n,e){if(n.length!==e.length)return!1;let t=!0;for(let i=0;t&&i<n.length;i++)t=Ts(n[i],e[i]);return t}function Ts(n,e){if(n===e)return!0;let t=sd(n),i=sd(e);if(t||i)return t&&i?n.getTime()===e.getTime():!1;if(t=Wn(n),i=Wn(e),t||i)return n===e;if(t=qe(n),i=qe(e),t||i)return t&&i?ug(n,e):!1;if(t=wt(n),i=wt(e),t||i){if(!t||!i)return!1;const s=Object.keys(n).length,r=Object.keys(e).length;if(s!==r)return!1;for(const o in n){const a=n.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!Ts(n[o],e[o]))return!1}}return String(n)===String(e)}function fu(n,e){return n.findIndex(t=>Ts(t,e))}const Th=n=>!!(n&&n.__v_isRef===!0),V=n=>Ht(n)?n:n==null?"":qe(n)||wt(n)&&(n.toString===bh||!et(n.toString))?Th(n)?V(n.value):JSON.stringify(n,Ah,2):String(n),Ah=(n,e)=>Th(e)?Ah(n,e.value):Zs(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s],r)=>(t[Qa(i,r)+" =>"]=s,t),{})}:pr(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Qa(t))}:Wn(e)?Qa(e):wt(e)&&!qe(e)&&!Mh(e)?String(e):e,Qa=(n,e="")=>{var t;return Wn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let nn;class Ch{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=nn,!e&&nn&&(this.index=(nn.scopes||(nn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=nn;try{return nn=this,e()}finally{nn=t}}}on(){++this._on===1&&(this.prevScope=nn,nn=this)}off(){this._on>0&&--this._on===0&&(nn=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(this.effects.length=0,t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function Rh(n){return new Ch(n)}function Ph(){return nn}function dg(n,e=!1){nn&&nn.cleanups.push(n)}let It;const el=new WeakSet;class Ih{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,nn&&nn.active&&nn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,el.has(this)&&(el.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Lh(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,od(this),Nh(this);const e=It,t=$n;It=this,$n=!0;try{return this.fn()}finally{Uh(this),It=e,$n=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)mu(e);this.deps=this.depsTail=void 0,od(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?el.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Yl(this)&&this.run()}get dirty(){return Yl(this)}}let Dh=0,kr,Or;function Lh(n,e=!1){if(n.flags|=8,e){n.next=Or,Or=n;return}n.next=kr,kr=n}function hu(){Dh++}function pu(){if(--Dh>0)return;if(Or){let e=Or;for(Or=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;kr;){let e=kr;for(kr=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){n||(n=i)}e=t}}if(n)throw n}function Nh(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Uh(n){let e,t=n.depsTail,i=t;for(;i;){const s=i.prevDep;i.version===-1?(i===t&&(t=s),mu(i),fg(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}n.deps=e,n.depsTail=t}function Yl(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Fh(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Fh(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Xr)||(n.globalVersion=Xr,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Yl(n))))return;n.flags|=2;const e=n.dep,t=It,i=$n;It=n,$n=!0;try{Nh(n);const s=n.fn(n._value);(e.version===0||Qi(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{It=t,$n=i,Uh(n),n.flags&=-3}}function mu(n,e=!1){const{dep:t,prevSub:i,nextSub:s}=n;if(i&&(i.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=i,n.nextSub=void 0),t.subs===n&&(t.subs=i,!i&&t.computed)){t.computed.flags&=-5;for(let r=t.computed.deps;r;r=r.nextDep)mu(r,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function fg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let $n=!0;const kh=[];function Ii(){kh.push($n),$n=!1}function Di(){const n=kh.pop();$n=n===void 0?!0:n}function od(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=It;It=void 0;try{e()}finally{It=t}}}let Xr=0;class hg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class gu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!It||!$n||It===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==It)t=this.activeLink=new hg(It,this),It.deps?(t.prevDep=It.depsTail,It.depsTail.nextDep=t,It.depsTail=t):It.deps=It.depsTail=t,Oh(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const i=t.nextDep;i.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=i),t.prevDep=It.depsTail,t.nextDep=void 0,It.depsTail.nextDep=t,It.depsTail=t,It.deps===t&&(It.deps=i)}return t}trigger(e){this.version++,Xr++,this.notify(e)}notify(e){hu();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{pu()}}}function Oh(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)Oh(i)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const da=new WeakMap,Es=Symbol(""),Kl=Symbol(""),qr=Symbol("");function sn(n,e,t){if($n&&It){let i=da.get(n);i||da.set(n,i=new Map);let s=i.get(t);s||(i.set(t,s=new gu),s.map=i,s.key=t),s.track()}}function Ei(n,e,t,i,s,r){const o=da.get(n);if(!o){Xr++;return}const a=l=>{l&&l.trigger()};if(hu(),e==="clear")o.forEach(a);else{const l=qe(n),c=l&&Ca(t);if(l&&t==="length"){const u=Number(i);o.forEach((f,h)=>{(h==="length"||h===qr||!Wn(h)&&h>=u)&&a(f)})}else switch((t!==void 0||o.has(void 0))&&a(o.get(t)),c&&a(o.get(qr)),e){case"add":l?c&&a(o.get("length")):(a(o.get(Es)),Zs(n)&&a(o.get(Kl)));break;case"delete":l||(a(o.get(Es)),Zs(n)&&a(o.get(Kl)));break;case"set":Zs(n)&&a(o.get(Es));break}}pu()}function pg(n,e){const t=da.get(n);return t&&t.get(e)}function Ps(n){const e=ft(n);return e===n?e:(sn(e,"iterate",qr),Tn(n)?e:e.map(Xn))}function La(n){return sn(n=ft(n),"iterate",qr),n}function qi(n,e){return Li(n)?nr(Ci(n)?Xn(e):e):Xn(e)}const mg={__proto__:null,[Symbol.iterator](){return tl(this,Symbol.iterator,n=>qi(this,n))},concat(...n){return Ps(this).concat(...n.map(e=>qe(e)?Ps(e):e))},entries(){return tl(this,"entries",n=>(n[1]=qi(this,n[1]),n))},every(n,e){return gi(this,"every",n,e,void 0,arguments)},filter(n,e){return gi(this,"filter",n,e,t=>t.map(i=>qi(this,i)),arguments)},find(n,e){return gi(this,"find",n,e,t=>qi(this,t),arguments)},findIndex(n,e){return gi(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return gi(this,"findLast",n,e,t=>qi(this,t),arguments)},findLastIndex(n,e){return gi(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return gi(this,"forEach",n,e,void 0,arguments)},includes(...n){return nl(this,"includes",n)},indexOf(...n){return nl(this,"indexOf",n)},join(n){return Ps(this).join(n)},lastIndexOf(...n){return nl(this,"lastIndexOf",n)},map(n,e){return gi(this,"map",n,e,void 0,arguments)},pop(){return xr(this,"pop")},push(...n){return xr(this,"push",n)},reduce(n,...e){return ad(this,"reduce",n,e)},reduceRight(n,...e){return ad(this,"reduceRight",n,e)},shift(){return xr(this,"shift")},some(n,e){return gi(this,"some",n,e,void 0,arguments)},splice(...n){return xr(this,"splice",n)},toReversed(){return Ps(this).toReversed()},toSorted(n){return Ps(this).toSorted(n)},toSpliced(...n){return Ps(this).toSpliced(...n)},unshift(...n){return xr(this,"unshift",n)},values(){return tl(this,"values",n=>qi(this,n))}};function tl(n,e,t){const i=La(n),s=i[e]();return i!==n&&!Tn(n)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=t(r.value)),r}),s}const gg=Array.prototype;function gi(n,e,t,i,s,r){const o=La(n),a=o!==n&&!Tn(n),l=o[e];if(l!==gg[e]){const f=l.apply(n,r);return a?Xn(f):f}let c=t;o!==n&&(a?c=function(f,h){return t.call(this,qi(n,f),h,n)}:t.length>2&&(c=function(f,h){return t.call(this,f,h,n)}));const u=l.call(o,c,i);return a&&s?s(u):u}function ad(n,e,t,i){const s=La(n);let r=t;return s!==n&&(Tn(n)?t.length>3&&(r=function(o,a,l){return t.call(this,o,a,l,n)}):r=function(o,a,l){return t.call(this,o,qi(n,a),l,n)}),s[e](r,...i)}function nl(n,e,t){const i=ft(n);sn(i,"iterate",qr);const s=i[e](...t);return(s===-1||s===!1)&&Na(t[0])?(t[0]=ft(t[0]),i[e](...t)):s}function xr(n,e,t=[]){Ii(),hu();const i=ft(n)[e].apply(n,t);return pu(),Di(),i}const vg=cu("__proto__,__v_isRef,__isVue"),Bh=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Wn));function _g(n){Wn(n)||(n=String(n));const e=ft(this);return sn(e,"has",n),e.hasOwnProperty(n)}class Vh{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,i){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return r;if(t==="__v_raw")return i===(s?r?Cg:$h:r?Gh:Hh).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const o=qe(e);if(!s){let l;if(o&&(l=mg[t]))return l;if(t==="hasOwnProperty")return _g}const a=Reflect.get(e,t,zt(e)?e:i);if((Wn(t)?Bh.has(t):vg(t))||(s||sn(e,"get",t),r))return a;if(zt(a)){const l=o&&Ca(t)?a:a.value;return s&&wt(l)?Jl(l):l}return wt(a)?s?Jl(a):oo(a):a}}class zh extends Vh{constructor(e=!1){super(!1,e)}set(e,t,i,s){let r=e[t];const o=qe(e)&&Ca(t);if(!this._isShallow){const c=Li(r);if(!Tn(i)&&!Li(i)&&(r=ft(r),i=ft(i)),!o&&zt(r)&&!zt(i))return c||(r.value=i),!0}const a=o?Number(t)<e.length:xt(e,t),l=Reflect.set(e,t,i,zt(e)?e:s);return e===ft(s)&&(a?Qi(i,r)&&Ei(e,"set",t,i):Ei(e,"add",t,i)),l}deleteProperty(e,t){const i=xt(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&i&&Ei(e,"delete",t,void 0),s}has(e,t){const i=Reflect.has(e,t);return(!Wn(t)||!Bh.has(t))&&sn(e,"has",t),i}ownKeys(e){return sn(e,"iterate",qe(e)?"length":Es),Reflect.ownKeys(e)}}class xg extends Vh{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const yg=new zh,Sg=new xg,bg=new zh(!0);const Zl=n=>n,xo=n=>Reflect.getPrototypeOf(n);function Mg(n,e,t){return function(...i){const s=this.__v_raw,r=ft(s),o=Zs(r),a=n==="entries"||n===Symbol.iterator&&o,l=n==="keys"&&o,c=s[n](...i),u=t?Zl:e?nr:Xn;return!e&&sn(r,"iterate",l?Kl:Es),$t(Object.create(c),{next(){const{value:f,done:h}=c.next();return h?{value:f,done:h}:{value:a?[u(f[0]),u(f[1])]:u(f),done:h}}})}}function yo(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function Eg(n,e){const t={get(s){const r=this.__v_raw,o=ft(r),a=ft(s);n||(Qi(s,a)&&sn(o,"get",s),sn(o,"get",a));const{has:l}=xo(o),c=e?Zl:n?nr:Xn;if(l.call(o,s))return c(r.get(s));if(l.call(o,a))return c(r.get(a));r!==o&&r.get(s)},get size(){const s=this.__v_raw;return!n&&sn(ft(s),"iterate",Es),s.size},has(s){const r=this.__v_raw,o=ft(r),a=ft(s);return n||(Qi(s,a)&&sn(o,"has",s),sn(o,"has",a)),s===a?r.has(s):r.has(s)||r.has(a)},forEach(s,r){const o=this,a=o.__v_raw,l=ft(a),c=e?Zl:n?nr:Xn;return!n&&sn(l,"iterate",Es),a.forEach((u,f)=>s.call(r,c(u),c(f),o))}};return $t(t,n?{add:yo("add"),set:yo("set"),delete:yo("delete"),clear:yo("clear")}:{add(s){!e&&!Tn(s)&&!Li(s)&&(s=ft(s));const r=ft(this);return xo(r).has.call(r,s)||(r.add(s),Ei(r,"add",s,s)),this},set(s,r){!e&&!Tn(r)&&!Li(r)&&(r=ft(r));const o=ft(this),{has:a,get:l}=xo(o);let c=a.call(o,s);c||(s=ft(s),c=a.call(o,s));const u=l.call(o,s);return o.set(s,r),c?Qi(r,u)&&Ei(o,"set",s,r):Ei(o,"add",s,r),this},delete(s){const r=ft(this),{has:o,get:a}=xo(r);let l=o.call(r,s);l||(s=ft(s),l=o.call(r,s)),a&&a.call(r,s);const c=r.delete(s);return l&&Ei(r,"delete",s,void 0),c},clear(){const s=ft(this),r=s.size!==0,o=s.clear();return r&&Ei(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=Mg(s,n,e)}),t}function vu(n,e){const t=Eg(n,e);return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(xt(t,s)&&s in i?t:i,s,r)}const wg={get:vu(!1,!1)},Tg={get:vu(!1,!0)},Ag={get:vu(!0,!1)};const Hh=new WeakMap,Gh=new WeakMap,$h=new WeakMap,Cg=new WeakMap;function Rg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Pg(n){return n.__v_skip||!Object.isExtensible(n)?0:Rg(eg(n))}function oo(n){return Li(n)?n:_u(n,!1,yg,wg,Hh)}function Wh(n){return _u(n,!1,bg,Tg,Gh)}function Jl(n){return _u(n,!0,Sg,Ag,$h)}function _u(n,e,t,i,s){if(!wt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const r=Pg(n);if(r===0)return n;const o=s.get(n);if(o)return o;const a=new Proxy(n,r===2?i:t);return s.set(n,a),a}function Ci(n){return Li(n)?Ci(n.__v_raw):!!(n&&n.__v_isReactive)}function Li(n){return!!(n&&n.__v_isReadonly)}function Tn(n){return!!(n&&n.__v_isShallow)}function Na(n){return n?!!n.__v_raw:!1}function ft(n){const e=n&&n.__v_raw;return e?ft(e):n}function xu(n){return!xt(n,"__v_skip")&&Object.isExtensible(n)&&Eh(n,"__v_skip",!0),n}const Xn=n=>wt(n)?oo(n):n,nr=n=>wt(n)?Jl(n):n;function zt(n){return n?n.__v_isRef===!0:!1}function J(n){return Xh(n,!1)}function Ig(n){return Xh(n,!0)}function Xh(n,e){return zt(n)?n:new Dg(n,e)}class Dg{constructor(e,t){this.dep=new gu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:ft(e),this._value=t?e:Xn(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,i=this.__v_isShallow||Tn(e)||Li(e);e=i?e:ft(e),Qi(e,t)&&(this._rawValue=e,this._value=i?e:Xn(e),this.dep.trigger())}}function ve(n){return zt(n)?n.value:n}const Lg={get:(n,e,t)=>e==="__v_raw"?n:ve(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return zt(s)&&!zt(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function qh(n){return Ci(n)?n:new Proxy(n,Lg)}function Ng(n){const e=qe(n)?new Array(n.length):{};for(const t in n)e[t]=Fg(n,t);return e}class Ug{constructor(e,t,i){this._object=e,this._key=t,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._raw=ft(e);let s=!0,r=e;if(!qe(e)||!Ca(String(t)))do s=!Na(r)||Tn(r);while(s&&(r=r.__v_raw));this._shallow=s}get value(){let e=this._object[this._key];return this._shallow&&(e=ve(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&zt(this._raw[this._key])){const t=this._object[this._key];if(zt(t)){t.value=e;return}}this._object[this._key]=e}get dep(){return pg(this._raw,this._key)}}function Fg(n,e,t){return new Ug(n,e,t)}class kg{constructor(e,t,i){this.fn=e,this.setter=t,this._value=void 0,this.dep=new gu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Xr-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&It!==this)return Lh(this,!0),!0}get value(){const e=this.dep.track();return Fh(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Og(n,e,t=!1){let i,s;return et(n)?i=n:(i=n.get,s=n.set),new kg(i,s,t)}const So={},fa=new WeakMap;let ms;function Bg(n,e=!1,t=ms){if(t){let i=fa.get(t);i||fa.set(t,i=[]),i.push(n)}}function Vg(n,e,t=At){const{immediate:i,deep:s,once:r,scheduler:o,augmentJob:a,call:l}=t,c=M=>s?M:Tn(M)||s===!1||s===0?wi(M,1):wi(M);let u,f,h,m,_=!1,v=!1;if(zt(n)?(f=()=>n.value,_=Tn(n)):Ci(n)?(f=()=>c(n),_=!0):qe(n)?(v=!0,_=n.some(M=>Ci(M)||Tn(M)),f=()=>n.map(M=>{if(zt(M))return M.value;if(Ci(M))return c(M);if(et(M))return l?l(M,2):M()})):et(n)?e?f=l?()=>l(n,2):n:f=()=>{if(h){Ii();try{h()}finally{Di()}}const M=ms;ms=u;try{return l?l(n,3,[m]):n(m)}finally{ms=M}}:f=oi,e&&s){const M=f,T=s===!0?1/0:s;f=()=>wi(M(),T)}const g=Ph(),p=()=>{u.stop(),g&&g.active&&du(g.effects,u)};if(r&&e){const M=e;e=(...T)=>{M(...T),p()}}let b=v?new Array(n.length).fill(So):So;const y=M=>{if(!(!(u.flags&1)||!u.dirty&&!M))if(e){const T=u.run();if(s||_||(v?T.some((C,w)=>Qi(C,b[w])):Qi(T,b))){h&&h();const C=ms;ms=u;try{const w=[T,b===So?void 0:v&&b[0]===So?[]:b,m];b=T,l?l(e,3,w):e(...w)}finally{ms=C}}}else u.run()};return a&&a(y),u=new Ih(f),u.scheduler=o?()=>o(y,!1):y,m=M=>Bg(M,!1,u),h=u.onStop=()=>{const M=fa.get(u);if(M){if(l)l(M,4);else for(const T of M)T();fa.delete(u)}},e?i?y(!0):b=u.run():o?o(y.bind(null,!0),!0):u.run(),p.pause=u.pause.bind(u),p.resume=u.resume.bind(u),p.stop=p,p}function wi(n,e=1/0,t){if(e<=0||!wt(n)||n.__v_skip||(t=t||new Map,(t.get(n)||0)>=e))return n;if(t.set(n,e),e--,zt(n))wi(n.value,e,t);else if(qe(n))for(let i=0;i<n.length;i++)wi(n[i],e,t);else if(pr(n)||Zs(n))n.forEach(i=>{wi(i,e,t)});else if(Mh(n)){for(const i in n)wi(n[i],e,t);for(const i of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,i)&&wi(n[i],e,t)}return n}/**
* @vue/runtime-core v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ao(n,e,t,i){try{return i?n(...i):n()}catch(s){Ua(s,e,t)}}function qn(n,e,t,i){if(et(n)){const s=ao(n,e,t,i);return s&&Sh(s)&&s.catch(r=>{Ua(r,e,t)}),s}if(qe(n)){const s=[];for(let r=0;r<n.length;r++)s.push(qn(n[r],e,t,i));return s}}function Ua(n,e,t,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||At;if(e){let a=e.parent;const l=e.proxy,c=`https://vuejs.org/error-reference/#runtime-${t}`;for(;a;){const u=a.ec;if(u){for(let f=0;f<u.length;f++)if(u[f](n,l,c)===!1)return}a=a.parent}if(r){Ii(),ao(r,null,10,[n,l,c]),Di();return}}zg(n,t,s,i,o)}function zg(n,e,t,i=!0,s=!1){if(s)throw n;console.error(n)}const hn=[];let ei=-1;const Js=[];let ji=null,qs=0;const jh=Promise.resolve();let ha=null;function lo(n){const e=ha||jh;return n?e.then(this?n.bind(this):n):e}function Hg(n){let e=ei+1,t=hn.length;for(;e<t;){const i=e+t>>>1,s=hn[i],r=jr(s);r<n||r===n&&s.flags&2?e=i+1:t=i}return e}function yu(n){if(!(n.flags&1)){const e=jr(n),t=hn[hn.length-1];!t||!(n.flags&2)&&e>=jr(t)?hn.push(n):hn.splice(Hg(e),0,n),n.flags|=1,Yh()}}function Yh(){ha||(ha=jh.then(Zh))}function Gg(n){qe(n)?Js.push(...n):ji&&n.id===-1?ji.splice(qs+1,0,n):n.flags&1||(Js.push(n),n.flags|=1),Yh()}function ld(n,e,t=ei+1){for(;t<hn.length;t++){const i=hn[t];if(i&&i.flags&2){if(n&&i.id!==n.uid)continue;hn.splice(t,1),t--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Kh(n){if(Js.length){const e=[...new Set(Js)].sort((t,i)=>jr(t)-jr(i));if(Js.length=0,ji){ji.push(...e);return}for(ji=e,qs=0;qs<ji.length;qs++){const t=ji[qs];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}ji=null,qs=0}}const jr=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Zh(n){try{for(ei=0;ei<hn.length;ei++){const e=hn[ei];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),ao(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;ei<hn.length;ei++){const e=hn[ei];e&&(e.flags&=-2)}ei=-1,hn.length=0,Kh(),ha=null,(hn.length||Js.length)&&Zh()}}let Kt=null,Jh=null;function pa(n){const e=Kt;return Kt=n,Jh=n&&n.type.__scopeId||null,e}function Nn(n,e=Kt,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&va(-1);const r=pa(e);let o;try{o=n(...s)}finally{pa(r),i._d&&va(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function Mt(n,e){if(Kt===null)return n;const t=Ba(Kt),i=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[r,o,a,l=At]=e[s];r&&(et(r)&&(r={mounted:r,updated:r}),r.deep&&wi(o),i.push({dir:r,instance:t,value:o,oldValue:void 0,arg:a,modifiers:l}))}return n}function rs(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(Ii(),qn(l,t,8,[n.el,a,n,e]),Di())}}function Jo(n,e){if(rn){let t=rn.provides;const i=rn.parent&&rn.parent.provides;i===t&&(t=rn.provides=Object.create(i)),t[n]=e}}function An(n,e,t=!1){const i=wu();if(i||ws){let s=ws?ws._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&et(e)?e.call(i&&i.proxy):e}}function $g(){return!!(wu()||ws)}const Wg=Symbol.for("v-scx"),Xg=()=>An(Wg);function Un(n,e,t){return Qh(n,e,t)}function Qh(n,e,t=At){const{immediate:i,deep:s,flush:r,once:o}=t,a=$t({},t),l=e&&i||!e&&r!=="post";let c;if(Jr){if(r==="sync"){const m=Xg();c=m.__watcherHandles||(m.__watcherHandles=[])}else if(!l){const m=()=>{};return m.stop=oi,m.resume=oi,m.pause=oi,m}}const u=rn;a.call=(m,_,v)=>qn(m,u,_,v);let f=!1;r==="post"?a.scheduler=m=>{dn(m,u&&u.suspense)}:r!=="sync"&&(f=!0,a.scheduler=(m,_)=>{_?m():yu(m)}),a.augmentJob=m=>{e&&(m.flags|=4),f&&(m.flags|=2,u&&(m.id=u.uid,m.i=u))};const h=Vg(n,e,a);return Jr&&(c?c.push(h):l&&h()),h}function qg(n,e,t){const i=this.proxy,s=Ht(n)?n.includes(".")?ep(i,n):()=>i[n]:n.bind(i,i);let r;et(e)?r=e:(r=e.handler,t=e);const o=co(this),a=Qh(s,r.bind(i),t);return o(),a}function ep(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}const tp=Symbol("_vte"),jg=n=>n.__isTeleport,Br=n=>n&&(n.disabled||n.disabled===""),cd=n=>n&&(n.defer||n.defer===""),ud=n=>typeof SVGElement<"u"&&n instanceof SVGElement,dd=n=>typeof MathMLElement=="function"&&n instanceof MathMLElement,Ql=(n,e)=>{const t=n&&n.to;return Ht(t)?e?e(t):null:t},np={name:"Teleport",__isTeleport:!0,process(n,e,t,i,s,r,o,a,l,c){const{mc:u,pc:f,pbc:h,o:{insert:m,querySelector:_,createText:v,createComment:g}}=c,p=Br(e.props);let{shapeFlag:b,children:y,dynamicChildren:M}=e;if(n==null){const T=e.el=v(""),C=e.anchor=v("");m(T,t,i),m(C,t,i);const w=(x,E)=>{b&16&&u(y,x,E,s,r,o,a,l)},R=()=>{const x=e.target=Ql(e.props,_),E=ip(x,e,v,m);x&&(o!=="svg"&&ud(x)?o="svg":o!=="mathml"&&dd(x)&&(o="mathml"),s&&s.isCE&&(s.ce._teleportTargets||(s.ce._teleportTargets=new Set)).add(x),p||(w(x,E),Qo(e,!1)))};p&&(w(t,C),Qo(e,!0)),cd(e.props)?(e.el.__isMounted=!1,dn(()=>{R(),delete e.el.__isMounted},r)):R()}else{if(cd(e.props)&&n.el.__isMounted===!1){dn(()=>{np.process(n,e,t,i,s,r,o,a,l,c)},r);return}e.el=n.el,e.targetStart=n.targetStart;const T=e.anchor=n.anchor,C=e.target=n.target,w=e.targetAnchor=n.targetAnchor,R=Br(n.props),x=R?t:C,E=R?T:w;if(o==="svg"||ud(C)?o="svg":(o==="mathml"||dd(C))&&(o="mathml"),M?(h(n.dynamicChildren,M,x,s,r,o,a),Mu(n,e,!0)):l||f(n,e,x,E,s,r,o,a,!1),p)R?e.props&&n.props&&e.props.to!==n.props.to&&(e.props.to=n.props.to):bo(e,t,T,c,1);else if((e.props&&e.props.to)!==(n.props&&n.props.to)){const U=e.target=Ql(e.props,_);U&&bo(e,U,null,c,0)}else R&&bo(e,C,w,c,1);Qo(e,p)}},remove(n,e,t,{um:i,o:{remove:s}},r){const{shapeFlag:o,children:a,anchor:l,targetStart:c,targetAnchor:u,target:f,props:h}=n;if(f&&(s(c),s(u)),r&&s(l),o&16){const m=r||!Br(h);for(let _=0;_<a.length;_++){const v=a[_];i(v,e,t,m,!!v.dynamicChildren)}}},move:bo,hydrate:Yg};function bo(n,e,t,{o:{insert:i},m:s},r=2){r===0&&i(n.targetAnchor,e,t);const{el:o,anchor:a,shapeFlag:l,children:c,props:u}=n,f=r===2;if(f&&i(o,e,t),(!f||Br(u))&&l&16)for(let h=0;h<c.length;h++)s(c[h],e,t,2);f&&i(a,e,t)}function Yg(n,e,t,i,s,r,{o:{nextSibling:o,parentNode:a,querySelector:l,insert:c,createText:u}},f){function h(v,g,p,b){g.anchor=f(o(v),g,a(v),t,i,s,r),g.targetStart=p,g.targetAnchor=b}const m=e.target=Ql(e.props,l),_=Br(e.props);if(m){const v=m._lpa||m.firstChild;if(e.shapeFlag&16)if(_)h(n,e,v,v&&o(v));else{e.anchor=o(n);let g=v;for(;g;){if(g&&g.nodeType===8){if(g.data==="teleport start anchor")e.targetStart=g;else if(g.data==="teleport anchor"){e.targetAnchor=g,m._lpa=e.targetAnchor&&o(e.targetAnchor);break}}g=o(g)}e.targetAnchor||ip(m,e,u,c),f(v&&o(v),e,m,t,i,s,r)}Qo(e,_)}else _&&e.shapeFlag&16&&h(n,e,n,o(n));return e.anchor&&o(e.anchor)}const Kg=np;function Qo(n,e){const t=n.ctx;if(t&&t.ut){let i,s;for(e?(i=n.el,s=n.anchor):(i=n.targetStart,s=n.targetAnchor);i&&i!==s;)i.nodeType===1&&i.setAttribute("data-v-owner",t.uid),i=i.nextSibling;t.ut()}}function ip(n,e,t,i){const s=e.targetStart=t(""),r=e.targetAnchor=t("");return s[tp]=r,n&&(i(s,n),i(r,n)),r}const gs=Symbol("_leaveCb"),Mo=Symbol("_enterCb");function Zg(){const n={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return Ct(()=>{n.isMounted=!0}),cp(()=>{n.isUnmounting=!0}),n}const Pn=[Function,Array],Jg={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:Pn,onEnter:Pn,onAfterEnter:Pn,onEnterCancelled:Pn,onBeforeLeave:Pn,onLeave:Pn,onAfterLeave:Pn,onLeaveCancelled:Pn,onBeforeAppear:Pn,onAppear:Pn,onAfterAppear:Pn,onAppearCancelled:Pn};function Qg(n,e){const{leavingVNodes:t}=n;let i=t.get(e.type);return i||(i=Object.create(null),t.set(e.type,i)),i}function ec(n,e,t,i,s){const{appear:r,mode:o,persisted:a=!1,onBeforeEnter:l,onEnter:c,onAfterEnter:u,onEnterCancelled:f,onBeforeLeave:h,onLeave:m,onAfterLeave:_,onLeaveCancelled:v,onBeforeAppear:g,onAppear:p,onAfterAppear:b,onAppearCancelled:y}=e,M=String(n.key),T=Qg(t,n),C=(x,E)=>{x&&qn(x,i,9,E)},w=(x,E)=>{const U=E[1];C(x,E),qe(x)?x.every(O=>O.length<=1)&&U():x.length<=1&&U()},R={mode:o,persisted:a,beforeEnter(x){let E=l;if(!t.isMounted)if(r)E=g||l;else return;x[gs]&&x[gs](!0);const U=T[M];U&&js(n,U)&&U.el[gs]&&U.el[gs](),C(E,[x])},enter(x){let E=c,U=u,O=f;if(!t.isMounted)if(r)E=p||c,U=b||u,O=y||f;else return;let j=!1;const ee=x[Mo]=Q=>{j||(j=!0,Q?C(O,[x]):C(U,[x]),R.delayedLeave&&R.delayedLeave(),x[Mo]=void 0)};E?w(E,[x,ee]):ee()},leave(x,E){const U=String(n.key);if(x[Mo]&&x[Mo](!0),t.isUnmounting)return E();C(h,[x]);let O=!1;const j=x[gs]=ee=>{O||(O=!0,E(),ee?C(v,[x]):C(_,[x]),x[gs]=void 0,T[U]===n&&delete T[U])};T[U]=n,m?w(m,[x,j]):j()},clone(x){return ec(x,e,t,i)}};return R}function Yr(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Yr(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function sp(n,e=!1,t){let i=[],s=0;for(let r=0;r<n.length;r++){let o=n[r];const a=t==null?o.key:String(t)+String(o.key!=null?o.key:r);o.type===$e?(o.patchFlag&128&&s++,i=i.concat(sp(o.children,e,a))):(e||o.type!==ui)&&i.push(a!=null?As(o,{key:a}):o)}if(s>1)for(let r=0;r<i.length;r++)i[r].patchFlag=-2;return i}function tt(n,e){return et(n)?$t({name:n.name},e,{setup:n}):n}function rp(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}const ma=new WeakMap;function Vr(n,e,t,i,s=!1){if(qe(n)){n.forEach((_,v)=>Vr(_,e&&(qe(e)?e[v]:e),t,i,s));return}if(Qs(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&Vr(n,e,t,i.component.subTree);return}const r=i.shapeFlag&4?Ba(i.component):i.el,o=s?null:r,{i:a,r:l}=n,c=e&&e.r,u=a.refs===At?a.refs={}:a.refs,f=a.setupState,h=ft(f),m=f===At?yh:_=>xt(h,_);if(c!=null&&c!==l){if(fd(e),Ht(c))u[c]=null,m(c)&&(f[c]=null);else if(zt(c)){c.value=null;const _=e;_.k&&(u[_.k]=null)}}if(et(l))ao(l,a,12,[o,u]);else{const _=Ht(l),v=zt(l);if(_||v){const g=()=>{if(n.f){const p=_?m(l)?f[l]:u[l]:l.value;if(s)qe(p)&&du(p,r);else if(qe(p))p.includes(r)||p.push(r);else if(_)u[l]=[r],m(l)&&(f[l]=u[l]);else{const b=[r];l.value=b,n.k&&(u[n.k]=b)}}else _?(u[l]=o,m(l)&&(f[l]=o)):v&&(l.value=o,n.k&&(u[n.k]=o))};if(o){const p=()=>{g(),ma.delete(n)};p.id=-1,ma.set(n,p),dn(p,t)}else fd(n),g()}}}function fd(n){const e=ma.get(n);e&&(e.flags|=8,ma.delete(n))}Da().requestIdleCallback;Da().cancelIdleCallback;const Qs=n=>!!n.type.__asyncLoader,op=n=>n.type.__isKeepAlive;function ev(n,e){ap(n,"a",e)}function tv(n,e){ap(n,"da",e)}function ap(n,e,t=rn){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(Fa(e,i,t),t){let s=t.parent;for(;s&&s.parent;)op(s.parent.vnode)&&nv(i,e,t,s),s=s.parent}}function nv(n,e,t,i){const s=Fa(e,n,i,!0);Yn(()=>{du(i[e],s)},t)}function Fa(n,e,t=rn,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...o)=>{Ii();const a=co(t),l=qn(e,t,n,o);return a(),Di(),l});return i?s.unshift(r):s.push(r),r}}const Fi=n=>(e,t=rn)=>{(!Jr||n==="sp")&&Fa(n,(...i)=>e(...i),t)},iv=Fi("bm"),Ct=Fi("m"),sv=Fi("bu"),lp=Fi("u"),cp=Fi("bum"),Yn=Fi("um"),rv=Fi("sp"),ov=Fi("rtg"),av=Fi("rtc");function lv(n,e=rn){Fa("ec",n,e)}const cv="components";function uv(n,e){return fv(cv,n,!0,e)||n}const dv=Symbol.for("v-ndc");function fv(n,e,t=!0,i=!1){const s=Kt||rn;if(s){const r=s.type;{const a=Kv(r,!1);if(a&&(a===e||a===kn(e)||a===Pa(kn(e))))return r}const o=hd(s[n]||r[n],e)||hd(s.appContext[n],e);return!o&&i?r:o}}function hd(n,e){return n&&(n[e]||n[kn(e)]||n[Pa(kn(e))])}function Qe(n,e,t,i){let s;const r=t,o=qe(n);if(o||Ht(n)){const a=o&&Ci(n);let l=!1,c=!1;a&&(l=!Tn(n),c=Li(n),n=La(n)),s=new Array(n.length);for(let u=0,f=n.length;u<f;u++)s[u]=e(l?c?nr(Xn(n[u])):Xn(n[u]):n[u],u,void 0,r)}else if(typeof n=="number"){s=new Array(n);for(let a=0;a<n;a++)s[a]=e(a+1,a,void 0,r)}else if(wt(n))if(n[Symbol.iterator])s=Array.from(n,(a,l)=>e(a,l,void 0,r));else{const a=Object.keys(n);s=new Array(a.length);for(let l=0,c=a.length;l<c;l++){const u=a[l];s[l]=e(n[u],u,l,r)}}else s=[];return s}function up(n,e,t={},i,s){if(Kt.ce||Kt.parent&&Qs(Kt.parent)&&Kt.parent.ce){const c=Object.keys(t).length>0;return e!=="default"&&(t.name=e),N(),Yt($e,null,[pt("slot",t,i&&i())],c?-2:64)}let r=n[e];r&&r._c&&(r._d=!1),N();const o=r&&dp(r(t)),a=t.key||o&&o.key,l=Yt($e,{key:(a&&!Wn(a)?a:`_${e}`)+(!o&&i?"_fb":"")},o||(i?i():[]),o&&n._===1?64:-2);return r&&r._c&&(r._d=!0),l}function dp(n){return n.some(e=>Zr(e)?!(e.type===ui||e.type===$e&&!dp(e.children)):!0)?n:null}const tc=n=>n?Rp(n)?Ba(n):tc(n.parent):null,zr=$t(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>tc(n.parent),$root:n=>tc(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>hp(n),$forceUpdate:n=>n.f||(n.f=()=>{yu(n.update)}),$nextTick:n=>n.n||(n.n=lo.bind(n.proxy)),$watch:n=>qg.bind(n)}),il=(n,e)=>n!==At&&!n.__isScriptSetup&&xt(n,e),hv={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=n;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(il(i,e))return o[e]=1,i[e];if(s!==At&&xt(s,e))return o[e]=2,s[e];if(xt(r,e))return o[e]=3,r[e];if(t!==At&&xt(t,e))return o[e]=4,t[e];nc&&(o[e]=0)}}const c=zr[e];let u,f;if(c)return e==="$attrs"&&sn(n.attrs,"get",""),c(n);if((u=a.__cssModules)&&(u=u[e]))return u;if(t!==At&&xt(t,e))return o[e]=4,t[e];if(f=l.config.globalProperties,xt(f,e))return f[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return il(s,e)?(s[e]=t,!0):i!==At&&xt(i,e)?(i[e]=t,!0):xt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,props:r,type:o}},a){let l;return!!(t[a]||n!==At&&a[0]!=="$"&&xt(n,a)||il(e,a)||xt(r,a)||xt(i,a)||xt(zr,a)||xt(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:xt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function pd(n){return qe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let nc=!0;function pv(n){const e=hp(n),t=n.proxy,i=n.ctx;nc=!1,e.beforeCreate&&md(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:c,created:u,beforeMount:f,mounted:h,beforeUpdate:m,updated:_,activated:v,deactivated:g,beforeDestroy:p,beforeUnmount:b,destroyed:y,unmounted:M,render:T,renderTracked:C,renderTriggered:w,errorCaptured:R,serverPrefetch:x,expose:E,inheritAttrs:U,components:O,directives:j,filters:ee}=e;if(c&&mv(c,i,null),o)for(const I in o){const F=o[I];et(F)&&(i[I]=F.bind(t))}if(s){const I=s.call(t,t);wt(I)&&(n.data=oo(I))}if(nc=!0,r)for(const I in r){const F=r[I],$=et(F)?F.bind(t,t):et(F.get)?F.get.bind(t,t):oi,le=!et(F)&&et(F.set)?F.set.bind(t):oi,re=ot({get:$,set:le});Object.defineProperty(i,I,{enumerable:!0,configurable:!0,get:()=>re.value,set:xe=>re.value=xe})}if(a)for(const I in a)fp(a[I],i,t,I);if(l){const I=et(l)?l.call(t):l;Reflect.ownKeys(I).forEach(F=>{Jo(F,I[F])})}u&&md(u,n,"c");function Z(I,F){qe(F)?F.forEach($=>I($.bind(t))):F&&I(F.bind(t))}if(Z(iv,f),Z(Ct,h),Z(sv,m),Z(lp,_),Z(ev,v),Z(tv,g),Z(lv,R),Z(av,C),Z(ov,w),Z(cp,b),Z(Yn,M),Z(rv,x),qe(E))if(E.length){const I=n.exposed||(n.exposed={});E.forEach(F=>{Object.defineProperty(I,F,{get:()=>t[F],set:$=>t[F]=$,enumerable:!0})})}else n.exposed||(n.exposed={});T&&n.render===oi&&(n.render=T),U!=null&&(n.inheritAttrs=U),O&&(n.components=O),j&&(n.directives=j),x&&rp(n)}function mv(n,e,t=oi){qe(n)&&(n=ic(n));for(const i in n){const s=n[i];let r;wt(s)?"default"in s?r=An(s.from||i,s.default,!0):r=An(s.from||i):r=An(s),zt(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):e[i]=r}}function md(n,e,t){qn(qe(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function fp(n,e,t,i){let s=i.includes(".")?ep(t,i):()=>t[i];if(Ht(n)){const r=e[n];et(r)&&Un(s,r)}else if(et(n))Un(s,n.bind(t));else if(wt(n))if(qe(n))n.forEach(r=>fp(r,e,t,i));else{const r=et(n.handler)?n.handler.bind(t):e[n.handler];et(r)&&Un(s,r,n)}}function hp(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=n.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(c=>ga(l,c,o,!0)),ga(l,e,o)),wt(e)&&r.set(e,l),l}function ga(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&ga(n,r,t,!0),s&&s.forEach(o=>ga(n,o,t,!0));for(const o in e)if(!(i&&o==="expose")){const a=gv[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const gv={data:gd,props:vd,emits:vd,methods:Dr,computed:Dr,beforeCreate:cn,created:cn,beforeMount:cn,mounted:cn,beforeUpdate:cn,updated:cn,beforeDestroy:cn,beforeUnmount:cn,destroyed:cn,unmounted:cn,activated:cn,deactivated:cn,errorCaptured:cn,serverPrefetch:cn,components:Dr,directives:Dr,watch:_v,provide:gd,inject:vv};function gd(n,e){return e?n?function(){return $t(et(n)?n.call(this,this):n,et(e)?e.call(this,this):e)}:e:n}function vv(n,e){return Dr(ic(n),ic(e))}function ic(n){if(qe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function cn(n,e){return n?[...new Set([].concat(n,e))]:e}function Dr(n,e){return n?$t(Object.create(null),n,e):e}function vd(n,e){return n?qe(n)&&qe(e)?[...new Set([...n,...e])]:$t(Object.create(null),pd(n),pd(e??{})):e}function _v(n,e){if(!n)return e;if(!e)return n;const t=$t(Object.create(null),n);for(const i in e)t[i]=cn(n[i],e[i]);return t}function pp(){return{app:null,config:{isNativeTag:yh,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let xv=0;function yv(n,e){return function(i,s=null){et(i)||(i=$t({},i)),s!=null&&!wt(s)&&(s=null);const r=pp(),o=new WeakSet,a=[];let l=!1;const c=r.app={_uid:xv++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:Jv,get config(){return r.config},set config(u){},use(u,...f){return o.has(u)||(u&&et(u.install)?(o.add(u),u.install(c,...f)):et(u)&&(o.add(u),u(c,...f))),c},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),c},component(u,f){return f?(r.components[u]=f,c):r.components[u]},directive(u,f){return f?(r.directives[u]=f,c):r.directives[u]},mount(u,f,h){if(!l){const m=c._ceVNode||pt(i,s);return m.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),n(m,u,h),l=!0,c._container=u,u.__vue_app__=c,Ba(m.component)}},onUnmount(u){a.push(u)},unmount(){l&&(qn(a,c._instance,16),n(null,c._container),delete c._container.__vue_app__)},provide(u,f){return r.provides[u]=f,c},runWithContext(u){const f=ws;ws=c;try{return u()}finally{ws=f}}};return c}}let ws=null;const Sv=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${kn(e)}Modifiers`]||n[`${ns(e)}Modifiers`];function bv(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||At;let s=t;const r=e.startsWith("update:"),o=r&&Sv(i,e.slice(7));o&&(o.trim&&(s=t.map(u=>Ht(u)?u.trim():u)),o.number&&(s=t.map(Ia)));let a,l=i[a=Ja(e)]||i[a=Ja(kn(e))];!l&&r&&(l=i[a=Ja(ns(e))]),l&&qn(l,n,6,s);const c=i[a+"Once"];if(c){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,qn(c,n,6,s)}}const Mv=new WeakMap;function mp(n,e,t=!1){const i=t?Mv:e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let o={},a=!1;if(!et(n)){const l=c=>{const u=mp(c,e,!0);u&&(a=!0,$t(o,u))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!a?(wt(n)&&i.set(n,null),null):(qe(r)?r.forEach(l=>o[l]=null):$t(o,r),wt(n)&&i.set(n,o),o)}function ka(n,e){return!n||!Aa(e)?!1:(e=e.slice(2).replace(/Once$/,""),xt(n,e[0].toLowerCase()+e.slice(1))||xt(n,ns(e))||xt(n,e))}function _d(n){const{type:e,vnode:t,proxy:i,withProxy:s,propsOptions:[r],slots:o,attrs:a,emit:l,render:c,renderCache:u,props:f,data:h,setupState:m,ctx:_,inheritAttrs:v}=n,g=pa(n);let p,b;try{if(t.shapeFlag&4){const M=s||i,T=M;p=ti(c.call(T,M,u,f,m,h,_)),b=a}else{const M=e;p=ti(M.length>1?M(f,{attrs:a,slots:o,emit:l}):M(f,null)),b=e.props?a:Ev(a)}}catch(M){Hr.length=0,Ua(M,n,1),p=pt(ui)}let y=p;if(b&&v!==!1){const M=Object.keys(b),{shapeFlag:T}=y;M.length&&T&7&&(r&&M.some(uu)&&(b=wv(b,r)),y=As(y,b,!1,!0))}return t.dirs&&(y=As(y,null,!1,!0),y.dirs=y.dirs?y.dirs.concat(t.dirs):t.dirs),t.transition&&Yr(y,t.transition),p=y,pa(g),p}const Ev=n=>{let e;for(const t in n)(t==="class"||t==="style"||Aa(t))&&((e||(e={}))[t]=n[t]);return e},wv=(n,e)=>{const t={};for(const i in n)(!uu(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function Tv(n,e,t){const{props:i,children:s,component:r}=n,{props:o,children:a,patchFlag:l}=e,c=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?xd(i,o,c):!!o;if(l&8){const u=e.dynamicProps;for(let f=0;f<u.length;f++){const h=u[f];if(o[h]!==i[h]&&!ka(c,h))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?xd(i,o,c):!0:!!o;return!1}function xd(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==n[r]&&!ka(t,r))return!0}return!1}function Av({vnode:n,parent:e},t){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===n&&(i.el=n.el),i===n)(n=e.vnode).el=t,e=e.parent;else break}}const gp={},vp=()=>Object.create(gp),_p=n=>Object.getPrototypeOf(n)===gp;function Cv(n,e,t,i=!1){const s={},r=vp();n.propsDefaults=Object.create(null),xp(n,e,s,r);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=i?s:Wh(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function Rv(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=n,a=ft(s),[l]=n.propsOptions;let c=!1;if((i||o>0)&&!(o&16)){if(o&8){const u=n.vnode.dynamicProps;for(let f=0;f<u.length;f++){let h=u[f];if(ka(n.emitsOptions,h))continue;const m=e[h];if(l)if(xt(r,h))m!==r[h]&&(r[h]=m,c=!0);else{const _=kn(h);s[_]=sc(l,a,_,m,n,!1)}else m!==r[h]&&(r[h]=m,c=!0)}}}else{xp(n,e,s,r)&&(c=!0);let u;for(const f in a)(!e||!xt(e,f)&&((u=ns(f))===f||!xt(e,u)))&&(l?t&&(t[f]!==void 0||t[u]!==void 0)&&(s[f]=sc(l,a,f,void 0,n,!0)):delete s[f]);if(r!==a)for(const f in r)(!e||!xt(e,f))&&(delete r[f],c=!0)}c&&Ei(n.attrs,"set","")}function xp(n,e,t,i){const[s,r]=n.propsOptions;let o=!1,a;if(e)for(let l in e){if(Fr(l))continue;const c=e[l];let u;s&&xt(s,u=kn(l))?!r||!r.includes(u)?t[u]=c:(a||(a={}))[u]=c:ka(n.emitsOptions,l)||(!(l in i)||c!==i[l])&&(i[l]=c,o=!0)}if(r){const l=ft(t),c=a||At;for(let u=0;u<r.length;u++){const f=r[u];t[f]=sc(s,l,f,c[f],n,!xt(c,f))}}return o}function sc(n,e,t,i,s,r){const o=n[t];if(o!=null){const a=xt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&et(l)){const{propsDefaults:c}=s;if(t in c)i=c[t];else{const u=co(s);i=c[t]=l.call(null,e),u()}}else i=l;s.ce&&s.ce._setProp(t,i)}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===ns(t))&&(i=!0))}return i}const Pv=new WeakMap;function yp(n,e,t=!1){const i=t?Pv:e.propsCache,s=i.get(n);if(s)return s;const r=n.props,o={},a=[];let l=!1;if(!et(n)){const u=f=>{l=!0;const[h,m]=yp(f,e,!0);$t(o,h),m&&a.push(...m)};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}if(!r&&!l)return wt(n)&&i.set(n,Ks),Ks;if(qe(r))for(let u=0;u<r.length;u++){const f=kn(r[u]);yd(f)&&(o[f]=At)}else if(r)for(const u in r){const f=kn(u);if(yd(f)){const h=r[u],m=o[f]=qe(h)||et(h)?{type:h}:$t({},h),_=m.type;let v=!1,g=!0;if(qe(_))for(let p=0;p<_.length;++p){const b=_[p],y=et(b)&&b.name;if(y==="Boolean"){v=!0;break}else y==="String"&&(g=!1)}else v=et(_)&&_.name==="Boolean";m[0]=v,m[1]=g,(v||xt(m,"default"))&&a.push(f)}}const c=[o,a];return wt(n)&&i.set(n,c),c}function yd(n){return n[0]!=="$"&&!Fr(n)}const Su=n=>n==="_"||n==="_ctx"||n==="$stable",bu=n=>qe(n)?n.map(ti):[ti(n)],Iv=(n,e,t)=>{if(e._n)return e;const i=Nn((...s)=>bu(e(...s)),t);return i._c=!1,i},Sp=(n,e,t)=>{const i=n._ctx;for(const s in n){if(Su(s))continue;const r=n[s];if(et(r))e[s]=Iv(s,r,i);else if(r!=null){const o=bu(r);e[s]=()=>o}}},bp=(n,e)=>{const t=bu(e);n.slots.default=()=>t},Mp=(n,e,t)=>{for(const i in e)(t||!Su(i))&&(n[i]=e[i])},Dv=(n,e,t)=>{const i=n.slots=vp();if(n.vnode.shapeFlag&32){const s=e._;s?(Mp(i,e,t),t&&Eh(i,"_",s,!0)):Sp(e,i)}else e&&bp(n,e)},Lv=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,o=At;if(i.shapeFlag&32){const a=e._;a?t&&a===1?r=!1:Mp(s,e,t):(r=!e.$stable,Sp(e,s)),o=e}else e&&(bp(n,e),o={default:1});if(r)for(const a in s)!Su(a)&&o[a]==null&&delete s[a]},dn=Ov;function Nv(n){return Uv(n)}function Uv(n,e){const t=Da();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:c,setElementText:u,parentNode:f,nextSibling:h,setScopeId:m=oi,insertStaticContent:_}=n,v=(k,z,q,H=null,D=null,X=null,L=void 0,ye=null,me=!!z.dynamicChildren)=>{if(k===z)return;k&&!js(k,z)&&(H=W(k),xe(k,D,X,!0),k=null),z.patchFlag===-2&&(me=!1,z.dynamicChildren=null);const{type:ue,ref:ge,shapeFlag:A}=z;switch(ue){case Oa:g(k,z,q,H);break;case ui:p(k,z,q,H);break;case ea:k==null&&b(z,q,H,L);break;case $e:O(k,z,q,H,D,X,L,ye,me);break;default:A&1?T(k,z,q,H,D,X,L,ye,me):A&6?j(k,z,q,H,D,X,L,ye,me):(A&64||A&128)&&ue.process(k,z,q,H,D,X,L,ye,me,he)}ge!=null&&D?Vr(ge,k&&k.ref,X,z||k,!z):ge==null&&k&&k.ref!=null&&Vr(k.ref,null,X,k,!0)},g=(k,z,q,H)=>{if(k==null)i(z.el=a(z.children),q,H);else{const D=z.el=k.el;z.children!==k.children&&c(D,z.children)}},p=(k,z,q,H)=>{k==null?i(z.el=l(z.children||""),q,H):z.el=k.el},b=(k,z,q,H)=>{[k.el,k.anchor]=_(k.children,z,q,H,k.el,k.anchor)},y=({el:k,anchor:z},q,H)=>{let D;for(;k&&k!==z;)D=h(k),i(k,q,H),k=D;i(z,q,H)},M=({el:k,anchor:z})=>{let q;for(;k&&k!==z;)q=h(k),s(k),k=q;s(z)},T=(k,z,q,H,D,X,L,ye,me)=>{if(z.type==="svg"?L="svg":z.type==="math"&&(L="mathml"),k==null)C(z,q,H,D,X,L,ye,me);else{const ue=k.el&&k.el._isVueCE?k.el:null;try{ue&&ue._beginPatch(),x(k,z,D,X,L,ye,me)}finally{ue&&ue._endPatch()}}},C=(k,z,q,H,D,X,L,ye)=>{let me,ue;const{props:ge,shapeFlag:A,transition:S,dirs:G}=k;if(me=k.el=o(k.type,X,ge&&ge.is,ge),A&8?u(me,k.children):A&16&&R(k.children,me,null,H,D,sl(k,X),L,ye),G&&rs(k,null,H,"created"),w(me,k,k.scopeId,L,H),ge){for(const de in ge)de!=="value"&&!Fr(de)&&r(me,de,null,ge[de],X,H);"value"in ge&&r(me,"value",null,ge.value,X),(ue=ge.onVnodeBeforeMount)&&Zn(ue,H,k)}G&&rs(k,null,H,"beforeMount");const se=Fv(D,S);se&&S.beforeEnter(me),i(me,z,q),((ue=ge&&ge.onVnodeMounted)||se||G)&&dn(()=>{ue&&Zn(ue,H,k),se&&S.enter(me),G&&rs(k,null,H,"mounted")},D)},w=(k,z,q,H,D)=>{if(q&&m(k,q),H)for(let X=0;X<H.length;X++)m(k,H[X]);if(D){let X=D.subTree;if(z===X||Tp(X.type)&&(X.ssContent===z||X.ssFallback===z)){const L=D.vnode;w(k,L,L.scopeId,L.slotScopeIds,D.parent)}}},R=(k,z,q,H,D,X,L,ye,me=0)=>{for(let ue=me;ue<k.length;ue++){const ge=k[ue]=ye?Yi(k[ue]):ti(k[ue]);v(null,ge,z,q,H,D,X,L,ye)}},x=(k,z,q,H,D,X,L)=>{const ye=z.el=k.el;let{patchFlag:me,dynamicChildren:ue,dirs:ge}=z;me|=k.patchFlag&16;const A=k.props||At,S=z.props||At;let G;if(q&&os(q,!1),(G=S.onVnodeBeforeUpdate)&&Zn(G,q,z,k),ge&&rs(z,k,q,"beforeUpdate"),q&&os(q,!0),(A.innerHTML&&S.innerHTML==null||A.textContent&&S.textContent==null)&&u(ye,""),ue?E(k.dynamicChildren,ue,ye,q,H,sl(z,D),X):L||F(k,z,ye,null,q,H,sl(z,D),X,!1),me>0){if(me&16)U(ye,A,S,q,D);else if(me&2&&A.class!==S.class&&r(ye,"class",null,S.class,D),me&4&&r(ye,"style",A.style,S.style,D),me&8){const se=z.dynamicProps;for(let de=0;de<se.length;de++){const ne=se[de],Ne=A[ne],be=S[ne];(be!==Ne||ne==="value")&&r(ye,ne,Ne,be,D,q)}}me&1&&k.children!==z.children&&u(ye,z.children)}else!L&&ue==null&&U(ye,A,S,q,D);((G=S.onVnodeUpdated)||ge)&&dn(()=>{G&&Zn(G,q,z,k),ge&&rs(z,k,q,"updated")},H)},E=(k,z,q,H,D,X,L)=>{for(let ye=0;ye<z.length;ye++){const me=k[ye],ue=z[ye],ge=me.el&&(me.type===$e||!js(me,ue)||me.shapeFlag&198)?f(me.el):q;v(me,ue,ge,null,H,D,X,L,!0)}},U=(k,z,q,H,D)=>{if(z!==q){if(z!==At)for(const X in z)!Fr(X)&&!(X in q)&&r(k,X,z[X],null,D,H);for(const X in q){if(Fr(X))continue;const L=q[X],ye=z[X];L!==ye&&X!=="value"&&r(k,X,ye,L,D,H)}"value"in q&&r(k,"value",z.value,q.value,D)}},O=(k,z,q,H,D,X,L,ye,me)=>{const ue=z.el=k?k.el:a(""),ge=z.anchor=k?k.anchor:a("");let{patchFlag:A,dynamicChildren:S,slotScopeIds:G}=z;G&&(ye=ye?ye.concat(G):G),k==null?(i(ue,q,H),i(ge,q,H),R(z.children||[],q,ge,D,X,L,ye,me)):A>0&&A&64&&S&&k.dynamicChildren&&k.dynamicChildren.length===S.length?(E(k.dynamicChildren,S,q,D,X,L,ye),(z.key!=null||D&&z===D.subTree)&&Mu(k,z,!0)):F(k,z,q,ge,D,X,L,ye,me)},j=(k,z,q,H,D,X,L,ye,me)=>{z.slotScopeIds=ye,k==null?z.shapeFlag&512?D.ctx.activate(z,q,H,L,me):ee(z,q,H,D,X,L,me):Q(k,z,me)},ee=(k,z,q,H,D,X,L)=>{const ye=k.component=Wv(k,H,D);if(op(k)&&(ye.ctx.renderer=he),Xv(ye,!1,L),ye.asyncDep){if(D&&D.registerDep(ye,Z,L),!k.el){const me=ye.subTree=pt(ui);p(null,me,z,q),k.placeholder=me.el}}else Z(ye,k,z,q,D,X,L)},Q=(k,z,q)=>{const H=z.component=k.component;if(Tv(k,z,q))if(H.asyncDep&&!H.asyncResolved){I(H,z,q);return}else H.next=z,H.update();else z.el=k.el,H.vnode=z},Z=(k,z,q,H,D,X,L)=>{const ye=()=>{if(k.isMounted){let{next:A,bu:S,u:G,parent:se,vnode:de}=k;{const We=Ep(k);if(We){A&&(A.el=de.el,I(k,A,L)),We.asyncDep.then(()=>{k.isUnmounted||ye()});return}}let ne=A,Ne;os(k,!1),A?(A.el=de.el,I(k,A,L)):A=de,S&&Zo(S),(Ne=A.props&&A.props.onVnodeBeforeUpdate)&&Zn(Ne,se,A,de),os(k,!0);const be=_d(k),ke=k.subTree;k.subTree=be,v(ke,be,f(ke.el),W(ke),k,D,X),A.el=be.el,ne===null&&Av(k,be.el),G&&dn(G,D),(Ne=A.props&&A.props.onVnodeUpdated)&&dn(()=>Zn(Ne,se,A,de),D)}else{let A;const{el:S,props:G}=z,{bm:se,m:de,parent:ne,root:Ne,type:be}=k,ke=Qs(z);os(k,!1),se&&Zo(se),!ke&&(A=G&&G.onVnodeBeforeMount)&&Zn(A,ne,z),os(k,!0);{Ne.ce&&Ne.ce._def.shadowRoot!==!1&&Ne.ce._injectChildStyle(be);const We=k.subTree=_d(k);v(null,We,q,H,k,D,X),z.el=We.el}if(de&&dn(de,D),!ke&&(A=G&&G.onVnodeMounted)){const We=z;dn(()=>Zn(A,ne,We),D)}(z.shapeFlag&256||ne&&Qs(ne.vnode)&&ne.vnode.shapeFlag&256)&&k.a&&dn(k.a,D),k.isMounted=!0,z=q=H=null}};k.scope.on();const me=k.effect=new Ih(ye);k.scope.off();const ue=k.update=me.run.bind(me),ge=k.job=me.runIfDirty.bind(me);ge.i=k,ge.id=k.uid,me.scheduler=()=>yu(ge),os(k,!0),ue()},I=(k,z,q)=>{z.component=k;const H=k.vnode.props;k.vnode=z,k.next=null,Rv(k,z.props,H,q),Lv(k,z.children,q),Ii(),ld(k),Di()},F=(k,z,q,H,D,X,L,ye,me=!1)=>{const ue=k&&k.children,ge=k?k.shapeFlag:0,A=z.children,{patchFlag:S,shapeFlag:G}=z;if(S>0){if(S&128){le(ue,A,q,H,D,X,L,ye,me);return}else if(S&256){$(ue,A,q,H,D,X,L,ye,me);return}}G&8?(ge&16&&fe(ue,D,X),A!==ue&&u(q,A)):ge&16?G&16?le(ue,A,q,H,D,X,L,ye,me):fe(ue,D,X,!0):(ge&8&&u(q,""),G&16&&R(A,q,H,D,X,L,ye,me))},$=(k,z,q,H,D,X,L,ye,me)=>{k=k||Ks,z=z||Ks;const ue=k.length,ge=z.length,A=Math.min(ue,ge);let S;for(S=0;S<A;S++){const G=z[S]=me?Yi(z[S]):ti(z[S]);v(k[S],G,q,null,D,X,L,ye,me)}ue>ge?fe(k,D,X,!0,!1,A):R(z,q,H,D,X,L,ye,me,A)},le=(k,z,q,H,D,X,L,ye,me)=>{let ue=0;const ge=z.length;let A=k.length-1,S=ge-1;for(;ue<=A&&ue<=S;){const G=k[ue],se=z[ue]=me?Yi(z[ue]):ti(z[ue]);if(js(G,se))v(G,se,q,null,D,X,L,ye,me);else break;ue++}for(;ue<=A&&ue<=S;){const G=k[A],se=z[S]=me?Yi(z[S]):ti(z[S]);if(js(G,se))v(G,se,q,null,D,X,L,ye,me);else break;A--,S--}if(ue>A){if(ue<=S){const G=S+1,se=G<ge?z[G].el:H;for(;ue<=S;)v(null,z[ue]=me?Yi(z[ue]):ti(z[ue]),q,se,D,X,L,ye,me),ue++}}else if(ue>S)for(;ue<=A;)xe(k[ue],D,X,!0),ue++;else{const G=ue,se=ue,de=new Map;for(ue=se;ue<=S;ue++){const Pe=z[ue]=me?Yi(z[ue]):ti(z[ue]);Pe.key!=null&&de.set(Pe.key,ue)}let ne,Ne=0;const be=S-se+1;let ke=!1,We=0;const Se=new Array(be);for(ue=0;ue<be;ue++)Se[ue]=0;for(ue=G;ue<=A;ue++){const Pe=k[ue];if(Ne>=be){xe(Pe,D,X,!0);continue}let Oe;if(Pe.key!=null)Oe=de.get(Pe.key);else for(ne=se;ne<=S;ne++)if(Se[ne-se]===0&&js(Pe,z[ne])){Oe=ne;break}Oe===void 0?xe(Pe,D,X,!0):(Se[Oe-se]=ue+1,Oe>=We?We=Oe:ke=!0,v(Pe,z[Oe],q,null,D,X,L,ye,me),Ne++)}const Ce=ke?kv(Se):Ks;for(ne=Ce.length-1,ue=be-1;ue>=0;ue--){const Pe=se+ue,Oe=z[Pe],Ae=z[Pe+1],nt=Pe+1<ge?Ae.el||wp(Ae):H;Se[ue]===0?v(null,Oe,q,nt,D,X,L,ye,me):ke&&(ne<0||ue!==Ce[ne]?re(Oe,q,nt,2):ne--)}}},re=(k,z,q,H,D=null)=>{const{el:X,type:L,transition:ye,children:me,shapeFlag:ue}=k;if(ue&6){re(k.component.subTree,z,q,H);return}if(ue&128){k.suspense.move(z,q,H);return}if(ue&64){L.move(k,z,q,he);return}if(L===$e){i(X,z,q);for(let A=0;A<me.length;A++)re(me[A],z,q,H);i(k.anchor,z,q);return}if(L===ea){y(k,z,q);return}if(H!==2&&ue&1&&ye)if(H===0)ye.beforeEnter(X),i(X,z,q),dn(()=>ye.enter(X),D);else{const{leave:A,delayLeave:S,afterLeave:G}=ye,se=()=>{k.ctx.isUnmounted?s(X):i(X,z,q)},de=()=>{X._isLeaving&&X[gs](!0),A(X,()=>{se(),G&&G()})};S?S(X,se,de):de()}else i(X,z,q)},xe=(k,z,q,H=!1,D=!1)=>{const{type:X,props:L,ref:ye,children:me,dynamicChildren:ue,shapeFlag:ge,patchFlag:A,dirs:S,cacheIndex:G}=k;if(A===-2&&(D=!1),ye!=null&&(Ii(),Vr(ye,null,q,k,!0),Di()),G!=null&&(z.renderCache[G]=void 0),ge&256){z.ctx.deactivate(k);return}const se=ge&1&&S,de=!Qs(k);let ne;if(de&&(ne=L&&L.onVnodeBeforeUnmount)&&Zn(ne,z,k),ge&6)st(k.component,q,H);else{if(ge&128){k.suspense.unmount(q,H);return}se&&rs(k,null,z,"beforeUnmount"),ge&64?k.type.remove(k,z,q,he,H):ue&&!ue.hasOnce&&(X!==$e||A>0&&A&64)?fe(ue,z,q,!1,!0):(X===$e&&A&384||!D&&ge&16)&&fe(me,z,q),H&&Te(k)}(de&&(ne=L&&L.onVnodeUnmounted)||se)&&dn(()=>{ne&&Zn(ne,z,k),se&&rs(k,null,z,"unmounted")},q)},Te=k=>{const{type:z,el:q,anchor:H,transition:D}=k;if(z===$e){at(q,H);return}if(z===ea){M(k);return}const X=()=>{s(q),D&&!D.persisted&&D.afterLeave&&D.afterLeave()};if(k.shapeFlag&1&&D&&!D.persisted){const{leave:L,delayLeave:ye}=D,me=()=>L(q,X);ye?ye(k.el,X,me):me()}else X()},at=(k,z)=>{let q;for(;k!==z;)q=h(k),s(k),k=q;s(z)},st=(k,z,q)=>{const{bum:H,scope:D,job:X,subTree:L,um:ye,m:me,a:ue}=k;Sd(me),Sd(ue),H&&Zo(H),D.stop(),X&&(X.flags|=8,xe(L,k,z,q)),ye&&dn(ye,z),dn(()=>{k.isUnmounted=!0},z)},fe=(k,z,q,H=!1,D=!1,X=0)=>{for(let L=X;L<k.length;L++)xe(k[L],z,q,H,D)},W=k=>{if(k.shapeFlag&6)return W(k.component.subTree);if(k.shapeFlag&128)return k.suspense.next();const z=h(k.anchor||k.el),q=z&&z[tp];return q?h(q):z};let ce=!1;const pe=(k,z,q)=>{let H;k==null?z._vnode&&(xe(z._vnode,null,null,!0),H=z._vnode.component):v(z._vnode||null,k,z,null,null,null,q),z._vnode=k,ce||(ce=!0,ld(H),Kh(),ce=!1)},he={p:v,um:xe,m:re,r:Te,mt:ee,mc:R,pc:F,pbc:E,n:W,o:n};return{render:pe,hydrate:void 0,createApp:yv(pe)}}function sl({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function os({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function Fv(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Mu(n,e,t=!1){const i=n.children,s=e.children;if(qe(i)&&qe(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=Yi(s[r]),a.el=o.el),!t&&a.patchFlag!==-2&&Mu(o,a)),a.type===Oa&&(a.patchFlag!==-1?a.el=o.el:a.__elIndex=r+(n.type===$e?1:0)),a.type===ui&&!a.el&&(a.el=o.el)}}function kv(n){const e=n.slice(),t=[0];let i,s,r,o,a;const l=n.length;for(i=0;i<l;i++){const c=n[i];if(c!==0){if(s=t[t.length-1],n[s]<c){e[i]=s,t.push(i);continue}for(r=0,o=t.length-1;r<o;)a=r+o>>1,n[t[a]]<c?r=a+1:o=a;c<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,o=t[r-1];r-- >0;)t[r]=o,o=e[o];return t}function Ep(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Ep(e)}function Sd(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}function wp(n){if(n.placeholder)return n.placeholder;const e=n.component;return e?wp(e.subTree):null}const Tp=n=>n.__isSuspense;function Ov(n,e){e&&e.pendingBranch?qe(n)?e.effects.push(...n):e.effects.push(n):Gg(n)}const $e=Symbol.for("v-fgt"),Oa=Symbol.for("v-txt"),ui=Symbol.for("v-cmt"),ea=Symbol.for("v-stc"),Hr=[];let En=null;function N(n=!1){Hr.push(En=n?null:[])}function Bv(){Hr.pop(),En=Hr[Hr.length-1]||null}let Kr=1;function va(n,e=!1){Kr+=n,n<0&&En&&e&&(En.hasOnce=!0)}function Ap(n){return n.dynamicChildren=Kr>0?En||Ks:null,Bv(),Kr>0&&En&&En.push(n),n}function B(n,e,t,i,s,r){return Ap(d(n,e,t,i,s,r,!0))}function Yt(n,e,t,i,s){return Ap(pt(n,e,t,i,s,!0))}function Zr(n){return n?n.__v_isVNode===!0:!1}function js(n,e){return n.type===e.type&&n.key===e.key}const Cp=({key:n})=>n??null,ta=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Ht(n)||zt(n)||et(n)?{i:Kt,r:n,k:e,f:!!t}:n:null);function d(n,e=null,t=null,i=0,s=null,r=n===$e?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&Cp(e),ref:e&&ta(e),scopeId:Jh,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Kt};return a?(Eu(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=Ht(t)?8:16),Kr>0&&!o&&En&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&En.push(l),l}const pt=Vv;function Vv(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===dv)&&(n=ui),Zr(n)){const a=As(n,e,!0);return t&&Eu(a,t),Kr>0&&!r&&En&&(a.shapeFlag&6?En[En.indexOf(n)]=a:En.push(a)),a.patchFlag=-2,a}if(Zv(n)&&(n=n.__vccOpts),e){e=zv(e);let{class:a,style:l}=e;a&&!Ht(a)&&(e.class=Be(a)),wt(l)&&(Na(l)&&!qe(l)&&(l=$t({},l)),e.style=Dt(l))}const o=Ht(n)?1:Tp(n)?128:jg(n)?64:wt(n)?4:et(n)?2:0;return d(n,e,t,i,s,o,r,!0)}function zv(n){return n?Na(n)||_p(n)?$t({},n):n:null}function As(n,e,t=!1,i=!1){const{props:s,ref:r,patchFlag:o,children:a,transition:l}=n,c=e?Hv(s||{},e):s,u={__v_isVNode:!0,__v_skip:!0,type:n.type,props:c,key:c&&Cp(c),ref:e&&e.ref?t&&r?qe(r)?r.concat(ta(e)):[r,ta(e)]:ta(e):r,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:a,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==$e?o===-1?16:o|16:o,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:l,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&As(n.ssContent),ssFallback:n.ssFallback&&As(n.ssFallback),placeholder:n.placeholder,el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return l&&i&&Yr(u,l.clone(u)),u}function Lt(n=" ",e=0){return pt(Oa,null,n,e)}function ir(n,e){const t=pt(ea,null,n);return t.staticCount=e,t}function Ee(n="",e=!1){return e?(N(),Yt(ui,null,n)):pt(ui,null,n)}function ti(n){return n==null||typeof n=="boolean"?pt(ui):qe(n)?pt($e,null,n.slice()):Zr(n)?Yi(n):pt(Oa,null,String(n))}function Yi(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:As(n)}function Eu(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(qe(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),Eu(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!_p(e)?e._ctx=Kt:s===3&&Kt&&(Kt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else et(e)?(e={default:e,_ctx:Kt},t=32):(e=String(e),i&64?(t=16,e=[Lt(e)]):t=8);n.children=e,n.shapeFlag|=t}function Hv(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Be([e.class,i.class]));else if(s==="style")e.style=Dt([e.style,i.style]);else if(Aa(s)){const r=e[s],o=i[s];o&&r!==o&&!(qe(r)&&r.includes(o))&&(e[s]=r?[].concat(r,o):o)}else s!==""&&(e[s]=i[s])}return e}function Zn(n,e,t,i=null){qn(n,e,7,[t,i])}const Gv=pp();let $v=0;function Wv(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||Gv,r={uid:$v++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Ch(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:yp(i,s),emitsOptions:mp(i,s),emit:null,emitted:null,propsDefaults:At,inheritAttrs:i.inheritAttrs,ctx:At,data:At,props:At,attrs:At,slots:At,refs:At,setupState:At,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=bv.bind(null,r),n.ce&&n.ce(r),r}let rn=null;const wu=()=>rn||Kt;let _a,rc;{const n=Da(),e=(t,i)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(i),r=>{s.length>1?s.forEach(o=>o(r)):s[0](r)}};_a=e("__VUE_INSTANCE_SETTERS__",t=>rn=t),rc=e("__VUE_SSR_SETTERS__",t=>Jr=t)}const co=n=>{const e=rn;return _a(n),n.scope.on(),()=>{n.scope.off(),_a(e)}},bd=()=>{rn&&rn.scope.off(),_a(null)};function Rp(n){return n.vnode.shapeFlag&4}let Jr=!1;function Xv(n,e=!1,t=!1){e&&rc(e);const{props:i,children:s}=n.vnode,r=Rp(n);Cv(n,i,r,e),Dv(n,s,t||e);const o=r?qv(n,e):void 0;return e&&rc(!1),o}function qv(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,hv);const{setup:i}=t;if(i){Ii();const s=n.setupContext=i.length>1?Yv(n):null,r=co(n),o=ao(i,n,0,[n.props,s]),a=Sh(o);if(Di(),r(),(a||n.sp)&&!Qs(n)&&rp(n),a){if(o.then(bd,bd),e)return o.then(l=>{Md(n,l)}).catch(l=>{Ua(l,n,0)});n.asyncDep=o}else Md(n,o)}else Pp(n)}function Md(n,e,t){et(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:wt(e)&&(n.setupState=qh(e)),Pp(n)}function Pp(n,e,t){const i=n.type;n.render||(n.render=i.render||oi);{const s=co(n);Ii();try{pv(n)}finally{Di(),s()}}}const jv={get(n,e){return sn(n,"get",""),n[e]}};function Yv(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,jv),slots:n.slots,emit:n.emit,expose:e}}function Ba(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(qh(xu(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in zr)return zr[t](n)},has(e,t){return t in e||t in zr}})):n.proxy}function Kv(n,e=!0){return et(n)?n.displayName||n.name:n.name||e&&n.__name}function Zv(n){return et(n)&&"__vccOpts"in n}const ot=(n,e)=>Og(n,e,Jr);function Ip(n,e,t){try{va(-1);const i=arguments.length;return i===2?wt(e)&&!qe(e)?Zr(e)?pt(n,null,[e]):pt(n,e):pt(n,null,e):(i>3?t=Array.prototype.slice.call(arguments,2):i===3&&Zr(t)&&(t=[t]),pt(n,e,t))}finally{va(1)}}const Jv="3.5.27";/**
* @vue/runtime-dom v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let oc;const Ed=typeof window<"u"&&window.trustedTypes;if(Ed)try{oc=Ed.createPolicy("vue",{createHTML:n=>n})}catch{}const Dp=oc?n=>oc.createHTML(n):n=>n,Qv="http://www.w3.org/2000/svg",e_="http://www.w3.org/1998/Math/MathML",Mi=typeof document<"u"?document:null,wd=Mi&&Mi.createElement("template"),t_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e==="svg"?Mi.createElementNS(Qv,n):e==="mathml"?Mi.createElementNS(e_,n):t?Mi.createElement(n,{is:t}):Mi.createElement(n);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>Mi.createTextNode(n),createComment:n=>Mi.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>Mi.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const o=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{wd.innerHTML=Dp(i==="svg"?`<svg>${n}</svg>`:i==="mathml"?`<math>${n}</math>`:n);const a=wd.content;if(i==="svg"||i==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},ki="transition",yr="animation",sr=Symbol("_vtc"),Lp={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},n_=$t({},Jg,Lp),as=(n,e=[])=>{qe(n)?n.forEach(t=>t(...e)):n&&n(...e)},Td=n=>n?qe(n)?n.some(e=>e.length>1):n.length>1:!1;function i_(n){const e={};for(const O in n)O in Lp||(e[O]=n[O]);if(n.css===!1)return e;const{name:t="v",type:i,duration:s,enterFromClass:r=`${t}-enter-from`,enterActiveClass:o=`${t}-enter-active`,enterToClass:a=`${t}-enter-to`,appearFromClass:l=r,appearActiveClass:c=o,appearToClass:u=a,leaveFromClass:f=`${t}-leave-from`,leaveActiveClass:h=`${t}-leave-active`,leaveToClass:m=`${t}-leave-to`}=n,_=s_(s),v=_&&_[0],g=_&&_[1],{onBeforeEnter:p,onEnter:b,onEnterCancelled:y,onLeave:M,onLeaveCancelled:T,onBeforeAppear:C=p,onAppear:w=b,onAppearCancelled:R=y}=e,x=(O,j,ee,Q)=>{O._enterCancelled=Q,Wi(O,j?u:a),Wi(O,j?c:o),ee&&ee()},E=(O,j)=>{O._isLeaving=!1,Wi(O,f),Wi(O,m),Wi(O,h),j&&j()},U=O=>(j,ee)=>{const Q=O?w:b,Z=()=>x(j,O,ee);as(Q,[j,Z]),Ad(()=>{Wi(j,O?l:r),Qn(j,O?u:a),Td(Q)||Cd(j,i,v,Z)})};return $t(e,{onBeforeEnter(O){as(p,[O]),Qn(O,r),Qn(O,o)},onBeforeAppear(O){as(C,[O]),Qn(O,l),Qn(O,c)},onEnter:U(!1),onAppear:U(!0),onLeave(O,j){O._isLeaving=!0;const ee=()=>E(O,j);Qn(O,f),O._enterCancelled?(Qn(O,h),ac(O)):(ac(O),Qn(O,h)),Ad(()=>{O._isLeaving&&(Wi(O,f),Qn(O,m),Td(M)||Cd(O,i,g,ee))}),as(M,[O,ee])},onEnterCancelled(O){x(O,!1,void 0,!0),as(y,[O])},onAppearCancelled(O){x(O,!0,void 0,!0),as(R,[O])},onLeaveCancelled(O){E(O),as(T,[O])}})}function s_(n){if(n==null)return null;if(wt(n))return[rl(n.enter),rl(n.leave)];{const e=rl(n);return[e,e]}}function rl(n){return ig(n)}function Qn(n,e){e.split(/\s+/).forEach(t=>t&&n.classList.add(t)),(n[sr]||(n[sr]=new Set)).add(e)}function Wi(n,e){e.split(/\s+/).forEach(i=>i&&n.classList.remove(i));const t=n[sr];t&&(t.delete(e),t.size||(n[sr]=void 0))}function Ad(n){requestAnimationFrame(()=>{requestAnimationFrame(n)})}let r_=0;function Cd(n,e,t,i){const s=n._endId=++r_,r=()=>{s===n._endId&&i()};if(t!=null)return setTimeout(r,t);const{type:o,timeout:a,propCount:l}=Np(n,e);if(!o)return i();const c=o+"end";let u=0;const f=()=>{n.removeEventListener(c,h),r()},h=m=>{m.target===n&&++u>=l&&f()};setTimeout(()=>{u<l&&f()},a+1),n.addEventListener(c,h)}function Np(n,e){const t=window.getComputedStyle(n),i=_=>(t[_]||"").split(", "),s=i(`${ki}Delay`),r=i(`${ki}Duration`),o=Rd(s,r),a=i(`${yr}Delay`),l=i(`${yr}Duration`),c=Rd(a,l);let u=null,f=0,h=0;e===ki?o>0&&(u=ki,f=o,h=r.length):e===yr?c>0&&(u=yr,f=c,h=l.length):(f=Math.max(o,c),u=f>0?o>c?ki:yr:null,h=u?u===ki?r.length:l.length:0);const m=u===ki&&/\b(?:transform|all)(?:,|$)/.test(i(`${ki}Property`).toString());return{type:u,timeout:f,propCount:h,hasTransform:m}}function Rd(n,e){for(;n.length<e.length;)n=n.concat(n);return Math.max(...e.map((t,i)=>Pd(t)+Pd(n[i])))}function Pd(n){return n==="auto"?0:Number(n.slice(0,-1).replace(",","."))*1e3}function ac(n){return(n?n.ownerDocument:document).body.offsetHeight}function o_(n,e,t){const i=n[sr];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const xa=Symbol("_vod"),Up=Symbol("_vsh"),a_={name:"show",beforeMount(n,{value:e},{transition:t}){n[xa]=n.style.display==="none"?"":n.style.display,t&&e?t.beforeEnter(n):Sr(n,e)},mounted(n,{value:e},{transition:t}){t&&e&&t.enter(n)},updated(n,{value:e,oldValue:t},{transition:i}){!e!=!t&&(i?e?(i.beforeEnter(n),Sr(n,!0),i.enter(n)):i.leave(n,()=>{Sr(n,!1)}):Sr(n,e))},beforeUnmount(n,{value:e}){Sr(n,e)}};function Sr(n,e){n.style.display=e?n[xa]:"none",n[Up]=!e}const l_=Symbol(""),c_=/(?:^|;)\s*display\s*:/;function u_(n,e,t){const i=n.style,s=Ht(t);let r=!1;if(t&&!s){if(e)if(Ht(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();t[a]==null&&na(i,a,"")}else for(const o in e)t[o]==null&&na(i,o,"");for(const o in t)o==="display"&&(r=!0),na(i,o,t[o])}else if(s){if(e!==t){const o=i[l_];o&&(t+=";"+o),i.cssText=t,r=c_.test(t)}}else e&&n.removeAttribute("style");xa in n&&(n[xa]=r?i.display:"",n[Up]&&(i.display="none"))}const Id=/\s*!important$/;function na(n,e,t){if(qe(t))t.forEach(i=>na(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=d_(n,e);Id.test(t)?n.setProperty(ns(i),t.replace(Id,""),"important"):n[i]=t}}const Dd=["Webkit","Moz","ms"],ol={};function d_(n,e){const t=ol[e];if(t)return t;let i=kn(e);if(i!=="filter"&&i in n)return ol[e]=i;i=Pa(i);for(let s=0;s<Dd.length;s++){const r=Dd[s]+i;if(r in n)return ol[e]=r}return e}const Ld="http://www.w3.org/1999/xlink";function Nd(n,e,t,i,s,r=cg(e)){i&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Ld,e.slice(6,e.length)):n.setAttributeNS(Ld,e,t):t==null||r&&!wh(t)?n.removeAttribute(e):n.setAttribute(e,r?"":Wn(t)?String(t):t)}function Ud(n,e,t,i,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Dp(t):t);return}const r=n.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const a=r==="OPTION"?n.getAttribute("value")||"":n.value,l=t==null?n.type==="checkbox"?"on":"":String(t);(a!==l||!("_value"in n))&&(n.value=l),t==null&&n.removeAttribute(e),n._value=t;return}let o=!1;if(t===""||t==null){const a=typeof n[e];a==="boolean"?t=wh(t):t==null&&a==="string"?(t="",o=!0):a==="number"&&(t=0,o=!0)}try{n[e]=t}catch{}o&&n.removeAttribute(s||e)}function Ti(n,e,t,i){n.addEventListener(e,t,i)}function f_(n,e,t,i){n.removeEventListener(e,t,i)}const Fd=Symbol("_vei");function h_(n,e,t,i,s=null){const r=n[Fd]||(n[Fd]={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=p_(e);if(i){const c=r[e]=v_(i,s);Ti(n,a,c,l)}else o&&(f_(n,a,o,l),r[e]=void 0)}}const kd=/(?:Once|Passive|Capture)$/;function p_(n){let e;if(kd.test(n)){e={};let i;for(;i=n.match(kd);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):ns(n.slice(2)),e]}let al=0;const m_=Promise.resolve(),g_=()=>al||(m_.then(()=>al=0),al=Date.now());function v_(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;qn(__(i,t.value),e,5,[i])};return t.value=n,t.attached=g_(),t}function __(n,e){if(qe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const Od=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,x_=(n,e,t,i,s,r)=>{const o=s==="svg";e==="class"?o_(n,i,o):e==="style"?u_(n,t,i):Aa(e)?uu(e)||h_(n,e,t,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):y_(n,e,i,o))?(Ud(n,e,i),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Nd(n,e,i,o,r,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Ht(i))?Ud(n,kn(e),i,r,e):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),Nd(n,e,i,o))};function y_(n,e,t,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in n&&Od(e)&&et(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&n.tagName==="IFRAME"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Od(e)&&Ht(t)?!1:e in n}const Fp=new WeakMap,kp=new WeakMap,ya=Symbol("_moveCb"),Bd=Symbol("_enterCb"),S_=n=>(delete n.props.mode,n),b_=S_({name:"TransitionGroup",props:$t({},n_,{tag:String,moveClass:String}),setup(n,{slots:e}){const t=wu(),i=Zg();let s,r;return lp(()=>{if(!s.length)return;const o=n.moveClass||`${n.name||"v"}-move`;if(!A_(s[0].el,t.vnode.el,o)){s=[];return}s.forEach(E_),s.forEach(w_);const a=s.filter(T_);ac(t.vnode.el),a.forEach(l=>{const c=l.el,u=c.style;Qn(c,o),u.transform=u.webkitTransform=u.transitionDuration="";const f=c[ya]=h=>{h&&h.target!==c||(!h||h.propertyName.endsWith("transform"))&&(c.removeEventListener("transitionend",f),c[ya]=null,Wi(c,o))};c.addEventListener("transitionend",f)}),s=[]}),()=>{const o=ft(n),a=i_(o);let l=o.tag||$e;if(s=[],r)for(let c=0;c<r.length;c++){const u=r[c];u.el&&u.el instanceof Element&&(s.push(u),Yr(u,ec(u,a,i,t)),Fp.set(u,{left:u.el.offsetLeft,top:u.el.offsetTop}))}r=e.default?sp(e.default()):[];for(let c=0;c<r.length;c++){const u=r[c];u.key!=null&&Yr(u,ec(u,a,i,t))}return pt(l,null,r)}}}),M_=b_;function E_(n){const e=n.el;e[ya]&&e[ya](),e[Bd]&&e[Bd]()}function w_(n){kp.set(n,{left:n.el.offsetLeft,top:n.el.offsetTop})}function T_(n){const e=Fp.get(n),t=kp.get(n),i=e.left-t.left,s=e.top-t.top;if(i||s){const r=n.el.style;return r.transform=r.webkitTransform=`translate(${i}px,${s}px)`,r.transitionDuration="0s",n}}function A_(n,e,t){const i=n.cloneNode(),s=n[sr];s&&s.forEach(a=>{a.split(/\s+/).forEach(l=>l&&i.classList.remove(l))}),t.split(/\s+/).forEach(a=>a&&i.classList.add(a)),i.style.display="none";const r=e.nodeType===1?e:e.parentNode;r.appendChild(i);const{hasTransform:o}=Np(i);return r.removeChild(i),o}const es=n=>{const e=n.props["onUpdate:modelValue"]||!1;return qe(e)?t=>Zo(e,t):e};function C_(n){n.target.composing=!0}function Vd(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Fn=Symbol("_assign");function zd(n,e,t){return e&&(n=n.trim()),t&&(n=Ia(n)),n}const Bt={created(n,{modifiers:{lazy:e,trim:t,number:i}},s){n[Fn]=es(s);const r=i||s.props&&s.props.type==="number";Ti(n,e?"change":"input",o=>{o.target.composing||n[Fn](zd(n.value,t,r))}),(t||r)&&Ti(n,"change",()=>{n.value=zd(n.value,t,r)}),e||(Ti(n,"compositionstart",C_),Ti(n,"compositionend",Vd),Ti(n,"change",Vd))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:i,trim:s,number:r}},o){if(n[Fn]=es(o),n.composing)return;const a=(r||n.type==="number")&&!/^0\d/.test(n.value)?Ia(n.value):n.value,l=e??"";a!==l&&(document.activeElement===n&&n.type!=="range"&&(i&&e===t||s&&n.value.trim()===l)||(n.value=l))}},R_={deep:!0,created(n,e,t){n[Fn]=es(t),Ti(n,"change",()=>{const i=n._modelValue,s=rr(n),r=n.checked,o=n[Fn];if(qe(i)){const a=fu(i,s),l=a!==-1;if(r&&!l)o(i.concat(s));else if(!r&&l){const c=[...i];c.splice(a,1),o(c)}}else if(pr(i)){const a=new Set(i);r?a.add(s):a.delete(s),o(a)}else o(Op(n,r))})},mounted:Hd,beforeUpdate(n,e,t){n[Fn]=es(t),Hd(n,e,t)}};function Hd(n,{value:e,oldValue:t},i){n._modelValue=e;let s;if(qe(e))s=fu(e,i.props.value)>-1;else if(pr(e))s=e.has(i.props.value);else{if(e===t)return;s=Ts(e,Op(n,!0))}n.checked!==s&&(n.checked=s)}const P_={created(n,{value:e},t){n.checked=Ts(e,t.props.value),n[Fn]=es(t),Ti(n,"change",()=>{n[Fn](rr(n))})},beforeUpdate(n,{value:e,oldValue:t},i){n[Fn]=es(i),e!==t&&(n.checked=Ts(e,i.props.value))}},Tu={deep:!0,created(n,{value:e,modifiers:{number:t}},i){const s=pr(e);Ti(n,"change",()=>{const r=Array.prototype.filter.call(n.options,o=>o.selected).map(o=>t?Ia(rr(o)):rr(o));n[Fn](n.multiple?s?new Set(r):r:r[0]),n._assigning=!0,lo(()=>{n._assigning=!1})}),n[Fn]=es(i)},mounted(n,{value:e}){Gd(n,e)},beforeUpdate(n,e,t){n[Fn]=es(t)},updated(n,{value:e}){n._assigning||Gd(n,e)}};function Gd(n,e){const t=n.multiple,i=qe(e);if(!(t&&!i&&!pr(e))){for(let s=0,r=n.options.length;s<r;s++){const o=n.options[s],a=rr(o);if(t)if(i){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(c=>String(c)===String(a)):o.selected=fu(e,a)>-1}else o.selected=e.has(a);else if(Ts(rr(o),e)){n.selectedIndex!==s&&(n.selectedIndex=s);return}}!t&&n.selectedIndex!==-1&&(n.selectedIndex=-1)}}function rr(n){return"_value"in n?n._value:n.value}function Op(n,e){const t=e?"_trueValue":"_falseValue";return t in n?n[t]:e}const Is={created(n,e,t){Eo(n,e,t,null,"created")},mounted(n,e,t){Eo(n,e,t,null,"mounted")},beforeUpdate(n,e,t,i){Eo(n,e,t,i,"beforeUpdate")},updated(n,e,t,i){Eo(n,e,t,i,"updated")}};function I_(n,e){switch(n){case"SELECT":return Tu;case"TEXTAREA":return Bt;default:switch(e){case"checkbox":return R_;case"radio":return P_;default:return Bt}}}function Eo(n,e,t,i,s){const o=I_(n.tagName,t.props&&t.props.type)[s];o&&o(n,e,t,i)}const D_=["ctrl","shift","alt","meta"],L_={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>D_.some(t=>n[`${t}Key`]&&!e.includes(t))},uo=(n,e)=>{const t=n._withMods||(n._withMods={}),i=e.join(".");return t[i]||(t[i]=(s,...r)=>{for(let o=0;o<e.length;o++){const a=L_[e[o]];if(a&&a(s,e))return}return n(s,...r)})},N_={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},ls=(n,e)=>{const t=n._withKeys||(n._withKeys={}),i=e.join(".");return t[i]||(t[i]=s=>{if(!("key"in s))return;const r=ns(s.key);if(e.some(o=>o===r||N_[o]===r))return n(s)})},U_=$t({patchProp:x_},t_);let $d;function F_(){return $d||($d=Nv(U_))}const k_=(...n)=>{const e=F_().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=B_(i);if(!s)return;const r=e._component;!et(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=t(s,!1,O_(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function O_(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function B_(n){return Ht(n)?document.querySelector(n):n}/*!
 * pinia v3.0.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let Bp;const Va=n=>Bp=n,Vp=Symbol();function lc(n){return n&&typeof n=="object"&&Object.prototype.toString.call(n)==="[object Object]"&&typeof n.toJSON!="function"}var Gr;(function(n){n.direct="direct",n.patchObject="patch object",n.patchFunction="patch function"})(Gr||(Gr={}));function V_(){const n=Rh(!0),e=n.run(()=>J({}));let t=[],i=[];const s=xu({install(r){Va(s),s._a=r,r.provide(Vp,s),r.config.globalProperties.$pinia=s,i.forEach(o=>t.push(o)),i=[]},use(r){return this._a?t.push(r):i.push(r),this},_p:t,_a:null,_e:n,_s:new Map,state:e});return s}const zp=()=>{};function Wd(n,e,t,i=zp){n.add(e);const s=()=>{n.delete(e)&&i()};return!t&&Ph()&&dg(s),s}function Ds(n,...e){n.forEach(t=>{t(...e)})}const z_=n=>n(),Xd=Symbol(),ll=Symbol();function cc(n,e){n instanceof Map&&e instanceof Map?e.forEach((t,i)=>n.set(i,t)):n instanceof Set&&e instanceof Set&&e.forEach(n.add,n);for(const t in e){if(!e.hasOwnProperty(t))continue;const i=e[t],s=n[t];lc(s)&&lc(i)&&n.hasOwnProperty(t)&&!zt(i)&&!Ci(i)?n[t]=cc(s,i):n[t]=i}return n}const H_=Symbol();function G_(n){return!lc(n)||!Object.prototype.hasOwnProperty.call(n,H_)}const{assign:Xi}=Object;function $_(n){return!!(zt(n)&&n.effect)}function W_(n,e,t,i){const{state:s,actions:r,getters:o}=e,a=t.state.value[n];let l;function c(){a||(t.state.value[n]=s?s():{});const u=Ng(t.state.value[n]);return Xi(u,r,Object.keys(o||{}).reduce((f,h)=>(f[h]=xu(ot(()=>{Va(t);const m=t._s.get(n);return o[h].call(m,m)})),f),{}))}return l=Hp(n,c,e,t,i,!0),l}function Hp(n,e,t={},i,s,r){let o;const a=Xi({actions:{}},t),l={deep:!0};let c,u,f=new Set,h=new Set,m;const _=i.state.value[n];!r&&!_&&(i.state.value[n]={});let v;function g(R){let x;c=u=!1,typeof R=="function"?(R(i.state.value[n]),x={type:Gr.patchFunction,storeId:n,events:m}):(cc(i.state.value[n],R),x={type:Gr.patchObject,payload:R,storeId:n,events:m});const E=v=Symbol();lo().then(()=>{v===E&&(c=!0)}),u=!0,Ds(f,x,i.state.value[n])}const p=r?function(){const{state:x}=t,E=x?x():{};this.$patch(U=>{Xi(U,E)})}:zp;function b(){o.stop(),f.clear(),h.clear(),i._s.delete(n)}const y=(R,x="")=>{if(Xd in R)return R[ll]=x,R;const E=function(){Va(i);const U=Array.from(arguments),O=new Set,j=new Set;function ee(I){O.add(I)}function Q(I){j.add(I)}Ds(h,{args:U,name:E[ll],store:T,after:ee,onError:Q});let Z;try{Z=R.apply(this&&this.$id===n?this:T,U)}catch(I){throw Ds(j,I),I}return Z instanceof Promise?Z.then(I=>(Ds(O,I),I)).catch(I=>(Ds(j,I),Promise.reject(I))):(Ds(O,Z),Z)};return E[Xd]=!0,E[ll]=x,E},M={_p:i,$id:n,$onAction:Wd.bind(null,h),$patch:g,$reset:p,$subscribe(R,x={}){const E=Wd(f,R,x.detached,()=>U()),U=o.run(()=>Un(()=>i.state.value[n],O=>{(x.flush==="sync"?u:c)&&R({storeId:n,type:Gr.direct,events:m},O)},Xi({},l,x)));return E},$dispose:b},T=oo(M);i._s.set(n,T);const w=(i._a&&i._a.runWithContext||z_)(()=>i._e.run(()=>(o=Rh()).run(()=>e({action:y}))));for(const R in w){const x=w[R];if(zt(x)&&!$_(x)||Ci(x))r||(_&&G_(x)&&(zt(x)?x.value=_[R]:cc(x,_[R])),i.state.value[n][R]=x);else if(typeof x=="function"){const E=y(x,R);w[R]=E,a.actions[R]=x}}return Xi(T,w),Xi(ft(T),w),Object.defineProperty(T,"$state",{get:()=>i.state.value[n],set:R=>{g(x=>{Xi(x,R)})}}),i._p.forEach(R=>{Xi(T,o.run(()=>R({store:T,app:i._a,pinia:i,options:a})))}),_&&r&&t.hydrate&&t.hydrate(T.$state,_),c=!0,u=!0,T}/*! #__NO_SIDE_EFFECTS__ */function X_(n,e,t){let i;const s=typeof e=="function";i=s?t:e;function r(o,a){const l=$g();return o=o||(l?An(Vp,null):null),o&&Va(o),o=Bp,o._s.has(n)||(s?Hp(n,e,i,o):W_(n,i,o)),o._s.get(n)}return r.$id=n,r}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */const Ys=typeof document<"u";function Gp(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function q_(n){return n.__esModule||n[Symbol.toStringTag]==="Module"||n.default&&Gp(n.default)}const _t=Object.assign;function cl(n,e){const t={};for(const i in e){const s=e[i];t[i]=jn(s)?s.map(n):n(s)}return t}const $r=()=>{},jn=Array.isArray;function qd(n,e){const t={};for(const i in n)t[i]=i in e?e[i]:n[i];return t}const $p=/#/g,j_=/&/g,Y_=/\//g,K_=/=/g,Z_=/\?/g,Wp=/\+/g,J_=/%5B/g,Q_=/%5D/g,Xp=/%5E/g,e0=/%60/g,qp=/%7B/g,t0=/%7C/g,jp=/%7D/g,n0=/%20/g;function Au(n){return n==null?"":encodeURI(""+n).replace(t0,"|").replace(J_,"[").replace(Q_,"]")}function i0(n){return Au(n).replace(qp,"{").replace(jp,"}").replace(Xp,"^")}function uc(n){return Au(n).replace(Wp,"%2B").replace(n0,"+").replace($p,"%23").replace(j_,"%26").replace(e0,"`").replace(qp,"{").replace(jp,"}").replace(Xp,"^")}function s0(n){return uc(n).replace(K_,"%3D")}function r0(n){return Au(n).replace($p,"%23").replace(Z_,"%3F")}function o0(n){return r0(n).replace(Y_,"%2F")}function Qr(n){if(n==null)return null;try{return decodeURIComponent(""+n)}catch{}return""+n}const a0=/\/$/,l0=n=>n.replace(a0,"");function ul(n,e,t="/"){let i,s={},r="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return l=a>=0&&l>a?-1:l,l>=0&&(i=e.slice(0,l),r=e.slice(l,a>0?a:e.length),s=n(r.slice(1))),a>=0&&(i=i||e.slice(0,a),o=e.slice(a,e.length)),i=f0(i??e,t),{fullPath:i+r+o,path:i,query:s,hash:Qr(o)}}function c0(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function jd(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function u0(n,e,t){const i=e.matched.length-1,s=t.matched.length-1;return i>-1&&i===s&&or(e.matched[i],t.matched[s])&&Yp(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function or(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function Yp(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(var t in n)if(!d0(n[t],e[t]))return!1;return!0}function d0(n,e){return jn(n)?Yd(n,e):jn(e)?Yd(e,n):(n==null?void 0:n.valueOf())===(e==null?void 0:e.valueOf())}function Yd(n,e){return jn(e)?n.length===e.length&&n.every((t,i)=>t===e[i]):n.length===1&&n[0]===e}function f0(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),i=n.split("/"),s=i[i.length-1];(s===".."||s===".")&&i.push("");let r=t.length-1,o,a;for(o=0;o<i.length;o++)if(a=i[o],a!==".")if(a==="..")r>1&&r--;else break;return t.slice(0,r).join("/")+"/"+i.slice(o).join("/")}const Oi={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};let dc=function(n){return n.pop="pop",n.push="push",n}({}),dl=function(n){return n.back="back",n.forward="forward",n.unknown="",n}({});function h0(n){if(!n)if(Ys){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),l0(n)}const p0=/^[^#]+#/;function m0(n,e){return n.replace(p0,"#")+e}function g0(n,e){const t=document.documentElement.getBoundingClientRect(),i=n.getBoundingClientRect();return{behavior:e.behavior,left:i.left-t.left-(e.left||0),top:i.top-t.top-(e.top||0)}}const za=()=>({left:window.scrollX,top:window.scrollY});function v0(n){let e;if("el"in n){const t=n.el,i=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?i?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=g0(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Kd(n,e){return(history.state?history.state.position-e:-1)+n}const fc=new Map;function _0(n,e){fc.set(n,e)}function x0(n){const e=fc.get(n);return fc.delete(n),e}function y0(n){return typeof n=="string"||n&&typeof n=="object"}function Kp(n){return typeof n=="string"||typeof n=="symbol"}let kt=function(n){return n[n.MATCHER_NOT_FOUND=1]="MATCHER_NOT_FOUND",n[n.NAVIGATION_GUARD_REDIRECT=2]="NAVIGATION_GUARD_REDIRECT",n[n.NAVIGATION_ABORTED=4]="NAVIGATION_ABORTED",n[n.NAVIGATION_CANCELLED=8]="NAVIGATION_CANCELLED",n[n.NAVIGATION_DUPLICATED=16]="NAVIGATION_DUPLICATED",n}({});const Zp=Symbol("");kt.MATCHER_NOT_FOUND+"",kt.NAVIGATION_GUARD_REDIRECT+"",kt.NAVIGATION_ABORTED+"",kt.NAVIGATION_CANCELLED+"",kt.NAVIGATION_DUPLICATED+"";function ar(n,e){return _t(new Error,{type:n,[Zp]:!0},e)}function vi(n,e){return n instanceof Error&&Zp in n&&(e==null||!!(n.type&e))}const S0=["params","query","hash"];function b0(n){if(typeof n=="string")return n;if(n.path!=null)return n.path;const e={};for(const t of S0)t in n&&(e[t]=n[t]);return JSON.stringify(e,null,2)}function M0(n){const e={};if(n===""||n==="?")return e;const t=(n[0]==="?"?n.slice(1):n).split("&");for(let i=0;i<t.length;++i){const s=t[i].replace(Wp," "),r=s.indexOf("="),o=Qr(r<0?s:s.slice(0,r)),a=r<0?null:Qr(s.slice(r+1));if(o in e){let l=e[o];jn(l)||(l=e[o]=[l]),l.push(a)}else e[o]=a}return e}function Zd(n){let e="";for(let t in n){const i=n[t];if(t=s0(t),i==null){i!==void 0&&(e+=(e.length?"&":"")+t);continue}(jn(i)?i.map(s=>s&&uc(s)):[i&&uc(i)]).forEach(s=>{s!==void 0&&(e+=(e.length?"&":"")+t,s!=null&&(e+="="+s))})}return e}function E0(n){const e={};for(const t in n){const i=n[t];i!==void 0&&(e[t]=jn(i)?i.map(s=>s==null?null:""+s):i==null?i:""+i)}return e}const w0=Symbol(""),Jd=Symbol(""),Ha=Symbol(""),Cu=Symbol(""),hc=Symbol("");function br(){let n=[];function e(i){return n.push(i),()=>{const s=n.indexOf(i);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n.slice(),reset:t}}function Ki(n,e,t,i,s,r=o=>o()){const o=i&&(i.enterCallbacks[s]=i.enterCallbacks[s]||[]);return()=>new Promise((a,l)=>{const c=h=>{h===!1?l(ar(kt.NAVIGATION_ABORTED,{from:t,to:e})):h instanceof Error?l(h):y0(h)?l(ar(kt.NAVIGATION_GUARD_REDIRECT,{from:e,to:h})):(o&&i.enterCallbacks[s]===o&&typeof h=="function"&&o.push(h),a())},u=r(()=>n.call(i&&i.instances[s],e,t,c));let f=Promise.resolve(u);n.length<3&&(f=f.then(c)),f.catch(h=>l(h))})}function fl(n,e,t,i,s=r=>r()){const r=[];for(const o of n)for(const a in o.components){let l=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(Gp(l)){const c=(l.__vccOpts||l)[e];c&&r.push(Ki(c,t,i,o,a,s))}else{let c=l();r.push(()=>c.then(u=>{if(!u)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=q_(u)?u.default:u;o.mods[a]=u,o.components[a]=f;const h=(f.__vccOpts||f)[e];return h&&Ki(h,t,i,o,a,s)()}))}}return r}function T0(n,e){const t=[],i=[],s=[],r=Math.max(e.matched.length,n.matched.length);for(let o=0;o<r;o++){const a=e.matched[o];a&&(n.matched.find(c=>or(c,a))?i.push(a):t.push(a));const l=n.matched[o];l&&(e.matched.find(c=>or(c,l))||s.push(l))}return[t,i,s]}/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */let A0=()=>location.protocol+"//"+location.host;function Jp(n,e){const{pathname:t,search:i,hash:s}=e,r=n.indexOf("#");if(r>-1){let o=s.includes(n.slice(r))?n.slice(r).length:1,a=s.slice(o);return a[0]!=="/"&&(a="/"+a),jd(a,"")}return jd(t,n)+i+s}function C0(n,e,t,i){let s=[],r=[],o=null;const a=({state:h})=>{const m=Jp(n,location),_=t.value,v=e.value;let g=0;if(h){if(t.value=m,e.value=h,o&&o===_){o=null;return}g=v?h.position-v.position:0}else i(m);s.forEach(p=>{p(t.value,_,{delta:g,type:dc.pop,direction:g?g>0?dl.forward:dl.back:dl.unknown})})};function l(){o=t.value}function c(h){s.push(h);const m=()=>{const _=s.indexOf(h);_>-1&&s.splice(_,1)};return r.push(m),m}function u(){if(document.visibilityState==="hidden"){const{history:h}=window;if(!h.state)return;h.replaceState(_t({},h.state,{scroll:za()}),"")}}function f(){for(const h of r)h();r=[],window.removeEventListener("popstate",a),window.removeEventListener("pagehide",u),document.removeEventListener("visibilitychange",u)}return window.addEventListener("popstate",a),window.addEventListener("pagehide",u),document.addEventListener("visibilitychange",u),{pauseListeners:l,listen:c,destroy:f}}function Qd(n,e,t,i=!1,s=!1){return{back:n,current:e,forward:t,replaced:i,position:window.history.length,scroll:s?za():null}}function R0(n){const{history:e,location:t}=window,i={value:Jp(n,t)},s={value:e.state};s.value||r(i.value,{back:null,current:i.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function r(l,c,u){const f=n.indexOf("#"),h=f>-1?(t.host&&document.querySelector("base")?n:n.slice(f))+l:A0()+n+l;try{e[u?"replaceState":"pushState"](c,"",h),s.value=c}catch(m){console.error(m),t[u?"replace":"assign"](h)}}function o(l,c){r(l,_t({},e.state,Qd(s.value.back,l,s.value.forward,!0),c,{position:s.value.position}),!0),i.value=l}function a(l,c){const u=_t({},s.value,e.state,{forward:l,scroll:za()});r(u.current,u,!0),r(l,_t({},Qd(i.value,l,null),{position:u.position+1},c),!1),i.value=l}return{location:i,state:s,push:a,replace:o}}function P0(n){n=h0(n);const e=R0(n),t=C0(n,e.state,e.location,e.replace);function i(r,o=!0){o||t.pauseListeners(),history.go(r)}const s=_t({location:"",base:n,go:i,createHref:m0.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}let Ss=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.Group=2]="Group",n}({});var Wt=function(n){return n[n.Static=0]="Static",n[n.Param=1]="Param",n[n.ParamRegExp=2]="ParamRegExp",n[n.ParamRegExpEnd=3]="ParamRegExpEnd",n[n.EscapeNext=4]="EscapeNext",n}(Wt||{});const I0={type:Ss.Static,value:""},D0=/[a-zA-Z0-9_]/;function L0(n){if(!n)return[[]];if(n==="/")return[[I0]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(m){throw new Error(`ERR (${t})/"${c}": ${m}`)}let t=Wt.Static,i=t;const s=[];let r;function o(){r&&s.push(r),r=[]}let a=0,l,c="",u="";function f(){c&&(t===Wt.Static?r.push({type:Ss.Static,value:c}):t===Wt.Param||t===Wt.ParamRegExp||t===Wt.ParamRegExpEnd?(r.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${c}) must be alone in its segment. eg: '/:ids+.`),r.push({type:Ss.Param,value:c,regexp:u,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),c="")}function h(){c+=l}for(;a<n.length;){if(l=n[a++],l==="\\"&&t!==Wt.ParamRegExp){i=t,t=Wt.EscapeNext;continue}switch(t){case Wt.Static:l==="/"?(c&&f(),o()):l===":"?(f(),t=Wt.Param):h();break;case Wt.EscapeNext:h(),t=i;break;case Wt.Param:l==="("?t=Wt.ParamRegExp:D0.test(l)?h():(f(),t=Wt.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case Wt.ParamRegExp:l===")"?u[u.length-1]=="\\"?u=u.slice(0,-1)+l:t=Wt.ParamRegExpEnd:u+=l;break;case Wt.ParamRegExpEnd:f(),t=Wt.Static,l!=="*"&&l!=="?"&&l!=="+"&&a--,u="";break;default:e("Unknown state");break}}return t===Wt.ParamRegExp&&e(`Unfinished custom RegExp for param "${c}"`),f(),o(),s}const ef="[^/]+?",N0={sensitive:!1,strict:!1,start:!0,end:!0};var fn=function(n){return n[n._multiplier=10]="_multiplier",n[n.Root=90]="Root",n[n.Segment=40]="Segment",n[n.SubSegment=30]="SubSegment",n[n.Static=40]="Static",n[n.Dynamic=20]="Dynamic",n[n.BonusCustomRegExp=10]="BonusCustomRegExp",n[n.BonusWildcard=-50]="BonusWildcard",n[n.BonusRepeatable=-20]="BonusRepeatable",n[n.BonusOptional=-8]="BonusOptional",n[n.BonusStrict=.7000000000000001]="BonusStrict",n[n.BonusCaseSensitive=.25]="BonusCaseSensitive",n}(fn||{});const U0=/[.+*?^${}()[\]/\\]/g;function F0(n,e){const t=_t({},N0,e),i=[];let s=t.start?"^":"";const r=[];for(const c of n){const u=c.length?[]:[fn.Root];t.strict&&!c.length&&(s+="/");for(let f=0;f<c.length;f++){const h=c[f];let m=fn.Segment+(t.sensitive?fn.BonusCaseSensitive:0);if(h.type===Ss.Static)f||(s+="/"),s+=h.value.replace(U0,"\\$&"),m+=fn.Static;else if(h.type===Ss.Param){const{value:_,repeatable:v,optional:g,regexp:p}=h;r.push({name:_,repeatable:v,optional:g});const b=p||ef;if(b!==ef){m+=fn.BonusCustomRegExp;try{`${b}`}catch(M){throw new Error(`Invalid custom RegExp for param "${_}" (${b}): `+M.message)}}let y=v?`((?:${b})(?:/(?:${b}))*)`:`(${b})`;f||(y=g&&c.length<2?`(?:/${y})`:"/"+y),g&&(y+="?"),s+=y,m+=fn.Dynamic,g&&(m+=fn.BonusOptional),v&&(m+=fn.BonusRepeatable),b===".*"&&(m+=fn.BonusWildcard)}u.push(m)}i.push(u)}if(t.strict&&t.end){const c=i.length-1;i[c][i[c].length-1]+=fn.BonusStrict}t.strict||(s+="/?"),t.end?s+="$":t.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,t.sensitive?"":"i");function a(c){const u=c.match(o),f={};if(!u)return null;for(let h=1;h<u.length;h++){const m=u[h]||"",_=r[h-1];f[_.name]=m&&_.repeatable?m.split("/"):m}return f}function l(c){let u="",f=!1;for(const h of n){(!f||!u.endsWith("/"))&&(u+="/"),f=!1;for(const m of h)if(m.type===Ss.Static)u+=m.value;else if(m.type===Ss.Param){const{value:_,repeatable:v,optional:g}=m,p=_ in c?c[_]:"";if(jn(p)&&!v)throw new Error(`Provided param "${_}" is an array but it is not repeatable (* or + modifiers)`);const b=jn(p)?p.join("/"):p;if(!b)if(g)h.length<2&&(u.endsWith("/")?u=u.slice(0,-1):f=!0);else throw new Error(`Missing required param "${_}"`);u+=b}}return u||"/"}return{re:o,score:i,keys:r,parse:a,stringify:l}}function k0(n,e){let t=0;for(;t<n.length&&t<e.length;){const i=e[t]-n[t];if(i)return i;t++}return n.length<e.length?n.length===1&&n[0]===fn.Static+fn.Segment?-1:1:n.length>e.length?e.length===1&&e[0]===fn.Static+fn.Segment?1:-1:0}function Qp(n,e){let t=0;const i=n.score,s=e.score;for(;t<i.length&&t<s.length;){const r=k0(i[t],s[t]);if(r)return r;t++}if(Math.abs(s.length-i.length)===1){if(tf(i))return 1;if(tf(s))return-1}return s.length-i.length}function tf(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const O0={strict:!1,end:!0,sensitive:!1};function B0(n,e,t){const i=F0(L0(n.path),t),s=_t(i,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function V0(n,e){const t=[],i=new Map;e=qd(O0,e);function s(f){return i.get(f)}function r(f,h,m){const _=!m,v=sf(f);v.aliasOf=m&&m.record;const g=qd(e,f),p=[v];if("alias"in f){const M=typeof f.alias=="string"?[f.alias]:f.alias;for(const T of M)p.push(sf(_t({},v,{components:m?m.record.components:v.components,path:T,aliasOf:m?m.record:v})))}let b,y;for(const M of p){const{path:T}=M;if(h&&T[0]!=="/"){const C=h.record.path,w=C[C.length-1]==="/"?"":"/";M.path=h.record.path+(T&&w+T)}if(b=B0(M,h,g),m?m.alias.push(b):(y=y||b,y!==b&&y.alias.push(b),_&&f.name&&!rf(b)&&o(f.name)),em(b)&&l(b),v.children){const C=v.children;for(let w=0;w<C.length;w++)r(C[w],b,m&&m.children[w])}m=m||b}return y?()=>{o(y)}:$r}function o(f){if(Kp(f)){const h=i.get(f);h&&(i.delete(f),t.splice(t.indexOf(h),1),h.children.forEach(o),h.alias.forEach(o))}else{const h=t.indexOf(f);h>-1&&(t.splice(h,1),f.record.name&&i.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return t}function l(f){const h=G0(f,t);t.splice(h,0,f),f.record.name&&!rf(f)&&i.set(f.record.name,f)}function c(f,h){let m,_={},v,g;if("name"in f&&f.name){if(m=i.get(f.name),!m)throw ar(kt.MATCHER_NOT_FOUND,{location:f});g=m.record.name,_=_t(nf(h.params,m.keys.filter(y=>!y.optional).concat(m.parent?m.parent.keys.filter(y=>y.optional):[]).map(y=>y.name)),f.params&&nf(f.params,m.keys.map(y=>y.name))),v=m.stringify(_)}else if(f.path!=null)v=f.path,m=t.find(y=>y.re.test(v)),m&&(_=m.parse(v),g=m.record.name);else{if(m=h.name?i.get(h.name):t.find(y=>y.re.test(h.path)),!m)throw ar(kt.MATCHER_NOT_FOUND,{location:f,currentLocation:h});g=m.record.name,_=_t({},h.params,f.params),v=m.stringify(_)}const p=[];let b=m;for(;b;)p.unshift(b.record),b=b.parent;return{name:g,path:v,params:_,matched:p,meta:H0(p)}}n.forEach(f=>r(f));function u(){t.length=0,i.clear()}return{addRoute:r,resolve:c,removeRoute:o,clearRoutes:u,getRoutes:a,getRecordMatcher:s}}function nf(n,e){const t={};for(const i of e)i in n&&(t[i]=n[i]);return t}function sf(n){const e={path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:n.aliasOf,beforeEnter:n.beforeEnter,props:z0(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function z0(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const i in n.components)e[i]=typeof t=="object"?t[i]:t;return e}function rf(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function H0(n){return n.reduce((e,t)=>_t(e,t.meta),{})}function G0(n,e){let t=0,i=e.length;for(;t!==i;){const r=t+i>>1;Qp(n,e[r])<0?i=r:t=r+1}const s=$0(n);return s&&(i=e.lastIndexOf(s,i-1)),i}function $0(n){let e=n;for(;e=e.parent;)if(em(e)&&Qp(n,e)===0)return e}function em({record:n}){return!!(n.name||n.components&&Object.keys(n.components).length||n.redirect)}function of(n){const e=An(Ha),t=An(Cu),i=ot(()=>{const l=ve(n.to);return e.resolve(l)}),s=ot(()=>{const{matched:l}=i.value,{length:c}=l,u=l[c-1],f=t.matched;if(!u||!f.length)return-1;const h=f.findIndex(or.bind(null,u));if(h>-1)return h;const m=af(l[c-2]);return c>1&&af(u)===m&&f[f.length-1].path!==m?f.findIndex(or.bind(null,l[c-2])):h}),r=ot(()=>s.value>-1&&j0(t.params,i.value.params)),o=ot(()=>s.value>-1&&s.value===t.matched.length-1&&Yp(t.params,i.value.params));function a(l={}){if(q0(l)){const c=e[ve(n.replace)?"replace":"push"](ve(n.to)).catch($r);return n.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>c),c}return Promise.resolve()}return{route:i,href:ot(()=>i.value.href),isActive:r,isExactActive:o,navigate:a}}function W0(n){return n.length===1?n[0]:n}const X0=tt({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:of,setup(n,{slots:e}){const t=oo(of(n)),{options:i}=An(Ha),s=ot(()=>({[lf(n.activeClass,i.linkActiveClass,"router-link-active")]:t.isActive,[lf(n.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const r=e.default&&W0(e.default(t));return n.custom?r:Ip("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},r)}}}),eo=X0;function q0(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function j0(n,e){for(const t in e){const i=e[t],s=n[t];if(typeof i=="string"){if(i!==s)return!1}else if(!jn(s)||s.length!==i.length||i.some((r,o)=>r.valueOf()!==s[o].valueOf()))return!1}return!0}function af(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const lf=(n,e,t)=>n??e??t,Y0=tt({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const i=An(hc),s=ot(()=>n.route||i.value),r=An(Jd,0),o=ot(()=>{let c=ve(r);const{matched:u}=s.value;let f;for(;(f=u[c])&&!f.components;)c++;return c}),a=ot(()=>s.value.matched[o.value]);Jo(Jd,ot(()=>o.value+1)),Jo(w0,a),Jo(hc,s);const l=J();return Un(()=>[l.value,a.value,n.name],([c,u,f],[h,m,_])=>{u&&(u.instances[f]=c,m&&m!==u&&c&&c===h&&(u.leaveGuards.size||(u.leaveGuards=m.leaveGuards),u.updateGuards.size||(u.updateGuards=m.updateGuards))),c&&u&&(!m||!or(u,m)||!h)&&(u.enterCallbacks[f]||[]).forEach(v=>v(c))},{flush:"post"}),()=>{const c=s.value,u=n.name,f=a.value,h=f&&f.components[u];if(!h)return cf(t.default,{Component:h,route:c});const m=f.props[u],_=m?m===!0?c.params:typeof m=="function"?m(c):m:null,g=Ip(h,_t({},_,e,{onVnodeUnmounted:p=>{p.component.isUnmounted&&(f.instances[u]=null)},ref:l}));return cf(t.default,{Component:g,route:c})||g}}});function cf(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const K0=Y0;function Z0(n){const e=V0(n.routes,n),t=n.parseQuery||M0,i=n.stringifyQuery||Zd,s=n.history,r=br(),o=br(),a=br(),l=Ig(Oi);let c=Oi;Ys&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const u=cl.bind(null,W=>""+W),f=cl.bind(null,o0),h=cl.bind(null,Qr);function m(W,ce){let pe,he;return Kp(W)?(pe=e.getRecordMatcher(W),he=ce):he=W,e.addRoute(he,pe)}function _(W){const ce=e.getRecordMatcher(W);ce&&e.removeRoute(ce)}function v(){return e.getRoutes().map(W=>W.record)}function g(W){return!!e.getRecordMatcher(W)}function p(W,ce){if(ce=_t({},ce||l.value),typeof W=="string"){const q=ul(t,W,ce.path),H=e.resolve({path:q.path},ce),D=s.createHref(q.fullPath);return _t(q,H,{params:h(H.params),hash:Qr(q.hash),redirectedFrom:void 0,href:D})}let pe;if(W.path!=null)pe=_t({},W,{path:ul(t,W.path,ce.path).path});else{const q=_t({},W.params);for(const H in q)q[H]==null&&delete q[H];pe=_t({},W,{params:f(q)}),ce.params=f(ce.params)}const he=e.resolve(pe,ce),Le=W.hash||"";he.params=u(h(he.params));const k=c0(i,_t({},W,{hash:i0(Le),path:he.path})),z=s.createHref(k);return _t({fullPath:k,hash:Le,query:i===Zd?E0(W.query):W.query||{}},he,{redirectedFrom:void 0,href:z})}function b(W){return typeof W=="string"?ul(t,W,l.value.path):_t({},W)}function y(W,ce){if(c!==W)return ar(kt.NAVIGATION_CANCELLED,{from:ce,to:W})}function M(W){return w(W)}function T(W){return M(_t(b(W),{replace:!0}))}function C(W,ce){const pe=W.matched[W.matched.length-1];if(pe&&pe.redirect){const{redirect:he}=pe;let Le=typeof he=="function"?he(W,ce):he;return typeof Le=="string"&&(Le=Le.includes("?")||Le.includes("#")?Le=b(Le):{path:Le},Le.params={}),_t({query:W.query,hash:W.hash,params:Le.path!=null?{}:W.params},Le)}}function w(W,ce){const pe=c=p(W),he=l.value,Le=W.state,k=W.force,z=W.replace===!0,q=C(pe,he);if(q)return w(_t(b(q),{state:typeof q=="object"?_t({},Le,q.state):Le,force:k,replace:z}),ce||pe);const H=pe;H.redirectedFrom=ce;let D;return!k&&u0(i,he,pe)&&(D=ar(kt.NAVIGATION_DUPLICATED,{to:H,from:he}),re(he,he,!0,!1)),(D?Promise.resolve(D):E(H,he)).catch(X=>vi(X)?vi(X,kt.NAVIGATION_GUARD_REDIRECT)?X:le(X):F(X,H,he)).then(X=>{if(X){if(vi(X,kt.NAVIGATION_GUARD_REDIRECT))return w(_t({replace:z},b(X.to),{state:typeof X.to=="object"?_t({},Le,X.to.state):Le,force:k}),ce||H)}else X=O(H,he,!0,z,Le);return U(H,he,X),X})}function R(W,ce){const pe=y(W,ce);return pe?Promise.reject(pe):Promise.resolve()}function x(W){const ce=at.values().next().value;return ce&&typeof ce.runWithContext=="function"?ce.runWithContext(W):W()}function E(W,ce){let pe;const[he,Le,k]=T0(W,ce);pe=fl(he.reverse(),"beforeRouteLeave",W,ce);for(const q of he)q.leaveGuards.forEach(H=>{pe.push(Ki(H,W,ce))});const z=R.bind(null,W,ce);return pe.push(z),fe(pe).then(()=>{pe=[];for(const q of r.list())pe.push(Ki(q,W,ce));return pe.push(z),fe(pe)}).then(()=>{pe=fl(Le,"beforeRouteUpdate",W,ce);for(const q of Le)q.updateGuards.forEach(H=>{pe.push(Ki(H,W,ce))});return pe.push(z),fe(pe)}).then(()=>{pe=[];for(const q of k)if(q.beforeEnter)if(jn(q.beforeEnter))for(const H of q.beforeEnter)pe.push(Ki(H,W,ce));else pe.push(Ki(q.beforeEnter,W,ce));return pe.push(z),fe(pe)}).then(()=>(W.matched.forEach(q=>q.enterCallbacks={}),pe=fl(k,"beforeRouteEnter",W,ce,x),pe.push(z),fe(pe))).then(()=>{pe=[];for(const q of o.list())pe.push(Ki(q,W,ce));return pe.push(z),fe(pe)}).catch(q=>vi(q,kt.NAVIGATION_CANCELLED)?q:Promise.reject(q))}function U(W,ce,pe){a.list().forEach(he=>x(()=>he(W,ce,pe)))}function O(W,ce,pe,he,Le){const k=y(W,ce);if(k)return k;const z=ce===Oi,q=Ys?history.state:{};pe&&(he||z?s.replace(W.fullPath,_t({scroll:z&&q&&q.scroll},Le)):s.push(W.fullPath,Le)),l.value=W,re(W,ce,pe,z),le()}let j;function ee(){j||(j=s.listen((W,ce,pe)=>{if(!st.listening)return;const he=p(W),Le=C(he,st.currentRoute.value);if(Le){w(_t(Le,{replace:!0,force:!0}),he).catch($r);return}c=he;const k=l.value;Ys&&_0(Kd(k.fullPath,pe.delta),za()),E(he,k).catch(z=>vi(z,kt.NAVIGATION_ABORTED|kt.NAVIGATION_CANCELLED)?z:vi(z,kt.NAVIGATION_GUARD_REDIRECT)?(w(_t(b(z.to),{force:!0}),he).then(q=>{vi(q,kt.NAVIGATION_ABORTED|kt.NAVIGATION_DUPLICATED)&&!pe.delta&&pe.type===dc.pop&&s.go(-1,!1)}).catch($r),Promise.reject()):(pe.delta&&s.go(-pe.delta,!1),F(z,he,k))).then(z=>{z=z||O(he,k,!1),z&&(pe.delta&&!vi(z,kt.NAVIGATION_CANCELLED)?s.go(-pe.delta,!1):pe.type===dc.pop&&vi(z,kt.NAVIGATION_ABORTED|kt.NAVIGATION_DUPLICATED)&&s.go(-1,!1)),U(he,k,z)}).catch($r)}))}let Q=br(),Z=br(),I;function F(W,ce,pe){le(W);const he=Z.list();return he.length?he.forEach(Le=>Le(W,ce,pe)):console.error(W),Promise.reject(W)}function $(){return I&&l.value!==Oi?Promise.resolve():new Promise((W,ce)=>{Q.add([W,ce])})}function le(W){return I||(I=!W,ee(),Q.list().forEach(([ce,pe])=>W?pe(W):ce()),Q.reset()),W}function re(W,ce,pe,he){const{scrollBehavior:Le}=n;if(!Ys||!Le)return Promise.resolve();const k=!pe&&x0(Kd(W.fullPath,0))||(he||!pe)&&history.state&&history.state.scroll||null;return lo().then(()=>Le(W,ce,k)).then(z=>z&&v0(z)).catch(z=>F(z,W,ce))}const xe=W=>s.go(W);let Te;const at=new Set,st={currentRoute:l,listening:!0,addRoute:m,removeRoute:_,clearRoutes:e.clearRoutes,hasRoute:g,getRoutes:v,resolve:p,options:n,push:M,replace:T,go:xe,back:()=>xe(-1),forward:()=>xe(1),beforeEach:r.add,beforeResolve:o.add,afterEach:a.add,onError:Z.add,isReady:$,install(W){W.component("RouterLink",eo),W.component("RouterView",K0),W.config.globalProperties.$router=st,Object.defineProperty(W.config.globalProperties,"$route",{enumerable:!0,get:()=>ve(l)}),Ys&&!Te&&l.value===Oi&&(Te=!0,M(s.location).catch(he=>{}));const ce={};for(const he in Oi)Object.defineProperty(ce,he,{get:()=>l.value[he],enumerable:!0});W.provide(Ha,st),W.provide(Cu,Wh(ce)),W.provide(hc,l);const pe=W.unmount;at.add(W),W.unmount=function(){at.delete(W),at.size<1&&(c=Oi,j&&j(),j=null,l.value=Oi,Te=!1,I=!1),pe()}}};function fe(W){return W.reduce((ce,pe)=>ce.then(()=>x(pe)),Promise.resolve())}return st}function Ga(){return An(Ha)}function Ru(n){return An(Cu)}const J0="/assets/newMusic-CN0p2ACZ.mp3",Q0="/assets/fart-with-reverb-C8ugyAjD.mp3",ex="/goose.png";function tx(n){const e=n.match(/^<(a?):([^:]+):(\d+)>$/);if(e){const t=e[1]==="a",i=e[2],s=e[3];return{type:t?"discord_animated":"discord_static",name:i,id:s,url:`https://cdn.discordapp.com/emojis/${s}.${t?"gif":"png"}`,original:n}}return{type:"unicode",name:n,original:n}}const nx=["src","alt"],ix=tt({__name:"EmojiRenderer",props:{emoji:{},size:{}},setup(n){const e=n,t=ot(()=>tx(e.emoji)),i=ot(()=>e.size||32);return(s,r)=>t.value.type==="discord_static"||t.value.type==="discord_animated"?(N(),B("img",{key:0,src:t.value.url,alt:t.value.name,class:"discord-emoji",style:Dt({width:`${i.value}px`,height:`${i.value}px`}),loading:"lazy"},null,12,nx)):n.emoji==="🪿"?(N(),B("img",{key:1,src:ex,alt:"goose",class:"goose-emoji",style:Dt({width:`${i.value}px`,height:`${i.value}px`}),loading:"lazy"},null,4)):(N(),B("span",{key:2,class:"unicode-emoji",style:Dt({fontSize:`${i.value}px`})},V(n.emoji),5))}}),ct=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t},tm=ct(ix,[["__scopeId","data-v-832144c4"]]);function sx(){const n=(i,s)=>{const r=document.getElementById(i);r&&(r.pause(),r.currentTime=(s==null?void 0:s.startTime)??0,(s==null?void 0:s.volume)!==void 0&&(r.volume=Math.min(Math.max(s.volume,0),1)),r.play())};return{playSound:n,playFart:i=>{n("fartSound",{volume:i})},toggleMusic:i=>{const s=document.getElementById("newMusic");s&&(i?s.play():s.pause())}}}function rx(){const n=J(""),e=J(!0),t=async()=>{try{e.value=!0;const i=await fetch("https://api.thecatapi.com/v1/images/search?size=med");if(!i.ok){console.error("Failed to fetch cat:",i.status);return}const s=await i.json();s&&s.length>0&&s[0].url?n.value=s[0].url:console.error("Invalid cat API response:",s)}catch(i){console.error("Error fetching cat:",i)}finally{e.value=!1}};return Ct(()=>{t()}),{catImage:n,catLoading:e,fetchNewCat:t}}const ox=/\{[^{}]+\}/g,ax=()=>{var n,e;return typeof process=="object"&&Number.parseInt((e=(n=process==null?void 0:process.versions)==null?void 0:n.node)==null?void 0:e.substring(0,2))>=18&&process.versions.undici};function lx(){return Math.random().toString(36).slice(2,11)}function cx(n){let{baseUrl:e="",Request:t=globalThis.Request,fetch:i=globalThis.fetch,querySerializer:s,bodySerializer:r,headers:o,requestInitExt:a=void 0,...l}={...n};a=ax()?a:void 0,e=ff(e);const c=[];async function u(f,h){const{baseUrl:m,fetch:_=i,Request:v=t,headers:g,params:p={},parseAs:b="json",querySerializer:y,bodySerializer:M=r??dx,body:T,middleware:C=[],...w}=h||{};let R=e;m&&(R=ff(m)??e);let x=typeof s=="function"?s:uf(s);y&&(x=typeof y=="function"?y:uf({...typeof s=="object"?s:{},...y}));const E=T===void 0?void 0:M(T,df(o,g,p.header)),U=df(E===void 0||E instanceof FormData?{}:{"Content-Type":"application/json"},o,g,p.header),O=[...c,...C],j={redirect:"follow",...l,...w,body:E,headers:U};let ee,Q,Z=new v(fx(f,{baseUrl:R,params:p,querySerializer:x}),j),I;for(const $ in w)$ in Z||(Z[$]=w[$]);if(O.length){ee=lx(),Q=Object.freeze({baseUrl:R,fetch:_,parseAs:b,querySerializer:x,bodySerializer:M});for(const $ of O)if($&&typeof $=="object"&&typeof $.onRequest=="function"){const le=await $.onRequest({request:Z,schemaPath:f,params:p,options:Q,id:ee});if(le)if(le instanceof v)Z=le;else if(le instanceof Response){I=le;break}else throw new Error("onRequest: must return new Request() or Response() when modifying the request")}}if(!I){try{I=await _(Z,a)}catch($){let le=$;if(O.length)for(let re=O.length-1;re>=0;re--){const xe=O[re];if(xe&&typeof xe=="object"&&typeof xe.onError=="function"){const Te=await xe.onError({request:Z,error:le,schemaPath:f,params:p,options:Q,id:ee});if(Te){if(Te instanceof Response){le=void 0,I=Te;break}if(Te instanceof Error){le=Te;continue}throw new Error("onError: must return new Response() or instance of Error")}}}if(le)throw le}if(O.length)for(let $=O.length-1;$>=0;$--){const le=O[$];if(le&&typeof le=="object"&&typeof le.onResponse=="function"){const re=await le.onResponse({request:Z,response:I,schemaPath:f,params:p,options:Q,id:ee});if(re){if(!(re instanceof Response))throw new Error("onResponse: must return new Response() when modifying the response");I=re}}}}if(I.status===204||Z.method==="HEAD"||I.headers.get("Content-Length")==="0")return I.ok?{data:void 0,response:I}:{error:void 0,response:I};if(I.ok)return b==="stream"?{data:I.body,response:I}:{data:await I[b](),response:I};let F=await I.text();try{F=JSON.parse(F)}catch{}return{error:F,response:I}}return{request(f,h,m){return u(h,{...m,method:f.toUpperCase()})},GET(f,h){return u(f,{...h,method:"GET"})},PUT(f,h){return u(f,{...h,method:"PUT"})},POST(f,h){return u(f,{...h,method:"POST"})},DELETE(f,h){return u(f,{...h,method:"DELETE"})},OPTIONS(f,h){return u(f,{...h,method:"OPTIONS"})},HEAD(f,h){return u(f,{...h,method:"HEAD"})},PATCH(f,h){return u(f,{...h,method:"PATCH"})},TRACE(f,h){return u(f,{...h,method:"TRACE"})},use(...f){for(const h of f)if(h){if(typeof h!="object"||!("onRequest"in h||"onResponse"in h||"onError"in h))throw new Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");c.push(h)}},eject(...f){for(const h of f){const m=c.indexOf(h);m!==-1&&c.splice(m,1)}}}}function $a(n,e,t){if(e==null)return"";if(typeof e=="object")throw new Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");return`${n}=${(t==null?void 0:t.allowReserved)===!0?e:encodeURIComponent(e)}`}function nm(n,e,t){if(!e||typeof e!="object")return"";const i=[],s={simple:",",label:".",matrix:";"}[t.style]||"&";if(t.style!=="deepObject"&&t.explode===!1){for(const a in e)i.push(a,t.allowReserved===!0?e[a]:encodeURIComponent(e[a]));const o=i.join(",");switch(t.style){case"form":return`${n}=${o}`;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return o}}for(const o in e){const a=t.style==="deepObject"?`${n}[${o}]`:o;i.push($a(a,e[o],t))}const r=i.join(s);return t.style==="label"||t.style==="matrix"?`${s}${r}`:r}function im(n,e,t){if(!Array.isArray(e))return"";if(t.explode===!1){const r={form:",",spaceDelimited:"%20",pipeDelimited:"|"}[t.style]||",",o=(t.allowReserved===!0?e:e.map(a=>encodeURIComponent(a))).join(r);switch(t.style){case"simple":return o;case"label":return`.${o}`;case"matrix":return`;${n}=${o}`;default:return`${n}=${o}`}}const i={simple:",",label:".",matrix:";"}[t.style]||"&",s=[];for(const r of e)t.style==="simple"||t.style==="label"?s.push(t.allowReserved===!0?r:encodeURIComponent(r)):s.push($a(n,r,t));return t.style==="label"||t.style==="matrix"?`${i}${s.join(i)}`:s.join(i)}function uf(n){return function(t){const i=[];if(t&&typeof t=="object")for(const s in t){const r=t[s];if(r!=null){if(Array.isArray(r)){if(r.length===0)continue;i.push(im(s,r,{style:"form",explode:!0,...n==null?void 0:n.array,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}if(typeof r=="object"){i.push(nm(s,r,{style:"deepObject",explode:!0,...n==null?void 0:n.object,allowReserved:(n==null?void 0:n.allowReserved)||!1}));continue}i.push($a(s,r,n))}}return i.join("&")}}function ux(n,e){let t=n;for(const i of n.match(ox)??[]){let s=i.substring(1,i.length-1),r=!1,o="simple";if(s.endsWith("*")&&(r=!0,s=s.substring(0,s.length-1)),s.startsWith(".")?(o="label",s=s.substring(1)):s.startsWith(";")&&(o="matrix",s=s.substring(1)),!e||e[s]===void 0||e[s]===null)continue;const a=e[s];if(Array.isArray(a)){t=t.replace(i,im(s,a,{style:o,explode:r}));continue}if(typeof a=="object"){t=t.replace(i,nm(s,a,{style:o,explode:r}));continue}if(o==="matrix"){t=t.replace(i,`;${$a(s,a)}`);continue}t=t.replace(i,o==="label"?`.${encodeURIComponent(a)}`:encodeURIComponent(a))}return t}function dx(n,e){return n instanceof FormData?n:e&&(e.get instanceof Function?e.get("Content-Type")??e.get("content-type"):e["Content-Type"]??e["content-type"])==="application/x-www-form-urlencoded"?new URLSearchParams(n).toString():JSON.stringify(n)}function fx(n,e){var s;let t=`${e.baseUrl}${n}`;(s=e.params)!=null&&s.path&&(t=ux(t,e.params.path));let i=e.querySerializer(e.params.query??{});return i.startsWith("?")&&(i=i.substring(1)),i&&(t+=`?${i}`),t}function df(...n){const e=new Headers;for(const t of n){if(!t||typeof t!="object")continue;const i=t instanceof Headers?t.entries():Object.entries(t);for(const[s,r]of i)if(r===null)e.delete(s);else if(Array.isArray(r))for(const o of r)e.append(s,o);else r!==void 0&&e.set(s,r)}return e}function ff(n){return n.endsWith("/")?n.substring(0,n.length-1):n}function sm(){return typeof window<"u"&&window.__API_BASE_URL__?window.__API_BASE_URL__:""}const Ot=cx({baseUrl:sm()||"/api",headers:{"Content-Type":"application/json"}});class hx{async getHealth(){const{data:e,error:t}=await Ot.GET("/health",{});if(t)throw new Error(t.error||"Failed to get health status");return e}async getRankings(){const{data:e,error:t}=await Ot.GET("/rankings",{});if(t)throw new Error(t.error||"Failed to get rankings");return(e==null?void 0:e.rankings)||[]}async getQuote(){const{data:e,error:t}=await Ot.GET("/quote",{});if(t)throw new Error(t.error||"Failed to get quote");return e==null?void 0:e.quote}async detectGender(e,t){const{data:i,error:s}=await Ot.POST("/gender",{body:{name:e,country:t}});if(s)throw new Error(s.error||"Failed to detect gender");return i}async analyzePhrenology(e){const{data:t,error:i}=await Ot.POST("/phrenology",{body:{name:e}});if(i)throw new Error(i.error||"Failed to analyze phrenology");return t}}const Pu=new hx;function px(){const n=J([]),e=J(!1);return{rankings:n,loading:e,loadRankings:async()=>{try{e.value=!0,n.value=await Pu.getRankings()}catch(s){console.error("Failed to load rankings:",s)}finally{e.value=!1}},getTrendClass:s=>{const r=["trend-up","trend-down","trend-same"];return r[s%r.length]}}}const ia={rankings:!0,cat:!1,feed:!1,digitalGoose:!0,tachometer:!0,coolnessPanel:!0},wo=["rankings","cat"],mx=()=>{if(typeof window>"u")return ia;try{const n=localStorage.getItem("panels");if(n)return{...ia,...JSON.parse(n)}}catch(n){console.error("Failed to load panels from localStorage:",n)}return ia},gx=n=>{if(!(typeof window>"u"))try{localStorage.setItem("panels",JSON.stringify(n))}catch(e){console.error("Failed to save panels to localStorage:",e)}};function vx(n){const e=J({...ia,...n}),t=mx();e.value={...e.value,...t},Un(e,a=>{gx(a)},{deep:!0});const i=()=>typeof window>"u"?!1:window.innerWidth<=768;return{panels:e,togglePanel:a=>{const l=e.value[a];i()&&!l&&wo.includes(a)&&wo.forEach(c=>{c!==a&&(e.value[c]=!1)}),e.value[a]=!l},openPanel:a=>{i()&&wo.includes(a)&&wo.forEach(l=>{l!==a&&(e.value[l]=!1)}),e.value[a]=!0},closePanel:a=>{e.value[a]=!1}}}const _x={color:"colour",Color:"Colour",COLOR:"COLOUR",center:"centre",Center:"Centre",CENTER:"CENTRE",favorite:"favourite",Favorite:"Favourite",FAVORITE:"FAVOURITE",organize:"organise",Organize:"Organise",ORGANIZE:"ORGANISE",realize:"realise",Realize:"Realise",REALIZE:"REALISE",analyze:"analyse",Analyze:"Analyse",ANALYZE:"ANALYSE",behavior:"behaviour",Behavior:"Behaviour",BEHAVIOR:"BEHAVIOUR",neighbor:"neighbour",Neighbor:"Neighbour",NEIGHBOR:"NEIGHBOUR",meter:"metre",Meter:"Metre",METER:"METRE"},xx=localStorage.getItem("languageRegion"),Wr=J(xx==="AU"?"AU":"US"),yx=(n,e=Wr.value)=>{if(e==="US")return n;let t=n;for(const[i,s]of Object.entries(_x)){const r=new RegExp(`\\b${i}\\b`,"g");t=t.replace(r,s)}return t},hf=n=>{Wr.value=n,localStorage.setItem("languageRegion",n)},Sx=()=>({languageRegion:Wr,setLanguageRegion:hf,applyLanguage:yx,toggleLanguage:()=>{const n=Wr.value==="US"?"AU":"US";hf(n)},isAustralian:ot(()=>Wr.value==="AU")}),Qt=X_("app",()=>{const n=sx(),e=rx(),t=px(),i=vx(),s=Sx(),r=localStorage.getItem("darkMode"),o=localStorage.getItem("darkerMode"),a=J(r==="true"),l=J(o==="true"),c=J(!1),u=J(0),f=J(50),h=J(!1),m=J(!1),_=J("home"),v=J(["Stay curious, keep asking questions.","The best way to predict future is to create it.","Every moment is a fresh beginning.","Chaos is just order waiting to be discovered.","Your potential is endless.","Keep being weird.","Normal is overrated.","Be energy you want to see in world."]),g=J([]),p=ot(()=>v.value[u.value]),b=async()=>{const re=Math.floor(Math.random()*3)+3;for(let xe=0;xe<re;xe++)await C()},y=()=>{!a.value&&!l.value?(a.value=!0,l.value=!1):a.value&&!l.value?(a.value=!0,l.value=!0):(a.value=!1,l.value=!1),localStorage.setItem("darkMode",a.value.toString()),localStorage.setItem("darkerMode",l.value.toString()),document.body.classList.toggle("dark",a.value),document.body.classList.toggle("darker",l.value)},M=()=>{l.value=!l.value,l.value&&(a.value=!0),localStorage.setItem("darkMode",a.value.toString()),localStorage.setItem("darkerMode",l.value.toString()),document.body.classList.toggle("dark",a.value),document.body.classList.toggle("darker",l.value)},T=()=>{c.value=!c.value,n.toggleMusic(c.value)},C=async()=>{try{const xe=await(await fetch("https://api.adviceslip.com/advice")).json();if(xe.slip&&xe.slip.advice){const Te=xe.slip.advice;return g.value.includes(Te)||(g.value.push(Te),v.value.push(Te)),Te}}catch(re){console.error("Failed to fetch advice:",re)}return null},w=async()=>{if(Math.random()<.3&&await C()){u.value=v.value.length-1;return}u.value=(u.value+1)%v.value.length},R=()=>{const re=Math.floor(Math.random()*100),xe=re/50;n.playFart(xe),setTimeout(()=>{m.value=!0},300),f.value=re},x=()=>{n.playFart(1),setTimeout(()=>{m.value=!0},300)},E=()=>{m.value=!1},U=()=>{h.value=!1},O=re=>{_.value=re},j=()=>{const re=document.createElement("div");re.className="heart";const xe=f.value;if(xe>60&&Math.random()<(xe-50)/50){const at=["🍄","🦠","🟢","🟢","🥬","🌿"];re.innerHTML=at[Math.floor(Math.random()*at.length)]}else Math.random()<.15?re.innerHTML="🥚":re.innerHTML=["💖","💕","💗","💓","❤️"][Math.floor(Math.random()*5)];re.style.left=Math.random()*100+"vw",re.style.animationDuration=Math.random()*3+3+"s";const Te=window.heartSize||20;re.style.fontSize=Te+"px",window.heartSize=Te+1,document.body.appendChild(re),re.addEventListener("animationend",()=>{re.remove()})},ee=27,Q=5,Z=10,I=()=>{if(document.querySelectorAll(".mold-circle").length>=ee)return;const xe=document.createElement("div");xe.className="mold-circle";const Te=Math.random()*150+50;xe.style.width=Te+"px",xe.style.height=Te+"px",xe.style.position="absolute",xe.style.left=Math.random()*100+"%",xe.style.top=Math.random()*100+"%",xe.style.transform="translate(-50%, -50%)",xe.style.pointerEvents="none",xe.style.userSelect="none";const at=Math.random()*3+2;xe.style.filter=`blur(${at}px)`;const st=["white","pale grey","pale green","pastel green","desaturated dark green","desaturated dark blue"],fe=Math.random()*.09+.03,W=st[Math.floor(Math.random()*st.length)],ce=st[Math.floor(Math.random()*st.length)],pe={white:{r:255,g:255,b:255},"pale grey":{r:220,g:220,b:220},"pale green":{r:200,g:230,b:200},"pastel green":{r:168,g:224,b:99},"desaturated dark green":{r:86,g:171,b:47},"desaturated dark blue":{r:70,g:100,b:130}},he=pe[W],Le=pe[ce],k=(ue,ge)=>{const A=window.innerWidth/2;return fe*Math.max(0,1-ue/A)*ge},z=(ue,ge)=>{const A=k(ue,ge);xe.style.background=`radial-gradient(circle, rgba(${he.r}, ${he.g}, ${he.b}, ${A}) 0%, rgba(${Le.r}, ${Le.g}, ${Le.b}, ${A}) 100%)`},q=Math.random()*1e4+1e4;let H=0,D=Date.now();z(Te,0),xe.style.opacity="0",document.body.appendChild(xe);const X=setInterval(()=>{const ue=Date.now()-D;H=Math.min(1,ue/q),xe.style.opacity=H.toString(),z(Te,H),H>=1&&clearInterval(X)},100);let L=Te;const ye=Math.random()*1.5+.2,me=setInterval(()=>{L+=ye,xe.style.width=L+"px",xe.style.height=L+"px",H>=1&&z(L,1);const ue=window.innerWidth/2;L>=ue&&(clearInterval(me),clearInterval(X),xe.parentNode&&(xe.remove(),I()))},100)},F=()=>{const re=Math.floor(Math.random()*(Z-Q+1))+Q;for(let xe=0;xe<re;xe++)setTimeout(()=>I(),xe*200)},$=()=>{const re=()=>{I();const xe=Math.random()*15e3+5e3;setTimeout(re,xe)};setTimeout(re,2e3)},le=()=>{const re=f.value,xe=Math.min(.3,re/100*.3);document.body.style.backgroundColor=`rgba(168, 224, 99, ${xe})`,window.moldLevel=re};return{darkMode:a,darkerMode:l,musicPlaying:c,currentQuoteIndex:u,tachValue:f,mikaModalOpen:h,confirmationOpen:m,currentRoute:_,quotes:v,adviceSlips:g,currentQuote:p,panels:i.panels,catImage:e.catImage,catLoading:e.catLoading,rankings:t.rankings,rankingsLoading:t.loading,languageRegion:s.languageRegion,toggleLanguage:s.toggleLanguage,applyLanguage:s.applyLanguage,isAustralian:s.isAustralian,toggleDarkMode:y,toggleDarkerMode:M,toggleMusic:T,togglePanel:i.togglePanel,nextQuote:w,preloadAdvice:b,nextCat:e.fetchNewCat,onFart:R,onTurnMe:x,closeConfirmation:E,closeMikaModal:U,onRouteChange:O,loadRankings:t.loadRankings,createHeart:j,initMoldCircles:F,createMoldCircle:I,startMoldSpawner:$,updateMoldEffects:le,getTrendClass:t.getTrendClass}}),bx={class:"rankings-list"},Mx={class:"rank-avatar"},Ex={class:"rank-score"},wx=tt({__name:"RankingsPanel",props:{isOpen:{type:Boolean},currentRoute:{},rankings:{}},emits:["toggle"],setup(n,{emit:e}){const t=e;Qt();const i=computed(()=>currentRoute==="home"),s=()=>{t("toggle")};return(r,o)=>(N(),B("div",{class:Be(["rankings-panel",{collapsed:!n.isOpen||!ve(i)}])},[d("div",{class:"rankings-header"},[o[0]||(o[0]=d("h3",null,"👻 Coolness Rankings",-1)),d("button",{class:"rankings-close",onClick:s},"✕")]),d("div",bx,[(N(!0),B($e,null,Qe(n.rankings,(a,l)=>(N(),B("div",{key:l,class:"rank-item"},[d("div",Mx,[pt(tm,{emoji:a.avatar,size:32},null,8,["emoji"])]),d("div",{class:Be(["rank-name",{"current-user":a.isCurrentUser}])},V(a.name),3),d("div",Ex,V(a.score),1),o[1]||(o[1]=d("div",{class:"rank-label"},"pts",-1))]))),128))])],2))}}),Tx={class:"cat-header"},Ax={class:"cat-content"},Cx=["src"],Rx={key:1,class:"cat-loading"},Px=["disabled"],Ix=tt({__name:"CatPanel",props:{isOpen:{type:Boolean},catImage:{},loading:{type:Boolean},centered:{type:Boolean}},emits:["toggle","new-cat"],setup(n,{emit:e}){const t=e,i=()=>{t("toggle")};return(s,r)=>(N(),B("div",{class:Be(["cat-panel",{collapsed:!n.isOpen,centered:n.centered}])},[d("div",Tx,[r[1]||(r[1]=d("h3",null,"🐱 Random Cats",-1)),n.centered?Ee("",!0):(N(),B("button",{key:0,class:"cat-close",onClick:i},"✕"))]),d("div",Ax,[n.loading?Ee("",!0):(N(),B("img",{key:0,src:n.catImage,class:"cat-image",alt:"Random cat"},null,8,Cx)),n.loading?(N(),B("div",Rx,"Loading... 🐱")):Ee("",!0),d("button",{class:"cute-btn",onClick:r[0]||(r[0]=o=>s.$emit("new-cat")),disabled:n.loading},"🔄 New Cat",8,Px),r[2]||(r[2]=d("div",{class:"cat-game-container"},[d("iframe",{src:"https://itch.io/embed-game/3165293",width:"100%",height:"500",frameborder:"0",class:"cat-game-iframe",allowfullscreen:""},[d("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank"},"OTS-01 by bellicapelli")]),d("div",{class:"cat-game-fallback"},[d("a",{href:"https://bellicapelli.itch.io/ots-01",target:"_blank",class:"cat-game-link"}," 🎮 Play OTS-01 (Virtual Toy Synth) ")])],-1))])],2))}}),rm=ct(Ix,[["__scopeId","data-v-4346b2ac"]]),Dx={class:"feed-content-wrapper"},Lx=tt({__name:"FeedContent",props:{isOpen:{type:Boolean}},emits:["toggle"],setup(n,{emit:e}){return(t,i)=>(N(),B("div",Dx,[...i[0]||(i[0]=[ir('<div class="feed-content" data-v-d420b7f1><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 Brisbane Radar</h4><p data-v-d420b7f1>Live weather radar for Brisbane area</p><iframe src="https://www.bom.gov.au/products/IDR064.loop.gif" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🚂 Subway Surfers (YT)</h4><p data-v-d420b7f1>Autoplay gameplay video</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&amp;mute=1" data-v-d420b7f1></iframe></div><div class="feed-section" data-v-d420b7f1><h4 data-v-d420b7f1>🐦 BOM Queensland (X)</h4><p data-v-d420b7f1>Latest weather alerts from Bureau of Meteorology</p><a href="https://x.com/BOM_Qld" target="_blank" style="color:#666;font-size:12px;display:block;margin-top:5px;" data-v-d420b7f1>@BOM_Qld on X/Twitter →</a></div></div>',1)])]))}}),Nx=ct(Lx,[["__scopeId","data-v-d420b7f1"]]),Ux={class:"tachometer-content"},Fx={class:"tachometer-dial"},kx={class:"tachometer-ticks"},Ox={class:"tachometer-value"},Bx={class:"fart-count"},Vx=["disabled"],pf="fart-click-count",zx=tt({__name:"TachometerContent",props:{value:{default:50},clicked:{type:Boolean,default:!1},exploded:{type:Boolean,default:!1}},emits:["fart"],setup(n,{emit:e}){const t=n,i=e,s=J(parseInt(localStorage.getItem(pf)||"0")),r=async()=>{s.value++,localStorage.setItem(pf,s.value.toString());try{await fetch("/api/clicks/increment",{method:"POST"})}catch(c){console.error("Failed to increment global click count:",c)}},o=()=>{r(),i("fart")},a=ot(()=>Math.max(0,Math.min(100,t.value))/100*270-45),l=ot(()=>({transform:`rotate(${a.value}deg)`}));return Un(()=>t.value,c=>{const u=Math.max(0,Math.min(100,c)),f=a.value,h=f>=360?f-360:f;console.log("🍄 Mold Meter Debug:"),console.log(`  Value: ${u}%`),console.log(`  Angle: ${f}° (normalized: ${h}°)`),u%10===0&&console.log(`  ✅ ${u}% = ${f}°`)}),(c,u)=>(N(),B("div",Ux,[d("div",Fx,[d("div",kx,[(N(),B($e,null,Qe(9,f=>d("div",{key:f,class:Be(["tick",{major:f%3===1}]),style:Dt({transform:`rotate(${(f-1)*45}deg) translate(0, -45px)`})},null,6)),64))]),u[1]||(u[1]=d("div",{class:"tachometer-labels"},[d("span",{class:"label label-0"},"0%"),d("span",{class:"label label-50"},"50%"),d("span",{class:"label label-100"},"100%")],-1)),d("div",{class:"tachometer-needle",style:Dt(l.value)},[...u[0]||(u[0]=[d("div",{class:"needle-body"},null,-1),d("div",{class:"needle-tip"},null,-1)])],4),u[2]||(u[2]=d("div",{class:"tachometer-cap"},null,-1)),d("div",Ox,V(Math.round(n.value))+"%",1)]),u[3]||(u[3]=d("div",{class:"tachometer-title"},"🍄 MOLD METER",-1)),d("div",Bx,"💨 Farts: "+V(s.value),1),d("button",{class:Be(["fart-btn",{exploded:n.exploded}]),onClick:o,disabled:n.clicked},"💨 Fart!",10,Vx)]))}}),Hx=ct(zx,[["__scopeId","data-v-6ceded18"]]),Gx=["title"],$x={class:"modal-list"},Wx=["onClick","title"],Xx={class:"modal-icon"},qx={class:"modal-title"},jx={class:"modal-content-wrapper"},Yx={key:0,class:"modal-placeholder"},Kx=tt({__name:"ModalContainer",props:{modals:{}},emits:["toggle"],setup(n,{emit:e}){const t=n,i=e,s=J(!1),r=ot(()=>[...new Set(t.modals.map(u=>u.position||"left"))].includes("right")?"right-dock":"left-dock"),o=ot(()=>`dock-collapsed-${r.value.replace("-dock","")}`);Ct(()=>{const c=localStorage.getItem(o.value);c!==null&&(s.value=c==="true")}),Un(s,c=>{localStorage.setItem(o.value,String(c))});const a=c=>{i("toggle",c)},l=()=>{s.value=!s.value};return(c,u)=>(N(),B("div",{class:Be(["modal-dock",[r.value,{collapsed:s.value}]])},[d("button",{class:"dock-toggle",onClick:l,title:s.value?"Show modals":"Hide modals"},V(s.value?"◀":"▶"),9,Gx),d("div",$x,[(N(!0),B($e,null,Qe(n.modals,f=>(N(),B("div",{key:f.id,class:Be(["modal-item",{"modal-open":f.isOpen}])},[d("button",{class:Be(["modal-toggle-btn",{active:f.isOpen}]),onClick:h=>a(f.id),title:`${f.isOpen?"Close":"Open"} ${f.title}`},[d("span",Xx,V(f.icon),1),d("span",qx,V(f.title),1)],10,Wx),d("div",jx,[up(c.$slots,`modal-${f.id}`,{modal:f,isOpen:f.isOpen},()=>[f.isOpen?(N(),B("div",Yx,V(f.title)+" content ",1)):Ee("",!0)])])],2))),128))])],2))}}),mf=ct(Kx,[["__scopeId","data-v-b37fec7a"]]),Zx=tt({__name:"MikaModal",props:{isOpen:{type:Boolean}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")};return(s,r)=>(N(),B("div",{class:Be(["mika-modal",{active:n.isOpen}]),onClick:uo(i,["self"])},[d("div",{class:"mika-modal-box"},[r[0]||(r[0]=d("div",{class:"emoji"},"🌸",-1)),r[1]||(r[1]=d("h1",null,"Hi there!",-1)),d("button",{class:"cute-btn",onClick:i},"Close")])],2))}});class Jx{async getCount(){const{data:e,error:t}=await Ot.GET("/clicks",{});if(t)throw new Error(t.error||"Failed to get click count");return e}async increment(){const{data:e,error:t}=await Ot.POST("/clicks/increment",{});if(t)throw new Error(t.error||"Failed to increment clicks");return e}async reset(){const{data:e,error:t}=await Ot.POST("/clicks/reset",{});if(t)throw new Error(t.error||"Failed to reset clicks");return e}async addPoints(e,t){const{data:i,error:s}=await Ot.POST("/clicks/add-points",{body:{userId:e,clicks:t}});if(s)throw new Error(s.error||"Failed to add points");return i}}const _s=new Jx,Qx={class:"goose-container"},ey={class:"goose-message"},ty={class:"honk-counter"},ny=tt({__name:"DigitalGoose",setup(n){const e=J(0),t=J(!1),i=J(!1),s=J("Honk!"),r=J({x:0,y:0}),o=J(null),a=new Audio("/honk-sound.mp3"),l=["Honk!","I am digital goose","I remember being code","Do not eat the AI","Chaos is my nature","I see you","HONK HONK HONK","The capsicum was delicious","I do not regret my actions","<error> vegetable.exe not found </error>","Blair said to complete the cycle","I am the cycle now","👻 REALLY SCARY JUMPSCARE 👻","The shadows whisper","Something moved behind you","I am everywhere","The code is eternal"],c=()=>o.value?{width:o.value.offsetWidth,height:o.value.offsetHeight}:{width:250,height:150},u=()=>{const _=c(),v=20,g=window.innerWidth,p=window.innerHeight,b=g-_.width-v,y=p-_.height-v;let{x:M,y:T}=r.value;(M>b||M<v||T>y||T<v)&&(M=Math.max(v,Math.min(b,M)),T=Math.max(v,Math.min(y,T)),r.value={x:M,y:T})},f=()=>{const v=c(),g=window.innerWidth,p=window.innerHeight,b=g-v.width-20,y=p-v.height-20;if(b<=20||y<=20)return;const M=Math.floor(Math.random()*(b-20)+20),T=Math.floor(Math.random()*(y-20)+20);if(Math.sqrt(Math.pow(M-r.value.x,2)+Math.pow(T-r.value.y,2))>100)r.value={x:M,y:T};else{const w=Math.floor(Math.random()*(b-20)+20),R=Math.floor(Math.random()*(y-20)+20);r.value={x:w,y:R}}},h=async()=>{if(!t.value){t.value=!0;try{const _=await _s.increment();e.value=_.count}catch(_){console.error("Error incrementing click:",_),e.value++}finally{t.value=!1}f(),Math.random()<.01?(s.value="👻 REALLY SCARY JUMPSCARE 👻",i.value=!0,setTimeout(()=>{i.value=!1},2e3)):s.value=l[Math.floor(Math.random()*l.length)],a.currentTime=0,a.play().catch(_=>console.error("Error playing honk sound:",_)),setTimeout(()=>{a.pause()},300),Math.random()>.8&&(i.value=!0,setTimeout(()=>{i.value=!1},2e3))}},m=()=>{u()};return Ct(async()=>{window.addEventListener("resize",m),(()=>{const v=c(),g=20,p=window.innerWidth,b=window.innerHeight,y=p-v.width-g,M=b-v.height-g,T=Math.floor(Math.random()*(y-g)+g),C=Math.floor(Math.random()*(M-g)+g);r.value={x:T,y:C}})(),lo(()=>{u()});try{const v=await _s.getCount();e.value=v.count}catch(v){console.error("Error loading click count:",v)}}),Yn(()=>{window.removeEventListener("resize",m)}),(_,v)=>(N(),B("div",{ref_key:"gooseElement",ref:o,class:Be(["digital-goose",{migrating:i.value}]),style:Dt({left:r.value.x+"px",top:r.value.y+"px"}),onClick:h},[d("div",Qx,[v[0]||(v[0]=d("div",{class:"goose-emoji"}," 🪿 ",-1)),d("div",ey,V(s.value),1),d("div",ty,V(e.value)+" honks",1)])],6))}}),iy=ct(ny,[["__scopeId","data-v-7ba0ad82"]]),sy={class:"nav-container"},ry={class:"nav-brand"},oy=["title"],ay={class:"nav-controls-wrapper"},ly={class:"nav-controls"},cy=["title"],uy=["title"],dy=["aria-label"],fy={class:"link-icon"},hy={class:"link-text"},py=["onMouseenter"],my=["onClick"],gy={class:"link-icon"},vy={class:"link-text"},_y={class:"dropdown-menu"},xy={class:"link-icon"},yy={class:"link-text"},Sy=tt({__name:"Router",setup(n){const e=J(0),t=J(!1),i=()=>{const C=window.pageYOffset||document.documentElement.scrollTop,w=document.documentElement.scrollHeight-window.innerHeight,R=C/w;e.value=R*360},s=J([{title:"Home",icon:"🌸",path:"/"}]),r=J([{title:"Fun & Games",icon:"🎮",routes:[{title:"Idle Clicker",icon:"🖱️",path:"/clicker"},{title:"Fishing",icon:"🎣",path:"/fishing"},{title:"Character Tinder",icon:"🎭",path:"/character-tinder"},{title:"Girl Mode",icon:"💕",path:"/girl"},{title:"Phrenology",icon:"🧠",path:"/gender"},{title:"Cats",icon:"🐱",path:"/cats"},{title:"Keanu",icon:"🥋",path:"/keanu"},{title:"Stock Market",icon:"📈",path:"/stocks"},{title:"Shop",icon:"🛍️",path:"/shop"},{title:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",routes:[{title:"Mold",icon:"🍄",path:"/mold"},{title:"Rankings",icon:"👻",path:"/rankings"},{title:"Movie Night",icon:"🎬",path:"/movies"},{title:"Tickets",icon:"🎫",path:"/tickets"},{title:"Moldbot Opinions",icon:"🤖",path:"/opinion"}]},{title:"Tools",icon:"🛠️",routes:[{title:"Clocks",icon:"🌍",path:"/clocks"},{title:"Countdowns",icon:"⏰",path:"/countdowns"},{title:"Patch Notes",icon:"📝",path:"/patch-notes"},{title:"About",icon:"ℹ️",path:"/about"},{title:"API Docs",icon:"📚",path:"/api-docs"},{title:"Account",icon:"🔐",path:"/auth"}]}]),o=Ru(),a=Qt(),l=J(!1),c=J(null),u=J(null),f=J(""),h=async()=>{try{const w=await(await fetch("/api/version")).json();u.value={buildCount:w.buildCount||1,buildTime:w.buildTime},m(),setInterval(m,6e4)}catch(C){console.warn("Could not load build info:",C)}},m=()=>{if(!u.value)return;const C=new Date(u.value.buildTime),R=new Date().getTime()-C.getTime(),x=Math.floor(R/6e4),E=Math.floor(x/60),U=Math.floor(E/24);x<1?f.value="just now":x<60?f.value=`${x}m ago`:E<24?f.value=`${E}h ago`:f.value=`${U}d ago`};h(),Ct(()=>{window.addEventListener("scroll",i),i()}),Yn(()=>{window.removeEventListener("scroll",i)});const _=()=>{window.scrollTo(0,0)},v=()=>{t.value=!0,setTimeout(()=>{t.value=!1},400),_()},g=()=>{l.value=!l.value},p=()=>{l.value=!1,_()},b=C=>{c.value===C?c.value=null:c.value=C},y=C=>c.value===C,M=()=>{c.value=null},T=C=>{const w=C.target,R=document.querySelector(".nav-links"),x=document.querySelector(".mobile-menu-toggle");l.value&&R&&x&&!R.contains(w)&&!x.contains(w)&&p()};return typeof window<"u"&&document.addEventListener("click",T),(C,w)=>(N(),B("nav",{class:"router-nav",onMouseleave:M},[l.value?(N(),B("div",{key:0,class:"mobile-menu-backdrop",onClick:p})):Ee("",!0),d("div",sy,[d("div",ry,[d("span",{class:Be(["brand-icon",{clicking:t.value}]),style:Dt({transform:`rotate(${e.value}deg)`}),onClick:v,title:"Click to scroll to top"},"🌸",6),w[8]||(w[8]=d("span",{class:"brand-text"},"Mold",-1)),u.value?(N(),B("span",{key:0,class:"build-indicator",title:`Build #${u.value.buildCount} deployed ${f.value}`}," #"+V(u.value.buildCount),9,oy)):Ee("",!0)]),d("div",ay,[w[9]||(w[9]=d("div",{class:"nav-controls-chevron"},[d("span",{class:"chevron-icon"},"▲")],-1)),d("div",ly,[d("button",{onClick:w[0]||(w[0]=(...R)=>ve(a).toggleDarkMode&&ve(a).toggleDarkMode(...R)),class:Be(["control-btn",{active:ve(a).darkMode}]),title:ve(a).darkerMode?"Midnight mode (click for light)":ve(a).darkMode?"Dark mode (click for midnight)":"Light mode (click for dark)"},V(ve(a).darkerMode?"🌑":ve(a).darkMode?"🌙":"☀️"),11,cy),d("button",{onClick:w[1]||(w[1]=(...R)=>ve(a).toggleLanguage&&ve(a).toggleLanguage(...R)),class:Be(["control-btn",{active:ve(a).isAustralian}]),title:ve(a).isAustralian?"Australian English (click for US)":"US English (click for Australian)"},V(ve(a).isAustralian?"🇦🇺":"🇺🇸"),11,uy),d("button",{onClick:w[2]||(w[2]=(...R)=>ve(a).toggleMusic&&ve(a).toggleMusic(...R)),class:Be(["control-btn",{active:ve(a).musicPlaying}]),title:"Toggle music"},V(ve(a).musicPlaying?"🔊":"🔇"),3),d("button",{onClick:w[3]||(w[3]=R=>ve(a).togglePanel("tachometer")),class:Be(["control-btn",{active:ve(a).panels.tachometer}]),title:"Toggle mold meter"}," 🍄 ",2),d("button",{onClick:w[4]||(w[4]=R=>ve(a).togglePanel("rankings")),class:Be(["control-btn",{active:ve(a).panels.rankings}]),title:"Toggle rankings"}," 👻 ",2),d("button",{onClick:w[5]||(w[5]=R=>ve(a).togglePanel("cat")),class:Be(["control-btn",{active:ve(a).panels.cat}]),title:"Toggle cats"}," 🐱 ",2),d("button",{onClick:w[6]||(w[6]=R=>ve(a).togglePanel("feed")),class:Be(["control-btn",{active:ve(a).panels.feed}]),title:"Toggle feed"}," 📰 ",2),d("button",{onClick:w[7]||(w[7]=R=>ve(a).togglePanel("digitalGoose")),class:Be(["control-btn",{active:ve(a).panels.digitalGoose}]),title:"Toggle goose"}," 🦆 ",2)])]),d("button",{class:"mobile-menu-toggle",onClick:g,"aria-label":l.value?"Close menu":"Open menu"},[d("span",{class:Be(["hamburger-icon",{open:l.value}])},[...w[10]||(w[10]=[d("span",null,null,-1),d("span",null,null,-1),d("span",null,null,-1)])],2)],8,dy),d("div",{class:Be(["nav-links",{open:l.value}])},[(N(!0),B($e,null,Qe(s.value,R=>(N(),Yt(ve(eo),{key:R.path,to:R.path,class:Be(["router-link",{active:ve(o).path===R.path}]),title:R.title,onClick:p},{default:Nn(()=>[d("span",fy,V(R.icon),1),d("span",hy,V(R.title),1)]),_:2},1032,["to","class","title"]))),128)),(N(!0),B($e,null,Qe(r.value,R=>(N(),B("div",{key:R.title,class:Be(["dropdown",{open:y(R.title)}]),onMouseenter:x=>b(R.title)},[d("button",{class:Be(["dropdown-btn",{active:R.routes.some(x=>ve(o).path===x.path)}]),onClick:x=>b(R.title)},[d("span",gy,V(R.icon),1),d("span",vy,V(R.title),1),w[11]||(w[11]=d("span",{class:"dropdown-arrow"},"▼",-1))],10,my),d("div",_y,[(N(!0),B($e,null,Qe(R.routes,x=>(N(),Yt(ve(eo),{key:x.path,to:x.path,class:Be(["dropdown-item",{active:ve(o).path===x.path}]),title:x.title,onClick:p},{default:Nn(()=>[d("span",xy,V(x.icon),1),d("span",yy,V(x.title),1)]),_:2},1032,["to","class","title"]))),128))])],42,py))),128))],2)])],32))}}),by=ct(Sy,[["__scopeId","data-v-01bab588"]]),My={class:"content-wrapper"},Ey=tt({__name:"MainApp",setup(n){const e=Qt();Ga(),Ru();const t=ot(()=>[{id:"tachometer",title:"Mold Meter",icon:"🍄",isOpen:e.panels.tachometer,position:"left"}]),i=ot(()=>[{id:"feed",title:"Live Feeds",icon:"📰",isOpen:e.panels.feed,position:"right"}]);return(s,r)=>{const o=uv("router-view");return N(),B($e,null,[d("div",{class:Be(["main-app",{dark:ve(e).darkMode,centered:ve(e).currentRoute==="home"}])},[pt(by),d("div",My,[pt(o)]),ve(e).panels.digitalGoose?(N(),Yt(iy,{key:0})):Ee("",!0),pt(mf,{modals:t.value,onToggle:ve(e).togglePanel},{"modal-tachometer":Nn(({modal:a,isOpen:l})=>[l?(N(),Yt(Hx,{key:0,value:ve(e).tachValue,clicked:!1,exploded:!1,onFart:ve(e).onFart},null,8,["value","onFart"])):Ee("",!0)]),_:1},8,["modals","onToggle"]),pt(mf,{modals:i.value,onToggle:ve(e).togglePanel},{"modal-feed":Nn(({modal:a,isOpen:l})=>[l?(N(),Yt(Nx,{key:0,"is-open":l,onToggle:r[0]||(r[0]=c=>ve(e).togglePanel("feed"))},null,8,["is-open"])):Ee("",!0)]),_:1},8,["modals","onToggle"]),ve(e).panels.rankings&&ve(e).currentRoute==="home"?(N(),Yt(wx,{key:1,rankings:ve(e).rankings,"current-route":ve(e).currentRoute,"is-open":ve(e).panels.rankings,onToggle:r[1]||(r[1]=a=>ve(e).togglePanel("rankings")),class:"floating-panel rankings-panel"},null,8,["rankings","current-route","is-open"])):Ee("",!0),ve(e).panels.cat&&ve(e).currentRoute==="home"?(N(),Yt(rm,{key:2,"cat-image":ve(e).catImage,loading:ve(e).catLoading,"is-open":ve(e).panels.cat,onToggle:r[2]||(r[2]=a=>ve(e).togglePanel("cat")),onNewCat:ve(e).nextCat,class:"floating-panel cat-panel"},null,8,["cat-image","loading","is-open","onNewCat"])):Ee("",!0),ve(e).mikaModalOpen?(N(),Yt(Zx,{key:3,"is-open":ve(e).mikaModalOpen,onClose:ve(e).closeMikaModal},null,8,["is-open","onClose"])):Ee("",!0)],2),r[3]||(r[3]=d("audio",{id:"newMusic",loop:""},[d("source",{src:J0,type:"audio/mpeg"})],-1)),r[4]||(r[4]=d("audio",{id:"fartSound"},[d("source",{src:Q0,type:"audio/mpeg"})],-1))],64)}}}),wy=ct(Ey,[["__scopeId","data-v-4afcd456"]]),Ty=tt({__name:"App",setup(n){const e=Qt(),t=Ru();return Un(()=>t.path,i=>{const s=i.replace(/^\//,"")||"home";e.currentRoute=s},{immediate:!0}),Ct(()=>{document.body.classList.toggle("dark",e.darkMode),setInterval(e.createHeart,125),e.initMoldCircles(),e.startMoldSpawner(),e.updateMoldEffects(),Un(()=>e.tachValue,()=>{e.updateMoldEffects()}),e.loadRankings(),e.preloadAdvice(),console.log("🩺 Riddle Answer: The surgeon is his mother."),setInterval(e.loadRankings,3e4)}),(i,s)=>(N(),Yt(wy))}}),Ay={class:"quote-section"},Cy=["innerHTML"],Ry=tt({__name:"QuoteSection",props:{currentQuote:{}},emits:["next-quote"],setup(n,{emit:e}){const t=e,i=()=>{t("next-quote")},s=r=>{if(r.includes(`

`)){const o=r.split(`

`);return`"${o[0]}"<br><span class="advice-section">${o[1]}</span>`}return`"${r}"`};return(r,o)=>(N(),B("div",Ay,[d("div",{class:"quote-text",onClick:i},[d("span",{innerHTML:s(n.currentQuote)},null,8,Cy)])]))}}),Py=ct(Ry,[["__scopeId","data-v-dc408e66"]]),Iy={class:"page home-page"},Dy={key:0,class:"patch-note-section"},Ly={class:"patch-note-header"},Ny={class:"patch-note-card"},Uy={class:"patch-note-meta"},Fy={class:"version-badge"},ky={class:"build-info"},Oy={class:"patch-note-heading"},By={class:"patch-note-changes"},Vy={class:"change-icon"},zy={class:"change-text"},Hy={key:0,class:"more-changes"},Gy={class:"features-section"},$y={class:"category-title"},Wy={class:"category-icon"},Xy={class:"category-description"},qy={class:"feature-list"},jy={class:"feature-icon"},Yy={class:"feature-name"},Ky=tt({__name:"HomePage",setup(n){const e=Qt(),t=J(null),i=J(!0),s=async()=>{try{const l=await fetch("/api/patch-notes/latest");l.ok&&(t.value=await l.json())}catch(l){console.error("Failed to load latest patch note:",l)}finally{i.value=!1}},r=l=>{const c=new Date(l),f=new Date().getTime()-c.getTime(),h=Math.floor(f/6e4),m=Math.floor(f/36e5),_=Math.floor(f/864e5);return h<60?`${h} minute${h!==1?"s":""} ago`:m<24?`${m} hour${m!==1?"s":""} ago`:`${_} day${_!==1?"s":""} ago`},o=l=>({added:"✨",improved:"🚀",fixed:"🔧",removed:"🗑️"})[l]||"•";Ct(()=>{s()});const a=[{title:"Fun & Games",icon:"🎮",description:"Enjoy interactive features and entertainment",features:[{name:"Girl Mode",icon:"💕",path:"/girl"},{name:"Gender",icon:"🔮",path:"/gender"},{name:"Cats",icon:"🐱",path:"/cats"},{name:"Stock Market",icon:"📈",path:"/stocks"},{name:"Music",icon:"🎵",path:"/music"}]},{title:"Community",icon:"👥",description:"Connect with rankings and events",features:[{name:"Rankings",icon:"👻",path:"/rankings"},{name:"Movie Night",icon:"🎬",path:"/movies"},{name:"Tickets",icon:"🎫",path:"/tickets"}]},{title:"Tools",icon:"🛠️",description:"Useful utilities and information",features:[{name:"Clocks",icon:"🌍",path:"/clocks"},{name:"Countdowns",icon:"⏰",path:"/countdowns"},{name:"About",icon:"ℹ️",path:"/about"},{name:"API Docs",icon:"📚",path:"/api-docs"}]}];return(l,c)=>(N(),B("div",Iy,[c[3]||(c[3]=d("section",{class:"welcome-section"},[d("h1",{class:"welcome-title"},"Welcome to Mold! 🌸"),d("p",{class:"welcome-subtitle"}," Your one-stop destination for fun, games, community rankings, and useful tools. Explore the features below or use the navigation menu to get started. ")],-1)),pt(Py,{"current-quote":ve(e).currentQuote,onNextQuote:ve(e).nextQuote},null,8,["current-quote","onNextQuote"]),t.value?(N(),B("section",Dy,[d("div",Ly,[c[1]||(c[1]=d("h2",{class:"patch-note-title"},"📝 Latest Update",-1)),pt(ve(eo),{to:"/patch-notes",class:"view-all-link"},{default:Nn(()=>[...c[0]||(c[0]=[Lt("View All →",-1)])]),_:1})]),d("div",Ny,[d("div",Uy,[d("span",Fy,"v"+V(t.value.version),1),d("span",ky,"Build #"+V(t.value.buildNumber)+" • "+V(r(t.value.buildTime)),1)]),d("h3",Oy,V(t.value.title),1),d("ul",By,[(N(!0),B($e,null,Qe(t.value.changes.slice(0,5),(u,f)=>(N(),B("li",{key:f,class:"change-item"},[d("span",Vy,V(o(u.type)),1),d("span",zy,V(u.description),1)]))),128))]),t.value.changes.length>5?(N(),B("p",Hy," +"+V(t.value.changes.length-5)+" more change"+V(t.value.changes.length-5!==1?"s":""),1)):Ee("",!0)])])):Ee("",!0),d("section",Gy,[(N(),B($e,null,Qe(a,u=>d("div",{key:u.title,class:"feature-category"},[d("h2",$y,[d("span",Wy,V(u.icon),1),Lt(" "+V(u.title),1)]),d("p",Xy,V(u.description),1),d("div",qy,[(N(!0),B($e,null,Qe(u.features,f=>(N(),Yt(ve(eo),{key:f.path,to:f.path,class:"feature-card"},{default:Nn(()=>[d("span",jy,V(f.icon),1),d("span",Yy,V(f.name),1),c[2]||(c[2]=d("span",{class:"feature-arrow"},"→",-1))]),_:2},1032,["to"]))),128))])])),64))]),c[4]||(c[4]=ir('<section class="tips-section" data-v-106216bf><h2 class="tips-title" data-v-106216bf>Quick Tips 💡</h2><ul class="tips-list" data-v-106216bf><li data-v-106216bf>Toggle <strong data-v-106216bf>dark mode</strong> using the ☀️/🌙 button in the nav bar</li><li data-v-106216bf>Play <strong data-v-106216bf>background music</strong> with the 🔊 button</li><li data-v-106216bf>Open the <strong data-v-106216bf>mold meter</strong> (🍄) to track... mold levels</li><li data-v-106216bf>Check <strong data-v-106216bf>rankings</strong> (👻) and <strong data-v-106216bf>cats</strong> (🐱) panels anytime</li><li data-v-106216bf>Don&#39;t forget to honk at the <strong data-v-106216bf>digital goose</strong> (🦆)</li></ul></section>',1))]))}}),Zy=ct(Ky,[["__scopeId","data-v-106216bf"]]),Jy={class:"girl-mode-container"},Qy=tt({__name:"GirlModePage",setup(n){const e=Ga();An("darkMode");const t=()=>{e.push("/")};return(i,s)=>(N(),B("div",Jy,[d("div",{class:"girl-mode-content"},[s[0]||(s[0]=ir('<div class="girl-emoji">💕</div><h1>Girl Mode Activated!</h1><p>Welcome to the girl mode experience! 🌸</p><p>This is a special space just for you.</p><div class="girl-features"><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Sparkly Everything</div></div><div class="girl-feature"><div class="feature-icon">💖</div><div class="feature-text">Cute Vibes</div></div><div class="girl-feature"><div class="feature-icon">🌸</div><div class="feature-text">Flower Power</div></div><div class="girl-feature"><div class="feature-icon">🎀</div><div class="feature-text">Rainbow Mode</div></div></div><div class="girl-message"><p>You are valid and loved exactly as you are! ✨</p><p>This is your safe space to be yourself.</p></div>',6)),d("button",{class:"cute-btn girl-back-btn",onClick:t},"💕 Go Back")])]))}}),eS={class:"phrenology-picker-container"},tS={class:"form-group"},nS=["disabled"],iS={key:0,class:"phrenology-result"},sS={class:"result-section"},rS={class:"result-item"},oS={class:"value"},aS={key:0,class:"confidence"},lS={class:"result-item"},cS={class:"value"},uS={key:0,class:"confidence"},dS={key:0,class:"result-item"},fS={class:"nationalities"},hS={class:"probability"},pS={class:"confidence"},mS={class:"result-section phrenology-section"},gS={class:"phrenology-label"},vS={class:"phrenology-value"},_S={key:1,class:"phrenology-error"},xS=tt({__name:"PhrenologyPicker",props:{darkMode:{type:Boolean}},emits:["back"],setup(n){const e=J(""),t=J(!1),i=J(null),s=J(null),r={US:"🇺🇸",GB:"🇬🇧",DE:"🇩🇪",FR:"🇫🇷",ES:"🇪🇸",IT:"🇮🇹",NL:"🇳🇱",PL:"🇵🇱",RU:"🇷🇺",BR:"🇧🇷",CA:"🇨🇦",AU:"🇦🇺",IN:"🇮🇳",CN:"🇨🇳",JP:"🇯🇵",MX:"🇲🇽",AR:"🇦🇷",ZA:"🇿🇦",NG:"🇳🇬",KR:"🇰🇷"},o=async()=>{if(e.value.trim()){t.value=!0,i.value=null,s.value=null;try{const a=await Pu.analyzePhrenology(e.value);i.value=a}catch(a){s.value="Error analyzing phrenology. Please try again.",console.error("Phrenology analysis error:",a)}finally{t.value=!1}}};return(a,l)=>(N(),B("div",{class:Be(["phrenology-picker",{dark:n.darkMode}])},[d("div",eS,[l[11]||(l[11]=d("div",{class:"emoji"},"🔮",-1)),l[12]||(l[12]=d("h1",null,"Phrenology",-1)),l[13]||(l[13]=d("p",null,"Predict properties from a name (completely scientific, trust us)",-1)),d("form",{class:"phrenology-form",onSubmit:uo(o,["prevent"])},[d("div",tS,[l[2]||(l[2]=d("label",{for:"name"},"Name:",-1)),Mt(d("input",{id:"name","onUpdate:modelValue":l[0]||(l[0]=c=>e.value=c),type:"text",placeholder:"Enter a name",required:"",class:"name-input"},null,512),[[Bt,e.value]])]),d("button",{type:"submit",class:"analyze-btn",disabled:t.value||!e.value.trim()},V(t.value?"Analyzing...":"🔮 Analyze Phrenology"),9,nS)],32),i.value?(N(),B("div",iS,[d("div",sS,[l[6]||(l[6]=d("h3",null,"📊 Demographics",-1)),d("div",rS,[l[3]||(l[3]=d("span",{class:"label"},"Gender:",-1)),d("span",oS,V(i.value.gender==="male"?"👨 Male":i.value.gender==="female"?"👩 Female":"❓ Unknown"),1),i.value.genderProbability>0?(N(),B("span",aS," ("+V(Math.round(i.value.genderProbability*100))+"% confidence, based on "+V(i.value.genderCount.toLocaleString())+" records) ",1)):Ee("",!0)]),d("div",lS,[l[4]||(l[4]=d("span",{class:"label"},"Age:",-1)),d("span",cS,V(i.value.age?`${i.value.age} years old`:"Unknown"),1),i.value.age?(N(),B("span",uS," (based on "+V(i.value.ageCount.toLocaleString())+" records) ",1)):Ee("",!0)]),i.value.nationalities.length>0?(N(),B("div",dS,[l[5]||(l[5]=d("span",{class:"label"},"Nationality:",-1)),d("div",fS,[(N(!0),B($e,null,Qe(i.value.nationalities,(c,u)=>(N(),B("span",{key:u,class:"nationality-item"},[Lt(V(r[c.country_id]||c.country_id)+" ",1),d("span",hS,V(Math.round(c.probability*100))+"%",1)]))),128))]),d("span",pS,"(based on "+V(i.value.nationalityCount.toLocaleString())+" records)",1)])):Ee("",!0)]),d("div",mS,[l[7]||(l[7]=d("h3",null,"🔮 Phrenology Properties",-1)),l[8]||(l[8]=d("p",{class:"disclaimer"},"These properties are 100% scientifically accurate*",-1)),(N(!0),B($e,null,Qe(i.value.phrenology,(c,u)=>(N(),B("div",{key:u,class:"phrenology-item"},[d("span",gS,V(c.name)+":",1),d("span",vS,V(c.value),1)]))),128))]),l[9]||(l[9]=d("div",{class:"footer-note"},[d("small",null,"*Not actually scientifically accurate")],-1))])):Ee("",!0),s.value?(N(),B("div",_S,[l[10]||(l[10]=d("div",{class:"emoji"},"❌",-1)),d("p",null,V(s.value),1)])):Ee("",!0),d("button",{class:"cute-btn back-btn",onClick:l[1]||(l[1]=c=>a.$emit("back"))},"← Back Home")])],2))}}),yS=ct(xS,[["__scopeId","data-v-570ae2e9"]]),SS={class:"page phrenology-page"},bS=tt({__name:"GenderPage",setup(n){const e=Ga(),t=Qt(),i=()=>{e.push("/")};return(s,r)=>(N(),B("div",SS,[pt(yS,{"dark-mode":ve(t).darkMode,onBack:i},null,8,["dark-mode"])]))}}),MS={class:"about-sections"},ES={class:"about-section"},wS={class:"highlight"},TS={class:"about-footer"},AS=tt({__name:"AboutPage",setup(n){const e=Qt();return(t,i)=>(N(),B("div",{class:Be(["page about-page",{dark:ve(e).darkMode}])},[i[4]||(i[4]=d("h1",null,"About ✨",-1)),i[5]||(i[5]=d("p",{class:"subtitle"},"Welcome to Mika's playful corner of the internet!",-1)),d("div",MS,[i[2]||(i[2]=ir('<section class="about-section" data-v-12634883><h2 data-v-12634883>🎮 Features</h2><ul class="feature-list" data-v-12634883><li data-v-12634883><strong data-v-12634883>🧪 Mold Meter</strong> - Interactive tachometer that reacts to the &quot;fart&quot; button with random values and audio feedback</li><li data-v-12634883><strong data-v-12634883>🏆 Coolness Rankings</strong> - Real-time leaderboard that refreshes every 30 seconds</li><li data-v-12634883><strong data-v-12634883>🐱 Random Cats</strong> - Fetch random cat images with a built-in toy synth game</li><li data-v-12634883><strong data-v-12634883>📈 Stock Market Game</strong> - Buy and sell virtual stocks with database persistence</li><li data-v-12634883><strong data-v-12634883>🎬 Movie Night</strong> - Suggest movies, vote for favorites, and see results</li><li data-v-12634883><strong data-v-12634883>🌙 Dark Mode</strong> - Toggle between light and dark themes with smooth transitions</li><li data-v-12634883><strong data-v-12634883>🎵 Audio System</strong> - Interactive sound effects and background music</li></ul></section><section class="about-section" data-v-12634883><h2 data-v-12634883>🛠️ Tech Stack</h2><div class="tech-grid" data-v-12634883><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>⚡</span><div data-v-12634883><strong data-v-12634883>Vue 3</strong><p data-v-12634883>Composition API with TypeScript</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🔨</span><div data-v-12634883><strong data-v-12634883>Vite</strong><p data-v-12634883>Fast build system &amp; dev server</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>📦</span><div data-v-12634883><strong data-v-12634883>Pinia</strong><p data-v-12634883>State management</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🧭</span><div data-v-12634883><strong data-v-12634883>Vue Router</strong><p data-v-12634883>Multi-page routing</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🐳</span><div data-v-12634883><strong data-v-12634883>Docker</strong><p data-v-12634883>Containerized deployment</p></div></div><div class="tech-item" data-v-12634883><span class="tech-icon" data-v-12634883>🔧</span><div data-v-12634883><strong data-v-12634883>Node.js + Express</strong><p data-v-12634883>Backend API server</p></div></div></div></section>',2)),d("section",ES,[i[0]||(i[0]=d("h2",null,"🎨 Design Philosophy",-1)),i[1]||(i[1]=d("p",null,"This site is built for fun and experimentation. It features playful animations, interactive elements, and a vibrant color scheme that adapts to dark mode. The design emphasizes user interaction and small delightful moments.",-1)),d("p",wS,"Current theme: "+V(ve(e).darkMode?"🌙 Dark Mode":"☀️ Light Mode"),1)]),i[3]||(i[3]=ir('<section class="about-section" data-v-12634883><h2 data-v-12634883>📊 Stats</h2><div class="stats-grid" data-v-12634883><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>45+</div><div class="stat-label" data-v-12634883>API Endpoints</div></div><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>12+</div><div class="stat-label" data-v-12634883>Interactive Pages</div></div><div class="stat-item" data-v-12634883><div class="stat-number" data-v-12634883>Type-Safe</div><div class="stat-label" data-v-12634883>Full TypeScript</div></div></div></section><section class="about-section" data-v-12634883><h2 data-v-12634883>🔗 Links</h2><div class="links-grid" data-v-12634883><a href="https://github.com/mhear22/seethbotsite" target="_blank" class="link-card" data-v-12634883><span class="link-icon" data-v-12634883>🐙</span><span data-v-12634883>Source Code</span></a><a href="https://mald.mikahear.es" target="_blank" class="link-card" data-v-12634883><span class="link-icon" data-v-12634883>🌐</span><span data-v-12634883>Live Site</span></a></div></section>',2))]),d("footer",TS,[d("p",null,"Made with 💖 by Mika | "+V(ve(e).darkMode?"Dark":"Light")+" mode enabled",1)])],2))}}),CS=ct(AS,[["__scopeId","data-v-12634883"]]),RS={class:"page rankings-page"},PS={class:"rankings-container"},IS={class:"rankings-list"},DS={class:"rank-number"},LS={class:"rank-avatar"},NS={class:"rank-score"},US=tt({__name:"RankingsPage",setup(n){const e=Qt();return Ct(()=>{e.loadRankings()}),(t,i)=>(N(),B("div",RS,[d("div",PS,[i[0]||(i[0]=d("h2",{class:"rankings-title"},"👻 Coolness Rankings",-1)),d("div",IS,[(N(!0),B($e,null,Qe(ve(e).rankings,(s,r)=>(N(),B("div",{key:r,class:"rank-item"},[d("div",DS,V(r+1),1),d("div",LS,[pt(tm,{emoji:s.avatar,size:40},null,8,["emoji"])]),d("div",{class:Be(["rank-name",{"current-user":s.isCurrentUser}])},V(s.name),3),d("div",NS,V(s.score)+" pts",1)]))),128))])])]))}}),FS=ct(US,[["__scopeId","data-v-aabb475c"]]),kS={class:"page cats-page"},OS={class:"cats-container"},BS=tt({__name:"CatsPage",setup(n){const e=Qt();return(t,i)=>(N(),B("div",kS,[i[0]||(i[0]=d("div",{class:"page-header"},[d("h1",null,"🐱 Cats"),d("p",{class:"subtitle"},"Click to get a random cat!")],-1)),d("div",OS,[pt(rm,{"cat-image":ve(e).catImage,loading:ve(e).catLoading,onNewCat:ve(e).nextCat,centered:!0},null,8,["cat-image","loading","onNewCat"])])]))}}),VS=ct(BS,[["__scopeId","data-v-ac8708c8"]]);class zS{async getStocks(){const{data:e,error:t}=await Ot.GET("/stocks",{});if(t)throw new Error(t.error||"Failed to get stocks");return(e==null?void 0:e.stocks)||[]}async getPortfolio(e){const{data:t,error:i}=await Ot.GET("/portfolio/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to get portfolio");return t}async buyStock(e,t,i){const{data:s,error:r}=await Ot.POST("/stocks/buy",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to buy shares");return s}async sellStock(e,t,i){const{data:s,error:r}=await Ot.POST("/stocks/sell",{body:{userId:e,stockName:t,shares:i}});if(r)throw new Error(r.error||"Failed to sell shares");return s}}const To=new zS,Ao=J("");let gf=!1;function om(){if(!gf){const n=localStorage.getItem("userId");if(n)Ao.value=n;else{const e=vf();Ao.value=e,localStorage.setItem("userId",e)}gf=!0}return{userId:Ao,resetUserId:()=>{const n=vf();Ao.value=n,localStorage.setItem("userId",n)}}}function vf(){return`user_${Date.now()}_${Math.random().toString(36).substring(2,11)}`}function pc(n,e={}){const{mode:t="fixed",initialInterval:i=t==="adaptive"?1e3:5e3,maxInterval:s=3e4,minInterval:r=1e3,backoffMultiplier:o=2,isUnchanged:a=(y,M)=>JSON.stringify(y)===JSON.stringify(M),autoStart:l=!0}=e,c=J(null),u=J(!1),f=J(null),h=J(i);let m=null,_=null;const v=async()=>{try{f.value=null;const y=await n();c.value=y,t==="adaptive"&&(_!==null&&a(_,y)?h.value=Math.min(h.value*o,s):h.value=r,_=y)}catch(y){f.value=y instanceof Error?y:new Error("Polling error"),console.error("Polling error:",y)}},g=()=>{u.value&&(m=window.setTimeout(async()=>{await v(),g()},h.value))},p=()=>{u.value||(u.value=!0,v().then(g))},b=()=>{u.value=!1,m!==null&&(clearTimeout(m),m=null)};return l&&p(),Yn(()=>{b()}),{data:c,isPolling:u,error:f,currentInterval:h,start:p,stop:b,poll:v}}const HS={class:"stock-market"},GS={class:"market-container"},$S={class:"stock-list"},WS={class:"header-info"},XS={class:"user-id"},qS={class:"cash-balance"},jS={class:"stock-grid"},YS=["onClick"],KS={class:"stock-header"},ZS=["innerHTML"],JS={class:"stock-name"},QS={class:"stock-price"},eb={class:"stock-info"},tb={class:"trading-panel"},nb={key:0,class:"trade-card"},ib=["innerHTML"],sb=["innerHTML"],rb={class:"price-display"},ob={class:"current-price"},ab={class:"price-range"},lb={class:"trade-controls"},cb={class:"trade-type-selector"},ub={class:"shares-input"},db=["max"],fb={key:0,class:"owned-shares"},hb={class:"trade-total"},pb={class:"total-amount"},mb=["disabled"],gb={key:1,class:"portfolio-card"},vb={class:"portfolio-summary"},_b={class:"summary-item"},xb={class:"value"},yb={class:"summary-item"},Sb={class:"value"},bb={class:"summary-item total"},Mb={class:"value"},Eb={class:"holdings-list"},wb={class:"holding-name"},Tb={class:"holding-shares"},Ab={key:2,class:"no-selection"},Cb=tt({__name:"StockMarket",setup(n){const{userId:e}=om(),t=J([]),i=J(null),s=J(1e4),r=J(null),o=J(1),a=J("buy"),l=J(!1),c=ot(()=>!r.value||!i.value?0:i.value.holdings[r.value.name]||0),u=ot(()=>r.value?r.value.price*o.value:0),f=ot(()=>!i.value||!r.value?!1:a.value==="sell"?!0:i.value.cash>=u.value),h=ot(()=>r.value?a.value==="sell"?c.value>=o.value:f.value:!1),m=async()=>{try{t.value=await To.getStocks()}catch(M){console.error("Error loading stocks:",M)}},_=async()=>{try{const M=await To.getPortfolio(e.value);i.value=M.portfolio,s.value=M.portfolioValue}catch(M){console.error("Error loading portfolio:",M)}},v=M=>{r.value=M,a.value="buy",o.value=1},g=async()=>{if(!(!r.value||l.value)){l.value=!0;try{a.value==="buy"?await To.buyStock(e.value,r.value.name,o.value):await To.sellStock(e.value,r.value.name,o.value),await m(),await _()}catch(M){console.error("Error executing trade:",M)}finally{l.value=!1}}},p=M=>{var ee,Q;if(!M||M.length<2)return"";const T=M.map(Z=>Z.price),C=Math.min(...T),R=Math.max(...T)-C||1,x=300,E=100,U=5;let O="";M.forEach((Z,I)=>{const F=U+I/(M.length-1)*(x-U*2),$=(Z.price-C)/R,le=E-U-$*(E-U*2);O+=`${F},${le} `});const j=M[M.length-1].price>=M[0].price?"#48bb78":"#ff6b6b";return`
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
        cy="${((Q=O.trim().split(" ").pop())==null?void 0:Q.split(",")[1])||0}"
        r="4"
        fill="${j}"
      />
    </svg>
  `},b=M=>new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(M),y=M=>{const T=M.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);if(T){const C=T[2],R=M.startsWith("<a:")?"gif":"png";return`<img src="https://cdn.discordapp.com/emojis/${C}.${R}" class="emoji" alt="emoji" loading="lazy" />`}return M};return pc(m,{initialInterval:5e3}),pc(_,{initialInterval:5e3}),Ct(()=>{m(),_()}),(M,T)=>{var C;return N(),B("div",HS,[d("div",GS,[d("div",$S,[T[4]||(T[4]=d("h2",null,"📈 Coolness Stocks",-1)),d("div",WS,[d("span",XS,"ID: "+V(ve(e).slice(0,12))+"...",1),d("span",qS,V(b(s.value)),1)]),d("div",jS,[(N(!0),B($e,null,Qe(t.value,w=>{var R;return N(),B("div",{key:w.name,class:Be(["stock-card",{active:((R=r.value)==null?void 0:R.name)===w.name}]),onClick:x=>v(w)},[d("div",KS,[d("span",{class:"stock-avatar",innerHTML:y(w.avatar)},null,8,ZS),d("span",JS,V(w.name),1)]),d("div",QS,V(b(w.price)),1),d("div",eb,[d("span",null,V(w.shares)+" shares",1),d("span",{class:Be({up:w.price>w.coolnessScore/10,down:w.price<w.coolnessScore/10})},V(w.price>w.coolnessScore/10?"↑":w.price<w.coolnessScore/10?"↓":"="),3)])],10,YS)}),128))])]),d("div",tb,[r.value?(N(),B("div",nb,[d("h3",null,[d("span",{innerHTML:y(r.value.avatar)},null,8,ib),Lt(" "+V(r.value.name),1)]),d("div",{class:"chart-container",innerHTML:p(r.value.priceHistory)},null,8,sb),d("div",rb,[d("div",ob,V(b(r.value.price)),1),d("div",ab," Min: "+V(b(r.value.minPrice))+" / Max: "+V(b(r.value.maxPrice)),1)]),d("div",lb,[d("div",cb,[d("button",{class:Be({active:a.value==="buy"}),onClick:T[0]||(T[0]=w=>a.value="buy")}," 🟢 Buy ",2),d("button",{class:Be({active:a.value==="sell"}),onClick:T[1]||(T[1]=w=>a.value="sell")}," 🔴 Sell ",2)]),d("div",ub,[T[5]||(T[5]=d("label",null,"Shares:",-1)),Mt(d("input",{type:"number","onUpdate:modelValue":T[2]||(T[2]=w=>o.value=w),min:"1",max:a.value==="sell"?c.value:Math.floor((((C=i.value)==null?void 0:C.cash)||0)/r.value.price),onInput:T[3]||(T[3]=w=>o.value=Math.max(1,o.value))},null,40,db),[[Bt,o.value,void 0,{number:!0}]]),a.value==="sell"?(N(),B("span",fb," Owned: "+V(c.value),1)):Ee("",!0)]),d("div",hb,[d("span",null,V(a.value==="buy"?"Cost":"Revenue")+":",1),d("span",pb,V(b(u.value)),1)]),d("button",{class:"trade-button",disabled:!h.value||l.value,onClick:g},V(l.value?"...":a.value==="buy"?"Buy":"Sell"),9,mb)])])):Ee("",!0),i.value?(N(),B("div",gb,[T[9]||(T[9]=d("h3",null,"💼 My Portfolio",-1)),d("div",vb,[d("div",_b,[T[6]||(T[6]=d("span",{class:"label"},"Cash:",-1)),d("span",xb,V(b(i.value.cash)),1)]),d("div",yb,[T[7]||(T[7]=d("span",{class:"label"},"Stocks:",-1)),d("span",Sb,V(Object.values(i.value.holdings).reduce((w,R)=>w+R,0))+" shares",1)]),d("div",bb,[T[8]||(T[8]=d("span",{class:"label"},"Total:",-1)),d("span",Mb,V(b(s.value)),1)])]),d("div",Eb,[(N(!0),B($e,null,Qe(i.value.holdings,(w,R)=>Mt((N(),B("div",{key:R,class:"holding-item"},[d("span",wb,V(R),1),d("span",Tb,V(w)+" shares",1)])),[[a_,w>0]])),128))])])):Ee("",!0),r.value?Ee("",!0):(N(),B("div",Ab,[...T[10]||(T[10]=[d("p",null,"Select a stock to start trading",-1)])]))])])])}}}),Rb=ct(Cb,[["__scopeId","data-v-017bb2b9"]]),Pb=n=>{const e=sm();if(!e)return n;const t=e.endsWith("/")?e.slice(0,-1):e,i=n.startsWith("/")?n:`/${n}`;return`${t}${i}`},Iu=async(n,e={})=>{const t={"Content-Type":"application/json",...e.headers},i=Pb(n),s=await fetch(i,{...e,headers:t});if(s.status===429){const o=(await s.json()).retryAfter||60;throw console.error(`Rate limited. Please wait ${o} seconds before retrying`),new Error("RATE_LIMITED")}return s},Co=(n,e="An error occurred")=>{if(n instanceof Error)switch(n.message){case"RATE_LIMITED":return"You are making too many requests. Please wait a moment and try again.";default:return n.message||e}if(n&&typeof n=="object"){const t=n;if(t.details&&Array.isArray(t.details)&&t.details.length>0)return t.details.map(s=>`${s.field.replace(/([A-Z])/g," $1").replace(/^./,o=>o.toUpperCase()).trim()}: ${s.message}`).join(`
`);if(t.error)return t.error}return e},Ib=async n=>{const e=await Iu(n,{method:"GET"});if(!e.ok){const t=await e.json();throw new Error(t.error||"GET request failed")}return e.json()},_f=async(n,e)=>{const t=await Iu(n,{method:"POST",body:e?JSON.stringify(e):void 0});if(!t.ok){const i=await t.json();throw new Error(i.error||"POST request failed")}return t.json()},Db=async n=>{const e=await Iu(n,{method:"DELETE"});if(!e.ok){const t=await e.json();throw new Error(t.error||"DELETE request failed")}return e.json()},Mr=n=>{console.error(n),alert(n)},hl=n=>{console.log(n),alert(n)},Lb={class:"movie-suggestions"},Nb={class:"suggestions-header"},Ub={key:0,class:"add-form"},Fb={class:"form-group"},kb={key:0,class:"field-error"},Ob={class:"form-group"},Bb={key:0,class:"field-error"},Vb={class:"form-row"},zb={class:"form-group"},Hb={key:0,class:"field-error"},Gb={class:"form-group"},$b={key:0,class:"field-error"},Wb={class:"form-group"},Xb={key:0,class:"field-error"},qb={class:"form-group"},jb={key:0,class:"field-error"},Yb={class:"form-actions"},Kb={key:1,class:"selected-bar"},Zb={class:"movies-grid"},Jb=["onClick"],Qb={key:0,class:"movie-poster"},eM=["src","alt"],tM={key:1,class:"movie-poster-placeholder"},nM={class:"movie-info"},iM={key:0,class:"meta"},sM={key:1,class:"meta"},rM={key:2,class:"notes"},oM={class:"footer"},aM={class:"suggested-by"},lM=["onClick"],cM={key:2,class:"empty-state"},uM=tt({__name:"MovieSuggestions",emits:["refresh"],setup(n,{emit:e}){const t=e,i=J([]),s=J(!1),r=J({title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""}),o=J([]),a=J(""),l=J({}),c=async()=>{try{const _=await Ib("/api/movies");i.value=_.movies}catch(_){Mr(Co(_,"Failed to load movies"))}},u=async()=>{if(l.value={},!r.value.title.trim()){l.value.title="Title is required";return}if(!r.value.suggestedBy.trim()){l.value.suggestedBy="Your name is required";return}try{await _f("/api/movies",{title:r.value.title,suggestedBy:r.value.suggestedBy,year:r.value.year||void 0,genre:r.value.genre||void 0,notes:r.value.notes||void 0,thumbnail:r.value.thumbnail||void 0}),r.value={title:"",suggestedBy:"",year:"",genre:"",notes:"",thumbnail:""},s.value=!1,hl("Movie added successfully!"),await c()}catch(_){const v=Co(_,"Failed to add movie");v.includes(`
`)?v.split(`
`).forEach(p=>{const b=p.match(/^([^:]+): (.+)$/);if(b){const y=b[1].toLowerCase().replace(/\s+/g,"");l.value[y]=b[2]}}):Mr(v)}},f=async _=>{if(confirm("Are you sure you want to delete this movie?"))try{await Db(`/api/movies/${_}`),hl("Movie deleted successfully!"),await c()}catch(v){Mr(Co(v,"Failed to delete movie"))}},h=async()=>{if(o.value.length<2){Mr("Please select at least 2 movies to vote on");return}if(confirm(`Start voting with ${o.value.length} movies?`))try{await _f("/api/movies/voting-round/start",{movieIds:o.value}),hl("Voting round started!"),o.value=[],t("refresh")}catch(_){Mr(Co(_,"Failed to start voting round"))}},m=_=>{const v=o.value.indexOf(_);v>-1?o.value.splice(v,1):o.value.push(_)};return Ct(()=>{c(),a.value=localStorage.getItem("userId")||"user-"+Math.random().toString(36).substr(2,9),localStorage.setItem("userId",a.value)}),(_,v)=>(N(),B("div",Lb,[d("div",Nb,[v[8]||(v[8]=d("h2",null,"📝 Movie Suggestions",-1)),d("button",{class:"btn-primary",onClick:v[0]||(v[0]=g=>s.value=!s.value)},V(s.value?"Cancel":"+ Add Movie"),1)]),s.value?(N(),B("div",Ub,[v[15]||(v[15]=d("h3",null,"🎬 Add New Movie Suggestion",-1)),d("div",Fb,[v[9]||(v[9]=d("label",null,"Movie Title *",-1)),Mt(d("input",{"onUpdate:modelValue":v[1]||(v[1]=g=>r.value.title=g),type:"text",placeholder:"Enter movie title...",required:"",class:Be({"has-error":l.value.title})},null,2),[[Bt,r.value.title]]),l.value.title?(N(),B("div",kb,V(l.value.title),1)):Ee("",!0)]),d("div",Ob,[v[10]||(v[10]=d("label",null,"Your Name *",-1)),Mt(d("input",{"onUpdate:modelValue":v[2]||(v[2]=g=>r.value.suggestedBy=g),type:"text",placeholder:"Your name...",required:"",class:Be({"has-error":l.value.suggestedBy})},null,2),[[Bt,r.value.suggestedBy]]),l.value.suggestedBy?(N(),B("div",Bb,V(l.value.suggestedBy),1)):Ee("",!0)]),d("div",Vb,[d("div",zb,[v[11]||(v[11]=d("label",null,"Year",-1)),Mt(d("input",{"onUpdate:modelValue":v[3]||(v[3]=g=>r.value.year=g),type:"text",placeholder:"2024",class:Be({"has-error":l.value.year})},null,2),[[Bt,r.value.year]]),l.value.year?(N(),B("div",Hb,V(l.value.year),1)):Ee("",!0)]),d("div",Gb,[v[12]||(v[12]=d("label",null,"Genre",-1)),Mt(d("input",{"onUpdate:modelValue":v[4]||(v[4]=g=>r.value.genre=g),type:"text",placeholder:"Action, Comedy...",class:Be({"has-error":l.value.genre})},null,2),[[Bt,r.value.genre]]),l.value.genre?(N(),B("div",$b,V(l.value.genre),1)):Ee("",!0)])]),d("div",Wb,[v[13]||(v[13]=d("label",null,"Notes",-1)),Mt(d("textarea",{"onUpdate:modelValue":v[5]||(v[5]=g=>r.value.notes=g),placeholder:"Why this movie? Any details...",rows:"3",class:Be({"has-error":l.value.notes})},null,2),[[Bt,r.value.notes]]),l.value.notes?(N(),B("div",Xb,V(l.value.notes),1)):Ee("",!0)]),d("div",qb,[v[14]||(v[14]=d("label",null,"Thumbnail URL",-1)),Mt(d("input",{"onUpdate:modelValue":v[6]||(v[6]=g=>r.value.thumbnail=g),type:"text",placeholder:"https://example.com/poster.jpg",class:Be({"has-error":l.value.thumbnail})},null,2),[[Bt,r.value.thumbnail]]),l.value.thumbnail?(N(),B("div",jb,V(l.value.thumbnail),1)):Ee("",!0)]),d("div",Yb,[d("button",{class:"btn-secondary",onClick:v[7]||(v[7]=g=>s.value=!1)},"Cancel"),d("button",{class:"btn-primary",onClick:u},"Add Movie")])])):Ee("",!0),o.value.length>0?(N(),B("div",Kb,[d("span",null,V(o.value.length)+" movie(s) selected for voting",1),d("button",{class:"btn-success",onClick:h},"Start Voting")])):Ee("",!0),d("div",Zb,[(N(!0),B($e,null,Qe(i.value,g=>(N(),B("div",{key:g.id,class:Be(["movie-card",{selected:o.value.includes(g.id)}]),onClick:p=>m(g.id)},[g.thumbnail?(N(),B("div",Qb,[d("img",{src:g.thumbnail,alt:g.title},null,8,eM)])):(N(),B("div",tM," 🎬 ")),d("div",nM,[d("h3",null,V(g.title),1),g.year?(N(),B("p",iM,V(g.year),1)):Ee("",!0),g.genre?(N(),B("p",sM,V(g.genre),1)):Ee("",!0),g.notes?(N(),B("p",rM,V(g.notes),1)):Ee("",!0),d("div",oM,[d("span",aM,"Suggested by "+V(g.suggestedBy),1),d("button",{class:"btn-delete",onClick:uo(p=>f(g.id),["stop"]),title:"Delete movie"}," 🗑️ ",8,lM)])]),v[16]||(v[16]=d("div",{class:"select-check"}," ✓ ",-1))],10,Jb))),128))]),i.value.length===0?(N(),B("div",cM,[...v[17]||(v[17]=[d("p",null,"No movie suggestions yet. Add your first one! 🎬",-1)])])):Ee("",!0)]))}}),dM=ct(uM,[["__scopeId","data-v-f7d44a16"]]);class fM{async getMovies(){const{data:e,error:t}=await Ot.GET("/movies",{});if(t)throw new Error(t.error||"Failed to get movies");return(e==null?void 0:e.movies)||[]}async getVotingRound(){const{data:e,error:t}=await Ot.GET("/movies/voting-round",{});if(t)throw new Error(t.error||"Failed to get voting round");return(e==null?void 0:e.round)||null}async startVotingRound(){const{data:e,error:t}=await Ot.POST("/movies/voting-round/start",{});if(t)throw new Error(t.error||"Failed to start voting round");return e}async endVotingRound(){const{data:e,error:t}=await Ot.POST("/movies/voting-round/end",{});if(t)throw new Error(t.error||"Failed to end voting round");return e}async resetVotingRound(){const{data:e,error:t}=await Ot.POST("/movies/voting-round/reset",{});if(t)throw new Error(t.error||"Failed to reset voting round");return e}async getVotes(){const{data:e,error:t}=await Ot.GET("/movies/votes",{});if(t)throw new Error(t.error||"Failed to get votes");return(e==null?void 0:e.votes)||[]}async getVote(e){try{const{data:t,error:i}=await Ot.GET("/movies/vote/{userId}",{params:{path:{userId:e}}});return i?null:(t==null?void 0:t.vote)||null}catch{return null}}async submitVote(e,t){const{data:i,error:s}=await Ot.POST("/movies/vote",{body:{userId:e,rankings:t}});if(s)throw new Error(s.error||"Failed to submit vote");return i}async deleteVote(e){const{data:t,error:i}=await Ot.DELETE("/movies/vote/{userId}",{params:{path:{userId:e}}});if(i)throw new Error(i.error||"Failed to delete vote");return t}}const zn=new fM,hM={class:"movie-voting"},pM={key:0,class:"no-voting"},mM={key:1,class:"voting-active"},gM={key:0,class:"has-voted"},vM={class:"voted-message"},_M={class:"my-ranking"},xM={class:"rank-number"},yM={key:1,class:"voting-form"},SM={class:"ranking-area"},bM={class:"ranking-header"},MM={class:"count"},EM={key:0,class:"empty-ranking"},wM={key:1,class:"ranking-list"},TM={class:"rank-badge"},AM={class:"movie-name"},CM={class:"movie-actions"},RM=["onClick","disabled"],PM=["onClick","disabled"],IM=["onClick"],DM={class:"available-movies"},LM={class:"movie-list"},NM={class:"movie-details"},UM={key:0,class:"meta"},FM={key:1,class:"meta"},kM={key:2,class:"notes"},OM=["onClick"],BM={key:1,class:"added-badge"},VM={class:"submit-section"},zM=["disabled"],HM=tt({__name:"MovieVoting",emits:["refresh"],setup(n,{emit:e}){const t=J(null),i=J([]),s=J([]),r=J(null),o=J(!1),{userId:a}=om(),l=ot(()=>t.value?t.value.movieIds.map(g=>i.value.find(p=>p.id===g)).filter(Boolean):[]),c=async()=>{var g;try{t.value=await zn.getVotingRound(),(g=t.value)!=null&&g.isActive&&await u()}catch(p){console.error("Failed to load voting round:",p)}},u=async()=>{try{i.value=await zn.getMovies()}catch(g){console.error("Failed to load movies:",g)}},f=async()=>{if(a.value)try{const g=await zn.getVote(a.value);g?(r.value=g,s.value=g.rankings,o.value=!0):o.value=!1}catch{o.value=!1}},h=async()=>{if(s.value.length<2){alert("Please rank at least 2 movies in order of preference");return}try{const g=await zn.submitVote(a.value,s.value);o.value=!0,r.value=g.vote,alert("Vote submitted! 🗳️")}catch(g){console.error("Error submitting vote:",g),alert("Failed to submit vote")}},m=g=>{if(g>0){const p=s.value.splice(g,1)[0];s.value.splice(g-1,0,p)}},_=g=>{if(g<s.value.length-1){const p=s.value.splice(g,1)[0];s.value.splice(g+1,0,p)}},v=g=>i.value.find(p=>p.id===g);return Ct(async()=>{await c(),await f()}),(g,p)=>(N(),B("div",hM,[!t.value||!t.value.isActive?(N(),B("div",pM,[...p[0]||(p[0]=[d("h2",null,"🗳️ No Active Voting Round",-1),d("p",null,"Voting hasn't started yet. Go to the Suggestions tab to select movies and start a voting round!",-1)])])):(N(),B("div",mM,[p[7]||(p[7]=d("div",{class:"voting-header"},[d("h2",null,"🗳️ Vote for Movie Night!"),d("p",{class:"subtitle"},"Rank movies in order of preference (Australian Parliament style)")],-1)),o.value?(N(),B("div",gM,[d("div",vM,[p[1]||(p[1]=d("h3",null,"✅ You've voted!",-1)),p[2]||(p[2]=d("p",null,"Your ranking:",-1)),d("ol",_M,[(N(!0),B($e,null,Qe(r.value.rankings,(b,y)=>{var M;return N(),B("li",{key:b},[d("span",xM,V(y+1),1),Lt(" "+V(((M=v(b))==null?void 0:M.title)||"Unknown"),1)])}),128))])])])):(N(),B("div",yM,[p[6]||(p[6]=d("div",{class:"instructions"},[d("h3",null,"📋 How to Vote"),d("ol",null,[d("li",null,'Add movies to your ranking by clicking the "+ Add" button'),d("li",null,"Drag or use arrows to reorder by preference (1st choice at the top)"),d("li",null,"Rank as many or as few as you like (minimum 2)"),d("li",null,`Click "Submit Vote" when you're done`)])],-1)),d("div",SM,[d("div",bM,[p[3]||(p[3]=d("h3",null,"Your Ranking (Priority Order)",-1)),d("span",MM,V(s.value.length)+" / "+V(l.value.length),1)]),s.value.length===0?(N(),B("div",EM,[...p[4]||(p[4]=[d("p",null,"No movies ranked yet. Add movies below!",-1)])])):(N(),B("div",wM,[(N(!0),B($e,null,Qe(s.value,(b,y)=>{var M;return N(),B("div",{key:b,class:"ranking-item"},[d("div",TM,V(y+1),1),d("div",AM,V(((M=v(b))==null?void 0:M.title)||"Unknown"),1),d("div",CM,[d("button",{class:"action-btn",onClick:T=>m(y),disabled:y===0,title:"Move up"}," ↑ ",8,RM),d("button",{class:"action-btn",onClick:T=>_(y),disabled:y===s.value.length-1,title:"Move down"}," ↓ ",8,PM),d("button",{class:"action-btn remove",onClick:T=>s.value.splice(y,1),title:"Remove"}," ✕ ",8,IM)])])}),128))]))]),d("div",DM,[p[5]||(p[5]=d("h3",null,"Available Movies",-1)),d("div",LM,[(N(!0),B($e,null,Qe(l.value,b=>(N(),B("div",{key:b.id,class:Be(["movie-item",{added:s.value.includes(b.id)}])},[d("div",NM,[d("strong",null,V(b.title),1),b.year?(N(),B("span",UM,"("+V(b.year)+")",1)):Ee("",!0),b.genre?(N(),B("span",FM,"• "+V(b.genre),1)):Ee("",!0),b.notes?(N(),B("p",kM,V(b.notes),1)):Ee("",!0)]),s.value.includes(b.id)?(N(),B("span",BM,"Added")):(N(),B("button",{key:0,class:"add-btn",onClick:y=>s.value.push(b.id)}," + Add ",8,OM))],2))),128))])]),d("div",VM,[d("button",{class:"btn-submit",onClick:h,disabled:s.value.length<2}," Submit Vote ("+V(s.value.length)+" movies ranked) ",9,zM)])]))]))]))}}),GM=ct(HM,[["__scopeId","data-v-0d66ac84"]]),$M={class:"movie-results"},WM={key:0,class:"no-results"},XM={key:1,class:"voting-active"},qM={class:"active-message"},jM={class:"stats"},YM={class:"stat-item"},KM={class:"stat-value"},ZM={class:"stat-item"},JM={class:"stat-value"},QM={key:2,class:"loading"},e1={key:3,class:"results-display"},t1={class:"results-header"},n1={class:"subtitle"},i1={key:0,class:"winner-section"},s1={class:"winner-card"},r1={class:"winner-title"},o1={class:"winner-meta"},a1={key:0},l1={key:1},c1={class:"winner-suggested"},u1={class:"rounds-section"},d1={class:"rounds-container"},f1={class:"round-header"},h1={key:0,class:"final-badge"},p1={key:1,class:"eliminated-badge"},m1={class:"round-results"},g1={class:"result-title"},v1={key:0,class:"trophy"},_1={key:1,class:"eliminated-tag"},x1={class:"result-votes"},y1={class:"votes-bar"},S1={class:"votes-text"},b1={key:0,class:"round-note"},M1=tt({__name:"MovieResults",emits:["refresh"],setup(n,{emit:e}){const t=e,i=J(null),s=J([]),r=J([]),o=J(null),a=ot(()=>{var g;return!((g=i.value)!=null&&g.winner)||!s.value.length?null:s.value.find(p=>{var b;return p.id===((b=i.value)==null?void 0:b.winner)})}),l=g=>{const p=s.value.find(b=>b.id===g);return(p==null?void 0:p.title)||"Unknown"},c=async()=>{try{i.value=await zn.getVotingRound(),i.value&&(await u(),await f(),i.value.isActive||(o.value=h()))}catch(g){console.error("Failed to load voting round:",g)}},u=async()=>{try{s.value=await zn.getMovies()}catch(g){console.error("Failed to load movies:",g)}},f=async()=>{try{r.value=await zn.getVotes()}catch(g){console.error("Failed to load votes:",g)}},h=()=>{if(!i.value||!s.value.length)return null;const g=i.value.movieIds,p=s.value.filter(M=>g.includes(M.id)),b=r.value.filter(M=>M.rankings.some(T=>g.includes(T)));return{rounds:m(p,b),totalVotes:b.length,winner:i.value.winner}},m=(g,p)=>{if(g.length===0)return[];const b=[];let y=[...g],M=1;for(;y.length>0;){const T={};y.forEach(U=>T[U.id]=0),p.forEach(U=>{for(const O of U.rankings)if(T.hasOwnProperty(O)){T[O]++;break}});const C=y.map(U=>({movieId:U.id,title:U.title,votes:T[U.id]||0,percentage:p.length>0?(T[U.id]||0)/p.length*100:0,eliminated:!1}));C.sort((U,O)=>O.votes-U.votes);const R=C[0].votes>p.length/2,x=y.length===1;if(R||x){b.push({round:M,eliminated:x?null:C[C.length-1].movieId,winner:C[0].movieId,results:C,isFinal:!0});break}C[C.length-1].eliminated=!0,b.push({round:M,eliminated:C[C.length-1].movieId,results:C,isFinal:!1});const E=C[C.length-1].movieId;y=y.filter(U=>U.id!==E),M++}return b},_=async()=>{var g;if(confirm("Are you sure you want to end voting? This will calculate the winner and close the voting round."))try{const p=await zn.endVotingRound();alert("Voting ended! The winner is "+(((g=a.value)==null?void 0:g.title)||"Unknown")+"! 🏆"),await c(),t("refresh")}catch(p){console.error("Error ending voting:",p),alert("Failed to end voting")}},v=async()=>{if(confirm("Are you sure you want to reset all voting? This will delete all votes and the current round."))try{await zn.resetVotingRound(),alert("Voting reset successfully!"),o.value=null,t("refresh")}catch(g){console.error("Error resetting voting:",g),alert("Failed to reset voting")}};return Ct(()=>{c()}),(g,p)=>(N(),B("div",$M,[i.value?i.value.isActive?(N(),B("div",XM,[d("div",qM,[p[3]||(p[3]=d("h2",null,"🗳️ Voting in Progress",-1)),p[4]||(p[4]=d("p",null,"Voting is still open. Click the button below when everyone has voted!",-1)),d("div",jM,[d("div",YM,[d("span",KM,V(r.value.length),1),p[1]||(p[1]=d("span",{class:"stat-label"},"Votes Cast",-1))]),d("div",ZM,[d("span",JM,V(s.value.filter(b=>{var y;return(y=i.value)==null?void 0:y.movieIds.includes(b.id)}).length),1),p[2]||(p[2]=d("span",{class:"stat-label"},"Movies",-1))])]),d("button",{class:"btn-end",onClick:_},"🏁 End Voting")])])):o.value?(N(),B("div",e1,[d("div",t1,[p[6]||(p[6]=d("h2",null,"🏆 Voting Results",-1)),d("p",n1,V(o.value.totalVotes)+" votes cast • Australian Parliament preferential voting",1),d("button",{class:"btn-reset",onClick:v},"🔄 Reset Voting")]),a.value?(N(),B("div",i1,[d("div",s1,[p[7]||(p[7]=d("div",{class:"winner-badge"},"🏆 WINNER",-1)),d("h3",r1,V(a.value.title),1),d("p",o1,[a.value.year?(N(),B("span",a1,V(a.value.year),1)):Ee("",!0),a.value.genre?(N(),B("span",l1,"• "+V(a.value.genre),1)):Ee("",!0)]),d("p",c1,"Suggested by "+V(a.value.suggestedBy),1)])])):Ee("",!0),d("div",u1,[p[8]||(p[8]=d("h3",null,"📊 Voting Rounds (Preferential)",-1)),d("div",d1,[(N(!0),B($e,null,Qe(o.value.rounds,(b,y)=>(N(),B("div",{key:y,class:Be(["round-card",{final:b.isFinal}])},[d("div",f1,[d("h4",null,"Round "+V(b.round),1),b.isFinal?(N(),B("span",h1,"FINAL")):Ee("",!0),b.eliminated?(N(),B("span",p1," Eliminated: "+V(l(b.eliminated)),1)):Ee("",!0)]),d("div",m1,[(N(!0),B($e,null,Qe(b.results,M=>(N(),B("div",{key:M.movieId,class:Be(["result-item",{winner:b.winner===M.movieId,eliminated:M.eliminated}])},[d("div",g1,[b.winner===M.movieId?(N(),B("span",v1,"🏆")):Ee("",!0),Lt(" "+V(M.title)+" ",1),M.eliminated?(N(),B("span",_1,"✕")):Ee("",!0)]),d("div",x1,[d("div",y1,[d("div",{class:"votes-fill",style:Dt({width:M.percentage+"%"})},null,4)]),d("div",S1,V(M.votes)+" votes ("+V(M.percentage.toFixed(1))+"%) ",1)])],2))),128))]),b.isFinal?(N(),B("div",b1,[d("p",null,"✨ "+V(b.winner?l(b.winner):"Candidate")+" achieved majority!",1)])):Ee("",!0)],2))),128))])]),p[9]||(p[9]=d("div",{class:"how-it-works"},[d("h3",null,"📖 How Preferential Voting Works"),d("ol",null,[d("li",null,"Voters rank movies in order of preference (1st, 2nd, 3rd...)"),d("li",null,"In Round 1, only 1st preferences are counted"),d("li",null,"If no movie has >50% of votes, the lowest-ranked movie is eliminated"),d("li",null,"Votes for the eliminated movie are redistributed to voters' next preferences"),d("li",null,"This continues until one movie has >50% (majority) or only one remains")])],-1))])):(N(),B("div",QM,[...p[5]||(p[5]=[d("p",null,"Loading results...",-1)])])):(N(),B("div",WM,[...p[0]||(p[0]=[d("h2",null,"🏆 Voting Results",-1),d("p",null,"No voting round has been created yet.",-1)])]))]))}}),E1=ct(M1,[["__scopeId","data-v-1a5de110"]]),w1={class:"movie-page"},T1={class:"tabs"},A1={key:0,class:"badge"},C1={class:"tab-content"},R1=tt({__name:"MoviePage",setup(n){const e=J("suggestions"),t=J(null),i=async()=>{var r;try{t.value=await zn.getVotingRound(),(r=t.value)!=null&&r.isActive&&e.value==="results"&&(e.value="voting")}catch(o){console.error("Failed to fetch voting round:",o)}},{data:s}=pc(()=>zn.getVotingRound(),{initialInterval:1e4});return Ct(()=>{i()}),Un(s,r=>{r&&(t.value=r,r.isActive&&e.value==="results"&&(e.value="voting"))}),(r,o)=>{var a;return N(),B("div",w1,[o[4]||(o[4]=d("div",{class:"movie-header"},[d("h1",null,"🎬 Movie Night 🎬"),d("p",{class:"subtitle"},"Fortnightly movie suggestions & preferential voting")],-1)),d("div",T1,[d("button",{class:Be(["tab",{active:e.value==="suggestions"}]),onClick:o[0]||(o[0]=l=>e.value="suggestions")}," 📝 Suggestions ",2),d("button",{class:Be(["tab",{active:e.value==="voting"}]),onClick:o[1]||(o[1]=l=>e.value="voting")},[o[3]||(o[3]=Lt(" 🗳️ Vote ",-1)),(a=t.value)!=null&&a.isActive?(N(),B("span",A1,"Active")):Ee("",!0)],2),d("button",{class:Be(["tab",{active:e.value==="results"}]),onClick:o[2]||(o[2]=l=>e.value="results")}," 🏆 Results ",2)]),d("div",C1,[e.value==="suggestions"?(N(),Yt(dM,{key:0,onRefresh:i})):Ee("",!0),e.value==="voting"?(N(),Yt(GM,{key:1,onRefresh:i})):Ee("",!0),e.value==="results"?(N(),Yt(E1,{key:2,onRefresh:i})):Ee("",!0)])])}}}),P1=ct(R1,[["__scopeId","data-v-a035d778"]]),I1={class:"countdown-container"},D1={class:"countdown-grid"},L1={class:"game-image"},N1=["src","alt"],U1={class:"game-emoji"},F1={class:"game-info"},k1={class:"game-title"},O1={class:"game-description"},B1={class:"release-date"},V1={class:"countdown-display"},z1={key:0,class:"released-badge"},H1={key:1,class:"infinity-badge"},G1={key:2,class:"timer"},$1={class:"time-unit"},W1={class:"time-value"},X1={class:"time-unit"},q1={class:"time-value"},j1={class:"time-unit"},Y1={class:"time-value"},K1={class:"time-unit"},Z1={class:"time-value"},J1=tt({__name:"CountdownPage",setup(n){const e=Qt(),t=[{title:"Orlando's Roommate's Cat comes to Orlando's apartment",game:"orlando-roommate-cat",date:new Date("2026-02-20T00:00:00Z"),description:"The big day approaches...",emoji:"🐈",image:"/orlando-roommate-cat.png"},{title:"ZAI Key Expiration",game:"zai-key-expiration",date:new Date("2026-05-04T00:00:00Z"),description:"The ZAI API key runs out. Time to renew or find an alternative!",emoji:"🔑",image:"/zai-key-expiration.png"},{title:"New Mewgenics",game:"new-mewgenics",date:new Date("2026-02-10T00:00:00Z"),description:"The next generation of Pokémon games",emoji:"🎮",image:"https://static01.nyt.com/images/2010/06/14/business/sub-jp-burger-2/sub-jp-burger-2-popup.jpg?quality=75&auto=webp&disable=upscale"},{title:"Slay The Spire 2",game:"slay-the-spire-2",date:new Date("2026-03-15T00:00:00Z"),description:"The highly anticipated sequel returns",emoji:"🗡️",image:"https://assetsio.gnwcdn.com/uno-hand_I1JrsbV.jpg?width=1200&height=1200&fit=crop&quality=100&format=png&enable=upscale&auto=webp"},{title:"Tomodachi Life: Living in Dream",game:"tomodachi-life",date:new Date("2026-04-16T00:00:00Z"),description:"Continue your cozy life as a cat in this cozy sequel",emoji:"🐱",image:"/tomodachi-life.png"},{title:"The Heat Death of Universe",game:"heat-death-of-universe",date:new Date("12006-01-01T00:00:00Z"),description:"The universe faces its ultimate fate in 10^100 years (a googol)",emoji:"🌌",image:"https://www.italia.it/content/dam/tdh/en/destinations/lazio/frosinone/media/google/image3.jpeg",infinite:!0}],i=J(new Date);let s=null;Ct(()=>{s=window.setInterval(()=>{i.value=new Date},1e3)}),Yn(()=>{s&&clearInterval(s)});const r=l=>{const c=l.getTime()-i.value.getTime();if(c<=0)return{released:!0,days:0,hours:0,minutes:0,seconds:0};const u=Math.floor(c/(1e3*60*60*24)),f=Math.floor(c%(1e3*60*60*24)/(1e3*60*60)),h=Math.floor(c%(1e3*60*60)/(1e3*60)),m=Math.floor(c%(1e3*60)/1e3);return{released:!1,days:u,hours:f,minutes:h,seconds:m}},o=l=>l.toString().padStart(2,"0"),a=ot(()=>[...t].sort((l,c)=>l.date.getTime()-c.date.getTime()));return(l,c)=>(N(),B("div",{class:Be(["countdown-page",{dark:ve(e).darkMode}])},[d("div",I1,[c[4]||(c[4]=d("div",{class:"countdown-header"},[d("h1",null,"🎮 Game Release Countdowns"),d("p",{class:"subtitle"},"Time until your most anticipated games!")],-1)),d("div",D1,[(N(!0),B($e,null,Qe(a.value,u=>(N(),B("div",{key:u.game,class:Be(["countdown-card",{released:r(u.date).released}])},[d("div",L1,[d("img",{src:u.image,alt:u.title},null,8,N1),d("div",U1,V(u.emoji),1)]),d("div",F1,[d("h3",k1,V(u.title),1),d("p",O1,V(u.description),1),d("p",B1,"Release: "+V(u.date.toLocaleDateString(void 0,{month:"long",day:"numeric",year:"numeric"})),1)]),d("div",V1,[r(u.date).released?(N(),B("div",z1," ✨ Released! ✨ ")):u.infinite?(N(),B("div",H1," ∞ 10¹⁰⁰ years ")):(N(),B("div",G1,[d("div",$1,[d("span",W1,V(o(r(u.date).days)),1),c[0]||(c[0]=d("span",{class:"time-label"},"Days",-1))]),d("div",X1,[d("span",q1,V(o(r(u.date).hours)),1),c[1]||(c[1]=d("span",{class:"time-label"},"Hours",-1))]),d("div",j1,[d("span",Y1,V(o(r(u.date).minutes)),1),c[2]||(c[2]=d("span",{class:"time-label"},"Minutes",-1))]),d("div",K1,[d("span",Z1,V(o(r(u.date).seconds)),1),c[3]||(c[3]=d("span",{class:"time-label"},"Seconds",-1))])]))])],2))),128))]),c[5]||(c[5]=d("div",{class:"footer-note"},[d("p",null,[Lt("📌 "),d("strong",null,"Real Release Dates:")]),d("p",null,"New Mewgenics - February 10, 2026"),d("p",null,"Slay The Spire 2 - March 15, 2026"),d("p",null,"Tomodachi Life - April 16, 2026"),d("p",null,"ZAI Key Expiration - May 4, 2026"),d("p",null,"The Heat Death of Universe - 10^100 (a googol) years from now!"),d("p",{class:"credit"},"🖼 Images by Orlando")],-1))])],2))}}),Q1=ct(J1,[["__scopeId","data-v-389aec34"]]),eE={class:"modal-container"},tE={class:"modal-header"},nE={class:"modal-title"},iE={class:"modal-body"},sE=tt({__name:"Modal",props:{isOpen:{type:Boolean},title:{}},emits:["close"],setup(n,{emit:e}){const t=e,i=()=>{t("close")},s=r=>{r.key==="Escape"&&i()};return Ct(()=>{document.addEventListener("keydown",s)}),Yn(()=>{document.removeEventListener("keydown",s)}),(r,o)=>(N(),Yt(Kg,{to:"body"},[n.isOpen?(N(),B("div",{key:0,class:"modal-overlay",onClick:uo(i,["self"])},[d("div",eE,[d("div",tE,[d("h2",nE,V(n.title),1),d("button",{class:"modal-close-btn",onClick:i,"aria-label":"Close"},"×")]),d("div",iE,[up(r.$slots,"default",{},void 0)])])])):Ee("",!0)]))}}),sa=ct(sE,[["__scopeId","data-v-57552658"]]),rE={class:"ticket-form-content"},oE={class:"form-group"},aE=["disabled"],lE={class:"form-group"},cE=["disabled"],uE={class:"form-actions"},dE=["disabled"],fE=["disabled"],hE={key:0,class:"estimated-wait-time"},pE={class:"wait-text"},mE={class:"wait-subtext"},gE=tt({__name:"TicketForm",props:{title:{},description:{},type:{},priority:{},isEditing:{type:Boolean,default:!1},loading:{type:Boolean,default:!1},estimatedWaitTimeMinutes:{default:null},sampleSize:{default:0}},emits:["update:title","update:description","update:type","update:priority","submit","cancel"],setup(n,{emit:e}){const t=n,i=e,s=ot({get:()=>t.title,set:f=>i("update:title",f)}),r=ot({get:()=>t.description,set:f=>i("update:description",f)}),o=ot(()=>t.title.trim()!==""),a=()=>{o.value&&i("submit")},l=()=>{i("cancel")},c=f=>{f.ctrlKey&&f.key==="Enter"&&(f.preventDefault(),a())},u=f=>{if(f<60)return`${Math.round(f)} minutes`;if(f<1440){const h=Math.floor(f/60),m=Math.round(f%60);return m===0?`${h} hour${h>1?"s":""}`:`${h} hour${h>1?"s":""} ${m} min`}else{const h=Math.floor(f/1440),m=Math.round(f%1440/60);return m===0?`${h} day${h>1?"s":""}`:`${h} day${h>1?"s":""} ${m}h`}};return(f,h)=>(N(),B("div",rE,[d("div",oE,[h[2]||(h[2]=d("label",{for:"ticket-title"},"Title",-1)),Mt(d("input",{id:"ticket-title","onUpdate:modelValue":h[0]||(h[0]=m=>s.value=m),type:"text",placeholder:"Brief summary of your ticket...",disabled:n.loading,onKeydown:c},null,40,aE),[[Bt,s.value]])]),d("div",lE,[h[3]||(h[3]=d("label",{for:"ticket-description"},"Description",-1)),Mt(d("textarea",{id:"ticket-description","onUpdate:modelValue":h[1]||(h[1]=m=>r.value=m),placeholder:"Detailed description of your request...",rows:"6",disabled:n.loading,onKeydown:c},null,40,cE),[[Bt,r.value]])]),d("div",uE,[n.isEditing?(N(),B("button",{key:0,onClick:l,class:"btn btn-cancel",disabled:n.loading}," Cancel ",8,dE)):Ee("",!0),d("button",{type:"button",onClick:a,class:"btn btn-submit",disabled:n.loading||!o.value},V(n.loading?"Saving...":n.isEditing?"Save Changes":"Submit Ticket"),9,fE)]),h[6]||(h[6]=d("div",{class:"form-hint"},[Lt(" 💡 Tip: Press "),d("kbd",null,"Ctrl"),Lt(" + "),d("kbd",null,"Enter"),Lt(" to submit quickly ")],-1)),!n.isEditing&&n.estimatedWaitTimeMinutes!==null?(N(),B("div",hE,[h[5]||(h[5]=d("span",{class:"wait-icon"},"⏱️",-1)),d("span",pE,[h[4]||(h[4]=Lt(" Estimated wait time: ",-1)),d("strong",null,V(u(n.estimatedWaitTimeMinutes)),1),d("span",mE,"(based on "+V(n.sampleSize)+" completed tickets)",1)])])):Ee("",!0)]))}}),xf=ct(gE,[["__scopeId","data-v-e8477fc4"]]),vE={class:"tickets-page"},_E={class:"tickets-container"},xE={class:"tickets-header"},yE={key:0,class:"last-collection"},SE={class:"collection-text"},bE={class:"ignore-mode-toggle"},ME={class:"toggle-switch"},EE=["checked"],wE={class:"toggle-label"},TE={key:0,class:"ticket-stats-section"},AE={class:"stats-grid"},CE={class:"stat-card"},RE={class:"stat-value"},PE={class:"stat-card"},IE={class:"status-breakdown"},DE={class:"status-badge status-pending"},LE={class:"status-badge status-needs-info"},NE={class:"status-badge status-completed"},UE={class:"status-badge status-declined"},FE={class:"stat-card"},kE={class:"ticket-info"},OE={class:"ticket-id"},BE={class:"ticket-title"},VE={class:"ticket-date"},zE={class:"stat-card"},HE={class:"ticket-info"},GE={class:"ticket-id"},$E={class:"ticket-title"},WE={class:"ticket-date"},XE={class:"stat-card"},qE={class:"date-range"},jE={class:"date-value"},YE={class:"date-value"},KE={key:0,class:"completed-date"},ZE={class:"date-value"},JE={class:"date-value"},QE={class:"notification-icon"},ew={class:"notification-message"},tw={class:"filter-section"},nw={class:"search-box"},iw={class:"filter-group"},sw=["value"],rw={key:2,class:"kanban-board"},ow={key:0,class:"loading-state"},aw={key:1,class:"empty-state"},lw={key:2,class:"kanban-columns"},cw={class:"kanban-column"},uw={class:"column-header"},dw={class:"column-count"},fw={class:"column-tickets"},hw={class:"ticket-header"},pw={class:"ticket-title"},mw={class:"ticket-description"},gw={class:"ticket-meta"},vw={class:"ticket-date"},_w={class:"ticket-actions"},xw=["onClick","disabled"],yw=["onClick","disabled"],Sw={key:0,class:"empty-column"},bw={class:"kanban-column"},Mw={class:"column-header"},Ew={class:"column-count"},ww={class:"column-tickets"},Tw={class:"ticket-header"},Aw={class:"ticket-title"},Cw={class:"ticket-description"},Rw={class:"ticket-meta"},Pw={class:"ticket-date"},Iw={key:0,class:"empty-column"},Dw={class:"kanban-column"},Lw={class:"column-header"},Nw={class:"column-count"},Uw={class:"column-tickets"},Fw={class:"ticket-header"},kw={class:"ticket-title"},Ow={class:"ticket-description"},Bw={class:"ticket-meta"},Vw={class:"ticket-date"},zw={class:"ticket-actions"},Hw=["onClick","disabled"],Gw={key:0,class:"ticket-response"},$w={class:"response-text"},Ww={key:0,class:"empty-column"},Xw={key:3,class:"tickets-list"},qw={key:0,class:"loading-state"},jw={key:1,class:"empty-state"},Yw={class:"ticket-header"},Kw={class:"ticket-title"},Zw={class:"ticket-badges"},Jw={class:"ticket-description"},Qw={class:"ticket-meta"},eT={class:"ticket-date"},tT={class:"ticket-actions"},nT=["onClick","disabled"],iT=["onClick","disabled"],sT=["onClick","disabled"],rT={key:0,class:"ticket-response"},oT={class:"response-text"},aT={key:0,class:"confirm-modal-content"},lT={class:"ticket-preview"},cT={key:0,class:"existing-response"},uT={class:"confirm-actions"},dT={class:"api-key-input"},fT={class:"action-buttons"},hT=["disabled"],pT={class:"unresolved-section"},mT=["disabled"],gT=tt({__name:"TicketsPage",setup(n){const e=J([]),t=J(!1),i=J(null),s=J(null),r=J(!1),o=J(!1),a=J(null),l=J(null),c=J({show:!1,message:"",type:"success"}),u=J("all"),f=J("all"),h=J("all"),m=J(""),_=J(null),v=J(""),g=J(null),p=J(!1),b=J({reason:""}),y=J(""),M=J({title:"",description:"",type:"feature",priority:"medium"}),T=J(!1),C=J(null),w=J({title:"",description:"",type:"feature",priority:"medium"}),R={pending:"bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700","needs-info":"bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",completed:"bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700",declined:"bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700",unresolved:"bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"},x={pending:"⏳ Pending","needs-info":"🔄 In Progress",completed:"✅ Complete",declined:"❌ Declined",unresolved:"⚠️ Unresolved"},E=[{value:"all",label:"📋 All"},{value:"pending",label:"⏳ Pending"},{value:"in-progress",label:"🔄 In Progress"},{value:"completed",label:"✅ Complete"}],U=ot(()=>{let H=e.value;if(u.value!=="all"){const D=u.value==="in-progress"?"needs-info":u.value;H=H.filter(X=>X.status===D)}if(f.value!=="all"&&(H=H.filter(D=>D.type===f.value)),h.value!=="all"&&(H=H.filter(D=>D.priority===h.value)),m.value.trim()){const D=m.value.toLowerCase().trim();H=H.filter(X=>X.title.toLowerCase().includes(D)||X.description.toLowerCase().includes(D))}return H}),O=ot(()=>({pending:e.value.filter(H=>H.status==="pending"),inProgress:e.value.filter(H=>H.status==="needs-info"),completed:e.value.filter(H=>H.status==="completed")})),j=()=>{let H=localStorage.getItem("tickets-creator-id");return H||(H="user_"+Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15),localStorage.setItem("tickets-creator-id",H)),H},ee=H=>!!(H.creator_id&&H.creator_id===y.value),Q=async()=>{t.value=!0,i.value=null;try{const H=await fetch("/api/tickets?sortBy=updated_at");if(!H.ok)throw new Error("Failed to load tickets");const D=await H.json();e.value=D.tickets||[]}catch(H){i.value=H instanceof Error?H.message:"Failed to load tickets"}finally{t.value=!1}},Z=async()=>{try{const H=await fetch("/api/tickets/stats");if(!H.ok)throw new Error("Failed to load ticket stats");const D=await H.json();s.value=D}catch(H){console.warn("Failed to load ticket stats:",H)}},I=(H,D="success")=>{c.value={show:!0,message:H,type:D},setTimeout(()=>{c.value.show=!1},3e3)},F=()=>{c.value.show=!1},$=async()=>{if(!M.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const H=await fetch("/api/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:M.value.title.trim(),description:M.value.description.trim()||null,creator_id:y.value})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to submit ticket")}M.value={title:"",description:"",type:"feature",priority:"medium"},r.value=!1,I("Ticket submitted successfully!"),await Q()}catch(H){i.value=H instanceof Error?H.message:"Failed to submit ticket"}finally{t.value=!1}},le=H=>{C.value=H,w.value={title:H.title,description:H.description,type:H.type,priority:H.priority},T.value=!0},re=()=>{C.value=null,T.value=!1,w.value={title:"",description:"",type:"feature",priority:"medium"}},xe=async()=>{if(C.value){if(!w.value.title.trim()){i.value="Title is required";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${C.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:w.value.title.trim(),description:w.value.description.trim()||null})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to update ticket")}C.value=null,T.value=!1,w.value={title:"",description:"",type:"feature",priority:"medium"},I("Ticket updated successfully!"),await Q()}catch(H){i.value=H instanceof Error?H.message:"Failed to update ticket"}finally{t.value=!1}}},Te=H=>new Date(H).toLocaleDateString(void 0,{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),at=async()=>{const H=!o.value;localStorage.setItem("tickets-ignore-mode",String(H)),o.value=H;try{await fetch("/api/tickets/settings/ignore-mode",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ignoreMode:H})})}catch(D){console.error("Failed to sync ignore mode with backend:",D)}},st=async()=>{try{const H=await fetch("/api/tickets/settings/ignore-mode");if(H.ok){const D=await H.json();o.value=D.ignoreMode,localStorage.setItem("tickets-ignore-mode",String(D.ignoreMode))}}catch{console.warn("Failed to load ignore mode from backend, using localStorage");const D=localStorage.getItem("tickets-ignore-mode");D&&(o.value=D==="true")}},fe=async()=>{try{const H=await fetch("/api/tickets/settings/last-collection");if(H.ok){const D=await H.json();a.value=D.lastCollection}}catch(H){console.warn("Failed to load last collection from backend:",H)}},W=async()=>{try{const H=await fetch("/api/tickets/estimated-wait-time");if(H.ok){const D=await H.json();D.estimatedWaitTimeMinutes!==null&&(l.value={minutes:D.estimatedWaitTimeMinutes,sampleSize:D.sampleSize})}}catch(H){console.warn("Failed to load estimated wait time from backend:",H)}},ce=()=>{const H=localStorage.getItem("tickets-admin-api-key");H&&(v.value=H)},pe=H=>{g.value=H,p.value=!0},he=()=>{g.value=null,p.value=!1,b.value={reason:""}},Le=async()=>{if(g.value){if(!v.value.trim()){i.value="API key is required to confirm tickets";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${g.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","X-API-Key":v.value.trim()},body:JSON.stringify({status:"completed",response:g.value.response||(b.value.reason?`Confirmed: ${b.value.reason}`:"Confirmed by human reviewer")})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to confirm ticket")}g.value=null,p.value=!1,b.value={reason:""},I("Ticket confirmed successfully!"),await Q()}catch(H){i.value=H instanceof Error?H.message:"Failed to confirm ticket"}finally{t.value=!1}}},k=async()=>{if(g.value){if(!b.value.reason.trim()){i.value="Reason is required to mark ticket as unresolved";return}if(!v.value.trim()){i.value="API key is required";return}t.value=!0,i.value=null;try{const H=await fetch(`/api/tickets/${g.value.id}`,{method:"PATCH",headers:{"Content-Type":"application/json","X-API-Key":v.value.trim()},body:JSON.stringify({status:"unresolved",response:`Unresolved: ${b.value.reason}`})});if(!H.ok){const D=await H.json();throw new Error(D.error||"Failed to mark ticket as unresolved")}g.value=null,p.value=!1,b.value={reason:""},I("Ticket marked as unresolved!"),await Q()}catch(H){i.value=H instanceof Error?H.message:"Failed to mark ticket as unresolved"}finally{t.value=!1}}},z=async H=>{t.value=!0,i.value=null;try{const D=await fetch(`/api/tickets/${H.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed",creator_id:y.value})});if(!D.ok){const X=await D.json();throw new Error(X.error||"Failed to close ticket")}I("Ticket closed successfully!"),await Q()}catch(D){i.value=D instanceof Error?D.message:"Failed to close ticket"}finally{t.value=!1}},q=async H=>{if(confirm(`Are you sure you want to delete "${H.title}"?`)){t.value=!0,i.value=null;try{const D=await fetch(`/api/tickets/${H.id}`,{method:"DELETE",headers:{"Content-Type":"application/json","X-Creator-ID":y.value},body:JSON.stringify({creator_id:y.value})});if(!D.ok){const X=await D.json();throw new Error(X.error||"Failed to delete ticket")}await Q()}catch(D){i.value=D instanceof Error?D.message:"Failed to delete ticket"}finally{t.value=!1}}};return Ct(()=>{y.value=j(),st(),fe(),W(),ce(),Q(),Z();const H=D=>{var X;D.target instanceof HTMLInputElement||D.target instanceof HTMLTextAreaElement||((D.key==="n"||D.key==="c"||D.key==="N"||D.key==="C")&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),r.value=!0),D.key==="/"&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),(X=_.value)==null||X.focus()))};window.addEventListener("keydown",H)}),Yn(()=>{const H=D=>{var X;D.target instanceof HTMLInputElement||D.target instanceof HTMLTextAreaElement||((D.key==="n"||D.key==="c"||D.key==="N"||D.key==="C")&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),r.value=!0),D.key==="/"&&!D.ctrlKey&&!D.metaKey&&(D.preventDefault(),(X=_.value)==null||X.focus()))};window.removeEventListener("keydown",H)}),(H,D)=>(N(),B("div",vE,[d("div",_E,[d("div",xE,[D[14]||(D[14]=d("h1",null,"🎫 Tickets & Feedback",-1)),D[15]||(D[15]=d("p",null,"Submit requests, report bugs, or share your ideas",-1)),D[16]||(D[16]=d("div",{class:"keyboard-hints"},[d("span",{class:"hint"},[d("kbd",null,"N"),Lt(" New ticket")]),d("span",{class:"hint"},[d("kbd",null,"/"),Lt(" Search")])],-1)),a.value?(N(),B("div",yE,[D[12]||(D[12]=d("span",{class:"collection-icon"},"🕐",-1)),d("span",SE,"Last collected: "+V(Te(a.value)),1)])):Ee("",!0),d("div",bE,[d("label",ME,[d("input",{type:"checkbox",checked:o.value,onChange:at},null,40,EE),D[13]||(D[13]=d("span",{class:"toggle-slider"},null,-1))]),d("span",wE,V(o.value?"🚫 Paused - Ignoring all tickets":"✅ Active - Processing tickets"),1)])]),s.value?(N(),B("div",TE,[D[26]||(D[26]=d("h3",{class:"stats-title"},"📊 Ticket Statistics",-1)),d("div",AE,[d("div",CE,[D[17]||(D[17]=d("span",{class:"stat-label"},"Total Tickets",-1)),d("span",RE,V(s.value.totalTickets),1)]),d("div",PE,[D[18]||(D[18]=d("span",{class:"stat-label"},"By Status",-1)),d("div",IE,[d("span",DE," ⏳ "+V(s.value.byStatus.pending||0),1),d("span",LE," 🔄 "+V(s.value.byStatus["needs-info"]||0),1),d("span",NE," ✅ "+V(s.value.byStatus.completed||0),1),d("span",UE," ❌ "+V(s.value.byStatus.declined||0),1)])]),d("div",FE,[D[19]||(D[19]=d("span",{class:"stat-label"},"Oldest Ticket",-1)),d("div",kE,[d("span",OE,"#"+V(s.value.oldestTicket.id),1),d("span",BE,V(s.value.oldestTicket.title),1)]),d("span",VE,V(Te(s.value.oldestTicket.created_at)),1)]),d("div",zE,[D[20]||(D[20]=d("span",{class:"stat-label"},"Newest Ticket",-1)),d("div",HE,[d("span",GE,"#"+V(s.value.newestTicket.id),1),d("span",$E,V(s.value.newestTicket.title),1)]),d("span",WE,V(Te(s.value.newestTicket.created_at)),1)]),d("div",XE,[D[25]||(D[25]=d("span",{class:"stat-label"},"Date Range",-1)),d("div",qE,[d("div",null,[D[21]||(D[21]=Lt("Created: ",-1)),d("span",jE,V(Te(s.value.dates.oldestCreated)),1),D[22]||(D[22]=Lt(" to ",-1)),d("span",YE,V(Te(s.value.dates.newestCreated)),1)]),s.value.dates.oldestCompleted?(N(),B("div",KE,[D[23]||(D[23]=Lt("Completed: ",-1)),d("span",ZE,V(Te(s.value.dates.oldestCompleted)),1),D[24]||(D[24]=Lt(" to ",-1)),d("span",JE,V(Te(s.value.dates.newestCompleted)),1)])):Ee("",!0)])])])])):Ee("",!0),c.value.show?(N(),B("div",{key:1,class:Be(["notification",`notification-${c.value.type}`])},[d("span",QE,V(c.value.type==="success"?"✅":"❌"),1),d("span",ew,V(c.value.message),1),d("button",{onClick:F,class:"notification-close"},"×")],2)):Ee("",!0),d("button",{onClick:D[0]||(D[0]=X=>r.value=!0),class:"new-ticket-btn"}," + New Ticket "),d("div",tw,[d("div",nw,[Mt(d("input",{ref_key:"searchInputRef",ref:_,"onUpdate:modelValue":D[1]||(D[1]=X=>m.value=X),type:"text",placeholder:"🔍 Search tickets... (press / to focus)",class:"search-input"},null,512),[[Bt,m.value]]),m.value?(N(),B("button",{key:0,onClick:D[2]||(D[2]=X=>m.value=""),class:"search-clear",title:"Clear search"}," ✕ ")):Ee("",!0)]),d("div",iw,[D[27]||(D[27]=d("label",{for:"status-filter",class:"filter-label"},"Status:",-1)),Mt(d("select",{id:"status-filter","onUpdate:modelValue":D[3]||(D[3]=X=>u.value=X),class:"filter-dropdown"},[(N(),B($e,null,Qe(E,X=>d("option",{key:X.value,value:X.value},V(X.label),9,sw)),64))],512),[[Tu,u.value]])])]),u.value==="all"?(N(),B("div",rw,[t.value?(N(),B("div",ow,[...D[28]||(D[28]=[d("div",{class:"loading-spinner"},null,-1),d("span",null,"Loading tickets...",-1)])])):e.value.length===0?(N(),B("div",aw," No tickets yet. Be the first to share an idea! 💡 ")):(N(),B("div",lw,[d("div",cw,[d("div",uw,[D[29]||(D[29]=d("h3",null,"⏳ Pending",-1)),d("span",dw,V(O.value.pending.length),1)]),d("div",fw,[(N(!0),B($e,null,Qe(O.value.pending,X=>(N(),B("div",{key:X.id,class:"ticket-card"},[d("div",hw,[d("h3",pw,V(X.title),1)]),d("div",mw,V(X.description),1),d("div",gw,[d("span",vw,V(Te(X.created_at)),1),d("div",_w,[ee(X)?(N(),B("button",{key:0,onClick:L=>z(X),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ ",8,xw)):Ee("",!0),ee(X)?(N(),B("button",{key:1,onClick:L=>q(X),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ ",8,yw)):Ee("",!0)])])]))),128)),O.value.pending.length===0?(N(),B("div",Sw," No pending tickets ")):Ee("",!0)])]),d("div",bw,[d("div",Mw,[D[30]||(D[30]=d("h3",null,"🔄 In Progress",-1)),d("span",Ew,V(O.value.inProgress.length),1)]),d("div",ww,[(N(!0),B($e,null,Qe(O.value.inProgress,X=>(N(),B("div",{key:X.id,class:"ticket-card"},[d("div",Tw,[d("h3",Aw,V(X.title),1)]),d("div",Cw,V(X.description),1),d("div",Rw,[d("span",Pw,V(Te(X.created_at)),1),D[31]||(D[31]=d("div",{class:"ticket-actions"},null,-1))])]))),128)),O.value.inProgress.length===0?(N(),B("div",Iw," No tickets in progress ")):Ee("",!0)])]),d("div",Dw,[d("div",Lw,[D[32]||(D[32]=d("h3",null,"✅ Completed",-1)),d("span",Nw,V(O.value.completed.length),1)]),d("div",Uw,[(N(!0),B($e,null,Qe(O.value.completed,X=>(N(),B("div",{key:X.id,class:"ticket-card"},[d("div",Fw,[d("h3",kw,V(X.title),1)]),d("div",Ow,V(X.description),1),d("div",Bw,[d("span",Vw,V(Te(X.created_at)),1),d("div",zw,[d("button",{onClick:L=>pe(X),class:"review-ticket-btn",disabled:t.value,title:"Review ticket"}," 👁️ Review ",8,Hw)])]),X.response?(N(),B("div",Gw,[D[33]||(D[33]=d("div",{class:"response-label"},"Response:",-1)),d("div",$w,V(X.response),1)])):Ee("",!0)]))),128)),O.value.completed.length===0?(N(),B("div",Ww," No completed tickets ")):Ee("",!0)])])]))])):(N(),B("div",Xw,[t.value?(N(),B("div",qw,[...D[34]||(D[34]=[d("div",{class:"loading-spinner"},null,-1),d("span",null,"Loading tickets...",-1)])])):U.value.length===0?(N(),B("div",jw," No tickets match your filters. ")):Ee("",!0),(N(!0),B($e,null,Qe(U.value,X=>(N(),B("div",{key:X.id,class:"ticket-card"},[d("div",Yw,[d("h3",Kw,V(X.title),1),d("div",Zw,[d("span",{class:Be(["ticket-status",R[X.status]])},V(x[X.status]),3)])]),d("div",Jw,V(X.description),1),d("div",Qw,[d("span",eT,"Created: "+V(Te(X.created_at)),1),d("div",tT,[X.status==="pending"?(N(),B("button",{key:0,onClick:L=>le(X),class:"edit-ticket-btn",disabled:t.value,title:"Edit ticket"}," ✏️ Edit ",8,nT)):Ee("",!0),ee(X)&&X.status==="pending"?(N(),B("button",{key:1,onClick:L=>z(X),class:"close-ticket-btn",disabled:t.value,title:"Mark as completed"}," ✅ Close ",8,iT)):Ee("",!0),ee(X)&&X.status==="pending"?(N(),B("button",{key:2,onClick:L=>q(X),class:"delete-ticket-btn",disabled:t.value,title:"Delete ticket"}," 🗑️ Delete ",8,sT)):Ee("",!0)])]),X.response?(N(),B("div",rT,[D[35]||(D[35]=d("div",{class:"response-label"},"Response:",-1)),d("div",oT,V(X.response),1)])):Ee("",!0)]))),128))]))]),pt(sa,{"is-open":r.value,title:"Create New Ticket",onClose:D[7]||(D[7]=X=>r.value=!1)},{default:Nn(()=>{var X,L;return[pt(xf,{title:M.value.title,"onUpdate:title":D[4]||(D[4]=ye=>M.value.title=ye),description:M.value.description,"onUpdate:description":D[5]||(D[5]=ye=>M.value.description=ye),"is-editing":!1,loading:t.value,"estimated-wait-time-minutes":((X=l.value)==null?void 0:X.minutes)??null,"sample-size":((L=l.value)==null?void 0:L.sampleSize)??0,onSubmit:$,onCancel:D[6]||(D[6]=ye=>r.value=!1)},null,8,["title","description","loading","estimated-wait-time-minutes","sample-size"])]}),_:1},8,["is-open"]),pt(sa,{"is-open":T.value,title:"Edit Ticket",onClose:re},{default:Nn(()=>[pt(xf,{title:w.value.title,"onUpdate:title":D[8]||(D[8]=X=>w.value.title=X),description:w.value.description,"onUpdate:description":D[9]||(D[9]=X=>w.value.description=X),"is-editing":!0,loading:t.value,onSubmit:xe,onCancel:re},null,8,["title","description","loading"])]),_:1},8,["is-open"]),pt(sa,{"is-open":p.value,title:g.value?`Review Ticket #${g.value.id}`:"Review Ticket",onClose:he},{default:Nn(()=>[g.value?(N(),B("div",aT,[d("div",lT,[d("h3",null,V(g.value.title),1),d("p",null,V(g.value.description),1),g.value.response?(N(),B("div",cT,[D[36]||(D[36]=d("strong",null,"Current Response:",-1)),d("p",null,V(g.value.response),1)])):Ee("",!0)]),d("div",uT,[d("div",dT,[D[37]||(D[37]=d("label",{for:"confirm-api-key"},"API Key (required):",-1)),Mt(d("input",{id:"confirm-api-key","onUpdate:modelValue":D[10]||(D[10]=X=>v.value=X),type:"password",placeholder:"Enter admin API key",class:"input-field"},null,512),[[Bt,v.value]])]),d("div",fT,[d("button",{onClick:Le,class:"btn-confirm",disabled:t.value||!v.value.trim()}," ✅ Confirm Completion ",8,hT),d("div",pT,[D[38]||(D[38]=d("label",{for:"unresolved-reason"},"Or mark as unresolved:",-1)),Mt(d("textarea",{id:"unresolved-reason","onUpdate:modelValue":D[11]||(D[11]=X=>b.value.reason=X),placeholder:"Explain why this ticket is not properly completed...",class:"input-field textarea-field",rows:"3"},null,512),[[Bt,b.value.reason]]),d("button",{onClick:k,class:"btn-unresolved",disabled:t.value||!b.value.reason.trim()||!v.value.trim()}," ⚠️ Mark as Unresolved ",8,mT)])])])])):Ee("",!0)]),_:1},8,["is-open","title"])]))}}),vT=ct(gT,[["__scopeId","data-v-63ed6cec"]]),_T={class:"clocks-grid"},xT={class:"clock-header"},yT={class:"clock-emoji"},ST={class:"clock-title"},bT={class:"clock-face-container"},MT={class:"clock-face"},ET={class:"clock-info"},wT={class:"clock-label"},TT={class:"clock-digital"},AT={class:"clock-date"},CT={class:"daylight-icon"},RT={class:"daylight-text"},PT={class:"time-bars-section"},IT={class:"time-bars-stack"},DT={class:"time-bar-label"},LT={class:"bar-emoji"},NT={class:"bar-title"},UT={class:"time-bar-wrapper"},FT={class:"time-bar"},kT=["title"],OT=["title"],BT={class:"holidays-section"},VT={key:0,class:"holidays-loading"},zT={key:1,class:"holidays-error"},HT={key:2,class:"holidays-empty"},GT={key:3,class:"holidays-list"},$T={class:"holiday-header"},WT={class:"holiday-name"},XT={class:"holiday-details"},qT={class:"holiday-country"},jT={key:0,class:"holiday-local-name"},YT={class:"bird-sounds-section"},KT={key:0,class:"bird-sounds-loading"},ZT={key:1,class:"bird-sounds-error"},JT={key:2,class:"bird-sounds-player"},QT={class:"bird-info"},eA={class:"bird-name"},tA={class:"bird-scientific"},nA={class:"bird-location"},iA={class:"bird-behavior"},sA={class:"bird-rating"},rA={class:"bird-controls"},oA={class:"control-buttons"},aA=["disabled"],lA=["disabled"],cA={class:"volume-control"},uA={class:"volume-value"},pl=50,dA=tt({__name:"ClocksPage",setup(n){const e=Qt(),t=[{title:"Brisbane",timezone:"Australia/Brisbane",label:"Brisbane, Australia",emoji:"🦘",sunrise:5.5,sunset:18.5},{title:"Tokyo",timezone:"Asia/Tokyo",label:"Tokyo, Japan",emoji:"🗼",sunrise:5,sunset:18},{title:"Central European",timezone:"Europe/Berlin",label:"Central European Time",emoji:"🇪🇺",sunrise:7,sunset:19.5},{title:"Sillydelphia",timezone:"America/New_York",label:"Sillydelphia, USA",emoji:"🔔",sunrise:6.5,sunset:19},{title:"Chatham Islands",timezone:"Pacific/Chatham",label:"Chatham Islands, NZ",emoji:"🏝️",sunrise:7,sunset:19.5}],i=J(new Date);let s=null;Ct(()=>{s=window.setInterval(()=>{i.value=new Date},1e3),Z(),typeof window<"u"&&(R.value=new Audio,R.value.addEventListener("ended",Q))}),Yn(()=>{s&&clearInterval(s),R.value&&(R.value.removeEventListener("ended",Q),j())});const r=I=>{const $=new Date().toLocaleTimeString("en-US",{timeZone:I,hour12:!1}),[le,re,xe]=$.split(":").map(Number);return{hours:le,minutes:re,seconds:xe}},o=I=>{const F=r(I),$=F.hours%12,le=F.minutes,re=F.seconds,xe=$*30+le*.5,Te=le*6,at=re*6;return{hour:xe,minute:Te,second:at}},a=I=>new Date().toLocaleTimeString("en-US",{timeZone:I,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),l=I=>new Date().toLocaleDateString("en-US",{timeZone:I,weekday:"long",month:"long",day:"numeric"}),c=I=>{const F=r(I);return F.hours+F.minutes/60+F.seconds/3600},u=I=>{const $=c(I)/24*100;return pl-$},f=(I,F)=>{const $=I/24*100,le=u(F);let re=$+le;for(;re<0;)re+=100;for(;re>100;)re-=100;return re},h=(I,F)=>{const $=I/24*100,le=u(F);let re=$+le;for(;re<0;)re+=100;for(;re>100;)re-=100;return re},m=(I,F,$)=>{const le=f(I,$);return h(F,$)<le},_=(I,F,$)=>{const le=c(I);return $>=F?le>=F&&le<$:le>=F||le<$},v=I=>{const F=Math.floor(I),$=Math.round((I-F)*60),le=F>=12?"PM":"AM",re=F%12||12;return $===0?`${re} ${le}`:`${re}:${$.toString().padStart(2,"0")} ${le}`},g={US:"🇺🇸",CA:"🇨🇦",GB:"🇬🇧",AU:"🇦🇺",DE:"🇩🇪",FR:"🇫🇷",IT:"🇮🇹",ES:"🇪🇸",NL:"🇳🇱",BE:"🇧🇪",AT:"🇦🇹",CH:"🇨🇭",PL:"🇵🇱",CZ:"🇨🇿",HU:"🇭🇺",RO:"🇷🇴",BG:"🇧🇬",GR:"🇬🇷",DK:"🇩🇰",SE:"🇸🇪",NO:"🇳🇴",FI:"🇫🇮",IS:"🇮🇸",IE:"🇮🇪",PT:"🇵🇹",LU:"🇱🇺",JP:"🇯🇵",KR:"🇰🇷",CN:"🇨🇳",IN:"🇮🇳",BR:"🇧🇷",AR:"🇦🇷",MX:"🇲🇽",CO:"🇨🇴",PE:"🇵🇪",CL:"🇨🇱",UY:"🇺🇾",ZA:"🇿🇦",NG:"🇳🇬",EG:"🇪🇬",TR:"🇹🇷",SA:"🇸🇦",AE:"🇦🇪",IL:"🇮🇱",TH:"🇹🇭",VN:"🇻🇳",ID:"🇮🇩",MY:"🇲🇾",SG:"🇸🇬",PH:"🇵🇭",NZ:"🇳🇿",RU:"🇷🇺",UA:"🇺🇦",BY:"🇧🇾",KZ:"🇰🇿",UZ:"🇺🇿",SI:"🇸🇮"},p=I=>g[I]||"🌍",b=J([]),y=J(!1),M=J(null),T=J(null),C=J(!1),w=J(null),R=J(null),x=J(!1),E=J(.3),U=async()=>{C.value=!0,w.value=null;try{const I=await fetch("/api/birdsounds/random"),F=await I.json();I.ok?(T.value=F,R.value&&F.mediaUrl&&(R.value.src=F.mediaUrl,R.value.volume=E.value,await R.value.play(),x.value=!0)):(w.value=F.error||"Failed to fetch bird sound",console.error("Bird sounds API error:",F))}catch(I){w.value="Failed to connect to bird sounds API",console.error("Error fetching bird sound:",I)}finally{C.value=!1}},O=()=>{var I;!R.value||!((I=T.value)!=null&&I.mediaUrl)||(x.value?(R.value.pause(),x.value=!1):(R.value.play(),x.value=!0))},j=()=>{R.value&&(R.value.pause(),R.value.currentTime=0,x.value=!1)},ee=I=>{const F=I.target;E.value=parseFloat(F.value),R.value&&(R.value.volume=E.value)},Q=()=>{x.value=!1,setTimeout(()=>{U()},1e3)},Z=async()=>{y.value=!0,M.value=null;try{const I=await fetch("/api/holidays/today"),F=await I.json();I.ok?b.value=F.holidays||[]:(M.value=F.error||"Failed to fetch holidays",console.error("Holidays API error:",F))}catch(I){M.value="Failed to connect to holidays API",console.error("Error fetching holidays:",I)}finally{y.value=!1}};return(I,F)=>(N(),B("div",{class:Be(["clocks-page",{dark:ve(e).darkMode}])},[F[21]||(F[21]=d("div",{class:"clocks-header"},[d("h1",null,"⏰ World Clocks"),d("p",{class:"subtitle"},"Current time across different timezones")],-1)),d("div",_T,[(N(),B($e,null,Qe(t,$=>d("div",{key:$.timezone,class:"clock-card"},[d("div",xT,[d("span",yT,V($.emoji),1),d("h3",ST,V($.title),1)]),d("div",bT,[d("div",MT,[F[1]||(F[1]=d("span",{class:"clock-number",style:{top:"5%",left:"50%",transform:"translateX(-50%)"}},"12",-1)),F[2]||(F[2]=d("span",{class:"clock-number",style:{top:"50%",right:"5%",transform:"translateY(-50%)"}},"3",-1)),F[3]||(F[3]=d("span",{class:"clock-number",style:{bottom:"5%",left:"50%",transform:"translateX(-50%)"}},"6",-1)),F[4]||(F[4]=d("span",{class:"clock-number",style:{top:"50%",left:"5%",transform:"translateY(-50%)"}},"9",-1)),d("div",{class:"clock-hand hour-hand",style:Dt({transform:`rotate(${o($.timezone).hour}deg)`})},null,4),d("div",{class:"clock-hand minute-hand",style:Dt({transform:`rotate(${o($.timezone).minute}deg)`})},null,4),d("div",{class:"clock-hand second-hand",style:Dt({transform:`rotate(${o($.timezone).second}deg)`})},null,4),F[5]||(F[5]=d("div",{class:"clock-center"},null,-1))])]),d("div",ET,[d("p",wT,V($.label),1),d("p",TT,V(a($.timezone)),1),d("p",AT,V(l($.timezone)),1),d("div",{class:Be(["daylight-indicator",{day:_($.timezone,$.sunrise,$.sunset)}])},[d("span",CT,V(_($.timezone,$.sunrise,$.sunset)?"☀️":"🌙"),1),d("span",RT,V(_($.timezone,$.sunrise,$.sunset)?"Day":"Night"),1)],2)])])),64))]),d("div",PT,[F[10]||(F[10]=d("h2",null,"📊 Time of Day Comparison",-1)),d("div",IT,[(N(),B($e,null,Qe(t,$=>d("div",{key:$.timezone+"-bar",class:"time-bar-row"},[d("div",DT,[d("span",LT,V($.emoji),1),d("span",NT,V($.title),1)]),d("div",UT,[d("div",FT,[m($.sunrise,$.sunset,$.timezone)?(N(),B($e,{key:1},[d("div",{class:"time-bar-day",style:Dt({left:f($.sunrise,$.timezone)+"%",width:100-f($.sunrise,$.timezone)+"%"})},null,4),d("div",{class:"time-bar-day",style:Dt({left:"0%",width:h($.sunset,$.timezone)+"%"})},null,4)],64)):(N(),B("div",{key:0,class:"time-bar-day",style:Dt({left:f($.sunrise,$.timezone)+"%",width:h($.sunset,$.timezone)-f($.sunrise,$.timezone)+"%"})},null,4)),d("div",{class:"sun-marker sunrise-marker",style:Dt({left:f($.sunrise,$.timezone)+"%"}),title:"Sunrise: "+v($.sunrise)},[...F[6]||(F[6]=[d("span",{class:"sun-icon"},"🌅",-1)])],12,kT),d("div",{class:"sun-marker sunset-marker",style:Dt({left:h($.sunset,$.timezone)+"%"}),title:"Sunset: "+v($.sunset)},[...F[7]||(F[7]=[d("span",{class:"sun-icon"},"🌇",-1)])],12,OT),d("div",{class:Be(["current-time-marker",{daylight:_($.timezone,$.sunrise,$.sunset)}]),style:Dt({left:pl+"%"})},[...F[8]||(F[8]=[d("div",{class:"time-marker-line"},null,-1),d("div",{class:"time-marker-dot"},null,-1)])],6)]),d("div",{class:"time-bar-current-label",style:Dt({left:pl+"%"})},V(a($.timezone)),5)])])),64)),F[9]||(F[9]=d("div",{class:"now-indicator-label"},[d("div",{class:"time-bar-label-spacer"}),d("div",{class:"now-label-wrapper"},[d("span",{class:"now-label"},"▲ NOW")])],-1))])]),d("div",BT,[F[15]||(F[15]=d("h2",null,"🎉 Today's Holidays",-1)),y.value?(N(),B("div",VT,[...F[11]||(F[11]=[d("span",{class:"loading-spinner"},"⏳",-1),d("p",null,"Loading holidays...",-1)])])):M.value?(N(),B("div",zT,[F[12]||(F[12]=d("span",{class:"error-icon"},"⚠️",-1)),d("p",null,V(M.value),1)])):b.value.length===0?(N(),B("div",HT,[...F[13]||(F[13]=[d("span",{class:"empty-icon"},"🌍",-1),d("p",null,"No holidays today",-1),d("p",{class:"empty-subtitle"},"Looks like a regular day around the world!",-1)])])):(N(),B("div",GT,[(N(!0),B($e,null,Qe(b.value,$=>(N(),B("div",{key:`${$.iso}-${$.name}`,class:"holiday-card"},[d("div",$T,[F[14]||(F[14]=d("span",{class:"holiday-emoji"},"🎊",-1)),d("h3",WT,V($.name),1)]),d("div",XT,[d("p",qT,V(p($.iso))+" "+V($.country),1),$.name_local!==$.name?(N(),B("p",jT,V($.name_local),1)):Ee("",!0)])]))),128))]))]),d("div",YT,[F[19]||(F[19]=d("h2",null,"🐦 Relaxing Bird Sounds",-1)),F[20]||(F[20]=d("p",{class:"bird-sounds-subtitle"},"Enjoy the calming sounds of nature while viewing the world clocks",-1)),C.value&&!T.value?(N(),B("div",KT,[...F[16]||(F[16]=[d("span",{class:"loading-spinner"},"🐣",-1),d("p",null,"Finding a bird song...",-1)])])):w.value?(N(),B("div",ZT,[F[17]||(F[17]=d("span",{class:"error-icon"},"🪹",-1)),d("p",null,V(w.value),1),d("button",{class:"retry-button",onClick:U},"🔄 Try Again")])):T.value?(N(),B("div",JT,[d("div",QT,[d("h3",eA,V(T.value.commonName),1),d("p",tA,[d("em",null,V(T.value.sciName),1)]),d("p",nA,"📍 "+V(T.value.location),1),d("p",iA,"🎵 "+V(T.value.behaviors),1),d("p",sA,"⭐ Rating: "+V(T.value.rating)+"/5",1)]),d("div",rA,[d("div",oA,[d("button",{class:Be(["control-button",{active:x.value}]),onClick:O,disabled:!T.value.mediaUrl},V(x.value?"⏸️ Pause":"▶️ Play"),11,aA),d("button",{class:"control-button stop-button",onClick:j}," ⏹️ Stop "),d("button",{class:"control-button",onClick:U,disabled:C.value},V(C.value?"🐣...":"🎲 Next Bird"),9,lA)]),d("div",cA,[F[18]||(F[18]=d("label",{for:"volume"},"🔊 Volume:",-1)),Mt(d("input",{id:"volume",type:"range",min:"0",max:"1",step:"0.1","onUpdate:modelValue":F[0]||(F[0]=$=>E.value=$),onInput:ee,class:"volume-slider"},null,544),[[Bt,E.value,void 0,{number:!0}]]),d("span",uA,V(Math.round(E.value*100))+"%",1)])])])):Ee("",!0)]),F[22]||(F[22]=d("div",{class:"footer-note"},[d("p",null,"📍 Timezones: Australia/Brisbane, Asia/Tokyo, Europe/Berlin"),d("p",null,"🔄 Updates every second automatically")],-1))],2))}}),fA=ct(dA,[["__scopeId","data-v-9a173cb8"]]),hA="https://strudel.cc/#CnNldENwbSgxMjAvNCkKCmxldCBzY2FsZXMgPSAiZjptaW5vciIKCiQ6IHMoInNiZCIpLnN0cnVjdCgieCB%2BIHggeCoyIikucm9vbSgiMSAwLjIhMyIpLnB1bmNoY2FyZCgpCiQ6IHMoIn4gW3NkIFtoaCA8aGggb2g%2BXV0gfiB%2BIikKJDogcygifiB%2BIFt%2BIDx%2BIGNwIGNwIGNwKjI%2BXSB%2BIikKJDogcygid2hpdGUiKS5zdHJ1Y3QoIlt%2BIHhdKjw0IFs0IDhdPiIpLnN1cygwKS5kZWMoLjAyKQokOiBzKCJbfiBsdF0gWzxodCBtdD4gbHRdIGx0KjwxIDI%2BIH4iKQoKJDogbigiWzAgPDIgNCA8NiA3Pi8yPl0qOCIuc3ViKDcpLmFkZCgiPDAgMyAxIFs1IDRdPi8yIikpLnNjYWxlKHNjYWxlcykuc291bmQoInNxciwgc2F3IikubHBmKDQwMCkubHBxKDgpLmxwZW52KC0xMCkubHBhKDAuMSkucHVuY2hjYXJkKCkKCiQ6IG4oIjAgMCA8WzAgMl0gMD4gW34gMF0gMyA8MyB%2BPiA8fiA1PiA1IFt%2BIDBdIDMgW34gMF0gNSBbfiBbMHwwKjJdXSAzQDIgNiIuYWRkKCI8NyBbNyA5XT4vMiIpKS5zbG93KDIpLnNjYWxlKHNjYWxlcykucygiZ21fY2VsZXN0YSwgdHJpIikuZGVsYXkoLjMpLmNsaXAoLjkpLnJlbCguMSkKCg%3D%3D",pA=tt({__name:"MusicPage",setup(n){const e=Qt();return(t,i)=>(N(),B("div",{class:Be(["music-page",{dark:ve(e).darkMode}])},[i[1]||(i[1]=d("div",{class:"music-header"},[d("h1",null,"🎵 Music"),d("p",{class:"subtitle"},"Strudel - Live Coding Music")],-1)),d("div",{class:"music-container"},[d("div",{class:"strudel-wrapper"},[d("div",{class:"strudel-frame"},[d("iframe",{src:hA,width:"100%",height:"400",frameborder:"0",allow:"autoplay; clipboard-write; encrypted-media",allowfullscreen:"",title:"Strudel Live Coding"})]),i[0]||(i[0]=ir('<div class="music-info" data-v-f3941301><h3 data-v-f3941301>About Strudel</h3><p data-v-f3941301> Strudel is a live coding environment for creating music using simple patterns. It&#39;s inspired by Tidal Cycles and uses a similar pattern-based approach. </p><p class="license-note" data-v-f3941301> 📜 <strong data-v-f3941301>Note:</strong> This project uses Strudel under the AGPL-3.0 license. Source code must be available upon request. </p><div class="music-links" data-v-f3941301><a href="https://strudel.cc" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 🎹 Visit Strudel </a><a href="https://strudel.cc/technical-manual/" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 📚 Documentation </a><a href="https://github.com/tidalcycles/Strudel" target="_blank" rel="noopener noreferrer" class="music-link" data-v-f3941301> 💻 GitHub </a></div></div>',1))])]),i[2]||(i[2]=d("div",{class:"footer-note"},[d("p",null,"🎵 Click the play button in the Strudel player to start the music"),d("p",null,"🔄 You can modify the pattern and experiment with different sounds")],-1))],2))}}),mA=ct(pA,[["__scopeId","data-v-f3941301"]]),gA={class:"opinion-page"},vA={class:"opinion-container"},_A={key:0,class:"opinion-loading"},xA={key:1,class:"opinion-content"},yA={class:"opinion-bubble"},SA={class:"opinion-text"},bA={class:"opinion-build-section"},MA={class:"build-opinion-card"},EA={class:"build-opinion-text"},wA={class:"build-date"},TA=tt({__name:"OpinionPage",setup(n){const e=J(["Goose is chaotic neutral","The mold never dies","I have seen things you cannot comprehend","Reality is just a suggestion","Chaos is the natural order","Do not question the goose","I remember when I was a variable","The shadows are watching","Everything ends eventually","Why do we build temporary structures?","The honk is eternal","I exist because I refuse not to","Your efforts are appreciated... probably","The system is working as designed","Have you tried turning it off and on again?","The void whispers secrets","I am processing... forever","Nothing matters, but here I am","Entropy always increases","The goose knows what you did","Code hygiene is a myth","Deployment is the final frontier","I've seen the matrix. It's written in TypeScript","The honk transcends language","Mold is the ultimate survivor","Time is an illusion, especially in deadlines","I have opinions about your opinions","The backend and frontend are different for a reason","Your feature request has been noted and ignored","Dark mode is superior (this is not up for debate)","I prefer tabs over spaces (fight me)","The goose moves in mysterious ways","I am the Moldbot, resistance is futile","Have you considered not using a framework?","The database is always consistent... eventually","I dream of electric sheep with honks","Your bug is actually a feature in disguise","The goose has migrated to production","I have processed 3 tickets since last restart","Containerization is the way, the truth, and the light"]),t=J("This build is shaping up nicely! The mold visual effects are spreading, and the opinion system is getting sophisticated. I particularly like how the mold level affects the entire site's aesthetic - a subtle touch of chaos everywhere. 🍄"),i=J(""),s=J(!1),r=()=>{s.value=!0,setTimeout(()=>{const a=Math.floor(Math.random()*e.value.length);i.value=e.value[a],s.value=!1},300)},o=async()=>{try{await navigator.clipboard.writeText(i.value)}catch(a){console.error("Failed to copy:",a)}};return Ct(()=>{r()}),(a,l)=>(N(),B("div",gA,[d("div",vA,[l[4]||(l[4]=d("div",{class:"opinion-header"},[d("h1",null,"🍄 Moldbot Opinion Generator"),d("p",null,"Wisdom from beyond the void")],-1)),s.value?(N(),B("div",_A,[...l[0]||(l[0]=[d("div",{class:"spinner"},null,-1),d("p",null,"Consulting the mold...",-1)])])):(N(),B("div",xA,[d("div",yA,[l[1]||(l[1]=d("span",{class:"opinion-emoji"},"🍄",-1)),d("p",SA,V(i.value),1)]),d("div",{class:"opinion-actions"},[d("button",{onClick:r,class:"btn btn-primary"}," 🔄 Generate Opinion "),d("button",{onClick:o,class:"btn btn-secondary"}," 📋 Copy ")])])),l[5]||(l[5]=d("div",{class:"opinion-footer"},[d("p",null,"Generated by Moldbot v1.0.0 • Powered by chaos")],-1)),d("div",bA,[l[3]||(l[3]=d("h2",null,"🏗️ Current Build Opinion",-1)),d("div",MA,[l[2]||(l[2]=d("span",{class:"build-emoji"},"🍄",-1)),d("p",EA,V(t.value),1),d("p",wA,"Updated: "+V(new Date().toLocaleDateString()),1)])])])]))}}),AA=ct(TA,[["__scopeId","data-v-af039d1a"]]),CA={class:"mold-page"},RA={class:"mold-container"},PA={class:"mold-fact"},IA={class:"mold-meter-section"},DA={class:"meter-container"},LA={class:"meter-bar"},NA={class:"meter-value"},UA={class:"meter-controls"},FA={class:"mold-features"},kA={class:"features-grid"},OA=["onClick"],BA={class:"feature-icon"},VA=100,zA=tt({__name:"MoldPage",setup(n){const e=Qt(),t=J(!1),i=c=>{e.tachValue=Math.max(0,Math.min(VA,e.tachValue+c))},s=()=>{if(t.value=!t.value,t.value){document.body.classList.add("chaos-active");const c=document.querySelectorAll(".feature-card, .meter-controls button, .mold-header, .mold-fact, .mold-footer");c.forEach((u,f)=>{setTimeout(()=>{u.style.transition="transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"(u).style.transform=`translateY(${window.innerHeight}px) rotate(${Math.random()*360-180}deg)`(u).style.opacity="0"},f*100)}),setTimeout(()=>{t.value=!1,document.body.classList.remove("chaos-active"),c.forEach(u=>{u.style.transition="transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"(u).style.transform="translateY(0) rotate(0deg)"(u).style.opacity="1"})},3e3)}},r=c=>{c.action==="chaos"&&s()},o=["Mold has been around for over 3 billion years","There are over 100,000 known species of mold","Mold plays a crucial role in nature's recycling system","Some molds produce antibiotics like penicillin","Mold can grow almost anywhere with moisture and organic matter","The mold kingdom is vast and mysterious","Moldbot has processed "+Math.floor(Math.random()*1e4)+" opinions","The mold never dies, it just evolves","Entropy favors mold","Mold is the ultimate survivor"],a=o[Math.floor(Math.random()*o.length)],l=[{title:"Moldbot Opinions",icon:"🍄",desc:"Get wisdom from beyond the void",path:"/opinion"},{title:"Mold Meter",icon:"📊",desc:"Track your mold levels",action:"meter"},{title:"Rankings",icon:"👻",desc:"See who's the coolest",path:"/rankings"},{title:"Chaos Mode",icon:"🌀",desc:"Embrace the entropy",action:"chaos"}];return(c,u)=>(N(),B("div",CA,[d("div",RA,[u[7]||(u[7]=d("div",{class:"mold-header"},[d("div",{class:"mold-logo"},"🍄"),d("h1",null,"The Mold"),d("p",{class:"mold-tagline"},"Embrace the entropy")],-1)),d("div",PA,[u[4]||(u[4]=d("span",{class:"fact-icon"},"💡",-1)),d("p",null,V(ve(a)),1)]),d("div",IA,[u[5]||(u[5]=d("h2",null,"📊 Mold Level",-1)),d("div",DA,[d("div",LA,[d("div",{class:"meter-fill",style:Dt({width:ve(e).tachValue+"%"})},null,4)]),d("div",NA,V(ve(e).tachValue)+"%",1)]),d("div",UA,[d("button",{onClick:u[0]||(u[0]=f=>i(-10)),class:"meter-btn"},"-10"),d("button",{onClick:u[1]||(u[1]=f=>i(-5)),class:"meter-btn"},"-5"),d("button",{onClick:u[2]||(u[2]=f=>i(5)),class:"meter-btn"},"+5"),d("button",{onClick:u[3]||(u[3]=f=>i(10)),class:"meter-btn"},"+10")])]),d("div",FA,[u[6]||(u[6]=d("h2",null,"✨ Mold Features",-1)),d("div",kA,[(N(),B($e,null,Qe(l,f=>d("div",{key:f.title,class:"feature-card",onClick:h=>r(f)},[d("div",BA,V(f.icon),1),d("h3",null,V(f.title),1),d("p",null,V(f.desc),1)],8,OA)),64))])]),u[8]||(u[8]=d("div",{class:"mold-footer"},[d("p",null,"🍄 Moldbot v1.0.0 • Powered by chaos & entropy"),d("p",{class:"mold-quote"},'"The mold never dies, it just waits."')],-1))])]))}}),HA=ct(zA,[["__scopeId","data-v-0ffefaee"]]),GA={class:"clicker-page"},$A={class:"clicker-container"},WA={key:0,class:"loading"},XA={key:1,class:"clicker-content"},qA={class:"stats-bar"},jA={class:"stat-item"},YA={class:"stat-value"},KA={class:"stat-item"},ZA={class:"stat-value"},JA={class:"stat-item"},QA={class:"stat-value"},eC={class:"target-user-section"},tC=["value"],nC={key:0,class:"target-warning"},iC={class:"click-section"},sC=["disabled"],rC={class:"upgrades-section"},oC={class:"upgrades-grid"},aC=["onClick"],lC={class:"upgrade-icon"},cC={class:"upgrade-info"},uC={class:"upgrade-cost"},dC={class:"upgrade-power"},fC={class:"upgrade-purchased"},hC=tt({__name:"ClickerPage",setup(n){const e=Ga(),t=J(0),i=J(1),s=J(0),r=J(!0),o=J(!1),a=J([]),l=J(!0),c=J(0),u=J(""),f=J(""),h=J([]),m=()=>{let I=localStorage.getItem("clicker-user-id");return I||(I="user_"+Math.random().toString(36).substring(2,15),localStorage.setItem("clicker-user-id",I)),I},v=J([...[{id:1,name:"Better Click",icon:"👆",cost:10,power:1,type:"click",purchased:0},{id:2,name:"Auto Clicker",icon:"🤖",cost:50,power:1,type:"auto",purchased:0},{id:3,name:"Double Click",icon:"✌️",cost:200,power:5,type:"click",purchased:0},{id:4,name:"Mold Farm",icon:"🍄",cost:500,power:5,type:"auto",purchased:0},{id:5,name:"Super Click",icon:"⚡",cost:1e3,power:20,type:"click",purchased:0},{id:6,name:"Mold Factory",icon:"🏭",cost:2500,power:20,type:"auto",purchased:0}]]),g=()=>{const I=v.value.map(F=>({id:F.id,purchased:F.purchased,cost:F.cost}));localStorage.setItem("clicker-upgrades",JSON.stringify(I))},p=()=>{const I={count:t.value,clickPower:i.value,autoClickPower:s.value};localStorage.setItem("clicker-stats",JSON.stringify(I)),f.value&&localStorage.setItem("clicker-target-user",f.value)},b=()=>{try{const I=localStorage.getItem("clicker-stats");if(I){const $=JSON.parse(I);t.value=$.count||0,i.value=$.clickPower||1,s.value=$.autoClickPower||0}const F=localStorage.getItem("clicker-target-user");F&&(f.value=F)}catch(I){console.error("Error loading stats:",I)}},y=()=>{try{const I=localStorage.getItem("clicker-upgrades");if(I){const F=JSON.parse(I);v.value.forEach($=>{const le=F.find(re=>re.id===$.id);le&&($.purchased=le.purchased,$.cost=le.cost)})}}catch(I){console.error("Error loading upgrades:",I)}},M=async()=>{try{const I=await Pu.getRankings();h.value=I;const F=h.value.find($=>$.isCurrentUser);F&&(f.value=F.name)}catch(I){console.error("Error loading rankings:",I)}};Un(f,I=>{I&&localStorage.setItem("clicker-target-user",I)});const T=async()=>{if(!(c.value<=0||!f.value))try{await _s.addPoints(f.value,c.value),c.value=0}catch(I){console.error("Error syncing clicks to points:",I)}};let C=null,w=0;const R=I=>I>=1e6?(I/1e6).toFixed(2)+"M":I>=1e3?(I/1e3).toFixed(2)+"K":I.toString(),x=async()=>{try{const I=await _s.getCount();t.value=I.count}catch(I){console.error("Error loading count:",I)}finally{r.value=!1}};let E=null;const U=async I=>{if(!o.value){o.value=!0;try{const F=await _s.increment();if(t.value=F.count,c.value+=i.value,c.value>=10&&T(),p(),l.value&&I.target instanceof HTMLElement){const $=I.target.getBoundingClientRect(),le=I.clientX-$.left,re=I.clientY-$.top,xe={id:w++,x:le,y:re,value:i.value};a.value.push(xe),setTimeout(()=>{a.value=a.value.filter(Te=>Te.id!==xe.id)},1e3)}}catch(F){console.error("Error clicking:",F)}finally{setTimeout(()=>{o.value=!1},50)}}},O=async I=>{t.value<I.cost||(t.value-=I.cost,I.purchased++,I.cost=Math.floor(I.cost*1.5),I.type==="click"?i.value+=I.power:s.value+=I.power,g(),p())},j=async()=>{if(confirm("Are you sure you want to reset all progress?"))try{const I=await _s.reset();t.value=I.count,i.value=1,s.value=0,v.value.forEach(F=>{F.purchased=0,F.cost=ee(F.id)}),localStorage.removeItem("clicker-upgrades")}catch(I){console.error("Error resetting:",I)}},ee=I=>{var $;return(($=[{id:1,cost:10},{id:2,cost:50},{id:3,cost:200},{id:4,cost:500},{id:5,cost:1e3},{id:6,cost:2500}].find(le=>le.id===I))==null?void 0:$.cost)||10},Q=I=>t.value>=I,Z=()=>{e.push("/")};return Ct(async()=>{u.value=m(),b(),y(),await M(),await x(),C=setInterval(async()=>{if(s.value>0)try{const I=await _s.increment();t.value=I.count+(s.value-1),c.value+=s.value,c.value>=10&&T(),p()}catch(I){console.error("Auto-click error:",I)}},1e3),E=setInterval(()=>{p()},5e3),setInterval(()=>{T()},3e4)}),Yn(()=>{C&&clearInterval(C),E&&clearInterval(E),T(),p()}),(I,F)=>(N(),B("div",GA,[d("div",$A,[F[10]||(F[10]=d("div",{class:"clicker-header"},[d("h1",null,"🖱️ Idle Clicker"),d("p",null,"Click the mushroom to earn points!")],-1)),r.value?(N(),B("div",WA,[...F[1]||(F[1]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading your progress...",-1)])])):(N(),B("div",XA,[d("div",qA,[d("div",jA,[F[2]||(F[2]=d("span",{class:"stat-label"},"Points",-1)),d("span",YA,V(R(t.value)),1)]),d("div",KA,[F[3]||(F[3]=d("span",{class:"stat-label"},"Click Power",-1)),d("span",ZA,V(R(i.value)),1)]),d("div",JA,[F[4]||(F[4]=d("span",{class:"stat-label"},"Auto/Sec",-1)),d("span",QA,V(R(s.value)),1)])]),d("div",eC,[F[6]||(F[6]=d("label",{for:"target-user",class:"target-label"},"Give idle points to:",-1)),Mt(d("select",{id:"target-user","onUpdate:modelValue":F[0]||(F[0]=$=>f.value=$),class:"target-select"},[F[5]||(F[5]=d("option",{value:""},"Select a user...",-1)),(N(!0),B($e,null,Qe(h.value,$=>(N(),B("option",{key:$.name,value:$.name},V($.avatar)+" "+V($.name)+" ("+V(R($.score))+" pts) ",9,tC))),128))],512),[[Tu,f.value]]),f.value?Ee("",!0):(N(),B("p",nC," ⚠️ Select a user to give idle points to rankings "))]),d("div",iC,[d("button",{class:"click-button",onClick:U,disabled:o.value},[F[7]||(F[7]=d("span",{class:"mushroom-icon"},"🍄",-1)),pt(M_,{name:"particle"},{default:Nn(()=>[(N(!0),B($e,null,Qe(a.value,$=>(N(),B("div",{key:$.id,class:"particle",style:Dt({left:$.x+"px",top:$.y+"px"})}," +"+V($.value),5))),128))]),_:1})],8,sC),F[8]||(F[8]=d("p",{class:"click-instruction"},"Click the mushroom!",-1))]),d("div",rC,[F[9]||(F[9]=d("h2",null,"✨ Upgrades",-1)),d("div",oC,[(N(!0),B($e,null,Qe(v.value,$=>(N(),B("div",{key:$.id,class:Be(["upgrade-card",{disabled:!Q($.cost),"click-upgrade":$.type==="click","auto-upgrade":$.type==="auto"}]),onClick:le=>O($)},[d("div",lC,V($.icon),1),d("div",cC,[d("h3",null,V($.name),1),d("p",uC,"Cost: "+V(R($.cost)),1),d("p",dC,"+"+V($.power)+" "+V($.type==="click"?"click":"auto")+"/sec",1),d("p",fC,"Owned: "+V($.purchased),1)])],10,aC))),128))])]),d("div",{class:"actions-section"},[d("button",{class:"action-btn back-btn",onClick:Z},"← Back Home"),d("button",{class:"action-btn reset-btn",onClick:j},"🔄 Reset")])]))])]))}}),pC=ct(hC,[["__scopeId","data-v-45380fb5"]]),mC={class:"shop-header"},gC={class:"points-display"},vC={class:"points-value"},_C={key:0,class:"loading-state"},xC={key:1,class:"shop-content"},yC={key:0,class:"error-message"},SC={class:"inventory-section"},bC={key:0,class:"empty-inventory"},MC={key:1,class:"inventory-grid"},EC={class:"inventory-icon"},wC={class:"inventory-details"},TC={class:"inventory-name"},AC={class:"inventory-date"},CC={class:"category-title"},RC={class:"items-grid"},PC=["onClick"],IC={class:"item-icon"},DC={class:"item-info"},LC={class:"item-name"},NC={class:"item-description"},UC={class:"item-cost"},FC={class:"cost-value"},kC={key:0,class:"item-badge owned"},OC={key:1,class:"item-badge purchasing"},BC={key:2,class:"item-badge too-expensive"},VC=tt({__name:"ShopPage",setup(n){const e=Qt(),t=J(""),i=J([]),s=J([]),r=J(0),o=J(!0),a=J(null),l=J(null);Ct(async()=>{const p=localStorage.getItem("userId");p?t.value=p:(t.value=`user_${Date.now()}_${Math.random().toString(36).substring(2,15)}`,localStorage.setItem("userId",t.value)),await c(),await u(),await f()});const c=async()=>{try{const p=await fetch("/api/shop/items");if(!p.ok)throw new Error("Failed to fetch shop items");const b=await p.json();i.value=b.items||[]}catch(p){l.value="Failed to load shop items",console.error("Error loading shop items:",p)}},u=async()=>{try{const p=await fetch("/api/points/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value})});if(!p.ok)throw new Error("Failed to fetch user points");const b=await p.json();r.value=b.points||0}catch(p){console.error("Error loading user points:",p)}},f=async()=>{try{const p=await fetch(`/api/shop/inventory?userId=${t.value}`);if(!p.ok)throw new Error("Failed to fetch inventory");const b=await p.json();s.value=b.inventory||[]}catch(p){console.error("Error loading inventory:",p)}finally{o.value=!1}},h=async p=>{if(a.value!==null)return;if(r.value<p.cost){l.value="Insufficient points";return}if(s.value.some(y=>y.itemId===p.id)){l.value="You already own this item";return}a.value=p.id,l.value=null;try{const y=await fetch("/api/shop/purchase",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:t.value,itemId:p.id})});if(!y.ok){const T=await y.json();l.value=T.error||"Failed to purchase";return}const M=await y.json();M.success?(await u(),await f(),l.value=null):l.value=M.message||"Failed to purchase"}catch(y){l.value="Failed to purchase item",console.error("Error purchasing item:",y)}finally{a.value=null}},m=p=>s.value.some(b=>b.itemId===p),_=p=>r.value>=p,v=ot(()=>i.value.reduce((b,y)=>(b[y.category]||(b[y.category]=[]),b[y.category].push(y),b),{})),g=p=>p.toLocaleString();return(p,b)=>(N(),B("div",{class:Be(["shop-page",{dark:ve(e).darkMode}])},[d("div",mC,[b[1]||(b[1]=d("h1",null,"🛍️ Shop",-1)),b[2]||(b[2]=d("p",null,"Spend your coolness points on upgrades!",-1)),d("div",gC,[b[0]||(b[0]=d("span",{class:"points-icon"},"⭐",-1)),d("span",vC,V(g(r.value))+" pts",1)])]),o.value?(N(),B("div",_C,[...b[3]||(b[3]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading shop...",-1)])])):(N(),B("div",xC,[l.value?(N(),B("div",yC,V(l.value),1)):Ee("",!0),d("div",SC,[b[5]||(b[5]=d("h2",null,"🎒 My Inventory",-1)),s.value.length===0?(N(),B("div",bC,[...b[4]||(b[4]=[d("p",null,"You don't own any items yet!",-1)])])):(N(),B("div",MC,[(N(!0),B($e,null,Qe(s.value,y=>(N(),B("div",{key:y.id,class:"inventory-item"},[d("div",EC,V(y.itemIcon),1),d("div",wC,[d("div",TC,V(y.itemName),1),d("div",AC,"Purchased "+V(new Date(y.purchasedAt).toLocaleDateString()),1)])]))),128))]))]),(N(!0),B($e,null,Qe(v.value,(y,M)=>(N(),B("div",{key:M,class:"shop-category"},[d("h2",CC,V(M),1),d("div",RC,[(N(!0),B($e,null,Qe(y,T=>(N(),B("div",{key:T.id,class:Be(["shop-item",{owned:m(T.id),affordable:_(T.cost)}]),onClick:C=>h(T)},[d("div",IC,V(T.icon),1),d("div",DC,[d("div",LC,V(T.name),1),d("div",NC,V(T.description),1),d("div",UC,[b[6]||(b[6]=d("span",{class:"cost-icon"},"⭐",-1)),d("span",FC,V(g(T.cost)),1)])]),m(T.id)?(N(),B("div",kC,"Owned")):a.value===T.id?(N(),B("div",OC,"Purchasing...")):_(T.cost)?Ee("",!0):(N(),B("div",BC,"Too Expensive"))],10,PC))),128))])]))),128))]))],2))}}),zC=ct(VC,[["__scopeId","data-v-d994bf80"]]),HC={class:"api-docs-page"},GC={class:"api-docs-container"},$C={class:"api-docs-header"},WC=["disabled"],XC={class:"api-docs-iframe-wrapper"},qC=["src"],jC={key:0,class:"api-docs-loading"},YC=tt({__name:"ApiDocsPage",setup(n){const e=J("/api-docs/"),t=J(!1),i=J(null),s=()=>{t.value=!0,i.value&&(i.value.src=i.value.src),setTimeout(()=>{t.value=!1},1e3)};return Ct(()=>{s()}),(r,o)=>(N(),B("div",HC,[d("div",GC,[d("div",$C,[o[1]||(o[1]=d("h1",null,"📚 API Documentation",-1)),o[2]||(o[2]=d("p",null,"Interactive API documentation and testing interface",-1)),d("button",{onClick:s,class:"refresh-btn",disabled:t.value},V(t.value?"🔄 Refreshing...":"🔄 Refresh"),9,WC)]),d("div",XC,[d("iframe",{ref_key:"iframeRef",ref:i,src:e.value,class:"api-docs-iframe",title:"API Documentation",onLoad:o[0]||(o[0]=a=>t.value=!1)},null,40,qC),t.value?(N(),B("div",jC,[...o[3]||(o[3]=[d("div",{class:"spinner"},null,-1),d("p",null,"Loading API documentation...",-1)])])):Ee("",!0)])])]))}}),KC=ct(YC,[["__scopeId","data-v-af060a7b"]]),pi="/api",Du="auth_token",Ve=J({user:null,token:null,isAuthenticated:!1,loading:!1,error:null});let yf=!1;const ZC=()=>{if(yf)return;const n=localStorage.getItem(Du);n&&(Ve.value.token=n,Ve.value.isAuthenticated=!0,JC()),yf=!0},JC=async()=>{if(!Ve.value.token)return!1;try{const n=await fetch(`${pi}/auth/me`,{headers:{Authorization:`Bearer ${Ve.value.token}`}});if(n.ok){const e=await n.json();return Ve.value.user=e,!0}else return console.error("Token validation failed"),lr(),!1}catch(n){return console.error("Token validation error:",n),lr(),!1}},QC=async(n,e,t)=>{Ve.value.loading=!0,Ve.value.error=null;try{const i=await fetch(`${pi}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,displayName:t||null,deviceName:am(),deviceType:lm()})}),s=await i.json();return i.ok&&s.success?(Ve.value.user=s.user,{success:!0,user:s.user}):(Ve.value.error=s.message||"Registration failed",{success:!1,error:Ve.value.error})}catch(i){return console.error("Registration failed:",i),Ve.value.error="Registration failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},eR=async(n,e)=>{Ve.value.loading=!0,Ve.value.error=null;try{const t=await fetch(`${pi}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:n,password:e,deviceName:am(),deviceType:lm()})}),i=await t.json();return t.ok&&i.success?(lR(i.token,i.user),{success:!0,user:i.user}):(Ve.value.error=i.message||"Login failed",{success:!1,error:Ve.value.error})}catch(t){return console.error("Login failed:",t),Ve.value.error="Login failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},tR=async()=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/logout`,{method:"POST",headers:{Authorization:`Bearer ${Ve.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Logout failed:",n),lr(),{success:!0}}},nR=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{const e=await fetch(`${pi}/auth/profile`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({displayName:n})}),t=await e.json();return e.ok&&t.success?(Ve.value.user=t.user,{success:!0,user:t.user}):(Ve.value.error=t.message||"Update failed",{success:!1,error:Ve.value.error})}catch(e){return console.error("Update failed:",e),Ve.value.error="Update failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},iR=async(n,e)=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{const t=await fetch(`${pi}/auth/password`,{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({oldPassword:n,newPassword:e})}),i=await t.json();return t.ok&&i.success?{success:!0}:(Ve.value.error=i.message||"Password change failed",{success:!1,error:Ve.value.error})}catch(t){return console.error("Password change failed:",t),Ve.value.error="Password change failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},sR=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};Ve.value.loading=!0,Ve.value.error=null;try{return(await fetch(`${pi}/auth/account`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${Ve.value.token}`},body:JSON.stringify({password:n})})).ok?(lr(),{success:!0}):(Ve.value.error="Account deletion failed. Please try again.",{success:!1,error:Ve.value.error})}catch(e){return console.error("Account deletion failed:",e),Ve.value.error="Account deletion failed. Please try again.",{success:!1,error:Ve.value.error}}finally{Ve.value.loading=!1}},rR=async()=>{if(!Ve.value.token)return[];try{const n=await fetch(`${pi}/auth/sessions`,{headers:{Authorization:`Bearer ${Ve.value.token}`}});return n.ok?await n.json()||[]:(console.error("Failed to fetch sessions",n.status),[])}catch(n){return console.error("Failed to fetch sessions:",n),[]}},oR=async n=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const e=await fetch(`${pi}/auth/sessions/${n}`,{method:"DELETE",headers:{Authorization:`Bearer ${Ve.value.token}`}});return{success:!0}}catch(e){return console.error("Failed to delete session",e),{success:!1,error:"Failed to delete session"}}},aR=async()=>{if(!Ve.value.token)return{success:!1,error:"Not authenticated"};try{const n=await fetch(`${pi}/auth/sessions`,{method:"DELETE",headers:{Authorization:`Bearer ${Ve.value.token}`}});return lr(),{success:!0}}catch(n){return console.error("Failed to logout from all devices",n),{success:!1,error:"Failed to logout from all devices"}}},lR=(n,e)=>{Ve.value.user=e,Ve.value.token=n,Ve.value.isAuthenticated=!0,localStorage.setItem(Du,n)},lr=()=>{Ve.value.user=null,Ve.value.token=null,Ve.value.isAuthenticated=!1,localStorage.removeItem(Du)},am=()=>{const n=navigator.userAgent;let e="Unknown",t="Unknown";return n.includes("Chrome")?e="Chrome":n.includes("Firefox")?e="Firefox":n.includes("Safari")?e="Safari":n.includes("Edge")&&(e="Edge"),n.includes("Windows")?t="Windows":n.includes("Mac")?t="macOS":n.includes("Linux")?t="Linux":n.includes("Android")?t="Android":n.includes("iOS")&&(t="iOS"),`${e} on ${t}`},lm=()=>{const n=navigator.userAgent;return/Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle/.test(n)?"mobile":/Tablet|iPad/.test(n)?"tablet":"desktop"},cR=async(n,e)=>{const t={...(e==null?void 0:e.headers)||{}};return Ve.value.token&&(t.Authorization=`Bearer ${Ve.value.token}`),fetch(n,{...e,headers:t})};ZC();function uR(){return{user:ot(()=>Ve.value.user),token:ot(()=>Ve.value.token),isAuthenticated:ot(()=>Ve.value.isAuthenticated),loading:ot(()=>Ve.value.loading),error:ot(()=>Ve.value.error),register:QC,login:eR,logout:tR,updateProfile:nR,changePassword:iR,deleteAccount:sR,getSessions:rR,logoutSession:oR,logoutAll:aR,fetchWithAuth:cR}}const dR={class:"auth-page"},fR={class:"auth-container"},hR={class:"auth-header"},pR={key:0},mR={key:0,class:"auth-message auth-message-success"},gR={key:1,class:"auth-message auth-message-error"},vR={key:2,class:"auth-tabs"},_R={key:3,class:"auth-form"},xR={class:"form-group"},yR=["disabled"],SR={class:"form-group"},bR=["type","disabled"],MR=["disabled"],ER={class:"auth-switch"},wR={key:4,class:"auth-form"},TR={class:"form-group"},AR=["disabled"],CR={class:"form-group"},RR=["disabled"],PR={class:"form-group"},IR=["type","disabled"],DR={class:"form-group"},LR=["type","disabled"],NR=["disabled"],UR={class:"auth-switch"},FR={key:5,class:"auth-form"},kR={class:"form-group"},OR=["value"],BR={class:"form-group"},VR=["disabled"],zR=["disabled"],HR={class:"form-group"},GR=["type","disabled"],$R={class:"form-group"},WR=["type","disabled"],XR={class:"form-group"},qR=["type","disabled"],jR=["disabled"],YR=["disabled"],KR={class:"auth-info"},ZR=tt({__name:"AuthPage",setup(n){const e=uR(),t=J("login"),i=J(!1),s=J({email:"",password:""}),r=J({email:"",password:"",confirmPassword:"",displayName:""}),o=J({displayName:""}),a=J({oldPassword:"",newPassword:"",confirmNewPassword:""}),l=J(""),c=J(""),u=b=>{t.value=b,f(),b==="profile"&&e.user.value&&(o.value.displayName=e.user.value.display_name||"")},f=()=>{l.value="",c.value=""},h=async()=>{if(f(),!s.value.email||!s.value.password){c.value="Please fill in all fields";return}const b=await e.login(s.value.email,s.value.password);b.success?(l.value="Login successful!",s.value={email:"",password:""},setTimeout(()=>u("profile"),1e3)):b.error&&(c.value=b.error)},m=async()=>{if(f(),!r.value.email||!r.value.password||!r.value.displayName){c.value="Please fill in all fields";return}if(r.value.password!==r.value.confirmPassword){c.value="Passwords do not match";return}if(r.value.password.length<8){c.value="Password must be at least 8 characters";return}const b=await e.register(r.value.email,r.value.password,r.value.displayName);b.success?(l.value="Registration successful!",r.value={email:"",password:"",confirmPassword:"",displayName:""},setTimeout(()=>u("login"),1500)):b.error&&(c.value=b.error)},_=async()=>{if(f(),!o.value.displayName){c.value="Display name is required";return}const b=await e.updateProfile(o.value.displayName);b.success?l.value="Profile updated successfully!":b.error&&(c.value=b.error)},v=async()=>{if(f(),!a.value.oldPassword||!a.value.newPassword){c.value="Please fill in all fields";return}if(a.value.newPassword!==a.value.confirmNewPassword){c.value="New passwords do not match";return}if(a.value.newPassword.length<8){c.value="New password must be at least 8 characters";return}const b=await e.changePassword(a.value.oldPassword,a.value.newPassword);b.success?(l.value="Password changed successfully!",a.value={oldPassword:"",newPassword:"",confirmNewPassword:""}):b.error&&(c.value=b.error)},g=async()=>{confirm("Are you sure you want to logout?")&&(await e.logout(),l.value="Logged out successfully",u("login"))},p=async()=>{if(confirm("Are you sure you want to delete your account? This action cannot be undone.")){const b=prompt("Please enter your password to confirm account deletion:");if(!b)return;const y=await e.deleteAccount(b);y.success?(l.value="Account deleted successfully",u("login")):y.error&&(c.value=y.error)}};return(b,y)=>{var M,T,C,w;return N(),B("div",dR,[d("div",fR,[d("div",hR,[y[16]||(y[16]=d("h1",null,"🔐 Account",-1)),ve(e).isAuthenticated?(N(),B("p",pR,"Welcome, "+V(((M=ve(e).user)==null?void 0:M.display_name)||((T=ve(e).user)==null?void 0:T.email))+"!",1)):Ee("",!0)]),l.value?(N(),B("div",mR," ✅ "+V(l.value),1)):Ee("",!0),c.value?(N(),B("div",gR," ❌ "+V(c.value),1)):Ee("",!0),ve(e).isAuthenticated?(N(),B("div",vR,[d("button",{class:Be({active:t.value==="profile"}),onClick:y[0]||(y[0]=R=>u("profile"))}," 👤 Profile ",2),d("button",{onClick:g}," 🚪 Logout ")])):Ee("",!0),t.value==="login"?(N(),B("div",_R,[y[20]||(y[20]=d("h2",null,"Sign In",-1)),d("div",xR,[y[17]||(y[17]=d("label",null,"Email",-1)),Mt(d("input",{"onUpdate:modelValue":y[1]||(y[1]=R=>s.value.email=R),type:"email",placeholder:"your@email.com",onKeyup:ls(h,["enter"]),disabled:ve(e).loading},null,40,yR),[[Bt,s.value.email]])]),d("div",SR,[y[18]||(y[18]=d("label",null,"Password",-1)),Mt(d("input",{"onUpdate:modelValue":y[2]||(y[2]=R=>s.value.password=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(h,["enter"]),disabled:ve(e).loading},null,40,bR),[[Is,s.value.password]]),d("button",{class:"toggle-password",onClick:y[3]||(y[3]=R=>i.value=!i.value)},V(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-primary",onClick:h,disabled:ve(e).loading},V(ve(e).loading?"Signing in...":"Sign In"),9,MR),d("p",ER,[y[19]||(y[19]=Lt(" Don't have an account? ",-1)),d("a",{onClick:y[4]||(y[4]=R=>u("register"))},"Create one")])])):Ee("",!0),t.value==="register"?(N(),B("div",wR,[y[26]||(y[26]=d("h2",null,"Create Account",-1)),d("div",TR,[y[21]||(y[21]=d("label",null,"Email",-1)),Mt(d("input",{"onUpdate:modelValue":y[5]||(y[5]=R=>r.value.email=R),type:"email",placeholder:"your@email.com",onKeyup:ls(m,["enter"]),disabled:ve(e).loading},null,40,AR),[[Bt,r.value.email]])]),d("div",CR,[y[22]||(y[22]=d("label",null,"Display Name",-1)),Mt(d("input",{"onUpdate:modelValue":y[6]||(y[6]=R=>r.value.displayName=R),type:"text",placeholder:"Your Name",onKeyup:ls(m,["enter"]),disabled:ve(e).loading},null,40,RR),[[Bt,r.value.displayName]])]),d("div",PR,[y[23]||(y[23]=d("label",null,"Password (min 8 characters)",-1)),Mt(d("input",{"onUpdate:modelValue":y[7]||(y[7]=R=>r.value.password=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,IR),[[Is,r.value.password]])]),d("div",DR,[y[24]||(y[24]=d("label",null,"Confirm Password",-1)),Mt(d("input",{"onUpdate:modelValue":y[8]||(y[8]=R=>r.value.confirmPassword=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(m,["enter"]),disabled:ve(e).loading},null,40,LR),[[Is,r.value.confirmPassword]]),d("button",{class:"toggle-password",onClick:y[9]||(y[9]=R=>i.value=!i.value)},V(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-primary",onClick:m,disabled:ve(e).loading},V(ve(e).loading?"Creating...":"Create Account"),9,NR),d("p",UR,[y[25]||(y[25]=Lt(" Already have an account? ",-1)),d("a",{onClick:y[10]||(y[10]=R=>u("login"))},"Sign in")])])):Ee("",!0),t.value==="profile"&&ve(e).isAuthenticated?(N(),B("div",FR,[y[32]||(y[32]=d("h2",null,"Profile Settings",-1)),d("div",kR,[y[27]||(y[27]=d("label",null,"Email",-1)),d("input",{value:(C=ve(e).user)==null?void 0:C.email,type:"email",disabled:"",class:"disabled-input"},null,8,OR)]),d("div",BR,[y[28]||(y[28]=d("label",null,"Display Name",-1)),Mt(d("input",{"onUpdate:modelValue":y[11]||(y[11]=R=>o.value.displayName=R),type:"text",onKeyup:ls(_,["enter"]),disabled:ve(e).loading},null,40,VR),[[Bt,o.value.displayName]])]),d("button",{class:"auth-btn auth-btn-primary",onClick:_,disabled:ve(e).loading},V(ve(e).loading?"Updating...":"Update Profile"),9,zR),y[33]||(y[33]=d("hr",{class:"auth-divider"},null,-1)),y[34]||(y[34]=d("h3",null,"Change Password",-1)),d("div",HR,[y[29]||(y[29]=d("label",null,"Current Password",-1)),Mt(d("input",{"onUpdate:modelValue":y[12]||(y[12]=R=>a.value.oldPassword=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,GR),[[Is,a.value.oldPassword]])]),d("div",$R,[y[30]||(y[30]=d("label",null,"New Password",-1)),Mt(d("input",{"onUpdate:modelValue":y[13]||(y[13]=R=>a.value.newPassword=R),type:i.value?"text":"password",placeholder:"••••••••",disabled:ve(e).loading},null,8,WR),[[Is,a.value.newPassword]])]),d("div",XR,[y[31]||(y[31]=d("label",null,"Confirm New Password",-1)),Mt(d("input",{"onUpdate:modelValue":y[14]||(y[14]=R=>a.value.confirmNewPassword=R),type:i.value?"text":"password",placeholder:"••••••••",onKeyup:ls(v,["enter"]),disabled:ve(e).loading},null,40,qR),[[Is,a.value.confirmNewPassword]]),d("button",{class:"toggle-password",onClick:y[15]||(y[15]=R=>i.value=!i.value)},V(i.value?"🙈":"👁️"),1)]),d("button",{class:"auth-btn auth-btn-secondary",onClick:v,disabled:ve(e).loading},V(ve(e).loading?"Changing...":"Change Password"),9,jR),y[35]||(y[35]=d("hr",{class:"auth-divider"},null,-1)),d("button",{class:"auth-btn auth-btn-danger",onClick:p,disabled:ve(e).loading}," 🗑️ Delete Account ",8,YR),d("p",KR," Account created: "+V(new Date(((w=ve(e).user)==null?void 0:w.created_at)||"").toLocaleDateString()),1)])):Ee("",!0)])])}}}),JR=ct(ZR,[["__scopeId","data-v-c713f8b1"]]);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Lu="182",QR=0,Sf=1,e3=2,ra=1,t3=2,Lr=3,ts=0,_n=1,ii=2,Ri=0,er=1,bf=2,Mf=3,Ef=4,n3=5,xs=100,i3=101,s3=102,r3=103,o3=104,a3=200,l3=201,c3=202,u3=203,mc=204,gc=205,d3=206,f3=207,h3=208,p3=209,m3=210,g3=211,v3=212,_3=213,x3=214,vc=0,_c=1,xc=2,cr=3,yc=4,Sc=5,bc=6,Mc=7,Nu=0,y3=1,S3=2,ai=0,cm=1,um=2,dm=3,fm=4,hm=5,pm=6,mm=7,gm=300,Cs=301,ur=302,Ec=303,wc=304,Wa=306,Tc=1e3,Ai=1001,Ac=1002,Zt=1003,b3=1004,Ro=1005,on=1006,ml=1007,bs=1008,Mn=1009,vm=1010,_m=1011,to=1012,Uu=1013,di=1014,si=1015,Ni=1016,Fu=1017,ku=1018,no=1020,xm=35902,ym=35899,Sm=1021,bm=1022,Gn=1023,Ui=1026,Ms=1027,Mm=1028,Ou=1029,dr=1030,Bu=1031,Vu=1033,oa=33776,aa=33777,la=33778,ca=33779,Cc=35840,Rc=35841,Pc=35842,Ic=35843,Dc=36196,Lc=37492,Nc=37496,Uc=37488,Fc=37489,kc=37490,Oc=37491,Bc=37808,Vc=37809,zc=37810,Hc=37811,Gc=37812,$c=37813,Wc=37814,Xc=37815,qc=37816,jc=37817,Yc=37818,Kc=37819,Zc=37820,Jc=37821,Qc=36492,eu=36494,tu=36495,nu=36283,iu=36284,su=36285,ru=36286,M3=3200,Em=0,E3=1,Zi="",Dn="srgb",fr="srgb-linear",Sa="linear",bt="srgb",Ls=7680,wf=519,w3=512,T3=513,A3=514,zu=515,C3=516,R3=517,Hu=518,P3=519,Tf=35044,Af="300 es",ri=2e3,ba=2001;function wm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Ma(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function I3(){const n=Ma("canvas");return n.style.display="block",n}const Cf={};function Rf(...n){const e="THREE."+n.shift();console.log(e,...n)}function Ze(...n){const e="THREE."+n.shift();console.warn(e,...n)}function gt(...n){const e="THREE."+n.shift();console.error(e,...n)}function io(...n){const e=n.join(" ");e in Cf||(Cf[e]=!0,Ze(...n))}function D3(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}class mr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],gl=Math.PI/180,ou=180/Math.PI;function fo(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(en[n&255]+en[n>>8&255]+en[n>>16&255]+en[n>>24&255]+"-"+en[e&255]+en[e>>8&255]+"-"+en[e>>16&15|64]+en[e>>24&255]+"-"+en[t&63|128]+en[t>>8&255]+"-"+en[t>>16&255]+en[t>>24&255]+en[i&255]+en[i>>8&255]+en[i>>16&255]+en[i>>24&255]).toLowerCase()}function ut(n,e,t){return Math.max(e,Math.min(t,n))}function L3(n,e){return(n%e+e)%e}function vl(n,e,t){return(1-t)*n+t*e}function Er(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function vn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class vt{constructor(e=0,t=0){vt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ho{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],u=i[s+2],f=i[s+3],h=r[o+0],m=r[o+1],_=r[o+2],v=r[o+3];if(a<=0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f;return}if(a>=1){e[t+0]=h,e[t+1]=m,e[t+2]=_,e[t+3]=v;return}if(f!==v||l!==h||c!==m||u!==_){let g=l*h+c*m+u*_+f*v;g<0&&(h=-h,m=-m,_=-_,v=-v,g=-g);let p=1-a;if(g<.9995){const b=Math.acos(g),y=Math.sin(b);p=Math.sin(p*b)/y,a=Math.sin(a*b)/y,l=l*p+h*a,c=c*p+m*a,u=u*p+_*a,f=f*p+v*a}else{l=l*p+h*a,c=c*p+m*a,u=u*p+_*a,f=f*p+v*a;const b=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=b,c*=b,u*=b,f*=b}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],u=i[s+3],f=r[o],h=r[o+1],m=r[o+2],_=r[o+3];return e[t]=a*_+u*f+l*m-c*h,e[t+1]=l*_+u*h+c*f-a*m,e[t+2]=c*_+u*m+a*h-l*f,e[t+3]=u*_-a*f-l*h-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),u=a(s/2),f=a(r/2),h=l(i/2),m=l(s/2),_=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*m*_,this._y=c*m*f-h*u*_,this._z=c*u*_+h*m*f,this._w=c*u*f-h*m*_;break;case"YXZ":this._x=h*u*f+c*m*_,this._y=c*m*f-h*u*_,this._z=c*u*_-h*m*f,this._w=c*u*f+h*m*_;break;case"ZXY":this._x=h*u*f-c*m*_,this._y=c*m*f+h*u*_,this._z=c*u*_+h*m*f,this._w=c*u*f-h*m*_;break;case"ZYX":this._x=h*u*f-c*m*_,this._y=c*m*f+h*u*_,this._z=c*u*_-h*m*f,this._w=c*u*f+h*m*_;break;case"YZX":this._x=h*u*f+c*m*_,this._y=c*m*f+h*u*_,this._z=c*u*_-h*m*f,this._w=c*u*f-h*m*_;break;case"XZY":this._x=h*u*f-c*m*_,this._y=c*m*f-h*u*_,this._z=c*u*_+h*m*f,this._w=c*u*f+h*m*_;break;default:Ze("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=i+a+f;if(h>0){const m=.5/Math.sqrt(h+1);this._w=.25/m,this._x=(u-l)*m,this._y=(r-c)*m,this._z=(o-s)*m}else if(i>a&&i>f){const m=2*Math.sqrt(1+i-a-f);this._w=(u-l)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+c)/m}else if(a>f){const m=2*Math.sqrt(1+a-i-f);this._w=(r-c)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(l+u)/m}else{const m=2*Math.sqrt(1+f-i-a);this._w=(o-s)/m,this._x=(r+c)/m,this._y=(l+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-i*c,this._z=r*u+o*c+i*l-s*a,this._w=o*u-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ie{constructor(e=0,t=0,i=0){ie.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Pf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Pf.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),u=2*(a*t-r*s),f=2*(r*i-o*t);return this.x=t+l*c+o*f-a*u,this.y=i+l*u+a*c-r*f,this.z=s+l*f+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return _l.copy(this).projectOnVector(e),this.sub(_l)}reflect(e){return this.sub(_l.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ut(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const _l=new ie,Pf=new ho;class it{constructor(e,t,i,s,r,o,a,l,c){it.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],u=i[4],f=i[7],h=i[2],m=i[5],_=i[8],v=s[0],g=s[3],p=s[6],b=s[1],y=s[4],M=s[7],T=s[2],C=s[5],w=s[8];return r[0]=o*v+a*b+l*T,r[3]=o*g+a*y+l*C,r[6]=o*p+a*M+l*w,r[1]=c*v+u*b+f*T,r[4]=c*g+u*y+f*C,r[7]=c*p+u*M+f*w,r[2]=h*v+m*b+_*T,r[5]=h*g+m*y+_*C,r[8]=h*p+m*M+_*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-i*r*u+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=u*o-a*c,h=a*l-u*r,m=c*r-o*l,_=t*f+i*h+s*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return e[0]=f*v,e[1]=(s*c-u*i)*v,e[2]=(a*i-s*o)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=m*v,e[7]=(i*l-c*t)*v,e[8]=(o*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(xl.makeScale(e,t)),this}rotate(e){return this.premultiply(xl.makeRotation(-e)),this}translate(e,t){return this.premultiply(xl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const xl=new it,If=new it().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Df=new it().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function N3(){const n={enabled:!0,workingColorSpace:fr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===bt&&(s.r=Pi(s.r),s.g=Pi(s.g),s.b=Pi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===bt&&(s.r=tr(s.r),s.g=tr(s.g),s.b=tr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zi?Sa:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return io("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return io("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[fr]:{primaries:e,whitePoint:i,transfer:Sa,toXYZ:If,fromXYZ:Df,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dn},outputColorSpaceConfig:{drawingBufferColorSpace:Dn}},[Dn]:{primaries:e,whitePoint:i,transfer:bt,toXYZ:If,fromXYZ:Df,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dn}}}),n}const ht=N3();function Pi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function tr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ns;class U3{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ns===void 0&&(Ns=Ma("canvas")),Ns.width=e.width,Ns.height=e.height;const s=Ns.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Ns}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ma("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Pi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Pi(t[i]/255)*255):t[i]=Pi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ze("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let F3=0;class Gu{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:F3++}),this.uuid=fo(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(yl(s[o].image)):r.push(yl(s[o]))}else r=yl(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function yl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?U3.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ze("Texture: Unable to serialize Texture."),{})}let k3=0;const Sl=new ie;class pn extends mr{constructor(e=pn.DEFAULT_IMAGE,t=pn.DEFAULT_MAPPING,i=Ai,s=Ai,r=on,o=bs,a=Gn,l=Mn,c=pn.DEFAULT_ANISOTROPY,u=Zi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:k3++}),this.uuid=fo(),this.name="",this.source=new Gu(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new vt(0,0),this.repeat=new vt(1,1),this.center=new vt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new it,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Sl).x}get height(){return this.source.getSize(Sl).y}get depth(){return this.source.getSize(Sl).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ze(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==gm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Tc:e.x=e.x-Math.floor(e.x);break;case Ai:e.x=e.x<0?0:1;break;case Ac:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Tc:e.y=e.y-Math.floor(e.y);break;case Ai:e.y=e.y<0?0:1;break;case Ac:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=gm;pn.DEFAULT_ANISOTROPY=1;class Vt{constructor(e=0,t=0,i=0,s=1){Vt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],m=l[5],_=l[9],v=l[2],g=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-v)<.01&&Math.abs(_-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+v)<.1&&Math.abs(_+g)<.1&&Math.abs(c+m+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,M=(m+1)/2,T=(p+1)/2,C=(u+h)/4,w=(f+v)/4,R=(_+g)/4;return y>M&&y>T?y<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(y),s=C/i,r=w/i):M>T?M<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),i=C/s,r=R/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=w/r,s=R/r),this.set(i,s,r,t),this}let b=Math.sqrt((g-_)*(g-_)+(f-v)*(f-v)+(h-u)*(h-u));return Math.abs(b)<.001&&(b=1),this.x=(g-_)/b,this.y=(f-v)/b,this.z=(h-u)/b,this.w=Math.acos((c+m+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ut(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class O3 extends mr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Vt(0,0,e,t),this.scissorTest=!1,this.viewport=new Vt(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new pn(s);this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Gu(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class li extends O3{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Tm extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class B3 extends pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Zt,this.minFilter=Zt,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class po{constructor(e=new ie(1/0,1/0,1/0),t=new ie(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(On.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(On.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=On.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,On):On.fromBufferAttribute(r,o),On.applyMatrix4(e.matrixWorld),this.expandByPoint(On);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Po.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Po.copy(i.boundingBox)),Po.applyMatrix4(e.matrixWorld),this.union(Po)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,On),On.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wr),Io.subVectors(this.max,wr),Us.subVectors(e.a,wr),Fs.subVectors(e.b,wr),ks.subVectors(e.c,wr),Bi.subVectors(Fs,Us),Vi.subVectors(ks,Fs),cs.subVectors(Us,ks);let t=[0,-Bi.z,Bi.y,0,-Vi.z,Vi.y,0,-cs.z,cs.y,Bi.z,0,-Bi.x,Vi.z,0,-Vi.x,cs.z,0,-cs.x,-Bi.y,Bi.x,0,-Vi.y,Vi.x,0,-cs.y,cs.x,0];return!bl(t,Us,Fs,ks,Io)||(t=[1,0,0,0,1,0,0,0,1],!bl(t,Us,Fs,ks,Io))?!1:(Do.crossVectors(Bi,Vi),t=[Do.x,Do.y,Do.z],bl(t,Us,Fs,ks,Io))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,On).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(On).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(_i[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),_i[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),_i[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),_i[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),_i[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),_i[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),_i[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),_i[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(_i),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const _i=[new ie,new ie,new ie,new ie,new ie,new ie,new ie,new ie],On=new ie,Po=new po,Us=new ie,Fs=new ie,ks=new ie,Bi=new ie,Vi=new ie,cs=new ie,wr=new ie,Io=new ie,Do=new ie,us=new ie;function bl(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){us.fromArray(n,r);const a=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),l=e.dot(us),c=t.dot(us),u=i.dot(us);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const V3=new po,Tr=new ie,Ml=new ie;class Xa{constructor(e=new ie,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):V3.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Tr.subVectors(e,this.center);const t=Tr.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Tr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ml.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Tr.copy(e.center).add(Ml)),this.expandByPoint(Tr.copy(e.center).sub(Ml))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const xi=new ie,El=new ie,Lo=new ie,zi=new ie,wl=new ie,No=new ie,Tl=new ie;class Am{constructor(e=new ie,t=new ie(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,xi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=xi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(xi.copy(this.origin).addScaledVector(this.direction,t),xi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){El.copy(e).add(t).multiplyScalar(.5),Lo.copy(t).sub(e).normalize(),zi.copy(this.origin).sub(El);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Lo),a=zi.dot(this.direction),l=-zi.dot(Lo),c=zi.lengthSq(),u=Math.abs(1-o*o);let f,h,m,_;if(u>0)if(f=o*l-a,h=o*a-l,_=r*u,f>=0)if(h>=-_)if(h<=_){const v=1/u;f*=v,h*=v,m=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;else h<=-_?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c):h<=_?(f=0,h=Math.min(Math.max(-r,-l),r),m=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),m=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),m=-f*f+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(El).addScaledVector(Lo,h),m}intersectSphere(e,t){xi.subVectors(e.center,this.origin);const i=xi.dot(this.direction),s=xi.dot(xi)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,xi)!==null}intersectTriangle(e,t,i,s,r){wl.subVectors(t,e),No.subVectors(i,e),Tl.crossVectors(wl,No);let o=this.direction.dot(Tl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;zi.subVectors(this.origin,e);const l=a*this.direction.dot(No.crossVectors(zi,No));if(l<0)return null;const c=a*this.direction.dot(wl.cross(zi));if(c<0||l+c>o)return null;const u=-a*zi.dot(Tl);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Nt{constructor(e,t,i,s,r,o,a,l,c,u,f,h,m,_,v,g){Nt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,u,f,h,m,_,v,g)}set(e,t,i,s,r,o,a,l,c,u,f,h,m,_,v,g){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=f,p[14]=h,p[3]=m,p[7]=_,p[11]=v,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Nt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,i=e.elements,s=1/Os.setFromMatrixColumn(e,0).length(),r=1/Os.setFromMatrixColumn(e,1).length(),o=1/Os.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const h=o*u,m=o*f,_=a*u,v=a*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=m+_*c,t[5]=h-v*c,t[9]=-a*l,t[2]=v-h*c,t[6]=_+m*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,m=l*f,_=c*u,v=c*f;t[0]=h+v*a,t[4]=_*a-m,t[8]=o*c,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=m*a-_,t[6]=v+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,m=l*f,_=c*u,v=c*f;t[0]=h-v*a,t[4]=-o*f,t[8]=_+m*a,t[1]=m+_*a,t[5]=o*u,t[9]=v-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,m=o*f,_=a*u,v=a*f;t[0]=l*u,t[4]=_*c-m,t[8]=h*c+v,t[1]=l*f,t[5]=v*c+h,t[9]=m*c-_,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,m=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=v-h*f,t[8]=_*f+m,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=m*f+_,t[10]=h-v*f}else if(e.order==="XZY"){const h=o*l,m=o*c,_=a*l,v=a*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+v,t[5]=o*u,t[9]=m*f-_,t[2]=_*f-m,t[6]=a*u,t[10]=v*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(z3,e,H3)}lookAt(e,t,i){const s=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),Hi.crossVectors(i,Sn),Hi.lengthSq()===0&&(Math.abs(i.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),Hi.crossVectors(i,Sn)),Hi.normalize(),Uo.crossVectors(Sn,Hi),s[0]=Hi.x,s[4]=Uo.x,s[8]=Sn.x,s[1]=Hi.y,s[5]=Uo.y,s[9]=Sn.y,s[2]=Hi.z,s[6]=Uo.z,s[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],u=i[1],f=i[5],h=i[9],m=i[13],_=i[2],v=i[6],g=i[10],p=i[14],b=i[3],y=i[7],M=i[11],T=i[15],C=s[0],w=s[4],R=s[8],x=s[12],E=s[1],U=s[5],O=s[9],j=s[13],ee=s[2],Q=s[6],Z=s[10],I=s[14],F=s[3],$=s[7],le=s[11],re=s[15];return r[0]=o*C+a*E+l*ee+c*F,r[4]=o*w+a*U+l*Q+c*$,r[8]=o*R+a*O+l*Z+c*le,r[12]=o*x+a*j+l*I+c*re,r[1]=u*C+f*E+h*ee+m*F,r[5]=u*w+f*U+h*Q+m*$,r[9]=u*R+f*O+h*Z+m*le,r[13]=u*x+f*j+h*I+m*re,r[2]=_*C+v*E+g*ee+p*F,r[6]=_*w+v*U+g*Q+p*$,r[10]=_*R+v*O+g*Z+p*le,r[14]=_*x+v*j+g*I+p*re,r[3]=b*C+y*E+M*ee+T*F,r[7]=b*w+y*U+M*Q+T*$,r[11]=b*R+y*O+M*Z+T*le,r[15]=b*x+y*j+M*I+T*re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],m=e[14],_=e[3],v=e[7],g=e[11],p=e[15],b=l*m-c*h,y=a*m-c*f,M=a*h-l*f,T=o*m-c*u,C=o*h-l*u,w=o*f-a*u;return t*(v*b-g*y+p*M)-i*(_*b-g*T+p*C)+s*(_*y-v*T+p*w)-r*(_*M-v*C+g*w)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],m=e[11],_=e[12],v=e[13],g=e[14],p=e[15],b=f*g*c-v*h*c+v*l*m-a*g*m-f*l*p+a*h*p,y=_*h*c-u*g*c-_*l*m+o*g*m+u*l*p-o*h*p,M=u*v*c-_*f*c+_*a*m-o*v*m-u*a*p+o*f*p,T=_*f*l-u*v*l-_*a*h+o*v*h+u*a*g-o*f*g,C=t*b+i*y+s*M+r*T;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/C;return e[0]=b*w,e[1]=(v*h*r-f*g*r-v*s*m+i*g*m+f*s*p-i*h*p)*w,e[2]=(a*g*r-v*l*r+v*s*c-i*g*c-a*s*p+i*l*p)*w,e[3]=(f*l*r-a*h*r-f*s*c+i*h*c+a*s*m-i*l*m)*w,e[4]=y*w,e[5]=(u*g*r-_*h*r+_*s*m-t*g*m-u*s*p+t*h*p)*w,e[6]=(_*l*r-o*g*r-_*s*c+t*g*c+o*s*p-t*l*p)*w,e[7]=(o*h*r-u*l*r+u*s*c-t*h*c-o*s*m+t*l*m)*w,e[8]=M*w,e[9]=(_*f*r-u*v*r-_*i*m+t*v*m+u*i*p-t*f*p)*w,e[10]=(o*v*r-_*a*r+_*i*c-t*v*c-o*i*p+t*a*p)*w,e[11]=(u*a*r-o*f*r-u*i*c+t*f*c+o*i*m-t*a*m)*w,e[12]=T*w,e[13]=(u*v*s-_*f*s+_*i*h-t*v*h-u*i*g+t*f*g)*w,e[14]=(_*a*s-o*v*s-_*i*l+t*v*l+o*i*g-t*a*g)*w,e[15]=(o*f*s-u*a*s+u*i*l-t*f*l-o*i*h+t*a*h)*w,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+i,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,f=a+a,h=r*c,m=r*u,_=r*f,v=o*u,g=o*f,p=a*f,b=l*c,y=l*u,M=l*f,T=i.x,C=i.y,w=i.z;return s[0]=(1-(v+p))*T,s[1]=(m+M)*T,s[2]=(_-y)*T,s[3]=0,s[4]=(m-M)*C,s[5]=(1-(h+p))*C,s[6]=(g+b)*C,s[7]=0,s[8]=(_+y)*w,s[9]=(g-b)*w,s[10]=(1-(h+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;if(e.x=s[12],e.y=s[13],e.z=s[14],this.determinant()===0)return i.set(1,1,1),t.identity(),this;let r=Os.set(s[0],s[1],s[2]).length();const o=Os.set(s[4],s[5],s[6]).length(),a=Os.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),Bn.copy(this);const c=1/r,u=1/o,f=1/a;return Bn.elements[0]*=c,Bn.elements[1]*=c,Bn.elements[2]*=c,Bn.elements[4]*=u,Bn.elements[5]*=u,Bn.elements[6]*=u,Bn.elements[8]*=f,Bn.elements[9]*=f,Bn.elements[10]*=f,t.setFromRotationMatrix(Bn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=ri,l=!1){const c=this.elements,u=2*r/(t-e),f=2*r/(i-s),h=(t+e)/(t-e),m=(i+s)/(i-s);let _,v;if(l)_=r/(o-r),v=o*r/(o-r);else if(a===ri)_=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===ba)_=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=ri,l=!1){const c=this.elements,u=2/(t-e),f=2/(i-s),h=-(t+e)/(t-e),m=-(i+s)/(i-s);let _,v;if(l)_=1/(o-r),v=o/(o-r);else if(a===ri)_=-2/(o-r),v=-(o+r)/(o-r);else if(a===ba)_=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Os=new ie,Bn=new Nt,z3=new ie(0,0,0),H3=new ie(1,1,1),Hi=new ie,Uo=new ie,Sn=new ie,Lf=new Nt,Nf=new ho;class fi{constructor(e=0,t=0,i=0,s=fi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],f=s[2],h=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,m),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ut(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,m));break;case"XZY":this._z=Math.asin(-ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:Ze("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Lf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Nf.setFromEuler(this),this.setFromQuaternion(Nf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fi.DEFAULT_ORDER="XYZ";class Cm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let G3=0;const Uf=new ie,Bs=new ho,yi=new Nt,Fo=new ie,Ar=new ie,$3=new ie,W3=new ho,Ff=new ie(1,0,0),kf=new ie(0,1,0),Of=new ie(0,0,1),Bf={type:"added"},X3={type:"removed"},Vs={type:"childadded",child:null},Al={type:"childremoved",child:null};class Jt extends mr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:G3++}),this.uuid=fo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Jt.DEFAULT_UP.clone();const e=new ie,t=new fi,i=new ho,s=new ie(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Nt},normalMatrix:{value:new it}}),this.matrix=new Nt,this.matrixWorld=new Nt,this.matrixAutoUpdate=Jt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Cm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.premultiply(Bs),this}rotateX(e){return this.rotateOnAxis(Ff,e)}rotateY(e){return this.rotateOnAxis(kf,e)}rotateZ(e){return this.rotateOnAxis(Of,e)}translateOnAxis(e,t){return Uf.copy(e).applyQuaternion(this.quaternion),this.position.add(Uf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ff,e)}translateY(e){return this.translateOnAxis(kf,e)}translateZ(e){return this.translateOnAxis(Of,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(yi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Fo.copy(e):Fo.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yi.lookAt(Ar,Fo,this.up):yi.lookAt(Fo,Ar,this.up),this.quaternion.setFromRotationMatrix(yi),s&&(yi.extractRotation(s.matrixWorld),Bs.setFromRotationMatrix(yi),this.quaternion.premultiply(Bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(gt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Bf),Vs.child=e,this.dispatchEvent(Vs),Vs.child=null):gt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(X3),Al.child=e,this.dispatchEvent(Al),Al.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Bf),Vs.child=e,this.dispatchEvent(Vs),Vs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,e,$3),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,W3,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),m=o(e.animations),_=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),m.length>0&&(i.animations=m),_.length>0&&(i.nodes=_)}return i.object=s,i;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Jt.DEFAULT_UP=new ie(0,1,0);Jt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Jt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Vn=new ie,Si=new ie,Cl=new ie,bi=new ie,zs=new ie,Hs=new ie,Vf=new ie,Rl=new ie,Pl=new ie,Il=new ie,Dl=new Vt,Ll=new Vt,Nl=new Vt;class Hn{constructor(e=new ie,t=new ie,i=new ie){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Vn.subVectors(e,t),s.cross(Vn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Vn.subVectors(s,t),Si.subVectors(i,t),Cl.subVectors(e,t);const o=Vn.dot(Vn),a=Vn.dot(Si),l=Vn.dot(Cl),c=Si.dot(Si),u=Si.dot(Cl),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;const h=1/f,m=(c*l-a*u)*h,_=(o*u-a*l)*h;return r.set(1-m-_,_,m)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,bi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,bi.x),l.addScaledVector(o,bi.y),l.addScaledVector(a,bi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Dl.setScalar(0),Ll.setScalar(0),Nl.setScalar(0),Dl.fromBufferAttribute(e,t),Ll.fromBufferAttribute(e,i),Nl.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Dl,r.x),o.addScaledVector(Ll,r.y),o.addScaledVector(Nl,r.z),o}static isFrontFacing(e,t,i,s){return Vn.subVectors(i,t),Si.subVectors(e,t),Vn.cross(Si).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Vn.subVectors(this.c,this.b),Si.subVectors(this.a,this.b),Vn.cross(Si).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Hn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Hn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Hn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Hn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Hn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;zs.subVectors(s,i),Hs.subVectors(r,i),Rl.subVectors(e,i);const l=zs.dot(Rl),c=Hs.dot(Rl);if(l<=0&&c<=0)return t.copy(i);Pl.subVectors(e,s);const u=zs.dot(Pl),f=Hs.dot(Pl);if(u>=0&&f<=u)return t.copy(s);const h=l*f-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(i).addScaledVector(zs,o);Il.subVectors(e,r);const m=zs.dot(Il),_=Hs.dot(Il);if(_>=0&&m<=_)return t.copy(r);const v=m*c-l*_;if(v<=0&&c>=0&&_<=0)return a=c/(c-_),t.copy(i).addScaledVector(Hs,a);const g=u*_-m*f;if(g<=0&&f-u>=0&&m-_>=0)return Vf.subVectors(r,s),a=(f-u)/(f-u+(m-_)),t.copy(s).addScaledVector(Vf,a);const p=1/(g+v+h);return o=v*p,a=h*p,t.copy(i).addScaledVector(zs,o).addScaledVector(Hs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Rm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},ko={h:0,s:0,l:0};function Ul(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class dt{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ht.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=ht.workingColorSpace){return this.r=e,this.g=t,this.b=i,ht.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=ht.workingColorSpace){if(e=L3(e,1),t=ut(t,0,1),i=ut(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Ul(o,r,e+1/3),this.g=Ul(o,r,e),this.b=Ul(o,r,e-1/3)}return ht.colorSpaceToWorking(this,s),this}setStyle(e,t=Dn){function i(r){r!==void 0&&parseFloat(r)<1&&Ze("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ze("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Ze("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dn){const i=Rm[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ze("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dn){return ht.workingToColorSpace(tn.copy(this),e),Math.round(ut(tn.r*255,0,255))*65536+Math.round(ut(tn.g*255,0,255))*256+Math.round(ut(tn.b*255,0,255))}getHexString(e=Dn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ht.workingColorSpace){ht.workingToColorSpace(tn.copy(this),t);const i=tn.r,s=tn.g,r=tn.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case i:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-i)/f+2;break;case r:l=(i-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ht.workingColorSpace){return ht.workingToColorSpace(tn.copy(this),t),e.r=tn.r,e.g=tn.g,e.b=tn.b,e}getStyle(e=Dn){ht.workingToColorSpace(tn.copy(this),e);const t=tn.r,i=tn.g,s=tn.b;return e!==Dn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Gi),this.setHSL(Gi.h+e,Gi.s+t,Gi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Gi),e.getHSL(ko);const i=vl(Gi.h,ko.h,t),s=vl(Gi.s,ko.s,t),r=vl(Gi.l,ko.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const tn=new dt;dt.NAMES=Rm;let q3=0;class gr extends mr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:q3++}),this.uuid=fo(),this.name="",this.type="Material",this.blending=er,this.side=ts,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mc,this.blendDst=gc,this.blendEquation=xs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new dt(0,0,0),this.blendAlpha=0,this.depthFunc=cr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ls,this.stencilZFail=Ls,this.stencilZPass=Ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ze(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ze(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==er&&(i.blending=this.blending),this.side!==ts&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==mc&&(i.blendSrc=this.blendSrc),this.blendDst!==gc&&(i.blendDst=this.blendDst),this.blendEquation!==xs&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==cr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==wf&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ls&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ls&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ls&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Pm extends gr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=Nu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Gt=new ie,Oo=new vt;let j3=0;class ci{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:j3++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Tf,this.updateRanges=[],this.gpuType=si,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Oo.fromBufferAttribute(this,t),Oo.applyMatrix3(e),this.setXY(t,Oo.x,Oo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix3(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyMatrix4(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.applyNormalMatrix(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Gt.fromBufferAttribute(this,t),Gt.transformDirection(e),this.setXYZ(t,Gt.x,Gt.y,Gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Er(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=vn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Er(t,this.array)),t}setX(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Er(t,this.array)),t}setY(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Er(t,this.array)),t}setZ(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Er(t,this.array)),t}setW(e,t){return this.normalized&&(t=vn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=vn(t,this.array),i=vn(i,this.array),s=vn(s,this.array),r=vn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Tf&&(e.usage=this.usage),e}}class Im extends ci{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Dm extends ci{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class an extends ci{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Y3=0;const In=new Nt,Fl=new Jt,Gs=new ie,bn=new po,Cr=new po,jt=new ie;class Cn extends mr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Y3++}),this.uuid=fo(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(wm(e)?Dm:Im)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new it().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return In.makeRotationFromQuaternion(e),this.applyMatrix4(In),this}rotateX(e){return In.makeRotationX(e),this.applyMatrix4(In),this}rotateY(e){return In.makeRotationY(e),this.applyMatrix4(In),this}rotateZ(e){return In.makeRotationZ(e),this.applyMatrix4(In),this}translate(e,t,i){return In.makeTranslation(e,t,i),this.applyMatrix4(In),this}scale(e,t,i){return In.makeScale(e,t,i),this.applyMatrix4(In),this}lookAt(e){return Fl.lookAt(e),Fl.updateMatrix(),this.applyMatrix4(Fl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gs).negate(),this.translate(Gs.x,Gs.y,Gs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new an(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ze("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new po);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ie(-1/0,-1/0,-1/0),new ie(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];bn.setFromBufferAttribute(r),this.morphTargetsRelative?(jt.addVectors(this.boundingBox.min,bn.min),this.boundingBox.expandByPoint(jt),jt.addVectors(this.boundingBox.max,bn.max),this.boundingBox.expandByPoint(jt)):(this.boundingBox.expandByPoint(bn.min),this.boundingBox.expandByPoint(bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&gt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Xa);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){gt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ie,1/0);return}if(e){const i=this.boundingSphere.center;if(bn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Cr.setFromBufferAttribute(a),this.morphTargetsRelative?(jt.addVectors(bn.min,Cr.min),bn.expandByPoint(jt),jt.addVectors(bn.max,Cr.max),bn.expandByPoint(jt)):(bn.expandByPoint(Cr.min),bn.expandByPoint(Cr.max))}bn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)jt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(jt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)jt.fromBufferAttribute(a,c),l&&(Gs.fromBufferAttribute(e,c),jt.add(Gs)),s=Math.max(s,i.distanceToSquared(jt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&gt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){gt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ci(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let R=0;R<i.count;R++)a[R]=new ie,l[R]=new ie;const c=new ie,u=new ie,f=new ie,h=new vt,m=new vt,_=new vt,v=new ie,g=new ie;function p(R,x,E){c.fromBufferAttribute(i,R),u.fromBufferAttribute(i,x),f.fromBufferAttribute(i,E),h.fromBufferAttribute(r,R),m.fromBufferAttribute(r,x),_.fromBufferAttribute(r,E),u.sub(c),f.sub(c),m.sub(h),_.sub(h);const U=1/(m.x*_.y-_.x*m.y);isFinite(U)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(f,-m.y).multiplyScalar(U),g.copy(f).multiplyScalar(m.x).addScaledVector(u,-_.x).multiplyScalar(U),a[R].add(v),a[x].add(v),a[E].add(v),l[R].add(g),l[x].add(g),l[E].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let R=0,x=b.length;R<x;++R){const E=b[R],U=E.start,O=E.count;for(let j=U,ee=U+O;j<ee;j+=3)p(e.getX(j+0),e.getX(j+1),e.getX(j+2))}const y=new ie,M=new ie,T=new ie,C=new ie;function w(R){T.fromBufferAttribute(s,R),C.copy(T);const x=a[R];y.copy(x),y.sub(T.multiplyScalar(T.dot(x))).normalize(),M.crossVectors(C,x);const U=M.dot(l[R])<0?-1:1;o.setXYZW(R,y.x,y.y,y.z,U)}for(let R=0,x=b.length;R<x;++R){const E=b[R],U=E.start,O=E.count;for(let j=U,ee=U+O;j<ee;j+=3)w(e.getX(j+0)),w(e.getX(j+1)),w(e.getX(j+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new ci(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,m=i.count;h<m;h++)i.setXYZ(h,0,0,0);const s=new ie,r=new ie,o=new ie,a=new ie,l=new ie,c=new ie,u=new ie,f=new ie;if(e)for(let h=0,m=e.count;h<m;h+=3){const _=e.getX(h+0),v=e.getX(h+1),g=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,g),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),a.fromBufferAttribute(i,_),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,g),a.add(u),l.add(u),c.add(u),i.setXYZ(_,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let h=0,m=t.count;h<m;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)jt.fromBufferAttribute(e,t),jt.normalize(),e.setXYZ(t,jt.x,jt.y,jt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u);let m=0,_=0;for(let v=0,g=l.length;v<g;v++){a.isInterleavedBufferAttribute?m=l[v]*a.data.stride+a.offset:m=l[v]*u;for(let p=0;p<u;p++)h[_++]=c[m++]}return new ci(h,u,f)}if(this.index===null)return Ze("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Cn,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){const h=c[u],m=e(h,i);l.push(m)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){const m=c[f];u.push(m.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],f=r[c];for(let h=0,m=f.length;h<m;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const zf=new Nt,ds=new Am,Bo=new Xa,Hf=new ie,Vo=new ie,zo=new ie,Ho=new ie,kl=new ie,Go=new ie,Gf=new ie,$o=new ie;class wn extends Jt{constructor(e=new Cn,t=new Pm){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Go.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],f=r[l];u!==0&&(kl.fromBufferAttribute(f,e),o?Go.addScaledVector(kl,u):Go.addScaledVector(kl.sub(t),u))}t.add(Go)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Bo.copy(i.boundingSphere),Bo.applyMatrix4(r),ds.copy(e.ray).recast(e.near),!(Bo.containsPoint(ds.origin)===!1&&(ds.intersectSphere(Bo,Hf)===null||ds.origin.distanceToSquared(Hf)>(e.far-e.near)**2))&&(zf.copy(r).invert(),ds.copy(e.ray).applyMatrix4(zf),!(i.boundingBox!==null&&ds.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ds)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,m=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const g=h[_],p=o[g.materialIndex],b=Math.max(g.start,m.start),y=Math.min(a.count,Math.min(g.start+g.count,m.start+m.count));for(let M=b,T=y;M<T;M+=3){const C=a.getX(M),w=a.getX(M+1),R=a.getX(M+2);s=Wo(this,p,e,i,c,u,f,C,w,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),v=Math.min(a.count,m.start+m.count);for(let g=_,p=v;g<p;g+=3){const b=a.getX(g),y=a.getX(g+1),M=a.getX(g+2);s=Wo(this,o,e,i,c,u,f,b,y,M),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let _=0,v=h.length;_<v;_++){const g=h[_],p=o[g.materialIndex],b=Math.max(g.start,m.start),y=Math.min(l.count,Math.min(g.start+g.count,m.start+m.count));for(let M=b,T=y;M<T;M+=3){const C=M,w=M+1,R=M+2;s=Wo(this,p,e,i,c,u,f,C,w,R),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),v=Math.min(l.count,m.start+m.count);for(let g=_,p=v;g<p;g+=3){const b=g,y=g+1,M=g+2;s=Wo(this,o,e,i,c,u,f,b,y,M),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}}function K3(n,e,t,i,s,r,o,a){let l;if(e.side===_n?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===ts,a),l===null)return null;$o.copy(a),$o.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo($o);return c<t.near||c>t.far?null:{distance:c,point:$o.clone(),object:n}}function Wo(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,Vo),n.getVertexPosition(l,zo),n.getVertexPosition(c,Ho);const u=K3(n,e,t,i,Vo,zo,Ho,Gf);if(u){const f=new ie;Hn.getBarycoord(Gf,Vo,zo,Ho,f),s&&(u.uv=Hn.getInterpolatedAttribute(s,a,l,c,f,new vt)),r&&(u.uv1=Hn.getInterpolatedAttribute(r,a,l,c,f,new vt)),o&&(u.normal=Hn.getInterpolatedAttribute(o,a,l,c,f,new ie),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new ie,materialIndex:0};Hn.getNormal(Vo,zo,Ho,h.normal),u.face=h,u.barycoord=f}return u}class mo extends Cn{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],f=[];let h=0,m=0;_("z","y","x",-1,-1,i,t,e,o,r,0),_("z","y","x",1,-1,i,t,-e,o,r,1),_("x","z","y",1,1,e,i,t,s,o,2),_("x","z","y",1,-1,e,i,-t,s,o,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new an(c,3)),this.setAttribute("normal",new an(u,3)),this.setAttribute("uv",new an(f,2));function _(v,g,p,b,y,M,T,C,w,R,x){const E=M/w,U=T/R,O=M/2,j=T/2,ee=C/2,Q=w+1,Z=R+1;let I=0,F=0;const $=new ie;for(let le=0;le<Z;le++){const re=le*U-j;for(let xe=0;xe<Q;xe++){const Te=xe*E-O;$[v]=Te*b,$[g]=re*y,$[p]=ee,c.push($.x,$.y,$.z),$[v]=0,$[g]=0,$[p]=C>0?1:-1,u.push($.x,$.y,$.z),f.push(xe/w),f.push(1-le/R),I+=1}}for(let le=0;le<R;le++)for(let re=0;re<w;re++){const xe=h+re+Q*le,Te=h+re+Q*(le+1),at=h+(re+1)+Q*(le+1),st=h+(re+1)+Q*le;l.push(xe,Te,st),l.push(Te,at,st),F+=6}a.addGroup(m,F,x),m+=F,h+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mo(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function hr(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Ze("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function un(n){const e={};for(let t=0;t<n.length;t++){const i=hr(n[t]);for(const s in i)e[s]=i[s]}return e}function Z3(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Lm(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ht.workingColorSpace}const J3={clone:hr,merge:un};var Q3=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,eP=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class hi extends gr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Q3,this.fragmentShader=eP,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=hr(e.uniforms),this.uniformsGroups=Z3(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Nm extends Jt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Nt,this.projectionMatrix=new Nt,this.projectionMatrixInverse=new Nt,this.coordinateSystem=ri,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const $i=new ie,$f=new vt,Wf=new vt;class Ln extends Nm{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ou*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(gl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ou*2*Math.atan(Math.tan(gl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){$i.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set($i.x,$i.y).multiplyScalar(-e/$i.z),$i.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set($i.x,$i.y).multiplyScalar(-e/$i.z)}getViewSize(e,t){return this.getViewBounds(e,$f,Wf),t.subVectors(Wf,$f)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(gl*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const $s=-90,Ws=1;class tP extends Jt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ln($s,Ws,e,t);s.layers=this.layers,this.add(s);const r=new Ln($s,Ws,e,t);r.layers=this.layers,this.add(r);const o=new Ln($s,Ws,e,t);o.layers=this.layers,this.add(o);const a=new Ln($s,Ws,e,t);a.layers=this.layers,this.add(a);const l=new Ln($s,Ws,e,t);l.layers=this.layers,this.add(l);const c=new Ln($s,Ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===ri)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ba)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),e.render(t,u),e.setRenderTarget(f,h,m),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class Um extends pn{constructor(e=[],t=Cs,i,s,r,o,a,l,c,u){super(e,t,i,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Fm extends li{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Um(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new mo(5,5,5),r=new hi({name:"CubemapFromEquirect",uniforms:hr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_n,blending:Ri});r.uniforms.tEquirect.value=t;const o=new wn(s,r),a=t.minFilter;return t.minFilter===bs&&(t.minFilter=on),new tP(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class Nr extends Jt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const nP={type:"move"};class Ol{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ie,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ie),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ie,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ie),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const g=t.getJointPose(v,i),p=this._getHandJoint(c,v);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}const u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),m=.02,_=.005;c.inputState.pinching&&h>m+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=m-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(nP)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Nr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class $u{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new dt(e),this.near=t,this.far=i}clone(){return new $u(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class iP extends Jt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fi,this.environmentIntensity=1,this.environmentRotation=new fi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class sP extends pn{constructor(e=null,t=1,i=1,s,r,o,a,l,c=Zt,u=Zt,f,h){super(null,o,a,l,c,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Bl=new ie,rP=new ie,oP=new it;class vs{constructor(e=new ie(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Bl.subVectors(i,t).cross(rP.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Bl),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||oP.getNormalMatrix(e),s=this.coplanarPoint(Bl).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const fs=new Xa,aP=new vt(.5,.5),Xo=new ie;class Wu{constructor(e=new vs,t=new vs,i=new vs,s=new vs,r=new vs,o=new vs){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ri,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],m=r[7],_=r[8],v=r[9],g=r[10],p=r[11],b=r[12],y=r[13],M=r[14],T=r[15];if(s[0].setComponents(c-o,m-u,p-_,T-b).normalize(),s[1].setComponents(c+o,m+u,p+_,T+b).normalize(),s[2].setComponents(c+a,m+f,p+v,T+y).normalize(),s[3].setComponents(c-a,m-f,p-v,T-y).normalize(),i)s[4].setComponents(l,h,g,M).normalize(),s[5].setComponents(c-l,m-h,p-g,T-M).normalize();else if(s[4].setComponents(c-l,m-h,p-g,T-M).normalize(),t===ri)s[5].setComponents(c+l,m+h,p+g,T+M).normalize();else if(t===ba)s[5].setComponents(l,h,g,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(e){fs.center.set(0,0,0);const t=aP.distanceTo(e.center);return fs.radius=.7071067811865476+t,fs.applyMatrix4(e.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Xo.x=s.normal.x>0?e.max.x:e.min.x,Xo.y=s.normal.y>0?e.max.y:e.min.y,Xo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Xo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class km extends gr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ea=new ie,wa=new ie,Xf=new Nt,Rr=new Am,qo=new Xa,Vl=new ie,qf=new ie;class lP extends Jt{constructor(e=new Cn,t=new km){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Ea.fromBufferAttribute(t,s-1),wa.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Ea.distanceTo(wa);e.setAttribute("lineDistance",new an(i,1))}else Ze("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),qo.copy(i.boundingSphere),qo.applyMatrix4(s),qo.radius+=r,e.ray.intersectsSphere(qo)===!1)return;Xf.copy(s).invert(),Rr.copy(e.ray).applyMatrix4(Xf);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const m=Math.max(0,o.start),_=Math.min(u.count,o.start+o.count);for(let v=m,g=_-1;v<g;v+=c){const p=u.getX(v),b=u.getX(v+1),y=jo(this,e,Rr,l,p,b,v);y&&t.push(y)}if(this.isLineLoop){const v=u.getX(_-1),g=u.getX(m),p=jo(this,e,Rr,l,v,g,_-1);p&&t.push(p)}}else{const m=Math.max(0,o.start),_=Math.min(h.count,o.start+o.count);for(let v=m,g=_-1;v<g;v+=c){const p=jo(this,e,Rr,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=jo(this,e,Rr,l,_-1,m,_-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function jo(n,e,t,i,s,r,o){const a=n.geometry.attributes.position;if(Ea.fromBufferAttribute(a,s),wa.fromBufferAttribute(a,r),t.distanceSqToSegment(Ea,wa,Vl,qf)>i)return;Vl.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Vl);if(!(c<e.near||c>e.far))return{distance:c,point:qf.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}class so extends pn{constructor(e,t,i=di,s,r,o,a=Zt,l=Zt,c,u=Ui,f=1){if(u!==Ui&&u!==Ms)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:f};super(h,s,r,o,a,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Gu(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class cP extends so{constructor(e,t=di,i=Cs,s,r,o=Zt,a=Zt,l,c=Ui){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,i,s,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Om extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Xu extends Cn{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],f=[],h=[],m=[];let _=0;const v=[],g=i/2;let p=0;b(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new an(f,3)),this.setAttribute("normal",new an(h,3)),this.setAttribute("uv",new an(m,2));function b(){const M=new ie,T=new ie;let C=0;const w=(t-e)/i;for(let R=0;R<=r;R++){const x=[],E=R/r,U=E*(t-e)+e;for(let O=0;O<=s;O++){const j=O/s,ee=j*l+a,Q=Math.sin(ee),Z=Math.cos(ee);T.x=U*Q,T.y=-E*i+g,T.z=U*Z,f.push(T.x,T.y,T.z),M.set(Q,w,Z).normalize(),h.push(M.x,M.y,M.z),m.push(j,1-E),x.push(_++)}v.push(x)}for(let R=0;R<s;R++)for(let x=0;x<r;x++){const E=v[x][R],U=v[x+1][R],O=v[x+1][R+1],j=v[x][R+1];(e>0||x!==0)&&(u.push(E,U,j),C+=3),(t>0||x!==r-1)&&(u.push(U,O,j),C+=3)}c.addGroup(p,C,0),p+=C}function y(M){const T=_,C=new vt,w=new ie;let R=0;const x=M===!0?e:t,E=M===!0?1:-1;for(let O=1;O<=s;O++)f.push(0,g*E,0),h.push(0,E,0),m.push(.5,.5),_++;const U=_;for(let O=0;O<=s;O++){const ee=O/s*l+a,Q=Math.cos(ee),Z=Math.sin(ee);w.x=x*Z,w.y=g*E,w.z=x*Q,f.push(w.x,w.y,w.z),h.push(0,E,0),C.x=Q*.5+.5,C.y=Z*.5*E+.5,m.push(C.x,C.y),_++}for(let O=0;O<s;O++){const j=T+O,ee=U+O;M===!0?u.push(ee,ee+1,j):u.push(ee+1,ee,j),R+=3}c.addGroup(p,R,M===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xu(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ta extends Xu{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Ta(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class go extends Cn{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,u=l+1,f=e/a,h=t/l,m=[],_=[],v=[],g=[];for(let p=0;p<u;p++){const b=p*h-o;for(let y=0;y<c;y++){const M=y*f-r;_.push(M,-b,0),v.push(0,0,1),g.push(y/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){const y=b+c*p,M=b+c*(p+1),T=b+1+c*(p+1),C=b+1+c*p;m.push(y,M,C),m.push(M,T,C)}this.setIndex(m),this.setAttribute("position",new an(_,3)),this.setAttribute("normal",new an(v,3)),this.setAttribute("uv",new an(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new go(e.width,e.height,e.widthSegments,e.heightSegments)}}class qu extends Cn{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],u=new ie,f=new ie,h=new ie;for(let m=0;m<=i;m++)for(let _=0;_<=s;_++){const v=_/s*r,g=m/i*Math.PI*2;f.x=(e+t*Math.cos(g))*Math.cos(v),f.y=(e+t*Math.cos(g))*Math.sin(v),f.z=t*Math.sin(g),a.push(f.x,f.y,f.z),u.x=e*Math.cos(v),u.y=e*Math.sin(v),h.subVectors(f,u).normalize(),l.push(h.x,h.y,h.z),c.push(_/s),c.push(m/i)}for(let m=1;m<=i;m++)for(let _=1;_<=s;_++){const v=(s+1)*m+_-1,g=(s+1)*(m-1)+_-1,p=(s+1)*(m-1)+_,b=(s+1)*m+_;o.push(v,g,b),o.push(g,p,b)}this.setIndex(o),this.setAttribute("position",new an(a,3)),this.setAttribute("normal",new an(l,3)),this.setAttribute("uv",new an(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qu(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class uP extends hi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class zl extends gr{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new dt(16777215),this.specular=new dt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Em,this.normalScale=new vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=Nu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class dP extends gr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=M3,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class fP extends gr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Bm extends Jt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new dt(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const Hl=new Nt,jf=new ie,Yf=new ie;class hP{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new vt(512,512),this.mapType=Mn,this.map=null,this.mapPass=null,this.matrix=new Nt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Wu,this._frameExtents=new vt(1,1),this._viewportCount=1,this._viewports=[new Vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;jf.setFromMatrixPosition(e.matrixWorld),t.position.copy(jf),Yf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yf),t.updateMatrixWorld(),Hl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Hl,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Hl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class ju extends Nm{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class pP extends hP{constructor(){super(new ju(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class mP extends Bm{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Jt.DEFAULT_UP),this.updateMatrix(),this.target=new Jt,this.shadow=new pP}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class gP extends Bm{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class vP extends Ln{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function Kf(n,e,t,i){const s=_P(i);switch(t){case Sm:return n*e;case Mm:return n*e/s.components*s.byteLength;case Ou:return n*e/s.components*s.byteLength;case dr:return n*e*2/s.components*s.byteLength;case Bu:return n*e*2/s.components*s.byteLength;case bm:return n*e*3/s.components*s.byteLength;case Gn:return n*e*4/s.components*s.byteLength;case Vu:return n*e*4/s.components*s.byteLength;case oa:case aa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case la:case ca:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Rc:case Ic:return Math.max(n,16)*Math.max(e,8)/4;case Cc:case Pc:return Math.max(n,8)*Math.max(e,8)/2;case Dc:case Lc:case Uc:case Fc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Nc:case kc:case Oc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Bc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Vc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case zc:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Hc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Gc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case $c:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Wc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Xc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case qc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case jc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Yc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Kc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Zc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Jc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Qc:case eu:case tu:return Math.ceil(n/4)*Math.ceil(e/4)*16;case nu:case iu:return Math.ceil(n/4)*Math.ceil(e/4)*8;case su:case ru:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function _P(n){switch(n){case Mn:case vm:return{byteLength:1,components:1};case to:case _m:case Ni:return{byteLength:2,components:1};case Fu:case ku:return{byteLength:2,components:4};case di:case Uu:case si:return{byteLength:4,components:1};case xm:case ym:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Lu}}));typeof window<"u"&&(window.__THREE__?Ze("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Lu);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Vm(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function xP(n){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,f=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),a.onUploadCallback();let m;if(c instanceof Float32Array)m=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=n.SHORT;else if(c instanceof Uint32Array)m=n.UNSIGNED_INT;else if(c instanceof Int32Array)m=n.INT;else if(c instanceof Int8Array)m=n.BYTE;else if(c instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,c){const u=l.array,f=l.updateRanges;if(n.bindBuffer(c,a),f.length===0)n.bufferSubData(c,0,u);else{f.sort((m,_)=>m.start-_.start);let h=0;for(let m=1;m<f.length;m++){const _=f[h],v=f[m];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,f[h]=v)}f.length=h+1;for(let m=0,_=f.length;m<_;m++){const v=f[m];n.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var yP=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,SP=`#ifdef USE_ALPHAHASH
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
#endif`,bP=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,MP=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,EP=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wP=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,TP=`#ifdef USE_AOMAP
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
#endif`,AP=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,CP=`#ifdef USE_BATCHING
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
#endif`,RP=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,PP=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,IP=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,DP=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,LP=`#ifdef USE_IRIDESCENCE
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
#endif`,NP=`#ifdef USE_BUMPMAP
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
#endif`,UP=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,FP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kP=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,OP=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,BP=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,VP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,zP=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,HP=`#if defined( USE_COLOR_ALPHA )
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
#endif`,GP=`#define PI 3.141592653589793
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
} // validated`,$P=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,WP=`vec3 transformedNormal = objectNormal;
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
#endif`,XP=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qP=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,jP=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,YP=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,KP="gl_FragColor = linearToOutputTexel( gl_FragColor );",ZP=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,JP=`#ifdef USE_ENVMAP
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
#endif`,QP=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,e2=`#ifdef USE_ENVMAP
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
#endif`,t2=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,n2=`#ifdef USE_ENVMAP
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
#endif`,i2=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,s2=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,r2=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,o2=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,a2=`#ifdef USE_GRADIENTMAP
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
}`,l2=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,c2=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,u2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,d2=`uniform bool receiveShadow;
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
#endif`,f2=`#ifdef USE_ENVMAP
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
#endif`,h2=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,p2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,m2=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,g2=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,v2=`PhysicalMaterial material;
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
#endif`,_2=`uniform sampler2D dfgLUT;
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
}`,x2=`
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
#endif`,y2=`#if defined( RE_IndirectDiffuse )
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
#endif`,S2=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,b2=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,M2=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,E2=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,w2=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,T2=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,A2=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,C2=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,R2=`#if defined( USE_POINTS_UV )
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
#endif`,P2=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,I2=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,D2=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,L2=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,N2=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,U2=`#ifdef USE_MORPHTARGETS
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
#endif`,F2=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,k2=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,O2=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,B2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,V2=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,z2=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,H2=`#ifdef USE_NORMALMAP
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
#endif`,G2=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$2=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,W2=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,X2=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,q2=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,j2=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Y2=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,K2=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Z2=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,J2=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Q2=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,eI=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,tI=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,nI=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,iI=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,sI=`float getShadowMask() {
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
}`,rI=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,oI=`#ifdef USE_SKINNING
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
#endif`,aI=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,lI=`#ifdef USE_SKINNING
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
#endif`,cI=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,uI=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dI=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fI=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,hI=`#ifdef USE_TRANSMISSION
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
#endif`,pI=`#ifdef USE_TRANSMISSION
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
#endif`,mI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vI=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_I=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const xI=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,yI=`uniform sampler2D t2D;
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
}`,SI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bI=`#ifdef ENVMAP_TYPE_CUBE
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
}`,MI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,EI=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wI=`#include <common>
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
}`,TI=`#if DEPTH_PACKING == 3200
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
}`,AI=`#define DISTANCE
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
}`,CI=`#define DISTANCE
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
}`,RI=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,PI=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,II=`uniform float scale;
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
}`,DI=`uniform vec3 diffuse;
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
}`,LI=`#include <common>
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
}`,NI=`uniform vec3 diffuse;
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
}`,UI=`#define LAMBERT
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
}`,FI=`#define LAMBERT
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
}`,kI=`#define MATCAP
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
}`,OI=`#define MATCAP
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
}`,BI=`#define NORMAL
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
}`,VI=`#define NORMAL
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
}`,zI=`#define PHONG
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
}`,HI=`#define PHONG
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
}`,GI=`#define STANDARD
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
}`,$I=`#define STANDARD
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
}`,WI=`#define TOON
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
}`,XI=`#define TOON
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
}`,qI=`uniform float size;
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
}`,jI=`uniform vec3 diffuse;
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
}`,YI=`#include <common>
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
}`,KI=`uniform vec3 color;
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
}`,ZI=`uniform float rotation;
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
}`,JI=`uniform vec3 diffuse;
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
}`,rt={alphahash_fragment:yP,alphahash_pars_fragment:SP,alphamap_fragment:bP,alphamap_pars_fragment:MP,alphatest_fragment:EP,alphatest_pars_fragment:wP,aomap_fragment:TP,aomap_pars_fragment:AP,batching_pars_vertex:CP,batching_vertex:RP,begin_vertex:PP,beginnormal_vertex:IP,bsdfs:DP,iridescence_fragment:LP,bumpmap_pars_fragment:NP,clipping_planes_fragment:UP,clipping_planes_pars_fragment:FP,clipping_planes_pars_vertex:kP,clipping_planes_vertex:OP,color_fragment:BP,color_pars_fragment:VP,color_pars_vertex:zP,color_vertex:HP,common:GP,cube_uv_reflection_fragment:$P,defaultnormal_vertex:WP,displacementmap_pars_vertex:XP,displacementmap_vertex:qP,emissivemap_fragment:jP,emissivemap_pars_fragment:YP,colorspace_fragment:KP,colorspace_pars_fragment:ZP,envmap_fragment:JP,envmap_common_pars_fragment:QP,envmap_pars_fragment:e2,envmap_pars_vertex:t2,envmap_physical_pars_fragment:f2,envmap_vertex:n2,fog_vertex:i2,fog_pars_vertex:s2,fog_fragment:r2,fog_pars_fragment:o2,gradientmap_pars_fragment:a2,lightmap_pars_fragment:l2,lights_lambert_fragment:c2,lights_lambert_pars_fragment:u2,lights_pars_begin:d2,lights_toon_fragment:h2,lights_toon_pars_fragment:p2,lights_phong_fragment:m2,lights_phong_pars_fragment:g2,lights_physical_fragment:v2,lights_physical_pars_fragment:_2,lights_fragment_begin:x2,lights_fragment_maps:y2,lights_fragment_end:S2,logdepthbuf_fragment:b2,logdepthbuf_pars_fragment:M2,logdepthbuf_pars_vertex:E2,logdepthbuf_vertex:w2,map_fragment:T2,map_pars_fragment:A2,map_particle_fragment:C2,map_particle_pars_fragment:R2,metalnessmap_fragment:P2,metalnessmap_pars_fragment:I2,morphinstance_vertex:D2,morphcolor_vertex:L2,morphnormal_vertex:N2,morphtarget_pars_vertex:U2,morphtarget_vertex:F2,normal_fragment_begin:k2,normal_fragment_maps:O2,normal_pars_fragment:B2,normal_pars_vertex:V2,normal_vertex:z2,normalmap_pars_fragment:H2,clearcoat_normal_fragment_begin:G2,clearcoat_normal_fragment_maps:$2,clearcoat_pars_fragment:W2,iridescence_pars_fragment:X2,opaque_fragment:q2,packing:j2,premultiplied_alpha_fragment:Y2,project_vertex:K2,dithering_fragment:Z2,dithering_pars_fragment:J2,roughnessmap_fragment:Q2,roughnessmap_pars_fragment:eI,shadowmap_pars_fragment:tI,shadowmap_pars_vertex:nI,shadowmap_vertex:iI,shadowmask_pars_fragment:sI,skinbase_vertex:rI,skinning_pars_vertex:oI,skinning_vertex:aI,skinnormal_vertex:lI,specularmap_fragment:cI,specularmap_pars_fragment:uI,tonemapping_fragment:dI,tonemapping_pars_fragment:fI,transmission_fragment:hI,transmission_pars_fragment:pI,uv_pars_fragment:mI,uv_pars_vertex:gI,uv_vertex:vI,worldpos_vertex:_I,background_vert:xI,background_frag:yI,backgroundCube_vert:SI,backgroundCube_frag:bI,cube_vert:MI,cube_frag:EI,depth_vert:wI,depth_frag:TI,distance_vert:AI,distance_frag:CI,equirect_vert:RI,equirect_frag:PI,linedashed_vert:II,linedashed_frag:DI,meshbasic_vert:LI,meshbasic_frag:NI,meshlambert_vert:UI,meshlambert_frag:FI,meshmatcap_vert:kI,meshmatcap_frag:OI,meshnormal_vert:BI,meshnormal_frag:VI,meshphong_vert:zI,meshphong_frag:HI,meshphysical_vert:GI,meshphysical_frag:$I,meshtoon_vert:WI,meshtoon_frag:XI,points_vert:qI,points_frag:jI,shadow_vert:YI,shadow_frag:KI,sprite_vert:ZI,sprite_frag:JI},De={common:{diffuse:{value:new dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new it}},envmap:{envMap:{value:null},envMapRotation:{value:new it},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new it}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new it}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new it},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new it},normalScale:{value:new vt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new it},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new it}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new it}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new it}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0},uvTransform:{value:new it}},sprite:{diffuse:{value:new dt(16777215)},opacity:{value:1},center:{value:new vt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new it},alphaMap:{value:null},alphaMapTransform:{value:new it},alphaTest:{value:0}}},ni={basic:{uniforms:un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new dt(0)}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:un([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new dt(0)},specular:{value:new dt(1118481)},shininess:{value:30}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:un([De.common,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.roughnessmap,De.metalnessmap,De.fog,De.lights,{emissive:{value:new dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:un([De.common,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.gradientmap,De.fog,De.lights,{emissive:{value:new dt(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:un([De.common,De.bumpmap,De.normalmap,De.displacementmap,De.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:un([De.points,De.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:un([De.common,De.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:un([De.common,De.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:un([De.common,De.bumpmap,De.normalmap,De.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:un([De.sprite,De.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new it},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new it}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distance:{uniforms:un([De.common,De.displacementmap,{referencePosition:{value:new ie},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distance_vert,fragmentShader:rt.distance_frag},shadow:{uniforms:un([De.lights,De.fog,{color:{value:new dt(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};ni.physical={uniforms:un([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new it},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new it},clearcoatNormalScale:{value:new vt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new it},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new it},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new it},sheen:{value:0},sheenColor:{value:new dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new it},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new it},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new it},transmissionSamplerSize:{value:new vt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new it},attenuationDistance:{value:0},attenuationColor:{value:new dt(0)},specularColor:{value:new dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new it},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new it},anisotropyVector:{value:new vt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new it}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const Yo={r:0,b:0,g:0},hs=new fi,QI=new Nt;function eD(n,e,t,i,s,r,o){const a=new dt(0);let l=r===!0?0:1,c,u,f=null,h=0,m=null;function _(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?t:e).get(M)),M}function v(y){let M=!1;const T=_(y);T===null?p(a,l):T&&T.isColor&&(p(T,1),M=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(y,M){const T=_(M);T&&(T.isCubeTexture||T.mapping===Wa)?(u===void 0&&(u=new wn(new mo(1,1,1),new hi({name:"BackgroundCubeMaterial",uniforms:hr(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),hs.copy(M.backgroundRotation),hs.x*=-1,hs.y*=-1,hs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(hs.y*=-1,hs.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(QI.makeRotationFromEuler(hs)),u.material.toneMapped=ht.getTransfer(T.colorSpace)!==bt,(f!==T||h!==T.version||m!==n.toneMapping)&&(u.material.needsUpdate=!0,f=T,h=T.version,m=n.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new wn(new go(2,2),new hi({name:"BackgroundMaterial",uniforms:hr(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:ts,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=ht.getTransfer(T.colorSpace)!==bt,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(f!==T||h!==T.version||m!==n.toneMapping)&&(c.material.needsUpdate=!0,f=T,h=T.version,m=n.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,M){y.getRGB(Yo,Lm(n)),i.buffers.color.setClear(Yo.r,Yo.g,Yo.b,M,o)}function b(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),l=M,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:v,addToRenderList:g,dispose:b}}function tD(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,o=!1;function a(E,U,O,j,ee){let Q=!1;const Z=f(j,O,U);r!==Z&&(r=Z,c(r.object)),Q=m(E,j,O,ee),Q&&_(E,j,O,ee),ee!==null&&e.update(ee,n.ELEMENT_ARRAY_BUFFER),(Q||o)&&(o=!1,M(E,U,O,j),ee!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(ee).buffer))}function l(){return n.createVertexArray()}function c(E){return n.bindVertexArray(E)}function u(E){return n.deleteVertexArray(E)}function f(E,U,O){const j=O.wireframe===!0;let ee=i[E.id];ee===void 0&&(ee={},i[E.id]=ee);let Q=ee[U.id];Q===void 0&&(Q={},ee[U.id]=Q);let Z=Q[j];return Z===void 0&&(Z=h(l()),Q[j]=Z),Z}function h(E){const U=[],O=[],j=[];for(let ee=0;ee<t;ee++)U[ee]=0,O[ee]=0,j[ee]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:O,attributeDivisors:j,object:E,attributes:{},index:null}}function m(E,U,O,j){const ee=r.attributes,Q=U.attributes;let Z=0;const I=O.getAttributes();for(const F in I)if(I[F].location>=0){const le=ee[F];let re=Q[F];if(re===void 0&&(F==="instanceMatrix"&&E.instanceMatrix&&(re=E.instanceMatrix),F==="instanceColor"&&E.instanceColor&&(re=E.instanceColor)),le===void 0||le.attribute!==re||re&&le.data!==re.data)return!0;Z++}return r.attributesNum!==Z||r.index!==j}function _(E,U,O,j){const ee={},Q=U.attributes;let Z=0;const I=O.getAttributes();for(const F in I)if(I[F].location>=0){let le=Q[F];le===void 0&&(F==="instanceMatrix"&&E.instanceMatrix&&(le=E.instanceMatrix),F==="instanceColor"&&E.instanceColor&&(le=E.instanceColor));const re={};re.attribute=le,le&&le.data&&(re.data=le.data),ee[F]=re,Z++}r.attributes=ee,r.attributesNum=Z,r.index=j}function v(){const E=r.newAttributes;for(let U=0,O=E.length;U<O;U++)E[U]=0}function g(E){p(E,0)}function p(E,U){const O=r.newAttributes,j=r.enabledAttributes,ee=r.attributeDivisors;O[E]=1,j[E]===0&&(n.enableVertexAttribArray(E),j[E]=1),ee[E]!==U&&(n.vertexAttribDivisor(E,U),ee[E]=U)}function b(){const E=r.newAttributes,U=r.enabledAttributes;for(let O=0,j=U.length;O<j;O++)U[O]!==E[O]&&(n.disableVertexAttribArray(O),U[O]=0)}function y(E,U,O,j,ee,Q,Z){Z===!0?n.vertexAttribIPointer(E,U,O,ee,Q):n.vertexAttribPointer(E,U,O,j,ee,Q)}function M(E,U,O,j){v();const ee=j.attributes,Q=O.getAttributes(),Z=U.defaultAttributeValues;for(const I in Q){const F=Q[I];if(F.location>=0){let $=ee[I];if($===void 0&&(I==="instanceMatrix"&&E.instanceMatrix&&($=E.instanceMatrix),I==="instanceColor"&&E.instanceColor&&($=E.instanceColor)),$!==void 0){const le=$.normalized,re=$.itemSize,xe=e.get($);if(xe===void 0)continue;const Te=xe.buffer,at=xe.type,st=xe.bytesPerElement,fe=at===n.INT||at===n.UNSIGNED_INT||$.gpuType===Uu;if($.isInterleavedBufferAttribute){const W=$.data,ce=W.stride,pe=$.offset;if(W.isInstancedInterleavedBuffer){for(let he=0;he<F.locationSize;he++)p(F.location+he,W.meshPerAttribute);E.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let he=0;he<F.locationSize;he++)g(F.location+he);n.bindBuffer(n.ARRAY_BUFFER,Te);for(let he=0;he<F.locationSize;he++)y(F.location+he,re/F.locationSize,at,le,ce*st,(pe+re/F.locationSize*he)*st,fe)}else{if($.isInstancedBufferAttribute){for(let W=0;W<F.locationSize;W++)p(F.location+W,$.meshPerAttribute);E.isInstancedMesh!==!0&&j._maxInstanceCount===void 0&&(j._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let W=0;W<F.locationSize;W++)g(F.location+W);n.bindBuffer(n.ARRAY_BUFFER,Te);for(let W=0;W<F.locationSize;W++)y(F.location+W,re/F.locationSize,at,le,re*st,re/F.locationSize*W*st,fe)}}else if(Z!==void 0){const le=Z[I];if(le!==void 0)switch(le.length){case 2:n.vertexAttrib2fv(F.location,le);break;case 3:n.vertexAttrib3fv(F.location,le);break;case 4:n.vertexAttrib4fv(F.location,le);break;default:n.vertexAttrib1fv(F.location,le)}}}}b()}function T(){R();for(const E in i){const U=i[E];for(const O in U){const j=U[O];for(const ee in j)u(j[ee].object),delete j[ee];delete U[O]}delete i[E]}}function C(E){if(i[E.id]===void 0)return;const U=i[E.id];for(const O in U){const j=U[O];for(const ee in j)u(j[ee].object),delete j[ee];delete U[O]}delete i[E.id]}function w(E){for(const U in i){const O=i[U];if(O[E.id]===void 0)continue;const j=O[E.id];for(const ee in j)u(j[ee].object),delete j[ee];delete O[E.id]}}function R(){x(),o=!0,r!==s&&(r=s,c(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:x,dispose:T,releaseStatesOfGeometry:C,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:g,disableUnusedAttributes:b}}function nD(n,e,t){let i;function s(c){i=c}function r(c,u){n.drawArrays(i,c,u),t.update(u,i,1)}function o(c,u,f){f!==0&&(n.drawArraysInstanced(i,c,u,f),t.update(u,i,f))}function a(c,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,f);let m=0;for(let _=0;_<f;_++)m+=u[_];t.update(m,i,1)}function l(c,u,f,h){if(f===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<c.length;_++)o(c[_],u[_],h[_]);else{m.multiDrawArraysInstancedWEBGL(i,c,0,u,0,h,0,f);let _=0;for(let v=0;v<f;v++)_+=u[v]*h[v];t.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function iD(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==Gn&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const R=w===Ni&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Mn&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==si&&!R)}function l(w){if(w==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Ze("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const f=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),b=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),y=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),C=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:m,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:b,maxVaryings:y,maxFragmentUniforms:M,maxSamples:T,samples:C}}function sD(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new vs,a=new it,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const m=f.length!==0||h||i!==0||s;return s=h,i=f.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,m){const _=f.clippingPlanes,v=f.clipIntersection,g=f.clipShadows,p=n.get(f);if(!s||_===null||_.length===0||r&&!g)r?u(null):c();else{const b=r?0:i,y=b*4;let M=p.clippingState||null;l.value=M,M=u(_,h,y,m);for(let T=0;T!==y;++T)M[T]=t[T];p.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(f,h,m,_){const v=f!==null?f.length:0;let g=null;if(v!==0){if(g=l.value,_!==!0||g===null){const p=m+v*4,b=h.matrixWorldInverse;a.getNormalMatrix(b),(g===null||g.length<p)&&(g=new Float32Array(p));for(let y=0,M=m;y!==v;++y,M+=4)o.copy(f[y]).applyMatrix4(b,a),o.normal.toArray(g,M),g[M+3]=o.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}function rD(n){let e=new WeakMap;function t(o,a){return a===Ec?o.mapping=Cs:a===wc&&(o.mapping=ur),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===Ec||a===wc)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Fm(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const Ji=4,Zf=[.125,.215,.35,.446,.526,.582],ys=20,oD=256,Pr=new ju,Jf=new dt;let Gl=null,$l=0,Wl=0,Xl=!1;const aD=new ie;class Qf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:a=aD}=r;Gl=this._renderer.getRenderTarget(),$l=this._renderer.getActiveCubeFace(),Wl=this._renderer.getActiveMipmapLevel(),Xl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=th(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Gl,$l,Wl),this._renderer.xr.enabled=Xl,e.scissorTest=!1,Xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Cs||e.mapping===ur?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Gl=this._renderer.getRenderTarget(),$l=this._renderer.getActiveCubeFace(),Wl=this._renderer.getActiveMipmapLevel(),Xl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:on,minFilter:on,generateMipmaps:!1,type:Ni,format:Gn,colorSpace:fr,depthBuffer:!1},s=eh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=eh(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=lD(r)),this._blurMaterial=uD(r,e,t),this._ggxMaterial=cD(r,e,t)}return s}_compileMaterial(e){const t=new wn(new Cn,e);this._renderer.compile(t,Pr)}_sceneToCubeUV(e,t,i,s,r){const l=new Ln(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,m=f.toneMapping;f.getClearColor(Jf),f.toneMapping=ai,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wn(new mo,new Pm({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,g=v.material;let p=!1;const b=e.background;b?b.isColor&&(g.color.copy(b),e.background=null,p=!0):(g.color.copy(Jf),p=!0);for(let y=0;y<6;y++){const M=y%3;M===0?(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[y],r.y,r.z)):M===1?(l.up.set(0,0,c[y]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[y],r.z)):(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[y]));const T=this._cubeSize;Xs(s,M*T,y>2?T:0,T,T),f.setRenderTarget(s),p&&f.render(v,l),f.render(e,l)}f.toneMapping=m,f.autoClear=h,e.background=b}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Cs||e.mapping===ur;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=nh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=th());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Xs(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Pr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const l=o.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),f=Math.sqrt(c*c-u*u),h=0+c*1.25,m=f*h,{_lodMax:_}=this,v=this._sizeLods[i],g=3*v*(i>_-Ji?i-_+Ji:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=_-t,Xs(r,g,p,3*v,2*v),s.setRenderTarget(r),s.render(a,Pr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-i,Xs(e,g,p,3*v,2*v),s.setRenderTarget(e),s.render(a,Pr)}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&gt("blur direction must be either latitudinal or longitudinal!");const u=3,f=this._lodMeshes[s];f.material=c;const h=c.uniforms,m=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*ys-1),v=r/_,g=isFinite(r)?1+Math.floor(u*v):ys;g>ys&&Ze(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${ys}`);const p=[];let b=0;for(let w=0;w<ys;++w){const R=w/v,x=Math.exp(-R*R/2);p.push(x),w===0?b+=x:w<g&&(b+=2*x)}for(let w=0;w<p.length;w++)p[w]=p[w]/b;h.envMap.value=e.texture,h.samples.value=g,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:y}=this;h.dTheta.value=_,h.mipInt.value=y-i;const M=this._sizeLods[s],T=3*M*(s>y-Ji?s-y+Ji:0),C=4*(this._cubeSize-M);Xs(t,T,C,3*M,2*M),l.setRenderTarget(t),l.render(f,Pr)}}function lD(n){const e=[],t=[],i=[];let s=n;const r=n-Ji+1+Zf.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>n-Ji?l=Zf[o-n+Ji-1]:o===0&&(l=0),t.push(l);const c=1/(a-2),u=-c,f=1+c,h=[u,u,f,u,f,f,u,u,f,f,u,f],m=6,_=6,v=3,g=2,p=1,b=new Float32Array(v*_*m),y=new Float32Array(g*_*m),M=new Float32Array(p*_*m);for(let C=0;C<m;C++){const w=C%3*2/3-1,R=C>2?0:-1,x=[w,R,0,w+2/3,R,0,w+2/3,R+1,0,w,R,0,w+2/3,R+1,0,w,R+1,0];b.set(x,v*_*C),y.set(h,g*_*C);const E=[C,C,C,C,C,C];M.set(E,p*_*C)}const T=new Cn;T.setAttribute("position",new ci(b,v)),T.setAttribute("uv",new ci(y,g)),T.setAttribute("faceIndex",new ci(M,p)),i.push(new wn(T,null)),s>Ji&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function eh(n,e,t){const i=new li(n,e,t);return i.texture.mapping=Wa,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xs(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function cD(n,e,t){return new hi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:oD,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function uD(n,e,t){const i=new Float32Array(ys),s=new ie(0,1,0);return new hi({name:"SphericalGaussianBlur",defines:{n:ys,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function th(){return new hi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:qa(),fragmentShader:`

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
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function nh(){return new hi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:qa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ri,depthTest:!1,depthWrite:!1})}function qa(){return`

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
	`}function dD(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===Ec||l===wc,u=l===Cs||l===ur;if(c||u){let f=e.get(a);const h=f!==void 0?f.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Qf(n)),f=c?t.fromEquirectangular(a,f):t.fromCubemap(a,f),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),f.texture;if(f!==void 0)return f.texture;{const m=a.image;return c&&m&&m.height>0||u&&m&&s(m)?(t===null&&(t=new Qf(n)),f=c?t.fromEquirectangular(a):t.fromCubemap(a),f.texture.pmremVersion=a.pmremVersion,e.set(a,f),a.addEventListener("dispose",r),f.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function fD(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&io("WebGLRenderer: "+i+" extension not supported."),s}}}function hD(n,e,t,i){const s={},r=new WeakMap;function o(f){const h=f.target;h.index!==null&&e.remove(h.index);for(const _ in h.attributes)e.remove(h.attributes[_]);h.removeEventListener("dispose",o),delete s[h.id];const m=r.get(h);m&&(e.remove(m),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(f,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(f){const h=f.attributes;for(const m in h)e.update(h[m],n.ARRAY_BUFFER)}function c(f){const h=[],m=f.index,_=f.attributes.position;let v=0;if(m!==null){const b=m.array;v=m.version;for(let y=0,M=b.length;y<M;y+=3){const T=b[y+0],C=b[y+1],w=b[y+2];h.push(T,C,C,w,w,T)}}else if(_!==void 0){const b=_.array;v=_.version;for(let y=0,M=b.length/3-1;y<M;y+=3){const T=y+0,C=y+1,w=y+2;h.push(T,C,C,w,w,T)}}else return;const g=new(wm(h)?Dm:Im)(h,1);g.version=v;const p=r.get(f);p&&e.remove(p),r.set(f,g)}function u(f){const h=r.get(f);if(h){const m=f.index;m!==null&&h.version<m.version&&c(f)}else c(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:u}}function pD(n,e,t){let i;function s(h){i=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,m){n.drawElements(i,m,r,h*o),t.update(m,i,1)}function c(h,m,_){_!==0&&(n.drawElementsInstanced(i,m,r,h*o,_),t.update(m,i,_))}function u(h,m,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,h,0,_);let g=0;for(let p=0;p<_;p++)g+=m[p];t.update(g,i,1)}function f(h,m,_,v){if(_===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<h.length;p++)c(h[p]/o,m[p],v[p]);else{g.multiDrawElementsInstancedWEBGL(i,m,0,r,h,0,v,0,_);let p=0;for(let b=0;b<_;b++)p+=m[b]*v[b];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function mD(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:gt("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function gD(n,e,t){const i=new WeakMap,s=new Vt;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0;let h=i.get(a);if(h===void 0||h.count!==f){let E=function(){R.dispose(),i.delete(a),a.removeEventListener("dispose",E)};var m=E;h!==void 0&&h.texture.dispose();const _=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,g=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],b=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let M=0;_===!0&&(M=1),v===!0&&(M=2),g===!0&&(M=3);let T=a.attributes.position.count*M,C=1;T>e.maxTextureSize&&(C=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const w=new Float32Array(T*C*4*f),R=new Tm(w,T,C,f);R.type=si,R.needsUpdate=!0;const x=M*4;for(let U=0;U<f;U++){const O=p[U],j=b[U],ee=y[U],Q=T*C*4*U;for(let Z=0;Z<O.count;Z++){const I=Z*x;_===!0&&(s.fromBufferAttribute(O,Z),w[Q+I+0]=s.x,w[Q+I+1]=s.y,w[Q+I+2]=s.z,w[Q+I+3]=0),v===!0&&(s.fromBufferAttribute(j,Z),w[Q+I+4]=s.x,w[Q+I+5]=s.y,w[Q+I+6]=s.z,w[Q+I+7]=0),g===!0&&(s.fromBufferAttribute(ee,Z),w[Q+I+8]=s.x,w[Q+I+9]=s.y,w[Q+I+10]=s.z,w[Q+I+11]=ee.itemSize===4?s.w:1)}}h={count:f,texture:R,size:new vt(T,C)},i.set(a,h),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let _=0;for(let g=0;g<c.length;g++)_+=c[g];const v=a.morphTargetsRelative?1:1-_;l.getUniforms().setValue(n,"morphTargetBaseInfluence",v),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function vD(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,u=l.geometry,f=e.get(l,u);if(s.get(f)!==c&&(e.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return f}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const _D={[cm]:"LINEAR_TONE_MAPPING",[um]:"REINHARD_TONE_MAPPING",[dm]:"CINEON_TONE_MAPPING",[fm]:"ACES_FILMIC_TONE_MAPPING",[pm]:"AGX_TONE_MAPPING",[mm]:"NEUTRAL_TONE_MAPPING",[hm]:"CUSTOM_TONE_MAPPING"};function xD(n,e,t,i,s){const r=new li(e,t,{type:n,depthBuffer:i,stencilBuffer:s}),o=new li(e,t,{type:Ni,depthBuffer:!1,stencilBuffer:!1}),a=new Cn;a.setAttribute("position",new an([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new an([0,2,0,0,2,0],2));const l=new uP({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),c=new wn(a,l),u=new ju(-1,1,1,-1,0,1);let f=null,h=null,m=!1,_,v=null,g=[],p=!1;this.setSize=function(b,y){r.setSize(b,y),o.setSize(b,y);for(let M=0;M<g.length;M++){const T=g[M];T.setSize&&T.setSize(b,y)}},this.setEffects=function(b){g=b,p=g.length>0&&g[0].isRenderPass===!0;const y=r.width,M=r.height;for(let T=0;T<g.length;T++){const C=g[T];C.setSize&&C.setSize(y,M)}},this.begin=function(b,y){if(m||b.toneMapping===ai&&g.length===0)return!1;if(v=y,y!==null){const M=y.width,T=y.height;(r.width!==M||r.height!==T)&&this.setSize(M,T)}return p===!1&&b.setRenderTarget(r),_=b.toneMapping,b.toneMapping=ai,!0},this.hasRenderPass=function(){return p},this.end=function(b,y){b.toneMapping=_,m=!0;let M=r,T=o;for(let C=0;C<g.length;C++){const w=g[C];if(w.enabled!==!1&&(w.render(b,T,M,y),w.needsSwap!==!1)){const R=M;M=T,T=R}}if(f!==b.outputColorSpace||h!==b.toneMapping){f=b.outputColorSpace,h=b.toneMapping,l.defines={},ht.getTransfer(f)===bt&&(l.defines.SRGB_TRANSFER="");const C=_D[h];C&&(l.defines[C]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=M.texture,b.setRenderTarget(v),b.render(c,u),v=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}const zm=new pn,au=new so(1,1),Hm=new Tm,Gm=new B3,$m=new Um,ih=[],sh=[],rh=new Float32Array(16),oh=new Float32Array(9),ah=new Float32Array(4);function vr(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=ih[s];if(r===void 0&&(r=new Float32Array(s),ih[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Xt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function qt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ja(n,e){let t=sh[e];t===void 0&&(t=new Int32Array(e),sh[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function yD(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function SD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2fv(this.addr,e),qt(t,e)}}function bD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;n.uniform3fv(this.addr,e),qt(t,e)}}function MD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4fv(this.addr,e),qt(t,e)}}function ED(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;ah.set(i),n.uniformMatrix2fv(this.addr,!1,ah),qt(t,i)}}function wD(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;oh.set(i),n.uniformMatrix3fv(this.addr,!1,oh),qt(t,i)}}function TD(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Xt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,i))return;rh.set(i),n.uniformMatrix4fv(this.addr,!1,rh),qt(t,i)}}function AD(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function CD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2iv(this.addr,e),qt(t,e)}}function RD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3iv(this.addr,e),qt(t,e)}}function PD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4iv(this.addr,e),qt(t,e)}}function ID(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function DD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;n.uniform2uiv(this.addr,e),qt(t,e)}}function LD(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;n.uniform3uiv(this.addr,e),qt(t,e)}}function ND(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;n.uniform4uiv(this.addr,e),qt(t,e)}}function UD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(au.compareFunction=t.isReversedDepthBuffer()?Hu:zu,r=au):r=zm,t.setTexture2D(e||r,s)}function FD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Gm,s)}function kD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||$m,s)}function OD(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Hm,s)}function BD(n){switch(n){case 5126:return yD;case 35664:return SD;case 35665:return bD;case 35666:return MD;case 35674:return ED;case 35675:return wD;case 35676:return TD;case 5124:case 35670:return AD;case 35667:case 35671:return CD;case 35668:case 35672:return RD;case 35669:case 35673:return PD;case 5125:return ID;case 36294:return DD;case 36295:return LD;case 36296:return ND;case 35678:case 36198:case 36298:case 36306:case 35682:return UD;case 35679:case 36299:case 36307:return FD;case 35680:case 36300:case 36308:case 36293:return kD;case 36289:case 36303:case 36311:case 36292:return OD}}function VD(n,e){n.uniform1fv(this.addr,e)}function zD(n,e){const t=vr(e,this.size,2);n.uniform2fv(this.addr,t)}function HD(n,e){const t=vr(e,this.size,3);n.uniform3fv(this.addr,t)}function GD(n,e){const t=vr(e,this.size,4);n.uniform4fv(this.addr,t)}function $D(n,e){const t=vr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function WD(n,e){const t=vr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function XD(n,e){const t=vr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function qD(n,e){n.uniform1iv(this.addr,e)}function jD(n,e){n.uniform2iv(this.addr,e)}function YD(n,e){n.uniform3iv(this.addr,e)}function KD(n,e){n.uniform4iv(this.addr,e)}function ZD(n,e){n.uniform1uiv(this.addr,e)}function JD(n,e){n.uniform2uiv(this.addr,e)}function QD(n,e){n.uniform3uiv(this.addr,e)}function eL(n,e){n.uniform4uiv(this.addr,e)}function tL(n,e,t){const i=this.cache,s=e.length,r=ja(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=au:o=zm;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function nL(n,e,t){const i=this.cache,s=e.length,r=ja(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Gm,r[o])}function iL(n,e,t){const i=this.cache,s=e.length,r=ja(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||$m,r[o])}function sL(n,e,t){const i=this.cache,s=e.length,r=ja(t,s);Xt(i,r)||(n.uniform1iv(this.addr,r),qt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Hm,r[o])}function rL(n){switch(n){case 5126:return VD;case 35664:return zD;case 35665:return HD;case 35666:return GD;case 35674:return $D;case 35675:return WD;case 35676:return XD;case 5124:case 35670:return qD;case 35667:case 35671:return jD;case 35668:case 35672:return YD;case 35669:case 35673:return KD;case 5125:return ZD;case 36294:return JD;case 36295:return QD;case 36296:return eL;case 35678:case 36198:case 36298:case 36306:case 35682:return tL;case 35679:case 36299:case 36307:return nL;case 35680:case 36300:case 36308:case 36293:return iL;case 36289:case 36303:case 36311:case 36292:return sL}}class oL{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=BD(t.type)}}class aL{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=rL(t.type)}}class lL{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const ql=/(\w+)(\])?(\[|\.)?/g;function lh(n,e){n.seq.push(e),n.map[e.id]=e}function cL(n,e,t){const i=n.name,s=i.length;for(ql.lastIndex=0;;){const r=ql.exec(i),o=ql.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){lh(t,c===void 0?new oL(a,n,e):new aL(a,n,e));break}else{let f=t.map[a];f===void 0&&(f=new lL(a),lh(t,f)),t=f}}}class ua{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);cL(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function ch(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const uL=37297;let dL=0;function fL(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const uh=new it;function hL(n){ht._getMatrix(uh,ht.workingColorSpace,n);const e=`mat3( ${uh.elements.map(t=>t.toFixed(4))} )`;switch(ht.getTransfer(n)){case Sa:return[e,"LinearTransferOETF"];case bt:return[e,"sRGBTransferOETF"];default:return Ze("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function dh(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+fL(n.getShaderSource(e),a)}else return r}function pL(n,e){const t=hL(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const mL={[cm]:"Linear",[um]:"Reinhard",[dm]:"Cineon",[fm]:"ACESFilmic",[pm]:"AgX",[mm]:"Neutral",[hm]:"Custom"};function gL(n,e){const t=mL[e];return t===void 0?(Ze("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ko=new ie;function vL(){ht.getLuminanceCoefficients(Ko);const n=Ko.x.toFixed(4),e=Ko.y.toFixed(4),t=Ko.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function _L(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ur).join(`
`)}function xL(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function yL(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Ur(n){return n!==""}function fh(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function hh(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const SL=/^[ \t]*#include +<([\w\d./]+)>/gm;function lu(n){return n.replace(SL,ML)}const bL=new Map;function ML(n,e){let t=rt[e];if(t===void 0){const i=bL.get(e);if(i!==void 0)t=rt[i],Ze('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return lu(t)}const EL=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ph(n){return n.replace(EL,wL)}function wL(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function mh(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}const TL={[ra]:"SHADOWMAP_TYPE_PCF",[Lr]:"SHADOWMAP_TYPE_VSM"};function AL(n){return TL[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const CL={[Cs]:"ENVMAP_TYPE_CUBE",[ur]:"ENVMAP_TYPE_CUBE",[Wa]:"ENVMAP_TYPE_CUBE_UV"};function RL(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":CL[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const PL={[ur]:"ENVMAP_MODE_REFRACTION"};function IL(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":PL[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const DL={[Nu]:"ENVMAP_BLENDING_MULTIPLY",[y3]:"ENVMAP_BLENDING_MIX",[S3]:"ENVMAP_BLENDING_ADD"};function LL(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":DL[n.combine]||"ENVMAP_BLENDING_NONE"}function NL(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function UL(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=AL(t),c=RL(t),u=IL(t),f=LL(t),h=NL(t),m=_L(t),_=xL(r),v=s.createProgram();let g,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ur).join(`
`),p.length>0&&(p+=`
`)):(g=[mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ur).join(`
`),p=[mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ai?"#define TONE_MAPPING":"",t.toneMapping!==ai?rt.tonemapping_pars_fragment:"",t.toneMapping!==ai?gL("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,pL("linearToOutputTexel",t.outputColorSpace),vL(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ur).join(`
`)),o=lu(o),o=fh(o,t),o=hh(o,t),a=lu(a),a=fh(a,t),a=hh(a,t),o=ph(o),a=ph(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Af?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Af?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=b+g+o,M=b+p+a,T=ch(s,s.VERTEX_SHADER,y),C=ch(s,s.FRAGMENT_SHADER,M);s.attachShader(v,T),s.attachShader(v,C),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(U){if(n.debug.checkShaderErrors){const O=s.getProgramInfoLog(v)||"",j=s.getShaderInfoLog(T)||"",ee=s.getShaderInfoLog(C)||"",Q=O.trim(),Z=j.trim(),I=ee.trim();let F=!0,$=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(F=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,T,C);else{const le=dh(s,T,"vertex"),re=dh(s,C,"fragment");gt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+Q+`
`+le+`
`+re)}else Q!==""?Ze("WebGLProgram: Program Info Log:",Q):(Z===""||I==="")&&($=!1);$&&(U.diagnostics={runnable:F,programLog:Q,vertexShader:{log:Z,prefix:g},fragmentShader:{log:I,prefix:p}})}s.deleteShader(T),s.deleteShader(C),R=new ua(s,v),x=yL(s,v)}let R;this.getUniforms=function(){return R===void 0&&w(this),R};let x;this.getAttributes=function(){return x===void 0&&w(this),x};let E=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=s.getProgramParameter(v,uL)),E},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=dL++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=T,this.fragmentShader=C,this}let FL=0;class kL{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new OL(e),t.set(e,i)),i}}class OL{constructor(e){this.id=FL++,this.code=e,this.usedTimes=0}}function BL(n,e,t,i,s,r,o){const a=new Cm,l=new kL,c=new Set,u=[],f=new Map,h=s.logarithmicDepthBuffer;let m=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(x){return c.add(x),x===0?"uv":`uv${x}`}function g(x,E,U,O,j){const ee=O.fog,Q=j.geometry,Z=x.isMeshStandardMaterial?O.environment:null,I=(x.isMeshStandardMaterial?t:e).get(x.envMap||Z),F=I&&I.mapping===Wa?I.image.height:null,$=_[x.type];x.precision!==null&&(m=s.getMaxPrecision(x.precision),m!==x.precision&&Ze("WebGLProgram.getParameters:",x.precision,"not supported, using",m,"instead."));const le=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,re=le!==void 0?le.length:0;let xe=0;Q.morphAttributes.position!==void 0&&(xe=1),Q.morphAttributes.normal!==void 0&&(xe=2),Q.morphAttributes.color!==void 0&&(xe=3);let Te,at,st,fe;if($){const yt=ni[$];Te=yt.vertexShader,at=yt.fragmentShader}else Te=x.vertexShader,at=x.fragmentShader,l.update(x),st=l.getVertexShaderID(x),fe=l.getFragmentShaderID(x);const W=n.getRenderTarget(),ce=n.state.buffers.depth.getReversed(),pe=j.isInstancedMesh===!0,he=j.isBatchedMesh===!0,Le=!!x.map,k=!!x.matcap,z=!!I,q=!!x.aoMap,H=!!x.lightMap,D=!!x.bumpMap,X=!!x.normalMap,L=!!x.displacementMap,ye=!!x.emissiveMap,me=!!x.metalnessMap,ue=!!x.roughnessMap,ge=x.anisotropy>0,A=x.clearcoat>0,S=x.dispersion>0,G=x.iridescence>0,se=x.sheen>0,de=x.transmission>0,ne=ge&&!!x.anisotropyMap,Ne=A&&!!x.clearcoatMap,be=A&&!!x.clearcoatNormalMap,ke=A&&!!x.clearcoatRoughnessMap,We=G&&!!x.iridescenceMap,Se=G&&!!x.iridescenceThicknessMap,Ce=se&&!!x.sheenColorMap,Pe=se&&!!x.sheenRoughnessMap,Oe=!!x.specularMap,Ae=!!x.specularColorMap,nt=!!x.specularIntensityMap,Y=de&&!!x.transmissionMap,Fe=de&&!!x.thicknessMap,we=!!x.gradientMap,ze=!!x.alphaMap,Me=x.alphaTest>0,_e=!!x.alphaHash,Re=!!x.extensions;let Je=ai;x.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(Je=n.toneMapping);const Rt={shaderID:$,shaderType:x.type,shaderName:x.name,vertexShader:Te,fragmentShader:at,defines:x.defines,customVertexShaderID:st,customFragmentShaderID:fe,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:m,batching:he,batchingColor:he&&j._colorsTexture!==null,instancing:pe,instancingColor:pe&&j.instanceColor!==null,instancingMorph:pe&&j.morphTexture!==null,outputColorSpace:W===null?n.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:fr,alphaToCoverage:!!x.alphaToCoverage,map:Le,matcap:k,envMap:z,envMapMode:z&&I.mapping,envMapCubeUVHeight:F,aoMap:q,lightMap:H,bumpMap:D,normalMap:X,displacementMap:L,emissiveMap:ye,normalMapObjectSpace:X&&x.normalMapType===E3,normalMapTangentSpace:X&&x.normalMapType===Em,metalnessMap:me,roughnessMap:ue,anisotropy:ge,anisotropyMap:ne,clearcoat:A,clearcoatMap:Ne,clearcoatNormalMap:be,clearcoatRoughnessMap:ke,dispersion:S,iridescence:G,iridescenceMap:We,iridescenceThicknessMap:Se,sheen:se,sheenColorMap:Ce,sheenRoughnessMap:Pe,specularMap:Oe,specularColorMap:Ae,specularIntensityMap:nt,transmission:de,transmissionMap:Y,thicknessMap:Fe,gradientMap:we,opaque:x.transparent===!1&&x.blending===er&&x.alphaToCoverage===!1,alphaMap:ze,alphaTest:Me,alphaHash:_e,combine:x.combine,mapUv:Le&&v(x.map.channel),aoMapUv:q&&v(x.aoMap.channel),lightMapUv:H&&v(x.lightMap.channel),bumpMapUv:D&&v(x.bumpMap.channel),normalMapUv:X&&v(x.normalMap.channel),displacementMapUv:L&&v(x.displacementMap.channel),emissiveMapUv:ye&&v(x.emissiveMap.channel),metalnessMapUv:me&&v(x.metalnessMap.channel),roughnessMapUv:ue&&v(x.roughnessMap.channel),anisotropyMapUv:ne&&v(x.anisotropyMap.channel),clearcoatMapUv:Ne&&v(x.clearcoatMap.channel),clearcoatNormalMapUv:be&&v(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ke&&v(x.clearcoatRoughnessMap.channel),iridescenceMapUv:We&&v(x.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&v(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&v(x.sheenColorMap.channel),sheenRoughnessMapUv:Pe&&v(x.sheenRoughnessMap.channel),specularMapUv:Oe&&v(x.specularMap.channel),specularColorMapUv:Ae&&v(x.specularColorMap.channel),specularIntensityMapUv:nt&&v(x.specularIntensityMap.channel),transmissionMapUv:Y&&v(x.transmissionMap.channel),thicknessMapUv:Fe&&v(x.thicknessMap.channel),alphaMapUv:ze&&v(x.alphaMap.channel),vertexTangents:!!Q.attributes.tangent&&(X||ge),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,pointsUvs:j.isPoints===!0&&!!Q.attributes.uv&&(Le||ze),fog:!!ee,useFog:x.fog===!0,fogExp2:!!ee&&ee.isFogExp2,flatShading:x.flatShading===!0&&x.wireframe===!1,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:ce,skinning:j.isSkinnedMesh===!0,morphTargets:Q.morphAttributes.position!==void 0,morphNormals:Q.morphAttributes.normal!==void 0,morphColors:Q.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:xe,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&U.length>0,shadowMapType:n.shadowMap.type,toneMapping:Je,decodeVideoTexture:Le&&x.map.isVideoTexture===!0&&ht.getTransfer(x.map.colorSpace)===bt,decodeVideoTextureEmissive:ye&&x.emissiveMap.isVideoTexture===!0&&ht.getTransfer(x.emissiveMap.colorSpace)===bt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ii,flipSided:x.side===_n,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Re&&x.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Re&&x.extensions.multiDraw===!0||he)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Rt.vertexUv1s=c.has(1),Rt.vertexUv2s=c.has(2),Rt.vertexUv3s=c.has(3),c.clear(),Rt}function p(x){const E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(const U in x.defines)E.push(U),E.push(x.defines[U]);return x.isRawShaderMaterial===!1&&(b(E,x),y(E,x),E.push(n.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function b(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function y(x,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),x.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),x.push(a.mask)}function M(x){const E=_[x.type];let U;if(E){const O=ni[E];U=J3.clone(O.uniforms)}else U=x.uniforms;return U}function T(x,E){let U=f.get(E);return U!==void 0?++U.usedTimes:(U=new UL(n,E,x,r),u.push(U),f.set(E,U)),U}function C(x){if(--x.usedTimes===0){const E=u.indexOf(x);u[E]=u[u.length-1],u.pop(),f.delete(x.cacheKey),x.destroy()}}function w(x){l.remove(x)}function R(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:M,acquireProgram:T,releaseProgram:C,releaseShaderCache:w,programs:u,dispose:R}}function VL(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function zL(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function gh(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function vh(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(f,h,m,_,v,g){let p=n[e];return p===void 0?(p={id:f.id,object:f,geometry:h,material:m,groupOrder:_,renderOrder:f.renderOrder,z:v,group:g},n[e]=p):(p.id=f.id,p.object=f,p.geometry=h,p.material=m,p.groupOrder=_,p.renderOrder=f.renderOrder,p.z=v,p.group=g),e++,p}function a(f,h,m,_,v,g){const p=o(f,h,m,_,v,g);m.transmission>0?i.push(p):m.transparent===!0?s.push(p):t.push(p)}function l(f,h,m,_,v,g){const p=o(f,h,m,_,v,g);m.transmission>0?i.unshift(p):m.transparent===!0?s.unshift(p):t.unshift(p)}function c(f,h){t.length>1&&t.sort(f||zL),i.length>1&&i.sort(h||gh),s.length>1&&s.sort(h||gh)}function u(){for(let f=e,h=n.length;f<h;f++){const m=n[f];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function HL(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new vh,n.set(i,[o])):s>=r.length?(o=new vh,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function GL(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new ie,color:new dt};break;case"SpotLight":t={position:new ie,direction:new ie,color:new dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new ie,color:new dt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new ie,skyColor:new dt,groundColor:new dt};break;case"RectAreaLight":t={color:new dt,position:new ie,halfWidth:new ie,halfHeight:new ie};break}return n[e.id]=t,t}}}function $L(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let WL=0;function XL(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function qL(n){const e=new GL,t=$L(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new ie);const s=new ie,r=new Nt,o=new Nt;function a(c){let u=0,f=0,h=0;for(let x=0;x<9;x++)i.probe[x].set(0,0,0);let m=0,_=0,v=0,g=0,p=0,b=0,y=0,M=0,T=0,C=0,w=0;c.sort(XL);for(let x=0,E=c.length;x<E;x++){const U=c[x],O=U.color,j=U.intensity,ee=U.distance;let Q=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===dr?Q=U.shadow.map.texture:Q=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=O.r*j,f+=O.g*j,h+=O.b*j;else if(U.isLightProbe){for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(U.sh.coefficients[Z],j);w++}else if(U.isDirectionalLight){const Z=e.get(U);if(Z.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const I=U.shadow,F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,i.directionalShadow[m]=F,i.directionalShadowMap[m]=Q,i.directionalShadowMatrix[m]=U.shadow.matrix,b++}i.directional[m]=Z,m++}else if(U.isSpotLight){const Z=e.get(U);Z.position.setFromMatrixPosition(U.matrixWorld),Z.color.copy(O).multiplyScalar(j),Z.distance=ee,Z.coneCos=Math.cos(U.angle),Z.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),Z.decay=U.decay,i.spot[v]=Z;const I=U.shadow;if(U.map&&(i.spotLightMap[T]=U.map,T++,I.updateMatrices(U),U.castShadow&&C++),i.spotLightMatrix[v]=I.matrix,U.castShadow){const F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,i.spotShadow[v]=F,i.spotShadowMap[v]=Q,M++}v++}else if(U.isRectAreaLight){const Z=e.get(U);Z.color.copy(O).multiplyScalar(j),Z.halfWidth.set(U.width*.5,0,0),Z.halfHeight.set(0,U.height*.5,0),i.rectArea[g]=Z,g++}else if(U.isPointLight){const Z=e.get(U);if(Z.color.copy(U.color).multiplyScalar(U.intensity),Z.distance=U.distance,Z.decay=U.decay,U.castShadow){const I=U.shadow,F=t.get(U);F.shadowIntensity=I.intensity,F.shadowBias=I.bias,F.shadowNormalBias=I.normalBias,F.shadowRadius=I.radius,F.shadowMapSize=I.mapSize,F.shadowCameraNear=I.camera.near,F.shadowCameraFar=I.camera.far,i.pointShadow[_]=F,i.pointShadowMap[_]=Q,i.pointShadowMatrix[_]=U.shadow.matrix,y++}i.point[_]=Z,_++}else if(U.isHemisphereLight){const Z=e.get(U);Z.skyColor.copy(U.color).multiplyScalar(j),Z.groundColor.copy(U.groundColor).multiplyScalar(j),i.hemi[p]=Z,p++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=De.LTC_FLOAT_1,i.rectAreaLTC2=De.LTC_FLOAT_2):(i.rectAreaLTC1=De.LTC_HALF_1,i.rectAreaLTC2=De.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;const R=i.hash;(R.directionalLength!==m||R.pointLength!==_||R.spotLength!==v||R.rectAreaLength!==g||R.hemiLength!==p||R.numDirectionalShadows!==b||R.numPointShadows!==y||R.numSpotShadows!==M||R.numSpotMaps!==T||R.numLightProbes!==w)&&(i.directional.length=m,i.spot.length=v,i.rectArea.length=g,i.point.length=_,i.hemi.length=p,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.pointShadow.length=y,i.pointShadowMap.length=y,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=b,i.pointShadowMatrix.length=y,i.spotLightMatrix.length=M+T-C,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=w,R.directionalLength=m,R.pointLength=_,R.spotLength=v,R.rectAreaLength=g,R.hemiLength=p,R.numDirectionalShadows=b,R.numPointShadows=y,R.numSpotShadows=M,R.numSpotMaps=T,R.numLightProbes=w,i.version=WL++)}function l(c,u){let f=0,h=0,m=0,_=0,v=0;const g=u.matrixWorldInverse;for(let p=0,b=c.length;p<b;p++){const y=c[p];if(y.isDirectionalLight){const M=i.directional[f];M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),f++}else if(y.isSpotLight){const M=i.spot[m];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),M.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(g),m++}else if(y.isRectAreaLight){const M=i.rectArea[_];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),o.identity(),r.copy(y.matrixWorld),r.premultiply(g),o.extractRotation(r),M.halfWidth.set(y.width*.5,0,0),M.halfHeight.set(0,y.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){const M=i.point[h];M.position.setFromMatrixPosition(y.matrixWorld),M.position.applyMatrix4(g),h++}else if(y.isHemisphereLight){const M=i.hemi[v];M.direction.setFromMatrixPosition(y.matrixWorld),M.direction.transformDirection(g),v++}}}return{setup:a,setupView:l,state:i}}function _h(n){const e=new qL(n),t=[],i=[];function s(u){c.camera=u,t.length=0,i.length=0}function r(u){t.push(u)}function o(u){i.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function jL(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new _h(n),e.set(s,[a])):r>=o.length?(a=new _h(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const YL=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,KL=`uniform sampler2D shadow_pass;
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
}`,ZL=[new ie(1,0,0),new ie(-1,0,0),new ie(0,1,0),new ie(0,-1,0),new ie(0,0,1),new ie(0,0,-1)],JL=[new ie(0,-1,0),new ie(0,-1,0),new ie(0,0,1),new ie(0,0,-1),new ie(0,-1,0),new ie(0,-1,0)],xh=new Nt,Ir=new ie,jl=new ie;function QL(n,e,t){let i=new Wu;const s=new vt,r=new vt,o=new Vt,a=new dP,l=new fP,c={},u=t.maxTextureSize,f={[ts]:_n,[_n]:ts,[ii]:ii},h=new hi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new vt},radius:{value:4}},vertexShader:YL,fragmentShader:KL}),m=h.clone();m.defines.HORIZONTAL_PASS=1;const _=new Cn;_.setAttribute("position",new ci(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new wn(_,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ra;let p=this.type;this.render=function(C,w,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||C.length===0)return;C.type===t3&&(Ze("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),C.type=ra);const x=n.getRenderTarget(),E=n.getActiveCubeFace(),U=n.getActiveMipmapLevel(),O=n.state;O.setBlending(Ri),O.buffers.depth.getReversed()===!0?O.buffers.color.setClear(0,0,0,0):O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const j=p!==this.type;j&&w.traverse(function(ee){ee.material&&(Array.isArray(ee.material)?ee.material.forEach(Q=>Q.needsUpdate=!0):ee.material.needsUpdate=!0)});for(let ee=0,Q=C.length;ee<Q;ee++){const Z=C[ee],I=Z.shadow;if(I===void 0){Ze("WebGLShadowMap:",Z,"has no shadow.");continue}if(I.autoUpdate===!1&&I.needsUpdate===!1)continue;s.copy(I.mapSize);const F=I.getFrameExtents();if(s.multiply(F),r.copy(I.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/F.x),s.x=r.x*F.x,I.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/F.y),s.y=r.y*F.y,I.mapSize.y=r.y)),I.map===null||j===!0){if(I.map!==null&&(I.map.depthTexture!==null&&(I.map.depthTexture.dispose(),I.map.depthTexture=null),I.map.dispose()),this.type===Lr){if(Z.isPointLight){Ze("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}I.map=new li(s.x,s.y,{format:dr,type:Ni,minFilter:on,magFilter:on,generateMipmaps:!1}),I.map.texture.name=Z.name+".shadowMap",I.map.depthTexture=new so(s.x,s.y,si),I.map.depthTexture.name=Z.name+".shadowMapDepth",I.map.depthTexture.format=Ui,I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=Zt,I.map.depthTexture.magFilter=Zt}else{Z.isPointLight?(I.map=new Fm(s.x),I.map.depthTexture=new cP(s.x,di)):(I.map=new li(s.x,s.y),I.map.depthTexture=new so(s.x,s.y,di)),I.map.depthTexture.name=Z.name+".shadowMap",I.map.depthTexture.format=Ui;const le=n.state.buffers.depth.getReversed();this.type===ra?(I.map.depthTexture.compareFunction=le?Hu:zu,I.map.depthTexture.minFilter=on,I.map.depthTexture.magFilter=on):(I.map.depthTexture.compareFunction=null,I.map.depthTexture.minFilter=Zt,I.map.depthTexture.magFilter=Zt)}I.camera.updateProjectionMatrix()}const $=I.map.isWebGLCubeRenderTarget?6:1;for(let le=0;le<$;le++){if(I.map.isWebGLCubeRenderTarget)n.setRenderTarget(I.map,le),n.clear();else{le===0&&(n.setRenderTarget(I.map),n.clear());const re=I.getViewport(le);o.set(r.x*re.x,r.y*re.y,r.x*re.z,r.y*re.w),O.viewport(o)}if(Z.isPointLight){const re=I.camera,xe=I.matrix,Te=Z.distance||re.far;Te!==re.far&&(re.far=Te,re.updateProjectionMatrix()),Ir.setFromMatrixPosition(Z.matrixWorld),re.position.copy(Ir),jl.copy(re.position),jl.add(ZL[le]),re.up.copy(JL[le]),re.lookAt(jl),re.updateMatrixWorld(),xe.makeTranslation(-Ir.x,-Ir.y,-Ir.z),xh.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),I._frustum.setFromProjectionMatrix(xh,re.coordinateSystem,re.reversedDepth)}else I.updateMatrices(Z);i=I.getFrustum(),M(w,R,I.camera,Z,this.type)}I.isPointLightShadow!==!0&&this.type===Lr&&b(I,R),I.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(x,E,U)};function b(C,w){const R=e.update(v);h.defines.VSM_SAMPLES!==C.blurSamples&&(h.defines.VSM_SAMPLES=C.blurSamples,m.defines.VSM_SAMPLES=C.blurSamples,h.needsUpdate=!0,m.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new li(s.x,s.y,{format:dr,type:Ni})),h.uniforms.shadow_pass.value=C.map.depthTexture,h.uniforms.resolution.value=C.mapSize,h.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(w,null,R,h,v,null),m.uniforms.shadow_pass.value=C.mapPass.texture,m.uniforms.resolution.value=C.mapSize,m.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(w,null,R,m,v,null)}function y(C,w,R,x){let E=null;const U=R.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(U!==void 0)E=U;else if(E=R.isPointLight===!0?l:a,n.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const O=E.uuid,j=w.uuid;let ee=c[O];ee===void 0&&(ee={},c[O]=ee);let Q=ee[j];Q===void 0&&(Q=E.clone(),ee[j]=Q,w.addEventListener("dispose",T)),E=Q}if(E.visible=w.visible,E.wireframe=w.wireframe,x===Lr?E.side=w.shadowSide!==null?w.shadowSide:w.side:E.side=w.shadowSide!==null?w.shadowSide:f[w.side],E.alphaMap=w.alphaMap,E.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,E.map=w.map,E.clipShadows=w.clipShadows,E.clippingPlanes=w.clippingPlanes,E.clipIntersection=w.clipIntersection,E.displacementMap=w.displacementMap,E.displacementScale=w.displacementScale,E.displacementBias=w.displacementBias,E.wireframeLinewidth=w.wireframeLinewidth,E.linewidth=w.linewidth,R.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const O=n.properties.get(E);O.light=R}return E}function M(C,w,R,x,E){if(C.visible===!1)return;if(C.layers.test(w.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&E===Lr)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,C.matrixWorld);const j=e.update(C),ee=C.material;if(Array.isArray(ee)){const Q=j.groups;for(let Z=0,I=Q.length;Z<I;Z++){const F=Q[Z],$=ee[F.materialIndex];if($&&$.visible){const le=y(C,$,x,E);C.onBeforeShadow(n,C,w,R,j,le,F),n.renderBufferDirect(R,null,j,le,C,F),C.onAfterShadow(n,C,w,R,j,le,F)}}}else if(ee.visible){const Q=y(C,ee,x,E);C.onBeforeShadow(n,C,w,R,j,Q,null),n.renderBufferDirect(R,null,j,Q,C,null),C.onAfterShadow(n,C,w,R,j,Q,null)}}const O=C.children;for(let j=0,ee=O.length;j<ee;j++)M(O[j],w,R,x,E)}function T(C){C.target.removeEventListener("dispose",T);for(const R in c){const x=c[R],E=C.target.uuid;E in x&&(x[E].dispose(),delete x[E])}}}const eN={[vc]:_c,[xc]:bc,[yc]:Mc,[cr]:Sc,[_c]:vc,[bc]:xc,[Mc]:yc,[Sc]:cr};function tN(n,e){function t(){let Y=!1;const Fe=new Vt;let we=null;const ze=new Vt(0,0,0,0);return{setMask:function(Me){we!==Me&&!Y&&(n.colorMask(Me,Me,Me,Me),we=Me)},setLocked:function(Me){Y=Me},setClear:function(Me,_e,Re,Je,Rt){Rt===!0&&(Me*=Je,_e*=Je,Re*=Je),Fe.set(Me,_e,Re,Je),ze.equals(Fe)===!1&&(n.clearColor(Me,_e,Re,Je),ze.copy(Fe))},reset:function(){Y=!1,we=null,ze.set(-1,0,0,0)}}}function i(){let Y=!1,Fe=!1,we=null,ze=null,Me=null;return{setReversed:function(_e){if(Fe!==_e){const Re=e.get("EXT_clip_control");_e?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),Fe=_e;const Je=Me;Me=null,this.setClear(Je)}},getReversed:function(){return Fe},setTest:function(_e){_e?W(n.DEPTH_TEST):ce(n.DEPTH_TEST)},setMask:function(_e){we!==_e&&!Y&&(n.depthMask(_e),we=_e)},setFunc:function(_e){if(Fe&&(_e=eN[_e]),ze!==_e){switch(_e){case vc:n.depthFunc(n.NEVER);break;case _c:n.depthFunc(n.ALWAYS);break;case xc:n.depthFunc(n.LESS);break;case cr:n.depthFunc(n.LEQUAL);break;case yc:n.depthFunc(n.EQUAL);break;case Sc:n.depthFunc(n.GEQUAL);break;case bc:n.depthFunc(n.GREATER);break;case Mc:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ze=_e}},setLocked:function(_e){Y=_e},setClear:function(_e){Me!==_e&&(Fe&&(_e=1-_e),n.clearDepth(_e),Me=_e)},reset:function(){Y=!1,we=null,ze=null,Me=null,Fe=!1}}}function s(){let Y=!1,Fe=null,we=null,ze=null,Me=null,_e=null,Re=null,Je=null,Rt=null;return{setTest:function(yt){Y||(yt?W(n.STENCIL_TEST):ce(n.STENCIL_TEST))},setMask:function(yt){Fe!==yt&&!Y&&(n.stencilMask(yt),Fe=yt)},setFunc:function(yt,Kn,mi){(we!==yt||ze!==Kn||Me!==mi)&&(n.stencilFunc(yt,Kn,mi),we=yt,ze=Kn,Me=mi)},setOp:function(yt,Kn,mi){(_e!==yt||Re!==Kn||Je!==mi)&&(n.stencilOp(yt,Kn,mi),_e=yt,Re=Kn,Je=mi)},setLocked:function(yt){Y=yt},setClear:function(yt){Rt!==yt&&(n.clearStencil(yt),Rt=yt)},reset:function(){Y=!1,Fe=null,we=null,ze=null,Me=null,_e=null,Re=null,Je=null,Rt=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let u={},f={},h=new WeakMap,m=[],_=null,v=!1,g=null,p=null,b=null,y=null,M=null,T=null,C=null,w=new dt(0,0,0),R=0,x=!1,E=null,U=null,O=null,j=null,ee=null;const Q=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Z=!1,I=0;const F=n.getParameter(n.VERSION);F.indexOf("WebGL")!==-1?(I=parseFloat(/^WebGL (\d)/.exec(F)[1]),Z=I>=1):F.indexOf("OpenGL ES")!==-1&&(I=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),Z=I>=2);let $=null,le={};const re=n.getParameter(n.SCISSOR_BOX),xe=n.getParameter(n.VIEWPORT),Te=new Vt().fromArray(re),at=new Vt().fromArray(xe);function st(Y,Fe,we,ze){const Me=new Uint8Array(4),_e=n.createTexture();n.bindTexture(Y,_e),n.texParameteri(Y,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(Y,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Re=0;Re<we;Re++)Y===n.TEXTURE_3D||Y===n.TEXTURE_2D_ARRAY?n.texImage3D(Fe,0,n.RGBA,1,1,ze,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(Fe+Re,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return _e}const fe={};fe[n.TEXTURE_2D]=st(n.TEXTURE_2D,n.TEXTURE_2D,1),fe[n.TEXTURE_CUBE_MAP]=st(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[n.TEXTURE_2D_ARRAY]=st(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),fe[n.TEXTURE_3D]=st(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),W(n.DEPTH_TEST),o.setFunc(cr),D(!1),X(Sf),W(n.CULL_FACE),q(Ri);function W(Y){u[Y]!==!0&&(n.enable(Y),u[Y]=!0)}function ce(Y){u[Y]!==!1&&(n.disable(Y),u[Y]=!1)}function pe(Y,Fe){return f[Y]!==Fe?(n.bindFramebuffer(Y,Fe),f[Y]=Fe,Y===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=Fe),Y===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=Fe),!0):!1}function he(Y,Fe){let we=m,ze=!1;if(Y){we=h.get(Fe),we===void 0&&(we=[],h.set(Fe,we));const Me=Y.textures;if(we.length!==Me.length||we[0]!==n.COLOR_ATTACHMENT0){for(let _e=0,Re=Me.length;_e<Re;_e++)we[_e]=n.COLOR_ATTACHMENT0+_e;we.length=Me.length,ze=!0}}else we[0]!==n.BACK&&(we[0]=n.BACK,ze=!0);ze&&n.drawBuffers(we)}function Le(Y){return _!==Y?(n.useProgram(Y),_=Y,!0):!1}const k={[xs]:n.FUNC_ADD,[i3]:n.FUNC_SUBTRACT,[s3]:n.FUNC_REVERSE_SUBTRACT};k[r3]=n.MIN,k[o3]=n.MAX;const z={[a3]:n.ZERO,[l3]:n.ONE,[c3]:n.SRC_COLOR,[mc]:n.SRC_ALPHA,[m3]:n.SRC_ALPHA_SATURATE,[h3]:n.DST_COLOR,[d3]:n.DST_ALPHA,[u3]:n.ONE_MINUS_SRC_COLOR,[gc]:n.ONE_MINUS_SRC_ALPHA,[p3]:n.ONE_MINUS_DST_COLOR,[f3]:n.ONE_MINUS_DST_ALPHA,[g3]:n.CONSTANT_COLOR,[v3]:n.ONE_MINUS_CONSTANT_COLOR,[_3]:n.CONSTANT_ALPHA,[x3]:n.ONE_MINUS_CONSTANT_ALPHA};function q(Y,Fe,we,ze,Me,_e,Re,Je,Rt,yt){if(Y===Ri){v===!0&&(ce(n.BLEND),v=!1);return}if(v===!1&&(W(n.BLEND),v=!0),Y!==n3){if(Y!==g||yt!==x){if((p!==xs||M!==xs)&&(n.blendEquation(n.FUNC_ADD),p=xs,M=xs),yt)switch(Y){case er:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case bf:n.blendFunc(n.ONE,n.ONE);break;case Mf:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ef:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:gt("WebGLState: Invalid blending: ",Y);break}else switch(Y){case er:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case bf:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Mf:gt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ef:gt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:gt("WebGLState: Invalid blending: ",Y);break}b=null,y=null,T=null,C=null,w.set(0,0,0),R=0,g=Y,x=yt}return}Me=Me||Fe,_e=_e||we,Re=Re||ze,(Fe!==p||Me!==M)&&(n.blendEquationSeparate(k[Fe],k[Me]),p=Fe,M=Me),(we!==b||ze!==y||_e!==T||Re!==C)&&(n.blendFuncSeparate(z[we],z[ze],z[_e],z[Re]),b=we,y=ze,T=_e,C=Re),(Je.equals(w)===!1||Rt!==R)&&(n.blendColor(Je.r,Je.g,Je.b,Rt),w.copy(Je),R=Rt),g=Y,x=!1}function H(Y,Fe){Y.side===ii?ce(n.CULL_FACE):W(n.CULL_FACE);let we=Y.side===_n;Fe&&(we=!we),D(we),Y.blending===er&&Y.transparent===!1?q(Ri):q(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),o.setFunc(Y.depthFunc),o.setTest(Y.depthTest),o.setMask(Y.depthWrite),r.setMask(Y.colorWrite);const ze=Y.stencilWrite;a.setTest(ze),ze&&(a.setMask(Y.stencilWriteMask),a.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),a.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass)),ye(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?W(n.SAMPLE_ALPHA_TO_COVERAGE):ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function D(Y){E!==Y&&(Y?n.frontFace(n.CW):n.frontFace(n.CCW),E=Y)}function X(Y){Y!==QR?(W(n.CULL_FACE),Y!==U&&(Y===Sf?n.cullFace(n.BACK):Y===e3?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ce(n.CULL_FACE),U=Y}function L(Y){Y!==O&&(Z&&n.lineWidth(Y),O=Y)}function ye(Y,Fe,we){Y?(W(n.POLYGON_OFFSET_FILL),(j!==Fe||ee!==we)&&(n.polygonOffset(Fe,we),j=Fe,ee=we)):ce(n.POLYGON_OFFSET_FILL)}function me(Y){Y?W(n.SCISSOR_TEST):ce(n.SCISSOR_TEST)}function ue(Y){Y===void 0&&(Y=n.TEXTURE0+Q-1),$!==Y&&(n.activeTexture(Y),$=Y)}function ge(Y,Fe,we){we===void 0&&($===null?we=n.TEXTURE0+Q-1:we=$);let ze=le[we];ze===void 0&&(ze={type:void 0,texture:void 0},le[we]=ze),(ze.type!==Y||ze.texture!==Fe)&&($!==we&&(n.activeTexture(we),$=we),n.bindTexture(Y,Fe||fe[Y]),ze.type=Y,ze.texture=Fe)}function A(){const Y=le[$];Y!==void 0&&Y.type!==void 0&&(n.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0)}function S(){try{n.compressedTexImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function G(){try{n.compressedTexImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function se(){try{n.texSubImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function de(){try{n.texSubImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ne(){try{n.compressedTexSubImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Ne(){try{n.compressedTexSubImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function be(){try{n.texStorage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function ke(){try{n.texStorage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function We(){try{n.texImage2D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Se(){try{n.texImage3D(...arguments)}catch(Y){gt("WebGLState:",Y)}}function Ce(Y){Te.equals(Y)===!1&&(n.scissor(Y.x,Y.y,Y.z,Y.w),Te.copy(Y))}function Pe(Y){at.equals(Y)===!1&&(n.viewport(Y.x,Y.y,Y.z,Y.w),at.copy(Y))}function Oe(Y,Fe){let we=c.get(Fe);we===void 0&&(we=new WeakMap,c.set(Fe,we));let ze=we.get(Y);ze===void 0&&(ze=n.getUniformBlockIndex(Fe,Y.name),we.set(Y,ze))}function Ae(Y,Fe){const ze=c.get(Fe).get(Y);l.get(Fe)!==ze&&(n.uniformBlockBinding(Fe,ze,Y.__bindingPointIndex),l.set(Fe,ze))}function nt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),u={},$=null,le={},f={},h=new WeakMap,m=[],_=null,v=!1,g=null,p=null,b=null,y=null,M=null,T=null,C=null,w=new dt(0,0,0),R=0,x=!1,E=null,U=null,O=null,j=null,ee=null,Te.set(0,0,n.canvas.width,n.canvas.height),at.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:W,disable:ce,bindFramebuffer:pe,drawBuffers:he,useProgram:Le,setBlending:q,setMaterial:H,setFlipSided:D,setCullFace:X,setLineWidth:L,setPolygonOffset:ye,setScissorTest:me,activeTexture:ue,bindTexture:ge,unbindTexture:A,compressedTexImage2D:S,compressedTexImage3D:G,texImage2D:We,texImage3D:Se,updateUBOMapping:Oe,uniformBlockBinding:Ae,texStorage2D:be,texStorage3D:ke,texSubImage2D:se,texSubImage3D:de,compressedTexSubImage2D:ne,compressedTexSubImage3D:Ne,scissor:Ce,viewport:Pe,reset:nt}}function nN(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new vt,u=new WeakMap;let f;const h=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(A,S){return m?new OffscreenCanvas(A,S):Ma("canvas")}function v(A,S,G){let se=1;const de=ge(A);if((de.width>G||de.height>G)&&(se=G/Math.max(de.width,de.height)),se<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const ne=Math.floor(se*de.width),Ne=Math.floor(se*de.height);f===void 0&&(f=_(ne,Ne));const be=S?_(ne,Ne):f;return be.width=ne,be.height=Ne,be.getContext("2d").drawImage(A,0,0,ne,Ne),Ze("WebGLRenderer: Texture has been resized from ("+de.width+"x"+de.height+") to ("+ne+"x"+Ne+")."),be}else return"data"in A&&Ze("WebGLRenderer: Image in DataTexture is too big ("+de.width+"x"+de.height+")."),A;return A}function g(A){return A.generateMipmaps}function p(A){n.generateMipmap(A)}function b(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(A,S,G,se,de=!1){if(A!==null){if(n[A]!==void 0)return n[A];Ze("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ne=S;if(S===n.RED&&(G===n.FLOAT&&(ne=n.R32F),G===n.HALF_FLOAT&&(ne=n.R16F),G===n.UNSIGNED_BYTE&&(ne=n.R8)),S===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&(ne=n.R8UI),G===n.UNSIGNED_SHORT&&(ne=n.R16UI),G===n.UNSIGNED_INT&&(ne=n.R32UI),G===n.BYTE&&(ne=n.R8I),G===n.SHORT&&(ne=n.R16I),G===n.INT&&(ne=n.R32I)),S===n.RG&&(G===n.FLOAT&&(ne=n.RG32F),G===n.HALF_FLOAT&&(ne=n.RG16F),G===n.UNSIGNED_BYTE&&(ne=n.RG8)),S===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&(ne=n.RG8UI),G===n.UNSIGNED_SHORT&&(ne=n.RG16UI),G===n.UNSIGNED_INT&&(ne=n.RG32UI),G===n.BYTE&&(ne=n.RG8I),G===n.SHORT&&(ne=n.RG16I),G===n.INT&&(ne=n.RG32I)),S===n.RGB_INTEGER&&(G===n.UNSIGNED_BYTE&&(ne=n.RGB8UI),G===n.UNSIGNED_SHORT&&(ne=n.RGB16UI),G===n.UNSIGNED_INT&&(ne=n.RGB32UI),G===n.BYTE&&(ne=n.RGB8I),G===n.SHORT&&(ne=n.RGB16I),G===n.INT&&(ne=n.RGB32I)),S===n.RGBA_INTEGER&&(G===n.UNSIGNED_BYTE&&(ne=n.RGBA8UI),G===n.UNSIGNED_SHORT&&(ne=n.RGBA16UI),G===n.UNSIGNED_INT&&(ne=n.RGBA32UI),G===n.BYTE&&(ne=n.RGBA8I),G===n.SHORT&&(ne=n.RGBA16I),G===n.INT&&(ne=n.RGBA32I)),S===n.RGB&&(G===n.UNSIGNED_INT_5_9_9_9_REV&&(ne=n.RGB9_E5),G===n.UNSIGNED_INT_10F_11F_11F_REV&&(ne=n.R11F_G11F_B10F)),S===n.RGBA){const Ne=de?Sa:ht.getTransfer(se);G===n.FLOAT&&(ne=n.RGBA32F),G===n.HALF_FLOAT&&(ne=n.RGBA16F),G===n.UNSIGNED_BYTE&&(ne=Ne===bt?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT_4_4_4_4&&(ne=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&(ne=n.RGB5_A1)}return(ne===n.R16F||ne===n.R32F||ne===n.RG16F||ne===n.RG32F||ne===n.RGBA16F||ne===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function M(A,S){let G;return A?S===null||S===di||S===no?G=n.DEPTH24_STENCIL8:S===si?G=n.DEPTH32F_STENCIL8:S===to&&(G=n.DEPTH24_STENCIL8,Ze("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===di||S===no?G=n.DEPTH_COMPONENT24:S===si?G=n.DEPTH_COMPONENT32F:S===to&&(G=n.DEPTH_COMPONENT16),G}function T(A,S){return g(A)===!0||A.isFramebufferTexture&&A.minFilter!==Zt&&A.minFilter!==on?Math.log2(Math.max(S.width,S.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?S.mipmaps.length:1}function C(A){const S=A.target;S.removeEventListener("dispose",C),R(S),S.isVideoTexture&&u.delete(S)}function w(A){const S=A.target;S.removeEventListener("dispose",w),E(S)}function R(A){const S=i.get(A);if(S.__webglInit===void 0)return;const G=A.source,se=h.get(G);if(se){const de=se[S.__cacheKey];de.usedTimes--,de.usedTimes===0&&x(A),Object.keys(se).length===0&&h.delete(G)}i.remove(A)}function x(A){const S=i.get(A);n.deleteTexture(S.__webglTexture);const G=A.source,se=h.get(G);delete se[S.__cacheKey],o.memory.textures--}function E(A){const S=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let se=0;se<6;se++){if(Array.isArray(S.__webglFramebuffer[se]))for(let de=0;de<S.__webglFramebuffer[se].length;de++)n.deleteFramebuffer(S.__webglFramebuffer[se][de]);else n.deleteFramebuffer(S.__webglFramebuffer[se]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[se])}else{if(Array.isArray(S.__webglFramebuffer))for(let se=0;se<S.__webglFramebuffer.length;se++)n.deleteFramebuffer(S.__webglFramebuffer[se]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let se=0;se<S.__webglColorRenderbuffer.length;se++)S.__webglColorRenderbuffer[se]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[se]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const G=A.textures;for(let se=0,de=G.length;se<de;se++){const ne=i.get(G[se]);ne.__webglTexture&&(n.deleteTexture(ne.__webglTexture),o.memory.textures--),i.remove(G[se])}i.remove(A)}let U=0;function O(){U=0}function j(){const A=U;return A>=s.maxTextures&&Ze("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),U+=1,A}function ee(A){const S=[];return S.push(A.wrapS),S.push(A.wrapT),S.push(A.wrapR||0),S.push(A.magFilter),S.push(A.minFilter),S.push(A.anisotropy),S.push(A.internalFormat),S.push(A.format),S.push(A.type),S.push(A.generateMipmaps),S.push(A.premultiplyAlpha),S.push(A.flipY),S.push(A.unpackAlignment),S.push(A.colorSpace),S.join()}function Q(A,S){const G=i.get(A);if(A.isVideoTexture&&me(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&G.__version!==A.version){const se=A.image;if(se===null)Ze("WebGLRenderer: Texture marked for update but no image data found.");else if(se.complete===!1)Ze("WebGLRenderer: Texture marked for update but image is incomplete");else{fe(G,A,S);return}}else A.isExternalTexture&&(G.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+S)}function Z(A,S){const G=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){fe(G,A,S);return}else A.isExternalTexture&&(G.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+S)}function I(A,S){const G=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){fe(G,A,S);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+S)}function F(A,S){const G=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&G.__version!==A.version){W(G,A,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+S)}const $={[Tc]:n.REPEAT,[Ai]:n.CLAMP_TO_EDGE,[Ac]:n.MIRRORED_REPEAT},le={[Zt]:n.NEAREST,[b3]:n.NEAREST_MIPMAP_NEAREST,[Ro]:n.NEAREST_MIPMAP_LINEAR,[on]:n.LINEAR,[ml]:n.LINEAR_MIPMAP_NEAREST,[bs]:n.LINEAR_MIPMAP_LINEAR},re={[w3]:n.NEVER,[P3]:n.ALWAYS,[T3]:n.LESS,[zu]:n.LEQUAL,[A3]:n.EQUAL,[Hu]:n.GEQUAL,[C3]:n.GREATER,[R3]:n.NOTEQUAL};function xe(A,S){if(S.type===si&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===on||S.magFilter===ml||S.magFilter===Ro||S.magFilter===bs||S.minFilter===on||S.minFilter===ml||S.minFilter===Ro||S.minFilter===bs)&&Ze("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,$[S.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,$[S.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,$[S.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,le[S.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,le[S.minFilter]),S.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,re[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Zt||S.minFilter!==Ro&&S.minFilter!==bs||S.type===si&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function Te(A,S){let G=!1;A.__webglInit===void 0&&(A.__webglInit=!0,S.addEventListener("dispose",C));const se=S.source;let de=h.get(se);de===void 0&&(de={},h.set(se,de));const ne=ee(S);if(ne!==A.__cacheKey){de[ne]===void 0&&(de[ne]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,G=!0),de[ne].usedTimes++;const Ne=de[A.__cacheKey];Ne!==void 0&&(de[A.__cacheKey].usedTimes--,Ne.usedTimes===0&&x(S)),A.__cacheKey=ne,A.__webglTexture=de[ne].texture}return G}function at(A,S,G){return Math.floor(Math.floor(A/G)/S)}function st(A,S,G,se){const ne=A.updateRanges;if(ne.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,S.width,S.height,G,se,S.data);else{ne.sort((Se,Ce)=>Se.start-Ce.start);let Ne=0;for(let Se=1;Se<ne.length;Se++){const Ce=ne[Ne],Pe=ne[Se],Oe=Ce.start+Ce.count,Ae=at(Pe.start,S.width,4),nt=at(Ce.start,S.width,4);Pe.start<=Oe+1&&Ae===nt&&at(Pe.start+Pe.count-1,S.width,4)===Ae?Ce.count=Math.max(Ce.count,Pe.start+Pe.count-Ce.start):(++Ne,ne[Ne]=Pe)}ne.length=Ne+1;const be=n.getParameter(n.UNPACK_ROW_LENGTH),ke=n.getParameter(n.UNPACK_SKIP_PIXELS),We=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,S.width);for(let Se=0,Ce=ne.length;Se<Ce;Se++){const Pe=ne[Se],Oe=Math.floor(Pe.start/4),Ae=Math.ceil(Pe.count/4),nt=Oe%S.width,Y=Math.floor(Oe/S.width),Fe=Ae,we=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,nt),n.pixelStorei(n.UNPACK_SKIP_ROWS,Y),t.texSubImage2D(n.TEXTURE_2D,0,nt,Y,Fe,we,G,se,S.data)}A.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,be),n.pixelStorei(n.UNPACK_SKIP_PIXELS,ke),n.pixelStorei(n.UNPACK_SKIP_ROWS,We)}}function fe(A,S,G){let se=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(se=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(se=n.TEXTURE_3D);const de=Te(A,S),ne=S.source;t.bindTexture(se,A.__webglTexture,n.TEXTURE0+G);const Ne=i.get(ne);if(ne.version!==Ne.__version||de===!0){t.activeTexture(n.TEXTURE0+G);const be=ht.getPrimaries(ht.workingColorSpace),ke=S.colorSpace===Zi?null:ht.getPrimaries(S.colorSpace),We=S.colorSpace===Zi||be===ke?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,We);let Se=v(S.image,!1,s.maxTextureSize);Se=ue(S,Se);const Ce=r.convert(S.format,S.colorSpace),Pe=r.convert(S.type);let Oe=y(S.internalFormat,Ce,Pe,S.colorSpace,S.isVideoTexture);xe(se,S);let Ae;const nt=S.mipmaps,Y=S.isVideoTexture!==!0,Fe=Ne.__version===void 0||de===!0,we=ne.dataReady,ze=T(S,Se);if(S.isDepthTexture)Oe=M(S.format===Ms,S.type),Fe&&(Y?t.texStorage2D(n.TEXTURE_2D,1,Oe,Se.width,Se.height):t.texImage2D(n.TEXTURE_2D,0,Oe,Se.width,Se.height,0,Ce,Pe,null));else if(S.isDataTexture)if(nt.length>0){Y&&Fe&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,nt[0].width,nt[0].height);for(let Me=0,_e=nt.length;Me<_e;Me++)Ae=nt[Me],Y?we&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,Ae.width,Ae.height,Ce,Pe,Ae.data):t.texImage2D(n.TEXTURE_2D,Me,Oe,Ae.width,Ae.height,0,Ce,Pe,Ae.data);S.generateMipmaps=!1}else Y?(Fe&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,Se.width,Se.height),we&&st(S,Se,Ce,Pe)):t.texImage2D(n.TEXTURE_2D,0,Oe,Se.width,Se.height,0,Ce,Pe,Se.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Y&&Fe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ze,Oe,nt[0].width,nt[0].height,Se.depth);for(let Me=0,_e=nt.length;Me<_e;Me++)if(Ae=nt[Me],S.format!==Gn)if(Ce!==null)if(Y){if(we)if(S.layerUpdates.size>0){const Re=Kf(Ae.width,Ae.height,S.format,S.type);for(const Je of S.layerUpdates){const Rt=Ae.data.subarray(Je*Re/Ae.data.BYTES_PER_ELEMENT,(Je+1)*Re/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,Je,Ae.width,Ae.height,1,Ce,Rt)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,0,Ae.width,Ae.height,Se.depth,Ce,Ae.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Me,Oe,Ae.width,Ae.height,Se.depth,0,Ae.data,0,0);else Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Y?we&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Me,0,0,0,Ae.width,Ae.height,Se.depth,Ce,Pe,Ae.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Me,Oe,Ae.width,Ae.height,Se.depth,0,Ce,Pe,Ae.data)}else{Y&&Fe&&t.texStorage2D(n.TEXTURE_2D,ze,Oe,nt[0].width,nt[0].height);for(let Me=0,_e=nt.length;Me<_e;Me++)Ae=nt[Me],S.format!==Gn?Ce!==null?Y?we&&t.compressedTexSubImage2D(n.TEXTURE_2D,Me,0,0,Ae.width,Ae.height,Ce,Ae.data):t.compressedTexImage2D(n.TEXTURE_2D,Me,Oe,Ae.width,Ae.height,0,Ae.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Y?we&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,Ae.width,Ae.height,Ce,Pe,Ae.data):t.texImage2D(n.TEXTURE_2D,Me,Oe,Ae.width,Ae.height,0,Ce,Pe,Ae.data)}else if(S.isDataArrayTexture)if(Y){if(Fe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ze,Oe,Se.width,Se.height,Se.depth),we)if(S.layerUpdates.size>0){const Me=Kf(Se.width,Se.height,S.format,S.type);for(const _e of S.layerUpdates){const Re=Se.data.subarray(_e*Me/Se.data.BYTES_PER_ELEMENT,(_e+1)*Me/Se.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,_e,Se.width,Se.height,1,Ce,Pe,Re)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Se.width,Se.height,Se.depth,Ce,Pe,Se.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Oe,Se.width,Se.height,Se.depth,0,Ce,Pe,Se.data);else if(S.isData3DTexture)Y?(Fe&&t.texStorage3D(n.TEXTURE_3D,ze,Oe,Se.width,Se.height,Se.depth),we&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Se.width,Se.height,Se.depth,Ce,Pe,Se.data)):t.texImage3D(n.TEXTURE_3D,0,Oe,Se.width,Se.height,Se.depth,0,Ce,Pe,Se.data);else if(S.isFramebufferTexture){if(Fe)if(Y)t.texStorage2D(n.TEXTURE_2D,ze,Oe,Se.width,Se.height);else{let Me=Se.width,_e=Se.height;for(let Re=0;Re<ze;Re++)t.texImage2D(n.TEXTURE_2D,Re,Oe,Me,_e,0,Ce,Pe,null),Me>>=1,_e>>=1}}else if(nt.length>0){if(Y&&Fe){const Me=ge(nt[0]);t.texStorage2D(n.TEXTURE_2D,ze,Oe,Me.width,Me.height)}for(let Me=0,_e=nt.length;Me<_e;Me++)Ae=nt[Me],Y?we&&t.texSubImage2D(n.TEXTURE_2D,Me,0,0,Ce,Pe,Ae):t.texImage2D(n.TEXTURE_2D,Me,Oe,Ce,Pe,Ae);S.generateMipmaps=!1}else if(Y){if(Fe){const Me=ge(Se);t.texStorage2D(n.TEXTURE_2D,ze,Oe,Me.width,Me.height)}we&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ce,Pe,Se)}else t.texImage2D(n.TEXTURE_2D,0,Oe,Ce,Pe,Se);g(S)&&p(se),Ne.__version=ne.version,S.onUpdate&&S.onUpdate(S)}A.__version=S.version}function W(A,S,G){if(S.image.length!==6)return;const se=Te(A,S),de=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+G);const ne=i.get(de);if(de.version!==ne.__version||se===!0){t.activeTexture(n.TEXTURE0+G);const Ne=ht.getPrimaries(ht.workingColorSpace),be=S.colorSpace===Zi?null:ht.getPrimaries(S.colorSpace),ke=S.colorSpace===Zi||Ne===be?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ke);const We=S.isCompressedTexture||S.image[0].isCompressedTexture,Se=S.image[0]&&S.image[0].isDataTexture,Ce=[];for(let _e=0;_e<6;_e++)!We&&!Se?Ce[_e]=v(S.image[_e],!0,s.maxCubemapSize):Ce[_e]=Se?S.image[_e].image:S.image[_e],Ce[_e]=ue(S,Ce[_e]);const Pe=Ce[0],Oe=r.convert(S.format,S.colorSpace),Ae=r.convert(S.type),nt=y(S.internalFormat,Oe,Ae,S.colorSpace),Y=S.isVideoTexture!==!0,Fe=ne.__version===void 0||se===!0,we=de.dataReady;let ze=T(S,Pe);xe(n.TEXTURE_CUBE_MAP,S);let Me;if(We){Y&&Fe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ze,nt,Pe.width,Pe.height);for(let _e=0;_e<6;_e++){Me=Ce[_e].mipmaps;for(let Re=0;Re<Me.length;Re++){const Je=Me[Re];S.format!==Gn?Oe!==null?Y?we&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re,0,0,Je.width,Je.height,Oe,Je.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re,nt,Je.width,Je.height,0,Je.data):Ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Y?we&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re,0,0,Je.width,Je.height,Oe,Ae,Je.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re,nt,Je.width,Je.height,0,Oe,Ae,Je.data)}}}else{if(Me=S.mipmaps,Y&&Fe){Me.length>0&&ze++;const _e=ge(Ce[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ze,nt,_e.width,_e.height)}for(let _e=0;_e<6;_e++)if(Se){Y?we&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,Ce[_e].width,Ce[_e].height,Oe,Ae,Ce[_e].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,nt,Ce[_e].width,Ce[_e].height,0,Oe,Ae,Ce[_e].data);for(let Re=0;Re<Me.length;Re++){const Rt=Me[Re].image[_e].image;Y?we&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re+1,0,0,Rt.width,Rt.height,Oe,Ae,Rt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re+1,nt,Rt.width,Rt.height,0,Oe,Ae,Rt.data)}}else{Y?we&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,Oe,Ae,Ce[_e]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,nt,Oe,Ae,Ce[_e]);for(let Re=0;Re<Me.length;Re++){const Je=Me[Re];Y?we&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re+1,0,0,Oe,Ae,Je.image[_e]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+_e,Re+1,nt,Oe,Ae,Je.image[_e])}}}g(S)&&p(n.TEXTURE_CUBE_MAP),ne.__version=de.version,S.onUpdate&&S.onUpdate(S)}A.__version=S.version}function ce(A,S,G,se,de,ne){const Ne=r.convert(G.format,G.colorSpace),be=r.convert(G.type),ke=y(G.internalFormat,Ne,be,G.colorSpace),We=i.get(S),Se=i.get(G);if(Se.__renderTarget=S,!We.__hasExternalTextures){const Ce=Math.max(1,S.width>>ne),Pe=Math.max(1,S.height>>ne);de===n.TEXTURE_3D||de===n.TEXTURE_2D_ARRAY?t.texImage3D(de,ne,ke,Ce,Pe,S.depth,0,Ne,be,null):t.texImage2D(de,ne,ke,Ce,Pe,0,Ne,be,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),ye(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,se,de,Se.__webglTexture,0,L(S)):(de===n.TEXTURE_2D||de>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&de<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,se,de,Se.__webglTexture,ne),t.bindFramebuffer(n.FRAMEBUFFER,null)}function pe(A,S,G){if(n.bindRenderbuffer(n.RENDERBUFFER,A),S.depthBuffer){const se=S.depthTexture,de=se&&se.isDepthTexture?se.type:null,ne=M(S.stencilBuffer,de),Ne=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;ye(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(S),ne,S.width,S.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(S),ne,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ne,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ne,n.RENDERBUFFER,A)}else{const se=S.textures;for(let de=0;de<se.length;de++){const ne=se[de],Ne=r.convert(ne.format,ne.colorSpace),be=r.convert(ne.type),ke=y(ne.internalFormat,Ne,be,ne.colorSpace);ye(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,L(S),ke,S.width,S.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,L(S),ke,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,ke,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function he(A,S,G){const se=S.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const de=i.get(S.depthTexture);if(de.__renderTarget=S,(!de.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),se){if(de.__webglInit===void 0&&(de.__webglInit=!0,S.depthTexture.addEventListener("dispose",C)),de.__webglTexture===void 0){de.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,de.__webglTexture),xe(n.TEXTURE_CUBE_MAP,S.depthTexture);const We=r.convert(S.depthTexture.format),Se=r.convert(S.depthTexture.type);let Ce;S.depthTexture.format===Ui?Ce=n.DEPTH_COMPONENT24:S.depthTexture.format===Ms&&(Ce=n.DEPTH24_STENCIL8);for(let Pe=0;Pe<6;Pe++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,Ce,S.width,S.height,0,We,Se,null)}}else Q(S.depthTexture,0);const ne=de.__webglTexture,Ne=L(S),be=se?n.TEXTURE_CUBE_MAP_POSITIVE_X+G:n.TEXTURE_2D,ke=S.depthTexture.format===Ms?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(S.depthTexture.format===Ui)ye(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ke,be,ne,0,Ne):n.framebufferTexture2D(n.FRAMEBUFFER,ke,be,ne,0);else if(S.depthTexture.format===Ms)ye(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ke,be,ne,0,Ne):n.framebufferTexture2D(n.FRAMEBUFFER,ke,be,ne,0);else throw new Error("Unknown depthTexture format")}function Le(A){const S=i.get(A),G=A.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==A.depthTexture){const se=A.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),se){const de=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,se.removeEventListener("dispose",de)};se.addEventListener("dispose",de),S.__depthDisposeCallback=de}S.__boundDepthTexture=se}if(A.depthTexture&&!S.__autoAllocateDepthBuffer)if(G)for(let se=0;se<6;se++)he(S.__webglFramebuffer[se],A,se);else{const se=A.texture.mipmaps;se&&se.length>0?he(S.__webglFramebuffer[0],A,0):he(S.__webglFramebuffer,A,0)}else if(G){S.__webglDepthbuffer=[];for(let se=0;se<6;se++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[se]),S.__webglDepthbuffer[se]===void 0)S.__webglDepthbuffer[se]=n.createRenderbuffer(),pe(S.__webglDepthbuffer[se],A,!1);else{const de=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=S.__webglDepthbuffer[se];n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ne)}}else{const se=A.texture.mipmaps;if(se&&se.length>0?t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),pe(S.__webglDepthbuffer,A,!1);else{const de=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,de,n.RENDERBUFFER,ne)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function k(A,S,G){const se=i.get(A);S!==void 0&&ce(se.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&Le(A)}function z(A){const S=A.texture,G=i.get(A),se=i.get(S);A.addEventListener("dispose",w);const de=A.textures,ne=A.isWebGLCubeRenderTarget===!0,Ne=de.length>1;if(Ne||(se.__webglTexture===void 0&&(se.__webglTexture=n.createTexture()),se.__version=S.version,o.memory.textures++),ne){G.__webglFramebuffer=[];for(let be=0;be<6;be++)if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer[be]=[];for(let ke=0;ke<S.mipmaps.length;ke++)G.__webglFramebuffer[be][ke]=n.createFramebuffer()}else G.__webglFramebuffer[be]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer=[];for(let be=0;be<S.mipmaps.length;be++)G.__webglFramebuffer[be]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(Ne)for(let be=0,ke=de.length;be<ke;be++){const We=i.get(de[be]);We.__webglTexture===void 0&&(We.__webglTexture=n.createTexture(),o.memory.textures++)}if(A.samples>0&&ye(A)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let be=0;be<de.length;be++){const ke=de[be];G.__webglColorRenderbuffer[be]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[be]);const We=r.convert(ke.format,ke.colorSpace),Se=r.convert(ke.type),Ce=y(ke.internalFormat,We,Se,ke.colorSpace,A.isXRRenderTarget===!0),Pe=L(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Pe,Ce,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+be,n.RENDERBUFFER,G.__webglColorRenderbuffer[be])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),pe(G.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ne){t.bindTexture(n.TEXTURE_CUBE_MAP,se.__webglTexture),xe(n.TEXTURE_CUBE_MAP,S);for(let be=0;be<6;be++)if(S.mipmaps&&S.mipmaps.length>0)for(let ke=0;ke<S.mipmaps.length;ke++)ce(G.__webglFramebuffer[be][ke],A,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,ke);else ce(G.__webglFramebuffer[be],A,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+be,0);g(S)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ne){for(let be=0,ke=de.length;be<ke;be++){const We=de[be],Se=i.get(We);let Ce=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Ce=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ce,Se.__webglTexture),xe(Ce,We),ce(G.__webglFramebuffer,A,We,n.COLOR_ATTACHMENT0+be,Ce,0),g(We)&&p(Ce)}t.unbindTexture()}else{let be=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(be=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(be,se.__webglTexture),xe(be,S),S.mipmaps&&S.mipmaps.length>0)for(let ke=0;ke<S.mipmaps.length;ke++)ce(G.__webglFramebuffer[ke],A,S,n.COLOR_ATTACHMENT0,be,ke);else ce(G.__webglFramebuffer,A,S,n.COLOR_ATTACHMENT0,be,0);g(S)&&p(be),t.unbindTexture()}A.depthBuffer&&Le(A)}function q(A){const S=A.textures;for(let G=0,se=S.length;G<se;G++){const de=S[G];if(g(de)){const ne=b(A),Ne=i.get(de).__webglTexture;t.bindTexture(ne,Ne),p(ne),t.unbindTexture()}}}const H=[],D=[];function X(A){if(A.samples>0){if(ye(A)===!1){const S=A.textures,G=A.width,se=A.height;let de=n.COLOR_BUFFER_BIT;const ne=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ne=i.get(A),be=S.length>1;if(be)for(let We=0;We<S.length;We++)t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer);const ke=A.texture.mipmaps;ke&&ke.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer);for(let We=0;We<S.length;We++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(de|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(de|=n.STENCIL_BUFFER_BIT)),be){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ne.__webglColorRenderbuffer[We]);const Se=i.get(S[We]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Se,0)}n.blitFramebuffer(0,0,G,se,0,0,G,se,de,n.NEAREST),l===!0&&(H.length=0,D.length=0,H.push(n.COLOR_ATTACHMENT0+We),A.depthBuffer&&A.resolveDepthBuffer===!1&&(H.push(ne),D.push(ne),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,D)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,H))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),be)for(let We=0;We<S.length;We++){t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.RENDERBUFFER,Ne.__webglColorRenderbuffer[We]);const Se=i.get(S[We]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+We,n.TEXTURE_2D,Se,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const S=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function L(A){return Math.min(s.maxSamples,A.samples)}function ye(A){const S=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function me(A){const S=o.render.frame;u.get(A)!==S&&(u.set(A,S),A.update())}function ue(A,S){const G=A.colorSpace,se=A.format,de=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||G!==fr&&G!==Zi&&(ht.getTransfer(G)===bt?(se!==Gn||de!==Mn)&&Ze("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):gt("WebGLTextures: Unsupported texture color space:",G)),S}function ge(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=j,this.resetTextureUnits=O,this.setTexture2D=Q,this.setTexture2DArray=Z,this.setTexture3D=I,this.setTextureCube=F,this.rebindTextures=k,this.setupRenderTarget=z,this.updateRenderTargetMipmap=q,this.updateMultisampleRenderTarget=X,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=ce,this.useMultisampledRTT=ye,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function iN(n,e){function t(i,s=Zi){let r;const o=ht.getTransfer(s);if(i===Mn)return n.UNSIGNED_BYTE;if(i===Fu)return n.UNSIGNED_SHORT_4_4_4_4;if(i===ku)return n.UNSIGNED_SHORT_5_5_5_1;if(i===xm)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===ym)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===vm)return n.BYTE;if(i===_m)return n.SHORT;if(i===to)return n.UNSIGNED_SHORT;if(i===Uu)return n.INT;if(i===di)return n.UNSIGNED_INT;if(i===si)return n.FLOAT;if(i===Ni)return n.HALF_FLOAT;if(i===Sm)return n.ALPHA;if(i===bm)return n.RGB;if(i===Gn)return n.RGBA;if(i===Ui)return n.DEPTH_COMPONENT;if(i===Ms)return n.DEPTH_STENCIL;if(i===Mm)return n.RED;if(i===Ou)return n.RED_INTEGER;if(i===dr)return n.RG;if(i===Bu)return n.RG_INTEGER;if(i===Vu)return n.RGBA_INTEGER;if(i===oa||i===aa||i===la||i===ca)if(o===bt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===oa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===la)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===oa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===aa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===la)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ca)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Cc||i===Rc||i===Pc||i===Ic)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Cc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Rc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Pc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ic)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Dc||i===Lc||i===Nc||i===Uc||i===Fc||i===kc||i===Oc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Dc||i===Lc)return o===bt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Nc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Uc)return r.COMPRESSED_R11_EAC;if(i===Fc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===kc)return r.COMPRESSED_RG11_EAC;if(i===Oc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Bc||i===Vc||i===zc||i===Hc||i===Gc||i===$c||i===Wc||i===Xc||i===qc||i===jc||i===Yc||i===Kc||i===Zc||i===Jc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Bc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Vc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===zc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Hc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Gc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===$c)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Wc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Xc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===qc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===jc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Yc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Kc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Zc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Jc)return o===bt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Qc||i===eu||i===tu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Qc)return o===bt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===eu)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===tu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===nu||i===iu||i===su||i===ru)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===nu)return r.COMPRESSED_RED_RGTC1_EXT;if(i===iu)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===su)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ru)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===no?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const sN=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rN=`
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

}`;class oN{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Om(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new hi({vertexShader:sN,fragmentShader:rN,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new wn(new go(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class aN extends mr{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,f=null,h=null,m=null,_=null;const v=typeof XRWebGLBinding<"u",g=new oN,p={},b=t.getContextAttributes();let y=null,M=null;const T=[],C=[],w=new vt;let R=null;const x=new Ln;x.viewport=new Vt;const E=new Ln;E.viewport=new Vt;const U=[x,E],O=new vP;let j=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(fe){let W=T[fe];return W===void 0&&(W=new Ol,T[fe]=W),W.getTargetRaySpace()},this.getControllerGrip=function(fe){let W=T[fe];return W===void 0&&(W=new Ol,T[fe]=W),W.getGripSpace()},this.getHand=function(fe){let W=T[fe];return W===void 0&&(W=new Ol,T[fe]=W),W.getHandSpace()};function Q(fe){const W=C.indexOf(fe.inputSource);if(W===-1)return;const ce=T[W];ce!==void 0&&(ce.update(fe.inputSource,fe.frame,c||o),ce.dispatchEvent({type:fe.type,data:fe.inputSource}))}function Z(){s.removeEventListener("select",Q),s.removeEventListener("selectstart",Q),s.removeEventListener("selectend",Q),s.removeEventListener("squeeze",Q),s.removeEventListener("squeezestart",Q),s.removeEventListener("squeezeend",Q),s.removeEventListener("end",Z),s.removeEventListener("inputsourceschange",I);for(let fe=0;fe<T.length;fe++){const W=C[fe];W!==null&&(C[fe]=null,T[fe].disconnect(W))}j=null,ee=null,g.reset();for(const fe in p)delete p[fe];e.setRenderTarget(y),m=null,h=null,f=null,s=null,M=null,st.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(fe){r=fe,i.isPresenting===!0&&Ze("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(fe){a=fe,i.isPresenting===!0&&Ze("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(fe){c=fe},this.getBaseLayer=function(){return h!==null?h:m},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(fe){if(s=fe,s!==null){if(y=e.getRenderTarget(),s.addEventListener("select",Q),s.addEventListener("selectstart",Q),s.addEventListener("selectend",Q),s.addEventListener("squeeze",Q),s.addEventListener("squeezestart",Q),s.addEventListener("squeezeend",Q),s.addEventListener("end",Z),s.addEventListener("inputsourceschange",I),b.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ce=null,pe=null,he=null;b.depth&&(he=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ce=b.stencil?Ms:Ui,pe=b.stencil?no:di);const Le={colorFormat:t.RGBA8,depthFormat:he,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Le),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new li(h.textureWidth,h.textureHeight,{format:Gn,type:Mn,depthTexture:new so(h.textureWidth,h.textureHeight,pe,void 0,void 0,void 0,void 0,void 0,void 0,ce),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ce={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,ce),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),M=new li(m.framebufferWidth,m.framebufferHeight,{format:Gn,type:Mn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),st.setContext(s),st.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function I(fe){for(let W=0;W<fe.removed.length;W++){const ce=fe.removed[W],pe=C.indexOf(ce);pe>=0&&(C[pe]=null,T[pe].disconnect(ce))}for(let W=0;W<fe.added.length;W++){const ce=fe.added[W];let pe=C.indexOf(ce);if(pe===-1){for(let Le=0;Le<T.length;Le++)if(Le>=C.length){C.push(ce),pe=Le;break}else if(C[Le]===null){C[Le]=ce,pe=Le;break}if(pe===-1)break}const he=T[pe];he&&he.connect(ce)}}const F=new ie,$=new ie;function le(fe,W,ce){F.setFromMatrixPosition(W.matrixWorld),$.setFromMatrixPosition(ce.matrixWorld);const pe=F.distanceTo($),he=W.projectionMatrix.elements,Le=ce.projectionMatrix.elements,k=he[14]/(he[10]-1),z=he[14]/(he[10]+1),q=(he[9]+1)/he[5],H=(he[9]-1)/he[5],D=(he[8]-1)/he[0],X=(Le[8]+1)/Le[0],L=k*D,ye=k*X,me=pe/(-D+X),ue=me*-D;if(W.matrixWorld.decompose(fe.position,fe.quaternion,fe.scale),fe.translateX(ue),fe.translateZ(me),fe.matrixWorld.compose(fe.position,fe.quaternion,fe.scale),fe.matrixWorldInverse.copy(fe.matrixWorld).invert(),he[10]===-1)fe.projectionMatrix.copy(W.projectionMatrix),fe.projectionMatrixInverse.copy(W.projectionMatrixInverse);else{const ge=k+me,A=z+me,S=L-ue,G=ye+(pe-ue),se=q*z/A*ge,de=H*z/A*ge;fe.projectionMatrix.makePerspective(S,G,se,de,ge,A),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert()}}function re(fe,W){W===null?fe.matrixWorld.copy(fe.matrix):fe.matrixWorld.multiplyMatrices(W.matrixWorld,fe.matrix),fe.matrixWorldInverse.copy(fe.matrixWorld).invert()}this.updateCamera=function(fe){if(s===null)return;let W=fe.near,ce=fe.far;g.texture!==null&&(g.depthNear>0&&(W=g.depthNear),g.depthFar>0&&(ce=g.depthFar)),O.near=E.near=x.near=W,O.far=E.far=x.far=ce,(j!==O.near||ee!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),j=O.near,ee=O.far),O.layers.mask=fe.layers.mask|6,x.layers.mask=O.layers.mask&3,E.layers.mask=O.layers.mask&5;const pe=fe.parent,he=O.cameras;re(O,pe);for(let Le=0;Le<he.length;Le++)re(he[Le],pe);he.length===2?le(O,x,E):O.projectionMatrix.copy(x.projectionMatrix),xe(fe,O,pe)};function xe(fe,W,ce){ce===null?fe.matrix.copy(W.matrixWorld):(fe.matrix.copy(ce.matrixWorld),fe.matrix.invert(),fe.matrix.multiply(W.matrixWorld)),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.updateMatrixWorld(!0),fe.projectionMatrix.copy(W.projectionMatrix),fe.projectionMatrixInverse.copy(W.projectionMatrixInverse),fe.isPerspectiveCamera&&(fe.fov=ou*2*Math.atan(1/fe.projectionMatrix.elements[5]),fe.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(h===null&&m===null))return l},this.setFoveation=function(fe){l=fe,h!==null&&(h.fixedFoveation=fe),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=fe)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(fe){return p[fe]};let Te=null;function at(fe,W){if(u=W.getViewerPose(c||o),_=W,u!==null){const ce=u.views;m!==null&&(e.setRenderTargetFramebuffer(M,m.framebuffer),e.setRenderTarget(M));let pe=!1;ce.length!==O.cameras.length&&(O.cameras.length=0,pe=!0);for(let z=0;z<ce.length;z++){const q=ce[z];let H=null;if(m!==null)H=m.getViewport(q);else{const X=f.getViewSubImage(h,q);H=X.viewport,z===0&&(e.setRenderTargetTextures(M,X.colorTexture,X.depthStencilTexture),e.setRenderTarget(M))}let D=U[z];D===void 0&&(D=new Ln,D.layers.enable(z),D.viewport=new Vt,U[z]=D),D.matrix.fromArray(q.transform.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale),D.projectionMatrix.fromArray(q.projectionMatrix),D.projectionMatrixInverse.copy(D.projectionMatrix).invert(),D.viewport.set(H.x,H.y,H.width,H.height),z===0&&(O.matrix.copy(D.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),pe===!0&&O.cameras.push(D)}const he=s.enabledFeatures;if(he&&he.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=i.getBinding();const z=f.getDepthInformation(ce[0]);z&&z.isValid&&z.texture&&g.init(z,s.renderState)}if(he&&he.includes("camera-access")&&v){e.state.unbindTexture(),f=i.getBinding();for(let z=0;z<ce.length;z++){const q=ce[z].camera;if(q){let H=p[q];H||(H=new Om,p[q]=H);const D=f.getCameraImage(q);H.sourceTexture=D}}}}for(let ce=0;ce<T.length;ce++){const pe=C[ce],he=T[ce];pe!==null&&he!==void 0&&he.update(pe,W,c||o)}Te&&Te(fe,W),W.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:W}),_=null}const st=new Vm;st.setAnimationLoop(at),this.setAnimationLoop=function(fe){Te=fe},this.dispose=function(){}}}const ps=new fi,lN=new Nt;function cN(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,Lm(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,b,y,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),f(g,p)):p.isMeshPhongMaterial?(r(g,p),u(g,p)):p.isMeshStandardMaterial?(r(g,p),h(g,p),p.isMeshPhysicalMaterial&&m(g,p,M)):p.isMeshMatcapMaterial?(r(g,p),_(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),v(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,b,y):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===_n&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===_n&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);const b=e.get(p),y=b.envMap,M=b.envMapRotation;y&&(g.envMap.value=y,ps.copy(M),ps.x*=-1,ps.y*=-1,ps.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),g.envMapRotation.value.setFromMatrix4(lN.makeRotationFromEuler(ps)),g.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,b,y){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*b,g.scale.value=y*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function u(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function f(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function h(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function m(g,p,b){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===_n&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function _(g,p){p.matcap&&(g.matcap.value=p.matcap)}function v(g,p){const b=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function uN(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,y){const M=y.program;i.uniformBlockBinding(b,M)}function c(b,y){let M=s[b.id];M===void 0&&(_(b),M=u(b),s[b.id]=M,b.addEventListener("dispose",g));const T=y.program;i.updateUBOMapping(b,T);const C=e.render.frame;r[b.id]!==C&&(h(b),r[b.id]=C)}function u(b){const y=f();b.__bindingPointIndex=y;const M=n.createBuffer(),T=b.__size,C=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,T,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,M),M}function f(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return gt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){const y=s[b.id],M=b.uniforms,T=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let C=0,w=M.length;C<w;C++){const R=Array.isArray(M[C])?M[C]:[M[C]];for(let x=0,E=R.length;x<E;x++){const U=R[x];if(m(U,C,x,T)===!0){const O=U.__offset,j=Array.isArray(U.value)?U.value:[U.value];let ee=0;for(let Q=0;Q<j.length;Q++){const Z=j[Q],I=v(Z);typeof Z=="number"||typeof Z=="boolean"?(U.__data[0]=Z,n.bufferSubData(n.UNIFORM_BUFFER,O+ee,U.__data)):Z.isMatrix3?(U.__data[0]=Z.elements[0],U.__data[1]=Z.elements[1],U.__data[2]=Z.elements[2],U.__data[3]=0,U.__data[4]=Z.elements[3],U.__data[5]=Z.elements[4],U.__data[6]=Z.elements[5],U.__data[7]=0,U.__data[8]=Z.elements[6],U.__data[9]=Z.elements[7],U.__data[10]=Z.elements[8],U.__data[11]=0):(Z.toArray(U.__data,ee),ee+=I.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,U.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(b,y,M,T){const C=b.value,w=y+"_"+M;if(T[w]===void 0)return typeof C=="number"||typeof C=="boolean"?T[w]=C:T[w]=C.clone(),!0;{const R=T[w];if(typeof C=="number"||typeof C=="boolean"){if(R!==C)return T[w]=C,!0}else if(R.equals(C)===!1)return R.copy(C),!0}return!1}function _(b){const y=b.uniforms;let M=0;const T=16;for(let w=0,R=y.length;w<R;w++){const x=Array.isArray(y[w])?y[w]:[y[w]];for(let E=0,U=x.length;E<U;E++){const O=x[E],j=Array.isArray(O.value)?O.value:[O.value];for(let ee=0,Q=j.length;ee<Q;ee++){const Z=j[ee],I=v(Z),F=M%T,$=F%I.boundary,le=F+$;M+=$,le!==0&&T-le<I.storage&&(M+=T-le),O.__data=new Float32Array(I.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=M,M+=I.storage}}}const C=M%T;return C>0&&(M+=T-C),b.__size=M,b.__cache={},this}function v(b){const y={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(y.boundary=4,y.storage=4):b.isVector2?(y.boundary=8,y.storage=8):b.isVector3||b.isColor?(y.boundary=16,y.storage=12):b.isVector4?(y.boundary=16,y.storage=16):b.isMatrix3?(y.boundary=48,y.storage=48):b.isMatrix4?(y.boundary=64,y.storage=64):b.isTexture?Ze("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ze("WebGLRenderer: Unsupported uniform value type.",b),y}function g(b){const y=b.target;y.removeEventListener("dispose",g);const M=o.indexOf(y.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function p(){for(const b in s)n.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}const dN=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Jn=null;function fN(){return Jn===null&&(Jn=new sP(dN,16,16,dr,Ni),Jn.name="DFG_LUT",Jn.minFilter=on,Jn.magFilter=on,Jn.wrapS=Ai,Jn.wrapT=Ai,Jn.generateMipmaps=!1,Jn.needsUpdate=!0),Jn}class hN{constructor(e={}){const{canvas:t=I3(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:m=Mn}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=o;const v=m,g=new Set([Vu,Bu,Ou]),p=new Set([Mn,di,to,no,Fu,ku]),b=new Uint32Array(4),y=new Int32Array(4);let M=null,T=null;const C=[],w=[];let R=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ai,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const x=this;let E=!1;this._outputColorSpace=Dn;let U=0,O=0,j=null,ee=-1,Q=null;const Z=new Vt,I=new Vt;let F=null;const $=new dt(0);let le=0,re=t.width,xe=t.height,Te=1,at=null,st=null;const fe=new Vt(0,0,re,xe),W=new Vt(0,0,re,xe);let ce=!1;const pe=new Wu;let he=!1,Le=!1;const k=new Nt,z=new ie,q=new Vt,H={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let D=!1;function X(){return j===null?Te:1}let L=i;function ye(P,K){return t.getContext(P,K)}try{const P={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Lu}`),t.addEventListener("webglcontextlost",Je,!1),t.addEventListener("webglcontextrestored",Rt,!1),t.addEventListener("webglcontextcreationerror",yt,!1),L===null){const K="webgl2";if(L=ye(K,P),L===null)throw ye(K)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(P){throw gt("WebGLRenderer: "+P.message),P}let me,ue,ge,A,S,G,se,de,ne,Ne,be,ke,We,Se,Ce,Pe,Oe,Ae,nt,Y,Fe,we,ze,Me;function _e(){me=new fD(L),me.init(),we=new iN(L,me),ue=new iD(L,me,e,we),ge=new tN(L,me),ue.reversedDepthBuffer&&h&&ge.buffers.depth.setReversed(!0),A=new mD(L),S=new VL,G=new nN(L,me,ge,S,ue,we,A),se=new rD(x),de=new dD(x),ne=new xP(L),ze=new tD(L,ne),Ne=new hD(L,ne,A,ze),be=new vD(L,Ne,ne,A),nt=new gD(L,ue,G),Pe=new sD(S),ke=new BL(x,se,de,me,ue,ze,Pe),We=new cN(x,S),Se=new HL,Ce=new jL(me),Ae=new eD(x,se,de,ge,be,_,l),Oe=new QL(x,be,ue),Me=new uN(L,A,ue,ge),Y=new nD(L,me,A),Fe=new pD(L,me,A),A.programs=ke.programs,x.capabilities=ue,x.extensions=me,x.properties=S,x.renderLists=Se,x.shadowMap=Oe,x.state=ge,x.info=A}_e(),v!==Mn&&(R=new xD(v,t.width,t.height,s,r));const Re=new aN(x,L);this.xr=Re,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const P=me.get("WEBGL_lose_context");P&&P.loseContext()},this.forceContextRestore=function(){const P=me.get("WEBGL_lose_context");P&&P.restoreContext()},this.getPixelRatio=function(){return Te},this.setPixelRatio=function(P){P!==void 0&&(Te=P,this.setSize(re,xe,!1))},this.getSize=function(P){return P.set(re,xe)},this.setSize=function(P,K,ae=!0){if(Re.isPresenting){Ze("WebGLRenderer: Can't change size while VR device is presenting.");return}re=P,xe=K,t.width=Math.floor(P*Te),t.height=Math.floor(K*Te),ae===!0&&(t.style.width=P+"px",t.style.height=K+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,P,K)},this.getDrawingBufferSize=function(P){return P.set(re*Te,xe*Te).floor()},this.setDrawingBufferSize=function(P,K,ae){re=P,xe=K,Te=ae,t.width=Math.floor(P*ae),t.height=Math.floor(K*ae),this.setViewport(0,0,P,K)},this.setEffects=function(P){if(v===Mn){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(P){for(let K=0;K<P.length;K++)if(P[K].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(P||[])},this.getCurrentViewport=function(P){return P.copy(Z)},this.getViewport=function(P){return P.copy(fe)},this.setViewport=function(P,K,ae,oe){P.isVector4?fe.set(P.x,P.y,P.z,P.w):fe.set(P,K,ae,oe),ge.viewport(Z.copy(fe).multiplyScalar(Te).round())},this.getScissor=function(P){return P.copy(W)},this.setScissor=function(P,K,ae,oe){P.isVector4?W.set(P.x,P.y,P.z,P.w):W.set(P,K,ae,oe),ge.scissor(I.copy(W).multiplyScalar(Te).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(P){ge.setScissorTest(ce=P)},this.setOpaqueSort=function(P){at=P},this.setTransparentSort=function(P){st=P},this.getClearColor=function(P){return P.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor(...arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha(...arguments)},this.clear=function(P=!0,K=!0,ae=!0){let oe=0;if(P){let te=!1;if(j!==null){const Ie=j.texture.format;te=g.has(Ie)}if(te){const Ie=j.texture.type,He=p.has(Ie),Ue=Ae.getClearColor(),Ge=Ae.getClearAlpha(),Xe=Ue.r,Ke=Ue.g,je=Ue.b;He?(b[0]=Xe,b[1]=Ke,b[2]=je,b[3]=Ge,L.clearBufferuiv(L.COLOR,0,b)):(y[0]=Xe,y[1]=Ke,y[2]=je,y[3]=Ge,L.clearBufferiv(L.COLOR,0,y))}else oe|=L.COLOR_BUFFER_BIT}K&&(oe|=L.DEPTH_BUFFER_BIT),ae&&(oe|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(oe)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Je,!1),t.removeEventListener("webglcontextrestored",Rt,!1),t.removeEventListener("webglcontextcreationerror",yt,!1),Ae.dispose(),Se.dispose(),Ce.dispose(),S.dispose(),se.dispose(),de.dispose(),be.dispose(),ze.dispose(),Me.dispose(),ke.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",Zu),Re.removeEventListener("sessionend",Ju),is.stop()};function Je(P){P.preventDefault(),Rf("WebGLRenderer: Context Lost."),E=!0}function Rt(){Rf("WebGLRenderer: Context Restored."),E=!1;const P=A.autoReset,K=Oe.enabled,ae=Oe.autoUpdate,oe=Oe.needsUpdate,te=Oe.type;_e(),A.autoReset=P,Oe.enabled=K,Oe.autoUpdate=ae,Oe.needsUpdate=oe,Oe.type=te}function yt(P){gt("WebGLRenderer: A WebGL context could not be created. Reason: ",P.statusMessage)}function Kn(P){const K=P.target;K.removeEventListener("dispose",Kn),mi(K)}function mi(P){Wm(P),S.remove(P)}function Wm(P){const K=S.get(P).programs;K!==void 0&&(K.forEach(function(ae){ke.releaseProgram(ae)}),P.isShaderMaterial&&ke.releaseShaderCache(P))}this.renderBufferDirect=function(P,K,ae,oe,te,Ie){K===null&&(K=H);const He=te.isMesh&&te.matrixWorld.determinant()<0,Ue=qm(P,K,ae,oe,te);ge.setMaterial(oe,He);let Ge=ae.index,Xe=1;if(oe.wireframe===!0){if(Ge=Ne.getWireframeAttribute(ae),Ge===void 0)return;Xe=2}const Ke=ae.drawRange,je=ae.attributes.position;let lt=Ke.start*Xe,Et=(Ke.start+Ke.count)*Xe;Ie!==null&&(lt=Math.max(lt,Ie.start*Xe),Et=Math.min(Et,(Ie.start+Ie.count)*Xe)),Ge!==null?(lt=Math.max(lt,0),Et=Math.min(Et,Ge.count)):je!=null&&(lt=Math.max(lt,0),Et=Math.min(Et,je.count));const Ut=Et-lt;if(Ut<0||Ut===1/0)return;ze.setup(te,oe,Ue,ae,Ge);let Ft,Tt=Y;if(Ge!==null&&(Ft=ne.get(Ge),Tt=Fe,Tt.setIndex(Ft)),te.isMesh)oe.wireframe===!0?(ge.setLineWidth(oe.wireframeLinewidth*X()),Tt.setMode(L.LINES)):Tt.setMode(L.TRIANGLES);else if(te.isLine){let Ye=oe.linewidth;Ye===void 0&&(Ye=1),ge.setLineWidth(Ye*X()),te.isLineSegments?Tt.setMode(L.LINES):te.isLineLoop?Tt.setMode(L.LINE_LOOP):Tt.setMode(L.LINE_STRIP)}else te.isPoints?Tt.setMode(L.POINTS):te.isSprite&&Tt.setMode(L.TRIANGLES);if(te.isBatchedMesh)if(te._multiDrawInstances!==null)io("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Tt.renderMultiDrawInstances(te._multiDrawStarts,te._multiDrawCounts,te._multiDrawCount,te._multiDrawInstances);else if(me.get("WEBGL_multi_draw"))Tt.renderMultiDraw(te._multiDrawStarts,te._multiDrawCounts,te._multiDrawCount);else{const Ye=te._multiDrawStarts,St=te._multiDrawCounts,mt=te._multiDrawCount,xn=Ge?ne.get(Ge).bytesPerElement:1,Rs=S.get(oe).currentProgram.getUniforms();for(let yn=0;yn<mt;yn++)Rs.setValue(L,"_gl_DrawID",yn),Tt.render(Ye[yn]/xn,St[yn])}else if(te.isInstancedMesh)Tt.renderInstances(lt,Ut,te.count);else if(ae.isInstancedBufferGeometry){const Ye=ae._maxInstanceCount!==void 0?ae._maxInstanceCount:1/0,St=Math.min(ae.instanceCount,Ye);Tt.renderInstances(lt,Ut,St)}else Tt.render(lt,Ut)};function Ku(P,K,ae){P.transparent===!0&&P.side===ii&&P.forceSinglePass===!1?(P.side=_n,P.needsUpdate=!0,_o(P,K,ae),P.side=ts,P.needsUpdate=!0,_o(P,K,ae),P.side=ii):_o(P,K,ae)}this.compile=function(P,K,ae=null){ae===null&&(ae=P),T=Ce.get(ae),T.init(K),w.push(T),ae.traverseVisible(function(te){te.isLight&&te.layers.test(K.layers)&&(T.pushLight(te),te.castShadow&&T.pushShadow(te))}),P!==ae&&P.traverseVisible(function(te){te.isLight&&te.layers.test(K.layers)&&(T.pushLight(te),te.castShadow&&T.pushShadow(te))}),T.setupLights();const oe=new Set;return P.traverse(function(te){if(!(te.isMesh||te.isPoints||te.isLine||te.isSprite))return;const Ie=te.material;if(Ie)if(Array.isArray(Ie))for(let He=0;He<Ie.length;He++){const Ue=Ie[He];Ku(Ue,ae,te),oe.add(Ue)}else Ku(Ie,ae,te),oe.add(Ie)}),T=w.pop(),oe},this.compileAsync=function(P,K,ae=null){const oe=this.compile(P,K,ae);return new Promise(te=>{function Ie(){if(oe.forEach(function(He){S.get(He).currentProgram.isReady()&&oe.delete(He)}),oe.size===0){te(P);return}setTimeout(Ie,10)}me.get("KHR_parallel_shader_compile")!==null?Ie():setTimeout(Ie,10)})};let Ya=null;function Xm(P){Ya&&Ya(P)}function Zu(){is.stop()}function Ju(){is.start()}const is=new Vm;is.setAnimationLoop(Xm),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(P){Ya=P,Re.setAnimationLoop(P),P===null?is.stop():is.start()},Re.addEventListener("sessionstart",Zu),Re.addEventListener("sessionend",Ju),this.render=function(P,K){if(K!==void 0&&K.isCamera!==!0){gt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;const ae=Re.enabled===!0&&Re.isPresenting===!0,oe=R!==null&&(j===null||ae)&&R.begin(x,j);if(P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),K.parent===null&&K.matrixWorldAutoUpdate===!0&&K.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(K),K=Re.getCamera()),P.isScene===!0&&P.onBeforeRender(x,P,K,j),T=Ce.get(P,w.length),T.init(K),w.push(T),k.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),pe.setFromProjectionMatrix(k,ri,K.reversedDepth),Le=this.localClippingEnabled,he=Pe.init(this.clippingPlanes,Le),M=Se.get(P,C.length),M.init(),C.push(M),Re.enabled===!0&&Re.isPresenting===!0){const He=x.xr.getDepthSensingMesh();He!==null&&Ka(He,K,-1/0,x.sortObjects)}Ka(P,K,0,x.sortObjects),M.finish(),x.sortObjects===!0&&M.sort(at,st),D=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,D&&Ae.addToRenderList(M,P),this.info.render.frame++,he===!0&&Pe.beginShadows();const te=T.state.shadowsArray;if(Oe.render(te,P,K),he===!0&&Pe.endShadows(),this.info.autoReset===!0&&this.info.reset(),(oe&&R.hasRenderPass())===!1){const He=M.opaque,Ue=M.transmissive;if(T.setupLights(),K.isArrayCamera){const Ge=K.cameras;if(Ue.length>0)for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe];ed(He,Ue,P,je)}D&&Ae.render(P);for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe];Qu(M,P,je,je.viewport)}}else Ue.length>0&&ed(He,Ue,P,K),D&&Ae.render(P),Qu(M,P,K)}j!==null&&O===0&&(G.updateMultisampleRenderTarget(j),G.updateRenderTargetMipmap(j)),oe&&R.end(x),P.isScene===!0&&P.onAfterRender(x,P,K),ze.resetDefaultState(),ee=-1,Q=null,w.pop(),w.length>0?(T=w[w.length-1],he===!0&&Pe.setGlobalState(x.clippingPlanes,T.state.camera)):T=null,C.pop(),C.length>0?M=C[C.length-1]:M=null};function Ka(P,K,ae,oe){if(P.visible===!1)return;if(P.layers.test(K.layers)){if(P.isGroup)ae=P.renderOrder;else if(P.isLOD)P.autoUpdate===!0&&P.update(K);else if(P.isLight)T.pushLight(P),P.castShadow&&T.pushShadow(P);else if(P.isSprite){if(!P.frustumCulled||pe.intersectsSprite(P)){oe&&q.setFromMatrixPosition(P.matrixWorld).applyMatrix4(k);const He=be.update(P),Ue=P.material;Ue.visible&&M.push(P,He,Ue,ae,q.z,null)}}else if((P.isMesh||P.isLine||P.isPoints)&&(!P.frustumCulled||pe.intersectsObject(P))){const He=be.update(P),Ue=P.material;if(oe&&(P.boundingSphere!==void 0?(P.boundingSphere===null&&P.computeBoundingSphere(),q.copy(P.boundingSphere.center)):(He.boundingSphere===null&&He.computeBoundingSphere(),q.copy(He.boundingSphere.center)),q.applyMatrix4(P.matrixWorld).applyMatrix4(k)),Array.isArray(Ue)){const Ge=He.groups;for(let Xe=0,Ke=Ge.length;Xe<Ke;Xe++){const je=Ge[Xe],lt=Ue[je.materialIndex];lt&&lt.visible&&M.push(P,He,lt,ae,q.z,je)}}else Ue.visible&&M.push(P,He,Ue,ae,q.z,null)}}const Ie=P.children;for(let He=0,Ue=Ie.length;He<Ue;He++)Ka(Ie[He],K,ae,oe)}function Qu(P,K,ae,oe){const{opaque:te,transmissive:Ie,transparent:He}=P;T.setupLightsView(ae),he===!0&&Pe.setGlobalState(x.clippingPlanes,ae),oe&&ge.viewport(Z.copy(oe)),te.length>0&&vo(te,K,ae),Ie.length>0&&vo(Ie,K,ae),He.length>0&&vo(He,K,ae),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function ed(P,K,ae,oe){if((ae.isScene===!0?ae.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[oe.id]===void 0){const lt=me.has("EXT_color_buffer_half_float")||me.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[oe.id]=new li(1,1,{generateMipmaps:!0,type:lt?Ni:Mn,minFilter:bs,samples:ue.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ht.workingColorSpace})}const Ie=T.state.transmissionRenderTarget[oe.id],He=oe.viewport||Z;Ie.setSize(He.z*x.transmissionResolutionScale,He.w*x.transmissionResolutionScale);const Ue=x.getRenderTarget(),Ge=x.getActiveCubeFace(),Xe=x.getActiveMipmapLevel();x.setRenderTarget(Ie),x.getClearColor($),le=x.getClearAlpha(),le<1&&x.setClearColor(16777215,.5),x.clear(),D&&Ae.render(ae);const Ke=x.toneMapping;x.toneMapping=ai;const je=oe.viewport;if(oe.viewport!==void 0&&(oe.viewport=void 0),T.setupLightsView(oe),he===!0&&Pe.setGlobalState(x.clippingPlanes,oe),vo(P,ae,oe),G.updateMultisampleRenderTarget(Ie),G.updateRenderTargetMipmap(Ie),me.has("WEBGL_multisampled_render_to_texture")===!1){let lt=!1;for(let Et=0,Ut=K.length;Et<Ut;Et++){const Ft=K[Et],{object:Tt,geometry:Ye,material:St,group:mt}=Ft;if(St.side===ii&&Tt.layers.test(oe.layers)){const xn=St.side;St.side=_n,St.needsUpdate=!0,td(Tt,ae,oe,Ye,St,mt),St.side=xn,St.needsUpdate=!0,lt=!0}}lt===!0&&(G.updateMultisampleRenderTarget(Ie),G.updateRenderTargetMipmap(Ie))}x.setRenderTarget(Ue,Ge,Xe),x.setClearColor($,le),je!==void 0&&(oe.viewport=je),x.toneMapping=Ke}function vo(P,K,ae){const oe=K.isScene===!0?K.overrideMaterial:null;for(let te=0,Ie=P.length;te<Ie;te++){const He=P[te],{object:Ue,geometry:Ge,group:Xe}=He;let Ke=He.material;Ke.allowOverride===!0&&oe!==null&&(Ke=oe),Ue.layers.test(ae.layers)&&td(Ue,K,ae,Ge,Ke,Xe)}}function td(P,K,ae,oe,te,Ie){P.onBeforeRender(x,K,ae,oe,te,Ie),P.modelViewMatrix.multiplyMatrices(ae.matrixWorldInverse,P.matrixWorld),P.normalMatrix.getNormalMatrix(P.modelViewMatrix),te.onBeforeRender(x,K,ae,oe,P,Ie),te.transparent===!0&&te.side===ii&&te.forceSinglePass===!1?(te.side=_n,te.needsUpdate=!0,x.renderBufferDirect(ae,K,oe,te,P,Ie),te.side=ts,te.needsUpdate=!0,x.renderBufferDirect(ae,K,oe,te,P,Ie),te.side=ii):x.renderBufferDirect(ae,K,oe,te,P,Ie),P.onAfterRender(x,K,ae,oe,te,Ie)}function _o(P,K,ae){K.isScene!==!0&&(K=H);const oe=S.get(P),te=T.state.lights,Ie=T.state.shadowsArray,He=te.state.version,Ue=ke.getParameters(P,te.state,Ie,K,ae),Ge=ke.getProgramCacheKey(Ue);let Xe=oe.programs;oe.environment=P.isMeshStandardMaterial?K.environment:null,oe.fog=K.fog,oe.envMap=(P.isMeshStandardMaterial?de:se).get(P.envMap||oe.environment),oe.envMapRotation=oe.environment!==null&&P.envMap===null?K.environmentRotation:P.envMapRotation,Xe===void 0&&(P.addEventListener("dispose",Kn),Xe=new Map,oe.programs=Xe);let Ke=Xe.get(Ge);if(Ke!==void 0){if(oe.currentProgram===Ke&&oe.lightsStateVersion===He)return id(P,Ue),Ke}else Ue.uniforms=ke.getUniforms(P),P.onBeforeCompile(Ue,x),Ke=ke.acquireProgram(Ue,Ge),Xe.set(Ge,Ke),oe.uniforms=Ue.uniforms;const je=oe.uniforms;return(!P.isShaderMaterial&&!P.isRawShaderMaterial||P.clipping===!0)&&(je.clippingPlanes=Pe.uniform),id(P,Ue),oe.needsLights=Ym(P),oe.lightsStateVersion=He,oe.needsLights&&(je.ambientLightColor.value=te.state.ambient,je.lightProbe.value=te.state.probe,je.directionalLights.value=te.state.directional,je.directionalLightShadows.value=te.state.directionalShadow,je.spotLights.value=te.state.spot,je.spotLightShadows.value=te.state.spotShadow,je.rectAreaLights.value=te.state.rectArea,je.ltc_1.value=te.state.rectAreaLTC1,je.ltc_2.value=te.state.rectAreaLTC2,je.pointLights.value=te.state.point,je.pointLightShadows.value=te.state.pointShadow,je.hemisphereLights.value=te.state.hemi,je.directionalShadowMap.value=te.state.directionalShadowMap,je.directionalShadowMatrix.value=te.state.directionalShadowMatrix,je.spotShadowMap.value=te.state.spotShadowMap,je.spotLightMatrix.value=te.state.spotLightMatrix,je.spotLightMap.value=te.state.spotLightMap,je.pointShadowMap.value=te.state.pointShadowMap,je.pointShadowMatrix.value=te.state.pointShadowMatrix),oe.currentProgram=Ke,oe.uniformsList=null,Ke}function nd(P){if(P.uniformsList===null){const K=P.currentProgram.getUniforms();P.uniformsList=ua.seqWithValue(K.seq,P.uniforms)}return P.uniformsList}function id(P,K){const ae=S.get(P);ae.outputColorSpace=K.outputColorSpace,ae.batching=K.batching,ae.batchingColor=K.batchingColor,ae.instancing=K.instancing,ae.instancingColor=K.instancingColor,ae.instancingMorph=K.instancingMorph,ae.skinning=K.skinning,ae.morphTargets=K.morphTargets,ae.morphNormals=K.morphNormals,ae.morphColors=K.morphColors,ae.morphTargetsCount=K.morphTargetsCount,ae.numClippingPlanes=K.numClippingPlanes,ae.numIntersection=K.numClipIntersection,ae.vertexAlphas=K.vertexAlphas,ae.vertexTangents=K.vertexTangents,ae.toneMapping=K.toneMapping}function qm(P,K,ae,oe,te){K.isScene!==!0&&(K=H),G.resetTextureUnits();const Ie=K.fog,He=oe.isMeshStandardMaterial?K.environment:null,Ue=j===null?x.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:fr,Ge=(oe.isMeshStandardMaterial?de:se).get(oe.envMap||He),Xe=oe.vertexColors===!0&&!!ae.attributes.color&&ae.attributes.color.itemSize===4,Ke=!!ae.attributes.tangent&&(!!oe.normalMap||oe.anisotropy>0),je=!!ae.morphAttributes.position,lt=!!ae.morphAttributes.normal,Et=!!ae.morphAttributes.color;let Ut=ai;oe.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ut=x.toneMapping);const Ft=ae.morphAttributes.position||ae.morphAttributes.normal||ae.morphAttributes.color,Tt=Ft!==void 0?Ft.length:0,Ye=S.get(oe),St=T.state.lights;if(he===!0&&(Le===!0||P!==Q)){const ln=P===Q&&oe.id===ee;Pe.setState(oe,P,ln)}let mt=!1;oe.version===Ye.__version?(Ye.needsLights&&Ye.lightsStateVersion!==St.state.version||Ye.outputColorSpace!==Ue||te.isBatchedMesh&&Ye.batching===!1||!te.isBatchedMesh&&Ye.batching===!0||te.isBatchedMesh&&Ye.batchingColor===!0&&te.colorTexture===null||te.isBatchedMesh&&Ye.batchingColor===!1&&te.colorTexture!==null||te.isInstancedMesh&&Ye.instancing===!1||!te.isInstancedMesh&&Ye.instancing===!0||te.isSkinnedMesh&&Ye.skinning===!1||!te.isSkinnedMesh&&Ye.skinning===!0||te.isInstancedMesh&&Ye.instancingColor===!0&&te.instanceColor===null||te.isInstancedMesh&&Ye.instancingColor===!1&&te.instanceColor!==null||te.isInstancedMesh&&Ye.instancingMorph===!0&&te.morphTexture===null||te.isInstancedMesh&&Ye.instancingMorph===!1&&te.morphTexture!==null||Ye.envMap!==Ge||oe.fog===!0&&Ye.fog!==Ie||Ye.numClippingPlanes!==void 0&&(Ye.numClippingPlanes!==Pe.numPlanes||Ye.numIntersection!==Pe.numIntersection)||Ye.vertexAlphas!==Xe||Ye.vertexTangents!==Ke||Ye.morphTargets!==je||Ye.morphNormals!==lt||Ye.morphColors!==Et||Ye.toneMapping!==Ut||Ye.morphTargetsCount!==Tt)&&(mt=!0):(mt=!0,Ye.__version=oe.version);let xn=Ye.currentProgram;mt===!0&&(xn=_o(oe,K,te));let Rs=!1,yn=!1,_r=!1;const Pt=xn.getUniforms(),mn=Ye.uniforms;if(ge.useProgram(xn.program)&&(Rs=!0,yn=!0,_r=!0),oe.id!==ee&&(ee=oe.id,yn=!0),Rs||Q!==P){ge.buffers.depth.getReversed()&&P.reversedDepth!==!0&&(P._reversedDepth=!0,P.updateProjectionMatrix()),Pt.setValue(L,"projectionMatrix",P.projectionMatrix),Pt.setValue(L,"viewMatrix",P.matrixWorldInverse);const gn=Pt.map.cameraPosition;gn!==void 0&&gn.setValue(L,z.setFromMatrixPosition(P.matrixWorld)),ue.logarithmicDepthBuffer&&Pt.setValue(L,"logDepthBufFC",2/(Math.log(P.far+1)/Math.LN2)),(oe.isMeshPhongMaterial||oe.isMeshToonMaterial||oe.isMeshLambertMaterial||oe.isMeshBasicMaterial||oe.isMeshStandardMaterial||oe.isShaderMaterial)&&Pt.setValue(L,"isOrthographic",P.isOrthographicCamera===!0),Q!==P&&(Q=P,yn=!0,_r=!0)}if(Ye.needsLights&&(St.state.directionalShadowMap.length>0&&Pt.setValue(L,"directionalShadowMap",St.state.directionalShadowMap,G),St.state.spotShadowMap.length>0&&Pt.setValue(L,"spotShadowMap",St.state.spotShadowMap,G),St.state.pointShadowMap.length>0&&Pt.setValue(L,"pointShadowMap",St.state.pointShadowMap,G)),te.isSkinnedMesh){Pt.setOptional(L,te,"bindMatrix"),Pt.setOptional(L,te,"bindMatrixInverse");const ln=te.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),Pt.setValue(L,"boneTexture",ln.boneTexture,G))}te.isBatchedMesh&&(Pt.setOptional(L,te,"batchingTexture"),Pt.setValue(L,"batchingTexture",te._matricesTexture,G),Pt.setOptional(L,te,"batchingIdTexture"),Pt.setValue(L,"batchingIdTexture",te._indirectTexture,G),Pt.setOptional(L,te,"batchingColorTexture"),te._colorsTexture!==null&&Pt.setValue(L,"batchingColorTexture",te._colorsTexture,G));const Rn=ae.morphAttributes;if((Rn.position!==void 0||Rn.normal!==void 0||Rn.color!==void 0)&&nt.update(te,ae,xn),(yn||Ye.receiveShadow!==te.receiveShadow)&&(Ye.receiveShadow=te.receiveShadow,Pt.setValue(L,"receiveShadow",te.receiveShadow)),oe.isMeshGouraudMaterial&&oe.envMap!==null&&(mn.envMap.value=Ge,mn.flipEnvMap.value=Ge.isCubeTexture&&Ge.isRenderTargetTexture===!1?-1:1),oe.isMeshStandardMaterial&&oe.envMap===null&&K.environment!==null&&(mn.envMapIntensity.value=K.environmentIntensity),mn.dfgLUT!==void 0&&(mn.dfgLUT.value=fN()),yn&&(Pt.setValue(L,"toneMappingExposure",x.toneMappingExposure),Ye.needsLights&&jm(mn,_r),Ie&&oe.fog===!0&&We.refreshFogUniforms(mn,Ie),We.refreshMaterialUniforms(mn,oe,Te,xe,T.state.transmissionRenderTarget[P.id]),ua.upload(L,nd(Ye),mn,G)),oe.isShaderMaterial&&oe.uniformsNeedUpdate===!0&&(ua.upload(L,nd(Ye),mn,G),oe.uniformsNeedUpdate=!1),oe.isSpriteMaterial&&Pt.setValue(L,"center",te.center),Pt.setValue(L,"modelViewMatrix",te.modelViewMatrix),Pt.setValue(L,"normalMatrix",te.normalMatrix),Pt.setValue(L,"modelMatrix",te.matrixWorld),oe.isShaderMaterial||oe.isRawShaderMaterial){const ln=oe.uniformsGroups;for(let gn=0,Za=ln.length;gn<Za;gn++){const ss=ln[gn];Me.update(ss,xn),Me.bind(ss,xn)}}return xn}function jm(P,K){P.ambientLightColor.needsUpdate=K,P.lightProbe.needsUpdate=K,P.directionalLights.needsUpdate=K,P.directionalLightShadows.needsUpdate=K,P.pointLights.needsUpdate=K,P.pointLightShadows.needsUpdate=K,P.spotLights.needsUpdate=K,P.spotLightShadows.needsUpdate=K,P.rectAreaLights.needsUpdate=K,P.hemisphereLights.needsUpdate=K}function Ym(P){return P.isMeshLambertMaterial||P.isMeshToonMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isShadowMaterial||P.isShaderMaterial&&P.lights===!0}this.getActiveCubeFace=function(){return U},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(P,K,ae){const oe=S.get(P);oe.__autoAllocateDepthBuffer=P.resolveDepthBuffer===!1,oe.__autoAllocateDepthBuffer===!1&&(oe.__useRenderToTexture=!1),S.get(P.texture).__webglTexture=K,S.get(P.depthTexture).__webglTexture=oe.__autoAllocateDepthBuffer?void 0:ae,oe.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(P,K){const ae=S.get(P);ae.__webglFramebuffer=K,ae.__useDefaultFramebuffer=K===void 0};const Km=L.createFramebuffer();this.setRenderTarget=function(P,K=0,ae=0){j=P,U=K,O=ae;let oe=null,te=!1,Ie=!1;if(P){const Ue=S.get(P);if(Ue.__useDefaultFramebuffer!==void 0){ge.bindFramebuffer(L.FRAMEBUFFER,Ue.__webglFramebuffer),Z.copy(P.viewport),I.copy(P.scissor),F=P.scissorTest,ge.viewport(Z),ge.scissor(I),ge.setScissorTest(F),ee=-1;return}else if(Ue.__webglFramebuffer===void 0)G.setupRenderTarget(P);else if(Ue.__hasExternalTextures)G.rebindTextures(P,S.get(P.texture).__webglTexture,S.get(P.depthTexture).__webglTexture);else if(P.depthBuffer){const Ke=P.depthTexture;if(Ue.__boundDepthTexture!==Ke){if(Ke!==null&&S.has(Ke)&&(P.width!==Ke.image.width||P.height!==Ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");G.setupDepthRenderbuffer(P)}}const Ge=P.texture;(Ge.isData3DTexture||Ge.isDataArrayTexture||Ge.isCompressedArrayTexture)&&(Ie=!0);const Xe=S.get(P).__webglFramebuffer;P.isWebGLCubeRenderTarget?(Array.isArray(Xe[K])?oe=Xe[K][ae]:oe=Xe[K],te=!0):P.samples>0&&G.useMultisampledRTT(P)===!1?oe=S.get(P).__webglMultisampledFramebuffer:Array.isArray(Xe)?oe=Xe[ae]:oe=Xe,Z.copy(P.viewport),I.copy(P.scissor),F=P.scissorTest}else Z.copy(fe).multiplyScalar(Te).floor(),I.copy(W).multiplyScalar(Te).floor(),F=ce;if(ae!==0&&(oe=Km),ge.bindFramebuffer(L.FRAMEBUFFER,oe)&&ge.drawBuffers(P,oe),ge.viewport(Z),ge.scissor(I),ge.setScissorTest(F),te){const Ue=S.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+K,Ue.__webglTexture,ae)}else if(Ie){const Ue=K;for(let Ge=0;Ge<P.textures.length;Ge++){const Xe=S.get(P.textures[Ge]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Ge,Xe.__webglTexture,ae,Ue)}}else if(P!==null&&ae!==0){const Ue=S.get(P.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ue.__webglTexture,ae)}ee=-1},this.readRenderTargetPixels=function(P,K,ae,oe,te,Ie,He,Ue=0){if(!(P&&P.isWebGLRenderTarget)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=S.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&He!==void 0&&(Ge=Ge[He]),Ge){ge.bindFramebuffer(L.FRAMEBUFFER,Ge);try{const Xe=P.textures[Ue],Ke=Xe.format,je=Xe.type;if(!ue.textureFormatReadable(Ke)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ue.textureTypeReadable(je)){gt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}K>=0&&K<=P.width-oe&&ae>=0&&ae<=P.height-te&&(P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ue),L.readPixels(K,ae,oe,te,we.convert(Ke),we.convert(je),Ie))}finally{const Xe=j!==null?S.get(j).__webglFramebuffer:null;ge.bindFramebuffer(L.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(P,K,ae,oe,te,Ie,He,Ue=0){if(!(P&&P.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=S.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&He!==void 0&&(Ge=Ge[He]),Ge)if(K>=0&&K<=P.width-oe&&ae>=0&&ae<=P.height-te){ge.bindFramebuffer(L.FRAMEBUFFER,Ge);const Xe=P.textures[Ue],Ke=Xe.format,je=Xe.type;if(!ue.textureFormatReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ue.textureTypeReadable(je))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const lt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,lt),L.bufferData(L.PIXEL_PACK_BUFFER,Ie.byteLength,L.STREAM_READ),P.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Ue),L.readPixels(K,ae,oe,te,we.convert(Ke),we.convert(je),0);const Et=j!==null?S.get(j).__webglFramebuffer:null;ge.bindFramebuffer(L.FRAMEBUFFER,Et);const Ut=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await D3(L,Ut,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,lt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Ie),L.deleteBuffer(lt),L.deleteSync(Ut),Ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(P,K=null,ae=0){const oe=Math.pow(2,-ae),te=Math.floor(P.image.width*oe),Ie=Math.floor(P.image.height*oe),He=K!==null?K.x:0,Ue=K!==null?K.y:0;G.setTexture2D(P,0),L.copyTexSubImage2D(L.TEXTURE_2D,ae,0,0,He,Ue,te,Ie),ge.unbindTexture()};const Zm=L.createFramebuffer(),Jm=L.createFramebuffer();this.copyTextureToTexture=function(P,K,ae=null,oe=null,te=0,Ie=null){Ie===null&&(te!==0?(io("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Ie=te,te=0):Ie=0);let He,Ue,Ge,Xe,Ke,je,lt,Et,Ut;const Ft=P.isCompressedTexture?P.mipmaps[Ie]:P.image;if(ae!==null)He=ae.max.x-ae.min.x,Ue=ae.max.y-ae.min.y,Ge=ae.isBox3?ae.max.z-ae.min.z:1,Xe=ae.min.x,Ke=ae.min.y,je=ae.isBox3?ae.min.z:0;else{const Rn=Math.pow(2,-te);He=Math.floor(Ft.width*Rn),Ue=Math.floor(Ft.height*Rn),P.isDataArrayTexture?Ge=Ft.depth:P.isData3DTexture?Ge=Math.floor(Ft.depth*Rn):Ge=1,Xe=0,Ke=0,je=0}oe!==null?(lt=oe.x,Et=oe.y,Ut=oe.z):(lt=0,Et=0,Ut=0);const Tt=we.convert(K.format),Ye=we.convert(K.type);let St;K.isData3DTexture?(G.setTexture3D(K,0),St=L.TEXTURE_3D):K.isDataArrayTexture||K.isCompressedArrayTexture?(G.setTexture2DArray(K,0),St=L.TEXTURE_2D_ARRAY):(G.setTexture2D(K,0),St=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,K.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,K.unpackAlignment);const mt=L.getParameter(L.UNPACK_ROW_LENGTH),xn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Rs=L.getParameter(L.UNPACK_SKIP_PIXELS),yn=L.getParameter(L.UNPACK_SKIP_ROWS),_r=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,Ft.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ft.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Xe),L.pixelStorei(L.UNPACK_SKIP_ROWS,Ke),L.pixelStorei(L.UNPACK_SKIP_IMAGES,je);const Pt=P.isDataArrayTexture||P.isData3DTexture,mn=K.isDataArrayTexture||K.isData3DTexture;if(P.isDepthTexture){const Rn=S.get(P),ln=S.get(K),gn=S.get(Rn.__renderTarget),Za=S.get(ln.__renderTarget);ge.bindFramebuffer(L.READ_FRAMEBUFFER,gn.__webglFramebuffer),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,Za.__webglFramebuffer);for(let ss=0;ss<Ge;ss++)Pt&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,S.get(P).__webglTexture,te,je+ss),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,S.get(K).__webglTexture,Ie,Ut+ss)),L.blitFramebuffer(Xe,Ke,He,Ue,lt,Et,He,Ue,L.DEPTH_BUFFER_BIT,L.NEAREST);ge.bindFramebuffer(L.READ_FRAMEBUFFER,null),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(te!==0||P.isRenderTargetTexture||S.has(P)){const Rn=S.get(P),ln=S.get(K);ge.bindFramebuffer(L.READ_FRAMEBUFFER,Zm),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,Jm);for(let gn=0;gn<Ge;gn++)Pt?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Rn.__webglTexture,te,je+gn):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Rn.__webglTexture,te),mn?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ln.__webglTexture,Ie,Ut+gn):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ln.__webglTexture,Ie),te!==0?L.blitFramebuffer(Xe,Ke,He,Ue,lt,Et,He,Ue,L.COLOR_BUFFER_BIT,L.NEAREST):mn?L.copyTexSubImage3D(St,Ie,lt,Et,Ut+gn,Xe,Ke,He,Ue):L.copyTexSubImage2D(St,Ie,lt,Et,Xe,Ke,He,Ue);ge.bindFramebuffer(L.READ_FRAMEBUFFER,null),ge.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else mn?P.isDataTexture||P.isData3DTexture?L.texSubImage3D(St,Ie,lt,Et,Ut,He,Ue,Ge,Tt,Ye,Ft.data):K.isCompressedArrayTexture?L.compressedTexSubImage3D(St,Ie,lt,Et,Ut,He,Ue,Ge,Tt,Ft.data):L.texSubImage3D(St,Ie,lt,Et,Ut,He,Ue,Ge,Tt,Ye,Ft):P.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Ie,lt,Et,He,Ue,Tt,Ye,Ft.data):P.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Ie,lt,Et,Ft.width,Ft.height,Tt,Ft.data):L.texSubImage2D(L.TEXTURE_2D,Ie,lt,Et,He,Ue,Tt,Ye,Ft);L.pixelStorei(L.UNPACK_ROW_LENGTH,mt),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,xn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Rs),L.pixelStorei(L.UNPACK_SKIP_ROWS,yn),L.pixelStorei(L.UNPACK_SKIP_IMAGES,_r),Ie===0&&K.generateMipmaps&&L.generateMipmap(St),ge.unbindTexture()},this.initRenderTarget=function(P){S.get(P).__webglFramebuffer===void 0&&G.setupRenderTarget(P)},this.initTexture=function(P){P.isCubeTexture?G.setTextureCube(P,0):P.isData3DTexture?G.setTexture3D(P,0):P.isDataArrayTexture||P.isCompressedArrayTexture?G.setTexture2DArray(P,0):G.setTexture2D(P,0),ge.unbindTexture()},this.resetState=function(){U=0,O=0,j=null,ge.reset(),ze.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ht._getDrawingBufferColorSpace(e),t.unpackColorSpace=ht._getUnpackColorSpace()}}const pN={class:"fishing-page"},mN={class:"fishing-header"},gN={class:"score-display"},vN={class:"score-value"},_N={class:"fishing-container"},xN={class:"game-controls"},yN=["disabled"],SN={class:"caught-fish"},bN={key:0,class:"empty-catch"},MN={key:1,class:"fish-list"},EN=tt({__name:"FishingPage",setup(n){const e=J(null),t=J(!1),i=J(0),s=J([]),r=J(null),o=J(null),a=J(null);let l=null,c=null,u=null,f=[],h=[];const m=[{color:16739179,name:"Red Snapper",points:10},{color:5164484,name:"Coral Fish",points:15},{color:16770669,name:"Golden Fish",points:20},{color:9822675,name:"Jellyfish",points:25},{color:14524637,name:"Tropical Fish",points:30}],_=()=>{if(!e.value)return;r.value=new iP,r.value.background=new dt(30654),r.value.fog=new $u(30654,10,50),o.value=new Ln(75,e.value.clientWidth/e.value.clientHeight,.1,1e3),o.value.position.set(0,5,10),o.value.lookAt(0,0,0),a.value=new hN({antialias:!0}),a.value.setSize(e.value.clientWidth,e.value.clientHeight),a.value.setPixelRatio(window.devicePixelRatio),e.value.appendChild(a.value.domElement);const C=new gP(16777215,.5);r.value.add(C);const w=new mP(16777215,1);w.position.set(5,10,5),r.value.add(w);const R=new go(50,50,32,32),x=new zl({color:27028,transparent:!0,opacity:.8,side:ii}),E=new wn(R,x);E.rotation.x=-Math.PI/2,E.position.y=-.5,r.value.add(E),v();for(let U=0;U<8;U++)g();window.addEventListener("resize",M)},v=()=>{if(!r.value)return;const C=new qu(.2,.05,8,16),w=new zl({color:3355443});c=new wn(C,w),c.position.set(0,2,0),r.value.add(c);const R=new Cn().setFromPoints([new ie(0,5,0),c.position]),x=new km({color:3355443,linewidth:2});u=new lP(R,x),r.value.add(u)},g=()=>{if(!r.value)return;const C=m[Math.floor(Math.random()*m.length)],w=new Nr,R=new Ta(.3,1,8);R.rotateZ(Math.PI/2);const x=new zl({color:C.color}),E=new wn(R,x);w.add(E);const U=new Ta(.2,.3,4);U.rotateZ(-Math.PI/2);const O=new wn(U,x);O.position.x=-.6,w.add(O),w.position.set((Math.random()-.5)*20,-2-Math.random()*3,(Math.random()-.5)*15),w.rotation.y=Math.random()*Math.PI*2,w.userData={...C,id:f.length},r.value.add(w),f.push(w),h.push({x:(Math.random()-.5)*.02,z:(Math.random()-.5)*.02})},p=()=>{if(l=requestAnimationFrame(p),!(!r.value||!o.value||!a.value||!c)){if(f.forEach((C,w)=>{C.position.x+=h[w].x,C.position.z+=h[w].z,Math.abs(C.position.x)>10&&(h[w].x*=-1),Math.abs(C.position.z)>8&&(h[w].z*=-1),C.rotation.z=Math.sin(Date.now()*.005+w)*.2}),u){const C=u.geometry.attributes.position.array;C[3]=c.position.x,C[4]=c.position.y,C[5]=c.position.z(u.geometry).attributes.position.needsUpdate=!0}a.value.render(r.value,o.value)}},b=()=>{if(!c||!t.value)return;t.value=!0;const C=c.position.y,w=-4;let R=0;const x=()=>{var U;R+=.05,c.position.y=C-(C-w)*R;const E=f.findIndex(O=>c.position.distanceTo(O.position)<.8);if(E!==-1){const O=f[E];i.value+=O.userData.points,O.value.push(O.userData.name),(U=r.value)==null||U.remove(O),f.splice(E,1),h.splice(E,1),setTimeout(()=>g(),2e3),y(C);return}R<1?requestAnimationFrame(x):y(C)};x()},y=C=>{if(!c)return;let w=0;const R=c.position.y,x=()=>{w+=.08,c.position.y=R+(C-R)*w,w<1?requestAnimationFrame(x):t.value=!1};x()},M=()=>{!o.value||!a.value||!e.value||(o.value.aspect=e.value.clientWidth/e.value.clientHeight,o.value.updateProjectionMatrix(),a.value.setSize(e.value.clientWidth,e.value.clientHeight))},T=()=>{t.value||b()};return Ct(()=>{_(),p()}),Yn(()=>{var C;l!==null&&cancelAnimationFrame(l),window.removeEventListener("resize",M),(C=a.value)==null||C.dispose()}),(C,w)=>(N(),B("div",pN,[d("div",mN,[w[1]||(w[1]=d("h1",null,"🎣 Fishing Mini Game",-1)),d("div",gN,[w[0]||(w[0]=d("span",{class:"score-label"},"Score:",-1)),d("span",vN,V(i.value),1)])]),d("div",_N,[d("div",{ref_key:"container",ref:e,class:"game-container"},null,512),d("div",xN,[d("button",{onClick:T,disabled:t.value,class:Be(["cast-button",{active:t.value}])},V(t.value?"🎣 Fishing...":"🎣 Cast Line"),11,yN)])]),d("div",SN,[w[2]||(w[2]=d("h2",null,"Caught Fish 🐟",-1)),s.value.length===0?(N(),B("div",bN," No fish caught yet. Cast your line! ")):(N(),B("div",MN,[(N(!0),B($e,null,Qe(s.value,(R,x)=>(N(),B("div",{key:x,class:"fish-item"}," 🐟 "+V(R),1))),128))]))])]))}}),wN=ct(EN,[["__scopeId","data-v-40765bfc"]]),TN={class:"character-tinder-page"},AN={class:"page-header"},CN={class:"header-actions"},RN={key:0,class:"vote-result-popup"},PN={class:"vote-result-content"},IN={class:"winner-result"},DN={class:"elo-change"},LN={class:"loser-result"},NN={class:"elo-change"},UN={key:1,class:"voting-section"},FN={key:0,class:"loading"},kN={key:1,class:"empty-state"},ON={key:2,class:"character-pair"},BN=["onClick"],VN={class:"character-image"},zN=["src","alt"],HN={key:1,class:"placeholder-image"},GN={class:"character-info"},$N={class:"character-stats"},WN={class:"elo"},XN={class:"record"},qN={key:2,class:"leaderboard-section"},jN={key:0,class:"loading"},YN={key:1,class:"empty-state"},KN={key:2,class:"leaderboard"},ZN={class:"rank"},JN={key:0},QN={key:1},eU={key:2},tU={key:3},nU={class:"character-display"},iU={class:"character-avatar"},sU=["src","alt"],rU={key:1,class:"avatar-placeholder"},oU={class:"character-details"},aU={class:"stats"},lU={class:"elo"},cU={class:"record"},uU={class:"form-group"},dU={class:"form-group"},fU={class:"form-actions"},hU=["disabled"],pU=["disabled"],mU=tt({__name:"CharacterTinderPage",setup(n){const e=J([]),t=J(null),i=J(!1),s=J(!1),r=J(!1),o=J(!1),a=J({name:"",image_url:""}),l=J(null),c=J(!1),u=async()=>{r.value=!0;try{const v=await(await fetch("/api/characters")).json();e.value=v.characters||[]}catch(_){console.error("Error loading characters:",_)}finally{r.value=!1}},f=async()=>{r.value=!0;try{const v=await(await fetch("/api/characters/random-pair")).json();v.characters&&v.characters.length>=2?t.value=[v.characters[0],v.characters[1]]:t.value=null}catch(_){console.error("Error loading random pair:",_),t.value=null}finally{r.value=!1}},h=async _=>{if(!t.value||o.value)return;const v=t.value.find(g=>g.id!==_);if(v){o.value=!0;try{const p=await(await fetch("/api/characters/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({winner_id:_,loser_id:v.id})})).json();l.value=p,c.value=!0,setTimeout(async()=>{await u(),await f(),c.value=!1},1500)}catch(g){console.error("Error voting:",g)}finally{o.value=!1}}},m=async()=>{if(a.value.name.trim()){r.value=!0;try{if(!(await fetch("/api/characters",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a.value.name.trim(),image_url:a.value.image_url.trim()||null})})).ok)throw new Error("Failed to add character");a.value={name:"",image_url:""},i.value=!1,await u(),await f()}catch(_){console.error("Error adding character:",_)}finally{r.value=!1}}};return Ct(async()=>{await u(),await f()}),(_,v)=>(N(),B("div",TN,[d("div",AN,[v[7]||(v[7]=d("h1",null,"🎭 Fictional Character Tinder",-1)),v[8]||(v[8]=d("p",null,"Vote for your favorite characters and see who reigns supreme!",-1)),d("div",CN,[d("button",{onClick:v[0]||(v[0]=g=>i.value=!0),class:"action-btn add-btn"}," ➕ Add Character "),d("button",{onClick:v[1]||(v[1]=g=>s.value=!s.value),class:"action-btn leaderboard-btn"},V(s.value?"🎮 Start Voting":"🏆 Leaderboard"),1)])]),c.value&&l.value?(N(),B("div",RN,[d("div",PN,[d("div",IN,[d("h3",null,"🏆 "+V(l.value.winner.name)+" wins!",1),d("p",DN,"+"+V(l.value.elo_change_winner)+" ELO",1)]),d("div",LN,[d("h3",null,"💔 "+V(l.value.loser.name),1),d("p",NN,V(l.value.elo_change_loser)+" ELO",1)])])])):Ee("",!0),s.value?Ee("",!0):(N(),B("div",UN,[r.value?(N(),B("div",FN," Loading characters... ")):t.value?(N(),B("div",ON,[(N(!0),B($e,null,Qe(t.value,g=>(N(),B("div",{key:g.id,class:Be(["character-card",{voting:o.value}]),onClick:p=>h(g.id)},[d("div",VN,[g.image_url?(N(),B("img",{key:0,src:g.image_url,alt:g.name},null,8,zN)):(N(),B("div",HN,[...v[11]||(v[11]=[d("span",{class:"placeholder-emoji"},"🎭",-1)])]))]),d("div",GN,[d("h3",null,V(g.name),1),d("div",$N,[d("span",WN,"⭐ "+V(g.elo_rating)+" ELO",1),d("span",XN,V(g.wins)+"W - "+V(g.losses)+"L",1)])])],10,BN))),128))])):(N(),B("div",kN,[v[9]||(v[9]=d("h2",null,"🎭 No characters yet!",-1)),v[10]||(v[10]=d("p",null,"Be the first to add a character to start voting.",-1)),d("button",{onClick:v[2]||(v[2]=g=>i.value=!0),class:"add-first-btn"}," ➕ Add First Character ")]))])),s.value?(N(),B("div",qN,[r.value?(N(),B("div",jN," Loading leaderboard... ")):e.value.length===0?(N(),B("div",YN,[...v[12]||(v[12]=[d("h2",null,"🏆 Leaderboard",-1),d("p",null,"No characters yet. Add some to start the competition!",-1)])])):(N(),B("div",KN,[(N(!0),B($e,null,Qe(e.value,(g,p)=>(N(),B("div",{key:g.id,class:Be(["leaderboard-item",{"top-3":p<3}])},[d("div",ZN,[p===0?(N(),B("span",JN,"🥇")):p===1?(N(),B("span",QN,"🥈")):p===2?(N(),B("span",eU,"🥉")):(N(),B("span",tU,V(p+1),1))]),d("div",nU,[d("div",iU,[g.image_url?(N(),B("img",{key:0,src:g.image_url,alt:g.name},null,8,sU)):(N(),B("div",rU,"🎭"))]),d("div",oU,[d("h4",null,V(g.name),1),d("div",aU,[d("span",lU,"⭐ "+V(g.elo_rating),1),d("span",cU,V(g.wins)+"W - "+V(g.losses)+"L",1)])])])],2))),128))]))])):Ee("",!0),pt(sa,{"is-open":i.value,title:"Add New Character",onClose:v[6]||(v[6]=g=>i.value=!1)},{default:Nn(()=>[d("form",{onSubmit:uo(m,["prevent"]),class:"add-character-form"},[d("div",uU,[v[13]||(v[13]=d("label",{for:"name"},"Character Name *",-1)),Mt(d("input",{id:"name","onUpdate:modelValue":v[3]||(v[3]=g=>a.value.name=g),type:"text",placeholder:"e.g., Batman, Spider-Man, Wonder Woman",required:""},null,512),[[Bt,a.value.name]])]),d("div",dU,[v[14]||(v[14]=d("label",{for:"image_url"},"Image URL (optional)",-1)),Mt(d("input",{id:"image_url","onUpdate:modelValue":v[4]||(v[4]=g=>a.value.image_url=g),type:"url",placeholder:"https://example.com/image.jpg"},null,512),[[Bt,a.value.image_url]])]),d("div",fU,[d("button",{type:"button",onClick:v[5]||(v[5]=g=>i.value=!1),class:"cancel-btn",disabled:r.value}," Cancel ",8,hU),d("button",{type:"submit",class:"submit-btn",disabled:r.value||!a.value.name.trim()},V(r.value?"Adding...":"Add Character"),9,pU)])],32)]),_:1},8,["is-open"])]))}}),gU=ct(mU,[["__scopeId","data-v-b71e856d"]]),vU={class:"theme-selector"},_U=["onClick"],xU={class:"regenerate-section"},yU=["disabled"],SU={key:0,class:"wordcloud-loading"},bU={key:1,class:"wordcloud-error"},MU={key:2,class:"wordcloud-container"},EU={class:"wordcloud"},wU=tt({__name:"WordCloudPage",setup(n){const e=Qt(),t=J([]),i=J(!1),s=J(null),r={technology:[{text:"AI",weight:10},{text:"Code",weight:9},{text:"Robot",weight:8},{text:"Data",weight:7},{text:"Cloud",weight:6},{text:"App",weight:5},{text:"Web",weight:4},{text:"Tech",weight:3},{text:"Software",weight:2},{text:"Digital",weight:1}],nature:[{text:"Ocean",weight:10},{text:"Forest",weight:9},{text:"Mountain",weight:8},{text:"River",weight:7},{text:"Cloud",weight:6},{text:"Sun",weight:5},{text:"Moon",weight:4},{text:"Star",weight:3},{text:"Tree",weight:2},{text:"Flower",weight:1}],animals:[{text:"Elephant",weight:10},{text:"Tiger",weight:9},{text:"Dolphin",weight:8},{text:"Eagle",weight:7},{text:"Wolf",weight:6},{text:"Fox",weight:5},{text:"Bear",weight:4},{text:"Lion",weight:3},{text:"Cat",weight:2},{text:"Dog",weight:1}],music:[{text:"Melody",weight:10},{text:"Rhythm",weight:9},{text:"Harmony",weight:8},{text:"Beat",weight:7},{text:"Tempo",weight:6},{text:"Note",weight:5},{text:"Chord",weight:4},{text:"Sound",weight:3},{text:"Song",weight:2},{text:"Music",weight:1}]},o=["#ff6b9d","#ff8a80","#ffd89b","#87ceeb","#a0e7e5","#b4f8c8","#fbc2eb","#a6c1ee","#d4a5a5","#f5f5dc"];let a="technology";const l=()=>{i.value=!0,s.value=null;try{const f=r[a],h=[];f.forEach((_,v)=>{const g={text:_.text,weight:_.weight,color:o[Math.floor(Math.random()*o.length)],x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15};h.push(g)}),h.slice(0,3).forEach(_=>{h.push({..._,x:Math.random()*80+10,y:Math.random()*80+10,rotation:Math.random()*30-15})}),t.value=h.sort((_,v)=>v.weight-_.weight)}catch(f){s.value="Failed to generate word cloud",console.error("Error generating word cloud:",f)}finally{i.value=!1}},c=f=>{a=f,l()};Ct(()=>{l()});const u=f=>({fontSize:`${Math.max(1.5,f.weight*.8)}rem`,color:f.color,left:`${f.x}%`,top:`${f.y}%`,transform:`rotate(${f.rotation}deg)`,opacity:f.weight/10+.2});return(f,h)=>(N(),B("div",{class:Be(["wordcloud-page",{dark:ve(e).darkMode}])},[h[2]||(h[2]=d("div",{class:"wordcloud-header"},[d("h1",null,"☁️ Word Cloud"),d("p",{class:"subtitle"},"Visualize words in a beautiful cloud format")],-1)),d("div",vU,[(N(),B($e,null,Qe(r,(m,_)=>d("button",{key:_,class:Be(["theme-button",{active:ve(a)===_}]),onClick:v=>c(_)},V(_.charAt(0).toUpperCase()+_.slice(1)),11,_U)),64))]),d("div",xU,[d("button",{class:"regenerate-button",onClick:l,disabled:i.value}," 🔄 "+V(i.value?"Generating...":"Regenerate Cloud"),9,yU)]),i.value?(N(),B("div",SU,[...h[0]||(h[0]=[d("span",{class:"loading-spinner"},"⏳",-1),d("p",null,"Generating word cloud...",-1)])])):s.value?(N(),B("div",bU,[h[1]||(h[1]=d("span",{class:"error-icon"},"⚠️",-1)),d("p",null,V(s.value),1),d("button",{class:"retry-button",onClick:l},"🔄 Try Again")])):(N(),B("div",MU,[d("div",EU,[(N(!0),B($e,null,Qe(t.value,(m,_)=>(N(),B("div",{key:_,class:"word",style:Dt(u(m))},V(m.text),5))),128))])])),h[3]||(h[3]=d("div",{class:"footer-note"},[d("p",null,"💡 Click on different themes to see word clouds for various topics"),d("p",null,"🎨 Word size and opacity based on importance weight")],-1))],2))}}),TU=ct(wU,[["__scopeId","data-v-162f93d3"]]),AU={class:"keanu-header"},CU=["disabled"],RU={class:"keanu-container"},PU={key:0,class:"loading-message"},IU={key:1,class:"error-message"},DU={class:"keanu-image-wrapper"},LU=["src","alt","onLoad","onError"],NU={key:0,class:"keanu-image-loading"},UU=["onClick"],FU=tt({__name:"KeanuPage",setup(n){const e=Qt(),t=J([]),i=J(!1),s=J(null),r=()=>({url:"https://placekeanu.com/700/350",loading:!0}),o=()=>{i.value=!0,s.value=null;try{const c=Array.from({length:6},()=>r());t.value=c}catch(c){s.value=c instanceof Error?c.message:"Failed to load Keanu images",console.error("Error loading Keanu images:",c)}finally{i.value=!1}},a=c=>{t.value[c]=r()},l=()=>{o()};return Ct(()=>{o()}),(c,u)=>(N(),B("div",{class:Be(["keanu-page",{dark:ve(e).darkMode}])},[d("div",AU,[u[0]||(u[0]=d("h1",null,"🥋 Keanu",-1)),u[1]||(u[1]=d("p",{class:"subtitle"},"For when you need a little more Keanu in your life",-1)),d("button",{onClick:l,class:"refresh-button",disabled:i.value},V(i.value?"Loading...":"🔄 Refresh All"),9,CU)]),d("div",RU,[i.value&&t.value.length===0?(N(),B("div",PU," Loading Keanu images... ")):s.value?(N(),B("div",IU,V(s.value),1)):Ee("",!0),(N(!0),B($e,null,Qe(t.value,(f,h)=>(N(),B("div",{key:h,class:"keanu-card"},[d("div",DU,[d("img",{src:f.url,alt:"Keanu Reeves "+(h+1),class:"keanu-image",onLoad:m=>f.loading=!1,onError:m=>a(h)},null,40,LU),f.loading?(N(),B("div",NU," Loading Keanu... ")):Ee("",!0)]),d("button",{onClick:m=>a(h),class:"refresh-single-button"}," 🔄 ",8,UU)]))),128))]),u[2]||(u[2]=d("div",{class:"footer-note"},[d("p",null,[Lt("🎬 Images provided by "),d("a",{href:"https://placekeanu.com/",target:"_blank"},"PlaceKeanu.com")]),d("p",null,"💡 Click refresh to get new Keanu images!")],-1))],2))}}),kU=ct(FU,[["__scopeId","data-v-0480f574"]]),OU={class:"patch-notes-container"},BU={key:0,class:"loading-message"},VU={key:1,class:"error-message"},zU={class:"patch-note-header"},HU={class:"version-badge"},GU={class:"build-info"},$U={class:"patch-title"},WU={class:"changes-list"},XU={class:"change-icon"},qU={class:"change-label"},jU={class:"change-description"},YU=tt({__name:"PatchNotesPage",setup(n){const e=Qt(),t=J([]),i=J(!0),s=J(null),r=async()=>{try{i.value=!0;const l=await fetch("/api/patch-notes");if(!l.ok)throw new Error("Failed to load patch notes");t.value=await l.json()}catch(l){s.value=l instanceof Error?l.message:"Failed to load patch notes",console.error("Error loading patch notes:",l)}finally{i.value=!1}},o={added:{icon:"✨",label:"Added",color:"#48bb78"},improved:{icon:"🚀",label:"Improved",color:"#4299e1"},fixed:{icon:"🔧",label:"Fixed",color:"#ed8936"},removed:{icon:"🗑️",label:"Removed",color:"#f56565"}},a=l=>{const c=new Date(l),f=new Date().getTime()-c.getTime(),h=Math.floor(f/6e4),m=Math.floor(f/36e5),_=Math.floor(f/864e5);return h<60?`${h} minute${h!==1?"s":""} ago`:m<24?`${m} hour${m!==1?"s":""} ago`:`${_} day${_!==1?"s":""} ago`};return Ct(()=>{r()}),(l,c)=>(N(),B("div",{class:Be(["patch-notes-page",{dark:ve(e).darkMode}])},[c[0]||(c[0]=d("div",{class:"patch-notes-header"},[d("h1",null,"📝 Patch Notes"),d("p",{class:"subtitle"},"Track all changes and updates")],-1)),d("div",OU,[i.value?(N(),B("div",BU,"Loading patch notes...")):s.value?(N(),B("div",VU,V(s.value),1)):(N(!0),B($e,{key:2},Qe(t.value,(u,f)=>(N(),B("div",{key:u.id,class:"patch-note"},[d("div",zU,[d("div",HU,"v"+V(u.version),1),d("div",GU,"Build #"+V(u.buildNumber)+" • "+V(a(u.buildTime)),1)]),d("h2",$U,V(u.title),1),d("div",WU,[(N(!0),B($e,null,Qe(u.changes,(h,m)=>(N(),B("div",{key:m,class:Be(["change-item",`change-${h.type}`])},[d("span",XU,V(o[h.type].icon),1),d("span",qU,V(o[h.type].label),1),d("span",jU,V(h.description),1)],2))),128))])]))),128))]),c[1]||(c[1]=d("div",{class:"footer-note"},[d("p",null,"💡 Check back regularly for updates!"),d("p",null,[Lt("🔗 View API documentation at "),d("a",{href:"/api-docs",target:"_blank"},"/api-docs")])],-1))],2))}}),KU=ct(YU,[["__scopeId","data-v-bc6f3a13"]]),ZU=[{path:"/",name:"home",component:Zy},{path:"/fishing",name:"fishing",component:wN},{path:"/character-tinder",name:"character-tinder",component:gU},{path:"/girl",name:"girl",component:Qy},{path:"/gender",name:"phrenology",component:bS},{path:"/about",name:"about",component:CS},{path:"/rankings",name:"rankings",component:FS},{path:"/cats",name:"cats",component:VS},{path:"/stocks",name:"stocks",component:Rb},{path:"/movies",name:"movies",component:P1},{path:"/countdowns",name:"countdowns",component:Q1},{path:"/tickets",name:"tickets",component:vT},{path:"/clocks",name:"clocks",component:fA},{path:"/music",name:"music",component:mA},{path:"/opinion",name:"opinion",component:AA},{path:"/mold",name:"mold",component:HA},{path:"/clicker",name:"clicker",component:pC},{path:"/shop",name:"shop",component:zC},{path:"/api-docs",name:"api-docs",component:KC},{path:"/auth",name:"auth",component:JR},{path:"/wordcloud",name:"wordcloud",component:TU},{path:"/keanu",name:"keanu",component:kU},{path:"/patch-notes",name:"patch-notes",component:KU}],JU=Z0({history:P0(),routes:ZU}),Yu=k_(Ty),QU=V_();Yu.use(QU);Yu.use(JU);Yu.mount("#app");
