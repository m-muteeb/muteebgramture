// import React, { useEffect, useState } from 'react';
// import { Footer } from 'antd/es/layout/layout';
// import TestimonialsSection from '../../components/testimonial';
// import FeaturedClasses from '../../components/classes';
// import Hero from '../../components/hero';
// import Header from '../../components/header';
// import { RecentPostsSection } from '../../components/recentpost';
// import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
// import { fireStore } from '../../config/firebase'; // adjust the path as needed

// function Home() {
//   const [recentPosts, setRecentPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchRecentPosts = async () => {
//       try {
//         const q = query(
//           collection(fireStore, 'posts'),
//           orderBy('timestamp', 'desc'),
//           limit(6) // Fetch latest 6 posts
//         );
//         const snapshot = await getDocs(q);
//         const postsData = snapshot.docs.map(doc => ({
//           ...doc.data(),
//           id: doc.id
//         }));
//         setRecentPosts(postsData);
//       } catch (err) {
//         console.error('Error fetching posts:', err);
//         setError('Failed to load recent posts.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRecentPosts();
//   }, []);

//   return (
//     <>
//       <div className="app-container">
//         <Header />
//         <main className='main-content'>
//           <Hero />
//           <FeaturedClasses />
//           <RecentPostsSection
//             recentPosts={recentPosts}
//             loading={loading}
//             error={error}
//           />
//           <TestimonialsSection />      
//         </main>  
//         <Footer />
//       </div>
//     </>
//   );
// }

// export default Home;












import React from 'react';
import { Footer } from 'antd/es/layout/layout';
import TestimonialsSection from '../../components/testimonial';
import FeaturedClasses from '../../components/classes';
import Hero from '../../components/hero';
import Header from '../../components/header';




function Home() {
  return (
    <>
    
    <div className="app-container">
      <Header />
      <main className='main-content'>
        <Hero />
        <FeaturedClasses />
        <TestimonialsSection />      
      </main>  
    <Footer />
        
   

      
    </div>
    </>
  );
}
export default Home;