// src/components/Description.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { message, Spin } from "antd";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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

export default function Description() {
  const { subCategory, topicSlug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTopics, setAllTopics] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const productsList = await fetchProducts(subCategory, topicSlug);
        setProducts(productsList);
        setLoading(false);

        const topicsList = await fetchAllTopics(subCategory);
        setAllTopics(topicsList);

        // Filter topics to only include those with the same subCategory
        const sameSubCategoryTopics = topicsList.filter(
          (topic) => topic.subCategory === subCategory
        );
        setFilteredTopics(sameSubCategoryTopics);

        const currentTopicIdx = sameSubCategoryTopics.findIndex(
          (topic) => topic.id === topicSlug || topic.slug === topicSlug
        );
        setCurrentTopicIndex(currentTopicIdx);
      } catch (error) {
        message.error("Failed to fetch data.");
        console.error(error);
      }
    })();
  }, [subCategory, topicSlug]);

  // Convert Google Drive link to preview URL
  const getDrivePreviewUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
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
            content={extractTextFromHTML(products[0].description).substring(
              0,
              150
            )}
          />

          {/* Title */}
          <h1 className="topic-title">{products[0].topic}</h1>

          {/* Description */}
          {products.map((product) => (
            <article key={product.id} className="product-article">
              <div
                className="product-description"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </article>
          ))}

          {/* ✅ Google Drive PDF Embed */}
          {products[0].notesFile && (
            <div className="pdf-viewer mt-4">
              <iframe
                src={getDrivePreviewUrl(products[0].notesFile)}
                width="100%"
                height="600px"
                allow="autoplay"
                title="Notes PDF"
                style={{ border: "none" }}
              />
            </div>
          )}

          {/* MCQs */}
          <MCQList subCategory={subCategory} topicSlug={topicSlug} />

          {/* Share */}
          <ShareArticle />

          {/* Navigation */}
          <div className="topic-navigation">
            {getPrevTopic(filteredTopics, currentTopicIndex) && (
              <Link
                to={`/description/${subCategory}/${
                  getPrevTopic(filteredTopics, currentTopicIndex).slug
                }`}
                className="prev-button"
                onClick={() => window.scrollTo(0, 0)}
              >
                <FaChevronLeft className="nav-icon" /> Previous Topic:{" "}
                {getPrevTopic(filteredTopics, currentTopicIndex).topic}
              </Link>
            )}

            {getNextTopic(filteredTopics, currentTopicIndex) && (
              <Link
                to={`/description/${subCategory}/${
                  getNextTopic(filteredTopics, currentTopicIndex).slug
                }`}
                className="next-button"
                onClick={() => window.scrollTo(0, 0)}
              >
                Next Topic: {getNextTopic(filteredTopics, currentTopicIndex).topic}{" "}
                <FaChevronRight className="nav-icon" />
              </Link>
            )}
          </div>

          {/* Comments */}
          <CommentSection subCategory={subCategory} topicId={products[0]?.id} />
        </>
      )}
    </div>
  );
}