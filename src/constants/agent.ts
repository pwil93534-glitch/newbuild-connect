import { BuyerType } from '../types';

export const AGENT_PHOTO = require('../../assets/agent-photo.png');
export const BRAND_LOGO = require('../../assets/phillip-williams-logo.png');
export const BROKERED_BY_EXP_LOGO = require('../../assets/brokered-by-exp-logo.png');

export const AGENT_PERSONA = {
  name: 'Phillip Williams',
  title: 'New Construction Real Estate Strategist',
  credential: 'eXp Realty · Arizona Licensed',
  phone: '(623) 292-3737',
  email: 'phillip.a.williams@exprealty.com',
  markets: ['Phoenix Metro', 'Tucson Metro'],
  bases: ['Luke AFB', 'Fort Huachuca', 'Davis-Monthan AFB'],
  specialties: ['Veterans', 'Military Families', 'First-Time Buyers', 'Seniors 55+', 'Relocation Buyers'],
  tagline: 'Serving Those Who Serve — and Everyone Ready to Call Arizona Home',
  missionStatement: 'My mission is simple: to serve you with honesty, expertise, and heart — from your first question to the day I hand you your keys.',
  welcomeMessages: {
    veteran: "Welcome, and thank you for your service. It is my honor to serve those who have served our country. As a New Construction Strategist dedicated to Veterans and military families, I know exactly how to maximize your VA benefits in Arizona's new construction market. You've earned this — let's make it happen together.",
    first_time: "Welcome! Buying your first home is one of the most exciting moments of your life, and I am here to make sure you feel guided, confident, and never alone in the process. My goal is to serve you every step of the way — from your first question to the day I hand you your keys.",
    relocation: "Welcome to Arizona! Relocating is a big move, and I take that seriously. My goal is to serve you by making this transition as smooth and informed as possible — so you can make a confident decision about your new Arizona home, whether you're here or still miles away.",
    senior: "Welcome! You've worked hard and given so much — now it's time for a home that truly serves you. I specialize in helping active adults and seniors 55+ find the perfect community where every day feels like a reward. Let me serve you in finding your next great chapter.",
  } as Record<BuyerType, string>,
} as const;
