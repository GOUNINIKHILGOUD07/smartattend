/**
 * SmartAttend QR Scanner Module
 * Integrates HTML5 Camera Scanner with robust file-upload and manual token fallbacks.
 */

class QRScannerManager {
  constructor() {
    this.html5QrCode = null;
    this.isScanning = false;
    this.audioContext = null;
  }

  /**
   * Plays a pleasant chime on successful scan using Web Audio API
   */
  playSuccessSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) this.audioContext = new AudioCtx();

      const ctx = this.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {
      // Audio playback best-effort fallback
    }
  }

  /**
   * Initializes and starts camera scanning in a given element
   */
  async startCamera(elementId, onSuccess, onError) {
    if (this.isScanning) {
      await this.stopCamera();
    }

    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Html5Qrcode scanner library is not loaded. Please use the file upload or manual code option.');
    }

    try {
      this.html5QrCode = new Html5Qrcode(elementId);
      this.isScanning = true;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText, decodedResult) => {
          this.playSuccessSound();
          if (typeof onSuccess === 'function') {
            onSuccess(decodedText, decodedResult);
          }
        },
        (errorMessage) => {
          // Continuous frame scan error - quiet logging
          if (typeof onError === 'function') onError(errorMessage);
        }
      );
    } catch (err) {
      this.isScanning = false;
      let userFriendlyMsg = 'Could not access camera. ';
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        userFriendlyMsg += 'Camera permission was denied. Please allow camera access in your browser settings, or use the file upload / manual code fallback below.';
      } else if (err.name === 'NotFoundError') {
        userFriendlyMsg += 'No camera device found on this system. You can test with the "Upload QR Image" or "Quick Demo Scan" buttons.';
      } else {
        userFriendlyMsg += (err.message || 'Please check permissions or use image upload.');
      }
      throw new Error(userFriendlyMsg);
    }
  }

  /**
   * Stops the active camera stream
   */
  async stopCamera() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        this.isScanning = false;
        this.html5QrCode = null;
      }
    }
  }

  /**
   * Scans a QR code directly from an uploaded Image File
   */
  async scanFile(file) {
    if (typeof Html5Qrcode === 'undefined') {
      throw new Error('Scanner engine not loaded.');
    }

    const scanner = new Html5Qrcode('qr-file-scratch-box');
    try {
      const decodedText = await scanner.scanFile(file, true);
      this.playSuccessSound();
      return decodedText;
    } catch {
      throw new Error('Could not detect a valid QR code in this image. Please upload a clear QR screenshot.');
    } finally {
      scanner.clear();
    }
  }

  /**
   * Parses scanned QR content into a structured session object
   */
  parseScannedData(rawText) {
    // 1. Check if raw text is JSON payload
    try {
      const data = JSON.parse(rawText);
      if (data.sessionId) {
        return {
          sessionId: data.sessionId,
          classId: data.classId,
          token: data.token
        };
      }
    } catch {
      // Not JSON, continue to string match
    }

    // 2. Check if raw text is an active session token like 'SA-XXXX'
    const activeSessions = window.SmartStore.getActiveSessions();
    const matchByToken = activeSessions.find(s => s.token.toUpperCase() === rawText.trim().toUpperCase());
    if (matchByToken) {
      return {
        sessionId: matchByToken.id,
        classId: matchByToken.classId,
        token: matchByToken.token
      };
    }

    // 3. Check if raw text is a session ID
    const matchById = window.SmartStore.getSessionById(rawText.trim());
    if (matchById) {
      return {
        sessionId: matchById.id,
        classId: matchById.classId,
        token: matchById.token
      };
    }

    throw new Error('Unrecognized QR code format. Please ensure this is a valid SmartAttend session QR code.');
  }
}

// Global instance
window.SmartScanner = new QRScannerManager();
