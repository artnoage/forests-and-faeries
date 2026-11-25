var EmberScene=(()=>{var vh=Object.defineProperty;var I0=Object.getOwnPropertyDescriptor;var L0=Object.getOwnPropertyNames;var D0=Object.prototype.hasOwnProperty;var N0=(s,e)=>{for(var t in e)vh(s,t,{get:e[t],enumerable:!0})},U0=(s,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of L0(e))!D0.call(s,i)&&i!==t&&vh(s,i,{get:()=>e[i],enumerable:!(n=I0(e,i))||n.enumerable});return s};var O0=s=>U0(vh({},"__esModule",{value:!0}),s);var Kb={};N0(Kb,{PRESET_DEFAULT_THEME:()=>t0,THEME_CATALOG:()=>e0,createViewer:()=>Yb,disposeAssets:()=>Qm,getAssetState:()=>uh,getCastState:()=>Fd,getUndeadState:()=>Bd,prepareAssets:()=>jm,resolveCastKey:()=>dr});/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var Ts={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ws={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ip=0,cu=1,sp=2;var nr=1,rp=2,lo=3,Oi=0,Yn=1,Dn=2,ir=0,As=1,sr=2,hu=3,uu=4,op=5;var rr=100,ap=101,lp=102,cp=103,hp=104,up=200,dp=201,fp=202,pp=203,du=204,fu=205,mp=206,gp=207,_p=208,yp=209,xp=210,vp=211,Mp=212,bp=213,Sp=214,Ll=0,Dl=1,Nl=2,Br=3,Ul=4,Ol=5,Fl=6,Bl=7,pu=0,Ep=1,Tp=2,Fi=0,mu=1,gu=2,_u=3,Sa=4,yu=5,xu=6,vu=7,Zh="attached",wp="detached",Mu=300,or=301,co=302,oc=303,ac=304,ii=1e3,di=1001,kr=1002,yn=1003,lc=1004;var ar=1005;var Tn=1006,ho=1007;var gi=1008;var jn=1009,bu=1010,Su=1011,uo=1012,cc=1013,Ei=1014,oi=1015,Ti=1016,hc=1017,uc=1018,lr=1020,Eu=35902,Tu=35899,wu=1021,Au=1022,_i=1023,Ji=1026,as=1027,dc=1028,fc=1029,Rs=1030,pc=1031;var mc=1033,Ea=33776,Ta=33777,wa=33778,Aa=33779,gc=35840,_c=35841,yc=35842,xc=35843,vc=36196,Mc=37492,bc=37496,Sc=37488,Ec=37489,Ra=37490,Tc=37491,wc=37808,Ac=37809,Rc=37810,Cc=37811,Pc=37812,Ic=37813,Lc=37814,Dc=37815,Nc=37816,Uc=37817,Oc=37818,Fc=37819,Bc=37820,kc=37821,zc=36492,Hc=36494,Gc=36495,Vc=36283,Wc=36284,Ca=36285,Xc=36286,qc=2200,Ap=2201,Rp=2202,Hs=2300,Gs=2301,Pl=2302,$h=2303,Bs=2400,ks=2401,Vo=2402,Yc=2500,Cp=2501,Ru=0,Pa=1,fo=2,Pp=3200;var Kc=0,Ip=1,ls="",jt="srgb",Vn="srgb-linear",Wo="linear",Yt="srgb";var Il=7680;var Lp=519,Dp=512,Np=513,Up=514,Cu=515,Op=516,Fp=517,Pu=518,Iu=519,Lu=35044;var Du="300 es",fi=2e3,zr=2001;function F0(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function B0(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Hr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Bp(){let s=Hr("canvas");return s.style.display="block",s}var af={},Gr=null;function Xo(...s){let e="THREE."+s.shift();Gr?Gr("log",e,...s):console.log(e,...s)}function kp(s){let e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function ct(...s){s=kp(s);let e="THREE."+s.shift();if(Gr)Gr("warn",e,...s);else{let t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function pt(...s){s=kp(s);let e="THREE."+s.shift();if(Gr)Gr("error",e,...s);else{let t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function zs(...s){let e=s.join(" ");e in af||(af[e]=!0,ct(...s))}function zp(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Hp={[Ll]:Ll,[Nl]:Fl,[Ul]:Ul,[Br]:Ol,[Dl]:Dl,[Fl]:Nl,[Bl]:Bl,[Ol]:Br},pi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}},On=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],lf=1234567,ko=Math.PI/180,Vs=180/Math.PI;function wi(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(On[s&255]+On[s>>8&255]+On[s>>16&255]+On[s>>24&255]+"-"+On[e&255]+On[e>>8&255]+"-"+On[e>>16&15|64]+On[e>>24&255]+"-"+On[t&63|128]+On[t>>8&255]+"-"+On[t>>16&255]+On[t>>24&255]+On[n&255]+On[n>>8&255]+On[n>>16&255]+On[n>>24&255]).toLowerCase()}function St(s,e,t){return Math.max(e,Math.min(t,s))}function Nu(s,e){return(s%e+e)%e}function k0(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function z0(s,e,t){return s!==e?(t-s)/(e-s):0}function zo(s,e,t){return(1-t)*s+t*e}function H0(s,e,t,n){return zo(s,e,1-Math.exp(-t*n))}function G0(s,e=1){return e-Math.abs(Nu(s,e*2)-e)}function V0(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function W0(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function X0(s,e){return s+Math.floor(Math.random()*(e-s+1))}function q0(s,e){return s+Math.random()*(e-s)}function Y0(s){return s*(.5-Math.random())}function K0(s){s!==void 0&&(lf=s);let e=lf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Z0(s){return s*ko}function $0(s){return s*Vs}function J0(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function j0(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Uu(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Q0(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),d=o((e+n)/2),f=r((e-n)/2),h=o((e-n)/2),u=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*d,l*f,l*h,a*c);break;case"YZY":s.set(l*h,a*d,l*f,a*c);break;case"ZXZ":s.set(l*f,l*h,a*d,a*c);break;case"XZX":s.set(a*d,l*g,l*u,a*c);break;case"YXY":s.set(l*u,a*d,l*g,a*c);break;case"ZYZ":s.set(l*g,l*u,a*d,a*c);break;default:ct("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Zc(s){switch(s.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ou(s,e){if(e.constructor===Float32Array)return s;let t=Zc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(s/t,-1)}function Fu(s,e){if(e.constructor===Float32Array)return s;let t=Zc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(s*t)}var an={DEG2RAD:ko,RAD2DEG:Vs,generateUUID:wi,clamp:St,euclideanModulo:Nu,mapLinear:k0,inverseLerp:z0,lerp:zo,damp:H0,pingpong:G0,smoothstep:V0,smootherstep:W0,randInt:X0,randFloat:q0,randFloatSpread:Y0,seededRandom:K0,degToRad:Z0,radToDeg:$0,isPowerOfTwo:J0,ceilPowerOfTwo:j0,floorPowerOfTwo:Uu,setQuaternionFromProperEuler:Q0,normalize:Fu,denormalize:Ou},Ee=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=St(this.x,e.x,t.x),this.y=St(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=St(this.x,e,t),this.y=St(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(St(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(St(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},En=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],d=n[i+2],f=n[i+3],h=r[o+0],u=r[o+1],g=r[o+2],_=r[o+3];if(f!==_||l!==h||c!==u||d!==g){let p=l*h+c*u+d*g+f*_;p<0&&(h=-h,u=-u,g=-g,_=-_,p=-p);let m=1-a;if(p<.9995){let y=Math.acos(p),M=Math.sin(y);m=Math.sin(m*y)/M,a=Math.sin(a*y)/M,l=l*m+h*a,c=c*m+u*a,d=d*m+g*a,f=f*m+_*a}else{l=l*m+h*a,c=c*m+u*a,d=d*m+g*a,f=f*m+_*a;let y=1/Math.sqrt(l*l+c*c+d*d+f*f);l*=y,c*=y,d*=y,f*=y}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],l=n[i+1],c=n[i+2],d=n[i+3],f=r[o],h=r[o+1],u=r[o+2],g=r[o+3];return e[t]=a*g+d*f+l*u-c*h,e[t+1]=l*g+d*h+c*f-a*u,e[t+2]=c*g+d*u+a*h-l*f,e[t+3]=d*g-a*f-l*h-c*u,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),d=a(i/2),f=a(r/2),h=l(n/2),u=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=h*d*f+c*u*g,this._y=c*u*f-h*d*g,this._z=c*d*g+h*u*f,this._w=c*d*f-h*u*g;break;case"YXZ":this._x=h*d*f+c*u*g,this._y=c*u*f-h*d*g,this._z=c*d*g-h*u*f,this._w=c*d*f+h*u*g;break;case"ZXY":this._x=h*d*f-c*u*g,this._y=c*u*f+h*d*g,this._z=c*d*g+h*u*f,this._w=c*d*f-h*u*g;break;case"ZYX":this._x=h*d*f-c*u*g,this._y=c*u*f+h*d*g,this._z=c*d*g-h*u*f,this._w=c*d*f+h*u*g;break;case"YZX":this._x=h*d*f+c*u*g,this._y=c*u*f+h*d*g,this._z=c*d*g-h*u*f,this._w=c*d*f-h*u*g;break;case"XZY":this._x=h*d*f-c*u*g,this._y=c*u*f-h*d*g,this._z=c*d*g+h*u*f,this._w=c*d*f+h*u*g;break;default:ct("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],d=t[6],f=t[10],h=n+a+f;if(h>0){let u=.5/Math.sqrt(h+1);this._w=.25/u,this._x=(d-l)*u,this._y=(r-c)*u,this._z=(o-i)*u}else if(n>a&&n>f){let u=2*Math.sqrt(1+n-a-f);this._w=(d-l)/u,this._x=.25*u,this._y=(i+o)/u,this._z=(r+c)/u}else if(a>f){let u=2*Math.sqrt(1+a-n-f);this._w=(r-c)/u,this._x=(i+o)/u,this._y=.25*u,this._z=(l+d)/u}else{let u=2*Math.sqrt(1+f-n-a);this._w=(o-i)/u,this._x=(r+c)/u,this._y=(l+d)/u,this._z=.25*u}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(St(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+o*a+i*c-r*l,this._y=i*d+o*l+r*a-n*c,this._z=r*d+o*c+n*l-i*a,this._w=o*d-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cf.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cf.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),d=2*(a*t-r*i),f=2*(r*n-o*t);return this.x=t+l*c+o*f-a*d,this.y=n+l*d+a*c-r*f,this.z=i+l*f+r*d-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=St(this.x,e.x,t.x),this.y=St(this.y,e.y,t.y),this.z=St(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=St(this.x,e,t),this.y=St(this.y,e,t),this.z=St(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(St(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Mh.copy(this).projectOnVector(e),this.sub(Mh)}reflect(e){return this.sub(Mh.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(St(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Mh=new D,cf=new En,yt=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,i,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){let d=this.elements;return d[0]=e,d[1]=i,d[2]=a,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=o,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],d=n[4],f=n[7],h=n[2],u=n[5],g=n[8],_=i[0],p=i[3],m=i[6],y=i[1],M=i[4],v=i[7],C=i[2],R=i[5],b=i[8];return r[0]=o*_+a*y+l*C,r[3]=o*p+a*M+l*R,r[6]=o*m+a*v+l*b,r[1]=c*_+d*y+f*C,r[4]=c*p+d*M+f*R,r[7]=c*m+d*v+f*b,r[2]=h*_+u*y+g*C,r[5]=h*p+u*M+g*R,r[8]=h*m+u*v+g*b,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8];return t*o*d-t*a*c-n*r*d+n*a*l+i*r*c-i*o*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],f=d*o-a*c,h=a*l-d*r,u=c*r-o*l,g=t*f+n*h+i*u;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=f*_,e[1]=(i*c-d*n)*_,e[2]=(a*n-i*o)*_,e[3]=h*_,e[4]=(d*t-i*l)*_,e[5]=(i*r-a*t)*_,e[6]=u*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return zs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(bh.makeScale(e,t)),this}rotate(e){return zs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(bh.makeRotation(-e)),this}translate(e,t){return zs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(bh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},bh=new yt,hf=new yt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),uf=new yt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function eg(){let s={enabled:!0,workingColorSpace:Vn,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Yt&&(i.r=$i(i.r),i.g=$i(i.g),i.b=$i(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Yt&&(i.r=Or(i.r),i.g=Or(i.g),i.b=Or(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ls?Wo:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Vn]:{primaries:e,whitePoint:n,transfer:Wo,toXYZ:hf,fromXYZ:uf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:jt},outputColorSpaceConfig:{drawingBufferColorSpace:jt}},[jt]:{primaries:e,whitePoint:n,transfer:Yt,toXYZ:hf,fromXYZ:uf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:jt}}}),s}var At=eg();function $i(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Or(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var yr,kl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{yr===void 0&&(yr=Hr("canvas")),yr.width=e.width,yr.height=e.height;let i=yr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=yr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Hr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=$i(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor($i(t[n]/255)*255):t[n]=$i(t[n]);return{data:t,width:e.width,height:e.height}}else return ct("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},tg=0,Vr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:tg++}),this.uuid=wi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Sh(i[o].image)):r.push(Sh(i[o]))}else r=Sh(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function Sh(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?kl.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(ct("Texture: Unable to serialize Texture."),{})}var ng=0,Eh=new D,xn=class s extends pi{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=di,i=di,r=Tn,o=gi,a=_i,l=jn,c=s.DEFAULT_ANISOTROPY,d=ls){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ng++}),this.uuid=wi(),this.name="",this.source=new Vr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new yt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Eh).x}get height(){return this.source.getSize(Eh).y}get depth(){return this.source.getSize(Eh).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ct(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){ct(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Mu)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ii:e.x=e.x-Math.floor(e.x);break;case di:e.x=e.x<0?0:1;break;case kr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ii:e.y=e.y-Math.floor(e.y);break;case di:e.y=e.y<0?0:1;break;case kr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};xn.DEFAULT_IMAGE=null;xn.DEFAULT_MAPPING=Mu;xn.DEFAULT_ANISOTROPY=1;var Zt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,l=e.elements,c=l[0],d=l[4],f=l[8],h=l[1],u=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(d-h)<.01&&Math.abs(f-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(d+h)<.1&&Math.abs(f+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+u+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,v=(u+1)/2,C=(m+1)/2,R=(d+h)/4,b=(f+_)/4,w=(g+p)/4;return M>v&&M>C?M<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(M),i=R/n,r=b/n):v>C?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=R/i,r=w/i):C<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(C),n=b/r,i=w/r),this.set(n,i,r,t),this}let y=Math.sqrt((p-g)*(p-g)+(f-_)*(f-_)+(h-d)*(h-d));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(f-_)/y,this.z=(h-d)/y,this.w=Math.acos((c+u+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=St(this.x,e.x,t.x),this.y=St(this.y,e.y,t.y),this.z=St(this.z,e.z,t.z),this.w=St(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=St(this.x,e,t),this.y=St(this.y,e,t),this.z=St(this.z,e,t),this.w=St(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(St(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},zl=class extends pi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Zt(0,0,e,t),this.scissorTest=!1,this.viewport=new Zt(0,0,e,t),this.textures=[];let i=n.count;for(let r=0;r<i;r++)this.textures[r]=new xn({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Tn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Vr(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},si=class extends zl{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},qo=class extends xn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=yn,this.minFilter=yn,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Hl=class extends xn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=yn,this.minFilter=yn,this.wrapR=di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var mt=class s{static{this.prototype.isMatrix4=!0}constructor(e,t,n,i,r,o,a,l,c,d,f,h,u,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,d,f,h,u,g,_,p)}set(e,t,n,i,r,o,a,l,c,d,f,h,u,g,_,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=d,m[10]=f,m[14]=h,m[3]=u,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,i=1/xr.setFromMatrixColumn(e,0).length(),r=1/xr.setFromMatrixColumn(e,1).length(),o=1/xr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),d=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){let h=o*d,u=o*f,g=a*d,_=a*f;t[0]=l*d,t[4]=-l*f,t[8]=c,t[1]=u+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+u*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*d,u=l*f,g=c*d,_=c*f;t[0]=h+_*a,t[4]=g*a-u,t[8]=o*c,t[1]=o*f,t[5]=o*d,t[9]=-a,t[2]=u*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*d,u=l*f,g=c*d,_=c*f;t[0]=h-_*a,t[4]=-o*f,t[8]=g+u*a,t[1]=u+g*a,t[5]=o*d,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*d,u=o*f,g=a*d,_=a*f;t[0]=l*d,t[4]=g*c-u,t[8]=h*c+_,t[1]=l*f,t[5]=_*c+h,t[9]=u*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,u=o*c,g=a*l,_=a*c;t[0]=l*d,t[4]=_-h*f,t[8]=g*f+u,t[1]=f,t[5]=o*d,t[9]=-a*d,t[2]=-c*d,t[6]=u*f+g,t[10]=h-_*f}else if(e.order==="XZY"){let h=o*l,u=o*c,g=a*l,_=a*c;t[0]=l*d,t[4]=-f,t[8]=c*d,t[1]=h*f+_,t[5]=o*d,t[9]=u*f-g,t[2]=g*f-u,t[6]=a*d,t[10]=_*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ig,e,sg)}lookAt(e,t,n){let i=this.elements;return ti.subVectors(e,t),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),ds.crossVectors(n,ti),ds.lengthSq()===0&&(Math.abs(n.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),ds.crossVectors(n,ti)),ds.normalize(),el.crossVectors(ti,ds),i[0]=ds.x,i[4]=el.x,i[8]=ti.x,i[1]=ds.y,i[5]=el.y,i[9]=ti.y,i[2]=ds.z,i[6]=el.z,i[10]=ti.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],d=n[1],f=n[5],h=n[9],u=n[13],g=n[2],_=n[6],p=n[10],m=n[14],y=n[3],M=n[7],v=n[11],C=n[15],R=i[0],b=i[4],w=i[8],z=i[12],I=i[1],H=i[5],V=i[9],G=i[13],U=i[2],$=i[6],ne=i[10],Y=i[14],ye=i[3],ie=i[7],ge=i[11],Te=i[15];return r[0]=o*R+a*I+l*U+c*ye,r[4]=o*b+a*H+l*$+c*ie,r[8]=o*w+a*V+l*ne+c*ge,r[12]=o*z+a*G+l*Y+c*Te,r[1]=d*R+f*I+h*U+u*ye,r[5]=d*b+f*H+h*$+u*ie,r[9]=d*w+f*V+h*ne+u*ge,r[13]=d*z+f*G+h*Y+u*Te,r[2]=g*R+_*I+p*U+m*ye,r[6]=g*b+_*H+p*$+m*ie,r[10]=g*w+_*V+p*ne+m*ge,r[14]=g*z+_*G+p*Y+m*Te,r[3]=y*R+M*I+v*U+C*ye,r[7]=y*b+M*H+v*$+C*ie,r[11]=y*w+M*V+v*ne+C*ge,r[15]=y*z+M*G+v*Y+C*Te,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],d=e[2],f=e[6],h=e[10],u=e[14],g=e[3],_=e[7],p=e[11],m=e[15],y=l*u-c*h,M=a*u-c*f,v=a*h-l*f,C=o*u-c*d,R=o*h-l*d,b=o*f-a*d;return t*(_*y-p*M+m*v)-n*(g*y-p*C+m*R)+i*(g*M-_*C+m*b)-r*(g*v-_*R+p*b)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],d=e[10];return t*(o*d-a*c)-n*(r*d-a*l)+i*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],f=e[9],h=e[10],u=e[11],g=e[12],_=e[13],p=e[14],m=e[15],y=t*a-n*o,M=t*l-i*o,v=t*c-r*o,C=n*l-i*a,R=n*c-r*a,b=i*c-r*l,w=d*_-f*g,z=d*p-h*g,I=d*m-u*g,H=f*p-h*_,V=f*m-u*_,G=h*m-u*p,U=y*G-M*V+v*H+C*I-R*z+b*w;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let $=1/U;return e[0]=(a*G-l*V+c*H)*$,e[1]=(i*V-n*G-r*H)*$,e[2]=(_*b-p*R+m*C)*$,e[3]=(h*R-f*b-u*C)*$,e[4]=(l*I-o*G-c*z)*$,e[5]=(t*G-i*I+r*z)*$,e[6]=(p*v-g*b-m*M)*$,e[7]=(d*b-h*v+u*M)*$,e[8]=(o*V-a*I+c*w)*$,e[9]=(n*I-t*V-r*w)*$,e[10]=(g*R-_*v+m*y)*$,e[11]=(f*v-d*R-u*y)*$,e[12]=(a*z-o*H-l*w)*$,e[13]=(t*H-n*z+i*w)*$,e[14]=(_*M-g*C-p*y)*$,e[15]=(d*C-f*M+h*y)*$,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,d=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,d*a+n,d*l-i*o,0,c*l-i*a,d*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,d=o+o,f=a+a,h=r*c,u=r*d,g=r*f,_=o*d,p=o*f,m=a*f,y=l*c,M=l*d,v=l*f,C=n.x,R=n.y,b=n.z;return i[0]=(1-(_+m))*C,i[1]=(u+v)*C,i[2]=(g-M)*C,i[3]=0,i[4]=(u-v)*R,i[5]=(1-(h+m))*R,i[6]=(p+y)*R,i[7]=0,i[8]=(g+M)*b,i[9]=(p-y)*b,i[10]=(1-(h+_))*b,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=xr.set(i[0],i[1],i[2]).length(),a=xr.set(i[4],i[5],i[6]).length(),l=xr.set(i[8],i[9],i[10]).length();r<0&&(o=-o),vi.copy(this);let c=1/o,d=1/a,f=1/l;return vi.elements[0]*=c,vi.elements[1]*=c,vi.elements[2]*=c,vi.elements[4]*=d,vi.elements[5]*=d,vi.elements[6]*=d,vi.elements[8]*=f,vi.elements[9]*=f,vi.elements[10]*=f,t.setFromRotationMatrix(vi),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,i,r,o,a=fi,l=!1){let c=this.elements,d=2*r/(t-e),f=2*r/(n-i),h=(t+e)/(t-e),u=(n+i)/(n-i),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===fi)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===zr)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=u,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=fi,l=!1){let c=this.elements,d=2/(t-e),f=2/(n-i),h=-(t+e)/(t-e),u=-(n+i)/(n-i),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===fi)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===zr)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=d,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=u,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},xr=new D,vi=new mt,ig=new D(0,0,0),sg=new D(1,1,1),ds=new D,el=new D,ti=new D,df=new mt,ff=new En,ji=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],d=i[9],f=i[2],h=i[6],u=i[10];switch(t){case"XYZ":this._y=Math.asin(St(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,u),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-St(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,u),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(St(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,u),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-St(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,u),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(St(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,u));break;case"XZY":this._z=Math.asin(-St(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,u),this._y=0);break;default:ct("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return df.makeRotationFromQuaternion(e),this.setFromRotationMatrix(df,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ff.setFromEuler(this),this.setFromQuaternion(ff,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ji.DEFAULT_ORDER="XYZ";var Wr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},rg=0,pf=new D,vr=new En,Vi=new mt,tl=new D,wo=new D,og=new D,ag=new En,mf=new D(1,0,0),gf=new D(0,1,0),_f=new D(0,0,1),yf={type:"added"},lg={type:"removed"},Mr={type:"childadded",child:null},Th={type:"childremoved",child:null},Vt=class s extends pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=wi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new D,t=new ji,n=new En,i=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new mt},normalMatrix:{value:new yt}}),this.matrix=new mt,this.matrixWorld=new mt,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Wr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vr.setFromAxisAngle(e,t),this.quaternion.multiply(vr),this}rotateOnWorldAxis(e,t){return vr.setFromAxisAngle(e,t),this.quaternion.premultiply(vr),this}rotateX(e){return this.rotateOnAxis(mf,e)}rotateY(e){return this.rotateOnAxis(gf,e)}rotateZ(e){return this.rotateOnAxis(_f,e)}translateOnAxis(e,t){return pf.copy(e).applyQuaternion(this.quaternion),this.position.add(pf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(mf,e)}translateY(e){return this.translateOnAxis(gf,e)}translateZ(e){return this.translateOnAxis(_f,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Vi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?tl.copy(e):tl.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),wo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Vi.lookAt(wo,tl,this.up):Vi.lookAt(tl,wo,this.up),this.quaternion.setFromRotationMatrix(Vi),i&&(Vi.extractRotation(i.matrixWorld),vr.setFromRotationMatrix(Vi),this.quaternion.premultiply(vr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(pt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(yf),Mr.child=e,this.dispatchEvent(Mr),Mr.child=null):pt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(lg),Th.child=e,this.dispatchEvent(Th),Th.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Vi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Vi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Vi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(yf),Mr.child=e,this.dispatchEvent(Mr),Mr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(wo,e,og),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(wo,ag,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,i=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*i,r[13]+=n-r[1]*t-r[5]*n-r[9]*i,r[14]+=i-r[2]*t-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){let f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),f=o(e.shapes),h=o(e.skeletons),u=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),u.length>0&&(n.animations=u),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let l=[];for(let c in a){let d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Vt.DEFAULT_UP=new D(0,1,0);Vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var We=class extends Vt{constructor(){super(),this.isGroup=!0,this.type="Group"}},cg={type:"move"},Xr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let p=t.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let d=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],h=d.position.distanceTo(f.position),u=.02,g=.005;c.inputState.pinching&&h>u+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=u-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(cg)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new We;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Gp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fs={h:0,s:0,l:0},nl={h:0,s:0,l:0};function wh(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var at=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=jt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,At.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=At.workingColorSpace){return this.r=e,this.g=t,this.b=n,At.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=At.workingColorSpace){if(e=Nu(e,1),t=St(t,0,1),n=St(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=wh(o,r,e+1/3),this.g=wh(o,r,e),this.b=wh(o,r,e-1/3)}return At.colorSpaceToWorking(this,i),this}setStyle(e,t=jt){function n(r){r!==void 0&&parseFloat(r)<1&&ct("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ct("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);ct("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=jt){let n=Gp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ct("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=$i(e.r),this.g=$i(e.g),this.b=$i(e.b),this}copyLinearToSRGB(e){return this.r=Or(e.r),this.g=Or(e.g),this.b=Or(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=jt){return At.workingToColorSpace(Fn.copy(this),e),Math.round(St(Fn.r*255,0,255))*65536+Math.round(St(Fn.g*255,0,255))*256+Math.round(St(Fn.b*255,0,255))}getHexString(e=jt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=At.workingColorSpace){At.workingToColorSpace(Fn.copy(this),t);let n=Fn.r,i=Fn.g,r=Fn.b,o=Math.max(n,i,r),a=Math.min(n,i,r),l,c,d=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=d<=.5?f/(o+a):f/(2-o-a),o){case n:l=(i-r)/f+(i<r?6:0);break;case i:l=(r-n)/f+2;break;case r:l=(n-i)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=At.workingColorSpace){return At.workingToColorSpace(Fn.copy(this),t),e.r=Fn.r,e.g=Fn.g,e.b=Fn.b,e}getStyle(e=jt){At.workingToColorSpace(Fn.copy(this),e);let t=Fn.r,n=Fn.g,i=Fn.b;return e!==jt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(fs),this.setHSL(fs.h+e,fs.s+t,fs.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(fs),e.getHSL(nl);let n=zo(fs.h,nl.h,t),i=zo(fs.s,nl.s,t),r=zo(fs.l,nl.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fn=new at;at.NAMES=Gp;var Yo=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new at(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ko=class extends Vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ji,this.environmentIntensity=1,this.environmentRotation=new ji,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Mi=new D,Wi=new D,Ah=new D,Xi=new D,br=new D,Sr=new D,xf=new D,Rh=new D,Ch=new D,Ph=new D,Ih=new Zt,Lh=new Zt,Dh=new Zt,Zi=class s{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Mi.subVectors(e,t),i.cross(Mi);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Mi.subVectors(i,t),Wi.subVectors(n,t),Ah.subVectors(e,t);let o=Mi.dot(Mi),a=Mi.dot(Wi),l=Mi.dot(Ah),c=Wi.dot(Wi),d=Wi.dot(Ah),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;let h=1/f,u=(c*l-a*d)*h,g=(o*d-a*l)*h;return r.set(1-u-g,g,u)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Xi)===null?!1:Xi.x>=0&&Xi.y>=0&&Xi.x+Xi.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,Xi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Xi.x),l.addScaledVector(o,Xi.y),l.addScaledVector(a,Xi.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return Ih.setScalar(0),Lh.setScalar(0),Dh.setScalar(0),Ih.fromBufferAttribute(e,t),Lh.fromBufferAttribute(e,n),Dh.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(Ih,r.x),o.addScaledVector(Lh,r.y),o.addScaledVector(Dh,r.z),o}static isFrontFacing(e,t,n,i){return Mi.subVectors(n,t),Wi.subVectors(e,t),Mi.cross(Wi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Mi.subVectors(this.c,this.b),Wi.subVectors(this.a,this.b),Mi.cross(Wi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,o,a;br.subVectors(i,n),Sr.subVectors(r,n),Rh.subVectors(e,n);let l=br.dot(Rh),c=Sr.dot(Rh);if(l<=0&&c<=0)return t.copy(n);Ch.subVectors(e,i);let d=br.dot(Ch),f=Sr.dot(Ch);if(d>=0&&f<=d)return t.copy(i);let h=l*f-d*c;if(h<=0&&l>=0&&d<=0&&l-d>0)return o=l/(l-d),t.copy(n).addScaledVector(br,o);Ph.subVectors(e,r);let u=br.dot(Ph),g=Sr.dot(Ph);if(g>=0&&u<=g)return t.copy(r);let _=u*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Sr,a);let p=d*g-u*f;if(p<=0&&f-d>=0&&u-g>=0)return xf.subVectors(r,i),a=(f-d)/(f-d+(u-g)),t.copy(i).addScaledVector(xf,a);let m=1/(p+_+h);return o=_*m,a=h*m,t.copy(n).addScaledVector(br,o).addScaledVector(Sr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Wn=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(bi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(bi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=bi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,bi):bi.fromBufferAttribute(r,o),bi.applyMatrix4(e.matrixWorld),this.expandByPoint(bi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),il.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),il.copy(n.boundingBox)),il.applyMatrix4(e.matrixWorld),this.union(il)}let i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,bi),bi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ao),sl.subVectors(this.max,Ao),Er.subVectors(e.a,Ao),Tr.subVectors(e.b,Ao),wr.subVectors(e.c,Ao),ps.subVectors(Tr,Er),ms.subVectors(wr,Tr),Ns.subVectors(Er,wr);let t=[0,-ps.z,ps.y,0,-ms.z,ms.y,0,-Ns.z,Ns.y,ps.z,0,-ps.x,ms.z,0,-ms.x,Ns.z,0,-Ns.x,-ps.y,ps.x,0,-ms.y,ms.x,0,-Ns.y,Ns.x,0];return!Nh(t,Er,Tr,wr,sl)||(t=[1,0,0,0,1,0,0,0,1],!Nh(t,Er,Tr,wr,sl))?!1:(rl.crossVectors(ps,ms),t=[rl.x,rl.y,rl.z],Nh(t,Er,Tr,wr,sl))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,bi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(bi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(qi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),qi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),qi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),qi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),qi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),qi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),qi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),qi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(qi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},qi=[new D,new D,new D,new D,new D,new D,new D,new D],bi=new D,il=new Wn,Er=new D,Tr=new D,wr=new D,ps=new D,ms=new D,Ns=new D,Ao=new D,sl=new D,rl=new D,Us=new D;function Nh(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Us.fromArray(s,r);let a=i.x*Math.abs(Us.x)+i.y*Math.abs(Us.y)+i.z*Math.abs(Us.z),l=e.dot(Us),c=t.dot(Us),d=n.dot(Us);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>a)return!1}return!0}var Mn=new D,ol=new Ee,hg=0,Nn=class extends pi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:hg++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Lu,this.updateRanges=[],this.gpuType=oi,this.version=0,this._normalizationScale=e!==void 0?Zc(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ol.fromBufferAttribute(this,t),ol.applyMatrix3(e),this.setXY(t,ol.x,ol.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mn.fromBufferAttribute(this,t),Mn.applyMatrix3(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mn.fromBufferAttribute(this,t),Mn.applyMatrix4(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mn.fromBufferAttribute(this,t),Mn.applyNormalMatrix(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mn.fromBufferAttribute(this,t),Mn.transformDirection(e),this.setXYZ(t,Mn.x,Mn.y,Mn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Ou(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Fu(e,this.array)}};var Zo=class extends Nn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var $o=class extends Nn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Rt=class extends Nn{constructor(e,t,n){super(new Float32Array(e),t,n)}},ug=new Wn,Ro=new D,Uh=new D,$n=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):ug.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ro.subVectors(e,this.center);let t=Ro.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Ro,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Uh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ro.copy(e.center).add(Uh)),this.expandByPoint(Ro.copy(e.center).sub(Uh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},dg=0,ui=new mt,Oh=new Vt,Ar=new D,ni=new Wn,Co=new Wn,In=new D,on=class s extends pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:dg++}),this.uuid=wi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(F0(e)?$o:Zo)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new yt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ui.makeRotationFromQuaternion(e),this.applyMatrix4(ui),this}rotateX(e){return ui.makeRotationX(e),this.applyMatrix4(ui),this}rotateY(e){return ui.makeRotationY(e),this.applyMatrix4(ui),this}rotateZ(e){return ui.makeRotationZ(e),this.applyMatrix4(ui),this}translate(e,t,n){return ui.makeTranslation(e,t,n),this.applyMatrix4(ui),this}scale(e,t,n){return ui.makeScale(e,t,n),this.applyMatrix4(ui),this}lookAt(e){return Oh.lookAt(e),Oh.updateMatrix(),this.applyMatrix4(Oh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ar).negate(),this.translate(Ar.x,Ar.y,Ar.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Rt(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&ct("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){pt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];ni.setFromBufferAttribute(r),this.morphTargetsRelative?(In.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(In),In.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(In)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&pt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $n);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){pt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let n=this.boundingSphere.center;if(ni.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Co.setFromBufferAttribute(a),this.morphTargetsRelative?(In.addVectors(ni.min,Co.min),ni.expandByPoint(In),In.addVectors(ni.max,Co.max),ni.expandByPoint(In)):(ni.expandByPoint(Co.min),ni.expandByPoint(Co.max))}ni.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)In.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(In));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)In.fromBufferAttribute(a,c),l&&(Ar.fromBufferAttribute(e,c),In.add(Ar)),i=Math.max(i,n.distanceToSquared(In))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&pt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){pt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Nn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let z=0;z<n.count;z++)a[z]=new D,l[z]=new D;let d=new D,f=new D,h=new D,u=new Ee,g=new Ee,_=new Ee,p=new D,m=new D;function y(z,I,H){c[z]=c[I]=c[H]=1,d.fromBufferAttribute(n,z),f.fromBufferAttribute(n,I),h.fromBufferAttribute(n,H),u.fromBufferAttribute(r,z),g.fromBufferAttribute(r,I),_.fromBufferAttribute(r,H),f.sub(d),h.sub(d),g.sub(u),_.sub(u);let V=1/(g.x*_.y-_.x*g.y);isFinite(V)&&(p.copy(f).multiplyScalar(_.y).addScaledVector(h,-g.y).multiplyScalar(V),m.copy(h).multiplyScalar(g.x).addScaledVector(f,-_.x).multiplyScalar(V),a[z].add(p),a[I].add(p),a[H].add(p),l[z].add(m),l[I].add(m),l[H].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let z=0,I=M.length;z<I;++z){let H=M[z],V=H.start,G=H.count;for(let U=V,$=V+G;U<$;U+=3)y(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let v=new D,C=new D,R=new D,b=new D;function w(z){R.fromBufferAttribute(i,z),b.copy(R);let I=a[z];v.copy(I),v.sub(R.multiplyScalar(R.dot(I))).normalize(),C.crossVectors(b,I);let V=C.dot(l[z])<0?-1:1;o.setXYZW(z,v.x,v.y,v.z,V)}for(let z=0,I=n.count;z<I;++z)c[z]&&w(z);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Nn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,u=n.count;h<u;h++)n.setXYZ(h,0,0,0);let i=new D,r=new D,o=new D,a=new D,l=new D,c=new D,d=new D,f=new D;if(e)for(let h=0,u=e.count;h<u;h+=3){let g=e.getX(h+0),_=e.getX(h+1),p=e.getX(h+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),d.subVectors(o,r),f.subVectors(i,r),d.cross(f),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(d),l.add(d),c.add(d),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,u=t.count;h<u;h+=3)i.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),d.subVectors(o,r),f.subVectors(i,r),d.cross(f),n.setXYZ(h+0,d.x,d.y,d.z),n.setXYZ(h+1,d.x,d.y,d.z),n.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)In.fromBufferAttribute(e,t),In.normalize(),e.setXYZ(t,In.x,In.y,In.z)}toNonIndexed(){function e(a,l){let c=a.array,d=a.itemSize,f=a.normalized,h=new c.constructor(l.length*d),u=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?u=l[_]*a.data.stride+a.offset:u=l[_]*d;for(let m=0;m<d;m++)h[g++]=c[u++]}return new Nn(h,d,f)}if(this.index===null)return ct("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let d=0,f=c.length;d<f;d++){let h=c[d],u=e(h,n);l.push(u)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],d=[];for(let f=0,h=c.length;f<h;f++){let u=c[f];d.push(u.toJSON(e.data))}d.length>0&&(i[l]=d,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let c in i){let d=i[c];this.setAttribute(c,d.clone(t))}let r=e.morphAttributes;for(let c in r){let d=[],f=r[c];for(let h=0,u=f.length;h<u;h++)d.push(f[h].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,d=o.length;c<d;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ws=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Lu,this.updateRanges=[],this.version=0,this.uuid=wi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=vf(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=vf(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function vf(s){return s.buffer._uuid===void 0&&(s.buffer._uuid=wi()),s.byteOffset===0&&s.byteLength===s.buffer.byteLength?s.buffer._uuid:s.buffer._uuid+":"+s.byteOffset+":"+s.byteLength}var Hn=new D,ys=class s{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i,this._normalizationScale=e!==void 0?Zc(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.applyMatrix4(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.applyNormalMatrix(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Hn.fromBufferAttribute(this,t),Hn.transformDirection(e),this.setXYZ(t,Hn.x,Hn.y,Hn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Xo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Nn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Xo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Ou(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):Fu(e,this.data.array)}},Fh=new D,fg=new D,pg=new yt,Gn=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=Fh.subVectors(n,t).cross(fg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let i=e.delta(Fh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||pg.getNormalMatrix(e),i=this.coplanarPoint(Fh).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},mg=0,Xn=class extends pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mg++}),this.uuid=wi(),this.name="",this.type="Material",this.blending=As,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=du,this.blendDst=fu,this.blendEquation=rr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new at(0,0,0),this.blendAlpha=0,this.depthFunc=Br,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Lp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Il,this.stencilZFail=Il,this.stencilZPass=Il,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ct(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){ct(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new at().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Gn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ee().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ee().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},xs=class extends Xn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new at(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Rr,Po=new D,Cr=new D,Pr=new D,Ir=new Ee,Io=new Ee,Vp=new mt,al=new D,Lo=new D,ll=new D,Mf=new Ee,Bh=new Ee,bf=new Ee,Xs=class extends Vt{constructor(e=new xs){if(super(),this.isSprite=!0,this.type="Sprite",Rr===void 0){Rr=new on;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ws(t,5);Rr.setIndex([0,1,2,0,2,3]),Rr.setAttribute("position",new ys(n,3,0,!1)),Rr.setAttribute("uv",new ys(n,2,3,!1))}this.geometry=Rr,this.material=e,this.center=new Ee(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&pt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Cr.setFromMatrixScale(this.matrixWorld),Vp.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Pr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Cr.multiplyScalar(-Pr.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;cl(al.set(-.5,-.5,0),Pr,o,Cr,i,r),cl(Lo.set(.5,-.5,0),Pr,o,Cr,i,r),cl(ll.set(.5,.5,0),Pr,o,Cr,i,r),Mf.set(0,0),Bh.set(1,0),bf.set(1,1);let a=e.ray.intersectTriangle(al,Lo,ll,!1,Po);if(a===null&&(cl(Lo.set(-.5,.5,0),Pr,o,Cr,i,r),Bh.set(0,1),a=e.ray.intersectTriangle(al,ll,Lo,!1,Po),a===null))return;let l=e.ray.origin.distanceTo(Po);l<e.near||l>e.far||t.push({distance:l,point:Po.clone(),uv:Zi.getInterpolation(Po,al,Lo,ll,Mf,Bh,bf,new Ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function cl(s,e,t,n,i,r){Ir.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(Io.x=r*Ir.x-i*Ir.y,Io.y=i*Ir.x+r*Ir.y):Io.copy(Ir),s.copy(e),s.x+=Io.x,s.y+=Io.y,s.applyMatrix4(Vp)}var Yi=new D,kh=new D,hl=new D,ul=new D,Pi=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Yi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Yi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Yi.copy(this.origin).addScaledVector(this.direction,t),Yi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){kh.copy(e).add(t).multiplyScalar(.5),hl.copy(t).sub(e).normalize(),ul.copy(this.origin).sub(kh);let r=e.distanceTo(t)*.5,o=-this.direction.dot(hl),a=ul.dot(this.direction),l=-ul.dot(hl),c=ul.lengthSq(),d=Math.abs(1-o*o),f,h,u,g;if(d>0)if(f=o*l-a,h=o*a-l,g=r*d,f>=0)if(h>=-g)if(h<=g){let _=1/d;f*=_,h*=_,u=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),u=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),u=-f*f+h*(h+2*l)+c;else h<=-g?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),u=-f*f+h*(h+2*l)+c):h<=g?(f=0,h=Math.min(Math.max(-r,-l),r),u=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),u=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),u=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),i&&i.copy(kh).addScaledVector(hl,h),u}intersectSphere(e,t){if(e.radius<0)return null;Yi.subVectors(e.center,this.origin);let n=Yi.dot(this.direction),i=Yi.dot(Yi)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l,c=1/this.direction.x,d=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,i=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,i=(e.min.x-h.x)*c),d>=0?(r=(e.min.y-h.y)*d,o=(e.max.y-h.y)*d):(r=(e.max.y-h.y)*d,o=(e.min.y-h.y)*d),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Yi)!==null}intersectTriangle(e,t,n,i,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,d=a.z,f=e.x-o.x,h=e.y-o.y,u=e.z-o.z,g=t.x-o.x,_=t.y-o.y,p=t.z-o.z,m=n.x-o.x,y=n.y-o.y,M=n.z-o.z,v=Math.abs(l),C=Math.abs(c),R=Math.abs(d),b,w,z,I,H,V,G,U,$,ne,Y,ye;if(v>=C&&v>=R?(z=l,V=f,$=g,ye=m,l>=0?(b=c,w=d,I=h,H=u,G=_,U=p,ne=y,Y=M):(b=d,w=c,I=u,H=h,G=p,U=_,ne=M,Y=y)):C>=R?(z=c,V=h,$=_,ye=y,c>=0?(b=d,w=l,I=u,H=f,G=p,U=g,ne=M,Y=m):(b=l,w=d,I=f,H=u,G=g,U=p,ne=m,Y=M)):(z=d,V=u,$=p,ye=M,d>=0?(b=l,w=c,I=f,H=h,G=g,U=_,ne=m,Y=y):(b=c,w=l,I=h,H=f,G=_,U=g,ne=y,Y=m)),z===0)return null;let ie=b/z,ge=w/z,Te=1/z,De=I-ie*V,rt=H-ge*V,W=G-ie*$,pe=U-ge*$,we=ne-ie*ye,Be=Y-ge*ye,Me=we*pe-Be*W,_e=De*Be-rt*we,Ue=W*rt-pe*De;if(i){if(Me<0||_e<0||Ue<0)return null}else if((Me<0||_e<0||Ue<0)&&(Me>0||_e>0||Ue>0))return null;let Se=Me+_e+Ue;if(Se===0)return null;let Fe=Te*(Me*V+_e*$+Ue*ye);return(Se>0?Fe<0:Fe>0)?null:this.at(Fe/Se,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},hn=class extends Xn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new at(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ji,this.combine=pu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Sf=new mt,Os=new Pi,dl=new $n,Ef=new D,fl=new D,pl=new D,ml=new D,zh=new D,gl=new D,Tf=new D,_l=new D,tn=class extends Vt{constructor(e=new on,t=new hn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(r&&a){gl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let d=a[l],f=r[l];d!==0&&(zh.fromBufferAttribute(f,e),o?gl.addScaledVector(zh,d):gl.addScaledVector(zh.sub(t),d))}t.add(gl)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),dl.copy(n.boundingSphere),dl.applyMatrix4(r),Os.copy(e.ray).recast(e.near),!(dl.containsPoint(Os.origin)===!1&&(Os.intersectSphere(dl,Ef)===null||Os.origin.distanceToSquared(Ef)>(e.far-e.near)**2))&&(Sf.copy(r).invert(),Os.copy(e.ray).applyMatrix4(Sf),!(n.boundingBox!==null&&Os.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Os)))}_computeIntersections(e,t,n){let i,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,f=r.attributes.normal,h=r.groups,u=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,u.start),M=Math.min(a.count,Math.min(p.start+p.count,u.start+u.count));for(let v=y,C=M;v<C;v+=3){let R=a.getX(v),b=a.getX(v+1),w=a.getX(v+2);i=yl(this,m,e,n,c,d,f,R,b,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,u.start),_=Math.min(a.count,u.start+u.count);for(let p=g,m=_;p<m;p+=3){let y=a.getX(p),M=a.getX(p+1),v=a.getX(p+2);i=yl(this,o,e,n,c,d,f,y,M,v),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,u.start),M=Math.min(l.count,Math.min(p.start+p.count,u.start+u.count));for(let v=y,C=M;v<C;v+=3){let R=v,b=v+1,w=v+2;i=yl(this,m,e,n,c,d,f,R,b,w),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,u.start),_=Math.min(l.count,u.start+u.count);for(let p=g,m=_;p<m;p+=3){let y=p,M=p+1,v=p+2;i=yl(this,o,e,n,c,d,f,y,M,v),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}};function gg(s,e,t,n,i,r,o,a){let l;if(e.side===Yn?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===Oi,a),l===null)return null;_l.copy(a),_l.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(_l);return c<t.near||c>t.far?null:{distance:c,point:_l.clone(),object:s}}function yl(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,fl),s.getVertexPosition(l,pl),s.getVertexPosition(c,ml);let d=gg(s,e,t,n,fl,pl,ml,Tf);if(d){let f=new D;Zi.getBarycoord(Tf,fl,pl,ml,f),i&&(d.uv=Zi.getInterpolatedAttribute(i,a,l,c,f,new Ee)),r&&(d.uv1=Zi.getInterpolatedAttribute(r,a,l,c,f,new Ee)),o&&(d.normal=Zi.getInterpolatedAttribute(o,a,l,c,f,new D),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new D,materialIndex:0};Zi.getNormal(fl,pl,ml,h.normal),d.face=h,d.barycoord=f}return d}var Do=new Zt,wf=new Zt,Af=new Zt,_g=new Zt,Rf=new mt,xl=new D,Hh=new $n,Cf=new mt,Gh=new Pi,Jo=class extends tn{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Zh,this.bindMatrix=new mt,this.bindMatrixInverse=new mt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Wn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,xl),this.boundingBox.expandByPoint(xl)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new $n),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,xl),this.boundingSphere.expandByPoint(xl)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Hh.copy(this.boundingSphere),Hh.applyMatrix4(i),e.ray.intersectsSphere(Hh)!==!1&&(Cf.copy(i).invert(),Gh.copy(e.ray).applyMatrix4(Cf),!(this.boundingBox!==null&&Gh.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Gh)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Zt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Zh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===wp?this.bindMatrixInverse.copy(this.bindMatrix).invert():ct("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;wf.fromBufferAttribute(i.attributes.skinIndex,e),Af.fromBufferAttribute(i.attributes.skinWeight,e),t.isVector4?(Do.copy(t),t.set(0,0,0,0)):(Do.set(t.x,t.y,t.z,1),t.set(0,0,0)),Do.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=Af.getComponent(r);if(o!==0){let a=wf.getComponent(r);Rf.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(_g.copy(Do).applyMatrix4(Rf),o)}}return t.isVector4&&(t.w=Do.w),t.applyMatrix4(this.bindMatrixInverse)}},qr=class extends Vt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Yr=class extends xn{constructor(e=null,t=1,n=1,i,r,o,a,l,c=yn,d=yn,f,h){super(null,o,a,l,c,d,i,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Pf=new mt,yg=new mt,jo=class s{constructor(e=[],t=[]){this.uuid=wi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){ct("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new mt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new mt;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:yg;Pf.multiplyMatrices(a,t[r]),Pf.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Yr(t,e,e,_i,oi);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(ct("Skeleton: No bone found with UUID:",r),o=new qr),this.bones.push(o),this.boneInverses.push(new mt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}},Qi=class extends Nn{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Lr=new mt,If=new mt,vl=[],Lf=new Wn,xg=new mt,No=new tn,Uo=new $n,mi=class extends tn{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Qi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,xg)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Wn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Lr),Lf.copy(e.boundingBox).applyMatrix4(Lr),this.boundingBox.union(Lf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new $n),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Lr),Uo.copy(e.boundingSphere).applyMatrix4(Lr),this.boundingSphere.union(Uo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(No.geometry=this.geometry,No.material=this.material,No.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Uo.copy(this.boundingSphere),Uo.applyMatrix4(n),e.ray.intersectsSphere(Uo)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Lr),If.multiplyMatrices(n,Lr),No.matrixWorld=If,No.raycast(e,vl);for(let o=0,a=vl.length;o<a;o++){let l=vl[o];l.instanceId=r,l.object=this,t.push(l)}vl.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Qi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Yr(new Float32Array(i*this.count),i,this.count,dc,oi));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Fs=new $n,vg=new Ee(.5,.5),Ml=new D,vs=class{constructor(e=new Gn,t=new Gn,n=new Gn,i=new Gn,r=new Gn,o=new Gn){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=fi,n=!1){let i=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],d=r[4],f=r[5],h=r[6],u=r[7],g=r[8],_=r[9],p=r[10],m=r[11],y=r[12],M=r[13],v=r[14],C=r[15];if(i[0].setComponents(c-o,u-d,m-g,C-y).normalize(),i[1].setComponents(c+o,u+d,m+g,C+y).normalize(),i[2].setComponents(c+a,u+f,m+_,C+M).normalize(),i[3].setComponents(c-a,u-f,m-_,C-M).normalize(),n)i[4].setComponents(l,h,p,v).normalize(),i[5].setComponents(c-l,u-h,m-p,C-v).normalize();else if(i[4].setComponents(c-l,u-h,m-p,C-v).normalize(),t===fi)i[5].setComponents(c+l,u+h,m+p,C+v).normalize();else if(t===zr)i[5].setComponents(l,h,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Fs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Fs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Fs)}intersectsSprite(e){Fs.center.set(0,0,0);let t=vg.distanceTo(e.center);return Fs.radius=.7071067811865476+t,Fs.applyMatrix4(e.matrixWorld),this.intersectsSphere(Fs)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(Ml.x=i.normal.x>0?e.max.x:e.min.x,Ml.y=i.normal.y>0?e.max.y:e.min.y,Ml.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Ml)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Df=new mt,Gl=class s{constructor(){this.coordinateSystem=fi,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let i=0;i<t.length;i++){let r=t[i];Df.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[i]===void 0&&(n[i]=new vs),n[i].setFromProjectionMatrix(Df,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let i=0;i<e._count;i++)t[i]===void 0&&(t[i]=new vs),t[i].copy(n[i]);return this._count=e._count,this}clone(){return new s().copy(this)}};var Kr=class extends Xn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new at(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Vl=new D,Wl=new D,Nf=new mt,Oo=new Pi,bl=new $n,Vh=new D,Uf=new D,qs=class extends Vt{constructor(e=new on,t=new Kr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Vl.fromBufferAttribute(t,i-1),Wl.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Vl.distanceTo(Wl);e.setAttribute("lineDistance",new Rt(n,1))}else ct("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),bl.copy(n.boundingSphere),bl.applyMatrix4(i),bl.radius+=r,e.ray.intersectsSphere(bl)===!1)return;Nf.copy(i).invert(),Oo.copy(e.ray).applyMatrix4(Nf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,d=n.index,h=n.attributes.position;if(d!==null){let u=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=u,p=g-1;_<p;_+=c){let m=d.getX(_),y=d.getX(_+1),M=Sl(this,e,Oo,l,m,y,_);M&&t.push(M)}if(this.isLineLoop){let _=d.getX(g-1),p=d.getX(u),m=Sl(this,e,Oo,l,_,p,g-1);m&&t.push(m)}}else{let u=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=u,p=g-1;_<p;_+=c){let m=Sl(this,e,Oo,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=Sl(this,e,Oo,l,g-1,u,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Sl(s,e,t,n,i,r,o){let a=s.geometry.attributes.position;if(Vl.fromBufferAttribute(a,i),Wl.fromBufferAttribute(a,r),t.distanceSqToSegment(Vl,Wl,Vh,Uf)>n)return;Vh.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Vh);if(!(c<e.near||c>e.far))return{distance:c,point:Uf.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var Of=new D,Ff=new D,Qo=class extends qs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Of.fromBufferAttribute(t,i),Ff.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Of.distanceTo(Ff);e.setAttribute("lineDistance",new Rt(n,1))}else ct("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},ea=class extends qs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Zr=class extends Xn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new at(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Bf=new mt,Jh=new Pi,El=new $n,Tl=new D,ta=class extends Vt{constructor(e=new on,t=new Zr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),El.copy(n.boundingSphere),El.applyMatrix4(i),El.radius+=r,e.ray.intersectsSphere(El)===!1)return;Bf.copy(i).invert(),Jh.copy(e.ray).applyMatrix4(Bf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,f=n.attributes.position;if(c!==null){let h=Math.max(0,o.start),u=Math.min(c.count,o.start+o.count);for(let g=h,_=u;g<_;g++){let p=c.getX(g);Tl.fromBufferAttribute(f,p),kf(Tl,p,l,i,e,t,this)}}else{let h=Math.max(0,o.start),u=Math.min(f.count,o.start+o.count);for(let g=h,_=u;g<_;g++)Tl.fromBufferAttribute(f,g),kf(Tl,g,l,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function kf(s,e,t,n,i,r,o){let a=Jh.distanceSqToPoint(s);if(a<t){let l=new D;Jh.closestPointToPoint(s,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var na=class extends xn{constructor(e=[],t=or,n,i,r,o,a,l,c,d){super(e,t,n,i,r,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},es=class extends xn{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ts=class extends xn{constructor(e,t,n=Ei,i,r,o,a=yn,l=yn,c,d=Ji,f=1){if(d!==Ji&&d!==as)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:f};super(h,i,r,o,a,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ia=class extends ts{constructor(e,t=Ei,n=or,i,r,o=yn,a=yn,l,c=Ji){let d={width:e,height:e,depth:1},f=[d,d,d,d,d,d];super(e,e,t,n,i,r,o,a,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},sa=class extends xn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ii=class s extends on{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],d=[],f=[],h=0,u=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Rt(c,3)),this.setAttribute("normal",new Rt(d,3)),this.setAttribute("uv",new Rt(f,2));function g(_,p,m,y,M,v,C,R,b,w,z){let I=v/b,H=C/w,V=v/2,G=C/2,U=R/2,$=b+1,ne=w+1,Y=0,ye=0,ie=new D;for(let ge=0;ge<ne;ge++){let Te=ge*H-G;for(let De=0;De<$;De++){let rt=De*I-V;ie[_]=rt*y,ie[p]=Te*M,ie[m]=U,c.push(ie.x,ie.y,ie.z),ie[_]=0,ie[p]=0,ie[m]=R>0?1:-1,d.push(ie.x,ie.y,ie.z),f.push(De/b),f.push(1-ge/w),Y+=1}}for(let ge=0;ge<w;ge++)for(let Te=0;Te<b;Te++){let De=h+Te+$*ge,rt=h+Te+$*(ge+1),W=h+(Te+1)+$*(ge+1),pe=h+(Te+1)+$*ge;l.push(De,rt,pe),l.push(rt,W,pe),ye+=6}a.addGroup(u,ye,z),u+=ye,h+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var $r=class s extends on{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new D,d=new Ee;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let f=0,h=3;f<=t;f++,h+=3){let u=n+f/t*i;c.x=e*Math.cos(u),c.y=e*Math.sin(u),o.push(c.x,c.y,c.z),a.push(0,0,1),d.x=(o[h]/e+1)/2,d.y=(o[h+1]/e+1)/2,l.push(d.x,d.y)}for(let f=1;f<=t;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new Rt(o,3)),this.setAttribute("normal",new Rt(a,3)),this.setAttribute("uv",new Rt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Li=class s extends on{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let d=[],f=[],h=[],u=[],g=0,_=[],p=n/2,m=0;y(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(d),this.setAttribute("position",new Rt(f,3)),this.setAttribute("normal",new Rt(h,3)),this.setAttribute("uv",new Rt(u,2));function y(){let v=new D,C=new D,R=0,b=(t-e)/n;for(let w=0;w<=r;w++){let z=[],I=w/r,H=I*(t-e)+e;for(let V=0;V<=i;V++){let G=V/i,U=G*l+a,$=Math.sin(U),ne=Math.cos(U);C.x=H*$,C.y=-I*n+p,C.z=H*ne,f.push(C.x,C.y,C.z),v.set($,b,ne).normalize(),h.push(v.x,v.y,v.z),u.push(G,1-I),z.push(g++)}_.push(z)}for(let w=0;w<i;w++)for(let z=0;z<r;z++){let I=_[z][w],H=_[z+1][w],V=_[z+1][w+1],G=_[z][w+1];(e>0||z!==0)&&(d.push(I,H,G),R+=3),(t>0||z!==r-1)&&(d.push(H,V,G),R+=3)}c.addGroup(m,R,0),m+=R}function M(v){let C=g,R=new Ee,b=new D,w=0,z=v===!0?e:t,I=v===!0?1:-1;for(let V=1;V<=i;V++)f.push(0,p*I,0),h.push(0,I,0),u.push(.5,.5),g++;let H=g;for(let V=0;V<=i;V++){let U=V/i*l+a,$=Math.cos(U),ne=Math.sin(U);b.x=z*ne,b.y=p*I,b.z=z*$,f.push(b.x,b.y,b.z),h.push(0,I,0),R.x=$*.5+.5,R.y=ne*.5*I+.5,u.push(R.x,R.y),g++}for(let V=0;V<i;V++){let G=C+V,U=H+V;v===!0?d.push(U,U+1,G):d.push(U+1,U,G),w+=3}c.addGroup(m,w,v===!0?1:2),m+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ys=class s extends Li{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Jr=class s extends on{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),c(n),d(),this.setAttribute("position",new Rt(r,3)),this.setAttribute("normal",new Rt(r.slice(),3)),this.setAttribute("uv",new Rt(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let M=new D,v=new D,C=new D;for(let R=0;R<t.length;R+=3)u(t[R+0],M),u(t[R+1],v),u(t[R+2],C),l(M,v,C,y)}function l(y,M,v,C){let R=C+1,b=[];for(let w=0;w<=R;w++){b[w]=[];let z=y.clone().lerp(v,w/R),I=M.clone().lerp(v,w/R),H=R-w;for(let V=0;V<=H;V++)V===0&&w===R?b[w][V]=z:b[w][V]=z.clone().lerp(I,V/H)}for(let w=0;w<R;w++)for(let z=0;z<2*(R-w)-1;z++){let I=Math.floor(z/2);z%2===0?(h(b[w][I+1]),h(b[w+1][I]),h(b[w][I])):(h(b[w][I+1]),h(b[w+1][I+1]),h(b[w+1][I]))}}function c(y){let M=new D;for(let v=0;v<r.length;v+=3)M.x=r[v+0],M.y=r[v+1],M.z=r[v+2],M.normalize().multiplyScalar(y),r[v+0]=M.x,r[v+1]=M.y,r[v+2]=M.z}function d(){let y=new D;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];let v=p(y)/2/Math.PI+.5,C=m(y)/Math.PI+.5;o.push(v,1-C)}g(),f()}function f(){for(let y=0;y<o.length;y+=6){let M=o[y+0],v=o[y+2],C=o[y+4],R=Math.max(M,v,C),b=Math.min(M,v,C);R>.9&&b<.1&&(M<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),C<.2&&(o[y+4]+=1))}}function h(y){r.push(y.x,y.y,y.z)}function u(y,M){let v=y*3;M.x=e[v+0],M.y=e[v+1],M.z=e[v+2]}function g(){let y=new D,M=new D,v=new D,C=new D,R=new Ee,b=new Ee,w=new Ee;for(let z=0,I=0;z<r.length;z+=9,I+=6){y.set(r[z+0],r[z+1],r[z+2]),M.set(r[z+3],r[z+4],r[z+5]),v.set(r[z+6],r[z+7],r[z+8]),R.set(o[I+0],o[I+1]),b.set(o[I+2],o[I+3]),w.set(o[I+4],o[I+5]),C.copy(y).add(M).add(v).divideScalar(3);let H=p(C);_(R,I+0,y,H),_(b,I+2,M,H),_(w,I+4,v,H)}}function _(y,M,v,C){C<0&&y.x===1&&(o[M]=y.x-1),v.x===0&&v.z===0&&(o[M]=C/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.detail)}},ra=class s extends Jr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}};var ri=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){ct("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);let d=n[i],h=n[i+1]-d,u=(o-d)/h;return(i+u)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),l=t||(o.isVector2?new Ee:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new D,i=[],r=[],o=[],a=new D,l=new mt;for(let u=0;u<=e;u++){let g=u/e;i[u]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE,d=Math.abs(i[0].x),f=Math.abs(i[0].y),h=Math.abs(i[0].z);d<=c&&(c=d,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),h<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let u=1;u<=e;u++){if(r[u]=r[u-1].clone(),o[u]=o[u-1].clone(),a.crossVectors(i[u-1],i[u]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(St(i[u-1].dot(i[u]),-1,1));r[u].applyMatrix4(l.makeRotationAxis(a,g))}o[u].crossVectors(i[u],r[u])}if(t===!0){let u=Math.acos(St(r[0].dot(r[e]),-1,1));u/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(u=-u);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],u*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},jr=class extends ri{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new Ee){let n=t,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let d=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=l-this.aX,u=c-this.aY;l=h*d-u*f+this.aX,c=h*f+u*d+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Xl=class extends jr{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Bu(){let s=0,e=0,t=0,n=0;function i(r,o,a,l){s=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,d,f){let h=(o-r)/c-(a-r)/(c+d)+(a-o)/d,u=(a-o)/d-(l-o)/(d+f)+(l-a)/f;h*=d,u*=d,i(o,a,h,u)},calc:function(r){let o=r*r,a=o*r;return s+e*r+t*o+n*a}}}var zf=new D,Hf=new D,Wh=new Bu,Xh=new Bu,qh=new Bu,Qr=class extends ri{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new D){let n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,d;this.closed||a>0?c=i[(a-1)%r]:(Hf.subVectors(i[0],i[1]).add(i[0]),c=Hf);let f=i[a%r],h=i[(a+1)%r];if(this.closed||a+2<r?d=i[(a+2)%r]:(zf.subVectors(i[r-1],i[r-2]).add(i[r-1]),d=zf),this.curveType==="centripetal"||this.curveType==="chordal"){let u=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(f),u),_=Math.pow(f.distanceToSquared(h),u),p=Math.pow(h.distanceToSquared(d),u);_<1e-4&&(_=1),g<1e-4&&(g=_),p<1e-4&&(p=_),Wh.initNonuniformCatmullRom(c.x,f.x,h.x,d.x,g,_,p),Xh.initNonuniformCatmullRom(c.y,f.y,h.y,d.y,g,_,p),qh.initNonuniformCatmullRom(c.z,f.z,h.z,d.z,g,_,p)}else this.curveType==="catmullrom"&&(Wh.initCatmullRom(c.x,f.x,h.x,d.x,this.tension),Xh.initCatmullRom(c.y,f.y,h.y,d.y,this.tension),qh.initCatmullRom(c.z,f.z,h.z,d.z,this.tension));return n.set(Wh.calc(l),Xh.calc(l),qh.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new D().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Gf(s,e,t,n,i){let r=(n-e)*.5,o=(i-t)*.5,a=s*s,l=s*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*s+t}function Mg(s,e){let t=1-s;return t*t*e}function bg(s,e){return 2*(1-s)*s*e}function Sg(s,e){return s*s*e}function Ho(s,e,t,n){return Mg(s,e)+bg(s,t)+Sg(s,n)}function Eg(s,e){let t=1-s;return t*t*t*e}function Tg(s,e){let t=1-s;return 3*t*t*s*e}function wg(s,e){return 3*(1-s)*s*s*e}function Ag(s,e){return s*s*s*e}function Go(s,e,t,n,i){return Eg(s,e)+Tg(s,t)+wg(s,n)+Ag(s,i)}var oa=class extends ri{constructor(e=new Ee,t=new Ee,n=new Ee,i=new Ee){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new Ee){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Go(e,i.x,r.x,o.x,a.x),Go(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ql=class extends ri{constructor(e=new D,t=new D,n=new D,i=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new D){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Go(e,i.x,r.x,o.x,a.x),Go(e,i.y,r.y,o.y,a.y),Go(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},aa=class extends ri{constructor(e=new Ee,t=new Ee){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Ee){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Ee){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Yl=class extends ri{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},la=class extends ri{constructor(e=new Ee,t=new Ee,n=new Ee){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Ee){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ho(e,i.x,r.x,o.x),Ho(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ks=class extends ri{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Ho(e,i.x,r.x,o.x),Ho(e,i.y,r.y,o.y),Ho(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ca=class extends ri{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Ee){let n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],d=i[o>i.length-2?i.length-1:o+1],f=i[o>i.length-3?i.length-1:o+2];return n.set(Gf(a,l.x,c.x,d.x,f.x),Gf(a,l.y,c.y,d.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new Ee().fromArray(i))}return this}},jh=Object.freeze({__proto__:null,ArcCurve:Xl,CatmullRomCurve3:Qr,CubicBezierCurve:oa,CubicBezierCurve3:ql,EllipseCurve:jr,LineCurve:aa,LineCurve3:Yl,QuadraticBezierCurve:la,QuadraticBezierCurve3:Ks,SplineCurve:ca}),Kl=class extends ri{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new jh[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let d=l[c];n&&n.equals(d)||(t.push(d),n=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new jh[i.type]().fromJSON(i))}return this.cacheLengths=null,this}},Ms=class extends Kl{constructor(e){super(),this.type="Path",this.currentPoint=new Ee,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new aa(this.currentPoint.clone(),new Ee(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new la(this.currentPoint.clone(),new Ee(e,t),new Ee(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){let a=new oa(this.currentPoint.clone(),new Ee(e,t),new Ee(n,i),new Ee(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ca(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,l){let c=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+c,t+d,n,i,r,o,a,l),this}absellipse(e,t,n,i,r,o,a,l){let c=new jr(e,t,n,i,r,o,a,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let d=c.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Zs=class extends Ms{constructor(e){super(e),this.uuid=wi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new Ms().fromJSON(i))}return this}};function Rg(s,e,t=2){let n=e&&e.length,i=n?e[0]*t:s.length,r=Wp(s,0,i,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Dg(s,e,r,t)),s.length>80*t){a=s[0],l=s[1];let d=a,f=l;for(let h=t;h<i;h+=t){let u=s[h],g=s[h+1];u<a&&(a=u),g<l&&(l=g),u>d&&(d=u),g>f&&(f=g)}c=Math.max(d-a,f-l),c=c!==0?32767/c:0}return ha(r,o,t,a,l,c,0),o}function Wp(s,e,t,n,i){let r;if(i===Wg(s,e,t,n)>0)for(let o=e;o<t;o+=n)r=Vf(o/n|0,s[o],s[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Vf(o/n|0,s[o],s[o+1],r);return r&&eo(r,r.next)&&(da(r),r=r.next),r}function $s(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(eo(t,t.next)||rn(t.prev,t,t.next)===0)){if(da(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function ha(s,e,t,n,i,r,o){if(!s)return;!o&&r&&Bg(s,n,i,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Pg(s,n,i,r):Cg(s)){e.push(l.i,s.i,c.i),da(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=Ig($s(s),e),ha(s,e,t,n,i,r,2)):o===2&&Lg(s,e,t,n,i,r):ha($s(s),e,t,n,i,r,1);break}}}function Cg(s){let e=s.prev,t=s,n=s.next;if(rn(e,t,n)>=0)return!1;let i=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,d=Math.min(i,r,o),f=Math.min(a,l,c),h=Math.max(i,r,o),u=Math.max(a,l,c),g=n.next;for(;g!==e;){if(g.x>=d&&g.x<=h&&g.y>=f&&g.y<=u&&Fo(i,a,r,l,o,c,g.x,g.y)&&rn(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Pg(s,e,t,n){let i=s.prev,r=s,o=s.next;if(rn(i,r,o)>=0)return!1;let a=i.x,l=r.x,c=o.x,d=i.y,f=r.y,h=o.y,u=Math.min(a,l,c),g=Math.min(d,f,h),_=Math.max(a,l,c),p=Math.max(d,f,h),m=Qh(u,g,e,t,n),y=Qh(_,p,e,t,n),M=s.prevZ,v=s.nextZ;for(;M&&M.z>=m&&v&&v.z<=y;){if(M.x>=u&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Fo(a,d,l,f,c,h,M.x,M.y)&&rn(M.prev,M,M.next)>=0||(M=M.prevZ,v.x>=u&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Fo(a,d,l,f,c,h,v.x,v.y)&&rn(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;M&&M.z>=m;){if(M.x>=u&&M.x<=_&&M.y>=g&&M.y<=p&&M!==i&&M!==o&&Fo(a,d,l,f,c,h,M.x,M.y)&&rn(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;v&&v.z<=y;){if(v.x>=u&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Fo(a,d,l,f,c,h,v.x,v.y)&&rn(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Ig(s,e){let t=s;do{let n=t.prev,i=t.next.next;!eo(n,i)&&qp(n,t,t.next,i)&&ua(n,i)&&ua(i,n)&&(e.push(n.i,t.i,i.i),da(t),da(t.next),t=s=i),t=t.next}while(t!==s);return $s(t)}function Lg(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Hg(o,a)){let l=Yp(o,a);o=$s(o,o.next),l=$s(l,l.next),ha(o,e,t,n,i,r,0),ha(l,e,t,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function Dg(s,e,t,n){let i=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:s.length,c=Wp(s,a,l,n,!1);c===c.next&&(c.steiner=!0),i.push(zg(c))}i.sort(Ng);for(let r=0;r<i.length;r++)t=Ug(i[r],t);return t}function Ng(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function Ug(s,e){let t=Og(s,e);if(!t)return e;let n=Yp(t,s);return $s(n,n.next),$s(t,t.next)}function Og(s,e){let t=e,n=s.x,i=s.y,r=-1/0,o;if(eo(s,t))return t;do{if(eo(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let f=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,o=t.x<t.next.x?t:t.next,f===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,d=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Xp(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)){let f=Math.abs(i-t.y)/(n-t.x);ua(t,s)&&(f<d||f===d&&(t.x>o.x||t.x===o.x&&Fg(o,t)))&&(o=t,d=f)}t=t.next}while(t!==a);return o}function Fg(s,e){return rn(s.prev,s,e.prev)<0&&rn(e.next,s,s.next)<0}function Bg(s,e,t,n){let i=s;do i.z===0&&(i.z=Qh(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,kg(i)}function kg(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,t*=2}while(e>1);return s}function Qh(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function zg(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Xp(s,e,t,n,i,r,o,a){return(i-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(i-o)*(n-a)}function Fo(s,e,t,n,i,r,o,a){return!(s===o&&e===a)&&Xp(s,e,t,n,i,r,o,a)}function Hg(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!Gg(s,e)&&(ua(s,e)&&ua(e,s)&&Vg(s,e)&&(rn(s.prev,s,e.prev)||rn(s,e.prev,e))||eo(s,e)&&rn(s.prev,s,s.next)>0&&rn(e.prev,e,e.next)>0)}function rn(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function eo(s,e){return s.x===e.x&&s.y===e.y}function qp(s,e,t,n){let i=Al(rn(s,e,t)),r=Al(rn(s,e,n)),o=Al(rn(t,n,s)),a=Al(rn(t,n,e));return!!(i!==r&&o!==a||i===0&&wl(s,t,e)||r===0&&wl(s,n,e)||o===0&&wl(t,s,n)||a===0&&wl(t,e,n))}function wl(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function Al(s){return s>0?1:s<0?-1:0}function Gg(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&qp(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function ua(s,e){return rn(s.prev,s,s.next)<0?rn(s,e,s.next)>=0&&rn(s,s.prev,e)>=0:rn(s,e,s.prev)<0||rn(s,s.next,e)<0}function Vg(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Yp(s,e){let t=eu(s.i,s.x,s.y),n=eu(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Vf(s,e,t,n){let i=eu(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function da(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function eu(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Wg(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var tu=class{static triangulate(e,t,n=2){return Rg(e,t,n)}},Fr=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];Wf(e),Xf(n,e);let o=e.length;t.forEach(Wf);for(let l=0;l<t.length;l++)i.push(o),o+=t[l].length,Xf(n,t[l]);let a=tu.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Wf(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Xf(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var Js=class s extends Jr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},to=class s extends on{constructor(e=[new Ee(0,-.5),new Ee(.5,0),new Ee(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=St(i,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],d=1/t,f=new D,h=new Ee,u=new D,g=new D,_=new D,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,u.x=m*1,u.y=-p,u.z=m*0,_.copy(u),u.normalize(),l.push(u.x,u.y,u.z);break;case e.length-1:_.normalize(),l.push(_.x,_.y,_.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,u.x=m*1,u.y=-p,u.z=m*0,g.copy(u),u.x+=_.x,u.y+=_.y,u.z+=_.z,u.normalize(),l.push(u.x,u.y,u.z),_.copy(g)}for(let y=0;y<=t;y++){let M=n+y*d*i,v=Math.sin(M),C=Math.cos(M);for(let R=0;R<=e.length-1;R++){f.x=e[R].x*v,f.y=e[R].y,f.z=e[R].x*C,o.push(f.x,f.y,f.z),h.x=y/t,h.y=R/(e.length-1),a.push(h.x,h.y);let b=l[3*R+0]*v,w=l[3*R+1],z=l[3*R+0]*C;c.push(b,w,z)}}for(let y=0;y<t;y++)for(let M=0;M<e.length-1;M++){let v=M+y*e.length,C=v,R=v+e.length,b=v+e.length+1,w=v+1;r.push(C,R,w),r.push(b,w,R)}this.setIndex(r),this.setAttribute("position",new Rt(o,3)),this.setAttribute("uv",new Rt(a,2)),this.setAttribute("normal",new Rt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.points,e.segments,e.phiStart,e.phiLength)}},Ln=class s extends Jr{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},js=class s extends on{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,d=l+1,f=e/a,h=t/l,u=[],g=[],_=[],p=[];for(let m=0;m<d;m++){let y=m*h-o;for(let M=0;M<c;M++){let v=M*f-r;g.push(v,-y,0),_.push(0,0,1),p.push(M/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let M=y+c*m,v=y+c*(m+1),C=y+1+c*(m+1),R=y+1+c*m;u.push(M,v,R),u.push(v,C,R)}this.setIndex(u),this.setAttribute("position",new Rt(g,3)),this.setAttribute("normal",new Rt(_,3)),this.setAttribute("uv",new Rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},Bn=class s extends on{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],l=[],c=[],d=[],f=e,h=(t-e)/i,u=new D,g=new Ee;for(let _=0;_<=i;_++){for(let p=0;p<=n;p++){let m=r+p/n*o;u.x=f*Math.cos(m),u.y=f*Math.sin(m),l.push(u.x,u.y,u.z),c.push(0,0,1),g.x=(u.x/t+1)/2,g.y=(u.y/t+1)/2,d.push(g.x,g.y)}f+=h}for(let _=0;_<i;_++){let p=_*(n+1);for(let m=0;m<n;m++){let y=m+p,M=y,v=y+n+1,C=y+n+2,R=y+1;a.push(M,v,R),a.push(v,C,R)}}this.setIndex(a),this.setAttribute("position",new Rt(l,3)),this.setAttribute("normal",new Rt(c,3)),this.setAttribute("uv",new Rt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},no=class s extends on{constructor(e=new Zs([new Ee(0,.5),new Ee(-.5,-.5),new Ee(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let d=0;d<e.length;d++)c(e[d]),this.addGroup(a,l,d),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Rt(i,3)),this.setAttribute("normal",new Rt(r,3)),this.setAttribute("uv",new Rt(o,2));function c(d){let f=i.length/3,h=d.extractPoints(t),u=h.shape,g=h.holes;Fr.isClockWise(u)===!1&&(u=u.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];Fr.isClockWise(y)===!0&&(g[p]=y.reverse())}let _=Fr.triangulateShape(u,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];u=u.concat(y)}for(let p=0,m=u.length;p<m;p++){let y=u[p];i.push(y.x,y.y,0),r.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=_.length;p<m;p++){let y=_[p],M=y[0]+f,v=y[1]+f,C=y[2]+f;n.push(M,v,C),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Xg(t,e)}static fromJSON(e,t){let n=[];for(let i=0,r=e.shapes.length;i<r;i++){let o=t[e.shapes[i]];n.push(o)}return new s(n,e.curveSegments)}};function Xg(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){let i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}var It=class s extends on{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],d=[],f=[],h=new D,u=new D,g=new D;for(let _=0;_<=n;_++){let p=o+_/n*a;for(let m=0;m<=i;m++){let y=m/i*r;u.x=(e+t*Math.cos(p))*Math.cos(y),u.y=(e+t*Math.cos(p))*Math.sin(y),u.z=t*Math.sin(p),c.push(u.x,u.y,u.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),g.subVectors(u,h).normalize(),d.push(g.x,g.y,g.z),f.push(m/i),f.push(_/n)}}for(let _=1;_<=n;_++)for(let p=1;p<=i;p++){let m=(i+1)*_+p-1,y=(i+1)*(_-1)+p-1,M=(i+1)*(_-1)+p,v=(i+1)*_+p;l.push(m,y,v),l.push(y,M,v)}this.setIndex(l),this.setAttribute("position",new Rt(c,3)),this.setAttribute("normal",new Rt(d,3)),this.setAttribute("uv",new Rt(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var io=class s extends on{constructor(e=new Ks(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new D,l=new D,c=new Ee,d=new D,f=[],h=[],u=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new Rt(f,3)),this.setAttribute("normal",new Rt(h,3)),this.setAttribute("uv",new Rt(u,2));function _(){for(let M=0;M<t;M++)p(M);p(r===!1?t:0),y(),m()}function p(M){d=e.getPointAt(M/t,d);let v=o.normals[M],C=o.binormals[M];for(let R=0;R<=i;R++){let b=R/i*Math.PI*2,w=Math.sin(b),z=-Math.cos(b);l.x=z*v.x+w*C.x,l.y=z*v.y+w*C.y,l.z=z*v.z+w*C.z,l.normalize(),h.push(l.x,l.y,l.z),a.x=d.x+n*l.x,a.y=d.y+n*l.y,a.z=d.z+n*l.z,f.push(a.x,a.y,a.z)}}function m(){for(let M=1;M<=t;M++)for(let v=1;v<=i;v++){let C=(i+1)*(M-1)+(v-1),R=(i+1)*M+(v-1),b=(i+1)*M+v,w=(i+1)*(M-1)+v;g.push(C,R,w),g.push(R,b,w)}}function y(){for(let M=0;M<=t;M++)for(let v=0;v<=i;v++)c.x=M/t,c.y=v/i,u.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new s(new jh[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function cr(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];if(qf(i))i.isRenderTargetTexture?(ct("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone();else if(Array.isArray(i))if(qf(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();e[t][n]=r}else e[t][n]=i.slice();else e[t][n]=i}}return e}function zn(s){let e={};for(let t=0;t<s.length;t++){let n=cr(s[t]);for(let i in n)e[i]=n[i]}return e}function qf(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function qg(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function ku(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:At.workingColorSpace}var Kp={clone:cr,merge:zn},Yg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Kg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Di=class extends Xn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Yg,this.fragmentShader=Kg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cr(e.uniforms),this.uniformsGroups=qg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new at().setHex(i.value);break;case"v2":this.uniforms[n].value=new Ee().fromArray(i.value);break;case"v3":this.uniforms[n].value=new D().fromArray(i.value);break;case"v4":this.uniforms[n].value=new Zt().fromArray(i.value);break;case"m3":this.uniforms[n].value=new yt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new mt().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Zl=class extends Di{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},kn=class extends Xn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new at(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new at(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Kc,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ji,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},qn=class extends kn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ee(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return St(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new at(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new at(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new at(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return zs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){zs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var $l=class extends Xn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Pp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Jl=class extends Xn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function _s(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Bo(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function Zg(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Yf(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function $g(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}var Ni=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},jl=class extends Ni{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Bs,endingEnd:Bs}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case ks:r=e,a=2*t-n;break;case Vo:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ks:o=e,l=2*n-t;break;case Vo:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}let c=(n-t)*.5,d=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,u=this._weightNext,g=(n-t)/(i-t),_=g*g,p=_*g,m=-h*p+2*h*_-h*g,y=(1+h)*p+(-1.5-2*h)*_+(-.5+h)*g+1,M=(-1-u)*p+(1.5+u)*_+.5*g,v=u*p-u*_;for(let C=0;C!==a;++C)r[C]=m*o[d+C]+y*o[c+C]+M*o[l+C]+v*o[f+C];return r}},fa=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=(n-t)/(i-t),f=1-d;for(let h=0;h!==a;++h)r[h]=o[c+h]*f+o[l+h]*d;return r}},Ql=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},ec=class extends Ni{interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this.inTangents,f=this.outTangents;if(!d||!f){let g=(n-t)/(i-t),_=1-g;for(let p=0;p!==a;++p)r[p]=o[c+p]*_+o[l+p]*g;return r}let h=a*2,u=e-1;for(let g=0;g!==a;++g){let _=o[c+g],p=o[l+g],m=u*h+g*2,y=f[m],M=f[m+1],v=e*h+g*2,C=d[v],R=d[v+1],b=jg(n,t,y,C,i);r[g]=Zp(b,_,M,R,p)}return r}};function Zp(s,e,t,n,i){let r=1-s;return r*r*r*e+3*r*r*s*t+3*r*s*s*n+s*s*s*i}function Jg(s,e,t,n,i){let r=1-s;return 3*r*r*(t-e)+6*r*s*(n-t)+3*s*s*(i-n)}function jg(s,e,t,n,i){let r=(s-e)/(i-e);for(let o=0;o<8;o++){let a=Zp(r,e,t,n,i)-s;if(Math.abs(a)<1e-10)break;let l=Jg(r,e,t,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var Jn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=_s(t,this.TimeBufferType),this.values=_s(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:_s(e.times,Array),values:_s(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i),Bo(e.settings)&&(n.settings={inTangents:_s(e.settings.inTangents,Array),outTangents:_s(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Ql(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new jl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ec(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Hs:t=this.InterpolantFactoryMethodDiscrete;break;case Gs:t=this.InterpolantFactoryMethodLinear;break;case Pl:t=this.InterpolantFactoryMethodSmooth;break;case $h:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ct("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Hs;case this.InterpolantFactoryMethodLinear:return Gs;case this.InterpolantFactoryMethodSmooth:return Pl;case this.InterpolantFactoryMethodBezier:return $h}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e;Bo(this.settings)&&(Kf(this.settings.inTangents,e),Kf(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e;Bo(this.settings)&&(Zf(this.settings.inTangents,e),Zf(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(pt("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(pt("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){pt("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){pt("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&B0(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){pt("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Pl,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],d=e[a+1];if(c!==d&&(a!==1||c!==e[0]))if(i)l=!0;else{let f=a*n,h=f-n,u=f+n;for(let g=0;g!==n;++g){let _=t[f+g];if(_!==t[h+g]||_!==t[u+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let f=a*n,h=o*n;for(let u=0;u!==n;++u)t[h+u]=t[f+u]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,Bo(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Kf(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]+=e}function Zf(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]*=e}Jn.prototype.ValueTypeName="";Jn.prototype.TimeBufferType=Float32Array;Jn.prototype.ValueBufferType=Float32Array;Jn.prototype.DefaultInterpolation=Gs;var ns=class extends Jn{constructor(e,t,n){super(e,t,n)}};ns.prototype.ValueTypeName="bool";ns.prototype.ValueBufferType=Array;ns.prototype.DefaultInterpolation=Hs;ns.prototype.InterpolantFactoryMethodLinear=void 0;ns.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends Jn{constructor(e,t,n,i){super(e,t,n,i)}};pa.prototype.ValueTypeName="color";var is=class extends Jn{constructor(e,t,n,i){super(e,t,n,i)}};is.prototype.ValueTypeName="number";var tc=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t),c=e*a;for(let d=c+a;c!==d;c+=4)En.slerpFlat(r,0,o,c-a,o,c,l);return r}},ss=class extends Jn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new tc(this.times,this.values,this.getValueSize(),e)}};ss.prototype.ValueTypeName="quaternion";ss.prototype.InterpolantFactoryMethodSmooth=void 0;var rs=class extends Jn{constructor(e,t,n){super(e,t,n)}};rs.prototype.ValueTypeName="string";rs.prototype.ValueBufferType=Array;rs.prototype.DefaultInterpolation=Hs;rs.prototype.InterpolantFactoryMethodLinear=void 0;rs.prototype.InterpolantFactoryMethodSmooth=void 0;var bs=class extends Jn{constructor(e,t,n,i){super(e,t,n,i)}};bs.prototype.ValueTypeName="vector";var Qs=class{constructor(e="",t=-1,n=[],i=Yc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=wi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(e_(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Jn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let d=Zg(l);l=Yf(l,1,d),c=Yf(c,1,d),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new is(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],d=c.name.match(r);if(d&&d.length>1){let f=d[1],h=i[f];h||(i[f]=h=[]),h.push(c)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Qg(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return is;case"vector":case"vector2":case"vector3":case"vector4":return bs;case"color":return pa;case"quaternion":return ss;case"bool":case"boolean":return ns;case"string":return rs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function e_(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Qg(s.type);if(s.times===void 0){let n=[],i=[];$g(s.keys,n,i,"value"),s.times=n,s.values=i}let t;return e.parse!==void 0?t=e.parse(s):t=new e(s.name,s.times,s.values,s.interpolation),Bo(s.settings)&&(t.settings={inTangents:_s(s.settings.inTangents,Float32Array),outTangents:_s(s.settings.outTangents,Float32Array)}),t}var Ci={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&($f(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!$f(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function $f(s){try{let e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Ss=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){a++,r===!1&&i.onStart!==void 0&&i.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,i.onProgress!==void 0&&i.onProgress(d,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(d){i.onError!==void 0&&i.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,f){return c.push(d,f),this},this.removeHandler=function(d){let f=c.indexOf(d);return f!==-1&&c.splice(f,2),this},this.getHandler=function(d){for(let f=0,h=c.length;f<h;f+=2){let u=c[f],g=c[f+1];if(u.global&&(u.lastIndex=0),u.test(d))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},$p=new Ss,Ui=class{constructor(e){this.manager=e!==void 0?e:$p,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};Ui.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ki={},nu=class extends Error{constructor(e,t){super(e),this.response=t}},so=class extends Ui{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=Ci.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Ki[e]!==void 0){Ki[e].push({onLoad:t,onProgress:n,onError:i});return}Ki[e]=[],Ki[e].push({onLoad:t,onProgress:n,onError:i});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&ct("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let d=Ki[e],f=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),u=h?parseInt(h):0,g=u!==0,_=0,p=new ReadableStream({start(m){y();function y(){f.read().then(({done:M,value:v})=>{if(M)m.close();else{_+=v.byteLength;let C=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:u});for(let R=0,b=d.length;R<b;R++){let w=d[R];w.onProgress&&w.onProgress(C)}m.enqueue(v),y()}},M=>{m.error(M)})}}});return new Response(p)}else throw new nu(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(d=>new DOMParser().parseFromString(d,a));case"json":return c.json();default:if(a==="")return c.text();{let f=/charset="?([^;"\s]*)"?/i.exec(a),h=f&&f[1]?f[1].toLowerCase():void 0,u=new TextDecoder(h);return c.arrayBuffer().then(g=>u.decode(g))}}}).then(c=>{Ci.add(`file:${e}`,c);let d=Ki[e];delete Ki[e];for(let f=0,h=d.length;f<h;f++){let u=d[f];u.onLoad&&u.onLoad(c)}}).catch(c=>{let d=Ki[e];if(d===void 0)throw this.manager.itemError(e),c;delete Ki[e];for(let f=0,h=d.length;f<h;f++){let u=d[f];u.onError&&u.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Dr=new WeakMap,nc=class extends Ui{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ci.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let f=Dr.get(o);f===void 0&&(f=[],Dr.set(o,f)),f.push({onLoad:t,onError:i})}return o}let a=Hr("img");function l(){d(),t&&t(this);let f=Dr.get(this)||[];for(let h=0;h<f.length;h++){let u=f[h];u.onLoad&&u.onLoad(this)}Dr.delete(this),r.manager.itemEnd(e)}function c(f){d(),i&&i(f),Ci.remove(`image:${e}`);let h=Dr.get(this)||[];for(let u=0;u<h.length;u++){let g=h[u];g.onError&&g.onError(f)}Dr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Ci.add(`image:${e}`,a),r.manager.itemStart(e),a.fetchPriority=this.priority,a.src=e,a}};var ma=class extends Ui{constructor(e){super(e)}load(e,t,n,i){let r=new xn,o=new nc(this.manager);return o.setPriority(this.priority),o.setCache(this.cache),o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},er=class extends Vt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new at(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ga=class extends er{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new at(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Yh=new mt,Jf=new D,jf=new D,ro=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.mapType=jn,this.map=null,this.mapPass=null,this.matrix=new mt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new vs,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new Zt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Jf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Jf),jf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(jf),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,i){Yh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Yh,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=i?i.z/r.x:1,a=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;e.coordinateSystem===zr||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Yh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Rl=new D,Cl=new En,Ri=new D,_a=class extends Vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new mt,this.projectionMatrix=new mt,this.projectionMatrixInverse=new mt,this.coordinateSystem=fi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Rl,Cl,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Rl,Cl,Ri.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Rl,Cl,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Rl,Cl,Ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},gs=new D,Qf=new Ee,ep=new Ee,bn=class extends _a{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Vs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ko*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Vs*2*Math.atan(Math.tan(ko*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){gs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(gs.x,gs.y).multiplyScalar(-e/gs.z),gs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(gs.x,gs.y).multiplyScalar(-e/gs.z)}getViewSize(e,t){return this.getViewBounds(e,Qf,ep),t.subVectors(ep,Qf)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ko*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},iu=class extends ro{constructor(){super(new bn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Vs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},ya=class extends er{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.target=new Vt,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new iu}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},su=class extends ro{constructor(){super(new bn(90,1,.5,500)),this.isPointLightShadow=!0}},Si=class extends er{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new su}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},tr=class extends _a{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ru=class extends ro{constructor(){super(new tr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Es=class extends er{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.target=new Vt,this.shadow=new ru}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var os=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var Kh=new WeakMap,xa=class extends Ui{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&ct("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&ct("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Ci.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{Kh.has(o)===!0?(i&&i(Kh.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",a.headers=this.requestHeader,a.priority=this.priority,a.cache=this.cache,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Ci.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),Kh.set(l,c),Ci.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Ci.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Nr=-90,Ur=1,oo=class extends Vt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new bn(Nr,Ur,e,t);i.layers=this.layers,this.add(i);let r=new bn(Nr,Ur,e,t);r.layers=this.layers,this.add(r);let o=new bn(Nr,Ur,e,t);o.layers=this.layers,this.add(o);let a=new bn(Nr,Ur,e,t);a.layers=this.layers,this.add(a);let l=new bn(Nr,Ur,e,t);l.layers=this.layers,this.add(l);let c=new bn(Nr,Ur,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===fi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===zr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,d]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(f,h,u),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ic=class extends bn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var sc=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){En.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;En.multiplyQuaternionsFlat(e,o,e,t,e,n),En.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let l=t+a;e[l]=e[l]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}},zu="\\[\\]\\.:\\/",t_=new RegExp("["+zu+"]","g"),Hu="[^"+zu+"]",n_="[^"+zu.replace("\\.","")+"]",i_=/((?:WC+[\/:])*)/.source.replace("WC",Hu),s_=/(WCOD+)?/.source.replace("WCOD",n_),r_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hu),o_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hu),a_=new RegExp("^"+i_+s_+r_+o_+"$"),l_=["material","materials","bones","map"],ou=class{constructor(e,t,n){let i=n||Jt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Jt=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(t_,"")}static parseTrackName(e){let t=a_.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);l_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ct("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){pt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){pt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===c){c=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){pt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){pt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){pt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){pt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[i];if(o===void 0){let c=t.nodeName;pt("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){pt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Jt.Composite=ou;Jt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Jt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Jt.prototype.GetterByBindingType=[Jt.prototype._getValue_direct,Jt.prototype._getValue_array,Jt.prototype._getValue_arrayElement,Jt.prototype._getValue_toArray];Jt.prototype.SetterByBindingTypeAndVersioning=[[Jt.prototype._setValue_direct,Jt.prototype._setValue_direct_setNeedsUpdate,Jt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_array,Jt.prototype._setValue_array_setNeedsUpdate,Jt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_arrayElement,Jt.prototype._setValue_arrayElement_setNeedsUpdate,Jt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Jt.prototype._setValue_fromArray,Jt.prototype._setValue_fromArray_setNeedsUpdate,Jt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var rc=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),l={endingStart:Bs,endingEnd:Bs};for(let c=0;c!==o;++c){let d=r[c].createInterpolant(null);a[c]=d,d.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=Ap,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Cp:for(let d=0,f=l.length;d!==f;++d)l[d].evaluate(o),c[d].accumulateAdditive(a);break;case Yc:default:for(let d=0,f=l.length;d!==f;++d)l[d].evaluate(o),c[d].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===Rp;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===qc){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this._loopCount=r,this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=ks,i.endingEnd=ks):(e?i.endingStart=this.zeroSlopeAtStart?ks:Bs:i.endingStart=Vo,t?i.endingEnd=this.zeroSlopeAtEnd?ks:Bs:i.endingEnd=Vo)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}},c_=new Float32Array(1),va=class extends pi{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,d=c[l];d===void 0&&(d={},c[l]=d);for(let f=0;f!==r;++f){let h=i[f],u=h.name,g=d[u];if(g!==void 0)++g.referenceCount,o[f]=g;else{if(g=o[f],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,u));continue}let _=t&&t._propertyBindings[f].binding.parsedPath;g=new sc(Jt.create(n,u,_),h.ValueTypeName,h.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,u),o[f]=g}a[f].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],d=e._byClipCacheIndex;c._byClipCacheIndex=d,l[d]=c,l.pop(),e._byClipCacheIndex=null;let f=a.actionByRoot,h=(e._localRoot||this._root).uuid;delete f[h],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new fa(new Float32Array(2),new Float32Array(2),1,c_),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e=="string"?Qs.findByName(i,e):e,a=o!==null?o.uuid:e,l=this._actionsByClip[a],c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Yc),l!==void 0){let f=l.actionByRoot[r];if(f!==void 0&&f.blendMode===n)return f;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;let d=new rc(this,o,t,n);return this._bindAction(d,c),this._addInactiveAction(d,a,r),d}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?Qs.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,o);let a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){let c=o[a];this._deactivateAction(c);let d=c._cacheIndex,f=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,f._cacheIndex=d,t[d]=f,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var tp=new mt,Ma=class{constructor(e,t,n=0,i=1/0){this.ray=new Pi(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Wr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):pt("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return tp.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(tp),this}intersectObject(e,t=!0,n=[]){return au(e,this,n,t),n.sort(np),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)au(e[i],this,n,t);return n.sort(np),n}};function np(s,e){return s.distance-e.distance}function au(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)au(r[o],e,t,!0)}}var ao=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=St(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(St(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var lu=class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};var ba=class extends pi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function Gu(s,e,t,n){let i=h_(n);switch(t){case wu:return s*e;case dc:return s*e/i.components*i.byteLength;case fc:return s*e/i.components*i.byteLength;case Rs:return s*e*2/i.components*i.byteLength;case pc:return s*e*2/i.components*i.byteLength;case Au:return s*e*3/i.components*i.byteLength;case _i:return s*e*4/i.components*i.byteLength;case mc:return s*e*4/i.components*i.byteLength;case Ea:case Ta:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case wa:case Aa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case _c:case xc:return Math.max(s,16)*Math.max(e,8)/4;case gc:case yc:return Math.max(s,8)*Math.max(e,8)/2;case vc:case Mc:case Sc:case Ec:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case bc:case Ra:case Tc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case wc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ac:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Rc:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Cc:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Pc:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Ic:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Lc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Dc:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Nc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Uc:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Oc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Fc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Bc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case kc:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case zc:case Hc:case Gc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Vc:case Wc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Ca:case Xc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function h_(s){switch(s){case jn:case bu:return{byteLength:1,components:1};case uo:case Su:case Ti:return{byteLength:2,components:1};case hc:case uc:return{byteLength:2,components:4};case Ei:case cc:case oi:return{byteLength:4,components:1};case Eu:case Tu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?ct("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function ym(){let s=null,e=!1,t=null,n=null;function i(r,o){n=s.requestAnimationFrame(i),t(r,o)}return{start:function(){e!==!0&&t!==null&&s!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function d_(s){let e=new WeakMap;function t(a,l){let c=a.array,d=a.usage,f=c.byteLength,h=s.createBuffer();s.bindBuffer(l,h),s.bufferData(l,c,d),a.onUploadCallback();let u;if(c instanceof Float32Array)u=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)u=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?u=s.HALF_FLOAT:u=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)u=s.SHORT;else if(c instanceof Uint32Array)u=s.UNSIGNED_INT;else if(c instanceof Int32Array)u=s.INT;else if(c instanceof Int8Array)u=s.BYTE;else if(c instanceof Uint8Array)u=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)u=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:u,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,l,c){let d=l.array,f=l.updateRanges;if(s.bindBuffer(c,a),f.length===0)s.bufferSubData(c,0,d);else{f.sort((u,g)=>u.start-g.start);let h=0;for(let u=1;u<f.length;u++){let g=f[h],_=f[u];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,f[h]=_)}f.length=h+1;for(let u=0,g=f.length;u<g;u++){let _=f[u];s.bufferSubData(c,_.start*d.BYTES_PER_ELEMENT,d,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var f_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,p_=`#ifdef USE_ALPHAHASH
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
#endif`,m_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,g_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,__=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,y_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,x_=`#ifdef USE_AOMAP
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
#endif`,v_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,M_=`#ifdef USE_BATCHING
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
#endif`,b_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,S_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,E_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,T_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,w_=`#ifdef USE_IRIDESCENCE
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
#endif`,A_=`#ifdef USE_BUMPMAP
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
#endif`,R_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,C_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,P_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,I_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,L_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,D_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,N_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,U_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,O_=`#define PI 3.141592653589793
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
} // validated`,F_=`vec3 transformedNormal = objectNormal;
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
#endif`,B_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,k_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,z_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,H_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,G_="gl_FragColor = linearToOutputTexel( gl_FragColor );",V_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,W_=`#ifdef USE_ENVMAP
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
#endif`,X_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,q_=`#ifdef USE_ENVMAP
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
#endif`,Y_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,K_=`#ifdef USE_ENVMAP
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
#endif`,Z_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,$_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,J_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,j_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Q_=`#ifdef USE_GRADIENTMAP
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
}`,ey=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ty=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ny=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,iy=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,sy=`#ifdef USE_ENVMAP
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
#endif`,ry=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,oy=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ay=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ly=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cy=`PhysicalMaterial material;
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
#endif`,hy=`uniform sampler2D dfgLUT;
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
}`,uy=`
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
#endif`,dy=`#if defined( RE_IndirectDiffuse )
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
#endif`,fy=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,py=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,my=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_y=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,xy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,vy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,My=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,by=`#if defined( USE_POINTS_UV )
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
#endif`,Sy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ey=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ty=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wy=`#if defined( USE_MORPHCOLORS )
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
#endif`,Ay=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ry=`#ifdef USE_MORPHTARGETS
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
#endif`,Cy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Py=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Iy=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Ly=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ny=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Uy=`#ifdef USE_NORMALMAP
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
#endif`,Oy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Fy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,By=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ky=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,zy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hy=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Gy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Wy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,qy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Yy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ky=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Zy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,$y=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Jy=`float getShadowMask() {
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
}`,jy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qy=`#ifdef USE_SKINNING
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
#endif`,ex=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tx=`#ifdef USE_SKINNING
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
#endif`,nx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ix=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,sx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,rx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,ox=`#ifdef USE_TRANSMISSION
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
#endif`,ax=`#ifdef USE_TRANSMISSION
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
#endif`,lx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,cx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ux=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,dx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,fx=`uniform sampler2D t2D;
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
}`,px=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mx=`uniform float backgroundBlurriness;
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
}`,gx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_x=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yx=`#include <common>
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
}`,xx=`#if DEPTH_PACKING == 3200
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
}`,vx=`#define DISTANCE
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
}`,Mx=`#define DISTANCE
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
}`,bx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Sx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ex=`uniform float scale;
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
}`,Tx=`uniform vec3 diffuse;
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
}`,wx=`#include <common>
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
}`,Ax=`uniform vec3 diffuse;
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
}`,Rx=`#define LAMBERT
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
}`,Cx=`#define LAMBERT
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
}`,Px=`#define MATCAP
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
}`,Ix=`#define MATCAP
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
}`,Lx=`#define NORMAL
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
}`,Dx=`#define NORMAL
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
}`,Nx=`#define PHONG
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
}`,Ux=`#define PHONG
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
}`,Ox=`#define STANDARD
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
}`,Fx=`#define STANDARD
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
}`,Bx=`#define TOON
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
}`,kx=`#define TOON
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
}`,zx=`uniform float size;
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
}`,Hx=`uniform vec3 diffuse;
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
}`,Gx=`#include <common>
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
}`,Vx=`uniform vec3 color;
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
}`,Wx=`uniform float rotation;
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
}`,Xx=`uniform vec3 diffuse;
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
}`,wt={alphahash_fragment:f_,alphahash_pars_fragment:p_,alphamap_fragment:m_,alphamap_pars_fragment:g_,alphatest_fragment:__,alphatest_pars_fragment:y_,aomap_fragment:x_,aomap_pars_fragment:v_,batching_pars_vertex:M_,batching_vertex:b_,begin_vertex:S_,beginnormal_vertex:E_,bsdfs:T_,iridescence_fragment:w_,bumpmap_pars_fragment:A_,clipping_planes_fragment:R_,clipping_planes_pars_fragment:C_,clipping_planes_pars_vertex:P_,clipping_planes_vertex:I_,color_fragment:L_,color_pars_fragment:D_,color_pars_vertex:N_,color_vertex:U_,common:O_,defaultnormal_vertex:F_,displacementmap_pars_vertex:B_,displacementmap_vertex:k_,emissivemap_fragment:z_,emissivemap_pars_fragment:H_,colorspace_fragment:G_,colorspace_pars_fragment:V_,envmap_fragment:W_,envmap_common_pars_fragment:X_,envmap_pars_fragment:q_,envmap_pars_vertex:Y_,envmap_physical_pars_fragment:sy,envmap_vertex:K_,fog_vertex:Z_,fog_pars_vertex:$_,fog_fragment:J_,fog_pars_fragment:j_,gradientmap_pars_fragment:Q_,lightmap_pars_fragment:ey,lights_lambert_fragment:ty,lights_lambert_pars_fragment:ny,lights_pars_begin:iy,lights_toon_fragment:ry,lights_toon_pars_fragment:oy,lights_phong_fragment:ay,lights_phong_pars_fragment:ly,lights_physical_fragment:cy,lights_physical_pars_fragment:hy,lights_fragment_begin:uy,lights_fragment_maps:dy,lights_fragment_end:fy,lightprobes_pars_fragment:py,logdepthbuf_fragment:my,logdepthbuf_pars_fragment:gy,logdepthbuf_pars_vertex:_y,logdepthbuf_vertex:yy,map_fragment:xy,map_pars_fragment:vy,map_particle_fragment:My,map_particle_pars_fragment:by,metalnessmap_fragment:Sy,metalnessmap_pars_fragment:Ey,morphinstance_vertex:Ty,morphcolor_vertex:wy,morphnormal_vertex:Ay,morphtarget_pars_vertex:Ry,morphtarget_vertex:Cy,normal_fragment_begin:Py,normal_fragment_maps:Iy,normal_pars_fragment:Ly,normal_pars_vertex:Dy,normal_vertex:Ny,normalmap_pars_fragment:Uy,clearcoat_normal_fragment_begin:Oy,clearcoat_normal_fragment_maps:Fy,clearcoat_pars_fragment:By,iridescence_pars_fragment:ky,opaque_fragment:zy,packing:Hy,premultiplied_alpha_fragment:Gy,project_vertex:Vy,dithering_fragment:Wy,dithering_pars_fragment:Xy,roughnessmap_fragment:qy,roughnessmap_pars_fragment:Yy,shadowmap_pars_fragment:Ky,shadowmap_pars_vertex:Zy,shadowmap_vertex:$y,shadowmask_pars_fragment:Jy,skinbase_vertex:jy,skinning_pars_vertex:Qy,skinning_vertex:ex,skinnormal_vertex:tx,specularmap_fragment:nx,specularmap_pars_fragment:ix,tonemapping_fragment:sx,tonemapping_pars_fragment:rx,transmission_fragment:ox,transmission_pars_fragment:ax,uv_pars_fragment:lx,uv_pars_vertex:cx,uv_vertex:hx,worldpos_vertex:ux,background_vert:dx,background_frag:fx,backgroundCube_vert:px,backgroundCube_frag:mx,cube_vert:gx,cube_frag:_x,depth_vert:yx,depth_frag:xx,distance_vert:vx,distance_frag:Mx,equirect_vert:bx,equirect_frag:Sx,linedashed_vert:Ex,linedashed_frag:Tx,meshbasic_vert:wx,meshbasic_frag:Ax,meshlambert_vert:Rx,meshlambert_frag:Cx,meshmatcap_vert:Px,meshmatcap_frag:Ix,meshnormal_vert:Lx,meshnormal_frag:Dx,meshphong_vert:Nx,meshphong_frag:Ux,meshphysical_vert:Ox,meshphysical_frag:Fx,meshtoon_vert:Bx,meshtoon_frag:kx,points_vert:zx,points_frag:Hx,shadow_vert:Gx,shadow_frag:Vx,sprite_vert:Wx,sprite_frag:Xx},qe={common:{diffuse:{value:new at(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new yt},alphaMap:{value:null},alphaMapTransform:{value:new yt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new yt}},envmap:{envMap:{value:null},envMapRotation:{value:new yt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new yt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new yt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new yt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new yt},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new yt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new yt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new yt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new yt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new at(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new at(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new yt},alphaTest:{value:0},uvTransform:{value:new yt}},sprite:{diffuse:{value:new at(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new yt},alphaMap:{value:null},alphaMapTransform:{value:new yt},alphaTest:{value:0}}},ki={basic:{uniforms:zn([qe.common,qe.specularmap,qe.envmap,qe.aomap,qe.lightmap,qe.fog]),vertexShader:wt.meshbasic_vert,fragmentShader:wt.meshbasic_frag},lambert:{uniforms:zn([qe.common,qe.specularmap,qe.envmap,qe.aomap,qe.lightmap,qe.emissivemap,qe.bumpmap,qe.normalmap,qe.displacementmap,qe.fog,qe.lights,{emissive:{value:new at(0)},envMapIntensity:{value:1}}]),vertexShader:wt.meshlambert_vert,fragmentShader:wt.meshlambert_frag},phong:{uniforms:zn([qe.common,qe.specularmap,qe.envmap,qe.aomap,qe.lightmap,qe.emissivemap,qe.bumpmap,qe.normalmap,qe.displacementmap,qe.fog,qe.lights,{emissive:{value:new at(0)},specular:{value:new at(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:wt.meshphong_vert,fragmentShader:wt.meshphong_frag},standard:{uniforms:zn([qe.common,qe.envmap,qe.aomap,qe.lightmap,qe.emissivemap,qe.bumpmap,qe.normalmap,qe.displacementmap,qe.roughnessmap,qe.metalnessmap,qe.fog,qe.lights,{emissive:{value:new at(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:wt.meshphysical_vert,fragmentShader:wt.meshphysical_frag},toon:{uniforms:zn([qe.common,qe.aomap,qe.lightmap,qe.emissivemap,qe.bumpmap,qe.normalmap,qe.displacementmap,qe.gradientmap,qe.fog,qe.lights,{emissive:{value:new at(0)}}]),vertexShader:wt.meshtoon_vert,fragmentShader:wt.meshtoon_frag},matcap:{uniforms:zn([qe.common,qe.bumpmap,qe.normalmap,qe.displacementmap,qe.fog,{matcap:{value:null}}]),vertexShader:wt.meshmatcap_vert,fragmentShader:wt.meshmatcap_frag},points:{uniforms:zn([qe.points,qe.fog]),vertexShader:wt.points_vert,fragmentShader:wt.points_frag},dashed:{uniforms:zn([qe.common,qe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:wt.linedashed_vert,fragmentShader:wt.linedashed_frag},depth:{uniforms:zn([qe.common,qe.displacementmap]),vertexShader:wt.depth_vert,fragmentShader:wt.depth_frag},normal:{uniforms:zn([qe.common,qe.bumpmap,qe.normalmap,qe.displacementmap,{opacity:{value:1}}]),vertexShader:wt.meshnormal_vert,fragmentShader:wt.meshnormal_frag},sprite:{uniforms:zn([qe.sprite,qe.fog]),vertexShader:wt.sprite_vert,fragmentShader:wt.sprite_frag},background:{uniforms:{uvTransform:{value:new yt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:wt.background_vert,fragmentShader:wt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new yt}},vertexShader:wt.backgroundCube_vert,fragmentShader:wt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:wt.cube_vert,fragmentShader:wt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:wt.equirect_vert,fragmentShader:wt.equirect_frag},distance:{uniforms:zn([qe.common,qe.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:wt.distance_vert,fragmentShader:wt.distance_frag},shadow:{uniforms:zn([qe.lights,qe.fog,{color:{value:new at(0)},opacity:{value:1}}]),vertexShader:wt.shadow_vert,fragmentShader:wt.shadow_frag}};ki.physical={uniforms:zn([ki.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new yt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new yt},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new yt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new yt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new yt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new yt},sheen:{value:0},sheenColor:{value:new at(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new yt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new yt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new yt},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new yt},attenuationDistance:{value:0},attenuationColor:{value:new at(0)},specularColor:{value:new at(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new yt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new yt},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new yt}}]),vertexShader:wt.meshphysical_vert,fragmentShader:wt.meshphysical_frag};var $c={r:0,b:0,g:0},qx=new mt,xm=new yt;xm.set(-1,0,0,0,1,0,0,0,1);function Yx(s,e,t,n,i,r){let o=new at(0),a=i===!0?0:1,l,c,d=null,f=0,h=null;function u(y){let M=y.isScene===!0?y.background:null;if(M&&M.isTexture){let v=y.backgroundBlurriness>0;M=e.get(M,v)}return M}function g(y){let M=!1,v=u(y);v===null?p(o,a):v&&v.isColor&&(p(v,1),M=!0);let C=s.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,r):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,M){let v=u(M);v&&v.isCubeTexture?(c===void 0&&(c=new tn(new Ii(1,1,1),new Di({name:"BackgroundCubeMaterial",uniforms:cr(ki.backgroundCube.uniforms),vertexShader:ki.backgroundCube.vertexShader,fragmentShader:ki.backgroundCube.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(C,R,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(qx.makeRotationFromEuler(M.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(xm),c.material.toneMapped=At.getTransfer(v.colorSpace)!==Yt,(d!==v||f!==v.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,d=v,f=v.version,h=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new tn(new js(2,2),new Di({name:"BackgroundMaterial",uniforms:cr(ki.background.uniforms),vertexShader:ki.background.vertexShader,fragmentShader:ki.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=At.getTransfer(v.colorSpace)!==Yt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||f!==v.version||h!==s.toneMapping)&&(l.material.needsUpdate=!0,d=v,f=v.version,h=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function p(y,M){y.getRGB($c,ku(s)),t.buffers.color.setClear($c.r,$c.g,$c.b,M,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,M=1){o.set(y),a=M,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,p(o,a)},render:g,addToRenderList:_,dispose:m}}function Kx(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null),r=i,o=!1;function a(H,V,G,U,$){let ne=!1,Y=f(H,U,G,V);r!==Y&&(r=Y,c(r.object)),ne=u(H,U,G,$),ne&&g(H,U,G,$),$!==null&&e.update($,s.ELEMENT_ARRAY_BUFFER),(ne||o)&&(o=!1,v(H,V,G,U),$!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get($).buffer))}function l(){return s.createVertexArray()}function c(H){return s.bindVertexArray(H)}function d(H){return s.deleteVertexArray(H)}function f(H,V,G,U){let $=U.wireframe===!0,ne=n[V.id];ne===void 0&&(ne={},n[V.id]=ne);let Y=H.isInstancedMesh===!0?H.id:0,ye=ne[Y];ye===void 0&&(ye={},ne[Y]=ye);let ie=ye[G.id];ie===void 0&&(ie={},ye[G.id]=ie);let ge=ie[$];return ge===void 0&&(ge=h(l()),ie[$]=ge),ge}function h(H){let V=[],G=[],U=[];for(let $=0;$<t;$++)V[$]=0,G[$]=0,U[$]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:G,attributeDivisors:U,object:H,attributes:{},index:null}}function u(H,V,G,U){let $=r.attributes,ne=V.attributes,Y=0,ye=G.getAttributes();for(let ie in ye)if(ye[ie].location>=0){let Te=$[ie],De=ne[ie];if(De===void 0&&(ie==="instanceMatrix"&&H.instanceMatrix&&(De=H.instanceMatrix),ie==="instanceColor"&&H.instanceColor&&(De=H.instanceColor)),Te===void 0||Te.attribute!==De||De&&Te.data!==De.data)return!0;Y++}return r.attributesNum!==Y||r.index!==U}function g(H,V,G,U){let $={},ne=V.attributes,Y=0,ye=G.getAttributes();for(let ie in ye)if(ye[ie].location>=0){let Te=ne[ie];Te===void 0&&(ie==="instanceMatrix"&&H.instanceMatrix&&(Te=H.instanceMatrix),ie==="instanceColor"&&H.instanceColor&&(Te=H.instanceColor));let De={};De.attribute=Te,Te&&Te.data&&(De.data=Te.data),$[ie]=De,Y++}r.attributes=$,r.attributesNum=Y,r.index=U}function _(){let H=r.newAttributes;for(let V=0,G=H.length;V<G;V++)H[V]=0}function p(H){m(H,0)}function m(H,V){let G=r.newAttributes,U=r.enabledAttributes,$=r.attributeDivisors;G[H]=1,U[H]===0&&(s.enableVertexAttribArray(H),U[H]=1),$[H]!==V&&(s.vertexAttribDivisor(H,V),$[H]=V)}function y(){let H=r.newAttributes,V=r.enabledAttributes;for(let G=0,U=V.length;G<U;G++)V[G]!==H[G]&&(s.disableVertexAttribArray(G),V[G]=0)}function M(H,V,G,U,$,ne,Y){Y===!0?s.vertexAttribIPointer(H,V,G,$,ne):s.vertexAttribPointer(H,V,G,U,$,ne)}function v(H,V,G,U){_();let $=U.attributes,ne=G.getAttributes(),Y=V.defaultAttributeValues;for(let ye in ne){let ie=ne[ye];if(ie.location>=0){let ge=$[ye];if(ge===void 0&&(ye==="instanceMatrix"&&H.instanceMatrix&&(ge=H.instanceMatrix),ye==="instanceColor"&&H.instanceColor&&(ge=H.instanceColor)),ge!==void 0){let Te=ge.normalized,De=ge.itemSize,rt=e.get(ge);if(rt===void 0)continue;let W=rt.buffer,pe=rt.type,we=rt.bytesPerElement,Be=pe===s.INT||pe===s.UNSIGNED_INT||ge.gpuType===cc;if(ge.isInterleavedBufferAttribute){let Me=ge.data,_e=Me.isInterleavedBuffer===!0?Me.stride:Me.itemSize,Ue=ge.offset;if(Me.isInstancedInterleavedBuffer||Me.isInstancedBufferAttribute){for(let Se=0;Se<ie.locationSize;Se++)m(ie.location+Se,Me.meshPerAttribute);H.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=Me.meshPerAttribute*Me.count)}else for(let Se=0;Se<ie.locationSize;Se++)p(ie.location+Se);s.bindBuffer(s.ARRAY_BUFFER,W);for(let Se=0;Se<ie.locationSize;Se++)M(ie.location+Se,De/ie.locationSize,pe,Te,_e*we,(Ue+De/ie.locationSize*Se)*we,Be)}else{if(ge.isInstancedBufferAttribute){for(let Me=0;Me<ie.locationSize;Me++)m(ie.location+Me,ge.meshPerAttribute);H.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let Me=0;Me<ie.locationSize;Me++)p(ie.location+Me);s.bindBuffer(s.ARRAY_BUFFER,W);for(let Me=0;Me<ie.locationSize;Me++)M(ie.location+Me,De/ie.locationSize,pe,Te,De*we,De/ie.locationSize*Me*we,Be)}}else if(Y!==void 0){let Te=Y[ye];if(Te!==void 0)switch(Te.length){case 2:s.vertexAttrib2fv(ie.location,Te);break;case 3:s.vertexAttrib3fv(ie.location,Te);break;case 4:s.vertexAttrib4fv(ie.location,Te);break;default:s.vertexAttrib1fv(ie.location,Te)}}}}y()}function C(){z();for(let H in n){let V=n[H];for(let G in V){let U=V[G];for(let $ in U){let ne=U[$];for(let Y in ne)d(ne[Y].object),delete ne[Y];delete U[$]}}delete n[H]}}function R(H){if(n[H.id]===void 0)return;let V=n[H.id];for(let G in V){let U=V[G];for(let $ in U){let ne=U[$];for(let Y in ne)d(ne[Y].object),delete ne[Y];delete U[$]}}delete n[H.id]}function b(H){for(let V in n){let G=n[V];for(let U in G){let $=G[U];if($[H.id]===void 0)continue;let ne=$[H.id];for(let Y in ne)d(ne[Y].object),delete ne[Y];delete $[H.id]}}}function w(H){for(let V in n){let G=n[V],U=H.isInstancedMesh===!0?H.id:0,$=G[U];if($!==void 0){for(let ne in $){let Y=$[ne];for(let ye in Y)d(Y[ye].object),delete Y[ye];delete $[ne]}delete G[U],Object.keys(G).length===0&&delete n[V]}}}function z(){I(),o=!0,r!==i&&(r=i,c(r.object))}function I(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:z,resetDefaultState:I,dispose:C,releaseStatesOfGeometry:R,releaseStatesOfObject:w,releaseStatesOfProgram:b,initAttributes:_,enableAttribute:p,disableUnusedAttributes:y}}function Zx(s,e,t){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,d){d!==0&&(s.drawArraysInstanced(n,l,c,d),t.update(c,n,d))}function a(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let h=0;for(let u=0;u<d;u++)h+=c[u];t.update(h,n,1)}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function $x(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let b=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(b){return!(b!==_i&&n.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(b){let w=b===Ti&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(b!==jn&&b!==oi&&!w&&n.convert(b)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(b){if(b==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";b="mediump"}return b==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",d=l(c);d!==c&&(ct("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);let f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&ct("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&ct("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let u=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),C=s.getParameter(s.MAX_SAMPLES),R=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:u,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:v,maxSamples:C,samples:R}}function Jx(s){let e=this,t=null,n=0,i=!1,r=!1,o=new Gn,a=new yt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let u=f.length!==0||h||n!==0||i;return i=h,n=f.length,u},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=d(f,h,0)},this.setState=function(f,h,u){let g=f.clippingPlanes,_=f.clipIntersection,p=f.clipShadows,m=s.get(f);if(!i||g===null||g.length===0||r&&!p)r?d(null):c();else{let y=r?0:n,M=y*4,v=m.clippingState||null;l.value=v,v=d(g,h,M,u);for(let C=0;C!==M;++C)v[C]=t[C];m.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(f,h,u,g){let _=f!==null?f.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=u+_*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let M=0,v=u;M!==_;++M,v+=4)o.copy(f[M]).applyMatrix4(y,a),o.normal.toArray(p,v),p[v+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}var Da=class extends si{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new na(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Ii(5,5,5),r=new Di({name:"CubemapFromEquirect",uniforms:cr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Yn,blending:ir});r.uniforms.tEquirect.value=t;let o=new tn(i,r),a=t.minFilter;return t.minFilter===gi&&(t.minFilter=Tn),new oo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}},Jp=256,jx=3,Qx=20,vm=256,Mm=16,ev=3,tv=new D,nv=new at,jc=class s{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new oo(1,10,null),this._boxMesh=new tn(new Ii(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){let{size:o=256,position:a=tv}=r,l=this._renderer;this._setSize(o);let c=this._allocateTarget(),d=this._getSourceTarget(!0);t>0&&(d.texture.mipmapsAutoUpdate=!1);let f=l.autoClear,h=l.autoClearColor,u=l.autoClearDepth,g=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(nv));let p=new oo(n,i,d);return p.position.copy(a),p.update(l,e),l.autoClear=f,l.autoClearColor=h,l.autoClearDepth=u,l.autoClearStencil=g,e.background=_,t>0&&(d.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=em(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Jp,Uu(e))}_fromTexture(e,t){e.mapping===or||e.mapping===co?this._setSize(e.image.length===0?Jp:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=jp(e,!1,!1),n=Math.log2(e)-jx;for(let i=0;i<=n;i++)t.texture.mipmaps.push({width:e>>i,height:e>>i});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=jp(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let i=this._boxMesh,r=this._cubeCamera;i.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let o=e.width>>t;e.viewport.set(0,0,o,o),r.update(this._renderer,i),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===or||e.mapping===co?(this._cubemapMaterial===null&&(this._cubemapMaterial=em()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Qp()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=iv(),this._integrationMaterial=sv());let t=this._cubeSize,n=e.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Mm);for(let o=0;o<=n;o++){let a=s.lodToRoughness(o,n);if(o>n-ev)r.roughness.value=a,this._renderCube(e,o,this._integrationMaterial);else{let l=a>0?Math.log2(t)+.5*Math.log2(6/(vm*Math.pow(a,4)))+.5:0;i.roughness.value=a,i.lodBias.value=l,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=rv());let n=this._blurMaterial,i=n.uniforms,r=this._sourceTarget;i.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,i.envMap.value=r.texture,this._renderCube(e,0,n),i.envMap.value=e.texture,this._renderCube(r,0,n)}};function jp(s,e,t){return new Da(s,{minFilter:gi,generateMipmaps:e,type:Ti,colorSpace:Vn,depthBuffer:t})}function Na(s,e,t){return new Di({name:s,uniforms:e,vertexShader:wt.cube_vert,fragmentShader:t,side:Yn,blending:ir,depthTest:!1,depthWrite:!1})}function iv(){return Na("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${vm}u

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
	`)}function sv(){return Na("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Mm}},`

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
	`)}function rv(){return Na("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Qx}
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
	`)}function Qp(){return Na("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function em(){return Na("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function ov(s){let e=new WeakMap,t=new WeakMap,n=null;function i(h,u=!1){return h==null?null:u?o(h):r(h)}function r(h){if(h&&h.isTexture){let u=h.mapping;if(u===oc||u===ac)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let _=new Da(g.height);return _.fromEquirectangularTexture(s,h),e.set(h,_),h.addEventListener("dispose",c),a(_.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let u=h.mapping,g=u===oc||u===ac,_=u===or||u===co;if(g||_){let p=t.get(h),m=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new jc(s)),p=g?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{let y=h.image;return g&&y&&y.height>0||_&&y&&l(y)?(n===null&&(n=new jc(s)),p=g?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",d),p.texture):null}}}return h}function a(h,u){return u===oc?h.mapping=or:u===ac&&(h.mapping=co),h}function l(h){let u=0,g=6;for(let _=0;_<g;_++)h[_]!==void 0&&u++;return u===g}function c(h){let u=h.target;u.removeEventListener("dispose",c);let g=e.get(u);g!==void 0&&(e.delete(u),g.dispose())}function d(h){let u=h.target;u.removeEventListener("dispose",d);let g=t.get(u);g!==void 0&&(t.delete(u),g.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:f}}function av(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&zs("WebGLRenderer: "+n+" extension not supported."),i}}}function lv(s,e,t,n){let i={},r=new WeakMap,o=new FinalizationRegistry(g=>delete i[g]);function a(g){l(g.target)}function l(g){g.index!==null&&e.remove(g.index);for(let p in g.attributes)e.remove(g.attributes[p]);g.removeEventListener("dispose",a),delete i[g.id],o.unregister(g);let _=r.get(g);_&&(e.remove(_),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function c(g,_){return i[_.id]!==void 0||(_.addEventListener("dispose",a),i[_.id]=new WeakRef(_),o.register(_,_.id,_),t.memory.geometries++),_}function d(g){let _=g.attributes;for(let p in _)e.update(_[p],s.ARRAY_BUFFER)}function f(g){let _=g.index,p=g.attributes.position,m=0;if(p===void 0)return;let y=_!==null?_.array.length:p.array.length/3-1,M=p.count>=65535?$o:Zo,v=new M(Math.ceil(y/3)*6,1),C=v.array;if(_!==null){let b=_.array;m=_.version;for(let w=0,z=0;w<y;w+=3){let I=b[w+0],H=b[w+1],V=b[w+2];C[z++]=I,C[z++]=H,C[z++]=H,C[z++]=V,C[z++]=V,C[z++]=I}}else{m=p.version;for(let b=0,w=0;b<y;b+=3){let z=b+0,I=b+1,H=b+2;C[w++]=z,C[w++]=I,C[w++]=I,C[w++]=H,C[w++]=H,C[w++]=z}}v.version=m;let R=r.get(g);R&&e.remove(R),r.set(g,v)}function h(g){let _=r.get(g);if(_){let p=g.index;p!==null&&_.version<p.version&&f(g)}else f(g);return r.get(g)}function u(){for(let g in i){let _=i[g].deref();_!==void 0&&l(_)}}return{get:c,update:d,getWireframeAttribute:h,dispose:u}}function cv(s,e,t){let n;function i(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,h){s.drawElements(n,h,r,f*o),t.update(h,n,1)}function c(f,h,u){u!==0&&(s.drawElementsInstanced(n,h,r,f*o,u),t.update(h,n,u))}function d(f,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,u);let _=0;for(let p=0;p<u;p++)_+=h[p];t.update(_,n,1)}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function hv(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:pt("WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function uv(s,e,t){let n=new WeakMap,i=new Zt;function r(o,a,l){let c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=d!==void 0?d.length:0,h=n.get(a);if(h===void 0||h.count!==f){let z=function(){b.dispose(),n.delete(a),a.removeEventListener("dispose",z)};h!==void 0&&h.texture.dispose();let u=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],M=0;u===!0&&(M=1),g===!0&&(M=2),_===!0&&(M=3);let v=a.attributes.position.count*M,C=1;v>e.maxTextureSize&&(C=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let R=new Float32Array(v*C*4*f),b=new qo(R,v,C,f);b.type=oi,b.needsUpdate=!0;let w=M*4;for(let I=0;I<f;I++){let H=p[I],V=m[I],G=y[I],U=v*C*4*I;for(let $=0;$<H.count;$++){let ne=$*w;u===!0&&(i.fromBufferAttribute(H,$),R[U+ne+0]=i.x,R[U+ne+1]=i.y,R[U+ne+2]=i.z,R[U+ne+3]=0),g===!0&&(i.fromBufferAttribute(V,$),R[U+ne+4]=i.x,R[U+ne+5]=i.y,R[U+ne+6]=i.z,R[U+ne+7]=0),_===!0&&(i.fromBufferAttribute(G,$),R[U+ne+8]=i.x,R[U+ne+9]=i.y,R[U+ne+10]=i.z,R[U+ne+11]=G.itemSize===4?i.w:1)}}h={count:f,texture:b,size:new Ee(v,C)},n.set(a,h),a.addEventListener("dispose",z)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let u=0;for(let _=0;_<c.length;_++)u+=c[_];let g=a.morphTargetsRelative?1:1-u;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function dv(s,e,t,n,i){let r=new WeakMap;function o(c){let d=i.render.frame,f=c.geometry,h=e.get(c,f);if(r.get(h)!==d&&(e.update(h),r.set(h,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==d&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,d))),c.isSkinnedMesh){let u=c.skeleton;r.get(u)!==d&&(u.update(),r.set(u,d))}return h}function a(){r=new WeakMap}function l(c){let d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:o,dispose:a}}var fv={[mu]:"LINEAR_TONE_MAPPING",[gu]:"REINHARD_TONE_MAPPING",[_u]:"CINEON_TONE_MAPPING",[Sa]:"ACES_FILMIC_TONE_MAPPING",[xu]:"AGX_TONE_MAPPING",[vu]:"NEUTRAL_TONE_MAPPING",[yu]:"CUSTOM_TONE_MAPPING"};function pv(s,e,t,n,i,r){let o=new si(e,t,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,d=new on;d.setAttribute("position",new Rt([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute("uv",new Rt([0,2,0,0,2,0],2));let f=new Zl({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new tn(d,f),u=new tr(-1,1,1,-1,0,1),g=null,_=null,p=!1,m,y=null,M=[],v=!1;this.setSize=function(C,R){o.setSize(C,R),a!==null&&a.setSize(C,R),l!==null&&l.setSize(C,R);for(let b=0;b<M.length;b++){let w=M[b];w.setSize&&w.setSize(C,R)}},this.setEffects=function(C){M=C,v=M.length>0&&M[0].isRenderPass===!0;let R=o.width,b=o.height;M.length>0&&a===null&&(a=new si(R,b,{type:Ti,depthBuffer:!1,stencilBuffer:!1}),l=new si(R,b,{type:Ti,depthBuffer:!1,stencilBuffer:!1}));let w=i===!0&&M.some(z=>z.needsDepthTexture===!0);w!==(o.depthTexture!==null)&&(w===!0&&c===null&&(c=new ts(R,b),r===!0&&(c.format=as,c.type=lr)),o.dispose(),o.depthTexture=w?c:null,o.resolveDepthBuffer=w,o.storeMultisampledDepthBuffer=w);for(let z=0;z<M.length;z++){let I=M[z];I.setSize&&I.setSize(R,b),w&&I.needsDepthTexture===!0&&I.setDepthTexture&&I.setDepthTexture(c)}},this.begin=function(C,R){if(p||C.toneMapping===Fi&&M.length===0)return!1;if(y=R,R!==null){let b=R.width,w=R.height;(o.width!==b||o.height!==w)&&this.setSize(b,w)}return v===!1&&C.setRenderTarget(o),m=C.toneMapping,C.toneMapping=Fi,!0},this.hasRenderPass=function(){return v},this.end=function(C,R){C.toneMapping=m,p=!0;let b=o,w=a;for(let z=0;z<M.length;z++){let I=M[z];I.enabled!==!1&&(I.render(C,w,b,R),I.needsSwap!==!1&&(b=w,w=w===a?l:a))}if(g!==C.outputColorSpace||_!==C.toneMapping){g=C.outputColorSpace,_=C.toneMapping,f.defines={},At.getTransfer(g)===Yt&&(f.defines.SRGB_TRANSFER="");let z=fv[_];z&&(f.defines[z]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=b.texture,C.setRenderTarget(y),C.render(h,u),y=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),d.dispose(),f.dispose()}}var bm=new xn,Sm=new ts(1,1),Em=new ia(1),Tm=new qo,wm=new Hl,Am=new na,tm=[],nm=[],im=new Float32Array(16),sm=new Float32Array(9),rm=new Float32Array(4);function mo(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=tm[i];if(r===void 0&&(r=new Float32Array(i),tm[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function wn(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function An(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function eh(s,e){let t=nm[e];t===void 0&&(t=new Int32Array(e),nm[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function mv(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function gv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wn(t,e))return;s.uniform2fv(this.addr,e),An(t,e)}}function _v(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(wn(t,e))return;s.uniform3fv(this.addr,e),An(t,e)}}function yv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wn(t,e))return;s.uniform4fv(this.addr,e),An(t,e)}}function xv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(wn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),An(t,e)}else{if(wn(t,n))return;rm.set(n),s.uniformMatrix2fv(this.addr,!1,rm),An(t,n)}}function vv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(wn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),An(t,e)}else{if(wn(t,n))return;sm.set(n),s.uniformMatrix3fv(this.addr,!1,sm),An(t,n)}}function Mv(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(wn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),An(t,e)}else{if(wn(t,n))return;im.set(n),s.uniformMatrix4fv(this.addr,!1,im),An(t,n)}}function bv(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Sv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wn(t,e))return;s.uniform2iv(this.addr,e),An(t,e)}}function Ev(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(wn(t,e))return;s.uniform3iv(this.addr,e),An(t,e)}}function Tv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wn(t,e))return;s.uniform4iv(this.addr,e),An(t,e)}}function wv(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Av(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(wn(t,e))return;s.uniform2uiv(this.addr,e),An(t,e)}}function Rv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(wn(t,e))return;s.uniform3uiv(this.addr,e),An(t,e)}}function Cv(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(wn(t,e))return;s.uniform4uiv(this.addr,e),An(t,e)}}function th(s){return s.version===0&&(s.compareFunction=Iu,s.needsUpdate=!0),s}function Pv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?r=th(Sm):r=bm,t.setTexture2D(e||r,i)}function Iv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||wm,i)}function Lv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_CUBE_SHADOW?r=th(Em):r=Am,t.setTextureCube(e||r,i)}function Dv(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Tm,i)}function Nv(s){switch(s){case 5126:return mv;case 35664:return gv;case 35665:return _v;case 35666:return yv;case 35674:return xv;case 35675:return vv;case 35676:return Mv;case 5124:case 35670:return bv;case 35667:case 35671:return Sv;case 35668:case 35672:return Ev;case 35669:case 35673:return Tv;case 5125:return wv;case 36294:return Av;case 36295:return Rv;case 36296:return Cv;case 35678:case 36198:case 36298:case 36306:case 35682:return Pv;case 35679:case 36299:case 36307:return Iv;case 35680:case 36300:case 36308:case 36293:return Lv;case 36289:case 36303:case 36311:case 36292:return Dv}}function Uv(s,e){s.uniform1fv(this.addr,e)}function Ov(s,e){let t=mo(e,this.size,2);s.uniform2fv(this.addr,t)}function Fv(s,e){let t=mo(e,this.size,3);s.uniform3fv(this.addr,t)}function Bv(s,e){let t=mo(e,this.size,4);s.uniform4fv(this.addr,t)}function kv(s,e){let t=mo(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function zv(s,e){let t=mo(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Hv(s,e){let t=mo(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Gv(s,e){s.uniform1iv(this.addr,e)}function Vv(s,e){s.uniform2iv(this.addr,e)}function Wv(s,e){s.uniform3iv(this.addr,e)}function Xv(s,e){s.uniform4iv(this.addr,e)}function qv(s,e){s.uniform1uiv(this.addr,e)}function Yv(s,e){s.uniform2uiv(this.addr,e)}function Kv(s,e){s.uniform3uiv(this.addr,e)}function Zv(s,e){s.uniform4uiv(this.addr,e)}function $v(s,e,t){let n=this.cache,i=e.length,r=eh(t,i);wn(n,r)||(s.uniform1iv(this.addr,r),An(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=th(Sm):o=bm;for(let a=0;a!==i;++a)t.setTexture2D(e[a]||o,r[a])}function Jv(s,e,t){let n=this.cache,i=e.length,r=eh(t,i);wn(n,r)||(s.uniform1iv(this.addr,r),An(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||wm,r[o])}function jv(s,e,t){let n=this.cache,i=e.length,r=eh(t,i);wn(n,r)||(s.uniform1iv(this.addr,r),An(n,r));let o;this.type===s.SAMPLER_CUBE_SHADOW?o=th(Em):o=Am;for(let a=0;a!==i;++a)t.setTextureCube(e[a]||o,r[a])}function Qv(s,e,t){let n=this.cache,i=e.length,r=eh(t,i);wn(n,r)||(s.uniform1iv(this.addr,r),An(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||Tm,r[o])}function eM(s){switch(s){case 5126:return Uv;case 35664:return Ov;case 35665:return Fv;case 35666:return Bv;case 35674:return kv;case 35675:return zv;case 35676:return Hv;case 5124:case 35670:return Gv;case 35667:case 35671:return Vv;case 35668:case 35672:return Wv;case 35669:case 35673:return Xv;case 5125:return qv;case 36294:return Yv;case 36295:return Kv;case 36296:return Zv;case 35678:case 36198:case 36298:case 36306:case 35682:return $v;case 35679:case 36299:case 36307:return Jv;case 35680:case 36300:case 36308:case 36293:return jv;case 36289:case 36303:case 36311:case 36292:return Qv}}var Xu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Nv(t.type)}},qu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=eM(t.type)}},Yu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(e,t[a.id],n)}}},Vu=/(\w+)(\])?(\[|\.)?/g;function om(s,e){s.seq.push(e),s.map[e.id]=e}function tM(s,e,t){let n=s.name,i=n.length;for(Vu.lastIndex=0;;){let r=Vu.exec(n),o=Vu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){om(t,c===void 0?new Xu(a,s,e):new qu(a,s,e));break}else{let f=t.map[a];f===void 0&&(f=new Yu(a),om(t,f)),t=f}}}var po=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);tM(a,l,this)}let i=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let o=e[i];o.id in t&&n.push(o)}return n}};function am(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var nM=37297,iM=0;function sM(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var lm=new yt;function rM(s){At._getMatrix(lm,At.workingColorSpace,s);let e=`mat3( ${lm.elements.map(t=>t.toFixed(4))} )`;switch(At.getTransfer(s)){case Wo:return[e,"LinearTransferOETF"];case Yt:return[e,"sRGBTransferOETF"];default:return ct("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function cm(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+sM(s.getShaderSource(e),a)}else return r}function oM(s,e){let t=rM(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var aM={[mu]:"Linear",[gu]:"Reinhard",[_u]:"Cineon",[Sa]:"ACESFilmic",[xu]:"AgX",[vu]:"Neutral",[yu]:"Custom"};function lM(s,e){let t=aM[e];return t===void 0?(ct("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Jc=new D;function cM(){At.getLuminanceCoefficients(Jc);let s=Jc.x.toFixed(4),e=Jc.y.toFixed(4),t=Jc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function hM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(La).join(`
`)}function uM(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function dM(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function La(s){return s!==""}function hm(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function um(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var fM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ku(s){return s.replace(fM,pM)}function pM(s,e){let t=wt[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return Ku(t)}var mM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function dm(s){return s.replace(mM,gM)}function gM(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function fm(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}var _M={[nr]:"SHADOWMAP_TYPE_PCF",[lo]:"SHADOWMAP_TYPE_VSM"};function yM(s){return _M[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var xM={[co]:"ENVMAP_MODE_REFRACTION"};function vM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":xM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var MM={[pu]:"ENVMAP_BLENDING_MULTIPLY",[Ep]:"ENVMAP_BLENDING_MIX",[Tp]:"ENVMAP_BLENDING_ADD"};function bM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":MM[s.combine]||"ENVMAP_BLENDING_NONE"}function SM(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=yM(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",d=vM(t),f=bM(t),h=hM(t),u=uM(r),g=i.createProgram(),_,p,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u].filter(La).join(`
`),_.length>0&&(_+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u].filter(La).join(`
`),p.length>0&&(p+=`
`)):(_=[fm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(La).join(`
`),p=[fm(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,u,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Fi?"#define TONE_MAPPING":"",t.toneMapping!==Fi?wt.tonemapping_pars_fragment:"",t.toneMapping!==Fi?lM("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",wt.colorspace_pars_fragment,oM("linearToOutputTexel",t.outputColorSpace),cM(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(La).join(`
`)),o=Ku(o),o=hm(o,t),o=um(o,t),a=Ku(a),a=hm(a,t),a=um(a,t),o=dm(o),a=dm(a),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,_=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,p=["#define varying in",t.glslVersion===Du?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Du?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let y=m+_+o,M=m+p+a,v=am(i,i.VERTEX_SHADER,y),C=am(i,i.FRAGMENT_SHADER,M);i.attachShader(g,v),i.attachShader(g,C),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function R(I){if(s.debug.checkShaderErrors){let H=i.getProgramInfoLog(g)||"",V=i.getShaderInfoLog(v)||"",G=i.getShaderInfoLog(C)||"",U=H.trim(),$=V.trim(),ne=G.trim(),Y=!0,ye=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(Y=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,g,v,C);else{let ie=cm(i,v,"vertex"),ge=cm(i,C,"fragment");pt("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+U+`
`+ie+`
`+ge)}else U!==""?ct("WebGLProgram: Program Info Log:",U):($===""||ne==="")&&(ye=!1);ye&&(I.diagnostics={runnable:Y,programLog:U,vertexShader:{log:$,prefix:_},fragmentShader:{log:ne,prefix:p}})}i.deleteShader(v),i.deleteShader(C),b=new po(i,g),w=dM(i,g)}let b;this.getUniforms=function(){return b===void 0&&R(this),b};let w;this.getAttributes=function(){return w===void 0&&R(this),w};let z=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return z===!1&&(z=i.getProgramParameter(g,nM)),z},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=iM++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=v,this.fragmentShader=C,this}var EM=0,Zu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new $u(e),t.set(e,n)),n}},$u=class{constructor(e){this.id=EM++,this.code=e,this.usedTimes=0}};function TM(s){return s===Rs||s===Ra||s===Ca}function wM(s,e,t,n,i,r){let o=new Wr,a=new Zu,l=new Set,c=[],d=new Map,f=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function u(b){return l.add(b),b===0?"uv":`uv${b}`}function g(b,w,z,I,H,V){let G=I.fog,U=H.geometry,$=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?I.environment:null,ne=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,Y=e.get(b.envMap||$,ne),ye=h[b.type],ie=n.precision;b.precision!==null&&(ie=n.getMaxPrecision(b.precision),ie!==b.precision&&ct("WebGLProgram.getParameters:",b.precision,"not supported, using",ie,"instead."));let ge=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Te=ge!==void 0?ge.length:0,De=0;U.morphAttributes.position!==void 0&&(De=1),U.morphAttributes.normal!==void 0&&(De=2),U.morphAttributes.color!==void 0&&(De=3);let rt,W,pe,we;if(ye){let He=ki[ye];rt=He.vertexShader,W=He.fragmentShader}else{rt=b.vertexShader,W=b.fragmentShader;let He=a.getVertexShaderStage(b),Ht=a.getFragmentShaderStage(b);a.update(b,He,Ht),pe=He.id,we=Ht.id}let Be=s.getRenderTarget(),Me=s.state.buffers.depth.getReversed(),_e=H.isInstancedMesh===!0,Ue=H.isBatchedMesh===!0,Se=!!b.map,Fe=!!b.matcap,tt=!!Y,Ye=tt&&Y.isPMREMTexture===!0,ht=!!b.aoMap,xt=!!b.lightMap,Dt=!!b.bumpMap&&b.wireframe===!1,lt=!!b.normalMap,Xt=!!b.displacementMap,ut=!!b.emissiveMap,zt=!!b.metalnessMap,un=!!b.roughnessMap,dn=b.anisotropy>0,J=b.clearcoat>0,dt=b.diffuseRoughness>0,Nt=b.dispersion>0,Lt=b.retroreflectivity>0,Oe=b.iridescence>0,Qt=b.sheen>0,it=b.transmission>0,ze=dn&&!!b.anisotropyMap,N=J&&!!b.clearcoatMap,A=J&&!!b.clearcoatNormalMap,se=J&&!!b.clearcoatRoughnessMap,Pe=dt&&!!b.diffuseRoughnessMap,he=Oe&&!!b.iridescenceMap,re=Oe&&!!b.iridescenceThicknessMap,Ce=Qt&&!!b.sheenColorMap,fe=Qt&&!!b.sheenRoughnessMap,me=!!b.specularMap,ve=!!b.specularColorMap,B=!!b.specularIntensityMap,be=it&&!!b.transmissionMap,ee=it&&!!b.thicknessMap,ue=!!b.gradientMap,j=!!b.alphaMap,oe=b.alphaTest>0,O=!!b.alphaHash,je=!!b.extensions,Ie=Fi;b.toneMapped&&(Be===null||Be.isXRRenderTarget===!0)&&(Ie=s.toneMapping);let st=Ye?Y.isCompressedCubeTexture?Y.image[0].mipmaps:Y.mipmaps:null,ft={shaderID:ye,shaderType:b.type,shaderName:b.name,vertexShader:rt,fragmentShader:W,defines:b.defines,customVertexShaderID:pe,customFragmentShaderID:we,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:ie,batching:Ue,batchingColor:Ue&&H._colorsTexture!==null,instancing:_e,instancingColor:_e&&H.instanceColor!==null,instancingMorph:_e&&H.morphTexture!==null,outputColorSpace:Be===null?s.outputColorSpace:Be.isXRRenderTarget===!0?Be.texture.colorSpace:At.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:Se,matcap:Fe,envMap:tt,envMapMode:tt&&Y.mapping,envMapPMREM:Ye,envMapMaxLod:Ye?st.length-1:null,envMapSize:Ye?st[0].width:null,aoMap:ht,lightMap:xt,bumpMap:Dt,normalMap:lt,displacementMap:Xt,emissiveMap:ut,normalMapObjectSpace:lt&&b.normalMapType===Ip,normalMapTangentSpace:lt&&b.normalMapType===Kc,packedNormalMap:lt&&b.normalMapType===Kc&&TM(b.normalMap.format),metalnessMap:zt,roughnessMap:un,anisotropy:dn,anisotropyMap:ze,clearcoat:J,clearcoatMap:N,clearcoatNormalMap:A,clearcoatRoughnessMap:se,diffuseRoughness:dt,diffuseRoughnessMap:Pe,dispersion:Nt,retroreflection:Lt,iridescence:Oe,iridescenceMap:he,iridescenceThicknessMap:re,sheen:Qt,sheenColorMap:Ce,sheenRoughnessMap:fe,specularMap:me,specularColorMap:ve,specularIntensityMap:B,transmission:it,transmissionMap:be,thicknessMap:ee,gradientMap:ue,opaque:b.transparent===!1&&b.blending===As&&b.alphaToCoverage===!1,alphaMap:j,alphaTest:oe,alphaHash:O,combine:b.combine,mapUv:Se&&u(b.map.channel),aoMapUv:ht&&u(b.aoMap.channel),lightMapUv:xt&&u(b.lightMap.channel),bumpMapUv:Dt&&u(b.bumpMap.channel),normalMapUv:lt&&u(b.normalMap.channel),displacementMapUv:Xt&&u(b.displacementMap.channel),emissiveMapUv:ut&&u(b.emissiveMap.channel),metalnessMapUv:zt&&u(b.metalnessMap.channel),roughnessMapUv:un&&u(b.roughnessMap.channel),anisotropyMapUv:ze&&u(b.anisotropyMap.channel),clearcoatMapUv:N&&u(b.clearcoatMap.channel),clearcoatNormalMapUv:A&&u(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:se&&u(b.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Pe&&u(b.diffuseRoughnessMap.channel),iridescenceMapUv:he&&u(b.iridescenceMap.channel),iridescenceThicknessMapUv:re&&u(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&u(b.sheenColorMap.channel),sheenRoughnessMapUv:fe&&u(b.sheenRoughnessMap.channel),specularMapUv:me&&u(b.specularMap.channel),specularColorMapUv:ve&&u(b.specularColorMap.channel),specularIntensityMapUv:B&&u(b.specularIntensityMap.channel),transmissionMapUv:be&&u(b.transmissionMap.channel),thicknessMapUv:ee&&u(b.thicknessMap.channel),alphaMapUv:j&&u(b.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(lt||dn),vertexNormals:!!U.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!U.attributes.uv&&(Se||j),fog:!!G,useFog:b.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||U.attributes.normal===void 0&&lt===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Me,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Te,morphTextureStride:De,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:V.filter(He=>He.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&z.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ie,decodeVideoTexture:Se&&b.map.isVideoTexture===!0&&At.getTransfer(b.map.colorSpace)===Yt,decodeVideoTextureEmissive:ut&&b.emissiveMap.isVideoTexture===!0&&At.getTransfer(b.emissiveMap.colorSpace)===Yt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Dn,flipSided:b.side===Yn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:je&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(je&&b.extensions.multiDraw===!0||Ue)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ft.vertexUv1s=l.has(1),ft.vertexUv2s=l.has(2),ft.vertexUv3s=l.has(3),l.clear(),ft}function _(b){let w=[];if(b.shaderID?w.push(b.shaderID):(w.push(b.customVertexShaderID),w.push(b.customFragmentShaderID)),b.defines!==void 0)for(let z in b.defines)w.push(z),w.push(b.defines[z]);return b.isRawShaderMaterial===!1&&(p(w,b),m(w,b),w.push(s.outputColorSpace)),w.push(b.customProgramCacheKey),w.join()}function p(b,w){b.push(w.precision),b.push(w.outputColorSpace),b.push(w.envMapMode),b.push(w.envMapPMREM),b.push(w.envMapMaxLod),b.push(w.envMapSize),b.push(w.mapUv),b.push(w.alphaMapUv),b.push(w.lightMapUv),b.push(w.aoMapUv),b.push(w.bumpMapUv),b.push(w.normalMapUv),b.push(w.displacementMapUv),b.push(w.emissiveMapUv),b.push(w.metalnessMapUv),b.push(w.roughnessMapUv),b.push(w.anisotropyMapUv),b.push(w.clearcoatMapUv),b.push(w.clearcoatNormalMapUv),b.push(w.clearcoatRoughnessMapUv),b.push(w.diffuseRoughnessMapUv),b.push(w.iridescenceMapUv),b.push(w.iridescenceThicknessMapUv),b.push(w.sheenColorMapUv),b.push(w.sheenRoughnessMapUv),b.push(w.specularMapUv),b.push(w.specularColorMapUv),b.push(w.specularIntensityMapUv),b.push(w.transmissionMapUv),b.push(w.thicknessMapUv),b.push(w.combine),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.morphTargetsCount),b.push(w.numSunLights),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numSpotLightMaps),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numSunLightShadows),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.numSpotLightShadowsWithMaps),b.push(w.numLightProbes),b.push(w.numLightProbeGrids),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.depthPacking)}function m(b,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.diffuseRoughness&&o.enable(25),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),b.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),b.push(o.mask)}function y(b){let w=h[b.type],z;if(w){let I=ki[w];z=Kp.clone(I.uniforms)}else z=b.uniforms;return z}function M(b,w){let z=d.get(w);return z!==void 0?++z.usedTimes:(z=new SM(s,w,b,i),c.push(z),d.set(w,z)),z}function v(b){if(--b.usedTimes===0){let w=c.indexOf(b);c[w]=c[c.length-1],c.pop(),d.delete(b.cacheKey),b.destroy()}}function C(b){a.remove(b)}function R(){a.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:y,acquireProgram:M,releaseProgram:v,releaseShaderCache:C,programs:c,dispose:R}}function AM(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function RM(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function pm(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function mm(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(h){let u=0;return h.isInstancedMesh&&(u+=2),h.isSkinnedMesh&&(u+=1),u}function a(h,u,g,_,p,m){let y=s[e];return y===void 0?(y={id:h.id,object:h,geometry:u,material:g,materialVariant:o(h),groupOrder:_,renderOrder:h.renderOrder,z:p,group:m},s[e]=y):(y.id=h.id,y.object=h,y.geometry=u,y.material=g,y.materialVariant=o(h),y.groupOrder=_,y.renderOrder=h.renderOrder,y.z=p,y.group=m),e++,y}function l(h,u,g,_,p,m,y){y.reversedDepth===!0&&(p=-p);let M=a(h,u,g,_,p,m);g.transmission>0?n.push(M):g.transparent===!0?i.push(M):t.push(M)}function c(h,u,g,_,p,m){let y=a(h,u,g,_,p,m);g.transmission>0?n.unshift(y):g.transparent===!0?i.unshift(y):t.unshift(y)}function d(h,u){t.length>1&&t.sort(h||RM),n.length>1&&n.sort(u||pm),i.length>1&&i.sort(u||pm)}function f(){for(let h=e,u=s.length;h<u;h++){let g=s[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:f,sort:d}}function CM(){let s=new WeakMap;function e(n,i){let r=s.get(n),o;return r===void 0?(o=new mm,s.set(n,[o])):i>=r.length?(o=new mm,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function PM(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new at};break;case"SpotLight":t={position:new D,direction:new D,color:new at,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new at,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new at,groundColor:new at};break;case"RectAreaLight":t={color:new at,position:new D,halfWidth:new D,halfHeight:new D};break}return s[e.id]=t,t}}}function IM(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var LM=0;function DM(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function NM(s){let e=new PM,t=IM(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);let i=new D,r=new mt,o=new mt;function a(c){let d=0,f=0,h=0;for(let V=0;V<9;V++)n.probe[V].set(0,0,0);let u=0,g=0,_=0,p=0,m=0,y=0,M=0,v=0,C=0,R=0,b=0,w=0,z=0,I=0;c.sort(DM);for(let V=0,G=c.length;V<G;V++){let U=c[V],$=U.color,ne=U.intensity,Y=U.distance,ye=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Rs?ye=U.shadow.map.texture:ye=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)d+=$.r*ne,f+=$.g*ne,h+=$.b*ne;else if(U.isLightProbe){for(let ie=0;ie<9;ie++)n.probe[ie].addScaledVector(U.sh.coefficients[ie],ne);I++}else if(U.isSunLight){let ie=e.get(U);if(ie.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let ge=U.shadow,Te=t.get(U);Te.shadowIntensity=ge.intensity,Te.shadowBias=ge.bias,Te.shadowNormalBias=ge.normalBias,Te.shadowRadius=ge.radius,Te.shadowMapSize.copy(ge.mapSize).multiply(ge.getFrameExtents()),n.sunShadow[g]=Te,n.sunShadowMap[g]=ye;let De=ge.getViewportCount();for(let rt=0;rt<De;rt++)n.sunShadowMatrix[_+rt]=ge.getMatrix(rt),n.sunShadowCascade[_+rt]=ge._cascadeData[rt];_+=De,g++}n.sun[u]=ie,u++}else if(U.isDirectionalLight){let ie=e.get(U);if(ie.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let ge=U.shadow,Te=t.get(U);Te.shadowIntensity=ge.intensity,Te.shadowBias=ge.bias,Te.shadowNormalBias=ge.normalBias,Te.shadowRadius=ge.radius,Te.shadowMapSize=ge.mapSize,n.directionalShadow[p]=Te,n.directionalShadowMap[p]=ye,n.directionalShadowMatrix[p]=U.shadow.matrix,C++}n.directional[p]=ie,p++}else if(U.isSpotLight){let ie=e.get(U);ie.position.setFromMatrixPosition(U.matrixWorld),ie.color.copy($).multiplyScalar(ne),ie.distance=Y,ie.coneCos=Math.cos(U.angle),ie.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),ie.decay=U.decay,n.spot[y]=ie;let ge=U.shadow;if(U.map&&(n.spotLightMap[w]=U.map,w++,ge.updateMatrices(U),U.castShadow&&z++),n.spotLightMatrix[y]=ge.matrix,U.castShadow){let Te=t.get(U);Te.shadowIntensity=ge.intensity,Te.shadowBias=ge.bias,Te.shadowNormalBias=ge.normalBias,Te.shadowRadius=ge.radius,Te.shadowMapSize=ge.mapSize,n.spotShadow[y]=Te,n.spotShadowMap[y]=ye,b++}y++}else if(U.isRectAreaLight){let ie=e.get(U);ie.color.copy($).multiplyScalar(ne),ie.halfWidth.set(U.width*.5,0,0),ie.halfHeight.set(0,U.height*.5,0),n.rectArea[M]=ie,M++}else if(U.isPointLight){let ie=e.get(U);if(ie.color.copy(U.color).multiplyScalar(U.intensity),ie.distance=U.distance,ie.decay=U.decay,U.castShadow){let ge=U.shadow,Te=t.get(U);Te.shadowIntensity=ge.intensity,Te.shadowBias=ge.bias,Te.shadowNormalBias=ge.normalBias,Te.shadowRadius=ge.radius,Te.shadowMapSize=ge.mapSize,Te.shadowCameraNear=ge.camera.near,Te.shadowCameraFar=ge.camera.far,n.pointShadow[m]=Te,n.pointShadowMap[m]=ye,n.pointShadowMatrix[m]=U.shadow.matrix,R++}n.point[m]=ie,m++}else if(U.isHemisphereLight){let ie=e.get(U);ie.skyColor.copy(U.color).multiplyScalar(ne),ie.groundColor.copy(U.groundColor).multiplyScalar(ne),n.hemi[v]=ie,v++}}M>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=qe.LTC_FLOAT_1,n.rectAreaLTC2=qe.LTC_FLOAT_2):(n.rectAreaLTC1=qe.LTC_HALF_1,n.rectAreaLTC2=qe.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=f,n.ambient[2]=h;let H=n.hash;(H.sunLength!==u||H.directionalLength!==p||H.pointLength!==m||H.spotLength!==y||H.rectAreaLength!==M||H.hemiLength!==v||H.numSunShadows!==g||H.numDirectionalShadows!==C||H.numPointShadows!==R||H.numSpotShadows!==b||H.numSpotMaps!==w||H.numLightProbes!==I)&&(n.sun.length=u,n.directional.length=p,n.spot.length=y,n.rectArea.length=M,n.point.length=m,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.directionalShadowMatrix.length=C,n.pointShadow.length=R,n.pointShadowMap.length=R,n.pointShadowMatrix.length=R,n.spotShadow.length=b,n.spotShadowMap.length=b,n.spotLightMatrix.length=b+w-z,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=z,n.numLightProbes=I,H.sunLength=u,H.directionalLength=p,H.pointLength=m,H.spotLength=y,H.rectAreaLength=M,H.hemiLength=v,H.numSunShadows=g,H.numDirectionalShadows=C,H.numPointShadows=R,H.numSpotShadows=b,H.numSpotMaps=w,H.numLightProbes=I,n.version=LM++)}function l(c,d){let f=0,h=0,u=0,g=0,_=0,p=0,m=d.matrixWorldInverse;for(let y=0,M=c.length;y<M;y++){let v=c[y];if(v.isSunLight){let C=n.sun[f];C.direction.setFromMatrixPosition(v.matrixWorld),C.direction.transformDirection(m),f++}else if(v.isDirectionalLight){let C=n.directional[h];C.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),C.direction.sub(i),C.direction.transformDirection(m),h++}else if(v.isSpotLight){let C=n.spot[g];C.position.setFromMatrixPosition(v.matrixWorld),C.position.applyMatrix4(m),C.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),C.direction.sub(i),C.direction.transformDirection(m),g++}else if(v.isRectAreaLight){let C=n.rectArea[_];C.position.setFromMatrixPosition(v.matrixWorld),C.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),C.halfWidth.set(v.width*.5,0,0),C.halfHeight.set(0,v.height*.5,0),C.halfWidth.applyMatrix4(o),C.halfHeight.applyMatrix4(o),_++}else if(v.isPointLight){let C=n.point[u];C.position.setFromMatrixPosition(v.matrixWorld),C.position.applyMatrix4(m),u++}else if(v.isHemisphereLight){let C=n.hemi[p];C.direction.setFromMatrixPosition(v.matrixWorld),C.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:n}}function gm(s){let e=new NM(s),t=[],n=[],i=[];function r(f){d.camera=f,t.length=0,n.length=0,i.length=0}function o(f){f.isLightProbeGrid?i.push(f):t.push(f)}function a(f){n.push(f)}function l(){e.setup(t),i.sort((f,h)=>f.priority-h.priority||f.id-h.id)}function c(f){e.setupView(t,f)}let d={lightsArray:t,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function UM(s){let e=new WeakMap;function t(i,r=0){let o=e.get(i),a;return o===void 0?(a=new gm(s),e.set(i,[a])):r>=o.length?(a=new gm(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var OM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,FM=`uniform sampler2D shadow_pass;
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
}`,BM=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],kM=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],_m=new mt,Ia=new D,Wu=new D;function zM(s,e,t){let n=new vs,i=new Ee,r=new Ee,o=new Zt,a=new $l,l=new Jl,c={},d=t.maxTextureSize,f={[Oi]:Yn,[Yn]:Oi,[Dn]:Dn},h=new Di({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:OM,fragmentShader:FM}),u=h.clone();u.defines.HORIZONTAL_PASS=1;let g=new on;g.setAttribute("position",new Nn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new tn(g,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=nr;let m=this.type;this.render=function(R,b,w){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||R.length===0)return;this.type===rp&&(ct("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=nr);let z=s.getRenderTarget(),I=s.getActiveCubeFace(),H=s.getActiveMipmapLevel(),V=s.state;V.setBlending(ir),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let G=m!==this.type;G&&b.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach($=>$.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,$=R.length;U<$;U++){let ne=R[U],Y=ne.shadow;if(Y===void 0){ct("WebGLShadowMap:",ne,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;i.copy(Y.mapSize);let ye=Y.getFrameExtents();i.multiply(ye),r.copy(Y.mapSize),(i.x>d||i.y>d)&&(i.x>d&&(r.x=Math.floor(d/ye.x),i.x=r.x*ye.x,Y.mapSize.x=r.x),i.y>d&&(r.y=Math.floor(d/ye.y),i.y=r.y*ye.y,Y.mapSize.y=r.y));let ie=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=ie,Y.map===null||G===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===lo){if(ne.isPointLight){ct("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new si(i.x,i.y,{format:Rs,type:Ti,minFilter:Tn,magFilter:Tn,generateMipmaps:!1}),Y.map.texture.name=ne.name+".shadowMap",Y.map.depthTexture=new ts(i.x,i.y,oi),Y.map.depthTexture.name=ne.name+".shadowMapDepth",Y.map.depthTexture.format=Ji,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=yn,Y.map.depthTexture.magFilter=yn}else ne.isPointLight?(Y.map=new Da(i.x),Y.map.depthTexture=new ia(i.x,Ei)):(Y.map=new si(i.x,i.y),Y.map.depthTexture=new ts(i.x,i.y,Ei)),Y.map.depthTexture.name=ne.name+".shadowMap",Y.map.depthTexture.format=Ji,this.type===nr?(Y.map.depthTexture.compareFunction=ie?Pu:Cu,Y.map.depthTexture.minFilter=Tn,Y.map.depthTexture.magFilter=Tn):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=yn,Y.map.depthTexture.magFilter=yn);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==i.x||Y.map.height!==i.y)&&Y.map.setSize(i.x,i.y);let ge=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();ne.isPointLight!==!0&&Y.updateMatrices(ne,w);let Te=(Y.camera.layers.mask&4294967294)!==0?Y.camera.layers:w.layers;for(let De=0;De<ge;De++){let rt=Y.getCamera(De);if(ne.isPointLight){let W=Y.camera,pe=Y.matrix,we=ne.distance||W.far;we!==W.far&&(W.far=we,W.updateProjectionMatrix()),Ia.setFromMatrixPosition(ne.matrixWorld),W.position.copy(Ia),Wu.copy(W.position),Wu.add(BM[De]),W.up.copy(kM[De]),W.lookAt(Wu),W.updateMatrixWorld(),pe.makeTranslation(-Ia.x,-Ia.y,-Ia.z),_m.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(_m,W.coordinateSystem,W.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,De),s.clear();else{De===0&&(s.setRenderTarget(Y.map),s.clear());let W=Y.getViewport(De);o.set(r.x*W.x,r.y*W.y,r.x*W.z,r.y*W.w),V.viewport(o)}n=Y.getFrustum(De),v(b,w,rt,ne,Te,this.type)}Y.isPointLightShadow!==!0&&this.type===lo&&y(Y,w),Y.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(z,I,H)};function y(R,b){let w=e.update(_);h.defines.VSM_SAMPLES!==R.blurSamples&&(h.defines.VSM_SAMPLES=R.blurSamples,u.defines.VSM_SAMPLES=R.blurSamples,h.needsUpdate=!0,u.needsUpdate=!0),R.mapPass===null?R.mapPass=new si(i.x,i.y,{format:Rs,type:Ti}):(R.mapPass.width!==R.map.width||R.mapPass.height!==R.map.height)&&R.mapPass.setSize(R.map.width,R.map.height),h.uniforms.shadow_pass.value=R.map.depthTexture,h.uniforms.resolution.value.set(R.map.width,R.map.height),h.uniforms.radius.value=R.radius,s.setRenderTarget(R.mapPass),s.clear(),s.renderBufferDirect(b,null,w,h,_,null),u.uniforms.shadow_pass.value=R.mapPass.texture,u.uniforms.resolution.value.set(R.map.width,R.map.height),u.uniforms.radius.value=R.radius,s.setRenderTarget(R.map),s.clear(),s.renderBufferDirect(b,null,w,u,_,null)}function M(R,b,w,z){let I=null,H=w.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(H!==void 0)I=H;else if(I=w.isPointLight===!0?l:a,s.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let V=I.uuid,G=b.uuid,U=c[V];U===void 0&&(U={},c[V]=U);let $=U[G];$===void 0&&($=I.clone(),U[G]=$,b.addEventListener("dispose",C)),I=$}if(I.visible=b.visible,I.wireframe=b.wireframe,z===lo?I.side=b.shadowSide!==null?b.shadowSide:b.side:I.side=b.shadowSide!==null?b.shadowSide:f[b.side],I.alphaMap=b.alphaMap,I.alphaTest=b.alphaToCoverage===!0?.5:b.alphaTest,I.map=b.map,I.clipShadows=b.clipShadows,I.clippingPlanes=b.clippingPlanes,I.clipIntersection=b.clipIntersection,I.displacementMap=b.displacementMap,I.displacementScale=b.displacementScale,I.displacementBias=b.displacementBias,I.wireframeLinewidth=b.wireframeLinewidth,I.linewidth=b.linewidth,w.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let V=s.properties.get(I);V.light=w}return I}function v(R,b,w,z,I,H){if(R.visible===!1)return;if(R.layers.test(I)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&H===lo)&&(!R.frustumCulled||R.intersectsFrustum(n))){R.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,R.matrixWorld);let U=e.update(R),$=R.material;if(Array.isArray($)){let ne=U.groups;for(let Y=0,ye=ne.length;Y<ye;Y++){let ie=ne[Y],ge=$[ie.materialIndex];if(ge&&ge.visible){let Te=M(R,ge,z,H);R.onBeforeShadow(s,R,b,w,U,Te,ie),s.renderBufferDirect(w,null,U,Te,R,ie),R.onAfterShadow(s,R,b,w,U,Te,ie)}}}else if($.visible){let ne=M(R,$,z,H);R.onBeforeShadow(s,R,b,w,U,ne,null),s.renderBufferDirect(w,null,U,ne,R,null),R.onAfterShadow(s,R,b,w,U,ne,null)}}let G=R.children;for(let U=0,$=G.length;U<$;U++)v(G[U],b,w,z,I,H)}function C(R){R.target.removeEventListener("dispose",C);for(let w in c){let z=c[w],I=R.target.uuid;I in z&&(z[I].dispose(),delete z[I])}}}function HM(s,e){function t(){let B=!1,be=new Zt,ee=null,ue=new Zt(0,0,0,0);return{setMask:function(j){ee!==j&&!B&&(s.colorMask(j,j,j,j),ee=j)},setLocked:function(j){B=j},setClear:function(j,oe,O,je,Ie){Ie===!0&&(j*=je,oe*=je,O*=je),be.set(j,oe,O,je),ue.equals(be)===!1&&(s.clearColor(j,oe,O,je),ue.copy(be))},reset:function(){B=!1,ee=null,ue.set(-1,0,0,0)}}}function n(){let B=!1,be=!1,ee=null,ue=null,j=null;return{setReversed:function(oe){if(be!==oe){let O=e.get("EXT_clip_control");oe?O.clipControlEXT(O.LOWER_LEFT_EXT,O.ZERO_TO_ONE_EXT):O.clipControlEXT(O.LOWER_LEFT_EXT,O.NEGATIVE_ONE_TO_ONE_EXT),be=oe;let je=j;j=null,this.setClear(je)}},getReversed:function(){return be},setTest:function(oe){oe?Me(s.DEPTH_TEST):_e(s.DEPTH_TEST)},setMask:function(oe){ee!==oe&&!B&&(s.depthMask(oe),ee=oe)},setFunc:function(oe){if(be&&(oe=Hp[oe]),ue!==oe){switch(oe){case Ll:s.depthFunc(s.NEVER);break;case Dl:s.depthFunc(s.ALWAYS);break;case Nl:s.depthFunc(s.LESS);break;case Br:s.depthFunc(s.LEQUAL);break;case Ul:s.depthFunc(s.EQUAL);break;case Ol:s.depthFunc(s.GEQUAL);break;case Fl:s.depthFunc(s.GREATER);break;case Bl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ue=oe}},setLocked:function(oe){B=oe},setClear:function(oe){j!==oe&&(j=oe,be&&(oe=1-oe),s.clearDepth(oe))},reset:function(){B=!1,ee=null,ue=null,j=null,be=!1}}}function i(){let B=!1,be=null,ee=null,ue=null,j=null,oe=null,O=null,je=null,Ie=null;return{setTest:function(st){B||(st?Me(s.STENCIL_TEST):_e(s.STENCIL_TEST))},setMask:function(st){be!==st&&!B&&(s.stencilMask(st),be=st)},setFunc:function(st,ft,He){(ee!==st||ue!==ft||j!==He)&&(s.stencilFunc(st,ft,He),ee=st,ue=ft,j=He)},setOp:function(st,ft,He){(oe!==st||O!==ft||je!==He)&&(s.stencilOp(st,ft,He),oe=st,O=ft,je=He)},setLocked:function(st){B=st},setClear:function(st){Ie!==st&&(s.clearStencil(st),Ie=st)},reset:function(){B=!1,be=null,ee=null,ue=null,j=null,oe=null,O=null,je=null,Ie=null}}}let r=new t,o=new n,a=new i,l={},c=new WeakMap,d={},f={},h={},u=new WeakMap,g=[],_=null,p=!1,m=null,y=null,M=null,v=null,C=null,R=null,b=null,w=new at(0,0,0),z=0,I=!1,H=null,V=null,G=null,U=null,$=null,ne=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,ye=0,ie=s.getParameter(s.VERSION);ie.indexOf("WebGL")!==-1?(ye=parseFloat(/^WebGL (\d)/.exec(ie)[1]),Y=ye>=1):ie.indexOf("OpenGL ES")!==-1&&(ye=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),Y=ye>=2);let ge=null,Te={},De=s.getParameter(s.SCISSOR_BOX),rt=s.getParameter(s.VIEWPORT),W=new Zt().fromArray(De),pe=new Zt().fromArray(rt);function we(B,be,ee,ue){let j=new Uint8Array(4),oe=s.createTexture();s.bindTexture(B,oe),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let O=0;O<ee;O++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(be,0,s.RGBA,1,1,ue,0,s.RGBA,s.UNSIGNED_BYTE,j):s.texImage2D(be+O,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,j);return oe}let Be={};Be[s.TEXTURE_2D]=we(s.TEXTURE_2D,s.TEXTURE_2D,1),Be[s.TEXTURE_CUBE_MAP]=we(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Be[s.TEXTURE_2D_ARRAY]=we(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Be[s.TEXTURE_3D]=we(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Me(s.DEPTH_TEST),o.setFunc(Br),Dt(!1),lt(cu),Me(s.CULL_FACE),ht(ir);function Me(B){d[B]!==!0&&(s.enable(B),d[B]=!0)}function _e(B){d[B]!==!1&&(s.disable(B),d[B]=!1)}function Ue(B,be){return h[B]!==be?(s.bindFramebuffer(B,be),h[B]=be,B===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=be),B===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=be),!0):!1}function Se(B,be){let ee=g,ue=!1;if(B){ee=u.get(be),ee===void 0&&(ee=[],u.set(be,ee));let j=B.textures;if(ee.length!==j.length||ee[0]!==s.COLOR_ATTACHMENT0){for(let oe=0,O=j.length;oe<O;oe++)ee[oe]=s.COLOR_ATTACHMENT0+oe;ee.length=j.length,ue=!0}}else ee[0]!==s.BACK&&(ee[0]=s.BACK,ue=!0);ue&&s.drawBuffers(ee)}function Fe(B){return _!==B?(s.useProgram(B),_=B,!0):!1}let tt={[rr]:s.FUNC_ADD,[ap]:s.FUNC_SUBTRACT,[lp]:s.FUNC_REVERSE_SUBTRACT};tt[cp]=s.MIN,tt[hp]=s.MAX;let Ye={[up]:s.ZERO,[dp]:s.ONE,[fp]:s.SRC_COLOR,[du]:s.SRC_ALPHA,[xp]:s.SRC_ALPHA_SATURATE,[_p]:s.DST_COLOR,[mp]:s.DST_ALPHA,[pp]:s.ONE_MINUS_SRC_COLOR,[fu]:s.ONE_MINUS_SRC_ALPHA,[yp]:s.ONE_MINUS_DST_COLOR,[gp]:s.ONE_MINUS_DST_ALPHA,[vp]:s.CONSTANT_COLOR,[Mp]:s.ONE_MINUS_CONSTANT_COLOR,[bp]:s.CONSTANT_ALPHA,[Sp]:s.ONE_MINUS_CONSTANT_ALPHA};function ht(B,be,ee,ue,j,oe,O,je,Ie,st){if(B===ir){p===!0&&(_e(s.BLEND),p=!1);return}if(p===!1&&(Me(s.BLEND),p=!0),B!==op){if(B!==m||st!==I){if((y!==rr||C!==rr)&&(s.blendEquation(s.FUNC_ADD),y=rr,C=rr),st)switch(B){case As:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case sr:s.blendFunc(s.ONE,s.ONE);break;case hu:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case uu:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:pt("WebGLState: Invalid blending: ",B);break}else switch(B){case As:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case sr:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case hu:pt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case uu:pt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:pt("WebGLState: Invalid blending: ",B);break}M=null,v=null,R=null,b=null,w.set(0,0,0),z=0,m=B,I=st}return}j=j||be,oe=oe||ee,O=O||ue,(be!==y||j!==C)&&(s.blendEquationSeparate(tt[be],tt[j]),y=be,C=j),(ee!==M||ue!==v||oe!==R||O!==b)&&(s.blendFuncSeparate(Ye[ee],Ye[ue],Ye[oe],Ye[O]),M=ee,v=ue,R=oe,b=O),(je.equals(w)===!1||Ie!==z)&&(s.blendColor(je.r,je.g,je.b,Ie),w.copy(je),z=Ie),m=B,I=!1}function xt(B,be){B.side===Dn?_e(s.CULL_FACE):Me(s.CULL_FACE);let ee=B.side===Yn;be&&(ee=!ee),Dt(ee),B.blending===As&&B.transparent===!1?ht(ir):ht(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);let ue=B.stencilWrite;a.setTest(ue),ue&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),ut(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?Me(s.SAMPLE_ALPHA_TO_COVERAGE):_e(s.SAMPLE_ALPHA_TO_COVERAGE)}function Dt(B){H!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),H=B)}function lt(B){B!==ip?(Me(s.CULL_FACE),B!==V&&(B===cu?s.cullFace(s.BACK):B===sp?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):_e(s.CULL_FACE),V=B}function Xt(B){B!==G&&(Y&&s.lineWidth(B),G=B)}function ut(B,be,ee){B?(Me(s.POLYGON_OFFSET_FILL),(U!==be||$!==ee)&&(U=be,$=ee,o.getReversed()&&(be=-be,ee=-ee),s.polygonOffset(be,ee))):_e(s.POLYGON_OFFSET_FILL)}function zt(B){B?Me(s.SCISSOR_TEST):_e(s.SCISSOR_TEST)}function un(B){B===void 0&&(B=s.TEXTURE0+ne-1),ge!==B&&(s.activeTexture(B),ge=B)}function dn(B,be,ee){ee===void 0&&(ge===null?ee=s.TEXTURE0+ne-1:ee=ge);let ue=Te[ee];ue===void 0&&(ue={type:void 0,texture:void 0},Te[ee]=ue),(ue.type!==B||ue.texture!==be)&&(ge!==ee&&(s.activeTexture(ee),ge=ee),s.bindTexture(B,be||Be[B]),ue.type=B,ue.texture=be)}function J(){let B=Te[ge];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function dt(){try{s.compressedTexImage2D(...arguments)}catch(B){pt("WebGLState:",B)}}function Nt(){try{s.compressedTexImage3D(...arguments)}catch(B){pt("WebGLState:",B)}}function Lt(){try{s.texSubImage2D(...arguments)}catch(B){pt("WebGLState:",B)}}function Oe(){try{s.texSubImage3D(...arguments)}catch(B){pt("WebGLState:",B)}}function Qt(){try{s.compressedTexSubImage2D(...arguments)}catch(B){pt("WebGLState:",B)}}function it(){try{s.compressedTexSubImage3D(...arguments)}catch(B){pt("WebGLState:",B)}}function ze(){try{s.texStorage2D(...arguments)}catch(B){pt("WebGLState:",B)}}function N(){try{s.texStorage3D(...arguments)}catch(B){pt("WebGLState:",B)}}function A(){try{s.texImage2D(...arguments)}catch(B){pt("WebGLState:",B)}}function se(){try{s.texImage3D(...arguments)}catch(B){pt("WebGLState:",B)}}function Pe(B){return f[B]!==void 0?f[B]:s.getParameter(B)}function he(B,be){f[B]!==be&&(s.pixelStorei(B,be),f[B]=be)}function re(B){W.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),W.copy(B))}function Ce(B){pe.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),pe.copy(B))}function fe(B,be){let ee=c.get(be);ee===void 0&&(ee=new WeakMap,c.set(be,ee));let ue=ee.get(B);ue===void 0&&(ue=s.getUniformBlockIndex(be,B.name),s.uniformBlockBinding(be,ue,ue),ee.set(B,ue))}function me(B,be,ee){let j=c.get(be).get(B);l[j]!==ee&&(s.bindBufferBase(s.UNIFORM_BUFFER,j,ee),l[j]=ee)}function ve(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),d={},f={},ge=null,Te={},h={},l={},u=new WeakMap,g=[],_=null,p=!1,m=null,y=null,M=null,v=null,C=null,R=null,b=null,w=new at(0,0,0),z=0,I=!1,H=null,V=null,G=null,U=null,$=null,W.set(0,0,s.canvas.width,s.canvas.height),pe.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Me,disable:_e,bindFramebuffer:Ue,drawBuffers:Se,useProgram:Fe,setBlending:ht,setMaterial:xt,setFlipSided:Dt,setCullFace:lt,setLineWidth:Xt,setPolygonOffset:ut,setScissorTest:zt,activeTexture:un,bindTexture:dn,unbindTexture:J,compressedTexImage2D:dt,compressedTexImage3D:Nt,texImage2D:A,texImage3D:se,pixelStorei:he,getParameter:Pe,updateUBOMapping:fe,uniformBlockBinding:me,texStorage2D:ze,texStorage3D:N,texSubImage2D:Lt,texSubImage3D:Oe,compressedTexSubImage2D:Qt,compressedTexSubImage3D:it,scissor:re,viewport:Ce,reset:ve}}function GM(s,e,t,n,i,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ee,d=new WeakMap,f=new Set,h,u=new WeakMap,g=new Set,_=new FinalizationRegistry(N=>g.delete(N)),p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(N,A){return p?new OffscreenCanvas(N,A):Hr("canvas")}function y(N,A,se){let Pe=1,he=ze(N);if((he.width>se||he.height>se)&&(Pe=se/Math.max(he.width,he.height)),Pe<1)if(typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&N instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&N instanceof ImageBitmap||typeof VideoFrame<"u"&&N instanceof VideoFrame){let re=Math.floor(Pe*he.width),Ce=Math.floor(Pe*he.height);h===void 0&&(h=m(re,Ce));let fe=A?m(re,Ce):h;return fe.width=re,fe.height=Ce,fe.getContext("2d").drawImage(N,0,0,re,Ce),ct("WebGLRenderer: Texture has been resized from ("+he.width+"x"+he.height+") to ("+re+"x"+Ce+")."),fe}else return"data"in N&&ct("WebGLRenderer: Image in DataTexture is too big ("+he.width+"x"+he.height+")."),N;return N}function M(N){return N.generateMipmaps}function v(N){s.generateMipmap(N)}function C(N){return N.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:N.isWebGL3DRenderTarget?s.TEXTURE_3D:N.isWebGLArrayRenderTarget||N.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function R(N,A,se,Pe,he,re=!1){if(N!==null){if(s[N]!==void 0)return s[N];ct("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+N+"'")}let Ce;Pe&&(Ce=e.get("EXT_texture_norm16"),Ce||ct("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let fe=A;if(A===s.RED&&(se===s.FLOAT&&(fe=s.R32F),se===s.HALF_FLOAT&&(fe=s.R16F),se===s.UNSIGNED_BYTE&&(fe=s.R8),se===s.UNSIGNED_SHORT&&Ce&&(fe=Ce.R16_EXT),se===s.SHORT&&Ce&&(fe=Ce.R16_SNORM_EXT)),A===s.RED_INTEGER&&(se===s.UNSIGNED_BYTE&&(fe=s.R8UI),se===s.UNSIGNED_SHORT&&(fe=s.R16UI),se===s.UNSIGNED_INT&&(fe=s.R32UI),se===s.BYTE&&(fe=s.R8I),se===s.SHORT&&(fe=s.R16I),se===s.INT&&(fe=s.R32I)),A===s.RG&&(se===s.FLOAT&&(fe=s.RG32F),se===s.HALF_FLOAT&&(fe=s.RG16F),se===s.UNSIGNED_BYTE&&(fe=s.RG8),se===s.UNSIGNED_SHORT&&Ce&&(fe=Ce.RG16_EXT),se===s.SHORT&&Ce&&(fe=Ce.RG16_SNORM_EXT)),A===s.RG_INTEGER&&(se===s.UNSIGNED_BYTE&&(fe=s.RG8UI),se===s.UNSIGNED_SHORT&&(fe=s.RG16UI),se===s.UNSIGNED_INT&&(fe=s.RG32UI),se===s.BYTE&&(fe=s.RG8I),se===s.SHORT&&(fe=s.RG16I),se===s.INT&&(fe=s.RG32I)),A===s.RGB_INTEGER&&(se===s.UNSIGNED_BYTE&&(fe=s.RGB8UI),se===s.UNSIGNED_SHORT&&(fe=s.RGB16UI),se===s.UNSIGNED_INT&&(fe=s.RGB32UI),se===s.BYTE&&(fe=s.RGB8I),se===s.SHORT&&(fe=s.RGB16I),se===s.INT&&(fe=s.RGB32I)),A===s.RGBA_INTEGER&&(se===s.UNSIGNED_BYTE&&(fe=s.RGBA8UI),se===s.UNSIGNED_SHORT&&(fe=s.RGBA16UI),se===s.UNSIGNED_INT&&(fe=s.RGBA32UI),se===s.BYTE&&(fe=s.RGBA8I),se===s.SHORT&&(fe=s.RGBA16I),se===s.INT&&(fe=s.RGBA32I)),A===s.RGB&&(se===s.UNSIGNED_SHORT&&Ce&&(fe=Ce.RGB16_EXT),se===s.SHORT&&Ce&&(fe=Ce.RGB16_SNORM_EXT),se===s.UNSIGNED_INT_5_9_9_9_REV&&(fe=s.RGB9_E5),se===s.UNSIGNED_INT_10F_11F_11F_REV&&(fe=s.R11F_G11F_B10F)),A===s.RGBA){let me=re?Wo:At.getTransfer(he);se===s.FLOAT&&(fe=s.RGBA32F),se===s.HALF_FLOAT&&(fe=s.RGBA16F),se===s.UNSIGNED_BYTE&&(fe=me===Yt?s.SRGB8_ALPHA8:s.RGBA8),se===s.UNSIGNED_SHORT&&Ce&&(fe=Ce.RGBA16_EXT),se===s.SHORT&&Ce&&(fe=Ce.RGBA16_SNORM_EXT),se===s.UNSIGNED_SHORT_4_4_4_4&&(fe=s.RGBA4),se===s.UNSIGNED_SHORT_5_5_5_1&&(fe=s.RGB5_A1)}return(fe===s.R16F||fe===s.R32F||fe===s.RG16F||fe===s.RG32F||fe===s.RGBA16F||fe===s.RGBA32F)&&e.get("EXT_color_buffer_float"),fe}function b(N,A){let se;return N?A===null||A===Ei||A===lr?se=s.DEPTH24_STENCIL8:A===oi?se=s.DEPTH32F_STENCIL8:A===uo&&(se=s.DEPTH24_STENCIL8,ct("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===Ei||A===lr?se=s.DEPTH_COMPONENT24:A===oi?se=s.DEPTH_COMPONENT32F:A===uo&&(se=s.DEPTH_COMPONENT16),se}function w(N,A){return M(N)===!0||N.isFramebufferTexture&&N.minFilter!==yn&&N.minFilter!==Tn?Math.log2(Math.max(A.width,A.height))+1:N.mipmaps.length>0?N.mipmaps.length:N.isCompressedTexture&&Array.isArray(N.image)?A.mipmaps.length:1}function z(N){let A=new WeakRef(N);n.get(N).__ref=A,g.add(A),_.register(N,A,A)}function I(N){let A=n.get(N).__ref;A!==void 0&&(g.delete(A),_.unregister(A))}function H(N){G(N.target)}function V(N){U(N.target)}function G(N){N.removeEventListener("dispose",H),I(N),ne(N),N.isVideoTexture&&d.delete(N),N.isHTMLTexture&&f.delete(N)}function U(N){N.removeEventListener("dispose",V),I(N),ye(N)}function $(){for(let N of g){let A=N.deref();A!==void 0&&(A.isRenderTarget===!0?U(A):G(A))}g.clear(),f.clear()}function ne(N){let A=n.get(N);if(A.__webglInit===void 0)return;let se=N.source,Pe=u.get(se);if(Pe){let he=Pe[A.__cacheKey];he.usedTimes--,he.usedTimes===0&&Y(N),Object.keys(Pe).length===0&&u.delete(se)}n.remove(N)}function Y(N){let A=n.get(N);s.deleteTexture(A.__webglTexture);let se=N.source,Pe=u.get(se);delete Pe[A.__cacheKey],o.memory.textures--}function ye(N){let A=n.get(N);A.__depthDisposeCallback&&A.__depthDisposeCallback();let se=N.depthTexture;if(se&&se.renderTarget===N&&G(se),N.isWebGLCubeRenderTarget)for(let he=0;he<6;he++){if(Array.isArray(A.__webglFramebuffer[he]))for(let re=0;re<A.__webglFramebuffer[he].length;re++)s.deleteFramebuffer(A.__webglFramebuffer[he][re]);else s.deleteFramebuffer(A.__webglFramebuffer[he]);A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer[he])}else{if(Array.isArray(A.__webglFramebuffer))for(let he=0;he<A.__webglFramebuffer.length;he++)s.deleteFramebuffer(A.__webglFramebuffer[he]);else s.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer),A.__webglMultisampledFramebuffer&&s.deleteFramebuffer(A.__webglMultisampledFramebuffer),A.__webglColorRenderbuffer)for(let he=0;he<A.__webglColorRenderbuffer.length;he++)A.__webglColorRenderbuffer[he]&&s.deleteRenderbuffer(A.__webglColorRenderbuffer[he]);A.__webglDepthRenderbuffer&&s.deleteRenderbuffer(A.__webglDepthRenderbuffer)}let Pe=N.textures;for(let he=0,re=Pe.length;he<re;he++){let Ce=n.get(Pe[he]);Ce.__webglTexture&&(s.deleteTexture(Ce.__webglTexture),o.memory.textures--),n.remove(Pe[he])}n.remove(N)}let ie=0;function ge(){ie=0}function Te(){return ie}function De(N){ie=N}function rt(){let N=ie;return N>=i.maxTextures&&ct("WebGLTextures: Trying to use "+(N+1)+" texture units while this GPU supports only "+i.maxTextures),ie+=1,N}function W(N){let A=[];return A.push(N.wrapS),A.push(N.wrapT),A.push(N.wrapR||0),A.push(N.magFilter),A.push(N.minFilter),A.push(N.anisotropy),A.push(N.internalFormat),A.push(N.format),A.push(N.type),A.push(N.generateMipmaps),A.push(N.mipmapsAutoUpdate),A.push(N.premultiplyAlpha),A.push(N.flipY),A.push(N.unpackAlignment),A.push(N.colorSpace),A.join()}function pe(N,A){let se=n.get(N);if(N.isVideoTexture&&Qt(N),N.isRenderTargetTexture===!1&&N.isExternalTexture!==!0&&N.version>0&&se.__version!==N.version){let Pe=N.image;if(Pe===null)ct("WebGLRenderer: Texture marked for update but no image data found.");else if(Pe.complete===!1)ct("WebGLRenderer: Texture marked for update but image is incomplete");else{xt(se,N,A);return}}else N.isExternalTexture&&(se.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,se.__webglTexture,s.TEXTURE0+A)}function we(N,A){let se=n.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&se.__version!==N.version){xt(se,N,A);return}else N.isExternalTexture&&(se.__webglTexture=N.sourceTexture?N.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,se.__webglTexture,s.TEXTURE0+A)}function Be(N,A){let se=n.get(N);if(N.isRenderTargetTexture===!1&&N.version>0&&se.__version!==N.version){xt(se,N,A);return}t.bindTexture(s.TEXTURE_3D,se.__webglTexture,s.TEXTURE0+A)}function Me(N,A){let se=n.get(N);if(N.version>0&&se.__version!==N.version){Dt(se,N,A);return}t.bindTexture(s.TEXTURE_CUBE_MAP,se.__webglTexture,s.TEXTURE0+A)}let _e={[ii]:s.REPEAT,[di]:s.CLAMP_TO_EDGE,[kr]:s.MIRRORED_REPEAT},Ue={[yn]:s.NEAREST,[lc]:s.NEAREST_MIPMAP_NEAREST,[ar]:s.NEAREST_MIPMAP_LINEAR,[Tn]:s.LINEAR,[ho]:s.LINEAR_MIPMAP_NEAREST,[gi]:s.LINEAR_MIPMAP_LINEAR},Se={[Dp]:s.NEVER,[Iu]:s.ALWAYS,[Np]:s.LESS,[Cu]:s.LEQUAL,[Up]:s.EQUAL,[Pu]:s.GEQUAL,[Op]:s.GREATER,[Fp]:s.NOTEQUAL};function Fe(N,A){if(A.type===oi&&e.has("OES_texture_float_linear")===!1&&(A.magFilter===Tn||A.magFilter===ho||A.magFilter===ar||A.magFilter===gi||A.minFilter===Tn||A.minFilter===ho||A.minFilter===ar||A.minFilter===gi)&&ct("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(N,s.TEXTURE_WRAP_S,_e[A.wrapS]),s.texParameteri(N,s.TEXTURE_WRAP_T,_e[A.wrapT]),(N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY)&&s.texParameteri(N,s.TEXTURE_WRAP_R,_e[A.wrapR]),s.texParameteri(N,s.TEXTURE_MAG_FILTER,Ue[A.magFilter]),s.texParameteri(N,s.TEXTURE_MIN_FILTER,Ue[A.minFilter]),A.compareFunction&&(s.texParameteri(N,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(N,s.TEXTURE_COMPARE_FUNC,Se[A.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===yn||A.minFilter!==ar&&A.minFilter!==gi||A.type===oi&&e.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||n.get(A).__currentAnisotropy){let se=e.get("EXT_texture_filter_anisotropic");s.texParameterf(N,se.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,i.getMaxAnisotropy())),n.get(A).__currentAnisotropy=A.anisotropy}}}function tt(N,A){let se=!1;N.__webglInit===void 0&&(N.__webglInit=!0,A.addEventListener("dispose",H),z(A));let Pe=A.source,he=u.get(Pe);he===void 0&&(he={},u.set(Pe,he));let re=W(A);if(re!==N.__cacheKey){he[re]===void 0&&(he[re]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,se=!0),he[re].usedTimes++;let Ce=he[N.__cacheKey];Ce!==void 0&&(he[N.__cacheKey].usedTimes--,Ce.usedTimes===0&&Y(A)),N.__cacheKey=re,N.__webglTexture=he[re].texture}return se}function Ye(N,A,se){return Math.floor(Math.floor(N/se)/A)}function ht(N,A,se,Pe){let re=N.updateRanges;if(re.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,A.width,A.height,se,Pe,A.data);else{re.sort((B,be)=>B.start-be.start);let Ce=0;for(let B=1;B<re.length;B++){let be=re[Ce],ee=re[B],ue=be.start+be.count,j=Ye(ee.start,A.width,4),oe=Ye(be.start,A.width,4);ee.start<=ue+1&&j===oe&&Ye(ee.start+ee.count-1,A.width,4)===j?be.count=Math.max(be.count,ee.start+ee.count-be.start):(++Ce,re[Ce]=ee)}re.length=Ce+1;let fe=t.getParameter(s.UNPACK_ROW_LENGTH),me=t.getParameter(s.UNPACK_SKIP_PIXELS),ve=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,A.width);for(let B=0,be=re.length;B<be;B++){let ee=re[B],ue=Math.floor(ee.start/4),j=Math.ceil(ee.count/4),oe=ue%A.width,O=Math.floor(ue/A.width),je=j,Ie=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,oe),t.pixelStorei(s.UNPACK_SKIP_ROWS,O),t.texSubImage2D(s.TEXTURE_2D,0,oe,O,je,Ie,se,Pe,A.data)}N.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,fe),t.pixelStorei(s.UNPACK_SKIP_PIXELS,me),t.pixelStorei(s.UNPACK_SKIP_ROWS,ve)}}function xt(N,A,se){let Pe=s.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(Pe=s.TEXTURE_2D_ARRAY),A.isData3DTexture&&(Pe=s.TEXTURE_3D);let he=tt(N,A),re=A.source;t.bindTexture(Pe,N.__webglTexture,s.TEXTURE0+se);let Ce=n.get(re);if(re.version!==Ce.__version||he===!0){if(t.activeTexture(s.TEXTURE0+se),(typeof ImageBitmap<"u"&&A.image instanceof ImageBitmap)===!1){let Ie=At.getPrimaries(At.workingColorSpace),st=A.colorSpace===ls?null:At.getPrimaries(A.colorSpace),ft=A.colorSpace===ls||Ie===st?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ft)}t.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment);let me=y(A.image,!1,i.maxTextureSize);me=it(A,me);let ve=r.convert(A.format,A.colorSpace),B=r.convert(A.type),be=R(A.internalFormat,ve,B,A.normalized,A.colorSpace,A.isVideoTexture);Fe(Pe,A);let ee,ue=A.mipmaps,j=A.isVideoTexture!==!0,oe=Ce.__version===void 0||he===!0,O=re.dataReady,je=w(A,me);if(A.isDepthTexture)be=b(A.format===as,A.type),oe&&(j?t.texStorage2D(s.TEXTURE_2D,1,be,me.width,me.height):t.texImage2D(s.TEXTURE_2D,0,be,me.width,me.height,0,ve,B,null));else if(A.isDataTexture)if(ue.length>0){j&&oe&&t.texStorage2D(s.TEXTURE_2D,je,be,ue[0].width,ue[0].height);for(let Ie=0,st=ue.length;Ie<st;Ie++)ee=ue[Ie],j?O&&t.texSubImage2D(s.TEXTURE_2D,Ie,0,0,ee.width,ee.height,ve,B,ee.data):t.texImage2D(s.TEXTURE_2D,Ie,be,ee.width,ee.height,0,ve,B,ee.data);A.generateMipmaps=!1}else j?(oe&&t.texStorage2D(s.TEXTURE_2D,je,be,me.width,me.height),O&&ht(A,me,ve,B)):t.texImage2D(s.TEXTURE_2D,0,be,me.width,me.height,0,ve,B,me.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){j&&oe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,je,be,ue[0].width,ue[0].height,me.depth);for(let Ie=0,st=ue.length;Ie<st;Ie++)if(ee=ue[Ie],A.format!==_i)if(ve!==null)if(j){if(O)if(A.layerUpdates.size>0){let ft=Gu(ee.width,ee.height,A.format,A.type);for(let He of A.layerUpdates){let Ht=ee.data.subarray(He*ft/ee.data.BYTES_PER_ELEMENT,(He+1)*ft/ee.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Ie,0,0,He,ee.width,ee.height,1,ve,Ht)}}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Ie,0,0,0,ee.width,ee.height,me.depth,ve,ee.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,Ie,be,ee.width,ee.height,me.depth,0,ee.data,0,0);else ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else j?O&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,Ie,0,0,0,ee.width,ee.height,me.depth,ve,B,ee.data):t.texImage3D(s.TEXTURE_2D_ARRAY,Ie,be,ee.width,ee.height,me.depth,0,ve,B,ee.data);A.layerUpdates.size>0&&A.clearLayerUpdates()}else{j&&oe&&t.texStorage2D(s.TEXTURE_2D,je,be,ue[0].width,ue[0].height);for(let Ie=0,st=ue.length;Ie<st;Ie++)ee=ue[Ie],A.format!==_i?ve!==null?j?O&&t.compressedTexSubImage2D(s.TEXTURE_2D,Ie,0,0,ee.width,ee.height,ve,ee.data):t.compressedTexImage2D(s.TEXTURE_2D,Ie,be,ee.width,ee.height,0,ee.data):ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):j?O&&t.texSubImage2D(s.TEXTURE_2D,Ie,0,0,ee.width,ee.height,ve,B,ee.data):t.texImage2D(s.TEXTURE_2D,Ie,be,ee.width,ee.height,0,ve,B,ee.data)}else if(A.isDataArrayTexture)if(j){if(oe&&t.texStorage3D(s.TEXTURE_2D_ARRAY,je,be,me.width,me.height,me.depth),O)if(A.layerUpdates.size>0){let Ie=Gu(me.width,me.height,A.format,A.type);for(let st of A.layerUpdates){let ft=me.data.subarray(st*Ie/me.data.BYTES_PER_ELEMENT,(st+1)*Ie/me.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,st,me.width,me.height,1,ve,B,ft)}A.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,me.width,me.height,me.depth,ve,B,me.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,be,me.width,me.height,me.depth,0,ve,B,me.data);else if(A.isData3DTexture)j?(oe&&t.texStorage3D(s.TEXTURE_3D,je,be,me.width,me.height,me.depth),O&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,me.width,me.height,me.depth,ve,B,me.data)):t.texImage3D(s.TEXTURE_3D,0,be,me.width,me.height,me.depth,0,ve,B,me.data);else if(A.isFramebufferTexture){if(oe)if(j)t.texStorage2D(s.TEXTURE_2D,je,be,me.width,me.height);else{let Ie=me.width,st=me.height;for(let ft=0;ft<je;ft++)t.texImage2D(s.TEXTURE_2D,ft,be,Ie,st,0,ve,B,null),Ie>>=1,st>>=1}}else if(A.isHTMLTexture){if("texElementImage2D"in s){let Ie=s.canvas;if(Ie.hasAttribute("layoutsubtree")||Ie.setAttribute("layoutsubtree","true"),me.parentNode!==Ie){Ie.appendChild(me),f.add(A),Ie.onpaint=st=>{let ft=st.changedElements;for(let He of f)ft.includes(He.image)&&(He.needsUpdate=!0)},Ie.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,me);else{let ft=s.RGBA,He=s.RGBA,Ht=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,ft,He,Ht,me)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(ue.length>0){if(j&&oe){let Ie=ze(ue[0]);t.texStorage2D(s.TEXTURE_2D,je,be,Ie.width,Ie.height)}for(let Ie=0,st=ue.length;Ie<st;Ie++)ee=ue[Ie],j?O&&t.texSubImage2D(s.TEXTURE_2D,Ie,0,0,ve,B,ee):t.texImage2D(s.TEXTURE_2D,Ie,be,ve,B,ee);A.generateMipmaps=!1}else if(j){if(oe){let Ie=ze(me);t.texStorage2D(s.TEXTURE_2D,je,be,Ie.width,Ie.height)}O&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ve,B,me)}else t.texImage2D(s.TEXTURE_2D,0,be,ve,B,me);M(A)&&A.mipmapsAutoUpdate===!0&&v(Pe),Ce.__version=re.version,A.onUpdate&&A.onUpdate(A)}N.__version=A.version}function Dt(N,A,se){if(A.image.length!==6)return;let Pe=tt(N,A),he=A.source;t.bindTexture(s.TEXTURE_CUBE_MAP,N.__webglTexture,s.TEXTURE0+se);let re=n.get(he);if(he.version!==re.__version||Pe===!0){t.activeTexture(s.TEXTURE0+se);let Ce=At.getPrimaries(At.workingColorSpace),fe=A.colorSpace===ls?null:At.getPrimaries(A.colorSpace),me=A.colorSpace===ls||Ce===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let ve=A.isCompressedTexture||A.image[0].isCompressedTexture,B=A.image[0]&&A.image[0].isDataTexture,be=[];for(let He=0;He<6;He++)!ve&&!B?be[He]=y(A.image[He],!0,i.maxCubemapSize):be[He]=B?A.image[He].image:A.image[He],be[He]=it(A,be[He]);let ee=be[0],ue=r.convert(A.format,A.colorSpace),j=r.convert(A.type),oe=R(A.internalFormat,ue,j,A.normalized,A.colorSpace),O=A.isVideoTexture!==!0,je=re.__version===void 0||Pe===!0,Ie=he.dataReady,st=w(A,ee);Fe(s.TEXTURE_CUBE_MAP,A);let ft;if(A.isDepthTexture){if(oe=b(A.format===as,A.type),je)if(O)t.texStorage2D(s.TEXTURE_CUBE_MAP,1,oe,ee.width,ee.height);else for(let He=0;He<6;He++)t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,0,oe,ee.width,ee.height,0,ue,j,null)}else if(ve){O&&je&&t.texStorage2D(s.TEXTURE_CUBE_MAP,st,oe,ee.width,ee.height);for(let He=0;He<6;He++){ft=be[He].mipmaps;for(let Ht=0;Ht<ft.length;Ht++){let fn=ft[Ht];A.format!==_i?ue!==null?O?Ie&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht,0,0,fn.width,fn.height,ue,fn.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht,oe,fn.width,fn.height,0,fn.data):ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?Ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht,0,0,fn.width,fn.height,ue,j,fn.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht,oe,fn.width,fn.height,0,ue,j,fn.data)}}}else{if(ft=A.mipmaps,O&&je){ft.length>0&&st++;let He=ze(be[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,st,oe,He.width,He.height)}for(let He=0;He<6;He++)if(B){O?Ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,0,0,0,be[He].width,be[He].height,ue,j,be[He].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,0,oe,be[He].width,be[He].height,0,ue,j,be[He].data);for(let Ht=0;Ht<ft.length;Ht++){let pn=ft[Ht].image[He].image;O?Ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht+1,0,0,pn.width,pn.height,ue,j,pn.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht+1,oe,pn.width,pn.height,0,ue,j,pn.data)}}else{O?Ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,0,0,0,ue,j,be[He]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,0,oe,ue,j,be[He]);for(let Ht=0;Ht<ft.length;Ht++){let fn=ft[Ht];O?Ie&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht+1,0,0,ue,j,fn.image[He]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+He,Ht+1,oe,ue,j,fn.image[He])}}}M(A)&&A.mipmapsAutoUpdate===!0&&v(s.TEXTURE_CUBE_MAP),re.__version=he.version,A.onUpdate&&A.onUpdate(A)}N.__version=A.version}function lt(N,A,se,Pe,he,re){let Ce=r.convert(se.format,se.colorSpace),fe=r.convert(se.type),me=R(se.internalFormat,Ce,fe,se.normalized,se.colorSpace),ve=n.get(A),B=n.get(se);if(B.__renderTarget=A,!ve.__hasExternalTextures){let be=Math.max(1,A.width>>re),ee=Math.max(1,A.height>>re);he===s.TEXTURE_3D||he===s.TEXTURE_2D_ARRAY?t.texImage3D(he,re,me,be,ee,A.depth,0,Ce,fe,null):t.texImage2D(he,re,me,be,ee,0,Ce,fe,null)}t.bindFramebuffer(s.FRAMEBUFFER,N),Oe(A)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Pe,he,B.__webglTexture,0,Lt(A)):(he===s.TEXTURE_2D||he>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&he<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Pe,he,B.__webglTexture,re),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Xt(N,A,se){if(s.bindRenderbuffer(s.RENDERBUFFER,N),A.depthBuffer){let Pe=A.depthTexture,he=Pe&&Pe.isDepthTexture?Pe.type:null,re=b(A.stencilBuffer,he),Ce=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Oe(A)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Lt(A),re,A.width,A.height):se?s.renderbufferStorageMultisample(s.RENDERBUFFER,Lt(A),re,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,re,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ce,s.RENDERBUFFER,N)}else{let Pe=A.textures;for(let he=0;he<Pe.length;he++){let re=Pe[he],Ce=r.convert(re.format,re.colorSpace),fe=r.convert(re.type),me=R(re.internalFormat,Ce,fe,re.normalized,re.colorSpace);Oe(A)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Lt(A),me,A.width,A.height):se?s.renderbufferStorageMultisample(s.RENDERBUFFER,Lt(A),me,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,me,A.width,A.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ut(N,A,se){let Pe=A.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,N),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let he=n.get(A.depthTexture);he.__renderTarget=A;let re=Pe?A.depthTexture.image[0]:A.depthTexture.image;(!he.__webglTexture||re.width!==A.width||re.height!==A.height)&&(re.width=A.width,re.height=A.height,A.depthTexture.needsUpdate=!0),Pe?Me(A.depthTexture,0):pe(A.depthTexture,0);let Ce=he.__webglTexture,fe=Lt(A),me=Pe?s.TEXTURE_CUBE_MAP_POSITIVE_X+se:s.TEXTURE_2D,ve=A.depthTexture.format===as?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(A.depthTexture.format===Ji)Oe(A)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ve,me,Ce,0,fe):s.framebufferTexture2D(s.FRAMEBUFFER,ve,me,Ce,0);else if(A.depthTexture.format===as)Oe(A)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ve,me,Ce,0,fe):s.framebufferTexture2D(s.FRAMEBUFFER,ve,me,Ce,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function zt(N){let A=n.get(N),se=N.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==N.depthTexture){let Pe=N.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),Pe){let he=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,Pe.removeEventListener("dispose",he)};Pe.addEventListener("dispose",he),A.__depthDisposeCallback=he}A.__boundDepthTexture=Pe}if(N.depthTexture&&!A.__autoAllocateDepthBuffer)if(se)for(let Pe=0;Pe<6;Pe++)ut(A.__webglFramebuffer[Pe],N,Pe);else N.texture.mipmaps.length>0?ut(A.__webglFramebuffer[0],N,0):ut(A.__webglFramebuffer,N,0);else if(se){A.__webglDepthbuffer=[];for(let Pe=0;Pe<6;Pe++)if(t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer[Pe]),A.__webglDepthbuffer[Pe]===void 0)A.__webglDepthbuffer[Pe]=s.createRenderbuffer(),Xt(A.__webglDepthbuffer[Pe],N,!1);else{let he=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,re=A.__webglDepthbuffer[Pe];s.bindRenderbuffer(s.RENDERBUFFER,re),s.framebufferRenderbuffer(s.FRAMEBUFFER,he,s.RENDERBUFFER,re)}}else if(N.texture.mipmaps.length>0?t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=s.createRenderbuffer(),Xt(A.__webglDepthbuffer,N,!1);else{let he=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,re=A.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,re),s.framebufferRenderbuffer(s.FRAMEBUFFER,he,s.RENDERBUFFER,re)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function un(N,A,se){let Pe=n.get(N);A!==void 0&&lt(Pe.__webglFramebuffer,N,N.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),se!==void 0&&zt(N)}function dn(N){let A=N.texture,se=n.get(N),Pe=n.get(A);N.addEventListener("dispose",V),z(N);let he=N.textures,re=N.isWebGLCubeRenderTarget===!0,Ce=he.length>1;if(Ce||(Pe.__webglTexture===void 0&&(Pe.__webglTexture=s.createTexture()),Pe.__version=A.version,o.memory.textures++),re){se.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(A.mipmaps.length>0){se.__webglFramebuffer[fe]=[];for(let me=0;me<A.mipmaps.length;me++)se.__webglFramebuffer[fe][me]=s.createFramebuffer()}else se.__webglFramebuffer[fe]=s.createFramebuffer()}else{if(A.mipmaps.length>0){se.__webglFramebuffer=[];for(let fe=0;fe<A.mipmaps.length;fe++)se.__webglFramebuffer[fe]=s.createFramebuffer()}else se.__webglFramebuffer=s.createFramebuffer();if(Ce)for(let fe=0,me=he.length;fe<me;fe++){let ve=n.get(he[fe]);ve.__webglTexture===void 0&&(ve.__webglTexture=s.createTexture(),o.memory.textures++)}if(N.samples>0&&Oe(N)===!1){se.__webglMultisampledFramebuffer=s.createFramebuffer(),se.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,se.__webglMultisampledFramebuffer);for(let fe=0;fe<he.length;fe++){let me=he[fe];se.__webglColorRenderbuffer[fe]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,se.__webglColorRenderbuffer[fe]);let ve=r.convert(me.format,me.colorSpace),B=r.convert(me.type),be=R(me.internalFormat,ve,B,me.normalized,me.colorSpace,N.isXRRenderTarget===!0),ee=Lt(N);s.renderbufferStorageMultisample(s.RENDERBUFFER,ee,be,N.width,N.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,se.__webglColorRenderbuffer[fe])}s.bindRenderbuffer(s.RENDERBUFFER,null),N.depthBuffer&&(se.__webglDepthRenderbuffer=s.createRenderbuffer(),Xt(se.__webglDepthRenderbuffer,N,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(re){t.bindTexture(s.TEXTURE_CUBE_MAP,Pe.__webglTexture),Fe(s.TEXTURE_CUBE_MAP,A);for(let fe=0;fe<6;fe++)if(A.mipmaps.length>0)for(let me=0;me<A.mipmaps.length;me++)lt(se.__webglFramebuffer[fe][me],N,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,me);else lt(se.__webglFramebuffer[fe],N,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);M(A)?v(s.TEXTURE_CUBE_MAP):A.mipmaps.length>0&&s.texParameteri(s.TEXTURE_CUBE_MAP,s.TEXTURE_MAX_LEVEL,A.mipmaps.length-1),t.unbindTexture()}else if(Ce){for(let fe=0,me=he.length;fe<me;fe++){let ve=he[fe],B=n.get(ve),be=s.TEXTURE_2D;(N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(be=N.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(be,B.__webglTexture),Fe(be,ve),lt(se.__webglFramebuffer,N,ve,s.COLOR_ATTACHMENT0+fe,be,0),M(ve)&&v(be)}t.unbindTexture()}else{let fe=s.TEXTURE_2D;if((N.isWebGL3DRenderTarget||N.isWebGLArrayRenderTarget)&&(fe=N.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,Pe.__webglTexture),Fe(fe,A),A.mipmaps.length>0)for(let me=0;me<A.mipmaps.length;me++)lt(se.__webglFramebuffer[me],N,A,s.COLOR_ATTACHMENT0,fe,me);else lt(se.__webglFramebuffer,N,A,s.COLOR_ATTACHMENT0,fe,0);M(A)?v(fe):A.mipmaps.length>0&&s.texParameteri(fe,s.TEXTURE_MAX_LEVEL,A.mipmaps.length-1),t.unbindTexture()}N.depthBuffer&&zt(N)}function J(N){let A=N.textures;for(let se=0,Pe=A.length;se<Pe;se++){let he=A[se];if(M(he)&&he.mipmapsAutoUpdate===!0){let re=C(N),Ce=n.get(he).__webglTexture;t.bindTexture(re,Ce),v(re),t.unbindTexture()}}}let dt=[];function Nt(N){if(N.samples>0){if(Oe(N)===!1){let A=N.textures,se=N.width,Pe=N.height,he=s.COLOR_BUFFER_BIT,re=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ce=n.get(N),fe=A.length>1;if(fe)for(let ve=0;ve<A.length;ve++)t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),N.texture.mipmaps.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer);for(let ve=0;ve<A.length;ve++){if(N.resolveDepthBuffer&&(N.depthBuffer&&(he|=s.DEPTH_BUFFER_BIT),N.stencilBuffer&&N.resolveStencilBuffer&&(he|=s.STENCIL_BUFFER_BIT)),fe){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ce.__webglColorRenderbuffer[ve]);let B=n.get(A[ve]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,B,0)}s.blitFramebuffer(0,0,se,Pe,0,0,se,Pe,he,s.NEAREST),l===!0&&(dt.length=0,dt.push(s.COLOR_ATTACHMENT0+ve),N.depthBuffer&&N.storeMultisampledDepthBuffer===!1&&dt.push(re),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,dt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),fe)for(let ve=0;ve<A.length;ve++){t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.RENDERBUFFER,Ce.__webglColorRenderbuffer[ve]);let B=n.get(A[ve]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ve,s.TEXTURE_2D,B,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer)}else if(N.depthBuffer&&N.storeMultisampledDepthBuffer===!1&&l){let A=N.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[A])}}}function Lt(N){return Math.min(i.maxSamples,N.samples)}function Oe(N){let A=n.get(N);return N.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function Qt(N){let A=o.render.frame;d.get(N)!==A&&(d.set(N,A),N.update())}function it(N,A){let se=N.colorSpace,Pe=N.format,he=N.type;return N.isCompressedTexture===!0||N.isVideoTexture===!0||se!==Vn&&se!==ls&&(At.getTransfer(se)===Yt?(Pe!==_i||he!==jn)&&ct("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):pt("WebGLTextures: Unsupported texture color space:",se)),A}function ze(N){return typeof HTMLImageElement<"u"&&N instanceof HTMLImageElement?(c.width=N.naturalWidth||N.width,c.height=N.naturalHeight||N.height):typeof VideoFrame<"u"&&N instanceof VideoFrame?(c.width=N.displayWidth,c.height=N.displayHeight):(c.width=N.width,c.height=N.height),c}this.allocateTextureUnit=rt,this.resetTextureUnits=ge,this.getTextureUnits=Te,this.setTextureUnits=De,this.setTexture2D=pe,this.setTexture2DArray=we,this.setTexture3D=Be,this.setTextureCube=Me,this.rebindTextures=un,this.setupRenderTarget=dn,this.updateRenderTargetMipmap=J,this.updateMultisampleRenderTarget=Nt,this.setupDepthRenderbuffer=zt,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=Oe,this.dispose=$}function VM(s,e){function t(n,i=ls){let r,o=At.getTransfer(i);if(n===jn)return s.UNSIGNED_BYTE;if(n===hc)return s.UNSIGNED_SHORT_4_4_4_4;if(n===uc)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Eu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Tu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===bu)return s.BYTE;if(n===Su)return s.SHORT;if(n===uo)return s.UNSIGNED_SHORT;if(n===cc)return s.INT;if(n===Ei)return s.UNSIGNED_INT;if(n===oi)return s.FLOAT;if(n===Ti)return s.HALF_FLOAT;if(n===wu)return s.ALPHA;if(n===Au)return s.RGB;if(n===_i)return s.RGBA;if(n===Ji)return s.DEPTH_COMPONENT;if(n===as)return s.DEPTH_STENCIL;if(n===dc)return s.RED;if(n===fc)return s.RED_INTEGER;if(n===Rs)return s.RG;if(n===pc)return s.RG_INTEGER;if(n===mc)return s.RGBA_INTEGER;if(n===Ea||n===Ta||n===wa||n===Aa)if(o===Yt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ea)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ea)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ta)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===wa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===gc||n===_c||n===yc||n===xc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===gc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===_c)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===yc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===xc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===vc||n===Mc||n===bc||n===Sc||n===Ec||n===Ra||n===Tc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===vc||n===Mc)return o===Yt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===bc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Sc)return r.COMPRESSED_R11_EAC;if(n===Ec)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ra)return r.COMPRESSED_RG11_EAC;if(n===Tc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===wc||n===Ac||n===Rc||n===Cc||n===Pc||n===Ic||n===Lc||n===Dc||n===Nc||n===Uc||n===Oc||n===Fc||n===Bc||n===kc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===wc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ac)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Rc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Cc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Pc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ic)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Lc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Dc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Nc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Uc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Oc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Fc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Bc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===kc)return o===Yt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===zc||n===Hc||n===Gc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===zc)return o===Yt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Hc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Gc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Vc||n===Wc||n===Ca||n===Xc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Vc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Wc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ca)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Xc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===lr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var WM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,XM=`
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

}`,Ju=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new sa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Di({vertexShader:WM,fragmentShader:XM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new tn(new js(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ju=class extends pi{constructor(e,t){super();let n=this,i=null,r=1,o=null,a="local-floor",l=1,c=null,d=null,f=null,h=null,u=null,g=null,_=typeof XRWebGLBinding<"u",p=new Ju,m={},y=t.getContextAttributes(),M=null,v=null,C=[],R=[],b=new Ee,w=null,z=null,I=new bn;I.viewport=new Zt;let H=new bn;H.viewport=new Zt;let V=[I,H],G=new ic,U=null,$=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let pe=C[W];return pe===void 0&&(pe=new Xr,C[W]=pe),pe.getTargetRaySpace()},this.getControllerGrip=function(W){let pe=C[W];return pe===void 0&&(pe=new Xr,C[W]=pe),pe.getGripSpace()},this.getHand=function(W){let pe=C[W];return pe===void 0&&(pe=new Xr,C[W]=pe),pe.getHandSpace()};function ne(W){let pe=R.indexOf(W.inputSource);if(pe===-1)return;let we=C[pe];we!==void 0&&(we.update(W.inputSource,W.frame,c||o),we.dispatchEvent({type:W.type,data:W.inputSource}))}function Y(){i.removeEventListener("select",ne),i.removeEventListener("selectstart",ne),i.removeEventListener("selectend",ne),i.removeEventListener("squeeze",ne),i.removeEventListener("squeezestart",ne),i.removeEventListener("squeezeend",ne),i.removeEventListener("end",Y),i.removeEventListener("inputsourceschange",ye);for(let W=0;W<C.length;W++){let pe=R[W];pe!==null&&(R[W]=null,C[W].disconnect(pe))}U=null,$=null,p.reset();for(let W in m)delete m[W];if(e.setRenderTarget(M),u=null,h=null,f=null,i=null,v=null,rt.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(b.width,b.height,!1),z!==null){let W=z.camera;W.fov=z.fov,W.zoom=z.zoom,W.updateProjectionMatrix(),z=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&ct("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,n.isPresenting===!0&&ct("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return h!==null?h:u},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(i,t)),f},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(W){if(i=W,i!==null){if(M=e.getRenderTarget(),i.addEventListener("select",ne),i.addEventListener("selectstart",ne),i.addEventListener("selectend",ne),i.addEventListener("squeeze",ne),i.addEventListener("squeezestart",ne),i.addEventListener("squeezeend",ne),i.addEventListener("end",Y),i.addEventListener("inputsourceschange",ye),y.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(b),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let we=null,Be=null,Me=null;y.depth&&(Me=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,we=y.stencil?as:Ji,Be=y.stencil?lr:Ei);let _e={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(_e),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new si(h.textureWidth,h.textureHeight,{format:_i,type:jn,depthTexture:new ts(h.textureWidth,h.textureHeight,Be,void 0,void 0,void 0,void 0,void 0,void 0,we),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let we={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};u=new XRWebGLLayer(i,t,we),i.updateRenderState({baseLayer:u}),e.setPixelRatio(1),e.setSize(u.framebufferWidth,u.framebufferHeight,!1),v=new si(u.framebufferWidth,u.framebufferHeight,{format:_i,type:jn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),rt.setContext(i),rt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function ye(W){for(let pe=0;pe<W.removed.length;pe++){let we=W.removed[pe],Be=R.indexOf(we);Be>=0&&(R[Be]=null,C[Be].disconnect(we))}for(let pe=0;pe<W.added.length;pe++){let we=W.added[pe],Be=R.indexOf(we);if(Be===-1){for(let _e=0;_e<C.length;_e++)if(_e>=R.length){R.push(we),Be=_e;break}else if(R[_e]===null){R[_e]=we,Be=_e;break}if(Be===-1)break}let Me=C[Be];Me&&Me.connect(we)}}function ie(W,pe){pe===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(pe.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(i===null)return;let pe=W.near,we=W.far;p.texture!==null&&(p.depthNear>0&&(pe=p.depthNear),p.depthFar>0&&(we=p.depthFar)),G.near=H.near=I.near=pe,G.far=H.far=I.far=we,(U!==G.near||$!==G.far)&&(i.updateRenderState({depthNear:G.near,depthFar:G.far}),U=G.near,$=G.far),G.layers.mask=W.layers.mask|6,I.layers.mask=G.layers.mask&-5,H.layers.mask=G.layers.mask&-3;let Be=W.parent,Me=G.cameras;ie(G,Be);for(let _e=0;_e<Me.length;_e++)ie(Me[_e],Be);G.projectionMatrix.copy(I.projectionMatrix),G.projectionMatrixInverse.copy(I.projectionMatrixInverse),z===null&&W.isPerspectiveCamera&&(z={camera:W,fov:W.fov,zoom:W.zoom}),ge(W,G,Be)};function ge(W,pe,we){we===null?W.matrix.copy(pe.matrixWorld):(W.matrix.copy(we.matrixWorld),W.matrix.invert(),W.matrix.multiply(pe.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(pe.projectionMatrix),W.projectionMatrixInverse.copy(pe.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Vs*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return G},this.getFoveation=function(){if(!(h===null&&u===null))return l},this.setFoveation=function(W){l=W,h!==null&&(h.fixedFoveation=W),u!==null&&u.fixedFoveation!==void 0&&(u.fixedFoveation=W)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(G)},this.getCameraTexture=function(W){return m[W]};let Te=null;function De(W,pe){if(d=pe.getViewerPose(c||o),g=pe,d!==null){let we=d.views;u!==null&&(e.setRenderTargetFramebuffer(v,u.framebuffer),e.setRenderTarget(v));let Be=!1;we.length!==G.cameras.length&&(G.cameras.length=0,Be=!0);for(let Se=0;Se<we.length;Se++){let Fe=we[Se],tt=null;if(u!==null)tt=u.getViewport(Fe);else{let ht=f.getViewSubImage(h,Fe);tt=ht.viewport,Se===0&&(e.setRenderTargetTextures(v,ht.colorTexture,ht.depthStencilTexture),e.setRenderTarget(v))}let Ye=V[Se];Ye===void 0&&(Ye=new bn,Ye.layers.enable(Se),Ye.viewport=new Zt,V[Se]=Ye),Ye.matrix.fromArray(Fe.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Fe.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(tt.x,tt.y,tt.width,tt.height),Se===0&&(G.matrix.copy(Ye.matrix),G.matrix.decompose(G.position,G.quaternion,G.scale)),Be===!0&&G.cameras.push(Ye)}let Me=i.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){f=n.getBinding();let Se=f.getDepthInformation(we[0]);Se&&Se.isValid&&Se.texture&&p.init(Se,i.renderState)}if(Me&&Me.includes("camera-access")&&_){e.state.unbindTexture(),f=n.getBinding();for(let Se=0;Se<we.length;Se++){let Fe=we[Se].camera;if(Fe){let tt=m[Fe];tt||(tt=new sa,m[Fe]=tt);let Ye=f.getCameraImage(Fe);tt.sourceTexture=Ye}}}}for(let we=0;we<C.length;we++){let Be=R[we],Me=C[we];Be!==null&&Me!==void 0&&Me.update(Be,pe,c||o)}Te&&Te(W,pe),pe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:pe}),g=null}let rt=new ym;rt.setAnimationLoop(De),this.setAnimationLoop=function(W){Te=W},this.dispose=function(){}}},qM=new mt,Rm=new yt;Rm.set(-1,0,0,0,1,0,0,0,1);function YM(s,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,ku(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,y,M,v){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),f(p,m)):m.isMeshPhongMaterial?(r(p,m),d(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),h(p,m),m.isMeshPhysicalMaterial&&u(p,m,v)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,M):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Yn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Yn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m),M=y.envMap,v=y.envMapRotation;M&&(p.envMap.value=M,p.envMapRotation.value.setFromMatrix4(qM.makeRotationFromEuler(v)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Rm),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,M){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=M*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function d(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function f(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function h(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function u(p,m,y){p.ior.value=m.ior,m.diffuseRoughness>0&&(p.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(p.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,p.diffuseRoughnessMapTransform))),m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Yn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function KM(s,e,t,n){let i={},r={};function o(y,M){let v=M.program;n.uniformBlockBinding(y,v,i[y.id])}function a(y,M){let v=i[y.id];v===void 0&&(g(y),v=l(y),i[y.id]=v,y.addEventListener("dispose",p));let C=M.program;n.updateUBOMapping(y,C);let R=e.render.frame;r[y.id]!==R&&(c(y),r[y.id]=R)}function l(y){let M=s.createBuffer(),v=y.__size,C=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,M),s.bufferData(s.UNIFORM_BUFFER,v,C),s.bindBuffer(s.UNIFORM_BUFFER,null),M}function c(y){let M=i[y.id],v=y.uniforms,C=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let R=0,b=v.length;R<b;R++){let w=v[R];if(Array.isArray(w))for(let z=0,I=w.length;z<I;z++)d(w[z],R,z,C);else d(w,R,0,C)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(y,M,v,C){if(h(y,M,v,C)===!0){let R=y.__offset,b=y.value;if(Array.isArray(b)){let w=0;for(let z=0;z<b.length;z++){let I=b[z],H=_(I,!0);f(I,y.__data,w),w+=H.storage/Float32Array.BYTES_PER_ELEMENT}}else f(b,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,R,y.__data)}}function f(y,M,v){typeof y=="number"||typeof y=="boolean"?M[v]=y:y.isMatrix3?(M[v]=y.elements[0],M[v+1]=y.elements[1],M[v+2]=y.elements[2],M[v+3]=0,M[v+4]=y.elements[3],M[v+5]=y.elements[4],M[v+6]=y.elements[5],M[v+7]=0,M[v+8]=y.elements[6],M[v+9]=y.elements[7],M[v+10]=y.elements[8],M[v+11]=0):ArrayBuffer.isView(y)?M.set(y.subarray(0,M.length-v),v):y.toArray(M,v)}function h(y,M,v,C){let R=y.value,b=M+"_"+v;if(Array.isArray(R)){C[b]===void 0&&(C[b]=[]);let w=C[b],z=!1;for(let I=0;I<R.length;I++)u(R[I],w,I)===!0&&(z=!0);return z}return u(R,C,b)}function u(y,M,v){if(M[v]===void 0)return typeof y=="number"||typeof y=="boolean"?M[v]=y:ArrayBuffer.isView(y)?M[v]=y.slice():M[v]=y.clone(),!0;{let C=M[v];if(typeof y=="number"||typeof y=="boolean"){if(C!==y)return M[v]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(C.equals(y)===!1)return C.copy(y),!0}}return!1}function g(y){let M=y.uniforms,v=0,C=16;for(let b=0,w=M.length;b<w;b++){let z=Array.isArray(M[b])?M[b]:[M[b]];for(let I=0,H=z.length;I<H;I++){let V=z[I],G=Array.isArray(V.value)?V.value:[V.value],U=Array.isArray(M[b])||Array.isArray(V.value),$=v;for(let Y=0,ye=G.length;Y<ye;Y++){let ie=G[Y],ge=_(ie,U),Te=v%C,De=Te%ge.boundary,rt=Te+De;v+=De,rt!==0&&C-rt<ge.storage&&(v+=C-rt),Y===0&&($=v),v+=ge.storage}let ne=V.type==="int"?Int32Array:V.type==="uint"?Uint32Array:Float32Array;V.__data=new ne((v-$)/Float32Array.BYTES_PER_ELEMENT),V.__offset=$}}let R=v%C;return R>0&&(v+=C-R),y.__size=v,y.__cache={},this}function _(y,M){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=16,v.storage=48):y.isMatrix4?(v.boundary=16,v.storage=64):y.isTexture?ct("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(v.boundary=16,v.storage=y.byteLength):ct("WebGLRenderer: Unsupported uniform value type.",y),M===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function p(y){let M=y.target;M.removeEventListener("dispose",p),s.deleteBuffer(i[M.id]),delete i[M.id],delete r[M.id]}function m(){for(let y in i)s.deleteBuffer(i[y]);i={},r={}}return{bind:o,update:a,dispose:m}}var ZM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Bi=null;function $M(){return Bi===null&&(Bi=new Yr(ZM,16,16,Rs,Ti),Bi.name="DFG_LUT",Bi.minFilter=Tn,Bi.magFilter=Tn,Bi.wrapS=di,Bi.wrapT=di,Bi.generateMipmaps=!1,Bi.needsUpdate=!0),Bi}var Qc=class{constructor(e={}){let{canvas:t=Bp(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:u=jn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let _=u,p=new Set([mc,pc,fc]),m=new Set([jn,Ei,uo,lr,hc,uc]),y=new Uint32Array(4),M=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]},C=null,R=null,b=[],w=[],z=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Fi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,H=!1,V=null,G=null,U=null,$=null;this._outputColorSpace=jt;let ne=0,Y=0,ye=null,ie=-1,ge=null,Te=new Zt,De=new Zt,rt=null,W=new at(0),pe=0,we=t.width,Be=t.height,Me=1,_e=null,Ue=null,Se=new Zt(0,0,we,Be),Fe=new Zt(0,0,we,Be),tt=!1,Ye=new vs,ht=new Gl,xt=!1,Dt=!1,lt=new mt,Xt=new D,ut=new Zt,zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},un=!1;function dn(){return ye===null?Me:1}let J=n;function dt(P,X){return t.getContext(P,X)}let Nt,Lt,Oe,Qt,it,ze,N,A,se,Pe,he,re,Ce,fe,me,ve,B,be,ee,ue,j,oe,O;try{let P={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",st,!1),t.addEventListener("webglcontextrestored",ft,!1),t.addEventListener("webglcontextcreationerror",He,!1),J===null){let X="webgl2";if(J=dt(X,P),J===null)throw dt(X)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}je()}catch(P){throw t.removeEventListener("webglcontextlost",st,!1),t.removeEventListener("webglcontextrestored",ft,!1),t.removeEventListener("webglcontextcreationerror",He,!1),pt("WebGLRenderer: "+P.message),P}function je(){Nt=new av(J),Nt.init(),j=new VM(J,Nt),Lt=new $x(J,Nt,e,j),Oe=new HM(J,Nt),Lt.reversedDepthBuffer&&h&&Oe.buffers.depth.setReversed(!0),G=J.createFramebuffer(),U=J.createFramebuffer(),$=J.createFramebuffer(),Qt=new hv(J),it=new AM,ze=new GM(J,Nt,Oe,it,Lt,j,Qt),N=new ov(I),A=new d_(J),oe=new Kx(J,A),se=new lv(J,A,Qt,oe),Pe=new dv(J,se,A,oe,Qt),be=new uv(J,Lt,ze),me=new Jx(it),he=new wM(I,N,Nt,Lt,oe,me),re=new YM(I,it),Ce=new CM,fe=new UM(Nt),B=new Yx(I,N,Oe,Pe,g,l),ve=new zM(I,Pe,Lt),O=new KM(J,Qt,Lt,Oe),ee=new Zx(J,Nt,Qt),ue=new cv(J,Nt,Qt),Qt.programs=he.programs,I.capabilities=Lt,I.extensions=Nt,I.properties=it,I.renderLists=Ce,I.shadowMap=ve,I.state=Oe,I.info=Qt}_!==jn&&(z=new pv(_,t.width,t.height,a,i,r));let Ie=new ju(I,J);this.xr=Ie,this.getContext=function(){return J},this.getContextAttributes=function(){return J.getContextAttributes()},this.forceContextLoss=function(){let P=Nt.get("WEBGL_lose_context");P&&P.loseContext()},this.forceContextRestore=function(){let P=Nt.get("WEBGL_lose_context");P&&P.restoreContext()},this.getPixelRatio=function(){return Me},this.setPixelRatio=function(P){P!==void 0&&(Me=P,this.setSize(we,Be,!1))},this.getSize=function(P){return P.set(we,Be)},this.setSize=function(P,X,de=!0){if(Ie.isPresenting){ct("WebGLRenderer: Can't change size while VR device is presenting.");return}we=P,Be=X,t.width=Math.floor(P*Me),t.height=Math.floor(X*Me),de===!0&&(t.style.width=P+"px",t.style.height=X+"px"),z!==null&&z.setSize(t.width,t.height),this.setViewport(0,0,P,X)},this.getDrawingBufferSize=function(P){return P.set(we*Me,Be*Me).floor()},this.setDrawingBufferSize=function(P,X,de){we=P,Be=X,Me=de,t.width=Math.floor(P*de),t.height=Math.floor(X*de),this.setViewport(0,0,P,X)},this.setEffects=function(P){if(_===jn){pt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(P){for(let X=0;X<P.length;X++)if(P[X].isOutputPass===!0){ct("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}z.setEffects(P||[])},this.getCurrentViewport=function(P){return P.copy(Te)},this.getViewport=function(P){return P.copy(Se)},this.setViewport=function(P,X,de,ae){P.isVector4?Se.set(P.x,P.y,P.z,P.w):Se.set(P,X,de,ae),Oe.viewport(Te.copy(Se).multiplyScalar(dn()).round())},this.getScissor=function(P){return P.copy(Fe)},this.setScissor=function(P,X,de,ae){P.isVector4?Fe.set(P.x,P.y,P.z,P.w):Fe.set(P,X,de,ae),Oe.scissor(De.copy(Fe).multiplyScalar(dn()).round())},this.getScissorTest=function(){return tt},this.setScissorTest=function(P){Oe.setScissorTest(tt=P)},this.setOpaqueSort=function(P){_e=P},this.setTransparentSort=function(P){Ue=P},this.getClearColor=function(P){return P.copy(B.getClearColor())},this.setClearColor=function(){B.setClearColor(...arguments)},this.getClearAlpha=function(){return B.getClearAlpha()},this.setClearAlpha=function(){B.setClearAlpha(...arguments)},this.clear=function(P=!0,X=!0,de=!0){let ae=0;if(P){let ce=!1;if(ye!==null){let Ge=ye.texture.format;ce=p.has(Ge)}if(ce){let Ge=ye.texture.type,Ze=m.has(Ge),ke=B.getClearColor(),Xe=B.getClearAlpha(),nt=ke.r,_t=ke.g,Et=ke.b;Ze?(y[0]=nt,y[1]=_t,y[2]=Et,y[3]=Xe,J.clearBufferuiv(J.COLOR,0,y)):(M[0]=nt,M[1]=_t,M[2]=Et,M[3]=Xe,J.clearBufferiv(J.COLOR,0,M))}else ae|=J.COLOR_BUFFER_BIT}X&&(ae|=J.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),de&&(ae|=J.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),ae!==0&&J.clear(ae)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(P){P.setRenderer(this),V=P},this.dispose=function(){t.removeEventListener("webglcontextlost",st,!1),t.removeEventListener("webglcontextrestored",ft,!1),t.removeEventListener("webglcontextcreationerror",He,!1),B.dispose(),Ce.dispose(),fe.dispose(),ze.dispose(),it.dispose(),N.dispose(),Pe.dispose(),se.dispose(),oe.dispose(),O.dispose(),he.dispose(),Ie.dispose(),Ie.removeEventListener("sessionstart",Ga),Ie.removeEventListener("sessionend",Va),li.stop()};function st(P){P.preventDefault(),Xo("WebGLRenderer: Context Lost."),H=!0}function ft(){Xo("WebGLRenderer: Context Restored."),H=!1;let P=Qt.autoReset,X=ve.enabled,de=ve.autoUpdate,ae=ve.needsUpdate,ce=ve.type;je(),Qt.autoReset=P,ve.enabled=X,ve.autoUpdate=de,ve.needsUpdate=ae,ve.type=ce}function He(P){pt("WebGLRenderer: A WebGL context could not be created. Reason: ",P.statusMessage)}function Ht(P){let X=P.target;X.removeEventListener("dispose",Ht),fn(X)}function fn(P){pn(P),it.remove(P)}function pn(P){let X=it.get(P).programs;X!==void 0&&(X.forEach(function(de){he.releaseProgram(de)}),P.isShaderMaterial&&he.releaseShaderCache(P))}this.renderBufferDirect=function(P,X,de,ae,ce,Ge){X===null&&(X=zt);let Ze=ce.isMesh&&ce.matrixWorld.determinantAffine()<0,ke=bo(P,X,de,ae,ce);Oe.setMaterial(ae,Ze);let Xe=de.index,nt=1;if(ae.wireframe===!0){if(Xe=se.getWireframeAttribute(de),Xe===void 0)return;nt=2}let _t=de.drawRange,Et=de.attributes.position,$e=_t.start*nt,Pt=(_t.start+_t.count)*nt;Ge!==null&&($e=Math.max($e,Ge.start*nt),Pt=Math.min(Pt,(Ge.start+Ge.count)*nt)),Xe!==null?($e=Math.max($e,0),Pt=Math.min(Pt,Xe.count)):Et!=null&&($e=Math.max($e,0),Pt=Math.min(Pt,Et.count));let sn=Pt-$e;if(sn<0||sn===1/0)return;oe.setup(ce,ae,ke,de,Xe);let Kt,qt=ee;if(Xe!==null&&(Kt=A.get(Xe),qt=ue,qt.setIndex(Kt)),ce.isMesh)ae.wireframe===!0?(Oe.setLineWidth(ae.wireframeLinewidth*dn()),qt.setMode(J.LINES)):qt.setMode(J.TRIANGLES);else if(ce.isLine){let Pn=ae.linewidth;Pn===void 0&&(Pn=1),Oe.setLineWidth(Pn*dn()),ce.isLineSegments?qt.setMode(J.LINES):ce.isLineLoop?qt.setMode(J.LINE_LOOP):qt.setMode(J.LINE_STRIP)}else ce.isPoints?qt.setMode(J.POINTS):ce.isSprite&&qt.setMode(J.TRIANGLES);if(ce.isBatchedMesh)if(Nt.get("WEBGL_multi_draw"))qt.renderMultiDraw(ce._multiDrawStarts,ce._multiDrawCounts,ce._multiDrawCount);else{let Pn=ce._multiDrawStarts,Je=ce._multiDrawCounts,mn=ce._multiDrawCount,Ut=Xe?A.get(Xe).bytesPerElement:1,Ai=it.get(ae).currentProgram.getUniforms();for(let gn=0;gn<mn;gn++)Ai.setValue(J,"_gl_DrawID",gn),qt.render(Pn[gn]/Ut,Je[gn])}else if(ce.isInstancedMesh)qt.renderInstances($e,sn,ce.count);else if(de.isInstancedBufferGeometry){let Pn=de._maxInstanceCount!==void 0?de._maxInstanceCount:1/0,Je=Math.min(de.instanceCount,Pn);qt.renderInstances($e,sn,Je)}else qt.render($e,sn)};function xo(P,X,de,ae){V!==null&&P.isNodeMaterial&&V.setObject(ae,P),xt===!0&&me.setState(P,de,!1),P.transparent===!0&&P.side===Dn&&P.forceSinglePass===!1?(P.side=Yn,P.needsUpdate=!0,Ls(P,X,ae),P.side=Oi,P.needsUpdate=!0,Ls(P,X,ae),P.side=Dn):Ls(P,X,ae)}this.compile=function(P,X,de=null){de===null&&(de=P),V!==null&&V.renderStart(P,X,de),R=fe.get(de),R.init(X),w.push(R),de.traverseVisible(function(ce){ce.isLight&&ce.layers.test(X.layers)&&(R.pushLight(ce),ce.castShadow&&R.pushShadow(ce))}),P!==de&&P.traverseVisible(function(ce){ce.isLight&&ce.layers.test(X.layers)&&(R.pushLight(ce),ce.castShadow&&R.pushShadow(ce))}),R.setupLights(),V!==null&&V.updateLights(R.state.lightsArray),Dt=this.localClippingEnabled,xt=me.init(this.clippingPlanes,Dt),xt===!0&&me.setGlobalState(this.clippingPlanes,X),V!==null&&ve.render(R.state.shadowsArray,de,X);let ae=new Set;return P.traverse(function(ce){if(!(ce.isMesh||ce.isPoints||ce.isLine||ce.isSprite))return;let Ge=ce.material;if(Ge)if(Array.isArray(Ge))for(let Ze=0;Ze<Ge.length;Ze++){let ke=Ge[Ze];xo(ke,de,X,ce),ae.add(ke)}else xo(Ge,de,X,ce),ae.add(Ge)}),R=w.pop(),V!==null&&V.renderEnd(),ae},this.compileAsync=function(P,X,de=null){let ae=this.compile(P,X,de);return new Promise(ce=>{function Ge(){if(ae.forEach(function(Ze){let Xe=it.get(Ze).currentProgram;(Xe===void 0||Xe.isReady())&&ae.delete(Ze)}),ae.size===0){ce(P);return}setTimeout(Ge,10)}Nt.get("KHR_parallel_shader_compile")!==null?Ge():setTimeout(Ge,10)})};let vo=null;function Ha(P){vo&&vo(P)}function Ga(){li.stop()}function Va(){li.start()}let li=new ym;li.setAnimationLoop(Ha),typeof self<"u"&&li.setContext(self),this.setAnimationLoop=function(P){vo=P,Ie.setAnimationLoop(P),P===null?li.stop():li.start()},Ie.addEventListener("sessionstart",Ga),Ie.addEventListener("sessionend",Va),this.render=function(P,X){if(X!==void 0&&X.isCamera!==!0){pt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;V!==null&&V.renderStart(P,X);let de=Ie.enabled===!0&&Ie.isPresenting===!0,ae=z!==null&&(ye===null||de)&&z.begin(I,ye);if(P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),Ie.enabled===!0&&Ie.isPresenting===!0&&(z===null||z.isCompositing()===!1)&&(Ie.cameraAutoUpdate===!0&&Ie.updateCamera(X),X=Ie.getCamera()),P.isScene===!0&&P.onBeforeRender(I,P,X,ye),R=fe.get(P,w.length),R.init(X),R.state.textureUnits=ze.getTextureUnits(),w.push(R),lt.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),X.isArrayCamera?ht.setFromArrayCamera(X):Ye.setFromProjectionMatrix(lt,fi,X.reversedDepth),Dt=this.localClippingEnabled,xt=me.init(this.clippingPlanes,Dt),C=Ce.get(P,b.length),C.init(),b.push(C),this.info.render.frame++,Ie.enabled===!0&&Ie.isPresenting===!0){let Ze=I.xr.getDepthSensingMesh();Ze!==null&&hs(Ze,X,-1/0,I.sortObjects)}hs(P,X,0,I.sortObjects),C.finish(),V!==null&&V.updateLights(R.state.lightsArray),I.sortObjects===!0&&C.sort(_e,Ue),un=Ie.enabled===!1||Ie.isPresenting===!1||Ie.hasDepthSensing()===!1,un&&B.addToRenderList(C,P),this.info.autoReset===!0&&this.info.reset(),xt===!0&&me.beginShadows();let ce=R.state.shadowsArray;if(ve.render(ce,P,X),xt===!0&&me.endShadows(),(ae&&z.hasRenderPass())===!1){let Ze=C.opaque,ke=C.transmissive;if(R.setupLights(),X.isArrayCamera){let Xe=X.cameras;if(ke.length>0)for(let nt=0,_t=Xe.length;nt<_t;nt++){let Et=Xe[nt];Is(Ze,ke,P,Et)}un&&B.render(P);for(let nt=0,_t=Xe.length;nt<_t;nt++){let Et=Xe[nt];Mo(C,P,Et,Et.viewport)}}else ke.length>0&&Is(Ze,ke,P,X),un&&B.render(P),Mo(C,P,X)}ye!==null&&Y===0&&(ze.updateMultisampleRenderTarget(ye),ze.updateRenderTargetMipmap(ye)),ae&&z.end(I),P.isScene===!0&&P.onAfterRender(I,P,X),oe.resetDefaultState(),ie=-1,ge=null,w.pop(),w.length>0?(R=w[w.length-1],ze.setTextureUnits(R.state.textureUnits),xt===!0&&me.setGlobalState(I.clippingPlanes,R.state.camera)):R=null,b.pop(),b.length>0?C=b[b.length-1]:C=null,V!==null&&V.renderEnd()};function hs(P,X,de,ae){if(P.visible===!1)return;if(P.layers.test(X.layers)){if(P.isGroup)de=P.renderOrder;else if(P.isLOD)P.autoUpdate===!0&&P.update(X);else if(P.isLight)R.pushLight(P),P.castShadow&&R.pushShadow(P);else if(P.isSprite){let Ze=X.isArrayCamera?ht:Ye;if(!P.frustumCulled||P.intersectsFrustum(Ze)){ae&&ut.setFromMatrixPosition(P.matrixWorld).applyMatrix4(lt);let ke=Pe.update(P),Xe=P.material;Xe.visible&&C.push(P,ke,Xe,de,ut.z,null,X)}}else if(P.isMesh||P.isLine||P.isPoints){let Ze=X.isArrayCamera?ht:Ye;if(!P.frustumCulled||P.intersectsFrustum(Ze)){let ke=Pe.update(P),Xe=P.material;if(ae&&(P.boundingSphere!==void 0?(P.boundingSphere===null&&P.computeBoundingSphere(),ut.copy(P.boundingSphere.center)):(ke.boundingSphere===null&&ke.computeBoundingSphere(),ut.copy(ke.boundingSphere.center)),ut.applyMatrix4(P.matrixWorld).applyMatrix4(lt)),Array.isArray(Xe)){let nt=ke.groups;for(let _t=0,Et=nt.length;_t<Et;_t++){let $e=nt[_t],Pt=Xe[$e.materialIndex];Pt&&Pt.visible&&C.push(P,ke,Pt,de,ut.z,$e,X)}}else Xe.visible&&C.push(P,ke,Xe,de,ut.z,null,X)}}}let Ge=P.children;for(let Ze=0,ke=Ge.length;Ze<ke;Ze++)hs(Ge[Ze],X,de,ae)}function Mo(P,X,de,ae){let{opaque:ce,transmissive:Ge,transparent:Ze}=P;R.setupLightsView(de),xt===!0&&me.setGlobalState(I.clippingPlanes,de),ae&&Oe.viewport(Te.copy(ae)),ce.length>0&&fr(ce,X,de),Ge.length>0&&fr(Ge,X,de),Ze.length>0&&fr(Ze,X,de),Oe.buffers.depth.setTest(!0),Oe.buffers.depth.setMask(!0),Oe.buffers.color.setMask(!0),Oe.setPolygonOffset(!1)}function Is(P,X,de,ae){if((de.isScene===!0?de.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[ae.id]===void 0){let $e=Nt.has("EXT_color_buffer_half_float")||Nt.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[ae.id]=new si(1,1,{generateMipmaps:!0,type:$e?Ti:jn,minFilter:gi,samples:Math.max(4,Lt.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:At.workingColorSpace})}let Ge=R.state.transmissionRenderTarget[ae.id],Ze=ae.viewport||Te;Ge.setSize(Ze.z*I.transmissionResolutionScale,Ze.w*I.transmissionResolutionScale);let ke=I.getRenderTarget(),Xe=I.getActiveCubeFace(),nt=I.getActiveMipmapLevel();I.setRenderTarget(Ge),I.getClearColor(W),pe=I.getClearAlpha(),pe<1&&I.setClearColor(16777215,.5),I.clear(),un&&B.render(de);let _t=I.toneMapping;I.toneMapping=Fi;let Et=ae.viewport;if(ae.viewport!==void 0&&(ae.viewport=void 0),R.setupLightsView(ae),xt===!0&&me.setGlobalState(I.clippingPlanes,ae),fr(P,de,ae),ze.updateMultisampleRenderTarget(Ge),ze.updateRenderTargetMipmap(Ge),Nt.has("WEBGL_multisampled_render_to_texture")===!1){let $e=!1;for(let Pt=0,sn=X.length;Pt<sn;Pt++){let Kt=X[Pt],{object:qt,geometry:Pn,material:Je,group:mn}=Kt;if(Je.side===Dn&&qt.layers.test(ae.layers)){let Ut=Je.side;Je.side=Yn,Je.needsUpdate=!0,Wa(qt,de,ae,Pn,Je,mn),Je.side=Ut,Je.needsUpdate=!0,$e=!0}}$e===!0&&(ze.updateMultisampleRenderTarget(Ge),ze.updateRenderTargetMipmap(Ge))}I.setRenderTarget(ke,Xe,nt),I.setClearColor(W,pe),Et!==void 0&&(ae.viewport=Et),I.toneMapping=_t}function fr(P,X,de){let ae=X.isScene===!0?X.overrideMaterial:null;for(let ce=0,Ge=P.length;ce<Ge;ce++){let Ze=P[ce],{object:ke,geometry:Xe,group:nt}=Ze,_t=Ze.material;_t.allowOverride===!0&&ae!==null&&(_t=ae),ke.layers.test(de.layers)&&Wa(ke,X,de,Xe,_t,nt)}}function Wa(P,X,de,ae,ce,Ge){V!==null&&ce.isNodeMaterial&&V.setObject(P,ce),P.onBeforeRender(I,X,de,ae,ce,Ge),P.modelViewMatrix.multiplyMatrices(de.matrixWorldInverse,P.matrixWorld),P.normalMatrix.getNormalMatrix(P.modelViewMatrix),ce.onBeforeRender(I,X,de,ae,P,Ge),ce.transparent===!0&&ce.side===Dn&&ce.forceSinglePass===!1?(ce.side=Yn,ce.needsUpdate=!0,I.renderBufferDirect(de,X,ae,ce,P,Ge),ce.side=Oi,ce.needsUpdate=!0,I.renderBufferDirect(de,X,ae,ce,P,Ge),ce.side=Dn):I.renderBufferDirect(de,X,ae,ce,P,Ge),P.onAfterRender(I,X,de,ae,ce,Ge)}function Xa(P){let X=0;for(let de of P)de.texture!==null&&X++;return X}function Ls(P,X,de){X.isScene!==!0&&(X=zt);let ae=it.get(P),ce=R.state.lights,Ge=R.state.shadowsArray,Ze=ce.state.version,ke=he.getParameters(P,ce.state,Ge,X,de,R.state.lightProbeGridArray),Xe=he.getProgramCacheKey(ke),nt=ae.programs;ae.environment=P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial?X.environment:null,ae.fog=X.fog;let _t=P.isMeshStandardMaterial||P.isMeshLambertMaterial&&!P.envMap||P.isMeshPhongMaterial&&!P.envMap;ae.envMap=N.get(P.envMap||ae.environment,_t),ae.envMapRotation=ae.environment!==null&&P.envMap===null?X.environmentRotation:P.envMapRotation,nt===void 0&&(P.addEventListener("dispose",Ht),nt=new Map,ae.programs=nt,ae.programVariants=new Map);let Et=nt.get(Xe);if(Et!==void 0){if(ae.currentProgram===Et&&ae.lightsStateVersion===Ze)return Ya(P,ke),Et}else ke.uniforms=he.getUniforms(P),V!==null&&P.isNodeMaterial&&V.build(P,de,ke),P.onBeforeCompile(ke,I),Et=he.acquireProgram(ke,Xe),nt.set(Xe,Et),ae.uniforms=ke.uniforms;let $e=ae.uniforms;return(!P.isShaderMaterial&&!P.isRawShaderMaterial||P.clipping===!0)&&($e.clippingPlanes=me.uniform),Ya(P,ke),ae.needsLights=So(P),ae.lightsStateVersion=Ze,ae.needsLights&&($e.ambientLightColor.value=ce.state.ambient,$e.lightProbe.value=ce.state.probe,$e.sunLights.value=ce.state.sun,$e.sunLightShadows.value=ce.state.sunShadow,$e.directionalLights.value=ce.state.directional,$e.directionalLightShadows.value=ce.state.directionalShadow,$e.spotLights.value=ce.state.spot,$e.spotLightShadows.value=ce.state.spotShadow,$e.rectAreaLights.value=ce.state.rectArea,$e.ltc_1.value=ce.state.rectAreaLTC1,$e.ltc_2.value=ce.state.rectAreaLTC2,$e.pointLights.value=ce.state.point,$e.pointLightShadows.value=ce.state.pointShadow,$e.hemisphereLights.value=ce.state.hemi,$e.sunShadowMatrix.value=ce.state.sunShadowMatrix,$e.sunShadowCascade.value=ce.state.sunShadowCascade,$e.directionalShadowMatrix.value=ce.state.directionalShadowMatrix,$e.spotLightMatrix.value=ce.state.spotLightMatrix,$e.spotLightMap.value=ce.state.spotLightMap,$e.pointShadowMatrix.value=ce.state.pointShadowMatrix),ae.numLightProbeGrids=Xa(R.state.lightProbeGridArray),ae.currentProgram=Et,ae.uniformsList=null,Et}function fh(P,X,de,ae,ce){let Ge=it.get(P),Ze=Ge.currentProgram.id+","+ae+","+ce,ke=Ge.programVariants.get(Ze);return ke===void 0?(ke=Ls(P,X,de),Ge.programVariants.set(Ze,ke)):(Ge.currentProgram=ke,Ge.uniformsList=null,Ge.outputColorSpace=ae,Ge.toneMapping=ce),ke}function qa(P){if(P.uniformsList===null){let X=P.currentProgram.getUniforms();P.uniformsList=po.seqWithValue(X.seq,P.uniforms)}return P.uniformsList}function Ya(P,X){let de=it.get(P);de.outputColorSpace=X.outputColorSpace,de.batching=X.batching,de.batchingColor=X.batchingColor,de.instancing=X.instancing,de.instancingColor=X.instancingColor,de.instancingMorph=X.instancingMorph,de.skinning=X.skinning,de.morphTargets=X.morphTargets,de.morphNormals=X.morphNormals,de.morphColors=X.morphColors,de.morphTargetsCount=X.morphTargetsCount,de.numClippingPlanes=X.numClippingPlanes,de.numIntersection=X.numClipIntersection,de.vertexAlphas=X.vertexAlphas,de.vertexTangents=X.vertexTangents,de.toneMapping=X.toneMapping}function bo(P,X,de,ae,ce){X.isScene!==!0&&(X=zt),ze.resetTextureUnits();let Ge=X.fog,Ze=ae.isMeshStandardMaterial||ae.isMeshLambertMaterial||ae.isMeshPhongMaterial?X.environment:null,ke=ye===null?I.outputColorSpace:ye.isXRRenderTarget===!0?ye.texture.colorSpace:At.workingColorSpace,Xe=ae.isMeshStandardMaterial||ae.isMeshLambertMaterial&&!ae.envMap||ae.isMeshPhongMaterial&&!ae.envMap,nt=N.get(ae.envMap||Ze,Xe),_t=ae.vertexColors===!0&&!!de.attributes.color&&de.attributes.color.itemSize===4,Et=!!de.attributes.tangent&&(!!ae.normalMap||ae.anisotropy>0),$e=!!de.morphAttributes.position,Pt=!!de.morphAttributes.normal,sn=!!de.morphAttributes.color,Kt=Fi;ae.toneMapped&&(ye===null||ye.isXRRenderTarget===!0)&&(Kt=I.toneMapping);let qt=de.morphAttributes.position||de.morphAttributes.normal||de.morphAttributes.color,Pn=qt!==void 0?qt.length:0,Je=it.get(ae),mn=R.state.lights;if(xt===!0&&(Dt===!0||P!==ge)){let en=P===ge&&ae.id===ie;me.setState(ae,P,en)}let Ut=!1,Ai=!1;ae.version===Je.__version?Je.needsLights&&Je.lightsStateVersion!==mn.state.version||ce.isBatchedMesh&&Je.batching===!1||!ce.isBatchedMesh&&Je.batching===!0||ce.isBatchedMesh&&Je.batchingColor===!0&&ce._colorsTexture===null||ce.isBatchedMesh&&Je.batchingColor===!1&&ce._colorsTexture!==null||ce.isInstancedMesh&&Je.instancing===!1||!ce.isInstancedMesh&&Je.instancing===!0||ce.isSkinnedMesh&&Je.skinning===!1||!ce.isSkinnedMesh&&Je.skinning===!0||ce.isInstancedMesh&&Je.instancingColor===!0&&ce.instanceColor===null||ce.isInstancedMesh&&Je.instancingColor===!1&&ce.instanceColor!==null||ce.isInstancedMesh&&Je.instancingMorph===!0&&ce.morphTexture===null||ce.isInstancedMesh&&Je.instancingMorph===!1&&ce.morphTexture!==null||Je.envMap!==nt||ae.fog===!0&&Je.fog!==Ge||Je.numClippingPlanes!==void 0&&(Je.numClippingPlanes!==me.numPlanes||Je.numIntersection!==me.numIntersection)||Je.vertexAlphas!==_t||Je.vertexTangents!==Et||Je.morphTargets!==$e||Je.morphNormals!==Pt||Je.morphColors!==sn||Je.morphTargetsCount!==Pn||Je.numLightProbeGrids!==Xa(R.state.lightProbeGridArray)?Ut=!0:(Je.outputColorSpace!==ke||Je.toneMapping!==Kt)&&(Ai=!0):(Ut=!0,Je.__version=ae.version);let gn=Je.currentProgram;(Ut===!0||Ai===!0)&&(gn=Ai===!0?fh(ae,X,ce,ke,Kt):Ls(ae,X,ce),V&&ae.isNodeMaterial&&V.onUpdateProgram(ae,gn,Je));let pr=!1,ci=!1,hi=!1,Ot=gn.getUniforms(),vn=Je.uniforms;if(Oe.useProgram(gn.program)&&(pr=!0,ci=!0,hi=!0),ae.id!==ie&&(ie=ae.id,ci=!0),pr||ge!==P){Oe.buffers.depth.getReversed()&&P.reversedDepth!==!0&&(P._reversedDepth=!0,P.updateProjectionMatrix()),Ot.setValue(J,"projectionMatrix",P.projectionMatrix),Ot.setValue(J,"viewMatrix",P.matrixWorldInverse);let Bt=Ot.map.cameraPosition;Bt!==void 0&&Bt.setValue(J,Xt.setFromMatrixPosition(P.matrixWorld)),Lt.logarithmicDepthBuffer&&Ot.setValue(J,"logDepthBufFC",2/(Math.log(P.far+1)/Math.LN2)),(ae.isMeshPhongMaterial||ae.isMeshToonMaterial||ae.isMeshLambertMaterial||ae.isMeshBasicMaterial||ae.isMeshStandardMaterial||ae.isShaderMaterial)&&Ot.setValue(J,"isOrthographic",P.isOrthographicCamera===!0),ge!==P&&(ge=P,ci=!0,hi=!0)}if(Je.needsLights&&(mn.state.sunShadowMap.length>0&&Ot.setValue(J,"sunShadowMap",mn.state.sunShadowMap,ze),mn.state.directionalShadowMap.length>0&&Ot.setValue(J,"directionalShadowMap",mn.state.directionalShadowMap,ze),mn.state.spotShadowMap.length>0&&Ot.setValue(J,"spotShadowMap",mn.state.spotShadowMap,ze),mn.state.pointShadowMap.length>0&&Ot.setValue(J,"pointShadowMap",mn.state.pointShadowMap,ze)),ce.isSkinnedMesh){Ot.setOptional(J,ce,"bindMatrix"),Ot.setOptional(J,ce,"bindMatrixInverse");let en=ce.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),Ot.setValue(J,"boneTexture",en.boneTexture,ze))}ce.isBatchedMesh&&(Ot.setOptional(J,ce,"batchingTexture"),Ot.setValue(J,"batchingTexture",ce._matricesTexture,ze),Ot.setOptional(J,ce,"batchingIdTexture"),Ot.setValue(J,"batchingIdTexture",ce._indirectTexture,ze),Ot.setOptional(J,ce,"batchingColorTexture"),ce._colorsTexture!==null&&Ot.setValue(J,"batchingColorTexture",ce._colorsTexture,ze));let ei=de.morphAttributes;if((ei.position!==void 0||ei.normal!==void 0||ei.color!==void 0)&&be.update(ce,de,gn),(ci||Je.receiveShadow!==ce.receiveShadow)&&(Je.receiveShadow=ce.receiveShadow,Ot.setValue(J,"receiveShadow",ce.receiveShadow)),(ae.isMeshStandardMaterial||ae.isMeshLambertMaterial||ae.isMeshPhongMaterial)&&ae.envMap===null&&X.environment!==null&&(vn.envMapIntensity.value=X.environmentIntensity),vn.dfgLUT!==void 0&&(vn.dfgLUT.value=$M()),ci){if(Ot.setValue(J,"toneMappingExposure",I.toneMappingExposure),Je.needsLights&&ph(vn,hi),Ge&&ae.fog===!0&&re.refreshFogUniforms(vn,Ge),re.refreshMaterialUniforms(vn,ae,Me,Be,R.state.transmissionRenderTarget[P.id]),Je.needsLights&&Je.numLightProbeGrids>0){let en=v,Bt=0;for(let Kn of R.state.lightProbeGridArray)Kn.texture!==null&&(en.textures[Bt]=Kn.texture,en.min[Bt]=Kn.boundingBox.min,en.max[Bt]=Kn.boundingBox.max,en.resolution[Bt]=Kn.resolution,Bt++);for(let Kn in en)en[Kn].length=Bt;vn.probesSH.value=en.textures,vn.probesMin.value=en.min,vn.probesMax.value=en.max,vn.probesResolution.value=en.resolution}po.upload(J,qa(Je),vn,ze)}if(ae.isShaderMaterial&&ae.uniformsNeedUpdate===!0&&(po.upload(J,qa(Je),vn,ze),ae.uniformsNeedUpdate=!1),ae.isSpriteMaterial&&Ot.setValue(J,"center",ce.center),Ot.setValue(J,"modelViewMatrix",ce.modelViewMatrix),Ot.setValue(J,"normalMatrix",ce.normalMatrix),Ot.setValue(J,"modelMatrix",ce.matrixWorld),ae.uniformsGroups!==void 0){let en=ae.uniformsGroups;for(let Bt=0,Kn=en.length;Bt<Kn;Bt++){let us=en[Bt];O.update(us,gn),O.bind(us,gn)}}return gn}function ph(P,X){P.ambientLightColor.needsUpdate=X,P.lightProbe.needsUpdate=X,P.sunLights.needsUpdate=X,P.sunLightShadows.needsUpdate=X,P.directionalLights.needsUpdate=X,P.directionalLightShadows.needsUpdate=X,P.pointLights.needsUpdate=X,P.pointLightShadows.needsUpdate=X,P.spotLights.needsUpdate=X,P.spotLightShadows.needsUpdate=X,P.rectAreaLights.needsUpdate=X,P.hemisphereLights.needsUpdate=X}function So(P){return P.isMeshLambertMaterial||P.isMeshToonMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isShadowMaterial||P.isShaderMaterial&&P.lights===!0}this.getActiveCubeFace=function(){return ne},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return ye},this.setRenderTargetTextures=function(P,X,de){let ae=it.get(P);ae.__autoAllocateDepthBuffer=P.resolveDepthBuffer===!1,ae.__autoAllocateDepthBuffer===!1&&(ae.__useRenderToTexture=!1),it.get(P.texture).__webglTexture=X,it.get(P.depthTexture).__webglTexture=ae.__autoAllocateDepthBuffer?void 0:de,ae.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(P,X){let de=it.get(P);de.__webglFramebuffer=X,de.__useDefaultFramebuffer=X===void 0},this.setRenderTarget=function(P,X=0,de=0){ye=P,ne=X,Y=de;let ae=null,ce=!1,Ge=!1;if(P){let ke=it.get(P);if(ke.__useDefaultFramebuffer!==void 0){Oe.bindFramebuffer(J.FRAMEBUFFER,ke.__webglFramebuffer),Te.copy(P.viewport),De.copy(P.scissor),rt=P.scissorTest,Oe.viewport(Te),Oe.scissor(De),Oe.setScissorTest(rt),ie=-1;return}else if(ke.__webglFramebuffer===void 0)ze.setupRenderTarget(P);else if(ke.__hasExternalTextures)ze.rebindTextures(P,it.get(P.texture).__webglTexture,it.get(P.depthTexture).__webglTexture);else if(P.depthBuffer){let _t=P.depthTexture;if(ke.__boundDepthTexture!==_t){if(_t!==null&&it.has(_t)&&(P.width!==_t.image.width||P.height!==_t.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ze.setupDepthRenderbuffer(P)}}let Xe=P.texture;(Xe.isData3DTexture||Xe.isDataArrayTexture||Xe.isCompressedArrayTexture)&&(Ge=!0);let nt=it.get(P).__webglFramebuffer;P.isWebGLCubeRenderTarget?(Array.isArray(nt[X])?ae=nt[X][de]:ae=nt[X],ce=!0):P.samples>0&&ze.useMultisampledRTT(P)===!1?ae=it.get(P).__webglMultisampledFramebuffer:Array.isArray(nt)?ae=nt[de]:ae=nt,Te.copy(P.viewport),De.copy(P.scissor),rt=P.scissorTest}else Te.copy(Se).multiplyScalar(Me).floor(),De.copy(Fe).multiplyScalar(Me).floor(),rt=tt;if(de!==0&&(ae=G),Oe.bindFramebuffer(J.FRAMEBUFFER,ae)&&Oe.drawBuffers(P,ae),Oe.viewport(Te),Oe.scissor(De),Oe.setScissorTest(rt),ce){let ke=it.get(P.texture);J.framebufferTexture2D(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_CUBE_MAP_POSITIVE_X+X,ke.__webglTexture,de)}else if(Ge){let ke=X;for(let Xe=0;Xe<P.textures.length;Xe++){let nt=it.get(P.textures[Xe]);J.framebufferTextureLayer(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0+Xe,nt.__webglTexture,de,ke)}}else if(P!==null&&de!==0){let ke=it.get(P.texture);J.framebufferTexture2D(J.FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,ke.__webglTexture,de)}ie=-1};function Ka(P){let X=it.get(P);return(X.__readFormat!==P.format||X.__readType!==P.type)&&(X.__readFormat=P.format,X.__readType=P.type,X.__formatReadable=Lt.textureFormatReadable(P.format),X.__typeReadable=Lt.textureTypeReadable(P.type)),X}this.readRenderTargetPixels=function(P,X,de,ae,ce,Ge,Ze,ke=0){if(!(P&&P.isWebGLRenderTarget)){pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Xe=it.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&Ze!==void 0&&(Xe=Xe[Ze],Array.isArray(Xe)&&(Xe=Xe[0])),Xe){Oe.bindFramebuffer(J.FRAMEBUFFER,Xe);try{let nt=P.textures[ke],_t=nt.format,Et=nt.type;P.textures.length>1&&J.readBuffer(J.COLOR_ATTACHMENT0+ke);let $e=Ka(nt);if($e.__formatReadable===!1){pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if($e.__typeReadable===!1){pt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=P.width-ae&&de>=0&&de<=P.height-ce&&J.readPixels(X,de,ae,ce,j.convert(_t),j.convert(Et),Ge)}finally{let nt=ye!==null?it.get(ye).__webglFramebuffer:null;Oe.bindFramebuffer(J.FRAMEBUFFER,nt)}}},this.readRenderTargetPixelsAsync=async function(P,X,de,ae,ce,Ge,Ze,ke=0){if(!(P&&P.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Xe=it.get(P).__webglFramebuffer;if(P.isWebGLCubeRenderTarget&&Ze!==void 0&&(Xe=Xe[Ze],Array.isArray(Xe)&&(Xe=Xe[0])),Xe)if(X>=0&&X<=P.width-ae&&de>=0&&de<=P.height-ce){Oe.bindFramebuffer(J.FRAMEBUFFER,Xe);let nt=P.textures[ke],_t=nt.format,Et=nt.type;P.textures.length>1&&J.readBuffer(J.COLOR_ATTACHMENT0+ke);let $e=Ka(nt);if($e.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if($e.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Pt=J.createBuffer();J.bindBuffer(J.PIXEL_PACK_BUFFER,Pt),J.bufferData(J.PIXEL_PACK_BUFFER,Ge.byteLength,J.STREAM_READ),J.readPixels(X,de,ae,ce,j.convert(_t),j.convert(Et),0),J.bindBuffer(J.PIXEL_PACK_BUFFER,null);let sn=ye!==null?it.get(ye).__webglFramebuffer:null;Oe.bindFramebuffer(J.FRAMEBUFFER,sn);let Kt=J.fenceSync(J.SYNC_GPU_COMMANDS_COMPLETE,0);return J.flush(),await zp(J,Kt,4),J.bindBuffer(J.PIXEL_PACK_BUFFER,Pt),J.getBufferSubData(J.PIXEL_PACK_BUFFER,0,Ge),J.bindBuffer(J.PIXEL_PACK_BUFFER,null),J.deleteBuffer(Pt),J.deleteSync(Kt),Ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(P,X=null,de=0){let ae=Math.pow(2,-de),ce=Math.floor(P.image.width*ae),Ge=Math.floor(P.image.height*ae),Ze=X!==null?X.x:0,ke=X!==null?X.y:0;ze.setTexture2D(P,0),J.copyTexSubImage2D(J.TEXTURE_2D,de,0,0,Ze,ke,ce,Ge),Oe.unbindTexture()},this.copyTextureToTexture=function(P,X,de=null,ae=null,ce=0,Ge=0){let Ze,ke,Xe,nt,_t,Et,$e,Pt,sn,Kt=P.isCompressedTexture?P.mipmaps[Ge]:P.image;if(de!==null)Ze=de.max.x-de.min.x,ke=de.max.y-de.min.y,Xe=de.isBox3?de.max.z-de.min.z:1,nt=de.min.x,_t=de.min.y,Et=de.isBox3?de.min.z:0;else{let Ot=Math.pow(2,-ce);Ze=Math.floor(Kt.width*Ot),ke=Math.floor(Kt.height*Ot),P.isDataArrayTexture?Xe=Kt.depth:P.isData3DTexture?Xe=Math.floor(Kt.depth*Ot):Xe=1,nt=0,_t=0,Et=0}ae!==null?($e=ae.x,Pt=ae.y,sn=ae.z):($e=0,Pt=0,sn=0);let qt=j.convert(X.format),Pn=j.convert(X.type),Je;X.isData3DTexture?(ze.setTexture3D(X,0),Je=J.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(ze.setTexture2DArray(X,0),Je=J.TEXTURE_2D_ARRAY):(ze.setTexture2D(X,0),Je=J.TEXTURE_2D),Oe.activeTexture(J.TEXTURE0),Oe.pixelStorei(J.UNPACK_FLIP_Y_WEBGL,X.flipY),Oe.pixelStorei(J.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),Oe.pixelStorei(J.UNPACK_ALIGNMENT,X.unpackAlignment);let mn=Oe.getParameter(J.UNPACK_ROW_LENGTH),Ut=Oe.getParameter(J.UNPACK_IMAGE_HEIGHT),Ai=Oe.getParameter(J.UNPACK_SKIP_PIXELS),gn=Oe.getParameter(J.UNPACK_SKIP_ROWS),pr=Oe.getParameter(J.UNPACK_SKIP_IMAGES);Oe.pixelStorei(J.UNPACK_ROW_LENGTH,Kt.width),Oe.pixelStorei(J.UNPACK_IMAGE_HEIGHT,Kt.height),Oe.pixelStorei(J.UNPACK_SKIP_PIXELS,nt),Oe.pixelStorei(J.UNPACK_SKIP_ROWS,_t),Oe.pixelStorei(J.UNPACK_SKIP_IMAGES,Et);let ci=P.isDataArrayTexture||P.isData3DTexture,hi=X.isDataArrayTexture||X.isData3DTexture;if(P.isDepthTexture){let Ot=it.get(P),vn=it.get(X),ei=it.get(Ot.__renderTarget),en=it.get(vn.__renderTarget);Oe.bindFramebuffer(J.READ_FRAMEBUFFER,ei.__webglFramebuffer),Oe.bindFramebuffer(J.DRAW_FRAMEBUFFER,en.__webglFramebuffer);for(let Bt=0;Bt<Xe;Bt++)ci&&(J.framebufferTextureLayer(J.READ_FRAMEBUFFER,J.COLOR_ATTACHMENT0,it.get(P).__webglTexture,ce,Et+Bt),J.framebufferTextureLayer(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0,it.get(X).__webglTexture,Ge,sn+Bt)),J.blitFramebuffer(nt,_t,nt+Ze,_t+ke,$e,Pt,$e+Ze,Pt+ke,J.DEPTH_BUFFER_BIT,J.NEAREST);Oe.bindFramebuffer(J.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(J.DRAW_FRAMEBUFFER,null)}else if(ce!==0||P.isRenderTargetTexture||it.has(P)){let Ot=it.get(P),vn=it.get(X);Oe.bindFramebuffer(J.READ_FRAMEBUFFER,U),Oe.bindFramebuffer(J.DRAW_FRAMEBUFFER,$);for(let ei=0;ei<Xe;ei++)ci?J.framebufferTextureLayer(J.READ_FRAMEBUFFER,J.COLOR_ATTACHMENT0,Ot.__webglTexture,ce,Et+ei):J.framebufferTexture2D(J.READ_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,Ot.__webglTexture,ce),hi?J.framebufferTextureLayer(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0,vn.__webglTexture,Ge,sn+ei):J.framebufferTexture2D(J.DRAW_FRAMEBUFFER,J.COLOR_ATTACHMENT0,J.TEXTURE_2D,vn.__webglTexture,Ge),ce!==0?J.blitFramebuffer(nt,_t,nt+Ze,_t+ke,$e,Pt,$e+Ze,Pt+ke,J.COLOR_BUFFER_BIT,J.NEAREST):hi?J.copyTexSubImage3D(Je,Ge,$e,Pt,sn+ei,nt,_t,Ze,ke):J.copyTexSubImage2D(Je,Ge,$e,Pt,nt,_t,Ze,ke);Oe.bindFramebuffer(J.READ_FRAMEBUFFER,null),Oe.bindFramebuffer(J.DRAW_FRAMEBUFFER,null)}else hi?P.isDataTexture||P.isData3DTexture?J.texSubImage3D(Je,Ge,$e,Pt,sn,Ze,ke,Xe,qt,Pn,Kt.data):X.isCompressedArrayTexture?J.compressedTexSubImage3D(Je,Ge,$e,Pt,sn,Ze,ke,Xe,qt,Kt.data):J.texSubImage3D(Je,Ge,$e,Pt,sn,Ze,ke,Xe,qt,Pn,Kt):P.isDataTexture?J.texSubImage2D(J.TEXTURE_2D,Ge,$e,Pt,Ze,ke,qt,Pn,Kt.data):P.isCompressedTexture?J.compressedTexSubImage2D(J.TEXTURE_2D,Ge,$e,Pt,Kt.width,Kt.height,qt,Kt.data):J.texSubImage2D(J.TEXTURE_2D,Ge,$e,Pt,Ze,ke,qt,Pn,Kt);Oe.pixelStorei(J.UNPACK_ROW_LENGTH,mn),Oe.pixelStorei(J.UNPACK_IMAGE_HEIGHT,Ut),Oe.pixelStorei(J.UNPACK_SKIP_PIXELS,Ai),Oe.pixelStorei(J.UNPACK_SKIP_ROWS,gn),Oe.pixelStorei(J.UNPACK_SKIP_IMAGES,pr),Ge===0&&X.generateMipmaps===!0&&X.mipmapsAutoUpdate===!0&&J.generateMipmap(Je),Oe.unbindTexture()},this.initRenderTarget=function(P){it.get(P).__webglFramebuffer===void 0&&ze.setupRenderTarget(P)},this.initTexture=function(P){P.isCubeTexture?ze.setTextureCube(P,0):P.isData3DTexture?ze.setTexture3D(P,0):P.isDataArrayTexture||P.isCompressedArrayTexture?ze.setTexture2DArray(P,0):ze.setTexture2D(P,0),Oe.unbindTexture()},this.resetState=function(){ne=0,Y=0,ye=null,Oe.reset(),oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=At._getDrawingBufferColorSpace(e),t.unpackColorSpace=At._getUnpackColorSpace()}};var Cm={type:"change"},ed={type:"start"},Im={type:"end"},nh=new Pi,Pm=new Gn,JM=Math.cos(70*an.DEG2RAD),Rn=new D,Qn=2*Math.PI,Wt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Qu=1e-6,ih=class extends ba{constructor(e,t=null){super(e,t),this.state=Wt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ts.ROTATE,MIDDLE:Ts.DOLLY,RIGHT:Ts.PAN},this.touches={ONE:ws.ROTATE,TWO:ws.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new En,this._lastTargetPosition=new D,this._quat=new En().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new ao,this._sphericalDelta=new ao,this._scale=1,this._panOffset=new D,this._rotateStart=new Ee,this._rotateEnd=new Ee,this._rotateDelta=new Ee,this._panStart=new Ee,this._panEnd=new Ee,this._panDelta=new Ee,this._dollyStart=new Ee,this._dollyEnd=new Ee,this._dollyDelta=new Ee,this._dollyDirection=new D,this._mouse=new Ee,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=QM.bind(this),this._onPointerDown=jM.bind(this),this._onPointerUp=eb.bind(this),this._onContextMenu=ab.bind(this),this._onMouseWheel=ib.bind(this),this._onKeyDown=sb.bind(this),this._onTouchStart=rb.bind(this),this._onTouchMove=ob.bind(this),this._onMouseDown=tb.bind(this),this._onMouseMove=nb.bind(this),this._interceptControlDown=lb.bind(this),this._interceptControlUp=cb.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Wt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Cm),this.update(),this.state=Wt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Rn.copy(t).sub(this.target),Rn.applyQuaternion(this._quat),this._spherical.setFromVector3(Rn),this.autoRotate&&this.state===Wt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,i=this.maxAzimuthAngle;isFinite(n)&&isFinite(i)&&(n<-Math.PI?n+=Qn:n>Math.PI&&(n-=Qn),i<-Math.PI?i+=Qn:i>Math.PI&&(i-=Qn),n<=i?this._spherical.theta=Math.max(n,Math.min(i,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+i)/2?Math.max(n,this._spherical.theta):Math.min(i,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Rn.setFromSpherical(this._spherical),Rn.applyQuaternion(this._quatInverse),t.copy(this.target).add(Rn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Rn.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Rn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(nh.origin.copy(this.object.position),nh.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(nh.direction))<JM?this.object.lookAt(this.target):(Pm.setFromNormalAndCoplanarPoint(this.object.up,this.target),nh.intersectPlane(Pm,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Qu||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Qu||this._lastTargetPosition.distanceToSquared(this.target)>Qu?(this.dispatchEvent(Cm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Qn/60*this.autoRotateSpeed*e:Qn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Rn.setFromMatrixColumn(t,0),Rn.multiplyScalar(-e),this._panOffset.add(Rn)}_panUp(e,t){this.screenSpacePanning===!0?Rn.setFromMatrixColumn(t,1):(Rn.setFromMatrixColumn(t,0),Rn.crossVectors(this.object.up,Rn)),Rn.multiplyScalar(e),this._panOffset.add(Rn)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let i=this.object.position;Rn.copy(i).sub(this.target);let r=Rn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),i=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=i/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._rotateStart.set(n,i)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panStart.set(n,i)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(i,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panEnd.set(n,i)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ee,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function jM(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function QM(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function eb(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Im),this.state=Wt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function tb(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ts.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=Wt.DOLLY;break;case Ts.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Wt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Wt.ROTATE}break;case Ts.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Wt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Wt.PAN}break;default:this.state=Wt.NONE}this.state!==Wt.NONE&&this.dispatchEvent(ed)}function nb(s){switch(this.state){case Wt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case Wt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case Wt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function ib(s){this.enabled===!1||this.enableZoom===!1||this.state!==Wt.NONE||(s.preventDefault(),this.dispatchEvent(ed),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(Im))}function sb(s){this.enabled!==!1&&this._handleKeyDown(s)}function rb(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case ws.ROTATE:if(this.enableRotate===!1){this.state=Wt.NONE;break}this._handleTouchStartRotate(s),this.state=Wt.TOUCH_ROTATE;break;case ws.PAN:if(this.enablePan===!1){this.state=Wt.NONE;break}this._handleTouchStartPan(s),this.state=Wt.TOUCH_PAN;break;default:this.state=Wt.NONE}break;case 2:switch(this.touches.TWO){case ws.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=Wt.TOUCH_DOLLY_PAN;break;case ws.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=Wt.TOUCH_DOLLY_ROTATE;break;default:this.state=Wt.NONE}break;default:this.state=Wt.NONE}this.state!==Wt.NONE&&this.dispatchEvent(ed)}function ob(s){switch(this._trackPointer(s),this.state){case Wt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case Wt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case Wt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case Wt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=Wt.NONE}}function ab(s){this.enabled!==!1&&s.preventDefault()}function lb(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function cb(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Lm(s,e=[]){return e.find(t=>t.id===s.id)||e.find(t=>t.kind===s.kind&&t.x===s.x&&t.y===s.y)}function td(s,e,t){return e>=s.x&&t>=s.y&&e<s.x+(s.width||1)&&t<s.y+(s.depth||1)}var hb=20,Ua=36,ub=1800,db=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","slash","arrow","firebolt","magic_missile","heal","generic","sorcerous_burst","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),Dm=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","generic","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),fb=new Set(["scorching_ray","ray_of_frost","chromatic_orb","dragons_breath","acid_splash","shatter","thunderwave","burning_hands","divine_spark","guiding_bolt","sacred_flame","generic","sorcerous_burst"]),pb=new Set(["dragons_breath","acid_splash","shatter","thunderwave","burning_hands","preserve_life","turn_undead","magic_missile","scorching_ray"]),nn={},mb={slash:"#fff0c1",arrow:"#f4dcb0",firebolt:"#ff842e",magic_missile:"#80eeff",heal:"#86f3ac",generic:"#e8e0c8",rotting_fist:"#d8b46a",dreadful_glare:"#ffbe3d",sorcerous_burst:"#c9a0ff",life_drain:"#9be07a",turn_undead:"#ffe9a0",touch:"#ffffff",necrotic:"#7d3fb8",draining_swipe:"#c9b8e8",undead:"#9bbf5a",command:"#e8d9a8",buff:"#ffffff",spiritual_weapon:"#bfe0ff",scorching_ray:"#ff842e",ray_of_frost:"#9fdcff",chromatic_orb:"#c9a0ff",dragons_breath:"#ff9a3c",acid_splash:"#b6f06a",shatter:"#c7b6ff",thunderwave:"#c7b6ff",burning_hands:"#ff842e",preserve_life:"#ffe7a3",healing_word:"#c9ffd9",cure_wounds:"#bfffd0",divine_spark:"#ffe9a0",guiding_bolt:"#fff2a8",sacred_flame:"#fff2a8"},Um={fire:"#ff842e",cold:"#9fdcff",lightning:"#fff08a",thunder:"#c7b6ff",acid:"#b6f06a",poison:"#8fd36a",necrotic:"#a07cd8",radiant:"#fff2a8",force:"#b9a4ff",psychic:"#ff9fe0",slashing:"#fff0c1",piercing:"#f4dcb0",bludgeoning:"#e8d8c0"},Nm=new D(0,0,1),Qe=an.clamp;nn.sacred_flame=s=>{let{group:e,mat:t,mesh:n,geo:i,color:r,target:o,releaseAt:a,impactAt:l}=s,c=new We;c.name="sacred-flame-column",e.add(c),c.position.set(o.x,0,o.z);let d=n(c,i.cylinder,t("#fff8d0",.85,!0),0,1.7,0,.12,3.4,.12);d.name="flame-core",n(c,i.cylinder,t(r,.32,!0),0,1.7,0,.3,3.4,.3).name="flame-glow";let f=[];for(let h=0;h<6;h++){let u=h*Math.PI/3,g=n(c,i.cone,t("#ffd877",.7,!0),Math.cos(u)*.2,.45,Math.sin(u)*.2,.09,.8,.09);g.name="flame-petal",g.userData.phase=u,f.push(g)}return(h,{elapsedImpact:u})=>{let g=Qe((h-a)/Math.max(1,l-a),0,1);c.visible=h>=a&&u<520,c.position.y=(1-g)*(1-g)*3.4-.05;let _=u>0?1+Math.min(u/120,1)*.8-Qe((u-150)/370,0,1)*1.6:1;c.scale.set(Math.max(.05,_),1,Math.max(.05,_)),f.forEach(p=>{p.scale.y=.8+.35*Math.sin(h*.03+p.userData.phase*3)})}};nn.guiding_bolt=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,impact:d}=s,f=new We;f.name="guiding-comet",e.add(f),n(f,i.sphere,t("#ffffff"),0,0,0,.15).name="comet-head",n(f,i.sphere,t(a,.55,!0),0,0,0,.3).name="comet-glow";let h=[];for(let m=0;m<8;m++){let y=n(e,i.sphere,t(m%2?"#ffe9a0":"#fff6cf",.7-m*.07,!0),0,0,0,.13-m*.012);y.name="comet-tail",h.push(y)}let u=new We;u.name="guiding-mark",d.add(u);let g=n(u,s.own(new It(.42,.03,6,32)),t("#ffd75e",.95,!0),0,-.55,0);g.rotation.x=-Math.PI/2;let _=n(u,s.own(new Ln(1)),t("#ffe27a",.95,!0),0,1.05,0,.1,.18,.1),p=m=>{let y=new D().lerpVectors(r,o,Qe(m,0,1));return y.y+=Math.sin(Qe(m,0,1)*Math.PI)*.35,y};return(m,{elapsedImpact:y})=>{let M=(m-l)/Math.max(1,c-l);f.visible=M>=0&&M<1,f.position.copy(p(M)),f.children[1].scale.setScalar(.3+.05*Math.sin(m*.05)),h.forEach((v,C)=>{v.visible=M>=0&&M<1.15,v.position.copy(p(M-(C+1)*.045))}),g.rotation.z=y*.004,_.rotation.y=y*.006,_.position.y=1.05+.06*Math.sin(y*.008)}};nn.divine_spark=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,direction:a,color:l,event:c,releaseAt:d,impactAt:f,span:h}=s,u=1+Qe((2.5-h)/2.5,0,1),_=c.outcome==="heal"?"#9bffb8":l,p=n(e,i.cylinder,t(_,.7,!0),0,0,0,.07,.01,.07);p.name="spark-beam";let m=n(e,i.cylinder,t("#ffffff",.9,!0),0,0,0,.025,.01,.025);m.name="spark-core",p.quaternion.setFromUnitVectors(new D(0,1,0),a),m.quaternion.copy(p.quaternion);let y=new D().crossVectors(a,new D(0,1,0)).normalize(),M=new D().crossVectors(y,a).normalize(),v=[];for(let b=0;b<9;b++){let w=n(e,i.sphere,t(b%2?"#ffffff":_,.9,!0),0,0,0,.055);w.name="spark-helix",w.userData.phase=b/9,v.push(w)}let C=n(e,i.sphere,t(_,.6,!0),r.x,r.y,r.z,.22);C.name="spark-source";let R=new D;return(b,{phase:w})=>{let z=Qe((b-d)/Math.max(1,f-d),0,1),I=b>=d;for(let V of[p,m,C])V.visible=I;let H=Math.max(.01,h*z);for(let V of[p,m])V.scale.y=H,V.position.copy(r).addScaledVector(a,H/2);p.scale.x=p.scale.z=.07*u*(1+.25*Math.sin(b*.04))*(1-w*.8),C.scale.setScalar(.22*u*(1+.3*Math.sin(b*.05))*(1-w*.7)),v.forEach(V=>{let G=((b-d)/600+V.userData.phase)%1;V.visible=I&&G*h<=H;let U=G*9+b*.012+V.userData.phase*6,$=.2*u*Math.sin(Math.PI*G);R.copy(r).addScaledVector(a,G*h).addScaledVector(y,Math.cos(U)*$).addScaledVector(M,Math.sin(U)*$),V.position.copy(R)})}};nn.cure_wounds=s=>{let{group:e,mat:t,mesh:n,geo:i,target:r,impactAt:o}=s,a=1+.8*Qe((2.5-s.span)/2.5,0,1),l=new We;l.name="cure-aura",e.add(l),l.position.set(r.x,0,r.z),n(l,i.cylinder,t("#bfffd0",.28,!0),0,.9,0,.42,1.8,.42).name="cure-pillar";let c=[];for(let d=0;d<3;d++){let f=new We;f.name="cure-cross",l.add(f),n(f,i.box,t("#f2ffd8",.95,!0),0,0,0,.14,.04,.04),n(f,i.box,t("#f2ffd8",.95,!0),0,0,0,.04,.14,.04),f.userData.phase=d*2.1,c.push(f)}return d=>{let f=d-o+400;l.visible=f>=0;let h=Qe(f/1100,0,1);l.children[0].scale.set(.42*a*(.6+h*.4),1.8*a,.42*a*(.6+h*.4)),c.forEach(u=>{let g=f*.005+u.userData.phase;u.position.set(Math.cos(g)*.38*a,.15+h*1.4*a*((u.userData.phase/2.1+1)/3),Math.sin(g)*.38*a),u.scale.setScalar(a),u.rotation.y=-g})}};nn.healing_word=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,own:c}=s,d=Qe((2.5-s.span)/2.5,0,1),f=1+d,h=[];for(let p=0;p<12;p++){let m=n(e,i.sphere,t(p%3?"#c9ffd9":"#ffffff",.9,!0),0,0,0,.06*f);m.name="word-mote",m.userData.phase=p/12,h.push(m)}let u=c(new It(1,.025,6,40)),g=[0,1].map(p=>{let m=n(e,u,t("#dfffe8",.8,!0),r.x,r.y,r.z,.2);return m.name="word-ring",m.userData.delay=p*160,m}),_=new D;return p=>{let m=Qe((p-a)/Math.max(1,l-a),0,1.2);h.forEach(y=>{let M=Qe(m-y.userData.phase*.35,0,1);y.visible=p>=a&&M>0&&M<1,_.lerpVectors(r,o,M),_.y+=Math.sin(M*Math.PI)*(.55+d*.9)+.08*Math.sin(p*.02+y.userData.phase*9),y.position.copy(_)}),g.forEach(y=>{let M=Qe((p-a-y.userData.delay)/500,0,1);y.visible=M>0&&M<1,y.rotation.x=Math.PI/2,y.scale.setScalar((.2+M*.8)*f)})}};nn.preserve_life=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,first:c,own:d}=s,f=[];for(let g=0;g<10;g++){let _=n(e,i.sphere,t(g%2?"#ffe7a3":"#fff9e0",.9,!0),0,0,0,.07);_.name="preserve-mote",_.userData.phase=g/10,f.push(_)}let h=null;if(c){h=new We,h.name="preserve-seal",e.add(h),h.position.set(r.x,.1,r.z);let g=d(new It(1,.03,6,48)),_=n(h,g,t("#ffe7a3",.9,!0),0,0,0);_.rotation.x=-Math.PI/2;let p=n(h,g,t("#fff4cf",.9,!0),0,.01,0,.55,.55,.55);p.rotation.x=-Math.PI/2;for(let m=0;m<6;m++){let y=n(h,i.box,t("#fff4cf",.85,!0),0,.02,0,.03,.01,1.1);y.rotation.y=m*Math.PI/6}}let u=new D;return g=>{let _=Qe((g-a)/Math.max(1,l-a),0,1.3);if(h){let p=Qe((g-a+150)/900,0,1);h.visible=p>0&&p<1,h.scale.setScalar(1.1+p*1.1),h.rotation.y=g*.004}f.forEach(p=>{let m=Qe(_-p.userData.phase*.4,0,1);p.visible=g>=a&&m>0&&m<1,u.lerpVectors(r,o,m),u.y+=Math.sin(m*Math.PI)*.45+.1*Math.sin(g*.015+p.userData.phase*12),p.position.copy(u)})}};function Om(s,e){let{group:t,mat:n,mesh:i,geo:r,source:o,area:a,releaseAt:l}=s;if(!a)return null;let c=a.cells.map(([f,h])=>{let u=new We;return u.name=e.name,u.position.set(f,0,h),t.add(u),i(u,r.cone,n(e.edge,.75,!0),0,e.height/2,0,e.width,e.height,e.width),i(u,r.cone,n(e.core,.9,!0),0,e.height*.35,0,e.width*.55,e.height*.7,e.width*.55),{g:u,d:Math.hypot(f-o.x,h-o.z),seed:Math.abs(Math.sin(f*12.9898+h*78.233)*43758.5453)%1}}),d=i(t,r.sphere,n(e.core,.8,!0),o.x,o.y,o.z,.22);return d.name=e.name+"-hand",f=>{for(let h of c){let u=l+h.d*e.speed,g=Qe((f-u)/260,0,1),_=Qe((f-u-e.burn)/320,0,1);h.g.visible=g>0&&_<1;let p=g*(1-_),m=1+.25*Math.sin(f*.03+h.seed*20);h.g.scale.set(p,p*m,p),h.g.rotation.y=f*.002+h.seed*6}d.visible=f>=l-100&&f<l+450,d.scale.setScalar(.22*(1+.3*Math.sin(f*.06)))}}nn.burning_hands=s=>Om(s,{name:"burning-flame",edge:"#ff8a2a",core:"#ffe27a",height:.95,width:.3,speed:55,burn:300});nn.thunderwave=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,direction:a,color:l,event:c,area:d,releaseAt:f}=s,h=[];if(d){let u=d.aim[0]-o.x,g=d.aim[1]-o.z,_=Math.abs(u)>=Math.abs(g)?new D(Math.sign(u)||1,0,0):new D(0,0,Math.sign(g)||1),p=d.cells.map(([M,v])=>{let C=i(e,r.box,n("#c7b6ff",0,!0),M,.07,v,.92,.05,.92);return C.name="thunder-tile",{item:C,d:Math.abs((M-o.x)*_.x+(v-o.z)*_.z)}}),m=i(e,r.box,n("#ffffff",.85,!0),0,.5,0,_.x?.12:3,1,_.x?3:.12);m.name="thunder-front";let y=i(e,s.own(new It(1,.03,6,40)),n("#e9e0ff",.8,!0),o.x,.12,o.z,.3,.3,.3);y.name="thunder-ring",y.rotation.x=-Math.PI/2,h.push(M=>{let v=Qe((M-f)/450,0,1);m.visible=v>0&&v<1,m.position.set(o.x+_.x*(.6+v*3),.5,o.z+_.z*(.6+v*3)),m.material.opacity=.85*(1-v*.7),y.visible=v>0&&v<1,y.scale.setScalar(.3+v*2.2),y.material.opacity=.8*(1-v);for(let{item:C,d:R}of p){let b=Qe((M-f-R*120)/520,0,1);C.visible=b>0&&b<1,C.material.opacity=Math.sin(b*Math.PI)*.55}})}if(c.outcome==="hit"){let u=new We;u.name="thunder-push",t.add(u);let g=a.clone();g.y=0,g.normalize();for(let _=0;_<3;_++){let p=i(u,r.cone,n("#e9e0ff",.9,!0),0,.45,0,.16,.3,.1);p.name="thunder-chevron",p.quaternion.setFromUnitVectors(new D(0,1,0),g),p.userData.i=_}h.push((_,{elapsedImpact:p})=>{u.children.forEach(m=>{let y=Qe(p/600-m.userData.i*.18,0,1);m.position.set(g.x*(.3+y*.9),.4+m.userData.i*.08,g.z*(.3+y*.9)),m.visible=p>0&&y<1})})}return h.length?(u,g)=>h.forEach(_=>_(u,g)):null};nn.shatter=s=>{let{group:e,mat:t,mesh:n,geo:i,area:r,releaseAt:o,impactAt:a,own:l}=s;if(!r)return null;let[c,d]=r.aim,f=Math.max(...r.cells.map(([M,v])=>Math.hypot(M-c,v-d)))+.6,h=new We;h.name="shatter-burst",h.position.set(c,0,d),e.add(h);let u=l(new It(1,.035,6,48)),g=n(h,u,t("#e1d8ff",.9,!0),0,.12,0);g.rotation.x=-Math.PI/2,g.name="shatter-wave";let _=n(h,i.sphere,t("#c7b6ff",.22,!0),0,0,0);_.name="shatter-dome";let p=[];for(let M=0;M<9;M++){let v=M*Math.PI*2/9+.2,C=n(h,i.box,t("#f4f0ff",.9,!0),0,.08,0,.04,.02,1);C.name="shatter-crack",C.userData={a:v,len:f*(.7+.3*Math.abs(Math.sin(M*2.3)))},p.push(C)}let m=l(new Ln(1)),y=[];for(let M=0;M<14;M++){let v=M*2.4,C=n(h,m,t(M%2?"#ffffff":"#c7b6ff",.9,!0),0,0,0,.06,.12,.04);C.name="shatter-shard",C.userData={vx:Math.cos(v)*(.5+M%4*.3),vz:Math.sin(v)*(.5+M%4*.3),vy:2.2+M%3*.8},y.push(C)}return M=>{let v=Qe((M-o)/520,0,1),C=Math.max(0,M-o);g.visible=_.visible=v>0&&v<1,g.scale.setScalar(.2+v*f),g.material.opacity=.9*(1-v),_.scale.setScalar(.2+v*f),_.scale.y*=.55,_.material.opacity=.22*(1-v);for(let R of p){let b=R.userData.len*Qe(v*1.6,0,1);R.visible=C>0,R.scale.z=Math.max(.01,b),R.rotation.y=Math.PI/2-R.userData.a,R.position.set(Math.cos(R.userData.a)*b/2,.08,Math.sin(R.userData.a)*b/2)}for(let R of y){let b=C/1e3,{vx:w,vz:z,vy:I}=R.userData;R.visible=C>0&&b<.9,R.position.set(w*b,Math.max(0,I*b-4.2*b*b),z*b),R.rotation.set(b*9,b*7,0)}}};nn.acid_splash=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,area:o,releaseAt:a,impactAt:l,own:c}=s;if(!o)return null;let[d,f]=o.aim,h=new D(d,.3,f),u=new We;u.name="acid-glob",e.add(u),n(u,i.sphere,t("#9be03c",.9),0,0,0,.17).name="acid-core",n(u,i.sphere,t("#d6ff7a",.45,!0),0,0,0,.3);let g=n(e,c(new $r(1,28)),t("#8fd62e",.7),d,.075,f,.1,.1,.1);g.rotation.x=-Math.PI/2,g.name="acid-puddle";let _=[];for(let y=0;y<12;y++){let M=y*2.4,v=n(e,i.sphere,t(y%2?"#b6f06a":"#e6ffaa",.9),d,.2,f,.06);v.name="acid-drop",v.userData={vx:Math.cos(M)*(.6+y%4*.3),vz:Math.sin(M)*(.6+y%4*.3),vy:1.8+y%3*.5},_.push(v)}let p=[];for(let y=0;y<6;y++){let M=n(e,i.sphere,t("#d6ff7a",.6,!0),d+Math.cos(y*2.1)*.5,.1,f+Math.sin(y*2.1)*.5,.07);M.name="acid-bubble",M.userData.phase=y,p.push(M)}let m=new D;return y=>{let M=Qe((y-a)/Math.max(1,l-a),0,1),v=y-l;u.visible=y>=a&&M<1,m.lerpVectors(r,h,M),m.y+=Math.sin(M*Math.PI)*.8,u.position.copy(m);let C=Qe(v/350,0,1);g.visible=v>=0,g.scale.setScalar(.1+C*1.5);for(let R of _){let b=v/1e3,{vx:w,vz:z,vy:I}=R.userData;R.visible=v>=0&&b<.7,R.position.set(d+w*b,Math.max(.08,.2+I*b-4.4*b*b),f+z*b)}for(let R of p){let b=Qe((v-200-R.userData.phase*90)/600,0,1);R.visible=b>0&&b<1,R.position.y=.1+b*.6,R.scale.setScalar(.07*(1+b*.8))}}};nn.dragons_breath=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,own:a,impactAt:l}=s;if(e.text){let d="#ffb347",f=new We;f.name="breath-scales",t.add(f),f.position.set(o.x,0,o.z);let h=a(new Ln(1)),u=[];for(let g=0;g<10;g++){let _=i(f,h,n(g%2?d:"#fff0c8",.9,!0),0,.2,0,.07,.11,.03);_.name="breath-scale",_.userData.phase=g/10*Math.PI*2,u.push(_)}return i(f,r.cylinder,n(d,.22,!0),0,.8,0,.5,1.6,.5).name="breath-glow",g=>{let _=Qe((g-l+300)/1200,0,1);f.visible=_>0&&_<1,u.forEach(p=>{let m=p.userData.phase+g*.006,y=(_*1.4+p.userData.phase/8)%1.5;p.position.set(Math.cos(m)*.45,.1+y,Math.sin(m)*.45),p.rotation.y=-m})}}let c=Um[e.damage_type]||"#ff9a3c";return Om(s,{name:"breath-flame",edge:c,core:"#fff4d8",height:1.25,width:.4,speed:45,burn:380})};var nd=s=>[[0,.62,-.62,.62,-.62][s%5],1.08+s%5*.4];nn.chromatic_orb=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,own:d}=s,f=new We;f.name="chromatic-orb",e.add(f),n(f,i.sphere,t("#ffffff"),0,0,0,.14).name="orb-core",n(f,i.sphere,t(a,.6,!0),0,0,0,.3).name="orb-shell";let h=d(new It(1,.05,6,28)),u=n(f,h,t("#ffffff",.9,!0),0,0,0,.36);u.name="orb-ring";let g=n(f,h,t(a,.9,!0),0,0,0,.36);g.name="orb-ring";let _=[];for(let m=0;m<7;m++){let y=n(e,i.sphere,t(a,.65-m*.08,!0),0,0,0,.16-m*.017);y.name="orb-tail",_.push(y)}let p=m=>{let y=new D().lerpVectors(r,o,Qe(m,0,1));return y.y+=Math.sin(Qe(m,0,1)*Math.PI)*.3,y};return m=>{let y=(m-l)/Math.max(1,c-l);f.visible=y>=0&&y<1,f.position.copy(p(y)),u.rotation.set(m*.012,m*.007,0),g.rotation.set(m*-.009,0,m*.011),_.forEach((M,v)=>{M.visible=y>=0&&y<1.12,M.position.copy(p(y-(v+1)*.05))})}};nn.ray_of_frost=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:d,impactAt:f,span:h,own:u}=s,g=i(e,r.cylinder,n("#8fd8ff",.7,!0),0,0,0,.06,.01,.06);g.name="frost-beam";let _=i(e,r.cylinder,n("#ffffff",.95,!0),0,0,0,.022,.01,.022);g.quaternion.setFromUnitVectors(new D(0,1,0),l),_.quaternion.copy(g.quaternion);let p=u(new Ln(1)),m=[];for(let M=0;M<10;M++){let v=i(e,p,n(M%2?"#e6f7ff":"#9fdcff",.9,!0),0,0,0,.045,.1,.045);v.name="frost-shard",v.userData.phase=M/10,m.push(v)}let y=[];if(c.outcome==="hit")for(let M=0;M<7;M++){let v=M*Math.PI*2/7,C=i(t,r.cone,n("#c9eeff",.85,!0),Math.cos(v)*.4,-.6,Math.sin(v)*.4,.07,.45,.07);C.name="frost-crystal",C.userData.a=v,C.rotation.z=Math.cos(v)*.3,C.rotation.x=Math.sin(v)*.3,y.push(C)}return(M,{elapsedImpact:v})=>{let C=Qe((M-d)/Math.max(1,f-d),0,1),R=Math.max(.01,h*C),b=M>=d;for(let w of[g,_])w.visible=b,w.scale.y=R,w.position.copy(o).addScaledVector(l,R/2);g.scale.x=g.scale.z=.06*(1+.3*Math.sin(M*.05)),m.forEach(w=>{let z=((M-d)/450+w.userData.phase)%1;w.visible=b&&z*h<=R,w.position.copy(o).addScaledVector(l,z*h),w.position.y+=Math.sin(z*9+w.userData.phase*20)*.12,w.rotation.set(z*8,z*5,0)}),y.forEach(w=>{let z=Qe(v/220,0,1);w.scale.set(.07*z,.45*z,.07*z),w.position.y=-.6+.22*z})}};nn.scorching_ray=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,lane:c,releaseAt:d,impactAt:f,span:h,own:u}=s,g=new D().crossVectors(l,new D(0,1,0)).normalize(),_=o.clone().addScaledVector(g,(c-1)*.18);_.y+=c*.06;let p=new We;p.name="scorch-lance",e.add(p);let m=i(p,r.cylinder,n("#ff7a1c",.9,!0),0,0,0,.07,.8,.07);m.rotation.x=Math.PI/2;let y=i(p,r.cylinder,n("#fff4c2",1,!0),0,0,0,.032,.8,.032);y.rotation.x=Math.PI/2;let M=i(p,r.sphere,n("#fff0a0",.9,!0),0,0,.4,.12);p.quaternion.setFromUnitVectors(new D(0,0,1),a.clone().sub(_).normalize());let v=[];for(let b=0;b<8;b++){let w=i(e,r.sphere,n(b%2?"#ffb347":"#ff6a1a",.8,!0),0,0,0,.05);w.name="scorch-spark",w.userData.phase=b,v.push(w)}let C=i(t,u(new $r(1,20)),n("#2a1a10",.7),0,-.84,0,.45,.45,.45);C.rotation.x=-Math.PI/2,C.name="scorch-mark";let R=new D;return(b,{elapsedImpact:w})=>{let z=Qe((b-d)/Math.max(1,f-d),0,1);p.visible=b>=d&&z<1,p.position.lerpVectors(_,a,z),v.forEach(I=>{let H=Qe(z-(I.userData.phase+1)*.04,0,1);I.visible=b>=d&&z<1.15&&H>0,R.lerpVectors(_,a,H),R.y+=Math.sin(b*.05+I.userData.phase*2)*.07,I.position.copy(R)}),C.visible=w>=0,C.scale.setScalar(.2+Qe(w/200,0,1)*.3)}};nn.spiritual_weapon=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,releaseAt:l,impactAt:c,own:d}=s,f=new We;f.name="spirit-hammer",e.add(f),i(f,r.cylinder,n("#cfe8ff",.9,!0),0,0,0,.04,.5,.04).name="spirit-haft",i(f,r.box,n("#9fd0ff",.85,!0),0,.3,0,.26,.17,.17).name="spirit-head",i(f,r.sphere,n("#e6f4ff",.35,!0),0,.15,0,.42);let h=i(t,d(new It(1,.03,6,40)),n("#bfe0ff",.85,!0),0,-.78,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="spirit-ring";let u=i(t,r.box,n("#e6f4ff",.8,!0),0,-.82,0,.7,.02,.05);u.name="spirit-crack";let g=new D;return(_,{elapsedImpact:p})=>{let m=Qe((_-l)/Math.max(1,c-l),0,1);f.visible=_>=l-150&&p<180,g.lerpVectors(o,a,m),g.y+=Math.sin(m*Math.PI)*.9+(m<.15?m*3:0),f.position.copy(g),f.rotation.set(0,0,-.4-m*1.9);let y=Qe(p/400,0,1);h.visible=p>=0,h.scale.setScalar(.3+y*.9),u.visible=p>=0,u.scale.set(.7+y*.8,1,1),u.rotation.y=.6}};var gb={bless:{c:"#ffe27a",motes:1},aid:{c:"#8dffa8",crosses:1},shield_of_faith:{c:"#7fb8ff",dome:1},sanctuary:{c:"#f4f0ff",dome:1,motes:1},protection_from_evil_and_good:{c:"#fff0b0",sigil:1},blur:{c:"#bcd8ff",ghosts:1},mirror_image:{c:"#79e6ff",ghosts:1,runes:1},mage_armor:{c:"#65d6ff",dome:1,sigil:1},dodge:{c:"#d8e8f2",sigil:1},dash:{c:"#ffd98a",rings:1},redirect_attack:{c:"#ff9f5a",rings:1},innate_sorcery:{c:"#ff7a3c",flames:1},metamagic:{c:"#d6a8ff",runes:1},action_surge:{c:"#ffe9a0",ghosts:1,flames:1},lesser_restoration:{c:"#b8ffd8",motes:1,crosses:1},command:{c:"#e8d9a8",rings:1},rage:{c:"#ff3b2e",flames:1,rings:1},extend_rage:{c:"#ff3b2e",flames:1},reckless_attack:{c:"#ff9a3c",rings:1}};nn.buff=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,impactAt:a,own:l}=s,c=gb[e.variant]||{c:"#ffffff",motes:1},d=new We;d.name=`buff-${e.variant}`,t.add(d),d.position.set(o.x,0,o.z);let f=l(new It(1,.03,6,40)),h=i(d,f,n(c.c,.9,!0),0,.1,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="buff-ring";let u=[],g=(_,p,m={})=>(_.name=`buff-${p}`,Object.assign(_.userData,m),u.push({item:_,kind:p}),_);if(c.motes)for(let _=0;_<10;_++)g(i(d,r.sphere,n(_%2?c.c:"#ffffff",.9,!0),0,0,0,.05),"mote",{phase:_/10});if(c.dome&&g(i(d,r.sphere,n(c.c,.25,!0),0,.6,0,.62,.78,.62),"dome"),c.sigil){let _=new We;d.add(_),_.position.y=.06,i(_,f,n(c.c,.95,!0),0,0,0,.55,.55,.55).rotation.x=-Math.PI/2;for(let p=0;p<6;p++)i(_,r.box,n("#ffffff",.85,!0),0,0,0,.03,.01,1).rotation.y=p*Math.PI/6;g(_,"sigil")}if(c.crosses)for(let _=0;_<3;_++){let p=new We;d.add(p),i(p,r.box,n(c.c,.95,!0),0,0,0,.14,.04,.04),i(p,r.box,n(c.c,.95,!0),0,0,0,.04,.14,.04),g(p,"cross",{phase:_*2.1})}if(c.ghosts)for(let _=0;_<3;_++)g(i(d,r.sphere,n(c.c,.3,!0),0,.6,0,.2,.42,.2),"ghost",{phase:_*2.1});if(c.flames)for(let _=0;_<8;_++)g(i(d,r.cone,n(_%2?"#ffb347":c.c,.85,!0),0,.3,0,.07,.5,.07),"flame",{phase:_/8*Math.PI*2});if(c.runes){let _=l(new Ln(1));for(let p=0;p<6;p++)g(i(d,_,n(p%2?"#ffffff":c.c,.95,!0),0,0,0,.06,.1,.03),"rune",{phase:p/6*Math.PI*2})}if(c.rings)for(let _=0;_<3;_++)g(i(d,f,n(c.c,.9,!0),0,.8,0,.2,.2,.2),"word",{phase:_*.25});return _=>{let p=Qe((_-a+250)/1100,0,1);d.visible=p>0&&p<1,h.scale.setScalar(.3+p*.75);for(let{item:m,kind:y}of u){let M=m.userData,v=_*.006+(M.phase||0);if(y==="mote")m.position.set(Math.cos(v+M.phase*6)*.4,(p*1.2+M.phase)%1*1.5,Math.sin(v+M.phase*6)*.4);else if(y==="dome")m.scale.set(.62*(.5+p*.6),.78*(.5+p*.6),.62*(.5+p*.6));else if(y==="sigil")m.rotation.y=_*.004;else if(y==="cross")m.position.set(Math.cos(v)*.36,.15+p*1.3*((M.phase/2.1+1)/3),Math.sin(v)*.36),m.rotation.y=-v;else if(y==="ghost")m.position.set(Math.cos(v)*.38*p*2,.6,Math.sin(v)*.38*p*2);else if(y==="flame")m.position.set(Math.cos(M.phase)*.4,.25+p*.5,Math.sin(M.phase)*.4),m.scale.y=.5*(.6+.4*Math.sin(_*.03+M.phase*3))*(1.2-p*.4);else if(y==="rune")m.position.set(Math.cos(v*1.5)*.45,.5+p*.6,Math.sin(v*1.5)*.45),m.rotation.y=v;else if(y==="word"){let C=Qe(p*1.4-M.phase,0,1);m.visible=C>0&&C<1,m.scale.setScalar(.2+C*.8),m.material.opacity=.9*(1-C)}}}};nn.command=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:d,impactAt:f,own:h}=s,u=h(new It(1,.03,6,36)),g=[0,1,2].map(p=>{let m=i(e,u,n(p%2?"#fff0c0":"#e8d9a8",.9,!0),0,0,0,.18,.18,.18);return m.name="command-ring",m.userData.i=p,m.quaternion.setFromUnitVectors(new D(0,0,1),l),m}),_=[];if(c.outcome==="hit")for(let p=0;p<4;p++){let m=p*Math.PI/2,y=i(t,r.cone,n("#fff0c0",.9,!0),Math.cos(m)*.28,1.2,Math.sin(m)*.28,.09,.28,.09);y.name="command-arrow",y.rotation.x=Math.PI,_.push(y)}return(p,{elapsedImpact:m})=>{g.forEach(y=>{let M=Qe((p-d)/Math.max(1,f-d)-y.userData.i*.18,0,1);y.visible=p>=d&&M>0&&M<1,y.position.lerpVectors(o,a,M),y.scale.setScalar(.18+M*.4)}),_.forEach((y,M)=>{let v=Qe((m-M*40)/500,0,1);y.visible=m>=0&&v<1,y.position.y=1.2-v*1})}};nn.undead=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,source:o,target:a,impactAt:l,own:c}=s,d=e.variant,f=new We;f.name=`undead-${d}`,t.add(f);let h=d==="stench"?o:a;f.position.set(h.x,0,h.z);let u=[],g=(_,p,m={})=>(_.name=`undead-${p}`,Object.assign(_.userData,m),u.push({item:_,kind:p}),_);if(d==="stench"){for(let _=0;_<9;_++)g(i(f,r.sphere,n(_%2?"#7aa83a":"#a6c85a",.5),0,.3,0,.3),"puff",{phase:_/9*Math.PI*2,r:.5+_%3*.22});g(i(f,r.sphere,n("#8fb84a",.18),0,.45,0,1.2,.6,1.2),"cloud")}else if(d==="paralyzed"){let _=c(new Ln(1));for(let m=0;m<5;m++)g(i(f,_,n("#ffe27a",.95,!0),0,1.1,0,.07,.12,.04),"star",{phase:m/5*Math.PI*2});let p=c(new It(1,.03,6,32));g(i(f,p,n("#fff0a0",.9,!0),0,.12,0,.3,.3,.3),"ring")}else if(d==="poisoned")for(let _=0;_<8;_++)g(i(f,r.sphere,n(_%2?"#8fd36a":"#c7f59a",.7,!0),0,.2,0,.06),"bubble",{phase:_/8,a:_*2.4});else if(d==="strength_drain"){let _=c(new It(1,.035,6,32));g(i(f,_,n("#d24a4a",.9,!0),0,.12,0,.3,.3,.3),"ring");for(let p=0;p<4;p++){let m=i(f,r.cone,n(p%2?"#ff8a8a":"#d24a4a",.95,!0),(p-1.5)*.18,1.4,0,.07,.2,.07);m.rotation.z=Math.PI,g(m,"drop",{i:p})}}else if(d==="fortitude"){let _=c(new It(1,.04,6,32));g(i(f,_,n("#b9d49a",.95,!0),0,.1,0,.3,.3,.3),"ring");for(let p=0;p<8;p++)g(i(f,r.sphere,n(p%2?"#d7e8b8":"#8fa07a",.9),0,.3,0,.07),"pop",{a:p*Math.PI/4})}return _=>{let p=Qe((_-l+250)/1300,0,1);f.visible=p>0&&p<1;for(let{item:m,kind:y}of u){let M=m.userData;if(y==="puff"){let v=M.r*(.5+p),C=_*.003+M.phase;m.position.set(Math.cos(C)*v,.3+.25*Math.sin(C*2),Math.sin(C)*v),m.scale.setScalar(.3*(.6+p*.7))}else if(y==="cloud")m.scale.set(1.2*(.4+p),.6*(.6+p*.4),1.2*(.4+p));else if(y==="star"){let v=_*.009+M.phase;m.position.set(Math.cos(v)*.38,1+.1*Math.sin(v*3),Math.sin(v)*.38),m.rotation.y=v}else if(y==="ring")m.scale.setScalar(.3+p*.7);else if(y==="bubble"){let v=(p*1.4+M.phase)%1;m.position.set(Math.cos(M.a)*.3*v,.2+v*1.1,Math.sin(M.a)*.3*v)}else if(y==="drop"){let v=Qe(p*1.6-M.i*.08,0,1);m.position.y=1.4-v*1.1,m.visible=v<1}else if(y==="pop"){let v=Qe(p*2,0,1);m.position.set(Math.cos(M.a)*.6*v,.3+Math.sin(v*Math.PI)*.5,Math.sin(M.a)*.6*v)}}}};nn.necrotic=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:d,own:f}=s,h=i(e,f(new Bn(.5,.62,28,1,-.9,1.8)),n("#5b2a8a",.95,!0),o.x,o.y,o.z,1,1,1);h.rotation.set(-Math.PI/2,0,-Math.PI/2),h.name="necrotic-arc";let u=[];for(let p=0;p<7;p++){let m=i(t,r.sphere,n(p%2?"#7d3fb8":"#2b1840",.8),0,0,0,.1);m.name="necrotic-wisp",m.userData.a=p*.9,u.push(m)}let g=i(e,r.sphere,n("#7d3fb8",.9,!0),o.x,o.y,o.z,.1);g.name="necrotic-bolt";let _=Math.atan2(l.x,l.z);return(p,{elapsedImpact:m})=>{let y=Qe((p-c)/Math.max(1,d-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,Qe(y*.35,0,1)),h.rotation.z=-Math.PI/2+_,h.scale.setScalar(.8+y*.6),g.visible=p>=c&&y<1,g.position.lerpVectors(o,a,y),u.forEach(M=>{let v=Qe(m/800,0,1);M.visible=m>=0&&v<1,M.position.set(Math.cos(M.userData.a)*.35*v,-.6+v*1.3,Math.sin(M.userData.a)*.35*v),M.scale.setScalar(.1*(1-v*.6))})}};nn.rotting_fist=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:d,own:f}=s,h=i(e,f(new Bn(.45,.72,28,1,-1,2)),n("#dfc280",.9,!0),o.x,o.y,o.z);h.rotation.set(-Math.PI/2,0,-Math.PI/2);let u=Math.atan2(l.x,l.z),g=[];for(let p=0;p<12;p++){let m=i(t,r.sphere,n(p%3===0?"#8c4cd8":"#d8b46a",.85,p%3===0),0,0,0,.065);m.userData={a:p*(Math.PI*2/12),h:p%4*.16},g.push(m)}let _=i(t,f(new It(.48,.032,6,36)),n("#9b5ce0",.9,!0),0,-.74,0);return _.rotation.x=-Math.PI/2,(p,{elapsedImpact:m})=>{let y=Qe((p-c)/Math.max(1,d-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,Qe(y*.55,0,1)),h.rotation.z=-Math.PI/2+u+(y-.5)*.9;let M=Qe(m/750,0,1);_.visible=m>=0&&M<1,_.scale.setScalar(.4+M*.9),g.forEach(v=>{v.visible=m>=0&&M<1;let C=v.userData.a+M*4.5;v.position.set(Math.cos(C)*(.25+M*.45),-.55+M*1.2+v.userData.h,Math.sin(C)*(.25+M*.45)),v.scale.setScalar(.07*(1-M*.5))})}};nn.dreadful_glare=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:d,span:f,own:h}=s,u=new D().crossVectors(l,new D(0,1,0)).normalize(),g=new D(0,1,0),_=[-.07,.07].map(y=>{let M=i(e,r.cylinder,n("#ffbe3d",.88,!0),0,0,0,.036,.01,.036);return M.quaternion.setFromUnitVectors(g,l),M.userData.off=y,M}),p=i(e,r.sphere,n("#ffe680",.95,!0),o.x,o.y+.25,o.z,.22),m=i(t,h(new It(.52,.035,6,36)),n("#ffaa2b",.92,!0),0,-.72,0);return m.rotation.x=-Math.PI/2,(y,{elapsedImpact:M})=>{let v=Qe((y-c)/Math.max(1,d-c),0,1),C=y>=c&&M<420,R=Math.max(.01,f*v);p.visible=C,p.scale.setScalar(.22*(1+.35*Math.sin(y*.05)));for(let w of _)w.visible=C,w.scale.y=R,w.position.copy(o).addScaledVector(l,R/2).addScaledVector(u,w.userData.off),w.position.y+=.22*(1-v*.5);let b=Qe(M/650,0,1);m.visible=M>=0&&b<1,m.scale.setScalar(.35+b*.95)}};nn.draining_swipe=s=>{let{impact:e,mat:t,mesh:n,geo:i,direction:r,impactAt:o}=s,a=Math.atan2(r.x,r.z),l=[];for(let c=0;c<3;c++){let d=n(e,i.box,t(c===1?"#c9b8e8":"#3a2a52",.95,!0),(c-1)*.16,.1,0,.05,.9,.02);d.name="swipe-streak",d.rotation.z=-.6,d.userData.i=c,l.push(d)}return(c,{elapsedImpact:d})=>{l.forEach(f=>{let h=Qe((d-f.userData.i*70)/140,0,1);f.visible=d>=f.userData.i*70&&h<=1&&d<700,f.scale.y=.9*h,f.position.y=.55-h*.45,f.rotation.y=a})}};nn.touch=s=>{let{event:e,group:t,impact:n,mat:i,mesh:r,geo:o,source:a,target:l,direction:c,impactAt:d,own:f}=s,h=e.variant,u=new We;u.name=`touch-${h}`,t.add(u),u.position.set(l.x,0,l.z);let g=[],_=(m,y,M={})=>(m.name=`touch-${y}`,Object.assign(m.userData,M),g.push({item:m,kind:y}),m),p=f(new It(1,.035,6,32));if(h==="graze"){let m=_(r(u,o.box,i("#fff4d8",.95,!0),0,.7,0,.05,.9,.03),"streak");m.rotation.z=-.7;for(let y=0;y<5;y++)_(r(u,o.sphere,i("#ffd27a",.9,!0),0,.7,0,.04),"spark",{a:y*1.3})}else if(h==="shield")_(r(u,o.sphere,i("#7fb8ff",.35,!0),0,.62,0,.62,.78,.62),"dome"),_(r(u,p,i("#cfe4ff",.95,!0),0,.1,0,.3,.3,.3),"ring");else if(h==="flee"){for(let m=0;m<6;m++)_(r(u,o.sphere,i("#b8b2a4",.55),0,.15,0,.1),"dust",{a:m*1.05});for(let m=0;m<3;m++)_(r(u,o.cone,i("#e8f0ff",.9,!0),0,.5,0,.07,.2,.07),"chevron",{i:m}).quaternion.setFromUnitVectors(new D(0,1,0),new D(c.x,0,c.z).normalize())}else if(h==="second_wind"){for(let m=0;m<6;m++){let y=_(r(u,o.box,i("#ffe9a0",.85,!0),0,0,0,.35,.025,.025),"wind",{phase:m/6*Math.PI*2,h:m});y.name="touch-wind"}_(r(u,o.sphere,i("#ffe27a",.25,!0),0,.6,0,.5,.7,.5),"glow")}else if(h==="dissolve"){_(r(u,p,i("#9a9486",.8),0,.1,0,.3,.3,.3),"ring");for(let m=0;m<12;m++)_(r(u,o.sphere,i(m%2?"#c8c2b2":"#6e6a60",.85),0,.2,0,.06),"ash",{a:m*2.4,phase:m/12})}else if(h==="opportunity"){let m=_(r(u,o.box,i("#ff6e54",.95,!0),0,.72,0,.07,1.05,.04),"streak");m.rotation.z=.65,_(r(u,p,i("#ff8a66",.9,!0),0,.12,0,.35,.35,.35),"ring")}return m=>{let y=Qe((m-d+250)/(h==="dissolve"?1500:1e3),0,1);u.visible=y>0&&y<1;for(let{item:M,kind:v}of g){let C=M.userData;if(v==="streak")M.scale.y=.9*Qe(y*4,0,1),M.position.y=.95-Qe(y*4,0,1)*.5;else if(v==="spark"){let R=Qe(y*3,0,1);M.position.set(Math.cos(C.a)*.5*R,.7+Math.sin(C.a)*.3*R,Math.sin(C.a)*.5*R)}else if(v==="dome")M.scale.set(.62*(.7+y*.5),.78*(.7+y*.5),.62*(.7+y*.5));else if(v==="ring")M.scale.setScalar(.3+y*.8);else if(v==="dust"){let R=Qe(y*2,0,1);M.position.set(Math.cos(C.a)*.5*R,.15+R*.2,Math.sin(C.a)*.5*R),M.scale.setScalar(.1+R*.12)}else if(v==="chevron"){let R=Qe(y*1.8-C.i*.15,0,1);M.position.set(c.x*(.3+R*1.2),.5,c.z*(.3+R*1.2)),M.visible=R<1}else if(v==="wind"){let R=m*.01+C.phase;M.position.set(Math.cos(R)*.42,.1+(y*1.5+C.h*.12)%1*1.3,Math.sin(R)*.42),M.rotation.y=-R+Math.PI/2}else if(v==="glow")M.scale.set(.5*(.5+y),.7*(.5+y),.5*(.5+y));else if(v==="ash"){let R=(y*1.2+C.phase)%1;M.position.set(Math.cos(C.a)*.4*R,.2+R*1.3,Math.sin(C.a)*.4*R),M.scale.setScalar(.06*(1-R*.5))}}}};function Fm({scene:s,units:e,requestRender:t,reducedMotion:n=!1}){let i=new We;i.name="combat-effects",s.add(i);let r=[],o=[],a=[],l=null,c=-1,d=-1,f=!1,h=n,u=!!document.hidden;function g(){for(let I of e.values())for(let H of I.ownMaterials){let V=H.userData.restEmissive;H.emissive.setHex(V?.color??0),H.emissiveIntensity=V?.intensity??0}}function _(I){I.group.removeFromParent();for(let H of I.resources)H.dispose();I.resources.clear()}function p(){for(let I of r)_(I);r.length=0,o.length=0,g()}function m(I){return Number.isSafeInteger(I?.id)&&I.id>=0&&db.has(I.style)&&Number.isSafeInteger(I.amount)&&I.amount>=0&&["attack","heal"].includes(I.type)&&["hit","miss","heal"].includes(I.outcome)&&Number.isFinite(I.source?.x)&&Number.isFinite(I.source?.y)&&Number.isFinite(I.target?.x)&&Number.isFinite(I.target?.y)}function y(I,H=performance.now()){if(f||typeof I.encounter_id!="string"||!Number.isInteger(I.revision))return;let V=I.encounter_id;if(V!==l&&a.includes(V)||V===l&&I.revision<=c)return;let G=(Array.isArray(I.effects)?I.effects:[]).filter(Y=>Number.isSafeInteger(Y?.id)).sort((Y,ye)=>Y.id-ye.id),U=G.reduce((Y,ye)=>Math.max(Y,ye.id),-1);if(V!==l){l!==null&&(a.push(l),a.length>8&&a.shift()),p(),l=V,c=I.revision,d=U;return}c=I.revision;let $=[];for(let Y of G)Y.id>d&&(d=Y.id,m(Y)&&$.push(Y));if(d=Math.max(d,U),u||document.hidden){p();return}let ne=new Map;for(let Y of r){let ye=`${Y.event.target.x},${Y.event.target.y}`;ne.set(ye,(ne.get(ye)||0)+1)}for(let Y of o){let ye=`${Y.event.target.x},${Y.event.target.y}`;ne.set(ye,(ne.get(ye)||0)+1)}$.slice(-Ua).forEach((Y,ye)=>{let ie=`${Y.target.x},${Y.target.y}`,ge=ne.get(ie)||0;ne.set(ie,ge+1);let Te=$.length>1?(ye+ge)%5:ge%5;o.push({event:Y,lane:Te,due:H+ye*85,received:H,first:ye===0||$[ye-1].style!==Y.style})}),o.length>Ua&&o.splice(0,o.length-Ua),o.length&&t()}function M({event:I,lane:H,timing:V,origin:G,first:U},$){let ne=new We;ne.name=`combat-${I.style}-${I.id}`,Object.assign(ne.userData,{effectId:I.id,effectStyle:I.style,effectOutcome:I.outcome,amount:I.amount,sourceId:I.source_id,targetId:I.target_id,reducedMotion:h,source:{...I.source},target:{...I.target}}),i.add(ne);let Y=new Set,ye=[],ie=ee=>(Y.add(ee),ee),ge=ie(new Js(1,1)),Te=ie(new Li(1,1,1,8)),De=ie(new Ys(1,1,8)),rt=ie(new Ii(1,1,1)),W=(ee,ue=1,j=!1)=>{let oe=ie(new hn({color:ee,transparent:!0,opacity:ue,depthWrite:!1,side:Dn,toneMapped:!1,blending:j?sr:As}));return ye.push({material:oe,opacity:ue}),oe};function pe(ee,ue,j,oe,O,je,Ie=1,st=Ie,ft=Ie){let He=new tn(ue,j);return He.position.set(oe,O,je),He.scale.set(Ie,st,ft),ee.add(He),He}let we=G?new D(...G):new D(I.source.x,.88,I.source.y),Be=new D(I.target.x,.88,I.target.y),Me=Be.clone().sub(we);Me.lengthSq()<.001&&Me.copy(Nm),Me.normalize();let _e=I.tone||(I.outcome==="miss"?"#d3dbe0":fb.has(I.style)&&Um[I.damage_type]||mb[I.style]),Ue=new We;Ue.name="impact",ne.add(Ue),Ue.position.copy(Be);let Se=I.outcome==="heal",Fe=h?0:V?.releaseAt||0,tt=h?0:V?.impactAt??(Se?0:I.style==="slash"?220:Dm.has(I.style)?300:450),Ye=h?650:Se?1040:tt+650,ht=null,xt=null,Dt=[],lt=[];if(!h&&I.style==="slash"){xt=new We,xt.name="slash-arc",ne.add(xt),xt.position.copy(we),xt.rotation.y=Math.atan2(Me.x,Me.z);let ee=ie(new Bn(.58,1.2,32,1,-.96,1.92)),ue=ee.attributes.position;for(let O=0;O<ue.count;O++){let je=Math.atan2(ue.getY(O),ue.getX(O));if(Math.hypot(ue.getX(O),ue.getY(O))<.9){let st=1.2-.62*Math.sin((je+.96)/1.92*Math.PI);ue.setXYZ(O,Math.cos(je)*st,Math.sin(je)*st,0)}}ue.needsUpdate=!0;let j=pe(xt,ee,W("#fff1c9",.85),0,0,0);j.rotation.set(-Math.PI/2,0,-Math.PI/2);let oe=ie(new Bn(1.16,1.22,32,1,-.96,1.92));pe(xt,oe,W("#ffd27c",.95),0,.012,0).rotation.copy(j.rotation),xt.userData.baseAngle=xt.rotation.y}else if(!h&&!Se&&!Dm.has(I.style))if(ht=new We,ht.name=`${I.style}-projectile`,ne.add(ht),ht.position.copy(we),ht.quaternion.setFromUnitVectors(Nm,Me),I.style==="arrow"){let ee=pe(ht,Te,W("#c89a60"),0,0,-.18,.028,.76,.028);ee.name="arrow-shaft",ee.rotation.x=Math.PI/2;let ue=pe(ht,De,W("#e8f5ee"),0,0,.29,.095,.24,.055);ue.name="arrow-head",ue.rotation.x=Math.PI/2;let j=W("#fff0d1");pe(ht,rt,j,0,0,-.49,.2,.025,.2).name="arrow-fletching",pe(ht,rt,j,0,0,-.49,.025,.2,.2)}else if(I.style==="firebolt"){pe(ht,ge,W("#ff651c"),0,0,0,.23,.21,.31).name="firebolt-flame",pe(ht,ge,W("#fff0a2"),0,0,.12,.13,.13,.2);let ee=pe(ht,De,W("#ff9b25",.8),0,0,-.29,.2,.58,.2);ee.rotation.x=-Math.PI/2;for(let ue=0;ue<7;ue++){let j=pe(ht,ge,W(ue%2?"#ffb344":"#ef5221",.65-ue*.065),Math.sin(ue*2.3)*.06,Math.cos(ue*2.3)*.06,-.32-ue*.13,.15-ue*.015);j.name="fire-trail",lt.push(j)}for(let ue=0;ue<6;ue++){let j=pe(ht,ge,W("#ffdb79"),0,0,-.15-ue*.13,.032);j.name="fire-spark",Dt.push(j)}}else if(I.style==="sorcerous_burst"){pe(ht,ge,W(_e,.55,!0),0,0,0,.4,.4,.4).name="burst-shell",pe(ht,ge,W("#ffffff"),0,0,0,.19,.19,.19).name="burst-core";let ee=ie(new Ln(1));for(let ue=0;ue<4;ue++){let j=pe(ht,ee,W(ue%2?"#ffffff":_e,.9),.45,0,0,.08,.15,.08);j.name="burst-shard",j.userData.phase=ue*Math.PI/2,Dt.push(j)}for(let ue=0;ue<6;ue++){let j=pe(ht,ge,W(_e,.6-ue*.08,!0),Math.sin(ue*1.9)*.08,Math.cos(ue*2.7)*.08,-.26-ue*.15,.16-ue*.018);j.name="burst-trail",lt.push(j)}}else{let ee=ie(new Ln(1));pe(ht,ee,W("#a18aff",.75),0,0,-.04,.22,.19,.42).name="missile-violet-shell",pe(ht,ee,W("#a8fbff"),0,0,.12,.12,.1,.3).name="missile-cyan-dart";for(let ue=0;ue<5;ue++){let j=pe(ht,ge,W(ue%2?"#ae80ff":"#65deff",.7-ue*.1),0,0,-.33-ue*.17,.1-ue*.014);j.name="missile-trail",lt.push(j)}}ht&&ht.traverse(ee=>{ee.userData.effectRole="projectile"});let Xt=null,ut=null,zt=null,un=[],dn=new D(0,1,0),J=we.distanceTo(Be);if(!h&&I.style==="life_drain"){ut=pe(ne,Te,W("#3a2652",.85),0,0,0,.05,.01,.05),ut.name="drain-tendril",ut.quaternion.setFromUnitVectors(dn,Me),Xt=[];for(let ee=0;ee<10;ee++){let ue=pe(ne,ge,W(ee%2?"#9be07a":"#d2f7b4",.9,!0),0,0,0,.065);ue.name="drain-mote",ue.visible=!1,Xt.push({item:ue,phase:ee/10,side:(ee%3-1)*.2})}}if(!h&&I.style==="turn_undead"&&(ut=pe(ne,Te,W("#ffe9a0",.6,!0),0,0,0,.05,.01,.05),ut.name="turn-ray",ut.quaternion.setFromUnitVectors(dn,Me),U)){zt=new We,zt.name="turn-sigil",ne.add(zt),zt.position.set(we.x,.1,we.z);let ee=ie(new It(1,.025,6,64)),ue=pe(zt,ee,W("#ffe9a0",.9,!0),0,0,0);ue.rotation.x=-Math.PI/2,ue.name="turn-wave";let j=new We;j.name="turn-seal",zt.add(j);let oe=pe(j,ee,W("#fff4c8",.95,!0),0,.01,0,.75,.75,.75);oe.rotation.x=-Math.PI/2;let O=pe(j,ee,W("#ffd36b",.9,!0),0,.02,0,.5,.5,.5);O.rotation.x=-Math.PI/2;for(let je=0;je<8;je++){let Ie=pe(j,rt,W("#fff4c8",.9,!0),0,.015,0,.03,.01,.75);Ie.rotation.y=je*Math.PI/8}zt.userData.waveReach=6.2}let dt=new We;dt.name=Se?"second-wind-halo":"impact-burst",Ue.add(dt);let Nt=ie(new It(.49,Se?.035:.025,6,40)),Lt=pe(dt,Nt,W(_e,.9),0,Se?-.68:0,0);Lt.rotation.x=-Math.PI/2;let Oe=Se?pe(dt,Nt,W("#c1ffd7",.6),0,.15,0):null;Oe&&(Oe.rotation.x=-Math.PI/2);let Qt=[];if(I.outcome!=="miss")for(let ee=0;ee<(Se?8:10);ee++){let ue=ee*Math.PI*2/(Se?8:10),j=new D(Math.cos(ue),Se?.8:Math.sin(ee*2.1)*.45,Math.sin(ue)),oe=pe(dt,Se?rt:ge,W(ee%3?_e:Se?"#d5ffe1":"#fff4d4"),0,0,0,Se?.045:.07,Se?.15:.07,Se?.045:.07);Qt.push({item:oe,velocity:j})}let it=document.createElement("canvas");it.width=384,it.height=128;let ze=it.getContext("2d");if(I.style==="turn_undead"&&I.outcome==="hit"){let ee=pe(Ue,Te,W("#fff0b0",.22,!0),0,.5,0,.12,2.2,.12);ee.name="turn-pillar";let ue=ie(new Ln(1));for(let j=0;j<4;j++){let oe=pe(Ue,ue,W("#ffe27a",.95,!0),0,.95,0,.06,.1,.02);oe.name="turn-rune",oe.userData.phase=j*Math.PI/2,un.push(oe)}}let N=I.text?String(I.text):I.style==="turn_undead"?I.outcome==="miss"?"RESISTS":"TURNED":I.style==="dreadful_glare"?I.outcome==="miss"?"RESISTS GLARE":"FRIGHTENED!":I.outcome==="miss"?"MISS":Se?`+${I.amount}`:`\u2212${(Number(I.amount)||0)+(Number(I.rider)||0)}`,A=!!(I.crit&&I.outcome==="hit");if(A){let ee=pe(dt,ie(new It(.72,.045,6,40)),W("#ffd95e",.98,!0),0,.05,0);ee.rotation.x=-Math.PI/2}ze.font=A?"900 78px system-ui, sans-serif":"800 74px system-ui, sans-serif",ze.textAlign="center",ze.textBaseline="middle",ze.strokeStyle="#0d1a1f",ze.lineWidth=14,ze.lineJoin="round";let se=I.style==="life_drain"&&I.outcome!=="miss"&&I.amount>0,Pe=I.outcome==="hit"&&Number(I.rider)>0?`+${I.rider} ${String((I.rider_types||[])[0]||"").toUpperCase()}`.trim():"",he=I.style==="rotting_fist"&&I.outcome==="hit",re=I.subline?String(I.subline):A?se?"CRITICAL! \xB7 MAX HP":he?"CRITICAL! \xB7 CURSED":"CRITICAL!":se?"MAX HP":Pe?he?`${Pe} \xB7 CURSED`:Pe:he?"CURSED":"";re&&(ze.font="800 62px system-ui, sans-serif");let Ce=A?"#ffd95e":_e;ze.strokeText(N,192,re?50:67,368),ze.fillStyle=Ce,ze.fillText(N,192,re?50:67,368),re&&(ze.font="800 29px system-ui, sans-serif",ze.lineWidth=8,ze.fillStyle=A?"#fff2a6":Ce,ze.strokeText(re,192,102,368),ze.fillText(re,192,102,368));let fe=ie(new es(it));fe.colorSpace=jt;let me=ie(new xs({map:fe,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1})),ve=new Xs(me);ve.name="combat-amount",ve.renderOrder=30,ve.userData.text=N,ve.userData.effectRole="label",ve.position.set(nd(H)[0],nd(H)[1],0),Ue.add(ve),ve.scale.set(1.9,.64,1);let B={event:I,group:ne,resources:Y,fades:ye,source:we,target:Be,direction:Me,travel:ht,arc:xt,impact:Ue,burst:dt,halo:Lt,halo2:Oe,burstParticles:Qt,label:ve,textMaterial:me,sparks:Dt,trail:lt,lane:H,start:$,drain:Xt,beam:ut,sigil:zt,runes:un,span:J,up:dn,impactAt:tt,releaseAt:Fe,swingDuration:V?180:360,duration:Ye,reduced:h},be=nn[I.style];return be&&!h&&(B.custom=be({event:I,group:ne,impact:Ue,source:we,target:Be,direction:Me,color:_e,mat:W,mesh:pe,own:ie,fades:ye,geo:{sphere:ge,cylinder:Te,cone:De,box:rt},lane:H,first:U,releaseAt:Fe,impactAt:tt,duration:Ye,area:I.area||null,span:we.distanceTo(Be)})||null),r.push(B),B}function v(I,H,V=600){if(f||u)return!1;g();for(let G=r.length-1;G>=0;G--)I-r[G].start>=r[G].duration&&(_(r[G]),r.splice(G,1));for(;o.length&&I-o[0].received>ub;)o.shift();for(;r.length<hb&&o.length&&o[0].due<=I;)M(o.shift(),I);for(let G of r){let{event:U,travel:$,arc:ne,impact:Y,source:ye,target:ie,direction:ge,halo:Te,halo2:De,label:rt}=G,W=I-G.start,pe=W-G.impactAt,we=Qe(pe/(G.duration-G.impactAt),0,1);if(Y.visible=pe>=0,$){$.visible=W>=G.releaseAt&&W<G.impactAt;let Me=Qe((W-G.releaseAt)/Math.max(1,G.impactAt-G.releaseAt),0,1);if($.position.lerpVectors(ye,ie,Me),U.style==="magic_missile"){let _e=Math.sin(Me*Math.PI)*(G.lane%2?-.35:.35);$.position.x+=ge.z*_e,$.position.z-=ge.x*_e,$.position.y+=Math.sin(Me*Math.PI)*(.2+G.lane*.12)}if(G.sparks.forEach((_e,Ue)=>{if(_e.userData.phase!==void 0){let Se=W*.014+_e.userData.phase,Fe=.48-Me*.14;_e.position.set(Math.cos(Se)*Fe,Math.sin(Se)*Fe,0),_e.rotation.set(Se,Se*1.3,0);return}_e.position.x=Math.sin(W*.02+Ue*2)*.22,_e.position.y=Math.cos(W*.016+Ue*2)*.2}),U.style==="sorcerous_burst"){let _e=1+.18*Math.sin(W*.03);$.children.forEach(Ue=>{Ue.name==="burst-shell"&&Ue.scale.setScalar(.4*_e)})}}if(ne){let Me=W-G.releaseAt;ne.visible=Me>=0&&Me<G.swingDuration,ne.rotation.y=ne.userData.baseAngle+(Me/G.swingDuration-.5)*1.15}if(G.drain){let Me=Qe((W-G.releaseAt)/Math.max(1,G.impactAt-G.releaseAt),0,1),_e=G.beam;_e.visible=W>=G.releaseAt,_e.scale.y=Math.max(.01,G.span*Me),_e.position.copy(ye).addScaledVector(ge,G.span*Me/2);for(let{item:Ue,phase:Se,side:Fe}of G.drain){let tt=((W-G.impactAt)/800+Se)%1;Ue.visible=W>=G.impactAt&&tt>=0;let Ye=Qe(tt,0,1);Ue.position.lerpVectors(ie,ye,Ye),Ue.position.x+=ge.z*Fe*Math.sin(Ye*Math.PI),Ue.position.z-=ge.x*Fe*Math.sin(Ye*Math.PI),Ue.position.y+=Math.sin(Ye*Math.PI)*.3,Ue.scale.setScalar(.065*(1-Ye*.5))}}if(G.beam&&U.style==="turn_undead"){let Me=G.beam,_e=Qe((W-G.releaseAt)/Math.max(1,G.impactAt-G.releaseAt),0,1);Me.visible=W>=G.releaseAt,Me.scale.set(1,Math.max(.01,G.span*_e),1),Me.position.copy(ye).addScaledVector(ge,G.span*_e/2)}if(G.sigil){let Me=G.sigil,_e=Math.max(0,W-G.releaseAt);Me.visible=W>=G.releaseAt;let Ue=Me.getObjectByName("turn-wave"),Se=Me.getObjectByName("turn-seal"),Fe=Qe(_e/Math.max(1,G.impactAt-G.releaseAt+350),0,1);Ue.scale.setScalar(.3+Fe*(Me.userData.waveReach-.3)),Se.rotation.y=_e*.004}for(let Me of G.runes){let _e=pe*.006+Me.userData.phase;Me.position.set(Math.cos(_e)*.45,.95+we*.5,Math.sin(_e)*.45),Me.rotation.y=_e}G.custom?.(W,{elapsedImpact:pe,phase:we});let Be=1-Qe((we-.45)/.55,0,1);for(let{material:Me,opacity:_e}of G.fades)Me.opacity=_e*Be;if(ne&&ne.scale.setScalar(.8+Math.min(W/360,1)*.2),Y.visible){let Me=U.style==="heal",_e=G.reduced?1:U.style==="life_drain"?1.35-Math.min(we*2.5,1)*.85:.6+Math.min(we*2.5,1)*.85;if(Te.scale.setScalar(_e),De&&(De.scale.setScalar(_e*.85),De.position.y=G.reduced?.15:-.4+we*1.1),G.burstParticles.forEach(({item:Se,velocity:Fe},tt)=>{Se.position.copy(Fe).multiplyScalar(G.reduced?.4:U.style==="life_drain"?.95-we*.85:.12+we*(Me?.65:.85)),Me&&(Se.position.y+=-.35+(G.reduced?0:we*.65)),Se.scale.setScalar((Me?.065:.075)*(1-we*.7)),Me?Se.scale.y*=2.4:Se.rotation.set(tt,we*2,tt*.7)}),rt.position.y=nd(G.lane)[1]+(G.reduced?0:we*.48),H){let Fe=2*H.position.distanceTo(ie)*Math.tan(an.degToRad(H.fov/2))/Math.max(1,V),tt=Math.max(.64,Fe*38);rt.scale.set(tt*3,tt,1)}G.textMaterial.opacity=Be;let Ue=e.get(U.target_id);if(U.outcome!=="miss"&&pe<250&&Ue&&Ue.data.x===U.target.x&&Ue.data.y===U.target.y)for(let Se of Ue.ownMaterials){let Fe=(1-pe/250)*1.15;Fe>=Se.emissiveIntensity&&(Se.emissive.set(Me?"#5deba0":U.style==="turn_undead"?"#ffe27a":U.style==="life_drain"?"#7a4cc0":"#ff9a56"),Se.emissiveIntensity=Fe)}}}return r.length>0||o.length>0}function C(I){h!==I&&(h=I,p(),t())}function R(I){u=I,u&&p()}function b(){return{encounterId:l,revision:c,lastSeen:d,active:i.children.length,queued:o.length,activeEffects:i.children.map(I=>({...I.userData})),queuedIds:o.map(({event:I})=>I.id),reducedMotion:h}}function w(){f||(p(),f=!0,i.removeFromParent())}function z(I,H,V,G){if(f||u||document.hidden)return;let U=I.filter(m);U.slice(0,pb.has(U[0]?.style)?12:8).forEach(($,ne)=>{o.push({event:$,lane:ne%5,timing:V,origin:G,first:ne===0,due:H,received:H})}),o.length>Ua&&o.splice(0,o.length-Ua),t()}return{ingest:y,play:z,tick:v,clear:p,setReducedMotion:C,setHidden:R,getState:b,dispose:w}}function Bm(s,e,t){function n(g,_,p,m=s){let y=new We;y.name=g,y.position.set(..._),m.add(y),s.updateWorldMatrix(!0,!0);for(let M of p)y.attach(M);return y}let i=t==="skeleton"?.92:.77,r=n("right-shoulder",[.2,i,0],e.right),o=n("left-shoulder",[-.2,i,0],e.left),a=n("blade-grip",t==="skeleton"?[.12,.8,-.23]:[.33,.66,-.055],e.blade),l=n("bow-grip",[-.36,t==="skeleton"?.83:.065,-.08],e.bow);r.attach(a),o.attach(l);let c=new Vt;c.name="head-anchor",c.position.set(0,1.12,-.1),s.add(c);let d=[r,o,a,l].map(g=>({object:g,rotation:g.rotation.clone(),position:g.position.clone()}));function f(){for(let g of d)g.object.rotation.copy(g.rotation),g.object.position.copy(g.position)}function h(g){a.visible=g==="slash"||t==="fighter"&&!g,l.visible=g==="arrow"||["goblin","skeleton"].includes(t)&&!g}h(null);function u(g,_){f(),h(g);let p=an.clamp(_/280,0,1),m=an.clamp((_-420)/380,0,1);if(g==="slash"){let y=an.clamp((_-280)/140,0,1);r.rotation.x+=(.65*p-2.1*y)*(1-m),r.rotation.z+=(-.55*p+.85*y)*(1-m)}else if(g==="arrow"){let y=p*(1-m);o.rotation.y-=.85*y,o.rotation.x+=.55*y,r.rotation.x+=.8*y,r.rotation.y-=.8*y}else r.rotation.x-=.9*p*(1-m),o.rotation.z-=.35*p*(1-m)}return{right:r,left:o,head:c,blade:a,bow:l,isSkinned:!1,reset:f,equip:h,pose:u,walk(){},idle(){},hit(){},death(){return!1}}}var id=280,_b={slash:360,rotting_fist:380,heal:280,turn_undead:520,life_drain:460,dreadful_glare:480,sacred_flame:560},sh=s=>_b[s]??730,km=s=>Math.max(820,sh(s)+650);function sd(s,e){if(e===Ru)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===fo||e===Pa){let t=s.getIndex();if(t===null){let r=[],o=s.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);s.setIndex(r),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}let n=t.count-2,i=[];if(e===fo)for(let r=1;r<=n;r++)i.push(t.getX(0)),i.push(t.getX(r)),i.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(i.push(t.getX(r)),i.push(t.getX(r+1)),i.push(t.getX(r+2))):(i.push(t.getX(r+2)),i.push(t.getX(r+1)),i.push(t.getX(r)));return i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}function rh(s){let e=new Map,t=new Map,n=s.clone();return zm(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;let r=i,o=e.get(i),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function zm(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)zm(s.children[n],e.children[n],t)}var yo=class extends Ui{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new ud(t)}),this.register(function(t){return new dd(t)}),this.register(function(t){return new fd(t)}),this.register(function(t){return new bd(t)}),this.register(function(t){return new Sd(t)}),this.register(function(t){return new Ed(t)}),this.register(function(t){return new md(t)}),this.register(function(t){return new gd(t)}),this.register(function(t){return new _d(t)}),this.register(function(t){return new yd(t)}),this.register(function(t){return new hd(t)}),this.register(function(t){return new xd(t)}),this.register(function(t){return new pd(t)}),this.register(function(t){return new Md(t)}),this.register(function(t){return new vd(t)}),this.register(function(t){return new ld(t)}),this.register(function(t){return new oh(t,Ct.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new oh(t,Ct.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new Td(t)})}load(e,t,n,i){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=os.extractUrlBase(e);o=os.resolveURL(c,this.path)}else o=os.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new so(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(d){t(d),r.manager.itemEnd(e)},a)}catch(d){a(d)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Xm){try{o[Ct.KHR_BINARY_GLTF]=new wd(e)}catch(f){i&&i(f);return}r=JSON.parse(o[Ct.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new Dd(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let d=0;d<this.pluginCallbacks.length;d++){let f=this.pluginCallbacks[d](c);f.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[f.name]=f,o[f.name]=!0}if(r.extensionsUsed)for(let d=0;d<r.extensionsUsed.length;++d){let f=r.extensionsUsed[d],h=r.extensionsRequired||[];switch(f){case Ct.KHR_MATERIALS_UNLIT:o[f]=new cd;break;case Ct.KHR_DRACO_MESH_COMPRESSION:o[f]=new Ad(r,this.dracoLoader);break;case Ct.KHR_TEXTURE_TRANSFORM:o[f]=new Rd;break;case Ct.KHR_MESH_QUANTIZATION:o[f]=new Cd;break;default:h.indexOf(f)>=0&&a[f]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+f+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function yb(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}function ln(s,e,t){let n=s.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var Ct={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},ld=class{constructor(e){this.parser=e,this.name=Ct.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,d=new at(16777215);l.color!==void 0&&d.setRGB(l.color[0],l.color[1],l.color[2],Vn);let f=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Es(d),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Si(d),c.distance=f;break;case"spot":c=new ya(d),c.distance=f,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),zi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},cd=class{constructor(){this.name=Ct.KHR_MATERIALS_UNLIT}getMaterialType(){return hn}extendParams(e,t,n){let i=[];e.color=new at(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Vn),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,jt))}return Promise.all(i)}},hd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},ud=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(i.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ee(r,r)}return Promise.all(i)}},dd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(i)}},fd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_DISPERSION}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},pd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(i)}},md=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_SHEEN}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(t.sheenColor=new at(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],Vn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,jt)),n.sheenRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(i)}},gd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&i.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(i)}},_d=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_VOLUME}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new at().setRGB(r[0],r[1],r[2],Vn),Promise.all(i)}},yd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_IOR}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},xd=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_SPECULAR}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new at().setRGB(r[0],r[1],r[2],Vn),n.specularColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,jt)),Promise.all(i)}},vd=class{constructor(e){this.parser=e,this.name=Ct.EXT_MATERIALS_BUMP}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&i.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(i)}},Md=class{constructor(e){this.parser=e,this.name=Ct.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return ln(this.parser,e,this.name)!==null?qn:null}extendMaterialParams(e,t){let n=ln(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&i.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(i)}},bd=class{constructor(e){this.parser=e,this.name=Ct.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},Sd=class{constructor(e){this.parser=e,this.name=Ct.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},Ed=class{constructor(e){this.parser=e,this.name=Ct.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},oh=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=i.byteOffset||0,c=i.byteLength||0,d=i.count,f=i.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(d,f,h,i.mode,i.filter).then(function(u){return u.buffer}):o.ready.then(function(){let u=new ArrayBuffer(d*f);return o.decodeGltfBuffer(new Uint8Array(u),d,f,h,i.mode,i.filter),u})})}else return null}},Td=class{constructor(e){this.name=Ct.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let c of i.primitives)if(c.mode!==yi.TRIANGLES&&c.mode!==yi.TRIANGLE_STRIP&&c.mode!==yi.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(d=>(l[c]=d,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let d=c.pop(),f=d.isGroup?d.children:[d],h=c[0].count,u=[];for(let g of f){let _=new mt,p=new D,m=new En,y=new D(1,1,1),M=new mi(g.geometry,g.material,h);for(let C=0;C<h;C++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,C),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,C),l.SCALE&&y.fromBufferAttribute(l.SCALE,C),M.setMatrixAt(C,_.compose(p,m,y));let v=null;for(let C in l)if(C==="_COLOR_0"){let R=l[C];M.instanceColor=new Qi(R.array,R.itemSize,R.normalized)}else if(C!=="TRANSLATION"&&C!=="ROTATION"&&C!=="SCALE"){if(v===null){let b=M.geometry;v=new on,v.name=b.name;for(let w in b.attributes)v.setAttribute(w,b.attributes[w]);for(let w in b.morphAttributes)v.morphAttributes[w]=b.morphAttributes[w];b.index!==null&&v.setIndex(b.index),v.morphTargetsRelative=b.morphTargetsRelative;for(let w of b.groups)v.addGroup(w.start,w.count,w.materialIndex);b.boundingBox!==null&&(v.boundingBox=b.boundingBox.clone()),b.boundingSphere!==null&&(v.boundingSphere=b.boundingSphere.clone()),v.drawRange.start=b.drawRange.start,v.drawRange.count=b.drawRange.count,v.userData=Object.assign({},b.userData),M.geometry=v}let R=l[C];v.setAttribute(C,new Qi(R.array,R.itemSize,R.normalized))}Vt.prototype.copy.call(M,g),this.parser.assignFinalMaterial(M),u.push(M)}return d.isGroup?(d.clear(),d.add(...u),d):u[0]}))}},Xm="glTF",Oa=12,Hm={JSON:1313821514,BIN:5130562},wd=class{constructor(e){this.name=Ct.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Oa),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Xm)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-Oa,r=new DataView(e,Oa),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===Hm.JSON){let c=new Uint8Array(e,Oa+o,a);this.content=n.decode(c)}else if(l===Hm.BIN){let c=Oa+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Ad=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ct.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let d in o){let f=Id[d]||d.toLowerCase();a[f]=o[d]}for(let d in e.attributes){let f=Id[d]||d.toLowerCase();if(o[d]!==void 0){let h=n.accessors[e.attributes[d]],u=_o[h.componentType];c[f]=u.name,l[f]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(d){return new Promise(function(f,h){i.decodeDracoFile(d,function(u){for(let g in u.attributes){let _=u.attributes[g],p=l[g];p!==void 0&&(_.normalized=p)}f(u)},a,c,Vn,h)})})}},Rd=class{constructor(){this.name=Ct.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),i=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*i,e.offset.x,-e.repeat.x*i,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},Cd=class{constructor(){this.name=Ct.KHR_MESH_QUANTIZATION}},ah=class extends Ni{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,d=i-t,f=(n-t)/d,h=f*f,u=h*f,g=e*c,_=g-c,p=-2*u+3*h,m=u-h,y=1-p,M=m-h+f;for(let v=0;v!==a;v++){let C=o[_+v+a],R=o[_+v+l]*d,b=o[g+v+a],w=o[g+v]*d;r[v]=y*C+M*R+p*b+m*w}return r}},xb=new En,Pd=class extends ah{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return xb.fromArray(r).normalize().toArray(r),r}},yi={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},_o={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Gm={9728:yn,9729:Tn,9984:lc,9985:ho,9986:ar,9987:gi},Vm={33071:di,33648:kr,10497:ii},rd={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Id={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Cs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},vb={CUBICSPLINE:void 0,LINEAR:Gs,STEP:Hs},od={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Mb(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new kn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Oi})),s.DefaultMaterial}function hr(s,e,t){for(let n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function zi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function bb(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,d=e.length;c<d;c++){let f=e[c];if(f.POSITION!==void 0&&(n=!0),f.NORMAL!==void 0&&(i=!0),f.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);let o=[],a=[],l=[];for(let c=0,d=e.length;c<d;c++){let f=e[c];if(n){let h=f.POSITION!==void 0?t.getDependency("accessor",f.POSITION):s.attributes.position;o.push(h)}if(i){let h=f.NORMAL!==void 0?t.getDependency("accessor",f.NORMAL):s.attributes.normal;a.push(h)}if(r){let h=f.COLOR_0!==void 0?t.getDependency("accessor",f.COLOR_0):s.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let d=c[0],f=c[1],h=c[2];return n&&(s.morphAttributes.position=d),i&&(s.morphAttributes.normal=f),r&&(s.morphAttributes.color=h),s.morphTargetsRelative=!0,s})}function Sb(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Eb(s){let e,t=s.extensions&&s.extensions[Ct.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ad(t.attributes):e=s.indices+":"+ad(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+ad(s.targets[n]);return e}function ad(s){let e="",t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Ld(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Tb(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var wb=new mt,Dd=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new yb,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?(this.textureLoader=new ma(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new xa(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new so(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return hr(r,a,i),zi(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,d]of o.children.entries())r(d,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ct.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(os.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=rd[i.type],a=_o[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new Nn(c,o,l))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=rd[i.type],c=_o[i.componentType],d=c.BYTES_PER_ELEMENT,f=d*l,h=i.byteOffset||0,u=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,_,p;if(u&&u!==f){let m=Math.floor(h/u),y="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count,M=t.cache.get(y);M||(_=new c(a,m*u,i.count*u/d),M=new Ws(_,u/d),t.cache.add(y,M)),p=new ys(M,l,h%u/d,g)}else a===null?_=new c(i.count*l):_=new c(a,h,i.count*l),p=new Nn(_,l,g);if(i.sparse!==void 0){let m=rd.SCALAR,y=_o[i.sparse.indices.componentType],M=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,C=new y(o[1],M,i.sparse.count*m),R=new c(o[2],v,i.sparse.count*l);a!==null&&(p=new Nn(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let b=0,w=C.length;b<w;b++){let z=C[b];if(p.setX(z,R[b*l]),l>=2&&p.setY(z,R[b*l+1]),l>=3&&p.setZ(z,R[b*l+2]),l>=4&&p.setW(z,R[b*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=g}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(d){d.flipY=!1,d.name=o.name||a.name||"",d.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(d.name=a.uri);let h=(r.samplers||{})[o.sampler]||{};return d.magFilter=Gm[h.magFilter]||Tn,d.minFilter=Gm[h.minFilter]||gi,d.wrapS=Vm[h.wrapS]||ii,d.wrapT=Vm[h.wrapT]||ii,d.generateMipmaps=!d.isCompressedTexture&&d.minFilter!==yn&&d.minFilter!==Tn,i.associations.set(d,{textures:e}),d}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=i.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1,d;if(t.isKTX2Loader===!0&&o.bufferView!==void 0)d=n.getDependency("bufferView",o.bufferView).then(function(h){return new Promise(function(u,g){t.parse(h,u,g)})});else{if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;let u=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(u),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");d=Promise.resolve(l).then(function(h){return new Promise(function(u,g){let _=u;t.isImageBitmapLoader===!0&&(_=function(p){let m=new xn(p);m.needsUpdate=!0,u(m)}),t.load(os.resolveURL(h,r.path),_,void 0,g)})})}let f=d.then(function(h){return c===!0&&a.revokeObjectURL(l),zi(h,o),h.userData.mimeType=o.mimeType||Tb(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=f,f}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Ct.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[Ct.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[Ct.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Zr,Xn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Kr,Xn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return kn}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[Ct.KHR_MATERIALS_UNLIT]){let f=i[Ct.KHR_MATERIALS_UNLIT];o=f.getMaterialType(),c.push(f.extendParams(a,r,t))}else{let f=r.pbrMetallicRoughness||{};if(a.color=new at(1,1,1),a.opacity=1,Array.isArray(f.baseColorFactor)){let h=f.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],Vn),a.opacity=h[3]}f.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",f.baseColorTexture,jt)),a.metalness=f.metallicFactor!==void 0?f.metallicFactor:1,a.roughness=f.roughnessFactor!==void 0?f.roughnessFactor:1,f.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",f.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",f.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Dn);let d=r.alphaMode||od.OPAQUE;if(d===od.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,d===od.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==hn&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ee(1,1),r.normalTexture.scale!==void 0)){let f=r.normalTexture.scale;a.normalScale.set(f,f)}if(r.occlusionTexture!==void 0&&o!==hn&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==hn){let f=r.emissiveFactor;a.emissive=new at().setRGB(f[0],f[1],f[2],Vn)}return r.emissiveTexture!==void 0&&o!==hn&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,jt)),Promise.all(c).then(function(){let f=new o(a);return r.name&&(f.name=r.name),zi(f,r),t.associations.set(f,{materials:e}),r.extensions&&hr(i,f,r),f})}createUniqueName(e){let t=Jt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[Ct.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Wm(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],d=Eb(c),f=i[d];if(f)o.push(f.promise);else{let h;c.extensions&&c.extensions[Ct.KHR_DRACO_MESH_COMPRESSION]?h=r(c):h=Wm(new on,c,t),c.mode===yi.TRIANGLE_STRIP?h=h.then(u=>sd(u,Pa)):c.mode===yi.TRIANGLE_FAN&&(h=h.then(u=>sd(u,fo))),i[d]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let d=o[l].material===void 0?Mb(this.cache):this.getDependency("material",o[l].material);a.push(d)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(l){let c=l.slice(0,l.length-1),d=l[l.length-1],f=[];for(let u=0,g=d.length;u<g;u++){let _=d[u],p=o[u],m,y=c[u];if(p.mode===yi.TRIANGLES||p.mode===yi.TRIANGLE_STRIP||p.mode===yi.TRIANGLE_FAN||p.mode===void 0){let M=r.isSkinnedMesh===!0,v=_.hasAttribute("skinIndex")&&_.hasAttribute("skinWeight");M&&v===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=M&&v?new Jo(_,y):new tn(_,y),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(p.mode===yi.LINES)m=new Qo(_,y);else if(p.mode===yi.LINE_STRIP)m=new qs(_,y);else if(p.mode===yi.LINE_LOOP)m=new ea(_,y);else if(p.mode===yi.POINTS)m=new ta(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&Sb(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),zi(m,r),p.extensions&&hr(i,m,p),t.assignFinalMaterial(m),f.push(m)}for(let u=0,g=f.length;u<g;u++)t.associations.set(f[u],{meshes:e,primitives:u});if(f.length===1)return r.extensions&&hr(i,f[0],r),f[0];let h=new We;r.extensions&&hr(i,h,r),t.associations.set(h,{meshes:e});for(let u=0,g=f.length;u<g;u++)h.add(f[u]);return h})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new bn(an.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new tr(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),zi(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],l=[];for(let c=0,d=o.length;c<d;c++){let f=o[c];if(f){a.push(f);let h=new mt;r!==null&&h.fromArray(r.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new jo(a,l)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],d=[];for(let f=0,h=i.channels.length;f<h;f++){let u=i.channels[f],g=i.samplers[u.sampler],_=u.target,p=_.node,m=i.parameters!==void 0?i.parameters[g.input]:g.input,y=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",p)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",y)),c.push(g),d.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(d)]).then(function(f){let h=f[0],u=f[1],g=f[2],_=f[3],p=f[4],m=[];for(let M=0,v=h.length;M<v;M++){let C=h[M],R=u[M],b=g[M],w=_[M],z=p[M];if(C===void 0)continue;C.updateMatrix&&C.updateMatrix();let I=n._createAnimationTracks(C,R,b,w,z);if(I)for(let H=0;H<I.length;H++)m.push(I[H])}let y=new Qs(r,void 0,m);return zi(y,i),y})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,d=a.length;c<d;c++)o.push(n.getDependency("node",a[c]));let l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let d=c[0],f=c[1],h=c[2];h!==null&&d.traverse(function(u){u.isSkinnedMesh&&u.bind(h,wb)});for(let u=0,g=f.length;u<g;u++)d.add(f[u]);if(d.userData.pivot!==void 0&&f.length>0){let u=d.userData.pivot,g=f[0];d.pivot=new D().fromArray(u),d.position.x-=u[0],d.position.y-=u[1],d.position.z-=u[2],g.position.set(0,0,0),delete d.userData.pivot}return d})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let d;if(r.isBone===!0?d=new qr:c.length>1?d=new We:c.length===1?d=c[0]:d=new Vt,d!==c[0])for(let f=0,h=c.length;f<h;f++)d.add(c[f]);if(r.name&&(d.userData.name=r.name,d.name=o),zi(d,r),r.extensions&&hr(n,d,r),r.matrix!==void 0){let f=new mt;f.fromArray(r.matrix),d.applyMatrix4(f)}else r.translation!==void 0&&d.position.fromArray(r.translation),r.rotation!==void 0&&d.quaternion.fromArray(r.rotation),r.scale!==void 0&&d.scale.fromArray(r.scale);if(!i.associations.has(d))i.associations.set(d,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){let f=i.associations.get(d);i.associations.set(d,{...f})}return i.associations.get(d).nodes=e,d}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new We;n.name&&(r.name=i.createUniqueName(n.name)),zi(r,n),n.extensions&&hr(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let d=0,f=l.length;d<f;d++){let h=l[d];h.parent!==null?r.add(rh(h)):r.add(h)}let c=d=>{let f=new Map;for(let[h,u]of i.associations)(h instanceof Xn||h instanceof xn)&&f.set(h,u);return d.traverse(h=>{let u=i.associations.get(h);u!=null&&f.set(h,u)}),f};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){let o=[],a=e.name?e.name:e.uuid,l=[];function c(u){u.morphTargetInfluences&&l.push(u.name?u.name:u.uuid)}Cs[r.path]===Cs.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(a);let d;switch(Cs[r.path]){case Cs.weights:d=is;break;case Cs.rotation:d=ss;break;case Cs.translation:case Cs.scale:d=bs;break;default:n.itemSize===1?d=is:d=bs;break}let f=i.interpolation!==void 0?vb[i.interpolation]:Gs,h=this._getArrayFromAccessor(n);for(let u=0,g=l.length;u<g;u++){let _=new d(l[u]+"."+Cs[r.path],t.array,h,f);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),o.push(_)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=Ld(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof ss?Pd:ah;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function Ab(s,e,t){let n=e.attributes,i=new Wn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new D(l[0],l[1],l[2]),new D(c[0],c[1],c[2])),a.normalized){let d=Ld(_o[a.componentType]);i.min.multiplyScalar(d),i.max.multiplyScalar(d)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new D,l=new D;for(let c=0,d=r.length;c<d;c++){let f=r[c];if(f.POSITION!==void 0){let h=t.json.accessors[f.POSITION],u=h.min,g=h.max;if(u!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(u[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(u[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(u[2]),Math.abs(g[2]))),h.normalized){let _=Ld(_o[h.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;let o=new $n;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Wm(s,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(let o in n){let a=Id[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){let o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return At.workingColorSpace!==Vn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${At.workingColorSpace}" not supported.`),zi(s,e),Ab(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?bb(s,e.targets,t):s})}var Rb=Object.freeze({"models/animated_armor.glb":"13dc51016a1f","models/blink_dog.glb":"0bb8015afe29","models/bugbear_warrior.glb":"eae2a2718f59","models/chruna.glb":"42255971af5f","models/curogana.glb":"180adead51bb","models/dryad.glb":"557ade7f9446","models/elion.glb":"b872b04f787d","models/ghast.glb":"6371391d8711","models/ghoul.glb":"16aa31da33b2","models/giant_wasp.glb":"061a457cbdcb","models/goblin.glb":"f73621e500a9","models/goblin_boss.glb":"5c70d30fc977","models/green_hag.glb":"3c4123862677","models/guy.glb":"d9c8624b83c0","models/harpy.glb":"1ce452efd4c1","models/ilyra.glb":"e80cb47c5b14","models/kobold_warrior.glb":"46cbf51bb710","models/mara.glb":"cb6aa0365609","models/mummy.glb":"e5329cfb5594","models/satyr.glb":"2b4216e8cfd4","models/sea_hag.glb":"06f0e5bf3d39","models/shadow.glb":"2f42b2566caa","models/skeleton.glb":"6a5ab59b8437","models/specter.glb":"a65586d24bca","models/sprite.glb":"2506b2b5039e","models/steam_mephit.glb":"beac1f5703cf","models/violet_fungus.glb":"32947ad09172","models/wight.glb":"b16ef52407a4","models/will_o_wisp.glb":"27f3a9e31f49","models/zombie.glb":"f658062129d1","props/brazier.glb":"d1119e0d4198","props/oak_tree.glb":"f973ba6c323a","props/sarcophagus.glb":"983314fb98b3","textures/mausoleum/floor_albedo.webp":"1c6bceb4ea9f","textures/mausoleum/floor_normal.webp":"95326e9be847","textures/mausoleum/floor_orm.webp":"08f8dca1306c","textures/mausoleum/floor_slab_albedo.webp":"414f021986b0","textures/mausoleum/floor_slab_normal.webp":"0767504a141a","textures/mausoleum/floor_slab_orm.webp":"547acec34e68","textures/mausoleum/wall_albedo.webp":"a2b23f4f02ce","textures/mausoleum/wall_normal.webp":"c9bc3bae08fb","textures/mausoleum/wall_orm.webp":"2d0bfec395d4","textures/mausoleum/window_albedo.webp":"60e027194ed3"});function lh(s){let e=Rb[s];return e?`${s}?v=${e}`:s}var ur=Object.freeze({mara:Object.freeze({file:"models/mara.glb",height:1.28,group:"hero",walkSpeed:.96,runSpeed:2.0211}),guy:Object.freeze({file:"models/guy.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),elion:Object.freeze({file:"models/elion.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),ilyra:Object.freeze({file:"models/ilyra.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),curogana:Object.freeze({file:"models/curogana.glb",height:1.27,group:"hero",walkSpeed:.9525,runSpeed:2.0053}),chruna:Object.freeze({file:"models/chruna.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),skeleton:Object.freeze({file:"models/skeleton.glb",height:1.25,group:"undead"}),zombie:Object.freeze({file:"models/zombie.glb",height:1.25,group:"undead"}),ghoul:Object.freeze({file:"models/ghoul.glb",height:1.22,group:"undead"}),ghast:Object.freeze({file:"models/ghast.glb",height:1.36,group:"undead"}),shadow:Object.freeze({file:"models/shadow.glb",height:1.28,group:"undead",ghost:.84,glow:"#2e1952",glowIntensity:.36}),specter:Object.freeze({file:"models/specter.glb",height:1.32,group:"undead",ghost:.74,glow:"#8fc5ff",glowIntensity:.32}),wight:Object.freeze({file:"models/wight.glb",height:1.38,group:"undead",glow:"#1a332b",glowIntensity:.14}),mummy:Object.freeze({file:"models/mummy.glb",height:1.34,group:"undead"}),goblin:Object.freeze({file:"models/goblin.glb",height:.98,group:"monster"}),goblin_boss:Object.freeze({file:"models/goblin_boss.glb",height:1.08,group:"monster"}),animated_armor:Object.freeze({file:"models/animated_armor.glb",height:1.36,group:"monster"}),kobold_warrior:Object.freeze({file:"models/kobold_warrior.glb",height:.94,group:"monster"}),violet_fungus:Object.freeze({file:"models/violet_fungus.glb",height:1.15,group:"monster"}),giant_wasp:Object.freeze({file:"models/giant_wasp.glb",height:1.02,group:"monster"}),satyr:Object.freeze({file:"models/satyr.glb",height:1.28,group:"monster"}),steam_mephit:Object.freeze({file:"models/steam_mephit.glb",height:.92,group:"monster"}),blink_dog:Object.freeze({file:"models/blink_dog.glb",height:.9,group:"monster"}),sprite:Object.freeze({file:"models/sprite.glb",height:.72,group:"monster"}),dryad:Object.freeze({file:"models/dryad.glb",height:1.32,group:"monster"}),bugbear_warrior:Object.freeze({file:"models/bugbear_warrior.glb",height:1.42,group:"monster"}),harpy:Object.freeze({file:"models/harpy.glb",height:1.32,group:"monster"}),sea_hag:Object.freeze({file:"models/sea_hag.glb",height:1.3,group:"monster"}),green_hag:Object.freeze({file:"models/green_hag.glb",height:1.34,group:"monster"}),will_o_wisp:Object.freeze({file:"models/will_o_wisp.glb",height:.88,group:"monster",ghost:.86,glow:"#7ceeff",glowIntensity:.58})}),Ym=Object.freeze(Object.keys(ur)),qm=Object.freeze({goblin_minion:Object.freeze({scale:.9,tint:"#e6edcf"})});function Cb(s){if(!s)return null;for(let e of[s.content,String(s.id||"").split("-")[0],s.kind]){let t=String(e||"").toLowerCase();if(Object.hasOwn(qm,t))return qm[t]}return null}var Pb=Object.freeze(["skeleton","zombie","ghoul","ghast","shadow","specter","wight","mummy"]),ch=5*1024*1024,Ib=2e4;function dr(s){if(!s)return null;let e=String(s.base_id||"").toLowerCase(),t=String(s.id||"").split("-")[0].toLowerCase(),n=String(s.content||"").toLowerCase(),i=String(s.kind||"").toLowerCase(),r=o=>o.replace(/_l[1-3]$/,"");for(let o of[e,n,t,r(n),r(t),i])if(o){if(Object.hasOwn(ur,o))return o;if(o==="goblin_minion"||o==="goblin_warrior"||o==="vault_goblin")return"goblin";if(o==="vault_skeleton")return"skeleton"}if(s.team==="heroes"){let o=r(e||n||t);return Object.hasOwn(ur,o)?o:i==="mage"||s.model?.base==="mage"?o==="curogana"?"curogana":"ilyra":o==="guy"?"guy":o==="elion"?"elion":o==="chruna"?"chruna":"mara"}return i==="skeleton"?"skeleton":i==="goblin"?"goblin":null}function Od(s){if(!(s instanceof ArrayBuffer)||s.byteLength<20||s.byteLength>ch)throw new Error("Model GLB size is invalid.");let e=new DataView(s);if(e.getUint32(0,!0)!==1179937895||e.getUint32(4,!0)!==2||e.getUint32(8,!0)!==s.byteLength)throw new Error("Model GLB header is invalid.");let t=12,n=null;for(;t<s.byteLength;){if(t+8>s.byteLength)throw new Error("Truncated GLB.");let i=e.getUint32(t,!0),r=e.getUint32(t+4,!0);if(i%4||t+8+i>s.byteLength)throw new Error("Truncated GLB chunk.");if(t===12){if(r!==1313821514)throw new Error("GLB must start with JSON.");n=JSON.parse(new TextDecoder().decode(new Uint8Array(s,t+8,i)))}else if(r!==5130562)throw new Error("Unsupported GLB chunk.");t+=i+8}if((function i(r){if(!(!r||typeof r!="object")){if(Object.hasOwn(r,"uri"))throw new Error("GLB must contain no external resource URIs.");Object.values(r).forEach(i)}})(n),n?.asset?.version!=="2.0")throw new Error("Unsupported glTF version.");return n}function Km(s){let e=new Set,t=new Set;s.traverse(n=>{n.geometry?.dispose(),n.skeleton&&t.add(n.skeleton);for(let i of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(let r of Object.values(i))r?.isTexture&&e.add(r);i.dispose()}}),t.forEach(n=>n.dispose()),e.forEach(n=>{n.dispose(),n.source?.data?.close?.()})}var Lb=new Set(["turn_undead","preserve_life","shatter","thunderwave","burning_hands","dragons_breath","acid_splash","dreadful_glare"]),Db=new Set(["slash","slam","rotting_fist","draining_swipe","claw","bite"]);function Nd(s,e,t){for(let i of e){let r=s.getObjectByName(i);if(r)return r}let n=new Vt;return n.position.set(...t),s.add(n),n}function Nb(s){let e=2166136261,t=String(s||"");for(let n=0;n<t.length;n++)e=Math.imul(e^t.charCodeAt(n),16777619);return(e>>>0)%1e3/1e3*6.283}function Ub(s,e){let t=ur[e];if(!t)throw new Error(`Unknown cast key: ${e}`);let n=s.scene,i={};for(let c of s.animations||[]){i[c.name]=c;let d=c.name.toLowerCase();i[d]||(i[d]=c)}let r=0,o=!1,a=!1;function l(){o&&!r&&!a&&(a=!0,Km(n))}return{key:e,spec:t,clipNames:Object.keys(i),createInstance(c){if(o)return null;let d=rh(n);d.name=`cast-${e}`,d.position.y+=.1,d.userData.castKey=e;let f=Cb(c),h=f?.scale||1;h!==1&&d.scale.multiplyScalar(h);let u=f?.tint?new at(f.tint):null,g=new Map,_=null,p=null;d.traverse(_e=>{if(delete _e.userData.unitId,_e.name==="Goblin_Blade"&&(_=_e),_e.name==="Goblin_Bow"&&(p=_e),!_e.isMesh)return;_e.userData.unitId=c.id,_e.castShadow=!0,_e.receiveShadow=!0;let Ue=Se=>{if(!g.has(Se)){let Fe=Se.clone();"emissiveMap"in Fe&&(Fe.emissiveMap=null),u&&Fe.color&&Fe.color.multiply(u),t.ghost&&(Fe.transparent=!0,Fe.opacity=t.ghost,Fe.depthWrite=!0),t.glow&&Fe.emissive?(Fe.emissive.set(t.glow),Fe.emissiveIntensity=t.glowIntensity||.3,Fe.userData.restEmissive={color:Fe.emissive.getHex(),intensity:Fe.emissiveIntensity}):Fe.emissive&&Fe.emissiveIntensity>0&&(Fe.userData.restEmissive={color:Fe.emissive.getHex(),intensity:Fe.emissiveIntensity}),Fe.needsUpdate=!0,g.set(Se,Fe)}return g.get(Se)};_e.material=Array.isArray(_e.material)?_e.material.map(Ue):Ue(_e.material)});let m=new We;m.name="cast-motion",m.add(d);let y=new va(d),M={};for(let[_e,Ue]of Object.entries(i)){let Se=y.clipAction(Ue);Se.setLoop(qc,1),Se.clampWhenFinished=!0,M[_e]=Se}let v=Nd(d,["WeaponR","Weapon.R","HandR","Hand.R","FistR","Fist.R"],[.22,t.height*.56,-.18]),C=Nd(d,["HandL","Hand.L","FistL","Fist.L","LowerArmL"],[-.22,t.height*.56,-.18]),R=Nd(d,["Head","Mummy_Head"],[0,t.height*.84,-.12]),b=Nb(c.id),w=140,z=320,I=200,H=!1,V=null,G=0,U=null,$=0,ne=0,Y=0;function ye(_e,Ue,{instant:Se=!1,clockMs:Fe=null}={}){if(H)return!1;let tt=M[_e]?_e:"idle",Ye=M[tt];if(!Ye)return!1;let ht=Fe!==null?Fe:typeof performance<"u"?performance.now():Date.now(),xt=Ye.getClip().duration||1,Dt=Math.max(0,Math.min(xt-1e-4,Ue)),lt=ht<Y-1;!Se&&V&&V!==tt&&M[V]?.isRunning()?(U&&U!==V&&M[U]&&M[U].stop(),U=V,$=G,ne=ht):Se||U&&(U===tt||!M[U]?.isRunning())?(U&&U!==tt&&M[U]&&M[U].stop(),U=null):lt&&U&&(ne=ht),Y=ht;let Xt=1;if(U&&M[U]){let ut=Math.max(0,Math.min(1,(ht-ne)/w));ut>=1?(M[U].stop(),U=null):Xt=ut*ut*(3-2*ut)}for(let[ut,zt]of Object.entries(M))ut!==tt&&ut!==U&&zt.isRunning()&&zt.stop();if(U&&M[U]){let ut=M[U];ut.isRunning()||ut.reset().play(),ut.enabled=!0,ut.setEffectiveWeight(1-Xt),ut.time=$}return Ye.isRunning()||Ye.reset().play(),Ye.enabled=!0,Ye.setEffectiveWeight(Xt),Ye.time=Dt,V=tt,G=Dt,y.update(0),d.updateMatrixWorld(!0),!0}function ie(_e){if(_&&p){let Ue=_e==="arrow";p.visible=Ue,_.visible=!Ue}}ie(null);function ge(){H||(m.position.set(0,0,0),m.rotation.set(0,0,0),ie(null),ye("idle",0,{instant:!0}))}function Te(_e,Ue=!1){if(H)return;if(m.position.set(0,0,0),m.rotation.set(0,0,0),Ue&&M.guard){let Ye=M.guard.getClip().duration||.8;ye("guard",Ye*.42,{clockMs:_e});return}let Se=M.idle;if(!Se)return;let Fe=Math.max(.2,Se.getClip().duration),tt=(_e*85e-5+b)%Fe;ye("idle",tt,{clockMs:_e})}function De(_e,Ue=!1){if(H)return;let Se=Ue&&M.run?"run":M.walk?"walk":"idle",Fe=M[Se];if(!Fe){m.position.y=.035*Math.abs(Math.sin(_e*.012));return}let tt=Math.max(.2,Fe.getClip().duration),Ye=Ue?t.runSpeed:t.walkSpeed,xt=Ye?1/(Ue?I:z)/Ye:Ue?.0028:.0022,Dt=(_e*xt+b*.2)%tt;ye(Se,Dt,{clockMs:_e})}function rt(_e,Ue){return _e==="arrow"&&M.arrow?"arrow":Ue==="dodge"||_e==="dodge"?M.guard?"guard":"idle":Db.has(_e)&&M.slash?"slash":_e==="necrotic"?M.slash?"slash":"cast":Lb.has(_e)&&M.cast_area?"cast_area":M.cast?"cast":M.slash?"slash":"idle"}function W(_e=null){m.position.set(0,0,0),m.rotation.set(0,0,0),ie(null),ye("idle",0,{clockMs:_e})}function pe(_e,Ue,Se=null){if(H)return;if(Ue<=0||Ue>=800){W(Ue);return}ie(_e);let Fe=rt(_e,Se),tt=M[Fe];if(!tt){let lt=Math.sin(Math.PI*Ue/800);m.position.z=-.14*lt,m.rotation.x=-.12*lt;return}let Ye=tt.getClip().duration||.8,ht=Ye*.35,xt=Ye*.56,Dt=Ue<=280?Ue/280*ht:Ue<=420?ht+(Ue-280)/140*(xt-ht):xt+(Ue-420)/380*(Ye-xt);ye(Fe,Dt,{clockMs:Ue})}function we(_e){if(!(H||_e<0)){if(_e>=380){W(_e);return}if(M.hit){let Ue=M.hit.getClip().duration||.5;ye("hit",_e/380*Ue,{clockMs:_e})}else{let Ue=Math.sin(Math.PI*_e/380);m.position.z=.1*Ue,m.rotation.x=.16*Ue}}}function Be(_e=9999){if(H||!M.death)return!1;m.position.set(0,0,0),m.rotation.set(0,0,0);let Ue=M.death.getClip().duration||1,Se=Math.min(Ue-.001,Math.max(0,_e/1e3));return ye("death",Se,{clockMs:_e,instant:_e>=Ue*1e3}),!0}let Me={right:v,left:C,head:R,blade:v,bow:C,model:d,motion:m,mixer:y,isSkinned:Object.keys(i).length>0,reset:ge,equip:ie,idle:Te,walk:De,pose:pe,hit:we,death:Be,dispose(){H||(H=!0,y.stopAllAction(),y.uncacheRoot(d),d.traverse(_e=>{_e.skeleton&&_e.skeleton.dispose()}),g.forEach(_e=>_e.dispose()),m.removeFromParent(),r--,l())}};return r++,ge(),{model:m,rig:Me,height:t.height*h+.1,ownMaterials:[...g.values()],castKey:e}},dispose(){o=!0,l()}}}async function Ob(s,e,t){let n=await e(s,{signal:t,redirect:"error",credentials:"same-origin",cache:"force-cache"});if(!n.ok||n.redirected)throw new Error(`Model unavailable (${n.status}).`);if(Number(n.headers.get("content-length"))>ch)throw new Error("Model exceeds byte limit.");let r=n.body?.getReader();if(!r){let d=await n.arrayBuffer();if(d.byteLength>ch)throw new Error("Model exceeds byte limit.");return d}let o=[],a=0;try{for(;;){let{value:d,done:f}=await r.read();if(f)break;if(a+=d.byteLength,a>ch)throw new Error("Model exceeds byte limit.");o.push(d)}}catch(d){throw await r.cancel().catch(()=>{}),d}let l=new Uint8Array(a),c=0;for(let d of o)l.set(d,c),c+=d.byteLength;return l.buffer}async function Fb(s,e){Od(s);let t=new Ss;t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i});let n=await new yo(t).parseAsync(s,"");try{return Ub(n,e)}catch(i){throw Km(n.scene),i}}var ka=new Map,Fa=new Map,cs=new Map,Ba=0,hh=new Set,Ud=new Set;function Zm(s){return Ud.add(s),()=>Ud.delete(s)}function Fd(){return Object.fromEntries(Ym.map(s=>[s,cs.get(s)?.status||"unprepared"]))}function Bd(){return Object.fromEntries(Pb.map(s=>[s,cs.get(s)?.status||"unprepared"]))}function uh(){let s=cs.get("ilyra")||cs.get("curogana");return{status:s?.status||"loaded",url:s?.url||null,error:s?.error||null,cast:Fd(),undead:Bd()}}function $m(s){let e=dr(s);return e&&ka.get(e)?.createInstance(s)||null}function Jm(s){let e=dr(s);return e?ka.has(e):!1}function kd(s,{pageURL:e=globalThis.location?.href,fetcher:t=globalThis.fetch}={}){if(!Object.hasOwn(ur,s))return Promise.resolve("unknown");if(Fa.has(s))return Fa.get(s);let n;try{if(n=new URL("./"+lh(ur[s].file),new URL("./",e)),n.origin!==new URL(e).origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported model origin.")}catch(a){cs.set(s,{status:"fallback",error:String(a.message)});let l=Promise.resolve("fallback");return Fa.set(s,l),l}let i=Ba,r=new AbortController;hh.add(r),cs.set(s,{status:"loading",url:n.href,error:null});let o=(async()=>{let a=setTimeout(()=>r.abort(),Ib);try{let l=await Ob(n.href,t,r.signal),c=await Fb(l,s);if(Ba!==i||r.signal.aborted)return c.dispose(),"disposed";ka.set(s,c),cs.set(s,{status:"loaded",url:n.href,error:null});for(let d of[...Ud])try{d(s)}catch{}return"loaded"}catch(l){return Ba===i&&cs.set(s,{status:"fallback",url:n.href,error:String(l.message)}),Ba===i?"fallback":"disposed"}finally{clearTimeout(a),hh.delete(r)}})();return Fa.set(s,o),o}async function jm(s={}){let e=s.keys?s.keys.filter(t=>Object.hasOwn(ur,t)):Ym;return await Promise.all(e.map(t=>kd(t,s))),uh()}function Qm(){Ba++,hh.forEach(s=>s.abort()),hh.clear(),ka.forEach(s=>s.dispose()),ka=new Map,Fa=new Map,cs=new Map}var e0=Object.freeze([{id:"ossuary",label:"Ancient Ossuary",preset:"bone_patrol",moteColor:"#d9d2be"},{id:"catacombs",label:"Mossy Ruin Court",preset:"ghoul_pack",moteColor:"#a8d48a"},{id:"caverns",label:"Frosted Soul Caverns",preset:"haunting",moteColor:"#7be8f2"},{id:"reliquary",label:"Gothic Reliquary",preset:"wights_retinue",moteColor:"#d8c49e"},{id:"sanctum",label:"Obsidian Sanctum",preset:"two_wights",moteColor:"#b98cff"},{id:"crucible",label:"Infernal Crucible",preset:"whole_crypt",moteColor:"#ff8538"},{id:"forged_hall",label:"Dwarven Forged Hall",preset:"vault",moteColor:"#f2be6b"},{id:"woodland",label:"Whispering Woodland",preset:null,moteColor:"#e2f2a0"},{id:"mausoleum",label:"Gothic Mausoleum",preset:null,moteColor:"#c48fff"},{id:"mausoleum_crypt",label:"Violet Ossuary",preset:null,moteColor:"#c9a6ff"},{id:"mausoleum_caves",label:"Violet Caverns",preset:null,moteColor:"#b98cff"}]),t0=Object.freeze({bone_patrol:"ossuary",ghoul_pack:"catacombs",haunting:"caverns",wights_retinue:"reliquary",two_wights:"sanctum",whole_crypt:"crucible",vault:"forged_hall"}),Bb={vault:"forged_hall",caves:"caverns",pillars:"reliquary",rooms:"ossuary",open:"crucible"},Cn={ossuary:{id:"ossuary",bg:"#090d10",fog:"#090d10",slab:"#14181b",rim:"#786240",frame:"#1e2428",wallCap:"#565852",wallJoint:"#202321",pillarBody:"#62645c",pillarTrim:"#42453f",hemiSky:"#b8c4cf",hemiGround:"#343638",keyColor:"#ffd9a0",fillColor:"#5c7c99",torchColor:"#ff9c42",crystalColor:null,moteColor:"#ded6c1",floorRoughness:.88,floorMetalness:.04,bumpScale:.045},catacombs:{id:"catacombs",bg:"#080e0c",fog:"#080e0c",slab:"#111916",rim:"#526348",frame:"#1a2621",wallCap:"#455046",wallJoint:"#19221b",pillarBody:"#4d584d",pillarTrim:"#333d34",hemiSky:"#a8ccb8",hemiGround:"#29332b",keyColor:"#ffd296",fillColor:"#4c8577",torchColor:"#ff9638",crystalColor:null,moteColor:"#a8d98c",floorRoughness:.72,floorMetalness:.06,bumpScale:.055},caverns:{id:"caverns",bg:"#070e14",fog:"#070e14",slab:"#0f1a22",rim:"#486e78",frame:"#172630",wallCap:"#445863",wallJoint:"#18252e",pillarBody:"#495d69",pillarTrim:"#2f404a",hemiSky:"#a6dce8",hemiGround:"#273842",keyColor:"#cbe6ff",fillColor:"#3ec8d8",torchColor:"#6be4ff",crystalColor:"#56f0ff",moteColor:"#82f0ff",floorRoughness:.64,floorMetalness:.1,bumpScale:.052},reliquary:{id:"reliquary",bg:"#090b11",fog:"#090b11",slab:"#131620",rim:"#8f7244",frame:"#1d212e",wallCap:"#4d5261",wallJoint:"#1b1e29",pillarBody:"#555a6b",pillarTrim:"#7d653e",hemiSky:"#c6cee6",hemiGround:"#2f3240",keyColor:"#ffddab",fillColor:"#6682b8",torchColor:"#ffa247",crystalColor:null,moteColor:"#e6d2ab",floorRoughness:.44,floorMetalness:.16,bumpScale:.032},sanctum:{id:"sanctum",bg:"#090710",fog:"#090710",slab:"#13101d",rim:"#6f528f",frame:"#1d182b",wallCap:"#3e384f",wallJoint:"#161221",pillarBody:"#383347",pillarTrim:"#6c4f8c",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f5d0ff",fillColor:"#7e5ce0",torchColor:"#bf75ff",crystalColor:"#b366ff",moteColor:"#c48fff",floorRoughness:.48,floorMetalness:.2,bumpScale:.042,emissive:"#8f4dff",emissiveIntensity:.55},crucible:{id:"crucible",bg:"#0f0807",fog:"#0f0807",slab:"#1a1110",rim:"#99522c",frame:"#261816",wallCap:"#473936",wallJoint:"#1c1210",pillarBody:"#423533",pillarTrim:"#7d4427",hemiSky:"#e8c2ad",hemiGround:"#38231e",keyColor:"#ffbe7d",fillColor:"#bd4e2b",torchColor:"#ff6e24",crystalColor:"#ff5e1f",moteColor:"#ff8a3d",floorRoughness:.78,floorMetalness:.12,bumpScale:.055,emissive:"#ff5917",emissiveIntensity:.85},forged_hall:{id:"forged_hall",bg:"#0b0e10",fog:"#0b0e10",slab:"#161b1e",rim:"#8a693d",frame:"#22292d",wallCap:"#5c615d",wallJoint:"#222726",pillarBody:"#636964",pillarTrim:"#7d623b",hemiSky:"#d4cfc2",hemiGround:"#383834",keyColor:"#ffd89e",fillColor:"#5b8a96",torchColor:"#ff963b",crystalColor:null,moteColor:"#f0c475",floorRoughness:.8,floorMetalness:.08,bumpScale:.046},woodland:{id:"woodland",bg:"#08100c",fog:"#0a130e",slab:"#151b14",rim:"#6b573b",frame:"#232a1e",wallCap:"#4c5e3c",wallJoint:"#21281d",pillarBody:"#555b52",pillarTrim:"#6b5539",hemiSky:"#d4e6d6",hemiGround:"#343c2b",keyColor:"#ffe7ba",fillColor:"#66a89c",torchColor:"#ffd478",crystalColor:null,moteColor:"#e2f2a0",flame:Object.freeze({ember:"#f5a638",outer:"#ffd875",core:"#fff7d1"}),floorRoughness:.9,floorMetalness:.02,bumpScale:.046}},zd=Object.freeze({ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"});Cn.mausoleum={...Cn.reliquary,id:"mausoleum",base:"reliquary",bg:"#0a0710",fog:"#0a0710",slab:"#14101c",rim:"#6f528f",frame:"#1d182b",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f0dcff",fillColor:"#7e5ce0",torchColor:"#bf75ff",moteColor:"#c48fff",flame:zd,veinColor:"rgba(196, 150, 255, 0.22)",inlay:"#6c5a8c",textures:{floor:{albedo:"textures/mausoleum/floor_albedo.webp",normal:"textures/mausoleum/floor_normal.webp",orm:"textures/mausoleum/floor_orm.webp"},floorAlt:{albedo:"textures/mausoleum/floor_slab_albedo.webp",normal:"textures/mausoleum/floor_slab_normal.webp",orm:"textures/mausoleum/floor_slab_orm.webp"},wall:{albedo:"textures/mausoleum/wall_albedo.webp",normal:"textures/mausoleum/wall_normal.webp",orm:"textures/mausoleum/wall_orm.webp"},window:"textures/mausoleum/window_albedo.webp"}};Cn.mausoleum_crypt={...Cn.ossuary,id:"mausoleum_crypt",base:"ossuary",bg:"#0a080e",fog:"#0a080e",rim:"#6a5a7e",hemiSky:"#c4b8dc",hemiGround:"#2c2834",fillColor:"#6e58b8",torchColor:"#b56dff",moteColor:"#c9a6ff",flame:zd};Cn.mausoleum_caves={...Cn.caverns,id:"mausoleum_caves",base:"caverns",bg:"#0a0712",fog:"#0a0712",slab:"#140f1e",rim:"#5e4a7a",frame:"#1b1528",wallCap:"#4a4258",wallJoint:"#1a1524",pillarBody:"#4d4560",pillarTrim:"#342c44",hemiSky:"#c7b6e8",hemiGround:"#2a2238",keyColor:"#e4d2ff",fillColor:"#8a5ee0",torchColor:"#b870ff",crystalColor:"#b366ff",moteColor:"#b98cff",flame:zd,veinColor:"rgba(196, 150, 255, 0.45)"};function n0(s,e){if(e&&e!=="auto"){let n=Bb[e]||e;if(Cn[n])return Cn[n]}if(s?.theme&&Cn[s.theme])return Cn[s.theme];if(s?.scene?.theme&&Cn[s.scene.theme])return Cn[s.scene.theme];if(Array.isArray(s?.tiles)&&s.tiles.some(n=>typeof n=="string"&&n.includes("T")))return Cn.woodland;let t=String(s?.family||s?.name||"").toLowerCase();return t.includes("glade")||t.includes("hollow")||t.includes("mire")||t.includes("forest")||t.includes("wood")?Cn.woodland:t.includes("cave")?Cn.caverns:t.includes("pillar")||t.includes("hall")?Cn.reliquary:t.includes("room")?Cn.ossuary:t.includes("open")?Cn.crucible:Cn.forged_hall}function vt(s,e,t=1){let n=Math.imul(s*374761393+e*668265263+t*1442695041,1274126177);return n=(n^n>>>13)>>>0,n%1e4/1e4}function Ps(s,e,t,n,i){let r=document.createElement("canvas");r.width=t,r.height=t,i(r.getContext("2d"),t);let o=new es(r);return n&&(o.colorSpace=jt),o.wrapS=ii,o.wrapT=ii,o.anisotropy=Math.min(8,s.capabilities.getMaxAnisotropy()),e.add(o),o}function Hi(s,e,t=.14,n=.08,i=1800){for(let r=0;r<i;r++){let o=Math.floor(vt(r,1,7)*e),a=Math.floor(vt(r,2,13)*e),l=1+r%3,c=1+(r>>1)%3;s.fillStyle=r%2===0?`rgba(0,0,0,${t})`:`rgba(255,255,255,${n})`,s.fillRect(o,a,l,c)}}function ai(s,e,t,n,i=1.6){s.strokeStyle=n,s.lineWidth=i,s.lineCap="round";for(let r=0;r<t;r++){let o=vt(r,10,31)*e*.8+e*.1,a=vt(r,20,37)*e*.8+e*.1;s.beginPath(),s.moveTo(o,a);for(let l=0;l<5;l++)o+=(vt(r*7+l,3,41)-.5)*(e*.18),a+=(vt(r*7+l,9,43)-.5)*(e*.18),s.lineTo(o,a);s.stroke()}}function i0(s,e,t,n){let i=`pbr-floor:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=null,l=Ps(e,t,o,!0,h=>{if(h.fillStyle="#1b1e20",h.fillRect(0,0,o,o),r==="ossuary"){h.fillStyle="#5c5a52",h.fillRect(8,8,o-16,o-16);let u=88;h.fillStyle="#252624";for(let[_,p]of[[0,0],[o,0],[0,o],[o,o],[o/2,o/2]])h.beginPath(),h.moveTo(_,p-u),h.lineTo(_+u,p),h.lineTo(_,p+u),h.lineTo(_-u,p),h.closePath(),h.fill(),h.strokeStyle="#191a18",h.lineWidth=6,h.stroke();let g=h.createRadialGradient(o/2,o/2,40,o/2,o/2,o*.68);g.addColorStop(0,"rgba(138,132,118,0.22)"),g.addColorStop(1,"rgba(20,22,20,0.42)"),h.fillStyle=g,h.fillRect(0,0,o,o),Hi(h,o,.16,.09,2400),ai(h,o,5,"rgba(22,22,20,0.65)",2.2),h.strokeStyle="#1c1d1b",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else if(r==="catacombs"){h.fillStyle="#263324",h.fillRect(0,0,o,o);let u=3,g=o/u;for(let _=0;_<u;_++)for(let p=0;p<u;p++){let m=(p+.5)*g+(vt(p,_,3)-.5)*22,y=(_+.5)*g+(vt(p,_,5)-.5)*22,M=g*(.39+vt(p,_,7)*.08),v=g*(.38+vt(p,_,11)*.08),C=62+Math.floor(vt(p,_,17)*24);h.fillStyle=`rgb(${C},${C+5},${C-2})`,h.beginPath();for(let R=0;R<8;R++){let b=R/8*Math.PI*2,w=.88+vt(p*8+R,_,19)*.2,z=m+Math.cos(b)*M*w,I=y+Math.sin(b)*v*w;R===0?h.moveTo(z,I):h.lineTo(z,I)}h.closePath(),h.fill(),h.strokeStyle="rgba(20,28,18,0.85)",h.lineWidth=5,h.stroke()}for(let _=0;_<48;_++){let p=vt(_,4,29)*o,m=vt(_,8,31)*o,y=8+vt(_,2,37)*24,M=h.createRadialGradient(p,m,2,p,m,y);M.addColorStop(0,"rgba(62, 92, 46, 0.55)"),M.addColorStop(1,"rgba(42, 66, 34, 0)"),h.fillStyle=M,h.beginPath(),h.arc(p,m,y,0,Math.PI*2),h.fill()}Hi(h,o,.18,.07,2200)}else if(r==="caverns"){h.fillStyle="#33434d",h.fillRect(0,0,o,o);for(let u=-o;u<o*2;u+=28)h.fillStyle=u%56===0?"rgba(20,30,38,0.36)":"rgba(130,175,196,0.10)",h.beginPath(),h.moveTo(u,0),h.lineTo(u+18,0),h.lineTo(u-o*.55+18,o),h.lineTo(u-o*.55,o),h.closePath(),h.fill();Hi(h,o,.16,.08,2e3),ai(h,o,7,s.veinColor||"rgba(165, 232, 248, 0.48)",2),ai(h,o,5,"rgba(12, 20, 26, 0.72)",3),h.strokeStyle="rgba(18, 28, 36, 0.85)",h.lineWidth=8,h.strokeRect(3,3,o-6,o-6)}else if(r==="reliquary")h.fillStyle="#252833",h.fillRect(0,0,o,o),ai(h,o,9,"rgba(195, 202, 222, 0.22)",2.4),ai(h,o,6,s.veinColor||"rgba(214, 174, 108, 0.20)",1.5),h.strokeStyle=s.inlay||"#8c6e42",h.lineWidth=5,h.strokeRect(18,18,o-36,o-36),h.strokeStyle="#59462b",h.lineWidth=2,h.strokeRect(28,28,o-56,o-56),Hi(h,o,.1,.05,1200),h.strokeStyle="#12141c",h.lineWidth=9,h.strokeRect(4,4,o-8,o-8);else if(r==="sanctum"){h.fillStyle="#1e1929",h.fillRect(0,0,o,o);let u=96,g=[[o*.25,o*.25],[o*.75,o*.25],[o*.5,o*.5],[o*.25,o*.75],[o*.75,o*.75]];for(let[_,p]of g){h.fillStyle="#2a2438",h.beginPath();for(let m=0;m<6;m++){let y=m/6*Math.PI*2+Math.PI/6,M=_+Math.cos(y)*u,v=p+Math.sin(y)*u;m===0?h.moveTo(M,v):h.lineTo(M,v)}h.closePath(),h.fill(),h.strokeStyle="#6f4ca8",h.lineWidth=3.5,h.stroke()}Hi(h,o,.15,.06,1600),h.strokeStyle="#120e1a",h.lineWidth=8,h.strokeRect(4,4,o-8,o-8)}else if(r==="crucible"){h.fillStyle="#2b2220",h.fillRect(0,0,o,o);let u=h.createRadialGradient(o/2,o/2,30,o/2,o/2,o*.65);u.addColorStop(0,"rgba(68,52,48,0.35)"),u.addColorStop(1,"rgba(18,12,10,0.65)"),h.fillStyle=u,h.fillRect(0,0,o,o),Hi(h,o,.22,.06,2600),ai(h,o,6,"rgba(255, 102, 28, 0.78)",3.2),ai(h,o,6,"rgba(255, 206, 112, 0.55)",1.3),h.strokeStyle="#170f0d",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else if(r==="woodland"){h.fillStyle="#483d2e",h.fillRect(0,0,o,o);for(let u=0;u<26;u++){let g=vt(u,3,101)*o,_=vt(u,7,103)*o,p=38+vt(u,11,107)*86,m=h.createRadialGradient(g,_,4,g,_,p);m.addColorStop(0,u%2===0?"rgba(92, 76, 52, 0.34)":"rgba(38, 31, 22, 0.36)"),m.addColorStop(1,"rgba(60, 50, 36, 0)"),h.fillStyle=m,h.beginPath(),h.arc(g,_,p,0,Math.PI*2),h.fill()}for(let u=0;u<44;u++){let g=vt(u,4,109)*o,_=vt(u,9,113)*o,p=26+vt(u,2,127)*68,m=h.createRadialGradient(g,_,4,g,_,p),y=u%3===0?["rgba(62, 88, 44, 0.62)","rgba(50, 74, 36, 0)"]:u%3===1?["rgba(78, 98, 50, 0.50)","rgba(62, 82, 42, 0)"]:["rgba(46, 68, 38, 0.56)","rgba(38, 58, 32, 0)"];m.addColorStop(0,y[0]),m.addColorStop(1,y[1]),h.fillStyle=m,h.beginPath(),h.arc(g,_,p,0,Math.PI*2),h.fill()}h.lineCap="round";for(let u=0;u<9;u++){let g=vt(u,1,131)*o,_=vt(u,2,137)*o,p=2+vt(u,5,139)*3;h.strokeStyle=u%2===0?"rgba(38, 28, 19, 0.72)":"rgba(66, 50, 34, 0.55)",h.lineWidth=p,h.beginPath(),h.moveTo(g,_);for(let m=0;m<4;m++)g+=(vt(u*5+m,6,149)-.5)*110,_+=(vt(u*5+m,8,151)-.5)*110,h.lineTo(g,_);h.stroke()}for(let u=0;u<180;u++){let g=vt(u,3,157)*o,_=vt(u,7,163)*o,p=5+vt(u,11,167)*9,m=(vt(u,13,173)-.5)*1.4-Math.PI/2;h.strokeStyle=u%3===0?"rgba(104, 128, 66, 0.45)":"rgba(54, 78, 40, 0.50)",h.lineWidth=1.4,h.beginPath(),h.moveTo(g,_),h.lineTo(g+Math.cos(m)*p,_+Math.sin(m)*p),h.stroke()}for(let u=0;u<42;u++){let g=vt(u,2,179)*o,_=vt(u,5,181)*o,p=2.5+vt(u,9,191)*3.5;h.fillStyle=u%3===0?"rgba(130, 96, 54, 0.55)":u%3===1?"rgba(106, 84, 48, 0.52)":"rgba(110, 108, 96, 0.42)",h.beginPath(),h.ellipse(g,_,p*1.35,p*.72,vt(u,12,193)*Math.PI,0,Math.PI*2),h.fill()}Hi(h,o,.14,.06,2e3),h.strokeStyle="rgba(20, 25, 17, 0.56)",h.lineWidth=6,h.strokeRect(3,3,o-6,o-6)}else{h.fillStyle="#4e5452",h.fillRect(0,0,o,o),h.strokeStyle="#232726",h.lineWidth=7,h.strokeRect(5,5,o-10,o-10),h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.moveTo(o*.25,o/2),h.lineTo(o*.25,o),h.moveTo(o*.75,o/2),h.lineTo(o*.75,o),h.stroke(),h.fillStyle="#7c633e";for(let[u,g]of[[24,24],[o-24,24],[24,o-24],[o-24,o-24]])h.beginPath(),h.arc(u,g,7,0,Math.PI*2),h.fill();Hi(h,o,.16,.08,2200),ai(h,o,3,"rgba(24,28,27,0.55)",1.8)}}),c=Ps(e,t,o,!1,h=>{if(h.fillStyle="#d8d8d8",h.fillRect(0,0,o,o),h.strokeStyle="#181818",h.lineWidth=14,h.strokeRect(5,5,o-10,o-10),r==="catacombs"){let u=o/3;h.lineWidth=10;for(let g=1;g<3;g++)h.beginPath(),h.moveTo(g*u,0),h.lineTo(g*u,o),h.stroke(),h.beginPath(),h.moveTo(0,g*u),h.lineTo(o,g*u),h.stroke()}else if(r==="forged_hall")h.lineWidth=9,h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.stroke();else if(r==="woodland"){h.fillStyle="#a8a8a8",h.fillRect(0,0,o,o);for(let u=0;u<36;u++){let g=vt(u,4,109)*o,_=vt(u,9,113)*o,p=24+vt(u,2,127)*58,m=h.createRadialGradient(g,_,4,g,_,p);m.addColorStop(0,u%2===0?"rgba(235,235,235,0.42)":"rgba(65,65,65,0.34)"),m.addColorStop(1,"rgba(168,168,168,0)"),h.fillStyle=m,h.beginPath(),h.arc(g,_,p,0,Math.PI*2),h.fill()}h.strokeStyle="#383838",h.lineWidth=8,h.strokeRect(4,4,o-8,o-8)}Hi(h,o,.22,.18,2600),r!=="woodland"&&ai(h,o,6,"#141414",3)}),d=Ps(e,t,o,!1,h=>{let u=Math.round(s.floorRoughness*255);h.fillStyle=`rgb(${u},${u},${u})`,h.fillRect(0,0,o,o);for(let g=0;g<24;g++){let _=vt(g,5,61)*o,p=vt(g,9,67)*o,m=24+vt(g,3,71)*56,y=h.createRadialGradient(_,p,4,_,p,m),M=r==="catacombs"||r==="caverns"||r==="reliquary";y.addColorStop(0,M?"rgba(45,45,45,0.65)":"rgba(240,240,240,0.35)"),y.addColorStop(1,"rgba(128,128,128,0)"),h.fillStyle=y,h.beginPath(),h.arc(_,p,m,0,Math.PI*2),h.fill()}});s.emissive&&(a=Ps(e,t,o,!0,h=>{h.fillStyle="#000000",h.fillRect(0,0,o,o),r==="crucible"?(ai(h,o,6,"#ff6a1a",3.4),ai(h,o,6,"#ffd27d",1.2)):r==="sanctum"&&(h.strokeStyle="#9d5cff",h.lineWidth=2.6,h.strokeRect(22,22,o-44,o-44),ai(h,o,4,"#8b47ff",2))}));let f=new kn({map:l,bumpMap:c,bumpScale:s.bumpScale,roughnessMap:d,roughness:1,metalness:s.floorMetalness,...a?{emissive:new at("#ffffff"),emissiveMap:a,emissiveIntensity:s.emissiveIntensity}:{}});return n.set(i,f),f}function s0(s,e,t,n){let i=`pbr-wall:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=(f,h)=>{if(r==="woodland"){f.fillStyle=h?"#a0a0a0":"#40453e",f.fillRect(0,0,o,o);for(let u=0;u<26;u++){let g=vt(u,3,211)*o,_=vt(u,7,223)*o,p=28+vt(u,11,227)*68,m=f.createRadialGradient(g,_,4,g,_,p),y=u%2===0;m.addColorStop(0,h?y?"rgba(235,235,235,0.40)":"rgba(42,42,42,0.42)":y?"rgba(104,108,98,0.28)":"rgba(24,28,24,0.46)"),m.addColorStop(1,"rgba(64,68,62,0)"),f.fillStyle=m,f.beginPath(),f.arc(g,_,p,0,Math.PI*2),f.fill()}if(ai(f,o,10,h?"#1a1a1a":"rgba(18, 22, 18, 0.78)",h?5:3.4),!h){let u=f.createLinearGradient(0,0,0,o*.36);u.addColorStop(0,"rgba(42, 68, 30, 0.72)"),u.addColorStop(1,"rgba(42, 68, 30, 0)"),f.fillStyle=u,f.fillRect(0,0,o,o*.36);let g=f.createLinearGradient(0,o,0,o*.62);g.addColorStop(0,"rgba(30, 50, 22, 0.82)"),g.addColorStop(1,"rgba(30, 50, 22, 0)"),f.fillStyle=g,f.fillRect(0,o*.62,o,o*.38)}}else if(r==="caverns"){f.fillStyle=h?"#9e9e9e":"#32414a",f.fillRect(0,0,o,o);for(let u=0;u<o;u+=34){f.strokeStyle=h?"#202020":"#18232b",f.lineWidth=h?7:5,f.beginPath(),f.moveTo(0,u);for(let g=0;g<=o;g+=48)f.lineTo(g,u+(vt(g,u,83)-.5)*20);f.stroke()}}else if(r==="reliquary"){f.fillStyle=h?"#c8c8c8":"#3a3f4d",f.fillRect(0,0,o,o);for(let u=32;u<o;u+=64)f.fillStyle=h?"#505050":"#282c38",f.fillRect(u-10,36,20,o-72);h||(f.fillStyle="#755c38",f.fillRect(0,24,o,10),f.fillRect(0,o-34,o,10))}else{let u={ossuary:"#4d4c45",catacombs:"#3b453b",sanctum:"#282336",crucible:"#332624",forged_hall:"#454a48"};f.fillStyle=h?"#cccccc":u[r]||"#454a48",f.fillRect(0,0,o,o);let g=r==="sanctum"?3:5,_=o/g;for(let p=0;p<g;p++){let m=p*_,y=p%2*(o/4);if(!h)for(let M=0;M<4;M++){let v=(y+M*(o/2))%o,C=(vt(M,p,97)-.5)*18;f.fillStyle=C>0?`rgba(255,255,255,${C/255})`:`rgba(0,0,0,${-C/255})`,f.fillRect(v,m+3,o/2-4,_-6)}f.strokeStyle=h?"#1a1a1a":r==="crucible"?"#5e2414":"#1b1e1d",f.lineWidth=h?9:6,f.beginPath(),f.moveTo(0,m),f.lineTo(o,m),f.stroke();for(let M of[y+o*.25,y+o*.75]){let v=M%o;f.beginPath(),f.moveTo(v,m),f.lineTo(v,m+_),f.stroke()}}if(!h&&r==="catacombs"){let p=f.createLinearGradient(0,o,0,o*.45);p.addColorStop(0,"rgba(38, 66, 32, 0.72)"),p.addColorStop(1,"rgba(38, 66, 32, 0)"),f.fillStyle=p,f.fillRect(0,o*.45,o,o*.55)}}if(Hi(f,o,.18,.08,2e3),!h){let u=f.createLinearGradient(0,o,0,o*.78);u.addColorStop(0,"rgba(0,0,0,0.48)"),u.addColorStop(1,"rgba(0,0,0,0)"),f.fillStyle=u,f.fillRect(0,o*.78,o,o*.22)}},l=Ps(e,t,o,!0,f=>a(f,!1)),c=Ps(e,t,o,!1,f=>a(f,!0)),d=new kn({map:l,bumpMap:c,bumpScale:.05,roughness:.84,metalness:.06});return n.set(i,d),d}function r0(s,e){let n=Ps(s,e,256,!0,r=>{r.fillStyle="#5c402b",r.fillRect(0,0,256,256);for(let o=0;o<110;o++){let a=o*29%256;r.strokeStyle=o%3===0?"rgba(22,13,8,0.45)":"rgba(130,94,62,0.25)",r.lineWidth=1+o%3,r.beginPath(),r.moveTo(0,a),r.bezierCurveTo(76.8,a+6,179.2,a-7,256,a+1),r.stroke()}r.strokeStyle="rgba(14,8,5,0.68)",r.lineWidth=3;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke()}),i=Ps(s,e,256,!1,r=>{r.fillStyle="#c4c4c4",r.fillRect(0,0,256,256),r.strokeStyle="#222222",r.lineWidth=4;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke();for(let o=0;o<90;o++){let a=o*31%256;r.strokeStyle="#777777",r.lineWidth=1.2,r.beginPath(),r.moveTo(0,a),r.lineTo(256,a+2),r.stroke()}});return{map:n,bump:i}}var kb=2*1024*1024,zb=3*1024*1024,Hb=15e3,Hd=new Map,Gd=new Map;function Gb(s,e=globalThis.location?.href){let t=new URL("./",e),n=new URL(s,t);if(n.origin!==t.origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported asset origin.");return n.href}async function o0(s,e,t){let n=new AbortController,i=setTimeout(()=>n.abort(),Hb);try{let r=await fetch(Gb(lh(s)),{signal:n.signal,redirect:"error",credentials:"same-origin",cache:"default"});if(!r.ok||r.redirected)throw new Error(`asset ${r.status}`);let o=String(r.headers.get("content-type")||"").split(";")[0].trim();if(t&&!t.includes(o))throw new Error(`asset type ${o}`);if(Number(r.headers.get("content-length"))>e)throw new Error("asset too large");let l=await r.arrayBuffer();if(l.byteLength>e)throw new Error("asset too large");return{buffer:l,type:o}}finally{clearTimeout(i)}}function Vb(s){return Hd.has(s)||Hd.set(s,(async()=>{try{let{buffer:e,type:t}=await o0(s,kb,["image/webp","image/png"]);return await createImageBitmap(new Blob([e],{type:t}),{imageOrientation:"flipY"})}catch{return null}})()),Hd.get(s)}async function za(s,{srgb:e=!1,repeat:t=!0,anisotropy:n=4}={}){let i=await Vb(s);if(!i)return null;let r=new xn(i);return r.flipY=!1,e&&(r.colorSpace=jt),t&&(r.wrapS=r.wrapT=ii),r.anisotropy=n,r.needsUpdate=!0,r}async function dh(s,e,t,{anisotropy:n=4}={}){if(!e||!s)return!1;let[i,r,o]=await Promise.all([za(e.albedo,{srgb:!0,anisotropy:n}),e.normal?za(e.normal,{anisotropy:n}):null,e.orm?za(e.orm,{anisotropy:n}):null]);if(!i)return[r,o].forEach(a=>a?.dispose()),!1;for(let a of[i,r,o])a&&t(a);return s.map=i,s.color?.set?.("#ffffff"),r&&(s.normalMap=r,s.normalScale=new Ee(.9,.9),s.bumpMap=null),o&&(s.aoMap=o,s.aoMapIntensity=.85,s.roughnessMap=o,s.metalnessMap=o,s.roughness=1,s.metalness=1),s.emissiveMap=null,s.needsUpdate=!0,!0}function a0(s){return Gd.has(s)||Gd.set(s,(async()=>{try{let{buffer:e}=await o0(s,zb,["model/gltf-binary","application/octet-stream"]);Od(e);let t=new Ss;return t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i}),(await new yo(t).parseAsync(e,"")).scene}catch{return null}})()),Gd.get(s)}function Wb(s,e,t){let n=(e-s+Math.PI)%(Math.PI*2)-Math.PI;return n<-Math.PI&&(n+=Math.PI*2),s+n*t}function Xb(s){try{let e=s.getExtension("WEBGL_debug_renderer_info"),t=String(e?s.getParameter(e.UNMASKED_RENDERER_WEBGL):s.getParameter(s.RENDERER));return/swiftshader|llvmpipe|software|softpipe|basic render/i.test(t)?"low":"high"}catch{return"high"}}var qb=1e3/30;function Yb({container:s,onCell:e,onHover:t,onCameraChange:n,onReady:i,onUnavailable:r,idleAnimation:o=!1}={}){if(!s)throw new Error("A tabletop container is required.");let a=document.createElement("canvas");a.dataset.emberScene="webgl",a.dataset.renderer="webgl",a.setAttribute("aria-label","3D tabletop. Drag to orbit, pinch or scroll to zoom.");let l,c=a.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"});if(!c)throw r?.("WebGL 2 is unavailable on this device."),new Error("WebGL 2 is unavailable on this device.");try{l=new Qc({canvas:a,context:c,antialias:!0})}catch(x){throw r?.("The 3D tabletop could not initialize."),x}let d=Xb(c),f=d==="low"?1:2;l.setPixelRatio(Math.min(window.devicePixelRatio||1,f)),l.outputColorSpace=jt,l.toneMapping=Sa,l.toneMappingExposure=1.26,l.shadowMap.enabled=!0,l.shadowMap.type=nr,l.shadowMap.autoUpdate=!1,l.shadowMap.needsUpdate=!0,s.appendChild(a),s.dataset.renderer="webgl";let h=new Ko;h.background=new at("#111a1f"),h.fog=new Yo("#111a1f",29,76);let u=new bn(38,1,.1,140),g=new ih(u,a);g.enableDamping=!1,g.minPolarAngle=.04,g.maxPolarAngle=1.46,g.minDistance=2.1,g.maxDistance=42,g.screenSpacePanning=!1,g.panSpeed=.72,g.rotateSpeed=.72,g.zoomSpeed=.9;let _=window.matchMedia?.("(prefers-reduced-motion: reduce)"),p=!!_?.matches,m=!!o&&!p,y="smart",M=null,v=new We,C=new We,R=new We,b=new We,w=new We,z=new We;h.add(v,C,b,w,z,R);let I=new hn({visible:!1}),H=new ga("#dcefeb","#59616b",2.15);h.add(H);let V=new Es("#ffe0ad",3.45);V.position.set(-5,13,7),V.castShadow=!0,V.shadow.mapSize.set(d==="low"?1024:2048,d==="low"?1024:2048),Object.assign(V.shadow.camera,{left:-12,right:12,top:11,bottom:-11,near:.5,far:55}),V.shadow.normalBias=.03,V.shadow.bias=-2e-4,h.add(V,V.target);let G=new Es("#62b8c9",1.35);G.position.set(8,5,-6),h.add(G);let U=new Map,$=new Map,ne=new Set,Y=new Map,ye=[],ie=[],ge=[],Te="forged_hall",De=null,rt="",W=10,pe=8,we=!1,Be=!1,Me=0,_e=!1,Ue=!1,Se=null,Fe=new Set,tt=new Ma,Ye=new Ee,ht=new Gn(new D(0,1,0),-.025),xt=new D,Dt=new D,lt=new Vt,Xt=Fm({scene:h,units:Y,requestRender:_n,reducedMotion:p}),ut=null,zt=null,un=!1,dn=new D(.54,.92,1.13).normalize(),J=!1,dt=null,Nt="",Lt=null,Oe=!0,Qt=!0,it=!1,ze=null,N="tactical",A=null,se=null,Pe=[];function he(x,S){return U.has(x)||U.set(x,S()),U.get(x)}let re=he("box",()=>new Ii(1,1,1)),Ce=he("sphere",()=>new Js(1,2)),fe=he("rock",()=>{let x=new ra(1,1),S=x.attributes.position;for(let T=0;T<S.count;T++){let E=S.getX(T),L=S.getY(T),F=S.getZ(T),q=Math.sin(E*3.7+L*2.3)*Math.cos(F*4.1-E*1.9),k=Math.cos(L*5.3-F*3.1+E*2.7),te=.88+.16*q+.08*k;E*=te,F*=te,L=L<0?L*te*.72:L*te*(.94+.08*k),S.setXYZ(T,E,L,F)}return x.computeVertexNormals(),x}),me=he("cone",()=>new Ys(1,1,12)),ve=he("cylinder",()=>new Li(1,1,1,16)),B=he("robe",()=>new Li(.56,1,1,12)),be=he("ring",()=>new Bn(.37,.425,48)),ee=he("active-ring",()=>new Bn(.435,.495,48)),ue=he("plane",()=>new js(1,1));function j(x,S=0,T=.8){let E=`${x}:${S}:${T}`;return $.has(E)||$.set(E,new kn({color:x,metalness:S,roughness:T,flatShading:!1})),$.get(E)}function oe(x,S=1){let T=`glow:${x}:${S}`;return $.has(T)||$.set(T,new hn({color:x,transparent:S<1,opacity:S,depthWrite:S===1,side:Dn})),$.get(T)}function O(x,S,T,E,L,F,q=1,k=q,te=q){let Z=new tn(S,T);return Z.position.set(E,L,F),Z.scale.set(q,k,te),Z.castShadow=!0,Z.receiveShadow=!0,x.add(Z),Z}function je(x,S,T,E){let L=O(x,S,T,0,E,0);return L.rotation.x=-Math.PI/2,L.castShadow=!1,L}function Ie(x,S=256,T=256){let E=document.createElement("canvas");E.width=S,E.height=T,x(E.getContext("2d"),S,T);let L=new es(E);return L.colorSpace=jt,L.anisotropy=Math.min(8,l.capabilities.getMaxAnisotropy()),ne.add(L),L}let st=Ie((x,S,T)=>{let E=x.createRadialGradient(S/2,T/2,6,S/2,T/2,S/2);E.addColorStop(0,"rgba(0,0,0,.74)"),E.addColorStop(1,"rgba(0,0,0,0)"),x.fillStyle=E,x.fillRect(0,0,S,T)},64,64),ft=new hn({map:st,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1});$.set("contact",ft);function He(x){x.traverse(S=>{S.isInstancedMesh&&S.dispose()}),x.clear()}function Ht(x,S,T,E,L=.025){let F=new D(...T),q=new D(...E),k=q.clone().sub(F),te=O(x,ve,S,...F.clone().add(q).multiplyScalar(.5).toArray(),L,k.length(),L);return te.quaternion.setFromUnitVectors(new D(0,1,0),k.normalize()),te}let fn=r0(l,ne);function pn(x){let S=`wood:${x}`;return $.has(S)||$.set(S,new kn({color:x,map:fn.map,bumpMap:fn.bump,bumpScale:.036,roughness:.84,metalness:.04})),$.get(S)}function xo(x,S,T,E,L,F,q,k){let te=j(k,.06,.76),Z=j("#cfc09b",0,.9);O(x,re,Z,S,T,E,L*.8,F*.89,q*.92);for(let Q of[-1,1])O(x,re,te,S+Q*L*.46,T,E,L*.09,F,q);O(x,re,te,S,T,E-q*.48,L,F,q*.08)}function vo(x,S,T,E){O(x,ve,j("#8f6f40",.78,.36),S,T+.014,E,.105,.028,.105),O(x,ve,j("#ddd0ae",0,.65),S,T+.11,E,.047,.18,.047);let L=O(x,me,oe("#ffc15d"),S,T+.248,E,.035,.12,.035);L.rotation.z=-.13,ye.push({flame:L,baseY:T+.248,baseScaleY:.12,phase:S*3.1+E*1.7})}function Ha(x,S,T,E){O(x,ve,j("#535f63",.68,.42),S,T+.07,E,.065,.14,.065),O(x,ve,j("#3b2618",.05,.35),S,T+.142,E,.052,.005,.052);let L=he("mug-handle",()=>new It(.047,.014,6,12));O(x,L,j("#748287",.72,.38),S+.078,T+.075,E)}function Ga(x){let S=`rug:${x}`;if(!$.has(S)){let T=Ie((E,L,F)=>{E.fillStyle=x?"#1d3b42":"#572226",E.fillRect(0,0,L,F);for(let k=0;k<F;k+=3)E.fillStyle=k%6===0?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.04)",E.fillRect(0,k,L,1);E.strokeStyle="#9e7d47",E.lineWidth=5,E.strokeRect(14,14,L-28,F-28),E.strokeStyle=x?"#55786f":"#8c5442",E.lineWidth=9,E.strokeRect(27,27,L-54,F-54);for(let k of[74,49,22])E.fillStyle=k===49?x?"#6b3b30":"#24464a":"#9c7c49",E.beginPath(),E.moveTo(L/2,F/2-k),E.lineTo(L/2+k*.65,F/2),E.lineTo(L/2,F/2+k),E.lineTo(L/2-k*.65,F/2),E.closePath(),E.fill();let q=E.createRadialGradient(L/2,F/2,30,L/2,F/2,L*.68);q.addColorStop(0,"rgba(0,0,0,0)"),q.addColorStop(1,"rgba(0,0,0,0.38)"),E.fillStyle=q,E.fillRect(0,0,L,F)});$.set(S,new kn({map:T,roughness:.96,side:Dn}))}return $.get(S)}function Va(x,S){let T=Number(S.width)||1,E=Number(S.depth)||1,L=pn("#6e503a"),F=pn("#916c4f"),q=pn("#4d3525"),k=j("#2b3236",.78,.38),te=j("#8f6f40",.8,.34),Z=Math.max(.2,Math.min(2.1,Number(S.height)||.8));if(S.kind==="rug"){let Q=O(x,ue,Ga((S.x+S.y)%2===0),0,.008,0,T-.18,E-.18,1);Q.rotation.x=-Math.PI/2,Q.castShadow=!1;for(let Ae of[-1,1])for(let xe=-T/2+.15;xe<T/2-.1;xe+=.09)O(x,re,j("#947b52",0,.95),xe,.006,Ae*(E/2-.065),.022,.006,.1).castShadow=!1}else if(S.kind==="table"){let Q=Z-.06,Ae=Math.max(2,Math.ceil(E/.25));for(let Ve=0;Ve<Ae;Ve++)O(x,re,Ve%2?F:L,0,Q,-E/2+.09+(Ve+.5)*(E-.18)/Ae,T-.16,.12,(E-.18)/Ae-.016);for(let Ve of[-T/2+.22,T/2-.22])for(let K of[-E/2+.22,E/2-.22])O(x,re,q,Ve,(Z-.14)/2,K,.13,Z-.14,.13),O(x,re,te,Ve,.09,K,.15,.07,.15);vo(x,-T*.24,Z,-E*.17),Ha(x,T*.24,Z,E*.2),Ha(x,-T*.19,Z,E*.23);let xe=new We;x.add(xe),xe.position.set(T*.23,Z+.065,-E*.22),xe.rotation.z=Math.PI/2,xe.rotation.y=.14,xo(xe,0,0,0,.09,Math.min(.36,T*.3),Math.min(.31,E*.3),"#5e2824")}else if(S.kind==="bench"){let Q=Math.max(T,E),Ae=Math.min(T,E);E>T&&(x.rotation.y=Math.PI/2),O(x,re,F,0,Z-.06,0,Q-.18,.12,Ae*.58);for(let xe of[-Q/2+.25,Q/2-.25])O(x,re,L,xe,(Z-.12)/2,0,.16,Z-.12,Ae*.44)}else if(S.kind==="shelf"){let Q=Math.max(T,E),Ae=Math.min(T,E),xe=Ae*.72;x.rotation.y=E>T?S.x<W/2?-Math.PI/2:Math.PI/2:S.y<pe/2?Math.PI:0;for(let le of[-Q/2+.12,Q/2-.12])O(x,re,L,le,Z/2,0,.13,Z,xe);let Ve=Z>=1.3?3:2,K=["#5e2824","#274245","#785b2e","#38472e","#3e334d"];for(let le=0;le<=Ve;le++){let Ne=.1+le*(Z-.15)/Ve;if(O(x,re,F,0,Ne,0,Q-.1,.09,xe+.045),le===Ve)continue;let Ke=Math.max(3,Math.floor((Q-.42)/.14));for(let et=0;et<Ke;et++){let ot=(Z-.15)/Ve*(.61+(et+le*3)%4*.065);xo(x,-Q/2+.26+(et+.5)*(Q-.52)/Ke,Ne+.045+ot/2,-xe*.08,(Q-.52)/Ke*.78,ot,xe*.7,K[(et+le*2)%K.length])}}}else if(S.kind==="barrel"){let Q=Math.min(T,E)*.37,Ae=he("barrel",()=>new to([new Ee(0,0),new Ee(.8,0),new Ee(.95,.16),new Ee(1,.5),new Ee(.95,.84),new Ee(.8,1),new Ee(0,1)],16));O(x,Ae,L,0,0,0,Q,Z,Q);for(let[xe,Ve]of[[.12,.94],[.32,1],[.72,1],[.9,.93]])O(x,ve,k,0,xe*Z,0,Q*Ve+.014,.055,Q*Ve+.014);O(x,ve,F,0,Z+.003,0,Q*.79,.022,Q*.79)}else if(S.kind==="crate"){O(x,re,L,0,Z/2,0,T-.22,Z,E-.22);for(let Q of[-1,1]){for(let xe of[.06,Z-.06])O(x,re,F,0,xe,Q*(E/2-.08),T-.16,.1,.08),O(x,re,F,Q*(T/2-.08),xe,0,.08,.1,E-.16);let Ae=O(x,re,F,0,Z/2,Q*(E/2-.065),Math.hypot(T-.43,Z-.19),.085,.045);Ae.rotation.z=Math.atan2(Z-.19,T-.43);for(let xe of[-T/2+.1,T/2-.1])O(x,re,k,xe,Z-.06,Q*(E/2-.07),.09,.11,.09)}}}function li(x){x.updateMatrixWorld(!0);let S=x.matrixWorld.clone().invert(),T=new Map;x.traverse(E=>{if(!E.isMesh)return;let L=`${E.geometry.uuid}:${E.material.uuid}:${E.castShadow}`;T.has(L)||T.set(L,[]),T.get(L).push(E)});for(let E of T.values()){if(E.length<2)continue;let L=E[0],F=new mi(L.geometry,L.material,E.length);F.castShadow=L.castShadow,F.receiveShadow=!0,E.forEach((q,k)=>{F.setMatrixAt(k,new mt().multiplyMatrices(S,q.matrixWorld)),q.removeFromParent()}),F.computeBoundingSphere(),x.add(F)}}function hs(x,S,T){return x.tiles?.[T]?.[S]==="#"}function Mo(x,S,T){return x.tiles?.[T]?.[S]==="T"}function Is(x,S,T){return hs(x,S,T)||Mo(x,S,T)}function fr(x,S,T,E,L){let F=new We;F.position.set(x,T,S),v.add(F);let q=bo(E),k=j("#384036",.04,.92),te=pn("#4c3623");O(F,fe,k,0,.05,0,.14,.08,.13),O(F,ve,te,0,.17,0,.028,.24,.028);let Z=O(F,Ce,oe(q.outer,.9),0,.3,0,.072,.082,.072);Z.castShadow=!1,O(F,Ce,oe(q.core,.95),0,.3,0,.036,.044,.036).castShadow=!1,O(F,me,j("#324426",.02,.9),0,.39,0,.115,.07,.115);let Q=null;L&&(Q=new Si("#ffbf5e",1.65,6.2,1.9),Q.position.set(0,.62,0),F.add(Q)),ye.push({flame:Z,light:Q,baseY:.3,baseScaleY:.082,baseIntensity:1.65,phase:x*2.1+S*3.7})}function Wa(x,S){let T=new We;T.position.set(x,.03,S);let E=x*19+S*37;T.rotation.y=E%12*(Math.PI/6);let L=.94+(x*13+S*29)%5*.032;T.scale.setScalar(L),v.add(T);let F=je(T,ue,ft,.004);F.scale.set(1.06,1.06,1),F.userData.keep=!0;let q=pn("#5a432d"),k=j("#425e32",0,.92),te=j("#2e4c26",0,.9),Z=j("#436631",0,.88),Q=j("#5c7e3b",0,.88);O(T,ve,k,0,.04,0,.38,.08,.38),O(T,ve,q,0,.62,0,.15,1.18,.15);for(let Ae=0;Ae<4;Ae++){let xe=Ae*(Math.PI/2)+.3;Ht(T,q,[0,.96,0],[Math.cos(xe)*.32,1.44,Math.sin(xe)*.32],.055),O(T,Ce,Ae%2?Z:te,Math.cos(xe)*.28,1.52,Math.sin(xe)*.28,.27,.2,.27)}O(T,Ce,Z,0,1.68,0,.36,.27,.36),O(T,Ce,Q,.05,1.88,-.04,.26,.19,.26),Et(T,{width:1,depth:1},"oak_tree")}function Xa(x){let S="woodland-crag-rock";if(!$.has(S)){let T=x.clone();T.flatShading=!0,T.roughness=.92,T.metalness=.04,T.needsUpdate=!0,$.set(S,T)}return $.get(S)}function Ls(x,S,T,E){let L=new We;L.position.set(x,.035,S),v.add(L),je(L,ue,ft,.003).scale.set(1.04,1.04,1);let q=j("#2a4221",0,.94),k=j("#375229",0,.92),te=pn("#4f3a26"),Z=E%8*(Math.PI/4),Q=.44+E%4*.045;O(L,fe,T,.02,Q*.62,-.02,.43,Q,.37).rotation.set(.18,Z,-.1),O(L,fe,T,-.25,.19,.21,.25,.24,.22).rotation.set(-.22,Z+1.1,.2),O(L,fe,T,.25,.15,.19,.22,.18,.21).rotation.set(.18,Z+2.3,-.24);let K=O(L,fe,k,.01,Q*1.06,-.02,.28,.085,.24);return K.rotation.y=Z+.4,O(L,fe,q,-.23,.32,.19,.15,.06,.14),O(L,ve,te,-.14,.07,-.27,.042,.38,.042).rotation.set(1.22,.3,.55),li(L),Q*1.18}function fh(x,S,T,E,L,F){let q=S===E,k=(x+T)/2,te=(S+E)/2,Z=new We;Z.position.set(k,.035,te);let Q=(F%5-2)*.045;Z.rotation.y=(q?0:Math.PI/2)+Q,v.add(Z);let Ae=pn("#5d4530"),xe=pn("#3d2c1e"),Ve=j("#73583b",0,.92),K=j("#2a4221",0,.94),le=j("#39542b",0,.92),Ne=j("#c4b48a",0,.88);je(Z,ue,ft,.003).scale.set(2.05,.96,1);let et=O(Z,ve,Ae,0,.27,0,.27,1.82,.25);et.rotation.z=Math.PI/2;let ot=O(Z,ve,xe,-.78,.29,.01,.33,.32,.31);ot.rotation.z=Math.PI/2;let Tt=O(Z,ve,Ve,.9,.27,0,.21,.03,.19);Tt.rotation.z=Math.PI/2;for(let[cn,Un,Zn]of[[-.22,.4,.18],[.22,-.35,.16],[.02,.08,.44]])O(Z,ve,xe,-.88,Zn,cn,.055,.3,.055).rotation.set(cn*1.6,Un,1.15);O(Z,ve,xe,.22,.44,.15,.062,.29,.062).rotation.set(.55,.2,-.42),O(Z,ve,xe,-.26,.4,-.17,.052,.24,.052).rotation.set(-.62,-.15,.35),O(Z,fe,le,-.18,.49,.02,.38,.07,.2),O(Z,fe,K,.38,.47,-.02,.34,.065,.19),O(Z,fe,K,-.66,.51,.04,.24,.07,.2),O(Z,fe,L,.48,.15,.27,.2,.16,.18).rotation.set(.2,.8,.1);for(let[cn,Un,Zn,xi]of[[-.05,.3,.25,.07],[.06,.25,.26,.055],[.56,.32,-.24,.065]])O(Z,ve,Ne,cn,Un,Zn,xi,.022,xi*.85);return li(Z),.56}function qa(x,S,T,E,L,F){let q=S===E,k=(x+T)/2,te=(S+E)/2,Z=new We;Z.position.set(k,.035,te),q||(Z.rotation.y=Math.PI/2),v.add(Z);let Q=j("#2a4221",0,.94),Ae=j("#375229",0,.92);return je(Z,ue,ft,.003).scale.set(2.02,.98,1),O(Z,fe,L,-.36,.33,-.03,.5,.45,.39).rotation.set(.18,F*.7,-.14),O(Z,fe,L,.38,.27,.04,.46,.37,.36).rotation.set(-.16,F*1.3+.8,.2),O(Z,fe,L,.02,.21,.16,.31,.25,.24).rotation.set(.24,F*.5+1.5,.1),O(Z,fe,Ae,-.34,.61,-.02,.32,.09,.25),O(Z,fe,Q,.36,.51,.04,.29,.08,.23),O(Z,fe,Q,.02,.36,.14,.2,.065,.17),li(Z),.64}function Ya(x,S,T,E,L,F){let q=Xa(T),k=[],te=[],Z=[],Q=[],Ae=new Set,xe=(K,le)=>{if(K<=0||le<=0||K>=W-1||le>=pe-1)return!1;let Ne=`${K},${le}`;return hs(x,K,le)&&!E.has(Ne)&&!L.has(Ne)&&!Ae.has(Ne)};for(let K=0;K<pe;K++)for(let le=0;le<W;le++){let Ne=le===0||K===0||le===W-1||K===pe-1,Ke=`${le},${K}`;if(!Ne||!hs(x,le,K)||E.has(Ke)||L.has(Ke))continue;let et=le*17+K*31+le*K%7,ot=(K===0||K===pe-1)&&le>0&&le<W-1;k.push([le,.11,K,1,.2,1,0]);let Tt=.16+et%5*.032,Gt=.54+et%4*.08,Ft=.42+(et>>1)%3*.05,kt=(et%5-2)*.055,cn=((et>>2)%5-2)*.055;if(te.push([le+kt,.2+Tt*.46,K+cn,ot?Gt:Ft,Tt,ot?Ft:Gt,et%11*.55]),et%3!==0){let Un=.11+(et+2)%4*.025,Zn=(et%2===0?1:-1)*.34;te.push([le+(ot?Zn:-kt),.19+Un*.44,K+(ot?-cn:Zn),.32+et%3*.04,Un,.3+(et+1)%3*.04,et%7*.9+.4])}et%5<3&&Z.push([le+kt*.6,.21+Tt*.88,K+cn*.6,(ot?Gt:Ft)*.64,.055,(ot?Ft:Gt)*.64,et%9*.7]),et%7===2&&Q.push([le-kt,.24,K-cn,.2,.16,.2,et%5*.6])}de(re,j("#20291b",.02,.94),k),de(fe,q,te),de(fe,j("#314b25",0,.94),Z),de(ve,pn("#4b3724"),Q);let Ve=0;for(let K=1;K<pe-1;K++)for(let le=1;le<W-1;le++){if(!xe(le,K))continue;let Ne=null,Ke=null;if(xe(le+1,K)?(Ne=le+1,Ke=K):xe(le,K+1)&&(Ne=le,Ke=K+1),Ne!==null){Ae.add(`${le},${K}`),Ae.add(`${Ne},${Ke}`);let et=le*13+K*29+Ve,ot=Ve%2===0;Ve++;let Tt=ot?fh(le,K,Ne,Ke,q,et):qa(le,K,Ne,Ke,q,et);F.push({x:(le+Ne)/2,y:(K+Ke)/2,h:Tt})}}for(let K=1;K<pe-1;K++)for(let le=1;le<W-1;le++){if(!xe(le,K))continue;Ae.add(`${le},${K}`);let Ne=Ls(le,K,q,le*23+K*41);F.push({x:le,y:K,h:Ne})}}function bo(x){return x.flame?x.flame:x.id==="caverns"?{ember:"#2ac4e8",outer:"#7bf0ff",core:"#e6ffff"}:x.id==="sanctum"?{ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"}:x.id==="crucible"?{ember:"#ff4d12",outer:"#ff902b",core:"#ffe8a3"}:{ember:"#ff8229",outer:"#ffc25e",core:"#fff0b3"}}function ph(x,S,T,E,L){let F=new We;F.position.set(x,T+.12,S),v.add(F);let q=bo(E),k=j("#282f33",.78,.4),te=j("#8c6d3e",.8,.34);O(F,ve,k,0,.08,0,.12,.16,.12),O(F,B,te,0,.21,0,.22,.14,.22).rotation.z=Math.PI,O(F,Ce,oe(q.ember),0,.28,0,.15,.07,.15);let Z=O(F,me,oe(q.outer),0,.42,0,.12,.34,.12);Z.castShadow=!1,O(F,me,oe(q.core),.02,.35,.01,.055,.18,.055).castShadow=!1;let Q=null;L&&(Q=new Si(E.torchColor,4.8,7.2,1.9),Q.position.set(0,.52,0),F.add(Q)),ye.push({flame:Z,light:Q,baseY:.42,baseScaleY:.34,baseIntensity:4.8,phase:x*2.1+S*3.7})}function So(){for(let x of ge)x.mesh.removeFromParent(),x.mat.dispose();ge.length=0}function Ka(x){if(So(),p)return;let S=34;for(let T=0;T<S;T++){let E=(T*73+19)%1e3/1e3*(W-.4)-.3,L=(T*137+41)%1e3/1e3*(pe-.4)-.3,F=.22+(T*53+7)%100/100*1.95,q=new hn({color:x.moteColor||"#e8d8b5",transparent:!0,opacity:.45,depthWrite:!1}),k=new tn(Ce,q),te=.016+T%4*.005;k.scale.setScalar(te),k.position.set(E,F,L),k.castShadow=!1,k.receiveShadow=!1,v.add(k),ge.push({mesh:k,mat:q,baseX:E,baseZ:L,phase:T*1.73,speed:.16+T%5*.045,yOffset:F})}}let P=new Set(["pillar","brazier","table","bench","shelf","barrel","crate","rug","sarcophagus","altar","stained_glass","bell","lantern_post","ore_vein","water_lock","kiln"]),X={sarcophagus:"props/sarcophagus.glb",brazier:"props/brazier.glb",oak_tree:"props/oak_tree.glb"};function de(x,S,T,E=!0){if(!T.length)return null;let L=new mi(x,S,T.length);return T.forEach(([F,q,k,te,Z,Q,Ae=0],xe)=>{lt.position.set(F,q,k),lt.scale.set(te,Z,Q),lt.rotation.set(0,Ae,0),lt.updateMatrix(),L.setMatrixAt(xe,lt.matrix)}),L.castShadow=E,L.receiveShadow=!0,L.computeBoundingSphere(),v.add(L),L}function ae(x,S,T){let E=Number(S.width)||1,L=Number(S.depth)||2,F=Math.max(E,L),q=Math.min(E,L);E>L&&(x.rotation.y=Math.PI/2);let k=j(T.wallCap||"#565852",.06,.82),te=j(T.wallJoint||"#202321",.1,.8),Z=j(T.pillarTrim||"#7d653e",.5,.45);O(x,re,te,0,.05,0,q*.8,.1,F*.86),O(x,re,k,0,.3,0,q*.7,.42,F*.78),O(x,re,Z,0,.51,0,q*.74,.04,F*.82),O(x,re,k,0,.57,0,q*.68,.09,F*.76),O(x,re,k,0,.64,0,q*.46,.06,F*.6);for(let Q of[-F*.18,F*.18])O(x,re,Z,0,.3,Q,q*.72,.3,.035)}function ce(x,S,T){let E=Number(S.width)||1,L=Number(S.depth)||1,F=j(T.wallCap||"#565852",.06,.8),q=j(T.pillarTrim||"#7d653e",.5,.45);O(x,re,F,0,.12,0,E-.08,.24,L-.08),O(x,re,F,0,.42,0,E*.7,.36,L*.6),O(x,re,q,0,.63,0,E*.76,.05,L*.66)}function Ge(x,S,T){let E=Number(S.width)||1,L=Number(S.depth)||1,F=Math.max(1.05,Math.min(1.9,Number(S.height)||1.48)),q=j(T.wallCap||"#444056",.08,.82),k=j(T.wallJoint||"#1c1828",.12,.86),te=pn("#523929"),Z=j("#282f34",.82,.36),Q=j("#b88b48",.86,.28),Ae=j("#dfb66d",.9,.24),xe=he("bell_body",()=>new to([new Ee(.01,.98),new Ee(.32,.95),new Ee(.46,.78),new Ee(.54,.48),new Ee(.72,.18),new Ee(.95,.04),new Ee(1,0),new Ee(.84,0),new Ee(.68,.15)],18));O(x,re,k,0,.08,0,E-.06,.16,L-.06),O(x,re,q,0,.22,0,E-.22,.14,L-.22);let Ve=Math.max(.62,E-.34),K=F-.28;for(let Ne of[-Ve/2,Ve/2])O(x,re,te,Ne,.28+K/2,0,.14,K,.14),O(x,re,Z,Ne,.36,0,.16,.07,.16),O(x,re,Z,Ne,F-.12,0,.16,.07,.16);O(x,re,te,0,F-.04,0,Ve+.32,.14,.18),O(x,re,q,0,F+.06,0,Ve+.42,.08,.28);let le=E>=2.5?[[-.78,.22,.42],[0,.33,.6],[.78,.22,.42]]:[[0,.28,.52]];for(let[Ne,Ke,et]of le){let ot=F-.12;O(x,re,Z,Ne,ot-.05,0,Ke*1.1,.07,.08),O(x,ve,Z,Ne,ot-.12,0,.045,.14,.045),O(x,xe,Q,Ne,ot-.14-et,0,Ke,et,Ke),O(x,ve,Ae,Ne,ot-.14-et*.22,0,Ke*.72,.035,Ke*.72),O(x,Ce,Z,Ne,ot-.14-et-.03,0,.055,.055,.055)}}function Ze(x,S,T,E){let L=Math.max(.95,Math.min(1.7,Number(S.height)||1.32)),F=j(T.wallCap||"#445863",.08,.86),q=pn("#593f2b"),k=j("#252c30",.82,.36),te=(T.base||T.id)==="caverns"?"#ffbe63":T.torchColor||"#ffae4a",Z="#fff3cf";O(x,re,F,0,.14,0,.72,.28,.72),O(x,re,q,-.06,.26+(L-.26)/2,0,.16,L-.26,.16),O(x,re,k,-.06,.34,0,.19,.08,.19),O(x,re,q,.12,L-.06,0,.5,.1,.11);let Q=O(x,re,k,.08,L-.2,0,.28,.045,.045);Q.rotation.z=Math.PI/4;let Ae=.28,xe=L-.3;O(x,ve,k,Ae,L-.14,0,.018,.14,.018),O(x,me,k,Ae,xe+.13,0,.14,.1,.14),O(x,ve,k,Ae,xe-.1,0,.11,.04,.11);let Ve=O(x,ve,oe(te,.94),Ae,xe+.01,0,.088,.17,.088);Ve.castShadow=!1,Ve.userData.keep=!0;let K=O(x,Ce,oe(Z,.98),Ae,xe+.01,0,.045,.065,.045);K.castShadow=!1,K.userData.keep=!0;for(let Ne=0;Ne<4;Ne++){let Ke=Ne/4*Math.PI*2+Math.PI/4;O(x,ve,k,Ae+Math.cos(Ke)*.095,xe+.01,Math.sin(Ke)*.095,.012,.19,.012)}let le=null;E&&(le=new Si(te,5.4,7.6,1.9),le.position.set(Ae,xe,0),x.add(le)),ye.push({flame:K,light:le,baseY:xe+.01,baseScaleY:.065,baseIntensity:5.4,phase:S.x*2.3+S.y*1.7})}function ke(x,S,T){let E=Number(S.width)||1,L=Number(S.depth)||1,F=Math.max(.75,Math.min(1.25,Number(S.height)||1.02)),q=j("#26353e",.12,.92),k=j("#172229",.16,.94),te=T.crystalColor||"#4ce6ff",Z=oe(te,.94),Q=oe("#e2fcff",.98),Ae=(S.x*5+S.y*7)%6*.42,xe=O(x,me,k,0,F*.36,0,Math.min(E,L)*.56,F*.72,Math.min(E,L)*.56);xe.rotation.y=Ae,O(x,re,q,-E*.14,F*.32,L*.1,E*.56,F*.64,L*.52).rotation.set(.12,Ae+.48,-.1),O(x,re,k,E*.16,F*.28,-L*.14,E*.52,F*.54,L*.5).rotation.set(-.14,Ae-.36,.12),O(x,me,q,E*.05,F*.74,-L*.04,Math.min(E,L)*.36,F*.54,Math.min(E,L)*.36).rotation.set(.08,Ae,-.14);let Ne=[[E*.18,F*.76,L*.12,.115,.68,.34,-.2],[-E*.18,F*.7,-L*.14,.105,.6,-.36,.24],[E*.02,F*.96,L*.02,.095,.58,.12,.14],[-E*.24,F*.46,L*.2,.085,.46,-.48,-.32],[E*.24,F*.44,-L*.2,.08,.44,.46,.28]];for(let[Ke,et,ot,Tt,Gt,Ft,kt]of Ne){let cn=O(x,me,Z,Ke,et,ot,Tt,Gt,Tt);cn.rotation.set(kt,0,Ft),cn.castShadow=!1;let Un=O(x,me,Q,Ke,et+Gt*.16,ot,Tt*.46,Gt*.5,Tt*.46);Un.rotation.set(kt,0,Ft),Un.castShadow=!1}}function Xe(x,S,T){let E=Number(S.width)||2,L=Number(S.depth)||2,F=Math.max(.45,Math.min(1.15,Number(S.height)||.78)),q=j(T.wallCap||"#485449",.08,.84),k=j("#3c5738",.06,.88),te=pn("#4d3827"),Z=j("#262d30",.78,.38),Q="water:lock";$.has(Q)||$.set(Q,new kn({color:"#1b585c",emissive:"#0e363a",emissiveIntensity:.75,metalness:.38,roughness:.12}));let Ae=$.get(Q),xe=j("#5d7d40",.04,.86),Ve=j("#6e462a",.04,.9),K=.2;O(x,re,q,-E/2+K/2,.11,0,K,.22,L-.04),O(x,re,q,E/2-K/2,.11,0,K,.22,L-.04),O(x,re,k,-E/2+K/2,.23,0,K+.04,.04,L-.06),O(x,re,k,E/2-K/2,.23,0,K+.04,.04,L-.06);let le=O(x,re,Ae,0,.04,0,Math.max(.4,E-K*1.8),.04,L-.06);le.castShadow=!1;let Ne=F>=.8?Math.min(.42,L*.28):.22;O(x,re,te,0,F*.5,0,E-.16,F,Ne),O(x,re,q,0,F+.04,0,E-.08,.09,Ne+.08);let Ke=Math.max(2,Math.round(E*2));for(let ot=0;ot<Ke;ot++){let Tt=-E/2+.28+(ot+.5)*(E-.56)/Ke;O(x,re,Z,Tt,F*.52,0,.055,F+.08,Ne+.05)}if(F>=.8)for(let ot of[-L/2+.24,L/2-.24])O(x,re,q,0,F*.42,ot,E-.24,F*.84,.28);let et=Math.max(6,Math.round(L*4));for(let ot=0;ot<et;ot++){let Tt=ot%2===0?-1:1,Gt=Tt*(E/2-.21)+(ot*7%5-2)*.035,Ft=-L/2+.16+(ot+.5)/et*(L-.32),kt=.58+ot%3*.16,cn=O(x,ve,xe,Gt,.16+kt/2,Ft,.026,kt,.026);if(cn.rotation.z=Tt*-.16,cn.rotation.x=(ot%3-1)*.11,ot%2===0){let Un=O(x,ve,Ve,Gt-Tt*.05,.16+kt*.88,Ft,.046,.15,.046);Un.rotation.z=Tt*-.16}}}function nt(x,S,T,E){let L=Number(S.width)||2,F=Number(S.depth)||2,q=Math.max(.95,Math.min(1.55,Number(S.height)||1.26)),k=j("#523730",.1,.86),te=j("#241a18",.14,.9),Z=j("#282a2d",.82,.38),Q=oe("#ff5514",.94),Ae=oe("#ffda7a",.98);O(x,re,te,0,.08,0,L-.06,.16,F-.06),O(x,re,k,0,.16+q*.62/2,0,L-.14,q*.62,F-.14),O(x,re,te,0,.16+q*.62+.09,0,L-.3,.18,F-.3);for(let ot of[.34,.68])O(x,re,Z,0,ot,0,L-.1,.055,F-.1);let xe=Math.max(.32,q*.34),Ve=.16+q*.62+.14+xe/2;O(x,ve,te,0,Ve,0,.25,xe,.25),O(x,ve,Z,0,Ve+xe*.44,0,.29,.06,.29);let K=O(x,ve,Q,0,Ve+xe*.5,0,.19,.06,.19);K.castShadow=!1,K.userData.keep=!0;let le=O(x,me,Ae,0,Ve+xe*.62,0,.11,.24,.11);le.castShadow=!1,le.userData.keep=!0;let Ne=L>=2.5?[-.62,.62]:[0],Ke=le;for(let ot of Ne)for(let Tt of[-1,1]){let Gt=Tt*(F/2-.065);O(x,re,Z,ot,.4,Gt,.54,.46,.05);let Ft=O(x,re,Q,ot,.38,Gt+Tt*.012,.44,.36,.03);Ft.castShadow=!1,Ft.userData.keep=!0;let kt=O(x,re,Ae,ot,.32,Gt+Tt*.02,.3,.2,.02);kt.castShadow=!1,kt.userData.keep=!0;for(let cn of[-.12,0,.12])O(x,re,Z,ot+cn,.38,Gt+Tt*.028,.028,.36,.024)}let et=null;E&&(et=new Si("#ff6a22",6,8.4,1.9),et.position.set(0,.65,F/2+.35),x.add(et)),ye.push({flame:Ke,light:et,baseY:Ve+xe*.62,baseScaleY:.24,baseIntensity:6,phase:S.x*1.7+S.y*2.9})}function _t(x,S,T){let E={s:[0,.5,0],n:[0,-.5,Math.PI],e:[.5,0,-Math.PI/2],w:[-.5,0,Math.PI/2]}[x.facing||"s"],L=`glass:${S.id}`;if(!$.has(L)){let k=Ie((te,Z,Q)=>{te.fillStyle="#05030a",te.fillRect(0,0,Z,Q),te.save(),te.beginPath(),te.moveTo(Z*.2,Q),te.lineTo(Z*.2,Q*.32),te.quadraticCurveTo(Z*.2,Q*.05,Z*.5,Q*.02),te.quadraticCurveTo(Z*.8,Q*.05,Z*.8,Q*.32),te.lineTo(Z*.8,Q),te.closePath(),te.clip();let Ae=["#7d3cff","#c47bff","#ffb347","#5a2bb8","#e0a0ff"];for(let xe=0;xe<42;xe++)te.fillStyle=Ae[xe%Ae.length],te.fillRect(Z*.2+xe%6*Z*.1,Math.floor(xe/6)*Q*.14,Z*.1,Q*.14);te.strokeStyle="#120a18",te.lineWidth=5;for(let xe=.2;xe<=.8;xe+=.1)te.beginPath(),te.moveTo(Z*xe,0),te.lineTo(Z*xe,Q),te.stroke();for(let xe=0;xe<=1;xe+=.14)te.beginPath(),te.moveTo(0,Q*xe),te.lineTo(Z,Q*xe),te.stroke();te.restore()},128,256);$.set(L,new hn({map:k,transparent:!0,blending:sr,depthWrite:!1,toneMapped:!1,side:Dn})),S.textures?.window&&za(S.textures.window,{srgb:!0,repeat:!1}).then(te=>{if(!te||we){te?.dispose();return}ne.add(te);let Z=$.get(L);Z&&(Z.map=te,Z.needsUpdate=!0,_n())})}let F=Math.min(T,.86)*.92,q=O(v,ue,$.get(L),x.x+E[0]*1.002,.06+F/2,x.y+E[1]*1.002,.62,F,1);q.rotation.y=E[2],q.castShadow=!1,q.receiveShadow=!1}function Et(x,S,T){a0(X[T]).then(E=>{if(!E||we||!x.parent)return;let L=[...x.children],F=E.clone(!0);F.traverse(k=>{k.isMesh&&(k.castShadow=!0,k.receiveShadow=!0)});let q=Math.max(Number(S.width)||1,Number(S.depth)||1);T==="sarcophagus"&&F.scale.setScalar(Math.min(1,q/2)),x.add(F);for(let k of L)!k.isLight&&k.userData.keep!==!0&&(k.visible=!1);l.shadowMap.needsUpdate=!0,_n()})}function $e(x){So(),He(v),ye.length=0,W=Number(x.width)||10,pe=Number(x.height)||8;let S=(W-1)/2,T=(pe-1)/2,E=n0(x,M);Te=E.id,h.background.set(E.bg),h.fog.color.set(E.fog),H.color.set(E.hemiSky),H.groundColor.set(E.hemiGround),V.color.set(E.keyColor),G.color.set(E.fillColor),O(v,re,j(E.slab,.12,.88),S,-.42,T,W+.46,.64,pe+.46),O(v,re,j(E.rim,.78,.34),S,-.155,T,W+.22,.078,pe+.22),O(v,re,j(E.frame,.24,.76),S,-.09,T,W+.1,.12,pe+.1);let L=i0(E,l,ne,$),F=s0(E,l,ne,$),q=`pbr-floor-alt:${E.id}`;$.has(q)||$.set(q,L.clone());let k=$.get(q),te=`pbr-cap:${E.id}`;$.has(te)||$.set(te,new kn({map:F.map,bumpMap:F.bumpMap,bumpScale:.038,color:new at("#c8c4bc"),roughness:.78,metalness:.08}));let Z=$.get(te);if(E.textures&&!$.has(`textured:${E.id}`)){$.set(`textured:${E.id}`,new hn);let Re=Mt=>ne.add(Mt),Le=Math.min(d==="low"?2:8,l.capabilities.getMaxAnisotropy());Promise.all([dh(L,E.textures.floor,Re,{anisotropy:Le}),dh(k,E.textures.floorAlt||E.textures.floor,Re,{anisotropy:Le}),dh(F,E.textures.wall,Re,{anisotropy:Le})]).then(()=>{we||(l.shadowMap.needsUpdate=!0,_n())})}let Q=new Set((x.scene?.chasm||[]).map(([Re,Le])=>`${Re},${Le}`)),Ae=new at,xe=[],Ve=[],K=[],le=[],Ne=new Set,Ke=(E.base||E.id)==="woodland";for(let Re=0;Re<pe;Re++)for(let Le=0;Le<W;Le++){if(Q.has(`${Le},${Re}`))continue;let Mt=x.tiles?.[Re]?.[Le]||".";Mt==="d"?(K.push([Le,Re]),Ne.add(`${Le},${Re}`)):Mt==="D"&&(le.push([Le,Re]),Ne.add(`${Le},${Re}`)),(E.textures?.floorAlt&&(Le*7+Re*13)%8===3&&!Is(x,Le,Re)?Ve:xe).push([Le,Re])}for(let[Re,Le]of[[xe,L],[Ve,k]]){if(!Re.length)continue;let Mt=new mi(re,Le,Re.length);Re.forEach(([gt,bt],Sn)=>{lt.position.set(gt,-.015,bt),lt.scale.set(.976,.09,.976),lt.rotation.set(0,Le===L?(gt*7+bt*3)%4*Math.PI/2:0,0),lt.updateMatrix(),Mt.setMatrixAt(Sn,lt.matrix);let $t=.9+(gt*13+bt*7)%5*.042,Gi=x.tiles?.[bt]?.[gt]||".";Gi==="d"?Ae.setRGB($t*.44,$t*.52,$t*.68):Gi==="D"?Ae.setRGB($t*.26,$t*.3,$t*.44):Ke?Ae.setRGB($t*1.04,$t*1.04,$t*.95):Ae.setRGB($t,$t,$t*((E.base||E.id)==="caverns"?1.04:.99)),Mt.setColorAt(Sn,Ae)}),Mt.receiveShadow=!0,v.add(Mt)}if(K.length){let Re=new hn({color:"#0c1c30",transparent:!0,opacity:.28,depthWrite:!1}),Le=new mi(ue,Re,K.length);K.forEach(([Mt,gt],bt)=>{lt.position.set(Mt,.032,gt),lt.scale.set(.985,.985,1),lt.rotation.set(-Math.PI/2,0,0),lt.updateMatrix(),Le.setMatrixAt(bt,lt.matrix)}),Le.castShadow=!1,Le.receiveShadow=!1,v.add(Le)}if(le.length){let Re=new hn({color:"#050b18",transparent:!0,opacity:.48,depthWrite:!1}),Le=new mi(ue,Re,le.length);le.forEach(([Mt,gt],bt)=>{lt.position.set(Mt,.032,gt),lt.scale.set(.985,.985,1),lt.rotation.set(-Math.PI/2,0,0),lt.updateMatrix(),Le.setMatrixAt(bt,lt.matrix)}),Le.castShadow=!1,Le.receiveShadow=!1,v.add(Le)}if(Ne.size){let Re=[];for(let Le of Ne){let[Mt,gt]=Le.split(",").map(Number);for(let[bt,Sn]of[[1,0],[-1,0],[0,1],[0,-1]]){let $t=Mt+bt,Gi=gt+Sn;if($t<0||Gi<0||$t>=W||Gi>=pe)continue;(x.tiles?.[Gi]?.[$t]||".")==="."&&Re.push([Mt+bt*.465,.035,gt+Sn*.465,bt!==0?.068:.96,1,Sn!==0?.068:.96])}}if(Re.length){let Le=oe("#85b6db",.58),Mt=new mi(ue,Le,Re.length);Re.forEach(([gt,bt,Sn,$t,Gi,of],P0)=>{lt.position.set(gt,bt,Sn),lt.scale.set($t,of,1),lt.rotation.set(-Math.PI/2,0,0),lt.updateMatrix(),Mt.setMatrixAt(P0,lt.matrix)}),Mt.castShadow=!1,Mt.receiveShadow=!1,v.add(Mt)}}if(Q.size){let Re=[...Q].map(gt=>gt.split(",").map(Number));de(re,j("#050308",0,1),Re.map(([gt,bt])=>[gt,-.62,bt,1,.1,1]),!1);let Le=oe(E.torchColor||"#8c3dff",.16),Mt=Re.filter(([gt,bt])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([Sn,$t])=>!Q.has(`${gt+Sn},${bt+$t}`)&&!Is(x,gt+Sn,bt+$t)));de(re,Le,Mt.map(([gt,bt])=>[gt,-.3,bt,.98,.5,.98]),!1)}let et=(x.scene?.props||[]).filter(Re=>P.has(Re.kind)),ot=new Set;for(let Re of et)if(Re.kind!=="rug"&&Re.kind!=="stained_glass")for(let Le=0;Le<(Re.depth||1);Le++)for(let Mt=0;Mt<(Re.width||1);Mt++)ot.add(`${Re.x+Mt},${Re.y+Le}`);for(let Re=0;Re<pe;Re++)for(let Le=0;Le<W;Le++)Mo(x,Le,Re)&&!ot.has(`${Le},${Re}`)&&!Q.has(`${Le},${Re}`)&&Wa(Le,Re);let Tt=Math.max(.25,Math.min(1.6,Number(x.scene?.wall_height)||1.1)),Gt=[],Ft=[],kt=[],cn=[],Un=[];if(Ke)Ya(x,E,F,ot,Q,Gt);else{for(let Re=0;Re<pe;Re++)for(let Le=0;Le<W;Le++){if(!hs(x,Le,Re)||ot.has(`${Le},${Re}`)||Q.has(`${Le},${Re}`))continue;let Mt=Le===0||Re===0||Le===W-1||Re===pe-1,gt=["caverns","catacombs"].includes(E.base||E.id)&&!Mt?((Le*17+Re*31)%5-2)*.045:0,bt=(Mt?Math.min(Tt,.42):Math.min(Tt,.86))+gt;Ft.push([Le,bt/2+.04,Re,.978,bt,.978]),kt.push([Le,bt+.075,Re,1.018,.095,1.018]),Mt||(cn.push([Le,.07,Re,1.022,.07,1.022]),[[1,0],[-1,0],[0,1],[0,-1]].some(([$t,Gi])=>!Is(x,Le+$t,Re+Gi))&&Gt.push({x:Le,y:Re,h:bt})),E.crystalColor&&Mt&&(Le*11+Re*23)%11===0&&Un.push([Le+.15,bt+.21,Re-.1])}de(re,F,Ft),de(re,Z,kt),de(re,j(E.wallJoint,.14,.86),cn);for(let[Re,Le,Mt]of Un){let gt=O(v,me,oe(E.crystalColor,.88),Re,Le,Mt,.075,.26,.075);gt.rotation.z=.22,gt.castShadow=!1}}let Zn=bo(E),xi=0;for(let Re of et){if(Re.kind==="stained_glass"){_t(Re,E,Tt);continue}let Le=new We;Le.userData.mapProp={...Re};let Mt=Lm(Re,De.objects);if(Mt&&(Le.userData.objectId=Mt.id,Le.userData.objectState={...Mt},Le.visible=!Mt.destroyed),Le.position.set(Re.x+((Re.width||1)-1)/2,.04,Re.y+((Re.depth||1)-1)/2),v.add(Le),Re.kind==="pillar"){let gt=Math.max(.7,Math.min(2.1,Number(Re.height)||Tt+.26));O(Le,re,Z,0,.1,0,.88,.2,.88),O(Le,ve,F,0,gt/2,0,.29,gt-.15,.29);for(let bt=1;bt<4;bt++)O(Le,ve,j(E.pillarTrim,.45,.52),0,bt*gt/4,0,.306,.038,.306);O(Le,re,Z,0,gt-.02,0,.8,.17,.8)}else if(Re.kind==="brazier"){let gt=Math.max(.4,Math.min(1.1,Number(Re.height)||.65));O(Le,re,j(E.wallJoint,.16,.82),0,.1,0,.68,.2,.68),O(Le,ve,j("#282f33",.78,.4),0,gt/2,0,.1,gt-.12,.1),O(Le,B,j("#7d5e36",.8,.36),0,gt,0,.32,.18,.32).rotation.z=Math.PI;let bt=O(Le,Ce,oe(Zn.ember),0,gt+.1,0,.21,.09,.21),Sn=O(Le,me,oe(Zn.outer),-.02,gt+.27,0,.15,.44,.15);Sn.castShadow=!1,bt.userData.keep=!0,Sn.userData.keep=!0;let $t=null;xi++<3&&($t=new Si(E.torchColor,5.2,7.2,2),$t.position.set(0,gt+.42,0),Le.add($t)),ye.push({flame:Sn,light:$t,baseY:gt+.27,baseScaleY:.44,baseIntensity:5.2,phase:Re.x*1.9+Re.y*2.7}),E.flame&&Et(Le,Re,"brazier")}else Re.kind==="sarcophagus"?(ae(Le,Re,E),Et(Le,Re,"sarcophagus")):Re.kind==="altar"?ce(Le,Re,E):Re.kind==="bell"?Ge(Le,Re,E):Re.kind==="lantern_post"?Ze(Le,Re,E,xi++<3):Re.kind==="ore_vein"?ke(Le,Re,E):Re.kind==="water_lock"?Xe(Le,Re,E):Re.kind==="kiln"?nt(Le,Re,E,xi++<3):Va(Le,Re);["brazier","table","sarcophagus","lantern_post","kiln"].includes(Re.kind)||li(Le),Mt&&Le.traverse(gt=>{gt.userData.objectId=Mt.id})}if(!et.some(Re=>["brazier","lantern_post","kiln"].includes(Re.kind))){let Re=Gt.length?Gt:[{x:0,y:0,h:.42},{x:W-1,y:0,h:.42},{x:0,y:pe-1,h:.42},{x:W-1,y:pe-1,h:.42}],Le=[],Mt=Math.max(4,Math.hypot(W,pe)*.28);for(let gt=0;gt<Re.length&&Le.length<4;gt++){let bt=Re[(gt*7+3)%Re.length];Le.every(Sn=>Math.hypot(bt.x-Sn.x,bt.y-Sn.y)>=Mt)&&(Le.push(bt),Ke?fr(bt.x,bt.y,bt.h,E,xi++<3):ph(bt.x,bt.y,bt.h,E,xi++<3))}}Ka(E),V.target.position.set(S,0,T);let Ds=Math.hypot(W,pe)/2+2.5;Object.assign(V.shadow.camera,{left:-Ds,right:Ds,top:Ds,bottom:-Ds,far:65}),V.shadow.camera.updateProjectionMatrix(),V.position.set(S-6.5,13.5,T+5.5),G.position.set(S+7.5,5.5,T-6.5)}function Pt(x,S){if(p||ie.length>18)return;let T=new hn({color:"#b7b3a4",transparent:!0,opacity:.42,depthWrite:!1}),E=new tn(Ce,T);E.position.set(x+Math.sin(x*12+S*7)*.12,.09,S+Math.cos(x*9-S*5)*.12),E.scale.setScalar(.06),z.add(E),ie.push({mesh:E,mat:T,born:performance.now()})}function sn(x){let S=dr(x);return S?S==="goblin"?1.38:S==="goblin_boss"?1.48:1.66:1.56}function Kt(x,S=sn(x)){let T=(x.conditions||[]).filter(k=>!["dead","unconscious"].includes(k)),E=new Set([...T,...x.marks||[]].filter(Boolean)).size,L=Ie((k,te,Z)=>{k.clearRect(0,0,te,Z),k.fillStyle="rgba(11, 20, 24, 0.88)",k.beginPath(),k.roundRect(4,4,te-8,Z-8,16),k.fill(),k.strokeStyle=x.active&&x.alive?"#ffdb86":x.team==="heroes"?"#62c4be":"#d68265",k.lineWidth=x.active&&x.alive?3.5:2.5,k.stroke(),k.fillStyle="#f6efe0",k.font="700 24px system-ui, -apple-system, sans-serif",k.textAlign="left";let Q=String(x.name||x.id),Ae=Q.length>24?`${Q.slice(0,23)}\u2026`:Q;k.fillText(Ae,16,33,te-84);let xe=x.team==="heroes"&&x.alive===!1?x.vital:null;if(xe){let K=xe.state==="dying"?"#ff6a58":xe.state==="stable"?"#6fe0cd":"#a7a29a";if(k.fillStyle=K,k.font="800 19px system-ui, sans-serif",k.textAlign="right",k.fillText(xe.state==="dying"?"DYING":xe.state==="stable"?"STABLE":"DEAD",te-15,33),xe.state==="dying"){let le=(Ne,Ke,et)=>{k.beginPath(),k.arc(Ne,48,5.5,0,Math.PI*2),Ke&&(k.fillStyle=et,k.fill()),k.strokeStyle=et,k.lineWidth=2,k.stroke()};for(let Ne=0;Ne<3;Ne++)le(24+Ne*17,Ne<(xe.saves||0),"#62d99a");for(let Ne=0;Ne<3;Ne++)le(te-58+Ne*17,Ne<(xe.fails||0),"#ff5a4a");k.fillStyle="#d9d0c0",k.font="600 13px system-ui, sans-serif",k.textAlign="center",k.fillText("death saves",te/2,53)}else k.fillStyle="#25353a",k.beginPath(),k.roundRect(15,44,te-30,8,4),k.fill();return}k.fillStyle="#b9d2cd",k.font="600 19px system-ui, sans-serif",k.textAlign="right",k.fillText(`${Math.max(0,x.hp)}/${x.max_hp}`,te-15,33),k.fillStyle="#25353a",k.beginPath(),k.roundRect(15,44,te-30,8,4),k.fill();let Ve=Math.max(0,Math.min(1,x.hp/Math.max(1,x.max_hp)));if(k.fillStyle=x.team==="heroes"?Ve>.4?"#4ad4b2":"#f29d52":Ve>.4?"#eb7a65":"#d94e4e",Ve>0&&(k.beginPath(),k.roundRect(15,44,Math.max(8,(te-30)*Ve),8,4),k.fill()),E>0){k.fillStyle="#ffd966";for(let K=0;K<Math.min(4,E);K++)k.beginPath(),k.arc(te-18-K*10,13,3.2,0,Math.PI*2),k.fill()}},240,64),F=new xs({map:L,transparent:!0,depthTest:!1,depthWrite:!1}),q=new Xs(F);return q.renderOrder=15,q.scale.set(.92,.245,1),q.position.set(0,S,0),q.userData.unitId=x.id,q.userData.baseY=S,q}function qt(x){x&&(ne.delete(x.material.map),x.material.map.dispose(),x.material.dispose(),x.removeFromParent())}function Pn(){if(!a.clientHeight||!a.clientWidth)return;u.updateMatrixWorld();let x=[];for(let S of Y.values()){let T=S.name;if(!T)continue;if(y==="off"||!S.data.alive&&S.data.team==="monsters"&&S.castKey){T.visible=!1;continue}if(T.visible=y!=="minimal"||!!(S.data.active||S.data.id===zt||S.data.vital?.state==="dying"),!T.visible)continue;let E=S.data.alive?S.labelY:.66;Dt.set(S.root.position.x,E,S.root.position.z).project(u);let L=(Dt.x+1)*a.clientWidth*.5,F=(1-Dt.y)*a.clientHeight*.5,q=u.position.distanceTo(S.root.position);x.push({entry:S,sp:T,baseY:E,sx:L,sy:F,adjY:F,dist:q})}x.sort((S,T)=>T.sy-S.sy);for(let S=0;S<x.length;S++){let T=x[S];for(let F=0;F<S;F++){let q=x[F];Math.abs(T.sx-q.sx)<76&&Math.abs(T.adjY-q.adjY)<25&&(T.adjY=q.adjY-26)}let E=Math.min(72,Math.max(0,T.sy-T.adjY)),L=2*T.dist*Math.tan(an.degToRad(u.fov/2))/Math.max(1,a.clientHeight);Je(T.sp,T.baseY+E*L,T.dist)}}function Je(x,S,T){x.position.y+=(S-x.position.y)*.35;let E=Math.max(.36,Math.min(1.42,T/15));x.scale.set(.92*E,.245*E,1)}let mn=new Map,Ut={guiding_bolt:(x,S)=>{let T=new We;return T.name="mark-guiding_bolt",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#ffd75e",.9),0,.12,0).rotation.x=-Math.PI/2,O(T,he("mark-star",()=>new Ln(1)),oe("#ffe27a",.95),0,1.18*(S.model?.scale||1)+.25,0,.07,.13,.07),T},bless:(x,S)=>{let T=new We;return T.name="mark-bless",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#ffe27a",.85),0,.12,0).rotation.x=-Math.PI/2,O(T,he("mark-halo",()=>new It(.2,.02,6,28)),oe("#fff0a8",.9),0,1.22*(S.model?.scale||1)+.28,0).rotation.x=-Math.PI/2,T},aid:x=>{let S=new We;return S.name="mark-aid",x.add(S),O(S,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#8dffa8",.85),0,.12,0).rotation.x=-Math.PI/2,O(S,re,oe("#8dffa8",.95),0,.14,0,.1,.03,.03),O(S,re,oe("#8dffa8",.95),0,.14,0,.03,.1,.03),S},shield_of_faith:(x,S)=>{let T=new We;return T.name="mark-shield_of_faith",x.add(T),O(T,Ce,oe("#7fb8ff",.18),0,.62*(S.model?.scale||1),0,.52,.7,.52),T},sanctuary:(x,S)=>{let T=new We;return T.name="mark-sanctuary",x.add(T),O(T,Ce,oe("#f4f0ff",.2),0,.5*(S.model?.scale||1),0,.62,.8,.62),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#ffffff",.8),0,.12,0).rotation.x=-Math.PI/2,O(T,he("mark-ward-sigil",()=>new It(.12,.022,6,24)),oe("#e6dcff",.95),0,1.22*(S.model?.scale||1)+.42,0),O(T,he("mark-star",()=>new Ln(1)),oe("#ffffff",.95),0,1.22*(S.model?.scale||1)+.42,0,.05,.05,.05),T},protection:x=>{let S=new We;S.name="mark-protection",x.add(S),O(S,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#fff0b0",.95),0,.12,0).rotation.x=-Math.PI/2;for(let T=0;T<4;T++)O(S,re,oe("#fff0b0",.8),0,.13,0,.03,.01,.9).rotation.y=T*Math.PI/4;return S},blur:(x,S)=>{let T=new We;T.name="mark-blur",x.add(T);for(let E of[-.16,.16])O(T,Ce,oe("#bcd8ff",.18),E,.62*(S.model?.scale||1),0,.2,.45,.2);return T},innate_sorcery:x=>{let S=new We;S.name="mark-innate_sorcery",x.add(S);for(let T=0;T<8;T++){let E=T/8*Math.PI*2;O(S,me,oe(T%2?"#ffb347":"#ff7a3c",.85),Math.cos(E)*.42,.3,Math.sin(E)*.42,.06,.4,.06)}return S},paralyzed:(x,S)=>{let T=new We;T.name="mark-paralyzed",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#ffe27a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<4;E++){let L=E/4*Math.PI*2;O(T,he("mark-star",()=>new Ln(1)),oe("#fff0a0",.95),Math.cos(L)*.3,1.15*(S.model?.scale||1)+.2,Math.sin(L)*.3,.05,.09,.03)}return T},poisoned:(x,S)=>{let T=new We;T.name="mark-poisoned",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#8fd36a",.85),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<5;E++)O(T,Ce,oe(E%2?"#8fd36a":"#c7f59a",.8),Math.cos(E*2.2)*.25,.7*(S.model?.scale||1)+E*.16,Math.sin(E*2.2)*.25,.045,.045,.045);return T},frightened:(x,S)=>{let T=new We;T.name="mark-frightened",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#a8c8ff",.85),0,.12,0).rotation.x=-Math.PI/2;for(let E of[-.14,.14])O(T,me,oe("#d8e6ff",.9),E,1.2*(S.model?.scale||1)+.15,0,.04,.2,.04).rotation.z=Math.PI;return T},cursed:(x,S)=>{let T=new We;T.name="mark-cursed",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#5f8f3a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<4;E++)O(T,Ce,oe(E%2?"#3d5c25":"#9bd16a",.75),Math.cos(E*1.6)*.3,.45*(S.model?.scale||1)+E*.2,Math.sin(E*1.6)*.3,.05,.05,.05);return T},stench:x=>{let S=new We;return S.name="mark-stench",x.add(S),O(S,Ce,oe("#8fb84a",.16),0,.35,0,1.15,.5,1.15),S},strength_drain:x=>{let S=new We;S.name="mark-strength_drain",x.add(S),O(S,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#d24a4a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let T=0;T<3;T++){let E=O(S,me,oe("#e86a6a",.95),.34,.3+T*.22,0,.07,.14,.07);E.rotation.z=Math.PI,E.name="mark-chev"}return S},slowed:(x,S)=>{let T=new We;T.name="mark-slowed",x.add(T),O(T,he("mark-ring",()=>new It(.46,.028,6,36)),oe("#8fd8ff",.9),0,.12,0).rotation.x=-Math.PI/2;for(let E=0;E<6;E++){let L=E*Math.PI/3,F=O(T,me,oe("#c9eeff",.9),Math.cos(L)*.42,.22,Math.sin(L)*.42,.045,.3,.045);F.rotation.z=Math.cos(L)*.35,F.rotation.x=-Math.sin(L)*.35}return O(T,he("mark-flake",()=>new Ln(1)),oe("#e6f7ff",.95),0,1.05*(S.model?.scale||1)+.25,0,.07,.07,.07),T}};function Ai(x){let S=["fighter","mage","goblin","skeleton"],T=x.model?.base||x.kind,E=S.includes(T)?T:x.team==="heroes"?"fighter":"goblin",L=new We;C.add(L),L.position.set(x.x,.04,x.y),L.userData.unitId=x.id,L.userData.unitKind=x.kind;let F=new We;L.add(F),F.rotation.y=x.team==="heroes"?-1.57:1.57;let q=[];je(L,ue,ft,.002).scale.set(.97,.97,1);let k=O(L,ve,j(x.team==="heroes"?"#255a61":"#6e493a",.25,.65),0,.055,0,.365,.09,.365);k.userData.unitId=x.id,je(L,be,oe(x.team==="heroes"?"#6bd4cf":"#e09a70"),.105).scale.setScalar(.86);let te=je(L,ee,oe("#ffdb86"),.023);te.visible=!1;let Z=je(L,he("target-ring",()=>new Bn(.49,.54,48)),oe("#fa856e"),.026);Z.visible=!1;let Q=je(L,he("inspect-ring",()=>new Bn(.55,.585,48)),oe("#b8f6ee",.8),.028);Q.visible=!1;let Ae={},xe=dr(x),Ve=xe?$m(x):null;xe&&!Ve&&kd(xe);let K;if(Ve)F.add(Ve.model),F.userData.castKey=xe,L.userData.castKey=xe,L.userData.undeadModel=xe,q.push(...Ve.ownMaterials),K=Ve.rig;else{let Ft=xi=>{let Ds=j(xi,.2).clone();return q.push(Ds),Ds},kt=Ft(x.team==="heroes"?"#43818a":"#8f5e45"),cn=Ft(E==="goblin"?"#8fb060":"#dfb48e"),Un=Ft("#c4cfcb"),Zn={right:[],left:[],blade:[],bow:[]};O(F,B,kt,0,.48,0,.25,.68,.22).userData.unitId=x.id,O(F,Ce,cn,0,.96,0,.15,.16,.14).userData.unitId=x.id,Zn.right.push(O(F,Ce,kt,.22,.72,0,.09,.16,.09)),Zn.left.push(O(F,Ce,kt,-.22,.72,0,.09,.16,.09)),Zn.blade.push(O(F,re,Un,.32,.85,-.1,.04,.55,.08)),K=Bm(F,Zn,E)}let le=sn(x),Ne=Kt(x,le);L.add(Ne);let Ke=new tn(he("picker",()=>new Li(.4,.4,1.3,10)),I);Ke.position.y=.65,Ke.userData.unitId=x.id,Ke.name="unit-picker",L.add(Ke);let et=je(L,he("down-ring",()=>new Bn(.4,.47,40)),oe("#ff5a4a",.85),.03);et.visible=!1;let ot=je(L,he("dead-ring",()=>new Bn(.3,.47,40)),j("#16181a",0,1),.031);ot.visible=!1;let Tt=je(L,he("down-ring",()=>new Bn(.4,.47,40)),oe("#5fd6c4",.85),.03);Tt.visible=!1;let Gt={root:L,body:F,rig:K,name:Ne,labelY:le,active:te,target:Z,inspect:Q,picker:Ke,downRing:et,deadRing:ot,stableRing:Tt,markGroups:Ae,ownMaterials:q,castKey:Ve?xe:null,data:{...x},start:new D(x.x,.04,x.y),end:new D(x.x,.04,x.y),moveStart:0,moveEnd:0,targetYaw:F.rotation.y};return ci(Gt,x),Gt}function gn(){if(we||Be)return;if(ut){un=!0;return}un=!1;let x=!1;for(let[S,T]of Y){let E=dr(T.data);if(!E||T.castKey===E||!Jm(T.data))continue;let L=Ai(T.data);L.root.position.copy(T.root.position),L.body.rotation.y=T.body.rotation.y,L.targetYaw=T.targetYaw,ci(L,T.data),L.target.visible=T.target.visible,hi(T),Y.set(S,L),x=!0}x&&(l.shadowMap.needsUpdate=!0,_n())}let pr=Zm(()=>gn());function ci(x,S){x.active.visible=!!(S.active&&S.alive),x.inspect.visible=S.id===zt;let T=S.alive?[...new Set([...S.marks||[],...(S.conditions||[]).filter(E=>Ut[E])])]:S.dead?[]:(S.marks||[]).filter(E=>E==="sanctuary");for(let E of T)!x.markGroups[E]&&Ut[E]&&(x.markGroups[E]=Ut[E](x.root,S));for(let[E,L]of Object.entries(x.markGroups))L.visible=T.includes(E);if(x.markGroups.strength_drain&&x.markGroups.strength_drain.children.forEach((E,L)=>{E.name==="mark-chev"&&(E.visible=L-1<Math.min(3,Math.ceil((S.str_loss||0)/2)))}),S.alive)x.lying&&(x.rig.reset?.(),x.lying=!1),x.body.rotation.z=0,x.body.position.y=0,x.body.visible=!0,x.downRing.visible=!1,x.stableRing.visible=!1,x.deadRing.visible=!1,x.picker.visible=!0,x.picker.scale.y=1,x.picker.position.y=.65;else{x.rig.isSkinned&&x.rig.death(9999)?(x.body.rotation.z=0,x.body.position.y=0):(x.body.rotation.z=-Math.PI/2,x.body.position.y=.23),x.lying=!0,x.body.visible=S.team==="heroes";let E=S.dead===!0||(S.conditions||[]).includes("dead"),L=!E&&(S.conditions||[]).includes("stable");x.downRing.visible=S.team==="heroes"&&!E&&!L,x.stableRing.visible=S.team==="heroes"&&L,x.deadRing.visible=S.team==="heroes"&&E,x.picker.visible=S.team==="heroes",x.picker.scale.y=.22,x.picker.position.y=.14}x.data={...S},x.target.visible=!1}function hi(x){qt(x.name),x.rig.dispose&&x.rig.dispose();let S=x.rig.model?new Set(Ot(x.rig.model)):new Set;x.ownMaterials.forEach(T=>{S.has(T)||T.dispose()}),x.root.removeFromParent()}function Ot(x){let S=[];return x.traverse(T=>{T.material&&S.push(...Array.isArray(T.material)?T.material:[T.material])}),S}function vn(x,S={}){if(we||Be||!x?.map)return;De=x,Ue=!!S.busy,zt=S.inspectedId??null,S.biome!==void 0&&S.biome!==M&&(M=S.biome,rt=""),un&&!ut&&gn(),a.classList.toggle("is-busy",Ue);let T=x.map,E=T.width!==W||T.height!==pe,L=JSON.stringify([M,T.width,T.height,T.tiles,T.scene,(x.objects||[]).map(({id:K,kind:le,x:Ne,y:Ke,width:et,depth:ot,destroyed:Tt})=>({id:K,kind:le,x:Ne,y:Ke,ow:et,depth:ot,destroyed:Tt}))]);L!==rt&&($e(T),rt=L),(!J||E)&&(J=!0,us(!1));let F=performance.now(),q=new Set;for(let K of x.units||[]){q.add(K.id);let le=Y.get(K.id);if(le&&(le.data.kind!==K.kind||le.data.team!==K.team)&&(hi(le),Y.delete(K.id),le=null),le||(le=Ai(K),Y.set(K.id,le)),le.data.x!==K.x||le.data.y!==K.y){let et=!S.snap&&!S.ordered&&Math.abs(le.data.x-K.x)+Math.abs(le.data.y-K.y)===1;le.start.set(le.data.x,.04,le.data.y),le.end.set(K.x,.04,K.y),le.moveStart=F,le.moveEnd=!p&&et?F+300:0,le.moveEnd?le.root.position.copy(le.start):le.root.position.copy(le.end)}let Ne=JSON.stringify([le.data.conditions,le.data.marks,le.data.vital||null,le.data.alive]),Ke=JSON.stringify([K.conditions,K.marks,K.vital||null,K.alive]);(K.hp!==le.data.hp||K.max_hp!==le.data.max_hp||K.name!==le.data.name||K.active!==le.data.active||Ne!==Ke)&&(qt(le.name),le.name=Kt(K,le.labelY),le.root.add(le.name)),ci(le,K)}for(let[K,le]of Y)q.has(K)||(hi(le),Y.delete(K));let k=new Set;for(let K of Y.values())K.data.alive!==!1&&k.add(`${K.data.x},${K.data.y}`);for(let K of Y.values()){let le=K.data.alive===!1&&K.data.team==="heroes"&&k.has(`${K.data.x},${K.data.y}`),Ne=le?.24:0,Ke=le?-.22:0;K.body.position.x=Ne,K.body.position.z=Ke,K.downRing.position.set(Ne,.03,Ke),K.stableRing.position.set(Ne,.03,Ke),K.deadRing.position.set(Ne,.031,Ke),K.picker.position.x=Ne,K.picker.position.z=Ke}let te=new Set;for(let K of x.forces||[]){te.add(K.id);let le=mn.get(K.id);if(!le){let Ne=new We;Ne.name="spiritual-weapon",C.add(Ne),O(Ne,ve,oe("#cfe8ff",.9),0,0,0,.04,.5,.04),O(Ne,re,oe("#9fd0ff",.85),0,.3,0,.26,.17,.17),O(Ne,he("force-halo",()=>new It(.3,.02,6,28)),oe("#bfe0ff",.8),0,.15,0).rotation.x=Math.PI/2,Ne.rotation.z=-.5,le={g:Ne},mn.set(K.id,le)}le.g.position.set(K.x,1.05,K.y)}for(let[K,le]of mn)te.has(K)||(le.g.removeFromParent(),mn.delete(K));S.ordered||Xt.ingest(x,F),He(b);let Z=new Set,Q=new Set,Ae=new Set;for(let K of S.selectedActions||[]){K.kind==="move"&&Number.isInteger(K.x)&&Number.isInteger(K.y)?Z.add(`${K.x},${K.y}`):K.kind==="spiritual_weapon_move"&&Number.isInteger(K.x)&&Number.isInteger(K.y)&&Q.add(`${K.x},${K.y}`);for(let le of K.target_ids||[])Ae.add(le);K.target_id&&Ae.add(K.target_id)}if(x.phase==="setup"&&S.setupFigure)for(let K=0;K<T.height;K++)for(let le=0;le<T.width;le++)!Is(T,le,K)&&!(x.setup?.placements||[]).some(Ne=>Ne.id!==S.setupFigure&&Ne.x===le&&Ne.y===K)&&Z.add(`${le},${K}`);let xe=(K,le,Ne)=>{for(let Ke of K){let[et,ot]=Ke.split(",").map(Number),Tt=O(b,ue,oe(le,Ue?.12:.25),et,.058,ot,.84,.84,1);Tt.rotation.x=-Math.PI/2,Tt.castShadow=!1;let Gt=O(b,he("move-rim",()=>{let Ft=new Zs;Ft.moveTo(-.435,-.435),Ft.lineTo(.435,-.435),Ft.lineTo(.435,.435),Ft.lineTo(-.435,.435),Ft.closePath();let kt=new Ms;return kt.moveTo(-.405,-.405),kt.lineTo(-.405,.405),kt.lineTo(.405,.405),kt.lineTo(.405,-.405),kt.closePath(),Ft.holes.push(kt),new no(Ft)}),oe(Ne,Ue?.35:.88),et,.061,ot);Gt.rotation.x=-Math.PI/2,Gt.castShadow=!1}};xe(Z,"#59d8c3","#8cf0de"),xe(Q,"#7cc4ff","#bfe4ff");for(let K of Ae){let le=Y.get(K);le&&(le.target.visible=!0)}let Ve=S.previewFriendlyFire?"#ff4a38":"#ff7a3d";for(let K of S.previewCells||[]){let[le,Ne]=K,Ke=O(b,ue,oe(Ve,Ue?.14:.42),le,.066,Ne,.9,.9,1);Ke.rotation.x=-Math.PI/2,Ke.castShadow=!1}for(let K of x.objects||[])if(!K.destroyed){if(Ae.has(K.id)||S.inspectedId===K.id){let le=O(b,ue,oe(Ae.has(K.id)?"#fa856e":"#b8f6ee",.38),K.x+((K.width||1)-1)/2,.07,K.y+((K.depth||1)-1)/2,K.width||1,K.depth||1,1);le.rotation.x=-Math.PI/2,le.castShadow=!1}v.traverse(le=>{le.userData.objectId===K.id&&le.userData.mapProp&&(le.userData.objectState={...K})})}l.shadowMap.needsUpdate=!0,_n()}function ei(x){let S=Array.isArray(x.effects)?x.effects.map(T=>({...T})):[];if(x.opportunity){let T=Y.get(x.source_id),E=S.find(L=>L.source_id===x.source_id);T&&E&&S.unshift({id:9e5+(Number(x.id)||0)*10,type:"attack",style:"touch",variant:"opportunity",outcome:"hit",amount:0,text:"OPPORTUNITY",source_id:x.source_id,target_id:x.source_id,source:{x:T.data.x,y:T.data.y},target:{x:T.data.x,y:T.data.y}})}return S}function en(){return{position:{x:u.position.x,y:u.position.y,z:u.position.z},target:{x:g.target.x,y:g.target.y,z:g.target.z},azimuth:g.getAzimuthalAngle()}}function Bt(x,S,T=500,E=null,L={}){if(!(we||Be)){if(p||T<=0){dt=null;let F=L.next?.length?L.next[L.next.length-1]:null;F&&(x=F.pos,S=F.target),g.target.copy(S),u.position.copy(x),g.update(),_n();return}dt={t0:performance.now()+(L.delay||0),dur:T,fromPos:u.position.clone(),toPos:x.clone(),fromTarget:g.target.clone(),toTarget:S.clone(),orbitArc:E,ease:L.ease||"out",next:L.next?[...L.next]:[]},_n()}}function Kn(x,S=null,T=.48){let E=S?S.x0:-.75,L=S?S.x1:W-.25,F=S?S.z0:-.75,q=S?S.z1:pe-.25,k=new D((E+L)/2,T,(F+q)/2),te=x.clone().normalize(),Z=[];for(let xe of[E,L])for(let Ve of[F,q])for(let K of[-.85,1.45])Z.push(new D(xe,K,Ve));if(!S)for(let xe of De?.units||[])for(let Ve of[-.55,.55])Z.push(new D(xe.x+Ve,1.62,xe.y));let Q=Ja(te,k,Z,S?5.6:7.2,.9);return g.maxDistance=Math.max(36,Q*1.55),u.far=Math.max(120,Q*3.4),u.updateProjectionMatrix(),h.fog.near=Math.max(30,Q*1.45),h.fog.far=Math.max(72,Q*3.3),{pos:te.clone().multiplyScalar(Q).add(k),target:k,distance:Q}}function us(x=!0){if(we||Be)return;N="tactical",ze=null,dn.set(.54,.92,1.13).normalize();let{pos:S,target:T}=Kn(dn);x&&J?Bt(S,T,480):(dt=null,g.target.copy(T),u.position.copy(S),g.update(),g.saveState(),_n())}function mh(x,S=null){if(we||Be)return;let T=u.position.clone().sub(g.target),E=Math.atan2(T.x,T.z)||Math.atan2(.54,1.13);if(N=x==="cinematic"?"heroic":x==="action"?"skirmish":x,ze=null,x==="heroic"||x==="cinematic"){let k=De?.units||[],te=S&&k.find(Z=>Z.id===S)||zt&&k.find(Z=>Z.id===zt)||k.find(Z=>Z.id===De?.turn_id&&Z.alive!==!1)||k.find(Z=>Z.alive!==!1)||k[0];if(te){let Z=k.filter(Ke=>Ke.alive!==!1&&Ke.team!==te.team),Q=te.team==="heroes"?1:-1,Ae=0;if(Z.length){let Ke=Z.reduce((Gt,Ft)=>{let kt=(Ft.x-te.x)**2+(Ft.y-te.y)**2;return kt<Gt.d?{f:Ft,d:kt}:Gt},{f:Z[0],d:1/0}).f,et=Ke.x-te.x,ot=Ke.y-te.y,Tt=Math.hypot(et,ot)||1;Q=et/Tt,Ae=ot/Tt}let xe=new D(an.clamp(te.x+Q*.75,0,W-1),.74,an.clamp(te.y+Ae*.75,0,pe-1)),Ve=-Ae*.52,K=Q*.52,le=new D(-Q*.88+Ve,.44,-Ae*.88+K).normalize(),Ne=xe.clone().addScaledVector(le,4.45);Bt(Ne,xe,560)}else{let Z=(W-1)/2,Q=(pe-1)/2,Ae=new D(Z,.55,Q),xe=new D(Math.sin(E)*.92,.36,Math.cos(E)*.92).normalize();Bt(Ae.clone().addScaledVector(xe,8.2),Ae,540)}return}if(x==="skirmish"||x==="action"){let k=(De?.units||[]).filter(te=>te.alive!==!1);if(k.length){let te={x0:Math.max(-.7,Math.min(...k.map(xe=>xe.x))-1.8),x1:Math.min(W-.3,Math.max(...k.map(xe=>xe.x))+1.8),z0:Math.max(-.7,Math.min(...k.map(xe=>xe.y))-1.8),z1:Math.min(pe-.3,Math.max(...k.map(xe=>xe.y))+1.8)},Z=new D(Math.sin(E)*.82,.72,Math.cos(E)*.82).normalize(),{pos:Q,target:Ae}=Kn(Z,te,.52);Bt(Q,Ae,500);return}}if(x==="reverse"){Vd(Math.PI,480);return}let L=Math.hypot(.54,1.13);dn.set(Math.sin(E)*L,.92,Math.cos(E)*L).normalize();let{pos:F,target:q}=Kn(dn);Bt(F,q,500)}function Vd(x,S=400){if(we||Be)return;let T=dt?dt.toTarget.clone():g.target.clone(),E=dt?dt.toPos.clone():u.position.clone(),L=E.clone().sub(T),F=Math.max(.5,Math.hypot(L.x,L.z)),q=Math.atan2(L.x,L.z),k=q+x,te=new D(T.x+Math.sin(k)*F,E.y,T.z+Math.cos(k)*F);Bt(te,T,S,{radius:F,y:E.y,a0:q,a1:k})}function l0(x,S=!1){if(we||Be)return;let T=(De?.units||[]).find(Z=>Z.id===x);if(!T)return;if(S){mh("heroic",x);return}let E=u.position.clone().sub(g.target),L=E.length(),F=E.y/Math.max(.1,L)>.92?new D(.54,.82,1.13).normalize():E.normalize(),q=Math.min(Math.max(L,5.8),9.2),k=new D(T.x,.58,T.y),te=k.clone().addScaledVector(F,q);Bt(te,k,460)}function Za(){dt=null,ze=null,De&&(it=!0)}function Eo(){let x=u.position.clone().sub(g.target),S=Math.atan2(x.x,x.z),T=Math.hypot(.54,1.13);return new D(Math.sin(S)*T,.92,Math.cos(S)*T).normalize()}function gh(x=1){let S=Math.max(1,a.clientWidth),T=Math.max(1,a.clientHeight),E=Lt||{top:0,bottom:T,left:0,right:S},L=2*E.left/S-1,F=2*E.right/S-1,q=1-2*E.bottom/T,k=1-2*E.top/T,te=(L+F)/2,Z=(q+k)/2;return L=te+(L-te)*x,F=te+(F-te)*x,q=Z+(q-Z)*x,k=Z+(k-Z)*x,{x0:L,x1:F,y0:q,y1:k}}let mr=new bn,gr=new D;function $a(x,S,T){for(let E of S)if(gr.copy(E).project(x),gr.z>=1||gr.x<T.x0||gr.x>T.x1||gr.y<T.y0||gr.y>T.y1)return!1;return!0}function Ja(x,S,T,E=5.6,L=.88){let F=gh(L);mr.copy(u);let q=Z=>{mr.position.copy(S).addScaledVector(x,Z),mr.lookAt(S),mr.updateMatrixWorld(!0)},k=E,te=E;for(let Z=0;Z<12&&(q(te),!$a(mr,T,F));Z++)k=te,te*=1.6;if(te===E)return E;for(let Z=0;Z<22;Z++){let Q=(k+te)/2;q(Q),$a(mr,T,F)?te=Q:k=Q}return te}function c0(x){if(we||Be)return;let S=Math.max(1,a.clientWidth),T=Math.max(1,a.clientHeight),E=x&&x.bottom-x.top>80&&x.right-x.left>80?{top:Math.max(0,x.top),bottom:Math.min(T,x.bottom),left:Math.max(0,x.left),right:Math.min(S,x.right)}:null;((F,q)=>!F&&!q||F&&q&&["top","bottom","left","right"].every(k=>Math.abs(F[k]-q[k])<24))(E,Lt)||(Lt=E,Wd())}function Wd(){let x=Math.max(1,a.clientWidth),S=Math.max(1,a.clientHeight);if(!Lt){u.clearViewOffset(),u.updateProjectionMatrix(),_n();return}let T=(Lt.left+Lt.right)/2-x/2,E=(Lt.top+Lt.bottom)/2-S/2,L=1+2*Math.max(Math.abs(T)/x,Math.abs(E)/S);u.setViewOffset(L*x,L*S,(L-1)*x/2-T,(L-1)*S/2-E,x,S),u.updateProjectionMatrix(),_n()}function h0(){let x=[];for(let S of[-.75,W-.25])for(let T of[-.75,pe-.25])for(let E of[-.85,1.45])x.push(new D(S,E,T));for(let S of De?.units||[])S.alive!==!1&&x.push(new D(S.x,1.62,S.y));return x}function _h(x){let S=Eo(),T=Kn(S);if(!x)return T;let E=h0(),L=new D(x.x,.48,x.z);for(let F of[.9,.7,.5,.3]){let q=T.target.clone().lerp(L,F),k=Ja(S,q,E,7.2);if(k<=T.distance*1.2)return{target:q,distance:k,pos:q.clone().addScaledVector(S,k)}}return T}function ja(x,S=.58){let T=Y.get(x);return T?new D(T.root.position.x,S,T.root.position.z):null}function u0(x,S=.8){return u.updateMatrixWorld(),$a(u,x,gh(S))}function yh(){return Oe&&!it&&!we&&!Be&&!!De}function d0(x,{player:S=!1}={}){if(!Oe||we||Be||!De)return!1;let T=ja(x,.55);if(!T)return!1;if(it=!1,ze=null,N==="heroic")return mh("heroic",x),!0;let E=_h(T);if(S&&!p){let L=Eo(),F=u.position.distanceTo(g.target),q=an.clamp(E.distance*.72,6.2,Math.max(6.2,F));Bt(T.clone().addScaledVector(L,q),T,650,null,{ease:"inout",next:[{pos:E.pos,target:E.target,dur:1100,hold:300}]})}else Bt(E.pos,E.target,800,null,{ease:"inout"});return A={kind:"turn",id:x,at:performance.now()},!0}function f0(x){if(!yh())return;let S=x.action,T=(S.moves||[]).find(q=>q.path?.length>1)?.source_id,E=u.position.clone().sub(g.target);if(T){let q=Qt&&!p&&N!=="heroic"&&T===S.source_id;dt=null;let k=E.length();if(q){let te=ja(T),Z=[];if(te)for(let Q of[-2.2,2.2])for(let Ae of[-2.2,2.2])for(let xe of[0,1.7])Z.push(new D(te.x+Q,xe,te.z+Ae));k=Math.min(E.length(),te?Ja(Eo(),te,Z,6.2,.9):7.4)}ze={id:T,zoom:q,dir:q?Eo():E.clone().normalize(),dist:k,last:null},A={kind:"move",id:T,at:performance.now()};return}let L=[...new Set((x.events||[]).map(q=>q.target_id).filter(q=>q&&q!==S.source_id))],F=[S.source_id,...L].map(q=>ja(q,.9)).filter(Boolean);if(!(!F.length||N==="heroic")){if(Qt&&!p&&L.length){let q=new Wn().setFromPoints(F).expandByScalar(1.3),k=q.getCenter(new D);k.y=.6;let te=[];for(let Ae of[q.min.x,q.max.x])for(let xe of[q.min.z,q.max.z])te.push(new D(Ae,0,xe),new D(Ae,1.7,xe));let Z=Eo(),Q=Ja(Z,k,te,6.4,.8);Bt(k.clone().addScaledVector(Z,Q),k,480,null,{ease:"inout"}),x.zoomed=!0,A={kind:"attack",id:S.source_id,at:performance.now()}}else if(!u0(F)){let q=_h(F[0]);Bt(q.pos,q.target,600,null,{ease:"inout"})}}}function p0(x){let S=!!(ze&&ze.zoom||x.zoomed),T=ze?.id||x.action.source_id;if(ze=null,se={at:Math.round(performance.now()),zoomed:S,active:yh()},!yh()||!S)return;let E=x.newlyDead.size>0||(x.events||[]).some(F=>F.crit),L=_h(ja(T)||g.target);Bt(L.pos,L.target,950,null,{ease:"inout",delay:E?900:380})}function m0(x){let S=Y.get(ze.id);if(!S)return ze=null,!1;let T=ze.last===null?.016:Math.min(1,(x-ze.last)/1e3);ze.last=x;let E=1-Math.exp(-T/.22),L=new D(S.root.position.x,.58,S.root.position.z);if(ze.zoom)return g.target.lerp(L,E),u.position.lerp(L.clone().addScaledVector(ze.dir,ze.dist),E),!0;if(u.updateMatrixWorld(),!$a(u,[L],gh(.62))){let F=L.clone().sub(g.target);F.y=0,F.multiplyScalar(E*1.6),g.target.add(F),u.position.add(F)}return!0}function g0(x){Oe=!!x,Oe||(ze=null)}function _0(x){Qt=!!x}function y0(){return{autoCam:Oe,actionZoom:Qt,manualHold:it,preset:N,tracking:ze?.id||null,tween:!!dt,playing:!!ut,actor:ut?.action?.source_id||null,last:A,ended:se}}function xh(){for(;w.children.length;)w.remove(w.children[0]);for(;Pe.length;)Pe.pop().dispose()}function x0({hoverCell:x=null,pathCells:S=null,pathColor:T="#6af7df",pathDotColor:E="#a8fff0",arcFrom:L=null,arcTo:F=null,arcColor:q="#ffd478",areaCells:k=null,areaColor:te="#ff7a3d"}={}){if(!(we||Be)){if(xh(),x&&Number.isInteger(x.x)&&Number.isInteger(x.y)){let Z=O(w,he("hover-bracket",()=>{let Q=new Zs;Q.moveTo(-.47,-.47),Q.lineTo(.47,-.47),Q.lineTo(.47,.47),Q.lineTo(-.47,.47),Q.closePath();let Ae=new Ms;return Ae.moveTo(-.42,-.42),Ae.lineTo(-.42,.42),Ae.lineTo(.42,.42),Ae.lineTo(.42,-.42),Ae.closePath(),Q.holes.push(Ae),new no(Q)}),oe(x.color||"#ffe194",.92),x.x,.068,x.y);Z.rotation.x=-Math.PI/2,Z.castShadow=!1}if(Array.isArray(k)&&k.length)for(let[Z,Q]of k){let Ae=O(w,ue,oe(te,.36),Z,.067,Q,.88,.88,1);Ae.rotation.x=-Math.PI/2,Ae.castShadow=!1}if(Array.isArray(S)&&S.length>=2){let Z=S.map(([Ve,K])=>new D(Ve,.11,K)),Q=new Qr(Z,!1,"catmullrom",.15),Ae=new io(Q,Math.max(8,S.length*6),.042,8,!1);Pe.push(Ae);let xe=new tn(Ae,oe(T,.88));w.add(xe);for(let Ve=1;Ve<S.length;Ve++){let[K,le]=S[Ve],Ne=O(w,ve,oe(E,.92),K,.1,le,.11,.03,.11);Ne.castShadow=!1}}if(L&&F){let Z=new D(L.x,1.02,L.y),Q=new D(F.x,.86,F.y),Ae=Z.distanceTo(Q),xe=Z.clone().lerp(Q,.5);xe.y+=Math.min(2.6,.65+Ae*.24);let Ve=new Ks(Z,xe,Q),K=new io(Ve,28,.036,8,!1);Pe.push(K),w.add(new tn(K,oe(q,.86)));let le=je(w,ee,oe(q,.95),.075);le.position.x=F.x,le.position.z=F.y,le.scale.setScalar(1.08)}_n()}}function v0(x){M=x==="auto"?null:x,De&&(rt="",vn(De,{snap:!0,ordered:!0,inspectedId:zt}))}function M0(x){m=!!x&&!p,m&&_n()}function b0(x){y=x,_n()}function Xd(x,S,T){return u.updateMatrixWorld(),Dt.set(x,S,T).project(u),{x:(Dt.x+1)*a.clientWidth/2,y:(1-Dt.y)*a.clientHeight/2,visible:Dt.z>-1&&Dt.z<1&&Math.abs(Dt.x)<=1&&Math.abs(Dt.y)<=1}}function S0(x,S){return Xd(x,.055,S)}function E0(x){let S=Y.get(x);return S?Xd(S.root.position.x,.65,S.root.position.z):null}function To(){if(we||Be)return;let x=Math.max(1,s.clientWidth),S=Math.max(1,s.clientHeight);l.setPixelRatio(Math.min(window.devicePixelRatio||1,f)),l.setSize(x,S,!1);let T=x/S,E=u.aspect;u.aspect=T,u.updateProjectionMatrix(),Lt&&Wd(),!J&&De?(J=!0,us(!1)):De&&Math.abs(Math.log(T/E))>.25?us(!1):_n()}function qd(){we||Be||(g.target.x=an.clamp(g.target.x,-1,W),g.target.z=an.clamp(g.target.z,-1,pe),g.target.y=an.clamp(g.target.y,0,1.5),n?.(en()),_n())}let Qa=0;function _n(){!Me&&!we&&!Be&&!document.hidden&&(Me=requestAnimationFrame(A0))}function _r(){let x=ut;ut=null,ze=null;for(let S of Y.values())S.data.alive&&S.rig.reset();Xt.clear(),R0(),x?.resolve(!1),un&&gn()}function T0(x,S={}){if(we||Be||document.hidden)return Promise.resolve(!1);ut&&_r();let T=ei(x);return p?(Xt.play(T,performance.now()),S.impact?.(),Promise.resolve(!0)):new Promise(E=>{let L=T.find(Q=>Q.source_id===x.source_id&&Q.style!=="touch")||T[0]||null,F=L?.style||null,q=x.kind==="dash"||(x.moves||[]).some(Q=>Q.path.length>=6),k=q?200:320,te=(x.moves||[]).reduce((Q,Ae)=>Q+Math.max(0,Ae.path.length-1),0),Z=new Set;for(let Q of x.after?.units||[])(x.before?.units||[]).find(xe=>xe.id===Q.id)?.alive&&!Q.alive&&Z.add(Q.id);ut={action:x,events:T,primary:L,callbacks:S,resolve:E,style:F,stepMs:k,isDash:q,newlyDead:Z,start:null,impacted:!1,duration:F?km(F):te?te*k:220},f0(ut),_n()})}function w0(x){let S=ut;if(!S)return!1;if(S.start===null){S.start=x;let q=Y.get(S.action.source_id),k=S.primary;if(q&&k){let te=k.target.x-k.source.x,Z=k.target.y-k.source.y;(te||Z)&&(q.body.rotation.y=Math.atan2(-te,-Z),q.targetYaw=q.body.rotation.y),q.rig.pose(S.style,id,S.action.kind),q.root.updateWorldMatrix(!0,!0);let Q=new D;(S.style==="arrow"?q.rig.bow:S.style==="dreadful_glare"&&q.rig.head||q.rig.right).getWorldPosition(Q),Xt.play(S.events,x,{releaseAt:id,impactAt:sh(S.style)},Q.toArray())}else S.events.length&&Xt.play(S.events,x,{releaseAt:80,impactAt:220})}let T=x-S.start,E=Y.get(S.action.source_id);E&&S.style&&E.rig.pose(S.style,T,S.action.kind);let L=T;for(let q of S.action.moves||[]){let k=Y.get(q.source_id),te=q.path,Z=Math.max(0,te.length-1)*S.stepMs;if(k&&te.length&&L>=0){let Q=Math.min(te.length-1,Math.floor(L/S.stepMs)),Ae=Math.min(te.length-1,Q+1),xe=Q===Ae?0:L%S.stepMs/S.stepMs,[Ve,K]=te[Q],[le,Ne]=te[Ae];if(k.root.position.set(Ve+(le-Ve)*xe,.04,K+(Ne-K)*xe),le!==Ve||Ne!==K){let Ke=Math.atan2(Ve-le,K-Ne);k.body.rotation.y=Wb(k.body.rotation.y,Ke,.36),k.targetYaw=Ke}L<=Z?k.rig.walk?.(L,S.isDash):k.rig.idle?.(x),S.lastStep!==`${q.source_id}:${Q}`&&(S.lastStep=`${q.source_id}:${Q}`,Pt(Ve,K),S.callbacks.step?.(q.source_id,Ve,K))}L-=Z}let F=S.style?sh(S.style):S.duration;for(let q of S.events)if(q.outcome==="hit"&&q.amount>0&&q.target_id!==S.action.source_id){let k=Y.get(q.target_id);k&&T>=F&&(S.newlyDead.has(q.target_id)?(k.body.visible=!0,k.rig.death?.(T-F)):k.lying?k.rig.death?.(9999):k.rig.hit?.(T-F))}if(!S.impacted&&T>=F){S.impacted=!0,S.callbacks.impact?.();for(let q of S.newlyDead){let k=Y.get(q);k&&k.rig.isSkinned&&(k.body.visible=!0)}}if(l.shadowMap.needsUpdate=!0,T>=S.duration){for(let[q,k]of Y)k.data.alive?k.rig.reset():k.data.team!=="heroes"?k.body.visible=!1:k.rig.death?.(9999);return ut=null,p0(S),S.resolve(!0),un&&gn(),!1}return!0}function A0(x){if(Me=0,we||Be)return;let S=!1;if(dt&&x<dt.t0)dt.fromPos.copy(u.position),dt.fromTarget.copy(g.target),S=!0;else if(dt){let E=an.clamp((x-dt.t0)/Math.max(1,dt.dur),0,1),L=dt.ease==="inout"?E<.5?4*E**3:1-(-2*E+2)**3/2:1-Math.pow(1-E,3);if(g.target.lerpVectors(dt.fromTarget,dt.toTarget,L),dt.orbitArc){let F=dt.orbitArc.a0+(dt.orbitArc.a1-dt.orbitArc.a0)*L;u.position.set(g.target.x+Math.sin(F)*dt.orbitArc.radius,dt.orbitArc.y,g.target.z+Math.cos(F)*dt.orbitArc.radius)}else u.position.lerpVectors(dt.fromPos,dt.toPos,L);if(E>=1){let F=dt.next.shift();if(F){let q=dt.next;Bt(F.pos,F.target,F.dur,null,{ease:"inout",delay:F.hold||0,next:q}),S=!0}else dt=null}else S=!0}else ze&&(S=m0(x)||S);g.update(),S=w0(x)||S;let T=!1;for(let E of Y.values())if(E.moveEnd>0){T=!0;let L=E.moveEnd===E.moveStart?1:an.clamp((x-E.moveStart)/(E.moveEnd-E.moveStart),0,1),F=L*L*(3-2*L);E.root.position.lerpVectors(E.start,E.end,F),E.rig.walk?.(x-E.moveStart,!1),L>=1?(E.moveEnd=0,E.rig.reset()):S=!0}else if(m&&!ut&&E.data.alive&&E.rig.isSkinned){let L=(E.data.conditions||[]).includes("dodge");E.rig.idle(x,L)}if((m||ut)&&ye.length)for(let E of ye){let L=Math.sin(x*.011+E.phase)*.14+Math.cos(x*.023+E.phase*1.7)*.08;E.flame.scale.y=E.baseScaleY*(1+L),E.flame.rotation.z=Math.sin(x*.008+E.phase)*.14,E.light&&(E.light.intensity=E.baseIntensity*(1+L*.55))}for(let E=ie.length-1;E>=0;E--){let L=ie[E],F=(x-L.born)/420;F>=1?(L.mesh.removeFromParent(),L.mat.dispose(),ie.splice(E,1)):(L.mesh.position.y=.08+F*.18,L.mesh.scale.setScalar(.06+F*.1),L.mat.opacity=.42*(1-F),S=!0)}if(m||ut){for(let E of mn.values())E.g.position.y=1.05+Math.sin(x*.004)*.06,E.g.rotation.y=x*.0018;for(let E of ge){let L=x*.001*E.speed+E.phase,F=(E.yOffset+x*18e-5*E.speed)%2.15;E.mesh.position.y=.16+F,E.mesh.position.x=E.baseX+Math.sin(L)*.24,E.mesh.position.z=E.baseZ+Math.cos(L*.85)*.24;let q=Math.sin(F/2.15*Math.PI);E.mat.opacity=.12+q*.42}}S=Xt.tick(x,u,a.clientHeight)||S,Pn(),T&&(l.shadowMap.needsUpdate=!0),l.render(h,u),!_e&&De&&(_e=!0,i?.(en())),S?_n():m&&(clearTimeout(Qa),Qa=setTimeout(_n,qb))}function Yd(){let x=[];for(let S of Y.values())S.picker.visible&&S.root.visible&&x.push(S.picker);return x}function Kd(x){let S=x.filter(L=>L.object.userData.unitId!=null);if(!S.length)return null;let T=S[0],E=Y.get(T.object.userData.unitId);if(E&&E.data.alive===!1){let L=S.find(F=>{let q=Y.get(F.object.userData.unitId);return q&&q.data.alive!==!1&&q.data.x===E.data.x&&q.data.y===E.data.y});if(L)return L}return T}function Zd(x){if(Fe.add(x.pointerId),Fe.size!==1){Se=null,Za();return}Se=x.isPrimary&&x.button===0?{id:x.pointerId,x:x.clientX,y:x.clientY,time:performance.now(),dragged:!1}:null,x.button!==0&&Za()}function $d(x){if(Se?.id===x.pointerId&&Math.hypot(x.clientX-Se.x,x.clientY-Se.y)>5&&(Se.dragged=!0,Za()),Fe.size||!t||!De||we||Be)return;let S=a.getBoundingClientRect();if(x.clientX<S.left||x.clientX>S.right||x.clientY<S.top||x.clientY>S.bottom)return;Ye.set((x.clientX-S.left)/S.width*2-1,1-(x.clientY-S.top)/S.height*2),u.updateMatrixWorld(),h.updateMatrixWorld(!0),tt.setFromCamera(Ye,u);let T=Kd(tt.intersectObjects(Yd(),!1));if(T){let E=Y.get(T.object.userData.unitId);if(E){let L=`u:${E.data.id}:${x.clientX>>2}:${x.clientY>>2}`;L!==Nt&&(Nt=L,t({x:E.data.x,y:E.data.y,unitId:E.data.id,clientX:x.clientX,clientY:x.clientY}));return}}if(tt.ray.intersectPlane(ht,xt)){let E=Math.floor(xt.x+.5),L=Math.floor(xt.z+.5);if(E>=0&&L>=0&&E<W&&L<pe){let F=(De.units||[]).find(te=>te.x===E&&te.y===L&&te.alive!==!1)||(De.units||[]).find(te=>te.x===E&&te.y===L&&te.team==="heroes"),q=(De.objects||[]).find(te=>!te.destroyed&&td(te,E,L)),k=`c:${E}:${L}:${F?.id||q?.id||""}:${x.clientX>>2}:${x.clientY>>2}`;k!==Nt&&(Nt=k,t({x:E,y:L,unitId:F?.id||q?.id||null,clientX:x.clientX,clientY:x.clientY}));return}}Nt!=="none"&&(Nt="none",t(null))}function Jd(){Nt!=="none"&&(Nt="none",t?.(null))}function jd(){Za()}function Qd(x){Fe.delete(x.pointerId);let S=Se;if(Se=null,!S||S.id!==x.pointerId||S.dragged||Fe.size||Ue||!De||we||Be||Math.hypot(x.clientX-S.x,x.clientY-S.y)>6||performance.now()-S.time>700)return;let T=a.getBoundingClientRect();if(x.clientX<T.left||x.clientX>T.right||x.clientY<T.top||x.clientY>T.bottom)return;Ye.set((x.clientX-T.left)/T.width*2-1,1-(x.clientY-T.top)/T.height*2),u.updateMatrixWorld(),h.updateMatrixWorld(!0),tt.setFromCamera(Ye,u);let E=tt.intersectObjects(Yd(),!1),L=Kd(E);if(L){let Q=Y.get(L.object.userData.unitId);if(Q){e?.(Q.data.x,Q.data.y,Q.data.id);return}}let F=tt.intersectObject(v,!0).find(Q=>Q.object.userData.objectId!=null&&Q.object.parent?.visible!==!1);if(F){let Q=(De.objects||[]).find(Ae=>Ae.id===F.object.userData.objectId&&!Ae.destroyed);if(Q){e?.(Q.x,Q.y,Q.id);return}}if(!tt.ray.intersectPlane(ht,xt))return;let q=Math.floor(xt.x+.5),k=Math.floor(xt.z+.5);if(q<0||k<0||q>=W||k>=pe)return;let te=(De.units||[]).find(Q=>Q.x===q&&Q.y===k&&Q.alive!==!1)||(De.units||[]).find(Q=>Q.x===q&&Q.y===k&&Q.team==="heroes"),Z=(De.objects||[]).find(Q=>!Q.destroyed&&td(Q,q,k));e?.(q,k,te?.id||Z?.id)}function ef(x){Fe.delete(x.pointerId),Se=null}function tf(x){x?.preventDefault(),!(Be||we)&&(Be=!0,cancelAnimationFrame(Me),clearTimeout(Qa),Me=0,_r(),Xt.dispose(),g.enabled=!1,s.dataset.renderer="unavailable",a.dataset.renderer="unavailable",r?.("The WebGL context was lost.",{lost:!0}))}function R0(){for(let x of Y.values())x.moveEnd&&(x.root.position.copy(x.end),x.moveEnd=0);l.shadowMap.needsUpdate=!0}function nf(x){p=x.matches,p&&(m=!1),Xt.setReducedMotion(p),p&&_r(),_n()}function sf(){Xt.setHidden(document.hidden),document.hidden?(cancelAnimationFrame(Me),Me=0,_r()):_n()}g.addEventListener("change",qd),a.addEventListener("pointerdown",Zd,{capture:!0}),a.addEventListener("pointermove",$d,{capture:!0}),a.addEventListener("pointerleave",Jd),a.addEventListener("wheel",jd,{passive:!0}),window.addEventListener("pointerup",Qd),window.addEventListener("pointercancel",ef),a.addEventListener("webglcontextlost",tf),_?.addEventListener?.("change",nf),document.addEventListener("visibilitychange",sf);let rf=typeof ResizeObserver=="function"?new ResizeObserver(To):null;rf?.observe(s),window.addEventListener("resize",To);function C0(){if(!we){we=!0,cancelAnimationFrame(Me),clearTimeout(Qa),rf?.disconnect(),pr(),_r(),xh(),Xt.dispose(),g.removeEventListener("change",qd),g.dispose(),a.removeEventListener("pointerdown",Zd,{capture:!0}),a.removeEventListener("pointermove",$d,{capture:!0}),a.removeEventListener("pointerleave",Jd),a.removeEventListener("wheel",jd),window.removeEventListener("pointerup",Qd),window.removeEventListener("pointercancel",ef),a.removeEventListener("webglcontextlost",tf),window.removeEventListener("resize",To),document.removeEventListener("visibilitychange",sf),_?.removeEventListener?.("change",nf);for(let x of ie)x.mesh.removeFromParent(),x.mat.dispose();ie.length=0,So();for(let x of Y.values())hi(x);Y.clear(),U.forEach(x=>x.dispose()),$.forEach(x=>x.dispose()),ne.forEach(x=>x.dispose()),v.traverse(x=>{x.isInstancedMesh&&x.dispose()}),h.traverse(x=>{x.isLight&&x.dispose()}),h.clear(),l.dispose(),l.forceContextLoss(),a.remove(),(s.dataset.renderer==="webgl"||s.dataset.renderer==="unavailable")&&delete s.dataset.renderer}}return To(),us(!1),{update:vn,playAction:T0,cancelPlayback:_r,resetCamera:us,setCameraPreset:mh,orbitBy:Vd,focusUnit:l0,directTurn:d0,setAutoCamera:g0,setActionZoom:_0,getDirectorState:y0,setSafeArea:c0,setTacticalPreview:x0,clearHoverPreview:xh,setBiome:v0,getActiveTheme:()=>Te,setIdleLoop:M0,setLabelMode:b0,resize:To,dispose:C0,getCameraState:en,getAssetState:uh,getEffectState:Xt.getState,projectCell:S0,projectUnit:E0,renderer:l,canvas:a,scene:h,camera:u,controls:g}}return O0(Kb);})();
