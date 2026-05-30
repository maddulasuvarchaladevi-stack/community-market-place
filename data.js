// CommuniTrade Mock Database and Assets Module

export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Items', icon: '✨' },
  { id: 'textbooks', name: 'Textbooks', icon: '📚' },
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'transport', name: 'Transport', icon: '🚲' },
  { id: 'lab-gear', name: 'Lab Gear', icon: '🥽' },
  { id: 'services', name: 'Services', icon: '🛠️' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '🏸' }
];

export const MOCK_USERS = [
  {
    id: 'user_1',
    name: 'Aarav Mehta',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    email: 'aarav.mehta@university.edu',
    trustScore: 98,
    isVerified: true,
    badges: ['Senior Mentor', 'Top Rated Seller', 'Eco-Warrior'],
    joinedDate: 'Aug 2024'
  },
  {
    id: 'user_2',
    name: 'Emily Watson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    email: 'emily.watson@university.edu',
    trustScore: 95,
    isVerified: true,
    badges: ['Hostel Representative', 'Fast Responder'],
    joinedDate: 'Oct 2024'
  },
  {
    id: 'user_3',
    name: 'Devansh Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    email: 'devansh.v@university.edu',
    trustScore: 92,
    isVerified: true,
    badges: ['Book Worm'],
    joinedDate: 'Jan 2025'
  },
  {
    id: 'user_4',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    email: 'sarah.chen@university.edu',
    trustScore: 99,
    isVerified: true,
    badges: ['Lab Assistant', 'Reliable Peer'],
    joinedDate: 'Sep 2024'
  }
];

export const INITIAL_LISTINGS = [
  {
    id: 'prod_1',
    title: "Thomas' Calculus (14th Global Edition)",
    description: "Used for 1st and 2nd Semester engineering courses. Excellent condition, very minimal pencil markings in the first chapter only. Rest is completely clean. Includes the unopened online access code card!",
    price: 25,
    category: 'textbooks',
    tradeMode: 'buy', // 'buy', 'rent', 'exchange'
    exchangeFor: '',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_3',
    views: 142,
    dateAdded: '2026-05-28',
    status: 'available',
    condition: 'Excellent',
    reviews: [
      { id: 'rev_11', reviewerName: 'Rohan Gupta', rating: 5, comment: 'Book was exactly in the condition described, super helpful seller!', date: '2026-05-29' }
    ]
  },
  {
    id: 'prod_2',
    title: 'Texas Instruments TI-84 Plus CE',
    description: 'Graphing Calculator required for all advanced calculus, linear algebra, and physics sessions. Battery holds charge for weeks. Comes with charging cable and protective slipcase.',
    price: 45,
    category: 'electronics',
    tradeMode: 'buy',
    exchangeFor: '',
    image: 'https://images.unsplash.com/photo-1610824352934-c10d8706f35b?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_1',
    views: 89,
    dateAdded: '2026-05-29',
    status: 'available',
    condition: 'Like New',
    reviews: []
  },
  {
    id: 'prod_3',
    title: 'Decathlon Rockrider Mountain Bike',
    description: 'Hostel residents, perfect for campus commutes and weekend trail riding. Has 21-speed Shimano gears, comfortable gel seat cover, strong front suspension. Safe locks and dynamic front/rear lights included.',
    price: 3, // Per day
    category: 'transport',
    tradeMode: 'rent',
    exchangeFor: '',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_2',
    views: 215,
    dateAdded: '2026-05-25',
    status: 'available',
    condition: 'Very Good',
    reviews: [
      { id: 'rev_31', reviewerName: 'Kabir Sen', rating: 4, comment: 'Rented for 3 days. Tyres were fully inflated and brakes are sharp. Highly recommended!', date: '2026-05-27' }
    ]
  },
  {
    id: 'prod_4',
    title: 'Premium Chemistry Lab Coat & Goggles',
    description: 'Medium size cotton white lab coat and chemical splash goggles. Essential for freshman chemistry labs. Swap with anyone who has organic chemistry study material or semester guides!',
    price: 0,
    category: 'lab-gear',
    tradeMode: 'exchange',
    exchangeFor: 'Organic Chemistry Semester 3 guide/notes',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_4',
    views: 64,
    dateAdded: '2026-05-27',
    status: 'available',
    condition: 'Good',
    reviews: []
  },
  {
    id: 'prod_5',
    title: 'React.js & Node.js Crash Course Prep',
    description: 'Need help with web dev labs or semester project? I am a 4th-year CS student offering 1-on-1 tutoring. Can help you understand building full-stack applications, routing, REST APIs, and state systems.',
    price: 15, // Per Hour
    category: 'services',
    tradeMode: 'buy',
    exchangeFor: '',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_1',
    views: 110,
    dateAdded: '2026-05-26',
    status: 'available',
    condition: 'Professional',
    reviews: [
      { id: 'rev_51', reviewerName: 'Alisha Khan', rating: 5, comment: 'Aarav is an awesome tutor! He explained React Hooks so clearly that I aced my lab assignment.', date: '2026-05-28' }
    ]
  },
  {
    id: 'prod_6',
    title: 'Wilson US Open Tennis Racket',
    description: 'Graphite construction, standard adult grip size 3. Selling or exchanging for a decent pair of badminton rackets. Plays great, strings have excellent tension.',
    price: 0,
    category: 'sports',
    tradeMode: 'exchange',
    exchangeFor: 'Yonex/Li-Ning Badminton Rackets',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4efb3?auto=format&fit=crop&q=80&w=600',
    sellerId: 'user_2',
    views: 43,
    dateAdded: '2026-05-30',
    status: 'available',
    condition: 'Good',
    reviews: []
  }
];

export const SAFE_MEET_ZONES = [
  {
    id: 'zone_1',
    name: 'Central Library Lounge',
    description: 'Monitored by campus security, quiet indoor environment, excellent lighting. Perfect for books & gadgets.',
    safetyRating: 5
  },
  {
    id: 'zone_2',
    name: 'Main Quadrangle Cafeteria',
    description: 'High foot-traffic, wide open space, cameras present. Great during college hours (9 AM - 5 PM).',
    safetyRating: 5
  },
  {
    id: 'zone_3',
    name: 'Hostel Block A Lobby',
    description: 'Perfect for quick exchanges between hostellers. Fully secure gate guard access.',
    safetyRating: 4.8
  },
  {
    id: 'zone_4',
    name: 'Sports Complex Main Gates',
    description: 'Best for outdoor equipment, cycles, or larger items. Highly active, wide driveway.',
    safetyRating: 4.5
  }
];

// Interactive chat simulations replies
export const MOCK_CHATS = {
  'prod_1': {
    responses: [
      "Hi! Yes, the calculus textbook is still available. It's in great condition, almost brand new.",
      "Sure, I can do that! How about we meet at the Central Library Lounge tomorrow around 1:00 PM during lunch?",
      "Perfect! You can pay me via cash or digital transfer when you see the book. See you there!"
    ],
    triggers: [
      /hello|hi|hey|is this available|still available/i,
      /meet|where|time|when|place/i,
      /ok|perfect|awesome|deal|sounds good/i
    ]
  },
  'prod_2': {
    responses: [
      "Hey! Yes, the TI-84 calculator is available. I just charged it fully yesterday.",
      "Yes, the price of $45 is slightly negotiable if you can meet up today. What is your offer?",
      "That works for me! Let's meet at the Quadrangle Cafeteria around 4:00 PM. Does that time suit you?"
    ],
    triggers: [
      /hi|hello|available|calculator|still have/i,
      /negotiable|price|discount|cheaper|offer/i,
      /meet|quad|cafeteria|agree|sounds good/i
    ]
  },
  'prod_3': {
    responses: [
      "Hello! Yes, the Btwin Rockrider is available for rent. How many days do you need it for?",
      "That will be $3 per day, so $9 for 3 days. I will require a quick verification of your student ID.",
      "Perfect. I am at Hostel Block B. Let me know when you arrive at the cycle stand nearby!"
    ],
    triggers: [
      /rent|available|bike|cycle|days/i,
      /price|cost|charge|id|verification/i,
      / hostel|block b|meet|coming|arriving/i
    ]
  },
  'prod_4': {
    responses: [
      "Hey! Yes, I still have the lab coat and goggles.",
      "I am looking for Semester 3 organic chem guides or notes in exchange. Do you have any of those?",
      "That's fantastic! Let's meet at the Lab Block lobby tomorrow morning at 10 AM to swap."
    ],
    triggers: [
      /coat|goggles|available|swap|exchange/i,
      /notes|guide|semester|organic/i,
      /deal|meet|lobby|swap|tomorrow/i
    ]
  },
  'prod_5': {
    responses: [
      "Hi! Thanks for reaching out. Yes, I still have slots open for tutoring this week.",
      "I specialize in HTML/CSS/JS, React, Node, and Express database layouts. What are you working on?",
      "Sure! Let's set up a quick 1-hour session. I can meet you at the library cafe to get started."
    ],
    triggers: [
      /tutor|help|react|node|class|learn/i,
      /what|topics|teach|syllabus/i,
      /session|hour|schedule|meet|start/i
    ]
  },
  'prod_6': {
    responses: [
      "Hey! The tennis racket is in good condition.",
      "Yes, I want to exchange it for a decent badminton racket set. What brand do you have?",
      "Sounds like a fair deal. We can meet at the Sports Complex gates tomorrow at 5 PM."
    ],
    triggers: [
      /tennis|racket|available|condition/i,
      /badminton|brand|swap|exchange/i,
      /sports|complex|meet|tomorrow|deal/i
    ]
  },
  'default': {
    responses: [
      "Hello there! Thanks for your message. Yes, that is available.",
      "Let's coordinate a quick meeting at the Library Lounge or Campus Quad. What time works best?",
      "Sounds like a plan! Looking forward to meeting up."
    ],
    triggers: [
      /hello|hi|hey|available/i,
      /meet|where|time|coordinate/i,
      /deal|ok|agree|great/i
    ]
  }
};
