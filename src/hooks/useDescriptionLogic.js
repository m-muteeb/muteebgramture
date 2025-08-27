import { getDocs, collection } from "firebase/firestore";
import { fireStore } from "../config/firebase";

// Helper to create slugs from topic strings
export const createSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

// Extract plain text from HTML string
export const extractTextFromHTML = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc.body.textContent || "";
};

// Fetch products filtered by subCategory and topicSlug
export const fetchProducts = async (subCategory, topicSlug) => {
  const querySnapshot = await getDocs(collection(fireStore, "topics"));
  const productList = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      slug: createSlug(doc.data().topic),
    }))
    .filter(
      (product) =>
        product.subCategory === subCategory &&
        (product.id === topicSlug || product.slug === topicSlug)
    );
  return productList;
};

// Fetch all topics filtered by subCategory and sorted by timestamp
export const fetchAllTopics = async (subCategory) => {
  const querySnapshot = await getDocs(collection(fireStore, "topics"));
  const topicsList = querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
      slug: createSlug(doc.data().topic),
    }))
    .filter((topic) => topic.subCategory === subCategory)
    .sort((a, b) => a.timestamp - b.timestamp);
  return topicsList;
};

// Calculate number of correct answers
export const calculateResults = (mcqs, selectedAnswer) => {
  let correctAnswers = 0;
  mcqs.forEach((mcq, index) => {
    if (selectedAnswer[index] === mcq.correctAnswer) {
      correctAnswers++;
    }
  });
  return correctAnswers;
};

// Get next topic from the list
export const getNextTopic = (allTopics, currentTopicIndex) => {
  if (currentTopicIndex === null || currentTopicIndex + 1 >= allTopics.length)
    return null;
  return allTopics[currentTopicIndex + 1];
};

// Get previous topic from the list
export const getPrevTopic = (allTopics, currentTopicIndex) => {
  if (currentTopicIndex === null || currentTopicIndex - 1 < 0) return null;
  return allTopics[currentTopicIndex - 1];
};


