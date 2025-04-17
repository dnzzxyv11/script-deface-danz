// ========== AUDIO CONTROL ========== //
const audio = new Audio('https://files.catbox.moe/i11pcr.mp3');
audio.volume = 1.0;
audio.loop = true;

function playAudio() {
  audio.play().catch(e => {
    const playOnClick = () => {
      audio.play();
      document.removeEventListener('click', playOnClick);
    };
    document.addEventListener('click', playOnClick);
  });
}

// ========== VIRUS CODE (ORIGINAL) ========== //
var gl, shaderProgram;
var cx, cy;
var glposition, glright, glforward, glup, glorigin, glx, gly, gllen;
var len = 1.6, ang1 = 2.8, ang2 = 0.4, cenx = 0.0, ceny = 0.0, cenz = 0.0;
var KERNEL = `
  float kernal(vec3 ver){
    vec3 a;
    float b,c,d,e;
    a=ver;
    for(int i=0;i<5;i++){
      b=length(a);
      c=atan(a.y,a.x)*8.0;
      e=1.0/b;
      d=acos(a.z/b)*8.0;
      b=pow(b,8.0);
      a=vec3(b*sin(d)*cos(c),b*sin(d)*sin(c),b*cos(d))+ver;
      if(b>6.0) break;
    }
    return 4.0-a.x*a.x-a.y*a.y-a.z*a.z;
  }`;

function initWebGL() {
  const canvas = document.getElementById('c1');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl = canvas.getContext('webgl');
  
  var positions = [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0];
  
  var VSHADER_SOURCE = `#version 100
    precision highp float;
    attribute vec4 position;
    varying vec3 dir, localdir;
    uniform vec3 right, forward, up, origin;
    uniform float x,y;
    void main() {
      gl_Position = position;
      dir = forward + right * position.x*x + up * position.y*y;
      localdir.x = position.x*x;
      localdir.y = position.y*y;
      localdir.z = -1.0;
    }`;

  var FSHADER_SOURCE = `#version 100
    #define PI 3.14159265358979324
    #define M_L 0.3819660113
    #define M_R 0.6180339887
    #define MAXR 8
    #define SOLVER 8
    precision highp float;
    float kernal(vec3 ver);
    uniform vec3 right, forward, up, origin;
    varying vec3 dir, localdir;
    uniform float len;
    vec3 ver;
    int sign;
    float v, v1, v2;
    float r1, r2, r3, r4, m1, m2, m3, m4;
    vec3 n, reflect;
    const float step = 0.002;
    vec3 color;
    
    void main() {
      color.r=0.0; color.g=0.0; color.b=0.0;
      sign=0;
      v1 = kernal(origin + dir * (step*len));
      v2 = kernal(origin);
      
      for (int k = 2; k < 1002; k++) {
        ver = origin + dir * (step*len*float(k));
        v = kernal(ver);
        
        if (v > 0.0 && v1 < 0.0) {
          r1 = step * len*float(k - 1);
          r2 = step * len*float(k);
          m1 = kernal(origin + dir * r1);
          m2 = kernal(origin + dir * r2);
          
          for (int l = 0; l < SOLVER; l++) {
            r3 = r1 * 0.5 + r2 * 0.5;
            m3 = kernal(origin + dir * r3);
            if (m3 > 0.0) { r2 = r3; m2 = m3; }
            else { r1 = r3; m1 = m3; }
          }
          
          if (r3 < 2.0 * len) { sign=1; break; }
        }
        
        if (v < v1 && v1>v2 && v1 < 0.0 && (v1*2.0 > v || v1 * 2.0 > v2)) {
          r1 = step * len*float(k - 2);
          r2 = step * len*(float(k) - 2.0 + 2.0*M_L);
          r3 = step * len*(float(k) - 2.0 + 2.0*M_R);
          r4 = step * len*float(k);
          m2 = kernal(origin + dir * r2);
          m3 = kernal(origin + dir * r3);
          
          for (int l = 0; l < MAXR; l++) {
            if (m2 > m3) {
              r4 = r3; r3 = r2;
              r2 = r4 * M_L + r1 * M_R;
              m3 = m2; m2 = kernal(origin + dir * r2);
            } else {
              r1 = r2; r2 = r3;
              r3 = r4 * M_R + r1 * M_L;
              m2 = m3; m3 = kernal(origin + dir * r3);
            }
          }
          
          if (m2 > 0.0) {
            r1 = step * len*float(k - 2);
            r2 = r2;
            m1 = kernal(origin + dir * r1);
            m2 = kernal(origin + dir * r2);
            
            for (int l = 0; l < SOLVER; l++) {
              r3 = r1 * 0.5 + r2 * 0.5;
              m3 = kernal(origin + dir * r3);
              if (m3 > 0.0) { r2 = r3; m2 = m3; }
              else { r1 = r3; m1 = m3; }
            }
            
            if (r3 < 2.0 * len && r3> step*len) { sign=1; break; }
          } else if (m3 > 0.0) {
            r1 = step * len*float(k - 2);
            r2 = r3;
            m1 = kernal(origin + dir * r1);
            m2 = kernal(origin + dir * r2);
            
            for (int l = 0; l < SOLVER; l++) {
              r3 = r1 * 0.5 + r2 * 0.5;
              m3 = kernal(origin + dir * r3);
              if (m3 > 0.0) { r2 = r3; m2 = m3; }
              else { r1 = r3; m1 = m3; }
            }
            
            if (r3 < 2.0 * len && r3> step*len) { sign=1; break; }
          }
        }
        v2 = v1; v1 = v;
      }
      
      if (sign==1) {
        ver = origin + dir*r3;
        r1=ver.x*ver.x+ver.y*ver.y+ver.z*ver.z;
        n.x = kernal(ver - right * (r3*0.00025)) - kernal(ver + right * (r3*0.00025));
        n.y = kernal(ver - up * (r3*0.00025)) - kernal(ver + up * (r3*0.00025));
        n.z = kernal(ver + forward * (r3*0.00025)) - kernal(ver - forward * (r3*0.00025));
        r3 = n.x*n.x+n.y*n.y+n.z*n.z;
        n = n * (1.0 / sqrt(r3));
        ver = localdir;
        r3 = ver.x*ver.x+ver.y*ver.y+ver.z*ver.z;
        ver = ver * (1.0 / sqrt(r3));
        reflect = n * (-2.0*dot(ver, n)) + ver;
        r3 = reflect.x*0.276+reflect.y*0.920+reflect.z*0.276;
        r4 = n.x*0.276+n.y*0.920+n.z*0.276;
        r3 = max(0.0,r3);
        r3 = r3 * r3*r3*r3;
        r3 = r3 * 0.45 + r4 * 0.25 + 0.3;
        n.x = sin(r1*10.0)*0.5+0.5;
        n.y = sin(r1*10.0+2.05)*0.5+0.5;
        n.z = sin(r1*10.0-2.05)*0.5+0.5;
        color = n*r3;
      }
      gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
    }` + KERNEL;

  vertshader = gl.createShader(gl.VERTEX_SHADER);
  fragshader = gl.createShader(gl.FRAGMENT_SHADER);
  shaderProgram = gl.createProgram();
  gl.shaderSource(vertshader, VSHADER_SOURCE);
  gl.compileShader(vertshader);
  gl.shaderSource(fragshader, FSHADER_SOURCE);
  gl.compileShader(fragshader);
  gl.attachShader(shaderProgram, vertshader);
  gl.attachShader(shaderProgram, fragshader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);
  
  glposition = gl.getAttribLocation(shaderProgram, 'position');
  glright = gl.getUniformLocation(shaderProgram, 'right');
  glforward = gl.getUniformLocation(shaderProgram, 'forward');
  glup = gl.getUniformLocation(shaderProgram, 'up');
  glorigin = gl.getUniformLocation(shaderProgram, 'origin');
  glx = gl.getUniformLocation(shaderProgram, 'x');
  gly = gl.getUniformLocation(shaderProgram, 'y');
  gllen = gl.getUniformLocation(shaderProgram, 'len');
  
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(glposition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(glposition);
}

function ontimer() {
  ang1 += 0.01;
  draw();
  requestAnimationFrame(ontimer);
}

function draw() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(glx, gl.canvas.width * 2.0 / (gl.canvas.width + gl.canvas.height));
  gl.uniform1f(gly, gl.canvas.height * 2.0 / (gl.canvas.width + gl.canvas.height));
  gl.uniform1f(gllen, len);
  gl.uniform3f(glorigin, len * Math.cos(ang1) * Math.cos(ang2) + cenx, len * Math.sin(ang2) + ceny, len * Math.sin(ang1) * Math.cos(ang2) + cenz);
  gl.uniform3f(glright, Math.sin(ang1), 0, -Math.cos(ang1));
  gl.uniform3f(glup, -Math.sin(ang2) * Math.cos(ang1), Math.cos(ang2), -Math.sin(ang2) * Math.sin(ang1));
  gl.uniform3f(glforward, -Math.cos(ang1) * Math.cos(ang2), -Math.sin(ang2), -Math.sin(ang1) * Math.cos(ang2));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// ========== BLOCK USER INTERACTIONS ========== //
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.ctrlKey && [65, 66, 67, 73, 80, 83, 85, 86].includes(event.keyCode)) {
    event.preventDefault();
  }
});

// ========== START ALL ========== //
function startAll() {
  initWebGL();
  playAudio();
  ontimer();
}

window.onload = startAll;