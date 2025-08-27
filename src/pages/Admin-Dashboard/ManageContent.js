import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, Select, Row, Col, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { fireStore, storage } from '../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import JoditEditor from 'jodit-react';
import { debounce } from 'lodash';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [notesFile, setNotesFile] = useState(null);
  const [notesUploading, setNotesUploading] = useState(false);
  const editor = useRef(null);

  const debouncedDescriptionChange = useRef(
    debounce((newContent) => {
      setDescription(newContent);
    }, 300)
  );

  useEffect(() => {
    fetchProducts();
    fetchClasses();
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
      await deleteDoc(doc(fireStore, 'topics', id));
      message.success('Product deleted successfully!');
      setProducts((prev) => prev.filter((product) => product.id !== id));
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
    setFeaturedImage(record.featuredImage || null);
    setNotesFile(record.notesFile || null);
    form.setFieldsValue({
      topic: record.topic,
      class: record.class,
      subCategory: record.subCategory,
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription('');
    setMcqs([]);
    setFeaturedImage(null);
    setNotesFile(null);
    form.resetFields();
    setLoading(false);
  };

  const uploadFeaturedImage = async (file) => {
    setImageUploading(true);
    try {
      if (featuredImage) {
        try {
          const oldImageRef = ref(storage, featuredImage);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `featured-images/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Image upload failed:', error);
            message.error('Featured image upload failed.', 3);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFeaturedImage(downloadURL);
            message.success('Featured image uploaded successfully!', 3);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading featured image:', error);
      message.error('Error uploading featured image', 3);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const uploadNotesFile = async (file) => {
    setNotesUploading(true);
    try {
      if (notesFile) {
        try {
          const oldNotesRef = ref(storage, notesFile);
          await deleteObject(oldNotesRef);
        } catch (error) {
          console.error('Error deleting old notes file:', error);
        }
      }

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `notes-files/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Notes file upload failed:', error);
            message.error('Notes file upload failed.', 3);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setNotesFile(downloadURL);
            message.success('Notes file uploaded successfully!', 3);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading notes file:', error);
      message.error('Error uploading notes file', 3);
      return null;
    } finally {
      setNotesUploading(false);
    }
  };

  const handleImageUpload = async (options) => {
    const { file } = options;
    try {
      const url = await uploadFeaturedImage(file);
      return url;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleNotesUpload = async (options) => {
    const { file } = options;
    try {
      const url = await uploadNotesFile(file);
      return url;
    } catch (error) {
      console.error('Notes upload error:', error);
      return null;
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
  };

  const handleRemoveNotes = () => {
    setNotesFile(null);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedValues = {
        ...values,
        description,
        mcqs,
        featuredImage,
        notesFile,
        status: 'published',
        timestamp: serverTimestamp(),
      };

      await updateDoc(doc(fireStore, 'topics', editingProduct.id), updatedValues);
      message.success('Product updated successfully!');
      handleModalClose();
      fetchProducts();
    } catch (error) {
      message.error('Failed to update product.');
      console.error(error);
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const updatedValues = {
        ...values,
        description,
        mcqs,
        featuredImage,
        notesFile,
        status: 'draft',
        timestamp: serverTimestamp(),
      };

      await updateDoc(doc(fireStore, 'topics', editingProduct.id), updatedValues);
      message.success('Product saved as draft successfully!');
      handleModalClose();
      fetchProducts();
    } catch (error) {
      message.error('Failed to save as draft.');
      console.error(error);
      setLoading(false);
    }
  };

  const handleMCQChange = (index, field, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[index][field] = value;
    setMcqs(updatedMcqs);
  };

  const handleAddMCQ = () => {
    setMcqs([
      ...mcqs,
      { question: '', options: ['', '', '', ''], correctAnswer: '', logic: '' },
    ]);
  };

  const handleDeleteMCQ = (index) => {
    const updatedMcqs = mcqs.filter((_, idx) => idx !== index);
    setMcqs(updatedMcqs);
  };

  const columns = [
    { title: 'Topic', dataIndex: 'topic', key: 'topic' },
    { title: 'Class', dataIndex: 'class', key: 'class' },
    {
      title: 'Notes File',
      key: 'notesFile',
      render: (_, record) => (
        record.notesFile ? (
          <a
            href={record.notesFile}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View
          </a>
        ) : (
          <span className="text-gray-500">No File</span>
        )
      ),
    },
    { title: 'SubCategory', dataIndex: 'subCategory', key: 'subCategory' },
    {
      title: 'Featured Image',
      key: 'featuredImage',
      render: (_, record) => (
        record.featuredImage ? (
          <Image
            src={record.featuredImage}
            width={50}
            height={50}
            className="rounded-md object-cover"
            preview={{
              src: record.featuredImage,
            }}
          />
        ) : (
          <span className="text-gray-500">No Image</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Unknown',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            className="text-green-600 hover:bg-green-50"
            onClick={() => handleEdit(record)}
            loading={loading}
          />
          <Popconfirm
            title="Are you sure to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              loading={deleting}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const joditConfig = {
    readonly: false,
    height: 400,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'align', 'outdent', 'indent', '|',
      'cut', 'copy', 'paste', 'copyformat', '|',
      'hr', 'table', 'link', '|',
      'undo', 'redo', '|',
      'preview', 'print', 'find', 'fullsize',
      'image', 'video', 'file'
    ],
    uploader: {
      insertImageAsBase64URI: true,
      url: '/api/upload',
      format: 'json',
      imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
      filesVariableName: 'files',
      withCredentials: false,
      prepareData: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        return formData;
      },
      isSuccess: (resp) => resp.success,
      getMessage: (resp) => resp.message,
      process: (resp) => ({
        files: resp.files || [],
        path: resp.path || '',
        baseurl: resp.baseurl || '',
        error: resp.error || 0,
        message: resp.message || ''
      }),
      error: (e) => {
        console.error('Upload error:', e);
        message.error('Image upload failed');
      },
      defaultHandlerSuccess: (data) => {
        const { files } = data;
        if (files && files.length) {
          return files[0];
        }
        return '';
      }
    },
    imageDefaultWidth: 300,
    imagePosition: 'center',
    spellcheck: true,
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: true,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    allowTabNavigtion: false,
    placeholder: 'Type your content here...'
  };

  const handleDescriptionChange = (newContent) => {
    debouncedDescriptionChange.current(newContent);
  };

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
    }
    return isImage && isLt5M;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 mt-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Manage Products
          </h2>
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            bordered
            scroll={{ x: true }}
            className="rounded-lg overflow-hidden"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        </div>

        <Modal
          title={
            <div className="text-xl font-semibold text-gray-800">
              Edit Product
            </div>
          }
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={1000}
          className="top-20"
        >
          <div className="bg-white p-6 rounded-lg">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              className="space-y-4"
            >
              <Form.Item label={<span className="font-medium">Featured Image</span>}>
                <Upload
                  name="featuredImage"
                  customRequest={handleImageUpload}
                  beforeUpload={beforeImageUpload}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={imageUploading}
                    className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Change Featured Image
                  </Button>
                </Upload>
                {featuredImage && (
                  <div className="mt-4 flex items-center space-x-4">
                    <Image
                      src={featuredImage}
                      width={200}
                      className="rounded-md object-contain"
                      alt="Featured Preview"
                    />
                    <Button
                      type="link"
                      danger
                      onClick={handleRemoveImage}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </Form.Item>

              <Form.Item label={<span className="font-medium">Notes File</span>}>
                <Upload
                  name="notesFile"
                  customRequest={handleNotesUpload}
                  showUploadList={false}
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={notesUploading}
                    className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Change Notes File
                  </Button>
                </Upload>
                {notesFile && (
                  <div className="mt-4 flex items-center space-x-4">
                    <a
                      href={notesFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Notes File
                    </a>
                    <Button
                      type="link"
                      danger
                      onClick={handleRemoveNotes}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove File
                    </Button>
                  </div>
                )}
              </Form.Item>

              <Form.Item
                label={<span className="font-medium">Topic</span>}
                name="topic"
                rules={[{ required: true, message: 'Please enter topic name!' }]}
              >
                <Input
                  placeholder="Enter topic"
                  className="rounded-md border-gray-300"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-medium">Class</span>}
                name="class"
                rules={[{ required: true, message: 'Please select a class!' }]}
              >
                <Select
                  placeholder="Select class"
                  className="rounded-md"
                >
                  {classes.map((cls) => (
                    <Select.Option key={cls.id} value={cls.name}>
                      {cls.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={<span className="font-medium">SubCategory</span>}
                name="subCategory"
              >
                <Input
                  placeholder="Enter subcategory"
                  className="rounded-md border-gray-300"
                />
              </Form.Item>

              <Form.Item label={<span className="font-medium">Description</span>}>
                <JoditEditor
                  ref={editor}
                  value={description}
                  config={joditConfig}
                  onBlur={(newContent) => setDescription(newContent)}
                  onChange={handleDescriptionChange}
                />
              </Form.Item>

              <Form.Item label={<span className="font-medium">MCQs</span>}>
                {mcqs.map((mcq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">
                            Question {index + 1}
                          </span>
                          <Button
                            danger
                            onClick={() => handleDeleteMCQ(index)}
                            size="small"
                            className="text-red-500 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                        <JoditEditor
                          value={mcq.question}
                          config={{
                            ...joditConfig,
                            height: 150,
                            buttons: 'bold,italic,underline,strikethrough,ul,ol,font,fontsize,brush,paragraph,align,link,image'
                          }}
                          onBlur={(newContent) =>
                            handleMCQChange(index, 'question', newContent)
                          }
                        />
                      </Col>

                      {mcq.options.map((option, optIndex) => (
                        <Col span={12} key={optIndex}>
                          <Input
                            addonBefore={
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={mcq.correctAnswer === option}
                                onChange={() =>
                                  handleMCQChange(index, 'correctAnswer', option)
                                }
                              />
                            }
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...mcq.options];
                              const oldOption = updatedOptions[optIndex];
                              updatedOptions[optIndex] = e.target.value;
                              handleMCQChange(index, 'options', updatedOptions);

                              if (mcq.correctAnswer === oldOption) {
                                handleMCQChange(index, 'correctAnswer', e.target.value);
                              }
                            }}
                            className="rounded-md border-gray-300"
                          />
                        </Col>
                      ))}

                      {mcq.correctAnswer && (
                        <Col span={24}>
                          <JoditEditor
                            value={mcq.logic}
                            config={{
                              ...joditConfig,
                              height: 100,
                              buttons: 'bold,italic,underline,strikethrough,ul,ol,font,fontsize,brush,paragraph,align,link'
                            }}
                            onBlur={(newContent) =>
                              handleMCQChange(index, 'logic', newContent)
                            }
                          />
                        </Col>
                      )}
                    </Row>
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={handleAddMCQ}
                  className="w-full flex items-center justify-center text-blue-500 hover:bg-blue-50"
                >
                  <PlusOutlined /> Add MCQ
                </Button>
              </Form.Item>

              <Form.Item className="flex justify-end space-x-4">
                <Button
                  type="primary"
                  onClick={handleSaveDraft}
                  loading={loading}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                >
                  Save as Draft
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Update
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageProducts;