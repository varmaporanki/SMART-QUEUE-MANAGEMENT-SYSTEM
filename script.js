/**
 * SMARTQUEUE PRO - Client & Staff Queue Management System
 * Production-ready Vanilla JavaScript (ES6+) Architecture
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & SERVICES DEFINITION
  // ==========================================================================
  const STORAGE_KEY = 'smart_queue_pro_state_v2';
  const KIOSK_TICKET_KEY = 'smart_queue_kiosk_ticket_id';

  const SERVICE_CONFIG = {
    general: { name: 'General Inquiry', prefix: 'G', avgMinutes: 5, colorClass: 'general' },
    billing: { name: 'Billing & Accounts', prefix: 'B', avgMinutes: 8, colorClass: 'billing' },
    tech: { name: 'Technical Support', prefix: 'T', avgMinutes: 12, colorClass: 'tech' },
    vip: { name: 'Priority / Express', prefix: 'P', avgMinutes: 4, colorClass: 'vip' }
  };

  const DEFAULT_COUNTERS = [
    { id: 1, name: 'Counter 1', label: 'Counter 1 - General Inquiries', preferredService: 'general', currentTicketId: null },
    { id: 2, name: 'Counter 2', label: 'Counter 2 - Billing & Payments', preferredService: 'billing', currentTicketId: null },
    { id: 3, name: 'Counter 3', label: 'Counter 3 - Technical Support', preferredService: 'tech', currentTicketId: null },
    { id: 4, name: 'Counter 4', label: 'Counter 4 - Express Desk', preferredService: 'vip', currentTicketId: null }
  ];

  // ==========================================================================
  // 2. STATE MANAGER
  // ==========================================================================
  class QueueState {
    constructor() {
      this.tickets = [];
      this.counters = [...DEFAULT_COUNTERS];
      this.activeCounterId = 1;
      this.soundEnabled = true;
      this.currentFilter = 'all';
      this.serviceTimerInterval = null;
      this.loadState();
    }

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
          this.counters = Array.isArray(parsed.counters) ? parsed.counters : DEFAULT_COUNTERS;
          if (parsed.activeCounterId) this.activeCounterId = parsed.activeCounterId;
          if (typeof parsed.soundEnabled === 'boolean') this.soundEnabled = parsed.soundEnabled;
        } else {
          this.seedInitialDemoData();
        }
      } catch (err) {
        console.error('Failed to load state from localStorage:', err);
        this.seedInitialDemoData();
      }
    }

    saveState() {
      try {
        const payload = {
          tickets: this.tickets,
          counters: this.counters,
          activeCounterId: this.activeCounterId,
          soundEnabled: this.soundEnabled
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.error('Failed to persist state to localStorage:', err);
      }
    }

    seedInitialDemoData() {
      const now = Date.now();
      this.tickets = [
        {
          id: 't-1001',
          number: 'G-101',
          name: 'Sarah Connor',
          phone: '+1 (555) 019-8821',
          serviceKey: 'general',
          serviceName: 'General Inquiry',
          status: 'serving',
          counterId: 1,
          createdAt: now - 12 * 60 * 1000,
          calledAt: now - 3 * 60 * 1000,
          completedAt: null
        },
        {
          id: 't-1002',
          number: 'B-102',
          name: 'David Miller',
          phone: '+1 (555) 014-9922',
          serviceKey: 'billing',
          serviceName: 'Billing & Accounts',
          status: 'serving',
          counterId: 2,
          createdAt: now - 10 * 60 * 1000,
          calledAt: now - 1 * 60 * 1000,
          completedAt: null
        },
        {
          id: 't-1003',
          number: 'T-103',
          name: 'Elena Rostova',
          phone: '',
          serviceKey: 'tech',
          serviceName: 'Technical Support',
          status: 'waiting',
          counterId: null,
          createdAt: now - 8 * 60 * 1000,
          calledAt: null,
          completedAt: null
        },
        {
          id: 't-1004',
          number: 'P-104',
          name: 'Marcus Vance',
          phone: '+1 (555) 018-7744',
          serviceKey: 'vip',
          serviceName: 'Priority / Express',
          status: 'waiting',
          counterId: null,
          createdAt: now - 5 * 60 * 1000,
          calledAt: null,
          completedAt: null
        },
        {
          id: 't-1005',
          number: 'G-105',
          name: 'Amina Patel',
          phone: '',
          serviceKey: 'general',
          serviceName: 'General Inquiry',
          status: 'waiting',
          counterId: null,
          createdAt: now - 2 * 60 * 1000,
          calledAt: null,
          completedAt: null
        },
        {
          id: 't-1000',
          number: 'G-100',
          name: 'James Walker',
          phone: '',
          serviceKey: 'general',
          serviceName: 'General Inquiry',
          status: 'completed',
          counterId: 1,
          createdAt: now - 25 * 60 * 1000,
          calledAt: now - 15 * 60 * 1000,
          completedAt: now - 12 * 60 * 1000
        }
      ];

      this.counters = [
        { id: 1, name: 'Counter 1', label: 'Counter 1 - General Inquiries', preferredService: 'general', currentTicketId: 't-1001' },
        { id: 2, name: 'Counter 2', label: 'Counter 2 - Billing & Payments', preferredService: 'billing', currentTicketId: 't-1002' },
        { id: 3, name: 'Counter 3', label: 'Counter 3 - Technical Support', preferredService: 'tech', currentTicketId: null },
        { id: 4, name: 'Counter 4', label: 'Counter 4 - Express Desk', preferredService: 'vip', currentTicketId: null }
      ];
      this.saveState();
    }

    getNextTicketNumber(serviceKey) {
      const cfg = SERVICE_CONFIG[serviceKey] || SERVICE_CONFIG.general;
      const prefix = cfg.prefix;
      
      const serviceTickets = this.tickets.filter(t => t.number && t.number.startsWith(prefix));
      if (serviceTickets.length === 0) {
        return `${prefix}-101`;
      }
      
      const maxNum = serviceTickets.reduce((max, t) => {
        const parts = t.number.split('-');
        const val = parseInt(parts[1], 10);
        return !isNaN(val) && val > max ? val : max;
      }, 100);

      return `${prefix}-${maxNum + 1}`;
    }

    addTicket(name, phone, serviceKey) {
      const number = this.getNextTicketNumber(serviceKey);
      const newTicket = {
        id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        number,
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        serviceKey,
        serviceName: SERVICE_CONFIG[serviceKey].name,
        status: 'waiting',
        counterId: null,
        createdAt: Date.now(),
        calledAt: null,
        completedAt: null
      };

      this.tickets.push(newTicket);
      this.saveState();
      return newTicket;
    }

    getTicketById(id) {
      return this.tickets.find(t => t.id === id);
    }

    getWaitingTickets(filter = 'all') {
      return this.tickets
        .filter(t => t.status === 'waiting')
        .filter(t => filter === 'all' || t.serviceKey === filter)
        .sort((a, b) => a.createdAt - b.createdAt);
    }

    getHistoryTickets() {
      return this.tickets
        .filter(t => t.status === 'completed' || t.status === 'skipped')
        .sort((a, b) => (b.completedAt || b.calledAt || 0) - (a.completedAt || a.calledAt || 0));
    }

    getActiveCounter() {
      return this.counters.find(c => c.id === Number(this.activeCounterId)) || this.counters[0];
    }

    getActiveTicketForCounter(counterId) {
      const counter = this.counters.find(c => c.id === Number(counterId));
      if (!counter || !counter.currentTicketId) return null;
      return this.getTicketById(counter.currentTicketId);
    }

    callNext(counterId) {
      const counter = this.counters.find(c => c.id === Number(counterId));
      if (!counter) return null;

      // Complete any currently serving ticket on this counter first
      if (counter.currentTicketId) {
        this.completeTicket(counter.currentTicketId);
      }

      // Priority matching: check for waiting ticket matching preferredService, else any FIFO waiting
      let nextTicket = this.tickets.find(t => t.status === 'waiting' && t.serviceKey === counter.preferredService);
      if (!nextTicket) {
        nextTicket = this.tickets.find(t => t.status === 'waiting');
      }

      if (!nextTicket) {
        return null;
      }

      nextTicket.status = 'serving';
      nextTicket.counterId = counter.id;
      nextTicket.calledAt = Date.now();
      counter.currentTicketId = nextTicket.id;

      this.saveState();
      return nextTicket;
    }

    completeTicket(ticketId) {
      const ticket = this.getTicketById(ticketId);
      if (ticket) {
        ticket.status = 'completed';
        ticket.completedAt = Date.now();
        const counter = this.counters.find(c => c.id === ticket.counterId);
        if (counter && counter.currentTicketId === ticket.id) {
          counter.currentTicketId = null;
        }
        this.saveState();
      }
      return ticket;
    }

    skipTicket(ticketId) {
      const ticket = this.getTicketById(ticketId);
      if (ticket) {
        ticket.status = 'skipped';
        ticket.completedAt = Date.now();
        const counter = this.counters.find(c => c.id === ticket.counterId);
        if (counter && counter.currentTicketId === ticket.id) {
          counter.currentTicketId = null;
        }
        this.saveState();
      }
      return ticket;
    }

    cancelTicket(ticketId) {
      const ticket = this.getTicketById(ticketId);
      if (ticket && ticket.status === 'waiting') {
        this.tickets = this.tickets.filter(t => t.id !== ticketId);
        this.saveState();
        return true;
      }
      return false;
    }

    clearHistory() {
      this.tickets = this.tickets.filter(t => t.status === 'waiting' || t.status === 'serving');
      this.saveState();
    }
  }

  // ==========================================================================
  // 3. SYNTHESIZED AUDIO & ANNOUNCEMENT ENGINE (ZERO EXTERNAL ASSETS)
  // ==========================================================================
  class AudioEngine {
    constructor() {
      this.audioCtx = null;
    }

    initContext() {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }

    /**
     * Plays a classic 2-tone melodic chime (D5 -> A5) via Web Audio oscillators
     */
    playChime() {
      try {
        this.initContext();
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        const playTone = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        // Note 1: 587.33 Hz (D5)
        playTone(587.33, now, 0.45);
        // Note 2: 880.00 Hz (A5)
        playTone(880.00, now + 0.28, 0.7);
      } catch (e) {
        console.warn('Audio chime playback error:', e);
      }
    }

    /**
     * Announces ticket number & counter using SpeechSynthesis
     */
    speakAnnouncement(ticketNumber, counterName) {
      if (!('speechSynthesis' in window)) return;

      try {
        window.speechSynthesis.cancel(); // Stop any pending speech

        // Split ticket for clean natural voice pronunciation: "G 101" instead of "G minus one hundred"
        const formattedTicket = ticketNumber.replace('-', ' ');
        const text = `Ticket ${formattedTicket}. Please proceed to ${counterName}.`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        // Try to pick a natural English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Slight delay so the chime finishes first
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 550);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }

    triggerCallAlert(ticketNumber, counterName, soundEnabled) {
      if (!soundEnabled) return;
      this.playChime();
      this.speakAnnouncement(ticketNumber, counterName);
    }
  }

  // ==========================================================================
  // 4. UI CONTROLLER & APP RUNTIME
  // ==========================================================================
  class SmartQueueApp {
    constructor() {
      this.state = new QueueState();
      this.audio = new AudioEngine();
      this.cacheDOMElements();
      this.bindEvents();
      this.startTimers();
      this.render();
    }

    cacheDOMElements() {
      // Views
      this.views = {
        kiosk: document.getElementById('kioskView'),
        staff: document.getElementById('staffView'),
        display: document.getElementById('displayView')
      };
      this.navTabs = document.querySelectorAll('.nav-tab');

      // Header controls
      this.soundToggleBtn = document.getElementById('soundToggleBtn');
      this.soundOnIcon = document.getElementById('soundOnIcon');
      this.soundOffIcon = document.getElementById('soundOffIcon');
      this.liveClock = document.getElementById('liveClock');
      this.displayClock = document.getElementById('displayClock');
      this.demoDataBtn = document.getElementById('demoDataBtn');

      // Kiosk elements
      this.joinQueueForm = document.getElementById('joinQueueForm');
      this.custNameInput = document.getElementById('custName');
      this.custPhoneInput = document.getElementById('custPhone');
      this.serviceOptions = document.querySelectorAll('.service-option');
      this.activeTicketDisplay = document.getElementById('activeTicketDisplay');
      this.noTicketPlaceholder = document.getElementById('noTicketPlaceholder');
      this.ticketStatusBadge = document.getElementById('ticketStatusBadge');
      this.ticketNumberDisplay = document.getElementById('ticketNumberDisplay');
      this.ticketNameDisplay = document.getElementById('ticketNameDisplay');
      this.ticketServiceDisplay = document.getElementById('ticketServiceDisplay');
      this.ticketPositionDisplay = document.getElementById('ticketPositionDisplay');
      this.ticketWaitDisplay = document.getElementById('ticketWaitDisplay');
      this.ticketCounterDisplay = document.getElementById('ticketCounterDisplay');
      this.ticketTimeDisplay = document.getElementById('ticketTimeDisplay');
      this.ticketBarcodeCode = document.getElementById('ticketBarcodeCode');
      this.printTicketBtn = document.getElementById('printTicketBtn');
      this.cancelTicketBtn = document.getElementById('cancelTicketBtn');
      this.newTicketBtn = document.getElementById('newTicketBtn');
      this.kioskMiniServing = document.getElementById('kioskMiniServing');

      // Staff Dashboard elements
      this.statWaitingCount = document.getElementById('statWaitingCount');
      this.statWaitingSubtitle = document.getElementById('statWaitingSubtitle');
      this.statServedCount = document.getElementById('statServedCount');
      this.statServedSubtitle = document.getElementById('statServedSubtitle');
      this.statAvgWait = document.getElementById('statAvgWait');
      this.statActiveCounters = document.getElementById('statActiveCounters');

      this.counterSelect = document.getElementById('counterSelect');
      this.currentServingBox = document.getElementById('currentServingBox');
      this.serviceTimer = document.getElementById('serviceTimer');
      this.servingNumber = document.getElementById('servingNumber');
      this.servingName = document.getElementById('servingName');
      this.servingService = document.getElementById('servingService');
      this.servingWaitDuration = document.getElementById('servingWaitDuration');

      this.callNextBtn = document.getElementById('callNextBtn');
      this.recallBtn = document.getElementById('recallBtn');
      this.completeBtn = document.getElementById('completeBtn');
      this.skipBtn = document.getElementById('skipBtn');

      this.allCountersList = document.getElementById('allCountersList');
      this.queueTotalBadge = document.getElementById('queueTotalBadge');
      this.filterBtns = document.querySelectorAll('.filter-btn');
      this.queueItemsList = document.getElementById('queueItemsList');
      this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
      this.historyItemsList = document.getElementById('historyItemsList');

      // Public Display elements
      this.displayCountersGrid = document.getElementById('displayCountersGrid');
      this.displayUpNextList = document.getElementById('displayUpNextList');

      // Toasts
      this.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
      // View Navigation
      this.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetView = tab.getAttribute('data-view');
          this.switchView(targetView);
        });
      });

      // Sound Toggle
      this.soundToggleBtn.addEventListener('click', () => {
        this.audio.initContext();
        this.state.soundEnabled = !this.state.soundEnabled;
        this.state.saveState();
        this.updateSoundToggleUI();
        this.showToast(this.state.soundEnabled ? 'Audio alerts turned ON' : 'Audio alerts muted', 'info');
      });

      // Demo Data Button
      this.demoDataBtn.addEventListener('click', () => {
        if (confirm('Load fresh demo queue data? This will reset the current queue.')) {
          this.state.seedInitialDemoData();
          localStorage.removeItem(KIOSK_TICKET_KEY);
          this.render();
          this.showToast('Demo queue loaded successfully!', 'success');
        }
      });

      // Kiosk Service Radio Tiles click handling
      this.serviceOptions.forEach(label => {
        label.addEventListener('click', () => {
          this.serviceOptions.forEach(l => l.classList.remove('selected'));
          label.classList.add('selected');
        });
      });

      // Kiosk Check-In Form Submit
      this.joinQueueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.audio.initContext();

        const name = this.custNameInput.value;
        const phone = this.custPhoneInput.value;
        const selectedRadio = document.querySelector('input[name="serviceCategory"]:checked');
        const serviceKey = selectedRadio ? selectedRadio.value : 'general';

        if (!name.trim()) return;

        const ticket = this.state.addTicket(name, phone, serviceKey);
        localStorage.setItem(KIOSK_TICKET_KEY, ticket.id);

        this.joinQueueForm.reset();
        // Reset selection style
        this.serviceOptions.forEach(l => l.classList.remove('selected'));
        if (this.serviceOptions[0]) this.serviceOptions[0].classList.add('selected');

        this.render();
        this.showToast(`Ticket ${ticket.number} issued! Welcome, ${ticket.name}.`, 'success');
      });

      // Kiosk Print Ticket
      this.printTicketBtn.addEventListener('click', () => {
        window.print();
      });

      // Kiosk Cancel / Leave Queue
      this.cancelTicketBtn.addEventListener('click', () => {
        const ticketId = localStorage.getItem(KIOSK_TICKET_KEY);
        if (ticketId && confirm('Are you sure you want to leave the queue?')) {
          this.state.cancelTicket(ticketId);
          localStorage.removeItem(KIOSK_TICKET_KEY);
          this.render();
          this.showToast('You have exited the queue.', 'info');
        }
      });

      // Kiosk "Take Another Ticket" button
      this.newTicketBtn.addEventListener('click', () => {
        localStorage.removeItem(KIOSK_TICKET_KEY);
        this.render();
      });

      // Staff Counter Selector
      this.counterSelect.value = this.state.activeCounterId;
      this.counterSelect.addEventListener('change', (e) => {
        this.state.activeCounterId = Number(e.target.value);
        this.state.saveState();
        this.renderStaffDesk();
      });

      // Staff Action Buttons
      this.callNextBtn.addEventListener('click', () => {
        this.audio.initContext();
        const activeCounter = this.state.getActiveCounter();
        const ticket = this.state.callNext(activeCounter.id);

        if (ticket) {
          this.audio.triggerCallAlert(ticket.number, activeCounter.name, this.state.soundEnabled);
          this.flashServingBox();
          this.render();
          this.showToast(`Now Serving: ${ticket.number} at ${activeCounter.name}`, 'success');
        } else {
          this.showToast('No customers currently waiting in the queue!', 'warning');
        }
      });

      this.recallBtn.addEventListener('click', () => {
        this.audio.initContext();
        const activeCounter = this.state.getActiveCounter();
        const activeTicket = this.state.getActiveTicketForCounter(activeCounter.id);

        if (activeTicket) {
          this.audio.triggerCallAlert(activeTicket.number, activeCounter.name, this.state.soundEnabled);
          this.flashServingBox();
          this.showToast(`Recalling ${activeTicket.number} for ${activeCounter.name}`, 'info');
        }
      });

      this.completeBtn.addEventListener('click', () => {
        const activeCounter = this.state.getActiveCounter();
        if (activeCounter.currentTicketId) {
          const completedTicket = this.state.completeTicket(activeCounter.currentTicketId);
          this.render();
          this.showToast(`Completed service for ticket ${completedTicket.number}`, 'success');
        }
      });

      this.skipBtn.addEventListener('click', () => {
        const activeCounter = this.state.getActiveCounter();
        if (activeCounter.currentTicketId) {
          const skipped = this.state.skipTicket(activeCounter.currentTicketId);
          this.render();
          this.showToast(`Marked ${skipped.number} as No-Show / Skipped`, 'warning');
        }
      });

      // Staff Queue Filter Buttons
      this.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.currentFilter = btn.getAttribute('data-filter');
          this.renderQueueList();
        });
      });

      // Clear History Audit Log
      this.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear processed history audit log?')) {
          this.state.clearHistory();
          this.renderStaffHistory();
          this.showToast('Audit history cleared', 'info');
        }
      });

      // Multi-tab storage sync
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.state.loadState();
          this.render();
        }
      });
    }

    startTimers() {
      // 1. Clock timer
      const updateClocks = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        if (this.liveClock) this.liveClock.textContent = timeStr;
        if (this.displayClock) this.displayClock.textContent = timeStr;
      };
      updateClocks();
      setInterval(updateClocks, 1000);

      // 2. Active serving duration timer
      setInterval(() => {
        this.updateServingTimer();
      }, 1000);
    }

    updateServingTimer() {
      const activeCounter = this.state.getActiveCounter();
      const activeTicket = this.state.getActiveTicketForCounter(activeCounter.id);

      if (activeTicket && activeTicket.calledAt) {
        const elapsedSec = Math.max(0, Math.floor((Date.now() - activeTicket.calledAt) / 1000));
        const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
        const secs = String(elapsedSec % 60).padStart(2, '0');
        if (this.serviceTimer) this.serviceTimer.textContent = `${mins}:${secs}`;
      } else {
        if (this.serviceTimer) this.serviceTimer.textContent = '00:00';
      }
    }

    flashServingBox() {
      if (!this.currentServingBox) return;
      this.currentServingBox.classList.remove('calling-pulse');
      void this.currentServingBox.offsetWidth; // Trigger reflow
      this.currentServingBox.classList.add('calling-pulse');
    }

    switchView(viewName) {
      this.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
      });

      Object.keys(this.views).forEach(key => {
        if (this.views[key]) {
          this.views[key].classList.toggle('active', key === viewName);
        }
      });

      // Re-render when switching to ensure fresh data
      this.render();
    }

    updateSoundToggleUI() {
      if (this.state.soundEnabled) {
        this.soundOnIcon.classList.remove('hidden');
        this.soundOffIcon.classList.add('hidden');
      } else {
        this.soundOnIcon.classList.add('hidden');
        this.soundOffIcon.classList.remove('hidden');
      }
    }

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      let iconSvg = '';
      if (type === 'success') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      } else if (type === 'warning') {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
      } else {
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
      }

      toast.innerHTML = `${iconSvg}<span>${message}</span>`;
      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // ========================================================================
    // RENDER DISPATCHER
    // ========================================================================
    render() {
      this.updateSoundToggleUI();
      this.renderKiosk();
      this.renderStaffStats();
      this.renderStaffDesk();
      this.renderQueueList();
      this.renderStaffHistory();
      this.renderDisplayBoard();
    }

    // ========================================================================
    // KIOSK VIEW RENDERING
    // ========================================================================
    renderKiosk() {
      const userTicketId = localStorage.getItem(KIOSK_TICKET_KEY);
      const ticket = userTicketId ? this.state.getTicketById(userTicketId) : null;

      if (ticket && (ticket.status === 'waiting' || ticket.status === 'serving')) {
        this.activeTicketDisplay.classList.remove('hidden');
        this.noTicketPlaceholder.classList.add('hidden');

        this.ticketNumberDisplay.textContent = ticket.number;
        this.ticketNameDisplay.textContent = ticket.name;
        this.ticketServiceDisplay.textContent = ticket.serviceName;
        this.ticketBarcodeCode.textContent = `SQ-${ticket.id.slice(-6).toUpperCase()}`;

        // Status badge & positioning
        if (ticket.status === 'serving') {
          const counter = this.state.counters.find(c => c.id === ticket.counterId);
          this.ticketStatusBadge.className = 'badge badge-serving';
          this.ticketStatusBadge.textContent = 'NOW SERVING';
          this.ticketPositionDisplay.textContent = 'YOUR TURN!';
          this.ticketWaitDisplay.textContent = '0 mins';
          this.ticketCounterDisplay.textContent = counter ? counter.name : 'Counter Assigned';
        } else {
          // Waiting
          const waitingTickets = this.state.getWaitingTickets('all');
          const pos = waitingTickets.findIndex(t => t.id === ticket.id) + 1;
          const estMinutes = Math.max(2, (pos - 1) * 5);

          this.ticketStatusBadge.className = 'badge badge-waiting';
          this.ticketStatusBadge.textContent = 'IN QUEUE';
          this.ticketPositionDisplay.textContent = `#${pos || 1}`;
          this.ticketWaitDisplay.textContent = `~${estMinutes} mins`;
          this.ticketCounterDisplay.textContent = 'Pending...';
        }

        const issuedDate = new Date(ticket.createdAt);
        this.ticketTimeDisplay.textContent = issuedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      } else {
        // No ticket or ticket finished
        this.activeTicketDisplay.classList.add('hidden');
        this.noTicketPlaceholder.classList.remove('hidden');

        // Mini preview of currently serving
        this.kioskMiniServing.innerHTML = '';
        this.state.counters.forEach(counter => {
          const activeTicket = this.state.getActiveTicketForCounter(counter.id);
          const item = document.createElement('div');
          item.className = 'mini-serving-item';
          item.innerHTML = `
            <div class="mini-counter-name">${counter.name}</div>
            <div class="mini-ticket-num">${activeTicket ? activeTicket.number : '---'}</div>
          `;
          this.kioskMiniServing.appendChild(item);
        });
      }
    }

    // ========================================================================
    // STAFF DASHBOARD RENDERING
    // ========================================================================
    renderStaffStats() {
      const waiting = this.state.getWaitingTickets('all');
      const completed = this.state.tickets.filter(t => t.status === 'completed');
      const skipped = this.state.tickets.filter(t => t.status === 'skipped');

      this.statWaitingCount.textContent = waiting.length;
      this.statWaitingSubtitle.textContent = waiting.length === 1 ? '1 customer in line' : `${waiting.length} customers in line`;

      this.statServedCount.textContent = completed.length;
      const totalHandled = completed.length + skipped.length;
      const completionRate = totalHandled > 0 ? Math.round((completed.length / totalHandled) * 100) : 100;
      this.statServedSubtitle.textContent = `${completionRate}% fulfillment rate`;

      // Calculate average wait time (minutes)
      if (completed.length > 0) {
        const totalWaitMs = completed.reduce((sum, t) => {
          const wait = (t.calledAt || t.completedAt) - t.createdAt;
          return sum + Math.max(0, wait);
        }, 0);
        const avgMin = (totalWaitMs / completed.length / (1000 * 60)).toFixed(1);
        this.statAvgWait.innerHTML = `${avgMin} <span class="unit">min</span>`;
      } else {
        this.statAvgWait.innerHTML = `4.2 <span class="unit">min</span>`;
      }

      this.statActiveCounters.innerHTML = `${this.state.counters.length} <span class="unit">desks</span>`;
    }

    renderStaffDesk() {
      const activeCounter = this.state.getActiveCounter();
      const activeTicket = this.state.getActiveTicketForCounter(activeCounter.id);

      if (activeTicket) {
        this.currentServingBox.classList.add('active-serving');
        this.servingNumber.textContent = activeTicket.number;
        this.servingName.textContent = activeTicket.name;
        this.servingService.textContent = activeTicket.serviceName;

        const waitMin = Math.round(Math.max(0, ((activeTicket.calledAt || Date.now()) - activeTicket.createdAt) / (1000 * 60)));
        this.servingWaitDuration.textContent = `Waited: ~${waitMin}m`;

        this.recallBtn.disabled = false;
        this.completeBtn.disabled = false;
        this.skipBtn.disabled = false;
      } else {
        this.currentServingBox.classList.remove('active-serving');
        this.servingNumber.textContent = '---';
        this.servingName.textContent = 'Desk is idle';
        this.servingService.textContent = 'Awaiting Next Call';
        this.servingWaitDuration.textContent = 'Wait: --';

        this.recallBtn.disabled = true;
        this.completeBtn.disabled = true;
        this.skipBtn.disabled = true;
      }

      // Check if there are any waiting customers to call
      const waiting = this.state.getWaitingTickets('all');
      this.callNextBtn.disabled = waiting.length === 0;

      // Render mini counters overview cards
      this.allCountersList.innerHTML = '';
      this.state.counters.forEach(c => {
        const ticket = this.state.getActiveTicketForCounter(c.id);
        const card = document.createElement('div');
        card.className = `desk-status-card ${c.id === activeCounter.id ? 'active-desk' : ''}`;
        card.innerHTML = `
          <div>
            <div class="desk-info-title">${c.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${ticket ? ticket.name : 'Idle'}</div>
          </div>
          <div class="desk-serving-code">${ticket ? ticket.number : '---'}</div>
        `;
        card.addEventListener('click', () => {
          this.counterSelect.value = c.id;
          this.state.activeCounterId = c.id;
          this.state.saveState();
          this.renderStaffDesk();
        });
        this.allCountersList.appendChild(card);
      });
    }

    renderQueueList() {
      const waiting = this.state.getWaitingTickets(this.state.currentFilter);
      this.queueTotalBadge.textContent = waiting.length;
      this.queueItemsList.innerHTML = '';

      if (waiting.length === 0) {
        this.queueItemsList.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted); font-size:0.9rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.5rem; display:block; opacity:0.6;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            No customers currently waiting in this category.
          </div>
        `;
        return;
      }

      waiting.forEach((ticket, idx) => {
        const waitMins = Math.round((Date.now() - ticket.createdAt) / (1000 * 60));
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.innerHTML = `
          <div class="queue-item-left">
            <span class="queue-pos-badge">${idx + 1}</span>
            <div class="queue-item-info">
              <span class="queue-ticket-code">${ticket.number}</span>
              <span class="queue-cust-name">${ticket.name} ${ticket.phone ? '• ' + ticket.phone : ''}</span>
            </div>
          </div>
          <div class="queue-item-meta">
            <span class="queue-tag ${SERVICE_CONFIG[ticket.serviceKey].colorClass}">${ticket.serviceName}</span>
            <span class="queue-wait-timer">${waitMins}m wait</span>
            <div class="queue-actions">
              <button class="direct-serve-btn" title="Call directly to active desk">Call</button>
            </div>
          </div>
        `;

        // Direct Call button on queue row
        const callBtn = item.querySelector('.direct-serve-btn');
        callBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const activeCounter = this.state.getActiveCounter();
          if (activeCounter.currentTicketId) {
            this.state.completeTicket(activeCounter.currentTicketId);
          }
          ticket.status = 'serving';
          ticket.counterId = activeCounter.id;
          ticket.calledAt = Date.now();
          activeCounter.currentTicketId = ticket.id;
          this.state.saveState();

          this.audio.triggerCallAlert(ticket.number, activeCounter.name, this.state.soundEnabled);
          this.flashServingBox();
          this.render();
          this.showToast(`Called ${ticket.number} directly to ${activeCounter.name}`, 'success');
        });

        this.queueItemsList.appendChild(item);
      });
    }

    renderStaffHistory() {
      const history = this.state.getHistoryTickets().slice(0, 8); // Top 8 most recent
      this.historyItemsList.innerHTML = '';

      if (history.length === 0) {
        this.historyItemsList.innerHTML = `
          <div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:0.75rem;">
            No tickets processed yet today.
          </div>
        `;
        return;
      }

      history.forEach(ticket => {
        const item = document.createElement('div');
        item.className = `history-item ${ticket.status}`;
        const timeStr = new Date(ticket.completedAt || ticket.calledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        item.innerHTML = `
          <div>
            <strong>${ticket.number}</strong> • ${ticket.name} 
            <span style="font-size:0.7rem; color:var(--text-muted); margin-left:0.4rem;">(${ticket.serviceName})</span>
          </div>
          <div style="font-size:0.75rem; font-weight:700; color:${ticket.status === 'completed' ? 'var(--emerald)' : 'var(--rose)'}">
            ${ticket.status.toUpperCase()} at ${timeStr}
          </div>
        `;
        this.historyItemsList.appendChild(item);
      });
    }

    // ========================================================================
    // PUBLIC DISPLAY BOARD RENDERING
    // ========================================================================
    renderDisplayBoard() {
      // Counter spotlight cards
      this.displayCountersGrid.innerHTML = '';
      this.state.counters.forEach(counter => {
        const ticket = this.state.getActiveTicketForCounter(counter.id);
        const card = document.createElement('div');
        card.className = `display-counter-card ${ticket ? 'flash-call' : ''}`;
        card.innerHTML = `
          <div class="display-counter-name">${counter.name}</div>
          <div class="display-ticket-number">${ticket ? ticket.number : '---'}</div>
          <div class="display-ticket-service">${ticket ? ticket.serviceName : 'Available / Ready'}</div>
        `;
        this.displayCountersGrid.appendChild(card);
      });

      // Up Next list
      const waiting = this.state.getWaitingTickets('all').slice(0, 6);
      this.displayUpNextList.innerHTML = '';

      if (waiting.length === 0) {
        this.displayUpNextList.innerHTML = `
          <div style="color:var(--text-muted); text-align:center; padding:2rem 0; font-size:1rem;">
            Queue is clear. No waiting tickets.
          </div>
        `;
        return;
      }

      waiting.forEach((ticket, idx) => {
        const card = document.createElement('div');
        card.className = 'upnext-card';
        card.innerHTML = `
          <div>
            <div class="upnext-number">${ticket.number}</div>
            <div class="upnext-service">${ticket.serviceName}</div>
          </div>
          <div class="upnext-pos">Position #${idx + 1}</div>
        `;
        this.displayUpNextList.appendChild(card);
      });
    }
  }

  // ==========================================================================
  // 5. APPLICATION BOOTSTRAPPER
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    window.SmartQueue = new SmartQueueApp();
  });

})();

