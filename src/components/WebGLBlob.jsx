import React, { useEffect, useRef } from 'react';

const WebGLBlob = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Vertex Shader (simple screen pass)
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Raymarched morphing 3D noise blob with lighting and color gradients)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // 3D Noise functions for organic morphing
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // Rotate geometry
      mat3 rotationMatrix(vec3 axis, float angle) {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        return mat3(
          oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
          oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
          oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
        );
      }

      // Distance estimator for Raymarching (the core shape function)
      float distanceEstimator(vec3 p) {
        // Apply slow rotation
        p = rotationMatrix(vec3(0.5, 1.0, 0.2), u_time * 0.15) * p;

        // Shape morphing distortion via 3D noise
        float noise = snoise(p * 1.5 + vec3(0.0, 0.0, u_time * 0.45));
        float noiseSecondary = snoise(p * 4.0 - vec3(u_time * 0.2, u_time * 0.1, 0.0));
        
        // Sphere shape base
        float sphereBase = length(p) - 1.25;

        // Mouse displacement
        vec3 mouseTarget = vec3((u_mouse.x - 0.5) * 2.0, (u_mouse.y - 0.5) * -2.0, 0.0);
        float distToMouse = length(p - mouseTarget);
        float attraction = smoothstep(2.5, 0.0, distToMouse) * 0.25;

        return sphereBase - (noise * 0.25 + noiseSecondary * 0.08) - attraction;
      }

      // Compute normals for light calculations
      vec3 getNormal(vec3 p) {
        const float eps = 0.001;
        return normalize(vec3(
          distanceEstimator(vec3(p.x + eps, p.y, p.z)) - distanceEstimator(vec3(p.x - eps, p.y, p.z)),
          distanceEstimator(vec3(p.x, p.y + eps, p.z)) - distanceEstimator(vec3(p.x, p.y - eps, p.z)),
          distanceEstimator(vec3(p.x, p.y, p.z + eps)) - distanceEstimator(vec3(p.x, p.y, p.z - eps))
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

        // Raycasting vectors
        vec3 rayOrigin = vec3(0.0, 0.0, 3.5);
        vec3 rayDir = normalize(vec3(uv, -1.0));

        // Raymarching loop
        float distTravelled = 0.0;
        vec3 currentPos = rayOrigin;
        bool hit = false;
        
        for (int i = 0; i < 75; i++) {
          float dist = distanceEstimator(currentPos);
          if (dist < 0.001) {
            hit = true;
            break;
          }
          if (distTravelled > 8.0) {
            break;
          }
          distTravelled += dist;
          currentPos = rayOrigin + rayDir * distTravelled;
        }

        // Output color calculation
        vec4 color = vec4(0.0); // Transparent background

        if (hit) {
          vec3 normal = getNormal(currentPos);
          
          // Light positioning
          vec3 lightPos1 = vec3(2.5, 3.5, 4.0);
          vec3 lightPos2 = vec3(-3.0, -2.0, 2.0);
          
          vec3 lightDir1 = normalize(lightPos1 - currentPos);
          vec3 lightDir2 = normalize(lightPos2 - currentPos);
          vec3 viewDir = normalize(rayOrigin - currentPos);

          // Diffuse component
          float diff1 = max(dot(normal, lightDir1), 0.0);
          float diff2 = max(dot(normal, lightDir2), 0.0);

          // Specular (reflection highlight) component
          vec3 reflectDir1 = reflect(-lightDir1, normal);
          float spec1 = pow(max(dot(viewDir, reflectDir1), 0.0), 32.0);

          // Dynamic metallic/neon gradient colors
          vec3 baseColor1 = vec3(0.38, 0.40, 0.94); // Indigo (#6366f1)
          vec3 baseColor2 = vec3(0.66, 0.33, 0.97); // Violet (#a855f7)
          vec3 highlightColor = vec3(0.96, 0.25, 0.70); // Glowing magenta

          // Blend colors based on normal vectors and lighting
          vec3 surfaceColor = mix(baseColor1, baseColor2, normal.y * 0.5 + 0.5);
          surfaceColor += highlightColor * (normal.z * 0.3);

          // Apply Phong Lighting model
          vec3 finalColor = surfaceColor * (diff1 * 0.7 + diff2 * 0.3 + 0.2); // Diffuse + Ambient
          finalColor += vec3(1.0) * spec1 * 0.9; // Specular Highlights
          
          // Add subtle outer atmospheric glow
          float glow = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
          finalColor += highlightColor * glow * 0.4;

          color = vec4(finalColor, 0.92);
        } else {
          // Transparent empty space
          discard;
        }

        gl_FragColor = color;
      }
    `;

    // Shader compiler helper
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compiler failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed:', gl.getProgramInfoLog(program));
      return;
    }

    // Geometry buffer
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    // Uniform locations
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    gl.uniform2f(resLoc, width, height);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    // Render loop
    let startTime = Date.now();
    let animFrame;

    function render() {
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLoc, (Date.now() - startTime) * 0.001);
      gl.uniform2f(mouseLoc, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animFrame = requestAnimationFrame(render);
    }

    render();

    // Interaction Listeners
    const handleMouseMove = (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = e.clientY / window.innerHeight;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX / window.innerWidth;
        targetMouseY = e.touches[0].clientY / window.innerHeight;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.uniform2f(resLoc, width, height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-1"
      style={{ mixBlendMode: 'screen', opacity: 0.85 }}
    />
  );
};

export default WebGLBlob;
