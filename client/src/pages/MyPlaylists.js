import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Button,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Space,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const MyPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get("/api/playlists/my-playlists");
      setPlaylists(res.data);
    } catch (error) {
      message.error("Failed to fetch playlists");
    }
  };

  const handleCreatePlaylist = async (values) => {
    try {
      await axios.post("/api/playlists", values);
      message.success("Playlist created successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchPlaylists();
    } catch (error) {
      message.error("Failed to create playlist");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`/api/playlists/${playlistId}`);
      message.success("Playlist deleted successfully");
      fetchPlaylists();
    } catch (error) {
      message.error("Failed to delete playlist");
    }
  };

  const handleRemoveSong = async (playlistId, songId) => {
    try {
      await axios.delete(`/api/playlists/${playlistId}/songs/${songId}`);
      message.success("Song removed from playlist");
      fetchPlaylists();
    } catch (error) {
      message.error("Failed to remove song from playlist");
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Create New Playlist
        </Button>
      </div>

      {currentSong && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: 24,
            padding: "12px 24px",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            maxWidth: "800px",
            margin: "0 auto 24px auto",
          }}
        >
          <Space align="center" size="middle">
            <SoundOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
            <div>
              <Title level={5} style={{ color: "white", margin: 0 }}>
                {currentSong.title}
              </Title>
              <Text style={{ color: "#999", fontSize: "14px" }}>
                {currentSong.artist} - {currentSong.album || "Unknown"}
              </Text>
            </div>
          </Space>
          <audio
            src={`http://localhost:5000${currentSong.fileUrl}`}
            controls
            autoPlay={isPlaying}
            onEnded={() => setIsPlaying(false)}
            style={{
              width: "250px",
              height: "32px",
              borderRadius: "16px",
              backgroundColor: "#333",
            }}
          />
        </motion.div>
      )}

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={playlists}
        renderItem={(playlist) => (
          <List.Item>
            <Card
              title={playlist.name}
              extra={
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeletePlaylist(playlist._id)}
                />
              }
            >
              <p>{playlist.description}</p>
              <List
                dataSource={playlist.songs}
                renderItem={(song) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handlePlay(song)}
                      >
                        Play
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveSong(playlist._id, song._id)}
                      >
                        Remove
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={song.title}
                      description={`${song.artist} - ${song.album}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Create New Playlist"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreatePlaylist} layout="vertical">
          <Form.Item
            name="name"
            label="Playlist Name"
            rules={[{ required: true, message: "Please input playlist name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyPlaylists;
