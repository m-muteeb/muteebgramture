// src/components/PdfViewer.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Card, Spin } from "antd";

const PdfViewer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fileUrl = queryParams.get("url");
  const fileTitle = queryParams.get("title") || "File Preview";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pdfPlugin = defaultLayoutPlugin();

  useEffect(() => {
    if (!fileUrl) return;
    setLoading(false); // No need to fetch manually, Viewer handles URL directly
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

        {!loading && (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer fileUrl={fileUrl} plugins={[pdfPlugin]} />
          </Worker>
        )}
      </Card>
    </div>
  );
};

export default PdfViewer;
