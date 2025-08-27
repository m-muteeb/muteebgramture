// src/components/PdfViewer.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Card, Spin } from "antd";
import * as pdfjs from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.entry";

// ✅ Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const PdfViewer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fileUrl = queryParams.get("url");
  const fileTitle = queryParams.get("title") || "File Preview";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  const pdfPlugin = defaultLayoutPlugin();

  useEffect(() => {
    if (!fileUrl) return;

    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();
        setPdfBlob(blob);
        setLoading(false);
      } catch (err) {
        console.error("PDF fetch error:", err);
        setError("Failed to load PDF. Make sure the file exists.");
        setLoading(false);
      }
    };

    fetchPdf();
  }, [fileUrl]);

  if (!fileUrl) return <h3 className="text-center text-danger">Invalid File URL</h3>;
  if (error) return <h3 className="text-center text-danger">{error}</h3>;

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <Card title={fileTitle} bordered>
        <p>
          This is a preview of <strong>{fileTitle}</strong>.
        </p>

        {loading && (
          <div className="text-center" style={{ margin: "20px 0" }}>
            <Spin size="large" tip="Loading PDF..." />
          </div>
        )}

        {pdfBlob && (
          <Worker workerUrl={workerSrc}>
            <Viewer fileUrl={pdfBlob} plugins={[pdfPlugin]} />
          </Worker>
        )}
      </Card>
    </div>
  );
};

export default PdfViewer;
