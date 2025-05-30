import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Button,
  message,
  Modal,
  Select,
  Typography,
  Space,
} from "antd";
import {
  PlayCircleOutlined,
  PlusOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const { Option } = Select;
const { Title, Text } = Typography;

// Helper function to format duration in seconds to MM:SS format
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSongs();
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  const fetchSongs = async () => {
    try {
      const res = await axios.get("/api/songs");
      setSongs(res.data);
    } catch (error) {
      message.error("Failed to fetch songs");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get("/api/playlists/my-playlists");
      setPlaylists(res.data);
    } catch (error) {
      message.error("Failed to fetch playlists");
    }
  };

  const handlePlay = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleAddToPlaylist = (song) => {
    setSelectedSong(song);
    setIsModalVisible(true);
  };

  const handleAddToPlaylistConfirm = async () => {
    try {
      await axios.post(`/api/playlists/${selectedPlaylist}/songs`, {
        songId: selectedSong._id,
      });
      message.success("Song added to playlist");
      setIsModalVisible(false);
    } catch (error) {
      message.error("Failed to add song to playlist");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ padding: "24px" }}
    >
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
        grid={{ gutter: 24, column: 3 }}
        dataSource={songs}
        renderItem={(song) => (
          <List.Item>
            <motion.div variants={itemVariants}>
              <Card
                hoverable
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                bodyStyle={{ padding: "20px" }}
                actions={[
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlay(song)}
                    style={{
                      background:
                        "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                      border: "none",
                    }}
                  >
                    Play
                  </Button>,
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => handleAddToPlaylist(song)}
                    style={{
                      background:
                        "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Add to Playlist
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
                      {song.title}
                    </Title>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ marginTop: 12 }}
                    >
                      <Text strong>Artist:</Text>
                      <Text>{song.artist}</Text>
                      <Text strong>Album:</Text>
                      <Text>{song.album || "Unknown"}</Text>
                      {/* <Text strong>Duration:</Text>
                      {console.log(song)}
                      <Text>{formatDuration(song.duration)}</Text> */}
                    </Space>
                  }
                />
              </Card>
            </motion.div>
          </List.Item>
        )}
      />

      <Modal
        title="Add to Playlist"
        visible={isModalVisible}
        onOk={handleAddToPlaylistConfirm}
        onCancel={() => setIsModalVisible(false)}
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
            border: "none",
          },
        }}
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select a playlist"
          onChange={(value) => setSelectedPlaylist(value)}
        >
          {playlists.map((playlist) => (
            <Option key={playlist._id} value={playlist._id}>
              {playlist.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </motion.div>
  );
};

export default Home;
