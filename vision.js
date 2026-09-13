// Aura Edge Vision - Real-Time Detection Engine
(function () {
  'use strict';

  const canvas = document.getElementById('vision-canvas');
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('webcam-video');
  const btnToggleCamera = document.getElementById('btn-toggle-camera');
  const camBtnText = document.getElementById('cam-btn-text');
  const feedStatusText = document.getElementById('feed-status-text');
  const hudLatency = document.getElementById('hud-latency');
  const hudFps = document.getElementById('hud-fps');
  const hudCount = document.getElementById('hud-count');
  const hudConf = document.getElementById('hud-conf');
  const detectionLog = document.getElementById('detection-log');

  let width = 0;
  let height = 0;
  let useCamera = false;
  let stream = null;

  function resize() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  // Simulated Tracked Objects
  const syntheticObjects = [
    { label: 'Person', color: '#10b981', x: 0.25, y: 0.2, w: 0.22, h: 0.55, vx: 0.001, vy: 0.0005, conf: 0.96 },
    { label: 'Face Tracker', color: '#06b6d4', x: 0.31, y: 0.25, w: 0.1, h: 0.14, vx: 0.001, vy: 0.0005, conf: 0.98 },
    { label: 'Workstation', color: '#a855f7', x: 0.65, y: 0.45, w: 0.26, h: 0.38, vx: 0, vy: 0, conf: 0.91 },
    { label: 'Hardware Sensor', color: '#f59e0b', x: 0.58, y: 0.35, w: 0.08, h: 0.12, vx: -0.0008, vy: 0.0003, conf: 0.89 }
  ];

  function drawBoundingBox(obj) {
    const rx = obj.x * width;
    const ry = obj.y * height;
    const rw = obj.w * width;
    const rh = obj.h * height;

    // Corner crosshair brackets
    ctx.strokeStyle = obj.color;
    ctx.lineWidth = 2;
    const cornerLen = 16;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(rx, ry + cornerLen);
    ctx.lineTo(rx, ry);
    ctx.lineTo(rx + cornerLen, ry);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cornerLen, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.lineTo(rx + rw, ry + cornerLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(rx, ry + rh - cornerLen);
    ctx.lineTo(rx, ry + rh);
    ctx.lineTo(rx + cornerLen, ry + rh);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cornerLen, ry + rh);
    ctx.lineTo(rx + rw, ry + rh);
    ctx.lineTo(rx + rw, ry + rh - cornerLen);
    ctx.stroke();

    // Box fill subtle
    ctx.fillStyle = obj.color + '15';
    ctx.fillRect(rx, ry, rw, rh);

    // Label tag
    ctx.fillStyle = obj.color;
    ctx.fillRect(rx, ry - 22, ctx.measureText(`${obj.label} ${Math.round(obj.conf * 100)}%`).width + 16, 20);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#050b14';
    ctx.fillText(`${obj.label} ${Math.round(obj.conf * 100)}%`, rx + 6, ry - 8);
  }

  let lastFrameTime = performance.now();
  let frameCount = 0;
  let fpsTimer = performance.now();

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (useCamera && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      // Synthetic Grid & Scanlines
      ctx.fillStyle = '#070912';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Radar sweep line
      const sweepY = (Date.now() * 0.15) % height;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(width, sweepY);
      ctx.stroke();
    }

    // Update & Draw Objects
    syntheticObjects.forEach(obj => {
      obj.x += obj.vx;
      obj.y += obj.vy;
      if (obj.x < 0.1 || obj.x + obj.w > 0.9) obj.vx *= -1;
      if (obj.y < 0.1 || obj.y + obj.h > 0.9) obj.vy *= -1;
      drawBoundingBox(obj);
    });

    // Calculate FPS
    frameCount++;
    const now = performance.now();
    if (now - fpsTimer >= 1000) {
      hudFps.textContent = (frameCount * 1000 / (now - fpsTimer)).toFixed(1);
      frameCount = 0;
      fpsTimer = now;
      hudLatency.textContent = `${(16 + Math.random() * 4).toFixed(1)} ms`;
    }

    requestAnimationFrame(render);
  }

  // Camera Toggle
  btnToggleCamera.addEventListener('click', async () => {
    if (!useCamera) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
        useCamera = true;
        feedStatusText.textContent = 'WEBRTC LIVE CAMERA FEED';
        camBtnText.textContent = 'Switch to Synthetic Stream';
        btnToggleCamera.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';

        const log = document.createElement('div');
        log.className = 'log-entry';
        log.innerHTML = '<strong>[WEBRTC]</strong> Camera hardware initialized. Ingesting 30 FPS raw stream.';
        detectionLog.appendChild(log);
        detectionLog.scrollTop = detectionLog.scrollHeight;
      } catch (err) {
        alert('Camera permission denied or camera not found. Remaining on synthetic stream.');
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      useCamera = false;
      feedStatusText.textContent = 'SYNTHETIC SPATIAL STREAM';
      camBtnText.textContent = 'Enable Webcam Stream';
      btnToggleCamera.style.background = 'linear-gradient(135deg, var(--accent-emerald), #059669)';
    }
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(render);

})();
