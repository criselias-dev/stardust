// src/math.js

// O módulo "math.js" é responsável por fornecer funções matemáticas auxiliares para o projeto, incluindo geração de números aleatórios, funções de interpolação, cálculo de distância em 3D, projeção de coordenadas 3D para 2D e formatação de cores em HSL. Essas funções são utilizadas em várias partes do projeto para criar efeitos visuais e simular o comportamento de objetos no universo simulado.

// A função "rand" gera um número aleatório entre um valor mínimo e máximo, permitindo a criação de variações e aleatoriedade em diferentes aspectos do projeto, como a posição e velocidade de objetos.
// A função "clamp" limita um valor dentro de um intervalo específico, garantindo que as propriedades dos objetos permaneçam dentro de limites razoáveis e evitando comportamentos indesejados.
// A função "lerp" realiza uma interpolação linear entre dois valores, permitindo a criação de transições suaves e gradientes em diferentes aspectos visuais do projeto.
// A função "dist3" calcula a distância entre dois pontos em um espaço tridimensional, sendo útil para determinar a proximidade entre objetos e influenciar interações e efeitos visuais com base nessa proximidade.
// A função "hsl" formata uma cor no formato HSL (Hue, Saturation, Lightness) com um canal alfa opcional, facilitando a criação de cores dinâmicas e variações visuais no projeto.
// A função "project" converte coordenadas 3D em coordenadas 2D para renderização na tela, utilizando um fator de projeção para criar uma sensação de profundidade e perspectiva
export function rand(min, max) { return Math.random() * (max - min) + min; }

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function lerp(a, b, t) { return a + (b - a) * t; }

export function dist3(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function dist3Sq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
}

export function hsl(h, s, l, a = 1) { return `hsla(${h}, ${s}%, ${l}%, ${a})`; }

export function project(x, y, z, cx, cy, PROJECTION) {
    const safeZ = Math.max(1, z);
    const scale = PROJECTION / safeZ;
    return { x: cx + x * scale, y: cy + y * scale, scale };
}