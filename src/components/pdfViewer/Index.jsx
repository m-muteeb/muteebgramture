// src/components/PdfViewer.js
import React from "react";
import { useLocation } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Card } from "antd";
import * as pdfjs from "pdfjs-dist/build/pdf"; // ✅ Correct Import

// ✅ Set the correct worker version dynamically
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Preview = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fileUrl = queryParams.get("url");
  const fileTitle = queryParams.get("title") || "File Preview";
  console.log("fileUrl value:", fileUrl);
console.log("fileUrl typeof:", typeof fileUrl);


  if (!fileUrl) {
    return <h3 className="text-center text-danger">Invalid File URL</h3>;
  }

  let fileType = "";

  if (typeof fileUrl === "string") {
    fileType = fileUrl.split("?")[0].split(".").pop().toLowerCase();
    console.log("File Type:", fileType);
  } else {
    console.error("fileUrl is not a string:", fileUrl);
  }

  const pdfPlugin = defaultLayoutPlugin();

  return (
    <div className="preview-container">
      <Card title={fileTitle} bordered={true} className="preview-card">
        <p className="file-description">
          This is a preview of <strong>{fileTitle}</strong>. You can view the document below.
        </p>

        {fileType === "pdf" ? (
          <Worker workerUrl={pdfjs.GlobalWorkerOptions.workerSrc}>
            <Viewer fileUrl={fileUrl} plugins={[pdfPlugin]} />
          </Worker>
        ) : (
          <h3 className="text-center text-warning">File format not supported.</h3>
        )}
      </Card>
    </div>
  );
};


export default Preview;
