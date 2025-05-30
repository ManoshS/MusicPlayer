import React, { useState, useEffect } from "react";
import { Table, Button, Upload, Form, Input, Modal, message } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "../utils/axios";

const AdminDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await axios.get("/api/songs");
      setSongs(res.data);
    } catch (error) {
      message.error("Failed to fetch songs");
    }
  };

  const handleUpload = async (values) => {
    try {
      if (fileList.length === 0) {
        message.error("Please select a song file");
        return;
      }

      const file = fileList[0];
      if (!file.originFileObj) {
        message.error("Please select a valid file");
        return;
      }

      // Check file type
      const fileType = file.originFileObj.type;
      if (!fileType.startsWith("audio/")) {
        message.error("Only audio files (MP3, WAV) are allowed!");
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("artist", values.artist);
      formData.append("album", values.album || "");
      formData.append("song", file.originFileObj);

      await axios.post("/api/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Song uploaded successfully");
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchSongs();
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload song";
      message.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (songId) => {
    try {
      await axios.delete(`/api/songs/${songId}`);
      message.success("Song deleted successfully");
      fetchSongs();
    } catch (error) {
      message.error("Failed to delete song");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Artist",
      dataIndex: "artist",
      key: "artist",
    },
    {
      title: "Album",
      dataIndex: "album",
      key: "album",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const beforeUpload = (file) => {
    const isAudio = file.type.startsWith("audio/");
    if (!isAudio) {
      message.error("Only audio files (MP3, WAV) are allowed!");
    }
    return false; // Prevent auto upload
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Upload New Song
        </Button>
      </div>

      <Table columns={columns} dataSource={songs} rowKey="_id" />

      <Modal
        title="Upload New Song"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleUpload}
          layout="vertical"
          initialValues={{ song: [] }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please input song title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="artist"
            label="Artist"
            rules={[{ required: true, message: "Please input artist name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="album" label="Album">
            <Input />
          </Form.Item>
          <Form.Item
            name="song"
            label="Song File"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Please upload a song file!" }]}
          >
            <Upload
              beforeUpload={beforeUpload}
              maxCount={1}
              accept=".mp3,.wav"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>Select Song</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading} block>
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
