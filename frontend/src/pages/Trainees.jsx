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
  DatePicker,
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
  EyeOutlined,
} from "@ant-design/icons"
import ThemeToggle from "../components/ThemeToggle"

const { RangePicker } = DatePicker
const { Header, Sider, Content } = Layout
const { Title } = Typography
const { Option } = Select

const Trainees = () => {
  const { logout, user } = useContext(AuthContext)
  const { isDarkMode, themeConfig } = useTheme()
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [editingTrainee, setEditingTrainee] = useState(null)
  const { allocateRoom, checkoutTrainee, updateTrainee, getAllTrainees } = useData()
  const [trainees, setTrainees] = useState([])
  const [selectedStatus, setSelectedStatus] = useState("staying")
  const [dateRange, setDateRange] = useState(null)

  // Update trainees when context changes or filter changes
  useEffect(() => {
    let allTrainees = getAllTrainees()

    // Filter by status
    if (selectedStatus !== "all") {
      allTrainees = allTrainees.filter((trainee) => trainee.status === selectedStatus)
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0]
      const endDate = dateRange[1]

      allTrainees = allTrainees.filter((trainee) => {
        const traineeStart = new Date(trainee.from.split(".").reverse().join("-"))
        const traineeEnd = new Date(trainee.to.split(".").reverse().join("-"))

        // Check if trainee's stay period overlaps with selected date range
        return traineeStart <= endDate && traineeEnd >= startDate
      })
    }

    // Apply search filter
    if (searchText) {
      allTrainees = allTrainees.filter(
        (trainee) =>
          trainee.name.toLowerCase().includes(searchText.toLowerCase()) ||
          trainee.designation.toLowerCase().includes(searchText.toLowerCase()) ||
          trainee.division.toLowerCase().includes(searchText.toLowerCase()) ||
          trainee.mobile.includes(searchText),
      )
    }

    setTrainees(allTrainees)
  }, [getAllTrainees, selectedStatus, searchText, dateRange])

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
  }

  const handleAddTrainee = () => {
    setIsModalVisible(true)
    setEditingTrainee(null)
    form.resetFields()
  }

  // Validation rules
  const nameValidation = [
    { required: true, message: "This field is required!" },
    { 
      pattern: /^[a-zA-Z\s.]+$/, 
      message: "Only letters, spaces, and dots are allowed!" 
    },
    { 
      min: 2, 
      message: "Name must be at least 2 characters long!" 
    }
  ]

  const phoneValidation = [
    { required: true, message: "Phone number is required!" },
    { 
      pattern: /^[0-9]{10}$/, 
      message: "Phone number must be exactly 10 digits!" 
    }
  ]

  const handleModalOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingTrainee) {
          // Edit existing trainee
          const updatedData = {
            name: values.name,
            designation: values.designation,
            division: values.division,
            mobile: values.mobile,
            roomNumber: values.roomNumber ? Number.parseInt(values.roomNumber) : null,
            checkInDate: values.from,
            expectedCheckOutDate: values.to,
          }

          const traineeId = editingTrainee.traineeId || editingTrainee._id || editingTrainee.id;
          updateTrainee(traineeId, updatedData);
        } else {
          // Add new trainee
          const newTrainee = {
            name: values.name,
            designation: values.designation,
            division: values.division,
            mobile: values.mobile,
            checkInDate: new Date(),
            expectedCheckOutDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            status: "staying",
            roomNumber: values.roomNumber ? Number.parseInt(values.roomNumber) : null,
          }

          // Add to the appropriate block based on room number
          let targetBlock = "A"
          if (values.roomNumber >= 44 && values.roomNumber <= 86) targetBlock = "B"
          else if (values.roomNumber >= 87 && values.roomNumber <= 114) targetBlock = "C"

          allocateRoom(newTrainee, values.roomNumber, targetBlock);
        }

        setIsModalVisible(false)
        form.resetFields()
        setEditingTrainee(null)
      })
      .catch((info) => {
        console.log("Validate Failed:", info)
      })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setEditingTrainee(null)
    form.resetFields()
  }

  const handleViewTrainee = (record) => {
    Modal.info({
      title: `Trainee Details - ${record.name}`,
      content: (
        <div style={{ padding: "16px 0" }}>
          <p style={{ marginBottom: "8px" }}>
            <strong>ID:</strong> {record.traineeId || record.id}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Name:</strong> {record.name}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Designation:</strong> {record.designation}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Division:</strong> {record.division}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Mobile:</strong> {record.mobile}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Room Number:</strong> {record.roomNumber || "N/A"}
          </p>
          {record.bedNumber && (
            <p style={{ marginBottom: "8px" }}>
              <strong>Bed Number:</strong> {record.bedNumber}
            </p>
          )}
          <p style={{ marginBottom: "8px" }}>
            <strong>Check In:</strong> {record.checkInDate ? new Date(record.checkInDate).toLocaleDateString() : record.from}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Expected Check Out:</strong> {record.expectedCheckOutDate ? new Date(record.expectedCheckOutDate).toLocaleDateString() : record.to}
          </p>
          <p style={{ marginBottom: "8px" }}>
            <strong>Status:</strong> {record.status}
          </p>
          {record.checkOutDate && (
            <p style={{ marginBottom: "8px" }}>
              <strong>Check Out Date:</strong> {new Date(record.checkOutDate).toLocaleDateString()}
            </p>
          )}
          {record.trainingUnder && (
            <p style={{ marginBottom: "8px" }}>
              <strong>Training Under:</strong> {record.trainingUnder}
            </p>
          )}
          {record.emergencyContact && (
            <div>
              <p style={{ marginBottom: "8px", marginTop: "16px" }}>
                <strong>Emergency Contact:</strong>
              </p>
              <p style={{ marginBottom: "4px", marginLeft: "16px" }}>
                <strong>Name:</strong> {record.emergencyContact.name}
              </p>
              <p style={{ marginBottom: "4px", marginLeft: "16px" }}>
                <strong>Contact:</strong> {record.emergencyContact.contact}
              </p>
              <p style={{ marginBottom: "4px", marginLeft: "16px" }}>
                <strong>Relation:</strong> {record.emergencyContact.relation}
              </p>
              <p style={{ marginBottom: "4px", marginLeft: "16px" }}>
                <strong>Place:</strong> {record.emergencyContact.place}
              </p>
            </div>
          )}
          {record.amenities && Object.keys(record.amenities).length > 0 && (
            <div>
              <p style={{ marginBottom: "8px", marginTop: "16px" }}>
                <strong>Allocated Amenities:</strong>
              </p>
              {record.amenities.map((amenity, index) => (
                <p key={index} style={{ marginBottom: "4px", marginLeft: "16px" }}>
                  <strong>{amenity.name}:</strong> {amenity.quantity || 1}
                </p>
              ))}
            </div>
          )}
        </div>
      ),
      width: 500,
      okText: "Close",
      centered: true,
    })
  }

  const handleEditTrainee = (record) => {
    form.setFieldsValue({
      name: record.name,
      designation: record.designation,
      division: record.division,
      mobile: record.mobile,
      roomNumber: record.roomNumber,
      from: record.checkInDate ? new Date(record.checkInDate).toLocaleDateString('en-GB') : record.from,
      to: record.expectedCheckOutDate ? new Date(record.expectedCheckOutDate).toLocaleDateString('en-GB') : record.to,
    })
    setEditingTrainee(record)
    setIsModalVisible(true)
  }

  const handleCheckoutTrainee = (record) => {

    if (record.status !== "staying") {
      message.warning("Only staying trainees can be checked out");
      return;
    }

    Modal.confirm({
      title: "Checkout Trainee",
      content: (
        <div>
          <p>
            Are you sure you want to checkout <strong>{record.name}</strong>?
          </p>
          <p>This will free up Room {record.roomNumber} but keep the trainee record.</p>
        </div>
      ),
      okText: "Yes, Checkout",
      okType: "primary",
      cancelText: "Cancel",
      centered: true,
      onOk() {
        const traineeId = record.traineeId || record._id || record.id;

        checkoutTrainee(traineeId);
      },
    })
  }

  const columns = [
    {
      title: "NAME",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "DESIGNATION",
      dataIndex: "designation",
      key: "designation",
      filters: [
        { text: "SSE", value: "SSE" },
        { text: "JE", value: "JE" },
        { text: "Tech-I", value: "Tech-I" },
        { text: "Tech-II", value: "Tech-II" },
        { text: "AJE", value: "AJE" },
      ],
      onFilter: (value, record) => record.designation === value,
    },
    {
      title: "DIVISION",
      dataIndex: "division",
      key: "division",
      sorter: (a, b) => a.division.localeCompare(b.division),
    },
    {
      title: "FROM",
      dataIndex: "from",
      key: "from",
      sorter: (a, b) => new Date(a.from) - new Date(b.from),
      render: (_, record) => {
        if (record.checkInDate) {
          return new Date(record.checkInDate).toLocaleDateString('en-GB');
        }
        return record.from || 'N/A';
      }
    },
    {
      title: "TO",
      dataIndex: "to",
      key: "to",
      sorter: (a, b) => new Date(a.to) - new Date(b.to),
      render: (_, record) => {
        if (record.expectedCheckOutDate) {
          return new Date(record.expectedCheckOutDate).toLocaleDateString('en-GB');
        }
        return record.to || 'N/A';
      }
    },
    {
      title: "MOBILE NO.",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "ROOM",
      dataIndex: "roomNumber",
      key: "roomNumber",
      sorter: (a, b) => (a.roomNumber || 0) - (b.roomNumber || 0),
      render: (roomNumber) => roomNumber || "N/A",
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
              handleViewTrainee(record)
            }}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleEditTrainee(record)
            }}
          >
            Edit
          </Button>
          {record.status === "staying" && (
            <Button
              danger
              icon={<LogoutOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleCheckoutTrainee(record)
              }}
            >
              Checkout
            </Button>
          )}
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
            selectedKeys={["3"]}
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
              Trainees
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
            {/* Search and Add Section */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <Select value={selectedStatus} onChange={handleStatusChange} style={{ width: 150 }}>
                  <Option value="staying">Staying</Option>
                  <Option value="checked_out">Checked Out</Option>
                  <Option value="all">All</Option>
                </Select>
                <RangePicker
                  placeholder={["Start Date", "End Date"]}
                  format="DD-MM-YYYY"
                  onChange={(dates) => setDateRange(dates)}
                  style={{ width: 250 }}
                />
                <Input
                  placeholder="SEARCH"
                  prefix={<SearchOutlined />}
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTrainee}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                ADD TRAINEE
              </Button>
            </div>

            {/* Trainees Table */}
            <Table
              columns={columns}
              dataSource={trainees}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} trainees`,
              }}
              style={{
                background: isDarkMode ? "#1f1f1f" : "#ffffff",
              }}
            />

            {/* Add/Edit Trainee Modal */}
            <Modal
              title={editingTrainee ? "Edit Trainee" : "Add New Trainee"}
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              width={600}
            >
              <Form form={form} layout="vertical" name="add_trainee">
                <Form.Item name="name" label="Name" rules={nameValidation}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="designation"
                  label="Designation"
                  rules={[{ required: true, message: "Please select designation!" }]}
                >
                  <Select>
                    <Option value="SSE">SSE</Option>
                    <Option value="JE">JE</Option>
                    <Option value="Tech-I">Tech-I</Option>
                    <Option value="Tech-II">Tech-II</Option>
                    <Option value="AJE">AJE</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="division"
                  label="Division"
                  rules={[
                    { required: true, message: "Please input division!" },
                    { 
                      pattern: /^[a-zA-Z0-9\s/()-]+$/, 
                      message: "Division contains invalid characters!" 
                    }
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="mobile"
                  label="Mobile Number"
                  rules={phoneValidation}
                >
                  <Input maxLength={10} />
                </Form.Item>
                <Form.Item
                  name="roomNumber"
                  label="Room Number"
                  rules={[
                    {
                      required: !editingTrainee || editingTrainee.status === "staying",
                      message: "Please input room number!",
                    },
                  ]}
                >
                  <Input type="number" />
                </Form.Item>
                <Form.Item
                  name="from"
                  label="From Date"
                  rules={[{ required: true, message: "Please input from date!" }]}
                >
                  <Input placeholder="DD.MM.YYYY" />
                </Form.Item>
                <Form.Item name="to" label="To Date" rules={[{ required: true, message: "Please input to date!" }]}>
                  <Input placeholder="DD.MM.YYYY" />
                </Form.Item>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default Trainees