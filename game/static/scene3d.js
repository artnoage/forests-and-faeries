var EmberScene=(()=>{var oh=Object.defineProperty;var p0=Object.getOwnPropertyDescriptor;var m0=Object.getOwnPropertyNames;var g0=Object.prototype.hasOwnProperty;var _0=(s,e)=>{for(var t in e)oh(s,t,{get:e[t],enumerable:!0})},y0=(s,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of m0(e))!g0.call(s,i)&&i!==t&&oh(s,i,{get:()=>e[i],enumerable:!(n=p0(e,i))||n.enumerable});return s};var x0=s=>y0(oh({},"__esModule",{value:!0}),s);var Ib={};_0(Ib,{PRESET_DEFAULT_THEME:()=>km,THEME_CATALOG:()=>Bm,createViewer:()=>Pb,disposeAssets:()=>Fm,getAssetState:()=>$c,getCastState:()=>Ef,getUndeadState:()=>Tf,prepareAssets:()=>Om,resolveCastKey:()=>or});/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var Ms={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},bs={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Hd=0,Zh=1,Gd=2;var $s=1,Vd=2,to=3,Li=0,Gn=1,An=2,Js=0,Ss=1,js=2,$h=3,Jh=4,Wd=5;var Qs=100,Xd=101,qd=102,Yd=103,Kd=104,Zd=200,$d=201,Jd=202,jd=203,jh=204,Qh=205,Qd=206,ep=207,tp=208,np=209,ip=210,sp=211,rp=212,op=213,ap=214,_l=0,yl=1,xl=2,Lr=3,vl=4,Ml=5,bl=6,Sl=7,eu=0,lp=1,cp=2,Di=0,tu=1,nu=2,iu=3,ha=4,su=5,ru=6,ou=7,Uh="attached",hp="detached",au=300,er=301,no=302,Xl=303,ql=304,ti=1e3,ai=1001,Dr=1002,dn=1003,Yl=1004;var tr=1005;var bn=1006,io=1007;var hi=1008;var Kn=1009,lu=1010,cu=1011,so=1012,Kl=1013,vi=1014,si=1015,Mi=1016,Zl=1017,$l=1018,nr=1020,hu=35902,uu=35899,fu=1021,du=1022,ui=1023,qi=1026,is=1027,Jl=1028,jl=1029,Es=1030,Ql=1031;var ec=1033,ua=33776,fa=33777,da=33778,pa=33779,tc=35840,nc=35841,ic=35842,sc=35843,rc=36196,oc=37492,ac=37496,lc=37488,cc=37489,ma=37490,hc=37491,uc=37808,fc=37809,dc=37810,pc=37811,mc=37812,gc=37813,_c=37814,yc=37815,xc=37816,vc=37817,Mc=37818,bc=37819,Sc=37820,Ec=37821,Tc=36492,wc=36494,Ac=36495,Rc=36283,Cc=36284,ga=36285,Pc=36286,Ic=2200,up=2201,fp=2202,Us=2300,Os=2301,ml=2302,Oh=2303,Ls=2400,Ds=2401,Po=2402,Lc=2500,dp=2501,pu=0,_a=1,ro=2,pp=3200;var Dc=0,mp=1,ss="",Yt="srgb",Fn="srgb-linear",Io="linear",Gt="srgb";var gl=7680;var gp=519,_p=512,yp=513,xp=514,mu=515,vp=516,Mp=517,gu=518,_u=519,yu=35044;var xu="300 es",li=2e3,Nr=2001;function v0(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function M0(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ur(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function bp(){let s=Ur("canvas");return s.style.display="block",s}var Xf={},Or=null;function Lo(...s){let e="THREE."+s.shift();Or?Or("log",e,...s):console.log(e,...s)}function Sp(s){let e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function st(...s){s=Sp(s);let e="THREE."+s.shift();if(Or)Or("warn",e,...s);else{let t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function ht(...s){s=Sp(s);let e="THREE."+s.shift();if(Or)Or("error",e,...s);else{let t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function Ns(...s){let e=s.join(" ");e in Xf||(Xf[e]=!0,st(...s))}function Ep(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Tp={[_l]:_l,[xl]:bl,[vl]:vl,[Lr]:Ml,[yl]:yl,[bl]:xl,[Sl]:Sl,[Ml]:Lr},ci=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}},Pn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qf=1234567,wo=Math.PI/180,Fs=180/Math.PI;function bi(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Pn[s&255]+Pn[s>>8&255]+Pn[s>>16&255]+Pn[s>>24&255]+"-"+Pn[e&255]+Pn[e>>8&255]+"-"+Pn[e>>16&15|64]+Pn[e>>24&255]+"-"+Pn[t&63|128]+Pn[t>>8&255]+"-"+Pn[t>>16&255]+Pn[t>>24&255]+Pn[n&255]+Pn[n>>8&255]+Pn[n>>16&255]+Pn[n>>24&255]).toLowerCase()}function xt(s,e,t){return Math.max(e,Math.min(t,s))}function vu(s,e){return(s%e+e)%e}function b0(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function S0(s,e,t){return s!==e?(t-s)/(e-s):0}function Ao(s,e,t){return(1-t)*s+t*e}function E0(s,e,t,n){return Ao(s,e,1-Math.exp(-t*n))}function T0(s,e=1){return e-Math.abs(vu(s,e*2)-e)}function w0(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function A0(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function R0(s,e){return s+Math.floor(Math.random()*(e-s+1))}function C0(s,e){return s+Math.random()*(e-s)}function P0(s){return s*(.5-Math.random())}function I0(s){s!==void 0&&(qf=s);let e=qf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function L0(s){return s*wo}function D0(s){return s*Fs}function N0(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function U0(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Mu(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function O0(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),f=r((e-n)/2),h=o((e-n)/2),d=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*u,l*f,l*h,a*c);break;case"YZY":s.set(l*h,a*u,l*f,a*c);break;case"ZXZ":s.set(l*f,l*h,a*u,a*c);break;case"XZX":s.set(a*u,l*g,l*d,a*c);break;case"YXY":s.set(l*d,a*u,l*g,a*c);break;case"ZYZ":s.set(l*g,l*d,a*u,a*c);break;default:st("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Nc(s){switch(s.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function bu(s,e){if(e.constructor===Float32Array)return s;let t=Nc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(s/t,-1)}function Su(s,e){if(e.constructor===Float32Array)return s;let t=Nc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(s*t)}var an={DEG2RAD:wo,RAD2DEG:Fs,generateUUID:bi,clamp:xt,euclideanModulo:vu,mapLinear:b0,inverseLerp:S0,lerp:Ao,damp:E0,pingpong:T0,smoothstep:w0,smootherstep:A0,randInt:R0,randFloat:C0,randFloatSpread:P0,seededRandom:I0,degToRad:L0,radToDeg:D0,isPowerOfTwo:N0,ceilPowerOfTwo:U0,floorPowerOfTwo:Mu,setQuaternionFromProperEuler:O0,normalize:Su,denormalize:bu},ve=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Mn=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],u=n[i+2],f=n[i+3],h=r[o+0],d=r[o+1],g=r[o+2],_=r[o+3];if(f!==_||l!==h||c!==d||u!==g){let p=l*h+c*d+u*g+f*_;p<0&&(h=-h,d=-d,g=-g,_=-_,p=-p);let m=1-a;if(p<.9995){let y=Math.acos(p),v=Math.sin(y);m=Math.sin(m*y)/v,a=Math.sin(a*y)/v,l=l*m+h*a,c=c*m+d*a,u=u*m+g*a,f=f*m+_*a}else{l=l*m+h*a,c=c*m+d*a,u=u*m+g*a,f=f*m+_*a;let y=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=y,c*=y,u*=y,f*=y}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],l=n[i+1],c=n[i+2],u=n[i+3],f=r[o],h=r[o+1],d=r[o+2],g=r[o+3];return e[t]=a*g+u*f+l*d-c*h,e[t+1]=l*g+u*h+c*f-a*d,e[t+2]=c*g+u*d+a*h-l*f,e[t+3]=u*g-a*f-l*h-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(i/2),f=a(r/2),h=l(n/2),d=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f-h*d*g;break;case"YXZ":this._x=h*u*f+c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f+h*d*g;break;case"ZXY":this._x=h*u*f-c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f-h*d*g;break;case"ZYX":this._x=h*u*f-c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f+h*d*g;break;case"YZX":this._x=h*u*f+c*d*g,this._y=c*d*f+h*u*g,this._z=c*u*g-h*d*f,this._w=c*u*f-h*d*g;break;case"XZY":this._x=h*u*f-c*d*g,this._y=c*d*f-h*u*g,this._z=c*u*g+h*d*f,this._w=c*u*f+h*d*g;break;default:st("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],f=t[10],h=n+a+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-i)*d}else if(n>a&&n>f){let d=2*Math.sqrt(1+n-a-f);this._w=(u-l)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(r+c)/d}else if(a>f){let d=2*Math.sqrt(1+a-n-f);this._w=(r-c)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+f-n-a);this._w=(o-i)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(xt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+i*c-r*l,this._y=i*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-i*a,this._w=o*u-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Yf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Yf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),u=2*(a*t-r*i),f=2*(r*n-o*t);return this.x=t+l*c+o*f-a*u,this.y=n+l*u+a*c-r*f,this.z=i+l*f+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ah.copy(this).projectOnVector(e),this.sub(ah)}reflect(e){return this.sub(ah.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ah=new L,Yf=new Mn,mt=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,i,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=i,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],g=n[8],_=i[0],p=i[3],m=i[6],y=i[1],v=i[4],M=i[7],R=i[2],A=i[5],b=i[8];return r[0]=o*_+a*y+l*R,r[3]=o*p+a*v+l*A,r[6]=o*m+a*M+l*b,r[1]=c*_+u*y+f*R,r[4]=c*p+u*v+f*A,r[7]=c*m+u*M+f*b,r[2]=h*_+d*y+g*R,r[5]=h*p+d*v+g*A,r[8]=h*m+d*M+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+i*r*c-i*o*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=u*o-a*c,h=a*l-u*r,d=c*r-o*l,g=t*f+n*h+i*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=f*_,e[1]=(i*c-u*n)*_,e[2]=(a*n-i*o)*_,e[3]=h*_,e[4]=(u*t-i*l)*_,e[5]=(i*r-a*t)*_,e[6]=d*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Ns("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(lh.makeScale(e,t)),this}rotate(e){return Ns("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(lh.makeRotation(-e)),this}translate(e,t){return Ns("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(lh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},lh=new mt,Kf=new mt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Zf=new mt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function F0(){let s={enabled:!0,workingColorSpace:Fn,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Gt&&(i.r=Xi(i.r),i.g=Xi(i.g),i.b=Xi(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Gt&&(i.r=Pr(i.r),i.g=Pr(i.g),i.b=Pr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ss?Io:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Fn]:{primaries:e,whitePoint:n,transfer:Io,toXYZ:Kf,fromXYZ:Zf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Yt},outputColorSpaceConfig:{drawingBufferColorSpace:Yt}},[Yt]:{primaries:e,whitePoint:n,transfer:Gt,toXYZ:Kf,fromXYZ:Zf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Yt}}}),s}var bt=F0();function Xi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Pr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var fr,El=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{fr===void 0&&(fr=Ur("canvas")),fr.width=e.width,fr.height=e.height;let i=fr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=fr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ur("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Xi(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Xi(t[n]/255)*255):t[n]=Xi(t[n]);return{data:t,width:e.width,height:e.height}}else return st("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},B0=0,Fr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:B0++}),this.uuid=bi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(ch(i[o].image)):r.push(ch(i[o]))}else r=ch(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function ch(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?El.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(st("Texture: Unable to serialize Texture."),{})}var k0=0,hh=new L,pn=class s extends ci{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=ai,i=ai,r=bn,o=hi,a=ui,l=Kn,c=s.DEFAULT_ANISOTROPY,u=ss){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:k0++}),this.uuid=bi(),this.name="",this.source=new Fr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ve(0,0),this.repeat=new ve(1,1),this.center=new ve(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new mt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(hh).x}get height(){return this.source.getSize(hh).y}get depth(){return this.source.getSize(hh).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){st(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){st(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==au)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ti:e.x=e.x-Math.floor(e.x);break;case ai:e.x=e.x<0?0:1;break;case Dr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ti:e.y=e.y-Math.floor(e.y);break;case ai:e.y=e.y<0?0:1;break;case Dr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=au;pn.DEFAULT_ANISOTROPY=1;var Xt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,l=e.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let v=(c+1)/2,M=(d+1)/2,R=(m+1)/2,A=(u+h)/4,b=(f+_)/4,T=(g+p)/4;return v>M&&v>R?v<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(v),i=A/n,r=b/n):M>R?M<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(M),n=A/i,r=T/i):R<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(R),n=b/r,i=T/r),this.set(n,i,r,t),this}let y=Math.sqrt((p-g)*(p-g)+(f-_)*(f-_)+(h-u)*(h-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(f-_)/y,this.z=(h-u)/y,this.w=Math.acos((c+d+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this.w=xt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this.w=xt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Tl=class extends ci{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Xt(0,0,e,t),this.scissorTest=!1,this.viewport=new Xt(0,0,e,t),this.textures=[];let i=n.count;for(let r=0;r<i;r++)this.textures[r]=new pn({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:bn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Fr(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ni=class extends Tl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Do=class extends pn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=dn,this.minFilter=dn,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var wl=class extends pn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=dn,this.minFilter=dn,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ft=class s{static{this.prototype.isMatrix4=!0}constructor(e,t,n,i,r,o,a,l,c,u,f,h,d,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,u,f,h,d,g,_,p)}set(e,t,n,i,r,o,a,l,c,u,f,h,d,g,_,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=f,m[14]=h,m[3]=d,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,i=1/dr.setFromMatrixColumn(e,0).length(),r=1/dr.setFromMatrixColumn(e,1).length(),o=1/dr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let h=o*u,d=o*f,g=a*u,_=a*f;t[0]=l*u,t[4]=-l*f,t[8]=c,t[1]=d+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*u,d=l*f,g=c*u,_=c*f;t[0]=h+_*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=d*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*u,d=l*f,g=c*u,_=c*f;t[0]=h-_*a,t[4]=-o*f,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*u,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*u,d=o*f,g=a*u,_=a*f;t[0]=l*u,t[4]=g*c-d,t[8]=h*c+_,t[1]=l*f,t[5]=_*c+h,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-h*f,t[8]=g*f+d,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=d*f+g,t[10]=h-_*f}else if(e.order==="XZY"){let h=o*l,d=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-f,t[8]=c*u,t[1]=h*f+_,t[5]=o*u,t[9]=d*f-g,t[2]=g*f-d,t[6]=a*u,t[10]=_*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(z0,e,H0)}lookAt(e,t,n){let i=this.elements;return Qn.subVectors(e,t),Qn.lengthSq()===0&&(Qn.z=1),Qn.normalize(),ls.crossVectors(n,Qn),ls.lengthSq()===0&&(Math.abs(n.z)===1?Qn.x+=1e-4:Qn.z+=1e-4,Qn.normalize(),ls.crossVectors(n,Qn)),ls.normalize(),ka.crossVectors(Qn,ls),i[0]=ls.x,i[4]=ka.x,i[8]=Qn.x,i[1]=ls.y,i[5]=ka.y,i[9]=Qn.y,i[2]=ls.z,i[6]=ka.z,i[10]=Qn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],g=n[2],_=n[6],p=n[10],m=n[14],y=n[3],v=n[7],M=n[11],R=n[15],A=i[0],b=i[4],T=i[8],F=i[12],I=i[1],k=i[5],G=i[9],H=i[13],U=i[2],K=i[6],Q=i[10],W=i[14],ge=i[3],ee=i[7],de=i[11],Me=i[15];return r[0]=o*A+a*I+l*U+c*ge,r[4]=o*b+a*k+l*K+c*ee,r[8]=o*T+a*G+l*Q+c*de,r[12]=o*F+a*H+l*W+c*Me,r[1]=u*A+f*I+h*U+d*ge,r[5]=u*b+f*k+h*K+d*ee,r[9]=u*T+f*G+h*Q+d*de,r[13]=u*F+f*H+h*W+d*Me,r[2]=g*A+_*I+p*U+m*ge,r[6]=g*b+_*k+p*K+m*ee,r[10]=g*T+_*G+p*Q+m*de,r[14]=g*F+_*H+p*W+m*Me,r[3]=y*A+v*I+M*U+R*ge,r[7]=y*b+v*k+M*K+R*ee,r[11]=y*T+v*G+M*Q+R*de,r[15]=y*F+v*H+M*W+R*Me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],f=e[6],h=e[10],d=e[14],g=e[3],_=e[7],p=e[11],m=e[15],y=l*d-c*h,v=a*d-c*f,M=a*h-l*f,R=o*d-c*u,A=o*h-l*u,b=o*f-a*u;return t*(_*y-p*v+m*M)-n*(g*y-p*R+m*A)+i*(g*v-_*R+m*b)-r*(g*M-_*A+p*b)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-n*(r*u-a*l)+i*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],f=e[9],h=e[10],d=e[11],g=e[12],_=e[13],p=e[14],m=e[15],y=t*a-n*o,v=t*l-i*o,M=t*c-r*o,R=n*l-i*a,A=n*c-r*a,b=i*c-r*l,T=u*_-f*g,F=u*p-h*g,I=u*m-d*g,k=f*p-h*_,G=f*m-d*_,H=h*m-d*p,U=y*H-v*G+M*k+R*I-A*F+b*T;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let K=1/U;return e[0]=(a*H-l*G+c*k)*K,e[1]=(i*G-n*H-r*k)*K,e[2]=(_*b-p*A+m*R)*K,e[3]=(h*A-f*b-d*R)*K,e[4]=(l*I-o*H-c*F)*K,e[5]=(t*H-i*I+r*F)*K,e[6]=(p*M-g*b-m*v)*K,e[7]=(u*b-h*M+d*v)*K,e[8]=(o*G-a*I+c*T)*K,e[9]=(n*I-t*G-r*T)*K,e[10]=(g*A-_*M+m*y)*K,e[11]=(f*M-u*A-d*y)*K,e[12]=(a*F-o*k-l*T)*K,e[13]=(t*k-n*F+i*T)*K,e[14]=(_*v-g*R-p*y)*K,e[15]=(u*R-f*v+h*y)*K,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,u*a+n,u*l-i*o,0,c*l-i*a,u*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,f=a+a,h=r*c,d=r*u,g=r*f,_=o*u,p=o*f,m=a*f,y=l*c,v=l*u,M=l*f,R=n.x,A=n.y,b=n.z;return i[0]=(1-(_+m))*R,i[1]=(d+M)*R,i[2]=(g-v)*R,i[3]=0,i[4]=(d-M)*A,i[5]=(1-(h+m))*A,i[6]=(p+y)*A,i[7]=0,i[8]=(g+v)*b,i[9]=(p-y)*b,i[10]=(1-(h+_))*b,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=dr.set(i[0],i[1],i[2]).length(),a=dr.set(i[4],i[5],i[6]).length(),l=dr.set(i[8],i[9],i[10]).length();r<0&&(o=-o),_i.copy(this);let c=1/o,u=1/a,f=1/l;return _i.elements[0]*=c,_i.elements[1]*=c,_i.elements[2]*=c,_i.elements[4]*=u,_i.elements[5]*=u,_i.elements[6]*=u,_i.elements[8]*=f,_i.elements[9]*=f,_i.elements[10]*=f,t.setFromRotationMatrix(_i),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,i,r,o,a=li,l=!1){let c=this.elements,u=2*r/(t-e),f=2*r/(n-i),h=(t+e)/(t-e),d=(n+i)/(n-i),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===li)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Nr)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=li,l=!1){let c=this.elements,u=2/(t-e),f=2/(n-i),h=-(t+e)/(t-e),d=-(n+i)/(n-i),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===li)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Nr)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},dr=new L,_i=new ft,z0=new L(0,0,0),H0=new L(1,1,1),ls=new L,ka=new L,Qn=new L,$f=new ft,Jf=new Mn,Yi=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],u=i[9],f=i[2],h=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(xt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-xt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(xt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-xt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(xt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-xt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:st("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return $f.makeRotationFromQuaternion(e),this.setFromRotationMatrix($f,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Jf.setFromEuler(this),this.setFromQuaternion(Jf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Yi.DEFAULT_ORDER="XYZ";var Br=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},G0=0,jf=new L,pr=new Mn,Bi=new ft,za=new L,fo=new L,V0=new L,W0=new Mn,Qf=new L(1,0,0),ed=new L(0,1,0),td=new L(0,0,1),nd={type:"added"},X0={type:"removed"},mr={type:"childadded",child:null},uh={type:"childremoved",child:null},Ft=class s extends ci{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:G0++}),this.uuid=bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new L,t=new Yi,n=new Mn,i=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new ft},normalMatrix:{value:new mt}}),this.matrix=new ft,this.matrixWorld=new ft,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Br,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.multiply(pr),this}rotateOnWorldAxis(e,t){return pr.setFromAxisAngle(e,t),this.quaternion.premultiply(pr),this}rotateX(e){return this.rotateOnAxis(Qf,e)}rotateY(e){return this.rotateOnAxis(ed,e)}rotateZ(e){return this.rotateOnAxis(td,e)}translateOnAxis(e,t){return jf.copy(e).applyQuaternion(this.quaternion),this.position.add(jf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qf,e)}translateY(e){return this.translateOnAxis(ed,e)}translateZ(e){return this.translateOnAxis(td,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Bi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?za.copy(e):za.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),fo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bi.lookAt(fo,za,this.up):Bi.lookAt(za,fo,this.up),this.quaternion.setFromRotationMatrix(Bi),i&&(Bi.extractRotation(i.matrixWorld),pr.setFromRotationMatrix(Bi),this.quaternion.premultiply(pr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ht("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(nd),mr.child=e,this.dispatchEvent(mr),mr.child=null):ht("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(X0),uh.child=e,this.dispatchEvent(uh),uh.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Bi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Bi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Bi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(nd),mr.child=e,this.dispatchEvent(mr),mr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fo,e,V0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fo,W0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,i=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*i,r[13]+=n-r[1]*t-r[5]*n-r[9]*i,r[14]+=i-r[2]*t-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ft.DEFAULT_UP=new L(0,1,0);Ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var We=class extends Ft{constructor(){super(),this.isGroup=!0,this.type="Group"}},q0={type:"move"},kr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let p=t.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&h>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(q0)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new We;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},wp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},cs={h:0,s:0,l:0},Ha={h:0,s:0,l:0};function fh(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var it=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,bt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=bt.workingColorSpace){return this.r=e,this.g=t,this.b=n,bt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=bt.workingColorSpace){if(e=vu(e,1),t=xt(t,0,1),n=xt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=fh(o,r,e+1/3),this.g=fh(o,r,e),this.b=fh(o,r,e-1/3)}return bt.colorSpaceToWorking(this,i),this}setStyle(e,t=Yt){function n(r){r!==void 0&&parseFloat(r)<1&&st("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:st("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);st("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Yt){let n=wp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):st("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Xi(e.r),this.g=Xi(e.g),this.b=Xi(e.b),this}copyLinearToSRGB(e){return this.r=Pr(e.r),this.g=Pr(e.g),this.b=Pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Yt){return bt.workingToColorSpace(In.copy(this),e),Math.round(xt(In.r*255,0,255))*65536+Math.round(xt(In.g*255,0,255))*256+Math.round(xt(In.b*255,0,255))}getHexString(e=Yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=bt.workingColorSpace){bt.workingToColorSpace(In.copy(this),t);let n=In.r,i=In.g,r=In.b,o=Math.max(n,i,r),a=Math.min(n,i,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case n:l=(i-r)/f+(i<r?6:0);break;case i:l=(r-n)/f+2;break;case r:l=(n-i)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=bt.workingColorSpace){return bt.workingToColorSpace(In.copy(this),t),e.r=In.r,e.g=In.g,e.b=In.b,e}getStyle(e=Yt){bt.workingToColorSpace(In.copy(this),e);let t=In.r,n=In.g,i=In.b;return e!==Yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(cs),this.setHSL(cs.h+e,cs.s+t,cs.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(cs),e.getHSL(Ha);let n=Ao(cs.h,Ha.h,t),i=Ao(cs.s,Ha.s,t),r=Ao(cs.l,Ha.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},In=new it;it.NAMES=wp;var No=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new it(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Uo=class extends Ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yi,this.environmentIntensity=1,this.environmentRotation=new Yi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},yi=new L,ki=new L,dh=new L,zi=new L,gr=new L,_r=new L,id=new L,ph=new L,mh=new L,gh=new L,_h=new Xt,yh=new Xt,xh=new Xt,Wi=class s{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),yi.subVectors(e,t),i.cross(yi);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){yi.subVectors(i,t),ki.subVectors(n,t),dh.subVectors(e,t);let o=yi.dot(yi),a=yi.dot(ki),l=yi.dot(dh),c=ki.dot(ki),u=ki.dot(dh),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(c*l-a*u)*h,g=(o*u-a*l)*h;return r.set(1-d-g,g,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,zi)===null?!1:zi.x>=0&&zi.y>=0&&zi.x+zi.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,zi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,zi.x),l.addScaledVector(o,zi.y),l.addScaledVector(a,zi.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return _h.setScalar(0),yh.setScalar(0),xh.setScalar(0),_h.fromBufferAttribute(e,t),yh.fromBufferAttribute(e,n),xh.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(_h,r.x),o.addScaledVector(yh,r.y),o.addScaledVector(xh,r.z),o}static isFrontFacing(e,t,n,i){return yi.subVectors(n,t),ki.subVectors(e,t),yi.cross(ki).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yi.subVectors(this.c,this.b),ki.subVectors(this.a,this.b),yi.cross(ki).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,o,a;gr.subVectors(i,n),_r.subVectors(r,n),ph.subVectors(e,n);let l=gr.dot(ph),c=_r.dot(ph);if(l<=0&&c<=0)return t.copy(n);mh.subVectors(e,i);let u=gr.dot(mh),f=_r.dot(mh);if(u>=0&&f<=u)return t.copy(i);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return o=l/(l-u),t.copy(n).addScaledVector(gr,o);gh.subVectors(e,r);let d=gr.dot(gh),g=_r.dot(gh);if(g>=0&&d<=g)return t.copy(r);let _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(_r,a);let p=u*g-d*f;if(p<=0&&f-u>=0&&d-g>=0)return id.subVectors(r,i),a=(f-u)/(f-u+(d-g)),t.copy(i).addScaledVector(id,a);let m=1/(p+_+h);return o=_*m,a=h*m,t.copy(n).addScaledVector(gr,o).addScaledVector(_r,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Bn=class{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(xi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(xi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=xi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,xi):xi.fromBufferAttribute(r,o),xi.applyMatrix4(e.matrixWorld),this.expandByPoint(xi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ga.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ga.copy(n.boundingBox)),Ga.applyMatrix4(e.matrixWorld),this.union(Ga)}let i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xi),xi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(po),Va.subVectors(this.max,po),yr.subVectors(e.a,po),xr.subVectors(e.b,po),vr.subVectors(e.c,po),hs.subVectors(xr,yr),us.subVectors(vr,xr),Rs.subVectors(yr,vr);let t=[0,-hs.z,hs.y,0,-us.z,us.y,0,-Rs.z,Rs.y,hs.z,0,-hs.x,us.z,0,-us.x,Rs.z,0,-Rs.x,-hs.y,hs.x,0,-us.y,us.x,0,-Rs.y,Rs.x,0];return!vh(t,yr,xr,vr,Va)||(t=[1,0,0,0,1,0,0,0,1],!vh(t,yr,xr,vr,Va))?!1:(Wa.crossVectors(hs,us),t=[Wa.x,Wa.y,Wa.z],vh(t,yr,xr,vr,Va))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Hi=[new L,new L,new L,new L,new L,new L,new L,new L],xi=new L,Ga=new Bn,yr=new L,xr=new L,vr=new L,hs=new L,us=new L,Rs=new L,po=new L,Va=new L,Wa=new L,Cs=new L;function vh(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Cs.fromArray(s,r);let a=i.x*Math.abs(Cs.x)+i.y*Math.abs(Cs.y)+i.z*Math.abs(Cs.z),l=e.dot(Cs),c=t.dot(Cs),u=n.dot(Cs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var mn=new L,Xa=new ve,Y0=0,Rn=class extends ci{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Y0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=yu,this.updateRanges=[],this.gpuType=si,this.version=0,this._normalizationScale=e!==void 0?Nc(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xa.fromBufferAttribute(this,t),Xa.applyMatrix3(e),this.setXY(t,Xa.x,Xa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyMatrix3(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyMatrix4(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.applyNormalMatrix(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mn.fromBufferAttribute(this,t),mn.transformDirection(e),this.setXYZ(t,mn.x,mn.y,mn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):bu(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Su(e,this.array)}};var Oo=class extends Rn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Fo=class extends Rn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var St=class extends Rn{constructor(e,t,n){super(new Float32Array(e),t,n)}},K0=new Bn,mo=new L,Mh=new L,qn=class{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):K0.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;mo.subVectors(e,this.center);let t=mo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(mo,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Mh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(mo.copy(e.center).add(Mh)),this.expandByPoint(mo.copy(e.center).sub(Mh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Z0=0,oi=new ft,bh=new Ft,Mr=new L,ei=new Bn,go=new Bn,wn=new L,on=class s extends ci{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Z0++}),this.uuid=bi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(v0(e)?Fo:Oo)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new mt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return oi.makeRotationFromQuaternion(e),this.applyMatrix4(oi),this}rotateX(e){return oi.makeRotationX(e),this.applyMatrix4(oi),this}rotateY(e){return oi.makeRotationY(e),this.applyMatrix4(oi),this}rotateZ(e){return oi.makeRotationZ(e),this.applyMatrix4(oi),this}translate(e,t,n){return oi.makeTranslation(e,t,n),this.applyMatrix4(oi),this}scale(e,t,n){return oi.makeScale(e,t,n),this.applyMatrix4(oi),this}lookAt(e){return bh.lookAt(e),bh.updateMatrix(),this.applyMatrix4(bh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Mr).negate(),this.translate(Mr.x,Mr.y,Mr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new St(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&st("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Bn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];ei.setFromBufferAttribute(r),this.morphTargetsRelative?(wn.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(wn),wn.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(wn)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){let n=this.boundingSphere.center;if(ei.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];go.setFromBufferAttribute(a),this.morphTargetsRelative?(wn.addVectors(ei.min,go.min),ei.expandByPoint(wn),wn.addVectors(ei.max,go.max),ei.expandByPoint(wn)):(ei.expandByPoint(go.min),ei.expandByPoint(go.max))}ei.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)wn.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(wn));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)wn.fromBufferAttribute(a,c),l&&(Mr.fromBufferAttribute(e,c),wn.add(Mr)),i=Math.max(i,n.distanceToSquared(wn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Rn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let F=0;F<n.count;F++)a[F]=new L,l[F]=new L;let u=new L,f=new L,h=new L,d=new ve,g=new ve,_=new ve,p=new L,m=new L;function y(F,I,k){c[F]=c[I]=c[k]=1,u.fromBufferAttribute(n,F),f.fromBufferAttribute(n,I),h.fromBufferAttribute(n,k),d.fromBufferAttribute(r,F),g.fromBufferAttribute(r,I),_.fromBufferAttribute(r,k),f.sub(u),h.sub(u),g.sub(d),_.sub(d);let G=1/(g.x*_.y-_.x*g.y);isFinite(G)&&(p.copy(f).multiplyScalar(_.y).addScaledVector(h,-g.y).multiplyScalar(G),m.copy(h).multiplyScalar(g.x).addScaledVector(f,-_.x).multiplyScalar(G),a[F].add(p),a[I].add(p),a[k].add(p),l[F].add(m),l[I].add(m),l[k].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let F=0,I=v.length;F<I;++F){let k=v[F],G=k.start,H=k.count;for(let U=G,K=G+H;U<K;U+=3)y(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let M=new L,R=new L,A=new L,b=new L;function T(F){A.fromBufferAttribute(i,F),b.copy(A);let I=a[F];M.copy(I),M.sub(A.multiplyScalar(A.dot(I))).normalize(),R.crossVectors(b,I);let G=R.dot(l[F])<0?-1:1;o.setXYZW(F,M.x,M.y,M.z,G)}for(let F=0,I=n.count;F<I;++F)c[F]&&T(F);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Rn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let i=new L,r=new L,o=new L,a=new L,l=new L,c=new L,u=new L,f=new L;if(e)for(let h=0,d=e.count;h<d;h+=3){let g=e.getX(h+0),_=e.getX(h+1),p=e.getX(h+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),u.subVectors(o,r),f.subVectors(i,r),u.cross(f),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,d=t.count;h<d;h+=3)i.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(i,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wn.fromBufferAttribute(e,t),wn.normalize(),e.setXYZ(t,wn.x,wn.y,wn.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u),d=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*u;for(let m=0;m<u;m++)h[g++]=c[d++]}return new Rn(h,u,f)}if(this.index===null)return st("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){let h=c[u],d=e(h,n);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f];u.push(d.toJSON(e.data))}u.length>0&&(i[l]=u,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let c in i){let u=i[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Bs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=yu,this.updateRanges=[],this.version=0,this.uuid=bi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=sd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=sd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function sd(s){return s.buffer._uuid===void 0&&(s.buffer._uuid=bi()),s.byteOffset===0&&s.byteLength===s.buffer.byteLength?s.buffer._uuid:s.buffer._uuid+":"+s.byteOffset+":"+s.byteLength}var Un=new L,ps=class s{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i,this._normalizationScale=e!==void 0?Nc(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Un.fromBufferAttribute(this,t),Un.applyMatrix4(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Un.fromBufferAttribute(this,t),Un.applyNormalMatrix(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Un.fromBufferAttribute(this,t),Un.transformDirection(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Lo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Rn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Lo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):bu(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Su(e,this.data.array)}},Sh=new L,$0=new L,J0=new mt,On=class{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Sh.subVectors(n,t).cross($0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let i=e.delta(Sh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||J0.getNormalMatrix(e),i=this.coplanarPoint(Sh).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},j0=0,kn=class extends ci{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:j0++}),this.uuid=bi(),this.name="",this.type="Material",this.blending=Ss,this.side=Li,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jh,this.blendDst=Qh,this.blendEquation=Qs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new it(0,0,0),this.blendAlpha=0,this.depthFunc=Lr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=gp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gl,this.stencilZFail=gl,this.stencilZPass=gl,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){st(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){st(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new it().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new On().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ve().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ve().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ms=class extends kn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new it(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},br,_o=new L,Sr=new L,Er=new L,Tr=new ve,yo=new ve,Ap=new ft,qa=new L,xo=new L,Ya=new L,rd=new ve,Eh=new ve,od=new ve,ks=class extends Ft{constructor(e=new ms){if(super(),this.isSprite=!0,this.type="Sprite",br===void 0){br=new on;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Bs(t,5);br.setIndex([0,1,2,0,2,3]),br.setAttribute("position",new ps(n,3,0,!1)),br.setAttribute("uv",new ps(n,2,3,!1))}this.geometry=br,this.material=e,this.center=new ve(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&ht('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Sr.setFromMatrixScale(this.matrixWorld),Ap.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Er.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Sr.multiplyScalar(-Er.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;Ka(qa.set(-.5,-.5,0),Er,o,Sr,i,r),Ka(xo.set(.5,-.5,0),Er,o,Sr,i,r),Ka(Ya.set(.5,.5,0),Er,o,Sr,i,r),rd.set(0,0),Eh.set(1,0),od.set(1,1);let a=e.ray.intersectTriangle(qa,xo,Ya,!1,_o);if(a===null&&(Ka(xo.set(-.5,.5,0),Er,o,Sr,i,r),Eh.set(0,1),a=e.ray.intersectTriangle(qa,Ya,xo,!1,_o),a===null))return;let l=e.ray.origin.distanceTo(_o);l<e.near||l>e.far||t.push({distance:l,point:_o.clone(),uv:Wi.getInterpolation(_o,qa,xo,Ya,rd,Eh,od,new ve),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function Ka(s,e,t,n,i,r){Tr.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(yo.x=r*Tr.x-i*Tr.y,yo.y=i*Tr.x+r*Tr.y):yo.copy(Tr),s.copy(e),s.x+=yo.x,s.y+=yo.y,s.applyMatrix4(Ap)}var Gi=new L,Th=new L,Za=new L,$a=new L,Ti=class{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Gi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Gi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Gi.copy(this.origin).addScaledVector(this.direction,t),Gi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Th.copy(e).add(t).multiplyScalar(.5),Za.copy(t).sub(e).normalize(),$a.copy(this.origin).sub(Th);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Za),a=$a.dot(this.direction),l=-$a.dot(Za),c=$a.lengthSq(),u=Math.abs(1-o*o),f,h,d,g;if(u>0)if(f=o*l-a,h=o*a-l,g=r*u,f>=0)if(h>=-g)if(h<=g){let _=1/u;f*=_,h*=_,d=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h<=-g?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=g?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),i&&i.copy(Th).addScaledVector(Za,h),d}intersectSphere(e,t){if(e.radius<0)return null;Gi.subVectors(e.center,this.origin);let n=Gi.dot(this.direction),i=Gi.dot(Gi)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,i=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,i=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Gi)!==null}intersectTriangle(e,t,n,i,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,f=e.x-o.x,h=e.y-o.y,d=e.z-o.z,g=t.x-o.x,_=t.y-o.y,p=t.z-o.z,m=n.x-o.x,y=n.y-o.y,v=n.z-o.z,M=Math.abs(l),R=Math.abs(c),A=Math.abs(u),b,T,F,I,k,G,H,U,K,Q,W,ge;if(M>=R&&M>=A?(F=l,G=f,K=g,ge=m,l>=0?(b=c,T=u,I=h,k=d,H=_,U=p,Q=y,W=v):(b=u,T=c,I=d,k=h,H=p,U=_,Q=v,W=y)):R>=A?(F=c,G=h,K=_,ge=y,c>=0?(b=u,T=l,I=d,k=f,H=p,U=g,Q=v,W=m):(b=l,T=u,I=f,k=d,H=g,U=p,Q=m,W=v)):(F=u,G=d,K=p,ge=v,u>=0?(b=l,T=c,I=f,k=h,H=g,U=_,Q=m,W=y):(b=c,T=l,I=h,k=f,H=_,U=g,Q=y,W=m)),F===0)return null;let ee=b/F,de=T/F,Me=1/F,Re=I-ee*G,nt=k-de*G,X=H-ee*K,pe=U-de*K,Se=Q-ee*ge,Ue=W-de*ge,_e=Se*pe-Ue*X,me=Re*Ue-nt*Se,Ie=X*nt-pe*Re;if(i){if(_e<0||me<0||Ie<0)return null}else if((_e<0||me<0||Ie<0)&&(_e>0||me>0||Ie>0))return null;let xe=_e+me+Ie;if(xe===0)return null;let Ne=Me*(_e*G+me*K+Ie*ge);return(xe>0?Ne<0:Ne>0)?null:this.at(Ne/xe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_n=class extends kn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new it(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.combine=eu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ad=new ft,Ps=new Ti,Ja=new qn,ld=new L,ja=new L,Qa=new L,el=new L,wh=new L,tl=new L,cd=new L,nl=new L,tn=class extends Ft{constructor(e=new on,t=new _n){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(r&&a){tl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],f=r[l];u!==0&&(wh.fromBufferAttribute(f,e),o?tl.addScaledVector(wh,u):tl.addScaledVector(wh.sub(t),u))}t.add(tl)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ja.copy(n.boundingSphere),Ja.applyMatrix4(r),Ps.copy(e.ray).recast(e.near),!(Ja.containsPoint(Ps.origin)===!1&&(Ps.intersectSphere(Ja,ld)===null||Ps.origin.distanceToSquared(ld)>(e.far-e.near)**2))&&(ad.copy(r).invert(),Ps.copy(e.ray).applyMatrix4(ad),!(n.boundingBox!==null&&Ps.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ps)))}_computeIntersections(e,t,n){let i,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),v=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let M=y,R=v;M<R;M+=3){let A=a.getX(M),b=a.getX(M+1),T=a.getX(M+2);i=il(this,m,e,n,c,u,f,A,b,T),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){let y=a.getX(p),v=a.getX(p+1),M=a.getX(p+2);i=il(this,o,e,n,c,u,f,y,v,M),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,d.start),v=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let M=y,R=v;M<R;M+=3){let A=M,b=M+1,T=M+2;i=il(this,m,e,n,c,u,f,A,b,T),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let p=g,m=_;p<m;p+=3){let y=p,v=p+1,M=p+2;i=il(this,o,e,n,c,u,f,y,v,M),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}};function Q0(s,e,t,n,i,r,o,a){let l;if(e.side===Gn?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===Li,a),l===null)return null;nl.copy(a),nl.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(nl);return c<t.near||c>t.far?null:{distance:c,point:nl.clone(),object:s}}function il(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,ja),s.getVertexPosition(l,Qa),s.getVertexPosition(c,el);let u=Q0(s,e,t,n,ja,Qa,el,cd);if(u){let f=new L;Wi.getBarycoord(cd,ja,Qa,el,f),i&&(u.uv=Wi.getInterpolatedAttribute(i,a,l,c,f,new ve)),r&&(u.uv1=Wi.getInterpolatedAttribute(r,a,l,c,f,new ve)),o&&(u.normal=Wi.getInterpolatedAttribute(o,a,l,c,f,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new L,materialIndex:0};Wi.getNormal(ja,Qa,el,h.normal),u.face=h,u.barycoord=f}return u}var vo=new Xt,hd=new Xt,ud=new Xt,eg=new Xt,fd=new ft,sl=new L,Ah=new qn,dd=new ft,Rh=new Ti,Bo=class extends tn{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Uh,this.bindMatrix=new ft,this.bindMatrixInverse=new ft,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Bn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sl),this.boundingBox.expandByPoint(sl)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new qn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sl),this.boundingSphere.expandByPoint(sl)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ah.copy(this.boundingSphere),Ah.applyMatrix4(i),e.ray.intersectsSphere(Ah)!==!1&&(dd.copy(i).invert(),Rh.copy(e.ray).applyMatrix4(dd),!(this.boundingBox!==null&&Rh.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Rh)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Xt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Uh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===hp?this.bindMatrixInverse.copy(this.bindMatrix).invert():st("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;hd.fromBufferAttribute(i.attributes.skinIndex,e),ud.fromBufferAttribute(i.attributes.skinWeight,e),t.isVector4?(vo.copy(t),t.set(0,0,0,0)):(vo.set(t.x,t.y,t.z,1),t.set(0,0,0)),vo.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=ud.getComponent(r);if(o!==0){let a=hd.getComponent(r);fd.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(eg.copy(vo).applyMatrix4(fd),o)}}return t.isVector4&&(t.w=vo.w),t.applyMatrix4(this.bindMatrixInverse)}},zr=class extends Ft{constructor(){super(),this.isBone=!0,this.type="Bone"}},Hr=class extends pn{constructor(e=null,t=1,n=1,i,r,o,a,l,c=dn,u=dn,f,h){super(null,o,a,l,c,u,i,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},pd=new ft,tg=new ft,ko=class s{constructor(e=[],t=[]){this.uuid=bi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){st("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new ft)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new ft;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:tg;pd.multiplyMatrices(a,t[r]),pd.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Hr(t,e,e,ui,si);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(st("Skeleton: No bone found with UUID:",r),o=new zr),this.bones.push(o),this.boneInverses.push(new ft().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}},Ki=class extends Rn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},wr=new ft,md=new ft,rl=[],gd=new Bn,ng=new ft,Mo=new tn,bo=new qn,Zi=class extends tn{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ki(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ng)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Bn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,wr),gd.copy(e.boundingBox).applyMatrix4(wr),this.boundingBox.union(gd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new qn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,wr),bo.copy(e.boundingSphere).applyMatrix4(wr),this.boundingSphere.union(bo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(Mo.geometry=this.geometry,Mo.material=this.material,Mo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),bo.copy(this.boundingSphere),bo.applyMatrix4(n),e.ray.intersectsSphere(bo)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,wr),md.multiplyMatrices(n,wr),Mo.matrixWorld=md,Mo.raycast(e,rl);for(let o=0,a=rl.length;o<a;o++){let l=rl[o];l.instanceId=r,l.object=this,t.push(l)}rl.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ki(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Hr(new Float32Array(i*this.count),i,this.count,Jl,si));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Is=new qn,ig=new ve(.5,.5),ol=new L,gs=class{constructor(e=new On,t=new On,n=new On,i=new On,r=new On,o=new On){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=li,n=!1){let i=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],f=r[5],h=r[6],d=r[7],g=r[8],_=r[9],p=r[10],m=r[11],y=r[12],v=r[13],M=r[14],R=r[15];if(i[0].setComponents(c-o,d-u,m-g,R-y).normalize(),i[1].setComponents(c+o,d+u,m+g,R+y).normalize(),i[2].setComponents(c+a,d+f,m+_,R+v).normalize(),i[3].setComponents(c-a,d-f,m-_,R-v).normalize(),n)i[4].setComponents(l,h,p,M).normalize(),i[5].setComponents(c-l,d-h,m-p,R-M).normalize();else if(i[4].setComponents(c-l,d-h,m-p,R-M).normalize(),t===li)i[5].setComponents(c+l,d+h,m+p,R+M).normalize();else if(t===Nr)i[5].setComponents(l,h,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Is.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Is.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Is)}intersectsSprite(e){Is.center.set(0,0,0);let t=ig.distanceTo(e.center);return Is.radius=.7071067811865476+t,Is.applyMatrix4(e.matrixWorld),this.intersectsSphere(Is)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(ol.x=i.normal.x>0?e.max.x:e.min.x,ol.y=i.normal.y>0?e.max.y:e.min.y,ol.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ol)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},_d=new ft,Al=class s{constructor(){this.coordinateSystem=li,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let i=0;i<t.length;i++){let r=t[i];_d.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[i]===void 0&&(n[i]=new gs),n[i].setFromProjectionMatrix(_d,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let i=0;i<e._count;i++)t[i]===void 0&&(t[i]=new gs),t[i].copy(n[i]);return this._count=e._count,this}clone(){return new s().copy(this)}};var Gr=class extends kn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new it(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Rl=new L,Cl=new L,yd=new ft,So=new Ti,al=new qn,Ch=new L,xd=new L,zs=class extends Ft{constructor(e=new on,t=new Gr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Rl.fromBufferAttribute(t,i-1),Cl.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Rl.distanceTo(Cl);e.setAttribute("lineDistance",new St(n,1))}else st("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),al.copy(n.boundingSphere),al.applyMatrix4(i),al.radius+=r,e.ray.intersectsSphere(al)===!1)return;yd.copy(i).invert(),So.copy(e.ray).applyMatrix4(yd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let d=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=d,p=g-1;_<p;_+=c){let m=u.getX(_),y=u.getX(_+1),v=ll(this,e,So,l,m,y,_);v&&t.push(v)}if(this.isLineLoop){let _=u.getX(g-1),p=u.getX(d),m=ll(this,e,So,l,_,p,g-1);m&&t.push(m)}}else{let d=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=d,p=g-1;_<p;_+=c){let m=ll(this,e,So,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=ll(this,e,So,l,g-1,d,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function ll(s,e,t,n,i,r,o){let a=s.geometry.attributes.position;if(Rl.fromBufferAttribute(a,i),Cl.fromBufferAttribute(a,r),t.distanceSqToSegment(Rl,Cl,Ch,xd)>n)return;Ch.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Ch);if(!(c<e.near||c>e.far))return{distance:c,point:xd.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var vd=new L,Md=new L,zo=class extends zs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)vd.fromBufferAttribute(t,i),Md.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+vd.distanceTo(Md);e.setAttribute("lineDistance",new St(n,1))}else st("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Ho=class extends zs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Vr=class extends kn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new it(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},bd=new ft,Fh=new Ti,cl=new qn,hl=new L,Go=class extends Ft{constructor(e=new on,t=new Vr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),cl.copy(n.boundingSphere),cl.applyMatrix4(i),cl.radius+=r,e.ray.intersectsSphere(cl)===!1)return;bd.copy(i).invert(),Fh.copy(e.ray).applyMatrix4(bd);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,f=n.attributes.position;if(c!==null){let h=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let g=h,_=d;g<_;g++){let p=c.getX(g);hl.fromBufferAttribute(f,p),Sd(hl,p,l,i,e,t,this)}}else{let h=Math.max(0,o.start),d=Math.min(f.count,o.start+o.count);for(let g=h,_=d;g<_;g++)hl.fromBufferAttribute(f,g),Sd(hl,g,l,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Sd(s,e,t,n,i,r,o){let a=Fh.distanceSqToPoint(s);if(a<t){let l=new L;Fh.closestPointToPoint(s,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Vo=class extends pn{constructor(e=[],t=er,n,i,r,o,a,l,c,u){super(e,t,n,i,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},$i=class extends pn{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ji=class extends pn{constructor(e,t,n=vi,i,r,o,a=dn,l=dn,c,u=qi,f=1){if(u!==qi&&u!==is)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:f};super(h,i,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Fr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Wo=class extends Ji{constructor(e,t=vi,n=er,i,r,o=dn,a=dn,l,c=qi){let u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,i,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Xo=class extends pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},wi=class s extends on{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],f=[],h=0,d=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new St(c,3)),this.setAttribute("normal",new St(u,3)),this.setAttribute("uv",new St(f,2));function g(_,p,m,y,v,M,R,A,b,T,F){let I=M/b,k=R/T,G=M/2,H=R/2,U=A/2,K=b+1,Q=T+1,W=0,ge=0,ee=new L;for(let de=0;de<Q;de++){let Me=de*k-H;for(let Re=0;Re<K;Re++){let nt=Re*I-G;ee[_]=nt*y,ee[p]=Me*v,ee[m]=U,c.push(ee.x,ee.y,ee.z),ee[_]=0,ee[p]=0,ee[m]=A>0?1:-1,u.push(ee.x,ee.y,ee.z),f.push(Re/b),f.push(1-de/T),W+=1}}for(let de=0;de<T;de++)for(let Me=0;Me<b;Me++){let Re=h+Me+K*de,nt=h+Me+K*(de+1),X=h+(Me+1)+K*(de+1),pe=h+(Me+1)+K*de;l.push(Re,nt,pe),l.push(nt,X,pe),ge+=6}a.addGroup(d,ge,F),d+=ge,h+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Wr=class s extends on{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new L,u=new ve;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=t;f++,h+=3){let d=n+f/t*i;c.x=e*Math.cos(d),c.y=e*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,l.push(u.x,u.y)}for(let f=1;f<=t;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new St(o,3)),this.setAttribute("normal",new St(a,3)),this.setAttribute("uv",new St(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Ai=class s extends on{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let u=[],f=[],h=[],d=[],g=0,_=[],p=n/2,m=0;y(),o===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(u),this.setAttribute("position",new St(f,3)),this.setAttribute("normal",new St(h,3)),this.setAttribute("uv",new St(d,2));function y(){let M=new L,R=new L,A=0,b=(t-e)/n;for(let T=0;T<=r;T++){let F=[],I=T/r,k=I*(t-e)+e;for(let G=0;G<=i;G++){let H=G/i,U=H*l+a,K=Math.sin(U),Q=Math.cos(U);R.x=k*K,R.y=-I*n+p,R.z=k*Q,f.push(R.x,R.y,R.z),M.set(K,b,Q).normalize(),h.push(M.x,M.y,M.z),d.push(H,1-I),F.push(g++)}_.push(F)}for(let T=0;T<i;T++)for(let F=0;F<r;F++){let I=_[F][T],k=_[F+1][T],G=_[F+1][T+1],H=_[F][T+1];(e>0||F!==0)&&(u.push(I,k,H),A+=3),(t>0||F!==r-1)&&(u.push(k,G,H),A+=3)}c.addGroup(m,A,0),m+=A}function v(M){let R=g,A=new ve,b=new L,T=0,F=M===!0?e:t,I=M===!0?1:-1;for(let G=1;G<=i;G++)f.push(0,p*I,0),h.push(0,I,0),d.push(.5,.5),g++;let k=g;for(let G=0;G<=i;G++){let U=G/i*l+a,K=Math.cos(U),Q=Math.sin(U);b.x=F*Q,b.y=p*I,b.z=F*K,f.push(b.x,b.y,b.z),h.push(0,I,0),A.x=K*.5+.5,A.y=Q*.5*I+.5,d.push(A.x,A.y),g++}for(let G=0;G<i;G++){let H=R+G,U=k+G;M===!0?u.push(U,U+1,H):u.push(U+1,U,H),T+=3}c.addGroup(m,T,M===!0?1:2),m+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Hs=class s extends Ai{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},qo=class s extends on{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),c(n),u(),this.setAttribute("position",new St(r,3)),this.setAttribute("normal",new St(r.slice(),3)),this.setAttribute("uv",new St(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let v=new L,M=new L,R=new L;for(let A=0;A<t.length;A+=3)d(t[A+0],v),d(t[A+1],M),d(t[A+2],R),l(v,M,R,y)}function l(y,v,M,R){let A=R+1,b=[];for(let T=0;T<=A;T++){b[T]=[];let F=y.clone().lerp(M,T/A),I=v.clone().lerp(M,T/A),k=A-T;for(let G=0;G<=k;G++)G===0&&T===A?b[T][G]=F:b[T][G]=F.clone().lerp(I,G/k)}for(let T=0;T<A;T++)for(let F=0;F<2*(A-T)-1;F++){let I=Math.floor(F/2);F%2===0?(h(b[T][I+1]),h(b[T+1][I]),h(b[T][I])):(h(b[T][I+1]),h(b[T+1][I+1]),h(b[T+1][I]))}}function c(y){let v=new L;for(let M=0;M<r.length;M+=3)v.x=r[M+0],v.y=r[M+1],v.z=r[M+2],v.normalize().multiplyScalar(y),r[M+0]=v.x,r[M+1]=v.y,r[M+2]=v.z}function u(){let y=new L;for(let v=0;v<r.length;v+=3){y.x=r[v+0],y.y=r[v+1],y.z=r[v+2];let M=p(y)/2/Math.PI+.5,R=m(y)/Math.PI+.5;o.push(M,1-R)}g(),f()}function f(){for(let y=0;y<o.length;y+=6){let v=o[y+0],M=o[y+2],R=o[y+4],A=Math.max(v,M,R),b=Math.min(v,M,R);A>.9&&b<.1&&(v<.2&&(o[y+0]+=1),M<.2&&(o[y+2]+=1),R<.2&&(o[y+4]+=1))}}function h(y){r.push(y.x,y.y,y.z)}function d(y,v){let M=y*3;v.x=e[M+0],v.y=e[M+1],v.z=e[M+2]}function g(){let y=new L,v=new L,M=new L,R=new L,A=new ve,b=new ve,T=new ve;for(let F=0,I=0;F<r.length;F+=9,I+=6){y.set(r[F+0],r[F+1],r[F+2]),v.set(r[F+3],r[F+4],r[F+5]),M.set(r[F+6],r[F+7],r[F+8]),A.set(o[I+0],o[I+1]),b.set(o[I+2],o[I+3]),T.set(o[I+4],o[I+5]),R.copy(y).add(v).add(M).divideScalar(3);let k=p(R);_(A,I+0,y,k),_(b,I+2,v,k),_(T,I+4,M,k)}}function _(y,v,M,R){R<0&&y.x===1&&(o[v]=y.x-1),M.x===0&&M.z===0&&(o[v]=R/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.detail)}};var ii=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){st("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);let u=n[i],h=n[i+1]-u,d=(o-u)/h;return(i+d)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),l=t||(o.isVector2?new ve:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new L,i=[],r=[],o=[],a=new L,l=new ft;for(let d=0;d<=e;d++){let g=d/e;i[d]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let c=Number.MAX_VALUE,u=Math.abs(i[0].x),f=Math.abs(i[0].y),h=Math.abs(i[0].z);u<=c&&(c=u,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(i[d-1],i[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(xt(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(i[d],r[d])}if(t===!0){let d=Math.acos(xt(r[0].dot(r[e]),-1,1));d/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],d*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},Xr=class extends ii{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new ve){let n=t,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,d=c-this.aY;l=h*u-d*f+this.aX,c=h*f+d*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Pl=class extends Xr{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Eu(){let s=0,e=0,t=0,n=0;function i(r,o,a,l){s=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,f){let h=(o-r)/c-(a-r)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+f)+(l-a)/f;h*=u,d*=u,i(o,a,h,d)},calc:function(r){let o=r*r,a=o*r;return s+e*r+t*o+n*a}}}var Ed=new L,Td=new L,Ph=new Eu,Ih=new Eu,Lh=new Eu,qr=class extends ii{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new L){let n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=i[(a-1)%r]:(Td.subVectors(i[0],i[1]).add(i[0]),c=Td);let f=i[a%r],h=i[(a+1)%r];if(this.closed||a+2<r?u=i[(a+2)%r]:(Ed.subVectors(i[r-1],i[r-2]).add(i[r-1]),u=Ed),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(f),d),_=Math.pow(f.distanceToSquared(h),d),p=Math.pow(h.distanceToSquared(u),d);_<1e-4&&(_=1),g<1e-4&&(g=_),p<1e-4&&(p=_),Ph.initNonuniformCatmullRom(c.x,f.x,h.x,u.x,g,_,p),Ih.initNonuniformCatmullRom(c.y,f.y,h.y,u.y,g,_,p),Lh.initNonuniformCatmullRom(c.z,f.z,h.z,u.z,g,_,p)}else this.curveType==="catmullrom"&&(Ph.initCatmullRom(c.x,f.x,h.x,u.x,this.tension),Ih.initCatmullRom(c.y,f.y,h.y,u.y,this.tension),Lh.initCatmullRom(c.z,f.z,h.z,u.z,this.tension));return n.set(Ph.calc(l),Ih.calc(l),Lh.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new L().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function wd(s,e,t,n,i){let r=(n-e)*.5,o=(i-t)*.5,a=s*s,l=s*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*s+t}function sg(s,e){let t=1-s;return t*t*e}function rg(s,e){return 2*(1-s)*s*e}function og(s,e){return s*s*e}function Ro(s,e,t,n){return sg(s,e)+rg(s,t)+og(s,n)}function ag(s,e){let t=1-s;return t*t*t*e}function lg(s,e){let t=1-s;return 3*t*t*s*e}function cg(s,e){return 3*(1-s)*s*s*e}function hg(s,e){return s*s*s*e}function Co(s,e,t,n,i){return ag(s,e)+lg(s,t)+cg(s,n)+hg(s,i)}var Yo=class extends ii{constructor(e=new ve,t=new ve,n=new ve,i=new ve){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new ve){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Co(e,i.x,r.x,o.x,a.x),Co(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Il=class extends ii{constructor(e=new L,t=new L,n=new L,i=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new L){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Co(e,i.x,r.x,o.x,a.x),Co(e,i.y,r.y,o.y,a.y),Co(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ko=class extends ii{constructor(e=new ve,t=new ve){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ve){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ve){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ll=class extends ii{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Zo=class extends ii{constructor(e=new ve,t=new ve,n=new ve){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ve){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ro(e,i.x,r.x,o.x),Ro(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Gs=class extends ii{constructor(e=new L,t=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new L){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ro(e,i.x,r.x,o.x),Ro(e,i.y,r.y,o.y),Ro(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},$o=class extends ii{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ve){let n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],u=i[o>i.length-2?i.length-1:o+1],f=i[o>i.length-3?i.length-1:o+2];return n.set(wd(a,l.x,c.x,u.x,f.x),wd(a,l.y,c.y,u.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new ve().fromArray(i))}return this}},Bh=Object.freeze({__proto__:null,ArcCurve:Pl,CatmullRomCurve3:qr,CubicBezierCurve:Yo,CubicBezierCurve3:Il,EllipseCurve:Xr,LineCurve:Ko,LineCurve3:Ll,QuadraticBezierCurve:Zo,QuadraticBezierCurve3:Gs,SplineCurve:$o}),Dl=class extends ii{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Bh[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Bh[i.type]().fromJSON(i))}return this.cacheLengths=null,this}},_s=class extends Dl{constructor(e){super(),this.type="Path",this.currentPoint=new ve,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ko(this.currentPoint.clone(),new ve(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new Zo(this.currentPoint.clone(),new ve(e,t),new ve(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){let a=new Yo(this.currentPoint.clone(),new ve(e,t),new ve(n,i),new ve(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new $o(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,i,r,o,a,l),this}absellipse(e,t,n,i,r,o,a,l){let c=new Xr(e,t,n,i,r,o,a,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Vs=class extends _s{constructor(e){super(e),this.uuid=bi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new _s().fromJSON(i))}return this}};function ug(s,e,t=2){let n=e&&e.length,i=n?e[0]*t:s.length,r=Rp(s,0,i,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=gg(s,e,r,t)),s.length>80*t){a=s[0],l=s[1];let u=a,f=l;for(let h=t;h<i;h+=t){let d=s[h],g=s[h+1];d<a&&(a=d),g<l&&(l=g),d>u&&(u=d),g>f&&(f=g)}c=Math.max(u-a,f-l),c=c!==0?32767/c:0}return Jo(r,o,t,a,l,c,0),o}function Rp(s,e,t,n,i){let r;if(i===Ag(s,e,t,n)>0)for(let o=e;o<t;o+=n)r=Ad(o/n|0,s[o],s[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Ad(o/n|0,s[o],s[o+1],r);return r&&Yr(r,r.next)&&(Qo(r),r=r.next),r}function Ws(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(Yr(t,t.next)||rn(t.prev,t,t.next)===0)){if(Qo(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Jo(s,e,t,n,i,r,o){if(!s)return;!o&&r&&Mg(s,n,i,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?dg(s,n,i,r):fg(s)){e.push(l.i,s.i,c.i),Qo(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=pg(Ws(s),e),Jo(s,e,t,n,i,r,2)):o===2&&mg(s,e,t,n,i,r):Jo(Ws(s),e,t,n,i,r,1);break}}}function fg(s){let e=s.prev,t=s,n=s.next;if(rn(e,t,n)>=0)return!1;let i=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(i,r,o),f=Math.min(a,l,c),h=Math.max(i,r,o),d=Math.max(a,l,c),g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=h&&g.y>=f&&g.y<=d&&Eo(i,a,r,l,o,c,g.x,g.y)&&rn(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function dg(s,e,t,n){let i=s.prev,r=s,o=s.next;if(rn(i,r,o)>=0)return!1;let a=i.x,l=r.x,c=o.x,u=i.y,f=r.y,h=o.y,d=Math.min(a,l,c),g=Math.min(u,f,h),_=Math.max(a,l,c),p=Math.max(u,f,h),m=kh(d,g,e,t,n),y=kh(_,p,e,t,n),v=s.prevZ,M=s.nextZ;for(;v&&v.z>=m&&M&&M.z<=y;){if(v.x>=d&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Eo(a,u,l,f,c,h,v.x,v.y)&&rn(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=d&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Eo(a,u,l,f,c,h,M.x,M.y)&&rn(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=m;){if(v.x>=d&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Eo(a,u,l,f,c,h,v.x,v.y)&&rn(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=y;){if(M.x>=d&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Eo(a,u,l,f,c,h,M.x,M.y)&&rn(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function pg(s,e){let t=s;do{let n=t.prev,i=t.next.next;!Yr(n,i)&&Pp(n,t,t.next,i)&&jo(n,i)&&jo(i,n)&&(e.push(n.i,t.i,i.i),Qo(t),Qo(t.next),t=s=i),t=t.next}while(t!==s);return Ws(t)}function mg(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Eg(o,a)){let l=Ip(o,a);o=Ws(o,o.next),l=Ws(l,l.next),Jo(o,e,t,n,i,r,0),Jo(l,e,t,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function gg(s,e,t,n){let i=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:s.length,c=Rp(s,a,l,n,!1);c===c.next&&(c.steiner=!0),i.push(Sg(c))}i.sort(_g);for(let r=0;r<i.length;r++)t=yg(i[r],t);return t}function _g(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function yg(s,e){let t=xg(s,e);if(!t)return e;let n=Ip(t,s);return Ws(n,n.next),Ws(t,t.next)}function xg(s,e){let t=e,n=s.x,i=s.y,r=-1/0,o;if(Yr(s,t))return t;do{if(Yr(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let f=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,o=t.x<t.next.x?t:t.next,f===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Cp(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)){let f=Math.abs(i-t.y)/(n-t.x);jo(t,s)&&(f<u||f===u&&(t.x>o.x||t.x===o.x&&vg(o,t)))&&(o=t,u=f)}t=t.next}while(t!==a);return o}function vg(s,e){return rn(s.prev,s,e.prev)<0&&rn(e.next,s,s.next)<0}function Mg(s,e,t,n){let i=s;do i.z===0&&(i.z=kh(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,bg(i)}function bg(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,t*=2}while(e>1);return s}function kh(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Sg(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Cp(s,e,t,n,i,r,o,a){return(i-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(i-o)*(n-a)}function Eo(s,e,t,n,i,r,o,a){return!(s===o&&e===a)&&Cp(s,e,t,n,i,r,o,a)}function Eg(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!Tg(s,e)&&(jo(s,e)&&jo(e,s)&&wg(s,e)&&(rn(s.prev,s,e.prev)||rn(s,e.prev,e))||Yr(s,e)&&rn(s.prev,s,s.next)>0&&rn(e.prev,e,e.next)>0)}function rn(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Yr(s,e){return s.x===e.x&&s.y===e.y}function Pp(s,e,t,n){let i=fl(rn(s,e,t)),r=fl(rn(s,e,n)),o=fl(rn(t,n,s)),a=fl(rn(t,n,e));return!!(i!==r&&o!==a||i===0&&ul(s,t,e)||r===0&&ul(s,n,e)||o===0&&ul(t,s,n)||a===0&&ul(t,e,n))}function ul(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function fl(s){return s>0?1:s<0?-1:0}function Tg(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Pp(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function jo(s,e){return rn(s.prev,s,s.next)<0?rn(s,e,s.next)>=0&&rn(s,s.prev,e)>=0:rn(s,e,s.prev)<0||rn(s,s.next,e)<0}function wg(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Ip(s,e){let t=zh(s.i,s.x,s.y),n=zh(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ad(s,e,t,n){let i=zh(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Qo(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function zh(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ag(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var Hh=class{static triangulate(e,t,n=2){return ug(e,t,n)}},Ir=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];Rd(e),Cd(n,e);let o=e.length;t.forEach(Rd);for(let l=0;l<t.length;l++)i.push(o),o+=t[l].length,Cd(n,t[l]);let a=Hh.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Rd(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Cd(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var Xs=class s extends qo{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Kr=class s extends on{constructor(e=[new ve(0,-.5),new ve(.5,0),new ve(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=xt(i,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/t,f=new L,h=new ve,d=new L,g=new L,_=new L,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,_.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:_.normalize(),l.push(_.x,_.y,_.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=_.x,d.y+=_.y,d.z+=_.z,d.normalize(),l.push(d.x,d.y,d.z),_.copy(g)}for(let y=0;y<=t;y++){let v=n+y*u*i,M=Math.sin(v),R=Math.cos(v);for(let A=0;A<=e.length-1;A++){f.x=e[A].x*M,f.y=e[A].y,f.z=e[A].x*R,o.push(f.x,f.y,f.z),h.x=y/t,h.y=A/(e.length-1),a.push(h.x,h.y);let b=l[3*A+0]*M,T=l[3*A+1],F=l[3*A+0]*R;c.push(b,T,F)}}for(let y=0;y<t;y++)for(let v=0;v<e.length-1;v++){let M=v+y*e.length,R=M,A=M+e.length,b=M+e.length+1,T=M+1;r.push(R,A,T),r.push(b,T,A)}this.setIndex(r),this.setAttribute("position",new St(o,3)),this.setAttribute("uv",new St(a,2)),this.setAttribute("normal",new St(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.points,e.segments,e.phiStart,e.phiLength)}},Cn=class s extends qo{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},qs=class s extends on{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,u=l+1,f=e/a,h=t/l,d=[],g=[],_=[],p=[];for(let m=0;m<u;m++){let y=m*h-o;for(let v=0;v<c;v++){let M=v*f-r;g.push(M,-y,0),_.push(0,0,1),p.push(v/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let v=y+c*m,M=y+c*(m+1),R=y+1+c*(m+1),A=y+1+c*m;d.push(v,M,A),d.push(M,R,A)}this.setIndex(d),this.setAttribute("position",new St(g,3)),this.setAttribute("normal",new St(_,3)),this.setAttribute("uv",new St(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},zn=class s extends on{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],l=[],c=[],u=[],f=e,h=(t-e)/i,d=new L,g=new ve;for(let _=0;_<=i;_++){for(let p=0;p<=n;p++){let m=r+p/n*o;d.x=f*Math.cos(m),d.y=f*Math.sin(m),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/t+1)/2,g.y=(d.y/t+1)/2,u.push(g.x,g.y)}f+=h}for(let _=0;_<i;_++){let p=_*(n+1);for(let m=0;m<n;m++){let y=m+p,v=y,M=y+n+1,R=y+n+2,A=y+1;a.push(v,M,A),a.push(M,R,A)}}this.setIndex(a),this.setAttribute("position",new St(l,3)),this.setAttribute("normal",new St(c,3)),this.setAttribute("uv",new St(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Zr=class s extends on{constructor(e=new Vs([new ve(0,.5),new ve(-.5,-.5),new ve(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new St(i,3)),this.setAttribute("normal",new St(r,3)),this.setAttribute("uv",new St(o,2));function c(u){let f=i.length/3,h=u.extractPoints(t),d=h.shape,g=h.holes;Ir.isClockWise(d)===!1&&(d=d.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];Ir.isClockWise(y)===!0&&(g[p]=y.reverse())}let _=Ir.triangulateShape(d,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];d=d.concat(y)}for(let p=0,m=d.length;p<m;p++){let y=d[p];i.push(y.x,y.y,0),r.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=_.length;p<m;p++){let y=_[p],v=y[0]+f,M=y[1]+f,R=y[2]+f;n.push(v,M,R),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Rg(t,e)}static fromJSON(e,t){let n=[];for(let i=0,r=e.shapes.length;i<r;i++){let o=t[e.shapes[i]];n.push(o)}return new s(n,e.curveSegments)}};function Rg(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){let i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}var Ct=class s extends on{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],u=[],f=[],h=new L,d=new L,g=new L;for(let _=0;_<=n;_++){let p=o+_/n*a;for(let m=0;m<=i;m++){let y=m/i*r;d.x=(e+t*Math.cos(p))*Math.cos(y),d.y=(e+t*Math.cos(p))*Math.sin(y),d.z=t*Math.sin(p),c.push(d.x,d.y,d.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),g.subVectors(d,h).normalize(),u.push(g.x,g.y,g.z),f.push(m/i),f.push(_/n)}}for(let _=1;_<=n;_++)for(let p=1;p<=i;p++){let m=(i+1)*_+p-1,y=(i+1)*(_-1)+p-1,v=(i+1)*(_-1)+p,M=(i+1)*_+p;l.push(m,y,M),l.push(y,v,M)}this.setIndex(l),this.setAttribute("position",new St(c,3)),this.setAttribute("normal",new St(u,3)),this.setAttribute("uv",new St(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var $r=class s extends on{constructor(e=new Gs(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new L,l=new L,c=new ve,u=new L,f=[],h=[],d=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new St(f,3)),this.setAttribute("normal",new St(h,3)),this.setAttribute("uv",new St(d,2));function _(){for(let v=0;v<t;v++)p(v);p(r===!1?t:0),y(),m()}function p(v){u=e.getPointAt(v/t,u);let M=o.normals[v],R=o.binormals[v];for(let A=0;A<=i;A++){let b=A/i*Math.PI*2,T=Math.sin(b),F=-Math.cos(b);l.x=F*M.x+T*R.x,l.y=F*M.y+T*R.y,l.z=F*M.z+T*R.z,l.normalize(),h.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,f.push(a.x,a.y,a.z)}}function m(){for(let v=1;v<=t;v++)for(let M=1;M<=i;M++){let R=(i+1)*(v-1)+(M-1),A=(i+1)*v+(M-1),b=(i+1)*v+M,T=(i+1)*(v-1)+M;g.push(R,A,T),g.push(A,b,T)}}function y(){for(let v=0;v<=t;v++)for(let M=0;M<=i;M++)c.x=v/t,c.y=M/i,d.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new s(new Bh[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function ir(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];if(Pd(i))i.isRenderTargetTexture?(st("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone();else if(Array.isArray(i))if(Pd(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();e[t][n]=r}else e[t][n]=i.slice();else e[t][n]=i}}return e}function Dn(s){let e={};for(let t=0;t<s.length;t++){let n=ir(s[t]);for(let i in n)e[i]=n[i]}return e}function Pd(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Cg(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Tu(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:bt.workingColorSpace}var Lp={clone:ir,merge:Dn},Pg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ig=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ri=class extends kn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Pg,this.fragmentShader=Ig,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ir(e.uniforms),this.uniformsGroups=Cg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new it().setHex(i.value);break;case"v2":this.uniforms[n].value=new ve().fromArray(i.value);break;case"v3":this.uniforms[n].value=new L().fromArray(i.value);break;case"v4":this.uniforms[n].value=new Xt().fromArray(i.value);break;case"m3":this.uniforms[n].value=new mt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new ft().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Nl=class extends Ri{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ln=class extends kn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new it(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new it(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Dc,this.normalScale=new ve(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Hn=class extends Ln{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ve(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return xt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new it(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new it(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new it(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Ns('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Ns('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Ul=class extends kn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=pp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ol=class extends kn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function ds(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function To(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function Lg(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Id(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function Dg(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}var Ci=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Fl=class extends Ci{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ls,endingEnd:Ls}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ds:r=e,a=2*t-n;break;case Po:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ds:o=e,l=2*n-t;break;case Po:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,g=(n-t)/(i-t),_=g*g,p=_*g,m=-h*p+2*h*_-h*g,y=(1+h)*p+(-1.5-2*h)*_+(-.5+h)*g+1,v=(-1-d)*p+(1.5+d)*_+.5*g,M=d*p-d*_;for(let R=0;R!==a;++R)r[R]=m*o[u+R]+y*o[c+R]+v*o[l+R]+M*o[f+R];return r}},ea=class extends Ci{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(i-t),f=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*f+o[l+h]*u;return r}},Bl=class extends Ci{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},kl=class extends Ci{interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,f=this.outTangents;if(!u||!f){let g=(n-t)/(i-t),_=1-g;for(let p=0;p!==a;++p)r[p]=o[c+p]*_+o[l+p]*g;return r}let h=a*2,d=e-1;for(let g=0;g!==a;++g){let _=o[c+g],p=o[l+g],m=d*h+g*2,y=f[m],v=f[m+1],M=e*h+g*2,R=u[M],A=u[M+1],b=Ug(n,t,y,R,i);r[g]=Dp(b,_,v,A,p)}return r}};function Dp(s,e,t,n,i){let r=1-s;return r*r*r*e+3*r*r*s*t+3*r*s*s*n+s*s*s*i}function Ng(s,e,t,n,i){let r=1-s;return 3*r*r*(t-e)+6*r*s*(n-t)+3*s*s*(i-n)}function Ug(s,e,t,n,i){let r=(s-e)/(i-e);for(let o=0;o<8;o++){let a=Dp(r,e,t,n,i)-s;if(Math.abs(a)<1e-10)break;let l=Ng(r,e,t,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var Yn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ds(t,this.TimeBufferType),this.values=ds(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ds(e.times,Array),values:ds(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i),To(e.settings)&&(n.settings={inTangents:ds(e.settings.inTangents,Array),outTangents:ds(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Bl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ea(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Fl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new kl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Us:t=this.InterpolantFactoryMethodDiscrete;break;case Os:t=this.InterpolantFactoryMethodLinear;break;case ml:t=this.InterpolantFactoryMethodSmooth;break;case Oh:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return st("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Us;case this.InterpolantFactoryMethodLinear:return Os;case this.InterpolantFactoryMethodSmooth:return ml;case this.InterpolantFactoryMethodBezier:return Oh}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e;To(this.settings)&&(Ld(this.settings.inTangents,e),Ld(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e;To(this.settings)&&(Dd(this.settings.inTangents,e),Dd(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ht("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(ht("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){ht("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){ht("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&M0(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){ht("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===ml,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(i)l=!0;else{let f=a*n,h=f-n,d=f+n;for(let g=0;g!==n;++g){let _=t[f+g];if(_!==t[h+g]||_!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let f=a*n,h=o*n;for(let d=0;d!==n;++d)t[h+d]=t[f+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,To(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Ld(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]+=e}function Dd(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]*=e}Yn.prototype.ValueTypeName="";Yn.prototype.TimeBufferType=Float32Array;Yn.prototype.ValueBufferType=Float32Array;Yn.prototype.DefaultInterpolation=Os;var ji=class extends Yn{constructor(e,t,n){super(e,t,n)}};ji.prototype.ValueTypeName="bool";ji.prototype.ValueBufferType=Array;ji.prototype.DefaultInterpolation=Us;ji.prototype.InterpolantFactoryMethodLinear=void 0;ji.prototype.InterpolantFactoryMethodSmooth=void 0;var ta=class extends Yn{constructor(e,t,n,i){super(e,t,n,i)}};ta.prototype.ValueTypeName="color";var Qi=class extends Yn{constructor(e,t,n,i){super(e,t,n,i)}};Qi.prototype.ValueTypeName="number";var zl=class extends Ci{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t),c=e*a;for(let u=c+a;c!==u;c+=4)Mn.slerpFlat(r,0,o,c-a,o,c,l);return r}},es=class extends Yn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new zl(this.times,this.values,this.getValueSize(),e)}};es.prototype.ValueTypeName="quaternion";es.prototype.InterpolantFactoryMethodSmooth=void 0;var ts=class extends Yn{constructor(e,t,n){super(e,t,n)}};ts.prototype.ValueTypeName="string";ts.prototype.ValueBufferType=Array;ts.prototype.DefaultInterpolation=Us;ts.prototype.InterpolantFactoryMethodLinear=void 0;ts.prototype.InterpolantFactoryMethodSmooth=void 0;var ys=class extends Yn{constructor(e,t,n,i){super(e,t,n,i)}};ys.prototype.ValueTypeName="vector";var Ys=class{constructor(e="",t=-1,n=[],i=Lc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=bi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Fg(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Yn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let u=Lg(l);l=Id(l,1,u),c=Id(c,1,u),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Qi(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],u=c.name.match(r);if(u&&u.length>1){let f=u[1],h=i[f];h||(i[f]=h=[]),h.push(c)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Og(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Qi;case"vector":case"vector2":case"vector3":case"vector4":return ys;case"color":return ta;case"quaternion":return es;case"bool":case"boolean":return ji;case"string":return ts}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Fg(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Og(s.type);if(s.times===void 0){let n=[],i=[];Dg(s.keys,n,i,"value"),s.times=n,s.values=i}let t;return e.parse!==void 0?t=e.parse(s):t=new e(s.name,s.times,s.values,s.interpolation),To(s.settings)&&(t.settings={inTangents:ds(s.settings.inTangents,Float32Array),outTangents:ds(s.settings.outTangents,Float32Array)}),t}var Ei={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(Nd(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!Nd(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function Nd(s){try{let e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var xs=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let d=c[f],g=c[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Np=new xs,Pi=class{constructor(e){this.manager=e!==void 0?e:Np,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Pi.DEFAULT_MATERIAL_NAME="__DEFAULT";var Vi={},Gh=class extends Error{constructor(e,t){super(e),this.response=t}},Jr=class extends Pi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Ei.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Vi[e]!==void 0){Vi[e].push({onLoad:t,onProgress:n,onError:i});return}Vi[e]=[],Vi[e].push({onLoad:t,onProgress:n,onError:i});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&st("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Vi[e],f=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=h?parseInt(h):0,g=d!==0,_=0,p=new ReadableStream({start(m){y();function y(){f.read().then(({done:v,value:M})=>{if(v)m.close();else{_+=M.byteLength;let R=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:d});for(let A=0,b=u.length;A<b;A++){let T=u[A];T.onProgress&&T.onProgress(R)}m.enqueue(M),y()}},v=>{m.error(v)})}}});return new Response(p)}else throw new Gh(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{let f=/charset="?([^;"\s]*)"?/i.exec(a),h=f&&f[1]?f[1].toLowerCase():void 0,d=new TextDecoder(h);return c.arrayBuffer().then(g=>d.decode(g))}}}).then(c=>{Ei.add(`file:${e}`,c);let u=Vi[e];delete Vi[e];for(let f=0,h=u.length;f<h;f++){let d=u[f];d.onLoad&&d.onLoad(c)}}).catch(c=>{let u=Vi[e];if(u===void 0)throw this.manager.itemError(e),c;delete Vi[e];for(let f=0,h=u.length;f<h;f++){let d=u[f];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ar=new WeakMap,Hl=class extends Pi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ei.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let f=Ar.get(o);f===void 0&&(f=[],Ar.set(o,f)),f.push({onLoad:t,onError:i})}return o}let a=Ur("img");function l(){u(),t&&t(this);let f=Ar.get(this)||[];for(let h=0;h<f.length;h++){let d=f[h];d.onLoad&&d.onLoad(this)}Ar.delete(this),r.manager.itemEnd(e)}function c(f){u(),i&&i(f),Ei.remove(`image:${e}`);let h=Ar.get(this)||[];for(let d=0;d<h.length;d++){let g=h[d];g.onError&&g.onError(f)}Ar.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Ei.add(`image:${e}`,a),r.manager.itemStart(e),a.fetchPriority=this.priority,a.src=e,a}};var na=class extends Pi{constructor(e){super(e)}load(e,t,n,i){let r=new pn,o=new Hl(this.manager);return o.setPriority(this.priority),o.setCache(this.cache),o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},Ks=class extends Ft{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new it(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ia=class extends Ks{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new it(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Dh=new ft,Ud=new L,Od=new L,jr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ve(512,512),this.mapType=Kn,this.map=null,this.mapPass=null,this.matrix=new ft,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gs,this._frameExtents=new ve(1,1),this._viewportCount=1,this._viewports=[new Xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Ud.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ud),Od.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Od),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,i){Dh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Dh,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=i?i.z/r.x:1,a=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;e.coordinateSystem===Nr||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Dh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},dl=new L,pl=new Mn,Si=new L,sa=class extends Ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ft,this.projectionMatrix=new ft,this.projectionMatrixInverse=new ft,this.coordinateSystem=li,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(dl,pl,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,pl,Si.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(dl,pl,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,pl,Si.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},fs=new L,Fd=new ve,Bd=new ve,gn=class extends sa{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Fs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(wo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Fs*2*Math.atan(Math.tan(wo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){fs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(fs.x,fs.y).multiplyScalar(-e/fs.z),fs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(fs.x,fs.y).multiplyScalar(-e/fs.z)}getViewSize(e,t){return this.getViewBounds(e,Fd,Bd),t.subVectors(Bd,Fd)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(wo*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Vh=class extends jr{constructor(){super(new gn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Fs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},ra=class extends Ks{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Vh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Wh=class extends jr{constructor(){super(new gn(90,1,.5,500)),this.isPointLightShadow=!0}},Ii=class extends Ks{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Wh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Zs=class extends sa{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Xh=class extends jr{constructor(){super(new Zs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},vs=class extends Ks{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.shadow=new Xh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ns=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Nh=new WeakMap,oa=class extends Pi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&st("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&st("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ei.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{Nh.has(o)===!0?(i&&i(Nh.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",a.headers=this.requestHeader,a.priority=this.priority,a.cache=this.cache,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Ei.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),Nh.set(l,c),Ei.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Ei.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Rr=-90,Cr=1,Qr=class extends Ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new gn(Rr,Cr,e,t);i.layers=this.layers,this.add(i);let r=new gn(Rr,Cr,e,t);r.layers=this.layers,this.add(r);let o=new gn(Rr,Cr,e,t);o.layers=this.layers,this.add(o);let a=new gn(Rr,Cr,e,t);a.layers=this.layers,this.add(a);let l=new gn(Rr,Cr,e,t);l.layers=this.layers,this.add(l);let c=new gn(Rr,Cr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===li)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Nr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,h,d),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Gl=class extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var Vl=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){Mn.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;Mn.multiplyQuaternionsFlat(e,o,e,t,e,n),Mn.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let l=t+a;e[l]=e[l]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}},wu="\\[\\]\\.:\\/",Bg=new RegExp("["+wu+"]","g"),Au="[^"+wu+"]",kg="[^"+wu.replace("\\.","")+"]",zg=/((?:WC+[\/:])*)/.source.replace("WC",Au),Hg=/(WCOD+)?/.source.replace("WCOD",kg),Gg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Au),Vg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Au),Wg=new RegExp("^"+zg+Hg+Gg+Vg+"$"),Xg=["material","materials","bones","map"],qh=class{constructor(e,t,n){let i=n||qt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},qt=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Bg,"")}static parseTrackName(e){let t=Wg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);Xg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){st("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ht("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ht("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ht("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ht("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ht("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[i];if(o===void 0){let c=t.nodeName;ht("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};qt.Composite=qh;qt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};qt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};qt.prototype.GetterByBindingType=[qt.prototype._getValue_direct,qt.prototype._getValue_array,qt.prototype._getValue_arrayElement,qt.prototype._getValue_toArray];qt.prototype.SetterByBindingTypeAndVersioning=[[qt.prototype._setValue_direct,qt.prototype._setValue_direct_setNeedsUpdate,qt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[qt.prototype._setValue_array,qt.prototype._setValue_array_setNeedsUpdate,qt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[qt.prototype._setValue_arrayElement,qt.prototype._setValue_arrayElement_setNeedsUpdate,qt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[qt.prototype._setValue_fromArray,qt.prototype._setValue_fromArray_setNeedsUpdate,qt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wl=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),l={endingStart:Ls,endingEnd:Ls};for(let c=0;c!==o;++c){let u=r[c].createInterpolant(null);a[c]=u,u.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=up,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case dp:for(let u=0,f=l.length;u!==f;++u)l[u].evaluate(o),c[u].accumulateAdditive(a);break;case Lc:default:for(let u=0,f=l.length;u!==f;++u)l[u].evaluate(o),c[u].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===fp;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===Ic){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this._loopCount=r,this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=Ds,i.endingEnd=Ds):(e?i.endingStart=this.zeroSlopeAtStart?Ds:Ls:i.endingStart=Po,t?i.endingEnd=this.zeroSlopeAtEnd?Ds:Ls:i.endingEnd=Po)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}},qg=new Float32Array(1),aa=class extends ci{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,u=c[l];u===void 0&&(u={},c[l]=u);for(let f=0;f!==r;++f){let h=i[f],d=h.name,g=u[d];if(g!==void 0)++g.referenceCount,o[f]=g;else{if(g=o[f],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,d));continue}let _=t&&t._propertyBindings[f].binding.parsedPath;g=new Vl(qt.create(n,d,_),h.ValueTypeName,h.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,d),o[f]=g}a[f].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],u=e._byClipCacheIndex;c._byClipCacheIndex=u,l[u]=c,l.pop(),e._byClipCacheIndex=null;let f=a.actionByRoot,h=(e._localRoot||this._root).uuid;delete f[h],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new ea(new Float32Array(2),new Float32Array(2),1,qg),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e=="string"?Ys.findByName(i,e):e,a=o!==null?o.uuid:e,l=this._actionsByClip[a],c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Lc),l!==void 0){let f=l.actionByRoot[r];if(f!==void 0&&f.blendMode===n)return f;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;let u=new Wl(this,o,t,n);return this._bindAction(u,c),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?Ys.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,o);let a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){let c=o[a];this._deactivateAction(c);let u=c._cacheIndex,f=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,f._cacheIndex=u,t[u]=f,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var kd=new ft,la=class{constructor(e,t,n=0,i=1/0){this.ray=new Ti(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Br,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):ht("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return kd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(kd),this}intersectObject(e,t=!0,n=[]){return Yh(e,this,n,t),n.sort(zd),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Yh(e[i],this,n,t);return n.sort(zd),n}};function zd(s,e){return s.distance-e.distance}function Yh(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)Yh(r[o],e,t,!0)}}var eo=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=xt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(xt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Kh=class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};var ca=class extends ci{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Ru(s,e,t,n){let i=Yg(n);switch(t){case fu:return s*e;case Jl:return s*e/i.components*i.byteLength;case jl:return s*e/i.components*i.byteLength;case Es:return s*e*2/i.components*i.byteLength;case Ql:return s*e*2/i.components*i.byteLength;case du:return s*e*3/i.components*i.byteLength;case ui:return s*e*4/i.components*i.byteLength;case ec:return s*e*4/i.components*i.byteLength;case ua:case fa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case da:case pa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case nc:case sc:return Math.max(s,16)*Math.max(e,8)/4;case tc:case ic:return Math.max(s,8)*Math.max(e,8)/2;case rc:case oc:case lc:case cc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ac:case ma:case hc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case uc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case fc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case dc:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case pc:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case mc:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case gc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case _c:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case yc:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case xc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case vc:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Mc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case bc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Sc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Ec:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Tc:case wc:case Ac:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Rc:case Cc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case ga:case Pc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Yg(s){switch(s){case Kn:case lu:return{byteLength:1,components:1};case so:case cu:case Mi:return{byteLength:2,components:1};case Zl:case $l:return{byteLength:2,components:4};case vi:case Kl:case si:return{byteLength:4,components:1};case hu:case uu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?st("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function nm(){let s=null,e=!1,t=null,n=null;function i(r,o){n=s.requestAnimationFrame(i),t(r,o)}return{start:function(){e!==!0&&t!==null&&s!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Zg(s){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,f=c.byteLength,h=s.createBuffer();s.bindBuffer(l,h),s.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){let u=l.array,f=l.updateRanges;if(s.bindBuffer(c,a),f.length===0)s.bufferSubData(c,0,u);else{f.sort((d,g)=>d.start-g.start);let h=0;for(let d=1;d<f.length;d++){let g=f[h],_=f[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,f[h]=_)}f.length=h+1;for(let d=0,g=f.length;d<g;d++){let _=f[d];s.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var $g=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Jg=`#ifdef USE_ALPHAHASH
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
#endif`,jg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Qg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,e_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,t_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,n_=`#ifdef USE_AOMAP
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
#endif`,i_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,s_=`#ifdef USE_BATCHING
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
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,r_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,o_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,a_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,l_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,c_=`#ifdef USE_IRIDESCENCE
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
#endif`,h_=`#ifdef USE_BUMPMAP
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
#endif`,u_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,f_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,d_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,p_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,m_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,g_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,__=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,y_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,x_=`#define PI 3.141592653589793
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
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
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
} // validated`,v_=`vec3 transformedNormal = objectNormal;
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
#endif`,M_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,b_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,S_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,E_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,T_="gl_FragColor = linearToOutputTexel( gl_FragColor );",w_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,A_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,R_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,C_=`#ifdef USE_ENVMAP
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
#endif`,P_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,I_=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,L_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,D_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,N_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,U_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,O_=`#ifdef USE_GRADIENTMAP
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
}`,F_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,B_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,k_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,z_=`uniform bool receiveShadow;
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
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
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
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
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
#endif
#include <lightprobes_pars_fragment>`,H_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,G_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,V_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,W_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,X_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,q_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
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
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
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
#endif`,Y_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
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
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
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
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
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
		return 0.5 / max( gv + gl, EPSILON );
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
		float roughness = max( material.clearcoatRoughness, 0.045 );
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
	float roughness = max( material.roughness, 0.045 );
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
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
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
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
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
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
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
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
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
}`,K_=`
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
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
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
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
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
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Z_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,$_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,J_=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,j_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Q_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ey=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ty=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ny=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,iy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,sy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ry=`#if defined( USE_POINTS_UV )
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
#endif`,oy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ay=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ly=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,cy=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,hy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,uy=`#ifdef USE_MORPHTARGETS
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
#endif`,fy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
	#ifdef DOUBLE_SIDED
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
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,py=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,my=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,_y=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,yy=`#ifdef USE_NORMALMAP
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
#endif`,xy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,My=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,by=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Sy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ey=`vec3 packNormalToRGB( const in vec3 normal ) {
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Ty=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,wy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ay=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ry=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Py=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Iy=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
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
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
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
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
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
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
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
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
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
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ly=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
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
#endif`,Dy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
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
#endif`,Ny=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
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
}`,Uy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Oy=`#ifdef USE_SKINNING
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
#endif`,Fy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,By=`#ifdef USE_SKINNING
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
#endif`,ky=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Hy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Gy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Vy=`#ifdef USE_TRANSMISSION
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
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Wy=`#ifdef USE_TRANSMISSION
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
#endif`,Xy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
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
#endif`,qy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
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
#endif`,Yy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
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
#endif`,Ky=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Zy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,$y=`uniform sampler2D t2D;
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
}`,Jy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jy=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ex=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tx=`#include <common>
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
}`,nx=`#if DEPTH_PACKING == 3200
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
}`,ix=`#define DISTANCE
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
}`,sx=`#define DISTANCE
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
void main() {
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
}`,rx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ox=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ax=`uniform float scale;
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
}`,lx=`uniform vec3 diffuse;
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
}`,cx=`#include <common>
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
}`,hx=`uniform vec3 diffuse;
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
}`,ux=`#define LAMBERT
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
}`,fx=`#define LAMBERT
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
#include <envmap_physical_pars_fragment>
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
}`,dx=`#define MATCAP
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
}`,px=`#define MATCAP
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
}`,mx=`#define NORMAL
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
}`,gx=`#define NORMAL
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
}`,_x=`#define PHONG
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
}`,yx=`#define PHONG
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
#include <envmap_physical_pars_fragment>
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
}`,xx=`#define STANDARD
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
}`,vx=`#define STANDARD
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
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
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
}`,Mx=`#define TOON
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
}`,bx=`#define TOON
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
}`,Sx=`uniform float size;
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
}`,Ex=`uniform vec3 diffuse;
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
}`,Tx=`#include <common>
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
}`,wx=`uniform vec3 color;
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
	#include <premultiplied_alpha_fragment>
}`,Ax=`uniform float rotation;
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
}`,Rx=`uniform vec3 diffuse;
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
}`,vt={alphahash_fragment:$g,alphahash_pars_fragment:Jg,alphamap_fragment:jg,alphamap_pars_fragment:Qg,alphatest_fragment:e_,alphatest_pars_fragment:t_,aomap_fragment:n_,aomap_pars_fragment:i_,batching_pars_vertex:s_,batching_vertex:r_,begin_vertex:o_,beginnormal_vertex:a_,bsdfs:l_,iridescence_fragment:c_,bumpmap_pars_fragment:h_,clipping_planes_fragment:u_,clipping_planes_pars_fragment:f_,clipping_planes_pars_vertex:d_,clipping_planes_vertex:p_,color_fragment:m_,color_pars_fragment:g_,color_pars_vertex:__,color_vertex:y_,common:x_,defaultnormal_vertex:v_,displacementmap_pars_vertex:M_,displacementmap_vertex:b_,emissivemap_fragment:S_,emissivemap_pars_fragment:E_,colorspace_fragment:T_,colorspace_pars_fragment:w_,envmap_fragment:A_,envmap_common_pars_fragment:R_,envmap_pars_fragment:C_,envmap_pars_vertex:P_,envmap_physical_pars_fragment:H_,envmap_vertex:I_,fog_vertex:L_,fog_pars_vertex:D_,fog_fragment:N_,fog_pars_fragment:U_,gradientmap_pars_fragment:O_,lightmap_pars_fragment:F_,lights_lambert_fragment:B_,lights_lambert_pars_fragment:k_,lights_pars_begin:z_,lights_toon_fragment:G_,lights_toon_pars_fragment:V_,lights_phong_fragment:W_,lights_phong_pars_fragment:X_,lights_physical_fragment:q_,lights_physical_pars_fragment:Y_,lights_fragment_begin:K_,lights_fragment_maps:Z_,lights_fragment_end:$_,lightprobes_pars_fragment:J_,logdepthbuf_fragment:j_,logdepthbuf_pars_fragment:Q_,logdepthbuf_pars_vertex:ey,logdepthbuf_vertex:ty,map_fragment:ny,map_pars_fragment:iy,map_particle_fragment:sy,map_particle_pars_fragment:ry,metalnessmap_fragment:oy,metalnessmap_pars_fragment:ay,morphinstance_vertex:ly,morphcolor_vertex:cy,morphnormal_vertex:hy,morphtarget_pars_vertex:uy,morphtarget_vertex:fy,normal_fragment_begin:dy,normal_fragment_maps:py,normal_pars_fragment:my,normal_pars_vertex:gy,normal_vertex:_y,normalmap_pars_fragment:yy,clearcoat_normal_fragment_begin:xy,clearcoat_normal_fragment_maps:vy,clearcoat_pars_fragment:My,iridescence_pars_fragment:by,opaque_fragment:Sy,packing:Ey,premultiplied_alpha_fragment:Ty,project_vertex:wy,dithering_fragment:Ay,dithering_pars_fragment:Ry,roughnessmap_fragment:Cy,roughnessmap_pars_fragment:Py,shadowmap_pars_fragment:Iy,shadowmap_pars_vertex:Ly,shadowmap_vertex:Dy,shadowmask_pars_fragment:Ny,skinbase_vertex:Uy,skinning_pars_vertex:Oy,skinning_vertex:Fy,skinnormal_vertex:By,specularmap_fragment:ky,specularmap_pars_fragment:zy,tonemapping_fragment:Hy,tonemapping_pars_fragment:Gy,transmission_fragment:Vy,transmission_pars_fragment:Wy,uv_pars_fragment:Xy,uv_pars_vertex:qy,uv_vertex:Yy,worldpos_vertex:Ky,background_vert:Zy,background_frag:$y,backgroundCube_vert:Jy,backgroundCube_frag:jy,cube_vert:Qy,cube_frag:ex,depth_vert:tx,depth_frag:nx,distance_vert:ix,distance_frag:sx,equirect_vert:rx,equirect_frag:ox,linedashed_vert:ax,linedashed_frag:lx,meshbasic_vert:cx,meshbasic_frag:hx,meshlambert_vert:ux,meshlambert_frag:fx,meshmatcap_vert:dx,meshmatcap_frag:px,meshnormal_vert:mx,meshnormal_frag:gx,meshphong_vert:_x,meshphong_frag:yx,meshphysical_vert:xx,meshphysical_frag:vx,meshtoon_vert:Mx,meshtoon_frag:bx,points_vert:Sx,points_frag:Ex,shadow_vert:Tx,shadow_frag:wx,sprite_vert:Ax,sprite_frag:Rx},Ge={common:{diffuse:{value:new it(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new mt}},envmap:{envMap:{value:null},envMapRotation:{value:new mt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new mt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new mt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new mt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new mt},normalScale:{value:new ve(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new mt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new mt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new mt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new mt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new it(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new it(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0},uvTransform:{value:new mt}},sprite:{diffuse:{value:new it(16777215)},opacity:{value:1},center:{value:new ve(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}}},Ui={basic:{uniforms:Dn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.fog]),vertexShader:vt.meshbasic_vert,fragmentShader:vt.meshbasic_frag},lambert:{uniforms:Dn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,Ge.lights,{emissive:{value:new it(0)},envMapIntensity:{value:1}}]),vertexShader:vt.meshlambert_vert,fragmentShader:vt.meshlambert_frag},phong:{uniforms:Dn([Ge.common,Ge.specularmap,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,Ge.lights,{emissive:{value:new it(0)},specular:{value:new it(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:vt.meshphong_vert,fragmentShader:vt.meshphong_frag},standard:{uniforms:Dn([Ge.common,Ge.envmap,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.roughnessmap,Ge.metalnessmap,Ge.fog,Ge.lights,{emissive:{value:new it(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag},toon:{uniforms:Dn([Ge.common,Ge.aomap,Ge.lightmap,Ge.emissivemap,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.gradientmap,Ge.fog,Ge.lights,{emissive:{value:new it(0)}}]),vertexShader:vt.meshtoon_vert,fragmentShader:vt.meshtoon_frag},matcap:{uniforms:Dn([Ge.common,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,Ge.fog,{matcap:{value:null}}]),vertexShader:vt.meshmatcap_vert,fragmentShader:vt.meshmatcap_frag},points:{uniforms:Dn([Ge.points,Ge.fog]),vertexShader:vt.points_vert,fragmentShader:vt.points_frag},dashed:{uniforms:Dn([Ge.common,Ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:vt.linedashed_vert,fragmentShader:vt.linedashed_frag},depth:{uniforms:Dn([Ge.common,Ge.displacementmap]),vertexShader:vt.depth_vert,fragmentShader:vt.depth_frag},normal:{uniforms:Dn([Ge.common,Ge.bumpmap,Ge.normalmap,Ge.displacementmap,{opacity:{value:1}}]),vertexShader:vt.meshnormal_vert,fragmentShader:vt.meshnormal_frag},sprite:{uniforms:Dn([Ge.sprite,Ge.fog]),vertexShader:vt.sprite_vert,fragmentShader:vt.sprite_frag},background:{uniforms:{uvTransform:{value:new mt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:vt.background_vert,fragmentShader:vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new mt}},vertexShader:vt.backgroundCube_vert,fragmentShader:vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:vt.cube_vert,fragmentShader:vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:vt.equirect_vert,fragmentShader:vt.equirect_frag},distance:{uniforms:Dn([Ge.common,Ge.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:vt.distance_vert,fragmentShader:vt.distance_frag},shadow:{uniforms:Dn([Ge.lights,Ge.fog,{color:{value:new it(0)},opacity:{value:1}}]),vertexShader:vt.shadow_vert,fragmentShader:vt.shadow_frag}};Ui.physical={uniforms:Dn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new mt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new mt},clearcoatNormalScale:{value:new ve(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new mt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new mt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new mt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new mt},sheen:{value:0},sheenColor:{value:new it(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new mt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new mt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new mt},transmissionSamplerSize:{value:new ve},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new mt},attenuationDistance:{value:0},attenuationColor:{value:new it(0)},specularColor:{value:new it(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new mt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new mt},anisotropyVector:{value:new ve},anisotropyMap:{value:null},anisotropyMapTransform:{value:new mt}}]),vertexShader:vt.meshphysical_vert,fragmentShader:vt.meshphysical_frag};var Uc={r:0,b:0,g:0},Cx=new ft,im=new mt;im.set(-1,0,0,0,1,0,0,0,1);function Px(s,e,t,n,i,r){let o=new it(0),a=i===!0?0:1,l,c,u=null,f=0,h=null;function d(y){let v=y.isScene===!0?y.background:null;if(v&&v.isTexture){let M=y.backgroundBlurriness>0;v=e.get(v,M)}return v}function g(y){let v=!1,M=d(y);M===null?p(o,a):M&&M.isColor&&(p(M,1),v=!0);let R=s.xr.getEnvironmentBlendMode();R==="additive"?t.buffers.color.setClear(0,0,0,1,r):R==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||v)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,v){let M=d(v);M&&M.isCubeTexture?(c===void 0&&(c=new tn(new wi(1,1,1),new Ri({name:"BackgroundCubeMaterial",uniforms:ir(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(R,A,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Cx.makeRotationFromEuler(v.backgroundRotation)).transpose(),M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(im),c.material.toneMapped=bt.getTransfer(M.colorSpace)!==Gt,(u!==M||f!==M.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,h=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new tn(new qs(2,2),new Ri({name:"BackgroundMaterial",uniforms:ir(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:Li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,l.material.toneMapped=bt.getTransfer(M.colorSpace)!==Gt,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||h!==s.toneMapping)&&(l.material.needsUpdate=!0,u=M,f=M.version,h=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function p(y,v){y.getRGB(Uc,Tu(s)),t.buffers.color.setClear(Uc.r,Uc.g,Uc.b,v,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,v=1){o.set(y),a=v,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,p(o,a)},render:g,addToRenderList:_,dispose:m}}function Ix(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null),r=i,o=!1;function a(k,G,H,U,K){let Q=!1,W=f(k,U,H,G);r!==W&&(r=W,c(r.object)),Q=d(k,U,H,K),Q&&g(k,U,H,K),K!==null&&e.update(K,s.ELEMENT_ARRAY_BUFFER),(Q||o)&&(o=!1,M(k,G,H,U),K!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(K).buffer))}function l(){return s.createVertexArray()}function c(k){return s.bindVertexArray(k)}function u(k){return s.deleteVertexArray(k)}function f(k,G,H,U){let K=U.wireframe===!0,Q=n[G.id];Q===void 0&&(Q={},n[G.id]=Q);let W=k.isInstancedMesh===!0?k.id:0,ge=Q[W];ge===void 0&&(ge={},Q[W]=ge);let ee=ge[H.id];ee===void 0&&(ee={},ge[H.id]=ee);let de=ee[K];return de===void 0&&(de=h(l()),ee[K]=de),de}function h(k){let G=[],H=[],U=[];for(let K=0;K<t;K++)G[K]=0,H[K]=0,U[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:H,attributeDivisors:U,object:k,attributes:{},index:null}}function d(k,G,H,U){let K=r.attributes,Q=G.attributes,W=0,ge=H.getAttributes();for(let ee in ge)if(ge[ee].location>=0){let Me=K[ee],Re=Q[ee];if(Re===void 0&&(ee==="instanceMatrix"&&k.instanceMatrix&&(Re=k.instanceMatrix),ee==="instanceColor"&&k.instanceColor&&(Re=k.instanceColor)),Me===void 0||Me.attribute!==Re||Re&&Me.data!==Re.data)return!0;W++}return r.attributesNum!==W||r.index!==U}function g(k,G,H,U){let K={},Q=G.attributes,W=0,ge=H.getAttributes();for(let ee in ge)if(ge[ee].location>=0){let Me=Q[ee];Me===void 0&&(ee==="instanceMatrix"&&k.instanceMatrix&&(Me=k.instanceMatrix),ee==="instanceColor"&&k.instanceColor&&(Me=k.instanceColor));let Re={};Re.attribute=Me,Me&&Me.data&&(Re.data=Me.data),K[ee]=Re,W++}r.attributes=K,r.attributesNum=W,r.index=U}function _(){let k=r.newAttributes;for(let G=0,H=k.length;G<H;G++)k[G]=0}function p(k){m(k,0)}function m(k,G){let H=r.newAttributes,U=r.enabledAttributes,K=r.attributeDivisors;H[k]=1,U[k]===0&&(s.enableVertexAttribArray(k),U[k]=1),K[k]!==G&&(s.vertexAttribDivisor(k,G),K[k]=G)}function y(){let k=r.newAttributes,G=r.enabledAttributes;for(let H=0,U=G.length;H<U;H++)G[H]!==k[H]&&(s.disableVertexAttribArray(H),G[H]=0)}function v(k,G,H,U,K,Q,W){W===!0?s.vertexAttribIPointer(k,G,H,K,Q):s.vertexAttribPointer(k,G,H,U,K,Q)}function M(k,G,H,U){_();let K=U.attributes,Q=H.getAttributes(),W=G.defaultAttributeValues;for(let ge in Q){let ee=Q[ge];if(ee.location>=0){let de=K[ge];if(de===void 0&&(ge==="instanceMatrix"&&k.instanceMatrix&&(de=k.instanceMatrix),ge==="instanceColor"&&k.instanceColor&&(de=k.instanceColor)),de!==void 0){let Me=de.normalized,Re=de.itemSize,nt=e.get(de);if(nt===void 0)continue;let X=nt.buffer,pe=nt.type,Se=nt.bytesPerElement,Ue=pe===s.INT||pe===s.UNSIGNED_INT||de.gpuType===Kl;if(de.isInterleavedBufferAttribute){let _e=de.data,me=_e.isInterleavedBuffer===!0?_e.stride:_e.itemSize,Ie=de.offset;if(_e.isInstancedInterleavedBuffer||_e.isInstancedBufferAttribute){for(let xe=0;xe<ee.locationSize;xe++)m(ee.location+xe,_e.meshPerAttribute);k.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let xe=0;xe<ee.locationSize;xe++)p(ee.location+xe);s.bindBuffer(s.ARRAY_BUFFER,X);for(let xe=0;xe<ee.locationSize;xe++)v(ee.location+xe,Re/ee.locationSize,pe,Me,me*Se,(Ie+Re/ee.locationSize*xe)*Se,Ue)}else{if(de.isInstancedBufferAttribute){for(let _e=0;_e<ee.locationSize;_e++)m(ee.location+_e,de.meshPerAttribute);k.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let _e=0;_e<ee.locationSize;_e++)p(ee.location+_e);s.bindBuffer(s.ARRAY_BUFFER,X);for(let _e=0;_e<ee.locationSize;_e++)v(ee.location+_e,Re/ee.locationSize,pe,Me,Re*Se,Re/ee.locationSize*_e*Se,Ue)}}else if(W!==void 0){let Me=W[ge];if(Me!==void 0)switch(Me.length){case 2:s.vertexAttrib2fv(ee.location,Me);break;case 3:s.vertexAttrib3fv(ee.location,Me);break;case 4:s.vertexAttrib4fv(ee.location,Me);break;default:s.vertexAttrib1fv(ee.location,Me)}}}}y()}function R(){F();for(let k in n){let G=n[k];for(let H in G){let U=G[H];for(let K in U){let Q=U[K];for(let W in Q)u(Q[W].object),delete Q[W];delete U[K]}}delete n[k]}}function A(k){if(n[k.id]===void 0)return;let G=n[k.id];for(let H in G){let U=G[H];for(let K in U){let Q=U[K];for(let W in Q)u(Q[W].object),delete Q[W];delete U[K]}}delete n[k.id]}function b(k){for(let G in n){let H=n[G];for(let U in H){let K=H[U];if(K[k.id]===void 0)continue;let Q=K[k.id];for(let W in Q)u(Q[W].object),delete Q[W];delete K[k.id]}}}function T(k){for(let G in n){let H=n[G],U=k.isInstancedMesh===!0?k.id:0,K=H[U];if(K!==void 0){for(let Q in K){let W=K[Q];for(let ge in W)u(W[ge].object),delete W[ge];delete K[Q]}delete H[U],Object.keys(H).length===0&&delete n[G]}}}function F(){I(),o=!0,r!==i&&(r=i,c(r.object))}function I(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:F,resetDefaultState:I,dispose:R,releaseStatesOfGeometry:A,releaseStatesOfObject:T,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:p,disableUnusedAttributes:y}}function Lx(s,e,t){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,u){u!==0&&(s.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];t.update(h,n,1)}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function Dx(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(b){return!(b!==ui&&n.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let T=b===Mi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==Kn&&b!==si&&!T&&n.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(b){if(b==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(st("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&st("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&st("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),v=s.getParameter(s.MAX_VARYING_VECTORS),M=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),R=s.getParameter(s.MAX_SAMPLES),A=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:y,maxVaryings:v,maxFragmentUniforms:M,maxSamples:R,samples:A}}function Nx(s){let e=this,t=null,n=0,i=!1,r=!1,o=new On,a=new mt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||n!==0||i;return i=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,d){let g=f.clippingPlanes,_=f.clipIntersection,p=f.clipShadows,m=s.get(f);if(!i||g===null||g.length===0||r&&!p)r?u(null):c();else{let y=r?0:n,v=y*4,M=m.clippingState||null;l.value=M,M=u(g,h,v,d);for(let R=0;R!==v;++R)M[R]=t[R];m.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,h,d,g){let _=f!==null?f.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=d+_*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let v=0,M=d;v!==_;++v,M+=4)o.copy(f[v]).applyMatrix4(y,a),o.normal.toArray(p,M),p[M+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}var va=class extends ni{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Vo(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new wi(5,5,5),r=new Ri({name:"CubemapFromEquirect",uniforms:ir(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Gn,blending:Js});r.uniforms.tEquirect.value=t;let o=new tn(i,r),a=t.minFilter;return t.minFilter===hi&&(t.minFilter=bn),new Qr(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}},Up=256,Ux=3,Ox=20,sm=256,rm=16,Fx=3,Bx=new L,kx=new it,Fc=class s{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Qr(1,10,null),this._boxMesh=new tn(new wi(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){let{size:o=256,position:a=Bx}=r,l=this._renderer;this._setSize(o);let c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);let f=l.autoClear,h=l.autoClearColor,d=l.autoClearDepth,g=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(kx));let p=new Qr(n,i,u);return p.position.copy(a),p.update(l,e),l.autoClear=f,l.autoClearColor=h,l.autoClearDepth=d,l.autoClearStencil=g,e.background=_,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Fp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Up,Mu(e))}_fromTexture(e,t){e.mapping===er||e.mapping===no?this._setSize(e.image.length===0?Up:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Op(e,!1,!1),n=Math.log2(e)-Ux;for(let i=0;i<=n;i++)t.texture.mipmaps.push({width:e>>i,height:e>>i});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Op(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let i=this._boxMesh,r=this._cubeCamera;i.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let o=e.width>>t;e.viewport.set(0,0,o,o),r.update(this._renderer,i),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===er||e.mapping===no?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bp()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Fp()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=zx(),this._integrationMaterial=Hx());let t=this._cubeSize,n=e.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/rm);for(let o=0;o<=n;o++){let a=s.lodToRoughness(o,n);if(o>n-Fx)r.roughness.value=a,this._renderCube(e,o,this._integrationMaterial);else{let l=a>0?Math.log2(t)+.5*Math.log2(6/(sm*Math.pow(a,4)))+.5:0;i.roughness.value=a,i.lodBias.value=l,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Gx());let n=this._blurMaterial,i=n.uniforms,r=this._sourceTarget;i.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,i.envMap.value=r.texture,this._renderCube(e,0,n),i.envMap.value=e.texture,this._renderCube(r,0,n)}};function Op(s,e,t){return new va(s,{minFilter:hi,generateMipmaps:e,type:Mi,colorSpace:Fn,depthBuffer:t})}function Ma(s,e,t){return new Ri({name:s,uniforms:e,vertexShader:vt.cube_vert,fragmentShader:t,side:Gn,blending:Js,depthTest:!1,depthWrite:!1})}function zx(){return Ma("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${sm}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Hx(){return Ma("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:rm}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Gx(){return Ma("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Ox}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Fp(){return Ma("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Bp(){return Ma("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Vx(s){let e=new WeakMap,t=new WeakMap,n=null;function i(h,d=!1){return h==null?null:d?o(h):r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===Xl||d===ql)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let _=new va(g.height);return _.fromEquirectangularTexture(s,h),e.set(h,_),h.addEventListener("dispose",c),a(_.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let d=h.mapping,g=d===Xl||d===ql,_=d===er||d===no;if(g||_){let p=t.get(h),m=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new Fc(s)),p=g?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{let y=h.image;return g&&y&&y.height>0||_&&y&&l(y)?(n===null&&(n=new Fc(s)),p=g?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function a(h,d){return d===Xl?h.mapping=er:d===ql&&(h.mapping=no),h}function l(h){let d=0,g=6;for(let _=0;_<g;_++)h[_]!==void 0&&d++;return d===g}function c(h){let d=h.target;d.removeEventListener("dispose",c);let g=e.get(d);g!==void 0&&(e.delete(d),g.dispose())}function u(h){let d=h.target;d.removeEventListener("dispose",u);let g=t.get(d);g!==void 0&&(t.delete(d),g.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:f}}function Wx(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&Ns("WebGLRenderer: "+n+" extension not supported."),i}}}function Xx(s,e,t,n){let i={},r=new WeakMap,o=new FinalizationRegistry(g=>delete i[g]);function a(g){l(g.target)}function l(g){g.index!==null&&e.remove(g.index);for(let p in g.attributes)e.remove(g.attributes[p]);g.removeEventListener("dispose",a),delete i[g.id],o.unregister(g);let _=r.get(g);_&&(e.remove(_),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function c(g,_){return i[_.id]!==void 0||(_.addEventListener("dispose",a),i[_.id]=new WeakRef(_),o.register(_,_.id,_),t.memory.geometries++),_}function u(g){let _=g.attributes;for(let p in _)e.update(_[p],s.ARRAY_BUFFER)}function f(g){let _=g.index,p=g.attributes.position,m=0;if(p===void 0)return;let y=_!==null?_.array.length:p.array.length/3-1,v=p.count>=65535?Fo:Oo,M=new v(Math.ceil(y/3)*6,1),R=M.array;if(_!==null){let b=_.array;m=_.version;for(let T=0,F=0;T<y;T+=3){let I=b[T+0],k=b[T+1],G=b[T+2];R[F++]=I,R[F++]=k,R[F++]=k,R[F++]=G,R[F++]=G,R[F++]=I}}else{m=p.version;for(let b=0,T=0;b<y;b+=3){let F=b+0,I=b+1,k=b+2;R[T++]=F,R[T++]=I,R[T++]=I,R[T++]=k,R[T++]=k,R[T++]=F}}M.version=m;let A=r.get(g);A&&e.remove(A),r.set(g,M)}function h(g){let _=r.get(g);if(_){let p=g.index;p!==null&&_.version<p.version&&f(g)}else f(g);return r.get(g)}function d(){for(let g in i){let _=i[g].deref();_!==void 0&&l(_)}}return{get:c,update:u,getWireframeAttribute:h,dispose:d}}function qx(s,e,t){let n;function i(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,h){s.drawElements(n,h,r,f*o),t.update(h,n,1)}function c(f,h,d){d!==0&&(s.drawElementsInstanced(n,h,r,f*o,d),t.update(h,n,d))}function u(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let _=0;for(let p=0;p<d;p++)_+=h[p];t.update(_,n,1)}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Yx(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:ht("WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Kx(s,e,t){let n=new WeakMap,i=new Xt;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==f){let F=function(){b.dispose(),n.delete(a),a.removeEventListener("dispose",F)};h!==void 0&&h.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],v=0;d===!0&&(v=1),g===!0&&(v=2),_===!0&&(v=3);let M=a.attributes.position.count*v,R=1;M>e.maxTextureSize&&(R=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let A=new Float32Array(M*R*4*f),b=new Do(A,M,R,f);b.type=si,b.needsUpdate=!0;let T=v*4;for(let I=0;I<f;I++){let k=p[I],G=m[I],H=y[I],U=M*R*4*I;for(let K=0;K<k.count;K++){let Q=K*T;d===!0&&(i.fromBufferAttribute(k,K),A[U+Q+0]=i.x,A[U+Q+1]=i.y,A[U+Q+2]=i.z,A[U+Q+3]=0),g===!0&&(i.fromBufferAttribute(G,K),A[U+Q+4]=i.x,A[U+Q+5]=i.y,A[U+Q+6]=i.z,A[U+Q+7]=0),_===!0&&(i.fromBufferAttribute(H,K),A[U+Q+8]=i.x,A[U+Q+9]=i.y,A[U+Q+10]=i.z,A[U+Q+11]=H.itemSize===4?i.w:1)}}h={count:f,texture:b,size:new ve(M,R)},n.set(a,h),a.addEventListener("dispose",F)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function Zx(s,e,t,n,i){let r=new WeakMap;function o(c){let u=i.render.frame,f=c.geometry,h=e.get(c,f);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let d=c.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function a(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var $x={[tu]:"LINEAR_TONE_MAPPING",[nu]:"REINHARD_TONE_MAPPING",[iu]:"CINEON_TONE_MAPPING",[ha]:"ACES_FILMIC_TONE_MAPPING",[ru]:"AGX_TONE_MAPPING",[ou]:"NEUTRAL_TONE_MAPPING",[su]:"CUSTOM_TONE_MAPPING"};function Jx(s,e,t,n,i,r){let o=new ni(e,t,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,u=new on;u.setAttribute("position",new St([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new St([0,2,0,0,2,0],2));let f=new Nl({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new tn(u,f),d=new Zs(-1,1,1,-1,0,1),g=null,_=null,p=!1,m,y=null,v=[],M=!1;this.setSize=function(R,A){o.setSize(R,A),a!==null&&a.setSize(R,A),l!==null&&l.setSize(R,A);for(let b=0;b<v.length;b++){let T=v[b];T.setSize&&T.setSize(R,A)}},this.setEffects=function(R){v=R,M=v.length>0&&v[0].isRenderPass===!0;let A=o.width,b=o.height;v.length>0&&a===null&&(a=new ni(A,b,{type:Mi,depthBuffer:!1,stencilBuffer:!1}),l=new ni(A,b,{type:Mi,depthBuffer:!1,stencilBuffer:!1}));let T=i===!0&&v.some(F=>F.needsDepthTexture===!0);T!==(o.depthTexture!==null)&&(T===!0&&c===null&&(c=new Ji(A,b),r===!0&&(c.format=is,c.type=nr)),o.dispose(),o.depthTexture=T?c:null,o.resolveDepthBuffer=T,o.storeMultisampledDepthBuffer=T);for(let F=0;F<v.length;F++){let I=v[F];I.setSize&&I.setSize(A,b),T&&I.needsDepthTexture===!0&&I.setDepthTexture&&I.setDepthTexture(c)}},this.begin=function(R,A){if(p||R.toneMapping===Di&&v.length===0)return!1;if(y=A,A!==null){let b=A.width,T=A.height;(o.width!==b||o.height!==T)&&this.setSize(b,T)}return M===!1&&R.setRenderTarget(o),m=R.toneMapping,R.toneMapping=Di,!0},this.hasRenderPass=function(){return M},this.end=function(R,A){R.toneMapping=m,p=!0;let b=o,T=a;for(let F=0;F<v.length;F++){let I=v[F];I.enabled!==!1&&(I.render(R,T,b,A),I.needsSwap!==!1&&(b=T,T=T===a?l:a))}if(g!==R.outputColorSpace||_!==R.toneMapping){g=R.outputColorSpace,_=R.toneMapping,f.defines={},bt.getTransfer(g)===Gt&&(f.defines.SRGB_TRANSFER="");let F=$x[_];F&&(f.defines[F]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=b.texture,R.setRenderTarget(y),R.render(h,d),y=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),f.dispose()}}var om=new pn,am=new Ji(1,1),lm=new Wo(1),cm=new Do,hm=new wl,um=new Vo,kp=[],zp=[],Hp=new Float32Array(16),Gp=new Float32Array(9),Vp=new Float32Array(4);function ao(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=kp[i];if(r===void 0&&(r=new Float32Array(i),kp[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Sn(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function En(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function kc(s,e){let t=zp[e];t===void 0&&(t=new Int32Array(e),zp[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function jx(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Qx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Sn(t,e))return;s.uniform2fv(this.addr,e),En(t,e)}}function ev(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Sn(t,e))return;s.uniform3fv(this.addr,e),En(t,e)}}function tv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Sn(t,e))return;s.uniform4fv(this.addr,e),En(t,e)}}function nv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Sn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),En(t,e)}else{if(Sn(t,n))return;Vp.set(n),s.uniformMatrix2fv(this.addr,!1,Vp),En(t,n)}}function iv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Sn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),En(t,e)}else{if(Sn(t,n))return;Gp.set(n),s.uniformMatrix3fv(this.addr,!1,Gp),En(t,n)}}function sv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(Sn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),En(t,e)}else{if(Sn(t,n))return;Hp.set(n),s.uniformMatrix4fv(this.addr,!1,Hp),En(t,n)}}function rv(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function ov(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Sn(t,e))return;s.uniform2iv(this.addr,e),En(t,e)}}function av(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Sn(t,e))return;s.uniform3iv(this.addr,e),En(t,e)}}function lv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Sn(t,e))return;s.uniform4iv(this.addr,e),En(t,e)}}function cv(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function hv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Sn(t,e))return;s.uniform2uiv(this.addr,e),En(t,e)}}function uv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Sn(t,e))return;s.uniform3uiv(this.addr,e),En(t,e)}}function fv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Sn(t,e))return;s.uniform4uiv(this.addr,e),En(t,e)}}function zc(s){return s.version===0&&(s.compareFunction=_u,s.needsUpdate=!0),s}function dv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?r=zc(am):r=om,t.setTexture2D(e||r,i)}function pv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||hm,i)}function mv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_CUBE_SHADOW?r=zc(lm):r=um,t.setTextureCube(e||r,i)}function gv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||cm,i)}function _v(s){switch(s){case 5126:return jx;case 35664:return Qx;case 35665:return ev;case 35666:return tv;case 35674:return nv;case 35675:return iv;case 35676:return sv;case 5124:case 35670:return rv;case 35667:case 35671:return ov;case 35668:case 35672:return av;case 35669:case 35673:return lv;case 5125:return cv;case 36294:return hv;case 36295:return uv;case 36296:return fv;case 35678:case 36198:case 36298:case 36306:case 35682:return dv;case 35679:case 36299:case 36307:return pv;case 35680:case 36300:case 36308:case 36293:return mv;case 36289:case 36303:case 36311:case 36292:return gv}}function yv(s,e){s.uniform1fv(this.addr,e)}function xv(s,e){let t=ao(e,this.size,2);s.uniform2fv(this.addr,t)}function vv(s,e){let t=ao(e,this.size,3);s.uniform3fv(this.addr,t)}function Mv(s,e){let t=ao(e,this.size,4);s.uniform4fv(this.addr,t)}function bv(s,e){let t=ao(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Sv(s,e){let t=ao(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Ev(s,e){let t=ao(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Tv(s,e){s.uniform1iv(this.addr,e)}function wv(s,e){s.uniform2iv(this.addr,e)}function Av(s,e){s.uniform3iv(this.addr,e)}function Rv(s,e){s.uniform4iv(this.addr,e)}function Cv(s,e){s.uniform1uiv(this.addr,e)}function Pv(s,e){s.uniform2uiv(this.addr,e)}function Iv(s,e){s.uniform3uiv(this.addr,e)}function Lv(s,e){s.uniform4uiv(this.addr,e)}function Dv(s,e,t){let n=this.cache,i=e.length,r=kc(t,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=zc(am):o=om;for(let a=0;a!==i;++a)t.setTexture2D(e[a]||o,r[a])}function Nv(s,e,t){let n=this.cache,i=e.length,r=kc(t,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||hm,r[o])}function Uv(s,e,t){let n=this.cache,i=e.length,r=kc(t,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));let o;this.type===s.SAMPLER_CUBE_SHADOW?o=zc(lm):o=um;for(let a=0;a!==i;++a)t.setTextureCube(e[a]||o,r[a])}function Ov(s,e,t){let n=this.cache,i=e.length,r=kc(t,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||cm,r[o])}function Fv(s){switch(s){case 5126:return yv;case 35664:return xv;case 35665:return vv;case 35666:return Mv;case 35674:return bv;case 35675:return Sv;case 35676:return Ev;case 5124:case 35670:return Tv;case 35667:case 35671:return wv;case 35668:case 35672:return Av;case 35669:case 35673:return Rv;case 5125:return Cv;case 36294:return Pv;case 36295:return Iv;case 36296:return Lv;case 35678:case 36198:case 36298:case 36306:case 35682:return Dv;case 35679:case 36299:case 36307:return Nv;case 35680:case 36300:case 36308:case 36293:return Uv;case 36289:case 36303:case 36311:case 36292:return Ov}}var Iu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=_v(t.type)}},Lu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Fv(t.type)}},Du=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(e,t[a.id],n)}}},Cu=/(\w+)(\])?(\[|\.)?/g;function Wp(s,e){s.seq.push(e),s.map[e.id]=e}function Bv(s,e,t){let n=s.name,i=n.length;for(Cu.lastIndex=0;;){let r=Cu.exec(n),o=Cu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Wp(t,c===void 0?new Iu(a,s,e):new Lu(a,s,e));break}else{let f=t.map[a];f===void 0&&(f=new Du(a),Wp(t,f)),t=f}}}var oo=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);Bv(a,l,this)}let i=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let o=e[i];o.id in t&&n.push(o)}return n}};function Xp(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var kv=37297,zv=0;function Hv(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var qp=new mt;function Gv(s){bt._getMatrix(qp,bt.workingColorSpace,s);let e=`mat3( ${qp.elements.map(t=>t.toFixed(4))} )`;switch(bt.getTransfer(s)){case Io:return[e,"LinearTransferOETF"];case Gt:return[e,"sRGBTransferOETF"];default:return st("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Yp(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Hv(s.getShaderSource(e),a)}else return r}function Vv(s,e){let t=Gv(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Wv={[tu]:"Linear",[nu]:"Reinhard",[iu]:"Cineon",[ha]:"ACESFilmic",[ru]:"AgX",[ou]:"Neutral",[su]:"Custom"};function Xv(s,e){let t=Wv[e];return t===void 0?(st("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Oc=new L;function qv(){bt.getLuminanceCoefficients(Oc);let s=Oc.x.toFixed(4),e=Oc.y.toFixed(4),t=Oc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Yv(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xa).join(`
`)}function Kv(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Zv(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function xa(s){return s!==""}function Kp(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Zp(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var $v=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nu(s){return s.replace($v,Jv)}function Jv(s,e){let t=vt[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Nu(t)}var jv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $p(s){return s.replace(jv,Qv)}function Qv(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Jp(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var eM={[$s]:"SHADOWMAP_TYPE_PCF",[to]:"SHADOWMAP_TYPE_VSM"};function tM(s){return eM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var nM={[no]:"ENVMAP_MODE_REFRACTION"};function iM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":nM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var sM={[eu]:"ENVMAP_BLENDING_MULTIPLY",[lp]:"ENVMAP_BLENDING_MIX",[cp]:"ENVMAP_BLENDING_ADD"};function rM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":sM[s.combine]||"ENVMAP_BLENDING_NONE"}function oM(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=tM(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=iM(t),f=rM(t),h=Yv(t),d=Kv(r),g=i.createProgram(),_,p,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(xa).join(`
`),_.length>0&&(_+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(xa).join(`
`),p.length>0&&(p+=`
`)):(_=[Jp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xa).join(`
`),p=[Jp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Di?"#define TONE_MAPPING":"",t.toneMapping!==Di?vt.tonemapping_pars_fragment:"",t.toneMapping!==Di?Xv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",vt.colorspace_pars_fragment,Vv("linearToOutputTexel",t.outputColorSpace),qv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xa).join(`
`)),o=Nu(o),o=Kp(o,t),o=Zp(o,t),a=Nu(a),a=Kp(a,t),a=Zp(a,t),o=$p(o),a=$p(a),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,_=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,p=["#define varying in",t.glslVersion===xu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===xu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let y=m+_+o,v=m+p+a,M=Xp(i,i.VERTEX_SHADER,y),R=Xp(i,i.FRAGMENT_SHADER,v);i.attachShader(g,M),i.attachShader(g,R),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function A(I){if(s.debug.checkShaderErrors){let k=i.getProgramInfoLog(g)||"",G=i.getShaderInfoLog(M)||"",H=i.getShaderInfoLog(R)||"",U=k.trim(),K=G.trim(),Q=H.trim(),W=!0,ge=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(W=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,g,M,R);else{let ee=Yp(i,M,"vertex"),de=Yp(i,R,"fragment");ht("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+U+`
`+ee+`
`+de)}else U!==""?st("WebGLProgram: Program Info Log:",U):(K===""||Q==="")&&(ge=!1);ge&&(I.diagnostics={runnable:W,programLog:U,vertexShader:{log:K,prefix:_},fragmentShader:{log:Q,prefix:p}})}i.deleteShader(M),i.deleteShader(R),b=new oo(i,g),T=Zv(i,g)}let b;this.getUniforms=function(){return b===void 0&&A(this),b};let T;this.getAttributes=function(){return T===void 0&&A(this),T};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=i.getProgramParameter(g,kv)),F},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=zv++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=M,this.fragmentShader=R,this}var aM=0,Uu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ou(e),t.set(e,n)),n}},Ou=class{constructor(e){this.id=aM++,this.code=e,this.usedTimes=0}};function lM(s){return s===Es||s===ma||s===ga}function cM(s,e,t,n,i,r){let o=new Br,a=new Uu,l=new Set,c=[],u=new Map,f=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(b){return l.add(b),b===0?"uv":`uv${b}`}function g(b,T,F,I,k,G){let H=I.fog,U=k.geometry,K=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?I.environment:null,Q=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,W=e.get(b.envMap||K,Q),ge=h[b.type],ee=n.precision;b.precision!==null&&(ee=n.getMaxPrecision(b.precision),ee!==b.precision&&st("WebGLProgram.getParameters:",b.precision,"not supported, using",ee,"instead."));let de=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Me=de!==void 0?de.length:0,Re=0;U.morphAttributes.position!==void 0&&(Re=1),U.morphAttributes.normal!==void 0&&(Re=2),U.morphAttributes.color!==void 0&&(Re=3);let nt,X,pe,Se;if(ge){let ke=Ui[ge];nt=ke.vertexShader,X=ke.fragmentShader}else{nt=b.vertexShader,X=b.fragmentShader;let ke=a.getVertexShaderStage(b),Dt=a.getFragmentShaderStage(b);a.update(b,ke,Dt),pe=ke.id,Se=Dt.id}let Ue=s.getRenderTarget(),_e=s.state.buffers.depth.getReversed(),me=k.isInstancedMesh===!0,Ie=k.isBatchedMesh===!0,xe=!!b.map,Ne=!!b.matcap,Qe=!!W,Ye=Qe&&W.isPMREMTexture===!0,rt=!!b.aoMap,gt=!!b.lightMap,Pt=!!b.bumpMap&&b.wireframe===!1,yt=!!b.normalMap,kt=!!b.displacementMap,ot=!!b.emissiveMap,Ut=!!b.metalnessMap,hn=!!b.roughnessMap,un=b.anisotropy>0,Y=b.clearcoat>0,lt=b.diffuseRoughness>0,It=b.dispersion>0,At=b.retroreflectivity>0,De=b.iridescence>0,Kt=b.sheen>0,tt=b.transmission>0,Be=un&&!!b.anisotropyMap,D=Y&&!!b.clearcoatMap,w=Y&&!!b.clearcoatNormalMap,te=Y&&!!b.clearcoatRoughnessMap,Te=lt&&!!b.diffuseRoughnessMap,oe=De&&!!b.iridescenceMap,ne=De&&!!b.iridescenceThicknessMap,Ae=Kt&&!!b.sheenColorMap,ue=Kt&&!!b.sheenRoughnessMap,le=!!b.specularMap,Ce=!!b.specularColorMap,B=!!b.specularIntensityMap,ye=tt&&!!b.transmissionMap,j=tt&&!!b.thicknessMap,Z=!!b.gradientMap,J=!!b.alphaMap,O=b.alphaTest>0,ze=!!b.alphaHash,at=!!b.extensions,we=Di;b.toneMapped&&(Ue===null||Ue.isXRRenderTarget===!0)&&(we=s.toneMapping);let et=Ye?W.isCompressedCubeTexture?W.image[0].mipmaps:W.mipmaps:null,pt={shaderID:ge,shaderType:b.type,shaderName:b.name,vertexShader:nt,fragmentShader:X,defines:b.defines,customVertexShaderID:pe,customFragmentShaderID:Se,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:ee,batching:Ie,batchingColor:Ie&&k._colorsTexture!==null,instancing:me,instancingColor:me&&k.instanceColor!==null,instancingMorph:me&&k.morphTexture!==null,outputColorSpace:Ue===null?s.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:bt.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:xe,matcap:Ne,envMap:Qe,envMapMode:Qe&&W.mapping,envMapPMREM:Ye,envMapMaxLod:Ye?et.length-1:null,envMapSize:Ye?et[0].width:null,aoMap:rt,lightMap:gt,bumpMap:Pt,normalMap:yt,displacementMap:kt,emissiveMap:ot,normalMapObjectSpace:yt&&b.normalMapType===mp,normalMapTangentSpace:yt&&b.normalMapType===Dc,packedNormalMap:yt&&b.normalMapType===Dc&&lM(b.normalMap.format),metalnessMap:Ut,roughnessMap:hn,anisotropy:un,anisotropyMap:Be,clearcoat:Y,clearcoatMap:D,clearcoatNormalMap:w,clearcoatRoughnessMap:te,diffuseRoughness:lt,diffuseRoughnessMap:Te,dispersion:It,retroreflection:At,iridescence:De,iridescenceMap:oe,iridescenceThicknessMap:ne,sheen:Kt,sheenColorMap:Ae,sheenRoughnessMap:ue,specularMap:le,specularColorMap:Ce,specularIntensityMap:B,transmission:tt,transmissionMap:ye,thicknessMap:j,gradientMap:Z,opaque:b.transparent===!1&&b.blending===Ss&&b.alphaToCoverage===!1,alphaMap:J,alphaTest:O,alphaHash:ze,combine:b.combine,mapUv:xe&&d(b.map.channel),aoMapUv:rt&&d(b.aoMap.channel),lightMapUv:gt&&d(b.lightMap.channel),bumpMapUv:Pt&&d(b.bumpMap.channel),normalMapUv:yt&&d(b.normalMap.channel),displacementMapUv:kt&&d(b.displacementMap.channel),emissiveMapUv:ot&&d(b.emissiveMap.channel),metalnessMapUv:Ut&&d(b.metalnessMap.channel),roughnessMapUv:hn&&d(b.roughnessMap.channel),anisotropyMapUv:Be&&d(b.anisotropyMap.channel),clearcoatMapUv:D&&d(b.clearcoatMap.channel),clearcoatNormalMapUv:w&&d(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&d(b.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Te&&d(b.diffuseRoughnessMap.channel),iridescenceMapUv:oe&&d(b.iridescenceMap.channel),iridescenceThicknessMapUv:ne&&d(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ae&&d(b.sheenColorMap.channel),sheenRoughnessMapUv:ue&&d(b.sheenRoughnessMap.channel),specularMapUv:le&&d(b.specularMap.channel),specularColorMapUv:Ce&&d(b.specularColorMap.channel),specularIntensityMapUv:B&&d(b.specularIntensityMap.channel),transmissionMapUv:ye&&d(b.transmissionMap.channel),thicknessMapUv:j&&d(b.thicknessMap.channel),alphaMapUv:J&&d(b.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(yt||un),vertexNormals:!!U.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!U.attributes.uv&&(xe||J),fog:!!H,useFog:b.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||U.attributes.normal===void 0&&yt===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:_e,skinning:k.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Re,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:G.filter(ke=>ke.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&F.length>0,shadowMapType:s.shadowMap.type,toneMapping:we,decodeVideoTexture:xe&&b.map.isVideoTexture===!0&&bt.getTransfer(b.map.colorSpace)===Gt,decodeVideoTextureEmissive:ot&&b.emissiveMap.isVideoTexture===!0&&bt.getTransfer(b.emissiveMap.colorSpace)===Gt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===An,flipSided:b.side===Gn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:at&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&b.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return pt.vertexUv1s=l.has(1),pt.vertexUv2s=l.has(2),pt.vertexUv3s=l.has(3),l.clear(),pt}function _(b){let T=[];if(b.shaderID?T.push(b.shaderID):(T.push(b.customVertexShaderID),T.push(b.customFragmentShaderID)),b.defines!==void 0)for(let F in b.defines)T.push(F),T.push(b.defines[F]);return b.isRawShaderMaterial===!1&&(p(T,b),m(T,b),T.push(s.outputColorSpace)),T.push(b.customProgramCacheKey),T.join()}function p(b,T){b.push(T.precision),b.push(T.outputColorSpace),b.push(T.envMapMode),b.push(T.envMapPMREM),b.push(T.envMapMaxLod),b.push(T.envMapSize),b.push(T.mapUv),b.push(T.alphaMapUv),b.push(T.lightMapUv),b.push(T.aoMapUv),b.push(T.bumpMapUv),b.push(T.normalMapUv),b.push(T.displacementMapUv),b.push(T.emissiveMapUv),b.push(T.metalnessMapUv),b.push(T.roughnessMapUv),b.push(T.anisotropyMapUv),b.push(T.clearcoatMapUv),b.push(T.clearcoatNormalMapUv),b.push(T.clearcoatRoughnessMapUv),b.push(T.diffuseRoughnessMapUv),b.push(T.iridescenceMapUv),b.push(T.iridescenceThicknessMapUv),b.push(T.sheenColorMapUv),b.push(T.sheenRoughnessMapUv),b.push(T.specularMapUv),b.push(T.specularColorMapUv),b.push(T.specularIntensityMapUv),b.push(T.transmissionMapUv),b.push(T.thicknessMapUv),b.push(T.combine),b.push(T.fogExp2),b.push(T.sizeAttenuation),b.push(T.morphTargetsCount),b.push(T.numSunLights),b.push(T.numDirLights),b.push(T.numPointLights),b.push(T.numSpotLights),b.push(T.numSpotLightMaps),b.push(T.numHemiLights),b.push(T.numRectAreaLights),b.push(T.numSunLightShadows),b.push(T.numDirLightShadows),b.push(T.numPointLightShadows),b.push(T.numSpotLightShadows),b.push(T.numSpotLightShadowsWithMaps),b.push(T.numLightProbes),b.push(T.numLightProbeGrids),b.push(T.shadowMapType),b.push(T.toneMapping),b.push(T.numClippingPlanes),b.push(T.numClipIntersection),b.push(T.depthPacking)}function m(b,T){o.disableAll(),T.instancing&&o.enable(0),T.instancingColor&&o.enable(1),T.instancingMorph&&o.enable(2),T.matcap&&o.enable(3),T.envMap&&o.enable(4),T.normalMapObjectSpace&&o.enable(5),T.normalMapTangentSpace&&o.enable(6),T.clearcoat&&o.enable(7),T.iridescence&&o.enable(8),T.alphaTest&&o.enable(9),T.vertexColors&&o.enable(10),T.vertexAlphas&&o.enable(11),T.vertexUv1s&&o.enable(12),T.vertexUv2s&&o.enable(13),T.vertexUv3s&&o.enable(14),T.vertexTangents&&o.enable(15),T.anisotropy&&o.enable(16),T.alphaHash&&o.enable(17),T.batching&&o.enable(18),T.dispersion&&o.enable(19),T.retroreflection&&o.enable(24),T.diffuseRoughness&&o.enable(25),T.batchingColor&&o.enable(20),T.gradientMap&&o.enable(21),T.packedNormalMap&&o.enable(22),T.vertexNormals&&o.enable(23),b.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.reversedDepthBuffer&&o.enable(4),T.skinning&&o.enable(5),T.morphTargets&&o.enable(6),T.morphNormals&&o.enable(7),T.morphColors&&o.enable(8),T.premultipliedAlpha&&o.enable(9),T.shadowMapEnabled&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.decodeVideoTextureEmissive&&o.enable(20),T.alphaToCoverage&&o.enable(21),T.numLightProbeGrids>0&&o.enable(22),T.hasPositionAttribute&&o.enable(23),b.push(o.mask)}function y(b){let T=h[b.type],F;if(T){let I=Ui[T];F=Lp.clone(I.uniforms)}else F=b.uniforms;return F}function v(b,T){let F=u.get(T);return F!==void 0?++F.usedTimes:(F=new oM(s,T,b,i),c.push(F),u.set(T,F)),F}function M(b){if(--b.usedTimes===0){let T=c.indexOf(b);c[T]=c[c.length-1],c.pop(),u.delete(b.cacheKey),b.destroy()}}function R(b){a.remove(b)}function A(){a.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:y,acquireProgram:v,releaseProgram:M,releaseShaderCache:R,programs:c,dispose:A}}function hM(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function uM(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function jp(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Qp(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function a(h,d,g,_,p,m){let y=s[e];return y===void 0?(y={id:h.id,object:h,geometry:d,material:g,materialVariant:o(h),groupOrder:_,renderOrder:h.renderOrder,z:p,group:m},s[e]=y):(y.id=h.id,y.object=h,y.geometry=d,y.material=g,y.materialVariant=o(h),y.groupOrder=_,y.renderOrder=h.renderOrder,y.z=p,y.group=m),e++,y}function l(h,d,g,_,p,m,y){y.reversedDepth===!0&&(p=-p);let v=a(h,d,g,_,p,m);g.transmission>0?n.push(v):g.transparent===!0?i.push(v):t.push(v)}function c(h,d,g,_,p,m){let y=a(h,d,g,_,p,m);g.transmission>0?n.unshift(y):g.transparent===!0?i.unshift(y):t.unshift(y)}function u(h,d){t.length>1&&t.sort(h||uM),n.length>1&&n.sort(d||jp),i.length>1&&i.sort(d||jp)}function f(){for(let h=e,d=s.length;h<d;h++){let g=s[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:f,sort:u}}function fM(){let s=new WeakMap;function e(n,i){let r=s.get(n),o;return r===void 0?(o=new Qp,s.set(n,[o])):i>=r.length?(o=new Qp,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function dM(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new L,color:new it};break;case"SpotLight":t={position:new L,direction:new L,color:new it,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new it,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new it,groundColor:new it};break;case"RectAreaLight":t={color:new it,position:new L,halfWidth:new L,halfHeight:new L};break}return s[e.id]=t,t}}}function pM(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ve,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var mM=0;function gM(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function _M(s){let e=new dM,t=pM(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);let i=new L,r=new ft,o=new ft;function a(c){let u=0,f=0,h=0;for(let G=0;G<9;G++)n.probe[G].set(0,0,0);let d=0,g=0,_=0,p=0,m=0,y=0,v=0,M=0,R=0,A=0,b=0,T=0,F=0,I=0;c.sort(gM);for(let G=0,H=c.length;G<H;G++){let U=c[G],K=U.color,Q=U.intensity,W=U.distance,ge=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Es?ge=U.shadow.map.texture:ge=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=K.r*Q,f+=K.g*Q,h+=K.b*Q;else if(U.isLightProbe){for(let ee=0;ee<9;ee++)n.probe[ee].addScaledVector(U.sh.coefficients[ee],Q);I++}else if(U.isSunLight){let ee=e.get(U);if(ee.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let de=U.shadow,Me=t.get(U);Me.shadowIntensity=de.intensity,Me.shadowBias=de.bias,Me.shadowNormalBias=de.normalBias,Me.shadowRadius=de.radius,Me.shadowMapSize.copy(de.mapSize).multiply(de.getFrameExtents()),n.sunShadow[g]=Me,n.sunShadowMap[g]=ge;let Re=de.getViewportCount();for(let nt=0;nt<Re;nt++)n.sunShadowMatrix[_+nt]=de.getMatrix(nt),n.sunShadowCascade[_+nt]=de._cascadeData[nt];_+=Re,g++}n.sun[d]=ee,d++}else if(U.isDirectionalLight){let ee=e.get(U);if(ee.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let de=U.shadow,Me=t.get(U);Me.shadowIntensity=de.intensity,Me.shadowBias=de.bias,Me.shadowNormalBias=de.normalBias,Me.shadowRadius=de.radius,Me.shadowMapSize=de.mapSize,n.directionalShadow[p]=Me,n.directionalShadowMap[p]=ge,n.directionalShadowMatrix[p]=U.shadow.matrix,R++}n.directional[p]=ee,p++}else if(U.isSpotLight){let ee=e.get(U);ee.position.setFromMatrixPosition(U.matrixWorld),ee.color.copy(K).multiplyScalar(Q),ee.distance=W,ee.coneCos=Math.cos(U.angle),ee.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),ee.decay=U.decay,n.spot[y]=ee;let de=U.shadow;if(U.map&&(n.spotLightMap[T]=U.map,T++,de.updateMatrices(U),U.castShadow&&F++),n.spotLightMatrix[y]=de.matrix,U.castShadow){let Me=t.get(U);Me.shadowIntensity=de.intensity,Me.shadowBias=de.bias,Me.shadowNormalBias=de.normalBias,Me.shadowRadius=de.radius,Me.shadowMapSize=de.mapSize,n.spotShadow[y]=Me,n.spotShadowMap[y]=ge,b++}y++}else if(U.isRectAreaLight){let ee=e.get(U);ee.color.copy(K).multiplyScalar(Q),ee.halfWidth.set(U.width*.5,0,0),ee.halfHeight.set(0,U.height*.5,0),n.rectArea[v]=ee,v++}else if(U.isPointLight){let ee=e.get(U);if(ee.color.copy(U.color).multiplyScalar(U.intensity),ee.distance=U.distance,ee.decay=U.decay,U.castShadow){let de=U.shadow,Me=t.get(U);Me.shadowIntensity=de.intensity,Me.shadowBias=de.bias,Me.shadowNormalBias=de.normalBias,Me.shadowRadius=de.radius,Me.shadowMapSize=de.mapSize,Me.shadowCameraNear=de.camera.near,Me.shadowCameraFar=de.camera.far,n.pointShadow[m]=Me,n.pointShadowMap[m]=ge,n.pointShadowMatrix[m]=U.shadow.matrix,A++}n.point[m]=ee,m++}else if(U.isHemisphereLight){let ee=e.get(U);ee.skyColor.copy(U.color).multiplyScalar(Q),ee.groundColor.copy(U.groundColor).multiplyScalar(Q),n.hemi[M]=ee,M++}}v>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ge.LTC_FLOAT_1,n.rectAreaLTC2=Ge.LTC_FLOAT_2):(n.rectAreaLTC1=Ge.LTC_HALF_1,n.rectAreaLTC2=Ge.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;let k=n.hash;(k.sunLength!==d||k.directionalLength!==p||k.pointLength!==m||k.spotLength!==y||k.rectAreaLength!==v||k.hemiLength!==M||k.numSunShadows!==g||k.numDirectionalShadows!==R||k.numPointShadows!==A||k.numSpotShadows!==b||k.numSpotMaps!==T||k.numLightProbes!==I)&&(n.sun.length=d,n.directional.length=p,n.spot.length=y,n.rectArea.length=v,n.point.length=m,n.hemi.length=M,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=R,n.directionalShadowMap.length=R,n.directionalShadowMatrix.length=R,n.pointShadow.length=A,n.pointShadowMap.length=A,n.pointShadowMatrix.length=A,n.spotShadow.length=b,n.spotShadowMap.length=b,n.spotLightMatrix.length=b+T-F,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=F,n.numLightProbes=I,k.sunLength=d,k.directionalLength=p,k.pointLength=m,k.spotLength=y,k.rectAreaLength=v,k.hemiLength=M,k.numSunShadows=g,k.numDirectionalShadows=R,k.numPointShadows=A,k.numSpotShadows=b,k.numSpotMaps=T,k.numLightProbes=I,n.version=mM++)}function l(c,u){let f=0,h=0,d=0,g=0,_=0,p=0,m=u.matrixWorldInverse;for(let y=0,v=c.length;y<v;y++){let M=c[y];if(M.isSunLight){let R=n.sun[f];R.direction.setFromMatrixPosition(M.matrixWorld),R.direction.transformDirection(m),f++}else if(M.isDirectionalLight){let R=n.directional[h];R.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),R.direction.sub(i),R.direction.transformDirection(m),h++}else if(M.isSpotLight){let R=n.spot[g];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(m),R.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),R.direction.sub(i),R.direction.transformDirection(m),g++}else if(M.isRectAreaLight){let R=n.rectArea[_];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),R.halfWidth.set(M.width*.5,0,0),R.halfHeight.set(0,M.height*.5,0),R.halfWidth.applyMatrix4(o),R.halfHeight.applyMatrix4(o),_++}else if(M.isPointLight){let R=n.point[d];R.position.setFromMatrixPosition(M.matrixWorld),R.position.applyMatrix4(m),d++}else if(M.isHemisphereLight){let R=n.hemi[p];R.direction.setFromMatrixPosition(M.matrixWorld),R.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:n}}function em(s){let e=new _M(s),t=[],n=[],i=[];function r(f){u.camera=f,t.length=0,n.length=0,i.length=0}function o(f){f.isLightProbeGrid?i.push(f):t.push(f)}function a(f){n.push(f)}function l(){e.setup(t),i.sort((f,h)=>f.priority-h.priority||f.id-h.id)}function c(f){e.setupView(t,f)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function yM(s){let e=new WeakMap;function t(i,r=0){let o=e.get(i),a;return o===void 0?(a=new em(s),e.set(i,[a])):r>=o.length?(a=new em(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var xM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vM=`uniform sampler2D shadow_pass;
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
}`,MM=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],bM=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],tm=new ft,ya=new L,Pu=new L;function SM(s,e,t){let n=new gs,i=new ve,r=new ve,o=new Xt,a=new Ul,l=new Ol,c={},u=t.maxTextureSize,f={[Li]:Gn,[Gn]:Li,[An]:An},h=new Ri({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ve},radius:{value:4}},vertexShader:xM,fragmentShader:vM}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let g=new on;g.setAttribute("position",new Rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new tn(g,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=$s;let m=this.type;this.render=function(A,b,T){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||A.length===0)return;this.type===Vd&&(st("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=$s);let F=s.getRenderTarget(),I=s.getActiveCubeFace(),k=s.getActiveMipmapLevel(),G=s.state;G.setBlending(Js),G.buffers.depth.getReversed()===!0?G.buffers.color.setClear(0,0,0,0):G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);let H=m!==this.type;H&&b.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(K=>K.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,K=A.length;U<K;U++){let Q=A[U],W=Q.shadow;if(W===void 0){st("WebGLShadowMap:",Q,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;i.copy(W.mapSize);let ge=W.getFrameExtents();i.multiply(ge),r.copy(W.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/ge.x),i.x=r.x*ge.x,W.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/ge.y),i.y=r.y*ge.y,W.mapSize.y=r.y));let ee=s.state.buffers.depth.getReversed();if(W.camera._reversedDepth=ee,W.map===null||H===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===to){if(Q.isPointLight){st("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new ni(i.x,i.y,{format:Es,type:Mi,minFilter:bn,magFilter:bn,generateMipmaps:!1}),W.map.texture.name=Q.name+".shadowMap",W.map.depthTexture=new Ji(i.x,i.y,si),W.map.depthTexture.name=Q.name+".shadowMapDepth",W.map.depthTexture.format=qi,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=dn,W.map.depthTexture.magFilter=dn}else Q.isPointLight?(W.map=new va(i.x),W.map.depthTexture=new Wo(i.x,vi)):(W.map=new ni(i.x,i.y),W.map.depthTexture=new Ji(i.x,i.y,vi)),W.map.depthTexture.name=Q.name+".shadowMap",W.map.depthTexture.format=qi,this.type===$s?(W.map.depthTexture.compareFunction=ee?gu:mu,W.map.depthTexture.minFilter=bn,W.map.depthTexture.magFilter=bn):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=dn,W.map.depthTexture.magFilter=dn);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==i.x||W.map.height!==i.y)&&W.map.setSize(i.x,i.y);let de=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();Q.isPointLight!==!0&&W.updateMatrices(Q,T);let Me=(W.camera.layers.mask&4294967294)!==0?W.camera.layers:T.layers;for(let Re=0;Re<de;Re++){let nt=W.getCamera(Re);if(Q.isPointLight){let X=W.camera,pe=W.matrix,Se=Q.distance||X.far;Se!==X.far&&(X.far=Se,X.updateProjectionMatrix()),ya.setFromMatrixPosition(Q.matrixWorld),X.position.copy(ya),Pu.copy(X.position),Pu.add(MM[Re]),X.up.copy(bM[Re]),X.lookAt(Pu),X.updateMatrixWorld(),pe.makeTranslation(-ya.x,-ya.y,-ya.z),tm.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),W._frustum.setFromProjectionMatrix(tm,X.coordinateSystem,X.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)s.setRenderTarget(W.map,Re),s.clear();else{Re===0&&(s.setRenderTarget(W.map),s.clear());let X=W.getViewport(Re);o.set(r.x*X.x,r.y*X.y,r.x*X.z,r.y*X.w),G.viewport(o)}n=W.getFrustum(Re),M(b,T,nt,Q,Me,this.type)}W.isPointLightShadow!==!0&&this.type===to&&y(W,T),W.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(F,I,k)};function y(A,b){let T=e.update(_);h.defines.VSM_SAMPLES!==A.blurSamples&&(h.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null?A.mapPass=new ni(i.x,i.y,{format:Es,type:Mi}):(A.mapPass.width!==A.map.width||A.mapPass.height!==A.map.height)&&A.mapPass.setSize(A.map.width,A.map.height),h.uniforms.shadow_pass.value=A.map.depthTexture,h.uniforms.resolution.value.set(A.map.width,A.map.height),h.uniforms.radius.value=A.radius,s.setRenderTarget(A.mapPass),s.clear(),s.renderBufferDirect(b,null,T,h,_,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value.set(A.map.width,A.map.height),d.uniforms.radius.value=A.radius,s.setRenderTarget(A.map),s.clear(),s.renderBufferDirect(b,null,T,d,_,null)}function v(A,b,T,F){let I=null,k=T.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(k!==void 0)I=k;else if(I=T.isPointLight===!0?l:a,s.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let G=I.uuid,H=b.uuid,U=c[G];U===void 0&&(U={},c[G]=U);let K=U[H];K===void 0&&(K=I.clone(),U[H]=K,b.addEventListener("dispose",R)),I=K}if(I.visible=b.visible,I.wireframe=b.wireframe,F===to?I.side=b.shadowSide!==null?b.shadowSide:b.side:I.side=b.shadowSide!==null?b.shadowSide:f[b.side],I.alphaMap=b.alphaMap,I.alphaTest=b.alphaToCoverage===!0?.5:b.alphaTest,I.map=b.map,I.clipShadows=b.clipShadows,I.clippingPlanes=b.clippingPlanes,I.clipIntersection=b.clipIntersection,I.displacementMap=b.displacementMap,I.displacementScale=b.displacementScale,I.displacementBias=b.displacementBias,I.wireframeLinewidth=b.wireframeLinewidth,I.linewidth=b.linewidth,T.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let G=s.properties.get(I);G.light=T}return I}function M(A,b,T,F,I,k){if(A.visible===!1)return;if(A.layers.test(I)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&k===to)&&(!A.frustumCulled||A.intersectsFrustum(n))){A.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,A.matrixWorld);let U=e.update(A),K=A.material;if(Array.isArray(K)){let Q=U.groups;for(let W=0,ge=Q.length;W<ge;W++){let ee=Q[W],de=K[ee.materialIndex];if(de&&de.visible){let Me=v(A,de,F,k);A.onBeforeShadow(s,A,b,T,U,Me,ee),s.renderBufferDirect(T,null,U,Me,A,ee),A.onAfterShadow(s,A,b,T,U,Me,ee)}}}else if(K.visible){let Q=v(A,K,F,k);A.onBeforeShadow(s,A,b,T,U,Q,null),s.renderBufferDirect(T,null,U,Q,A,null),A.onAfterShadow(s,A,b,T,U,Q,null)}}let H=A.children;for(let U=0,K=H.length;U<K;U++)M(H[U],b,T,F,I,k)}function R(A){A.target.removeEventListener("dispose",R);for(let T in c){let F=c[T],I=A.target.uuid;I in F&&(F[I].dispose(),delete F[I])}}}function EM(s,e){function t(){let B=!1,ye=new Xt,j=null,Z=new Xt(0,0,0,0);return{setMask:function(J){j!==J&&!B&&(s.colorMask(J,J,J,J),j=J)},setLocked:function(J){B=J},setClear:function(J,O,ze,at,we){we===!0&&(J*=at,O*=at,ze*=at),ye.set(J,O,ze,at),Z.equals(ye)===!1&&(s.clearColor(J,O,ze,at),Z.copy(ye))},reset:function(){B=!1,j=null,Z.set(-1,0,0,0)}}}function n(){let B=!1,ye=!1,j=null,Z=null,J=null;return{setReversed:function(O){if(ye!==O){let ze=e.get("EXT_clip_control");O?ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.ZERO_TO_ONE_EXT):ze.clipControlEXT(ze.LOWER_LEFT_EXT,ze.NEGATIVE_ONE_TO_ONE_EXT),ye=O;let at=J;J=null,this.setClear(at)}},getReversed:function(){return ye},setTest:function(O){O?_e(s.DEPTH_TEST):me(s.DEPTH_TEST)},setMask:function(O){j!==O&&!B&&(s.depthMask(O),j=O)},setFunc:function(O){if(ye&&(O=Tp[O]),Z!==O){switch(O){case _l:s.depthFunc(s.NEVER);break;case yl:s.depthFunc(s.ALWAYS);break;case xl:s.depthFunc(s.LESS);break;case Lr:s.depthFunc(s.LEQUAL);break;case vl:s.depthFunc(s.EQUAL);break;case Ml:s.depthFunc(s.GEQUAL);break;case bl:s.depthFunc(s.GREATER);break;case Sl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Z=O}},setLocked:function(O){B=O},setClear:function(O){J!==O&&(J=O,ye&&(O=1-O),s.clearDepth(O))},reset:function(){B=!1,j=null,Z=null,J=null,ye=!1}}}function i(){let B=!1,ye=null,j=null,Z=null,J=null,O=null,ze=null,at=null,we=null;return{setTest:function(et){B||(et?_e(s.STENCIL_TEST):me(s.STENCIL_TEST))},setMask:function(et){ye!==et&&!B&&(s.stencilMask(et),ye=et)},setFunc:function(et,pt,ke){(j!==et||Z!==pt||J!==ke)&&(s.stencilFunc(et,pt,ke),j=et,Z=pt,J=ke)},setOp:function(et,pt,ke){(O!==et||ze!==pt||at!==ke)&&(s.stencilOp(et,pt,ke),O=et,ze=pt,at=ke)},setLocked:function(et){B=et},setClear:function(et){we!==et&&(s.clearStencil(et),we=et)},reset:function(){B=!1,ye=null,j=null,Z=null,J=null,O=null,ze=null,at=null,we=null}}}let r=new t,o=new n,a=new i,l={},c=new WeakMap,u={},f={},h={},d=new WeakMap,g=[],_=null,p=!1,m=null,y=null,v=null,M=null,R=null,A=null,b=null,T=new it(0,0,0),F=0,I=!1,k=null,G=null,H=null,U=null,K=null,Q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,ge=0,ee=s.getParameter(s.VERSION);ee.indexOf("WebGL")!==-1?(ge=parseFloat(/^WebGL (\d)/.exec(ee)[1]),W=ge>=1):ee.indexOf("OpenGL ES")!==-1&&(ge=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),W=ge>=2);let de=null,Me={},Re=s.getParameter(s.SCISSOR_BOX),nt=s.getParameter(s.VIEWPORT),X=new Xt().fromArray(Re),pe=new Xt().fromArray(nt);function Se(B,ye,j,Z){let J=new Uint8Array(4),O=s.createTexture();s.bindTexture(B,O),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ze=0;ze<j;ze++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(ye,0,s.RGBA,1,1,Z,0,s.RGBA,s.UNSIGNED_BYTE,J):s.texImage2D(ye+ze,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,J);return O}let Ue={};Ue[s.TEXTURE_2D]=Se(s.TEXTURE_2D,s.TEXTURE_2D,1),Ue[s.TEXTURE_CUBE_MAP]=Se(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ue[s.TEXTURE_2D_ARRAY]=Se(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Ue[s.TEXTURE_3D]=Se(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),_e(s.DEPTH_TEST),o.setFunc(Lr),Pt(!1),yt(Zh),_e(s.CULL_FACE),rt(Js);function _e(B){u[B]!==!0&&(s.enable(B),u[B]=!0)}function me(B){u[B]!==!1&&(s.disable(B),u[B]=!1)}function Ie(B,ye){return h[B]!==ye?(s.bindFramebuffer(B,ye),h[B]=ye,B===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=ye),B===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=ye),!0):!1}function xe(B,ye){let j=g,Z=!1;if(B){j=d.get(ye),j===void 0&&(j=[],d.set(ye,j));let J=B.textures;if(j.length!==J.length||j[0]!==s.COLOR_ATTACHMENT0){for(let O=0,ze=J.length;O<ze;O++)j[O]=s.COLOR_ATTACHMENT0+O;j.length=J.length,Z=!0}}else j[0]!==s.BACK&&(j[0]=s.BACK,Z=!0);Z&&s.drawBuffers(j)}function Ne(B){return _!==B?(s.useProgram(B),_=B,!0):!1}let Qe={[Qs]:s.FUNC_ADD,[Xd]:s.FUNC_SUBTRACT,[qd]:s.FUNC_REVERSE_SUBTRACT};Qe[Yd]=s.MIN,Qe[Kd]=s.MAX;let Ye={[Zd]:s.ZERO,[$d]:s.ONE,[Jd]:s.SRC_COLOR,[jh]:s.SRC_ALPHA,[ip]:s.SRC_ALPHA_SATURATE,[tp]:s.DST_COLOR,[Qd]:s.DST_ALPHA,[jd]:s.ONE_MINUS_SRC_COLOR,[Qh]:s.ONE_MINUS_SRC_ALPHA,[np]:s.ONE_MINUS_DST_COLOR,[ep]:s.ONE_MINUS_DST_ALPHA,[sp]:s.CONSTANT_COLOR,[rp]:s.ONE_MINUS_CONSTANT_COLOR,[op]:s.CONSTANT_ALPHA,[ap]:s.ONE_MINUS_CONSTANT_ALPHA};function rt(B,ye,j,Z,J,O,ze,at,we,et){if(B===Js){p===!0&&(me(s.BLEND),p=!1);return}if(p===!1&&(_e(s.BLEND),p=!0),B!==Wd){if(B!==m||et!==I){if((y!==Qs||R!==Qs)&&(s.blendEquation(s.FUNC_ADD),y=Qs,R=Qs),et)switch(B){case Ss:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case js:s.blendFunc(s.ONE,s.ONE);break;case $h:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Jh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:ht("WebGLState: Invalid blending: ",B);break}else switch(B){case Ss:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case js:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case $h:ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jh:ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ht("WebGLState: Invalid blending: ",B);break}v=null,M=null,A=null,b=null,T.set(0,0,0),F=0,m=B,I=et}return}J=J||ye,O=O||j,ze=ze||Z,(ye!==y||J!==R)&&(s.blendEquationSeparate(Qe[ye],Qe[J]),y=ye,R=J),(j!==v||Z!==M||O!==A||ze!==b)&&(s.blendFuncSeparate(Ye[j],Ye[Z],Ye[O],Ye[ze]),v=j,M=Z,A=O,b=ze),(at.equals(T)===!1||we!==F)&&(s.blendColor(at.r,at.g,at.b,we),T.copy(at),F=we),m=B,I=!1}function gt(B,ye){B.side===An?me(s.CULL_FACE):_e(s.CULL_FACE);let j=B.side===Gn;ye&&(j=!j),Pt(j),B.blending===Ss&&B.transparent===!1?rt(Js):rt(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);let Z=B.stencilWrite;a.setTest(Z),Z&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),ot(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?_e(s.SAMPLE_ALPHA_TO_COVERAGE):me(s.SAMPLE_ALPHA_TO_COVERAGE)}function Pt(B){k!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),k=B)}function yt(B){B!==Hd?(_e(s.CULL_FACE),B!==G&&(B===Zh?s.cullFace(s.BACK):B===Gd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):me(s.CULL_FACE),G=B}function kt(B){B!==H&&(W&&s.lineWidth(B),H=B)}function ot(B,ye,j){B?(_e(s.POLYGON_OFFSET_FILL),(U!==ye||K!==j)&&(U=ye,K=j,o.getReversed()&&(ye=-ye,j=-j),s.polygonOffset(ye,j))):me(s.POLYGON_OFFSET_FILL)}function Ut(B){B?_e(s.SCISSOR_TEST):me(s.SCISSOR_TEST)}function hn(B){B===void 0&&(B=s.TEXTURE0+Q-1),de!==B&&(s.activeTexture(B),de=B)}function un(B,ye,j){j===void 0&&(de===null?j=s.TEXTURE0+Q-1:j=de);let Z=Me[j];Z===void 0&&(Z={type:void 0,texture:void 0},Me[j]=Z),(Z.type!==B||Z.texture!==ye)&&(de!==j&&(s.activeTexture(j),de=j),s.bindTexture(B,ye||Ue[B]),Z.type=B,Z.texture=ye)}function Y(){let B=Me[de];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function lt(){try{s.compressedTexImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function It(){try{s.compressedTexImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function At(){try{s.texSubImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function De(){try{s.texSubImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function Kt(){try{s.compressedTexSubImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function tt(){try{s.compressedTexSubImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function Be(){try{s.texStorage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function D(){try{s.texStorage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function w(){try{s.texImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function te(){try{s.texImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function Te(B){return f[B]!==void 0?f[B]:s.getParameter(B)}function oe(B,ye){f[B]!==ye&&(s.pixelStorei(B,ye),f[B]=ye)}function ne(B){X.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),X.copy(B))}function Ae(B){pe.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),pe.copy(B))}function ue(B,ye){let j=c.get(ye);j===void 0&&(j=new WeakMap,c.set(ye,j));let Z=j.get(B);Z===void 0&&(Z=s.getUniformBlockIndex(ye,B.name),s.uniformBlockBinding(ye,Z,Z),j.set(B,Z))}function le(B,ye,j){let J=c.get(ye).get(B);l[J]!==j&&(s.bindBufferBase(s.UNIFORM_BUFFER,J,j),l[J]=j)}function Ce(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),u={},f={},de=null,Me={},h={},l={},d=new WeakMap,g=[],_=null,p=!1,m=null,y=null,v=null,M=null,R=null,A=null,b=null,T=new it(0,0,0),F=0,I=!1,k=null,G=null,H=null,U=null,K=null,X.set(0,0,s.canvas.width,s.canvas.height),pe.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:_e,disable:me,bindFramebuffer:Ie,drawBuffers:xe,useProgram:Ne,setBlending:rt,setMaterial:gt,setFlipSided:Pt,setCullFace:yt,setLineWidth:kt,setPolygonOffset:ot,setScissorTest:Ut,activeTexture:hn,bindTexture:un,unbindTexture:Y,compressedTexImage2D:lt,compressedTexImage3D:It,texImage2D:w,texImage3D:te,pixelStorei:oe,getParameter:Te,updateUBOMapping:ue,uniformBlockBinding:le,texStorage2D:Be,texStorage3D:D,texSubImage2D:At,texSubImage3D:De,compressedTexSubImage2D:Kt,compressedTexSubImage3D:tt,scissor:ne,viewport:Ae,reset:Ce}}function TM(s,e,t,n,i,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ve,u=new WeakMap,f=new Set,h,d=new WeakMap,g=new Set,_=new FinalizationRegistry(D=>g.delete(D)),p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(D,w){return p?new OffscreenCanvas(D,w):Ur("canvas")}function y(D,w,te){let Te=1,oe=Be(D);if((oe.width>te||oe.height>te)&&(Te=te/Math.max(oe.width,oe.height)),Te<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let ne=Math.floor(Te*oe.width),Ae=Math.floor(Te*oe.height);h===void 0&&(h=m(ne,Ae));let ue=w?m(ne,Ae):h;return ue.width=ne,ue.height=Ae,ue.getContext("2d").drawImage(D,0,0,ne,Ae),st("WebGLRenderer: Texture has been resized from ("+oe.width+"x"+oe.height+") to ("+ne+"x"+Ae+")."),ue}else return"data"in D&&st("WebGLRenderer: Image in DataTexture is too big ("+oe.width+"x"+oe.height+")."),D;return D}function v(D){return D.generateMipmaps}function M(D){s.generateMipmap(D)}function R(D){return D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?s.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function A(D,w,te,Te,oe,ne=!1){if(D!==null){if(s[D]!==void 0)return s[D];st("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let Ae;Te&&(Ae=e.get("EXT_texture_norm16"),Ae||st("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ue=w;if(w===s.RED&&(te===s.FLOAT&&(ue=s.R32F),te===s.HALF_FLOAT&&(ue=s.R16F),te===s.UNSIGNED_BYTE&&(ue=s.R8),te===s.UNSIGNED_SHORT&&Ae&&(ue=Ae.R16_EXT),te===s.SHORT&&Ae&&(ue=Ae.R16_SNORM_EXT)),w===s.RED_INTEGER&&(te===s.UNSIGNED_BYTE&&(ue=s.R8UI),te===s.UNSIGNED_SHORT&&(ue=s.R16UI),te===s.UNSIGNED_INT&&(ue=s.R32UI),te===s.BYTE&&(ue=s.R8I),te===s.SHORT&&(ue=s.R16I),te===s.INT&&(ue=s.R32I)),w===s.RG&&(te===s.FLOAT&&(ue=s.RG32F),te===s.HALF_FLOAT&&(ue=s.RG16F),te===s.UNSIGNED_BYTE&&(ue=s.RG8),te===s.UNSIGNED_SHORT&&Ae&&(ue=Ae.RG16_EXT),te===s.SHORT&&Ae&&(ue=Ae.RG16_SNORM_EXT)),w===s.RG_INTEGER&&(te===s.UNSIGNED_BYTE&&(ue=s.RG8UI),te===s.UNSIGNED_SHORT&&(ue=s.RG16UI),te===s.UNSIGNED_INT&&(ue=s.RG32UI),te===s.BYTE&&(ue=s.RG8I),te===s.SHORT&&(ue=s.RG16I),te===s.INT&&(ue=s.RG32I)),w===s.RGB_INTEGER&&(te===s.UNSIGNED_BYTE&&(ue=s.RGB8UI),te===s.UNSIGNED_SHORT&&(ue=s.RGB16UI),te===s.UNSIGNED_INT&&(ue=s.RGB32UI),te===s.BYTE&&(ue=s.RGB8I),te===s.SHORT&&(ue=s.RGB16I),te===s.INT&&(ue=s.RGB32I)),w===s.RGBA_INTEGER&&(te===s.UNSIGNED_BYTE&&(ue=s.RGBA8UI),te===s.UNSIGNED_SHORT&&(ue=s.RGBA16UI),te===s.UNSIGNED_INT&&(ue=s.RGBA32UI),te===s.BYTE&&(ue=s.RGBA8I),te===s.SHORT&&(ue=s.RGBA16I),te===s.INT&&(ue=s.RGBA32I)),w===s.RGB&&(te===s.UNSIGNED_SHORT&&Ae&&(ue=Ae.RGB16_EXT),te===s.SHORT&&Ae&&(ue=Ae.RGB16_SNORM_EXT),te===s.UNSIGNED_INT_5_9_9_9_REV&&(ue=s.RGB9_E5),te===s.UNSIGNED_INT_10F_11F_11F_REV&&(ue=s.R11F_G11F_B10F)),w===s.RGBA){let le=ne?Io:bt.getTransfer(oe);te===s.FLOAT&&(ue=s.RGBA32F),te===s.HALF_FLOAT&&(ue=s.RGBA16F),te===s.UNSIGNED_BYTE&&(ue=le===Gt?s.SRGB8_ALPHA8:s.RGBA8),te===s.UNSIGNED_SHORT&&Ae&&(ue=Ae.RGBA16_EXT),te===s.SHORT&&Ae&&(ue=Ae.RGBA16_SNORM_EXT),te===s.UNSIGNED_SHORT_4_4_4_4&&(ue=s.RGBA4),te===s.UNSIGNED_SHORT_5_5_5_1&&(ue=s.RGB5_A1)}return(ue===s.R16F||ue===s.R32F||ue===s.RG16F||ue===s.RG32F||ue===s.RGBA16F||ue===s.RGBA32F)&&e.get("EXT_color_buffer_float"),ue}function b(D,w){let te;return D?w===null||w===vi||w===nr?te=s.DEPTH24_STENCIL8:w===si?te=s.DEPTH32F_STENCIL8:w===so&&(te=s.DEPTH24_STENCIL8,st("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===vi||w===nr?te=s.DEPTH_COMPONENT24:w===si?te=s.DEPTH_COMPONENT32F:w===so&&(te=s.DEPTH_COMPONENT16),te}function T(D,w){return v(D)===!0||D.isFramebufferTexture&&D.minFilter!==dn&&D.minFilter!==bn?Math.log2(Math.max(w.width,w.height))+1:D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?w.mipmaps.length:1}function F(D){let w=new WeakRef(D);n.get(D).__ref=w,g.add(w),_.register(D,w,w)}function I(D){let w=n.get(D).__ref;w!==void 0&&(g.delete(w),_.unregister(w))}function k(D){H(D.target)}function G(D){U(D.target)}function H(D){D.removeEventListener("dispose",k),I(D),Q(D),D.isVideoTexture&&u.delete(D),D.isHTMLTexture&&f.delete(D)}function U(D){D.removeEventListener("dispose",G),I(D),ge(D)}function K(){for(let D of g){let w=D.deref();w!==void 0&&(w.isRenderTarget===!0?U(w):H(w))}g.clear(),f.clear()}function Q(D){let w=n.get(D);if(w.__webglInit===void 0)return;let te=D.source,Te=d.get(te);if(Te){let oe=Te[w.__cacheKey];oe.usedTimes--,oe.usedTimes===0&&W(D),Object.keys(Te).length===0&&d.delete(te)}n.remove(D)}function W(D){let w=n.get(D);s.deleteTexture(w.__webglTexture);let te=D.source,Te=d.get(te);delete Te[w.__cacheKey],o.memory.textures--}function ge(D){let w=n.get(D);w.__depthDisposeCallback&&w.__depthDisposeCallback();let te=D.depthTexture;if(te&&te.renderTarget===D&&H(te),D.isWebGLCubeRenderTarget)for(let oe=0;oe<6;oe++){if(Array.isArray(w.__webglFramebuffer[oe]))for(let ne=0;ne<w.__webglFramebuffer[oe].length;ne++)s.deleteFramebuffer(w.__webglFramebuffer[oe][ne]);else s.deleteFramebuffer(w.__webglFramebuffer[oe]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[oe])}else{if(Array.isArray(w.__webglFramebuffer))for(let oe=0;oe<w.__webglFramebuffer.length;oe++)s.deleteFramebuffer(w.__webglFramebuffer[oe]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let oe=0;oe<w.__webglColorRenderbuffer.length;oe++)w.__webglColorRenderbuffer[oe]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[oe]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let Te=D.textures;for(let oe=0,ne=Te.length;oe<ne;oe++){let Ae=n.get(Te[oe]);Ae.__webglTexture&&(s.deleteTexture(Ae.__webglTexture),o.memory.textures--),n.remove(Te[oe])}n.remove(D)}let ee=0;function de(){ee=0}function Me(){return ee}function Re(D){ee=D}function nt(){let D=ee;return D>=i.maxTextures&&st("WebGLTextures: Trying to use "+(D+1)+" texture units while this GPU supports only "+i.maxTextures),ee+=1,D}function X(D){let w=[];return w.push(D.wrapS),w.push(D.wrapT),w.push(D.wrapR||0),w.push(D.magFilter),w.push(D.minFilter),w.push(D.anisotropy),w.push(D.internalFormat),w.push(D.format),w.push(D.type),w.push(D.generateMipmaps),w.push(D.mipmapsAutoUpdate),w.push(D.premultiplyAlpha),w.push(D.flipY),w.push(D.unpackAlignment),w.push(D.colorSpace),w.join()}function pe(D,w){let te=n.get(D);if(D.isVideoTexture&&Kt(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&te.__version!==D.version){let Te=D.image;if(Te===null)st("WebGLRenderer: Texture marked for update but no image data found.");else if(Te.complete===!1)st("WebGLRenderer: Texture marked for update but image is incomplete");else{gt(te,D,w);return}}else D.isExternalTexture&&(te.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,te.__webglTexture,s.TEXTURE0+w)}function Se(D,w){let te=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&te.__version!==D.version){gt(te,D,w);return}else D.isExternalTexture&&(te.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,te.__webglTexture,s.TEXTURE0+w)}function Ue(D,w){let te=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&te.__version!==D.version){gt(te,D,w);return}t.bindTexture(s.TEXTURE_3D,te.__webglTexture,s.TEXTURE0+w)}function _e(D,w){let te=n.get(D);if(D.version>0&&te.__version!==D.version){Pt(te,D,w);return}t.bindTexture(s.TEXTURE_CUBE_MAP,te.__webglTexture,s.TEXTURE0+w)}let me={[ti]:s.REPEAT,[ai]:s.CLAMP_TO_EDGE,[Dr]:s.MIRRORED_REPEAT},Ie={[dn]:s.NEAREST,[Yl]:s.NEAREST_MIPMAP_NEAREST,[tr]:s.NEAREST_MIPMAP_LINEAR,[bn]:s.LINEAR,[io]:s.LINEAR_MIPMAP_NEAREST,[hi]:s.LINEAR_MIPMAP_LINEAR},xe={[_p]:s.NEVER,[_u]:s.ALWAYS,[yp]:s.LESS,[mu]:s.LEQUAL,[xp]:s.EQUAL,[gu]:s.GEQUAL,[vp]:s.GREATER,[Mp]:s.NOTEQUAL};function Ne(D,w){if(w.type===si&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===bn||w.magFilter===io||w.magFilter===tr||w.magFilter===hi||w.minFilter===bn||w.minFilter===io||w.minFilter===tr||w.minFilter===hi)&&st("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,me[w.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,me[w.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,me[w.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,Ie[w.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,Ie[w.minFilter]),w.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,xe[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===dn||w.minFilter!==tr&&w.minFilter!==hi||w.type===si&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){let te=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,te.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function Qe(D,w){let te=!1;D.__webglInit===void 0&&(D.__webglInit=!0,w.addEventListener("dispose",k),F(w));let Te=w.source,oe=d.get(Te);oe===void 0&&(oe={},d.set(Te,oe));let ne=X(w);if(ne!==D.__cacheKey){oe[ne]===void 0&&(oe[ne]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,te=!0),oe[ne].usedTimes++;let Ae=oe[D.__cacheKey];Ae!==void 0&&(oe[D.__cacheKey].usedTimes--,Ae.usedTimes===0&&W(w)),D.__cacheKey=ne,D.__webglTexture=oe[ne].texture}return te}function Ye(D,w,te){return Math.floor(Math.floor(D/te)/w)}function rt(D,w,te,Te){let ne=D.updateRanges;if(ne.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,w.width,w.height,te,Te,w.data);else{ne.sort((B,ye)=>B.start-ye.start);let Ae=0;for(let B=1;B<ne.length;B++){let ye=ne[Ae],j=ne[B],Z=ye.start+ye.count,J=Ye(j.start,w.width,4),O=Ye(ye.start,w.width,4);j.start<=Z+1&&J===O&&Ye(j.start+j.count-1,w.width,4)===J?ye.count=Math.max(ye.count,j.start+j.count-ye.start):(++Ae,ne[Ae]=j)}ne.length=Ae+1;let ue=t.getParameter(s.UNPACK_ROW_LENGTH),le=t.getParameter(s.UNPACK_SKIP_PIXELS),Ce=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,w.width);for(let B=0,ye=ne.length;B<ye;B++){let j=ne[B],Z=Math.floor(j.start/4),J=Math.ceil(j.count/4),O=Z%w.width,ze=Math.floor(Z/w.width),at=J,we=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,O),t.pixelStorei(s.UNPACK_SKIP_ROWS,ze),t.texSubImage2D(s.TEXTURE_2D,0,O,ze,at,we,te,Te,w.data)}D.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,ue),t.pixelStorei(s.UNPACK_SKIP_PIXELS,le),t.pixelStorei(s.UNPACK_SKIP_ROWS,Ce)}}function gt(D,w,te){let Te=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(Te=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(Te=s.TEXTURE_3D);let oe=Qe(D,w),ne=w.source;t.bindTexture(Te,D.__webglTexture,s.TEXTURE0+te);let Ae=n.get(ne);if(ne.version!==Ae.__version||oe===!0){if(t.activeTexture(s.TEXTURE0+te),(typeof ImageBitmap<"u"&&w.image instanceof ImageBitmap)===!1){let we=bt.getPrimaries(bt.workingColorSpace),et=w.colorSpace===ss?null:bt.getPrimaries(w.colorSpace),pt=w.colorSpace===ss||we===et?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt)}t.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment);let le=y(w.image,!1,i.maxTextureSize);le=tt(w,le);let Ce=r.convert(w.format,w.colorSpace),B=r.convert(w.type),ye=A(w.internalFormat,Ce,B,w.normalized,w.colorSpace,w.isVideoTexture);Ne(Te,w);let j,Z=w.mipmaps,J=w.isVideoTexture!==!0,O=Ae.__version===void 0||oe===!0,ze=ne.dataReady,at=T(w,le);if(w.isDepthTexture)ye=b(w.format===is,w.type),O&&(J?t.texStorage2D(s.TEXTURE_2D,1,ye,le.width,le.height):t.texImage2D(s.TEXTURE_2D,0,ye,le.width,le.height,0,Ce,B,null));else if(w.isDataTexture)if(Z.length>0){J&&O&&t.texStorage2D(s.TEXTURE_2D,at,ye,Z[0].width,Z[0].height);for(let we=0,et=Z.length;we<et;we++)j=Z[we],J?ze&&t.texSubImage2D(s.TEXTURE_2D,we,0,0,j.width,j.height,Ce,B,j.data):t.texImage2D(s.TEXTURE_2D,we,ye,j.width,j.height,0,Ce,B,j.data);w.generateMipmaps=!1}else J?(O&&t.texStorage2D(s.TEXTURE_2D,at,ye,le.width,le.height),ze&&rt(w,le,Ce,B)):t.texImage2D(s.TEXTURE_2D,0,ye,le.width,le.height,0,Ce,B,le.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){J&&O&&t.texStorage3D(s.TEXTURE_2D_ARRAY,at,ye,Z[0].width,Z[0].height,le.depth);for(let we=0,et=Z.length;we<et;we++)if(j=Z[we],w.format!==ui)if(Ce!==null)if(J){if(ze)if(w.layerUpdates.size>0){let pt=Ru(j.width,j.height,w.format,w.type);for(let ke of w.layerUpdates){let Dt=j.data.subarray(ke*pt/j.data.BYTES_PER_ELEMENT,(ke+1)*pt/j.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,we,0,0,ke,j.width,j.height,1,Ce,Dt)}}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,we,0,0,0,j.width,j.height,le.depth,Ce,j.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,we,ye,j.width,j.height,le.depth,0,j.data,0,0);else st("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else J?ze&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,we,0,0,0,j.width,j.height,le.depth,Ce,B,j.data):t.texImage3D(s.TEXTURE_2D_ARRAY,we,ye,j.width,j.height,le.depth,0,Ce,B,j.data);w.layerUpdates.size>0&&w.clearLayerUpdates()}else{J&&O&&t.texStorage2D(s.TEXTURE_2D,at,ye,Z[0].width,Z[0].height);for(let we=0,et=Z.length;we<et;we++)j=Z[we],w.format!==ui?Ce!==null?J?ze&&t.compressedTexSubImage2D(s.TEXTURE_2D,we,0,0,j.width,j.height,Ce,j.data):t.compressedTexImage2D(s.TEXTURE_2D,we,ye,j.width,j.height,0,j.data):st("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):J?ze&&t.texSubImage2D(s.TEXTURE_2D,we,0,0,j.width,j.height,Ce,B,j.data):t.texImage2D(s.TEXTURE_2D,we,ye,j.width,j.height,0,Ce,B,j.data)}else if(w.isDataArrayTexture)if(J){if(O&&t.texStorage3D(s.TEXTURE_2D_ARRAY,at,ye,le.width,le.height,le.depth),ze)if(w.layerUpdates.size>0){let we=Ru(le.width,le.height,w.format,w.type);for(let et of w.layerUpdates){let pt=le.data.subarray(et*we/le.data.BYTES_PER_ELEMENT,(et+1)*we/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,et,le.width,le.height,1,Ce,B,pt)}w.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,Ce,B,le.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,ye,le.width,le.height,le.depth,0,Ce,B,le.data);else if(w.isData3DTexture)J?(O&&t.texStorage3D(s.TEXTURE_3D,at,ye,le.width,le.height,le.depth),ze&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,Ce,B,le.data)):t.texImage3D(s.TEXTURE_3D,0,ye,le.width,le.height,le.depth,0,Ce,B,le.data);else if(w.isFramebufferTexture){if(O)if(J)t.texStorage2D(s.TEXTURE_2D,at,ye,le.width,le.height);else{let we=le.width,et=le.height;for(let pt=0;pt<at;pt++)t.texImage2D(s.TEXTURE_2D,pt,ye,we,et,0,Ce,B,null),we>>=1,et>>=1}}else if(w.isHTMLTexture){if("texElementImage2D"in s){let we=s.canvas;if(we.hasAttribute("layoutsubtree")||we.setAttribute("layoutsubtree","true"),le.parentNode!==we){we.appendChild(le),f.add(w),we.onpaint=et=>{let pt=et.changedElements;for(let ke of f)pt.includes(ke.image)&&(ke.needsUpdate=!0)},we.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,le);else{let pt=s.RGBA,ke=s.RGBA,Dt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,pt,ke,Dt,le)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Z.length>0){if(J&&O){let we=Be(Z[0]);t.texStorage2D(s.TEXTURE_2D,at,ye,we.width,we.height)}for(let we=0,et=Z.length;we<et;we++)j=Z[we],J?ze&&t.texSubImage2D(s.TEXTURE_2D,we,0,0,Ce,B,j):t.texImage2D(s.TEXTURE_2D,we,ye,Ce,B,j);w.generateMipmaps=!1}else if(J){if(O){let we=Be(le);t.texStorage2D(s.TEXTURE_2D,at,ye,we.width,we.height)}ze&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Ce,B,le)}else t.texImage2D(s.TEXTURE_2D,0,ye,Ce,B,le);v(w)&&w.mipmapsAutoUpdate===!0&&M(Te),Ae.__version=ne.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function Pt(D,w,te){if(w.image.length!==6)return;let Te=Qe(D,w),oe=w.source;t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+te);let ne=n.get(oe);if(oe.version!==ne.__version||Te===!0){t.activeTexture(s.TEXTURE0+te);let Ae=bt.getPrimaries(bt.workingColorSpace),ue=w.colorSpace===ss?null:bt.getPrimaries(w.colorSpace),le=w.colorSpace===ss||Ae===ue?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,le);let Ce=w.isCompressedTexture||w.image[0].isCompressedTexture,B=w.image[0]&&w.image[0].isDataTexture,ye=[];for(let ke=0;ke<6;ke++)!Ce&&!B?ye[ke]=y(w.image[ke],!0,i.maxCubemapSize):ye[ke]=B?w.image[ke].image:w.image[ke],ye[ke]=tt(w,ye[ke]);let j=ye[0],Z=r.convert(w.format,w.colorSpace),J=r.convert(w.type),O=A(w.internalFormat,Z,J,w.normalized,w.colorSpace),ze=w.isVideoTexture!==!0,at=ne.__version===void 0||Te===!0,we=oe.dataReady,et=T(w,j);Ne(s.TEXTURE_CUBE_MAP,w);let pt;if(w.isDepthTexture){if(O=b(w.format===is,w.type),at)if(ze)t.texStorage2D(s.TEXTURE_CUBE_MAP,1,O,j.width,j.height);else for(let ke=0;ke<6;ke++)t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,0,O,j.width,j.height,0,Z,J,null)}else if(Ce){ze&&at&&t.texStorage2D(s.TEXTURE_CUBE_MAP,et,O,j.width,j.height);for(let ke=0;ke<6;ke++){pt=ye[ke].mipmaps;for(let Dt=0;Dt<pt.length;Dt++){let Jt=pt[Dt];w.format!==ui?Z!==null?ze?we&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt,0,0,Jt.width,Jt.height,Z,Jt.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt,O,Jt.width,Jt.height,0,Jt.data):st("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ze?we&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt,0,0,Jt.width,Jt.height,Z,J,Jt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt,O,Jt.width,Jt.height,0,Z,J,Jt.data)}}}else{if(pt=w.mipmaps,ze&&at){pt.length>0&&et++;let ke=Be(ye[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,et,O,ke.width,ke.height)}for(let ke=0;ke<6;ke++)if(B){ze?we&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,0,0,0,ye[ke].width,ye[ke].height,Z,J,ye[ke].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,0,O,ye[ke].width,ye[ke].height,0,Z,J,ye[ke].data);for(let Dt=0;Dt<pt.length;Dt++){let pi=pt[Dt].image[ke].image;ze?we&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt+1,0,0,pi.width,pi.height,Z,J,pi.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt+1,O,pi.width,pi.height,0,Z,J,pi.data)}}else{ze?we&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,0,0,0,Z,J,ye[ke]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,0,O,Z,J,ye[ke]);for(let Dt=0;Dt<pt.length;Dt++){let Jt=pt[Dt];ze?we&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt+1,0,0,Z,J,Jt.image[ke]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ke,Dt+1,O,Z,J,Jt.image[ke])}}}v(w)&&w.mipmapsAutoUpdate===!0&&M(s.TEXTURE_CUBE_MAP),ne.__version=oe.version,w.onUpdate&&w.onUpdate(w)}D.__version=w.version}function yt(D,w,te,Te,oe,ne){let Ae=r.convert(te.format,te.colorSpace),ue=r.convert(te.type),le=A(te.internalFormat,Ae,ue,te.normalized,te.colorSpace),Ce=n.get(w),B=n.get(te);if(B.__renderTarget=w,!Ce.__hasExternalTextures){let ye=Math.max(1,w.width>>ne),j=Math.max(1,w.height>>ne);oe===s.TEXTURE_3D||oe===s.TEXTURE_2D_ARRAY?t.texImage3D(oe,ne,le,ye,j,w.depth,0,Ae,ue,null):t.texImage2D(oe,ne,le,ye,j,0,Ae,ue,null)}t.bindFramebuffer(s.FRAMEBUFFER,D),De(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Te,oe,B.__webglTexture,0,At(w)):(oe===s.TEXTURE_2D||oe>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&oe<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Te,oe,B.__webglTexture,ne),t.bindFramebuffer(s.FRAMEBUFFER,null)}function kt(D,w,te){if(s.bindRenderbuffer(s.RENDERBUFFER,D),w.depthBuffer){let Te=w.depthTexture,oe=Te&&Te.isDepthTexture?Te.type:null,ne=b(w.stencilBuffer,oe),Ae=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;De(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,At(w),ne,w.width,w.height):te?s.renderbufferStorageMultisample(s.RENDERBUFFER,At(w),ne,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,ne,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ae,s.RENDERBUFFER,D)}else{let Te=w.textures;for(let oe=0;oe<Te.length;oe++){let ne=Te[oe],Ae=r.convert(ne.format,ne.colorSpace),ue=r.convert(ne.type),le=A(ne.internalFormat,Ae,ue,ne.normalized,ne.colorSpace);De(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,At(w),le,w.width,w.height):te?s.renderbufferStorageMultisample(s.RENDERBUFFER,At(w),le,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,le,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ot(D,w,te){let Te=w.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,D),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let oe=n.get(w.depthTexture);oe.__renderTarget=w;let ne=Te?w.depthTexture.image[0]:w.depthTexture.image;(!oe.__webglTexture||ne.width!==w.width||ne.height!==w.height)&&(ne.width=w.width,ne.height=w.height,w.depthTexture.needsUpdate=!0),Te?_e(w.depthTexture,0):pe(w.depthTexture,0);let Ae=oe.__webglTexture,ue=At(w),le=Te?s.TEXTURE_CUBE_MAP_POSITIVE_X+te:s.TEXTURE_2D,Ce=w.depthTexture.format===is?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(w.depthTexture.format===qi)De(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,le,Ae,0,ue):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,le,Ae,0);else if(w.depthTexture.format===is)De(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,le,Ae,0,ue):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,le,Ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ut(D){let w=n.get(D),te=D.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==D.depthTexture){let Te=D.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),Te){let oe=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,Te.removeEventListener("dispose",oe)};Te.addEventListener("dispose",oe),w.__depthDisposeCallback=oe}w.__boundDepthTexture=Te}if(D.depthTexture&&!w.__autoAllocateDepthBuffer)if(te)for(let Te=0;Te<6;Te++)ot(w.__webglFramebuffer[Te],D,Te);else D.texture.mipmaps.length>0?ot(w.__webglFramebuffer[0],D,0):ot(w.__webglFramebuffer,D,0);else if(te){w.__webglDepthbuffer=[];for(let Te=0;Te<6;Te++)if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[Te]),w.__webglDepthbuffer[Te]===void 0)w.__webglDepthbuffer[Te]=s.createRenderbuffer(),kt(w.__webglDepthbuffer[Te],D,!1);else{let oe=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ne=w.__webglDepthbuffer[Te];s.bindRenderbuffer(s.RENDERBUFFER,ne),s.framebufferRenderbuffer(s.FRAMEBUFFER,oe,s.RENDERBUFFER,ne)}}else if(D.texture.mipmaps.length>0?t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),kt(w.__webglDepthbuffer,D,!1);else{let oe=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ne=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ne),s.framebufferRenderbuffer(s.FRAMEBUFFER,oe,s.RENDERBUFFER,ne)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function hn(D,w,te){let Te=n.get(D);w!==void 0&&yt(Te.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),te!==void 0&&Ut(D)}function un(D){let w=D.texture,te=n.get(D),Te=n.get(w);D.addEventListener("dispose",G),F(D);let oe=D.textures,ne=D.isWebGLCubeRenderTarget===!0,Ae=oe.length>1;if(Ae||(Te.__webglTexture===void 0&&(Te.__webglTexture=s.createTexture()),Te.__version=w.version,o.memory.textures++),ne){te.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(w.mipmaps.length>0){te.__webglFramebuffer[ue]=[];for(let le=0;le<w.mipmaps.length;le++)te.__webglFramebuffer[ue][le]=s.createFramebuffer()}else te.__webglFramebuffer[ue]=s.createFramebuffer()}else{if(w.mipmaps.length>0){te.__webglFramebuffer=[];for(let ue=0;ue<w.mipmaps.length;ue++)te.__webglFramebuffer[ue]=s.createFramebuffer()}else te.__webglFramebuffer=s.createFramebuffer();if(Ae)for(let ue=0,le=oe.length;ue<le;ue++){let Ce=n.get(oe[ue]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=s.createTexture(),o.memory.textures++)}if(D.samples>0&&De(D)===!1){te.__webglMultisampledFramebuffer=s.createFramebuffer(),te.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,te.__webglMultisampledFramebuffer);for(let ue=0;ue<oe.length;ue++){let le=oe[ue];te.__webglColorRenderbuffer[ue]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,te.__webglColorRenderbuffer[ue]);let Ce=r.convert(le.format,le.colorSpace),B=r.convert(le.type),ye=A(le.internalFormat,Ce,B,le.normalized,le.colorSpace,D.isXRRenderTarget===!0),j=At(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,j,ye,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ue,s.RENDERBUFFER,te.__webglColorRenderbuffer[ue])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&(te.__webglDepthRenderbuffer=s.createRenderbuffer(),kt(te.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ne){t.bindTexture(s.TEXTURE_CUBE_MAP,Te.__webglTexture),Ne(s.TEXTURE_CUBE_MAP,w);for(let ue=0;ue<6;ue++)if(w.mipmaps.length>0)for(let le=0;le<w.mipmaps.length;le++)yt(te.__webglFramebuffer[ue][le],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ue,le);else yt(te.__webglFramebuffer[ue],D,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);v(w)?M(s.TEXTURE_CUBE_MAP):w.mipmaps.length>0&&s.texParameteri(s.TEXTURE_CUBE_MAP,s.TEXTURE_MAX_LEVEL,w.mipmaps.length-1),t.unbindTexture()}else if(Ae){for(let ue=0,le=oe.length;ue<le;ue++){let Ce=oe[ue],B=n.get(Ce),ye=s.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ye=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ye,B.__webglTexture),Ne(ye,Ce),yt(te.__webglFramebuffer,D,Ce,s.COLOR_ATTACHMENT0+ue,ye,0),v(Ce)&&M(ye)}t.unbindTexture()}else{let ue=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ue=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ue,Te.__webglTexture),Ne(ue,w),w.mipmaps.length>0)for(let le=0;le<w.mipmaps.length;le++)yt(te.__webglFramebuffer[le],D,w,s.COLOR_ATTACHMENT0,ue,le);else yt(te.__webglFramebuffer,D,w,s.COLOR_ATTACHMENT0,ue,0);v(w)?M(ue):w.mipmaps.length>0&&s.texParameteri(ue,s.TEXTURE_MAX_LEVEL,w.mipmaps.length-1),t.unbindTexture()}D.depthBuffer&&Ut(D)}function Y(D){let w=D.textures;for(let te=0,Te=w.length;te<Te;te++){let oe=w[te];if(v(oe)&&oe.mipmapsAutoUpdate===!0){let ne=R(D),Ae=n.get(oe).__webglTexture;t.bindTexture(ne,Ae),M(ne),t.unbindTexture()}}}let lt=[];function It(D){if(D.samples>0){if(De(D)===!1){let w=D.textures,te=D.width,Te=D.height,oe=s.COLOR_BUFFER_BIT,ne=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ae=n.get(D),ue=w.length>1;if(ue)for(let Ce=0;Ce<w.length;Ce++)t.bindFramebuffer(s.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ae.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),D.texture.mipmaps.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer);for(let Ce=0;Ce<w.length;Ce++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(oe|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(oe|=s.STENCIL_BUFFER_BIT)),ue){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ae.__webglColorRenderbuffer[Ce]);let B=n.get(w[Ce]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,B,0)}s.blitFramebuffer(0,0,te,Te,0,0,te,Te,oe,s.NEAREST),l===!0&&(lt.length=0,lt.push(s.COLOR_ATTACHMENT0+Ce),D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&lt.push(ne),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,lt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ue)for(let Ce=0;Ce<w.length;Ce++){t.bindFramebuffer(s.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,Ae.__webglColorRenderbuffer[Ce]);let B=n.get(w[Ce]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ae.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,B,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&l){let w=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function At(D){return Math.min(i.maxSamples,D.samples)}function De(D){let w=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Kt(D){let w=o.render.frame;u.get(D)!==w&&(u.set(D,w),D.update())}function tt(D,w){let te=D.colorSpace,Te=D.format,oe=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||te!==Fn&&te!==ss&&(bt.getTransfer(te)===Gt?(Te!==ui||oe!==Kn)&&st("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ht("WebGLTextures: Unsupported texture color space:",te)),w}function Be(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=nt,this.resetTextureUnits=de,this.getTextureUnits=Me,this.setTextureUnits=Re,this.setTexture2D=pe,this.setTexture2DArray=Se,this.setTexture3D=Ue,this.setTextureCube=_e,this.rebindTextures=hn,this.setupRenderTarget=un,this.updateRenderTargetMipmap=Y,this.updateMultisampleRenderTarget=It,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=De,this.dispose=K}function wM(s,e){function t(n,i=ss){let r,o=bt.getTransfer(i);if(n===Kn)return s.UNSIGNED_BYTE;if(n===Zl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===$l)return s.UNSIGNED_SHORT_5_5_5_1;if(n===hu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===uu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===lu)return s.BYTE;if(n===cu)return s.SHORT;if(n===so)return s.UNSIGNED_SHORT;if(n===Kl)return s.INT;if(n===vi)return s.UNSIGNED_INT;if(n===si)return s.FLOAT;if(n===Mi)return s.HALF_FLOAT;if(n===fu)return s.ALPHA;if(n===du)return s.RGB;if(n===ui)return s.RGBA;if(n===qi)return s.DEPTH_COMPONENT;if(n===is)return s.DEPTH_STENCIL;if(n===Jl)return s.RED;if(n===jl)return s.RED_INTEGER;if(n===Es)return s.RG;if(n===Ql)return s.RG_INTEGER;if(n===ec)return s.RGBA_INTEGER;if(n===ua||n===fa||n===da||n===pa)if(o===Gt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ua)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ua)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===da)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===pa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===tc||n===nc||n===ic||n===sc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===tc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===nc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ic)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===rc||n===oc||n===ac||n===lc||n===cc||n===ma||n===hc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===rc||n===oc)return o===Gt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ac)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===lc)return r.COMPRESSED_R11_EAC;if(n===cc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ma)return r.COMPRESSED_RG11_EAC;if(n===hc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===uc||n===fc||n===dc||n===pc||n===mc||n===gc||n===_c||n===yc||n===xc||n===vc||n===Mc||n===bc||n===Sc||n===Ec)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===uc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===fc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===dc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===pc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===mc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===gc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===_c)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===yc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===xc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===vc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Mc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===bc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Sc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ec)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Tc||n===wc||n===Ac)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Tc)return o===Gt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===wc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ac)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Rc||n===Cc||n===ga||n===Pc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Rc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Cc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ga)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Pc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===nr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var AM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,RM=`
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

}`,Fu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Xo(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ri({vertexShader:AM,fragmentShader:RM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new tn(new qs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bu=class extends ci{constructor(e,t){super();let n=this,i=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,f=null,h=null,d=null,g=null,_=typeof XRWebGLBinding<"u",p=new Fu,m={},y=t.getContextAttributes(),v=null,M=null,R=[],A=[],b=new ve,T=null,F=null,I=new gn;I.viewport=new Xt;let k=new gn;k.viewport=new Xt;let G=[I,k],H=new Gl,U=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let pe=R[X];return pe===void 0&&(pe=new kr,R[X]=pe),pe.getTargetRaySpace()},this.getControllerGrip=function(X){let pe=R[X];return pe===void 0&&(pe=new kr,R[X]=pe),pe.getGripSpace()},this.getHand=function(X){let pe=R[X];return pe===void 0&&(pe=new kr,R[X]=pe),pe.getHandSpace()};function Q(X){let pe=A.indexOf(X.inputSource);if(pe===-1)return;let Se=R[pe];Se!==void 0&&(Se.update(X.inputSource,X.frame,c||o),Se.dispatchEvent({type:X.type,data:X.inputSource}))}function W(){i.removeEventListener("select",Q),i.removeEventListener("selectstart",Q),i.removeEventListener("selectend",Q),i.removeEventListener("squeeze",Q),i.removeEventListener("squeezestart",Q),i.removeEventListener("squeezeend",Q),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",ge);for(let X=0;X<R.length;X++){let pe=A[X];pe!==null&&(A[X]=null,R[X].disconnect(pe))}U=null,K=null,p.reset();for(let X in m)delete m[X];if(e.setRenderTarget(v),d=null,h=null,f=null,i=null,M=null,nt.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(b.width,b.height,!1),F!==null){let X=F.camera;X.fov=F.fov,X.zoom=F.zoom,X.updateProjectionMatrix(),F=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&st("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&st("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(i,t)),f},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(v=e.getRenderTarget(),i.addEventListener("select",Q),i.addEventListener("selectstart",Q),i.addEventListener("selectend",Q),i.addEventListener("squeeze",Q),i.addEventListener("squeezestart",Q),i.addEventListener("squeezeend",Q),i.addEventListener("end",W),i.addEventListener("inputsourceschange",ge),y.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(b),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Ue=null,_e=null;y.depth&&(_e=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=y.stencil?is:qi,Ue=y.stencil?nr:vi);let me={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(me),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new ni(h.textureWidth,h.textureHeight,{format:ui,type:Kn,depthTexture:new Ji(h.textureWidth,h.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Se={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,Se),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),M=new ni(d.framebufferWidth,d.framebufferHeight,{format:ui,type:Kn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),nt.setContext(i),nt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ge(X){for(let pe=0;pe<X.removed.length;pe++){let Se=X.removed[pe],Ue=A.indexOf(Se);Ue>=0&&(A[Ue]=null,R[Ue].disconnect(Se))}for(let pe=0;pe<X.added.length;pe++){let Se=X.added[pe],Ue=A.indexOf(Se);if(Ue===-1){for(let me=0;me<R.length;me++)if(me>=A.length){A.push(Se),Ue=me;break}else if(A[me]===null){A[me]=Se,Ue=me;break}if(Ue===-1)break}let _e=R[Ue];_e&&_e.connect(Se)}}function ee(X,pe){pe===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(pe.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let pe=X.near,Se=X.far;p.texture!==null&&(p.depthNear>0&&(pe=p.depthNear),p.depthFar>0&&(Se=p.depthFar)),H.near=k.near=I.near=pe,H.far=k.far=I.far=Se,(U!==H.near||K!==H.far)&&(i.updateRenderState({depthNear:H.near,depthFar:H.far}),U=H.near,K=H.far),H.layers.mask=X.layers.mask|6,I.layers.mask=H.layers.mask&-5,k.layers.mask=H.layers.mask&-3;let Ue=X.parent,_e=H.cameras;ee(H,Ue);for(let me=0;me<_e.length;me++)ee(_e[me],Ue);H.projectionMatrix.copy(I.projectionMatrix),H.projectionMatrixInverse.copy(I.projectionMatrixInverse),F===null&&X.isPerspectiveCamera&&(F={camera:X,fov:X.fov,zoom:X.zoom}),de(X,H,Ue)};function de(X,pe,Se){Se===null?X.matrix.copy(pe.matrixWorld):(X.matrix.copy(Se.matrixWorld),X.matrix.invert(),X.matrix.multiply(pe.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(pe.projectionMatrix),X.projectionMatrixInverse.copy(pe.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Fs*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(X){l=X,h!==null&&(h.fixedFoveation=X),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=X)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(H)},this.getCameraTexture=function(X){return m[X]};let Me=null;function Re(X,pe){if(u=pe.getViewerPose(c||o),g=pe,u!==null){let Se=u.views;d!==null&&(e.setRenderTargetFramebuffer(M,d.framebuffer),e.setRenderTarget(M));let Ue=!1;Se.length!==H.cameras.length&&(H.cameras.length=0,Ue=!0);for(let xe=0;xe<Se.length;xe++){let Ne=Se[xe],Qe=null;if(d!==null)Qe=d.getViewport(Ne);else{let rt=f.getViewSubImage(h,Ne);Qe=rt.viewport,xe===0&&(e.setRenderTargetTextures(M,rt.colorTexture,rt.depthStencilTexture),e.setRenderTarget(M))}let Ye=G[xe];Ye===void 0&&(Ye=new gn,Ye.layers.enable(xe),Ye.viewport=new Xt,G[xe]=Ye),Ye.matrix.fromArray(Ne.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Ne.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(Qe.x,Qe.y,Qe.width,Qe.height),xe===0&&(H.matrix.copy(Ye.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Ue===!0&&H.cameras.push(Ye)}let _e=i.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){f=n.getBinding();let xe=f.getDepthInformation(Se[0]);xe&&xe.isValid&&xe.texture&&p.init(xe,i.renderState)}if(_e&&_e.includes("camera-access")&&_){e.state.unbindTexture(),f=n.getBinding();for(let xe=0;xe<Se.length;xe++){let Ne=Se[xe].camera;if(Ne){let Qe=m[Ne];Qe||(Qe=new Xo,m[Ne]=Qe);let Ye=f.getCameraImage(Ne);Qe.sourceTexture=Ye}}}}for(let Se=0;Se<R.length;Se++){let Ue=A[Se],_e=R[Se];Ue!==null&&_e!==void 0&&_e.update(Ue,pe,c||o)}Me&&Me(X,pe),pe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pe}),g=null}let nt=new nm;nt.setAnimationLoop(Re),this.setAnimationLoop=function(X){Me=X},this.dispose=function(){}}},CM=new ft,fm=new mt;fm.set(-1,0,0,0,1,0,0,0,1);function PM(s,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Tu(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,y,v,M){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),f(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),h(p,m),m.isMeshPhysicalMaterial&&d(p,m,M)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,v):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Gn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Gn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m),v=y.envMap,M=y.envMapRotation;v&&(p.envMap.value=v,p.envMapRotation.value.setFromMatrix4(CM.makeRotationFromEuler(M)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(fm),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,v){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=v*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function f(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function h(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,y){p.ior.value=m.ior,m.diffuseRoughness>0&&(p.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(p.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,p.diffuseRoughnessMapTransform))),m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Gn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function IM(s,e,t,n){let i={},r={};function o(y,v){let M=v.program;n.uniformBlockBinding(y,M,i[y.id])}function a(y,v){let M=i[y.id];M===void 0&&(g(y),M=l(y),i[y.id]=M,y.addEventListener("dispose",p));let R=v.program;n.updateUBOMapping(y,R);let A=e.render.frame;r[y.id]!==A&&(c(y),r[y.id]=A)}function l(y){let v=s.createBuffer(),M=y.__size,R=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,M,R),s.bindBuffer(s.UNIFORM_BUFFER,null),v}function c(y){let v=i[y.id],M=y.uniforms,R=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,v);for(let A=0,b=M.length;A<b;A++){let T=M[A];if(Array.isArray(T))for(let F=0,I=T.length;F<I;F++)u(T[F],A,F,R);else u(T,A,0,R)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function u(y,v,M,R){if(h(y,v,M,R)===!0){let A=y.__offset,b=y.value;if(Array.isArray(b)){let T=0;for(let F=0;F<b.length;F++){let I=b[F],k=_(I,!0);f(I,y.__data,T),T+=k.storage/Float32Array.BYTES_PER_ELEMENT}}else f(b,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,A,y.__data)}}function f(y,v,M){typeof y=="number"||typeof y=="boolean"?v[M]=y:y.isMatrix3?(v[M]=y.elements[0],v[M+1]=y.elements[1],v[M+2]=y.elements[2],v[M+3]=0,v[M+4]=y.elements[3],v[M+5]=y.elements[4],v[M+6]=y.elements[5],v[M+7]=0,v[M+8]=y.elements[6],v[M+9]=y.elements[7],v[M+10]=y.elements[8],v[M+11]=0):ArrayBuffer.isView(y)?v.set(y.subarray(0,v.length-M),M):y.toArray(v,M)}function h(y,v,M,R){let A=y.value,b=v+"_"+M;if(Array.isArray(A)){R[b]===void 0&&(R[b]=[]);let T=R[b],F=!1;for(let I=0;I<A.length;I++)d(A[I],T,I)===!0&&(F=!0);return F}return d(A,R,b)}function d(y,v,M){if(v[M]===void 0)return typeof y=="number"||typeof y=="boolean"?v[M]=y:ArrayBuffer.isView(y)?v[M]=y.slice():v[M]=y.clone(),!0;{let R=v[M];if(typeof y=="number"||typeof y=="boolean"){if(R!==y)return v[M]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(R.equals(y)===!1)return R.copy(y),!0}}return!1}function g(y){let v=y.uniforms,M=0,R=16;for(let b=0,T=v.length;b<T;b++){let F=Array.isArray(v[b])?v[b]:[v[b]];for(let I=0,k=F.length;I<k;I++){let G=F[I],H=Array.isArray(G.value)?G.value:[G.value],U=Array.isArray(v[b])||Array.isArray(G.value),K=M;for(let W=0,ge=H.length;W<ge;W++){let ee=H[W],de=_(ee,U),Me=M%R,Re=Me%de.boundary,nt=Me+Re;M+=Re,nt!==0&&R-nt<de.storage&&(M+=R-nt),W===0&&(K=M),M+=de.storage}let Q=G.type==="int"?Int32Array:G.type==="uint"?Uint32Array:Float32Array;G.__data=new Q((M-K)/Float32Array.BYTES_PER_ELEMENT),G.__offset=K}}let A=M%R;return A>0&&(M+=R-A),y.__size=M,y.__cache={},this}function _(y,v){let M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=16,M.storage=48):y.isMatrix4?(M.boundary=16,M.storage=64):y.isTexture?st("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(M.boundary=16,M.storage=y.byteLength):st("WebGLRenderer: Unsupported uniform value type.",y),v===!0&&(M.boundary=16,M.storage=Math.ceil(M.storage/16)*16),M}function p(y){let v=y.target;v.removeEventListener("dispose",p),s.deleteBuffer(i[v.id]),delete i[v.id],delete r[v.id]}function m(){for(let y in i)s.deleteBuffer(i[y]);i={},r={}}return{bind:o,update:a,dispose:m}}var LM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ni=null;function DM(){return Ni===null&&(Ni=new Hr(LM,16,16,Es,Mi),Ni.name="DFG_LUT",Ni.minFilter=bn,Ni.magFilter=bn,Ni.wrapS=ai,Ni.wrapT=ai,Ni.generateMipmaps=!1,Ni.needsUpdate=!0),Ni}var Bc=class{constructor(e={}){let{canvas:t=bp(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=Kn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let _=d,p=new Set([ec,Ql,jl]),m=new Set([Kn,vi,so,nr,Zl,$l]),y=new Uint32Array(4),v=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]},R=null,A=null,b=[],T=[],F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Di,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,k=!1,G=null,H=null,U=null,K=null;this._outputColorSpace=Yt;let Q=0,W=0,ge=null,ee=-1,de=null,Me=new Xt,Re=new Xt,nt=null,X=new it(0),pe=0,Se=t.width,Ue=t.height,_e=1,me=null,Ie=null,xe=new Xt(0,0,Se,Ue),Ne=new Xt(0,0,Se,Ue),Qe=!1,Ye=new gs,rt=new Al,gt=!1,Pt=!1,yt=new ft,kt=new L,ot=new Xt,Ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},hn=!1;function un(){return ge===null?_e:1}let Y=n;function lt(C,V){return t.getContext(C,V)}let It,At,De,Kt,tt,Be,D,w,te,Te,oe,ne,Ae,ue,le,Ce,B,ye,j,Z,J,O,ze;try{let C={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",et,!1),t.addEventListener("webglcontextrestored",pt,!1),t.addEventListener("webglcontextcreationerror",ke,!1),Y===null){let V="webgl2";if(Y=lt(V,C),Y===null)throw lt(V)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}at()}catch(C){throw t.removeEventListener("webglcontextlost",et,!1),t.removeEventListener("webglcontextrestored",pt,!1),t.removeEventListener("webglcontextcreationerror",ke,!1),ht("WebGLRenderer: "+C.message),C}function at(){It=new Wx(Y),It.init(),J=new wM(Y,It),At=new Dx(Y,It,e,J),De=new EM(Y,It),At.reversedDepthBuffer&&h&&De.buffers.depth.setReversed(!0),H=Y.createFramebuffer(),U=Y.createFramebuffer(),K=Y.createFramebuffer(),Kt=new Yx(Y),tt=new hM,Be=new TM(Y,It,De,tt,At,J,Kt),D=new Vx(I),w=new Zg(Y),O=new Ix(Y,w),te=new Xx(Y,w,Kt,O),Te=new Zx(Y,te,w,O,Kt),ye=new Kx(Y,At,Be),le=new Nx(tt),oe=new cM(I,D,It,At,O,le),ne=new PM(I,tt),Ae=new fM,ue=new yM(It),B=new Px(I,D,De,Te,g,l),Ce=new SM(I,Te,At),ze=new IM(Y,Kt,At,De),j=new Lx(Y,It,Kt),Z=new qx(Y,It,Kt),Kt.programs=oe.programs,I.capabilities=At,I.extensions=It,I.properties=tt,I.renderLists=Ae,I.shadowMap=Ce,I.state=De,I.info=Kt}_!==Kn&&(F=new Jx(_,t.width,t.height,a,i,r));let we=new Bu(I,Y);this.xr=we,this.getContext=function(){return Y},this.getContextAttributes=function(){return Y.getContextAttributes()},this.forceContextLoss=function(){let C=It.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){let C=It.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return _e},this.setPixelRatio=function(C){C!==void 0&&(_e=C,this.setSize(Se,Ue,!1))},this.getSize=function(C){return C.set(Se,Ue)},this.setSize=function(C,V,he=!0){if(we.isPresenting){st("WebGLRenderer: Can't change size while VR device is presenting.");return}Se=C,Ue=V,t.width=Math.floor(C*_e),t.height=Math.floor(V*_e),he===!0&&(t.style.width=C+"px",t.style.height=V+"px"),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,C,V)},this.getDrawingBufferSize=function(C){return C.set(Se*_e,Ue*_e).floor()},this.setDrawingBufferSize=function(C,V,he){Se=C,Ue=V,_e=he,t.width=Math.floor(C*he),t.height=Math.floor(V*he),this.setViewport(0,0,C,V)},this.setEffects=function(C){if(_===Kn){ht("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(C){for(let V=0;V<C.length;V++)if(C[V].isOutputPass===!0){st("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(C||[])},this.getCurrentViewport=function(C){return C.copy(Me)},this.getViewport=function(C){return C.copy(xe)},this.setViewport=function(C,V,he,se){C.isVector4?xe.set(C.x,C.y,C.z,C.w):xe.set(C,V,he,se),De.viewport(Me.copy(xe).multiplyScalar(un()).round())},this.getScissor=function(C){return C.copy(Ne)},this.setScissor=function(C,V,he,se){C.isVector4?Ne.set(C.x,C.y,C.z,C.w):Ne.set(C,V,he,se),De.scissor(Re.copy(Ne).multiplyScalar(un()).round())},this.getScissorTest=function(){return Qe},this.setScissorTest=function(C){De.setScissorTest(Qe=C)},this.setOpaqueSort=function(C){me=C},this.setTransparentSort=function(C){Ie=C},this.getClearColor=function(C){return C.copy(B.getClearColor())},this.setClearColor=function(){B.setClearColor(...arguments)},this.getClearAlpha=function(){return B.getClearAlpha()},this.setClearAlpha=function(){B.setClearAlpha(...arguments)},this.clear=function(C=!0,V=!0,he=!0){let se=0;if(C){let re=!1;if(ge!==null){let Oe=ge.texture.format;re=p.has(Oe)}if(re){let Oe=ge.texture.type,Ke=m.has(Oe),Fe=B.getClearColor(),He=B.getClearAlpha(),Ze=Fe.r,ut=Fe.g,Mt=Fe.b;Ke?(y[0]=Ze,y[1]=ut,y[2]=Mt,y[3]=He,Y.clearBufferuiv(Y.COLOR,0,y)):(v[0]=Ze,v[1]=ut,v[2]=Mt,v[3]=He,Y.clearBufferiv(Y.COLOR,0,v))}else se|=Y.COLOR_BUFFER_BIT}V&&(se|=Y.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),he&&(se|=Y.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),se!==0&&Y.clear(se)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(C){C.setRenderer(this),G=C},this.dispose=function(){t.removeEventListener("webglcontextlost",et,!1),t.removeEventListener("webglcontextrestored",pt,!1),t.removeEventListener("webglcontextcreationerror",ke,!1),B.dispose(),Ae.dispose(),ue.dispose(),Be.dispose(),tt.dispose(),D.dispose(),Te.dispose(),te.dispose(),O.dispose(),ze.dispose(),oe.dispose(),we.dispose(),we.removeEventListener("sessionstart",Ca),we.removeEventListener("sessionend",Pa),$n.stop()};function et(C){C.preventDefault(),Lo("WebGLRenderer: Context Lost."),k=!0}function pt(){Lo("WebGLRenderer: Context Restored."),k=!1;let C=Kt.autoReset,V=Ce.enabled,he=Ce.autoUpdate,se=Ce.needsUpdate,re=Ce.type;at(),Kt.autoReset=C,Ce.enabled=V,Ce.autoUpdate=he,Ce.needsUpdate=se,Ce.type=re}function ke(C){ht("WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function Dt(C){let V=C.target;V.removeEventListener("dispose",Dt),Jt(V)}function Jt(C){pi(C),tt.remove(C)}function pi(C){let V=tt.get(C).programs;V!==void 0&&(V.forEach(function(he){oe.releaseProgram(he)}),C.isShaderMaterial&&oe.releaseShaderCache(C))}this.renderBufferDirect=function(C,V,he,se,re,Oe){V===null&&(V=Ut);let Ke=re.isMesh&&re.matrixWorld.determinantAffine()<0,Fe=eh(C,V,he,se,re);De.setMaterial(se,Ke);let He=he.index,Ze=1;if(se.wireframe===!0){if(He=te.getWireframeAttribute(he),He===void 0)return;Ze=2}let ut=he.drawRange,Mt=he.attributes.position,qe=ut.start*Ze,Tt=(ut.start+ut.count)*Ze;Oe!==null&&(qe=Math.max(qe,Oe.start*Ze),Tt=Math.min(Tt,(Oe.start+Oe.count)*Ze)),He!==null?(qe=Math.max(qe,0),Tt=Math.min(Tt,He.count)):Mt!=null&&(qe=Math.max(qe,0),Tt=Math.min(Tt,Mt.count));let Qt=Tt-qe;if(Qt<0||Qt===1/0)return;O.setup(re,se,Fe,he,He);let Ot,Vt=j;if(He!==null&&(Ot=w.get(He),Vt=Z,Vt.setIndex(Ot)),re.isMesh)se.wireframe===!0?(De.setLineWidth(se.wireframeLinewidth*un()),Vt.setMode(Y.LINES)):Vt.setMode(Y.TRIANGLES);else if(re.isLine){let xn=se.linewidth;xn===void 0&&(xn=1),De.setLineWidth(xn*un()),re.isLineSegments?Vt.setMode(Y.LINES):re.isLineLoop?Vt.setMode(Y.LINE_LOOP):Vt.setMode(Y.LINE_STRIP)}else re.isPoints?Vt.setMode(Y.POINTS):re.isSprite&&Vt.setMode(Y.TRIANGLES);if(re.isBatchedMesh)if(It.get("WEBGL_multi_draw"))Vt.renderMultiDraw(re._multiDrawStarts,re._multiDrawCounts,re._multiDrawCount);else{let xn=re._multiDrawStarts,$e=re._multiDrawCounts,vn=re._multiDrawCount,_t=He?w.get(He).bytesPerElement:1,ri=tt.get(se).currentProgram.getUniforms();for(let cn=0;cn<vn;cn++)ri.setValue(Y,"_gl_DrawID",cn),Vt.render(xn[cn]/_t,$e[cn])}else if(re.isInstancedMesh)Vt.renderInstances(qe,Qt,re.count);else if(he.isInstancedBufferGeometry){let xn=he._maxInstanceCount!==void 0?he._maxInstanceCount:1/0,$e=Math.min(he.instanceCount,xn);Vt.renderInstances(qe,Qt,$e)}else Vt.render(qe,Qt)};function Ra(C,V,he,se){G!==null&&C.isNodeMaterial&&G.setObject(se,C),gt===!0&&le.setState(C,he,!1),C.transparent===!0&&C.side===An&&C.forceSinglePass===!1?(C.side=Gn,C.needsUpdate=!0,mi(C,V,se),C.side=Li,C.needsUpdate=!0,mi(C,V,se),C.side=An):mi(C,V,se)}this.compile=function(C,V,he=null){he===null&&(he=C),G!==null&&G.renderStart(C,V,he),A=ue.get(he),A.init(V),T.push(A),he.traverseVisible(function(re){re.isLight&&re.layers.test(V.layers)&&(A.pushLight(re),re.castShadow&&A.pushShadow(re))}),C!==he&&C.traverseVisible(function(re){re.isLight&&re.layers.test(V.layers)&&(A.pushLight(re),re.castShadow&&A.pushShadow(re))}),A.setupLights(),G!==null&&G.updateLights(A.state.lightsArray),Pt=this.localClippingEnabled,gt=le.init(this.clippingPlanes,Pt),gt===!0&&le.setGlobalState(this.clippingPlanes,V),G!==null&&Ce.render(A.state.shadowsArray,he,V);let se=new Set;return C.traverse(function(re){if(!(re.isMesh||re.isPoints||re.isLine||re.isSprite))return;let Oe=re.material;if(Oe)if(Array.isArray(Oe))for(let Ke=0;Ke<Oe.length;Ke++){let Fe=Oe[Ke];Ra(Fe,he,V,re),se.add(Fe)}else Ra(Oe,he,V,re),se.add(Oe)}),A=T.pop(),G!==null&&G.renderEnd(),se},this.compileAsync=function(C,V,he=null){let se=this.compile(C,V,he);return new Promise(re=>{function Oe(){if(se.forEach(function(Ke){let He=tt.get(Ke).currentProgram;(He===void 0||He.isReady())&&se.delete(Ke)}),se.size===0){re(C);return}setTimeout(Oe,10)}It.get("KHR_parallel_shader_compile")!==null?Oe():setTimeout(Oe,10)})};let ar=null;function jc(C){ar&&ar(C)}function Ca(){$n.stop()}function Pa(){$n.start()}let $n=new nm;$n.setAnimationLoop(jc),typeof self<"u"&&$n.setContext(self),this.setAnimationLoop=function(C){ar=C,we.setAnimationLoop(C),C===null?$n.stop():$n.start()},we.addEventListener("sessionstart",Ca),we.addEventListener("sessionend",Pa),this.render=function(C,V){if(V!==void 0&&V.isCamera!==!0){ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(k===!0)return;G!==null&&G.renderStart(C,V);let he=we.enabled===!0&&we.isPresenting===!0,se=F!==null&&(ge===null||he)&&F.begin(I,ge);if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),V.parent===null&&V.matrixWorldAutoUpdate===!0&&V.updateMatrixWorld(),we.enabled===!0&&we.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(we.cameraAutoUpdate===!0&&we.updateCamera(V),V=we.getCamera()),C.isScene===!0&&C.onBeforeRender(I,C,V,ge),A=ue.get(C,T.length),A.init(V),A.state.textureUnits=Be.getTextureUnits(),T.push(A),yt.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),V.isArrayCamera?rt.setFromArrayCamera(V):Ye.setFromProjectionMatrix(yt,li,V.reversedDepth),Pt=this.localClippingEnabled,gt=le.init(this.clippingPlanes,Pt),R=Ae.get(C,b.length),R.init(),b.push(R),this.info.render.frame++,we.enabled===!0&&we.isPresenting===!0){let Ke=I.xr.getDepthSensingMesh();Ke!==null&&lr(Ke,V,-1/0,I.sortObjects)}lr(C,V,0,I.sortObjects),R.finish(),G!==null&&G.updateLights(A.state.lightsArray),I.sortObjects===!0&&R.sort(me,Ie),hn=we.enabled===!1||we.isPresenting===!1||we.hasDepthSensing()===!1,hn&&B.addToRenderList(R,C),this.info.autoReset===!0&&this.info.reset(),gt===!0&&le.beginShadows();let re=A.state.shadowsArray;if(Ce.render(re,C,V),gt===!0&&le.endShadows(),(se&&F.hasRenderPass())===!1){let Ke=R.opaque,Fe=R.transmissive;if(A.setupLights(),V.isArrayCamera){let He=V.cameras;if(Fe.length>0)for(let Ze=0,ut=He.length;Ze<ut;Ze++){let Mt=He[Ze];cr(Ke,Fe,C,Mt)}hn&&B.render(C);for(let Ze=0,ut=He.length;Ze<ut;Ze++){let Mt=He[Ze];Ia(R,C,Mt,Mt.viewport)}}else Fe.length>0&&cr(Ke,Fe,C,V),hn&&B.render(C),Ia(R,C,V)}ge!==null&&W===0&&(Be.updateMultisampleRenderTarget(ge),Be.updateRenderTargetMipmap(ge)),se&&F.end(I),C.isScene===!0&&C.onAfterRender(I,C,V),O.resetDefaultState(),ee=-1,de=null,T.pop(),T.length>0?(A=T[T.length-1],Be.setTextureUnits(A.state.textureUnits),gt===!0&&le.setGlobalState(I.clippingPlanes,A.state.camera)):A=null,b.pop(),b.length>0?R=b[b.length-1]:R=null,G!==null&&G.renderEnd()};function lr(C,V,he,se){if(C.visible===!1)return;if(C.layers.test(V.layers)){if(C.isGroup)he=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(V);else if(C.isLight)A.pushLight(C),C.castShadow&&A.pushShadow(C);else if(C.isSprite){let Ke=V.isArrayCamera?rt:Ye;if(!C.frustumCulled||C.intersectsFrustum(Ke)){se&&ot.setFromMatrixPosition(C.matrixWorld).applyMatrix4(yt);let Fe=Te.update(C),He=C.material;He.visible&&R.push(C,Fe,He,he,ot.z,null,V)}}else if(C.isMesh||C.isLine||C.isPoints){let Ke=V.isArrayCamera?rt:Ye;if(!C.frustumCulled||C.intersectsFrustum(Ke)){let Fe=Te.update(C),He=C.material;if(se&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),ot.copy(C.boundingSphere.center)):(Fe.boundingSphere===null&&Fe.computeBoundingSphere(),ot.copy(Fe.boundingSphere.center)),ot.applyMatrix4(C.matrixWorld).applyMatrix4(yt)),Array.isArray(He)){let Ze=Fe.groups;for(let ut=0,Mt=Ze.length;ut<Mt;ut++){let qe=Ze[ut],Tt=He[qe.materialIndex];Tt&&Tt.visible&&R.push(C,Fe,Tt,he,ot.z,qe,V)}}else He.visible&&R.push(C,Fe,He,he,ot.z,null,V)}}}let Oe=C.children;for(let Ke=0,Fe=Oe.length;Ke<Fe;Ke++)lr(Oe[Ke],V,he,se)}function Ia(C,V,he,se){let{opaque:re,transmissive:Oe,transparent:Ke}=C;A.setupLightsView(he),gt===!0&&le.setGlobalState(I.clippingPlanes,he),se&&De.viewport(Me.copy(se)),re.length>0&&hr(re,V,he),Oe.length>0&&hr(Oe,V,he),Ke.length>0&&hr(Ke,V,he),De.buffers.depth.setTest(!0),De.buffers.depth.setMask(!0),De.buffers.color.setMask(!0),De.setPolygonOffset(!1)}function cr(C,V,he,se){if((he.isScene===!0?he.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[se.id]===void 0){let qe=It.has("EXT_color_buffer_half_float")||It.has("EXT_color_buffer_float");A.state.transmissionRenderTarget[se.id]=new ni(1,1,{generateMipmaps:!0,type:qe?Mi:Kn,minFilter:hi,samples:Math.max(4,At.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:bt.workingColorSpace})}let Oe=A.state.transmissionRenderTarget[se.id],Ke=se.viewport||Me;Oe.setSize(Ke.z*I.transmissionResolutionScale,Ke.w*I.transmissionResolutionScale);let Fe=I.getRenderTarget(),He=I.getActiveCubeFace(),Ze=I.getActiveMipmapLevel();I.setRenderTarget(Oe),I.getClearColor(X),pe=I.getClearAlpha(),pe<1&&I.setClearColor(16777215,.5),I.clear(),hn&&B.render(he);let ut=I.toneMapping;I.toneMapping=Di;let Mt=se.viewport;if(se.viewport!==void 0&&(se.viewport=void 0),A.setupLightsView(se),gt===!0&&le.setGlobalState(I.clippingPlanes,se),hr(C,he,se),Be.updateMultisampleRenderTarget(Oe),Be.updateRenderTargetMipmap(Oe),It.has("WEBGL_multisampled_render_to_texture")===!1){let qe=!1;for(let Tt=0,Qt=V.length;Tt<Qt;Tt++){let Ot=V[Tt],{object:Vt,geometry:xn,material:$e,group:vn}=Ot;if($e.side===An&&Vt.layers.test(se.layers)){let _t=$e.side;$e.side=Gn,$e.needsUpdate=!0,La(Vt,he,se,xn,$e,vn),$e.side=_t,$e.needsUpdate=!0,qe=!0}}qe===!0&&(Be.updateMultisampleRenderTarget(Oe),Be.updateRenderTargetMipmap(Oe))}I.setRenderTarget(Fe,He,Ze),I.setClearColor(X,pe),Mt!==void 0&&(se.viewport=Mt),I.toneMapping=ut}function hr(C,V,he){let se=V.isScene===!0?V.overrideMaterial:null;for(let re=0,Oe=C.length;re<Oe;re++){let Ke=C[re],{object:Fe,geometry:He,group:Ze}=Ke,ut=Ke.material;ut.allowOverride===!0&&se!==null&&(ut=se),Fe.layers.test(he.layers)&&La(Fe,V,he,He,ut,Ze)}}function La(C,V,he,se,re,Oe){G!==null&&re.isNodeMaterial&&G.setObject(C,re),C.onBeforeRender(I,V,he,se,re,Oe),C.modelViewMatrix.multiplyMatrices(he.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),re.onBeforeRender(I,V,he,se,C,Oe),re.transparent===!0&&re.side===An&&re.forceSinglePass===!1?(re.side=Gn,re.needsUpdate=!0,I.renderBufferDirect(he,V,se,re,C,Oe),re.side=Li,re.needsUpdate=!0,I.renderBufferDirect(he,V,se,re,C,Oe),re.side=An):I.renderBufferDirect(he,V,se,re,C,Oe),C.onAfterRender(I,V,he,se,re,Oe)}function Da(C){let V=0;for(let he of C)he.texture!==null&&V++;return V}function mi(C,V,he){V.isScene!==!0&&(V=Ut);let se=tt.get(C),re=A.state.lights,Oe=A.state.shadowsArray,Ke=re.state.version,Fe=oe.getParameters(C,re.state,Oe,V,he,A.state.lightProbeGridArray),He=oe.getProgramCacheKey(Fe),Ze=se.programs;se.environment=C.isMeshStandardMaterial||C.isMeshLambertMaterial||C.isMeshPhongMaterial?V.environment:null,se.fog=V.fog;let ut=C.isMeshStandardMaterial||C.isMeshLambertMaterial&&!C.envMap||C.isMeshPhongMaterial&&!C.envMap;se.envMap=D.get(C.envMap||se.environment,ut),se.envMapRotation=se.environment!==null&&C.envMap===null?V.environmentRotation:C.envMapRotation,Ze===void 0&&(C.addEventListener("dispose",Dt),Ze=new Map,se.programs=Ze,se.programVariants=new Map);let Mt=Ze.get(He);if(Mt!==void 0){if(se.currentProgram===Mt&&se.lightsStateVersion===Ke)return Ua(C,Fe),Mt}else Fe.uniforms=oe.getUniforms(C),G!==null&&C.isNodeMaterial&&G.build(C,he,Fe),C.onBeforeCompile(Fe,I),Mt=oe.acquireProgram(Fe,He),Ze.set(He,Mt),se.uniforms=Fe.uniforms;let qe=se.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(qe.clippingPlanes=le.uniform),Ua(C,Fe),se.needsLights=nh(C),se.lightsStateVersion=Ke,se.needsLights&&(qe.ambientLightColor.value=re.state.ambient,qe.lightProbe.value=re.state.probe,qe.sunLights.value=re.state.sun,qe.sunLightShadows.value=re.state.sunShadow,qe.directionalLights.value=re.state.directional,qe.directionalLightShadows.value=re.state.directionalShadow,qe.spotLights.value=re.state.spot,qe.spotLightShadows.value=re.state.spotShadow,qe.rectAreaLights.value=re.state.rectArea,qe.ltc_1.value=re.state.rectAreaLTC1,qe.ltc_2.value=re.state.rectAreaLTC2,qe.pointLights.value=re.state.point,qe.pointLightShadows.value=re.state.pointShadow,qe.hemisphereLights.value=re.state.hemi,qe.sunShadowMatrix.value=re.state.sunShadowMatrix,qe.sunShadowCascade.value=re.state.sunShadowCascade,qe.directionalShadowMatrix.value=re.state.directionalShadowMatrix,qe.spotLightMatrix.value=re.state.spotLightMatrix,qe.spotLightMap.value=re.state.spotLightMap,qe.pointShadowMatrix.value=re.state.pointShadowMatrix),se.numLightProbeGrids=Da(A.state.lightProbeGridArray),se.currentProgram=Mt,se.uniformsList=null,Mt}function Qc(C,V,he,se,re){let Oe=tt.get(C),Ke=Oe.currentProgram.id+","+se+","+re,Fe=Oe.programVariants.get(Ke);return Fe===void 0?(Fe=mi(C,V,he),Oe.programVariants.set(Ke,Fe)):(Oe.currentProgram=Fe,Oe.uniformsList=null,Oe.outputColorSpace=se,Oe.toneMapping=re),Fe}function Na(C){if(C.uniformsList===null){let V=C.currentProgram.getUniforms();C.uniformsList=oo.seqWithValue(V.seq,C.uniforms)}return C.uniformsList}function Ua(C,V){let he=tt.get(C);he.outputColorSpace=V.outputColorSpace,he.batching=V.batching,he.batchingColor=V.batchingColor,he.instancing=V.instancing,he.instancingColor=V.instancingColor,he.instancingMorph=V.instancingMorph,he.skinning=V.skinning,he.morphTargets=V.morphTargets,he.morphNormals=V.morphNormals,he.morphColors=V.morphColors,he.morphTargetsCount=V.morphTargetsCount,he.numClippingPlanes=V.numClippingPlanes,he.numIntersection=V.numClipIntersection,he.vertexAlphas=V.vertexAlphas,he.vertexTangents=V.vertexTangents,he.toneMapping=V.toneMapping}function eh(C,V,he,se,re){V.isScene!==!0&&(V=Ut),Be.resetTextureUnits();let Oe=V.fog,Ke=se.isMeshStandardMaterial||se.isMeshLambertMaterial||se.isMeshPhongMaterial?V.environment:null,Fe=ge===null?I.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:bt.workingColorSpace,He=se.isMeshStandardMaterial||se.isMeshLambertMaterial&&!se.envMap||se.isMeshPhongMaterial&&!se.envMap,Ze=D.get(se.envMap||Ke,He),ut=se.vertexColors===!0&&!!he.attributes.color&&he.attributes.color.itemSize===4,Mt=!!he.attributes.tangent&&(!!se.normalMap||se.anisotropy>0),qe=!!he.morphAttributes.position,Tt=!!he.morphAttributes.normal,Qt=!!he.morphAttributes.color,Ot=Di;se.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&(Ot=I.toneMapping);let Vt=he.morphAttributes.position||he.morphAttributes.normal||he.morphAttributes.color,xn=Vt!==void 0?Vt.length:0,$e=tt.get(se),vn=A.state.lights;if(gt===!0&&(Pt===!0||C!==de)){let zt=C===de&&se.id===ee;le.setState(se,C,zt)}let _t=!1,ri=!1;se.version===$e.__version?$e.needsLights&&$e.lightsStateVersion!==vn.state.version||re.isBatchedMesh&&$e.batching===!1||!re.isBatchedMesh&&$e.batching===!0||re.isBatchedMesh&&$e.batchingColor===!0&&re._colorsTexture===null||re.isBatchedMesh&&$e.batchingColor===!1&&re._colorsTexture!==null||re.isInstancedMesh&&$e.instancing===!1||!re.isInstancedMesh&&$e.instancing===!0||re.isSkinnedMesh&&$e.skinning===!1||!re.isSkinnedMesh&&$e.skinning===!0||re.isInstancedMesh&&$e.instancingColor===!0&&re.instanceColor===null||re.isInstancedMesh&&$e.instancingColor===!1&&re.instanceColor!==null||re.isInstancedMesh&&$e.instancingMorph===!0&&re.morphTexture===null||re.isInstancedMesh&&$e.instancingMorph===!1&&re.morphTexture!==null||$e.envMap!==Ze||se.fog===!0&&$e.fog!==Oe||$e.numClippingPlanes!==void 0&&($e.numClippingPlanes!==le.numPlanes||$e.numIntersection!==le.numIntersection)||$e.vertexAlphas!==ut||$e.vertexTangents!==Mt||$e.morphTargets!==qe||$e.morphNormals!==Tt||$e.morphColors!==Qt||$e.morphTargetsCount!==xn||$e.numLightProbeGrids!==Da(A.state.lightProbeGridArray)?_t=!0:($e.outputColorSpace!==Fe||$e.toneMapping!==Ot)&&(ri=!0):(_t=!0,$e.__version=se.version);let cn=$e.currentProgram;(_t===!0||ri===!0)&&(cn=ri===!0?Qc(se,V,re,Fe,Ot):mi(se,V,re),G&&se.isNodeMaterial&&G.onUpdateProgram(se,cn,$e));let as=!1,gi=!1,Fi=!1,wt=cn.getUniforms(),sn=$e.uniforms;if(De.useProgram(cn.program)&&(as=!0,gi=!0,Fi=!0),se.id!==ee&&(ee=se.id,gi=!0),as||de!==C){De.buffers.depth.getReversed()&&C.reversedDepth!==!0&&(C._reversedDepth=!0,C.updateProjectionMatrix()),wt.setValue(Y,"projectionMatrix",C.projectionMatrix),wt.setValue(Y,"viewMatrix",C.matrixWorldInverse);let jt=wt.map.cameraPosition;jt!==void 0&&jt.setValue(Y,kt.setFromMatrixPosition(C.matrixWorld)),At.logarithmicDepthBuffer&&wt.setValue(Y,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(se.isMeshPhongMaterial||se.isMeshToonMaterial||se.isMeshLambertMaterial||se.isMeshBasicMaterial||se.isMeshStandardMaterial||se.isShaderMaterial)&&wt.setValue(Y,"isOrthographic",C.isOrthographicCamera===!0),de!==C&&(de=C,gi=!0,Fi=!0)}if($e.needsLights&&(vn.state.sunShadowMap.length>0&&wt.setValue(Y,"sunShadowMap",vn.state.sunShadowMap,Be),vn.state.directionalShadowMap.length>0&&wt.setValue(Y,"directionalShadowMap",vn.state.directionalShadowMap,Be),vn.state.spotShadowMap.length>0&&wt.setValue(Y,"spotShadowMap",vn.state.spotShadowMap,Be),vn.state.pointShadowMap.length>0&&wt.setValue(Y,"pointShadowMap",vn.state.pointShadowMap,Be)),re.isSkinnedMesh){wt.setOptional(Y,re,"bindMatrix"),wt.setOptional(Y,re,"bindMatrixInverse");let zt=re.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),wt.setValue(Y,"boneTexture",zt.boneTexture,Be))}re.isBatchedMesh&&(wt.setOptional(Y,re,"batchingTexture"),wt.setValue(Y,"batchingTexture",re._matricesTexture,Be),wt.setOptional(Y,re,"batchingIdTexture"),wt.setValue(Y,"batchingIdTexture",re._indirectTexture,Be),wt.setOptional(Y,re,"batchingColorTexture"),re._colorsTexture!==null&&wt.setValue(Y,"batchingColorTexture",re._colorsTexture,Be));let Nn=he.morphAttributes;if((Nn.position!==void 0||Nn.normal!==void 0||Nn.color!==void 0)&&ye.update(re,he,cn),(gi||$e.receiveShadow!==re.receiveShadow)&&($e.receiveShadow=re.receiveShadow,wt.setValue(Y,"receiveShadow",re.receiveShadow)),(se.isMeshStandardMaterial||se.isMeshLambertMaterial||se.isMeshPhongMaterial)&&se.envMap===null&&V.environment!==null&&(sn.envMapIntensity.value=V.environmentIntensity),sn.dfgLUT!==void 0&&(sn.dfgLUT.value=DM()),gi){if(wt.setValue(Y,"toneMappingExposure",I.toneMappingExposure),$e.needsLights&&th(sn,Fi),Oe&&se.fog===!0&&ne.refreshFogUniforms(sn,Oe),ne.refreshMaterialUniforms(sn,se,_e,Ue,A.state.transmissionRenderTarget[C.id]),$e.needsLights&&$e.numLightProbeGrids>0){let zt=M,jt=0;for(let Wn of A.state.lightProbeGridArray)Wn.texture!==null&&(zt.textures[jt]=Wn.texture,zt.min[jt]=Wn.boundingBox.min,zt.max[jt]=Wn.boundingBox.max,zt.resolution[jt]=Wn.resolution,jt++);for(let Wn in zt)zt[Wn].length=jt;sn.probesSH.value=zt.textures,sn.probesMin.value=zt.min,sn.probesMax.value=zt.max,sn.probesResolution.value=zt.resolution}oo.upload(Y,Na($e),sn,Be)}if(se.isShaderMaterial&&se.uniformsNeedUpdate===!0&&(oo.upload(Y,Na($e),sn,Be),se.uniformsNeedUpdate=!1),se.isSpriteMaterial&&wt.setValue(Y,"center",re.center),wt.setValue(Y,"modelViewMatrix",re.modelViewMatrix),wt.setValue(Y,"normalMatrix",re.normalMatrix),wt.setValue(Y,"modelMatrix",re.matrixWorld),se.uniformsGroups!==void 0){let zt=se.uniformsGroups;for(let jt=0,Wn=zt.length;jt<Wn;jt++){let As=zt[jt];ze.update(As,cn),ze.bind(As,cn)}}return cn}function th(C,V){C.ambientLightColor.needsUpdate=V,C.lightProbe.needsUpdate=V,C.sunLights.needsUpdate=V,C.sunLightShadows.needsUpdate=V,C.directionalLights.needsUpdate=V,C.directionalLightShadows.needsUpdate=V,C.pointLights.needsUpdate=V,C.pointLightShadows.needsUpdate=V,C.spotLights.needsUpdate=V,C.spotLightShadows.needsUpdate=V,C.rectAreaLights.needsUpdate=V,C.hemisphereLights.needsUpdate=V}function nh(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return ge},this.setRenderTargetTextures=function(C,V,he){let se=tt.get(C);se.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,se.__autoAllocateDepthBuffer===!1&&(se.__useRenderToTexture=!1),tt.get(C.texture).__webglTexture=V,tt.get(C.depthTexture).__webglTexture=se.__autoAllocateDepthBuffer?void 0:he,se.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,V){let he=tt.get(C);he.__webglFramebuffer=V,he.__useDefaultFramebuffer=V===void 0},this.setRenderTarget=function(C,V=0,he=0){ge=C,Q=V,W=he;let se=null,re=!1,Oe=!1;if(C){let Fe=tt.get(C);if(Fe.__useDefaultFramebuffer!==void 0){De.bindFramebuffer(Y.FRAMEBUFFER,Fe.__webglFramebuffer),Me.copy(C.viewport),Re.copy(C.scissor),nt=C.scissorTest,De.viewport(Me),De.scissor(Re),De.setScissorTest(nt),ee=-1;return}else if(Fe.__webglFramebuffer===void 0)Be.setupRenderTarget(C);else if(Fe.__hasExternalTextures)Be.rebindTextures(C,tt.get(C.texture).__webglTexture,tt.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){let ut=C.depthTexture;if(Fe.__boundDepthTexture!==ut){if(ut!==null&&tt.has(ut)&&(C.width!==ut.image.width||C.height!==ut.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Be.setupDepthRenderbuffer(C)}}let He=C.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Oe=!0);let Ze=tt.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ze[V])?se=Ze[V][he]:se=Ze[V],re=!0):C.samples>0&&Be.useMultisampledRTT(C)===!1?se=tt.get(C).__webglMultisampledFramebuffer:Array.isArray(Ze)?se=Ze[he]:se=Ze,Me.copy(C.viewport),Re.copy(C.scissor),nt=C.scissorTest}else Me.copy(xe).multiplyScalar(_e).floor(),Re.copy(Ne).multiplyScalar(_e).floor(),nt=Qe;if(he!==0&&(se=H),De.bindFramebuffer(Y.FRAMEBUFFER,se)&&De.drawBuffers(C,se),De.viewport(Me),De.scissor(Re),De.setScissorTest(nt),re){let Fe=tt.get(C.texture);Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_CUBE_MAP_POSITIVE_X+V,Fe.__webglTexture,he)}else if(Oe){let Fe=V;for(let He=0;He<C.textures.length;He++){let Ze=tt.get(C.textures[He]);Y.framebufferTextureLayer(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0+He,Ze.__webglTexture,he,Fe)}}else if(C!==null&&he!==0){let Fe=tt.get(C.texture);Y.framebufferTexture2D(Y.FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_2D,Fe.__webglTexture,he)}ee=-1};function Oa(C){let V=tt.get(C);return(V.__readFormat!==C.format||V.__readType!==C.type)&&(V.__readFormat=C.format,V.__readType=C.type,V.__formatReadable=At.textureFormatReadable(C.format),V.__typeReadable=At.textureTypeReadable(C.type)),V}this.readRenderTargetPixels=function(C,V,he,se,re,Oe,Ke,Fe=0){if(!(C&&C.isWebGLRenderTarget)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let He=tt.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ke!==void 0&&(He=He[Ke],Array.isArray(He)&&(He=He[0])),He){De.bindFramebuffer(Y.FRAMEBUFFER,He);try{let Ze=C.textures[Fe],ut=Ze.format,Mt=Ze.type;C.textures.length>1&&Y.readBuffer(Y.COLOR_ATTACHMENT0+Fe);let qe=Oa(Ze);if(qe.__formatReadable===!1){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(qe.__typeReadable===!1){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}V>=0&&V<=C.width-se&&he>=0&&he<=C.height-re&&Y.readPixels(V,he,se,re,J.convert(ut),J.convert(Mt),Oe)}finally{let Ze=ge!==null?tt.get(ge).__webglFramebuffer:null;De.bindFramebuffer(Y.FRAMEBUFFER,Ze)}}},this.readRenderTargetPixelsAsync=async function(C,V,he,se,re,Oe,Ke,Fe=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let He=tt.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ke!==void 0&&(He=He[Ke],Array.isArray(He)&&(He=He[0])),He)if(V>=0&&V<=C.width-se&&he>=0&&he<=C.height-re){De.bindFramebuffer(Y.FRAMEBUFFER,He);let Ze=C.textures[Fe],ut=Ze.format,Mt=Ze.type;C.textures.length>1&&Y.readBuffer(Y.COLOR_ATTACHMENT0+Fe);let qe=Oa(Ze);if(qe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(qe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Tt=Y.createBuffer();Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Tt),Y.bufferData(Y.PIXEL_PACK_BUFFER,Oe.byteLength,Y.STREAM_READ),Y.readPixels(V,he,se,re,J.convert(ut),J.convert(Mt),0),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,null);let Qt=ge!==null?tt.get(ge).__webglFramebuffer:null;De.bindFramebuffer(Y.FRAMEBUFFER,Qt);let Ot=Y.fenceSync(Y.SYNC_GPU_COMMANDS_COMPLETE,0);return Y.flush(),await Ep(Y,Ot,4),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,Tt),Y.getBufferSubData(Y.PIXEL_PACK_BUFFER,0,Oe),Y.bindBuffer(Y.PIXEL_PACK_BUFFER,null),Y.deleteBuffer(Tt),Y.deleteSync(Ot),Oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,V=null,he=0){let se=Math.pow(2,-he),re=Math.floor(C.image.width*se),Oe=Math.floor(C.image.height*se),Ke=V!==null?V.x:0,Fe=V!==null?V.y:0;Be.setTexture2D(C,0),Y.copyTexSubImage2D(Y.TEXTURE_2D,he,0,0,Ke,Fe,re,Oe),De.unbindTexture()},this.copyTextureToTexture=function(C,V,he=null,se=null,re=0,Oe=0){let Ke,Fe,He,Ze,ut,Mt,qe,Tt,Qt,Ot=C.isCompressedTexture?C.mipmaps[Oe]:C.image;if(he!==null)Ke=he.max.x-he.min.x,Fe=he.max.y-he.min.y,He=he.isBox3?he.max.z-he.min.z:1,Ze=he.min.x,ut=he.min.y,Mt=he.isBox3?he.min.z:0;else{let wt=Math.pow(2,-re);Ke=Math.floor(Ot.width*wt),Fe=Math.floor(Ot.height*wt),C.isDataArrayTexture?He=Ot.depth:C.isData3DTexture?He=Math.floor(Ot.depth*wt):He=1,Ze=0,ut=0,Mt=0}se!==null?(qe=se.x,Tt=se.y,Qt=se.z):(qe=0,Tt=0,Qt=0);let Vt=J.convert(V.format),xn=J.convert(V.type),$e;V.isData3DTexture?(Be.setTexture3D(V,0),$e=Y.TEXTURE_3D):V.isDataArrayTexture||V.isCompressedArrayTexture?(Be.setTexture2DArray(V,0),$e=Y.TEXTURE_2D_ARRAY):(Be.setTexture2D(V,0),$e=Y.TEXTURE_2D),De.activeTexture(Y.TEXTURE0),De.pixelStorei(Y.UNPACK_FLIP_Y_WEBGL,V.flipY),De.pixelStorei(Y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),De.pixelStorei(Y.UNPACK_ALIGNMENT,V.unpackAlignment);let vn=De.getParameter(Y.UNPACK_ROW_LENGTH),_t=De.getParameter(Y.UNPACK_IMAGE_HEIGHT),ri=De.getParameter(Y.UNPACK_SKIP_PIXELS),cn=De.getParameter(Y.UNPACK_SKIP_ROWS),as=De.getParameter(Y.UNPACK_SKIP_IMAGES);De.pixelStorei(Y.UNPACK_ROW_LENGTH,Ot.width),De.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,Ot.height),De.pixelStorei(Y.UNPACK_SKIP_PIXELS,Ze),De.pixelStorei(Y.UNPACK_SKIP_ROWS,ut),De.pixelStorei(Y.UNPACK_SKIP_IMAGES,Mt);let gi=C.isDataArrayTexture||C.isData3DTexture,Fi=V.isDataArrayTexture||V.isData3DTexture;if(C.isDepthTexture){let wt=tt.get(C),sn=tt.get(V),Nn=tt.get(wt.__renderTarget),zt=tt.get(sn.__renderTarget);De.bindFramebuffer(Y.READ_FRAMEBUFFER,Nn.__webglFramebuffer),De.bindFramebuffer(Y.DRAW_FRAMEBUFFER,zt.__webglFramebuffer);for(let jt=0;jt<He;jt++)gi&&(Y.framebufferTextureLayer(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,tt.get(C).__webglTexture,re,Mt+jt),Y.framebufferTextureLayer(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,tt.get(V).__webglTexture,Oe,Qt+jt)),Y.blitFramebuffer(Ze,ut,Ze+Ke,ut+Fe,qe,Tt,qe+Ke,Tt+Fe,Y.DEPTH_BUFFER_BIT,Y.NEAREST);De.bindFramebuffer(Y.READ_FRAMEBUFFER,null),De.bindFramebuffer(Y.DRAW_FRAMEBUFFER,null)}else if(re!==0||C.isRenderTargetTexture||tt.has(C)){let wt=tt.get(C),sn=tt.get(V);De.bindFramebuffer(Y.READ_FRAMEBUFFER,U),De.bindFramebuffer(Y.DRAW_FRAMEBUFFER,K);for(let Nn=0;Nn<He;Nn++)gi?Y.framebufferTextureLayer(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,wt.__webglTexture,re,Mt+Nn):Y.framebufferTexture2D(Y.READ_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_2D,wt.__webglTexture,re),Fi?Y.framebufferTextureLayer(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,sn.__webglTexture,Oe,Qt+Nn):Y.framebufferTexture2D(Y.DRAW_FRAMEBUFFER,Y.COLOR_ATTACHMENT0,Y.TEXTURE_2D,sn.__webglTexture,Oe),re!==0?Y.blitFramebuffer(Ze,ut,Ze+Ke,ut+Fe,qe,Tt,qe+Ke,Tt+Fe,Y.COLOR_BUFFER_BIT,Y.NEAREST):Fi?Y.copyTexSubImage3D($e,Oe,qe,Tt,Qt+Nn,Ze,ut,Ke,Fe):Y.copyTexSubImage2D($e,Oe,qe,Tt,Ze,ut,Ke,Fe);De.bindFramebuffer(Y.READ_FRAMEBUFFER,null),De.bindFramebuffer(Y.DRAW_FRAMEBUFFER,null)}else Fi?C.isDataTexture||C.isData3DTexture?Y.texSubImage3D($e,Oe,qe,Tt,Qt,Ke,Fe,He,Vt,xn,Ot.data):V.isCompressedArrayTexture?Y.compressedTexSubImage3D($e,Oe,qe,Tt,Qt,Ke,Fe,He,Vt,Ot.data):Y.texSubImage3D($e,Oe,qe,Tt,Qt,Ke,Fe,He,Vt,xn,Ot):C.isDataTexture?Y.texSubImage2D(Y.TEXTURE_2D,Oe,qe,Tt,Ke,Fe,Vt,xn,Ot.data):C.isCompressedTexture?Y.compressedTexSubImage2D(Y.TEXTURE_2D,Oe,qe,Tt,Ot.width,Ot.height,Vt,Ot.data):Y.texSubImage2D(Y.TEXTURE_2D,Oe,qe,Tt,Ke,Fe,Vt,xn,Ot);De.pixelStorei(Y.UNPACK_ROW_LENGTH,vn),De.pixelStorei(Y.UNPACK_IMAGE_HEIGHT,_t),De.pixelStorei(Y.UNPACK_SKIP_PIXELS,ri),De.pixelStorei(Y.UNPACK_SKIP_ROWS,cn),De.pixelStorei(Y.UNPACK_SKIP_IMAGES,as),Oe===0&&V.generateMipmaps===!0&&V.mipmapsAutoUpdate===!0&&Y.generateMipmap($e),De.unbindTexture()},this.initRenderTarget=function(C){tt.get(C).__webglFramebuffer===void 0&&Be.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?Be.setTextureCube(C,0):C.isData3DTexture?Be.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?Be.setTexture2DArray(C,0):Be.setTexture2D(C,0),De.unbindTexture()},this.resetState=function(){Q=0,W=0,ge=null,De.reset(),O.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=bt._getDrawingBufferColorSpace(e),t.unpackColorSpace=bt._getUnpackColorSpace()}};var dm={type:"change"},zu={type:"start"},mm={type:"end"},Hc=new Ti,pm=new On,NM=Math.cos(70*an.DEG2RAD),Tn=new L,Zn=2*Math.PI,Bt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ku=1e-6,Gc=class extends ca{constructor(e,t=null){super(e,t),this.state=Bt.NONE,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ms.ROTATE,MIDDLE:Ms.DOLLY,RIGHT:Ms.PAN},this.touches={ONE:bs.ROTATE,TWO:bs.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new L,this._lastQuaternion=new Mn,this._lastTargetPosition=new L,this._quat=new Mn().setFromUnitVectors(e.up,new L(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new eo,this._sphericalDelta=new eo,this._scale=1,this._panOffset=new L,this._rotateStart=new ve,this._rotateEnd=new ve,this._rotateDelta=new ve,this._panStart=new ve,this._panEnd=new ve,this._panDelta=new ve,this._dollyStart=new ve,this._dollyEnd=new ve,this._dollyDelta=new ve,this._dollyDirection=new L,this._mouse=new ve,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=OM.bind(this),this._onPointerDown=UM.bind(this),this._onPointerUp=FM.bind(this),this._onContextMenu=WM.bind(this),this._onMouseWheel=zM.bind(this),this._onKeyDown=HM.bind(this),this._onTouchStart=GM.bind(this),this._onTouchMove=VM.bind(this),this._onMouseDown=BM.bind(this),this._onMouseMove=kM.bind(this),this._interceptControlDown=XM.bind(this),this._interceptControlUp=qM.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Bt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(dm),this.update(),this.state=Bt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Tn.copy(t).sub(this.target),Tn.applyQuaternion(this._quat),this._spherical.setFromVector3(Tn),this.autoRotate&&this.state===Bt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,i=this.maxAzimuthAngle;isFinite(n)&&isFinite(i)&&(n<-Math.PI?n+=Zn:n>Math.PI&&(n-=Zn),i<-Math.PI?i+=Zn:i>Math.PI&&(i-=Zn),n<=i?this._spherical.theta=Math.max(n,Math.min(i,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+i)/2?Math.max(n,this._spherical.theta):Math.min(i,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Tn.setFromSpherical(this._spherical),Tn.applyQuaternion(this._quatInverse),t.copy(this.target).add(Tn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Tn.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new L(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new L(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Tn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Hc.origin.copy(this.object.position),Hc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Hc.direction))<NM?this.object.lookAt(this.target):(pm.setFromNormalAndCoplanarPoint(this.object.up,this.target),Hc.intersectPlane(pm,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ku||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ku||this._lastTargetPosition.distanceToSquared(this.target)>ku?(this.dispatchEvent(dm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Zn/60*this.autoRotateSpeed*e:Zn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Tn.setFromMatrixColumn(t,0),Tn.multiplyScalar(-e),this._panOffset.add(Tn)}_panUp(e,t){this.screenSpacePanning===!0?Tn.setFromMatrixColumn(t,1):(Tn.setFromMatrixColumn(t,0),Tn.crossVectors(this.object.up,Tn)),Tn.multiplyScalar(e),this._panOffset.add(Tn)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let i=this.object.position;Tn.copy(i).sub(this.target);let r=Tn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),i=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=i/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Zn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Zn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Zn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._rotateStart.set(n,i)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panStart.set(n,i)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(i,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Zn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Zn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panEnd.set(n,i)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new ve,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function UM(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function OM(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function FM(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(mm),this.state=Bt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function BM(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ms.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=Bt.DOLLY;break;case Ms.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Bt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Bt.ROTATE}break;case Ms.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Bt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Bt.PAN}break;default:this.state=Bt.NONE}this.state!==Bt.NONE&&this.dispatchEvent(zu)}function kM(s){switch(this.state){case Bt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case Bt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case Bt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function zM(s){this.enabled===!1||this.enableZoom===!1||this.state!==Bt.NONE||(s.preventDefault(),this.dispatchEvent(zu),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(mm))}function HM(s){this.enabled!==!1&&this._handleKeyDown(s)}function GM(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case bs.ROTATE:if(this.enableRotate===!1){this.state=Bt.NONE;break}this._handleTouchStartRotate(s),this.state=Bt.TOUCH_ROTATE;break;case bs.PAN:if(this.enablePan===!1){this.state=Bt.NONE;break}this._handleTouchStartPan(s),this.state=Bt.TOUCH_PAN;break;default:this.state=Bt.NONE}break;case 2:switch(this.touches.TWO){case bs.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=Bt.TOUCH_DOLLY_PAN;break;case bs.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=Bt.TOUCH_DOLLY_ROTATE;break;default:this.state=Bt.NONE}break;default:this.state=Bt.NONE}this.state!==Bt.NONE&&this.dispatchEvent(zu)}function VM(s){switch(this._trackPointer(s),this.state){case Bt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case Bt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case Bt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case Bt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=Bt.NONE}}function WM(s){this.enabled!==!1&&s.preventDefault()}function XM(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function qM(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function gm(s,e=[]){return e.find(t=>t.id===s.id)||e.find(t=>t.kind===s.kind&&t.x===s.x&&t.y===s.y)}function Hu(s,e,t){return e>=s.x&&t>=s.y&&e<s.x+(s.width||1)&&t<s.y+(s.depth||1)}var YM=20,ba=36,KM=1800,ZM=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","slash","arrow","firebolt","magic_missile","heal","generic","sorcerous_burst","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),_m=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","generic","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),$M=new Set(["scorching_ray","ray_of_frost","chromatic_orb","dragons_breath","acid_splash","shatter","thunderwave","burning_hands","divine_spark","guiding_bolt","sacred_flame","generic","sorcerous_burst"]),JM=new Set(["dragons_breath","acid_splash","shatter","thunderwave","burning_hands","preserve_life","turn_undead","magic_missile","scorching_ray"]),nn={},jM={slash:"#fff0c1",arrow:"#f4dcb0",firebolt:"#ff842e",magic_missile:"#80eeff",heal:"#86f3ac",generic:"#e8e0c8",rotting_fist:"#d8b46a",dreadful_glare:"#ffbe3d",sorcerous_burst:"#c9a0ff",life_drain:"#9be07a",turn_undead:"#ffe9a0",touch:"#ffffff",necrotic:"#7d3fb8",draining_swipe:"#c9b8e8",undead:"#9bbf5a",command:"#e8d9a8",buff:"#ffffff",spiritual_weapon:"#bfe0ff",scorching_ray:"#ff842e",ray_of_frost:"#9fdcff",chromatic_orb:"#c9a0ff",dragons_breath:"#ff9a3c",acid_splash:"#b6f06a",shatter:"#c7b6ff",thunderwave:"#c7b6ff",burning_hands:"#ff842e",preserve_life:"#ffe7a3",healing_word:"#c9ffd9",cure_wounds:"#bfffd0",divine_spark:"#ffe9a0",guiding_bolt:"#fff2a8",sacred_flame:"#fff2a8"},xm={fire:"#ff842e",cold:"#9fdcff",lightning:"#fff08a",thunder:"#c7b6ff",acid:"#b6f06a",poison:"#8fd36a",necrotic:"#a07cd8",radiant:"#fff2a8",force:"#b9a4ff",psychic:"#ff9fe0",slashing:"#fff0c1",piercing:"#f4dcb0",bludgeoning:"#e8d8c0"},ym=new L(0,0,1),je=an.clamp;nn.sacred_flame=s=>{let{group:e,mat:t,mesh:n,geo:i,color:r,target:o,releaseAt:a,impactAt:l}=s,c=new We;c.name="sacred-flame-column",e.add(c),c.position.set(o.x,0,o.z);let u=n(c,i.cylinder,t("#fff8d0",.85,!0),0,1.7,0,.12,3.4,.12);u.name="flame-core",n(c,i.cylinder,t(r,.32,!0),0,1.7,0,.3,3.4,.3).name="flame-glow";let f=[];for(let h=0;h<6;h++){let d=h*Math.PI/3,g=n(c,i.cone,t("#ffd877",.7,!0),Math.cos(d)*.2,.45,Math.sin(d)*.2,.09,.8,.09);g.name="flame-petal",g.userData.phase=d,f.push(g)}return(h,{elapsedImpact:d})=>{let g=je((h-a)/Math.max(1,l-a),0,1);c.visible=h>=a&&d<520,c.position.y=(1-g)*(1-g)*3.4-.05;let _=d>0?1+Math.min(d/120,1)*.8-je((d-150)/370,0,1)*1.6:1;c.scale.set(Math.max(.05,_),1,Math.max(.05,_)),f.forEach(p=>{p.scale.y=.8+.35*Math.sin(h*.03+p.userData.phase*3)})}};nn.guiding_bolt=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,impact:u}=s,f=new We;f.name="guiding-comet",e.add(f),n(f,i.sphere,t("#ffffff"),0,0,0,.15).name="comet-head",n(f,i.sphere,t(a,.55,!0),0,0,0,.3).name="comet-glow";let h=[];for(let m=0;m<8;m++){let y=n(e,i.sphere,t(m%2?"#ffe9a0":"#fff6cf",.7-m*.07,!0),0,0,0,.13-m*.012);y.name="comet-tail",h.push(y)}let d=new We;d.name="guiding-mark",u.add(d);let g=n(d,s.own(new Ct(.42,.03,6,32)),t("#ffd75e",.95,!0),0,-.55,0);g.rotation.x=-Math.PI/2;let _=n(d,s.own(new Cn(1)),t("#ffe27a",.95,!0),0,1.05,0,.1,.18,.1),p=m=>{let y=new L().lerpVectors(r,o,je(m,0,1));return y.y+=Math.sin(je(m,0,1)*Math.PI)*.35,y};return(m,{elapsedImpact:y})=>{let v=(m-l)/Math.max(1,c-l);f.visible=v>=0&&v<1,f.position.copy(p(v)),f.children[1].scale.setScalar(.3+.05*Math.sin(m*.05)),h.forEach((M,R)=>{M.visible=v>=0&&v<1.15,M.position.copy(p(v-(R+1)*.045))}),g.rotation.z=y*.004,_.rotation.y=y*.006,_.position.y=1.05+.06*Math.sin(y*.008)}};nn.divine_spark=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,direction:a,color:l,event:c,releaseAt:u,impactAt:f,span:h}=s,d=1+je((2.5-h)/2.5,0,1),_=c.outcome==="heal"?"#9bffb8":l,p=n(e,i.cylinder,t(_,.7,!0),0,0,0,.07,.01,.07);p.name="spark-beam";let m=n(e,i.cylinder,t("#ffffff",.9,!0),0,0,0,.025,.01,.025);m.name="spark-core",p.quaternion.setFromUnitVectors(new L(0,1,0),a),m.quaternion.copy(p.quaternion);let y=new L().crossVectors(a,new L(0,1,0)).normalize(),v=new L().crossVectors(y,a).normalize(),M=[];for(let b=0;b<9;b++){let T=n(e,i.sphere,t(b%2?"#ffffff":_,.9,!0),0,0,0,.055);T.name="spark-helix",T.userData.phase=b/9,M.push(T)}let R=n(e,i.sphere,t(_,.6,!0),r.x,r.y,r.z,.22);R.name="spark-source";let A=new L;return(b,{phase:T})=>{let F=je((b-u)/Math.max(1,f-u),0,1),I=b>=u;for(let G of[p,m,R])G.visible=I;let k=Math.max(.01,h*F);for(let G of[p,m])G.scale.y=k,G.position.copy(r).addScaledVector(a,k/2);p.scale.x=p.scale.z=.07*d*(1+.25*Math.sin(b*.04))*(1-T*.8),R.scale.setScalar(.22*d*(1+.3*Math.sin(b*.05))*(1-T*.7)),M.forEach(G=>{let H=((b-u)/600+G.userData.phase)%1;G.visible=I&&H*h<=k;let U=H*9+b*.012+G.userData.phase*6,K=.2*d*Math.sin(Math.PI*H);A.copy(r).addScaledVector(a,H*h).addScaledVector(y,Math.cos(U)*K).addScaledVector(v,Math.sin(U)*K),G.position.copy(A)})}};nn.cure_wounds=s=>{let{group:e,mat:t,mesh:n,geo:i,target:r,impactAt:o}=s,a=1+.8*je((2.5-s.span)/2.5,0,1),l=new We;l.name="cure-aura",e.add(l),l.position.set(r.x,0,r.z),n(l,i.cylinder,t("#bfffd0",.28,!0),0,.9,0,.42,1.8,.42).name="cure-pillar";let c=[];for(let u=0;u<3;u++){let f=new We;f.name="cure-cross",l.add(f),n(f,i.box,t("#f2ffd8",.95,!0),0,0,0,.14,.04,.04),n(f,i.box,t("#f2ffd8",.95,!0),0,0,0,.04,.14,.04),f.userData.phase=u*2.1,c.push(f)}return u=>{let f=u-o+400;l.visible=f>=0;let h=je(f/1100,0,1);l.children[0].scale.set(.42*a*(.6+h*.4),1.8*a,.42*a*(.6+h*.4)),c.forEach(d=>{let g=f*.005+d.userData.phase;d.position.set(Math.cos(g)*.38*a,.15+h*1.4*a*((d.userData.phase/2.1+1)/3),Math.sin(g)*.38*a),d.scale.setScalar(a),d.rotation.y=-g})}};nn.healing_word=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,own:c}=s,u=je((2.5-s.span)/2.5,0,1),f=1+u,h=[];for(let p=0;p<12;p++){let m=n(e,i.sphere,t(p%3?"#c9ffd9":"#ffffff",.9,!0),0,0,0,.06*f);m.name="word-mote",m.userData.phase=p/12,h.push(m)}let d=c(new Ct(1,.025,6,40)),g=[0,1].map(p=>{let m=n(e,d,t("#dfffe8",.8,!0),r.x,r.y,r.z,.2);return m.name="word-ring",m.userData.delay=p*160,m}),_=new L;return p=>{let m=je((p-a)/Math.max(1,l-a),0,1.2);h.forEach(y=>{let v=je(m-y.userData.phase*.35,0,1);y.visible=p>=a&&v>0&&v<1,_.lerpVectors(r,o,v),_.y+=Math.sin(v*Math.PI)*(.55+u*.9)+.08*Math.sin(p*.02+y.userData.phase*9),y.position.copy(_)}),g.forEach(y=>{let v=je((p-a-y.userData.delay)/500,0,1);y.visible=v>0&&v<1,y.rotation.x=Math.PI/2,y.scale.setScalar((.2+v*.8)*f)})}};nn.preserve_life=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,first:c,own:u}=s,f=[];for(let g=0;g<10;g++){let _=n(e,i.sphere,t(g%2?"#ffe7a3":"#fff9e0",.9,!0),0,0,0,.07);_.name="preserve-mote",_.userData.phase=g/10,f.push(_)}let h=null;if(c){h=new We,h.name="preserve-seal",e.add(h),h.position.set(r.x,.1,r.z);let g=u(new Ct(1,.03,6,48)),_=n(h,g,t("#ffe7a3",.9,!0),0,0,0);_.rotation.x=-Math.PI/2;let p=n(h,g,t("#fff4cf",.9,!0),0,.01,0,.55,.55,.55);p.rotation.x=-Math.PI/2;for(let m=0;m<6;m++){let y=n(h,i.box,t("#fff4cf",.85,!0),0,.02,0,.03,.01,1.1);y.rotation.y=m*Math.PI/6}}let d=new L;return g=>{let _=je((g-a)/Math.max(1,l-a),0,1.3);if(h){let p=je((g-a+150)/900,0,1);h.visible=p>0&&p<1,h.scale.setScalar(1.1+p*1.1),h.rotation.y=g*.004}f.forEach(p=>{let m=je(_-p.userData.phase*.4,0,1);p.visible=g>=a&&m>0&&m<1,d.lerpVectors(r,o,m),d.y+=Math.sin(m*Math.PI)*.45+.1*Math.sin(g*.015+p.userData.phase*12),p.position.copy(d)})}};function vm(s,e){let{group:t,mat:n,mesh:i,geo:r,source:o,area:a,releaseAt:l}=s;if(!a)return null;let c=a.cells.map(([f,h])=>{let d=new We;return d.name=e.name,d.position.set(f,0,h),t.add(d),i(d,r.cone,n(e.edge,.75,!0),0,e.height/2,0,e.width,e.height,e.width),i(d,r.cone,n(e.core,.9,!0),0,e.height*.35,0,e.width*.55,e.height*.7,e.width*.55),{g:d,d:Math.hypot(f-o.x,h-o.z),seed:Math.abs(Math.sin(f*12.9898+h*78.233)*43758.5453)%1}}),u=i(t,r.sphere,n(e.core,.8,!0),o.x,o.y,o.z,.22);return u.name=e.name+"-hand",f=>{for(let h of c){let d=l+h.d*e.speed,g=je((f-d)/260,0,1),_=je((f-d-e.burn)/320,0,1);h.g.visible=g>0&&_<1;let p=g*(1-_),m=1+.25*Math.sin(f*.03+h.seed*20);h.g.scale.set(p,p*m,p),h.g.rotation.y=f*.002+h.seed*6}u.visible=f>=l-100&&f<l+450,u.scale.setScalar(.22*(1+.3*Math.sin(f*.06)))}}nn.burning_hands=s=>vm(s,{name:"burning-flame",edge:"#ff8a2a",core:"#ffe27a",height:.95,width:.3,speed:55,burn:300});nn.thunderwave=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,direction:a,color:l,event:c,area:u,releaseAt:f}=s,h=[];if(u){let d=u.aim[0]-o.x,g=u.aim[1]-o.z,_=Math.abs(d)>=Math.abs(g)?new L(Math.sign(d)||1,0,0):new L(0,0,Math.sign(g)||1),p=u.cells.map(([v,M])=>{let R=i(e,r.box,n("#c7b6ff",0,!0),v,.07,M,.92,.05,.92);return R.name="thunder-tile",{item:R,d:Math.abs((v-o.x)*_.x+(M-o.z)*_.z)}}),m=i(e,r.box,n("#ffffff",.85,!0),0,.5,0,_.x?.12:3,1,_.x?3:.12);m.name="thunder-front";let y=i(e,s.own(new Ct(1,.03,6,40)),n("#e9e0ff",.8,!0),o.x,.12,o.z,.3,.3,.3);y.name="thunder-ring",y.rotation.x=-Math.PI/2,h.push(v=>{let M=je((v-f)/450,0,1);m.visible=M>0&&M<1,m.position.set(o.x+_.x*(.6+M*3),.5,o.z+_.z*(.6+M*3)),m.material.opacity=.85*(1-M*.7),y.visible=M>0&&M<1,y.scale.setScalar(.3+M*2.2),y.material.opacity=.8*(1-M);for(let{item:R,d:A}of p){let b=je((v-f-A*120)/520,0,1);R.visible=b>0&&b<1,R.material.opacity=Math.sin(b*Math.PI)*.55}})}if(c.outcome==="hit"){let d=new We;d.name="thunder-push",t.add(d);let g=a.clone();g.y=0,g.normalize();for(let _=0;_<3;_++){let p=i(d,r.cone,n("#e9e0ff",.9,!0),0,.45,0,.16,.3,.1);p.name="thunder-chevron",p.quaternion.setFromUnitVectors(new L(0,1,0),g),p.userData.i=_}h.push((_,{elapsedImpact:p})=>{d.children.forEach(m=>{let y=je(p/600-m.userData.i*.18,0,1);m.position.set(g.x*(.3+y*.9),.4+m.userData.i*.08,g.z*(.3+y*.9)),m.visible=p>0&&y<1})})}return h.length?(d,g)=>h.forEach(_=>_(d,g)):null};nn.shatter=s=>{let{group:e,mat:t,mesh:n,geo:i,area:r,releaseAt:o,impactAt:a,own:l}=s;if(!r)return null;let[c,u]=r.aim,f=Math.max(...r.cells.map(([v,M])=>Math.hypot(v-c,M-u)))+.6,h=new We;h.name="shatter-burst",h.position.set(c,0,u),e.add(h);let d=l(new Ct(1,.035,6,48)),g=n(h,d,t("#e1d8ff",.9,!0),0,.12,0);g.rotation.x=-Math.PI/2,g.name="shatter-wave";let _=n(h,i.sphere,t("#c7b6ff",.22,!0),0,0,0);_.name="shatter-dome";let p=[];for(let v=0;v<9;v++){let M=v*Math.PI*2/9+.2,R=n(h,i.box,t("#f4f0ff",.9,!0),0,.08,0,.04,.02,1);R.name="shatter-crack",R.userData={a:M,len:f*(.7+.3*Math.abs(Math.sin(v*2.3)))},p.push(R)}let m=l(new Cn(1)),y=[];for(let v=0;v<14;v++){let M=v*2.4,R=n(h,m,t(v%2?"#ffffff":"#c7b6ff",.9,!0),0,0,0,.06,.12,.04);R.name="shatter-shard",R.userData={vx:Math.cos(M)*(.5+v%4*.3),vz:Math.sin(M)*(.5+v%4*.3),vy:2.2+v%3*.8},y.push(R)}return v=>{let M=je((v-o)/520,0,1),R=Math.max(0,v-o);g.visible=_.visible=M>0&&M<1,g.scale.setScalar(.2+M*f),g.material.opacity=.9*(1-M),_.scale.setScalar(.2+M*f),_.scale.y*=.55,_.material.opacity=.22*(1-M);for(let A of p){let b=A.userData.len*je(M*1.6,0,1);A.visible=R>0,A.scale.z=Math.max(.01,b),A.rotation.y=Math.PI/2-A.userData.a,A.position.set(Math.cos(A.userData.a)*b/2,.08,Math.sin(A.userData.a)*b/2)}for(let A of y){let b=R/1e3,{vx:T,vz:F,vy:I}=A.userData;A.visible=R>0&&b<.9,A.position.set(T*b,Math.max(0,I*b-4.2*b*b),F*b),A.rotation.set(b*9,b*7,0)}}};nn.acid_splash=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,area:o,releaseAt:a,impactAt:l,own:c}=s;if(!o)return null;let[u,f]=o.aim,h=new L(u,.3,f),d=new We;d.name="acid-glob",e.add(d),n(d,i.sphere,t("#9be03c",.9),0,0,0,.17).name="acid-core",n(d,i.sphere,t("#d6ff7a",.45,!0),0,0,0,.3);let g=n(e,c(new Wr(1,28)),t("#8fd62e",.7),u,.075,f,.1,.1,.1);g.rotation.x=-Math.PI/2,g.name="acid-puddle";let _=[];for(let y=0;y<12;y++){let v=y*2.4,M=n(e,i.sphere,t(y%2?"#b6f06a":"#e6ffaa",.9),u,.2,f,.06);M.name="acid-drop",M.userData={vx:Math.cos(v)*(.6+y%4*.3),vz:Math.sin(v)*(.6+y%4*.3),vy:1.8+y%3*.5},_.push(M)}let p=[];for(let y=0;y<6;y++){let v=n(e,i.sphere,t("#d6ff7a",.6,!0),u+Math.cos(y*2.1)*.5,.1,f+Math.sin(y*2.1)*.5,.07);v.name="acid-bubble",v.userData.phase=y,p.push(v)}let m=new L;return y=>{let v=je((y-a)/Math.max(1,l-a),0,1),M=y-l;d.visible=y>=a&&v<1,m.lerpVectors(r,h,v),m.y+=Math.sin(v*Math.PI)*.8,d.position.copy(m);let R=je(M/350,0,1);g.visible=M>=0,g.scale.setScalar(.1+R*1.5);for(let A of _){let b=M/1e3,{vx:T,vz:F,vy:I}=A.userData;A.visible=M>=0&&b<.7,A.position.set(u+T*b,Math.max(.08,.2+I*b-4.4*b*b),f+F*b)}for(let A of p){let b=je((M-200-A.userData.phase*90)/600,0,1);A.visible=b>0&&b<1,A.position.y=.1+b*.6,A.scale.setScalar(.07*(1+b*.8))}}};nn.dragons_breath=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,own:a,impactAt:l}=s;if(e.text){let u="#ffb347",f=new We;f.name="breath-scales",t.add(f),f.position.set(o.x,0,o.z);let h=a(new Cn(1)),d=[];for(let g=0;g<10;g++){let _=i(f,h,n(g%2?u:"#fff0c8",.9,!0),0,.2,0,.07,.11,.03);_.name="breath-scale",_.userData.phase=g/10*Math.PI*2,d.push(_)}return i(f,r.cylinder,n(u,.22,!0),0,.8,0,.5,1.6,.5).name="breath-glow",g=>{let _=je((g-l+300)/1200,0,1);f.visible=_>0&&_<1,d.forEach(p=>{let m=p.userData.phase+g*.006,y=(_*1.4+p.userData.phase/8)%1.5;p.position.set(Math.cos(m)*.45,.1+y,Math.sin(m)*.45),p.rotation.y=-m})}}let c=xm[e.damage_type]||"#ff9a3c";return vm(s,{name:"breath-flame",edge:c,core:"#fff4d8",height:1.25,width:.4,speed:45,burn:380})};var Gu=s=>[[0,.62,-.62,.62,-.62][s%5],1.08+s%5*.4];nn.chromatic_orb=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,own:u}=s,f=new We;f.name="chromatic-orb",e.add(f),n(f,i.sphere,t("#ffffff"),0,0,0,.14).name="orb-core",n(f,i.sphere,t(a,.6,!0),0,0,0,.3).name="orb-shell";let h=u(new Ct(1,.05,6,28)),d=n(f,h,t("#ffffff",.9,!0),0,0,0,.36);d.name="orb-ring";let g=n(f,h,t(a,.9,!0),0,0,0,.36);g.name="orb-ring";let _=[];for(let m=0;m<7;m++){let y=n(e,i.sphere,t(a,.65-m*.08,!0),0,0,0,.16-m*.017);y.name="orb-tail",_.push(y)}let p=m=>{let y=new L().lerpVectors(r,o,je(m,0,1));return y.y+=Math.sin(je(m,0,1)*Math.PI)*.3,y};return m=>{let y=(m-l)/Math.max(1,c-l);f.visible=y>=0&&y<1,f.position.copy(p(y)),d.rotation.set(m*.012,m*.007,0),g.rotation.set(m*-.009,0,m*.011),_.forEach((v,M)=>{v.visible=y>=0&&y<1.12,v.position.copy(p(y-(M+1)*.05))})}};nn.ray_of_frost=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:u,impactAt:f,span:h,own:d}=s,g=i(e,r.cylinder,n("#8fd8ff",.7,!0),0,0,0,.06,.01,.06);g.name="frost-beam";let _=i(e,r.cylinder,n("#ffffff",.95,!0),0,0,0,.022,.01,.022);g.quaternion.setFromUnitVectors(new L(0,1,0),l),_.quaternion.copy(g.quaternion);let p=d(new Cn(1)),m=[];for(let v=0;v<10;v++){let M=i(e,p,n(v%2?"#e6f7ff":"#9fdcff",.9,!0),0,0,0,.045,.1,.045);M.name="frost-shard",M.userData.phase=v/10,m.push(M)}let y=[];if(c.outcome==="hit")for(let v=0;v<7;v++){let M=v*Math.PI*2/7,R=i(t,r.cone,n("#c9eeff",.85,!0),Math.cos(M)*.4,-.6,Math.sin(M)*.4,.07,.45,.07);R.name="frost-crystal",R.userData.a=M,R.rotation.z=Math.cos(M)*.3,R.rotation.x=Math.sin(M)*.3,y.push(R)}return(v,{elapsedImpact:M})=>{let R=je((v-u)/Math.max(1,f-u),0,1),A=Math.max(.01,h*R),b=v>=u;for(let T of[g,_])T.visible=b,T.scale.y=A,T.position.copy(o).addScaledVector(l,A/2);g.scale.x=g.scale.z=.06*(1+.3*Math.sin(v*.05)),m.forEach(T=>{let F=((v-u)/450+T.userData.phase)%1;T.visible=b&&F*h<=A,T.position.copy(o).addScaledVector(l,F*h),T.position.y+=Math.sin(F*9+T.userData.phase*20)*.12,T.rotation.set(F*8,F*5,0)}),y.forEach(T=>{let F=je(M/220,0,1);T.scale.set(.07*F,.45*F,.07*F),T.position.y=-.6+.22*F})}};nn.scorching_ray=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,lane:c,releaseAt:u,impactAt:f,span:h,own:d}=s,g=new L().crossVectors(l,new L(0,1,0)).normalize(),_=o.clone().addScaledVector(g,(c-1)*.18);_.y+=c*.06;let p=new We;p.name="scorch-lance",e.add(p);let m=i(p,r.cylinder,n("#ff7a1c",.9,!0),0,0,0,.07,.8,.07);m.rotation.x=Math.PI/2;let y=i(p,r.cylinder,n("#fff4c2",1,!0),0,0,0,.032,.8,.032);y.rotation.x=Math.PI/2;let v=i(p,r.sphere,n("#fff0a0",.9,!0),0,0,.4,.12);p.quaternion.setFromUnitVectors(new L(0,0,1),a.clone().sub(_).normalize());let M=[];for(let b=0;b<8;b++){let T=i(e,r.sphere,n(b%2?"#ffb347":"#ff6a1a",.8,!0),0,0,0,.05);T.name="scorch-spark",T.userData.phase=b,M.push(T)}let R=i(t,d(new Wr(1,20)),n("#2a1a10",.7),0,-.84,0,.45,.45,.45);R.rotation.x=-Math.PI/2,R.name="scorch-mark";let A=new L;return(b,{elapsedImpact:T})=>{let F=je((b-u)/Math.max(1,f-u),0,1);p.visible=b>=u&&F<1,p.position.lerpVectors(_,a,F),M.forEach(I=>{let k=je(F-(I.userData.phase+1)*.04,0,1);I.visible=b>=u&&F<1.15&&k>0,A.lerpVectors(_,a,k),A.y+=Math.sin(b*.05+I.userData.phase*2)*.07,I.position.copy(A)}),R.visible=T>=0,R.scale.setScalar(.2+je(T/200,0,1)*.3)}};nn.spiritual_weapon=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,releaseAt:l,impactAt:c,own:u}=s,f=new We;f.name="spirit-hammer",e.add(f),i(f,r.cylinder,n("#cfe8ff",.9,!0),0,0,0,.04,.5,.04).name="spirit-haft",i(f,r.box,n("#9fd0ff",.85,!0),0,.3,0,.26,.17,.17).name="spirit-head",i(f,r.sphere,n("#e6f4ff",.35,!0),0,.15,0,.42);let h=i(t,u(new Ct(1,.03,6,40)),n("#bfe0ff",.85,!0),0,-.78,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="spirit-ring";let d=i(t,r.box,n("#e6f4ff",.8,!0),0,-.82,0,.7,.02,.05);d.name="spirit-crack";let g=new L;return(_,{elapsedImpact:p})=>{let m=je((_-l)/Math.max(1,c-l),0,1);f.visible=_>=l-150&&p<180,g.lerpVectors(o,a,m),g.y+=Math.sin(m*Math.PI)*.9+(m<.15?m*3:0),f.position.copy(g),f.rotation.set(0,0,-.4-m*1.9);let y=je(p/400,0,1);h.visible=p>=0,h.scale.setScalar(.3+y*.9),d.visible=p>=0,d.scale.set(.7+y*.8,1,1),d.rotation.y=.6}};var QM={bless:{c:"#ffe27a",motes:1},aid:{c:"#8dffa8",crosses:1},shield_of_faith:{c:"#7fb8ff",dome:1},sanctuary:{c:"#f4f0ff",dome:1,motes:1},protection_from_evil_and_good:{c:"#fff0b0",sigil:1},blur:{c:"#bcd8ff",ghosts:1},mirror_image:{c:"#79e6ff",ghosts:1,runes:1},mage_armor:{c:"#65d6ff",dome:1,sigil:1},dodge:{c:"#d8e8f2",sigil:1},dash:{c:"#ffd98a",rings:1},redirect_attack:{c:"#ff9f5a",rings:1},innate_sorcery:{c:"#ff7a3c",flames:1},metamagic:{c:"#d6a8ff",runes:1},action_surge:{c:"#ffe9a0",ghosts:1,flames:1},lesser_restoration:{c:"#b8ffd8",motes:1,crosses:1},command:{c:"#e8d9a8",rings:1},rage:{c:"#ff3b2e",flames:1,rings:1},extend_rage:{c:"#ff3b2e",flames:1},reckless_attack:{c:"#ff9a3c",rings:1}};nn.buff=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,impactAt:a,own:l}=s,c=QM[e.variant]||{c:"#ffffff",motes:1},u=new We;u.name=`buff-${e.variant}`,t.add(u),u.position.set(o.x,0,o.z);let f=l(new Ct(1,.03,6,40)),h=i(u,f,n(c.c,.9,!0),0,.1,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="buff-ring";let d=[],g=(_,p,m={})=>(_.name=`buff-${p}`,Object.assign(_.userData,m),d.push({item:_,kind:p}),_);if(c.motes)for(let _=0;_<10;_++)g(i(u,r.sphere,n(_%2?c.c:"#ffffff",.9,!0),0,0,0,.05),"mote",{phase:_/10});if(c.dome&&g(i(u,r.sphere,n(c.c,.25,!0),0,.6,0,.62,.78,.62),"dome"),c.sigil){let _=new We;u.add(_),_.position.y=.06,i(_,f,n(c.c,.95,!0),0,0,0,.55,.55,.55).rotation.x=-Math.PI/2;for(let p=0;p<6;p++)i(_,r.box,n("#ffffff",.85,!0),0,0,0,.03,.01,1).rotation.y=p*Math.PI/6;g(_,"sigil")}if(c.crosses)for(let _=0;_<3;_++){let p=new We;u.add(p),i(p,r.box,n(c.c,.95,!0),0,0,0,.14,.04,.04),i(p,r.box,n(c.c,.95,!0),0,0,0,.04,.14,.04),g(p,"cross",{phase:_*2.1})}if(c.ghosts)for(let _=0;_<3;_++)g(i(u,r.sphere,n(c.c,.3,!0),0,.6,0,.2,.42,.2),"ghost",{phase:_*2.1});if(c.flames)for(let _=0;_<8;_++)g(i(u,r.cone,n(_%2?"#ffb347":c.c,.85,!0),0,.3,0,.07,.5,.07),"flame",{phase:_/8*Math.PI*2});if(c.runes){let _=l(new Cn(1));for(let p=0;p<6;p++)g(i(u,_,n(p%2?"#ffffff":c.c,.95,!0),0,0,0,.06,.1,.03),"rune",{phase:p/6*Math.PI*2})}if(c.rings)for(let _=0;_<3;_++)g(i(u,f,n(c.c,.9,!0),0,.8,0,.2,.2,.2),"word",{phase:_*.25});return _=>{let p=je((_-a+250)/1100,0,1);u.visible=p>0&&p<1,h.scale.setScalar(.3+p*.75);for(let{item:m,kind:y}of d){let v=m.userData,M=_*.006+(v.phase||0);if(y==="mote")m.position.set(Math.cos(M+v.phase*6)*.4,(p*1.2+v.phase)%1*1.5,Math.sin(M+v.phase*6)*.4);else if(y==="dome")m.scale.set(.62*(.5+p*.6),.78*(.5+p*.6),.62*(.5+p*.6));else if(y==="sigil")m.rotation.y=_*.004;else if(y==="cross")m.position.set(Math.cos(M)*.36,.15+p*1.3*((v.phase/2.1+1)/3),Math.sin(M)*.36),m.rotation.y=-M;else if(y==="ghost")m.position.set(Math.cos(M)*.38*p*2,.6,Math.sin(M)*.38*p*2);else if(y==="flame")m.position.set(Math.cos(v.phase)*.4,.25+p*.5,Math.sin(v.phase)*.4),m.scale.y=.5*(.6+.4*Math.sin(_*.03+v.phase*3))*(1.2-p*.4);else if(y==="rune")m.position.set(Math.cos(M*1.5)*.45,.5+p*.6,Math.sin(M*1.5)*.45),m.rotation.y=M;else if(y==="word"){let R=je(p*1.4-v.phase,0,1);m.visible=R>0&&R<1,m.scale.setScalar(.2+R*.8),m.material.opacity=.9*(1-R)}}}};nn.command=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:u,impactAt:f,own:h}=s,d=h(new Ct(1,.03,6,36)),g=[0,1,2].map(p=>{let m=i(e,d,n(p%2?"#fff0c0":"#e8d9a8",.9,!0),0,0,0,.18,.18,.18);return m.name="command-ring",m.userData.i=p,m.quaternion.setFromUnitVectors(new L(0,0,1),l),m}),_=[];if(c.outcome==="hit")for(let p=0;p<4;p++){let m=p*Math.PI/2,y=i(t,r.cone,n("#fff0c0",.9,!0),Math.cos(m)*.28,1.2,Math.sin(m)*.28,.09,.28,.09);y.name="command-arrow",y.rotation.x=Math.PI,_.push(y)}return(p,{elapsedImpact:m})=>{g.forEach(y=>{let v=je((p-u)/Math.max(1,f-u)-y.userData.i*.18,0,1);y.visible=p>=u&&v>0&&v<1,y.position.lerpVectors(o,a,v),y.scale.setScalar(.18+v*.4)}),_.forEach((y,v)=>{let M=je((m-v*40)/500,0,1);y.visible=m>=0&&M<1,y.position.y=1.2-M*1})}};nn.undead=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,source:o,target:a,impactAt:l,own:c}=s,u=e.variant,f=new We;f.name=`undead-${u}`,t.add(f);let h=u==="stench"?o:a;f.position.set(h.x,0,h.z);let d=[],g=(_,p,m={})=>(_.name=`undead-${p}`,Object.assign(_.userData,m),d.push({item:_,kind:p}),_);if(u==="stench"){for(let _=0;_<9;_++)g(i(f,r.sphere,n(_%2?"#7aa83a":"#a6c85a",.5),0,.3,0,.3),"puff",{phase:_/9*Math.PI*2,r:.5+_%3*.22});g(i(f,r.sphere,n("#8fb84a",.18),0,.45,0,1.2,.6,1.2),"cloud")}else if(u==="paralyzed"){let _=c(new Cn(1));for(let m=0;m<5;m++)g(i(f,_,n("#ffe27a",.95,!0),0,1.1,0,.07,.12,.04),"star",{phase:m/5*Math.PI*2});let p=c(new Ct(1,.03,6,32));g(i(f,p,n("#fff0a0",.9,!0),0,.12,0,.3,.3,.3),"ring")}else if(u==="poisoned")for(let _=0;_<8;_++)g(i(f,r.sphere,n(_%2?"#8fd36a":"#c7f59a",.7,!0),0,.2,0,.06),"bubble",{phase:_/8,a:_*2.4});else if(u==="strength_drain"){let _=c(new Ct(1,.035,6,32));g(i(f,_,n("#d24a4a",.9,!0),0,.12,0,.3,.3,.3),"ring");for(let p=0;p<4;p++){let m=i(f,r.cone,n(p%2?"#ff8a8a":"#d24a4a",.95,!0),(p-1.5)*.18,1.4,0,.07,.2,.07);m.rotation.z=Math.PI,g(m,"drop",{i:p})}}else if(u==="fortitude"){let _=c(new Ct(1,.04,6,32));g(i(f,_,n("#b9d49a",.95,!0),0,.1,0,.3,.3,.3),"ring");for(let p=0;p<8;p++)g(i(f,r.sphere,n(p%2?"#d7e8b8":"#8fa07a",.9),0,.3,0,.07),"pop",{a:p*Math.PI/4})}return _=>{let p=je((_-l+250)/1300,0,1);f.visible=p>0&&p<1;for(let{item:m,kind:y}of d){let v=m.userData;if(y==="puff"){let M=v.r*(.5+p),R=_*.003+v.phase;m.position.set(Math.cos(R)*M,.3+.25*Math.sin(R*2),Math.sin(R)*M),m.scale.setScalar(.3*(.6+p*.7))}else if(y==="cloud")m.scale.set(1.2*(.4+p),.6*(.6+p*.4),1.2*(.4+p));else if(y==="star"){let M=_*.009+v.phase;m.position.set(Math.cos(M)*.38,1+.1*Math.sin(M*3),Math.sin(M)*.38),m.rotation.y=M}else if(y==="ring")m.scale.setScalar(.3+p*.7);else if(y==="bubble"){let M=(p*1.4+v.phase)%1;m.position.set(Math.cos(v.a)*.3*M,.2+M*1.1,Math.sin(v.a)*.3*M)}else if(y==="drop"){let M=je(p*1.6-v.i*.08,0,1);m.position.y=1.4-M*1.1,m.visible=M<1}else if(y==="pop"){let M=je(p*2,0,1);m.position.set(Math.cos(v.a)*.6*M,.3+Math.sin(M*Math.PI)*.5,Math.sin(v.a)*.6*M)}}}};nn.necrotic=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,own:f}=s,h=i(e,f(new zn(.5,.62,28,1,-.9,1.8)),n("#5b2a8a",.95,!0),o.x,o.y,o.z,1,1,1);h.rotation.set(-Math.PI/2,0,-Math.PI/2),h.name="necrotic-arc";let d=[];for(let p=0;p<7;p++){let m=i(t,r.sphere,n(p%2?"#7d3fb8":"#2b1840",.8),0,0,0,.1);m.name="necrotic-wisp",m.userData.a=p*.9,d.push(m)}let g=i(e,r.sphere,n("#7d3fb8",.9,!0),o.x,o.y,o.z,.1);g.name="necrotic-bolt";let _=Math.atan2(l.x,l.z);return(p,{elapsedImpact:m})=>{let y=je((p-c)/Math.max(1,u-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,je(y*.35,0,1)),h.rotation.z=-Math.PI/2+_,h.scale.setScalar(.8+y*.6),g.visible=p>=c&&y<1,g.position.lerpVectors(o,a,y),d.forEach(v=>{let M=je(m/800,0,1);v.visible=m>=0&&M<1,v.position.set(Math.cos(v.userData.a)*.35*M,-.6+M*1.3,Math.sin(v.userData.a)*.35*M),v.scale.setScalar(.1*(1-M*.6))})}};nn.rotting_fist=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,own:f}=s,h=i(e,f(new zn(.45,.72,28,1,-1,2)),n("#dfc280",.9,!0),o.x,o.y,o.z);h.rotation.set(-Math.PI/2,0,-Math.PI/2);let d=Math.atan2(l.x,l.z),g=[];for(let p=0;p<12;p++){let m=i(t,r.sphere,n(p%3===0?"#8c4cd8":"#d8b46a",.85,p%3===0),0,0,0,.065);m.userData={a:p*(Math.PI*2/12),h:p%4*.16},g.push(m)}let _=i(t,f(new Ct(.48,.032,6,36)),n("#9b5ce0",.9,!0),0,-.74,0);return _.rotation.x=-Math.PI/2,(p,{elapsedImpact:m})=>{let y=je((p-c)/Math.max(1,u-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,je(y*.55,0,1)),h.rotation.z=-Math.PI/2+d+(y-.5)*.9;let v=je(m/750,0,1);_.visible=m>=0&&v<1,_.scale.setScalar(.4+v*.9),g.forEach(M=>{M.visible=m>=0&&v<1;let R=M.userData.a+v*4.5;M.position.set(Math.cos(R)*(.25+v*.45),-.55+v*1.2+M.userData.h,Math.sin(R)*(.25+v*.45)),M.scale.setScalar(.07*(1-v*.5))})}};nn.dreadful_glare=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,span:f,own:h}=s,d=new L().crossVectors(l,new L(0,1,0)).normalize(),g=new L(0,1,0),_=[-.07,.07].map(y=>{let v=i(e,r.cylinder,n("#ffbe3d",.88,!0),0,0,0,.036,.01,.036);return v.quaternion.setFromUnitVectors(g,l),v.userData.off=y,v}),p=i(e,r.sphere,n("#ffe680",.95,!0),o.x,o.y+.25,o.z,.22),m=i(t,h(new Ct(.52,.035,6,36)),n("#ffaa2b",.92,!0),0,-.72,0);return m.rotation.x=-Math.PI/2,(y,{elapsedImpact:v})=>{let M=je((y-c)/Math.max(1,u-c),0,1),R=y>=c&&v<420,A=Math.max(.01,f*M);p.visible=R,p.scale.setScalar(.22*(1+.35*Math.sin(y*.05)));for(let T of _)T.visible=R,T.scale.y=A,T.position.copy(o).addScaledVector(l,A/2).addScaledVector(d,T.userData.off),T.position.y+=.22*(1-M*.5);let b=je(v/650,0,1);m.visible=v>=0&&b<1,m.scale.setScalar(.35+b*.95)}};nn.draining_swipe=s=>{let{impact:e,mat:t,mesh:n,geo:i,direction:r,impactAt:o}=s,a=Math.atan2(r.x,r.z),l=[];for(let c=0;c<3;c++){let u=n(e,i.box,t(c===1?"#c9b8e8":"#3a2a52",.95,!0),(c-1)*.16,.1,0,.05,.9,.02);u.name="swipe-streak",u.rotation.z=-.6,u.userData.i=c,l.push(u)}return(c,{elapsedImpact:u})=>{l.forEach(f=>{let h=je((u-f.userData.i*70)/140,0,1);f.visible=u>=f.userData.i*70&&h<=1&&u<700,f.scale.y=.9*h,f.position.y=.55-h*.45,f.rotation.y=a})}};nn.touch=s=>{let{event:e,group:t,impact:n,mat:i,mesh:r,geo:o,source:a,target:l,direction:c,impactAt:u,own:f}=s,h=e.variant,d=new We;d.name=`touch-${h}`,t.add(d),d.position.set(l.x,0,l.z);let g=[],_=(m,y,v={})=>(m.name=`touch-${y}`,Object.assign(m.userData,v),g.push({item:m,kind:y}),m),p=f(new Ct(1,.035,6,32));if(h==="graze"){let m=_(r(d,o.box,i("#fff4d8",.95,!0),0,.7,0,.05,.9,.03),"streak");m.rotation.z=-.7;for(let y=0;y<5;y++)_(r(d,o.sphere,i("#ffd27a",.9,!0),0,.7,0,.04),"spark",{a:y*1.3})}else if(h==="shield")_(r(d,o.sphere,i("#7fb8ff",.35,!0),0,.62,0,.62,.78,.62),"dome"),_(r(d,p,i("#cfe4ff",.95,!0),0,.1,0,.3,.3,.3),"ring");else if(h==="flee"){for(let m=0;m<6;m++)_(r(d,o.sphere,i("#b8b2a4",.55),0,.15,0,.1),"dust",{a:m*1.05});for(let m=0;m<3;m++)_(r(d,o.cone,i("#e8f0ff",.9,!0),0,.5,0,.07,.2,.07),"chevron",{i:m}).quaternion.setFromUnitVectors(new L(0,1,0),new L(c.x,0,c.z).normalize())}else if(h==="second_wind"){for(let m=0;m<6;m++){let y=_(r(d,o.box,i("#ffe9a0",.85,!0),0,0,0,.35,.025,.025),"wind",{phase:m/6*Math.PI*2,h:m});y.name="touch-wind"}_(r(d,o.sphere,i("#ffe27a",.25,!0),0,.6,0,.5,.7,.5),"glow")}else if(h==="dissolve"){_(r(d,p,i("#9a9486",.8),0,.1,0,.3,.3,.3),"ring");for(let m=0;m<12;m++)_(r(d,o.sphere,i(m%2?"#c8c2b2":"#6e6a60",.85),0,.2,0,.06),"ash",{a:m*2.4,phase:m/12})}else if(h==="opportunity"){let m=_(r(d,o.box,i("#ff6e54",.95,!0),0,.72,0,.07,1.05,.04),"streak");m.rotation.z=.65,_(r(d,p,i("#ff8a66",.9,!0),0,.12,0,.35,.35,.35),"ring")}return m=>{let y=je((m-u+250)/(h==="dissolve"?1500:1e3),0,1);d.visible=y>0&&y<1;for(let{item:v,kind:M}of g){let R=v.userData;if(M==="streak")v.scale.y=.9*je(y*4,0,1),v.position.y=.95-je(y*4,0,1)*.5;else if(M==="spark"){let A=je(y*3,0,1);v.position.set(Math.cos(R.a)*.5*A,.7+Math.sin(R.a)*.3*A,Math.sin(R.a)*.5*A)}else if(M==="dome")v.scale.set(.62*(.7+y*.5),.78*(.7+y*.5),.62*(.7+y*.5));else if(M==="ring")v.scale.setScalar(.3+y*.8);else if(M==="dust"){let A=je(y*2,0,1);v.position.set(Math.cos(R.a)*.5*A,.15+A*.2,Math.sin(R.a)*.5*A),v.scale.setScalar(.1+A*.12)}else if(M==="chevron"){let A=je(y*1.8-R.i*.15,0,1);v.position.set(c.x*(.3+A*1.2),.5,c.z*(.3+A*1.2)),v.visible=A<1}else if(M==="wind"){let A=m*.01+R.phase;v.position.set(Math.cos(A)*.42,.1+(y*1.5+R.h*.12)%1*1.3,Math.sin(A)*.42),v.rotation.y=-A+Math.PI/2}else if(M==="glow")v.scale.set(.5*(.5+y),.7*(.5+y),.5*(.5+y));else if(M==="ash"){let A=(y*1.2+R.phase)%1;v.position.set(Math.cos(R.a)*.4*A,.2+A*1.3,Math.sin(R.a)*.4*A),v.scale.setScalar(.06*(1-A*.5))}}}};function Mm({scene:s,units:e,requestRender:t,reducedMotion:n=!1}){let i=new We;i.name="combat-effects",s.add(i);let r=[],o=[],a=[],l=null,c=-1,u=-1,f=!1,h=n,d=!!document.hidden;function g(){for(let I of e.values())for(let k of I.ownMaterials){let G=k.userData.restEmissive;k.emissive.setHex(G?.color??0),k.emissiveIntensity=G?.intensity??0}}function _(I){I.group.removeFromParent();for(let k of I.resources)k.dispose();I.resources.clear()}function p(){for(let I of r)_(I);r.length=0,o.length=0,g()}function m(I){return Number.isSafeInteger(I?.id)&&I.id>=0&&ZM.has(I.style)&&Number.isSafeInteger(I.amount)&&I.amount>=0&&["attack","heal"].includes(I.type)&&["hit","miss","heal"].includes(I.outcome)&&Number.isFinite(I.source?.x)&&Number.isFinite(I.source?.y)&&Number.isFinite(I.target?.x)&&Number.isFinite(I.target?.y)}function y(I,k=performance.now()){if(f||typeof I.encounter_id!="string"||!Number.isInteger(I.revision))return;let G=I.encounter_id;if(G!==l&&a.includes(G)||G===l&&I.revision<=c)return;let H=(Array.isArray(I.effects)?I.effects:[]).filter(W=>Number.isSafeInteger(W?.id)).sort((W,ge)=>W.id-ge.id),U=H.reduce((W,ge)=>Math.max(W,ge.id),-1);if(G!==l){l!==null&&(a.push(l),a.length>8&&a.shift()),p(),l=G,c=I.revision,u=U;return}c=I.revision;let K=[];for(let W of H)W.id>u&&(u=W.id,m(W)&&K.push(W));if(u=Math.max(u,U),d||document.hidden){p();return}let Q=new Map;for(let W of r){let ge=`${W.event.target.x},${W.event.target.y}`;Q.set(ge,(Q.get(ge)||0)+1)}for(let W of o){let ge=`${W.event.target.x},${W.event.target.y}`;Q.set(ge,(Q.get(ge)||0)+1)}K.slice(-ba).forEach((W,ge)=>{let ee=`${W.target.x},${W.target.y}`,de=Q.get(ee)||0;Q.set(ee,de+1);let Me=K.length>1?(ge+de)%5:de%5;o.push({event:W,lane:Me,due:k+ge*85,received:k,first:ge===0||K[ge-1].style!==W.style})}),o.length>ba&&o.splice(0,o.length-ba),o.length&&t()}function v({event:I,lane:k,timing:G,origin:H,first:U},K){let Q=new We;Q.name=`combat-${I.style}-${I.id}`,Object.assign(Q.userData,{effectId:I.id,effectStyle:I.style,effectOutcome:I.outcome,amount:I.amount,sourceId:I.source_id,targetId:I.target_id,reducedMotion:h,source:{...I.source},target:{...I.target}}),i.add(Q);let W=new Set,ge=[],ee=j=>(W.add(j),j),de=ee(new Xs(1,1)),Me=ee(new Ai(1,1,1,8)),Re=ee(new Hs(1,1,8)),nt=ee(new wi(1,1,1)),X=(j,Z=1,J=!1)=>{let O=ee(new _n({color:j,transparent:!0,opacity:Z,depthWrite:!1,side:An,toneMapped:!1,blending:J?js:Ss}));return ge.push({material:O,opacity:Z}),O};function pe(j,Z,J,O,ze,at,we=1,et=we,pt=we){let ke=new tn(Z,J);return ke.position.set(O,ze,at),ke.scale.set(we,et,pt),j.add(ke),ke}let Se=H?new L(...H):new L(I.source.x,.88,I.source.y),Ue=new L(I.target.x,.88,I.target.y),_e=Ue.clone().sub(Se);_e.lengthSq()<.001&&_e.copy(ym),_e.normalize();let me=I.outcome==="miss"?"#d3dbe0":$M.has(I.style)&&xm[I.damage_type]||jM[I.style],Ie=new We;Ie.name="impact",Q.add(Ie),Ie.position.copy(Ue);let xe=I.outcome==="heal",Ne=h?0:G?.releaseAt||0,Qe=h?0:G?.impactAt??(xe?0:I.style==="slash"?220:_m.has(I.style)?300:450),Ye=h?650:xe?1040:Qe+650,rt=null,gt=null,Pt=[],yt=[];if(!h&&I.style==="slash"){gt=new We,gt.name="slash-arc",Q.add(gt),gt.position.copy(Se),gt.rotation.y=Math.atan2(_e.x,_e.z);let j=ee(new zn(.58,1.2,32,1,-.96,1.92)),Z=j.attributes.position;for(let ze=0;ze<Z.count;ze++){let at=Math.atan2(Z.getY(ze),Z.getX(ze));if(Math.hypot(Z.getX(ze),Z.getY(ze))<.9){let et=1.2-.62*Math.sin((at+.96)/1.92*Math.PI);Z.setXYZ(ze,Math.cos(at)*et,Math.sin(at)*et,0)}}Z.needsUpdate=!0;let J=pe(gt,j,X("#fff1c9",.85),0,0,0);J.rotation.set(-Math.PI/2,0,-Math.PI/2);let O=ee(new zn(1.16,1.22,32,1,-.96,1.92));pe(gt,O,X("#ffd27c",.95),0,.012,0).rotation.copy(J.rotation),gt.userData.baseAngle=gt.rotation.y}else if(!h&&!xe&&!_m.has(I.style))if(rt=new We,rt.name=`${I.style}-projectile`,Q.add(rt),rt.position.copy(Se),rt.quaternion.setFromUnitVectors(ym,_e),I.style==="arrow"){let j=pe(rt,Me,X("#c89a60"),0,0,-.18,.028,.76,.028);j.name="arrow-shaft",j.rotation.x=Math.PI/2;let Z=pe(rt,Re,X("#e8f5ee"),0,0,.29,.095,.24,.055);Z.name="arrow-head",Z.rotation.x=Math.PI/2;let J=X("#fff0d1");pe(rt,nt,J,0,0,-.49,.2,.025,.2).name="arrow-fletching",pe(rt,nt,J,0,0,-.49,.025,.2,.2)}else if(I.style==="firebolt"){pe(rt,de,X("#ff651c"),0,0,0,.23,.21,.31).name="firebolt-flame",pe(rt,de,X("#fff0a2"),0,0,.12,.13,.13,.2);let j=pe(rt,Re,X("#ff9b25",.8),0,0,-.29,.2,.58,.2);j.rotation.x=-Math.PI/2;for(let Z=0;Z<7;Z++){let J=pe(rt,de,X(Z%2?"#ffb344":"#ef5221",.65-Z*.065),Math.sin(Z*2.3)*.06,Math.cos(Z*2.3)*.06,-.32-Z*.13,.15-Z*.015);J.name="fire-trail",yt.push(J)}for(let Z=0;Z<6;Z++){let J=pe(rt,de,X("#ffdb79"),0,0,-.15-Z*.13,.032);J.name="fire-spark",Pt.push(J)}}else if(I.style==="sorcerous_burst"){pe(rt,de,X(me,.55,!0),0,0,0,.4,.4,.4).name="burst-shell",pe(rt,de,X("#ffffff"),0,0,0,.19,.19,.19).name="burst-core";let j=ee(new Cn(1));for(let Z=0;Z<4;Z++){let J=pe(rt,j,X(Z%2?"#ffffff":me,.9),.45,0,0,.08,.15,.08);J.name="burst-shard",J.userData.phase=Z*Math.PI/2,Pt.push(J)}for(let Z=0;Z<6;Z++){let J=pe(rt,de,X(me,.6-Z*.08,!0),Math.sin(Z*1.9)*.08,Math.cos(Z*2.7)*.08,-.26-Z*.15,.16-Z*.018);J.name="burst-trail",yt.push(J)}}else{let j=ee(new Cn(1));pe(rt,j,X("#a18aff",.75),0,0,-.04,.22,.19,.42).name="missile-violet-shell",pe(rt,j,X("#a8fbff"),0,0,.12,.12,.1,.3).name="missile-cyan-dart";for(let Z=0;Z<5;Z++){let J=pe(rt,de,X(Z%2?"#ae80ff":"#65deff",.7-Z*.1),0,0,-.33-Z*.17,.1-Z*.014);J.name="missile-trail",yt.push(J)}}rt&&rt.traverse(j=>{j.userData.effectRole="projectile"});let kt=null,ot=null,Ut=null,hn=[],un=new L(0,1,0),Y=Se.distanceTo(Ue);if(!h&&I.style==="life_drain"){ot=pe(Q,Me,X("#3a2652",.85),0,0,0,.05,.01,.05),ot.name="drain-tendril",ot.quaternion.setFromUnitVectors(un,_e),kt=[];for(let j=0;j<10;j++){let Z=pe(Q,de,X(j%2?"#9be07a":"#d2f7b4",.9,!0),0,0,0,.065);Z.name="drain-mote",Z.visible=!1,kt.push({item:Z,phase:j/10,side:(j%3-1)*.2})}}if(!h&&I.style==="turn_undead"&&(ot=pe(Q,Me,X("#ffe9a0",.6,!0),0,0,0,.05,.01,.05),ot.name="turn-ray",ot.quaternion.setFromUnitVectors(un,_e),U)){Ut=new We,Ut.name="turn-sigil",Q.add(Ut),Ut.position.set(Se.x,.1,Se.z);let j=ee(new Ct(1,.025,6,64)),Z=pe(Ut,j,X("#ffe9a0",.9,!0),0,0,0);Z.rotation.x=-Math.PI/2,Z.name="turn-wave";let J=new We;J.name="turn-seal",Ut.add(J);let O=pe(J,j,X("#fff4c8",.95,!0),0,.01,0,.75,.75,.75);O.rotation.x=-Math.PI/2;let ze=pe(J,j,X("#ffd36b",.9,!0),0,.02,0,.5,.5,.5);ze.rotation.x=-Math.PI/2;for(let at=0;at<8;at++){let we=pe(J,nt,X("#fff4c8",.9,!0),0,.015,0,.03,.01,.75);we.rotation.y=at*Math.PI/8}Ut.userData.waveReach=6.2}let lt=new We;lt.name=xe?"second-wind-halo":"impact-burst",Ie.add(lt);let It=ee(new Ct(.49,xe?.035:.025,6,40)),At=pe(lt,It,X(me,.9),0,xe?-.68:0,0);At.rotation.x=-Math.PI/2;let De=xe?pe(lt,It,X("#c1ffd7",.6),0,.15,0):null;De&&(De.rotation.x=-Math.PI/2);let Kt=[];if(I.outcome!=="miss")for(let j=0;j<(xe?8:10);j++){let Z=j*Math.PI*2/(xe?8:10),J=new L(Math.cos(Z),xe?.8:Math.sin(j*2.1)*.45,Math.sin(Z)),O=pe(lt,xe?nt:de,X(j%3?me:xe?"#d5ffe1":"#fff4d4"),0,0,0,xe?.045:.07,xe?.15:.07,xe?.045:.07);Kt.push({item:O,velocity:J})}let tt=document.createElement("canvas");tt.width=384,tt.height=128;let Be=tt.getContext("2d");if(I.style==="turn_undead"&&I.outcome==="hit"){let j=pe(Ie,Me,X("#fff0b0",.22,!0),0,.5,0,.12,2.2,.12);j.name="turn-pillar";let Z=ee(new Cn(1));for(let J=0;J<4;J++){let O=pe(Ie,Z,X("#ffe27a",.95,!0),0,.95,0,.06,.1,.02);O.name="turn-rune",O.userData.phase=J*Math.PI/2,hn.push(O)}}let D=I.text?String(I.text):I.style==="turn_undead"?I.outcome==="miss"?"RESISTS":"TURNED":I.style==="dreadful_glare"?I.outcome==="miss"?"RESISTS GLARE":"FRIGHTENED!":I.outcome==="miss"?"MISS":xe?`+${I.amount}`:`\u2212${(Number(I.amount)||0)+(Number(I.rider)||0)}`,w=!!(I.crit&&I.outcome==="hit");if(w){let j=pe(lt,ee(new Ct(.72,.045,6,40)),X("#ffd95e",.98,!0),0,.05,0);j.rotation.x=-Math.PI/2}Be.font=w?"900 78px system-ui, sans-serif":"800 74px system-ui, sans-serif",Be.textAlign="center",Be.textBaseline="middle",Be.strokeStyle="#0d1a1f",Be.lineWidth=14,Be.lineJoin="round";let te=I.style==="life_drain"&&I.outcome!=="miss"&&I.amount>0,Te=I.outcome==="hit"&&Number(I.rider)>0?`+${I.rider} ${String((I.rider_types||[])[0]||"").toUpperCase()}`.trim():"",oe=I.style==="rotting_fist"&&I.outcome==="hit",ne=w?te?"CRITICAL! \xB7 MAX HP":oe?"CRITICAL! \xB7 CURSED":"CRITICAL!":te?"MAX HP":Te?oe?`${Te} \xB7 CURSED`:Te:oe?"CURSED":"";ne&&(Be.font="800 62px system-ui, sans-serif");let Ae=w?"#ffd95e":me;Be.strokeText(D,192,ne?50:67),Be.fillStyle=Ae,Be.fillText(D,192,ne?50:67),ne&&(Be.font="800 29px system-ui, sans-serif",Be.lineWidth=8,Be.fillStyle=w?"#fff2a6":Ae,Be.strokeText(ne,192,102),Be.fillText(ne,192,102));let ue=ee(new $i(tt));ue.colorSpace=Yt;let le=ee(new ms({map:ue,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1})),Ce=new ks(le);Ce.name="combat-amount",Ce.renderOrder=30,Ce.userData.text=D,Ce.userData.effectRole="label",Ce.position.set(Gu(k)[0],Gu(k)[1],0),Ie.add(Ce),Ce.scale.set(1.9,.64,1);let B={event:I,group:Q,resources:W,fades:ge,source:Se,target:Ue,direction:_e,travel:rt,arc:gt,impact:Ie,burst:lt,halo:At,halo2:De,burstParticles:Kt,label:Ce,textMaterial:le,sparks:Pt,trail:yt,lane:k,start:K,drain:kt,beam:ot,sigil:Ut,runes:hn,span:Y,up:un,impactAt:Qe,releaseAt:Ne,swingDuration:G?180:360,duration:Ye,reduced:h},ye=nn[I.style];return ye&&!h&&(B.custom=ye({event:I,group:Q,impact:Ie,source:Se,target:Ue,direction:_e,color:me,mat:X,mesh:pe,own:ee,fades:ge,geo:{sphere:de,cylinder:Me,cone:Re,box:nt},lane:k,first:U,releaseAt:Ne,impactAt:Qe,duration:Ye,area:I.area||null,span:Se.distanceTo(Ue)})||null),r.push(B),B}function M(I,k,G=600){if(f||d)return!1;g();for(let H=r.length-1;H>=0;H--)I-r[H].start>=r[H].duration&&(_(r[H]),r.splice(H,1));for(;o.length&&I-o[0].received>KM;)o.shift();for(;r.length<YM&&o.length&&o[0].due<=I;)v(o.shift(),I);for(let H of r){let{event:U,travel:K,arc:Q,impact:W,source:ge,target:ee,direction:de,halo:Me,halo2:Re,label:nt}=H,X=I-H.start,pe=X-H.impactAt,Se=je(pe/(H.duration-H.impactAt),0,1);if(W.visible=pe>=0,K){K.visible=X>=H.releaseAt&&X<H.impactAt;let _e=je((X-H.releaseAt)/Math.max(1,H.impactAt-H.releaseAt),0,1);if(K.position.lerpVectors(ge,ee,_e),U.style==="magic_missile"){let me=Math.sin(_e*Math.PI)*(H.lane%2?-.35:.35);K.position.x+=de.z*me,K.position.z-=de.x*me,K.position.y+=Math.sin(_e*Math.PI)*(.2+H.lane*.12)}if(H.sparks.forEach((me,Ie)=>{if(me.userData.phase!==void 0){let xe=X*.014+me.userData.phase,Ne=.48-_e*.14;me.position.set(Math.cos(xe)*Ne,Math.sin(xe)*Ne,0),me.rotation.set(xe,xe*1.3,0);return}me.position.x=Math.sin(X*.02+Ie*2)*.22,me.position.y=Math.cos(X*.016+Ie*2)*.2}),U.style==="sorcerous_burst"){let me=1+.18*Math.sin(X*.03);K.children.forEach(Ie=>{Ie.name==="burst-shell"&&Ie.scale.setScalar(.4*me)})}}if(Q){let _e=X-H.releaseAt;Q.visible=_e>=0&&_e<H.swingDuration,Q.rotation.y=Q.userData.baseAngle+(_e/H.swingDuration-.5)*1.15}if(H.drain){let _e=je((X-H.releaseAt)/Math.max(1,H.impactAt-H.releaseAt),0,1),me=H.beam;me.visible=X>=H.releaseAt,me.scale.y=Math.max(.01,H.span*_e),me.position.copy(ge).addScaledVector(de,H.span*_e/2);for(let{item:Ie,phase:xe,side:Ne}of H.drain){let Qe=((X-H.impactAt)/800+xe)%1;Ie.visible=X>=H.impactAt&&Qe>=0;let Ye=je(Qe,0,1);Ie.position.lerpVectors(ee,ge,Ye),Ie.position.x+=de.z*Ne*Math.sin(Ye*Math.PI),Ie.position.z-=de.x*Ne*Math.sin(Ye*Math.PI),Ie.position.y+=Math.sin(Ye*Math.PI)*.3,Ie.scale.setScalar(.065*(1-Ye*.5))}}if(H.beam&&U.style==="turn_undead"){let _e=H.beam,me=je((X-H.releaseAt)/Math.max(1,H.impactAt-H.releaseAt),0,1);_e.visible=X>=H.releaseAt,_e.scale.set(1,Math.max(.01,H.span*me),1),_e.position.copy(ge).addScaledVector(de,H.span*me/2)}if(H.sigil){let _e=H.sigil,me=Math.max(0,X-H.releaseAt);_e.visible=X>=H.releaseAt;let Ie=_e.getObjectByName("turn-wave"),xe=_e.getObjectByName("turn-seal"),Ne=je(me/Math.max(1,H.impactAt-H.releaseAt+350),0,1);Ie.scale.setScalar(.3+Ne*(_e.userData.waveReach-.3)),xe.rotation.y=me*.004}for(let _e of H.runes){let me=pe*.006+_e.userData.phase;_e.position.set(Math.cos(me)*.45,.95+Se*.5,Math.sin(me)*.45),_e.rotation.y=me}H.custom?.(X,{elapsedImpact:pe,phase:Se});let Ue=1-je((Se-.45)/.55,0,1);for(let{material:_e,opacity:me}of H.fades)_e.opacity=me*Ue;if(Q&&Q.scale.setScalar(.8+Math.min(X/360,1)*.2),W.visible){let _e=U.style==="heal",me=H.reduced?1:U.style==="life_drain"?1.35-Math.min(Se*2.5,1)*.85:.6+Math.min(Se*2.5,1)*.85;if(Me.scale.setScalar(me),Re&&(Re.scale.setScalar(me*.85),Re.position.y=H.reduced?.15:-.4+Se*1.1),H.burstParticles.forEach(({item:xe,velocity:Ne},Qe)=>{xe.position.copy(Ne).multiplyScalar(H.reduced?.4:U.style==="life_drain"?.95-Se*.85:.12+Se*(_e?.65:.85)),_e&&(xe.position.y+=-.35+(H.reduced?0:Se*.65)),xe.scale.setScalar((_e?.065:.075)*(1-Se*.7)),_e?xe.scale.y*=2.4:xe.rotation.set(Qe,Se*2,Qe*.7)}),nt.position.y=Gu(H.lane)[1]+(H.reduced?0:Se*.48),k){let Ne=2*k.position.distanceTo(ee)*Math.tan(an.degToRad(k.fov/2))/Math.max(1,G),Qe=Math.max(.64,Ne*38);nt.scale.set(Qe*3,Qe,1)}H.textMaterial.opacity=Ue;let Ie=e.get(U.target_id);if(U.outcome!=="miss"&&pe<250&&Ie&&Ie.data.x===U.target.x&&Ie.data.y===U.target.y)for(let xe of Ie.ownMaterials){let Ne=(1-pe/250)*1.15;Ne>=xe.emissiveIntensity&&(xe.emissive.set(_e?"#5deba0":U.style==="turn_undead"?"#ffe27a":U.style==="life_drain"?"#7a4cc0":"#ff9a56"),xe.emissiveIntensity=Ne)}}}return r.length>0||o.length>0}function R(I){h!==I&&(h=I,p(),t())}function A(I){d=I,d&&p()}function b(){return{encounterId:l,revision:c,lastSeen:u,active:i.children.length,queued:o.length,activeEffects:i.children.map(I=>({...I.userData})),queuedIds:o.map(({event:I})=>I.id),reducedMotion:h}}function T(){f||(p(),f=!0,i.removeFromParent())}function F(I,k,G,H){if(f||d||document.hidden)return;let U=I.filter(m);U.slice(0,JM.has(U[0]?.style)?12:8).forEach((K,Q)=>{o.push({event:K,lane:Q%5,timing:G,origin:H,first:Q===0,due:k,received:k})}),o.length>ba&&o.splice(0,o.length-ba),t()}return{ingest:y,play:F,tick:M,clear:p,setReducedMotion:R,setHidden:A,getState:b,dispose:T}}function bm(s,e,t){function n(g,_,p,m=s){let y=new We;y.name=g,y.position.set(..._),m.add(y),s.updateWorldMatrix(!0,!0);for(let v of p)y.attach(v);return y}let i=t==="skeleton"?.92:.77,r=n("right-shoulder",[.2,i,0],e.right),o=n("left-shoulder",[-.2,i,0],e.left),a=n("blade-grip",t==="skeleton"?[.12,.8,-.23]:[.33,.66,-.055],e.blade),l=n("bow-grip",[-.36,t==="skeleton"?.83:.065,-.08],e.bow);r.attach(a),o.attach(l);let c=new Ft;c.name="head-anchor",c.position.set(0,1.12,-.1),s.add(c);let u=[r,o,a,l].map(g=>({object:g,rotation:g.rotation.clone(),position:g.position.clone()}));function f(){for(let g of u)g.object.rotation.copy(g.rotation),g.object.position.copy(g.position)}function h(g){a.visible=g==="slash"||t==="fighter"&&!g,l.visible=g==="arrow"||["goblin","skeleton"].includes(t)&&!g}h(null);function d(g,_){f(),h(g);let p=an.clamp(_/280,0,1),m=an.clamp((_-420)/380,0,1);if(g==="slash"){let y=an.clamp((_-280)/140,0,1);r.rotation.x+=(.65*p-2.1*y)*(1-m),r.rotation.z+=(-.55*p+.85*y)*(1-m)}else if(g==="arrow"){let y=p*(1-m);o.rotation.y-=.85*y,o.rotation.x+=.55*y,r.rotation.x+=.8*y,r.rotation.y-=.8*y}else r.rotation.x-=.9*p*(1-m),o.rotation.z-=.35*p*(1-m)}return{right:r,left:o,head:c,blade:a,bow:l,isSkinned:!1,reset:f,equip:h,pose:d,walk(){},idle(){},hit(){},death(){return!1}}}var Vu=280,eb={slash:360,rotting_fist:380,heal:280,turn_undead:520,life_drain:460,dreadful_glare:480,sacred_flame:560},Vc=s=>eb[s]??730,Sm=s=>Math.max(820,Vc(s)+650);function Wu(s,e){if(e===pu)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===ro||e===_a){let t=s.getIndex();if(t===null){let r=[],o=s.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);s.setIndex(r),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}let n=t.count-2,i=[];if(e===ro)for(let r=1;r<=n;r++)i.push(t.getX(0)),i.push(t.getX(r)),i.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(i.push(t.getX(r)),i.push(t.getX(r+1)),i.push(t.getX(r+2))):(i.push(t.getX(r+2)),i.push(t.getX(r+1)),i.push(t.getX(r)));return i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}function Wc(s){let e=new Map,t=new Map,n=s.clone();return Em(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;let r=i,o=e.get(i),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Em(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Em(s.children[n],e.children[n],t)}var ho=class extends Pi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Ju(t)}),this.register(function(t){return new ju(t)}),this.register(function(t){return new Qu(t)}),this.register(function(t){return new cf(t)}),this.register(function(t){return new hf(t)}),this.register(function(t){return new uf(t)}),this.register(function(t){return new tf(t)}),this.register(function(t){return new nf(t)}),this.register(function(t){return new sf(t)}),this.register(function(t){return new rf(t)}),this.register(function(t){return new $u(t)}),this.register(function(t){return new of(t)}),this.register(function(t){return new ef(t)}),this.register(function(t){return new lf(t)}),this.register(function(t){return new af(t)}),this.register(function(t){return new Ku(t)}),this.register(function(t){return new Xc(t,Et.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Xc(t,Et.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new ff(t)})}load(e,t,n,i){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=ns.extractUrlBase(e);o=ns.resolveURL(c,this.path)}else o=ns.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Jr(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Cm){try{o[Et.KHR_BINARY_GLTF]=new df(e)}catch(f){i&&i(f);return}r=JSON.parse(o[Et.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new vf(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let f=this.pluginCallbacks[u](c);f.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[f.name]=f,o[f.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let f=r.extensionsUsed[u],h=r.extensionsRequired||[];switch(f){case Et.KHR_MATERIALS_UNLIT:o[f]=new Zu;break;case Et.KHR_DRACO_MESH_COMPRESSION:o[f]=new pf(r,this.dracoLoader);break;case Et.KHR_TEXTURE_TRANSFORM:o[f]=new mf;break;case Et.KHR_MESH_QUANTIZATION:o[f]=new gf;break;default:h.indexOf(f)>=0&&a[f]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+f+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function tb(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}function ln(s,e,t){let n=s.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var Et={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Ku=class{constructor(e){this.parser=e,this.name=Et.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,u=new it(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],Fn);let f=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new vs(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Ii(u),c.distance=f;break;case"spot":c=new ra(u),c.distance=f,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Oi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},Zu=class{constructor(){this.name=Et.KHR_MATERIALS_UNLIT}getMaterialType(){return _n}extendParams(e,t,n){let i=[];e.color=new it(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Fn),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Yt))}return Promise.all(i)}},$u=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Ju=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(i.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ve(r,r)}return Promise.all(i)}},ju=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(i)}},Qu=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_DISPERSION}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},ef=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(i)}},tf=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_SHEEN}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(t.sheenColor=new it(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Fn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Yt)),n.sheenRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(i)}},nf=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&i.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(i)}},sf=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_VOLUME}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new it().setRGB(r[0],r[1],r[2],Fn),Promise.all(i)}},rf=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_IOR}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},of=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_SPECULAR}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new it().setRGB(r[0],r[1],r[2],Fn),n.specularColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Yt)),Promise.all(i)}},af=class{constructor(e){this.parser=e,this.name=Et.EXT_MATERIALS_BUMP}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&i.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(i)}},lf=class{constructor(e){this.parser=e,this.name=Et.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return ln(this.parser,e,this.name)!==null?Hn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&i.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(i)}},cf=class{constructor(e){this.parser=e,this.name=Et.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},hf=class{constructor(e){this.parser=e,this.name=Et.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},uf=class{constructor(e){this.parser=e,this.name=Et.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},Xc=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=i.byteOffset||0,c=i.byteLength||0,u=i.count,f=i.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,f,h,i.mode,i.filter).then(function(d){return d.buffer}):o.ready.then(function(){let d=new ArrayBuffer(u*f);return o.decodeGltfBuffer(new Uint8Array(d),u,f,h,i.mode,i.filter),d})})}else return null}},ff=class{constructor(e){this.name=Et.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let c of i.primitives)if(c.mode!==fi.TRIANGLES&&c.mode!==fi.TRIANGLE_STRIP&&c.mode!==fi.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let u=c.pop(),f=u.isGroup?u.children:[u],h=c[0].count,d=[];for(let g of f){let _=new ft,p=new L,m=new Mn,y=new L(1,1,1),v=new Zi(g.geometry,g.material,h);for(let R=0;R<h;R++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,R),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,R),l.SCALE&&y.fromBufferAttribute(l.SCALE,R),v.setMatrixAt(R,_.compose(p,m,y));let M=null;for(let R in l)if(R==="_COLOR_0"){let A=l[R];v.instanceColor=new Ki(A.array,A.itemSize,A.normalized)}else if(R!=="TRANSLATION"&&R!=="ROTATION"&&R!=="SCALE"){if(M===null){let b=v.geometry;M=new on,M.name=b.name;for(let T in b.attributes)M.setAttribute(T,b.attributes[T]);for(let T in b.morphAttributes)M.morphAttributes[T]=b.morphAttributes[T];b.index!==null&&M.setIndex(b.index),M.morphTargetsRelative=b.morphTargetsRelative;for(let T of b.groups)M.addGroup(T.start,T.count,T.materialIndex);b.boundingBox!==null&&(M.boundingBox=b.boundingBox.clone()),b.boundingSphere!==null&&(M.boundingSphere=b.boundingSphere.clone()),M.drawRange.start=b.drawRange.start,M.drawRange.count=b.drawRange.count,M.userData=Object.assign({},b.userData),v.geometry=M}let A=l[R];M.setAttribute(R,new Ki(A.array,A.itemSize,A.normalized))}Ft.prototype.copy.call(v,g),this.parser.assignFinalMaterial(v),d.push(v)}return u.isGroup?(u.clear(),u.add(...d),u):d[0]}))}},Cm="glTF",Sa=12,Tm={JSON:1313821514,BIN:5130562},df=class{constructor(e){this.name=Et.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Sa),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Cm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Sa,r=new DataView(e,Sa),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===Tm.JSON){let c=new Uint8Array(e,Sa+o,a);this.content=n.decode(c)}else if(l===Tm.BIN){let c=Sa+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},pf=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Et.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let u in o){let f=yf[u]||u.toLowerCase();a[f]=o[u]}for(let u in e.attributes){let f=yf[u]||u.toLowerCase();if(o[u]!==void 0){let h=n.accessors[e.attributes[u]],d=co[h.componentType];c[f]=d.name,l[f]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(f,h){i.decodeDracoFile(u,function(d){for(let g in d.attributes){let _=d.attributes[g],p=l[g];p!==void 0&&(_.normalized=p)}f(d)},a,c,Fn,h)})})}},mf=class{constructor(){this.name=Et.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),i=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*i,e.offset.x,-e.repeat.x*i,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},gf=class{constructor(){this.name=Et.KHR_MESH_QUANTIZATION}},qc=class extends Ci{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=i-t,f=(n-t)/u,h=f*f,d=h*f,g=e*c,_=g-c,p=-2*d+3*h,m=d-h,y=1-p,v=m-h+f;for(let M=0;M!==a;M++){let R=o[_+M+a],A=o[_+M+l]*u,b=o[g+M+a],T=o[g+M]*u;r[M]=y*R+v*A+p*b+m*T}return r}},nb=new Mn,_f=class extends qc{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return nb.fromArray(r).normalize().toArray(r),r}},fi={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},co={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},wm={9728:dn,9729:bn,9984:Yl,9985:io,9986:tr,9987:hi},Am={33071:ai,33648:Dr,10497:ti},Xu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},yf={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ts={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},ib={CUBICSPLINE:void 0,LINEAR:Os,STEP:Us},qu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function sb(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Ln({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Li})),s.DefaultMaterial}function sr(s,e,t){for(let n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Oi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function rb(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,u=e.length;c<u;c++){let f=e[c];if(f.POSITION!==void 0&&(n=!0),f.NORMAL!==void 0&&(i=!0),f.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);let o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){let f=e[c];if(n){let h=f.POSITION!==void 0?t.getDependency("accessor",f.POSITION):s.attributes.position;o.push(h)}if(i){let h=f.NORMAL!==void 0?t.getDependency("accessor",f.NORMAL):s.attributes.normal;a.push(h)}if(r){let h=f.COLOR_0!==void 0?t.getDependency("accessor",f.COLOR_0):s.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let u=c[0],f=c[1],h=c[2];return n&&(s.morphAttributes.position=u),i&&(s.morphAttributes.normal=f),r&&(s.morphAttributes.color=h),s.morphTargetsRelative=!0,s})}function ob(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function ab(s){let e,t=s.extensions&&s.extensions[Et.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Yu(t.attributes):e=s.indices+":"+Yu(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Yu(s.targets[n]);return e}function Yu(s){let e="",t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function xf(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function lb(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var cb=new ft,vf=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new tb,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?(this.textureLoader=new na(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new oa(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Jr(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return sr(r,a,i),Oi(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,u]of o.children.entries())r(u,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Et.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(ns.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=Xu[i.type],a=co[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new Rn(c,o,l))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=Xu[i.type],c=co[i.componentType],u=c.BYTES_PER_ELEMENT,f=u*l,h=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,_,p;if(d&&d!==f){let m=Math.floor(h/d),y="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count,v=t.cache.get(y);v||(_=new c(a,m*d,i.count*d/u),v=new Bs(_,d/u),t.cache.add(y,v)),p=new ps(v,l,h%d/u,g)}else a===null?_=new c(i.count*l):_=new c(a,h,i.count*l),p=new Rn(_,l,g);if(i.sparse!==void 0){let m=Xu.SCALAR,y=co[i.sparse.indices.componentType],v=i.sparse.indices.byteOffset||0,M=i.sparse.values.byteOffset||0,R=new y(o[1],v,i.sparse.count*m),A=new c(o[2],M,i.sparse.count*l);a!==null&&(p=new Rn(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let b=0,T=R.length;b<T;b++){let F=R[b];if(p.setX(F,A[b*l]),l>=2&&p.setY(F,A[b*l+1]),l>=3&&p.setZ(F,A[b*l+2]),l>=4&&p.setW(F,A[b*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=g}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let h=(r.samplers||{})[o.sampler]||{};return u.magFilter=wm[h.magFilter]||bn,u.minFilter=wm[h.minFilter]||hi,u.wrapS=Am[h.wrapS]||ti,u.wrapT=Am[h.wrapT]||ti,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==dn&&u.minFilter!==bn,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=i.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1,u;if(t.isKTX2Loader===!0&&o.bufferView!==void 0)u=n.getDependency("bufferView",o.bufferView).then(function(h){return new Promise(function(d,g){t.parse(h,d,g)})});else{if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;let d=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");u=Promise.resolve(l).then(function(h){return new Promise(function(d,g){let _=d;t.isImageBitmapLoader===!0&&(_=function(p){let m=new pn(p);m.needsUpdate=!0,d(m)}),t.load(ns.resolveURL(h,r.path),_,void 0,g)})})}let f=u.then(function(h){return c===!0&&a.revokeObjectURL(l),Oi(h,o),h.userData.mimeType=o.mimeType||lb(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=f,f}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Et.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Et.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[Et.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Vr,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Gr,kn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Ln}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[Et.KHR_MATERIALS_UNLIT]){let f=i[Et.KHR_MATERIALS_UNLIT];o=f.getMaterialType(),c.push(f.extendParams(a,r,t))}else{let f=r.pbrMetallicRoughness||{};if(a.color=new it(1,1,1),a.opacity=1,Array.isArray(f.baseColorFactor)){let h=f.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],Fn),a.opacity=h[3]}f.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",f.baseColorTexture,Yt)),a.metalness=f.metallicFactor!==void 0?f.metallicFactor:1,a.roughness=f.roughnessFactor!==void 0?f.roughnessFactor:1,f.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",f.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",f.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=An);let u=r.alphaMode||qu.OPAQUE;if(u===qu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===qu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==_n&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new ve(1,1),r.normalTexture.scale!==void 0)){let f=r.normalTexture.scale;a.normalScale.set(f,f)}if(r.occlusionTexture!==void 0&&o!==_n&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==_n){let f=r.emissiveFactor;a.emissive=new it().setRGB(f[0],f[1],f[2],Fn)}return r.emissiveTexture!==void 0&&o!==_n&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Yt)),Promise.all(c).then(function(){let f=new o(a);return r.name&&(f.name=r.name),Oi(f,r),t.associations.set(f,{materials:e}),r.extensions&&sr(i,f,r),f})}createUniqueName(e){let t=qt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[Et.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Rm(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],u=ab(c),f=i[u];if(f)o.push(f.promise);else{let h;c.extensions&&c.extensions[Et.KHR_DRACO_MESH_COMPRESSION]?h=r(c):h=Rm(new on,c,t),c.mode===fi.TRIANGLE_STRIP?h=h.then(d=>Wu(d,_a)):c.mode===fi.TRIANGLE_FAN&&(h=h.then(d=>Wu(d,ro))),i[u]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let u=o[l].material===void 0?sb(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],f=[];for(let d=0,g=u.length;d<g;d++){let _=u[d],p=o[d],m,y=c[d];if(p.mode===fi.TRIANGLES||p.mode===fi.TRIANGLE_STRIP||p.mode===fi.TRIANGLE_FAN||p.mode===void 0){let v=r.isSkinnedMesh===!0,M=_.hasAttribute("skinIndex")&&_.hasAttribute("skinWeight");v&&M===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=v&&M?new Bo(_,y):new tn(_,y),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(p.mode===fi.LINES)m=new zo(_,y);else if(p.mode===fi.LINE_STRIP)m=new zs(_,y);else if(p.mode===fi.LINE_LOOP)m=new Ho(_,y);else if(p.mode===fi.POINTS)m=new Go(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&ob(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Oi(m,r),p.extensions&&sr(i,m,p),t.assignFinalMaterial(m),f.push(m)}for(let d=0,g=f.length;d<g;d++)t.associations.set(f[d],{meshes:e,primitives:d});if(f.length===1)return r.extensions&&sr(i,f[0],r),f[0];let h=new We;r.extensions&&sr(i,h,r),t.associations.set(h,{meshes:e});for(let d=0,g=f.length;d<g;d++)h.add(f[d]);return h})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new gn(an.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Zs(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Oi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],l=[];for(let c=0,u=o.length;c<u;c++){let f=o[c];if(f){a.push(f);let h=new ft;r!==null&&h.fromArray(r.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new ko(a,l)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let f=0,h=i.channels.length;f<h;f++){let d=i.channels[f],g=i.samplers[d.sampler],_=d.target,p=_.node,m=i.parameters!==void 0?i.parameters[g.input]:g.input,y=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",p)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",y)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(f){let h=f[0],d=f[1],g=f[2],_=f[3],p=f[4],m=[];for(let v=0,M=h.length;v<M;v++){let R=h[v],A=d[v],b=g[v],T=_[v],F=p[v];if(R===void 0)continue;R.updateMatrix&&R.updateMatrix();let I=n._createAnimationTracks(R,A,b,T,F);if(I)for(let k=0;k<I.length;k++)m.push(I[k])}let y=new Ys(r,void 0,m);return Oi(y,i),y})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));let l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let u=c[0],f=c[1],h=c[2];h!==null&&u.traverse(function(d){d.isSkinnedMesh&&d.bind(h,cb)});for(let d=0,g=f.length;d<g;d++)u.add(f[d]);if(u.userData.pivot!==void 0&&f.length>0){let d=u.userData.pivot,g=f[0];u.pivot=new L().fromArray(d),u.position.x-=d[0],u.position.y-=d[1],u.position.z-=d[2],g.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(r.isBone===!0?u=new zr:c.length>1?u=new We:c.length===1?u=c[0]:u=new Ft,u!==c[0])for(let f=0,h=c.length;f<h;f++)u.add(c[f]);if(r.name&&(u.userData.name=r.name,u.name=o),Oi(u,r),r.extensions&&sr(n,u,r),r.matrix!==void 0){let f=new ft;f.fromArray(r.matrix),u.applyMatrix4(f)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!i.associations.has(u))i.associations.set(u,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){let f=i.associations.get(u);i.associations.set(u,{...f})}return i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new We;n.name&&(r.name=i.createUniqueName(n.name)),Oi(r,n),n.extensions&&sr(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,f=l.length;u<f;u++){let h=l[u];h.parent!==null?r.add(Wc(h)):r.add(h)}let c=u=>{let f=new Map;for(let[h,d]of i.associations)(h instanceof kn||h instanceof pn)&&f.set(h,d);return u.traverse(h=>{let d=i.associations.get(h);d!=null&&f.set(h,d)}),f};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){let o=[],a=e.name?e.name:e.uuid,l=[];function c(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}Ts[r.path]===Ts.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(a);let u;switch(Ts[r.path]){case Ts.weights:u=Qi;break;case Ts.rotation:u=es;break;case Ts.translation:case Ts.scale:u=ys;break;default:n.itemSize===1?u=Qi:u=ys;break}let f=i.interpolation!==void 0?ib[i.interpolation]:Os,h=this._getArrayFromAccessor(n);for(let d=0,g=l.length;d<g;d++){let _=new u(l[d]+"."+Ts[r.path],t.array,h,f);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),o.push(_)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=xf(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof es?_f:qc;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function hb(s,e,t){let n=e.attributes,i=new Bn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new L(l[0],l[1],l[2]),new L(c[0],c[1],c[2])),a.normalized){let u=xf(co[a.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new L,l=new L;for(let c=0,u=r.length;c<u;c++){let f=r[c];if(f.POSITION!==void 0){let h=t.json.accessors[f.POSITION],d=h.min,g=h.max;if(d!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(g[2]))),h.normalized){let _=xf(co[h.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;let o=new qn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Rm(s,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(let o in n){let a=yf[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){let o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return bt.workingColorSpace!==Fn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${bt.workingColorSpace}" not supported.`),Oi(s,e),hb(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?rb(s,e.targets,t):s})}var ub=Object.freeze({"models/animated_armor.glb":"13dc51016a1f","models/chruna.glb":"347b288c695a","models/curogana.glb":"180adead51bb","models/elion.glb":"b60f30dc2841","models/ghast.glb":"6371391d8711","models/ghoul.glb":"16aa31da33b2","models/goblin.glb":"f73621e500a9","models/goblin_boss.glb":"5c70d30fc977","models/guy.glb":"9138b31a949e","models/ilyra.glb":"37695163ffe0","models/kobold_warrior.glb":"46cbf51bb710","models/mara.glb":"d88651957ab4","models/mummy.glb":"e5329cfb5594","models/shadow.glb":"2f42b2566caa","models/skeleton.glb":"6a5ab59b8437","models/specter.glb":"a65586d24bca","models/wight.glb":"b16ef52407a4","models/zombie.glb":"f658062129d1","props/brazier.glb":"d1119e0d4198","props/sarcophagus.glb":"983314fb98b3","textures/mausoleum/floor_albedo.webp":"1c6bceb4ea9f","textures/mausoleum/floor_normal.webp":"95326e9be847","textures/mausoleum/floor_orm.webp":"08f8dca1306c","textures/mausoleum/floor_slab_albedo.webp":"414f021986b0","textures/mausoleum/floor_slab_normal.webp":"0767504a141a","textures/mausoleum/floor_slab_orm.webp":"547acec34e68","textures/mausoleum/wall_albedo.webp":"a2b23f4f02ce","textures/mausoleum/wall_normal.webp":"c9bc3bae08fb","textures/mausoleum/wall_orm.webp":"2d0bfec395d4","textures/mausoleum/window_albedo.webp":"60e027194ed3"});function Yc(s){let e=ub[s];return e?`${s}?v=${e}`:s}var rr=Object.freeze({mara:Object.freeze({file:"models/mara.glb",height:1.28,group:"hero",walkSpeed:.96,runSpeed:2.0211}),guy:Object.freeze({file:"models/guy.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),elion:Object.freeze({file:"models/elion.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),ilyra:Object.freeze({file:"models/ilyra.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),curogana:Object.freeze({file:"models/curogana.glb",height:1.27,group:"hero",walkSpeed:.9525,runSpeed:2.0053}),chruna:Object.freeze({file:"models/chruna.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),skeleton:Object.freeze({file:"models/skeleton.glb",height:1.25,group:"undead"}),zombie:Object.freeze({file:"models/zombie.glb",height:1.25,group:"undead"}),ghoul:Object.freeze({file:"models/ghoul.glb",height:1.22,group:"undead"}),ghast:Object.freeze({file:"models/ghast.glb",height:1.36,group:"undead"}),shadow:Object.freeze({file:"models/shadow.glb",height:1.28,group:"undead",ghost:.84,glow:"#2e1952",glowIntensity:.36}),specter:Object.freeze({file:"models/specter.glb",height:1.32,group:"undead",ghost:.74,glow:"#8fc5ff",glowIntensity:.32}),wight:Object.freeze({file:"models/wight.glb",height:1.38,group:"undead",glow:"#1a332b",glowIntensity:.14}),mummy:Object.freeze({file:"models/mummy.glb",height:1.34,group:"undead"}),goblin:Object.freeze({file:"models/goblin.glb",height:.98,group:"monster"}),goblin_boss:Object.freeze({file:"models/goblin_boss.glb",height:1.08,group:"monster"}),animated_armor:Object.freeze({file:"models/animated_armor.glb",height:1.36,group:"monster"}),kobold_warrior:Object.freeze({file:"models/kobold_warrior.glb",height:.94,group:"monster"})}),Im=Object.freeze(Object.keys(rr)),Pm=Object.freeze({goblin_minion:Object.freeze({scale:.9,tint:"#e6edcf"})});function fb(s){if(!s)return null;for(let e of[s.content,String(s.id||"").split("-")[0],s.kind]){let t=String(e||"").toLowerCase();if(Object.hasOwn(Pm,t))return Pm[t]}return null}var db=Object.freeze(["skeleton","zombie","ghoul","ghast","shadow","specter","wight","mummy"]),Kc=5*1024*1024,pb=2e4;function or(s){if(!s)return null;let e=String(s.base_id||"").toLowerCase(),t=String(s.id||"").split("-")[0].toLowerCase(),n=String(s.content||"").toLowerCase(),i=String(s.kind||"").toLowerCase(),r=o=>o.replace(/_l[1-3]$/,"");for(let o of[e,n,t,r(n),r(t),i])if(o){if(Object.hasOwn(rr,o))return o;if(o==="goblin_minion"||o==="goblin_warrior"||o==="vault_goblin")return"goblin";if(o==="vault_skeleton")return"skeleton"}if(s.team==="heroes"){let o=r(e||n||t);return Object.hasOwn(rr,o)?o:i==="mage"||s.model?.base==="mage"?o==="curogana"?"curogana":"ilyra":o==="guy"?"guy":o==="elion"?"elion":o==="chruna"?"chruna":"mara"}return i==="skeleton"?"skeleton":i==="goblin"?"goblin":null}function Sf(s){if(!(s instanceof ArrayBuffer)||s.byteLength<20||s.byteLength>Kc)throw new Error("Model GLB size is invalid.");let e=new DataView(s);if(e.getUint32(0,!0)!==1179937895||e.getUint32(4,!0)!==2||e.getUint32(8,!0)!==s.byteLength)throw new Error("Model GLB header is invalid.");let t=12,n=null;for(;t<s.byteLength;){if(t+8>s.byteLength)throw new Error("Truncated GLB.");let i=e.getUint32(t,!0),r=e.getUint32(t+4,!0);if(i%4||t+8+i>s.byteLength)throw new Error("Truncated GLB chunk.");if(t===12){if(r!==1313821514)throw new Error("GLB must start with JSON.");n=JSON.parse(new TextDecoder().decode(new Uint8Array(s,t+8,i)))}else if(r!==5130562)throw new Error("Unsupported GLB chunk.");t+=i+8}if((function i(r){if(!(!r||typeof r!="object")){if(Object.hasOwn(r,"uri"))throw new Error("GLB must contain no external resource URIs.");Object.values(r).forEach(i)}})(n),n?.asset?.version!=="2.0")throw new Error("Unsupported glTF version.");return n}function Lm(s){let e=new Set,t=new Set;s.traverse(n=>{n.geometry?.dispose(),n.skeleton&&t.add(n.skeleton);for(let i of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(let r of Object.values(i))r?.isTexture&&e.add(r);i.dispose()}}),t.forEach(n=>n.dispose()),e.forEach(n=>{n.dispose(),n.source?.data?.close?.()})}var mb=new Set(["turn_undead","preserve_life","shatter","thunderwave","burning_hands","dragons_breath","acid_splash","dreadful_glare"]),gb=new Set(["slash","slam","rotting_fist","draining_swipe","claw","bite"]);function Mf(s,e,t){for(let i of e){let r=s.getObjectByName(i);if(r)return r}let n=new Ft;return n.position.set(...t),s.add(n),n}function _b(s){let e=2166136261,t=String(s||"");for(let n=0;n<t.length;n++)e=Math.imul(e^t.charCodeAt(n),16777619);return(e>>>0)%1e3/1e3*6.283}function yb(s,e){let t=rr[e];if(!t)throw new Error(`Unknown cast key: ${e}`);let n=s.scene,i={};for(let c of s.animations||[]){i[c.name]=c;let u=c.name.toLowerCase();i[u]||(i[u]=c)}let r=0,o=!1,a=!1;function l(){o&&!r&&!a&&(a=!0,Lm(n))}return{key:e,spec:t,clipNames:Object.keys(i),createInstance(c){if(o)return null;let u=Wc(n);u.name=`cast-${e}`,u.position.y+=.1,u.userData.castKey=e;let f=fb(c),h=f?.scale||1;h!==1&&u.scale.multiplyScalar(h);let d=f?.tint?new it(f.tint):null,g=new Map,_=null,p=null;u.traverse(me=>{if(delete me.userData.unitId,me.name==="Goblin_Blade"&&(_=me),me.name==="Goblin_Bow"&&(p=me),!me.isMesh)return;me.userData.unitId=c.id,me.castShadow=!0,me.receiveShadow=!0;let Ie=xe=>{if(!g.has(xe)){let Ne=xe.clone();"emissiveMap"in Ne&&(Ne.emissiveMap=null),d&&Ne.color&&Ne.color.multiply(d),t.ghost&&(Ne.transparent=!0,Ne.opacity=t.ghost,Ne.depthWrite=!0),t.glow&&Ne.emissive?(Ne.emissive.set(t.glow),Ne.emissiveIntensity=t.glowIntensity||.3,Ne.userData.restEmissive={color:Ne.emissive.getHex(),intensity:Ne.emissiveIntensity}):Ne.emissive&&Ne.emissiveIntensity>0&&(Ne.userData.restEmissive={color:Ne.emissive.getHex(),intensity:Ne.emissiveIntensity}),Ne.needsUpdate=!0,g.set(xe,Ne)}return g.get(xe)};me.material=Array.isArray(me.material)?me.material.map(Ie):Ie(me.material)});let m=new We;m.name="cast-motion",m.add(u);let y=new aa(u),v={};for(let[me,Ie]of Object.entries(i)){let xe=y.clipAction(Ie);xe.setLoop(Ic,1),xe.clampWhenFinished=!0,v[me]=xe}let M=Mf(u,["WeaponR","Weapon.R","HandR","Hand.R","FistR","Fist.R"],[.22,t.height*.56,-.18]),R=Mf(u,["HandL","Hand.L","FistL","Fist.L","LowerArmL"],[-.22,t.height*.56,-.18]),A=Mf(u,["Head","Mummy_Head"],[0,t.height*.84,-.12]),b=_b(c.id),T=140,F=320,I=200,k=!1,G=null,H=0,U=null,K=0,Q=0,W=0;function ge(me,Ie,{instant:xe=!1,clockMs:Ne=null}={}){if(k)return!1;let Qe=v[me]?me:"idle",Ye=v[Qe];if(!Ye)return!1;let rt=Ne!==null?Ne:typeof performance<"u"?performance.now():Date.now(),gt=Ye.getClip().duration||1,Pt=Math.max(0,Math.min(gt-1e-4,Ie)),yt=rt<W-1;!xe&&G&&G!==Qe&&v[G]?.isRunning()?(U&&U!==G&&v[U]&&v[U].stop(),U=G,K=H,Q=rt):xe||U&&(U===Qe||!v[U]?.isRunning())?(U&&U!==Qe&&v[U]&&v[U].stop(),U=null):yt&&U&&(Q=rt),W=rt;let kt=1;if(U&&v[U]){let ot=Math.max(0,Math.min(1,(rt-Q)/T));ot>=1?(v[U].stop(),U=null):kt=ot*ot*(3-2*ot)}for(let[ot,Ut]of Object.entries(v))ot!==Qe&&ot!==U&&Ut.isRunning()&&Ut.stop();if(U&&v[U]){let ot=v[U];ot.isRunning()||ot.reset().play(),ot.enabled=!0,ot.setEffectiveWeight(1-kt),ot.time=K}return Ye.isRunning()||Ye.reset().play(),Ye.enabled=!0,Ye.setEffectiveWeight(kt),Ye.time=Pt,G=Qe,H=Pt,y.update(0),u.updateMatrixWorld(!0),!0}function ee(me){if(_&&p){let Ie=me==="arrow";p.visible=Ie,_.visible=!Ie}}ee(null);function de(){k||(m.position.set(0,0,0),m.rotation.set(0,0,0),ee(null),ge("idle",0,{instant:!0}))}function Me(me,Ie=!1){if(k)return;if(m.position.set(0,0,0),m.rotation.set(0,0,0),Ie&&v.guard){let Ye=v.guard.getClip().duration||.8;ge("guard",Ye*.42,{clockMs:me});return}let xe=v.idle;if(!xe)return;let Ne=Math.max(.2,xe.getClip().duration),Qe=(me*85e-5+b)%Ne;ge("idle",Qe,{clockMs:me})}function Re(me,Ie=!1){if(k)return;let xe=Ie&&v.run?"run":v.walk?"walk":"idle",Ne=v[xe];if(!Ne){m.position.y=.035*Math.abs(Math.sin(me*.012));return}let Qe=Math.max(.2,Ne.getClip().duration),Ye=Ie?t.runSpeed:t.walkSpeed,gt=Ye?1/(Ie?I:F)/Ye:Ie?.0028:.0022,Pt=(me*gt+b*.2)%Qe;ge(xe,Pt,{clockMs:me})}function nt(me,Ie){return me==="arrow"&&v.arrow?"arrow":Ie==="dodge"||me==="dodge"?v.guard?"guard":"idle":gb.has(me)&&v.slash?"slash":me==="necrotic"?v.slash?"slash":"cast":mb.has(me)&&v.cast_area?"cast_area":v.cast?"cast":v.slash?"slash":"idle"}function X(me=null){m.position.set(0,0,0),m.rotation.set(0,0,0),ee(null),ge("idle",0,{clockMs:me})}function pe(me,Ie,xe=null){if(k)return;if(Ie<=0||Ie>=800){X(Ie);return}ee(me);let Ne=nt(me,xe),Qe=v[Ne];if(!Qe){let yt=Math.sin(Math.PI*Ie/800);m.position.z=-.14*yt,m.rotation.x=-.12*yt;return}let Ye=Qe.getClip().duration||.8,rt=Ye*.35,gt=Ye*.56,Pt=Ie<=280?Ie/280*rt:Ie<=420?rt+(Ie-280)/140*(gt-rt):gt+(Ie-420)/380*(Ye-gt);ge(Ne,Pt,{clockMs:Ie})}function Se(me){if(!(k||me<0)){if(me>=380){X(me);return}if(v.hit){let Ie=v.hit.getClip().duration||.5;ge("hit",me/380*Ie,{clockMs:me})}else{let Ie=Math.sin(Math.PI*me/380);m.position.z=.1*Ie,m.rotation.x=.16*Ie}}}function Ue(me=9999){if(k||!v.death)return!1;m.position.set(0,0,0),m.rotation.set(0,0,0);let Ie=v.death.getClip().duration||1,xe=Math.min(Ie-.001,Math.max(0,me/1e3));return ge("death",xe,{clockMs:me}),!0}let _e={right:M,left:R,head:A,blade:M,bow:R,model:u,motion:m,mixer:y,isSkinned:Object.keys(i).length>0,reset:de,equip:ee,idle:Me,walk:Re,pose:pe,hit:Se,death:Ue,dispose(){k||(k=!0,y.stopAllAction(),y.uncacheRoot(u),u.traverse(me=>{me.skeleton&&me.skeleton.dispose()}),g.forEach(me=>me.dispose()),m.removeFromParent(),r--,l())}};return r++,de(),{model:m,rig:_e,height:t.height*h+.1,ownMaterials:[...g.values()],castKey:e}},dispose(){o=!0,l()}}}async function xb(s,e,t){let n=await e(s,{signal:t,redirect:"error",credentials:"same-origin",cache:"force-cache"});if(!n.ok||n.redirected)throw new Error(`Model unavailable (${n.status}).`);if(Number(n.headers.get("content-length"))>Kc)throw new Error("Model exceeds byte limit.");let r=n.body?.getReader();if(!r){let u=await n.arrayBuffer();if(u.byteLength>Kc)throw new Error("Model exceeds byte limit.");return u}let o=[],a=0;try{for(;;){let{value:u,done:f}=await r.read();if(f)break;if(a+=u.byteLength,a>Kc)throw new Error("Model exceeds byte limit.");o.push(u)}}catch(u){throw await r.cancel().catch(()=>{}),u}let l=new Uint8Array(a),c=0;for(let u of o)l.set(u,c),c+=u.byteLength;return l.buffer}async function vb(s,e){Sf(s);let t=new xs;t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i});let n=await new ho(t).parseAsync(s,"");try{return yb(n,e)}catch(i){throw Lm(n.scene),i}}var wa=new Map,Ea=new Map,rs=new Map,Ta=0,Zc=new Set,bf=new Set;function Dm(s){return bf.add(s),()=>bf.delete(s)}function Ef(){return Object.fromEntries(Im.map(s=>[s,rs.get(s)?.status||"unprepared"]))}function Tf(){return Object.fromEntries(db.map(s=>[s,rs.get(s)?.status||"unprepared"]))}function $c(){let s=rs.get("ilyra")||rs.get("curogana");return{status:s?.status||"loaded",url:s?.url||null,error:s?.error||null,cast:Ef(),undead:Tf()}}function Nm(s){let e=or(s);return e&&wa.get(e)?.createInstance(s)||null}function Um(s){let e=or(s);return e?wa.has(e):!1}function wf(s,{pageURL:e=globalThis.location?.href,fetcher:t=globalThis.fetch}={}){if(!Object.hasOwn(rr,s))return Promise.resolve("unknown");if(Ea.has(s))return Ea.get(s);let n;try{if(n=new URL("./"+Yc(rr[s].file),new URL("./",e)),n.origin!==new URL(e).origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported model origin.")}catch(a){rs.set(s,{status:"fallback",error:String(a.message)});let l=Promise.resolve("fallback");return Ea.set(s,l),l}let i=Ta,r=new AbortController;Zc.add(r),rs.set(s,{status:"loading",url:n.href,error:null});let o=(async()=>{let a=setTimeout(()=>r.abort(),pb);try{let l=await xb(n.href,t,r.signal),c=await vb(l,s);if(Ta!==i||r.signal.aborted)return c.dispose(),"disposed";wa.set(s,c),rs.set(s,{status:"loaded",url:n.href,error:null});for(let u of[...bf])try{u(s)}catch{}return"loaded"}catch(l){return Ta===i&&rs.set(s,{status:"fallback",url:n.href,error:String(l.message)}),Ta===i?"fallback":"disposed"}finally{clearTimeout(a),Zc.delete(r)}})();return Ea.set(s,o),o}async function Om(s={}){let e=s.keys?s.keys.filter(t=>Object.hasOwn(rr,t)):Im;return await Promise.all(e.map(t=>wf(t,s))),$c()}function Fm(){Ta++,Zc.forEach(s=>s.abort()),Zc.clear(),wa.forEach(s=>s.dispose()),wa=new Map,Ea=new Map,rs=new Map}var Bm=Object.freeze([{id:"ossuary",label:"Ancient Ossuary",preset:"bone_patrol",moteColor:"#d9d2be"},{id:"catacombs",label:"Mossy Ruin Court",preset:"ghoul_pack",moteColor:"#a8d48a"},{id:"caverns",label:"Frosted Soul Caverns",preset:"haunting",moteColor:"#7be8f2"},{id:"reliquary",label:"Gothic Reliquary",preset:"wights_retinue",moteColor:"#d8c49e"},{id:"sanctum",label:"Obsidian Sanctum",preset:"two_wights",moteColor:"#b98cff"},{id:"crucible",label:"Infernal Crucible",preset:"whole_crypt",moteColor:"#ff8538"},{id:"forged_hall",label:"Dwarven Forged Hall",preset:"vault",moteColor:"#f2be6b"},{id:"mausoleum",label:"Gothic Mausoleum",preset:null,moteColor:"#c48fff"},{id:"mausoleum_crypt",label:"Violet Ossuary",preset:null,moteColor:"#c9a6ff"},{id:"mausoleum_caves",label:"Violet Caverns",preset:null,moteColor:"#b98cff"}]),km=Object.freeze({bone_patrol:"ossuary",ghoul_pack:"catacombs",haunting:"caverns",wights_retinue:"reliquary",two_wights:"sanctum",whole_crypt:"crucible",vault:"forged_hall"}),Mb={vault:"forged_hall",caves:"caverns",pillars:"reliquary",rooms:"ossuary",open:"crucible"},Vn={ossuary:{id:"ossuary",bg:"#090d10",fog:"#090d10",slab:"#14181b",rim:"#786240",frame:"#1e2428",wallCap:"#565852",wallJoint:"#202321",pillarBody:"#62645c",pillarTrim:"#42453f",hemiSky:"#b8c4cf",hemiGround:"#343638",keyColor:"#ffd9a0",fillColor:"#5c7c99",torchColor:"#ff9c42",crystalColor:null,moteColor:"#ded6c1",floorRoughness:.88,floorMetalness:.04,bumpScale:.045},catacombs:{id:"catacombs",bg:"#080e0c",fog:"#080e0c",slab:"#111916",rim:"#526348",frame:"#1a2621",wallCap:"#455046",wallJoint:"#19221b",pillarBody:"#4d584d",pillarTrim:"#333d34",hemiSky:"#a8ccb8",hemiGround:"#29332b",keyColor:"#ffd296",fillColor:"#4c8577",torchColor:"#ff9638",crystalColor:null,moteColor:"#a8d98c",floorRoughness:.72,floorMetalness:.06,bumpScale:.055},caverns:{id:"caverns",bg:"#070e14",fog:"#070e14",slab:"#0f1a22",rim:"#486e78",frame:"#172630",wallCap:"#445863",wallJoint:"#18252e",pillarBody:"#495d69",pillarTrim:"#2f404a",hemiSky:"#a6dce8",hemiGround:"#273842",keyColor:"#cbe6ff",fillColor:"#3ec8d8",torchColor:"#6be4ff",crystalColor:"#56f0ff",moteColor:"#82f0ff",floorRoughness:.64,floorMetalness:.1,bumpScale:.052},reliquary:{id:"reliquary",bg:"#090b11",fog:"#090b11",slab:"#131620",rim:"#8f7244",frame:"#1d212e",wallCap:"#4d5261",wallJoint:"#1b1e29",pillarBody:"#555a6b",pillarTrim:"#7d653e",hemiSky:"#c6cee6",hemiGround:"#2f3240",keyColor:"#ffddab",fillColor:"#6682b8",torchColor:"#ffa247",crystalColor:null,moteColor:"#e6d2ab",floorRoughness:.44,floorMetalness:.16,bumpScale:.032},sanctum:{id:"sanctum",bg:"#090710",fog:"#090710",slab:"#13101d",rim:"#6f528f",frame:"#1d182b",wallCap:"#3e384f",wallJoint:"#161221",pillarBody:"#383347",pillarTrim:"#6c4f8c",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f5d0ff",fillColor:"#7e5ce0",torchColor:"#bf75ff",crystalColor:"#b366ff",moteColor:"#c48fff",floorRoughness:.48,floorMetalness:.2,bumpScale:.042,emissive:"#8f4dff",emissiveIntensity:.55},crucible:{id:"crucible",bg:"#0f0807",fog:"#0f0807",slab:"#1a1110",rim:"#99522c",frame:"#261816",wallCap:"#473936",wallJoint:"#1c1210",pillarBody:"#423533",pillarTrim:"#7d4427",hemiSky:"#e8c2ad",hemiGround:"#38231e",keyColor:"#ffbe7d",fillColor:"#bd4e2b",torchColor:"#ff6e24",crystalColor:"#ff5e1f",moteColor:"#ff8a3d",floorRoughness:.78,floorMetalness:.12,bumpScale:.055,emissive:"#ff5917",emissiveIntensity:.85},forged_hall:{id:"forged_hall",bg:"#0b0e10",fog:"#0b0e10",slab:"#161b1e",rim:"#8a693d",frame:"#22292d",wallCap:"#5c615d",wallJoint:"#222726",pillarBody:"#636964",pillarTrim:"#7d623b",hemiSky:"#d4cfc2",hemiGround:"#383834",keyColor:"#ffd89e",fillColor:"#5b8a96",torchColor:"#ff963b",crystalColor:null,moteColor:"#f0c475",floorRoughness:.8,floorMetalness:.08,bumpScale:.046}},Af=Object.freeze({ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"});Vn.mausoleum={...Vn.reliquary,id:"mausoleum",base:"reliquary",bg:"#0a0710",fog:"#0a0710",slab:"#14101c",rim:"#6f528f",frame:"#1d182b",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f0dcff",fillColor:"#7e5ce0",torchColor:"#bf75ff",moteColor:"#c48fff",flame:Af,veinColor:"rgba(196, 150, 255, 0.22)",inlay:"#6c5a8c",textures:{floor:{albedo:"textures/mausoleum/floor_albedo.webp",normal:"textures/mausoleum/floor_normal.webp",orm:"textures/mausoleum/floor_orm.webp"},floorAlt:{albedo:"textures/mausoleum/floor_slab_albedo.webp",normal:"textures/mausoleum/floor_slab_normal.webp",orm:"textures/mausoleum/floor_slab_orm.webp"},wall:{albedo:"textures/mausoleum/wall_albedo.webp",normal:"textures/mausoleum/wall_normal.webp",orm:"textures/mausoleum/wall_orm.webp"},window:"textures/mausoleum/window_albedo.webp"}};Vn.mausoleum_crypt={...Vn.ossuary,id:"mausoleum_crypt",base:"ossuary",bg:"#0a080e",fog:"#0a080e",rim:"#6a5a7e",hemiSky:"#c4b8dc",hemiGround:"#2c2834",fillColor:"#6e58b8",torchColor:"#b56dff",moteColor:"#c9a6ff",flame:Af};Vn.mausoleum_caves={...Vn.caverns,id:"mausoleum_caves",base:"caverns",bg:"#0a0712",fog:"#0a0712",slab:"#140f1e",rim:"#5e4a7a",frame:"#1b1528",wallCap:"#4a4258",wallJoint:"#1a1524",pillarBody:"#4d4560",pillarTrim:"#342c44",hemiSky:"#c7b6e8",hemiGround:"#2a2238",keyColor:"#e4d2ff",fillColor:"#8a5ee0",torchColor:"#b870ff",crystalColor:"#b366ff",moteColor:"#b98cff",flame:Af,veinColor:"rgba(196, 150, 255, 0.45)"};function zm(s,e){if(e&&e!=="auto"){let n=Mb[e]||e;if(Vn[n])return Vn[n]}if(s?.theme&&Vn[s.theme])return Vn[s.theme];let t=String(s?.family||s?.name||"").toLowerCase();return t.includes("cave")?Vn.caverns:t.includes("pillar")||t.includes("hall")?Vn.reliquary:t.includes("room")?Vn.ossuary:t.includes("open")?Vn.crucible:Vn.forged_hall}function yn(s,e,t=1){let n=Math.imul(s*374761393+e*668265263+t*1442695041,1274126177);return n=(n^n>>>13)>>>0,n%1e4/1e4}function ws(s,e,t,n,i){let r=document.createElement("canvas");r.width=t,r.height=t,i(r.getContext("2d"),t);let o=new $i(r);return n&&(o.colorSpace=Yt),o.wrapS=ti,o.wrapT=ti,o.anisotropy=Math.min(8,s.capabilities.getMaxAnisotropy()),e.add(o),o}function os(s,e,t=.14,n=.08,i=1800){for(let r=0;r<i;r++){let o=Math.floor(yn(r,1,7)*e),a=Math.floor(yn(r,2,13)*e),l=1+r%3,c=1+(r>>1)%3;s.fillStyle=r%2===0?`rgba(0,0,0,${t})`:`rgba(255,255,255,${n})`,s.fillRect(o,a,l,c)}}function di(s,e,t,n,i=1.6){s.strokeStyle=n,s.lineWidth=i,s.lineCap="round";for(let r=0;r<t;r++){let o=yn(r,10,31)*e*.8+e*.1,a=yn(r,20,37)*e*.8+e*.1;s.beginPath(),s.moveTo(o,a);for(let l=0;l<5;l++)o+=(yn(r*7+l,3,41)-.5)*(e*.18),a+=(yn(r*7+l,9,43)-.5)*(e*.18),s.lineTo(o,a);s.stroke()}}function Hm(s,e,t,n){let i=`pbr-floor:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=null,l=ws(e,t,o,!0,h=>{if(h.fillStyle="#1b1e20",h.fillRect(0,0,o,o),r==="ossuary"){h.fillStyle="#5c5a52",h.fillRect(8,8,o-16,o-16);let d=88;h.fillStyle="#252624";for(let[_,p]of[[0,0],[o,0],[0,o],[o,o],[o/2,o/2]])h.beginPath(),h.moveTo(_,p-d),h.lineTo(_+d,p),h.lineTo(_,p+d),h.lineTo(_-d,p),h.closePath(),h.fill(),h.strokeStyle="#191a18",h.lineWidth=6,h.stroke();let g=h.createRadialGradient(o/2,o/2,40,o/2,o/2,o*.68);g.addColorStop(0,"rgba(138,132,118,0.22)"),g.addColorStop(1,"rgba(20,22,20,0.42)"),h.fillStyle=g,h.fillRect(0,0,o,o),os(h,o,.16,.09,2400),di(h,o,5,"rgba(22,22,20,0.65)",2.2),h.strokeStyle="#1c1d1b",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else if(r==="catacombs"){h.fillStyle="#263324",h.fillRect(0,0,o,o);let d=3,g=o/d;for(let _=0;_<d;_++)for(let p=0;p<d;p++){let m=(p+.5)*g+(yn(p,_,3)-.5)*22,y=(_+.5)*g+(yn(p,_,5)-.5)*22,v=g*(.39+yn(p,_,7)*.08),M=g*(.38+yn(p,_,11)*.08),R=62+Math.floor(yn(p,_,17)*24);h.fillStyle=`rgb(${R},${R+5},${R-2})`,h.beginPath();for(let A=0;A<8;A++){let b=A/8*Math.PI*2,T=.88+yn(p*8+A,_,19)*.2,F=m+Math.cos(b)*v*T,I=y+Math.sin(b)*M*T;A===0?h.moveTo(F,I):h.lineTo(F,I)}h.closePath(),h.fill(),h.strokeStyle="rgba(20,28,18,0.85)",h.lineWidth=5,h.stroke()}for(let _=0;_<48;_++){let p=yn(_,4,29)*o,m=yn(_,8,31)*o,y=8+yn(_,2,37)*24,v=h.createRadialGradient(p,m,2,p,m,y);v.addColorStop(0,"rgba(62, 92, 46, 0.55)"),v.addColorStop(1,"rgba(42, 66, 34, 0)"),h.fillStyle=v,h.beginPath(),h.arc(p,m,y,0,Math.PI*2),h.fill()}os(h,o,.18,.07,2200)}else if(r==="caverns"){h.fillStyle="#33434d",h.fillRect(0,0,o,o);for(let d=-o;d<o*2;d+=28)h.fillStyle=d%56===0?"rgba(20,30,38,0.36)":"rgba(130,175,196,0.10)",h.beginPath(),h.moveTo(d,0),h.lineTo(d+18,0),h.lineTo(d-o*.55+18,o),h.lineTo(d-o*.55,o),h.closePath(),h.fill();os(h,o,.16,.08,2e3),di(h,o,7,s.veinColor||"rgba(165, 232, 248, 0.48)",2),di(h,o,5,"rgba(12, 20, 26, 0.72)",3),h.strokeStyle="rgba(18, 28, 36, 0.85)",h.lineWidth=8,h.strokeRect(3,3,o-6,o-6)}else if(r==="reliquary")h.fillStyle="#252833",h.fillRect(0,0,o,o),di(h,o,9,"rgba(195, 202, 222, 0.22)",2.4),di(h,o,6,s.veinColor||"rgba(214, 174, 108, 0.20)",1.5),h.strokeStyle=s.inlay||"#8c6e42",h.lineWidth=5,h.strokeRect(18,18,o-36,o-36),h.strokeStyle="#59462b",h.lineWidth=2,h.strokeRect(28,28,o-56,o-56),os(h,o,.1,.05,1200),h.strokeStyle="#12141c",h.lineWidth=9,h.strokeRect(4,4,o-8,o-8);else if(r==="sanctum"){h.fillStyle="#1e1929",h.fillRect(0,0,o,o);let d=96,g=[[o*.25,o*.25],[o*.75,o*.25],[o*.5,o*.5],[o*.25,o*.75],[o*.75,o*.75]];for(let[_,p]of g){h.fillStyle="#2a2438",h.beginPath();for(let m=0;m<6;m++){let y=m/6*Math.PI*2+Math.PI/6,v=_+Math.cos(y)*d,M=p+Math.sin(y)*d;m===0?h.moveTo(v,M):h.lineTo(v,M)}h.closePath(),h.fill(),h.strokeStyle="#6f4ca8",h.lineWidth=3.5,h.stroke()}os(h,o,.15,.06,1600),h.strokeStyle="#120e1a",h.lineWidth=8,h.strokeRect(4,4,o-8,o-8)}else if(r==="crucible"){h.fillStyle="#2b2220",h.fillRect(0,0,o,o);let d=h.createRadialGradient(o/2,o/2,30,o/2,o/2,o*.65);d.addColorStop(0,"rgba(68,52,48,0.35)"),d.addColorStop(1,"rgba(18,12,10,0.65)"),h.fillStyle=d,h.fillRect(0,0,o,o),os(h,o,.22,.06,2600),di(h,o,6,"rgba(255, 102, 28, 0.78)",3.2),di(h,o,6,"rgba(255, 206, 112, 0.55)",1.3),h.strokeStyle="#170f0d",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else{h.fillStyle="#4e5452",h.fillRect(0,0,o,o),h.strokeStyle="#232726",h.lineWidth=7,h.strokeRect(5,5,o-10,o-10),h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.moveTo(o*.25,o/2),h.lineTo(o*.25,o),h.moveTo(o*.75,o/2),h.lineTo(o*.75,o),h.stroke(),h.fillStyle="#7c633e";for(let[d,g]of[[24,24],[o-24,24],[24,o-24],[o-24,o-24]])h.beginPath(),h.arc(d,g,7,0,Math.PI*2),h.fill();os(h,o,.16,.08,2200),di(h,o,3,"rgba(24,28,27,0.55)",1.8)}}),c=ws(e,t,o,!1,h=>{if(h.fillStyle="#d8d8d8",h.fillRect(0,0,o,o),h.strokeStyle="#181818",h.lineWidth=14,h.strokeRect(5,5,o-10,o-10),r==="catacombs"){let d=o/3;h.lineWidth=10;for(let g=1;g<3;g++)h.beginPath(),h.moveTo(g*d,0),h.lineTo(g*d,o),h.stroke(),h.beginPath(),h.moveTo(0,g*d),h.lineTo(o,g*d),h.stroke()}else r==="forged_hall"&&(h.lineWidth=9,h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.stroke());os(h,o,.22,.18,2600),di(h,o,6,"#141414",3)}),u=ws(e,t,o,!1,h=>{let d=Math.round(s.floorRoughness*255);h.fillStyle=`rgb(${d},${d},${d})`,h.fillRect(0,0,o,o);for(let g=0;g<24;g++){let _=yn(g,5,61)*o,p=yn(g,9,67)*o,m=24+yn(g,3,71)*56,y=h.createRadialGradient(_,p,4,_,p,m),v=r==="catacombs"||r==="caverns"||r==="reliquary";y.addColorStop(0,v?"rgba(45,45,45,0.65)":"rgba(240,240,240,0.35)"),y.addColorStop(1,"rgba(128,128,128,0)"),h.fillStyle=y,h.beginPath(),h.arc(_,p,m,0,Math.PI*2),h.fill()}});s.emissive&&(a=ws(e,t,o,!0,h=>{h.fillStyle="#000000",h.fillRect(0,0,o,o),r==="crucible"?(di(h,o,6,"#ff6a1a",3.4),di(h,o,6,"#ffd27d",1.2)):r==="sanctum"&&(h.strokeStyle="#9d5cff",h.lineWidth=2.6,h.strokeRect(22,22,o-44,o-44),di(h,o,4,"#8b47ff",2))}));let f=new Ln({map:l,bumpMap:c,bumpScale:s.bumpScale,roughnessMap:u,roughness:1,metalness:s.floorMetalness,...a?{emissive:new it("#ffffff"),emissiveMap:a,emissiveIntensity:s.emissiveIntensity}:{}});return n.set(i,f),f}function Gm(s,e,t,n){let i=`pbr-wall:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=(f,h)=>{if(r==="caverns"){f.fillStyle=h?"#9e9e9e":"#32414a",f.fillRect(0,0,o,o);for(let d=0;d<o;d+=34){f.strokeStyle=h?"#202020":"#18232b",f.lineWidth=h?7:5,f.beginPath(),f.moveTo(0,d);for(let g=0;g<=o;g+=48)f.lineTo(g,d+(yn(g,d,83)-.5)*20);f.stroke()}}else if(r==="reliquary"){f.fillStyle=h?"#c8c8c8":"#3a3f4d",f.fillRect(0,0,o,o);for(let d=32;d<o;d+=64)f.fillStyle=h?"#505050":"#282c38",f.fillRect(d-10,36,20,o-72);h||(f.fillStyle="#755c38",f.fillRect(0,24,o,10),f.fillRect(0,o-34,o,10))}else{let d={ossuary:"#4d4c45",catacombs:"#3b453b",sanctum:"#282336",crucible:"#332624",forged_hall:"#454a48"};f.fillStyle=h?"#cccccc":d[r]||"#454a48",f.fillRect(0,0,o,o);let g=r==="sanctum"?3:5,_=o/g;for(let p=0;p<g;p++){let m=p*_,y=p%2*(o/4);if(!h)for(let v=0;v<4;v++){let M=(y+v*(o/2))%o,R=(yn(v,p,97)-.5)*18;f.fillStyle=R>0?`rgba(255,255,255,${R/255})`:`rgba(0,0,0,${-R/255})`,f.fillRect(M,m+3,o/2-4,_-6)}f.strokeStyle=h?"#1a1a1a":r==="crucible"?"#5e2414":"#1b1e1d",f.lineWidth=h?9:6,f.beginPath(),f.moveTo(0,m),f.lineTo(o,m),f.stroke();for(let v of[y+o*.25,y+o*.75]){let M=v%o;f.beginPath(),f.moveTo(M,m),f.lineTo(M,m+_),f.stroke()}}if(!h&&r==="catacombs"){let p=f.createLinearGradient(0,o,0,o*.45);p.addColorStop(0,"rgba(38, 66, 32, 0.72)"),p.addColorStop(1,"rgba(38, 66, 32, 0)"),f.fillStyle=p,f.fillRect(0,o*.45,o,o*.55)}}if(os(f,o,.18,.08,2e3),!h){let d=f.createLinearGradient(0,o,0,o*.78);d.addColorStop(0,"rgba(0,0,0,0.48)"),d.addColorStop(1,"rgba(0,0,0,0)"),f.fillStyle=d,f.fillRect(0,o*.78,o,o*.22)}},l=ws(e,t,o,!0,f=>a(f,!1)),c=ws(e,t,o,!1,f=>a(f,!0)),u=new Ln({map:l,bumpMap:c,bumpScale:.05,roughness:.84,metalness:.06});return n.set(i,u),u}function Vm(s,e){let n=ws(s,e,256,!0,r=>{r.fillStyle="#5c402b",r.fillRect(0,0,256,256);for(let o=0;o<110;o++){let a=o*29%256;r.strokeStyle=o%3===0?"rgba(22,13,8,0.45)":"rgba(130,94,62,0.25)",r.lineWidth=1+o%3,r.beginPath(),r.moveTo(0,a),r.bezierCurveTo(76.8,a+6,179.2,a-7,256,a+1),r.stroke()}r.strokeStyle="rgba(14,8,5,0.68)",r.lineWidth=3;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke()}),i=ws(s,e,256,!1,r=>{r.fillStyle="#c4c4c4",r.fillRect(0,0,256,256),r.strokeStyle="#222222",r.lineWidth=4;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke();for(let o=0;o<90;o++){let a=o*31%256;r.strokeStyle="#777777",r.lineWidth=1.2,r.beginPath(),r.moveTo(0,a),r.lineTo(256,a+2),r.stroke()}});return{map:n,bump:i}}var bb=2*1024*1024,Sb=3*1024*1024,Eb=15e3,Rf=new Map,Cf=new Map;function Tb(s,e=globalThis.location?.href){let t=new URL("./",e),n=new URL(s,t);if(n.origin!==t.origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported asset origin.");return n.href}async function Wm(s,e,t){let n=new AbortController,i=setTimeout(()=>n.abort(),Eb);try{let r=await fetch(Tb(Yc(s)),{signal:n.signal,redirect:"error",credentials:"same-origin",cache:"default"});if(!r.ok||r.redirected)throw new Error(`asset ${r.status}`);let o=String(r.headers.get("content-type")||"").split(";")[0].trim();if(t&&!t.includes(o))throw new Error(`asset type ${o}`);if(Number(r.headers.get("content-length"))>e)throw new Error("asset too large");let l=await r.arrayBuffer();if(l.byteLength>e)throw new Error("asset too large");return{buffer:l,type:o}}finally{clearTimeout(i)}}function wb(s){return Rf.has(s)||Rf.set(s,(async()=>{try{let{buffer:e,type:t}=await Wm(s,bb,["image/webp","image/png"]);return await createImageBitmap(new Blob([e],{type:t}),{imageOrientation:"flipY"})}catch{return null}})()),Rf.get(s)}async function Aa(s,{srgb:e=!1,repeat:t=!0,anisotropy:n=4}={}){let i=await wb(s);if(!i)return null;let r=new pn(i);return r.flipY=!1,e&&(r.colorSpace=Yt),t&&(r.wrapS=r.wrapT=ti),r.anisotropy=n,r.needsUpdate=!0,r}async function Jc(s,e,t,{anisotropy:n=4}={}){if(!e||!s)return!1;let[i,r,o]=await Promise.all([Aa(e.albedo,{srgb:!0,anisotropy:n}),e.normal?Aa(e.normal,{anisotropy:n}):null,e.orm?Aa(e.orm,{anisotropy:n}):null]);if(!i)return[r,o].forEach(a=>a?.dispose()),!1;for(let a of[i,r,o])a&&t(a);return s.map=i,s.color?.set?.("#ffffff"),r&&(s.normalMap=r,s.normalScale=new ve(.9,.9),s.bumpMap=null),o&&(s.aoMap=o,s.aoMapIntensity=.85,s.roughnessMap=o,s.metalnessMap=o,s.roughness=1,s.metalness=1),s.emissiveMap=null,s.needsUpdate=!0,!0}function Xm(s){return Cf.has(s)||Cf.set(s,(async()=>{try{let{buffer:e}=await Wm(s,Sb,["model/gltf-binary","application/octet-stream"]);Sf(e);let t=new xs;return t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i}),(await new ho(t).parseAsync(e,"")).scene}catch{return null}})()),Cf.get(s)}function Ab(s,e,t){let n=(e-s+Math.PI)%(Math.PI*2)-Math.PI;return n<-Math.PI&&(n+=Math.PI*2),s+n*t}function Rb(s){try{let e=s.getExtension("WEBGL_debug_renderer_info"),t=String(e?s.getParameter(e.UNMASKED_RENDERER_WEBGL):s.getParameter(s.RENDERER));return/swiftshader|llvmpipe|software|softpipe|basic render/i.test(t)?"low":"high"}catch{return"high"}}var Cb=1e3/30;function Pb({container:s,onCell:e,onHover:t,onCameraChange:n,onReady:i,onUnavailable:r,idleAnimation:o=!1}={}){if(!s)throw new Error("A tabletop container is required.");let a=document.createElement("canvas");a.dataset.emberScene="webgl",a.dataset.renderer="webgl",a.setAttribute("aria-label","3D tabletop. Drag to orbit, pinch or scroll to zoom.");let l,c=a.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"});if(!c)throw r?.("WebGL 2 is unavailable on this device."),new Error("WebGL 2 is unavailable on this device.");try{l=new Bc({canvas:a,context:c,antialias:!0})}catch(x){throw r?.("The 3D tabletop could not initialize."),x}let u=Rb(c),f=u==="low"?1:2;l.setPixelRatio(Math.min(window.devicePixelRatio||1,f)),l.outputColorSpace=Yt,l.toneMapping=ha,l.toneMappingExposure=1.26,l.shadowMap.enabled=!0,l.shadowMap.type=$s,l.shadowMap.autoUpdate=!1,l.shadowMap.needsUpdate=!0,s.appendChild(a),s.dataset.renderer="webgl";let h=new Uo;h.background=new it("#111a1f"),h.fog=new No("#111a1f",29,76);let d=new gn(38,1,.1,140),g=new Gc(d,a);g.enableDamping=!1,g.minPolarAngle=.04,g.maxPolarAngle=1.46,g.minDistance=2.1,g.maxDistance=42,g.screenSpacePanning=!1,g.panSpeed=.72,g.rotateSpeed=.72,g.zoomSpeed=.9;let _=window.matchMedia?.("(prefers-reduced-motion: reduce)"),p=!!_?.matches,m=!!o&&!p,y="smart",v=null,M=new We,R=new We,A=new We,b=new We,T=new We,F=new We;h.add(M,R,b,T,F,A);let I=new _n({visible:!1}),k=new ia("#dcefeb","#59616b",2.15);h.add(k);let G=new vs("#ffe0ad",3.45);G.position.set(-5,13,7),G.castShadow=!0,G.shadow.mapSize.set(u==="low"?1024:2048,u==="low"?1024:2048),Object.assign(G.shadow.camera,{left:-12,right:12,top:11,bottom:-11,near:.5,far:55}),G.shadow.normalBias=.03,G.shadow.bias=-2e-4,h.add(G,G.target);let H=new vs("#62b8c9",1.35);H.position.set(8,5,-6),h.add(H);let U=new Map,K=new Map,Q=new Set,W=new Map,ge=[],ee=[],de=[],Me="forged_hall",Re=null,nt="",X=10,pe=8,Se=!1,Ue=!1,_e=0,me=!1,Ie=!1,xe=null,Ne=new Set,Qe=new la,Ye=new ve,rt=new On(new L(0,1,0),-.025),gt=new L,Pt=new L,yt=new Ft,kt=Mm({scene:h,units:W,requestRender:fn,reducedMotion:p}),ot=null,Ut=null,hn=!1,un=new L(.54,.92,1.13).normalize(),Y=!1,lt=null,It="",At=null,De=!0,Kt=!0,tt=!1,Be=null,D="tactical",w=null,te=null,Te=[];function oe(x,S){return U.has(x)||U.set(x,S()),U.get(x)}let ne=oe("box",()=>new wi(1,1,1)),Ae=oe("sphere",()=>new Xs(1,2)),ue=oe("cone",()=>new Hs(1,1,12)),le=oe("cylinder",()=>new Ai(1,1,1,16)),Ce=oe("robe",()=>new Ai(.56,1,1,12)),B=oe("ring",()=>new zn(.37,.425,48)),ye=oe("active-ring",()=>new zn(.435,.495,48)),j=oe("plane",()=>new qs(1,1));function Z(x,S=0,P=.8){let E=`${x}:${S}:${P}`;return K.has(E)||K.set(E,new Ln({color:x,metalness:S,roughness:P,flatShading:!1})),K.get(E)}function J(x,S=1){let P=`glow:${x}:${S}`;return K.has(P)||K.set(P,new _n({color:x,transparent:S<1,opacity:S,depthWrite:S===1,side:An})),K.get(P)}function O(x,S,P,E,N,z,$=1,q=$,ce=$){let ae=new tn(S,P);return ae.position.set(E,N,z),ae.scale.set($,q,ce),ae.castShadow=!0,ae.receiveShadow=!0,x.add(ae),ae}function ze(x,S,P,E){let N=O(x,S,P,0,E,0);return N.rotation.x=-Math.PI/2,N.castShadow=!1,N}function at(x,S=256,P=256){let E=document.createElement("canvas");E.width=S,E.height=P,x(E.getContext("2d"),S,P);let N=new $i(E);return N.colorSpace=Yt,N.anisotropy=Math.min(8,l.capabilities.getMaxAnisotropy()),Q.add(N),N}let we=at((x,S,P)=>{let E=x.createRadialGradient(S/2,P/2,6,S/2,P/2,S/2);E.addColorStop(0,"rgba(0,0,0,.74)"),E.addColorStop(1,"rgba(0,0,0,0)"),x.fillStyle=E,x.fillRect(0,0,S,P)},64,64),et=new _n({map:we,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1});K.set("contact",et);function pt(x){x.traverse(S=>{S.isInstancedMesh&&S.dispose()}),x.clear()}function ke(x,S,P,E,N=.025){let z=new L(...P),$=new L(...E),q=$.clone().sub(z),ce=O(x,le,S,...z.clone().add($).multiplyScalar(.5).toArray(),N,q.length(),N);return ce.quaternion.setFromUnitVectors(new L(0,1,0),q.normalize()),ce}let Dt=Vm(l,Q);function Jt(x){let S=`wood:${x}`;return K.has(S)||K.set(S,new Ln({color:x,map:Dt.map,bumpMap:Dt.bump,bumpScale:.036,roughness:.84,metalness:.04})),K.get(S)}function pi(x,S,P,E,N,z,$,q){let ce=Z(q,.06,.76),ae=Z("#cfc09b",0,.9);O(x,ne,ae,S,P,E,N*.8,z*.89,$*.92);for(let ie of[-1,1])O(x,ne,ce,S+ie*N*.46,P,E,N*.09,z,$);O(x,ne,ce,S,P,E-$*.48,N,z,$*.08)}function Ra(x,S,P,E){O(x,le,Z("#8f6f40",.78,.36),S,P+.014,E,.105,.028,.105),O(x,le,Z("#ddd0ae",0,.65),S,P+.11,E,.047,.18,.047);let N=O(x,ue,J("#ffc15d"),S,P+.248,E,.035,.12,.035);N.rotation.z=-.13,ge.push({flame:N,baseY:P+.248,baseScaleY:.12,phase:S*3.1+E*1.7})}function ar(x,S,P,E){O(x,le,Z("#535f63",.68,.42),S,P+.07,E,.065,.14,.065),O(x,le,Z("#3b2618",.05,.35),S,P+.142,E,.052,.005,.052);let N=oe("mug-handle",()=>new Ct(.047,.014,6,12));O(x,N,Z("#748287",.72,.38),S+.078,P+.075,E)}function jc(x){let S=`rug:${x}`;if(!K.has(S)){let P=at((E,N,z)=>{E.fillStyle=x?"#1d3b42":"#572226",E.fillRect(0,0,N,z);for(let q=0;q<z;q+=3)E.fillStyle=q%6===0?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.04)",E.fillRect(0,q,N,1);E.strokeStyle="#9e7d47",E.lineWidth=5,E.strokeRect(14,14,N-28,z-28),E.strokeStyle=x?"#55786f":"#8c5442",E.lineWidth=9,E.strokeRect(27,27,N-54,z-54);for(let q of[74,49,22])E.fillStyle=q===49?x?"#6b3b30":"#24464a":"#9c7c49",E.beginPath(),E.moveTo(N/2,z/2-q),E.lineTo(N/2+q*.65,z/2),E.lineTo(N/2,z/2+q),E.lineTo(N/2-q*.65,z/2),E.closePath(),E.fill();let $=E.createRadialGradient(N/2,z/2,30,N/2,z/2,N*.68);$.addColorStop(0,"rgba(0,0,0,0)"),$.addColorStop(1,"rgba(0,0,0,0.38)"),E.fillStyle=$,E.fillRect(0,0,N,z)});K.set(S,new Ln({map:P,roughness:.96,side:An}))}return K.get(S)}function Ca(x,S){let P=Number(S.width)||1,E=Number(S.depth)||1,N=Jt("#6e503a"),z=Jt("#916c4f"),$=Jt("#4d3525"),q=Z("#2b3236",.78,.38),ce=Z("#8f6f40",.8,.34),ae=Math.max(.2,Math.min(2.1,Number(S.height)||.8));if(S.kind==="rug"){let ie=O(x,j,jc((S.x+S.y)%2===0),0,.008,0,P-.18,E-.18,1);ie.rotation.x=-Math.PI/2,ie.castShadow=!1;for(let Le of[-1,1])for(let be=-P/2+.15;be<P/2-.1;be+=.09)O(x,ne,Z("#947b52",0,.95),be,.006,Le*(E/2-.065),.022,.006,.1).castShadow=!1}else if(S.kind==="table"){let ie=ae-.06,Le=Math.max(2,Math.ceil(E/.25));for(let Xe=0;Xe<Le;Xe++)O(x,ne,Xe%2?z:N,0,ie,-E/2+.09+(Xe+.5)*(E-.18)/Le,P-.16,.12,(E-.18)/Le-.016);for(let Xe of[-P/2+.22,P/2-.22])for(let fe of[-E/2+.22,E/2-.22])O(x,ne,$,Xe,(ae-.14)/2,fe,.13,ae-.14,.13),O(x,ne,ce,Xe,.09,fe,.15,.07,.15);Ra(x,-P*.24,ae,-E*.17),ar(x,P*.24,ae,E*.2),ar(x,-P*.19,ae,E*.23);let be=new We;x.add(be),be.position.set(P*.23,ae+.065,-E*.22),be.rotation.z=Math.PI/2,be.rotation.y=.14,pi(be,0,0,0,.09,Math.min(.36,P*.3),Math.min(.31,E*.3),"#5e2824")}else if(S.kind==="bench"){let ie=Math.max(P,E),Le=Math.min(P,E);E>P&&(x.rotation.y=Math.PI/2),O(x,ne,z,0,ae-.06,0,ie-.18,.12,Le*.58);for(let be of[-ie/2+.25,ie/2-.25])O(x,ne,N,be,(ae-.12)/2,0,.16,ae-.12,Le*.44)}else if(S.kind==="shelf"){let ie=Math.max(P,E),Le=Math.min(P,E),be=Le*.72;x.rotation.y=E>P?S.x<X/2?-Math.PI/2:Math.PI/2:S.y<pe/2?Math.PI:0;for(let Ee of[-ie/2+.12,ie/2-.12])O(x,ne,N,Ee,ae/2,0,.13,ae,be);let Xe=ae>=1.3?3:2,fe=["#5e2824","#274245","#785b2e","#38472e","#3e334d"];for(let Ee=0;Ee<=Xe;Ee++){let Je=.1+Ee*(ae-.15)/Xe;if(O(x,ne,z,0,Je,0,ie-.1,.09,be+.045),Ee===Xe)continue;let ct=Math.max(3,Math.floor((ie-.42)/.14));for(let Rt=0;Rt<ct;Rt++){let dt=(ae-.15)/Xe*(.61+(Rt+Ee*3)%4*.065);pi(x,-ie/2+.26+(Rt+.5)*(ie-.52)/ct,Je+.045+dt/2,-be*.08,(ie-.52)/ct*.78,dt,be*.7,fe[(Rt+Ee*2)%fe.length])}}}else if(S.kind==="barrel"){let ie=Math.min(P,E)*.37,Le=oe("barrel",()=>new Kr([new ve(0,0),new ve(.8,0),new ve(.95,.16),new ve(1,.5),new ve(.95,.84),new ve(.8,1),new ve(0,1)],16));O(x,Le,N,0,0,0,ie,ae,ie);for(let[be,Xe]of[[.12,.94],[.32,1],[.72,1],[.9,.93]])O(x,le,q,0,be*ae,0,ie*Xe+.014,.055,ie*Xe+.014);O(x,le,z,0,ae+.003,0,ie*.79,.022,ie*.79)}else if(S.kind==="crate"){O(x,ne,N,0,ae/2,0,P-.22,ae,E-.22);for(let ie of[-1,1]){for(let be of[.06,ae-.06])O(x,ne,z,0,be,ie*(E/2-.08),P-.16,.1,.08),O(x,ne,z,ie*(P/2-.08),be,0,.08,.1,E-.16);let Le=O(x,ne,z,0,ae/2,ie*(E/2-.065),Math.hypot(P-.43,ae-.19),.085,.045);Le.rotation.z=Math.atan2(ae-.19,P-.43);for(let be of[-P/2+.1,P/2-.1])O(x,ne,q,be,ae-.06,ie*(E/2-.07),.09,.11,.09)}}}function Pa(x){x.updateMatrixWorld(!0);let S=x.matrixWorld.clone().invert(),P=new Map;x.traverse(E=>{if(!E.isMesh)return;let N=`${E.geometry.uuid}:${E.material.uuid}:${E.castShadow}`;P.has(N)||P.set(N,[]),P.get(N).push(E)});for(let E of P.values()){if(E.length<2)continue;let N=E[0],z=new Zi(N.geometry,N.material,E.length);z.castShadow=N.castShadow,z.receiveShadow=!0,E.forEach(($,q)=>{z.setMatrixAt(q,new ft().multiplyMatrices(S,$.matrixWorld)),$.removeFromParent()}),z.computeBoundingSphere(),x.add(z)}}function $n(x,S,P){return x.tiles?.[P]?.[S]==="#"}function lr(x){return x.flame?x.flame:x.id==="caverns"?{ember:"#2ac4e8",outer:"#7bf0ff",core:"#e6ffff"}:x.id==="sanctum"?{ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"}:x.id==="crucible"?{ember:"#ff4d12",outer:"#ff902b",core:"#ffe8a3"}:{ember:"#ff8229",outer:"#ffc25e",core:"#fff0b3"}}function Ia(x,S,P,E,N){let z=new We;z.position.set(x,P+.12,S),M.add(z);let $=lr(E),q=Z("#282f33",.78,.4),ce=Z("#8c6d3e",.8,.34);O(z,le,q,0,.08,0,.12,.16,.12),O(z,Ce,ce,0,.21,0,.22,.14,.22).rotation.z=Math.PI,O(z,Ae,J($.ember),0,.28,0,.15,.07,.15);let ae=O(z,ue,J($.outer),0,.42,0,.12,.34,.12);ae.castShadow=!1,O(z,ue,J($.core),.02,.35,.01,.055,.18,.055).castShadow=!1;let ie=null;N&&(ie=new Ii(E.torchColor,4.8,7.2,1.9),ie.position.set(0,.52,0),z.add(ie)),ge.push({flame:ae,light:ie,baseY:.42,baseScaleY:.34,baseIntensity:4.8,phase:x*2.1+S*3.7})}function cr(){for(let x of de)x.mesh.removeFromParent(),x.mat.dispose();de.length=0}function hr(x){if(cr(),p)return;let S=34;for(let P=0;P<S;P++){let E=(P*73+19)%1e3/1e3*(X-.4)-.3,N=(P*137+41)%1e3/1e3*(pe-.4)-.3,z=.22+(P*53+7)%100/100*1.95,$=new _n({color:x.moteColor||"#e8d8b5",transparent:!0,opacity:.45,depthWrite:!1}),q=new tn(Ae,$),ce=.016+P%4*.005;q.scale.setScalar(ce),q.position.set(E,z,N),q.castShadow=!1,q.receiveShadow=!1,M.add(q),de.push({mesh:q,mat:$,baseX:E,baseZ:N,phase:P*1.73,speed:.16+P%5*.045,yOffset:z})}}let La=new Set(["pillar","brazier","table","bench","shelf","barrel","crate","rug","sarcophagus","altar","stained_glass","bell","lantern_post","ore_vein","water_lock","kiln"]),Da={sarcophagus:"props/sarcophagus.glb",brazier:"props/brazier.glb"};function mi(x,S,P,E=!0){if(!P.length)return null;let N=new Zi(x,S,P.length);return P.forEach(([z,$,q,ce,ae,ie,Le=0],be)=>{yt.position.set(z,$,q),yt.scale.set(ce,ae,ie),yt.rotation.set(0,Le,0),yt.updateMatrix(),N.setMatrixAt(be,yt.matrix)}),N.castShadow=E,N.receiveShadow=!0,N.computeBoundingSphere(),M.add(N),N}function Qc(x,S,P){let E=Number(S.width)||1,N=Number(S.depth)||2,z=Math.max(E,N),$=Math.min(E,N);E>N&&(x.rotation.y=Math.PI/2);let q=Z(P.wallCap||"#565852",.06,.82),ce=Z(P.wallJoint||"#202321",.1,.8),ae=Z(P.pillarTrim||"#7d653e",.5,.45);O(x,ne,ce,0,.05,0,$*.8,.1,z*.86),O(x,ne,q,0,.3,0,$*.7,.42,z*.78),O(x,ne,ae,0,.51,0,$*.74,.04,z*.82),O(x,ne,q,0,.57,0,$*.68,.09,z*.76),O(x,ne,q,0,.64,0,$*.46,.06,z*.6);for(let ie of[-z*.18,z*.18])O(x,ne,ae,0,.3,ie,$*.72,.3,.035)}function Na(x,S,P){let E=Number(S.width)||1,N=Number(S.depth)||1,z=Z(P.wallCap||"#565852",.06,.8),$=Z(P.pillarTrim||"#7d653e",.5,.45);O(x,ne,z,0,.12,0,E-.08,.24,N-.08),O(x,ne,z,0,.42,0,E*.7,.36,N*.6),O(x,ne,$,0,.63,0,E*.76,.05,N*.66)}function Ua(x,S,P){let E=Number(S.width)||1,N=Number(S.depth)||1,z=Math.max(1.05,Math.min(1.9,Number(S.height)||1.48)),$=Z(P.wallCap||"#444056",.08,.82),q=Z(P.wallJoint||"#1c1828",.12,.86),ce=Jt("#523929"),ae=Z("#282f34",.82,.36),ie=Z("#b88b48",.86,.28),Le=Z("#dfb66d",.9,.24),be=oe("bell_body",()=>new Kr([new ve(.01,.98),new ve(.32,.95),new ve(.46,.78),new ve(.54,.48),new ve(.72,.18),new ve(.95,.04),new ve(1,0),new ve(.84,0),new ve(.68,.15)],18));O(x,ne,q,0,.08,0,E-.06,.16,N-.06),O(x,ne,$,0,.22,0,E-.22,.14,N-.22);let Xe=Math.max(.62,E-.34),fe=z-.28;for(let Je of[-Xe/2,Xe/2])O(x,ne,ce,Je,.28+fe/2,0,.14,fe,.14),O(x,ne,ae,Je,.36,0,.16,.07,.16),O(x,ne,ae,Je,z-.12,0,.16,.07,.16);O(x,ne,ce,0,z-.04,0,Xe+.32,.14,.18),O(x,ne,$,0,z+.06,0,Xe+.42,.08,.28);let Ee=E>=2.5?[[-.78,.22,.42],[0,.33,.6],[.78,.22,.42]]:[[0,.28,.52]];for(let[Je,ct,Rt]of Ee){let dt=z-.12;O(x,ne,ae,Je,dt-.05,0,ct*1.1,.07,.08),O(x,le,ae,Je,dt-.12,0,.045,.14,.045),O(x,be,ie,Je,dt-.14-Rt,0,ct,Rt,ct),O(x,le,Le,Je,dt-.14-Rt*.22,0,ct*.72,.035,ct*.72),O(x,Ae,ae,Je,dt-.14-Rt-.03,0,.055,.055,.055)}}function eh(x,S,P,E){let N=Math.max(.95,Math.min(1.7,Number(S.height)||1.32)),z=Z(P.wallCap||"#445863",.08,.86),$=Jt("#593f2b"),q=Z("#252c30",.82,.36),ce=(P.base||P.id)==="caverns"?"#ffbe63":P.torchColor||"#ffae4a",ae="#fff3cf";O(x,ne,z,0,.14,0,.72,.28,.72),O(x,ne,$,-.06,.26+(N-.26)/2,0,.16,N-.26,.16),O(x,ne,q,-.06,.34,0,.19,.08,.19),O(x,ne,$,.12,N-.06,0,.5,.1,.11);let ie=O(x,ne,q,.08,N-.2,0,.28,.045,.045);ie.rotation.z=Math.PI/4;let Le=.28,be=N-.3;O(x,le,q,Le,N-.14,0,.018,.14,.018),O(x,ue,q,Le,be+.13,0,.14,.1,.14),O(x,le,q,Le,be-.1,0,.11,.04,.11);let Xe=O(x,le,J(ce,.94),Le,be+.01,0,.088,.17,.088);Xe.castShadow=!1,Xe.userData.keep=!0;let fe=O(x,Ae,J(ae,.98),Le,be+.01,0,.045,.065,.045);fe.castShadow=!1,fe.userData.keep=!0;for(let Je=0;Je<4;Je++){let ct=Je/4*Math.PI*2+Math.PI/4;O(x,le,q,Le+Math.cos(ct)*.095,be+.01,Math.sin(ct)*.095,.012,.19,.012)}let Ee=null;E&&(Ee=new Ii(ce,5.4,7.6,1.9),Ee.position.set(Le,be,0),x.add(Ee)),ge.push({flame:fe,light:Ee,baseY:be+.01,baseScaleY:.065,baseIntensity:5.4,phase:S.x*2.3+S.y*1.7})}function th(x,S,P){let E=Number(S.width)||1,N=Number(S.depth)||1,z=Math.max(.75,Math.min(1.25,Number(S.height)||1.02)),$=Z("#26353e",.12,.92),q=Z("#172229",.16,.94),ce=P.crystalColor||"#4ce6ff",ae=J(ce,.94),ie=J("#e2fcff",.98),Le=(S.x*5+S.y*7)%6*.42,be=O(x,ue,q,0,z*.36,0,Math.min(E,N)*.56,z*.72,Math.min(E,N)*.56);be.rotation.y=Le,O(x,ne,$,-E*.14,z*.32,N*.1,E*.56,z*.64,N*.52).rotation.set(.12,Le+.48,-.1),O(x,ne,q,E*.16,z*.28,-N*.14,E*.52,z*.54,N*.5).rotation.set(-.14,Le-.36,.12),O(x,ue,$,E*.05,z*.74,-N*.04,Math.min(E,N)*.36,z*.54,Math.min(E,N)*.36).rotation.set(.08,Le,-.14);let Je=[[E*.18,z*.76,N*.12,.115,.68,.34,-.2],[-E*.18,z*.7,-N*.14,.105,.6,-.36,.24],[E*.02,z*.96,N*.02,.095,.58,.12,.14],[-E*.24,z*.46,N*.2,.085,.46,-.48,-.32],[E*.24,z*.44,-N*.2,.08,.44,.46,.28]];for(let[ct,Rt,dt,Ht,en,Zt,$t]of Je){let Xn=O(x,ue,ae,ct,Rt,dt,Ht,en,Ht);Xn.rotation.set($t,0,Zt),Xn.castShadow=!1;let Pe=O(x,ue,ie,ct,Rt+en*.16,dt,Ht*.46,en*.5,Ht*.46);Pe.rotation.set($t,0,Zt),Pe.castShadow=!1}}function nh(x,S,P){let E=Number(S.width)||2,N=Number(S.depth)||2,z=Math.max(.45,Math.min(1.15,Number(S.height)||.78)),$=Z(P.wallCap||"#485449",.08,.84),q=Z("#3c5738",.06,.88),ce=Jt("#4d3827"),ae=Z("#262d30",.78,.38),ie="water:lock";K.has(ie)||K.set(ie,new Ln({color:"#1b585c",emissive:"#0e363a",emissiveIntensity:.75,metalness:.38,roughness:.12}));let Le=K.get(ie),be=Z("#5d7d40",.04,.86),Xe=Z("#6e462a",.04,.9),fe=.2;O(x,ne,$,-E/2+fe/2,.11,0,fe,.22,N-.04),O(x,ne,$,E/2-fe/2,.11,0,fe,.22,N-.04),O(x,ne,q,-E/2+fe/2,.23,0,fe+.04,.04,N-.06),O(x,ne,q,E/2-fe/2,.23,0,fe+.04,.04,N-.06);let Ee=O(x,ne,Le,0,.04,0,Math.max(.4,E-fe*1.8),.04,N-.06);Ee.castShadow=!1;let Je=z>=.8?Math.min(.42,N*.28):.22;O(x,ne,ce,0,z*.5,0,E-.16,z,Je),O(x,ne,$,0,z+.04,0,E-.08,.09,Je+.08);let ct=Math.max(2,Math.round(E*2));for(let dt=0;dt<ct;dt++){let Ht=-E/2+.28+(dt+.5)*(E-.56)/ct;O(x,ne,ae,Ht,z*.52,0,.055,z+.08,Je+.05)}if(z>=.8)for(let dt of[-N/2+.24,N/2-.24])O(x,ne,$,0,z*.42,dt,E-.24,z*.84,.28);let Rt=Math.max(6,Math.round(N*4));for(let dt=0;dt<Rt;dt++){let Ht=dt%2===0?-1:1,en=Ht*(E/2-.21)+(dt*7%5-2)*.035,Zt=-N/2+.16+(dt+.5)/Rt*(N-.32),$t=.58+dt%3*.16,Xn=O(x,le,be,en,.16+$t/2,Zt,.026,$t,.026);if(Xn.rotation.z=Ht*-.16,Xn.rotation.x=(dt%3-1)*.11,dt%2===0){let Pe=O(x,le,Xe,en-Ht*.05,.16+$t*.88,Zt,.046,.15,.046);Pe.rotation.z=Ht*-.16}}}function Oa(x,S,P,E){let N=Number(S.width)||2,z=Number(S.depth)||2,$=Math.max(.95,Math.min(1.55,Number(S.height)||1.26)),q=Z("#523730",.1,.86),ce=Z("#241a18",.14,.9),ae=Z("#282a2d",.82,.38),ie=J("#ff5514",.94),Le=J("#ffda7a",.98);O(x,ne,ce,0,.08,0,N-.06,.16,z-.06),O(x,ne,q,0,.16+$*.62/2,0,N-.14,$*.62,z-.14),O(x,ne,ce,0,.16+$*.62+.09,0,N-.3,.18,z-.3);for(let dt of[.34,.68])O(x,ne,ae,0,dt,0,N-.1,.055,z-.1);let be=Math.max(.32,$*.34),Xe=.16+$*.62+.14+be/2;O(x,le,ce,0,Xe,0,.25,be,.25),O(x,le,ae,0,Xe+be*.44,0,.29,.06,.29);let fe=O(x,le,ie,0,Xe+be*.5,0,.19,.06,.19);fe.castShadow=!1,fe.userData.keep=!0;let Ee=O(x,ue,Le,0,Xe+be*.62,0,.11,.24,.11);Ee.castShadow=!1,Ee.userData.keep=!0;let Je=N>=2.5?[-.62,.62]:[0],ct=Ee;for(let dt of Je)for(let Ht of[-1,1]){let en=Ht*(z/2-.065);O(x,ne,ae,dt,.4,en,.54,.46,.05);let Zt=O(x,ne,ie,dt,.38,en+Ht*.012,.44,.36,.03);Zt.castShadow=!1,Zt.userData.keep=!0;let $t=O(x,ne,Le,dt,.32,en+Ht*.02,.3,.2,.02);$t.castShadow=!1,$t.userData.keep=!0;for(let Xn of[-.12,0,.12])O(x,ne,ae,dt+Xn,.38,en+Ht*.028,.028,.36,.024)}let Rt=null;E&&(Rt=new Ii("#ff6a22",6,8.4,1.9),Rt.position.set(0,.65,z/2+.35),x.add(Rt)),ge.push({flame:ct,light:Rt,baseY:Xe+be*.62,baseScaleY:.24,baseIntensity:6,phase:S.x*1.7+S.y*2.9})}function C(x,S,P){let E={s:[0,.5,0],n:[0,-.5,Math.PI],e:[.5,0,-Math.PI/2],w:[-.5,0,Math.PI/2]}[x.facing||"s"],N=`glass:${S.id}`;if(!K.has(N)){let q=at((ce,ae,ie)=>{ce.fillStyle="#05030a",ce.fillRect(0,0,ae,ie),ce.save(),ce.beginPath(),ce.moveTo(ae*.2,ie),ce.lineTo(ae*.2,ie*.32),ce.quadraticCurveTo(ae*.2,ie*.05,ae*.5,ie*.02),ce.quadraticCurveTo(ae*.8,ie*.05,ae*.8,ie*.32),ce.lineTo(ae*.8,ie),ce.closePath(),ce.clip();let Le=["#7d3cff","#c47bff","#ffb347","#5a2bb8","#e0a0ff"];for(let be=0;be<42;be++)ce.fillStyle=Le[be%Le.length],ce.fillRect(ae*.2+be%6*ae*.1,Math.floor(be/6)*ie*.14,ae*.1,ie*.14);ce.strokeStyle="#120a18",ce.lineWidth=5;for(let be=.2;be<=.8;be+=.1)ce.beginPath(),ce.moveTo(ae*be,0),ce.lineTo(ae*be,ie),ce.stroke();for(let be=0;be<=1;be+=.14)ce.beginPath(),ce.moveTo(0,ie*be),ce.lineTo(ae,ie*be),ce.stroke();ce.restore()},128,256);K.set(N,new _n({map:q,transparent:!0,blending:js,depthWrite:!1,toneMapped:!1,side:An})),S.textures?.window&&Aa(S.textures.window,{srgb:!0,repeat:!1}).then(ce=>{if(!ce||Se){ce?.dispose();return}Q.add(ce);let ae=K.get(N);ae&&(ae.map=ce,ae.needsUpdate=!0,fn())})}let z=Math.min(P,.86)*.92,$=O(M,j,K.get(N),x.x+E[0]*1.002,.06+z/2,x.y+E[1]*1.002,.62,z,1);$.rotation.y=E[2],$.castShadow=!1,$.receiveShadow=!1}function V(x,S,P){Xm(Da[P]).then(E=>{if(!E||Se||!x.parent)return;let N=[...x.children],z=E.clone(!0);z.traverse(q=>{q.isMesh&&(q.castShadow=!0,q.receiveShadow=!0)});let $=Math.max(Number(S.width)||1,Number(S.depth)||1);P==="sarcophagus"&&z.scale.setScalar(Math.min(1,$/2)),x.add(z);for(let q of N)!q.isLight&&q.userData.keep!==!0&&(q.visible=!1);l.shadowMap.needsUpdate=!0,fn()})}function he(x){cr(),pt(M),ge.length=0,X=Number(x.width)||10,pe=Number(x.height)||8;let S=(X-1)/2,P=(pe-1)/2,E=zm(x,v);Me=E.id,h.background.set(E.bg),h.fog.color.set(E.fog),k.color.set(E.hemiSky),k.groundColor.set(E.hemiGround),G.color.set(E.keyColor),H.color.set(E.fillColor),O(M,ne,Z(E.slab,.12,.88),S,-.42,P,X+.46,.64,pe+.46),O(M,ne,Z(E.rim,.78,.34),S,-.155,P,X+.22,.078,pe+.22),O(M,ne,Z(E.frame,.24,.76),S,-.09,P,X+.1,.12,pe+.1);let N=Hm(E,l,Q,K),z=Gm(E,l,Q,K),$=`pbr-floor-alt:${E.id}`;K.has($)||K.set($,N.clone());let q=K.get($),ce=`pbr-cap:${E.id}`;K.has(ce)||K.set(ce,new Ln({map:z.map,bumpMap:z.bumpMap,bumpScale:.038,color:new it("#c8c4bc"),roughness:.78,metalness:.08}));let ae=K.get(ce);if(E.textures&&!K.has(`textured:${E.id}`)){K.set(`textured:${E.id}`,new _n);let Pe=Nt=>Q.add(Nt),Ve=Math.min(u==="low"?2:8,l.capabilities.getMaxAnisotropy());Promise.all([Jc(N,E.textures.floor,Pe,{anisotropy:Ve}),Jc(q,E.textures.floorAlt||E.textures.floor,Pe,{anisotropy:Ve}),Jc(z,E.textures.wall,Pe,{anisotropy:Ve})]).then(()=>{Se||(l.shadowMap.needsUpdate=!0,fn())})}let ie=new Set((x.scene?.chasm||[]).map(([Pe,Ve])=>`${Pe},${Ve}`)),Le=new it,be=[],Xe=[];for(let Pe=0;Pe<pe;Pe++)for(let Ve=0;Ve<X;Ve++){if(ie.has(`${Ve},${Pe}`))continue;(E.textures?.floorAlt&&(Ve*7+Pe*13)%8===3&&!$n(x,Ve,Pe)?Xe:be).push([Ve,Pe])}for(let[Pe,Ve]of[[be,N],[Xe,q]]){if(!Pe.length)continue;let Nt=new Zi(ne,Ve,Pe.length);Pe.forEach(([Lt,Wt],Jn)=>{yt.position.set(Lt,-.015,Wt),yt.scale.set(.976,.09,.976),yt.rotation.set(0,Ve===N?(Lt*7+Wt*3)%4*Math.PI/2:0,0),yt.updateMatrix(),Nt.setMatrixAt(Jn,yt.matrix);let jn=.9+(Lt*13+Wt*7)%5*.042;Le.setRGB(jn,jn,jn*((E.base||E.id)==="caverns"?1.04:.99)),Nt.setColorAt(Jn,Le)}),Nt.receiveShadow=!0,M.add(Nt)}if(ie.size){let Pe=[...ie].map(Lt=>Lt.split(",").map(Number));mi(ne,Z("#050308",0,1),Pe.map(([Lt,Wt])=>[Lt,-.62,Wt,1,.1,1]),!1);let Ve=J(E.torchColor||"#8c3dff",.16),Nt=Pe.filter(([Lt,Wt])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([Jn,jn])=>!ie.has(`${Lt+Jn},${Wt+jn}`)&&!$n(x,Lt+Jn,Wt+jn)));mi(ne,Ve,Nt.map(([Lt,Wt])=>[Lt,-.3,Wt,.98,.5,.98]),!1)}let fe=(x.scene?.props||[]).filter(Pe=>La.has(Pe.kind)),Ee=new Set;for(let Pe of fe)if(Pe.kind!=="rug"&&Pe.kind!=="stained_glass")for(let Ve=0;Ve<(Pe.depth||1);Ve++)for(let Nt=0;Nt<(Pe.width||1);Nt++)Ee.add(`${Pe.x+Nt},${Pe.y+Ve}`);let Je=Math.max(.25,Math.min(1.6,Number(x.scene?.wall_height)||1.1)),ct=[],Rt=[],dt=[],Ht=[],en=[];for(let Pe=0;Pe<pe;Pe++)for(let Ve=0;Ve<X;Ve++){if(!$n(x,Ve,Pe)||Ee.has(`${Ve},${Pe}`)||ie.has(`${Ve},${Pe}`))continue;let Nt=Ve===0||Pe===0||Ve===X-1||Pe===pe-1,Lt=["caverns","catacombs"].includes(E.base||E.id)&&!Nt?((Ve*17+Pe*31)%5-2)*.045:0,Wt=(Nt?Math.min(Je,.42):Math.min(Je,.86))+Lt;Rt.push([Ve,Wt/2+.04,Pe,.978,Wt,.978]),dt.push([Ve,Wt+.075,Pe,1.018,.095,1.018]),Nt||(Ht.push([Ve,.07,Pe,1.022,.07,1.022]),[[1,0],[-1,0],[0,1],[0,-1]].some(([jn,d0])=>!$n(x,Ve+jn,Pe+d0))&&ct.push({x:Ve,y:Pe,h:Wt})),E.crystalColor&&Nt&&(Ve*11+Pe*23)%11===0&&en.push([Ve+.15,Wt+.21,Pe-.1])}mi(ne,z,Rt),mi(ne,ae,dt),mi(ne,Z(E.wallJoint,.14,.86),Ht);for(let[Pe,Ve,Nt]of en){let Lt=O(M,ue,J(E.crystalColor,.88),Pe,Ve,Nt,.075,.26,.075);Lt.rotation.z=.22,Lt.castShadow=!1}let Zt=lr(E),$t=0;for(let Pe of fe){if(Pe.kind==="stained_glass"){C(Pe,E,Je);continue}let Ve=new We;Ve.userData.mapProp={...Pe};let Nt=gm(Pe,Re.objects);if(Nt&&(Ve.userData.objectId=Nt.id,Ve.userData.objectState={...Nt},Ve.visible=!Nt.destroyed),Ve.position.set(Pe.x+((Pe.width||1)-1)/2,.04,Pe.y+((Pe.depth||1)-1)/2),M.add(Ve),Pe.kind==="pillar"){let Lt=Math.max(.7,Math.min(2.1,Number(Pe.height)||Je+.26));O(Ve,ne,ae,0,.1,0,.88,.2,.88),O(Ve,le,z,0,Lt/2,0,.29,Lt-.15,.29);for(let Wt=1;Wt<4;Wt++)O(Ve,le,Z(E.pillarTrim,.45,.52),0,Wt*Lt/4,0,.306,.038,.306);O(Ve,ne,ae,0,Lt-.02,0,.8,.17,.8)}else if(Pe.kind==="brazier"){let Lt=Math.max(.4,Math.min(1.1,Number(Pe.height)||.65));O(Ve,ne,Z(E.wallJoint,.16,.82),0,.1,0,.68,.2,.68),O(Ve,le,Z("#282f33",.78,.4),0,Lt/2,0,.1,Lt-.12,.1),O(Ve,Ce,Z("#7d5e36",.8,.36),0,Lt,0,.32,.18,.32).rotation.z=Math.PI;let Wt=O(Ve,Ae,J(Zt.ember),0,Lt+.1,0,.21,.09,.21),Jn=O(Ve,ue,J(Zt.outer),-.02,Lt+.27,0,.15,.44,.15);Jn.castShadow=!1,Wt.userData.keep=!0,Jn.userData.keep=!0;let jn=null;$t++<3&&(jn=new Ii(E.torchColor,5.2,7.2,2),jn.position.set(0,Lt+.42,0),Ve.add(jn)),ge.push({flame:Jn,light:jn,baseY:Lt+.27,baseScaleY:.44,baseIntensity:5.2,phase:Pe.x*1.9+Pe.y*2.7}),E.flame&&V(Ve,Pe,"brazier")}else Pe.kind==="sarcophagus"?(Qc(Ve,Pe,E),V(Ve,Pe,"sarcophagus")):Pe.kind==="altar"?Na(Ve,Pe,E):Pe.kind==="bell"?Ua(Ve,Pe,E):Pe.kind==="lantern_post"?eh(Ve,Pe,E,$t++<3):Pe.kind==="ore_vein"?th(Ve,Pe,E):Pe.kind==="water_lock"?nh(Ve,Pe,E):Pe.kind==="kiln"?Oa(Ve,Pe,E,$t++<3):Ca(Ve,Pe);["brazier","table","sarcophagus","lantern_post","kiln"].includes(Pe.kind)||Pa(Ve),Nt&&Ve.traverse(Lt=>{Lt.userData.objectId=Nt.id})}if(!fe.some(Pe=>["brazier","lantern_post","kiln"].includes(Pe.kind))){let Pe=ct.length?ct:[{x:0,y:0,h:.42},{x:X-1,y:0,h:.42},{x:0,y:pe-1,h:.42},{x:X-1,y:pe-1,h:.42}],Ve=[],Nt=Math.max(4,Math.hypot(X,pe)*.28);for(let Lt=0;Lt<Pe.length&&Ve.length<4;Lt++){let Wt=Pe[(Lt*7+3)%Pe.length];Ve.every(Jn=>Math.hypot(Wt.x-Jn.x,Wt.y-Jn.y)>=Nt)&&(Ve.push(Wt),Ia(Wt.x,Wt.y,Wt.h,E,$t++<3))}}hr(E),G.target.position.set(S,0,P);let Xn=Math.hypot(X,pe)/2+2.5;Object.assign(G.shadow.camera,{left:-Xn,right:Xn,top:Xn,bottom:-Xn,far:65}),G.shadow.camera.updateProjectionMatrix(),G.position.set(S-6.5,13.5,P+5.5),H.position.set(S+7.5,5.5,P-6.5)}function se(x,S){if(p||ee.length>18)return;let P=new _n({color:"#b7b3a4",transparent:!0,opacity:.42,depthWrite:!1}),E=new tn(Ae,P);E.position.set(x+Math.sin(x*12+S*7)*.12,.09,S+Math.cos(x*9-S*5)*.12),E.scale.setScalar(.06),F.add(E),ee.push({mesh:E,mat:P,born:performance.now()})}function re(x){let S=or(x);return S?S==="goblin"?1.38:S==="goblin_boss"?1.48:1.66:1.56}function Oe(x,S=re(x)){let P=(x.conditions||[]).filter(q=>!["dead","unconscious"].includes(q)),E=new Set([...P,...x.marks||[]].filter(Boolean)).size,N=at((q,ce,ae)=>{q.clearRect(0,0,ce,ae),q.fillStyle="rgba(11, 20, 24, 0.88)",q.beginPath(),q.roundRect(4,4,ce-8,ae-8,16),q.fill(),q.strokeStyle=x.active&&x.alive?"#ffdb86":x.team==="heroes"?"#62c4be":"#d68265",q.lineWidth=x.active&&x.alive?3.5:2.5,q.stroke(),q.fillStyle="#f6efe0",q.font="700 24px system-ui, -apple-system, sans-serif",q.textAlign="left";let ie=String(x.name||x.id),Le=ie.length>24?`${ie.slice(0,23)}\u2026`:ie;q.fillText(Le,16,33,ce-84),q.fillStyle="#b9d2cd",q.font="600 19px system-ui, sans-serif",q.textAlign="right",q.fillText(`${Math.max(0,x.hp)}/${x.max_hp}`,ce-15,33),q.fillStyle="#25353a",q.beginPath(),q.roundRect(15,44,ce-30,8,4),q.fill();let be=Math.max(0,Math.min(1,x.hp/Math.max(1,x.max_hp)));if(q.fillStyle=x.team==="heroes"?be>.4?"#4ad4b2":"#f29d52":be>.4?"#eb7a65":"#d94e4e",be>0&&(q.beginPath(),q.roundRect(15,44,Math.max(8,(ce-30)*be),8,4),q.fill()),E>0){q.fillStyle="#ffd966";for(let Xe=0;Xe<Math.min(4,E);Xe++)q.beginPath(),q.arc(ce-18-Xe*10,13,3.2,0,Math.PI*2),q.fill()}},240,64),z=new ms({map:N,transparent:!0,depthTest:!1,depthWrite:!1}),$=new ks(z);return $.renderOrder=15,$.scale.set(.92,.245,1),$.position.set(0,S,0),$.userData.unitId=x.id,$.userData.baseY=S,$}function Ke(x){x&&(Q.delete(x.material.map),x.material.map.dispose(),x.material.dispose(),x.removeFromParent())}function Fe(){if(!a.clientHeight||!a.clientWidth)return;d.updateMatrixWorld();let x=[];for(let S of W.values()){let P=S.name;if(!P)continue;if(y==="off"||!S.data.alive&&S.data.team==="monsters"&&S.castKey){P.visible=!1;continue}if(P.visible=y!=="minimal"||!!(S.data.active||S.data.id===Ut),!P.visible)continue;let E=S.data.alive?S.labelY:.66;Pt.set(S.root.position.x,E,S.root.position.z).project(d);let N=(Pt.x+1)*a.clientWidth*.5,z=(1-Pt.y)*a.clientHeight*.5,$=d.position.distanceTo(S.root.position);x.push({entry:S,sp:P,baseY:E,sx:N,sy:z,adjY:z,dist:$})}x.sort((S,P)=>P.sy-S.sy);for(let S=0;S<x.length;S++){let P=x[S];for(let z=0;z<S;z++){let $=x[z];Math.abs(P.sx-$.sx)<76&&Math.abs(P.adjY-$.adjY)<25&&(P.adjY=$.adjY-26)}let E=Math.min(72,Math.max(0,P.sy-P.adjY)),N=2*P.dist*Math.tan(an.degToRad(d.fov/2))/Math.max(1,a.clientHeight);He(P.sp,P.baseY+E*N,P.dist)}}function He(x,S,P){x.position.y+=(S-x.position.y)*.35;let E=Math.max(.36,Math.min(1.42,P/15));x.scale.set(.92*E,.245*E,1)}let Ze=new Map,ut={guiding_bolt:(x,S)=>{let P=new We;return P.name="mark-guiding_bolt",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#ffd75e",.9),0,.12,0).rotation.x=-Math.PI/2,O(P,oe("mark-star",()=>new Cn(1)),J("#ffe27a",.95),0,1.18*(S.model?.scale||1)+.25,0,.07,.13,.07),P},bless:(x,S)=>{let P=new We;return P.name="mark-bless",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#ffe27a",.85),0,.12,0).rotation.x=-Math.PI/2,O(P,oe("mark-halo",()=>new Ct(.2,.02,6,28)),J("#fff0a8",.9),0,1.22*(S.model?.scale||1)+.28,0).rotation.x=-Math.PI/2,P},aid:x=>{let S=new We;return S.name="mark-aid",x.add(S),O(S,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#8dffa8",.85),0,.12,0).rotation.x=-Math.PI/2,O(S,ne,J("#8dffa8",.95),0,.14,0,.1,.03,.03),O(S,ne,J("#8dffa8",.95),0,.14,0,.03,.1,.03),S},shield_of_faith:(x,S)=>{let P=new We;return P.name="mark-shield_of_faith",x.add(P),O(P,Ae,J("#7fb8ff",.18),0,.62*(S.model?.scale||1),0,.52,.7,.52),P},sanctuary:(x,S)=>{let P=new We;return P.name="mark-sanctuary",x.add(P),O(P,Ae,J("#f4f0ff",.14),0,.5*(S.model?.scale||1),0,.62,.8,.62),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#ffffff",.7),0,.12,0).rotation.x=-Math.PI/2,P},protection:x=>{let S=new We;S.name="mark-protection",x.add(S),O(S,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#fff0b0",.95),0,.12,0).rotation.x=-Math.PI/2;for(let P=0;P<4;P++)O(S,ne,J("#fff0b0",.8),0,.13,0,.03,.01,.9).rotation.y=P*Math.PI/4;return S},blur:(x,S)=>{let P=new We;P.name="mark-blur",x.add(P);for(let E of[-.16,.16])O(P,Ae,J("#bcd8ff",.18),E,.62*(S.model?.scale||1),0,.2,.45,.2);return P},innate_sorcery:x=>{let S=new We;S.name="mark-innate_sorcery",x.add(S);for(let P=0;P<8;P++){let E=P/8*Math.PI*2;O(S,ue,J(P%2?"#ffb347":"#ff7a3c",.85),Math.cos(E)*.42,.3,Math.sin(E)*.42,.06,.4,.06)}return S},paralyzed:(x,S)=>{let P=new We;P.name="mark-paralyzed",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#ffe27a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<4;E++){let N=E/4*Math.PI*2;O(P,oe("mark-star",()=>new Cn(1)),J("#fff0a0",.95),Math.cos(N)*.3,1.15*(S.model?.scale||1)+.2,Math.sin(N)*.3,.05,.09,.03)}return P},poisoned:(x,S)=>{let P=new We;P.name="mark-poisoned",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#8fd36a",.85),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<5;E++)O(P,Ae,J(E%2?"#8fd36a":"#c7f59a",.8),Math.cos(E*2.2)*.25,.7*(S.model?.scale||1)+E*.16,Math.sin(E*2.2)*.25,.045,.045,.045);return P},frightened:(x,S)=>{let P=new We;P.name="mark-frightened",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#a8c8ff",.85),0,.12,0).rotation.x=-Math.PI/2;for(let E of[-.14,.14])O(P,ue,J("#d8e6ff",.9),E,1.2*(S.model?.scale||1)+.15,0,.04,.2,.04).rotation.z=Math.PI;return P},cursed:(x,S)=>{let P=new We;P.name="mark-cursed",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#5f8f3a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<4;E++)O(P,Ae,J(E%2?"#3d5c25":"#9bd16a",.75),Math.cos(E*1.6)*.3,.45*(S.model?.scale||1)+E*.2,Math.sin(E*1.6)*.3,.05,.05,.05);return P},stench:x=>{let S=new We;return S.name="mark-stench",x.add(S),O(S,Ae,J("#8fb84a",.16),0,.35,0,1.15,.5,1.15),S},strength_drain:x=>{let S=new We;S.name="mark-strength_drain",x.add(S),O(S,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#d24a4a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let P=0;P<3;P++){let E=O(S,ue,J("#e86a6a",.95),.34,.3+P*.22,0,.07,.14,.07);E.rotation.z=Math.PI,E.name="mark-chev"}return S},slowed:(x,S)=>{let P=new We;P.name="mark-slowed",x.add(P),O(P,oe("mark-ring",()=>new Ct(.46,.028,6,36)),J("#8fd8ff",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<6;E++){let N=E*Math.PI/3,z=O(P,ue,J("#c9eeff",.9),Math.cos(N)*.42,.22,Math.sin(N)*.42,.045,.3,.045);z.rotation.z=Math.cos(N)*.35,z.rotation.x=-Math.sin(N)*.35}return O(P,oe("mark-flake",()=>new Cn(1)),J("#e6f7ff",.95),0,1.05*(S.model?.scale||1)+.25,0,.07,.07,.07),P}};function Mt(x){let S=["fighter","mage","goblin","skeleton"],P=x.model?.base||x.kind,E=S.includes(P)?P:x.team==="heroes"?"fighter":"goblin",N=new We;R.add(N),N.position.set(x.x,.04,x.y),N.userData.unitId=x.id,N.userData.unitKind=x.kind;let z=new We;N.add(z),z.rotation.y=x.team==="heroes"?-1.57:1.57;let $=[];ze(N,j,et,.002).scale.set(.97,.97,1);let q=O(N,le,Z(x.team==="heroes"?"#255a61":"#6e493a",.25,.65),0,.055,0,.365,.09,.365);q.userData.unitId=x.id,ze(N,B,J(x.team==="heroes"?"#6bd4cf":"#e09a70"),.105).scale.setScalar(.86);let ce=ze(N,ye,J("#ffdb86"),.023);ce.visible=!1;let ae=ze(N,oe("target-ring",()=>new zn(.49,.54,48)),J("#fa856e"),.026);ae.visible=!1;let ie=ze(N,oe("inspect-ring",()=>new zn(.55,.585,48)),J("#b8f6ee",.8),.028);ie.visible=!1;let Le={},be=or(x),Xe=be?Nm(x):null;be&&!Xe&&wf(be);let fe;if(Xe)z.add(Xe.model),z.userData.castKey=be,N.userData.castKey=be,N.userData.undeadModel=be,$.push(...Xe.ownMaterials),fe=Xe.rig;else{let en=Ve=>{let Nt=Z(Ve,.2).clone();return $.push(Nt),Nt},Zt=en(x.team==="heroes"?"#43818a":"#8f5e45"),$t=en(E==="goblin"?"#8fb060":"#dfb48e"),Xn=en("#c4cfcb"),Pe={right:[],left:[],blade:[],bow:[]};O(z,Ce,Zt,0,.48,0,.25,.68,.22).userData.unitId=x.id,O(z,Ae,$t,0,.96,0,.15,.16,.14).userData.unitId=x.id,Pe.right.push(O(z,Ae,Zt,.22,.72,0,.09,.16,.09)),Pe.left.push(O(z,Ae,Zt,-.22,.72,0,.09,.16,.09)),Pe.blade.push(O(z,ne,Xn,.32,.85,-.1,.04,.55,.08)),fe=bm(z,Pe,E)}let Ee=re(x),Je=Oe(x,Ee);N.add(Je);let ct=new tn(oe("picker",()=>new Ai(.4,.4,1.3,10)),I);ct.position.y=.65,ct.userData.unitId=x.id,ct.name="unit-picker",N.add(ct);let Rt=ze(N,oe("down-ring",()=>new zn(.4,.47,40)),J("#ff5a4a",.85),.03);Rt.visible=!1;let dt=ze(N,oe("dead-ring",()=>new zn(.3,.47,40)),Z("#16181a",0,1),.031);dt.visible=!1;let Ht={root:N,body:z,rig:fe,name:Je,labelY:Ee,active:ce,target:ae,inspect:ie,picker:ct,downRing:Rt,deadRing:dt,markGroups:Le,ownMaterials:$,castKey:Xe?be:null,data:{...x},start:new L(x.x,.04,x.y),end:new L(x.x,.04,x.y),moveStart:0,moveEnd:0,targetYaw:z.rotation.y};return Qt(Ht,x),Ht}function qe(){if(Se||Ue)return;if(ot){hn=!0;return}hn=!1;let x=!1;for(let[S,P]of W){let E=or(P.data);if(!E||P.castKey===E||!Um(P.data))continue;let N=Mt(P.data);N.root.position.copy(P.root.position),N.body.rotation.y=P.body.rotation.y,N.targetYaw=P.targetYaw,Qt(N,P.data),N.target.visible=P.target.visible,Ot(P),W.set(S,N),x=!0}x&&(l.shadowMap.needsUpdate=!0,fn())}let Tt=Dm(()=>qe());function Qt(x,S){x.active.visible=!!(S.active&&S.alive),x.inspect.visible=S.id===Ut;let P=S.alive?[...new Set([...S.marks||[],...(S.conditions||[]).filter(E=>ut[E])])]:[];for(let E of P)!x.markGroups[E]&&ut[E]&&(x.markGroups[E]=ut[E](x.root,S));for(let[E,N]of Object.entries(x.markGroups))N.visible=P.includes(E);if(x.markGroups.strength_drain&&x.markGroups.strength_drain.children.forEach((E,N)=>{E.name==="mark-chev"&&(E.visible=N-1<Math.min(3,Math.ceil((S.str_loss||0)/2)))}),S.alive)x.body.rotation.z=0,x.body.position.y=0,x.body.visible=!0,x.downRing.visible=!1,x.deadRing.visible=!1,x.picker.visible=!0,x.picker.scale.y=1,x.picker.position.y=.65;else{x.rig.isSkinned&&x.rig.death(9999)?(x.body.rotation.z=0,x.body.position.y=0):(x.body.rotation.z=-Math.PI/2,x.body.position.y=.23),x.body.visible=S.team==="heroes";let E=S.dead===!0||(S.conditions||[]).includes("dead");x.downRing.visible=S.team==="heroes"&&!E,x.deadRing.visible=S.team==="heroes"&&E,x.picker.visible=S.team==="heroes",x.picker.scale.y=.22,x.picker.position.y=.14}x.data={...S},x.target.visible=!1}function Ot(x){Ke(x.name),x.rig.dispose&&x.rig.dispose();let S=x.rig.model?new Set(Vt(x.rig.model)):new Set;x.ownMaterials.forEach(P=>{S.has(P)||P.dispose()}),x.root.removeFromParent()}function Vt(x){let S=[];return x.traverse(P=>{P.material&&S.push(...Array.isArray(P.material)?P.material:[P.material])}),S}function xn(x,S={}){if(Se||Ue||!x?.map)return;Re=x,Ie=!!S.busy,Ut=S.inspectedId??null,S.biome!==void 0&&S.biome!==v&&(v=S.biome,nt=""),hn&&!ot&&qe(),a.classList.toggle("is-busy",Ie);let P=x.map,E=P.width!==X||P.height!==pe,N=JSON.stringify([v,P.width,P.height,P.tiles,P.scene,(x.objects||[]).map(({id:fe,kind:Ee,x:Je,y:ct,width:Rt,depth:dt,destroyed:Ht})=>({id:fe,kind:Ee,x:Je,y:ct,ow:Rt,depth:dt,destroyed:Ht}))]);N!==nt&&(he(P),nt=N),(!Y||E)&&(Y=!0,cn(!1));let z=performance.now(),$=new Set;for(let fe of x.units||[]){$.add(fe.id);let Ee=W.get(fe.id);if(Ee&&(Ee.data.kind!==fe.kind||Ee.data.team!==fe.team)&&(Ot(Ee),W.delete(fe.id),Ee=null),Ee||(Ee=Mt(fe),W.set(fe.id,Ee)),Ee.data.x!==fe.x||Ee.data.y!==fe.y){let Rt=!S.snap&&!S.ordered&&Math.abs(Ee.data.x-fe.x)+Math.abs(Ee.data.y-fe.y)===1;Ee.start.set(Ee.data.x,.04,Ee.data.y),Ee.end.set(fe.x,.04,fe.y),Ee.moveStart=z,Ee.moveEnd=!p&&Rt?z+300:0,Ee.moveEnd?Ee.root.position.copy(Ee.start):Ee.root.position.copy(Ee.end)}let Je=JSON.stringify([Ee.data.conditions,Ee.data.marks]),ct=JSON.stringify([fe.conditions,fe.marks]);(fe.hp!==Ee.data.hp||fe.max_hp!==Ee.data.max_hp||fe.name!==Ee.data.name||fe.active!==Ee.data.active||Je!==ct)&&(Ke(Ee.name),Ee.name=Oe(fe,Ee.labelY),Ee.root.add(Ee.name)),Qt(Ee,fe)}for(let[fe,Ee]of W)$.has(fe)||(Ot(Ee),W.delete(fe));let q=new Set;for(let fe of W.values())fe.data.alive!==!1&&q.add(`${fe.data.x},${fe.data.y}`);for(let fe of W.values()){let Ee=fe.data.alive===!1&&fe.data.team==="heroes"&&q.has(`${fe.data.x},${fe.data.y}`),Je=Ee?.24:0,ct=Ee?-.22:0;fe.body.position.x=Je,fe.body.position.z=ct,fe.downRing.position.set(Je,.03,ct),fe.deadRing.position.set(Je,.031,ct),fe.picker.position.x=Je,fe.picker.position.z=ct}let ce=new Set;for(let fe of x.forces||[]){ce.add(fe.id);let Ee=Ze.get(fe.id);if(!Ee){let Je=new We;Je.name="spiritual-weapon",R.add(Je),O(Je,le,J("#cfe8ff",.9),0,0,0,.04,.5,.04),O(Je,ne,J("#9fd0ff",.85),0,.3,0,.26,.17,.17),O(Je,oe("force-halo",()=>new Ct(.3,.02,6,28)),J("#bfe0ff",.8),0,.15,0).rotation.x=Math.PI/2,Je.rotation.z=-.5,Ee={g:Je},Ze.set(fe.id,Ee)}Ee.g.position.set(fe.x,1.05,fe.y)}for(let[fe,Ee]of Ze)ce.has(fe)||(Ee.g.removeFromParent(),Ze.delete(fe));S.ordered||kt.ingest(x,z),pt(b);let ae=new Set,ie=new Set,Le=new Set;for(let fe of S.selectedActions||[]){fe.kind==="move"&&Number.isInteger(fe.x)&&Number.isInteger(fe.y)?ae.add(`${fe.x},${fe.y}`):fe.kind==="spiritual_weapon_move"&&Number.isInteger(fe.x)&&Number.isInteger(fe.y)&&ie.add(`${fe.x},${fe.y}`);for(let Ee of fe.target_ids||[])Le.add(Ee);fe.target_id&&Le.add(fe.target_id)}if(x.phase==="setup"&&S.setupFigure)for(let fe=0;fe<P.height;fe++)for(let Ee=0;Ee<P.width;Ee++)!$n(P,Ee,fe)&&!(x.setup?.placements||[]).some(Je=>Je.id!==S.setupFigure&&Je.x===Ee&&Je.y===fe)&&ae.add(`${Ee},${fe}`);let be=(fe,Ee,Je)=>{for(let ct of fe){let[Rt,dt]=ct.split(",").map(Number),Ht=O(b,j,J(Ee,Ie?.12:.25),Rt,.058,dt,.84,.84,1);Ht.rotation.x=-Math.PI/2,Ht.castShadow=!1;let en=O(b,oe("move-rim",()=>{let Zt=new Vs;Zt.moveTo(-.435,-.435),Zt.lineTo(.435,-.435),Zt.lineTo(.435,.435),Zt.lineTo(-.435,.435),Zt.closePath();let $t=new _s;return $t.moveTo(-.405,-.405),$t.lineTo(-.405,.405),$t.lineTo(.405,.405),$t.lineTo(.405,-.405),$t.closePath(),Zt.holes.push($t),new Zr(Zt)}),J(Je,Ie?.35:.88),Rt,.061,dt);en.rotation.x=-Math.PI/2,en.castShadow=!1}};be(ae,"#59d8c3","#8cf0de"),be(ie,"#7cc4ff","#bfe4ff");for(let fe of Le){let Ee=W.get(fe);Ee&&(Ee.target.visible=!0)}let Xe=S.previewFriendlyFire?"#ff4a38":"#ff7a3d";for(let fe of S.previewCells||[]){let[Ee,Je]=fe,ct=O(b,j,J(Xe,Ie?.14:.42),Ee,.066,Je,.9,.9,1);ct.rotation.x=-Math.PI/2,ct.castShadow=!1}for(let fe of x.objects||[])if(!fe.destroyed){if(Le.has(fe.id)||S.inspectedId===fe.id){let Ee=O(b,j,J(Le.has(fe.id)?"#fa856e":"#b8f6ee",.38),fe.x+((fe.width||1)-1)/2,.07,fe.y+((fe.depth||1)-1)/2,fe.width||1,fe.depth||1,1);Ee.rotation.x=-Math.PI/2,Ee.castShadow=!1}M.traverse(Ee=>{Ee.userData.objectId===fe.id&&Ee.userData.mapProp&&(Ee.userData.objectState={...fe})})}l.shadowMap.needsUpdate=!0,fn()}function $e(x){let S=Array.isArray(x.effects)?x.effects.map(P=>({...P})):[];if(x.opportunity){let P=W.get(x.source_id),E=S.find(N=>N.source_id===x.source_id);P&&E&&S.unshift({id:9e5+(Number(x.id)||0)*10,type:"attack",style:"touch",variant:"opportunity",outcome:"hit",amount:0,text:"OPPORTUNITY",source_id:x.source_id,target_id:x.source_id,source:{x:P.data.x,y:P.data.y},target:{x:P.data.x,y:P.data.y}})}return S}function vn(){return{position:{x:d.position.x,y:d.position.y,z:d.position.z},target:{x:g.target.x,y:g.target.y,z:g.target.z},azimuth:g.getAzimuthalAngle()}}function _t(x,S,P=500,E=null,N={}){if(!(Se||Ue)){if(p||P<=0){lt=null;let z=N.next?.length?N.next[N.next.length-1]:null;z&&(x=z.pos,S=z.target),g.target.copy(S),d.position.copy(x),g.update(),fn();return}lt={t0:performance.now()+(N.delay||0),dur:P,fromPos:d.position.clone(),toPos:x.clone(),fromTarget:g.target.clone(),toTarget:S.clone(),orbitArc:E,ease:N.ease||"out",next:N.next?[...N.next]:[]},fn()}}function ri(x,S=null,P=.48){let E=S?S.x0:-.75,N=S?S.x1:X-.25,z=S?S.z0:-.75,$=S?S.z1:pe-.25,q=new L((E+N)/2,P,(z+$)/2),ce=x.clone().normalize(),ae=[];for(let be of[E,N])for(let Xe of[z,$])for(let fe of[-.85,1.45])ae.push(new L(be,fe,Xe));if(!S)for(let be of Re?.units||[])for(let Xe of[-.55,.55])ae.push(new L(be.x+Xe,1.62,be.y));let ie=As(ce,q,ae,S?5.6:7.2,.9);return g.maxDistance=Math.max(36,ie*1.55),d.far=Math.max(120,ie*3.4),d.updateProjectionMatrix(),h.fog.near=Math.max(30,ie*1.45),h.fog.far=Math.max(72,ie*3.3),{pos:ce.clone().multiplyScalar(ie).add(q),target:q,distance:ie}}function cn(x=!0){if(Se||Ue)return;D="tactical",Be=null,un.set(.54,.92,1.13).normalize();let{pos:S,target:P}=ri(un);x&&Y?_t(S,P,480):(lt=null,g.target.copy(P),d.position.copy(S),g.update(),g.saveState(),fn())}function as(x,S=null){if(Se||Ue)return;let P=d.position.clone().sub(g.target),E=Math.atan2(P.x,P.z)||Math.atan2(.54,1.13);if(D=x==="cinematic"?"heroic":x==="action"?"skirmish":x,Be=null,x==="heroic"||x==="cinematic"){let q=Re?.units||[],ce=S&&q.find(ae=>ae.id===S)||Ut&&q.find(ae=>ae.id===Ut)||q.find(ae=>ae.id===Re?.turn_id&&ae.alive!==!1)||q.find(ae=>ae.alive!==!1)||q[0];if(ce){let ae=q.filter(ct=>ct.alive!==!1&&ct.team!==ce.team),ie=ce.team==="heroes"?1:-1,Le=0;if(ae.length){let ct=ae.reduce((en,Zt)=>{let $t=(Zt.x-ce.x)**2+(Zt.y-ce.y)**2;return $t<en.d?{f:Zt,d:$t}:en},{f:ae[0],d:1/0}).f,Rt=ct.x-ce.x,dt=ct.y-ce.y,Ht=Math.hypot(Rt,dt)||1;ie=Rt/Ht,Le=dt/Ht}let be=new L(an.clamp(ce.x+ie*.75,0,X-1),.74,an.clamp(ce.y+Le*.75,0,pe-1)),Xe=-Le*.52,fe=ie*.52,Ee=new L(-ie*.88+Xe,.44,-Le*.88+fe).normalize(),Je=be.clone().addScaledVector(Ee,4.45);_t(Je,be,560)}else{let ae=(X-1)/2,ie=(pe-1)/2,Le=new L(ae,.55,ie),be=new L(Math.sin(E)*.92,.36,Math.cos(E)*.92).normalize();_t(Le.clone().addScaledVector(be,8.2),Le,540)}return}if(x==="skirmish"||x==="action"){let q=(Re?.units||[]).filter(ce=>ce.alive!==!1);if(q.length){let ce={x0:Math.max(-.7,Math.min(...q.map(be=>be.x))-1.8),x1:Math.min(X-.3,Math.max(...q.map(be=>be.x))+1.8),z0:Math.max(-.7,Math.min(...q.map(be=>be.y))-1.8),z1:Math.min(pe-.3,Math.max(...q.map(be=>be.y))+1.8)},ae=new L(Math.sin(E)*.82,.72,Math.cos(E)*.82).normalize(),{pos:ie,target:Le}=ri(ae,ce,.52);_t(ie,Le,500);return}}if(x==="reverse"){gi(Math.PI,480);return}let N=Math.hypot(.54,1.13);un.set(Math.sin(E)*N,.92,Math.cos(E)*N).normalize();let{pos:z,target:$}=ri(un);_t(z,$,500)}function gi(x,S=400){if(Se||Ue)return;let P=lt?lt.toTarget.clone():g.target.clone(),E=lt?lt.toPos.clone():d.position.clone(),N=E.clone().sub(P),z=Math.max(.5,Math.hypot(N.x,N.z)),$=Math.atan2(N.x,N.z),q=$+x,ce=new L(P.x+Math.sin(q)*z,E.y,P.z+Math.cos(q)*z);_t(ce,P,S,{radius:z,y:E.y,a0:$,a1:q})}function Fi(x,S=!1){if(Se||Ue)return;let P=(Re?.units||[]).find(ae=>ae.id===x);if(!P)return;if(S){as("heroic",x);return}let E=d.position.clone().sub(g.target),N=E.length(),z=E.y/Math.max(.1,N)>.92?new L(.54,.82,1.13).normalize():E.normalize(),$=Math.min(Math.max(N,5.8),9.2),q=new L(P.x,.58,P.y),ce=q.clone().addScaledVector(z,$);_t(ce,q,460)}function wt(){lt=null,Be=null,Re&&(tt=!0)}function sn(){let x=d.position.clone().sub(g.target),S=Math.atan2(x.x,x.z),P=Math.hypot(.54,1.13);return new L(Math.sin(S)*P,.92,Math.cos(S)*P).normalize()}function Nn(x=1){let S=Math.max(1,a.clientWidth),P=Math.max(1,a.clientHeight),E=At||{top:0,bottom:P,left:0,right:S},N=2*E.left/S-1,z=2*E.right/S-1,$=1-2*E.bottom/P,q=1-2*E.top/P,ce=(N+z)/2,ae=($+q)/2;return N=ce+(N-ce)*x,z=ce+(z-ce)*x,$=ae+($-ae)*x,q=ae+(q-ae)*x,{x0:N,x1:z,y0:$,y1:q}}let zt=new gn,jt=new L;function Wn(x,S,P){for(let E of S)if(jt.copy(E).project(x),jt.z>=1||jt.x<P.x0||jt.x>P.x1||jt.y<P.y0||jt.y>P.y1)return!1;return!0}function As(x,S,P,E=5.6,N=.88){let z=Nn(N);zt.copy(d);let $=ae=>{zt.position.copy(S).addScaledVector(x,ae),zt.lookAt(S),zt.updateMatrixWorld(!0)},q=E,ce=E;for(let ae=0;ae<12&&($(ce),!Wn(zt,P,z));ae++)q=ce,ce*=1.6;if(ce===E)return E;for(let ae=0;ae<22;ae++){let ie=(q+ce)/2;$(ie),Wn(zt,P,z)?ce=ie:q=ie}return ce}function qm(x){if(Se||Ue)return;let S=Math.max(1,a.clientWidth),P=Math.max(1,a.clientHeight),E=x&&x.bottom-x.top>80&&x.right-x.left>80?{top:Math.max(0,x.top),bottom:Math.min(P,x.bottom),left:Math.max(0,x.left),right:Math.min(S,x.right)}:null;((z,$)=>!z&&!$||z&&$&&["top","bottom","left","right"].every(q=>Math.abs(z[q]-$[q])<24))(E,At)||(At=E,Pf())}function Pf(){let x=Math.max(1,a.clientWidth),S=Math.max(1,a.clientHeight);if(!At){d.clearViewOffset(),d.updateProjectionMatrix(),fn();return}let P=(At.left+At.right)/2-x/2,E=(At.top+At.bottom)/2-S/2,N=1+2*Math.max(Math.abs(P)/x,Math.abs(E)/S);d.setViewOffset(N*x,N*S,(N-1)*x/2-P,(N-1)*S/2-E,x,S),d.updateProjectionMatrix(),fn()}function Ym(){let x=[];for(let S of[-.75,X-.25])for(let P of[-.75,pe-.25])for(let E of[-.85,1.45])x.push(new L(S,E,P));for(let S of Re?.units||[])S.alive!==!1&&x.push(new L(S.x,1.62,S.y));return x}function ih(x){let S=sn(),P=ri(S);if(!x)return P;let E=Ym(),N=new L(x.x,.48,x.z);for(let z of[.9,.7,.5,.3]){let $=P.target.clone().lerp(N,z),q=As(S,$,E,7.2);if(q<=P.distance*1.2)return{target:$,distance:q,pos:$.clone().addScaledVector(S,q)}}return P}function Fa(x,S=.58){let P=W.get(x);return P?new L(P.root.position.x,S,P.root.position.z):null}function Km(x,S=.8){return d.updateMatrixWorld(),Wn(d,x,Nn(S))}function sh(){return De&&!tt&&!Se&&!Ue&&!!Re}function Zm(x,{player:S=!1}={}){if(!De||Se||Ue||!Re)return!1;let P=Fa(x,.55);if(!P)return!1;if(tt=!1,Be=null,D==="heroic")return as("heroic",x),!0;let E=ih(P);if(S&&!p){let N=sn(),z=d.position.distanceTo(g.target),$=an.clamp(E.distance*.72,6.2,Math.max(6.2,z));_t(P.clone().addScaledVector(N,$),P,650,null,{ease:"inout",next:[{pos:E.pos,target:E.target,dur:1100,hold:300}]})}else _t(E.pos,E.target,800,null,{ease:"inout"});return w={kind:"turn",id:x,at:performance.now()},!0}function $m(x){if(!sh())return;let S=x.action,P=(S.moves||[]).find($=>$.path?.length>1)?.source_id,E=d.position.clone().sub(g.target);if(P){let $=Kt&&!p&&D!=="heroic"&&P===S.source_id;lt=null;let q=E.length();if($){let ce=Fa(P),ae=[];if(ce)for(let ie of[-2.2,2.2])for(let Le of[-2.2,2.2])for(let be of[0,1.7])ae.push(new L(ce.x+ie,be,ce.z+Le));q=Math.min(E.length(),ce?As(sn(),ce,ae,6.2,.9):7.4)}Be={id:P,zoom:$,dir:$?sn():E.clone().normalize(),dist:q,last:null},w={kind:"move",id:P,at:performance.now()};return}let N=[...new Set((x.events||[]).map($=>$.target_id).filter($=>$&&$!==S.source_id))],z=[S.source_id,...N].map($=>Fa($,.9)).filter(Boolean);if(!(!z.length||D==="heroic")){if(Kt&&!p&&N.length){let $=new Bn().setFromPoints(z).expandByScalar(1.3),q=$.getCenter(new L);q.y=.6;let ce=[];for(let Le of[$.min.x,$.max.x])for(let be of[$.min.z,$.max.z])ce.push(new L(Le,0,be),new L(Le,1.7,be));let ae=sn(),ie=As(ae,q,ce,6.4,.8);_t(q.clone().addScaledVector(ae,ie),q,480,null,{ease:"inout"}),x.zoomed=!0,w={kind:"attack",id:S.source_id,at:performance.now()}}else if(!Km(z)){let $=ih(z[0]);_t($.pos,$.target,600,null,{ease:"inout"})}}}function Jm(x){let S=!!(Be&&Be.zoom||x.zoomed),P=Be?.id||x.action.source_id;if(Be=null,te={at:Math.round(performance.now()),zoomed:S,active:sh()},!sh()||!S)return;let E=x.newlyDead.size>0||(x.events||[]).some(z=>z.crit),N=ih(Fa(P)||g.target);_t(N.pos,N.target,950,null,{ease:"inout",delay:E?900:380})}function jm(x){let S=W.get(Be.id);if(!S)return Be=null,!1;let P=Be.last===null?.016:Math.min(1,(x-Be.last)/1e3);Be.last=x;let E=1-Math.exp(-P/.22),N=new L(S.root.position.x,.58,S.root.position.z);if(Be.zoom)return g.target.lerp(N,E),d.position.lerp(N.clone().addScaledVector(Be.dir,Be.dist),E),!0;if(d.updateMatrixWorld(),!Wn(d,[N],Nn(.62))){let z=N.clone().sub(g.target);z.y=0,z.multiplyScalar(E*1.6),g.target.add(z),d.position.add(z)}return!0}function Qm(x){De=!!x,De||(Be=null)}function e0(x){Kt=!!x}function t0(){return{autoCam:De,actionZoom:Kt,manualHold:tt,preset:D,tracking:Be?.id||null,tween:!!lt,playing:!!ot,actor:ot?.action?.source_id||null,last:w,ended:te}}function rh(){for(;T.children.length;)T.remove(T.children[0]);for(;Te.length;)Te.pop().dispose()}function n0({hoverCell:x=null,pathCells:S=null,pathColor:P="#6af7df",pathDotColor:E="#a8fff0",arcFrom:N=null,arcTo:z=null,arcColor:$="#ffd478",areaCells:q=null,areaColor:ce="#ff7a3d"}={}){if(!(Se||Ue)){if(rh(),x&&Number.isInteger(x.x)&&Number.isInteger(x.y)){let ae=O(T,oe("hover-bracket",()=>{let ie=new Vs;ie.moveTo(-.47,-.47),ie.lineTo(.47,-.47),ie.lineTo(.47,.47),ie.lineTo(-.47,.47),ie.closePath();let Le=new _s;return Le.moveTo(-.42,-.42),Le.lineTo(-.42,.42),Le.lineTo(.42,.42),Le.lineTo(.42,-.42),Le.closePath(),ie.holes.push(Le),new Zr(ie)}),J(x.color||"#ffe194",.92),x.x,.068,x.y);ae.rotation.x=-Math.PI/2,ae.castShadow=!1}if(Array.isArray(q)&&q.length)for(let[ae,ie]of q){let Le=O(T,j,J(ce,.36),ae,.067,ie,.88,.88,1);Le.rotation.x=-Math.PI/2,Le.castShadow=!1}if(Array.isArray(S)&&S.length>=2){let ae=S.map(([Xe,fe])=>new L(Xe,.11,fe)),ie=new qr(ae,!1,"catmullrom",.15),Le=new $r(ie,Math.max(8,S.length*6),.042,8,!1);Te.push(Le);let be=new tn(Le,J(P,.88));T.add(be);for(let Xe=1;Xe<S.length;Xe++){let[fe,Ee]=S[Xe],Je=O(T,le,J(E,.92),fe,.1,Ee,.11,.03,.11);Je.castShadow=!1}}if(N&&z){let ae=new L(N.x,1.02,N.y),ie=new L(z.x,.86,z.y),Le=ae.distanceTo(ie),be=ae.clone().lerp(ie,.5);be.y+=Math.min(2.6,.65+Le*.24);let Xe=new Gs(ae,be,ie),fe=new $r(Xe,28,.036,8,!1);Te.push(fe),T.add(new tn(fe,J($,.86)));let Ee=ze(T,ye,J($,.95),.075);Ee.position.x=z.x,Ee.position.z=z.y,Ee.scale.setScalar(1.08)}fn()}}function i0(x){v=x==="auto"?null:x,Re&&(nt="",xn(Re,{snap:!0,ordered:!0,inspectedId:Ut}))}function s0(x){m=!!x&&!p,m&&fn()}function r0(x){y=x,fn()}function If(x,S,P){return d.updateMatrixWorld(),Pt.set(x,S,P).project(d),{x:(Pt.x+1)*a.clientWidth/2,y:(1-Pt.y)*a.clientHeight/2,visible:Pt.z>-1&&Pt.z<1&&Math.abs(Pt.x)<=1&&Math.abs(Pt.y)<=1}}function o0(x,S){return If(x,.055,S)}function a0(x){let S=W.get(x);return S?If(S.root.position.x,.65,S.root.position.z):null}function uo(){if(Se||Ue)return;let x=Math.max(1,s.clientWidth),S=Math.max(1,s.clientHeight);l.setPixelRatio(Math.min(window.devicePixelRatio||1,f)),l.setSize(x,S,!1);let P=x/S,E=d.aspect;d.aspect=P,d.updateProjectionMatrix(),At&&Pf(),!Y&&Re?(Y=!0,cn(!1)):Re&&Math.abs(Math.log(P/E))>.25?cn(!1):fn()}function Lf(){Se||Ue||(g.target.x=an.clamp(g.target.x,-1,X),g.target.z=an.clamp(g.target.z,-1,pe),g.target.y=an.clamp(g.target.y,0,1.5),n?.(vn()),fn())}let Ba=0;function fn(){!_e&&!Se&&!Ue&&!document.hidden&&(_e=requestAnimationFrame(h0))}function ur(){let x=ot;ot=null,Be=null;for(let S of W.values())S.data.alive&&S.rig.reset();kt.clear(),u0(),x?.resolve(!1),hn&&qe()}function l0(x,S={}){if(Se||Ue||document.hidden)return Promise.resolve(!1);ot&&ur();let P=$e(x);return p?(kt.play(P,performance.now()),S.impact?.(),Promise.resolve(!0)):new Promise(E=>{let N=P.find(ie=>ie.source_id===x.source_id&&ie.style!=="touch")||P[0]||null,z=N?.style||null,$=x.kind==="dash"||(x.moves||[]).some(ie=>ie.path.length>=6),q=$?200:320,ce=(x.moves||[]).reduce((ie,Le)=>ie+Math.max(0,Le.path.length-1),0),ae=new Set;for(let ie of x.after?.units||[])(x.before?.units||[]).find(be=>be.id===ie.id)?.alive&&!ie.alive&&ae.add(ie.id);ot={action:x,events:P,primary:N,callbacks:S,resolve:E,style:z,stepMs:q,isDash:$,newlyDead:ae,start:null,impacted:!1,duration:z?Sm(z):ce?ce*q:220},$m(ot),fn()})}function c0(x){let S=ot;if(!S)return!1;if(S.start===null){S.start=x;let $=W.get(S.action.source_id),q=S.primary;if($&&q){let ce=q.target.x-q.source.x,ae=q.target.y-q.source.y;(ce||ae)&&($.body.rotation.y=Math.atan2(-ce,-ae),$.targetYaw=$.body.rotation.y),$.rig.pose(S.style,Vu,S.action.kind),$.root.updateWorldMatrix(!0,!0);let ie=new L;(S.style==="arrow"?$.rig.bow:S.style==="dreadful_glare"&&$.rig.head||$.rig.right).getWorldPosition(ie),kt.play(S.events,x,{releaseAt:Vu,impactAt:Vc(S.style)},ie.toArray())}else S.events.length&&kt.play(S.events,x,{releaseAt:80,impactAt:220})}let P=x-S.start,E=W.get(S.action.source_id);E&&S.style&&E.rig.pose(S.style,P,S.action.kind);let N=P;for(let $ of S.action.moves||[]){let q=W.get($.source_id),ce=$.path,ae=Math.max(0,ce.length-1)*S.stepMs;if(q&&ce.length&&N>=0){let ie=Math.min(ce.length-1,Math.floor(N/S.stepMs)),Le=Math.min(ce.length-1,ie+1),be=ie===Le?0:N%S.stepMs/S.stepMs,[Xe,fe]=ce[ie],[Ee,Je]=ce[Le];if(q.root.position.set(Xe+(Ee-Xe)*be,.04,fe+(Je-fe)*be),Ee!==Xe||Je!==fe){let ct=Math.atan2(Xe-Ee,fe-Je);q.body.rotation.y=Ab(q.body.rotation.y,ct,.36),q.targetYaw=ct}N<=ae?q.rig.walk?.(N,S.isDash):q.rig.idle?.(x),S.lastStep!==`${$.source_id}:${ie}`&&(S.lastStep=`${$.source_id}:${ie}`,se(Xe,fe),S.callbacks.step?.($.source_id,Xe,fe))}N-=ae}let z=S.style?Vc(S.style):S.duration;for(let $ of S.events)if($.outcome==="hit"&&$.amount>0&&$.target_id!==S.action.source_id){let q=W.get($.target_id);q&&P>=z&&(S.newlyDead.has($.target_id)?(q.body.visible=!0,q.rig.death?.(P-z)):q.rig.hit?.(P-z))}if(!S.impacted&&P>=z){S.impacted=!0,S.callbacks.impact?.();for(let $ of S.newlyDead){let q=W.get($);q&&q.rig.isSkinned&&(q.body.visible=!0)}}if(l.shadowMap.needsUpdate=!0,P>=S.duration){for(let[$,q]of W)q.data.alive?q.rig.reset():q.data.team!=="heroes"?q.body.visible=!1:q.rig.death?.(9999);return ot=null,Jm(S),S.resolve(!0),hn&&qe(),!1}return!0}function h0(x){if(_e=0,Se||Ue)return;let S=!1;if(lt&&x<lt.t0)lt.fromPos.copy(d.position),lt.fromTarget.copy(g.target),S=!0;else if(lt){let E=an.clamp((x-lt.t0)/Math.max(1,lt.dur),0,1),N=lt.ease==="inout"?E<.5?4*E**3:1-(-2*E+2)**3/2:1-Math.pow(1-E,3);if(g.target.lerpVectors(lt.fromTarget,lt.toTarget,N),lt.orbitArc){let z=lt.orbitArc.a0+(lt.orbitArc.a1-lt.orbitArc.a0)*N;d.position.set(g.target.x+Math.sin(z)*lt.orbitArc.radius,lt.orbitArc.y,g.target.z+Math.cos(z)*lt.orbitArc.radius)}else d.position.lerpVectors(lt.fromPos,lt.toPos,N);if(E>=1){let z=lt.next.shift();if(z){let $=lt.next;_t(z.pos,z.target,z.dur,null,{ease:"inout",delay:z.hold||0,next:$}),S=!0}else lt=null}else S=!0}else Be&&(S=jm(x)||S);g.update(),S=c0(x)||S;let P=!1;for(let E of W.values())if(E.moveEnd>0){P=!0;let N=E.moveEnd===E.moveStart?1:an.clamp((x-E.moveStart)/(E.moveEnd-E.moveStart),0,1),z=N*N*(3-2*N);E.root.position.lerpVectors(E.start,E.end,z),E.rig.walk?.(x-E.moveStart,!1),N>=1?(E.moveEnd=0,E.rig.reset()):S=!0}else if(m&&!ot&&E.data.alive&&E.rig.isSkinned){let N=(E.data.conditions||[]).includes("dodge");E.rig.idle(x,N)}if((m||ot)&&ge.length)for(let E of ge){let N=Math.sin(x*.011+E.phase)*.14+Math.cos(x*.023+E.phase*1.7)*.08;E.flame.scale.y=E.baseScaleY*(1+N),E.flame.rotation.z=Math.sin(x*.008+E.phase)*.14,E.light&&(E.light.intensity=E.baseIntensity*(1+N*.55))}for(let E=ee.length-1;E>=0;E--){let N=ee[E],z=(x-N.born)/420;z>=1?(N.mesh.removeFromParent(),N.mat.dispose(),ee.splice(E,1)):(N.mesh.position.y=.08+z*.18,N.mesh.scale.setScalar(.06+z*.1),N.mat.opacity=.42*(1-z),S=!0)}if(m||ot){for(let E of Ze.values())E.g.position.y=1.05+Math.sin(x*.004)*.06,E.g.rotation.y=x*.0018;for(let E of de){let N=x*.001*E.speed+E.phase,z=(E.yOffset+x*18e-5*E.speed)%2.15;E.mesh.position.y=.16+z,E.mesh.position.x=E.baseX+Math.sin(N)*.24,E.mesh.position.z=E.baseZ+Math.cos(N*.85)*.24;let $=Math.sin(z/2.15*Math.PI);E.mat.opacity=.12+$*.42}}S=kt.tick(x,d,a.clientHeight)||S,Fe(),P&&(l.shadowMap.needsUpdate=!0),l.render(h,d),!me&&Re&&(me=!0,i?.(vn())),S?fn():m&&(clearTimeout(Ba),Ba=setTimeout(fn,Cb))}function Df(){let x=[];for(let S of W.values())S.picker.visible&&S.root.visible&&x.push(S.picker);return x}function Nf(x){let S=x.filter(N=>N.object.userData.unitId!=null);if(!S.length)return null;let P=S[0],E=W.get(P.object.userData.unitId);if(E&&E.data.alive===!1){let N=S.find(z=>{let $=W.get(z.object.userData.unitId);return $&&$.data.alive!==!1&&$.data.x===E.data.x&&$.data.y===E.data.y});if(N)return N}return P}function Uf(x){if(Ne.add(x.pointerId),Ne.size!==1){xe=null,wt();return}xe=x.isPrimary&&x.button===0?{id:x.pointerId,x:x.clientX,y:x.clientY,time:performance.now(),dragged:!1}:null,x.button!==0&&wt()}function Of(x){if(xe?.id===x.pointerId&&Math.hypot(x.clientX-xe.x,x.clientY-xe.y)>5&&(xe.dragged=!0,wt()),Ne.size||!t||!Re||Se||Ue)return;let S=a.getBoundingClientRect();if(x.clientX<S.left||x.clientX>S.right||x.clientY<S.top||x.clientY>S.bottom)return;Ye.set((x.clientX-S.left)/S.width*2-1,1-(x.clientY-S.top)/S.height*2),d.updateMatrixWorld(),h.updateMatrixWorld(!0),Qe.setFromCamera(Ye,d);let P=Nf(Qe.intersectObjects(Df(),!1));if(P){let E=W.get(P.object.userData.unitId);if(E){let N=`u:${E.data.id}:${x.clientX>>2}:${x.clientY>>2}`;N!==It&&(It=N,t({x:E.data.x,y:E.data.y,unitId:E.data.id,clientX:x.clientX,clientY:x.clientY}));return}}if(Qe.ray.intersectPlane(rt,gt)){let E=Math.floor(gt.x+.5),N=Math.floor(gt.z+.5);if(E>=0&&N>=0&&E<X&&N<pe){let z=(Re.units||[]).find(ce=>ce.x===E&&ce.y===N&&ce.alive!==!1)||(Re.units||[]).find(ce=>ce.x===E&&ce.y===N&&ce.team==="heroes"),$=(Re.objects||[]).find(ce=>!ce.destroyed&&Hu(ce,E,N)),q=`c:${E}:${N}:${z?.id||$?.id||""}:${x.clientX>>2}:${x.clientY>>2}`;q!==It&&(It=q,t({x:E,y:N,unitId:z?.id||$?.id||null,clientX:x.clientX,clientY:x.clientY}));return}}It!=="none"&&(It="none",t(null))}function Ff(){It!=="none"&&(It="none",t?.(null))}function Bf(){wt()}function kf(x){Ne.delete(x.pointerId);let S=xe;if(xe=null,!S||S.id!==x.pointerId||S.dragged||Ne.size||Ie||!Re||Se||Ue||Math.hypot(x.clientX-S.x,x.clientY-S.y)>6||performance.now()-S.time>700)return;let P=a.getBoundingClientRect();if(x.clientX<P.left||x.clientX>P.right||x.clientY<P.top||x.clientY>P.bottom)return;Ye.set((x.clientX-P.left)/P.width*2-1,1-(x.clientY-P.top)/P.height*2),d.updateMatrixWorld(),h.updateMatrixWorld(!0),Qe.setFromCamera(Ye,d);let E=Qe.intersectObjects(Df(),!1),N=Nf(E);if(N){let ie=W.get(N.object.userData.unitId);if(ie){e?.(ie.data.x,ie.data.y,ie.data.id);return}}let z=Qe.intersectObject(M,!0).find(ie=>ie.object.userData.objectId!=null&&ie.object.parent?.visible!==!1);if(z){let ie=(Re.objects||[]).find(Le=>Le.id===z.object.userData.objectId&&!Le.destroyed);if(ie){e?.(ie.x,ie.y,ie.id);return}}if(!Qe.ray.intersectPlane(rt,gt))return;let $=Math.floor(gt.x+.5),q=Math.floor(gt.z+.5);if($<0||q<0||$>=X||q>=pe)return;let ce=(Re.units||[]).find(ie=>ie.x===$&&ie.y===q&&ie.alive!==!1)||(Re.units||[]).find(ie=>ie.x===$&&ie.y===q&&ie.team==="heroes"),ae=(Re.objects||[]).find(ie=>!ie.destroyed&&Hu(ie,$,q));e?.($,q,ce?.id||ae?.id)}function zf(x){Ne.delete(x.pointerId),xe=null}function Hf(x){x?.preventDefault(),!(Ue||Se)&&(Ue=!0,cancelAnimationFrame(_e),clearTimeout(Ba),_e=0,ur(),kt.dispose(),g.enabled=!1,s.dataset.renderer="unavailable",a.dataset.renderer="unavailable",r?.("The WebGL context was lost.",{lost:!0}))}function u0(){for(let x of W.values())x.moveEnd&&(x.root.position.copy(x.end),x.moveEnd=0);l.shadowMap.needsUpdate=!0}function Gf(x){p=x.matches,p&&(m=!1),kt.setReducedMotion(p),p&&ur(),fn()}function Vf(){kt.setHidden(document.hidden),document.hidden?(cancelAnimationFrame(_e),_e=0,ur()):fn()}g.addEventListener("change",Lf),a.addEventListener("pointerdown",Uf,{capture:!0}),a.addEventListener("pointermove",Of,{capture:!0}),a.addEventListener("pointerleave",Ff),a.addEventListener("wheel",Bf,{passive:!0}),window.addEventListener("pointerup",kf),window.addEventListener("pointercancel",zf),a.addEventListener("webglcontextlost",Hf),_?.addEventListener?.("change",Gf),document.addEventListener("visibilitychange",Vf);let Wf=typeof ResizeObserver=="function"?new ResizeObserver(uo):null;Wf?.observe(s),window.addEventListener("resize",uo);function f0(){if(!Se){Se=!0,cancelAnimationFrame(_e),clearTimeout(Ba),Wf?.disconnect(),Tt(),ur(),rh(),kt.dispose(),g.removeEventListener("change",Lf),g.dispose(),a.removeEventListener("pointerdown",Uf,{capture:!0}),a.removeEventListener("pointermove",Of,{capture:!0}),a.removeEventListener("pointerleave",Ff),a.removeEventListener("wheel",Bf),window.removeEventListener("pointerup",kf),window.removeEventListener("pointercancel",zf),a.removeEventListener("webglcontextlost",Hf),window.removeEventListener("resize",uo),document.removeEventListener("visibilitychange",Vf),_?.removeEventListener?.("change",Gf);for(let x of ee)x.mesh.removeFromParent(),x.mat.dispose();ee.length=0,cr();for(let x of W.values())Ot(x);W.clear(),U.forEach(x=>x.dispose()),K.forEach(x=>x.dispose()),Q.forEach(x=>x.dispose()),M.traverse(x=>{x.isInstancedMesh&&x.dispose()}),h.traverse(x=>{x.isLight&&x.dispose()}),h.clear(),l.dispose(),l.forceContextLoss(),a.remove(),(s.dataset.renderer==="webgl"||s.dataset.renderer==="unavailable")&&delete s.dataset.renderer}}return uo(),cn(!1),{update:xn,playAction:l0,cancelPlayback:ur,resetCamera:cn,setCameraPreset:as,orbitBy:gi,focusUnit:Fi,directTurn:Zm,setAutoCamera:Qm,setActionZoom:e0,getDirectorState:t0,setSafeArea:qm,setTacticalPreview:n0,clearHoverPreview:rh,setBiome:i0,getActiveTheme:()=>Me,setIdleLoop:s0,setLabelMode:r0,resize:uo,dispose:f0,getCameraState:vn,getAssetState:$c,getEffectState:kt.getState,projectCell:o0,projectUnit:a0,renderer:l,canvas:a,scene:h,camera:d,controls:g}}return x0(Ib);})();
