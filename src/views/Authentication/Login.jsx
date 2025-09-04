import React, {useState, useEffect, useRef} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/script/AuthContext";


import styles from "./Login.module.css"

import { Renderer, Program, Mesh, Color, Triangle } from "ogl";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0); // Center in UV space
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha); // Enhance contrast
    alpha = min(alpha, 1.0); // Clamp to maximum 1.0
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

function Galaxy({
                                   focal = [0.7, 0.7],
                                   rotation = [1.0, 0.0],
                                   starSpeed = 0.3,
                                   density = 0.5,
                                   hueShift = 0,
                                   disableAnimation = false,
                                   speed = 1.0,
                                   mouseInteraction = false,
                                   glowIntensity = 0.2,
                                   saturation = 0.0,
                                   mouseRepulsion = false,
                                   repulsionStrength = 0,
                                   twinkleIntensity = 0.5,
                                   rotationSpeed = 0,
                                   autoCenterRepulsion = 0,
                                   transparent = false,
                                   ...rest
                               }) {
    const ctnDom = useRef(null);
    const targetMousePos = useRef({ x: 0.5, y: 0.5 });
    const smoothMousePos = useRef({ x: 0.5, y: 0.5 });
    const targetMouseActive = useRef(0.0);
    const smoothMouseActive = useRef(0.0);

    useEffect(() => {
        if (!ctnDom.current) return;
        const ctn = ctnDom.current;
        const renderer = new Renderer({
            alpha: transparent,
            premultipliedAlpha: false,
        });
        const gl = renderer.gl;

        if (transparent) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clearColor(0, 0, 0, 0);
        } else {
            gl.clearColor(0, 0, 0, 1);
        }

        let program;

        function resize() {
            const scale = 1;
            renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
            if (program) {
                program.uniforms.uResolution.value = new Color(
                    gl.canvas.width,
                    gl.canvas.height,
                    gl.canvas.width / gl.canvas.height
                );
            }
        }
        window.addEventListener("resize", resize, false);
        resize();

        const geometry = new Triangle(gl);
        program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Color(
                        gl.canvas.width,
                        gl.canvas.height,
                        gl.canvas.width / gl.canvas.height
                    ),
                },
                uFocal: { value: new Float32Array(focal) },
                uRotation: { value: new Float32Array(rotation) },
                uStarSpeed: { value: starSpeed },
                uDensity: { value: density },
                uHueShift: { value: hueShift },
                uSpeed: { value: speed },
                uMouse: {
                    value: new Float32Array([
                        smoothMousePos.current.x,
                        smoothMousePos.current.y,
                    ]),
                },
                uGlowIntensity: { value: glowIntensity },
                uSaturation: { value: saturation },
                uMouseRepulsion: { value: mouseRepulsion },
                uTwinkleIntensity: { value: twinkleIntensity },
                uRotationSpeed: { value: rotationSpeed },
                uRepulsionStrength: { value: repulsionStrength },
                uMouseActiveFactor: { value: 0.0 },
                uAutoCenterRepulsion: { value: autoCenterRepulsion },
                uTransparent: { value: transparent },
            },
        });

        const mesh = new Mesh(gl, { geometry, program });
        let animateId;

        function update(t) {
            animateId = requestAnimationFrame(update);
            if (!disableAnimation) {
                program.uniforms.uTime.value = t * 0.001;
                program.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed) / 10.0;
            }

            const lerpFactor = 0.05;
            smoothMousePos.current.x +=
                (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor;
            smoothMousePos.current.y +=
                (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor;

            smoothMouseActive.current +=
                (targetMouseActive.current - smoothMouseActive.current) * lerpFactor;

            program.uniforms.uMouse.value[0] = smoothMousePos.current.x;
            program.uniforms.uMouse.value[1] = smoothMousePos.current.y;
            program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

            renderer.render({ scene: mesh });
        }
        animateId = requestAnimationFrame(update);
        ctn.appendChild(gl.canvas);

        function handleMouseMove(e) {
            const rect = ctn.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            targetMousePos.current = { x, y };
            targetMouseActive.current = 1.0;
        }

        function handleMouseLeave() {
            targetMouseActive.current = 0.0;
        }

        if (mouseInteraction) {
            ctn.addEventListener("mousemove", handleMouseMove);
            ctn.addEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            cancelAnimationFrame(animateId);
            window.removeEventListener("resize", resize);
            if (mouseInteraction) {
                ctn.removeEventListener("mousemove", handleMouseMove);
                ctn.removeEventListener("mouseleave", handleMouseLeave);
            }
            ctn.removeChild(gl.canvas);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [
        focal,
        rotation,
        starSpeed,
        density,
        hueShift,
        disableAnimation,
        speed,
        mouseInteraction,
        glowIntensity,
        saturation,
        mouseRepulsion,
        twinkleIntensity,
        rotationSpeed,
        repulsionStrength,
        autoCenterRepulsion,
        transparent,
    ]);

    return <div ref={ctnDom} className={styles['galaxy-container']} {...rest} />;
}








const DEFAULT_COLOR = "#ffffff";

const hexToRgb = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255,
        ]
        : [1, 1, 1];
};

const getAnchorAndDir = (origin, w, h) => {
    const outside = 0.2;
    switch (origin) {
        case "top-left":
            return { anchor: [0, -outside * h], dir: [0, 1] };
        case "top-right":
            return { anchor: [w, -outside * h], dir: [0, 1] };
        case "left":
            return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
        case "right":
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case "bottom-left":
            return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
        case "bottom-center":
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case "bottom-right":
            return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
        default: // "top-center"
            return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
};

const LightRays = ({
                       raysOrigin = "top-center",
                       raysColor = DEFAULT_COLOR,
                       raysSpeed = 1,
                       lightSpread = 1,
                       rayLength = 2,
                       pulsating = false,
                       fadeDistance = 1.0,
                       saturation = 1.0,
                       followMouse = true,
                       mouseInfluence = 0.1,
                       noiseAmount = 0.0,
                       distortion = 0.0,
                       className = "",
                   }) => {
    const containerRef = useRef(null);
    const uniformsRef = useRef(null);
    const rendererRef = useRef(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
    const animationIdRef = useRef(null);
    const meshRef = useRef(null);
    const cleanupFunctionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(containerRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        if (cleanupFunctionRef.current) {
            cleanupFunctionRef.current();
            cleanupFunctionRef.current = null;
        }

        const initializeWebGL = async () => {
            if (!containerRef.current) return;

            await new Promise((resolve) => setTimeout(resolve, 10));

            if (!containerRef.current) return;

            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true,
            });
            rendererRef.current = renderer;

            const gl = renderer.gl;
            gl.canvas.style.width = "100%";
            gl.canvas.style.height = "100%";

            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            containerRef.current.appendChild(gl.canvas);

            const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

            const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

            const uniforms = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },

                rayPos: { value: [0, 0] },
                rayDir: { value: [0, 1] },

                raysColor: { value: hexToRgb(raysColor) },
                raysSpeed: { value: raysSpeed },
                lightSpread: { value: lightSpread },
                rayLength: { value: rayLength },
                pulsating: { value: pulsating ? 1.0 : 0.0 },
                fadeDistance: { value: fadeDistance },
                saturation: { value: saturation },
                mousePos: { value: [0.5, 0.5] },
                mouseInfluence: { value: mouseInfluence },
                noiseAmount: { value: noiseAmount },
                distortion: { value: distortion },
            };
            uniformsRef.current = uniforms;

            const geometry = new Triangle(gl);
            const program = new Program(gl, {
                vertex: vert,
                fragment: frag,
                uniforms,
            });
            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;

            const updatePlacement = () => {
                if (!containerRef.current || !renderer) return;

                renderer.dpr = Math.min(window.devicePixelRatio, 2);

                const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
                renderer.setSize(wCSS, hCSS);

                const dpr = renderer.dpr;
                const w = wCSS * dpr;
                const h = hCSS * dpr;

                uniforms.iResolution.value = [w, h];

                const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
                uniforms.rayPos.value = anchor;
                uniforms.rayDir.value = dir;
            };

            const loop = (t) => {
                if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
                    return;
                }

                uniforms.iTime.value = t * 0.001;

                if (followMouse && mouseInfluence > 0.0) {
                    const smoothing = 0.92;

                    smoothMouseRef.current.x =
                        smoothMouseRef.current.x * smoothing +
                        mouseRef.current.x * (1 - smoothing);
                    smoothMouseRef.current.y =
                        smoothMouseRef.current.y * smoothing +
                        mouseRef.current.y * (1 - smoothing);

                    uniforms.mousePos.value = [
                        smoothMouseRef.current.x,
                        smoothMouseRef.current.y,
                    ];
                }

                try {
                    renderer.render({ scene: mesh });
                    animationIdRef.current = requestAnimationFrame(loop);
                } catch (error) {
                    console.warn("WebGL rendering error:", error);
                    return;
                }
            };

            window.addEventListener("resize", updatePlacement);
            updatePlacement();
            animationIdRef.current = requestAnimationFrame(loop);

            cleanupFunctionRef.current = () => {
                if (animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                }

                window.removeEventListener("resize", updatePlacement);

                if (renderer) {
                    try {
                        const canvas = renderer.gl.canvas;
                        const loseContextExt =
                            renderer.gl.getExtension("WEBGL_lose_context");
                        if (loseContextExt) {
                            loseContextExt.loseContext();
                        }

                        if (canvas && canvas.parentNode) {
                            canvas.parentNode.removeChild(canvas);
                        }
                    } catch (error) {
                        console.warn("Error during WebGL cleanup:", error);
                    }
                }

                rendererRef.current = null;
                uniformsRef.current = null;
                meshRef.current = null;
            };
        };

        initializeWebGL();

        return () => {
            if (cleanupFunctionRef.current) {
                cleanupFunctionRef.current();
                cleanupFunctionRef.current = null;
            }
        };
    }, [
        isVisible,
        raysOrigin,
        raysColor,
        raysSpeed,
        lightSpread,
        rayLength,
        pulsating,
        fadeDistance,
        saturation,
        followMouse,
        mouseInfluence,
        noiseAmount,
        distortion,
    ]);

    useEffect(() => {
        if (!uniformsRef.current || !containerRef.current || !rendererRef.current)
            return;

        const u = uniformsRef.current;
        const renderer = rendererRef.current;

        u.raysColor.value = hexToRgb(raysColor);
        u.raysSpeed.value = raysSpeed;
        u.lightSpread.value = lightSpread;
        u.rayLength.value = rayLength;
        u.pulsating.value = pulsating ? 1.0 : 0.0;
        u.fadeDistance.value = fadeDistance;
        u.saturation.value = saturation;
        u.mouseInfluence.value = mouseInfluence;
        u.noiseAmount.value = noiseAmount;
        u.distortion.value = distortion;

        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        const dpr = renderer.dpr;
        const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
        u.rayPos.value = anchor;
        u.rayDir.value = dir;
    }, [
        raysColor,
        raysSpeed,
        lightSpread,
        raysOrigin,
        rayLength,
        pulsating,
        fadeDistance,
        saturation,
        mouseInfluence,
        noiseAmount,
        distortion,
    ]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current || !rendererRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mouseRef.current = { x, y };
        };

        if (followMouse) {
            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }
    }, [followMouse]);

    return (
        <div
            ref={containerRef}
            className={`${styles['light-rays-container']} ${className}`.trim()}
        />
    );
};



const CustomGoogleLoginButton = ({ handleLogin }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            handleLogin(tokenResponse.access_token);
        },
        onError: () => console.log("Login Failed"),
    });

    return (
        <button
            onClick={() => login()}
            style={{
                padding: "10px 20px",
                background: "#4285F4",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
            }}
        >
            Sign in with Google
        </button>
    );
};



const Squares = ({
                     direction = 'right',
                     speed = 1,
                     borderColor = '#999',
                     squareSize = 40,
                     hoverFillColor = '#222',
                     className = ''
                 }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const numSquaresX = useRef();
    const numSquaresY = useRef();
    const gridOffset = useRef({ x: 0, y: 0 });
    const hoveredSquare = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
            numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
            const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

            for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
                for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
                    const squareX = x - (gridOffset.current.x % squareSize);
                    const squareY = y - (gridOffset.current.y % squareSize);

                    if (
                        hoveredSquare.current &&
                        Math.floor((x - startX) / squareSize) === hoveredSquare.current.x &&
                        Math.floor((y - startY) / squareSize) === hoveredSquare.current.y
                    ) {
                        ctx.fillStyle = hoverFillColor;
                        ctx.fillRect(squareX, squareY, squareSize, squareSize);
                    }

                    ctx.strokeStyle = borderColor;
                    ctx.strokeRect(squareX, squareY, squareSize, squareSize);
                }
            }

            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const updateAnimation = () => {
            const effectiveSpeed = Math.max(speed, 0.1);
            switch (direction) {
                case 'right':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'left':
                    gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'up':
                    gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'down':
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                case 'diagonal':
                    gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
                    gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
                    break;
                default:
                    break;
            }

            drawGrid();
            requestRef.current = requestAnimationFrame(updateAnimation);
        };

        const handleMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
            const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

            const hoveredSquareX = Math.floor((mouseX + gridOffset.current.x - startX) / squareSize);
            const hoveredSquareY = Math.floor((mouseY + gridOffset.current.y - startY) / squareSize);

            if (
                !hoveredSquare.current ||
                hoveredSquare.current.x !== hoveredSquareX ||
                hoveredSquare.current.y !== hoveredSquareY
            ) {
                hoveredSquare.current = { x: hoveredSquareX, y: hoveredSquareY };
            }
        };

        const handleMouseLeave = () => {
            hoveredSquare.current = null;
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        requestRef.current = requestAnimationFrame(updateAnimation);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(requestRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [direction, speed, borderColor, hoverFillColor, squareSize]);

    return <canvas ref={canvasRef} className={`${styles['squares-canvas ']} ${className}`}></canvas>;
};

const Login = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const { login } = useAuth();



    const handleLogin = async (accessToken) => {
        try {

            console.log("Access token" , accessToken)

            const res = await fetch("http://localhost:5001/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tokenId: accessToken }),
                credentials: 'include' // 🔥 This is what tells browser to store cookies!
            });

            const data = await res.json();
            console.log(" login page" , data)

            if (data?.user) {
                console.log("Data of logged in user form login page" , data)
                login(data.user); // ✅ Store in context
            } else {
                console.error("Login failed:", data);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };


    return (
        <div className={styles['parent-wrapper']}>

            <Galaxy/>
            <div className={styles['login-bg']}>




                {/*<Galaxy/>*/}
                {/*<div style={{width: '100%', height: '600px', position: 'relative'}}>*/}
                {/*    <LightRays*/}
                {/*        raysOrigin="top-center"*/}
                {/*        raysColor="#ffffff"*/}
                {/*        raysSpeed={1}*/}
                {/*        lightSpread={0.6}*/}
                {/*        rayLength={0.7}*/}
                {/*        followMouse={false}*/}
                {/*        mouseInfluence={0}*/}
                {/*        noiseAmount={0}*/}
                {/*        distortion={0.0}*/}
                {/*        className="styles['custom-rays']"*/}
                {/*    />*/}
                {/*</div>*/}
            </div>

            <div className={styles['login-modal']}>
                <h2>Login</h2>
                {user ? (
                    <div>
                        <p>Welcome, {user.name}</p>
                    </div>
                ) : (
                    <CustomGoogleLoginButton handleLogin={handleLogin}/>
                )}
            </div>

        </div>
    );
};

export default Login;