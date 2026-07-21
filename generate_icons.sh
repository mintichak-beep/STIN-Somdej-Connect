#!/bin/bash

cat << 'SVG' > src/assets/icons/hospital.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="15" y="40" width="70" height="50" rx="8" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="30" y="20" width="40" height="25" rx="8" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <path d="M46 12 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 z" fill="#c62828"/>
  <rect x="25" y="55" width="15" height="15" rx="4" fill="#c62828"/>
  <rect x="60" y="55" width="15" height="15" rx="4" fill="#c62828"/>
  <path d="M40 70 h20 v20 h-20 z" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/student.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M20 90 c0 -20 15 -30 30 -30 s30 10 30 30 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="50" cy="40" r="18" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
  <path d="M35 25 q15 -10 30 0 l-5 -15 h-20 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="45" y="15" width="10" height="4" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/teacher.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M20 90 c0 -20 15 -30 30 -30 s30 10 30 30 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="50" cy="35" r="18" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
  <path d="M35 60 v15 c0 10 30 10 30 0 v-15" fill="none" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
  <circle cx="35" cy="58" r="4" fill="#c62828"/>
  <circle cx="65" cy="58" r="4" fill="#c62828"/>
  <circle cx="65" cy="85" r="6" fill="#c62828"/>
  <rect x="38" y="30" width="10" height="6" rx="2" fill="none" stroke="#c62828" stroke-width="3"/>
  <rect x="52" y="30" width="10" height="6" rx="2" fill="none" stroke="#c62828" stroke-width="3"/>
  <path d="M48 33 h4" fill="none" stroke="#c62828" stroke-width="2"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/book.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="20" y="15" width="60" height="70" rx="6" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <line x1="35" y1="15" x2="35" y2="85" stroke="#c62828" stroke-width="6"/>
  <path d="M55 40 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6 z" fill="#c62828"/>
  <rect x="45" y="70" width="25" height="4" rx="2" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/calendar.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="15" y="25" width="70" height="65" rx="10" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <path d="M15 45 h70" fill="none" stroke="#c62828" stroke-width="6"/>
  <rect x="30" y="10" width="10" height="20" rx="5" fill="#c62828"/>
  <rect x="60" y="10" width="10" height="20" rx="5" fill="#c62828"/>
  <circle cx="35" cy="65" r="5" fill="#c62828"/>
  <circle cx="50" cy="65" r="5" fill="#c62828"/>
  <circle cx="65" cy="65" r="5" fill="#c62828"/>
  <circle cx="35" cy="78" r="5" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/dorm.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="20" y="20" width="60" height="70" rx="6" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="32" y="35" width="12" height="12" rx="3" fill="#c62828"/>
  <rect x="56" y="35" width="12" height="12" rx="3" fill="#c62828"/>
  <rect x="32" y="55" width="12" height="12" rx="3" fill="#c62828"/>
  <rect x="56" y="55" width="12" height="12" rx="3" fill="#c62828"/>
  <path d="M42 75 h16 v15 h-16 z" fill="#c62828"/>
  <path d="M20 25 l30 -15 l30 15" fill="none" stroke="#c62828" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/van.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M15 45 c0 -10 5 -15 15 -15 h40 c10 0 20 10 20 20 v25 h-75 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="60" y="40" width="15" height="15" rx="3" fill="#c62828"/>
  <circle cx="30" cy="75" r="12" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
  <circle cx="70" cy="75" r="12" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
  <path d="M40 38 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6 z" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/utilities.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M35 25 c-15 20 -20 30 -20 40 a20 20 0 0 0 40 0 c0 -10 -5 -20 -20 -40 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <path d="M65 15 l-15 35 h15 l-10 35 l25 -40 h-15 z" fill="#c62828" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/wallet.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="15" y="30" width="70" height="50" rx="8" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <path d="M15 45 h55" fill="none" stroke="#c62828" stroke-width="6"/>
  <path d="M70 45 h15 v20 h-15 a10 10 0 0 1 0 -20 z" fill="#c62828"/>
  <circle cx="75" cy="55" r="3" fill="#ffffff"/>
  <path d="M35 55 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/charts.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="15" y="15" width="70" height="70" rx="8" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="30" y="55" width="10" height="20" rx="3" fill="#c62828"/>
  <rect x="45" y="35" width="10" height="40" rx="3" fill="#c62828"/>
  <rect x="60" y="25" width="10" height="50" rx="3" fill="#c62828"/>
  <path d="M25 25 h3 v3 h3 v3 h-3 v3 h-3 v-3 h-3 v-3 h3 z" fill="#c62828"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/gear.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M50 25 a25 25 0 1 0 0 50 a25 25 0 1 0 0 -50" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
  <circle cx="50" cy="50" r="10" fill="#c62828"/>
  <rect x="42" y="10" width="16" height="10" rx="3" fill="#c62828"/>
  <rect x="42" y="80" width="16" height="10" rx="3" fill="#c62828"/>
  <rect x="10" y="42" width="10" height="16" rx="3" fill="#c62828"/>
  <rect x="80" y="42" width="10" height="16" rx="3" fill="#c62828"/>
  <g transform="rotate(45 50 50)">
    <rect x="42" y="10" width="16" height="10" rx="3" fill="#c62828"/>
    <rect x="42" y="80" width="16" height="10" rx="3" fill="#c62828"/>
    <rect x="10" y="42" width="10" height="16" rx="3" fill="#c62828"/>
    <rect x="80" y="42" width="10" height="16" rx="3" fill="#c62828"/>
  </g>
</svg>
SVG

cat << 'SVG' > src/assets/icons/bed.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="15" y="45" width="70" height="25" rx="5" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <line x1="15" y1="70" x2="15" y2="85" stroke="#c62828" stroke-width="6" stroke-linecap="round"/>
  <line x1="85" y1="70" x2="85" y2="85" stroke="#c62828" stroke-width="6" stroke-linecap="round"/>
  <path d="M15 45 v-15 c0 -5 5 -5 10 -5 h5 c5 0 10 5 10 10 v10 z" fill="#c62828"/>
  <rect x="20" y="40" width="20" height="15" rx="5" fill="#ffffff" stroke="#c62828" stroke-width="4"/>
  <path d="M45 45 v-10 c0 -5 5 -5 10 -5 h20 c5 0 10 5 10 10 v5 z" fill="#ffffff" stroke="#c62828" stroke-width="6"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/receipt.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M25 15 h50 v75 l-10 -5 l-10 5 l-10 -5 l-10 5 l-10 -5 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="50" cy="35" r="10" fill="none" stroke="#c62828" stroke-width="5"/>
  <path d="M45 35 l5 5 l10 -10" fill="none" stroke="#c62828" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="40" y1="55" x2="60" y2="55" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
  <line x1="40" y1="65" x2="60" y2="65" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
  <line x1="40" y1="75" x2="50" y2="75" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/phone.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect x="25" y="10" width="50" height="80" rx="10" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="35" y="20" width="30" height="4" rx="2" fill="#c62828"/>
  <circle cx="50" cy="80" r="4" fill="#c62828"/>
  <path d="M50 40 v20" fill="none" stroke="#c62828" stroke-width="6" stroke-linecap="round"/>
  <path d="M40 50 l10 -10 l10 10" fill="none" stroke="#c62828" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/megaphone.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M20 40 l30 -15 v50 l-30 -15 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <path d="M50 25 h20 a15 15 0 0 1 0 50 h-20 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <rect x="25" y="60" width="10" height="25" rx="5" fill="#c62828"/>
  <path d="M80 35 a15 15 0 0 1 0 30" fill="none" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
  <path d="M90 25 a25 25 0 0 1 0 50" fill="none" stroke="#c62828" stroke-width="4" stroke-linecap="round"/>
</svg>
SVG

cat << 'SVG' > src/assets/icons/map-pin.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <path d="M50 15 c-15 0 -25 10 -25 25 c0 20 25 45 25 45 s25 -25 25 -45 c0 -15 -10 -25 -25 -25 z" fill="#ffffff" stroke="#c62828" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="50" cy="40" r="10" fill="#c62828"/>
</svg>
SVG

chmod +x generate_icons.sh
./generate_icons.sh
