import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface FieldMailTerminalProps {
  onBack?: () => void;
  active?: boolean;
}

// Synthesized Retro Audio Engine
class RetroSoundEngine {
  ctx: AudioContext | null = null;
  enabled: boolean = true;

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeyClick(pitchOffset: number = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 + pitchOffset * 25, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.045);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // AudioContext failure safety
    }
  }

  playCRTBeep(freq: number = 920, duration: number = 0.07) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // AudioContext failure safety
    }
  }

  playLampSwitch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.setValueAtTime(260, now + 0.02);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // AudioContext failure safety
    }
  }

  playPaperRustle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.14);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext failure safety
    }
  }

  dispose() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

export const FieldMailTerminal: React.FC<FieldMailTerminalProps> = ({
  onBack,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ title: string; body: string; visible: boolean }>({
    title: '',
    body: '',
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((title: string, body: string) => {
    setToast({ title, body, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3400);
  }, []);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;

    const sfx = new RetroSoundEngine();

    // Procedural Textures
    function createWeatheredWoodTexture() {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#3c2415';
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = 0; i < 600; i++) {
        const y = Math.random() * c.height;
        const h = 1 + Math.random() * 6;
        ctx.fillStyle = Math.random() > 0.45 ? 'rgba(24, 13, 6, 0.36)' : 'rgba(92, 56, 32, 0.25)';
        ctx.fillRect(0, y, c.width, h);
      }

      for (let i = 0; i < 220; i++) {
        ctx.strokeStyle = Math.random() > 0.3 ? 'rgba(115, 76, 46, 0.28)' : 'rgba(15, 8, 4, 0.4)';
        ctx.lineWidth = 0.6 + Math.random() * 2.2;
        ctx.beginPath();
        const sx = Math.random() * c.width;
        const sy = Math.random() * c.height;
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.2) * 180, sy + (Math.random() - 0.5) * 22);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function createLightNordicWoodTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#d9b88c';
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = 0; i < 320; i++) {
        const y = Math.random() * c.height;
        const h = 1 + Math.random() * 5;
        ctx.fillStyle = Math.random() > 0.45 ? 'rgba(175, 132, 85, 0.26)' : 'rgba(238, 214, 178, 0.28)';
        ctx.fillRect(0, y, c.width, h);
      }

      for (let i = 0; i < 90; i++) {
        ctx.strokeStyle = 'rgba(142, 98, 56, 0.18)';
        ctx.lineWidth = 0.8 + Math.random() * 1.8;
        ctx.beginPath();
        const sy = Math.random() * c.height;
        ctx.moveTo(0, sy);
        ctx.bezierCurveTo(170, sy + (Math.random() - 0.5) * 18, 340, sy + (Math.random() - 0.5) * 18, 512, sy);
        ctx.stroke();
      }

      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function createAgedBeigeTexture(baseHex = '#a89f8d', grimeStrength = 0.22) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, c.width, c.height);

      for (let i = 0; i < 3500; i++) {
        const x = Math.random() * c.width;
        const y = Math.random() * c.height;
        const r = Math.random() * 2.5;
        ctx.fillStyle = Math.random() > 0.5
          ? `rgba(45, 38, 28, ${Math.random() * grimeStrength})`
          : `rgba(215, 205, 188, ${Math.random() * 0.08})`;
        ctx.fillRect(x, y, r, r);
      }

      const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 350);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(28, 23, 16, ${grimeStrength * 1.15})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);

      return new THREE.CanvasTexture(c);
    }

    function createPlasterWallTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#252822';
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(15, 17, 14, 0.25)' : 'rgba(58, 63, 52, 0.16)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
      }
      return new THREE.CanvasTexture(c);
    }

    function createPaperPlaneTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d')!;

      // Aged cream/manila stationery parchment base
      ctx.fillStyle = '#f5f0e4';
      ctx.fillRect(0, 0, 512, 512);

      // Fine fiber grain & aged texture
      for (let i = 0; i < 3200; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 55, 35, 0.035)' : 'rgba(255, 255, 255, 0.07)';
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }

      // Soft paper edge gradient
      const grad = ctx.createRadialGradient(256, 256, 160, 256, 256, 340);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(60, 45, 25, 0.06)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Central spine fold shading
      ctx.fillStyle = 'rgba(40, 30, 18, 0.08)';
      ctx.fillRect(254, 0, 4, 512);

      // Faint archival typewriter serial on inner wing fold
      ctx.font = '12px "Courier Prime", monospace';
      ctx.fillStyle = 'rgba(45, 35, 22, 0.35)';
      ctx.textAlign = 'center';
      ctx.fillText('REF. 1983 - FIELD MEMO', 256, 320);

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      return tex;
    }

    function createPaperAirplaneGeo(): THREE.BufferGeometry {
      const geo = new THREE.BufferGeometry();

      // Folded origami dart landmark points (facing -Z forward, +Y up, +X right)
      // Refined scale: length ~0.26, wingspan ~0.18, height ~0.035
      const nose = [0, 0.005, -0.15];
      const tailCenter = [0, 0.004, 0.12];
      const keelFront = [0, -0.016, -0.05];
      const keelBack = [0, -0.035, 0.11];
      const lCrease = [-0.018, -0.008, 0.115];
      const rCrease = [0.018, -0.008, 0.115];
      const lWingTip = [-0.125, 0.018, 0.11];
      const rWingTip = [0.125, 0.018, 0.11];
      const lWinglet = [-0.130, 0.042, 0.105];
      const rWinglet = [0.130, 0.042, 0.105];

      const positions: number[] = [];
      const uvs: number[] = [];

      function addTri(
        p1: number[], uv1: [number, number],
        p2: number[], uv2: [number, number],
        p3: number[], uv3: [number, number]
      ) {
        positions.push(...p1, ...p2, ...p3);
        uvs.push(...uv1, ...uv2, ...uv3);
        positions.push(...p1, ...p3, ...p2);
        uvs.push(...uv1, ...uv3, ...uv2);
      }

      // Left & Right Wings (Top main surfaces)
      addTri(nose, [0.5, 0.05], lCrease, [0.44, 0.85], lWingTip, [0.05, 0.85]);
      addTri(nose, [0.5, 0.05], rWingTip, [0.95, 0.85], rCrease, [0.56, 0.85]);

      // Left & Right Center Creases
      addTri(nose, [0.5, 0.05], tailCenter, [0.5, 0.88], lCrease, [0.44, 0.85]);
      addTri(nose, [0.5, 0.05], rCrease, [0.56, 0.85], tailCenter, [0.5, 0.88]);

      // Keel (Underbelly fuselage)
      addTri(nose, [0.5, 0.05], keelFront, [0.48, 0.45], lCrease, [0.44, 0.85]);
      addTri(keelFront, [0.48, 0.45], keelBack, [0.48, 0.85], lCrease, [0.44, 0.85]);
      addTri(nose, [0.5, 0.05], rCrease, [0.56, 0.85], keelFront, [0.52, 0.45]);
      addTri(keelFront, [0.52, 0.45], rCrease, [0.56, 0.85], keelBack, [0.52, 0.85]);

      // Winglet stabilizers on outer tips
      addTri(lWingTip, [0.05, 0.85], nose, [0.5, 0.05], lWinglet, [0.02, 0.82]);
      addTri(rWingTip, [0.95, 0.85], rWinglet, [0.98, 0.82], nose, [0.5, 0.05]);

      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.computeVertexNormals();
      return geo;
    }

    // Interactive CRT Screen Canvas
    const crtCanvas = document.createElement('canvas');
    crtCanvas.width = 1024;
    crtCanvas.height = 768;
    const crtCtx = crtCanvas.getContext('2d')!;
    const crtTexture = new THREE.CanvasTexture(crtCanvas);
    crtTexture.minFilter = THREE.LinearFilter;
    crtTexture.magFilter = THREE.LinearFilter;
    crtTexture.generateMipmaps = false;

    interface FieldDef {
      id: string;
      label: string;
      ph: string;
      y: number;
      h: number;
      max: number;
      multi?: boolean;
    }

    const FIELD_DEFS: FieldDef[] = [
      { id: 'name', label: 'NAME', ph: '(optional)', y: 176, h: 48, max: 28 },
      { id: 'email', label: 'EMAIL', ph: 'you@example.com', y: 240, h: 48, max: 40 },
      { id: 'subject', label: 'SUBJECT', ph: 'What is this about?', y: 304, h: 48, max: 40 },
      { id: 'message', label: 'MESSAGE', ph: 'Dear Field Mail,', y: 368, h: 152, max: 200, multi: true },
    ];
    const FORM_ORDER = ['name', 'email', 'subject', 'message', 'send', 'clear'];
    const MSG_COLS = 40;
    const MSG_LINES = 5;

    interface Region {
      id: string;
      x0: number;
      x1: number;
      y0: number;
      y1: number;
    }

    const terminalState = {
      cursorVisible: true,
      hoveredItem: -1,
      focus: 'name',
      fields: { name: '', email: '', subject: '', message: '' } as Record<string, string>,
      status: '',
      statusKind: '',
      sent: false,
      regions: [] as Region[],
    };

    function wrapLines(text: string, cols: number): string[] {
      const out: string[] = [];
      text.split('\n').forEach(par => {
        let line = '';
        par.split(' ').forEach(word => {
          while (word.length > cols) {
            if (line) { out.push(line); line = ''; }
            out.push(word.slice(0, cols));
            word = word.slice(cols);
          }
          if (!line) line = word;
          else if ((line + ' ' + word).length <= cols) line += ' ' + word;
          else { out.push(line); line = word; }
        });
        out.push(line);
      });
      return out;
    }

    function setFocus(id: string) {
      terminalState.focus = id;
      renderCRTScreen();
    }

    function focusStep(dir: number) {
      const i = FORM_ORDER.indexOf(terminalState.focus);
      setFocus(FORM_ORDER[(i + dir + FORM_ORDER.length) % FORM_ORDER.length]);
    }

    const planeState = {
      mode: 'entrance' as 'entrance' | 'landed' | 'loop' | 'deliver' | 'dispatched',
      time: 0,
    };

    let launchPlaneLoop = () => {};
    let launchPlaneDelivery = () => {};

    function clearForm() {
      const ts = terminalState;
      ts.fields = { name: '', email: '', subject: '', message: '' };
      ts.sent = false;
      ts.status = 'Form cleared.';
      ts.statusKind = 'ok';
      ts.focus = 'name';
      renderCRTScreen();
    }

    function resetForm() {
      clearForm();
      terminalState.status = '';
      if (planeState.mode === 'dispatched') {
        planeState.mode = 'entrance';
        planeState.time = 0;
      }
      renderCRTScreen();
    }

    function sendMessage() {
      const ts = terminalState;
      const f = ts.fields;
      const fail = (id: string, msg: string) => {
        ts.status = msg;
        ts.statusKind = 'err';
        ts.focus = id;
        sfx.playCRTBeep(240, 0.12);
        renderCRTScreen();
      };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) return fail('email', 'Please enter a valid email address.');
      if (!f.message.trim()) return fail('message', 'The message is empty.');
      ts.sent = true;
      ts.status = '';
      ts.statusKind = '';
      ts.focus = 'new';
      sfx.playCRTBeep(1040, 0.08);
      launchPlaneDelivery();
      showToast('MESSAGE DISPATCHED', 'Your airmail letter has taken flight to Edrian Nieves.');
      renderCRTScreen();
    }

    function activateRegion(reg?: Region) {
      if (!reg) return;
      sfx.playKeyClick(1);
      if (FIELD_DEFS.some(f => f.id === reg.id)) setFocus(reg.id);
      else if (reg.id === 'send') { terminalState.focus = 'send'; sendMessage(); }
      else if (reg.id === 'clear') clearForm();
      else if (reg.id === 'new') resetForm();
    }

    function renderCRTScreen() {
      const w = crtCanvas.width;
      const h = crtCanvas.height;
      const ts = terminalState;
      const g = crtCtx;
      const SERIF = 'Georgia, Times New Roman, serif';
      const MONO = 'Courier New, Courier, monospace';
      const PAPER = '#f4f1ea', INK = '#1c2540', NAVY = '#1f3a8a', RED = '#c8262c', MUTED = '#5b6785';
      const rect = (x: number, y: number, rw: number, rh: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, rw, rh); };
      const text = (str: string, x: number, y: number, font: string, color: string, align?: CanvasTextAlign, base?: CanvasTextBaseline) => {
        g.font = font; g.fillStyle = color; g.textAlign = align || 'left';
        g.textBaseline = base || 'middle'; g.fillText(str, x, y);
      };
      const fit = (str: string, n: number) => str.length > n ? str.slice(0, n - 1) + '~' : str;
      const rr = (x: number, y: number, rw: number, rh: number, r: number) => {
        g.beginPath();
        g.moveTo(x + r, y);
        g.lineTo(x + rw - r, y); g.quadraticCurveTo(x + rw, y, x + rw, y + r);
        g.lineTo(x + rw - r, y + rh); g.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh);
        g.lineTo(x + r, y + rh); g.quadraticCurveTo(x, y + rh, x, y + rh - r);
        g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
        g.closePath();
      };

      ts.regions = [];

      // Desk backdrop and the letter
      rect(0, 0, w, h, '#1d2539');
      rect(52, 48, 936, 692, 'rgba(0, 0, 0, 0.45)');
      rect(44, 38, 936, 692, PAPER);

      // Air-mail border
      g.save();
      g.beginPath();
      g.rect(44, 38, 936, 692);
      g.rect(58, 52, 908, 664);
      g.clip('evenodd');
      g.fillStyle = '#1f2f5c';
      g.fillRect(44, 38, 936, 692);
      g.restore();
      rect(58, 52, 908, 664, PAPER);

      // Letterhead
      try { (g as unknown as { letterSpacing: string }).letterSpacing = '6px'; } catch {}
      text('CONTACT', 88, 120, 'bold 56px ' + SERIF, '#1f2f5c');
      try { (g as unknown as { letterSpacing: string }).letterSpacing = '0px'; } catch {}
      rect(90, 168, 840, 2, '#1f2f5c');
      rect(90, 173, 840, 1, '#1f2f5c');

      function button(id: string, x: number, y: number, bw: number, bh: number, label: string, primary: boolean) {
        ts.regions.push({ id, x0: x, x1: x + bw, y0: y, y1: y + bh });
        const hover = ts.hoveredItem === ts.regions.length - 1;
        const focused = ts.focus === id;
        rr(x, y, bw, bh, 10);
        if (primary) {
          g.fillStyle = hover ? '#2d52b8' : NAVY;
          g.fill();
        } else {
          if (hover) { g.fillStyle = '#e6eaf5'; g.fill(); }
          g.strokeStyle = NAVY;
          g.lineWidth = 3;
          g.stroke();
        }
        text(label, x + bw / 2, y + bh / 2 + 1, 'bold 26px ' + SERIF, primary ? '#ffffff' : NAVY, 'center');
        if (focused) {
          rr(x - 5, y - 5, bw + 10, bh + 10, 14);
          g.strokeStyle = RED;
          g.lineWidth = 3;
          g.stroke();
        }
      }

      const boxX = 250, boxW = 680;

      if (!ts.sent) {
        text('To', 90, 198, 'italic 26px ' + SERIF, MUTED);
        text('Edrian Nieves', boxX, 198, 'bold 26px ' + SERIF, INK);

        const lay: Record<string, { y: number; h: number }> = {
          name: { y: 224, h: 50 }, email: { y: 282, h: 50 },
          subject: { y: 340, h: 50 }, message: { y: 398, h: 196 }
        };
        const labels: Record<string, string> = { name: 'Your name', email: 'Email', subject: 'Subject', message: 'Message' };
        FIELD_DEFS.forEach(def => {
          const L = lay[def.id];
          const focused = ts.focus === def.id;
          ts.regions.push({ id: def.id, x0: 70, x1: boxX + boxW, y0: L.y, y1: L.y + L.h });
          const hover = ts.hoveredItem === ts.regions.length - 1;

          text(labels[def.id], 90, def.multi ? L.y + 26 : L.y + L.h / 2, 'italic 26px ' + SERIF, focused ? NAVY : MUTED);

          rr(boxX, L.y, boxW, L.h, 8);
          g.fillStyle = focused ? '#eaf0ff' : (hover ? '#fbfcff' : '#ffffff');
          g.fill();
          g.strokeStyle = focused ? NAVY : '#9aa3bb';
          g.lineWidth = focused ? 4 : 2;
          g.stroke();

          const val = ts.fields[def.id] || '';
          const lines = def.multi ? wrapLines(val, MSG_COLS) : [val];
          const ty = L.y + (def.multi ? 14 : 11);
          if (!val) {
            text(def.ph, boxX + 16, ty, '26px ' + MONO, '#a0a7ba', 'left', 'top');
          } else {
            lines.forEach((ln, i) => text(ln, boxX + 16, ty + i * 34, '26px ' + MONO, INK, 'left', 'top'));
          }
          if (focused && ts.cursorVisible) {
            const last = lines[lines.length - 1] || '';
            g.font = '26px ' + MONO;
            const cw = g.measureText(last).width;
            rect(boxX + 16 + cw + 1, ty + (lines.length - 1) * 34 + 1, 3, 28, NAVY);
          }
        });

        button('send', boxX, 612, 240, 54, 'Send Letter', true);
        button('clear', boxX + 264, 612, 150, 54, 'Clear', false);
      } else {
        const f = ts.fields;
        const firstName = (f.name.trim().split(' ')[0] || 'friend');
        text('Thank you, ' + fit(firstName, 14) + '.', 90, 222, 'bold 42px ' + SERIF, INK);
        text('Your message is on its way to Edrian Nieves.', 90, 268, 'italic 24px ' + SERIF, MUTED);

        g.save();
        g.globalAlpha = 0.88;
        g.translate(806, 296);
        g.rotate(-0.14);
        g.strokeStyle = RED;
        g.lineWidth = 5;
        rr(-120, -38, 240, 76, 8); g.stroke();
        g.lineWidth = 2;
        rr(-111, -30, 222, 60, 5); g.stroke();
        text('DELIVERED', 0, 2, 'bold 36px ' + SERIF, RED, 'center');
        g.restore();

        rr(90, 360, 840, 150, 10);
        g.fillStyle = '#ffffff';
        g.fill();
        g.strokeStyle = '#b9bfd0';
        g.lineWidth = 2;
        g.stroke();
        text('To', 114, 398, 'italic 24px ' + SERIF, MUTED);
        text('Edrian Nieves', 230, 398, '24px ' + MONO, INK);
        text('From', 114, 436, 'italic 24px ' + SERIF, MUTED);
        text(fit(f.name.trim() ? f.name.trim() + ' <' + f.email.trim() + '>' : f.email.trim(), 28), 230, 436, '24px ' + MONO, INK);
        text('Subject', 114, 474, 'italic 24px ' + SERIF, MUTED);
        text(fit(f.subject.trim() || '(no subject)', 28), 230, 474, '24px ' + MONO, INK);

        button('new', 90, 612, 260, 54, 'Write Another', true);
      }

      // Status line
      if (ts.status) {
        text(ts.status, 90, 694, 'italic bold 22px ' + SERIF, '#a01818');
      } else {
        if (ts.sent) text('Delivered.', 90, 694, 'italic 20px ' + SERIF, MUTED);
      }

      // CRT glass sheen & vignette
      rect(0, 0, w, h, 'rgba(0, 0, 0, 0.06)');
      const sheen = g.createRadialGradient(w * 0.7, h * 0.2, 20, w * 0.6, h * 0.4, w * 0.7);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
      sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
      g.fillStyle = sheen;
      g.fillRect(0, 0, w, h);
      const edgeGrad = g.createRadialGradient(w / 2, h / 2, w * 0.34, w / 2, h / 2, w * 0.56);
      edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
      edgeGrad.addColorStop(0.82, 'rgba(0,0,0,0.16)');
      edgeGrad.addColorStop(1, 'rgba(0,0,0,0.8)');
      g.fillStyle = edgeGrad;
      g.fillRect(0, 0, w, h);

      crtTexture.needsUpdate = true;
    }

    renderCRTScreen();
    const cursorInterval = setInterval(() => {
      terminalState.cursorVisible = !terminalState.cursorVisible;
      renderCRTScreen();
    }, 520);

    // GLSL Shaders
    const crtShaderUniforms = {
      uScreenTex: { value: crtTexture },
      uTime: { value: 0 },
      uLampOn: { value: 1.0 },
      uLampWorldPos: { value: new THREE.Vector3(2.6, 2.2, 0.3) },
      uHoverBoost: { value: 0.0 },
    };

    const crtVertexShader = `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewPos;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -viewPos.xyz;
        gl_Position = projectionMatrix * viewPos;
      }
    `;

    const crtFragmentShader = `
      uniform sampler2D uScreenTex;
      uniform float uTime;
      uniform float uLampOn;
      uniform vec3 uLampWorldPos;
      uniform float uHoverBoost;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      varying vec3 vViewPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      vec2 barrelDistort(vec2 coord, float amt) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        return coord + cc * dist * amt;
      }

      void main() {
        vec2 uv = barrelDistort(vUv, 0.14);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.02, 0.025, 0.02, 1.0);
          return;
        }

        float syncJitter = sin(uTime * 37.0 + uv.y * 80.0) * 0.00025;
        uv.x += syncJitter;

        float ca = 0.0014;
        vec3 col;
        col.r = texture2D(uScreenTex, uv + vec2(ca, 0.0)).r;
        col.g = texture2D(uScreenTex, uv).g;
        col.b = texture2D(uScreenTex, uv - vec2(ca, 0.0)).b;

        vec3 bloom = vec3(0.0);
        vec2 texel = vec2(1.0 / 1024.0, 1.0 / 768.0) * 2.8;
        bloom += texture2D(uScreenTex, uv + vec2(-texel.x, 0.0)).rgb;
        bloom += texture2D(uScreenTex, uv + vec2( texel.x, 0.0)).rgb;
        bloom += texture2D(uScreenTex, uv + vec2(0.0, -texel.y)).rgb;
        bloom += texture2D(uScreenTex, uv + vec2(0.0,  texel.y)).rgb;
        bloom += texture2D(uScreenTex, uv + vec2(-texel.x, -texel.y)).rgb;
        bloom += texture2D(uScreenTex, uv + vec2( texel.x,  texel.y)).rgb;
        bloom *= 0.03;

        col += bloom * (0.85 + uHoverBoost * 0.25);
        float scanline = 0.84;
        float grille = 0.92;
        col *= scanline * grille * 1.2;

        float grain = (hash(uv * 500.0 + uTime) - 0.5) * 0.035;
        col += grain;

        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewPos - vWorldPos);
        vec3 L = normalize(uLampWorldPos - vWorldPos);
        vec3 H = normalize(V + L);

        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.2);
        float specHotspot = pow(max(dot(N, H), 0.0), 28.0);
        float softCoatGlow = pow(max(dot(N, L), 0.0), 3.0);

        vec3 lampReflection = vec3(1.0, 0.78, 0.45) * (specHotspot * 0.12 + softCoatGlow * 0.02) * uLampOn;
        vec3 ambientGlassRim = vec3(0.18, 0.19, 0.21) * fresnel * 0.35;

        vec2 vigUv = uv * (1.0 - uv.yx);
        float vig = clamp(pow(vigUv.x * vigUv.y * 16.0, 0.28), 0.0, 1.0);

        vec3 finalColor = col * vig + lampReflection + ambientGlassRim;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // 3D Scene Initialization
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0a08);
    scene.fog = new THREE.FogExp2(0x0b0a08, 0.048);

    const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const defaultCamSpherical = { radius: 7.55, theta: 0.41, phi: 1.33 };
    const defaultCamTarget = new THREE.Vector3(-0.18, 1.05, 0.22);
    const focusedCamSpherical = { radius: 4.15, theta: 0.26, phi: 1.39 };
    const focusedCamTarget = new THREE.Vector3(-0.55, 1.48, -0.15);

    const camSpherical = { ...defaultCamSpherical };
    let targetSpherical = { ...defaultCamSpherical };
    const currentLookAt = defaultCamTarget.clone();
    const targetLookAt = defaultCamTarget.clone();

    let isFocusedOnCRT = false;
    let isLampOn = true;
    let lastKeyId = '';

    // Geometry Helpers
    function createRoundedBoxGeo(width: number, height: number, depth: number, radius = 0.06, smoothness = 6) {
      const r = Math.min(radius, width * 0.45, height * 0.45, depth * 0.45);
      const hw = width / 2, hh = height / 2, hd = depth / 2;
      const iw = hw - r, ih = hh - r, id = hd - r;
      const shape = new THREE.Shape();
      shape.moveTo(-iw, -hh);
      shape.lineTo(iw, -hh);
      shape.absarc(iw, -ih, r, -Math.PI / 2, 0, false);
      shape.lineTo(hw, ih);
      shape.absarc(iw, ih, r, 0, Math.PI / 2, false);
      shape.lineTo(-iw, hh);
      shape.absarc(-iw, ih, r, Math.PI / 2, Math.PI, false);
      shape.lineTo(-hw, -ih);
      shape.absarc(-iw, -ih, r, Math.PI, Math.PI * 1.5, false);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: depth - r * 2,
        bevelEnabled: true,
        bevelSegments: smoothness,
        steps: 1,
        bevelSize: r,
        bevelThickness: r,
        curveSegments: smoothness * 2,
      });
      geo.center();
      return geo;
    }

    function createMoldedBezelGeo(
      outW: number, outH: number, inW: number, inH: number,
      depth: number, taperFront: number, bezelR: number, filletR: number
    ) {
      const shape = new THREE.Shape();
      const hw = outW / 2, hh = outH / 2;
      shape.moveTo(-hw + bezelR, -hh);
      shape.lineTo(hw - bezelR, -hh);
      shape.absarc(hw - bezelR, -hh + bezelR, bezelR, -Math.PI / 2, 0, false);
      shape.lineTo(hw, hh - bezelR);
      shape.absarc(hw - bezelR, hh - bezelR, bezelR, 0, Math.PI / 2, false);
      shape.lineTo(-hw + bezelR, hh);
      shape.absarc(-hw + bezelR, hh - bezelR, bezelR, Math.PI / 2, Math.PI, false);
      shape.lineTo(-hw, -hh + bezelR);
      shape.absarc(-hw + bezelR, -hh + bezelR, bezelR, Math.PI, Math.PI * 1.5, false);

      const hole = new THREE.Path();
      const ihw = inW / 2, ihh = inH / 2;
      hole.moveTo(-ihw + filletR, -ihh);
      hole.lineTo(ihw - filletR, -ihh);
      hole.absarc(ihw - filletR, -ihh + filletR, filletR, -Math.PI / 2, 0, false);
      hole.lineTo(ihw, ihh - filletR);
      hole.absarc(ihw - filletR, ihh - filletR, filletR, 0, Math.PI / 2, false);
      hole.lineTo(-ihw + filletR, ihh);
      hole.absarc(-ihw + filletR, ihh - filletR, filletR, Math.PI / 2, Math.PI, false);
      hole.lineTo(-ihw, -ihh + filletR);
      hole.absarc(-ihw + filletR, -ihh + filletR, filletR, Math.PI, Math.PI * 1.5, false);
      shape.holes.push(hole);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: depth - filletR * 2,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: filletR,
        bevelThickness: filletR,
        curveSegments: 16,
      });
      geo.center();

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        const t = Math.max(0, (z + depth / 2) / depth);
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        pos.setXY(i, vx * (1 - t * taperFront), vy * (1 - t * taperFront));
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createTaperedCRTBackGeo(frontW: number, frontH: number, backW: number, backH: number, depth: number, cornerR: number) {
      const geo = createRoundedBoxGeo(frontW, frontH, depth, cornerR, 4);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vz = pos.getZ(i);
        const t = Math.max(0, (-vz + depth / 2) / depth);
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const scaleX = 1.0 - t * (1.0 - backW / frontW);
        const scaleY = 1.0 - t * (1.0 - backH / frontH);
        pos.setXYZ(i, vx * scaleX, vy * scaleY - t * 0.04, vz);
      }
      geo.computeVertexNormals();
      return geo;
    }

    function createParallelTransportTubeGeo(points: THREE.Vector3[], tubularSegments: number, radius: number, radialSegments = 16) {
      const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
      const frames: { tangents: THREE.Vector3[]; normals: THREE.Vector3[]; binormals: THREE.Vector3[] } = {
        tangents: [], normals: [], binormals: []
      };

      const sampledPts: THREE.Vector3[] = [];
      for (let i = 0; i <= tubularSegments; i++) {
        const u = i / tubularSegments;
        sampledPts.push(curve.getPointAt(u));
        frames.tangents.push(curve.getTangentAt(u).normalize());
      }

      const t0 = frames.tangents[0];
      const initUp = Math.abs(t0.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const n0 = new THREE.Vector3().crossVectors(t0, initUp).normalize();
      const b0 = new THREE.Vector3().crossVectors(t0, n0).normalize();
      frames.normals.push(n0);
      frames.binormals.push(b0);

      const rotAxis = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      for (let i = 1; i <= tubularSegments; i++) {
        const prevT = frames.tangents[i - 1];
        const currT = frames.tangents[i];
        const prevN = frames.normals[i - 1].clone();
        rotAxis.crossVectors(prevT, currT);
        if (rotAxis.lengthSq() > 1e-10) {
          rotAxis.normalize();
          const angle = Math.acos(Math.max(-1, Math.min(1, prevT.dot(currT))));
          quat.setFromAxisAngle(rotAxis, angle);
          prevN.applyQuaternion(quat);
        }
        prevN.addScaledVector(currT, -prevN.dot(currT)).normalize();
        const currB = new THREE.Vector3().crossVectors(currT, prevN).normalize();
        frames.normals.push(prevN);
        frames.binormals.push(currB);
      }

      const vertexCount = (tubularSegments + 1) * (radialSegments + 1);
      const positions = new Float32Array(vertexCount * 3);
      const normals = new Float32Array(vertexCount * 3);
      const uvs = new Float32Array(vertexCount * 2);
      const indices: number[] = [];
      const vNorm = new THREE.Vector3();
      let vIdx = 0;
      let uvIdx = 0;

      for (let i = 0; i <= tubularSegments; i++) {
        const P = sampledPts[i];
        const N = frames.normals[i];
        const B = frames.binormals[i];
        const u = i / tubularSegments;
        for (let j = 0; j <= radialSegments; j++) {
          const v = (j / radialSegments) * Math.PI * 2;
          const cosV = Math.cos(v);
          const sinV = Math.sin(v);
          vNorm.set(
            cosV * N.x + sinV * B.x,
            cosV * N.y + sinV * B.y,
            cosV * N.z + sinV * B.z
          ).normalize();

          positions[vIdx] = P.x + radius * vNorm.x;
          positions[vIdx + 1] = P.y + radius * vNorm.y;
          positions[vIdx + 2] = P.z + radius * vNorm.z;
          normals[vIdx] = vNorm.x;
          normals[vIdx + 1] = vNorm.y;
          normals[vIdx + 2] = vNorm.z;
          vIdx += 3;

          uvs[uvIdx] = u;
          uvs[uvIdx + 1] = j / radialSegments;
          uvIdx += 2;
        }
      }

      const stride = radialSegments + 1;
      for (let i = 0; i < tubularSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
          const a = i * stride + j;
          const b = (i + 1) * stride + j;
          const c = (i + 1) * stride + (j + 1);
          const d = i * stride + (j + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      return geo;
    }

    // Material setups
    const woodTex = createWeatheredWoodTexture();
    const beigeLightTex = createAgedBeigeTexture('#b8afa0', 0.20);
    const beigeDarkTex = createAgedBeigeTexture('#8b8273', 0.28);
    const darkCharcoalTex = createAgedBeigeTexture('#242422', 0.30);
    const wallTex = createPlasterWallTexture();

    const matDeskWood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55, metalness: 0.06 });
    const matBeigePlastic = new THREE.MeshStandardMaterial({ map: beigeLightTex, roughness: 0.62, metalness: 0.05 });
    const matBeigeDark = new THREE.MeshStandardMaterial({ map: beigeDarkTex, roughness: 0.68, metalness: 0.08 });
    const matDarkBezel = new THREE.MeshStandardMaterial({ map: darkCharcoalTex, roughness: 0.52, metalness: 0.15 });
    const matDarkCable = new THREE.MeshStandardMaterial({ color: 0x3b352e, roughness: 0.65, metalness: 0.12 });
    const matBeigeCable = new THREE.MeshStandardMaterial({ color: 0x8d8373, roughness: 0.6, metalness: 0.08 });

    // A. ENVIRONMENT
    const deskMesh = new THREE.Mesh(createRoundedBoxGeo(14, 0.35, 8.5, 0.04, 4), matDeskWood);
    deskMesh.position.set(0, -0.175, 0.5);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 12),
      new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92 })
    );
    backWall.position.set(0, 5.2, -2.6);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // B. CRT MONITOR
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-0.62, 0, -0.18);
    monitorGroup.rotation.y = 0.27;

    const monitorBase = new THREE.Mesh(createRoundedBoxGeo(1.9, 0.14, 1.3, 0.05, 5), matBeigeDark);
    monitorBase.position.set(0, 0.07, -0.12);
    monitorBase.castShadow = true;
    monitorBase.receiveShadow = true;
    monitorGroup.add(monitorBase);

    const swivelProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.60, 0.0),
      new THREE.Vector2(0.62, 0.025),
      new THREE.Vector2(0.55, 0.06),
      new THREE.Vector2(0.42, 0.10),
      new THREE.Vector2(0.38, 0.14),
      new THREE.Vector2(0.38, 0.21),
      new THREE.Vector2(0.0, 0.21),
    ];
    const matSwivel = new THREE.MeshStandardMaterial({ map: beigeDarkTex, roughness: 0.6, metalness: 0.08, side: THREE.DoubleSide });
    const monitorSwivel = new THREE.Mesh(new THREE.LatheGeometry(swivelProfile, 48), matSwivel);
    monitorSwivel.position.set(0, 0.14, -0.12);
    monitorSwivel.scale.set(0.74, 1, 0.74);
    monitorSwivel.castShadow = true;
    monitorSwivel.receiveShadow = true;
    monitorGroup.add(monitorSwivel);

    const frameW = 3.04;
    const frameH = 2.50;
    const centerY = 1.56;

    const midCabinet = new THREE.Mesh(
      createRoundedBoxGeo(frameW - 0.06, frameH - 0.06, 0.96, 0.11, 6),
      matBeigePlastic
    );
    midCabinet.position.set(0, centerY, -0.28);
    midCabinet.castShadow = true;
    midCabinet.receiveShadow = true;
    monitorGroup.add(midCabinet);

    const rearCabinet = new THREE.Mesh(
      createTaperedCRTBackGeo(2.58, 2.12, 2.08, 1.72, 1.26, 0.14),
      matBeigeDark
    );
    rearCabinet.position.set(0, centerY - 0.04, -1.24);
    rearCabinet.castShadow = true;
    rearCabinet.receiveShadow = true;
    monitorGroup.add(rearCabinet);

    const slotMat = new THREE.MeshStandardMaterial({ color: 0x14120f, roughness: 0.9 });
    const slotGeo = createRoundedBoxGeo(0.04, 0.032, 0.84, 0.008, 2);
    for (let i = 0; i < 11; i++) {
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(-1.485, 0.72 + i * 0.074, -0.32);
      monitorGroup.add(slot);
    }

    const outerBezelGeo = createMoldedBezelGeo(frameW, frameH, frameW - 0.42, frameH - 0.42, 0.42, 0.11, 0.09, 0.045);
    const outerBezelMesh = new THREE.Mesh(outerBezelGeo, matBeigePlastic);
    outerBezelMesh.position.set(0, centerY, 0.22);
    outerBezelMesh.castShadow = true;
    outerBezelMesh.receiveShadow = true;
    monitorGroup.add(outerBezelMesh);

    const innerBezelGeo = createMoldedBezelGeo(frameW - 0.36, frameH - 0.36, 2.28, 1.74, 0.34, 0.09, 0.12, 0.04);
    const innerBezelMesh = new THREE.Mesh(innerBezelGeo, matDarkBezel);
    innerBezelMesh.position.set(0, centerY, 0.24);
    innerBezelMesh.receiveShadow = true;
    monitorGroup.add(innerBezelMesh);

    const screenGeo = new THREE.PlaneGeometry(2.40, 1.86, 48, 48);
    const posAttr = screenGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const nx = vx / 1.20;
      const ny = vy / 0.93;
      const r2 = nx * nx * 0.48 + ny * ny * 0.48;
      const bulge = Math.max(0, Math.cos(r2 * 1.15)) * 0.145;
      posAttr.setZ(i, bulge);
    }
    screenGeo.computeVertexNormals();

    const screenMat = new THREE.ShaderMaterial({
      uniforms: crtShaderUniforms,
      vertexShader: crtVertexShader,
      fragmentShader: crtFragmentShader,
    });

    const crtScreenMesh = new THREE.Mesh(screenGeo, screenMat);
    crtScreenMesh.position.set(0, centerY, 0.145);
    crtScreenMesh.name = 'CRT_SCREEN';
    monitorGroup.add(crtScreenMesh);

    const powerSwitchHousing = new THREE.Mesh(createRoundedBoxGeo(0.42, 0.15, 0.34, 0.03, 4), matDarkBezel);
    powerSwitchHousing.position.set(0.88, 0.25, 0.15);
    monitorGroup.add(powerSwitchHousing);

    const powerLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff7722 })
    );
    powerLed.position.set(0.96, 0.25, 0.32);
    monitorGroup.add(powerLed);
    scene.add(monitorGroup);

    // C. KEYBOARD
    const keyCapMeshes: THREE.Mesh[] = [];
    const kbKeyById: Record<string, THREE.Mesh> = {};

    const KB_W = 3.4, KB_D = 1.28, KB_U = 0.1425, KB_KEY_H = 0.085;
    const kbGroup = new THREE.Group();
    kbGroup.position.set(0.28, 0, 1.52);
    kbGroup.rotation.y = 0.31;

    const matKbCase = new THREE.MeshStandardMaterial({ color: 0xd6cfba, roughness: 0.55, metalness: 0.03 });
    const kbProfile = new THREE.Shape();
    kbProfile.moveTo(0.61, 0.03);
    kbProfile.lineTo(-0.61, 0.03);
    kbProfile.lineTo(-0.61, 0.19);
    kbProfile.lineTo(0.61, 0.06);
    kbProfile.closePath();
    const kbCaseGeo = new THREE.ExtrudeGeometry(kbProfile, {
      depth: KB_W - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03,
      bevelSegments: 4, steps: 1, curveSegments: 8
    });
    kbCaseGeo.rotateY(-Math.PI / 2);
    kbCaseGeo.translate((KB_W - 0.06) / 2, 0, 0);
    const kbCaseMesh = new THREE.Mesh(kbCaseGeo, matKbCase);
    kbCaseMesh.castShadow = true;
    kbCaseMesh.receiveShadow = true;
    kbGroup.add(kbCaseMesh);

    const kbDeck = new THREE.Group();
    kbDeck.position.set(0, 0.1552, 0);
    kbDeck.rotation.x = 0.1062;
    kbGroup.add(kbDeck);

    const kbX0 = -11.25 * KB_U;
    const kbRowZ = (r: number) => -KB_D / 2 + 0.22 + 0.5 * KB_U + (r === 0 ? 0 : (r + 0.5) * KB_U);
    const KB_ROW_LIFT = [0.004, 0.010, 0.008, 0.005, 0.002, 0.0];
    const kbKeyMats = [0xe6dcb8, 0xe1d6ae, 0xe9e1c4, 0xdbcfa4, 0xe3d9b6, 0xd9cc9c].map(c =>
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.48, metalness: 0.02 })
    );

    const kbKeyGeoCache: Record<string, THREE.BufferGeometry> = {};
    function kbKeyGeo(w: number, d: number) {
      const ck = w.toFixed(3) + '_' + d.toFixed(3);
      if (kbKeyGeoCache[ck]) return kbKeyGeoCache[ck];
      const geo = createRoundedBoxGeo(w, KB_KEY_H, d, 0.014, 3);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const t = Math.max(0, (y + KB_KEY_H / 2) / KB_KEY_H);
        x *= 1 - t * 0.20;
        z *= 1 - t * 0.20;
        if (y > 0) {
          const nx = x / (w * 0.5);
          y -= (1 - Math.min(1, nx * nx)) * 0.007 * t;
        }
        p.setXYZ(i, x, y, z);
      }
      geo.computeVertexNormals();
      kbKeyGeoCache[ck] = geo;
      return geo;
    }

    type KeySpec = { k: string; m?: string; t?: string; b?: string; s?: string; dir?: string; sz?: number };
    const Lc = (m: string): KeySpec => ({ k: 'c', m });
    const Ld = (t: string, b: string): KeySpec => ({ k: 'd', t, b });
    const Lw = (t: string, sz?: number): KeySpec => ({ k: 'w', t, sz });
    const Ln = (m: string, s: string): KeySpec => ({ k: 'n', m, s });
    const La = (dir: string): KeySpec => ({ k: 'a', dir });
    const Lx = (k: string): KeySpec => ({ k });

    function kbLegend(spec: KeySpec, w: number, d: number) {
      const PX = 900;
      const cw = Math.max(40, Math.round(w * 0.76 * PX));
      const H = Math.max(40, Math.round(d * 0.76 * PX));
      const c = document.createElement('canvas');
      c.width = cw;
      c.height = H;
      const g = c.getContext('2d')!;
      g.fillStyle = '#3b352d';
      g.strokeStyle = '#3b352d';
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      const FONT = 'Arial, Helvetica, sans-serif';
      const font = (px: number, wt?: string) => (wt || 'normal') + ' ' + Math.round(px) + 'px ' + FONT;
      const fit = (txt: string, px: number, maxW: number) => {
        g.font = font(px);
        const m = g.measureText(txt).width;
        return m > maxW ? px * maxW / m : px;
      };

      if (spec.k === 'c' && spec.m) {
        g.font = font(H * 0.62);
        g.fillText(spec.m, cw / 2, H * 0.54);
      } else if (spec.k === 'd' && spec.t && spec.b) {
        g.textAlign = 'left';
        g.font = font(H * 0.42);
        g.fillText(spec.t, cw * 0.2, H * 0.30);
        g.fillText(spec.b, cw * 0.2, H * 0.72);
      } else if (spec.k === 'w' && spec.t) {
        const lines = spec.t.split('\n');
        const size = spec.sz || (lines.length > 1 ? 0.27 : 0.33);
        let px = H * size;
        lines.forEach(ln => { px = Math.min(px, fit(ln, px, cw * 0.92)); });
        g.font = font(px);
        lines.forEach((ln, i) => {
          g.fillText(ln, cw / 2, H * 0.5 + (i - (lines.length - 1) / 2) * px * 1.15);
        });
      } else if (spec.k === 'n' && spec.m && spec.s) {
        g.textAlign = 'left';
        g.font = font(H * 0.44);
        g.fillText(spec.m, cw * 0.16, H * 0.36);
        g.font = font(fit(spec.s, H * 0.25, cw * 0.8));
        g.fillText(spec.s, cw * 0.16, H * 0.76);
      } else if (spec.k === 'a' && spec.dir) {
        const s = H * 0.28;
        g.save();
        g.translate(cw / 2, H * 0.5);
        const angleMap: Record<string, number> = { u: 0, r: Math.PI / 2, d: Math.PI, l: -Math.PI / 2 };
        g.rotate(angleMap[spec.dir] || 0);
        g.beginPath();
        g.moveTo(0, -s);
        g.lineTo(s * 0.7, -s * 0.1);
        g.lineTo(s * 0.25, -s * 0.1);
        g.lineTo(s * 0.25, s);
        g.lineTo(-s * 0.25, s);
        g.lineTo(-s * 0.25, -s * 0.1);
        g.lineTo(-s * 0.7, -s * 0.1);
        g.closePath();
        g.fill();
        g.restore();
      } else if (spec.k === 'win') {
        const s = H * 0.13, gp = H * 0.03;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
          g.fillRect(cw / 2 - s - gp / 2 + a * (s + gp), H * 0.5 - s - gp / 2 + b * (s + gp), s, s);
        }
      } else if (spec.k === 'menu') {
        const bw = H * 0.5, bh = H * 0.42;
        g.lineWidth = Math.max(2, H * 0.04);
        g.strokeRect(cw / 2 - bw / 2, H * 0.5 - bh / 2, bw, bh);
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.moveTo(cw / 2 - bw * 0.3, H * 0.5 - bh * 0.25 + i * bh * 0.25);
          g.lineTo(cw / 2 + bw * 0.3, H * 0.5 - bh * 0.25 + i * bh * 0.25);
          g.stroke();
        }
      } else if (spec.k === 'shift') {
        const s = H * 0.2;
        g.lineWidth = Math.max(2, H * 0.05);
        g.save();
        g.translate(cw * 0.17, H * 0.5);
        g.beginPath();
        g.moveTo(0, -s);
        g.lineTo(s, 0);
        g.lineTo(s * 0.45, 0);
        g.lineTo(s * 0.45, s);
        g.lineTo(-s * 0.45, s);
        g.lineTo(-s * 0.45, 0);
        g.lineTo(-s, 0);
        g.closePath();
        g.stroke();
        g.restore();
        g.textAlign = 'left';
        g.font = font(H * 0.33);
        g.fillText('Shift', cw * 0.3, H * 0.52);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      return tex;
    }

    const kbClusters: Record<string, { x0: number; x1: number; z0: number; z1: number }> = {};
    function kbAddKey(id: string | null, s: number, wU: number, r: number, spec: KeySpec | null, cl: string, hU = 1) {
      const w = wU * KB_U - 0.012, d = hU * KB_U - 0.012;
      const cx = kbX0 + (s + wU / 2) * KB_U;
      const cz = (kbRowZ(r) + kbRowZ(r + hU - 1)) / 2;
      const key = new THREE.Mesh(kbKeyGeo(w, d), kbKeyMats[Math.floor(Math.random() * kbKeyMats.length)]);
      const restY = 0.012 + KB_KEY_H / 2 - 0.006 + KB_ROW_LIFT[r];
      key.position.set(cx, restY, cz);
      key.castShadow = true;
      key.receiveShadow = true;
      key.userData.restY = restY;
      if (spec) {
        const dec = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.76, d * 0.76),
          new THREE.MeshStandardMaterial({
            map: kbLegend(spec, w, d), transparent: true, roughness: 0.7, metalness: 0,
            depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
          })
        );
        dec.rotation.x = -Math.PI / 2;
        dec.position.y = KB_KEY_H / 2 - 0.0013;
        key.add(dec);
      }
      kbDeck.add(key);
      keyCapMeshes.push(key);
      if (id) kbKeyById[id] = key;
      const cb = kbClusters[cl] || (kbClusters[cl] = { x0: 1e9, x1: -1e9, z0: 1e9, z1: -1e9 });
      cb.x0 = Math.min(cb.x0, cx - w / 2);
      cb.x1 = Math.max(cb.x1, cx + w / 2);
      cb.z0 = Math.min(cb.z0, cz - d / 2);
      cb.z1 = Math.max(cb.z1, cz + d / 2);
    }

    // Keyboard keys population
    kbAddKey('escape', 0, 1, 0, Lw('Esc'), 'esc');
    for (let i = 0; i < 4; i++) kbAddKey(null, 2 + i, 1, 0, Lw('F' + (1 + i)), 'f1');
    for (let i = 0; i < 4; i++) kbAddKey(null, 6.5 + i, 1, 0, Lw('F' + (5 + i)), 'f5');
    for (let i = 0; i < 4; i++) kbAddKey(null, 11 + i, 1, 0, Lw('F' + (9 + i)), 'f9');
    kbAddKey(null, 15.25, 1, 0, Lw('Print\nScreen\nSysRq'), 'sys');
    kbAddKey(null, 16.25, 1, 0, Lw('Scroll\nLock'), 'sys');
    kbAddKey(null, 17.25, 1, 0, Lw('Pause\nBreak'), 'sys');

    const kbNums = [['~', '`'], ['!', '1'], ['@', '2'], ['#', '3'], ['$', '4'], ['%', '5'], ['^', '6'], ['&', '7'], ['*', '8'], ['(', '9'], [')', '0'], ['_', '-'], ['+', '=']];
    kbNums.forEach((p, i) => kbAddKey(p[1], i, 1, 1, Ld(p[0], p[1]), 'main'));
    kbAddKey('backspace', 13, 2, 1, Lw('← Backspace'), 'main');

    kbAddKey('tab', 0, 1.5, 2, Lw('Tab'), 'main');
    'QWERTYUIOP'.split('').forEach((ch, i) => kbAddKey(ch.toLowerCase(), 1.5 + i, 1, 2, Lc(ch), 'main'));
    kbAddKey('[', 11.5, 1, 2, Ld('{', '['), 'main');
    kbAddKey(']', 12.5, 1, 2, Ld('}', ']'), 'main');
    kbAddKey('\\', 13.5, 1.5, 2, Ld('|', '\\'), 'main');

    kbAddKey('capslock', 0, 1.75, 3, Lw('Caps Lock'), 'main');
    'ASDFGHJKL'.split('').forEach((ch, i) => kbAddKey(ch.toLowerCase(), 1.75 + i, 1, 3, Lc(ch), 'main'));
    kbAddKey(';', 10.75, 1, 3, Ld(':', ';'), 'main');
    kbAddKey("'", 11.75, 1, 3, Ld('"', "'"), 'main');
    kbAddKey('enter', 12.75, 2.25, 3, Lw('Enter ↵'), 'main');

    kbAddKey('shift', 0, 2.25, 4, Lx('shift'), 'main');
    'ZXCVBNM'.split('').forEach((ch, i) => kbAddKey(ch.toLowerCase(), 2.25 + i, 1, 4, Lc(ch), 'main'));
    kbAddKey(',', 9.25, 1, 4, Ld('<', ','), 'main');
    kbAddKey('.', 10.25, 1, 4, Ld('>', '.'), 'main');
    kbAddKey('/', 11.25, 1, 4, Ld('?', '/'), 'main');
    kbAddKey('shift', 12.25, 2.75, 4, Lx('shift'), 'main');

    kbAddKey('control', 0, 1.25, 5, Lw('Ctrl'), 'main');
    kbAddKey(null, 1.25, 1.25, 5, Lx('win'), 'main');
    kbAddKey('alt', 2.5, 1.25, 5, Lw('Alt'), 'main');
    kbAddKey(' ', 3.75, 6.25, 5, null, 'main');
    kbAddKey('alt', 10, 1.25, 5, Lw('Alt'), 'main');
    kbAddKey(null, 11.25, 1.25, 5, Lx('win'), 'main');
    kbAddKey(null, 12.5, 1.25, 5, Lx('menu'), 'main');
    kbAddKey('control', 13.75, 1.25, 5, Lw('Ctrl'), 'main');

    kbAddKey('insert', 15.25, 1, 1, Lw('Insert'), 'nav');
    kbAddKey('home', 16.25, 1, 1, Lw('Home'), 'nav');
    kbAddKey('pageup', 17.25, 1, 1, Lw('Page\nUp'), 'nav');
    kbAddKey('delete', 15.25, 1, 2, Lw('Delete'), 'nav');
    kbAddKey('end', 16.25, 1, 2, Lw('End'), 'nav');
    kbAddKey('pagedown', 17.25, 1, 2, Lw('Page\nDown'), 'nav');
    kbAddKey('arrowup', 16.25, 1, 4, La('u'), 'arrows');
    kbAddKey('arrowleft', 15.25, 1, 5, La('l'), 'arrows');
    kbAddKey('arrowdown', 16.25, 1, 5, La('d'), 'arrows');
    kbAddKey('arrowright', 17.25, 1, 5, La('r'), 'arrows');

    kbAddKey(null, 18.5, 1, 1, Lw('Num\nLock'), 'numpad');
    kbAddKey(null, 19.5, 1, 1, Lc('/'), 'numpad');
    kbAddKey(null, 20.5, 1, 1, Lc('*'), 'numpad');
    kbAddKey(null, 21.5, 1, 1, Lc('-'), 'numpad');
    kbAddKey(null, 18.5, 1, 2, Ln('7', 'Home'), 'numpad');
    kbAddKey(null, 19.5, 1, 2, Ln('8', '↑'), 'numpad');
    kbAddKey(null, 20.5, 1, 2, Ln('9', 'PgUp'), 'numpad');
    kbAddKey(null, 21.5, 1, 2, Lc('+'), 'numpad', 2);
    kbAddKey(null, 18.5, 1, 3, Ln('4', '←'), 'numpad');
    kbAddKey(null, 19.5, 1, 3, Lc('5'), 'numpad');
    kbAddKey(null, 20.5, 1, 3, Ln('6', '→'), 'numpad');
    kbAddKey(null, 18.5, 1, 4, Ln('1', 'End'), 'numpad');
    kbAddKey(null, 19.5, 1, 4, Ln('2', '↓'), 'numpad');
    kbAddKey(null, 20.5, 1, 4, Ln('3', 'PgDn'), 'numpad');
    kbAddKey(null, 21.5, 1, 4, Lw('Enter'), 'numpad', 2);
    kbAddKey(null, 18.5, 2, 5, Ln('0', 'Ins'), 'numpad');
    kbAddKey(null, 20.5, 1, 5, Ln('.', 'Del'), 'numpad');

    const matKbTray = new THREE.MeshStandardMaterial({ color: 0x35312b, roughness: 0.8, metalness: 0.05 });
    Object.keys(kbClusters).forEach(name => {
      const cb = kbClusters[name];
      const tray = new THREE.Mesh(
        createRoundedBoxGeo(cb.x1 - cb.x0 + 0.05, 0.012, cb.z1 - cb.z0 + 0.05, 0.01, 2),
        matKbTray
      );
      tray.position.set((cb.x0 + cb.x1) / 2, 0.006, (cb.z0 + cb.z1) / 2);
      tray.receiveShadow = true;
      kbDeck.add(tray);
    });

    const kbPanelW = 0.58, kbPanelH = 0.145;
    const kbPanelX = kbX0 + (18.5 + 2) * KB_U;
    const kbPanelZ = kbRowZ(0);
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 580;
    ledCanvas.height = 150;
    const lg = ledCanvas.getContext('2d')!;
    lg.fillStyle = '#ece8dc';
    lg.fillRect(0, 0, 580, 150);
    lg.strokeStyle = '#bdb8a8';
    lg.lineWidth = 3;
    lg.strokeRect(1.5, 1.5, 577, 147);
    lg.fillStyle = '#a3263c';
    lg.fillRect(14, 36, 170, 52);
    lg.fillStyle = '#ffffff';
    lg.font = 'bold 38px Arial, Helvetica, sans-serif';
    lg.textAlign = 'center';
    lg.textBaseline = 'middle';
    lg.fillText('digital', 99, 63);
    lg.fillStyle = '#4a443a';
    lg.font = 'italic 19px Arial, Helvetica, sans-serif';
    [['Num', 'Lock'], ['Caps', 'Lock'], ['Scroll', 'Lock']].forEach((t, i) => {
      lg.fillText(t[0], 258 + i * 120, 112);
      lg.fillText(t[1], 258 + i * 120, 134);
    });
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.anisotropy = 4;
    const ledPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(kbPanelW, kbPanelH),
      new THREE.MeshStandardMaterial({ map: ledTex, roughness: 0.5 })
    );
    ledPanel.rotation.x = -Math.PI / 2;
    ledPanel.position.set(kbPanelX, 0.0015, kbPanelZ);
    ledPanel.receiveShadow = true;
    kbDeck.add(ledPanel);

    [0, 1, 2].forEach(i => {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.034, 0.006, 0.008),
        new THREE.MeshBasicMaterial({ color: i === 0 ? 0x58ff3c : 0x2a2c26 })
      );
      led.position.set(
        kbPanelX - kbPanelW / 2 + (258 + i * 120) * (kbPanelW / 580),
        0.004,
        kbPanelZ + (92 - 75) * (kbPanelH / 150)
      );
      kbDeck.add(led);
    });

    const stainCanvas = document.createElement('canvas');
    stainCanvas.width = 1024;
    stainCanvas.height = 256;
    const sg = stainCanvas.getContext('2d')!;
    sg.fillStyle = 'rgba(190, 160, 80, 0.10)';
    sg.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 46; i++) {
      const sx = Math.random() * 1024, sy = 130 + Math.random() * 110, sr = 14 + Math.random() * 60;
      const gr = sg.createRadialGradient(sx, sy, 0, sx, sy, sr);
      gr.addColorStop(0, 'rgba(196, 132, 52, ' + (0.05 + Math.random() * 0.14) + ')');
      gr.addColorStop(1, 'rgba(196, 132, 52, 0)');
      sg.fillStyle = gr;
      sg.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
    }
    const stainMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(KB_W - 0.1, 0.32),
      new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(stainCanvas), transparent: true, roughness: 0.8,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
      })
    );
    stainMesh.rotation.x = -Math.PI / 2;
    stainMesh.position.set(0, 0.0012, 0.46);
    kbDeck.add(stainMesh);

    const kbCordBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.042, 0.14, 20), matBeigeDark);
    kbCordBoot.rotation.x = Math.PI / 2;
    kbCordBoot.position.set(0.32, 0.075, -0.66);
    kbGroup.add(kbCordBoot);
    scene.add(kbGroup);

    // D. GOOSENECK DESK LAMP
    const lampGroup = new THREE.Group();
    lampGroup.position.set(2.3, 0, -0.5);
    const kbAimWorld = new THREE.Vector3(0.28, 0.15, 1.52);
    lampGroup.rotation.y = Math.atan2(
      -(kbAimWorld.z - lampGroup.position.z),
      kbAimWorld.x - lampGroup.position.x
    );

    const lightWoodTex = createLightNordicWoodTexture();
    const matNordicWood = new THREE.MeshStandardMaterial({
      map: lightWoodTex, roughness: 0.46, metalness: 0.04, side: THREE.DoubleSide
    });
    const matMatteBlack = new THREE.MeshStandardMaterial({
      color: 0x18191c, roughness: 0.42, metalness: 0.28, side: THREE.DoubleSide
    });
    const matGooseneck = new THREE.MeshStandardMaterial({
      color: 0x141518, roughness: 0.55, metalness: 0.18, side: THREE.DoubleSide
    });
    const matChromeAccent = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8, roughness: 0.22, metalness: 0.88
    });

    const baseProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.50, 0.0),
      new THREE.Vector2(0.53, 0.018),
      new THREE.Vector2(0.53, 0.145),
      new THREE.Vector2(0.49, 0.172),
      new THREE.Vector2(0.0, 0.172),
    ];
    const lampBase = new THREE.Mesh(new THREE.LatheGeometry(baseProfile, 64), matMatteBlack);
    lampBase.castShadow = true;
    lampBase.receiveShadow = true;
    lampBase.name = 'LAMP_TOGGLE';
    lampGroup.add(lampBase);

    const stemBaseFitting = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.064, 0.04, 28), matMatteBlack);
    stemBaseFitting.position.set(-0.22, 0.18, 0);
    lampGroup.add(stemBaseFitting);

    const lampHeadGroup = new THREE.Group();
    lampHeadGroup.position.set(0.36, 2.16, 0);
    const horizDistToKb = Math.hypot(kbAimWorld.x - lampGroup.position.x, kbAimWorld.z - lampGroup.position.z);
    const headToKbX = horizDistToKb - lampHeadGroup.position.x;
    const headToKbY = lampHeadGroup.position.y - kbAimWorld.y;
    const headTiltZ = Math.atan2(headToKbX, headToKbY);
    lampHeadGroup.rotation.z = headTiltZ;
    lampGroup.add(lampHeadGroup);

    const neckJointCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.058, 0.045, 24), matChromeAccent);
    neckJointCollar.position.set(-0.168, 0.05, 0);
    neckJointCollar.rotation.z = Math.PI / 2;
    neckJointCollar.name = 'LAMP_TOGGLE';
    lampHeadGroup.add(neckJointCollar);

    const cosT = Math.cos(headTiltZ);
    const sinT = Math.sin(headTiltZ);
    const localToLampGroup = (lx: number, ly: number) => new THREE.Vector3(
      lampHeadGroup.position.x + lx * cosT - ly * sinT,
      lampHeadGroup.position.y + lx * sinT + ly * cosT,
      0
    );

    const gooseneckPoints = [
      new THREE.Vector3(-0.22, 0.16, 0),
      new THREE.Vector3(-0.22, 0.68, 0),
      new THREE.Vector3(-0.19, 1.24, 0),
      new THREE.Vector3(-0.11, 1.68, 0),
      localToLampGroup(-0.34, 0.05),
      localToLampGroup(-0.17, 0.05),
      localToLampGroup(-0.04, 0.05)
    ];
    const gooseneckMesh = new THREE.Mesh(createParallelTransportTubeGeo(gooseneckPoints, 96, 0.046, 24), matGooseneck);
    gooseneckMesh.castShadow = true;
    gooseneckMesh.receiveShadow = true;
    gooseneckMesh.name = 'LAMP_TOGGLE';
    lampGroup.add(gooseneckMesh);

    const woodCapProfile = [
      new THREE.Vector2(0.0, 0.21),
      new THREE.Vector2(0.168, 0.21),
      new THREE.Vector2(0.168, 0.32),
      new THREE.Vector2(0.148, 0.345),
      new THREE.Vector2(0.0, 0.345),
    ];
    const woodTopCap = new THREE.Mesh(new THREE.LatheGeometry(woodCapProfile, 48), matNordicWood);
    woodTopCap.castShadow = true;
    woodTopCap.receiveShadow = true;
    woodTopCap.name = 'LAMP_TOGGLE';
    lampHeadGroup.add(woodTopCap);

    const shadeOuterProfile = [
      new THREE.Vector2(0.0, 0.212),
      new THREE.Vector2(0.166, 0.212),
      new THREE.Vector2(0.168, -0.09),
      new THREE.Vector2(0.198, -0.14),
      new THREE.Vector2(0.295, -0.22),
      new THREE.Vector2(0.395, -0.34),
      new THREE.Vector2(0.478, -0.49),
      new THREE.Vector2(0.542, -0.65),
      new THREE.Vector2(0.562, -0.685),
      new THREE.Vector2(0.542, -0.70),
    ];
    const shadeOuterMesh = new THREE.Mesh(new THREE.LatheGeometry(shadeOuterProfile, 64), matMatteBlack);
    shadeOuterMesh.castShadow = true;
    shadeOuterMesh.receiveShadow = true;
    shadeOuterMesh.name = 'LAMP_TOGGLE';
    lampHeadGroup.add(shadeOuterMesh);

    const shadeInnerProfile = [
      new THREE.Vector2(0.540, -0.695),
      new THREE.Vector2(0.522, -0.645),
      new THREE.Vector2(0.460, -0.485),
      new THREE.Vector2(0.376, -0.335),
      new THREE.Vector2(0.276, -0.215),
      new THREE.Vector2(0.160, -0.125),
      new THREE.Vector2(0.0, -0.115),
    ];
    const domeInnerMat = new THREE.MeshStandardMaterial({
      color: 0xfff8eb, emissive: 0xffd28a, emissiveIntensity: 0.95, roughness: 0.22, side: THREE.BackSide
    });
    const shadeInnerMesh = new THREE.Mesh(new THREE.LatheGeometry(shadeInnerProfile, 64), domeInnerMat);
    shadeInnerMesh.name = 'LAMP_TOGGLE';
    lampHeadGroup.add(shadeInnerMesh);

    const lampBulbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff9e6 })
    );
    lampBulbMesh.position.set(0, -0.32, 0);
    lampBulbMesh.name = 'LAMP_TOGGLE';
    lampHeadGroup.add(lampBulbMesh);

    const coneGeo = new THREE.ConeGeometry(1.65, 2.95, 48, 1, true);
    coneGeo.translate(0, -1.475, 0);
    const coneMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0xffbe66) },
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float verticalFade = pow(vUv.y, 1.45) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
          float edgeSoftness = pow(abs(dot(vNormal, vViewDir)), 1.6);
          float pulse = 0.96 + 0.04 * sin(uTime * 2.5);
          float alpha = verticalFade * edgeSoftness * 0.115 * pulse;
          gl_FragColor = vec4(uColor, alpha);
        }
      `
    });
    const lampVolumetricCone = new THREE.Mesh(coneGeo, coneMat);
    lampVolumetricCone.position.set(0, -0.42, 0);
    lampVolumetricCone.raycast = () => {};
    lampHeadGroup.add(lampVolumetricCone);
    scene.add(lampGroup);

    // Dust Motes
    const dustCount = 90;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3]     = (Math.random() - 0.35) * 4.5;
      dustPositions[i * 3 + 1] = 0.25 + Math.random() * 2.5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.3) * 3.0;
      dustSeeds[i] = Math.random() * 100.0;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));

    const dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uLampOn: { value: 1.0 }
      },
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += mod(uTime * 0.06 + aSeed, 2.4) - 1.2;
          pos.x += sin(uTime * 0.4 + aSeed) * 0.08;
          pos.z += cos(uTime * 0.35 + aSeed) * 0.08;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = (14.0 / -mvPosition.z) * (0.6 + 0.4 * sin(uTime * 1.5 + aSeed));
          vAlpha = 0.25 + 0.25 * sin(uTime * 1.2 + aSeed * 3.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float uLampOn;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float softCircle = smoothstep(0.5, 0.05, dist);
          vec3 color = mix(vec3(0.35, 0.85, 0.35), vec3(1.0, 0.82, 0.48), uLampOn);
          gl_FragColor = vec4(color, softCircle * vAlpha * (0.35 + 0.65 * uLampOn));
        }
      `
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    dustParticles.raycast = () => {};
    scene.add(dustParticles);

    // Peripherals & Cables
    monitorGroup.updateMatrixWorld(true);
    kbGroup.updateMatrixWorld(true);

    const MON_YAW = monitorGroup.rotation.y;
    const nFront = new THREE.Vector3(Math.sin(MON_YAW), 0, Math.cos(MON_YAW));
    const nBack  = nFront.clone().multiplyScalar(-1);
    const matJack = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.8 });
    const matMetalShield = new THREE.MeshStandardMaterial({ color: 0xa8a8a2, metalness: 0.85, roughness: 0.25 });
    const PLUG_S = 0.6;

    function addJackAndPlug(localPos: THREE.Vector3, normal: THREE.Vector3, yaw: number) {
      const p = monitorGroup.localToWorld(localPos.clone());
      const jack = new THREE.Mesh(createRoundedBoxGeo(0.17, 0.075, 0.04, 0.012, 3), matJack);
      jack.position.copy(p).addScaledVector(normal, 0.005);
      jack.rotation.y = yaw;
      scene.add(jack);

      const plug = new THREE.Group();
      plug.scale.setScalar(PLUG_S);
      plug.rotation.y = yaw + Math.PI;
      plug.position.copy(p).addScaledVector(normal, 0.025 + 0.15 * PLUG_S);

      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.042, 0.14, 20), matBeigeDark);
      boot.rotation.x = Math.PI / 2;
      boot.position.z = -0.15;
      plug.add(boot);

      const hood = new THREE.Mesh(createTaperedCRTBackGeo(0.20, 0.08, 0.13, 0.065, 0.22, 0.022), matBeigeDark);
      hood.castShadow = true;
      hood.receiveShadow = true;
      plug.add(hood);

      const shield = new THREE.Mesh(createRoundedBoxGeo(0.15, 0.052, 0.055, 0.01, 3), matMetalShield);
      shield.position.z = 0.125;
      plug.add(shield);

      [-0.085, 0.085].forEach((sx) => {
        const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 12), matMetalShield);
        screw.rotation.x = Math.PI / 2;
        screw.position.set(sx, 0, 0.02);
        plug.add(screw);
      });
      scene.add(plug);
      return p.clone().addScaledVector(normal, 0.025 + 0.37 * PLUG_S);
    }

    function createDeskCable(points: THREE.Vector3[], radius: number, material: THREE.Material, segments = 320) {
      const geo = createParallelTransportTubeGeo(points, segments, radius, 18);
      const mesh = new THREE.Mesh(geo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      return mesh;
    }

    // Coiled Keyboard Cord
    const kbJackEnd = addJackAndPlug(new THREE.Vector3(0.75, 0.07, -0.77), nBack, MON_YAW + Math.PI);
    const kbBootWorldStart = kbGroup.localToWorld(new THREE.Vector3(0.32, 0.075, -0.71));
    const kbBootWorldExit  = kbGroup.localToWorld(new THREE.Vector3(0.32, 0.052, -0.88));
    const kbWireRadius = 0.019;
    const kbCoilRadius = 0.044;
    const kbFloorY = kbWireRadius + kbCoilRadius;

    const kbSpineCurve = new THREE.CatmullRomCurve3([
      kbBootWorldStart,
      kbBootWorldExit,
      new THREE.Vector3(0.80, kbFloorY, 0.30),
      new THREE.Vector3(0.85, kbFloorY, -0.20),
      new THREE.Vector3(0.68, kbFloorY, -0.80),
      new THREE.Vector3(0.35, kbFloorY, -1.30),
      new THREE.Vector3(0.00, kbFloorY, -1.60),
      kbJackEnd.clone().addScaledVector(nBack, 0.28).setY(0.07),
      kbJackEnd
    ], false, 'centripetal', 0.4);

    const COIL_U0 = 0.04, COIL_U1 = 0.88;
    const kbCoilLoops = Math.round(kbSpineCurve.getLength() * (COIL_U1 - COIL_U0) / 0.046);
    const kbTotalSamples = Math.max(1500, kbCoilLoops * 40);
    const kbCoilPoints: THREE.Vector3[] = [];
    const worldUp = new THREE.Vector3(0, 1, 0);
    const spineRight = new THREE.Vector3();

    for (let i = 0; i <= kbTotalSamples; i++) {
      const u = i / kbTotalSamples;
      const spinePt = kbSpineCurve.getPointAt(u);
      const spineTan = kbSpineCurve.getTangentAt(u).normalize();
      spineRight.crossVectors(spineTan, worldUp).normalize();

      let coilEnv = 0.0;
      if (u >= COIL_U0 && u <= COIL_U1) {
        const cu = (u - COIL_U0) / (COIL_U1 - COIL_U0);
        coilEnv = Math.sin(Math.min(1, cu * 12) * Math.PI * 0.5) * Math.sin(Math.min(1, (1 - cu) * 12) * Math.PI * 0.5);
      }
      const cuNorm = Math.max(0, Math.min(1, (u - COIL_U0) / (COIL_U1 - COIL_U0)));
      const angle = cuNorm * kbCoilLoops * Math.PI * 2;
      const r = kbCoilRadius * coilEnv;
      kbCoilPoints.push(new THREE.Vector3(
        spinePt.x + spineRight.x * Math.cos(angle) * r,
        spinePt.y + Math.sin(angle) * r,
        spinePt.z + spineRight.z * Math.cos(angle) * r
      ));
    }

    const coilGeo = createParallelTransportTubeGeo(kbCoilPoints, kbTotalSamples - 50, kbWireRadius, 16);
    const coilMesh = new THREE.Mesh(coilGeo, matBeigeCable);
    coilMesh.castShadow = true;
    coilMesh.receiveShadow = true;
    scene.add(coilMesh);

    // Vintage Beige PC Tower
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-2.95, 0, 0.38);
    towerGroup.rotation.y = 0.36;

    const tW = 1.08, tH = 2.42, tD = 2.28;
    const matTowerChassis = new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#c7c0b0', 0.16), roughness: 0.50, metalness: 0.12
    });
    const matTowerBezel = new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#d2cbbd', 0.15), roughness: 0.46, metalness: 0.06
    });
    const matTowerTrim = new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#aba291', 0.22), roughness: 0.54, metalness: 0.08
    });
    const matTowerTop = new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#6b665e', 0.25), roughness: 0.48, metalness: 0.22
    });

    const chassisMesh = new THREE.Mesh(createRoundedBoxGeo(tW, tH, tD - 0.18, 0.03, 4), matTowerChassis);
    chassisMesh.position.set(0, tH / 2 + 0.015, -0.09);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    towerGroup.add(chassisMesh);

    const topCoverMesh = new THREE.Mesh(createRoundedBoxGeo(tW + 0.008, 0.042, tD - 0.17, 0.014, 3), matTowerTop);
    topCoverMesh.position.set(0, tH + 0.012, -0.09);
    topCoverMesh.castShadow = true;
    topCoverMesh.receiveShadow = true;
    towerGroup.add(topCoverMesh);

    const ventSlotGeo = createRoundedBoxGeo(0.018, 0.062, 0.018, 0.004, 2);
    const matVentDark = new THREE.MeshBasicMaterial({ color: 0x10100e });
    for (const side of [-1, 1]) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 24; col++) {
          if (col === 8 || col === 16) continue;
          const vent = new THREE.Mesh(ventSlotGeo, matVentDark);
          vent.position.set(side * (tW / 2 + 0.002), 1.96 - row * 0.105, 0.46 - col * 0.052);
          towerGroup.add(vent);
        }
      }
      const gripIndent = new THREE.Mesh(createRoundedBoxGeo(0.02, 0.34, 0.11, 0.025, 3), matTowerTrim);
      gripIndent.position.set(side * (tW / 2 + 0.001), 1.24, -0.78);
      towerGroup.add(gripIndent);
    }

    const frontBezel = new THREE.Mesh(createRoundedBoxGeo(tW + 0.03, tH, 0.22, 0.055, 5), matTowerBezel);
    frontBezel.position.set(0, tH / 2 + 0.015, tD / 2 - 0.09);
    frontBezel.castShadow = true;
    frontBezel.receiveShadow = true;
    towerGroup.add(frontBezel);

    const cheekGeo = createRoundedBoxGeo(0.11, tH - 0.05, 0.24, 0.04, 4);
    [-1, 1].forEach((s) => {
      const cheek = new THREE.Mesh(cheekGeo, matTowerTrim);
      cheek.position.set(s * (tW / 2 - 0.035), tH / 2 + 0.015, tD / 2 - 0.075);
      cheek.rotation.y = s * -0.12;
      towerGroup.add(cheek);
    });

    const fZ = tD / 2 + 0.022;
    const bayW = 0.80, bayH = 0.22;
    const baySurround = new THREE.Mesh(createRoundedBoxGeo(bayW + 0.04, bayH * 4 + 0.06, 0.04, 0.01, 3), matTowerTrim);
    baySurround.position.set(0, 1.85, fZ - 0.012);
    towerGroup.add(baySurround);

    function addOpticalDriveBay(yPos: number, hasExtraControls: boolean) {
      const bayGroup = new THREE.Group();
      bayGroup.position.set(0, yPos, fZ);
      const face = new THREE.Mesh(createRoundedBoxGeo(bayW, bayH - 0.012, 0.04, 0.01, 3), matTowerBezel);
      bayGroup.add(face);
      const tray = new THREE.Mesh(createRoundedBoxGeo(bayW - 0.06, 0.115, 0.048, 0.008, 3), matTowerChassis);
      tray.position.set(0, 0.032, 0.004);
      bayGroup.add(tray);
      const eject = new THREE.Mesh(createRoundedBoxGeo(0.075, 0.028, 0.048, 0.006, 2), matTowerTrim);
      eject.position.set(0.27, -0.055, 0.006);
      bayGroup.add(eject);
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.012, 0.05),
        new THREE.MeshBasicMaterial({ color: hasExtraControls ? 0x45d62b : 0x2c4a24 })
      );
      led.position.set(0.04, -0.055, 0.006);
      bayGroup.add(led);
      const jackHole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 12), matVentDark);
      jackHole.rotation.x = Math.PI / 2;
      jackHole.position.set(-0.31, -0.055, 0.006);
      bayGroup.add(jackHole);
      if (hasExtraControls) {
        const volWheel = new THREE.Mesh(createRoundedBoxGeo(0.045, 0.018, 0.048, 0.004, 2), matDarkBezel);
        volWheel.position.set(-0.22, -0.055, 0.006);
        bayGroup.add(volWheel);
      }
      towerGroup.add(bayGroup);
    }

    addOpticalDriveBay(2.19, false);
    addOpticalDriveBay(1.96, true);

    for (let b = 0; b < 2; b++) {
      const blankY = 1.73 - b * 0.23;
      const blankPlate = new THREE.Mesh(
        createRoundedBoxGeo(bayW, bayH - 0.014, 0.038, 0.01, 3),
        b === 1 ? matTowerChassis : matTowerBezel
      );
      blankPlate.position.set(0, blankY, fZ - 0.003);
      if (b === 1) blankPlate.rotation.x = 0.06;
      towerGroup.add(blankPlate);
    }

    const floppyY = 1.15;
    const floppyRecess = new THREE.Mesh(createRoundedBoxGeo(0.64, 0.095, 0.045, 0.02, 3), matTowerTrim);
    floppyRecess.position.set(0, floppyY + 0.02, fZ - 0.008);
    towerGroup.add(floppyRecess);

    const floppySlot = new THREE.Mesh(createRoundedBoxGeo(0.50, 0.024, 0.05, 0.005, 2), matVentDark);
    floppySlot.position.set(0, floppyY + 0.022, fZ + 0.002);
    towerGroup.add(floppySlot);

    const floppyBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 18), matTowerBezel);
    floppyBtn.rotation.x = Math.PI / 2;
    floppyBtn.scale.set(1.35, 1, 0.72);
    floppyBtn.position.set(0.03, floppyY - 0.042, fZ + 0.008);
    towerGroup.add(floppyBtn);

    const medallionY = 0.56;
    const teardropOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.11, 0.038, 32), matTowerTrim);
    teardropOuter.rotation.x = Math.PI / 2;
    teardropOuter.scale.set(0.95, 1, 1.55);
    teardropOuter.position.set(0, medallionY, fZ - 0.002);
    towerGroup.add(teardropOuter);

    const blackBadge = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 28, 20),
      new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.18, metalness: 0.35 })
    );
    blackBadge.scale.set(0.92, 0.78, 0.24);
    blackBadge.position.set(0, medallionY + 0.095, fZ + 0.008);
    towerGroup.add(blackBadge);

    const pwrLedTower = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), new THREE.MeshBasicMaterial({ color: 0x48ff38 }));
    pwrLedTower.position.set(0.048, medallionY + 0.09, fZ + 0.044);
    towerGroup.add(pwrLedTower);

    const hddLedTower = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff5522 }));
    hddLedTower.position.set(-0.048, medallionY + 0.09, fZ + 0.044);
    towerGroup.add(hddLedTower);

    const silverShield = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.068, 0.044, 28), matMetalShield);
    silverShield.rotation.x = Math.PI / 2;
    silverShield.scale.set(0.92, 1, 1.35);
    silverShield.position.set(0, medallionY - 0.085, fZ + 0.005);
    towerGroup.add(silverShield);

    const mainPowerBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, 0.055, 24), matChromeAccent);
    mainPowerBtn.rotation.x = Math.PI / 2;
    mainPowerBtn.position.set(0, medallionY - 0.035, fZ + 0.014);
    towerGroup.add(mainPowerBtn);

    const resetBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.052, 20), matChromeAccent);
    resetBtn.rotation.x = Math.PI / 2;
    resetBtn.position.set(0, medallionY - 0.145, fZ + 0.014);
    towerGroup.add(resetBtn);

    const towerBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 20), matBeigeDark);
    towerBoot.rotation.x = Math.PI / 2;
    towerBoot.position.set(0.18, 0.22, -tD / 2 - 0.08);
    towerGroup.add(towerBoot);

    scene.add(towerGroup);
    towerGroup.updateMatrixWorld(true);

    const driveJackEnd = addJackAndPlug(new THREE.Vector3(-0.5, 0.07, -0.77), nBack, MON_YAW + Math.PI);
    const rDark = 0.024;
    createDeskCable([
      towerGroup.localToWorld(new THREE.Vector3(0.18, 0.22, -tD / 2 - 0.12)),
      towerGroup.localToWorld(new THREE.Vector3(0.24, 0.08, -tD / 2 - 0.30)),
      new THREE.Vector3(-2.35, rDark, -1.15),
      new THREE.Vector3(-1.82, rDark, -1.38),
      driveJackEnd.clone().addScaledVector(nBack, 0.30).setY(0.05),
      driveJackEnd
    ], rDark, matDarkCable, 360);

    // Mouse & Pad
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(3.0, 0.012, 1.2);
    mouseGroup.rotation.y = -0.1;

    const mouseProfile = [
      [0.000,  0.300], [0.100,  0.300], [0.150,  0.272], [0.175,  0.200],
      [0.185,  0.100], [0.188,  0.000], [0.186, -0.080], [0.178, -0.170],
      [0.160, -0.240], [0.120, -0.285], [0.060, -0.307], [0.000, -0.310]
    ];
    const MOUSE_H = 0.85, MOUSE_Y = 0.02;
    function mouseRadiusAt(yl: number) {
      for (let i = 0; i < mouseProfile.length - 1; i++) {
        const a = mouseProfile[i], b = mouseProfile[i + 1];
        if (yl <= a[1] && yl >= b[1]) {
          const t = (a[1] - yl) / (a[1] - b[1]);
          return a[0] + (b[0] - a[0]) * t;
        }
      }
      return 0;
    }
    const mouseBodyGeo = new THREE.LatheGeometry(mouseProfile.map(q => new THREE.Vector2(q[0], q[1])), 64, Math.PI, Math.PI * 2);
    mouseBodyGeo.rotateX(-Math.PI / 2);
    const mbp = mouseBodyGeo.attributes.position;
    for (let i = 0; i < mbp.count; i++) {
      const y = mbp.getY(i);
      mbp.setY(i, y >= 0 ? y * MOUSE_H : y * 0.10);
    }
    mouseBodyGeo.computeVertexNormals();

    const matMouseShell = new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#cfc9bb', 0.10), roughness: 0.34, metalness: 0.03, side: THREE.DoubleSide
    });
    const mouseBody = new THREE.Mesh(mouseBodyGeo, matMouseShell);
    mouseBody.position.y = MOUSE_Y;
    mouseBody.castShadow = true;
    mouseBody.receiveShadow = true;
    mouseGroup.add(mouseBody);

    const seamPts: THREE.Vector3[] = [];
    for (let k = 0; k <= 24; k++) {
      const x = -0.172 + (0.344 * k) / 24;
      const z = -0.10 + 0.022 * (1 - Math.pow(x / 0.18, 2));
      const r = mouseRadiusAt(-z);
      seamPts.push(new THREE.Vector3(x, Math.sqrt(Math.max(0, r * r - x * x)) * MOUSE_H + MOUSE_Y + 0.001, z));
    }
    const mouseSeam = new THREE.Mesh(createParallelTransportTubeGeo(seamPts, 80, 0.0022, 8), matJack);
    mouseGroup.add(mouseSeam);

    const splitPts: THREE.Vector3[] = [];
    for (let z = -0.295; z <= -0.0775; z += 0.0275) {
      splitPts.push(new THREE.Vector3(0, mouseRadiusAt(-z) * MOUSE_H + MOUSE_Y + 0.001, z));
    }
    const mouseSplit = new THREE.Mesh(createParallelTransportTubeGeo(splitPts, 40, 0.0022, 8), matJack);
    mouseGroup.add(mouseSplit);

    const mouseWheel = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x4b5256, roughness: 0.5, metalness: 0.05 })
    );
    mouseWheel.scale.set(0.030, 0.020, 0.062);
    mouseWheel.position.set(0, mouseRadiusAt(0.195) * MOUSE_H + MOUSE_Y - 0.003, -0.195);
    mouseWheel.castShadow = true;
    mouseGroup.add(mouseWheel);

    const mouseBoot = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.026, 0.09, 18), matBeigeDark);
    mouseBoot.rotation.x = Math.PI / 2;
    mouseBoot.position.set(0, 0.06, -0.325);
    mouseGroup.add(mouseBoot);

    const padW = 1.3, padH = 1.15, padR = 0.09;
    const padShape = new THREE.Shape();
    padShape.moveTo(-padW / 2 + padR, -padH / 2);
    padShape.lineTo(padW / 2 - padR, -padH / 2);
    padShape.absarc(padW / 2 - padR, -padH / 2 + padR, padR, -Math.PI / 2, 0, false);
    padShape.lineTo(padW / 2, padH / 2 - padR);
    padShape.absarc(padW / 2 - padR, padH / 2 - padR, padR, 0, Math.PI / 2, false);
    padShape.lineTo(-padW / 2 + padR, padH / 2);
    padShape.absarc(-padW / 2 + padR, padH / 2 - padR, padR, Math.PI / 2, Math.PI, false);
    padShape.lineTo(-padW / 2, -padH / 2 + padR);
    padShape.absarc(-padW / 2 + padR, -padH / 2 + padR, padR, Math.PI, Math.PI * 1.5, false);
    const padGeo = new THREE.ExtrudeGeometry(padShape, { depth: 0.012, bevelEnabled: false, curveSegments: 16 });
    padGeo.rotateX(-Math.PI / 2);
    const padMesh = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({
      map: createAgedBeigeTexture('#3a4890', 0.14), roughness: 0.95, metalness: 0.0
    }));
    padMesh.position.set(3.05, 0, 1.2);
    padMesh.rotation.y = -0.1;
    padMesh.receiveShadow = true;
    scene.add(padMesh);
    scene.add(mouseGroup);
    mouseGroup.updateMatrixWorld(true);

    const mouseJackEnd = addJackAndPlug(new THREE.Vector3(0.35, 0.07, -0.77), nBack, MON_YAW + Math.PI);
    const rBeige = 0.020;
    createDeskCable([
      mouseGroup.localToWorld(new THREE.Vector3(0, 0.06, -0.34)),
      mouseGroup.localToWorld(new THREE.Vector3(0, 0.05, -0.44)),
      mouseGroup.localToWorld(new THREE.Vector3(0, 0.03, -0.60)),
      new THREE.Vector3(2.76, rBeige, 0.40),
      new THREE.Vector3(2.40, rBeige * 1.4, 0.22),
      new THREE.Vector3(2.00, rBeige, 0.20),
      new THREE.Vector3(1.65, rBeige * 1.3, 0.12),
      new THREE.Vector3(1.30, rBeige, -0.20),
      new THREE.Vector3(1.10, rBeige, -0.70),
      new THREE.Vector3(0.90, rBeige, -1.30),
      new THREE.Vector3(0.60, rBeige, -1.90),
      new THREE.Vector3(0.15, rBeige, -2.15),
      mouseJackEnd.clone().addScaledVector(nBack, 0.60).setY(0.03),
      mouseJackEnd.clone().addScaledVector(nBack, 0.25).setY(0.06),
      mouseJackEnd
    ], rBeige, matBeigeCable, 480);

    const noteGeo = new THREE.PlaneGeometry(0.68, 0.32, 16, 8);
    const nPos = noteGeo.attributes.position;
    for (let i = 0; i < nPos.count; i++) {
      const nx = nPos.getX(i);
      nPos.setZ(i, Math.pow(nx * 2.2, 2) * 0.012);
    }
    noteGeo.computeVertexNormals();
    const noteMat = new THREE.MeshStandardMaterial({ color: 0x858a72, roughness: 0.85, side: THREE.DoubleSide });
    const noteMesh = new THREE.Mesh(noteGeo, noteMat);
    noteMesh.rotation.x = -Math.PI / 2;
    noteMesh.rotation.z = 0.18;
    noteMesh.position.set(3.5, 0.01, 0.15);
    noteMesh.receiveShadow = true;
    scene.add(noteMesh);

    // Origami Airmail Paper Airplane
    const planeTex = createPaperPlaneTexture();
    const planeGeo = createPaperAirplaneGeo();
    const planeMat = new THREE.MeshStandardMaterial({
      map: planeTex,
      roughness: 0.68,
      metalness: 0.02,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.castShadow = true;
    planeMesh.receiveShadow = true;
    planeMesh.name = 'PAPER_PLANE';

    const planeGroup = new THREE.Group();
    planeGroup.name = 'PAPER_PLANE_GROUP';
    planeGroup.add(planeMesh);
    scene.add(planeGroup);

    // Flight Path Curves
    // 1. Entrance Flight (Starts high on LEFT, glides left-to-right while descending in foreground, reaches desk below)
    // Crucially never passes in front of or over the CRT screen (z stays in foreground >= 0.68, y descends cleanly)
    const entranceFlightPoints = [
      new THREE.Vector3(-3.4, 2.6, 3.8),     // High left entry in camera view
      new THREE.Vector3(-2.2, 2.0, 3.2),     // Descending glide across foreground (well in front of CRT)
      new THREE.Vector3(-0.9, 1.4, 2.6),     // Continuing left-to-right descent below screen level
      new THREE.Vector3(0.5, 0.9, 2.0),      // Crossing center-right in front of keyboard
      new THREE.Vector3(1.6, 0.52, 1.45),    // Gliding down to right desk flank
      new THREE.Vector3(1.25, 0.26, 1.05),   // Curving gently inward toward desk runway
      new THREE.Vector3(0.4, 0.11, 0.82),    // Short final approach
      new THREE.Vector3(-0.05, 0.028, 0.72), // Soft flair touchdown
      new THREE.Vector3(-0.14, 0.015, 0.68)  // Gentle settle between keyboard & monitor
    ];
    const entranceCurve = new THREE.CatmullRomCurve3(entranceFlightPoints, false, 'centripetal', 0.5);

    // 2. Loop Flight (taking off from desk, quick low sweep to right and back)
    const loopFlightPoints = [
      new THREE.Vector3(-0.14, 0.015, 0.68), // On desk
      new THREE.Vector3(0.2, 0.22, 0.85),    // Lift off to right
      new THREE.Vector3(1.1, 0.65, 1.3),     // Climbing right
      new THREE.Vector3(1.8, 1.15, 1.6),     // Arc to right
      new THREE.Vector3(0.8, 1.05, 2.4),     // Swooping around foreground
      new THREE.Vector3(-1.2, 0.85, 2.2),    // Low left turn (well below CRT)
      new THREE.Vector3(-0.8, 0.45, 1.4),    // Turning back right
      new THREE.Vector3(0.1, 0.12, 0.85),    // Aligning final approach
      new THREE.Vector3(-0.14, 0.015, 0.68)  // Touchdown between keyboard & monitor
    ];
    const loopCurve = new THREE.CatmullRomCurve3(loopFlightPoints, false, 'centripetal', 0.5);

    // 3. Delivery Flight (launches from desk, accelerates to right and into distance)
    const deliveryFlightPoints = [
      new THREE.Vector3(-0.14, 0.015, 0.68), // On desk
      new THREE.Vector3(0.2, 0.18, 0.55),    // Rapid lift off
      new THREE.Vector3(0.9, 0.65, 0.35),    // Climbing rightward
      new THREE.Vector3(1.8, 1.35, 0.10),    // Through volumetric light beam
      new THREE.Vector3(2.8, 2.20, -0.40),   // Banking high right
      new THREE.Vector3(4.2, 3.40, -1.20)    // Flying away
    ];
    const deliveryCurve = new THREE.CatmullRomCurve3(deliveryFlightPoints, false, 'centripetal', 0.5);

    launchPlaneLoop = () => {
      planeGroup.visible = true;
      planeState.mode = 'loop';
      planeState.time = 0;
      sfx.playPaperRustle();
      showToast('RECONNAISSANCE FLIGHT', 'Paper airplane taking off on a room circuit...');
    };

    launchPlaneDelivery = () => {
      planeGroup.visible = true;
      planeState.mode = 'deliver';
      planeState.time = 0;
      sfx.playPaperRustle();
    };

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x28221b, 0.72);
    scene.add(ambientLight);

    const lampSpotLight = new THREE.SpotLight(0xffb85c, 5.4);
    lampSpotLight.position.set(0, -0.32, 0);
    lampSpotLight.target.position.set(0, -3.2, 0);
    lampSpotLight.angle = Math.PI / 2.85;
    lampSpotLight.penumbra = 0.62;
    lampSpotLight.decay = 1.45;
    lampSpotLight.distance = 12;
    lampSpotLight.castShadow = true;
    lampSpotLight.shadow.mapSize.width = 2048;
    lampSpotLight.shadow.mapSize.height = 2048;
    lampSpotLight.shadow.bias = -0.0004;
    lampHeadGroup.add(lampSpotLight);
    lampHeadGroup.add(lampSpotLight.target);

    const lampFillLight = new THREE.PointLight(0xffaa44, 1.65, 6.5, 1.8);
    lampFillLight.position.set(0, -0.52, 0);
    lampHeadGroup.add(lampFillLight);

    scene.updateMatrixWorld(true);
    lampBulbMesh.getWorldPosition(crtShaderUniforms.uLampWorldPos.value);

    const crtGlowLight = new THREE.PointLight(0xdbe6ff, 0.62, 3.2, 2.0);
    crtGlowLight.position.set(-0.35, 1.48, 0.55);
    scene.add(crtGlowLight);

    const rimLight = new THREE.DirectionalLight(0x4b5c6b, 0.45);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    // Interaction State & Event Listeners
    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevPointerPos = { x: 0, y: 0 };

    function updateCameraPosition() {
      camSpherical.radius += (targetSpherical.radius - camSpherical.radius) * 0.08;
      camSpherical.theta += (targetSpherical.theta - camSpherical.theta) * 0.08;
      camSpherical.phi += (targetSpherical.phi - camSpherical.phi) * 0.08;
      currentLookAt.lerp(targetLookAt, 0.08);

      const r = camSpherical.radius;
      const sinPhi = Math.sin(camSpherical.phi);
      camera.position.x = currentLookAt.x + r * sinPhi * Math.sin(camSpherical.theta);
      camera.position.y = currentLookAt.y + r * Math.cos(camSpherical.phi);
      camera.position.z = currentLookAt.z + r * sinPhi * Math.cos(camSpherical.theta);
      camera.lookAt(currentLookAt);
    }

    function depressRandom3DKey() {
      if (keyCapMeshes.length === 0) return;
      const key = (lastKeyId && kbKeyById[lastKeyId]) || keyCapMeshes[Math.floor(Math.random() * keyCapMeshes.length)];
      key.position.y = key.userData.restY - 0.045;
      setTimeout(() => {
        key.position.y = key.userData.restY;
      }, 95);
    }

    function toggleDeskLamp() {
      isLampOn = !isLampOn;
      sfx.playLampSwitch();
      lampSpotLight.intensity = isLampOn ? 5.4 : 0.0;
      lampFillLight.intensity = isLampOn ? 1.65 : 0.0;
      (lampBulbMesh.material as THREE.MeshBasicMaterial).color.setHex(isLampOn ? 0xfff9e6 : 0x3a352d);
      domeInnerMat.emissiveIntensity = isLampOn ? 0.95 : 0.0;
      crtShaderUniforms.uLampOn.value = isLampOn ? 1.0 : 0.0;
      if (lampVolumetricCone) lampVolumetricCone.visible = isLampOn;
      if (dustParticles) (dustParticles.material as THREE.ShaderMaterial).uniforms.uLampOn.value = isLampOn ? 1.0 : 0.0;
    }

    function toggleCRTFocus() {
      isFocusedOnCRT = !isFocusedOnCRT;
      if (isFocusedOnCRT) {
        targetSpherical = { ...focusedCamSpherical };
        targetLookAt.copy(focusedCamTarget);
      } else {
        targetSpherical = { ...defaultCamSpherical };
        targetLookAt.copy(defaultCamTarget);
      }
    }

    function handlePointerMove(clientX: number, clientY: number) {
      if (isDragging) {
        const dx = clientX - prevPointerPos.x;
        const dy = clientY - prevPointerPos.y;
        prevPointerPos = { x: clientX, y: clientY };

        targetSpherical.theta -= dx * 0.0045;
        targetSpherical.phi -= dy * 0.0038;
        targetSpherical.theta = Math.max(-0.55, Math.min(1.05, targetSpherical.theta));
        targetSpherical.phi = Math.max(0.85, Math.min(1.50, targetSpherical.phi));
        return;
      }

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObject(crtScreenMesh);
      if (hits.length > 0 && hits[0].uv) {
        const uv = hits[0].uv;
        const ccx = uv.x - 0.5, ccy = uv.y - 0.5, cd = ccx * ccx + ccy * ccy;
        const duv = { x: uv.x + ccx * cd * 0.14, y: uv.y + ccy * cd * 0.14 };
        const canvasY = (1 - duv.y) * crtCanvas.height;
        const canvasX = duv.x * crtCanvas.width;

        let foundHover = -1;
        terminalState.regions.forEach((reg, idx) => {
          if (canvasX >= reg.x0 && canvasX <= reg.x1 && canvasY >= reg.y0 && canvasY <= reg.y1) {
            foundHover = idx;
          }
        });
        if (foundHover !== terminalState.hoveredItem) {
          terminalState.hoveredItem = foundHover;
          renderCRTScreen();
        }
        document.body.style.cursor = foundHover !== -1 ? 'pointer' : 'default';
      } else {
        if (terminalState.hoveredItem !== -1) {
          terminalState.hoveredItem = -1;
          renderCRTScreen();
        }
        if (planeState.mode === 'landed') {
          const planeHits = raycaster.intersectObject(planeMesh);
          if (planeHits.length > 0) {
            document.body.style.cursor = 'pointer';
            return;
          }
        }
        document.body.style.cursor = 'default';
      }
    }

    function handleSceneClick(clientX: number, clientY: number) {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const hits = raycaster.intersectObjects(scene.children, true);
      if (hits.length === 0) return;
      const hitObj = hits[0].object;

      if (hitObj.name === 'PAPER_PLANE' || hitObj.parent?.name === 'PAPER_PLANE_GROUP') {
        if (planeState.mode === 'landed') {
          launchPlaneLoop();
          return;
        }
      }

      if (hitObj.name === 'CRT_SCREEN') {
        if (terminalState.hoveredItem !== -1) {
          activateRegion(terminalState.regions[terminalState.hoveredItem]);
        } else if (!isFocusedOnCRT) {
          toggleCRTFocus();
        }
        return;
      }

      if (hitObj.name === 'LAMP_TOGGLE') {
        toggleDeskLamp();
        return;
      }
    }

    const kbShifted: Record<string, string> = {
      '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
      '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/', '~': '`'
    };

    function handleFormKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack?.();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      let k = (e.key || '').toLowerCase();
      if (kbShifted[e.key]) k = kbShifted[e.key];
      lastKeyId = k;

      const ts = terminalState;
      if (ts.sent) {
        if (e.key === 'Enter') { e.preventDefault(); resetForm(); }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        sfx.playKeyClick(0);
        focusStep(e.shiftKey ? -1 : 1);
        return;
      }

      const def = FIELD_DEFS.find(f => f.id === ts.focus);
      if (!def) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (ts.focus === 'send') sendMessage(); else clearForm();
        }
        return;
      }

      const val = ts.fields[def.id] || '';
      if (e.key === 'Backspace') {
        e.preventDefault();
        ts.fields[def.id] = val.slice(0, -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (def.multi && wrapLines(val + '\n', MSG_COLS).length <= MSG_LINES && val.length < def.max) {
          ts.fields[def.id] = val + '\n';
        } else {
          sfx.playKeyClick(2);
          focusStep(1);
          return;
        }
      } else if (e.key.length === 1) {
        e.preventDefault();
        if (val.length >= def.max) return;
        if (def.multi && wrapLines(val + e.key, MSG_COLS).length > MSG_LINES) return;
        ts.fields[def.id] = val + e.key;
      } else {
        return;
      }

      ts.status = '';
      sfx.playKeyClick((Math.random() - 0.5) * 2);
      depressRandom3DKey();
      renderCRTScreen();
    }

    // Pointer events binding
    const dom = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevPointerPos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 6) {
        handleSceneClick(e.clientX, e.clientY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetSpherical.radius += e.deltaY * 0.0035;
      targetSpherical.radius = Math.max(3.4, Math.min(10.5, targetSpherical.radius));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevPointerPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      isDragging = false;
      if (e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const dist = Math.hypot(t.clientX - pointerDownPos.x, t.clientY - pointerDownPos.y);
        if (dist < 10) handleSceneClick(t.clientX, t.clientY);
      }
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', handleFormKey);
    window.addEventListener('resize', onResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      updateCameraPosition();

      crtShaderUniforms.uTime.value = elapsed;
      const targetHoverBoost = terminalState.hoveredItem !== -1 ? 1.0 : 0.0;
      crtShaderUniforms.uHoverBoost.value += (targetHoverBoost - crtShaderUniforms.uHoverBoost.value) * 0.12;

      // Paper Airplane Flight Dynamics
      if (planeState.mode === 'entrance' || planeState.mode === 'loop' || planeState.mode === 'deliver') {
        const activeCurve = planeState.mode === 'deliver'
          ? deliveryCurve
          : (planeState.mode === 'loop' ? loopCurve : entranceCurve);
        const duration = planeState.mode === 'deliver' ? 3.8 : (planeState.mode === 'loop' ? 6.2 : 7.4);

        planeState.time += 0.016;
        const t = Math.min(1.0, planeState.time / duration);

        let easeT: number;
        if (planeState.mode === 'deliver') {
          easeT = t * t;
        } else {
          // Graceful cruising speed with soft flair before touchdown
          easeT = t < 0.86 ? (t / 0.86) * 0.86 : 0.86 + Math.sin(((t - 0.86) / 0.14) * Math.PI * 0.5) * 0.14;
        }

        const pt = activeCurve.getPointAt(easeT);
        const tangent = activeCurve.getTangentAt(easeT).normalize();

        planeGroup.position.copy(pt);

        // Heading: look along path
        const lookTarget = pt.clone().add(tangent);
        planeGroup.lookAt(lookTarget);

        // Aerodynamic banking roll into curves
        const dt = 0.01;
        const tNext = activeCurve.getTangentAt(Math.min(1.0, easeT + dt)).normalize();
        const turnRate = (tNext.x - tangent.x) / dt;
        const targetRoll = THREE.MathUtils.clamp(-turnRate * 0.35, -0.75, 0.75);

        // Subtle airflow turbulence (diminishes as plane touches down)
        const speedFactor = 1.0 - Math.pow(easeT, 2);
        const flutter = Math.sin(planeState.time * 9.5) * 0.028 * speedFactor;
        const pitchFlutter = Math.sin(planeState.time * 7.5 + 1.2) * 0.014 * speedFactor;

        planeMesh.rotation.z = targetRoll + flutter;
        planeMesh.rotation.x = pitchFlutter;

        if (t >= 1.0) {
          if (planeState.mode === 'deliver') {
            planeGroup.visible = false;
            planeState.mode = 'dispatched';
          } else {
            planeState.mode = 'landed';
            planeGroup.position.set(-0.14, 0.015, 0.68);
            planeGroup.rotation.set(0.02, 0.22, 0.06);
            planeMesh.rotation.set(0, 0, 0);
            sfx.playPaperRustle();
          }
        }
      }

      if (lampVolumetricCone) {
        lampVolumetricCone.material.uniforms.uTime.value = elapsed;
      }
      if (dustParticles) {
        dustParticles.material.uniforms.uTime.value = elapsed;
      }
      if (crtGlowLight) {
        crtGlowLight.intensity = 0.60 + Math.sin(elapsed * 32) * 0.015;
      }

      renderer.render(scene, camera);
    }
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(cursorInterval);
      document.body.style.cursor = 'default';

      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', handleFormKey);
      window.removeEventListener('resize', onResize);

      sfx.dispose();

      // Dispose Three.js objects
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach(m => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
      woodTex.dispose();
      beigeLightTex.dispose();
      beigeDarkTex.dispose();
      darkCharcoalTex.dispose();
      wallTex.dispose();
      lightWoodTex.dispose();
      crtTexture.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      planeTex.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [active, onBack, showToast]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#0b0a08]">
      {/* 3D Canvas Mounting Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-[1]" />

      {/* Cinematic Vignette Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: 'radial-gradient(circle at 52% 48%, rgba(0,0,0,0) 45%, rgba(6,5,4,0.68) 100%)',
        }}
      />

      {/* Toast Notification */}
      <div
        className={`fixed top-20 right-4 z-20 px-4 py-3 rounded-xl border-l-4 border-emerald-400 text-xs text-stone-200 transition-all duration-300 pointer-events-none ${
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[10px]'
        }`}
        style={{
          background: 'rgba(20, 18, 15, 0.78)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 190, 100, 0.18)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="font-semibold text-emerald-400 mb-0.5">{toast.title}</div>
        <div className="text-stone-300">{toast.body}</div>
      </div>
    </div>
  );
};

export default FieldMailTerminal;

