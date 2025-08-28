import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Upload,
  Image,
  Switch,
  Card
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { fireStore, storage } from '../../config/firebase';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import JoditEditor from 'jodit-react';
import { debounce } from 'lodash';

const { Option } = Select;

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [notesFile, setNotesFile] = useState(null);
  const [notesUploading, setNotesUploading] = useState(false);
  const [isMCQ, setIsMCQ] = useState(false);
  const editor = useRef(null);

  const debouncedDescriptionChange = useRef(
    debounce((newContent) => {
      setDescription(newContent);
    }, 300)
  );

  useEffect(() => {
    fetchProducts();
    fetchClasses();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, 'classes'));
      const classList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    } catch (error) {
      message.error('Failed to fetch classes.');
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, 'categories'));
      const categoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, 'subcategories'));
      const subCategoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubCategories(subCategoryList);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(fireStore, 'topics'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      message.error('Failed to fetch products.');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const productToDelete = products.find((p) => p.id === id);

      // Delete featured image if exists
      if (productToDelete?.featuredImage) {
        try {
          const imgRef = ref(storage, productToDelete.featuredImage);
          await deleteObject(imgRef);
        } catch (err) {
          console.warn('No featured image or already deleted:', err.message);
        }
      }

      // Delete notes file if exists
      if (productToDelete?.notesFile) {
        try {
          const notesRef = ref(storage, productToDelete.notesFile);
          await deleteObject(notesRef);
        } catch (err) {
          console.warn('No notes file or already deleted:', err.message);
        }
      }

      // Delete Firestore document
      await deleteDoc(doc(fireStore, 'topics', id));

      setProducts((prev) => prev.filter((product) => product.id !== id));
      message.success('Product and associated files deleted successfully!');
    } catch (error) {
      message.error('Failed to delete product.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setDescription(record.description || '');
    setMcqs(record.mcqs || []);
    setIsMCQ(record.mcqs && record.mcqs.length > 0);
    setFeaturedImage(record.featuredImage || null);
    setNotesFile(record.notesFile || null);
    
    // Parse class string back to array if it's stored as comma-separated
    const classArray = record.class ? record.class.split(',').map(c => c.trim()) : [];
    
    form.setFieldsValue({
      topic: record.topic,
      class: classArray,
      category: record.category || '',
      subCategory: record.subCategory || '',
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    setDescription('');
    setMcqs([]);
    setIsMCQ(false);
    setFeaturedImage(null);
    setNotesFile(null);
    form.resetFields();
    setLoading(false);
  };

  const uploadFileToFirebase = async (file, path) => {
    try {
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const storageRef = ref(storage, `${path}/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("File upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const uploadFeaturedImage = async (file) => {
    setImageUploading(true);
    try {
      const downloadURL = await uploadFileToFirebase(file, "featured-images");
      setFeaturedImage(downloadURL);
      message.success('Featured image uploaded!');
      return downloadURL;
    } catch (error) {
      message.error('Featured image upload failed.');
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const uploadNotesFile = async (file) => {
    setNotesUploading(true);
    try {
      const downloadURL = await uploadFileToFirebase(file, "notes-files");
      setNotesFile(downloadURL);
      message.success('Notes file uploaded!');
      return downloadURL;
    } catch (error) {
      message.error('Notes file upload failed.');
      throw error;
    } finally {
      setNotesUploading(false);
    }
  };

  const handleImageUpload = async (options) => {
    const { file } = options;
    try {
      await uploadFeaturedImage(file);
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  const handleNotesUpload = async (options) => {
    const { file } = options;
    try {
      await uploadNotesFile(file);
    } catch (error) {
      console.error("Notes upload error:", error);
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedValues = {
        ...values,
        class: Array.isArray(values.class) ? values.class.join(", ") : values.class,
        description,
        mcqs: isMCQ ? mcqs : [],
        featuredImage,
        notesFile,
        timestamp: serverTimestamp(),
      };
      
      await updateDoc(doc(fireStore, 'topics', editingProduct.id), updatedValues);
      message.success('Product updated successfully!');
      handleModalClose();
      fetchProducts();
    } catch (error) {
      message.error('Failed to update product.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMCQChange = (index, key, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[index][key] = value;
    setMcqs(updatedMcqs);
  };

  const handleOptionChange = (mcqIndex, optionIndex, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[mcqIndex].options[optionIndex] = value;
    setMcqs(updatedMcqs);
  };

  const handleCorrectAnswerChange = (mcqIndex, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[mcqIndex].correctAnswer = value;
    setMcqs(updatedMcqs);
  };

  const handleAddMCQ = () => {
    setMcqs([
      ...mcqs,
      { question: "", options: ["", "", "", ""], correctAnswer: "", logic: "" },
    ]);
  };

  const handleRemoveMCQ = (index) => {
    if (mcqs.length > 1) {
      const updatedMcqs = [...mcqs];
      updatedMcqs.splice(index, 1);
      setMcqs(updatedMcqs);
    } else {
      message.warning("At least one MCQ is required");
    }
  };

  const renderMCQTemplate = () => {
    return mcqs.map((mcq, index) => (
      <Card
        key={index}
        style={{ marginBottom: 16, border: "1px solid #f0f0f0" }}
        size="small"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4>MCQ {index + 1}</h4>
          <Button
            type="link"
            danger
            icon={<MinusOutlined />}
            onClick={() => handleRemoveMCQ(index)}
            disabled={mcqs.length <= 1}
          >
            Remove
          </Button>
        </div>
        
        <Form.Item label="Question" required>
          <JoditEditor
            value={mcq.question}
            config={mcqJoditConfig}
            onChange={(newContent) => handleMCQChange(index, "question", newContent)}
          />
        </Form.Item>
        
        <Form.Item label="Options" required>
          {mcq.options.map((option, optionIndex) => (
            <div key={optionIndex} style={{ marginBottom: 8 }}>
              <Input
                addonBefore={
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={mcq.correctAnswer === option}
                    onChange={() => handleCorrectAnswerChange(index, option)}
                  />
                }
                value={option}
                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
              />
            </div>
          ))}
        </Form.Item>
        
        <Form.Item label="Logic for Correct Answer (Optional)">
          <JoditEditor
            value={mcq.logic}
            config={mcqJoditConfig}
            onChange={(newContent) => handleMCQChange(index, "logic", newContent)}
          />
        </Form.Item>
      </Card>
    ));
  };

  const joditConfig = {
    readonly: false,
    height: 300,
    buttons: [
      "source", "|", "bold", "italic", "underline", "strikethrough", "|",
      "ul", "ol", "|", "font", "fontsize", "brush", "paragraph", "|",
      "align", "outdent", "indent", "|", "cut", "copy", "paste", "copyformat", "|",
      "hr", "table", "link", "|", "undo", "redo", "|", "preview", "print",
      "find", "fullsize", "image", "video", "file"
    ],
    uploader: {
      insertImageAsBase64URI: false,
      url: false,
      imagesExtensions: ["jpg", "png", "jpeg", "gif"],
      withCredentials: false,
    },
    imageDefaultWidth: 300,
    spellcheck: true,
    toolbarAdaptive: false,
    placeholder: "Type your content here...",
  };

  const mcqJoditConfig = {
    ...joditConfig,
    height: 150,
    buttons: "bold,italic,underline,strikethrough,ul,ol,font,fontsize,brush,paragraph,align,link,image",
  };

  const columns = [
    { 
      title: 'Topic', 
      dataIndex: 'topic', 
      key: 'topic',
      render: (text) => text || 'No Topic'
    },
    { 
      title: 'Class', 
      dataIndex: 'class', 
      key: 'class',
      render: (text) => text || 'No Class'
    },
    {
      title: 'Notes File',
      key: 'notesFile',
      render: (_, record) =>
        record.notesFile ? (
          <a href={record.notesFile} target="_blank" rel="noopener noreferrer">
            View Notes
          </a>
        ) : (
          <span>No File</span>
        ),
    },
    { 
      title: 'SubCategory', 
      dataIndex: 'subCategory', 
      key: 'subCategory',
      render: (text) => text || 'No Subcategory'
    },
    {
      title: 'Featured Image',
      key: 'featuredImage',
      render: (_, record) =>
        record.featuredImage ? (
          <Image src={record.featuredImage} width={50} height={50} style={{ objectFit: 'cover' }} />
        ) : (
          <span>No Image</span>
        ),
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (text) => text || 'published'
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            loading={loading}
          />
          <Popconfirm
            title="Are you sure you want to delete this topic?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} loading={deleting} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        bordered
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title="Edit Topic"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item label="Featured Image (Optional)">
            <Upload
              customRequest={handleImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={imageUploading}>
                {imageUploading ? "Uploading..." : "Change Featured Image"}
              </Button>
            </Upload>
            {featuredImage && (
              <div style={{ marginTop: 16 }}>
                <Image src={featuredImage} width={200} />
                <Button 
                  type="link" 
                  danger 
                  onClick={() => setFeaturedImage(null)}
                  style={{ marginTop: 8 }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item label="Notes File">
            <Upload 
              customRequest={handleNotesUpload} 
              showUploadList={false}
              accept=".pdf"
            >
              <Button icon={<UploadOutlined />} loading={notesUploading}>
                {notesUploading ? "Uploading..." : "Change Notes File"}
              </Button>
            </Upload>
            {notesFile && (
              <div style={{ marginTop: 8 }}>
                <a href={notesFile} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}>
                  View Notes File
                </a>
                <Button type="link" danger onClick={() => setNotesFile(null)}>
                  Remove File
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="topic"
            label="Topic Name"
            rules={[{ required: true, message: "Please enter topic name!" }]}
          >
            <Input placeholder="Enter topic name" />
          </Form.Item>

          <Form.Item
            name="class"
            label="Class"
            rules={[{ required: true, message: "Please select a class!" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select class(es)"
            >
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.name}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
          >
            <Select placeholder="Select category">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.name}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subCategory"
            label="SubCategory"
          >
            <Select placeholder="Select subcategory">
              {subCategories.map((sub) => (
                <Option key={sub.id} value={sub.name}>
                  {sub.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="MCQ Test">
            <Switch checked={isMCQ} onChange={(checked) => setIsMCQ(checked)} />
          </Form.Item>

          <Form.Item label="Description">
            <JoditEditor
              ref={editor}
              value={description}
              config={joditConfig}
              onBlur={(newContent) => setDescription(newContent)}
            />
          </Form.Item>

          {isMCQ && (
            <>
              {renderMCQTemplate()}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={handleAddMCQ}
                  block
                  icon={<PlusOutlined />}
                >
                  Add More MCQs
                </Button>
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ marginRight: 8 }}
            >
              Update Topic
            </Button>
            <Button onClick={handleModalClose}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProducts;