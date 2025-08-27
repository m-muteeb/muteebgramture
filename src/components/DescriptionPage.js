import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { message, Spin } from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";

import CommentSection from "./CommentSection";
import ShareArticle from "./ShareArticle";
import MCQList from "./notes/Mcqs";

import {
  extractTextFromHTML,
  fetchProducts,
  fetchAllTopics,
  getNextTopic,
  getPrevTopic,
} from "../hooks/useDescriptionLogic";

import "../assets/css/description.css";

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Description() {
  const { subCategory, topicSlug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTopics, setAllTopics] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch selected topic
        const productsList = await fetchProducts(subCategory, topicSlug);
        setProducts(productsList);
        setLoading(false);

        // Fetch all topics for navigation
        const topicsList = await fetchAllTopics(subCategory);
        setAllTopics(topicsList);

        // Find current topic index
        const currentTopicIdx = topicsList.findIndex(
          (topic) => topic.id === topicSlug || topic.slug === topicSlug
        );
        setCurrentTopicIndex(currentTopicIdx);
      } catch (error) {
        message.error("Failed to fetch data.");
        console.error(error);
      }
    })();
  }, [subCategory, topicSlug]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="description-container mt-5">
      {loading && (
        <div className="loader-overlay">
          <Spin size="large" />
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <title>Gramture - {products[0].topic}</title>
          <meta
            name="description"
            content={extractTextFromHTML(products[0].description).substring(0, 150)}
          />

          {/* Topic Title */}
          <h1 className="topic-title">{products[0].topic}</h1>

          {/* Description Section */}
          {products.map((product) => (
            <article key={product.id} className="product-article">
              <div
                className="product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </article>
          ))}

          {/* PDF Viewer */}
          <Document
            file={products[0].notesFile}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<Spin size="large" tip="Loading PDF..." />}
            error={<div className="text-red-500">Failed to load PDF</div>}
          >
            {Array.from({ length: numPages }, (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>

          {/* MCQ Section */}
          <MCQList subCategory={subCategory} topicSlug={topicSlug} />

          {/* Share Buttons */}
          <ShareArticle />

          {/* Previous / Next Navigation */}
          <div className="topic-navigation">
            {getPrevTopic(allTopics, currentTopicIndex) &&
              getPrevTopic(allTopics, currentTopicIndex).subCategory === subCategory && (
                <Link
                  to={`/description/${subCategory}/${getPrevTopic(allTopics, currentTopicIndex).slug}`}
                  className="prev-button"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <FaChevronLeft className="nav-icon" /> Previous Topic:{" "}
                  {getPrevTopic(allTopics, currentTopicIndex).topic}
                </Link>
              )}

            {getNextTopic(allTopics, currentTopicIndex) &&
              getNextTopic(allTopics, currentTopicIndex).subCategory === subCategory && (
                <Link
                  to={`/description/${subCategory}/${getNextTopic(allTopics, currentTopicIndex).slug}`}
                  className="next-button"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Next Topic: {getNextTopic(allTopics, currentTopicIndex).topic}{" "}
                  <FaChevronRight className="nav-icon" />
                </Link>
              )}
          </div>

          {/* Comments Section */}
          <CommentSection subCategory={subCategory} topicId={products[0]?.id} />
        </>
      )}
    </div>
  );
}
