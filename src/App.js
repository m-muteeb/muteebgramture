import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ Correct

import Header from './components/header';
import Footer from './components/footer';
import Hero from './components/hero';
import Classes from './components/classes';
import TestimonialsSection from './components/testimonial';
import OurTracks from './components/ourtrack';
import AboutSection from "./components/AboutSection";
import Notes from './components/notes/notes';
import AddContent from './pages/Admin-Dashboard/AddTopic';
import Preview from './components/pdfViewer/Index';
import DescriptionPage from './components/DescriptionPage';
import ContactSection from './components/ContactPage';
import Gramturestore from './components/GramtureStore';
import Faqs from './components/faqs';
import PrivacyPolicy from './components/privacypolicy';
import ManageProducts from './pages/Admin-Dashboard/ManageContent';
import TopicsSectionsPage from "./components/SectionsTopicsPage"
import DiscussionFourm from './components/DiscussionFourm';
import Ourproud from './components/Topperswall';

function HomePage() {
  return (
    <>
      <Hero />
      <Classes />
      <OurTracks />
      <TestimonialsSection />

    </>
  );
}

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutSection />} />
          <Route path="/contact" element={<ContactSection />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/addContent" element={<AddContent />} />
          <Route path="/managecontent" element={<ManageProducts />} />
          <Route path="/preview" element={<Preview />} />

          <Route path="/description" element={<DescriptionPage />} />
          <Route path="/description/:subCategory/:topicSlug" element={<DescriptionPage />} />
          


          <Route path="/notes/:selectedClass" element={<Notes />} />
          <Route path="/notes/:selectedClass/:category" element={<Notes />} />
          <Route path="/notes/:selectedClass/:category/:subcategory" element={<Notes />} />
          <Route path="/gramturestore" element={<Gramturestore />} />
           <Route path="/sections/:section" element={<TopicsSectionsPage/>} />
              <Route path="/discussionfourm" element={<DiscussionFourm/>} />
                <Route path="/ourproud" element={<Ourproud/>} />
              
        </Routes>

        {/* <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutSection />} />
             <Route path="/contact" element={<ContactSection />} />
                <Route path="/faqs" element={<Faqs />} />
                   <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/addContent" element={<AddContent />} />
           <Route path="/managecontent" element={<ManageProducts />} />
          <Route path="/preview" element={<Preview/>} />
          <Route path="/description" element={<DescriptionPage />} />
          <Route path="/notes/:selectedClass" element={<Notes/>} />
          <Route path="/notes/:selectedClass/:category" element={<Notes />} />
          <Route path="/notes/:selectedClass/:category/:subcategory" element={<Notes />} />
             <Route path="/gramturestore" element={<Gramturestore />} />

        </Routes> */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
