const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAIJkkLMF2no6waTa2ZAPmnLMOzzhFEc4",
  authDomain: "my-portfolio-64.firebaseapp.com",
  projectId: "my-portfolio-64",
  storageBucket: "my-portfolio-64.appspot.com",
  messagingSenderId: "951706751147",
  appId: "1:951706751147:web:7bb0ebbcee37302c5227ee",
  measurementId: "G-XPX6MR3QE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Base URL
const BASE_URL = 'https://gramture.com';

// Static routes
const staticRoutes = [
  '/',
  '/privacy-policy',
  '/construction',
  '/about',
  '/discussion_forum',
  '/disclaimer',
  '/login'
];

// Helper function to generate slugs
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Fetch dynamic routes from Firebase
async function fetchDynamicRoutes() {
  const dynamicRoutes = [];
  
  try {
    const q = query(collection(db, 'topics'), orderBy('timestamp', 'asc'));
    const topicsSnapshot = await getDocs(q);
    
    topicsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.subCategory && data.topic) {
        // Generate slugs
        const subCategorySlug = generateSlug(data.subCategory);
        const topicSlug = generateSlug(data.topic);
        
        // Add route with slugs
        dynamicRoutes.push(`/description/${subCategorySlug}/${topicSlug}`);
      }
    });
    
    console.log(`Fetched ${dynamicRoutes.length} dynamic routes from Firebase`);
  } catch (error) {
    console.error('Error fetching dynamic routes from Firebase:', error);
  }
  
  return dynamicRoutes;
}

// Generate sitemap with proper formatting
async function generateSitemap() {
  try {
    console.log('Fetching dynamic routes...');
    const dynamicRoutes = await fetchDynamicRoutes();
    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    
    const date = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;
    
    allRoutes.forEach(route => {
      const priority = route === '/' ? '1.00' : 
                     route.includes('description') ? '0.80' : '0.70';
      
      sitemap += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    });
    
    sitemap += `</urlset>`;
    
    // Ensure public directory exists
    const publicDir = path.resolve('./public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write sitemap files
    fs.writeFileSync(path.resolve('./public/sitemap.xml'), sitemap);
    
    // Create text version
    let textSitemap = 'Sitemap URLs:\n\n';
    allRoutes.forEach(route => {
      textSitemap += `${BASE_URL}${route}\n`;
    });
    fs.writeFileSync(path.resolve('./public/sitemap.txt'), textSitemap);
    
    console.log(`Sitemap generated with ${allRoutes.length} URLs`);
    console.log(`Static routes: ${staticRoutes.length}`);
    console.log(`Dynamic routes: ${dynamicRoutes.length}`);
    console.log('Files saved to:');
    console.log('- public/sitemap.xml');
    console.log('- public/sitemap.txt');
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();