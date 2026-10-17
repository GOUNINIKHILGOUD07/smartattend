/**
 * SmartAttend QR Generator & Display Engine
 * Uses local/CDN QRCode library with robust HTML5 canvas fallback.
 */

class QRGenerator {
  constructor() {
    this.timerInterval = null;
  }

  /**
   * Encodes attendance session data into a standardized JSON string payload
   */
  encodePayload(session) {
    return JSON.stringify({
      app: 'SmartAttend',
      v: '1.0',
      sessionId: session.id,
      classId: session.classId,
      token: session.token,
      topic: session.topic,
      expiresAt: session.expiresAt
    });
  }

  /**
   * Generates a QR Code inside the given container element
   */
  renderQR(containerElement, session, size = 260) {
    if (!containerElement) return;
    containerElement.innerHTML = '';

    const payload = this.encodePayload(session);

    // Try using QRCode library if available
    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(containerElement, {
          text: payload,
          width: size,
          height: size,
          colorDark: '#0f172a',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
        return;
      } catch (err) {
        console.warn('QRCode library render failed, using SVG fallback:', err);
      }
    }

    // High quality canvas fallback if QRCode library isn't available
    this.renderCanvasFallback(containerElement, session, size);
  }

  renderCanvasFallback(containerElement, session, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Render stylized matrix fallback
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SmartAttend Dynamic QR', size / 2, 40);

    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(session.token || 'SA-CODE', size / 2, size / 2);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Session: ' + session.id.slice(-6), size / 2, size / 2 + 30);
    ctx.fillText('Valid for attendance', size / 2, size - 30);

    containerElement.appendChild(canvas);
  }

  /**
   * Starts a countdown timer updating a given timer DOM element
   */
  startTimer(expiresAtIso, displayElement, onExpire) {
    this.stopTimer();

    const update = () => {
      const now = Date.now();
      const target = new Date(expiresAtIso).getTime();
      const diff = target - now;

      if (diff <= 0) {
        this.stopTimer();
        if (displayElement) {
          displayElement.innerHTML = '<span class="text-danger font-semibold">Session Expired</span>';
        }
        if (typeof onExpire === 'function') onExpire();
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      if (displayElement) {
        displayElement.textContent = formatted;
      }
    };

    update();
    this.timerInterval = setInterval(update, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Downloads the generated QR code as an image file
   */
  downloadQR(containerElement, filename = 'smartattend-qr.png') {
    const canvas = containerElement.querySelector('canvas');
    const img = containerElement.querySelector('img');

    let dataUrl = '';
    if (canvas) {
      dataUrl = canvas.toDataURL('image/png');
    } else if (img && img.src) {
      dataUrl = img.src;
    }

    if (!dataUrl) {
      alert('QR Code image not ready for download.');
      return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

// Global instance
window.SmartQR = new QRGenerator();
