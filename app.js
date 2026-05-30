// CommuniTrade Core Application Logic
import { 
  INITIAL_CATEGORIES, 
  MOCK_USERS, 
  INITIAL_LISTINGS, 
  SAFE_MEET_ZONES, 
  MOCK_CHATS 
} from './data.js';

// --- State Management ---
let state = {
  listings: JSON.parse(localStorage.getItem('ct_listings')) || INITIAL_LISTINGS,
  users: JSON.parse(localStorage.getItem('ct_users')) || MOCK_USERS,
  currentUser: JSON.parse(localStorage.getItem('ct_currentUser')) || null,
  activeFilters: {
    category: 'all',
    tradeMode: 'all',
    search: '',
    sort: 'recent'
  },
  selectedListing: null,
  chatSession: {
    activeListingId: null,
    messages: [] // Array of { sender: 'me'|'seller', text: string, time: string }
  },
  wizard: {
    step: 1,
    title: '',
    desc: '',
    category: 'textbooks',
    condition: 'Excellent',
    tradeMode: 'buy',
    price: 10,
    exchangeFor: '',
    images: [] // Array of image URLs
  },
  activeSafeZoneId: 'zone_1'
};

// Preset images for realistic simulated upload previews based on category
const MOCK_CATEGORY_IMAGES = {
  textbooks: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'
  ],
  electronics: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=400'
  ],
  transport: [
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=400'
  ],
  'lab-gear': [
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400'
  ],
  services: [
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400'
  ],
  sports: [
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1617203442284-88406248d48b?auto=format&fit=crop&q=80&w=400'
  ]
};

// Save helper
function saveState() {
  localStorage.setItem('ct_listings', JSON.stringify(state.listings));
  localStorage.setItem('ct_users', JSON.stringify(state.users));
  localStorage.setItem('ct_currentUser', JSON.stringify(state.currentUser));
}

// Show Toast feedback
function showToast(text, type = 'success') {
  const toast = document.getElementById('toast-message-box');
  const toastText = document.getElementById('toast-text');
  const toastIcon = document.getElementById('toast-icon');
  
  toastText.innerText = text;
  toastIcon.innerText = type === 'success' ? '✔️' : 'ℹ️';
  
  toast.className = `toast-msg toast-${type} show`;
  
  setTimeout(() => {
    toast.className = `toast-msg toast-${type}`;
  }, 3500);
}

// --- DOM Rendering Engine ---

// Initialize navigation header
function renderNavbarAuth() {
  const authContainer = document.getElementById('auth-nav-container');
  if (state.currentUser) {
    const isVerifiedDomain = verifyEmailDomain(state.currentUser.email);
    authContainer.innerHTML = `
      <div class="user-profile-badge" id="profile-badge-dropdown">
        <img src="${state.currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}" class="user-avatar" alt="${state.currentUser.name}">
        <div class="seller-info">
          <span class="user-name">${state.currentUser.name}</span>
          <span class="seller-trust" style="font-size:0.7rem; color: ${isVerifiedDomain ? 'var(--secondary)' : 'var(--text-muted)'}">
            ${isVerifiedDomain ? '🛡️ Verified Trusted' : '👤 Student Member'}
          </span>
        </div>
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; margin-left: 8px;" id="nav-logout-btn">Log Out</button>
      </div>
    `;
    
    // Add logout listener
    document.getElementById('nav-logout-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.currentUser = null;
      saveState();
      renderNavbarAuth();
      showToast('Logged out successfully', 'info');
    });
  } else {
    authContainer.innerHTML = `
      <button class="btn btn-primary" id="login-trigger-btn">Sign In</button>
    `;
    document.getElementById('login-trigger-btn').addEventListener('click', () => {
      openAuthModal('signin');
    });
  }
}

// Render category selectors
function renderCategoryChips() {
  const container = document.getElementById('category-chips-list');
  container.innerHTML = INITIAL_CATEGORIES.map(cat => `
    <button class="category-chip ${state.activeFilters.category === cat.id ? 'active' : ''}" data-category-id="${cat.id}">
      <span>${cat.icon}</span> ${cat.name}
    </button>
  `).join('');

  // Click handler
  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeFilters.category = chip.getAttribute('data-category-id');
      renderCategoryChips();
      renderListingsGrid();
    });
  });
}

// Renders the main active listings product grid
function renderListingsGrid() {
  const container = document.getElementById('product-grid-container');
  const emptyState = document.getElementById('empty-state-view');
  
  // Filter core logic
  let filtered = state.listings.filter(item => {
    // Category match
    if (state.activeFilters.category !== 'all' && item.category !== state.activeFilters.category) return false;
    
    // Trade Mode match
    if (state.activeFilters.tradeMode !== 'all' && item.tradeMode !== state.activeFilters.tradeMode) return false;
    
    // Search query match
    if (state.activeFilters.search) {
      const q = state.activeFilters.search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    
    return item.status === 'available';
  });

  // Sorting core logic
  if (state.activeFilters.sort === 'recent') {
    filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  } else if (state.activeFilters.sort === 'views') {
    filtered.sort((a, b) => b.views - a.views);
  } else if (state.activeFilters.sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.activeFilters.sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  }

  // Update counts
  document.getElementById('listings-count').innerText = `(${filtered.length})`;

  if (filtered.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = filtered.map(item => {
      const seller = state.users.find(u => u.id === item.sellerId) || MOCK_USERS[0];
      const timeAgo = getTimeAgo(item.dateAdded);
      
      let priceText = `$${item.price}`;
      if (item.tradeMode === 'rent') priceText = `$${item.price}<span>/day</span>`;
      if (item.tradeMode === 'exchange') priceText = `<span class="card-exchange-text" title="${item.exchangeFor}">🔄 swap</span>`;
      
      return `
        <div class="glass-card product-card" data-listing-id="${item.id}">
          <div class="card-img-wrapper">
            <img src="${item.image}" class="card-img" alt="${item.title}" loading="lazy">
            <div class="card-badge badge-${item.tradeMode}">${item.tradeMode}</div>
            <div class="card-views">👁️ ${item.views}</div>
          </div>
          
          <div class="card-body">
            <div class="card-meta">
              <span>${INITIAL_CATEGORIES.find(c => c.id === item.category)?.name || item.category}</span>
              <span>${timeAgo}</span>
            </div>
            
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.description}</p>
            
            <div class="card-footer">
              <div class="card-price">${priceText}</div>
              
              <div class="seller-indicator">
                <img src="${seller.avatar}" class="seller-avatar" alt="${seller.name}">
                <div class="seller-info">
                  <span class="seller-name">${seller.name}</span>
                  <span class="seller-trust">⭐ ${seller.trustScore}% Trust</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events to card
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-listing-id');
        openProductDetail(id);
      });
    });
  }
}

// Render meetup spots & interactive map coordinators
function renderSafeZones() {
  const listContainer = document.getElementById('safe-zones-list');
  const canvasContainer = document.getElementById('map-canvas');
  
  // Coordinates mapping simulator ratios for gorgeous mock vector display
  const pinCoordinates = {
    'zone_1': { x: 30, y: 35, icon: '📚' },
    'zone_2': { x: 75, y: 25, icon: '🍔' },
    'zone_3': { x: 20, y: 70, icon: '🏢' },
    'zone_4': { x: 65, y: 75, icon: '🚲' }
  };

  listContainer.innerHTML = SAFE_MEET_ZONES.map(zone => `
    <div class="zone-card ${state.activeSafeZoneId === zone.id ? 'active' : ''}" data-zone-id="${zone.id}">
      <div class="zone-header">
        <h3 class="zone-name">${zone.name}</h3>
        <span class="zone-rating">🛡️ Safety Rating: ${zone.safetyRating}/5</span>
      </div>
      <p class="zone-desc">${zone.description}</p>
    </div>
  `).join('');

  // Draw simulated map overlays & connections
  let pinsHTML = `
    <!-- Mock Campus Outlines -->
    <div style="position: absolute; top: 15%; left: 45%; color: rgba(255,255,255,0.03); font-size: 3rem; font-weight: 800; font-family: 'Outfit'; pointer-events:none;">CAMPUS MAP</div>
    <!-- You Pin -->
    <div class="map-pin" style="top: 50%; left: 45%; z-index: 4;">
      <span class="pin-icon" style="font-size: 1.5rem; filter: hue-rotate(120deg)">📍</span>
      <span class="pin-label" style="background: var(--secondary); border-color: var(--secondary); color: white;">You (Hostel Stand)</span>
    </div>
  `;
  
  SAFE_MEET_ZONES.forEach(zone => {
    const coords = pinCoordinates[zone.id];
    const isActive = state.activeSafeZoneId === zone.id;
    pinsHTML += `
      <div class="map-pin ${isActive ? 'active' : ''}" style="top: ${coords.y}%; left: ${coords.x}%;" data-pin-id="${zone.id}">
        <span class="pin-icon">${coords.icon}</span>
        <span class="pin-label">${zone.name}</span>
      </div>
    `;
  });

  // Dynamic route connector line drawing simulation
  const activeCoords = pinCoordinates[state.activeSafeZoneId];
  const activeColor = state.activeSafeZoneId === 'zone_4' ? 'var(--accent)' : 'var(--primary)';
  pinsHTML += `
    <svg class="map-route-layer">
      <line x1="45%" y1="50%" x2="${activeCoords.x}%" y2="${activeCoords.y}%" 
            style="stroke: ${activeColor}; stroke-width: 3; stroke-dasharray: 6 4; opacity: 0.65; transition: all 0.5s ease;" />
    </svg>
  `;
  
  canvasContainer.innerHTML = pinsHTML;

  // Add click handlers on list cards
  listContainer.querySelectorAll('.zone-card').forEach(card => {
    card.addEventListener('click', () => {
      state.activeSafeZoneId = card.getAttribute('data-zone-id');
      renderSafeZones();
    });
  });

  // Add click handlers on map pins
  canvasContainer.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      const pinId = pin.getAttribute('data-pin-id');
      if (pinId) {
        state.activeSafeZoneId = pinId;
        renderSafeZones();
      }
    });
  });
}

// --- Product Details Drawer ---

function openProductDetail(listingId) {
  const listing = state.listings.find(item => item.id === listingId);
  if (!listing) return;
  
  state.selectedListing = listing;
  listing.views += 1; // Increment view count
  saveState();
  renderListingsGrid();

  const seller = state.users.find(u => u.id === listing.sellerId) || MOCK_USERS[0];
  
  // Set details UI
  document.getElementById('detail-product-img').src = listing.image;
  document.getElementById('detail-product-category').innerText = INITIAL_CATEGORIES.find(c => c.id === listing.category)?.name || listing.category;
  document.getElementById('detail-product-title').innerText = listing.title;
  document.getElementById('detail-product-views').innerText = `👁️ ${listing.views} views`;
  document.getElementById('detail-product-condition').innerText = listing.condition;
  document.getElementById('detail-product-date').innerText = new Date(listing.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  document.getElementById('detail-product-desc').innerText = listing.description;
  
  // Badging & exchange box
  const badge = document.getElementById('detail-product-badge');
  badge.className = `card-badge badge-${listing.tradeMode}`;
  badge.innerText = listing.tradeMode;
  
  const exchangeBox = document.getElementById('detail-exchange-req');
  const priceDisplay = document.getElementById('detail-product-price');
  
  if (listing.tradeMode === 'exchange') {
    exchangeBox.style.display = 'flex';
    exchangeBox.querySelector('span').innerText = `Swap Target: "${listing.exchangeFor}"`;
    priceDisplay.innerHTML = '🔄 Barter Trade';
  } else {
    exchangeBox.style.display = 'none';
    priceDisplay.innerHTML = listing.tradeMode === 'rent' ? `$${listing.price}<span>/day</span>` : `$${listing.price}`;
  }

  // Seller credentials
  document.getElementById('detail-seller-avatar').src = seller.avatar;
  document.getElementById('detail-seller-name').innerText = seller.name;
  document.getElementById('detail-seller-score').innerText = `⭐ Trust Rating: ${seller.trustScore}%`;
  
  const badgesList = document.getElementById('detail-seller-badges');
  badgesList.innerHTML = seller.badges.map(b => `<span class="seller-badge">${b}</span>`).join('');

  // Render Reviews List
  renderReviewsList(listing);

  // Open modal
  const modal = document.getElementById('product-detail-modal');
  modal.classList.add('active');

  // Interactive Reviews rating composer clicks
  let selectedReviewRating = 5;
  const starsPicker = document.getElementById('review-stars-picker');
  
  function updateStarsUI(val) {
    selectedReviewRating = val;
    starsPicker.querySelectorAll('.star-btn').forEach(btn => {
      const btnVal = parseInt(btn.getAttribute('data-val'));
      btn.className = btnVal <= val ? 'star-btn active' : 'star-btn';
    });
  }

  starsPicker.querySelectorAll('.star-btn').forEach(btn => {
    btn.onclick = () => {
      updateStarsUI(parseInt(btn.getAttribute('data-val')));
    };
  });

  // Submit Review listener
  const submitReviewBtn = document.getElementById('submit-review-btn');
  const commentInput = document.getElementById('review-comment-textarea');
  
  commentInput.value = ''; // Reset input
  updateStarsUI(5); // Reset stars

  submitReviewBtn.onclick = () => {
    const text = commentInput.value.trim();
    if (!text) {
      showToast('Please type a review comment first!', 'info');
      return;
    }
    
    // Add review
    const newRev = {
      id: `rev_${Date.now()}`,
      reviewerName: state.currentUser ? state.currentUser.name : 'Anonymous Peer',
      rating: selectedReviewRating,
      comment: text,
      date: new Date().toISOString().split('T')[0]
    };
    
    listing.reviews.push(newRev);
    
    // Adjust seller trust score slightly based on review
    const baseScore = seller.trustScore;
    const diff = selectedReviewRating >= 4 ? 1 : -2;
    seller.trustScore = Math.max(70, Math.min(100, baseScore + diff));
    
    saveState();
    renderReviewsList(listing);
    renderListingsGrid();
    
    commentInput.value = '';
    document.getElementById('detail-seller-score').innerText = `⭐ Trust Rating: ${seller.trustScore}%`;
    showToast('Trust rating review posted successfully!', 'success');
  };

  // Connect contact chat trigger button
  const chatStartBtn = document.getElementById('chat-start-btn');
  chatStartBtn.onclick = () => {
    modal.classList.remove('active');
    openChatSimulator(listing.id);
  };
  
  // Flag button coordinate
  document.getElementById('flag-listing-btn').onclick = () => {
    showToast('Listing reported to community moderation council.', 'info');
  };
}

function renderReviewsList(listing) {
  const container = document.getElementById('detail-reviews-list');
  const summaryCount = document.getElementById('reviews-summary-count');
  
  summaryCount.innerText = `(${listing.reviews.length})`;

  if (listing.reviews.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; font-size:0.85rem; color:var(--text-muted)">No peer reviews listed yet. Deal in safe hubs to earn ratings.</div>`;
  } else {
    container.innerHTML = listing.reviews.map(rev => `
      <div class="review-item">
        <div class="review-header">
          <span class="reviewer-name">${rev.reviewerName}</span>
          <span class="review-rating">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
        </div>
        <p class="review-comment">${rev.comment}</p>
        <div class="review-date">${new Date(rev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      </div>
    `).join('');
  }
}

// --- Live Chat Simulator Engine ---

function openChatSimulator(listingId) {
  const listing = state.listings.find(item => item.id === listingId);
  if (!listing) return;

  const seller = state.users.find(u => u.id === listing.sellerId) || MOCK_USERS[0];
  state.chatSession.activeListingId = listingId;

  // Initialize Chat UI headers
  document.getElementById('chat-seller-avatar').src = seller.avatar;
  document.getElementById('chat-seller-name').innerText = seller.name;
  document.getElementById('chat-listing-title').innerText = `${listing.title} • $${listing.price || listing.exchangeFor}`;

  // Restore or seed default conversations from session storage
  const chatSessionKey = `chat_session_${listingId}`;
  state.chatSession.messages = JSON.parse(sessionStorage.getItem(chatSessionKey)) || [];

  if (state.chatSession.messages.length === 0) {
    // First message starts blank or seeds welcome bubble
    state.chatSession.messages.push({
      sender: 'seller',
      text: `Hey! Thanks for expressing interest in "${listing.title}". Let me know if you have any questions or want to coordinate a meetup!`,
      time: getCurrentTime()
    });
    sessionStorage.setItem(chatSessionKey, JSON.stringify(state.chatSession.messages));
  }

  renderChatMessages();

  // Slide drawer open
  document.getElementById('chat-sidebar-drawer').classList.add('active');
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container');
  const listing = state.listings.find(item => item.id === state.chatSession.activeListingId);
  const seller = state.users.find(u => u.id === listing?.sellerId) || MOCK_USERS[0];
  
  container.innerHTML = `
    <div class="chat-date-divider">Today</div>
  ` + state.chatSession.messages.map(msg => {
    const avatar = msg.sender === 'me' 
      ? (state.currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120')
      : seller.avatar;
    
    return `
      <div class="msg-wrapper ${msg.sender === 'received' || msg.sender === 'seller' ? 'received' : 'sent'}">
        <img src="${avatar}" class="msg-avatar" alt="Avatar">
        <div class="msg-bubble">
          <div>${msg.text}</div>
          <div class="msg-time">${msg.time}</div>
        </div>
      </div>
    `;
  }).join('');

  // Scroll to bottom immediately
  container.scrollTop = container.scrollHeight;
}

// Send interactive message and trigger AI natural reply
function handleSendMessage() {
  const input = document.getElementById('chat-msg-input');
  const text = input.value.trim();
  if (!text) return;

  // Append user message
  const userMsg = {
    sender: 'me',
    text: text,
    time: getCurrentTime()
  };

  state.chatSession.messages.push(userMsg);
  renderChatMessages();
  input.value = '';

  const listingId = state.chatSession.activeListingId;
  const chatSessionKey = `chat_session_${listingId}`;
  sessionStorage.setItem(chatSessionKey, JSON.stringify(state.chatSession.messages));

  // Determine dialogue triggers
  const itemConfig = MOCK_CHATS[listingId] || MOCK_CHATS['default'];
  let replyIndex = 0;

  // Count past sent messages to progress conversation realistically
  const sentCount = state.chatSession.messages.filter(m => m.sender === 'me').length;
  
  // Base reply based on regex match or conversation depth
  if (sentCount === 1) replyIndex = 0;
  else if (sentCount === 2) replyIndex = 1;
  else replyIndex = 2;

  // Map triggers if there is matches
  itemConfig.triggers.forEach((regex, idx) => {
    if (regex.test(text)) {
      replyIndex = idx;
    }
  });

  const replyText = itemConfig.responses[replyIndex] || "Sounds good! Let's meet up at the Library Cafe tomorrow.";

  // Show typing dots animation after 1.2s delay
  const typingLoader = document.getElementById('chat-typing-loader');
  const chatBody = document.getElementById('chat-messages-container');

  setTimeout(() => {
    typingLoader.style.display = 'flex';
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 600);

  // Trigger reply after 2.2s
  setTimeout(() => {
    typingLoader.style.display = 'none';
    
    state.chatSession.messages.push({
      sender: 'seller',
      text: replyText,
      time: getCurrentTime()
    });

    sessionStorage.setItem(chatSessionKey, JSON.stringify(state.chatSession.messages));
    renderChatMessages();
  }, 2200);
}

// --- Create Listing Wizard Form Engine ---

function openListingWizard() {
  // If not logged in, force sign in modal first
  if (!state.currentUser) {
    showToast('Please sign in to list items in your community!', 'info');
    openAuthModal('signup');
    return;
  }

  state.wizard = {
    step: 1,
    title: '',
    desc: '',
    category: 'textbooks',
    condition: 'Excellent',
    tradeMode: 'buy',
    price: 10,
    exchangeFor: '',
    images: []
  };

  updateWizardStepUI();
  
  // Show listing modal
  document.getElementById('create-listing-modal').classList.add('active');
}

function updateWizardStepUI() {
  const step = state.wizard.step;
  const progress = document.getElementById('wizard-progress');
  const nextBtn = document.getElementById('wizard-next-btn');
  const prevBtn = document.getElementById('wizard-prev-btn');

  // Progress line percentage
  progress.style.width = `${((step - 1) / 2) * 100}%`;

  // Nodes UI highlights
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`node-step-${i}`);
    const panel = document.getElementById(`panel-step-${i}`);
    
    if (i < step) {
      node.className = 'step-node completed';
      panel.className = 'wizard-panel';
    } else if (i === step) {
      node.className = 'step-node active';
      panel.className = 'wizard-panel active';
    } else {
      node.className = 'step-node';
      panel.className = 'wizard-panel';
    }
  }

  // Buttons label configurations
  prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  nextBtn.innerText = step === 3 ? 'Publish Listing' : 'Next Step';
}

function handleWizardNext() {
  const step = state.wizard.step;

  if (step === 1) {
    // Validate Step 1
    const title = document.getElementById('list-title').value.trim();
    const desc = document.getElementById('list-desc').value.trim();
    if (!title || !desc) {
      showToast('Please fill in both title and description details.', 'info');
      return;
    }
    
    state.wizard.title = title;
    state.wizard.desc = desc;
    state.wizard.category = document.getElementById('list-category').value;
    state.wizard.condition = document.getElementById('list-condition').value;
    
    state.wizard.step = 2;
    updateWizardStepUI();
  } 
  else if (step === 2) {
    // Validate Step 2
    const priceInput = document.getElementById('list-price');
    const exchangeInput = document.getElementById('list-exchange');
    
    if (state.wizard.tradeMode === 'exchange') {
      const exchangeVal = exchangeInput.value.trim();
      if (!exchangeVal) {
        showToast('Please specify the barter item you wish to swap with!', 'info');
        return;
      }
      state.wizard.exchangeFor = exchangeVal;
      state.wizard.price = 0;
    } else {
      const priceVal = parseFloat(priceInput.value);
      if (isNaN(priceVal) || priceVal < 0) {
        showToast('Please provide a valid price amount.', 'info');
        return;
      }
      state.wizard.price = priceVal;
      state.wizard.exchangeFor = '';
    }

    state.wizard.step = 3;
    updateWizardStepUI();
    renderWizardPreviewGrid();
  } 
  else if (step === 3) {
    // Publish Final step
    if (state.wizard.images.length === 0) {
      // Auto-populate a default fallback from preset category
      const presets = MOCK_CATEGORY_IMAGES[state.wizard.category] || MOCK_CATEGORY_IMAGES.textbooks;
      state.wizard.images.push(presets[Math.floor(Math.random() * presets.length)]);
    }

    const newListing = {
      id: `prod_${Date.now()}`,
      title: state.wizard.title,
      description: state.wizard.desc,
      category: state.wizard.category,
      condition: state.wizard.condition,
      tradeMode: state.wizard.tradeMode,
      price: state.wizard.price,
      exchangeFor: state.wizard.exchangeFor,
      image: state.wizard.images[0],
      sellerId: state.currentUser.id,
      views: 1,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'available',
      reviews: []
    };

    // Save listing into state and update statistics banner
    state.listings.unshift(newListing);
    saveState();
    
    // Update stats counters dynamically in DOM
    const transVal = document.getElementById('stat-trans-val');
    const transCount = parseInt(transVal.innerText.replace('+', '')) || 1180;
    transVal.innerHTML = `${transCount + 1}<span>+</span>`;

    if (newListing.tradeMode === 'rent') {
      const rentVal = document.getElementById('stat-rent-val');
      const rentCount = parseInt(rentVal.innerText) || 42;
      rentVal.innerText = rentCount + 1;
    }
    
    // Refresh grids
    renderListingsGrid();
    
    // Close modal & reset inputs
    document.getElementById('create-listing-modal').classList.remove('active');
    resetWizardInputs();
    showToast('Your item has been listed inside the community!', 'success');
  }
}

function resetWizardInputs() {
  document.getElementById('list-title').value = '';
  document.getElementById('list-desc').value = '';
  document.getElementById('list-exchange').value = '';
  document.getElementById('list-price').value = '10';
  document.getElementById('wizard-preview-grid').innerHTML = '';
}

function handleWizardUploadSimulate() {
  const presets = MOCK_CATEGORY_IMAGES[state.wizard.category] || MOCK_CATEGORY_IMAGES.textbooks;
  const targetImg = presets[state.wizard.images.length % presets.length];
  
  if (state.wizard.images.length >= 4) {
    showToast('Maximum 4 pictures allowed for a single item.', 'info');
    return;
  }
  
  state.wizard.images.push(targetImg);
  renderWizardPreviewGrid();
  showToast('Image attached to preview drawer.', 'success');
}

function renderWizardPreviewGrid() {
  const container = document.getElementById('wizard-preview-grid');
  container.innerHTML = state.wizard.images.map((img, idx) => `
    <div class="preview-thumb">
      <img src="${img}" alt="Preview image">
      <button class="preview-thumb-close" data-index="${idx}">×</button>
    </div>
  `).join('');

  // Previews remove handlers
  container.querySelectorAll('.preview-thumb-close').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.getAttribute('data-index'));
      state.wizard.images.splice(idx, 1);
      renderWizardPreviewGrid();
    };
  });
}

// --- Auth Sign In / Validation Engine ---

function openAuthModal(mode = 'signin') {
  const title = document.getElementById('auth-title');
  const desc = document.getElementById('auth-desc');
  const nameGroup = document.getElementById('auth-group-name');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleFooter = document.getElementById('auth-footer-toggle');
  
  if (mode === 'signup') {
    title.innerText = 'Join CommuniTrade';
    desc.innerText = 'Register using your institutional coordinates to transact safely.';
    nameGroup.style.display = 'flex';
    submitBtn.innerText = 'Create Account';
    toggleFooter.innerHTML = `Already have an account? <span class="auth-toggle" id="auth-toggle-mode">Sign In</span>`;
  } else {
    title.innerText = 'Verify Community Account';
    desc.innerText = 'Sign up using your college credentials for trusted campus trading.';
    nameGroup.style.display = 'none';
    submitBtn.innerText = 'Sign In';
    toggleFooter.innerHTML = `Don't have an account? <span class="auth-toggle" id="auth-toggle-mode">Sign Up</span>`;
  }

  // Bind toggler clicks
  document.getElementById('auth-toggle-mode').onclick = () => {
    openAuthModal(mode === 'signin' ? 'signup' : 'signin');
  };

  document.getElementById('auth-modal').classList.add('active');
  
  // Submit handler binding
  submitBtn.onclick = () => {
    handleAuthSubmit(mode);
  };
}

function verifyEmailDomain(email) {
  const domains = ['.edu', '.edu.in', '.ac.in'];
  return domains.some(dom => email.toLowerCase().endsWith(dom));
}

function handleAuthSubmit(mode) {
  const emailInput = document.getElementById('auth-email-input');
  const passInput = document.getElementById('auth-pass-input');
  const nameInput = document.getElementById('auth-name-input');
  
  const email = emailInput.value.trim();
  const pass = passInput.value;
  const name = nameInput.value.trim();

  if (!email || !pass || (mode === 'signup' && !name)) {
    showToast('Please fill out all verification inputs.', 'info');
    return;
  }

  const isVerifiedDomain = verifyEmailDomain(email);

  if (mode === 'signup') {
    // Create new mock user
    const newUser = {
      id: `user_${Date.now()}`,
      name: name,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=120`,
      email: email,
      trustScore: isVerifiedDomain ? 95 : 80,
      isVerified: true,
      badges: isVerifiedDomain ? ['Verified Student'] : ['Community Guest'],
      joinedDate: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
    };

    state.users.push(newUser);
    state.currentUser = newUser;
    saveState();
  } else {
    // Sign In match simulator
    const matched = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      state.currentUser = matched;
    } else {
      // If user not exist, automatically sign them in as dynamic new peer
      const freshUser = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        email: email,
        trustScore: isVerifiedDomain ? 95 : 80,
        isVerified: true,
        badges: isVerifiedDomain ? ['Verified Student'] : ['Community Guest'],
        joinedDate: 'May 2026'
      };
      state.users.push(freshUser);
      state.currentUser = freshUser;
    }
    saveState();
  }

  // Update UI and close modal
  renderNavbarAuth();
  document.getElementById('auth-modal').classList.remove('active');
  
  // Welcome toaster
  const welcomeStr = isVerifiedDomain 
    ? `Welcome ${state.currentUser.name}! 🛡️ Institutional Trust Badge Unlocked!` 
    : `Welcome ${state.currentUser.name}! Signed in as guest.`;
  showToast(welcomeStr, 'success');
}

// --- Helpers Utilities ---

function getTimeAgo(dateStr) {
  const diffTime = Math.abs(new Date() - new Date(dateStr));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function getCurrentTime() {
  const d = new Date();
  let hours = d.getHours();
  let minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

// --- App Event Handlers Binding ---

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial renders
  renderNavbarAuth();
  renderCategoryChips();
  renderListingsGrid();
  renderSafeZones();

  // 2. Global Search listener
  const searchInput = document.getElementById('search-query-input');
  searchInput.addEventListener('input', (e) => {
    state.activeFilters.search = e.target.value;
    renderListingsGrid();
  });

  // 3. Trade Modes Filter listener
  const tradeTabs = document.getElementById('trade-tabs-group');
  tradeTabs.querySelectorAll('.trade-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tradeTabs.querySelector('.active').classList.remove('active');
      tab.classList.add('active');
      state.activeFilters.tradeMode = tab.getAttribute('data-mode');
      renderListingsGrid();
    });
  });

  // 4. Sort select listener
  document.getElementById('sort-select').addEventListener('change', (e) => {
    state.activeFilters.sort = e.target.value;
    renderListingsGrid();
  });

  // 5. Close Modals buttons triggers
  document.getElementById('detail-modal-close').onclick = () => {
    document.getElementById('product-detail-modal').classList.remove('active');
  };
  document.getElementById('listing-modal-close').onclick = () => {
    document.getElementById('create-listing-modal').classList.remove('active');
  };
  document.getElementById('auth-modal-close').onclick = () => {
    document.getElementById('auth-modal').classList.remove('active');
  };
  document.getElementById('chat-drawer-close').onclick = () => {
    document.getElementById('chat-sidebar-drawer').classList.remove('active');
  };

  // Close overlays on clicking backdrop
  window.onclick = (e) => {
    const detailModal = document.getElementById('product-detail-modal');
    const listingModal = document.getElementById('create-listing-modal');
    const authModal = document.getElementById('auth-modal');
    
    if (e.target === detailModal) detailModal.classList.remove('active');
    if (e.target === listingModal) listingModal.classList.remove('active');
    if (e.target === authModal) authModal.classList.remove('active');
  };

  // 6. Navbar Listing creator buttons
  document.getElementById('create-listing-nav-btn').onclick = () => {
    openListingWizard();
  };
  document.getElementById('post-hero-btn').onclick = () => {
    openListingWizard();
  };

  // 7. Wizard navigation flow binding
  const wizardPrevBtn = document.getElementById('wizard-prev-btn');
  const wizardNextBtn = document.getElementById('wizard-next-btn');

  wizardPrevBtn.onclick = () => {
    if (state.wizard.step > 1) {
      state.wizard.step -= 1;
      updateWizardStepUI();
    }
  };

  wizardNextBtn.onclick = () => {
    handleWizardNext();
  };

  // Wizard trade modes toggler inside form Step 2
  const wizardTradeTabs = document.getElementById('wizard-trade-tabs');
  wizardTradeTabs.querySelectorAll('.trade-tab').forEach(tab => {
    tab.onclick = () => {
      wizardTradeTabs.querySelector('.active').classList.remove('active');
      tab.classList.add('active');
      
      const val = tab.getAttribute('data-val');
      state.wizard.tradeMode = val;
      
      const priceGroup = document.getElementById('wizard-group-price');
      const exchangeGroup = document.getElementById('wizard-group-exchange');
      const priceLabel = document.getElementById('wizard-price-label');

      if (val === 'exchange') {
        priceGroup.style.display = 'none';
        exchangeGroup.style.display = 'flex';
      } else {
        priceGroup.style.display = 'flex';
        exchangeGroup.style.display = 'none';
        priceLabel.innerText = val === 'rent' ? 'Rental Price Per Day ($)' : 'Sale Price ($)';
      }
    };
  });

  // Photo simulation trigger
  document.getElementById('wizard-upload-drop').onclick = () => {
    handleWizardUploadSimulate();
  };

  // 8. Chat actions binding
  document.getElementById('chat-send-btn').onclick = () => {
    handleSendMessage();
  };
  document.getElementById('chat-msg-input').onkeydown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

});
