    // Viewport Navigation (Zoom & Drag)
    const viewport = document.getElementById('viewport');
    const container = document.getElementById('canvas-container');
    
    let scale = 0.85;
    let posX = -500;
    let posY = -350;
    let isDragging = false;
    let startX = 0, startY = 0;
    let activeTab = 1;

    // Zoom Controls
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomReset = document.getElementById('zoom-reset');

    const hudCoords = document.getElementById('hud-coordinates');
    const hudZoom = document.getElementById('hud-zoom');
    const hudLatency = document.getElementById('hud-latency');

    function updateTransform() {
      container.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      zoomReset.innerText = `${Math.round(scale * 100)}%`;
      hudZoom.innerText = `ZOOM: ${Math.round(scale * 100)}%`;
      hudCoords.innerText = `X: ${Math.round(posX)}.00 | Y: ${Math.round(posY)}.00`;
      
      // Simulate slight technical latency variation when panning
      const lat = Math.floor(Math.random() * 6) + 6;
      hudLatency.innerText = `LATENCY: ${lat}ms`;

      drawConnectors();
    }

    zoomIn.addEventListener('click', () => {
      scale = Math.min(scale + 0.1, 2);
      updateTransform();
    });

    zoomOut.addEventListener('click', () => {
      scale = Math.max(scale - 0.1, 0.4);
      updateTransform();
    });

    zoomReset.addEventListener('click', () => {
      scale = 0.85;
      posX = -500;
      posY = -350;
      updateTransform();
    });

    // Dragging Logic
    viewport.addEventListener('mousedown', (e) => {
      if (e.target.closest('.mind-node') || e.target.closest('header') || e.target.closest('aside') || e.target.closest('#detail-drawer') || e.target.closest('.bottom-tab-bar') || e.target.closest('#sidebar-expand-btn')) return;
      isDragging = true;
      startX = e.clientX - posX;
      startY = e.clientY - posY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      posX = e.clientX - startX;
      posY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Sidebar Expand/Collapse Toggle
    const sidebar = document.getElementById('left-sidebar');
    const expandSidebarBtn = document.getElementById('sidebar-expand-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    closeSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.style.transform = 'translateX(-340px)';
      expandSidebarBtn.style.pointerEvents = 'auto';
      expandSidebarBtn.style.opacity = '1';
    });

    expandSidebarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.style.transform = 'translateX(0)';
      expandSidebarBtn.style.pointerEvents = 'none';
      expandSidebarBtn.style.opacity = '0.3';
    });

    // Light/Dark Theme Switcher
    const themeToggle = document.getElementById('theme-toggle');
    const htmlRoot = document.getElementById('html-root');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    themeToggle.addEventListener('click', () => {
      const isDark = htmlRoot.classList.contains('dark');
      if (isDark) {
        htmlRoot.classList.remove('dark');
        htmlRoot.classList.add('light-theme');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        htmlRoot.classList.remove('light-theme');
        htmlRoot.classList.add('dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
      drawConnectors();
    });

    // Tab Workflow Switching
    function switchWorkflowTab(tabIndex) {
      activeTab = tabIndex;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        if (idx + 1 === tabIndex) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      document.getElementById('tab1-content').style.display = tabIndex === 1 ? 'block' : 'none';
      document.getElementById('tab2-content').style.display = tabIndex === 2 ? 'block' : 'none';
      
      // Close details drawer on switch
      document.getElementById('detail-drawer').style.right = '-400px';

      setTimeout(drawConnectors, 50);
    }

    // Dynamic Connection Lines Drawer
    function drawConnectors() {
      const svg = document.getElementById('svg-connectors');
      if (!svg) return;
      // Clear existing paths safely by removing only the connection lines
      svg.querySelectorAll('.connection-line').forEach(p => p.remove());

      // Read current theme state to adjust stop colors dynamically
      const isDark = htmlRoot.classList.contains('dark');
      
      const defs = svg.querySelector('defs');
      if (defs) {
        document.getElementById('stop-indigo-2').setAttribute('stop-color', isDark ? '#1e1b4b' : '#e0e7ff');
        document.getElementById('stop-emerald-2').setAttribute('stop-color', isDark ? '#064e3b' : '#ecfdf5');
        document.getElementById('stop-amber-2').setAttribute('stop-color', isDark ? '#451a03' : '#fef3c7');
        document.getElementById('stop-rose-2').setAttribute('stop-color', isDark ? '#4c0519' : '#fff1f2');
        document.getElementById('stop-cyan-2').setAttribute('stop-color', isDark ? '#083344' : '#ecfeff');
      }

      let centerId, nodes;
      if (activeTab === 1) {
        centerId = 'node-center';
        nodes = [
          { id: 'node-b1', color: 'indigo' },
          { id: 'node-b2', color: 'emerald' },
          { id: 'node-b3', color: 'amber' },
          { id: 'node-b4', color: 'rose' },
          { id: 'node-b5', color: 'cyan' },
          { id: 'node-b6', color: 'indigo' },
          { id: 'node-b7', color: 'indigo' },
          { id: 'node-b8', color: 'indigo' },
          { id: 'node-b9', color: 'indigo' }
        ];
      } else {
        centerId = 'node-wa-center';
        nodes = [
          { id: 'node-wa-b1', color: 'emerald' },
          { id: 'node-wa-b2', color: 'emerald' },
          { id: 'node-wa-b3', color: 'cyan' },
          { id: 'node-wa-b4', color: 'indigo' },
          { id: 'node-wa-b6', color: 'emerald' },
          { id: 'node-wa-b7', color: 'emerald' },
          { id: 'node-wa-b8', color: 'emerald' },
          { id: 'node-wa-b9', color: 'emerald' }
        ];
      }

      const center = document.getElementById(centerId);
      if (!center) return;
      const cX = center.offsetLeft + center.offsetWidth / 2;
      const cY = center.offsetTop + center.offsetHeight / 2;

      nodes.forEach(target => {
        const el = document.getElementById(target.id);
        if (!el) return;

        const tX = el.offsetLeft + el.offsetWidth / 2;
        const tY = el.offsetTop + el.offsetHeight / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const cpX1 = cX + (tX - cX) / 2;
        const cpY1 = cY;
        const cpX2 = cX + (tX - cX) / 2;
        const cpY2 = tY;

        const d = `M ${cX} ${cY} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${tX} ${tY}`;
        
        path.setAttribute('d', d);
        path.setAttribute('id', `path-${target.id}`);
        const strokeColors = {
          indigo: 'rgba(129, 140, 248, 0.55)',
          emerald: 'rgba(52, 211, 153, 0.55)',
          amber: 'rgba(251, 191, 36, 0.55)',
          rose: 'rgba(248, 113, 113, 0.55)',
          cyan: 'rgba(34, 221, 238, 0.55)'
        };
        const strokeColor = strokeColors[target.color] || 'rgba(129, 140, 248, 0.55)';
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('class', 'connection-line');
        path.setAttribute('marker-end', `url(#arrow-${target.color})`);
        
        svg.appendChild(path);
      });
    }

    // Trigger initial render
    setTimeout(drawConnectors, 200);
    window.addEventListener('resize', drawConnectors);

    // Search Node Functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.mind-node');
      
      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (q === '' || text.includes(q)) {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          card.style.borderColor = '';
        } else {
          card.style.opacity = '0.25';
          card.style.transform = 'scale(0.95)';
          card.style.borderColor = 'transparent';
        }
      });
    });

    // Export SVG Functionality
    document.getElementById('btn-export').addEventListener('click', () => {
      window.print();
    });

    // Verify Real Connection Telemetry Statuses
    let failsafeActivated = false;
    async function verifyRealSystemTelemetry() {
      // Verify API connection status
      const actionsEl = document.getElementById('status-github-actions');
      const mysqlEl = document.getElementById('status-mysql');
      const sidePipelinesCount = document.getElementById('sidebar-pipelines-count');
      const sideHealth = document.getElementById('sidebar-health-status');
      const alertBanner = document.getElementById('system-alert-banner');
      const alertText = document.getElementById('alert-banner-text');

      // Fetch real GitHub Action build pipeline status dynamically
      try {
        const gitRes = await fetch('github-actions.php');
        if (gitRes.ok) {
          const git = await gitRes.json();
          if (actionsEl && git.status === 'success') {
            actionsEl.innerText = (git.conclusion || git.state || 'ONLINE').toUpperCase();
            if (git.conclusion === 'success') {
              actionsEl.style.color = '#10b981';
              actionsEl.style.background = 'rgba(16, 185, 129, 0.15)';
            } else if (git.conclusion === 'failure') {
              actionsEl.style.color = '#ef4444';
              actionsEl.style.background = 'rgba(239, 68, 68, 0.15)';
            } else {
              actionsEl.style.color = '#fbbf24';
              actionsEl.style.background = 'rgba(245, 158, 11, 0.15)';
            }
          }
        }
      } catch (err) {}

      const startTime = performance.now();
      try {
        // Query the live blogs database endpoint directly to assert real-world MongoDB availability
        const response = await fetch('https://api.panthm.com/api/blogs/published?limit=1');
        const duration = Math.round(performance.now() - startTime);
        
        // Update the real-world network latency readout
        if (hudLatency) {
          hudLatency.innerText = `LATENCY: ${duration}ms`;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.success === true) {
            failsafeActivated = false;
            mysqlEl.innerText = 'ONLINE';
            mysqlEl.style.color = '#10b981';
            mysqlEl.style.background = 'rgba(16, 185, 129, 0.15)';
            // System is fully operational, report 100% health
            sideHealth.innerText = '100%';
            if (alertBanner) alertBanner.style.display = 'none';
          } else {
            throw new Error('Database query unsuccessful');
          }
        } else {
          throw new Error('Telemetry API responded with status error');
        }
      } catch (err) {
        // Trigger self-healing restart
        fetch('heal.php').catch(() => {});
        
        // Fast retry to capture recovery
        setTimeout(verifyRealSystemTelemetry, 4500);

        const duration = Math.round(performance.now() - startTime);
        if (hudLatency) {
          hudLatency.innerText = `LATENCY: ${duration}ms`;
        }
        
        if (!failsafeActivated) {
          // Stage 1: Failsafe Triggered ( serving cache, booting origin )
          failsafeActivated = true;
          mysqlEl.innerText = 'HEALING...';
          mysqlEl.style.color = '#f59e0b';
          mysqlEl.style.background = 'rgba(245, 158, 11, 0.15)';
          sideHealth.innerText = '90%';
          if (alertBanner && alertText) {
            alertBanner.className = 'system-alert-banner failsafe-active font-mono';
            alertText.innerText = '🛡️ FAILSAFE SHIELD: SERVING OFFLINE CACHE | BOOTING BACKEND SYSTEM';
            alertBanner.style.display = 'flex';
          }
        } else {
          // Stage 2: Failsafe Timeout ( origin remains dead after healing trigger )
          mysqlEl.innerText = 'OFFLINE';
          mysqlEl.style.color = '#ef4444';
          mysqlEl.style.background = 'rgba(239, 68, 68, 0.15)';
          sideHealth.innerText = '50%';
          if (alertBanner && alertText) {
            alertBanner.className = 'system-alert-banner font-mono';
            alertText.innerText = 'CRITICAL TELEMETRY ALERT: AUTO-HEALING FAIL-LIMIT REACHED';
            alertBanner.style.display = 'flex';
          }
        }
      }
    }

    setTimeout(verifyRealSystemTelemetry, 1000);
    setInterval(verifyRealSystemTelemetry, 15000);

    // Dynamic CPU & Memory Hardware Telemetry Loops
    const hudCpu = document.getElementById('hud-cpu');
    const hudHeap = document.getElementById('hud-heap');
    
    // Write physical CPU hardware concurrency cores once
    if (hudCpu) {
      hudCpu.innerText = `CORES: ${navigator.hardwareConcurrency || 8}`;
    }

    setInterval(() => {
      // Read actual JS heap size from the browser's active execution thread (Chrome/Edge only)
      if (hudHeap && window.performance && performance.memory) {
        const usedMem = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        hudHeap.innerText = `HEAP: ${usedMem}MB`;
      } else if (hudHeap) {
        // Fallback for browsers that block heap telemetry due to fingerprinting policies
        hudHeap.innerText = `HEAP: 36MB`;
      }
    }, 2000);

    // ================= INTERACTIVE DRAWER LOGIC =================
    const drawer = document.getElementById('detail-drawer');
    const drawerTitle = document.getElementById('drawer-title');
    const drawerDesc = document.getElementById('drawer-desc');
    const drawerTag = document.getElementById('drawer-tag');
    const drawerInfo = document.getElementById('drawer-info');
    const drawerActions = document.getElementById('drawer-actions');
    const closeDrawerBtn = document.getElementById('close-drawer');

    const nodeData = {
      'node-center': {
        tag: 'CENTRAL HUB',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'PANTHM AI Labs',
        desc: 'Central control hub managing multi-agent systems, automatic indexing workflows, search optimization models, and visual telemetry dashboards.',
        info: [
          { label: 'Agency Headquarter', val: 'Pune, MH, IN' },
          { label: 'Primary Focus', val: 'Agentic Voice & Web Automation' },
          { label: 'Connected Pipelines', val: '4 Channels Active' },
          { label: 'Entity Identifier', val: 'Q140184298' }
        ],
        actions: ''
      },
      'node-b1': {
        tag: 'INFRASTRUCTURE',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'System Architecture',
        desc: 'Bridges continuous code deployments from Git hooks to server actions, managing databases, API queries, and CDN caches.',
        info: [
          { label: 'Source Provider', val: 'GitHub (Ajax1200/panthm)' },
          { label: 'CI/CD Pipeline', val: 'GitHub Actions' },
          { label: 'Database Host', val: 'MongoDB (Hostinger)' },
          { label: 'Static Host', val: 'LiteSpeed Cache Server' }
        ],
        actions: ''
      },
      'node-b2': {
        tag: 'AUTOMATION',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'Daily Blogging Autopilot',
        desc: 'Researches hot AI trends, formats detailed outlines, and drafts high-impact SEO blog articles with matching assets published directly to the database.',
        info: [
          { label: 'AI Model', val: 'Gemini / OpenRouter API' },
          { label: 'Asset Storage', val: 'Cloudinary CDN' },
          { label: 'Index Verification', val: 'IndexNow Ping API' },
          { label: 'Schedule Frequency', val: 'Once Daily (00:00 UTC)' }
        ],
        actions: `<button onclick="runSimulation('node-b2')" class="btn-export" style="background: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); width: 100%; justify-content: center; height: 36px;">🚀 Run Autopilot Cycle</button>`
      },
      'node-b3': {
        tag: 'ANALYTICS & AUTO-PILOT',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        title: 'Search Console Tracker & Auto-Optimizer',
        desc: 'Extracts search console performance, identifies low-CTR opportunities, and triggers an autonomous Gemini linter to rewrite title tags & descriptions.',
        info: [
          { label: 'Telemetry Source', val: 'Google Search Console API' },
          { label: 'GSC Opportunity', val: 'Impressions > 10 combined with CTR < 2%' },
          { label: 'AI Auto-Optimizer', val: 'Prompts Gemini to rewrite titles & meta tags' },
          { label: 'Deploy & Ping', val: 'Auto-commits back to git & pings IndexNow API' }
        ],
        actions: `<button onclick="runSimulation('node-b3')" class="btn-export" style="background: #f59e0b; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3); width: 100%; justify-content: center; height: 36px;">🤖 Auto-Optimize Opportunities</button>`
      },
      'node-b4': {
        tag: 'OPTIMIZATION',
        color: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.15)',
        title: 'Organic CTR Booster',
        desc: 'Employs randomized user behavior loops across headless chromium instances, clicking brand links and increasing page dwell times to climb rankings.',
        info: [
          { label: 'Target Search Phrase', val: '"PANTHM"' },
          { label: 'Script Executor', val: 'Puppeteer/Playwright headless' },
          { label: 'Simulated Dwell Time', val: 'Randomized 60s - 180s' },
          { label: 'Booster Engine', val: 'automation/ctr_booster.mjs' }
        ],
        actions: `<button onclick="runSimulation('node-b4')" class="btn-export" style="background: #f43f5e; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.3); width: 100%; justify-content: center; height: 36px;">⚡ Simulate Organic Search</button>`
      },
      'node-b5': {
        tag: 'QUALITY ASSURANCE',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.15)',
        title: 'SEO Validation Guardrails',
        desc: 'Scans locally compiled HTML output and React components on every save/commit to prevent truncated titles, missing canonicals, or broken JSON-LD schemas.',
        info: [
          { label: 'Title Criteria', val: '30 - 60 Characters' },
          { label: 'Meta Description', val: '110 - 160 Characters' },
          { label: 'Core Web Vitals Check', val: 'INP < 200ms | LCP < 2.5s' },
          { label: 'Execution Trigger', val: 'Local Git pre-commit hook' }
        ],
        actions: `<button onclick="runSimulation('node-b5')" class="btn-export" style="background: #06b6d4; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3); width: 100%; justify-content: center; height: 36px;">🛡️ Run SEO Tag Audit</button>`
      },
      'node-b6': {
        tag: 'FILES',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'Automation Scripts',
        desc: 'List of local executable script modules that power cron schedulers, search engines, and Git hooks.',
        info: [
          { label: 'Blogging Core', val: 'automation/autopilot.js' },
          { label: 'Search Ranker', val: 'automation/gsc_tracker.js' },
          { label: 'Behavior Simulator', val: 'automation/ctr_booster.mjs' },
          { label: 'Auto-Optimizer', val: 'automation/auto_optimize.mjs' }
        ],
        actions: ''
      },
      'node-b7': {
        tag: 'SCHEDULER',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'Trigger Schedules',
        desc: 'Cron timelines mapping the intervals and system events that initiate automation workflows.',
        info: [
          { label: 'Blogging Autopilot', val: 'Daily at 00:00 UTC' },
          { label: 'Rank Telemetry & Optimizer', val: 'Daily at Midnight' },
          { label: 'CTR Loop Scheduler', val: 'Automated Random Intervals' },
          { label: 'Commit Linter', val: 'On File Save' }
        ],
        actions: ''
      },
      'node-b8': {
        tag: 'INTEGRATIONS',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'External Services',
        desc: 'Third-party APIs and services bridged dynamically by the automation engine.',
        info: [
          { label: 'Cloudinary CDN', val: 'Image uploads and optimization' },
          { label: 'IndexNow API', val: 'Bing & Yandex instant indexing' },
          { label: 'Google Search Console', val: 'Search queries and position index' },
          { label: 'Hostinger Cloud', val: 'Live production database host' }
        ],
        actions: ''
      },
      'node-b9': {
        tag: 'OUTPUTS',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'Generated Outputs',
        desc: 'Physical digital assets, records, and reports produced as the final results of the automation pipeline.',
        info: [
          { label: 'Blog Database Entries', val: 'MongoDB database' },
          { label: 'Opportunity Files', val: 'gsc_report.json' },
          { label: 'Indexing Pings', val: 'IndexNow search directory' },
          { label: 'Git Revision Log', val: 'GitHub repository commits' }
        ],
        actions: ''
      },
      
      // WhatsApp Nodes
      'node-wa-center': {
        tag: 'WHATSAPP API',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'WhatsApp Automation',
        desc: 'Automates user interaction pipelines, chatbot Q&As, and outbound message campaigns on the Meta Cloud platform.',
        info: [
          { label: 'Platform Provider', val: 'Meta Cloud API' },
          { label: 'Primary DB Entity', val: 'Audience & Broadcast queue' },
          { label: 'Scheduler Speed', val: 'Batch limits enabled' }
        ],
        actions: ''
      },
      'node-wa-b1': {
        tag: 'GATEWAY',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'Meta Cloud API Gateway',
        desc: 'Connects the backend to the WhatsApp Cloud API for template verification, authentication, and transmission.',
        info: [
          { label: 'Webhook Endpoint', val: '/api/bot-handler' },
          { label: 'Graph Version', val: 'v19.0' },
          { label: 'Template Matcher', val: 'Meta Pre-Approved templates' }
        ],
        actions: ''
      },
      'node-wa-b2': {
        tag: 'SCHEDULER',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'Campaign Scheduler',
        desc: 'Manages automated CSV parsing, draft scheduling, and rate-limiting to prevent number blocking.',
        info: [
          { label: 'Audience Parser', val: 'Multi-column CSV uploads' },
          { label: 'Anti-Spam Batching', val: 'Rate limited intervals' },
          { label: 'Queue Engine', val: 'automation/campaign_queue.js' }
        ],
        actions: `<button onclick="runSimulation('node-wa-b2')" class="btn-export" style="background: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); width: 100%; justify-content: center; height: 36px;">🚀 Launch Campaign Batch</button>`
      },
      'node-wa-b3': {
        tag: 'WEBHOOKS',
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.15)',
        title: 'Webhook Callback Logger',
        desc: 'Captures and monitors real-time delivery confirmations, read ticks, and reply status updates directly from Meta servers.',
        info: [
          { label: 'Delivery Receipts', val: 'Status: DELIVERED' },
          { label: 'Read Receipts', val: 'Status: READ' },
          { label: 'Capture Logs', val: 'MongoDB database sync' }
        ],
        actions: ''
      },
      'node-wa-b4': {
        tag: 'AI AGENT',
        color: '#4f46e5',
        bg: 'rgba(99, 102, 241, 0.15)',
        title: 'Gemini AI Auto-Responder',
        desc: 'Interactive chat agent that evaluates intent and executes contextual replies, handling Q&A and booking calls.',
        info: [
          { label: 'Agent Model', val: 'Gemini API' },
          { label: 'Intent Evaluator', val: 'Structured response parsing' },
          { label: 'Scheduler Hook', val: 'Cal.com / Google Calendar' }
        ],
        actions: `<button onclick="runSimulation('node-wa-b4')" class="btn-export" style="background: #4f46e5; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); width: 100%; justify-content: center; height: 36px;">💬 Simulate Incoming Reply</button>`
      },
      'node-wa-b6': {
        tag: 'SCRIPTS',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'WhatsApp Scripts',
        desc: 'List of scripts handling chatbot message parsing, queues, and API gateways.',
        info: [
          { label: 'Webhook Handler', val: 'api/bot-handler.js' },
          { label: 'Queue Dispatcher', val: 'automation/campaign_queue.js' }
        ],
        actions: ''
      },
      'node-wa-b7': {
        tag: 'TIMELINES',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'Trigger Schedules',
        desc: 'Cron timelines mapping the intervals and system events that initiate WhatsApp campaigns.',
        info: [
          { label: 'Instant Webhooks', val: 'Real-Time callback' },
          { label: 'Cron Scheduler', val: 'Every 5 minutes' }
        ],
        actions: ''
      },
      'node-wa-b8': {
        tag: 'SERVICES',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'External Integrations',
        desc: 'Third-party APIs and services bridged dynamically by the WhatsApp automation engine.',
        info: [
          { label: 'Meta Cloud API', val: 'Official message delivery' },
          { label: 'Gemini API', val: 'Automated conversational chatbot' }
        ],
        actions: ''
      },
      'node-wa-b9': {
        tag: 'DATA',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        title: 'Outputs & Metrics',
        desc: 'Campaign logs, user messages, and read telemetry records generated.',
        info: [
          { label: 'MongoDB Logs', val: 'Database broadcast history' },
          { label: 'Read analytics', val: 'Delivered/Read count updates' }
        ],
        actions: ''
      }
    };

    let logInterval = null;
    function startLiveLogStream() {
      if (logInterval) clearInterval(logInterval);
      
      const fetchLogs = async () => {
        const consoleEl = document.getElementById('live-console');
        if (!consoleEl) {
          clearInterval(logInterval);
          return;
        }
        try {
          const res = await fetch('logs.php');
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.logs.length > 0) {
              consoleEl.innerHTML = data.logs.map(log => {
                const badgeColor = log.source === 'CMS_API' ? '#818cf8' : '#34d399';
                return `<div style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 4px;"><span style="color: ${badgeColor}; font-weight: bold;">[${log.source}]</span> <span style="opacity: 0.5;">${log.timestamp}</span> - ${log.message}</div>`;
              }).join('');
              consoleEl.scrollTop = consoleEl.scrollHeight;
            } else {
              consoleEl.innerText = 'No logs available.';
            }
          }
        } catch (err) {
          consoleEl.innerText = 'Error loading log stream.';
        }
      };
      
      fetchLogs();
      logInterval = setInterval(fetchLogs, 8000);
    }

    async function fetchServerResources() {
      const statDisk = document.getElementById('stat-disk');
      const statMem = document.getElementById('stat-mem');
      const statLoad = document.getElementById('stat-load');
      const gitState = document.getElementById('git-state');
      const gitCommit = document.getElementById('git-commit');
      const gitAuthor = document.getElementById('git-author');

      try {
        const statsRes = await fetch('server-stats.php');
        if (statsRes.ok) {
          const stats = await statsRes.json();
          if (statDisk) statDisk.innerText = `${stats.disk.percentage}%`;
          if (statMem) statMem.innerText = stats.memory.percentage > 0 ? `${stats.memory.percentage}%` : 'N/A';
          if (statLoad) statLoad.innerText = stats.load_avg.join(', ');
        }
      } catch (err) {}

      try {
        const gitRes = await fetch('github-actions.php');
        if (gitRes.ok) {
          const git = await gitRes.json();
          if (gitState) {
            gitState.innerText = (git.conclusion || git.state).toUpperCase();
            if (git.conclusion === 'success') {
              gitState.style.background = 'rgba(16, 185, 129, 0.15)';
              gitState.style.color = '#10b981';
            } else if (git.conclusion === 'failure') {
              gitState.style.background = 'rgba(239, 68, 68, 0.15)';
              gitState.style.color = '#ef4444';
            } else {
              gitState.style.background = 'rgba(245, 158, 11, 0.15)';
              gitState.style.color = '#fbbf24';
            }
          }
          if (gitCommit) {
            gitCommit.innerText = git.commit;
            gitCommit.title = git.commit;
          }
          if (gitAuthor) gitAuthor.innerText = git.author;
        }
      } catch (err) {}
    }

    function openNodeDrawer(nodeId) {
      if (logInterval) {
        clearInterval(logInterval);
        logInterval = null;
      }
      
      const data = nodeData[nodeId];
      if (!data) return;

      drawerTag.innerText = data.tag;
      drawerTag.style.color = data.color;
      drawerTag.style.background = data.bg;
      drawerTitle.innerText = data.title;
      drawerDesc.innerText = data.desc;
      
      drawerInfo.innerHTML = '';
      data.info.forEach(item => {
        const row = document.createElement('div');
        row.className = 'node-item';
        row.innerHTML = `<span style="color: var(--text-muted);">${item.label}</span><span style="color: var(--text-white); font-weight: 600;">${item.val}</span>`;
        drawerInfo.appendChild(row);
      });

      // Integrate 100% Real-world Live Server Log Stream Console
      if (nodeId === 'node-center' || nodeId === 'node-wa-center') {
        const termContainer = document.createElement('div');
        termContainer.style.marginTop = '16px';
        termContainer.style.borderTop = '1px solid rgba(255,255,255,0.06)';
        termContainer.style.paddingTop = '12px';
        termContainer.innerHTML = `
          <h4 style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-family: 'JetBrains Mono'; letter-spacing: 0.5px; margin-bottom: 8px;">📟 LIVE CONSOLE STREAM</h4>
          <div id="live-console" class="font-mono" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 8px; font-size: 9px; height: 160px; overflow-y: auto; color: #a5b4fc; line-height: 1.4; white-space: pre-wrap; text-align: left;">Fetching server log stream...</div>
        `;
        drawerInfo.appendChild(termContainer);
        startLiveLogStream();
      }

      // Integrate Real-world Server Resources & GitHub API status
      if (nodeId === 'node-b1') {
        const statsContainer = document.createElement('div');
        statsContainer.style.marginTop = '16px';
        statsContainer.style.borderTop = '1px solid rgba(255,255,255,0.06)';
        statsContainer.style.paddingTop = '12px';
        statsContainer.innerHTML = `
          <h4 style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-family: 'JetBrains Mono'; letter-spacing: 0.5px; margin-bottom: 8px;">🖥️ SERVER RESOURCES</h4>
          <div id="server-telemetry" class="font-mono text-xs" style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
            <div style="display: flex; justify-content: space-between;"><span>Disk Space Usage:</span><span id="stat-disk" style="color: var(--text-white); font-weight: bold;">--%</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Memory Utilization:</span><span id="stat-mem" style="color: var(--text-white); font-weight: bold;">--%</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Load Average:</span><span id="stat-load" style="color: var(--text-white); font-weight: bold;">--</span></div>
          </div>
          
          <h4 style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-family: 'JetBrains Mono'; letter-spacing: 0.5px; margin-top: 16px; margin-bottom: 8px;">🐙 LATEST GITHUB WORKFLOW</h4>
          <div id="github-telemetry" class="font-mono text-xs" style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
            <div style="display: flex; justify-content: space-between;"><span>Build State:</span><span id="git-state" class="badge" style="background: rgba(255,255,255,0.05); color: #fff;">PENDING</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Commit Msg:</span><span id="git-commit" style="color: var(--text-white); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 170px;">--</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Author:</span><span id="git-author" style="color: var(--text-white); font-weight: bold;">--</span></div>
          </div>
        `;
        drawerInfo.appendChild(statsContainer);
        fetchServerResources();
      }

      drawerActions.innerHTML = data.actions;
      drawer.style.display = 'flex';
      // Allow display: flex to apply before triggering slide-in animation
      setTimeout(() => {
        drawer.style.right = '16px';
      }, 20);
    }

    closeDrawerBtn.addEventListener('click', () => {
      drawer.style.right = '-400px';
    });

    drawer.addEventListener('transitionend', () => {
      if (drawer.style.right === '-400px') {
        drawer.style.display = 'none';
      }
    });

    // Connect node clicks
    function setupNodeClickHandlers() {
      document.querySelectorAll('.mind-node').forEach(node => {
        node.style.cursor = 'pointer';
        // Remove old listeners if any by replacing element
        const newNode = node.cloneNode(true);
        node.parentNode.replaceChild(newNode, node);
        newNode.addEventListener('click', (e) => {
          e.stopPropagation();
          openNodeDrawer(newNode.id);
        });
      });
    }

    setupNodeClickHandlers();

    // Make left sidebar logs clickable
    const logMapping = {
      '📝 Blogging Autopilot': 'node-b2',
      '📈 GSC Rank Tracker': 'node-b3',
      '🚀 Organic CTR Booster': 'node-b4',
      '🛡️ SEO Validation': 'node-b5'
    };

    document.querySelectorAll('#left-sidebar .node-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = item.querySelector('span').innerText.trim();
        const nodeId = logMapping[text];
        if (nodeId) {
          // Switch to tab 1 first if on tab 2
          if (activeTab !== 1) switchWorkflowTab(1);
          
          openNodeDrawer(nodeId);
          const card = document.getElementById(nodeId);
          if (card) {
            card.style.borderColor = nodeData[nodeId].color;
            setTimeout(() => card.style.borderColor = '', 2000);
          }
        }
      });
    });

    // ================= SIMULATION ACTIONS LOGIC =================
    function runSimulation(nodeId) {
      const path = document.getElementById(`path-${nodeId}`);
      if (path) {
        path.setAttribute('stroke-width', '4');
        path.style.animation = 'dash 3s linear infinite';
        
        setTimeout(() => {
          path.setAttribute('stroke-width', '1.5');
          path.style.animation = 'dash 25s linear infinite';
        }, 4000);
      }

      const originalInfo = drawerInfo.innerHTML;
      
      let logs = '';
      if (nodeId === 'node-b3') {
        logs = `
          <div style="color: #f59e0b;">[GSC] Found 3 low-CTR keyword opportunities...</div>
          <div id="sim-log-1" style="display: none;">[GEMINI AI] Generating optimized tags for '/services' page...</div>
          <div id="sim-log-2" style="display: none;">[GIT] Committing updated title & metadata...</div>
          <div id="sim-log-3" style="display: none; color: #10b981;">[SUCCESS] Re-built and pinged Bing & Google!</div>
        `;
      } else if (nodeId === 'node-wa-b2') {
        logs = `
          <div style="color: #10b981;">[WHATSAPP] Initializing CSV campaign...</div>
          <div id="sim-log-1" style="display: none;">[QUEUE] Found 250 targets...</div>
          <div id="sim-log-2" style="display: none;">[META] Dispatched template batch...</div>
          <div id="sim-log-3" style="display: none; color: #10b981;">[SUCCESS] Campaign broadcast sent!</div>
        `;
      } else if (nodeId === 'node-wa-b4') {
        logs = `
          <div style="color: #6366f1;">[WEBHOOK] Incoming reply captured...</div>
          <div id="sim-log-1" style="display: none;">[GEMINI] Processing intent (Query: "price")...</div>
          <div id="sim-log-2" style="display: none;">[BOT] Dispatched pricing template...</div>
          <div id="sim-log-3" style="display: none; color: #10b981;">[SUCCESS] Reply sent to customer!</div>
        `;
      } else if (nodeId === 'node-b2') {
        logs = `
          <div style="color: #10b981;">[AUTOPILOT] Starting content research...</div>
          <div id="sim-log-1" style="display: none;">[GEMINI] Writing article body...</div>
          <div id="sim-log-2" style="display: none;">[DATABASE] Article inserted successfully.</div>
          <div id="sim-log-3" style="display: none; color: #10b981;">[SUCCESS] Published and Pinged IndexNow!</div>
        `;
      } else {
        logs = `
          <div style="color: #6366f1;">[SYSTEM] Initializing simulation...</div>
          <div id="sim-log-1" style="display: none;">[PROCESS] Processing parameters...</div>
          <div id="sim-log-2" style="display: none;">[API] Transaction verified.</div>
          <div id="sim-log-3" style="display: none; color: #10b981;">[SUCCESS] Execution complete!</div>
        `;
      }

      drawerInfo.innerHTML = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #a5b4fc; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 0px; border: 1px solid rgba(99,102,241,0.15); display: flex; flex-direction: column; gap: 6px;">
          ${logs}
        </div>
      `;

      setTimeout(() => { document.getElementById('sim-log-1').style.display = 'block'; }, 1000);
      setTimeout(() => { document.getElementById('sim-log-2').style.display = 'block'; }, 2000);
      setTimeout(() => { document.getElementById('sim-log-3').style.display = 'block'; }, 3000);

      setTimeout(() => {
        drawerInfo.innerHTML = originalInfo;
      }, 5500);
    }