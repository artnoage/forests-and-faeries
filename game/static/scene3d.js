var EmberScene=(()=>{var jc=Object.defineProperty;var Bm=Object.getOwnPropertyDescriptor;var km=Object.getOwnPropertyNames;var zm=Object.prototype.hasOwnProperty;var Hm=(s,e)=>{for(var t in e)jc(s,t,{get:e[t],enumerable:!0})},Gm=(s,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of km(e))!zm.call(s,i)&&i!==t&&jc(s,i,{get:()=>e[i],enumerable:!(n=Bm(e,i))||n.enumerable});return s};var Vm=s=>Gm(jc({},"__esModule",{value:!0}),s);var tb={};Hm(tb,{PRESET_DEFAULT_THEME:()=>Am,THEME_CATALOG:()=>wm,createViewer:()=>eb,disposeAssets:()=>Tm,getAssetState:()=>Zc,getCastState:()=>md,getUndeadState:()=>gd,prepareAssets:()=>Em,resolveCastKey:()=>rr});/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var xs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},vs={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Cf=0,Hh=1,Pf=2;var Zs=1,If=2,Jr=3,Ri=0,zn=1,Tn=2,$s=0,Ms=1,Js=2,Gh=3,Vh=4,Lf=5;var js=100,Df=101,Nf=102,Uf=103,Of=104,Ff=200,Bf=201,kf=202,zf=203,Wh=204,Xh=205,Hf=206,Gf=207,Vf=208,Wf=209,Xf=210,qf=211,Yf=212,Kf=213,Zf=214,gl=0,_l=1,yl=2,Rr=3,xl=4,vl=5,Ml=6,bl=7,qh=0,$f=1,Jf=2,Ci=0,Yh=1,Kh=2,Zh=3,aa=4,$h=5,Jh=6,jh=7,Ah="attached",jf="detached",Qh=300,Qs=301,jr=302,Wl=303,Xl=304,Jn=1e3,ii=1001,Cr=1002,ln=1003,ql=1004;var er=1005;var yn=1006,Qr=1007;var oi=1008;var Xn=1009,eu=1010,tu=1011,eo=1012,Yl=1013,pi=1014,ti=1015,mi=1016,Kl=1017,Zl=1018,tr=1020,nu=35902,iu=35899,su=1021,ru=1022,ai=1023,Wi=1026,ts=1027,$l=1028,Jl=1029,bs=1030,jl=1031;var Ql=1033,la=33776,ca=33777,ha=33778,ua=33779,ec=35840,tc=35841,nc=35842,ic=35843,sc=36196,rc=37492,oc=37496,ac=37488,lc=37489,da=37490,cc=37491,hc=37808,uc=37809,dc=37810,fc=37811,pc=37812,mc=37813,gc=37814,_c=37815,yc=37816,xc=37817,vc=37818,Mc=37819,bc=37820,Sc=37821,Ec=36492,Tc=36494,wc=36495,Ac=36283,Rc=36284,fa=36285,Cc=36286,Pc=2200,Qf=2201,ep=2202,Ns=2300,Us=2301,pl=2302,Rh=2303,Is=2400,Ls=2401,Ao=2402,Ic=2500,tp=2501,ou=0,pa=1,to=2,np=3200;var Lc=0,ip=1,ns="",Kt="srgb",On="srgb-linear",Ro="linear",Gt="srgb";var ml=7680;var sp=519,rp=512,op=513,ap=514,au=515,lp=516,cp=517,lu=518,cu=519,hu=35044;var uu="300 es",si=2e3,Pr=2001;function Wm(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Xm(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ir(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function hp(){let s=Ir("canvas");return s.style.display="block",s}var Ld={},Lr=null;function Co(...s){let e="THREE."+s.shift();Lr?Lr("log",e,...s):console.log(e,...s)}function up(s){let e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function it(...s){s=up(s);let e="THREE."+s.shift();if(Lr)Lr("warn",e,...s);else{let t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function ht(...s){s=up(s);let e="THREE."+s.shift();if(Lr)Lr("error",e,...s);else{let t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function Ds(...s){let e=s.join(" ");e in Ld||(Ld[e]=!0,it(...s))}function dp(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var fp={[gl]:gl,[yl]:Ml,[xl]:xl,[Rr]:vl,[_l]:_l,[Ml]:yl,[bl]:bl,[vl]:Rr},ri=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let i=n[e];if(i!==void 0){let r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}},Pn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Dd=1234567,So=Math.PI/180,Os=180/Math.PI;function gi(){let s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Pn[s&255]+Pn[s>>8&255]+Pn[s>>16&255]+Pn[s>>24&255]+"-"+Pn[e&255]+Pn[e>>8&255]+"-"+Pn[e>>16&15|64]+Pn[e>>24&255]+"-"+Pn[t&63|128]+Pn[t>>8&255]+"-"+Pn[t>>16&255]+Pn[t>>24&255]+Pn[n&255]+Pn[n>>8&255]+Pn[n>>16&255]+Pn[n>>24&255]).toLowerCase()}function vt(s,e,t){return Math.max(e,Math.min(t,s))}function du(s,e){return(s%e+e)%e}function qm(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Ym(s,e,t){return s!==e?(t-s)/(e-s):0}function Eo(s,e,t){return(1-t)*s+t*e}function Km(s,e,t,n){return Eo(s,e,1-Math.exp(-t*n))}function Zm(s,e=1){return e-Math.abs(du(s,e*2)-e)}function $m(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Jm(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function jm(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Qm(s,e){return s+Math.random()*(e-s)}function e0(s){return s*(.5-Math.random())}function t0(s){s!==void 0&&(Dd=s);let e=Dd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function n0(s){return s*So}function i0(s){return s*Os}function s0(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function r0(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function fu(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function o0(s,e,t,n,i){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),d=r((e-n)/2),h=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*u,l*d,l*h,a*c);break;case"YZY":s.set(l*h,a*u,l*d,a*c);break;case"ZXZ":s.set(l*d,l*h,a*u,a*c);break;case"XZX":s.set(a*u,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*u,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*u,a*c);break;default:it("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Dc(s){switch(s.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function pu(s,e){if(e.constructor===Float32Array)return s;let t=Dc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(s/t,-1)}function mu(s,e){if(e.constructor===Float32Array)return s;let t=Dc(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(s*t)}var tn={DEG2RAD:So,RAD2DEG:Os,generateUUID:gi,clamp:vt,euclideanModulo:du,mapLinear:qm,inverseLerp:Ym,lerp:Eo,damp:Km,pingpong:Zm,smoothstep:$m,smootherstep:Jm,randInt:jm,randFloat:Qm,randFloatSpread:e0,seededRandom:t0,degToRad:n0,radToDeg:i0,isPowerOfTwo:s0,ceilPowerOfTwo:r0,floorPowerOfTwo:fu,setQuaternionFromProperEuler:o0,normalize:mu,denormalize:pu},be=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=vt(this.x,e.x,t.x),this.y=vt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=vt(this.x,e,t),this.y=vt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},_n=class{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],u=n[i+2],d=n[i+3],h=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(d!==_||l!==h||c!==f||u!==g){let p=l*h+c*f+u*g+d*_;p<0&&(h=-h,f=-f,g=-g,_=-_,p=-p);let m=1-a;if(p<.9995){let y=Math.acos(p),x=Math.sin(y);m=Math.sin(m*y)/x,a=Math.sin(a*y)/x,l=l*m+h*a,c=c*m+f*a,u=u*m+g*a,d=d*m+_*a}else{l=l*m+h*a,c=c*m+f*a,u=u*m+g*a,d=d*m+_*a;let y=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=y,c*=y,u*=y,d*=y}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,i,r,o){let a=n[i],l=n[i+1],c=n[i+2],u=n[i+3],d=r[o],h=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*d+l*f-c*h,e[t+1]=l*g+u*h+c*d-a*f,e[t+2]=c*g+u*f+a*h-l*d,e[t+3]=u*g-a*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(i/2),d=a(r/2),h=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"YXZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"ZXY":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"ZYX":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"YZX":this._x=h*u*d+c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d-h*f*g;break;case"XZY":this._x=h*u*d-c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d+h*f*g;break;default:it("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+a+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>d){let f=2*Math.sqrt(1+n-a-d);this._w=(u-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>d){let f=2*Math.sqrt(1+a-n-d);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+d-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+i*c-r*l,this._y=i*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-i*a,this._w=o*u-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),u=2*(a*t-r*i),d=2*(r*n-o*t);return this.x=t+l*c+o*d-a*u,this.y=n+l*u+a*c-r*d,this.z=i+l*d+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=vt(this.x,e.x,t.x),this.y=vt(this.y,e.y,t.y),this.z=vt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=vt(this.x,e,t),this.y=vt(this.y,e,t),this.z=vt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Qc.copy(this).projectOnVector(e),this.sub(Qc)}reflect(e){return this.sub(Qc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Qc=new D,Nd=new _n,mt=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,i,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=i,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],g=n[8],_=i[0],p=i[3],m=i[6],y=i[1],x=i[4],v=i[7],w=i[2],T=i[5],M=i[8];return r[0]=o*_+a*y+l*w,r[3]=o*p+a*x+l*T,r[6]=o*m+a*v+l*M,r[1]=c*_+u*y+d*w,r[4]=c*p+u*x+d*T,r[7]=c*m+u*v+d*M,r[2]=h*_+f*y+g*w,r[5]=h*p+f*x+g*T,r[8]=h*m+f*v+g*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+i*r*c-i*o*l}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*r,f=c*r-o*l,g=t*d+n*h+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=d*_,e[1]=(i*c-u*n)*_,e[2]=(a*n-i*o)*_,e[3]=h*_,e[4]=(u*t-i*l)*_,e[5]=(i*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return Ds("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(eh.makeScale(e,t)),this}rotate(e){return Ds("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(eh.makeRotation(-e)),this}translate(e,t){return Ds("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(eh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},eh=new mt,Ud=new mt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Od=new mt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function a0(){let s={enabled:!0,workingColorSpace:On,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Gt&&(i.r=Vi(i.r),i.g=Vi(i.g),i.b=Vi(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Gt&&(i.r=wr(i.r),i.g=wr(i.g),i.b=wr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ns?Ro:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[On]:{primaries:e,whitePoint:n,transfer:Ro,toXYZ:Ud,fromXYZ:Od,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Kt},outputColorSpaceConfig:{drawingBufferColorSpace:Kt}},[Kt]:{primaries:e,whitePoint:n,transfer:Gt,toXYZ:Ud,fromXYZ:Od,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Kt}}}),s}var Tt=a0();function Vi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function wr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var lr,Sl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{lr===void 0&&(lr=Ir("canvas")),lr.width=e.width,lr.height=e.height;let i=lr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=lr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Ir("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Vi(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Vi(t[n]/255)*255):t[n]=Vi(t[n]);return{data:t,width:e.width,height:e.height}}else return it("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},l0=0,Dr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:l0++}),this.uuid=gi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(th(i[o].image)):r.push(th(i[o]))}else r=th(i);n.url=r}return t||(e.images[this.uuid]=n),n}};function th(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Sl.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(it("Texture: Unable to serialize Texture."),{})}var c0=0,nh=new D,cn=class s extends ri{constructor(e=s.DEFAULT_IMAGE,t=s.DEFAULT_MAPPING,n=ii,i=ii,r=yn,o=oi,a=ai,l=Xn,c=s.DEFAULT_ANISOTROPY,u=ns){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:c0++}),this.uuid=gi(),this.name="",this.source=new Dr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new be(0,0),this.repeat=new be(1,1),this.center=new be(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new mt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(nh).x}get height(){return this.source.getSize(nh).y}get depth(){return this.source.getSize(nh).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){it(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){it(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Jn:e.x=e.x-Math.floor(e.x);break;case ii:e.x=e.x<0?0:1;break;case Cr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Jn:e.y=e.y-Math.floor(e.y);break;case ii:e.y=e.y<0?0:1;break;case Cr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=Qh;cn.DEFAULT_ANISOTROPY=1;var qt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,i=1){this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,v=(f+1)/2,w=(m+1)/2,T=(u+h)/4,M=(d+_)/4,S=(g+p)/4;return x>v&&x>w?x<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(x),i=T/n,r=M/n):v>w?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=T/i,r=S/i):w<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(w),n=M/r,i=S/r),this.set(n,i,r,t),this}let y=Math.sqrt((p-g)*(p-g)+(d-_)*(d-_)+(h-u)*(h-u));return Math.abs(y)<.001&&(y=1),this.x=(p-g)/y,this.y=(d-_)/y,this.z=(h-u)/y,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=vt(this.x,e.x,t.x),this.y=vt(this.y,e.y,t.y),this.z=vt(this.z,e.z,t.z),this.w=vt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=vt(this.x,e,t),this.y=vt(this.y,e,t),this.z=vt(this.z,e,t),this.w=vt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(vt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},El=class extends ri{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:yn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new qt(0,0,e,t),this.scissorTest=!1,this.viewport=new qt(0,0,e,t),this.textures=[];let i=n.count;for(let r=0;r<i;r++)this.textures[r]=new cn({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:yn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let i=Object.assign({},e.textures[t].image);this.textures[t].source=new Dr(i)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},jn=class extends El{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Po=class extends cn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ln,this.minFilter=ln,this.wrapR=ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Tl=class extends cn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ln,this.minFilter=ln,this.wrapR=ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var dt=class s{static{this.prototype.isMatrix4=!0}constructor(e,t,n,i,r,o,a,l,c,u,d,h,f,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,u,d,h,f,g,_,p)}set(e,t,n,i,r,o,a,l,c,u,d,h,f,g,_,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=d,m[14]=h,m[3]=f,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,i=1/cr.setFromMatrixColumn(e,0).length(),r=1/cr.setFromMatrixColumn(e,1).length(),o=1/cr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let h=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=h-_*c,t[9]=-a*l,t[2]=_-h*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let h=l*u,f=l*d,g=c*u,_=c*d;t[0]=h+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+h*a,t[10]=o*l}else if(e.order==="ZXY"){let h=l*u,f=l*d,g=c*u,_=c*d;t[0]=h-_*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let h=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=g*c-f,t[8]=h*c+_,t[1]=l*d,t[5]=_*c+h,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let h=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-h*d,t[8]=g*d+f,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*d+g,t[10]=h-_*d}else if(e.order==="XZY"){let h=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+_,t[5]=o*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*u,t[10]=_*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(h0,e,u0)}lookAt(e,t,n){let i=this.elements;return Zn.subVectors(e,t),Zn.lengthSq()===0&&(Zn.z=1),Zn.normalize(),os.crossVectors(n,Zn),os.lengthSq()===0&&(Math.abs(n.z)===1?Zn.x+=1e-4:Zn.z+=1e-4,Zn.normalize(),os.crossVectors(n,Zn)),os.normalize(),Ba.crossVectors(Zn,os),i[0]=os.x,i[4]=Ba.x,i[8]=Zn.x,i[1]=os.y,i[5]=Ba.y,i[9]=Zn.y,i[2]=os.z,i[6]=Ba.z,i[10]=Zn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],g=n[2],_=n[6],p=n[10],m=n[14],y=n[3],x=n[7],v=n[11],w=n[15],T=i[0],M=i[4],S=i[8],F=i[12],P=i[1],k=i[5],H=i[9],z=i[13],U=i[2],q=i[6],$=i[10],W=i[14],me=i[3],J=i[7],le=i[11],Se=i[15];return r[0]=o*T+a*P+l*U+c*me,r[4]=o*M+a*k+l*q+c*J,r[8]=o*S+a*H+l*$+c*le,r[12]=o*F+a*z+l*W+c*Se,r[1]=u*T+d*P+h*U+f*me,r[5]=u*M+d*k+h*q+f*J,r[9]=u*S+d*H+h*$+f*le,r[13]=u*F+d*z+h*W+f*Se,r[2]=g*T+_*P+p*U+m*me,r[6]=g*M+_*k+p*q+m*J,r[10]=g*S+_*H+p*$+m*le,r[14]=g*F+_*z+p*W+m*Se,r[3]=y*T+x*P+v*U+w*me,r[7]=y*M+x*k+v*q+w*J,r[11]=y*S+x*H+v*$+w*le,r[15]=y*F+x*z+v*W+w*Se,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],g=e[3],_=e[7],p=e[11],m=e[15],y=l*f-c*h,x=a*f-c*d,v=a*h-l*d,w=o*f-c*u,T=o*h-l*u,M=o*d-a*u;return t*(_*y-p*x+m*v)-n*(g*y-p*w+m*T)+i*(g*x-_*w+m*M)-r*(g*v-_*T+p*M)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],i=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10];return t*(o*u-a*c)-n*(r*u-a*l)+i*(r*c-o*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],g=e[12],_=e[13],p=e[14],m=e[15],y=t*a-n*o,x=t*l-i*o,v=t*c-r*o,w=n*l-i*a,T=n*c-r*a,M=i*c-r*l,S=u*_-d*g,F=u*p-h*g,P=u*m-f*g,k=d*p-h*_,H=d*m-f*_,z=h*m-f*p,U=y*z-x*H+v*k+w*P-T*F+M*S;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let q=1/U;return e[0]=(a*z-l*H+c*k)*q,e[1]=(i*H-n*z-r*k)*q,e[2]=(_*M-p*T+m*w)*q,e[3]=(h*T-d*M-f*w)*q,e[4]=(l*P-o*z-c*F)*q,e[5]=(t*z-i*P+r*F)*q,e[6]=(p*v-g*M-m*x)*q,e[7]=(u*M-h*v+f*x)*q,e[8]=(o*H-a*P+c*S)*q,e[9]=(n*P-t*H-r*S)*q,e[10]=(g*T-_*v+m*y)*q,e[11]=(d*v-u*T-f*y)*q,e[12]=(a*F-o*k-l*S)*q,e[13]=(t*k-n*F+i*S)*q,e[14]=(_*x-g*w-p*y)*q,e[15]=(u*w-d*x+h*y)*q,this}scale(e){let t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,u*a+n,u*l-i*o,0,c*l-i*a,u*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){let i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,d=a+a,h=r*c,f=r*u,g=r*d,_=o*u,p=o*d,m=a*d,y=l*c,x=l*u,v=l*d,w=n.x,T=n.y,M=n.z;return i[0]=(1-(_+m))*w,i[1]=(f+v)*w,i[2]=(g-x)*w,i[3]=0,i[4]=(f-v)*T,i[5]=(1-(h+m))*T,i[6]=(p+y)*T,i[7]=0,i[8]=(g+x)*M,i[9]=(p-y)*M,i[10]=(1-(h+_))*M,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){let i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=cr.set(i[0],i[1],i[2]).length(),a=cr.set(i[4],i[5],i[6]).length(),l=cr.set(i[8],i[9],i[10]).length();r<0&&(o=-o),ui.copy(this);let c=1/o,u=1/a,d=1/l;return ui.elements[0]*=c,ui.elements[1]*=c,ui.elements[2]*=c,ui.elements[4]*=u,ui.elements[5]*=u,ui.elements[6]*=u,ui.elements[8]*=d,ui.elements[9]*=d,ui.elements[10]*=d,t.setFromRotationMatrix(ui),n.x=o,n.y=a,n.z=l,this}makePerspective(e,t,n,i,r,o,a=si,l=!1){let c=this.elements,u=2*r/(t-e),d=2*r/(n-i),h=(t+e)/(t-e),f=(n+i)/(n-i),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===si)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Pr)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=si,l=!1){let c=this.elements,u=2/(t-e),d=2/(n-i),h=-(t+e)/(t-e),f=-(n+i)/(n-i),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===si)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Pr)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},cr=new D,ui=new dt,h0=new D(0,0,0),u0=new D(1,1,1),os=new D,Ba=new D,Zn=new D,Fd=new dt,Bd=new _n,Xi=class s{constructor(e=0,t=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],u=i[9],d=i[2],h=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(vt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-vt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(vt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-vt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(vt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-vt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:it("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Fd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Fd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bd.setFromEuler(this),this.setFromQuaternion(Bd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Xi.DEFAULT_ORDER="XYZ";var Nr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},d0=0,kd=new D,hr=new _n,Oi=new dt,ka=new D,co=new D,f0=new D,p0=new _n,zd=new D(1,0,0),Hd=new D(0,1,0),Gd=new D(0,0,1),Vd={type:"added"},m0={type:"removed"},ur={type:"childadded",child:null},ih={type:"childremoved",child:null},Bt=class s extends ri{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:d0++}),this.uuid=gi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let e=new D,t=new Xi,n=new _n,i=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new dt},normalMatrix:{value:new mt}}),this.matrix=new dt,this.matrixWorld=new dt,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Nr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hr.setFromAxisAngle(e,t),this.quaternion.multiply(hr),this}rotateOnWorldAxis(e,t){return hr.setFromAxisAngle(e,t),this.quaternion.premultiply(hr),this}rotateX(e){return this.rotateOnAxis(zd,e)}rotateY(e){return this.rotateOnAxis(Hd,e)}rotateZ(e){return this.rotateOnAxis(Gd,e)}translateOnAxis(e,t){return kd.copy(e).applyQuaternion(this.quaternion),this.position.add(kd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(zd,e)}translateY(e){return this.translateOnAxis(Hd,e)}translateZ(e){return this.translateOnAxis(Gd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Oi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ka.copy(e):ka.set(e,t,n);let i=this.parent;this.updateWorldMatrix(!0,!1),co.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Oi.lookAt(co,ka,this.up):Oi.lookAt(ka,co,this.up),this.quaternion.setFromRotationMatrix(Oi),i&&(Oi.extractRotation(i.matrixWorld),hr.setFromRotationMatrix(Oi),this.quaternion.premultiply(hr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ht("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Vd),ur.child=e,this.dispatchEvent(ur),ur.child=null):ht("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(m0),ih.child=e,this.dispatchEvent(ih),ih.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Oi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Oi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Oi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Vd),ur.child=e,this.dispatchEvent(ur),ur.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(co,e,f0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(co,p0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,i=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*i,r[13]+=n-r[1]*t-r[5]*n-r[9]*i,r[14]+=i-r[2]*t-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let i=e.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Bt.DEFAULT_UP=new D(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var qe=class extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},g0={type:"move"},Ur=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let p=t.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(g0)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new qe;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},pp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},as={h:0,s:0,l:0},za={h:0,s:0,l:0};function sh(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}var nt=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Tt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Tt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Tt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Tt.workingColorSpace){if(e=du(e,1),t=vt(t,0,1),n=vt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=sh(o,r,e+1/3),this.g=sh(o,r,e),this.b=sh(o,r,e-1/3)}return Tt.colorSpaceToWorking(this,i),this}setStyle(e,t=Kt){function n(r){r!==void 0&&parseFloat(r)<1&&it("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:it("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);it("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Kt){let n=pp[e.toLowerCase()];return n!==void 0?this.setHex(n,t):it("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}copyLinearToSRGB(e){return this.r=wr(e.r),this.g=wr(e.g),this.b=wr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Kt){return Tt.workingToColorSpace(In.copy(this),e),Math.round(vt(In.r*255,0,255))*65536+Math.round(vt(In.g*255,0,255))*256+Math.round(vt(In.b*255,0,255))}getHexString(e=Kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Tt.workingColorSpace){Tt.workingToColorSpace(In.copy(this),t);let n=In.r,i=In.g,r=In.b,o=Math.max(n,i,r),a=Math.min(n,i,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case n:l=(i-r)/d+(i<r?6:0);break;case i:l=(r-n)/d+2;break;case r:l=(n-i)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Tt.workingColorSpace){return Tt.workingToColorSpace(In.copy(this),t),e.r=In.r,e.g=In.g,e.b=In.b,e}getStyle(e=Kt){Tt.workingToColorSpace(In.copy(this),e);let t=In.r,n=In.g,i=In.b;return e!==Kt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(as),this.setHSL(as.h+e,as.s+t,as.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(as),e.getHSL(za);let n=Eo(as.h,za.h,t),i=Eo(as.s,za.s,t),r=Eo(as.l,za.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},In=new nt;nt.NAMES=pp;var Io=class s{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new nt(e),this.near=t,this.far=n}clone(){return new s(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Lo=class extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Xi,this.environmentIntensity=1,this.environmentRotation=new Xi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},di=new D,Fi=new D,rh=new D,Bi=new D,dr=new D,fr=new D,Wd=new D,oh=new D,ah=new D,lh=new D,ch=new qt,hh=new qt,uh=new qt,Gi=class s{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),di.subVectors(e,t),i.cross(di);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){di.subVectors(i,t),Fi.subVectors(n,t),rh.subVectors(e,t);let o=di.dot(di),a=di.dot(Fi),l=di.dot(rh),c=Fi.dot(Fi),u=Fi.dot(rh),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(c*l-a*u)*h,g=(o*u-a*l)*h;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Bi)===null?!1:Bi.x>=0&&Bi.y>=0&&Bi.x+Bi.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,Bi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Bi.x),l.addScaledVector(o,Bi.y),l.addScaledVector(a,Bi.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return ch.setScalar(0),hh.setScalar(0),uh.setScalar(0),ch.fromBufferAttribute(e,t),hh.fromBufferAttribute(e,n),uh.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(ch,r.x),o.addScaledVector(hh,r.y),o.addScaledVector(uh,r.z),o}static isFrontFacing(e,t,n,i){return di.subVectors(n,t),Fi.subVectors(e,t),di.cross(Fi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return di.subVectors(this.c,this.b),Fi.subVectors(this.a,this.b),di.cross(Fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return s.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return s.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return s.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return s.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return s.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,i=this.b,r=this.c,o,a;dr.subVectors(i,n),fr.subVectors(r,n),oh.subVectors(e,n);let l=dr.dot(oh),c=fr.dot(oh);if(l<=0&&c<=0)return t.copy(n);ah.subVectors(e,i);let u=dr.dot(ah),d=fr.dot(ah);if(u>=0&&d<=u)return t.copy(i);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return o=l/(l-u),t.copy(n).addScaledVector(dr,o);lh.subVectors(e,r);let f=dr.dot(lh),g=fr.dot(lh);if(g>=0&&f<=g)return t.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(fr,a);let p=u*g-f*d;if(p<=0&&d-u>=0&&f-g>=0)return Wd.subVectors(r,i),a=(d-u)/(d-u+(f-g)),t.copy(i).addScaledVector(Wd,a);let m=1/(p+_+h);return o=_*m,a=h*m,t.copy(n).addScaledVector(dr,o).addScaledVector(fr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Qn=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(fi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(fi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=fi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,fi):fi.fromBufferAttribute(r,o),fi.applyMatrix4(e.matrixWorld),this.expandByPoint(fi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ha.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ha.copy(n.boundingBox)),Ha.applyMatrix4(e.matrixWorld),this.union(Ha)}let i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,fi),fi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ho),Ga.subVectors(this.max,ho),pr.subVectors(e.a,ho),mr.subVectors(e.b,ho),gr.subVectors(e.c,ho),ls.subVectors(mr,pr),cs.subVectors(gr,mr),As.subVectors(pr,gr);let t=[0,-ls.z,ls.y,0,-cs.z,cs.y,0,-As.z,As.y,ls.z,0,-ls.x,cs.z,0,-cs.x,As.z,0,-As.x,-ls.y,ls.x,0,-cs.y,cs.x,0,-As.y,As.x,0];return!dh(t,pr,mr,gr,Ga)||(t=[1,0,0,0,1,0,0,0,1],!dh(t,pr,mr,gr,Ga))?!1:(Va.crossVectors(ls,cs),t=[Va.x,Va.y,Va.z],dh(t,pr,mr,gr,Ga))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,fi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(fi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ki),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ki=[new D,new D,new D,new D,new D,new D,new D,new D],fi=new D,Ha=new Qn,pr=new D,mr=new D,gr=new D,ls=new D,cs=new D,As=new D,ho=new D,Ga=new D,Va=new D,Rs=new D;function dh(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Rs.fromArray(s,r);let a=i.x*Math.abs(Rs.x)+i.y*Math.abs(Rs.y)+i.z*Math.abs(Rs.z),l=e.dot(Rs),c=t.dot(Rs),u=n.dot(Rs);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var un=new D,Wa=new be,_0=0,An=class extends ri{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=hu,this.updateRanges=[],this.gpuType=ti,this.version=0,this._normalizationScale=e!==void 0?Dc(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Wa.fromBufferAttribute(this,t),Wa.applyMatrix3(e),this.setXY(t,Wa.x,Wa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix3(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):pu(e,this.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):mu(e,this.array)}};var Do=class extends An{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var No=class extends An{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var wt=class extends An{constructor(e,t,n){super(new Float32Array(e),t,n)}},y0=new Qn,uo=new D,fh=new D,Vn=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):y0.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;uo.subVectors(e,this.center);let t=uo.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(uo,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(uo.copy(e.center).add(fh)),this.expandByPoint(uo.copy(e.center).sub(fh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},x0=0,ni=new dt,ph=new Bt,_r=new D,$n=new Qn,fo=new Qn,En=new D,en=class s extends ri{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:x0++}),this.uuid=gi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Wm(e)?No:Do)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new mt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ni.makeRotationFromQuaternion(e),this.applyMatrix4(ni),this}rotateX(e){return ni.makeRotationX(e),this.applyMatrix4(ni),this}rotateY(e){return ni.makeRotationY(e),this.applyMatrix4(ni),this}rotateZ(e){return ni.makeRotationZ(e),this.applyMatrix4(ni),this}translate(e,t,n){return ni.makeTranslation(e,t,n),this.applyMatrix4(ni),this}scale(e,t,n){return ni.makeScale(e,t,n),this.applyMatrix4(ni),this}lookAt(e){return ph.lookAt(e),ph.updateMatrix(),this.applyMatrix4(ph.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(_r).negate(),this.translate(_r.x,_r.y,_r.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let i=0,r=e.length;i<r;i++){let o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new wt(n,3))}else{let n=Math.min(e.length,t.count);for(let i=0;i<n;i++){let r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&it("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){let r=t[n];$n.setFromBufferAttribute(r),this.morphTargetsRelative?(En.addVectors(this.boundingBox.min,$n.min),this.boundingBox.expandByPoint(En),En.addVectors(this.boundingBox.max,$n.max),this.boundingBox.expandByPoint(En)):(this.boundingBox.expandByPoint($n.min),this.boundingBox.expandByPoint($n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let n=this.boundingSphere.center;if($n.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];fo.setFromBufferAttribute(a),this.morphTargetsRelative?(En.addVectors($n.min,fo.min),$n.expandByPoint(En),En.addVectors($n.max,fo.max),$n.expandByPoint(En)):($n.expandByPoint(fo.min),$n.expandByPoint(fo.max))}$n.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)En.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(En));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)En.fromBufferAttribute(a,c),l&&(_r.fromBufferAttribute(e,c),En.add(_r)),i=Math.max(i,n.distanceToSquared(En))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,i=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new An(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let F=0;F<n.count;F++)a[F]=new D,l[F]=new D;let u=new D,d=new D,h=new D,f=new be,g=new be,_=new be,p=new D,m=new D;function y(F,P,k){c[F]=c[P]=c[k]=1,u.fromBufferAttribute(n,F),d.fromBufferAttribute(n,P),h.fromBufferAttribute(n,k),f.fromBufferAttribute(r,F),g.fromBufferAttribute(r,P),_.fromBufferAttribute(r,k),d.sub(u),h.sub(u),g.sub(f),_.sub(f);let H=1/(g.x*_.y-_.x*g.y);isFinite(H)&&(p.copy(d).multiplyScalar(_.y).addScaledVector(h,-g.y).multiplyScalar(H),m.copy(h).multiplyScalar(g.x).addScaledVector(d,-_.x).multiplyScalar(H),a[F].add(p),a[P].add(p),a[k].add(p),l[F].add(m),l[P].add(m),l[k].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let F=0,P=x.length;F<P;++F){let k=x[F],H=k.start,z=k.count;for(let U=H,q=H+z;U<q;U+=3)y(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let v=new D,w=new D,T=new D,M=new D;function S(F){T.fromBufferAttribute(i,F),M.copy(T);let P=a[F];v.copy(P),v.sub(T.multiplyScalar(T.dot(P))).normalize(),w.crossVectors(M,P);let H=w.dot(l[F])<0?-1:1;o.setXYZW(F,v.x,v.y,v.z,H)}for(let F=0,P=n.count;F<P;++F)c[F]&&S(F);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new An(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let i=new D,r=new D,o=new D,a=new D,l=new D,c=new D,u=new D,d=new D;if(e)for(let h=0,f=e.count;h<f;h+=3){let g=e.getX(h+0),_=e.getX(h+1),p=e.getX(h+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,p),u.subVectors(o,r),d.subVectors(i,r),u.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)i.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),d.subVectors(i,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)En.fromBufferAttribute(e,t),En.normalize(),e.setXYZ(t,En.x,En.y,En.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u),f=0,g=0;for(let _=0,p=l.length;_<p;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let m=0;m<u;m++)h[g++]=c[f++]}return new An(h,u,d)}if(this.index===null)return it("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new s,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,d=c.length;u<d;u++){let h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(i[l]=u,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let i=e.attributes;for(let c in i){let u=i[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Fs=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=hu,this.updateRanges=[],this.version=0,this.uuid=gi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Xd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=Xd(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function Xd(s){return s.buffer._uuid===void 0&&(s.buffer._uuid=gi()),s.byteOffset===0&&s.byteLength===s.buffer.byteLength?s.buffer._uuid:s.buffer._uuid+":"+s.byteOffset+":"+s.byteLength}var Nn=new D,ds=class s{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i,this._normalizationScale=e!==void 0?Dc(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Nn.fromBufferAttribute(this,t),Nn.applyMatrix4(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Nn.fromBufferAttribute(this,t),Nn.applyNormalMatrix(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Nn.fromBufferAttribute(this,t),Nn.transformDirection(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Co("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new An(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new s(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Co("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):pu(e,this.data.array)}_normalize(e){let t=this._normalizationScale;return t!==void 0?Math.round(e*t):mu(e,this.data.array)}},mh=new D,v0=new D,M0=new mt,Un=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let i=mh.subVectors(n,t).cross(v0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let i=e.delta(mh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(i,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||M0.getNormalMatrix(e),i=this.coplanarPoint(mh).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},b0=0,Fn=class extends ri{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:b0++}),this.uuid=gi(),this.name="",this.type="Material",this.blending=Ms,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wh,this.blendDst=Xh,this.blendEquation=js,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new nt(0,0,0),this.blendAlpha=0,this.depthFunc=Rr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=sp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ml,this.stencilZFail=ml,this.stencilZPass=ml,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){it(`Material: parameter '${t}' has value of undefined.`);continue}let i=this[t];if(i===void 0){it(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new nt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new be().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new be().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},fs=class extends Fn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new nt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},yr,po=new D,xr=new D,vr=new D,Mr=new be,mo=new be,mp=new dt,Xa=new D,go=new D,qa=new D,qd=new be,gh=new be,Yd=new be,Bs=class extends Bt{constructor(e=new fs){if(super(),this.isSprite=!0,this.type="Sprite",yr===void 0){yr=new en;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Fs(t,5);yr.setIndex([0,1,2,0,2,3]),yr.setAttribute("position",new ds(n,3,0,!1)),yr.setAttribute("uv",new ds(n,2,3,!1))}this.geometry=yr,this.material=e,this.center=new be(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&ht('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),xr.setFromMatrixScale(this.matrixWorld),mp.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),vr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&xr.multiplyScalar(-vr.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;Ya(Xa.set(-.5,-.5,0),vr,o,xr,i,r),Ya(go.set(.5,-.5,0),vr,o,xr,i,r),Ya(qa.set(.5,.5,0),vr,o,xr,i,r),qd.set(0,0),gh.set(1,0),Yd.set(1,1);let a=e.ray.intersectTriangle(Xa,go,qa,!1,po);if(a===null&&(Ya(go.set(-.5,.5,0),vr,o,xr,i,r),gh.set(0,1),a=e.ray.intersectTriangle(Xa,qa,go,!1,po),a===null))return;let l=e.ray.origin.distanceTo(po);l<e.near||l>e.far||t.push({distance:l,point:po.clone(),uv:Gi.getInterpolation(po,Xa,go,qa,qd,gh,Yd,new be),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function Ya(s,e,t,n,i,r){Mr.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(mo.x=r*Mr.x-i*Mr.y,mo.y=i*Mr.x+r*Mr.y):mo.copy(Mr),s.copy(e),s.x+=mo.x,s.y+=mo.y,s.applyMatrix4(mp)}var zi=new D,_h=new D,Ka=new D,Za=new D,Mi=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,zi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=zi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(zi.copy(this.origin).addScaledVector(this.direction,t),zi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){_h.copy(e).add(t).multiplyScalar(.5),Ka.copy(t).sub(e).normalize(),Za.copy(this.origin).sub(_h);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Ka),a=Za.dot(this.direction),l=-Za.dot(Ka),c=Za.lengthSq(),u=Math.abs(1-o*o),d,h,f,g;if(u>0)if(d=o*l-a,h=o*a-l,g=r*u,d>=0)if(h>=-g)if(h<=g){let _=1/u;d*=_,h*=_,f=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-o*r+a)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(o*r+a)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=o>0?-r:r,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(_h).addScaledVector(Ka,h),f}intersectSphere(e,t){if(e.radius<0)return null;zi.subVectors(e.center,this.origin);let n=zi.dot(this.direction),i=zi.dot(zi)-n*n,r=e.radius*e.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,i=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,i=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,zi)!==null}intersectTriangle(e,t,n,i,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,d=e.x-o.x,h=e.y-o.y,f=e.z-o.z,g=t.x-o.x,_=t.y-o.y,p=t.z-o.z,m=n.x-o.x,y=n.y-o.y,x=n.z-o.z,v=Math.abs(l),w=Math.abs(c),T=Math.abs(u),M,S,F,P,k,H,z,U,q,$,W,me;if(v>=w&&v>=T?(F=l,H=d,q=g,me=m,l>=0?(M=c,S=u,P=h,k=f,z=_,U=p,$=y,W=x):(M=u,S=c,P=f,k=h,z=p,U=_,$=x,W=y)):w>=T?(F=c,H=h,q=_,me=y,c>=0?(M=u,S=l,P=f,k=d,z=p,U=g,$=x,W=m):(M=l,S=u,P=d,k=f,z=g,U=p,$=m,W=x)):(F=u,H=f,q=p,me=x,u>=0?(M=l,S=c,P=d,k=h,z=g,U=_,$=m,W=y):(M=c,S=l,P=h,k=d,z=_,U=g,$=y,W=m)),F===0)return null;let J=M/F,le=S/F,Se=1/F,Le=P-J*H,et=k-le*H,V=z-J*q,he=U-le*q,Ee=$-J*me,Fe=W-le*me,_e=Ee*he-Fe*V,ce=Le*Fe-et*Ee,Ie=V*et-he*Le;if(i){if(_e<0||ce<0||Ie<0)return null}else if((_e<0||ce<0||Ie<0)&&(_e>0||ce>0||Ie>0))return null;let ve=_e+ce+Ie;if(ve===0)return null;let Ne=Se*(_e*H+ce*q+Ie*me);return(ve>0?Ne<0:Ne>0)?null:this.at(Ne/ve,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},dn=class extends Fn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xi,this.combine=qh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Kd=new dt,Cs=new Mi,$a=new Vn,Zd=new D,Ja=new D,ja=new D,Qa=new D,yh=new D,el=new D,$d=new D,tl=new D,Jt=class extends Bt{constructor(e=new en,t=new dn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);let a=this.morphTargetInfluences;if(r&&a){el.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],d=r[l];u!==0&&(yh.fromBufferAttribute(d,e),o?el.addScaledVector(yh,u):el.addScaledVector(yh.sub(t),u))}t.add(el)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),$a.copy(n.boundingSphere),$a.applyMatrix4(r),Cs.copy(e.ray).recast(e.near),!($a.containsPoint(Cs.origin)===!1&&(Cs.intersectSphere($a,Zd)===null||Cs.origin.distanceToSquared(Zd)>(e.far-e.near)**2))&&(Kd.copy(r).invert(),Cs.copy(e.ray).applyMatrix4(Kd),!(n.boundingBox!==null&&Cs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Cs)))}_computeIntersections(e,t,n){let i,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),x=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let v=y,w=x;v<w;v+=3){let T=a.getX(v),M=a.getX(v+1),S=a.getX(v+2);i=nl(this,m,e,n,c,u,d,T,M,S),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let y=a.getX(p),x=a.getX(p+1),v=a.getX(p+2);i=nl(this,o,e,n,c,u,d,y,x,v),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=h.length;g<_;g++){let p=h[g],m=o[p.materialIndex],y=Math.max(p.start,f.start),x=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let v=y,w=x;v<w;v+=3){let T=v,M=v+1,S=v+2;i=nl(this,m,e,n,c,u,d,T,M,S),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let y=p,x=p+1,v=p+2;i=nl(this,o,e,n,c,u,d,y,x,v),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}};function S0(s,e,t,n,i,r,o,a){let l;if(e.side===zn?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===Ri,a),l===null)return null;tl.copy(a),tl.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(tl);return c<t.near||c>t.far?null:{distance:c,point:tl.clone(),object:s}}function nl(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,Ja),s.getVertexPosition(l,ja),s.getVertexPosition(c,Qa);let u=S0(s,e,t,n,Ja,ja,Qa,$d);if(u){let d=new D;Gi.getBarycoord($d,Ja,ja,Qa,d),i&&(u.uv=Gi.getInterpolatedAttribute(i,a,l,c,d,new be)),r&&(u.uv1=Gi.getInterpolatedAttribute(r,a,l,c,d,new be)),o&&(u.normal=Gi.getInterpolatedAttribute(o,a,l,c,d,new D),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new D,materialIndex:0};Gi.getNormal(Ja,ja,Qa,h.normal),u.face=h,u.barycoord=d}return u}var _o=new qt,Jd=new qt,jd=new qt,E0=new qt,Qd=new dt,il=new D,xh=new Vn,ef=new dt,vh=new Mi,Uo=class extends Jt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Ah,this.bindMatrix=new dt,this.bindMatrixInverse=new dt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Qn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,il),this.boundingBox.expandByPoint(il)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Vn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,il),this.boundingSphere.expandByPoint(il)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){let n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xh.copy(this.boundingSphere),xh.applyMatrix4(i),e.ray.intersectsSphere(xh)!==!1&&(ef.copy(i).invert(),vh.copy(e.ray).applyMatrix4(ef),!(this.boundingBox!==null&&vh.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,vh)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new qt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Ah?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===jf?this.bindMatrixInverse.copy(this.bindMatrix).invert():it("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,i=this.geometry;Jd.fromBufferAttribute(i.attributes.skinIndex,e),jd.fromBufferAttribute(i.attributes.skinWeight,e),t.isVector4?(_o.copy(t),t.set(0,0,0,0)):(_o.set(t.x,t.y,t.z,1),t.set(0,0,0)),_o.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=jd.getComponent(r);if(o!==0){let a=Jd.getComponent(r);Qd.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(E0.copy(_o).applyMatrix4(Qd),o)}}return t.isVector4&&(t.w=_o.w),t.applyMatrix4(this.bindMatrixInverse)}},Or=class extends Bt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Fr=class extends cn{constructor(e=null,t=1,n=1,i,r,o,a,l,c=ln,u=ln,d,h){super(null,o,a,l,c,u,i,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},tf=new dt,T0=new dt,Oo=class s{constructor(e=[],t=[]){this.uuid=gi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){it("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new dt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new dt;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:T0;tf.multiplyMatrices(a,t[r]),tf.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Fr(t,e,e,ai,ti);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){let r=e.bones[n],o=t[r];o===void 0&&(it("Skeleton: No bone found with UUID:",r),o=new Or),this.bones.push(o),this.boneInverses.push(new dt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){let o=t[i];e.bones.push(o.uuid);let a=n[i];e.boneInverses.push(a.toArray())}return e}},qi=class extends An{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},br=new dt,nf=new dt,sl=[],sf=new Qn,w0=new dt,yo=new Jt,xo=new Vn,Yi=class extends Jt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new qi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,w0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,br),sf.copy(e.boundingBox).applyMatrix4(br),this.boundingBox.union(sf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,br),xo.copy(e.boundingSphere).applyMatrix4(br),this.boundingSphere.union(xo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){let n=this.matrixWorld,i=this.count;if(yo.geometry=this.geometry,yo.material=this.material,yo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xo.copy(this.boundingSphere),xo.applyMatrix4(n),e.ray.intersectsSphere(xo)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,br),nf.multiplyMatrices(n,br),yo.matrixWorld=nf,yo.raycast(e,sl);for(let o=0,a=sl.length;o<a;o++){let l=sl[o];l.instanceId=r,l.object=this,t.push(l)}sl.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new qi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Fr(new Float32Array(i*this.count),i,this.count,$l,ti));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ps=new Vn,A0=new be(.5,.5),rl=new D,ps=class{constructor(e=new Un,t=new Un,n=new Un,i=new Un,r=new Un,o=new Un){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=si,n=!1){let i=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],g=r[8],_=r[9],p=r[10],m=r[11],y=r[12],x=r[13],v=r[14],w=r[15];if(i[0].setComponents(c-o,f-u,m-g,w-y).normalize(),i[1].setComponents(c+o,f+u,m+g,w+y).normalize(),i[2].setComponents(c+a,f+d,m+_,w+x).normalize(),i[3].setComponents(c-a,f-d,m-_,w-x).normalize(),n)i[4].setComponents(l,h,p,v).normalize(),i[5].setComponents(c-l,f-h,m-p,w-v).normalize();else if(i[4].setComponents(c-l,f-h,m-p,w-v).normalize(),t===si)i[5].setComponents(c+l,f+h,m+p,w+v).normalize();else if(t===Pr)i[5].setComponents(l,h,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ps.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ps.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ps)}intersectsSprite(e){Ps.center.set(0,0,0);let t=A0.distanceTo(e.center);return Ps.radius=.7071067811865476+t,Ps.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ps)}intersectsSphere(e){let t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let i=t[n];if(rl.x=i.normal.x>0?e.max.x:e.min.x,rl.y=i.normal.y>0?e.max.y:e.min.y,rl.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(rl)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},rf=new dt,wl=class s{constructor(){this.coordinateSystem=si,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let i=0;i<t.length;i++){let r=t[i];rf.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[i]===void 0&&(n[i]=new ps),n[i].setFromProjectionMatrix(rf,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let i=0;i<e._count;i++)t[i]===void 0&&(t[i]=new ps),t[i].copy(n[i]);return this._count=e._count,this}clone(){return new s().copy(this)}};var Br=class extends Fn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new nt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Al=new D,Rl=new D,of=new dt,vo=new Mi,ol=new Vn,Mh=new D,af=new D,ks=class extends Bt{constructor(e=new en,t=new Br){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Al.fromBufferAttribute(t,i-1),Rl.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Al.distanceTo(Rl);e.setAttribute("lineDistance",new wt(n,1))}else it("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ol.copy(n.boundingSphere),ol.applyMatrix4(i),ol.radius+=r,e.ray.intersectsSphere(ol)===!1)return;of.copy(i).invert(),vo.copy(e.ray).applyMatrix4(of);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,p=g-1;_<p;_+=c){let m=u.getX(_),y=u.getX(_+1),x=al(this,e,vo,l,m,y,_);x&&t.push(x)}if(this.isLineLoop){let _=u.getX(g-1),p=u.getX(f),m=al(this,e,vo,l,_,p,g-1);m&&t.push(m)}}else{let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,p=g-1;_<p;_+=c){let m=al(this,e,vo,l,_,_+1,_);m&&t.push(m)}if(this.isLineLoop){let _=al(this,e,vo,l,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function al(s,e,t,n,i,r,o){let a=s.geometry.attributes.position;if(Al.fromBufferAttribute(a,i),Rl.fromBufferAttribute(a,r),t.distanceSqToSegment(Al,Rl,Mh,af)>n)return;Mh.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Mh);if(!(c<e.near||c>e.far))return{distance:c,point:af.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var lf=new D,cf=new D,Fo=class extends ks{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)lf.fromBufferAttribute(t,i),cf.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+lf.distanceTo(cf);e.setAttribute("lineDistance",new wt(n,1))}else it("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Bo=class extends ks{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},kr=class extends Fn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new nt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},hf=new dt,Ch=new Mi,ll=new Vn,cl=new D,ko=class extends Bt{constructor(e=new en,t=new kr){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ll.copy(n.boundingSphere),ll.applyMatrix4(i),ll.radius+=r,e.ray.intersectsSphere(ll)===!1)return;hf.copy(i).invert(),Ch.copy(e.ray).applyMatrix4(hf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){let h=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=h,_=f;g<_;g++){let p=c.getX(g);cl.fromBufferAttribute(d,p),uf(cl,p,l,i,e,t,this)}}else{let h=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=h,_=f;g<_;g++)cl.fromBufferAttribute(d,g),uf(cl,g,l,i,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function uf(s,e,t,n,i,r,o){let a=Ch.distanceSqToPoint(s);if(a<t){let l=new D;Ch.closestPointToPoint(s,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var zo=class extends cn{constructor(e=[],t=Qs,n,i,r,o,a,l,c,u){super(e,t,n,i,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ki=class extends cn{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Zi=class extends cn{constructor(e,t,n=pi,i,r,o,a=ln,l=ln,c,u=Wi,d=1){if(u!==Wi&&u!==ts)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,i,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Dr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ho=class extends Zi{constructor(e,t=pi,n=Qs,i,r,o=ln,a=ln,l,c=Wi){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Go=class extends cn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},bi=class s extends en{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],d=[],h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new wt(c,3)),this.setAttribute("normal",new wt(u,3)),this.setAttribute("uv",new wt(d,2));function g(_,p,m,y,x,v,w,T,M,S,F){let P=v/M,k=w/S,H=v/2,z=w/2,U=T/2,q=M+1,$=S+1,W=0,me=0,J=new D;for(let le=0;le<$;le++){let Se=le*k-z;for(let Le=0;Le<q;Le++){let et=Le*P-H;J[_]=et*y,J[p]=Se*x,J[m]=U,c.push(J.x,J.y,J.z),J[_]=0,J[p]=0,J[m]=T>0?1:-1,u.push(J.x,J.y,J.z),d.push(Le/M),d.push(1-le/S),W+=1}}for(let le=0;le<S;le++)for(let Se=0;Se<M;Se++){let Le=h+Se+q*le,et=h+Se+q*(le+1),V=h+(Se+1)+q*(le+1),he=h+(Se+1)+q*le;l.push(Le,et,he),l.push(et,V,he),me+=6}a.addGroup(f,me,F),f+=me,h+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var zr=class s extends en{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new D,u=new be;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,h=3;d<=t;d++,h+=3){let f=n+d/t*i;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,l.push(u.x,u.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new wt(o,3)),this.setAttribute("normal",new wt(a,3)),this.setAttribute("uv",new wt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Si=class s extends en{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let u=[],d=[],h=[],f=[],g=0,_=[],p=n/2,m=0;y(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new wt(d,3)),this.setAttribute("normal",new wt(h,3)),this.setAttribute("uv",new wt(f,2));function y(){let v=new D,w=new D,T=0,M=(t-e)/n;for(let S=0;S<=r;S++){let F=[],P=S/r,k=P*(t-e)+e;for(let H=0;H<=i;H++){let z=H/i,U=z*l+a,q=Math.sin(U),$=Math.cos(U);w.x=k*q,w.y=-P*n+p,w.z=k*$,d.push(w.x,w.y,w.z),v.set(q,M,$).normalize(),h.push(v.x,v.y,v.z),f.push(z,1-P),F.push(g++)}_.push(F)}for(let S=0;S<i;S++)for(let F=0;F<r;F++){let P=_[F][S],k=_[F+1][S],H=_[F+1][S+1],z=_[F][S+1];(e>0||F!==0)&&(u.push(P,k,z),T+=3),(t>0||F!==r-1)&&(u.push(k,H,z),T+=3)}c.addGroup(m,T,0),m+=T}function x(v){let w=g,T=new be,M=new D,S=0,F=v===!0?e:t,P=v===!0?1:-1;for(let H=1;H<=i;H++)d.push(0,p*P,0),h.push(0,P,0),f.push(.5,.5),g++;let k=g;for(let H=0;H<=i;H++){let U=H/i*l+a,q=Math.cos(U),$=Math.sin(U);M.x=F*$,M.y=p*P,M.z=F*q,d.push(M.x,M.y,M.z),h.push(0,P,0),T.x=q*.5+.5,T.y=$*.5*P+.5,f.push(T.x,T.y),g++}for(let H=0;H<i;H++){let z=w+H,U=k+H;v===!0?u.push(U,U+1,z):u.push(U+1,U,z),S+=3}c.addGroup(m,S,v===!0?1:2),m+=S}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},zs=class s extends Si{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new s(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Vo=class s extends en{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};let r=[],o=[];a(i),c(n),u(),this.setAttribute("position",new wt(r,3)),this.setAttribute("normal",new wt(r.slice(),3)),this.setAttribute("uv",new wt(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let x=new D,v=new D,w=new D;for(let T=0;T<t.length;T+=3)f(t[T+0],x),f(t[T+1],v),f(t[T+2],w),l(x,v,w,y)}function l(y,x,v,w){let T=w+1,M=[];for(let S=0;S<=T;S++){M[S]=[];let F=y.clone().lerp(v,S/T),P=x.clone().lerp(v,S/T),k=T-S;for(let H=0;H<=k;H++)H===0&&S===T?M[S][H]=F:M[S][H]=F.clone().lerp(P,H/k)}for(let S=0;S<T;S++)for(let F=0;F<2*(T-S)-1;F++){let P=Math.floor(F/2);F%2===0?(h(M[S][P+1]),h(M[S+1][P]),h(M[S][P])):(h(M[S][P+1]),h(M[S+1][P+1]),h(M[S+1][P]))}}function c(y){let x=new D;for(let v=0;v<r.length;v+=3)x.x=r[v+0],x.y=r[v+1],x.z=r[v+2],x.normalize().multiplyScalar(y),r[v+0]=x.x,r[v+1]=x.y,r[v+2]=x.z}function u(){let y=new D;for(let x=0;x<r.length;x+=3){y.x=r[x+0],y.y=r[x+1],y.z=r[x+2];let v=p(y)/2/Math.PI+.5,w=m(y)/Math.PI+.5;o.push(v,1-w)}g(),d()}function d(){for(let y=0;y<o.length;y+=6){let x=o[y+0],v=o[y+2],w=o[y+4],T=Math.max(x,v,w),M=Math.min(x,v,w);T>.9&&M<.1&&(x<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),w<.2&&(o[y+4]+=1))}}function h(y){r.push(y.x,y.y,y.z)}function f(y,x){let v=y*3;x.x=e[v+0],x.y=e[v+1],x.z=e[v+2]}function g(){let y=new D,x=new D,v=new D,w=new D,T=new be,M=new be,S=new be;for(let F=0,P=0;F<r.length;F+=9,P+=6){y.set(r[F+0],r[F+1],r[F+2]),x.set(r[F+3],r[F+4],r[F+5]),v.set(r[F+6],r[F+7],r[F+8]),T.set(o[P+0],o[P+1]),M.set(o[P+2],o[P+3]),S.set(o[P+4],o[P+5]),w.copy(y).add(x).add(v).divideScalar(3);let k=p(w);_(T,P+0,y,k),_(M,P+2,x,k),_(S,P+4,v,k)}}function _(y,x,v,w){w<0&&y.x===1&&(o[x]=y.x-1),v.x===0&&v.z===0&&(o[x]=w/2/Math.PI+.5)}function p(y){return Math.atan2(y.z,-y.x)}function m(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.vertices,e.indices,e.radius,e.detail)}};var ei=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){it("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),i=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);let u=n[i],h=n[i+1]-u,f=(o-u)/h;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),l=t||(o.isVector2?new be:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new D,i=[],r=[],o=[],a=new D,l=new dt;for(let f=0;f<=e;f++){let g=f/e;i[f]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE,u=Math.abs(i[0].x),d=Math.abs(i[0].y),h=Math.abs(i[0].z);u<=c&&(c=u,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),h<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(vt(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(vt(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},Hr=class extends ei{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new be){let n=t,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),h=l-this.aX,f=c-this.aY;l=h*u-f*d+this.aX,c=h*d+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Cl=class extends Hr{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function gu(){let s=0,e=0,t=0,n=0;function i(r,o,a,l){s=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,d){let h=(o-r)/c-(a-r)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+d)+(l-a)/d;h*=u,f*=u,i(o,a,h,f)},calc:function(r){let o=r*r,a=o*r;return s+e*r+t*o+n*a}}}var df=new D,ff=new D,bh=new gu,Sh=new gu,Eh=new gu,Gr=class extends ei{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new D){let n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=i[(a-1)%r]:(ff.subVectors(i[0],i[1]).add(i[0]),c=ff);let d=i[a%r],h=i[(a+1)%r];if(this.closed||a+2<r?u=i[(a+2)%r]:(df.subVectors(i[r-1],i[r-2]).add(i[r-1]),u=df),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(d),f),_=Math.pow(d.distanceToSquared(h),f),p=Math.pow(h.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),p<1e-4&&(p=_),bh.initNonuniformCatmullRom(c.x,d.x,h.x,u.x,g,_,p),Sh.initNonuniformCatmullRom(c.y,d.y,h.y,u.y,g,_,p),Eh.initNonuniformCatmullRom(c.z,d.z,h.z,u.z,g,_,p)}else this.curveType==="catmullrom"&&(bh.initCatmullRom(c.x,d.x,h.x,u.x,this.tension),Sh.initCatmullRom(c.y,d.y,h.y,u.y,this.tension),Eh.initCatmullRom(c.z,d.z,h.z,u.z,this.tension));return n.set(bh.calc(l),Sh.calc(l),Eh.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new D().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function pf(s,e,t,n,i){let r=(n-e)*.5,o=(i-t)*.5,a=s*s,l=s*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*s+t}function R0(s,e){let t=1-s;return t*t*e}function C0(s,e){return 2*(1-s)*s*e}function P0(s,e){return s*s*e}function To(s,e,t,n){return R0(s,e)+C0(s,t)+P0(s,n)}function I0(s,e){let t=1-s;return t*t*t*e}function L0(s,e){let t=1-s;return 3*t*t*s*e}function D0(s,e){return 3*(1-s)*s*s*e}function N0(s,e){return s*s*s*e}function wo(s,e,t,n,i){return I0(s,e)+L0(s,t)+D0(s,n)+N0(s,i)}var Wo=class extends ei{constructor(e=new be,t=new be,n=new be,i=new be){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new be){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(wo(e,i.x,r.x,o.x,a.x),wo(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Pl=class extends ei{constructor(e=new D,t=new D,n=new D,i=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new D){let n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(wo(e,i.x,r.x,o.x,a.x),wo(e,i.y,r.y,o.y,a.y),wo(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Xo=class extends ei{constructor(e=new be,t=new be){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new be){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new be){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Il=class extends ei{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},qo=class extends ei{constructor(e=new be,t=new be,n=new be){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new be){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(To(e,i.x,r.x,o.x),To(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Hs=class extends ei{constructor(e=new D,t=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new D){let n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(To(e,i.x,r.x,o.x),To(e,i.y,r.y,o.y),To(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Yo=class extends ei{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new be){let n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],u=i[o>i.length-2?i.length-1:o+1],d=i[o>i.length-3?i.length-1:o+2];return n.set(pf(a,l.x,c.x,u.x,d.x),pf(a,l.y,c.y,u.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let i=e.points[t];this.points.push(new be().fromArray(i))}return this}},Ph=Object.freeze({__proto__:null,ArcCurve:Cl,CatmullRomCurve3:Gr,CubicBezierCurve:Wo,CubicBezierCurve3:Pl,EllipseCurve:Hr,LineCurve:Xo,LineCurve3:Il,QuadraticBezierCurve:qo,QuadraticBezierCurve3:Hs,SplineCurve:Yo}),Ll=class extends ei{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ph[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let i=e.curves[t];this.curves.push(new Ph[i.type]().fromJSON(i))}return this.cacheLengths=null,this}},ms=class extends Ll{constructor(e){super(),this.type="Path",this.currentPoint=new be,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Xo(this.currentPoint.clone(),new be(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){let r=new qo(this.currentPoint.clone(),new be(e,t),new be(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){let a=new Wo(this.currentPoint.clone(),new be(e,t),new be(n,i),new be(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Yo(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,i,r,o,a,l),this}absellipse(e,t,n,i,r,o,a,l){let c=new Hr(e,t,n,i,r,o,a,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Gs=class extends ms{constructor(e){super(e),this.uuid=gi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let i=e.holes[t];this.holes.push(new ms().fromJSON(i))}return this}};function U0(s,e,t=2){let n=e&&e.length,i=n?e[0]*t:s.length,r=gp(s,0,i,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=z0(s,e,r,t)),s.length>80*t){a=s[0],l=s[1];let u=a,d=l;for(let h=t;h<i;h+=t){let f=s[h],g=s[h+1];f<a&&(a=f),g<l&&(l=g),f>u&&(u=f),g>d&&(d=g)}c=Math.max(u-a,d-l),c=c!==0?32767/c:0}return Ko(r,o,t,a,l,c,0),o}function gp(s,e,t,n,i){let r;if(i===J0(s,e,t,n)>0)for(let o=e;o<t;o+=n)r=mf(o/n|0,s[o],s[o+1],r);else for(let o=t-n;o>=e;o-=n)r=mf(o/n|0,s[o],s[o+1],r);return r&&Vr(r,r.next)&&($o(r),r=r.next),r}function Vs(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(Vr(t,t.next)||Qt(t.prev,t,t.next)===0)){if($o(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Ko(s,e,t,n,i,r,o){if(!s)return;!o&&r&&X0(s,n,i,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?F0(s,n,i,r):O0(s)){e.push(l.i,s.i,c.i),$o(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=B0(Vs(s),e),Ko(s,e,t,n,i,r,2)):o===2&&k0(s,e,t,n,i,r):Ko(Vs(s),e,t,n,i,r,1);break}}}function O0(s){let e=s.prev,t=s,n=s.next;if(Qt(e,t,n)>=0)return!1;let i=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=Math.min(i,r,o),d=Math.min(a,l,c),h=Math.max(i,r,o),f=Math.max(a,l,c),g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=h&&g.y>=d&&g.y<=f&&Mo(i,a,r,l,o,c,g.x,g.y)&&Qt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function F0(s,e,t,n){let i=s.prev,r=s,o=s.next;if(Qt(i,r,o)>=0)return!1;let a=i.x,l=r.x,c=o.x,u=i.y,d=r.y,h=o.y,f=Math.min(a,l,c),g=Math.min(u,d,h),_=Math.max(a,l,c),p=Math.max(u,d,h),m=Ih(f,g,e,t,n),y=Ih(_,p,e,t,n),x=s.prevZ,v=s.nextZ;for(;x&&x.z>=m&&v&&v.z<=y;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Mo(a,u,l,d,c,h,x.x,x.y)&&Qt(x.prev,x,x.next)>=0||(x=x.prevZ,v.x>=f&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Mo(a,u,l,d,c,h,v.x,v.y)&&Qt(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;x&&x.z>=m;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=p&&x!==i&&x!==o&&Mo(a,u,l,d,c,h,x.x,x.y)&&Qt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;v&&v.z<=y;){if(v.x>=f&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==o&&Mo(a,u,l,d,c,h,v.x,v.y)&&Qt(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function B0(s,e){let t=s;do{let n=t.prev,i=t.next.next;!Vr(n,i)&&yp(n,t,t.next,i)&&Zo(n,i)&&Zo(i,n)&&(e.push(n.i,t.i,i.i),$o(t),$o(t.next),t=s=i),t=t.next}while(t!==s);return Vs(t)}function k0(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&K0(o,a)){let l=xp(o,a);o=Vs(o,o.next),l=Vs(l,l.next),Ko(o,e,t,n,i,r,0),Ko(l,e,t,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function z0(s,e,t,n){let i=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:s.length,c=gp(s,a,l,n,!1);c===c.next&&(c.steiner=!0),i.push(Y0(c))}i.sort(H0);for(let r=0;r<i.length;r++)t=G0(i[r],t);return t}function H0(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function G0(s,e){let t=V0(s,e);if(!t)return e;let n=xp(t,s);return Vs(n,n.next),Vs(t,t.next)}function V0(s,e){let t=e,n=s.x,i=s.y,r=-1/0,o;if(Vr(s,t))return t;do{if(Vr(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){let d=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=n&&d>r&&(r=d,o=t.x<t.next.x?t:t.next,d===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,u=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&_p(i<c?n:r,i,l,c,i<c?r:n,i,t.x,t.y)){let d=Math.abs(i-t.y)/(n-t.x);Zo(t,s)&&(d<u||d===u&&(t.x>o.x||t.x===o.x&&W0(o,t)))&&(o=t,u=d)}t=t.next}while(t!==a);return o}function W0(s,e){return Qt(s.prev,s,e.prev)<0&&Qt(e.next,s,s.next)<0}function X0(s,e,t,n){let i=s;do i.z===0&&(i.z=Ih(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,q0(i)}function q0(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,t*=2}while(e>1);return s}function Ih(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function Y0(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function _p(s,e,t,n,i,r,o,a){return(i-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(i-o)*(n-a)}function Mo(s,e,t,n,i,r,o,a){return!(s===o&&e===a)&&_p(s,e,t,n,i,r,o,a)}function K0(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!Z0(s,e)&&(Zo(s,e)&&Zo(e,s)&&$0(s,e)&&(Qt(s.prev,s,e.prev)||Qt(s,e.prev,e))||Vr(s,e)&&Qt(s.prev,s,s.next)>0&&Qt(e.prev,e,e.next)>0)}function Qt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function Vr(s,e){return s.x===e.x&&s.y===e.y}function yp(s,e,t,n){let i=ul(Qt(s,e,t)),r=ul(Qt(s,e,n)),o=ul(Qt(t,n,s)),a=ul(Qt(t,n,e));return!!(i!==r&&o!==a||i===0&&hl(s,t,e)||r===0&&hl(s,n,e)||o===0&&hl(t,s,n)||a===0&&hl(t,e,n))}function hl(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function ul(s){return s>0?1:s<0?-1:0}function Z0(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&yp(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Zo(s,e){return Qt(s.prev,s,s.next)<0?Qt(s,e,s.next)>=0&&Qt(s,s.prev,e)>=0:Qt(s,e,s.prev)<0||Qt(s,s.next,e)<0}function $0(s,e){let t=s,n=!1,i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function xp(s,e){let t=Lh(s.i,s.x,s.y),n=Lh(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function mf(s,e,t,n){let i=Lh(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function $o(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Lh(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function J0(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var Dh=class{static triangulate(e,t,n=2){return U0(e,t,n)}},Ar=class s{static area(e){let t=e.length,n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return s.area(e)<0}static triangulateShape(e,t){let n=[],i=[],r=[];gf(e),_f(n,e);let o=e.length;t.forEach(gf);for(let l=0;l<t.length;l++)i.push(o),o+=t[l].length,_f(n,t[l]);let a=Dh.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function gf(s){let e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function _f(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}var Ws=class s extends Vo{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Wr=class s extends en{constructor(e=[new be(0,-.5),new be(.5,0),new be(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=vt(i,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/t,d=new D,h=new be,f=new D,g=new D,_=new D,p=0,m=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-p,f.z=m*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:_.normalize(),l.push(_.x,_.y,_.z);break;default:p=e[y+1].x-e[y].x,m=e[y+1].y-e[y].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let y=0;y<=t;y++){let x=n+y*u*i,v=Math.sin(x),w=Math.cos(x);for(let T=0;T<=e.length-1;T++){d.x=e[T].x*v,d.y=e[T].y,d.z=e[T].x*w,o.push(d.x,d.y,d.z),h.x=y/t,h.y=T/(e.length-1),a.push(h.x,h.y);let M=l[3*T+0]*v,S=l[3*T+1],F=l[3*T+0]*w;c.push(M,S,F)}}for(let y=0;y<t;y++)for(let x=0;x<e.length-1;x++){let v=x+y*e.length,w=v,T=v+e.length,M=v+e.length+1,S=v+1;r.push(w,T,S),r.push(M,S,T)}this.setIndex(r),this.setAttribute("position",new wt(o,3)),this.setAttribute("uv",new wt(a,2)),this.setAttribute("normal",new wt(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.points,e.segments,e.phiStart,e.phiLength)}},Rn=class s extends Vo{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new s(e.radius,e.detail)}},Xs=class s extends en{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,u=l+1,d=e/a,h=t/l,f=[],g=[],_=[],p=[];for(let m=0;m<u;m++){let y=m*h-o;for(let x=0;x<c;x++){let v=x*d-r;g.push(v,-y,0),_.push(0,0,1),p.push(x/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<a;y++){let x=y+c*m,v=y+c*(m+1),w=y+1+c*(m+1),T=y+1+c*m;f.push(x,v,T),f.push(v,w,T)}this.setIndex(f),this.setAttribute("position",new wt(g,3)),this.setAttribute("normal",new wt(_,3)),this.setAttribute("uv",new wt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.width,e.height,e.widthSegments,e.heightSegments)}},Bn=class s extends en{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],l=[],c=[],u=[],d=e,h=(t-e)/i,f=new D,g=new be;for(let _=0;_<=i;_++){for(let p=0;p<=n;p++){let m=r+p/n*o;f.x=d*Math.cos(m),f.y=d*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}d+=h}for(let _=0;_<i;_++){let p=_*(n+1);for(let m=0;m<n;m++){let y=m+p,x=y,v=y+n+1,w=y+n+2,T=y+1;a.push(x,v,T),a.push(v,w,T)}}this.setIndex(a),this.setAttribute("position",new wt(l,3)),this.setAttribute("normal",new wt(c,3)),this.setAttribute("uv",new wt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Xr=class s extends en{constructor(e=new Gs([new be(0,.5),new be(-.5,-.5),new be(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],i=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let u=0;u<e.length;u++)c(e[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new wt(i,3)),this.setAttribute("normal",new wt(r,3)),this.setAttribute("uv",new wt(o,2));function c(u){let d=i.length/3,h=u.extractPoints(t),f=h.shape,g=h.holes;Ar.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,m=g.length;p<m;p++){let y=g[p];Ar.isClockWise(y)===!0&&(g[p]=y.reverse())}let _=Ar.triangulateShape(f,g);for(let p=0,m=g.length;p<m;p++){let y=g[p];f=f.concat(y)}for(let p=0,m=f.length;p<m;p++){let y=f[p];i.push(y.x,y.y,0),r.push(0,0,1),o.push(y.x,y.y)}for(let p=0,m=_.length;p<m;p++){let y=_[p],x=y[0]+d,v=y[1]+d,w=y[2]+d;n.push(x,v,w),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return j0(t,e)}static fromJSON(e,t){let n=[];for(let i=0,r=e.shapes.length;i<r;i++){let o=t[e.shapes[i]];n.push(o)}return new s(n,e.curveSegments)}};function j0(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){let i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}var Ct=class s extends en{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],u=[],d=[],h=new D,f=new D,g=new D;for(let _=0;_<=n;_++){let p=o+_/n*a;for(let m=0;m<=i;m++){let y=m/i*r;f.x=(e+t*Math.cos(p))*Math.cos(y),f.y=(e+t*Math.cos(p))*Math.sin(y),f.z=t*Math.sin(p),c.push(f.x,f.y,f.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),g.subVectors(f,h).normalize(),u.push(g.x,g.y,g.z),d.push(m/i),d.push(_/n)}}for(let _=1;_<=n;_++)for(let p=1;p<=i;p++){let m=(i+1)*_+p-1,y=(i+1)*(_-1)+p-1,x=(i+1)*(_-1)+p,v=(i+1)*_+p;l.push(m,y,v),l.push(y,x,v)}this.setIndex(l),this.setAttribute("position",new wt(c,3)),this.setAttribute("normal",new wt(u,3)),this.setAttribute("uv",new wt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new s(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var qr=class s extends en{constructor(e=new Hs(new D(-1,-1,0),new D(-1,1,0),new D(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new D,l=new D,c=new be,u=new D,d=[],h=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new wt(d,3)),this.setAttribute("normal",new wt(h,3)),this.setAttribute("uv",new wt(f,2));function _(){for(let x=0;x<t;x++)p(x);p(r===!1?t:0),y(),m()}function p(x){u=e.getPointAt(x/t,u);let v=o.normals[x],w=o.binormals[x];for(let T=0;T<=i;T++){let M=T/i*Math.PI*2,S=Math.sin(M),F=-Math.cos(M);l.x=F*v.x+S*w.x,l.y=F*v.y+S*w.y,l.z=F*v.z+S*w.z,l.normalize(),h.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,d.push(a.x,a.y,a.z)}}function m(){for(let x=1;x<=t;x++)for(let v=1;v<=i;v++){let w=(i+1)*(x-1)+(v-1),T=(i+1)*x+(v-1),M=(i+1)*x+v,S=(i+1)*(x-1)+v;g.push(w,T,S),g.push(T,M,S)}}function y(){for(let x=0;x<=t;x++)for(let v=0;v<=i;v++)c.x=x/t,c.y=v/i,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new s(new Ph[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};function nr(s){let e={};for(let t in s){e[t]={};for(let n in s[t]){let i=s[t][n];if(yf(i))i.isRenderTargetTexture?(it("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone();else if(Array.isArray(i))if(yf(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();e[t][n]=r}else e[t][n]=i.slice();else e[t][n]=i}}return e}function Dn(s){let e={};for(let t=0;t<s.length;t++){let n=nr(s[t]);for(let i in n)e[i]=n[i]}return e}function yf(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Q0(s){let e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function _u(s){let e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Tt.workingColorSpace}var vp={clone:nr,merge:Dn},eg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,tg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ei=class extends Fn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=eg,this.fragmentShader=tg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=nr(e.uniforms),this.uniformsGroups=Q0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let i=e.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=t[i.value]||null;break;case"c":this.uniforms[n].value=new nt().setHex(i.value);break;case"v2":this.uniforms[n].value=new be().fromArray(i.value);break;case"v3":this.uniforms[n].value=new D().fromArray(i.value);break;case"v4":this.uniforms[n].value=new qt().fromArray(i.value);break;case"m3":this.uniforms[n].value=new mt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new dt().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Dl=class extends Ei{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ln=class extends Fn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new nt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lc,this.normalScale=new be(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},kn=class extends Ln{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new be(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return vt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new nt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new nt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new nt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Ds('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Ds('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Nl=class extends Fn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=np,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ul=class extends Fn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function us(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function bo(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}function ng(s){function e(i,r){return s[i]-s[r]}let t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function xf(s,e,t){let n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function ig(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}var Ti=class{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ol=class extends Ti{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Is,endingEnd:Is}}intervalChanged_(e,t,n){let i=this.parameterPositions,r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ls:r=e,a=2*t-n;break;case Ao:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ls:o=e,l=2*n-t;break;case Ao:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),_=g*g,p=_*g,m=-h*p+2*h*_-h*g,y=(1+h)*p+(-1.5-2*h)*_+(-.5+h)*g+1,x=(-1-f)*p+(1.5+f)*_+.5*g,v=f*p-f*_;for(let w=0;w!==a;++w)r[w]=m*o[u+w]+y*o[c+w]+x*o[l+w]+v*o[d+w];return r}},Jo=class extends Ti{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(i-t),d=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*d+o[l+h]*u;return r}},Fl=class extends Ti{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}},Bl=class extends Ti{interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(n-t)/(i-t),_=1-g;for(let p=0;p!==a;++p)r[p]=o[c+p]*_+o[l+p]*g;return r}let h=a*2,f=e-1;for(let g=0;g!==a;++g){let _=o[c+g],p=o[l+g],m=f*h+g*2,y=d[m],x=d[m+1],v=e*h+g*2,w=u[v],T=u[v+1],M=rg(n,t,y,w,i);r[g]=Mp(M,_,x,T,p)}return r}};function Mp(s,e,t,n,i){let r=1-s;return r*r*r*e+3*r*r*s*t+3*r*s*s*n+s*s*s*i}function sg(s,e,t,n,i){let r=1-s;return 3*r*r*(t-e)+6*r*s*(n-t)+3*s*s*(i-n)}function rg(s,e,t,n,i){let r=(s-e)/(i-e);for(let o=0;o<8;o++){let a=Mp(r,e,t,n,i)-s;if(Math.abs(a)<1e-10)break;let l=sg(r,e,t,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var Wn=class{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=us(t,this.TimeBufferType),this.values=us(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:us(e.times,Array),values:us(e.values,Array)};let i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i),bo(e.settings)&&(n.settings={inTangents:us(e.settings.inTangents,Array),outTangents:us(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Fl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Jo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ol(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Bl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ns:t=this.InterpolantFactoryMethodDiscrete;break;case Us:t=this.InterpolantFactoryMethodLinear;break;case pl:t=this.InterpolantFactoryMethodSmooth;break;case Rh:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return it("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ns;case this.InterpolantFactoryMethodLinear:return Us;case this.InterpolantFactoryMethodSmooth:return pl;case this.InterpolantFactoryMethodBezier:return Rh}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e;bo(this.settings)&&(vf(this.settings.inTangents,e),vf(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e;bo(this.settings)&&(Mf(this.settings.inTangents,e),Mf(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ht("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,i=this.values,r=n.length;r===0&&(ht("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){ht("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){ht("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&Xm(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){ht("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===pl,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(i)l=!0;else{let d=a*n,h=d-n,f=d+n;for(let g=0;g!==n;++g){let _=t[d+g];if(_!==t[h+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let d=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,bo(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function vf(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]+=e}function Mf(s,e){for(let t=0,n=s.length;t!==n;t+=2)s[t]*=e}Wn.prototype.ValueTypeName="";Wn.prototype.TimeBufferType=Float32Array;Wn.prototype.ValueBufferType=Float32Array;Wn.prototype.DefaultInterpolation=Us;var $i=class extends Wn{constructor(e,t,n){super(e,t,n)}};$i.prototype.ValueTypeName="bool";$i.prototype.ValueBufferType=Array;$i.prototype.DefaultInterpolation=Ns;$i.prototype.InterpolantFactoryMethodLinear=void 0;$i.prototype.InterpolantFactoryMethodSmooth=void 0;var jo=class extends Wn{constructor(e,t,n,i){super(e,t,n,i)}};jo.prototype.ValueTypeName="color";var Ji=class extends Wn{constructor(e,t,n,i){super(e,t,n,i)}};Ji.prototype.ValueTypeName="number";var kl=class extends Ti{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t),c=e*a;for(let u=c+a;c!==u;c+=4)_n.slerpFlat(r,0,o,c-a,o,c,l);return r}},ji=class extends Wn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new kl(this.times,this.values,this.getValueSize(),e)}};ji.prototype.ValueTypeName="quaternion";ji.prototype.InterpolantFactoryMethodSmooth=void 0;var Qi=class extends Wn{constructor(e,t,n){super(e,t,n)}};Qi.prototype.ValueTypeName="string";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=Ns;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var gs=class extends Wn{constructor(e,t,n,i){super(e,t,n,i)}};gs.prototype.ValueTypeName="vector";var qs=class{constructor(e="",t=-1,n=[],i=Ic){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=gi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(ag(n[o]).scale(i));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Wn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){let r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);let u=ng(l);l=xf(l,1,u),c=xf(c,1,u),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Ji(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){let c=e[a],u=c.name.match(r);if(u&&u.length>1){let d=u[1],h=i[d];h||(i[d]=h=[]),h.push(c)}}let o=[];for(let a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,i=e.length;n!==i;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function og(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ji;case"vector":case"vector2":case"vector3":case"vector4":return gs;case"color":return jo;case"quaternion":return ji;case"bool":case"boolean":return $i;case"string":return Qi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function ag(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=og(s.type);if(s.times===void 0){let n=[],i=[];ig(s.keys,n,i,"value"),s.times=n,s.values=i}let t;return e.parse!==void 0?t=e.parse(s):t=new e(s.name,s.times,s.values,s.interpolation),bo(s.settings)&&(t.settings={inTangents:us(s.settings.inTangents,Float32Array),outTangents:us(s.settings.outTangents,Float32Array)}),t}var vi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(bf(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!bf(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function bf(s){try{let e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var _s=class{constructor(e,t,n){let i=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},bp=new _s,wi=class{constructor(e){this.manager=e!==void 0?e:bp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};wi.DEFAULT_MATERIAL_NAME="__DEFAULT";var Hi={},Nh=class extends Error{constructor(e,t){super(e),this.response=t}},Yr=class extends wi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=vi.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Hi[e]!==void 0){Hi[e].push({onLoad:t,onProgress:n,onError:i});return}Hi[e]=[],Hi[e].push({onLoad:t,onProgress:n,onError:i});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&it("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;let u=Hi[e],d=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=h?parseInt(h):0,g=f!==0,_=0,p=new ReadableStream({start(m){y();function y(){d.read().then(({done:x,value:v})=>{if(x)m.close();else{_+=v.byteLength;let w=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let T=0,M=u.length;T<M;T++){let S=u[T];S.onProgress&&S.onProgress(w)}m.enqueue(v),y()}},x=>{m.error(x)})}}});return new Response(p)}else throw new Nh(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a==="")return c.text();{let d=/charset="?([^;"\s]*)"?/i.exec(a),h=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(h);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{vi.add(`file:${e}`,c);let u=Hi[e];delete Hi[e];for(let d=0,h=u.length;d<h;d++){let f=u[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{let u=Hi[e];if(u===void 0)throw this.manager.itemError(e),c;delete Hi[e];for(let d=0,h=u.length;d<h;d++){let f=u[d];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Sr=new WeakMap,zl=class extends wi{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=vi.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let d=Sr.get(o);d===void 0&&(d=[],Sr.set(o,d)),d.push({onLoad:t,onError:i})}return o}let a=Ir("img");function l(){u(),t&&t(this);let d=Sr.get(this)||[];for(let h=0;h<d.length;h++){let f=d[h];f.onLoad&&f.onLoad(this)}Sr.delete(this),r.manager.itemEnd(e)}function c(d){u(),i&&i(d),vi.remove(`image:${e}`);let h=Sr.get(this)||[];for(let f=0;f<h.length;f++){let g=h[f];g.onError&&g.onError(d)}Sr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),vi.add(`image:${e}`,a),r.manager.itemStart(e),a.fetchPriority=this.priority,a.src=e,a}};var Qo=class extends wi{constructor(e){super(e)}load(e,t,n,i){let r=new cn,o=new zl(this.manager);return o.setPriority(this.priority),o.setCache(this.cache),o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}},Ys=class extends Bt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new nt(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ea=class extends Ys{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new nt(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Th=new dt,Sf=new D,Ef=new D,Kr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new be(512,512),this.mapType=Xn,this.map=null,this.mapPass=null,this.matrix=new dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ps,this._frameExtents=new be(1,1),this._viewportCount=1,this._viewports=[new qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Sf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Sf),Ef.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ef),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,i){Th.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Th,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=i?i.z/r.x:1,a=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;e.coordinateSystem===Pr||e.reversedDepth?t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),t.multiply(Th)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},dl=new D,fl=new _n,xi=new D,ta=class extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dt,this.projectionMatrix=new dt,this.projectionMatrixInverse=new dt,this.coordinateSystem=si,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(dl,fl,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,fl,xi.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(dl,fl,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,fl,xi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hs=new D,Tf=new be,wf=new be,gn=class extends ta{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Os*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(So*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Os*2*Math.atan(Math.tan(So*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hs.x,hs.y).multiplyScalar(-e/hs.z),hs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hs.x,hs.y).multiplyScalar(-e/hs.z)}getViewSize(e,t){return this.getViewBounds(e,Tf,wf),t.subVectors(wf,Tf)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(So*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Uh=class extends Kr{constructor(){super(new gn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=Os*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},na=class extends Ys{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Uh}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},Oh=class extends Kr{constructor(){super(new gn(90,1,.5,500)),this.isPointLightShadow=!0}},Ai=class extends Ys{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Oh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Ks=class extends ta{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Fh=class extends Kr{constructor(){super(new Ks(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ys=class extends Ys{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new Fh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var es=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var wh=new WeakMap,ia=class extends wi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&it("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&it("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=vi.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{wh.has(o)===!0?(i&&i(wh.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(c),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",a.headers=this.requestHeader,a.priority=this.priority,a.cache=this.cache,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(c){return vi.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),wh.set(l,c),vi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});vi.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Er=-90,Tr=1,Zr=class extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new gn(Er,Tr,e,t);i.layers=this.layers,this.add(i);let r=new gn(Er,Tr,e,t);r.layers=this.layers,this.add(r);let o=new gn(Er,Tr,e,t);o.layers=this.layers,this.add(o);let a=new gn(Er,Tr,e,t);a.layers=this.layers,this.add(a);let l=new gn(Er,Tr,e,t);l.layers=this.layers,this.add(l);let c=new gn(Er,Tr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===si)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Hl=class extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};var Gl=class{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let n=this.buffer,i=this.valueSize,r=e*i+i,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;let a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){let t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,i);break}}saveOriginalState(){let e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){_n.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){let o=this._workIndex*r;_n.multiplyQuaternionsFlat(e,o,e,t,e,n),_n.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){let o=1-i;for(let a=0;a!==r;++a){let l=t+a;e[l]=e[l]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){let a=t+o;e[a]=e[a]+e[n+o]*i}}},yu="\\[\\]\\.:\\/",lg=new RegExp("["+yu+"]","g"),xu="[^"+yu+"]",cg="[^"+yu.replace("\\.","")+"]",hg=/((?:WC+[\/:])*)/.source.replace("WC",xu),ug=/(WCOD+)?/.source.replace("WCOD",cg),dg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",xu),fg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",xu),pg=new RegExp("^"+hg+ug+dg+fg+"$"),mg=["material","materials","bones","map"],Bh=class{constructor(e,t,n){let i=n||Yt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Yt=class s{constructor(e,t,n){this.path=t,this.parsedPath=n||s.parseTrackName(t),this.node=s.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new s.Composite(e,t,n):new s(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(lg,"")}static parseTrackName(e){let t=pg.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);mg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,i=t.propertyName,r=t.propertyIndex;if(e||(e=s.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){it("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ht("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ht("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ht("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){ht("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){ht("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[i];if(o===void 0){let c=t.nodeName;ht("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Yt.Composite=Bh;Yt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Yt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Yt.prototype.GetterByBindingType=[Yt.prototype._getValue_direct,Yt.prototype._getValue_array,Yt.prototype._getValue_arrayElement,Yt.prototype._getValue_toArray];Yt.prototype.SetterByBindingTypeAndVersioning=[[Yt.prototype._setValue_direct,Yt.prototype._setValue_direct_setNeedsUpdate,Yt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Yt.prototype._setValue_array,Yt.prototype._setValue_array_setNeedsUpdate,Yt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Yt.prototype._setValue_arrayElement,Yt.prototype._setValue_arrayElement_setNeedsUpdate,Yt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Yt.prototype._setValue_fromArray,Yt.prototype._setValue_fromArray_setNeedsUpdate,Yt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Vl=class{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;let r=t.tracks,o=r.length,a=new Array(o),l={endingStart:Is,endingEnd:Is};for(let c=0;c!==o;++c){let u=r[c].createInterpolant(null);a[c]=u,u.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._restoreTimeScale=null,this._weightInterpolant=null,this.loop=Qf,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){let i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e._restoreTimeScale=e.timeScale,this._restoreTimeScale=this.timeScale,e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){let i=this._mixer,r=i.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);let l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this._restoreTimeScale=null,this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}let r=this._startTime;if(r!==null){let l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);let o=this._updateTime(t),a=this._updateWeight(e);if(a>0){let l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case tp:for(let u=0,d=l.length;u!==d;++u)l[u].evaluate(o),c[u].accumulateAdditive(a);break;case Ic:default:for(let u=0,d=l.length;u!==d;++u)l[u].evaluate(o),c[u].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let n=this._weightInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(t===0?this.paused=!0:(this._restoreTimeScale!==null&&(t=this._restoreTimeScale),this.timeScale=t),this.stopWarping())}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,n=this.loop,i=this.time+e,r=this._loopCount,o=n===ep;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===Pc){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){let a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);let l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){let c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this._loopCount=r,this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){let i=this._interpolantSettings;n?(i.endingStart=Ls,i.endingEnd=Ls):(e?i.endingStart=this.zeroSlopeAtStart?Ls:Is:i.endingStart=Ao,t?i.endingEnd=this.zeroSlopeAtEnd?Ls:Is:i.endingEnd=Ao)}_scheduleFading(e,t,n){let i=this._mixer,r=i.time,o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}},gg=new Float32Array(1),sa=class extends ri{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}_bindAction(e,t){let n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName,u=c[l];u===void 0&&(u={},c[l]=u);for(let d=0;d!==r;++d){let h=i[d],f=h.name,g=u[f];if(g!==void 0)++g.referenceCount,o[d]=g;else{if(g=o[d],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,f));continue}let _=t&&t._propertyBindings[d].binding.parsedPath;g=new Gl(Yt.create(n,f,_),h.ValueTypeName,h.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,f),o[d]=g}a[d].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){let i=this._actions,r=this._actionsByClip,o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{let a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){let t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;let r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],u=e._byClipCacheIndex;c._byClipCacheIndex=u,l[u]=c,l.pop(),e._byClipCacheIndex=null;let d=a.actionByRoot,h=(e._localRoot||this._root).uuid;delete d[h],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){let r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){let t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){let t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){let i=this._bindingsByRootAndName,r=this._bindings,o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){let t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){let t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){let t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,n=e[t];return n===void 0&&(n=new Jo(new Float32Array(2),new Float32Array(2),1,gg),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){let t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){let i=t||this._root,r=i.uuid,o=typeof e=="string"?qs.findByName(i,e):e,a=o!==null?o.uuid:e,l=this._actionsByClip[a],c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Ic),l!==void 0){let d=l.actionByRoot[r];if(d!==void 0&&d.blendMode===n)return d;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;let u=new Vl(this,o,t,n);return this._bindAction(u,c),this._addInactiveAction(u,a,r),u}existingAction(e,t){let n=t||this._root,i=n.uuid,r=typeof e=="string"?qs.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;let t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,o);let a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){let o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){let c=o[a];this._deactivateAction(c);let u=c._cacheIndex,d=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,d._cacheIndex=u,t[u]=d,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){let t=e.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}let i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){let n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var Af=new dt,ra=class{constructor(e,t,n=0,i=1/0){this.ray=new Mi(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Nr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):ht("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Af.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Af),this}intersectObject(e,t=!0,n=[]){return kh(e,this,n,t),n.sort(Rf),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)kh(e[i],this,n,t);return n.sort(Rf),n}};function Rf(s,e){return s.distance-e.distance}function kh(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)kh(r[o],e,t,!0)}}var $r=class{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=vt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(vt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var zh=class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,i){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,i){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=i,this}};var oa=class extends ri{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function vu(s,e,t,n){let i=_g(n);switch(t){case su:return s*e;case $l:return s*e/i.components*i.byteLength;case Jl:return s*e/i.components*i.byteLength;case bs:return s*e*2/i.components*i.byteLength;case jl:return s*e*2/i.components*i.byteLength;case ru:return s*e*3/i.components*i.byteLength;case ai:return s*e*4/i.components*i.byteLength;case Ql:return s*e*4/i.components*i.byteLength;case la:case ca:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ha:case ua:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case tc:case ic:return Math.max(s,16)*Math.max(e,8)/4;case ec:case nc:return Math.max(s,8)*Math.max(e,8)/2;case sc:case rc:case ac:case lc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case oc:case da:case cc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case hc:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case uc:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case dc:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case fc:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case pc:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case mc:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case gc:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case _c:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case yc:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case xc:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case vc:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case Mc:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case bc:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Sc:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Ec:case Tc:case wc:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Ac:case Rc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case fa:case Cc:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function _g(s){switch(s){case Xn:case eu:return{byteLength:1,components:1};case eo:case tu:case mi:return{byteLength:2,components:1};case Kl:case Zl:return{byteLength:2,components:4};case pi:case Yl:case ti:return{byteLength:4,components:1};case nu:case iu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?it("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Wp(){let s=null,e=!1,t=null,n=null;function i(r,o){n=s.requestAnimationFrame(i),t(r,o)}return{start:function(){e!==!0&&t!==null&&s!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function xg(s){let e=new WeakMap;function t(a,l){let c=a.array,u=a.usage,d=c.byteLength,h=s.createBuffer();s.bindBuffer(l,h),s.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){let u=l.array,d=l.updateRanges;if(s.bindBuffer(c,a),d.length===0)s.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<d.length;f++){let g=d[h],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++h,d[h]=_)}d.length=h+1;for(let f=0,g=d.length;f<g;f++){let _=d[f];s.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var vg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Mg=`#ifdef USE_ALPHAHASH
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
#endif`,bg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Sg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Eg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,wg=`#ifdef USE_AOMAP
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
#endif`,Ag=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Rg=`#ifdef USE_BATCHING
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
#endif`,Cg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Pg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ig=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Lg=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Dg=`#ifdef USE_IRIDESCENCE
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
#endif`,Ng=`#ifdef USE_BUMPMAP
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
#endif`,Ug=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Og=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Fg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,kg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,zg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Hg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Gg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Vg=`#define PI 3.141592653589793
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
} // validated`,Wg=`vec3 transformedNormal = objectNormal;
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
#endif`,Xg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Kg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zg="gl_FragColor = linearToOutputTexel( gl_FragColor );",$g=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Jg=`#ifdef USE_ENVMAP
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
#endif`,jg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Qg=`#ifdef USE_ENVMAP
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
#endif`,e_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,t_=`#ifdef USE_ENVMAP
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
#endif`,n_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,i_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,s_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,r_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,o_=`#ifdef USE_GRADIENTMAP
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
}`,a_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,l_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,c_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,h_=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,u_=`#ifdef USE_ENVMAP
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
#endif`,d_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,f_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,p_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,m_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,g_=`PhysicalMaterial material;
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
#endif`,__=`uniform sampler2D dfgLUT;
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
}`,y_=`
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
#endif`,x_=`#if defined( RE_IndirectDiffuse )
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
#endif`,v_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,M_=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,b_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,S_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,E_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,T_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,w_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,A_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,R_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,C_=`#if defined( USE_POINTS_UV )
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
#endif`,P_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,I_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,L_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,D_=`#if defined( USE_MORPHCOLORS )
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
#endif`,N_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,U_=`#ifdef USE_MORPHTARGETS
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
#endif`,O_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,F_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,B_=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,k_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,z_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,H_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,G_=`#ifdef USE_NORMALMAP
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
#endif`,V_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,W_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,X_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,q_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Y_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,K_=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Z_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,J_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,j_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Q_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ey=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ty=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ny=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,iy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,sy=`float getShadowMask() {
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
}`,ry=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,oy=`#ifdef USE_SKINNING
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
#endif`,ay=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ly=`#ifdef USE_SKINNING
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
#endif`,cy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,uy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,dy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,fy=`#ifdef USE_TRANSMISSION
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
#endif`,py=`#ifdef USE_TRANSMISSION
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
#endif`,my=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_y=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,yy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,xy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vy=`uniform sampler2D t2D;
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
}`,My=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,by=`uniform float backgroundBlurriness;
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
}`,Sy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ey=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ty=`#include <common>
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
}`,wy=`#if DEPTH_PACKING == 3200
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
}`,Ay=`#define DISTANCE
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
}`,Ry=`#define DISTANCE
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
}`,Cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Py=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Iy=`uniform float scale;
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
}`,Ly=`uniform vec3 diffuse;
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
}`,Dy=`#include <common>
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
}`,Ny=`uniform vec3 diffuse;
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
}`,Uy=`#define LAMBERT
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
}`,Oy=`#define LAMBERT
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
}`,Fy=`#define MATCAP
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
}`,By=`#define MATCAP
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
}`,ky=`#define NORMAL
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
}`,zy=`#define NORMAL
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
}`,Hy=`#define PHONG
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
}`,Gy=`#define PHONG
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
}`,Vy=`#define STANDARD
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
}`,Wy=`#define STANDARD
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
}`,Xy=`#define TOON
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
}`,qy=`#define TOON
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
}`,Yy=`uniform float size;
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
}`,Ky=`uniform vec3 diffuse;
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
}`,Zy=`#include <common>
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
}`,$y=`uniform vec3 color;
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
}`,Jy=`uniform float rotation;
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
}`,jy=`uniform vec3 diffuse;
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
}`,St={alphahash_fragment:vg,alphahash_pars_fragment:Mg,alphamap_fragment:bg,alphamap_pars_fragment:Sg,alphatest_fragment:Eg,alphatest_pars_fragment:Tg,aomap_fragment:wg,aomap_pars_fragment:Ag,batching_pars_vertex:Rg,batching_vertex:Cg,begin_vertex:Pg,beginnormal_vertex:Ig,bsdfs:Lg,iridescence_fragment:Dg,bumpmap_pars_fragment:Ng,clipping_planes_fragment:Ug,clipping_planes_pars_fragment:Og,clipping_planes_pars_vertex:Fg,clipping_planes_vertex:Bg,color_fragment:kg,color_pars_fragment:zg,color_pars_vertex:Hg,color_vertex:Gg,common:Vg,defaultnormal_vertex:Wg,displacementmap_pars_vertex:Xg,displacementmap_vertex:qg,emissivemap_fragment:Yg,emissivemap_pars_fragment:Kg,colorspace_fragment:Zg,colorspace_pars_fragment:$g,envmap_fragment:Jg,envmap_common_pars_fragment:jg,envmap_pars_fragment:Qg,envmap_pars_vertex:e_,envmap_physical_pars_fragment:u_,envmap_vertex:t_,fog_vertex:n_,fog_pars_vertex:i_,fog_fragment:s_,fog_pars_fragment:r_,gradientmap_pars_fragment:o_,lightmap_pars_fragment:a_,lights_lambert_fragment:l_,lights_lambert_pars_fragment:c_,lights_pars_begin:h_,lights_toon_fragment:d_,lights_toon_pars_fragment:f_,lights_phong_fragment:p_,lights_phong_pars_fragment:m_,lights_physical_fragment:g_,lights_physical_pars_fragment:__,lights_fragment_begin:y_,lights_fragment_maps:x_,lights_fragment_end:v_,lightprobes_pars_fragment:M_,logdepthbuf_fragment:b_,logdepthbuf_pars_fragment:S_,logdepthbuf_pars_vertex:E_,logdepthbuf_vertex:T_,map_fragment:w_,map_pars_fragment:A_,map_particle_fragment:R_,map_particle_pars_fragment:C_,metalnessmap_fragment:P_,metalnessmap_pars_fragment:I_,morphinstance_vertex:L_,morphcolor_vertex:D_,morphnormal_vertex:N_,morphtarget_pars_vertex:U_,morphtarget_vertex:O_,normal_fragment_begin:F_,normal_fragment_maps:B_,normal_pars_fragment:k_,normal_pars_vertex:z_,normal_vertex:H_,normalmap_pars_fragment:G_,clearcoat_normal_fragment_begin:V_,clearcoat_normal_fragment_maps:W_,clearcoat_pars_fragment:X_,iridescence_pars_fragment:q_,opaque_fragment:Y_,packing:K_,premultiplied_alpha_fragment:Z_,project_vertex:$_,dithering_fragment:J_,dithering_pars_fragment:j_,roughnessmap_fragment:Q_,roughnessmap_pars_fragment:ey,shadowmap_pars_fragment:ty,shadowmap_pars_vertex:ny,shadowmap_vertex:iy,shadowmask_pars_fragment:sy,skinbase_vertex:ry,skinning_pars_vertex:oy,skinning_vertex:ay,skinnormal_vertex:ly,specularmap_fragment:cy,specularmap_pars_fragment:hy,tonemapping_fragment:uy,tonemapping_pars_fragment:dy,transmission_fragment:fy,transmission_pars_fragment:py,uv_pars_fragment:my,uv_pars_vertex:gy,uv_vertex:_y,worldpos_vertex:yy,background_vert:xy,background_frag:vy,backgroundCube_vert:My,backgroundCube_frag:by,cube_vert:Sy,cube_frag:Ey,depth_vert:Ty,depth_frag:wy,distance_vert:Ay,distance_frag:Ry,equirect_vert:Cy,equirect_frag:Py,linedashed_vert:Iy,linedashed_frag:Ly,meshbasic_vert:Dy,meshbasic_frag:Ny,meshlambert_vert:Uy,meshlambert_frag:Oy,meshmatcap_vert:Fy,meshmatcap_frag:By,meshnormal_vert:ky,meshnormal_frag:zy,meshphong_vert:Hy,meshphong_frag:Gy,meshphysical_vert:Vy,meshphysical_frag:Wy,meshtoon_vert:Xy,meshtoon_frag:qy,points_vert:Yy,points_frag:Ky,shadow_vert:Zy,shadow_frag:$y,sprite_vert:Jy,sprite_frag:jy},He={common:{diffuse:{value:new nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new mt}},envmap:{envMap:{value:null},envMapRotation:{value:new mt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new mt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new mt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new mt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new mt},normalScale:{value:new be(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new mt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new mt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new mt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new mt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0},uvTransform:{value:new mt}},sprite:{diffuse:{value:new nt(16777215)},opacity:{value:1},center:{value:new be(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new mt},alphaMap:{value:null},alphaMapTransform:{value:new mt},alphaTest:{value:0}}},Ii={basic:{uniforms:Dn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.fog]),vertexShader:St.meshbasic_vert,fragmentShader:St.meshbasic_frag},lambert:{uniforms:Dn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.fog,He.lights,{emissive:{value:new nt(0)},envMapIntensity:{value:1}}]),vertexShader:St.meshlambert_vert,fragmentShader:St.meshlambert_frag},phong:{uniforms:Dn([He.common,He.specularmap,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.fog,He.lights,{emissive:{value:new nt(0)},specular:{value:new nt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:St.meshphong_vert,fragmentShader:St.meshphong_frag},standard:{uniforms:Dn([He.common,He.envmap,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.roughnessmap,He.metalnessmap,He.fog,He.lights,{emissive:{value:new nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:St.meshphysical_vert,fragmentShader:St.meshphysical_frag},toon:{uniforms:Dn([He.common,He.aomap,He.lightmap,He.emissivemap,He.bumpmap,He.normalmap,He.displacementmap,He.gradientmap,He.fog,He.lights,{emissive:{value:new nt(0)}}]),vertexShader:St.meshtoon_vert,fragmentShader:St.meshtoon_frag},matcap:{uniforms:Dn([He.common,He.bumpmap,He.normalmap,He.displacementmap,He.fog,{matcap:{value:null}}]),vertexShader:St.meshmatcap_vert,fragmentShader:St.meshmatcap_frag},points:{uniforms:Dn([He.points,He.fog]),vertexShader:St.points_vert,fragmentShader:St.points_frag},dashed:{uniforms:Dn([He.common,He.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:St.linedashed_vert,fragmentShader:St.linedashed_frag},depth:{uniforms:Dn([He.common,He.displacementmap]),vertexShader:St.depth_vert,fragmentShader:St.depth_frag},normal:{uniforms:Dn([He.common,He.bumpmap,He.normalmap,He.displacementmap,{opacity:{value:1}}]),vertexShader:St.meshnormal_vert,fragmentShader:St.meshnormal_frag},sprite:{uniforms:Dn([He.sprite,He.fog]),vertexShader:St.sprite_vert,fragmentShader:St.sprite_frag},background:{uniforms:{uvTransform:{value:new mt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:St.background_vert,fragmentShader:St.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new mt}},vertexShader:St.backgroundCube_vert,fragmentShader:St.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:St.cube_vert,fragmentShader:St.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:St.equirect_vert,fragmentShader:St.equirect_frag},distance:{uniforms:Dn([He.common,He.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:St.distance_vert,fragmentShader:St.distance_frag},shadow:{uniforms:Dn([He.lights,He.fog,{color:{value:new nt(0)},opacity:{value:1}}]),vertexShader:St.shadow_vert,fragmentShader:St.shadow_frag}};Ii.physical={uniforms:Dn([Ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new mt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new mt},clearcoatNormalScale:{value:new be(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new mt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new mt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new mt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new mt},sheen:{value:0},sheenColor:{value:new nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new mt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new mt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new mt},transmissionSamplerSize:{value:new be},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new mt},attenuationDistance:{value:0},attenuationColor:{value:new nt(0)},specularColor:{value:new nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new mt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new mt},anisotropyVector:{value:new be},anisotropyMap:{value:null},anisotropyMapTransform:{value:new mt}}]),vertexShader:St.meshphysical_vert,fragmentShader:St.meshphysical_frag};var Nc={r:0,b:0,g:0},Qy=new dt,Xp=new mt;Xp.set(-1,0,0,0,1,0,0,0,1);function ex(s,e,t,n,i,r){let o=new nt(0),a=i===!0?0:1,l,c,u=null,d=0,h=null;function f(y){let x=y.isScene===!0?y.background:null;if(x&&x.isTexture){let v=y.backgroundBlurriness>0;x=e.get(x,v)}return x}function g(y){let x=!1,v=f(y);v===null?p(o,a):v&&v.isColor&&(p(v,1),x=!0);let w=s.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,r):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||x)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,x){let v=f(x);v&&v.isCubeTexture?(c===void 0&&(c=new Jt(new bi(1,1,1),new Ei({name:"BackgroundCubeMaterial",uniforms:nr(Ii.backgroundCube.uniforms),vertexShader:Ii.backgroundCube.vertexShader,fragmentShader:Ii.backgroundCube.fragmentShader,side:zn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,T,M){this.matrixWorld.copyPosition(M.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Qy.makeRotationFromEuler(x.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Xp),c.material.toneMapped=Tt.getTransfer(v.colorSpace)!==Gt,(u!==v||d!==v.version||h!==s.toneMapping)&&(c.material.needsUpdate=!0,u=v,d=v.version,h=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new Jt(new Xs(2,2),new Ei({name:"BackgroundMaterial",uniforms:nr(Ii.background.uniforms),vertexShader:Ii.background.vertexShader,fragmentShader:Ii.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,l.material.toneMapped=Tt.getTransfer(v.colorSpace)!==Gt,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||d!==v.version||h!==s.toneMapping)&&(l.material.needsUpdate=!0,u=v,d=v.version,h=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null))}function p(y,x){y.getRGB(Nc,_u(s)),t.buffers.color.setClear(Nc.r,Nc.g,Nc.b,x,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,x=1){o.set(y),a=x,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,p(o,a)},render:g,addToRenderList:_,dispose:m}}function tx(s,e){let t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null),r=i,o=!1;function a(k,H,z,U,q){let $=!1,W=d(k,U,z,H);r!==W&&(r=W,c(r.object)),$=f(k,U,z,q),$&&g(k,U,z,q),q!==null&&e.update(q,s.ELEMENT_ARRAY_BUFFER),($||o)&&(o=!1,v(k,H,z,U),q!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(q).buffer))}function l(){return s.createVertexArray()}function c(k){return s.bindVertexArray(k)}function u(k){return s.deleteVertexArray(k)}function d(k,H,z,U){let q=U.wireframe===!0,$=n[H.id];$===void 0&&($={},n[H.id]=$);let W=k.isInstancedMesh===!0?k.id:0,me=$[W];me===void 0&&(me={},$[W]=me);let J=me[z.id];J===void 0&&(J={},me[z.id]=J);let le=J[q];return le===void 0&&(le=h(l()),J[q]=le),le}function h(k){let H=[],z=[],U=[];for(let q=0;q<t;q++)H[q]=0,z[q]=0,U[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:z,attributeDivisors:U,object:k,attributes:{},index:null}}function f(k,H,z,U){let q=r.attributes,$=H.attributes,W=0,me=z.getAttributes();for(let J in me)if(me[J].location>=0){let Se=q[J],Le=$[J];if(Le===void 0&&(J==="instanceMatrix"&&k.instanceMatrix&&(Le=k.instanceMatrix),J==="instanceColor"&&k.instanceColor&&(Le=k.instanceColor)),Se===void 0||Se.attribute!==Le||Le&&Se.data!==Le.data)return!0;W++}return r.attributesNum!==W||r.index!==U}function g(k,H,z,U){let q={},$=H.attributes,W=0,me=z.getAttributes();for(let J in me)if(me[J].location>=0){let Se=$[J];Se===void 0&&(J==="instanceMatrix"&&k.instanceMatrix&&(Se=k.instanceMatrix),J==="instanceColor"&&k.instanceColor&&(Se=k.instanceColor));let Le={};Le.attribute=Se,Se&&Se.data&&(Le.data=Se.data),q[J]=Le,W++}r.attributes=q,r.attributesNum=W,r.index=U}function _(){let k=r.newAttributes;for(let H=0,z=k.length;H<z;H++)k[H]=0}function p(k){m(k,0)}function m(k,H){let z=r.newAttributes,U=r.enabledAttributes,q=r.attributeDivisors;z[k]=1,U[k]===0&&(s.enableVertexAttribArray(k),U[k]=1),q[k]!==H&&(s.vertexAttribDivisor(k,H),q[k]=H)}function y(){let k=r.newAttributes,H=r.enabledAttributes;for(let z=0,U=H.length;z<U;z++)H[z]!==k[z]&&(s.disableVertexAttribArray(z),H[z]=0)}function x(k,H,z,U,q,$,W){W===!0?s.vertexAttribIPointer(k,H,z,q,$):s.vertexAttribPointer(k,H,z,U,q,$)}function v(k,H,z,U){_();let q=U.attributes,$=z.getAttributes(),W=H.defaultAttributeValues;for(let me in $){let J=$[me];if(J.location>=0){let le=q[me];if(le===void 0&&(me==="instanceMatrix"&&k.instanceMatrix&&(le=k.instanceMatrix),me==="instanceColor"&&k.instanceColor&&(le=k.instanceColor)),le!==void 0){let Se=le.normalized,Le=le.itemSize,et=e.get(le);if(et===void 0)continue;let V=et.buffer,he=et.type,Ee=et.bytesPerElement,Fe=he===s.INT||he===s.UNSIGNED_INT||le.gpuType===Yl;if(le.isInterleavedBufferAttribute){let _e=le.data,ce=_e.isInterleavedBuffer===!0?_e.stride:_e.itemSize,Ie=le.offset;if(_e.isInstancedInterleavedBuffer||_e.isInstancedBufferAttribute){for(let ve=0;ve<J.locationSize;ve++)m(J.location+ve,_e.meshPerAttribute);k.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=_e.meshPerAttribute*_e.count)}else for(let ve=0;ve<J.locationSize;ve++)p(J.location+ve);s.bindBuffer(s.ARRAY_BUFFER,V);for(let ve=0;ve<J.locationSize;ve++)x(J.location+ve,Le/J.locationSize,he,Se,ce*Ee,(Ie+Le/J.locationSize*ve)*Ee,Fe)}else{if(le.isInstancedBufferAttribute){for(let _e=0;_e<J.locationSize;_e++)m(J.location+_e,le.meshPerAttribute);k.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let _e=0;_e<J.locationSize;_e++)p(J.location+_e);s.bindBuffer(s.ARRAY_BUFFER,V);for(let _e=0;_e<J.locationSize;_e++)x(J.location+_e,Le/J.locationSize,he,Se,Le*Ee,Le/J.locationSize*_e*Ee,Fe)}}else if(W!==void 0){let Se=W[me];if(Se!==void 0)switch(Se.length){case 2:s.vertexAttrib2fv(J.location,Se);break;case 3:s.vertexAttrib3fv(J.location,Se);break;case 4:s.vertexAttrib4fv(J.location,Se);break;default:s.vertexAttrib1fv(J.location,Se)}}}}y()}function w(){F();for(let k in n){let H=n[k];for(let z in H){let U=H[z];for(let q in U){let $=U[q];for(let W in $)u($[W].object),delete $[W];delete U[q]}}delete n[k]}}function T(k){if(n[k.id]===void 0)return;let H=n[k.id];for(let z in H){let U=H[z];for(let q in U){let $=U[q];for(let W in $)u($[W].object),delete $[W];delete U[q]}}delete n[k.id]}function M(k){for(let H in n){let z=n[H];for(let U in z){let q=z[U];if(q[k.id]===void 0)continue;let $=q[k.id];for(let W in $)u($[W].object),delete $[W];delete q[k.id]}}}function S(k){for(let H in n){let z=n[H],U=k.isInstancedMesh===!0?k.id:0,q=z[U];if(q!==void 0){for(let $ in q){let W=q[$];for(let me in W)u(W[me].object),delete W[me];delete q[$]}delete z[U],Object.keys(z).length===0&&delete n[H]}}}function F(){P(),o=!0,r!==i&&(r=i,c(r.object))}function P(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:F,resetDefaultState:P,dispose:w,releaseStatesOfGeometry:T,releaseStatesOfObject:S,releaseStatesOfProgram:M,initAttributes:_,enableAttribute:p,disableUnusedAttributes:y}}function nx(s,e,t){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),t.update(c,n,1)}function o(l,c,u){u!==0&&(s.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let f=0;f<u;f++)h+=c[f];t.update(h,n,1)}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function ix(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){let M=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(M.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(M){return!(M!==ai&&n.convert(M)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(M){let S=M===mi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(M!==Xn&&M!==ti&&!S&&n.convert(M)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(M){if(M==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";M="mediump"}return M==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(it("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&d===!1;t.reversedDepthBuffer===!0&&d===!1&&it("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&d===!0&&it("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),w=s.getParameter(s.MAX_SAMPLES),T=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:y,maxVaryings:x,maxFragmentUniforms:v,maxSamples:w,samples:T}}function sx(s){let e=this,t=null,n=0,i=!1,r=!1,o=new Un,a=new mt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||i;return i=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){let g=d.clippingPlanes,_=d.clipIntersection,p=d.clipShadows,m=s.get(d);if(!i||g===null||g.length===0||r&&!p)r?u(null):c();else{let y=r?0:n,x=y*4,v=m.clippingState||null;l.value=v,v=u(g,h,x,f);for(let w=0;w!==x;++w)v[w]=t[w];m.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,g){let _=d!==null?d.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=f+_*4,y=h.matrixWorldInverse;a.getNormalMatrix(y),(p===null||p.length<m)&&(p=new Float32Array(m));for(let x=0,v=f;x!==_;++x,v+=4)o.copy(d[x]).applyMatrix4(y,a),o.normal.toArray(p,v),p[v+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,p}}var _a=class extends jn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new zo(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new bi(5,5,5),r=new Ei({name:"CubemapFromEquirect",uniforms:nr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:zn,blending:$s});r.uniforms.tEquirect.value=t;let o=new Jt(i,r),a=t.minFilter;return t.minFilter===oi&&(t.minFilter=yn),new Zr(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}},Sp=256,rx=3,ox=20,qp=256,Yp=16,ax=3,lx=new D,cx=new nt,Oc=class s{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Zr(1,10,null),this._boxMesh=new Jt(new bi(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){let{size:o=256,position:a=lx}=r,l=this._renderer;this._setSize(o);let c=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);let d=l.autoClear,h=l.autoClearColor,f=l.autoClearDepth,g=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(cx));let p=new Zr(n,i,u);return p.position.copy(a),p.update(l,e),l.autoClear=d,l.autoClearColor=h,l.autoClearDepth=f,l.autoClearStencil=g,e.background=_,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=wp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Sp,fu(e))}_fromTexture(e,t){e.mapping===Qs||e.mapping===jr?this._setSize(e.image.length===0?Sp:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Ep(e,!1,!1),n=Math.log2(e)-rx;for(let i=0;i<=n;i++)t.texture.mipmaps.push({width:e>>i,height:e>>i});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Ep(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let i=this._boxMesh,r=this._cubeCamera;i.material=n,r.renderTarget=e,r.activeMipmapLevel=t;let o=e.width>>t;e.viewport.set(0,0,o,o),r.update(this._renderer,i),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Qs||e.mapping===jr?(this._cubemapMaterial===null&&(this._cubemapMaterial=wp()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Tp()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=hx(),this._integrationMaterial=ux());let t=this._cubeSize,n=e.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Yp);for(let o=0;o<=n;o++){let a=s.lodToRoughness(o,n);if(o>n-ax)r.roughness.value=a,this._renderCube(e,o,this._integrationMaterial);else{let l=a>0?Math.log2(t)+.5*Math.log2(6/(qp*Math.pow(a,4)))+.5:0;i.roughness.value=a,i.lodBias.value=l,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=dx());let n=this._blurMaterial,i=n.uniforms,r=this._sourceTarget;i.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,i.envMap.value=r.texture,this._renderCube(e,0,n),i.envMap.value=e.texture,this._renderCube(r,0,n)}};function Ep(s,e,t){return new _a(s,{minFilter:oi,generateMipmaps:e,type:mi,colorSpace:On,depthBuffer:t})}function ya(s,e,t){return new Ei({name:s,uniforms:e,vertexShader:St.cube_vert,fragmentShader:t,side:zn,blending:$s,depthTest:!1,depthWrite:!1})}function hx(){return ya("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${qp}u

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
	`)}function ux(){return ya("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Yp}},`

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
	`)}function dx(){return ya("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ox}
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
	`)}function Tp(){return ya("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function wp(){return ya("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function fx(s){let e=new WeakMap,t=new WeakMap,n=null;function i(h,f=!1){return h==null?null:f?o(h):r(h)}function r(h){if(h&&h.isTexture){let f=h.mapping;if(f===Wl||f===Xl)if(e.has(h)){let g=e.get(h).texture;return a(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let _=new _a(g.height);return _.fromEquirectangularTexture(s,h),e.set(h,_),h.addEventListener("dispose",c),a(_.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let f=h.mapping,g=f===Wl||f===Xl,_=f===Qs||f===jr;if(g||_){let p=t.get(h),m=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new Oc(s)),p=g?n.fromEquirectangular(h,p):n.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),p.texture;if(p!==void 0)return p.texture;{let y=h.image;return g&&y&&y.height>0||_&&y&&l(y)?(n===null&&(n=new Oc(s)),p=g?n.fromEquirectangular(h):n.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,t.set(h,p),h.addEventListener("dispose",u),p.texture):null}}}return h}function a(h,f){return f===Wl?h.mapping=Qs:f===Xl&&(h.mapping=jr),h}function l(h){let f=0,g=6;for(let _=0;_<g;_++)h[_]!==void 0&&f++;return f===g}function c(h){let f=h.target;f.removeEventListener("dispose",c);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(h){let f=h.target;f.removeEventListener("dispose",u);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:d}}function px(s){let e={};function t(n){if(e[n]!==void 0)return e[n];let i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let i=t(n);return i===null&&Ds("WebGLRenderer: "+n+" extension not supported."),i}}}function mx(s,e,t,n){let i={},r=new WeakMap,o=new FinalizationRegistry(g=>delete i[g]);function a(g){l(g.target)}function l(g){g.index!==null&&e.remove(g.index);for(let p in g.attributes)e.remove(g.attributes[p]);g.removeEventListener("dispose",a),delete i[g.id],o.unregister(g);let _=r.get(g);_&&(e.remove(_),r.delete(g)),n.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,t.memory.geometries--}function c(g,_){return i[_.id]!==void 0||(_.addEventListener("dispose",a),i[_.id]=new WeakRef(_),o.register(_,_.id,_),t.memory.geometries++),_}function u(g){let _=g.attributes;for(let p in _)e.update(_[p],s.ARRAY_BUFFER)}function d(g){let _=g.index,p=g.attributes.position,m=0;if(p===void 0)return;let y=_!==null?_.array.length:p.array.length/3-1,x=p.count>=65535?No:Do,v=new x(Math.ceil(y/3)*6,1),w=v.array;if(_!==null){let M=_.array;m=_.version;for(let S=0,F=0;S<y;S+=3){let P=M[S+0],k=M[S+1],H=M[S+2];w[F++]=P,w[F++]=k,w[F++]=k,w[F++]=H,w[F++]=H,w[F++]=P}}else{m=p.version;for(let M=0,S=0;M<y;M+=3){let F=M+0,P=M+1,k=M+2;w[S++]=F,w[S++]=P,w[S++]=P,w[S++]=k,w[S++]=k,w[S++]=F}}v.version=m;let T=r.get(g);T&&e.remove(T),r.set(g,v)}function h(g){let _=r.get(g);if(_){let p=g.index;p!==null&&_.version<p.version&&d(g)}else d(g);return r.get(g)}function f(){for(let g in i){let _=i[g].deref();_!==void 0&&l(_)}}return{get:c,update:u,getWireframeAttribute:h,dispose:f}}function gx(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,h){s.drawElements(n,h,r,d*o),t.update(h,n,1)}function c(d,h,f){f!==0&&(s.drawElementsInstanced(n,h,r,d*o,f),t.update(h,n,f))}function u(d,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,f);let _=0;for(let p=0;p<f;p++)_+=h[p];t.update(_,n,1)}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function _x(s){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:ht("WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function yx(s,e,t){let n=new WeakMap,i=new qt;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(a);if(h===void 0||h.count!==d){let F=function(){M.dispose(),n.delete(a),a.removeEventListener("dispose",F)};h!==void 0&&h.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],x=0;f===!0&&(x=1),g===!0&&(x=2),_===!0&&(x=3);let v=a.attributes.position.count*x,w=1;v>e.maxTextureSize&&(w=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let T=new Float32Array(v*w*4*d),M=new Po(T,v,w,d);M.type=ti,M.needsUpdate=!0;let S=x*4;for(let P=0;P<d;P++){let k=p[P],H=m[P],z=y[P],U=v*w*4*P;for(let q=0;q<k.count;q++){let $=q*S;f===!0&&(i.fromBufferAttribute(k,q),T[U+$+0]=i.x,T[U+$+1]=i.y,T[U+$+2]=i.z,T[U+$+3]=0),g===!0&&(i.fromBufferAttribute(H,q),T[U+$+4]=i.x,T[U+$+5]=i.y,T[U+$+6]=i.z,T[U+$+7]=0),_===!0&&(i.fromBufferAttribute(z,q),T[U+$+8]=i.x,T[U+$+9]=i.y,T[U+$+10]=i.z,T[U+$+11]=z.itemSize===4?i.w:1)}}h={count:d,texture:M,size:new be(v,w)},n.set(a,h),a.addEventListener("dispose",F)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function xx(s,e,t,n,i){let r=new WeakMap;function o(c){let u=i.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return h}function a(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var vx={[Yh]:"LINEAR_TONE_MAPPING",[Kh]:"REINHARD_TONE_MAPPING",[Zh]:"CINEON_TONE_MAPPING",[aa]:"ACES_FILMIC_TONE_MAPPING",[Jh]:"AGX_TONE_MAPPING",[jh]:"NEUTRAL_TONE_MAPPING",[$h]:"CUSTOM_TONE_MAPPING"};function Mx(s,e,t,n,i,r){let o=new jn(e,t,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,u=new en;u.setAttribute("position",new wt([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new wt([0,2,0,0,2,0],2));let d=new Dl({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Jt(u,d),f=new Ks(-1,1,1,-1,0,1),g=null,_=null,p=!1,m,y=null,x=[],v=!1;this.setSize=function(w,T){o.setSize(w,T),a!==null&&a.setSize(w,T),l!==null&&l.setSize(w,T);for(let M=0;M<x.length;M++){let S=x[M];S.setSize&&S.setSize(w,T)}},this.setEffects=function(w){x=w,v=x.length>0&&x[0].isRenderPass===!0;let T=o.width,M=o.height;x.length>0&&a===null&&(a=new jn(T,M,{type:mi,depthBuffer:!1,stencilBuffer:!1}),l=new jn(T,M,{type:mi,depthBuffer:!1,stencilBuffer:!1}));let S=i===!0&&x.some(F=>F.needsDepthTexture===!0);S!==(o.depthTexture!==null)&&(S===!0&&c===null&&(c=new Zi(T,M),r===!0&&(c.format=ts,c.type=tr)),o.dispose(),o.depthTexture=S?c:null,o.resolveDepthBuffer=S,o.storeMultisampledDepthBuffer=S);for(let F=0;F<x.length;F++){let P=x[F];P.setSize&&P.setSize(T,M),S&&P.needsDepthTexture===!0&&P.setDepthTexture&&P.setDepthTexture(c)}},this.begin=function(w,T){if(p||w.toneMapping===Ci&&x.length===0)return!1;if(y=T,T!==null){let M=T.width,S=T.height;(o.width!==M||o.height!==S)&&this.setSize(M,S)}return v===!1&&w.setRenderTarget(o),m=w.toneMapping,w.toneMapping=Ci,!0},this.hasRenderPass=function(){return v},this.end=function(w,T){w.toneMapping=m,p=!0;let M=o,S=a;for(let F=0;F<x.length;F++){let P=x[F];P.enabled!==!1&&(P.render(w,S,M,T),P.needsSwap!==!1&&(M=S,S=S===a?l:a))}if(g!==w.outputColorSpace||_!==w.toneMapping){g=w.outputColorSpace,_=w.toneMapping,d.defines={},Tt.getTransfer(g)===Gt&&(d.defines.SRGB_TRANSFER="");let F=vx[_];F&&(d.defines[F]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=M.texture,w.setRenderTarget(y),w.render(h,f),y=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),d.dispose()}}var Kp=new cn,Zp=new Zi(1,1),$p=new Ho(1),Jp=new Po,jp=new Tl,Qp=new zo,Ap=[],Rp=[],Cp=new Float32Array(16),Pp=new Float32Array(9),Ip=new Float32Array(4);function io(s,e,t){let n=s[0];if(n<=0||n>0)return s;let i=e*t,r=Ap[i];if(r===void 0&&(r=new Float32Array(i),Ap[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function xn(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function vn(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function Bc(s,e){let t=Rp[e];t===void 0&&(t=new Int32Array(e),Rp[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function bx(s,e){let t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Sx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xn(t,e))return;s.uniform2fv(this.addr,e),vn(t,e)}}function Ex(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(xn(t,e))return;s.uniform3fv(this.addr,e),vn(t,e)}}function Tx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xn(t,e))return;s.uniform4fv(this.addr,e),vn(t,e)}}function wx(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(xn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),vn(t,e)}else{if(xn(t,n))return;Ip.set(n),s.uniformMatrix2fv(this.addr,!1,Ip),vn(t,n)}}function Ax(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(xn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),vn(t,e)}else{if(xn(t,n))return;Pp.set(n),s.uniformMatrix3fv(this.addr,!1,Pp),vn(t,n)}}function Rx(s,e){let t=this.cache,n=e.elements;if(n===void 0){if(xn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),vn(t,e)}else{if(xn(t,n))return;Cp.set(n),s.uniformMatrix4fv(this.addr,!1,Cp),vn(t,n)}}function Cx(s,e){let t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Px(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xn(t,e))return;s.uniform2iv(this.addr,e),vn(t,e)}}function Ix(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(xn(t,e))return;s.uniform3iv(this.addr,e),vn(t,e)}}function Lx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xn(t,e))return;s.uniform4iv(this.addr,e),vn(t,e)}}function Dx(s,e){let t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Nx(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(xn(t,e))return;s.uniform2uiv(this.addr,e),vn(t,e)}}function Ux(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(xn(t,e))return;s.uniform3uiv(this.addr,e),vn(t,e)}}function Ox(s,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(xn(t,e))return;s.uniform4uiv(this.addr,e),vn(t,e)}}function kc(s){return s.version===0&&(s.compareFunction=cu,s.needsUpdate=!0),s}function Fx(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?r=kc(Zp):r=Kp,t.setTexture2D(e||r,i)}function Bx(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||jp,i)}function kx(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_CUBE_SHADOW?r=kc($p):r=Qp,t.setTextureCube(e||r,i)}function zx(s,e,t){let n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Jp,i)}function Hx(s){switch(s){case 5126:return bx;case 35664:return Sx;case 35665:return Ex;case 35666:return Tx;case 35674:return wx;case 35675:return Ax;case 35676:return Rx;case 5124:case 35670:return Cx;case 35667:case 35671:return Px;case 35668:case 35672:return Ix;case 35669:case 35673:return Lx;case 5125:return Dx;case 36294:return Nx;case 36295:return Ux;case 36296:return Ox;case 35678:case 36198:case 36298:case 36306:case 35682:return Fx;case 35679:case 36299:case 36307:return Bx;case 35680:case 36300:case 36308:case 36293:return kx;case 36289:case 36303:case 36311:case 36292:return zx}}function Gx(s,e){s.uniform1fv(this.addr,e)}function Vx(s,e){let t=io(e,this.size,2);s.uniform2fv(this.addr,t)}function Wx(s,e){let t=io(e,this.size,3);s.uniform3fv(this.addr,t)}function Xx(s,e){let t=io(e,this.size,4);s.uniform4fv(this.addr,t)}function qx(s,e){let t=io(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Yx(s,e){let t=io(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Kx(s,e){let t=io(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Zx(s,e){s.uniform1iv(this.addr,e)}function $x(s,e){s.uniform2iv(this.addr,e)}function Jx(s,e){s.uniform3iv(this.addr,e)}function jx(s,e){s.uniform4iv(this.addr,e)}function Qx(s,e){s.uniform1uiv(this.addr,e)}function ev(s,e){s.uniform2uiv(this.addr,e)}function tv(s,e){s.uniform3uiv(this.addr,e)}function nv(s,e){s.uniform4uiv(this.addr,e)}function iv(s,e,t){let n=this.cache,i=e.length,r=Bc(t,i);xn(n,r)||(s.uniform1iv(this.addr,r),vn(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=kc(Zp):o=Kp;for(let a=0;a!==i;++a)t.setTexture2D(e[a]||o,r[a])}function sv(s,e,t){let n=this.cache,i=e.length,r=Bc(t,i);xn(n,r)||(s.uniform1iv(this.addr,r),vn(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||jp,r[o])}function rv(s,e,t){let n=this.cache,i=e.length,r=Bc(t,i);xn(n,r)||(s.uniform1iv(this.addr,r),vn(n,r));let o;this.type===s.SAMPLER_CUBE_SHADOW?o=kc($p):o=Qp;for(let a=0;a!==i;++a)t.setTextureCube(e[a]||o,r[a])}function ov(s,e,t){let n=this.cache,i=e.length,r=Bc(t,i);xn(n,r)||(s.uniform1iv(this.addr,r),vn(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||Jp,r[o])}function av(s){switch(s){case 5126:return Gx;case 35664:return Vx;case 35665:return Wx;case 35666:return Xx;case 35674:return qx;case 35675:return Yx;case 35676:return Kx;case 5124:case 35670:return Zx;case 35667:case 35671:return $x;case 35668:case 35672:return Jx;case 35669:case 35673:return jx;case 5125:return Qx;case 36294:return ev;case 36295:return tv;case 36296:return nv;case 35678:case 36198:case 36298:case 36306:case 35682:return iv;case 35679:case 36299:case 36307:return sv;case 35680:case 36300:case 36308:case 36293:return rv;case 36289:case 36303:case 36311:case 36292:return ov}}var Su=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Hx(t.type)}},Eu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=av(t.type)}},Tu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(e,t[a.id],n)}}},Mu=/(\w+)(\])?(\[|\.)?/g;function Lp(s,e){s.seq.push(e),s.map[e.id]=e}function lv(s,e,t){let n=s.name,i=n.length;for(Mu.lastIndex=0;;){let r=Mu.exec(n),o=Mu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Lp(t,c===void 0?new Su(a,s,e):new Eu(a,s,e));break}else{let d=t.map[a];d===void 0&&(d=new Tu(a),Lp(t,d)),t=d}}}var no=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);lv(a,l,this)}let i=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){let r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){let i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){let n=[];for(let i=0,r=e.length;i!==r;++i){let o=e[i];o.id in t&&n.push(o)}return n}};function Dp(s,e,t){let n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}var cv=37297,hv=0;function uv(s,e){let t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Np=new mt;function dv(s){Tt._getMatrix(Np,Tt.workingColorSpace,s);let e=`mat3( ${Np.elements.map(t=>t.toFixed(4))} )`;switch(Tt.getTransfer(s)){case Ro:return[e,"LinearTransferOETF"];case Gt:return[e,"sRGBTransferOETF"];default:return it("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Up(s,e,t){let n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+uv(s.getShaderSource(e),a)}else return r}function fv(s,e){let t=dv(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var pv={[Yh]:"Linear",[Kh]:"Reinhard",[Zh]:"Cineon",[aa]:"ACESFilmic",[Jh]:"AgX",[jh]:"Neutral",[$h]:"Custom"};function mv(s,e){let t=pv[e];return t===void 0?(it("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Uc=new D;function gv(){Tt.getLuminanceCoefficients(Uc);let s=Uc.x.toFixed(4),e=Uc.y.toFixed(4),t=Uc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function _v(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ga).join(`
`)}function yv(s){let e=[];for(let t in s){let n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function xv(s,e){let t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(e,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function ga(s){return s!==""}function Op(s,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Fp(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var vv=/^[ \t]*#include +<([\w\d./]+)>/gm;function wu(s){return s.replace(vv,Mv)}function Mv(s,e){let t=St[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return wu(t)}var bv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bp(s){return s.replace(bv,Sv)}function Sv(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function kp(s){let e=`precision ${s.precision} float;
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
#define LOW_PRECISION`),e}var Ev={[Zs]:"SHADOWMAP_TYPE_PCF",[Jr]:"SHADOWMAP_TYPE_VSM"};function Tv(s){return Ev[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var wv={[jr]:"ENVMAP_MODE_REFRACTION"};function Av(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":wv[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Rv={[qh]:"ENVMAP_BLENDING_MULTIPLY",[$f]:"ENVMAP_BLENDING_MIX",[Jf]:"ENVMAP_BLENDING_ADD"};function Cv(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":Rv[s.combine]||"ENVMAP_BLENDING_NONE"}function Pv(s,e,t,n){let i=s.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Tv(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=Av(t),d=Cv(t),h=_v(t),f=yv(r),g=i.createProgram(),_,p,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ga).join(`
`),_.length>0&&(_+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter(ga).join(`
`),p.length>0&&(p+=`
`)):(_=[kp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ga).join(`
`),p=[kp(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ci?"#define TONE_MAPPING":"",t.toneMapping!==Ci?St.tonemapping_pars_fragment:"",t.toneMapping!==Ci?mv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",St.colorspace_pars_fragment,fv("linearToOutputTexel",t.outputColorSpace),gv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ga).join(`
`)),o=wu(o),o=Op(o,t),o=Fp(o,t),a=wu(a),a=Op(a,t),a=Fp(a,t),o=Bp(o),a=Bp(a),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,_=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,p=["#define varying in",t.glslVersion===uu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===uu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let y=m+_+o,x=m+p+a,v=Dp(i,i.VERTEX_SHADER,y),w=Dp(i,i.FRAGMENT_SHADER,x);i.attachShader(g,v),i.attachShader(g,w),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.hasPositionAttribute===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function T(P){if(s.debug.checkShaderErrors){let k=i.getProgramInfoLog(g)||"",H=i.getShaderInfoLog(v)||"",z=i.getShaderInfoLog(w)||"",U=k.trim(),q=H.trim(),$=z.trim(),W=!0,me=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(W=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,g,v,w);else{let J=Up(i,v,"vertex"),le=Up(i,w,"fragment");ht("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+U+`
`+J+`
`+le)}else U!==""?it("WebGLProgram: Program Info Log:",U):(q===""||$==="")&&(me=!1);me&&(P.diagnostics={runnable:W,programLog:U,vertexShader:{log:q,prefix:_},fragmentShader:{log:$,prefix:p}})}i.deleteShader(v),i.deleteShader(w),M=new no(i,g),S=xv(i,g)}let M;this.getUniforms=function(){return M===void 0&&T(this),M};let S;this.getAttributes=function(){return S===void 0&&T(this),S};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=i.getProgramParameter(g,cv)),F},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=hv++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=v,this.fragmentShader=w,this}var Iv=0,Au=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let i=this._getShaderCacheForMaterial(e);return i.has(t)===!1&&(i.add(t),t.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ru(e),t.set(e,n)),n}},Ru=class{constructor(e){this.id=Iv++,this.code=e,this.usedTimes=0}};function Lv(s){return s===bs||s===da||s===fa}function Dv(s,e,t,n,i,r){let o=new Nr,a=new Au,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(M){return l.add(M),M===0?"uv":`uv${M}`}function g(M,S,F,P,k,H){let z=P.fog,U=k.geometry,q=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?P.environment:null,$=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap,W=e.get(M.envMap||q,$),me=h[M.type],J=n.precision;M.precision!==null&&(J=n.getMaxPrecision(M.precision),J!==M.precision&&it("WebGLProgram.getParameters:",M.precision,"not supported, using",J,"instead."));let le=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Se=le!==void 0?le.length:0,Le=0;U.morphAttributes.position!==void 0&&(Le=1),U.morphAttributes.normal!==void 0&&(Le=2),U.morphAttributes.color!==void 0&&(Le=3);let et,V,he,Ee;if(me){let Oe=Ii[me];et=Oe.vertexShader,V=Oe.fragmentShader}else{et=M.vertexShader,V=M.fragmentShader;let Oe=a.getVertexShaderStage(M),Dt=a.getFragmentShaderStage(M);a.update(M,Oe,Dt),he=Oe.id,Ee=Dt.id}let Fe=s.getRenderTarget(),_e=s.state.buffers.depth.getReversed(),ce=k.isInstancedMesh===!0,Ie=k.isBatchedMesh===!0,ve=!!M.map,Ne=!!M.matcap,je=!!W,Ke=je&&W.isPMREMTexture===!0,st=!!M.aoMap,gt=!!M.lightMap,Pt=!!M.bumpMap&&M.wireframe===!1,yt=!!M.normalMap,zt=!!M.displacementMap,rt=!!M.emissiveMap,Ft=!!M.metalnessMap,sn=!!M.roughnessMap,rn=M.anisotropy>0,X=M.clearcoat>0,ft=M.diffuseRoughness>0,It=M.dispersion>0,Ut=M.retroreflectivity>0,Me=M.iridescence>0,Re=M.sheen>0,Ve=M.transmission>0,ke=rn&&!!M.anisotropyMap,L=X&&!!M.clearcoatMap,E=X&&!!M.clearcoatNormalMap,Q=X&&!!M.clearcoatRoughnessMap,we=ft&&!!M.diffuseRoughnessMap,ye=Me&&!!M.iridescenceMap,de=Me&&!!M.iridescenceThicknessMap,re=Re&&!!M.sheenColorMap,N=Re&&!!M.sheenRoughnessMap,fe=!!M.specularMap,Ce=!!M.specularColorMap,B=!!M.specularIntensityMap,xe=Ve&&!!M.transmissionMap,K=Ve&&!!M.thicknessMap,oe=!!M.gradientMap,ge=!!M.alphaMap,Te=M.alphaTest>0,We=!!M.alphaHash,ot=!!M.extensions,Ae=Ci;M.toneMapped&&(Fe===null||Fe.isXRRenderTarget===!0)&&(Ae=s.toneMapping);let Qe=Ke?W.isCompressedCubeTexture?W.image[0].mipmaps:W.mipmaps:null,_t={shaderID:me,shaderType:M.type,shaderName:M.name,vertexShader:et,fragmentShader:V,defines:M.defines,customVertexShaderID:he,customFragmentShaderID:Ee,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:J,batching:Ie,batchingColor:Ie&&k._colorsTexture!==null,instancing:ce,instancingColor:ce&&k.instanceColor!==null,instancingMorph:ce&&k.morphTexture!==null,outputColorSpace:Fe===null?s.outputColorSpace:Fe.isXRRenderTarget===!0?Fe.texture.colorSpace:Tt.workingColorSpace,alphaToCoverage:!!M.alphaToCoverage,map:ve,matcap:Ne,envMap:je,envMapMode:je&&W.mapping,envMapPMREM:Ke,envMapMaxLod:Ke?Qe.length-1:null,envMapSize:Ke?Qe[0].width:null,aoMap:st,lightMap:gt,bumpMap:Pt,normalMap:yt,displacementMap:zt,emissiveMap:rt,normalMapObjectSpace:yt&&M.normalMapType===ip,normalMapTangentSpace:yt&&M.normalMapType===Lc,packedNormalMap:yt&&M.normalMapType===Lc&&Lv(M.normalMap.format),metalnessMap:Ft,roughnessMap:sn,anisotropy:rn,anisotropyMap:ke,clearcoat:X,clearcoatMap:L,clearcoatNormalMap:E,clearcoatRoughnessMap:Q,diffuseRoughness:ft,diffuseRoughnessMap:we,dispersion:It,retroreflection:Ut,iridescence:Me,iridescenceMap:ye,iridescenceThicknessMap:de,sheen:Re,sheenColorMap:re,sheenRoughnessMap:N,specularMap:fe,specularColorMap:Ce,specularIntensityMap:B,transmission:Ve,transmissionMap:xe,thicknessMap:K,gradientMap:oe,opaque:M.transparent===!1&&M.blending===Ms&&M.alphaToCoverage===!1,alphaMap:ge,alphaTest:Te,alphaHash:We,combine:M.combine,mapUv:ve&&f(M.map.channel),aoMapUv:st&&f(M.aoMap.channel),lightMapUv:gt&&f(M.lightMap.channel),bumpMapUv:Pt&&f(M.bumpMap.channel),normalMapUv:yt&&f(M.normalMap.channel),displacementMapUv:zt&&f(M.displacementMap.channel),emissiveMapUv:rt&&f(M.emissiveMap.channel),metalnessMapUv:Ft&&f(M.metalnessMap.channel),roughnessMapUv:sn&&f(M.roughnessMap.channel),anisotropyMapUv:ke&&f(M.anisotropyMap.channel),clearcoatMapUv:L&&f(M.clearcoatMap.channel),clearcoatNormalMapUv:E&&f(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&f(M.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:we&&f(M.diffuseRoughnessMap.channel),iridescenceMapUv:ye&&f(M.iridescenceMap.channel),iridescenceThicknessMapUv:de&&f(M.iridescenceThicknessMap.channel),sheenColorMapUv:re&&f(M.sheenColorMap.channel),sheenRoughnessMapUv:N&&f(M.sheenRoughnessMap.channel),specularMapUv:fe&&f(M.specularMap.channel),specularColorMapUv:Ce&&f(M.specularColorMap.channel),specularIntensityMapUv:B&&f(M.specularIntensityMap.channel),transmissionMapUv:xe&&f(M.transmissionMap.channel),thicknessMapUv:K&&f(M.thicknessMap.channel),alphaMapUv:ge&&f(M.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(yt||rn),vertexNormals:!!U.attributes.normal,vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!U.attributes.uv&&(ve||ge),fog:!!z,useFog:M.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:M.wireframe===!1&&(M.flatShading===!0||U.attributes.normal===void 0&&yt===!1&&(M.isMeshLambertMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isMeshPhysicalMaterial)),sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:_e,skinning:k.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Se,morphTextureStride:Le,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:H.filter(Oe=>Oe.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&F.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ae,decodeVideoTexture:ve&&M.map.isVideoTexture===!0&&Tt.getTransfer(M.map.colorSpace)===Gt,decodeVideoTextureEmissive:rt&&M.emissiveMap.isVideoTexture===!0&&Tt.getTransfer(M.emissiveMap.colorSpace)===Gt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Tn,flipSided:M.side===zn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:ot&&M.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ot&&M.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return _t.vertexUv1s=l.has(1),_t.vertexUv2s=l.has(2),_t.vertexUv3s=l.has(3),l.clear(),_t}function _(M){let S=[];if(M.shaderID?S.push(M.shaderID):(S.push(M.customVertexShaderID),S.push(M.customFragmentShaderID)),M.defines!==void 0)for(let F in M.defines)S.push(F),S.push(M.defines[F]);return M.isRawShaderMaterial===!1&&(p(S,M),m(S,M),S.push(s.outputColorSpace)),S.push(M.customProgramCacheKey),S.join()}function p(M,S){M.push(S.precision),M.push(S.outputColorSpace),M.push(S.envMapMode),M.push(S.envMapPMREM),M.push(S.envMapMaxLod),M.push(S.envMapSize),M.push(S.mapUv),M.push(S.alphaMapUv),M.push(S.lightMapUv),M.push(S.aoMapUv),M.push(S.bumpMapUv),M.push(S.normalMapUv),M.push(S.displacementMapUv),M.push(S.emissiveMapUv),M.push(S.metalnessMapUv),M.push(S.roughnessMapUv),M.push(S.anisotropyMapUv),M.push(S.clearcoatMapUv),M.push(S.clearcoatNormalMapUv),M.push(S.clearcoatRoughnessMapUv),M.push(S.diffuseRoughnessMapUv),M.push(S.iridescenceMapUv),M.push(S.iridescenceThicknessMapUv),M.push(S.sheenColorMapUv),M.push(S.sheenRoughnessMapUv),M.push(S.specularMapUv),M.push(S.specularColorMapUv),M.push(S.specularIntensityMapUv),M.push(S.transmissionMapUv),M.push(S.thicknessMapUv),M.push(S.combine),M.push(S.fogExp2),M.push(S.sizeAttenuation),M.push(S.morphTargetsCount),M.push(S.numSunLights),M.push(S.numDirLights),M.push(S.numPointLights),M.push(S.numSpotLights),M.push(S.numSpotLightMaps),M.push(S.numHemiLights),M.push(S.numRectAreaLights),M.push(S.numSunLightShadows),M.push(S.numDirLightShadows),M.push(S.numPointLightShadows),M.push(S.numSpotLightShadows),M.push(S.numSpotLightShadowsWithMaps),M.push(S.numLightProbes),M.push(S.numLightProbeGrids),M.push(S.shadowMapType),M.push(S.toneMapping),M.push(S.numClippingPlanes),M.push(S.numClipIntersection),M.push(S.depthPacking)}function m(M,S){o.disableAll(),S.instancing&&o.enable(0),S.instancingColor&&o.enable(1),S.instancingMorph&&o.enable(2),S.matcap&&o.enable(3),S.envMap&&o.enable(4),S.normalMapObjectSpace&&o.enable(5),S.normalMapTangentSpace&&o.enable(6),S.clearcoat&&o.enable(7),S.iridescence&&o.enable(8),S.alphaTest&&o.enable(9),S.vertexColors&&o.enable(10),S.vertexAlphas&&o.enable(11),S.vertexUv1s&&o.enable(12),S.vertexUv2s&&o.enable(13),S.vertexUv3s&&o.enable(14),S.vertexTangents&&o.enable(15),S.anisotropy&&o.enable(16),S.alphaHash&&o.enable(17),S.batching&&o.enable(18),S.dispersion&&o.enable(19),S.retroreflection&&o.enable(24),S.diffuseRoughness&&o.enable(25),S.batchingColor&&o.enable(20),S.gradientMap&&o.enable(21),S.packedNormalMap&&o.enable(22),S.vertexNormals&&o.enable(23),M.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reversedDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),S.numLightProbeGrids>0&&o.enable(22),S.hasPositionAttribute&&o.enable(23),M.push(o.mask)}function y(M){let S=h[M.type],F;if(S){let P=Ii[S];F=vp.clone(P.uniforms)}else F=M.uniforms;return F}function x(M,S){let F=u.get(S);return F!==void 0?++F.usedTimes:(F=new Pv(s,S,M,i),c.push(F),u.set(S,F)),F}function v(M){if(--M.usedTimes===0){let S=c.indexOf(M);c[S]=c[c.length-1],c.pop(),u.delete(M.cacheKey),M.destroy()}}function w(M){a.remove(M)}function T(){a.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:y,acquireProgram:x,releaseProgram:v,releaseShaderCache:w,programs:c,dispose:T}}function Nv(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function Uv(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function zp(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Hp(){let s=[],e=0,t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(h){let f=0;return h.isInstancedMesh&&(f+=2),h.isSkinnedMesh&&(f+=1),f}function a(h,f,g,_,p,m){let y=s[e];return y===void 0?(y={id:h.id,object:h,geometry:f,material:g,materialVariant:o(h),groupOrder:_,renderOrder:h.renderOrder,z:p,group:m},s[e]=y):(y.id=h.id,y.object=h,y.geometry=f,y.material=g,y.materialVariant=o(h),y.groupOrder=_,y.renderOrder=h.renderOrder,y.z=p,y.group=m),e++,y}function l(h,f,g,_,p,m,y){y.reversedDepth===!0&&(p=-p);let x=a(h,f,g,_,p,m);g.transmission>0?n.push(x):g.transparent===!0?i.push(x):t.push(x)}function c(h,f,g,_,p,m){let y=a(h,f,g,_,p,m);g.transmission>0?n.unshift(y):g.transparent===!0?i.unshift(y):t.unshift(y)}function u(h,f){t.length>1&&t.sort(h||Uv),n.length>1&&n.sort(f||zp),i.length>1&&i.sort(f||zp)}function d(){for(let h=e,f=s.length;h<f;h++){let g=s[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:d,sort:u}}function Ov(){let s=new WeakMap;function e(n,i){let r=s.get(n),o;return r===void 0?(o=new Hp,s.set(n,[o])):i>=r.length?(o=new Hp,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function Fv(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new nt};break;case"SpotLight":t={position:new D,direction:new D,color:new nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new nt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new nt,groundColor:new nt};break;case"RectAreaLight":t={color:new nt,position:new D,halfWidth:new D,halfHeight:new D};break}return s[e.id]=t,t}}}function Bv(){let s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new be,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}var kv=0;function zv(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Hv(s){let e=new Fv,t=Bv(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);let i=new D,r=new dt,o=new dt;function a(c){let u=0,d=0,h=0;for(let H=0;H<9;H++)n.probe[H].set(0,0,0);let f=0,g=0,_=0,p=0,m=0,y=0,x=0,v=0,w=0,T=0,M=0,S=0,F=0,P=0;c.sort(zv);for(let H=0,z=c.length;H<z;H++){let U=c[H],q=U.color,$=U.intensity,W=U.distance,me=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===bs?me=U.shadow.map.texture:me=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)u+=q.r*$,d+=q.g*$,h+=q.b*$;else if(U.isLightProbe){for(let J=0;J<9;J++)n.probe[J].addScaledVector(U.sh.coefficients[J],$);P++}else if(U.isSunLight){let J=e.get(U);if(J.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let le=U.shadow,Se=t.get(U);Se.shadowIntensity=le.intensity,Se.shadowBias=le.bias,Se.shadowNormalBias=le.normalBias,Se.shadowRadius=le.radius,Se.shadowMapSize.copy(le.mapSize).multiply(le.getFrameExtents()),n.sunShadow[g]=Se,n.sunShadowMap[g]=me;let Le=le.getViewportCount();for(let et=0;et<Le;et++)n.sunShadowMatrix[_+et]=le.getMatrix(et),n.sunShadowCascade[_+et]=le._cascadeData[et];_+=Le,g++}n.sun[f]=J,f++}else if(U.isDirectionalLight){let J=e.get(U);if(J.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let le=U.shadow,Se=t.get(U);Se.shadowIntensity=le.intensity,Se.shadowBias=le.bias,Se.shadowNormalBias=le.normalBias,Se.shadowRadius=le.radius,Se.shadowMapSize=le.mapSize,n.directionalShadow[p]=Se,n.directionalShadowMap[p]=me,n.directionalShadowMatrix[p]=U.shadow.matrix,w++}n.directional[p]=J,p++}else if(U.isSpotLight){let J=e.get(U);J.position.setFromMatrixPosition(U.matrixWorld),J.color.copy(q).multiplyScalar($),J.distance=W,J.coneCos=Math.cos(U.angle),J.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),J.decay=U.decay,n.spot[y]=J;let le=U.shadow;if(U.map&&(n.spotLightMap[S]=U.map,S++,le.updateMatrices(U),U.castShadow&&F++),n.spotLightMatrix[y]=le.matrix,U.castShadow){let Se=t.get(U);Se.shadowIntensity=le.intensity,Se.shadowBias=le.bias,Se.shadowNormalBias=le.normalBias,Se.shadowRadius=le.radius,Se.shadowMapSize=le.mapSize,n.spotShadow[y]=Se,n.spotShadowMap[y]=me,M++}y++}else if(U.isRectAreaLight){let J=e.get(U);J.color.copy(q).multiplyScalar($),J.halfWidth.set(U.width*.5,0,0),J.halfHeight.set(0,U.height*.5,0),n.rectArea[x]=J,x++}else if(U.isPointLight){let J=e.get(U);if(J.color.copy(U.color).multiplyScalar(U.intensity),J.distance=U.distance,J.decay=U.decay,U.castShadow){let le=U.shadow,Se=t.get(U);Se.shadowIntensity=le.intensity,Se.shadowBias=le.bias,Se.shadowNormalBias=le.normalBias,Se.shadowRadius=le.radius,Se.shadowMapSize=le.mapSize,Se.shadowCameraNear=le.camera.near,Se.shadowCameraFar=le.camera.far,n.pointShadow[m]=Se,n.pointShadowMap[m]=me,n.pointShadowMatrix[m]=U.shadow.matrix,T++}n.point[m]=J,m++}else if(U.isHemisphereLight){let J=e.get(U);J.skyColor.copy(U.color).multiplyScalar($),J.groundColor.copy(U.groundColor).multiplyScalar($),n.hemi[v]=J,v++}}x>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=He.LTC_FLOAT_1,n.rectAreaLTC2=He.LTC_FLOAT_2):(n.rectAreaLTC1=He.LTC_HALF_1,n.rectAreaLTC2=He.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let k=n.hash;(k.sunLength!==f||k.directionalLength!==p||k.pointLength!==m||k.spotLength!==y||k.rectAreaLength!==x||k.hemiLength!==v||k.numSunShadows!==g||k.numDirectionalShadows!==w||k.numPointShadows!==T||k.numSpotShadows!==M||k.numSpotMaps!==S||k.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=p,n.spot.length=y,n.rectArea.length=x,n.point.length=m,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.directionalShadowMatrix.length=w,n.pointShadow.length=T,n.pointShadowMap.length=T,n.pointShadowMatrix.length=T,n.spotShadow.length=M,n.spotShadowMap.length=M,n.spotLightMatrix.length=M+S-F,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=F,n.numLightProbes=P,k.sunLength=f,k.directionalLength=p,k.pointLength=m,k.spotLength=y,k.rectAreaLength=x,k.hemiLength=v,k.numSunShadows=g,k.numDirectionalShadows=w,k.numPointShadows=T,k.numSpotShadows=M,k.numSpotMaps=S,k.numLightProbes=P,n.version=kv++)}function l(c,u){let d=0,h=0,f=0,g=0,_=0,p=0,m=u.matrixWorldInverse;for(let y=0,x=c.length;y<x;y++){let v=c[y];if(v.isSunLight){let w=n.sun[d];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),d++}else if(v.isDirectionalLight){let w=n.directional[h];w.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(i),w.direction.transformDirection(m),h++}else if(v.isSpotLight){let w=n.spot[g];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(i),w.direction.transformDirection(m),g++}else if(v.isRectAreaLight){let w=n.rectArea[_];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),_++}else if(v.isPointLight){let w=n.point[f];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){let w=n.hemi[p];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:n}}function Gp(s){let e=new Hv(s),t=[],n=[],i=[];function r(d){u.camera=d,t.length=0,n.length=0,i.length=0}function o(d){d.isLightProbeGrid?i.push(d):t.push(d)}function a(d){n.push(d)}function l(){e.setup(t),i.sort((d,h)=>d.priority-h.priority||d.id-h.id)}function c(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Gv(s){let e=new WeakMap;function t(i,r=0){let o=e.get(i),a;return o===void 0?(a=new Gp(s),e.set(i,[a])):r>=o.length?(a=new Gp(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Vv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wv=`uniform sampler2D shadow_pass;
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
}`,Xv=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],qv=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],Vp=new dt,ma=new D,bu=new D;function Yv(s,e,t){let n=new ps,i=new be,r=new be,o=new qt,a=new Nl,l=new Ul,c={},u=t.maxTextureSize,d={[Ri]:zn,[zn]:Ri,[Tn]:Tn},h=new Ei({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new be},radius:{value:4}},vertexShader:Vv,fragmentShader:Wv}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let g=new en;g.setAttribute("position",new An(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Jt(g,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zs;let m=this.type;this.render=function(T,M,S){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||T.length===0)return;this.type===If&&(it("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Zs);let F=s.getRenderTarget(),P=s.getActiveCubeFace(),k=s.getActiveMipmapLevel(),H=s.state;H.setBlending($s),H.buffers.depth.getReversed()===!0?H.buffers.color.setClear(0,0,0,0):H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let z=m!==this.type;z&&M.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(q=>q.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,q=T.length;U<q;U++){let $=T[U],W=$.shadow;if(W===void 0){it("WebGLShadowMap:",$,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;i.copy(W.mapSize);let me=W.getFrameExtents();i.multiply(me),r.copy(W.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(r.x=Math.floor(u/me.x),i.x=r.x*me.x,W.mapSize.x=r.x),i.y>u&&(r.y=Math.floor(u/me.y),i.y=r.y*me.y,W.mapSize.y=r.y));let J=s.state.buffers.depth.getReversed();if(W.camera._reversedDepth=J,W.map===null||z===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===Jr){if($.isPointLight){it("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new jn(i.x,i.y,{format:bs,type:mi,minFilter:yn,magFilter:yn,generateMipmaps:!1}),W.map.texture.name=$.name+".shadowMap",W.map.depthTexture=new Zi(i.x,i.y,ti),W.map.depthTexture.name=$.name+".shadowMapDepth",W.map.depthTexture.format=Wi,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=ln,W.map.depthTexture.magFilter=ln}else $.isPointLight?(W.map=new _a(i.x),W.map.depthTexture=new Ho(i.x,pi)):(W.map=new jn(i.x,i.y),W.map.depthTexture=new Zi(i.x,i.y,pi)),W.map.depthTexture.name=$.name+".shadowMap",W.map.depthTexture.format=Wi,this.type===Zs?(W.map.depthTexture.compareFunction=J?lu:au,W.map.depthTexture.minFilter=yn,W.map.depthTexture.magFilter=yn):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=ln,W.map.depthTexture.magFilter=ln);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==i.x||W.map.height!==i.y)&&W.map.setSize(i.x,i.y);let le=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();$.isPointLight!==!0&&W.updateMatrices($,S);let Se=(W.camera.layers.mask&4294967294)!==0?W.camera.layers:S.layers;for(let Le=0;Le<le;Le++){let et=W.getCamera(Le);if($.isPointLight){let V=W.camera,he=W.matrix,Ee=$.distance||V.far;Ee!==V.far&&(V.far=Ee,V.updateProjectionMatrix()),ma.setFromMatrixPosition($.matrixWorld),V.position.copy(ma),bu.copy(V.position),bu.add(Xv[Le]),V.up.copy(qv[Le]),V.lookAt(bu),V.updateMatrixWorld(),he.makeTranslation(-ma.x,-ma.y,-ma.z),Vp.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),W._frustum.setFromProjectionMatrix(Vp,V.coordinateSystem,V.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)s.setRenderTarget(W.map,Le),s.clear();else{Le===0&&(s.setRenderTarget(W.map),s.clear());let V=W.getViewport(Le);o.set(r.x*V.x,r.y*V.y,r.x*V.z,r.y*V.w),H.viewport(o)}n=W.getFrustum(Le),v(M,S,et,$,Se,this.type)}W.isPointLightShadow!==!0&&this.type===Jr&&y(W,S),W.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(F,P,k)};function y(T,M){let S=e.update(_);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null?T.mapPass=new jn(i.x,i.y,{format:bs,type:mi}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),h.uniforms.shadow_pass.value=T.map.depthTexture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(M,null,S,h,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(M,null,S,f,_,null)}function x(T,M,S,F){let P=null,k=S.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(k!==void 0)P=k;else if(P=S.isPointLight===!0?l:a,s.localClippingEnabled&&M.clipShadows===!0&&Array.isArray(M.clippingPlanes)&&M.clippingPlanes.length!==0||M.displacementMap&&M.displacementScale!==0||M.alphaMap&&M.alphaTest>0||M.map&&M.alphaTest>0||M.alphaToCoverage===!0){let H=P.uuid,z=M.uuid,U=c[H];U===void 0&&(U={},c[H]=U);let q=U[z];q===void 0&&(q=P.clone(),U[z]=q,M.addEventListener("dispose",w)),P=q}if(P.visible=M.visible,P.wireframe=M.wireframe,F===Jr?P.side=M.shadowSide!==null?M.shadowSide:M.side:P.side=M.shadowSide!==null?M.shadowSide:d[M.side],P.alphaMap=M.alphaMap,P.alphaTest=M.alphaToCoverage===!0?.5:M.alphaTest,P.map=M.map,P.clipShadows=M.clipShadows,P.clippingPlanes=M.clippingPlanes,P.clipIntersection=M.clipIntersection,P.displacementMap=M.displacementMap,P.displacementScale=M.displacementScale,P.displacementBias=M.displacementBias,P.wireframeLinewidth=M.wireframeLinewidth,P.linewidth=M.linewidth,S.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let H=s.properties.get(P);H.light=S}return P}function v(T,M,S,F,P,k){if(T.visible===!1)return;if(T.layers.test(P)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&k===Jr)&&(!T.frustumCulled||T.intersectsFrustum(n))){T.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,T.matrixWorld);let U=e.update(T),q=T.material;if(Array.isArray(q)){let $=U.groups;for(let W=0,me=$.length;W<me;W++){let J=$[W],le=q[J.materialIndex];if(le&&le.visible){let Se=x(T,le,F,k);T.onBeforeShadow(s,T,M,S,U,Se,J),s.renderBufferDirect(S,null,U,Se,T,J),T.onAfterShadow(s,T,M,S,U,Se,J)}}}else if(q.visible){let $=x(T,q,F,k);T.onBeforeShadow(s,T,M,S,U,$,null),s.renderBufferDirect(S,null,U,$,T,null),T.onAfterShadow(s,T,M,S,U,$,null)}}let z=T.children;for(let U=0,q=z.length;U<q;U++)v(z[U],M,S,F,P,k)}function w(T){T.target.removeEventListener("dispose",w);for(let S in c){let F=c[S],P=T.target.uuid;P in F&&(F[P].dispose(),delete F[P])}}}function Kv(s,e){function t(){let B=!1,xe=new qt,K=null,oe=new qt(0,0,0,0);return{setMask:function(ge){K!==ge&&!B&&(s.colorMask(ge,ge,ge,ge),K=ge)},setLocked:function(ge){B=ge},setClear:function(ge,Te,We,ot,Ae){Ae===!0&&(ge*=ot,Te*=ot,We*=ot),xe.set(ge,Te,We,ot),oe.equals(xe)===!1&&(s.clearColor(ge,Te,We,ot),oe.copy(xe))},reset:function(){B=!1,K=null,oe.set(-1,0,0,0)}}}function n(){let B=!1,xe=!1,K=null,oe=null,ge=null;return{setReversed:function(Te){if(xe!==Te){let We=e.get("EXT_clip_control");Te?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),xe=Te;let ot=ge;ge=null,this.setClear(ot)}},getReversed:function(){return xe},setTest:function(Te){Te?_e(s.DEPTH_TEST):ce(s.DEPTH_TEST)},setMask:function(Te){K!==Te&&!B&&(s.depthMask(Te),K=Te)},setFunc:function(Te){if(xe&&(Te=fp[Te]),oe!==Te){switch(Te){case gl:s.depthFunc(s.NEVER);break;case _l:s.depthFunc(s.ALWAYS);break;case yl:s.depthFunc(s.LESS);break;case Rr:s.depthFunc(s.LEQUAL);break;case xl:s.depthFunc(s.EQUAL);break;case vl:s.depthFunc(s.GEQUAL);break;case Ml:s.depthFunc(s.GREATER);break;case bl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}oe=Te}},setLocked:function(Te){B=Te},setClear:function(Te){ge!==Te&&(ge=Te,xe&&(Te=1-Te),s.clearDepth(Te))},reset:function(){B=!1,K=null,oe=null,ge=null,xe=!1}}}function i(){let B=!1,xe=null,K=null,oe=null,ge=null,Te=null,We=null,ot=null,Ae=null;return{setTest:function(Qe){B||(Qe?_e(s.STENCIL_TEST):ce(s.STENCIL_TEST))},setMask:function(Qe){xe!==Qe&&!B&&(s.stencilMask(Qe),xe=Qe)},setFunc:function(Qe,_t,Oe){(K!==Qe||oe!==_t||ge!==Oe)&&(s.stencilFunc(Qe,_t,Oe),K=Qe,oe=_t,ge=Oe)},setOp:function(Qe,_t,Oe){(Te!==Qe||We!==_t||ot!==Oe)&&(s.stencilOp(Qe,_t,Oe),Te=Qe,We=_t,ot=Oe)},setLocked:function(Qe){B=Qe},setClear:function(Qe){Ae!==Qe&&(s.clearStencil(Qe),Ae=Qe)},reset:function(){B=!1,xe=null,K=null,oe=null,ge=null,Te=null,We=null,ot=null,Ae=null}}}let r=new t,o=new n,a=new i,l={},c=new WeakMap,u={},d={},h={},f=new WeakMap,g=[],_=null,p=!1,m=null,y=null,x=null,v=null,w=null,T=null,M=null,S=new nt(0,0,0),F=0,P=!1,k=null,H=null,z=null,U=null,q=null,$=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,me=0,J=s.getParameter(s.VERSION);J.indexOf("WebGL")!==-1?(me=parseFloat(/^WebGL (\d)/.exec(J)[1]),W=me>=1):J.indexOf("OpenGL ES")!==-1&&(me=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),W=me>=2);let le=null,Se={},Le=s.getParameter(s.SCISSOR_BOX),et=s.getParameter(s.VIEWPORT),V=new qt().fromArray(Le),he=new qt().fromArray(et);function Ee(B,xe,K,oe){let ge=new Uint8Array(4),Te=s.createTexture();s.bindTexture(B,Te),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let We=0;We<K;We++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(xe,0,s.RGBA,1,1,oe,0,s.RGBA,s.UNSIGNED_BYTE,ge):s.texImage2D(xe+We,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ge);return Te}let Fe={};Fe[s.TEXTURE_2D]=Ee(s.TEXTURE_2D,s.TEXTURE_2D,1),Fe[s.TEXTURE_CUBE_MAP]=Ee(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Fe[s.TEXTURE_2D_ARRAY]=Ee(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Fe[s.TEXTURE_3D]=Ee(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),_e(s.DEPTH_TEST),o.setFunc(Rr),Pt(!1),yt(Hh),_e(s.CULL_FACE),st($s);function _e(B){u[B]!==!0&&(s.enable(B),u[B]=!0)}function ce(B){u[B]!==!1&&(s.disable(B),u[B]=!1)}function Ie(B,xe){return h[B]!==xe?(s.bindFramebuffer(B,xe),h[B]=xe,B===s.DRAW_FRAMEBUFFER&&(h[s.FRAMEBUFFER]=xe),B===s.FRAMEBUFFER&&(h[s.DRAW_FRAMEBUFFER]=xe),!0):!1}function ve(B,xe){let K=g,oe=!1;if(B){K=f.get(xe),K===void 0&&(K=[],f.set(xe,K));let ge=B.textures;if(K.length!==ge.length||K[0]!==s.COLOR_ATTACHMENT0){for(let Te=0,We=ge.length;Te<We;Te++)K[Te]=s.COLOR_ATTACHMENT0+Te;K.length=ge.length,oe=!0}}else K[0]!==s.BACK&&(K[0]=s.BACK,oe=!0);oe&&s.drawBuffers(K)}function Ne(B){return _!==B?(s.useProgram(B),_=B,!0):!1}let je={[js]:s.FUNC_ADD,[Df]:s.FUNC_SUBTRACT,[Nf]:s.FUNC_REVERSE_SUBTRACT};je[Uf]=s.MIN,je[Of]=s.MAX;let Ke={[Ff]:s.ZERO,[Bf]:s.ONE,[kf]:s.SRC_COLOR,[Wh]:s.SRC_ALPHA,[Xf]:s.SRC_ALPHA_SATURATE,[Vf]:s.DST_COLOR,[Hf]:s.DST_ALPHA,[zf]:s.ONE_MINUS_SRC_COLOR,[Xh]:s.ONE_MINUS_SRC_ALPHA,[Wf]:s.ONE_MINUS_DST_COLOR,[Gf]:s.ONE_MINUS_DST_ALPHA,[qf]:s.CONSTANT_COLOR,[Yf]:s.ONE_MINUS_CONSTANT_COLOR,[Kf]:s.CONSTANT_ALPHA,[Zf]:s.ONE_MINUS_CONSTANT_ALPHA};function st(B,xe,K,oe,ge,Te,We,ot,Ae,Qe){if(B===$s){p===!0&&(ce(s.BLEND),p=!1);return}if(p===!1&&(_e(s.BLEND),p=!0),B!==Lf){if(B!==m||Qe!==P){if((y!==js||w!==js)&&(s.blendEquation(s.FUNC_ADD),y=js,w=js),Qe)switch(B){case Ms:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Js:s.blendFunc(s.ONE,s.ONE);break;case Gh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:ht("WebGLState: Invalid blending: ",B);break}else switch(B){case Ms:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Js:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Gh:ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Vh:ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ht("WebGLState: Invalid blending: ",B);break}x=null,v=null,T=null,M=null,S.set(0,0,0),F=0,m=B,P=Qe}return}ge=ge||xe,Te=Te||K,We=We||oe,(xe!==y||ge!==w)&&(s.blendEquationSeparate(je[xe],je[ge]),y=xe,w=ge),(K!==x||oe!==v||Te!==T||We!==M)&&(s.blendFuncSeparate(Ke[K],Ke[oe],Ke[Te],Ke[We]),x=K,v=oe,T=Te,M=We),(ot.equals(S)===!1||Ae!==F)&&(s.blendColor(ot.r,ot.g,ot.b,Ae),S.copy(ot),F=Ae),m=B,P=!1}function gt(B,xe){B.side===Tn?ce(s.CULL_FACE):_e(s.CULL_FACE);let K=B.side===zn;xe&&(K=!K),Pt(K),B.blending===Ms&&B.transparent===!1?st($s):st(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);let oe=B.stencilWrite;a.setTest(oe),oe&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),rt(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?_e(s.SAMPLE_ALPHA_TO_COVERAGE):ce(s.SAMPLE_ALPHA_TO_COVERAGE)}function Pt(B){k!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),k=B)}function yt(B){B!==Cf?(_e(s.CULL_FACE),B!==H&&(B===Hh?s.cullFace(s.BACK):B===Pf?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ce(s.CULL_FACE),H=B}function zt(B){B!==z&&(W&&s.lineWidth(B),z=B)}function rt(B,xe,K){B?(_e(s.POLYGON_OFFSET_FILL),(U!==xe||q!==K)&&(U=xe,q=K,o.getReversed()&&(xe=-xe,K=-K),s.polygonOffset(xe,K))):ce(s.POLYGON_OFFSET_FILL)}function Ft(B){B?_e(s.SCISSOR_TEST):ce(s.SCISSOR_TEST)}function sn(B){B===void 0&&(B=s.TEXTURE0+$-1),le!==B&&(s.activeTexture(B),le=B)}function rn(B,xe,K){K===void 0&&(le===null?K=s.TEXTURE0+$-1:K=le);let oe=Se[K];oe===void 0&&(oe={type:void 0,texture:void 0},Se[K]=oe),(oe.type!==B||oe.texture!==xe)&&(le!==K&&(s.activeTexture(K),le=K),s.bindTexture(B,xe||Fe[B]),oe.type=B,oe.texture=xe)}function X(){let B=Se[le];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function ft(){try{s.compressedTexImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function It(){try{s.compressedTexImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function Ut(){try{s.texSubImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function Me(){try{s.texSubImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function Re(){try{s.compressedTexSubImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function Ve(){try{s.compressedTexSubImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function ke(){try{s.texStorage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function L(){try{s.texStorage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function E(){try{s.texImage2D(...arguments)}catch(B){ht("WebGLState:",B)}}function Q(){try{s.texImage3D(...arguments)}catch(B){ht("WebGLState:",B)}}function we(B){return d[B]!==void 0?d[B]:s.getParameter(B)}function ye(B,xe){d[B]!==xe&&(s.pixelStorei(B,xe),d[B]=xe)}function de(B){V.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),V.copy(B))}function re(B){he.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),he.copy(B))}function N(B,xe){let K=c.get(xe);K===void 0&&(K=new WeakMap,c.set(xe,K));let oe=K.get(B);oe===void 0&&(oe=s.getUniformBlockIndex(xe,B.name),s.uniformBlockBinding(xe,oe,oe),K.set(B,oe))}function fe(B,xe,K){let ge=c.get(xe).get(B);l[ge]!==K&&(s.bindBufferBase(s.UNIFORM_BUFFER,ge,K),l[ge]=K)}function Ce(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),u={},d={},le=null,Se={},h={},l={},f=new WeakMap,g=[],_=null,p=!1,m=null,y=null,x=null,v=null,w=null,T=null,M=null,S=new nt(0,0,0),F=0,P=!1,k=null,H=null,z=null,U=null,q=null,V.set(0,0,s.canvas.width,s.canvas.height),he.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:_e,disable:ce,bindFramebuffer:Ie,drawBuffers:ve,useProgram:Ne,setBlending:st,setMaterial:gt,setFlipSided:Pt,setCullFace:yt,setLineWidth:zt,setPolygonOffset:rt,setScissorTest:Ft,activeTexture:sn,bindTexture:rn,unbindTexture:X,compressedTexImage2D:ft,compressedTexImage3D:It,texImage2D:E,texImage3D:Q,pixelStorei:ye,getParameter:we,updateUBOMapping:N,uniformBlockBinding:fe,texStorage2D:ke,texStorage3D:L,texSubImage2D:Ut,texSubImage3D:Me,compressedTexSubImage2D:Re,compressedTexSubImage3D:Ve,scissor:de,viewport:re,reset:Ce}}function Zv(s,e,t,n,i,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new be,u=new WeakMap,d=new Set,h,f=new WeakMap,g=new Set,_=new FinalizationRegistry(L=>g.delete(L)),p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(L,E){return p?new OffscreenCanvas(L,E):Ir("canvas")}function y(L,E,Q){let we=1,ye=ke(L);if((ye.width>Q||ye.height>Q)&&(we=Q/Math.max(ye.width,ye.height)),we<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let de=Math.floor(we*ye.width),re=Math.floor(we*ye.height);h===void 0&&(h=m(de,re));let N=E?m(de,re):h;return N.width=de,N.height=re,N.getContext("2d").drawImage(L,0,0,de,re),it("WebGLRenderer: Texture has been resized from ("+ye.width+"x"+ye.height+") to ("+de+"x"+re+")."),N}else return"data"in L&&it("WebGLRenderer: Image in DataTexture is too big ("+ye.width+"x"+ye.height+")."),L;return L}function x(L){return L.generateMipmaps}function v(L){s.generateMipmap(L)}function w(L){return L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?s.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function T(L,E,Q,we,ye,de=!1){if(L!==null){if(s[L]!==void 0)return s[L];it("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let re;we&&(re=e.get("EXT_texture_norm16"),re||it("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let N=E;if(E===s.RED&&(Q===s.FLOAT&&(N=s.R32F),Q===s.HALF_FLOAT&&(N=s.R16F),Q===s.UNSIGNED_BYTE&&(N=s.R8),Q===s.UNSIGNED_SHORT&&re&&(N=re.R16_EXT),Q===s.SHORT&&re&&(N=re.R16_SNORM_EXT)),E===s.RED_INTEGER&&(Q===s.UNSIGNED_BYTE&&(N=s.R8UI),Q===s.UNSIGNED_SHORT&&(N=s.R16UI),Q===s.UNSIGNED_INT&&(N=s.R32UI),Q===s.BYTE&&(N=s.R8I),Q===s.SHORT&&(N=s.R16I),Q===s.INT&&(N=s.R32I)),E===s.RG&&(Q===s.FLOAT&&(N=s.RG32F),Q===s.HALF_FLOAT&&(N=s.RG16F),Q===s.UNSIGNED_BYTE&&(N=s.RG8),Q===s.UNSIGNED_SHORT&&re&&(N=re.RG16_EXT),Q===s.SHORT&&re&&(N=re.RG16_SNORM_EXT)),E===s.RG_INTEGER&&(Q===s.UNSIGNED_BYTE&&(N=s.RG8UI),Q===s.UNSIGNED_SHORT&&(N=s.RG16UI),Q===s.UNSIGNED_INT&&(N=s.RG32UI),Q===s.BYTE&&(N=s.RG8I),Q===s.SHORT&&(N=s.RG16I),Q===s.INT&&(N=s.RG32I)),E===s.RGB_INTEGER&&(Q===s.UNSIGNED_BYTE&&(N=s.RGB8UI),Q===s.UNSIGNED_SHORT&&(N=s.RGB16UI),Q===s.UNSIGNED_INT&&(N=s.RGB32UI),Q===s.BYTE&&(N=s.RGB8I),Q===s.SHORT&&(N=s.RGB16I),Q===s.INT&&(N=s.RGB32I)),E===s.RGBA_INTEGER&&(Q===s.UNSIGNED_BYTE&&(N=s.RGBA8UI),Q===s.UNSIGNED_SHORT&&(N=s.RGBA16UI),Q===s.UNSIGNED_INT&&(N=s.RGBA32UI),Q===s.BYTE&&(N=s.RGBA8I),Q===s.SHORT&&(N=s.RGBA16I),Q===s.INT&&(N=s.RGBA32I)),E===s.RGB&&(Q===s.UNSIGNED_SHORT&&re&&(N=re.RGB16_EXT),Q===s.SHORT&&re&&(N=re.RGB16_SNORM_EXT),Q===s.UNSIGNED_INT_5_9_9_9_REV&&(N=s.RGB9_E5),Q===s.UNSIGNED_INT_10F_11F_11F_REV&&(N=s.R11F_G11F_B10F)),E===s.RGBA){let fe=de?Ro:Tt.getTransfer(ye);Q===s.FLOAT&&(N=s.RGBA32F),Q===s.HALF_FLOAT&&(N=s.RGBA16F),Q===s.UNSIGNED_BYTE&&(N=fe===Gt?s.SRGB8_ALPHA8:s.RGBA8),Q===s.UNSIGNED_SHORT&&re&&(N=re.RGBA16_EXT),Q===s.SHORT&&re&&(N=re.RGBA16_SNORM_EXT),Q===s.UNSIGNED_SHORT_4_4_4_4&&(N=s.RGBA4),Q===s.UNSIGNED_SHORT_5_5_5_1&&(N=s.RGB5_A1)}return(N===s.R16F||N===s.R32F||N===s.RG16F||N===s.RG32F||N===s.RGBA16F||N===s.RGBA32F)&&e.get("EXT_color_buffer_float"),N}function M(L,E){let Q;return L?E===null||E===pi||E===tr?Q=s.DEPTH24_STENCIL8:E===ti?Q=s.DEPTH32F_STENCIL8:E===eo&&(Q=s.DEPTH24_STENCIL8,it("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===pi||E===tr?Q=s.DEPTH_COMPONENT24:E===ti?Q=s.DEPTH_COMPONENT32F:E===eo&&(Q=s.DEPTH_COMPONENT16),Q}function S(L,E){return x(L)===!0||L.isFramebufferTexture&&L.minFilter!==ln&&L.minFilter!==yn?Math.log2(Math.max(E.width,E.height))+1:L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?E.mipmaps.length:1}function F(L){let E=new WeakRef(L);n.get(L).__ref=E,g.add(E),_.register(L,E,E)}function P(L){let E=n.get(L).__ref;E!==void 0&&(g.delete(E),_.unregister(E))}function k(L){z(L.target)}function H(L){U(L.target)}function z(L){L.removeEventListener("dispose",k),P(L),$(L),L.isVideoTexture&&u.delete(L),L.isHTMLTexture&&d.delete(L)}function U(L){L.removeEventListener("dispose",H),P(L),me(L)}function q(){for(let L of g){let E=L.deref();E!==void 0&&(E.isRenderTarget===!0?U(E):z(E))}g.clear(),d.clear()}function $(L){let E=n.get(L);if(E.__webglInit===void 0)return;let Q=L.source,we=f.get(Q);if(we){let ye=we[E.__cacheKey];ye.usedTimes--,ye.usedTimes===0&&W(L),Object.keys(we).length===0&&f.delete(Q)}n.remove(L)}function W(L){let E=n.get(L);s.deleteTexture(E.__webglTexture);let Q=L.source,we=f.get(Q);delete we[E.__cacheKey],o.memory.textures--}function me(L){let E=n.get(L);E.__depthDisposeCallback&&E.__depthDisposeCallback();let Q=L.depthTexture;if(Q&&Q.renderTarget===L&&z(Q),L.isWebGLCubeRenderTarget)for(let ye=0;ye<6;ye++){if(Array.isArray(E.__webglFramebuffer[ye]))for(let de=0;de<E.__webglFramebuffer[ye].length;de++)s.deleteFramebuffer(E.__webglFramebuffer[ye][de]);else s.deleteFramebuffer(E.__webglFramebuffer[ye]);E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer[ye])}else{if(Array.isArray(E.__webglFramebuffer))for(let ye=0;ye<E.__webglFramebuffer.length;ye++)s.deleteFramebuffer(E.__webglFramebuffer[ye]);else s.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&s.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let ye=0;ye<E.__webglColorRenderbuffer.length;ye++)E.__webglColorRenderbuffer[ye]&&s.deleteRenderbuffer(E.__webglColorRenderbuffer[ye]);E.__webglDepthRenderbuffer&&s.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let we=L.textures;for(let ye=0,de=we.length;ye<de;ye++){let re=n.get(we[ye]);re.__webglTexture&&(s.deleteTexture(re.__webglTexture),o.memory.textures--),n.remove(we[ye])}n.remove(L)}let J=0;function le(){J=0}function Se(){return J}function Le(L){J=L}function et(){let L=J;return L>=i.maxTextures&&it("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+i.maxTextures),J+=1,L}function V(L){let E=[];return E.push(L.wrapS),E.push(L.wrapT),E.push(L.wrapR||0),E.push(L.magFilter),E.push(L.minFilter),E.push(L.anisotropy),E.push(L.internalFormat),E.push(L.format),E.push(L.type),E.push(L.generateMipmaps),E.push(L.mipmapsAutoUpdate),E.push(L.premultiplyAlpha),E.push(L.flipY),E.push(L.unpackAlignment),E.push(L.colorSpace),E.join()}function he(L,E){let Q=n.get(L);if(L.isVideoTexture&&Re(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&Q.__version!==L.version){let we=L.image;if(we===null)it("WebGLRenderer: Texture marked for update but no image data found.");else if(we.complete===!1)it("WebGLRenderer: Texture marked for update but image is incomplete");else{gt(Q,L,E);return}}else L.isExternalTexture&&(Q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,Q.__webglTexture,s.TEXTURE0+E)}function Ee(L,E){let Q=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Q.__version!==L.version){gt(Q,L,E);return}else L.isExternalTexture&&(Q.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,Q.__webglTexture,s.TEXTURE0+E)}function Fe(L,E){let Q=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Q.__version!==L.version){gt(Q,L,E);return}t.bindTexture(s.TEXTURE_3D,Q.__webglTexture,s.TEXTURE0+E)}function _e(L,E){let Q=n.get(L);if(L.version>0&&Q.__version!==L.version){Pt(Q,L,E);return}t.bindTexture(s.TEXTURE_CUBE_MAP,Q.__webglTexture,s.TEXTURE0+E)}let ce={[Jn]:s.REPEAT,[ii]:s.CLAMP_TO_EDGE,[Cr]:s.MIRRORED_REPEAT},Ie={[ln]:s.NEAREST,[ql]:s.NEAREST_MIPMAP_NEAREST,[er]:s.NEAREST_MIPMAP_LINEAR,[yn]:s.LINEAR,[Qr]:s.LINEAR_MIPMAP_NEAREST,[oi]:s.LINEAR_MIPMAP_LINEAR},ve={[rp]:s.NEVER,[cu]:s.ALWAYS,[op]:s.LESS,[au]:s.LEQUAL,[ap]:s.EQUAL,[lu]:s.GEQUAL,[lp]:s.GREATER,[cp]:s.NOTEQUAL};function Ne(L,E){if(E.type===ti&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===yn||E.magFilter===Qr||E.magFilter===er||E.magFilter===oi||E.minFilter===yn||E.minFilter===Qr||E.minFilter===er||E.minFilter===oi)&&it("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,ce[E.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,ce[E.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,ce[E.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,Ie[E.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,Ie[E.minFilter]),E.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,ve[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===ln||E.minFilter!==er&&E.minFilter!==oi||E.type===ti&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){let Q=e.get("EXT_texture_filter_anisotropic");s.texParameterf(L,Q.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,i.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function je(L,E){let Q=!1;L.__webglInit===void 0&&(L.__webglInit=!0,E.addEventListener("dispose",k),F(E));let we=E.source,ye=f.get(we);ye===void 0&&(ye={},f.set(we,ye));let de=V(E);if(de!==L.__cacheKey){ye[de]===void 0&&(ye[de]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,Q=!0),ye[de].usedTimes++;let re=ye[L.__cacheKey];re!==void 0&&(ye[L.__cacheKey].usedTimes--,re.usedTimes===0&&W(E)),L.__cacheKey=de,L.__webglTexture=ye[de].texture}return Q}function Ke(L,E,Q){return Math.floor(Math.floor(L/Q)/E)}function st(L,E,Q,we){let de=L.updateRanges;if(de.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,E.width,E.height,Q,we,E.data);else{de.sort((B,xe)=>B.start-xe.start);let re=0;for(let B=1;B<de.length;B++){let xe=de[re],K=de[B],oe=xe.start+xe.count,ge=Ke(K.start,E.width,4),Te=Ke(xe.start,E.width,4);K.start<=oe+1&&ge===Te&&Ke(K.start+K.count-1,E.width,4)===ge?xe.count=Math.max(xe.count,K.start+K.count-xe.start):(++re,de[re]=K)}de.length=re+1;let N=t.getParameter(s.UNPACK_ROW_LENGTH),fe=t.getParameter(s.UNPACK_SKIP_PIXELS),Ce=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,E.width);for(let B=0,xe=de.length;B<xe;B++){let K=de[B],oe=Math.floor(K.start/4),ge=Math.ceil(K.count/4),Te=oe%E.width,We=Math.floor(oe/E.width),ot=ge,Ae=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,Te),t.pixelStorei(s.UNPACK_SKIP_ROWS,We),t.texSubImage2D(s.TEXTURE_2D,0,Te,We,ot,Ae,Q,we,E.data)}L.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,N),t.pixelStorei(s.UNPACK_SKIP_PIXELS,fe),t.pixelStorei(s.UNPACK_SKIP_ROWS,Ce)}}function gt(L,E,Q){let we=s.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(we=s.TEXTURE_2D_ARRAY),E.isData3DTexture&&(we=s.TEXTURE_3D);let ye=je(L,E),de=E.source;t.bindTexture(we,L.__webglTexture,s.TEXTURE0+Q);let re=n.get(de);if(de.version!==re.__version||ye===!0){if(t.activeTexture(s.TEXTURE0+Q),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){let Ae=Tt.getPrimaries(Tt.workingColorSpace),Qe=E.colorSpace===ns?null:Tt.getPrimaries(E.colorSpace),_t=E.colorSpace===ns||Ae===Qe?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t)}t.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment);let fe=y(E.image,!1,i.maxTextureSize);fe=Ve(E,fe);let Ce=r.convert(E.format,E.colorSpace),B=r.convert(E.type),xe=T(E.internalFormat,Ce,B,E.normalized,E.colorSpace,E.isVideoTexture);Ne(we,E);let K,oe=E.mipmaps,ge=E.isVideoTexture!==!0,Te=re.__version===void 0||ye===!0,We=de.dataReady,ot=S(E,fe);if(E.isDepthTexture)xe=M(E.format===ts,E.type),Te&&(ge?t.texStorage2D(s.TEXTURE_2D,1,xe,fe.width,fe.height):t.texImage2D(s.TEXTURE_2D,0,xe,fe.width,fe.height,0,Ce,B,null));else if(E.isDataTexture)if(oe.length>0){ge&&Te&&t.texStorage2D(s.TEXTURE_2D,ot,xe,oe[0].width,oe[0].height);for(let Ae=0,Qe=oe.length;Ae<Qe;Ae++)K=oe[Ae],ge?We&&t.texSubImage2D(s.TEXTURE_2D,Ae,0,0,K.width,K.height,Ce,B,K.data):t.texImage2D(s.TEXTURE_2D,Ae,xe,K.width,K.height,0,Ce,B,K.data);E.generateMipmaps=!1}else ge?(Te&&t.texStorage2D(s.TEXTURE_2D,ot,xe,fe.width,fe.height),We&&st(E,fe,Ce,B)):t.texImage2D(s.TEXTURE_2D,0,xe,fe.width,fe.height,0,Ce,B,fe.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){ge&&Te&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ot,xe,oe[0].width,oe[0].height,fe.depth);for(let Ae=0,Qe=oe.length;Ae<Qe;Ae++)if(K=oe[Ae],E.format!==ai)if(Ce!==null)if(ge){if(We)if(E.layerUpdates.size>0){let _t=vu(K.width,K.height,E.format,E.type);for(let Oe of E.layerUpdates){let Dt=K.data.subarray(Oe*_t/K.data.BYTES_PER_ELEMENT,(Oe+1)*_t/K.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Ae,0,0,Oe,K.width,K.height,1,Ce,Dt)}}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Ae,0,0,0,K.width,K.height,fe.depth,Ce,K.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,Ae,xe,K.width,K.height,fe.depth,0,K.data,0,0);else it("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ge?We&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,Ae,0,0,0,K.width,K.height,fe.depth,Ce,B,K.data):t.texImage3D(s.TEXTURE_2D_ARRAY,Ae,xe,K.width,K.height,fe.depth,0,Ce,B,K.data);E.layerUpdates.size>0&&E.clearLayerUpdates()}else{ge&&Te&&t.texStorage2D(s.TEXTURE_2D,ot,xe,oe[0].width,oe[0].height);for(let Ae=0,Qe=oe.length;Ae<Qe;Ae++)K=oe[Ae],E.format!==ai?Ce!==null?ge?We&&t.compressedTexSubImage2D(s.TEXTURE_2D,Ae,0,0,K.width,K.height,Ce,K.data):t.compressedTexImage2D(s.TEXTURE_2D,Ae,xe,K.width,K.height,0,K.data):it("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ge?We&&t.texSubImage2D(s.TEXTURE_2D,Ae,0,0,K.width,K.height,Ce,B,K.data):t.texImage2D(s.TEXTURE_2D,Ae,xe,K.width,K.height,0,Ce,B,K.data)}else if(E.isDataArrayTexture)if(ge){if(Te&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ot,xe,fe.width,fe.height,fe.depth),We)if(E.layerUpdates.size>0){let Ae=vu(fe.width,fe.height,E.format,E.type);for(let Qe of E.layerUpdates){let _t=fe.data.subarray(Qe*Ae/fe.data.BYTES_PER_ELEMENT,(Qe+1)*Ae/fe.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Qe,fe.width,fe.height,1,Ce,B,_t)}E.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,fe.width,fe.height,fe.depth,Ce,B,fe.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,xe,fe.width,fe.height,fe.depth,0,Ce,B,fe.data);else if(E.isData3DTexture)ge?(Te&&t.texStorage3D(s.TEXTURE_3D,ot,xe,fe.width,fe.height,fe.depth),We&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,fe.width,fe.height,fe.depth,Ce,B,fe.data)):t.texImage3D(s.TEXTURE_3D,0,xe,fe.width,fe.height,fe.depth,0,Ce,B,fe.data);else if(E.isFramebufferTexture){if(Te)if(ge)t.texStorage2D(s.TEXTURE_2D,ot,xe,fe.width,fe.height);else{let Ae=fe.width,Qe=fe.height;for(let _t=0;_t<ot;_t++)t.texImage2D(s.TEXTURE_2D,_t,xe,Ae,Qe,0,Ce,B,null),Ae>>=1,Qe>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in s){let Ae=s.canvas;if(Ae.hasAttribute("layoutsubtree")||Ae.setAttribute("layoutsubtree","true"),fe.parentNode!==Ae){Ae.appendChild(fe),d.add(E),Ae.onpaint=Qe=>{let _t=Qe.changedElements;for(let Oe of d)_t.includes(Oe.image)&&(Oe.needsUpdate=!0)},Ae.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,fe);else{let _t=s.RGBA,Oe=s.RGBA,Dt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,_t,Oe,Dt,fe)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(oe.length>0){if(ge&&Te){let Ae=ke(oe[0]);t.texStorage2D(s.TEXTURE_2D,ot,xe,Ae.width,Ae.height)}for(let Ae=0,Qe=oe.length;Ae<Qe;Ae++)K=oe[Ae],ge?We&&t.texSubImage2D(s.TEXTURE_2D,Ae,0,0,Ce,B,K):t.texImage2D(s.TEXTURE_2D,Ae,xe,Ce,B,K);E.generateMipmaps=!1}else if(ge){if(Te){let Ae=ke(fe);t.texStorage2D(s.TEXTURE_2D,ot,xe,Ae.width,Ae.height)}We&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Ce,B,fe)}else t.texImage2D(s.TEXTURE_2D,0,xe,Ce,B,fe);x(E)&&E.mipmapsAutoUpdate===!0&&v(we),re.__version=de.version,E.onUpdate&&E.onUpdate(E)}L.__version=E.version}function Pt(L,E,Q){if(E.image.length!==6)return;let we=je(L,E),ye=E.source;t.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+Q);let de=n.get(ye);if(ye.version!==de.__version||we===!0){t.activeTexture(s.TEXTURE0+Q);let re=Tt.getPrimaries(Tt.workingColorSpace),N=E.colorSpace===ns?null:Tt.getPrimaries(E.colorSpace),fe=E.colorSpace===ns||re===N?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe);let Ce=E.isCompressedTexture||E.image[0].isCompressedTexture,B=E.image[0]&&E.image[0].isDataTexture,xe=[];for(let Oe=0;Oe<6;Oe++)!Ce&&!B?xe[Oe]=y(E.image[Oe],!0,i.maxCubemapSize):xe[Oe]=B?E.image[Oe].image:E.image[Oe],xe[Oe]=Ve(E,xe[Oe]);let K=xe[0],oe=r.convert(E.format,E.colorSpace),ge=r.convert(E.type),Te=T(E.internalFormat,oe,ge,E.normalized,E.colorSpace),We=E.isVideoTexture!==!0,ot=de.__version===void 0||we===!0,Ae=ye.dataReady,Qe=S(E,K);Ne(s.TEXTURE_CUBE_MAP,E);let _t;if(E.isDepthTexture){if(Te=M(E.format===ts,E.type),ot)if(We)t.texStorage2D(s.TEXTURE_CUBE_MAP,1,Te,K.width,K.height);else for(let Oe=0;Oe<6;Oe++)t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,Te,K.width,K.height,0,oe,ge,null)}else if(Ce){We&&ot&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Qe,Te,K.width,K.height);for(let Oe=0;Oe<6;Oe++){_t=xe[Oe].mipmaps;for(let Dt=0;Dt<_t.length;Dt++){let on=_t[Dt];E.format!==ai?oe!==null?We?Ae&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt,0,0,on.width,on.height,oe,on.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt,Te,on.width,on.height,0,on.data):it("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):We?Ae&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt,0,0,on.width,on.height,oe,ge,on.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt,Te,on.width,on.height,0,oe,ge,on.data)}}}else{if(_t=E.mipmaps,We&&ot){_t.length>0&&Qe++;let Oe=ke(xe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Qe,Te,Oe.width,Oe.height)}for(let Oe=0;Oe<6;Oe++)if(B){We?Ae&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,0,0,xe[Oe].width,xe[Oe].height,oe,ge,xe[Oe].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,Te,xe[Oe].width,xe[Oe].height,0,oe,ge,xe[Oe].data);for(let Dt=0;Dt<_t.length;Dt++){let _i=_t[Dt].image[Oe].image;We?Ae&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt+1,0,0,_i.width,_i.height,oe,ge,_i.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt+1,Te,_i.width,_i.height,0,oe,ge,_i.data)}}else{We?Ae&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,0,0,oe,ge,xe[Oe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,0,Te,oe,ge,xe[Oe]);for(let Dt=0;Dt<_t.length;Dt++){let on=_t[Dt];We?Ae&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt+1,0,0,oe,ge,on.image[Oe]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Oe,Dt+1,Te,oe,ge,on.image[Oe])}}}x(E)&&E.mipmapsAutoUpdate===!0&&v(s.TEXTURE_CUBE_MAP),de.__version=ye.version,E.onUpdate&&E.onUpdate(E)}L.__version=E.version}function yt(L,E,Q,we,ye,de){let re=r.convert(Q.format,Q.colorSpace),N=r.convert(Q.type),fe=T(Q.internalFormat,re,N,Q.normalized,Q.colorSpace),Ce=n.get(E),B=n.get(Q);if(B.__renderTarget=E,!Ce.__hasExternalTextures){let xe=Math.max(1,E.width>>de),K=Math.max(1,E.height>>de);ye===s.TEXTURE_3D||ye===s.TEXTURE_2D_ARRAY?t.texImage3D(ye,de,fe,xe,K,E.depth,0,re,N,null):t.texImage2D(ye,de,fe,xe,K,0,re,N,null)}t.bindFramebuffer(s.FRAMEBUFFER,L),Me(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,we,ye,B.__webglTexture,0,Ut(E)):(ye===s.TEXTURE_2D||ye>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ye<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,we,ye,B.__webglTexture,de),t.bindFramebuffer(s.FRAMEBUFFER,null)}function zt(L,E,Q){if(s.bindRenderbuffer(s.RENDERBUFFER,L),E.depthBuffer){let we=E.depthTexture,ye=we&&we.isDepthTexture?we.type:null,de=M(E.stencilBuffer,ye),re=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Me(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ut(E),de,E.width,E.height):Q?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ut(E),de,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,de,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,re,s.RENDERBUFFER,L)}else{let we=E.textures;for(let ye=0;ye<we.length;ye++){let de=we[ye],re=r.convert(de.format,de.colorSpace),N=r.convert(de.type),fe=T(de.internalFormat,re,N,de.normalized,de.colorSpace);Me(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ut(E),fe,E.width,E.height):Q?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ut(E),fe,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,fe,E.width,E.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function rt(L,E,Q){let we=E.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,L),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ye=n.get(E.depthTexture);ye.__renderTarget=E;let de=we?E.depthTexture.image[0]:E.depthTexture.image;(!ye.__webglTexture||de.width!==E.width||de.height!==E.height)&&(de.width=E.width,de.height=E.height,E.depthTexture.needsUpdate=!0),we?_e(E.depthTexture,0):he(E.depthTexture,0);let re=ye.__webglTexture,N=Ut(E),fe=we?s.TEXTURE_CUBE_MAP_POSITIVE_X+Q:s.TEXTURE_2D,Ce=E.depthTexture.format===ts?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(E.depthTexture.format===Wi)Me(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,fe,re,0,N):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,fe,re,0);else if(E.depthTexture.format===ts)Me(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Ce,fe,re,0,N):s.framebufferTexture2D(s.FRAMEBUFFER,Ce,fe,re,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ft(L){let E=n.get(L),Q=L.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==L.depthTexture){let we=L.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),we){let ye=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,we.removeEventListener("dispose",ye)};we.addEventListener("dispose",ye),E.__depthDisposeCallback=ye}E.__boundDepthTexture=we}if(L.depthTexture&&!E.__autoAllocateDepthBuffer)if(Q)for(let we=0;we<6;we++)rt(E.__webglFramebuffer[we],L,we);else L.texture.mipmaps.length>0?rt(E.__webglFramebuffer[0],L,0):rt(E.__webglFramebuffer,L,0);else if(Q){E.__webglDepthbuffer=[];for(let we=0;we<6;we++)if(t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[we]),E.__webglDepthbuffer[we]===void 0)E.__webglDepthbuffer[we]=s.createRenderbuffer(),zt(E.__webglDepthbuffer[we],L,!1);else{let ye=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=E.__webglDepthbuffer[we];s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,ye,s.RENDERBUFFER,de)}}else if(L.texture.mipmaps.length>0?t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=s.createRenderbuffer(),zt(E.__webglDepthbuffer,L,!1);else{let ye=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,de=E.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,de),s.framebufferRenderbuffer(s.FRAMEBUFFER,ye,s.RENDERBUFFER,de)}t.bindFramebuffer(s.FRAMEBUFFER,null)}function sn(L,E,Q){let we=n.get(L);E!==void 0&&yt(we.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),Q!==void 0&&Ft(L)}function rn(L){let E=L.texture,Q=n.get(L),we=n.get(E);L.addEventListener("dispose",H),F(L);let ye=L.textures,de=L.isWebGLCubeRenderTarget===!0,re=ye.length>1;if(re||(we.__webglTexture===void 0&&(we.__webglTexture=s.createTexture()),we.__version=E.version,o.memory.textures++),de){Q.__webglFramebuffer=[];for(let N=0;N<6;N++)if(E.mipmaps.length>0){Q.__webglFramebuffer[N]=[];for(let fe=0;fe<E.mipmaps.length;fe++)Q.__webglFramebuffer[N][fe]=s.createFramebuffer()}else Q.__webglFramebuffer[N]=s.createFramebuffer()}else{if(E.mipmaps.length>0){Q.__webglFramebuffer=[];for(let N=0;N<E.mipmaps.length;N++)Q.__webglFramebuffer[N]=s.createFramebuffer()}else Q.__webglFramebuffer=s.createFramebuffer();if(re)for(let N=0,fe=ye.length;N<fe;N++){let Ce=n.get(ye[N]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=s.createTexture(),o.memory.textures++)}if(L.samples>0&&Me(L)===!1){Q.__webglMultisampledFramebuffer=s.createFramebuffer(),Q.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,Q.__webglMultisampledFramebuffer);for(let N=0;N<ye.length;N++){let fe=ye[N];Q.__webglColorRenderbuffer[N]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,Q.__webglColorRenderbuffer[N]);let Ce=r.convert(fe.format,fe.colorSpace),B=r.convert(fe.type),xe=T(fe.internalFormat,Ce,B,fe.normalized,fe.colorSpace,L.isXRRenderTarget===!0),K=Ut(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,K,xe,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+N,s.RENDERBUFFER,Q.__webglColorRenderbuffer[N])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&(Q.__webglDepthRenderbuffer=s.createRenderbuffer(),zt(Q.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(de){t.bindTexture(s.TEXTURE_CUBE_MAP,we.__webglTexture),Ne(s.TEXTURE_CUBE_MAP,E);for(let N=0;N<6;N++)if(E.mipmaps.length>0)for(let fe=0;fe<E.mipmaps.length;fe++)yt(Q.__webglFramebuffer[N][fe],L,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+N,fe);else yt(Q.__webglFramebuffer[N],L,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+N,0);x(E)?v(s.TEXTURE_CUBE_MAP):E.mipmaps.length>0&&s.texParameteri(s.TEXTURE_CUBE_MAP,s.TEXTURE_MAX_LEVEL,E.mipmaps.length-1),t.unbindTexture()}else if(re){for(let N=0,fe=ye.length;N<fe;N++){let Ce=ye[N],B=n.get(Ce),xe=s.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(xe=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(xe,B.__webglTexture),Ne(xe,Ce),yt(Q.__webglFramebuffer,L,Ce,s.COLOR_ATTACHMENT0+N,xe,0),x(Ce)&&v(xe)}t.unbindTexture()}else{let N=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(N=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(N,we.__webglTexture),Ne(N,E),E.mipmaps.length>0)for(let fe=0;fe<E.mipmaps.length;fe++)yt(Q.__webglFramebuffer[fe],L,E,s.COLOR_ATTACHMENT0,N,fe);else yt(Q.__webglFramebuffer,L,E,s.COLOR_ATTACHMENT0,N,0);x(E)?v(N):E.mipmaps.length>0&&s.texParameteri(N,s.TEXTURE_MAX_LEVEL,E.mipmaps.length-1),t.unbindTexture()}L.depthBuffer&&Ft(L)}function X(L){let E=L.textures;for(let Q=0,we=E.length;Q<we;Q++){let ye=E[Q];if(x(ye)&&ye.mipmapsAutoUpdate===!0){let de=w(L),re=n.get(ye).__webglTexture;t.bindTexture(de,re),v(de),t.unbindTexture()}}}let ft=[];function It(L){if(L.samples>0){if(Me(L)===!1){let E=L.textures,Q=L.width,we=L.height,ye=s.COLOR_BUFFER_BIT,de=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,re=n.get(L),N=E.length>1;if(N)for(let Ce=0;Ce<E.length;Ce++)t.bindFramebuffer(s.FRAMEBUFFER,re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,re.__webglMultisampledFramebuffer),L.texture.mipmaps.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,re.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,re.__webglFramebuffer);for(let Ce=0;Ce<E.length;Ce++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(ye|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(ye|=s.STENCIL_BUFFER_BIT)),N){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,re.__webglColorRenderbuffer[Ce]);let B=n.get(E[Ce]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,B,0)}s.blitFramebuffer(0,0,Q,we,0,0,Q,we,ye,s.NEAREST),l===!0&&(ft.length=0,ft.push(s.COLOR_ATTACHMENT0+Ce),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&ft.push(de),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ft))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),N)for(let Ce=0;Ce<E.length;Ce++){t.bindFramebuffer(s.FRAMEBUFFER,re.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,re.__webglColorRenderbuffer[Ce]);let B=n.get(E[Ce]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,re.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,B,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,re.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&l){let E=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[E])}}}function Ut(L){return Math.min(i.maxSamples,L.samples)}function Me(L){let E=n.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function Re(L){let E=o.render.frame;u.get(L)!==E&&(u.set(L,E),L.update())}function Ve(L,E){let Q=L.colorSpace,we=L.format,ye=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||Q!==On&&Q!==ns&&(Tt.getTransfer(Q)===Gt?(we!==ai||ye!==Xn)&&it("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ht("WebGLTextures: Unsupported texture color space:",Q)),E}function ke(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=et,this.resetTextureUnits=le,this.getTextureUnits=Se,this.setTextureUnits=Le,this.setTexture2D=he,this.setTexture2DArray=Ee,this.setTexture3D=Fe,this.setTextureCube=_e,this.rebindTextures=sn,this.setupRenderTarget=rn,this.updateRenderTargetMipmap=X,this.updateMultisampleRenderTarget=It,this.setupDepthRenderbuffer=Ft,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=Me,this.dispose=q}function $v(s,e){function t(n,i=ns){let r,o=Tt.getTransfer(i);if(n===Xn)return s.UNSIGNED_BYTE;if(n===Kl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Zl)return s.UNSIGNED_SHORT_5_5_5_1;if(n===nu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===iu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===eu)return s.BYTE;if(n===tu)return s.SHORT;if(n===eo)return s.UNSIGNED_SHORT;if(n===Yl)return s.INT;if(n===pi)return s.UNSIGNED_INT;if(n===ti)return s.FLOAT;if(n===mi)return s.HALF_FLOAT;if(n===su)return s.ALPHA;if(n===ru)return s.RGB;if(n===ai)return s.RGBA;if(n===Wi)return s.DEPTH_COMPONENT;if(n===ts)return s.DEPTH_STENCIL;if(n===$l)return s.RED;if(n===Jl)return s.RED_INTEGER;if(n===bs)return s.RG;if(n===jl)return s.RG_INTEGER;if(n===Ql)return s.RGBA_INTEGER;if(n===la||n===ca||n===ha||n===ua)if(o===Gt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===la)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ua)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===la)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ca)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ha)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ua)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ec||n===tc||n===nc||n===ic)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ec)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===tc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===nc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ic)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===sc||n===rc||n===oc||n===ac||n===lc||n===da||n===cc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===sc||n===rc)return o===Gt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===oc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ac)return r.COMPRESSED_R11_EAC;if(n===lc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===da)return r.COMPRESSED_RG11_EAC;if(n===cc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===hc||n===uc||n===dc||n===fc||n===pc||n===mc||n===gc||n===_c||n===yc||n===xc||n===vc||n===Mc||n===bc||n===Sc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===hc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===uc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===dc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===fc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===pc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===mc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===gc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===_c)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===yc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===xc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===vc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Mc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===bc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Sc)return o===Gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ec||n===Tc||n===wc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Ec)return o===Gt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Tc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===wc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ac||n===Rc||n===fa||n===Cc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ac)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Rc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===fa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Cc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===tr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}var Jv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jv=`
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

}`,Cu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Go(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ei({vertexShader:Jv,fragmentShader:jv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Jt(new Xs(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Pu=class extends ri{constructor(e,t){super();let n=this,i=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,g=null,_=typeof XRWebGLBinding<"u",p=new Cu,m={},y=t.getContextAttributes(),x=null,v=null,w=[],T=[],M=new be,S=null,F=null,P=new gn;P.viewport=new qt;let k=new gn;k.viewport=new qt;let H=[P,k],z=new Hl,U=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(V){let he=w[V];return he===void 0&&(he=new Ur,w[V]=he),he.getTargetRaySpace()},this.getControllerGrip=function(V){let he=w[V];return he===void 0&&(he=new Ur,w[V]=he),he.getGripSpace()},this.getHand=function(V){let he=w[V];return he===void 0&&(he=new Ur,w[V]=he),he.getHandSpace()};function $(V){let he=T.indexOf(V.inputSource);if(he===-1)return;let Ee=w[he];Ee!==void 0&&(Ee.update(V.inputSource,V.frame,c||o),Ee.dispatchEvent({type:V.type,data:V.inputSource}))}function W(){i.removeEventListener("select",$),i.removeEventListener("selectstart",$),i.removeEventListener("selectend",$),i.removeEventListener("squeeze",$),i.removeEventListener("squeezestart",$),i.removeEventListener("squeezeend",$),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",me);for(let V=0;V<w.length;V++){let he=T[V];he!==null&&(T[V]=null,w[V].disconnect(he))}U=null,q=null,p.reset();for(let V in m)delete m[V];if(e.setRenderTarget(x),f=null,h=null,d=null,i=null,v=null,et.stop(),n.isPresenting=!1,e.setPixelRatio(S),e.setSize(M.width,M.height,!1),F!==null){let V=F.camera;V.fov=F.fov,V.zoom=F.zoom,V.updateProjectionMatrix(),F=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(V){r=V,n.isPresenting===!0&&it("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(V){a=V,n.isPresenting===!0&&it("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(V){c=V},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(i,t)),d},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(V){if(i=V,i!==null){if(x=e.getRenderTarget(),i.addEventListener("select",$),i.addEventListener("selectstart",$),i.addEventListener("selectend",$),i.addEventListener("squeeze",$),i.addEventListener("squeezestart",$),i.addEventListener("squeezeend",$),i.addEventListener("end",W),i.addEventListener("inputsourceschange",me),y.xrCompatible!==!0&&await t.makeXRCompatible(),S=e.getPixelRatio(),e.getSize(M),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Ee=null,Fe=null,_e=null;y.depth&&(_e=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Ee=y.stencil?ts:Wi,Fe=y.stencil?tr:pi);let ce={colorFormat:t.RGBA8,depthFormat:_e,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(ce),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),v=new jn(h.textureWidth,h.textureHeight,{format:ai,type:Xn,depthTexture:new Zi(h.textureWidth,h.textureHeight,Fe,void 0,void 0,void 0,void 0,void 0,void 0,Ee),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let Ee={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,Ee),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new jn(f.framebufferWidth,f.framebufferHeight,{format:ai,type:Xn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),et.setContext(i),et.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function me(V){for(let he=0;he<V.removed.length;he++){let Ee=V.removed[he],Fe=T.indexOf(Ee);Fe>=0&&(T[Fe]=null,w[Fe].disconnect(Ee))}for(let he=0;he<V.added.length;he++){let Ee=V.added[he],Fe=T.indexOf(Ee);if(Fe===-1){for(let ce=0;ce<w.length;ce++)if(ce>=T.length){T.push(Ee),Fe=ce;break}else if(T[ce]===null){T[ce]=Ee,Fe=ce;break}if(Fe===-1)break}let _e=w[Fe];_e&&_e.connect(Ee)}}function J(V,he){he===null?V.matrixWorld.copy(V.matrix):V.matrixWorld.multiplyMatrices(he.matrixWorld,V.matrix),V.matrixWorldInverse.copy(V.matrixWorld).invert()}this.updateCamera=function(V){if(i===null)return;let he=V.near,Ee=V.far;p.texture!==null&&(p.depthNear>0&&(he=p.depthNear),p.depthFar>0&&(Ee=p.depthFar)),z.near=k.near=P.near=he,z.far=k.far=P.far=Ee,(U!==z.near||q!==z.far)&&(i.updateRenderState({depthNear:z.near,depthFar:z.far}),U=z.near,q=z.far),z.layers.mask=V.layers.mask|6,P.layers.mask=z.layers.mask&-5,k.layers.mask=z.layers.mask&-3;let Fe=V.parent,_e=z.cameras;J(z,Fe);for(let ce=0;ce<_e.length;ce++)J(_e[ce],Fe);z.projectionMatrix.copy(P.projectionMatrix),z.projectionMatrixInverse.copy(P.projectionMatrixInverse),F===null&&V.isPerspectiveCamera&&(F={camera:V,fov:V.fov,zoom:V.zoom}),le(V,z,Fe)};function le(V,he,Ee){Ee===null?V.matrix.copy(he.matrixWorld):(V.matrix.copy(Ee.matrixWorld),V.matrix.invert(),V.matrix.multiply(he.matrixWorld)),V.matrix.decompose(V.position,V.quaternion,V.scale),V.updateMatrixWorld(!0),V.projectionMatrix.copy(he.projectionMatrix),V.projectionMatrixInverse.copy(he.projectionMatrixInverse),V.isPerspectiveCamera&&(V.fov=Os*2*Math.atan(1/V.projectionMatrix.elements[5]),V.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(V){l=V,h!==null&&(h.fixedFoveation=V),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=V)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(z)},this.getCameraTexture=function(V){return m[V]};let Se=null;function Le(V,he){if(u=he.getViewerPose(c||o),g=he,u!==null){let Ee=u.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Fe=!1;Ee.length!==z.cameras.length&&(z.cameras.length=0,Fe=!0);for(let ve=0;ve<Ee.length;ve++){let Ne=Ee[ve],je=null;if(f!==null)je=f.getViewport(Ne);else{let st=d.getViewSubImage(h,Ne);je=st.viewport,ve===0&&(e.setRenderTargetTextures(v,st.colorTexture,st.depthStencilTexture),e.setRenderTarget(v))}let Ke=H[ve];Ke===void 0&&(Ke=new gn,Ke.layers.enable(ve),Ke.viewport=new qt,H[ve]=Ke),Ke.matrix.fromArray(Ne.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(Ne.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(je.x,je.y,je.width,je.height),ve===0&&(z.matrix.copy(Ke.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Fe===!0&&z.cameras.push(Ke)}let _e=i.enabledFeatures;if(_e&&_e.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){d=n.getBinding();let ve=d.getDepthInformation(Ee[0]);ve&&ve.isValid&&ve.texture&&p.init(ve,i.renderState)}if(_e&&_e.includes("camera-access")&&_){e.state.unbindTexture(),d=n.getBinding();for(let ve=0;ve<Ee.length;ve++){let Ne=Ee[ve].camera;if(Ne){let je=m[Ne];je||(je=new Go,m[Ne]=je);let Ke=d.getCameraImage(Ne);je.sourceTexture=Ke}}}}for(let Ee=0;Ee<w.length;Ee++){let Fe=T[Ee],_e=w[Ee];Fe!==null&&_e!==void 0&&_e.update(Fe,he,c||o)}Se&&Se(V,he),he.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:he}),g=null}let et=new Wp;et.setAnimationLoop(Le),this.setAnimationLoop=function(V){Se=V},this.dispose=function(){}}},Qv=new dt,em=new mt;em.set(-1,0,0,0,1,0,0,0,1);function eM(s,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,_u(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,y,x,v){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),d(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),h(p,m),m.isMeshPhysicalMaterial&&f(p,m,v)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,y,x):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===zn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===zn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let y=e.get(m),x=y.envMap,v=y.envMapRotation;x&&(p.envMap.value=x,p.envMapRotation.value.setFromMatrix4(Qv.makeRotationFromEuler(v)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(em),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,y,x){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*y,p.scale.value=x*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function h(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,y){p.ior.value=m.ior,m.diffuseRoughness>0&&(p.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(p.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,p.diffuseRoughnessMapTransform))),m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===zn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=y.texture,p.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let y=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(y.matrixWorld),p.nearDistance.value=y.shadow.camera.near,p.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function tM(s,e,t,n){let i={},r={};function o(y,x){let v=x.program;n.uniformBlockBinding(y,v,i[y.id])}function a(y,x){let v=i[y.id];v===void 0&&(g(y),v=l(y),i[y.id]=v,y.addEventListener("dispose",p));let w=x.program;n.updateUBOMapping(y,w);let T=e.render.frame;r[y.id]!==T&&(c(y),r[y.id]=T)}function l(y){let x=s.createBuffer(),v=y.__size,w=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,x),s.bufferData(s.UNIFORM_BUFFER,v,w),s.bindBuffer(s.UNIFORM_BUFFER,null),x}function c(y){let x=i[y.id],v=y.uniforms,w=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,x);for(let T=0,M=v.length;T<M;T++){let S=v[T];if(Array.isArray(S))for(let F=0,P=S.length;F<P;F++)u(S[F],T,F,w);else u(S,T,0,w)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function u(y,x,v,w){if(h(y,x,v,w)===!0){let T=y.__offset,M=y.value;if(Array.isArray(M)){let S=0;for(let F=0;F<M.length;F++){let P=M[F],k=_(P,!0);d(P,y.__data,S),S+=k.storage/Float32Array.BYTES_PER_ELEMENT}}else d(M,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,T,y.__data)}}function d(y,x,v){typeof y=="number"||typeof y=="boolean"?x[v]=y:y.isMatrix3?(x[v]=y.elements[0],x[v+1]=y.elements[1],x[v+2]=y.elements[2],x[v+3]=0,x[v+4]=y.elements[3],x[v+5]=y.elements[4],x[v+6]=y.elements[5],x[v+7]=0,x[v+8]=y.elements[6],x[v+9]=y.elements[7],x[v+10]=y.elements[8],x[v+11]=0):ArrayBuffer.isView(y)?x.set(y.subarray(0,x.length-v),v):y.toArray(x,v)}function h(y,x,v,w){let T=y.value,M=x+"_"+v;if(Array.isArray(T)){w[M]===void 0&&(w[M]=[]);let S=w[M],F=!1;for(let P=0;P<T.length;P++)f(T[P],S,P)===!0&&(F=!0);return F}return f(T,w,M)}function f(y,x,v){if(x[v]===void 0)return typeof y=="number"||typeof y=="boolean"?x[v]=y:ArrayBuffer.isView(y)?x[v]=y.slice():x[v]=y.clone(),!0;{let w=x[v];if(typeof y=="number"||typeof y=="boolean"){if(w!==y)return x[v]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(w.equals(y)===!1)return w.copy(y),!0}}return!1}function g(y){let x=y.uniforms,v=0,w=16;for(let M=0,S=x.length;M<S;M++){let F=Array.isArray(x[M])?x[M]:[x[M]];for(let P=0,k=F.length;P<k;P++){let H=F[P],z=Array.isArray(H.value)?H.value:[H.value],U=Array.isArray(x[M])||Array.isArray(H.value),q=v;for(let W=0,me=z.length;W<me;W++){let J=z[W],le=_(J,U),Se=v%w,Le=Se%le.boundary,et=Se+Le;v+=Le,et!==0&&w-et<le.storage&&(v+=w-et),W===0&&(q=v),v+=le.storage}let $=H.type==="int"?Int32Array:H.type==="uint"?Uint32Array:Float32Array;H.__data=new $((v-q)/Float32Array.BYTES_PER_ELEMENT),H.__offset=q}}let T=v%w;return T>0&&(v+=w-T),y.__size=v,y.__cache={},this}function _(y,x){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=16,v.storage=48):y.isMatrix4?(v.boundary=16,v.storage=64):y.isTexture?it("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(v.boundary=16,v.storage=y.byteLength):it("WebGLRenderer: Unsupported uniform value type.",y),x===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function p(y){let x=y.target;x.removeEventListener("dispose",p),s.deleteBuffer(i[x.id]),delete i[x.id],delete r[x.id]}function m(){for(let y in i)s.deleteBuffer(i[y]);i={},r={}}return{bind:o,update:a,dispose:m}}var nM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Pi=null;function iM(){return Pi===null&&(Pi=new Fr(nM,16,16,bs,mi),Pi.name="DFG_LUT",Pi.minFilter=yn,Pi.magFilter=yn,Pi.wrapS=ii,Pi.wrapT=ii,Pi.generateMipmaps=!1,Pi.needsUpdate=!0),Pi}var Fc=class{constructor(e={}){let{canvas:t=hp(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:f=Xn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let _=f,p=new Set([Ql,jl,Jl]),m=new Set([Xn,pi,eo,tr,Kl,Zl]),y=new Uint32Array(4),x=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]},w=null,T=null,M=[],S=[],F=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ci,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,k=!1,H=null,z=null,U=null,q=null;this._outputColorSpace=Kt;let $=0,W=0,me=null,J=-1,le=null,Se=new qt,Le=new qt,et=null,V=new nt(0),he=0,Ee=t.width,Fe=t.height,_e=1,ce=null,Ie=null,ve=new qt(0,0,Ee,Fe),Ne=new qt(0,0,Ee,Fe),je=!1,Ke=new ps,st=new wl,gt=!1,Pt=!1,yt=new dt,zt=new D,rt=new qt,Ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},sn=!1;function rn(){return me===null?_e:1}let X=n;function ft(R,G){return t.getContext(R,G)}let It,Ut,Me,Re,Ve,ke,L,E,Q,we,ye,de,re,N,fe,Ce,B,xe,K,oe,ge,Te,We;try{let R={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"187"}`),t.addEventListener("webglcontextlost",Qe,!1),t.addEventListener("webglcontextrestored",_t,!1),t.addEventListener("webglcontextcreationerror",Oe,!1),X===null){let G="webgl2";if(X=ft(G,R),X===null)throw ft(G)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ot()}catch(R){throw t.removeEventListener("webglcontextlost",Qe,!1),t.removeEventListener("webglcontextrestored",_t,!1),t.removeEventListener("webglcontextcreationerror",Oe,!1),ht("WebGLRenderer: "+R.message),R}function ot(){It=new px(X),It.init(),ge=new $v(X,It),Ut=new ix(X,It,e,ge),Me=new Kv(X,It),Ut.reversedDepthBuffer&&h&&Me.buffers.depth.setReversed(!0),z=X.createFramebuffer(),U=X.createFramebuffer(),q=X.createFramebuffer(),Re=new _x(X),Ve=new Nv,ke=new Zv(X,It,Me,Ve,Ut,ge,Re),L=new fx(P),E=new xg(X),Te=new tx(X,E),Q=new mx(X,E,Re,Te),we=new xx(X,Q,E,Te,Re),xe=new yx(X,Ut,ke),fe=new sx(Ve),ye=new Dv(P,L,It,Ut,Te,fe),de=new eM(P,Ve),re=new Ov,N=new Gv(It),B=new ex(P,L,Me,we,g,l),Ce=new Yv(P,we,Ut),We=new tM(X,Re,Ut,Me),K=new nx(X,It,Re),oe=new gx(X,It,Re),Re.programs=ye.programs,P.capabilities=Ut,P.extensions=It,P.properties=Ve,P.renderLists=re,P.shadowMap=Ce,P.state=Me,P.info=Re}_!==Xn&&(F=new Mx(_,t.width,t.height,a,i,r));let Ae=new Pu(P,X);this.xr=Ae,this.getContext=function(){return X},this.getContextAttributes=function(){return X.getContextAttributes()},this.forceContextLoss=function(){let R=It.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){let R=It.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return _e},this.setPixelRatio=function(R){R!==void 0&&(_e=R,this.setSize(Ee,Fe,!1))},this.getSize=function(R){return R.set(Ee,Fe)},this.setSize=function(R,G,se=!0){if(Ae.isPresenting){it("WebGLRenderer: Can't change size while VR device is presenting.");return}Ee=R,Fe=G,t.width=Math.floor(R*_e),t.height=Math.floor(G*_e),se===!0&&(t.style.width=R+"px",t.style.height=G+"px"),F!==null&&F.setSize(t.width,t.height),this.setViewport(0,0,R,G)},this.getDrawingBufferSize=function(R){return R.set(Ee*_e,Fe*_e).floor()},this.setDrawingBufferSize=function(R,G,se){Ee=R,Fe=G,_e=se,t.width=Math.floor(R*se),t.height=Math.floor(G*se),this.setViewport(0,0,R,G)},this.setEffects=function(R){if(_===Xn){ht("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(R){for(let G=0;G<R.length;G++)if(R[G].isOutputPass===!0){it("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(R||[])},this.getCurrentViewport=function(R){return R.copy(Se)},this.getViewport=function(R){return R.copy(ve)},this.setViewport=function(R,G,se,j){R.isVector4?ve.set(R.x,R.y,R.z,R.w):ve.set(R,G,se,j),Me.viewport(Se.copy(ve).multiplyScalar(rn()).round())},this.getScissor=function(R){return R.copy(Ne)},this.setScissor=function(R,G,se,j){R.isVector4?Ne.set(R.x,R.y,R.z,R.w):Ne.set(R,G,se,j),Me.scissor(Le.copy(Ne).multiplyScalar(rn()).round())},this.getScissorTest=function(){return je},this.setScissorTest=function(R){Me.setScissorTest(je=R)},this.setOpaqueSort=function(R){ce=R},this.setTransparentSort=function(R){Ie=R},this.getClearColor=function(R){return R.copy(B.getClearColor())},this.setClearColor=function(){B.setClearColor(...arguments)},this.getClearAlpha=function(){return B.getClearAlpha()},this.setClearAlpha=function(){B.setClearAlpha(...arguments)},this.clear=function(R=!0,G=!0,se=!0){let j=0;if(R){let ee=!1;if(me!==null){let Ue=me.texture.format;ee=p.has(Ue)}if(ee){let Ue=me.texture.type,Ye=m.has(Ue),De=B.getClearColor(),ze=B.getClearAlpha(),Je=De.r,pt=De.g,bt=De.b;Ye?(y[0]=Je,y[1]=pt,y[2]=bt,y[3]=ze,X.clearBufferuiv(X.COLOR,0,y)):(x[0]=Je,x[1]=pt,x[2]=bt,x[3]=ze,X.clearBufferiv(X.COLOR,0,x))}else j|=X.COLOR_BUFFER_BIT}G&&(j|=X.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),se&&(j|=X.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j!==0&&X.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(R){R.setRenderer(this),H=R},this.dispose=function(){t.removeEventListener("webglcontextlost",Qe,!1),t.removeEventListener("webglcontextrestored",_t,!1),t.removeEventListener("webglcontextcreationerror",Oe,!1),B.dispose(),re.dispose(),N.dispose(),ke.dispose(),Ve.dispose(),L.dispose(),we.dispose(),Q.dispose(),Te.dispose(),We.dispose(),ye.dispose(),Ae.dispose(),Ae.removeEventListener("sessionstart",Ta),Ae.removeEventListener("sessionend",rs),Di.stop()};function Qe(R){R.preventDefault(),Co("WebGLRenderer: Context Lost."),k=!0}function _t(){Co("WebGLRenderer: Context Restored."),k=!1;let R=Re.autoReset,G=Ce.enabled,se=Ce.autoUpdate,j=Ce.needsUpdate,ee=Ce.type;ot(),Re.autoReset=R,Ce.enabled=G,Ce.autoUpdate=se,Ce.needsUpdate=j,Ce.type=ee}function Oe(R){ht("WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function Dt(R){let G=R.target;G.removeEventListener("dispose",Dt),on(G)}function on(R){_i(R),Ve.remove(R)}function _i(R){let G=Ve.get(R).programs;G!==void 0&&(G.forEach(function(se){ye.releaseProgram(se)}),R.isShaderMaterial&&ye.releaseShaderCache(R))}this.renderBufferDirect=function(R,G,se,j,ee,Ue){G===null&&(G=Ft);let Ye=ee.isMesh&&ee.matrixWorld.determinantAffine()<0,De=Da(R,G,se,j,ee);Me.setMaterial(j,Ye);let ze=se.index,Je=1;if(j.wireframe===!0){if(ze=Q.getWireframeAttribute(se),ze===void 0)return;Je=2}let pt=se.drawRange,bt=se.attributes.position,Xe=pt.start*Je,Mt=(pt.start+pt.count)*Je;Ue!==null&&(Xe=Math.max(Xe,Ue.start*Je),Mt=Math.min(Mt,(Ue.start+Ue.count)*Je)),ze!==null?(Xe=Math.max(Xe,0),Mt=Math.min(Mt,ze.count)):bt!=null&&(Xe=Math.max(Xe,0),Mt=Math.min(Mt,bt.count));let Zt=Mt-Xe;if(Zt<0||Zt===1/0)return;Te.setup(ee,j,De,se,ze);let Vt,Ht=K;if(ze!==null&&(Vt=E.get(ze),Ht=oe,Ht.setIndex(Vt)),ee.isMesh)j.wireframe===!0?(Me.setLineWidth(j.wireframeLinewidth*rn()),Ht.setMode(X.LINES)):Ht.setMode(X.TRIANGLES);else if(ee.isLine){let bn=j.linewidth;bn===void 0&&(bn=1),Me.setLineWidth(bn*rn()),ee.isLineSegments?Ht.setMode(X.LINES):ee.isLineLoop?Ht.setMode(X.LINE_LOOP):Ht.setMode(X.LINE_STRIP)}else ee.isPoints?Ht.setMode(X.POINTS):ee.isSprite&&Ht.setMode(X.TRIANGLES);if(ee.isBatchedMesh)if(It.get("WEBGL_multi_draw"))Ht.renderMultiDraw(ee._multiDrawStarts,ee._multiDrawCounts,ee._multiDrawCount);else{let bn=ee._multiDrawStarts,Ze=ee._multiDrawCounts,wn=ee._multiDrawCount,Nt=ze?E.get(ze).bytesPerElement:1,Ni=Ve.get(j).currentProgram.getUniforms();for(let Sn=0;Sn<wn;Sn++)Ni.setValue(X,"_gl_DrawID",Sn),Ht.render(bn[Sn]/Nt,Ze[Sn])}else if(ee.isInstancedMesh)Ht.renderInstances(Xe,Zt,ee.count);else if(se.isInstancedBufferGeometry){let bn=se._maxInstanceCount!==void 0?se._maxInstanceCount:1/0,Ze=Math.min(se.instanceCount,bn);Ht.renderInstances(Xe,Zt,Ze)}else Ht.render(Xe,Zt)};function or(R,G,se,j){H!==null&&R.isNodeMaterial&&H.setObject(j,R),gt===!0&&fe.setState(R,se,!1),R.transparent===!0&&R.side===Tn&&R.forceSinglePass===!1?(R.side=zn,R.needsUpdate=!0,Ts(R,G,j),R.side=Ri,R.needsUpdate=!0,Ts(R,G,j),R.side=Tn):Ts(R,G,j)}this.compile=function(R,G,se=null){se===null&&(se=R),H!==null&&H.renderStart(R,G,se),T=N.get(se),T.init(G),S.push(T),se.traverseVisible(function(ee){ee.isLight&&ee.layers.test(G.layers)&&(T.pushLight(ee),ee.castShadow&&T.pushShadow(ee))}),R!==se&&R.traverseVisible(function(ee){ee.isLight&&ee.layers.test(G.layers)&&(T.pushLight(ee),ee.castShadow&&T.pushShadow(ee))}),T.setupLights(),H!==null&&H.updateLights(T.state.lightsArray),Pt=this.localClippingEnabled,gt=fe.init(this.clippingPlanes,Pt),gt===!0&&fe.setGlobalState(this.clippingPlanes,G),H!==null&&Ce.render(T.state.shadowsArray,se,G);let j=new Set;return R.traverse(function(ee){if(!(ee.isMesh||ee.isPoints||ee.isLine||ee.isSprite))return;let Ue=ee.material;if(Ue)if(Array.isArray(Ue))for(let Ye=0;Ye<Ue.length;Ye++){let De=Ue[Ye];or(De,se,G,ee),j.add(De)}else or(Ue,se,G,ee),j.add(Ue)}),T=S.pop(),H!==null&&H.renderEnd(),j},this.compileAsync=function(R,G,se=null){let j=this.compile(R,G,se);return new Promise(ee=>{function Ue(){if(j.forEach(function(Ye){let ze=Ve.get(Ye).currentProgram;(ze===void 0||ze.isReady())&&j.delete(Ye)}),j.size===0){ee(R);return}setTimeout(Ue,10)}It.get("KHR_parallel_shader_compile")!==null?Ue():setTimeout(Ue,10)})};let ao=null;function Jc(R){ao&&ao(R)}function Ta(){Di.stop()}function rs(){Di.start()}let Di=new Wp;Di.setAnimationLoop(Jc),typeof self<"u"&&Di.setContext(self),this.setAnimationLoop=function(R){ao=R,Ae.setAnimationLoop(R),R===null?Di.stop():Di.start()},Ae.addEventListener("sessionstart",Ta),Ae.addEventListener("sessionend",rs),this.render=function(R,G){if(G!==void 0&&G.isCamera!==!0){ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(k===!0)return;H!==null&&H.renderStart(R,G);let se=Ae.enabled===!0&&Ae.isPresenting===!0,j=F!==null&&(me===null||se)&&F.begin(P,me);if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),Ae.enabled===!0&&Ae.isPresenting===!0&&(F===null||F.isCompositing()===!1)&&(Ae.cameraAutoUpdate===!0&&Ae.updateCamera(G),G=Ae.getCamera()),R.isScene===!0&&R.onBeforeRender(P,R,G,me),T=N.get(R,S.length),T.init(G),T.state.textureUnits=ke.getTextureUnits(),S.push(T),yt.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),G.isArrayCamera?st.setFromArrayCamera(G):Ke.setFromProjectionMatrix(yt,si,G.reversedDepth),Pt=this.localClippingEnabled,gt=fe.init(this.clippingPlanes,Pt),w=re.get(R,M.length),w.init(),M.push(w),this.info.render.frame++,Ae.enabled===!0&&Ae.isPresenting===!0){let Ye=P.xr.getDepthSensingMesh();Ye!==null&&lo(Ye,G,-1/0,P.sortObjects)}lo(R,G,0,P.sortObjects),w.finish(),H!==null&&H.updateLights(T.state.lightsArray),P.sortObjects===!0&&w.sort(ce,Ie),sn=Ae.enabled===!1||Ae.isPresenting===!1||Ae.hasDepthSensing()===!1,sn&&B.addToRenderList(w,R),this.info.autoReset===!0&&this.info.reset(),gt===!0&&fe.beginShadows();let ee=T.state.shadowsArray;if(Ce.render(ee,R,G),gt===!0&&fe.endShadows(),(j&&F.hasRenderPass())===!1){let Ye=w.opaque,De=w.transmissive;if(T.setupLights(),G.isArrayCamera){let ze=G.cameras;if(De.length>0)for(let Je=0,pt=ze.length;Je<pt;Je++){let bt=ze[Je];Aa(Ye,De,R,bt)}sn&&B.render(R);for(let Je=0,pt=ze.length;Je<pt;Je++){let bt=ze[Je];wa(w,R,bt,bt.viewport)}}else De.length>0&&Aa(Ye,De,R,G),sn&&B.render(R),wa(w,R,G)}me!==null&&W===0&&(ke.updateMultisampleRenderTarget(me),ke.updateRenderTargetMipmap(me)),j&&F.end(P),R.isScene===!0&&R.onAfterRender(P,R,G),Te.resetDefaultState(),J=-1,le=null,S.pop(),S.length>0?(T=S[S.length-1],ke.setTextureUnits(T.state.textureUnits),gt===!0&&fe.setGlobalState(P.clippingPlanes,T.state.camera)):T=null,M.pop(),M.length>0?w=M[M.length-1]:w=null,H!==null&&H.renderEnd()};function lo(R,G,se,j){if(R.visible===!1)return;if(R.layers.test(G.layers)){if(R.isGroup)se=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(G);else if(R.isLight)T.pushLight(R),R.castShadow&&T.pushShadow(R);else if(R.isSprite){let Ye=G.isArrayCamera?st:Ke;if(!R.frustumCulled||R.intersectsFrustum(Ye)){j&&rt.setFromMatrixPosition(R.matrixWorld).applyMatrix4(yt);let De=we.update(R),ze=R.material;ze.visible&&w.push(R,De,ze,se,rt.z,null,G)}}else if(R.isMesh||R.isLine||R.isPoints){let Ye=G.isArrayCamera?st:Ke;if(!R.frustumCulled||R.intersectsFrustum(Ye)){let De=we.update(R),ze=R.material;if(j&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),rt.copy(R.boundingSphere.center)):(De.boundingSphere===null&&De.computeBoundingSphere(),rt.copy(De.boundingSphere.center)),rt.applyMatrix4(R.matrixWorld).applyMatrix4(yt)),Array.isArray(ze)){let Je=De.groups;for(let pt=0,bt=Je.length;pt<bt;pt++){let Xe=Je[pt],Mt=ze[Xe.materialIndex];Mt&&Mt.visible&&w.push(R,De,Mt,se,rt.z,Xe,G)}}else ze.visible&&w.push(R,De,ze,se,rt.z,null,G)}}}let Ue=R.children;for(let Ye=0,De=Ue.length;Ye<De;Ye++)lo(Ue[Ye],G,se,j)}function wa(R,G,se,j){let{opaque:ee,transmissive:Ue,transparent:Ye}=R;T.setupLightsView(se),gt===!0&&fe.setGlobalState(P.clippingPlanes,se),j&&Me.viewport(Se.copy(j)),ee.length>0&&ar(ee,G,se),Ue.length>0&&ar(Ue,G,se),Ye.length>0&&ar(Ye,G,se),Me.buffers.depth.setTest(!0),Me.buffers.depth.setMask(!0),Me.buffers.color.setMask(!0),Me.setPolygonOffset(!1)}function Aa(R,G,se,j){if((se.isScene===!0?se.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[j.id]===void 0){let Xe=It.has("EXT_color_buffer_half_float")||It.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[j.id]=new jn(1,1,{generateMipmaps:!0,type:Xe?mi:Xn,minFilter:oi,samples:Math.max(4,Ut.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Tt.workingColorSpace})}let Ue=T.state.transmissionRenderTarget[j.id],Ye=j.viewport||Se;Ue.setSize(Ye.z*P.transmissionResolutionScale,Ye.w*P.transmissionResolutionScale);let De=P.getRenderTarget(),ze=P.getActiveCubeFace(),Je=P.getActiveMipmapLevel();P.setRenderTarget(Ue),P.getClearColor(V),he=P.getClearAlpha(),he<1&&P.setClearColor(16777215,.5),P.clear(),sn&&B.render(se);let pt=P.toneMapping;P.toneMapping=Ci;let bt=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),T.setupLightsView(j),gt===!0&&fe.setGlobalState(P.clippingPlanes,j),ar(R,se,j),ke.updateMultisampleRenderTarget(Ue),ke.updateRenderTargetMipmap(Ue),It.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let Mt=0,Zt=G.length;Mt<Zt;Mt++){let Vt=G[Mt],{object:Ht,geometry:bn,material:Ze,group:wn}=Vt;if(Ze.side===Tn&&Ht.layers.test(j.layers)){let Nt=Ze.side;Ze.side=zn,Ze.needsUpdate=!0,Ra(Ht,se,j,bn,Ze,wn),Ze.side=Nt,Ze.needsUpdate=!0,Xe=!0}}Xe===!0&&(ke.updateMultisampleRenderTarget(Ue),ke.updateRenderTargetMipmap(Ue))}P.setRenderTarget(De,ze,Je),P.setClearColor(V,he),bt!==void 0&&(j.viewport=bt),P.toneMapping=pt}function ar(R,G,se){let j=G.isScene===!0?G.overrideMaterial:null;for(let ee=0,Ue=R.length;ee<Ue;ee++){let Ye=R[ee],{object:De,geometry:ze,group:Je}=Ye,pt=Ye.material;pt.allowOverride===!0&&j!==null&&(pt=j),De.layers.test(se.layers)&&Ra(De,G,se,ze,pt,Je)}}function Ra(R,G,se,j,ee,Ue){H!==null&&ee.isNodeMaterial&&H.setObject(R,ee),R.onBeforeRender(P,G,se,j,ee,Ue),R.modelViewMatrix.multiplyMatrices(se.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),ee.onBeforeRender(P,G,se,j,R,Ue),ee.transparent===!0&&ee.side===Tn&&ee.forceSinglePass===!1?(ee.side=zn,ee.needsUpdate=!0,P.renderBufferDirect(se,G,j,ee,R,Ue),ee.side=Ri,ee.needsUpdate=!0,P.renderBufferDirect(se,G,j,ee,R,Ue),ee.side=Tn):P.renderBufferDirect(se,G,j,ee,R,Ue),R.onAfterRender(P,G,se,j,ee,Ue)}function Ca(R){let G=0;for(let se of R)se.texture!==null&&G++;return G}function Ts(R,G,se){G.isScene!==!0&&(G=Ft);let j=Ve.get(R),ee=T.state.lights,Ue=T.state.shadowsArray,Ye=ee.state.version,De=ye.getParameters(R,ee.state,Ue,G,se,T.state.lightProbeGridArray),ze=ye.getProgramCacheKey(De),Je=j.programs;j.environment=R.isMeshStandardMaterial||R.isMeshLambertMaterial||R.isMeshPhongMaterial?G.environment:null,j.fog=G.fog;let pt=R.isMeshStandardMaterial||R.isMeshLambertMaterial&&!R.envMap||R.isMeshPhongMaterial&&!R.envMap;j.envMap=L.get(R.envMap||j.environment,pt),j.envMapRotation=j.environment!==null&&R.envMap===null?G.environmentRotation:R.envMapRotation,Je===void 0&&(R.addEventListener("dispose",Dt),Je=new Map,j.programs=Je,j.programVariants=new Map);let bt=Je.get(ze);if(bt!==void 0){if(j.currentProgram===bt&&j.lightsStateVersion===Ye)return La(R,De),bt}else De.uniforms=ye.getUniforms(R),H!==null&&R.isNodeMaterial&&H.build(R,se,De),R.onBeforeCompile(De,P),bt=ye.acquireProgram(De,ze),Je.set(ze,bt),j.uniforms=De.uniforms;let Xe=j.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(Xe.clippingPlanes=fe.uniform),La(R,De),j.needsLights=Ua(R),j.lightsStateVersion=Ye,j.needsLights&&(Xe.ambientLightColor.value=ee.state.ambient,Xe.lightProbe.value=ee.state.probe,Xe.sunLights.value=ee.state.sun,Xe.sunLightShadows.value=ee.state.sunShadow,Xe.directionalLights.value=ee.state.directional,Xe.directionalLightShadows.value=ee.state.directionalShadow,Xe.spotLights.value=ee.state.spot,Xe.spotLightShadows.value=ee.state.spotShadow,Xe.rectAreaLights.value=ee.state.rectArea,Xe.ltc_1.value=ee.state.rectAreaLTC1,Xe.ltc_2.value=ee.state.rectAreaLTC2,Xe.pointLights.value=ee.state.point,Xe.pointLightShadows.value=ee.state.pointShadow,Xe.hemisphereLights.value=ee.state.hemi,Xe.sunShadowMatrix.value=ee.state.sunShadowMatrix,Xe.sunShadowCascade.value=ee.state.sunShadowCascade,Xe.directionalShadowMatrix.value=ee.state.directionalShadowMatrix,Xe.spotLightMatrix.value=ee.state.spotLightMatrix,Xe.spotLightMap.value=ee.state.spotLightMap,Xe.pointShadowMatrix.value=ee.state.pointShadowMatrix),j.numLightProbeGrids=Ca(T.state.lightProbeGridArray),j.currentProgram=bt,j.uniformsList=null,bt}function Pa(R,G,se,j,ee){let Ue=Ve.get(R),Ye=Ue.currentProgram.id+","+j+","+ee,De=Ue.programVariants.get(Ye);return De===void 0?(De=Ts(R,G,se),Ue.programVariants.set(Ye,De)):(Ue.currentProgram=De,Ue.uniformsList=null,Ue.outputColorSpace=j,Ue.toneMapping=ee),De}function Ia(R){if(R.uniformsList===null){let G=R.currentProgram.getUniforms();R.uniformsList=no.seqWithValue(G.seq,R.uniforms)}return R.uniformsList}function La(R,G){let se=Ve.get(R);se.outputColorSpace=G.outputColorSpace,se.batching=G.batching,se.batchingColor=G.batchingColor,se.instancing=G.instancing,se.instancingColor=G.instancingColor,se.instancingMorph=G.instancingMorph,se.skinning=G.skinning,se.morphTargets=G.morphTargets,se.morphNormals=G.morphNormals,se.morphColors=G.morphColors,se.morphTargetsCount=G.morphTargetsCount,se.numClippingPlanes=G.numClippingPlanes,se.numIntersection=G.numClipIntersection,se.vertexAlphas=G.vertexAlphas,se.vertexTangents=G.vertexTangents,se.toneMapping=G.toneMapping}function Da(R,G,se,j,ee){G.isScene!==!0&&(G=Ft),ke.resetTextureUnits();let Ue=G.fog,Ye=j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial?G.environment:null,De=me===null?P.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:Tt.workingColorSpace,ze=j.isMeshStandardMaterial||j.isMeshLambertMaterial&&!j.envMap||j.isMeshPhongMaterial&&!j.envMap,Je=L.get(j.envMap||Ye,ze),pt=j.vertexColors===!0&&!!se.attributes.color&&se.attributes.color.itemSize===4,bt=!!se.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Xe=!!se.morphAttributes.position,Mt=!!se.morphAttributes.normal,Zt=!!se.morphAttributes.color,Vt=Ci;j.toneMapped&&(me===null||me.isXRRenderTarget===!0)&&(Vt=P.toneMapping);let Ht=se.morphAttributes.position||se.morphAttributes.normal||se.morphAttributes.color,bn=Ht!==void 0?Ht.length:0,Ze=Ve.get(j),wn=T.state.lights;if(gt===!0&&(Pt===!0||R!==le)){let xt=R===le&&j.id===J;fe.setState(j,R,xt)}let Nt=!1,Ni=!1;j.version===Ze.__version?Ze.needsLights&&Ze.lightsStateVersion!==wn.state.version||ee.isBatchedMesh&&Ze.batching===!1||!ee.isBatchedMesh&&Ze.batching===!0||ee.isBatchedMesh&&Ze.batchingColor===!0&&ee._colorsTexture===null||ee.isBatchedMesh&&Ze.batchingColor===!1&&ee._colorsTexture!==null||ee.isInstancedMesh&&Ze.instancing===!1||!ee.isInstancedMesh&&Ze.instancing===!0||ee.isSkinnedMesh&&Ze.skinning===!1||!ee.isSkinnedMesh&&Ze.skinning===!0||ee.isInstancedMesh&&Ze.instancingColor===!0&&ee.instanceColor===null||ee.isInstancedMesh&&Ze.instancingColor===!1&&ee.instanceColor!==null||ee.isInstancedMesh&&Ze.instancingMorph===!0&&ee.morphTexture===null||ee.isInstancedMesh&&Ze.instancingMorph===!1&&ee.morphTexture!==null||Ze.envMap!==Je||j.fog===!0&&Ze.fog!==Ue||Ze.numClippingPlanes!==void 0&&(Ze.numClippingPlanes!==fe.numPlanes||Ze.numIntersection!==fe.numIntersection)||Ze.vertexAlphas!==pt||Ze.vertexTangents!==bt||Ze.morphTargets!==Xe||Ze.morphNormals!==Mt||Ze.morphColors!==Zt||Ze.morphTargetsCount!==bn||Ze.numLightProbeGrids!==Ca(T.state.lightProbeGridArray)?Nt=!0:(Ze.outputColorSpace!==De||Ze.toneMapping!==Vt)&&(Ni=!0):(Nt=!0,Ze.__version=j.version);let Sn=Ze.currentProgram;(Nt===!0||Ni===!0)&&(Sn=Ni===!0?Pa(j,G,ee,De,Vt):Ts(j,G,ee),H&&j.isNodeMaterial&&H.onUpdateProgram(j,Sn,Ze));let ws=!1,yi=!1,Ui=!1,Et=Sn.getUniforms(),hn=Ze.uniforms;if(Me.useProgram(Sn.program)&&(ws=!0,yi=!0,Ui=!0),j.id!==J&&(J=j.id,yi=!0),ws||le!==R){Me.buffers.depth.getReversed()&&R.reversedDepth!==!0&&(R._reversedDepth=!0,R.updateProjectionMatrix()),Et.setValue(X,"projectionMatrix",R.projectionMatrix),Et.setValue(X,"viewMatrix",R.matrixWorldInverse);let $t=Et.map.cameraPosition;$t!==void 0&&$t.setValue(X,zt.setFromMatrixPosition(R.matrixWorld)),Ut.logarithmicDepthBuffer&&Et.setValue(X,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&Et.setValue(X,"isOrthographic",R.isOrthographicCamera===!0),le!==R&&(le=R,yi=!0,Ui=!0)}if(Ze.needsLights&&(wn.state.sunShadowMap.length>0&&Et.setValue(X,"sunShadowMap",wn.state.sunShadowMap,ke),wn.state.directionalShadowMap.length>0&&Et.setValue(X,"directionalShadowMap",wn.state.directionalShadowMap,ke),wn.state.spotShadowMap.length>0&&Et.setValue(X,"spotShadowMap",wn.state.spotShadowMap,ke),wn.state.pointShadowMap.length>0&&Et.setValue(X,"pointShadowMap",wn.state.pointShadowMap,ke)),ee.isSkinnedMesh){Et.setOptional(X,ee,"bindMatrix"),Et.setOptional(X,ee,"bindMatrixInverse");let xt=ee.skeleton;xt&&(xt.boneTexture===null&&xt.computeBoneTexture(),Et.setValue(X,"boneTexture",xt.boneTexture,ke))}ee.isBatchedMesh&&(Et.setOptional(X,ee,"batchingTexture"),Et.setValue(X,"batchingTexture",ee._matricesTexture,ke),Et.setOptional(X,ee,"batchingIdTexture"),Et.setValue(X,"batchingIdTexture",ee._indirectTexture,ke),Et.setOptional(X,ee,"batchingColorTexture"),ee._colorsTexture!==null&&Et.setValue(X,"batchingColorTexture",ee._colorsTexture,ke));let Cn=se.morphAttributes;if((Cn.position!==void 0||Cn.normal!==void 0||Cn.color!==void 0)&&xe.update(ee,se,Sn),(yi||Ze.receiveShadow!==ee.receiveShadow)&&(Ze.receiveShadow=ee.receiveShadow,Et.setValue(X,"receiveShadow",ee.receiveShadow)),(j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial)&&j.envMap===null&&G.environment!==null&&(hn.envMapIntensity.value=G.environmentIntensity),hn.dfgLUT!==void 0&&(hn.dfgLUT.value=iM()),yi){if(Et.setValue(X,"toneMappingExposure",P.toneMappingExposure),Ze.needsLights&&Na(hn,Ui),Ue&&j.fog===!0&&de.refreshFogUniforms(hn,Ue),de.refreshMaterialUniforms(hn,j,_e,Fe,T.state.transmissionRenderTarget[R.id]),Ze.needsLights&&Ze.numLightProbeGrids>0){let xt=v,$t=0;for(let hi of T.state.lightProbeGridArray)hi.texture!==null&&(xt.textures[$t]=hi.texture,xt.min[$t]=hi.boundingBox.min,xt.max[$t]=hi.boundingBox.max,xt.resolution[$t]=hi.resolution,$t++);for(let hi in xt)xt[hi].length=$t;hn.probesSH.value=xt.textures,hn.probesMin.value=xt.min,hn.probesMax.value=xt.max,hn.probesResolution.value=xt.resolution}no.upload(X,Ia(Ze),hn,ke)}if(j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(no.upload(X,Ia(Ze),hn,ke),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&Et.setValue(X,"center",ee.center),Et.setValue(X,"modelViewMatrix",ee.modelViewMatrix),Et.setValue(X,"normalMatrix",ee.normalMatrix),Et.setValue(X,"modelMatrix",ee.matrixWorld),j.uniformsGroups!==void 0){let xt=j.uniformsGroups;for(let $t=0,hi=xt.length;$t<hi;$t++){let Fa=xt[$t];We.update(Fa,Sn),We.bind(Fa,Sn)}}return Sn}function Na(R,G){R.ambientLightColor.needsUpdate=G,R.lightProbe.needsUpdate=G,R.sunLights.needsUpdate=G,R.sunLightShadows.needsUpdate=G,R.directionalLights.needsUpdate=G,R.directionalLightShadows.needsUpdate=G,R.pointLights.needsUpdate=G,R.pointLightShadows.needsUpdate=G,R.spotLights.needsUpdate=G,R.spotLightShadows.needsUpdate=G,R.rectAreaLights.needsUpdate=G,R.hemisphereLights.needsUpdate=G}function Ua(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return $},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return me},this.setRenderTargetTextures=function(R,G,se){let j=Ve.get(R);j.__autoAllocateDepthBuffer=R.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),Ve.get(R.texture).__webglTexture=G,Ve.get(R.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:se,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(R,G){let se=Ve.get(R);se.__webglFramebuffer=G,se.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(R,G=0,se=0){me=R,$=G,W=se;let j=null,ee=!1,Ue=!1;if(R){let De=Ve.get(R);if(De.__useDefaultFramebuffer!==void 0){Me.bindFramebuffer(X.FRAMEBUFFER,De.__webglFramebuffer),Se.copy(R.viewport),Le.copy(R.scissor),et=R.scissorTest,Me.viewport(Se),Me.scissor(Le),Me.setScissorTest(et),J=-1;return}else if(De.__webglFramebuffer===void 0)ke.setupRenderTarget(R);else if(De.__hasExternalTextures)ke.rebindTextures(R,Ve.get(R.texture).__webglTexture,Ve.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){let pt=R.depthTexture;if(De.__boundDepthTexture!==pt){if(pt!==null&&Ve.has(pt)&&(R.width!==pt.image.width||R.height!==pt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ke.setupDepthRenderbuffer(R)}}let ze=R.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Ue=!0);let Je=Ve.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Je[G])?j=Je[G][se]:j=Je[G],ee=!0):R.samples>0&&ke.useMultisampledRTT(R)===!1?j=Ve.get(R).__webglMultisampledFramebuffer:Array.isArray(Je)?j=Je[se]:j=Je,Se.copy(R.viewport),Le.copy(R.scissor),et=R.scissorTest}else Se.copy(ve).multiplyScalar(_e).floor(),Le.copy(Ne).multiplyScalar(_e).floor(),et=je;if(se!==0&&(j=z),Me.bindFramebuffer(X.FRAMEBUFFER,j)&&Me.drawBuffers(R,j),Me.viewport(Se),Me.scissor(Le),Me.setScissorTest(et),ee){let De=Ve.get(R.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_CUBE_MAP_POSITIVE_X+G,De.__webglTexture,se)}else if(Ue){let De=G;for(let ze=0;ze<R.textures.length;ze++){let Je=Ve.get(R.textures[ze]);X.framebufferTextureLayer(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0+ze,Je.__webglTexture,se,De)}}else if(R!==null&&se!==0){let De=Ve.get(R.texture);X.framebufferTexture2D(X.FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,De.__webglTexture,se)}J=-1};function Oa(R){let G=Ve.get(R);return(G.__readFormat!==R.format||G.__readType!==R.type)&&(G.__readFormat=R.format,G.__readType=R.type,G.__formatReadable=Ut.textureFormatReadable(R.format),G.__typeReadable=Ut.textureTypeReadable(R.type)),G}this.readRenderTargetPixels=function(R,G,se,j,ee,Ue,Ye,De=0){if(!(R&&R.isWebGLRenderTarget)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=Ve.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ye!==void 0&&(ze=ze[Ye],Array.isArray(ze)&&(ze=ze[0])),ze){Me.bindFramebuffer(X.FRAMEBUFFER,ze);try{let Je=R.textures[De],pt=Je.format,bt=Je.type;R.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+De);let Xe=Oa(Je);if(Xe.__formatReadable===!1){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Xe.__typeReadable===!1){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=R.width-j&&se>=0&&se<=R.height-ee&&X.readPixels(G,se,j,ee,ge.convert(pt),ge.convert(bt),Ue)}finally{let Je=me!==null?Ve.get(me).__webglFramebuffer:null;Me.bindFramebuffer(X.FRAMEBUFFER,Je)}}},this.readRenderTargetPixelsAsync=async function(R,G,se,j,ee,Ue,Ye,De=0){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ze=Ve.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ye!==void 0&&(ze=ze[Ye],Array.isArray(ze)&&(ze=ze[0])),ze)if(G>=0&&G<=R.width-j&&se>=0&&se<=R.height-ee){Me.bindFramebuffer(X.FRAMEBUFFER,ze);let Je=R.textures[De],pt=Je.format,bt=Je.type;R.textures.length>1&&X.readBuffer(X.COLOR_ATTACHMENT0+De);let Xe=Oa(Je);if(Xe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Xe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Mt=X.createBuffer();X.bindBuffer(X.PIXEL_PACK_BUFFER,Mt),X.bufferData(X.PIXEL_PACK_BUFFER,Ue.byteLength,X.STREAM_READ),X.readPixels(G,se,j,ee,ge.convert(pt),ge.convert(bt),0),X.bindBuffer(X.PIXEL_PACK_BUFFER,null);let Zt=me!==null?Ve.get(me).__webglFramebuffer:null;Me.bindFramebuffer(X.FRAMEBUFFER,Zt);let Vt=X.fenceSync(X.SYNC_GPU_COMMANDS_COMPLETE,0);return X.flush(),await dp(X,Vt,4),X.bindBuffer(X.PIXEL_PACK_BUFFER,Mt),X.getBufferSubData(X.PIXEL_PACK_BUFFER,0,Ue),X.bindBuffer(X.PIXEL_PACK_BUFFER,null),X.deleteBuffer(Mt),X.deleteSync(Vt),Ue}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(R,G=null,se=0){let j=Math.pow(2,-se),ee=Math.floor(R.image.width*j),Ue=Math.floor(R.image.height*j),Ye=G!==null?G.x:0,De=G!==null?G.y:0;ke.setTexture2D(R,0),X.copyTexSubImage2D(X.TEXTURE_2D,se,0,0,Ye,De,ee,Ue),Me.unbindTexture()},this.copyTextureToTexture=function(R,G,se=null,j=null,ee=0,Ue=0){let Ye,De,ze,Je,pt,bt,Xe,Mt,Zt,Vt=R.isCompressedTexture?R.mipmaps[Ue]:R.image;if(se!==null)Ye=se.max.x-se.min.x,De=se.max.y-se.min.y,ze=se.isBox3?se.max.z-se.min.z:1,Je=se.min.x,pt=se.min.y,bt=se.isBox3?se.min.z:0;else{let Et=Math.pow(2,-ee);Ye=Math.floor(Vt.width*Et),De=Math.floor(Vt.height*Et),R.isDataArrayTexture?ze=Vt.depth:R.isData3DTexture?ze=Math.floor(Vt.depth*Et):ze=1,Je=0,pt=0,bt=0}j!==null?(Xe=j.x,Mt=j.y,Zt=j.z):(Xe=0,Mt=0,Zt=0);let Ht=ge.convert(G.format),bn=ge.convert(G.type),Ze;G.isData3DTexture?(ke.setTexture3D(G,0),Ze=X.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(ke.setTexture2DArray(G,0),Ze=X.TEXTURE_2D_ARRAY):(ke.setTexture2D(G,0),Ze=X.TEXTURE_2D),Me.activeTexture(X.TEXTURE0),Me.pixelStorei(X.UNPACK_FLIP_Y_WEBGL,G.flipY),Me.pixelStorei(X.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),Me.pixelStorei(X.UNPACK_ALIGNMENT,G.unpackAlignment);let wn=Me.getParameter(X.UNPACK_ROW_LENGTH),Nt=Me.getParameter(X.UNPACK_IMAGE_HEIGHT),Ni=Me.getParameter(X.UNPACK_SKIP_PIXELS),Sn=Me.getParameter(X.UNPACK_SKIP_ROWS),ws=Me.getParameter(X.UNPACK_SKIP_IMAGES);Me.pixelStorei(X.UNPACK_ROW_LENGTH,Vt.width),Me.pixelStorei(X.UNPACK_IMAGE_HEIGHT,Vt.height),Me.pixelStorei(X.UNPACK_SKIP_PIXELS,Je),Me.pixelStorei(X.UNPACK_SKIP_ROWS,pt),Me.pixelStorei(X.UNPACK_SKIP_IMAGES,bt);let yi=R.isDataArrayTexture||R.isData3DTexture,Ui=G.isDataArrayTexture||G.isData3DTexture;if(R.isDepthTexture){let Et=Ve.get(R),hn=Ve.get(G),Cn=Ve.get(Et.__renderTarget),xt=Ve.get(hn.__renderTarget);Me.bindFramebuffer(X.READ_FRAMEBUFFER,Cn.__webglFramebuffer),Me.bindFramebuffer(X.DRAW_FRAMEBUFFER,xt.__webglFramebuffer);for(let $t=0;$t<ze;$t++)yi&&(X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,Ve.get(R).__webglTexture,ee,bt+$t),X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,Ve.get(G).__webglTexture,Ue,Zt+$t)),X.blitFramebuffer(Je,pt,Je+Ye,pt+De,Xe,Mt,Xe+Ye,Mt+De,X.DEPTH_BUFFER_BIT,X.NEAREST);Me.bindFramebuffer(X.READ_FRAMEBUFFER,null),Me.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else if(ee!==0||R.isRenderTargetTexture||Ve.has(R)){let Et=Ve.get(R),hn=Ve.get(G);Me.bindFramebuffer(X.READ_FRAMEBUFFER,U),Me.bindFramebuffer(X.DRAW_FRAMEBUFFER,q);for(let Cn=0;Cn<ze;Cn++)yi?X.framebufferTextureLayer(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,Et.__webglTexture,ee,bt+Cn):X.framebufferTexture2D(X.READ_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,Et.__webglTexture,ee),Ui?X.framebufferTextureLayer(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,hn.__webglTexture,Ue,Zt+Cn):X.framebufferTexture2D(X.DRAW_FRAMEBUFFER,X.COLOR_ATTACHMENT0,X.TEXTURE_2D,hn.__webglTexture,Ue),ee!==0?X.blitFramebuffer(Je,pt,Je+Ye,pt+De,Xe,Mt,Xe+Ye,Mt+De,X.COLOR_BUFFER_BIT,X.NEAREST):Ui?X.copyTexSubImage3D(Ze,Ue,Xe,Mt,Zt+Cn,Je,pt,Ye,De):X.copyTexSubImage2D(Ze,Ue,Xe,Mt,Je,pt,Ye,De);Me.bindFramebuffer(X.READ_FRAMEBUFFER,null),Me.bindFramebuffer(X.DRAW_FRAMEBUFFER,null)}else Ui?R.isDataTexture||R.isData3DTexture?X.texSubImage3D(Ze,Ue,Xe,Mt,Zt,Ye,De,ze,Ht,bn,Vt.data):G.isCompressedArrayTexture?X.compressedTexSubImage3D(Ze,Ue,Xe,Mt,Zt,Ye,De,ze,Ht,Vt.data):X.texSubImage3D(Ze,Ue,Xe,Mt,Zt,Ye,De,ze,Ht,bn,Vt):R.isDataTexture?X.texSubImage2D(X.TEXTURE_2D,Ue,Xe,Mt,Ye,De,Ht,bn,Vt.data):R.isCompressedTexture?X.compressedTexSubImage2D(X.TEXTURE_2D,Ue,Xe,Mt,Vt.width,Vt.height,Ht,Vt.data):X.texSubImage2D(X.TEXTURE_2D,Ue,Xe,Mt,Ye,De,Ht,bn,Vt);Me.pixelStorei(X.UNPACK_ROW_LENGTH,wn),Me.pixelStorei(X.UNPACK_IMAGE_HEIGHT,Nt),Me.pixelStorei(X.UNPACK_SKIP_PIXELS,Ni),Me.pixelStorei(X.UNPACK_SKIP_ROWS,Sn),Me.pixelStorei(X.UNPACK_SKIP_IMAGES,ws),Ue===0&&G.generateMipmaps===!0&&G.mipmapsAutoUpdate===!0&&X.generateMipmap(Ze),Me.unbindTexture()},this.initRenderTarget=function(R){Ve.get(R).__webglFramebuffer===void 0&&ke.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?ke.setTextureCube(R,0):R.isData3DTexture?ke.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?ke.setTexture2DArray(R,0):ke.setTexture2D(R,0),Me.unbindTexture()},this.resetState=function(){$=0,W=0,me=null,Me.reset(),Te.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Tt._getUnpackColorSpace()}};var tm={type:"change"},Lu={type:"start"},im={type:"end"},zc=new Mi,nm=new Un,sM=Math.cos(70*tn.DEG2RAD),Mn=new D,qn=2*Math.PI,kt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Iu=1e-6,Hc=class extends oa{constructor(e,t=null){super(e,t),this.state=kt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:xs.ROTATE,MIDDLE:xs.DOLLY,RIGHT:xs.PAN},this.touches={ONE:vs.ROTATE,TWO:vs.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new _n,this._lastTargetPosition=new D,this._quat=new _n().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new $r,this._sphericalDelta=new $r,this._scale=1,this._panOffset=new D,this._rotateStart=new be,this._rotateEnd=new be,this._rotateDelta=new be,this._panStart=new be,this._panEnd=new be,this._panDelta=new be,this._dollyStart=new be,this._dollyEnd=new be,this._dollyDelta=new be,this._dollyDirection=new D,this._mouse=new be,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=oM.bind(this),this._onPointerDown=rM.bind(this),this._onPointerUp=aM.bind(this),this._onContextMenu=pM.bind(this),this._onMouseWheel=hM.bind(this),this._onKeyDown=uM.bind(this),this._onTouchStart=dM.bind(this),this._onTouchMove=fM.bind(this),this._onMouseDown=lM.bind(this),this._onMouseMove=cM.bind(this),this._interceptControlDown=mM.bind(this),this._interceptControlUp=gM.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=kt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(tm),this.update(),this.state=kt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Mn.copy(t).sub(this.target),Mn.applyQuaternion(this._quat),this._spherical.setFromVector3(Mn),this.autoRotate&&this.state===kt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,i=this.maxAzimuthAngle;isFinite(n)&&isFinite(i)&&(n<-Math.PI?n+=qn:n>Math.PI&&(n-=qn),i<-Math.PI?i+=qn:i>Math.PI&&(i-=qn),n<=i?this._spherical.theta=Math.max(n,Math.min(i,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+i)/2?Math.max(n,this._spherical.theta):Math.min(i,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Mn.setFromSpherical(this._spherical),Mn.applyQuaternion(this._quatInverse),t.copy(this.target).add(Mn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Mn.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Mn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(zc.origin.copy(this.object.position),zc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(zc.direction))<sM?this.object.lookAt(this.target):(nm.setFromNormalAndCoplanarPoint(this.object.up,this.target),zc.intersectPlane(nm,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Iu||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Iu||this._lastTargetPosition.distanceToSquared(this.target)>Iu?(this.dispatchEvent(tm),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?qn/60*this.autoRotateSpeed*e:qn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Mn.setFromMatrixColumn(t,0),Mn.multiplyScalar(-e),this._panOffset.add(Mn)}_panUp(e,t){this.screenSpacePanning===!0?Mn.setFromMatrixColumn(t,1):(Mn.setFromMatrixColumn(t,0),Mn.crossVectors(this.object.up,Mn)),Mn.multiplyScalar(e),this._panOffset.add(Mn)}_pan(e,t){let n=this.domElement;if(this.object.isPerspectiveCamera){let i=this.object.position;Mn.copy(i).sub(this.target);let r=Mn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),i=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=i/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientY),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.zoomToCursor&&(this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._rotateStart.set(n,i)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panStart.set(n,i)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(i,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panEnd.set(n,i)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new be,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function rM(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function oM(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function aM(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(im),this.state=kt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function lM(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case xs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=kt.DOLLY;break;case xs.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=kt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=kt.ROTATE}break;case xs.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=kt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=kt.PAN}break;default:this.state=kt.NONE}this.state!==kt.NONE&&this.dispatchEvent(Lu)}function cM(s){switch(this.state){case kt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case kt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case kt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function hM(s){this.enabled===!1||this.enableZoom===!1||this.state!==kt.NONE||(s.preventDefault(),this.dispatchEvent(Lu),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(im))}function uM(s){this.enabled!==!1&&this._handleKeyDown(s)}function dM(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case vs.ROTATE:if(this.enableRotate===!1){this.state=kt.NONE;break}this._handleTouchStartRotate(s),this.state=kt.TOUCH_ROTATE;break;case vs.PAN:if(this.enablePan===!1){this.state=kt.NONE;break}this._handleTouchStartPan(s),this.state=kt.TOUCH_PAN;break;default:this.state=kt.NONE}break;case 2:switch(this.touches.TWO){case vs.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=kt.TOUCH_DOLLY_PAN;break;case vs.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=kt.TOUCH_DOLLY_ROTATE;break;default:this.state=kt.NONE}break;default:this.state=kt.NONE}this.state!==kt.NONE&&this.dispatchEvent(Lu)}function fM(s){switch(this._trackPointer(s),this.state){case kt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case kt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case kt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case kt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=kt.NONE}}function pM(s){this.enabled!==!1&&s.preventDefault()}function mM(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function gM(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function sm(s,e=[]){return e.find(t=>t.id===s.id)||e.find(t=>t.kind===s.kind&&t.x===s.x&&t.y===s.y)}function Du(s,e,t){return e>=s.x&&t>=s.y&&e<s.x+(s.width||1)&&t<s.y+(s.depth||1)}var _M=20,xa=36,yM=1800,xM=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","slash","arrow","firebolt","magic_missile","heal","generic","sorcerous_burst","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),rm=new Set(["rotting_fist","dreadful_glare","necrotic","draining_swipe","healing_word","generic","life_drain","turn_undead","sacred_flame","guiding_bolt","divine_spark","cure_wounds","preserve_life","burning_hands","thunderwave","shatter","acid_splash","dragons_breath","chromatic_orb","ray_of_frost","scorching_ray","spiritual_weapon","buff","command","undead","touch"]),vM=new Set(["scorching_ray","ray_of_frost","chromatic_orb","dragons_breath","acid_splash","shatter","thunderwave","burning_hands","divine_spark","guiding_bolt","sacred_flame","generic","sorcerous_burst"]),MM=new Set(["dragons_breath","acid_splash","shatter","thunderwave","burning_hands","preserve_life","turn_undead","magic_missile","scorching_ray"]),jt={},bM={slash:"#fff0c1",arrow:"#f4dcb0",firebolt:"#ff842e",magic_missile:"#80eeff",heal:"#86f3ac",generic:"#e8e0c8",rotting_fist:"#d8b46a",dreadful_glare:"#ffbe3d",sorcerous_burst:"#c9a0ff",life_drain:"#9be07a",turn_undead:"#ffe9a0",touch:"#ffffff",necrotic:"#7d3fb8",draining_swipe:"#c9b8e8",undead:"#9bbf5a",command:"#e8d9a8",buff:"#ffffff",spiritual_weapon:"#bfe0ff",scorching_ray:"#ff842e",ray_of_frost:"#9fdcff",chromatic_orb:"#c9a0ff",dragons_breath:"#ff9a3c",acid_splash:"#b6f06a",shatter:"#c7b6ff",thunderwave:"#c7b6ff",burning_hands:"#ff842e",preserve_life:"#ffe7a3",healing_word:"#c9ffd9",cure_wounds:"#bfffd0",divine_spark:"#ffe9a0",guiding_bolt:"#fff2a8",sacred_flame:"#fff2a8"},am={fire:"#ff842e",cold:"#9fdcff",lightning:"#fff08a",thunder:"#c7b6ff",acid:"#b6f06a",poison:"#8fd36a",necrotic:"#a07cd8",radiant:"#fff2a8",force:"#b9a4ff",psychic:"#ff9fe0",slashing:"#fff0c1",piercing:"#f4dcb0",bludgeoning:"#e8d8c0"},om=new D(0,0,1),$e=tn.clamp;jt.sacred_flame=s=>{let{group:e,mat:t,mesh:n,geo:i,color:r,target:o,releaseAt:a,impactAt:l}=s,c=new qe;c.name="sacred-flame-column",e.add(c),c.position.set(o.x,0,o.z);let u=n(c,i.cylinder,t("#fff8d0",.85,!0),0,1.7,0,.12,3.4,.12);u.name="flame-core",n(c,i.cylinder,t(r,.32,!0),0,1.7,0,.3,3.4,.3).name="flame-glow";let d=[];for(let h=0;h<6;h++){let f=h*Math.PI/3,g=n(c,i.cone,t("#ffd877",.7,!0),Math.cos(f)*.2,.45,Math.sin(f)*.2,.09,.8,.09);g.name="flame-petal",g.userData.phase=f,d.push(g)}return(h,{elapsedImpact:f})=>{let g=$e((h-a)/Math.max(1,l-a),0,1);c.visible=h>=a&&f<520,c.position.y=(1-g)*(1-g)*3.4-.05;let _=f>0?1+Math.min(f/120,1)*.8-$e((f-150)/370,0,1)*1.6:1;c.scale.set(Math.max(.05,_),1,Math.max(.05,_)),d.forEach(p=>{p.scale.y=.8+.35*Math.sin(h*.03+p.userData.phase*3)})}};jt.guiding_bolt=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,impact:u}=s,d=new qe;d.name="guiding-comet",e.add(d),n(d,i.sphere,t("#ffffff"),0,0,0,.15).name="comet-head",n(d,i.sphere,t(a,.55,!0),0,0,0,.3).name="comet-glow";let h=[];for(let m=0;m<8;m++){let y=n(e,i.sphere,t(m%2?"#ffe9a0":"#fff6cf",.7-m*.07,!0),0,0,0,.13-m*.012);y.name="comet-tail",h.push(y)}let f=new qe;f.name="guiding-mark",u.add(f);let g=n(f,s.own(new Ct(.42,.03,6,32)),t("#ffd75e",.95,!0),0,-.55,0);g.rotation.x=-Math.PI/2;let _=n(f,s.own(new Rn(1)),t("#ffe27a",.95,!0),0,1.05,0,.1,.18,.1),p=m=>{let y=new D().lerpVectors(r,o,$e(m,0,1));return y.y+=Math.sin($e(m,0,1)*Math.PI)*.35,y};return(m,{elapsedImpact:y})=>{let x=(m-l)/Math.max(1,c-l);d.visible=x>=0&&x<1,d.position.copy(p(x)),d.children[1].scale.setScalar(.3+.05*Math.sin(m*.05)),h.forEach((v,w)=>{v.visible=x>=0&&x<1.15,v.position.copy(p(x-(w+1)*.045))}),g.rotation.z=y*.004,_.rotation.y=y*.006,_.position.y=1.05+.06*Math.sin(y*.008)}};jt.divine_spark=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,direction:a,color:l,event:c,releaseAt:u,impactAt:d,span:h}=s,f=1+$e((2.5-h)/2.5,0,1),_=c.outcome==="heal"?"#9bffb8":l,p=n(e,i.cylinder,t(_,.7,!0),0,0,0,.07,.01,.07);p.name="spark-beam";let m=n(e,i.cylinder,t("#ffffff",.9,!0),0,0,0,.025,.01,.025);m.name="spark-core",p.quaternion.setFromUnitVectors(new D(0,1,0),a),m.quaternion.copy(p.quaternion);let y=new D().crossVectors(a,new D(0,1,0)).normalize(),x=new D().crossVectors(y,a).normalize(),v=[];for(let M=0;M<9;M++){let S=n(e,i.sphere,t(M%2?"#ffffff":_,.9,!0),0,0,0,.055);S.name="spark-helix",S.userData.phase=M/9,v.push(S)}let w=n(e,i.sphere,t(_,.6,!0),r.x,r.y,r.z,.22);w.name="spark-source";let T=new D;return(M,{phase:S})=>{let F=$e((M-u)/Math.max(1,d-u),0,1),P=M>=u;for(let H of[p,m,w])H.visible=P;let k=Math.max(.01,h*F);for(let H of[p,m])H.scale.y=k,H.position.copy(r).addScaledVector(a,k/2);p.scale.x=p.scale.z=.07*f*(1+.25*Math.sin(M*.04))*(1-S*.8),w.scale.setScalar(.22*f*(1+.3*Math.sin(M*.05))*(1-S*.7)),v.forEach(H=>{let z=((M-u)/600+H.userData.phase)%1;H.visible=P&&z*h<=k;let U=z*9+M*.012+H.userData.phase*6,q=.2*f*Math.sin(Math.PI*z);T.copy(r).addScaledVector(a,z*h).addScaledVector(y,Math.cos(U)*q).addScaledVector(x,Math.sin(U)*q),H.position.copy(T)})}};jt.cure_wounds=s=>{let{group:e,mat:t,mesh:n,geo:i,target:r,impactAt:o}=s,a=1+.8*$e((2.5-s.span)/2.5,0,1),l=new qe;l.name="cure-aura",e.add(l),l.position.set(r.x,0,r.z),n(l,i.cylinder,t("#bfffd0",.28,!0),0,.9,0,.42,1.8,.42).name="cure-pillar";let c=[];for(let u=0;u<3;u++){let d=new qe;d.name="cure-cross",l.add(d),n(d,i.box,t("#f2ffd8",.95,!0),0,0,0,.14,.04,.04),n(d,i.box,t("#f2ffd8",.95,!0),0,0,0,.04,.14,.04),d.userData.phase=u*2.1,c.push(d)}return u=>{let d=u-o+400;l.visible=d>=0;let h=$e(d/1100,0,1);l.children[0].scale.set(.42*a*(.6+h*.4),1.8*a,.42*a*(.6+h*.4)),c.forEach(f=>{let g=d*.005+f.userData.phase;f.position.set(Math.cos(g)*.38*a,.15+h*1.4*a*((f.userData.phase/2.1+1)/3),Math.sin(g)*.38*a),f.scale.setScalar(a),f.rotation.y=-g})}};jt.healing_word=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,own:c}=s,u=$e((2.5-s.span)/2.5,0,1),d=1+u,h=[];for(let p=0;p<12;p++){let m=n(e,i.sphere,t(p%3?"#c9ffd9":"#ffffff",.9,!0),0,0,0,.06*d);m.name="word-mote",m.userData.phase=p/12,h.push(m)}let f=c(new Ct(1,.025,6,40)),g=[0,1].map(p=>{let m=n(e,f,t("#dfffe8",.8,!0),r.x,r.y,r.z,.2);return m.name="word-ring",m.userData.delay=p*160,m}),_=new D;return p=>{let m=$e((p-a)/Math.max(1,l-a),0,1.2);h.forEach(y=>{let x=$e(m-y.userData.phase*.35,0,1);y.visible=p>=a&&x>0&&x<1,_.lerpVectors(r,o,x),_.y+=Math.sin(x*Math.PI)*(.55+u*.9)+.08*Math.sin(p*.02+y.userData.phase*9),y.position.copy(_)}),g.forEach(y=>{let x=$e((p-a-y.userData.delay)/500,0,1);y.visible=x>0&&x<1,y.rotation.x=Math.PI/2,y.scale.setScalar((.2+x*.8)*d)})}};jt.preserve_life=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,releaseAt:a,impactAt:l,first:c,own:u}=s,d=[];for(let g=0;g<10;g++){let _=n(e,i.sphere,t(g%2?"#ffe7a3":"#fff9e0",.9,!0),0,0,0,.07);_.name="preserve-mote",_.userData.phase=g/10,d.push(_)}let h=null;if(c){h=new qe,h.name="preserve-seal",e.add(h),h.position.set(r.x,.1,r.z);let g=u(new Ct(1,.03,6,48)),_=n(h,g,t("#ffe7a3",.9,!0),0,0,0);_.rotation.x=-Math.PI/2;let p=n(h,g,t("#fff4cf",.9,!0),0,.01,0,.55,.55,.55);p.rotation.x=-Math.PI/2;for(let m=0;m<6;m++){let y=n(h,i.box,t("#fff4cf",.85,!0),0,.02,0,.03,.01,1.1);y.rotation.y=m*Math.PI/6}}let f=new D;return g=>{let _=$e((g-a)/Math.max(1,l-a),0,1.3);if(h){let p=$e((g-a+150)/900,0,1);h.visible=p>0&&p<1,h.scale.setScalar(1.1+p*1.1),h.rotation.y=g*.004}d.forEach(p=>{let m=$e(_-p.userData.phase*.4,0,1);p.visible=g>=a&&m>0&&m<1,f.lerpVectors(r,o,m),f.y+=Math.sin(m*Math.PI)*.45+.1*Math.sin(g*.015+p.userData.phase*12),p.position.copy(f)})}};function lm(s,e){let{group:t,mat:n,mesh:i,geo:r,source:o,area:a,releaseAt:l}=s;if(!a)return null;let c=a.cells.map(([d,h])=>{let f=new qe;return f.name=e.name,f.position.set(d,0,h),t.add(f),i(f,r.cone,n(e.edge,.75,!0),0,e.height/2,0,e.width,e.height,e.width),i(f,r.cone,n(e.core,.9,!0),0,e.height*.35,0,e.width*.55,e.height*.7,e.width*.55),{g:f,d:Math.hypot(d-o.x,h-o.z),seed:Math.abs(Math.sin(d*12.9898+h*78.233)*43758.5453)%1}}),u=i(t,r.sphere,n(e.core,.8,!0),o.x,o.y,o.z,.22);return u.name=e.name+"-hand",d=>{for(let h of c){let f=l+h.d*e.speed,g=$e((d-f)/260,0,1),_=$e((d-f-e.burn)/320,0,1);h.g.visible=g>0&&_<1;let p=g*(1-_),m=1+.25*Math.sin(d*.03+h.seed*20);h.g.scale.set(p,p*m,p),h.g.rotation.y=d*.002+h.seed*6}u.visible=d>=l-100&&d<l+450,u.scale.setScalar(.22*(1+.3*Math.sin(d*.06)))}}jt.burning_hands=s=>lm(s,{name:"burning-flame",edge:"#ff8a2a",core:"#ffe27a",height:.95,width:.3,speed:55,burn:300});jt.thunderwave=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,direction:a,color:l,event:c,area:u,releaseAt:d}=s,h=[];if(u){let f=u.aim[0]-o.x,g=u.aim[1]-o.z,_=Math.abs(f)>=Math.abs(g)?new D(Math.sign(f)||1,0,0):new D(0,0,Math.sign(g)||1),p=u.cells.map(([x,v])=>{let w=i(e,r.box,n("#c7b6ff",0,!0),x,.07,v,.92,.05,.92);return w.name="thunder-tile",{item:w,d:Math.abs((x-o.x)*_.x+(v-o.z)*_.z)}}),m=i(e,r.box,n("#ffffff",.85,!0),0,.5,0,_.x?.12:3,1,_.x?3:.12);m.name="thunder-front";let y=i(e,s.own(new Ct(1,.03,6,40)),n("#e9e0ff",.8,!0),o.x,.12,o.z,.3,.3,.3);y.name="thunder-ring",y.rotation.x=-Math.PI/2,h.push(x=>{let v=$e((x-d)/450,0,1);m.visible=v>0&&v<1,m.position.set(o.x+_.x*(.6+v*3),.5,o.z+_.z*(.6+v*3)),m.material.opacity=.85*(1-v*.7),y.visible=v>0&&v<1,y.scale.setScalar(.3+v*2.2),y.material.opacity=.8*(1-v);for(let{item:w,d:T}of p){let M=$e((x-d-T*120)/520,0,1);w.visible=M>0&&M<1,w.material.opacity=Math.sin(M*Math.PI)*.55}})}if(c.outcome==="hit"){let f=new qe;f.name="thunder-push",t.add(f);let g=a.clone();g.y=0,g.normalize();for(let _=0;_<3;_++){let p=i(f,r.cone,n("#e9e0ff",.9,!0),0,.45,0,.16,.3,.1);p.name="thunder-chevron",p.quaternion.setFromUnitVectors(new D(0,1,0),g),p.userData.i=_}h.push((_,{elapsedImpact:p})=>{f.children.forEach(m=>{let y=$e(p/600-m.userData.i*.18,0,1);m.position.set(g.x*(.3+y*.9),.4+m.userData.i*.08,g.z*(.3+y*.9)),m.visible=p>0&&y<1})})}return h.length?(f,g)=>h.forEach(_=>_(f,g)):null};jt.shatter=s=>{let{group:e,mat:t,mesh:n,geo:i,area:r,releaseAt:o,impactAt:a,own:l}=s;if(!r)return null;let[c,u]=r.aim,d=Math.max(...r.cells.map(([x,v])=>Math.hypot(x-c,v-u)))+.6,h=new qe;h.name="shatter-burst",h.position.set(c,0,u),e.add(h);let f=l(new Ct(1,.035,6,48)),g=n(h,f,t("#e1d8ff",.9,!0),0,.12,0);g.rotation.x=-Math.PI/2,g.name="shatter-wave";let _=n(h,i.sphere,t("#c7b6ff",.22,!0),0,0,0);_.name="shatter-dome";let p=[];for(let x=0;x<9;x++){let v=x*Math.PI*2/9+.2,w=n(h,i.box,t("#f4f0ff",.9,!0),0,.08,0,.04,.02,1);w.name="shatter-crack",w.userData={a:v,len:d*(.7+.3*Math.abs(Math.sin(x*2.3)))},p.push(w)}let m=l(new Rn(1)),y=[];for(let x=0;x<14;x++){let v=x*2.4,w=n(h,m,t(x%2?"#ffffff":"#c7b6ff",.9,!0),0,0,0,.06,.12,.04);w.name="shatter-shard",w.userData={vx:Math.cos(v)*(.5+x%4*.3),vz:Math.sin(v)*(.5+x%4*.3),vy:2.2+x%3*.8},y.push(w)}return x=>{let v=$e((x-o)/520,0,1),w=Math.max(0,x-o);g.visible=_.visible=v>0&&v<1,g.scale.setScalar(.2+v*d),g.material.opacity=.9*(1-v),_.scale.setScalar(.2+v*d),_.scale.y*=.55,_.material.opacity=.22*(1-v);for(let T of p){let M=T.userData.len*$e(v*1.6,0,1);T.visible=w>0,T.scale.z=Math.max(.01,M),T.rotation.y=Math.PI/2-T.userData.a,T.position.set(Math.cos(T.userData.a)*M/2,.08,Math.sin(T.userData.a)*M/2)}for(let T of y){let M=w/1e3,{vx:S,vz:F,vy:P}=T.userData;T.visible=w>0&&M<.9,T.position.set(S*M,Math.max(0,P*M-4.2*M*M),F*M),T.rotation.set(M*9,M*7,0)}}};jt.acid_splash=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,area:o,releaseAt:a,impactAt:l,own:c}=s;if(!o)return null;let[u,d]=o.aim,h=new D(u,.3,d),f=new qe;f.name="acid-glob",e.add(f),n(f,i.sphere,t("#9be03c",.9),0,0,0,.17).name="acid-core",n(f,i.sphere,t("#d6ff7a",.45,!0),0,0,0,.3);let g=n(e,c(new zr(1,28)),t("#8fd62e",.7),u,.075,d,.1,.1,.1);g.rotation.x=-Math.PI/2,g.name="acid-puddle";let _=[];for(let y=0;y<12;y++){let x=y*2.4,v=n(e,i.sphere,t(y%2?"#b6f06a":"#e6ffaa",.9),u,.2,d,.06);v.name="acid-drop",v.userData={vx:Math.cos(x)*(.6+y%4*.3),vz:Math.sin(x)*(.6+y%4*.3),vy:1.8+y%3*.5},_.push(v)}let p=[];for(let y=0;y<6;y++){let x=n(e,i.sphere,t("#d6ff7a",.6,!0),u+Math.cos(y*2.1)*.5,.1,d+Math.sin(y*2.1)*.5,.07);x.name="acid-bubble",x.userData.phase=y,p.push(x)}let m=new D;return y=>{let x=$e((y-a)/Math.max(1,l-a),0,1),v=y-l;f.visible=y>=a&&x<1,m.lerpVectors(r,h,x),m.y+=Math.sin(x*Math.PI)*.8,f.position.copy(m);let w=$e(v/350,0,1);g.visible=v>=0,g.scale.setScalar(.1+w*1.5);for(let T of _){let M=v/1e3,{vx:S,vz:F,vy:P}=T.userData;T.visible=v>=0&&M<.7,T.position.set(u+S*M,Math.max(.08,.2+P*M-4.4*M*M),d+F*M)}for(let T of p){let M=$e((v-200-T.userData.phase*90)/600,0,1);T.visible=M>0&&M<1,T.position.y=.1+M*.6,T.scale.setScalar(.07*(1+M*.8))}}};jt.dragons_breath=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,own:a,impactAt:l}=s;if(e.text){let u="#ffb347",d=new qe;d.name="breath-scales",t.add(d),d.position.set(o.x,0,o.z);let h=a(new Rn(1)),f=[];for(let g=0;g<10;g++){let _=i(d,h,n(g%2?u:"#fff0c8",.9,!0),0,.2,0,.07,.11,.03);_.name="breath-scale",_.userData.phase=g/10*Math.PI*2,f.push(_)}return i(d,r.cylinder,n(u,.22,!0),0,.8,0,.5,1.6,.5).name="breath-glow",g=>{let _=$e((g-l+300)/1200,0,1);d.visible=_>0&&_<1,f.forEach(p=>{let m=p.userData.phase+g*.006,y=(_*1.4+p.userData.phase/8)%1.5;p.position.set(Math.cos(m)*.45,.1+y,Math.sin(m)*.45),p.rotation.y=-m})}}let c=am[e.damage_type]||"#ff9a3c";return lm(s,{name:"breath-flame",edge:c,core:"#fff4d8",height:1.25,width:.4,speed:45,burn:380})};var Nu=s=>[[0,.62,-.62,.62,-.62][s%5],1.08+s%5*.4];jt.chromatic_orb=s=>{let{group:e,mat:t,mesh:n,geo:i,source:r,target:o,color:a,releaseAt:l,impactAt:c,own:u}=s,d=new qe;d.name="chromatic-orb",e.add(d),n(d,i.sphere,t("#ffffff"),0,0,0,.14).name="orb-core",n(d,i.sphere,t(a,.6,!0),0,0,0,.3).name="orb-shell";let h=u(new Ct(1,.05,6,28)),f=n(d,h,t("#ffffff",.9,!0),0,0,0,.36);f.name="orb-ring";let g=n(d,h,t(a,.9,!0),0,0,0,.36);g.name="orb-ring";let _=[];for(let m=0;m<7;m++){let y=n(e,i.sphere,t(a,.65-m*.08,!0),0,0,0,.16-m*.017);y.name="orb-tail",_.push(y)}let p=m=>{let y=new D().lerpVectors(r,o,$e(m,0,1));return y.y+=Math.sin($e(m,0,1)*Math.PI)*.3,y};return m=>{let y=(m-l)/Math.max(1,c-l);d.visible=y>=0&&y<1,d.position.copy(p(y)),f.rotation.set(m*.012,m*.007,0),g.rotation.set(m*-.009,0,m*.011),_.forEach((x,v)=>{x.visible=y>=0&&y<1.12,x.position.copy(p(y-(v+1)*.05))})}};jt.ray_of_frost=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:u,impactAt:d,span:h,own:f}=s,g=i(e,r.cylinder,n("#8fd8ff",.7,!0),0,0,0,.06,.01,.06);g.name="frost-beam";let _=i(e,r.cylinder,n("#ffffff",.95,!0),0,0,0,.022,.01,.022);g.quaternion.setFromUnitVectors(new D(0,1,0),l),_.quaternion.copy(g.quaternion);let p=f(new Rn(1)),m=[];for(let x=0;x<10;x++){let v=i(e,p,n(x%2?"#e6f7ff":"#9fdcff",.9,!0),0,0,0,.045,.1,.045);v.name="frost-shard",v.userData.phase=x/10,m.push(v)}let y=[];if(c.outcome==="hit")for(let x=0;x<7;x++){let v=x*Math.PI*2/7,w=i(t,r.cone,n("#c9eeff",.85,!0),Math.cos(v)*.4,-.6,Math.sin(v)*.4,.07,.45,.07);w.name="frost-crystal",w.userData.a=v,w.rotation.z=Math.cos(v)*.3,w.rotation.x=Math.sin(v)*.3,y.push(w)}return(x,{elapsedImpact:v})=>{let w=$e((x-u)/Math.max(1,d-u),0,1),T=Math.max(.01,h*w),M=x>=u;for(let S of[g,_])S.visible=M,S.scale.y=T,S.position.copy(o).addScaledVector(l,T/2);g.scale.x=g.scale.z=.06*(1+.3*Math.sin(x*.05)),m.forEach(S=>{let F=((x-u)/450+S.userData.phase)%1;S.visible=M&&F*h<=T,S.position.copy(o).addScaledVector(l,F*h),S.position.y+=Math.sin(F*9+S.userData.phase*20)*.12,S.rotation.set(F*8,F*5,0)}),y.forEach(S=>{let F=$e(v/220,0,1);S.scale.set(.07*F,.45*F,.07*F),S.position.y=-.6+.22*F})}};jt.scorching_ray=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,lane:c,releaseAt:u,impactAt:d,span:h,own:f}=s,g=new D().crossVectors(l,new D(0,1,0)).normalize(),_=o.clone().addScaledVector(g,(c-1)*.18);_.y+=c*.06;let p=new qe;p.name="scorch-lance",e.add(p);let m=i(p,r.cylinder,n("#ff7a1c",.9,!0),0,0,0,.07,.8,.07);m.rotation.x=Math.PI/2;let y=i(p,r.cylinder,n("#fff4c2",1,!0),0,0,0,.032,.8,.032);y.rotation.x=Math.PI/2;let x=i(p,r.sphere,n("#fff0a0",.9,!0),0,0,.4,.12);p.quaternion.setFromUnitVectors(new D(0,0,1),a.clone().sub(_).normalize());let v=[];for(let M=0;M<8;M++){let S=i(e,r.sphere,n(M%2?"#ffb347":"#ff6a1a",.8,!0),0,0,0,.05);S.name="scorch-spark",S.userData.phase=M,v.push(S)}let w=i(t,f(new zr(1,20)),n("#2a1a10",.7),0,-.84,0,.45,.45,.45);w.rotation.x=-Math.PI/2,w.name="scorch-mark";let T=new D;return(M,{elapsedImpact:S})=>{let F=$e((M-u)/Math.max(1,d-u),0,1);p.visible=M>=u&&F<1,p.position.lerpVectors(_,a,F),v.forEach(P=>{let k=$e(F-(P.userData.phase+1)*.04,0,1);P.visible=M>=u&&F<1.15&&k>0,T.lerpVectors(_,a,k),T.y+=Math.sin(M*.05+P.userData.phase*2)*.07,P.position.copy(T)}),w.visible=S>=0,w.scale.setScalar(.2+$e(S/200,0,1)*.3)}};jt.spiritual_weapon=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,releaseAt:l,impactAt:c,own:u}=s,d=new qe;d.name="spirit-hammer",e.add(d),i(d,r.cylinder,n("#cfe8ff",.9,!0),0,0,0,.04,.5,.04).name="spirit-haft",i(d,r.box,n("#9fd0ff",.85,!0),0,.3,0,.26,.17,.17).name="spirit-head",i(d,r.sphere,n("#e6f4ff",.35,!0),0,.15,0,.42);let h=i(t,u(new Ct(1,.03,6,40)),n("#bfe0ff",.85,!0),0,-.78,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="spirit-ring";let f=i(t,r.box,n("#e6f4ff",.8,!0),0,-.82,0,.7,.02,.05);f.name="spirit-crack";let g=new D;return(_,{elapsedImpact:p})=>{let m=$e((_-l)/Math.max(1,c-l),0,1);d.visible=_>=l-150&&p<180,g.lerpVectors(o,a,m),g.y+=Math.sin(m*Math.PI)*.9+(m<.15?m*3:0),d.position.copy(g),d.rotation.set(0,0,-.4-m*1.9);let y=$e(p/400,0,1);h.visible=p>=0,h.scale.setScalar(.3+y*.9),f.visible=p>=0,f.scale.set(.7+y*.8,1,1),f.rotation.y=.6}};var SM={bless:{c:"#ffe27a",motes:1},aid:{c:"#8dffa8",crosses:1},shield_of_faith:{c:"#7fb8ff",dome:1},sanctuary:{c:"#f4f0ff",dome:1,motes:1},protection_from_evil_and_good:{c:"#fff0b0",sigil:1},blur:{c:"#bcd8ff",ghosts:1},mirror_image:{c:"#79e6ff",ghosts:1,runes:1},mage_armor:{c:"#65d6ff",dome:1,sigil:1},dodge:{c:"#d8e8f2",sigil:1},dash:{c:"#ffd98a",rings:1},redirect_attack:{c:"#ff9f5a",rings:1},innate_sorcery:{c:"#ff7a3c",flames:1},metamagic:{c:"#d6a8ff",runes:1},action_surge:{c:"#ffe9a0",ghosts:1,flames:1},lesser_restoration:{c:"#b8ffd8",motes:1,crosses:1},command:{c:"#e8d9a8",rings:1},rage:{c:"#ff3b2e",flames:1,rings:1},extend_rage:{c:"#ff3b2e",flames:1},reckless_attack:{c:"#ff9a3c",rings:1}};jt.buff=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,target:o,impactAt:a,own:l}=s,c=SM[e.variant]||{c:"#ffffff",motes:1},u=new qe;u.name=`buff-${e.variant}`,t.add(u),u.position.set(o.x,0,o.z);let d=l(new Ct(1,.03,6,40)),h=i(u,d,n(c.c,.9,!0),0,.1,0,.3,.3,.3);h.rotation.x=-Math.PI/2,h.name="buff-ring";let f=[],g=(_,p,m={})=>(_.name=`buff-${p}`,Object.assign(_.userData,m),f.push({item:_,kind:p}),_);if(c.motes)for(let _=0;_<10;_++)g(i(u,r.sphere,n(_%2?c.c:"#ffffff",.9,!0),0,0,0,.05),"mote",{phase:_/10});if(c.dome&&g(i(u,r.sphere,n(c.c,.25,!0),0,.6,0,.62,.78,.62),"dome"),c.sigil){let _=new qe;u.add(_),_.position.y=.06,i(_,d,n(c.c,.95,!0),0,0,0,.55,.55,.55).rotation.x=-Math.PI/2;for(let p=0;p<6;p++)i(_,r.box,n("#ffffff",.85,!0),0,0,0,.03,.01,1).rotation.y=p*Math.PI/6;g(_,"sigil")}if(c.crosses)for(let _=0;_<3;_++){let p=new qe;u.add(p),i(p,r.box,n(c.c,.95,!0),0,0,0,.14,.04,.04),i(p,r.box,n(c.c,.95,!0),0,0,0,.04,.14,.04),g(p,"cross",{phase:_*2.1})}if(c.ghosts)for(let _=0;_<3;_++)g(i(u,r.sphere,n(c.c,.3,!0),0,.6,0,.2,.42,.2),"ghost",{phase:_*2.1});if(c.flames)for(let _=0;_<8;_++)g(i(u,r.cone,n(_%2?"#ffb347":c.c,.85,!0),0,.3,0,.07,.5,.07),"flame",{phase:_/8*Math.PI*2});if(c.runes){let _=l(new Rn(1));for(let p=0;p<6;p++)g(i(u,_,n(p%2?"#ffffff":c.c,.95,!0),0,0,0,.06,.1,.03),"rune",{phase:p/6*Math.PI*2})}if(c.rings)for(let _=0;_<3;_++)g(i(u,d,n(c.c,.9,!0),0,.8,0,.2,.2,.2),"word",{phase:_*.25});return _=>{let p=$e((_-a+250)/1100,0,1);u.visible=p>0&&p<1,h.scale.setScalar(.3+p*.75);for(let{item:m,kind:y}of f){let x=m.userData,v=_*.006+(x.phase||0);if(y==="mote")m.position.set(Math.cos(v+x.phase*6)*.4,(p*1.2+x.phase)%1*1.5,Math.sin(v+x.phase*6)*.4);else if(y==="dome")m.scale.set(.62*(.5+p*.6),.78*(.5+p*.6),.62*(.5+p*.6));else if(y==="sigil")m.rotation.y=_*.004;else if(y==="cross")m.position.set(Math.cos(v)*.36,.15+p*1.3*((x.phase/2.1+1)/3),Math.sin(v)*.36),m.rotation.y=-v;else if(y==="ghost")m.position.set(Math.cos(v)*.38*p*2,.6,Math.sin(v)*.38*p*2);else if(y==="flame")m.position.set(Math.cos(x.phase)*.4,.25+p*.5,Math.sin(x.phase)*.4),m.scale.y=.5*(.6+.4*Math.sin(_*.03+x.phase*3))*(1.2-p*.4);else if(y==="rune")m.position.set(Math.cos(v*1.5)*.45,.5+p*.6,Math.sin(v*1.5)*.45),m.rotation.y=v;else if(y==="word"){let w=$e(p*1.4-x.phase,0,1);m.visible=w>0&&w<1,m.scale.setScalar(.2+w*.8),m.material.opacity=.9*(1-w)}}}};jt.command=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,event:c,releaseAt:u,impactAt:d,own:h}=s,f=h(new Ct(1,.03,6,36)),g=[0,1,2].map(p=>{let m=i(e,f,n(p%2?"#fff0c0":"#e8d9a8",.9,!0),0,0,0,.18,.18,.18);return m.name="command-ring",m.userData.i=p,m.quaternion.setFromUnitVectors(new D(0,0,1),l),m}),_=[];if(c.outcome==="hit")for(let p=0;p<4;p++){let m=p*Math.PI/2,y=i(t,r.cone,n("#fff0c0",.9,!0),Math.cos(m)*.28,1.2,Math.sin(m)*.28,.09,.28,.09);y.name="command-arrow",y.rotation.x=Math.PI,_.push(y)}return(p,{elapsedImpact:m})=>{g.forEach(y=>{let x=$e((p-u)/Math.max(1,d-u)-y.userData.i*.18,0,1);y.visible=p>=u&&x>0&&x<1,y.position.lerpVectors(o,a,x),y.scale.setScalar(.18+x*.4)}),_.forEach((y,x)=>{let v=$e((m-x*40)/500,0,1);y.visible=m>=0&&v<1,y.position.y=1.2-v*1})}};jt.undead=s=>{let{event:e,group:t,mat:n,mesh:i,geo:r,source:o,target:a,impactAt:l,own:c}=s,u=e.variant,d=new qe;d.name=`undead-${u}`,t.add(d);let h=u==="stench"?o:a;d.position.set(h.x,0,h.z);let f=[],g=(_,p,m={})=>(_.name=`undead-${p}`,Object.assign(_.userData,m),f.push({item:_,kind:p}),_);if(u==="stench"){for(let _=0;_<9;_++)g(i(d,r.sphere,n(_%2?"#7aa83a":"#a6c85a",.5),0,.3,0,.3),"puff",{phase:_/9*Math.PI*2,r:.5+_%3*.22});g(i(d,r.sphere,n("#8fb84a",.18),0,.45,0,1.2,.6,1.2),"cloud")}else if(u==="paralyzed"){let _=c(new Rn(1));for(let m=0;m<5;m++)g(i(d,_,n("#ffe27a",.95,!0),0,1.1,0,.07,.12,.04),"star",{phase:m/5*Math.PI*2});let p=c(new Ct(1,.03,6,32));g(i(d,p,n("#fff0a0",.9,!0),0,.12,0,.3,.3,.3),"ring")}else if(u==="poisoned")for(let _=0;_<8;_++)g(i(d,r.sphere,n(_%2?"#8fd36a":"#c7f59a",.7,!0),0,.2,0,.06),"bubble",{phase:_/8,a:_*2.4});else if(u==="strength_drain"){let _=c(new Ct(1,.035,6,32));g(i(d,_,n("#d24a4a",.9,!0),0,.12,0,.3,.3,.3),"ring");for(let p=0;p<4;p++){let m=i(d,r.cone,n(p%2?"#ff8a8a":"#d24a4a",.95,!0),(p-1.5)*.18,1.4,0,.07,.2,.07);m.rotation.z=Math.PI,g(m,"drop",{i:p})}}else if(u==="fortitude"){let _=c(new Ct(1,.04,6,32));g(i(d,_,n("#b9d49a",.95,!0),0,.1,0,.3,.3,.3),"ring");for(let p=0;p<8;p++)g(i(d,r.sphere,n(p%2?"#d7e8b8":"#8fa07a",.9),0,.3,0,.07),"pop",{a:p*Math.PI/4})}return _=>{let p=$e((_-l+250)/1300,0,1);d.visible=p>0&&p<1;for(let{item:m,kind:y}of f){let x=m.userData;if(y==="puff"){let v=x.r*(.5+p),w=_*.003+x.phase;m.position.set(Math.cos(w)*v,.3+.25*Math.sin(w*2),Math.sin(w)*v),m.scale.setScalar(.3*(.6+p*.7))}else if(y==="cloud")m.scale.set(1.2*(.4+p),.6*(.6+p*.4),1.2*(.4+p));else if(y==="star"){let v=_*.009+x.phase;m.position.set(Math.cos(v)*.38,1+.1*Math.sin(v*3),Math.sin(v)*.38),m.rotation.y=v}else if(y==="ring")m.scale.setScalar(.3+p*.7);else if(y==="bubble"){let v=(p*1.4+x.phase)%1;m.position.set(Math.cos(x.a)*.3*v,.2+v*1.1,Math.sin(x.a)*.3*v)}else if(y==="drop"){let v=$e(p*1.6-x.i*.08,0,1);m.position.y=1.4-v*1.1,m.visible=v<1}else if(y==="pop"){let v=$e(p*2,0,1);m.position.set(Math.cos(x.a)*.6*v,.3+Math.sin(v*Math.PI)*.5,Math.sin(x.a)*.6*v)}}}};jt.necrotic=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,own:d}=s,h=i(e,d(new Bn(.5,.62,28,1,-.9,1.8)),n("#5b2a8a",.95,!0),o.x,o.y,o.z,1,1,1);h.rotation.set(-Math.PI/2,0,-Math.PI/2),h.name="necrotic-arc";let f=[];for(let p=0;p<7;p++){let m=i(t,r.sphere,n(p%2?"#7d3fb8":"#2b1840",.8),0,0,0,.1);m.name="necrotic-wisp",m.userData.a=p*.9,f.push(m)}let g=i(e,r.sphere,n("#7d3fb8",.9,!0),o.x,o.y,o.z,.1);g.name="necrotic-bolt";let _=Math.atan2(l.x,l.z);return(p,{elapsedImpact:m})=>{let y=$e((p-c)/Math.max(1,u-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,$e(y*.35,0,1)),h.rotation.z=-Math.PI/2+_,h.scale.setScalar(.8+y*.6),g.visible=p>=c&&y<1,g.position.lerpVectors(o,a,y),f.forEach(x=>{let v=$e(m/800,0,1);x.visible=m>=0&&v<1,x.position.set(Math.cos(x.userData.a)*.35*v,-.6+v*1.3,Math.sin(x.userData.a)*.35*v),x.scale.setScalar(.1*(1-v*.6))})}};jt.rotting_fist=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,own:d}=s,h=i(e,d(new Bn(.45,.72,28,1,-1,2)),n("#dfc280",.9,!0),o.x,o.y,o.z);h.rotation.set(-Math.PI/2,0,-Math.PI/2);let f=Math.atan2(l.x,l.z),g=[];for(let p=0;p<12;p++){let m=i(t,r.sphere,n(p%3===0?"#8c4cd8":"#d8b46a",.85,p%3===0),0,0,0,.065);m.userData={a:p*(Math.PI*2/12),h:p%4*.16},g.push(m)}let _=i(t,d(new Ct(.48,.032,6,36)),n("#9b5ce0",.9,!0),0,-.74,0);return _.rotation.x=-Math.PI/2,(p,{elapsedImpact:m})=>{let y=$e((p-c)/Math.max(1,u-c),0,1);h.visible=p>=c&&y<1,h.position.lerpVectors(o,a,$e(y*.55,0,1)),h.rotation.z=-Math.PI/2+f+(y-.5)*.9;let x=$e(m/750,0,1);_.visible=m>=0&&x<1,_.scale.setScalar(.4+x*.9),g.forEach(v=>{v.visible=m>=0&&x<1;let w=v.userData.a+x*4.5;v.position.set(Math.cos(w)*(.25+x*.45),-.55+x*1.2+v.userData.h,Math.sin(w)*(.25+x*.45)),v.scale.setScalar(.07*(1-x*.5))})}};jt.dreadful_glare=s=>{let{group:e,impact:t,mat:n,mesh:i,geo:r,source:o,target:a,direction:l,releaseAt:c,impactAt:u,span:d,own:h}=s,f=new D().crossVectors(l,new D(0,1,0)).normalize(),g=new D(0,1,0),_=[-.07,.07].map(y=>{let x=i(e,r.cylinder,n("#ffbe3d",.88,!0),0,0,0,.036,.01,.036);return x.quaternion.setFromUnitVectors(g,l),x.userData.off=y,x}),p=i(e,r.sphere,n("#ffe680",.95,!0),o.x,o.y+.25,o.z,.22),m=i(t,h(new Ct(.52,.035,6,36)),n("#ffaa2b",.92,!0),0,-.72,0);return m.rotation.x=-Math.PI/2,(y,{elapsedImpact:x})=>{let v=$e((y-c)/Math.max(1,u-c),0,1),w=y>=c&&x<420,T=Math.max(.01,d*v);p.visible=w,p.scale.setScalar(.22*(1+.35*Math.sin(y*.05)));for(let S of _)S.visible=w,S.scale.y=T,S.position.copy(o).addScaledVector(l,T/2).addScaledVector(f,S.userData.off),S.position.y+=.22*(1-v*.5);let M=$e(x/650,0,1);m.visible=x>=0&&M<1,m.scale.setScalar(.35+M*.95)}};jt.draining_swipe=s=>{let{impact:e,mat:t,mesh:n,geo:i,direction:r,impactAt:o}=s,a=Math.atan2(r.x,r.z),l=[];for(let c=0;c<3;c++){let u=n(e,i.box,t(c===1?"#c9b8e8":"#3a2a52",.95,!0),(c-1)*.16,.1,0,.05,.9,.02);u.name="swipe-streak",u.rotation.z=-.6,u.userData.i=c,l.push(u)}return(c,{elapsedImpact:u})=>{l.forEach(d=>{let h=$e((u-d.userData.i*70)/140,0,1);d.visible=u>=d.userData.i*70&&h<=1&&u<700,d.scale.y=.9*h,d.position.y=.55-h*.45,d.rotation.y=a})}};jt.touch=s=>{let{event:e,group:t,impact:n,mat:i,mesh:r,geo:o,source:a,target:l,direction:c,impactAt:u,own:d}=s,h=e.variant,f=new qe;f.name=`touch-${h}`,t.add(f),f.position.set(l.x,0,l.z);let g=[],_=(m,y,x={})=>(m.name=`touch-${y}`,Object.assign(m.userData,x),g.push({item:m,kind:y}),m),p=d(new Ct(1,.035,6,32));if(h==="graze"){let m=_(r(f,o.box,i("#fff4d8",.95,!0),0,.7,0,.05,.9,.03),"streak");m.rotation.z=-.7;for(let y=0;y<5;y++)_(r(f,o.sphere,i("#ffd27a",.9,!0),0,.7,0,.04),"spark",{a:y*1.3})}else if(h==="shield")_(r(f,o.sphere,i("#7fb8ff",.35,!0),0,.62,0,.62,.78,.62),"dome"),_(r(f,p,i("#cfe4ff",.95,!0),0,.1,0,.3,.3,.3),"ring");else if(h==="flee"){for(let m=0;m<6;m++)_(r(f,o.sphere,i("#b8b2a4",.55),0,.15,0,.1),"dust",{a:m*1.05});for(let m=0;m<3;m++)_(r(f,o.cone,i("#e8f0ff",.9,!0),0,.5,0,.07,.2,.07),"chevron",{i:m}).quaternion.setFromUnitVectors(new D(0,1,0),new D(c.x,0,c.z).normalize())}else if(h==="second_wind"){for(let m=0;m<6;m++){let y=_(r(f,o.box,i("#ffe9a0",.85,!0),0,0,0,.35,.025,.025),"wind",{phase:m/6*Math.PI*2,h:m});y.name="touch-wind"}_(r(f,o.sphere,i("#ffe27a",.25,!0),0,.6,0,.5,.7,.5),"glow")}else if(h==="dissolve"){_(r(f,p,i("#9a9486",.8),0,.1,0,.3,.3,.3),"ring");for(let m=0;m<12;m++)_(r(f,o.sphere,i(m%2?"#c8c2b2":"#6e6a60",.85),0,.2,0,.06),"ash",{a:m*2.4,phase:m/12})}else if(h==="opportunity"){let m=_(r(f,o.box,i("#ff6e54",.95,!0),0,.72,0,.07,1.05,.04),"streak");m.rotation.z=.65,_(r(f,p,i("#ff8a66",.9,!0),0,.12,0,.35,.35,.35),"ring")}return m=>{let y=$e((m-u+250)/(h==="dissolve"?1500:1e3),0,1);f.visible=y>0&&y<1;for(let{item:x,kind:v}of g){let w=x.userData;if(v==="streak")x.scale.y=.9*$e(y*4,0,1),x.position.y=.95-$e(y*4,0,1)*.5;else if(v==="spark"){let T=$e(y*3,0,1);x.position.set(Math.cos(w.a)*.5*T,.7+Math.sin(w.a)*.3*T,Math.sin(w.a)*.5*T)}else if(v==="dome")x.scale.set(.62*(.7+y*.5),.78*(.7+y*.5),.62*(.7+y*.5));else if(v==="ring")x.scale.setScalar(.3+y*.8);else if(v==="dust"){let T=$e(y*2,0,1);x.position.set(Math.cos(w.a)*.5*T,.15+T*.2,Math.sin(w.a)*.5*T),x.scale.setScalar(.1+T*.12)}else if(v==="chevron"){let T=$e(y*1.8-w.i*.15,0,1);x.position.set(c.x*(.3+T*1.2),.5,c.z*(.3+T*1.2)),x.visible=T<1}else if(v==="wind"){let T=m*.01+w.phase;x.position.set(Math.cos(T)*.42,.1+(y*1.5+w.h*.12)%1*1.3,Math.sin(T)*.42),x.rotation.y=-T+Math.PI/2}else if(v==="glow")x.scale.set(.5*(.5+y),.7*(.5+y),.5*(.5+y));else if(v==="ash"){let T=(y*1.2+w.phase)%1;x.position.set(Math.cos(w.a)*.4*T,.2+T*1.3,Math.sin(w.a)*.4*T),x.scale.setScalar(.06*(1-T*.5))}}}};function cm({scene:s,units:e,requestRender:t,reducedMotion:n=!1}){let i=new qe;i.name="combat-effects",s.add(i);let r=[],o=[],a=[],l=null,c=-1,u=-1,d=!1,h=n,f=!!document.hidden;function g(){for(let P of e.values())for(let k of P.ownMaterials){let H=k.userData.restEmissive;k.emissive.setHex(H?.color??0),k.emissiveIntensity=H?.intensity??0}}function _(P){P.group.removeFromParent();for(let k of P.resources)k.dispose();P.resources.clear()}function p(){for(let P of r)_(P);r.length=0,o.length=0,g()}function m(P){return Number.isSafeInteger(P?.id)&&P.id>=0&&xM.has(P.style)&&Number.isSafeInteger(P.amount)&&P.amount>=0&&["attack","heal"].includes(P.type)&&["hit","miss","heal"].includes(P.outcome)&&Number.isFinite(P.source?.x)&&Number.isFinite(P.source?.y)&&Number.isFinite(P.target?.x)&&Number.isFinite(P.target?.y)}function y(P,k=performance.now()){if(d||typeof P.encounter_id!="string"||!Number.isInteger(P.revision))return;let H=P.encounter_id;if(H!==l&&a.includes(H)||H===l&&P.revision<=c)return;let z=(Array.isArray(P.effects)?P.effects:[]).filter(W=>Number.isSafeInteger(W?.id)).sort((W,me)=>W.id-me.id),U=z.reduce((W,me)=>Math.max(W,me.id),-1);if(H!==l){l!==null&&(a.push(l),a.length>8&&a.shift()),p(),l=H,c=P.revision,u=U;return}c=P.revision;let q=[];for(let W of z)W.id>u&&(u=W.id,m(W)&&q.push(W));if(u=Math.max(u,U),f||document.hidden){p();return}let $=new Map;for(let W of r){let me=`${W.event.target.x},${W.event.target.y}`;$.set(me,($.get(me)||0)+1)}for(let W of o){let me=`${W.event.target.x},${W.event.target.y}`;$.set(me,($.get(me)||0)+1)}q.slice(-xa).forEach((W,me)=>{let J=`${W.target.x},${W.target.y}`,le=$.get(J)||0;$.set(J,le+1);let Se=q.length>1?(me+le)%5:le%5;o.push({event:W,lane:Se,due:k+me*85,received:k,first:me===0||q[me-1].style!==W.style})}),o.length>xa&&o.splice(0,o.length-xa),o.length&&t()}function x({event:P,lane:k,timing:H,origin:z,first:U},q){let $=new qe;$.name=`combat-${P.style}-${P.id}`,Object.assign($.userData,{effectId:P.id,effectStyle:P.style,effectOutcome:P.outcome,amount:P.amount,sourceId:P.source_id,targetId:P.target_id,reducedMotion:h,source:{...P.source},target:{...P.target}}),i.add($);let W=new Set,me=[],J=K=>(W.add(K),K),le=J(new Ws(1,1)),Se=J(new Si(1,1,1,8)),Le=J(new zs(1,1,8)),et=J(new bi(1,1,1)),V=(K,oe=1,ge=!1)=>{let Te=J(new dn({color:K,transparent:!0,opacity:oe,depthWrite:!1,side:Tn,toneMapped:!1,blending:ge?Js:Ms}));return me.push({material:Te,opacity:oe}),Te};function he(K,oe,ge,Te,We,ot,Ae=1,Qe=Ae,_t=Ae){let Oe=new Jt(oe,ge);return Oe.position.set(Te,We,ot),Oe.scale.set(Ae,Qe,_t),K.add(Oe),Oe}let Ee=z?new D(...z):new D(P.source.x,.88,P.source.y),Fe=new D(P.target.x,.88,P.target.y),_e=Fe.clone().sub(Ee);_e.lengthSq()<.001&&_e.copy(om),_e.normalize();let ce=P.outcome==="miss"?"#d3dbe0":vM.has(P.style)&&am[P.damage_type]||bM[P.style],Ie=new qe;Ie.name="impact",$.add(Ie),Ie.position.copy(Fe);let ve=P.outcome==="heal",Ne=h?0:H?.releaseAt||0,je=h?0:H?.impactAt??(ve?0:P.style==="slash"?220:rm.has(P.style)?300:450),Ke=h?650:ve?1040:je+650,st=null,gt=null,Pt=[],yt=[];if(!h&&P.style==="slash"){gt=new qe,gt.name="slash-arc",$.add(gt),gt.position.copy(Ee),gt.rotation.y=Math.atan2(_e.x,_e.z);let K=J(new Bn(.58,1.2,32,1,-.96,1.92)),oe=K.attributes.position;for(let We=0;We<oe.count;We++){let ot=Math.atan2(oe.getY(We),oe.getX(We));if(Math.hypot(oe.getX(We),oe.getY(We))<.9){let Qe=1.2-.62*Math.sin((ot+.96)/1.92*Math.PI);oe.setXYZ(We,Math.cos(ot)*Qe,Math.sin(ot)*Qe,0)}}oe.needsUpdate=!0;let ge=he(gt,K,V("#fff1c9",.85),0,0,0);ge.rotation.set(-Math.PI/2,0,-Math.PI/2);let Te=J(new Bn(1.16,1.22,32,1,-.96,1.92));he(gt,Te,V("#ffd27c",.95),0,.012,0).rotation.copy(ge.rotation),gt.userData.baseAngle=gt.rotation.y}else if(!h&&!ve&&!rm.has(P.style))if(st=new qe,st.name=`${P.style}-projectile`,$.add(st),st.position.copy(Ee),st.quaternion.setFromUnitVectors(om,_e),P.style==="arrow"){let K=he(st,Se,V("#c89a60"),0,0,-.18,.028,.76,.028);K.name="arrow-shaft",K.rotation.x=Math.PI/2;let oe=he(st,Le,V("#e8f5ee"),0,0,.29,.095,.24,.055);oe.name="arrow-head",oe.rotation.x=Math.PI/2;let ge=V("#fff0d1");he(st,et,ge,0,0,-.49,.2,.025,.2).name="arrow-fletching",he(st,et,ge,0,0,-.49,.025,.2,.2)}else if(P.style==="firebolt"){he(st,le,V("#ff651c"),0,0,0,.23,.21,.31).name="firebolt-flame",he(st,le,V("#fff0a2"),0,0,.12,.13,.13,.2);let K=he(st,Le,V("#ff9b25",.8),0,0,-.29,.2,.58,.2);K.rotation.x=-Math.PI/2;for(let oe=0;oe<7;oe++){let ge=he(st,le,V(oe%2?"#ffb344":"#ef5221",.65-oe*.065),Math.sin(oe*2.3)*.06,Math.cos(oe*2.3)*.06,-.32-oe*.13,.15-oe*.015);ge.name="fire-trail",yt.push(ge)}for(let oe=0;oe<6;oe++){let ge=he(st,le,V("#ffdb79"),0,0,-.15-oe*.13,.032);ge.name="fire-spark",Pt.push(ge)}}else if(P.style==="sorcerous_burst"){he(st,le,V(ce,.55,!0),0,0,0,.4,.4,.4).name="burst-shell",he(st,le,V("#ffffff"),0,0,0,.19,.19,.19).name="burst-core";let K=J(new Rn(1));for(let oe=0;oe<4;oe++){let ge=he(st,K,V(oe%2?"#ffffff":ce,.9),.45,0,0,.08,.15,.08);ge.name="burst-shard",ge.userData.phase=oe*Math.PI/2,Pt.push(ge)}for(let oe=0;oe<6;oe++){let ge=he(st,le,V(ce,.6-oe*.08,!0),Math.sin(oe*1.9)*.08,Math.cos(oe*2.7)*.08,-.26-oe*.15,.16-oe*.018);ge.name="burst-trail",yt.push(ge)}}else{let K=J(new Rn(1));he(st,K,V("#a18aff",.75),0,0,-.04,.22,.19,.42).name="missile-violet-shell",he(st,K,V("#a8fbff"),0,0,.12,.12,.1,.3).name="missile-cyan-dart";for(let oe=0;oe<5;oe++){let ge=he(st,le,V(oe%2?"#ae80ff":"#65deff",.7-oe*.1),0,0,-.33-oe*.17,.1-oe*.014);ge.name="missile-trail",yt.push(ge)}}st&&st.traverse(K=>{K.userData.effectRole="projectile"});let zt=null,rt=null,Ft=null,sn=[],rn=new D(0,1,0),X=Ee.distanceTo(Fe);if(!h&&P.style==="life_drain"){rt=he($,Se,V("#3a2652",.85),0,0,0,.05,.01,.05),rt.name="drain-tendril",rt.quaternion.setFromUnitVectors(rn,_e),zt=[];for(let K=0;K<10;K++){let oe=he($,le,V(K%2?"#9be07a":"#d2f7b4",.9,!0),0,0,0,.065);oe.name="drain-mote",oe.visible=!1,zt.push({item:oe,phase:K/10,side:(K%3-1)*.2})}}if(!h&&P.style==="turn_undead"&&(rt=he($,Se,V("#ffe9a0",.6,!0),0,0,0,.05,.01,.05),rt.name="turn-ray",rt.quaternion.setFromUnitVectors(rn,_e),U)){Ft=new qe,Ft.name="turn-sigil",$.add(Ft),Ft.position.set(Ee.x,.1,Ee.z);let K=J(new Ct(1,.025,6,64)),oe=he(Ft,K,V("#ffe9a0",.9,!0),0,0,0);oe.rotation.x=-Math.PI/2,oe.name="turn-wave";let ge=new qe;ge.name="turn-seal",Ft.add(ge);let Te=he(ge,K,V("#fff4c8",.95,!0),0,.01,0,.75,.75,.75);Te.rotation.x=-Math.PI/2;let We=he(ge,K,V("#ffd36b",.9,!0),0,.02,0,.5,.5,.5);We.rotation.x=-Math.PI/2;for(let ot=0;ot<8;ot++){let Ae=he(ge,et,V("#fff4c8",.9,!0),0,.015,0,.03,.01,.75);Ae.rotation.y=ot*Math.PI/8}Ft.userData.waveReach=6.2}let ft=new qe;ft.name=ve?"second-wind-halo":"impact-burst",Ie.add(ft);let It=J(new Ct(.49,ve?.035:.025,6,40)),Ut=he(ft,It,V(ce,.9),0,ve?-.68:0,0);Ut.rotation.x=-Math.PI/2;let Me=ve?he(ft,It,V("#c1ffd7",.6),0,.15,0):null;Me&&(Me.rotation.x=-Math.PI/2);let Re=[];if(P.outcome!=="miss")for(let K=0;K<(ve?8:10);K++){let oe=K*Math.PI*2/(ve?8:10),ge=new D(Math.cos(oe),ve?.8:Math.sin(K*2.1)*.45,Math.sin(oe)),Te=he(ft,ve?et:le,V(K%3?ce:ve?"#d5ffe1":"#fff4d4"),0,0,0,ve?.045:.07,ve?.15:.07,ve?.045:.07);Re.push({item:Te,velocity:ge})}let Ve=document.createElement("canvas");Ve.width=384,Ve.height=128;let ke=Ve.getContext("2d");if(P.style==="turn_undead"&&P.outcome==="hit"){let K=he(Ie,Se,V("#fff0b0",.22,!0),0,.5,0,.12,2.2,.12);K.name="turn-pillar";let oe=J(new Rn(1));for(let ge=0;ge<4;ge++){let Te=he(Ie,oe,V("#ffe27a",.95,!0),0,.95,0,.06,.1,.02);Te.name="turn-rune",Te.userData.phase=ge*Math.PI/2,sn.push(Te)}}let L=P.text?String(P.text):P.style==="turn_undead"?P.outcome==="miss"?"RESISTS":"TURNED":P.style==="dreadful_glare"?P.outcome==="miss"?"RESISTS GLARE":"FRIGHTENED!":P.outcome==="miss"?"MISS":ve?`+${P.amount}`:`\u2212${(Number(P.amount)||0)+(Number(P.rider)||0)}`,E=!!(P.crit&&P.outcome==="hit");if(E){let K=he(ft,J(new Ct(.72,.045,6,40)),V("#ffd95e",.98,!0),0,.05,0);K.rotation.x=-Math.PI/2}ke.font=E?"900 78px system-ui, sans-serif":"800 74px system-ui, sans-serif",ke.textAlign="center",ke.textBaseline="middle",ke.strokeStyle="#0d1a1f",ke.lineWidth=14,ke.lineJoin="round";let Q=P.style==="life_drain"&&P.outcome!=="miss"&&P.amount>0,we=P.outcome==="hit"&&Number(P.rider)>0?`+${P.rider} ${String((P.rider_types||[])[0]||"").toUpperCase()}`.trim():"",ye=P.style==="rotting_fist"&&P.outcome==="hit",de=E?"CRITICAL!":Q?"MAX HP":we?ye?`${we} \xB7 CURSED`:we:ye?"CURSED":"";de&&(ke.font="800 62px system-ui, sans-serif");let re=E?"#ffd95e":ce;ke.strokeText(L,192,de?50:67),ke.fillStyle=re,ke.fillText(L,192,de?50:67),de&&(ke.font="800 29px system-ui, sans-serif",ke.lineWidth=8,ke.fillStyle=E?"#fff2a6":re,ke.strokeText(de,192,102),ke.fillText(de,192,102));let N=J(new Ki(Ve));N.colorSpace=Kt;let fe=J(new fs({map:N,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1})),Ce=new Bs(fe);Ce.name="combat-amount",Ce.renderOrder=30,Ce.userData.text=L,Ce.userData.effectRole="label",Ce.position.set(Nu(k)[0],Nu(k)[1],0),Ie.add(Ce),Ce.scale.set(1.9,.64,1);let B={event:P,group:$,resources:W,fades:me,source:Ee,target:Fe,direction:_e,travel:st,arc:gt,impact:Ie,burst:ft,halo:Ut,halo2:Me,burstParticles:Re,label:Ce,textMaterial:fe,sparks:Pt,trail:yt,lane:k,start:q,drain:zt,beam:rt,sigil:Ft,runes:sn,span:X,up:rn,impactAt:je,releaseAt:Ne,swingDuration:H?180:360,duration:Ke,reduced:h},xe=jt[P.style];return xe&&!h&&(B.custom=xe({event:P,group:$,impact:Ie,source:Ee,target:Fe,direction:_e,color:ce,mat:V,mesh:he,own:J,fades:me,geo:{sphere:le,cylinder:Se,cone:Le,box:et},lane:k,first:U,releaseAt:Ne,impactAt:je,duration:Ke,area:P.area||null,span:Ee.distanceTo(Fe)})||null),r.push(B),B}function v(P,k,H=600){if(d||f)return!1;g();for(let z=r.length-1;z>=0;z--)P-r[z].start>=r[z].duration&&(_(r[z]),r.splice(z,1));for(;o.length&&P-o[0].received>yM;)o.shift();for(;r.length<_M&&o.length&&o[0].due<=P;)x(o.shift(),P);for(let z of r){let{event:U,travel:q,arc:$,impact:W,source:me,target:J,direction:le,halo:Se,halo2:Le,label:et}=z,V=P-z.start,he=V-z.impactAt,Ee=$e(he/(z.duration-z.impactAt),0,1);if(W.visible=he>=0,q){q.visible=V>=z.releaseAt&&V<z.impactAt;let _e=$e((V-z.releaseAt)/Math.max(1,z.impactAt-z.releaseAt),0,1);if(q.position.lerpVectors(me,J,_e),U.style==="magic_missile"){let ce=Math.sin(_e*Math.PI)*(z.lane%2?-.35:.35);q.position.x+=le.z*ce,q.position.z-=le.x*ce,q.position.y+=Math.sin(_e*Math.PI)*(.2+z.lane*.12)}if(z.sparks.forEach((ce,Ie)=>{if(ce.userData.phase!==void 0){let ve=V*.014+ce.userData.phase,Ne=.48-_e*.14;ce.position.set(Math.cos(ve)*Ne,Math.sin(ve)*Ne,0),ce.rotation.set(ve,ve*1.3,0);return}ce.position.x=Math.sin(V*.02+Ie*2)*.22,ce.position.y=Math.cos(V*.016+Ie*2)*.2}),U.style==="sorcerous_burst"){let ce=1+.18*Math.sin(V*.03);q.children.forEach(Ie=>{Ie.name==="burst-shell"&&Ie.scale.setScalar(.4*ce)})}}if($){let _e=V-z.releaseAt;$.visible=_e>=0&&_e<z.swingDuration,$.rotation.y=$.userData.baseAngle+(_e/z.swingDuration-.5)*1.15}if(z.drain){let _e=$e((V-z.releaseAt)/Math.max(1,z.impactAt-z.releaseAt),0,1),ce=z.beam;ce.visible=V>=z.releaseAt,ce.scale.y=Math.max(.01,z.span*_e),ce.position.copy(me).addScaledVector(le,z.span*_e/2);for(let{item:Ie,phase:ve,side:Ne}of z.drain){let je=((V-z.impactAt)/800+ve)%1;Ie.visible=V>=z.impactAt&&je>=0;let Ke=$e(je,0,1);Ie.position.lerpVectors(J,me,Ke),Ie.position.x+=le.z*Ne*Math.sin(Ke*Math.PI),Ie.position.z-=le.x*Ne*Math.sin(Ke*Math.PI),Ie.position.y+=Math.sin(Ke*Math.PI)*.3,Ie.scale.setScalar(.065*(1-Ke*.5))}}if(z.beam&&U.style==="turn_undead"){let _e=z.beam,ce=$e((V-z.releaseAt)/Math.max(1,z.impactAt-z.releaseAt),0,1);_e.visible=V>=z.releaseAt,_e.scale.set(1,Math.max(.01,z.span*ce),1),_e.position.copy(me).addScaledVector(le,z.span*ce/2)}if(z.sigil){let _e=z.sigil,ce=Math.max(0,V-z.releaseAt);_e.visible=V>=z.releaseAt;let Ie=_e.getObjectByName("turn-wave"),ve=_e.getObjectByName("turn-seal"),Ne=$e(ce/Math.max(1,z.impactAt-z.releaseAt+350),0,1);Ie.scale.setScalar(.3+Ne*(_e.userData.waveReach-.3)),ve.rotation.y=ce*.004}for(let _e of z.runes){let ce=he*.006+_e.userData.phase;_e.position.set(Math.cos(ce)*.45,.95+Ee*.5,Math.sin(ce)*.45),_e.rotation.y=ce}z.custom?.(V,{elapsedImpact:he,phase:Ee});let Fe=1-$e((Ee-.45)/.55,0,1);for(let{material:_e,opacity:ce}of z.fades)_e.opacity=ce*Fe;if($&&$.scale.setScalar(.8+Math.min(V/360,1)*.2),W.visible){let _e=U.style==="heal",ce=z.reduced?1:U.style==="life_drain"?1.35-Math.min(Ee*2.5,1)*.85:.6+Math.min(Ee*2.5,1)*.85;if(Se.scale.setScalar(ce),Le&&(Le.scale.setScalar(ce*.85),Le.position.y=z.reduced?.15:-.4+Ee*1.1),z.burstParticles.forEach(({item:ve,velocity:Ne},je)=>{ve.position.copy(Ne).multiplyScalar(z.reduced?.4:U.style==="life_drain"?.95-Ee*.85:.12+Ee*(_e?.65:.85)),_e&&(ve.position.y+=-.35+(z.reduced?0:Ee*.65)),ve.scale.setScalar((_e?.065:.075)*(1-Ee*.7)),_e?ve.scale.y*=2.4:ve.rotation.set(je,Ee*2,je*.7)}),et.position.y=Nu(z.lane)[1]+(z.reduced?0:Ee*.48),k){let Ne=2*k.position.distanceTo(J)*Math.tan(tn.degToRad(k.fov/2))/Math.max(1,H),je=Math.max(.64,Ne*38);et.scale.set(je*3,je,1)}z.textMaterial.opacity=Fe;let Ie=e.get(U.target_id);if(U.outcome!=="miss"&&he<250&&Ie&&Ie.data.x===U.target.x&&Ie.data.y===U.target.y)for(let ve of Ie.ownMaterials){let Ne=(1-he/250)*1.15;Ne>=ve.emissiveIntensity&&(ve.emissive.set(_e?"#5deba0":U.style==="turn_undead"?"#ffe27a":U.style==="life_drain"?"#7a4cc0":"#ff9a56"),ve.emissiveIntensity=Ne)}}}return r.length>0||o.length>0}function w(P){h!==P&&(h=P,p(),t())}function T(P){f=P,f&&p()}function M(){return{encounterId:l,revision:c,lastSeen:u,active:i.children.length,queued:o.length,activeEffects:i.children.map(P=>({...P.userData})),queuedIds:o.map(({event:P})=>P.id),reducedMotion:h}}function S(){d||(p(),d=!0,i.removeFromParent())}function F(P,k,H,z){if(d||f||document.hidden)return;let U=P.filter(m);U.slice(0,MM.has(U[0]?.style)?12:8).forEach((q,$)=>{o.push({event:q,lane:$%5,timing:H,origin:z,first:$===0,due:k,received:k})}),o.length>xa&&o.splice(0,o.length-xa),t()}return{ingest:y,play:F,tick:v,clear:p,setReducedMotion:w,setHidden:T,getState:M,dispose:S}}function hm(s,e,t){function n(g,_,p,m=s){let y=new qe;y.name=g,y.position.set(..._),m.add(y),s.updateWorldMatrix(!0,!0);for(let x of p)y.attach(x);return y}let i=t==="skeleton"?.92:.77,r=n("right-shoulder",[.2,i,0],e.right),o=n("left-shoulder",[-.2,i,0],e.left),a=n("blade-grip",t==="skeleton"?[.12,.8,-.23]:[.33,.66,-.055],e.blade),l=n("bow-grip",[-.36,t==="skeleton"?.83:.065,-.08],e.bow);r.attach(a),o.attach(l);let c=new Bt;c.name="head-anchor",c.position.set(0,1.12,-.1),s.add(c);let u=[r,o,a,l].map(g=>({object:g,rotation:g.rotation.clone(),position:g.position.clone()}));function d(){for(let g of u)g.object.rotation.copy(g.rotation),g.object.position.copy(g.position)}function h(g){a.visible=g==="slash"||t==="fighter"&&!g,l.visible=g==="arrow"||["goblin","skeleton"].includes(t)&&!g}h(null);function f(g,_){d(),h(g);let p=tn.clamp(_/280,0,1),m=tn.clamp((_-420)/380,0,1);if(g==="slash"){let y=tn.clamp((_-280)/140,0,1);r.rotation.x+=(.65*p-2.1*y)*(1-m),r.rotation.z+=(-.55*p+.85*y)*(1-m)}else if(g==="arrow"){let y=p*(1-m);o.rotation.y-=.85*y,o.rotation.x+=.55*y,r.rotation.x+=.8*y,r.rotation.y-=.8*y}else r.rotation.x-=.9*p*(1-m),o.rotation.z-=.35*p*(1-m)}return{right:r,left:o,head:c,blade:a,bow:l,isSkinned:!1,reset:d,equip:h,pose:f,walk(){},idle(){},hit(){},death(){return!1}}}var Uu=280,EM={slash:360,rotting_fist:380,heal:280,turn_undead:520,life_drain:460,dreadful_glare:480,sacred_flame:560},Gc=s=>EM[s]??730,um=s=>Math.max(820,Gc(s)+650);function Ou(s,e){if(e===ou)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===to||e===pa){let t=s.getIndex();if(t===null){let r=[],o=s.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);s.setIndex(r),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}let n=t.count-2,i=[];if(e===to)for(let r=1;r<=n;r++)i.push(t.getX(0)),i.push(t.getX(r)),i.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(i.push(t.getX(r)),i.push(t.getX(r+1)),i.push(t.getX(r+2))):(i.push(t.getX(r+2)),i.push(t.getX(r+1)),i.push(t.getX(r)));return i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),s.setIndex(i),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}function Vc(s){let e=new Map,t=new Map,n=s.clone();return dm(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;let r=i,o=e.get(i),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function dm(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)dm(s.children[n],e.children[n],t)}var oo=class extends wi{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Vu(t)}),this.register(function(t){return new Wu(t)}),this.register(function(t){return new Xu(t)}),this.register(function(t){return new ed(t)}),this.register(function(t){return new td(t)}),this.register(function(t){return new nd(t)}),this.register(function(t){return new Yu(t)}),this.register(function(t){return new Ku(t)}),this.register(function(t){return new Zu(t)}),this.register(function(t){return new $u(t)}),this.register(function(t){return new Gu(t)}),this.register(function(t){return new Ju(t)}),this.register(function(t){return new qu(t)}),this.register(function(t){return new Qu(t)}),this.register(function(t){return new ju(t)}),this.register(function(t){return new zu(t)}),this.register(function(t){return new Wc(t,At.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Wc(t,At.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new id(t)})}load(e,t,n,i){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let c=es.extractUrlBase(e);o=es.resolveURL(c,this.path)}else o=es.extractUrlBase(e);this.manager.itemStart(e);let a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Yr(this.manager);l.setPriority(this.priority),l.setCache(this.cache),l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r,o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===_m){try{o[At.KHR_BINARY_GLTF]=new sd(e)}catch(d){i&&i(d);return}r=JSON.parse(o[At.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let c=new ud(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){let d=this.pluginCallbacks[u](c);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[d.name]=d,o[d.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){let d=r.extensionsUsed[u],h=r.extensionsRequired||[];switch(d){case At.KHR_MATERIALS_UNLIT:o[d]=new Hu;break;case At.KHR_DRACO_MESH_COMPRESSION:o[d]=new rd(r,this.dracoLoader);break;case At.KHR_TEXTURE_TRANSFORM:o[d]=new od;break;case At.KHR_MESH_QUANTIZATION:o[d]=new ad;break;default:h.indexOf(d)>=0&&a[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){let n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}};function TM(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}function nn(s,e,t){let n=s.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var At={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},zu=class{constructor(e){this.parser=e,this.name=At.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,i=t.cache.get(n);if(i)return i;let r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],c,u=new nt(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],On);let d=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new ys(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Ai(u),c.distance=d;break;case"spot":c=new na(u),c.distance=d,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Li(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}},Hu=class{constructor(){this.name=At.KHR_MATERIALS_UNLIT}getMaterialType(){return dn}extendParams(e,t,n){let i=[];e.color=new nt(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],On),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Kt))}return Promise.all(i)}},Gu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Vu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(i.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new be(r,r)}return Promise.all(i)}},Wu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(i)}},Xu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_DISPERSION}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},qu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(i)}},Yu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_SHEEN}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];if(t.sheenColor=new nt(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],On)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Kt)),n.sheenRoughnessTexture!==void 0&&i.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(i)}},Ku=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&i.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(i)}},Zu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_VOLUME}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&i.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new nt().setRGB(r[0],r[1],r[2],On),Promise.all(i)}},$u=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_IOR}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Ju=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_SPECULAR}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new nt().setRGB(r[0],r[1],r[2],On),n.specularColorTexture!==void 0&&i.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Kt)),Promise.all(i)}},ju=class{constructor(e){this.parser=e,this.name=At.EXT_MATERIALS_BUMP}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&i.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(i)}},Qu=class{constructor(e){this.parser=e,this.name=At.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return nn(this.parser,e,this.name)!==null?kn:null}extendMaterialParams(e,t){let n=nn(this.parser,e,this.name);if(n===null)return Promise.resolve();let i=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&i.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(i)}},ed=class{constructor(e){this.parser=e,this.name=At.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;let r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},td=class{constructor(e){this.parser=e,this.name=At.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},nd=class{constructor(e){this.parser=e,this.name=At.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=i.images[o.source],l=n.textureLoader;if(a.uri){let c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}},Wc=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let l=i.byteOffset||0,c=i.byteLength||0,u=i.count,d=i.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,d,h,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(u*d);return o.decodeGltfBuffer(new Uint8Array(f),u,d,h,i.mode,i.filter),f})})}else return null}},id=class{constructor(e){this.name=At.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let i=t.meshes[n.mesh];for(let c of i.primitives)if(c.mode!==li.TRIANGLES&&c.mode!==li.TRIANGLE_STRIP&&c.mode!==li.TRIANGLE_FAN&&c.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],l={};for(let c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{let u=c.pop(),d=u.isGroup?u.children:[u],h=c[0].count,f=[];for(let g of d){let _=new dt,p=new D,m=new _n,y=new D(1,1,1),x=new Yi(g.geometry,g.material,h);for(let w=0;w<h;w++)l.TRANSLATION&&p.fromBufferAttribute(l.TRANSLATION,w),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,w),l.SCALE&&y.fromBufferAttribute(l.SCALE,w),x.setMatrixAt(w,_.compose(p,m,y));let v=null;for(let w in l)if(w==="_COLOR_0"){let T=l[w];x.instanceColor=new qi(T.array,T.itemSize,T.normalized)}else if(w!=="TRANSLATION"&&w!=="ROTATION"&&w!=="SCALE"){if(v===null){let M=x.geometry;v=new en,v.name=M.name;for(let S in M.attributes)v.setAttribute(S,M.attributes[S]);for(let S in M.morphAttributes)v.morphAttributes[S]=M.morphAttributes[S];M.index!==null&&v.setIndex(M.index),v.morphTargetsRelative=M.morphTargetsRelative;for(let S of M.groups)v.addGroup(S.start,S.count,S.materialIndex);M.boundingBox!==null&&(v.boundingBox=M.boundingBox.clone()),M.boundingSphere!==null&&(v.boundingSphere=M.boundingSphere.clone()),v.drawRange.start=M.drawRange.start,v.drawRange.count=M.drawRange.count,v.userData=Object.assign({},M.userData),x.geometry=v}let T=l[w];v.setAttribute(w,new qi(T.array,T.itemSize,T.normalized))}Bt.prototype.copy.call(x,g),this.parser.assignFinalMaterial(x),f.push(x)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}},_m="glTF",va=12,fm={JSON:1313821514,BIN:5130562},sd=class{constructor(e){this.name=At.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,va),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==_m)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let i=this.header.length-va,r=new DataView(e,va),o=0;for(;o<i;){let a=r.getUint32(o,!0);o+=4;let l=r.getUint32(o,!0);if(o+=4,l===fm.JSON){let c=new Uint8Array(e,va+o,a);this.content=n.decode(c)}else if(l===fm.BIN){let c=va+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},rd=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=At.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(let u in o){let d=cd[u]||u.toLowerCase();a[d]=o[u]}for(let u in e.attributes){let d=cd[u]||u.toLowerCase();if(o[u]!==void 0){let h=n.accessors[e.attributes[u]],f=ro[h.componentType];c[d]=f.name,l[d]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(d,h){i.decodeDracoFile(u,function(f){for(let g in f.attributes){let _=f.attributes[g],p=l[g];p!==void 0&&(_.normalized=p)}d(f)},a,c,On,h)})})}},od=class{constructor(){this.name=At.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),i=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*i,e.offset.x,-e.repeat.x*i,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},ad=class{constructor(){this.name=At.KHR_MESH_QUANTIZATION}},Xc=class extends Ti{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=i-t,d=(n-t)/u,h=d*d,f=h*d,g=e*c,_=g-c,p=-2*f+3*h,m=f-h,y=1-p,x=m-h+d;for(let v=0;v!==a;v++){let w=o[_+v+a],T=o[_+v+l]*u,M=o[g+v+a],S=o[g+v]*u;r[v]=y*w+x*T+p*M+m*S}return r}},wM=new _n,ld=class extends Xc{interpolate_(e,t,n,i){let r=super.interpolate_(e,t,n,i);return wM.fromArray(r).normalize().toArray(r),r}},li={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},ro={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},pm={9728:ln,9729:yn,9984:ql,9985:Qr,9986:er,9987:oi},mm={33071:ii,33648:Cr,10497:Jn},Fu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},cd={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ss={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},AM={CUBICSPLINE:void 0,LINEAR:Us,STEP:Ns},Bu={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function RM(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Ln({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Ri})),s.DefaultMaterial}function ir(s,e,t){for(let n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Li(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function CM(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,u=e.length;c<u;c++){let d=e[c];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(i=!0),d.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);let o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){let d=e[c];if(n){let h=d.POSITION!==void 0?t.getDependency("accessor",d.POSITION):s.attributes.position;o.push(h)}if(i){let h=d.NORMAL!==void 0?t.getDependency("accessor",d.NORMAL):s.attributes.normal;a.push(h)}if(r){let h=d.COLOR_0!==void 0?t.getDependency("accessor",d.COLOR_0):s.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){let u=c[0],d=c[1],h=c[2];return n&&(s.morphAttributes.position=u),i&&(s.morphAttributes.normal=d),r&&(s.morphAttributes.color=h),s.morphTargetsRelative=!0,s})}function PM(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function IM(s){let e,t=s.extensions&&s.extensions[At.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ku(t.attributes):e=s.indices+":"+ku(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+ku(s.targets[n]);return e}function ku(s){let e="",t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function hd(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function LM(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var DM=new dt,ud=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new TM,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?(this.textureLoader=new Qo(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new ia(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Yr(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return ir(r,a,i),Li(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(let l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){let o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){let o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let i=n.clone(),r=(o,a)=>{let l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(let[c,u]of o.children.entries())r(u,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let i=e(t[n]);if(i)return i}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let i=0;i<t.length;i++){let r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[At.KHR_BINARY_GLTF].body);let i=this.options;return new Promise(function(r,o){n.load(es.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){let t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){let o=Fu[i.type],a=ro[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new An(c,o,l))}let r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],l=Fu[i.type],c=ro[i.componentType],u=c.BYTES_PER_ELEMENT,d=u*l,h=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0,_,p;if(f&&f!==d){let m=Math.floor(h/f),y="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count,x=t.cache.get(y);x||(_=new c(a,m*f,i.count*f/u),x=new Fs(_,f/u),t.cache.add(y,x)),p=new ds(x,l,h%f/u,g)}else a===null?_=new c(i.count*l):_=new c(a,h,i.count*l),p=new An(_,l,g);if(i.sparse!==void 0){let m=Fu.SCALAR,y=ro[i.sparse.indices.componentType],x=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,w=new y(o[1],x,i.sparse.count*m),T=new c(o[2],v,i.sparse.count*l);a!==null&&(p=new An(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let M=0,S=w.length;M<S;M++){let F=w[M];if(p.setX(F,T[M*l]),l>=2&&p.setY(F,T[M*l+1]),l>=3&&p.setZ(F,T[M*l+2]),l>=4&&p.setW(F,T[M*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}p.normalized=g}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];let c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);let h=(r.samplers||{})[o.sampler]||{};return u.magFilter=pm[h.magFilter]||yn,u.minFilter=pm[h.minFilter]||oi,u.wrapS=mm[h.wrapS]||Jn,u.wrapT=mm[h.wrapT]||Jn,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==ln&&u.minFilter!==yn,i.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){let n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let o=i.images[e],a=self.URL||self.webkitURL,l=o.uri||"",c=!1,u;if(t.isKTX2Loader===!0&&o.bufferView!==void 0)u=n.getDependency("bufferView",o.bufferView).then(function(h){return new Promise(function(f,g){t.parse(h,f,g)})});else{if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(h){c=!0;let f=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(f),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");u=Promise.resolve(l).then(function(h){return new Promise(function(f,g){let _=f;t.isImageBitmapLoader===!0&&(_=function(p){let m=new cn(p);m.needsUpdate=!0,f(m)}),t.load(es.resolveURL(h,r.path),_,void 0,g)})})}let d=u.then(function(h){return c===!0&&a.revokeObjectURL(l),Li(h,o),h.userData.mimeType=o.mimeType||LM(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=d,d}assignTexture(e,t,n,i){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[At.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[At.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let l=r.associations.get(o);o=r.extensions[At.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new kr,Fn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,l=this.cache.get(a);l||(l=new Br,Fn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Ln}loadMaterial(e){let t=this,n=this.json,i=this.extensions,r=n.materials[e],o,a={},l=r.extensions||{},c=[];if(l[At.KHR_MATERIALS_UNLIT]){let d=i[At.KHR_MATERIALS_UNLIT];o=d.getMaterialType(),c.push(d.extendParams(a,r,t))}else{let d=r.pbrMetallicRoughness||{};if(a.color=new nt(1,1,1),a.opacity=1,Array.isArray(d.baseColorFactor)){let h=d.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],On),a.opacity=h[3]}d.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",d.baseColorTexture,Kt)),a.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,a.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",d.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",d.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Tn);let u=r.alphaMode||Bu.OPAQUE;if(u===Bu.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Bu.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==dn&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new be(1,1),r.normalTexture.scale!==void 0)){let d=r.normalTexture.scale;a.normalScale.set(d,d)}if(r.occlusionTexture!==void 0&&o!==dn&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==dn){let d=r.emissiveFactor;a.emissive=new nt().setRGB(d[0],d[1],d[2],On)}return r.emissiveTexture!==void 0&&o!==dn&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Kt)),Promise.all(c).then(function(){let d=new o(a);return r.name&&(d.name=r.name),Li(d,r),t.associations.set(d,{materials:e}),r.extensions&&ir(i,d,r),d})}createUniqueName(e){let t=Yt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[At.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return gm(l,a,t)})}let o=[];for(let a=0,l=e.length;a<l;a++){let c=e[a],u=IM(c),d=i[u];if(d)o.push(d.promise);else{let h;c.extensions&&c.extensions[At.KHR_DRACO_MESH_COMPRESSION]?h=r(c):h=gm(new en,c,t),c.mode===li.TRIANGLE_STRIP?h=h.then(f=>Ou(f,pa)):c.mode===li.TRIANGLE_FAN&&(h=h.then(f=>Ou(f,to))),i[u]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){let u=o[l].material===void 0?RM(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(l){let c=l.slice(0,l.length-1),u=l[l.length-1],d=[];for(let f=0,g=u.length;f<g;f++){let _=u[f],p=o[f],m,y=c[f];if(p.mode===li.TRIANGLES||p.mode===li.TRIANGLE_STRIP||p.mode===li.TRIANGLE_FAN||p.mode===void 0){let x=r.isSkinnedMesh===!0,v=_.hasAttribute("skinIndex")&&_.hasAttribute("skinWeight");x&&v===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=x&&v?new Uo(_,y):new Jt(_,y),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(p.mode===li.LINES)m=new Fo(_,y);else if(p.mode===li.LINE_STRIP)m=new ks(_,y);else if(p.mode===li.LINE_LOOP)m=new Bo(_,y);else if(p.mode===li.POINTS)m=new ko(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+p.mode);Object.keys(m.geometry.morphAttributes).length>0&&PM(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Li(m,r),p.extensions&&ir(i,m,p),t.assignFinalMaterial(m),d.push(m)}for(let f=0,g=d.length;f<g;f++)t.associations.set(d[f],{meshes:e,primitives:f});if(d.length===1)return r.extensions&&ir(i,d[0],r),d[0];let h=new qe;r.extensions&&ir(i,h,r),t.associations.set(h,{meshes:e});for(let f=0,g=d.length;f<g;f++)h.add(d[f]);return h})}loadCamera(e){let t,n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new gn(tn.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Ks(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Li(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){let r=i.pop(),o=i,a=[],l=[];for(let c=0,u=o.length;c<u;c++){let d=o[c];if(d){a.push(d);let h=new dt;r!==null&&h.fromArray(r.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Oo(a,l)})}loadAnimation(e){let t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let d=0,h=i.channels.length;d<h;d++){let f=i.channels[d],g=i.samplers[f.sampler],_=f.target,p=_.node,m=i.parameters!==void 0?i.parameters[g.input]:g.input,y=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",p)),a.push(this.getDependency("accessor",m)),l.push(this.getDependency("accessor",y)),c.push(g),u.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(d){let h=d[0],f=d[1],g=d[2],_=d[3],p=d[4],m=[];for(let x=0,v=h.length;x<v;x++){let w=h[x],T=f[x],M=g[x],S=_[x],F=p[x];if(w===void 0)continue;w.updateMatrix&&w.updateMatrix();let P=n._createAnimationTracks(w,T,M,S,F);if(P)for(let k=0;k<P.length;k++)m.push(P[k])}let y=new qs(r,void 0,m);return Li(y,i),y})}createNodeMesh(e){let t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){let t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));let l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){let u=c[0],d=c[1],h=c[2];h!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(h,DM)});for(let f=0,g=d.length;f<g;f++)u.add(d[f]);if(u.userData.pivot!==void 0&&d.length>0){let f=u.userData.pivot,g=d[0];u.pivot=new D().fromArray(f),u.position.x-=f[0],u.position.y-=f[1],u.position.z-=f[2],g.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){let t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(r.isBone===!0?u=new Or:c.length>1?u=new qe:c.length===1?u=c[0]:u=new Bt,u!==c[0])for(let d=0,h=c.length;d<h;d++)u.add(c[d]);if(r.name&&(u.userData.name=r.name,u.name=o),Li(u,r),r.extensions&&ir(n,u,r),r.matrix!==void 0){let d=new dt;d.fromArray(r.matrix),u.applyMatrix4(d)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!i.associations.has(u))i.associations.set(u,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){let d=i.associations.get(u);i.associations.set(u,{...d})}return i.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],i=this,r=new qe;n.name&&(r.name=i.createUniqueName(n.name)),Li(r,n),n.extensions&&ir(t,r,n);let o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,d=l.length;u<d;u++){let h=l[u];h.parent!==null?r.add(Vc(h)):r.add(h)}let c=u=>{let d=new Map;for(let[h,f]of i.associations)(h instanceof Fn||h instanceof cn)&&d.set(h,f);return u.traverse(h=>{let f=i.associations.get(h);f!=null&&d.set(h,f)}),d};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){let o=[],a=e.name?e.name:e.uuid,l=[];function c(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}Ss[r.path]===Ss.weights?(c(e),e.isGroup&&e.children.forEach(c)):l.push(a);let u;switch(Ss[r.path]){case Ss.weights:u=Ji;break;case Ss.rotation:u=ji;break;case Ss.translation:case Ss.scale:u=gs;break;default:n.itemSize===1?u=Ji:u=gs;break}let d=i.interpolation!==void 0?AM[i.interpolation]:Us,h=this._getArrayFromAccessor(n);for(let f=0,g=l.length;f<g;f++){let _=new u(l[f]+"."+Ss[r.path],t.array,h,d);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),o.push(_)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=hd(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let i=this instanceof ji?ld:Xc;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function NM(s,e,t){let n=e.attributes,i=new Qn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new D(l[0],l[1],l[2]),new D(c[0],c[1],c[2])),a.normalized){let u=hd(ro[a.componentType]);i.min.multiplyScalar(u),i.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new D,l=new D;for(let c=0,u=r.length;c<u;c++){let d=r[c];if(d.POSITION!==void 0){let h=t.json.accessors[d.POSITION],f=h.min,g=h.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),h.normalized){let _=hd(ro[h.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;let o=new Vn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function gm(s,e,t){let n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(let o in n){let a=cd[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){let o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return Tt.workingColorSpace!==On&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Tt.workingColorSpace}" not supported.`),Li(s,e),NM(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?CM(s,e.targets,t):s})}var UM=Object.freeze({"models/animated_armor.glb":"13dc51016a1f","models/chruna.glb":"347b288c695a","models/curogana.glb":"180adead51bb","models/elion.glb":"b60f30dc2841","models/ghast.glb":"6371391d8711","models/ghoul.glb":"16aa31da33b2","models/goblin.glb":"f73621e500a9","models/goblin_boss.glb":"5c70d30fc977","models/guy.glb":"9138b31a949e","models/ilyra.glb":"37695163ffe0","models/kobold_warrior.glb":"46cbf51bb710","models/mara.glb":"d88651957ab4","models/mummy.glb":"e5329cfb5594","models/shadow.glb":"2f42b2566caa","models/skeleton.glb":"6a5ab59b8437","models/specter.glb":"a65586d24bca","models/wight.glb":"b16ef52407a4","models/zombie.glb":"f658062129d1","props/brazier.glb":"d1119e0d4198","props/sarcophagus.glb":"983314fb98b3","textures/mausoleum/floor_albedo.webp":"1c6bceb4ea9f","textures/mausoleum/floor_normal.webp":"95326e9be847","textures/mausoleum/floor_orm.webp":"08f8dca1306c","textures/mausoleum/floor_slab_albedo.webp":"414f021986b0","textures/mausoleum/floor_slab_normal.webp":"0767504a141a","textures/mausoleum/floor_slab_orm.webp":"547acec34e68","textures/mausoleum/wall_albedo.webp":"a2b23f4f02ce","textures/mausoleum/wall_normal.webp":"c9bc3bae08fb","textures/mausoleum/wall_orm.webp":"2d0bfec395d4","textures/mausoleum/window_albedo.webp":"60e027194ed3"});function qc(s){let e=UM[s];return e?`${s}?v=${e}`:s}var sr=Object.freeze({mara:Object.freeze({file:"models/mara.glb",height:1.28,group:"hero",walkSpeed:.96,runSpeed:2.0211}),guy:Object.freeze({file:"models/guy.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),elion:Object.freeze({file:"models/elion.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),ilyra:Object.freeze({file:"models/ilyra.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),curogana:Object.freeze({file:"models/curogana.glb",height:1.27,group:"hero",walkSpeed:.9525,runSpeed:2.0053}),chruna:Object.freeze({file:"models/chruna.glb",height:1.3,group:"hero",walkSpeed:.975,runSpeed:2.0526}),skeleton:Object.freeze({file:"models/skeleton.glb",height:1.25,group:"undead"}),zombie:Object.freeze({file:"models/zombie.glb",height:1.25,group:"undead"}),ghoul:Object.freeze({file:"models/ghoul.glb",height:1.22,group:"undead"}),ghast:Object.freeze({file:"models/ghast.glb",height:1.36,group:"undead"}),shadow:Object.freeze({file:"models/shadow.glb",height:1.28,group:"undead",ghost:.84,glow:"#2e1952",glowIntensity:.36}),specter:Object.freeze({file:"models/specter.glb",height:1.32,group:"undead",ghost:.74,glow:"#8fc5ff",glowIntensity:.32}),wight:Object.freeze({file:"models/wight.glb",height:1.38,group:"undead",glow:"#1a332b",glowIntensity:.14}),mummy:Object.freeze({file:"models/mummy.glb",height:1.34,group:"undead"}),goblin:Object.freeze({file:"models/goblin.glb",height:.98,group:"monster"}),goblin_boss:Object.freeze({file:"models/goblin_boss.glb",height:1.08,group:"monster"}),animated_armor:Object.freeze({file:"models/animated_armor.glb",height:1.36,group:"monster"}),kobold_warrior:Object.freeze({file:"models/kobold_warrior.glb",height:.94,group:"monster"})}),xm=Object.freeze(Object.keys(sr)),ym=Object.freeze({goblin_minion:Object.freeze({scale:.9,tint:"#e6edcf"})});function OM(s){if(!s)return null;for(let e of[s.content,String(s.id||"").split("-")[0],s.kind]){let t=String(e||"").toLowerCase();if(Object.hasOwn(ym,t))return ym[t]}return null}var FM=Object.freeze(["skeleton","zombie","ghoul","ghast","shadow","specter","wight","mummy"]),Yc=5*1024*1024,BM=2e4;function rr(s){if(!s)return null;let e=String(s.base_id||"").toLowerCase(),t=String(s.id||"").split("-")[0].toLowerCase(),n=String(s.content||"").toLowerCase(),i=String(s.kind||"").toLowerCase(),r=o=>o.replace(/_l[1-3]$/,"");for(let o of[e,n,t,r(n),r(t),i])if(o){if(Object.hasOwn(sr,o))return o;if(o==="goblin_minion"||o==="goblin_warrior"||o==="vault_goblin")return"goblin";if(o==="vault_skeleton")return"skeleton"}if(s.team==="heroes"){let o=r(e||n||t);return Object.hasOwn(sr,o)?o:i==="mage"||s.model?.base==="mage"?o==="curogana"?"curogana":"ilyra":o==="guy"?"guy":o==="elion"?"elion":o==="chruna"?"chruna":"mara"}return i==="skeleton"?"skeleton":i==="goblin"?"goblin":null}function pd(s){if(!(s instanceof ArrayBuffer)||s.byteLength<20||s.byteLength>Yc)throw new Error("Model GLB size is invalid.");let e=new DataView(s);if(e.getUint32(0,!0)!==1179937895||e.getUint32(4,!0)!==2||e.getUint32(8,!0)!==s.byteLength)throw new Error("Model GLB header is invalid.");let t=12,n=null;for(;t<s.byteLength;){if(t+8>s.byteLength)throw new Error("Truncated GLB.");let i=e.getUint32(t,!0),r=e.getUint32(t+4,!0);if(i%4||t+8+i>s.byteLength)throw new Error("Truncated GLB chunk.");if(t===12){if(r!==1313821514)throw new Error("GLB must start with JSON.");n=JSON.parse(new TextDecoder().decode(new Uint8Array(s,t+8,i)))}else if(r!==5130562)throw new Error("Unsupported GLB chunk.");t+=i+8}if((function i(r){if(!(!r||typeof r!="object")){if(Object.hasOwn(r,"uri"))throw new Error("GLB must contain no external resource URIs.");Object.values(r).forEach(i)}})(n),n?.asset?.version!=="2.0")throw new Error("Unsupported glTF version.");return n}function vm(s){let e=new Set,t=new Set;s.traverse(n=>{n.geometry?.dispose(),n.skeleton&&t.add(n.skeleton);for(let i of Array.isArray(n.material)?n.material:n.material?[n.material]:[]){for(let r of Object.values(i))r?.isTexture&&e.add(r);i.dispose()}}),t.forEach(n=>n.dispose()),e.forEach(n=>{n.dispose(),n.source?.data?.close?.()})}var kM=new Set(["turn_undead","preserve_life","shatter","thunderwave","burning_hands","dragons_breath","acid_splash","dreadful_glare"]),zM=new Set(["slash","slam","rotting_fist","draining_swipe","claw","bite"]);function dd(s,e,t){for(let i of e){let r=s.getObjectByName(i);if(r)return r}let n=new Bt;return n.position.set(...t),s.add(n),n}function HM(s){let e=2166136261,t=String(s||"");for(let n=0;n<t.length;n++)e=Math.imul(e^t.charCodeAt(n),16777619);return(e>>>0)%1e3/1e3*6.283}function GM(s,e){let t=sr[e];if(!t)throw new Error(`Unknown cast key: ${e}`);let n=s.scene,i={};for(let c of s.animations||[]){i[c.name]=c;let u=c.name.toLowerCase();i[u]||(i[u]=c)}let r=0,o=!1,a=!1;function l(){o&&!r&&!a&&(a=!0,vm(n))}return{key:e,spec:t,clipNames:Object.keys(i),createInstance(c){if(o)return null;let u=Vc(n);u.name=`cast-${e}`,u.position.y+=.1,u.userData.castKey=e;let d=OM(c),h=d?.scale||1;h!==1&&u.scale.multiplyScalar(h);let f=d?.tint?new nt(d.tint):null,g=new Map,_=null,p=null;u.traverse(ce=>{if(delete ce.userData.unitId,ce.name==="Goblin_Blade"&&(_=ce),ce.name==="Goblin_Bow"&&(p=ce),!ce.isMesh)return;ce.userData.unitId=c.id,ce.castShadow=!0,ce.receiveShadow=!0;let Ie=ve=>{if(!g.has(ve)){let Ne=ve.clone();"emissiveMap"in Ne&&(Ne.emissiveMap=null),f&&Ne.color&&Ne.color.multiply(f),t.ghost&&(Ne.transparent=!0,Ne.opacity=t.ghost,Ne.depthWrite=!0),t.glow&&Ne.emissive?(Ne.emissive.set(t.glow),Ne.emissiveIntensity=t.glowIntensity||.3,Ne.userData.restEmissive={color:Ne.emissive.getHex(),intensity:Ne.emissiveIntensity}):Ne.emissive&&Ne.emissiveIntensity>0&&(Ne.userData.restEmissive={color:Ne.emissive.getHex(),intensity:Ne.emissiveIntensity}),Ne.needsUpdate=!0,g.set(ve,Ne)}return g.get(ve)};ce.material=Array.isArray(ce.material)?ce.material.map(Ie):Ie(ce.material)});let m=new qe;m.name="cast-motion",m.add(u);let y=new sa(u),x={};for(let[ce,Ie]of Object.entries(i)){let ve=y.clipAction(Ie);ve.setLoop(Pc,1),ve.clampWhenFinished=!0,x[ce]=ve}let v=dd(u,["WeaponR","Weapon.R","HandR","Hand.R","FistR","Fist.R"],[.22,t.height*.56,-.18]),w=dd(u,["HandL","Hand.L","FistL","Fist.L","LowerArmL"],[-.22,t.height*.56,-.18]),T=dd(u,["Head","Mummy_Head"],[0,t.height*.84,-.12]),M=HM(c.id),S=140,F=320,P=200,k=!1,H=null,z=0,U=null,q=0,$=0,W=0;function me(ce,Ie,{instant:ve=!1,clockMs:Ne=null}={}){if(k)return!1;let je=x[ce]?ce:"idle",Ke=x[je];if(!Ke)return!1;let st=Ne!==null?Ne:typeof performance<"u"?performance.now():Date.now(),gt=Ke.getClip().duration||1,Pt=Math.max(0,Math.min(gt-1e-4,Ie)),yt=st<W-1;!ve&&H&&H!==je&&x[H]?.isRunning()?(U&&U!==H&&x[U]&&x[U].stop(),U=H,q=z,$=st):ve||U&&(U===je||!x[U]?.isRunning())?(U&&U!==je&&x[U]&&x[U].stop(),U=null):yt&&U&&($=st),W=st;let zt=1;if(U&&x[U]){let rt=Math.max(0,Math.min(1,(st-$)/S));rt>=1?(x[U].stop(),U=null):zt=rt*rt*(3-2*rt)}for(let[rt,Ft]of Object.entries(x))rt!==je&&rt!==U&&Ft.isRunning()&&Ft.stop();if(U&&x[U]){let rt=x[U];rt.isRunning()||rt.reset().play(),rt.enabled=!0,rt.setEffectiveWeight(1-zt),rt.time=q}return Ke.isRunning()||Ke.reset().play(),Ke.enabled=!0,Ke.setEffectiveWeight(zt),Ke.time=Pt,H=je,z=Pt,y.update(0),u.updateMatrixWorld(!0),!0}function J(ce){if(_&&p){let Ie=ce==="arrow";p.visible=Ie,_.visible=!Ie}}J(null);function le(){k||(m.position.set(0,0,0),m.rotation.set(0,0,0),J(null),me("idle",0,{instant:!0}))}function Se(ce,Ie=!1){if(k)return;if(m.position.set(0,0,0),m.rotation.set(0,0,0),Ie&&x.guard){let Ke=x.guard.getClip().duration||.8;me("guard",Ke*.42,{clockMs:ce});return}let ve=x.idle;if(!ve)return;let Ne=Math.max(.2,ve.getClip().duration),je=(ce*85e-5+M)%Ne;me("idle",je,{clockMs:ce})}function Le(ce,Ie=!1){if(k)return;let ve=Ie&&x.run?"run":x.walk?"walk":"idle",Ne=x[ve];if(!Ne){m.position.y=.035*Math.abs(Math.sin(ce*.012));return}let je=Math.max(.2,Ne.getClip().duration),Ke=Ie?t.runSpeed:t.walkSpeed,gt=Ke?1/(Ie?P:F)/Ke:Ie?.0028:.0022,Pt=(ce*gt+M*.2)%je;me(ve,Pt,{clockMs:ce})}function et(ce,Ie){return ce==="arrow"&&x.arrow?"arrow":Ie==="dodge"||ce==="dodge"?x.guard?"guard":"idle":zM.has(ce)&&x.slash?"slash":ce==="necrotic"?x.slash?"slash":"cast":kM.has(ce)&&x.cast_area?"cast_area":x.cast?"cast":x.slash?"slash":"idle"}function V(ce=null){m.position.set(0,0,0),m.rotation.set(0,0,0),J(null),me("idle",0,{clockMs:ce})}function he(ce,Ie,ve=null){if(k)return;if(Ie<=0||Ie>=800){V(Ie);return}J(ce);let Ne=et(ce,ve),je=x[Ne];if(!je){let yt=Math.sin(Math.PI*Ie/800);m.position.z=-.14*yt,m.rotation.x=-.12*yt;return}let Ke=je.getClip().duration||.8,st=Ke*.35,gt=Ke*.56,Pt=Ie<=280?Ie/280*st:Ie<=420?st+(Ie-280)/140*(gt-st):gt+(Ie-420)/380*(Ke-gt);me(Ne,Pt,{clockMs:Ie})}function Ee(ce){if(!(k||ce<0)){if(ce>=380){V(ce);return}if(x.hit){let Ie=x.hit.getClip().duration||.5;me("hit",ce/380*Ie,{clockMs:ce})}else{let Ie=Math.sin(Math.PI*ce/380);m.position.z=.1*Ie,m.rotation.x=.16*Ie}}}function Fe(ce=9999){if(k||!x.death)return!1;m.position.set(0,0,0),m.rotation.set(0,0,0);let Ie=x.death.getClip().duration||1,ve=Math.min(Ie-.001,Math.max(0,ce/1e3));return me("death",ve,{clockMs:ce}),!0}let _e={right:v,left:w,head:T,blade:v,bow:w,model:u,motion:m,mixer:y,isSkinned:Object.keys(i).length>0,reset:le,equip:J,idle:Se,walk:Le,pose:he,hit:Ee,death:Fe,dispose(){k||(k=!0,y.stopAllAction(),y.uncacheRoot(u),u.traverse(ce=>{ce.skeleton&&ce.skeleton.dispose()}),g.forEach(ce=>ce.dispose()),m.removeFromParent(),r--,l())}};return r++,le(),{model:m,rig:_e,height:t.height*h+.1,ownMaterials:[...g.values()],castKey:e}},dispose(){o=!0,l()}}}async function VM(s,e,t){let n=await e(s,{signal:t,redirect:"error",credentials:"same-origin",cache:"force-cache"});if(!n.ok||n.redirected)throw new Error(`Model unavailable (${n.status}).`);if(Number(n.headers.get("content-length"))>Yc)throw new Error("Model exceeds byte limit.");let r=n.body?.getReader();if(!r){let u=await n.arrayBuffer();if(u.byteLength>Yc)throw new Error("Model exceeds byte limit.");return u}let o=[],a=0;try{for(;;){let{value:u,done:d}=await r.read();if(d)break;if(a+=u.byteLength,a>Yc)throw new Error("Model exceeds byte limit.");o.push(u)}}catch(u){throw await r.cancel().catch(()=>{}),u}let l=new Uint8Array(a),c=0;for(let u of o)l.set(u,c),c+=u.byteLength;return l.buffer}async function WM(s,e){pd(s);let t=new _s;t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i});let n=await new oo(t).parseAsync(s,"");try{return GM(n,e)}catch(i){throw vm(n.scene),i}}var Sa=new Map,Ma=new Map,is=new Map,ba=0,Kc=new Set,fd=new Set;function Mm(s){return fd.add(s),()=>fd.delete(s)}function md(){return Object.fromEntries(xm.map(s=>[s,is.get(s)?.status||"unprepared"]))}function gd(){return Object.fromEntries(FM.map(s=>[s,is.get(s)?.status||"unprepared"]))}function Zc(){let s=is.get("ilyra")||is.get("curogana");return{status:s?.status||"loaded",url:s?.url||null,error:s?.error||null,cast:md(),undead:gd()}}function bm(s){let e=rr(s);return e&&Sa.get(e)?.createInstance(s)||null}function Sm(s){let e=rr(s);return e?Sa.has(e):!1}function _d(s,{pageURL:e=globalThis.location?.href,fetcher:t=globalThis.fetch}={}){if(!Object.hasOwn(sr,s))return Promise.resolve("unknown");if(Ma.has(s))return Ma.get(s);let n;try{if(n=new URL("./"+qc(sr[s].file),new URL("./",e)),n.origin!==new URL(e).origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported model origin.")}catch(a){is.set(s,{status:"fallback",error:String(a.message)});let l=Promise.resolve("fallback");return Ma.set(s,l),l}let i=ba,r=new AbortController;Kc.add(r),is.set(s,{status:"loading",url:n.href,error:null});let o=(async()=>{let a=setTimeout(()=>r.abort(),BM);try{let l=await VM(n.href,t,r.signal),c=await WM(l,s);if(ba!==i||r.signal.aborted)return c.dispose(),"disposed";Sa.set(s,c),is.set(s,{status:"loaded",url:n.href,error:null});for(let u of[...fd])try{u(s)}catch{}return"loaded"}catch(l){return ba===i&&is.set(s,{status:"fallback",url:n.href,error:String(l.message)}),ba===i?"fallback":"disposed"}finally{clearTimeout(a),Kc.delete(r)}})();return Ma.set(s,o),o}async function Em(s={}){let e=s.keys?s.keys.filter(t=>Object.hasOwn(sr,t)):xm;return await Promise.all(e.map(t=>_d(t,s))),Zc()}function Tm(){ba++,Kc.forEach(s=>s.abort()),Kc.clear(),Sa.forEach(s=>s.dispose()),Sa=new Map,Ma=new Map,is=new Map}var wm=Object.freeze([{id:"ossuary",label:"Ancient Ossuary",preset:"bone_patrol",moteColor:"#d9d2be"},{id:"catacombs",label:"Mossy Ruin Court",preset:"ghoul_pack",moteColor:"#a8d48a"},{id:"caverns",label:"Frosted Soul Caverns",preset:"haunting",moteColor:"#7be8f2"},{id:"reliquary",label:"Gothic Reliquary",preset:"wights_retinue",moteColor:"#d8c49e"},{id:"sanctum",label:"Obsidian Sanctum",preset:"two_wights",moteColor:"#b98cff"},{id:"crucible",label:"Infernal Crucible",preset:"whole_crypt",moteColor:"#ff8538"},{id:"forged_hall",label:"Dwarven Forged Hall",preset:"vault",moteColor:"#f2be6b"},{id:"mausoleum",label:"Gothic Mausoleum",preset:null,moteColor:"#c48fff"},{id:"mausoleum_crypt",label:"Violet Ossuary",preset:null,moteColor:"#c9a6ff"},{id:"mausoleum_caves",label:"Violet Caverns",preset:null,moteColor:"#b98cff"}]),Am=Object.freeze({bone_patrol:"ossuary",ghoul_pack:"catacombs",haunting:"caverns",wights_retinue:"reliquary",two_wights:"sanctum",whole_crypt:"crucible",vault:"forged_hall"}),XM={vault:"forged_hall",caves:"caverns",pillars:"reliquary",rooms:"ossuary",open:"crucible"},Hn={ossuary:{id:"ossuary",bg:"#090d10",fog:"#090d10",slab:"#14181b",rim:"#786240",frame:"#1e2428",wallCap:"#565852",wallJoint:"#202321",pillarBody:"#62645c",pillarTrim:"#42453f",hemiSky:"#b8c4cf",hemiGround:"#343638",keyColor:"#ffd9a0",fillColor:"#5c7c99",torchColor:"#ff9c42",crystalColor:null,moteColor:"#ded6c1",floorRoughness:.88,floorMetalness:.04,bumpScale:.045},catacombs:{id:"catacombs",bg:"#080e0c",fog:"#080e0c",slab:"#111916",rim:"#526348",frame:"#1a2621",wallCap:"#455046",wallJoint:"#19221b",pillarBody:"#4d584d",pillarTrim:"#333d34",hemiSky:"#a8ccb8",hemiGround:"#29332b",keyColor:"#ffd296",fillColor:"#4c8577",torchColor:"#ff9638",crystalColor:null,moteColor:"#a8d98c",floorRoughness:.72,floorMetalness:.06,bumpScale:.055},caverns:{id:"caverns",bg:"#070e14",fog:"#070e14",slab:"#0f1a22",rim:"#486e78",frame:"#172630",wallCap:"#445863",wallJoint:"#18252e",pillarBody:"#495d69",pillarTrim:"#2f404a",hemiSky:"#a6dce8",hemiGround:"#273842",keyColor:"#cbe6ff",fillColor:"#3ec8d8",torchColor:"#6be4ff",crystalColor:"#56f0ff",moteColor:"#82f0ff",floorRoughness:.64,floorMetalness:.1,bumpScale:.052},reliquary:{id:"reliquary",bg:"#090b11",fog:"#090b11",slab:"#131620",rim:"#8f7244",frame:"#1d212e",wallCap:"#4d5261",wallJoint:"#1b1e29",pillarBody:"#555a6b",pillarTrim:"#7d653e",hemiSky:"#c6cee6",hemiGround:"#2f3240",keyColor:"#ffddab",fillColor:"#6682b8",torchColor:"#ffa247",crystalColor:null,moteColor:"#e6d2ab",floorRoughness:.44,floorMetalness:.16,bumpScale:.032},sanctum:{id:"sanctum",bg:"#090710",fog:"#090710",slab:"#13101d",rim:"#6f528f",frame:"#1d182b",wallCap:"#3e384f",wallJoint:"#161221",pillarBody:"#383347",pillarTrim:"#6c4f8c",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f5d0ff",fillColor:"#7e5ce0",torchColor:"#bf75ff",crystalColor:"#b366ff",moteColor:"#c48fff",floorRoughness:.48,floorMetalness:.2,bumpScale:.042,emissive:"#8f4dff",emissiveIntensity:.55},crucible:{id:"crucible",bg:"#0f0807",fog:"#0f0807",slab:"#1a1110",rim:"#99522c",frame:"#261816",wallCap:"#473936",wallJoint:"#1c1210",pillarBody:"#423533",pillarTrim:"#7d4427",hemiSky:"#e8c2ad",hemiGround:"#38231e",keyColor:"#ffbe7d",fillColor:"#bd4e2b",torchColor:"#ff6e24",crystalColor:"#ff5e1f",moteColor:"#ff8a3d",floorRoughness:.78,floorMetalness:.12,bumpScale:.055,emissive:"#ff5917",emissiveIntensity:.85},forged_hall:{id:"forged_hall",bg:"#0b0e10",fog:"#0b0e10",slab:"#161b1e",rim:"#8a693d",frame:"#22292d",wallCap:"#5c615d",wallJoint:"#222726",pillarBody:"#636964",pillarTrim:"#7d623b",hemiSky:"#d4cfc2",hemiGround:"#383834",keyColor:"#ffd89e",fillColor:"#5b8a96",torchColor:"#ff963b",crystalColor:null,moteColor:"#f0c475",floorRoughness:.8,floorMetalness:.08,bumpScale:.046}},yd=Object.freeze({ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"});Hn.mausoleum={...Hn.reliquary,id:"mausoleum",base:"reliquary",bg:"#0a0710",fog:"#0a0710",slab:"#14101c",rim:"#6f528f",frame:"#1d182b",hemiSky:"#cbb8eb",hemiGround:"#282136",keyColor:"#f0dcff",fillColor:"#7e5ce0",torchColor:"#bf75ff",moteColor:"#c48fff",flame:yd,veinColor:"rgba(196, 150, 255, 0.22)",inlay:"#6c5a8c",textures:{floor:{albedo:"textures/mausoleum/floor_albedo.webp",normal:"textures/mausoleum/floor_normal.webp",orm:"textures/mausoleum/floor_orm.webp"},floorAlt:{albedo:"textures/mausoleum/floor_slab_albedo.webp",normal:"textures/mausoleum/floor_slab_normal.webp",orm:"textures/mausoleum/floor_slab_orm.webp"},wall:{albedo:"textures/mausoleum/wall_albedo.webp",normal:"textures/mausoleum/wall_normal.webp",orm:"textures/mausoleum/wall_orm.webp"},window:"textures/mausoleum/window_albedo.webp"}};Hn.mausoleum_crypt={...Hn.ossuary,id:"mausoleum_crypt",base:"ossuary",bg:"#0a080e",fog:"#0a080e",rim:"#6a5a7e",hemiSky:"#c4b8dc",hemiGround:"#2c2834",fillColor:"#6e58b8",torchColor:"#b56dff",moteColor:"#c9a6ff",flame:yd};Hn.mausoleum_caves={...Hn.caverns,id:"mausoleum_caves",base:"caverns",bg:"#0a0712",fog:"#0a0712",slab:"#140f1e",rim:"#5e4a7a",frame:"#1b1528",wallCap:"#4a4258",wallJoint:"#1a1524",pillarBody:"#4d4560",pillarTrim:"#342c44",hemiSky:"#c7b6e8",hemiGround:"#2a2238",keyColor:"#e4d2ff",fillColor:"#8a5ee0",torchColor:"#b870ff",crystalColor:"#b366ff",moteColor:"#b98cff",flame:yd,veinColor:"rgba(196, 150, 255, 0.45)"};function Rm(s,e){if(e&&e!=="auto"){let n=XM[e]||e;if(Hn[n])return Hn[n]}if(s?.theme&&Hn[s.theme])return Hn[s.theme];let t=String(s?.family||s?.name||"").toLowerCase();return t.includes("cave")?Hn.caverns:t.includes("pillar")||t.includes("hall")?Hn.reliquary:t.includes("room")?Hn.ossuary:t.includes("open")?Hn.crucible:Hn.forged_hall}function fn(s,e,t=1){let n=Math.imul(s*374761393+e*668265263+t*1442695041,1274126177);return n=(n^n>>>13)>>>0,n%1e4/1e4}function Es(s,e,t,n,i){let r=document.createElement("canvas");r.width=t,r.height=t,i(r.getContext("2d"),t);let o=new Ki(r);return n&&(o.colorSpace=Kt),o.wrapS=Jn,o.wrapT=Jn,o.anisotropy=Math.min(8,s.capabilities.getMaxAnisotropy()),e.add(o),o}function ss(s,e,t=.14,n=.08,i=1800){for(let r=0;r<i;r++){let o=Math.floor(fn(r,1,7)*e),a=Math.floor(fn(r,2,13)*e),l=1+r%3,c=1+(r>>1)%3;s.fillStyle=r%2===0?`rgba(0,0,0,${t})`:`rgba(255,255,255,${n})`,s.fillRect(o,a,l,c)}}function ci(s,e,t,n,i=1.6){s.strokeStyle=n,s.lineWidth=i,s.lineCap="round";for(let r=0;r<t;r++){let o=fn(r,10,31)*e*.8+e*.1,a=fn(r,20,37)*e*.8+e*.1;s.beginPath(),s.moveTo(o,a);for(let l=0;l<5;l++)o+=(fn(r*7+l,3,41)-.5)*(e*.18),a+=(fn(r*7+l,9,43)-.5)*(e*.18),s.lineTo(o,a);s.stroke()}}function Cm(s,e,t,n){let i=`pbr-floor:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=null,l=Es(e,t,o,!0,h=>{if(h.fillStyle="#1b1e20",h.fillRect(0,0,o,o),r==="ossuary"){h.fillStyle="#5c5a52",h.fillRect(8,8,o-16,o-16);let f=88;h.fillStyle="#252624";for(let[_,p]of[[0,0],[o,0],[0,o],[o,o],[o/2,o/2]])h.beginPath(),h.moveTo(_,p-f),h.lineTo(_+f,p),h.lineTo(_,p+f),h.lineTo(_-f,p),h.closePath(),h.fill(),h.strokeStyle="#191a18",h.lineWidth=6,h.stroke();let g=h.createRadialGradient(o/2,o/2,40,o/2,o/2,o*.68);g.addColorStop(0,"rgba(138,132,118,0.22)"),g.addColorStop(1,"rgba(20,22,20,0.42)"),h.fillStyle=g,h.fillRect(0,0,o,o),ss(h,o,.16,.09,2400),ci(h,o,5,"rgba(22,22,20,0.65)",2.2),h.strokeStyle="#1c1d1b",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else if(r==="catacombs"){h.fillStyle="#263324",h.fillRect(0,0,o,o);let f=3,g=o/f;for(let _=0;_<f;_++)for(let p=0;p<f;p++){let m=(p+.5)*g+(fn(p,_,3)-.5)*22,y=(_+.5)*g+(fn(p,_,5)-.5)*22,x=g*(.39+fn(p,_,7)*.08),v=g*(.38+fn(p,_,11)*.08),w=62+Math.floor(fn(p,_,17)*24);h.fillStyle=`rgb(${w},${w+5},${w-2})`,h.beginPath();for(let T=0;T<8;T++){let M=T/8*Math.PI*2,S=.88+fn(p*8+T,_,19)*.2,F=m+Math.cos(M)*x*S,P=y+Math.sin(M)*v*S;T===0?h.moveTo(F,P):h.lineTo(F,P)}h.closePath(),h.fill(),h.strokeStyle="rgba(20,28,18,0.85)",h.lineWidth=5,h.stroke()}for(let _=0;_<48;_++){let p=fn(_,4,29)*o,m=fn(_,8,31)*o,y=8+fn(_,2,37)*24,x=h.createRadialGradient(p,m,2,p,m,y);x.addColorStop(0,"rgba(62, 92, 46, 0.55)"),x.addColorStop(1,"rgba(42, 66, 34, 0)"),h.fillStyle=x,h.beginPath(),h.arc(p,m,y,0,Math.PI*2),h.fill()}ss(h,o,.18,.07,2200)}else if(r==="caverns"){h.fillStyle="#33434d",h.fillRect(0,0,o,o);for(let f=-o;f<o*2;f+=28)h.fillStyle=f%56===0?"rgba(20,30,38,0.36)":"rgba(130,175,196,0.10)",h.beginPath(),h.moveTo(f,0),h.lineTo(f+18,0),h.lineTo(f-o*.55+18,o),h.lineTo(f-o*.55,o),h.closePath(),h.fill();ss(h,o,.16,.08,2e3),ci(h,o,7,s.veinColor||"rgba(165, 232, 248, 0.48)",2),ci(h,o,5,"rgba(12, 20, 26, 0.72)",3),h.strokeStyle="rgba(18, 28, 36, 0.85)",h.lineWidth=8,h.strokeRect(3,3,o-6,o-6)}else if(r==="reliquary")h.fillStyle="#252833",h.fillRect(0,0,o,o),ci(h,o,9,"rgba(195, 202, 222, 0.22)",2.4),ci(h,o,6,s.veinColor||"rgba(214, 174, 108, 0.20)",1.5),h.strokeStyle=s.inlay||"#8c6e42",h.lineWidth=5,h.strokeRect(18,18,o-36,o-36),h.strokeStyle="#59462b",h.lineWidth=2,h.strokeRect(28,28,o-56,o-56),ss(h,o,.1,.05,1200),h.strokeStyle="#12141c",h.lineWidth=9,h.strokeRect(4,4,o-8,o-8);else if(r==="sanctum"){h.fillStyle="#1e1929",h.fillRect(0,0,o,o);let f=96,g=[[o*.25,o*.25],[o*.75,o*.25],[o*.5,o*.5],[o*.25,o*.75],[o*.75,o*.75]];for(let[_,p]of g){h.fillStyle="#2a2438",h.beginPath();for(let m=0;m<6;m++){let y=m/6*Math.PI*2+Math.PI/6,x=_+Math.cos(y)*f,v=p+Math.sin(y)*f;m===0?h.moveTo(x,v):h.lineTo(x,v)}h.closePath(),h.fill(),h.strokeStyle="#6f4ca8",h.lineWidth=3.5,h.stroke()}ss(h,o,.15,.06,1600),h.strokeStyle="#120e1a",h.lineWidth=8,h.strokeRect(4,4,o-8,o-8)}else if(r==="crucible"){h.fillStyle="#2b2220",h.fillRect(0,0,o,o);let f=h.createRadialGradient(o/2,o/2,30,o/2,o/2,o*.65);f.addColorStop(0,"rgba(68,52,48,0.35)"),f.addColorStop(1,"rgba(18,12,10,0.65)"),h.fillStyle=f,h.fillRect(0,0,o,o),ss(h,o,.22,.06,2600),ci(h,o,6,"rgba(255, 102, 28, 0.78)",3.2),ci(h,o,6,"rgba(255, 206, 112, 0.55)",1.3),h.strokeStyle="#170f0d",h.lineWidth=10,h.strokeRect(4,4,o-8,o-8)}else{h.fillStyle="#4e5452",h.fillRect(0,0,o,o),h.strokeStyle="#232726",h.lineWidth=7,h.strokeRect(5,5,o-10,o-10),h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.moveTo(o*.25,o/2),h.lineTo(o*.25,o),h.moveTo(o*.75,o/2),h.lineTo(o*.75,o),h.stroke(),h.fillStyle="#7c633e";for(let[f,g]of[[24,24],[o-24,24],[24,o-24],[o-24,o-24]])h.beginPath(),h.arc(f,g,7,0,Math.PI*2),h.fill();ss(h,o,.16,.08,2200),ci(h,o,3,"rgba(24,28,27,0.55)",1.8)}}),c=Es(e,t,o,!1,h=>{if(h.fillStyle="#d8d8d8",h.fillRect(0,0,o,o),h.strokeStyle="#181818",h.lineWidth=14,h.strokeRect(5,5,o-10,o-10),r==="catacombs"){let f=o/3;h.lineWidth=10;for(let g=1;g<3;g++)h.beginPath(),h.moveTo(g*f,0),h.lineTo(g*f,o),h.stroke(),h.beginPath(),h.moveTo(0,g*f),h.lineTo(o,g*f),h.stroke()}else r==="forged_hall"&&(h.lineWidth=9,h.beginPath(),h.moveTo(0,o/2),h.lineTo(o,o/2),h.moveTo(o/2,0),h.lineTo(o/2,o/2),h.stroke());ss(h,o,.22,.18,2600),ci(h,o,6,"#141414",3)}),u=Es(e,t,o,!1,h=>{let f=Math.round(s.floorRoughness*255);h.fillStyle=`rgb(${f},${f},${f})`,h.fillRect(0,0,o,o);for(let g=0;g<24;g++){let _=fn(g,5,61)*o,p=fn(g,9,67)*o,m=24+fn(g,3,71)*56,y=h.createRadialGradient(_,p,4,_,p,m),x=r==="catacombs"||r==="caverns"||r==="reliquary";y.addColorStop(0,x?"rgba(45,45,45,0.65)":"rgba(240,240,240,0.35)"),y.addColorStop(1,"rgba(128,128,128,0)"),h.fillStyle=y,h.beginPath(),h.arc(_,p,m,0,Math.PI*2),h.fill()}});s.emissive&&(a=Es(e,t,o,!0,h=>{h.fillStyle="#000000",h.fillRect(0,0,o,o),r==="crucible"?(ci(h,o,6,"#ff6a1a",3.4),ci(h,o,6,"#ffd27d",1.2)):r==="sanctum"&&(h.strokeStyle="#9d5cff",h.lineWidth=2.6,h.strokeRect(22,22,o-44,o-44),ci(h,o,4,"#8b47ff",2))}));let d=new Ln({map:l,bumpMap:c,bumpScale:s.bumpScale,roughnessMap:u,roughness:1,metalness:s.floorMetalness,...a?{emissive:new nt("#ffffff"),emissiveMap:a,emissiveIntensity:s.emissiveIntensity}:{}});return n.set(i,d),d}function Pm(s,e,t,n){let i=`pbr-wall:${s.id}`,r=s.base||s.id;if(n.has(i))return n.get(i);let o=512,a=(d,h)=>{if(r==="caverns"){d.fillStyle=h?"#9e9e9e":"#32414a",d.fillRect(0,0,o,o);for(let f=0;f<o;f+=34){d.strokeStyle=h?"#202020":"#18232b",d.lineWidth=h?7:5,d.beginPath(),d.moveTo(0,f);for(let g=0;g<=o;g+=48)d.lineTo(g,f+(fn(g,f,83)-.5)*20);d.stroke()}}else if(r==="reliquary"){d.fillStyle=h?"#c8c8c8":"#3a3f4d",d.fillRect(0,0,o,o);for(let f=32;f<o;f+=64)d.fillStyle=h?"#505050":"#282c38",d.fillRect(f-10,36,20,o-72);h||(d.fillStyle="#755c38",d.fillRect(0,24,o,10),d.fillRect(0,o-34,o,10))}else{let f={ossuary:"#4d4c45",catacombs:"#3b453b",sanctum:"#282336",crucible:"#332624",forged_hall:"#454a48"};d.fillStyle=h?"#cccccc":f[r]||"#454a48",d.fillRect(0,0,o,o);let g=r==="sanctum"?3:5,_=o/g;for(let p=0;p<g;p++){let m=p*_,y=p%2*(o/4);if(!h)for(let x=0;x<4;x++){let v=(y+x*(o/2))%o,w=(fn(x,p,97)-.5)*18;d.fillStyle=w>0?`rgba(255,255,255,${w/255})`:`rgba(0,0,0,${-w/255})`,d.fillRect(v,m+3,o/2-4,_-6)}d.strokeStyle=h?"#1a1a1a":r==="crucible"?"#5e2414":"#1b1e1d",d.lineWidth=h?9:6,d.beginPath(),d.moveTo(0,m),d.lineTo(o,m),d.stroke();for(let x of[y+o*.25,y+o*.75]){let v=x%o;d.beginPath(),d.moveTo(v,m),d.lineTo(v,m+_),d.stroke()}}if(!h&&r==="catacombs"){let p=d.createLinearGradient(0,o,0,o*.45);p.addColorStop(0,"rgba(38, 66, 32, 0.72)"),p.addColorStop(1,"rgba(38, 66, 32, 0)"),d.fillStyle=p,d.fillRect(0,o*.45,o,o*.55)}}if(ss(d,o,.18,.08,2e3),!h){let f=d.createLinearGradient(0,o,0,o*.78);f.addColorStop(0,"rgba(0,0,0,0.48)"),f.addColorStop(1,"rgba(0,0,0,0)"),d.fillStyle=f,d.fillRect(0,o*.78,o,o*.22)}},l=Es(e,t,o,!0,d=>a(d,!1)),c=Es(e,t,o,!1,d=>a(d,!0)),u=new Ln({map:l,bumpMap:c,bumpScale:.05,roughness:.84,metalness:.06});return n.set(i,u),u}function Im(s,e){let n=Es(s,e,256,!0,r=>{r.fillStyle="#5c402b",r.fillRect(0,0,256,256);for(let o=0;o<110;o++){let a=o*29%256;r.strokeStyle=o%3===0?"rgba(22,13,8,0.45)":"rgba(130,94,62,0.25)",r.lineWidth=1+o%3,r.beginPath(),r.moveTo(0,a),r.bezierCurveTo(76.8,a+6,179.2,a-7,256,a+1),r.stroke()}r.strokeStyle="rgba(14,8,5,0.68)",r.lineWidth=3;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke()}),i=Es(s,e,256,!1,r=>{r.fillStyle="#c4c4c4",r.fillRect(0,0,256,256),r.strokeStyle="#222222",r.lineWidth=4;for(let o of[64,128,192])r.beginPath(),r.moveTo(0,o),r.lineTo(256,o),r.stroke();for(let o=0;o<90;o++){let a=o*31%256;r.strokeStyle="#777777",r.lineWidth=1.2,r.beginPath(),r.moveTo(0,a),r.lineTo(256,a+2),r.stroke()}});return{map:n,bump:i}}var qM=2*1024*1024,YM=3*1024*1024,KM=15e3,xd=new Map,vd=new Map;function ZM(s,e=globalThis.location?.href){let t=new URL("./",e),n=new URL(s,t);if(n.origin!==t.origin||!["http:","https:"].includes(n.protocol))throw new Error("Unsupported asset origin.");return n.href}async function Lm(s,e,t){let n=new AbortController,i=setTimeout(()=>n.abort(),KM);try{let r=await fetch(ZM(qc(s)),{signal:n.signal,redirect:"error",credentials:"same-origin",cache:"default"});if(!r.ok||r.redirected)throw new Error(`asset ${r.status}`);let o=String(r.headers.get("content-type")||"").split(";")[0].trim();if(t&&!t.includes(o))throw new Error(`asset type ${o}`);if(Number(r.headers.get("content-length"))>e)throw new Error("asset too large");let l=await r.arrayBuffer();if(l.byteLength>e)throw new Error("asset too large");return{buffer:l,type:o}}finally{clearTimeout(i)}}function $M(s){return xd.has(s)||xd.set(s,(async()=>{try{let{buffer:e,type:t}=await Lm(s,qM,["image/webp","image/png"]);return await createImageBitmap(new Blob([e],{type:t}),{imageOrientation:"flipY"})}catch{return null}})()),xd.get(s)}async function Ea(s,{srgb:e=!1,repeat:t=!0,anisotropy:n=4}={}){let i=await $M(s);if(!i)return null;let r=new cn(i);return r.flipY=!1,e&&(r.colorSpace=Kt),t&&(r.wrapS=r.wrapT=Jn),r.anisotropy=n,r.needsUpdate=!0,r}async function $c(s,e,t,{anisotropy:n=4}={}){if(!e||!s)return!1;let[i,r,o]=await Promise.all([Ea(e.albedo,{srgb:!0,anisotropy:n}),e.normal?Ea(e.normal,{anisotropy:n}):null,e.orm?Ea(e.orm,{anisotropy:n}):null]);if(!i)return[r,o].forEach(a=>a?.dispose()),!1;for(let a of[i,r,o])a&&t(a);return s.map=i,s.color?.set?.("#ffffff"),r&&(s.normalMap=r,s.normalScale=new be(.9,.9),s.bumpMap=null),o&&(s.aoMap=o,s.aoMapIntensity=.85,s.roughnessMap=o,s.metalnessMap=o,s.roughness=1,s.metalness=1),s.emissiveMap=null,s.needsUpdate=!0,!0}function Dm(s){return vd.has(s)||vd.set(s,(async()=>{try{let{buffer:e}=await Lm(s,YM,["model/gltf-binary","application/octet-stream"]);pd(e);let t=new _s;return t.setURLModifier(i=>{if(!i.startsWith("blob:"))throw new Error("External model resource rejected.");return i}),(await new oo(t).parseAsync(e,"")).scene}catch{return null}})()),vd.get(s)}function JM(s,e,t){let n=(e-s+Math.PI)%(Math.PI*2)-Math.PI;return n<-Math.PI&&(n+=Math.PI*2),s+n*t}function jM(s){try{let e=s.getExtension("WEBGL_debug_renderer_info"),t=String(e?s.getParameter(e.UNMASKED_RENDERER_WEBGL):s.getParameter(s.RENDERER));return/swiftshader|llvmpipe|software|softpipe|basic render/i.test(t)?"low":"high"}catch{return"high"}}var QM=1e3/30;function eb({container:s,onCell:e,onHover:t,onCameraChange:n,onReady:i,onUnavailable:r,idleAnimation:o=!1}={}){if(!s)throw new Error("A tabletop container is required.");let a=document.createElement("canvas");a.dataset.emberScene="webgl",a.dataset.renderer="webgl",a.setAttribute("aria-label","3D tabletop. Drag to orbit, pinch or scroll to zoom.");let l,c=a.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"});if(!c)throw r?.("WebGL 2 is unavailable on this device."),new Error("WebGL 2 is unavailable on this device.");try{l=new Fc({canvas:a,context:c,antialias:!0})}catch(b){throw r?.("The 3D tabletop could not initialize."),b}let u=jM(c),d=u==="low"?1:2;l.setPixelRatio(Math.min(window.devicePixelRatio||1,d)),l.outputColorSpace=Kt,l.toneMapping=aa,l.toneMappingExposure=1.26,l.shadowMap.enabled=!0,l.shadowMap.type=Zs,l.shadowMap.autoUpdate=!1,l.shadowMap.needsUpdate=!0,s.appendChild(a),s.dataset.renderer="webgl";let h=new Lo;h.background=new nt("#111a1f"),h.fog=new Io("#111a1f",29,76);let f=new gn(38,1,.1,140),g=new Hc(f,a);g.enableDamping=!1,g.minPolarAngle=.04,g.maxPolarAngle=1.46,g.minDistance=2.1,g.maxDistance=42,g.screenSpacePanning=!1,g.panSpeed=.72,g.rotateSpeed=.72,g.zoomSpeed=.9;let _=window.matchMedia?.("(prefers-reduced-motion: reduce)"),p=!!_?.matches,m=!!o&&!p,y="smart",x=null,v=new qe,w=new qe,T=new qe,M=new qe,S=new qe,F=new qe;h.add(v,w,M,S,F,T);let P=new dn({visible:!1}),k=new ea("#dcefeb","#59616b",2.15);h.add(k);let H=new ys("#ffe0ad",3.45);H.position.set(-5,13,7),H.castShadow=!0,H.shadow.mapSize.set(u==="low"?1024:2048,u==="low"?1024:2048),Object.assign(H.shadow.camera,{left:-12,right:12,top:11,bottom:-11,near:.5,far:55}),H.shadow.normalBias=.03,H.shadow.bias=-2e-4,h.add(H,H.target);let z=new ys("#62b8c9",1.35);z.position.set(8,5,-6),h.add(z);let U=new Map,q=new Map,$=new Set,W=new Map,me=[],J=[],le=[],Se="forged_hall",Le=null,et="",V=10,he=8,Ee=!1,Fe=!1,_e=0,ce=!1,Ie=!1,ve=null,Ne=new Set,je=new ra,Ke=new be,st=new Un(new D(0,1,0),-.025),gt=new D,Pt=new D,yt=new Bt,zt=cm({scene:h,units:W,requestRender:xt,reducedMotion:p}),rt=null,Ft=null,sn=!1,rn=new D(.54,.92,1.13).normalize(),X=!1,ft=null,It="",Ut=[];function Me(b,C){return U.has(b)||U.set(b,C()),U.get(b)}let Re=Me("box",()=>new bi(1,1,1)),Ve=Me("sphere",()=>new Ws(1,2)),ke=Me("cone",()=>new zs(1,1,12)),L=Me("cylinder",()=>new Si(1,1,1,16)),E=Me("robe",()=>new Si(.56,1,1,12)),Q=Me("ring",()=>new Bn(.37,.425,48)),we=Me("active-ring",()=>new Bn(.435,.495,48)),ye=Me("plane",()=>new Xs(1,1));function de(b,C=0,I=.8){let A=`${b}:${C}:${I}`;return q.has(A)||q.set(A,new Ln({color:b,metalness:C,roughness:I,flatShading:!1})),q.get(A)}function re(b,C=1){let I=`glow:${b}:${C}`;return q.has(I)||q.set(I,new dn({color:b,transparent:C<1,opacity:C,depthWrite:C===1,side:Tn})),q.get(I)}function N(b,C,I,A,O,Y,te=1,ne=te,ue=te){let ae=new Jt(C,I);return ae.position.set(A,O,Y),ae.scale.set(te,ne,ue),ae.castShadow=!0,ae.receiveShadow=!0,b.add(ae),ae}function fe(b,C,I,A){let O=N(b,C,I,0,A,0);return O.rotation.x=-Math.PI/2,O.castShadow=!1,O}function Ce(b,C=256,I=256){let A=document.createElement("canvas");A.width=C,A.height=I,b(A.getContext("2d"),C,I);let O=new Ki(A);return O.colorSpace=Kt,O.anisotropy=Math.min(8,l.capabilities.getMaxAnisotropy()),$.add(O),O}let B=Ce((b,C,I)=>{let A=b.createRadialGradient(C/2,I/2,6,C/2,I/2,C/2);A.addColorStop(0,"rgba(0,0,0,.74)"),A.addColorStop(1,"rgba(0,0,0,0)"),b.fillStyle=A,b.fillRect(0,0,C,I)},64,64),xe=new dn({map:B,transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-1});q.set("contact",xe);function K(b){b.traverse(C=>{C.isInstancedMesh&&C.dispose()}),b.clear()}function oe(b,C,I,A,O=.025){let Y=new D(...I),te=new D(...A),ne=te.clone().sub(Y),ue=N(b,L,C,...Y.clone().add(te).multiplyScalar(.5).toArray(),O,ne.length(),O);return ue.quaternion.setFromUnitVectors(new D(0,1,0),ne.normalize()),ue}let ge=Im(l,$);function Te(b){let C=`wood:${b}`;return q.has(C)||q.set(C,new Ln({color:b,map:ge.map,bumpMap:ge.bump,bumpScale:.036,roughness:.84,metalness:.04})),q.get(C)}function We(b,C,I,A,O,Y,te,ne){let ue=de(ne,.06,.76),ae=de("#cfc09b",0,.9);N(b,Re,ae,C,I,A,O*.8,Y*.89,te*.92);for(let pe of[-1,1])N(b,Re,ue,C+pe*O*.46,I,A,O*.09,Y,te);N(b,Re,ue,C,I,A-te*.48,O,Y,te*.08)}function ot(b,C,I,A){N(b,L,de("#8f6f40",.78,.36),C,I+.014,A,.105,.028,.105),N(b,L,de("#ddd0ae",0,.65),C,I+.11,A,.047,.18,.047);let O=N(b,ke,re("#ffc15d"),C,I+.248,A,.035,.12,.035);O.rotation.z=-.13,me.push({flame:O,baseY:I+.248,baseScaleY:.12,phase:C*3.1+A*1.7})}function Ae(b,C,I,A){N(b,L,de("#535f63",.68,.42),C,I+.07,A,.065,.14,.065),N(b,L,de("#3b2618",.05,.35),C,I+.142,A,.052,.005,.052);let O=Me("mug-handle",()=>new Ct(.047,.014,6,12));N(b,O,de("#748287",.72,.38),C+.078,I+.075,A)}function Qe(b){let C=`rug:${b}`;if(!q.has(C)){let I=Ce((A,O,Y)=>{A.fillStyle=b?"#1d3b42":"#572226",A.fillRect(0,0,O,Y);for(let ne=0;ne<Y;ne+=3)A.fillStyle=ne%6===0?"rgba(0,0,0,0.18)":"rgba(255,255,255,0.04)",A.fillRect(0,ne,O,1);A.strokeStyle="#9e7d47",A.lineWidth=5,A.strokeRect(14,14,O-28,Y-28),A.strokeStyle=b?"#55786f":"#8c5442",A.lineWidth=9,A.strokeRect(27,27,O-54,Y-54);for(let ne of[74,49,22])A.fillStyle=ne===49?b?"#6b3b30":"#24464a":"#9c7c49",A.beginPath(),A.moveTo(O/2,Y/2-ne),A.lineTo(O/2+ne*.65,Y/2),A.lineTo(O/2,Y/2+ne),A.lineTo(O/2-ne*.65,Y/2),A.closePath(),A.fill();let te=A.createRadialGradient(O/2,Y/2,30,O/2,Y/2,O*.68);te.addColorStop(0,"rgba(0,0,0,0)"),te.addColorStop(1,"rgba(0,0,0,0.38)"),A.fillStyle=te,A.fillRect(0,0,O,Y)});q.set(C,new Ln({map:I,roughness:.96,side:Tn}))}return q.get(C)}function _t(b,C){let I=Number(C.width)||1,A=Number(C.depth)||1,O=Te("#6e503a"),Y=Te("#916c4f"),te=Te("#4d3525"),ne=de("#2b3236",.78,.38),ue=de("#8f6f40",.8,.34),ae=Math.max(.2,Math.min(2.1,Number(C.height)||.8));if(C.kind==="rug"){let pe=N(b,ye,Qe((C.x+C.y)%2===0),0,.008,0,I-.18,A-.18,1);pe.rotation.x=-Math.PI/2,pe.castShadow=!1;for(let ie of[-1,1])for(let Z=-I/2+.15;Z<I/2-.1;Z+=.09)N(b,Re,de("#947b52",0,.95),Z,.006,ie*(A/2-.065),.022,.006,.1).castShadow=!1}else if(C.kind==="table"){let pe=ae-.06,ie=Math.max(2,Math.ceil(A/.25));for(let Be=0;Be<ie;Be++)N(b,Re,Be%2?Y:O,0,pe,-A/2+.09+(Be+.5)*(A-.18)/ie,I-.16,.12,(A-.18)/ie-.016);for(let Be of[-I/2+.22,I/2-.22])for(let tt of[-A/2+.22,A/2-.22])N(b,Re,te,Be,(ae-.14)/2,tt,.13,ae-.14,.13),N(b,Re,ue,Be,.09,tt,.15,.07,.15);ot(b,-I*.24,ae,-A*.17),Ae(b,I*.24,ae,A*.2),Ae(b,-I*.19,ae,A*.23);let Z=new qe;b.add(Z),Z.position.set(I*.23,ae+.065,-A*.22),Z.rotation.z=Math.PI/2,Z.rotation.y=.14,We(Z,0,0,0,.09,Math.min(.36,I*.3),Math.min(.31,A*.3),"#5e2824")}else if(C.kind==="bench"){let pe=Math.max(I,A),ie=Math.min(I,A);A>I&&(b.rotation.y=Math.PI/2),N(b,Re,Y,0,ae-.06,0,pe-.18,.12,ie*.58);for(let Z of[-pe/2+.25,pe/2-.25])N(b,Re,O,Z,(ae-.12)/2,0,.16,ae-.12,ie*.44)}else if(C.kind==="shelf"){let pe=Math.max(I,A),ie=Math.min(I,A),Z=ie*.72;b.rotation.y=A>I?C.x<V/2?-Math.PI/2:Math.PI/2:C.y<he/2?Math.PI:0;for(let lt of[-pe/2+.12,pe/2-.12])N(b,Re,O,lt,ae/2,0,.13,ae,Z);let Be=ae>=1.3?3:2,tt=["#5e2824","#274245","#785b2e","#38472e","#3e334d"];for(let lt=0;lt<=Be;lt++){let at=.1+lt*(ae-.15)/Be;if(N(b,Re,Y,0,at,0,pe-.1,.09,Z+.045),lt===Be)continue;let ct=Math.max(3,Math.floor((pe-.42)/.14));for(let Rt=0;Rt<ct;Rt++){let ut=(ae-.15)/Be*(.61+(Rt+lt*3)%4*.065);We(b,-pe/2+.26+(Rt+.5)*(pe-.52)/ct,at+.045+ut/2,-Z*.08,(pe-.52)/ct*.78,ut,Z*.7,tt[(Rt+lt*2)%tt.length])}}}else if(C.kind==="barrel"){let pe=Math.min(I,A)*.37,ie=Me("barrel",()=>new Wr([new be(0,0),new be(.8,0),new be(.95,.16),new be(1,.5),new be(.95,.84),new be(.8,1),new be(0,1)],16));N(b,ie,O,0,0,0,pe,ae,pe);for(let[Z,Be]of[[.12,.94],[.32,1],[.72,1],[.9,.93]])N(b,L,ne,0,Z*ae,0,pe*Be+.014,.055,pe*Be+.014);N(b,L,Y,0,ae+.003,0,pe*.79,.022,pe*.79)}else if(C.kind==="crate"){N(b,Re,O,0,ae/2,0,I-.22,ae,A-.22);for(let pe of[-1,1]){for(let Z of[.06,ae-.06])N(b,Re,Y,0,Z,pe*(A/2-.08),I-.16,.1,.08),N(b,Re,Y,pe*(I/2-.08),Z,0,.08,.1,A-.16);let ie=N(b,Re,Y,0,ae/2,pe*(A/2-.065),Math.hypot(I-.43,ae-.19),.085,.045);ie.rotation.z=Math.atan2(ae-.19,I-.43);for(let Z of[-I/2+.1,I/2-.1])N(b,Re,ne,Z,ae-.06,pe*(A/2-.07),.09,.11,.09)}}}function Oe(b){b.updateMatrixWorld(!0);let C=b.matrixWorld.clone().invert(),I=new Map;b.traverse(A=>{if(!A.isMesh)return;let O=`${A.geometry.uuid}:${A.material.uuid}:${A.castShadow}`;I.has(O)||I.set(O,[]),I.get(O).push(A)});for(let A of I.values()){if(A.length<2)continue;let O=A[0],Y=new Yi(O.geometry,O.material,A.length);Y.castShadow=O.castShadow,Y.receiveShadow=!0,A.forEach((te,ne)=>{Y.setMatrixAt(ne,new dt().multiplyMatrices(C,te.matrixWorld)),te.removeFromParent()}),Y.computeBoundingSphere(),b.add(Y)}}function Dt(b,C,I){return b.tiles?.[I]?.[C]==="#"}function on(b){return b.flame?b.flame:b.id==="caverns"?{ember:"#2ac4e8",outer:"#7bf0ff",core:"#e6ffff"}:b.id==="sanctum"?{ember:"#8c3dff",outer:"#c782ff",core:"#f6e6ff"}:b.id==="crucible"?{ember:"#ff4d12",outer:"#ff902b",core:"#ffe8a3"}:{ember:"#ff8229",outer:"#ffc25e",core:"#fff0b3"}}function _i(b,C,I,A,O){let Y=new qe;Y.position.set(b,I+.12,C),v.add(Y);let te=on(A),ne=de("#282f33",.78,.4),ue=de("#8c6d3e",.8,.34);N(Y,L,ne,0,.08,0,.12,.16,.12),N(Y,E,ue,0,.21,0,.22,.14,.22).rotation.z=Math.PI,N(Y,Ve,re(te.ember),0,.28,0,.15,.07,.15);let ae=N(Y,ke,re(te.outer),0,.42,0,.12,.34,.12);ae.castShadow=!1,N(Y,ke,re(te.core),.02,.35,.01,.055,.18,.055).castShadow=!1;let pe=null;O&&(pe=new Ai(A.torchColor,4.8,7.2,1.9),pe.position.set(0,.52,0),Y.add(pe)),me.push({flame:ae,light:pe,baseY:.42,baseScaleY:.34,baseIntensity:4.8,phase:b*2.1+C*3.7})}function or(){for(let b of le)b.mesh.removeFromParent(),b.mat.dispose();le.length=0}function ao(b){if(or(),p)return;let C=34;for(let I=0;I<C;I++){let A=(I*73+19)%1e3/1e3*(V-.4)-.3,O=(I*137+41)%1e3/1e3*(he-.4)-.3,Y=.22+(I*53+7)%100/100*1.95,te=new dn({color:b.moteColor||"#e8d8b5",transparent:!0,opacity:.45,depthWrite:!1}),ne=new Jt(Ve,te),ue=.016+I%4*.005;ne.scale.setScalar(ue),ne.position.set(A,Y,O),ne.castShadow=!1,ne.receiveShadow=!1,v.add(ne),le.push({mesh:ne,mat:te,baseX:A,baseZ:O,phase:I*1.73,speed:.16+I%5*.045,yOffset:Y})}}let Jc=new Set(["pillar","brazier","table","bench","shelf","barrel","crate","rug","sarcophagus","altar","stained_glass","bell","lantern_post","ore_vein","water_lock","kiln"]),Ta={sarcophagus:"props/sarcophagus.glb",brazier:"props/brazier.glb"};function rs(b,C,I,A=!0){if(!I.length)return null;let O=new Yi(b,C,I.length);return I.forEach(([Y,te,ne,ue,ae,pe,ie=0],Z)=>{yt.position.set(Y,te,ne),yt.scale.set(ue,ae,pe),yt.rotation.set(0,ie,0),yt.updateMatrix(),O.setMatrixAt(Z,yt.matrix)}),O.castShadow=A,O.receiveShadow=!0,O.computeBoundingSphere(),v.add(O),O}function Di(b,C,I){let A=Number(C.width)||1,O=Number(C.depth)||2,Y=Math.max(A,O),te=Math.min(A,O);A>O&&(b.rotation.y=Math.PI/2);let ne=de(I.wallCap||"#565852",.06,.82),ue=de(I.wallJoint||"#202321",.1,.8),ae=de(I.pillarTrim||"#7d653e",.5,.45);N(b,Re,ue,0,.05,0,te*.8,.1,Y*.86),N(b,Re,ne,0,.3,0,te*.7,.42,Y*.78),N(b,Re,ae,0,.51,0,te*.74,.04,Y*.82),N(b,Re,ne,0,.57,0,te*.68,.09,Y*.76),N(b,Re,ne,0,.64,0,te*.46,.06,Y*.6);for(let pe of[-Y*.18,Y*.18])N(b,Re,ae,0,.3,pe,te*.72,.3,.035)}function lo(b,C,I){let A=Number(C.width)||1,O=Number(C.depth)||1,Y=de(I.wallCap||"#565852",.06,.8),te=de(I.pillarTrim||"#7d653e",.5,.45);N(b,Re,Y,0,.12,0,A-.08,.24,O-.08),N(b,Re,Y,0,.42,0,A*.7,.36,O*.6),N(b,Re,te,0,.63,0,A*.76,.05,O*.66)}function wa(b,C,I){let A=Number(C.width)||1,O=Number(C.depth)||1,Y=Math.max(1.05,Math.min(1.9,Number(C.height)||1.48)),te=de(I.wallCap||"#444056",.08,.82),ne=de(I.wallJoint||"#1c1828",.12,.86),ue=Te("#523929"),ae=de("#282f34",.82,.36),pe=de("#b88b48",.86,.28),ie=de("#dfb66d",.9,.24),Z=Me("bell_body",()=>new Wr([new be(.01,.98),new be(.32,.95),new be(.46,.78),new be(.54,.48),new be(.72,.18),new be(.95,.04),new be(1,0),new be(.84,0),new be(.68,.15)],18));N(b,Re,ne,0,.08,0,A-.06,.16,O-.06),N(b,Re,te,0,.22,0,A-.22,.14,O-.22);let Be=Math.max(.62,A-.34),tt=Y-.28;for(let at of[-Be/2,Be/2])N(b,Re,ue,at,.28+tt/2,0,.14,tt,.14),N(b,Re,ae,at,.36,0,.16,.07,.16),N(b,Re,ae,at,Y-.12,0,.16,.07,.16);N(b,Re,ue,0,Y-.04,0,Be+.32,.14,.18),N(b,Re,te,0,Y+.06,0,Be+.42,.08,.28);let lt=A>=2.5?[[-.78,.22,.42],[0,.33,.6],[.78,.22,.42]]:[[0,.28,.52]];for(let[at,ct,Rt]of lt){let ut=Y-.12;N(b,Re,ae,at,ut-.05,0,ct*1.1,.07,.08),N(b,L,ae,at,ut-.12,0,.045,.14,.045),N(b,Z,pe,at,ut-.14-Rt,0,ct,Rt,ct),N(b,L,ie,at,ut-.14-Rt*.22,0,ct*.72,.035,ct*.72),N(b,Ve,ae,at,ut-.14-Rt-.03,0,.055,.055,.055)}}function Aa(b,C,I,A){let O=Math.max(.95,Math.min(1.7,Number(C.height)||1.32)),Y=de(I.wallCap||"#445863",.08,.86),te=Te("#593f2b"),ne=de("#252c30",.82,.36),ue=(I.base||I.id)==="caverns"?"#ffbe63":I.torchColor||"#ffae4a",ae="#fff3cf";N(b,Re,Y,0,.14,0,.72,.28,.72),N(b,Re,te,-.06,.26+(O-.26)/2,0,.16,O-.26,.16),N(b,Re,ne,-.06,.34,0,.19,.08,.19),N(b,Re,te,.12,O-.06,0,.5,.1,.11);let pe=N(b,Re,ne,.08,O-.2,0,.28,.045,.045);pe.rotation.z=Math.PI/4;let ie=.28,Z=O-.3;N(b,L,ne,ie,O-.14,0,.018,.14,.018),N(b,ke,ne,ie,Z+.13,0,.14,.1,.14),N(b,L,ne,ie,Z-.1,0,.11,.04,.11);let Be=N(b,L,re(ue,.94),ie,Z+.01,0,.088,.17,.088);Be.castShadow=!1,Be.userData.keep=!0;let tt=N(b,Ve,re(ae,.98),ie,Z+.01,0,.045,.065,.045);tt.castShadow=!1,tt.userData.keep=!0;for(let at=0;at<4;at++){let ct=at/4*Math.PI*2+Math.PI/4;N(b,L,ne,ie+Math.cos(ct)*.095,Z+.01,Math.sin(ct)*.095,.012,.19,.012)}let lt=null;A&&(lt=new Ai(ue,5.4,7.6,1.9),lt.position.set(ie,Z,0),b.add(lt)),me.push({flame:tt,light:lt,baseY:Z+.01,baseScaleY:.065,baseIntensity:5.4,phase:C.x*2.3+C.y*1.7})}function ar(b,C,I){let A=Number(C.width)||1,O=Number(C.depth)||1,Y=Math.max(.75,Math.min(1.25,Number(C.height)||1.02)),te=de("#26353e",.12,.92),ne=de("#172229",.16,.94),ue=I.crystalColor||"#4ce6ff",ae=re(ue,.94),pe=re("#e2fcff",.98),ie=(C.x*5+C.y*7)%6*.42,Z=N(b,ke,ne,0,Y*.36,0,Math.min(A,O)*.56,Y*.72,Math.min(A,O)*.56);Z.rotation.y=ie,N(b,Re,te,-A*.14,Y*.32,O*.1,A*.56,Y*.64,O*.52).rotation.set(.12,ie+.48,-.1),N(b,Re,ne,A*.16,Y*.28,-O*.14,A*.52,Y*.54,O*.5).rotation.set(-.14,ie-.36,.12),N(b,ke,te,A*.05,Y*.74,-O*.04,Math.min(A,O)*.36,Y*.54,Math.min(A,O)*.36).rotation.set(.08,ie,-.14);let at=[[A*.18,Y*.76,O*.12,.115,.68,.34,-.2],[-A*.18,Y*.7,-O*.14,.105,.6,-.36,.24],[A*.02,Y*.96,O*.02,.095,.58,.12,.14],[-A*.24,Y*.46,O*.2,.085,.46,-.48,-.32],[A*.24,Y*.44,-O*.2,.08,.44,.46,.28]];for(let[ct,Rt,ut,Wt,an,pn,mn]of at){let Gn=N(b,ke,ae,ct,Rt,ut,Wt,an,Wt);Gn.rotation.set(mn,0,pn),Gn.castShadow=!1;let Pe=N(b,ke,pe,ct,Rt+an*.16,ut,Wt*.46,an*.5,Wt*.46);Pe.rotation.set(mn,0,pn),Pe.castShadow=!1}}function Ra(b,C,I){let A=Number(C.width)||2,O=Number(C.depth)||2,Y=Math.max(.45,Math.min(1.15,Number(C.height)||.78)),te=de(I.wallCap||"#485449",.08,.84),ne=de("#3c5738",.06,.88),ue=Te("#4d3827"),ae=de("#262d30",.78,.38),pe="water:lock";q.has(pe)||q.set(pe,new Ln({color:"#1b585c",emissive:"#0e363a",emissiveIntensity:.75,metalness:.38,roughness:.12}));let ie=q.get(pe),Z=de("#5d7d40",.04,.86),Be=de("#6e462a",.04,.9),tt=.2;N(b,Re,te,-A/2+tt/2,.11,0,tt,.22,O-.04),N(b,Re,te,A/2-tt/2,.11,0,tt,.22,O-.04),N(b,Re,ne,-A/2+tt/2,.23,0,tt+.04,.04,O-.06),N(b,Re,ne,A/2-tt/2,.23,0,tt+.04,.04,O-.06);let lt=N(b,Re,ie,0,.04,0,Math.max(.4,A-tt*1.8),.04,O-.06);lt.castShadow=!1;let at=Y>=.8?Math.min(.42,O*.28):.22;N(b,Re,ue,0,Y*.5,0,A-.16,Y,at),N(b,Re,te,0,Y+.04,0,A-.08,.09,at+.08);let ct=Math.max(2,Math.round(A*2));for(let ut=0;ut<ct;ut++){let Wt=-A/2+.28+(ut+.5)*(A-.56)/ct;N(b,Re,ae,Wt,Y*.52,0,.055,Y+.08,at+.05)}if(Y>=.8)for(let ut of[-O/2+.24,O/2-.24])N(b,Re,te,0,Y*.42,ut,A-.24,Y*.84,.28);let Rt=Math.max(6,Math.round(O*4));for(let ut=0;ut<Rt;ut++){let Wt=ut%2===0?-1:1,an=Wt*(A/2-.21)+(ut*7%5-2)*.035,pn=-O/2+.16+(ut+.5)/Rt*(O-.32),mn=.58+ut%3*.16,Gn=N(b,L,Z,an,.16+mn/2,pn,.026,mn,.026);if(Gn.rotation.z=Wt*-.16,Gn.rotation.x=(ut%3-1)*.11,ut%2===0){let Pe=N(b,L,Be,an-Wt*.05,.16+mn*.88,pn,.046,.15,.046);Pe.rotation.z=Wt*-.16}}}function Ca(b,C,I,A){let O=Number(C.width)||2,Y=Number(C.depth)||2,te=Math.max(.95,Math.min(1.55,Number(C.height)||1.26)),ne=de("#523730",.1,.86),ue=de("#241a18",.14,.9),ae=de("#282a2d",.82,.38),pe=re("#ff5514",.94),ie=re("#ffda7a",.98);N(b,Re,ue,0,.08,0,O-.06,.16,Y-.06),N(b,Re,ne,0,.16+te*.62/2,0,O-.14,te*.62,Y-.14),N(b,Re,ue,0,.16+te*.62+.09,0,O-.3,.18,Y-.3);for(let ut of[.34,.68])N(b,Re,ae,0,ut,0,O-.1,.055,Y-.1);let Z=Math.max(.32,te*.34),Be=.16+te*.62+.14+Z/2;N(b,L,ue,0,Be,0,.25,Z,.25),N(b,L,ae,0,Be+Z*.44,0,.29,.06,.29);let tt=N(b,L,pe,0,Be+Z*.5,0,.19,.06,.19);tt.castShadow=!1,tt.userData.keep=!0;let lt=N(b,ke,ie,0,Be+Z*.62,0,.11,.24,.11);lt.castShadow=!1,lt.userData.keep=!0;let at=O>=2.5?[-.62,.62]:[0],ct=lt;for(let ut of at)for(let Wt of[-1,1]){let an=Wt*(Y/2-.065);N(b,Re,ae,ut,.4,an,.54,.46,.05);let pn=N(b,Re,pe,ut,.38,an+Wt*.012,.44,.36,.03);pn.castShadow=!1,pn.userData.keep=!0;let mn=N(b,Re,ie,ut,.32,an+Wt*.02,.3,.2,.02);mn.castShadow=!1,mn.userData.keep=!0;for(let Gn of[-.12,0,.12])N(b,Re,ae,ut+Gn,.38,an+Wt*.028,.028,.36,.024)}let Rt=null;A&&(Rt=new Ai("#ff6a22",6,8.4,1.9),Rt.position.set(0,.65,Y/2+.35),b.add(Rt)),me.push({flame:ct,light:Rt,baseY:Be+Z*.62,baseScaleY:.24,baseIntensity:6,phase:C.x*1.7+C.y*2.9})}function Ts(b,C,I){let A={s:[0,.5,0],n:[0,-.5,Math.PI],e:[.5,0,-Math.PI/2],w:[-.5,0,Math.PI/2]}[b.facing||"s"],O=`glass:${C.id}`;if(!q.has(O)){let ne=Ce((ue,ae,pe)=>{ue.fillStyle="#05030a",ue.fillRect(0,0,ae,pe),ue.save(),ue.beginPath(),ue.moveTo(ae*.2,pe),ue.lineTo(ae*.2,pe*.32),ue.quadraticCurveTo(ae*.2,pe*.05,ae*.5,pe*.02),ue.quadraticCurveTo(ae*.8,pe*.05,ae*.8,pe*.32),ue.lineTo(ae*.8,pe),ue.closePath(),ue.clip();let ie=["#7d3cff","#c47bff","#ffb347","#5a2bb8","#e0a0ff"];for(let Z=0;Z<42;Z++)ue.fillStyle=ie[Z%ie.length],ue.fillRect(ae*.2+Z%6*ae*.1,Math.floor(Z/6)*pe*.14,ae*.1,pe*.14);ue.strokeStyle="#120a18",ue.lineWidth=5;for(let Z=.2;Z<=.8;Z+=.1)ue.beginPath(),ue.moveTo(ae*Z,0),ue.lineTo(ae*Z,pe),ue.stroke();for(let Z=0;Z<=1;Z+=.14)ue.beginPath(),ue.moveTo(0,pe*Z),ue.lineTo(ae,pe*Z),ue.stroke();ue.restore()},128,256);q.set(O,new dn({map:ne,transparent:!0,blending:Js,depthWrite:!1,toneMapped:!1,side:Tn})),C.textures?.window&&Ea(C.textures.window,{srgb:!0,repeat:!1}).then(ue=>{if(!ue||Ee){ue?.dispose();return}$.add(ue);let ae=q.get(O);ae&&(ae.map=ue,ae.needsUpdate=!0,xt())})}let Y=Math.min(I,.86)*.92,te=N(v,ye,q.get(O),b.x+A[0]*1.002,.06+Y/2,b.y+A[1]*1.002,.62,Y,1);te.rotation.y=A[2],te.castShadow=!1,te.receiveShadow=!1}function Pa(b,C,I){Dm(Ta[I]).then(A=>{if(!A||Ee||!b.parent)return;let O=[...b.children],Y=A.clone(!0);Y.traverse(ne=>{ne.isMesh&&(ne.castShadow=!0,ne.receiveShadow=!0)});let te=Math.max(Number(C.width)||1,Number(C.depth)||1);I==="sarcophagus"&&Y.scale.setScalar(Math.min(1,te/2)),b.add(Y);for(let ne of O)!ne.isLight&&ne.userData.keep!==!0&&(ne.visible=!1);l.shadowMap.needsUpdate=!0,xt()})}function Ia(b){or(),K(v),me.length=0,V=Number(b.width)||10,he=Number(b.height)||8;let C=(V-1)/2,I=(he-1)/2,A=Rm(b,x);Se=A.id,h.background.set(A.bg),h.fog.color.set(A.fog),k.color.set(A.hemiSky),k.groundColor.set(A.hemiGround),H.color.set(A.keyColor),z.color.set(A.fillColor),N(v,Re,de(A.slab,.12,.88),C,-.42,I,V+.46,.64,he+.46),N(v,Re,de(A.rim,.78,.34),C,-.155,I,V+.22,.078,he+.22),N(v,Re,de(A.frame,.24,.76),C,-.09,I,V+.1,.12,he+.1);let O=Cm(A,l,$,q),Y=Pm(A,l,$,q),te=`pbr-floor-alt:${A.id}`;q.has(te)||q.set(te,O.clone());let ne=q.get(te),ue=`pbr-cap:${A.id}`;q.has(ue)||q.set(ue,new Ln({map:Y.map,bumpMap:Y.bumpMap,bumpScale:.038,color:new nt("#c8c4bc"),roughness:.78,metalness:.08}));let ae=q.get(ue);if(A.textures&&!q.has(`textured:${A.id}`)){q.set(`textured:${A.id}`,new dn);let Pe=Ot=>$.add(Ot),Ge=Math.min(u==="low"?2:8,l.capabilities.getMaxAnisotropy());Promise.all([$c(O,A.textures.floor,Pe,{anisotropy:Ge}),$c(ne,A.textures.floorAlt||A.textures.floor,Pe,{anisotropy:Ge}),$c(Y,A.textures.wall,Pe,{anisotropy:Ge})]).then(()=>{Ee||(l.shadowMap.needsUpdate=!0,xt())})}let pe=new Set((b.scene?.chasm||[]).map(([Pe,Ge])=>`${Pe},${Ge}`)),ie=new nt,Z=[],Be=[];for(let Pe=0;Pe<he;Pe++)for(let Ge=0;Ge<V;Ge++){if(pe.has(`${Ge},${Pe}`))continue;(A.textures?.floorAlt&&(Ge*7+Pe*13)%8===3&&!Dt(b,Ge,Pe)?Be:Z).push([Ge,Pe])}for(let[Pe,Ge]of[[Z,O],[Be,ne]]){if(!Pe.length)continue;let Ot=new Yi(Re,Ge,Pe.length);Pe.forEach(([Lt,Xt],Yn)=>{yt.position.set(Lt,-.015,Xt),yt.scale.set(.976,.09,.976),yt.rotation.set(0,Ge===O?(Lt*7+Xt*3)%4*Math.PI/2:0,0),yt.updateMatrix(),Ot.setMatrixAt(Yn,yt.matrix);let Kn=.9+(Lt*13+Xt*7)%5*.042;ie.setRGB(Kn,Kn,Kn*((A.base||A.id)==="caverns"?1.04:.99)),Ot.setColorAt(Yn,ie)}),Ot.receiveShadow=!0,v.add(Ot)}if(pe.size){let Pe=[...pe].map(Lt=>Lt.split(",").map(Number));rs(Re,de("#050308",0,1),Pe.map(([Lt,Xt])=>[Lt,-.62,Xt,1,.1,1]),!1);let Ge=re(A.torchColor||"#8c3dff",.16),Ot=Pe.filter(([Lt,Xt])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([Yn,Kn])=>!pe.has(`${Lt+Yn},${Xt+Kn}`)&&!Dt(b,Lt+Yn,Xt+Kn)));rs(Re,Ge,Ot.map(([Lt,Xt])=>[Lt,-.3,Xt,.98,.5,.98]),!1)}let tt=(b.scene?.props||[]).filter(Pe=>Jc.has(Pe.kind)),lt=new Set;for(let Pe of tt)if(Pe.kind!=="rug"&&Pe.kind!=="stained_glass")for(let Ge=0;Ge<(Pe.depth||1);Ge++)for(let Ot=0;Ot<(Pe.width||1);Ot++)lt.add(`${Pe.x+Ot},${Pe.y+Ge}`);let at=Math.max(.25,Math.min(1.6,Number(b.scene?.wall_height)||1.1)),ct=[],Rt=[],ut=[],Wt=[],an=[];for(let Pe=0;Pe<he;Pe++)for(let Ge=0;Ge<V;Ge++){if(!Dt(b,Ge,Pe)||lt.has(`${Ge},${Pe}`)||pe.has(`${Ge},${Pe}`))continue;let Ot=Ge===0||Pe===0||Ge===V-1||Pe===he-1,Lt=["caverns","catacombs"].includes(A.base||A.id)&&!Ot?((Ge*17+Pe*31)%5-2)*.045:0,Xt=(Ot?Math.min(at,.42):Math.min(at,.86))+Lt;Rt.push([Ge,Xt/2+.04,Pe,.978,Xt,.978]),ut.push([Ge,Xt+.075,Pe,1.018,.095,1.018]),Ot||(Wt.push([Ge,.07,Pe,1.022,.07,1.022]),[[1,0],[-1,0],[0,1],[0,-1]].some(([Kn,Fm])=>!Dt(b,Ge+Kn,Pe+Fm))&&ct.push({x:Ge,y:Pe,h:Xt})),A.crystalColor&&Ot&&(Ge*11+Pe*23)%11===0&&an.push([Ge+.15,Xt+.21,Pe-.1])}rs(Re,Y,Rt),rs(Re,ae,ut),rs(Re,de(A.wallJoint,.14,.86),Wt);for(let[Pe,Ge,Ot]of an){let Lt=N(v,ke,re(A.crystalColor,.88),Pe,Ge,Ot,.075,.26,.075);Lt.rotation.z=.22,Lt.castShadow=!1}let pn=on(A),mn=0;for(let Pe of tt){if(Pe.kind==="stained_glass"){Ts(Pe,A,at);continue}let Ge=new qe;Ge.userData.mapProp={...Pe};let Ot=sm(Pe,Le.objects);if(Ot&&(Ge.userData.objectId=Ot.id,Ge.userData.objectState={...Ot},Ge.visible=!Ot.destroyed),Ge.position.set(Pe.x+((Pe.width||1)-1)/2,.04,Pe.y+((Pe.depth||1)-1)/2),v.add(Ge),Pe.kind==="pillar"){let Lt=Math.max(.7,Math.min(2.1,Number(Pe.height)||at+.26));N(Ge,Re,ae,0,.1,0,.88,.2,.88),N(Ge,L,Y,0,Lt/2,0,.29,Lt-.15,.29);for(let Xt=1;Xt<4;Xt++)N(Ge,L,de(A.pillarTrim,.45,.52),0,Xt*Lt/4,0,.306,.038,.306);N(Ge,Re,ae,0,Lt-.02,0,.8,.17,.8)}else if(Pe.kind==="brazier"){let Lt=Math.max(.4,Math.min(1.1,Number(Pe.height)||.65));N(Ge,Re,de(A.wallJoint,.16,.82),0,.1,0,.68,.2,.68),N(Ge,L,de("#282f33",.78,.4),0,Lt/2,0,.1,Lt-.12,.1),N(Ge,E,de("#7d5e36",.8,.36),0,Lt,0,.32,.18,.32).rotation.z=Math.PI;let Xt=N(Ge,Ve,re(pn.ember),0,Lt+.1,0,.21,.09,.21),Yn=N(Ge,ke,re(pn.outer),-.02,Lt+.27,0,.15,.44,.15);Yn.castShadow=!1,Xt.userData.keep=!0,Yn.userData.keep=!0;let Kn=null;mn++<3&&(Kn=new Ai(A.torchColor,5.2,7.2,2),Kn.position.set(0,Lt+.42,0),Ge.add(Kn)),me.push({flame:Yn,light:Kn,baseY:Lt+.27,baseScaleY:.44,baseIntensity:5.2,phase:Pe.x*1.9+Pe.y*2.7}),A.flame&&Pa(Ge,Pe,"brazier")}else Pe.kind==="sarcophagus"?(Di(Ge,Pe,A),Pa(Ge,Pe,"sarcophagus")):Pe.kind==="altar"?lo(Ge,Pe,A):Pe.kind==="bell"?wa(Ge,Pe,A):Pe.kind==="lantern_post"?Aa(Ge,Pe,A,mn++<3):Pe.kind==="ore_vein"?ar(Ge,Pe,A):Pe.kind==="water_lock"?Ra(Ge,Pe,A):Pe.kind==="kiln"?Ca(Ge,Pe,A,mn++<3):_t(Ge,Pe);["brazier","table","sarcophagus","lantern_post","kiln"].includes(Pe.kind)||Oe(Ge),Ot&&Ge.traverse(Lt=>{Lt.userData.objectId=Ot.id})}if(!tt.some(Pe=>["brazier","lantern_post","kiln"].includes(Pe.kind))){let Pe=ct.length?ct:[{x:0,y:0,h:.42},{x:V-1,y:0,h:.42},{x:0,y:he-1,h:.42},{x:V-1,y:he-1,h:.42}],Ge=[],Ot=Math.max(4,Math.hypot(V,he)*.28);for(let Lt=0;Lt<Pe.length&&Ge.length<4;Lt++){let Xt=Pe[(Lt*7+3)%Pe.length];Ge.every(Yn=>Math.hypot(Xt.x-Yn.x,Xt.y-Yn.y)>=Ot)&&(Ge.push(Xt),_i(Xt.x,Xt.y,Xt.h,A,mn++<3))}}ao(A),H.target.position.set(C,0,I);let Gn=Math.hypot(V,he)/2+2.5;Object.assign(H.shadow.camera,{left:-Gn,right:Gn,top:Gn,bottom:-Gn,far:65}),H.shadow.camera.updateProjectionMatrix(),H.position.set(C-6.5,13.5,I+5.5),z.position.set(C+7.5,5.5,I-6.5)}function La(b,C){if(p||J.length>18)return;let I=new dn({color:"#b7b3a4",transparent:!0,opacity:.42,depthWrite:!1}),A=new Jt(Ve,I);A.position.set(b+Math.sin(b*12+C*7)*.12,.09,C+Math.cos(b*9-C*5)*.12),A.scale.setScalar(.06),F.add(A),J.push({mesh:A,mat:I,born:performance.now()})}function Da(b){let C=rr(b);return C?C==="goblin"?1.38:C==="goblin_boss"?1.48:1.66:1.56}function Na(b,C=Da(b)){let I=(b.conditions||[]).filter(te=>!["dead","unconscious"].includes(te)).length+(b.marks||[]).length,A=Ce((te,ne,ue)=>{te.clearRect(0,0,ne,ue),te.fillStyle="rgba(11, 20, 24, 0.88)",te.beginPath(),te.roundRect(4,4,ne-8,ue-8,16),te.fill(),te.strokeStyle=b.active&&b.alive?"#ffdb86":b.team==="heroes"?"#62c4be":"#d68265",te.lineWidth=b.active&&b.alive?3.5:2.5,te.stroke(),te.fillStyle="#f6efe0",te.font="700 24px system-ui, -apple-system, sans-serif",te.textAlign="left";let ae=String(b.name||b.id),pe=ae.length>24?`${ae.slice(0,23)}\u2026`:ae;te.fillText(pe,16,33,ne-84),te.fillStyle="#b9d2cd",te.font="600 19px system-ui, sans-serif",te.textAlign="right",te.fillText(`${Math.max(0,b.hp)}/${b.max_hp}`,ne-15,33),te.fillStyle="#25353a",te.beginPath(),te.roundRect(15,44,ne-30,8,4),te.fill();let ie=Math.max(0,Math.min(1,b.hp/Math.max(1,b.max_hp)));if(te.fillStyle=b.team==="heroes"?ie>.4?"#4ad4b2":"#f29d52":ie>.4?"#eb7a65":"#d94e4e",ie>0&&(te.beginPath(),te.roundRect(15,44,Math.max(8,(ne-30)*ie),8,4),te.fill()),I>0){te.fillStyle="#ffd966";for(let Z=0;Z<Math.min(4,I);Z++)te.beginPath(),te.arc(ne-18-Z*10,13,3.2,0,Math.PI*2),te.fill()}},240,64),O=new fs({map:A,transparent:!0,depthTest:!1,depthWrite:!1}),Y=new Bs(O);return Y.renderOrder=15,Y.scale.set(.92,.245,1),Y.position.set(0,C,0),Y.userData.unitId=b.id,Y.userData.baseY=C,Y}function Ua(b){b&&($.delete(b.material.map),b.material.map.dispose(),b.material.dispose(),b.removeFromParent())}function Oa(){if(!a.clientHeight||!a.clientWidth)return;f.updateMatrixWorld();let b=[];for(let C of W.values()){let I=C.name;if(!I)continue;if(y==="off"||!C.data.alive&&C.data.team==="monsters"&&C.castKey){I.visible=!1;continue}if(I.visible=y!=="minimal"||!!(C.data.active||C.data.id===Ft),!I.visible)continue;let A=C.data.alive?C.labelY:.66;Pt.set(C.root.position.x,A,C.root.position.z).project(f);let O=(Pt.x+1)*a.clientWidth*.5,Y=(1-Pt.y)*a.clientHeight*.5,te=f.position.distanceTo(C.root.position);b.push({entry:C,sp:I,baseY:A,sx:O,sy:Y,adjY:Y,dist:te})}b.sort((C,I)=>I.sy-C.sy);for(let C=0;C<b.length;C++){let I=b[C];for(let Y=0;Y<C;Y++){let te=b[Y];Math.abs(I.sx-te.sx)<76&&Math.abs(I.adjY-te.adjY)<25&&(I.adjY=te.adjY-26)}let A=Math.min(72,Math.max(0,I.sy-I.adjY)),O=2*I.dist*Math.tan(tn.degToRad(f.fov/2))/Math.max(1,a.clientHeight);R(I.sp,I.baseY+A*O,I.dist)}}function R(b,C,I){b.position.y+=(C-b.position.y)*.35;let A=Math.max(.36,Math.min(1.42,I/15));b.scale.set(.92*A,.245*A,1)}let G=new Map,se={guiding_bolt:(b,C)=>{let I=new qe;return I.name="mark-guiding_bolt",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#ffd75e",.9),0,.12,0).rotation.x=-Math.PI/2,N(I,Me("mark-star",()=>new Rn(1)),re("#ffe27a",.95),0,1.18*(C.model?.scale||1)+.25,0,.07,.13,.07),I},bless:(b,C)=>{let I=new qe;return I.name="mark-bless",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#ffe27a",.85),0,.12,0).rotation.x=-Math.PI/2,N(I,Me("mark-halo",()=>new Ct(.2,.02,6,28)),re("#fff0a8",.9),0,1.22*(C.model?.scale||1)+.28,0).rotation.x=-Math.PI/2,I},aid:b=>{let C=new qe;return C.name="mark-aid",b.add(C),N(C,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#8dffa8",.85),0,.12,0).rotation.x=-Math.PI/2,N(C,Re,re("#8dffa8",.95),0,.14,0,.1,.03,.03),N(C,Re,re("#8dffa8",.95),0,.14,0,.03,.1,.03),C},shield_of_faith:(b,C)=>{let I=new qe;return I.name="mark-shield_of_faith",b.add(I),N(I,Ve,re("#7fb8ff",.18),0,.62*(C.model?.scale||1),0,.52,.7,.52),I},sanctuary:(b,C)=>{let I=new qe;return I.name="mark-sanctuary",b.add(I),N(I,Ve,re("#f4f0ff",.14),0,.5*(C.model?.scale||1),0,.62,.8,.62),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#ffffff",.7),0,.12,0).rotation.x=-Math.PI/2,I},protection:b=>{let C=new qe;C.name="mark-protection",b.add(C),N(C,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#fff0b0",.95),0,.12,0).rotation.x=-Math.PI/2;for(let I=0;I<4;I++)N(C,Re,re("#fff0b0",.8),0,.13,0,.03,.01,.9).rotation.y=I*Math.PI/4;return C},blur:(b,C)=>{let I=new qe;I.name="mark-blur",b.add(I);for(let A of[-.16,.16])N(I,Ve,re("#bcd8ff",.18),A,.62*(C.model?.scale||1),0,.2,.45,.2);return I},innate_sorcery:b=>{let C=new qe;C.name="mark-innate_sorcery",b.add(C);for(let I=0;I<8;I++){let A=I/8*Math.PI*2;N(C,ke,re(I%2?"#ffb347":"#ff7a3c",.85),Math.cos(A)*.42,.3,Math.sin(A)*.42,.06,.4,.06)}return C},paralyzed:(b,C)=>{let I=new qe;I.name="mark-paralyzed",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#ffe27a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let A=0;A<4;A++){let O=A/4*Math.PI*2;N(I,Me("mark-star",()=>new Rn(1)),re("#fff0a0",.95),Math.cos(O)*.3,1.15*(C.model?.scale||1)+.2,Math.sin(O)*.3,.05,.09,.03)}return I},poisoned:(b,C)=>{let I=new qe;I.name="mark-poisoned",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#8fd36a",.85),0,.12,0).rotation.x=-Math.PI/2;for(let A=0;A<5;A++)N(I,Ve,re(A%2?"#8fd36a":"#c7f59a",.8),Math.cos(A*2.2)*.25,.7*(C.model?.scale||1)+A*.16,Math.sin(A*2.2)*.25,.045,.045,.045);return I},frightened:(b,C)=>{let I=new qe;I.name="mark-frightened",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#a8c8ff",.85),0,.12,0).rotation.x=-Math.PI/2;for(let A of[-.14,.14])N(I,ke,re("#d8e6ff",.9),A,1.2*(C.model?.scale||1)+.15,0,.04,.2,.04).rotation.z=Math.PI;return I},cursed:(b,C)=>{let I=new qe;I.name="mark-cursed",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#5f8f3a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let A=0;A<4;A++)N(I,Ve,re(A%2?"#3d5c25":"#9bd16a",.75),Math.cos(A*1.6)*.3,.45*(C.model?.scale||1)+A*.2,Math.sin(A*1.6)*.3,.05,.05,.05);return I},stench:b=>{let C=new qe;return C.name="mark-stench",b.add(C),N(C,Ve,re("#8fb84a",.16),0,.35,0,1.15,.5,1.15),C},strength_drain:b=>{let C=new qe;C.name="mark-strength_drain",b.add(C),N(C,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#d24a4a",.9),0,.12,0).rotation.x=-Math.PI/2;for(let I=0;I<3;I++){let A=N(C,ke,re("#e86a6a",.95),.34,.3+I*.22,0,.07,.14,.07);A.rotation.z=Math.PI,A.name="mark-chev"}return C},slowed:(b,C)=>{let I=new qe;I.name="mark-slowed",b.add(I),N(I,Me("mark-ring",()=>new Ct(.46,.028,6,36)),re("#8fd8ff",.9),0,.12,0).rotation.x=-Math.PI/2;for(let A=0;A<6;A++){let O=A*Math.PI/3,Y=N(I,ke,re("#c9eeff",.9),Math.cos(O)*.42,.22,Math.sin(O)*.42,.045,.3,.045);Y.rotation.z=Math.cos(O)*.35,Y.rotation.x=-Math.sin(O)*.35}return N(I,Me("mark-flake",()=>new Rn(1)),re("#e6f7ff",.95),0,1.05*(C.model?.scale||1)+.25,0,.07,.07,.07),I}};function j(b){let C=["fighter","mage","goblin","skeleton"],I=b.model?.base||b.kind,A=C.includes(I)?I:b.team==="heroes"?"fighter":"goblin",O=new qe;w.add(O),O.position.set(b.x,.04,b.y),O.userData.unitId=b.id,O.userData.unitKind=b.kind;let Y=new qe;O.add(Y),Y.rotation.y=b.team==="heroes"?-1.57:1.57;let te=[];fe(O,ye,xe,.002).scale.set(.97,.97,1);let ne=N(O,L,de(b.team==="heroes"?"#255a61":"#6e493a",.25,.65),0,.055,0,.365,.09,.365);ne.userData.unitId=b.id,fe(O,Q,re(b.team==="heroes"?"#6bd4cf":"#e09a70"),.105).scale.setScalar(.86);let ue=fe(O,we,re("#ffdb86"),.023);ue.visible=!1;let ae=fe(O,Me("target-ring",()=>new Bn(.49,.54,48)),re("#fa856e"),.026);ae.visible=!1;let pe=fe(O,Me("inspect-ring",()=>new Bn(.55,.585,48)),re("#b8f6ee",.8),.028);pe.visible=!1;let ie={},Z=rr(b),Be=Z?bm(b):null;Z&&!Be&&_d(Z);let tt;if(Be)Y.add(Be.model),Y.userData.castKey=Z,O.userData.castKey=Z,O.userData.undeadModel=Z,te.push(...Be.ownMaterials),tt=Be.rig;else{let an=Ge=>{let Ot=de(Ge,.2).clone();return te.push(Ot),Ot},pn=an(b.team==="heroes"?"#43818a":"#8f5e45"),mn=an(A==="goblin"?"#8fb060":"#dfb48e"),Gn=an("#c4cfcb"),Pe={right:[],left:[],blade:[],bow:[]};N(Y,E,pn,0,.48,0,.25,.68,.22).userData.unitId=b.id,N(Y,Ve,mn,0,.96,0,.15,.16,.14).userData.unitId=b.id,Pe.right.push(N(Y,Ve,pn,.22,.72,0,.09,.16,.09)),Pe.left.push(N(Y,Ve,pn,-.22,.72,0,.09,.16,.09)),Pe.blade.push(N(Y,Re,Gn,.32,.85,-.1,.04,.55,.08)),tt=hm(Y,Pe,A)}let lt=Da(b),at=Na(b,lt);O.add(at);let ct=new Jt(Me("picker",()=>new Si(.4,.4,1.3,10)),P);ct.position.y=.65,ct.userData.unitId=b.id,ct.name="unit-picker",O.add(ct);let Rt=fe(O,Me("down-ring",()=>new Bn(.4,.47,40)),re("#ff5a4a",.85),.03);Rt.visible=!1;let ut=fe(O,Me("dead-ring",()=>new Bn(.3,.47,40)),de("#16181a",0,1),.031);ut.visible=!1;let Wt={root:O,body:Y,rig:tt,name:at,labelY:lt,active:ue,target:ae,inspect:pe,picker:ct,downRing:Rt,deadRing:ut,markGroups:ie,ownMaterials:te,castKey:Be?Z:null,data:{...b},start:new D(b.x,.04,b.y),end:new D(b.x,.04,b.y),moveStart:0,moveEnd:0,targetYaw:Y.rotation.y};return Ye(Wt,b),Wt}function ee(){if(Ee||Fe)return;if(rt){sn=!0;return}sn=!1;let b=!1;for(let[C,I]of W){let A=rr(I.data);if(!A||I.castKey===A||!Sm(I.data))continue;let O=j(I.data);O.root.position.copy(I.root.position),O.body.rotation.y=I.body.rotation.y,O.targetYaw=I.targetYaw,Ye(O,I.data),O.target.visible=I.target.visible,De(I),W.set(C,O),b=!0}b&&(l.shadowMap.needsUpdate=!0,xt())}let Ue=Mm(()=>ee());function Ye(b,C){b.active.visible=!!(C.active&&C.alive),b.inspect.visible=C.id===Ft;let I=C.alive?[...C.marks||[]]:[];for(let A of I)!b.markGroups[A]&&se[A]&&(b.markGroups[A]=se[A](b.root,C));for(let[A,O]of Object.entries(b.markGroups))O.visible=I.includes(A);if(b.markGroups.strength_drain&&b.markGroups.strength_drain.children.forEach((A,O)=>{A.name==="mark-chev"&&(A.visible=O-1<Math.min(3,Math.ceil((C.str_loss||0)/2)))}),C.alive)b.body.rotation.z=0,b.body.position.y=0,b.body.visible=!0,b.downRing.visible=!1,b.deadRing.visible=!1,b.picker.visible=!0;else{b.rig.isSkinned&&b.rig.death(9999)?(b.body.rotation.z=0,b.body.position.y=0):(b.body.rotation.z=-Math.PI/2,b.body.position.y=.23),b.body.visible=C.team==="heroes";let A=C.dead===!0||(C.conditions||[]).includes("dead");b.downRing.visible=C.team==="heroes"&&!A,b.deadRing.visible=C.team==="heroes"&&A,b.picker.visible=C.team==="heroes"}b.data={...C},b.target.visible=!1}function De(b){Ua(b.name),b.rig.dispose&&b.rig.dispose();let C=b.rig.model?new Set(ze(b.rig.model)):new Set;b.ownMaterials.forEach(I=>{C.has(I)||I.dispose()}),b.root.removeFromParent()}function ze(b){let C=[];return b.traverse(I=>{I.material&&C.push(...Array.isArray(I.material)?I.material:[I.material])}),C}function Je(b,C={}){if(Ee||Fe||!b?.map)return;Le=b,Ie=!!C.busy,Ft=C.inspectedId??null,C.biome!==void 0&&C.biome!==x&&(x=C.biome,et=""),sn&&!rt&&ee(),a.classList.toggle("is-busy",Ie);let I=b.map,A=I.width!==V||I.height!==he,O=JSON.stringify([x,I.width,I.height,I.tiles,I.scene,(b.objects||[]).map(({id:ie,kind:Z,x:Be,y:tt,width:lt,depth:at,destroyed:ct})=>({id:ie,kind:Z,x:Be,y:tt,ow:lt,depth:at,destroyed:ct}))]);O!==et&&(Ia(I),et=O),(!X||A)&&(X=!0,Zt(!1));let Y=performance.now(),te=new Set;for(let ie of b.units||[]){te.add(ie.id);let Z=W.get(ie.id);if(Z&&(Z.data.kind!==ie.kind||Z.data.team!==ie.team)&&(De(Z),W.delete(ie.id),Z=null),Z||(Z=j(ie),W.set(ie.id,Z)),Z.data.x!==ie.x||Z.data.y!==ie.y){let lt=!C.snap&&!C.ordered&&Math.abs(Z.data.x-ie.x)+Math.abs(Z.data.y-ie.y)===1;Z.start.set(Z.data.x,.04,Z.data.y),Z.end.set(ie.x,.04,ie.y),Z.moveStart=Y,Z.moveEnd=!p&&lt?Y+300:0,Z.moveEnd?Z.root.position.copy(Z.start):Z.root.position.copy(Z.end)}let Be=JSON.stringify([Z.data.conditions,Z.data.marks]),tt=JSON.stringify([ie.conditions,ie.marks]);(ie.hp!==Z.data.hp||ie.max_hp!==Z.data.max_hp||ie.name!==Z.data.name||ie.active!==Z.data.active||Be!==tt)&&(Ua(Z.name),Z.name=Na(ie,Z.labelY),Z.root.add(Z.name)),Ye(Z,ie)}for(let[ie,Z]of W)te.has(ie)||(De(Z),W.delete(ie));let ne=new Set;for(let ie of b.forces||[]){ne.add(ie.id);let Z=G.get(ie.id);if(!Z){let Be=new qe;Be.name="spiritual-weapon",w.add(Be),N(Be,L,re("#cfe8ff",.9),0,0,0,.04,.5,.04),N(Be,Re,re("#9fd0ff",.85),0,.3,0,.26,.17,.17),N(Be,Me("force-halo",()=>new Ct(.3,.02,6,28)),re("#bfe0ff",.8),0,.15,0).rotation.x=Math.PI/2,Be.rotation.z=-.5,Z={g:Be},G.set(ie.id,Z)}Z.g.position.set(ie.x,1.05,ie.y)}for(let[ie,Z]of G)ne.has(ie)||(Z.g.removeFromParent(),G.delete(ie));C.ordered||zt.ingest(b,Y),K(M);let ue=new Set,ae=new Set;for(let ie of C.selectedActions||[]){ie.kind==="move"&&Number.isInteger(ie.x)&&Number.isInteger(ie.y)&&ue.add(`${ie.x},${ie.y}`);for(let Z of ie.target_ids||[])ae.add(Z);ie.target_id&&ae.add(ie.target_id)}if(b.phase==="setup"&&C.setupFigure)for(let ie=0;ie<I.height;ie++)for(let Z=0;Z<I.width;Z++)!Dt(I,Z,ie)&&!(b.setup?.placements||[]).some(Be=>Be.id!==C.setupFigure&&Be.x===Z&&Be.y===ie)&&ue.add(`${Z},${ie}`);for(let ie of ue){let[Z,Be]=ie.split(",").map(Number),tt=N(M,ye,re("#59d8c3",Ie?.12:.25),Z,.058,Be,.84,.84,1);tt.rotation.x=-Math.PI/2,tt.castShadow=!1;let lt=N(M,Me("move-rim",()=>{let at=new Gs;at.moveTo(-.435,-.435),at.lineTo(.435,-.435),at.lineTo(.435,.435),at.lineTo(-.435,.435),at.closePath();let ct=new ms;return ct.moveTo(-.405,-.405),ct.lineTo(-.405,.405),ct.lineTo(.405,.405),ct.lineTo(.405,-.405),ct.closePath(),at.holes.push(ct),new Xr(at)}),re("#8cf0de",Ie?.35:.88),Z,.061,Be);lt.rotation.x=-Math.PI/2,lt.castShadow=!1}for(let ie of ae){let Z=W.get(ie);Z&&(Z.target.visible=!0)}let pe=C.previewFriendlyFire?"#ff4a38":"#ff7a3d";for(let ie of C.previewCells||[]){let[Z,Be]=ie,tt=N(M,ye,re(pe,Ie?.14:.42),Z,.066,Be,.9,.9,1);tt.rotation.x=-Math.PI/2,tt.castShadow=!1}for(let ie of b.objects||[])if(!ie.destroyed){if(ae.has(ie.id)||C.inspectedId===ie.id){let Z=N(M,ye,re(ae.has(ie.id)?"#fa856e":"#b8f6ee",.38),ie.x+((ie.width||1)-1)/2,.07,ie.y+((ie.depth||1)-1)/2,ie.width||1,ie.depth||1,1);Z.rotation.x=-Math.PI/2,Z.castShadow=!1}v.traverse(Z=>{Z.userData.objectId===ie.id&&Z.userData.mapProp&&(Z.userData.objectState={...ie})})}l.shadowMap.needsUpdate=!0,xt()}function pt(b){let C=Array.isArray(b.effects)?b.effects.map(I=>({...I})):[];if(b.opportunity){let I=W.get(b.source_id),A=C.find(O=>O.source_id===b.source_id);I&&A&&C.unshift({id:9e5+(Number(b.id)||0)*10,type:"attack",style:"touch",variant:"opportunity",outcome:"hit",amount:0,text:"OPPORTUNITY",source_id:b.source_id,target_id:b.source_id,source:{x:I.data.x,y:I.data.y},target:{x:I.data.x,y:I.data.y}})}return C}function bt(){return{position:{x:f.position.x,y:f.position.y,z:f.position.z},target:{x:g.target.x,y:g.target.y,z:g.target.z},azimuth:g.getAzimuthalAngle()}}function Xe(b,C,I=500,A=null){if(!(Ee||Fe)){if(p||I<=0){ft=null,g.target.copy(C),f.position.copy(b),g.update(),xt();return}ft={t0:performance.now(),dur:I,fromPos:f.position.clone(),toPos:b.clone(),fromTarget:g.target.clone(),toTarget:C.clone(),orbitArc:A},xt()}}function Mt(b,C=null,I=.48){let A=C?C.x0:-.75,O=C?C.x1:V-.25,Y=C?C.z0:-.75,te=C?C.z1:he-.25,ne=new D((A+O)/2,I,(Y+te)/2),ue=b.clone().normalize(),ae=tn.degToRad(f.fov/2),pe=Math.atan(Math.tan(ae)*Math.max(.05,f.aspect)),ie=Math.abs(ue.y)>.995?new D(0,0,-1):f.up,Z=new D().crossVectors(ie,ue).normalize(),Be=new D().crossVectors(ue,Z).normalize(),tt=new D,lt=C?5.6:7.2;function at(Rt,ut,Wt){tt.set(Rt,ut,Wt).sub(ne),lt=Math.max(lt,tt.dot(ue)+Math.max(Math.abs(tt.dot(Z))/(.88*Math.tan(pe)),Math.abs(tt.dot(Be))/(.88*Math.tan(ae))))}for(let Rt of[A,O])for(let ut of[Y,te])for(let Wt of[-.85,1.45])at(Rt,Wt,ut);if(!C)for(let Rt of Le?.units||[])for(let ut of[-.55,.55])at(Rt.x+ut,1.62,Rt.y);return g.maxDistance=Math.max(36,lt*1.55),f.far=Math.max(120,lt*3.4),f.updateProjectionMatrix(),h.fog.near=Math.max(30,lt*1.45),h.fog.far=Math.max(72,lt*3.3),{pos:ue.clone().multiplyScalar(lt).add(ne),target:ne,distance:lt}}function Zt(b=!0){if(Ee||Fe)return;rn.set(.54,.92,1.13).normalize();let{pos:C,target:I}=Mt(rn);b&&X?Xe(C,I,480):(ft=null,g.target.copy(I),f.position.copy(C),g.update(),g.saveState(),xt())}function Vt(b,C=null){if(Ee||Fe)return;let I=f.position.clone().sub(g.target),A=Math.atan2(I.x,I.z)||Math.atan2(.54,1.13);if(b==="overhead"||b==="topdown"){let ne=new D(.001,1,.045).normalize(),{pos:ue,target:ae}=Mt(ne,null,.12);Xe(ue,ae,520);return}if(b==="heroic"||b==="cinematic"){let ne=Le?.units||[],ue=C&&ne.find(ae=>ae.id===C)||Ft&&ne.find(ae=>ae.id===Ft)||ne.find(ae=>ae.id===Le?.turn_id&&ae.alive!==!1)||ne.find(ae=>ae.alive!==!1)||ne[0];if(ue){let ae=ne.filter(ct=>ct.alive!==!1&&ct.team!==ue.team),pe=ue.team==="heroes"?1:-1,ie=0;if(ae.length){let ct=ae.reduce((an,pn)=>{let mn=(pn.x-ue.x)**2+(pn.y-ue.y)**2;return mn<an.d?{f:pn,d:mn}:an},{f:ae[0],d:1/0}).f,Rt=ct.x-ue.x,ut=ct.y-ue.y,Wt=Math.hypot(Rt,ut)||1;pe=Rt/Wt,ie=ut/Wt}let Z=new D(tn.clamp(ue.x+pe*.75,0,V-1),.74,tn.clamp(ue.y+ie*.75,0,he-1)),Be=-ie*.52,tt=pe*.52,lt=new D(-pe*.88+Be,.44,-ie*.88+tt).normalize(),at=Z.clone().addScaledVector(lt,4.45);Xe(at,Z,560)}else{let ae=(V-1)/2,pe=(he-1)/2,ie=new D(ae,.55,pe),Z=new D(Math.sin(A)*.92,.36,Math.cos(A)*.92).normalize();Xe(ie.clone().addScaledVector(Z,8.2),ie,540)}return}if(b==="skirmish"||b==="action"){let ne=(Le?.units||[]).filter(ue=>ue.alive!==!1);if(ne.length){let ue={x0:Math.max(-.7,Math.min(...ne.map(Z=>Z.x))-1.8),x1:Math.min(V-.3,Math.max(...ne.map(Z=>Z.x))+1.8),z0:Math.max(-.7,Math.min(...ne.map(Z=>Z.y))-1.8),z1:Math.min(he-.3,Math.max(...ne.map(Z=>Z.y))+1.8)},ae=new D(Math.sin(A)*.82,.72,Math.cos(A)*.82).normalize(),{pos:pe,target:ie}=Mt(ae,ue,.52);Xe(pe,ie,500);return}}if(b==="reverse"){Ht(Math.PI,480);return}let O=Math.hypot(.54,1.13);rn.set(Math.sin(A)*O,.92,Math.cos(A)*O).normalize();let{pos:Y,target:te}=Mt(rn);Xe(Y,te,500)}function Ht(b,C=400){if(Ee||Fe)return;let I=ft?ft.toTarget.clone():g.target.clone(),A=ft?ft.toPos.clone():f.position.clone(),O=A.clone().sub(I),Y=Math.max(.5,Math.hypot(O.x,O.z)),te=Math.atan2(O.x,O.z),ne=te+b,ue=new D(I.x+Math.sin(ne)*Y,A.y,I.z+Math.cos(ne)*Y);Xe(ue,I,C,{radius:Y,y:A.y,a0:te,a1:ne})}function bn(b,C=!1){if(Ee||Fe)return;let I=(Le?.units||[]).find(ae=>ae.id===b);if(!I)return;if(C){Vt("heroic",b);return}let A=f.position.clone().sub(g.target),O=A.length(),Y=A.y/Math.max(.1,O)>.92?new D(.54,.82,1.13).normalize():A.normalize(),te=Math.min(Math.max(O,5.8),9.2),ne=new D(I.x,.58,I.y),ue=ne.clone().addScaledVector(Y,te);Xe(ue,ne,460)}function Ze(){for(;S.children.length;)S.remove(S.children[0]);for(;Ut.length;)Ut.pop().dispose()}function wn({hoverCell:b=null,pathCells:C=null,arcFrom:I=null,arcTo:A=null,arcColor:O="#ffd478",areaCells:Y=null,areaColor:te="#ff7a3d"}={}){if(!(Ee||Fe)){if(Ze(),b&&Number.isInteger(b.x)&&Number.isInteger(b.y)){let ne=N(S,Me("hover-bracket",()=>{let ue=new Gs;ue.moveTo(-.47,-.47),ue.lineTo(.47,-.47),ue.lineTo(.47,.47),ue.lineTo(-.47,.47),ue.closePath();let ae=new ms;return ae.moveTo(-.42,-.42),ae.lineTo(-.42,.42),ae.lineTo(.42,.42),ae.lineTo(.42,-.42),ae.closePath(),ue.holes.push(ae),new Xr(ue)}),re(b.color||"#ffe194",.92),b.x,.068,b.y);ne.rotation.x=-Math.PI/2,ne.castShadow=!1}if(Array.isArray(Y)&&Y.length)for(let[ne,ue]of Y){let ae=N(S,ye,re(te,.36),ne,.067,ue,.88,.88,1);ae.rotation.x=-Math.PI/2,ae.castShadow=!1}if(Array.isArray(C)&&C.length>=2){let ne=C.map(([ie,Z])=>new D(ie,.11,Z)),ue=new Gr(ne,!1,"catmullrom",.15),ae=new qr(ue,Math.max(8,C.length*6),.042,8,!1);Ut.push(ae);let pe=new Jt(ae,re("#6af7df",.88));S.add(pe);for(let ie=1;ie<C.length;ie++){let[Z,Be]=C[ie],tt=N(S,L,re("#a8fff0",.92),Z,.1,Be,.11,.03,.11);tt.castShadow=!1}}if(I&&A){let ne=new D(I.x,1.02,I.y),ue=new D(A.x,.86,A.y),ae=ne.distanceTo(ue),pe=ne.clone().lerp(ue,.5);pe.y+=Math.min(2.6,.65+ae*.24);let ie=new Hs(ne,pe,ue),Z=new qr(ie,28,.036,8,!1);Ut.push(Z),S.add(new Jt(Z,re(O,.86)));let Be=fe(S,we,re(O,.95),.075);Be.position.x=A.x,Be.position.z=A.y,Be.scale.setScalar(1.08)}xt()}}function Nt(b){x=b==="auto"?null:b,Le&&(et="",Je(Le,{snap:!0,ordered:!0,inspectedId:Ft}))}function Ni(b){m=!!b&&!p,m&&xt()}function Sn(b){y=b,xt()}function ws(b,C,I){return f.updateMatrixWorld(),Pt.set(b,C,I).project(f),{x:(Pt.x+1)*a.clientWidth/2,y:(1-Pt.y)*a.clientHeight/2,visible:Pt.z>-1&&Pt.z<1&&Math.abs(Pt.x)<=1&&Math.abs(Pt.y)<=1}}function yi(b,C){return ws(b,.055,C)}function Ui(b){let C=W.get(b);return C?ws(C.data.x,.65,C.data.y):null}function Et(){if(Ee||Fe)return;let b=Math.max(1,s.clientWidth),C=Math.max(1,s.clientHeight);l.setPixelRatio(Math.min(window.devicePixelRatio||1,d)),l.setSize(b,C,!1);let I=b/C,A=f.aspect;f.aspect=I,f.updateProjectionMatrix(),!X&&Le?(X=!0,Zt(!1)):Le&&Math.abs(Math.log(I/A))>.25?Zt(!1):xt()}function hn(){Ee||Fe||(g.target.x=tn.clamp(g.target.x,-1,V),g.target.z=tn.clamp(g.target.z,-1,he),g.target.y=tn.clamp(g.target.y,0,1.5),n?.(bt()),xt())}let Cn=0;function xt(){!_e&&!Ee&&!Fe&&!document.hidden&&(_e=requestAnimationFrame(Nm))}function $t(){let b=rt;rt=null;for(let C of W.values())C.data.alive&&C.rig.reset();zt.clear(),Um(),b?.resolve(!1),sn&&ee()}function hi(b,C={}){if(Ee||Fe||document.hidden)return Promise.resolve(!1);rt&&$t();let I=pt(b);return p?(zt.play(I,performance.now()),C.impact?.(),Promise.resolve(!0)):new Promise(A=>{let O=I.find(pe=>pe.source_id===b.source_id&&pe.style!=="touch")||I[0]||null,Y=O?.style||null,te=b.kind==="dash"||(b.moves||[]).some(pe=>pe.path.length>=6),ne=te?200:320,ue=(b.moves||[]).reduce((pe,ie)=>pe+Math.max(0,ie.path.length-1),0),ae=new Set;for(let pe of b.after?.units||[])(b.before?.units||[]).find(Z=>Z.id===pe.id)?.alive&&!pe.alive&&ae.add(pe.id);rt={action:b,events:I,primary:O,callbacks:C,resolve:A,style:Y,stepMs:ne,isDash:te,newlyDead:ae,start:null,impacted:!1,duration:Y?um(Y):ue?ue*ne:220},xt()})}function Fa(b){let C=rt;if(!C)return!1;if(C.start===null){C.start=b;let te=W.get(C.action.source_id),ne=C.primary;if(te&&ne){let ue=ne.target.x-ne.source.x,ae=ne.target.y-ne.source.y;(ue||ae)&&(te.body.rotation.y=Math.atan2(-ue,-ae),te.targetYaw=te.body.rotation.y),te.rig.pose(C.style,Uu,C.action.kind),te.root.updateWorldMatrix(!0,!0);let pe=new D;(C.style==="arrow"?te.rig.bow:C.style==="dreadful_glare"&&te.rig.head||te.rig.right).getWorldPosition(pe),zt.play(C.events,b,{releaseAt:Uu,impactAt:Gc(C.style)},pe.toArray())}else C.events.length&&zt.play(C.events,b,{releaseAt:80,impactAt:220})}let I=b-C.start,A=W.get(C.action.source_id);A&&C.style&&A.rig.pose(C.style,I,C.action.kind);let O=I;for(let te of C.action.moves||[]){let ne=W.get(te.source_id),ue=te.path,ae=Math.max(0,ue.length-1)*C.stepMs;if(ne&&ue.length&&O>=0){let pe=Math.min(ue.length-1,Math.floor(O/C.stepMs)),ie=Math.min(ue.length-1,pe+1),Z=pe===ie?0:O%C.stepMs/C.stepMs,[Be,tt]=ue[pe],[lt,at]=ue[ie];if(ne.root.position.set(Be+(lt-Be)*Z,.04,tt+(at-tt)*Z),lt!==Be||at!==tt){let ct=Math.atan2(Be-lt,tt-at);ne.body.rotation.y=JM(ne.body.rotation.y,ct,.36),ne.targetYaw=ct}O<=ae?ne.rig.walk?.(O,C.isDash):ne.rig.idle?.(b),C.lastStep!==`${te.source_id}:${pe}`&&(C.lastStep=`${te.source_id}:${pe}`,La(Be,tt),C.callbacks.step?.(te.source_id,Be,tt))}O-=ae}let Y=C.style?Gc(C.style):C.duration;for(let te of C.events)if(te.outcome==="hit"&&te.amount>0&&te.target_id!==C.action.source_id){let ne=W.get(te.target_id);ne&&I>=Y&&(C.newlyDead.has(te.target_id)?(ne.body.visible=!0,ne.rig.death?.(I-Y)):ne.rig.hit?.(I-Y))}if(!C.impacted&&I>=Y){C.impacted=!0,C.callbacks.impact?.();for(let te of C.newlyDead){let ne=W.get(te);ne&&ne.rig.isSkinned&&(ne.body.visible=!0)}}if(l.shadowMap.needsUpdate=!0,I>=C.duration){for(let[te,ne]of W)ne.data.alive?ne.rig.reset():ne.data.team!=="heroes"?ne.body.visible=!1:ne.rig.death?.(9999);return rt=null,C.resolve(!0),sn&&ee(),!1}return!0}function Nm(b){if(_e=0,Ee||Fe)return;let C=!1;if(ft){let A=tn.clamp((b-ft.t0)/Math.max(1,ft.dur),0,1),O=1-Math.pow(1-A,3);if(g.target.lerpVectors(ft.fromTarget,ft.toTarget,O),ft.orbitArc){let Y=ft.orbitArc.a0+(ft.orbitArc.a1-ft.orbitArc.a0)*O;f.position.set(g.target.x+Math.sin(Y)*ft.orbitArc.radius,ft.orbitArc.y,g.target.z+Math.cos(Y)*ft.orbitArc.radius)}else f.position.lerpVectors(ft.fromPos,ft.toPos,O);A>=1?ft=null:C=!0}g.update(),C=Fa(b)||C;let I=!1;for(let A of W.values())if(A.moveEnd>0){I=!0;let O=A.moveEnd===A.moveStart?1:tn.clamp((b-A.moveStart)/(A.moveEnd-A.moveStart),0,1),Y=O*O*(3-2*O);A.root.position.lerpVectors(A.start,A.end,Y),A.rig.walk?.(b-A.moveStart,!1),O>=1?(A.moveEnd=0,A.rig.reset()):C=!0}else if(m&&!rt&&A.data.alive&&A.rig.isSkinned){let O=(A.data.conditions||[]).includes("dodge");A.rig.idle(b,O)}if((m||rt)&&me.length)for(let A of me){let O=Math.sin(b*.011+A.phase)*.14+Math.cos(b*.023+A.phase*1.7)*.08;A.flame.scale.y=A.baseScaleY*(1+O),A.flame.rotation.z=Math.sin(b*.008+A.phase)*.14,A.light&&(A.light.intensity=A.baseIntensity*(1+O*.55))}for(let A=J.length-1;A>=0;A--){let O=J[A],Y=(b-O.born)/420;Y>=1?(O.mesh.removeFromParent(),O.mat.dispose(),J.splice(A,1)):(O.mesh.position.y=.08+Y*.18,O.mesh.scale.setScalar(.06+Y*.1),O.mat.opacity=.42*(1-Y),C=!0)}if(m||rt){for(let A of G.values())A.g.position.y=1.05+Math.sin(b*.004)*.06,A.g.rotation.y=b*.0018;for(let A of le){let O=b*.001*A.speed+A.phase,Y=(A.yOffset+b*18e-5*A.speed)%2.15;A.mesh.position.y=.16+Y,A.mesh.position.x=A.baseX+Math.sin(O)*.24,A.mesh.position.z=A.baseZ+Math.cos(O*.85)*.24;let te=Math.sin(Y/2.15*Math.PI);A.mat.opacity=.12+te*.42}}C=zt.tick(b,f,a.clientHeight)||C,Oa(),I&&(l.shadowMap.needsUpdate=!0),l.render(h,f),!ce&&Le&&(ce=!0,i?.(bt())),C?xt():m&&(clearTimeout(Cn),Cn=setTimeout(xt,QM))}function Md(){let b=[];for(let C of W.values())C.picker.visible&&C.root.visible&&b.push(C.picker);return b}function bd(b){if(Ne.add(b.pointerId),Ne.size!==1){ve=null,ft=null;return}ve=b.isPrimary&&b.button===0?{id:b.pointerId,x:b.clientX,y:b.clientY,time:performance.now(),dragged:!1}:null,b.button!==0&&(ft=null)}function Sd(b){if(ve?.id===b.pointerId&&Math.hypot(b.clientX-ve.x,b.clientY-ve.y)>5&&(ve.dragged=!0,ft=null),Ne.size||!t||!Le||Ee||Fe)return;let C=a.getBoundingClientRect();if(b.clientX<C.left||b.clientX>C.right||b.clientY<C.top||b.clientY>C.bottom)return;Ke.set((b.clientX-C.left)/C.width*2-1,1-(b.clientY-C.top)/C.height*2),f.updateMatrixWorld(),h.updateMatrixWorld(!0),je.setFromCamera(Ke,f);let I=je.intersectObjects(Md(),!1).find(A=>A.object.userData.unitId!=null);if(I){let A=W.get(I.object.userData.unitId);if(A){let O=`u:${A.data.id}:${b.clientX>>2}:${b.clientY>>2}`;O!==It&&(It=O,t({x:A.data.x,y:A.data.y,unitId:A.data.id,clientX:b.clientX,clientY:b.clientY}));return}}if(je.ray.intersectPlane(st,gt)){let A=Math.floor(gt.x+.5),O=Math.floor(gt.z+.5);if(A>=0&&O>=0&&A<V&&O<he){let Y=(Le.units||[]).find(ue=>ue.x===A&&ue.y===O&&ue.alive!==!1),te=(Le.objects||[]).find(ue=>!ue.destroyed&&Du(ue,A,O)),ne=`c:${A}:${O}:${Y?.id||te?.id||""}:${b.clientX>>2}:${b.clientY>>2}`;ne!==It&&(It=ne,t({x:A,y:O,unitId:Y?.id||te?.id||null,clientX:b.clientX,clientY:b.clientY}));return}}It!=="none"&&(It="none",t(null))}function Ed(){It!=="none"&&(It="none",t?.(null))}function Td(){ft=null}function wd(b){Ne.delete(b.pointerId);let C=ve;if(ve=null,!C||C.id!==b.pointerId||C.dragged||Ne.size||Ie||!Le||Ee||Fe||Math.hypot(b.clientX-C.x,b.clientY-C.y)>6||performance.now()-C.time>700)return;let I=a.getBoundingClientRect();if(b.clientX<I.left||b.clientX>I.right||b.clientY<I.top||b.clientY>I.bottom)return;Ke.set((b.clientX-I.left)/I.width*2-1,1-(b.clientY-I.top)/I.height*2),f.updateMatrixWorld(),h.updateMatrixWorld(!0),je.setFromCamera(Ke,f);let O=je.intersectObjects(Md(),!1).find(pe=>pe.object.userData.unitId!=null);if(O){let pe=W.get(O.object.userData.unitId);if(pe){e?.(pe.data.x,pe.data.y,pe.data.id);return}}let Y=je.intersectObject(v,!0).find(pe=>pe.object.userData.objectId!=null&&pe.object.parent?.visible!==!1);if(Y){let pe=(Le.objects||[]).find(ie=>ie.id===Y.object.userData.objectId&&!ie.destroyed);if(pe){e?.(pe.x,pe.y,pe.id);return}}if(!je.ray.intersectPlane(st,gt))return;let te=Math.floor(gt.x+.5),ne=Math.floor(gt.z+.5);if(te<0||ne<0||te>=V||ne>=he)return;let ue=(Le.units||[]).find(pe=>pe.x===te&&pe.y===ne),ae=(Le.objects||[]).find(pe=>!pe.destroyed&&Du(pe,te,ne));e?.(te,ne,ue?.id||ae?.id)}function Ad(b){Ne.delete(b.pointerId),ve=null}function Rd(b){b?.preventDefault(),!(Fe||Ee)&&(Fe=!0,cancelAnimationFrame(_e),clearTimeout(Cn),_e=0,$t(),zt.dispose(),g.enabled=!1,s.dataset.renderer="unavailable",a.dataset.renderer="unavailable",r?.("The WebGL context was lost.",{lost:!0}))}function Um(){for(let b of W.values())b.moveEnd&&(b.root.position.copy(b.end),b.moveEnd=0);l.shadowMap.needsUpdate=!0}function Cd(b){p=b.matches,p&&(m=!1),zt.setReducedMotion(p),p&&$t(),xt()}function Pd(){zt.setHidden(document.hidden),document.hidden?(cancelAnimationFrame(_e),_e=0,$t()):xt()}g.addEventListener("change",hn),a.addEventListener("pointerdown",bd,{capture:!0}),a.addEventListener("pointermove",Sd,{capture:!0}),a.addEventListener("pointerleave",Ed),a.addEventListener("wheel",Td,{passive:!0}),window.addEventListener("pointerup",wd),window.addEventListener("pointercancel",Ad),a.addEventListener("webglcontextlost",Rd),_?.addEventListener?.("change",Cd),document.addEventListener("visibilitychange",Pd);let Id=typeof ResizeObserver=="function"?new ResizeObserver(Et):null;Id?.observe(s),window.addEventListener("resize",Et);function Om(){if(!Ee){Ee=!0,cancelAnimationFrame(_e),clearTimeout(Cn),Id?.disconnect(),Ue(),$t(),Ze(),zt.dispose(),g.removeEventListener("change",hn),g.dispose(),a.removeEventListener("pointerdown",bd,{capture:!0}),a.removeEventListener("pointermove",Sd,{capture:!0}),a.removeEventListener("pointerleave",Ed),a.removeEventListener("wheel",Td),window.removeEventListener("pointerup",wd),window.removeEventListener("pointercancel",Ad),a.removeEventListener("webglcontextlost",Rd),window.removeEventListener("resize",Et),document.removeEventListener("visibilitychange",Pd),_?.removeEventListener?.("change",Cd);for(let b of J)b.mesh.removeFromParent(),b.mat.dispose();J.length=0,or();for(let b of W.values())De(b);W.clear(),U.forEach(b=>b.dispose()),q.forEach(b=>b.dispose()),$.forEach(b=>b.dispose()),v.traverse(b=>{b.isInstancedMesh&&b.dispose()}),h.traverse(b=>{b.isLight&&b.dispose()}),h.clear(),l.dispose(),l.forceContextLoss(),a.remove(),(s.dataset.renderer==="webgl"||s.dataset.renderer==="unavailable")&&delete s.dataset.renderer}}return Et(),Zt(!1),{update:Je,playAction:hi,cancelPlayback:$t,resetCamera:Zt,setCameraPreset:Vt,orbitBy:Ht,focusUnit:bn,setTacticalPreview:wn,clearHoverPreview:Ze,setBiome:Nt,getActiveTheme:()=>Se,setIdleLoop:Ni,setLabelMode:Sn,resize:Et,dispose:Om,getCameraState:bt,getAssetState:Zc,getEffectState:zt.getState,projectCell:yi,projectUnit:Ui,renderer:l,canvas:a,scene:h,camera:f,controls:g}}return Vm(tb);})();
