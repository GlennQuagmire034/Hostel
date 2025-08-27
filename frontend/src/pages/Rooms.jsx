"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useData } from "../context/DataContext"
import {
  Layout,
  Menu,
  Table,
  Input,
  Button,
  Modal,
  Form,
  Select,
  Typography,
  ConfigProvider,
  Space,
  Dropdown,
  message,
  InputNumber,
  Card,
  Row,
  Col,
} from "antd"
import {
  DashboardOutlined,
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import ThemeToggle from "../components/ThemeToggle"

const { Header, Sider, Content } = Layout
const { Title } = Typography
const { Option } = Select

const Rooms = () => {
  const { logout, user } = useContext(AuthContext)
  const { isDarkMode, themeConfig } = useTheme()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [selectedBlock, setSelectedBlock] = useState("A")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form] = Form.useForm()
  const { rooms, addRoom, updateRoom, deleteRoom, getAllTrainees } = useData()

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleBlockChange = (block) => {
    setSelectedBlock(block)
  }

  const handleAddRoom = () => {
    setIsModalVisible(true)
    setIsEditMode(false)
    setEditingRoom(null)
    form.resetFields()
    form.setFieldsValue({ block: selectedBlock })
  }

  const handleEditRoom = (record) => {
    setIsModalVisible(true)
    setIsEditMode(true)
    setEditingRoom(record)
    form.setFieldsValue({
      number: record.number,
      block: record.block,
      type: record.type,
      status: record.status,
      beds: record.beds,
    })
  }

  const handleDeleteRoom = (record) => {
    // Check if room is occupied
    const trainees = getAllTrainees()
    const occupiedTrainees = trainees.filter(
      t => t.roomNumber === record.number && 
           t.block === record.block && 
           t.status === 'staying'
    )

    if (occupiedTrainees.length > 0) {
      message.error("Cannot delete occupied room. Please checkout all trainees first.")
      return
    }

    Modal.confirm({
      title: "Delete Room",
      content: `Are you sure you want to delete Room ${record.number} in Block ${record.block}?`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk() {
        deleteRoom(record.number, record.block)
      },
    })
  }

  const handleViewRoom = (record) => {
    const trainees = getAllTrainees()
    const roomOccupants = trainees.filter(
      t => t.roomNumber === record.number && 
           t.block === record.block && 
           t.status === 'staying'
    )

    Modal.info({
      title: `Room Details - ${record.number} (Block ${record.block})`,
      content: (
        <div style={{ padding: "16px 0" }}>
          <p style={{ marginBottom: "8px" }}>
            <strong>Room Number:</strong> {record.number}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Block:</strong> {record.block}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Type:</strong> {record.type}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Status:</strong> {record.status}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Total Beds:</strong> {record.beds}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Floor:</strong> {record.floor || 'N/A'}
          </p>
          {roomOccupants.length > 0 && (
            <div>
              <p style={{ marginBottom: "8px", marginTop: "16px" }}>
                <strong>Current Occupants:</strong>
              </p>
              {roomOccupants.map((occupant, index) => (
                <div key={index} style={{ marginLeft: "16px", marginBottom: "4px" }}>
                  <p style={{ marginBottom: "2px" }}>
                    <strong>Bed {occupant.bedNumber || (index + 1)}:</strong> {occupant.name}
                  </p>
                  <p style={{ marginBottom: "2px", fontSize: "12px", color: "#666" }}>
                    {occupant.designation} - {occupant.division}
                  </p>
                </div>
              ))}
            </div>
          )}
          {record.amenities && (
            <div>
              <p style={{ marginBottom: "8px", marginTop: "16px" }}>
                <strong>Room Amenities:</strong>
              </p>
              <div style={{ marginLeft: "16px" }}>
                <p style={{ marginBottom: "4px" }}>
                  <strong>Furniture:</strong> {record.amenities.furniture?.beds || 0} beds, {record.amenities.furniture?.tables || 0} tables, {record.amenities.furniture?.chairs || 0} chairs
                </p>
                <p style={{ marginBottom: "4px" }}>
                  <strong>Electrical:</strong> {record.amenities.electrical?.lights || 0} lights, {record.amenities.electrical?.fans || 0} fans
                </p>
              </div>
            </div>
          )}
        </div>
      ),
      width: 500,
      okText: "Close",
      centered: true,
    })
  }

  const handleModalOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (isEditMode && editingRoom) {
          const success = await updateRoom(editingRoom.number, editingRoom.block, values)
          if (success) {
            message.success("Room updated successfully")
          }
        } else {
          const success = await addRoom(values, values.block)
          if (success) {
            message.success("Room added successfully")
          }
        }
        setIsModalVisible(false)
        form.resetFields()
        setEditingRoom(null)
      })
      .catch((info) => {
        console.log("Validate Failed:", info)
      })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingRoom(null)
    form.resetFields()
  }

  // Filter rooms based on search and block
  const filteredRooms = (rooms[selectedBlock] || []).filter((room) => {
    const matchesSearch =
      !searchText ||
      room.number.toString().includes(searchText) ||
      room.type.toLowerCase().includes(searchText.toLowerCase()) ||
      room.status.toLowerCase().includes(searchText.toLowerCase())

    return matchesSearch
  })

  const columns = [
    {
      title: "ROOM NUMBER",
      dataIndex: "number",
      key: "number",
      sorter: (a, b) => a.number - b.number,
      width: 120,
    },
    {
      title: "BLOCK",
      dataIndex: "block",
      key: "block",
      width: 80,
    },
    {
      title: "TYPE",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Single", value: "Single" },
        { text: "Double", value: "Double" },
        { text: "Triple", value: "Triple" },
        { text: "Quad", value: "Quad" },
        { text: "Store", value: "Store" },
        { text: "Office", value: "Office" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "#52c41a" // green for vacant
        if (status === "occupied") color = "#ff4d4f" // red
        else if (status === "blocked" || status === "store" || status === "maintenance") color = "#faad14" // orange

        return (
          <span
            style={{
              color,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {status}
          </span>
        )
      },
      filters: [
        { text: "Vacant", value: "vacant" },
        { text: "Occupied", value: "occupied" },
        { text: "Blocked", value: "blocked" },
        { text: "Store", value: "store" },
        { text: "Maintenance", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "BEDS",
      dataIndex: "beds",
      key: "beds",
      sorter: (a, b) => a.beds - b.beds,
      width: 80,
    },
    {
      title: "FLOOR",
      dataIndex: "floor",
      key: "floor",
      filters: [
        { text: "Ground", value: "Ground" },
        { text: "First", value: "First" },
      ],
      onFilter: (value, record) => record.floor === value,
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleViewRoom(record)
            }}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleEditRoom(record)
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteRoom(record)
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  const userMenu = (
    <Menu theme={isDarkMode ? "dark" : "light"} style={{ background: isDarkMode ? "#1f1f1f" : "#ffffff" }}>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={logout}
        style={{ color: isDarkMode ? "#fff" : "#000" }}
      >
        Logout
      </Menu.Item>
    </Menu>
  )

  // Get block statistics
  const getBlockStats = () => {
    const blockRooms = rooms[selectedBlock] || []
    const totalRooms = blockRooms.length
    const occupiedRooms = blockRooms.filter(room => room.status === "occupied").length
    const vacantRooms = blockRooms.filter(room => room.status === "vacant").length
    const blockedRooms = blockRooms.filter(room => 
      ["blocked", "store", "maintenance"].includes(room.status)
    ).length

    return { totalRooms, occupiedRooms, vacantRooms, blockedRooms }
  }

  const blockStats = getBlockStats()

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider
          width={250}
          style={{
            background: isDarkMode ? "#1f1f1f" : "#ffffff",
            boxShadow: "2px 0 8px 0 rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              borderBottom: `1px solid ${isDarkMode ? "#434343" : "#d9d9d9"}`,
            }}
          >
            <Title
              level={3}
              style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}
            >
              HOSTEL
            </Title>
            <Title
              level={3}
              style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}
            >
              MANAGEMENT
            </Title>
          </div>

          <Menu
            theme={isDarkMode ? "dark" : "light"}
            mode="inline"
            selectedKeys={["2"]}
            style={{
              borderRight: 0,
              padding: "16px 0",
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
            }}
          >
            <Menu.Item key="1" icon={<DashboardOutlined />} onClick={() => navigate("/")}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<HomeOutlined />} onClick={() => navigate("/rooms")}>
              Rooms
            </Menu.Item>
            <Menu.Item key="3" icon={<UserOutlined />} onClick={() => navigate("/trainees")}>
              Trainees
            </Menu.Item>
            <Menu.Item key="4" icon={<TeamOutlined />} onClick={() => navigate("/allotments")}>
              Allotments
            </Menu.Item>
            <Menu.Item key="5" icon={<ToolOutlined />} onClick={() => navigate("/amenities")}>
              Amenities
            </Menu.Item>
            <Menu.Item key="6" icon={<FileTextOutlined />} onClick={() => navigate("/reports")}>
              Reports
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          {/* Header */}
          <Header
            style={{
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
              padding: "0 24px",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${isDarkMode ? "#434343" : "#d9d9d9"}`,
            }}
          >
            <Title
              level={4}
              style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}
            >
              Rooms Management
            </Title>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ThemeToggle />
              <Dropdown overlay={userMenu} placement="bottomRight">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <UserSwitchOutlined
                    style={{
                      marginRight: 8,
                      color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
                    }}
                  />
                  <span style={{ color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}>
                    {user?.username || "Admin"}
                  </span>
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* Main Content */}
          <Content
            style={{
              margin: "24px",
              padding: 24,
              background: isDarkMode ? "#1f1f1f" : "#ffffff",
              minHeight: 280,
              color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
            }}
          >
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    textAlign: "center",
                    background: isDarkMode ? "#0f1419" : "#e6f7ff",
                    borderColor: "#1890ff",
                    borderWidth: "2px",
                  }}
                >
                  <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                    {blockStats.totalRooms}
                  </Title>
                  <p style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}>
                    Total Rooms
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    textAlign: "center",
                    background: isDarkMode ? "#0f1a0f" : "#f6ffed",
                    borderColor: "#52c41a",
                    borderWidth: "2px",
                  }}
                >
                  <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
                    {blockStats.vacantRooms}
                  </Title>
                  <p style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}>
                    Vacant Rooms
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    textAlign: "center",
                    background: isDarkMode ? "#1a0f0f" : "#fff2f0",
                    borderColor: "#f5222d",
                    borderWidth: "2px",
                  }}
                >
                  <Title level={3} style={{ color: "#f5222d", margin: 0 }}>
                    {blockStats.occupiedRooms}
                  </Title>
                  <p style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}>
                    Occupied Rooms
                  </p>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card
                  style={{
                    textAlign: "center",
                    background: isDarkMode ? "#1a1a0f" : "#fffbe6",
                    borderColor: "#faad14",
                    borderWidth: "2px",
                  }}
                >
                  <Title level={3} style={{ color: "#faad14", margin: 0 }}>
                    {blockStats.blockedRooms}
                  </Title>
                  <p style={{ margin: 0, color: isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)" }}>
                    Blocked/Store
                  </p>
                </Card>
              </Col>
            </Row>

            {/* Search and Add Section */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <Select value={selectedBlock} onChange={handleBlockChange} style={{ width: 120 }}>
                  <Option value="A">Block A</Option>
                  <Option value="B">Block B</Option>
                  <Option value="C">Block C</Option>
                </Select>
                <Input
                  placeholder="SEARCH ROOMS"
                  prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddRoom}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                ADD ROOM
              </Button>
            </div>

            {/* Rooms Table */}
            <Table
              columns={columns}
              dataSource={filteredRooms}
              rowKey={(record) => `${record.block}-${record.number}`}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} rooms`,
              }}
              style={{
                background: isDarkMode ? "#1f1f1f" : "#ffffff",
              }}
            />

            {/* Add/Edit Room Modal */}
            <Modal
              title={isEditMode ? "Edit Room" : "Add New Room"}
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              width={600}
            >
              <Form form={form} layout="vertical" name="room_form">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="number"
                      label="Room Number"
                      rules={[
                        { required: true, message: "Please input room number!" },
                        { type: "number", min: 1, max: 200, message: "Room number must be between 1-200!" },
                      ]}
                    >
                      <InputNumber style={{ width: "100%" }} disabled={isEditMode} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="block"
                      label="Block"
                      rules={[{ required: true, message: "Please select block!" }]}
                    >
                      <Select disabled={isEditMode}>
                        <Option value="A">Block A</Option>
                        <Option value="B">Block B</Option>
                        <Option value="C">Block C</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="Room Type"
                      rules={[{ required: true, message: "Please select room type!" }]}
                    >
                      <Select>
                        <Option value="Single">Single</Option>
                        <Option value="Double">Double</Option>
                        <Option value="Triple">Triple</Option>
                        <Option value="Quad">Quad</Option>
                        <Option value="Store">Store</Option>
                        <Option value="Office">Office</Option>
                        <Option value="Caretaker Room">Caretaker Room</Option>
                        <Option value="Contractor Room">Contractor Room</Option>
                        <Option value="Damage">Damage</Option>
                        <Option value="Condemn">Condemn</Option>
                        <Option value="GYM ROOM">GYM ROOM</Option>
                        <Option value="Emergency">Emergency</Option>
                        <Option value="NO FURNITURE">NO FURNITURE</Option>
                        <Option value="Prohibited">Prohibited</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[{ required: true, message: "Please select status!" }]}
                    >
                      <Select>
                        <Option value="vacant">Vacant</Option>
                        <Option value="occupied">Occupied</Option>
                        <Option value="blocked">Blocked</Option>
                        <Option value="store">Store</Option>
                        <Option value="maintenance">Maintenance</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="beds"
                  label="Number of Beds"
                  rules={[
                    { required: true, message: "Please input number of beds!" },
                    { type: "number", min: 0, max: 4, message: "Beds must be between 0-4!" },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default Rooms