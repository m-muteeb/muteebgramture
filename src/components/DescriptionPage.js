// src/components/Description.js
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTopics, setAllTopics] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [canonicalSlug, setCanonicalSlug] = useState(null);

  // --- Helpers ----------------------------------------------------
  const normalizeSlug = (slug) => (slug || "").trim().replace(/-+$/, "");

  const buildSlugVariants = (slug) => {
    const s = (slug || "").trim();
    const noTrail = s.replace(/-+$/, "");
    const withDash = noTrail ? `${noTrail}-` : s;
    return Array.from(new Set([s, noTrail, withDash])).filter(Boolean);
  };

  const slugsEqual = (a, b) => normalizeSlug(a) === normalizeSlug(b);

  const enc = (segment) => encodeURIComponent(segment || "");

  // Convert Google Drive link to preview URL
  const getDrivePreviewUrl = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
  };

  // ----------------------------------------------------------------

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); // ✅ show loader immediately

        // 1) Try multiple slug variants until a match is found
        const variants = buildSlugVariants(topicSlug);
        let foundProducts = [];
        let usedVariant = null;

        for (const v of variants) {
          const list = await fetchProducts(subCategory, v);
          if (list && list.length) {
            foundProducts = list;
            usedVariant = v;
            break;
          }
        }

        // Fetch topics regardless
        const topicsList = await fetchAllTopics(subCategory);
        setAllTopics(topicsList);

        const sameSubCategoryTopics = topicsList.filter(
          (topic) => topic.subCategory === subCategory
        );
        setFilteredTopics(sameSubCategoryTopics);

        if (foundProducts.length) {
          setProducts(foundProducts);

          // prefer slug from doc, fallback to variant
          const docSlug = foundProducts[0].slug || foundProducts[0].id || usedVariant;
          setCanonicalSlug(docSlug);

          if (!slugsEqual(docSlug, topicSlug)) {
            navigate(`/description/${enc(subCategory)}/${enc(docSlug)}`, { replace: true });
          }

          const idx = sameSubCategoryTopics.findIndex(
            (topic) =>
              slugsEqual(topic.id, docSlug) ||
              slugsEqual(topic.slug, docSlug)
          );
          setCurrentTopicIndex(idx);
        } else {
          setProducts([]);
          setCanonicalSlug(null);
          setCurrentTopicIndex(null);
        }

        setLoading(false); // ✅ turn off loader only after all processing
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch data.");
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategory, topicSlug]);

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
          <MCQList subCategory={subCategory} topicSlug={canonicalSlug || topicSlug} />

          {/* Share */}
          <ShareArticle />

          {/* Navigation */}
          <div className="topic-navigation">
            {getPrevTopic(filteredTopics, currentTopicIndex) && (
              <Link
                to={`/description/${subCategory}/${getPrevTopic(filteredTopics, currentTopicIndex).slug}`}
                className="prev-button"
                onClick={() => window.scrollTo(0, 0)}
              >
                <FaChevronLeft className="nav-icon" /> Previous Topic:{" "}
                {getPrevTopic(filteredTopics, currentTopicIndex).topic}
              </Link>
            )}

            {getNextTopic(filteredTopics, currentTopicIndex) && (
              <Link
                to={`/description/${subCategory}/${getNextTopic(filteredTopics, currentTopicIndex).slug}`}
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

      {!loading && products.length === 0 && (
        <div className="alert alert-warning mt-4" role="alert">
          No content found for this topic.
        </div>
      )}
    </div>
  );
}