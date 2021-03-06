import { addDrawable } from 'drawables';
import { randomBetween } from 'math';
import { Point } from 'point';

interface Particle {
  mid: Point;
  dMid: Point;
  life: number;
  color: string;
}

const particles = new Set<Particle>();
const size = 3;
const maxLife = 60;
const density = 0.04;
const speed = 1;

let maxParticles = 0;

export function resetParticles() {
  particles.clear();
}

export function initParticles() {
  addDrawable('particles', (context) => {
    for (const particle of particles) {
      const opacity = Math.floor((particle.life / maxLife) * 16);
      context.fillStyle = `${particle.color}${opacity.toString(16)}`;
      context.fillRect(particle.mid.x - size / 2, particle.mid.y - size / 2, size, size);
    }
  });
}

export function updateParticles() {
  if (particles.size > maxParticles) {
    maxParticles = particles.size;
  }
  for (const particle of particles) {
    particle.life -= 1;
    if (particle.life === 0) {
      particles.delete(particle);
    }
    particle.mid = particle.mid.add(particle.dMid);
  }
}

export function addParticles(mid: Point, radius: number, colors: string[], highDensity = false) {
  const particleCount = radius ** 2 * (highDensity ? density * 2 : density);
  for (let index = 0; index < particleCount; index += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const offsetPoint = new Point(Math.sin(angle), Math.cos(angle));
    particles.add({
      mid: mid.add(offsetPoint.mul(Math.random() * radius)),
      dMid: offsetPoint.mul(Math.random() * speed),
      life: maxLife,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}
